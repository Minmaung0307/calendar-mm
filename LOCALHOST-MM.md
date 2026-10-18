# VS Code မှာ ကြိုတင်စမ်းရန်

1. ZIP ကို ဖြည်ပါ။
2. VS Code → File → Open Folder မှ package.json ရှိသည့် calendar-mm folder ကို ဖွင့်ပါ။
3. Terminal → New Terminal ကို နှိပ်ပါ။
4. Node.js ရှိမရှိ `node --version` ဖြင့် စစ်ပါ။ Node.js မရှိလျှင် https://nodejs.org မှ LTS ကို install လုပ်ပြီး VS Code ပြန်ဖွင့်ပါ။
5. `npm start` ကို ရိုက်ပါ။ npm install လုပ်ရန်မလိုပါ။
6. Browser မှ http://localhost:3000 ကို ဖွင့်ပါ။
7. ရပ်ရန် Terminal မှ Ctrl+C နှိပ်ပါ။

## စမ်းကြည့်ရန်

- လနှင့်နှစ်ပြောင်းကြည့်ပါ။ ဆန်း/ဆုတ် ဂဏန်း၊ ပြည့်/ကွယ်၊ icon နှင့် နက္ခတ်အစက်များကို စစ်ပါ။
- နေ့အကွက်ကို နှိပ်ပြီး အသေးစိတ်ဖွင့်/ပိတ် စမ်းပါ။
- Browser Developer Tools ဖြင့် mobile, tablet, desktop အရွယ်အစား စမ်းပါ။
- “ဖုန်း Calendar ထဲထည့်ရန်” → နှစ်နှင့်အမျိုးအစားရွေး → .ics ဖိုင် download လုပ်ပါ။
- Mac Calendar တွင် စမ်းမည့်အခါ File → New Calendar → On My Mac ဖြင့် သီးခြား “MM Test” calendar တစ်ခုဖန်တီးပါ။ File → Import မှ download လုပ်ထားသော .ics ကိုရွေးပြီး MM Test ထဲသာ ထည့်ပါ။
- Mac တွင် event ကို နှစ်ချက်နှိပ်၍ Notes ကို စစ်ပါ။ ထပ်စမ်းမည့်အခါ MM Test calendar ကို ဖျက်ပြီး အသစ်ဖန်တီး၍ ထည့်ပါ။
- Localhost တွင် public subscription ခလုတ် မဖွင့်ထားပါ။ Download/Import ဖြင့် အရင်စမ်းနိုင်သည်။ ဖုန်းမှ Mac ၏ localhost ကို တိုက်ရိုက်မသုံးနိုင်ပါ။

## ပြင်ပြီးနောက်

Browser ကို refresh လုပ်ပါ။ အဟောင်းကိုပဲ မြင်နေရလျှင် Developer Tools → Application → Service Workers → Unregister လုပ်ပြီး ပြန်ဖွင့်ပါ။
Feed ဖိုင်ကို ပြန်ထုတ်ရန် `npm run build:feeds` ကို run ပါ။ စစ်ဆေးမှုအားလုံး run ရန် `npm test` ကိုသုံးပါ။
