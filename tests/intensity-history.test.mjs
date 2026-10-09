import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../app/intensity-history.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {IntensityHistory}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const initial={eye:54,blush:48,glow:58,lip:58,liner:48,contour:36,art:62,level:1};
test('a continuous makeup drag restores the starting strength in one undo',()=>{
 const history=new IntensityHistory();history.change('eye',initial);
 history.change('eye',{...initial,eye:75});history.change('eye',{...initial,eye:90});
 assert.equal(history.count,1);assert.deepEqual(history.undo(),initial);assert.equal(history.count,0);
});
test('reset freckles from 85 to 60, then undo makeup without reviving 85',()=>{
 const history=new IntensityHistory(),state={...initial,freckle:85};
 history.change('eye',state);state.eye=90;history.endGesture();
 state.freckle=60;Object.assign(state,history.undo());
 assert.equal(state.freckle,60);assert.equal(state.eye,54);assert.equal(history.count,0);
});
test('separate drags, resets and all seven makeup controls can be undone',()=>{
 for(const control of ['eye','blush','glow','lip','liner','contour','art']){
  const history=new IntensityHistory();history.change(control,initial);history.endGesture();
  const changed={...initial,[control]:95};history.change(control,changed);history.endGesture();
  const changedAgain={...initial,[control]:20};history.record(changedAgain);
  assert.deepEqual(history.undo(),changedAgain);assert.deepEqual(history.undo(),changed);assert.deepEqual(history.undo(),initial);
 }
});
test('new looks clear history and snapshots are not mutated by later edits',()=>{
 const history=new IntensityHistory(),snapshot={...initial};history.record(snapshot);snapshot.eye=0;
 assert.equal(history.undo().eye,54);history.record(initial);history.clear();assert.equal(history.count,0);assert.equal(history.undo(),undefined);
});
