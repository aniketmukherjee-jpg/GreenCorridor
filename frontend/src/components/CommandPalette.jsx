import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { startMission, setTrafficLights } = useSimulation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(open => !open);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const commands = [
    { id: 'nav-citizen', name: 'Go to Citizen Map', type: 'Navigation', icon: '🗺️', action: () => navigate('/citizen') },
    { id: 'nav-hospital', name: 'Go to Hospital Dispatch', type: 'Navigation', icon: '🏥', action: () => navigate('/hospital') },
    { id: 'nav-driver', name: 'Go to Driver Console', type: 'Navigation', icon: '🚑', action: () => navigate('/driver') },
    { id: 'nav-police', name: 'Go to Police Command', type: 'Navigation', icon: '🛡️', action: () => navigate('/police') },
    { id: 'nav-analytics', name: 'Go to Analytics', type: 'Navigation', icon: '📈', action: () => navigate('/analytics') },
    
    { id: 'sim-dispatch-1', name: 'Dispatch Ambulance (Route 1)', type: 'Simulation', icon: '🚨', action: () => startMission(`M-${Math.floor(Math.random()*1000)}`, 'route1', '#ef4444') },
    { id: 'sim-dispatch-2', name: 'Dispatch Ambulance (Route 2)', type: 'Simulation', icon: '🚨', action: () => startMission(`M-${Math.floor(Math.random()*1000)}`, 'route2', '#eab308') },
    
    { id: 'sim-clear-lights', name: 'Clear All Traffic Lights (Green)', type: 'Simulation', icon: '🟢', action: () => setTrafficLights(prev => prev.map(l => ({ ...l, status: 'green' }))) },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(search.toLowerCase()) || 
    cmd.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = (action) => {
    action();
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}></div>
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <span className="text-gray-400 text-xl mr-3">🔍</span>
          <input 
            autoFocus
            type="text"
            className="flex-1 bg-transparent outline-none text-lg text-gray-900 dark:text-white placeholder-gray-400 font-medium"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="text-xs font-bold text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 shadow-inner">ESC</span>
        </div>

        {/* Command List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium">No results found for "{search}"</div>
          ) : (
            <div className="space-y-1">
              {['Navigation', 'Simulation'].map(group => {
                const groupCmds = filteredCommands.filter(c => c.type === group);
                if (groupCmds.length === 0) return null;
                
                return (
                  <div key={group} className="mb-4">
                    <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">{group}</div>
                    {groupCmds.map((cmd, i) => (
                      <button 
                        key={cmd.id}
                        onClick={() => handleAction(cmd.action)}
                        className={`w-full flex items-center px-3 py-3 rounded-xl transition-colors text-left group
                          hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400`}
                      >
                        <span className="text-xl mr-3 group-hover:scale-110 transition-transform">{cmd.icon}</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{cmd.name}</span>
                        <span className="ml-auto text-xs text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Select ↵</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800/80 p-3 text-xs font-medium text-gray-500 flex justify-between items-center border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 shadow-sm border border-gray-300 dark:border-gray-600 font-sans">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 shadow-sm border border-gray-300 dark:border-gray-600 font-sans">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 shadow-sm border border-gray-300 dark:border-gray-600 font-sans">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <div>GreenCorridor Command</div>
        </div>

      </div>
    </div>
  );
};

export default CommandPalette;
