import React, { useState, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { useSimulation } from '../context/SimulationContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom 3D Ambulance Marker Icon
const ambulanceIcon = L.divIcon({
  html: '<div style="position: relative;"><div class="radar-sweep"></div><div style="font-size: 28px; filter: drop-shadow(0 0 10px rgba(239,68,68,0.9)); position: relative; z-index: 10;">🚑</div></div>',
  className: 'custom-ambulance-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

const DriverDashboard = () => {
  const { missionState, setMissionState, ambulancePosition, route, eta, startMission } = useSimulation();
  const [sosProgress, setSosProgress] = useState(0);
  const [isSosActive, setIsSosActive] = useState(false);
  const sosIntervalRef = useRef(null);
  const { success, error, info } = useToast();

  const handleSosPressDown = () => {
    setIsSosActive(true);
    setSosProgress(0);
    sosIntervalRef.current = setInterval(() => {
      setSosProgress(prev => {
        if (prev >= 100) {
          clearInterval(sosIntervalRef.current);
          handleSosTrigger();
          return 100;
        }
        return prev + (100 / 15);
      });
    }, 100);
  };

  const handleSosPressUp = () => {
    setIsSosActive(false);
    clearInterval(sosIntervalRef.current);
    if (sosProgress < 100) {
      setSosProgress(0);
    }
  };

  const handleSosTrigger = () => {
    error('🚨 EMERGENCY SOS BROADCAST SENT TO ALL TRAFFIC POLICE ZONES 🚨');
    setSosProgress(0);
    setIsSosActive(false);
  };

  const toggleMissionMock = () => {
    if (missionState === 'WAITING') {
      info('New emergency mission dispatch received!');
      setMissionState('ASSIGNED');
    } else if (missionState === 'ASSIGNED') {
      startMission();
      success('Navigation activated. Live A* tracking initiated.');
    } else {
      setMissionState('WAITING');
      success('Mission complete. Vehicle returned to active pool.');
    }
  };

  return (
    <div className="w-full h-[calc(100vh-5rem)] flex flex-col relative overflow-hidden bg-slate-950">
      
      {/* Top Cyber Cockpit Telemetry Bar */}
      <div className="backdrop-blur-3xl bg-slate-950/80 border-b border-slate-800 p-4 flex justify-between items-center shadow-2xl z-20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-2xl shadow-inner">
            🚑
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-400">
            KA01
          </div>
          <div>
            <h1 className="font-black text-white text-sm tracking-wide">Driver Telemetry Cockpit</h1>
            <p className={`text-[10px] font-mono font-bold uppercase tracking-widest ${missionState === 'WAITING' ? 'text-emerald-400' : 'text-red-400'}`}>
              STATUS: {missionState === 'WAITING' ? '● AVAILABLE' : '🚨 ON MISSION'}
            </p>
          </div>
        </div>
        
        {/* Long-Press Cyber SOS Button */}
        <button 
          onMouseDown={handleSosPressDown}
          onMouseUp={handleSosPressUp}
          onMouseLeave={handleSosPressUp}
          onTouchStart={handleSosPressDown}
          onTouchEnd={handleSosPressUp}
          className="relative overflow-hidden px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest backdrop-blur-3xl bg-red-600/90 text-white border border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all select-none hover:scale-105 active:scale-95"
        >
          <div 
            className="absolute left-0 top-0 bottom-0 bg-red-800 z-0 transition-all duration-100 ease-linear"
            style={{ width: `${sosProgress}%` }}
          ></div>
          <span className="relative z-10 flex items-center space-x-2">
            <span>{sosProgress > 0 && sosProgress < 100 ? `HOLDING (${Math.round(sosProgress)}%)` : '🚨 HOLD FOR EMERGENCY SOS'}</span>
          </span>
        </button>
      </div>

      {/* Main Content Area (GIS Map Viewport) */}
      <div className="flex-1 relative flex items-center justify-center z-10 overflow-hidden">
        <MapContainer center={[12.9716, 77.5946]} zoom={13} className="absolute inset-0 z-0" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {missionState === 'NAVIGATING' && (
            <>
              <Polyline positions={route} color="#10b981" weight={6} opacity={0.8} dashArray="10, 10" className="animate-[dash_5s_linear_infinite]" style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.9))' }} />
              <Marker position={ambulancePosition} icon={ambulanceIcon}>
                <Popup>Vehicle Telemetry Active</Popup>
              </Marker>
              <Marker position={route[route.length - 1]}>
                <Popup>Destination: Victoria Hospital</Popup>
              </Marker>
            </>
          )}
        </MapContainer>
        
        {/* Waiting Viewport HUD */}
        {missionState === 'WAITING' && (
          <div className="z-10 backdrop-blur-3xl bg-slate-900/80 p-8 rounded-[2.5rem] border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-w-md w-full mx-4 text-center card-3d">
            <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-full animate-ping"></div>
              <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full shadow-[0_0_25px_rgba(16,185,129,0.6)] z-10 flex items-center justify-center text-2xl text-slate-950 font-black">
                📍
              </div>
            </div>
            <h2 className="text-2xl font-black mb-2 text-white tracking-tight">Listening for Dispatch</h2>
            <p className="text-slate-400 mb-8 font-semibold text-xs leading-relaxed">
              Unit is currently registered in the active fleet pool. A* optimal path will compute upon dispatch confirmation.
            </p>
            
            <button 
              onClick={toggleMissionMock}
              className="w-full py-4 text-white font-black text-xs tracking-widest uppercase rounded-2xl backdrop-blur-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:scale-105 transition-all shadow-xl"
            >
              Simulate Mission Dispatch (Demo)
            </button>
          </div>
        )}

        {/* Assigned Mission Alert HUD */}
        {missionState === 'ASSIGNED' && (
          <div className="z-10 backdrop-blur-3xl bg-slate-900/90 p-8 rounded-[2.5rem] border border-red-500/60 shadow-[0_0_50px_rgba(239,68,68,0.4)] max-w-md w-full mx-4 text-center card-3d glow-red">
            <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl border border-red-500/40 mx-auto mb-4 flex items-center justify-center text-3xl font-black shadow-inner animate-bounce">
              🚨
            </div>
            <h2 className="text-2xl font-black mb-1 text-white tracking-tight">INCOMING DISPATCH ASSIGNMENT</h2>
            <p className="text-red-400 font-mono font-bold text-xs mb-6">Mission #m101 • Priority: CRITICAL</p>
            
            <div className="bg-slate-950/80 rounded-2xl p-4 mb-6 text-left border border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Pickup Intersection</span>
                <span className="font-extrabold text-white text-xs">Trinity Circle, MG Road</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Destination Facility</span>
                <span className="font-extrabold text-white text-xs">Victoria Hospital (ICU Bed 2)</span>
              </div>
            </div>

            <button 
              onClick={toggleMissionMock}
              className="w-full py-4 text-slate-950 font-black text-sm tracking-widest uppercase rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all hover:scale-105"
            >
              ACCEPT MISSION & START NAVIGATION
            </button>
          </div>
        )}

        {/* Live Active Navigation Bottom HUD */}
        {missionState === 'NAVIGATING' && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4 z-10 pointer-events-none">
            <div className="backdrop-blur-3xl bg-slate-900/90 p-6 rounded-[2rem] border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-w-lg w-full pointer-events-auto card-3d">
              
              {/* Next Maneuver */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-4 flex items-center shadow-inner">
                <div className="text-3xl mr-4">⤴️</div>
                <div>
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Next A* Segment</div>
                  <div className="font-black text-white text-sm">Keep right onto JC Road in 200 meters</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {/* Holographic ETA Gauge */}
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="5" className="text-slate-800" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="5" 
                        className="text-emerald-400 transition-all duration-1000 ease-linear" 
                        strokeDasharray="175.9" 
                        strokeDashoffset={175.9 - (Math.min(eta, 4) / 4) * 175.9} 
                        strokeLinecap="round" />
                    </svg>
                    <div className="font-black text-xl text-white flex items-end">
                      {eta}<span className="text-[10px] text-slate-400 ml-0.5 mb-0.5">m</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Calculated ETA</p>
                    <p className="font-black text-emerald-400 text-xs">Signals preempted ahead</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    success('Arrived at Victoria Hospital. Mission Complete.');
                    setMissionState('WAITING');
                  }}
                  className="px-6 py-3.5 rounded-2xl font-black text-xs tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all hover:scale-105"
                >
                  ✓ CONFIRM ARRIVAL
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DriverDashboard;
