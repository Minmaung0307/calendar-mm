import {
  lunarAge,
  moonPhaseName,
  myanmarMonthYear,
  yatyarzar,
  pyathadar,
  isUposatha,
  uposathaType,
} from "./myanmarCalendar.js";

// === Zodiac (ဘုရားစံရာသီ) ↔ Myanmar Months (သင်ပေးထားတဲ့ mapping) ===
const ZODIAC_BY_MM = {
  တန်ခူး: "မိဿ", // Mesa (Aries)
  ကဆုန်: "ပြိဿ", // Vrishabha (Taurus)
  နယုန်: "မေထုန်", // Mithuna (Gemini)
  ဝါဆို: "ကြဋ်", // Karkata (Cancer)
  ဝါခေါင်: "သိဟ်", // Simha (Leo)
  တော်သလင်း: "ကန်", // Kanya (Virgo)
  သီတင်းကျွတ်: "တူ", // Tula (Libra)
  တန်ဆောင်မုန်း: "ဗြိစ္ဆာ", // Vriscika (Scorpio)
  နတ်တော်: "ဓနု", // Dhanu (Sagittarius)
  ပြာသို: "မကာရ", // Makara (Capricorn)
  တပို့တွဲ: "ကုမ်", // Kumbha (Aquarius)
  တပေါင်း: "မိန်", // Mina (Pisces)
};

// === English Birthstones (common set) ===
// Index = Gregorian month (0=Jan … 11=Dec)
const BIRTHSTONES = [
  { name: "Garnet", emoji: "🔴" }, // Jan
  { name: "Amethyst", emoji: "💜" }, // Feb
  { name: "Aquamarine", emoji: "🔷" }, // Mar
  { name: "Diamond", emoji: "💎" }, // Apr
  { name: "Emerald", emoji: "🟢" }, // May
  { name: "Pearl", emoji: "⚪" }, // Jun (alt: Moonstone/Alexandrite)
  { name: "Ruby", emoji: "🔴" }, // Jul
  { name: "Peridot", emoji: "🟢" }, // Aug (alt: Spinel)
  { name: "Sapphire", emoji: "🔵" }, // Sep
  { name: "Opal", emoji: "🌈" }, // Oct (alt: Tourmaline)
  { name: "Topaz", emoji: "🟡" }, // Nov (alt: Citrine)
  { name: "Turquoise", emoji: "🟦" }, // Dec (alt: Tanzanite/Zircon)
];

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
const enMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Toggle Firebase usage
const USE_FIREBASE = false;

/* ===== Optional Firebase ===== */
const FB = {
  config: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_APP.firebaseapp.com",
    projectId: "YOUR_APP",
  },
};
let firestore;
let getDocs, collection;
async function initFirebaseIfNeeded() {
  if (!USE_FIREBASE) return;
  const appMod = await import(
    "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js"
  );
  const fsMod = await import(
    "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js"
  );
  const app = appMod.initializeApp(FB.config);
  firestore = fsMod.getFirestore(app);
  getDocs = fsMod.getDocs;
  collection = fsMod.collection;
}

/* ===== Poems ===== */
const POEMS = [
  { line: "လမင်းဝါ ညအေးရေတွင် အိပ်မက်ပုံရိပ်…", by: "Anonymous" },
  { line: "လလှိုင်းရောင် မျက်တောင်ထက် အေးမြလွန်း…", by: "သဒ္ဓါ" },
  { line: "တိတ်တဆိတ် မြို့ဝင်လမ်းပေါ် လရောင်ချောင်း…", by: "အင်္ဂါ" },
  { line: "ရိပ်မင်းလေ ညလိုင်းနှင့် နွမ်းလို့မနေရ…", by: "ထွန်းထွန်း" },
];
function rollPoem() {
  const one = POEMS[Math.floor(Math.random() * POEMS.length)];
  $("#poemLine").textContent = one.line;
  $("#poemAuthor").textContent = `— ${one.by}`;
}

/* ===== Holidays (MM & US) ===== */
const SOLAR_MM = {
  "01-04": "လွတ်လပ်ရေးနေ့",
  "02-12": "အမျိုးသားတော်လှန်ရေးနေ့",
  "03-27": "တပ်မတော်နေ့",
  "05-01": "အလုပ်သမားနေ့",
  "07-19": "အာဇာနည်နေ့",
  "12-25": "ခရစ်စမတ်နေ့",
};
const SOLAR_US_FIXED = {
  "01-01": "New Year's Day",
  "07-04": "Independence Day",
  "10-31": "Halloween",
  "12-25": "Christmas Day",
};
// Movables: Easter, Thanksgiving
function computeEaster(y) {
  const a = y % 19,
    b = Math.floor(y / 100),
    c = y % 100,
    d = Math.floor(b / 4),
    e = b % 4,
    f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4),
    k = c % 4,
    l = (32 + 2 * e + 2 * i - h - k) % 7,
    m = Math.floor((a + 11 * h + 22 * l) / 451),
    month = Math.floor((h + l - 7 * m + 114) / 31),
    day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}
function nthWeekdayOfMonth(year, monthIndex, weekday, n) {
  let count = 0;
  for (let d = 1; d <= 31; d++) {
    const dt = new Date(year, monthIndex, d);
    if (dt.getMonth() !== monthIndex) break;
    if (dt.getDay() === weekday) {
      count++;
      if (count === n) return d;
    }
  }
  return null;
}
function usMovables(year) {
  const easter = computeEaster(year);
  const thanks = nthWeekdayOfMonth(year, 10, 4, 4);
  const res = {};
  res[
    `${String(easter.month).padStart(2, "0")}-${String(easter.day).padStart(
      2,
      "0"
    )}`
  ] = "Easter (Western)";
  res[`11-${String(thanks).padStart(2, "0")}`] = "Thanksgiving (US)";
  return res;
}

/* ===== LocalStorage ===== */
const LS_CUSTOM = "myanmar_calendar_custom_v2";
const LS_NOTES = "myanmar_calendar_notes_v1";
const getCustom = () => JSON.parse(localStorage.getItem(LS_CUSTOM) || "[]");
const setCustom = (arr) => localStorage.setItem(LS_CUSTOM, JSON.stringify(arr));
const getNotes = () => JSON.parse(localStorage.getItem(LS_NOTES) || "{}");
const setNotes = (obj) => localStorage.setItem(LS_NOTES, JSON.stringify(obj));

/* ===== View ===== */
let view = new Date();
view.setDate(1);
let selectedISO = null;

/* ===== Controls ===== */
(function setupSelectors() {
  enMonths.forEach((m, i) => {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = `${i + 1}. ${m}`;
    $("#monthSel").appendChild(o);
  });
  for (let y = 1900; y <= 2100; y++) {
    const o = document.createElement("option");
    o.value = y;
    o.textContent = String(y);
    $("#yearSel").appendChild(o);
  }
})();
function syncSelectors() {
  $("#monthSel").value = view.getMonth();
  $("#yearSel").value = view.getFullYear();
}
$("#prevBtn").onclick = () => {
  view.setMonth(view.getMonth() - 1);
  render();
};
$("#nextBtn").onclick = () => {
  view.setMonth(view.getMonth() + 1);
  render();
};
$("#todayBtn").onclick = () => {
  const n = new Date();
  view = new Date(n.getFullYear(), n.getMonth(), 1);
  render();
};
$("#monthSel").onchange = () => {
  view.setMonth(+$("#monthSel").value);
  render();
};
$("#yearSel").onchange = () => {
  view.setFullYear(+$("#yearSel").value);
  render();
};
$("#themeBtn").onclick = () => {
  document.body.classList.toggle("dark");
  $("#themeBtn").textContent = document.body.classList.contains("dark")
    ? "☀ Light"
    : "☾ Dark";
};
$("#fontBtn").onclick = () => {
  document.documentElement.classList.toggle("serif");
};

/* ===== Backend Loader ===== */
async function loadBackendEvents(year) {
  const map = {};
  for (const k of Object.keys(SOLAR_MM)) {
    const [m, d] = k.split("-").map(Number);
    map[`${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`] =
      [{ type: "holiday", title: SOLAR_MM[k], region: "MM" }];
  }
  for (const k of Object.keys(SOLAR_US_FIXED)) {
    const [m, d] = k.split("-").map(Number);
    const key = `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(
      2,
      "0"
    )}`;
    map[key] = (map[key] || []).concat([
      { type: "holiday", title: SOLAR_US_FIXED[k], region: "US" },
    ]);
  }
  const mv = usMovables(year);
  for (const k of Object.keys(mv)) {
    const [m, d] = k.split("-");
    const key = `${year}-${m}-${d}`;
    map[key] = (map[key] || []).concat([
      { type: "festival", title: mv[k], region: "US" },
    ]);
  }
  getCustom().forEach((ev) => {
    if (ev.date.startsWith(String(year))) {
      map[ev.date] = (map[ev.date] || []).concat([
        {
          type: ev.type === "holiday" ? "holiday" : "festival",
          title: ev.title,
          region: "custom",
        },
      ]);
    }
  });
  try {
    const res = await fetch(`data/holidays.json`, { cache: "no-store" });
    if (res.ok) {
      const arr = await res.json();
      arr
        .filter((x) => x.date.startsWith(String(year)))
        .forEach((x) => {
          map[x.date] = (map[x.date] || []).concat([
            { type: x.type, title: x.title, region: x.region || "remote" },
          ]);
        });
    }
  } catch (e) {
    /* ignore */
  }
  // (Optional) Firebase
  // if(USE_FIREBASE){ await initFirebaseIfNeeded(); ... }
  return map;
}

function phaseBadge(age) {
  const n = moonPhaseName(age);
  if (n.includes("လပြည့်")) return { label: "လပြည့်", cls: "fullmoon" };
  if (n.includes("လကွယ်")) return { label: "လကွယ်", cls: "newmoon" };
  if (n.includes("လဆန်း")) return { label: "လဆန်း", cls: "waxing" };
  if (n.includes("လဆုတ်")) return { label: "လဆုတ်", cls: "waning" };
  return { label: n, cls: "moon" };
}

/* ===== Render ===== */
async function render() {
  rollPoem();
  syncSelectors();
  const y = view.getFullYear(),
    m = view.getMonth();
  const first = new Date(y, m, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Monday-first
  const days = new Date(y, m + 1, 0).getDate();
  const backend = await loadBackendEvents(y);
  $("#grid").innerHTML = "";

  for (let i = 0; i < startWeekday; i++) {
    const pad = document.createElement("div");
    pad.className = "day";
    pad.style.visibility = "hidden";
    grid.appendChild(pad);
  }

  const today = new Date();
  const isToday = (d) =>
    d === today.getDate() &&
    m === today.getMonth() &&
    y === today.getFullYear();

  for (let d = 1; d <= days; d++) {
    const cellDate = new Date(y, m, d);
    const iso = cellDate.toISOString().slice(0, 10);

    const age = lunarAge(cellDate);
    const phase = phaseBadge(age);
    const my = myanmarMonthYear(cellDate);
    const mmDay = Math.floor(age) + 1; // လရက်နံပါတ် (၁..၃၀)
    const upo = uposathaType(age); // ဥပုသ်/အဖိတ် (nullable)

    const zodiac = ZODIAC_BY_MM[my.myanmarMonth] || "";
    const mmLabel = zodiac ? `${my.myanmarMonth} (${zodiac})` : my.myanmarMonth;

    const tags = [];
    // လအခြေအနေ + ရက်နံပါတ် eg. "လဆန်း ၁၂", "လပြည့် ၁၅"
    tags.push(`<span class="tag moon">${phase.label} ${mmDay}</span>`);

    if (upo) tags.push(`<span class="tag fest">★ ${upo}</span>`);

    if (backend[iso]) {
      backend[iso].forEach((sp) => {
        const cls = sp.type === "holiday" ? "warn" : "fest";
        const icon = sp.type === "holiday" ? "⚠️" : "★";
        tags.push(`<span class="tag ${cls}">${icon} ${sp.title}</span>`);
      });
    }

    // နေ့မှတ်စု tag (ရှိရင်)
    const notes = getNotes();
    if (notes[iso]?.trim()) tags.push(`<span class="tag note">✎ Note</span>`);

    const el = document.createElement("div");
    el.className = "day" + (isToday(d) ? " today" : "");
    el.innerHTML = `
    <div class="nums">
      <div class="greg">${d}</div>
      <div class="myan">${mmLabel}</div>
    </div>
    <div class="tags">${tags.join("")}</div>
  `;
    el.onclick = () =>
      openDetails(cellDate, my, phase, backend[iso] || [], upo);
    grid.appendChild(el);
  }

  // Today bar
  const t = new Date();
  const tAge = lunarAge(t);
  const myT = myanmarMonthYear(t);
  const zodiacT = ZODIAC_BY_MM[myT.myanmarMonth] || "";
  const mmLabelT = zodiacT
    ? `${myT.myanmarMonth} (${zodiacT})`
    : myT.myanmarMonth;

  todayBar.innerHTML = `
  Today: ${enMonths[t.getMonth()]} ${t.getDate()}, ${t.getFullYear()} •
  မြန်မာ - ${mmLabelT} ${Math.floor(tAge) + 1}, ${myT.myanmarYear} •
  ${phaseBadge(tAge).label}
`;

  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
    } catch (e) {}
  }
}

function openDetails(date, my, phase, specials, upo) {
  const iso = date.toISOString().slice(0, 10);
  const age = lunarAge(date);
  const mmDay = Math.floor(age) + 1;

  const zodiac = ZODIAC_BY_MM[my.myanmarMonth] || "";
  const mmLabel = zodiac ? `${my.myanmarMonth} (${zodiac})` : my.myanmarMonth;

  const holi =
    (specials || [])
      .map(
        (s) =>
          `• ${s.type === "holiday" ? "⚠️" : "★"} ${
            s.title
          } <span class="muted">(${s.region || ""})</span>`
      )
      .join("<br>") || "—";

  // English birthstone for this month
  const bs = BIRTHSTONES[date.getMonth()];
  const bsText = `${bs.emoji} ${bs.name}`;

  const noteObj = getNotes();
  const val = noteObj[iso] || "";

  details.innerHTML = `
    <div class="title">${
      enMonths[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}</div>

    <div class="kv"><div class="k">မြန်မာလ:</div>
      <div>${mmLabel} ${mmDay} ရက်၊ ${my.myanmarYear}</div>
    </div>

    <div class="kv"><div class="k">လအခြေအနေ:</div>
      <div>${phase.label}</div>
    </div>

    <div class="kv"><div class="k">Birthstone:</div>
      <div>${bsText}</div>
    </div>

    <div class="kv"><div class="k">ဥပုသ်/အဖိတ်:</div>
      <div>${upo ? upo : "—"}</div>
    </div>

    <div class="kv"><div class="k">အထူးနေ့များ:</div>
      <div>${holi}</div>
    </div>

    <div class="notes">
      <h4>✎ နေ့စဉ် မှတ်စု</h4>
      <textarea id="noteText" rows="6" placeholder="ဒီနေ့ အကြောင်းပြောပါ…">${val.replace(
        /</g,
        "&lt;"
      )}</textarea>
      <div class="note-actions">
        <button id="saveNote" class="btn">သိမ်းမယ်</button>
        <button id="deleteNote" class="btn ghost">ဖျက်မယ်</button>
      </div>
      <div id="noteStatus" class="muted"></div>
    </div>
  `;

  $("#saveNote").onclick = () => {
    const txt = $("#noteText").value || "";
    const obj = getNotes();
    obj[iso] = txt;
    setNotes(obj);
    $("#noteStatus").textContent = "Saved.";
    render();
  };
  $("#deleteNote").onclick = () => {
    const obj = getNotes();
    delete obj[iso];
    setNotes(obj);
    $("#noteText").value = "";
    $("#noteStatus").textContent = "Deleted.";
    render();
  };
}

/* ===== Custom Add/Remove ===== */
$("#addCustom").onclick = () => {
  const date = $("#custDate").value;
  const title = $("#custTitle").value?.trim();
  const type = $("#custType").value;
  if (!date || !title) {
    alert("နေ့စွဲနဲ့ ခေါင်းစဉ်ကို ဖြည့်ပါ");
    return;
  }
  const cur = getCustom();
  cur.push({ date, title, type });
  setCustom(cur);
  $("#custTitle").value = "";
  $("#custDate").value = "";
  render();
};
$("#clearCustom").onclick = () => {
  if (confirm("ကိုယ်ပိုင်သတ်မှတ်ထားသမျှကို ဖျက်မလား?")) {
    localStorage.removeItem(LS_CUSTOM);
    render();
  }
};

/* ===== Boot ===== */
(async function boot() {
  await render();
})();
