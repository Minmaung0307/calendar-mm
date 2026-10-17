import { calendarDate, todayISO } from './myanmarCalendar.js';
export function setupObservanceSound() {
  const toggle=document.querySelector('#observanceSound'), status=document.querySelector('#soundStatus');
  let enabled=true, context, busy=false, playedDate='', voices=[];
  try { enabled=localStorage.getItem('mm_observance_sound')!=='off'; } catch {}
  toggle.checked=enabled;
  function stop() { for(const o of voices) { try{o.stop();}catch{} } voices=[]; }
  async function play(kind, preview=false) {
    if(!enabled || busy || (!preview && playedDate===todayISO())) return;
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio){status.textContent='ဤ browser တွင် အသံဖွင့်မရပါ။';return;}
    busy=true;
    try {
      context ||= new Audio();
      if(context.state!=='running') {
        void context.resume().then(()=>{if(context.state==='running' && enabled)void play(kind,preview);}).catch(()=>{});
        if(context.state!=='running')return;
      }
      if(!enabled)return;
      stop();
      const start=context.currentTime+.04;
      const strikes=kind===1?[0,1.4]:[0];
      const base=kind===1?220:174.6;
      for(const delay of strikes) for(const [ratio,level,decay] of [[1,.13,3.5],[1.47,.06,2.8],[2.09,.035,2],[2.56,.02,1.3],[3.8,.012,.8]]) {
        const o=context.createOscillator(),g=context.createGain(),t=start+delay;
        o.frequency.value=base*ratio;
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(level,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+decay);
        o.connect(g);g.connect(context.destination);o.start(t);o.stop(t+decay+.05);voices.push(o);
        o.onended=()=>{o.disconnect();g.disconnect();voices=voices.filter(v=>v!==o);};
      }
      if(!preview)playedDate=todayISO();
      status.textContent=kind===1?'ဥပုသ်နေ့ · ကြေးစည်သံ နှစ်ချက်':'အဖိတ်နေ့ · ကြေးစည်သံ တစ်ချက်';
    } catch { status.textContent='အသံဖွင့်ရန် စာမျက်နှာကို တစ်ချက်နှိပ်ပါ။'; }
    finally {busy=false;}
  }
  function check(){if(document.hidden || !enabled)return;const r=calendarDate(todayISO());if(r.sabbath)void play(r.sabbath);}
  toggle.onchange=()=>{enabled=toggle.checked;try{localStorage.setItem('mm_observance_sound',enabled?'on':'off');}catch{}if(!enabled){stop();status.textContent='အသံပိတ်ထားပါသည်။';}else{status.textContent='အသံဖွင့်ထားပါသည်။';check();}};
  document.querySelector('#previewEve').onclick=()=>void play(2,true);
  document.querySelector('#previewSabbath').onclick=()=>void play(1,true);
  // Let mute and preview controls act before the generic first-interaction retry.
  for(const event of ['click','keydown'])document.addEventListener(event,e=>{if(e.target.closest?.('#soundControls'))return;check();});
  document.addEventListener('visibilitychange',check);
  window.addEventListener('pageshow',check);
  setInterval(check,30000);
  check();
}
