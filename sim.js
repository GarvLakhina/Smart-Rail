
// ---------- Utilities (geo + random) ----------
const R = 6371.0;
function toRad(d){ return d*Math.PI/180;}

// ---------- Evaluation: Accuracy, Sensitivity, Specificity ----------
function pairKey(a, b){ return [String(a), String(b)].sort().join('|'); }

function baselineCollisionRisks(trains, horizonMin = 30, stepSec = 30, distKm = 2.0){
  // Distance-only baseline, ignores tracks; flags <= 2.0 km positions within horizon
  const now = SIM_TIME;
  const steps = Math.max(1, Math.floor((horizonMin*60)/stepSec));
  const flagged = new Map();
  for(let sIdx=1; sIdx<=steps; sIdx++){
    const tAbs = new Date(now.getTime() + sIdx*stepSec*1000);
    const states = trains.map(t => ({ t, st: predictStateAtTime(t, index, edges, tAbs) })).filter(x=>x.st);
    for(let i=0;i<states.length;i++){
      for(let j=i+1;j<states.length;j++){
        const a = states[i], b = states[j];
        const d = haversineKm(a.st.lat, a.st.lon, b.st.lat, b.st.lon);
        if(d <= distKm){
          const k = pairKey(a.t.no, b.t.no);
          const minutesAhead = (sIdx*stepSec)/60;
          const prev = flagged.get(k);
          if(!prev || minutesAhead < prev.ttc){ flagged.set(k, { ttc: minutesAhead }); }
        }
      }
    }
  }
  return flagged; // Map key-> {ttc}
}

function groundTruthCollisions(trains, horizonMin = 30, stepSec = 30, distKm = 1.0){
  // Graph-aware stricter ground truth: same track and <= 0.5 km
  const now = SIM_TIME;
  const steps = Math.max(1, Math.floor((horizonMin*60)/stepSec));
  const flagged = new Map();
  for(let sIdx=1; sIdx<=steps; sIdx++){
    const tAbs = new Date(now.getTime() + sIdx*stepSec*1000);
    const byTrack = new Map();
    trains.forEach(t => {
      const st = predictStateAtTime(t, index, edges, tAbs);
      if(!st || !st.edge || !st.edge.track_id) return;
      const arr = byTrack.get(st.edge.track_id) || [];
      arr.push({ t, st });
      byTrack.set(st.edge.track_id, arr);
    });
    byTrack.forEach(arr => {
      for(let i=0;i<arr.length;i++){
        for(let j=i+1;j<arr.length;j++){
          const a = arr[i], b = arr[j];
          const d = haversineKm(a.st.lat, a.st.lon, b.st.lat, b.st.lon);
          if(d <= distKm){
            const k = pairKey(a.t.no, b.t.no);
            const minutesAhead = (sIdx*stepSec)/60;
            const prev = flagged.get(k);
            if(!prev || minutesAhead < prev.ttc){ flagged.set(k, { ttc: minutesAhead }); }
          }
        }
      }
    });
  }
  return flagged;
}

let LAST_METRICS = null; // cache last evaluation for export

function evaluatePerformance(opts){
  const {
    horizonMin = 60,
    stepSec = 60,
    truthDistKm = 1.0,
    oursDistKm = 2.0,
    baselineDistKm = 5.0
  } = opts || {};
  try{
    const ours = esnGdmCollisionRisks(trains, edges, index, horizonMin, stepSec)
      .filter(r => (r.distance||0) <= oursDistKm);
    const oursSet = new Set(ours.map(r => pairKey(r.train1, r.train2)));
    const base = baselineCollisionRisks(trains, horizonMin, stepSec, baselineDistKm);
    const baseSet = new Set(Array.from(base.keys()));
    const truth = groundTruthCollisions(trains, horizonMin, stepSec, truthDistKm);
    const truthSet = new Set(Array.from(truth.keys()));

    const allPairs = new Set([...oursSet, ...baseSet, ...truthSet]);
    let TP_o=0, FP_o=0, TN_o=0, FN_o=0;
    let TP_b=0, FP_b=0, TN_b=0, FN_b=0;
    allPairs.forEach(k => {
      const t = truthSet.has(k);
      const po = oursSet.has(k);
      const pb = baseSet.has(k);
      if(po && t) TP_o++; else if(po && !t) FP_o++; else if(!po && t) FN_o++; else TN_o++;
      if(pb && t) TP_b++; else if(pb && !t) FP_b++; else if(!pb && t) FN_b++; else TN_b++;
    });

    const acc  = (TP,FP,TN,FN) => (TP+TN)/Math.max(1,(TP+FP+TN+FN));
    const sens = (TP,FN)        => TP/Math.max(1,(TP+FN));
    const spec = (TN,FP)        => TN/Math.max(1,(TN+FP));

    const oursMetrics = {
      TP: TP_o, FP: FP_o, TN: TN_o, FN: FN_o,
      Accuracy: acc(TP_o,FP_o,TN_o,FN_o),
      Sensitivity: sens(TP_o,FN_o),
      Specificity: spec(TN_o,FP_o),
      BalancedAccuracy: 0.5 * (sens(TP_o,FN_o) + spec(TN_o,FP_o)),
      F1: (()=>{ const P = TP_o/Math.max(1,TP_o+FP_o); const R = sens(TP_o,FN_o); return (P+R>0)? (2*P*R/(P+R)) : 0; })()
    };
    const baseMetrics = {
      TP: TP_b, FP: FP_b, TN: TN_b, FN: FN_b,
      Accuracy: acc(TP_b,FP_b,TN_b,FN_b),
      Sensitivity: sens(TP_b,FN_b),
      Specificity: spec(TN_b,FP_b),
      BalancedAccuracy: 0.5 * (sens(TP_b,FN_b) + spec(TN_b,FP_b)),
      F1: (()=>{ const P = TP_b/Math.max(1,TP_b+FP_b); const R = sens(TP_b,FN_b); return (P+R>0)? (2*P*R/(P+R)) : 0; })()
    };

    const pct = x => (100*(x||0)).toFixed(1)+'%';
    console.log('[Evaluation]', { truthPairs: truthSet.size, oursPairs: oursSet.size, basePairs: baseSet.size, horizonMin, stepSec, truthDistKm, oursDistKm, baselineDistKm });
    console.table({
      'Existing (Baseline)': { Acc: pct(baseMetrics.Accuracy), Se: pct(baseMetrics.Sensitivity), Sp: pct(baseMetrics.Specificity), BA: pct(baseMetrics.BalancedAccuracy), F1: pct(baseMetrics.F1) },
      'Ours (ESN+GDM)':     { Acc: pct(oursMetrics.Accuracy), Se: pct(oursMetrics.Sensitivity), Sp: pct(oursMetrics.Specificity), BA: pct(oursMetrics.BalancedAccuracy), F1: pct(oursMetrics.F1) }
    });
    // Update snapshot table in UI if present
    try{
      const setText = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
      setText('acc_base', pct(baseMetrics.Accuracy));
      setText('se_base',  pct(baseMetrics.Sensitivity));
      setText('sp_base',  pct(baseMetrics.Specificity));
      setText('acc_ours', pct(oursMetrics.Accuracy));
      setText('se_ours',  pct(oursMetrics.Sensitivity));
      setText('sp_ours',  pct(oursMetrics.Specificity));
      setText('ba_base',  pct(baseMetrics.BalancedAccuracy));
      setText('ba_ours',  pct(oursMetrics.BalancedAccuracy));
      setText('f1_base',  pct(baseMetrics.F1));
      setText('f1_ours',  pct(oursMetrics.F1));
    }catch(e){ /* ignore DOM update errors */ }
    const msg = `Performance over ${horizonMin} min\n\nExisting (Baseline) -> Acc: ${pct(baseMetrics.Accuracy)} | Se: ${pct(baseMetrics.Sensitivity)} | Sp: ${pct(baseMetrics.Specificity)} | BA: ${pct(baseMetrics.BalancedAccuracy)} | F1: ${pct(baseMetrics.F1)}\nOurs (ESN+GDM) -> Acc: ${pct(oursMetrics.Accuracy)} | Se: ${pct(oursMetrics.Sensitivity)} | Sp: ${pct(oursMetrics.Specificity)} | BA: ${pct(oursMetrics.BalancedAccuracy)} | F1: ${pct(oursMetrics.F1)}`;
    alert(msg);
    LAST_METRICS = { base: baseMetrics, ours: oursMetrics, params: { horizonMin, stepSec, truthDistKm, oursDistKm, baselineDistKm } };
    return LAST_METRICS;
  }catch(e){ console.error('Evaluation failed', e); alert('Evaluation failed: '+e.message); return null; }
}
window.evaluatePerformance = evaluatePerformance;

function exportMetrics(){
  try{
    if(!LAST_METRICS){
      const res = evaluatePerformance({ horizonMin: 90, stepSec: 30, truthDistKm: 2.0, oursDistKm: 2.0, baselineDistKm: 5.0 });
      if(!res) throw new Error('No metrics yet');
    }
    const pct = x => (100*(x||0)).toFixed(2)+'%';
    const rows = [
      ['Metric','Existing','Ours'],
      ['Accuracy',    pct(LAST_METRICS.base.Accuracy),          pct(LAST_METRICS.ours.Accuracy)],
      ['Sensitivity', pct(LAST_METRICS.base.Sensitivity),       pct(LAST_METRICS.ours.Sensitivity)],
      ['Specificity', pct(LAST_METRICS.base.Specificity),       pct(LAST_METRICS.ours.Specificity)],
      ['BalancedAcc', pct(LAST_METRICS.base.BalancedAccuracy),  pct(LAST_METRICS.ours.BalancedAccuracy)],
      ['F1',          pct(LAST_METRICS.base.F1),                pct(LAST_METRICS.ours.F1)]
    ];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'performance_metrics.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }catch(e){ alert('Export failed: '+e.message); }
}
window.exportMetrics = exportMetrics;

// Insert intermediate graph stations between stop pairs so movement stays on tracks
function expandStopsViaGraph(stops, index){
  try{
    if(!Array.isArray(stops) || stops.length < 2) return stops;
    const out = [];
    for(let i=0;i<stops.length-1;i++){
      const a = stops[i];
      const b = stops[i+1];
      out.push({ station: a.station, arr: a.arr||null, dep: a.dep||null });
      const path = getPathEdges(a.station, b.station, graph);
      if(path && path.length){
        // insert intermediate nodes (exclude endpoints already included)
        for(let k=0;k<path.length-1;k++){
          const mid = path[k].to;
          if(mid !== b.station){
            out.push({ station: mid, arr: null, dep: null });
          }
        }
      }
    }
    // push final stop
    out.push({ station: stops[stops.length-1].station, arr: stops[stops.length-1].arr||null, dep: stops[stops.length-1].dep||null });
    // Filter out stations not in index
    return out.filter(s => index[s.station]);
  }catch(e){ return stops; }
}

// ---------- ESN (Echo State Network) for short-horizon trajectory prediction ----------
// Lightweight ESN with RLS readout (single-output: delta progress fraction per step)
class EchoStateNetwork {
  constructor(inputSize, reservoirSize = 64, options = {}){
    this.inputSize = inputSize;
    this.N = reservoirSize;
    this.leak = options.leak ?? 1.0;
    this.ridge = options.ridge ?? 1e-2;
    // Random input weights
    this.Win = Array.from({length: this.N}, () => Array.from({length: inputSize}, () => (Math.random()*2-1) * 0.5));
    // Sparse reservoir weights
    this.W = Array.from({length: this.N}, () => Array.from({length: this.N}, () => 0));
    const density = 0.05;
    for(let i=0;i<this.N;i++){
      for(let j=0;j<this.N;j++){
        if(Math.random() < density){ this.W[i][j] = (Math.random()*2-1) * 0.5; }
      }
    }
    // Scale reservoir to spectral radius ~0.9 (approx via power iteration few steps)
    let v = new Array(this.N).fill(0).map(()=>Math.random());
    const mul = (vec)=>{
      const out = new Array(this.N).fill(0);
      for(let i=0;i<this.N;i++){
        let s = 0;
        for(let j=0;j<this.N;j++) s += this.W[i][j]*vec[j];
        out[i] = s;
      }
      return out;
    };
    for(let k=0;k<8;k++){
      v = mul(v);
      const norm = Math.sqrt(v.reduce((a,b)=>a+b*b,0))+1e-9;
      v = v.map(x=>x/norm);
    }
    const Wv = mul(v);
    const eig = Math.sqrt(Wv.reduce((a,b)=>a+b*b,0))+1e-9;
    const scale = (eig>0) ? 0.9/eig : 1.0;
    for(let i=0;i<this.N;i++) for(let j=0;j<this.N;j++) this.W[i][j]*=scale;
    // State and readout
    this.r = new Array(this.N).fill(0);
    this.Wout = new Array(this.N).fill(0); // 1 x N
    // RLS covariance inverse P
    this.P = [];
    for(let i=0;i<this.N;i++){
      const row = new Array(this.N).fill(0);
      row[i] = 1/this.ridge; // P = (1/lambda) I
      this.P.push(row);
    }
  }
  // One step state update
  step(u){
    // u: array length inputSize
    const Wr = new Array(this.N).fill(0);
    for(let i=0;i<this.N;i++){
      let s = 0;
      for(let j=0;j<this.N;j++) s += this.W[i][j]*this.r[j];
      for(let k=0;k<this.inputSize;k++) s += this.Win[i][k]*u[k];
      Wr[i] = Math.tanh(s);
    }
    // leaky integrator
    for(let i=0;i<this.N;i++) this.r[i] = (1-this.leak)*this.r[i] + this.leak*Wr[i];
    // Output
    let y = 0;
    for(let i=0;i<this.N;i++) y += this.Wout[i]*this.r[i];
    return y;
  }
  // RLS update for readout to track target y
  train(yTarget){
    // Compute Px = P * r
    const Pr = new Array(this.N).fill(0);
    for(let i=0;i<this.N;i++){
      let s = 0; for(let j=0;j<this.N;j++) s += this.P[i][j]*this.r[j];
      Pr[i] = s;
    }
    // Gain vector k = Pr / (1 + r^T Pr)
    let denom = 1.0;
    for(let i=0;i<this.N;i++) denom += this.r[i]*Pr[i];
    const k = Pr.map(x => x/denom);
    // Prediction
    let yHat = 0; for(let i=0;i<this.N;i++) yHat += this.Wout[i]*this.r[i];
    const err = yTarget - yHat;
    // Update Wout = Wout + k * err
    for(let i=0;i<this.N;i++) this.Wout[i] += k[i]*err;
    // Update P = P - k r^T P (approximate with diagonal for speed)
    for(let i=0;i<this.N;i++){
      for(let j=0;j<this.N;j++){
        this.P[i][j] = this.P[i][j] - k[i]*this.r[j]*this.P[j][j];
      }
    }
  }
}

// ---------- PDF-based official schedule builder (client-side) ----------
async function extractPdfTextFromFile(file){
  if(!window.pdfjsLib) throw new Error('PDF.js not loaded');
  const data = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  let out = '';
  for(let p=1;p<=pdf.numPages;p++){
    const page = await pdf.getPage(p);
    const textContent = await page.getTextContent();
    const strings = textContent.items.map(it=>it.str);
    out += strings.join('\n') + '\n';
  }
  return out;
}

async function extractPdfTextFromUrl(url){
  if(!window.pdfjsLib) throw new Error('PDF.js not loaded');
  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;
  let out = '';
  for(let p=1;p<=pdf.numPages;p++){
    const page = await pdf.getPage(p);
    const textContent = await page.getTextContent();
    const strings = textContent.items.map(it=>it.str);
    out += strings.join('\n') + '\n';
  }
  return out;
}

function splitTrainsByHeaders(text){
  // Split on likely train headers: lines containing a 4-5 digit number and a name word
  const lines = text.split(/\n+/);
  const blocks = [];
  let current = { header: null, lines: [] };
  const headerRe = /\b(\d{4,5})\b\s+([A-Za-z][A-Za-z\s\-']{3,})/;
  for(const ln of lines){
    if(headerRe.test(ln)){
      if(current.header || current.lines.length){ blocks.push(current); }
      current = { header: ln, lines: [] };
    } else {
      current.lines.push(ln);
    }
  }
  if(current.header || current.lines.length){ blocks.push(current); }
  return blocks;
}

function parseSchedulesFromText(text, index){
  const stationIds = Object.keys(index);
  const stationNames = stationIds.map(id => ({ id, name: index[id].name }));
  const nameLookup = stationNames;
  const timeRe = /(\b[01]?\d|2[0-3]):[0-5]\d/; // HH:MM
  const headerRe = /\b(\d{4,5})\b\s+([A-Za-z][A-Za-z\s\-']{3,})/;
  const blocks = splitTrainsByHeaders(text);
  const results = [];
  for(const b of blocks){
    const m = b.header ? b.header.match(headerRe) : null;
    const no = m ? m[1] : '';
    const name = m ? m[2].trim() : '';
    if(!no) continue;
    // scan lines for station mentions and nearest time on same/next tokens
    const stops = [];
    for(const ln of b.lines){
      const lower = ln.toLowerCase();
      const hit = nameLookup.find(s => lower.includes(s.name.toLowerCase()));
      if(hit){
        const tmatch = ln.match(timeRe);
        const t = tmatch ? tmatch[0] : null;
        // If first stop -> dep only; last stop -> arr only; else both when subsequent occurrence happens
        // Here, we store both fields as same time if only one present; later builder will fix first/last.
        stops.push({ station: hit.id, arr: t, dep: t });
      }
    }
    // Deduplicate consecutive same station and limit to those existing
    const uniqStops = [];
    for(const s of stops){
      if(uniqStops.length===0 || uniqStops[uniqStops.length-1].station !== s.station){
        uniqStops.push(s);
      }
    }
    if(uniqStops.length >= 2){
      // Fix first/last arr/dep
      if(uniqStops[0]){ uniqStops[0].arr = null; }
      const last = uniqStops[uniqStops.length-1]; if(last){ last.dep = null; }
      results.push({ no, name, days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], stops: uniqStops });
    }
  }
  return results;
}

async function buildSchedulesFromSelectedPDFs(ev){
  try{
    const el = document.getElementById('pdfBuildStatus');
    if(el) el.textContent = 'Parsing selected PDFs...';
    const files = (ev && ev.target && ev.target.files) ? Array.from(ev.target.files) : [];
    if(files.length===0){ alert('No PDF files selected'); return; }
    // Prepare index
    const stationIndex = index || Object.fromEntries(STATIONS.map(s=>[s.id,s]));
    let all = [];
    for(const f of files){
      const text = await extractPdfTextFromFile(f);
      const part = parseSchedulesFromText(text, stationIndex);
      all = all.concat(part);
    }
    if(all.length===0){ alert('Could not extract any schedules from PDFs.'); if(el) el.textContent='No schedules found.'; return; }
    // Save and reload
    localStorage.setItem('official_schedules_json', JSON.stringify(all));
    if(el) el.textContent = `Imported ${all.length} trains from PDFs. Reloading...`;
    setTimeout(()=>location.reload(), 800);
  }catch(err){
    console.error(err);
    alert('PDF build failed: '+err.message);
  }
}
window.buildSchedulesFromSelectedPDFs = buildSchedulesFromSelectedPDFs;

async function buildSchedulesFromRailwayData(){
  try{
    const el = document.getElementById('pdfBuildStatus');
    if(el) el.textContent = 'Parsing PDFs from Railway Data folder...';
    const files = [
      'Railway Data/Rajdhani_Exp.pdf','Railway Data/Shatabdi_Exp.pdf','Railway Data/Duronto_Exp.pdf',
      'Railway Data/Janshatabdi_Exp.pdf','Railway Data/Sampark_Kranti_Exp.pdf',
      'Railway Data/Vande Bharat Trains.pdf','Railway Data/Yuva, Tejas, Uday, Gatiman Trains.pdf',
      'Railway Data/Amrit_Bharat_Trains.pdf','Railway Data/Antyodaya Trains.pdf','Railway Data/TOD_Special_Trains.pdf'
    ];
    // Prepare index
    const stationIndex = index || Object.fromEntries(STATIONS.map(s=>[s.id,s]));
    let all = [];
    for(const url of files){
      try{
        const text = await extractPdfTextFromUrl(url);
        const part = parseSchedulesFromText(text, stationIndex);
        all = all.concat(part);
      }catch(e){ /* skip missing */ }
      if(all.length >= 120) break; // cap
    }
    if(all.length===0){ alert('No schedules extracted from Railway Data PDFs.'); if(el) el.textContent='No schedules found.'; return; }
    localStorage.setItem('official_schedules_json', JSON.stringify(all));
    if(el) el.textContent = `Imported ${all.length} trains from Railway Data PDFs. Reloading...`;
    setTimeout(()=>location.reload(), 800);
  }catch(err){
    console.error(err);
    alert('Build from Railway Data failed: '+err.message);
  }
}
window.buildSchedulesFromRailwayData = buildSchedulesFromRailwayData;

function parseCSV(text){
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length>0);
  if(lines.length===0) return [];
  const headers = lines[0].split(',').map(h=>h.trim());
  const rows = lines.slice(1).map(l=>{
    const vals = l.split(',');
    const obj = {};
    headers.forEach((h,i)=> obj[h] = (vals[i]||'').trim());
    return obj;
  });
  return rows;
}

function csvRowsToScheduleJson(rows){
  // Expect columns: train_no,train_name,days,seq,station,arr,dep
  const byTrain = new Map();
  rows.forEach(r=>{
    const no = r.train_no || r.no || '';
    if(!no) return;
    const name = r.train_name || r.name || '';
    const days = (r.days||'Mon,Tue,Wed,Thu,Fri,Sat,Sun').split(/\s*;|,\s*/);
    const seq = parseInt(r.seq||r.sequence||'0',10)||0;
    const stop = { station: (r.station||'').trim(), arr: (r.arr||'').trim()||null, dep: (r.dep||'').trim()||null, seq };
    if(!byTrain.has(no)) byTrain.set(no, { no, name, days, stops: [] });
    byTrain.get(no).stops.push(stop);
  });
  // sort stops by seq and clean
  const out = Array.from(byTrain.values()).map(t=>{
    t.stops.sort((a,b)=>a.seq-b.seq);
    t.stops = t.stops.map(({station,arr,dep})=>({station,arr:arr||null,dep:dep||null}));
    return t;
  });
  return out;
}

async function importSchedulesFromFile(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      try{
        const text = String(reader.result||'');
        let data;
        if(file.name.toLowerCase().endsWith('.json')){
          data = JSON.parse(text);
        } else if(file.name.toLowerCase().endsWith('.csv')){
          const rows = parseCSV(text);
          data = csvRowsToScheduleJson(rows);
        } else {
          throw new Error('Unsupported file type. Please upload JSON or CSV.');
        }
        if(!Array.isArray(data) || data.length===0) throw new Error('No schedules found in file');
        localStorage.setItem('official_schedules_json', JSON.stringify(data));
        resolve(true);
      }catch(e){ reject(e); }
    };
    reader.readAsText(file);
  });
}
// Expose importer for UI
window.importSchedulesFromFile = async function(ev){
  const input = ev && ev.target ? ev.target : null;
  const file = input && input.files && input.files[0];
  if(!file){ alert('No file chosen'); return; }
  try{
    await importSchedulesFromFile(file);
    alert('Schedules imported. Reloading...');
    location.reload();
  }catch(err){
    console.error('Import failed', err);
    alert('Import failed: '+err.message);
  }
}

function inferTrainType(name='', metaCategory=''){
  const n = (name||'').toLowerCase();
  const c = (metaCategory||'').toLowerCase();
  // Meta category takes precedence when present
  if(c.includes('rajdhani')) return 'RAJDHANI';
  if(c.includes('shatabdi')) return 'SHATABDI';
  if(c.includes('vande bharat') || c.includes('tejas') || c.includes('gatiman') || c.includes('duronto') || c.includes('superfast')) return 'SUPERFAST';
  if(c.includes('mail') || c.includes('express')) return 'EXPRESS';
  if(c.includes('passenger') || c.includes('memu') || c.includes('demu')) return 'PASSENGER';
  if(c.includes('goods') || c.includes('freight')) return 'FREIGHT';
  // Fallback to name-based inference
  if(n.includes('rajdhani')) return 'RAJDHANI';
  if(n.includes('shatabdi') || n.includes('jan shatabdi') || n.includes('janshatabdi')) return 'SHATABDI';
  if(n.includes('vande bharat') || n.includes('tejas') || n.includes('gatimaan') || n.includes('duronto')) return 'SUPERFAST';
  if(n.includes('sampark kranti') || n.includes('superfast')) return 'SUPERFAST';
  if(n.includes('passenger') || n.includes('memu') || n.includes('demu')) return 'PASSENGER';
  if(n.includes('goods') || n.includes('freight')) return 'FREIGHT';
  return 'EXPRESS';
}

function initTrainsFromOfficial(n = 100){
  trains = [];
  trainMarkers = new Map();
  const stationSet = new Set(Object.keys(index));
  let trainCount = 0;
  (OFFICIAL_SCHEDULES || []).some(entry => {
    if(trainCount >= n) return true;
    try{
      const stops = (entry.stops||[]).filter(s => stationSet.has(s.station));
      if(stops.length < 2) return false;
      const noStr = String(entry.no||'');
      const meta = TRAIN_META && TRAIN_META.get(noStr);
      const type = inferTrainType(entry.name, meta && meta.category);
      const t = new Train(noStr, index, type, stops.map(s=>s.station));
      t.name = entry.name || t.name;
      // attach days/stops meta so buildSchedulesFromOfficial can use them
      t.days = entry.days || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      t.stops = stops;
      t.schedule = buildSchedulesFromOfficial(t, index);
      // If avg speed is provided in meta, use it to set nominal speed (for ESN/display)
      if(meta && meta.avg_speed_kmph){
        t.speedKmh = Math.max(20, Math.min(180, Number(meta.avg_speed_kmph)));
      }
      trains.push(t);
      trainCount++;
    }catch(err){ console.error('Official train init error', entry && entry.no, err); }
    return false;
  });

  // Create map markers for all official trains
  trains.forEach(t => {
    updateTrainBySchedule(t, index, edges, SIM_TIME);
    const color = (t.typeData && t.typeData.color) || '#1f77b4';
    const m = L.circleMarker([t.lat || 22.5, t.lon || 78.9], {
      radius: t.type === 'FREIGHT' ? 4 : 5,
      color: color,
      fillColor: color,
      fillOpacity: 0.8
    }).addTo(map)
      .bindTooltip(`${t.name} (#${t.no})\n${t.edge ? (t.edge.from+"→"+t.edge.to) : ''}\n${(t.speedKmh||0).toFixed(1)} km/h\nType: ${t.typeData ? t.typeData.name : type}`, { permanent: false });
    trainMarkers.set(t.no, m);
  });

  var nt = document.getElementById('nTrains');
  if (nt) nt.textContent = String(trainCount);
}
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

// Default corridor speed limits (km/h) used only as fallback when OSM data is missing
// These are conservative defaults; real segment limits will be fetched from OpenStreetMap
const DEFAULT_CORRIDOR_SPEED_LIMITS = [
  110, // Delhi-Howrah main line
  110, // Delhi-Mumbai via Rajasthan
  105, // Mumbai-Chennai via Bangalore
  105, // Chennai-Delhi via Hyderabad
  95,  // Kerala-Karnataka corridor
  90,  // TN east-west
  95,  // Karnataka-Maharashtra
  95,  // Andhra-Telangana triangle
  100, // Central-Eastern
  95,  // MP triangle
  110, // Delhi-Chandigarh
  95   // UP-Bihar connection
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

// Load stations data (updated to use provided hubs file)
fetch('stations_25_hubs.json')
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
        
        const limit = DEFAULT_CORRIDOR_SPEED_LIMITS[corridorIndex] || 90;
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

// -------- Pathfinding and geometry along graph --------
const PATH_CACHE = new Map(); // key: from|to -> [{from,to,km}...]

function dijkstraPath(fromId, toId, graph){
  if(!graph[fromId] || !fromId || !toId) return null;
  const dist = new Map();
  const prev = new Map();
  const visited = new Set();
  const pq = [];
  const push = (node, d)=>{ pq.push({node, d}); pq.sort((a,b)=>a.d-b.d); };
  push(fromId, 0); dist.set(fromId, 0);
  while(pq.length){
    const {node, d} = pq.shift();
    if(visited.has(node)) continue; visited.add(node);
    if(node === toId) break;
    const outs = graph[node] || [];
    for(const e of outs){
      const nd = d + (e.km || 0);
      if(!dist.has(e.to) || nd < dist.get(e.to)){
        dist.set(e.to, nd);
        prev.set(e.to, { node, edge: e });
        push(e.to, nd);
      }
    }
  }
  if(!prev.has(toId)) return null;
  const pathEdges = [];
  let cur = toId;
  while(cur !== fromId){
    const p = prev.get(cur); if(!p) break;
    pathEdges.push({ from: p.edge.from, to: p.edge.to, km: p.edge.km, track_id: p.edge.track_id });
    cur = p.node;
  }
  pathEdges.reverse();
  return pathEdges;
}

function getPathEdges(fromId, toId, graph){
  const key = `${fromId}|${toId}`;
  if(PATH_CACHE.has(key)) return PATH_CACHE.get(key);
  const path = dijkstraPath(fromId, toId, graph);
  if(path) PATH_CACHE.set(key, path);
  return path;
}

function interpolateAlongPath(pathEdges, distanceKm, index){
  if(!pathEdges || pathEdges.length===0) return null;
  let remaining = distanceKm;
  for(const seg of pathEdges){
    const km = seg.km || haversineKm(index[seg.from].lat, index[seg.from].lon, index[seg.to].lat, index[seg.to].lon);
    const A = index[seg.from], B = index[seg.to];
    const br = bearingDeg(A.lat, A.lon, B.lat, B.lon);
    if(remaining <= km){
      const pos = destinationPoint(A.lat, A.lon, br, Math.max(0, remaining));
      return { lat: pos.lat, lon: pos.lon, bearing: br, edge: seg, progressKm: distanceKm };
    }
    remaining -= km;
  }
  // beyond end: place at final node
  const last = pathEdges[pathEdges.length-1];
  const A = index[last.from], B = index[last.to];
  const br = bearingDeg(A.lat, A.lon, B.lat, B.lon);
  return { lat: B.lat, lon: B.lon, bearing: br, edge: last, progressKm: distanceKm };
}

// ---------- OSM-derived per-segment speed limits ----------
// Cache for loaded segment speeds. Key is unordered pair "A|B"
const SPEED_MAP = new Map();

function segKey(a, b){
  return [a, b].sort().join('|');
}

function parseMaxspeedTag(val){
  if(!val) return null;
  // Handle formats like "110", "110 km/h", "110 mph", "100;90"
  const primary = String(val).split(';')[0].trim();
  const m = primary.match(/([0-9]+(?:\.[0-9]+)?)\s*(mph|kmh|km\/h|kph)?/i);
  if(!m) return null;
  let num = parseFloat(m[1]);
  const unit = (m[2] || 'kmh').toLowerCase();
  if(Number.isNaN(num)) return null;
  if(unit.includes('mph')){
    num = num * 1.60934; // convert mph to km/h
  }
  return Math.max(20, Math.min(200, num));
}

async function fetchOSMSegmentSpeed(A, B){
  // Query Overpass API around mid-point of the segment to discover railway ways with maxspeed tags
  const mid = { lat: (A.lat + B.lat)/2, lon: (A.lon + B.lon)/2 };
  const radiusMeters = Math.max(3000, Math.min(15000, haversineKm(A.lat, A.lon, B.lat, B.lon) * 500));
  const query = `
    [out:json][timeout:25];
    // find railway ways near the segment midpoint with maxspeed tags
    way["railway"="rail"]["maxspeed"](around:${Math.floor(radiusMeters)},${mid.lat},${mid.lon});
    out tags;
  `;
  const url = 'https://overpass-api.de/api/interpreter';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ data: query })
  });
  if(!res.ok) throw new Error('Overpass request failed');
  const data = await res.json();
  const speeds = [];
  for(const el of (data.elements || [])){
    const v = parseMaxspeedTag(el.tags && (el.tags.maxspeed || el.tags["maxspeed:forward"] || el.tags["maxspeed:backward"]));
    if(v) speeds.push(v);
  }
  if(speeds.length === 0) return null;
  // Use median to avoid outliers
  speeds.sort((a,b)=>a-b);
  const median = speeds[Math.floor(speeds.length/2)];
  return Math.round(median);
}

async function applyOSMSpeedsToEdges(edges, index){
  // Load from localStorage cache first
  try{
    const cached = JSON.parse(localStorage.getItem('segment_speed_cache') || '{}');
    for(const k of Object.keys(cached)){
      SPEED_MAP.set(k, cached[k]);
    }
  }catch(e){ /* ignore cache parse errors */ }

  // Prepare unique unordered segments
  const uniquePairs = new Map();
  edges.forEach(e => {
    const k = segKey(e.from, e.to);
    if(!uniquePairs.has(k)) uniquePairs.set(k, e);
  });

  const entries = Array.from(uniquePairs.values());
  // Limit to reasonable number to avoid rate limits
  const MAX_FETCH = 60;
  const toFetch = entries.filter(e => !SPEED_MAP.has(segKey(e.from, e.to))).slice(0, MAX_FETCH);

  for(const e of toFetch){
    const A = index[e.from], B = index[e.to];
    try{
      const v = await fetchOSMSegmentSpeed(A, B);
      if(v){ SPEED_MAP.set(segKey(e.from, e.to), v); }
    }catch(err){ /* ignore per-edge errors */ }
    // polite delay to avoid hammering Overpass
    await new Promise(r => setTimeout(r, 250));
  }

  // Persist cache
  const obj = {};
  SPEED_MAP.forEach((v,k)=>{ obj[k]=v; });
  try{ localStorage.setItem('segment_speed_cache', JSON.stringify(obj)); }catch(e){ /* ignore */ }

  // Apply speeds to all edges with fallback to defaults
  edges.forEach(e => {
    const k = segKey(e.from, e.to);
    const osm = SPEED_MAP.get(k);
    if(osm){
      e.vMax = osm;
    } else {
      // corridor fallback already set at creation; keep as-is
    }
  });
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
    // ESN state
    this.esn = null;
    this.prevSpeedKmh = this.speedKmh;
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
// Simulation runs one tick per second; default speed is 1x until user changes it
let TIME_SCALE = 1;

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

// Rebuild HH:MM times for official stops to ensure realistic speeds per segment
function rebuildTimesForStops(stops, type, index, edges, metaAvgSpeed){
  if(!Array.isArray(stops) || stops.length < 2) return stops;
  // base departure time
  let baseDep = stops[0].dep || '06:00';
  const [baseH, baseM] = String(baseDep||'06:00').split(':');
  let current = new Date(); current.setHours(parseInt(baseH||'6',10)||6, parseInt(baseM||'0',10)||0, 0, 0);
  const rebuilt = [];
  const dwell = dwellMinutes(type);
  const legs = buildRouteEdgesFromStations(stops.map(s=>s.station), edges);
  const defaultCruise = metaAvgSpeed ? Math.max(30, Math.min(130, Number(metaAvgSpeed))) : averageCruiseSpeed(type);
  for(let i=0;i<stops.length;i++){
    if(i===0){
      rebuilt.push({ station: stops[0].station, arr: null, dep: `${String(current.getHours()).padStart(2,'0')}:${String(current.getMinutes()).padStart(2,'0')}` });
      continue;
    }
    const leg = legs[i-1];
    // Prefer path distance along graph if available
    const path = getPathEdges(leg.from, leg.to, graph);
    const km = path ? path.reduce((s,e)=> s + (e.km ?? segmentKm(e.from,e.to,index)), 0) : (leg.km ?? segmentKm(leg.from, leg.to, index));
    const vlim = Math.min(defaultCruise, segmentSpeedLimit(leg.from, leg.to, edges));
    const tSec = travelTimeSeconds(km, vlim, 0.35);
    current = new Date(current.getTime() + tSec*1000);
    const arrH = String(current.getHours()).padStart(2,'0');
    const arrM = String(current.getMinutes()).padStart(2,'0');
    const isLast = (i === stops.length-1);
    let depTime = null;
    if(!isLast){
      const extra = MAJOR_STATIONS.has(stops[i].station) ? Math.max(5, Math.floor(dwell*0.5)) : 0;
      current = new Date(current.getTime() + (dwell + extra)*MS_PER_MIN);
      depTime = `${String(current.getHours()).padStart(2,'0')}:${String(current.getMinutes()).padStart(2,'0')}`;
    }
    rebuilt.push({ station: stops[i].station, arr: `${arrH}:${arrM}`, dep: depTime });
  }
  return rebuilt;
}

// Check if provided official times imply unrealistic per-segment speed; if so, rebuild
function normalizeOfficialStopsIfNeeded(stops, type, index, edges, metaAvgSpeed){
  try{
    if(!Array.isArray(stops) || stops.length<2) return stops;
    // If any time missing, rebuild
    if(stops.some(s => (!s.arr && !s.dep))) return rebuildTimesForStops(stops, type, index, edges, metaAvgSpeed);
    // Filter out legs that are not connected in our graph; keep only connected subsequences
    const filtered = [stops[0]];
    for(let i=1;i<stops.length;i++){
      const a = filtered[filtered.length-1].station;
      const b = stops[i].station;
      const path = getPathEdges(a, b, graph);
      if(path && path.length){ filtered.push(stops[i]); }
      // else skip this stop; it is not connected via our corridor graph
    }
    if(filtered.length < 2) return stops; // fallback if we lost everything
    stops = filtered;
    // Compute implied speed between consecutive stops using same-day times (assume rollover if decrease)
    let day = 0; let prevMinutes = null;
    const minutesAt = s => {
      const t = (s.dep || s.arr || '00:00');
      const [hh,mm] = t.split(':').map(x=>parseInt(x,10)||0);
      let mins = hh*60+mm;
      if(prevMinutes !== null && mins < prevMinutes) day += 24*60;
      prevMinutes = mins;
      return mins + day;
    };
    let prev = stops[0];
    let prevMin = minutesAt(prev);
    for(let i=1;i<stops.length;i++){
      const cur = stops[i];
      const curMin = minutesAt(cur);
      const dtMin = Math.max(1, curMin - prevMin);
      // use graph path length if possible
      const path = getPathEdges(prev.station, cur.station, graph);
      const km = path ? path.reduce((s,e)=> s + (e.km ?? segmentKm(e.from,e.to,index)), 0) : segmentKm(prev.station, cur.station, index);
      const implied = (km / (dtMin/60));
      if(implied > 120){
        // unrealistic, rebuild all times
        return rebuildTimesForStops(stops, type, index, edges, metaAvgSpeed);
      }
      prev = cur; prevMin = curMin;
    }
    return stops;
  }catch(e){ return stops; }
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
  // Follow track path rather than straight line
  const path = getPathEdges(fromSt.station, toSt.station, graph);
  const pathKm = (path||[]).reduce((s,e)=> s + (e.km ?? segmentKm(e.from, e.to, index)), 0);
  const alongKm = frac * Math.max(0.001, pathKm);
  const at = (path && path.length) ? (interpolateAlongPath(path, alongKm, index) || { lat: from.lat, lon: from.lon, bearing: 0, edge: null }) : { lat: from.lat, lon: from.lon, bearing: 0, edge: null };
  train.lat = at.lat; train.lon = at.lon; train.bearing = at.bearing;
  train.currentFrom = fromSt.station; train.currentTo = toSt.station;
  train.edge = at.edge || null; // only set real edges
  train.progressKm = alongKm;
  // Update ESN with observed delta progress (normalized by segment km)
  try{
    if(!train.esn){ train.esn = new EchoStateNetwork(4, 64, { leak: 0.6, ridge: 1e-2 }); }
    const vMax = segmentSpeedLimit(fromSt.station, toSt.station, edges);
    const accel = (train.speedKmh - (train.prevSpeedKmh||train.speedKmh)) / Math.max(TICK_SEC,1);
    const u = [
      Math.min(1, Math.max(0, train.speedKmh/200)),
      Math.max(-1, Math.min(1, accel/10)),
      (segIdx === -1 ? 1 : 0),
      Math.min(1, Math.max(0, vMax/200))
    ];
    // target: fraction progress along this path segment
    const targetFrac = (pathKm>0) ? (train.progressKm/Math.max(0.001, pathKm)) : 0;
    // step once to update state, then train towards current fraction (keeps readout adaptive)
    let y = train.esn.step(u);
    // Clamp ESN influence to avoid large jumps
    if(y > 1) y = 1; if(y < -1) y = -1;
    train.esn.train(targetFrac);
  }catch(e){ /* ESN optional */ }
  train.prevSpeedKmh = train.speedKmh;
}

// ---------- Collision risk (ESN + Graph Diffusion) ----------
// Predict future position on the network for a given absolute time (does not mutate train)
function predictStateAtTime(train, index, edges, when){
  if(!train.schedule || train.schedule.length===0) return null;
  const day0 = new Date(); day0.setHours(0,0,0,0);
  const dayIndex = Math.floor((when - day0) / (24*60*60*1000));
  const today = train.schedule.find(s => s.dayIndex === dayIndex);
  if(!today){ return null; }
  const stops = today.stops;
  // find segment
  let segIdx = -1;
  for(let i=0;i<stops.length-1;i++){
    const dep = stops[i].dep.getTime();
    const arr = stops[i+1].arr.getTime();
    const tnow = when.getTime();
    if(tnow >= dep && tnow <= arr){ segIdx = i; break; }
  }
  // At station
  if(segIdx === -1){
    let last = stops[0];
    for(const s of stops){ if(when >= s.dep) last = s; }
    const S = index[last.station];
    return { lat: S.lat, lon: S.lon, bearing: 0, edge: null, progressKm: 0 };
  }
  const fromSt = stops[segIdx];
  const toSt = stops[segIdx+1];
  const from = index[fromSt.station];
  const to = index[toSt.station];
  const totalMs = toSt.arr.getTime() - fromSt.dep.getTime();
  const elapsedMs = when.getTime() - fromSt.dep.getTime();
  const fracLin = Math.max(0, Math.min(1, elapsedMs / Math.max(totalMs, 1)));
  let frac = easeInOutSine(fracLin);
  // ESN perturbation removed to avoid off-track/leap issues; use schedule fraction only
  // Follow track path rather than straight line
  const path = getPathEdges(fromSt.station, toSt.station, graph);
  const pathKm = (path||[]).reduce((s,e)=> s + (e.km ?? segmentKm(e.from, e.to, index)), 0);
  const alongKm = frac * Math.max(0.001, pathKm);
  const at = interpolateAlongPath(path, alongKm, index) || { lat: from.lat, lon: from.lon, bearing: 0, edge: null };
  return {
    lat: at.lat,
    lon: at.lon,
    bearing: at.bearing,
    edge: at.edge || null,
    progressKm: alongKm
  };
}

function esnGdmCollisionRisks(trains, edges, index, horizonMin = 30, stepSec = 30){
  const risks = [];
  const now = SIM_TIME;
  const steps = Math.max(1, Math.floor((horizonMin*60)/stepSec));
  // time-bucket occupancy per track
  for(let sIdx=1; sIdx<=steps; sIdx++){
    const tAbs = new Date(now.getTime() + sIdx*stepSec*1000);
    const byTrack = new Map();
    trains.forEach(t => {
      const st = predictStateAtTime(t, index, edges, tAbs);
      if(!st || !st.edge || !st.edge.track_id) return;
      const arr = byTrack.get(st.edge.track_id) || [];
      arr.push({ train: t, state: st });
      byTrack.set(st.edge.track_id, arr);
    });
    // compare trains per track in this bucket
    byTrack.forEach((arr, trackId) => {
      for(let i=0;i<arr.length;i++){
        for(let j=i+1;j<arr.length;j++){
          const a = arr[i], b = arr[j];
          const dist = haversineKm(a.state.lat, a.state.lon, b.state.lat, b.state.lon);
          const bearingDiff = Math.abs(((a.state.bearing - b.state.bearing + 540) % 360) - 180);
          const isHeadOn = (bearingDiff < 60 || bearingDiff > 300);
          // If they are on same track and within ~2 km at same future bucket, flag
          if(dist <= 2.0){
            const minutesAhead = (sIdx*stepSec)/60;
            risks.push({
              train1: a.train.no,
              train2: b.train.no,
              track: trackId,
              ttc: minutesAhead,
              ttcFormatted: minutesAhead < 60 ? `${Math.floor(minutesAhead)}m ${Math.floor((minutesAhead % 1) * 60)}s` : `${Math.floor(minutesAhead/60)}h ${Math.floor(minutesAhead % 60)}m`,
              isHeadOn,
              distance: dist
            });
          }
        }
      }
    });
  }
  // Sort and deduplicate by train pair keeping earliest
  const key = r => [r.train1, r.train2].sort().join('|');
  const best = new Map();
  for(const r of risks){
    const k = key(r);
    const prev = best.get(k);
    if(!prev || r.ttc < prev.ttc) best.set(k, r);
  }
  return Array.from(best.values()).sort((a,b)=>a.ttc-b.ttc);
}

// Legacy geometric predictor kept for reference (unused)
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
let map, index, edges, graph, trains = [], trainMarkers = new Map();
let OFFICIAL_SCHEDULES = null; // when present, we only use these
const ENABLE_OSM_FETCH = false; // do not fetch external data unless explicitly enabled

// Optional train meta from trains_100.json
let TRAIN_META = null; // Map by train_no -> { category, avg_speed_kmph, ... }

async function loadTrainMeta(){
  try{
    const res = await fetch('trains_100.json', { cache: 'no-store' });
    if(!res.ok) return null;
    const arr = await res.json();
    if(!Array.isArray(arr)) return null;
    const map = new Map();
    for(const r of arr){
      const no = String(r.train_no || r.no || '').trim();
      if(!no) continue;
      map.set(no, r);
    }
    TRAIN_META = map;
    return map;
  }catch(e){ return null; }
}

async function tryLoadOfficialSchedules(){
  try{
    // Try project root first
    let res = await fetch('official_schedules.json', { cache: 'no-store' });
    if(!res.ok){
      // Try inside Railway Data folder (case-insensitive path as provided)
      res = await fetch('Railway Data/official_schedules.json', { cache: 'no-store' });
    }
    if(res.ok){
      const data = await res.json();
      if(Array.isArray(data) && data.length > 0){
        return data;
      }
    }
  }catch(e){ /* missing or invalid */ }
  // Check localStorage fallback
  try{
    const cached = localStorage.getItem('official_schedules_json');
    if(cached){
      const data = JSON.parse(cached);
      if(Array.isArray(data) && data.length>0){ return data; }
    }
  }catch(e){ /* ignore */ }

  // Fallback: transform schedules_100.json (flat rows) into OFFICIAL format
  try{
    const res2 = await fetch('schedules_100.json', { cache: 'no-store' });
    if(res2.ok){
      const rows = await res2.json();
      if(Array.isArray(rows) && rows.length>0){
        // Group by train_no and build OFFICIAL structure
        const byTrain = new Map();
        for(const r of rows){
          const no = String(r.train_no || r.no || '').trim();
          if(!no) continue;
          if(!byTrain.has(no)){
            byTrain.set(no, {
              no,
              name: String(r.train_name || r.name || no).trim(),
              days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
              stops: []
            });
          }
          const arr = (r.arrival ?? r.arr ?? '').trim();
          const dep = (r.departure ?? r.dep ?? '').trim();
          byTrain.get(no).stops.push({
            station: String(r.station_id || r.station || '').trim(),
            arr: arr || null,
            dep: dep || null,
            seq: parseInt(r.seq || r.sequence || '0', 10) || 0
          });
        }
        const official = Array.from(byTrain.values()).map(t => {
          t.stops.sort((a,b)=>a.seq-b.seq);
          t.stops = t.stops.map(({station,arr,dep})=>({station,arr:arr||null,dep:dep||null}));
          return t;
        });
        if(official.length>0){
          return official;
        }
      }
    }
  }catch(e){ /* ignore transform fallback errors */ }
  return null;
}

function timeStrToDate(baseDate, hhmm){
  // hhmm like "16:55" or "00:00". Returns Date on same day.
  const [hh, mm] = (hhmm || '00:00').split(':').map(x=>parseInt(x,10)||0);
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hh, mm, 0, 0);
  return d;
}

function buildSchedulesFromOfficial(train, index){
  // OFFICIAL format per train: { no, name, days, stops:[{station, arr, dep}] }
  // We'll build next 365 days for days listed; interpolate positions using timing windows.
  const schedules = [];
  const startDate = new Date();
  startDate.setSeconds(0,0);
  const runsOn = new Set((train.days||['Mon','Tue','Wed','Thu','Fri','Sat','Sun']).map(d=>d.toLowerCase().slice(0,3)));
  const dow = ['sun','mon','tue','wed','thu','fri','sat'];
  const baseStops = (train.stops||[]).filter(s => index[s.station]);
  // Normalize times to avoid unrealistic implied speeds
  const meta = TRAIN_META && TRAIN_META.get(String(train.no||''));
  let validStops = normalizeOfficialStopsIfNeeded(baseStops, train.type, index, edges, meta && meta.avg_speed_kmph);
  // Keep only connected legs according to our graph
  const connected = [];
  if(validStops.length >= 2){
    connected.push(validStops[0]);
    for(let i=1;i<validStops.length;i++){
      const a = connected[connected.length-1].station;
      const b = validStops[i].station;
      const path = getPathEdges(a, b, graph);
      if(path && path.length){ connected.push(validStops[i]); }
    }
  }
  validStops = (connected.length>=2) ? connected : validStops;
  // Expand via graph to insert intermediate nodes so we travel along tracks
  validStops = expandStopsViaGraph(validStops, index);
  // After expansion (some times are null), rebuild times deterministically
  validStops = rebuildTimesForStops(validStops, train.type, index, edges, meta && meta.avg_speed_kmph);
  if(validStops.length < 2) return [];
  for(let d=0; d<DAYS_365; d++){
    const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+d, 0, 0, 0, 0);
    const key = dow[date.getDay()];
    if(!runsOn.has(key)) continue;
    // Build stop times
    // Handle day rollovers if times decrease (overnight trains)
    let dayOffset = 0;
    const stopsOut = [];
    let prevMinutes = -1;
    for(let i=0;i<validStops.length;i++){
      const s = validStops[i];
      const arrStr = s.arr; const depStr = s.dep;
      const arrDate = arrStr ? timeStrToDate(date, arrStr) : null;
      const depDate = depStr ? timeStrToDate(date, depStr) : null;
      // compute minutes since midnight and adjust rollover
      const pick = depDate || arrDate; // whichever exists
      const mins = pick ? (pick.getHours()*60 + pick.getMinutes()) : prevMinutes;
      if(prevMinutes >= 0 && mins !== null && mins < prevMinutes){ dayOffset += 1; }
      const base = (dt)=> dt ? new Date(dt.getTime() + dayOffset*24*60*60*1000) : null;
      const arr = base(arrDate);
      const dep = base(depDate);
      stopsOut.push({ station: s.station, arr: arr || dep, dep: dep || arr });
      prevMinutes = mins ?? prevMinutes;
    }
    schedules.push({ dayIndex: d, date, stops: stopsOut });
  }
  return schedules;
}

async function initializeSimulation() {
  // Initialize map centered on India
  map = L.map('map').setView([20.5937, 78.9629], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, 
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Build network
  index = Object.fromEntries(STATIONS.map(s => [s.id, s]));
  edges = buildEdges(index);
  graph = buildGraph(edges);
  // Load train meta, if present
  await loadTrainMeta();
  // Enrich with OSM maxspeed data before we compute schedules (disabled by default)
  if(ENABLE_OSM_FETCH){
    try{
      await applyOSMSpeedsToEdges(edges, index);
    }catch(e){
      console.warn('OSM speed enrichment skipped due to error:', e);
    }
  }

  // Try to load official schedules and use ONLY those if present
  OFFICIAL_SCHEDULES = await tryLoadOfficialSchedules();
  if(!OFFICIAL_SCHEDULES || OFFICIAL_SCHEDULES.length === 0){
    // Auto-build from local PDFs for fastest setup, then reload
    try{
      const el = document.getElementById('pdfBuildStatus');
      if(el) el.textContent = 'No official_schedules.json found. Building from Railway Data PDFs...';
      await buildSchedulesFromRailwayData();
      // buildSchedulesFromRailwayData triggers reload itself; stop initializing further
      return;
    }catch(e){
      console.warn('Auto-build from Railway Data failed:', e);
    }
  }
  
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
  
  // Initialize trains and schedules (after speeds are applied)
  if(OFFICIAL_SCHEDULES && OFFICIAL_SCHEDULES.length){
    initTrainsFromOfficial(100);
  } else {
    console.warn('official_schedules.json not found or empty; no synthetic schedules will be created since user requested official-only.');
    // If you still want a fallback, uncomment below line
    // initTrains(100);
  }

  // Start animation and simulated clock
  setInterval(() => {
    SIM_TIME = new Date(SIM_TIME.getTime() + TICK_SEC * 1000 * TIME_SCALE);
    var st = document.getElementById('simTime');
    if (st) st.innerText = SIM_TIME.toLocaleString();
    step();
  }, TICK_SEC * 1000);

  // Auto-compute metrics after warm-up so the snapshot table gets populated
  try{
    setTimeout(() => {
      if (typeof evaluatePerformance === 'function') {
        evaluatePerformance({ horizonMin: 60, stepSec: 30, truthDistKm: 1.5, oursDistKm: 2.0, baselineDistKm: 5.0 });
      }
    }, 8000);
  }catch(e){ /* ignore */ }
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
// Show current speed multiplier if UI exists
function refreshSpeedLabel(){
  const el = document.getElementById('speed');
  if(el) el.textContent = `${TIME_SCALE}x`;
  const dd = document.querySelector('select[onchange^="setSimSpeed"]');
  if(dd){
    // set to a matching option if available, else keep current selection
    const val = String(TIME_SCALE);
    const opt = Array.from(dd.options).find(o=>o.value===val);
    if(opt) dd.value = val;
  }
}
refreshSpeedLabel();

function setSimSpeed(mult){
  const m = Number(mult);
  if(!Number.isFinite(m) || m <= 0) return;
  TIME_SCALE = m;
  try{ localStorage.setItem('sim_speed_mult', String(m)); }catch(e){}
  refreshSpeedLabel();
}
window.setSimSpeed = setSimSpeed;

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
  // Detect collision risks using ESN + graph occupancy for next 30 minutes
  const risks = esnGdmCollisionRisks(trains, edges, index, 30, 30);
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
