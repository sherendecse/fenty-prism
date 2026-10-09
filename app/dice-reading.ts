const left=[
 ['一号骰子今天只想抓一个重点，像赶早八时只找到一支口红：少一点分心，反而更有记忆点。','Die one wants a single focal point, like finding only one lipstick before an early class: fewer distractions make a stronger impression.'],
 ['二号骰子是个搭配搭子，眼妆和唇妆不用抢麦，互相接一句，整套妆就顺了。','Die two is a styling partner: eyes and lips can take turns speaking instead of fighting for the microphone.'],
 ['三号骰子说“底妆、气色、重点”三位到齐就开工，不用把化妆台搬到脸上。','Die three calls roll for skin, a flush and one accent: you do not need your whole vanity on your face.'],
 ['四号骰子像一个稳稳的小方桌，把颜色、轮廓、质感和留白四条腿摆平，妆容就不晃。','Die four is a little steady table: color, contour, texture and breathing room make its four balanced legs.'],
 ['五号骰子自带一点小叛逆：保留熟悉的步骤，再偷偷塞进一个新细节，镜子会先发现。','Die five sneaks in a little rebellion: keep familiar steps and slip in one fresh detail your mirror will notice first.'],
 ['六号骰子像准时下班的化妆师：重点都交代清楚，然后收笔，漂亮也不用无限加班。','Die six is a makeup artist who finishes on time: make your accents clear, then stop; beauty does not need endless overtime.'],
];
const right=[
 ['另一颗落在一，给重点发了张“独家出场券”：让眼睛或嘴唇做主角，其他地方温柔配合。','The other die shows one and issues a solo stage pass: let eyes or lips lead, with softer support elsewhere.'],
 ['另一颗落在二，建议深浅两个层次轮流上场：一个负责显色，一个负责把边缘晕开。','The other die shows two: one layer brings color, another softens the edge.'],
 ['另一颗落在三，像调了三档音量：中心有颜色、边缘有过渡、面中有留白，刚好不吵。','The other die shows three volume levels: visible color, soft transitions and breathing room, without the noise.'],
 ['另一颗落在四，开启“四平八稳但不无聊”模式：对称地安排重点，让细节赢过厚重。','The other die shows four: balanced without being boring, with symmetric accents and detail rather than heaviness.'],
 ['另一颗落在五，批准一点点惊喜加戏：用一个新色或光泽变化，给日常妆写个小反转。','The other die shows five and approves a surprise cameo: a fresh shade or finish gives the routine a little plot twist.'],
 ['另一颗落在六，提醒你最后照一眼整体：哪个区域已经够亮就别再加，给妆容一个漂亮收尾。','The other die shows six and asks for one last check: stop adding where it already shines, and finish cleanly.'],
];
export function diceReading(a:number,b:number){const l=left[Math.max(1,Math.min(6,a))-1],r=right[Math.max(1,Math.min(6,b))-1];return {interpretation:l[0]+r[0]+'这只是趣味妆容灵感，具体妆容仍结合本次选择匹配。',interpretationEn:l[1]+' '+r[1]+' This is playful inspiration; the actual look follows your choices.'};}
