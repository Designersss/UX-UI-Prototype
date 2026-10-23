(function(){
"use strict";
const E=globalThis.AIMockApprovedEditor,C=globalThis.AIMockCreator;
const {L,X,model,roleName}=E;
const logo=brand=>E.logo[brand];
function panel(o,loc,icon,key,open){
 const d=model(o,key);
 const title=d.name?.trim()||L(loc,"Ваш агент","Your agent"),desc=d.description||L(loc,"Здесь появится описание, когда вы его добавите.","The description appears here when added.");
 const connected=o.integrations.filter(i=>(d.connections||[]).includes(i.id));
 const checks=C.creationChecks(d);
 const progress=Math.round(checks.filter(c=>c.ok).length/checks.length*100);
 return '<aside class="right-rail ae-preview '+(open?"mobile-open":"")+'" id="right-rail" aria-label="'+L(loc,"Предпросмотр агента","Agent preview")+'">'+
 '<div class="ae-preview-top"><h2>'+L(loc,"Предпросмотр агента","Agent preview")+'</h2><button type="button" class="close-mobile" data-close-panel aria-label="'+L(loc,"Закрыть","Close")+'">'+icon("close",17)+'</button></div>'+
 '<div class="ae-preview-identity"><span class="ae-preview-avatar">'+icon("agents",30)+'</span><div><span class="ae-draft">'+L(loc,"Черновик","Draft")+'</span><h3>'+X(title)+'</h3><p>'+X(roleName(d,loc))+'</p></div></div>'+
 '<p class="ae-preview-desc">'+X(desc)+'</p><div class="ae-preview-tags"><span>'+X(d.group||L(loc,"Без группы","No group"))+'</span><span>'+L(loc,"AI-агент","AI agent")+'</span></div>'+
 '<div class="ae-preview-divider"></div><div class="ae-preview-stats"><div>'+icon("message",17)+'<strong>'+L(loc,"Диалоги","Conversations")+'</strong><small>'+L(loc,"После запуска","After launch")+'</small></div><div>'+icon("clock",17)+'<strong>'+L(loc,"Состояние","State")+'</strong><small>'+L(loc,"Не запущен","Not active")+'</small></div><div>'+icon("knowledge",17)+'<strong>'+L(loc,"Источники","Sources")+'</strong><small>'+(d.knowledge||[]).length+' '+L(loc,"выбрано","selected")+'</small></div></div>'+
 '<div class="ae-preview-divider"></div><h4>'+L(loc,"Пример общения","Conversation preview")+'</h4><div class="ae-mock-chat">'+
 '<div class="ae-chat-in"><span>'+L(loc,"Клиент","Customer")+'</span><p>'+L(loc,"Здравствуйте! Есть вопрос по вашим услугам.","Hello! I have a question about your services.")+'</p></div>'+
 '<div class="ae-chat-out"><strong>'+X(title)+'</strong><p>'+L(loc,"Здравствуйте! Расскажите подробнее, и я помогу или подключу сотрудника.","Hello! Tell me more and I will help or involve a teammate.")+'</p><small>'+L(loc,"Пример · не AI-ответ","Example · not an AI response")+'</small></div></div>'+
 '<div class="ae-preview-divider"></div><div class="ae-preview-tool-head"><h4>'+L(loc,"Подключённые инструменты","Selected tools")+'</h4><small>'+connected.length+'</small></div>'+
 '<div class="ae-preview-tools">'+(connected.length?connected.map(i=>'<div>'+ (logo(i.brand)?'<img src="./src/assets/logos/'+logo(i.brand)+'" width="19" height="19" alt="">':icon("integrations",17))+'<span>'+X(i.name)+'</span><b>●</b></div>').join(""):'<p>'+L(loc,"Пока ничего не выбрано","No connections selected")+'</p>')+'</div>'+
 '<div class="ae-preview-progress"><div><strong>'+L(loc,"Готовность к запуску","Readiness")+'</strong><span>'+progress+'%</span></div><div class="ae-preview-progress-track"><i style="width:'+progress+'%"></i></div><p>'+L(loc,"Заполните параметры, проверьте знания и протестируйте сценарий.","Fill in the settings, review knowledge and run a test.")+'</p></div>'+
 '<div class="ae-preview-note">'+icon("info",17)+L(loc,"После создания тестируйте и управляйте агентом из его карточки.","After creation, test and manage the agent from its page.")+'</div></aside>';
}
function refresh(o,loc,icon){
 const old=document.querySelector(".ae-preview");if(!old)return;
 const sc=old.scrollTop;
 old.outerHTML=panel(o,loc,icon,E.id(),old.classList.contains("mobile-open"));
 document.querySelector(".ae-preview").scrollTop=sc;
 const st=document.querySelector("[data-editor-save]");if(st)st.textContent=L(loc,E.ui.fail?"Ошибка локального сохранения":"Сохранено локально",E.ui.fail?"Local save failed":"Saved locally");
}
E.panel=panel;E.refresh=refresh;
})();
