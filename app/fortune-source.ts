export const signSlugs:Record<string,string>={'白羊座':'aries','金牛座':'taurus','双子座':'gemini','巨蟹座':'cancer','狮子座':'leo','处女座':'virgo','天秤座':'libra','天蝎座':'scorpio','射手座':'sagittarius','摩羯座':'capricorn','水瓶座':'aquarius','双鱼座':'pisces'};
export type FortuneData={status:'current'|'stale'|'unavailable'|'needs_setup';sign:string;url:string;today:string;sourceDate:string|null;luckyColor:string|null;shortComment:string|null;fetchedAt:string;family:ColorFamily|null;cue:'soft'|'bold'|'balanced';element?:string;elementEn?:string;avoid?:string;avoidEn?:string;reasonEn?:string;palette?:{eye:string;blush:string;lip:string};source?:'openai';colorEn?:string};
export type ColorFamily='pink'|'peach'|'brown'|'blue'|'purple'|'gold'|'red'|'green'|'neutral';
export function chinaDay(date=new Date()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
export function colorFamily(color:string):ColorFamily{
 if(/粉|玫瑰/.test(color))return 'pink';if(/紫/.test(color))return 'purple';if(/蓝|青/.test(color))return 'blue';if(/绿|翠/.test(color))return 'green';if(/橙|橘|珊瑚|桃/.test(color))return 'peach';if(/红|绯|朱/.test(color))return 'red';if(/棕|褐|咖|驼/.test(color))return 'brown';if(/金|黄|杏|米/.test(color))return 'gold';return 'neutral';
}
export function parseFortune(html:string,sign:string,today=chinaDay(),fetchedAt=new Date().toISOString()):FortuneData{
 const url=`https://www.xzw.com/fortune/${signSlugs[sign]}/`;
 const text=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
 const heading=text.match(new RegExp(`${sign}今日运势\\s*(?:(\\d{4})年)?\\s*(\\d{1,2})月\\s*(\\d{1,2})日`));
 let sourceDate:string|null=null;
 if(heading){const month=+heading[2],day=+heading[3];if(month>=1&&month<=12&&day>=1&&day<=31){let year=heading[1]?+heading[1]:+today.slice(0,4);if(!heading[1]&&month===12&&today.slice(5,7)==='01')year--;sourceDate=`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;}}
 const luckyColor=text.match(/幸运颜色\s*[：:]\s*([\u4e00-\u9fffA-Za-z]{1,12})(?=\s|幸运数字|$)/)?.[1]||null;
 // Keep only a short source field; never republish full horoscope articles.
 const shortComment=text.match(/短评\s*[：:]\s*(.{1,30}?)(?=\s*(?:综合运势|爱情运势|事业学业))/)?.[1]?.trim()||null;
 const cue=shortComment&&/主动|勇|突破|表达|行动|社交|机遇/.test(shortComment)?'bold':shortComment&&/稳|沉|放松|内心|休息|耐心|深耕/.test(shortComment)?'soft':'balanced';
 return {status:sourceDate&&luckyColor?(sourceDate===today?'current':'stale'):'unavailable',sign,url,today,sourceDate,luckyColor,shortComment,fetchedAt,family:luckyColor?colorFamily(luckyColor):null,cue};
}
