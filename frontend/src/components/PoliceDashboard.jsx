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

// Custom Ambulance Icon
const ambulanceIcon = L.divIcon({
  html: '<div style="position: relative;"><div class="radar-sweep"></div><div style="font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); position: relative; z-index: 10;">🚑</div></div>',
  className: 'custom-ambulance-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const LiveTrackingMap = ({ onClose }) => {
  const { activeMissions } = useSimulation();
  const center = activeMissions.length > 0 ? activeMissions[0].route[1] : [12.9715, 77.6000];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl h-[70vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-md z-10 absolute top-0 left-0 right-0">
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Live Global Tracking</h2>
            <p className="text-sm font-bold text-red-500">Active Missions: {activeMissions.length}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">✕</button>
        </div>
        
        <div className="flex-1 w-full h-full">
          <MapContainer center={center} zoom={14} className="w-full h-full z-0" zoomControl={false}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {activeMissions.map(mission => (
              <React.Fragment key={mission.id}>
                <Polyline positions={mission.route} color={mission.color || "blue"} weight={5} opacity={0.5} dashArray="10, 10" className="animate-[dash_5s_linear_infinite]" style={{ filter: `drop-shadow(0 0 10px ${mission.color || '#3b82f6'})` }} />
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
          addEvent('Manual Override', `${l.name} manually cleared by Command`, 'success');
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
          addEvent('Corridor Swept', `${l.name} cleared in sweep`, 'success');
        }, delay);
        delay += 500;
      }
      return l;
    }));
  };

  return (
    <div className="w-full p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="backdrop-blur-xl bg-slate-900/80 dark:bg-slate-950/80 border border-slate-700/50 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center text-white gap-4">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/20">🛡️</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight drop-shadow-md">Traffic Command Center</h1>
              <p className="text-slate-300 dark:text-slate-400 font-medium mt-1">Zone: Central Business District</p>
            </div>
          </div>
          <div className="md:text-right flex md:block items-center space-x-4 md:space-x-0">
            <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-1">Status</p>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${activeMissions.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="font-semibold">{activeMissions.length > 0 ? 'Active Mission' : 'Monitoring'}</span>
            </div>
          </div>
        </div>

        {activeMissions.length > 0 && (
          <button onClick={() => setShowMap(true)} className="w-full mb-8 backdrop-blur-md bg-blue-500/90 border border-blue-400 shadow-[0_8px_32px_rgba(59,130,246,0.3)] hover:bg-blue-600 transition-all text-white font-bold py-4 rounded-xl animate-in fade-in slide-in-from-top-4">
            🔍 Open Live Tracking Map ({activeMissions.length} Active)
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Traffic Lights Panel */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 dark:border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-200/50 dark:border-gray-700/50 bg-slate-50/30 dark:bg-gray-800/30 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center">
                <span className="mr-3 drop-shadow-sm">🚦</span> Intersections on Route
              </h2>
              <button 
                onClick={handleClearAll}
                className="text-xs font-bold px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm transition-colors flex items-center space-x-1"
              >
                <span>⚡</span>
                <span>Clear Full Corridor</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {trafficLights.map(light => (
                <div 
                  key={light.id} 
                  onClick={() => handleToggleLight(light.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                    light.status === 'green' 
                      ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50 hover:shadow-[0_4px_20px_rgba(34,197,94,0.15)]' 
                      : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner transition-colors duration-500 ${light.status === 'green' ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                      <div className={`w-6 h-6 rounded-full shadow-[0_0_15px_currentColor] transition-colors duration-500 ${light.status === 'green' ? 'text-green-500 bg-green-500' : 'text-red-500 bg-red-500 animate-pulse'}`}></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{light.name}</h3>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{light.status === 'green' ? 'Corridor Cleared' : 'Securing...'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Timeline Panel */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 dark:border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-200/50 dark:border-gray-700/50 bg-slate-50/30 dark:bg-gray-800/30">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center">
                <span className="mr-3 drop-shadow-sm">⚡</span> Live Event Feed
              </h2>
            </div>
            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Waiting for events...</p>
              ) : (
                events.map(event => (
                  <div key={event.id} className="animate-in fade-in slide-in-from-left-4 flex space-x-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${event.type === 'success' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}></div>
                      <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2"></div>
                    </div>
                    <div className="pb-6">
                      <span className="text-xs text-gray-400 font-bold mb-1 block">
                        {event.time.toLocaleTimeString()}
                      </span>
                      <h4 className="font-bold text-gray-900 dark:text-white">{event.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
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
