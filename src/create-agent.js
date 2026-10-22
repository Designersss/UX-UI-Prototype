(function creatorModule(){
"use strict";
const KEY="aimock-wizard-drafts-v1";
const memory={type:"sales",name:"",error:"",simulationInput:"",simulationReply:"",saveError:false};
let drafts={};
try{drafts=JSON.parse(localStorage.getItem(KEY)||"{}");if(!drafts||typeof drafts!=="object"||Array.isArray(drafts))drafts={};}catch(_){drafts={};}
const E=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(locale,ru,en)=>locale==="en"?en:ru;
const labels=[["Шаблон и имя","Template & name"],["Инструкции","Instructions"],["Знания","Knowledge"],["Интеграции","Integrations"],["Разрешения","Permissions"],["Готовность","Readiness"]];
const label=(i,loc)=>labels[i-1]?.[loc==="en"?1:0]||"";
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(drafts));memory.saveError=false;return true;}catch(_){memory.saveError=true;return false;}};
const draftsFor=o=>Object.values(drafts).filter(d=>d.orgId===o.id&&d.status==="draft");
const catalogRecords=o=>draftsFor(o).map(d=>({id:d.id,name:d.name,type:d.type,state:"draft",last:L("ru","Локальный черновик","Local draft"),group:d.type==="hr"?"HR":"Продажи",tags:[],taskCount:0,issues:0}));
const draft=(o,id)=>{const d=drafts[id];return d&&d.orgId===o.id?d:null;};
const ready=(d,o)=>{
 const connected=(d.connections||[]).filter(id=>o.integrations.some(i=>i.id===id&&i.status==="connected"));
 return [
 {name:"identity",ok:!!d.name.trim()&&["sales","hr"].includes(d.type)},
 {name:"instructions",ok:!!d.company.trim()&&!!d.task.trim()},
 {name:"knowledge",ok:(d.knowledge||[]).length>0},
 {name:"connections",ok:connected.length>0},
 {name:"permissions",ok:!!d.handoff.trim()&&!!d.group},
 {name:"testing",ok:!!d.tested}
 ];
};
const steps=(current,loc)=>'<nav class="wizard-steps" aria-label="'+L(loc,"Этапы настройки","Setup steps")+'">'+labels.map((name,index)=>'<a href="'+(current.id?'#/agents/'+encodeURIComponent(current.id)+'/setup/'+(index+1):"#/agents/new")+'" class="wizard-step '+(current.step===index+1?"active":"")+' '+(index+1<current.step?"completed":"")+'" '+(current.step===index+1?'aria-current="step"':'')+'><span>'+ (index+1)+'</span><small>'+E(name[loc==="en"?1:0])+'</small></a>').join("")+'</nav>';
function shellHeading(o,d,step,loc){
 const subtitle=d?E(d.name)+' · '+L(loc,"Локальный черновик","Local draft")+' · '+L(loc,"Шаг","Step")+' '+step+' / 6':L(loc,"Шаг 1 из 6 · Выберите профессию и имя","Step 1 of 6 · Choose a profession and name");
 return '<div class="wizard-heading"><div><a class="wizard-back-link" href="#/agents">‹ '+L(loc,"Каталог агентов","Agent catalog")+'</a><h1>'+L(loc,"Создать агента","Create agent")+'</h1><p>'+subtitle+'</p></div><span class="wizard-local-pill">'+L(loc,"МОК · без бэкенда","MOCK · no backend")+'</span></div>';
}
function newPage(o,loc,icon){
 const choice=(type,title,body,traits)=>'<button type="button" class="wizard-template '+(memory.type===type?"selected":"")+'" data-wizard-action="template" data-value="'+type+'" aria-pressed="'+(memory.type===type)+'"><span class="wizard-template-heading"><span class="wizard-template-icon">'+icon(type==="sales"?"inbox":"agents",22)+'</span><strong>'+title+'</strong><span class="wizard-radio"></span></span><span class="wizard-template-body">'+body+'</span><span class="wizard-template-tags">'+traits.map(x=>'<i>'+x+'</i>').join("")+'</span></button>';
 return shellHeading(o,null,1,loc)+steps({step:1,id:null},loc)+
 '<section class="wizard-body"><div class="wizard-section-intro"><h2>'+L(loc,"Выберите тип агента","Choose an agent type")+'</h2><p>'+L(loc,"Профессия определяет набор задач и разрешений. Каждый агент — отдельный экземпляр.","The profession defines tasks and permissions. Each agent is a separate instance.")+'</p></div>'+
 '<div class="wizard-template-grid">'+
 choice("sales",L(loc,"Менеджер заявок","Lead manager"),L(loc,"Квалифицирует обращения, отвечает по базе знаний, передаёт сложные случаи сотруднику.","Qualifies inquiries, answers from knowledge and hands complex cases to staff."),[L(loc,"Обращения","Messages"),"CRM",L(loc,"Передача человеку","Human handoff")])+
 choice("hr",L(loc,"HR-рекрутер","HR recruiter"),L(loc,"Помогает с вакансиями, первичными вопросами и сводками кандидатов. Не принимает решения об отказе.","Helps with vacancies, initial questions and candidate summaries. Never rejects candidates automatically."),[L(loc,"Вакансии","Vacancies"),L(loc,"Отклики","Applicants"),"HR"])+
 '</div><label class="wizard-field wizard-name"><span>'+L(loc,"Название агента","Agent name")+'</span><input data-wizard-field="new-name" maxlength="80" autocomplete="off" value="'+E(memory.name)+'" placeholder="'+L(loc,"Например, Менеджер обращений","E.g. Inquiry Manager")+'"><small>'+L(loc,"Имя видно только сотрудникам с доступом.","Visible only to authorized employees.")+'</small></label>'+
 (memory.error?'<p role="alert" class="wizard-error">'+E(memory.error)+'</p>':"")+'</section>'+
 '<div class="wizard-footer"><a href="#/agents" class="wizard-btn wizard-secondary">'+L(loc,"Отмена","Cancel")+'</a><button class="wizard-btn wizard-primary" type="button" data-wizard-action="create">'+L(loc,"Создать черновик и продолжить","Create draft and continue")+' →</button></div>';
}
const textArea=(label,field,value,placeholder,rows=4)=>'<label class="wizard-field"><span>'+label+'</span><textarea rows="'+rows+'" data-wizard-field="'+field+'" placeholder="'+placeholder+'">'+E(value)+'</textarea></label>';
function section2(d,loc){
 return '<div class="wizard-section-intro"><h2>'+L(loc,"Бизнес-контекст и инструкции","Business context & instructions")+'</h2><p>'+L(loc,"Опишите задачи, информацию и границы полномочий.","Describe tasks, context and responsibility boundaries.")+'</p></div>'+
 textArea(L(loc,"Чем занимается компания","About the company"),"company",d.company,L(loc,"Чем занимается ваша организация?","What does your organization do?"),3)+
 textArea(L(loc,"Что должен делать агент","Agent responsibilities"),"task",d.task,L(loc,"Опишите ожидаемые действия и результат","Describe expected actions and outcomes"),5)+
 textArea(L(loc,"Когда передать вопрос человеку","When to escalate to a human"),"handoff",d.handoff,L(loc,"Например, жалоба или неподтверждённая стоимость","For example, complaint or unverified price"),3)+
 '<div class="wizard-advisory">'+L(loc,"Инструкции не дают доступ к новым инструментам и не заменяют разрешения.","Instructions do not grant access to tools or override permissions.")+'</div>';
}
const knowledgeFor=(d)=>d.type==="hr"?[{id:"vacancies",title:"Вакансии · 2026",detail:"Набор вакансий · актуально"},{id:"candidate-guide",title:"Политика работы с кандидатами",detail:"Порядок интервью · актуально"},{id:"old-hr",title:"Архив откликов",detail:"Устаревший · только просмотр",disabled:true}]:[{id:"services",title:"Услуги и цены · октябрь 2026",detail:"PDF · актуальная редакция"},{id:"faqs",title:"Частые вопросы клиентов",detail:"24 статьи · актуально"},{id:"old-prices",title:"Устаревшие тарифы",detail:"PDF · неактуально",disabled:true}];
function section3(d,loc){
 return '<div class="wizard-section-intro"><h2>'+L(loc,"Документы и база знаний","Knowledge & documents")+'</h2><p>'+L(loc,"Выберите существующие материалы. Создание и загрузка новых файлов будут реализованы в разделе «База знаний».","Choose existing materials. Uploading new files will be implemented in Knowledge Base.")+'</p></div>'+
 '<div class="wizard-choice-list">'+knowledgeFor(d).map(k=>'<label class="wizard-check-row '+(k.disabled?"disabled":"")+'"><span class="wizard-check-icon">▤</span><span class="wizard-check-main"><strong>'+E(k.title)+'</strong><small>'+E(k.detail)+'</small></span><input type="checkbox" data-wizard-toggle="knowledge" value="'+k.id+'" '+(d.knowledge.includes(k.id)?"checked":"")+' '+(k.disabled?"disabled":"")+'></label>').join("")+'</div>'+
 '<a class="wizard-inline-link" href="#/knowledge">'+L(loc,"Открыть базу знаний","Open knowledge base")+' ↗</a>';
}
function section4(d,o,loc,icon){
 return '<div class="wizard-section-intro"><h2>'+L(loc,"Подключения","Integrations")+'</h2><p>'+L(loc,"Выберите готовые подключения этой организации. Недоступные подключения требуют исправления в Integration Hub.","Choose existing connections in this organization. Unavailable connections must be fixed in Integration Hub.")+'</p></div>'+
 '<div class="wizard-choice-list">'+(o.integrations.length?o.integrations.map(i=>'<label class="wizard-check-row '+(i.status!=="connected"?"disabled":"")+'"><span class="wizard-check-icon">'+icon("integrations",18)+'</span><span class="wizard-check-main"><strong>'+E(i.name)+'</strong><small>'+E(i.status==="connected"?L(loc,"Подключено","Connected"):L(loc,"Нужна повторная авторизация","Reauthorization needed"))+'</small></span><input type="checkbox" data-wizard-toggle="connections" value="'+E(i.id)+'" '+(d.connections.includes(i.id)?"checked":"")+' '+(i.status!=="connected"?"disabled":"")+'></label>').join(""):'<p class="wizard-empty">'+L(loc,"Подключений пока нет. Добавьте их в Integration Hub.","No integrations yet. Add them in Integration Hub.")+'</p>')+'</div>'+
 '<a class="wizard-inline-link" href="#/integrations">'+L(loc,"Открыть Integration Hub","Open Integration Hub")+' ↗</a>'+
 '<p class="wizard-footnote">'+L(loc,"Каналы общения эксклюзивны: в реальном продукте назначение будет дополнительно проверено сервером.","Messaging channels are exclusive: real assignments must also pass a server-side check.")+'</p>';
}
function section5(d,loc){
 const action=(text,detail,kind)=>'<div class="wizard-permission"><div><strong>'+text+'</strong><small>'+detail+'</small></div><span class="wizard-permission-'+kind+'">'+(kind==="allowed"?L(loc,"Разрешено","Allowed"):kind==="approval"?L(loc,"По согласованию","Approval required"):L(loc,"Запрещено","Forbidden"))+'</span></div>';
 return '<div class="wizard-section-intro"><h2>'+L(loc,"Действия и ограничения","Permissions & safeguards")+'</h2><p>'+L(loc,"Действия разрешаются отдельно от текста инструкций.","Permissions are independent of instructions.")+'</p></div>'+
 '<div class="wizard-permissions">'+action(L(loc,"Читать входящие сообщения","Read incoming messages"),L(loc,"Только через назначенный канал","Only via an assigned channel"),"allowed")+
 action(d.type==="hr"?L(loc,"Создать карточку кандидата","Create candidate record"):L(loc,"Создать лид в CRM","Create CRM lead"),L(loc,"После проверки данных","Only after verifying information"),"approval")+
 action(d.type==="hr"?L(loc,"Автоматически отклонять кандидата","Automatically reject candidates"):L(loc,"Изменять цены и скидки","Change prices or discounts"),L(loc,"Недоступно для этого типа агента","Not permitted for this agent type"),"denied")+'</div>'+
 '<div class="wizard-two-cols"><label class="wizard-field"><span>'+L(loc,"Группа доступа","Access group")+'</span><select data-wizard-field="group"><option value="Продажи" '+(d.group==="Продажи"?"selected":"")+'>'+L(loc,"Продажи","Sales")+'</option><option value="HR" '+(d.group==="HR"?"selected":"")+'">HR</option><option value="Поддержка" '+(d.group==="Поддержка"?"selected":"")+'>'+L(loc,"Поддержка","Support")+'</option></select></label><label class="wizard-field"><span>'+L(loc,"Эскалация человеку","Human escalation")+'</span><input data-wizard-field="handoff" value="'+E(d.handoff)+'" placeholder="'+L(loc,"Куда передать сложный случай","Where to escalate cases")+'"></label></div>';
}
function section6(d,o,loc,icon){
 const items=ready(d,o);
 const titles=[L(loc,"Профессия и имя","Profession and name"),L(loc,"Инструкции","Instructions"),L(loc,"База знаний","Knowledge base"),L(loc,"Подключения","Integrations"),L(loc,"Разрешения","Permissions"),L(loc,"Тестирование","Testing")];
 return '<div class="wizard-section-intro"><h2>'+L(loc,"Проверка готовности","Readiness review")+'</h2><p>'+L(loc,"Проверьте обязательные шаги перед запуском. В этой версии реальный запуск отключён.","Check required steps before deployment. Live activation is disabled in this prototype.")+'</p></div>'+
 '<div class="wizard-readiness-list">'+items.map((item,i)=>'<div class="wizard-ready-row"><span class="wizard-ready-icon '+(item.ok?"ok":"todo")+'">'+icon(item.ok?"check":"alert",16)+'</span><span><strong>'+titles[i]+'</strong><small>'+L(loc,item.ok?"Готово":"Требует внимания",item.ok?"Ready":"Needs attention")+'</small></span></div>').join("")+'</div>'+
 '<div class="wizard-advisory">'+L(loc,"Это интерактивный прототип без бэкенда: даже при полной готовности AI-агент не запускается и не выполняет внешние действия.","This interactive prototype has no backend. Even a fully configured agent cannot go live or perform external actions.")+'</div>';
}
function testing(d,o,loc,icon){
 const tested=d.tested;
 return '<header class="wizard-heading"><div><a class="wizard-back-link" href="#/agents/'+E(d.id)+'/setup/6">‹ '+L(loc,"Назад к готовности","Back to readiness")+'</a><h1>'+L(loc,"Тестирование агента","Test agent")+'</h1><p>'+E(d.name)+' · '+L(loc,"Только безопасная локальная симуляция","Safe local simulation only")+'</p></div><span class="wizard-local-pill">MOCK</span></header>'+
 '<section class="wizard-body wizard-test-body"><div class="wizard-section-intro"><h2>'+L(loc,"Проверка ответа","Response preview")+'</h2><p>'+L(loc,"Сценарий имитирует переписку без вызова модели, Telegram, CRM или внешних API.","This scripted simulation does not call a model, Telegram, CRM or any external APIs.")+'</p></div>'+
 '<div class="wizard-chat"><div class="wizard-chat-bubble incoming">'+L(loc,"Здравствуйте! Хочу оставить заявку на ваш сервис.","Hello! I’d like to inquire about your service.")+'</div>'+
 (memory.simulationInput?'<div class="wizard-chat-bubble outgoing">'+E(memory.simulationInput)+'</div>':'')+
 (memory.simulationReply?'<div class="wizard-chat-bubble incoming">'+E(memory.simulationReply)+'</div>':'')+
 '</div><label class="wizard-field"><span>'+L(loc,"Проверочное сообщение","Test message")+'</span><input data-wizard-field="simulation" value="'+E(memory.simulationInput)+'" placeholder="'+L(loc,"Напишите сообщение для теста","Enter a message to test")+'"></label>'+
 '<button class="wizard-btn wizard-primary" data-wizard-action="simulate" type="button">'+L(loc,"Проверить сценарий","Run demo simulation")+'</button>'+
 (tested?'<div class="wizard-advisory">'+L(loc,"Симуляция выполнена. Это не подтверждает работу реального AI или интеграций.","Demo completed. This does not validate live AI or integrations.")+'</div>':'')+
 '</section>';
}
function setupPage(o,loc,icon,id,step){
 const d=draft(o,id);
 if(!d)return missing(loc);
 const s=Math.max(1,Math.min(6,Number(step)||2));
 const content=s===1?'<div class="wizard-section-intro"><h2>'+L(loc,"Шаблон и название","Template & name")+'</h2><p>'+L(loc,"Изменения в существующем локальном черновике","Edit the existing local draft")+'</p></div>'+
 '<div class="wizard-template-grid">'+
 ["sales","hr"].map(type=>'<button type="button" class="wizard-template '+(d.type===type?"selected":"")+'" data-wizard-action="draft-type" data-value="'+type+'"><span class="wizard-template-heading"><span class="wizard-template-icon">'+icon(type==="hr"?"agents":"inbox",21)+'</span><strong>'+L(loc,type==="hr"?"HR-рекрутер":"Менеджер заявок",type==="hr"?"HR recruiter":"Lead manager")+'</strong><span class="wizard-radio"></span></span></button>').join("")+'</div>'+
 '<label class="wizard-field"><span>'+L(loc,"Название агента","Agent name")+'</span><input data-wizard-field="name" maxlength="80" value="'+E(d.name)+'"></label>':
 s===2?section2(d,loc):s===3?section3(d,loc):s===4?section4(d,o,loc,icon):s===5?section5(d,loc):section6(d,o,loc,icon);
 return shellHeading(o,d,s,loc)+steps({step:s,id:d.id},loc)+'<section class="wizard-body">'+content+'</section>'+
 '<div class="wizard-footer"><a class="wizard-btn wizard-secondary" href="'+(s===1?"#/agents":"#/agents/"+E(d.id)+"/setup/"+(s-1))+'">← '+L(loc,"Назад","Back")+'</a>'+
 (s===6?'<a class="wizard-btn wizard-secondary" href="#/agents/'+E(d.id)+'/testing">'+L(loc,"Открыть тестирование","Open testing")+'</a><button class="wizard-btn wizard-primary" type="button" disabled title="'+L(loc,"Реальный запуск отключён","Live activation disabled")+'">'+L(loc,"Запустить · недоступно","Launch · unavailable")+'</button>':'<a class="wizard-btn wizard-primary" href="#/agents/'+E(d.id)+'/setup/'+(s+1)+'">'+L(loc,"Далее","Next")+' →</a>')+'</div>';
}
function missing(loc){return '<section class="wizard-body"><h2>'+L(loc,"Черновик не найден","Draft not found")+'</h2><p>'+L(loc,"Этот черновик отсутствует в локальных данных текущей организации.","This draft is not in the current organization’s local data.")+'</p><a class="wizard-btn wizard-primary" href="#/agents">'+L(loc,"В каталог","Back to catalog")+'</a></section>';}
function page(o,loc,icon,id,sub,step){
 if(id==="new")return newPage(o,loc,icon);
 const d=draft(o,id);
 if(!d)return missing(loc);
 if(sub==="testing")return testing(d,o,loc,icon);
 return setupPage(o,loc,icon,id,step);
}
function panel(o,loc,icon,id,open){
 const d=id==="new"?null:draft(o,id);
 const scores=d?ready(d,o):[];
 const headings=[L(loc,"Тип и имя","Type & name"),L(loc,"Инструкции","Instructions"),L(loc,"База знаний","Knowledge"),L(loc,"Подключения","Connections"),L(loc,"Разрешения","Permissions"),L(loc,"Тестирование","Testing")];
 return '<aside class="right-rail wizard-rail '+(open?"mobile-open":"")+'" id="right-rail" aria-label="'+L(loc,"Контекст настройки","Setup context")+'"><div class="wizard-rail-top"><span class="eyebrow">'+L(loc,"ПОМОЩЬ ПО НАСТРОЙКЕ","SETUP GUIDE")+'</span><button class="close-mobile" data-close-panel type="button" aria-label="Close">'+icon("close",18)+'</button></div>'+
 '<h2>'+E(d?.name||L(loc,"Перед началом","Before you begin"))+'</h2><span class="wizard-rail-status">'+L(loc,"Локальный черновик · демо","Local draft · demo")+'</span>'+
 '<div class="wizard-rail-group"><strong>'+L(loc,"Сохранение","Save status")+'</strong><p class="wizard-save" data-wizard-save>'+L(loc,memory.saveError?"Ошибка локального сохранения":d?"Локально сохранено":"Черновик ещё не создан",memory.saveError?"Local save failed":d?"Saved locally":"Draft not created")+'</p><small>'+L(loc,"Синхронизация между устройствами пока недоступна.","Cross-device sync is not available yet.")+'</small></div>'+
 '<div class="wizard-rail-group"><strong>'+L(loc,"Готовность","Readiness")+'</strong><div class="wizard-rail-checklist">'+headings.map((title,i)=>'<div><span class="'+(scores[i]?.ok?"done":"pending")+'">'+icon(scores[i]?.ok?"check":"chevron",13)+'</span><small>'+title+'</small></div>').join("")+'</div></div>'+
 '<div class="wizard-rail-bottom"><strong>'+L(loc,"Перед запуском","Before launch")+'</strong><p>'+L(loc,"Проверьте знания, подключённые каналы и разрешения, затем протестируйте сценарий. Реальный запуск здесь недоступен.","Check knowledge, channels and permissions; then test the workflow. Live launch is disabled in this demo.")+'</p><a href="#/help">'+L(loc,"Помощь по созданию агента","Agent setup help")+' ↗</a></div></aside>';
}
function handleClick(el,o){
 const action=el.dataset.wizardAction;
 if(action==="template"){memory.type=el.dataset.value;memory.error="";return {rerender:true};}
 if(action==="draft-type"){
   const id=location.hash.slice(2).split("/")[1];const d=draft(o,id);if(!d)return null;
   if(["sales","hr"].includes(el.dataset.value)){d.type=el.dataset.value;d.group=d.type==="hr"?"HR":"Продажи";d.knowledge=[];d.connections=[];d.tested=false;save();}
   return {rerender:true};
 }
 if(action==="create"){
   const name=memory.name.trim();if(!name){memory.error="Укажите название агента";return {rerender:true};}
   if(name.length>80){memory.error="Слишком длинное название";return {rerender:true};}
   const id="draft-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7);
   drafts[id]={id,orgId:o.id,status:"draft",type:memory.type,name,company:"",task:"",handoff:"",knowledge:[],connections:[],group:memory.type==="hr"?"HR":"Продажи",tested:false,createdAt:Date.now()};
   if(!save()){memory.error="Не удалось сохранить черновик в этом браузере";delete drafts[id];return {rerender:true};}
   memory.name="";memory.error="";return {navigate:"#/agents/"+id+"/setup/2"};
 }
 if(action==="simulate"){
   const route=location.hash.slice(2).split("/");const d=draft(o,route[1]);if(!d)return null;
   if(!memory.simulationInput.trim())return null;
   memory.simulationReply=L(document.documentElement.lang,"Спасибо! Я уточню детали и передам запрос уполномоченному сотруднику. Это демонстрационный ответ.","Thank you! I will collect the details and pass the inquiry to an authorized teammate. This is a scripted reply.");
   d.tested=true;save();return {rerender:true};
 }
 return null;
}
function handleInput(el,o){
 const key=el.dataset.wizardField;
 if(key==="new-name"){memory.name=el.value;memory.error="";return;}
 if(key==="simulation"){memory.simulationInput=el.value;memory.simulationReply="";return;}
 const parts=location.hash.slice(2).split("/");
 const d=draft(o,parts[1]);if(!d)return;
 if(!["name","company","task","handoff","group"].includes(key))return;
 d[key]=el.value;
 d.tested=false;
 save();
 const saveLabel=document.querySelector("[data-wizard-save]");
 if(saveLabel)saveLabel.textContent=L(document.documentElement.lang,memory.saveError?"Ошибка локального сохранения":"Локально сохранено",memory.saveError?"Local save failed":"Saved locally");
}
function handleToggle(el,o){
 const parts=location.hash.slice(2).split("/");
 const d=draft(o,parts[1]);if(!d)return false;
 const field=el.dataset.wizardToggle;
 if(!["knowledge","connections"].includes(field))return false;
 const values=new Set(d[field]);
 if(el.checked)values.add(el.value);else values.delete(el.value);
 d[field]=Array.from(values);
 d.tested=false;
 save();
 return true;
}
globalThis.AIMockCreator={page,panel,handleClick,handleInput,handleToggle,catalogRecords,draft,ready};
})();