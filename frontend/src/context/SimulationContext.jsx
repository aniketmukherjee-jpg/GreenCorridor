import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { USE_MOCK_DATA, BACKEND_URL } from '../config';
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

// Heuristic Predictive ETA formula (viva defendable)
const getPredictiveETA = (route, progress, reportsList, currentTime = new Date()) => {
  const remainingRoute = route.slice(Math.floor(progress * route.length));
  if (remainingRoute.length < 2) return 1;

  const remainingDistDeg = calculateTotalDistance(remainingRoute);
  // Conversion factor: coordinate degrees to actual km (1 degree ≈ 130 km in Bangalore grid)
  const remainingDistKm = remainingDistDeg * 130;

  // Base travel time: assuming 45 km/h base speed
  const baseTimeMins = (remainingDistKm / 45) * 60;

  // 1. Time-of-day multipliers
  let timeOfDayFactor = 0;
  const hours = currentTime.getHours();
  const isPeak = (hours >= 8 && hours <= 10) || (hours >= 17 && hours <= 20);
  const isNight = hours >= 23 || hours < 6;

  if (isPeak) {
    timeOfDayFactor = 0.35; // +35% during rush hour traffic
  } else if (isNight) {
    timeOfDayFactor = -0.15; // -15% at night with empty streets
  }

  // 2. Incident delay multipliers along the remaining route
  let congestionFactor = 0;
  let incidentPenalty = 0;

  reportsList.forEach(report => {
    const rx = report.lat || report.latitude;
    const ry = report.lng || report.longitude;
    if (!rx || !ry) return;

    let isNearRoute = false;
    remainingRoute.forEach(pt => {
      const dist = Math.sqrt((pt[0] - rx) ** 2 + (pt[1] - ry) ** 2);
      if (dist < 0.0045) isNearRoute = true; // within 500m
    });

    if (isNearRoute) {
      if (report.severity === 'high' || report.severity === 'HIGH') {
        incidentPenalty += 5.0; // add 5 minutes flat for major blockages
        congestionFactor += 0.20; // +20% congestion delay
      } else {
        incidentPenalty += 2.0; // add 2 minutes flat for minor blockages
        congestionFactor += 0.05; // +5% congestion delay
      }
    }
  });

  const finalETA = baseTimeMins * (1 + timeOfDayFactor + congestionFactor) + incidentPenalty;
  return Math.max(1, Math.ceil(finalETA));
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

  const addReport = useCallback((newReport) => {
    setReports(prev => {
      if (prev.find(r => r.id === newReport.id)) return prev;
      return [newReport, ...prev];
    });
    
    const isHigh = newReport.severity === 'high' || newReport.severity === 'HIGH';
    const isVerified = newReport.status === 'verified' || newReport.status === 'VERIFIED' || newReport.confirmation_count >= 5;
    
    if (isHigh && isVerified) {
      triggerRerouteForIncident(newReport);
    }
  }, []);

  // Fetch reports on mount
  useEffect(() => {
    if (USE_MOCK_DATA) {
      setReports(mockReports);
    } else {
      fetch(`${BACKEND_URL}/api/reports/`)
        .then(res => res.json())
        .then(data => setReports(data))
        .catch(err => console.error("Error loading API reports:", err));
    }
  }, []);

  // --- WebSocket Connection ---
  useEffect(() => {
    if (USE_MOCK_DATA) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = BACKEND_URL.replace(/^https?:/, wsProtocol) + '/ws/traffic/';
    
    console.log(`Connecting to WebSocket: ${wsUrl}`);
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connection established.');
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log('Received WebSocket message:', payload);
        
        if (payload.event === 'incident_created') {
          addReport(payload.data);
          info(`📢 Real-time Alert: New ${payload.data.category.replace('_', ' ').toUpperCase()} incident reported.`);
        } else if (payload.event === 'alert_escalated') {
          info(`🚨 ESCALATION: Alert for Mission #${payload.data.mission_id} escalated to ${payload.data.escalated_to_zone}!`);
          addEvent(
            'Escalation Warning ⚠️', 
            `Unacknowledged alert escalated from ${payload.data.original_zone} to closest adjacent zone: ${payload.data.escalated_to_zone}`, 
            'warning'
          );
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected.');
    };

    return () => {
      socket.close();
    };
  }, [addReport, info, addEvent]);

  // --- Escalation Background Polling ---
  useEffect(() => {
    if (USE_MOCK_DATA) return;

    const interval = setInterval(() => {
      fetch(`${BACKEND_URL}/api/police-alerts/check_escalations/`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.escalated_count > 0) {
            console.log(`Backend escalated ${data.escalated_count} alerts via API.`);
          }
        })
        .catch(err => console.error("Escalation check error:", err));
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

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

    if (closestEdge && minDistance < 0.0045) {
      const key = `${closestEdge.from}-${closestEdge.to}`;
      const revKey = `${closestEdge.to}-${closestEdge.from}`;
      
      const newWeights = { ...weights, [key]: 5.0, [revKey]: 5.0 };
      setTrafficWeights(newWeights);

      setActiveMissions(prevMissions => {
        let reroutedAny = false;
        const nextMissions = prevMissions.map(mission => {
          if (mission.state !== 'NAVIGATING') return mission;

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
                
                setTimeout(() => {
                  info(`🚨 Rerouting alert: Incident near active path! Recalculating path around segment: ${closestEdge.from} to ${closestEdge.to}`);
                  addEvent('Ambulance Rerouted', `Unit ${mission.id} dynamically bypassed segment ${closestEdge.from}-${closestEdge.to} via A*`, 'warning');
                }, 100);

                return {
                  ...mission,
                  route: newRouteCoords,
                  totalDist,
                  progress: 0, 
                  eta: getPredictiveETA(newRouteCoords, 0, reports)
                };
              }
            }
          }
          return mission;
        });
        return reroutedAny ? nextMissions : prevMissions;
      });
    }
  }, [trafficWeights, info, addEvent, reports]);

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
      fetch(`${BACKEND_URL}/api/reports/${id}/confirm/`, { method: 'POST' })
        .catch(err => console.error("Error posting confirmation:", err));
    }
  }, [success, addEvent, triggerRerouteForIncident]);

  const startMission = (id = `M-${Math.floor(Math.random()*1000)}`, routeId = 'route1', color = 'blue', priority = 'HIGH') => {
    let startNode = 'TRINITY';
    let endNode = 'VICTORIA_HOSP';

    if (routeId === 'route2') {
      startNode = 'CANTONMENT';
    }

    const nodePath = aStar(startNode, endNode, trafficWeights);
    const route = nodePath && nodePath.length > 0 ? getRouteCoordinates(nodePath) : (routeId === 'route2' ? getRouteCoordinates(['CANTONMENT', 'VIDHANA_SOUDHA', 'HUDSON', 'CORP_CIRCLE', 'VICTORIA_HOSP']) : getRouteCoordinates(['TRINITY', 'MG_ROAD', 'HUDSON', 'CORP_CIRCLE', 'TOWN_HALL', 'VICTORIA_HOSP']));
    const totalDist = calculateTotalDistance(route);
    const initialETA = getPredictiveETA(route, 0, reports);
    
    setActiveMissions(prev => {
      if (prev.find(m => m.id === id)) return prev;
      return [...prev, {
        id,
        routeId,
        progress: 0,
        position: route[0],
        state: 'NAVIGATING',
        eta: initialETA,
        priority,
        route,
        totalDist,
        color
      }];
    });
    
    addEvent('Mission Started', `Ambulance ${id} dispatched via optimal path: ${nodePath.join(' -> ')}. Predictive ETA: ${initialETA} mins.`, 'info');
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
          const newEta = getPredictiveETA(mission.route, nextProgress, reports);

          // Check traffic lights and execute Signal Conflict Resolution
          setTrafficLights(prevLights => {
            let lightsUpdated = false;
            const newLights = prevLights.map(light => {
              // Find all active ambulances near this traffic light
              const approachingMissions = prevMissions.filter(m => {
                if (m.state !== 'NAVIGATING') return false;
                const d = Math.sqrt(Math.pow(light.pos[0] - m.position[0], 2) + Math.pow(light.pos[1] - m.position[1], 2));
                return d < TRIGGER_RADIUS;
              });

              if (approachingMissions.length === 0) {
                return light; // keep status
              }

              if (approachingMissions.length === 1) {
                const singleAmb = approachingMissions[0];
                if (light.status !== 'green' || light.prioritizedFor !== singleAmb.id) {
                  lightsUpdated = true;
                  addEvent('Corridor Cleared', `${light.name} turned green for ${singleAmb.id}`, 'success');
                  return { ...light, status: 'green', prioritizedFor: singleAmb.id };
                }
                return light;
              }

              // Multi-ambulance preemption conflict at this intersection!
              // Priority hierarchy: CRITICAL (3) > HIGH (2) > MEDIUM (1)
              const weight = { 'CRITICAL': 3, 'HIGH': 2, 'MEDIUM': 1, 'unknown': 0 };
              const sortedMissions = [...approachingMissions].sort((a, b) => {
                const wA = weight[a.priority] || 2;
                const wB = weight[b.priority] || 2;
                return wB - wA;
              });

              const prioritized = sortedMissions[0];
              const blocked = sortedMissions.slice(1);

              if (light.status !== 'green' || light.prioritizedFor !== prioritized.id) {
                lightsUpdated = true;
                const blockedList = blocked.map(b => `${b.id} (${b.priority})`).join(', ');
                addEvent(
                  'Conflict Resolved ⚠️', 
                  `Signal prioritized for ${prioritized.id} (${prioritized.priority}) over blocked unit(s) [${blockedList}] at ${light.name}`, 
                  'warning'
                );
                return { ...light, status: 'green', prioritizedFor: prioritized.id };
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
  }, [activeMissions.length, addEvent, reports]);

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
