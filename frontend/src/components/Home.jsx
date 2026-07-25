import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="flex flex-col items-center justify-center p-8 min-h-[calc(100vh-5rem)] relative overflow-hidden">
    {/* Animated Background Mesh */}
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[120px] animate-[pulse_8s_ease-in-out_infinite_alternate]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-green-500/20 blur-[150px] animate-[pulse_10s_ease-in-out_infinite_alternate-reverse]"></div>
    </div>

    <div className="text-center mb-16 mt-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tighter mb-6 drop-shadow-sm">
        Green<span className="text-green-500">Corridor</span>
      </h1>
      <p className="text-gray-600 dark:text-gray-300 uppercase tracking-[0.25em] font-bold text-sm md:text-lg drop-shadow-md bg-white/50 dark:bg-black/50 backdrop-blur-xl py-3 px-8 rounded-full inline-block border border-white/40 dark:border-gray-700/50 shadow-xl">
        Next-Gen Emergency Routing
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl px-4 relative z-10">
      <Link to="/citizen" className="relative backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 p-8 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/60 dark:border-gray-700/50 hover:border-green-400/80 hover:shadow-[0_20px_60px_rgba(34,197,94,0.3)] transition-all duration-500 group hover:-translate-y-3 overflow-hidden animate-in fade-in slide-in-from-bottom-12 delay-100 fill-mode-both">
        <div className="absolute top-0 right-0 p-8 text-5xl opacity-40 group-hover:opacity-100 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 ease-out">🗺️</div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mb-3 mt-6 pr-16">Citizen Map</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed relative z-10">Report critical incidents and view live road conditions.</p>
      </Link>
      
      <Link to="/hospital" className="relative backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 p-8 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/60 dark:border-gray-700/50 hover:border-blue-400/80 hover:shadow-[0_20px_60px_rgba(59,130,246,0.3)] transition-all duration-500 group hover:-translate-y-3 overflow-hidden animate-in fade-in slide-in-from-bottom-12 delay-200 fill-mode-both">
        <div className="absolute top-0 right-0 p-8 text-5xl opacity-40 group-hover:opacity-100 group-hover:-translate-y-2 group-hover:scale-125 transition-all duration-500 ease-out">🏥</div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-3 mt-6 pr-16">Hospital Dispatch</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed relative z-10">Command center to dispatch and monitor ambulance fleet.</p>
      </Link>

      <Link to="/driver" className="relative backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 p-8 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/60 dark:border-gray-700/50 hover:border-red-400/80 hover:shadow-[0_20px_60px_rgba(239,68,68,0.3)] transition-all duration-500 group hover:-translate-y-3 overflow-hidden animate-in fade-in slide-in-from-bottom-12 delay-300 fill-mode-both">
        <div className="absolute top-0 right-0 p-8 text-5xl opacity-40 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500 ease-out">🚑</div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors mb-3 mt-6 pr-16">Driver Console</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed relative z-10">Live routing and ETA tracking for emergency missions.</p>
      </Link>

      <Link to="/police" className="relative backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 p-8 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/60 dark:border-gray-700/50 hover:border-purple-400/80 hover:shadow-[0_20px_60px_rgba(168,85,247,0.3)] transition-all duration-500 group hover:-translate-y-3 overflow-hidden animate-in fade-in slide-in-from-bottom-12 delay-500 fill-mode-both">
        <div className="absolute top-0 right-0 p-8 text-5xl opacity-40 group-hover:opacity-100 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 ease-out">🛡️</div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-3 mt-6 pr-16">Traffic Police</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed relative z-10">Proactively clear intersections ahead of ambulances.</p>
      </Link>
    </div>
  </div>
);

export default Home;
