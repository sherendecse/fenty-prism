import type { NormalizedLandmark } from '@mediapipe/face_mesh';

export type Analysis = { code: string; shape: string; features: string[]; ratio: number; foreheadJaw: number; chin: number; widest: number; eyeRatio: number; source: 'camera' | 'sample'; depth: number; undertone: string; skinRgb?: number[]; corrected?: boolean; chinAngle?:number; jawAngle?:number };
export const labels = [['尖下巴','方下巴','圆下巴'],['额头最宽','颧骨最宽','下颌角最宽'],['脸长大于脸宽','脸长与脸宽近似相等','脸长小于脸宽'],['额头与下颌近似等宽','额头较窄','额头较宽']];
export function classify(code: string) {
  const [a,b,c,d] = code.split('').map(Number);
  // The supplied square/diamond additions conflict with their own widest-zone
  // definitions. They are deliberately excluded from exact lookup rules.
  if ((b===1 && d===2) || (b===3 && d===3)) return '混合轮廓（测量需复核）';
  if (b===3 || d===2) return '偏梨形脸';
  if (b===1 && d===3) return a===2?'上宽下窄轮廓，方下巴':'偏心形 / 椭圆脸';
  if (a===1 && (b===1 || d===3)) return '偏心形脸';
  if (b===2 && (a===1 || d===3)) return '偏菱形脸';
  if (a===2 && d===1) return c===1 ? '偏长方脸' : '偏方脸';
  if (a===3 && c!==1) return '偏圆脸';
  return '偏椭圆脸 / 混合轮廓';
}
export function measure(l: NormalizedLandmark[], w: number, h: number): Omit<Analysis,'source'|'depth'|'undertone'> {
  const p=(i:number)=>({x:l[i].x*w,y:l[i].y*h});
  const dist=(i:number,j:number)=>Math.hypot(p(i).x-p(j).x,p(i).y-p(j).y);
  const forehead=dist(103,332), cheek=dist(234,454), jaw=dist(172,397);
  const width=Math.max(forehead,cheek,jaw), ratio=dist(10,152)/width;
  const fj=forehead/jaw;
  const angle=(a:number,b:number,c:number)=>{const x=p(a),y=p(b),z=p(c),ux=x.x-y.x,uy=x.y-y.y,vx=z.x-y.x,vy=z.y-y.y;return Math.acos(Math.max(-1,Math.min(1,(ux*vx+uy*vy)/Math.max(.0001,Math.hypot(ux,uy)*Math.hypot(vx,vy)))))*180/Math.PI;};
  const bend=(outer:number,corner:number,next:number)=>dist(corner,next)>width*.02&&dist(corner,next)<width*.5&&dist(next,152)<dist(corner,152)?angle(outer,corner,next):angle(outer,corner,152);
  const chinAngle=angle(148,152,377),jawAngle=(bend(234,172,136)+bend(454,397,365))/2;
  const chinWidth=dist(176,400)/jaw;
  const chin=chinAngle<125&&chinWidth<.55?1:chinWidth>.55&&jawAngle<145&&chinAngle>145?2:3;
  const widest=[forehead,cheek,jaw].indexOf(width)+1;
  const c=ratio>1.05?1:ratio<0.95?3:2;
  const d=fj>1.05?3:fj<0.95?2:1;
  const code=`${chin}${widest}${c}${d}`;
  const eyeRatio=(dist(33,133)+dist(362,263))/(2*width);
  return {chinAngle,jawAngle,code,shape:widest===2&&cheek<Math.max(forehead,jaw)*1.08?(chin===2?(c===1?'偏长方脸':'偏方脸'):c!==1?'偏圆脸':'偏椭圆脸 / 混合轮廓'):classify(code),features:[labels[0][chin-1],labels[1][widest-1],eyeRatio>.21?'眼部横向比例较突出':'眼部比例柔和'],ratio,foreheadJaw:fj,chin,widest,eyeRatio};
}
export const sample: Analysis={code:'3223',shape:classify('3223'),features:['圆下巴','颧骨较突出','眼部比例柔和'],ratio:1.02,foreheadJaw:1.12,chin:3,widest:2,eyeRatio:.19,source:'sample',depth:1,undertone:'中性'};
export const looks = [
  {id:'spring',category:'春季',scene:'春日 / 约会',name:'春日水光腮红',color:'#ec786d',lip:'#bb6867',eye:'#ad6a59',blush:'Fu$$y',tip:'将珊瑚腮红薄拍在颧骨区域，让光泽与红润成为重点。'},
  {id:'summer',category:'夏季',scene:'旅行 / 海边',name:'清透水光妆',color:'#eb9d7c',lip:'#b67461',eye:'#a68261',blush:'Fenty Glow',tip:'底妆少量分区叠加，保留肌肤纹理，高光只点在颧骨上缘。'},
  {id:'chrome',category:'Party',scene:'金属 / 派对',name:'Chrome 金属妆',color:'#b4bbd3',lip:'#a67a83',eye:'#939caf',blush:'Fu$$y',tip:'银灰眼影集中在眼皮中央，边缘轻晕染；唇色保持柔和。'},
  {id:'autumn',category:'秋季',scene:'通勤 / 日常',name:'裸棕红棕妆',color:'#aa755d',lip:'#905644',eye:'#825f48',blush:'Fenty Glow',tip:'用浅棕铺眼窝、红棕点眼尾，奶茶唇色与柔和腮红呼应。'},
  {id:'shadow',category:'个性表达',scene:'Anti-Blush',name:'阴影腮红妆',color:'#937b70',lip:'#9a7466',eye:'#78675d',blush:'Fenty Glow',tip:'减少明亮腮红，轻扫低饱和棕调在颧骨下缘，避免大片深色。'},
  {id:'winter',category:'冬季',scene:'春节',name:'新中式红运妆',color:'#c34046',lip:'#b12839',eye:'#8b4b46',blush:'Cherry Amor',tip:'红唇作为重点，眼线贴近睫毛根部；红调腮红由少量开始。'},
  {id:'red',category:'圣诞 / 约会',scene:'晚宴',name:'Glam Red 苹果妆',color:'#d05262',lip:'#b23846',eye:'#9d645a',blush:'Cherry Amor',tip:'颧骨红润与红唇呼应，晚宴时可提高眼尾和唇部对比。'},
  {id:'graphic',category:'节日',scene:'Halloween',name:'Halloween 南瓜彩绘妆',color:'#d49356',lip:'#ae3437',eye:'#c78343',blush:'Fu$$y',tip:'先用轻薄底妆打底，再在颧骨与鼻梁点画南瓜、蝙蝠或细小雀斑；不要覆盖眼睛。'},
  {id:'gem',category:'场景',scene:'音乐节',name:'Gem 宝石妆',color:'#b4a2de',lip:'#c97a9e',eye:'#a098d3',blush:'Fu$$y',tip:'眼尾用少量宝石点缀，搭配冰蓝紫粉眼影；预览为贴钻位置模拟，实际贴钻需手工完成。'},
  {id:'sport',category:'运动 / 户外',scene:'轻运动',name:'Sweat-proof Glow',color:'#d99471',lip:'#ab6c55',eye:'#a67e5d',blush:'Fenty Glow',tip:'底妆薄拍，定妆集中在易出油处。防汗效果由产品和上妆决定。'},
  {id:'color',category:'Fenty 方向',scene:'大胆表达',name:'Maximalist Color',color:'#d9659a',lip:'#bc4482',eye:'#835cbc',blush:'Fuchsia Flex',tip:'选择一个主色贯穿眼妆和唇妆，逐步增加饱和度。'},
  {id:'glow',category:'Glow',scene:'光泽焦点',name:'Glow Everything',color:'#d7b36f',lip:'#b87860',eye:'#b49258',blush:'Fenty Glow',tip:'额头、鼻梁、颧骨分区点亮，避免整脸铺满高光。'},
  {id:'inclusive',category:'Inclusivity',scene:'不同肤色',name:'你的本色妆',color:'#b28473',lip:'#9d695a',eye:'#927158',blush:'Fenty Glow',tip:'保留肤色本身的层次，按个人底色选择唇色，不用美白滤镜。'},
];
export function advice(a:Analysis) {
  const contour=a.widest===3?'下颌角外缘轻扫修容，向耳前晕开，避开下巴中央。':a.widest===2?'颧骨外侧少量修容，向发际线晕开，避免把颧骨中央涂暗。':'额头两侧少量修容，中央保留亮度，下巴只做轻微过渡。';
  const blush=a.ratio>1.05?'腮红放在颧骨区域，与眼袋保持空隙，偏横向柔和晕染，平衡纵向比例。':'腮红放在颧骨区域，与眼袋保持空隙，沿眼尾方向轻提拉，避开鼻翼。';
  return {highlight:`${a.features.join('、')}，可以成为妆容的视觉重点。`,balance:contour,blush,eyes:a.eyeRatio>.21?'眼部横向比例突出，眼线贴根描绘即可，避免过厚眼影遮盖。':'用浅色提亮眼皮中央，眼尾柔和加深；不根据普通镜头判定单双眼皮。'};
}
export const foundationShades=[100,110,120,125,130,140,150,160,170,175,185,190,200,210,220,225,230,235,240,250,260,265,280,290,295,300,310,315,330,335,345,350,360,370,385,390,400,410,420,425,430,440,445,450,470,480,485,490,495,498];
export function candidates(a:Analysis) {
  // Depth buckets are starting ranges, never a calibrated shade prediction.
  return [[100,110,120,125,130,140,150],[160,170,175,185,190,200,210,220],[225,230,235,240,250,260,265,280,290],[295,300,310,315,330,335,345,350,360,370],[385,390,400,410,420,425,430,440,445],[450,470,480,485,490,495,498]][a.depth] || [];
}
