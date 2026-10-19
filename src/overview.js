
/* Workspace Overview v1.0 candidate — four operational modules, no decorative KPI strip.
   State comes from the currently selected organization; period data is a prototype fixture. */
function ov2T(ru,en){return state.locale==="en"?en:ru}
function ov2Number(v){return new Intl.NumberFormat(state.locale==="en"?"en-US":"ru-RU",{maximumFractionDigits:0}).format(Number(v)||0)}
function ov2Money(v){return new Intl.NumberFormat(state.locale==="en"?"en-US":"ru-RU",{minimumFractionDigits:Number(v)%1?2:0,maximumFractionDigits:2}).format(Number(v)||0)+" ₽"}
function ov2Metrics(){
 const period=state.ov2Period===30?30:7;
 const fixture=period===7?
 [{ru:"Пн",en:"Mon",ok:21,failed:1},{ru:"Вт",en:"Tue",ok:31,failed:2},{ru:"Ср",en:"Wed",ok:28,failed:1},{ru:"Чт",en:"Thu",ok:40,failed:2},{ru:"Пт",en:"Fri",ok:54,failed:4},{ru:"Сб",en:"Sat",ok:48,failed:3},{ru:"Вс",en:"Sun",ok:67,failed:2}]:
 [{ru:"1 нед.",en:"W1",ok:218,failed:12},{ru:"2 нед.",en:"W2",ok:243,failed:14},{ru:"3 нед.",en:"W3",ok:253,failed:13},{ru:"4 нед.",en:"W4",ok:289,failed:15}];
 const rows=state.activeOrgId==="org1"?fixture:fixture.map(r=>({...r,ok:0,failed:0}));
 const done=rows.reduce((n,r)=>n+r.ok,0),failed=rows.reduce((n,r)=>n+r.failed,0);
 return {period,rows,done,failed,total:done+failed,successRate:done+failed?Math.round(done/(done+failed)*1000)/10:0,cost:state.activeOrgId==="org1"?(period===7?72.4:261.2):0};
}
function ov3Provider(c){
 const name=String(c?.name||""),type=String(c?.type||"");
 if(/telegram/i.test(type+" "+name))return "telegram";
 if(/max bot|^max\s|^max$|макс/i.test(type+" "+name))return "max";
 if(/битрикс|bitrix/i.test(name+type))return "bitrix";
 if(/google calendar/i.test(name+type))return "google-calendar";
 if(/календарь|calendar/i.test(name+type))return "calendar";
 if(/whatsapp/i.test(type+" "+name))return "whatsapp";
 if(/viber/i.test(type+" "+name))return "viber";
 if(/email|почта/i.test(type+" "+name))return "mail";
 if(/crm/i.test(type+" "+name))return "crm";
 return "other";
}
function ov3Icon(c){
 const p=ov3Provider(c);
 if(p==="telegram")return '<svg class="ov3-logo-vector" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>';
 if(p==="max")return '<span class="ov3-logo-type ov3-logo-max" aria-hidden="true">MAX</span>';
 if(p==="bitrix")return '<span class="ov3-logo-type ov3-logo-bitrix" aria-hidden="true">24</span>';
 if(p==="google-calendar")return '<span class="ov3-logo-type" aria-hidden="true">31</span>';
 if(p==="calendar")return I("calendar",21);
 if(p==="whatsapp")return '<span class="ov3-logo-type" aria-hidden="true">W</span>';
 if(p==="viber")return '<span class="ov3-logo-type" aria-hidden="true">V</span>';
 if(p==="mail")return I("mail",21);
 if(p==="crm")return I("building",21);
 return I("plug",21);
}
function ov3ConnectionState(c){
 if(c.status==="ok")return {label:ov2T("Подключено","Connected"),className:"success"};
 if(c.status==="error"||c.status==="failed")return {label:ov2T("Ошибка","Error"),className:"error"};
 if(c.status==="pending"||c.status==="hold")return {label:ov2T("Ожидание","Pending"),className:"pending"};
 return {label:ov2T("Неактивно","Inactive"),className:"muted"};
}
function ov3AgentStatus(a){
 const status=state.scenario==="expired"?"stopped":state.scenario==="walletZero"&&a.status==="active"?"paused":a.status;
 const dict={
  active:[ov2T("Активен","Active"),"success"],
  paused:[ov2T("Пауза","Paused"),"pending"],
  stopped:[ov2T("Остановлен","Stopped"),"muted"],
  draft:[ov2T("Черновик","Draft"),"muted"]
 };
 const [label,className]=dict[status]||[String(status||"—"),"muted"];
 return {label,className};
}
function ov3AgentExecutions(a,stats){
 // Demo-only organization-scoped allocations consistent with the aggregated successful jobs above.
 // No invented counters for newly created agents, drafts or other organizations.
 if(state.activeOrgId!=="org1"||!["a1","a2"].includes(a.id))return null;
 return (stats.period===7?{a1:160,a2:129}:{a1:520,a2:483})[a.id];
}
function ov3CardHeader(title,action,label,right){
 return '<div class="ov3-card-header"><h2>'+esc(title)+'</h2><div class="ov3-card-tools">'+(right||'')+(action?'<button class="ov3-card-link" data-action="'+action+'">'+esc(label||ov2T("Все","View all"))+I("arrow",14)+'</button>':'')+'</div></div>';
}
function overview(){
 const stats=ov2Metrics();
 const connectors=Array.isArray(state.connectors)?state.connectors:[];
 const agents=Array.isArray(state.agents)?state.agents:[];
 const events=Array.isArray(state.events)?state.events:[];
 const active=agents.filter(a=>ov3AgentStatus(a).className==="success").length;
 const max=Math.max(1,...stats.rows.map(r=>r.ok+r.failed));
 const chart=stats.rows.map(r=>{
  const total=r.ok+r.failed;const label=state.locale==="en"?r.en:r.ru;
  const detail=label+": "+ov2T("успешно","successful")+" "+r.ok+", "+ov2T("ошибки","failed")+" "+r.failed;
  return '<div class="ov3-chart-day" title="'+esc(detail)+'"><div class="ov3-chart-track"><div class="ov3-chart-bar" role="img" aria-label="'+esc(detail)+'" style="height:'+((total/max)*100).toFixed(2)+'%"><span class="ov3-chart-failed" style="flex:'+r.failed+'"></span><span class="ov3-chart-done" style="flex:'+r.ok+'"></span></div></div><span>'+esc(label)+'</span></div>';
 }).join("");
 const period='<div class="ov3-range" role="group" aria-label="'+ov2T("Период","Period")+'"><button data-action="ov2-period" data-days="7" class="'+(stats.period===7?"selected":"")+'" aria-pressed="'+(stats.period===7)+'">'+ov2T("7 дней","7 days")+'</button><button data-action="ov2-period" data-days="30" class="'+(stats.period===30?"selected":"")+'" aria-pressed="'+(stats.period===30)+'">'+ov2T("30 дней","30 days")+'</button></div>';
 const activity='<section class="ov3-panel ov3-activity">'+ov3CardHeader(ov2T("Общая активность","Overall activity"),null,null,period)+
 '<div class="ov3-activity-body"><div class="ov3-activity-intro"><span>'+ov2T("Выполнения задач агентами","Agent task executions")+'</span><strong>'+ov2Number(stats.total)+'</strong></div>'+
 '<div class="ov3-chart" role="group" aria-label="'+ov2T("График работы агентов","Agent work chart")+'"><div class="ov3-chart-lines"></div>'+chart+'</div>'+
 '<div class="ov3-activity-footer"><div><i class="ov3-key success"></i><span>'+ov2T("Успешно","Successful")+'</span><strong>'+ov2Number(stats.done)+'</strong></div><div><i class="ov3-key error"></i><span>'+ov2T("С ошибкой","Failed")+'</span><strong>'+ov2Number(stats.failed)+'</strong></div><div><i class="ov3-key neutral"></i><span>'+ov2T("Успешность","Success rate")+'</span><strong>'+stats.successRate.toLocaleString(state.locale==="en"?"en-US":"ru-RU")+'%</strong></div></div></div></section>';
 const connectionRows=connectors.slice(0,6).map(c=>{
  const status=ov3ConnectionState(c),type=ov3Provider(c);
  return '<button class="ov3-connection-row" data-action="connector-detail" data-id="'+esc(c.id)+'" title="'+esc(c.name)+'"><span class="ov3-provider-icon '+type+'">'+ov3Icon(c)+'</span><span class="ov3-row-main"><strong>'+esc(translatedName(c.name))+'</strong><small>'+esc(translatedName(c.type))+'</small></span><span class="ov3-status '+status.className+'"><i></i>'+status.label+'</span>'+I("arrow",14)+'</button>';
 }).join("");
 const integration='<section class="ov3-panel ov3-connections">'+ov3CardHeader(ov2T("Состояние интеграций","Integration status"),"go-integrations",ov2T("Все","View all"))+
 '<div class="ov3-panel-scroll">'+(connectionRows||'<div class="ov3-empty">'+ov2T("Интеграции ещё не добавлены","No integrations yet")+'</div>')+'</div></section>';
 const recent=events.slice(0,6).map(e=>{
  const tone=e.type==="human"?"human":e.type==="integration"?"integration":"ai";
  const title=state.locale==="en"?tUI(e.title):e.title,description=state.locale==="en"?tUI(e.desc):e.desc;
  return '<button class="ov3-event-row" data-action="ov2-open-event" data-id="'+esc(e.id)+'"><span class="ov3-event-icon '+tone+'">'+I(tone==="human"?"users":tone==="integration"?"plug":"activity",18)+'</span><span class="ov3-row-main"><strong>'+esc(title)+'</strong><small>'+esc(description)+'</small></span><time>'+esc(e.time)+'</time></button>';
 }).join("");
 const activityLog='<section class="ov3-panel ov3-events">'+ov3CardHeader(ov2T("Последние события","Recent activity"),"go-journal",ov2T("Все события","All activity"))+
 '<div class="ov3-panel-scroll">'+(recent||'<div class="ov3-empty">'+ov2T("Событий пока нет","No events yet")+'</div>')+'</div></section>';
 const agentRows=agents.slice(0,7).map(a=>{
  const status=ov3AgentStatus(a),work=ov3AgentExecutions(a,stats),name=translatedName(a.name);
  return '<button class="ov3-agent-row" data-action="open-agent" data-id="'+esc(a.id)+'"><span class="ov3-agent-icon '+(a.type==="hr"?"hr":"general")+'">'+I(a.type==="hr"?"users":"bot",18)+'</span><span class="ov3-row-main"><strong>'+esc(name)+'</strong><small>'+esc(a.type==="hr"?ov2T("Рекрутинг","Recruiting"):ov2T("ИИ-сотрудник","AI employee"))+'</small></span><span class="ov3-agent-right"><span class="ov3-status '+status.className+'"><i></i>'+status.label+'</span><span class="ov3-agent-work">'+(work===null?"—":ov2Number(work))+' <small>'+ov2T("выполнено","executions")+'</small></span></span></button>';
 }).join("");
 const agentsPanel='<section class="ov3-panel ov3-agents">'+ov3CardHeader(ov2T("Ваши агенты","Your agents"),"go-agents",ov2T("Все агенты","All agents"),'<span class="ov3-active-count"><i></i>'+ov2Number(active)+' '+ov2T("из","of")+' '+ov2Number(agents.length)+' '+ov2T("активны","active")+'</span>')+
 '<div class="ov3-panel-scroll">'+(agentRows||'<div class="ov3-empty">'+ov2T("Агенты ещё не созданы","No agents yet")+'</div>')+'</div></section>';
 const tabs=[['activity',ov2T('Активность','Activity')],['connections',ov2T('Интеграции','Integrations')],['events',ov2T('События','Events')],['agents',ov2T('Агенты','Agents')]].map(([key,label])=>'<button data-action="ov3-tab" data-tab="'+key+'" aria-pressed="'+((state.ov3Tab||'activity')===key)+'" class="'+((state.ov3Tab||'activity')===key?'selected':'')+'">'+label+'</button>').join('');
 return '<div class="ov3-overview"><div class="ov3-mobile-tabs" role="group" aria-label="'+ov2T('Панели обзора','Overview panels')+'">'+tabs+'</div><div class="ov3-layout ov3-show-'+(state.ov3Tab||'activity')+'">'+activity+integration+activityLog+agentsPanel+'</div></div>';
}
