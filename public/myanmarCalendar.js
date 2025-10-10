/* myanmarCalendar.js
   Astronomical lunar phase + Myanmar lunisolar approximation.
   - Exposes: lunarAge(dateUTC), moonPhaseName(age), myanmarMonthYear(date),
              yatyarzar(date), pyathadar(date)
   Notes:
   - Uses Meeus-style synodic month and a new moon reference.
   - Myanmar month/year mapping is seasonal/approx; override with backend if needed.
*/

const SYNODIC = 29.530588;
const REF_NEWMOON = Date.UTC(2024, 11, 30, 0); // 2024-12-30 approx astronomical NM

export function lunarAge(date){
  const ms = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) - REF_NEWMOON;
  let age = ((ms/86400000) % SYNODIC + SYNODIC) % SYNODIC; // 0..29.53
  return age;
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

// Myanmar months (display order)
const MM_MONTHS = ["တန်ခူး","ကဆုန်","နယုန်","ဝါဆို","ဝါခေါင်","တော်သလင်း","သီတင်းကျွတ်","တန်ဆောင်မုန်း","နတ်တော်","ပေါင်း","တပေါင်း","တပို့တွဲ"];

// Seasonal approximation: shift Gregorian → Myanmar month
export function myanmarMonthYear(date){
  const gMonth = date.getMonth(); // 0-11
  const mm = MM_MONTHS[(gMonth+11)%12]; // small shift to align Thingyan season roughly
  const my = 1350 + (date.getFullYear() - 1988); // rough mapping (2025~1387)
  return { myanmarMonth:mm, myanmarYear: my };
}

// Yatyarzar / Pyathadar demo mapping (weekday + phase quadrant)
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