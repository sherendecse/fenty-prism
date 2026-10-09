import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
await mkdir(new URL('../.sites-runtime/lottery-test/',import.meta.url),{recursive:true});
for(const [name,ext] of [['lottery','tsx'],['i18n','tsx'],['translations','ts'],['dice-reading','ts'],['cup-reading','ts']]){
 const source=await readFile(new URL(`../app/${name}.${ext}`,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText.replace(/from '(\.\/[^']+)'/g,"from '$1.js'");
 await writeFile(new URL(`../.sites-runtime/lottery-test/${name}.js`,import.meta.url),js);
}
const {default:Lottery,stickTimeline,diceTimeline,cupTimeline}=await import('../.sites-runtime/lottery-test/lottery.js');
const {diceReading}=await import('../.sites-runtime/lottery-test/dice-reading.js');
const base={number:101,name:'Test look',palette:{eye:'#aaaaaa',blush:'#bbbbbb',lip:'#cccccc'},poem:'Verse',poemEn:'Verse',interpretation:'Reading',interpretationEn:'Reading',reason:'Reason',reasonEn:'Reason'};
test('stick holds for 1 second then shrinks and moves together for 2 seconds',()=>{
 const t=Object.fromEntries(stickTimeline);assert.equal(t.move-t.bigHold,1000);assert.equal(t.reveal-t.move,2000);assert.equal(t.bigHold-t.grow,2000);assert.equal(t.shrink,undefined);
});
test('dice roll 2 seconds, grow 2 seconds, hold 1 second, then shrink and move for 2 seconds',()=>{
 const t=Object.fromEntries(diceTimeline);assert.equal(t.grow,2000);assert.equal(t.bigHold-t.grow,2000);assert.equal(t.move-t.bigHold,1000);assert.equal(t.reveal-t.move,2000);assert.equal(t.shrink,undefined);
});
test('all 36 ordered dice pairs have distinct, stable bilingual explanations',()=>{
 const results=[];for(let a=1;a<=6;a++)for(let b=1;b<=6;b++){const r=diceReading(a,b);assert.deepEqual(r,diceReading(a,b));results.push(r);}
 assert.equal(new Set(results.map(r=>r.interpretation)).size,36);assert.equal(new Set(results.map(r=>r.interpretationEn)).size,36);
});
test('returning to the game renders the saved number or dice with the same interpretation',()=>{
 const props={onDraw:()=>{throw Error('must not reroll')},onContinue:()=>{}};
 const stick=renderToStaticMarkup(createElement(Lottery,{...props,result:base}));assert.match(stick,/lottery-reveal/);assert.match(stick,/>101</);assert.match(stick,/Reading/);assert.match(stick,/重新抽签/);assert.match(stick,/选择其他盲盒玩法/);
 const dice=renderToStaticMarkup(createElement(Lottery,{...props,result:{...base,dice:[1,4]}}));assert.match(dice,/game-dice/);assert.equal((dice.match(/class="game-die red-pips"/g)||[]).length,2);assert.equal((dice.match(/data-result="true">([\s\S]*?)<\/div><\/div>/g)||[]).reduce((n,face)=>n+(face.match(/class="visible"/g)||[]).length,0),5);assert.equal((dice.match(/class="die-face /g)||[]).length,12);assert.match(dice,/重新掷骰子/);assert.match(dice,/选择其他盲盒玩法/);assert.equal((dice.match(/face-4 [^"]*" data-result="true"/g)||[]).length,2);
 const dark=renderToStaticMarkup(createElement(Lottery,{...props,result:{...base,dice:[2,6]}}));assert.equal((dark.match(/data-result="true">([\s\S]*?)<\/div><\/div>/g)||[]).reduce((n,face)=>n+(face.match(/class="visible"/g)||[]).length,0),8);assert.doesNotMatch(dark,/game-die red-pips/);
});

test('cup toss shakes three times, drops, grows 2 seconds, holds 1 second then shrinks and slides 2 seconds',()=>{
 const t=Object.fromEntries(cupTimeline);assert.equal(t.drop,1800);assert.equal(t.grow-t.drop,1000);assert.equal(t.bigHold-t.grow,2000);assert.equal(t.move-t.bigHold,1000);assert.equal(t.reveal-t.move,2000);
});
test('all four cup outcomes render the saved matching interpretation and replay actions',()=>{
 for(let cup=0;cup<4;cup++){const html=renderToStaticMarkup(createElement(Lottery,{result:{...base,cup},onDraw:()=>{throw Error('unexpected draw')},onContinue:()=>{}}));assert.match(html,/game-cup/);assert.match(html,/Reading/);assert.match(html,/重新抽签/);assert.match(html,/选择其他盲盒玩法/);assert.equal((html.match(/class="cup-orbit /g)||[]).length,2);}
});

test('closed image cannot displace either cup half animation selector',async()=>{
 const html=renderToStaticMarkup(createElement(Lottery,{result:{...base,cup:0},onDraw:()=>base,onContinue:()=>{}}));
 assert.ok(html.includes('cup-closed-v3.webp'));assert.ok(html.includes('cup-left'));assert.ok(html.includes('cup-right'));
 const css=await readFile(new URL('../app/globals.css',import.meta.url),'utf8');
 assert.ok(!css.includes('.cup-orbit:first-child'));assert.ok(!css.includes('.cup-orbit:last-child'));
 for(const side of ['left','right'])assert.ok(css.includes(`.lottery-drop .cup-orbit.cup-${side}{animation:cup-open-${side} 1s ease-out both,cup-halves-appear 1s linear both}`));
 assert.ok(css.includes('@keyframes cup-halves-appear{0%,100%{opacity:1}}'));
});
