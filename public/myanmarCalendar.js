/* myanmarCalendar.js — v6 (clean integer lunar days; no duplicate "လဆန်း ၁၄")
   Rules:
   - Compute integer lunar dayIndex = floor(age) + 1  (1..30)
   - Waxing: 1..14  -> "လဆန်း N"
   - Full Moon: 15  -> uposatha (no number; 15 for info)
   - Waning: 16..29 -> "လဆုတ် (dayIndex-15)"  => 1..14
   - New Moon: 30   -> uposatha (no number; 15 if 30-day month, 14 if 29-day month)
   - Month lengths per your mapping; Waso double-month hook exposed.
*/

const SYNODIC = 29.530588;
const REF_NEWMOON = Date.UTC(2024, 11, 30, 0); // 2024-12-30 approx new moon

export function lunarAge(date){
  const ms = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) - REF_NEWMOON;
  return ((ms/86400000) % SYNODIC + SYNODIC) % SYNODIC; // 0..29.53
}

// Month lineup & lengths
export const MM_MONTHS = ["တန်ခူး","ကဆုန်","နယုန်","ဝါဆို","ဝါခေါင်","တော်သလင်း","သီတင်းကျွတ်","တန်ဆောင်မုန်း","နတ်တော်","ပြာသို","တပို့တွဲ","တပေါင်း"];
const LEN_29 = new Set(["တန်ခူး","နယုန်","ဝါခေါင်","သီတင်းကျွတ်","နတ်တော်","တပို့တွဲ"]);
const LEN_30 = new Set(["ကဆုန်","ဝါဆို","တော်သလင်း","တန်ဆောင်မုန်း","ပြာသို","တပေါင်း"]);

// Seasonal approx for UI pairing
export function myanmarMonthYear(date){
  const mm = MM_MONTHS[(date.getMonth()+11)%12];
  const my = 1350 + (date.getFullYear() - 1988);
  return { myanmarMonth:mm, myanmarYear: my };
}

// Wa-htat (intercalary) hook — default false; override from backend if needed
export function isWaHtat(myYear){ return false; }

export function monthLengthFor(mmName, myYear){
  if (mmName === "ဝါဆို" && isWaHtat(myYear)) return 30; // both Waso months 30 during Wa-htat
  if (LEN_30.has(mmName)) return 30;
  return 29;
}

// Main info using discrete integer dayIndex (prevents duplicate "waxing 14")
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

// Simple label (if needed elsewhere)
export function moonPhaseName(age){
  const di = Math.floor(age) + 1;
  if (di <= 14) return "လဆန်း";
  if (di === 15) return "လပြည့်";
  if (di <= 29) return "လဆုတ်";
  return "လကွယ်";
}
