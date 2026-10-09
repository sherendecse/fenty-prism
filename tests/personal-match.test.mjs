import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
await mkdir(new URL('../.sites-runtime/personal-test/',import.meta.url),{recursive:true});
for(const name of ['face-engine','look-match','personal-match','translations','i18n']){
 const js=ts.transpileModule(await readFile(new URL(`../app/${name}.${name==='i18n'?'tsx':'ts'}`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText.replaceAll("'./face-engine'","'./face-engine.js'").replaceAll("'./look-match'","'./look-match.js'").replaceAll("'./translations'","'./translations.js'");
 await writeFile(new URL(`../.sites-runtime/personal-test/${name}.js`,import.meta.url),js);
}
const {surpriseMatch,emptyProfile,zodiacFromBirthday}=await import('../.sites-runtime/personal-test/personal-match.js');
const {sample}=await import('../.sites-runtime/personal-test/face-engine.js');
const {translateText}=await import('../.sites-runtime/personal-test/i18n.js');
test('birthday boundaries and leap-day signs',()=>{assert.equal(zodiacFromBirthday('2000-01-19'),'摩羯座');assert.equal(zodiacFromBirthday('2000-01-20'),'水瓶座');assert.equal(zodiacFromBirthday('2000-02-29'),'双鱼座');assert.equal(zodiacFromBirthday(''),'');});
test('same day and preferences remain reproducible, date changes daily theme',()=>{const p={...emptyProfile,zodiac:'狮子座',mbti:'ENFP'};const a=surpriseMatch('daily',sample,p,[],'2026-10-06');assert.deepEqual(a,surpriseMatch('daily',sample,p,[],'2026-10-06'));assert.ok(new Set(Array.from({length:20},(_,i)=>surpriseMatch('daily',sample,p,[],`2026-10-${i+1}`).theme.name)).size>1);assert.equal(/[\u4e00-\u9fff]/.test(translateText(a.reason,'en')),false);});
test('favorites and MBTI influence choices while event requirements remain first',()=>{let changedByFavorites=false,changedByMbti=false;for(let day=1;day<=31;day++){const d=`2026-10-${String(day).padStart(2,'0')}`;const base=surpriseMatch('daily',sample,emptyProfile,[],d);const favorite=surpriseMatch('daily',sample,emptyProfile,[{lookId:'autumn'},{lookId:'autumn'}],d);changedByFavorites ||= base.id!==favorite.id;changedByMbti ||= surpriseMatch('party',sample,{...emptyProfile,mbti:'ISTJ'},[],d).id!==surpriseMatch('party',sample,{...emptyProfile,mbti:'ENFP'},[],d).id;for(const [scene,id] of [['sport','sport'],['halloween','graphic'],['newyear','winter']])assert.equal(surpriseMatch(scene,sample,{...emptyProfile,mbti:'ENFP'},[{lookId:'color'}],d).id,id);}assert.ok(changedByFavorites);assert.ok(changedByMbti);});
