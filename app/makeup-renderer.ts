import {frecklePoints} from './freckle-patterns';
import type {NormalizedLandmark} from '@mediapipe/face_mesh';
import type {Analysis} from './face-engine';
import {looks} from './face-engine';
import {paintLidTint} from './makeup-fields';
import {paintBandPoint,drawHalloweenPaint} from './halloween-paint';
import {eyeRegions,clearOfEyes,gemPlacements,blushPigment,cheekBlushPlacement} from './face-placement';
type Point={x:number;y:number};
export type MakeupSettings={eye:number;blush:number;glow:number;finish:'glow'|'matte';level:number;lip?:number;liner?:number;contour?:number;art?:number;freckles?:boolean;frecklePattern?:number;freckleIntensity?:number;variant?:number;atlas?:HTMLImageElement|null;liveLandmarks?:NormalizedLandmark[];palette?:{eye:string;blush:string;lip:string}|null};
export const levelNames=['弱 · 轻透日常','中 · 清晰妆感','强 · 鲜明表达'];
export function makeupProfile(id:string){
 const base=looks.find(x=>x.id===id)||looks[0];
 const profiles:Record<string,{eye:string;lip:string;blush:string;metal:boolean;gem:boolean;graphic:boolean;blushGain:number;eyeGain:number;glowGain:number;detail:string}>={
 spring:{eye:'#bc806c',lip:'#d85f7b',blush:'#f16987',metal:false,gem:false,graphic:false,blushGain:1.7,eyeGain:1.05,glowGain:.85,detail:'珊瑚粉腮红是主角，搭配清晰玫瑰唇色和柔和眼影。'},
 summer:{eye:'#b77c4e',lip:'#ce725f',blush:'#eb806d',metal:false,gem:false,graphic:false,blushGain:1.3,eyeGain:1.15,glowGain:1.2,detail:'杏金眼妆、珊瑚蜜桃唇与水光腮红，显色清晰，边缘柔和。'},
 chrome:{eye:'#c8d1e2',lip:'#ab6686',blush:'#d08b99',metal:true,gem:false,graphic:false,blushGain:.45,eyeGain:1.3,glowGain:1.2,detail:'银色眼影与冷灰眼尾形成金属焦点，搭配克制裸粉唇。'},
 autumn:{eye:'#92614a',lip:'#a6634f',blush:'#bd736b',metal:false,gem:false,graphic:false,blushGain:.7,eyeGain:.95,glowGain:.35,detail:'暖棕眼影、红棕唇色与低饱和腮红，适合通勤。'},
 shadow:{eye:'#796b63',lip:'#9e7c70',blush:'#967c72',metal:false,gem:false,graphic:false,blushGain:.75,eyeGain:.85,glowGain:.25,detail:'灰棕阴影腮红沿颧骨外侧铺开，唇色保持低饱和。'},
 winter:{eye:'#a85959',lip:'#c8223e',blush:'#e35b66',metal:false,gem:false,graphic:false,blushGain:.95,eyeGain:.75,glowGain:.6,detail:'正红唇色、红调腮红与贴根眼线，形成新中式重点。'},
 red:{eye:'#a05f62',lip:'#bf163e',blush:'#ed5575',metal:false,gem:false,graphic:false,blushGain:1.1,eyeGain:.95,glowGain:.8,detail:'苹果红腮红与浓红唇呼应，眼尾加强轮廓。'},
 graphic:{eye:'#c78343',lip:'#ae3437',blush:'#de9279',metal:false,gem:false,graphic:false,blushGain:.7,eyeGain:.9,glowGain:.6,detail:'橘调眼妆与莓红唇，搭配南瓜、蝙蝠或雀斑彩绘；可预览四款画法。'},
 gem:{eye:'#a098d3',lip:'#c97a9e',blush:'#e995bb',metal:true,gem:true,graphic:false,blushGain:.8,eyeGain:1.2,glowGain:1.1,detail:'冰蓝紫粉眼影，眼尾与颧骨上缘点缀宝石，搭配透亮玫瑰唇。'},
 sport:{eye:'#9f6847',lip:'#b9674f',blush:'#d97961',metal:false,gem:false,graphic:false,blushGain:1.25,eyeGain:1.05,glowGain:.55,detail:'柔雾底妆、暖橘腮红与陶土唇色，呈现清晰的户外暖感。'},
 color:{eye:'#ad57ed',lip:'#dc3c93',blush:'#ee68b1',metal:false,gem:false,graphic:true,blushGain:1,eyeGain:1.35,glowGain:.7,detail:'鲜紫眼妆与玫红唇色，形成高对比彩色表达。'},
 glow:{eye:'#c99b4c',lip:'#ca8769',blush:'#e39882',metal:true,gem:false,graphic:false,blushGain:.7,eyeGain:.8,glowGain:1.6,detail:'金色眼妆、颧骨与鼻梁高光，突出局部光泽。'},
 inclusive:{eye:'#986b52',lip:'#aa6557',blush:'#c16d70',metal:false,gem:false,graphic:false,blushGain:1.05,eyeGain:.95,glowGain:.65,detail:'柔棕眼妆、红棕裸唇与自然红润腮红，保留本色也看得见妆感。'},
 };
 const recipes:Record<string,{eyeCoverage:number;eyePigment:number;blushPlacement:'lift'|'apple'|'sun'|'shadow';lipPigment:number;eyeAccent?:string}>={
 spring:{eyeCoverage:1,eyePigment:.6,blushPlacement:'lift',lipPigment:.45},
 summer:{eyeCoverage:1,eyePigment:.68,blushPlacement:'sun',lipPigment:.53},
 chrome:{eyeCoverage:1.45,eyePigment:.72,blushPlacement:'lift',lipPigment:.24,eyeAccent:'#e4eeff'},
 autumn:{eyeCoverage:1.05,eyePigment:.6,blushPlacement:'lift',lipPigment:.32,eyeAccent:'#81513c'},
 shadow:{eyeCoverage:1,eyePigment:.52,blushPlacement:'shadow',lipPigment:.26},
 winter:{eyeCoverage:.85,eyePigment:.48,blushPlacement:'apple',lipPigment:.6},
 red:{eyeCoverage:1.1,eyePigment:.54,blushPlacement:'apple',lipPigment:.6},
 graphic:{eyeCoverage:1.15,eyePigment:.62,blushPlacement:'sun',lipPigment:.44},
 gem:{eyeCoverage:1.4,eyePigment:.66,blushPlacement:'lift',lipPigment:.37,eyeAccent:'#b5d6f4'},
 sport:{eyeCoverage:.95,eyePigment:.65,blushPlacement:'apple',lipPigment:.5},
 color:{eyeCoverage:1.5,eyePigment:.7,blushPlacement:'lift',lipPigment:.56,eyeAccent:'#52b6dc'},
 glow:{eyeCoverage:1.15,eyePigment:.55,blushPlacement:'lift',lipPigment:.28},
 inclusive:{eyeCoverage:.95,eyePigment:.58,blushPlacement:'lift',lipPigment:.44},
 };
 return {name:base.name,...(profiles[id]||profiles.inclusive),...(recipes[id]||recipes.inclusive)};
}
export function strengthParameters(amount:number){const t=Math.max(0,Math.min(1,amount));return {opacity:t===0?0:.18+.66*t,spread:.7+.65*t,liner:t>.38?(t-.38)/.62:0,sparkles:t<.36?0:t<.7?3:7};}
const faceOval=[10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109];
export function drawMakeup(ctx:CanvasRenderingContext2D,l:NormalizedLandmark[],point:(p:NormalizedLandmark)=>Point,analysis:Analysis,id:string,s:MakeupSettings){
 if(l.length<468)return;
 const p=(i:number)=>point(l[i]),distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y),fw=distance(p(234),p(454));if(!Number.isFinite(fw)||fw<20)return;
 const protection=s.liveLandmarks||l;
 const profile={...makeupProfile(id),...(s.palette||{})},E=strengthParameters(s.eye),B=strengthParameters(s.blush),G=strengthParameters(s.glow),pigment=blushPigment(s.blush,profile.blushGain,analysis.depth);
 const smooth=(points:Point[],closed=true)=>{
  if(points.length<2)return;
  if(!closed){ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length-1;i++){const q=points[i],next=points[i+1];ctx.quadraticCurveTo(q.x,q.y,(q.x+next.x)/2,(q.y+next.y)/2);}const last=points[points.length-1];ctx.lineTo(last.x,last.y);return;}
  const last=points[points.length-1],first=points[0];ctx.moveTo((last.x+first.x)/2,(last.y+first.y)/2);points.forEach((q,i)=>{const next=points[(i+1)%points.length];ctx.quadraticCurveTo(q.x,q.y,(q.x+next.x)/2,(q.y+next.y)/2);});ctx.closePath();
 };
 const path=(ids:number[])=>smooth(ids.map(p));
 const ellipse=(center:Point,rx:number,ry:number,angle:number,color:string,opacity:number,blend:GlobalCompositeOperation='source-over',fog=false)=>{
  ctx.save();ctx.globalCompositeOperation=blend;ctx.globalAlpha=Math.min(.9,opacity);ctx.translate(center.x,center.y);ctx.rotate(angle);ctx.scale(rx,ry);const g=ctx.createRadialGradient(0,0,.05,0,0,1);g.addColorStop(0,color+(fog?'d5':''));g.addColorStop(.15,color+(fog?'b8':'d5'));g.addColorStop(.35,color+(fog?'80':'a0'));g.addColorStop(.55,color+(fog?'40':'5c'));g.addColorStop(.75,color+(fog?'16':'22'));g.addColorStop(.9,color+(fog?'04':'08'));g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();
 };
 ctx.save();ctx.beginPath();path(faceOval);ctx.clip();
 // A quiet base layer preserves skin texture; finishes differ in highlight.
 ctx.save();ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=s.finish==='matte'?.028:.012;ctx.fillStyle=['#efd0b8','#ddb696','#c69a76','#ac805f','#865b41','#61402e'][analysis.depth];ctx.fill();ctx.restore();
 // All tint and decorations respect the current eye openings, including blinking.
 ctx.save();ctx.beginPath();ctx.rect(-10000,-10000,20000,20000);eyeRegions.forEach(eye=>smooth(eye.ring.map(i=>point(protection[i]))));ctx.clip('evenodd');
 const eyes=eyeRegions;
 eyes.forEach(eye=>{
  const a=p(eye.inner),b=p(eye.outer),eyeWidth=distance(a,b),axis={x:(b.x-a.x)/eyeWidth,y:(b.y-a.y)/eyeWidth};if(eyeWidth<2)return;
  let up={x:axis.y,y:-axis.x};if(up.y>0)up={x:-up.x,y:-up.y};
  const lid=eye.upper.map(p),mid=lid[4],angle=Math.atan2(b.y-a.y,b.x-a.x);
  const brow=p(eye.brow),available=Math.max(eyeWidth*.12,Math.abs(brow.y-mid.y)*.7);
  const rise=Math.min(available,eyeWidth*(.11+.19*s.eye)*profile.eyeCoverage);
  // Pigment follows the curved lid rather than a straight-sided clipping polygon.
  paintLidTint(ctx,lid,a,axis,up,eyeWidth,rise,profile.eye,E.opacity*Math.max(.65,Math.min(1,profile.eyeGain))*Math.max(.38,profile.eyePigment),profile.metal?'source-over':'multiply');
  if(profile.eyeAccent&&!s.palette)paintLidTint(ctx,lid,a,axis,up,eyeWidth,rise*.85,profile.eyeAccent,E.opacity*.32,profile.metal?'source-over':'multiply',true);
  if(profile.metal)ellipse({x:mid.x+up.x*rise*.48,y:mid.y+up.y*rise*.48},eyeWidth*.27,rise*.36,angle,'#f4f7ff',E.opacity*(id==='chrome'?.38:.25),'screen');
  // Thin, soft lash-root definition avoids a drawn cartoon eye outline.
  const liner=strengthParameters(s.liner??s.eye).liner;
  if(liner>0){ctx.save();ctx.globalAlpha=liner*(profile.graphic?.6:.42);ctx.strokeStyle=profile.graphic?profile.eye:profile.metal?'#3e4157':'#493a34';ctx.lineWidth=Math.max(.45,fw*(.0012+.0014*(s.liner??s.eye)));ctx.lineJoin='round';ctx.lineCap='round';ctx.filter=`blur(${Math.min(1.2,fw*.001)}px)`;ctx.beginPath();smooth(lid,false);ctx.stroke();ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.quadraticCurveTo(b.x+axis.x*eyeWidth*.07,b.y+axis.y*eyeWidth*.07,b.x+axis.x*eyeWidth*.12*E.spread+up.x*eyeWidth*.045,b.y+axis.y*eyeWidth*.12*E.spread+up.y*eyeWidth*.045);ctx.stroke();
   if(profile.graphic){ctx.strokeStyle=profile.eye;ctx.beginPath();ctx.moveTo(a.x+up.x*rise*1.3,a.y+up.y*rise*1.3);ctx.quadraticCurveTo(mid.x+up.x*rise*1.9,mid.y+up.y*rise*1.9,b.x+axis.x*eyeWidth*.25+up.x*rise,b.y+axis.y*eyeWidth*.25+up.y*rise);ctx.stroke();}ctx.restore();}
  const {center,rx,ry,angle:cheekAngle}=cheekBlushPlacement(eye,protection,point,fw,pigment.spread,analysis.ratio);
  ellipse(center,rx,ry,cheekAngle,profile.blush,pigment.texture*.95,'soft-light',true);
  ellipse(center,rx*.97,ry*.97,cheekAngle,profile.blush,pigment.tint*(['spring','summer','sport','inclusive'].includes(id)?1.14:.86),'source-over',true);
  // A broad white halo overlaps the blush, without a thin specular streak.
  const highlight={x:center.x+up.x*fw*.008,y:center.y+up.y*fw*.008};
  const glowAmount=G.opacity*.24*Math.min(1.3,profile.glowGain)*(s.finish==='matte'?.5:1);
  ellipse(highlight,rx*.9,ry*.75,cheekAngle,'#ffffff',glowAmount,'soft-light');
  ellipse(highlight,rx*.78,ry*.66,cheekAngle,'#ffffff',glowAmount*.48,'screen');
  // Stones stay off the eyes; fewer, smaller points follow the live outer-eye/cheek geometry.
  if(profile.gem&&s.eye>0){const count=s.eye<.36?1:s.eye<.7?3:analysis.eyeRatio>.21?4:5;const placements=gemPlacements(eye,protection,point,fw,s.eye,count);
   placements.forEach((q,k)=>{ctx.save();ctx.globalAlpha=.4+.45*s.eye;ctx.fillStyle=k%2?'#d4ecff':'#f9f4ee';ctx.strokeStyle='#9da4c3';ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(q.x,q.y-q.radius);ctx.lineTo(q.x+q.radius,q.y);ctx.lineTo(q.x,q.y+q.radius);ctx.lineTo(q.x-q.radius,q.y);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();});}
  // Follow the arch of the upper lid rather than a straight line across the pupil.
  if(profile.metal&&E.sparkles>0){for(let k=0;k<E.sparkles;k++){const t=(k+1)/(E.sparkles+1),index=t*(lid.length-1),i=Math.floor(index),f=index-i,q=lid[i],next=lid[Math.min(i+1,lid.length-1)];const spot={x:q.x+(next.x-q.x)*f+up.x*rise*.63,y:q.y+(next.y-q.y)*f+up.y*rise*.63},radius=Math.max(.5,eyeWidth*.009*(1+s.eye));if(!clearOfEyes(spot,radius,protection,point,fw))continue;ctx.save();ctx.globalAlpha=.38+.38*s.eye;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(spot.x,spot.y,radius,0,Math.PI*2);ctx.fill();ctx.restore();}}

 });
 // Full curved lip boundaries, transparent tint and feathered edges retain lip texture.
 const L=strengthParameters(s.lip??s.blush);
 ctx.save();ctx.beginPath();path([61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146]);path([78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95]);ctx.clip('evenodd');
 const lipLeft=p(61),lipRight=p(291),lipTop=p(0),lipBottom=p(17),lipWidth=distance(lipLeft,lipRight),lipHeight=Math.max(2,distance(lipTop,lipBottom));
 const lipCenter={x:(lipLeft.x+lipRight.x)/2,y:(lipTop.y+lipBottom.y)/2},lipAngle=Math.atan2(lipRight.y-lipLeft.y,lipRight.x-lipLeft.x);
 // Tint tapers towards the natural lip edge instead of filling a flat polygon.
 ellipse(lipCenter,lipWidth*.60,lipHeight*.64,lipAngle,profile.lip,L.opacity*.65,'soft-light');
 ellipse(lipCenter,lipWidth*.57,lipHeight*.61,lipAngle,profile.lip,L.opacity*(profile.lipPigment+.1*(1-(s.lip??s.blush))),'source-over');
 ellipse(lipCenter,lipWidth*.54,lipHeight*.58,lipAngle,profile.lip,L.opacity*.1,'multiply');
 if(s.finish==='glow'&&G.opacity>0){const lip=p(17);ellipse({x:lip.x,y:lip.y-fw*.009},fw*.04,fw*.004,0,'#fff2e4',G.opacity*.16,'screen');}ctx.restore();
 if(id==='glow'){ellipse(p(6),fw*.016,fw*.085,0,'#ffffff',G.opacity*.19,'screen');ellipse({x:p(10).x,y:p(10).y+fw*.07},fw*.09,fw*.026,0,'#ffffff',G.opacity*.12,'screen');}
 (analysis.widest===3?[172,397]:analysis.widest===1?[103,332]:[234,454]).forEach(i=>{const q=p(i),out=Math.sign(q.x-p(1).x)||1;ellipse({x:q.x-out*fw*.03,y:q.y+fw*.025},fw*.032,fw*.1,out*.25,'#735143',strengthParameters(s.contour??s.blush).opacity*.1,'multiply');});
 if(s.freckles&&!['graphic','gem'].includes(id)&&(s.freckleIntensity??.6)>0){
  const amount=Math.max(0,Math.min(1,s.freckleIntensity??.6));ctx.save();ctx.globalCompositeOperation='multiply';ctx.fillStyle=analysis.depth>=4?'#623a27':'#8b563d';
  frecklePoints(s.frecklePattern??0).forEach(({u,v,size,weight},k)=>{const q=paintBandPoint(u,v,protection,point),radius=fw*size*(.8+amount*.4);if(!clearOfEyes(q,radius,protection,point,fw))return;ctx.globalAlpha=amount*.72*weight;ctx.beginPath();ctx.ellipse(q.x,q.y,radius,radius*(.75+(k%3)*.12),k*.7,0,Math.PI*2);ctx.fill();});ctx.restore();
 }
 if(id==='graphic'&&s.atlas)drawHalloweenPaint(ctx,s.atlas,protection,point,s.variant??0,s.art??.6);
 ctx.restore(); // eye-opening exclusion
 ctx.restore();
}
