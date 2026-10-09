import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
await mkdir(new URL('../.sites-runtime/preference-test/',import.meta.url),{recursive:true});
for(const name of ['freckle-patterns','lot-reading','live-measurements','capture-progress','makeup-fields','face-engine','look-match','face-placement','halloween-paint','makeup-renderer','preference-match']){
 const source=await readFile(new URL(`../app/${name}.ts`,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.\/[^']+)'/g,"from '$1.js'");
 await writeFile(new URL(`../.sites-runtime/preference-test/${name}.js`,import.meta.url),js);
}
const {preferenceMatch,lookDifficulty,colorChoices}=await import('../.sites-runtime/preference-test/preference-match.js');
const {sample}=await import('../.sites-runtime/preference-test/face-engine.js');
const profile={name:'',birthday:'',zodiac:'',mbti:'',skill:'beginner',minutes:'5',likedColors:[],avoidedColors:[]};
test('short beginner looks stay simple and within the time budget across ordinary and blind-box flows',()=>{
 for(const season of ['spring','summer','autumn','winter','surprise'])for(const occasion of ['work','daily','party','halloween','festival','sport'])for(const number of [1,19,67,99]){
 const r=preferenceMatch(season,occasion,sample,profile,[],number);assert.equal(lookDifficulty(r.id),1);assert.ok(r.minutes<=5);assert.ok(r.palette.eye);assert.ok(r.poem);
 }
});
test('experienced users can receive a more complex look at the same short budget',()=>{
 const novice=preferenceMatch('autumn','work',sample,profile,[]);
 const expert=preferenceMatch('autumn','work',sample,{...profile,skill:'expert'},[]);
 assert.ok(lookDifficulty(expert.id)>lookDifficulty(novice.id));assert.ok(expert.minutes<=5);
});
test('loved colors take precedence, avoided families never become the selected palette, including repeated draws',()=>{
 for(const avoided of colorChoices)for(let n=1;n<=99;n++){
 const liked=colorChoices.find(c=>c.id!==avoided.id).id;
 const r=preferenceMatch('surprise','party',sample,{...profile,skill:'expert',minutes:'20',likedColors:[liked],avoidedColors:[avoided.id]},[],n);
 assert.equal(r.colorFamily,liked);assert.notEqual(r.colorFamily,avoided.id);
 }
});
test('the lottery is repeatable for a draw, has bilingual verse and explanation, and stays local',()=>{
 const a=preferenceMatch('surprise','daily',sample,profile,[],42),b=preferenceMatch('surprise','daily',sample,profile,[],42);assert.deepEqual(a,b);assert.equal(a.number,42);assert.equal(a.poem.split('\n').length,4);assert.ok(a.poemEn);assert.ok(a.interpretationEn);assert.doesNotMatch(a.reason,/API|五行|暂未/);
});

const {lotReading}=await import('../.sites-runtime/preference-test/lot-reading.js');
test('all 101 numbers have stable, distinct bilingual readings and four-line verses',()=>{
 const all=Array.from({length:101},(_,i)=>lotReading(i+1));
 for(const key of ['poem','poemEn','interpretation','interpretationEn'])assert.equal(new Set(all.map(r=>r[key])).size,101,key);
 for(let n=1;n<=101;n++){assert.deepEqual(lotReading(n),lotReading(n));assert.equal(lotReading(n).poem.split('\n').length,4);}
});
test('bold change ignores color preferences, MBTI and favorites, while keeping skill and time',()=>{
 const p={...profile,skill:'expert',minutes:'20',change:'big'};
 const plain=preferenceMatch('surprise','party',sample,p,[],101);
 const extra=preferenceMatch('surprise','party',sample,{...p,mbti:'ISTJ',likedColors:['brown'],avoidedColors:['purple','silver']},[{lookId:'inclusive'}],101);
 assert.deepEqual(extra,plain);assert.ok(plain.minutes<=20);assert.equal(plain.number,101);
});

test('blind-box draws retain the selected season and remain repeatable',()=>{
 const p={...profile,skill:'expert',minutes:'30'};
 const spring=preferenceMatch('spring','daily',sample,p,[],42);
 const winter=preferenceMatch('winter','daily',sample,p,[],42);
 assert.notEqual(spring.id,winter.id);
 for(const season of ['spring','summer','autumn','winter']){
  const draw=preferenceMatch(season,'daily',sample,p,[],42);
  assert.equal(draw.number,42);
  assert.deepEqual(draw,preferenceMatch(season,'daily',sample,p,[],42));
 }
});
