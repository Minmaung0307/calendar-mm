import {ceDateTime, ceMmDateTime as C} from './ceMmDateTime.js';
export const digits = n => String(n).replace(/\d/g,d=>'၀၁၂၃၄၅၆၇၈၉'[d]);
export function todayISO(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Yangon',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function calendarDate(iso){
 const [y,m,d]=iso.split('-').map(Number), jdn=ceDateTime.w2j(y,m,d,12,0,0,1), r=C.j2m(jdn);
 const names=['ပထမဝါဆို','တန်ခူး','ကဆုန်','နယုန်',r.myt?'ဒုတိယဝါဆို':'ဝါဆို','ဝါခေါင်','တော်သလင်း','သီတင်းကျွတ်','တန်ဆောင်မုန်း','နတ်တော်','ပြာသို','တပို့တွဲ','တပေါင်း','နှောင်းတန်ခူး','နှောင်းကဆုန်'];
 const phase=C.cal_mp(r.md,r.mm,r.myt), number=C.cal_mf(r.md);
 const wd=(Math.round(jdn)+2)%7;
 return {...r,jdn,yatyaza:C.cal_yatyaza(r.mm,wd),pyathada:C.cal_pyathada(r.mm,wd),astro:C.cal_astro(jdn),nagahle:C.cal_nagahle(r.mm),mahabote:C.cal_mahabote(r.my,wd),nakhat:C.cal_nakhat(r.my),month:names[r.mm],phase,number,length:C.cal_mml(r.mm,r.myt),sabbath:C.cal_sabbath(r.md,r.mm,r.myt),phaseText:['လဆန်း','လပြည့်','လပြည့်ကျော်','လကွယ်'][phase]+(phase%2===0?' '+digits(number)+' ရက်':''),holidays:C.cal_holiday(jdn)};
}
