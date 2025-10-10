/* myanmarCalendar.js — v2 with Uposatha helpers */
const SYNODIC = 29.530588;
const REF_NEWMOON = Date.UTC(2024, 11, 30, 0); // 2024-12-30 approx new moon

export function lunarAge(date){
  const ms = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) - REF_NEWMOON;
  return ((ms/86400000) % SYNODIC + SYNODIC) % SYNODIC; // 0..29.53
}

export function moonPhaseName(age){
  if(age<0.5) return "လကွယ်";
  if(age<7.4) return "လဆန်း";
  if(age<8.6) return "လဆန်း ၈";
  if(age<14.8) return "လဆန်း";
  if(age<15.3) return "လပြည့်";
  if(age<22) return "လဆုတ်";
  if(age<23) return "လဆုတ် ၈";
  if(age<29) return "လဆုတ်";
  return "လကွယ်";
}

/* ---------- Uposatha / Afait (အဖိတ်) helpers ----------
   Waxing 8  ~ age ≈ 7.4–8.6
   Full Moon ~ age ≈ 14.8–15.3
   Waning 8  ~ age ≈ 22.0–23.0
   New Moon  ~ age < 0.5 or > 29.0
*/
export function uposathaType(age){
  if(age < 0.6 || age > 29.0) return "ဥပုသ် (လကွယ်)";
  if(age >= 14.8 && age <= 15.3) return "ဥပုသ် (လပြည့်)";
  if(age >= 7.4 && age <= 8.6) return "ဥပုသ် (လဆန်း ၈)";
  if(age >= 22.0 && age <= 23.0) return "ဥပုသ် (လဆုတ် ၈)";
  return null;
}
export function isUposatha(age){ return !!uposathaType(age); }

/* Myanmar months (display order) */
const MM_MONTHS = ["တန်ခူး","ကဆုန်","နယုန်","ဝါဆို","ဝါခေါင်","တော်သလင်း","သီတင်းကျွတ်","တန်ဆောင်မုန်း","နတ်တော်","ပေါင်း","တပေါင်း","တပို့တွဲ"];

// Seasonal approximation for UI pairing only
export function myanmarMonthYear(date){
  const mm = MM_MONTHS[(date.getMonth()+11)%12];
  const my = 1350 + (date.getFullYear() - 1988); // rough map (2025~1387)
  return { myanmarMonth:mm, myanmarYear: my };
}

// Yatyarzar / Pyathadar (demo map)
export function yatyarzar(date){
  const names = ["စည်","မဟာ","လက်ထပ်","အကြင်","အထူး","ပညာ","အနား"];
  return names[date.getDay()];
}
export function pyathadar(date){
  const age = lunarAge(date);
  const ph = moonPhaseName(age);
  if(ph.includes("လပြည့်")) return "ပြည့်ဘက်";
  if(ph.includes("လကွယ်")) return "ကွယ်ဘက်";
  if(ph.includes("လဆန်း")) return "ဆန်းဘက်";
  return "ဆုတ်ဘက်";
}