import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { USE_MOCK_DATA, BACKEND_URL } from '../config';
import { mockMissions } from '../mock/missions';
import { useToast } from '../context/ToastContext';
import { useSimulation, NODES } from '../context/SimulationContext';
import { 
  Bot, 
  Plus, 
  BedDouble, 
  Ambulance, 
  FileText, 
  X, 
  Sparkles, 
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight
} from 'lucide-react';

const AICopilot = ({ missions }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'AI Dispatcher Copilot online. Monitoring incoming triage tags & city traffic network.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (missions.length > 0) {
      const latest = missions[missions.length - 1];
      setIsTyping(true);
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: `Active Mission Detected (Unit ${latest.id}). ETA is ${latest.eta} mins. Suggestion: Prepare ICU Bed 2 and alert Trauma Team Alpha.`
        }]);
        setIsTyping(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [missions.length]);

  return (
    <div className="fixed bottom-6 right-6 w-88 backdrop-blur-3xl bg-white/95 border border-cyan-500/30 dark:bg-slate-900/90 dark:border-cyan-500/40 glow-blue rounded-3xl shadow-2xl flex flex-col overflow-hidden z-[100] animate-in slide-in-from-bottom-8 transition-colors duration-300">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute"></span>
            <Bot className="w-4 h-4 text-cyan-500" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-widest flex items-center gap-1.5">
            <span>AI Copilot Intel</span>
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">v3.2 LOGIC</span>
      </div>
      <div className="p-4 h-64 overflow-y-auto space-y-3 custom-scrollbar flex flex-col justify-end">
        {messages.map((msg, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-bottom-2">
            <div className="p-3.5 rounded-2xl bg-cyan-50 text-slate-900 border border-cyan-200 dark:bg-slate-950/80 dark:border-cyan-500/30 dark:text-slate-200 text-xs font-semibold leading-relaxed shadow-sm flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-cyan-600 dark:text-cyan-400 text-[11px] font-mono flex items-center space-x-2 p-2 bg-slate-100 dark:bg-slate-950/40 rounded-xl">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>AI analyzing traffic nodes...</span>
          </div>
        )}
      </div>
    </div>
  );
};

const extendedMockAmbulances = [
  { id: "AMB-117", plate: "KA-05-CD-1178", status: "available", level: "BLS", driver: "S. Iyer", locationNode: "MG_ROAD" },
  { id: "AMB-088", plate: "KA-03-EF-0882", status: "available", level: "ALS", driver: "A. Rao", locationNode: "CANTONMENT" },
  { id: "AMB-204", plate: "KA-01-AB-2041", status: "on_mission", level: "ALS", driver: "R. Kumar", locationNode: "TRINITY" },
  { id: "AMB-309", plate: "KA-02-GH-3092", status: "available", level: "ALS", driver: "K. Reddy", locationNode: "HUDSON" },
  { id: "AMB-501", plate: "KA-04-LM-5012", status: "maintenance", level: "BLS", driver: "P. Patel", locationNode: "TOWN_HALL" }
];

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

const calculateAmbulanceScore = (amb, pickupNodeId, condition) => {
  let score = 100;
  const deductions = [];

  const ambPos = NODES[amb.locationNode || 'VICTORIA_HOSP'].pos;
  const pickupPos = NODES[pickupNodeId || 'TRINITY'].pos;
  const dist = haversineDistance(ambPos, pickupPos);
  const distPenalty = Math.min(50, Math.round(dist * 5));
  score -= distPenalty;
  if (distPenalty > 0) {
    deductions.push(`Distance: -${distPenalty} (${dist.toFixed(1)}km)`);
  }

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

  if (amb.status === 'available') {
    // no penalty
  } else if (amb.status === 'on_mission' || amb.status === 'dispatched') {
    score -= 40;
    deductions.push('Status: -40 (Currently Active)');
  } else { 
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
  const { success } = useToast();
  const { activeMissions, startMission } = useSimulation();

  const [pickupNode, setPickupNode] = useState('TRINITY');
  const [patientCondition, setPatientCondition] = useState('cardiac');
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState('');

  const rankedAmbulances = ambulances.map(amb => {
    const evalResult = calculateAmbulanceScore(amb, pickupNode, patientCondition);
    return { ...amb, ...evalResult };
  }).sort((a, b) => b.score - a.score);

  useEffect(() => {
    if (rankedAmbulances.length > 0) {
      setSelectedAmbulanceId(rankedAmbulances[0].id);
    }
  }, [pickupNode, patientCondition]);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setMissions(mockMissions);
    } else {
      axios.get(`${BACKEND_URL}/api/missions/`)
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
    
    setAmbulances(prev => prev.map(a => 
      a.id === selectedAmbulanceId ? { ...a, status: 'on_mission' } : a
    ));

    const routeId = pickupNode === 'CANTONMENT' ? 'route2' : 'route1';
    startMission(newMission.id, routeId, newMission.priority === 'CRITICAL' ? '#ef4444' : '#0891b2');

    setMissions([newMission, ...missions]);
    setIsModalOpen(false);
    success(`Emergency unit ${selectedAmb ? selectedAmb.id : ''} dispatched via A* optimal route.`);
  };

  const activeCount = missions.filter(m => m.status === 'IN_PROGRESS' || m.status === 'PENDING').length;
  const availableAmbs = ambulances.filter(a => a.status === 'available').length;

  return (
    <div className="w-full p-4 md:p-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Command Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>Hospital Dispatch</span>
              <span className="text-xs font-mono bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30 px-3 py-1 rounded-full uppercase tracking-widest">
                Fleet Hub
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-semibold text-sm mt-1">Manage emergency vehicle allocation and ICU capacity</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 transition-all shadow-[0_0_25px_rgba(8,145,178,0.3)] hover:scale-105 active:scale-95 flex items-center space-x-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <Plus className="w-4 h-4" />
            <span>DISPATCH EMERGENCY MISSION</span>
          </button>
        </div>

        {/* Live KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Active Dispatches', val: activeCount, color: 'text-cyan-600 dark:text-cyan-400', glow: 'glow-blue border-cyan-500/30' },
            { label: 'Available Fleet Units', val: availableAmbs, color: 'text-emerald-600 dark:text-emerald-400', glow: 'glow-emerald border-emerald-500/30' },
            { label: 'Avg Response Time', val: '11m 30s', color: 'text-purple-600 dark:text-purple-400', glow: 'glow-purple border-purple-500/30' }
          ].map((kpi, idx) => (
            <div key={idx} className={`backdrop-blur-2xl bg-white/80 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-left card-3d ${kpi.glow}`}>
              <h3 className="text-slate-500 dark:text-slate-400 text-xs font-extrabold uppercase tracking-widest mb-2">{kpi.label}</h3>
              <p className={`text-5xl font-black ${kpi.color} tracking-tight`}>{kpi.val}</p>
            </div>
          ))}
        </div>

        {/* Resource Grid Wireframe */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Bed Availability Wireframe */}
          <div className="backdrop-blur-3xl bg-white/80 border border-slate-200 shadow-lg dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-2xl rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-cyan-500" />
                <span>ICU & Emergency Beds</span>
              </h2>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">LIVE OCCUPANCY</span>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { type: 'ICU (Trauma)', total: 12, occupied: 10, color: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]' },
                { type: 'Emergency', total: 24, occupied: 18, color: 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]' },
                { type: 'General', total: 100, occupied: 65, color: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' },
                { type: 'Surgery', total: 8, occupied: 2, color: 'bg-cyan-500 shadow-[0_0_12px_rgba(8,145,178,0.8)]' }
              ].map(bed => (
                <div key={bed.type} className="bg-slate-100/80 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all card-3d">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{bed.type}</span>
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">{bed.occupied}/{bed.total}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${bed.color} transition-all duration-1000`}
                      style={{ width: `${(bed.occupied / bed.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ambulance Fleet Status Wireframe */}
          <div className="backdrop-blur-3xl bg-white/80 border border-slate-200 shadow-lg dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-2xl rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Ambulance className="w-5 h-5 text-cyan-500" />
                <span>Fleet Telemetry</span>
              </h2>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">{ambulances.length} UNITS TRACKED</span>
            </div>
            
            <div className="p-6 space-y-3 max-h-[290px] overflow-y-auto custom-scrollbar">
              {ambulances.map(amb => (
                <div key={amb.id} className="flex items-center justify-between bg-slate-100/80 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800 flex items-center justify-center text-cyan-500">
                      <Ambulance className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white text-xs">{amb.id} ({amb.level})</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{amb.driver} • Node: {amb.locationNode}</div>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    amb.status === 'available' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 glow-emerald' :
                    amb.status === 'on_mission' ? 'bg-red-500/10 text-red-600 border border-red-500/30 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40 glow-red' :
                    'bg-slate-200 text-slate-600 border border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}>
                    {amb.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Missions Table Wireframe */}
        <div className="backdrop-blur-3xl bg-white/80 border border-slate-200 shadow-lg dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-500" />
              <span>Active & Recent Missions</span>
            </h2>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{missions.length} Total Logs</span>
          </div>
          
          <div className="p-0 overflow-x-auto">
            {missions.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No active missions</h3>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="p-5">Mission ID</th>
                    <th className="p-5">Priority</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Pickup Location</th>
                    <th className="p-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs font-semibold">
                  {missions.map(mission => (
                    <tr 
                      key={mission.id} 
                      onClick={() => setSelectedMission(mission)}
                      className="hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="p-5 font-mono text-slate-900 dark:text-slate-200 font-bold">#{mission.id}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider ${
                          mission.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-600 border border-red-500/30 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40' :
                          mission.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-600 border border-orange-500/30 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/40' :
                          'bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/40'
                        }`}>
                          {mission.priority}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider w-max ${
                          mission.status === 'COMPLETED' ? 'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' :
                          mission.status === 'IN_PROGRESS' ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/30 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/40' :
                          'bg-purple-500/10 text-purple-600 border border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/40'
                        }`}>
                          {mission.status === 'IN_PROGRESS' && <span className="w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-ping"></span>}
                          <span>{mission.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="p-5 text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{mission.pickup_location}</td>
                      <td className="p-5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedMission(mission); }}
                          className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal Wireframe */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 backdrop-blur-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 z-10 animate-in zoom-in-95 duration-200">
              <h2 className="text-2xl font-black mb-4 text-slate-900 dark:text-white">Dispatch New Mission</h2>
              
              <form onSubmit={handleNewMission} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Pickup Intersection (A* Node)</label>
                  <select 
                    required 
                    value={pickupNode}
                    onChange={(e) => setPickupNode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {Object.keys(NODES).filter(n => n !== 'VICTORIA_HOSP').map(nodeId => (
                      <option key={nodeId} value={nodeId}>{NODES[nodeId].name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Patient Condition (Triage Tag)</label>
                  <select 
                    required 
                    value={patientCondition}
                    onChange={(e) => setPatientCondition(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="cardiac">Cardiac Arrest (Critical - Requires ALS)</option>
                    <option value="trauma">Severe Trauma/Accident (Critical - Requires ALS)</option>
                    <option value="fracture">Bone Fracture (Medium - BLS Preferred)</option>
                    <option value="minor">Minor Lacerations (Low - BLS Preferred)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Destination Hospital</label>
                  <input required name="hospital" type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" defaultValue="Victoria Hospital" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Priority Level</label>
                  <select name="priority" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500">
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Recommended Unit (Ranked by Score Engine)</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                    {rankedAmbulances.map(amb => {
                      const isSelected = selectedAmbulanceId === amb.id;
                      const isUnavailable = amb.status === 'maintenance';
                      return (
                        <div 
                          key={amb.id} 
                          onClick={() => { if (!isUnavailable) setSelectedAmbulanceId(amb.id); }}
                          className={`p-3 rounded-xl border transition-all flex flex-col ${
                            isUnavailable ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-900' :
                            isSelected 
                              ? 'bg-cyan-50 border-cyan-500 dark:bg-cyan-500/20 dark:border-cyan-500 shadow-md cursor-pointer' 
                              : 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 hover:border-slate-400 cursor-pointer'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-slate-900 dark:text-white text-xs">{amb.id}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">({amb.driver})</span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{amb.level}</span>
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              amb.score >= 80 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400' :
                              amb.score >= 50 ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 dark:bg-yellow-500/20 dark:text-yellow-400' :
                              'bg-red-500/10 text-red-600 border border-red-500/30 dark:bg-red-500/20 dark:text-red-400'
                            }`}>
                              Score: {amb.score}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 flex flex-wrap gap-x-2">
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
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">Cancel</button>
                  <button type="submit" disabled={!selectedAmbulanceId} className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg disabled:opacity-50 cursor-pointer">CONFIRM DISPATCH</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Details Drawer Wireframe */}
        {selectedMission && (
          <div className="fixed inset-0 z-[9999] flex justify-end">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setSelectedMission(null)}></div>
            <div className="relative w-full max-w-sm h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col z-10 animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Mission #{selectedMission.id}</h2>
                <button onClick={() => setSelectedMission(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold p-1 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="space-y-6 flex-1 text-xs font-semibold">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">Status</h4>
                  <div className="text-slate-900 dark:text-white font-bold">{selectedMission.status}</div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">Route Specs</h4>
                  <div className="text-slate-800 dark:text-slate-200 mb-1"><span className="text-slate-400">Pickup:</span> {selectedMission.pickup_location}</div>
                  <div className="text-slate-800 dark:text-slate-200"><span className="text-slate-400">Destination:</span> {selectedMission.destination_hospital}</div>
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
