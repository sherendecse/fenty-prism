export type IntensitySnapshot={eye:number;blush:number;glow:number;lip:number;liner:number;contour:number;art:number;level:number};
// A continuous slider gesture is one change, regardless of input event frequency.
export class IntensityHistory {
 private entries:IntensitySnapshot[]=[];
 private gesture:string|null=null;
 get count(){return this.entries.length;}
 record(snapshot:IntensitySnapshot){this.endGesture();const {eye,blush,glow,lip,liner,contour,art,level}=snapshot;this.entries.push({eye,blush,glow,lip,liner,contour,art,level});if(this.entries.length>40)this.entries.shift();}
 change(control:string,snapshot:IntensitySnapshot){if(this.gesture!==control){this.record(snapshot);this.gesture=control;}}
 endGesture(){this.gesture=null;}
 undo(){this.endGesture();return this.entries.pop();}
 clear(){this.entries=[];this.endGesture();}
}
