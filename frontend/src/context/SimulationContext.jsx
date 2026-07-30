import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { USE_MOCK_DATA, BACKEND_URL } from '../config';
import { mockReports } from '../mock/reports';
import L from 'leaflet';

// --- Road Graph Network Representation ---
export const NODES = {
  TRINITY: { id: 'TRINITY', name: 'Trinity Circle', pos: [12.9725, 77.6145] },
  MG_ROAD: { id: 'MG_ROAD', name: 'Anil Kumble Circle', pos: [12.9752, 77.6012] },
  CANTONMENT: { id: 'CANTONMENT', name: 'Cantonment', pos: [12.9850, 77.5900] },
  VIDHANA_SOUDHA: { id: 'VIDHANA_SOUDHA', name: 'Vidhana Soudha', pos: [12.9750, 77.5900] },
  HUDSON: { id: 'HUDSON', name: 'Hudson Circle', pos: [12.9688, 77.5875] },
  CORP_CIRCLE: { id: 'CORP_CIRCLE', name: 'Corporation Circle', pos: [12.9678, 77.5852] },
  TOWN_HALL: { id: 'TOWN_HALL', name: 'Town Hall', pos: [12.9658, 77.5815] },
  VICTORIA_HOSP: { id: 'VICTORIA_HOSP', name: 'Victoria Hospital', pos: [12.9625, 77.5742] }
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

export const HOSPITALS = [
  { id: 'H1', name: 'Victoria Hospital (Trauma Center)', pos: [12.9625, 77.5742], beds: '12 ICU Beds Available', isDestination: true },
  { id: 'H2', name: "St. Martha's Hospital", pos: [12.9695, 77.5940], beds: '8 ICU Beds Available', isDestination: false },
  { id: 'H3', name: 'Bowring & Lady Curzon Hospital', pos: [12.9820, 77.6050], beds: '15 ICU Beds Available', isDestination: false },
  { id: 'H4', name: "St. John's Medical Center", pos: [12.9340, 77.6220], beds: '20 ICU Beds Available', isDestination: false }
];

// Helper to generate dense street-following polyline points between anchor keypoints
const interpolateStreetPoints = (anchors, pointsPerSegment = 10) => {
  const dense = [];
  for (let i = 0; i < anchors.length - 1; i++) {
    const p1 = anchors[i];
    const p2 = anchors[i + 1];
    dense.push(p1);
    for (let k = 1; k < pointsPerSegment; k++) {
      const ratio = k / pointsPerSegment;
      dense.push([
        p1[0] + (p2[0] - p1[0]) * ratio,
        p1[1] + (p2[1] - p1[1]) * ratio
      ]);
    }
  }
  dense.push(anchors[anchors.length - 1]);
  return dense;
};

// Anchor waypoints matching exact Google Maps street driving turns
const ANCHORS_ROUTE1 = [
  [12.9725, 77.6145], // Trinity Circle Signal (MG Road East)
  [12.9735, 77.6100], // MG Road Metro Station
  [12.9745, 77.6050], // Brigade Road Junction Signal
  [12.9752, 77.6012], // Anil Kumble Circle Signal (MG Road West end)
  [12.9735, 77.6008], // Turn South onto St. Mark's Road
  [12.9715, 77.6002], // Residency Road Junction
  [12.9702, 77.5960], // Turn West onto Vittal Mallya Road (UB City)
  [12.9695, 77.5925], // Kasturba Road / St. Martha's Hospital
  [12.9688, 77.5875], // Hudson Circle Roundabout Signal
  [12.9678, 77.5852], // Corporation Circle
  [12.9658, 77.5815], // Turn South onto JC Road (Town Hall Signal)
  [12.9642, 77.5765], // KR Market Junction
  [12.9625, 77.5742]  // Victoria Hospital Emergency Entrance Gate
];

const ANCHORS_ROUTE2 = [
  [12.9850, 77.5900], // Cantonment Railway Station
  [12.9820, 77.5910], // Miller Road
  [12.9780, 77.5905], // Raj Bhavan Road
  [12.9750, 77.5900], // Vidhana Soudha Junction Signal
  [12.9720, 77.5892], // Ambedkar Veedhi / High Court
  [12.9688, 77.5875], // Hudson Circle Roundabout Signal
  [12.9658, 77.5815], // Town Hall Junction Signal
  [12.9625, 77.5742]  // Victoria Hospital Gate
];

export const REAL_STREET_ROUTES = {
  route1: interpolateStreetPoints(ANCHORS_ROUTE1, 10),
  route2: interpolateStreetPoints(ANCHORS_ROUTE2, 10)
};

// Calculate direction bearing angle (degrees 0-360)
export const calculateBearing = (p1, p2) => {
  if (!p1 || !p2 || !Array.isArray(p1) || !Array.isArray(p2) || (p1[0] === p2[0] && p1[1] === p2[1])) return 0;
  const dLng = (p2[1] - p1[1]) * Math.PI / 180;
  const lat1 = p1[0] * Math.PI / 180;
  const lat2 = p2[0] * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
};

// Helper to create tactical rotated ambulance Leaflet icon with dual strobes
export const createTacticalAmbulanceIcon = (heading = 0) => {
  const safeHeading = isNaN(heading) ? 0 : heading;
  return L.divIcon({
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; items-center; justify-center; transform: rotate(${safeHeading}deg); transition: transform 0.3s ease;">
        <!-- Forward Headlight Beam Cone -->
        <div style="position: absolute; top: -18px; left: 50%; transform: translateX(-50%); width: 28px; height: 24px; background: radial-gradient(ellipse at bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 80%); pointer-events: none;"></div>
        
        <!-- Emergency Vehicle Body SVG -->
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.6));">
          <!-- Main Chassis -->
          <rect x="10" y="4" width="20" height="32" rx="5" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
          <!-- Cabin Windshield -->
          <rect x="13" y="7" width="14" height="7" rx="2" fill="#38BDF8"/>
          <!-- Red Medical Emergency Cross -->
          <rect x="17" y="19" width="6" height="2" fill="#EF4444"/>
          <rect x="19" y="17" width="2" height="6" fill="#EF4444"/>
          <!-- Side Rear Mirrors -->
          <rect x="7" y="10" width="3" height="4" rx="1" fill="#334155"/>
          <rect x="30" y="10" width="3" height="4" rx="1" fill="#334155"/>
          <!-- Wheels -->
          <rect x="7" y="6" width="3" height="6" rx="1.5" fill="#0F172A"/>
          <rect x="30" y="6" width="3" height="6" rx="1.5" fill="#0F172A"/>
          <rect x="7" y="28" width="3" height="6" rx="1.5" fill="#0F172A"/>
          <rect x="30" y="28" width="3" height="6" rx="1.5" fill="#0F172A"/>
          <!-- Dual Strobe LED Lightbars -->
          <circle cx="15" cy="5" r="2.5" fill="#EF4444" style="animation: pulse 0.4s infinite alternate; filter: drop-shadow(0 0 6px #EF4444);"/>
          <circle cx="25" cy="5" r="2.5" fill="#3B82F6" style="animation: pulse 0.4s infinite alternate-reverse; filter: drop-shadow(0 0 6px #3B82F6);"/>
        </svg>
      </div>
    `,
    className: 'custom-tactical-ambulance-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
};

// Helper to create Traffic Signal Leaflet map icon showing live Red/Green status
export const createTrafficSignalIcon = (status = 'red', name = '') => {
  const isGreen = status === 'green';
  const glowColor = isGreen ? '#10B981' : '#EF4444';
  const greenOpacity = isGreen ? '1.0' : '0.2';
  const redOpacity = isGreen ? '0.2' : '1.0';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; items-center; justify-center; filter: drop-shadow(0 0 10px ${glowColor});">
        <!-- Live Status Pulsing Beacon -->
        <div style="position: absolute; top: -4px; left: -4px; width: 36px; height: 48px; border-radius: 12px; border: 2px solid ${glowColor}; opacity: 0.8; animation: ping 1.5s infinite;"></div>
        
        <!-- Traffic Light Box SVG -->
        <svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Metallic Box -->
          <rect x="2" y="2" width="24" height="36" rx="6" fill="#0F172A" stroke="#334155" stroke-width="2"/>
          <!-- Red Light Lens -->
          <circle cx="14" cy="9" r="4.5" fill="#EF4444" fill-opacity="${redOpacity}" stroke="#EF4444" stroke-width="1.5" style="${!isGreen ? 'filter: drop-shadow(0 0 8px #EF4444);' : ''}"/>
          <!-- Amber Light Lens -->
          <circle cx="14" cy="20" r="4.5" fill="#F59E0B" fill-opacity="0.2" stroke="#F59E0B" stroke-width="1.5"/>
          <!-- Green Light Lens -->
          <circle cx="14" cy="31" r="4.5" fill="#10B981" fill-opacity="${greenOpacity}" stroke="#10B981" stroke-width="1.5" style="${isGreen ? 'filter: drop-shadow(0 0 8px #10B981);' : ''}"/>
        </svg>
      </div>
    `,
    className: 'custom-traffic-signal-icon',
    iconSize: [28, 40],
    iconAnchor: [14, 20],
    popupAnchor: [0, -20],
  });
};

// Helper to create 3D Hospital Leaflet map icon with glowing badge
export const createHospitalIcon = (name = 'Hospital', isDestination = false) => {
  const color = isDestination ? '#EF4444' : '#0891B2';
  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; items-center; justify-center; filter: drop-shadow(0 0 12px ${color}); cursor: pointer;">
        ${isDestination ? `<div style="position: absolute; top: -6px; left: -6px; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #EF4444; animation: ping 1.2s infinite; opacity: 0.7;"></div>` : ''}
        
        <!-- 3D Hospital Building Badge SVG -->
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="24" height="24" rx="6" fill="#0F172A" stroke="${color}" stroke-width="2.5"/>
          <rect x="13" y="9" width="6" height="14" fill="${color}" rx="1"/>
          <rect x="9" y="13" width="14" height="6" fill="${color}" rx="1"/>
        </svg>
      </div>
    `,
    className: 'custom-hospital-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const haversineDistance = (p1, p2) => {
  if (!p1 || !p2) return 0;
  const R = 6371; 
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLng = (p2[1] - p1[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

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
        cameFrom[neighbor.id] = tentativeG;
        gScore[neighbor.id] = tentativeG;
        fScore[neighbor.id] = tentativeG + haversineDistance(NODES[neighbor.id].pos, NODES[targetId].pos);
        if (!openSet.includes(neighbor.id)) {
          openSet.push(neighbor.id);
        }
      }
    }
  }
  return null;
};

const calculateTotalDistance = (route) => {
  if (!route || !Array.isArray(route) || route.length < 2) return 1;
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const p1 = route[i];
    const p2 = route[i+1];
    if (p1 && p2 && !isNaN(p1[0]) && !isNaN(p2[0])) {
      total += Math.sqrt(Math.pow(p2[0]-p1[0], 2) + Math.pow(p2[1]-p1[1], 2));
    }
  }
  return total > 0 ? total : 1;
};

export const getPositionAndHeadingAtProgress = (progress, route, totalDist) => {
  const DEFAULT_POS = [12.9725, 77.6145];
  if (!route || !Array.isArray(route) || route.length === 0) return { position: DEFAULT_POS, heading: 0 };
  const validRoute = route.filter(pt => Array.isArray(pt) && pt.length >= 2 && !isNaN(pt[0]) && !isNaN(pt[1]));
  if (validRoute.length === 0) return { position: DEFAULT_POS, heading: 0 };
  if (validRoute.length === 1 || progress <= 0) return { position: validRoute[0], heading: calculateBearing(validRoute[0], validRoute[1] || validRoute[0]) };
  if (progress >= 1) return { position: validRoute[validRoute.length - 1], heading: calculateBearing(validRoute[validRoute.length - 2] || validRoute[0], validRoute[validRoute.length - 1]) };

  const dist = totalDist > 0 ? totalDist : calculateTotalDistance(validRoute);
  const targetDist = progress * dist;
  let currentDist = 0;

  for (let i = 0; i < validRoute.length - 1; i++) {
    const p1 = validRoute[i];
    const p2 = validRoute[i+1];
    const segmentDist = Math.sqrt(Math.pow(p2[0]-p1[0], 2) + Math.pow(p2[1]-p1[1], 2));
    
    if (currentDist + segmentDist >= targetDist) {
      const segmentProgress = segmentDist > 0 ? (targetDist - currentDist) / segmentDist : 0;
      const lat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
      const lng = p1[1] + (p2[1] - p1[1]) * segmentProgress;
      const heading = calculateBearing(p1, p2);
      return { position: [lat, lng], heading };
    }
    currentDist += segmentDist;
  }
  return { position: validRoute[validRoute.length - 1], heading: 0 };
};

// Heuristic Predictive ETA formula
const getPredictiveETA = (route, progress, reportsList, currentTime = new Date()) => {
  if (!route || !Array.isArray(route) || route.length < 2) return 5;
  const remainingRoute = route.slice(Math.floor(progress * route.length));
  if (remainingRoute.length < 2) return 1;

  const remainingDistDeg = calculateTotalDistance(remainingRoute);
  const remainingDistKm = remainingDistDeg * 130;
  const baseTimeMins = (remainingDistKm / 45) * 60;

  let timeOfDayFactor = 0;
  const hours = currentTime.getHours();
  const isPeak = (hours >= 8 && hours <= 10) || (hours >= 17 && hours <= 20);
  const isNight = hours >= 23 || hours < 6;

  if (isPeak) {
    timeOfDayFactor = 0.35;
  } else if (isNight) {
    timeOfDayFactor = -0.15;
  }

  let congestionFactor = 0;
  let incidentPenalty = 0;

  if (Array.isArray(reportsList)) {
    reportsList.forEach(report => {
      const rx = report.lat || report.latitude;
      const ry = report.lng || report.longitude;
      if (!rx || !ry) return;

      let isNearRoute = false;
      remainingRoute.forEach(pt => {
        if (pt && pt.length >= 2) {
          const dist = Math.sqrt((pt[0] - rx) ** 2 + (pt[1] - ry) ** 2);
          if (dist < 0.0045) isNearRoute = true;
        }
      });

      if (isNearRoute) {
        if (report.severity === 'high' || report.severity === 'HIGH') {
          incidentPenalty += 5.0;
          congestionFactor += 0.20;
        } else {
          incidentPenalty += 2.0;
          congestionFactor += 0.05;
        }
      }
    });
  }

  const finalETA = baseTimeMins * (1 + timeOfDayFactor + congestionFactor) + incidentPenalty;
  return Math.max(1, Math.ceil(finalETA));
};

const INITIAL_LIGHTS = [
  { id: 'L1', name: 'Trinity Signal', pos: [12.9725, 77.6145], status: 'red' },
  { id: 'L2', name: 'MG Road Junction', pos: [12.9745, 77.6050], status: 'red' },
  { id: 'L3', name: 'Anil Kumble Circle', pos: [12.9752, 77.6012], status: 'red' },
  { id: 'L4', name: 'Hudson Circle', pos: [12.9688, 77.5875], status: 'red' },
  { id: 'L5', name: 'Town Hall', pos: [12.9658, 77.5815], status: 'red' }
];

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  const [activeMissions, setActiveMissions] = useState([]); 
  const [trafficLights, setTrafficLights] = useState(INITIAL_LIGHTS);
  const [events, setEvents] = useState([]);
  const [legacyState, setLegacyState] = useState('WAITING');
  const [reports, setReports] = useState([]);
  const [trafficWeights, setTrafficWeights] = useState({});
  const { info, success } = useToast();

  const addEvent = useCallback((title, description, type = 'info') => {
    setEvents(prev => [{ id: Date.now() + Math.random(), title, description, type, time: new Date() }, ...prev]);
  }, []);

  const addReport = useCallback((newReport) => {
    setReports(prev => {
      if (prev.find(r => r.id === newReport.id)) return prev;
      return [newReport, ...prev];
    });
  }, []);

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
  }, [success, addEvent]);

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

  const startMission = (id = `M-${Math.floor(Math.random()*1000)}`, routeId = 'route1', color = '#10b981', priority = 'HIGH') => {
    const streetRoute = REAL_STREET_ROUTES[routeId] || REAL_STREET_ROUTES.route1;
    const totalDist = calculateTotalDistance(streetRoute);
    const initialETA = getPredictiveETA(streetRoute, 0, reports);
    const initialPosHeading = getPositionAndHeadingAtProgress(0, streetRoute, totalDist);
    
    setActiveMissions(prev => {
      if (prev.find(m => m.id === id)) return prev;
      return [...prev, {
        id,
        routeId,
        progress: 0,
        position: initialPosHeading.position || NODES.TRINITY.pos,
        heading: initialPosHeading.heading || 0,
        state: 'NAVIGATING',
        eta: initialETA || 5,
        priority,
        route: streetRoute,
        totalDist: totalDist || 1,
        color
      }];
    });
    
    addEvent('Mission Started', `Ambulance ${id} dispatched via Google Maps street route (${streetRoute.length} waypoints). Predictive ETA: ${initialETA} mins.`, 'info');
  };

  const endMission = (id) => {
    setActiveMissions(prev => prev.filter(m => m.id !== id));
    setLegacyState('WAITING');
    addEvent('Mission Completed', `Ambulance ${id} arrived at destination hospital.`, 'success');
    success(`Ambulance ${id} has reached destination.`);
  };

  const legacyMission = activeMissions[0] || { 
    state: legacyState, 
    progress: 0, 
    position: NODES.TRINITY.pos, 
    heading: 0,
    eta: 0, 
    route: REAL_STREET_ROUTES.route1
  };
  
  useEffect(() => {
    if (activeMissions.length === 0) return;

    const SIMULATION_SPEED = 0.008; 
    const TRIGGER_RADIUS = 0.004; 

    const interval = setInterval(() => {
      setActiveMissions(prevMissions => {
        let anyUpdated = false;
        const newMissions = prevMissions.map(mission => {
          if (!mission || mission.state !== 'NAVIGATING') return mission;
          
          anyUpdated = true;
          const nextProgress = mission.progress + SIMULATION_SPEED;
          
          if (nextProgress >= 1) {
            endMission(mission.id);
            return null; 
          }

          const { position: newPos, heading: newHeading } = getPositionAndHeadingAtProgress(nextProgress, mission.route, mission.totalDist);
          const newEta = getPredictiveETA(mission.route, nextProgress, reports);

          setTrafficLights(prevLights => {
            let lightsUpdated = false;
            const newLights = prevLights.map(light => {
              const approachingMissions = prevMissions.filter(m => {
                if (!m || m.state !== 'NAVIGATING' || !m.position) return false;
                const d = Math.sqrt(Math.pow(light.pos[0] - m.position[0], 2) + Math.pow(light.pos[1] - m.position[1], 2));
                return d < TRIGGER_RADIUS;
              });

              if (approachingMissions.length === 0) {
                return light;
              }

              if (approachingMissions.length === 1) {
                const singleAmb = approachingMissions[0];
                if (light.status !== 'green' || light.prioritizedFor !== singleAmb.id) {
                  lightsUpdated = true;
                  addEvent('Corridor Cleared 🟢', `${light.name} PREEMPTED to GREEN for ${singleAmb.id}`, 'success');
                  return { ...light, status: 'green', prioritizedFor: singleAmb.id };
                }
                return light;
              }

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
            heading: newHeading,
            eta: newEta
          };
        }).filter(Boolean);
        
        return anyUpdated ? newMissions : prevMissions;
      });
    }, 400);

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
      
      missionState: legacyMission.state,
      setMissionState: setLegacyState,
      progress: legacyMission.progress,
      ambulancePosition: legacyMission.position || NODES.TRINITY.pos,
      heading: legacyMission.heading || 0,
      route: legacyMission.route || REAL_STREET_ROUTES.route1,
      eta: legacyMission.eta || 0
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);
