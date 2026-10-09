'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {Translated} from './i18n';
type Parts={day:number|null;month:number|null;year:number|null};
const parse=(value:string):Parts=>{const [year,month,day]=value.split('-').map(Number);return {day:day||null,month:month||null,year:year||null};};
export function normalizeBirthday(parts:Parts,today=new Date()):Parts{
 const year=parts.year===null?null:Math.max(1900,Math.min(today.getFullYear(),parts.year));
 const maxMonth=year===today.getFullYear()?today.getMonth()+1:12;
 const month=parts.month===null?null:Math.max(1,Math.min(maxMonth,parts.month));
 const maxDay=year===today.getFullYear()&&month===today.getMonth()+1?today.getDate():new Date(year??2000,month??1,0).getDate();
 return {year,month,day:parts.day===null?null:Math.max(1,Math.min(maxDay,parts.day))};
}
const numbers=(count:number)=>Array.from({length:count},(_,i)=>i+1);
function NumberWheel({label,values,value,onChange}:{label:string;values:number[];value:number|null;onChange:(value:number|null)=>void}){
 const id=useId(),list=useRef<HTMLDivElement>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const options=[null,...values],selected=Math.max(0,options.indexOf(value));
 const animated=useRef(false);
 const latest=useRef({options,value,onChange});latest.current={options,value,onChange};
 const rowHeight=()=>list.current?.querySelector<HTMLElement>('[role="option"]')?.offsetHeight||48;
 const move=(index:number)=>{const element=list.current;if(!element)return;const current=latest.current;const next=Math.max(0,Math.min(current.options.length-1,index));animated.current=current.options[next]!==current.value;current.onChange(current.options[next]);element.scrollTo({top:next*rowHeight(),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
 useEffect(()=>{if(animated.current){animated.current=false;return;}if(list.current)list.current.scrollTop=selected*rowHeight();},[selected,values.length]);
 useEffect(()=>{const element=list.current;if(!element)return;const observer=new ResizeObserver(()=>{const current=latest.current;element.scrollTop=Math.max(0,current.options.indexOf(current.value))*rowHeight();});observer.observe(element);return()=>observer.disconnect();},[]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 return <Translated><div className="birthday-column"><span id={`${id}-label`} className="birthday-column-label">{label}</span><div className="birthday-wheel-frame"><div className="birthday-selection-band" aria-hidden="true"/><div ref={list} className="birthday-wheel" role="listbox" tabIndex={0} aria-labelledby={`${id}-label`} aria-activedescendant={`${id}-${selected}`} onKeyDown={e=>{
  const steps:Record<string,number>={ArrowDown:1,ArrowUp:-1,PageDown:10,PageUp:-10};
  if(e.key in steps){e.preventDefault();move(selected+steps[e.key]);}else if(e.key==='Home'||e.key==='End'){e.preventDefault();move(e.key==='Home'?0:options.length-1);}
 }} onScroll={()=>{if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{const element=list.current;if(!element)return;const current=latest.current;const index=Math.max(0,Math.min(current.options.length-1,Math.round(element.scrollTop/rowHeight())));if(current.options[index]!==current.value)current.onChange(current.options[index]);},160);}}>{options.map((n,i)=><button type="button" role="option" id={`${id}-${i}`} key={n??'empty'} tabIndex={-1} aria-selected={n===value} onClick={()=>move(i)}>{n===null?'—':String(n).padStart(label==='年'?4:2,'0')}</button>)}</div></div></div></Translated>;
}
export default function BirthdayPicker({value,onChange}:{value:string;onChange:(value:string)=>void}){
 const [parts,setParts]=useState(()=>parse(value)),lastEmitted=useRef(value),today=new Date();
 useEffect(()=>{if(value!==lastEmitted.current){lastEmitted.current=value;setParts(parse(value));}},[value]);
 const choose=(key:keyof Parts,n:number|null)=>{const next=normalizeBirthday({...parts,[key]:n});setParts(next);const date=next.year&&next.month&&next.day?`${next.year}-${String(next.month).padStart(2,'0')}-${String(next.day).padStart(2,'0')}`:'';lastEmitted.current=date;onChange(date);};
 return <Translated><div className="birthday-picker" role="group" aria-label="生日"><span className="birthday-title">生日</span><div className="birthday-wheels"><NumberWheel label="日" values={numbers(31)} value={parts.day} onChange={n=>choose('day',n)}/><NumberWheel label="月" values={numbers(12)} value={parts.month} onChange={n=>choose('month',n)}/><NumberWheel label="年" values={Array.from({length:today.getFullYear()-1899},(_,i)=>today.getFullYear()-i)} value={parts.year} onChange={n=>choose('year',n)}/></div><small>上下滚动或点击数字，分别选择日、月、年。</small></div></Translated>;
}
