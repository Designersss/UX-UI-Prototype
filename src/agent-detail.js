(function(){
"use strict";
const C=globalThis.AIMockCreator;
const v={confirm:null,message:"",reply:""};
const H=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(l,a,b)=>l==="en"?b:a;
function page(o,l,icon,id,sub){
 const d=C.draft(o,id);
 if(!d||d.status==="draft")return '<div class="ad-missing"><h1>'+L(l,"Агент не найден","Agent not found")+'</h1><a href="#/agents">'+L(l,"Вернуться в каталог","Back to catalog")+'</a></div>';
 const active=d.status==="active",name=H(d.name),role=H(C.professions.find(x=>x.id===d.type)?.[l==="en"?"en":"ru"]||"—");
 const buttons='<div class="ad-actions"><a class="ad-outline" href="#/agents/'+H(id)+'/edit">'+icon("settings",16)+L(l,"Редактировать","Edit settings")+'</a><a class="ad-outline" href="#/agents/'+H(id)+'/testing">'+icon("message",16)+L(l,"Протестировать","Test agent")+'</a><button class="'+(active?"ad-danger":"ad-primary")+'" type="button" data-detail-action="'+(active?"confirm-stop":"enable")+'">'+(active?L(l,"Выключить","Turn off"):L(l,"Включить","Turn on"))+'</button></div>';
 const head='<header class="ad-header"><div><a href="#/agents" class="ad-back">← '+L(l,"Все агенты","All agents")+'</a><h1>'+name+'</h1><p>'+role+' · '+L(l,active?"Включён":"Выключен",active?"Enabled":"Disabled")+'</p></div>'+buttons+'</header>';
 const test=sub==="testing";
 const main=test?'<section class="ad-card"><a class="ad-back" href="#/agents/'+H(id)+'">← '+L(l,"К карточке агента","Back to agent")+'</a><h2>'+L(l,"Тестирование","Testing")+'</h2><p>'+L(l,"Проверьте пример диалога перед включением.","Check an example conversation before enabling.")+'</p><div class="ad-chat"><p>'+L(l,"Клиент: Здравствуйте! Мне нужна помощь.","Customer: Hello! I need help.")+'</p>'+(v.message?'<p class="ad-sent">'+H(v.message)+'</p>':'')+(v.reply?'<p>'+H(v.reply)+'</p>':'')+'</div><div class="ad-test-controls"><input data-detail-test value="'+H(v.message)+'" placeholder="'+L(l,"Введите тестовое сообщение","Enter a test message")+'"><button data-detail-action="test">'+L(l,"Отправить","Send")+'</button></div></section>':
 '<div class="ad-card-grid"><section class="ad-card"><h2>'+L(l,"О работе агента","About this agent")+'</h2><p>'+H(d.description||L(l,"Описание не добавлено","No description yet"))+'</p><div class="ad-facts"><div><span>'+L(l,"Группа","Team")+'</span><strong>'+H(d.group||"—")+'</strong></div><div><span>'+L(l,"Состояние","Status")+'</span><strong>'+L(l,active?"Включён":"Выключен",active?"Enabled":"Disabled")+'</strong></div><div><span>'+L(l,"Передача диалогов","Handoff")+'</span><strong>'+H(d.handoffTarget||"—")+'</strong></div></div></section>'+
 '<section class="ad-card"><h2>'+L(l,"Задачи и инструкции","Tasks & instructions")+'</h2><p>'+H(d.task||L(l,"Инструкции ещё не заданы","No instructions added"))+'</p><h3>'+L(l,"Быстрые правила","Quick rules")+'</h3><div class="ad-tags">'+(d.quickRules||[]).map(x=>'<span>'+H(x)+'</span>').join("")+'</div></section>'+
 '<section class="ad-card"><h2>'+L(l,"База знаний","Knowledge")+'</h2><strong>'+((d.knowledge||[]).length)+' '+L(l,"материала","sources")+'</strong><p>'+L(l,"Подключённые материалы доступны в настройках.","Manage linked knowledge from agent settings.")+'</p></section>'+
 '<section class="ad-card"><h2>'+L(l,"Интеграции","Integrations")+'</h2><strong>'+((d.connections||[]).length)+' '+L(l,"подключения","connections")+'</strong><div class="ad-tags">'+o.integrations.filter(x=>(d.connections||[]).includes(x.id)).map(x=>'<span>'+H(x.name)+'</span>').join("")+'</div></section></div>';
 return head+main+(v.confirm===id?'<div class="ad-overlay"><section role="alertdialog" aria-modal="true" aria-labelledby="ad-stop-title"><h2 id="ad-stop-title">'+L(l,"Выключить агента?","Turn off agent?")+'</h2><p>'+L(l,"Он перестанет принимать новые обращения до повторного включения.","It will stop handling new requests until enabled again.")+'</p><div><button data-detail-action="cancel-stop">'+L(l,"Отмена","Cancel")+'</button><button class="ad-danger" data-detail-action="stop">'+L(l,"Выключить","Turn off")+'</button></div></section></div>':'');
}
function panel(o,l,icon,id,open){
 const d=C.draft(o,id);if(!d)return '';
 const active=d.status==="active";
 return '<aside class="right-rail ad-rail '+(open?"mobile-open":"")+'" id="right-rail"><div class="ad-rail-header"><h2>'+L(l,"Состояние агента","Agent status")+'</h2><button class="close-mobile" data-close-panel aria-label="Close">'+icon("close")+'</button></div><span class="ad-status '+(active?"enabled":"")+'">'+L(l,active?"Включён":"Выключен",active?"Enabled":"Disabled")+'</span><p>'+H(d.name)+'</p><div class="ad-summary"><strong>'+L(l,"Создан","Created")+'</strong><span>'+new Date(d.completedAt||d.createdAt||Date.now()).toLocaleDateString(l==="en"?"en-US":"ru-RU")+'</span></div><div class="ad-summary"><strong>'+L(l,"Профессия","Profession")+'</strong><span>'+H(C.professions.find(x=>x.id===d.type)?.[l==="en"?"en":"ru"]||"—")+'</span></div><div class="ad-summary"><strong>'+L(l,"Интеграции","Integrations")+'</strong><span>'+(d.connections||[]).length+'</span></div></aside>';
}
function click(el,o,id){
 const action=el.dataset.detailAction;
 if(action==="confirm-stop"){v.confirm=id;return true;}
 if(action==="cancel-stop"){v.confirm=null;return true;}
 if(action==="enable"||action==="stop"){
  if(!C.setAgentEnabled(o,id,action==="enable"))return false;
  v.confirm=null;return true;
 }
 if(action==="test"){v.message=document.querySelector("[data-detail-test]")?.value.trim()||"";if(v.message)v.reply="Спасибо! Уточните, пожалуйста, детали запроса, чтобы я мог помочь.";return true;}
 return false;
}
globalThis.AIMockAgentDetail={page,panel,click};
})();