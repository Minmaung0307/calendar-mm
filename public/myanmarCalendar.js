/* myanmarCalendar.js — v8 (Lunar-month names + Wa-htat JSON meta)
   - New Moon (dayIndex 30 -> next day 1) advances to the NEXT Myanmar month.
   - Anchor: REF_NEWMOON (2024-12-30 UTC) = start of "ပြာသို" (Pyatho).
   - Month lengths: 29/30 + Waso double-month hook (JSON-driven).
*/

const SYNODIC = 29.530588;
const REF_NEWMOON = Date.UTC(2024, 11, 30, 0); // 2024-12-30 ~ New Moon => Pyatho start

export function lunarAge(date){
  const ms = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - REF_NEWMOON;
  return ((ms/86400000) % SYNODIC + SYNODIC) % SYNODIC; // 0..29.53
}

export const MM_MONTHS = [
  "တန်ခူး","ကဆုန်","နယုန်","ဝါဆို",
  "ဝါခေါင်","တော်သလင်း","သီတင်းကျွတ်","တန်ဆောင်မုန်း",
  "နတ်တော်","ပြာသို","တပို့တွဲ","တပေါင်း"
];

// Default month-length mapping (non-intercalary years)
const LEN_29 = new Set(["တန်ခူး","နယုန်","ဝါခေါင်","သီတင်းကျွတ်","နတ်တော်","တပို့တွဲ"]);
const LEN_30 = new Set(["ကဆုန်","ဝါဆို","တော်သလင်း","တန်ဆောင်မုန်း","ပြာသို","တပေါင်း"]);

// Anchor month at REF_NEWMOON:
const REF_MM_NAME = "ပြာသို";
const REF_MM_INDEX = MM_MONTHS.indexOf(REF_MM_NAME);

/* ─────────────────────────────────────────────────────────────
   Wa-htat (Intercalary) metadata (JSON-driven)
   data/wahtat.json ၏ schema:
   {
     "years": [1385, 1389, ...],
     "ranges": [
       { "my": 1385, "first_waso_start": "2024-06-07", "second_waso_start": "2024-07-06" }
     ]
   }
   ───────────────────────────────────────────────────────────── */
let WAHTAT_YEARS = new Set();
let WASO_RANGES = [];

/** JSON meta ကို preload လုပ်ရန် */
export async function initCalendarMeta(){
  try{
    const res = await fetch('data/wahtat.json', { cache: 'no-store' });
    if(res.ok){
      const j = await res.json();
      WAHTAT_YEARS = new Set(j.years || []);
      WASO_RANGES = Array.isArray(j.ranges) ? j.ranges : [];
    }
  }catch(_e){ /* fallback: none */ }
}

/** အဆိုပါ မြန်မာနှစ်(myYear) သည် ဝါထပ် နှစ်လား? */
export function isWaHtat(myYear){
  return WAHTAT_YEARS.has(myYear);
}

/** လအရှည် (၂၉/၃၀) — ဝါထပ်နှစ်ဆို Waso ကို ၃၀-ရက်သတ်မှတ် */
export function monthLengthFor(mmName, myYear){
  if (mmName === "ဝါဆို" && isWaHtat(myYear)) return 30; // both Waso months are 30 in intercalary year
  if (LEN_30.has(mmName)) return 30;
  return 29;
}

/** Myanmar month & year based on lunations from REF_NEWMOON (Lunar-month driven) */
export function myanmarMonthYearLunar(date){
  const ms = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - REF_NEWMOON;
  const lunations = Math.floor(ms / (SYNODIC * 86400000)); // completed months since REF
  const idx = ((REF_MM_INDEX + lunations) % 12 + 12) % 12;
  const myanmarMonth = MM_MONTHS[idx];

  // Rough Myanmar year (simple mapping; adjust if you maintain exact civil year)
  const my = 1350 + (date.getFullYear() - 1988);
  return { myanmarMonth, myanmarYear: my };
}

/** Waso အမည်ကို ပထမ/ဒုတိယ ဆိုပြီး label ပြောင်းပေး (iso: YYYY-MM-DD) */
export function labelWaso(mmName, myYear, iso){
  if (mmName !== "ဝါဆို" || !isWaHtat(myYear)) return mmName;
  const r = WASO_RANGES.find(x => x.my === myYear);
  if(!r || !r.first_waso_start || !r.second_waso_start) return mmName;
  if (iso >= r.second_waso_start) return "ဒုတိယဝါဆို";
  if (iso >= r.first_waso_start)  return "ပထမဝါဆို";
  return mmName;
}

/** Integer dayIndex method (prevents duplicate "လဆန်း ၁၄") */
export function mmLunarInfoWithLength(age, mmName, myYear){
  const dayIndex = Math.floor(age) + 1; // 1..30
  const len = monthLengthFor(mmName, myYear);

  if (dayIndex <= 14){
    return { phase:"လဆန်း", kind:"waxing", number:dayIndex, uposathaDay:null };
  }
  if (dayIndex === 15){
    return { phase:"လပြည့်", kind:"uposatha", number:null, uposathaDay:15 };
  }
  if (dayIndex <= 29){
    return { phase:"လဆုတ်", kind:"waning", number:(dayIndex - 15), uposathaDay:null };
  }
  // dayIndex === 30 -> New Moon uposatha
  const nmDay = (len === 30) ? 15 : 14;
  return { phase:"လကွယ်", kind:"uposatha", number:null, uposathaDay:nmDay };
}

/** Optional helper */
export function moonPhaseName(age){
  const di = Math.floor(age) + 1;
  if (di <= 14) return "လဆန်း";
  if (di === 15) return "လပြည့်";
  if (di <= 29) return "လဆုတ်";
  return "လကွယ်";
}