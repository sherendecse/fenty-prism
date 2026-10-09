'use client';
import {LocalizedText,Translated} from './i18n';
import type {FortuneData} from './fortune-source';
const familyEnglish={pink:'Pink / rose',peach:'Peach / coral',brown:'Brown / nude',blue:'Blue / cyan',purple:'Purple',gold:'Gold / yellow',red:'Red',green:'Green',neutral:'Neutral'};
export default function FortuneDetails({data}:{data:FortuneData|null}){
 return <Translated><div className="fortune-details"><h3>今日五行 · 配色灵感</h3>{data?.status==='current'?<><small>中国时间 · {data.today}</small><p>今日五行：<LocalizedText zh={data.element||''} en={data.elementEn||''}/></p><p>适宜穿搭：<LocalizedText zh={data.luckyColor||''} en={data.colorEn||(data.family?familyEnglish[data.family]:'')}/></p><p>建议少用：<LocalizedText zh={data.avoid||''} en={data.avoidEn||''}/></p><h4>为什么这样配？</h4><p><LocalizedText zh={data.shortComment||''} en={data.reasonEn||''}/></p></>:<p>{data?.status==='needs_setup'?'AI 分析尚未连接，本次先按场景与个人偏好推荐。':'AI 当天分析暂未生成，本次先按场景与个人偏好推荐。'}</p>}<p className="fine-note">五行用于传统文化与娱乐配色灵感；星座、MBTI 与收藏作为风格线索。</p></div></Translated>;
}
