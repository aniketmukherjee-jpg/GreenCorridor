import React from 'react';
import { 
  LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  LineChart, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity, 
  Sparkles,
  Layers,
  Building2
} from 'lucide-react';

const responseData = [
  { time: '08:00', avgResponse: 12.5, target: 15 },
  { time: '10:00', avgResponse: 14.2, target: 15 },
  { time: '12:00', avgResponse: 18.1, target: 15 }, 
  { time: '14:00', avgResponse: 13.4, target: 15 },
  { time: '16:00', avgResponse: 11.2, target: 15 },
  { time: '18:00', avgResponse: 16.5, target: 15 },
  { time: '20:00', avgResponse: 9.8, target: 15 },
];

const incidentData = [
  { type: 'Accident', count: 45 },
  { type: 'Cardiac', count: 32 },
  { type: 'Trauma', count: 28 },
  { type: 'Fire', count: 15 },
  { type: 'Other', count: 12 },
];

const responseByZone = [
  { zone: 'Central Zone', avgResponse: 11.2, target: 15 },
  { zone: 'South Zone', avgResponse: 13.8, target: 15 },
  { zone: 'East Zone', avgResponse: 17.5, target: 15 }, 
  { zone: 'West Zone', avgResponse: 14.1, target: 15 },
  { zone: 'North Zone', avgResponse: 12.9, target: 15 },
];

const hospitalLoadBalancing = [
  { name: 'Victoria Hospital', occupied: 82, total: 100 },
  { name: 'Bowring Hospital', occupied: 45, total: 60 },
  { name: 'St. Johns Hospital', occupied: 70, total: 80 },
  { name: 'Narayana Health', occupied: 95, total: 120 },
];

const Analytics = () => {
  return (
    <div className="w-full p-4 md:p-8 relative min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Wireframe */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <LineChart className="w-8 h-8 text-cyan-500" />
              <span>Analytics & Intelligence</span>
              <span className="text-xs font-mono bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30 px-3 py-1 rounded-full uppercase tracking-widest">
                CYBER INTEL
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-semibold text-sm mt-1">Real-time operational metrics and historical response trends</p>
          </div>
        </div>

        {/* Top KPIs Wireframe */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Avg Clear Time', value: '4m 12s', trend: '-12%', positive: true, glow: 'glow-emerald border-emerald-500/30' },
            { label: 'Total Incidents (24h)', value: '142', trend: '+5%', positive: false, glow: 'glow-blue border-cyan-500/30' },
            { label: 'Green Corridors', value: '38', trend: '+22%', positive: true, glow: 'glow-purple border-purple-500/30' },
            { label: 'Lives Saved Est.', value: '24', trend: '+8%', positive: true, glow: 'glow-emerald border-emerald-500/30' }
          ].map((kpi, i) => (
            <div key={i} className={`backdrop-blur-3xl bg-white/80 border border-slate-200 shadow-lg dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-xl p-6 rounded-3xl card-3d ${kpi.glow} transition-colors duration-300`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">{kpi.label}</h3>
                <span className={`text-xs font-mono font-black ${kpi.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{kpi.trend}</span>
              </div>
              <p className="text-4xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Response Time Trend Wireframe */}
          <div className="backdrop-blur-3xl bg-white/80 border border-slate-200 shadow-lg dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-2xl p-6 rounded-3xl transition-colors duration-300">
            <h2 className="text-base font-black text-slate-900 dark:text-white mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span>Response Time Trends (Today)</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">A* OPTIMIZED</span>
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={responseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="m" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Line type="monotone" name="Avg Response Time" dataKey="avgResponse" stroke="#10b981" strokeWidth={4} dot={{ r: 5, fill: '#10b981' }} activeDot={{ r: 8 }} />
                  <Line type="dashed" name="Target Threshold (15m)" dataKey="target" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Incidents Breakdown Wireframe */}
          <div className="backdrop-blur-3xl bg-white/80 border border-slate-200 shadow-lg dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-2xl p-6 rounded-3xl transition-colors duration-300">
            <h2 className="text-base font-black text-slate-900 dark:text-white mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-500" />
                <span>Incident Breakdown by Category</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">24H FEED</span>
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={incidentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="type" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" name="Total Reports" fill="#0891b2" radius={[10, 10, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Response by Zone Wireframe */}
          <div className="backdrop-blur-3xl bg-white/80 border border-slate-200 shadow-lg dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-2xl p-6 rounded-3xl transition-colors duration-300">
            <h2 className="text-base font-black text-slate-900 dark:text-white mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                <span>Response Time by Police Zone</span>
              </span>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">GEOGRAPHIC INTEL</span>
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={responseByZone} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} unit="m" />
                  <YAxis dataKey="zone" type="category" stroke="#64748b" fontSize={11} tickLine={false} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="avgResponse" name="Avg Response Time" fill="#a855f7" radius={[0, 10, 10, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hospital Load Balancing Wireframe */}
          <div className="backdrop-blur-3xl bg-white/80 border border-slate-200 shadow-lg dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-2xl p-6 rounded-3xl transition-colors duration-300">
            <h2 className="text-base font-black text-slate-900 dark:text-white mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-500" />
                <span>Hospital ICU Load Balancing</span>
              </span>
              <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">CAPACITY METRICS</span>
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={hospitalLoadBalancing}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Bar dataKey="occupied" name="Occupied Beds" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="total" name="Total Capacity" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Analytics;
