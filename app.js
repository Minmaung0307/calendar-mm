import { lunarAge, moonPhaseName, myanmarMonthYear, yatyarzar, pyathadar } from './myanmarCalendar.js';

/* ===== DOM ===== */
const $ = (q) => document.querySelector(q);
const grid = $("#grid");
const details = $("#details");
const monthSel = $("#monthSel");
const yearSel = $("#yearSel");
const prevBtn = $("#prevBtn");
const nextBtn = $("#nextBtn");
const todayBtn = $("#todayBtn");
const themeBtn = $("#themeBtn");
const fontBtn = $("#fontBtn");
const todayBar = $("#todayBar");
const poemLine = $("#poemLine");
const poemAuthor = $("#poemAuthor");

/* ===== Configs ===== */
const enMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const mmMonths = ["တန်ခူး","ကဆုန်","နယုန်","ဝါဆို","ဝါခေါင်","တော်သလင်း","သီတင်းကျွတ်","တန်ဆောင်မုန်း","နတ်တော်","ပေါင်း","တပေါင်း","တပို့တွဲ"];

// Toggle this to use Firebase instead of JSON endpoint
const USE_FIREBASE = false;

/* ===== Optional Firebase =====
   - Fill your config below if USE_FIREBASE = true
   - Firestore collections:
       holidays (fields: date: "YYYY-MM-DD", title: string, type: "holiday"|"festival", region: "MM"|"US")
*/
const FB = {
  config: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_APP.firebaseapp.com",
    projectId: "YOUR_APP",
  }
};
// Lazy import Firestore if enabled
let firestore; let getDocs, collection;

async function initFirebaseIfNeeded(){
  if(!USE_FIREBASE) return;
  const appMod = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js');
  const fsMod = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js');
  const app = appMod.initializeApp(FB.config);
  firestore = fsMod.getFirestore(app);
  getDocs = fsMod.getDocs;
  collection = fsMod.collection;
}

/* ===== Poems ===== */
const POEMS = [
  { line:"လင်္ဂါရပ်လမင်းပျံ့ အိပ်မက်ကဝဏ်…", by:"သဒ္ဓါ" },
  { line:"လအပြောင် သံယောဇဉ်ချက်လှမ်း၍…", by:"ထွန်းထွန်း" },
  { line:"နွားတောင်ရွာပေါ် လရောင်ဝါးတန်း…", by:"အင်္ဂါ" },
  { line:"မျိုးဆက်တွေကို အေးချမ်းအောင်照 လမင်း…", by:"Anonymous" }
];
function rollPoem(){
  const one = POEMS[Math.floor(Math.random()*POEMS.length)];
  poemLine.textContent = one.line;
  poemAuthor.textContent = `— ${one.by}`;
}

/* ===== Holidays (Solar fixed for MM + US), English movable days ===== */
// Myanmar (sample fixed solar)
const SOLAR_MM = {
  "01-04":"လွတ်လပ်ရေးနေ့",
  "02-12":"အမျိုးသားတော်လှန်ရေးနေ့",
  "03-27":"တပ်မတော်နေ့",
  "05-01":"အလုပ်သမားနေ့",
  "07-19":"အာဇာနည်နေ့",
  "12-25":"ခရစ်စမတ်နေ့"
};
// US/English (fixed)
const SOLAR_US_FIXED = {
  "01-01":"New Year's Day",
  "07-04":"Independence Day",
  "10-31":"Halloween",
  "12-25":"Christmas Day"
};
// US Movable: Easter (Western), Thanksgiving (4th Thu of Nov)
function computeEaster(y){
  // Meeus/Jones/Butcher
  const a = y % 19;
  const b = Math.floor(y/100);
  const c = y % 100;
  const d = Math.floor(b/4);
  const e = b % 4;
  const f = Math.floor((b+8)/25);
  const g = Math.floor((b - f + 1)/3);
  const h = (19*a + b - d - g + 15) % 30;
  const i = Math.floor(c/4);
  const k = c % 4;
  const l = (32 + 2*e + 2*i - h - k) % 7;
  const m = Math.floor((a + 11*h + 22*l)/451);
  const month = Math.floor((h + l - 7*m + 114)/31); // 3=Mar, 4=Apr
  const day = ((h + l - 7*m + 114) % 31) + 1;
  return {month, day}; // month is 3 or 4
}
function nthWeekdayOfMonth(year, monthIndex, weekday, n){
  // weekday: 0=Sun .. 6=Sat
  let count = 0;
  for(let d=1; d<=31; d++){
    const dt = new Date(year, monthIndex, d);
    if(dt.getMonth()!==monthIndex) break;
    if(dt.getDay()===weekday){
      count++;
      if(count===n) return d;
    }
  }
  return null;
}
function usMovables(year){
  const easter = computeEaster(year);
  const thanks = nthWeekdayOfMonth(year, 10/*Nov*/, 4/*Thu*/, 4);
  const res = {};
  res[`${String(easter.month).padStart(2,'0')}-${String(easter.day).padStart(2,'0')}`] = "Easter (Western)";
  res[`11-${String(thanks).padStart(2,'0')}`] = "Thanksgiving (US)";
  return res;
}

/* ===== Custom Events (LocalStorage) ===== */
const LS_CUSTOM = "myanmar_calendar_custom_v2";
const LS_NOTES = "myanmar_calendar_notes_v1";
const getCustom = () => JSON.parse(localStorage.getItem(LS_CUSTOM) || "[]");
const setCustom = (arr) => localStorage.setItem(LS_CUSTOM, JSON.stringify(arr));
const getNotes = () => JSON.parse(localStorage.getItem(LS_NOTES) || "{}");
const setNotes = (obj) => localStorage.setItem(LS_NOTES, JSON.stringify(obj));

/* ===== View State ===== */
let view = new Date(); view.setDate(1);
let selectedISO = null;

/* ===== Controls ===== */
(function setupSelectors(){
  enMonths.forEach((m, i)=>{
    const opt = document.createElement("option");
    opt.value = i; opt.textContent = `${i+1}. ${m}`;
    monthSel.appendChild(opt);
  });
  for(let y=1900; y<=2100; y++){
    const opt = document.createElement("option");
    opt.value = y; opt.textContent = `${y}`;
    yearSel.appendChild(opt);
  }
})();
function syncSelectors(){ monthSel.value = view.getMonth(); yearSel.value = view.getFullYear(); }
prevBtn.onclick = ()=>{ view.setMonth(view.getMonth()-1); render(); };
nextBtn.onclick = ()=>{ view.setMonth(view.getMonth()+1); render(); };
todayBtn.onclick = ()=>{ const now=new Date(); view=new Date(now.getFullYear(), now.getMonth(), 1); render(); };
monthSel.onchange = ()=>{ view.setMonth(+monthSel.value); render(); };
yearSel.onchange = ()=>{ view.setFullYear(+yearSel.value); render(); };
themeBtn.onclick = ()=>{
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark") ? "☀ Light" : "☾ Dark";
};
fontBtn.onclick = ()=>{
  document.documentElement.classList.toggle("serif");
};

/* ===== Backend Loader (JSON or Firebase) ===== */
async function loadBackendEvents(year){
  // Merge order: MM solar → US fixed → US movable → custom → remote JSON/Firebase
  const map = {};

  // MM solar
  for(const k of Object.keys(SOLAR_MM)){
    const [m,d] = k.split("-").map(x=>+x);
    map[`${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`] = [{type:"holiday", title: SOLAR_MM[k], region:"MM"}];
  }
  // US fixed
  for(const k of Object.keys(SOLAR_US_FIXED)){
    const [m,d] = k.split("-").map(x=>+x);
    const key = `${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    map[key] = (map[key]||[]).concat([{type:"holiday", title: SOLAR_US_FIXED[k], region:"US"}]);
  }
  // US movables
  const mv = usMovables(year);
  for(const k of Object.keys(mv)){
    const [m,d] = k.split("-");
    const key = `${year}-${m}-${d}`;
    map[key] = (map[key]||[]).concat([{type:"festival", title: mv[k], region:"US"}]);
  }
  // Custom localStorage
  getCustom().forEach(ev=>{
    if(ev.date.startsWith(String(year))){
      map[ev.date] = (map[ev.date]||[]).concat([{type: ev.type==="holiday"?"holiday":"festival", title: ev.title, region:"custom"}]);
    }
  });

  // Remote JSON (optional file: data/holidays.json)
  try{
    const res = await fetch(`data/holidays.json`, {cache:"no-store"});
    if(res.ok){
      const arr = await res.json(); // [{date:"YYYY-MM-DD", title:"...", type:"holiday"|"festival", region:"MM"|"US"|...}]
      arr.filter(x=>x.date.startsWith(String(year))).forEach(x=>{
        map[x.date] = (map[x.date]||[]).concat([{type:x.type, title:x.title, region:x.region||"remote"}]);
      });
    }
  }catch(e){ /* ignore if not present */ }

  // Firebase (optional)
  if(USE_FIREBASE){
    await initFirebaseIfNeeded();
    const snap = await getDocs(collection(firestore, "holidays"));
    snap.forEach(doc=>{
      const x = doc.data();
      if(x?.date?.startsWith(String(year))){
        map[x.date] = (map[x.date]||[]).concat([{type:x.type||"festival", title:x.title||"", region:x.region||"FB"}]);
      }
    });
  }
  return map; // { "YYYY-MM-DD": [ {type,title,region}, ... ] }
}

/* ===== Render ===== */
function phaseBadge(age){
  const name = moonPhaseName(age);
  if(name.includes("လပြည့်")) return {label:"လပြည့်", cls:"fullmoon"};
  if(name.includes("လကွယ်")) return {label:"လကွယ်", cls:"newmoon"};
  if(name.includes("လဆန်း")) return {label:"လဆန်း", cls:"waxing"};
  if(name.includes("လဆုတ်")) return {label:"လဆုတ်", cls:"waning"};
  return {label:name, cls:"moon"};
}

async function render(){
  rollPoem();
  syncSelectors();
  const y = view.getFullYear(), m = view.getMonth();
  const first = new Date(y, m, 1);
  const startWeekday = (first.getDay()+6)%7; // Monday-first
  const days = new Date(y, m+1, 0).getDate();
  const backend = await loadBackendEvents(y);
  grid.innerHTML = "";

  for(let i=0;i<startWeekday;i++){
    const pad = document.createElement("div");
    pad.className = "day"; pad.style.visibility="hidden";
    grid.appendChild(pad);
  }

  const today = new Date();
  const isToday = (d)=> d===today.getDate() && m===today.getMonth() && y===today.getFullYear();

  for(let d=1; d<=days; d++){
    const cellDate = new Date(y, m, d);
    const iso = cellDate.toISOString().slice(0,10);
    const age = lunarAge(cellDate);
    const phase = phaseBadge(age);

    const my = myanmarMonthYear(cellDate);

    const tags = [];
    tags.push(`<span class="tag moon">${phase.label}</span>`);
    if(backend[iso]){
      backend[iso].forEach(sp=>{
        const cls = sp.type==="holiday" ? "warn" : "fest";
        const icon = sp.type==="holiday" ? "⚠️" : "★";
        tags.push(`<span class="tag ${cls}">${icon} ${sp.title}</span>`);
      });
    }
    // Has note?
    const noteObj = getNotes();
    if(noteObj[iso]?.trim()){
      tags.push(`<span class="tag note">✎ Note</span>`);
    }

    const el = document.createElement("div");
    el.className = "day"+(isToday(d)?" today":"");
    el.innerHTML = `
      <div class="nums">
        <div class="greg">${d}</div>
        <div class="myan">${my.myanmarMonth} ${d}</div>
      </div>
      <div class="tags">${tags.join("")}</div>
    `;
    el.onclick = ()=> openDetails(cellDate, my, phase, backend[iso]||[]);
    grid.appendChild(el);
  }

  // Today bar
  const t = new Date();
  const tAge = lunarAge(t);
  todayBar.innerHTML = `
    Today: ${enMonths[t.getMonth()]} ${t.getDate()}, ${t.getFullYear()} •
    မြန်မာ - ${myanmarMonthYear(t).myanmarMonth} ${t.getDate()}, ${myanmarMonthYear(t).myanmarYear} •
    ${phaseBadge(tAge).label} • ရက်ရာဇာ: <strong>${yatyarzar(t)}</strong> • ပြဿဒါး: <strong>${pyathadar(t)}</strong>
  `;

  // register SW (PWA)
  if('serviceWorker' in navigator){
    try{ await navigator.serviceWorker.register('./service-worker.js'); }catch(e){}
  }
}

function openDetails(date, my, phase, specials){
  selectedISO = date.toISOString().slice(0,10);
  const holidayLines = (specials||[]).map(s=>`• ${s.type==="holiday"?"⚠️":"★"} ${s.title} <span class="muted">(${s.region})</span>`).join("<br>") || "—";
  const noteObj = getNotes();
  const value = noteObj[selectedISO]||"";

  details.innerHTML = `
    <div class="title">${enMonths[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}</div>
    <div class="kv"><div class="k">မြန်မာလ:</div><div>${my.myanmarMonth} ${date.getDate()}, ${my.myanmarYear}</div></div>
    <div class="kv"><div class="k">လအခြေအနေ:</div><div>${phase.label}</div></div>
    <div class="kv"><div class="k">ရက်ရာဇာ:</div><div>${yatyarzar(date)}</div></div>
    <div class="kv"><div class="k">ပြဿဒါး:</div><div>${pyathadar(date)}</div></div>
    <div class="kv"><div class="k">အထူးနေ့များ:</div><div>${holidayLines}</div></div>

    <div class="notes">
      <h4>✎ နေ့စဉ် မှတ်စု</h4>
      <textarea id="noteText" rows="6" placeholder="ဒီနေ့ အကြောင်းပြောပါ…">${value.replace(/</g,"&lt;")}</textarea>
      <div class="note-actions">
        <button id="saveNote" class="btn">သိမ်းမယ်</button>
        <button id="deleteNote" class="btn ghost">ဖျက်မယ်</button>
      </div>
      <div id="noteStatus" class="muted"></div>
    </div>
  `;

  // Wire note handlers
  $("#saveNote").onclick = ()=>{
    const txt = $("#noteText").value || "";
    const obj = getNotes();
    obj[selectedISO] = txt;
    setNotes(obj);
    $("#noteStatus").textContent = "Saved.";
    render(); // refresh tags
  };
  $("#deleteNote").onclick = ()=>{
    const obj = getNotes();
    delete obj[selectedISO];
    setNotes(obj);
    $("#noteText").value = "";
    $("#noteStatus").textContent = "Deleted.";
    render();
  };
}

/* ===== Custom Add/Remove ===== */
$("#addCustom").onclick = ()=>{
  const date = $("#custDate").value;
  const title = $("#custTitle").value?.trim();
  const type = $("#custType").value;
  if(!date || !title){ alert("နေ့စွဲနဲ့ ခေါင်းစဉ်ကိုဖြည့်ပါ"); return; }
  const cur = getCustom();
  cur.push({date, title, type});
  setCustom(cur);
  $("#custTitle").value = ""; $("#custDate").value = "";
  render();
};
$("#clearCustom").onclick = ()=>{
  if(confirm("ကိုယ်ပိုင်သတ်မှတ်ထားသမျှကို ဖျက်မလား?")){ localStorage.removeItem(LS_CUSTOM); render(); }
};

/* ===== Boot ===== */
(async function boot(){
  // Fill selectors & render
  await render();
})();