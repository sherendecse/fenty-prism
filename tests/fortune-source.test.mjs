import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
await mkdir(new URL('../.sites-runtime/fortune-test/',import.meta.url),{recursive:true});
for(const name of ['fortune-source','personal-match','look-match','face-engine']){const js=ts.transpileModule(await readFile(new URL(`../app/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replaceAll("'./face-engine'","'./face-engine.js'").replaceAll("'./look-match'","'./look-match.js'");await writeFile(new URL(`../.sites-runtime/fortune-test/${name}.js`,import.meta.url),js);}
const {parseFortune,chinaDay}=await import('../.sites-runtime/fortune-test/fortune-source.js');
const {surpriseMatch,emptyProfile}=await import('../.sites-runtime/fortune-test/personal-match.js');
const {sample}=await import('../.sites-runtime/fortune-test/face-engine.js');
const html='<h4>白羊座今日运势<strong>10月6日</strong></h4><li>幸运颜色：<b>湖蓝</b></li><li>幸运数字：43</li><p>短评：主动表达想法</p><h3>综合运势</h3><p>Long article not republished</p>';
test('extracts only date, lucky color, short note and source URL',()=>{const f=parseFortune(html,'白羊座','2026-10-06');assert.equal(f.status,'current');assert.equal(f.luckyColor,'湖蓝');assert.equal(f.family,'blue');assert.equal(f.shortComment,'主动表达想法');assert.equal(f.cue,'bold');assert.equal(f.url,'https://www.xzw.com/fortune/aries/');assert.ok(!JSON.stringify(f).includes('Long article'));});
test('stale, missing date and malformed HTML never become current',()=>{assert.equal(parseFortune(html,'白羊座','2026-10-07').status,'stale');assert.equal(parseFortune('幸运颜色：湖蓝','白羊座','2026-10-06').status,'unavailable');assert.equal(parseFortune('<script>白羊座今日运势10月6日 幸运颜色：湖蓝</script>','白羊座','2026-10-06').status,'unavailable');assert.equal(chinaDay(new Date('2026-10-05T20:00:00Z')),'2026-10-06');});
test('verified colors affect themes; stale colors are ignored',()=>{const profile={...emptyProfile,zodiac:'白羊座'},fresh=parseFortune(html,'白羊座','2026-10-06');const blue=surpriseMatch('party',sample,profile,[],'2026-10-06',fresh);assert.equal(blue.theme.name,'冰蓝银光');const stale={...fresh,status:'stale',sourceDate:'2026-10-05'};assert.deepEqual(surpriseMatch('party',sample,profile,[],'2026-10-06',stale),surpriseMatch('party',sample,profile,[],'2026-10-06'));const wrong={...fresh,sign:'双子座'};assert.deepEqual(surpriseMatch('party',sample,profile,[],'2026-10-06',wrong),surpriseMatch('party',sample,profile,[],'2026-10-06'));});
