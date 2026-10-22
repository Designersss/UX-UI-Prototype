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
    if(viewport.width>=1101){
      const fit=await page.evaluate(()=>[".main-scroll",".right-rail",".nav-list"].map(selector=>{
        const el=document.querySelector(selector);return {selector,overflow:el.scrollHeight-el.clientHeight};
      }));
      assert.ok(fit.every(x=>x.overflow<=3),"Overview scroll at "+viewport.width+"×"+viewport.height+": "+JSON.stringify(fit));
    }
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
  assert.equal(await agentPage.locator('.agent-page-head p').count(),0,'Redundant header summary must be absent');
  assert.equal(await agentPage.locator('.agent-row').count(),5);
  assert.equal(await agentPage.locator('.agent-tab').count(),5);
  assert.equal(await agentPage.locator('[data-agent-action="page"]').count(),4);
  await agentPage.locator('[data-agent-action="view"][data-value="stopped"]').click();
  assert.equal(await agentPage.locator('.agent-row').count(),1);
  assert.ok((await agentPage.locator('.agent-row').innerText()).includes('Поддержка сайта'));
  await agentPage.locator('[data-agent-action="view"][data-value="draft"]').click();
  assert.equal(await agentPage.locator('.agent-row').count(),1);
  assert.ok((await agentPage.locator('.agent-row').innerText()).includes('Новый агент'));
  await agentPage.locator('[data-agent-action="view"][data-value="all"]').click();
  await agentPage.getByRole('button',{name:'2',exact:true}).click();
  assert.equal(await agentPage.locator('.agent-row').count(),3);
  await agentPage.getByRole('button',{name:'1',exact:true}).click();
  const catalogFit=await agentPage.evaluate(()=>[".main-scroll",".right-rail",".nav-list"].map(selector=>{
    const el=document.querySelector(selector);return {selector,overflow:el.scrollHeight-el.clientHeight};
  }));
  assert.ok(catalogFit.every(x=>x.overflow<=3),"Desktop catalog scroll: "+JSON.stringify(catalogFit));
  await agentPage.screenshot({path:'artifacts/ui/agents-catalog-desktop.png',fullPage:true});
  const laptopAgents=await browser.newPage({viewport:{width:1280,height:720}});
  await laptopAgents.goto('http://127.0.0.1:4173/#/agents');
  assert.equal(await laptopAgents.locator('.agent-row').count(),4);
  const laptopFit=await laptopAgents.evaluate(()=>[".main-scroll",".right-rail",".nav-list"].map(selector=>{
    const el=document.querySelector(selector);return {selector,overflow:el.scrollHeight-el.clientHeight};
  }));
  assert.ok(laptopFit.every(x=>x.overflow<=3),"Laptop catalog scroll: "+JSON.stringify(laptopFit));
  await laptopAgents.screenshot({path:'artifacts/ui/agents-catalog-1280x720.png',fullPage:true});
  await laptopAgents.close();
  assert.equal(await agentPage.locator('[data-agent-dropdown]').count(),4);
  assert.equal(await agentPage.locator('[data-agent-dropdown="tag"]').count(),1);
  assert.equal((await agentPage.locator('.agent-toolbar-title').innerText()).trim(),'Каталог агентов');
  assert.ok((await agentPage.locator('.agent-context-rail').innerText()).includes('Менеджер заявок'));
  await agentPage.locator('[data-agents-search]').fill('HR-рекрутер');
  await agentPage.locator('[data-agent-action="select"][data-value="a2"]').click();
  assert.ok((await agentPage.locator('.agent-context-rail').innerText()).includes('HR-рекрутер'));
  assert.ok(await agentPage.locator('.agent-row[data-value="a2"]').evaluate(el=>el.classList.contains('selected')));
  await agentPage.locator('[data-agents-search]').fill('');
  await agentPage.locator('[data-agent-dropdown="type"] summary').click();
  assert.ok(await agentPage.locator('[data-agent-dropdown="type"]').evaluate(el=>el.open));
  await agentPage.locator('[data-agent-filter-option="type"][data-value="hr"]').click();
  assert.ok((await agentPage.locator('.agent-results').innerText()).includes('из 4'));
  await agentPage.locator('[data-agent-action="reset"]').click();
  assert.equal(await agentPage.locator('.agent-row').count(),5);
  await agentPage.locator('[data-agents-search]').fill('Менеджер заявок');
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


  // Approved visual direction #1: one flowing creation page, autosave, preview.
  const editor=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const editorErrors=[];
  editor.on('pageerror',e=>editorErrors.push(e.message));
  await editor.goto('http://127.0.0.1:4173/#/agents/new');
  await editor.getByRole('heading',{name:'Создание агента',exact:true}).waitFor();
  assert.equal(await editor.locator('.ae-hero').count(),1);
  assert.equal(await editor.locator('.ae-block').count(),6);
  assert.equal(await editor.locator('.ae-preview').count(),1);
  assert.equal(await editor.locator('.ae-role').count(),6);
  assert.equal(await editor.getByText('Сохранить черновик',{exact:true}).count(),0,'No manual Save Draft button');
  assert.ok((await editor.locator('.ae-footer').innerText()).includes('Автоматическое сохранение'));
  await editor.screenshot({path:'artifacts/ui/approved-create-agent-option-1-desktop.png',fullPage:true});
  const name=editor.locator('[data-editor-input="name"]');
  await name.click();
  assert.ok(await name.evaluate(el=>document.activeElement===el),'Click should focus name input');
  await editor.keyboard.insertText('Новый HR агент');
  assert.ok(await name.evaluate(el=>document.activeElement===el),'Autosave must not remove focused input');
  assert.equal(await name.inputValue(),'Новый HR агент');
  assert.match(editor.url(),/#\/agents\/draft-[a-z0-9-]+\/edit$/,'Typing creates local draft and stable edit route');
  const draftId=editor.url().split('#/agents/')[1].split('/')[0];
  await editor.locator('[data-editor-input="description"]').fill('Отвечает кандидатам и передаёт заявки HR');
  await editor.locator('[data-editor-input="group"]').first().selectOption('HR');
  assert.ok((await editor.locator('.ae-preview').innerText()).includes('Новый HR агент'));
  await editor.locator('[data-editor-action="role"][data-value="hr"]').click();
  assert.equal(await editor.locator('[data-editor-action="role"][data-value="hr"]').getAttribute('aria-pressed'),'true');
  assert.ok((await editor.locator('.ae-preview').innerText()).includes('HR-рекрутер'));
  await editor.locator('[data-editor-action="expand"]').click();
  assert.equal(await editor.locator('.ae-role').count(),9);
  await editor.locator('[data-editor-action="page"][data-value="2"]').last().click();
  assert.equal(await editor.locator('.ae-role').count(),9);
  await editor.locator('[data-editor-search]').fill('HR-рекрутер');
  assert.equal(await editor.locator('.ae-role').count(),1);
  await editor.locator('[data-editor-search]').fill('');
  await editor.locator('[data-editor-action="collapse"]').click();
  await editor.locator('[data-editor-input="task"]').fill('Уточняй вакансию, опыт и формат работы');
  await editor.locator('[data-editor-action="rule"][data-value="verify"]').click();
  assert.equal(await editor.locator('[data-editor-action="rule"][data-value="verify"]').getAttribute('aria-pressed'),'true');
  await editor.locator('[data-editor-action="knowledge"][data-value="vacancies"]').click();
  assert.equal(await editor.locator('[data-editor-action="knowledge"][data-value="vacancies"]').getAttribute('aria-pressed'),'true');
  await editor.locator('[data-editor-action="connection"][data-value="max"]').click();
  assert.equal(await editor.locator('[data-editor-action="connection"][data-value="max"]').getAttribute('aria-pressed'),'true');
  assert.ok((await editor.locator('.ae-preview').innerText()).includes('MAX'));
  await editor.reload();
  assert.equal(await editor.locator('[data-editor-input="name"]').inputValue(),'Новый HR агент');
  assert.equal(await editor.locator('[data-editor-action="knowledge"][data-value="vacancies"]').getAttribute('aria-pressed'),'true');
  assert.equal(await editor.locator('[data-editor-action="connection"][data-value="max"]').getAttribute('aria-pressed'),'true');
  assert.equal(await editor.locator('[data-editor-action="rule"][data-value="verify"]').getAttribute('aria-pressed'),'true');
  await editor.locator('.ae-tool a[href^="#/knowledge/from-agent"]').click();
  await editor.locator('.wizard-back-link').waitFor();
  await editor.locator('.wizard-back-link').click();
  await editor.locator('#ae-block-4').waitFor();
  await editor.locator('[data-editor-action="test"]').click();
  assert.match(editor.url(),/\/testing$/);
  assert.ok((await editor.locator('.wizard-test-body').innerText()).includes('Только безопасная локальная симуляция')||await editor.locator('.wizard-chat').count()>0);
  await editor.goto('http://127.0.0.1:4173/#/agents');
  await editor.locator('[data-agent-action="view"][data-value="draft"]').click();
  assert.ok((await editor.locator('.agent-table').innerText()).includes('Новый HR агент'));
  await editor.locator('.agent-row').filter({hasText:'Новый HR агент'}).click();
  await editor.getByRole('link',{name:'Продолжить настройку'}).click();
  assert.match(editor.url(),new RegExp('#/agents/'+draftId+'/edit'));
  assert.deepEqual(editorErrors,[],'New editor has no JavaScript runtime errors');
  const mobile=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const mobileErrors=[];
  mobile.on('pageerror',e=>mobileErrors.push(e.message));
  await mobile.goto('http://127.0.0.1:4173/#/agents/new');
  await mobile.locator('[data-editor-input="name"]').fill('Мобильный агент');
  assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'No horizontal document overflow');
  await mobile.screenshot({path:'artifacts/ui/approved-create-agent-option-1-mobile.png',fullPage:true});
  assert.deepEqual(mobileErrors,[]);
  await mobile.close();
  await editor.close();

    console.log('Chromium smoke passed at all viewports.');
}finally{
  await browser.close();
}