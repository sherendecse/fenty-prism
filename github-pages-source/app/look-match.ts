import {Analysis,looks} from './face-engine';
export const seasons=[{id:'spring',name:'春季',note:'轻盈、红润、柔和色调'},{id:'summer',name:'夏季',note:'清透、明亮、轻薄底妆'},{id:'autumn',name:'秋季',note:'低饱和、暖棕、柔雾质感'},{id:'winter',name:'冬季',note:'清晰轮廓、红调、节日氛围'},{id:'surprise',name:'盲盒惊喜',note:''}];
export const occasions=[{id:'daily',name:'日常 / 上课',note:'舒适自然，步骤简洁'},{id:'work',name:'通勤 / 工作',note:'低饱和、清晰而克制'},{id:'date',name:'约会',note:'柔和、红润，近距离自然'},{id:'beach',name:'旅行 / 海边',note:'轻薄、清透，适合日间'},{id:'sport',name:'运动 / 户外',note:'防水底妆，减少厚重叠加'},{id:'party',name:'派对 / 夜间',note:'强调眼妆与色彩对比'},{id:'dinner',name:'晚宴 / 圣诞',note:'精致轮廓与唇部焦点'},{id:'newyear',name:'春节',note:'红调重点与节日气氛'},{id:'halloween',name:'万圣节',note:'图形眼线与创意表达'},{id:'festival',name:'音乐节',note:'闪光与宝石点缀'}];
export function matchLook(season:string,occasion:string,a:Analysis){
 const score=Object.fromEntries(looks.map(l=>[l.id,0]));
 const add=(values:Record<string,number>)=>{for(const [k,v] of Object.entries(values))score[k]+=v;};
 const seasonScore:Record<string,Record<string,number>>={spring:{spring:10,summer:3},summer:{summer:10,sport:3},autumn:{autumn:10,shadow:4},winter:{winter:8,red:5},natural:{inclusive:10,autumn:4},bold:{color:13,chrome:4},glow:{glow:12,summer:4}};
 const sceneScore:Record<string,Record<string,number>>={daily:{inclusive:6,spring:4,autumn:6},work:{autumn:12,shadow:5},date:{spring:8,red:5,glow:4},beach:{summer:18},sport:{sport:30},party:{chrome:15,color:10},dinner:{red:18,glow:7},newyear:{winter:30},halloween:{graphic:30},festival:{gem:30}};
 add(seasonScore[season]||seasonScore.natural);add(sceneScore[occasion]||sceneScore.daily);
 if(a.widest===2)add({spring:3,summer:2,inclusive:2});
 if(a.widest===3)add({autumn:3,shadow:2});
 if(a.chin===1)add({chrome:2,glow:2});
 if(a.ratio>1.05)add({spring:2,red:1});
 const id=looks.reduce((best,l)=>score[l.id]>score[best]?l.id:best,looks[0].id);
 const look=looks.find(l=>l.id===id)!;
 const seasonName=seasons.find(x=>x.id===season)?.name||'自然风格',sceneName=occasions.find(x=>x.id===occasion)?.name||'日常';
 const faceReason=a.widest===2?'颧骨轮廓突出，腮红放在颧骨上缘并向外晕染':a.widest===3?'下颌轮廓突出，修容集中在下颌外侧，保留面中亮度':'额头轮廓较宽，以轻修容平衡两侧，突出眼唇重点';
 return {id,reason:`你选择了${seasonName}与${sceneName}，因此推荐${look.name}。${faceReason}；${a.ratio>1.05?'腮红略横向铺开，平衡脸部纵向比例。':'腮红沿眼尾轻提拉，保持轮廓留白。'}`};
}
