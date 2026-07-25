import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

const IncidentWizard = ({ onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState(null);
  const [severity, setSeverity] = useState('medium');
  const [isDispatching, setIsDispatching] = useState(false);
  const { info, success, error } = useToast();

  const categories = [
    { id: 'accident', icon: '💥', label: 'Accident' },
    { id: 'pothole', icon: '🕳️', label: 'Pothole' },
    { id: 'waterlogging', icon: '🌊', label: 'Waterlogging' },
    { id: 'road_closure', icon: '🚧', label: 'Road Closure' },
  ];

  useEffect(() => {
    if (step === 1) {
      // Mock geolocation delay for effect
      const timer = setTimeout(() => {
        setLocation([12.9716, 77.5946]);
        info("Location detected.");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, info]);

  const handleDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      success('Ambulance dispatched! Help is on the way.');
      onComplete({
        id: `rep_${Date.now()}`,
        lat: location[0],
        lng: location[1],
        category,
        severity,
        description: `New ${category} reported by citizen`,
        confirmation_count: 1
      });
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/50 dark:border-gray-700/50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50 flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Report Incident</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-200/50 dark:bg-gray-800/50 flex items-center justify-center font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">✕</button>
        </div>

        {/* Wizard Body */}
        <div className="p-6">
          {isDispatching ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-ping"></div>
                <div className="absolute inset-4 border-4 border-blue-500/40 rounded-full animate-pulse"></div>
                <div className="text-5xl animate-bounce">🚑</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Dispatching nearest unit...</h3>
              <p className="text-gray-500 dark:text-gray-400">Connecting to hospital command center</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step Progress */}
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map(s => (
                  <div key={s} className="flex-1 flex items-center">
                    <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
                  </div>
                ))}
              </div>

              {/* Step 1: Location */}
              {step === 1 && (
                <div className="animate-in slide-in-from-right-4 fade-in">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="mr-2">📍</span> Confirm Location
                  </h3>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700 text-center">
                    {location ? (
                      <>
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-600 mb-4 shadow-inner">
                          <span className="text-2xl">✓</span>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white">Location Verified</p>
                        <p className="text-sm text-gray-500 mt-1">MG Road, Bangalore</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Acquiring GPS signal...</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Category */}
              {step === 2 && (
                <div className="animate-in slide-in-from-right-4 fade-in">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="mr-2">🚨</span> What's the emergency?
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 group ${
                          category === cat.id 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-[0_4px_20px_rgba(59,130,246,0.3)]' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                        <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Severity */}
              {step === 3 && (
                <div className="animate-in slide-in-from-right-4 fade-in">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-2">⚠️</span> Severity Level
                  </h3>
                  <div className="px-4">
                    <input 
                      type="range" 
                      min="1" max="3" step="1"
                      value={severity === 'low' ? 1 : severity === 'medium' ? 2 : 3}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSeverity(val === 1 ? 'low' : val === 2 ? 'medium' : 'high');
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between mt-4 font-bold text-xs uppercase tracking-wider">
                      <span className={`transition-colors ${severity === 'low' ? 'text-yellow-500' : 'text-gray-400'}`}>Low</span>
                      <span className={`transition-colors ${severity === 'medium' ? 'text-orange-500' : 'text-gray-400'}`}>Medium</span>
                      <span className={`transition-colors ${severity === 'high' ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>Critical</span>
                    </div>
                  </div>
                  
                  <div className={`mt-8 p-4 rounded-xl border ${
                    severity === 'low' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50 text-yellow-800 dark:text-yellow-400' :
                    severity === 'medium' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50 text-orange-800 dark:text-orange-400' :
                    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-400'
                  }`}>
                    <p className="text-sm font-medium text-center">
                      {severity === 'low' ? 'Non-critical hazard. Drive with caution.' :
                       severity === 'medium' ? 'Significant blockage. May require rerouting.' :
                       'CRITICAL EMERGENCY. Dispatching immediate response.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isDispatching && (
          <div className="p-6 border-t border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between">
            <button 
              onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
              className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button 
              disabled={step === 1 && !location || step === 2 && !category}
              onClick={() => {
                if (step < 3) setStep(s => s + 1);
                else handleDispatch();
              }}
              className="px-8 py-2.5 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-[0_4px_15px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:hover:bg-blue-500 transition-all active:scale-95"
            >
              {step === 3 ? 'Confirm & Dispatch' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentWizard;
