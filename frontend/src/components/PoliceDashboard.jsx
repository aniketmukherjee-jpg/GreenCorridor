import React, { useState } from 'react';
import { useSimulation, createTacticalAmbulanceIcon } from '../context/SimulationContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { 
  ShieldCheck, 
  Zap, 
  Search, 
  X, 
  Activity, 
  Radio, 
  Layers 
} from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LiveTrackingMap = ({ onClose }) => {
  const { activeMissions } = useSimulation();
  const defaultCenter = [12.9715, 77.6000];
  const center = (activeMissions && activeMissions.length > 0 && activeMissions[0].position && Array.isArray(activeMissions[0].position) && activeMissions[0].position.length >= 2)
    ? activeMissions[0].position
    : defaultCenter;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl h-[70vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md z-10 absolute top-0 left-0 right-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-500 animate-pulse" />
              <span>Global GIS Fleet Tracking</span>
            </h2>
            <p className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">ACTIVE DISPATCHES: {activeMissions ? activeMissions.length : 0}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        
        <div className="flex-1 w-full h-full pt-16">
          <MapContainer center={center} zoom={14} className="w-full h-full z-0" zoomControl={false}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {activeMissions && activeMissions.map(mission => (
              mission && mission.route && mission.position && (
                <React.Fragment key={mission.id}>
                  <Polyline positions={mission.route} color={mission.color || "#10b981"} weight={6} opacity={0.85} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 12px ${mission.color || '#10b981'})` }} />
                  <Marker position={mission.position} icon={createTacticalAmbulanceIcon(mission.heading || 0)}>
                    <Popup><div className="font-bold text-center">🚑 Unit {mission.id}<br/>ETA: {mission.eta}m<br/>Heading: {Math.round(mission.heading || 0)}°</div></Popup>
                  </Marker>
                  {mission.route.length > 0 && (
                    <Marker position={mission.route[mission.route.length - 1]}>
                      <Popup>Destination</Popup>
                    </Marker>
                  )}
                </React.Fragment>
              )
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

const PoliceDashboard = () => {
  const { activeMissions, trafficLights, setTrafficLights, events, addEvent } = useSimulation();
  const [showMap, setShowMap] = useState(false);

  const handleToggleLight = (id) => {
    setTrafficLights(prev => prev.map(l => {
      if (l.id === id) {
        const newStatus = l.status === 'red' ? 'green' : 'red';
        if (newStatus === 'green') {
          addEvent('Manual Override', `${l.name} manually set to GREEN by Police Operator`, 'success');
        }
        return { ...l, status: newStatus };
      }
      return l;
    }));
  };

  const handleClearAll = () => {
    let delay = 0;
    setTrafficLights(prev => prev.map(l => {
      if (l.status === 'red') {
        setTimeout(() => {
          setTrafficLights(curr => curr.map(cl => cl.id === l.id ? { ...cl, status: 'green' } : cl));
          addEvent('Corridor Swept', `${l.name} preempted in full sweep`, 'success');
        }, delay);
        delay += 400;
      }
      return l;
    }));
  };

  const activeCount = activeMissions ? activeMissions.length : 0;

  return (
    <div className="w-full p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Command Header Wireframe */}
        <div className="backdrop-blur-3xl bg-white/80 border border-slate-200 dark:bg-slate-900/60 dark:border-purple-500/30 rounded-3xl p-6 md:p-8 mb-8 shadow-xl dark:shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center text-slate-900 dark:text-white gap-4 glow-purple transition-colors duration-300">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-purple-500/40 flex items-center justify-center text-purple-500 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Traffic Command Center</h1>
              <p className="text-slate-600 dark:text-slate-400 font-semibold text-xs mt-1">Zone: Central Business District (CBD)</p>
            </div>
          </div>
          
          <div className="md:text-right flex md:block items-center space-x-4 md:space-x-0">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black mb-1">Preemption Status</p>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${activeCount > 0 ? 'bg-purple-500 animate-ping' : 'bg-emerald-500'}`}></div>
              <span className="font-mono text-xs font-bold">{activeCount > 0 ? '⚡ ACTIVE PREEMPTION' : '● SYSTEM MONITORING'}</span>
            </div>
          </div>
        </div>

        {activeCount > 0 && (
          <button 
            onClick={() => setShowMap(true)} 
            className="w-full mb-8 backdrop-blur-3xl bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-400 shadow-lg transition-all text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl animate-in fade-in slide-in-from-top-4 hover:scale-[1.01] flex items-center justify-center space-x-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <Search className="w-4 h-4" />
            <span>LAUNCH LIVE GLOBAL GIS MAP ({activeCount} ACTIVE DISPATCHES)</span>
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Signals Panel Wireframe */}
          <div className="backdrop-blur-3xl bg-white/80 border border-slate-200 shadow-lg dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-2xl rounded-3xl overflow-hidden transition-colors duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                <span>Intersection Signals</span>
              </h2>
              <button 
                onClick={handleClearAll}
                className="text-xs font-black px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-950 rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>CLEAR FULL CORRIDOR</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {trafficLights.map(light => (
                <div 
                  key={light.id} 
                  onClick={() => handleToggleLight(light.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-300 card-3d ${
                    light.status === 'green' 
                      ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/40 glow-emerald' 
                      : 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-colors ${
                      light.status === 'green' ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40' : 'bg-red-100 dark:bg-red-500/20 border-red-300 dark:border-red-500/40'
                    }`}>
                      <div className={`w-5 h-5 rounded-full transition-colors ${
                        light.status === 'green' ? 'bg-emerald-500 shadow-md dark:shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-md dark:shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse'
                      }`}></div>
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-sm">{light.name}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold uppercase tracking-widest mt-0.5">
                        {light.status === 'green' ? '🟢 GREEN (SIGNAL PREEMPTED)' : '🔴 RED (NORMAL CYCLING)'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1">
                    <span>TOGGLE</span>
                    <Zap className="w-3 h-3 text-yellow-500" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Timeline Panel Wireframe */}
          <div className="backdrop-blur-3xl bg-white/80 border border-slate-200 shadow-lg dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-2xl rounded-3xl overflow-hidden transition-colors duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <span>Preemption & Conflict Log</span>
              </h2>
            </div>
            
            <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto custom-scrollbar">
              {events.length === 0 ? (
                <p className="text-slate-500 text-xs font-semibold text-center py-12">Waiting for traffic network events...</p>
              ) : (
                events.map(event => (
                  <div key={event.id} className="animate-in fade-in slide-in-from-left-4 flex space-x-3 text-left">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${event.type === 'success' ? 'bg-emerald-500 dark:bg-emerald-400 shadow-sm' : 'bg-purple-500 dark:bg-purple-400 shadow-sm'}`}></div>
                      <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 mt-2"></div>
                    </div>
                    <div className="pb-4">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono block mb-0.5">
                        {event.time.toLocaleTimeString()}
                      </span>
                      <h4 className="font-black text-slate-900 dark:text-slate-200 text-xs">{event.title}</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5 font-semibold">{event.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
      {showMap && <LiveTrackingMap onClose={() => setShowMap(false)} />}
    </div>
  );
};

export default PoliceDashboard;
