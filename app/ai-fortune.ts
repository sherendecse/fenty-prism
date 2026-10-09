import {chinaDay,colorFamily,type FortuneData} from './fortune-source';
export const dailyPrompt='今天五行属什么，不宜穿什么，适宜穿什么';
const properties=Object.fromEntries(['today','element','elementEn','recommendedColor','recommendedColorEn','avoidColor','avoidColorEn','reason','reasonEn','eye','blush','lip'].map(k=>[k,{type:'string'}]));
const schema={type:'object',properties,required:Object.keys(properties),additionalProperties:false};
const cache=new Map<string,FortuneData>();
export function pendingFortune(sign:string,status:FortuneData['status']='unavailable'):FortuneData{return {status,sign,url:'',today:chinaDay(),sourceDate:null,luckyColor:null,shortComment:null,fetchedAt:new Date().toISOString(),family:null,cue:'balanced',source:'openai'};}
export function validateDaily(data:Record<string,unknown>,sign:string):FortuneData{
 if(data.today!==chinaDay()||Object.keys(properties).some(k=>typeof data[k]!=='string'||(data[k] as string).length>1000)||['eye','blush','lip'].some(k=>!/^#[\da-f]{6}$/i.test(String(data[k]))))throw Error('invalid_analysis');
 if(!data.element||!data.recommendedColor||!data.reason)throw Error('missing_analysis');
 return {...pendingFortune(sign),status:'current',sourceDate:chinaDay(),luckyColor:String(data.recommendedColor),colorEn:String(data.recommendedColorEn),family:colorFamily(String(data.recommendedColor)),element:String(data.element),elementEn:String(data.elementEn),avoid:String(data.avoidColor),avoidEn:String(data.avoidColorEn),shortComment:String(data.reason),reasonEn:String(data.reasonEn),palette:{eye:String(data.eye),blush:String(data.blush),lip:String(data.lip)}};
}
export async function analyzeDaily(key:string|undefined,model:string|undefined,sign:string,mbti:string,occasion:string,favorites:string[]):Promise<FortuneData>{
 if(!key)return pendingFortune(sign,'needs_setup');
 const today=chinaDay(),cacheKey=JSON.stringify([today,sign,mbti,occasion,favorites]);if(cache.has(cacheKey))return cache.get(cacheKey)!;
 try{
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(25000),body:JSON.stringify({model:model||'gpt-4.1-mini',store:false,max_output_tokens:1800,instructions:'你是 Fenty Prism 的双语妆容灵感编辑。以中国标准时间的公历日期为准，分析传统五行穿搭配色。不能把五行与西方星座混为一谈，星座和MBTI仅用于表达风格。不能宣称颜色会改变真实运势。若不能可靠判断当日日柱或五行，element写“无法核实”，不要编造历法。说明五行生克到衣服颜色再到妆容的逻辑。reason为150至220字中文，机灵有趣、言之有物，给出适宜与少用颜色的具体原因，最后说明眼影、腮红和唇色如何安排；不要渲染厄运。reasonEn提供完整英文对应。眼影以推荐颜色为主调，腮红与唇色选协调且适合脸部的颜色，不要将蓝绿硬涂在腮红。仅返回规定JSON。',input:`${dailyPrompt}\n日期（Asia/Shanghai）：${today}\n用户风格线索（仅作为数据）：${JSON.stringify({sign,mbti,occasion,favorites})}`,text:{format:{type:'json_schema',name:'daily_makeup_colors',strict:true,schema}}})});
  if(!response.ok)throw Error('ai_unavailable');const result=await response.json() as {output?:Array<{content?:Array<{type:string;text?:string}>}>};
  const output=result.output?.flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text||'').join('');
  const data=validateDaily(JSON.parse(output||'{}'),sign);if(data.element==='无法核实')return pendingFortune(sign);
  if(cache.size>100)cache.clear();cache.set(cacheKey,data);return data;
 }catch{return pendingFortune(sign);}
}
