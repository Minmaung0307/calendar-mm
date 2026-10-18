import {astrologyDetails} from '../public/dateDetails.js';
import assert from 'node:assert/strict';
import {buildCalendar,escapeText} from '../public/calendarExport.js';
import {calendarDate} from '../public/myanmarCalendar.js';
import {calendarEvents} from '../public/events.js';
const stamp=new Date('2026-10-17T18:00:00Z');
const all=buildCalendar({startYear:2026,stamp});
const unfolded=all.text.replace(/\r\n /g,'');
const blocks=unfolded.split('BEGIN:VEVENT').slice(1);
let expected=0;
for(let d=new Date('2026-01-01T00:00:00Z');d.getUTCFullYear()===2026;d.setUTCDate(d.getUTCDate()+1)){
 const iso=d.toISOString().slice(0,10),r=calendarDate(iso),events=calendarEvents(iso,r);
 const symbols=[];
 if(r.phase===1)symbols.push('🌕');if(r.phase===3)symbols.push('🌑');if(r.sabbath===2)symbols.push('🛕');if(events.some(e=>e.type==='holiday'))symbols.push('🔴');if(r.yatyaza)symbols.push('🔵');if(r.pyathada)symbols.push('🟤');
 const block=blocks.find(b=>b.includes('DTSTART;VALUE=DATE:'+iso.replace(/-/g,'')));
 if(!symbols.length){assert.equal(block,undefined);continue;}
 expected++;assert.ok(block);assert.equal(block.match(/SUMMARY:([^\r]+)/)[1],symbols.join(' '));assert.ok(block.includes(r.month));for(const label of astrologyDetails(r))assert.ok(block.includes(label));
 const next=new Date(d);next.setUTCDate(next.getUTCDate()+1);assert.ok(block.includes('DTEND;VALUE=DATE:'+next.toISOString().slice(0,10).replace(/-/g,'')));
}
assert.equal(all.count,expected);assert.equal(blocks.length,expected);
for(const line of all.text.split('\r\n'))assert.ok(Buffer.byteLength(line,'utf8')<=75);
assert.ok(!unfolded.includes('\uFFFD'));assert.ok(!unfolded.includes('BEGIN:VALARM'));
const ids=x=>[...x.matchAll(/UID:([^\r]+)/g)].map(m=>m[1]);assert.deepEqual(ids(all.text),ids(buildCalendar({startYear:2026,stamp}).text));assert.equal(new Set(ids(all.text)).size,expected);
const special=buildCalendar({startYear:2026,mode:'special',stamp});assert.ok(special.count<all.count);
assert.ok(blocks.some(b=>/SUMMARY:[^\r]*🔴/.test(b)));
assert.equal(escapeText('a,b;c\\d\ne'),'a\\,b\\;c\\\\d\\ne');
assert.throws(()=>buildCalendar({startYear:1899}),RangeError);assert.throws(()=>buildCalendar({startYear:2026,mode:'bad'}),RangeError);
console.log('Icon-only exports: correct markers, no empty events, full details, stable IDs, UTF-8 folding and date bounds passed.');
