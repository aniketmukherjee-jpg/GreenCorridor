import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { USE_MOCK_DATA } from '../config';
import { mockReports } from '../mock/reports';

// --- Road Graph Network Representation ---
export const NODES = {
  TRINITY: { id: 'TRINITY', name: 'Trinity Circle', pos: [12.9730, 77.6160] },
  MG_ROAD: { id: 'MG_ROAD', name: 'MG Road Metro', pos: [12.9715, 77.6000] },
  CANTONMENT: { id: 'CANTONMENT', name: 'Cantonment', pos: [12.9850, 77.5900] },
  VIDHANA_SOUDHA: { id: 'VIDHANA_SOUDHA', name: 'Vidhana Soudha', pos: [12.9750, 77.5900] },
  HUDSON: { id: 'HUDSON', name: 'Hudson Circle', pos: [12.9695, 77.5880] },
  CORP_CIRCLE: { id: 'CORP_CIRCLE', name: 'Corporation Circle', pos: [12.9685, 77.5850] },
  TOWN_HALL: { id: 'TOWN_HALL', name: 'Town Hall', pos: [12.9660, 77.5800] },
  VICTORIA_HOSP: { id: 'VICTORIA_HOSP', name: 'Victoria Hospital', pos: [12.9630, 77.5740] }
};

export const EDGES = [
  { from: 'TRINITY', to: 'MG_ROAD', baseDist: 1.8, weight: 1.0 },
  { from: 'MG_ROAD', to: 'VIDHANA_SOUDHA', baseDist: 1.2, weight: 1.0 },
  { from: 'MG_ROAD', to: 'HUDSON', baseDist: 1.5, weight: 1.0 },
  { from: 'CANTONMENT', to: 'VIDHANA_SOUDHA', baseDist: 1.1, weight: 1.0 },
  { from: 'VIDHANA_SOUDHA', to: 'HUDSON', baseDist: 0.9, weight: 1.0 },
  { from: 'HUDSON', to: 'CORP_CIRCLE', baseDist: 0.5, weight: 1.0 },
  { from: 'CORP_CIRCLE', to: 'TOWN_HALL', baseDist: 0.7, weight: 1.0 },
  { from: 'TOWN_HALL', to: 'VICTORIA_HOSP', baseDist: 0.8, weight: 1.0 },
  { from: 'CORP_CIRCLE', to: 'VICTORIA_HOSP', baseDist: 1.4, weight: 1.0 }
];

// Haversine Distance formula (as admissible heuristic for A*)
const haversineDistance = (p1, p2) => {
  const R = 6371; // Earth radius in km
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLng = (p2[1] - p1[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Distance from point P to line segment AB (Euclidean approximation for degrees)
const distanceToSegment = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) {
    return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  }
  const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  const clampedT = Math.max(0, Math.min(1, t));
  const closestX = ax + clampedT * dx;
  const closestY = ay + clampedT * dy;
  return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
};

// A* pathfinding algorithm implementation
export const aStar = (startId, targetId, trafficWeights = {}) => {
  const openSet = [startId];
  const cameFrom = {};
  
  const gScore = {};
  const fScore = {};
  
  Object.keys(NODES).forEach(nodeId => {
    gScore[nodeId] = Infinity;
    fScore[nodeId] = Infinity;
  });
  
  gScore[startId] = 0;
  fScore[startId] = haversineDistance(NODES[startId].pos, NODES[targetId].pos);
  
  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore[a] - fScore[b]);
    const current = openSet.shift();
    
    if (current === targetId) {
      const path = [];
      let temp = current;
      while (temp) {
        path.unshift(temp);
        temp = cameFrom[temp];
      }
      return path;
    }
    
    // Check outgoing segments
    const neighbors = EDGES.filter(e => e.from === current || e.to === current).map(e => {
      const neighborId = e.from === current ? e.to : e.from;
      const key = `${current}-${neighborId}`;
      const revKey = `${neighborId}-${current}`;
      const weight = trafficWeights[key] || trafficWeights[revKey] || e.weight;
      const cost = e.baseDist * weight;
      return { id: neighborId, cost };
    });
    
    for (let neighbor of neighbors) {
      const tentativeG = gScore[current] + neighbor.cost;
      if (tentativeG < gScore[neighbor.id]) {
        cameFrom[neighbor.id] = current;
        gScore[neighbor.id] = tentativeG;
        fScore[neighbor.id] = tentativeG + haversineDistance(NODES[neighbor.id].pos, NODES[targetId].pos);
        if (!openSet.includes(neighbor.id)) {
          openSet.push(neighbor.id);
        }
      }
    }
  }
  return null; // Path fallback
};

const getRouteCoordinates = (nodePath) => {
  return nodePath.map(nodeId => NODES[nodeId].pos);
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
  const [activeMissions, setActiveMissions] = useState([]); 
  const [trafficLights, setTrafficLights] = useState(INITIAL_LIGHTS);
  const [events, setEvents] = useState([]);
  const [legacyState, setLegacyState] = useState('WAITING');
  const [reports, setReports] = useState([]);
  const [trafficWeights, setTrafficWeights] = useState({});
  const { info, success, error } = useToast();

  const addEvent = useCallback((title, description, type = 'info') => {
    setEvents(prev => [{ id: Date.now() + Math.random(), title, description, type, time: new Date() }, ...prev]);
  }, []);

  // Fetch reports on mount
  useEffect(() => {
    if (USE_MOCK_DATA) {
      setReports(mockReports);
    } else {
      fetch('http://127.0.0.1:8000/api/reports/')
        .then(res => res.json())
        .then(data => setReports(data))
        .catch(err => console.error("Error loading API reports:", err));
    }
  }, []);

  // Recalculates paths automatically when new verified/high-severity reports affect them
  const triggerRerouteForIncident = useCallback((incident, customWeights) => {
    const weights = customWeights || trafficWeights;
    let closestEdge = null;
    let minDistance = Infinity;
    const px = incident.lat || incident.latitude;
    const py = incident.lng || incident.longitude;

    if (!px || !py) return;

    EDGES.forEach(edge => {
      const fromNode = NODES[edge.from];
      const toNode = NODES[edge.to];
      const dist = distanceToSegment(px, py, fromNode.pos[0], fromNode.pos[1], toNode.pos[0], toNode.pos[1]);
      if (dist < minDistance) {
        minDistance = dist;
        closestEdge = edge;
      }
    });

    // If within 500m (approx 0.0045 lat/lng degrees)
    if (closestEdge && minDistance < 0.0045) {
      const key = `${closestEdge.from}-${closestEdge.to}`;
      const revKey = `${closestEdge.to}-${closestEdge.from}`;
      
      const newWeights = { ...weights, [key]: 5.0, [revKey]: 5.0 };
      setTrafficWeights(newWeights);

      setActiveMissions(prevMissions => {
        let reroutedAny = false;
        const nextMissions = prevMissions.map(mission => {
          if (mission.state !== 'NAVIGATING') return mission;

          // Check if any point on active mission's route is near the incident
          let isNearRoute = false;
          mission.route.forEach(pt => {
            const ptDist = Math.sqrt((pt[0] - px) ** 2 + (pt[1] - py) ** 2);
            if (ptDist < 0.0045) isNearRoute = true;
          });

          if (isNearRoute) {
            const ambPos = mission.position;
            let nearestNodeId = null;
            let nearestDist = Infinity;

            Object.keys(NODES).forEach(nodeId => {
              const node = NODES[nodeId];
              const d = Math.sqrt((node.pos[0] - ambPos[0]) ** 2 + (node.pos[1] - ambPos[1]) ** 2);
              if (d < nearestDist) {
                nearestDist = d;
                nearestNodeId = nodeId;
              }
            });

            if (nearestNodeId && nearestNodeId !== 'VICTORIA_HOSP') {
              const newPath = aStar(nearestNodeId, 'VICTORIA_HOSP', newWeights);
              if (newPath && newPath.length > 0) {
                const newRouteCoords = [ambPos, ...getRouteCoordinates(newPath)];
                const totalDist = calculateTotalDistance(newRouteCoords);
                reroutedAny = true;
                
                // Add event delay to allow React state updates
                setTimeout(() => {
                  info(`🚨 Rerouting alert: Incident near active path! Recalculating path around segment: ${closestEdge.from} to ${closestEdge.to}`);
                  addEvent('Ambulance Rerouted', `Unit ${mission.id} dynamically bypassed segment ${closestEdge.from}-${closestEdge.to} via A*`, 'warning');
                }, 100);

                return {
                  ...mission,
                  route: newRouteCoords,
                  totalDist,
                  progress: 0, 
                  eta: Math.ceil(totalDist * 15 * 10)
                };
              }
            }
          }
          return mission;
        });
        return reroutedAny ? nextMissions : prevMissions;
      });
    }
  }, [trafficWeights, info, addEvent]);

  const addReport = useCallback((newReport) => {
    setReports(prev => [newReport, ...prev]);
    const isHigh = newReport.severity === 'high' || newReport.severity === 'HIGH';
    const isVerified = newReport.status === 'verified' || newReport.status === 'VERIFIED' || newReport.confirmation_count >= 5;
    
    if (isHigh && isVerified) {
      triggerRerouteForIncident(newReport);
    }
  }, [triggerRerouteForIncident]);

  const confirmReport = useCallback((id) => {
    success(`Report #${id} confirmed. Thank you!`);
    setReports(prev => {
      return prev.map(r => {
        if (r.id === id) {
          const newCount = (r.confirmation_count || 0) + 1;
          const updated = { ...r, confirmation_count: newCount };
          if (newCount >= 5 && (r.status === 'reported' || r.status === 'REPORTED')) {
            updated.status = 'VERIFIED';
            addEvent('Incident Verified', `Report #${id} has been crowd-verified (5+ confirmations)`, 'success');
            
            // Auto-trigger rerouting alerts
            if (r.severity === 'high' || r.severity === 'HIGH') {
              setTimeout(() => triggerRerouteForIncident(updated), 100);
            }
          }
          return updated;
        }
        return r;
      });
    });

    if (!USE_MOCK_DATA) {
      fetch(`http://127.0.0.1:8000/api/reports/${id}/confirm/`, { method: 'POST' })
        .catch(err => console.error("Error posting confirmation:", err));
    }
  }, [success, addEvent, triggerRerouteForIncident]);

  const startMission = (id = `M-${Math.floor(Math.random()*1000)}`, routeId = 'route1', color = 'blue') => {
    let startNode = 'TRINITY';
    let endNode = 'VICTORIA_HOSP';

    if (routeId === 'route2') {
      startNode = 'CANTONMENT';
    }

    const nodePath = aStar(startNode, endNode, trafficWeights);
    const route = nodePath && nodePath.length > 0 ? getRouteCoordinates(nodePath) : (routeId === 'route2' ? getRouteCoordinates(['CANTONMENT', 'VIDHANA_SOUDHA', 'HUDSON', 'CORP_CIRCLE', 'VICTORIA_HOSP']) : getRouteCoordinates(['TRINITY', 'MG_ROAD', 'HUDSON', 'CORP_CIRCLE', 'TOWN_HALL', 'VICTORIA_HOSP']));
    const totalDist = calculateTotalDistance(route);
    
    setActiveMissions(prev => {
      if (prev.find(m => m.id === id)) return prev;
      return [...prev, {
        id,
        routeId,
        progress: 0,
        position: route[0],
        state: 'NAVIGATING',
        eta: Math.ceil(totalDist * 15 * 10),
        route,
        totalDist,
        color
      }];
    });
    
    addEvent('Mission Started', `Ambulance ${id} dispatched via optimal path: ${nodePath.join(' -> ')}`, 'info');
  };

  const endMission = (id) => {
    setActiveMissions(prev => prev.filter(m => m.id !== id));
    setLegacyState('WAITING');
    addEvent('Mission Completed', `Ambulance ${id} arrived`, 'success');
    success(`Ambulance ${id} has reached the destination.`);
  };

  // Keep a legacy single-mission state for DriverDashboard backward compatibility
  const legacyMission = activeMissions[0] || { 
    state: legacyState, 
    progress: 0, 
    position: NODES.TRINITY.pos, 
    eta: 0, 
    route: getRouteCoordinates(['TRINITY', 'MG_ROAD', 'HUDSON', 'CORP_CIRCLE', 'TOWN_HALL', 'VICTORIA_HOSP']) 
  };
  
  useEffect(() => {
    if (activeMissions.length === 0) return;

    const SIMULATION_SPEED = 0.02; 
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
            return null; 
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
  }, [activeMissions.length, addEvent]);

  return (
    <SimulationContext.Provider value={{
      activeMissions,
      trafficLights,
      setTrafficLights,
      events,
      addEvent,
      startMission,
      endMission,
      reports,
      addReport,
      confirmReport,
      trafficWeights,
      setTrafficWeights,
      
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
