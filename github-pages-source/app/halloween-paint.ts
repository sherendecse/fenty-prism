import {eyeRegions,clearOfEyes} from './face-placement';
import type {NormalizedLandmark} from '@mediapipe/face_mesh';
export const halloweenStyles=[
 {name:'南瓜夜游',note:'南瓜、蝙蝠与酒红鼻梁彩绘'},
 {name:'柔粉南瓜',note:'微小南瓜与柔粉雀斑'},
 {name:'橘调蝙蝠',note:'橘色重点与细小蝙蝠群'},
 {name:'星夜南瓜',note:'南瓜、鼻梁蝙蝠与金色星点'},
];
type Point={x:number;y:number};
// Warp a paint texture as a curved cheek / nose grid; coordinates move with landmarks.
export function paintBandPoint(u:number,v:number,l:NormalizedLandmark[],point:(p:NormalizedLandmark)=>Point){
 const left=point(l[234]),right=point(l[454]),fw=Math.hypot(right.x-left.x,right.y-left.y),length=fw||1;
 let axis={x:(right.x-left.x)/length,y:(right.y-left.y)/length};if(axis.x<0)axis={x:-axis.x,y:-axis.y};
 let down={x:-axis.y,y:axis.x};if(down.y<0)down={x:-down.x,y:-down.y};
 const bridge=point(l[6]),tip=point(l[1]);
 const nose={x:bridge.x*.78+tip.x*.22,y:bridge.y*.78+tip.y*.22};
 const lowerLid=Math.max(...eyeRegions.map(eye=>{const low=point(l[eye.lower]);return low.x*down.x+low.y*down.y;}));
 const clearance=lowerLid+fw*.035,halfHeight=fw*.07;
 const belowEyes=(p:Point,noseLift=0)=>{const move=Math.max(0,clearance+halfHeight-noseLift-(p.x*down.x+p.y*down.y));return {x:p.x+down.x*move,y:p.y+down.y*move};};
 const malarLeft=belowEyes(point(l[116])),malarRight=belowEyes(point(l[345]));
 // Texture endpoints stop at the malar cheekbones, away from temples and ears.
 const between=(a:Point,b:Point)=>({x:a.x*.5+b.x*.5,y:a.y*.5+b.y*.5});
 const bridgeAnchor=belowEyes(nose,fw*.045);
 const raw=[malarLeft,between(malarLeft,bridgeAnchor),bridgeAnchor,between(bridgeAnchor,malarRight),malarRight];
 if(left.x>right.x)raw.reverse();
 // Both coordinates interpolate through the same cheek/nose anchors, including head roll.
 const index=Math.min(3,Math.floor(Math.max(0,Math.min(1,u))*4)),t=Math.max(0,Math.min(1,u))*4-index,a=raw[index],b=raw[index+1];
 // A smooth cheekbone-to-bridge arc avoids a straight strip across the nose tip.
 const before=raw[Math.max(0,index-1)],after=raw[Math.min(4,index+2)];
 const curve=(key:'x'|'y')=>.5*((2*a[key])+(-before[key]+b[key])*t+(2*before[key]-5*a[key]+4*b[key]-after[key])*t*t+(-before[key]+3*a[key]-3*b[key]+after[key])*t*t*t);
 // Lift only the narrow central bridge; cheek anchors retain their eye clearance.
 const noseLift=fw*.045*Math.exp(-(((u-.5)/.13)**2));
 const baseline=belowEyes({x:curve('x'),y:curve('y')},noseLift);
 const bridgeTaper=1-.18*Math.exp(-(((u-.5)/.18)**2));
 return {x:baseline.x+down.x*(v-.5)*fw*.14*bridgeTaper,y:baseline.y+down.y*(v-.5)*fw*.14*bridgeTaper};
}
export function triangleTransform(src:Point[],dst:Point[]){
 const [a,b,c]=src,[d,e,f]=dst;
 const det=(b.x-a.x)*(c.y-a.y)-(c.x-a.x)*(b.y-a.y);
 if(Math.abs(det)<.001)return null;
 const m00=((e.x-d.x)*(c.y-a.y)-(f.x-d.x)*(b.y-a.y))/det;
 const m01=((f.x-d.x)*(b.x-a.x)-(e.x-d.x)*(c.x-a.x))/det;
 const m10=((e.y-d.y)*(c.y-a.y)-(f.y-d.y)*(b.y-a.y))/det;
 const m11=((f.y-d.y)*(b.x-a.x)-(e.y-d.y)*(c.x-a.x))/det;
 return [m00,m10,m01,m11,d.x-m00*a.x-m01*a.y,d.y-m10*a.x-m11*a.y] as const;
}
export function drawHalloweenPaint(ctx:CanvasRenderingContext2D,atlas:HTMLImageElement,l:NormalizedLandmark[],point:(p:NormalizedLandmark)=>Point,variant:number,amount:number){
 if(!atlas.complete||!atlas.naturalWidth||amount<=0||l.length<468)return;
 const cell=atlas.naturalWidth/2,cellHeight=atlas.naturalHeight/2,col=Math.max(0,Math.min(3,variant))%2,row=Math.floor(Math.max(0,Math.min(3,variant))/2);
 const nx=16,ny=4;
 // A restrained multiply pass preserves skin texture beneath the painted pigment.
 ctx.save();ctx.globalAlpha=.3+.55*Math.min(1,amount);ctx.globalCompositeOperation='multiply';ctx.imageSmoothingEnabled=true;
 for(let x=0;x<nx;x++)for(let y=0;y<ny;y++){
  const uv=[{x:x/nx,y:y/ny},{x:(x+1)/nx,y:y/ny},{x:(x+1)/nx,y:(y+1)/ny},{x:x/nx,y:(y+1)/ny}];
  const src=uv.map(q=>({x:(col+q.x)*cell,y:(row+.4+q.y*.34)*cellHeight}));
  const dst=uv.map(q=>paintBandPoint(q.x,q.y,l,point));
  for(const ids of [[0,1,2],[0,2,3]]){
   const from=ids.map(i=>src[i]),to=ids.map(i=>dst[i]),m=triangleTransform(from,to);if(!m)continue;
   const fw=Math.hypot(point(l[234]).x-point(l[454]).x,point(l[234]).y-point(l[454]).y);
   if(to.some(q=>!clearOfEyes(q,fw*.015,l,point,fw)))continue;
   ctx.save();ctx.beginPath();to.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();ctx.clip();ctx.transform(...m);ctx.drawImage(atlas,0,0);ctx.restore();
  }
 }
 ctx.restore();
}
