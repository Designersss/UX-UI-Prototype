import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[];
const resolutions=[
 {name:'desktop',width:1440,height:900},
 {name:'laptop',width:1280,height:720},
 {name:'tablet',width:1024,height:768},
 {name:'mobile',width:390,height:844},
];
try{
 for(const resolution of resolutions){
  const page=await browser.newPage({viewport:{width:resolution.width,height:resolution.height}});
  page.on('pageerror',error=>errors.push(resolution.name+': '+error.message));
  await page.goto('http://127.0.0.1:4173',{waitUntil:'load'});
  await page.locator('.ov2-dashboard').waitFor();
  const initial=await page.locator('.ov2-activity-summary strong').first().innerText();
  assert.match(initial,/304/,resolution.name+' weekly executions');
  await page.locator('[data-action="ov2-period"][data-days="30"]').click();
  const monthly=await page.locator('.ov2-activity-summary strong').first().innerText();
  assert.match(monthly,/1[\s\u00a0\u202f,]?057/,resolution.name+' monthly executions');
  await page.locator('[data-action="ov2-period"][data-days="7"]').click();
  const dimensions=await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,viewportWidth:innerWidth,viewportHeight:innerHeight}));
  assert.ok(dimensions.width<=dimensions.viewportWidth+1,JSON.stringify({resolution,dimensions}));
  assert.ok(dimensions.height<=dimensions.viewportHeight+1,JSON.stringify({resolution,dimensions}));
  if(resolution.name==='desktop'){
   await page.screenshot({path:'artifacts/overview-light-ru.png',fullPage:false});
   await page.locator('[data-action="toggle-theme"]').click();
   assert.equal(await page.locator('body').getAttribute('data-theme'),'dark');
   await page.screenshot({path:'artifacts/overview-dark-ru.png',fullPage:false});
   await page.locator('[data-action="toggle-locale"]').click();
   assert.equal(await page.locator('html').getAttribute('lang'),'en');
   assert.equal(await page.locator('.ov2-heading h1').innerText(),'Overview');
   await page.screenshot({path:'artifacts/overview-dark-en.png',fullPage:false});
  }
  if(resolution.name==='mobile'){
   await page.screenshot({path:'artifacts/overview-mobile.png',fullPage:false});
   await page.locator('.ov2-mobile-tabs [data-tab="agents"]').click();
   assert.ok(await page.locator('.ov2-agents').isVisible(),'mobile agents panel');
  }
  // Other sections must still navigate and render.
  if(resolution.name==='desktop'){
   await page.locator('[data-action="go-agents"]').first().click();
   assert.ok(await page.locator('.agent-card').count()>=1,'agents route is intact');
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'no unhandled browser JavaScript errors');
 console.log('Browser checks passed: responsive fit, KPI period, RU/EN, Light/Dark, agent route.');
}finally{await browser.close()}
