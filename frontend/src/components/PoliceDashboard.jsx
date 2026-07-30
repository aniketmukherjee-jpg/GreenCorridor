import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix for default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom 3D Ambulance Icon
const ambulanceIcon = L.divIcon({
  html: '<div style="position: relative;"><div class="radar-sweep"></div><div style="font-size: 28px; filter: drop-shadow(0 0 10px rgba(168,85,247,0.9)); position: relative; z-index: 10;">🚑</div></div>',
  className: 'custom-ambulance-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

const LiveTrackingMap = ({ onClose }) => {
  const { activeMissions } = useSimulation();
  const center = activeMissions.length > 0 ? activeMissions[0].route[1] : [12.9715, 77.6000];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl h-[70vh] bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 backdrop-blur-md z-10 absolute top-0 left-0 right-0">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>🛰️ Global GIS Fleet Tracking</span>
            </h2>
            <p className="text-xs font-mono font-bold text-purple-400">ACTIVE DISPATCHES: {activeMissions.length}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold hover:bg-slate-700 hover:text-white transition-colors">✕</button>
        </div>
        
        <div className="flex-1 w-full h-full pt-16">
          <MapContainer center={center} zoom={14} className="w-full h-full z-0" zoomControl={false}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {activeMissions.map(mission => (
              <React.Fragment key={mission.id}>
                <Polyline positions={mission.route} color={mission.color || "#a855f7"} weight={6} opacity={0.8} dashArray="10, 10" className="animate-[dash_5s_linear_infinite]" style={{ filter: `drop-shadow(0 0 12px ${mission.color || '#a855f7'})` }} />
                <Marker position={mission.position} icon={ambulanceIcon}>
                  <Popup><div className="font-bold text-center">🚑 Unit {mission.id}<br/>ETA: {mission.eta}m</div></Popup>
                </Marker>
                <Marker position={mission.route[mission.route.length - 1]}>
                  <Popup>Destination</Popup>
                </Marker>
              </React.Fragment>
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

  return (
    <div className="w-full p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Command Header */}
        <div className="backdrop-blur-3xl bg-slate-900/60 border border-purple-500/30 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center text-white gap-4 glow-purple">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-purple-500/40 flex items-center justify-center text-3xl shadow-inner">
              🛡️
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight drop-shadow-md">Traffic Command Center</h1>
              <p className="text-slate-400 font-semibold text-xs mt-1">Zone: Central Business District (CBD)</p>
            </div>
          </div>
          
          <div className="md:text-right flex md:block items-center space-x-4 md:space-x-0">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Preemption Status</p>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${activeMissions.length > 0 ? 'bg-purple-400 animate-ping' : 'bg-emerald-400'}`}></div>
              <span className="font-mono text-xs font-bold">{activeMissions.length > 0 ? '⚡ ACTIVE PREEMPTION' : '● SYSTEM MONITORING'}</span>
            </div>
          </div>
        </div>

        {activeMissions.length > 0 && (
          <button 
            onClick={() => setShowMap(true)} 
            className="w-full mb-8 backdrop-blur-3xl bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:from-purple-500 hover:to-indigo-500 transition-all text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl animate-in fade-in slide-in-from-top-4 hover:scale-[1.01]"
          >
            🔍 LAUNCH LIVE GLOBAL GIS MAP ({activeMissions.length} ACTIVE DISPATCHES)
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Traffic Signals Panel */}
          <div className="backdrop-blur-3xl bg-slate-900/60 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>🚦</span> Intersection Signals
              </h2>
              <button 
                onClick={handleClearAll}
                className="text-xs font-black px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all flex items-center space-x-1"
              >
                <span>⚡ CLEAR FULL CORRIDOR</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {trafficLights.map(light => (
                <div 
                  key={light.id} 
                  onClick={() => handleToggleLight(light.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-300 card-3d ${
                    light.status === 'green' 
                      ? 'bg-emerald-500/10 border-emerald-500/40 glow-emerald' 
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-colors ${
                      light.status === 'green' ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-red-500/20 border-red-500/40'
                    }`}>
                      <div className={`w-5 h-5 rounded-full transition-colors ${
                        light.status === 'green' ? 'bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse'
                      }`}></div>
                    </div>
                    <div>
                      <h3 className="font-black text-white text-sm">{light.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest mt-0.5">
                        {light.status === 'green' ? '🟢 GREEN (SIGNAL PREEMPTED)' : '🔴 RED (NORMAL CYCLING)'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 hover:text-slate-300">TOGGLE ⚡</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Timeline Panel */}
          <div className="backdrop-blur-3xl bg-slate-900/60 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-950/60">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>⚡</span> Preemption & Conflict Log
              </h2>
            </div>
            
            <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto custom-scrollbar">
              {events.length === 0 ? (
                <p className="text-slate-500 text-xs font-semibold text-center py-12">Waiting for traffic network events...</p>
              ) : (
                events.map(event => (
                  <div key={event.id} className="animate-in fade-in slide-in-from-left-4 flex space-x-3 text-left">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${event.type === 'success' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]'}`}></div>
                      <div className="w-0.5 h-full bg-slate-800 mt-2"></div>
                    </div>
                    <div className="pb-4">
                      <span className="text-[9px] text-slate-500 font-mono block mb-0.5">
                        {event.time.toLocaleTimeString()}
                      </span>
                      <h4 className="font-black text-slate-200 text-xs">{event.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5 font-semibold">{event.description}</p>
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
