import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const output='../verification/round-5';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
try{
for(const [name,options] of Object.entries({desktop:{viewport:{width:1440,height:1000}},phone:{viewport:{width:390,height:844}},compact:{viewport:{width:360,height:640}},reduced:{viewport:{width:1440,height:1000},reducedMotion:'reduce'},nojs:{viewport:{width:1440,height:1000},javaScriptEnabled:false}})){
 const context=await browser.newContext(options);
 await context.addInitScript(()=>{Element.prototype.requestPointerLock=function(){};Element.prototype.setPointerCapture=function(){};Element.prototype.releasePointerCapture=function(){}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3001');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(600);await page.locator('#retreat').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
 if(name!=='nojs')await page.waitForFunction(()=>document.querySelector('#retreat').dataset.entered==='true');
 await page.waitForTimeout(2000);
 const state=await page.locator('#retreat').evaluate(el=>({image:[...el.querySelectorAll('img')].every(img=>img.complete&&img.naturalWidth>0),filter:getComputedStyle(el.querySelector('img')).filter,opacity:getComputedStyle(el.querySelector('.retreat-verse>span')).opacity,overflow:document.documentElement.scrollWidth>innerWidth}));
 assert.equal(state.image,true);assert.equal(state.filter,'none');assert.equal(state.opacity,'1');assert.equal(state.overflow,false);assert.deepEqual(errors,[]);
 if(name==='desktop'){
  const photo=page.locator('.retreat-card img').first();const photoBefore=await photo.evaluate(el=>getComputedStyle(el).transform);
  const word=page.locator('.retreat-you');const before=await word.evaluate(el=>getComputedStyle(el).transform);await page.waitForTimeout(900);const after=await word.evaluate(el=>getComputedStyle(el).transform);assert.notEqual(before,after);assert.notEqual(await photo.evaluate(el=>getComputedStyle(el).transform),photoBefore);
  await page.evaluate(()=>document.documentElement.dataset.motion='paused');const paused=await word.evaluate(el=>getComputedStyle(el).transform);await page.waitForTimeout(300);assert.equal(await word.evaluate(el=>getComputedStyle(el).transform),paused);
  await page.evaluate(()=>delete document.documentElement.dataset.motion);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(300);await page.locator('#retreat').scrollIntoViewIfNeeded();await page.waitForTimeout(120);
  assert.ok(Number(await page.locator('.retreat-verse>span').first().evaluate(el=>getComputedStyle(el).opacity))<1,'Entrance replays on returning');await page.waitForTimeout(1800);
 }
 if(name==='reduced')assert.equal(await page.locator('.retreat-you').evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.locator('#retreat').screenshot({path:`${output}/${name}-retreat.png`});results.push({name,pass:true,...state});console.log(`PASS ${name}`);await context.close();
}
}finally{await browser.close();await writeFile(`${output}/report.json`,JSON.stringify(results,null,2))}
