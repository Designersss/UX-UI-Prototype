(function(){
"use strict";
const E=globalThis.AIMockApprovedEditor,C=globalThis.AIMockCreator;
const {L,X,model,roleName}=E;
const logo=brand=>E.logo[brand];
function panel(o,loc,icon,key,open){
 const d=model(o,key);
 const title=d.name?.trim()||L(loc,"Ваш агент","Your agent");
 const desc=d.description||L(loc,"Добавьте краткое описание, чтобы команда понимала назначение агента.","Add a short description so your team knows the agent's purpose.");
 const connected=o.integrations.filter(i=>(d.connections||[]).includes(i.id));
 const checks=C.creationChecks(d);
 const labels=[
  L(loc,"Название агента","Agent name"),L(loc,"Тип агента","Agent type"),
  L(loc,"Инструкции","Instructions"),L(loc,"Группа доступа","Access group"),
  L(loc,"База знаний","Knowledge base"),L(loc,"Подключения","Integrations"),
  L(loc,"Передача человеку","Human handoff")
 ];
 const complete=checks.filter(c=>c.ok).length;
 const progress=Math.round(complete/checks.length*100);
 const state=d.status&&d.status!=="draft"?L(loc,"Создан","Created"):L(loc,"Черновик","Draft");
 return '<aside class="right-rail ae-preview '+(open?"mobile-open":"")+'" id="right-rail" aria-label="'+L(loc,"Предпросмотр агента","Agent preview")+'">'+
 '<div class="ae-preview-top"><h2>'+L(loc,"Предпросмотр агента","Agent preview")+'</h2><button type="button" class="close-mobile" data-close-panel aria-label="'+L(loc,"Закрыть","Close")+'">'+icon("close",17)+'</button></div>'+
 '<div class="ae-preview-identity"><span class="ae-preview-avatar">'+icon("agents",30)+'</span><div><span class="ae-draft">'+state+'</span><h3>'+X(title)+'</h3><p>'+X(roleName(d,loc))+'</p></div></div>'+
 '<p class="ae-preview-desc">'+X(desc)+'</p><div class="ae-preview-tags"><span>'+X(d.group||L(loc,"Без группы","No group"))+'</span><span>'+L(loc,"AI-агент","AI agent")+'</span></div>'+
 '<div class="ae-preview-divider"></div>'+
 '<div class="ae-preview-tool-head"><h4>'+L(loc,"Выбранные подключения","Selected integrations")+'</h4><small>'+connected.length+'</small></div>'+
 '<div class="ae-preview-tools">'+(connected.length?connected.slice(0,3).map(i=>'<div>'+(logo(i.brand)?'<img src="./src/assets/logos/'+logo(i.brand)+'" width="19" height="19" alt="">':icon("integrations",17))+'<span>'+X(i.name)+'</span><b>●</b></div>').join("")+(connected.length>3?'<small>'+L(loc,"Ещё ","Plus ")+(connected.length-3)+'</small>':""):'<p>'+L(loc,"Подключения не выбраны","No integrations selected")+'</p>')+'</div>'+
 '<div class="ae-preview-divider"></div>'+
 '<div class="ae-preview-progress"><div class="ae-preview-progress-head"><strong>'+L(loc,"Готовность к запуску","Launch readiness")+'</strong><span>'+progress+'%</span></div><div class="ae-preview-progress-track" role="progressbar" aria-label="'+L(loc,"Готовность конфигурации","Configuration readiness")+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+progress+'"><i style="width:'+progress+'%"></i></div>'+
 '<p>'+L(loc,"Настройка выполнена: ","Setup complete: ")+complete+' / '+checks.length+'</p></div>'+
 '<section class="ae-preview-checklist"><h4>'+L(loc,"Проверка готовности","Readiness checklist")+'</h4>'+
 '<p>'+L(loc,"Обязательные поля отмечены звёздочкой.","Required fields are marked with an asterisk.")+'</p>'+
 '<div class="ae-preview-checklist-items">'+checks.map((check,i)=>'<div class="'+(check.ok?"done":"pending")+'"><span aria-hidden="true">'+(check.ok?icon("check",13):icon("clock",13))+'</span><span>'+labels[i]+(check.required?' <b>*</b>':"")+'</span></div>').join("")+'</div></section>'+
 '<div class="ae-preview-note">'+icon("info",16)+L(loc,"После создания можно протестировать и включить агента в его карточке.","Test and enable the agent from its page after creation.")+'</div></aside>';
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
