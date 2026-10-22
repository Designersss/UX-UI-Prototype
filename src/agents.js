(function agentCatalogFactory(){
"use strict";
const memory={selectedByOrg:{},view:"all",filters:{type:"all",status:"all",group:"all",tag:"all"},search:"",sort:"name",direction:"asc",modal:null};
const overrideKey="aimock-agent-mock-state-v1";
let statusOverrides={};
try{statusOverrides=JSON.parse(localStorage.getItem(overrideKey)||"{}");}catch(_){}
const h=(s)=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(locale,ru,en)=>locale==="en"?en:ru;
const data=(o)=>o.agents.map(a=>({...a,state:statusOverrides[o.id+"/"+a.id]||a.state,group:a.group||(a.type==="hr"?"HR":"Продажи"),tags:a.tags||[],taskCount:a.taskCount||0,issues:a.issues||0}));
const stateTitle=(s,locale)=>{
 const names={active:L(locale,"Активен","Active"),stopped:L(locale,"Остановлен вручную","Manually stopped"),financial_paused:L(locale,"Пауза · нет AI-средств","Paused · insufficient funds"),paused:L(locale,"Пауза","Paused"),draft:L(locale,"Черновик","Draft"),needs_setup:L(locale,"Требует настройки","Setup required"),archived:L(locale,"Архивирован","Archived")};
 return names[s]||s;
};
const isAttention=(a)=>["needs_setup","financial_paused","paused"].includes(a.state)||a.issues>0;
const opt=(value,text,selected)=>'<option value="'+h(value)+'"'+(value===selected?' selected':'')+'>'+h(text)+'</option>';
const choices=(items,locale,filter)=>items.map(([value,ru,en])=>opt(value,L(locale,ru,en),filter)).join("");
function filtered(o){
 const rows=data(o).filter(a=>{
  const query=memory.search.trim().toLocaleLowerCase();
  return (memory.view==="all"||memory.view==="active"&&a.state==="active"||memory.view==="attention"&&isAttention(a))
   && (memory.filters.type==="all"||a.type===memory.filters.type)
   && (memory.filters.status==="all"||a.state===memory.filters.status)
   && (memory.filters.group==="all"||a.group===memory.filters.group)
   && (memory.filters.tag==="all"||a.tags.includes(memory.filters.tag))
   && (!query||[a.name,a.type,a.group,...a.tags].join(" ").toLocaleLowerCase().includes(query));
 });
 const factor=memory.direction==="asc"?1:-1;
 rows.sort((a,b)=>{
  const x=memory.sort==="state"?a.state:memory.sort==="activity"?a.last:a.name;
  const y=memory.sort==="state"?b.state:memory.sort==="activity"?b.last:b.name;
  return String(x).localeCompare(String(y),"ru")*factor;
 });
 return rows;
}
function pick(o){const agents=data(o);let id=memory.selectedByOrg[o.id];if(!agents.some(a=>a.id===id)){id=agents[0]?.id||null;memory.selectedByOrg[o.id]=id;}return agents.find(a=>a.id===id)||null;}
const select=(o,id)=>{if(data(o).some(a=>a.id===id))memory.selectedByOrg[o.id]=id;};
function badge(s,locale){return '<span class="agent-status agent-state-'+h(s)+'"><i aria-hidden="true"></i>'+stateTitle(s,locale)+'</span>';}
function buttonCount(title,count){return '<span class="agent-count">'+h(count)+' '+title+'</span>';}
function page(o,locale,icon){
 const all=data(o);const rows=filtered(o);const selected=pick(o);
 const active=all.filter(a=>a.state==="active").length, stopped=all.filter(a=>a.state==="stopped").length, draft=all.filter(a=>a.state==="draft").length;
 const groups=[...new Set(all.map(a=>a.group))].sort((a,b)=>a.localeCompare(b,"ru"));
 const tags=[...new Set(all.flatMap(a=>a.tags))].sort((a,b)=>a.localeCompare(b,"ru"));
 const statusList=[...new Set(["active","stopped","financial_paused","draft","needs_setup","archived",...all.map(a=>a.state)])];
 const field=(field,label,options)=>'<label class="agent-filter"><span>'+label+'</span><select data-agent-filter="'+field+'" aria-label="'+label+'">'+options+'</select></label>';
 const navView=(key,ru,en)=>'<button type="button" data-agent-action="view" data-value="'+key+'" class="agent-tab '+(memory.view===key?"active":"")+'" aria-pressed="'+(memory.view===key)+'">'+L(locale,ru,en)+'</button>';
 const tableHeader=(key,ru,en)=>'<button class="agent-th" data-agent-action="sort" data-value="'+key+'" type="button">'+L(locale,ru,en)+(memory.sort===key?(memory.direction==="asc"?" ↑":" ↓"):"")+'</button>';
 const head='<header class="agent-page-head"><div><h1>'+L(locale,"Агенты","Agents")+'</h1><p>'+all.length+' '+L(locale,"агентов","agents")+' · '+active+' '+L(locale,"активны","active")+' · '+stopped+' '+L(locale,"остановлен","stopped")+' · '+draft+' '+L(locale,"черновик","draft")+'</p></div><a class="agent-create" href="#/agents/new"><span aria-hidden="true">＋</span>'+L(locale,"Создать агента","Create agent")+'</a></header>';
 const toolbar='<div class="agent-toolbar"><div class="agent-toolbar-title"><h2>'+L(locale,"Каталог агентов","Agent catalog")+'</h2><span>'+L(locale,"Экземпляры организации","Organization agents")+'</span></div>'+
 '<div class="agent-tabs" role="group" aria-label="'+L(locale,"Представление","View")+'">'+navView("all","Все","All")+navView("active","Активные","Active")+navView("attention","Требуют внимания","Need attention")+'</div>'+
 '<div class="agent-filterbar"><label class="agent-search">'+icon("search",17)+'<input type="search" data-agents-search autocomplete="off" value="'+h(memory.search)+'" placeholder="'+L(locale,"Поиск агента по имени","Search agents by name")+'" aria-label="'+L(locale,"Поиск агента по имени","Search agents by name")+'"></label>'+
 field("type",L(locale,"Тип","Type"),choices([["all","Любой","Any"],["sales","Менеджер заявок","Lead manager"],["hr","HR-рекрутер","HR recruiter"]],locale,memory.filters.type))+
 field("status",L(locale,"Состояние","Status"),opt("all",L(locale,"Любое","Any"),memory.filters.status)+statusList.map(s=>opt(s,stateTitle(s,locale),memory.filters.status)).join(""))+
 field("group",L(locale,"Группа","Group"),opt("all",L(locale,"Все","All"),memory.filters.group)+groups.map(g=>opt(g,g,memory.filters.group)).join(""))+
 field("tag",L(locale,"Теги","Tags"),opt("all",L(locale,"Все","All"),memory.filters.tag)+tags.map(t=>opt(t,t,memory.filters.tag)).join(""))+
 '</div><div class="agent-results"><span>'+L(locale,"Показано: ","Showing: ")+rows.length+' '+L(locale,"из ","of ")+all.length+'</span><button type="button" data-agent-action="reset">'+L(locale,"Сбросить фильтры","Reset filters")+'</button></div></div>';
 const desktop='<div class="agents-list-scroll"><div class="agent-table" aria-label="'+L(locale,"Каталог агентов","Agent catalog")+'">'+
 '<div class="agent-row-head"><span>'+tableHeader("name","Агент","Agent")+'</span><span>'+L(locale,"Тип","Type")+'</span><span>'+L(locale,"Группа","Group")+'</span><span>'+tableHeader("state","Состояние","Status")+'</span><span>'+tableHeader("activity","Активность","Activity")+'</span></div>'+
 (rows.length?rows.map(a=>'<button type="button" class="agent-row '+(selected&&a.id===selected.id?"selected":"")+'" data-agent-action="select" data-value="'+h(a.id)+'" aria-pressed="'+(selected&&a.id===selected.id)+'"><span class="agent-cell agent-name"><i class="agent-row-avatar '+(a.type==="hr"?"lilac":"")+'">'+icon("agents",16)+'</i><span><strong>'+h(a.name)+'</strong><small>'+h(a.tags.join(" · ")||"—")+'</small></span></span><span class="agent-cell">'+L(locale,a.type==="hr"?"HR-рекрутер":"Менеджер заявок",a.type==="hr"?"HR recruiter":"Lead manager")+'</span><span class="agent-cell">'+h(a.group)+'</span><span class="agent-cell">'+badge(a.state,locale)+(a.issues?'<small class="agent-warning">'+a.issues+' '+L(locale,"предупрежд.","warnings")+'</small>':"")+'</span><span class="agent-cell agent-last">'+h(a.last)+'</span></button>').join(""):'<div class="agent-empty">'+L(locale,"По выбранным фильтрам нет агентов","No agents match these filters")+'</div>')+
 '</div></div>';
 return head+'<section class="surface agent-catalog">'+toolbar+desktop+'</section>';
}
function panel(o,locale,icon,open=false){
 const a=pick(o);
 if(!a)return '<aside class="right-rail agent-context-rail '+(open?'mobile-open':'')+'"><p class="agent-panel-muted">'+L(locale,"В организации пока нет агентов","No agents in this organization")+'</p></aside>';
 const status=a.state;
 const detail=L(locale,"Контекст агента","Agent context");
 return '<aside class="right-rail agent-context-rail '+(open?'mobile-open':'')+'" id="right-rail" aria-label="'+detail+'"><div class="agent-panel-top"><span class="eyebrow">'+L(locale,"КОНТЕКСТ АГЕНТА","AGENT CONTEXT")+'</span><button class="close-mobile" type="button" data-close-panel aria-label="'+L(locale,"Закрыть","Close")+'">'+icon("close")+'</button></div>'+
 '<div class="agent-panel-identity"><div class="agent-panel-avatar">'+icon("agents",28)+'</div><h2>'+h(a.name)+'</h2>'+badge(status,locale)+'<p>'+L(locale,a.type==="hr"?"HR-рекрутер":"Менеджер заявок",a.type==="hr"?"HR recruiter":"Lead manager")+'</p></div>'+
 '<div class="agent-panel-section"><h3>'+L(locale,"Текущие сведения","Current details")+'</h3><dl><div><dt>'+L(locale,"Группа доступа","Access group")+'</dt><dd>'+h(a.group)+'</dd></div><div><dt>'+L(locale,"Последняя активность","Last activity")+'</dt><dd>'+h(a.last)+'</dd></div><div><dt>'+L(locale,"Задач за 7 дней","Tasks in 7 days")+'</dt><dd>'+a.taskCount.toLocaleString(locale==="ru"?"ru-RU":"en-US")+'</dd></div><div><dt>'+L(locale,"Предупреждения","Warnings")+'</dt><dd>'+a.issues+'</dd></div></dl></div>'+
 '<div class="agent-panel-section"><h3>'+L(locale,"Теги","Tags")+'</h3><div class="agent-tag-group">'+(a.tags.length?a.tags.map(t=>'<span class="agent-tag">'+h(t)+'</span>').join(""):'<span class="agent-panel-muted">—</span>')+'</div></div>'+
 (status==="active"?'<p class="agent-context-note">'+L(locale,"Работающий агент: конфигурация доступна только для просмотра. Для изменений потребуется остановка.","Active agent: settings are read-only until it is stopped.")+'</p>':status==="stopped"?'<p class="agent-context-note">'+L(locale,"Агент остановлен вручную. Автоматически не запустится.","Agent was stopped manually and will not restart automatically.")+'</p>':'')+
 '<div class="agent-panel-actions"><a class="btn btn-dark" href="#/agents/'+h(a.id)+'">'+L(locale,"Открыть карточку агента","Open agent details")+' '+icon("arrow",15)+'</a>'+
 (status==="active"?'<button class="agent-stop-btn" type="button" data-agent-action="stop-open" data-value="'+h(a.id)+'">'+L(locale,"Остановить агента","Stop agent")+'</button>':'')+
 '</div><small class="agent-mock-note">'+L(locale,"Демонстрационные данные, действия локальные","Demo data; actions are local only")+'</small></aside>';
}
function modal(o,locale){
 if(!memory.modal)return "";
 const agent=data(o).find(a=>a.id===memory.modal);
 if(!agent||agent.state!=="active")return "";
 return '<div class="agent-modal-backdrop"><section class="agent-modal" role="alertdialog" aria-modal="true" aria-labelledby="agent-stop-title" aria-describedby="agent-stop-desc"><div class="agent-modal-icon">!</div><h2 id="agent-stop-title">'+L(locale,"Остановить агента?","Stop this agent?")+'</h2><strong>'+h(agent.name)+'</strong><p id="agent-stop-desc">'+L(locale,"После остановки агент перестанет автоматически обрабатывать обращения. История работы сохранится, а сотрудники с необходимыми правами смогут продолжить общение вручную.","Once stopped, this agent will no longer process messages automatically. History remains available, and authorized employees can continue manually.")+'</p><div class="agent-modal-actions"><button type="button" data-agent-action="stop-cancel">'+L(locale,"Отмена","Cancel")+'</button><button class="danger" type="button" data-agent-action="stop-confirm" data-value="'+h(agent.id)+'">'+L(locale,"Остановить агента","Stop agent")+'</button></div></section></div>';
}
function handleClick(target,o){
 const action=target.dataset.agentAction;
 const value=target.dataset.value;
 if(action==="select"){select(o,value);return true;}
 if(action==="view"){memory.view=value;return true;}
 if(action==="sort"){if(memory.sort===value){memory.direction=memory.direction==="asc"?"desc":"asc";}else{memory.sort=value;memory.direction="asc";}return true;}
 if(action==="reset"){memory.view="all";memory.filters={type:"all",status:"all",group:"all",tag:"all"};memory.search="";return true;}
 if(action==="stop-open"){const a=data(o).find(a=>a.id===value);if(a?.state!=="active")return false;memory.modal=value;return true;}
 if(action==="stop-cancel"){memory.modal=null;return true;}
 if(action==="stop-confirm"){if(memory.modal!==value)return false;const a=data(o).find(a=>a.id===value);if(a?.state!=="active")return false;statusOverrides[o.id+"/"+a.id]="stopped";try{localStorage.setItem(overrideKey,JSON.stringify(statusOverrides));}catch(_){}memory.modal=null;return true;}
 return false;
}
function setFilter(key,value){if(!Object.hasOwn(memory.filters,key))return false;memory.filters[key]=value;return true;}
function setSearch(value){memory.search=value;return true;}
function dismiss(){if(!memory.modal)return false;memory.modal=null;return true;}
function hasModal(){return Boolean(memory.modal);}
globalThis.AIMockAgents={page,panel,modal,handleClick,setFilter,setSearch,dismiss,hasModal,state:memory};
})();