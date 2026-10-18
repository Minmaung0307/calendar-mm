import { mkdir, writeFile } from 'node:fs/promises';
import { buildCalendar } from '../public/calendarExport.js';
const dir = new URL('../public/feeds/', import.meta.url);
await mkdir(dir, { recursive: true });
// Keep the same feed URLs, date-based UIDs and start year when extending endYear.
// Do not remove past years: subscribers retain their historical lunar dates.
for (const mode of ['all', 'special']) {
  const { text, count } = buildCalendar({startYear:2026,endYear:2030,mode});
  await writeFile(new URL(`myanmar-${mode}.ics`,dir),text);
  console.log(`${mode}: ${count} events (2026–2030)`);
}
