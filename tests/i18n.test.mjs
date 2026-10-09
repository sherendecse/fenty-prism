import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createElement} from 'react';
await mkdir(new URL('../.sites-runtime/i18n-test/',import.meta.url),{recursive:true});
for(const name of ['translations','i18n']){
 const source=await readFile(new URL(`../app/${name}.${name==='i18n'?'tsx':'ts'}`,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText.replace("'./translations'","'./translations.js'");
 await writeFile(new URL(`../.sites-runtime/i18n-test/${name}.js`,import.meta.url),js);
}
const {translateText,translatedTree}=await import('../.sites-runtime/i18n-test/i18n.js');
test('English covers interface text, products, guidance and errors while Chinese remains unchanged',async()=>{
 for(const filename of ['lottery.tsx','birthday-picker.tsx','fortune-details.tsx','profile-form.tsx','personal-match.ts','prism-portrait.tsx','face-measurement-overlay.tsx','page.tsx','scan.tsx','recipe.tsx','studio-placeholder.tsx','back-button.tsx','hold-compare.tsx','face-engine.ts','look-match.ts','makeup-renderer.ts','halloween-paint.ts']){
  const source=ts.createSourceFile(filename,await readFile(new URL('../app/'+filename,import.meta.url),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  function visit(n){
   if(ts.isStringLiteral(n)||ts.isJsxText(n)||ts.isNoSubstitutionTemplateLiteral(n)||ts.isTemplateHead(n)||ts.isTemplateMiddle(n)||ts.isTemplateTail(n)){
    const text=n.text.trim();if(/[\u4e00-\u9fff]/.test(text)&&text!=='万象'){
     assert.equal(translateText(text,'zh'),text);
     assert.equal(/[\u4e00-\u9fff]/.test(translateText(text,'en')),false,`${filename}: ${text}`);
    }
   }ts.forEachChild(n,visit);
  }visit(source);
 }
 assert.equal(translateText('中性底色','en'),'Neutral undertone');
});
test('translation preserves camera element identity, events, option values and measurement styles',()=>{
 const handler=()=>{},style={left:'40%',top:'50%'};
 const node=createElement('button',{key:'compare',onPointerDown:handler,style,'aria-label':'按住查看素颜'},'按住查看素颜');
 const en=translatedTree(node,'en');assert.equal(en.type,node.type);assert.equal(en.key,node.key);assert.equal(en.props.onPointerDown,handler);assert.equal(en.props.style,style);assert.equal(en.props['aria-label'],'Hold to see bare skin');assert.equal(en.props.children[0],'Hold to see bare skin');
 const option=translatedTree(createElement('option',{value:'暖'},'暖 · 偏金黄 / 蜜桃'),'en');assert.equal(option.props.value,'暖');assert.equal(option.props.children[0],'Warm · Gold / Peach');
});
