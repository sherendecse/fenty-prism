// 101 fixed fictional readings, formed from an opening scene and a distinct creative direction.
const scenes=[
 ['晨光','Morning light','晨光轻落小窗前','心事舒开一寸天','晨光签提醒你：今天的亮点可以从一个小细节开始，不必把整张脸都画满。','Morning light suggests a small detail can lead the whole look; you do not need color everywhere.'],
 ['微风','A gentle breeze','微风轻叩旧门扉','眉眼不妨借风飞','微风签邀请你松开惯常的上妆方式，换一个眼尾方向或唇色，就能看到新的表情。','A breeze invites a new eye shape or lip color to loosen your usual routine.'],
 ['花影','Flower shadows','花影摇来一段春','一抹新色照精神','花影签把重点放在气色：让颧骨与唇部互相呼应，像花瓣映到脸上，轻盈却看得见。','Flower shadows focus on a visible flush: let cheeks and lips echo one another like petals.'],
 ['月色','Moonlight','月色轻停眉眼间','留白也能照夜阑','月色签适合做减法：把一个区域画得清楚，其他区域柔和下来，反而更有记忆点。','Moonlight favors one clear focal point with softness around it, making less feel memorable.'],
 ['远山','Distant mountains','远山含黛入新妆','深浅相依自有章','远山签讲究层次：同一色系用深浅变化来塑造轮廓，比一味加重颜色更有立体感。','Distant mountains suggest building depth with lighter and darker shades rather than simply more pigment.'],
 ['星火','A little spark','星火微微照衣襟','敢将新色写初心','星火签留给一点勇气：选一个平时少用的重点色，先小范围尝试，让新鲜感慢慢展开。','A spark invites a less familiar accent, first in a small area, then as far as you feel like exploring.'],
 ['晴雨','Sun after rain','雨后晴光过小桥','眉间一色也逍遥','晴雨签不要求完美状态：保留真实肌肤纹理，用清晰色彩把注意力带到你想表达的地方。','Sun after rain welcomes real skin texture and a clear color accent that directs attention.'],
 ['潮声','The tide','潮声轻送一帆风','不必循回昨日踪','潮声签鼓励换个节奏：今天的妆不必复制昨天，改变重点的位置就能改写整体氛围。','The tide encourages a different rhythm: changing where the focus sits can change the whole mood.'],
 ['晚霞','Evening glow','晚霞偷染半边天','颜色轻铺也醒鲜','晚霞签强调暖感与过渡：边缘要柔，中心要有颜色，让光泽与显色同时存在。','Evening glow asks for soft edges and visible color at the center, balancing glow with pigment.'],
 ['清茶','A quiet tea','清茶一盏伴新颜','从容自有好眉弯','清茶签适合把熟悉的技巧做得更细：晕染多一点耐心，轮廓少一点硬边，妆感便更完整。','Quiet tea invites careful blending and softer boundaries to refine familiar techniques.'],
 ['新页','A new page','新页初开映日长','由你落笔写新妆','新页签给今天留一个新起点：不用急着定义自己的风格，一次尝试就是一页新的自己。','A new page leaves space to explore: you do not need a fixed style before trying something new.'],
];
const directions=[
 ['轻点双颊映朝霞','笑时自有好芳华','把视觉重点放在颧骨上缘，腮红由内向外轻晕，别让边界抢走表情。','Let the upper cheekbones lead, blending blush outward without a hard edge.'],
 ['眼尾轻收一线光','留得三分意更长','用眼尾的一点深色拉出层次，眼头保持干净；少量对比就能让眼神更清晰。','Add depth at the outer corner and keep the inner corner clean for a clearer gaze.'],
 ['唇间一抹添新意','眉目舒舒便是诗','让唇部成为主角，眼妆降低一点饱和度；不用每个区域都争当主角。','Let lips be the focal point, with slightly quieter eye colors.'],
 ['薄铺颜色留肌理','自在风华不必藏','采用薄涂叠加：先看到颜色，再决定要不要加深，保留皮肤原本的纹理。','Build color in thin layers and keep the underlying skin texture visible.'],
 ['明暗相随成一画','一处清晰便生花','试试主次分明：一个位置清晰显色，另一个位置用柔和过渡来衔接。','Make one area clearly colored and connect it with softer transitions elsewhere.'],
 ['把光轻借鼻梁侧','不向满面问星河','高光只放在小范围，留给腮红与眼唇足够空间，让光泽成为点缀。','Keep highlight localized so cheeks, eyes and lips have room to show their color.'],
 ['新色不妨先轻试','镜中另一面初知','第一次尝试新颜色，先用小面积眼影或薄唇色；喜欢后再逐层加深。','Explore unfamiliar color on a small eye area or as a sheer lip layer, then build if you like it.'],
 ['晕开边界添余味','浓淡之间见心意','给晕染多留几秒：把腮红与眼影边缘散开，颜色可以鲜明，轮廓依然柔和。','Spend a few extra seconds blending the edges; vivid color can still have a soft outline.'],
 ['旧法新描添趣味','一点不同亦成章','保留一个熟悉技巧，再改变一个重点，既有安全感，也有打开盲盒的新鲜感。','Keep one familiar technique and change one accent for comfort with a little surprise.'],
 ['眉目留白风自来','从容一笑便花开','不要把所有空白都填满，留出面中的呼吸感，妆容重点才会更突出。','Leave space around the focal point so the makeup has room to breathe.'],
];
const verseEn=['Let cheeks borrow the morning’s warm glow.','A little shadow lets the outer eye show.','Let one clear lip color lead the way.','Thin layers leave room for real skin today.','One vivid detail makes a softer frame.','A little highlight lends a quiet flame.','Try an unfamiliar shade in a small space.','Blend the edges, let soft color embrace.','Keep a familiar stroke, add one new part.','A little breathing room is its own art.'];
export function lotReading(number:number){
 const n=Math.max(1,Math.min(101,Math.floor(number))),scene=scenes[Math.floor((n-1)/10)],direction=directions[(n-1)%10];
 return {title:scene[0],titleEn:scene[1],poem:[scene[2],direction[0],scene[3],direction[1]].join('。\n')+'。',poemEn:`${scene[1]} opens a little space.\n${verseEn[(n-1)%10]}\nSoftness gives your colors room.\nA different side begins to bloom.`,interpretation:scene[4]+direction[2],interpretationEn:scene[5]+' '+direction[3]};
}
