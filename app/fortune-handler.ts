import {analyzeDaily} from './ai-fortune';
import {zodiacSigns,mbtiTypes} from './personal-match';
import {looks} from './face-engine';
export async function handleFortune(request:Request,config:{OPENAI_API_KEY?:string;OPENAI_MODEL?:string}){
 if(Number(request.headers.get('content-length')||0)>4000)return Response.json({error:'too_large'},{status:413});
 let input;try{input=await request.json();}catch{return Response.json({error:'invalid_input'},{status:400});}
 const sign=zodiacSigns.includes(input?.sign)?input.sign:'',mbti=mbtiTypes.includes(input?.mbti)?input.mbti:'';
 const occasion=['daily','work','date','beach','sport','party','dinner','newyear','halloween','festival'].includes(input?.occasion)?input.occasion:'daily';
 const favorites=Array.isArray(input?.favorites)?input.favorites.filter((id:unknown)=>typeof id==='string'&&looks.some(l=>l.id===id)).slice(0,12):[];
 const data=await analyzeDaily(config.OPENAI_API_KEY,config.OPENAI_MODEL,sign,mbti,occasion,favorites);
 return Response.json(data,{headers:{'Cache-Control':'no-store'}});
}
