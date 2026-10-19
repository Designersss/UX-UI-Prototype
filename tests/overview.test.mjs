import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/overview.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

function harness(){
 const state={
  locale:'ru',ov2Period:7,activeOrgId:'org1',scenario:'active',ov3Tab:'activity',
  agents:[{id:'a1',name:'Менеджер продаж',type:'sales',status:'active'},{id:'a2',name:'Рекрутер',type:'hr',status:'active'},{id:'a3',name:'Поддержка',type:'sales',status:'draft'}],
  connectors:[{id:'tg1',name:'Telegram · Продажи',type:'Telegram Bot',status:'ok'},{id:'m1',name:'MAX · Кандидаты',type:'MAX Bot',status:'ok'},{id:'b1',name:'Битрикс24 · Основной',type:'CRM',status:'error'},{id:'c1',name:'Календарь HR',type:'Календарь',status:'ok'}],
  events:[{id:'e1',time:'14:20',type:'human',title:'Сотрудник завершил задачу',desc:'Работа агента'},{id:'e2',time:'13:10',type:'integration',title:'Подключение проверено',desc:'Telegram'}],
  notifications:[],candidates:[],organizations:[{id:'org1',plan:'Plus'},{id:'org2',plan:'Free'}],
 };
 const ctx=vm.createContext({
  state,esc:x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
  I:(id)=>'<svg data-icon="'+id+'"></svg>',
  translatedName:value=>state.locale==='en'?value.replace('Менеджер продаж','Sales manager').replace('Рекрутер','Recruiter').replace('Поддержка','Support'):value,
  tUI:value=>value,
 });
 new vm.Script(source).runInContext(ctx);
 return {state,run:expr=>vm.runInContext(expr,ctx)};
}
test('new four-panel stylesheet loaded after the existing shell styling',()=>{
 assert.ok(fs.existsSync(new URL('../src/styles/overview-four-panels.css',import.meta.url)));
 assert.ok(html.includes('src/styles/overview-four-panels.css'));
 assert.ok(html.indexOf('src/styles/workspace-headerless.css')<html.indexOf('src/styles/overview-four-panels.css'));
 assert.ok(html.indexOf('src/overview.js')<html.indexOf('src/app.js'));
});
test('seven and thirty day chart aggregates have internally consistent executions',()=>{
 const {state,run}=harness();
 assert.equal(run('ov2Metrics().done'),289);
 assert.equal(run('ov2Metrics().failed'),15);
 assert.equal(run('ov2Metrics().total'),304);
 state.ov2Period=30;
 assert.equal(run('ov2Metrics().done'),1003);
 assert.equal(run('ov2Metrics().failed'),54);
 assert.equal(run('ov2Metrics().total'),1057);
});
test('exactly four functional blocks, without KPI strip or dialog-specific statistics',()=>{
 const {run}=harness();const ui=run('overview()');
 assert.equal((ui.match(/class="ov3-panel /g)||[]).length,4);
 for(const name of ['Общая активность','Состояние интеграций','Последние события','Ваши агенты'])assert.ok(ui.includes(name),name);
 assert.doesNotMatch(ui,/ov2-kpi|ИИ-сотрудники|AI-баланс|Ручные действия|Требует внимания|диалогов|Добрый день/);
 for(const action of ['ov2-period','go-integrations','go-journal','go-agents','connector-detail','open-agent','ov2-open-event','ov3-tab'])assert.match(ui,new RegExp('data-action="'+action+'"'));
});
test('every actual connector has its own provider-specific visual identifier',()=>{
 const {run}=harness();const ui=run('overview()');
 for(const cls of ['telegram','max','bitrix','calendar'])assert.ok(ui.includes('ov3-provider-icon '+cls),cls);
 assert.match(ui,/<svg class="ov3-logo-vector" viewBox="0 0 24 24"/);
 assert.match(ui,/ov3-logo-max/);assert.match(ui,/ov3-logo-bitrix/);
 assert.match(ui,/data-id="tg1"/);assert.match(ui,/data-id="b1"/);
 assert.match(ui,/Ошибка/);
});
test('generic per-agent completion values and statuses, including empty balances',()=>{
 const {state,run}=harness();
 assert.equal(run('ov3AgentExecutions(state.agents[0],ov2Metrics())'),160);
 assert.equal(run('ov3AgentExecutions(state.agents[1],ov2Metrics())'),129);
 assert.equal(run('ov3AgentExecutions(state.agents[2],ov2Metrics())'),null);
 assert.match(run('overview()'),/2 из 3 активны/);
 assert.match(run('overview()'),/Черновик/);
 state.scenario='walletZero';
 assert.equal(run('ov3AgentStatus(state.agents[0]).label'),'Пауза');
 assert.match(run('overview()'),/0 из 3 активны/);
});
test('other organizations cannot see the original fixtures and data',()=>{
 const {state,run}=harness();
 state.activeOrgId='org2';state.agents=[];state.connectors=[];state.events=[];
 assert.equal(run('ov2Metrics().total'),0);
 assert.equal(run('ov3AgentExecutions({id:"a1"},ov2Metrics())'),null);
 const ui=run('overview()');
 assert.match(ui,/Агенты ещё не созданы/);
 assert.match(ui,/Интеграции ещё не добавлены/);
 assert.match(ui,/Событий пока нет/);
 assert.doesNotMatch(ui,/Telegram · Продажи|Рекрутер/);
});
test('English interface is complete with English-only fixtures and independent mobile tabs',()=>{
 const {state,run}=harness();
 state.locale='en';state.agents=[];state.connectors=[];state.events=[];
 const ui=run('overview()');
 for(const text of ['Overall activity','Integration status','Recent activity','Your agents','No integrations yet','No agents yet','View all','7 days','30 days'])assert.ok(ui.includes(text),text);
 assert.doesNotMatch(ui,/[А-Яа-яЁё]/);
 assert.match(ui,/data-action="ov3-tab" data-tab="agents"/);
});
