"use client";
import {Translated} from './i18n';
import {useEffect,useRef,useState} from 'react';
import type {FaceMesh,NormalizedLandmark} from '@mediapipe/face_mesh';
import {loadBrowserFaceMesh} from './face-loader';
import {Analysis,labels,measure,sample} from './face-engine';
import {scanFaceFrame} from './face-placement';
import {captureChecks as checkKeys,canContinueCapture} from './capture-progress';
import {selectScanFace,faceFillsScanRing,followMeasurementPoints,correctMeasurementPoint,initialHairline,type LockedMeasurements} from './live-measurements';
import BackButton from './back-button';
import StudioPlaceholder from './studio-placeholder';
import FaceMeasurementOverlay from './face-measurement-overlay';

const undertones:Record<string,string>={'待确认':'不确定也可以继续，先给你中性底色的试色起点。','冷':'皮肤底色偏粉红、玫瑰或偏蓝感；不是皮肤更白的意思。','中性':'粉红与金黄较均衡，没有明显偏向。','暖':'皮肤底色偏金黄、蜜桃或暖金感；不是晒黑程度。','橄榄':'底色带灰绿或黄绿色调，肤色深浅都可能出现。'};
const emptyChecks={light:false,even:false,pose:false,frame:false};
export default function Scan({onComplete,onBack,visible=true}:{onComplete:(a:Analysis)=>void;onBack:()=>void;visible?:boolean}) {
 const [stage,commitStage]=useState(0),[active,setActive]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[capturePhase,setCapturePhase]=useState<'idle'|'hold'|'blur'>('idle');
 const [stageFlow,setStageFlow]=useState<'idle'|'out'|'in'>('idle');
 const stageTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(stageTimer.current)clearTimeout(stageTimer.current);},[]);
 const setStage=(next:number,after?:()=>void)=>{
  if(next===stage){after?.();return;}
  if(stageTimer.current)clearTimeout(stageTimer.current);
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){after?.();commitStage(next);setStageFlow('idle');return;}
  setStageFlow('out');stageTimer.current=setTimeout(()=>{after?.();commitStage(next);window.scrollTo(0,0);setStageFlow('in');stageTimer.current=setTimeout(()=>setStageFlow('idle'),420);},220);
 };
 const [checks,setChecks]=useState(emptyChecks),[intro,setIntro]=useState(true),[bare,setBare]=useState(false);
 const [result,setResult]=useState<Analysis|null>(null),[points,setPoints]=useState<NormalizedLandmark[]|null>(null),[aspect,setAspect]=useState(4/3);
 const video=useRef<HTMLVideoElement>(null),canvas=useRef<HTMLCanvasElement>(null),picture=useRef<HTMLDivElement>(null),stream=useRef<MediaStream|null>(null),mesh=useRef<FaceMesh|null>(null),raf=useRef(0),latest=useRef<Analysis|null>(null),landmarks=useRef<NormalizedLandmark[]|null>(null),phase=useRef<'scan'|'locked'>('scan'),locked=useRef<LockedMeasurements|null>(null),liveChecks=useRef(emptyChecks),lastFrame=useRef(0),autoStarted=useRef(false),alive=useRef(true),generation=useRef(0);
 const baseline=useRef<LockedMeasurements|null>(null),history=useRef<{locked:LockedMeasurements;corrected:boolean}[]>([]),newGesture=useRef(true);
 const [undoCount,setUndoCount]=useState(0);
 const [introLeaving,setIntroLeaving]=useState(false);
 const introTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(introTimer.current)clearTimeout(introTimer.current);},[]);
 const openCapture=()=>{if(introLeaving)return;setIntroLeaving(true);introTimer.current=setTimeout(()=>setIntro(false),window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:220);};
 const [pictureSize,setPictureSize]=useState({width:640,height:480});
 const guide=scanFaceFrame(pictureSize.width,pictureSize.height);
 useEffect(()=>{const el=picture.current;if(!el)return;const resize=()=>{const r=el.getBoundingClientRect();if(r.width&&r.height)setPictureSize({width:r.width,height:r.height});};const observer=new ResizeObserver(resize);observer.observe(el);resize();return()=>observer.disconnect();},[intro,visible,stage]);
 const stop=()=>{setCapturePhase('idle');setBusy(false);generation.current++;cancelAnimationFrame(raf.current);stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;void mesh.current?.close().catch(()=>{});mesh.current=null;setActive(false);};
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;generation.current++;cancelAnimationFrame(raf.current);stream.current?.getTracks().forEach(t=>t.stop());void mesh.current?.close().catch(()=>{});};},[]);
 function nextPage(){
  if(!active||!canContinueCapture(liveChecks.current,bare)||performance.now()-lastFrame.current>500||!latest.current||!landmarks.current||!canvas.current)return;
  const raw=landmarks.current.map(p=>({...p}));locked.current={raw,corrected:initialHairline(raw),size:{width:canvas.current.width,height:canvas.current.height}};
  baseline.current=locked.current;history.current=[];setUndoCount(0);newGesture.current=true;
  phase.current='locked';setResult({...latest.current,...measure(locked.current.corrected,canvas.current.width,canvas.current.height)});setPoints(locked.current.corrected);setCapturePhase('hold');
 }
 async function start(){
  const resume=stage===1&&!!locked.current;stop();const session=generation.current;autoStarted.current=true;setPoints(null);setChecks(emptyChecks);setBusy(true);setError('');landmarks.current=null;liveChecks.current=emptyChecks;lastFrame.current=0;
  if(!resume){setResult(null);setStage(0);latest.current=null;phase.current='scan';locked.current=null;}
  try {
   const s=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:960},height:{ideal:720}}});if(!alive.current||session!==generation.current){s.getTracks().forEach(t=>t.stop());return;}stream.current=s;
   const Model=await loadBrowserFaceMesh();if(!alive.current||session!==generation.current)return;
   const m=new Model({locateFile:f=>`/mediapipe/${f}`});mesh.current=m;m.setOptions({maxNumFaces:5,refineLandmarks:true,minDetectionConfidence:.65,minTrackingConfidence:.65});
   m.onResults(r=>{
    if(!alive.current||session!==generation.current||!video.current||!canvas.current)return;
    const v=video.current,c=canvas.current;c.width=v.videoWidth;c.height=v.videoHeight;if(!c.width||!c.height)return;setAspect(c.width/c.height);const ctx=c.getContext('2d',{willReadFrequently:true});if(!ctx)return;ctx.drawImage(v,0,0);
    const w=c.width,h=c.height,faces=r.multiFaceLandmarks||[];
    const l=phase.current==='scan'?selectScanFace(faces,w,h):faces.reduce<NormalizedLandmark[]|null>((best,face)=>{const previous=landmarks.current?.[1];if(!previous)return best||face;const distance=(f:NormalizedLandmark[])=>Math.hypot(f[1].x-previous.x,f[1].y-previous.y);return !best||distance(face)<distance(best)?face:best;},null);if(!l){setChecks(emptyChecks);liveChecks.current=emptyChecks;lastFrame.current=0;latest.current=null;landmarks.current=null;setPoints(null);return;}
    const cheek=(i:number)=>{const data=ctx.getImageData(Math.max(0,Math.min(w-12,Math.round(l[i].x*w-6))),Math.max(0,Math.min(h-12,Math.round(l[i].y*h-6))),12,12).data;const rgb=[0,0,0];for(let j=0;j<data.length;j+=4)for(let k=0;k<3;k++)rgb[k]+=data[j+k]/144;return rgb;};
    const left=cheek(50),right=cheek(280),lum=(a:number[])=>.2126*a[0]+.7152*a[1]+.0722*a[2];const light=(lum(left)+lum(right))/2;
    const fw=Math.abs(l[234].x-l[454].x),fh=l[152].y-l[10].y,mid=(l[234].x+l[454].x)/2;
    const slope=Math.abs((l[33].y-l[263].y)*h)/Math.max(1,Math.abs(l[33].x-l[263].x)*w);
    const pose=slope<.14&&Math.abs(l[1].x-mid)/fw<.16;
    const frame=faceFillsScanRing(l,w,h,liveChecks.current.frame);
    const next={light:light>30&&light<245,even:Math.abs(lum(left)-lum(right))<40,pose,frame};
    setChecks(next);liveChecks.current=next;lastFrame.current=performance.now();
    landmarks.current=l.map(p=>({...p}));
    if(phase.current==='scan')latest.current={...measure(l,w,h),source:'camera',depth:light>195?0:light>170?1:light>140?2:light>110?3:light>80?4:5,undertone:'待确认',skinRgb:left.map((x,i)=>(x+right[i])/2)};
    else if(locked.current)setPoints(followMeasurementPoints(locked.current,landmarks.current,{width:w,height:h}));
   });
   await m.initialize();if(!alive.current||session!==generation.current){void m.close().catch(()=>{});return;}
   const v=video.current;if(!v)throw Error('无法显示摄像头');v.srcObject=s;await v.play();if(!alive.current||session!==generation.current)return;setActive(true);setBusy(false);
   const loop=async()=>{if(!alive.current||session!==generation.current||!stream.current)return;try{if(v.readyState>=2)await m.send({image:v});}catch{if(alive.current&&session===generation.current)setError('追踪暂停，请关闭后重试。');}if(alive.current&&session===generation.current&&stream.current)raf.current=requestAnimationFrame(loop);};raf.current=requestAnimationFrame(loop);
  }catch(e){if(!alive.current||session!==generation.current)return;stop();setBusy(false);setError(e instanceof DOMException&&e.name==='NotAllowedError'?'摄像头权限未开启。可重试，或使用示例体验。':e instanceof Error?e.message:'摄像头暂时无法使用。');}
 }
 useEffect(()=>{if(!visible){stop();autoStarted.current=false;}},[visible]);
 useEffect(()=>{if(visible&&!intro&&!autoStarted.current&&(stage===0||result?.source==='camera')){autoStarted.current=true;void start();}},[visible,intro,stage]);
 useEffect(()=>{if(!visible||capturePhase==='idle')return;const timer=window.setTimeout(()=>{if(capturePhase==='hold')setCapturePhase('blur');else{commitStage(1);setCapturePhase('idle');window.scrollTo(0,0);}},capturePhase==='hold'?450:420);return()=>window.clearTimeout(timer);},[visible,capturePhase]);

 function adjustPoint(index:number,x:number,y:number){
  if(!locked.current||!landmarks.current||!canvas.current||performance.now()-lastFrame.current>500)return;
  const size={width:canvas.current.width,height:canvas.current.height};
  if(newGesture.current){history.current.push({locked:locked.current,corrected:!!result?.corrected});setUndoCount(history.current.length);newGesture.current=false;}
  locked.current=correctMeasurementPoint(locked.current,landmarks.current,size,index,{...landmarks.current[index],x,y});
  const updated=measure(locked.current.corrected,locked.current.size.width,locked.current.size.height);
  setResult(prev=>prev?{...prev,...updated,corrected:true}:prev);
  setPoints(followMeasurementPoints(locked.current,landmarks.current,size));
 }
 function restoreMeasurements(next:LockedMeasurements,corrected:boolean){
  locked.current=next;setResult(prev=>prev?{...prev,...measure(next.corrected,next.size.width,next.size.height),corrected}:prev);
  if(landmarks.current&&canvas.current&&active)setPoints(followMeasurementPoints(next,landmarks.current,{width:canvas.current.width,height:canvas.current.height}));
  else setPoints(null);
  newGesture.current=true;
 }
 function undoAdjustment(){const previous=history.current.pop();if(!previous)return;restoreMeasurements(previous.locked,previous.corrected);setUndoCount(history.current.length);}
 function resetAdjustments(){if(!baseline.current||!locked.current||!result?.corrected)return;history.current.push({locked:locked.current,corrected:true});restoreMeasurements(baseline.current,false);setUndoCount(history.current.length);}
 const complete=active;
 const progress=complete?checkKeys.filter(k=>checks[k]).length:0;
 const hints=['面向窗户或柔和补光，避免画面过暗或发白。','让两侧脸颊都受光，转开背光或单侧强光。','眼睛看镜头，下巴自然放平，轻微倾斜也可以。','脸部占圆框至少60%，整张脸须在框内；框外的人不影响检查。'];
 if(intro)return <Translated><BackButton onClick={onBack}/><section className={`capture-guide page-enter ${introLeaving?'intro-leaving':''}`}><p className="kicker">FENTY PRISM</p><h2>开始前，让镜头看清你。</h2><p>几个小调整，让肤色与轮廓分析更准确。</p><div className="capture-tips">{[
  {icon:'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 1.4 1.4m10 10 1.4 1.4M5.6 18.4 1.4-1.4m10-10 1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',title:'面向柔和光线',text:'让两侧脸颊都受光，避开背光、强烈阴影和过曝。'},
  {icon:'M3 8V3h5m8 0h5v5m0 8v5h-5M8 21H3v-5M8 12h8m-4-4v8',title:'正面看镜头',text:'调整距离，让整张脸填满引导环，同时保留完整额头与下巴。'},
  {icon:'M4 9h6v5H4zM14 9h6v5h-6zM10 11h4M3 3l18 18',title:'呈现真实肤色',text:'建议取下口罩、深色眼镜，拨开遮脸头发，卸除底妆并关闭美颜。'}
 ].map(t=><article key={t.title}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={t.icon}/></svg><div><h3>{t.title}</h3><p>{t.text}</p></div></article>)}</div><div className="capture-permission"><p>下一页会请求摄像头权限。请在浏览器提示中选择允许；画面仅在本机分析。</p><button className="gold-cta" onClick={openCapture}>了解，开始拍摄</button></div></section></Translated>;
 return <Translated><><BackButton onClick={()=>{if(stage===1){setStage(0,()=>{setCapturePhase('idle');phase.current='scan';locked.current=null;setResult(null);setPoints(null);if(!active)autoStarted.current=false;});}else{onBack();}}}/><section data-stage-phase={stageFlow} className={`scan page-enter ${introLeaving?'intro-leaving':''}`}><div className="flow-steps">{['肤色与拍摄','脸型与特点','季节与场景','你的妆容'].map((n,i)=><span key={n} className={i===stage?'current':''}>0{i+1} {n}</span>)}</div>
  <div className={`scan-layout ${capturePhase==='blur'?'capture-dissolve':stage===1?'contour-arrive':''}`} aria-busy={capturePhase!=='idle'}><div className="scan-left"><div className="scan-camera">
   <div className="scan-picture" ref={picture} style={{aspectRatio:active||result?.source==='camera'?aspect:4/3}}>
    <video ref={video} muted playsInline hidden/><canvas ref={canvas} style={{display:active?'block':'none'}} aria-label="本地面部分析画面"/>
    {!active&&<StudioPlaceholder title={result?'示例分析已准备好':'准备好，遇见你自己'}/>}
    {stage===0&&complete&&<div className="face-frame scan-progress" role="progressbar" aria-label="拍摄条件完成进度" aria-valuemin={0} aria-valuemax={4} aria-valuenow={progress} style={{left:`${guide.left*100}%`,top:`${guide.top*100}%`,width:`${guide.width*100}%`,height:`${guide.height*100}%`}}><svg viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="50" cy="70" rx="48" ry="68" pathLength="100" className="progress-track"/>{checkKeys.map((k,i)=><ellipse key={k} cx="50" cy="70" rx="48" ry="68" pathLength="100" className={i<progress?"progress-segment filled":"progress-segment"} strokeDasharray="23 77" strokeDashoffset={-i*25}/>)}</svg><span>{progress} / 4 · 请保持脸在圈内</span></div>}
    {stage===1&&active&&result?.source==='camera'&&points&&<FaceMeasurementOverlay points={points} onAdjust={adjustPoint} onBeginAdjustment={()=>{newGesture.current=true;}}/>}
   </div>
   <div className="scan-camera-buttons"><button onClick={()=>{if(active)stop();else void start();}} disabled={busy||capturePhase!=='idle'}>{busy?'正在启动…':active?'关闭摄像头':'开启摄像头'}</button><span>{active?'仅在本机分析':result?.source==='camera'?'摄像头已关闭':'摄像头待机'}</span></div>
  </div>{stage===1&&result?.source==='camera'&&<div className="measurement-guide"><h3>AI 轮廓测量</h3><div className="measurement-actions"><button type="button" disabled={!result?.corrected} onClick={resetAdjustments}>重置</button><button type="button" disabled={undoCount===0} onClick={undoAdjustment}>撤销</button></div><div className="measurement-legend"><span className="forehead">额头宽</span><span className="cheek">颧骨宽</span><span className="jaw">下颌宽</span><span className="length">脸长</span><span className="angle">下颌与下巴角度</span></div><p>测量线沿脸部边缘跟随移动，数据保持锁定。拖动额头上缘的小点及其他端点，可校正发际线与轮廓；只有手动校正会更新分析。</p><p>紫色线测量下颌宽度：连接左右下颌轮廓，位于下唇下方，不穿过嘴唇中部。端点应贴合脸部边缘。</p></div>}</div>

  <div className="scan-copy"><p className="kicker">{stage===0?'01 / 肤色与拍摄':'02 / 脸型与特点'}</p><h2>{stage===0?'先让镜头看清你。':'看见你的轮廓。'}</h2>
   {stage===0?<><p>面向柔和自然光，和屏幕保持舒适距离。取下口罩、拨开遮住轮廓的头发；轻微碎发不影响继续。</p>
    <div className="quality-grid" aria-live="polite">{checkKeys.map((k,i)=><div className={checks[k]&&complete?'pass':'fail'} key={k}><b>{['光亮','光线均匀','正面姿态','框内单人'][i]}</b><span>{checks[k]&&complete?'通过':k==='even'?'建议调整':'待检查'}</span><small>{hints[i]}</small></div>)}</div>
    <label className={`check-label confirmation-option ${bare?'selected':''}`}><input type="checkbox" disabled={capturePhase!=='idle'} checked={bare} onChange={e=>setBare(e.target.checked)}/><svg className="confirmation-tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><span>已卸除底妆并关闭美颜（必选）</span></label>
    {!bare&&<p className="fine-note">请先卸除底妆并关闭美颜，再勾选确认，避免肤色推荐偏移。</p>}{error&&<p role="alert" className="error-note">{error}</p>}
    <p className="capture-status" aria-live="polite">{capturePhase!=='idle'?'拍摄完成，正在为你准备轮廓分析…':'确认已卸除底妆，且四项通过后，点击下一页。'}</p><button className="gold-cta" disabled={!active||!bare||!canContinueCapture(checks,bare)||capturePhase!=='idle'} onClick={nextPage}>下一页</button><button className="text-button sample-link" disabled={capturePhase!=='idle'} onClick={()=>{setResult({...sample});setPoints(null);stop();setStage(1);}}>使用示例体验</button>
   </>:result&&<>{result.source==='camera'&&<p className="fine-note" aria-live="polite">{active&&points?'实时跟随 · 数据已锁定':active?'暂未识别面部，测量线将在重新识别后恢复。':'摄像头已关闭，分析数据已保留。'}</p>}<span className="data-badge">{result.source==='sample'?'示例资料 · 不是你的分析':'AI 自动测量 · 比例与角度'}</span><h3>{result.shape}</h3><p>{result.features.join(' · ')}</p><div className="measure-list">{result.code.split('').map((n,i)=><div key={i}><b>{'ABCD'[i]}</b><span>{labels[i][+n-1]}</span></div>)}</div>
    <p className="fine-note">脸长 / 脸宽 {result.ratio.toFixed(2)} · 额头 / 下颌 {result.foreheadJaw.toFixed(2)}。发际线为估计位置，请将脸长上端点拖到真实发际线顶部。</p>
    {result.chinAngle!==undefined&&<div className="angle-summary"><span>下巴夹角 <b>{result.chinAngle.toFixed(1)}°</b></span><span>下颌角平均 <b>{result.jawAngle?.toFixed(1)}°</b></span></div>}
    <fieldset className="undertone-picker depth-picker"><legend>确认肤色深浅</legend><div className="depth-options">{[
     {name:'很浅',color:'#efcfbb'},{name:'浅',color:'#dcb799'},{name:'中等偏浅',color:'#c79b76'},{name:'中等',color:'#ab7955'},{name:'中深',color:'#855434'},{name:'深',color:'#583726'}
    ].map((t,i)=><button type="button" key={t.name} aria-pressed={result.depth===i} onClick={()=>setResult({...result,depth:i})}><span className="depth-swatch" style={{backgroundColor:t.color}} aria-hidden="true"/><strong>{t.name}</strong></button>)}</div></fieldset>
    <fieldset className="undertone-picker"><legend>确认底色</legend><div className="undertone-options">{[
     {value:'冷',note:'粉红 / 玫瑰',colors:['#d1a0a4','#b67a83']},
     {value:'中性',note:'粉黄均衡',colors:['#caa88e','#b38972']},
     {value:'暖',note:'金黄 / 蜜桃',colors:['#ddb283','#bf8c57']},
     {value:'橄榄',note:'灰绿 / 黄绿',colors:['#b2ad82','#8f9067']}
    ].map(t=><button type="button" key={t.value} aria-pressed={result.undertone===t.value} onClick={()=>setResult({...result,undertone:t.value})}><span className="undertone-swatches" aria-hidden="true">{t.colors.map(color=><span key={color} style={{backgroundColor:color}}/>)}</span><strong>{t.value}</strong><small>{t.note}</small></button>)}</div><button type="button" className="undertone-unsure" aria-pressed={result.undertone==='待确认'} onClick={()=>setResult({...result,undertone:'待确认'})}>不确定 · 先体验</button><p className="fine-note">色块仅示意底色倾向，不代表肤色深浅。</p></fieldset><div className="undertone-description" aria-live="polite"><b>{result.undertone}</b><p>{undertones[result.undertone]}</p><small>底色是皮肤的色调，和肤色深浅不同。请在自然光下看脸颊、颈部；血管颜色不能单独确定底色。</small></div>
    <button className="gold-cta" onClick={()=>onComplete(result)}>选择季节与场景</button><button className="text-button sample-link" onClick={()=>setStage(0,()=>{setCapturePhase('idle');phase.current='scan';locked.current=null;setResult(null);setPoints(null);if(!active)autoStarted.current=false;})}>重新拍摄</button>
   </>}
   
  </div></div>
 </section></></Translated>;
}
