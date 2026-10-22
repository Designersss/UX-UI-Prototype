import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

fs.mkdirSync('artifacts/ui', {recursive:true});
const browser = await chromium.launch({headless:true});
const cases = [
  {name:'desktop',width:1440,height:900},
  {name:'laptop',width:1280,height:720},
  {name:'mobile',width:390,height:844}
];
try {
  for (const viewport of cases) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:4173/#/overview',{waitUntil:'load'});
    await page.getByRole('heading',{name:'Обзор'}).waitFor();
    assert.ok((await page.locator('.metrics').innerText()).replace(/\s/g,' ').includes('1 248'), '7-day fixture missing');
    const fullWidth=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
    assert.ok(fullWidth.scroll<=fullWidth.viewport+2,'Document horizontally overflows: '+JSON.stringify(fullWidth));
    await page.screenshot({path:'artifacts/ui/'+viewport.name+'-light.png',fullPage:true});

    await page.locator('[data-period="30"]').click();
    assert.ok((await page.locator('.metrics').innerText()).replace(/\s/g,' ').includes('4 820'), '30-day fixture missing');
    assert.equal(await page.locator('.bar-col').count(),30,'30-day view must show 30 actual days');
    assert.ok((await page.locator('.activity-card').innerText()).includes('23 сентября — 22 октября 2026'));
    await page.locator('[data-period="7"]').click();


    if(viewport.width>1100){
      const center=page.locator('.main-scroll');
      await center.evaluate(node=>{node.scrollTop=180;});
      const before=await center.evaluate(node=>node.scrollTop);
      await page.locator('.summary-grid [data-preview]').first().click();
      assert.ok((await page.locator('.preview-content').innerText()).includes('Менеджер заявок'));
      assert.equal(await center.evaluate(node=>node.scrollTop),before,'Central pane jumped when opening contextual preview');
      await page.locator('.alert-banner').click();
      assert.ok(await page.locator('.queue-item').first().evaluate(node=>node.classList.contains('selected')));
      assert.ok(await page.locator('.right-rail').evaluate(node=>node.classList.contains('attention-highlight')));
      await page.locator('.summary-grid [data-preview]').last().click();
      assert.equal(await page.locator('.preview-content .brand-logo img').count(),1,'Integration preview must show original logo');
      assert.equal(await page.locator('.summary-grid .line-item img').count(),3,'All visible integrations need actual SVG logos');
    }

    if(viewport.width<=1100){
      await page.locator('[data-mobile-panel]').click();
      await page.locator('.right-rail.mobile-open .queue-item').nth(1).click();
      assert.ok((await page.locator('.right-rail .detail-desc').innerText()).includes('Диалог'));
      await page.locator('[data-close-panel]').click();
    }else{
      await page.locator('.queue-item').nth(1).click();
      assert.ok((await page.locator('.detail-desc').innerText()).includes('Диалог'));
    }
    if(viewport.width<=760){
      await page.locator('[data-menu]').click();
      assert.ok(await page.locator('.sidebar').evaluate(el=>el.classList.contains('is-open')));
    }
    await page.locator('.profile').click();
    await page.locator('[data-theme="dark"]').click();
    assert.equal(await page.locator('body').getAttribute('data-theme'),'dark');
    await page.screenshot({path:'artifacts/ui/'+viewport.name+'-dark.png',fullPage:true});
    await page.locator('[data-locale="en"]').click();
    await page.getByRole('heading',{name:'Overview'}).waitFor();
    await page.screenshot({path:'artifacts/ui/'+viewport.name+'-en.png',fullPage:true});
    assert.deepEqual(errors,[], 'JS errors at '+viewport.name);
    await page.close();
  }
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto('http://127.0.0.1:4173/#/overview');
  await page.locator('.org-switch').click();
  await page.locator('[data-org="lab"]').click();
  assert.ok((await page.locator('.metrics').innerText()).includes('0'));
  assert.equal(await page.locator('.queue-item').count(),0, 'org queue leaking');
  await page.locator('[data-search]').click();
  await page.locator('[data-search-input]').fill('Тестовый');
  assert.ok((await page.locator('.search-results').innerText()).includes('Тестовый рекрутер'));
  await page.close();
  console.log('Chromium smoke passed at all viewports.');
}finally{
  await browser.close();
}