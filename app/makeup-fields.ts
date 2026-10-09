export type TintPoint={x:number;y:number};
// A continuous pigment field follows the lash arch, with zero alpha at its sides.
export function lidTintField(lid:TintPoint[],width:number,rise:number,color:string,accent=false){
 const cols=128,rows=64,minY=Math.min(...lid.map(p=>p.y))-rise*.2,maxY=Math.max(...lid.map(p=>p.y))+rise*1.55;
 const points=[...lid].sort((a,b)=>a.x-b.x),data=new Uint8ClampedArray(cols*rows*4);
 const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
 for(let x=0;x<cols;x++){
  const t=x/(cols-1),u=t*width;let i=0;while(i<points.length-2&&points[i+1].x<u)i++;
  const a=points[i],b=points[i+1],f=Math.max(0,Math.min(1,(u-a.x)/(b.x-a.x||1))),base=a.y+(b.y-a.y)*f;
  const side=Math.sin(Math.PI*t)**.8,focus=accent?Math.exp(-(((t-.78)/.23)**2)):1;
  for(let y=0;y<rows;y++){
   const v=minY+y/(rows-1)*(maxY-minY),height=(v-base)/rise;
   const feather=Math.exp(-(((height-.22)/.52)**2)*2)*(height<0?Math.exp(-((height/.09)**2)*2):1);
   const k=(y*cols+x)*4;rgb.forEach((c,n)=>data[k+n]=c);data[k+3]=Math.round(255*side*focus*feather);
  }
 }
 return {data,cols,rows,minY,spanY:maxY-minY};
}
const layers=new WeakMap<object,HTMLCanvasElement|OffscreenCanvas>();
export function paintLidTint(ctx:CanvasRenderingContext2D,lid:TintPoint[],a:TintPoint,axis:TintPoint,up:TintPoint,width:number,rise:number,color:string,opacity:number,blend:GlobalCompositeOperation,accent=false){
 if(opacity<=0||rise<=0)return;
 let layer=layers.get(ctx);
 if(!layer){if(typeof OffscreenCanvas!=='undefined')layer=new OffscreenCanvas(128,64);else if(typeof document!=='undefined')layer=document.createElement('canvas');else return;layers.set(ctx,layer);}
 const field=lidTintField(lid.map(p=>({x:(p.x-a.x)*axis.x+(p.y-a.y)*axis.y,y:(p.x-a.x)*up.x+(p.y-a.y)*up.y})),width,rise,color,accent);
 layer.width=field.cols;layer.height=field.rows;
 const target=layer.getContext('2d') as CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D|null;if(!target)return;
 const pixels=target.createImageData(field.cols,field.rows);pixels.data.set(field.data);target.putImageData(pixels,0,0);
 ctx.save();ctx.globalCompositeOperation=blend;ctx.globalAlpha=opacity;ctx.transform(axis.x,axis.y,up.x,up.y,a.x,a.y);ctx.drawImage(layer,0,field.minY,width,field.spanY);ctx.restore();
}
