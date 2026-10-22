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
      assert.ok((await page.locator('.right-rail-context').innerText()).includes('Менеджер заявок'));
      assert.equal(await page.locator('.right-rail-context .queue-item').count(),0,'Context view must fully replace attention queue');
      assert.equal(await page.locator('.right-rail-context .rail-billing').count(),0,'Balance must not be mixed into contextual view');
      assert.equal(await center.evaluate(node=>node.scrollTop),before,'Central pane jumped when opening contextual preview');
      await page.locator('[data-back-control]').click();
      assert.ok(await page.locator('.right-rail').evaluate(node=>!node.classList.contains('right-rail-context')));
      assert.ok((await page.locator('.right-rail').innerText()).includes('AI-баланс'));
      await page.locator('.alert-banner').click();
      assert.ok(await page.locator('.queue-item').first().evaluate(node=>node.classList.contains('selected')));
      assert.ok(await page.locator('.right-rail').evaluate(node=>node.classList.contains('attention-highlight')));
      await page.locator('.summary-grid [data-preview]').last().click();
      assert.equal(await page.locator('.right-rail-context .brand-logo img').count(),1,'Integration context must show original logo');
      await page.screenshot({path:'artifacts/ui/'+viewport.name+'-integration-context.png',fullPage:true});
      assert.equal(await page.locator('.summary-grid .line-item img').count(),3,'All visible integrations need actual SVG logos');
      await page.locator('.events [data-preview]').first().click();
      assert.ok((await page.locator('.right-rail-context').innerText()).includes('СОБЫТИЕ'));
      assert.equal(await page.locator('.right-rail-context .queue-item').count(),0); 
      await page.locator('[data-back-control]').click();
    }

    if(viewport.width<=1100){
      await page.locator('[data-mobile-panel]').click();
      await page.locator('.right-rail.mobile-open .queue-item').nth(1).click();
      assert.ok((await page.locator('.right-rail .detail-desc').innerText()).includes('Диалог'));
      await page.locator('[data-close-panel]').click();
      await page.locator('.summary-grid [data-preview]').last().click();
      assert.ok(await page.locator('.right-rail').evaluate(node=>node.classList.contains('mobile-open')));
      assert.ok((await page.locator('.right-rail-context').innerText()).includes('ИНТЕГРАЦИЯ'));
      await page.screenshot({path:'artifacts/ui/'+viewport.name+'-integration-context.png',fullPage:true});
      await page.locator('[data-back-control]').click();
      assert.ok(await page.locator('.right-rail').evaluate(node=>!node.classList.contains('right-rail-context')));
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

  const agentPage=await browser.newPage({viewport:{width:1440,height:900}});
  const catalogErrors=[];
  agentPage.on('pageerror',error=>catalogErrors.push(error.message));
  await agentPage.goto('http://127.0.0.1:4173/#/agents');
  await agentPage.getByRole('heading',{name:'Агенты',exact:true}).waitFor();
  assert.equal(await agentPage.locator('.agent-row').count(),8);
  assert.equal(await agentPage.locator('[data-agent-filter]').count(),4);
  assert.equal(await agentPage.locator('[data-agent-filter="tag"]').count(),1);
  assert.ok((await agentPage.locator('.agent-context-rail').innerText()).includes('Менеджер заявок'));
  await agentPage.locator('[data-agent-action="select"][data-value="a2"]').click();
  assert.ok((await agentPage.locator('.agent-context-rail').innerText()).includes('HR-рекрутер'));
  assert.ok(await agentPage.locator('[data-value="a2"]').evaluate(el=>el.classList.contains('selected')));
  await agentPage.locator('[data-agent-filter="type"]').selectOption('hr');
  assert.ok((await agentPage.locator('.agent-row').count())<8);
  await agentPage.locator('[data-agent-action="reset"]').click();
  assert.equal(await agentPage.locator('.agent-row').count(),8);
  await agentPage.locator('[data-agent-action="select"][data-value="a1"]').click();
  await agentPage.locator('[data-agent-action="stop-open"]').click();
  assert.ok(await agentPage.getByRole('alertdialog').isVisible());
  assert.ok((await agentPage.getByRole('alertdialog').innerText()).includes('Остановить агента?'));
  await agentPage.locator('[data-agent-action="stop-cancel"]').click();
  assert.equal(await agentPage.getByRole('alertdialog').count(),0);
  await agentPage.locator('[data-agent-action="stop-open"]').click();
  await agentPage.locator('[data-agent-action="stop-confirm"]').click();
  assert.ok((await agentPage.locator('.agent-context-rail').innerText()).includes('Остановлен вручную'));
  await agentPage.getByRole('link',{name:/Открыть карточку агента/}).click();
  assert.ok(agentPage.url().includes('#/agents/a1'));
  assert.equal(await agentPage.getByRole('alertdialog').count(),0);
  await agentPage.goto('http://127.0.0.1:4173/#/agents');
  await agentPage.locator('.agent-create').click();
  assert.ok(agentPage.url().includes('#/agents/new'));
  assert.equal(await agentPage.getByRole('alertdialog').count(),0);
  assert.deepEqual(catalogErrors,[]);
  await agentPage.close();
  console.log('Chromium smoke passed at all viewports.');
}finally{
  await browser.close();
}