import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useToast } from '../context/ToastContext';
import { useSimulation } from '../context/SimulationContext';

const Layout = ({ children }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prevEventCount, setPrevEventCount] = useState(0);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();
  const { events } = useSimulation();

  // Helper to determine active dashboard properties
  const getActiveDashboardProps = () => {
    switch (location.pathname) {
      case '/citizen': return { label: 'Citizen Map', icon: '🗺️', activeClass: 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 dark:border-green-400/30' };
      case '/hospital': return { label: 'Hospital', icon: '🏥', activeClass: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 dark:border-blue-400/30' };
      case '/driver': return { label: 'Driver', icon: '🚑', activeClass: 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30 dark:border-red-400/30' };
      case '/police': return { label: 'Police', icon: '🛡️', activeClass: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30 dark:border-purple-400/30' };
      case '/analytics': return { label: 'Analytics', icon: '📈', activeClass: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 dark:border-indigo-400/30' };
      case '/admin': return { label: 'Admin Console', icon: '🔑', activeClass: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-400/30' };
      default: return { label: 'Dashboards', icon: '⚡', activeClass: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 dark:border-blue-400/30' };
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
      // Handled if events are cleared
      setPrevEventCount(events.length);
    }
  }, [events, isNotifOpen, prevEventCount]);

  const handleOpenNotif = () => {
    setIsNotifOpen(!isNotifOpen);
    setUnreadCount(0);
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background Layers for Crossfade (Scaled aggressively via inline style to guarantee AI watermark is hidden) */}
      <div className="fixed inset-0 z-[-1] bg-[url('/light-bg.png')] bg-cover bg-center bg-no-repeat transition-opacity duration-500" style={{ transform: 'scale(1.25)' }}></div>
      <div className="fixed inset-0 z-[-1] bg-[url('/dark-bg.png')] bg-cover bg-center bg-no-repeat opacity-0 dark:opacity-100 transition-opacity duration-500" style={{ transform: 'scale(1.25)' }}></div>

      {/* Global Navbar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-3xl bg-white/10 dark:bg-black/20 border-b border-white/30 dark:border-gray-700/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 relative">
            
            {/* Left side: Logo */}
            <div className="flex items-center z-10">
              <Link to="/" className="flex items-center group">
                <img src="/logoo.png" alt="GreenCorridor Logo" className="h-10 md:h-14 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300" />
              </Link>
            </div>
            
            {/* Center: Navigation Links */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center space-x-2 md:space-x-4 z-20 w-max">
                {/* Home Button */}
                <Link 
                  to="/" 
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm border backdrop-blur-md ${
                    location.pathname === '/' 
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-400/30' 
                      : 'bg-white/20 dark:bg-black/40 text-gray-700 dark:text-gray-300 border-white/50 dark:border-gray-700/50 hover:bg-white/40 dark:hover:bg-black/20'
                  }`}
                >
                  <span>🏠</span>
                  <span className="hidden sm:inline tracking-wide">Home</span>
                </Link>
                
                {/* Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm border backdrop-blur-md ${
                      isDropdownOpen || location.pathname !== '/' 
                        ? activeStyleClass
                        : 'bg-white/20 dark:bg-black/40 text-gray-700 dark:text-gray-300 border-white/50 dark:border-gray-700/50 hover:bg-white/40 dark:hover:bg-black/20'
                    }`}
                  >
                    <span>{activeIcon}</span>
                    <span className="hidden sm:inline tracking-wide">{activeLabel}</span>
                    <span className={`text-[9px] transition-transform duration-300 ml-1 ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  
                  {/* Dropdown Content */}
                  <div className={`absolute top-full left-0 mt-3 w-64 backdrop-blur-3xl bg-white/90 dark:bg-gray-900/90 border border-white/80 dark:border-gray-700/80 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 origin-top-left ${isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto translate-y-0' : 'opacity-0 scale-95 pointer-events-none -translate-y-2'}`}>
                    <div className="p-2 space-y-1">
                      <Link to="/citizen" onClick={() => setIsDropdownOpen(false)} className={`flex items-center space-x-3 p-3 rounded-xl transition-all group ${location.pathname === '/citizen' ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-black' : 'text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 font-bold'}`}>
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-xl group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-sm">🗺️</div>
                        <div>
                          <div className="leading-none mb-1">Citizen Map</div>
                          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest opacity-80">Report Incidents</div>
                        </div>
                      </Link>
                      
                      <Link to="/hospital" onClick={() => setIsDropdownOpen(false)} className={`flex items-center space-x-3 p-3 rounded-xl transition-all group ${location.pathname === '/hospital' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-black' : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 font-bold'}`}>
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xl group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-sm">🏥</div>
                        <div>
                          <div className="leading-none mb-1">Hospital</div>
                          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest opacity-80">Command Center</div>
                        </div>
                      </Link>

                      <Link to="/driver" onClick={() => setIsDropdownOpen(false)} className={`flex items-center space-x-3 p-3 rounded-xl transition-all group ${location.pathname === '/driver' ? 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-black' : 'text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 font-bold'}`}>
                        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-xl group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-sm">🚑</div>
                        <div>
                          <div className="leading-none mb-1">Driver</div>
                          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest opacity-80">Ambulance View</div>
                        </div>
                      </Link>

                      <Link to="/police" onClick={() => setIsDropdownOpen(false)} className={`flex items-center space-x-3 p-3 rounded-xl transition-all group ${location.pathname === '/police' ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-black' : 'text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 font-bold'}`}>
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-xl group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-sm">🛡️</div>
                        <div>
                          <div className="leading-none mb-1">Police</div>
                          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest opacity-80">Traffic Command</div>
                        </div>
                      </Link>

                      <Link to="/analytics" onClick={() => setIsDropdownOpen(false)} className={`flex items-center space-x-3 p-3 rounded-xl transition-all group ${location.pathname === '/analytics' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-black' : 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold'}`}>
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-sm">📈</div>
                        <div>
                          <div className="leading-none mb-1">Analytics</div>
                          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest opacity-80">Insights & Trends</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

            {/* Right side navigation & toggle */}
            <div className="flex items-center space-x-3 sm:space-x-6">
              
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={handleOpenNotif}
                  className="p-2.5 rounded-xl bg-white/20 dark:bg-black/40 border border-white/50 dark:border-gray-700/50 hover:bg-white/40 dark:hover:bg-black/20 text-gray-700 dark:text-gray-300 transition-all shadow-sm relative focus:outline-none"
                >
                  <span className="text-lg">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-lg border border-white dark:border-gray-900">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <div className={`absolute top-full right-0 mt-3 w-80 backdrop-blur-3xl bg-white/95 dark:bg-gray-900/95 border border-white/80 dark:border-gray-700/80 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 origin-top-right z-50 ${isNotifOpen ? 'opacity-100 scale-100 pointer-events-auto translate-y-0' : 'opacity-0 scale-95 pointer-events-none -translate-y-2'}`}>
                  <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center bg-gray-50/55 dark:bg-gray-800/30">
                    <h3 className="font-black text-gray-900 dark:text-white text-sm">Notifications</h3>
                    {events && events.length > 0 && (
                      <span className="text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                        {events.length} total
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 custom-scrollbar">
                    {!events || events.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm font-medium">
                        No system notifications
                      </div>
                    ) : (
                      events.map(event => (
                        <div key={event.id} className="p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors flex items-start space-x-3 text-left">
                          <span className="text-lg mt-0.5">
                            {event.title.includes('Cleared') ? '🟢' : event.title.includes('Started') ? '🚨' : event.title.includes('Completed') ? '✅' : 'ℹ️'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white text-xs leading-tight mb-0.5">{event.title}</h4>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug">{event.description}</p>
                            <span className="text-[9px] text-gray-400 font-medium block mt-1">
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
