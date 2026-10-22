import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const content=fs.readFileSync('src/data.js','utf8');
const context={globalThis:{}};
vm.runInNewContext(content,context);
const {orgs}=context.globalThis.AIMockData;

test('each organization is isolated and has unique agent and queue ids',()=>{
  assert.ok(orgs.length>=2);
  assert.equal(new Set(orgs.map(x=>x.id)).size,orgs.length);
  for(const org of orgs){
    assert.equal(new Set(org.agents.map(a=>a.id)).size,org.agents.length);
    assert.equal(new Set(org.queue.map(a=>a.id)).size,org.queue.length);
    assert.ok(org.balance>=0);
  }
  assert.notDeepEqual(orgs[0].agents.map(x=>x.id),orgs[1].agents.map(x=>x.id));
});
test('activity totals and errors match and periods are independent',()=>{
  for(const org of orgs){
    for(const period of [7,30]){
      const d=org.activity[period];
      assert.ok(d.total>=0&&d.success>=0&&d.errors>=0);
      assert.equal(d.success+d.errors,d.total);
      assert.equal(d.counts.length,d.days.length);
      assert.equal(d.counts.reduce((a,b)=>a+b,0),d.total);
    }
  }
});
test('all references from attention queue point to valid areas',()=>{
  const valid=new Set(['approvals','inbox','integrations']);
  for(const org of orgs){for(const q of org.queue)assert.ok(valid.has(q.route));}
});

test('30-day chart uses one value per actual day and includes the last 7 days',()=>{
  for(const org of orgs){
    const week=org.activity[7], month=org.activity[30];
    assert.equal(week.counts.length,7);
    assert.equal(month.counts.length,30);
    assert.equal(month.days.length,30);
    assert.deepEqual(Array.from(month.counts.slice(-7)),Array.from(week.counts));
    assert.equal(month.counts.reduce((a,b)=>a+b,0),month.total);
    assert.ok(typeof month.range.ru==='string'&&month.range.ru.includes('2026'));
  }
});
