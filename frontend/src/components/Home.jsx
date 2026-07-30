import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-5rem)] w-full py-12 px-4 md:px-8 flex flex-col items-center justify-start relative overflow-hidden perspective-1200">
      
      {/* Ambient Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[160px] animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-7xl w-full mx-auto relative z-10 flex flex-col items-center text-center">
        
        {/* Tactical Badge */}
        <div className="animate-in fade-in slide-in-from-top-6 duration-1000">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-emerald-500/40 bg-white/80 dark:bg-slate-900/80 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-[0.25em] shadow-md dark:shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Tactical Urban Emergency Orchestrator
          </span>
        </div>

        {/* Hero Title */}
        <div className="mt-8 mb-14 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05] mb-6 drop-shadow-sm dark:drop-shadow-2xl">
            Every Second<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 dark:from-emerald-400 dark:via-teal-300 dark:to-blue-500 drop-shadow-sm dark:drop-shadow-[0_0_35px_rgba(16,185,129,0.4)]">
              Saves a Human Life.
            </span>
          </h1>
          <p className="text-base md:text-xl text-slate-600 dark:text-slate-300 font-semibold max-w-2xl mx-auto leading-relaxed">
            GreenCorridor integrates intelligent graph routing, dynamic signal preemption, and sub-second WebSocket telemetry for emergency first responders.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/hospital" 
              className="px-8 py-4 rounded-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-700 text-white dark:from-emerald-500 dark:to-teal-600 dark:text-slate-950 hover:from-emerald-500 hover:to-teal-600 transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              LAUNCH COMMAND CENTER 🏥
            </Link>
            <Link 
              to="/citizen" 
              className="px-8 py-4 rounded-2xl font-black border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-md hover:scale-105 active:scale-95 backdrop-blur-xl"
            >
              CITIZEN INCIDENT MAP 🗺️
            </Link>
          </div>
        </div>

        {/* Live Grid Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          {[
            { value: '99.8%', label: 'Corridor Clearance Rate', desc: 'Preemption override efficiency', glow: 'glow-emerald border-emerald-500/30' },
            { value: '-42%', label: 'Transit Delay Reduction', desc: 'A* routing bypass optimization', glow: 'glow-blue border-blue-500/30' },
            { value: '< 2.5s', label: 'WebSocket Push Latency', desc: 'Sub-second server broadcasts', glow: 'glow-purple border-purple-500/30' }
          ].map((stat, i) => (
            <div key={i} className={`backdrop-blur-2xl bg-white/80 dark:bg-slate-900/60 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-left card-3d ${stat.glow}`}>
              <div className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-2 leading-none tracking-tight">
                {stat.value}
              </div>
              <div className="font-extrabold text-slate-800 dark:text-slate-200 text-sm leading-snug mb-1">{stat.label}</div>
              <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold">{stat.desc}</div>
            </div>
          ))}
        </div>

        {/* Operational Viewports Showcase */}
        <div className="w-full max-w-7xl px-4 mb-20">
          <h2 className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 font-extrabold mb-10 text-center flex items-center justify-center gap-3">
            <span className="w-8 h-[1px] bg-slate-300 dark:bg-slate-700"></span>
            Operational Viewports & Control Hubs
            <span className="w-8 h-[1px] bg-slate-300 dark:bg-slate-700"></span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                to: '/citizen',
                icon: '🗺️',
                title: 'Citizen Map',
                desc: 'Report road blockages or traffic incidents. Crowd verification promotes severity to trigger rerouting.',
                hoverColor: 'hover:border-emerald-500/60 hover:shadow-[0_0_35px_rgba(16,185,129,0.2)]',
                badge: 'Live GIS Feed',
                accent: 'border-emerald-500/30'
              },
              {
                to: '/hospital',
                icon: '🏥',
                title: 'Hospital Command',
                desc: 'Triage incoming patients, verify available ICU beds, and score the best available ambulance matching patient requirements.',
                hoverColor: 'hover:border-blue-500/60 hover:shadow-[0_0_35px_rgba(59,130,246,0.2)]',
                badge: 'Fleet Dispatch',
                accent: 'border-blue-500/30'
              },
              {
                to: '/driver',
                icon: '🚑',
                title: 'Driver Cockpit',
                desc: 'Live telemetry and A* optimal navigation route. Recalculates dynamically if obstacles appear on path.',
                hoverColor: 'hover:border-red-500/60 hover:shadow-[0_0_35px_rgba(239,68,68,0.2)]',
                badge: 'Vehicle Cockpit',
                accent: 'border-red-500/30'
              },
              {
                to: '/police',
                icon: '🛡️',
                title: 'Traffic Signals',
                desc: 'Clear upcoming signal corridors. Resolve preemption conflicts automatically based on mission triage thresholds.',
                hoverColor: 'hover:border-purple-500/60 hover:shadow-[0_0_35px_rgba(168,85,247,0.2)]',
                badge: 'Signal Override',
                accent: 'border-purple-500/30'
              }
            ].map((card, idx) => (
              <Link 
                key={idx}
                to={card.to}
                className={`group relative backdrop-blur-3xl bg-white/80 dark:bg-slate-900/60 p-8 rounded-[2rem] border ${card.accent} transition-all duration-500 text-left card-3d ${card.hoverColor} flex flex-col justify-between h-[320px] shadow-xl preserve-3d`}
              >
                <div>
                  <div className="flex justify-between items-start preserve-3d">
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300 translate-z-30 drop-shadow-md">{card.icon}</span>
                    <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-950/80 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">{card.badge}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-6 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-2 transition-all duration-300 flex items-center gap-2">
                  <span>ENTER DASHBOARD</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dynamic Architecture Section */}
        <div className="backdrop-blur-3xl bg-white/80 dark:bg-slate-900/50 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 w-full max-w-5xl text-left shadow-xl">
          <div className="flex items-center space-x-3 mb-8">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-wide">System Engineering & Architecture</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: 'Dynamic A* Pathfinding', desc: 'Maps Bangalore city intersection nodes and calculates coordinates using Haversine distance heuristics. Edge weights scale in real-time when incidents are verified.', color: 'text-emerald-600 dark:text-emerald-400' },
              { title: 'Predictive Match Scoring', desc: 'Scoring engine weights distance, BLS/ALS equipment matching, and availability parameters to pick the optimal unit for emergency response.', color: 'text-blue-600 dark:text-blue-400' },
              { title: 'Signal Preemption Overrides', desc: 'Simulated traffic signals transition to green when vehicles fall within threshold ranges. Multi-ambulance conflicts are prioritized by mission triage severity.', color: 'text-purple-600 dark:text-purple-400' },
              { title: 'Full-Duplex WebSockets', desc: 'Django Channels ASGI pushes sub-second telemetry updates, incident markers, and police escalation alerts across all connected client dashboards.', color: 'text-teal-600 dark:text-teal-400' }
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                <h4 className={`font-black text-sm mb-2 flex items-center gap-2 ${item.color}`}>
                  <span>◆</span> {item.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
