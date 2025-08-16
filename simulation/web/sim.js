
// ---------- Utilities (geo + random) ----------
const R = 6371.0;
function toRad(d){ return d*Math.PI/180;}
function toDeg(r){ return r*180/Math.PI;}
function haversineKm(lat1,lon1,lat2,lon2){
  const phi1=toRad(lat1), phi2=toRad(lat2);
  const dphi=toRad(lat2-lat1), dl=toRad(lon2-lon1);
  const a=Math.sin(dphi/2)**2 + Math.cos(phi1)*Math.cos(phi2)*Math.sin(dl/2)**2;
  return 2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function bearingDeg(lat1,lon1,lat2,lon2){
  const phi1=toRad(lat1), phi2=toRad(lat2), dl=toRad(lon2-lon1);
  const y=Math.sin(dl)*Math.cos(phi2);
  const x=Math.cos(phi1)*Math.sin(phi2)-Math.sin(phi1)*Math.cos(phi2)*Math.cos(dl);
  return (toDeg(Math.atan2(y,x))+360)%360;
}
function destinationPoint(lat,lon,brngDeg,distKm){
  const br=toRad(brngDeg), phi1=toRad(lat), lam1=toRad(lon), dR=distKm/R;
  const phi2=Math.asin(Math.sin(phi1)*Math.cos(dR) + Math.cos(phi1)*Math.sin(dR)*Math.cos(br));
  const lam2=lam1+Math.atan2(Math.sin(br)*Math.sin(dR)*Math.cos(phi1), Math.cos(dR)-Math.sin(phi1)*Math.sin(phi2));
  let lon2=toDeg(lam2); lon2=(lon2+540)%360-180;
  return {lat: toDeg(phi2), lon: lon2};
}
function randInt(a,b){ return Math.floor(a+Math.random()*(b-a+1)); }
function randFloat(a,b){ return a+Math.random()*(b-a); }

// Tick duration (seconds) – must be defined before initializeSimulation uses it
const TICK_SEC = 1.0;

// Major stations get longer dwells
const MAJOR_STATIONS = new Set(["NDLS","BCT","MAS","HWH","PNBE","LKO","SC","NGP","BPL","SBC","JP","ADI"]);

// Simple easing to emulate accel/brake visually
function easeInOutSine(t){ return 0.5 - 0.5*Math.cos(Math.PI*t); }

// Physics-based travel time with trapezoidal profile (m/s^2 acceleration)
function travelTimeSeconds(distanceKm, vMaxKmh, accel_ms2 = 0.35){
  const d = Math.max(0, distanceKm) * 1000; // meters
  const vmax = Math.max(5, vMaxKmh) * 1000/3600; // m/s
  const a = Math.max(0.1, accel_ms2); // m/s^2
  const tAcc = vmax / a; // s
  const dAcc = 0.5 * a * tAcc * tAcc; // m
  if (2*dAcc >= d){
    // Triangle profile, peak speed limited by distance
    const t = 2 * Math.sqrt(d / a);
    return t;
  }
  const dCruise = d - 2*dAcc;
  const tCruise = dCruise / vmax;
  return 2*tAcc + tCruise;
}

function segmentSpeedLimit(from, to, edges){
  const e = edges.find(e=>e.from===from && e.to===to) || edges.find(e=>e.from===to && e.to===from);
  return (e && e.vMax) ? e.vMax : 90;
}

// ---------- Network ----------
// Load stations from JSON file - will be populated dynamically
let STATIONS = [];

// Corridor speed limits (km/h) aligned with ROUTE_TEMPLATES order
// Golden Quadrilateral generally higher; branches lower
const CORRIDOR_SPEED_LIMITS = [
  120, // Delhi-Howrah main line
  120, // Delhi-Mumbai via Rajasthan
  110, // Mumbai-Chennai via Bangalore
  110, // Chennai-Delhi via Hyderabad
  100, // Kerala-Karnataka corridor
  90,  // TN east-west
  100, // Karnataka-Maharashtra
  95,  // Andhra-Telangana triangle
  100, // Central-Eastern
  100, // MP triangle
  110, // Delhi-Chandigarh
  100  // UP-Bihar connection
];

// Route templates used both for building the graph and scheduling (major IR corridors)
const ROUTE_TEMPLATES = [
  // Golden Quadrilateral - Main trunk routes
  ["NDLS", "CNB", "LKO", "GKP", "PNBE", "HWH"], // Delhi-Howrah main line
  ["NDLS", "JP", "ADI", "BCT"], // Delhi-Mumbai via Rajasthan
  ["BCT", "PUNE", "SBC", "MAS"], // Mumbai-Chennai via Bangalore
  ["MAS", "BZA", "SC", "NGP", "BPL", "NDLS"], // Chennai-Delhi via Hyderabad

  // South Indian Network
  ["TVC", "ERS", "CBE", "SBC"], // Kerala-Karnataka corridor
  ["CBE", "MAS"], // Tamil Nadu east-west
  ["SBC", "UBL", "PUNE"], // Karnataka-Maharashtra
  ["BZA", "SC", "KCG"], // Andhra-Telangana triangle

  // Central India Network
  ["NGP", "JBP", "RAIPUR", "HWH"], // Central-Eastern corridor
  ["BPL", "JBP", "NGP"], // MP triangle

  // Northern branches
  ["NDLS", "CDG"], // Delhi-Chandigarh
  ["LKO", "PNBE"], // UP-Bihar connection
];

// Load stations data
fetch('stations.json')
  .then(response => response.json())
  .then(data => {
    STATIONS = data;
    initializeSimulation();
  })
  .catch(error => {
    console.error('Error loading stations:', error);
    // Fallback to basic stations if file load fails
    STATIONS = [{ id: "NDLS", name: "New Delhi", lat: 28.6139, lon: 77.209, state: "Delhi" }];
    initializeSimulation();
  });

function buildEdges(index){
  const edges=[];
  function s(id){ return index[id]; }
  
  // Build bidirectional edges for each corridor
  ROUTE_TEMPLATES.forEach((corridor, corridorIndex) => {
    for (let i = 0; i < corridor.length - 1; i++) {
      const a = corridor[i], b = corridor[i + 1];
      if (s(a) && s(b)) {
        const A = s(a), B = s(b);
        const km = haversineKm(A.lat, A.lon, B.lat, B.lon);
        
        // Multiple tracks for major routes
        const trackCount = (corridorIndex < 4) ? 2 : 1; // Golden Quad gets double tracks
        
        const limit = CORRIDOR_SPEED_LIMITS[corridorIndex] || 90;
        for (let track = 1; track <= trackCount; track++) {
          edges.push({from: a, to: b, km, track_id: `${a}-${b}-T${track}`, corridor: corridorIndex, vMax: limit});
          edges.push({from: b, to: a, km, track_id: `${b}-${a}-T${track}`, corridor: corridorIndex, vMax: limit});
        }
      }
    }
  });
  
  return edges;
}
function buildGraph(edges){
  const g={};
  edges.forEach(e=>{ if(!g[e.from]) g[e.from] = []; g[e.from].push(e); });
  return g;
}

// ---------- Train Types and Realistic Data ----------
const TRAIN_TYPES = {
  RAJDHANI: { speedRange: [110, 130], name: 'Rajdhani Express', color: '#d62728' },
  SHATABDI: { speedRange: [100, 120], name: 'Shatabdi Express', color: '#ff7f0e' },
  SUPERFAST: { speedRange: [80, 110], name: 'Superfast Express', color: '#2ca02c' },
  EXPRESS: { speedRange: [60, 90], name: 'Express', color: '#1f77b4' },
  PASSENGER: { speedRange: [40, 70], name: 'Passenger', color: '#9467bd' },
  FREIGHT: { speedRange: [25, 50], name: 'Freight', color: '#8c564b' }
};

// Famous Indian Railway trains with realistic routes
const FAMOUS_TRAINS = [
  { no: '12301', name: 'Rajdhani Express', type: 'RAJDHANI', route: ['NDLS', 'CNB', 'LKO', 'PNBE', 'HWH'] },
  { no: '12002', name: 'Bhopal Shatabdi', type: 'SHATABDI', route: ['NDLS', 'BPL'] },
  { no: '12621', name: 'Tamil Nadu Express', type: 'SUPERFAST', route: ['NDLS', 'BPL', 'NGP', 'SC', 'MAS'] },
  { no: '16031', name: 'Andaman Express', type: 'EXPRESS', route: ['MAS', 'BZA', 'SC', 'NGP', 'BPL'] },
  { no: '19023', name: 'Firozpur Janata', type: 'EXPRESS', route: ['BCT', 'BPL', 'NDLS', 'CDG'] }
];

class Train{
  constructor(no, index, trainType = 'EXPRESS', routeStations = null){
    this.no = no;
    this.index = index;
    this.type = trainType;
    this.typeData = TRAIN_TYPES[trainType];
    this.name = this.generateTrainName();
    this.routeStations = routeStations; // array of station IDs in order
    this.schedule = []; // list of stops with Date times for next 12 months
    this.currentFrom = null; // station id
    this.currentTo = null; // station id
    this.edge = null; // current edge between from->to
    this.progressKm = 0; // along current edge
    this.speedKmh = randFloat(this.typeData.speedRange[0], this.typeData.speedRange[1]);
    this.lat = 0; this.lon = 0; this.bearing = 0;
  }
  generateTrainName() {
    const famous = FAMOUS_TRAINS.find(t => t.no === this.no);
    if (famous) return famous.name;
    const prefixes = ['Express', 'Passenger', 'Special', 'Mail', 'Fast'];
    const routes = Object.keys(this.index);
    const from = routes[randInt(0, routes.length - 1)];
    const to = routes[randInt(0, routes.length - 1)];
    return `${from}-${to} ${prefixes[randInt(0, prefixes.length - 1)]}`;
  }
}

// ---------- Timetable & Movement Engine ----------
const MS_PER_MIN = 60 * 1000;
const DAYS_365 = 365;
let SIM_TIME = new Date();
const TIME_SCALE = 120; // 1 sec = 2 minutes sim time

function dwellMinutes(trainType){
  // typical dwell times by type
  switch(trainType){
    case 'RAJDHANI': return 3;
    case 'SHATABDI': return 3;
    case 'SUPERFAST': return 4;
    case 'EXPRESS': return 5;
    case 'PASSENGER': return 6;
    case 'FREIGHT': return 10;
    default: return 5;
  }
}

function averageCruiseSpeed(type){
  const [a,b] = TRAIN_TYPES[type].speedRange;
  return (a + b) / 2; // km/h
}

function segmentKm(fromId, toId, index){
  const A=index[fromId], B=index[toId];
  return haversineKm(A.lat,A.lon,B.lat,B.lon);
}

function buildRouteEdgesFromStations(routeStations, edges){
  // returns array of {from,to,km}
  const list=[];
  for(let i=0;i<routeStations.length-1;i++){
    const from=routeStations[i], to=routeStations[i+1];
    // Prefer an actual edge if exists
    const e = edges.find(e=>e.from===from && e.to===to) || edges.find(e=>e.from===to && e.to===from);
    const km = e ? e.km : null;
    list.push({from,to,km});
  }
  return list;
}

function generateDailySchedule(train, index, edges){
  // Generate a daily schedule for next 12 months for this train over its routeStations
  const route = train.routeStations;
  if(!route || route.length < 2) return [];
  const legs = buildRouteEdgesFromStations(route, edges);
  const speed = averageCruiseSpeed(train.type); // km/h
  const dwell = dwellMinutes(train.type);
  // Filter out legs whose endpoints don't exist in index
  const validLegs = legs.filter(leg => index[leg.from] && index[leg.to]);
  if (validLegs.length === 0) return [];
  
  // Choose a base departure time each day (random hour slot to spread)
  const baseHour = randInt(0, 23);
  const baseMinute = [0,5,10,15,20,25,30,35,40,45,50,55][randInt(0,11)];
  
  const schedules=[];
  const startDate = new Date();
  startDate.setSeconds(0,0);
  for(let d=0; d<DAYS_365; d++){
    const dayStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+d, baseHour, baseMinute, 0, 0);
    let t = new Date(dayStart);
    // Build stops for this day
    const stops = [];
    stops.push({station: validLegs[0].from, arr: new Date(t), dep: new Date(t)});
    for(let i=0;i<validLegs.length;i++){
      const leg = validLegs[i];
      const km = leg.km ?? segmentKm(leg.from, leg.to, index);
      const vlim = Math.min(averageCruiseSpeed(train.type), segmentSpeedLimit(leg.from, leg.to, edges));
      const tSec = travelTimeSeconds(km, vlim, 0.35);
      const travelMin = tSec / 60; // minutes
      t = new Date(t.getTime() + travelMin*MS_PER_MIN);
      const arr = new Date(t);
      // Variable dwell: longer for major stations
      const extraDwell = MAJOR_STATIONS.has(leg.to) ? Math.max(5, Math.floor(dwell*0.5)) : 0;
      const thisDwell = (i === validLegs.length-1) ? 0 : (dwell + extraDwell) * MS_PER_MIN;
      const dep = new Date(arr.getTime() + thisDwell);
      stops.push({station: leg.to, arr, dep});
      t = new Date(dep);
    }
    schedules.push({ dayIndex: d, date: dayStart, stops });
  }
  return schedules;
}

function updateTrainBySchedule(train, index, edges, now){
  // Find today's schedule
  if(!train.schedule || train.schedule.length===0) return;
  const day0 = new Date(); day0.setHours(0,0,0,0);
  const dayIndex = Math.floor((now - day0) / (24*60*60*1000));
  const today = train.schedule.find(s => s.dayIndex === dayIndex);
  if(!today){ return; }
  // Find the current segment between two stops
  const stops = today.stops;
  let segIdx = -1;
  for(let i=0;i<stops.length-1;i++){
    const dep = stops[i].dep.getTime();
    const arr = stops[i+1].arr.getTime();
    const tnow = now.getTime();
    if(tnow >= dep && tnow <= arr){ segIdx = i; break; }
  }
  // If at a station (within dwell) or before/after service
  if(segIdx === -1){
    // Before first departure or between days: park at nearest stop
    // Choose last stop with time <= now
    let last = stops[0];
    for(const s of stops){ if(now >= s.dep) last = s; }
    const S = index[last.station];
    train.lat = S.lat; train.lon = S.lon; train.bearing = 0;
    train.currentFrom = last.station; train.currentTo = last.station;
    train.edge = null; train.progressKm = 0;
    return;
  }
  
  const fromSt = stops[segIdx];
  const toSt = stops[segIdx+1];
  const from = index[fromSt.station];
  const to = index[toSt.station];
  const totalMs = toSt.arr.getTime() - fromSt.dep.getTime();
  const elapsedMs = now.getTime() - fromSt.dep.getTime();
  const fracLin = Math.max(0, Math.min(1, elapsedMs / Math.max(totalMs, 1)));
  const frac = easeInOutSine(fracLin);
  const br = bearingDeg(from.lat, from.lon, to.lat, to.lon);
  const distKm = haversineKm(from.lat, from.lon, to.lat, to.lon);
  const pos = destinationPoint(from.lat, from.lon, br, frac * distKm);
  train.lat = pos.lat; train.lon = pos.lon; train.bearing = br;
  train.currentFrom = fromSt.station; train.currentTo = toSt.station;
  train.edge = { from: fromSt.station, to: toSt.station, km: distKm, track_id: `${fromSt.station}-${toSt.station}-T1` };
  train.progressKm = frac * distKm;
}

// ---------- Collision risk (15–20 min TTC) ----------
function predictCollision(a, b) {
  // Calculate current distance
  const d = haversineKm(a.lat, a.lon, b.lat, b.lon);
  
  // Calculate bearing difference to determine if trains are moving towards each other
  const bearingDiff = Math.abs(((a.bearing - b.bearing + 540) % 360) - 180);
  const isHeadOn = (bearingDiff < 60 || bearingDiff > 300);
  
  // Calculate relative speed (km/h)
  const relSpeed = isHeadOn 
    ? (a.speedKmh + b.speedKmh) 
    : Math.abs(a.speedKmh - b.speedKmh);
  
  // Time to collision in minutes
  const ttcMin = (d / Math.max(relSpeed, 0.1)) * 60.0;
  
  return {
    distance: d,
    isHeadOn,
    ttcMin,
    ttcFormatted: ttcMin < 60 
      ? `${Math.floor(ttcMin)}m ${Math.floor((ttcMin % 1) * 60)}s`
      : `${Math.floor(ttcMin / 60)}h ${Math.floor(ttcMin % 60)}m`
  };
}

function collisionRisks(trains, minMin=5, maxMin=30) {
  const risks = [];
  const byTrack = {};
  
  // Group trains by track
  trains.forEach(t => { 
    if (t.edge && t.edge.track_id) {
      (byTrack[t.edge.track_id] ??= []).push(t);
    }
  });
  
  // Check for potential collisions on each track
  for (const [track, group] of Object.entries(byTrack)) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i], b = group[j];
        const collision = predictCollision(a, b);
        
        // If collision is predicted within our time window
        if (collision.ttcMin >= minMin && collision.ttcMin <= maxMin) {
          risks.push({
            train1: a.no,
            train2: b.no,
            track: track,
            ttc: collision.ttcMin,
            ttcFormatted: collision.ttcFormatted,
            isHeadOn: collision.isHeadOn,
            distance: collision.distance
          });
        }
      }
    }
  }
  
  // Sort by time to collision (soonest first)
  return risks.sort((a, b) => a.ttc - b.ttc);
}
 

// ---------- Map Setup and Initialization ----------
let map, index, edges, trains = [], trainMarkers = new Map();

function initializeSimulation() {
  // Initialize map centered on India
  map = L.map('map').setView([20.5937, 78.9629], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, 
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Build network
  index = Object.fromEntries(STATIONS.map(s => [s.id, s]));
  edges = buildEdges(index);
  
  // Draw railway network with different colors for different corridors
  const corridorColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'];
  edges.forEach(e => {
    const A = index[e.from], B = index[e.to];
    const color = corridorColors[e.corridor % corridorColors.length] || '#95a5a6';
    const weight = (e.corridor < 4) ? 3 : 2; // Thicker lines for Golden Quadrilateral
    
    L.polyline([[A.lat, A.lon], [B.lat, B.lon]], {
      weight: weight,
      opacity: 0.7,
      color: color
    }).addTo(map).bindTooltip(`${e.from} - ${e.to} (${e.km.toFixed(0)} km)`, { sticky: true });
  });
  
  // Draw stations with state-based colors
  const stateColors = {
    'Kerala': '#e74c3c', 'Tamil Nadu': '#3498db', 'Karnataka': '#2ecc71',
    'Andhra Pradesh': '#f39c12', 'Telangana': '#9b59b6', 'Maharashtra': '#1abc9c',
    'Madhya Pradesh': '#34495e', 'Chhattisgarh': '#e67e22', 'West Bengal': '#8e44ad',
    'Bihar': '#27ae60', 'Uttar Pradesh': '#2980b9', 'Delhi': '#c0392b',
    'Rajasthan': '#d35400', 'Gujarat': '#16a085', 'Punjab': '#7f8c8d'
  };
  
  STATIONS.forEach(s => {
    const color = stateColors[s.state] || '#2b8a3e';
    L.circleMarker([s.lat, s.lon], {
      radius: 8,
      color: '#fff',
      fillColor: color,
      fillOpacity: 0.9,
      weight: 2
    }).addTo(map)
      .bindTooltip(`${s.id} – ${s.name}<br><small>${s.state}</small>`, { permanent: false });
  });
  
  // Initialize trains and schedules
  initTrains(100);

  // Start animation and simulated clock
  setInterval(() => {
    SIM_TIME = new Date(SIM_TIME.getTime() + TICK_SEC * 1000 * TIME_SCALE);
    var st = document.getElementById('simTime');
    if (st) st.innerText = SIM_TIME.toLocaleString();
    step();
  }, TICK_SEC * 1000);
}

// Trains will be initialized in initializeSimulation()
function initTrains(n = 100) {
  // Distribution of train types (realistic to Indian Railways)
  const typeDistribution = [
    { type: 'RAJDHANI', count: Math.floor(n * 0.05) }, // 5% premium trains
    { type: 'SHATABDI', count: Math.floor(n * 0.08) }, // 8% day trains
    { type: 'SUPERFAST', count: Math.floor(n * 0.25) }, // 25% superfast
    { type: 'EXPRESS', count: Math.floor(n * 0.45) }, // 45% regular express
    { type: 'PASSENGER', count: Math.floor(n * 0.12) }, // 12% passenger
    { type: 'FREIGHT', count: Math.floor(n * 0.05) } // 5% freight
  ];
  
  let trainCount = 0;
  
  // Create famous trains first
  FAMOUS_TRAINS.forEach((famousTrain, i) => {
    if (trainCount < n) {
      try{
        const t = new Train(famousTrain.no, index, famousTrain.type, famousTrain.route);
        t.name = famousTrain.name;
        t.schedule = generateDailySchedule(t, index, edges);
        trains.push(t);
        trainCount++;
      }catch(err){ console.error('Famous train init error', famousTrain.no, err); }
    }
  });
  
  // Fill remaining with distributed train types
  typeDistribution.forEach(({ type, count }) => {
    for (let i = 0; i < count && trainCount < n; i++) {
      const trainNo = String(10000 + trainCount + 1);
      // choose a route template, possibly subsegment to avoid too long routes
      const templ = ROUTE_TEMPLATES[randInt(0, ROUTE_TEMPLATES.length - 1)];
      const start = 0;
      const end = templ.length - 1;
      const subLen = Math.max(2, Math.min(templ.length, randInt(2, templ.length)));
      const startIdx = randInt(0, templ.length - subLen);
      const route = templ.slice(startIdx, startIdx + subLen);
      try{
        const t = new Train(trainNo, index, type, route);
        t.schedule = generateDailySchedule(t, index, edges);
        trains.push(t);
        trainCount++;
      }catch(err){ console.error('Train init error', trainNo, err); }
    }
  });
  
  // Create map markers for all trains
  trains.forEach(t => {
    // initialize position at first stop of today's schedule
    updateTrainBySchedule(t, index, edges, SIM_TIME);
    const color = t.typeData.color;
    const m = L.circleMarker([t.lat || 22.5, t.lon || 78.9], {
      radius: t.type === 'FREIGHT' ? 4 : 5,
      color: color,
      fillColor: color,
      fillOpacity: 0.8
    }).addTo(map)
      .bindTooltip(`${t.name} (#${t.no})\n${t.edge ? (t.edge.from+"→"+t.edge.to) : ''}\n${(t.speedKmh||0).toFixed(1)} km/h\nType: ${t.typeData.name}`, { permanent: false });
    trainMarkers.set(t.no, m);
  });
  
  var nt = document.getElementById('nTrains');
  if (nt) nt.textContent = String(trainCount);
}

// animate label
var tk = document.getElementById('tick');
if (tk) tk.textContent = TICK_SEC.toFixed(1) + "s";

function updateAlerts(risks) {
  const alertsDiv = document.getElementById('alerts');
  
  if (risks.length === 0) {
    alertsDiv.innerHTML = '<div style="color:#666; font-style:italic;">No collision threats detected</div>';
    return;
  }
  
  let alertsHtml = '';
  const alertedTrains = new Set();
  
  risks.forEach((risk, index) => {
    const timeLeft = risk.ttc < 1 ? 'IMMINENT' : `~${risk.ttcFormatted}`;
    const alertType = risk.ttc < 5 ? 'high' : 'medium';
    
    alertsHtml += `
      <div class="alert ${alertType}" style="margin-bottom:8px; padding:6px; border-radius:4px; background:#fff8f8; border-left:3px solid ${risk.ttc < 5 ? '#d62728' : '#ff9800'};">
        <div style="font-weight:bold; color:#d32f2f;">⚠️ COLLISION RISK DETECTED</div>
        <div>Trains <b>#${risk.train1}</b> and <b>#${risk.train2}</b></div>
        <div>Time to impact: <b>${timeLeft}</b></div>
        <div>Track: <b>${risk.track}</b> (${risk.isHeadOn ? 'Head-on' : 'Rear-end'} risk)</div>
        <div style="margin-top:4px; font-size:11px; color:#d32f2f;">
          <button onclick="alert('Alert sent to control center for Trains #${risk.train1} and #${risk.train2}. Emergency protocols initiated.')" 
                  style="background:#d32f2f; color:white; border:none; padding:2px 6px; border-radius:3px; cursor:pointer; font-size:11px;">
            EMERGENCY STOP
          </button>
        </div>
      </div>
    `;
    
    alertedTrains.add(risk.train1);
    alertedTrains.add(risk.train2);
  });
  
  alertsDiv.innerHTML = alertsHtml;
  return alertedTrains;
}

function step() {
  // Update trains by schedule and simulated time
  trains.forEach(t => {
    updateTrainBySchedule(t, index, edges, SIM_TIME);
  });
  
  // Detect collision risks (5-30 minute window)
  const risks = collisionRisks(trains, 5, 30);
  document.getElementById('nRisk').textContent = risks.length;
  
  // Update train markers and get alerted trains
  const alertedTrains = updateAlerts(risks);
  
  // Update markers
  trains.forEach(t => {
    const m = trainMarkers.get(t.no);
    const isRisk = alertedTrains && alertedTrains.has(t.no);
    const color = isRisk ? '#d62728' : (t.typeData?.color || '#1f77b4');
    m.setStyle({color, fillColor: color});
    m.setLatLng([t.lat, t.lon]);
    
    // Update tooltip with more info
    const riskInfo = risks.find(r => r.train1 === t.no || r.train2 === t.no);
    const riskText = riskInfo 
      ? `\n⚠️ COLLISION WARNING!\nTime to impact: ~${riskInfo.ttcFormatted}` 
      : '';
    const segText = t.edge ? `${t.edge.from}→${t.edge.to}` : 'At station';
    const content = `${t.name} (#${t.no})\n${segText}\n${t.speedKmh.toFixed(1)} km/h\nType: ${t.typeData.name}${riskText}`;
    const tt = m.getTooltip();
    if (tt && tt.setContent) tt.setContent(content); else m.bindTooltip(content, { permanent: false });
  });
}
// Animation will be started in initializeSimulation()

// ---------- Schedule Export ----------
function exportSchedules(){
  if (!Array.isArray(trains) || trains.length === 0) {
    alert('No trains initialized yet. Please wait a moment and try again.');
    return;
  }
  const payload = trains.map(t => ({
    no: t.no,
    name: t.name,
    type: t.type,
    route: t.routeStations,
    schedule: (t.schedule || []).map(day => ({
      date: day.date.toISOString(),
      stops: day.stops.map(s => ({ station: s.station, arr: s.arr.toISOString(), dep: s.dep.toISOString() }))
    }))
  }));
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'train_schedules.json';
  document.body.appendChild(a); a.click(); a.remove();
  // Also open a preview tab so you can view the schedules without relying on download behavior
  try { window.open(url, '_blank'); } catch (e) { /* ignore popup blockers */ }
  URL.revokeObjectURL(url);
}
window.exportSchedules = exportSchedules;
