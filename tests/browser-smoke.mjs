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


  // Create Agent: scalable profession choice, real clicks, local persistence and safe testing.
  const setup=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const setupErrors=[];
  setup.on('pageerror',e=>setupErrors.push(e.message));
  await setup.goto('http://127.0.0.1:4173/#/agents/new');
  await setup.getByRole('heading',{name:'Создать агента',exact:true}).waitFor();
  // Real pointer focus: .fill() alone can conceal an input that blurs on click.
  const focusCheck=async (pg,selector,value)=>{
    const field=pg.locator(selector);
    await field.click();
    assert.ok(await field.evaluate(el=>document.activeElement===el),'Focus lost immediately after click: '+selector);
    await pg.keyboard.insertText(value);
    assert.ok(await field.evaluate(el=>document.activeElement===el),'Focus lost during typing: '+selector);
    assert.equal(await field.inputValue(),value,'Text did not persist in active input: '+selector);
  };
  await focusCheck(setup,'[data-wizard-field="new-name"]','Фокус тест');
  await setup.locator('[data-wizard-field="new-name"]').fill('');
  await focusCheck(setup,'[data-wizard-field="new-description"]','Проверка фокуса');
  await setup.locator('[data-wizard-field="new-description"]').fill('');
  assert.equal(await setup.locator('.wizard-template').count(),0,'No oversized profession cards in basic form');
  await setup.locator('[data-wizard-field="new-name"]').fill('HR · Прототип');
  await setup.locator('[data-wizard-field="new-description"]').fill('Помогает рекрутерам обрабатывать отклики');
  await setup.screenshot({path:'artifacts/ui/create-agent-basics.png',fullPage:true});
  await setup.locator('[data-wizard-action="create"]').click();
  assert.match(setup.url(),/#\/agents\/draft-[^/]+\/setup\/2$/);
  const id=setup.url().split('#/agents/')[1].split('/')[0];
  await setup.getByRole('heading',{name:'Выберите профессию'}).waitFor();
  assert.equal(await setup.locator('.profession-row').count(),8);
  assert.ok((await setup.locator('.profession-results').innerText()).includes('36'));
  assert.equal(await setup.locator('.profession-row:not([disabled])').count(),2);
  await setup.screenshot({path:'artifacts/ui/create-agent-professions.png',fullPage:true});
  await setup.locator('[data-wizard-action="profession-page"][data-value="2"]').last().click();
  assert.equal(await setup.locator('.profession-row').count(),8);
  await setup.locator('[data-profession-category]').selectOption('hr');
  assert.ok((await setup.locator('.profession-results').innerText()).includes('6'),'HR category contains six roles');
  await focusCheck(setup,'[data-profession-search]','HR');
  await setup.locator('[data-profession-search]').fill('HR-рекрутер');
  assert.equal(await setup.locator('.profession-row').count(),1);
  await setup.locator('[data-wizard-action="select-profession"][data-value="hr"]').click();
  assert.equal(await setup.locator('.profession-row.selected').count(),1);
  await setup.locator('.wizard-footer a[href$="/setup/3"]').click();
  await focusCheck(setup,'[data-wizard-field="company"]','Тест');
  await setup.locator('[data-wizard-field="company"]').fill('Тестовая организация');
  await setup.locator('[data-wizard-field="task"]').fill('Собирать отклики и передавать сводки HR');
  await setup.locator('[data-wizard-field="handoff"]').fill('Эскалация HR-сотруднику');
  await setup.reload();
  assert.equal(await setup.locator('[data-wizard-field="company"]').inputValue(),'Тестовая организация');
  await setup.screenshot({path:'artifacts/ui/create-agent-instructions.png',fullPage:true});
  await setup.locator('.wizard-step[href$="/setup/4"]').click();
  await setup.locator('[data-wizard-action="toggle-knowledge"][data-value="vacancies"]').click();
  assert.equal(await setup.locator('[data-wizard-action="toggle-knowledge"][data-value="vacancies"]').getAttribute('aria-pressed'),'true','Whole-row knowledge selection must persist');
  await setup.reload();
  assert.equal(await setup.locator('[data-wizard-action="toggle-knowledge"][data-value="vacancies"]').getAttribute('aria-pressed'),'true','Knowledge persisted after reload');
  await setup.locator('.wizard-step[href$="/setup/5"]').click();
  await setup.getByRole('heading',{name:'Подключения',exact:true}).waitFor();
  assert.equal(await setup.locator('.wizard-integration-item').count(),3);
  assert.equal(await setup.locator('.wizard-integration-logo img').count(),3,'Original provider logos');
  await setup.locator('[data-wizard-action="toggle-connection"][data-value="max"]').click();
  assert.equal(await setup.locator('[data-wizard-action="toggle-connection"][data-value="max"]').getAttribute('aria-pressed'),'true');
  await setup.screenshot({path:'artifacts/ui/create-agent-integrations.png',fullPage:true});
  await setup.reload();
  assert.equal(await setup.locator('[data-wizard-action="toggle-connection"][data-value="max"]').getAttribute('aria-pressed'),'true');
  await setup.locator('.wizard-step[href$="/setup/6"]').click();
  assert.ok((await setup.locator('.wizard-permissions').innerText()).includes('Автоматически отклонять кандидата'));
  await setup.locator('[data-wizard-field="group"]').selectOption('HR');
  await setup.locator('.wizard-step[href$="/setup/7"]').click();
  await setup.getByRole('heading',{name:'Проверка готовности',exact:true}).waitFor();
  assert.equal(await setup.locator('.wizard-ready-row').count(),7);
  assert.equal(await setup.locator('.wizard-footer button[disabled]').count(),1);
  await setup.screenshot({path:'artifacts/ui/create-agent-readiness.png',fullPage:true});
  await setup.getByRole('link',{name:'Открыть тестирование'}).click();
  assert.match(setup.url(),/\/testing$/);
  await setup.locator('[data-wizard-field="simulation"]').fill('Хочу узнать о вакансии');
  await setup.locator('[data-wizard-action="simulate"]').click();
  assert.ok((await setup.locator('.wizard-chat').innerText()).includes('демонстрационный ответ'));
  await setup.goto('http://127.0.0.1:4173/#/agents');
  await setup.locator('[data-agent-action="view"][data-value="draft"]').click();
  assert.ok((await setup.locator('.agent-table').innerText()).includes('HR · Прототип'));
  await setup.goto('http://127.0.0.1:4173/#/agents/'+id+'/setup/1');
  assert.equal(await setup.locator('[data-wizard-field="description"]').inputValue(),'Помогает рекрутерам обрабатывать отклики');
  assert.deepEqual(setupErrors,[]);

  const small=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const mobileErrors=[];
  small.on('pageerror',e=>mobileErrors.push(e.message));
  await small.goto('http://127.0.0.1:4173/#/agents/new');
  assert.ok(await small.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Mobile horizontal overflow');
  await focusCheck(small,'[data-wizard-field="new-name"]','Мобильный ввод');
  await small.locator('[data-wizard-field="new-name"]').fill('Мобильный тест');
  await small.locator('[data-wizard-action="create"]').click();
  await small.locator('[data-wizard-action="select-profession"][data-value="sales"]').click();
  await small.screenshot({path:'artifacts/ui/create-agent-mobile-profession.png',fullPage:true});
  await small.locator('.wizard-step[href$="/setup/5"]').click();
  await small.locator('[data-wizard-action="toggle-connection"][data-value="max"]').click();
  await small.screenshot({path:'artifacts/ui/create-agent-mobile-integrations.png',fullPage:true});
  assert.deepEqual(mobileErrors,[]);
  await small.close();
  await setup.close();

  console.log('Chromium smoke passed at all viewports.');
}finally{
  await browser.close();
}