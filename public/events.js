// Verified 2026 dates: DICA/MyCO + ASEAN-Japan Centre; Eid: official eVisa announcement.
// See SOURCES.md. Other years use recurring/calendar rules, not annual gazettes.
const official2026={};
function add(date,title){(official2026[date]??=[]).push(title)}
for(const [date,title] of Object.entries({
 '01-01':'နိုင်ငံတကာနှစ်သစ်ကူးနေ့','01-02':'နှစ်သစ်ကူး ဆက်စပ်ရုံးပိတ်ရက်','01-04':'လွတ်လပ်ရေးနေ့',
 '02-12':'ပြည်ထောင်စုနေ့','02-13':'ပြည်ထောင်စုနေ့ ဆက်စပ်ရုံးပိတ်ရက်','02-16':'တရုတ်နှစ်သစ်ကူး ရုံးပိတ်ရက်','02-17':'တရုတ်နှစ်သစ်ကူးနေ့',
 '03-02':'တောင်သူလယ်သမားနေ့','03-27':'တပ်မတော်နေ့','04-30':'ကဆုန်လပြည့်နေ့','05-01':'အလုပ်သမားနေ့','05-28':'အိဒ်အလ်အဿွဟာနေ့',
 '07-19':'အာဇာနည်နေ့','07-29':'ဒုတိယဝါဆိုလပြည့်နေ့','10-25':'သီတင်းကျွတ် ရုံးပိတ်ရက်','10-26':'သီတင်းကျွတ်လပြည့်နေ့','10-27':'သီတင်းကျွတ် ရုံးပိတ်ရက်',
 '11-23':'တန်ဆောင်တိုင် ရုံးပိတ်ရက်','11-24':'တန်ဆောင်မုန်းလပြည့်နေ့','12-04':'အမျိုးသားနေ့','12-25':'ခရစ္စမတ်နေ့'
}))add('2026-'+date,title);
add('2026-03-02','တပေါင်းလပြည့်နေ့');
for(let d=11;d<=19;d++)add(`2026-04-${d}`,d===17?'မြန်မာနှစ်သစ်ကူးနေ့':'သင်္ကြန်ကာလ ရုံးပိတ်ရက်');
const translate={"New Year's Day":'နိုင်ငံတကာနှစ်သစ်ကူးနေ့','Independence Day':'လွတ်လပ်ရေးနေ့','Union Day':'ပြည်ထောင်စုနေ့',"Peasants' Day":'တောင်သူလယ်သမားနေ့','Resistance Day':'တပ်မတော်နေ့','Labour Day':'အလုပ်သမားနေ့',"Martyrs' Day":'အာဇာနည်နေ့','Christmas Day':'ခရစ္စမတ်နေ့','Buddha Day':'ကဆုန်လပြည့်နေ့','Start of Buddhist Lent':'ဝါဆိုလပြည့်နေ့','End of Buddhist Lent':'သီတင်းကျွတ်လပြည့်နေ့','Tazaungdaing':'တန်ဆောင်မုန်းလပြည့်နေ့','National Day':'အမျိုးသားနေ့',"Karen New Year's Day":'ကရင်နှစ်သစ်ကူးနေ့','Tabaung Pwe':'တပေါင်းလပြည့်နေ့',"Myanmar New Year's Day":'မြန်မာနှစ်သစ်ကူးနေ့','Thingyan Akyo':'သင်္ကြန်အကြိုနေ့','Thingyan Akya':'သင်္ကြန်အကျနေ့','Thingyan Akyat':'သင်္ကြန်အကြတ်နေ့','Thingyan Atat':'သင်္ကြန်အတက်နေ့'};
export function calendarEvents(iso,r){
 const year=Number(iso.slice(0,4)), out=[], push=(title,type='festival',note='')=>out.push({title,type,note});
 if(year===2026)(official2026[iso]||[]).forEach(t=>push(t,'holiday','၂၀၂၆ ထုတ်ပြန်ရက်စာရင်း'));
 else {
  r.holidays.filter(t=>t!=='Holiday').forEach(t=>push(translate[t]||t,'holiday','နှစ်စဉ်ပြက္ခဒိန်တွက်ချက်မှု — ထပ်တိုး/အစားထိုးရုံးပိတ်ရက်များ မပါနိုင်ပါ'));
  if(year>=2025&&iso.endsWith('-01-01'))push('နိုင်ငံတကာနှစ်သစ်ကူးနေ့','holiday','နှစ်စဉ်သတ်မှတ်ရက်');
  if((r.mm===7&&[14,16].includes(r.md))||(r.mm===8&&r.md===14))push('လပြည့်ပွဲတော် ဆက်စပ်ရုံးပိတ်ရက်','holiday','ပုံမှန်ရက်တွက်ချက်မှု — နှစ်အလိုက်ကြေညာချက်နှင့် စစ်ဆေးပါ');
 }
 r.holidays.filter(t=>t.startsWith('Thingyan')||t==="Myanmar New Year's Day").forEach(t=>{if(!out.some(e=>e.title===translate[t]))push(translate[t]||t)});
 if(r.phase===1){const lunar={2:'ညောင်ရေသွန်းပွဲ · ဗုဒ္ဓနေ့',3:'မဟာသမယနေ့',5:'မေတ္တာအခါတော်နေ့',6:'ဂရုဓမ္မအခါတော်နေ့',4:'ဓမ္မစကြာနေ့ · ဝါဆိုသင်္ကန်းကပ်လှူပွဲ',7:'သီတင်းကျွတ် မီးထွန်းပွဲ · အဘိဓမ္မာနေ့',8:'တန်ဆောင်တိုင် · မသိုးသင်္ကန်းကပ်လှူပွဲ',10:'အာနန္ဒာဘုရားပွဲ အဓိကနေ့',11:'ထမနဲပွဲကာလ',12:'တပေါင်းဘုရားပွဲ · သဲပုံစေတီပူဇော်ပွဲ'};if(lunar[r.mm])push(lunar[r.mm],'festival',r.mm===11?'ဒေသအလိုက် ကျင်းပရက်ကွာနိုင်သည်':'မြန်မာလပြည့်ရက်အလိုက်');}
 if(iso.endsWith('-10-05'))push('ကမ္ဘာ့ဆရာများနေ့','observance');
 if(iso.endsWith('-10-24'))push('ကုလသမဂ္ဂနေ့','observance');
 if(r.mm===9&&r.md===1)push('စာဆိုတော်နေ့ · ရှမ်းနှစ်သစ်ကူးနေ့');
 if(year===2026&&iso==='2026-11-08')push('ဒီပါဝလီ (ရက်အတည်ပြုရန်)','observance','ပွဲတော်ရက် ခန့်မှန်းစာရင်းသာဖြစ်သည်။ ရုံးပိတ်ရက်အဖြစ် အတည်မပြုထားပါ။');
 return out.filter((e,i,a)=>a.findIndex(x=>x.title===e.title&&x.type===e.type)===i);
}
export const annual2026=official2026;
