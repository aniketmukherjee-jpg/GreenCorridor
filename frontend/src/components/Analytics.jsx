import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const responseData = [
  { time: '08:00', avgResponse: 12.5, target: 15 },
  { time: '10:00', avgResponse: 14.2, target: 15 },
  { time: '12:00', avgResponse: 18.1, target: 15 }, // Peak traffic
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

const hospitalLoad = [
  { day: 'Mon', icu: 85, emergency: 60, general: 75 },
  { day: 'Tue', icu: 90, emergency: 65, general: 80 },
  { day: 'Wed', icu: 75, emergency: 50, general: 70 },
  { day: 'Thu', icu: 88, emergency: 80, general: 85 },
  { day: 'Fri', icu: 95, emergency: 90, general: 90 }, // Weekend spike
  { day: 'Sat', icu: 60, emergency: 40, general: 65 },
  { day: 'Sun', icu: 55, emergency: 35, general: 60 },
];

// Tier 2: Analytical Additions
const responseByZone = [
  { zone: 'Central Zone', avgResponse: 11.2, target: 15 },
  { zone: 'South Zone', avgResponse: 13.8, target: 15 },
  { zone: 'East Zone', avgResponse: 17.5, target: 15 }, // High congestion delay
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
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center">
            <span className="mr-3">📈</span> Analytics & Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">Live operational metrics and historical trends</p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Avg Clear Time', value: '4m 12s', trend: '-12%', positive: true },
            { label: 'Total Incidents (24h)', value: '142', trend: '+5%', positive: false },
            { label: 'Green Corridors', value: '38', trend: '+22%', positive: true },
            { label: 'Lives Saved Est.', value: '24', trend: '+8%', positive: true }
          ].map((kpi, i) => (
            <div key={i} className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-2xl border border-white/60 dark:border-gray-700/50 hover:shadow-lg transition-all animate-in zoom-in-95" style={{ animationDelay: `${i*50}ms` }}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">{kpi.label}</h3>
                <span className={`text-xs font-black ${kpi.positive ? 'text-green-500' : 'text-red-500'}`}>{kpi.trend}</span>
              </div>
              <p className="text-4xl font-black text-gray-900 dark:text-white">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Response Time Trend */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-3xl border border-white/60 dark:border-gray-700/50 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Response Time Trends (Today)</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="time" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} unit="m" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Line type="monotone" name="Avg Response Time" dataKey="avgResponse" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
                  <Line type="dashed" name="Target (15m)" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Incident Types */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-3xl border border-white/60 dark:border-gray-700/50 animate-in fade-in slide-in-from-bottom-4 delay-75">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Incident Distribution</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incidentData} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="type" type="category" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tier 2 Chart: Response Time by Zone */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-3xl border border-white/60 dark:border-gray-700/50 animate-in fade-in slide-in-from-bottom-4 delay-100">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Average Response Time by Zone</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={responseByZone}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="zone" stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} unit="m" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="avgResponse" name="Avg Response" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={24} />
                  <Line type="dashed" name="Target (15m)" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tier 2 Chart: Hospital Load Balancing */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-3xl border border-white/60 dark:border-gray-700/50 animate-in fade-in slide-in-from-bottom-4 delay-100">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Hospital Load Balancing</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hospitalLoadBalancing}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="occupied" name="Occupied Beds" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="total" name="Total Capacity" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hospital Load Area Chart */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-3xl border border-white/60 dark:border-gray-700/50 lg:col-span-2 animate-in fade-in slide-in-from-bottom-4 delay-150">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Hospital Network Load (7-Day Trend)</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hospitalLoad}>
                  <defs>
                    <linearGradient id="colorIcu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEmergency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                  <XAxis dataKey="day" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Legend />
                  <Area type="monotone" name="ICU Occupancy" dataKey="icu" stroke="#ef4444" fillOpacity={1} fill="url(#colorIcu)" strokeWidth={3} />
                  <Area type="monotone" name="Emergency Load" dataKey="emergency" stroke="#f59e0b" fillOpacity={1} fill="url(#colorEmergency)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
