import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { USE_MOCK_DATA } from '../config';
import { useSimulation } from '../context/SimulationContext';
import IncidentWizard from './IncidentWizard';

// Fix for default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CATEGORIES = ['All', 'pothole', 'accident', 'waterlogging', 'road_closure', 'heavy_traffic'];

const ReportMap = () => {
  const { reports, confirmReport, addReport } = useSimulation();
  const [filter, setFilter] = useState('All');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      const interval = setInterval(() => {
        setIsSimulating(prev => !prev);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleConfirm = (id) => {
    confirmReport(id);
  };

  const filteredReports = filter === 'All' 
    ? reports 
    : reports.filter(r => r.category === filter);

  return (
    <div className="h-[calc(100vh-5rem)] w-full relative z-0 bg-slate-950">
      
      {/* Top Cyber Category Filter Pills */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[1000] w-11/12 max-w-4xl flex gap-2.5 overflow-x-auto p-2 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-2xl font-black text-xs transition-all duration-300 backdrop-blur-3xl border ${
              !showHeatmap && filter === cat 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 glow-emerald' 
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {cat === 'All' ? 'ALL INCIDENTS' : cat.replace('_', ' ').toUpperCase()}
          </button>
        ))}
        <button 
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`whitespace-nowrap px-4 py-2 rounded-2xl font-black text-xs transition-all duration-300 backdrop-blur-3xl border ${
            showHeatmap 
              ? 'bg-red-500/20 text-red-400 border-red-500/50 glow-red animate-pulse' 
              : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {showHeatmap ? '🔥 HIDE HOTSPOTS' : '🔥 SHOW HOTSPOT HEATMAP'}
        </button>
      </div>

      {/* GIS Leaflet Map Engine */}
      <MapContainer center={[12.9716, 77.5946]} zoom={13} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {showHeatmap ? (
          reports.map(report => (
            (report.latitude || report.lat) && (report.longitude || report.lng) && (
              <Circle
                key={`heat-${report.id}`}
                center={[report.latitude || report.lat, report.longitude || report.lng]}
                radius={250 + (report.confirmation_count || 1) * 30}
                pathOptions={{
                  fillColor: report.severity === 'high' || report.severity === 'HIGH' ? '#ef4444' : report.severity === 'medium' || report.severity === 'MED' ? '#f97316' : '#eab308',
                  color: 'transparent',
                  fillOpacity: 0.55
                }}
              />
            )
          ))
        ) : (
          filteredReports.map((report) => (
            (report.latitude || report.lat) && (report.longitude || report.lng) && (
              <Marker key={report.id} position={[report.latitude || report.lat, report.longitude || report.lng]}>
                <Popup className="custom-popup">
                  <div className="w-64 -m-3 bg-slate-900/95 backdrop-blur-3xl rounded-2xl border border-slate-700 p-4 text-white shadow-2xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-xs uppercase tracking-wider text-emerald-400">
                        {report.category ? report.category.replace('_', ' ') : 'Incident'}
                      </span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        report.severity === 'high' || report.severity === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        report.severity === 'medium' || report.severity === 'MED' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {report.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-3 font-semibold leading-relaxed">
                      {report.description || 'Reported blockage on grid route.'}
                    </p>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400">
                        👍 {report.confirmation_count || 1} Confirmations
                      </span>
                      <button 
                        onClick={() => handleConfirm(report.id)}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black rounded-lg transition-all"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))
        )}
      </MapContainer>

      {/* Floating Action Trigger for Reporting Incidents */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[1000]">
        <button 
          onClick={() => setIsWizardOpen(true)}
          className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center space-x-2"
        >
          <span>📢 REPORT ROAD INCIDENT</span>
        </button>
      </div>

      {/* Incident Wizard Modal */}
      {isWizardOpen && (
        <IncidentWizard 
          onClose={() => setIsWizardOpen(false)} 
          onSubmit={(data) => {
            addReport(data);
            setIsWizardOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ReportMap;
