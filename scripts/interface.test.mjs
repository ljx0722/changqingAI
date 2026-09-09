import { test, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';

// In-memory DOM tests. These do not launch a browser or claim GPU/visual coverage.
const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:'http://localhost/?view=reading',pretendToBeVisual:true});
for(const key of ['window','document','location','history','HTMLElement','HTMLDialogElement','Event','MouseEvent','KeyboardEvent'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
let copied='';Object.defineProperty(globalThis.navigator,'clipboard',{value:{writeText:async text=>{copied=text}}});
globalThis.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
globalThis.requestAnimationFrame=callback=>setTimeout(callback,0);
globalThis.cancelAnimationFrame=clearTimeout;
globalThis.IntersectionObserver=class{observe(){}disconnect(){}};
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
HTMLElement.prototype.scrollIntoView=function(){};
HTMLDialogElement.prototype.showModal=function(){this.open=true};
HTMLDialogElement.prototype.close=function(){this.open=false};
const {createElement,act}=await import('react');
const {createRoot}=await import('react-dom/client');
let App,root;
const click=async el=>{assert.ok(el,'Expected clickable element');await act(async()=>{el.dispatchEvent(new MouseEvent('click',{bubbles:true}))})};
const button=text=>[...document.querySelectorAll('button')].find(el=>el.textContent.includes(text));
const setInput=async(el,value)=>{await act(async()=>{const proto=el.tagName==='TEXTAREA'?dom.window.HTMLTextAreaElement.prototype:dom.window.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}))})};

before(async()=>{await mkdir('work/tests',{recursive:true});await build({entryPoints:['src/App.tsx'],outfile:'work/tests/app.mjs',bundle:true,platform:'node',format:'esm',packages:'external'});App=(await import(pathToFileURL(resolve('work/tests/app.mjs')).href)).default});
beforeEach(async()=>{history.replaceState(null,'','/?view=reading');copied='';root=createRoot(document.getElementById('root'));await act(async()=>root.render(createElement(App)))});
afterEach(async()=>{await act(async()=>root.unmount())});
after(()=>dom.window.close());

test('The complete page is readable without initializing any GPU',()=>{
  assert.ok(document.querySelector('h1').textContent.includes('让每一个想象'));
  assert.equal(document.querySelectorAll('.course-card').length,6);
  assert.equal(document.querySelectorAll('.product-row').length,6);
  assert.equal(document.querySelectorAll('.work-card').length,3);
  assert.ok(document.body.textContent.includes('上海长序逢晴智能科技有限公司'));
  assert.ok(document.querySelector('a[href="tel:17821821196"]'));
  assert.equal(document.querySelectorAll('canvas').length,0);
});
test('Audience switching, search, empty state and clearing work together',async()=>{
  await click(document.querySelector('#tab-adult'));
  assert.equal(document.querySelectorAll('.course-card').length,4);
  await setInput(document.querySelector('input[aria-label="搜索当前类别课程"]'),'视频');
  assert.equal(document.querySelectorAll('.course-card').length,1);
  await setInput(document.querySelector('input[aria-label="搜索当前类别课程"]'),'没有这个课程');
  assert.ok(document.querySelector('.empty-state'));
  await click(button('清空筛选'));
  assert.equal(document.querySelectorAll('.course-card').length,4);
  assert.ok(location.hash.includes('category=adult'));
});
test('A course detail can be shared, closed, and restored from its URL',async()=>{
  await click(document.querySelector('.course-cover'));
  assert.equal(location.hash,'#course/youth-film');
  assert.equal(document.querySelectorAll('.learning-path li').length,4);
  await click(button('复制课程链接'));
  assert.ok(copied.endsWith('#course/youth-film'));
  await click(document.querySelector('.close-button'));
  assert.equal(document.querySelectorAll('dialog').length,0);
  await act(async()=>{history.pushState(null,'','#course/career-ai-trainer');window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))});
  assert.ok(document.querySelector('dialog').textContent.includes('人工智能训练师'));
  assert.ok(document.querySelector('dialog').textContent.includes('拟申报'));
});
test('Course consultation carries its course into a local, honest contact summary',async()=>{
  await click(document.querySelector('.course-cover'));
  await click(button('咨询这门课程'));
  assert.equal(document.querySelector('input[placeholder="课程、产品或合作方向"]').value,'课程咨询：AI 微电影创作');
  await setInput(document.querySelector('textarea'),'为初中社团设计一学期课程');
  await act(async()=>document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
  assert.ok(document.querySelector('.inquiry-result').textContent.includes('清单已准备好'));
  await click(button('复制清单'));
  assert.ok(copied.includes('AI 微电影创作'));
  assert.ok(copied.includes('为初中社团设计一学期课程'));
  assert.ok(copied.includes('17821821196'));
  assert.ok(copied.includes('未向网站提交'));
});
test('A malformed course URL does not crash reading or contacts',async()=>{
  await act(async()=>{history.pushState(null,'','#course/%E0%A4%A');window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))});
  assert.ok(document.querySelector('h1'));
  assert.ok(document.querySelector('a[href="tel:17821821196"]'));
});
