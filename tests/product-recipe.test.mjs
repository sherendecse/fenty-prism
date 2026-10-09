import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
await mkdir(new URL('../.sites-runtime/product-test/',import.meta.url),{recursive:true});
for(const name of ['translations','i18n','face-engine','freckle-patterns','recipe']){
 const source=await readFile(new URL(`../app/${name}.${['i18n','recipe'].includes(name)?'tsx':'ts'}`,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText.replaceAll("'./translations'","'./translations.js'").replaceAll("'./i18n'","'./i18n.js'").replaceAll("'./face-engine'","'./face-engine.js'").replaceAll("'./freckle-patterns'","'./freckle-patterns.js'");
 await writeFile(new URL(`../.sites-runtime/product-test/${name}.js`,import.meta.url),js);
}
const {ProductRecipe,lookProductPalette}=await import('../.sites-runtime/product-test/recipe.js');
const {looks,sample}=await import('../.sites-runtime/product-test/face-engine.js');
test('all look/depth combinations use exactly the same shades in cards and tutorials',()=>{
 for(const look of looks)for(let depth=0;depth<6;depth++){
  const a={...sample,depth},p=lookProductPalette(look.id,a);
  const html=renderToStaticMarkup(createElement(ProductRecipe,{analysis:a,lookId:look.id,finish:'glow',onFinish:()=>{}}));
  for(const shade of [p.lip,p.blush,p.eye]){const encoded=renderToStaticMarkup(createElement('span',null,shade)).slice(6,-7);assert.ok(html.split(encoded).length>=3,`${look.id}: ${shade}`);}
  assert.equal(p.lip==='The MVP',['winter','red','graphic'].includes(look.id));
  if(look.id==='color')assert.equal(p.lip,'Fuchsia Flex');
 }
});

test('freckle product and tutorial follow the selected pattern and intensity',()=>{
 const props={analysis:sample,lookId:'spring',finish:'glow',onFinish:()=>{}};
 const plain=renderToStaticMarkup(createElement(ProductRecipe,props));assert.ok(!plain.includes('08 / 雀斑点画'));
 const added=renderToStaticMarkup(createElement(ProductRecipe,{...props,freckles:true,frecklePattern:2,freckleIntensity:80}));
 assert.ok(added.includes('08 / 雀斑点画'));assert.ok(added.includes('鼻梁细点'));assert.ok(added.includes('80'));assert.ok(added.includes('增加点数与深浅对比'));
 const patterned=renderToStaticMarkup(createElement(ProductRecipe,{...props,lookId:'graphic',freckles:true}));assert.ok(!patterned.includes('08 / 雀斑点画'));
});
