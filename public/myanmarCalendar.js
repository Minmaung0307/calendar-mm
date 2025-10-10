/* myanmarCalendar.js — v7 (Lunar-month-driven names)
   - New Moon (dayIndex 30 -> next day 1) advances to the NEXT Myanmar month.
   - Anchor: REF_NEWMOON (2024-12-30 UTC) = Start of "ပြာသို" (Pyatho).
   - Month lengths: per mapping (29/30) and Waso double-month hook.
*/

const SYNODIC = 29.530588;
const REF_NEWMOON = Date.UTC(2024, 11, 30, 0); // 2024-12-30 ~ New Moon (start of Pyatho)

export function lunarAge(date){
  const ms = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) - REF_NEWMOON;
  return ((ms/86400000) % SYNODIC + SYNODIC) % SYNODIC; // 0..29.53
}

export const MM_MONTHS = ["တန်ခူး","ကဆုန်","နယုန်","ဝါဆို","ဝါခေါင်","တော်သလင်း","သီတင်းကျွတ်","တန်ဆောင်မုန်း","နတ်တော်","ပြာသို","တပို့တွဲ","တပေါင်း"];
const LEN_29 = new Set(["တန်ခူး","နယုန်","ဝါခေါင်","သီတင်းကျွတ်","နတ်တော်","တပို့တွဲ"]);
const LEN_30 = new Set(["ကဆုန်","ဝါဆို","တော်သလင်း","တန်ဆောင်မုန်း","ပြာသို","တပေါင်း"]);

// Anchor month at REF_NEWMOON:
const REF_MM_NAME = "ပြာသို";
const REF_MM_INDEX = MM_MONTHS.indexOf(REF_MM_NAME);

/* Myanmar month & year based on lunations from REF_NEWMOON */
export function myanmarMonthYearLunar(date){
  const ms = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) - REF_NEWMOON;
  const lunations = Math.floor(ms / (SYNODIC*86400000)); // number of completed months since REF
  const idx = ((REF_MM_INDEX + lunations) % 12 + 12) % 12;
  const myanmarMonth = MM_MONTHS[idx];

  // Rough Myanmar year (kept simple as before)
  const my = 1350 + (date.getFullYear() - 1988);
  return { myanmarMonth, myanmarYear: my };
}

export function isWaHtat(myYear){ return false; }

export function monthLengthFor(mmName, myYear){
  if (mmName === "ဝါဆို" && isWaHtat(myYear)) return 30; // both Waso months 30 in intercalary year
  if (LEN_30.has(mmName)) return 30;
  return 29;
}

/* Integer dayIndex method (prevents duplicate "လဆန်း ၁၄") */
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

/* Optional helper */
export function moonPhaseName(age){
  const di = Math.floor(age) + 1;
  if (di <= 14) return "လဆန်း";
  if (di === 15) return "လပြည့်";
  if (di <= 29) return "လဆုတ်";
  return "လကွယ်";
}
