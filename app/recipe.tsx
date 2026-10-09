"use client";
import {freckleStyles} from './freckle-patterns';
import {Translated} from './i18n';
import {Analysis,advice,candidates,looks} from './face-engine';

export const fluidShades='106N 116C 126N 136N 146N 156C 166N 176C 186N 196N 206W 216N 226W 236N 246N 256W 266C 276N 286W 296N 306N 316N 326N 336N 346N 356W 366N 376N 386W 396N 406N 416W 426W 436N 446N 456W 466W 476N 486W 496W 506W 516W 526N 536W 546N 556N 566N 576W 586W 596N'.split(' ');
const root='https://fentybeauty.com';
export function recommendFoundation(a:Analysis,finish:'glow'|'matte'){
 const groups=[[0,7],[7,15],[15,24],[24,33],[33,42],[42,50]];
 const [start,end]=groups[a.depth]||groups[2];
 const rows=finish==='matte'?fluidShades.slice(start,end):candidates(a).map(String);
 const suffix=a.undertone==='冷'?'C':a.undertone==='暖'?'W':a.undertone==='中性'?'N':null;
 const filtered=finish==='matte'&&suffix?rows.filter(s=>s.endsWith(suffix)):rows;
 const available=filtered.length?filtered:rows;
 // This ranks a single initial try-on candidate within the confirmed depth
 // range. Uncalibrated RGB is not an official colourimetric shade match.
 const lum=a.skinRgb?.length===3?a.skinRgb[0]*.2126+a.skinRgb[1]*.7152+a.skinRgb[2]*.0722:null;
 const bounds=[[245,195],[195,170],[170,140],[140,110],[110,80],[80,30]][a.depth]||[170,140];
 const position=lum===null?.5:Math.max(0,Math.min(1,(bounds[0]-lum)/(bounds[0]-bounds[1])));
 const primary=available[Math.round(position*(available.length-1))];
 const primaryIndex=rows.indexOf(primary),alternate=rows[primaryIndex+1]||rows[primaryIndex-1];
 return {primary,alternate,undertoneCovered:finish!=='matte'||!suffix||filtered.length>0};
}

// Official shade names. One palette supplies both product cards and tutorial.
export function lookProductPalette(id:string,a:Analysis,family?:string){
 const red=family?family==='red':['winter','red','graphic'].includes(id);
 const pink=family?['rose','silver','purple'].includes(family):['spring','chrome','gem'].includes(id);
 const lip=red?'The MVP':(family?family==='purple':id==='color')?'Fuchsia Flex':pink?(a.depth>=4?'RiRi':'Fu$$y'):a.depth>=4?'Hot Chocolit':'Fenty Glow';
 const lipSlug=({'Fu$$y':'fuy','RiRi':'riri-1','Fuchsia Flex':'fuchsia-flex','Hot Chocolit':'hot-chocolit','Fenty Glow':'fenty-glow'} as Record<string,string>)[lip]||'the-mvp';
 const blush=red?'Daiquiri Dip':(family?family==='purple':id==='color')?'Drama Cla$$':(family?family==='brown':['autumn','shadow','inclusive'].includes(id))?'Rosé Latte':pink?(a.depth>=4?'Summertime Wine':'Petal Poppin'):'Peach Face';
 const blushSlug=({'Daiquiri Dip':'daiquiri-dip','Drama Cla$$':'drama-cla','Rosé Latte':'rose-latte','Summertime Wine':'summertime-wine','Petal Poppin':'petal-poppin','Peach Face':'peach-face'} as Record<string,string>)[blush];
 const eye=(family?family==='silver':id==='chrome')?'Shroom Mate':(family?family==='gold':id==='glow')?'Gold Hoopz':(family?family==='coral':id==='graphic')?'Cumin Get It':'Get On Taupe';
 const eyeSlug=({'Shroom Mate':'shroom-mate','Gold Hoopz':'gold-hoopz','Cumin Get It':'cumin-get-it','Get On Taupe':'get-on-taupe'} as Record<string,string>)[eye];
 const extra=(family?['blue','purple'].includes(family):['gem','color'].includes(id))?'此清单覆盖底妆、腮红、唇妆与眼妆打底；蓝紫装饰色与贴钻尚无已核实的对应 Fenty Beauty色号，不以棕色代替。':id==='graphic'?'南瓜与蝙蝠彩绘还需要适用于面部的橘黑彩绘用品；本清单不将眼线液当作全脸彩绘颜料。':'';
 return {red,lip,lipSlug,blush,blushSlug,eye,eyeSlug,extra};
}
export function ProductRecipe({analysis:a,lookId,finish,onFinish,colorFamily,freckles=false,frecklePattern=0,freckleIntensity=60}:{analysis:Analysis;lookId:string;finish:'glow'|'matte';onFinish:(f:'glow'|'matte')=>void;colorFamily?:string;freckles?:boolean;frecklePattern?:number;freckleIntensity?:number}) {
 const l=looks.find(x=>x.id===lookId)||looks[0];
 const match=recommendFoundation(a,finish);
 const contour=['Amber','Amber Suede','Mocha','Truffle','Espresso','Caviar'][a.depth];
 const palette=lookProductPalette(lookId,a,colorFamily);
 const showFreckles=freckles&&!['graphic','gem'].includes(lookId);
 const freckleShade=['Mocha','Mocha','Truffle','Espresso','Espresso','Caviar'][a.depth]||'Mocha';
 const frecklePlacement=['沿双颊与鼻梁横向点画，保留不规则空隙。','集中在两侧脸颊，鼻梁只留少量点。','集中在鼻梁和鼻翼上方，向两侧逐渐减少。','在双颊与鼻梁疏密错落地点画，避免左右完全对称。'][frecklePattern]||'沿双颊与鼻梁横向点画，保留不规则空隙。';
 const lip=palette.lip;
 const blush=palette.blush;
 const eye=palette.eye;
 const foundation=finish==='matte'?"Pro Filt’r Fluid Flex Natural Matte Longwear Foundation":"Soft’lit Naturally Luminous Longwear Foundation";
 const products=[
  {role:'01 / 粉底',name:foundation,shade:`建议先试 #${match.primary}`,url:finish==='matte'?root+'/products/pro-filtr-fluid-flex-natural-matte-longwear-foundation-'+match.primary.toLowerCase():root+'/products/softlit-naturally-luminous-longwear-foundation-'+match.primary,why:finish==='matte'?'自然哑光、轻盈可叠加遮瑕。品牌宣称防水、抵抗汗湿与转移，持妆最长 12 小时，适合运动或偏好柔雾妆效。':'自然水光、中等遮瑕，适合偏好透亮底妆或中性至干性肤质。颧骨光泽与春日、清透妆容呼应。',note:'依据镜头采样和你确认的肤色深浅给出的初步试色推荐。'},
  {role:'02 / 修容',name:'Match Stix Contour Skinstick',shade:contour,url:root+'/products/match-stix-contour-skinstick-'+contour.toLowerCase().replaceAll(' ','-'),why:advice(a).balance,note:'少量分次叠加，避免画出过深边界。'},
  {role:'03 / 唇蜜',name:palette.red?'Fenty Icon Velvet Liquid Lipstick':'Gloss Bomb Universal Lip Luminizer',shade:lip,url:root+'/products/'+(palette.red?'fenty-icon-velvet-liquid-lipstick-the-mvp':'gloss-bomb-universal-lip-luminizer-'+palette.lipSlug),why:'按肤色深浅、底色和妆容氛围选择光泽唇色，让唇部与眼妆自然呼应。',note:'原生唇色会影响显色，先薄涂一层。'},
  {role:'04 / 腮红',name:'Cheeks Out Freestyle Cream Blush',shade:blush,url:root+'/products/cheeks-out-freestyle-cream-blush-'+palette.blushSlug,why:l.tip,note:'与下方腮红步骤使用同一色号。'},
  {role:'05 / 眼影',name:'Shadowstix Longwear Eyeshadow Stick',shade:eye,url:root+'/products/shadowstix-longwear-eyeshadow-stick-'+palette.eyeSlug,why:'薄铺眼皮，边缘晕开；按妆效叠加中央或眼尾。',note:'与下方眼妆步骤使用同一色号。'},
  {role:'06 / 眼线',name:'Flyliner Longwear Liquid Eyeliner',shade:"Cuz I’m Black",url:root+'/products/flyliner-longwear-liquid-eyeliner-cuz-im-black',why:'沿睫毛根部细描，保留眼皮颜色。',note:'彩绘只用适用于对应部位的产品，勿画入眼内。'},
  {role:'07 / 高光',name:'Diamond Bomb All-Over Diamond Veil',shade:'How Many Carats?!',url:root+'/products/diamond-bomb-all-over-diamond-veil-how-many-carats',why:'局部闪光适合 Chrome、音乐节和 Glow 妆容。轻点颧骨上缘，保留面中的自然质感。',note:'弱妆效可以省略。'},
 ];
 if(showFreckles)products.push({role:'08 / 雀斑点画',name:'Match Stix Contour Skinstick',shade:freckleShade,url:root+'/products/match-stix-contour-skinstick-'+freckleShade.toLowerCase(),why:'用细尖化妆刷蘸取少量膏体，点出大小不一的棕色雀斑；先在脸颊试色，再轻拍柔化。',note:'这里作为雀斑点画的搭配建议；可与修容共用产品，无需重复购买。'});
 if(lookId==='chrome')products.splice(5,0,{role:'05 / 眼部闪光',name:'Shadowstix Diamonds Diamond Veil Eyeshadow Stick',shade:'How Many Carats?!',url:root+'/products/shadowstix-diamonds-diamond-veil-eyeshadow-stick-how-many-carats',why:'叠加在灰调眼妆中央，形成银白闪光焦点。',note:'眼部使用眼影产品，不用面部高光替代。'});
 return <Translated><div className="recipe"><p className="kicker">你的 Fenty Beauty产品清单</p><h2>把妆容，带回日常。</h2><p className="recipe-intro">{l.name} · {a.shape} · {a.undertone==='待确认'?'底色未确认':`${a.undertone}底色`}</p>
  <div className="finish-cards"><button aria-pressed={finish==='glow'} onClick={()=>onFinish('glow')}><b>水光底妆</b><span>Soft’lit · 自然透亮</span><p>适合春日、约会和清透妆容；保留肌肤光泽。</p></button><button aria-pressed={finish==='matte'} onClick={()=>onFinish('matte')}><b>哑光 / 运动底妆</b><span>Fluid Flex · 自然柔雾</span><p>适合通勤与运动；选择防水、抗汗湿的底妆配方。</p></button></div>
  <div className="shade-summary"><span>为你优先推荐</span><strong>#{match.primary}</strong><p>这是一个初步试色起点，请在自然光下沿下颌试色，确认与颈部衔接。</p><details><summary>如果试色略有深浅差异</summary><p>可同时对比附近色号 #{match.alternate}。{a.undertone==='橄榄'?'橄榄底色需要特别检查是否偏粉或偏橙。':''}{!match.undertoneCovered?'当前深浅范围内没有相应底色后缀，建议使用品牌适色服务复核。':''}</p></details></div>
  <div className="recipe-grid">{products.map(p=><article key={p.role}><small>{p.role}</small><h4>{p.name}</h4><p className="recipe-shade">{p.shade}</p><p>{p.why}</p><span>{p.note}</span><a href={p.url} target="_blank" rel="noreferrer">查看品牌产品资料</a></article>)}</div>
  {palette.extra&&<p className="source-note">{palette.extra}</p>}
  <p className="source-note">产品资料来自品牌官网，中国在售情况以当地官方渠道为准。镜头与屏幕存在色差，试妆预览不能代替实物试色。</p>
  <h3>分区妆教 · {l.name}</h3><ol className="tutorial"><li><b>底妆 · #{match.primary}</b>沿下颌试色，确认与颈部衔接。面中薄拍，再局部叠加。</li><li><b>轮廓 · {contour}</b>{advice(a).balance}</li><li><b>腮红 · {blush}</b>放在颧骨区域，与眼袋保持空隙，向眼尾方向柔和晕染，避开鼻翼。{l.tip}</li><li><b>眼妆 · {eye}{lookId==='chrome'?' + How Many Carats?!':''}</b>{advice(a).eyes} {l.tip}</li><li><b>高光 · How Many Carats?!</b>少量点在颧骨上缘，与腮红叠加，弱妆效可省略。</li><li><b>唇妆与定妆 · {lip}</b>弱：薄涂点拍；中：完整铺色；强：提高唇色和眼尾对比。运动场景按产品说明定妆。</li>{showFreckles&&<li><b>雀斑 · {freckleStyles[frecklePattern]?.name||freckleStyles[0].name} · {freckleShade}</b>{frecklePlacement}用细尖化妆刷轻蘸膏体，先试画几颗小点，再用指腹轻拍边缘。<p>当前雀斑强度：{freckleIntensity}%。{freckleIntensity<=35?'少量浅点，保留更多肌肤空白。':freckleIntensity>=75?'增加点数与深浅对比，仍保留不规则间距。':'逐步增加点数，混合浅点与深点。'}最后轻压定妆，避免来回擦掉雀斑。</p></li>}</ol>
 </div></Translated>;
}
