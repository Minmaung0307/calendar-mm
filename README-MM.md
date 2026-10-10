# မြန်မာပြက္ခဒိန် — 2026 ပြင်ဆင်ချက်

## အသုံးပြုရန်

မူရင်း project ကို အရန်သိမ်းပြီး ZIP ဖြည်ပါ။ calendar-mm folder ထဲတွင်:

```sh
python3 -m http.server 8080 --directory public
```

Browser မှ http://localhost:8080 ကို ဖွင့်ပါ။ index.html ကို double-click ဖြင့် တိုက်ရိုက်မဖွင့်ပါနှင့် (JavaScript modules သုံးထားသည်)။ npm install / build မလိုပါ။

Firebase CLI ရှိပြီး login ဝင်ထားပါက:

```sh
firebase deploy --only hosting
```

မူရင်း Firebase project `ical-mm` ကို ထိန်းထားပါသည်။ မိမိရည်ရွယ်ထားသော project ဟုတ်မဟုတ် `.firebaserc` တွင် စစ်ဆေးပါ။ ဤ ZIP ကို ပြင်ဆင်ပေးခြင်းသာဖြစ်ပြီး live site သို့ deploy မလုပ်ရသေးပါ။

## ငွေပေးချေမှု ချိတ်ဆက်ရန်

`public/config.js` ထဲရှိ `coffee`, `burger`, `meal`, `charity` ကို မိမိ၏ HTTPS checkout / charity URL များဖြင့် ဖြည့်ပါ။ URL မထည့်မချင်း ခလုတ်များသည် “မချိတ်ဆက်ရသေး” ဟု ပြပါမည်။ ပမာဏနှင့် လက်ခံသူကို payment provider တွင် သတ်မှတ်ပါ။ Secret API key မထည့်ပါနှင့်။ Charity အတွက် သက်ဆိုင်ရာအဖွဲ့၏ တရားဝင်အလှူလင့်ခ်ကို သုံးပါ။

## ပြင်ထားသည့်အချက်များ

- ပျမ်းမျှ lunar cycle ဖြင့် ခန့်မှန်းခြင်းကို ဖယ်ပြီး Yan Naing Aye ၏ မြန်မာပြက္ခဒိန်တွက်ချက်မှုကို သုံးထားသည်။ MIT license ကို LICENSE-calendar.txt တွင် ထည့်ထားသည်။ Original source: https://github.com/yan9a/mmcal (ceMmDateTime.js version 20260909)။ Date classes သာ ထုတ်ယူပြီး ES module export ထည့်ထားသည်။ Chronicle data fetch မပါဝင်ပါ။
- 2026-10-10 = 1388 တော်သလင်း လပြည့်ကျော် ၁၄။ 2026-10-11 လကွယ်၊ 2026-10-12 သီတင်းကျွတ် လဆန်း ၁။ 1388 သည် ဝါကြီးထပ်နှစ်ဖြစ်ပြီး ပထမ/ဒုတိယဝါဆို ပါဝင်သည်။
- ယနေ့ကို Asia/Yangon အချိန်ဇုန်ဖြင့် ဆုံးဖြတ်သည်။ ညသန်းခေါင်ကျော်ပါက ၃၀ စက္ကန့်အတွင်း refresh ဖြစ်သည်။
- Responsive grid, dark/light/system theme, font size control, keyboard arrow navigation, selected-day details, local notes, local custom events ပါဝင်သည်။
- မူရင်း local custom events key ကို ဆက်သုံးထားသည်။ Site origin မပြောင်းလျှင် ယခင် event များ ဆက်ပေါ်နိုင်သည်။ Notes နှင့် events သည် စက်အချင်းချင်း sync မလုပ်ပါ။
- SVG favicon/logo နှင့် PNG installation fallback icons။ Privacy/Terms dialog၊ SVG heart၊ dynamic copyright year။
- Offline cache version အသစ်၊ service-worker update နှင့် no-cache headers။ Deploy ပြီး ဟောင်းနေသေးလျှင် online အနေဖြင့် reload လုပ်ပြီး tab ပိတ်ဖွင့်ပါ။
- ယခင် sample holidays / wahtat JSON များကို active calculation တွင် မသုံးတော့ပါ။ မူရင်း data ဖိုင်များကို ထိန်းထားသည်။ အစိုးရက သီးခြားကြေညာသည့် ရုံးပိတ်ရက်အားလုံး ပါဝင်မည်ဟု မဆိုလိုပါ။

## စမ်းသပ်ရန်

Node.js ရှိပါက `npm test` ဖြင့် ရက်စွဲ fixtures နှင့် 1900–2100 ရက်ဆက်ပြောင်းမှု စစ်နိုင်သည်။ ဤအပိုင်းက algorithm ၏ သမိုင်းဆိုင်ရာရက်အားလုံးကို အပြင်ရင်းမြစ်နှင့် စစ်ပြီးဟု မဆိုလိုပါ။

ဖုန်း၊ tablet၊ desktop ပေါ်တွင် လပြောင်းခြင်း၊ dark mode၊ မှတ်စု save/reload၊ custom event၊ modal Escape/close နှင့် offline reload ကို စစ်ပါ။ ငွေပေးချေမှုလင့်ခ်ထည့်ပြီးလျှင် လက်ခံသူ/ပမာဏကို မိမိကိုယ်တိုင် စစ်ပါ။

စစ်ဆေးပြီး: Firefox headless browser တွင် 320၊ 375၊ 768၊ 1024၊ 1440 px အကျယ်များ၌ horizontal overflow မရှိခြင်း၊ မှတ်စု save/reload၊ Privacy dialog Escape ဖြင့်ပိတ်ခြင်း၊ theme ပြောင်းခြင်းနှင့် JavaScript runtime error မရှိခြင်း။ တကယ့် iPhone/Android စက်အားလုံးတွင် စမ်းထားခြင်း မဟုတ်ပါ။ မြန်မာစာ font ကို site ထဲတွင် ထည့်ထားသဖြင့် Google Fonts network ကို မလိုပါ။ Font license ကို public/fonts/OFL.txt တွင် ပါဝင်သည်။

## ဒုတိယပြင်ဆင်ချက် — ကဗျာ၊ ပွဲတော်၊ icon များ

- Calendar credit သည် ရက်စွဲတွက်ချက်သော open-source engine ကို ရည်ညွှန်းခြင်းဖြစ်သည်။ UI နှင့် SVG icon များကို ဤ project အတွက် ဖန်တီးထားသည်။
- လပြည့်၊ လကွယ်၊ အဖိတ်၊ ဥပုသ်၊ အထူးနေ့၊ ရုံးပိတ်ရက်အတွက် SVG icon များနှင့် ရှင်းလင်းချက်ပါသည်။
- မူရင်းကဗျာ ၁၂ လ ပြန်ပါသည်။ မြန်မာလနှစ်လပါသော အင်္ဂလိပ်လတွင် ကဗျာရွေးချယ်ခလုတ်ဖြင့် ပြောင်းကြည့်နိုင်သည်။ ပထမ/ဒုတိယဝါဆို နှစ်ခုလုံးသည် ဝါဆိုကဗျာကို သုံးသည်။
- Birthstone သည် အင်္ဂလိပ်လအလိုက်ဖြစ်ပြီး မြန်မာလနှင့် မရောထားပါ။
- လစဉ်ပွဲတော်စာရင်းနှင့် နှစ်စဉ်ရုံးပိတ်ရက်စာရင်းကို နှိပ်ဖွင့်နိုင်သည်။ စာရင်းမှနေ့ကို နှိပ်လျှင် အသေးစိတ်သို့ ရောက်သည်။
- 2026 ရုံးပိတ်ရက်စာရင်းမှာ public/events.js ရှိ official2026 ဖြစ်သည်။ ထပ်မံကြေညာချက်ရလာလျှင် ဤနေရာတွင် update လုပ်ပြီး service-worker.js ရှိ CACHE version ကို တိုးပါ။
- 2026 ဒီပါဝလီရုံးပိတ်ရက် အတည်ပြုချက်မရသေး။ အခြားနှစ်များအတွက် နှစ်အလိုက်ကြေညာရက်များ အပြည့်အစုံမဟုတ်ဘဲ ပုံမှန်တွက်ချက်ရက်များသာဖြစ်သည်။ ရင်းမြစ်များကို SOURCES.md တွင် ကြည့်နိုင်သည်။
- ငွေလက်ခံလင့်ခ်များကို public/config.js တွင် ဆက်ဖြည့်နိုင်သည်။ Live deploy မလုပ်ရသေးပါ။

## တတိယပြင်ဆင်ချက် — ခလုတ်နှင့် hover

- ကိုယ်ပိုင်အထူးနေ့ ဖျက်ခလုတ်ကို စာမပါသော အနီရောင်အမှိုက်ပုံး SVG ဖြင့် ညာဘက်အဆုံးတွင် ထားသည်။
- မှတ်စု Save/Delete ကို SVG icon များဖြင့် ပြောင်းပြီး tooltip နှင့် screen-reader label များ ထည့်ထားသည်။
- ထည့်မယ်နှင့် Save ခလုတ် hover/focus အရောင်များကို light/dark/system mode အတွက် သတ်မှတ်ထားသည်။
- အဖိတ်နေ့ကို ကြေးစည် SVG၊ အထူးနေ့ကို confetti SVG ဖြင့် ပြောင်းထားသည်။
- လစဉ်/နှစ်စဉ်စာရင်းသည် ရွေးထားသော လ/နှစ်အလိုက် ပြောင်းသည်။ ထပ်တိုးအစိုးရကြေညာချက်များကို အွန်လိုင်းမှ အလိုအလျောက်ဆွဲယူခြင်း မဟုတ်ပါ။
