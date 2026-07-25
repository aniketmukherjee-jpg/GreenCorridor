import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

// --- Simulation Data ---
const ROUTES = {
  route1: [
    [12.9730, 77.6160], // Trinity Circle
    [12.9715, 77.6000], // MG Road Metro
    [12.9685, 77.5850], // Corporation Circle
    [12.9630, 77.5740], // Victoria Hospital
  ],
  route2: [
    [12.9850, 77.5900], // Cantonment
    [12.9750, 77.5900], // Vidhana Soudha
    [12.9685, 77.5850], // Corporation Circle
    [12.9630, 77.5740], // Victoria Hospital
  ]
};

const calculateTotalDistance = (route) => {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const p1 = route[i];
    const p2 = route[i+1];
    total += Math.sqrt(Math.pow(p2[0]-p1[0], 2) + Math.pow(p2[1]-p1[1], 2));
  }
  return total;
};

const INITIAL_LIGHTS = [
  { id: 'L1', name: 'Trinity Signal', pos: [12.9725, 77.6100], status: 'red' },
  { id: 'L2', name: 'MG Road Junction', pos: [12.9715, 77.6000], status: 'red' },
  { id: 'L3', name: 'Vidhana Soudha Junction', pos: [12.9750, 77.5900], status: 'red' },
  { id: 'L4', name: 'Hudson Circle', pos: [12.9695, 77.5880], status: 'red' },
  { id: 'L5', name: 'Town Hall', pos: [12.9660, 77.5800], status: 'red' }
];

const getPositionAtProgress = (progress, route, totalDist) => {
  if (progress <= 0) return route[0];
  if (progress >= 1) return route[route.length - 1];

  const targetDist = progress * totalDist;
  let currentDist = 0;

  for (let i = 0; i < route.length - 1; i++) {
    const p1 = route[i];
    const p2 = route[i+1];
    const segmentDist = Math.sqrt(Math.pow(p2[0]-p1[0], 2) + Math.pow(p2[1]-p1[1], 2));
    
    if (currentDist + segmentDist >= targetDist) {
      const segmentProgress = (targetDist - currentDist) / segmentDist;
      return [
        p1[0] + (p2[0] - p1[0]) * segmentProgress,
        p1[1] + (p2[1] - p1[1]) * segmentProgress
      ];
    }
    currentDist += segmentDist;
  }
  return route[route.length - 1];
};

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  const [activeMissions, setActiveMissions] = useState([]); // Array of { id, routeId, progress, position, state, eta, route, totalDist, color }
  const [trafficLights, setTrafficLights] = useState(INITIAL_LIGHTS);
  const [events, setEvents] = useState([]);
  const [legacyState, setLegacyState] = useState('WAITING');
  const { info, success } = useToast();

  const addEvent = (title, description, type = 'info') => {
    setEvents(prev => [{ id: Date.now() + Math.random(), title, description, type, time: new Date() }, ...prev]);
  };

  const startMission = (id = `M-${Math.floor(Math.random()*1000)}`, routeId = 'route1', color = 'blue') => {
    const route = ROUTES[routeId];
    const totalDist = calculateTotalDistance(route);
    
    setActiveMissions(prev => {
      // Don't add if already exists
      if (prev.find(m => m.id === id)) return prev;
      return [...prev, {
        id,
        routeId,
        progress: 0,
        position: route[0],
        state: 'NAVIGATING',
        eta: 15,
        route,
        totalDist,
        color
      }];
    });
    
    addEvent('Mission Started', `Ambulance ${id} dispatched`, 'info');
  };

  const endMission = (id) => {
    setActiveMissions(prev => prev.filter(m => m.id !== id));
    setLegacyState('WAITING');
    addEvent('Mission Completed', `Ambulance ${id} arrived`, 'success');
    success(`Ambulance ${id} has reached the destination.`);
  };

  // Keep a legacy single-mission state for DriverDashboard backward compatibility until updated
  const legacyMission = activeMissions[0] || { state: legacyState, progress: 0, position: ROUTES.route1[0], eta: 0, route: ROUTES.route1 };
  
  useEffect(() => {
    if (activeMissions.length === 0) return;

    const SIMULATION_SPEED = 0.02; // Roughly 50 ticks to finish
    const TRIGGER_RADIUS = 0.003; 

    const interval = setInterval(() => {
      setActiveMissions(prevMissions => {
        let anyUpdated = false;
        const newMissions = prevMissions.map(mission => {
          if (mission.state !== 'NAVIGATING') return mission;
          
          anyUpdated = true;
          const nextProgress = mission.progress + SIMULATION_SPEED;
          
          if (nextProgress >= 1) {
            endMission(mission.id);
            return null; // Will be filtered out
          }

          const newPos = getPositionAtProgress(nextProgress, mission.route, mission.totalDist);
          const newEta = Math.ceil((1 - nextProgress) * 15);

          // Check traffic lights for this ambulance
          setTrafficLights(prevLights => {
            let lightsUpdated = false;
            const newLights = prevLights.map(light => {
              if (light.status === 'green') return light; 
              
              const dist = Math.sqrt(Math.pow(light.pos[0] - newPos[0], 2) + Math.pow(light.pos[1] - newPos[1], 2));
              if (dist < TRIGGER_RADIUS) {
                lightsUpdated = true;
                addEvent('Corridor Cleared', `${light.name} turned green for ${mission.id}`, 'success');
                return { ...light, status: 'green' };
              }
              return light;
            });
            return lightsUpdated ? newLights : prevLights;
          });

          return {
            ...mission,
            progress: nextProgress,
            position: newPos,
            eta: newEta
          };
        }).filter(Boolean);
        
        return anyUpdated ? newMissions : prevMissions;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeMissions.length]); // Re-run effect if mission count changes

  return (
    <SimulationContext.Provider value={{
      activeMissions,
      trafficLights,
      setTrafficLights,
      events,
      addEvent,
      startMission,
      endMission,
      
      // Legacy exports for un-refactored components
      missionState: legacyMission.state,
      setMissionState: setLegacyState,
      progress: legacyMission.progress,
      ambulancePosition: legacyMission.position,
      route: legacyMission.route,
      eta: legacyMission.eta
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);
