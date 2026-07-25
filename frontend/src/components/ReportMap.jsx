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
      // Simulate live incoming reports for demo
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
    <div className="h-[calc(100vh-5rem)] w-full relative z-0">
      
      {/* Map Filter Bar */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] w-11/12 max-w-4xl flex gap-2 overflow-x-auto p-2 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 shadow-sm border ${
              !showHeatmap && filter === cat 
                ? 'bg-green-500 text-white border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                : 'bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300 border-white/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-md'
            }`}
          >
            {cat === 'All' ? 'All Reports' : cat.replace('_', ' ').toUpperCase()}
          </button>
        ))}
        <button 
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 shadow-sm border ${
            showHeatmap 
              ? 'bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse' 
              : 'bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300 border-white/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-md'
          }`}
        >
          {showHeatmap ? '🔥 Hide Hotspots' : '🔥 Show Hotspot Heatmap'}
        </button>
      </div>

      <MapContainer center={[12.9716, 77.5946]} zoom={13} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {showHeatmap ? (
          reports.map(report => (
            (report.latitude || report.lat) && (report.longitude || report.lng) && (
              <Circle
                key={`heat-${report.id}`}
                center={[report.latitude || report.lat, report.longitude || report.lng]}
                radius={200 + (report.confirmation_count || 1) * 20}
                pathOptions={{
                  fillColor: report.severity === 'high' || report.severity === 'HIGH' ? '#ef4444' : report.severity === 'medium' || report.severity === 'MED' ? '#f97316' : '#eab308',
                  color: 'transparent',
                  fillOpacity: 0.45
                }}
              />
            )
          ))
        ) : (
          filteredReports.map((report) => (
            (report.latitude || report.lat) && (report.longitude || report.lng) && (
              <Marker key={report.id} position={[report.latitude || report.lat, report.longitude || report.lng]}>
                <Popup className="custom-popup">
                  <div className="w-64 -m-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
                    {report.photo_url && (
                      <div className="h-24 bg-gray-200 dark:bg-gray-800 w-full relative">
                        <div className="absolute inset-0 flex items-center justify-center text-3xl">📷</div>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-lg text-gray-900 dark:text-white capitalize leading-tight">{report.category.replace('_', ' ')}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          report.severity === 'high' || report.severity === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' :
                          report.severity === 'medium' || report.severity === 'MED' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                        }`}>
                          {report.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{report.description}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs font-bold text-gray-500 flex items-center">
                          <span className="mr-1">👍</span> {report.confirmation_count || 0}
                        </span>
                        <button 
                          onClick={() => handleConfirm(report.id)}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors active:scale-95"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))
        )}
      </MapContainer>
      
      {/* Dynamic Overlay UI */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[1000] backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 px-6 py-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/60 dark:border-gray-700/50 flex items-center space-x-3 pointer-events-none">
        <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] transition-colors duration-300 ${isSimulating ? 'bg-green-400' : 'bg-green-600'}`}></div>
        <span className="font-bold text-gray-800 dark:text-white tracking-wide">
          Live Reports: <span className="text-green-600 dark:text-green-400">{reports.length}</span>
        </span>
      </div>

      {/* FAB to Open Wizard */}
      <button 
        onClick={() => setIsWizardOpen(true)}
        className="absolute bottom-8 right-8 z-[1000] flex items-center space-x-3 backdrop-blur-md bg-green-500/90 border border-green-400 text-white px-6 py-4 rounded-full shadow-[0_8px_32px_rgba(34,197,94,0.4)] hover:bg-green-600 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(34,197,94,0.5)] transition-all font-black"
      >
        <span className="text-2xl leading-none">+</span>
        <span>Report Incident</span>
      </button>

      {isWizardOpen && (
        <IncidentWizard 
          onClose={() => setIsWizardOpen(false)} 
          onComplete={(newReport) => addReport(newReport)} 
        />
      )}
    </div>
  );
};

export default ReportMap;
