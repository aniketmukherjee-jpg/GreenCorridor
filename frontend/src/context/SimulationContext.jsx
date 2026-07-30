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
  route1: [[12.972394, 77.614917], [12.972394, 77.614917], [12.972498, 77.614937], [12.972618, 77.614963], [12.972846, 77.61501], [12.972902, 77.615022], [12.972979, 77.615037], [12.973341, 77.61511], [12.973385, 77.61512], [12.973408, 77.615018], [12.973551, 77.614383], [12.973602, 77.614166], [12.973616, 77.614107], [12.973628, 77.614058], [12.973646, 77.613976], [12.97365, 77.61396], [12.973658, 77.613926], [12.973684, 77.613826], [12.973787, 77.61386], [12.973864, 77.613885], [12.974129, 77.613972], [12.974261, 77.614015], [12.975195, 77.614322], [12.975226, 77.614333], [12.975276, 77.614349], [12.975298, 77.614286], [12.975335, 77.614175], [12.975481, 77.613737], [12.975606, 77.613334], [12.97565, 77.613201], [12.975768, 77.612847], [12.976104, 77.611832], [12.976116, 77.611798], [12.976278, 77.611307], [12.976803, 77.60973], [12.977084, 77.608882], [12.977122, 77.608772], [12.977155, 77.608672], [12.977188, 77.608566], [12.977222, 77.60846], [12.977382, 77.60797], [12.977465, 77.607707], [12.977505, 77.607591], [12.977542, 77.607479], [12.977705, 77.606971], [12.977803, 77.606669], [12.977814, 77.606635], [12.977845, 77.606545], [12.977856, 77.606513], [12.97808, 77.605859], [12.978219, 77.605429], [12.97839, 77.604902], [12.979019, 77.602968], [12.979131, 77.602623], [12.979143, 77.602584], [12.979154, 77.602552], [12.97917, 77.602501], [12.979205, 77.602388], [12.979229, 77.602317], [12.979265, 77.602206], [12.979373, 77.601883], [12.979682, 77.600952], [12.980401, 77.598744], [12.980432, 77.598645], [12.980483, 77.598493], [12.980502, 77.59845], [12.980559, 77.598315], [12.98068, 77.598042], [12.980825, 77.597593], [12.98084, 77.597549], [12.980895, 77.5974], [12.980976, 77.597172], [12.981029, 77.597059], [12.981079, 77.597015], [12.981095, 77.59699], [12.981117, 77.596956], [12.981143, 77.596914], [12.981314, 77.596411], [12.981354, 77.596293], [12.981457, 77.595949], [12.981473, 77.595902], [12.981478, 77.595886], [12.981514, 77.595765], [12.98153, 77.595721], [12.981559, 77.595635], [12.981797, 77.594961], [12.9818, 77.594952], [12.981811, 77.594921], [12.981859, 77.594783], [12.981736, 77.594663], [12.981018, 77.593965], [12.980911, 77.593863], [12.980847, 77.593806], [12.98079, 77.593754], [12.980607, 77.593572], [12.980385, 77.593363], [12.980209, 77.593194], [12.980032, 77.593021], [12.979842, 77.592839], [12.979742, 77.592743], [12.979641, 77.592645], [12.979179, 77.592197], [12.977887, 77.590953], [12.977858, 77.590928], [12.977739, 77.590828], [12.977704, 77.590783], [12.977554, 77.590586], [12.977386, 77.590295], [12.977223, 77.589991], [12.976837, 77.589272], [12.976803, 77.589207], [12.976566, 77.588743], [12.976559, 77.588728], [12.976425, 77.58844], [12.976383, 77.588348], [12.976264, 77.588092], [12.976183, 77.587948], [12.976103, 77.587834], [12.975915, 77.587632], [12.975886, 77.587575], [12.975871, 77.587549], [12.975816, 77.58744], [12.975808, 77.587439], [12.975773, 77.587421], [12.975746, 77.587407], [12.975699, 77.587355], [12.975671, 77.58729], [12.975667, 77.587219], [12.975684, 77.587157], [12.975476, 77.587052], [12.97511, 77.586907], [12.974495, 77.586667], [12.974425, 77.586641], [12.974189, 77.586572], [12.974071, 77.586556], [12.973985, 77.586551], [12.973346, 77.586633], [12.973241, 77.58665], [12.97313, 77.586668], [12.972938, 77.586698], [12.972701, 77.586733], [12.972595, 77.58675], [12.972521, 77.58676], [12.972241, 77.586797], [12.972207, 77.586802], [12.972018, 77.586826], [12.971441, 77.586901], [12.971411, 77.586904], [12.971301, 77.586918], [12.971285, 77.58692], [12.971237, 77.586928], [12.97082, 77.586992], [12.970337, 77.587054], [12.970186, 77.587072], [12.970037, 77.587092], [12.969867, 77.587118], [12.96977, 77.587131], [12.969334, 77.587193], [12.968962, 77.587245], [12.96882, 77.58726], [12.968463, 77.587305], [12.968245, 77.587332], [12.968195, 77.587339], [12.968152, 77.587344], [12.968126, 77.587346], [12.968066, 77.587361], [12.96806, 77.587363], [12.968031, 77.58738], [12.967958, 77.587431], [12.967823, 77.587606], [12.967806, 77.58771], [12.967797, 77.587877], [12.967784, 77.588116], [12.967776, 77.588255], [12.967612, 77.588386], [12.967536, 77.588407], [12.967486, 77.588418], [12.967448, 77.58842], [12.967384, 77.588424], [12.967334, 77.588417], [12.967247, 77.58834], [12.967198, 77.588294], [12.967087, 77.588172], [12.966875, 77.587968], [12.966845, 77.587942], [12.966707, 77.587829], [12.966642, 77.587775], [12.966619, 77.587759], [12.96632, 77.587499], [12.965658, 77.586925], [12.965494, 77.586812], [12.96534, 77.586694], [12.964539, 77.58597], [12.964031, 77.585509], [12.964006, 77.585484], [12.963991, 77.58547], [12.963846, 77.585242], [12.963786, 77.585055], [12.963777, 77.585028], [12.963769, 77.584951], [12.963738, 77.584734], [12.96369, 77.58448], [12.963643, 77.584203], [12.963586, 77.583932], [12.963502, 77.583326], [12.963429, 77.582745], [12.963374, 77.582361], [12.963377, 77.582003], [12.963392, 77.581873], [12.963383, 77.581585], [12.963414, 77.581124], [12.963452, 77.580724], [12.963529, 77.579805], [12.963544, 77.57884], [12.963545, 77.578717], [12.963571, 77.578441], [12.963625, 77.578232], [12.963721, 77.577987], [12.963912, 77.577465], [12.963868, 77.5774], [12.963823, 77.577374], [12.963663, 77.577337], [12.963605, 77.577331], [12.963461, 77.577317], [12.963361, 77.577333], [12.962922, 77.577488], [12.96287, 77.577502], [12.96239, 77.577627], [12.962294, 77.577652], [12.961933, 77.577687], [12.961642, 77.577715], [12.961558, 77.577716], [12.96146, 77.577714], [12.960748, 77.577682], [12.960437, 77.577668], [12.960254, 77.57766], [12.960091, 77.577662], [12.960014, 77.577663], [12.959842, 77.577665], [12.959743, 77.577663], [12.9597, 77.577663], [12.95913, 77.577654], [12.959087, 77.577653], [12.959031, 77.577652], [12.959045, 77.577526], [12.959071, 77.577053], [12.959206, 77.576516], [12.959263, 77.576325], [12.959314, 77.576186], [12.959331, 77.576141], [12.959377, 77.575975], [12.959443, 77.575739], [12.959533, 77.575417], [12.9596, 77.575177], [12.959698, 77.574742], [12.959711, 77.574699], [12.959724, 77.574655], [12.95973, 77.574576], [12.959754, 77.574498], [12.959792, 77.574511], [12.95982, 77.574523], [12.959902, 77.57459], [12.959996, 77.574618], [12.960451, 77.57476], [12.960756, 77.574875], [12.961109, 77.57503], [12.961211, 77.575089], [12.961439, 77.57522], [12.961526, 77.575278], [12.961763, 77.575428]],
  route2: [[12.990089, 77.594939], [12.990042, 77.594867], [12.989914, 77.594739], [12.989856, 77.594689], [12.989727, 77.594576], [12.989628, 77.594488], [12.989462, 77.594349], [12.989153, 77.594063], [12.988804, 77.5937], [12.988764, 77.593645], [12.98889, 77.593545], [12.989067, 77.593403], [12.989138, 77.593342], [12.989293, 77.593195], [12.989351, 77.59313], [12.98952, 77.59296], [12.989527, 77.592954], [12.989543, 77.592939], [12.989544, 77.592936], [12.989658, 77.592823], [12.989558, 77.59277], [12.989431, 77.592684], [12.989398, 77.592654], [12.988846, 77.592141], [12.988727, 77.592038], [12.988629, 77.591958], [12.98852, 77.591869], [12.988398, 77.591769], [12.988287, 77.591679], [12.988231, 77.591632], [12.988218, 77.59162], [12.988179, 77.591584], [12.988019, 77.591448], [12.987984, 77.591417], [12.987822, 77.591279], [12.987774, 77.591234], [12.987658, 77.591125], [12.987537, 77.591013], [12.987365, 77.590861], [12.986971, 77.590507], [12.98615, 77.589737], [12.98608, 77.589661], [12.986046, 77.589631], [12.98598, 77.589581], [12.985893, 77.589485], [12.985651, 77.589218], [12.985588, 77.58915], [12.985209, 77.588774], [12.984927, 77.588502], [12.98486, 77.588458], [12.98483, 77.588438], [12.984773, 77.588402], [12.984736, 77.588368], [12.984688, 77.588324], [12.984514, 77.588219], [12.984361, 77.58808], [12.984251, 77.588015], [12.984192, 77.587986], [12.983003, 77.58747], [12.982847, 77.587408], [12.98275, 77.587364], [12.982459, 77.587234], [12.982339, 77.587176], [12.982126, 77.587017], [12.981813, 77.586818], [12.981769, 77.586791], [12.981702, 77.586746], [12.981666, 77.586727], [12.981648, 77.586718], [12.981622, 77.586699], [12.980584, 77.586025], [12.980032, 77.585677], [12.979683, 77.585457], [12.979638, 77.585428], [12.979356, 77.585256], [12.979168, 77.585133], [12.979119, 77.585101], [12.978955, 77.584998], [12.978886, 77.584954], [12.978846, 77.584929], [12.978742, 77.584937], [12.978399, 77.584758], [12.978114, 77.584609], [12.977996, 77.584584], [12.977908, 77.584579], [12.977834, 77.5846], [12.977336, 77.585323], [12.977188, 77.585538], [12.977182, 77.585548], [12.977154, 77.585588], [12.977017, 77.585789], [12.976898, 77.585958], [12.976859, 77.586015], [12.976834, 77.586054], [12.976597, 77.586427], [12.976421, 77.586667], [12.976224, 77.586934], [12.976176, 77.586996], [12.976158, 77.58702], [12.976137, 77.58705], [12.976095, 77.587095], [12.976041, 77.587143], [12.976063, 77.587203], [12.976065, 77.587268], [12.976044, 77.587336], [12.976012, 77.587381], [12.976003, 77.587393], [12.975945, 77.587431], [12.975917, 77.587438], [12.975877, 77.587447], [12.975816, 77.58744], [12.975808, 77.587439], [12.975773, 77.587421], [12.975746, 77.587407], [12.975699, 77.587355], [12.975671, 77.58729], [12.975667, 77.587219], [12.975684, 77.587157], [12.975476, 77.587052], [12.97511, 77.586907], [12.974495, 77.586667], [12.974425, 77.586641], [12.974189, 77.586572], [12.974071, 77.586556], [12.973985, 77.586551], [12.973346, 77.586633], [12.973241, 77.58665], [12.97313, 77.586668], [12.972938, 77.586698], [12.972701, 77.586733], [12.972595, 77.58675], [12.972521, 77.58676], [12.972241, 77.586797], [12.972207, 77.586802], [12.972018, 77.586826], [12.971441, 77.586901], [12.971411, 77.586904], [12.971301, 77.586918], [12.971285, 77.58692], [12.971237, 77.586928], [12.97082, 77.586992], [12.970337, 77.587054], [12.970186, 77.587072], [12.970037, 77.587092], [12.969867, 77.587118], [12.96977, 77.587131], [12.969334, 77.587193], [12.968962, 77.587245], [12.96882, 77.58726], [12.968463, 77.587305], [12.968245, 77.587332], [12.968195, 77.587339], [12.968152, 77.587344], [12.968126, 77.587346], [12.968066, 77.587361], [12.96806, 77.587363], [12.968031, 77.58738], [12.967958, 77.587431], [12.967823, 77.587606], [12.967806, 77.58771], [12.967797, 77.587877], [12.967784, 77.588116], [12.967776, 77.588255], [12.967612, 77.588386], [12.967536, 77.588407], [12.967486, 77.588418], [12.967448, 77.58842], [12.967384, 77.588424], [12.967334, 77.588417], [12.967247, 77.58834], [12.967198, 77.588294], [12.967087, 77.588172], [12.966875, 77.587968], [12.966845, 77.587942], [12.966707, 77.587829], [12.966642, 77.587775], [12.966619, 77.587759], [12.96632, 77.587499], [12.965658, 77.586925], [12.965494, 77.586812], [12.96534, 77.586694], [12.964539, 77.58597], [12.964031, 77.585509], [12.964006, 77.585484], [12.963991, 77.58547], [12.963846, 77.585242], [12.963786, 77.585055], [12.963777, 77.585028], [12.963769, 77.584951], [12.963738, 77.584734], [12.96369, 77.58448], [12.963643, 77.584203], [12.963586, 77.583932], [12.963502, 77.583326], [12.963429, 77.582745], [12.963374, 77.582361], [12.963377, 77.582003], [12.963392, 77.581873], [12.963383, 77.581585], [12.963414, 77.581124], [12.963452, 77.580724], [12.963529, 77.579805], [12.963544, 77.57884], [12.963545, 77.578717], [12.963571, 77.578441], [12.963625, 77.578232], [12.963721, 77.577987], [12.963912, 77.577465], [12.963868, 77.5774], [12.963823, 77.577374], [12.963663, 77.577337], [12.963605, 77.577331], [12.963461, 77.577317], [12.963361, 77.577333], [12.962922, 77.577488], [12.96287, 77.577502], [12.96239, 77.577627], [12.962294, 77.577652], [12.961933, 77.577687], [12.961642, 77.577715], [12.961558, 77.577716], [12.96146, 77.577714], [12.960748, 77.577682], [12.960437, 77.577668], [12.960254, 77.57766], [12.960091, 77.577662], [12.960014, 77.577663], [12.959842, 77.577665], [12.959743, 77.577663], [12.9597, 77.577663], [12.95913, 77.577654], [12.959087, 77.577653], [12.959031, 77.577652], [12.959045, 77.577526], [12.959071, 77.577053], [12.959206, 77.576516], [12.959263, 77.576325], [12.959314, 77.576186], [12.959331, 77.576141], [12.959377, 77.575975], [12.959443, 77.575739], [12.959533, 77.575417], [12.9596, 77.575177], [12.959698, 77.574742], [12.959711, 77.574699], [12.959724, 77.574655], [12.95973, 77.574576], [12.959754, 77.574498], [12.959792, 77.574511], [12.95982, 77.574523], [12.959902, 77.57459], [12.959996, 77.574618], [12.960451, 77.57476], [12.960756, 77.574875], [12.961109, 77.57503], [12.961211, 77.575089], [12.961439, 77.57522], [12.961526, 77.575278], [12.961763, 77.575428]]
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
