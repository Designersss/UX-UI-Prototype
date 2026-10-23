(function appSource(){
"use strict";
const data=globalThis.AIMockData;
const Agents=globalThis.AIMockAgents;
const Creator=globalThis.AIMockCreator;
const Editor=globalThis.AIMockApprovedEditor;
const Detail=globalThis.AIMockAgentDetail;
const Guide=globalThis.AIMockAgentGuide;
const Picker=globalThis.AIMockPicker;
const storageKey="aimock-premium-calm-preferences-v1";
let stored={};
try{stored=JSON.parse(localStorage.getItem(storageKey)||"{}");}catch(_){}
let state={org:stored.org||"north",theme:stored.theme||"light",locale:stored.locale||"ru",period:stored.period===30?30:7,selected:"telegram",menu:false,account:false,panelOpen:false,context:null};
const translations={
ru:{overview:"Обзор",agents:"Агенты",inbox:"Сообщения",approvals:"Согласования",contacts:"Контакты",knowledge:"База знаний",integrations:"Интеграции",analytics:"Аналитика",journal:"Журнал действий",notifications:"Уведомления",help:"Справка",finance:"Финансы",settings:"Настройки",search:"Поиск",profile:"Профиль",workspace:"Организация",week:"7 дней",month:"30 дней",openQueue:"Открыть очередь",attention:"Требуют внимания",activity:"Общая активность",executions:"Выполненные задачи агентов",completed:"Выполнено",success:"Успешно",errors:"Ошибки",agentsTitle:"Ваши агенты",integrationTitle:"Интеграции",recent:"Последние события",allJournal:"Весь журнал",active:"Активен",paused:"Пауза",draft:"Черновик",connected:"Подключено",auth:"Нужен вход",control:"На контроле",actionCount:"действия требуют участия",details:"Подробности",lastCheck:"Последняя проверка",reconnect:"Переподключить",notificationsTitle:"Центр уведомлений",balanceTitle:"ПОДПИСКА И БАЛАНС",aiBalance:"AI-баланс",openFinance:"Финансы",profileMode:"Внешний вид",language:"Язык",switchOrg:"Сменить организацию",empty:"Нет данных за выбранный период",underConstruction:"Экран в проектировании",underConstructionDesc:"Эту страницу реализуем отдельным этапом после согласования дизайна. Пока доступен интерактивный Обзор.",back:"Вернуться к обзору",searchPlaceholder:"Поиск по агентам и подключениям",noMatches:"Ничего не найдено",mockLabel:"Демонстрационные данные",periodCaption:"Последние",openAgent:"Карточка агента",openIntegration:"Открыть подключение",openJournal:"Открыть событие"},
en:{overview:"Overview",agents:"Agents",inbox:"Messages",approvals:"Approvals",contacts:"Contacts",knowledge:"Knowledge base",integrations:"Integrations",analytics:"Analytics",journal:"Activity log",notifications:"Notifications",help:"Help",finance:"Finance",settings:"Settings",search:"Search",profile:"Profile",workspace:"Organization",week:"7 days",month:"30 days",openQueue:"Open queue",attention:"Need attention",activity:"Overall activity",executions:"Completed agent tasks",completed:"Completed",success:"Successful",errors:"Errors",agentsTitle:"Your agents",integrationTitle:"Integrations",recent:"Recent events",allJournal:"Full journal",active:"Active",paused:"Paused",draft:"Draft",connected:"Connected",auth:"Sign in required",control:"Requires attention",actionCount:"items require your attention",details:"Details",lastCheck:"Last checked",reconnect:"Reconnect",notificationsTitle:"Notifications center",balanceTitle:"SUBSCRIPTION & BALANCE",aiBalance:"AI balance",openFinance:"Finance",profileMode:"Appearance",language:"Language",switchOrg:"Switch organization",empty:"No activity in this period",underConstruction:"Page in design",underConstructionDesc:"We will build this page after its design review. The interactive Overview is available now.",back:"Back to overview",searchPlaceholder:"Search agents and integrations",noMatches:"No matches",mockLabel:"Sample data",periodCaption:"Last",openAgent:"Agent details",openIntegration:"Integration detail",openJournal:"Open event"}};
const T=(key)=>translations[state.locale][key]||key;
const escapeHtml=(s)=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const icons={
overview:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
agents:'<circle cx="12" cy="4.8" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="m11 7-5 9m7-9 5 9M7 19h10"/>',
inbox:'<path d="M4 5h16v12H9l-5 4z"/>',
approvals:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 3 3 5-6"/>',
contacts:'<circle cx="8" cy="9" r="3"/><path d="M2 20c0-4 2.5-6 6-6s6 2 6 6"/><path d="M17 7c3 0 4 5 0 6m1 2c2 0 4 2 4 5"/>',
knowledge:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>',
integrations:'<path d="M9 10 6 7a4 4 0 0 0-5 6l3 3a4 4 0 0 0 6-5m4 3 3 3a4 4 0 0 0 6-5l-3-3a4 4 0 0 0-6 5m-7 2 9-9"/>',
analytics:'<path d="M4 19v-6M10 19V6M16 19v-9M22 19V3"/>',
journal:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>',
notifications:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 10h18c0-2-3-3-3-10M10 21h4"/>',
help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3c-1 .5-1 1.5-1 3m0 3h.01"/>',
finance:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M15 11h6m-6-2v4"/>',
settings:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/>',
search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
chevron:'<path d="m8 10 4 4 4-4"/>',
arrow:'<path d="m5 12 14 0m-6-6 6 6-6 6"/>',
alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/>',
link:'<path d="M9 9 6 6a4 4 0 0 0-5 6l3 3a4 4 0 0 0 6-5m4 4 3 3a4 4 0 0 0 6-5l-3-3a4 4 0 0 0-6 5"/>',
menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
close:'<path d="M5 5 19 19M19 5 5 19"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2m0-14-2 2M7 17l-2 2"/>',
moon:'<path d="M20 14A8 8 0 0 1 10 4 8 8 0 1 0 20 14"/>',
check:'<path d="m5 12 4 4L19 6"/>',
sparkles:'<path d="m12 2 2.1 6.4L21 11l-6.9 2.3L12 20l-2.1-6.7L3 11l6.9-2.6z"/><path d="m19 19 .7 1.3L21 21l-1.3.6L19 23l-.7-1.4L17 21l1.3-.7z"/>',
message:'<path d="M4 5h16v12H9l-5 4z"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v7m0-10h.01"/>'
};
const icon=(name,size=18)=>'<svg aria-hidden="true" viewBox="0 0 24 24" width="'+size+'" height="'+size+'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+(icons[name]||icons.overview)+'</svg>';
const org=()=>data.orgs.find(o=>o.id===state.org)||data.orgs[0];
const persisted=()=>{try{localStorage.setItem(storageKey,JSON.stringify({org:state.org,theme:state.theme,locale:state.locale,period:state.period}));}catch(_){}};
const route=()=>{const p=(location.hash||"#/overview").slice(2).split("/").filter(Boolean);return {section:p[0]||"overview",id:p[1]||null,sub:p[2]||null,step:p[3]||null};};
const nav=[["overview","overview"],["agents","agents"],["inbox","inbox",4],["approvals","approvals",2],["contacts","contacts"],["knowledge","knowledge"],["integrations","integrations"],["analytics","analytics"],["journal","journal"],["notifications","notifications",3],["help","help"],["finance","finance"],["settings","settings"]];
function sidebar(section,o){
 return '<aside class="sidebar '+(state.menu?"is-open":"")+'" aria-label="Workspace navigation">'+
 '<a class="brand" href="#/overview" aria-label="AIMock overview"><span class="brand-mark"><i></i><i></i><i></i><i></i></span><span>AIMock</span></a>'+
 '<button type="button" class="org-switch" data-account="1"><span class="org-avatar">С</span><span class="org-info"><strong>'+escapeHtml(o.name)+'</strong><small>'+escapeHtml(o.plan)+' · '+T("workspace")+'</small></span>'+icon("chevron",15)+'</button>'+
 '<button type="button" class="sidebar-search" data-search="1">'+icon("search",17)+'<span>'+T("search")+'</span><kbd>⌘ K</kbd></button>'+
 '<nav class="nav-list" aria-label="Main">'+nav.map(([key,ic,badge])=>'<a href="#/'+key+'" class="nav-item '+(section===key?"is-active":"")+'" '+(section===key?'aria-current="page"':'')+'>'+icon(ic,18)+'<span>'+T(key)+'</span>'+(badge?'<b>'+badge+'</b>':'')+'</a>').join('')+'</nav>'+
 '<button class="profile" type="button" data-account="1"><span class="profile-avatar">А</span><span><strong>'+escapeHtml(o.user)+'</strong><small>'+escapeHtml(o.role)+'</small></span>'+icon("chevron",14)+'</button>'+
 (state.account?'<div class="account-menu" role="group" aria-label="Preferences"><p>'+T("switchOrg")+'</p>'+data.orgs.map(x=>'<button type="button" data-org="'+x.id+'" class="'+(x.id===state.org?'selected':'')+'">'+escapeHtml(x.name)+(x.id===state.org?' ✓':'')+'</button>').join('')+'<hr><p>'+T("profileMode")+'</p><div class="account-row"><button data-theme="light" aria-pressed="'+(state.theme==="light")+'">'+icon("sun")+'</button><button data-theme="dark" aria-pressed="'+(state.theme==="dark")+'">'+icon("moon")+'</button></div><p>'+T("language")+'</p><div class="account-row"><button data-locale="ru" aria-pressed="'+(state.locale==="ru")+'">RU</button><button data-locale="en" aria-pressed="'+(state.locale==="en")+'">EN</button></div></div>':'')+
 '</aside>';
}
const statusLabel=(s)=>s==="active"?T("active"):s==="stopped"?(state.locale==="ru"?"Остановлен вручную":"Manually stopped"):s==="paused"?T("paused"):s==="draft"?T("draft"):s==="auth"?T("auth"):T("connected");
const brandAssets=Object.freeze({telegram:"telegram.svg",max:"max.svg",vk:"vk.svg",whatsapp:"whatsapp.svg",viber:"viber.svg",bitrix:"bitrix24.svg",bitrix24:"bitrix24.svg",googlecalendar:"googlecalendar.svg"});
const brandIcon=(provider)=>{const key=brandAssets[provider];return key?'<span class="brand-logo"><img src="./src/assets/logos/'+key+'" alt="'+escapeHtml(provider)+'" width="26" height="26"></span>':'<span class="brand-logo generic" aria-hidden="true">'+icon("integrations",17)+'</span>';};
function chart(activity){
 const max=Math.max(1,...activity.counts);
 const span=activity.days.length;return '<div class="chart '+(span===30?"chart-month":"")+'" role="img" aria-label="'+escapeHtml(T("activity"))+' '+escapeHtml(activity.range[state.locale])+'"><div class="chart-grid"><i></i><i></i><i></i><i></i></div><div class="bars">'+activity.counts.map((v,i)=>'<div class="bar-col" title="'+escapeHtml(activity.days[i])+': '+v+'" aria-label="'+escapeHtml(activity.days[i])+': '+v+'"><div class="bar" style="height:'+Math.max(v?5:1,Math.round(v/max*100))+'%"></div>'+(span===7||i===0||i===span-1||i%5===0?'<small>'+escapeHtml(activity.days[i])+'</small>':'')+'</div>').join('')+'</div></div>';
}
function overview(o){
 const activity=o.activity[state.period];const success=activity.total?(activity.success/activity.total*100).toLocaleString(state.locale==="ru"?"ru-RU":"en-US",{maximumFractionDigits:1})+"%":"—";
 const attention=o.queue.length;
 const agentRows=o.agents.slice(0,3).map(a=>'<button type="button" class="line-item '+(state.context?.type==="agent"&&state.context.id===a.id?"is-context-selected":"")+'" data-preview="agent:'+escapeHtml(a.id)+'" aria-pressed="'+!!(state.context?.type==="agent"&&state.context.id===a.id)+'"><span class="mini-glyph '+(a.type==="hr"?"lilac":"")+'">'+icon("agents",16)+'</span><span class="line-name">'+escapeHtml(a.name)+'</span><span class="line-status '+a.state+'">'+statusLabel(a.state)+'</span></button>').join('');
 const integRows=o.integrations.slice(0,3).map(i=>'<button type="button" class="line-item '+(state.context?.type==="integration"&&state.context.id===i.id?"is-context-selected":"")+'" data-preview="integration:'+escapeHtml(i.id)+'" aria-pressed="'+!!(state.context?.type==="integration"&&state.context.id===i.id)+'">'+brandIcon(i.brand)+'<span class="line-name">'+escapeHtml(i.name)+'</span><span class="line-status '+i.status+'">'+statusLabel(i.status)+'</span></button>').join('');
 const eventRows=o.events.slice(0,3).map(e=>'<button type="button" class="event-row '+(state.context?.type==="event"&&state.context.id===e.id?"is-context-selected":"")+'" data-preview="event:'+escapeHtml(e.id)+'" aria-pressed="'+!!(state.context?.type==="event"&&state.context.id===e.id)+'"><time>'+escapeHtml(e.time)+'</time><span>'+escapeHtml(e.text)+'</span><small class="'+e.state+'">'+(e.state==="success"?T("success"):e.state==="pending"?(state.locale==="ru"?"Ожидает":"Pending"):(state.locale==="ru"?"Передан":"Handed off"))+'</small></button>').join('');
 return '<header class="page-head"><div><h1>'+T("overview")+'</h1><p>'+ (state.locale==="ru"?"Состояние команды · "+activity.range.ru:"Team status · "+activity.range.en)+'</p></div><div class="segmented" role="group" aria-label="Period"><button type="button" data-period="7" aria-pressed="'+(state.period===7)+'">'+T("week")+'</button><button type="button" data-period="30" aria-pressed="'+(state.period===30)+'">'+T("month")+'</button></div></header>'+
 (attention?'<button class="alert-banner" type="button" data-queue="1"><span class="attention-icon">!</span><strong>'+T("attention")+': '+attention+'</strong><span>'+T("openQueue")+' '+icon("arrow",16)+'</span></button>':'')+
 '<section class="surface activity-card"><div class="card-title"><div><h2>'+T("activity")+'</h2><p>'+T("executions")+' · '+escapeHtml(activity.range[state.locale])+'</p></div></div>'+
 '<div class="metrics"><div><small>'+T("completed")+'</small><strong>'+activity.total.toLocaleString("ru-RU")+'</strong><span>'+T("periodCaption")+' '+state.period+' '+(state.locale==="ru"?"дней":"days")+'</span></div><div><small>'+T("success")+'</small><strong>'+success+'</strong><span>'+activity.success.toLocaleString("ru-RU")+' '+(state.locale==="ru"?"задач":"tasks")+'</span></div><div><small>'+T("errors")+'</small><strong>'+activity.errors.toLocaleString("ru-RU")+'</strong><span>'+ (activity.total?(activity.errors/activity.total*100).toFixed(1).replace(".",","):"0")+'% '+(state.locale==="ru"?"от всех":"of all")+'</span></div></div>'+chart(activity)+'</section>'+
 '<div class="summary-grid"><section class="surface compact-card"><div class="card-title"><h2>'+T("agentsTitle")+'</h2><a href="#/agents">'+o.agents.filter(a=>a.state==="active").length+' '+(state.locale==="ru"?"активны из":"active of")+' '+o.agents.length+' '+icon("arrow",13)+'</a></div><div class="lines">'+(agentRows||'<p class="empty">'+T("empty")+'</p>')+'</div></section>'+
 '<section class="surface compact-card"><div class="card-title"><h2>'+T("integrationTitle")+'</h2><a href="#/integrations">'+o.integrations.filter(i=>i.status==="connected").length+' '+(state.locale==="ru"?"работают":"working")+' · '+o.integrations.filter(i=>i.status!=="connected").length+' '+(state.locale==="ru"?"проблема":"issues")+' '+icon("arrow",13)+'</a></div><div class="lines">'+(integRows||'<p class="empty">'+T("empty")+'</p>')+'</div></section></div>'+
 '<section class="surface events-card"><div class="card-title"><h2>'+T("recent")+'</h2><a href="#/journal">'+T("allJournal")+' '+icon("arrow",14)+'</a></div><div class="events">'+(eventRows||'<p class="empty">'+T("empty")+'</p>')+'</div></section>';
}
function previewPanel(o){
 if(!state.context)return "";
 const {type,id}=state.context;
 let title="",subtitle="",eyebrow="",badge="",stamp="",description="",facts="",target="",action="",avatar="";
 if(type==="agent"){
   const a=o.agents.find(x=>x.id===id);
   if(!a)return "";
   title=a.name;
   eyebrow=state.locale==="ru"?"АГЕНТ":"AGENT";
   subtitle=state.locale==="ru"?"Контекст выбранного агента":"Selected agent";
   badge=statusLabel(a.state);
   stamp=state.locale==="ru"?"Последняя активность":"Last activity";
   description=state.locale==="ru"?"Проверьте состояние агента и перейдите в его карточку для подробного управления.":"Review the agent status and open the dedicated page to manage it.";
   facts='<div><dt>'+(state.locale==="ru"?"Тип":"Type")+'</dt><dd>'+escapeHtml(a.type==="hr"?(state.locale==="ru"?"Рекрутер":"Recruiter"):(state.locale==="ru"?"Менеджер заявок":"Lead manager"))+'</dd></div>'+
         '<div><dt>'+stamp+'</dt><dd>'+escapeHtml(a.last)+'</dd></div>';
   avatar='<span class="context-avatar agent '+(a.type==="hr"?"lilac":"")+'">'+icon("agents",26)+'</span>';
   target="#/agents/"+encodeURIComponent(id);
   action=T("openAgent");
 }else if(type==="integration"){
   const i=o.integrations.find(x=>x.id===id);
   if(!i)return "";
   title=i.name;
   eyebrow=state.locale==="ru"?"ИНТЕГРАЦИЯ":"INTEGRATION";
   subtitle=state.locale==="ru"?"Сведения о подключении":"Connection details";
   badge=statusLabel(i.status);
   description=i.detail||(state.locale==="ru"?"Подключение работает, критических ошибок нет.":"Integration is connected with no critical errors.");
   facts='<div><dt>'+T("lastCheck")+'</dt><dd>'+escapeHtml(i.last)+'</dd></div>';
   avatar='<span class="context-avatar integration">'+brandIcon(i.brand)+'</span>';
   target="#/integrations/"+encodeURIComponent(id);
   action=T("openIntegration");
 }else if(type==="event"){
   const e=o.events.find(x=>x.id===id);
   if(!e)return "";
   title=e.text;
   eyebrow=state.locale==="ru"?"СОБЫТИЕ":"EVENT";
   subtitle=state.locale==="ru"?"Журнал активности":"Activity log";
   badge=e.state==="success"?T("success"):e.state==="pending"?(state.locale==="ru"?"Ожидает":"Pending"):(state.locale==="ru"?"Передано человеку":"Handed to team");
   description=state.locale==="ru"?"Это событие сохранено в журнале действий. Полная хронология и связанные объекты доступны на отдельной странице.":"This event is stored in the activity log. View the full timeline and related items on its own page.";
   facts='<div><dt>'+(state.locale==="ru"?"Время события":"Event time")+'</dt><dd>'+escapeHtml(e.time)+'</dd></div>';
   avatar='<span class="context-avatar event">'+icon("journal",25)+'</span>';
   target="#/journal/"+encodeURIComponent(id);
   action=T("openJournal");
 }else return "";
 const back=state.locale==="ru"?"На контроле":"Attention queue";
 const statusClass=type==="integration"&&o.integrations.find(x=>x.id===id)?.status==="auth"?"warning":"neutral";
 return '<aside class="right-rail right-rail-context '+(state.panelOpen?'mobile-open':'')+'" id="right-rail" aria-label="'+escapeHtml(eyebrow)+'">'+
 '<div class="context-top"><button type="button" class="context-back" data-back-control="1">'+icon("arrow",16)+'<span>'+back+'</span></button>'+
 '<button class="close-mobile" type="button" data-close-panel="1" aria-label="'+(state.locale==="ru"?"Закрыть панель":"Close panel")+'">'+icon("close")+'</button></div>'+
 '<div class="context-head" aria-live="polite"><span class="eyebrow">'+escapeHtml(eyebrow)+'</span>'+
 '<div class="context-identity">'+avatar+'<div><h2>'+escapeHtml(title)+'</h2><p>'+escapeHtml(subtitle)+'</p></div></div>'+
 '<span class="context-status '+statusClass+'"><span aria-hidden="true"></span>'+escapeHtml(badge)+'</span></div>'+
 '<section class="context-section"><h3>'+(state.locale==="ru"?"Информация":"Information")+'</h3>'+
 '<dl class="context-facts">'+facts+'</dl></section>'+
 '<section class="context-section"><h3>'+(state.locale==="ru"?"Подробности":"Details")+'</h3><p>'+escapeHtml(description)+'</p></section>'+
 '<div class="context-actions"><a class="btn btn-dark" href="'+escapeHtml(target)+'">'+escapeHtml(action)+' '+icon("arrow",15)+'</a>'+
 '<span>'+(state.locale==="ru"?"Полная информация откроется на отдельной странице":"Full details open on a separate page")+'</span></div></aside>';
}
function controlPanel(o){
 if(state.context){const panel=previewPanel(o);if(panel)return panel;state.context=null;}
 const selected=o.queue.find(x=>x.id===state.selected)||o.queue[0];
 const rowList=o.queue.map(q=>'<button class="queue-item '+(selected&&selected.id===q.id?"selected":"")+'" data-select="'+escapeHtml(q.id)+'" aria-pressed="'+!!(selected&&selected.id===q.id)+'"><span class="queue-icon">'+icon(q.kind==="approval"?"approvals":q.kind==="handoff"?"inbox":"integrations",18)+'</span><span><strong>'+escapeHtml(q.title)+'</strong><small>'+escapeHtml(q.sub)+'</small></span></button>').join('');
 const subHtml=selected?'<div class="detail-content"><p class="eyebrow">'+T("details")+'</p><div class="detail-leading"><span class="mini-glyph warm">'+icon(selected.kind==="integration"?"integrations":selected.kind==="approval"?"approvals":"inbox")+'</span><div><strong>'+escapeHtml(selected.title)+'</strong><small>'+ (selected.kind==="integration"? (state.locale==="ru"?"Ошибка авторизации":"Authorization issue") : (state.locale==="ru"?"Требуется действие":"Action required"))+'</small></div></div><small class="detail-label">'+T("lastCheck")+'</small><b>'+ (selected.kind==="integration"?"Сегодня, 12:10":selected.sub)+'</b><p class="detail-desc">'+escapeHtml(selected.detail)+'</p><a class="btn btn-dark" href="#/'+escapeHtml(selected.route)+'">'+escapeHtml(selected.action)+' '+icon("arrow",15)+'</a>'+(selected.kind==="integration"?'<button class="btn btn-light" type="button" data-reconnect="1">'+T("reconnect")+'</button>':'')+'</div>':'<div class="detail-content"><p class="empty">'+T("empty")+'</p></div>';
 return '<aside class="right-rail '+(state.panelOpen?'mobile-open':'')+'" id="right-rail" aria-label="'+T("control")+'"><div class="rail-top"><a class="round-btn" href="#/notifications" aria-label="'+T("notifications")+'">'+icon("notifications",20)+'</a><span class="notif-number">'+o.queue.length+'</span><button class="close-mobile" type="button" data-close-panel="1" aria-label="Close">'+icon("close")+'</button></div><h2>'+T("control")+'</h2><p class="rail-sub">'+o.queue.length+' '+T("actionCount")+'</p>'+
 '<div class="queue-list">'+(rowList||'<p class="empty">'+T("empty")+'</p>')+'</div>'+subHtml+
 '<div class="rail-billing"><p class="eyebrow">'+T("balanceTitle")+'</p><strong>'+escapeHtml(o.plan)+' · '+ (state.locale==="ru"?"до ":"until ")+escapeHtml(o.periodEnd)+'</strong><div class="balance-row"><span>'+T("aiBalance")+'</span><a href="#/finance">'+T("openFinance")+'</a></div><div class="balance-number">'+o.balance.toLocaleString("ru-RU")+' ₽</div></div></aside>';
}
function placeholder(section,id,sub,step){
 const n=T(section)||section;
 const fromAgent=id==="from-agent"&&sub&&(sub==="new"||Creator.draft(org(),sub))&&["knowledge","integrations","help"].includes(section);
 const target=fromAgent&&sub==="new"?"#/agents/new":fromAgent&&Creator.draft(org(),sub)?"#/agents/"+encodeURIComponent(sub)+"/edit/tools":fromAgent?"#/agents/"+encodeURIComponent(sub)+"/"+(section==="knowledge"?"setup/4":section==="integrations"?"setup/5":step==="testing"?"testing":"setup/"+Math.max(1,Math.min(7,Number(step)||2))):"#/overview";
 const caption=fromAgent?(state.locale==="ru"?"Вернуться к настройке агента":"Back to agent setup"):T("back");
 return '<header class="page-head"><div>'+(fromAgent?'<a class="wizard-back-link" href="'+target+'">← '+caption+'</a>':'')+
 '<h1>'+escapeHtml(n)+'</h1><p>'+T("mockLabel")+'</p></div></header>'+
 '<div class="surface coming-page"><span class="coming-icon">'+icon(section==="agents"?"agents":section==="integrations"?"integrations":"overview",32)+'</span><h2>'+T("underConstruction")+'</h2><p>'+T("underConstructionDesc")+'</p>'+
 (id&&!fromAgent?'<p class="placeholder-id">ID: '+escapeHtml(id)+'</p>':'')+
 '<a class="btn btn-dark" href="'+target+'">← '+caption+'</a></div>';
}
function render(){
 const o=org(),r=route();
 if(!o.queue.some(q=>q.id===state.selected))state.selected=o.queue[0]?.id||"";
 document.documentElement.lang=state.locale;
 document.title="AIMock · "+T(r.section);
 document.body.dataset.theme=state.theme;
 const root=document.getElementById("app");
 const previousMain=root.querySelector(".main-scroll")?.scrollTop||0;
 const previousRail=root.querySelector(".right-rail")?.scrollTop||0;
 const catalog=r.section==="agents"&&!r.id;
 const saved=r.section==="agents"&&r.id?Creator.draft(o,r.id):null;
 const detail=!!saved&&saved.status!=="draft"&&!["edit","guide","pick"].includes(r.sub);
 const editor=r.section==="agents"&&(r.id==="new"||["edit","guide","pick"].includes(r.sub)||(saved&&saved.status==="draft"&&r.sub!=="testing"));
 const wizard=r.section==="agents"&&!editor&&!detail&&(r.sub==="setup"||r.sub==="testing");
 const catalogOrg=catalog?{...o,agents:[...o.agents,...Creator.catalogRecords(o)]}:o;
 const content=r.section==="overview"?overview(o):catalog?Agents.page(catalogOrg,state.locale,icon):editor?Editor.page(o,state.locale,icon,r.id,r.sub,r.step):detail?Detail.page(o,state.locale,icon,r.id,r.sub):wizard?Creator.page(o,state.locale,icon,r.id,r.sub,r.step):placeholder(r.section,r.id,r.sub,r.step);
 const panel=catalog?Agents.panel(catalogOrg,state.locale,icon,state.panelOpen):editor?Editor.panel(o,state.locale,icon,r.id,state.panelOpen):detail?Detail.panel(o,state.locale,icon,r.id,state.panelOpen):wizard?Creator.panel(o,state.locale,icon,r.id,state.panelOpen):controlPanel(o);
 root.innerHTML='<div class="shell">'+sidebar(r.section,o)+'<main class="main" id="main"><div class="mobile-toolbar"><button type="button" data-menu="1" aria-label="Menu">'+icon("menu")+'</button><strong>AIMock</strong><button type="button" data-mobile-panel="1" aria-label="'+T("control")+'">'+icon("notifications")+'</button></div><div class="main-scroll'+(editor?" ae-main":wizard?" wizard-main":"")+'">'+content+'</div></main>'+panel+'</div>'+
 (catalog?Agents.modal(catalogOrg,state.locale):"")+
 '<dialog class="search-dialog" id="search-dialog"><div class="search-modal-head">'+icon("search")+'<input aria-label="'+T("search")+'" placeholder="'+T("searchPlaceholder")+'" autocomplete="off" data-search-input><button data-close-search type="button" aria-label="Close">'+icon("close")+'</button></div><div class="search-results" id="search-results"></div></dialog>';
 root.querySelector(".main-scroll").scrollTop=previousMain;
 if(editor&&r.step==="tools")root.querySelector("#ae-block-4")?.scrollIntoView({block:"start"});
 root.querySelector(".right-rail").scrollTop=previousRail;
 root.querySelectorAll('.queue-item').forEach(b=>{b.addEventListener('click',()=>{state.context=null;state.selected=b.dataset.select;render();});});
}
function showSearch(){
 const dlg=document.getElementById("search-dialog");dlg.showModal();const inp=dlg.querySelector("input");inp.focus();updateSearch("");
}
function updateSearch(q){
 const el=document.getElementById("search-results");if(!el)return;
 const o=org();const query=q.toLocaleLowerCase().trim();
 const matches=[...o.agents.map(a=>({name:a.name,route:"agents/"+a.id,type:T("agents")})),...o.integrations.map(i=>({name:i.name,route:"integrations/"+i.id,type:T("integrations")}))].filter(i=>i.name.toLocaleLowerCase().includes(query)).slice(0,12);
 el.innerHTML=matches.length?matches.map(m=>'<a href="#/'+escapeHtml(m.route)+'"><span>'+escapeHtml(m.name)+'</span><small>'+escapeHtml(m.type)+'</small></a>').join(''):'<p>'+T("noMatches")+'</p>';
}
document.addEventListener("click",e=>{
 const detailButton=e.target.closest("[data-detail-action]");
 if(detailButton&&route().section==="agents"){if(Detail.click(detailButton,org(),route().id))render();return;}
 const editorButton=e.target.closest("[data-editor-action]");
 if(editorButton&&route().section==="agents"){Editor.click(editorButton,org(),state.locale,icon);return;}
 const wizardButton=e.target.closest("[data-wizard-action]");
 if(wizardButton&&route().section==="agents"){
   const result=Creator.handleClick(wizardButton,org());
   if(result?.navigate)location.hash=result.navigate;
   else if(result?.professionList)Creator.refreshProfessionList(org(),state.locale,icon);
   else if(result?.exampleField){
     const field=document.querySelector('[data-wizard-field="'+result.exampleField+'"]');
     if(field){field.value=result.exampleValue;Creator.handleInput(field,org());field.focus({preventScroll:true});}
     Creator.refreshRail(org(),state.locale,icon);
   }
   else if(result?.choiceField){
     const dropdown=wizardButton.closest("[data-wizard-select]");
     if(dropdown){
       const text=wizardButton.firstChild?.textContent?.trim()||wizardButton.textContent.replace("✓","").trim();
       dropdown.querySelector(".wizard-select-current").textContent=text;
       dropdown.querySelectorAll('[data-wizard-action="select-choice"]').forEach(b=>{
         b.setAttribute("aria-pressed",String(b===wizardButton));
         b.querySelector("span")?.remove();
       });
       const mark=document.createElement("span");mark.setAttribute("aria-hidden","true");mark.textContent="✓";wizardButton.append(mark);
       dropdown.open=false;dropdown.querySelector("summary")?.focus({preventScroll:true});
     }
     Creator.refreshRail(org(),state.locale,icon);
   }
   else if(result?.integrationButton){
     wizardButton.classList.toggle("selected",result.selected);
     wizardButton.setAttribute("aria-pressed",String(result.selected));
     const iconSlot=wizardButton.querySelector(".wizard-integration-action");
     if(iconSlot)iconSlot.innerHTML=result.selected?icon("check",19):"+";
     Creator.refreshRail(org(),state.locale,icon);
   }
   else if(result?.rerender)render();
   return;
 }
 const wizardDropdown=e.target.closest("[data-wizard-select]");
 document.querySelectorAll("[data-wizard-select][open]").forEach(d=>{if(d!==wizardDropdown)d.open=false;});
 const option=e.target.closest("[data-agent-filter-option]");
 if(option&&route().section==="agents"&&!route().id){
   const field=option.dataset.agentFilterOption;
   if(Agents.setFilter(field,option.dataset.value)){
     render();
     document.querySelector('[data-agent-dropdown="'+field+'"] summary')?.focus({preventScroll:true});
   }
   return;
 }
 const dropdownTrigger=e.target.closest("[data-agent-dropdown] > summary");
 if(dropdownTrigger){
   e.preventDefault();
   const dropdown=dropdownTrigger.parentElement;
   const shouldOpen=!dropdown.open;
   document.querySelectorAll("[data-agent-dropdown][open]").forEach(d=>{d.open=false;});
   dropdown.open=shouldOpen;
   return;
 }
 if(!e.target.closest("[data-agent-dropdown]"))document.querySelectorAll("[data-agent-dropdown][open]").forEach(d=>{d.open=false;});
 const agentAction=e.target.closest("[data-agent-action]");
 if(agentAction&&route().section==="agents"&&!route().id){
   const action=agentAction.dataset.agentAction;
   if(Agents.handleClick(agentAction,{...org(),agents:[...org().agents,...Creator.catalogRecords(org())]})){
     if(action==="select")state.panelOpen=matchMedia("(max-width: 1100px)").matches;
     render();
     if(action==="stop-open")document.querySelector('[data-agent-action="stop-cancel"]')?.focus();
   }
   return;
 }
 const el=e.target.closest("[data-preview],[data-back-control],[data-period],button[data-theme],[data-locale],[data-org],[data-account],[data-search],[data-close-search],[data-menu],[data-mobile-panel],[data-close-panel],[data-queue],[data-reconnect]");
 if(!el)return;
 if(el.dataset.preview){const [type,id]=el.dataset.preview.split(":");state.context={type,id};state.panelOpen=matchMedia("(max-width: 1100px)").matches;render();document.querySelector(".right-rail").scrollTop=0;}
 else if("backControl" in el.dataset){state.context=null;render();document.querySelector(".right-rail").scrollTop=0;}
 else if(el.dataset.period){state.period=Number(el.dataset.period);persisted();render();}
 else if(el.dataset.theme){state.theme=el.dataset.theme;persisted();render();}
 else if(el.dataset.locale){state.locale=el.dataset.locale;persisted();render();}
 else if(el.dataset.org){state.org=el.dataset.org;state.selected="";state.context=null;state.account=false;persisted();location.hash="#/overview";render();}
 else if("account" in el.dataset){state.account=!state.account;render();}
 else if("search" in el.dataset)showSearch();
 else if("closeSearch" in el.dataset)document.getElementById("search-dialog")?.close();
 else if("menu" in el.dataset){state.menu=!state.menu;render();}
 else if("mobilePanel" in el.dataset){state.panelOpen=true;render();}
 else if("closePanel" in el.dataset){state.panelOpen=false;render();}
 else if("queue" in el.dataset){state.context=null;state.selected=org().queue[0]?.id||"";state.panelOpen=matchMedia("(max-width: 1100px)").matches;render();const rail=document.querySelector(".right-rail");if(rail)rail.scrollTop=0;const item=document.querySelector(".queue-item.selected");item?.focus({preventScroll:true});if(rail)rail.classList.add("attention-highlight");}
 else if("reconnect" in el.dataset){const btn=el;btn.textContent=state.locale==="ru"?"Откройте Integration Hub для переподключения":"Open Integration Hub to reconnect";btn.disabled=true;}
});
document.addEventListener("input",e=>{
 if(e.target.matches('[data-editor-input]:not(select)')){Editor.input(e.target,org(),state.locale,icon);return;}
 if(e.target.matches('[data-editor-search]')){Editor.search(e.target.value,org(),state.locale,icon);return;}
 if(e.target.matches("[data-wizard-field]")){
   // Keep the active text control mounted throughout typing. Only persist the value here.
   Creator.handleInput(e.target,org());
 }
 if(e.target.matches("[data-profession-search]")){
   Creator.setProfessionSearch(e.target.value);
   Creator.refreshProfessionList(org(),state.locale,icon);
 }
 if(e.target.matches("[data-search-input]"))updateSearch(e.target.value);
 if(e.target.matches("[data-agents-search]")){
  Agents.setSearch(e.target.value);
  const caret=e.target.selectionStart;
  render();
  const field=document.querySelector("[data-agents-search]");
  field?.focus({preventScroll:true});
  if(caret!==null)field?.setSelectionRange(caret,caret);
 }
});
document.addEventListener("change",e=>{
 if(e.target.matches('select[data-editor-input]')){Editor.input(e.target,org(),state.locale,icon);return;}
 if(e.target.matches("[data-wizard-field]")&&e.target.dataset.wizardField!=="group"){
   // Update readiness after the user commits a field, never in its input event.
   Creator.refreshRail(org(),state.locale,icon);
   return;
 }
 if(e.target.matches("[data-wizard-toggle]")){if(Creator.handleToggle(e.target,org()))Creator.refreshRail(org(),state.locale,icon);return;}
 if(e.target.matches("[data-profession-category]")){Creator.setProfessionCategory(e.target.value);Creator.refreshProfessionList(org(),state.locale,icon);return;}
 if(e.target.matches('[data-wizard-field="group"]')){Creator.handleInput(e.target,org());Creator.refreshRail(org(),state.locale,icon);return;}
 const select=e.target.closest("[data-agent-filter]");
 if(select&&route().section==="agents"&&!route().id&&Agents.setFilter(select.dataset.agentFilter,select.value))render();
});
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&document.querySelector("[data-wizard-select][open]")){document.querySelector("[data-wizard-select][open]").open=false;e.preventDefault();return;}
 if(e.key==="Escape"&&document.querySelector("[data-agent-dropdown][open]")){document.querySelector("[data-agent-dropdown][open]").open=false;e.preventDefault();return;}
 if(e.key==="Escape"&&Agents.hasModal()){e.preventDefault();Agents.dismiss();render();return;}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();showSearch();}
 if(e.key==="Escape"&&state.menu){state.menu=false;render();}
});
window.addEventListener("hashchange",()=>{state.menu=false;state.account=false;state.panelOpen=false;state.context=null;render();const main=document.querySelector(".main-scroll");if(main)main.scrollTop=0;});
const viewportCategory=()=>innerWidth<=760?"mobile":innerHeight<800?"compact":innerHeight<980?"standard":"large";
let lastViewport=viewportCategory();
window.addEventListener("resize",()=>{
 const current=viewportCategory();
 if(current===lastViewport)return;
 lastViewport=current;
 // The browser's virtual keyboard and responsive chrome can resize the viewport
 // while an input has focus. Rebuilding #app here would detach the active field.
 if(document.activeElement?.matches('input,textarea,select,[contenteditable="true"]'))return;
 // Only the paginated catalog needs JS-driven viewport capacity changes.
 // All other screens are responsive through CSS without a full repaint.
 if(route().section==="agents"&&!route().id)render();
});
render();
})();