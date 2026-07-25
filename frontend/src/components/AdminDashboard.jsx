import React, { useState } from 'react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie
} from 'recharts';
import { useSimulation } from '../context/SimulationContext';
import { useToast } from '../context/ToastContext';

// Comprehensive mock data representing the database state
const mockIncidents = [
  { id: 'INC-1024', category: 'Accident', location: 'Trinity Circle', severity: 'HIGH', status: 'VERIFIED', reports: 5, time: '10 mins ago' },
  { id: 'INC-1025', category: 'Waterlogging', location: 'MG Road Junction', severity: 'MED', status: 'IN_PROGRESS', reports: 12, time: '25 mins ago' },
  { id: 'INC-1026', category: 'Pothole', location: 'Hudson Circle', severity: 'LOW', status: 'REPORTED', reports: 3, time: '1 hour ago' },
  { id: 'INC-1027', category: 'Road Closure', location: 'Town Hall', severity: 'HIGH', status: 'RESOLVED', reports: 8, time: '2 hours ago' },
  { id: 'INC-1028', category: 'Heavy Traffic', location: 'Corporation Circle', severity: 'MED', status: 'VERIFIED', reports: 15, time: '3 hours ago' },
];

const mockAmbulances = [
  { plate: 'KA-03-EM-8821', driver: 'Rahul Sharma', hospital: 'Victoria Hospital', status: 'ON_MISSION', level: 'ALS (Advanced)' },
  { plate: 'KA-01-MJ-9902', driver: 'John Doe', hospital: 'Victoria Hospital', status: 'AVAILABLE', level: 'BLS (Basic)' },
  { plate: 'KA-02-HH-4512', driver: 'Sarah Connor', hospital: 'Bowring Hospital', status: 'AVAILABLE', level: 'ALS (Advanced)' },
  { plate: 'KA-04-EM-1102', driver: 'Amit Patel', hospital: 'Victoria Hospital', status: 'MAINTENANCE', level: 'BLS (Basic)' },
  { plate: 'KA-05-CC-3321', driver: 'David Miller', hospital: 'St. Johns Hospital', status: 'ON_MISSION', level: 'ALS (Advanced)' },
];

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const AdminDashboard = () => {
  const { activeMissions, events } = useSimulation();
  const { success, error } = useToast();
  const [incidents, setIncidents] = useState(mockIncidents);
  const [fleet, setFleet] = useState(mockAmbulances);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_auth_user'));
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authKey, setAuthKey] = useState('');

  // Handle signup
  const handleSignUp = (e) => {
    e.preventDefault();
    if (authKey !== 'ADMIN2026') {
      error('Invalid Admin Authorization Secret Key.');
      return;
    }
    if (authPass.length < 6) {
      error('Password must be at least 6 characters.');
      return;
    }
    
    // Store in localStorage
    localStorage.setItem('admin_auth_user', JSON.stringify({ email: authEmail }));
    setIsAuthenticated(true);
    success('Admin profile created. Access granted.');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth_user');
    setIsAuthenticated(false);
    success('Logged out from admin console.');
  };

  // Statistics calculation
  const totalIncidents = incidents.length;
  const activeMissionsCount = activeMissions.length;
  const availableAmbulances = fleet.filter(a => a.status === 'AVAILABLE').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'HIGH').length;

  const incidentChartData = [
    { name: 'Accidents', value: incidents.filter(i => i.category === 'Accident').length + 4 },
    { name: 'Flooding', value: incidents.filter(i => i.category === 'Waterlogging').length + 2 },
    { name: 'Traffic', value: incidents.filter(i => i.category === 'Heavy Traffic').length + 7 },
    { name: 'Closures', value: incidents.filter(i => i.category === 'Road Closure').length + 1 },
    { name: 'Hazards', value: incidents.filter(i => i.category === 'Pothole').length + 3 },
  ];

  const handleUpdateIncidentStatus = (id, newStatus) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: newStatus } : inc));
  };

  const handleUpdateAmbulanceStatus = (plate, newStatus) => {
    setFleet(prev => prev.map(amb => amb.plate === plate ? { ...amb, status: newStatus } : amb));
  };

  // If not authenticated, render the high-fidelity glassmorphic registration panel
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className="backdrop-blur-3xl bg-white/10 dark:bg-black/40 border border-white/20 dark:border-gray-800/40 rounded-3xl p-8 max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col items-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-blue-500/10 dark:bg-blue-400/10 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner border border-white/20">🔑</div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Create Admin Profile</h2>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center mb-8">
            Database access is restricted. Create an authorized admin user below.
          </p>
          
          <form onSubmit={handleSignUp} className="w-full space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-1.5">Admin Email</label>
              <input 
                required
                type="email" 
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-blue-500 text-gray-900 dark:text-white text-sm"
                placeholder="admin@greencorridor.org"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-1.5">Create Password</label>
              <input 
                required
                type="password" 
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-blue-500 text-gray-900 dark:text-white text-sm"
                placeholder="Minimum 6 characters"
                value={authPass}
                onChange={(e) => setAuthPass(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-1.5">Authorization Key</label>
              <input 
                required
                type="password" 
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-blue-500 text-gray-900 dark:text-white text-sm"
                placeholder="Enter ADMIN2026 to verify"
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl mt-6 shadow-lg transition-colors text-sm tracking-wide"
            >
              Sign Up & Open Database
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard UI (Visible only after sign up)
  return (
    <div className="w-full p-4 md:p-8 min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center">
              <span className="mr-3">🔑</span> Database Administrator Console
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">
              Direct administrative database dashboard for system audit and overrides
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 shadow-sm font-bold text-sm">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse mr-2"></span>
              Database Live
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 font-bold transition-all text-sm shadow-sm"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Admin KPI Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Logged Incidents', value: totalIncidents, desc: 'Registered in reports app', color: 'text-blue-500' },
            { label: 'Active Corridors', value: activeMissionsCount, desc: 'Simulated corridors open', color: 'text-red-500' },
            { label: 'Available Fleet', value: `${availableAmbulances}/${fleet.length}`, desc: 'Ready for dispatch', color: 'text-green-500' },
            { label: 'Critical Hazards', value: criticalIncidents, desc: 'High priority reports', color: 'text-amber-500' },
          ].map((kpi, i) => (
            <div key={i} className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 dark:border-gray-700/50 hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{kpi.label}</h3>
              <p className={`text-4xl font-black ${kpi.color} mb-1`}>{kpi.value}</p>
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{kpi.desc}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Pie Chart of Incident Types */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-3xl border border-white/60 dark:border-gray-700/50 flex flex-col justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Incident Log Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incidentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {incidentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] font-bold text-gray-500 uppercase">
              {incidentChartData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }}></span>
                  <span className="truncate">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart of Fleet Status */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-3xl border border-white/60 dark:border-gray-700/50 lg:col-span-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Active System Event Density</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { label: '08:00', Events: 3 },
                  { label: '10:00', Events: 8 },
                  { label: '12:00', Events: 14 },
                  { label: '14:00', Events: 6 },
                  { label: '16:00', Events: 9 },
                  { label: '18:00', Events: 12 },
                  { label: '20:00', Events: 4 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="label" stroke="#6B7280" fontSize={10} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="Events" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Data Management Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Incident Reports Database table */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl border border-white/60 dark:border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center">
                <span className="mr-2">⚠️</span> Incident Reports Table
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/30">
                    <th className="p-4">Report ID</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Severity</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {incidents.map(inc => (
                    <tr key={inc.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="p-4 font-mono font-bold text-gray-500">{inc.id}</td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{inc.category}</td>
                      <td className="p-4 font-medium text-gray-600 dark:text-gray-400">{inc.location}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wide ${
                          inc.severity === 'HIGH' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                          inc.severity === 'MED' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                          'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                        }`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="p-4">
                        <select 
                          value={inc.status} 
                          onChange={(e) => handleUpdateIncidentStatus(inc.id, e.target.value)}
                          className="bg-transparent border border-gray-300 dark:border-gray-700 rounded px-1 py-0.5 text-xs font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="REPORTED">REPORTED</option>
                          <option value="VERIFIED">VERIFIED</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ambulances Database table */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl border border-white/60 dark:border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center">
                <span className="mr-2">🚑</span> Ambulance Fleet Table
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/30">
                    <th className="p-4">Plate Number</th>
                    <th className="p-4">Driver</th>
                    <th className="p-4">Hospital</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {fleet.map(amb => (
                    <tr key={amb.plate} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="p-4 font-mono font-bold text-gray-500">{amb.plate}</td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{amb.driver}</td>
                      <td className="p-4 font-medium text-gray-600 dark:text-gray-400">{amb.hospital}</td>
                      <td className="p-4">
                        <select 
                          value={amb.status} 
                          onChange={(e) => handleUpdateAmbulanceStatus(amb.plate, e.target.value)}
                          className="bg-transparent border border-gray-300 dark:border-gray-700 rounded px-1 py-0.5 text-xs font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="ON_MISSION">ON_MISSION</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Simulated Database Transactions Log */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-3xl border border-white/60 dark:border-gray-700/50">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Audit Trial Logs (Real-time Transactions)</h2>
          <div className="bg-black/5 dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[11px] leading-relaxed text-gray-600 dark:text-gray-400 space-y-1.5 custom-scrollbar">
            {events.length === 0 ? (
              <div className="text-center py-12 text-gray-400 italic">No transactions recorded. Run simulation or dispatch a mission.</div>
            ) : (
              events.map((evt, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-red-500 dark:text-red-400">[{new Date(evt.time).toLocaleTimeString()}]</span>
                  <span className="text-blue-500 dark:text-blue-400 font-bold">{evt.title.toUpperCase()}</span>
                  <span>-</span>
                  <span className="text-gray-800 dark:text-gray-300">{evt.description}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
