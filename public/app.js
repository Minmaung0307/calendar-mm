import { supportLinks } from "./config.js";
import { setupCalendarConnect } from "./calendarConnect.js";
import { icon } from "./icons.js";
import { poems, festivals, stones, baseMonth } from "./culture.js";
import { calendarEvents } from "./events.js";
import { calendarDate, todayISO, digits } from "./myanmarCalendar.js";

const $ = (s) => document.querySelector(s);
const read = (k, f) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? f;
  } catch {
    return f;
  }
};
function write(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
    return true;
  } catch {
    $("#status").textContent = "သိမ်း၍မရပါ။ Browser storage ကို စစ်ဆေးပါ။";
    return false;
  }
}
let selected = todayISO(), view = selected.slice(0,7);
let language = read("mm_language", "my") === "en" ? "en" : "my";
const tr = (my,en) => language === "en" ? en : my;
const months = Array.from({ length: 12 }, (_, m) =>
  new Date(2026, m, 1).toLocaleString("en", { month: "long" }),
);
months.forEach((m, i) => $("#month").add(new Option(m, i + 1)));
for (let y = 1900; y <= 2100; y++) $("#year").add(new Option(y, y));
const iso = (y, m, d) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const englishMonths=['First Waso','Tagu','Kason','Nayon','Waso','Wagaung','Tawthalin','Thadingyut','Tazaungmon','Nadaw','Pyatho','Tabodwe','Tabaung','Late Tagu','Late Kason'];
const monthName=r=>tr(r.month,r.mm===4&&r.myt?'Second Waso':englishMonths[r.mm]);
const title = r => tr(`${r.month} ${r.phaseText}`,`${monthName(r)} · ${['Waxing '+r.number,'Full moon','Waning '+r.number,'New moon'][r.phase]}`);
const format = (s) =>
  new Date(s + "T12:00:00Z").toLocaleDateString("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
function showDialog(t, content) {
  $("#dialogTitle").textContent = t;
  $("#dialogContent").textContent = content;
  $("#dialog").showModal();
}
$("#closeDialog").onclick = () => $("#dialog").close();
$("#dialog").onclick = (e) => {
  if (e.target === $("#dialog")) {
    const r = e.target.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      e.target.close();
  }
};
function details() {
  const r = calendarDate(selected);
  $("#selectedTitle").textContent = title(r);
  $("#selectedMeta").textContent =
    format(selected) + " · " + digits(r.my) + " ခုနှစ်";
  $("#events").replaceChildren();
  const labels = [];
  if (r.phase === 1) labels.push({ title: "လပြည့်နေ့", icon: "full" });
  if (r.phase === 3) labels.push({ title: "လကွယ်နေ့", icon: "new" });
  if (r.sabbath)
    labels.push({
      title: r.sabbath === 1 ? "ဥပုသ်နေ့" : "အဖိတ်နေ့",
      icon: r.sabbath === 1 ? "sabbath" : "eve",
    });
  labels.push(...calendarEvents(selected, r));
  labels.forEach((e) => {
    const p = document.createElement("div");
    p.className = "event";
    const text = document.createElement("div"),
      t = document.createElement("strong");
    t.textContent = e.title;
    text.append(t);
    if (e.note) {
      const small = document.createElement("small");
      small.textContent =
        (e.type === "holiday" ? "ရုံးပိတ်ရက် · " : "အထူးနေ့ · ") + e.note;
      text.append(small);
    }
    p.append(
      icon(e.icon || (e.type === "holiday" ? "holiday" : "festival")),
      text,
    );
    $("#events").append(p);
  });
  renderDateInfo(r);
}

function render() {
  const [y, m] = view.split("-").map(Number),
    now = todayISO(),
    t = calendarDate(now);
  $("#todayMM").textContent = title(t);
  $("#todayMeta").textContent =
    `${digits(t.my)} ခုနှစ် · ${t.myt === 2 ? "ဝါကြီးထပ်နှစ်" : t.myt === 1 ? "ဝါငယ်ထပ်နှစ်" : "ဝါမထပ်နှစ်"} · ${format(now)}`;
  $("#copyrightYear").textContent = now.slice(0, 4);
  $("#month").value = m;
  $("#year").value = y;
  $("#monthTitle").textContent = months[m - 1] + " " + y;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate(),
    a = calendarDate(iso(y, m, 1)),
    z = calendarDate(iso(y, m, days));
  $("#mmRange").textContent =
    `${monthName(a)}${a.month === z.month ? "" : " — " + monthName(z)} · ${digits(a.my)}${a.my === z.my ? "" : " / " + digits(z.my)}`;
  $("#prev").disabled = view === "1900-01";
  $("#next").disabled = view === "2100-12";
  $("#grid").replaceChildren();
  const pad = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  for (let i = 0; i < pad; i++) {
    const p = document.createElement("div");
    p.className = "pad";
    $("#grid").append(p);
  }
  for (let d = 1; d <= days; d++) {
    const s = iso(y, m, d),
      r = calendarDate(s),
      b = document.createElement("button");
    b.className =
      "day" +
      (s === now ? " today" : "") +
      (s === selected ? " selected" : "") +
      (r.phase % 2 ? " moon" : "");
    b.setAttribute("aria-label", format(s) + " " + title(r));
    b.setAttribute("aria-pressed", String(s === selected));
    if (s === now) b.setAttribute("aria-current", "date");
    const n = document.createElement("strong");
    n.textContent = d;
    const mn = document.createElement("span");
    mn.className = "mm-month";
    mn.textContent = monthName(r);
    const ph = document.createElement("span");
    ph.className = "phase";
    ph.dataset.short = [
      "ဆန်း " + digits(r.number),
      "လပြည့်",
      "ဆုတ် " + digits(r.number),
      "လကွယ်",
    ][r.phase];
    ph.textContent = tr(ph.dataset.short,["Waxing "+r.number,"Full moon","Waning "+r.number,"New moon"][r.phase]);
    const dot = document.createElement("span");
    dot.className = "event-dot";
    const allEvents = calendarEvents(s, r);
    dot.className = "day-icons";
    if (r.phase === 1) dot.append(icon("full", "လပြည့်"));
    if (r.phase === 3) dot.append(icon("new", "လကွယ်"));
    if (r.sabbath)
      dot.append(
        icon(
          r.sabbath === 1 ? "sabbath" : "eve",
          r.sabbath === 1 ? "ဥပုသ်နေ့" : "အဖိတ်နေ့",
        ),
      );
    if (allEvents.some((e) => e.type === "holiday"))
      dot.append(icon("holiday", "ရုံးပိတ်ရက်"));
    if (allEvents.some((e) => e.type !== "holiday"))
      dot.append(icon("festival", "အထူးနေ့"));
    b.setAttribute(
      "aria-label",
      format(s) +
        " " +
        title(r) +
        (r.sabbath === 1 ? " ဥပုသ်နေ့" : r.sabbath === 2 ? " အဖိတ်နေ့" : "") +
        (allEvents.length
          ? " · " + allEvents.map((e) => e.title).join("၊ ")
          : ""),
    );
    if (r.yatyaza) dot.append(marker("yatyaza", tr("ရက်ရာဇာ", "Yatyaza")));
    if (r.pyathada) dot.append(marker("pyathada", tr("ပြဿဒါး", "Pyathada")));
    if (new Date(s+"T12:00:00Z").getUTCDay()===0) b.classList.add("sunday");
    if (allEvents.some(e=>e.type==="holiday")) b.classList.add("holiday");
    mn.textContent = title(r);
    mn.setAttribute('aria-hidden', 'true');
    b.append(n, mn, ph, dot);
    b.onclick = () => {
      selected = s;
      $("#status").textContent = "";
      render();
    };
    b.onkeydown = (e) => {
      const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[
        e.key
      ];
      if (delta) {
        e.preventDefault();
        const dt = new Date(s + "T12:00:00Z");
        dt.setUTCDate(dt.getUTCDate() + delta);
        const next = dt.toISOString().slice(0, 10);
        if (next < "1900-01-01" || next > "2100-12-31") return;
        selected = next;
        view = next.slice(0, 7);
        render();
        $(".day.selected").focus();
      }
    };
    $("#grid").append(b);
  }
  details();
  renderCulture(y, m, days);
  renderAgenda(y, m, days);
}
function move(n) {
  const [y, m] = view.split("-").map(Number),
    d = new Date(Date.UTC(y, m - 1 + n, 1));
  if (d.getUTCFullYear() < 1900 || d.getUTCFullYear() > 2100) return;
  view = d.toISOString().slice(0, 7);
  render();
}
$("#prev").onclick = () => move(-1);
$("#next").onclick = () => move(1);
$("#month").onchange = $("#year").onchange = () => {
  view = iso(+$("#year").value, +$("#month").value, 1).slice(0, 7);
  render();
};
$("#today").onclick = () => {
  selected = todayISO();
  view = selected.slice(0, 7);
  render();
};
let theme = read("mm_theme", "auto");
if (!["auto", "light", "dark"].includes(theme)) theme = "auto";
$("#theme").value = theme;
document.documentElement.dataset.theme = theme;
$("#theme").onchange = () => {
  document.documentElement.dataset.theme = $("#theme").value;
  write("mm_theme", $("#theme").value);
};
$("#font").onclick = () => {
  $("body").classList.toggle("large");
  $("#font").setAttribute(
    "aria-pressed",
    String($("body").classList.contains("large")),
  );
};
const policies = {
  privacy: [
    "Privacy · ကိုယ်ရေးအချက်အလက်",
    "ဤပြက္ခဒိန်သည် အကောင့်ဖွင့်ရန် မလိုအပ်ပါ။ ဘာသာစကားနှင့် အပြင်အဆင်ရွေးချယ်မှုကို သင့် browser ၏ localStorage တွင်သာ သိမ်းပါသည်။ အခြားစက်များသို့ အလိုအလျောက် မကူးပါ။  Offline အသုံးပြုနိုင်ရန် site ဖိုင်များကို cache သိမ်းပါသည်။ Site code တွင် analytics နှင့် ကြော်ငြာ tracker မထည့်ထားပါ။ Hosting ဝန်ဆောင်မှုက ပုံမှန် access log များ သိမ်းနိုင်ပါသည်။ ပြင်ပငွေပေးချေမှုလင့်ခ်များ အသုံးပြုလျှင် သက်ဆိုင်ရာဝန်ဆောင်မှု၏ privacy စည်းကမ်းများ သက်ရောက်ပါသည်။",
  ],
  terms: [
    "Terms · အသုံးပြုမှုစည်းကမ်း",
    "ဤပြက္ခဒိန်ကို နေ့စဉ်ရက်စွဲကြည့်ရှုရန် အသုံးပြုနိုင်ပါသည်။ မြန်မာရက်စွဲများကို Yan Naing Aye ၏ MIT လိုင်စင်ပါ တွက်ချက်မှုဖြင့် ဖော်ပြထားပါသည်။ ထပ်မံကြေညာသော အစိုးရရုံးပိတ်ရက်များ၊ ဒေသအလိုက် ပွဲတော်များကို တရားဝင်ကြေညာချက်နှင့် ပြန်လည်တိုက်စစ်ပါ။  ပံ့ပိုးမှုနှင့် အလှူများသည် မိမိဆန္ဒအလျောက်ဖြစ်ပြီး ပြင်ပငွေပေးချေမှုစာမျက်နှာတွင် လက်ခံသူ၊ ပမာဏနှင့် ပြန်အမ်းစည်းကမ်းများကို စစ်ဆေးပါ။",
  ],
};
document
  .querySelectorAll("[data-policy]")
  .forEach(
    (b) => (b.onclick = () => showDialog(...policies[b.dataset.policy])),
  );

let poemsView = "",
  annualView = "";
function renderPoem() {
  const name = $("#cultureMonth").value,
    base = baseMonth(name),
    f = festivals[base];
  $("#poemHeading").textContent = name + " · လရာသီကဗျာ";
  $("#poemText").textContent = poems[base] || "";
  $("#festivalTitle").textContent = f?.title || "";
  $("#festivalDescription").textContent = f?.description || "";
  $("#festivalIcon").replaceChildren(icon("festival"));
}
function renderCulture(y, m, days) {
  const names = Object.keys(poems);
  if (poemsView !== view) {
    $("#cultureMonth").replaceChildren();
    names.forEach((n) => $("#cultureMonth").add(new Option(n, n)));
    poemsView = view;
  }
  if (selected.startsWith(view))
    $("#cultureMonth").value = baseMonth(calendarDate(selected).month);
  renderPoem();
  const stone = stones[m - 1];
  $("#stoneMonth").textContent = months[m - 1] + " · BIRTHSTONE";
  $("#stoneName").textContent = stone.en;
  $("#stoneMM").textContent = stone.mm;
  $("#stoneArt").style.color = stone.color;
  $("#stoneArt").replaceChildren(icon("gem"));
}
$("#cultureMonth").onchange = renderPoem;
function eventRow(s, events) {
  const button = document.createElement("button");
  button.className = "agenda-row";
  const date = document.createElement("span");
  date.className = "agenda-date";
  date.textContent =
    s.slice(8) + " " + months[Number(s.slice(5, 7)) - 1].slice(0, 3);
  const text = document.createElement("span");
  text.textContent = events.map((e) => e.title).join(" · ");
  button.append(
    icon(events.some((e) => e.type === "holiday") ? "holiday" : "festival"),
    date,
    text,
  );
  button.onclick = () => {
    selected = s;
    view = s.slice(0, 7);
    render();
    $("#dateDialog").showModal();
  };
  return button;
}
function renderAgenda(y, m, days) {
  $("#monthEvents").replaceChildren();
  let count = 0;
  for (let d = 1; d <= days; d++) {
    const s = iso(y, m, d),
      events = calendarEvents(s, calendarDate(s));
    if (events.length) {
      $("#monthEvents").append(eventRow(s, events));
      count++;
    }
  }
  if (!count)
    $("#monthEvents").textContent =
      "ဤလအတွင်း ရက်သတ်မှတ်ထားသော အထူးနေ့စာရင်း မရှိပါ။ ရာသီပွဲတော်ကို အောက်တွင် ကြည့်နိုင်ပါသည်။";
  if (annualView !== String(y)) {
    annualView = String(y);
    $("#annualSummary").textContent = digits(y) + " · ရုံးပိတ်ရက်စာရင်း";
    $("#annualNotice").textContent =
      y === 2026
        ? "အတည်ပြုနိုင်သော ၂၀၂၆ ရုံးပိတ်ရက်များ။ ဒီပါဝလီရုံးပိတ်ရက်ကို ထုတ်ပြန်ချက်မရသေးသဖြင့် မထည့်တွက်ထားပါ။"
        : "ပုံမှန်နှစ်စဉ်ရက်နှင့် မြန်မာရက်စွဲတွက်ချက်မှုစာရင်း။ ဤနှစ်၏ ထပ်တိုး/အစားထိုးရုံးပိတ်ရက်၊ အိဒ်၊ ဒီပါဝလီနှင့် တရုတ်နှစ်သစ်ကူးရက်တို့အတွက် နှစ်အလိုက်ထုတ်ပြန်ချက်ကို စစ်ဆေးပါ။";
    $("#annualList").replaceChildren();
    for (let mo = 1; mo <= 12; mo++) {
      const end = new Date(Date.UTC(y, mo, 0)).getUTCDate();
      for (let d = 1; d <= end; d++) {
        const s = iso(y, mo, d),
          events = calendarEvents(s, calendarDate(s)).filter(
            (e) => e.type === "holiday",
          );
        if (events.length) $("#annualList").append(eventRow(s, events));
      }
    }
  }
}
for (const [name, label] of [
  ["full", "လပြည့်"],
  ["new", "လကွယ်"],
  ["eve", "အဖိတ်"],
  ["sabbath", "ဥပုသ်"],
  ["festival", "အထူးနေ့"],
  ["holiday", "ရုံးပိတ်"],
]) {
  const span = document.createElement("span");
  span.append(icon(name), document.createTextNode(label));
  $("#iconLegend").append(span);
}

function marker(kind,label){const el=document.createElement("i");el.className="astro-dot "+kind;el.title=label;el.setAttribute("aria-label",label);return el;}
const astroNames={Thamanyo:"သမားညို",Amyeittasote:"အမြိတ္တစုတ်",Warameittugyi:"ဝါရမိတ္တုကြီး",Warameittunge:"ဝါရမိတ္တုငယ်",Yatpote:"ရက်ပုပ်",Thamaphyu:"သမားဖြူ",Nagapor:"နဂါးပေါ်",Yatyotema:"ရက်ယုတ်မာ",Mahayatkyan:"မဟာရက်ကြမ်း",Shanyat:"ရှမ်းရက်"};
function renderDateInfo(r){
 const dt=new Date(selected+"T12:00:00Z");
 $("#selectedSummary").textContent=(selected===todayISO()?tr("ယနေ့ · ","Today · "):"")+format(selected);
 $("#selectedMM").textContent=title(r);
 $("#detailMonth").textContent=dt.toLocaleDateString("en",{month:"long",year:"numeric",timeZone:"UTC"});
 $("#detailNumber").textContent=dt.getUTCDate();
 $("#detailWeekday").textContent=dt.toLocaleDateString(language==="my"?"my":"en",{weekday:"long",timeZone:"UTC"});
 $("#detailMMMonth").textContent=monthName(r);
 $("#detailMMNumber").textContent=language==="my"?digits(r.number):r.number;
 $("#detailPhase").textContent=tr(["လဆန်း","လပြည့်","လပြည့်ကျော်","လကွယ်"][r.phase],["Waxing","Full moon","Waning","New moon"][r.phase]);
 $("#detailYear").textContent=tr(digits(r.my)+" ခုနှစ်",r.my+" ME");
 const labels=[...r.astro.map(n=>tr(astroNames[n]||n,n)),tr("နဂါးခေါင်းလှည့်ရာ · ","Naga direction · ")+tr(["အနောက်","မြောက်","အရှေ့","တောင်"][r.nagahle],["West","North","East","South"][r.nagahle]),tr(["ဘင်္ဂဖွား","အထွန်းဖွား","ရာဇဖွား","အဓိပတိဖွား","မရဏဖွား","သိုက်ဖွား","ပုတိဖွား"][r.mahabote],["Binga","Atun","Yaza","Adipati","Marana","Thike","Puti"][r.mahabote]),tr(["ဘီလူးနက္ခတ်","နတ်နက္ခတ်","လူနက္ခတ်"][r.nakhat],["Ogre Nakhat","Elf Nakhat","Human Nakhat"][r.nakhat])];
 if(r.yatyaza)labels.unshift(tr("ရက်ရာဇာ","Yatyaza"));
 if(r.pyathada)labels.unshift(tr(r.pyathada===2?"မွန်းလွဲပြဿဒါး":"ပြဿဒါး",r.pyathada===2?"Afternoon Pyathada":"Pyathada"));
 $("#astroInfo").replaceChildren(...labels.map(t=>{const el=document.createElement("span");el.textContent=t;return el}));
 $("#prevDay").disabled=selected==="1900-01-01";$("#nextDay").disabled=selected==="2100-12-31";
}
function setupUpgrade(){
 $("#settingsOpen").onclick=()=>$("#settingsDialog").showModal();
 $("#settingsClose").onclick=()=>$("#settingsDialog").close();
 $("#selectedCard").onclick=()=>$("#dateDialog").showModal();
 $("#dateClose").onclick=()=>$("#dateDialog").close();
 for(const [id,delta] of [["prevDay",-1],["nextDay",1]])$("#"+id).onclick=()=>{const d=new Date(selected+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+delta);const next=d.toISOString().slice(0,10);if(next<"1900-01-01"||next>"2100-12-31")return;selected=next;view=next.slice(0,7);render()};
 const applyLanguage=()=>{document.documentElement.lang=language;document.querySelectorAll("[data-my]").forEach(e=>e.textContent=e.dataset[language]);$("#today").textContent=tr("ယနေ့","Today");document.querySelector(".month-agenda summary").textContent=tr("ယခုလ ပွဲတော်နှင့် ရုံးပိတ်ရက်များ","This month · Holidays & occasions");document.querySelectorAll(".weekdays span").forEach((e,i)=>e.textContent=language==="my"?["နွေ","လာ","ဂါ","ဟူး","ကြာ","သော","နေ"][i]:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][i]);};
 $("#language").value=language;applyLanguage();$("#language").onchange=()=>{language=$("#language").value;write("mm_language",language);applyLanguage();render()};
 for(const [id,key,cls] of [["showAstro","mm_show_astro","hide-astro"],["showCulture","mm_show_culture","hide-culture"]]){const el=$("#"+id);el.checked=read(key,true)!==false;document.body.classList.toggle(cls,!el.checked);el.onchange=()=>{document.body.classList.toggle(cls,!el.checked);write(key,el.checked)}}
 const large=read("mm_large",false)===true;document.body.classList.toggle("large",large);$("#font").setAttribute("aria-pressed",String(large));$("#font").addEventListener("click",()=>write("mm_large",document.body.classList.contains("large")));
 for(const [kind,label] of [["yatyaza",tr("ရက်ရာဇာ","Yatyaza")],["pyathada",tr("ပြဿဒါး","Pyathada")]]){const span=document.createElement("span");span.append(marker(kind,label),document.createTextNode(label));$("#iconLegend").append(span)}
}

setupCalendarConnect(() => Number(view.slice(0,4)));
setupUpgrade();
render();
let lastToday = todayISO();
setInterval(() => {
  if (todayISO() !== lastToday) {
    lastToday = todayISO();
    render();
  }
}, 30000);
if ("serviceWorker" in navigator)
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});

const dateHeading = document.getElementById("todayMM");

function fitDateHeading() {
  if (!dateHeading || !dateHeading.clientWidth) return;

  // မူရင်း CSS font size မှ ပြန်တွက်မယ်
  dateHeading.style.removeProperty("font-size");

  const fontSize = parseFloat(
    getComputedStyle(dateHeading).fontSize
  );

  const availableWidth = dateHeading.clientWidth;
  const textWidth = dateHeading.scrollWidth;

  if (textWidth > availableWidth) {
    const fittedSize =
      fontSize * ((availableWidth - 2) / textWidth);

    dateHeading.style.fontSize =
      `${Math.floor(fittedSize * 10) / 10}px`;
  }
}

if (dateHeading) {
  let pendingFrame;

  const scheduleFit = () => {
    cancelAnimationFrame(pendingFrame);
    pendingFrame = requestAnimationFrame(fitDateHeading);
  };

  // ဖုန်းလှည့်ခြင်း၊ မျက်နှာပြင်အကျယ်ပြောင်းခြင်း
  new ResizeObserver(scheduleFit).observe(
    dateHeading.parentElement
  );

  // ရက်စွဲစာသား ပြောင်းခြင်း
  new MutationObserver(scheduleFit).observe(dateHeading, {
    childList: true,
    characterData: true,
    subtree: true
  });

  // မြန်မာ font တင်ပြီးမှ ထပ်ချိန်မယ်
  document.fonts.ready.then(scheduleFit);
  scheduleFit();
}
for (const [key, label] of [['coffee', '☕ Coffee'], ['burger', '🍔 Burger'], ['meal', '🍽 Big meal']]) {
  let url;
  try { const candidate = new URL(supportLinks[key]); if (candidate.protocol === 'https:') url = candidate.href; } catch {}
  const control = document.createElement(url ? 'a' : 'button');
  control.textContent = label;
  if (url) { control.href = url; control.target = '_blank'; control.rel = 'noopener noreferrer'; }
  else {
    control.type = 'button';
    control.title = 'ပံ့ပိုးမှုလင့်ခ် မထည့်ရသေးပါ';
    control.onclick = () => showDialog('ပံ့ပိုးမှု · Support', 'ပံ့ပိုးမှုလင့်ခ် မထည့်ရသေးပါ။ ကျေးဇူးတင်ပါတယ်။');
  }
  $('#supportLinks').append(control);
}
