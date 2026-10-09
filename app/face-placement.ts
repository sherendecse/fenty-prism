import type {NormalizedLandmark} from '@mediapipe/face_mesh';
export type Point={x:number;y:number};
export const eyeRegions=[
 {upper:[33,246,161,160,159,158,157,173,133],ring:[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],lower:145,outer:33,inner:133,cheek:234,brow:105},
 {upper:[362,398,384,385,386,387,388,466,263],ring:[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],lower:374,outer:263,inner:362,cheek:454,brow:334},
];
export function pointSegmentDistance(p:Point,a:Point,b:Point){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
export function outsideWithMargin(q:Point,polygon:Point[],margin:number){
 let inside=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];
  if((a.y>q.y)!==(b.y>q.y)&&q.x<(b.x-a.x)*(q.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
  if(pointSegmentDistance(q,a,b)<=margin)return false;
 }
 return !inside;
}
export function clearOfEyes(q:Point,radius:number,l:NormalizedLandmark[],point:(p:NormalizedLandmark)=>Point,fw:number){return eyeRegions.every(eye=>outsideWithMargin(q,eye.ring.map(i=>point(l[i])),radius+Math.max(2,fw*.012)));}
export function gemPlacements(eye:typeof eyeRegions[number],l:NormalizedLandmark[],point:(p:NormalizedLandmark)=>Point,fw:number,amount:number,count:number){
 const a=point(l[eye.inner]),b=point(l[eye.outer]),low=point(l[eye.lower]),width=Math.hypot(b.x-a.x,b.y-a.y);if(width<3)return [];
 const axis={x:(b.x-a.x)/width,y:(b.y-a.y)/width};let down={x:-axis.y,y:axis.x};if(down.y<0)down={x:-down.x,y:-down.y};
 const radius=Math.max(.8,width*(.025+.015*amount));
 const candidates=[{base:b,out:.34,drop:.26},{base:low,out:.12,drop:.38},{base:b,out:.52,drop:.50},{base:b,out:.65,drop:-.22},{base:low,out:.40,drop:.64}];
 return candidates.map(c=>({x:c.base.x+axis.x*width*c.out+down.x*width*c.drop,y:c.base.y+axis.y*width*c.out+down.y*width*c.drop,radius})).filter(q=>clearOfEyes(q,radius,l,point,fw)).slice(0,count);
}
export function blushPigment(amount:number,gain:number,depth:number){
 const t=Math.max(0,Math.min(1,amount)),skin=depth>=4?1.18:1;
 return {tint:t===0?0:Math.min(.30,(.145+.19*t)*Math.max(.9,gain)*skin),texture:t===0?0:Math.min(.52,(.22+.28*t)*Math.max(.8,gain)),spread:.84+.32*t};
}
// The camera framing depends on the video aspect ratio only, never on the detected face.
export function cameraFit(width:number,height:number,videoWidth:number,videoHeight:number){const scale=Math.min(width/videoWidth,height/videoHeight);return {drawWidth:videoWidth*scale,drawHeight:videoHeight*scale,offsetX:(width-videoWidth*scale)/2,offsetY:(height-videoHeight*scale)/2};}
// One malar placement for every look; the whole feathered patch clears the under-eye band.
export function cheekBlushPlacement(eye:typeof eyeRegions[number],l:NormalizedLandmark[],point:(p:NormalizedLandmark)=>Point,fw:number,spread:number,ratio:number){
 const low=point(l[eye.lower]),inner=point(l[eye.inner]),outer=point(l[eye.outer]),edge=point(l[eye.cheek]),malar=point(l[eye.cheek===234?50:280]);
 const width=Math.hypot(outer.x-inner.x,outer.y-inner.y)||1,axis={x:(outer.x-inner.x)/width,y:(outer.y-inner.y)/width};
 let down={x:-axis.y,y:axis.x};if(down.y<0)down={x:-down.x,y:-down.y};
 const rx=fw*(ratio>1.05?.164:.15)*spread,ry=fw*.086*spread;
 const center={x:malar.x*.58+edge.x*.42,y:malar.y*.58+edge.y*.42};
 const offset=(center.x-low.x)*down.x+(center.y-low.y)*down.y;
 const underEyeGap=fw*.065;
 const move=Math.max(0,underEyeGap+ry-offset);
 center.x+=down.x*move;center.y+=down.y*move;
 return {center,rx,ry,angle:Math.atan2(axis.y,axis.x),underEyeGap,low,down};
}

// Keep a face-shaped oval in physical pixels, including portrait phone cameras.
export function scanFaceFrame(width:number,height:number){
 const h=Math.min(height*.62,width*.58*1.4),w=h/1.4;
 return {left:(1-w/width)/2,top:.47-h/height/2,width:w/width,height:h/height};
}
