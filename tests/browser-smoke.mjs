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
 {name:'small-mobile',width:320,height:568}
];
try{
 for(const resolution of resolutions){
  const page=await browser.newPage({viewport:{width:resolution.width,height:resolution.height}});
  page.on('pageerror',error=>errors.push(resolution.name+': '+error.message));
  await page.goto('http://127.0.0.1:4173',{waitUntil:'load'});
  await page.locator('.ov2-dashboard').waitFor();
  assert.equal(await page.locator('.workspace-skin').count(),1,'Workspace shell is active');
  assert.equal(await page.locator('.workspace-skin .topbar').count(),0,'Workspace has no permanent header');
  assert.equal(await page.locator('.ov2-heading h1').count(),0,'No redundant Overview heading');
  assert.equal(await page.locator('.ov2-activity [data-action="ov2-period"]').count(),2,'Time selector is in Agent activity');
  assert.equal(await page.locator('.workspace-skin .side .dock-brand').innerText(),'AIMock');
  assert.equal(await page.locator('.workspace-skin .side .nav-btn').count(),12,'All routes are present in left rail');
  assert.equal(await page.locator('.workspace-skin .side .nav-btn').first().getAttribute('aria-label'),'Обзор');
  const geometry=await page.evaluate(()=>{
   const rail=document.querySelector('.workspace-skin .side').getBoundingClientRect();
   const stage=document.querySelector('.workspace-skin .workspace').getBoundingClientRect();
   const brand=document.querySelector('.workspace-skin .dock-brand').getBoundingClientRect();
   const profile=document.querySelector('.workspace-skin .profile-trigger').getBoundingClientRect();
   return {rail:{x:rail.x,y:rail.y,width:rail.width,height:rail.height,right:rail.right,bottom:rail.bottom},
     stage:{x:stage.x,right:stage.right},brandY:brand.y,profileY:profile.y};
  });
  assert.ok(geometry.rail.x>=7,'Rail inset from left: '+JSON.stringify(geometry));
  assert.ok(geometry.rail.width>=60 && geometry.rail.width<=85,'Rail stays narrow');
  assert.ok(geometry.rail.y>=6 && geometry.rail.bottom<=resolution.height-6,'Rail floats vertically');
  assert.ok(geometry.stage.x>=geometry.rail.right+6,'Content does not overlap floating rail: '+JSON.stringify(geometry));
  assert.ok(geometry.brandY<geometry.profileY,'Brand top, profile bottom');
  const n=await page.locator('.ov2-activity-summary strong').first().innerText();
  assert.match(n,/304/,'Weekly task executions remain available');
  await page.locator('[data-action="ov2-period"][data-days="30"]').click();
  assert.match(await page.locator('.ov2-activity-summary strong').first().innerText(),/1[\s\u00a0\u202f,]?057/);
  await page.locator('[data-action="ov2-period"][data-days="7"]').click();
  const dimensions=await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,viewportWidth:innerWidth,viewportHeight:innerHeight}));
  assert.ok(dimensions.width<=dimensions.viewportWidth+1,JSON.stringify({resolution,dimensions}));
  assert.ok(dimensions.height<=dimensions.viewportHeight+1,JSON.stringify({resolution,dimensions}));
  if(resolution.name==='desktop'){
   await page.screenshot({path:'artifacts/overview-light-ru.png',fullPage:false});
   // Theme & language are under the personal profile, not header.
   await page.locator('.profile-trigger').click();
   assert.ok(await page.locator('.profile-menu').isVisible(),'Personal & organization menu');
   await page.locator('[data-action="open-profile-preferences"]').click();
   await page.locator('.personal-preferences').waitFor();
   await page.locator('[data-action="set-theme"][data-value="dark"]').click();
   assert.equal(await page.locator('body').getAttribute('data-theme'),'dark');
   await page.locator('[data-action="set-locale"][data-value="en"]').click();
   assert.equal(await page.locator('html').getAttribute('lang'),'en');
   await page.locator('.dock-brand').click();
   assert.equal(await page.locator('.ov2-heading h1').count(),0,'No page heading in English');
   await page.screenshot({path:'artifacts/overview-dark-en.png',fullPage:false});
   // Agent and contextual navigation still work.
   await page.locator('.side [data-page="agents"]').click();
   assert.ok(await page.locator('.agent-card').count()>=1,'Agent list reachable');
   await page.locator('[data-action="open-agent"]').first().click();
   assert.ok(await page.locator('.workspace-context-nav').isVisible(),'Breadcrumbs on nested pages');
   // Platform admin only from account menu, retaining its original header.
   await page.locator('.profile-trigger').click();
   await page.locator('.profile-menu [data-action="mode"][data-mode="admin"]').click();
   assert.equal(await page.locator('.workspace-skin').count(),0,'Admin separate from Workspace');
   assert.ok(await page.locator('.topbar').isVisible(),'Admin header intact');
  }
  if(resolution.name==='mobile'){
   await page.screenshot({path:'artifacts/overview-mobile.png',fullPage:false});
   await page.locator('.side .nav-btn[data-page="notifications"]').scrollIntoViewIfNeeded();
   await page.locator('.side .nav-btn[data-page="notifications"]').click();
   assert.ok((await page.locator('.view-stage').innerText()).length>0,'Last navigation items remain reachable');
   await page.locator('.side .dock-brand').click();
   await page.locator('.ov2-mobile-tabs [data-tab="agents"]').click();
   assert.ok(await page.locator('.ov2-agents').isVisible(),'Mobile dashboard panels work');
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'no unhandled browser JavaScript errors');
 console.log('Browser checks passed: left floating vertical rail, no header, profile theme/language, Admin isolation, Overview and responsive scrolling.');
} finally{
 await browser.close();
}
