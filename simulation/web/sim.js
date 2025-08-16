
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

// ---------- Network ----------
const STATIONS = [{"id": "BCT", "name": "Mumbai Central", "lat": 18.9718, "lon": 72.8194}, {"id": "BPL", "name": "Bhopal Junction", "lat": 23.2599, "lon": 77.4126}, {"id": "GWL", "name": "Gwalior Junction", "lat": 26.2183, "lon": 78.1828}, {"id": "AGC", "name": "Agra Cantt", "lat": 27.1767, "lon": 78.0081}, {"id": "NDLS", "name": "New Delhi", "lat": 28.6139, "lon": 77.209}, {"id": "LKO", "name": "Lucknow Junction", "lat": 26.8467, "lon": 80.9462}, {"id": "CNB", "name": "Kanpur Central", "lat": 26.4499, "lon": 80.3319}, {"id": "ALD", "name": "Prayagraj (Allahabad)", "lat": 25.4358, "lon": 81.8463}, {"id": "BSB", "name": "Varanasi Junction", "lat": 25.3176, "lon": 82.9739}, {"id": "JHS", "name": "Jhansi Junction", "lat": 25.4486, "lon": 78.5696}];

function buildEdges(index){
  const edges=[];
  const corridor=["BCT","BPL","GWL","AGC","NDLS","LKO","CNB","ALD","BSB"];
  function s(id){ return index[id]; }
  for (let i=0;i<corridor.length-1;i++){
    const a=corridor[i], b=corridor[i+1];
    const A=s(a), B=s(b);
    const km=haversineKm(A.lat,A.lon,B.lat,B.lon);
    edges.push({from:a,to:b,km,track_id:`${a}-${b}-T1`});
    edges.push({from:b,to:a,km,track_id:`${b}-${a}-T1`});
  }
  // branch: BPL <-> JHS and JHS <-> GWL
  [["BPL","JHS"],["JHS","GWL"]].forEach(([a,b])=>{
    const A=s(a), B=s(b);
    const km=haversineKm(A.lat,A.lon,B.lat,B.lon);
    edges.push({from:a,to:b,km,track_id:`${a}-${b}-T1`});
    edges.push({from:b,to:a,km,track_id:`${b}-${a}-T1`});
  });
  return edges;
}
function buildGraph(edges){
  const g={};
  edges.forEach(e=>{ (g[e.from]??=([])).push(e); });
  return g;
}

// ---------- Train ----------
class Train{
  constructor(no, edge, index, speedKmh){
    this.no=no;
    this.edge=edge;
    this.index=index;
    this.speedKmh=speedKmh;
    this.progressKm=randFloat(0, edge.km*0.8);
    const loc=this.locFromProgress();
    this.lat=loc.lat; this.lon=loc.lon; this.bearing=loc.bearing;
  }
  locFromProgress(){
    const A=this.index[this.edge.from], B=this.index[this.edge.to];
    const br=bearingDeg(A.lat,A.lon,B.lat,B.lon);
    const p=destinationPoint(A.lat,A.lon,br,this.progressKm);
    return {lat:p.lat, lon:p.lon, bearing: br};
  }
  step(dtSec, graph){
    const dist=this.speedKmh*(dtSec/3600.0);
    this.progressKm+=dist;
    if(this.progressKm>=this.edge.km){
      const overflow=this.progressKm-this.edge.km;
      const to=this.edge.to;
      const choices=(graph[to]?.filter(e=>e.to!==this.edge.from))||(graph[to]||[]);
      if(choices.length>0) this.edge=choices[randInt(0,choices.length-1)];
      this.progressKm=Math.min(overflow, this.edge.km*0.1);
    }
    const loc=this.locFromProgress();
    this.lat=loc.lat; this.lon=loc.lon; this.bearing=loc.bearing;
  }
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
    (byTrack[t.edge.track_id] ??= []).push(t); 
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
}

// ---------- Map Setup ----------
const map=L.map('map').setView([26.8,79.2], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom: 18, attribution: '&copy; OpenStreetMap'
}).addTo(map);

// draw network
const index = Object.fromEntries(STATIONS.map(s=>[s.id,s]));
const edges = buildEdges(index);
edges.forEach(e=>{
  const A=index[e.from], B=index[e.to];
  L.polyline([[A.lat,A.lon],[B.lat,B.lon]], {weight:2, opacity:0.6, color:'#aaa'}).addTo(map);
});
// stations
STATIONS.forEach(s=>{
  L.circleMarker([s.lat,s.lon], {radius:6, color:'#2b8a3e', fillColor:'#2b8a3e', fillOpacity:1}).addTo(map)
   .bindTooltip(`${s.id} – ${s.name}`, {permanent:false});
});

// init trains
const trains=[];
const trainMarkers=new Map();
function initTrains(n=30){
  for(let i=0;i<n;i++){
    const e=edges[randInt(0,edges.length-1)];
    const speed=randFloat(40,120);
    const t=new Train(String(10000+i+1), e, index, speed);
    trains.push(t);
    const m=L.circleMarker([t.lat,t.lon], {radius:5, color:'#1f77b4', fillColor:'#1f77b4', fillOpacity:1}).addTo(map)
      .bindTooltip(`Train ${t.no}\n${t.edge.from}→${t.edge.to}\n${t.speedKmh.toFixed(1)} km/h`, {permanent:false});
    trainMarkers.set(t.no, m);
  }
  document.getElementById('nTrains').textContent = n;
}
initTrains(30);

// animate
const TICK_SEC = 1.0;
document.getElementById('tick').textContent = TICK_SEC.toFixed(1) + "s";

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
        <div class="panel">
  <div class="title">Smart Railway – AI-Powered Simulation</div>
  <div class="stat"><b>Active Trains:</b> <span id="nTrains">0</span> &nbsp; | &nbsp; <b>Tick:</b> <span id="tick">1.0s</span></div>
  <div class="stat"><b>Collision Risks:</b> <span id="nRisk">0</span> detected</div>
  <div class="legend">
    <div><span style="background:#1f77b4"></span> Train (normal)</div>
    <div><span style="background:#d62728"></span> Collision risk</div>
  </div>
  <div id="alerts" style="margin-top:10px; max-height:200px; overflow-y:auto; font-size:12px; border-top:1px solid #eee; padding-top:8px;">
    <div style="color:#666; font-style:italic;">No collision threats detected</div>
  </div>
  <div style="margin-top:6px; font-size:11px; color:#666">AI monitoring active. Move map/zoom freely.</div>
</div>
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
  // Move trains
  trains.forEach(t => {
    t.step(TICK_SEC, buildGraph(edges));
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
    const color = isRisk ? '#d62728' : '#1f77b4';
    m.setStyle({color, fillColor: color});
    m.setLatLng([t.lat, t.lon]);
    
    // Update tooltip with more info
    const riskInfo = risks.find(r => r.train1 === t.no || r.train2 === t.no);
    const riskText = riskInfo 
      ? `\n⚠️ COLLISION WARNING!\nTime to impact: ~${riskInfo.ttcFormatted}` 
      : '';
      
    m.setTooltipContent(`Train #${t.no}\n${t.edge.from}→${t.edge.to}\n${t.speedKmh.toFixed(1)} km/h${riskText}`);
  });
}
setInterval(step, TICK_SEC*1000);
