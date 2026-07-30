import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useSimulation } from '../context/SimulationContext';

const Layout = ({ children }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prevEventCount, setPrevEventCount] = useState(0);
  const [timeString, setTimeString] = useState('');
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();
  const { events } = useSimulation();

  // Ticking Live Tactical Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-US', { hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to determine active dashboard properties & theme colors
  const getActiveDashboardProps = () => {
    switch (location.pathname) {
      case '/citizen': return { label: 'Citizen Map', icon: '🗺️', activeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 glow-emerald' };
      case '/hospital': return { label: 'Hospital Command', icon: '🏥', activeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/40 glow-blue' };
      case '/driver': return { label: 'Driver Cockpit', icon: '🚑', activeClass: 'bg-red-500/20 text-red-400 border-red-500/40 glow-red' };
      case '/police': return { label: 'Police Signals', icon: '🛡️', activeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/40 glow-purple' };
      case '/analytics': return { label: 'Analytics Intel', icon: '📈', activeClass: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 glow-blue' };
      case '/admin': return { label: 'System Admin', icon: '🔑', activeClass: 'bg-teal-500/20 text-teal-400 border-teal-500/40 glow-emerald' };
      default: return { label: 'Operations Hub', icon: '⚡', activeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/40 glow-blue' };
    }
  };
  const { label: activeLabel, icon: activeIcon, activeClass: activeStyleClass } = getActiveDashboardProps();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (events && events.length > prevEventCount) {
      if (!isNotifOpen) {
        setUnreadCount(prev => prev + (events.length - prevEventCount));
      }
      setPrevEventCount(events.length);
    } else if (events && events.length < prevEventCount) {
      setPrevEventCount(events.length);
    }
  }, [events, isNotifOpen, prevEventCount]);

  const handleOpenNotif = () => {
    setIsNotifOpen(!isNotifOpen);
    setUnreadCount(0);
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-slate-950 text-slate-100 cyber-grid overflow-x-hidden">
      
      {/* Dynamic Futuristic Mesh Background Glows */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-600/10 blur-[160px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Global Tactical Cyber Navbar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-slate-950/70 border-b border-slate-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 relative">
            
            {/* Left Brand Identity */}
            <div className="flex items-center space-x-4 z-10">
              <Link to="/" className="flex items-center space-x-3 group">
                <img 
                  src="/logoo.png" 
                  alt="GreenCorridor Logo" 
                  className="h-10 md:h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-all duration-300" 
                />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 leading-none">GreenCorridor</span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider">Tactical Platform v3.0</span>
                </div>
              </Link>
            </div>
            
            {/* Center Navigation Portal */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center space-x-2 md:space-x-3 z-20">
              {/* Home Pill */}
              <Link 
                to="/" 
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all border backdrop-blur-xl ${
                  location.pathname === '/' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 glow-emerald' 
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <span>🏠</span>
                <span className="hidden sm:inline uppercase tracking-widest text-[11px]">Home</span>
              </Link>

              {/* Viewports Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all border backdrop-blur-xl ${
                    isDropdownOpen || location.pathname !== '/' 
                      ? activeStyleClass
                      : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span>{activeIcon}</span>
                  <span className="hidden sm:inline uppercase tracking-widest text-[11px]">{activeLabel}</span>
                  <span className={`text-[9px] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                
                {/* Cyber Dropdown Menu */}
                <div className={`absolute top-full left-0 mt-3 w-72 backdrop-blur-3xl bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 origin-top-left z-50 ${isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto translate-y-0' : 'opacity-0 scale-95 pointer-events-none -translate-y-2'}`}>
                  <div className="p-2 space-y-1">
                    {[
                      { to: '/citizen', icon: '🗺️', name: 'Citizen Map', desc: 'Report & track incidents', color: 'hover:bg-emerald-500/10 hover:text-emerald-400 border-emerald-500/20' },
                      { to: '/hospital', icon: '🏥', name: 'Hospital Dispatch', desc: 'Fleet matching & triage', color: 'hover:bg-blue-500/10 hover:text-blue-400 border-blue-500/20' },
                      { to: '/driver', icon: '🚑', name: 'Driver Console', desc: 'A* Navigation & telemetry', color: 'hover:bg-red-500/10 hover:text-red-400 border-red-500/20' },
                      { to: '/police', icon: '🛡️', name: 'Traffic Police', desc: 'Corridor preemption', color: 'hover:bg-purple-500/10 hover:text-purple-400 border-purple-500/20' },
                      { to: '/analytics', icon: '📈', name: 'Analytics Intel', desc: 'Response metrics & charts', color: 'hover:bg-indigo-500/10 hover:text-indigo-400 border-indigo-500/20' },
                      { to: '/admin', icon: '🔑', name: 'Admin Console', desc: 'System governance', color: 'hover:bg-teal-500/10 hover:text-teal-400 border-teal-500/20' }
                    ].map((item, idx) => (
                      <Link 
                        key={idx}
                        to={item.to} 
                        onClick={() => setIsDropdownOpen(false)} 
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all border border-transparent ${item.color} group`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-100 group-hover:text-white leading-tight mb-0.5">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Status Indicator & Notification Drawer */}
            <div className="flex items-center space-x-3 z-10">
              
              {/* Tactical Clock Pill */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-emerald-400 font-bold shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{timeString}</span>
              </div>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={handleOpenNotif}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-200 transition-all relative focus:outline-none"
                >
                  <span className="text-base">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-[0_0_10px_rgba(239,68,68,0.8)] border border-slate-950">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* 3D Cyber Notifications Panel */}
                <div className={`absolute top-full right-0 mt-3 w-88 backdrop-blur-3xl bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-300 origin-top-right z-50 ${isNotifOpen ? 'opacity-100 scale-100 pointer-events-auto translate-y-0' : 'opacity-0 scale-95 pointer-events-none -translate-y-2'}`}>
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      <h3 className="font-extrabold text-white text-xs uppercase tracking-widest">Tactical Telemetry Feed</h3>
                    </div>
                    {events && events.length > 0 && (
                      <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md">
                        {events.length} LOGS
                      </span>
                    )}
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
                    {!events || events.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                        No active system warnings recorded
                      </div>
                    ) : (
                      events.map(event => (
                        <div key={event.id} className="p-4 hover:bg-slate-800/40 transition-colors flex items-start space-x-3 text-left">
                          <span className="text-xl mt-0.5">
                            {event.title.includes('Cleared') ? '🟢' : event.title.includes('Started') ? '🚨' : event.title.includes('Completed') ? '✅' : '⚠️'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-100 text-xs leading-tight mb-1">{event.title}</h4>
                            <p className="text-[11px] text-slate-400 leading-snug">{event.description}</p>
                            <span className="text-[9px] text-slate-500 font-mono block mt-1.5">
                              {new Date(event.time).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <ThemeToggle />
            </div>

          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;
