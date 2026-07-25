import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { useToast } from '../context/ToastContext';

const CinematicDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const navigate = useNavigate();
  const { startMission, setTrafficLights, addEvent } = useSimulation();
  const { success, info } = useToast();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPlaying(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    let steps = [
      { t: 0, action: () => {
          setCountdown(3);
          setCurrentStepText('Initializing Demo Sequence...');
          info('🎬 Cinematic Demo starting...');
      }},
      { t: 1000, action: () => setCountdown(2) },
      { t: 2000, action: () => setCountdown(1) },
      { t: 3000, action: () => {
          setCountdown(0);
          setCurrentStepText('Dispatching simultaneous units on global grid...');
          navigate('/');
          startMission('M-771', 'route1', '#ef4444');
          startMission('M-892', 'route2', '#eab308');
          addEvent('Demo: Multiple Dispatch', 'Dispatched M-771 and M-892 simultaneously');
      }},
      { t: 6000, action: () => {
          setCurrentStepText('Hospital: Monitoring AI Copilot suggestions...');
          navigate('/hospital');
          info('🎥 Showing Hospital Dispatch & AI Copilot');
      }},
      { t: 12000, action: () => {
          setCurrentStepText('Command Center: Waiting for manual override...');
          navigate('/police');
          info('🎥 Showing Police Command Center');
      }},
      { t: 15000, action: () => {
          setCurrentStepText('Command Center: Zero-Latency Corridor Activated!');
          // Clear all lights
          setTrafficLights(prev => prev.map(l => ({ ...l, status: 'green' })));
          success('⚡ Zero-Latency Corridor Activated globally.');
      }},
      { t: 22000, action: () => {
          setCurrentStepText('Unit M-771: Live Telemetry & Turn-by-turn Navigation...');
          navigate('/driver');
          info('🎥 Showing Driver Console');
      }},
      { t: 28000, action: () => {
          setCurrentStepText('Headquarters: Real-time network analytics...');
          navigate('/analytics');
          info('🎥 Showing Analytics Dashboard');
      }},
      { t: 34000, action: () => {
          setIsPlaying(false);
          setCurrentStepText('');
          success('🎬 Demo Mode Complete');
      }}
    ];

    const timeouts = steps.map(step => setTimeout(step.action, step.t));
    return () => timeouts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  if (!isPlaying) return null;

  return (
    <div className="fixed top-6 right-6 z-[99999] pointer-events-none flex flex-col items-end space-y-2">
      <div className="bg-black/80 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full font-bold flex items-center space-x-3 shadow-[0_0_30px_rgba(255,255,255,0.2)] animate-pulse">
        <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
        <span>CINEMATIC DEMO MODE ACTIVE</span>
        {countdown > 0 && <span className="text-red-400 font-black ml-2">{countdown}</span>}
      </div>
      {currentStepText && (
        <div className="bg-black/70 backdrop-blur-sm border border-white/10 text-gray-200 px-4 py-1.5 rounded-lg text-sm font-medium shadow-lg animate-in slide-in-from-right-4 fade-in max-w-sm text-right">
          {currentStepText}
        </div>
      )}
    </div>
  );
};

export default CinematicDemo;
