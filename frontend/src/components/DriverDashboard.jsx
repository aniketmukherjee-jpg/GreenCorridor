import React, { useState, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { useSimulation } from '../context/SimulationContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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
        return prev + (100 / 15); // 1.5s to reach 100 (100ms intervals = 15 ticks)
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
    error('🚨 SOS SIGNAL BROADCASTED TO COMMAND CENTER 🚨');
    setSosProgress(0);
    setIsSosActive(false);
  };

  const toggleMissionMock = () => {
    if (missionState === 'WAITING') {
      info('New emergency mission received!');
      setMissionState('ASSIGNED');
    } else if (missionState === 'ASSIGNED') {
      startMission();
      success('Navigation started. Live tracking active.');
    } else {
      setMissionState('WAITING');
      success('Mission completed. Returned to available pool.');
    }
  };

  return (
    <div className="w-full h-[calc(100vh-5rem)] flex flex-col relative overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 border-b border-gray-200/50 dark:border-gray-700/50 p-4 flex justify-between items-center shadow-sm z-20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-white/50 dark:border-gray-600/50">
            🚑
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center font-bold text-white shadow-inner border border-red-300 dark:border-red-700">
            KA01
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white">Ambulance Driver</h1>
            <p className={`text-xs font-semibold uppercase tracking-wider ${missionState === 'WAITING' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
              Status: {missionState === 'WAITING' ? 'Available' : 'On Mission'}
            </p>
          </div>
        </div>
        
        {/* Long-Press SOS Button */}
        <button 
          onMouseDown={handleSosPressDown}
          onMouseUp={handleSosPressUp}
          onMouseLeave={handleSosPressUp}
          onTouchStart={handleSosPressDown}
          onTouchEnd={handleSosPressUp}
          className="relative overflow-hidden px-6 py-2 rounded-xl font-bold backdrop-blur-md bg-red-500/80 text-white border border-t-red-400 border-b-red-700 shadow-[0_8px_32px_rgba(239,68,68,0.4)] transition-all select-none focus-visible:ring-2 ring-red-400"
        >
          <div 
            className="absolute left-0 top-0 bottom-0 bg-red-700 z-0 transition-all duration-100 ease-linear"
            style={{ width: `${sosProgress}%` }}
          ></div>
          <span className="relative z-10 flex items-center space-x-2">
            <span>{sosProgress > 0 && sosProgress < 100 ? 'HOLD...' : 'SOS'}</span>
          </span>
        </button>
      </div>

      {/* Main Content Area (Map) */}
      <div className="flex-1 relative flex items-center justify-center z-10 overflow-hidden">
        <MapContainer center={[12.9716, 77.5946]} zoom={13} className="absolute inset-0 z-0" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {missionState === 'NAVIGATING' && (
            <>
              <Polyline positions={route} color="#3b82f6" weight={5} opacity={0.7} dashArray="10, 10" className="animate-[dash_5s_linear_infinite]" style={{ filter: 'drop-shadow(0 0 10px rgba(59,130,246,0.8))' }} />
              <Marker position={ambulancePosition} icon={ambulanceIcon}>
                <Popup>Your Location</Popup>
              </Marker>
              <Marker position={route[route.length - 1]}>
                <Popup>Destination: Victoria Hospital</Popup>
              </Marker>
            </>
          )}
        </MapContainer>
        
        {missionState === 'WAITING' && (
          <div className="z-10 backdrop-blur-2xl bg-white/70 dark:bg-gray-900/70 p-8 rounded-3xl border border-white/60 dark:border-gray-600/50 shadow-[0_16px_64px_rgba(0,0,0,0.1)] dark:shadow-[0_16px_64px_rgba(0,0,0,0.5)] max-w-md w-full mx-4 text-center transform transition-all animate-in zoom-in-95">
            <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <div className="absolute inset-4 border-2 border-blue-500/50 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_1s]"></div>
              <div className="w-12 h-12 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] z-10 flex items-center justify-center text-xl text-white">📍</div>
            </div>
            <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-white tracking-tight">No Active Missions</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">Listening for hospital dispatch assignment. Keep app open.</p>
            
            <button 
              onClick={toggleMissionMock}
              className="w-full py-4 text-gray-200 font-bold rounded-2xl backdrop-blur-md bg-gray-700/50 border border-t-gray-500/50 border-b-black/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-gray-600/50 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] active:translate-y-0 active:shadow-none transition-all"
            >
              Simulate Dispatch (Mock)
            </button>
          </div>
        )}

        {missionState === 'ASSIGNED' && (
          <div className="z-10 backdrop-blur-2xl bg-white/90 dark:bg-gray-900/90 p-8 rounded-3xl border border-red-500/50 shadow-[0_0_64px_rgba(239,68,68,0.3)] max-w-md w-full mx-4 text-center transform transition-all animate-in slide-in-from-bottom-8">
            <div className="w-16 h-16 bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold shadow-inner">
              🚨
            </div>
            <h2 className="text-2xl font-black mb-1 text-gray-900 dark:text-white tracking-tight">CRITICAL MISSION</h2>
            <p className="text-red-600 dark:text-red-400 font-bold mb-6">Mission #m101</p>
            
            <div className="bg-gray-100/50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 text-left border border-gray-200/50 dark:border-gray-700/50">
              <div className="mb-3">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest block mb-1">Pickup</span>
                <span className="font-bold text-gray-800 dark:text-white">MG Road, near Trinity Circle</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest block mb-1">Destination</span>
                <span className="font-bold text-gray-800 dark:text-white">Victoria Hospital</span>
              </div>
            </div>

            <button 
              onClick={toggleMissionMock}
              className="w-full py-4 text-white font-black text-lg rounded-2xl backdrop-blur-md bg-green-500/90 border border-t-green-400 border-b-green-700 shadow-[0_8px_32px_rgba(34,197,94,0.4)] hover:bg-green-600 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(34,197,94,0.5)] active:translate-y-0 active:shadow-none transition-all"
            >
              ACCEPT & START TRIP
            </button>
          </div>
        )}

        {missionState === 'NAVIGATING' && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4 z-10 animate-in fade-in duration-500 pointer-events-none">
            <div className="backdrop-blur-2xl bg-white/90 dark:bg-gray-900/90 p-6 rounded-3xl border border-white/60 dark:border-gray-700/50 shadow-[0_16px_64px_rgba(0,0,0,0.2)] max-w-lg w-full pointer-events-auto">
              
              {/* Next Maneuver */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-4 mb-4 flex items-center shadow-inner animate-in slide-in-from-top-4">
                <div className="text-4xl mr-4 drop-shadow-sm">⤴️</div>
                <div>
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">Next Maneuver</div>
                  <div className="font-black text-gray-900 dark:text-white text-lg leading-tight">In 200m, keep right onto JC Road</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {/* ETA Ring */}
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-800" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" 
                        className="text-blue-500 transition-all duration-1000 ease-linear" 
                        strokeDasharray="175.9" 
                        strokeDashoffset={175.9 - (Math.min(eta, 4) / 4) * 175.9} 
                        strokeLinecap="round" />
                    </svg>
                    <div className="font-black text-xl text-gray-900 dark:text-white flex items-end">
                      {eta}<span className="text-xs ml-0.5 mb-0.5">m</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest">Est. Time</p>
                    <p className="font-black text-gray-900 dark:text-white text-sm">Traffic clear</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    success('Arrived at Victoria Hospital. Mission Complete.');
                    setMissionState('WAITING');
                  }}
                  className="px-6 py-3.5 rounded-2xl font-black bg-green-500 hover:bg-green-600 text-white shadow-[0_8px_32px_rgba(34,197,94,0.4)] hover:-translate-y-1 transition-all active:scale-95"
                >
                  ✓ ARRIVED
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
