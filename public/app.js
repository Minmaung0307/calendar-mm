import {
  lunarAge,
  myanmarMonthYearLunar as myanmarMonthYear,
  mmLunarInfoWithLength,
  monthLengthFor,
  initCalendarMeta, // ← add
  labelWaso, // ← add
} from "./myanmarCalendar.js";

/* Local YYYY-MM-DD to avoid timezone drift */
function ymdLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function normalizeYMD(s) {
  if (!s) return s;
  const m = s.trim().match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/);
  if (!m) return s;
  const y = m[1],
    mo = String(+m[2]).padStart(2, "0"),
    dd = String(+m[3]).padStart(2, "0");
  return `${y}-${mo}-${dd}`;
}

// Arabic → Myanmar digits (e.g., 10 -> ၁၀)
function toMMDigits(n) {
  const map = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];
  return String(n).replace(/\d/g, (d) => map[+d]);
}

// Gregorian month (0=Jan .. 11=Dec) → Birthstone name + icon
// Gregorian month (0=Jan .. 11=Dec) → Birthstone (EN + MM) + icon
const BIRTHSTONES = [
  { en: "Garnet", mm: "ဂါနက်", icon: "🔴" }, // Jan
  { en: "Amethyst", mm: "အမက်သစ်", icon: "🟣" }, // Feb
  { en: "Aquamarine", mm: "အောက်ဝါရီမရင်း", icon: "🩵" }, // Mar
  { en: "Diamond", mm: "စိန်", icon: "💎" }, // Apr
  { en: "Emerald", mm: "ကျောက်စိမ်း", icon: "🟢" }, // May
  { en: "Pearl / Alexandrite", mm: "ပုလဲ / အလက်ဇန်ဒရိုက်", icon: "⚪️" }, // Jun
  { en: "Ruby", mm: "ပတ္တမြား", icon: "🟥" }, // Jul
  { en: "Peridot", mm: "ပယ်ရီဒော့", icon: "🟩" }, // Aug
  { en: "Sapphire", mm: "နီလာ (Sapphire)", icon: "🔷" }, // Sep
  { en: "Opal / Tourmaline", mm: "ဩပယ် / တွမာလင်း", icon: "🟠" }, // Oct
  { en: "Topaz / Citrine", mm: "တိုးပတ် / စီထရင်း", icon: "🟡" }, // Nov
  { en: "Turquoise / Tanzanite", mm: "တူရကိုက် / တန်ဇိုနိုက်", icon: "🔹" }, // Dec
];

/* Today bar zodiac only */
const ZODIAC_BY_MM = {
  တန်ခူး: "မိဿ",
  ကဆုန်: "ပြိဿ",
  နယုန်: "မေထုန်",
  ဝါဆို: "ကြဋ်",
  ဝါခေါင်: "သိဟ်",
  တော်သလင်း: "ကန်",
  သီတင်းကျွတ်: "တူ",
  တန်ဆောင်မုန်း: "ဗြိစ္ဆာ",
  နတ်တော်: "ဓနု",
  ပြာသို: "မကာရ",
  တပို့တွဲ: "ကုမ်",
  တပေါင်း: "မိန်",
};

// === Calendar Themes by Myanmar Month ===
const CALENDAR_THEMES = {
  တန်ခူး: {
    name: "summer",
    color: "#ffcf33",
    bg: "linear-gradient(120deg,#ffecb3,#ffd54f)",
  },
  ကဆုန်: {
    name: "blossom",
    color: "#ff99cc",
    bg: "linear-gradient(120deg,#ffe6f2,#ffb3d9)",
  },
  နယုန်: {
    name: "sunrise",
    color: "#ff9966",
    bg: "linear-gradient(120deg,#ffe0b2,#ffb380)",
  },
  ဝါဆို: {
    name: "rain",
    color: "#4fc3f7",
    bg: "linear-gradient(120deg,#b3e5fc,#81d4fa)",
  },
  ဝါခေါင်: {
    name: "cloud",
    color: "#90a4ae",
    bg: "linear-gradient(120deg,#cfd8dc,#90a4ae)",
  },
  တော်သလင်း: {
    name: "wind",
    color: "#a5d6a7",
    bg: "linear-gradient(120deg,#c8e6c9,#a5d6a7)",
  },
  သီတင်းကျွတ်: {
    name: "festival",
    color: "#ff7043",
    bg: "linear-gradient(120deg,#ffccbc,#ffab91)",
  },
  တန်ဆောင်မုန်း: {
    name: "firelight",
    color: "#ff5252",
    bg: "linear-gradient(120deg,#ff8a80,#ff5252)",
  },
  နတ်တော်: {
    name: "royal",
    color: "#ba68c8",
    bg: "linear-gradient(120deg,#e1bee7,#ce93d8)",
  },
  ပြာသို: {
    name: "winter",
    color: "#80deea",
    bg: "linear-gradient(120deg,#b2ebf2,#80deea)",
  },
  တပို့တွဲ: {
    name: "snow",
    color: "#b0bec5",
    bg: "linear-gradient(120deg,#eceff1,#cfd8dc)",
  },
  တပေါင်း: {
    name: "newyear",
    color: "#81c784",
    bg: "linear-gradient(120deg,#c8e6c9,#81c784)",
  },
};

const $ = (q) => document.querySelector(q);
const grid = $("#grid");
const monthSel = $("#monthSel");
const yearSel = $("#yearSel");
const prevBtn = $("#prevBtn");
const nextBtn = $("#nextBtn");
const todayBtn = $("#todayBtn");
const themeBtn = $("#themeBtn");
const fontBtn = $("#fontBtn");
const todayBar = $("#todayBar");

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

/* Holidays */
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

/* LocalStorage (custom events) */
const LS_CUSTOM = "myanmar_calendar_custom_v4";
const getCustom = () => {
  try {
    const raw = localStorage.getItem(LS_CUSTOM);
    const arr = raw ? JSON.parse(raw) : [];
    return arr.map((x) => ({ ...x, date: normalizeYMD(x.date) }));
  } catch (e) {
    return [];
  }
};
const setCustom = (arr) => localStorage.setItem(LS_CUSTOM, JSON.stringify(arr));

/* View */
let view = new Date();
view.setDate(1);

/* Controls */
// Month/Year options
(function setupSelectors() {
  if (!monthSel || !yearSel) return;
  const months = [
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
  monthSel.innerHTML = "";
  months.forEach((m, i) => {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = `${i + 1}. ${m}`;
    monthSel.appendChild(o);
  });
  yearSel.innerHTML = "";
  for (let y = 1900; y <= 2100; y++) {
    const o = document.createElement("option");
    o.value = y;
    o.textContent = String(y);
    yearSel.appendChild(o);
  }
})();

function syncSelectors() {
  if (!monthSel || !yearSel) return;
  monthSel.value = view.getMonth();
  yearSel.value = view.getFullYear();
}

// Listeners
if (prevBtn)
  prevBtn.onclick = () => {
    view.setMonth(view.getMonth() - 1);
    render();
  };
if (nextBtn)
  nextBtn.onclick = () => {
    view.setMonth(view.getMonth() + 1);
    render();
  };
if (todayBtn)
  todayBtn.onclick = () => {
    const n = new Date();
    view = new Date(n.getFullYear(), n.getMonth(), 1);
    render();
  };
if (monthSel)
  monthSel.onchange = () => {
    view.setMonth(+monthSel.value);
    render();
  };
if (yearSel)
  yearSel.onchange = () => {
    view.setFullYear(+yearSel.value);
    render();
  };
if (themeBtn)
  themeBtn.onclick = () => {
    document.body.classList.toggle("dark");
    themeBtn.textContent = document.body.classList.contains("dark")
      ? "☀ Light"
      : "☾ Dark";
  };
if (fontBtn)
  fontBtn.onclick = () => {
    document.documentElement.classList.toggle("serif");
  };

// === Controls (null-safe) ===
// const prevBtn = document.querySelector("#prevBtn");
// const nextBtn = document.querySelector("#nextBtn");
// const todayBtn = document.querySelector("#todayBtn");
// const themeBtn = document.querySelector("#themeBtn");
// const fontBtn = document.querySelector("#fontBtn");

// month/year selects listeners (ရှိမှသာ)
// if (monthSel)
//   monthSel.onchange = () => {
//     view.setMonth(+monthSel.value);
//     render();
//   };
// if (yearSel)
//   yearSel.onchange = () => {
//     view.setFullYear(+yearSel.value);
//     render();
//   };

// // nav buttons (ရှိမှသာ)
// if (prevBtn)
//   prevBtn.onclick = () => {
//     view.setMonth(view.getMonth() - 1);
//     render();
//   };
// if (nextBtn)
//   nextBtn.onclick = () => {
//     view.setMonth(view.getMonth() + 1);
//     render();
//   };
// if (todayBtn)
//   todayBtn.onclick = () => {
//     const n = new Date();
//     view = new Date(n.getFullYear(), n.getMonth(), 1);
//     render();
//   };

// // theme/font (ရှိမှသာ)
// if (themeBtn)
//   themeBtn.onclick = () => {
//     document.body.classList.toggle("dark");
//     themeBtn.textContent = document.body.classList.contains("dark")
//       ? "☀ Light"
//       : "☾ Dark";
//   };
// if (fontBtn)
//   fontBtn.onclick = () => {
//     document.documentElement.classList.toggle("serif");
//   };

/* Backend Loader (local YYYY-MM-DD keys) */
async function loadBackendEvents(year) {
  const map = {};
  const add = (ymd, rec) => {
    const k = normalizeYMD(ymd);
    if (!k) return;
    map[k] = (map[k] || []).concat([rec]);
  };

  for (const k of Object.keys(SOLAR_MM)) {
    const [m, d] = k.split("-").map(Number);
    add(`${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, {
      type: "holiday",
      title: SOLAR_MM[k],
      region: "MM",
    });
  }
  for (const k of Object.keys(SOLAR_US_FIXED)) {
    const [m, d] = k.split("-").map(Number);
    add(`${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, {
      type: "holiday",
      title: SOLAR_US_FIXED[k],
      region: "US",
    });
  }
  const mv = usMovables(year);
  for (const k of Object.keys(mv)) {
    add(`${year}-${k}`, { type: "festival", title: mv[k], region: "US" });
  }
  getCustom().forEach((ev) => {
    if (ev?.date?.startsWith(String(year))) {
      add(ev.date, {
        type: ev.type === "holiday" ? "holiday" : "festival",
        title: ev.title,
        region: "custom",
      });
    }
  });
  try {
    const res = await fetch(`data/holidays.json`, { cache: "no-store" });
    if (res.ok) {
      const arr = await res.json();
      arr
        .filter((x) => x.date && x.date.startsWith(String(year)))
        .forEach((x) => {
          add(x.date, {
            type: x.type,
            title: x.title,
            region: x.region || "remote",
          });
        });
    }
  } catch (e) {
    /* ignore */
  }
  return map;
}

async function loadPoemFor(month) {
  try {
    const res = await fetch("data/poems.json", { cache: "no-store" });
    const poems = await res.json();
    return poems[month] || "";
  } catch (e) {
    console.warn("Poem load error:", e);
    return "";
  }
}

document.getElementById("themeSelect")?.addEventListener("change", e => {
  const val = e.target.value;
  if (val === "dark") {
    document.body.style.background = "#111";
    document.body.style.color = "#fff";
  } else if (val === "light") {
    document.body.style.background = "#fff";
    document.body.style.color = "#111";
  } else {
    // auto → use Myanmar month theme
    const myT = myanmarMonthYear(new Date());
    const t = CALENDAR_THEMES[myT.myanmarMonth];
    document.body.style.background = t.bg;
    document.body.style.color = "#111";
  }
});

/* Render */
async function render() {
  if (monthSel && yearSel) syncSelectors();
  const y = view.getFullYear(),
    m = view.getMonth();
  const first = new Date(y, m, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Monday-first
  const days = new Date(y, m + 1, 0).getDate();
  const backend = await loadBackendEvents(y);

  grid.innerHTML = "";
  for (let i = 0; i < startWeekday; i++) {
    const pad = document.createElement("div");
    pad.className = "day pad";
    grid.appendChild(pad);
  }

  const today = new Date();
  const isToday = (d) =>
    d === today.getDate() &&
    m === today.getMonth() &&
    y === today.getFullYear();

  for (let d = 1; d <= days; d++) {
    const cellDate = new Date(y, m, d);
    const iso = ymdLocal(cellDate);

    const age = lunarAge(cellDate);
    const my = myanmarMonthYear(cellDate);
    const shownMonth = labelWaso(my.myanmarMonth, my.myanmarYear, iso);
    const info = mmLunarInfoWithLength(age, my.myanmarMonth, my.myanmarYear);

    const tags = [];
    if (info.kind === "uposatha") {
      const moonIcon = info.phase === "လပြည့်" ? "🌕" : "🌑";
      tags.push(`<span class="tag icon">${moonIcon}</span>`);
    } else {
      const mmNum = toMMDigits(info.number);
      tags.push(`<span class="tag moontext">${info.phase} ${mmNum}</span>`);
    }

    if (backend[iso]) {
      backend[iso].forEach((sp) => {
        const isHoliday = sp.type === "holiday";
        const cls = isHoliday ? "warn" : "fest";
        const icon = isHoliday ? "🏛️" : "🎉";
        tags.push(`<span class="tag ${cls}">${icon} ${sp.title}</span>`);
      });
    }

    const el = document.createElement("div");
    el.className = "day" + (isToday(d) ? " today" : "");
    el.innerHTML = `
      <div class="nums">
        <div class="greg">${d}</div>
        <div class="myan">${shownMonth}</div>
      </div>
      <div class="tags">${tags.join("")}</div>
    `;

    // (optional) mobile: tap to expand tags
    el.addEventListener(
      "touchstart",
      () => {
        el.classList.toggle("expand");
      },
      { passive: true }
    );

    grid.appendChild(el);
  }

  // Today bar + poem (one-pass)
  const t = new Date();
  const myT = myanmarMonthYear(t);
  const currentTheme = CALENDAR_THEMES[myT.myanmarMonth];

  if (currentTheme) {
    document.body.style.setProperty("--theme-color", currentTheme.color);
    document.body.style.background = currentTheme.bg;
    todayBar.style.background = currentTheme.bg;
    todayBar.style.color = "#222";
  }

  const zodiac = ZODIAC_BY_MM[myT.myanmarMonth]
    ? ` (${ZODIAC_BY_MM[myT.myanmarMonth]}ရာသီ)`
    : "";

  // Gregorian month/year for display
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
  const gLabel = `${enMonths[t.getMonth()]} ${t.getFullYear()}`;

  let bar = `${myT.myanmarMonth}လ${zodiac} · ${gLabel}`;

  // Poem
  const poem = await loadPoemFor(myT.myanmarMonth);
  if (poem)
    bar += `<br><small class="poem">${poem.replace(/\n/g, "<br>")}</small>`;

  // ⬇️ Birthstone (Gregorian month-based)
  const gIdx = t.getMonth(); // 0..11
  const bs = BIRTHSTONES[gIdx];
  if (bs) {
    bar += ` <span class="chip stone" title="${bs.en}">${bs.icon} ${bs.en} — <span class="mm">${bs.mm}</span></span>`;
  }

  todayBar.innerHTML = bar;

  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
    } catch (e) {}
  }
}

/* Custom Add/Remove (normalize on save) */
$("#addCustom").onclick = () => {
  const date = $("#custDate").value;
  const title = $("#custTitle").value?.trim();
  const type = $("#custType").value;
  if (!date || !title) {
    alert("နေ့စွဲနဲ့ ခေါင်းစဉ်ကို ဖြည့်ပါ");
    return;
  }
  const cur = getCustom();
  cur.push({ date: normalizeYMD(date), title, type });
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

(async function boot() {
  await initCalendarMeta();
  await render();
})();