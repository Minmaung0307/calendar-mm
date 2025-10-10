import {
  lunarAge, myanmarMonthYear,
  mmLunarInfoWithLength, uposathaPattern, // uposathaPattern may be removed; keep if you have it. If not, we'll inline.
  monthLengthFor
} from './myanmarCalendar.js';

// Fallback for uposathaPattern if not exported in your module
function uposathaPatternLocal(mmName, myYear){
  const len = monthLengthFor(mmName, myYear);
  return { length: len, pattern: (len===30 ? "8/15 8/15" : "8/15 8/14") };
}
const getPattern = (mmName, myYear) => (typeof uposathaPattern === 'function' ? uposathaPattern(mmName, myYear) : uposathaPatternLocal(mmName, myYear));

const ZODIAC_BY_MM = {
  တန်ခူး: "မိဿ", ကဆုန်: "ပြိဿ", နယုန်: "မေထုန်", ဝါဆို: "ကြဋ်",
  ဝါခေါင်: "သိဟ်", တော်သလင်း: "ကန်", သီတင်းကျွတ်: "တူ",
  တန်ဆောင်မုန်း: "ဗြိစ္ဆာ", နတ်တော်: "ဓနု", ပြာသို: "မကာရ",
  တပို့တွဲ: "ကုမ်", တပေါင်း: "မိန်"
};

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

const enMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const POEMS = [
  { line:"လမင်းဝါ ညအေးရေတွင် အိပ်မက်ပုံရိပ်…", by:"Anonymous" },
  { line:"လလှိုင်းရောင် မျက်တောင်ထက် အေးမြလွန်း…", by:"သဒ္ဓါ" },
  { line:"တိတ်တဆိတ် မြို့ဝင်လမ်းပေါ် လရောင်ချောင်း…", by:"အင်္ဂါ" },
  { line:"ရိပ်မင်းလေ ညလိုင်းနှင့် နွမ်းလို့မနေရ…", by:"ထွန်းထွန်း" }
];
function rollPoem(){
  const one = POEMS[Math.floor(Math.random()*POEMS.length)];
  $("#poemLine").textContent = one.line;
  $("#poemAuthor").textContent = `— ${one.by}`;
}

// Holidays (same as before)
const SOLAR_MM = {"01-04":"လွတ်လပ်ရေးနေ့","02-12":"အမျိုးသားတော်လှန်ရေးနေ့","03-27":"တပ်မတော်နေ့","05-01":"အလုပ်သမားနေ့","07-19":"အာဇာနည်နေ့","12-25":"ခရစ်စမတ်နေ့"};
const SOLAR_US_FIXED = {"01-01":"New Year's Day","07-04":"Independence Day","10-31":"Halloween","12-25":"Christmas Day"};
function computeEaster(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=((h+l-7*m+114)%31)+1;return {month, day};}
function nthWeekdayOfMonth(year, monthIndex, weekday, n){let count=0;for(let d=1; d<=31; d++){const dt=new Date(year, monthIndex, d);if(dt.getMonth()!==monthIndex) break; if(dt.getDay()===weekday){count++; if(count===n) return d;}} return null;}
function usMovables(year){const easter=computeEaster(year); const thanks=nthWeekdayOfMonth(year, 10, 4, 4); const res={}; res[`${String(easter.month).padStart(2,'0')}-${String(easter.day).padStart(2,'0')}`]="Easter (Western)"; res[`11-${String(thanks).padStart(2,'0')}`]="Thanksgiving (US)"; return res;}

const LS_CUSTOM = "myanmar_calendar_custom_v2";
const LS_NOTES  = "myanmar_calendar_notes_v1";
const getCustom = ()=>JSON.parse(localStorage.getItem(LS_CUSTOM)||"[]");
const setCustom = (arr)=>localStorage.setItem(LS_CUSTOM, JSON.stringify(arr));
const getNotes  = ()=>JSON.parse(localStorage.getItem(LS_NOTES)||"{}");
const setNotes  = (obj)=>localStorage.setItem(LS_NOTES, JSON.stringify(obj));

let view = new Date(); view.setDate(1);
let selectedISO = null;

(function setupSelectors(){
  enMonths.forEach((m,i)=>{
    const o=document.createElement("option"); o.value=i; o.textContent=`${i+1}. ${m}`;
    $("#monthSel").appendChild(o);
  });
  for(let y=1900; y<=2100; y++){
    const o=document.createElement("option"); o.value=y; o.textContent=String(y);
    $("#yearSel").appendChild(o);
  }
})();
function syncSelectors(){ $("#monthSel").value=view.getMonth(); $("#yearSel").value=view.getFullYear(); }
$("#prevBtn").onclick=()=>{ view.setMonth(view.getMonth()-1); render(); };
$("#nextBtn").onclick=()=>{ view.setMonth(view.getMonth()+1); render(); };
$("#todayBtn").onclick=()=>{ const n=new Date(); view=new Date(n.getFullYear(), n.getMonth(), 1); render(); };
$("#monthSel").onchange=()=>{ view.setMonth(+$("#monthSel").value); render(); };
$("#yearSel").onchange=()=>{ view.setFullYear(+$("#yearSel").value); render(); };
$("#themeBtn").onclick=()=>{
  document.body.classList.toggle("dark");
  $("#themeBtn").textContent = document.body.classList.contains("dark") ? "☀ Light" : "☾ Dark";
};
$("#fontBtn").onclick=()=>{ document.documentElement.classList.toggle("serif"); };

async function loadBackendEvents(year){
  const map={};
  for(const k of Object.keys(SOLAR_MM)){
    const [m,d]=k.split("-").map(Number);
    map[`${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`]=[{type:"holiday",title:SOLAR_MM[k],region:"MM"}];
  }
  for(const k of Object.keys(SOLAR_US_FIXED)){
    const [m,d]=k.split("-").map(Number);
    const key=`${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    map[key]=(map[key]||[]).concat([{type:"holiday",title:SOLAR_US_FIXED[k],region:"US"}]);
  }
  const mv=usMovables(year);
  for(const k of Object.keys(mv)){
    const [m,d]=k.split("-");
    const key=`${year}-${m}-${d}`;
    map[key]=(map[key]||[]).concat([{type:"festival",title:mv[k],region:"US"}]);
  }
  getCustom().forEach(ev=>{
    if(ev.date.startsWith(String(year))){
      map[ev.date]=(map[ev.date]||[]).concat([{type:ev.type==="holiday"?"holiday":"festival",title:ev.title,region:"custom"}]);
    }
  });
  try{
    const res=await fetch(`data/holidays.json`,{cache:"no-store"});
    if(res.ok){
      const arr=await res.json();
      arr.filter(x=>x.date.startsWith(String(year))).forEach(x=>{
        map[x.date]=(map[x.date]||[]).concat([{type:x.type,title:x.title,region:x.region||"remote"}]);
      });
    }
  }catch(e){/* ignore */}
  return map;
}

async function render(){
  rollPoem();
  syncSelectors();
  const y=view.getFullYear(), m=view.getMonth();
  const first=new Date(y,m,1);
  const startWeekday=(first.getDay()+6)%7; // Monday-first
  const days=new Date(y,m+1,0).getDate();
  const backend=await loadBackendEvents(y);
  grid.innerHTML="";

  for(let i=0;i<startWeekday;i++){
    const pad=document.createElement("div");
    pad.className="day pad"; // style as placeholder but same height
    grid.appendChild(pad);
  }

  const today=new Date();
  const isToday=(d)=> d===today.getDate() && m===today.getMonth() && y===today.getFullYear();

  for(let d=1; d<=days; d++){
    const cellDate=new Date(y,m,d);
    const iso=cellDate.toISOString().slice(0,10);

    const age=lunarAge(cellDate);
    const my = myanmarMonthYear(cellDate);
    const info = mmLunarInfoWithLength(age, my.myanmarMonth, my.myanmarYear);
    const { pattern } = getPattern(my.myanmarMonth, my.myanmarYear);

    const tags=[];
    if (info.kind === "waxing" || info.kind === "waning") {
      tags.push(`<span class="tag moon">${info.phase} ${info.number}</span>`);
    } else {
      tags.push(`<span class="tag moon">${info.phase}</span>`);
    }

    if(backend[iso]){
      backend[iso].forEach(sp=>{
        const cls=sp.type==="holiday"?"warn":"fest";
        const icon=sp.type==="holiday"?"⚠️":"★";
        tags.push(`<span class="tag ${cls}">${icon} ${sp.title}</span>`);
      });
    }

    const notes=getNotes();
    if(notes[iso]?.trim()) tags.push(`<span class="tag note">✎ Note</span>`);

    const el=document.createElement("div");
    el.className="day"+(isToday(d)?" today":"");
    el.innerHTML=`
      <div class="nums">
        <div class="greg">${d}</div>
        <div class="myan">${my.myanmarMonth}</div>
      </div>
      <div class="tags" title="${tags.map(t=>t.replace(/<[^>]+>/g,'')).join(' • ')}">${tags.join("")}</div>
    `;
    el.onclick=()=> openDetails(cellDate, my, info, backend[iso]||[], pattern);
    grid.appendChild(el);
  }

  // Today bar — "<Myanmar Month> (Zodiac)"
  const t=new Date();
  const myT=myanmarMonthYear(t);
  const zodiac = ZODIAC_BY_MM[myT.myanmarMonth] ? ` (${ZODIAC_BY_MM[myT.myanmarMonth]}ရာသီ)` : "";
  todayBar.innerHTML = `${myT.myanmarMonth}လ${zodiac}`;

  if('serviceWorker' in navigator){
    try{ await navigator.serviceWorker.register('./service-worker.js'); }catch(e){}
  }
}

function openDetails(date, my, info, specials, pattern){
  const iso=date.toISOString().slice(0,10);
  const holi=(specials||[]).map(s=>`• ${s.type==="holiday"?"⚠️":"★"} ${s.title} <span class="muted">(${s.region||""})</span>`).join("<br>") || "—";
  const noteObj=getNotes(); const val=noteObj[iso]||"";

  const moonLine = (info.kind === "waxing" || info.kind === "waning")
    ? `${info.phase} ${info.number}`
    : `${info.phase} ${info.uposathaDay ? `(${info.uposathaDay})` : ""}`;

  details.innerHTML = `
    <div class="title">${enMonths[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}</div>

    <div class="kv"><div class="k">မြန်မာလ:</div>
      <div>${my.myanmarMonth} ${info.number ? info.number + " ရက်, " : ""}${my.myanmarYear}</div>
    </div>

    <div class="kv"><div class="k">လအခြေအနေ:</div>
      <div>${moonLine}</div>
    </div>

    <div class="kv"><div class="k">ဥပုသ်ပုံစံ:</div>
      <div>${pattern} <span class="muted">(Waxing/Full • Waning/New)</span></div>
    </div>

    <div class="kv"><div class="k">အထူးနေ့များ:</div>
      <div>${holi}</div>
    </div>

    <div class="notes">
      <h4>✎ နေ့စဉ် မှတ်စု</h4>
      <textarea id="noteText" rows="6" placeholder="ဒီနေ့ အကြောင်းပြောပါ…">${val.replace(/</g,"&lt;")}</textarea>
      <div class="note-actions">
        <button id="saveNote" class="btn">သိမ်းမယ်</button>
        <button id="deleteNote" class="btn ghost">ဖျက်မယ်</button>
      </div>
      <div id="noteStatus" class="muted"></div>
    </div>
  `;

  $("#saveNote").onclick=()=>{
    const txt=$("#noteText").value||"";
    const obj=getNotes(); obj[iso]=txt; setNotes(obj);
    $("#noteStatus").textContent="Saved."; render();
  };
  $("#deleteNote").onclick=()=>{
    const obj=getNotes(); delete obj[iso]; setNotes(obj);
    $("#noteText").value=""; $("#noteStatus").textContent="Deleted."; render();
  };
}

// Custom add/remove (unchanged)
$("#addCustom").onclick=()=>{
  const date=$("#custDate").value;
  const title=$("#custTitle").value?.trim();
  const type=$("#custType").value;
  if(!date || !title){ alert("နေ့စွဲနဲ့ ခေါင်းစဉ်ကို ဖြည့်ပါ"); return; }
  const cur=getCustom(); cur.push({date,title,type});
  setCustom(cur); $("#custTitle").value=""; $("#custDate").value="";
  render();
};
$("#clearCustom").onclick=()=>{
  if(confirm("ကိုယ်ပိုင်သတ်မှတ်ထားသမျှကို ဖျက်မလား?")){
    localStorage.removeItem(LS_CUSTOM); render();
  }
};

(async function boot(){ await render(); })();
