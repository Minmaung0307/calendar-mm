export const astroNames={Thamanyo:'သမားညို',Amyeittasote:'အမြိတ္တစုတ်',Warameittugyi:'ဝါရမိတ္တုကြီး',Warameittunge:'ဝါရမိတ္တုငယ်',Yatpote:'ရက်ပုပ်',Thamaphyu:'သမားဖြူ',Nagapor:'နဂါးပေါ်',Yatyotema:'ရက်ယုတ်မာ',Mahayatkyan:'မဟာရက်ကြမ်း',Shanyat:'ရှမ်းရက်'};
export function astrologyDetails(r, tr=(my)=>my){
 const labels=[...r.astro.map(n=>tr(astroNames[n]||n,n)),tr('နဂါးခေါင်းလှည့်ရာ · ','Naga direction · ')+tr(['အနောက်','မြောက်','အရှေ့','တောင်'][r.nagahle],['West','North','East','South'][r.nagahle]),tr(['ဘင်္ဂဖွား','အထွန်းဖွား','ရာဇဖွား','အဓိပတိဖွား','မရဏဖွား','သိုက်ဖွား','ပုတိဖွား'][r.mahabote],['Binga','Atun','Yaza','Adipati','Marana','Thike','Puti'][r.mahabote]),tr(['ဘီလူးနက္ခတ်','နတ်နက္ခတ်','လူနက္ခတ်'][r.nakhat],['Ogre Nakhat','Elf Nakhat','Human Nakhat'][r.nakhat])];
 if(r.yatyaza)labels.unshift(tr('ရက်ရာဇာ','Yatyaza'));
 if(r.pyathada)labels.unshift(tr(r.pyathada===2?'မွန်းလွဲပြဿဒါး':'ပြဿဒါး',r.pyathada===2?'Afternoon Pyathada':'Pyathada'));
 return labels;
}
