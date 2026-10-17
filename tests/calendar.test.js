import assert from 'node:assert/strict';
import {calendarDate as c} from '../public/myanmarCalendar.js';
assert.equal(c('2026-10-10').month,'တော်သလင်း');assert.equal(c('2026-10-10').number,14);assert.equal(c('2026-10-10').myt,2);assert.equal(c('2026-10-11').phase,3);assert.equal(c('2026-10-12').month,'သီတင်းကျွတ်');assert.equal(c('2026-10-12').md,1);assert.equal(c('2026-09-26').phase,1);
const waso=new Set();let prev;
for(let date=new Date('1900-01-01T12:00:00Z');date<=new Date('2100-12-31T12:00:00Z');date.setUTCDate(date.getUTCDate()+1)){
 const s=date.toISOString().slice(0,10),r=c(s);assert.ok(r.md>=1&&r.md<=r.length,s);assert.ok(r.month,s);if(prev){if(r.md!==1)assert.equal(r.md,prev.md+1,s);else assert.equal(prev.md,prev.length,s)}if(r.my===1388&&r.month.includes('ဝါဆို'))waso.add(r.month);prev=r;
}assert.deepEqual([...waso],['ပထမဝါဆို','ဒုတိယဝါဆို']);console.log('Calendar fixtures and 73,414 consecutive dates passed.');

const detail=c("2026-10-17");assert.ok(Array.isArray(detail.astro));assert.ok(detail.nagahle>=0&&detail.nagahle<=3);assert.ok(detail.mahabote>=0&&detail.mahabote<=6);assert.ok(detail.nakhat>=0&&detail.nakhat<=2);assert.equal(c("2026-10-26").sabbath,1);assert.equal(c("2026-10-01").yatyaza,1);console.log("Astrology detail fields passed.");
