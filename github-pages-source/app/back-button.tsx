import {Translated} from './i18n';
export default function BackButton({onClick}:{onClick:()=>void}){
 return <Translated><button type="button" className="flow-back" onClick={onClick}><svg viewBox="0 0 28 20" aria-hidden="true"><path d="M25 10H3M10 3L3 10L10 17" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg><span>返回上一页</span></button></Translated>;
}
