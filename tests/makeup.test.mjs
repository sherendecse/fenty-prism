import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
await mkdir(new URL('../.sites-runtime/makeup-test/',import.meta.url),{recursive:true});
for(const name of ['freckle-patterns','live-measurements','capture-progress','makeup-fields','face-engine','look-match','face-placement','halloween-paint','makeup-renderer']){
 const source=await readFile(new URL(`../app/${name}.ts`,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replaceAll("'./freckle-patterns'","'./freckle-patterns.js'").replaceAll("'./face-engine'","'./face-engine.js'").replaceAll("'./halloween-paint'","'./halloween-paint.js'").replaceAll("'./face-placement'","'./face-placement.js'").replaceAll("'./makeup-fields'","'./makeup-fields.js'");
 await writeFile(new URL(`../.sites-runtime/makeup-test/${name}.js`,import.meta.url),js);
}
const {matchLook}=await import('../.sites-runtime/makeup-test/look-match.js');
const {sample}=await import('../.sites-runtime/makeup-test/face-engine.js');
const {makeupProfile,strengthParameters,drawMakeup}=await import('../.sites-runtime/makeup-test/makeup-renderer.js');
test('occasion priorities keep exercise and event looks appropriate',()=>{
 for(const [occasion,id] of [['sport','sport'],['newyear','winter'],['halloween','graphic'],['festival','gem'],['beach','summer']]){
  for(const season of ['spring','summer','autumn','winter','bold','glow'])assert.equal(matchLook(season,occasion,sample).id,id);
 }
 assert.equal(matchLook('autumn','work',sample).id,'autumn');
 assert.match(matchLook('spring','date',sample).reason,/腮红/);
});
test('strength changes coverage, colour, liner and sparkle detail',()=>{
 const [weak,medium,strong]=[.25,.54,.85].map(strengthParameters);
 for(const key of ['opacity','spread','liner','sparkles'])assert.ok(weak[key]<medium[key]&&medium[key]<strong[key],key);
 assert.equal(strengthParameters(0).opacity,0);
 assert.notEqual(makeupProfile('chrome').eye,makeupProfile('autumn').eye);
 assert.equal(makeupProfile('gem').gem,true);
 assert.match(makeupProfile('graphic').detail,/彩绘/);
});
const {eyeRegions,clearOfEyes,gemPlacements,cameraFit,blushPigment,cheekBlushPlacement,scanFaceFrame}=await import('../.sites-runtime/makeup-test/face-placement.js');
function faceFixture(blink=false){
 const l=Array.from({length:468},()=>({x:.5,y:.5,z:0}));l[234]={x:.2,y:.5,z:0};l[454]={x:.8,y:.5,z:0};
 eyeRegions.forEach((eye,side)=>{const left=side?.58:.30,right=left+.12,height=blink?.002:.025;
  eye.upper.forEach((id,i)=>{const t=i/(eye.upper.length-1);l[id]={x:left+(right-left)*t,y:.4-Math.sin(t*Math.PI)*height,z:0};});
  eye.ring.slice(9).forEach((id,i)=>{const t=(i+1)/8;l[id]={x:right-(right-left)*t,y:.4+Math.sin(t*Math.PI)*height,z:0};});
  l[eye.brow]={x:(left+right)/2,y:.32,z:0};
 });return l;
}
function render(id,amount,freckles=false){
 let saves=0,arcs=0;const alphas=[],colours=[];
 const ctx=new Proxy({},{get:(_,k)=>k==='createRadialGradient'?()=>({addColorStop(_,colour){colours.push(colour.slice(0,7));}}):k==='save'?()=>saves++:k==='restore'?()=>saves--:k==='arc'?()=>arcs++:()=>{},set:(_,k,v)=>{if(k==='globalAlpha')alphas.push(v);if(k==='fillStyle'&&typeof v==='string')colours.push(v);return true;}});
 const l=faceFixture();
 drawMakeup(ctx,l,p=>({x:p.x*500,y:p.y*500}),sample,id,{eye:amount,blush:amount,glow:amount,finish:'glow',level:1,freckles});
 assert.equal(saves,0,'all Canvas state restored');assert.ok(alphas.every(x=>Number.isFinite(x)&&x>=0&&x<=1));return {arcs,colours};
}
test('strong Chrome paints more sparkle details and styles use their own lips',()=>{
 assert.ok(render('chrome',.85).arcs>render('chrome',.25).arcs);
 assert.ok(render('winter',.54).colours.includes('#c8223e'));
 assert.ok(render('autumn',.54).colours.includes('#a6634f'));
 for(const id of ['spring','summer','chrome','autumn','shadow','winter','red','graphic','gem','sport','color','glow','inclusive'])render(id,.85);
});

const {triangleTransform,drawHalloweenPaint,paintBandPoint}=await import('../.sites-runtime/makeup-test/halloween-paint.js');
test('texture mapping lands exactly on the moving triangle landmarks',()=>{
 const src=[{x:0,y:0},{x:50,y:0},{x:0,y:50}],dst=[{x:100,y:80},{x:160,y:85},{x:90,y:140}],m=triangleTransform(src,dst);
 src.forEach((p,i)=>{assert.ok(Math.abs(m[0]*p.x+m[2]*p.y+m[4]-dst[i].x)<1e-8);assert.ok(Math.abs(m[1]*p.x+m[3]*p.y+m[5]-dst[i].y)<1e-8);});
 assert.equal(triangleTransform([{x:0,y:0},{x:0,y:0},{x:0,y:0}],dst),null);
});
test('all four paint bands render through landmark mesh, zero removes paint',()=>{
 let draws=0,saves=0;const ctx=new Proxy({},{get:(_,k)=>k==='drawImage'?()=>draws++:k==='save'?()=>saves++:k==='restore'?()=>saves--:()=>{},set:()=>true});
 const l=faceFixture();l[116]={x:.34,y:.49};l[345]={x:.66,y:.49};l[6]={x:.5,y:.46};l[1]={x:.5,y:.57};
 const atlas={complete:true,naturalWidth:1254,naturalHeight:1254};
 for(let variant=0;variant<4;variant++){const before=draws;drawHalloweenPaint(ctx,atlas,l,p=>({x:p.x*500,y:p.y*500}),variant,.7);assert.equal(draws-before,128);assert.equal(saves,0);}
 const before=draws;drawHalloweenPaint(ctx,atlas,l,p=>({x:p.x*500,y:p.y*500}),0,0);assert.equal(draws,before);
});

test('gem positions remain outside both eyes during mirroring, roll and blinking',()=>{
 for(const blink of [false,true])for(const mirror of [false,true])for(const angle of [-.3,0,.3]){
  const l=faceFixture(blink),point=p=>{const x=(mirror?1-p.x:p.x)*500,y=p.y*500;return {x:250+(x-250)*Math.cos(angle)-(y-250)*Math.sin(angle),y:250+(x-250)*Math.sin(angle)+(y-250)*Math.cos(angle)};};
  for(const eye of eyeRegions){const gems=gemPlacements(eye,l,point,300,.85,5);assert.ok(gems.length>=2);gems.forEach(g=>assert.equal(clearOfEyes(g,g.radius,l,point,300),true));}
 }
});
test('camera fit never changes with a face size and weak blush keeps a transparent visible pigment',()=>{
 assert.deepEqual(cameraFit(600,450,1280,960),{drawWidth:600,drawHeight:450,offsetX:0,offsetY:0});
 const weak=blushPigment(.22,.65,1),strong=blushPigment(.8,.65,1);
 assert.ok(weak.tint>=.07&&weak.tint<.18);assert.ok(strong.tint>weak.tint&&strong.tint<.3);assert.equal(blushPigment(0,1,1).tint,0);
 assert.ok(blushPigment(.22,.65,5).tint>weak.tint);
});

test('the whole cheek blush ellipse clears the eye-bag band at every intensity and face angle',()=>{
 for(const scale of [300,500])for(const mirror of [false,true])for(const angle of [-.3,0,.3])for(const amount of [.22,.54,.85]){
  const l=faceFixture(),point=p=>{const x=(mirror?1-p.x:p.x)*scale,y=p.y*scale;return {x:x*Math.cos(angle)-y*Math.sin(angle),y:x*Math.sin(angle)+y*Math.cos(angle)};};
  for(const eye of eyeRegions){
   const b=cheekBlushPlacement(eye,l,point,scale*.6,blushPigment(amount,1,1).spread,1.1);
   const gap=(b.center.x-b.low.x)*b.down.x+(b.center.y-b.low.y)*b.down.y-b.ry;
   assert.ok(gap>=b.underEyeGap-1e-8,'the upper edge cannot enter the eye-bag band');
   assert.ok(b.rx>b.ry&&Number.isFinite(b.angle));
  }
 }
});

const {lidTintField}=await import('../.sites-runtime/makeup-test/makeup-fields.js');
test('eyeshadow fades along the lid arch without straight-sided colour blocks',()=>{
 const f=lidTintField([{x:0,y:0},{x:25,y:10},{x:50,y:15},{x:75,y:10},{x:100,y:0}],100,16,'#92614a');
 for(let y=0;y<f.rows;y++)for(const x of [0,f.cols-1])assert.equal(f.data[(y*f.cols+x)*4+3],0);
 for(let x=0;x<f.cols;x++)assert.ok(f.data[((f.rows-1)*f.cols+x)*4+3]<=1);
 const columnPeak=x=>{let max=0;for(let y=0;y<f.rows;y++)max=Math.max(max,f.data[(y*f.cols+x)*4+3]);return max;};
 assert.ok(columnPeak(64)>180);assert.ok(columnPeak(8)<columnPeak(64));
});

test('Halloween paint remains symmetric and moves with face roll and scale',()=>{
 const l=Array.from({length:468},()=>({x:250,y:250,z:0}));l[234]={x:100,y:250};l[454]={x:400,y:250};l[116]={x:175,y:250};l[345]={x:325,y:250};l[6]={x:250,y:225};
 const identity=p=>p;
 for(const v of [0,.5,1])for(const u of [0,.1,.25,.4,.5]){
  const left=paintBandPoint(u,v,l,identity),right=paintBandPoint(1-u,v,l,identity);
  assert.ok(Math.abs(left.x+right.x-500)<1e-8);assert.ok(Math.abs(left.y-right.y)<1e-8);
 }
 for(const angle of [-.35,0,.35])for(const scale of [.5,1,1.4]){
  const transform=p=>({x:scale*(p.x*Math.cos(angle)-p.y*Math.sin(angle)),y:scale*(p.x*Math.sin(angle)+p.y*Math.cos(angle))});
  for(const u of [.1,.3,.5,.7,.9])for(const v of [0,.5,1]){
   const expected=transform(paintBandPoint(u,v,l,identity)),actual=paintBandPoint(u,v,l,transform);
   assert.ok(Math.hypot(expected.x-actual.x,expected.y-actual.y)<1e-8);
  }
 }
});

test('paint sits between the bridge and nostrils, below the eyes',()=>{
 const l=Array.from({length:468},()=>({x:250,y:250,z:0}));l[234]={x:100,y:260};l[454]={x:400,y:260};l[116]={x:170,y:245};l[345]={x:330,y:245};l[6]={x:250,y:220};l[1]={x:250,y:290};l[145]={x:190,y:210};l[374]={x:310,y:210};
 const point=p=>p,bridge=paintBandPoint(.5,.5,l,point),left=paintBandPoint(.25,.5,l,point),right=paintBandPoint(.75,.5,l,point);
 assert.equal(bridge.x,250);assert.ok(Math.abs(bridge.y-235.4)<1e-9);assert.ok(bridge.y<left.y,'nose paint arches gently above the cheek anchors');assert.deepEqual(paintBandPoint(0,.5,l,point),{x:170,y:245});assert.ok(Math.hypot(paintBandPoint(1,.5,l,point).x-330,paintBandPoint(1,.5,l,point).y-245)<1e-9);assert.ok(left.x>170&&right.x<330);assert.ok(bridge.y>l[6].y&&bridge.y<l[1].y);
 const eps=.00001;
 for(const u of [.25,.5,.75]){
  const a=paintBandPoint(u-eps,.5,l,point),b=paintBandPoint(u,.5,l,point),c=paintBandPoint(u+eps,.5,l,point);
  assert.ok(Math.abs((b.y-a.y)/eps-(c.y-b.y)/eps)<.03,'the arc has no sharp corner');
 }
});

test('every point of the paint band leaves a gap below the eyes during roll and mirroring',()=>{
 for(const mirror of [false,true])for(const angle of [-.3,0,.3]){
  const l=faceFixture();l[116]={x:.3,y:.42};l[345]={x:.7,y:.42};l[6]={x:.5,y:.40};l[1]={x:.5,y:.52};
  const point=p=>{const x=(mirror?1-p.x:p.x)*500,y=p.y*500;return {x:x*Math.cos(angle)-y*Math.sin(angle),y:x*Math.sin(angle)+y*Math.cos(angle)};};
  const down={x:-Math.sin(angle),y:Math.cos(angle)},low=Math.max(...[145,374].map(i=>{const p=point(l[i]);return p.x*down.x+p.y*down.y;}));
  for(let u=0;u<=1;u+=.025)for(const v of [0,.5,1]){
   const q=paintBandPoint(u,v,l,point);if(u<.3||u>.7)assert.ok(q.x*down.x+q.y*down.y>=low+300*.033-1e-8);
   assert.ok(clearOfEyes(q,300*.015,l,point,300));
  }
 }
});
test('the scan oval keeps face proportions on portrait phones, tablets and landscape cameras',()=>{
 for(const [w,h] of [[320,426],[390,693],[768,1024],[1024,768],[1440,1080]]){
  const f=scanFaceFrame(w,h);assert.ok(Math.abs(f.width*w/(f.height*h)-1/1.4)<1e-9);
  assert.ok(Math.abs(f.left+f.width/2-.5)<1e-9);assert.ok(f.top>0&&f.top+f.height<1);
  assert.ok(f.width<=.58+1e-9&&f.height<=.62+1e-9);
 }
 assert.ok(scanFaceFrame(390,693).width>.5);
});

const {captureChecks}=await import('../.sites-runtime/makeup-test/capture-progress.js');
const {followMeasurementPoints,correctMeasurementPoint,faceInsideScanRing,faceFillsScanRing,selectScanFace}=await import('../.sites-runtime/makeup-test/live-measurements.js');
const {canContinueCapture}=await import('../.sites-runtime/makeup-test/capture-progress.js');
test('manual next requires bare-skin confirmation and all current checks',()=>{
 const all={light:true,even:true,pose:true,frame:true};assert.equal(canContinueCapture(all,false),false);assert.equal(canContinueCapture(all,true),true);
 for(const key of captureChecks)assert.equal(canContinueCapture({...all,[key]:false},true),false);
});
test('live points follow translation, scale and roll while locked measurements stay untouched',()=>{
 const raw=faceFixture(),corrected=raw.map(p=>({...p}));corrected[10]={...corrected[10],x:.48,y:.28};
 const size={width:600,height:400},locked={raw,corrected,size},before=JSON.stringify(locked);
 for(const angle of [-.3,0,.3])for(const scale of [.7,1,1.3]){
  const transform=p=>{const x=(p.x-.5)*600,y=(p.y-.5)*400;return {...p,x:.6+scale*(x*Math.cos(angle)-y*Math.sin(angle))/600,y:.55+scale*(x*Math.sin(angle)+y*Math.cos(angle))/400};};
  const live=raw.map(transform),points=followMeasurementPoints(locked,live,size),expected=transform(corrected[10]);
  assert.ok(Math.abs(points[10].x-expected.x)<1e-9);assert.ok(Math.abs(points[10].y-expected.y)<1e-9);
  const recovered=correctMeasurementPoint(locked,live,size,10,points[10]);assert.ok(Math.abs(recovered.corrected[10].x-corrected[10].x)<1e-9);assert.ok(Math.abs(recovered.corrected[10].y-corrected[10].y)<1e-9);
 }
 assert.equal(JSON.stringify(locked),before);
});
test('ring containment rejects a face leaving any side on desktop, phone and tablet',()=>{
 for(const [w,h] of [[960,720],[390,693],[768,1024]]){
  const f=scanFaceFrame(w,h),cx=f.left+f.width/2,cy=f.top+f.height/2;
  const l=Array.from({length:468},()=>({x:cx,y:cy,z:0}));l[10].y-=f.height*.35;l[152].y+=f.height*.35;l[234].x-=f.width*.3;l[454].x+=f.width*.3;
  assert.equal(faceInsideScanRing(l,w,h),true);
  for(const [dx,dy] of [[f.width,0],[-f.width,0],[0,f.height],[0,-f.height]])assert.equal(faceInsideScanRing(l.map(p=>({...p,x:p.x+dx,y:p.y+dy})),w,h),false);
 }
});

const {measure}=await import('../.sites-runtime/makeup-test/face-engine.js');
test('face ratios and angles are invariant to movement, scale and roll',()=>{
 const l=faceFixture();Object.assign(l[10],{x:.5,y:.2});Object.assign(l[152],{x:.5,y:.8});Object.assign(l[103],{x:.3,y:.3});Object.assign(l[332],{x:.7,y:.3});Object.assign(l[172],{x:.3,y:.65});Object.assign(l[397],{x:.7,y:.65});Object.assign(l[148],{x:.43,y:.76});Object.assign(l[377],{x:.57,y:.76});
 const before=measure(l,500,500);assert.ok(before.chinAngle>0&&before.chinAngle<180);assert.ok(before.jawAngle>0&&before.jawAngle<180);
 for(const angle of [-.2,0,.2])for(const scale of [.7,1.2]){
  const moved=l.map(p=>({...p,x:.55+scale*((p.x-.5)*Math.cos(angle)-(p.y-.5)*Math.sin(angle)),y:.52+scale*((p.x-.5)*Math.sin(angle)+(p.y-.5)*Math.cos(angle))}));
  const after=measure(moved,500,500);for(const key of ['ratio','foreheadJaw','chinAngle','jawAngle'])assert.ok(Math.abs(before[key]-after[key])<1e-8);assert.equal(after.code,before.code);
 }
});

test('rounded lower chins and nearly equal widths do not collapse into diamond faces',()=>{
 const make=(cheek,forehead,jaw,tip)=>{
  const l=faceFixture();
  for(const [left,right,width,y] of [[234,454,cheek,.5],[103,332,forehead,.3],[172,397,jaw,.68],[176,400,.2,.76],[148,377,.1,tip]]){l[left]={x:.5-width/2,y,z:0};l[right]={x:.5+width/2,y,z:0};}
  l[10]={x:.5,y:.2,z:0};l[152]={x:.5,y:.8,z:0};return l;
 };
 const oval=measure(make(.5,.49,.48,.79),500,500);
 assert.equal(oval.chin,3);assert.doesNotMatch(oval.shape,/菱形/);
 const diamond=measure(make(.6,.42,.42,.73),500,500);
 assert.equal(diamond.chin,1);assert.match(diamond.shape,/菱形/);
 const pear=measure(make(.45,.4,.55,.79),500,500);assert.match(pear.shape,/梨形/);
});
test('hairline correction changes reference length and follows subsequent motion',async()=>{
 const {initialHairline}=await import('../.sites-runtime/makeup-test/live-measurements.js');
 const raw=faceFixture();raw[10]={x:.5,y:.2,z:0};raw[152]={x:.5,y:.8,z:0};raw[103]={x:.3,y:.3,z:0};raw[332]={x:.7,y:.3,z:0};raw[172]={x:.3,y:.65,z:0};raw[397]={x:.7,y:.65,z:0};
 const corrected=initialHairline(raw),size={width:500,height:500};assert.ok(corrected[10].y<raw[10].y);
 const locked={raw,corrected,size};const next=correctMeasurementPoint(locked,raw,size,10,{...raw[10],y:.12});
 assert.ok(measure(next.corrected,500,500).ratio>measure(raw,500,500).ratio);
 const moved=raw.map(p=>({...p,x:p.x+.05,y:p.y+.05}));assert.ok(Math.abs(followMeasurementPoints(next,moved,size)[10].y-.17)<1e-9);
});

test('the upper forehead arch has independent corrections that persist during motion',async()=>{
 const {initialHairline}=await import('../.sites-runtime/makeup-test/live-measurements.js');
 const raw=faceFixture();raw[10]={x:.5,y:.2,z:0};raw[152]={x:.5,y:.8,z:0};raw[103]={x:.3,y:.3,z:0};raw[332]={x:.7,y:.3,z:0};
 const corrected=initialHairline(raw),size={width:500,height:500};
 for(const ids of [[103,67,109,10],[332,297,338,10]])for(let i=1;i<ids.length;i++)assert.ok(corrected[ids[i]].y<corrected[ids[i-1]].y,'arch rises continuously toward the apex');
 for(const index of [67,109,338,297]){
  const edited={...corrected[index],y:corrected[index].y-.02};
  const locked=correctMeasurementPoint({raw,corrected,size},raw,size,index,edited);
  const moved=raw.map(p=>({...p,x:p.x+.03,y:p.y+.04}));const followed=followMeasurementPoints(locked,moved,size);
  assert.ok(Math.abs(followed[index].y-(edited.y+.04))<1e-9);
  assert.deepEqual(locked.corrected[10],corrected[10]);
 }
});

test('freckles are opt-in on ordinary looks, with visible pigment gains for the four light looks',()=>{
 for(const id of ['spring','summer','sport','inclusive']){const p=makeupProfile(id);assert.ok(p.eyePigment>=.58);assert.ok(p.lipPigment>=.44);assert.ok(p.blushGain>=1);}
 for(const id of ['spring','summer','sport','inclusive','autumn','shadow','winter','red','chrome','color','glow']){assert.ok(render(id,.54,true).colours.includes('#8b563d'));assert.ok(!render(id,.54,false).colours.includes('#8b563d'));}
 for(const id of ['graphic','gem'])assert.deepEqual(render(id,.54,true),render(id,.54,false));
});

test('capture requires a full ring-sized face and ignores other faces outside the ring',()=>{
 for(const [w,h] of [[960,720],[390,693],[768,1024]]){
  const f=scanFaceFrame(w,h),cx=f.left+f.width/2,cy=f.top+f.height/2;
  const face=Array.from({length:468},()=>({x:cx,y:cy,z:0}));face[10].y-=f.height*.43;face[152].y+=f.height*.43;face[234].x-=f.width*.43;face[454].x+=f.width*.43;
  assert.equal(faceFillsScanRing(face,w,h),true);
  const small=face.map(p=>({...p,x:cx+(p.x-cx)*.6,y:cy+(p.y-cy)*.6}));assert.equal(faceFillsScanRing(small,w,h),false);
  const outside=face.map(p=>({...p,x:p.x+f.width}));assert.equal(selectScanFace([outside,face],w,h),face);assert.equal(selectScanFace([face,outside],w,h),face);
  assert.equal(selectScanFace([outside],w,h),null);assert.equal(selectScanFace([face,small],w,h),null);
 }
});

test('capture requires both minimum size and the entire face within the oval',()=>{
 const w=960,h=720,f=scanFaceFrame(w,h),cx=f.left+f.width/2,cy=f.top+f.height/2;
 const l=Array.from({length:468},()=>({x:cx,y:cy,z:0}));
 l[234].x-=f.width*.96*.4;l[454].x+=f.width*.96*.4;l[10].y-=f.height*68/70*.4;l[152].y+=f.height*68/70*.4;
 assert.equal(faceFillsScanRing(l,w,h),true);
 const large=l.map(p=>({...p,x:cx+(p.x-cx)*1.3,y:cy+(p.y-cy)*1.05+f.height*.08}));
 large[172]={x:cx-f.width*.46,y:cy+f.height*.3,z:0};
 assert.equal(faceInsideScanRing(large,w,h),false);assert.equal(faceFillsScanRing(large,w,h),false);assert.equal(faceFillsScanRing(large,w,h,true),false);
 // An intermediate contour point outside the ellipse must fail too.
 const clipped=l.map(p=>({...p}));clipped[379]={x:cx+f.width*.4,y:cy+f.height*.35,z:0};
 assert.equal(faceFillsScanRing(clipped,w,h),false);assert.equal(faceFillsScanRing(clipped,w,h,true),false);
 assert.equal(faceFillsScanRing(l.map(p=>({...p,x:p.x+f.width*.4})),w,h),false);
});

test('60% capture allows small movement and preserves pass near the threshold',()=>{
 const w=960,h=720,f=scanFaceFrame(w,h),cx=f.left+f.width/2,cy=f.top+f.height/2;
 const l=Array.from({length:468},()=>({x:cx,y:cy,z:0}));
 l[234].x-=f.width*.96*.3;l[454].x+=f.width*.96*.3;l[10].y-=f.height*68/70*.3;l[152].y+=f.height*68/70*.3;
 assert.equal(faceFillsScanRing(l,w,h),true);
 assert.equal(faceFillsScanRing(l.map(p=>({...p,x:p.x+f.width*.08,y:p.y+f.height*.04})),w,h),true);
 const jitter=l.map(p=>({...p,x:cx+(p.x-cx)*.96,y:cy+(p.y-cy)*.96}));assert.equal(faceFillsScanRing(jitter,w,h),false);assert.equal(faceFillsScanRing(jitter,w,h,true),true);
 const distant=l.map(p=>({...p,x:cx+(p.x-cx)*.7,y:cy+(p.y-cy)*.7}));assert.equal(faceFillsScanRing(distant,w,h,true),false);
});
test('four freckle distributions differ, intensity is independent, and zero removes freckles',()=>{
 const renderFreckles=(pattern,intensity,eye=0)=>{
  let color,alpha;const dots=[];
  const ctx=new Proxy({},{get:(_,k)=>k==='createRadialGradient'?()=>({addColorStop(){}}):k==='ellipse'?(...args)=>{if(color==='#8b563d')dots.push({args,alpha});}:()=>{},set:(_,k,v)=>{if(k==='fillStyle')color=v;if(k==='globalAlpha')alpha=v;return true;}});
  drawMakeup(ctx,faceFixture(),p=>({x:p.x*500,y:p.y*500}),sample,'spring',{eye,blush:0,glow:0,finish:'matte',level:1,freckles:true,frecklePattern:pattern,freckleIntensity:intensity});return dots;
 };
 const results=[0,1,2,3].map(p=>renderFreckles(p,.6));assert.ok(results.every(p=>p.length>0));assert.equal(new Set(results.map(p=>JSON.stringify(p))).size,4);
 assert.deepEqual(renderFreckles(0,0),[]);assert.deepEqual(renderFreckles(0,.6,0),renderFreckles(0,.6,1));
 const weak=renderFreckles(0,.2),strong=renderFreckles(0,.9);assert.ok(weak[0].alpha<strong[0].alpha);
});
