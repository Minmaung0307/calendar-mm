import { buildCalendar } from './calendarExport.js';
export function setupCalendarConnect(getYear) {
  const $ = s => document.querySelector(s);
  const dialog = $('#connectDialog'), year = $('#exportYear'), mode = $('#exportMode');
  for (let y=1900;y<=2100;y++) year.add(new Option(y,y));
  $('#connectOpen').onclick = () => { year.value=getYear(); update(); dialog.showModal(); };
  $('#connectClose').onclick = () => dialog.close();
  $('#downloadCalendar').onclick = () => {
    try {
      const {text,count} = buildCalendar({startYear:Number(year.value),mode:mode.value});
      const url=URL.createObjectURL(new Blob([text],{type:'text/calendar;charset=utf-8'}));
      const a=document.createElement('a');a.href=url;a.download=`myanmar-${mode.value}-${year.value}.ics`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
      $('#connectStatus').textContent=`${count} ရက်စာ .ics ဖိုင် ထုတ်ပြီးပါပြီ။ အောက်ပါနည်းအတိုင်း Calendar ထဲ ထည့်နိုင်ပါသည်။`;
    } catch { $('#connectStatus').textContent='ဖိုင်ထုတ်မရပါ။ နှစ်ကို ပြန်ရွေးပြီး ထပ်စမ်းပါ။'; }
  };
  function update() {
    const url=new URL(`feeds/myanmar-${mode.value}.ics`,document.baseURI);
    const host=url.hostname;
    const publicHost=url.protocol==='https:' && !['localhost','127.0.0.1','[::1]'].includes(host) && !host.endsWith('.local');
    $('#feedURL').value=publicHost?url.href:'';
    $('#feedUnavailable').hidden=publicHost;
    $('#subscriptionControls').hidden=!publicHost;
    $('#appleSubscribe').href=url.href.replace(/^https:/,'webcal:');
    $('#subscriptionType').textContent=mode.value==='all'?'နေ့စဉ် မြန်မာရက်စွဲအားလုံး':'ဥပုသ်၊ လပြည့်/လကွယ်နှင့် အထူးနေ့များ';
  }
  mode.onchange=update;
  $('#copyFeed').onclick=async()=>{try{await navigator.clipboard.writeText($('#feedURL').value);$('#connectStatus').textContent='Subscription link ကူးပြီးပါပြီ။';}catch{$('#feedURL').focus();$('#feedURL').select();$('#connectStatus').textContent='Link ကို ဖိထားပြီး Copy လုပ်ပါ။';}};
}
