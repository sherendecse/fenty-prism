import {looks,type Analysis} from './face-engine';
import {matchLook} from './look-match';
import type {FortuneData} from './fortune-source';
export type Profile={name:string;birthday:string;zodiac:string;mbti:string;change?:string;skill?:string;minutes?:string;likedColors?:string[];avoidedColors?:string[]};
export const emptyProfile:Profile={name:'',birthday:'',zodiac:'',mbti:'',change:'small',skill:'',minutes:'',likedColors:[],avoidedColors:[]};
export const zodiacSigns=['摩羯座','水瓶座','双鱼座','白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座'];
export const mbtiTypes=['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];
export function zodiacFromBirthday(value:string){
 const parts=value.split('-').map(Number),m=parts[1],d=parts[2];
 if(!m||!d||m>12||d>31)return '';
 const cuts=[20,19,21,20,21,21,23,23,23,23,22,22];
 return zodiacSigns[d<cuts[m-1]?m-1:m%12];
}
export function localDay(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
const hash=(text:string)=>{let n=2166136261;for(const ch of text)n=Math.imul(n^ch.charCodeAt(0),16777619);return n>>>0;};
const themes=[
 {name:'玫瑰红润',color:'#cb7c93',style:'柔和亲近',ids:['spring','red','winter']},
 {name:'蜜桃暖光',color:'#db9c75',style:'轻盈明亮',ids:['summer','sport','glow']},
 {name:'裸棕柔雾',color:'#af8271',style:'从容自然',ids:['autumn','shadow','inclusive']},
 {name:'冰蓝银光',color:'#aabbd6',style:'清晰前卫',ids:['chrome','gem']},
 {name:'紫粉灵感',color:'#ba87c8',style:'创意表达',ids:['color','gem','spring']},
 {name:'香槟金光',color:'#d4b97c',style:'温暖光泽',ids:['glow','summer','chrome']},
];
export function surpriseMatch(occasion:string,a:Analysis,profile:Profile,favorites:{lookId?:string}[],day=localDay(),fortune?:FortuneData|null){
 const sign=profile.zodiac||zodiacFromBirthday(profile.birthday);
 const fresh=fortune?.status==='current'&&fortune.sourceDate===day&&fortune.sign===sign;
 const familyThemes={pink:0,peach:1,brown:2,blue:3,purple:4,gold:5,red:0,green:1,neutral:2};
 const theme={...(fresh&&fortune.family?themes[familyThemes[fortune.family]]:themes[hash(`${day}:${sign||'prism'}`)%themes.length])};
 if(fresh&&fortune.palette)theme.color=fortune.palette.eye;
 const score=Object.fromEntries(looks.map(l=>[l.id,0]));
 const add=(ids:string[],amount:number)=>ids.forEach(id=>{if(id in score)score[id]+=amount;});
 const scene:Record<string,string[]>={daily:['inclusive','spring','autumn','summer'],work:['autumn','shadow','inclusive'],date:['spring','red','glow','summer'],beach:['summer','glow','sport'],sport:['sport'],party:['chrome','color','glow','gem'],dinner:['red','chrome','glow'],newyear:['winter'],halloween:['graphic'],festival:['gem','color','chrome']};
 const eligible=scene[occasion]||scene.daily;
 add(theme.ids,fresh?11:7);
 if(fresh)add(fortune.cue==='bold'?['color','chrome','glow','gem']:fortune.cue==='soft'?['inclusive','autumn','summer','spring']:['spring','glow','autumn'],2);
 const type=mbtiTypes.includes(profile.mbti)?profile.mbti:'';
 if(type){add(type[0]==='I'?['inclusive','autumn','shadow']:['red','chrome','glow'],2);add(type[1]==='N'?['color','gem','chrome']:['autumn','sport','inclusive'],3);add(type[2]==='F'?['spring','summer','red']:['shadow','chrome','autumn'],2);add(type[3]==='P'?['color','glow','gem']:['inclusive','autumn','winter'],1);}
 const favoriteCounts:Record<string,number>={};
 favorites.forEach(f=>{if(f.lookId&&f.lookId in score)favoriteCounts[f.lookId]=(favoriteCounts[f.lookId]||0)+1;});
 const favoriteIds=Object.keys(favoriteCounts),total=Object.values(favoriteCounts).reduce((sum,n)=>sum+n,0);
 for(const id of favoriteIds)score[id]+=Math.min(9,4+favoriteCounts[id]/Math.max(1,total)*5);
 if(a.widest===2)add(['spring','summer','inclusive'],1.5);if(a.widest===3)add(['autumn','shadow'],1.5);
 for(const id of eligible)score[id]+=(hash(`${day}:${sign}:${type}:${id}`)%100)/100;
 const id=eligible.reduce((best,id)=>score[id]>score[best]?id:best,eligible[0]);
 const chosen=looks.find(l=>l.id===id)!;
 const favoriteNames=favoriteIds.sort((a,b)=>favoriteCounts[b]-favoriteCounts[a]).slice(0,2).map(id=>looks.find(l=>l.id===id)!.name);
 const reason=`${fresh?'依据 AI 当天五行分析，安排妆容配色。':'AI 当天分析暂未生成，本次先按场景与个人偏好推荐。'}今日色彩灵感：${sign||'自由灵感'} · ${theme.name}，${theme.style}。${type?`MBTI 风格线索：${type}。`:''}${favoriteNames.length?`收藏偏好：${favoriteNames.join(' / ')}。`:'还没有收藏，先为你探索新的风格。'}结合当前场景与脸部轮廓，推荐${chosen.name}。`;
 return {id,reason,theme,day,sign,favoriteNames};
}
export function personalizedMatch(season:string,occasion:string,a:Analysis,profile:Profile,favorites:{lookId?:string}[],day=localDay(),fortune?:FortuneData|null):ReturnType<typeof surpriseMatch>|ReturnType<typeof matchLook>{
 return season==='surprise'?surpriseMatch(occasion,a,profile,favorites,day,fortune):matchLook(season,occasion,a);
}
