import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { USE_MOCK_DATA } from '../config';
import { mockMissions } from '../mock/missions';
import { useToast } from '../context/ToastContext';
import { useSimulation, NODES } from '../context/SimulationContext';

const AICopilot = ({ missions }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'AI Dispatcher Copilot online. Monitoring incoming incidents and traffic grid.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (missions.length > 0) {
      const latest = missions[missions.length - 1];
      setIsTyping(true);
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: `🚨 Active Mission Detected (Unit ${latest.id}). ETA is ${latest.eta} mins. Suggestion: Prepare ICU Bed 2 and alert Trauma Team Alpha.`
        }]);
        setIsTyping(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [missions.length]);

  return (
    <div className="fixed bottom-6 right-6 w-80 backdrop-blur-xl bg-white/80 dark:bg-gray-900/90 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.2)] border border-white/60 dark:border-gray-700/50 flex flex-col overflow-hidden z-[100] animate-in slide-in-from-bottom-8">
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between bg-blue-500/10">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm tracking-wide">AI Copilot</h3>
        </div>
      </div>
      <div className="p-4 h-64 overflow-y-auto space-y-3 custom-scrollbar flex flex-col justify-end">
        {messages.map((msg, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-bottom-2">
            <div className="inline-block p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 text-sm font-medium text-gray-800 dark:text-gray-200 shadow-sm">
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-gray-400 text-xs flex items-center space-x-1 animate-pulse p-2">
            <span>AI is analyzing grid</span>
            <span className="flex space-x-0.5"><span className="animate-bounce">.</span><span className="animate-bounce delay-75">.</span><span className="animate-bounce delay-150">.</span></span>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple list of ambulances with base mock locations for dispatch scoring
const extendedMockAmbulances = [
  { id: "AMB-117", plate: "KA-05-CD-1178", status: "available", level: "BLS", driver: "S. Iyer", locationNode: "MG_ROAD" },
  { id: "AMB-088", plate: "KA-03-EF-0882", status: "available", level: "ALS", driver: "A. Rao", locationNode: "CANTONMENT" },
  { id: "AMB-204", plate: "KA-01-AB-2041", status: "on_mission", level: "ALS", driver: "R. Kumar", locationNode: "TRINITY" },
  { id: "AMB-309", plate: "KA-02-GH-3092", status: "available", level: "ALS", driver: "K. Reddy", locationNode: "HUDSON" },
  { id: "AMB-501", plate: "KA-04-LM-5012", status: "maintenance", level: "BLS", driver: "P. Patel", locationNode: "TOWN_HALL" }
];

// Haversine Distance helper
const haversineDistance = (p1, p2) => {
  const R = 6371; 
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLng = (p2[1] - p1[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Ambulance Scoring Engine
const calculateAmbulanceScore = (amb, pickupNodeId, condition) => {
  let score = 100;
  const deductions = [];

  // 1. Distance Penalty (-5 per km, max -50)
  const ambPos = NODES[amb.locationNode || 'VICTORIA_HOSP'].pos;
  const pickupPos = NODES[pickupNodeId || 'TRINITY'].pos;
  const dist = haversineDistance(ambPos, pickupPos);
  const distPenalty = Math.min(50, Math.round(dist * 5));
  score -= distPenalty;
  if (distPenalty > 0) {
    deductions.push(`Distance: -${distPenalty} (${dist.toFixed(1)}km)`);
  }

  // 2. Equipment Penalty
  const isCritical = ['cardiac', 'heart', 'stroke', 'unconscious', 'trauma', 'bleeding', 'severe'].some(kw => 
    condition.toLowerCase().includes(kw)
  );
  const isALS = amb.level === 'ALS';

  if (isCritical && !isALS) {
    score -= 25;
    deductions.push('Equip: -25 (BLS assigned to critical condition)');
  } else if (!isCritical && isALS) {
    score -= 5;
    deductions.push('Equip: -5 (ALS overqualified for minor condition)');
  } else {
    deductions.push('Equip: Match');
  }

  // 3. Status Penalty
  if (amb.status === 'available') {
    // no penalty
  } else if (amb.status === 'on_mission' || amb.status === 'dispatched') {
    score -= 40;
    deductions.push('Status: -40 (Currently Active)');
  } else { // maintenance
    score -= 90;
    deductions.push('Status: -90 (In Maintenance)');
  }

  return {
    score: Math.max(0, score),
    deductions,
    distance: dist
  };
};

const HospitalDashboard = () => {
  const [missions, setMissions] = useState([]);
  const [ambulances, setAmbulances] = useState(extendedMockAmbulances);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const { success, error } = useToast();
  const { activeMissions, startMission } = useSimulation();

  // Form States for Score Ranker
  const [pickupNode, setPickupNode] = useState('TRINITY');
  const [patientCondition, setPatientCondition] = useState('cardiac');
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState('');

  // Dynamically compute scores based on form changes
  const rankedAmbulances = ambulances.map(amb => {
    const evalResult = calculateAmbulanceScore(amb, pickupNode, patientCondition);
    return { ...amb, ...evalResult };
  }).sort((a, b) => b.score - a.score);

  // Set default selected ambulance on modal open or node change
  useEffect(() => {
    if (rankedAmbulances.length > 0) {
      setSelectedAmbulanceId(rankedAmbulances[0].id);
    }
  }, [pickupNode, patientCondition]);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setMissions(mockMissions);
    } else {
      axios.get('http://127.0.0.1:8000/api/missions/')
        .then(response => setMissions(response.data))
        .catch(err => console.error(err));
    }
  }, []);

  const handleNewMission = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const selectedAmb = ambulances.find(a => a.id === selectedAmbulanceId);
    
    const newMission = {
      id: `m${Math.floor(Math.random() * 1000)}`,
      priority: formData.get('priority'),
      status: 'PENDING',
      pickup_location: NODES[pickupNode].name,
      destination_hospital: formData.get('hospital'),
      ambulance_id: selectedAmbulanceId || 'Unassigned',
      patient_condition_tag: patientCondition,
      eta_minutes: null,
      created_at: new Date().toISOString()
    };
    
    // Update local ambulance status to dispatched
    setAmbulances(prev => prev.map(a => 
      a.id === selectedAmbulanceId ? { ...a, status: 'on_mission' } : a
    ));

    // Call startMission in global context
    const routeId = pickupNode === 'CANTONMENT' ? 'route2' : 'route1';
    startMission(newMission.id, routeId, newMission.priority === 'CRITICAL' ? '#ef4444' : '#3b82f6');

    setMissions([newMission, ...missions]);
    setIsModalOpen(false);
    success(`New emergency mission dispatched to ${selectedAmb ? selectedAmb.driver : 'Ambulance'}.`);
  };

  const activeCount = missions.filter(m => m.status === 'IN_PROGRESS' || m.status === 'PENDING').length;
  const availableAmbs = ambulances.filter(a => a.status === 'available').length;
  const completedMissions = missions.filter(m => m.status === 'COMPLETED');
  const avgTime = completedMissions.length > 0 ? "11m 30s" : "--"; // Simplified mock logic

  return (
    <div className="w-full p-4 md:p-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Hospital Dispatch</h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">Manage emergency missions and ambulances</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="backdrop-blur-md bg-blue-500/90 border border-t-blue-400 border-b-blue-700 shadow-[0_8px_32px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(59,130,246,0.5)] active:translate-y-0 active:shadow-none transition-all text-white px-5 py-2.5 rounded-xl font-bold"
          >
            + New Emergency Mission
          </button>
        </div>

        {/* Live Computed KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 dark:border-gray-700/50 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Active Missions</h3>
            <p className="text-5xl font-black text-blue-600 dark:text-blue-400 drop-shadow-sm">{activeCount}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 dark:border-gray-700/50 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Available Ambulances</h3>
            <p className="text-5xl font-black text-green-600 dark:text-green-400 drop-shadow-sm">{availableAmbs}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 dark:border-gray-700/50 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Avg Response Time</h3>
            <p className="text-5xl font-black text-purple-600 dark:text-purple-400 drop-shadow-sm">{avgTime}</p>
          </div>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bed Availability */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 dark:border-gray-700/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <span className="mr-2">🛏️</span> Bed Availability
              </h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { type: 'ICU (Trauma)', total: 12, occupied: 10, color: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' },
                { type: 'Emergency', total: 24, occupied: 18, color: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' },
                { type: 'General', total: 100, occupied: 65, color: 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' },
                { type: 'Surgery', total: 8, occupied: 2, color: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' }
              ].map(bed => (
                <div key={bed.type} className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-800 dark:text-white text-sm">{bed.type}</span>
                    <span className="text-xs font-black text-gray-500">{bed.occupied}/{bed.total}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${bed.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${(bed.occupied / bed.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ambulance Fleet Status */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 dark:border-gray-700/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 delay-100">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <span className="mr-2">🚑</span> Fleet Status
              </h2>
            </div>
            <div className="p-6 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              {ambulances.map(amb => (
                <div key={amb.id} className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:-translate-x-1 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg shadow-inner">
                      🚑
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 dark:text-white text-sm">{amb.id}</div>
                      <div className="text-xs text-gray-500">{amb.driver}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    amb.status === 'available' ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50' :
                    amb.status === 'dispatched' ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50' :
                    'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50'
                  }`}>
                    {amb.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Missions Table */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 dark:border-gray-700/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Recent Missions</h2>
          </div>
          <div className="p-0 overflow-x-auto">
            {missions.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-6xl mb-4 opacity-50">📝</div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">No active missions</h3>
                <p className="text-gray-500">Create a new emergency mission to get started.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50">
                  <tr>
                    <th className="p-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">ID</th>
                    <th className="p-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Priority</th>
                    <th className="p-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="p-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Pickup</th>
                    <th className="p-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {missions.map(mission => (
                    <tr 
                      key={mission.id} 
                      onClick={() => setSelectedMission(mission)}
                      className="hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer animate-in fade-in slide-in-from-left-4"
                    >
                      <td className="p-5 font-mono text-sm font-bold text-gray-600 dark:text-gray-300">#{mission.id}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black shadow-sm tracking-wider ${
                          mission.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30' :
                          mission.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/30' :
                          'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {mission.priority}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-black shadow-sm tracking-wider w-max ${
                          mission.status === 'COMPLETED' ? 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20' :
                          mission.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30' :
                          'bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/30'
                        }`}>
                          {mission.status === 'IN_PROGRESS' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>}
                          <span>{mission.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="p-5 text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{mission.pickup_location}</td>
                      <td className="p-5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedMission(mission); }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-bold transition-colors focus-visible:ring-2 ring-emerald-400 rounded px-2"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* New Mission Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-6 animate-in zoom-in-95 duration-200">
              <h2 className="text-2xl font-black mb-4 text-gray-900 dark:text-white">New Dispatch</h2>
              <form onSubmit={handleNewMission} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Pickup Intersection (A* Node)</label>
                  <select 
                    required 
                    value={pickupNode}
                    onChange={(e) => setPickupNode(e.target.value)}
                    className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 outline-none focus:ring-2 ring-blue-500 text-gray-900 dark:text-white"
                  >
                    {Object.keys(NODES).filter(n => n !== 'VICTORIA_HOSP').map(nodeId => (
                      <option key={nodeId} value={nodeId}>{NODES[nodeId].name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Patient Condition (Triage Tag)</label>
                  <select 
                    required 
                    value={patientCondition}
                    onChange={(e) => setPatientCondition(e.target.value)}
                    className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 outline-none focus:ring-2 ring-blue-500 text-gray-900 dark:text-white"
                  >
                    <option value="cardiac">Cardiac Arrest (Critical - Requires ALS)</option>
                    <option value="trauma">Severe Trauma/Accident (Critical - Requires ALS)</option>
                    <option value="fracture">Bone Fracture (Medium - BLS Preferred)</option>
                    <option value="minor">Minor Lacerations (Low - BLS Preferred)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Destination Hospital</label>
                  <input required name="hospital" type="text" className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 outline-none focus:ring-2 ring-blue-500 text-gray-900 dark:text-white" defaultValue="Victoria Hospital" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select name="priority" className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 outline-none focus:ring-2 ring-blue-500 text-gray-900 dark:text-white">
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Recommended Ambulance (Ranked by Score)</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                    {rankedAmbulances.map(amb => {
                      const isSelected = selectedAmbulanceId === amb.id;
                      const isUnavailable = amb.status === 'maintenance';
                      return (
                        <div 
                          key={amb.id} 
                          onClick={() => {
                            if (!isUnavailable) setSelectedAmbulanceId(amb.id);
                          }}
                          className={`p-3 rounded-xl border transition-all flex flex-col ${
                            isUnavailable ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800/20 border-gray-200 dark:border-gray-800' :
                            isSelected 
                              ? 'bg-blue-500/10 border-blue-500 shadow-md ring-2 ring-blue-500/50 cursor-pointer' 
                              : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-blue-400 cursor-pointer'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-900 dark:text-white text-sm">{amb.id}</span>
                              <span className="text-xs text-gray-500">({amb.driver})</span>
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                amb.level === 'ALS' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>{amb.level}</span>
                            </div>
                            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                              amb.score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              amb.score >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              Score: {amb.score}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1 flex flex-wrap gap-x-2">
                            {amb.deductions.map((ded, idx) => (
                              <span key={idx} className="after:content-['|'] last:after:content-none after:ml-1">{ded}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                  <button type="submit" disabled={!selectedAmbulanceId} className="px-6 py-2 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Dispatch</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Details Drawer */}
        {selectedMission && (
          <div className="fixed inset-0 z-[9999] flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setSelectedMission(null)}></div>
            <div className="relative w-full max-w-sm h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl shadow-2xl border-l border-white/50 dark:border-gray-700/50 animate-in slide-in-from-right duration-300 flex flex-col">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Mission #{selectedMission.id}</h2>
                <button onClick={() => setSelectedMission(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-xl">&times;</button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Status</h4>
                  <div className="font-medium text-gray-900 dark:text-white">{selectedMission.status}</div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Route</h4>
                  <div className="font-medium text-gray-900 dark:text-white mb-2"><span className="opacity-50">From:</span> {selectedMission.pickup_location}</div>
                  <div className="font-medium text-gray-900 dark:text-white"><span className="opacity-50">To:</span> {selectedMission.destination_hospital}</div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl h-48 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <span className="opacity-50 font-bold">Live Map Tracking</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <AICopilot missions={activeMissions} />
    </div>
  );
};

export default HospitalDashboard;
