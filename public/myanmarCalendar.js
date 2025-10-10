/* myanmarCalendar.js — v5
   - Lunar numbering: Waxing/Waning = 1..14 only
   - Uposatha day numbers depend on month length:
       30-day month: Full Moon 15, New Moon 15  -> (8/15 8/15)
       29-day month: Full Moon 15, New Moon 14  -> (8/15 8/14)
   - Wa-htat (intercalary) hook: Waso becomes 2 months (both 30 days)
*/

const SYNODIC = 29.530588;
const REF_NEWMOON = Date.UTC(2024, 11, 30, 0); // 2024-12-30 (approx new moon)

/* ===== Core astronomy ===== */
export function lunarAge(date){
  const ms = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) - REF_NEWMOON;
  return ((ms/86400000) % SYNODIC + SYNODIC) % SYNODIC; // 0..29.53
}
const NEW_EPS  = 0.6;
const FULL_MIN = 14.8, FULL_MAX = 15.3;
function isFullMoon(age){ return age >= FULL_MIN && age <= FULL_MAX; }
function isNewMoon(age){ return (age <= NEW_EPS) || (age >= (SYNODIC - NEW_EPS)); }

/* ===== Myanmar month lineup & lengths ===== */
export const MM_MONTHS = ["တန်ခူး","ကဆုန်","နယုန်","ဝါဆို","ဝါခေါင်","တော်သလင်း","သီတင်းကျွတ်","တန်ဆောင်မုန်း","နတ်တော်","ပြာသို","တပို့တွဲ","တပေါင်း"];

const LEN_29 = new Set(["တန်ခူး","နယုန်","ဝါခေါင်","သီတင်းကျွတ်","နတ်တော်","တပို့တွဲ"]);
const LEN_30 = new Set(["ကဆုန်","ဝါဆို","တော်သလင်း","တန်ဆောင်မုန်း","ပြာသို","တပေါင်း"]);

/* Seasonal approx (UI pairing only) */
export function myanmarMonthYear(date){
  const mm = MM_MONTHS[(date.getMonth()+11)%12];
  const my = 1350 + (date.getFullYear() - 1988); // rough Myanmar Era
  return { myanmarMonth:mm, myanmarYear: my };
}

/* ===== Wa-htat (intercalary) hook =====
   – Default: false (no doubling)
   – Replace with your backend rule/table for exact years.
   – Surya Siddhanta mentions a long-run “adhikamāsa” cycle
     (~ 990 days 7h45m37s) — we expose a placeholder for custom logic.
*/
export function isWaHtat(myYear){
  // TODO: override with your year list/table.
  return false;
}

/* Month length (29/30), incl. Wa-htat: Waso always 30 for both First/Second Waso */
export function monthLengthFor(mmName, myYear){
  if (mmName === "ဝါဆို" && isWaHtat(myYear)) return 30; // both Waso months 30
  if (LEN_30.has(mmName)) return 30;
  return 29;
}

/* ===== Uposatha pattern helper =====
   Returns object & short pattern string like "8/15 8/15" or "8/15 8/14"
*/
export function uposathaPattern(mmName, myYear){
  const len = monthLengthFor(mmName, myYear);
  const pattern = len === 30 ? "8/15 8/15" : "8/15 8/14";
  return { length: len, pattern };
}

/* ===== Main lunar info for UI =====
   - Waxing side: 1..14
   - Full Moon: uposatha, day=15 (for display if needed)
   - Waning side: 1..14
   - New Moon: uposatha, day = (15 if 30-day month; 14 if 29-day month)
*/
export function mmLunarInfoWithLength(age, mmName, myYear){
  const len = monthLengthFor(mmName, myYear);

  if (isFullMoon(age)) return { phase:"လပြည့်", kind:"uposatha", number:null, uposathaDay:15 };

  if (age < FULL_MIN){
    // Waxing 1..14
    let n = Math.floor(age) + 1; if (n > 14) n = 14;
    return { phase:"လဆန်း", kind:"waxing", number:n, uposathaDay:null };
  }

  // Waning
  if (isNewMoon(age)) {
    const nmDay = (len === 30) ? 15 : 14; // rule per your spec
    return { phase:"လကွယ်", kind:"uposatha", number:null, uposathaDay:nmDay };
  }

  let n = Math.floor(age - FULL_MAX) + 1;
  if (n < 1) n = 1; if (n > 14) n = 14;
  return { phase:"လဆုတ်", kind:"waning", number:n, uposathaDay:null };
}

/* Friendly label (no numbering decisions here) */
export function moonPhaseName(age){
  if (isNewMoon(age))  return "လကွယ်";
  if (isFullMoon(age)) return "လပြည့်";
  if (age < FULL_MIN)  return "လဆန်း";
  return "လဆုတ်";
}