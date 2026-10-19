function ov2T(ru,en){return state.locale==="en"?en:ru}

function ov2Number(value){return new Intl.NumberFormat(state.locale==="en"?"en-US":"ru-RU",{maximumFractionDigits:0}).format(value)}

function ov2Money(value){return new Intl.NumberFormat(state.locale==="en"?"en-US":"ru-RU",{minimumFractionDigits:value%1?2:0,maximumFractionDigits:2}).format(value)+" ₽"}

function ov2Metrics(){
 const period=state.ov2Period===30?30:7;
 const fixture=period===7?
 [{ru:"Пн",en:"Mon",ok:21,failed:1},{ru:"Вт",en:"Tue",ok:31,failed:2},{ru:"Ср",en:"Wed",ok:28,failed:1},{ru:"Чт",en:"Thu",ok:40,failed:2},{ru:"Пт",en:"Fri",ok:54,failed:4},{ru:"Сб",en:"Sat",ok:48,failed:3},{ru:"Вс",en:"Sun",ok:67,failed:2}]:
 [{ru:"1 нед.",en:"W1",ok:218,failed:12},{ru:"2 нед.",en:"W2",ok:243,failed:14},{ru:"3 нед.",en:"W3",ok:253,failed:13},{ru:"4 нед.",en:"W4",ok:289,failed:15}];
 const rows=state.activeOrgId==="org1"?fixture:fixture.map(r=>({...r,ok:0,failed:0}));
 const done=rows.reduce((n,r)=>n+r.ok,0),failed=rows.reduce((n,r)=>n+r.failed,0);
 return {period,rows,done,failed,total:done+failed,successRate:done+failed?Math.round(done/(done+failed)*1000)/10:0,cost:state.activeOrgId==="org1"?(period===7?72.4:261.2):0};
}

function ov2Alerts(){
 const entries=[];
 if(state.scenario==="walletZero"||state.scenario==="expired"){
  entries.push({title:ov2T(state.scenario==="walletZero"?"Недостаточно средств":"Подписка неактивна",state.scenario==="walletZero"?"Insufficient funds":"Subscription inactive"),detail:ov2T("Проверьте состояние счёта и подписки","Review billing and subscription status"),action:"go-billing",kind:"warn"});
 }
 for(const n of state.notifications.filter(n=>!n.read)){
  const action=n.type==="billing"?"go-billing":n.type==="action"?"go-approvals":"go-notifications";
  entries.push({title:state.locale==="en"?tUI(n.title):n.title,detail:state.locale==="en"?tUI(n.desc):n.desc,action,kind:n.type==="billing"?"warn":"info"});
 }
 if(entries.length===0){
  const pending=state.candidates.find(c=>c.stage==="Ожидает HR");
  if(pending)entries.push({title:ov2T("Требуется решение HR","HR review required"),detail:translatedName(pending.name),action:"ov2-open-candidate",id:pending.id,kind:"info"});
 }
 return entries;
}

function overview(){
 const stats=ov2Metrics();
 const active=state.scenario==="expired"||state.scenario==="walletZero"?0:state.agents.filter(a=>a.status==="active").length;
 const org=currentOrg(), balance=Number(state.orgs?.find(o=>o.id===state.activeOrgId)?.balance)||0,limit=Number(state.plans?.find(p=>p.name===org.plan)?.agents)||10;
 const attention=ov2Alerts();const events=state.events.slice(0,5);const agents=state.agents.slice(0,6);
 const tab=state.ov2MobileTab||"activity";
 const max=Math.max(1,...stats.rows.map(x=>x.ok+x.failed));
 const chart=stats.rows.map((r,i)=>{
  const total=r.ok+r.failed;const height=total/max*100;
  const label=state.locale==="en"?r.en:r.ru;
  const detail=`${label}: ${ov2T("успешно","successful")} ${r.ok}, ${ov2T("ошибок","failed")} ${r.failed}`;
  return `<div class="ov2-day" title="${esc(detail)}"><div class="ov2-chart-column"><div class="ov2-bar" style="height:${height.toFixed(2)}%" role="img" aria-label="${esc(detail)}"><span class="ov2-bar-error" style="flex:${r.failed}"></span><span class="ov2-bar-success" style="flex:${r.ok}"></span></div></div><span class="ov2-day-label">${esc(label)}</span></div>`;
 }).join("");
 const statusRows=agents.map((a,i)=>{
  const isLast=state.activeOrgId==="org1"&&i<2;
  const count=isLast?(stats.period===7?(i===0?190:114):(i===0?650:407)):0;
  const type=a.type==="hr"?ov2T("Рекрутинг","Recruiting"):ov2T("Продажи и поддержка","Sales & support");
  return `<button class="ov2-agent-row" data-action="open-agent" data-id="${esc(a.id)}"><span class="ov2-agent-symbol">${I(a.type==="hr"?"users":"bot",16)}</span><span class="ov2-agent-name"><strong>${esc(translatedName(a.name))}</strong><small>${esc(type)}</small></span><span class="ov2-agent-status">${statusBadge(a.status)}</span><span class="ov2-agent-count">${ov2Number(count)}</span>${I("arrow",14)}</button>`;
 }).join("");
 const alerts=attention.map(n=>`<button class="ov2-alert-row" data-action="${esc(n.action)}"${n.id?` data-id="${esc(n.id)}"`:""}><span class="ov2-alert-symbol ${n.kind}">${I(n.kind==="warn"?"alert":"clipboard",17)}</span><span class="ov2-alert-text"><strong>${esc(n.title)}</strong><small>${esc(n.detail)}</small></span>${I("arrow",14)}</button>`).join("");
 const eventRows=events.map(e=>`<button class="ov2-event-row" data-action="ov2-open-event" data-id="${esc(e.id)}"><span class="ov2-event-point ${e.type==="human"?"human":e.type==="integration"?"integration":"ai"}"></span><span class="ov2-event-copy"><strong>${esc(state.locale==="en"?tUI(e.title):e.title)}</strong><small>${esc(state.locale==="en"?tUI(e.desc):e.desc)}</small></span><time>${esc(e.time)}</time></button>`).join("");
 const mobileTabs=[["activity",ov2T("Активность","Activity")],["attention",ov2T("Внимание","Attention")],["agents",ov2T("Агенты","Agents")],["events",ov2T("События","Events")]].map(([key,label])=>`<button data-action="ov2-tab" data-tab="${key}" class="${tab===key?"selected":""}" aria-pressed="${tab===key}">${label}</button>`).join("");
 return `<div class="ov2-dashboard">

 <div class="ov2-kpis">
  <button class="ov2-kpi" data-action="go-agents"><span class="ov2-kpi-label">${ov2T("ИИ-сотрудники","AI employees")}</span><strong>${ov2Number(state.agents.length)} <em>/ ${ov2Number(limit)}</em></strong><span class="ov2-kpi-icon">${I("bot",18)}</span></button>
  <button class="ov2-kpi" data-action="go-agents"><span class="ov2-kpi-label">${ov2T("Активные агенты","Active agents")}</span><strong>${ov2Number(active)}</strong><span class="ov2-kpi-icon">${I("activity",18)}</span></button>
  <button class="ov2-kpi" data-action="go-analytics"><span class="ov2-kpi-label">${ov2T("Выполнения","Executions")}</span><strong>${ov2Number(stats.total)}</strong><span class="ov2-kpi-icon">${I("chart",18)}</span></button>
  <button class="ov2-kpi ${balance<=300?"ov2-kpi-warning":""}" data-action="go-billing"><span class="ov2-kpi-label">${ov2T("AI-баланс","AI balance")}</span><strong>${ov2Money(balance)}</strong><span class="ov2-kpi-icon">${I("wallet",18)}</span></button>
 </div>
 <div class="ov2-mobile-tabs" role="group" aria-label="${ov2T("Разделы обзора","Overview panels")}">${mobileTabs}</div>
 <div class="ov2-main ov2-show-${tab}">
  <section class="ov2-card ov2-activity"><div class="ov2-card-head"><div><h2>${ov2T("Активность агентов","Agent activity")}</h2><p>${ov2T("Выполнения задач и результаты","Task executions and outcomes")}</p></div><div class="ov2-period" role="group" aria-label="${ov2T("Период статистики","Statistics period")}"><button data-action="ov2-period" data-days="7" aria-pressed="${stats.period===7}" class="${stats.period===7?"selected":""}">${ov2T("7 дней","7 days")}</button><button data-action="ov2-period" data-days="30" aria-pressed="${stats.period===30}" class="${stats.period===30?"selected":""}">${ov2T("30 дней","30 days")}</button></div></div>
  <div class="ov2-activity-summary"><div><strong>${ov2Number(stats.total)}</strong><span>${ov2T("выполнений","executions")}</span></div><div><strong>${stats.successRate.toLocaleString(state.locale==="en"?"en-US":"ru-RU")}%</strong><span>${ov2T("успешно","success rate")}</span></div><div><strong>${ov2Money(stats.cost)}</strong><span>${ov2T("расходы на ИИ","AI spending")}</span></div></div>
  <div class="ov2-chart" role="group" aria-label="${ov2T("График выполнений","Execution chart")}"><div class="ov2-grid-lines"></div>${chart}</div>
  <div class="ov2-chart-legend"><span><i class="ov2-legend-good"></i>${ov2T("Успешно","Successful")} · ${ov2Number(stats.done)}</span><span><i class="ov2-legend-bad"></i>${ov2T("С ошибкой","Failed")} · ${ov2Number(stats.failed)}</span></div>
  </section>
  <section class="ov2-card ov2-attention"><div class="ov2-card-head"><h2>${ov2T("Требует внимания","Needs attention")}</h2><span class="ov2-count">${attention.length}</span></div><div class="ov2-scroll">${alerts||`<div class="ov2-empty">${I("check",20)}<span>${ov2T("Нет событий, требующих внимания","Nothing needs your attention")}</span></div>`}</div></section>
  <section class="ov2-card ov2-agents"><div class="ov2-card-head"><h2>${ov2T("Состояние агентов","Agent status")}</h2><span class="ov2-card-context">${ov2Number(state.agents.length)} ${ov2T("всего","total")}</span></div><div class="ov2-agent-columns"><span>${ov2T("Агент","Agent")}</span><span>${ov2T("Статус","Status")}</span><span>${ov2T("Выполнено","Executions")}</span><span></span></div><div class="ov2-scroll">${statusRows||`<div class="ov2-empty">${ov2T("Агенты пока не созданы","No agents yet")}</div>`}</div></section>
  <section class="ov2-card ov2-events"><div class="ov2-card-head"><h2>${ov2T("Последние события","Recent activity")}</h2><span class="ov2-card-context">${I("clock",16)}</span></div><div class="ov2-scroll">${eventRows||`<div class="ov2-empty">${ov2T("Событий пока нет","No events yet")}</div>`}</div></section>
 </div>
 </div>`;
}
