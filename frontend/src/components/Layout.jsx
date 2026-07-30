import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useSimulation } from '../context/SimulationContext';
import { 
  Home as HomeIcon, 
  Map as MapIcon, 
  Building2, 
  Ambulance, 
  ShieldCheck, 
  LineChart, 
  Bell, 
  ChevronDown, 
  Clock, 
  Sparkles,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Siren
} from 'lucide-react';

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

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-US', { hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getActiveDashboardProps = () => {
    switch (location.pathname) {
      case '/citizen': return { label: 'Citizen Map', Icon: MapIcon, activeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 glow-emerald' };
      case '/hospital': return { label: 'Hospital Command', Icon: Building2, activeClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/40 glow-blue' };
      case '/driver': return { label: 'Driver Cockpit', Icon: Ambulance, activeClass: 'bg-red-500/10 text-red-600 border-red-500/30 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40 glow-red' };
      case '/police': return { label: 'Police Signals', Icon: ShieldCheck, activeClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/40 glow-purple' };
      case '/analytics': return { label: 'Analytics Intel', Icon: LineChart, activeClass: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/40 glow-blue' };
      default: return { label: 'Operations Hub', Icon: Sparkles, activeClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/40 glow-blue' };
    }
  };
  const { label: activeLabel, Icon: ActiveIcon, activeClass: activeStyleClass } = getActiveDashboardProps();

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
    <div className="min-h-screen relative flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 cyber-grid overflow-x-hidden transition-colors duration-300">
      
      {/* Ambient Mesh Glow */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 dark:bg-cyan-600/10 blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 dark:bg-emerald-600/10 blur-[160px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Global Navbar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-white/80 border-b border-slate-200/80 dark:bg-slate-950/80 dark:border-slate-800/80 shadow-md dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 relative">
            
            {/* Left Logo */}
            <div className="flex items-center space-x-4 z-10">
              <Link to="/" className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-xl p-1">
                <img 
                  src="/logoo.png" 
                  alt="GreenCorridor Logo" 
                  className="h-10 md:h-12 w-auto object-contain drop-shadow-md dark:drop-shadow-[0_0_12px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-all duration-300" 
                />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400 leading-none">GreenCorridor</span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">Tactical Platform v3.0</span>
                </div>
              </Link>
            </div>
            
            {/* Center Navigation Bar Wireframe */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center space-x-2 md:space-x-3 z-20">
              <Link 
                to="/" 
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all border backdrop-blur-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  location.pathname === '/' 
                    ? 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/40 glow-blue' 
                    : 'bg-white/60 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800/80 dark:hover:text-white'
                }`}
              >
                <HomeIcon className="w-4 h-4" />
                <span className="hidden sm:inline uppercase tracking-widest text-[11px]">Home</span>
              </Link>

              {/* Viewports Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all border backdrop-blur-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDropdownOpen || location.pathname !== '/' 
                      ? activeStyleClass
                      : 'bg-white/60 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800/80 dark:hover:text-white'
                  }`}
                >
                  <ActiveIcon className="w-4 h-4" />
                  <span className="hidden sm:inline uppercase tracking-widest text-[11px]">{activeLabel}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`absolute top-full left-0 mt-3 w-72 backdrop-blur-3xl bg-white/95 border border-slate-200 shadow-xl dark:bg-slate-900/95 dark:border-slate-700/80 dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden transition-all duration-300 origin-top-left z-50 ${isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto translate-y-0' : 'opacity-0 scale-95 pointer-events-none -translate-y-2'}`}>
                  <div className="p-2 space-y-1">
                    {[
                      { to: '/citizen', Icon: MapIcon, name: 'Citizen Map', desc: 'Report & track incidents', color: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border-emerald-500/20' },
                      { to: '/hospital', Icon: Building2, name: 'Hospital Dispatch', desc: 'Fleet matching & triage', color: 'hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 border-cyan-500/20' },
                      { to: '/driver', Icon: Ambulance, name: 'Driver Console', desc: 'A* Navigation & telemetry', color: 'hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 border-red-500/20' },
                      { to: '/police', Icon: ShieldCheck, name: 'Traffic Police', desc: 'Corridor preemption', color: 'hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 border-purple-500/20' },
                      { to: '/analytics', Icon: LineChart, name: 'Analytics Intel', desc: 'Response metrics & charts', color: 'hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 border-indigo-500/20' }
                    ].map((item, idx) => (
                      <Link 
                        key={idx}
                        to={item.to} 
                        onClick={() => setIsDropdownOpen(false)} 
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all border border-transparent ${item.color} group cursor-pointer focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-800`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform">
                          <item.Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-black dark:group-hover:text-white leading-tight mb-0.5">{item.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Status Pill & Theme Toggle */}
            <div className="flex items-center space-x-3 z-10">
              
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold shadow-sm">
                <Clock className="w-3.5 h-3.5 animate-pulse text-cyan-500" />
                <span>{timeString}</span>
              </div>

              {/* Notification Drawer */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={handleOpenNotif}
                  className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all relative focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-sm"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md border border-white dark:border-slate-950">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <div className={`absolute top-full right-0 mt-3 w-88 backdrop-blur-3xl bg-white/95 border border-slate-200 dark:bg-slate-900/95 dark:border-slate-700/80 rounded-2xl shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-300 origin-top-right z-50 ${isNotifOpen ? 'opacity-100 scale-100 pointer-events-auto translate-y-0' : 'opacity-0 scale-95 pointer-events-none -translate-y-2'}`}>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/60">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-cyan-500 animate-pulse" />
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-widest">Tactical Telemetry Feed</h3>
                    </div>
                    {events && events.length > 0 && (
                      <span className="text-[10px] font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                        {events.length} LOGS
                      </span>
                    )}
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
                    {!events || events.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                        No active system warnings recorded
                      </div>
                    ) : (
                      events.map(event => (
                        <div key={event.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-start space-x-3 text-left">
                          <div className="mt-0.5">
                            {event.title.includes('Cleared') ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : event.title.includes('Started') ? (
                              <Siren className="w-4 h-4 text-red-500 animate-pulse" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-tight mb-1">{event.title}</h4>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{event.description}</p>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono block mt-1.5">
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
