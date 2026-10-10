import { icon } from "./icons.js";
import { poems, festivals, stones, baseMonth } from "./culture.js";
import { calendarEvents } from "./events.js";
import { calendarDate, todayISO, digits } from "./myanmarCalendar.js";
import { supportLinks } from "./config.js";
const $ = (s) => document.querySelector(s),
  key = "myanmar_calendar_custom_v4";
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
let selected = todayISO(),
  view = selected.slice(0, 7),
  custom = read(key, []);
if (!Array.isArray(custom)) custom = [];
let notes = read("mm_calendar_notes_v1", {});
if (!notes || typeof notes !== "object" || Array.isArray(notes)) notes = {};
const months = Array.from({ length: 12 }, (_, m) =>
  new Date(2026, m, 1).toLocaleString("en", { month: "long" }),
);
months.forEach((m, i) => $("#month").add(new Option(m, i + 1)));
for (let y = 1900; y <= 2100; y++) $("#year").add(new Option(y, y));
const iso = (y, m, d) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const title = (r) => `${r.month} ${r.phaseText}`;
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
function eventsFor(s) {
  return custom.filter((e) => e && e.date === s && typeof e.title === "string");
}
function details() {
  const r = calendarDate(selected);
  $("#selectedTitle").textContent = title(r);
  $("#selectedMeta").textContent =
    format(selected) + " · " + digits(r.my) + " ခုနှစ်";
  $("#eventDate").value = selected;
  $("#note").value = typeof notes[selected] === "string" ? notes[selected] : "";
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
  eventsFor(selected).forEach((e) => {
    const p = document.createElement("p");
    p.className = "event custom-event";
    const span = document.createElement("span");
    span.className = "custom-event-title";
    span.textContent = e.title;
    const b = document.createElement("button");
    b.className = "icon-button danger-button";
    b.title = "အထူးနေ့ ဖျက်ရန်";
    b.append(icon("delete"));
    b.setAttribute("aria-label", e.title + " ဖျက်ရန်");
    b.onclick = () => {
      const next = custom.filter((x) => x !== e);
      if (write(key, next)) {
        custom = next;
        render();
      }
    };
    p.append(span, b);
    $("#events").append(p);
  });
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
    `${a.month}${a.month === z.month ? "" : " — " + z.month} · ${digits(a.my)}${a.my === z.my ? "" : " / " + digits(z.my)}`;
  $("#prev").disabled = view === "1900-01";
  $("#next").disabled = view === "2100-12";
  $("#grid").replaceChildren();
  const pad = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
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
    mn.textContent = r.month;
    const ph = document.createElement("span");
    ph.className = "phase";
    ph.dataset.short = [
      "ဆန်း " + digits(r.number),
      "လပြည့်",
      "ဆုတ် " + digits(r.number),
      "လကွယ်",
    ][r.phase];
    ph.textContent = r.phaseText.replace(" ရက်", "");
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
    if (allEvents.some((e) => e.type !== "holiday") || eventsFor(s).length)
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
$("#save").append(icon("save"));
$("#delete").append(icon("delete"));
$("#save").onclick = () => {
  const next = { ...notes, [selected]: $("#note").value };
  if (write("mm_calendar_notes_v1", next)) {
    notes = next;
    $("#status").textContent = "မှတ်စု သိမ်းပြီးပါပြီ။";
  }
};
$("#delete").onclick = () => {
  const next = { ...notes };
  delete next[selected];
  if (write("mm_calendar_notes_v1", next)) {
    notes = next;
    $("#note").value = "";
    $("#status").textContent = "မှတ်စု ဖျက်ပြီးပါပြီ။";
  }
};
$("#customForm").onsubmit = (e) => {
  e.preventDefault();
  const date = $("#eventDate").value,
    t = $("#eventTitle").value.trim();
  if (!t) return;
  const next = [...custom, { date, title: t, type: $("#eventType").value }];
  if (write(key, next)) {
    custom = next;
    selected = date;
    view = date.slice(0, 7);
    $("#eventTitle").value = "";
    render();
    $("#status").textContent = "အထူးနေ့ ထည့်ပြီးပါပြီ။";
  }
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
document.querySelectorAll("[data-support]").forEach(
  (b) =>
    (b.onclick = () => {
      const url = supportLinks[b.dataset.support];
      try {
        const u = new URL(url);
        if (u.protocol === "https:") {
          window.open(u.href, "_blank", "noopener,noreferrer");
          return;
        }
      } catch {}
      showDialog(
        b.textContent,
        "ငွေပေးချေမှုလင့်ခ် မချိတ်ဆက်ရသေးပါ။ လက်ရှိ ငွေပေးချေ၍ မရသေးပါ။",
      );
    }),
);
const policies = {
  privacy: [
    "Privacy · ကိုယ်ရေးအချက်အလက်",
    "ဤပြက္ခဒိန်သည် အကောင့်ဖွင့်ရန် မလိုအပ်ပါ။ မှတ်စု၊ ကိုယ်ပိုင်အထူးနေ့နှင့် အရောင်ရွေးချယ်မှုကို သင့် browser ၏ localStorage တွင်သာ သိမ်းပါသည်။ အခြားစက်များသို့ အလိုအလျောက် မကူးပါ။ Browser data ဖျက်လျှင် မှတ်စုများ ပျောက်နိုင်ပါသည်။ Offline အသုံးပြုနိုင်ရန် site ဖိုင်များကို cache သိမ်းပါသည်။ Site code တွင် analytics နှင့် ကြော်ငြာ tracker မထည့်ထားပါ။ Hosting ဝန်ဆောင်မှုက ပုံမှန် access log များ သိမ်းနိုင်ပါသည်။ ပြင်ပငွေပေးချေမှုလင့်ခ်များ အသုံးပြုလျှင် သက်ဆိုင်ရာဝန်ဆောင်မှု၏ privacy စည်းကမ်းများ သက်ရောက်ပါသည်။",
  ],
  terms: [
    "Terms · အသုံးပြုမှုစည်းကမ်း",
    "ဤပြက္ခဒိန်ကို နေ့စဉ်ရက်စွဲကြည့်ရှုရန် အသုံးပြုနိုင်ပါသည်။ မြန်မာရက်စွဲများကို Yan Naing Aye ၏ MIT လိုင်စင်ပါ တွက်ချက်မှုဖြင့် ဖော်ပြထားပါသည်။ ထပ်မံကြေညာသော အစိုးရရုံးပိတ်ရက်များ၊ ဒေသအလိုက် ပွဲတော်များကို တရားဝင်ကြေညာချက်နှင့် ပြန်လည်တိုက်စစ်ပါ။ မှတ်စုများကို သင့်စက်ပေါ်၌သာ သိမ်းထားသဖြင့် အရေးကြီးသောအချက်အလက်ကို သီးခြားအရန်သိမ်းပါ။ ပံ့ပိုးမှုနှင့် အလှူများသည် မိမိဆန္ဒအလျောက်ဖြစ်ပြီး ပြင်ပငွေပေးချေမှုစာမျက်နှာတွင် လက်ခံသူ၊ ပမာဏနှင့် ပြန်အမ်းစည်းကမ်းများကို စစ်ဆေးပါ။",
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
  const names = [
    ...new Set(
      Array.from(
        { length: days },
        (_, i) => calendarDate(iso(y, m, i + 1)).month,
      ),
    ),
  ];
  if (poemsView !== view) {
    $("#cultureMonth").replaceChildren();
    names.forEach((n) => $("#cultureMonth").add(new Option(n, n)));
    poemsView = view;
  }
  if (selected.startsWith(view))
    $("#cultureMonth").value = calendarDate(selected).month;
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
    $(".details").scrollIntoView({ block: "start", behavior: "auto" });
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