import {lotReading} from './lot-reading';
import {looks,type Analysis} from './face-engine';
import {matchLook} from './look-match';
import {makeupProfile} from './makeup-renderer';
import type {Profile} from './personal-match';
export const colorChoices=[
 {id:'rose',name:'玫瑰粉系',en:'Rose pink',colors:['#f3b9ca','#d87098','#a6476d']},
 {id:'coral',name:'蜜桃珊瑚系',en:'Peach & coral',colors:['#ffd0a1','#e7846b','#bd5545']},
 {id:'brown',name:'裸棕大地系',en:'Nude & earth',colors:['#dbbca0','#a27960','#6f4636']},
 {id:'gold',name:'香槟金系',en:'Champagne gold',colors:['#f5e4b6','#c7a257','#907037']},
 {id:'red',name:'莓果红系',en:'Berry red',colors:['#de8292','#c13d59','#812941']},
 {id:'purple',name:'紫色系',en:'Violet',colors:['#d9b9ed','#aa75cf','#705097']},
 {id:'blue',name:'蓝绿色系',en:'Blue & teal',colors:['#b4dfe2','#609eae','#316a88']},
 {id:'silver',name:'银灰色系',en:'Silver & grey',colors:['#edf0f6','#b3bdce','#717d91']},
];
const meta:Record<string,{difficulty:number;minutes:number;family:string;poem:string;poemEn:string}>={
 spring:{difficulty:1,minutes:6,family:'rose',poem:'春风偷借一枝花，\n轻点双颊映朝霞。\n不必浓描争颜色，\n笑时自有好芳华。',poemEn:'A blossom borrowed from the breeze,\nA blush as soft as morning skies.\nNo heavy stroke need claim the light;\nYour smile lets every petal rise.'},
 summer:{difficulty:1,minutes:4,family:'coral',poem:'一捧晴光落面颊，\n桃色微澜映流霞。\n水光不必藏颜色，\n轻妆也可自成花。',poemEn:'A handful of sunlight on your cheek,\nPeach-colored ripples catch the day.\nLet dewy skin hold gentle color;\nA lighter look can bloom its way.'},
 sport:{difficulty:1,minutes:4,family:'coral',poem:'风过眉间步履轻，\n暖橘一点伴新程。\n汗光不掩眉眼色，\n自在出发便是晴。',poemEn:'A breeze across your brow, a lighter stride,\nA touch of orange by your side.\nLet your warm color join the glow;\nYour sunny spirit leads the road.'},
 inclusive:{difficulty:1,minutes:4,family:'brown',poem:'清茶一盏照晨窗，\n眉眼轻描自有章。\n留白三分添余味，\n本来颜色也生香。',poemEn:'Morning tea beside the window,\nA gentle line gives shape to light.\nLeave a little space for breathing;\nYour own soft colors shine just right.'},
 autumn:{difficulty:2,minutes:12,family:'brown',poem:'秋叶裁成眼尾光，\n一抹暖棕不声张。\n从容自有千般色，\n落笔轻轻也有章。',poemEn:'An autumn leaf becomes your gaze,\nWarm brown speaks in quiet ways.\nComposure holds a thousand shades;\nA gentle stroke still leaves its trace.'},
 shadow:{difficulty:2,minutes:10,family:'brown',poem:'山影斜斜入画间，\n轻收轮廓见眉弯。\n深浅有度留余白，\n不争浓艳也悠然。',poemEn:'Mountain shadows enter the frame,\nSoft contours quietly find their shape.\nBalance depth with room to breathe;\nAn understated beauty stays.'},
 winter:{difficulty:2,minutes:12,family:'red',poem:'朱砂一点暖新颜，\n雪色留白衬唇间。\n把喜气藏于细处，\n红意盈盈不必言。',poemEn:'A touch of crimson warms the face,\nA little space lets red take place.\nKeep the celebration in details;\nYour lips speak joy without a phrase.'},
 red:{difficulty:2,minutes:12,family:'red',poem:'红莓初熟照唇边，\n一眼风华不待言。\n眉目收来三分静，\n把余下勇气点鲜。',poemEn:'A ripe red berry colors your lips,\nA glance needs little explanation.\nKeep your eyes a little quieter;\nLet boldness bloom in concentration.'},
 chrome:{difficulty:3,minutes:20,family:'silver',poem:'月光折进眼波间，\n银色微芒照夜阑。\n不借繁星添胆色，\n你来便有一重天。',poemEn:'Moonlight folds into your gaze,\nA silver gleam lights up the night.\nNo borrowed star need lend you courage;\nYou bring your own horizon bright.'},
 gem:{difficulty:3,minutes:25,family:'purple',poem:'星子轻落眼尾旁，\n紫烟一缕带微光。\n今宵不必循旧色，\n小小晶莹也锋芒。',poemEn:'A little star beside your eye,\nA violet haze with light inside.\nLeave familiar shades for one night;\nTiny crystals still shine bright.'},
 color:{difficulty:3,minutes:20,family:'purple',poem:'紫云翻涌入晴空，\n眉眼敢借一阵风。\n颜色从来无定式，\n今日由你写不同。',poemEn:'Violet clouds across clear skies,\nA breeze brings daring to your eyes.\nColor follows no fixed rule;\nToday, write something only you can do.'},
 graphic:{difficulty:3,minutes:25,family:'coral',poem:'橘月悬在小夜窗，\n奇趣轻点两颊旁。\n借来一笔童心色，\n把平常画成开场。',poemEn:'An orange moon at the night window,\nPlayful details across your cheeks.\nBorrow a stroke of childlike wonder;\nMake ordinary days a scene.'},
 glow:{difficulty:2,minutes:12,family:'gold',poem:'金光轻落鼻梁边，\n暖日余晖入眼帘。\n不必满身披灿烂，\n一处明亮已翩然。',poemEn:'A golden touch along the bridge,\nWarm evening light upon your eyes.\nYou need not shine in every corner;\nOne bright detail lets you rise.'},
};
export const estimateMinutes=(id:string,profile:Profile)=>Math.ceil((meta[id]?.minutes||5)*(profile.skill==='expert'?.5:profile.skill==='beginner'?1.25:1));
export const lookDifficulty=(id:string)=>meta[id]?.difficulty||1;
export function complexityLimit(profile:Profile){const skill=profile.skill||'regular',time=Number(profile.minutes||10);return skill==='beginner'?(time<=5?1:2):skill==='expert'?(time<=5?2:3):(time<=10?2:3);}
export type PreferenceResult={id:string;reason:string;reasonEn:string;name:string;nameEn:string;palette:{eye:string;blush:string;lip:string};number?:number;dice?:[number,number];cup?:number;poem:string;poemEn:string;interpretation:string;interpretationEn:string;minutes:number;colorFamily:string};
export function preferenceMatch(season:string,occasion:string,a:Analysis,profile:Profile,favorites:{lookId?:string}[],number?:number):PreferenceResult{
 const adventurous=profile.change==='big';
 const liked=(adventurous?[]:profile.likedColors||[]).filter(x=>colorChoices.some(c=>c.id===x)),avoided=adventurous?[]:profile.avoidedColors||[],limit=complexityLimit(profile);
 const base=matchLook(season==='surprise'?'natural':season,occasion,a);
 let candidates=looks.filter(l=>meta[l.id].difficulty<=limit&&estimateMinutes(l.id,profile)<=Number(profile.minutes||30)&&!avoided.includes(meta[l.id].family));
 if(!candidates.length)candidates=looks.filter(l=>meta[l.id].difficulty<=limit&&estimateMinutes(l.id,profile)<=Number(profile.minutes||30));
 // Outdoors remains lightweight; festive scenarios retain their character when feasible.
 if(occasion==='sport')candidates=candidates.filter(l=>meta[l.id].difficulty===1);
 const scenes:Record<string,string[]>={work:['autumn','shadow','inclusive'],daily:['inclusive','summer','spring','autumn'],date:['spring','red','summer'],beach:['summer','sport','glow'],sport:['sport'],party:['chrome','color','glow'],dinner:['red','glow'],newyear:['winter','red'],halloween:['graphic'],festival:['gem','color','chrome']};
 const ranked=candidates.map(l=>{const m=meta[l.id];let score=l.id===base.id?20:0;if((scenes[occasion]||scenes.daily).includes(l.id))score+=14;if(liked.includes(m.family))score+=22;if(!adventurous&&favorites.some(f=>f.lookId===l.id))score+=profile.change==='medium'?1:4;if(!adventurous&&profile.mbti.startsWith('I')&&m.difficulty===1)score+=1;if(a.widest===2&&['spring','summer'].includes(l.id))score+=2;
 if(adventurous){if(l.id!==base.id)score+=24;score+=m.difficulty*2;}
 if(number!==undefined)score+=((number*37+l.id.length*19+l.id.charCodeAt(0)*11)%97)/5;return {l,score};}).sort((a,b)=>b.score-a.score);
 const chosen=ranked[0]?.l||looks[0],m=meta[chosen.id],p=makeupProfile(chosen.id);
 const selected=colorChoices.find(c=>liked.includes(c.id)&&!avoided.includes(c.id))||colorChoices.find(c=>c.id===m.family&&!avoided.includes(c.id))||colorChoices.find(c=>!avoided.includes(c.id))||colorChoices[2];
 // Use the desired hue for eyes and wearable, coordinated cheek/lip colors. Avoided families never return via accent colors.
 const palettes:Record<string,{eye:string;blush:string;lip:string}>={rose:{eye:'#b97894',blush:'#e06a91',lip:'#bf507b'},coral:{eye:'#bc8057',blush:'#e57e64',lip:'#c7654d'},brown:{eye:'#95634a',blush:'#a97a67',lip:'#9b6654'},gold:{eye:'#c7a257',blush:'#bd8b65',lip:'#b47b54'},red:{eye:'#a65b69',blush:'#c16b79',lip:'#b72e4d'},purple:{eye:'#a26bc5',blush:'#af7894',lip:'#995c88'},blue:{eye:'#609eae',blush:'#a67e74',lip:'#927069'},silver:{eye:'#b3bdce',blush:'#aa8189',lip:'#946c78'}};
 let palette={eye:p.eye,blush:p.blush,lip:p.lip};
 const custom=liked.length>0||avoided.length>0;if(custom)palette={...palettes[selected.id]};
 const skillText=profile.skill==='beginner'?'步骤简洁，适合刚开始学化妆':profile.skill==='expert'?'按你的熟练度保留更完整的眼唇细节':'兼顾容易上手与清晰妆感';
 const skillEn=profile.skill==='beginner'?'Simple steps suit a beginner':profile.skill==='expert'?'Your experience leaves room for more eye and lip detail':'Balances accessible steps with a visible makeup finish';
 const estimate=estimateMinutes(chosen.id,profile);
 const colorNote=adventurous?'今天大胆改变，跳出颜色、MBTI 与收藏习惯。':custom?`配色以${selected.name}为主，避开你不喜欢的色系。`:'配色延续妆容主题。';
 const reason=`${skillText}；预计约${estimate}分钟。${colorNote}结合所选季节、场景与脸部轮廓，推荐${chosen.name}。`;
 const reasonEn=`${skillEn}; allow about ${estimate} minutes. ${adventurous?'Today’s bold change explores beyond color preferences, MBTI and favorites.':custom?`The palette centers on ${selected.en.toLowerCase()}, excluding your avoided color families.`:'Colors follow the look’s original theme.'} The selected season, occasion and face contours guide the look.`;
 const reading=number!==undefined?lotReading(number):null;
 return {id:chosen.id,name:chosen.name,nameEn:chosen.name,reason,reasonEn,palette,number,poem:reading?.poem||m.poem,poemEn:reading?.poemEn||m.poemEn,interpretation:reading?.interpretation||`这支签邀请你把${selected.name}放进今天的妆里。${skillText}，让眼唇有一个重点，其他地方留些呼吸感。签诗只是趣味灵感，真正的选择由你的偏好决定。`,interpretationEn:reading?.interpretationEn||`This stick invites ${selected.en.toLowerCase()} into your look. ${skillEn}; give eyes or lips a focal point and let the rest breathe. The verse is playful inspiration; your preferences guide the actual choice.`,minutes:estimate,colorFamily:selected.id};
}
