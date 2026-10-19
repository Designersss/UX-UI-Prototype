import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/overview.js', import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html', import.meta.url),'utf8');

function harness(){
 const state={
  locale:'ru',ov2Period:7,activeOrgId:'org1',scenario:'active',
  agents:[{id:'a1',name:'Менеджер продаж',type:'sales',status:'active'},{id:'a2',name:'Рекрутер',type:'hr',status:'active'},{id:'a3',name:'Поддержка',type:'sales',status:'draft'}],
  plans:[{name:'Plus',agents:10},{name:'Free',agents:10}],
  orgs:[{id:'org1',balance:1850},{id:'org2',balance:0}],
  organizations:[{id:'org1',plan:'Plus',name:'Норд Групп'},{id:'org2',plan:'Free',name:'СтройПроект'}],
  notifications:[],candidates:[],events:[],
 };
 const ctx=vm.createContext({
  state,
  I:()=>'<svg></svg>',
  esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
  currentOrg:()=>state.organizations.find(x=>x.id===state.activeOrgId),
  statusBadge:status=>'<span>'+status+'</span>',
  translatedName:name=>state.locale==='en'?'Translated agent':name,
  tUI:value=>value,
 });
 new vm.Script(source,{filename:'overview.js'}).runInContext(ctx);
 return {state,run:expr=>vm.runInContext(expr,ctx)};
}

test('all overview entry assets exist and are loaded in dependency order',()=>{
 assert.ok(fs.existsSync(new URL('../src/styles/overview.css',import.meta.url)));
 assert.ok(html.indexOf('src/overview.js')<html.indexOf('src/app.js'));
 assert.ok(html.indexOf('styles/theme.css')<html.indexOf('styles/overview.css'));
});
test('the weekly and monthly KPI totals are consistent with the chart',()=>{
 const {state,run}=harness();
 assert.equal(run('ov2Metrics().done'),289);
 assert.equal(run('ov2Metrics().failed'),15);
 assert.equal(run('ov2Metrics().total'),304);
 assert.equal(run('ov2Metrics().cost'),72.4);
 state.ov2Period=30;
 assert.equal(run('ov2Metrics().total'),1057);
 assert.equal(run('ov2Metrics().failed'),54);
 assert.equal(run('ov2Metrics().cost'),261.2);
});
test('dashboard has functional period, event and agent destinations',()=>{
 const {run}=harness();
 const output=run('overview()');
 for(const action of ['ov2-period','go-agents','go-analytics','go-billing','ov2-tab'])
  assert.match(output,new RegExp('data-action="'+action+'"'));
 assert.match(output,/1[\s\u00a0\u202f]850\s*₽/);
 assert.doesNotMatch(output,/Добрый день|Все важное в AIMock|Работающие сейчас|Новый агент/);
});
test('other organizations have no leaked operations or spending fixtures',()=>{
 const {state,run}=harness();
 state.activeOrgId='org2';state.agents=[];
 assert.equal(run('ov2Metrics().total'),0);
 assert.equal(run('ov2Metrics().cost'),0);
 assert.match(run('overview()'),/0\s*₽/);
 assert.doesNotMatch(run('overview()'),/Менеджер продаж/);
});
test('English Overview chrome is translated, even in the empty state',()=>{
 const {state,run}=harness();
 state.locale='en';state.agents=[];
 const output=run('overview()');
 assert.match(output,/Overview/);
 assert.match(output,/Task executions and outcomes/);
 assert.match(output,/Needs attention/);
 assert.match(output,/No agents yet/);
 assert.doesNotMatch(output,/[А-Яа-яЁё]/);
});
test('billing, HR and notification alerts are actionable and scoped',()=>{
 const {state,run}=harness();
 state.scenario='walletZero';
 state.notifications=[{id:'n1',type:'billing',title:'Billing warning',desc:'Renew your plan',read:false}];
 assert.match(run('overview()'),/data-action="go-billing"/);
 assert.equal(run('ov2Alerts().length'),2);
 state.notifications=[];state.scenario='active';
 state.candidates=[{id:'k1',name:'Иван Петров',stage:'Ожидает HR'}];
 assert.match(run('overview()'),/data-action="ov2-open-candidate" data-id="k1"/);
});
