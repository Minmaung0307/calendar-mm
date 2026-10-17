import { calendarDate, digits } from './myanmarCalendar.js';
import { calendarEvents } from './events.js';

export function escapeText(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}
// RFC 5545: 75 octets per physical line; never split a UTF-8 character.
export function foldLine(value) {
  const encoder = new TextEncoder();
  let line = '', bytes = 0, lines = [];
  for (const ch of value) {
    const size = encoder.encode(ch).length;
    if (bytes + size > 75) { lines.push(line); line = ' '; bytes = 1; }
    line += ch; bytes += size;
  }
  lines.push(line);
  return lines.join('\r\n');
}
export function buildCalendar({ startYear, endYear = startYear, mode = 'all', stamp = new Date() }) {
  if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || startYear < 1900 || endYear > 2100 || endYear < startYear || endYear - startYear > 9) throw new RangeError('Choose 1900–2100, up to ten years.');
  if (!['all', 'special'].includes(mode)) throw new RangeError('Unknown calendar type.');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MM Calendar//Myanmar Calendar Export//MY', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + escapeText(mode === 'all' ? 'မြန်မာပြက္ခဒိန် · နေ့စဉ်ရက်စွဲ' : 'မြန်မာပြက္ခဒိန် · ဥပုသ်နှင့်အထူးနေ့'), 'X-WR-TIMEZONE:Asia/Yangon'];
  const dtstamp = stamp.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  let count = 0;
  for (let dt = new Date(Date.UTC(startYear, 0, 1)); dt.getUTCFullYear() <= endYear; dt.setUTCDate(dt.getUTCDate() + 1)) {
    const date = dt.toISOString().slice(0,10), r = calendarDate(date), events = calendarEvents(date, r);
    const labels = [...new Set(events.map(e => e.title))];
    if (r.sabbath === 1) labels.unshift('ဥပုသ်နေ့');
    if (r.phase === 1) labels.unshift('လပြည့်နေ့');
    if (r.phase === 3) labels.unshift('လကွယ်နေ့');
    if (mode === 'special' && !labels.length) continue;
    const mm = `${r.month} ${r.phaseText}`;
    const next = new Date(dt); next.setUTCDate(next.getUTCDate() + 1);
    const info = [`${digits(r.my)} ခုနှစ် · ${mm}`, ...labels];
    if (r.sabbath === 2) info.push('အဖိတ်နေ့');
    if (r.yatyaza) info.push('ရက်ရာဇာ');
    if (r.pyathada) info.push(r.pyathada === 2 ? 'မွန်းလွဲပြဿဒါး' : 'ပြဿဒါး');
    info.push(...events.map(e => e.note).filter(Boolean));
    info.push('ရုံးပိတ်ရက်များ: ၂၀၂၆ မူလစာရင်း၊ အခြားနှစ်များသည် ပုံမှန်တွက်ချက်မှု။ အသစ်ကြေညာချက်များ အလိုအလျောက်မရယူပါ။');
    lines.push('BEGIN:VEVENT', `UID:mm-calendar-${date}@myanmar-calendar.local`, `DTSTAMP:${dtstamp}`, `DTSTART;VALUE=DATE:${date.replace(/-/g,'')}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0,10).replace(/-/g,'')}`, 'SUMMARY:' + escapeText([mm, ...labels].join(' · ')), 'DESCRIPTION:' + escapeText(info.join('\n')), 'TRANSP:TRANSPARENT', 'STATUS:CONFIRMED', 'END:VEVENT');
    count++;
  }
  lines.push('END:VCALENDAR');
  return { text: lines.map(foldLine).join('\r\n') + '\r\n', count };
}
