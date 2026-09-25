import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const output=resolve('../verification/round-2');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
await context.addInitScript(()=>{
  Element.prototype.requestPointerLock=function(){};
  Element.prototype.setPointerCapture=function(){};
  Element.prototype.releasePointerCapture=function(){};
});
const page=await context.newPage();
try{
  await page.goto('http://127.0.0.1:3001',{waitUntil:'networkidle'});
  await page.locator('#spaces').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  const frames=await page.evaluate(async()=>{
    const incoming=document.querySelector('.depth-slide[data-offset="1"]');
    const samples=[];
    const started=performance.now();
    document.querySelector('button[aria-label="Next photograph"]').click();
    await new Promise(resolve=>{
      function frame(now){
        const box=incoming.getBoundingClientRect();
        samples.push({ms:Math.round(now-started),x:box.x,width:box.width,opacity:Number(getComputedStyle(incoming).opacity)});
        if(now-started<1100)requestAnimationFrame(frame);else resolve();
      }
      requestAnimationFrame(frame);
    });
    return samples;
  });
  const distinct=new Set(frames.map(f=>f.x.toFixed(1))).size;
  const travel=Math.abs(frames.at(-1).x-frames[0].x);
  const maxStep=Math.max(...frames.slice(1).map((f,i)=>Math.abs(f.x-frames[i].x)));
  const result={frames:frames.length,distinctPositions:distinct,travelPixels:travel,maxStepPixels:maxStep,interpolated:distinct>12&&travel>100&&maxStep<travel*.25,samples:frames};
  await writeFile(resolve(output,'motion.json'),JSON.stringify(result,null,2));
  assert(result.interpolated,'Gallery should move through many intermediate rendered positions without an abrupt jump');
  console.log(JSON.stringify({...result,samples:undefined},null,2));
}finally{await browser.close()}
