'use client';
import {useEffect,useId,useState,type CSSProperties} from 'react';
import {Translated} from './i18n';
const people=[
 'east-asian-man-left35','asian-woman-right',
 'dark-skinned-man-left','fair-woman-right35',
 'prism-head-1','prism-head-6',
];
export default function PrismPortrait(){
 const id=useId().replaceAll(':',''),[reduced,setReduced]=useState(false);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)'),update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 return <Translated><div className="prism-portrait" role="group" aria-label="六种不同肤色与脸部特点的头像轮播"><div className="prism-head-stage">
  <div className="prism-aura" aria-hidden="true"/>
  <svg className="prism-x-orbits" viewBox="0 0 400 480" aria-hidden="true">{[-48,48].map((angle,i)=><g key={angle} transform={`rotate(${angle} 200 240)`}><path id={`${id}-track-${i}`} d="M 430 240 A 230 135 0 1 1 -30 240 A 230 135 0 1 1 430 240" className="prism-x-line"/><circle className="prism-travel-light" r="3">{!reduced&&<animateMotion dur={i?'11s':'8s'} begin={i?'-4s':'0s'} repeatCount="indefinite"><mpath href={`#${id}-track-${i}`}/></animateMotion>}</circle></g>)}</svg>
  {people.map((asset,person)=><div className={`prism-person person-${person}`} key={asset} style={{animationDelay:`${person*2-12}s`}} aria-hidden="true">
   <img className="prism-fixed-view" src={`/images/${asset}.webp`} alt="" width="512" height="640" fetchPriority={person===0?'high':'low'}/>
  </div>)}
  <div className="prism-stars" aria-hidden="true">{[{x:8,y:24,s:11,d:0},{x:84,y:12,s:7,d:1.5},{x:93,y:62,s:13,d:3},{x:12,y:91,s:6,d:.8}].map((star,k)=><span key={k} style={{left:`${star.x}%`,top:`${star.y}%`,width:star.s,height:star.s,animationDelay:`-${star.d}s`} as CSSProperties}/>)}</div>
 </div></div></Translated>;
}
