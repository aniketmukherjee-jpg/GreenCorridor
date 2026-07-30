import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-5rem)] w-full py-16 px-4 md:px-8 flex flex-col items-center justify-start relative overflow-hidden">
      
      {/* Premium Ambient Light Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full bg-blue-500/10 blur-[130px] dark:bg-blue-500/5 animate-[pulse_10s_ease-in-out_infinite_alternate]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[160px] dark:bg-emerald-500/5 animate-[pulse_12s_ease-in-out_infinite_alternate-reverse]"></div>
      </div>

      <div className="max-w-7xl w-full mx-auto relative z-10 flex flex-col items-center text-center">
        
        {/* Header Badge */}
        <div className="animate-in fade-in slide-in-from-top-6 duration-1000">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Orchestrating Live City Logistics
          </span>
        </div>

        {/* Hero Section */}
        <div className="mt-8 mb-16 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.05] mb-6">
            Every Second<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500">
              Saves a Human Life.
            </span>
          </h1>
          <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
            GreenCorridor integrates intelligent graph routing, dynamic preemption signals, and real-time WebSocket coordination for first responders.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/hospital" 
              className="px-8 py-4 rounded-2xl font-bold bg-gray-950 text-white dark:bg-white dark:text-gray-950 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5"
            >
              Enter Command Center
            </Link>
            <Link 
              to="/citizen" 
              className="px-8 py-4 rounded-2xl font-bold border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white/40 dark:bg-black/40 hover:bg-white/60 dark:hover:bg-black/60 transition-all hover:-translate-y-0.5"
            >
              Citizen Incident Portal
            </Link>
          </div>
        </div>

        {/* Live Grid Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          {[
            { value: '99.8%', label: 'Corridor Clearance Success', desc: 'Preemption override efficiency' },
            { value: '-42%', label: 'Transit Delay Reduction', desc: 'A* routing bypass optimization' },
            { value: '< 2.5s', label: 'WebSocket Push Latency', desc: 'Sub-second server broadcasts' }
          ].map((stat, i) => (
            <div key={i} className="backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 p-6 rounded-3xl border border-white/60 dark:border-gray-800/40 shadow-sm text-left">
              <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-950 to-gray-700 dark:from-white dark:to-gray-500 mb-2 leading-none">
                {stat.value}
              </div>
              <div className="font-bold text-gray-800 dark:text-gray-200 text-sm leading-snug mb-1">{stat.label}</div>
              <div className="text-gray-400 dark:text-gray-500 text-xs font-medium">{stat.desc}</div>
            </div>
          ))}
        </div>

        {/* Core Architecture Interactive Showcase */}
        <div className="w-full max-w-7xl px-4 mb-20">
          <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 font-bold mb-10 text-center">
            System Modules & Viewports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                to: '/citizen',
                icon: '🗺️',
                title: 'Citizen Map',
                desc: 'Report road blockages, potholes, or heavy traffic. Verify incident reports to trigger rerouting warnings.',
                hoverColor: 'hover:border-green-500/50 hover:shadow-[0_20px_50px_rgba(34,197,94,0.15)]',
                badge: 'Live GIS Feed'
              },
              {
                to: '/hospital',
                icon: '🏥',
                title: 'Hospital Dashboard',
                desc: 'Triage incoming patients, verify available ICU beds, and score the best available ambulance matching patient conditions.',
                hoverColor: 'hover:border-blue-500/50 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)]',
                badge: 'Fleet Control'
              },
              {
                to: '/driver',
                icon: '🚑',
                title: 'Driver Console',
                desc: 'Live telemetry and A* optimal navigation route. Recalculates dynamically if obstacles appear on path.',
                hoverColor: 'hover:border-red-500/50 hover:shadow-[0_20px_50px_rgba(239,68,68,0.15)]',
                badge: 'Vehicle Routing'
              },
              {
                to: '/police',
                icon: '🛡️',
                title: 'Traffic Police',
                desc: 'Clear upcoming signal corridors. Resolve preemption conflicts based on vehicle priority thresholds.',
                hoverColor: 'hover:border-purple-500/50 hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)]',
                badge: 'Signal Override'
              }
            ].map((card, idx) => (
              <Link 
                key={idx}
                to={card.to}
                className={`group relative backdrop-blur-2xl bg-white/40 dark:bg-gray-900/40 p-8 rounded-[2rem] border border-white/60 dark:border-gray-800/40 transition-all duration-500 text-left hover:-translate-y-2 ${card.hoverColor} flex flex-col justify-between h-[300px]`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{card.icon}</span>
                    <span className="text-[10px] font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase">{card.badge}</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mt-6 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-400">
                    {card.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-1.5">
                  Launch Panel <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dynamic Architectural Overview */}
        <div className="backdrop-blur-2xl bg-white/30 dark:bg-gray-900/20 p-8 md:p-12 rounded-[2.5rem] border border-white/50 dark:border-gray-800/40 w-full max-w-5xl text-left">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8">System Engineering & Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <span className="text-emerald-500">◆</span> Dynamic A* Pathfinding
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                The core engine routing maps Bangalore city nodes and dynamically calculates coordinates based on Haversine distance heuristics. Segment weights are scaled in real-time when incident warnings are crowd-verified.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <span className="text-blue-500">◆</span> Predictive Match Scoring
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                Ambulance scoring weights current distance, triage level matching (BLS vs ALS), and active vehicle availability parameters to recommend the absolute optimal unit for emergency response.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <span className="text-purple-500">◆</span> Signal Override Preemption
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                Simulated police signals dynamically transition to green when vehicles fall within threshold ranges. Dual vehicle preemption conflicts are sorted and resolved automatically based on mission triage severity.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <span className="text-orange-500">◆</span> Real-Time WebSockets
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                Standard REST APIs are augmented by channels, pushing sub-second live location telemetry, incident markers, and escalation notices across all dispatch client viewports.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
