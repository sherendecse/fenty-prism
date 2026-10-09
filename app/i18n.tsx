'use client';
import {Children,cloneElement,createContext,isValidElement,useContext,useEffect,useState,type ReactNode} from 'react';
import {english} from './translations';
type Language='zh'|'en';
const LanguageContext=createContext<{language:Language;setLanguage:(l:Language)=>void}>({language:'zh',setLanguage:()=>{}});
export function LanguageProvider({children}:{children:ReactNode}){
 const [language,setLanguage]=useState<Language>('zh');
 useEffect(()=>{const saved=localStorage.getItem('fenty-prism-language');if(saved==='en')setLanguage('en');},[]);
 const choose=(l:Language)=>{setLanguage(l);localStorage.setItem('fenty-prism-language',l);};
 useEffect(()=>{document.documentElement.lang=language==='en'?'en':'zh-CN';},[language]);
 return <LanguageContext.Provider value={{language,setLanguage:choose}}>{children}</LanguageContext.Provider>;
}
const entries=Object.entries(english).sort((a,b)=>b[0].length-a[0].length);
export function translateText(text:string,language:Language){
 if(language==='zh')return text;
 const clean=text.trim();if(english[clean])return text.replace(clean,english[clean]);
 let result=text;for(const [zh,en] of entries)if(result.includes(zh))result=result.split(zh).join(en);
 return result.replaceAll('、',', ').replaceAll('，',', ').replaceAll('。','. ').replaceAll('；','; ').replaceAll('：',': ').replaceAll('（',' (').replaceAll('）',')');
}
export function translatedTree(node:ReactNode,language:Language):ReactNode{
 if(typeof node==='string')return translateText(node,language);
 if(!isValidElement<Record<string,unknown>>(node))return node;
 const props:Record<string,unknown>={};
 for(const key of ['title','subtitle','aria-label','placeholder','alt'])if(typeof node.props[key]==='string')props[key]=translateText(node.props[key] as string,language);
 if(node.props.children!==undefined)props.children=Children.map(node.props.children as ReactNode,n=>translatedTree(n,language));
 return cloneElement(node,props);
}
export function Translated({children}:{children:ReactNode}){const {language}=useContext(LanguageContext);return <>{Children.map(children,n=>translatedTree(n,language))}</>;}
export function LanguageSwitcher(){const {language,setLanguage}=useContext(LanguageContext);return <div className="language-switch" role="group" aria-label="Language / 语言"><button type="button" lang="zh" aria-pressed={language==='zh'} onClick={()=>setLanguage('zh')}>中文</button><button type="button" lang="en" aria-pressed={language==='en'} onClick={()=>setLanguage('en')}>EN</button></div>;}

export function PrismHeadlineWord(){const {language}=useContext(LanguageContext);return <em className="prism-word">{language==='en'?'possibilities':'万象'}</em>;}

export function LocalizedText({zh,en}:{zh:string;en:string}){const {language}=useContext(LanguageContext);return <>{language==='en'?en:zh}</>;}
