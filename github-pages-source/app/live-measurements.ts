import type {NormalizedLandmark} from '@mediapipe/face_mesh';
import {scanFaceFrame} from './face-placement';
type Size={width:number;height:number};
export type LockedMeasurements={raw:NormalizedLandmark[];corrected:NormalizedLandmark[];size:Size};
function transfer(dx:number,dy:number,from:NormalizedLandmark[],to:NormalizedLandmark[],a:Size,b:Size){
 const ax=(from[454].x-from[234].x)*a.width,ay=(from[454].y-from[234].y)*a.height;
 const bx=(to[454].x-to[234].x)*b.width,by=(to[454].y-to[234].y)*b.height,den=ax*ax+ay*ay;
 if(den<1)return {x:0,y:0};
 const re=(bx*ax+by*ay)/den,im=(by*ax-bx*ay)/den;
 return {x:(re*dx-im*dy)/b.width,y:(im*dx+re*dy)/b.height};
}
export function followMeasurementPoints(locked:LockedMeasurements,live:NormalizedLandmark[],size:Size){
 return live.map((p,i)=>{const r=locked.raw[i],c=locked.corrected[i];if(!r||!c)return {...p};const d=transfer((c.x-r.x)*locked.size.width,(c.y-r.y)*locked.size.height,locked.raw,live,locked.size,size);return {...p,x:p.x+d.x,y:p.y+d.y};});
}
export function correctMeasurementPoint(locked:LockedMeasurements,live:NormalizedLandmark[],size:Size,index:number,edited:NormalizedLandmark){
 const d=transfer((edited.x-live[index].x)*size.width,(edited.y-live[index].y)*size.height,live,locked.raw,size,locked.size);
 const next=locked.corrected.map(p=>({...p}));next[index]={...next[index],x:locked.raw[index].x+d.x,y:locked.raw[index].y+d.y};return {...locked,corrected:next};
}
export function faceInsideScanRing(l:NormalizedLandmark[],width:number,height:number){
 const f=scanFaceFrame(width,height),cx=f.left+f.width/2,cy=f.top+f.height/2;
 // The actual rendered ellipse is 96% / 97% of the guide container.
 const rx=f.width*.48,ry=f.height*(68/140);
 return [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109].every(i=>{
  const p=l[i];return !!p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&((p.x-cx)/rx)**2+((p.y-cy)/ry)**2<=1;
 });
}

// Count face centers inside the displayed ring, ignoring people outside it.
export function selectScanFace(faces:NormalizedLandmark[][],width:number,height:number){
 const f=scanFaceFrame(width,height),cx=f.left+f.width/2,cy=f.top+f.height/2;
 const inside=faces.filter(l=>{const p=l[1];return p&&((p.x-cx)/(f.width*.48))**2+((p.y-cy)/(f.height*68/140))**2<=1;});
 return inside.length===1?inside[0]:null;
}
export function faceFillsScanRing(l:NormalizedLandmark[],width:number,height:number,wasPassed=false){
 const f=scanFaceFrame(width,height),cx=f.left+f.width/2,cy=f.top+f.height/2;
 if(![10,152,234,454].every(i=>l[i]&&Number.isFinite(l[i].x)&&Number.isFinite(l[i].y)))return false;
 // The full facial contour must remain inside the visible ellipse, even after
 // passing. Only the minimum-size check uses hysteresis.
 if(!faceInsideScanRing(l,width,height))return false;
 const fw=Math.abs(l[454].x-l[234].x),fh=Math.abs(l[152].y-l[10].y);
 const ringWidth=f.width*.96,ringHeight=f.height*68/70;
 const midX=(l[454].x+l[234].x)/2,midY=(l[152].y+l[10].y)/2;
 // A small hysteresis band prevents natural movement from toggling the gate.
 const minimum=wasPassed?.56:.6,centerTolerance=wasPassed?.3:.27;
 return fw>=ringWidth*minimum-1/width&&fh>=ringHeight*minimum-1/height
  &&fw<=ringWidth*1.45&&fh<=ringHeight*1.45
  &&Math.abs(midX-cx)<=ringWidth*centerTolerance&&Math.abs(midY-cy)<=ringHeight*centerTolerance;
}

// FaceMesh stops inside the upper forehead. Extrapolate along the facial axis;
// the user can then put the endpoint on their visible hairline.
export function initialHairline(l:NormalizedLandmark[]){
 const result=l.map(p=>({...p}));
 result[10]={...result[10],x:l[10].x+(l[10].x-l[152].x)*.08,y:Math.max(0,l[10].y+(l[10].y-l[152].y)*.08)};
 // Reposition neighboring upper-forehead anchors as a continuous arch,
 // rather than leaving the old inner-forehead points below the new apex.
 // Place the jaw-width anchors below the lower lip, along the jaw outline.
 const lip=l[17],chin=l[152];
 for(const [upper,lower] of [[172,136],[397,365]]){
  const target=lip.y+(chin.y-lip.y)*.22;
  const t=Math.max(0,Math.min(1,(target-l[upper].y)/Math.max(.0001,l[lower].y-l[upper].y)));
  result[upper]={...l[upper],x:l[upper].x+(l[lower].x-l[upper].x)*t,y:l[upper].y+(l[lower].y-l[upper].y)*t};
 }
 const top=result[10];
 for(const [side,ids] of [[103,[67,109]],[332,[297,338]]] as const){
  const edge=l[side];
  ids.forEach((id,j)=>{const t=(j+1)/3;result[id]={...l[id],x:edge.x+(top.x-edge.x)*t,y:top.y+(edge.y-top.y)*(1-t)**2};});
 }
 return result;
}
