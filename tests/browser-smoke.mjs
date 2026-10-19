import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[];
const sizes=[
 {name:'desktop',width:1440,height:900},
 {name:'laptop',width:1280,height:720},
 {name:'tablet',width:1024,height:768},
 {name:'mobile',width:390,height:844},
 {name:'small-mobile',width:320,height:568}
];
try {
 for(const size of sizes){
  const page=await browser.newPage({viewport:{width:size.width,height:size.height}});
  page.on('pageerror',e=>errors.push(size.name+': '+e.message));
  await page.goto('http://127.0.0.1:4173',{waitUntil:'load'});
  await page.locator('.ov3-overview').waitFor();
  assert.equal(await page.locator('.workspace-skin .topbar').count(),0,'Workspace has no header');
  assert.equal(await page.locator('.ov3-layout .ov3-panel').count(),4,'Four overview panels');
  assert.equal(await page.locator('.ov2-kpi').count(),0,'No old overview KPI cards');
  assert.equal(await page.locator('.ov3-connection-row').count(),5,'Five actual integrations');
  assert.equal(await page.locator('.ov3-agent-row').count(),3,'Three actual agents');
  assert.equal(await page.locator('.ov3-status.success').count()>=4,true,'Connection and agent statuses');
  assert.equal(await page.locator('.ov3-provider-icon.telegram').count(),2,'Telegram identities visible');
  assert.equal(await page.locator('.ov3-provider-icon.max').count(),1,'MAX identity visible');
  assert.equal(await page.locator('.ov3-provider-icon.bitrix').count(),1,'Bitrix24 identity visible');
  assert.equal(await page.locator('.ov3-provider-icon.calendar').count(),1,'Calendar identity visible');
  const rail=await page.locator('.workspace-skin .side').evaluate(e=>e.getBoundingClientRect().toJSON());
  const content=await page.locator('.workspace-skin .workspace').evaluate(e=>e.getBoundingClientRect().toJSON());
  assert.ok(rail.left>=7 && rail.width<=85 && content.left>rail.right,'Floating left rail does not overlap content');
  const box=await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight,iw:innerWidth,ih:innerHeight}));
  assert.ok(box.w<=box.iw+1 && box.h<=box.ih+1,'Whole document never scrolls: '+JSON.stringify({size,box}));
  if(size.width>700){
   assert.ok(await page.locator('.ov3-activity').isVisible());
   assert.ok(await page.locator('.ov3-agents').isVisible());
  }else{
   assert.ok(await page.locator('.ov3-mobile-tabs').isVisible(),'Compact screen panel navigation');
   await page.locator('.ov3-mobile-tabs [data-tab="agents"]').click();
   assert.ok(await page.locator('.ov3-agents').isVisible());
   await page.locator('.ov3-mobile-tabs [data-tab="connections"]').click();
   assert.ok(await page.locator('.ov3-connections').isVisible());
   await page.locator('.ov3-mobile-tabs [data-tab="activity"]').click();
  }
  assert.match(await page.locator('.ov3-activity-intro strong').innerText(),/304/);
  await page.locator('.ov3-activity [data-action="ov2-period"][data-days="30"]').click();
  assert.match(await page.locator('.ov3-activity-intro strong').innerText(),/1[\s\u00a0\u202f,]?057/);
  await page.locator('.ov3-activity [data-action="ov2-period"][data-days="7"]').click();
  if(size.name==='desktop'){
   await page.screenshot({path:'artifacts/overview-light-ru.png',fullPage:false});
   await page.locator('.ov3-connection-row[data-id="tg1"]').click();
   assert.ok(await page.locator('.modal-backdrop').isVisible(),'Telegram integration opens detail');
   await page.locator('.modal-backdrop [data-action="modal-close"]').first().click();
   await page.locator('.ov3-agent-row[data-id="a1"]').click();
   assert.ok(await page.locator('.workspace-context-nav').isVisible(),'Agent detail breadcrumbs');
   await page.locator('.dock-brand').click();
   await page.locator('.profile-trigger').click();
   await page.locator('[data-action="open-profile-preferences"]').click();
   await page.locator('.personal-preferences').waitFor();
   await page.locator('[data-action="set-theme"][data-value="dark"]').click();
   assert.equal(await page.locator('body').getAttribute('data-theme'),'dark');
   await page.locator('[data-action="set-locale"][data-value="en"]').click();
   assert.equal(await page.locator('html').getAttribute('lang'),'en');
   await page.locator('.dock-brand').click();
   assert.ok((await page.locator('.ov3-card-header h2').first().innerText()).includes('Overall activity'));
   await page.screenshot({path:'artifacts/overview-dark-en.png',fullPage:false});
   // Existing Admin remains intact.
   await page.locator('.profile-trigger').click();
   await page.locator('.profile-menu [data-action="mode"][data-mode="admin"]').click();
   assert.equal(await page.locator('.workspace-skin').count(),0);
   assert.ok(await page.locator('.topbar').isVisible());
  }
  if(size.name==='mobile'){
   await page.screenshot({path:'artifacts/overview-mobile.png',fullPage:false});
   await page.locator('.side .nav-btn[data-page="notifications"]').scrollIntoViewIfNeeded();
   await page.locator('.side .nav-btn[data-page="notifications"]').click();
   assert.ok((await page.locator('.view-stage').innerText()).length>0,'All 12 navigation icons remain accessible');
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'No JavaScript errors');
 console.log('Browser checks passed: four modules, service identities, task metrics, time selector, navigation, themes and responsive viewports.');
}finally{await browser.close()}
