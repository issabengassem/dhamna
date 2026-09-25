import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.DHAMNA_URL || 'http://127.0.0.1:3001';
const output = resolve('../verification', process.env.DHAMNA_RUN || 'round-3');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
const report = { url: base, capturedAt: new Date().toISOString(), checks: [], screenshots: [], errors: [] };
const check = (name, pass, detail = '') => {
  report.checks.push({name, pass: Boolean(pass), detail});
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ': ' + detail : ''}`);
};
async function context(options) {
  const c = await browser.newContext(options);
  await c.addInitScript(() => {
    Element.prototype.requestPointerLock = function () {};
    Element.prototype.setPointerCapture = function () {};
    Element.prototype.releasePointerCapture = function () {};
  });
  return c;
}
async function screenshot(page, name) {
  await page.screenshot({ path: resolve(output, name + '.png') });
  report.screenshots.push(name + '.png');
}
try {
  for (const config of [
    {name:'desktop', width:1440, height:1000},
    {name:'phone', width:390, height:844},
    {name:'compact', width:360, height:640},
    {name:'reduced', width:1440, height:1000, reducedMotion:'reduce'},
  ]) {
    const c = await context({viewport:{width:config.width,height:config.height},reducedMotion:config.reducedMotion || 'no-preference',acceptDownloads:true,hasTouch:config.width<700});
    const page = await c.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const response = await page.goto(base, {waitUntil:'networkidle'});
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1300);
    check(`${config.name}: route and title`, response.status() === 200 && /DHAMNA/i.test(await page.title()));
    await screenshot(page, `${config.name}-hero`);
    const sections = await page.locator('main > section').evaluateAll(nodes => nodes.map((n,i)=>({id:n.id||`section-${i}`,y:n.getBoundingClientRect().top+scrollY,height:n.getBoundingClientRect().height})));
    for (const section of sections) {
      for (const [tag,y] of [['start',section.y],['mid',section.y+Math.max(0,(section.height-config.height)*0.6)]]) {
        await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);
        await page.waitForTimeout(850);
        await screenshot(page, `${config.name}-${section.id}-${tag}`);
      }
    }
    const state = await page.evaluate(() => ({
      overflow:document.documentElement.scrollWidth>innerWidth,
      broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),
      hiddenCopy:[...document.querySelectorAll('h1,h2,h3')].filter(n=>getComputedStyle(n).opacity==='0').map(n=>n.textContent),
      body:document.body.innerText.length,
    }));
    check(`${config.name}: no horizontal overflow`,!state.overflow);
    check(`${config.name}: all images loaded`,state.broken.length===0,JSON.stringify(state.broken));
    check(`${config.name}: content visible`,state.body>300&&state.hiddenCopy.length===0);

    if(config.name==='desktop') {
      await page.locator('#rhythm').scrollIntoViewIfNeeded();
      const choices=page.getByRole('group',{name:'Choose a moment of the day'}).getByRole('button');
      await choices.first().click();
      const chosenText=await choices.first().innerText();
      check('Day choice updates selected state',await choices.first().getAttribute('aria-pressed')==='true');
      await page.waitForTimeout(1200);
      await screenshot(page,'interaction-morning');
      await choices.last().click();
      await page.waitForTimeout(1200);
      await screenshot(page,'interaction-last-scene');
      await choices.first().click();
      await page.getByRole('button',{name:/Imagine your stay/}).first().click();
      await page.locator('.stay-dialog').waitFor({state:'visible'});
      check('Stay dialog explains fictional status',/fictional|no property to book/i.test(await page.locator('.stay-dialog').innerText()));
      check('Selected day carries to stay panel',(await page.locator('.chosen-mood').innerText()).includes(chosenText.split('\n').filter(Boolean).at(-1)));
      await screenshot(page,'interaction-stay');
      const downloadEvent=page.waitForEvent('download');
      await page.getByRole('button',{name:/Save your imagined day|Download your day again/}).click();
      const download=await downloadEvent;
      const contents=await readFile(await download.path(),'utf8');
      check('Itinerary downloads and contains demo disclosure',contents.includes('DHAMNA')&&/fictional|not a reservation/i.test(contents));
      await writeFile(resolve(output,'downloaded-itinerary.txt'),contents);
      const browse=page.locator('.airbnb-link');
      check('Airbnb link is honest generic destination',await browse.getAttribute('href')==='https://www.airbnb.com/'&&/not an official DHAMNA listing/i.test(await page.locator('.stay-dialog').innerText()));
      await page.keyboard.press('Escape');
      check('Stay dialog closes with Escape',!(await page.locator('.stay-dialog').isVisible()));
      check('Stay dialog restores focus',/Imagine your stay/.test(await page.evaluate(()=>document.activeElement?.textContent||'')));
      await page.getByRole('button',{name:/View The quiet room photograph/}).click();
      await page.locator('.lightbox').waitFor({state:'visible'});
      await screenshot(page,'interaction-lightbox');
      await page.keyboard.press('Escape');
      check('Gallery lightbox opens and closes',!(await page.locator('.lightbox').isVisible()));
      await page.locator('.depth-gallery').scrollIntoViewIfNeeded();
      const originalCaption=await page.locator('.depth-caption h3').innerText();
      await page.getByRole('button',{name:'Next photograph',exact:true}).click();
      await page.waitForTimeout(180);
      await screenshot(page,'interaction-depth-transition');
      await page.waitForTimeout(950);
      await screenshot(page,'interaction-depth-next');
      check('Depth gallery next changes focused photograph',(await page.locator('.depth-caption h3').innerText())!==originalCaption);
      await page.getByRole('button',{name:'Previous photograph',exact:true}).click();
      await page.waitForTimeout(950);
      check('Depth gallery previous restores focused photograph',(await page.locator('.depth-caption h3').innerText())===originalCaption);
      await page.getByRole('button',{name:'Next photograph',exact:true}).focus();
      await page.keyboard.press('ArrowRight');
      check('Depth gallery supports arrow keys',(await page.locator('.depth-caption h3').innerText())!==originalCaption);
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(950);
      await page.locator('.depth-slide[data-offset="1"]').click();
      await page.waitForTimeout(950);
      check('Selecting a neighboring image brings it into focus',(await page.locator('.depth-caption h3').innerText())!==originalCaption);
      const seen=new Set();
      for(let i=0;i<5;i++){
        seen.add(await page.locator('.depth-caption h3').innerText());
        await page.locator('.depth-slide.is-active').click();
        await page.locator('.lightbox').waitFor({state:'visible'});
        await page.locator('.lightbox img').evaluate(img=>img.decode());
        check(`Gallery image ${i+1} opens in lightbox`,await page.locator('.lightbox img').evaluate(img=>img.complete&&img.naturalWidth>0));
        await page.keyboard.press('Escape');
        await page.getByRole('button',{name:'Next photograph',exact:true}).click();
        await page.waitForTimeout(950);
      }
      check('All five photographs are reachable',seen.size===5);
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      const pause=page.getByRole('button',{name:'Pause ambient motion'});
      await pause.click();
      await page.waitForTimeout(400);
      const first=await page.locator('.hero-camera img').evaluate(el=>getComputedStyle(el).transform);
      await page.waitForTimeout(700);
      const second=await page.locator('.hero-camera img').evaluate(el=>getComputedStyle(el).transform);
      check('Motion pause freezes camera',first===second);
      await screenshot(page,'interaction-paused');
      await page.getByRole('button',{name:'Play ambient motion'}).click();
    }
    if(config.name==='phone'||config.name==='compact') {
      await page.locator('.depth-stage').scrollIntoViewIfNeeded();
      const initial=await page.locator('.depth-caption h3').innerText();
      await page.locator('.depth-stage').evaluate(el=>{
        const box=el.getBoundingClientRect();
        const start=new Touch({identifier:7,target:el,clientX:box.x+box.width*.8,clientY:box.y+box.height/2});
        const end=new Touch({identifier:7,target:el,clientX:box.x+box.width*.2,clientY:box.y+box.height/2});
        el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[start],changedTouches:[start]}));
        el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[end]}));
      });
      await page.waitForTimeout(1000);
      check(`${config.name}: gallery swipe changes image`,(await page.locator('.depth-caption h3').innerText())!==initial);
      await screenshot(page,`${config.name}-gallery-after-swipe`);
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      await page.getByRole('button',{name:'Open menu'}).click();
      await screenshot(page,`${config.name}-menu`);
      await page.keyboard.press('Escape');
      check(`${config.name}: menu Escape`,!(await page.locator('#mobile-menu').isVisible()));
      if(await page.locator('#mobile-menu').isVisible())await page.getByRole('button',{name:'Close menu'}).click();
      await page.getByRole('button',{name:'Open menu'}).click();
      await page.locator('#mobile-menu').getByRole('link',{name:/The spaces/}).click();
      check(`${config.name}: mobile navigation closes`,!(await page.locator('#mobile-menu').isVisible()));
      await page.getByRole('button',{name:/Imagine your stay/}).last().click();
      await screenshot(page,`${config.name}-stay`);
      check(`${config.name}: stay dialog fits screen`,await page.locator('.stay-dialog').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight+1}));
      await page.keyboard.press('Escape');
    }
    if(config.name==='reduced') {
      await page.locator('.depth-stage').scrollIntoViewIfNeeded();
      check('Reduced motion removes gallery drift',await page.locator('.depth-slide.is-active img').evaluate(el=>getComputedStyle(el).animationName==='none'));
      await page.getByRole('button',{name:'Next photograph',exact:true}).click();
      check('Reduced motion retains gallery navigation',(await page.locator('.depth-caption h3').innerText())!=='The quiet room');
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      const first=await page.locator('.hero-camera img').evaluate(el=>getComputedStyle(el).transform);
      await page.waitForTimeout(700);
      check('Reduced motion stops camera',first===await page.locator('.hero-camera img').evaluate(el=>getComputedStyle(el).transform));
    }
    check(`${config.name}: no browser errors`,errors.length===0,errors.join('; '));
    report.errors.push(...errors);
    await c.close();
  }
  const c=await context({viewport:{width:1440,height:1000},javaScriptEnabled:false});
  const page=await c.newPage();
  await page.goto(base,{waitUntil:'networkidle'});
  await page.locator('#retreat').scrollIntoViewIfNeeded();
  await screenshot(page,'no-javascript-retreat');
  check('No-JavaScript editorial content remains visible',await page.locator('.retreat-content').evaluate(el=>getComputedStyle(el).opacity!=='0'));
  await c.close();
} catch(e) {
  report.errors.push(e.stack||e.message);
  check('Verification completed without interruption',false,e.message);
} finally {
  await browser.close();
  await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2));
  console.log(`Evidence: ${output}`);
}
assert(report.checks.every(c=>c.pass)&&report.errors.length===0,'Some verification checks failed; inspect report.json');

