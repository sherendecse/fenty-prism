'use client';
import {Translated} from './i18n';
import {useEffect,useState} from 'react';
export default function HoldCompare({onChange}:{onChange:(held:boolean)=>void}){
 const [held,setHeld]=useState(false);
 const release=()=>{setHeld(false);onChange(false);};
 useEffect(()=>{
  const cancel=()=>{setHeld(false);onChange(false);};
  window.addEventListener('blur',cancel);document.addEventListener('visibilitychange',cancel);
  return()=>{window.removeEventListener('blur',cancel);document.removeEventListener('visibilitychange',cancel);onChange(false);};
 },[onChange]);
 return <Translated><button type="button" className="hold-compare" aria-pressed={held} aria-label="按住查看素颜，松开恢复试妆；键盘可按住空格或回车" onPointerDown={e=>{if(e.button!==0||!e.isPrimary)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);setHeld(true);onChange(true);}} onPointerUp={e=>{release();if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={release} onLostPointerCapture={release} onBlur={release} onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!e.repeat){setHeld(true);onChange(true);}}}} onKeyUp={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();release();}}} onContextMenu={e=>e.preventDefault()}>{held?'松开恢复试妆':'按住查看素颜'}</button></Translated>;
}
