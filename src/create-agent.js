(function creatorModule(){
"use strict";
const KEY="aimock-wizard-drafts-v1";
const memory={type:null,name:"",description:"",error:"",simulationInput:"",simulationReply:"",saveError:false,professionSearch:"",professionCategory:"all",professionPage:1};
let drafts={};
try{drafts=JSON.parse(localStorage.getItem(KEY)||"{}");if(!drafts||typeof drafts!=="object"||Array.isArray(drafts))drafts={};}catch(_){drafts={};}
const E=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(locale,ru,en)=>locale==="en"?en:ru;
const professions=Object.freeze([{"id":"sales","ru":"Менеджер заявок","en":"Lead manager","category":"sales","available":true,"detailRu":"Обрабатывает входящие обращения, формирует лиды","detailEn":"Qualifies inbound inquiries and creates leads"},{"id":"hr","ru":"HR-рекрутер","en":"HR recruiter","category":"hr","available":true,"detailRu":"Собирает отклики и готовит сводки для HR","detailEn":"Collects applicants and prepares HR summaries"},{"id":"support","ru":"Клиентская поддержка","en":"Customer support","category":"support","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"onboarding","ru":"Специалист адаптации","en":"Onboarding specialist","category":"support","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"qa","ru":"Контроль качества","en":"Quality assurance","category":"support","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"community","ru":"Комьюнити-менеджер","en":"Community manager","category":"support","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"complaints","ru":"Специалист по претензиям","en":"Complaints specialist","category":"support","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"concierge","ru":"Цифровой консьерж","en":"Digital concierge","category":"support","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"sales-b2b","ru":"B2B-менеджер","en":"B2B sales","category":"sales","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"account-manager","ru":"Аккаунт-менеджер","en":"Account manager","category":"sales","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"customer-success","ru":"Customer Success","en":"Customer success","category":"sales","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"renewals","ru":"Специалист продлений","en":"Renewals specialist","category":"sales","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"lead-research","ru":"Исследователь лидов","en":"Lead researcher","category":"sales","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"appointment","ru":"Координатор встреч","en":"Meeting coordinator","category":"sales","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"hr-coordinator","ru":"HR-координатор","en":"HR coordinator","category":"hr","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"interview","ru":"Координатор интервью","en":"Interview coordinator","category":"hr","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"vacancy","ru":"Редактор вакансий","en":"Vacancy editor","category":"hr","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"talent-pool","ru":"Менеджер кадрового резерва","en":"Talent pool manager","category":"hr","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"training","ru":"Координатор обучения","en":"Training coordinator","category":"hr","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"marketing-brief","ru":"Маркетинг-аналитик","en":"Marketing analyst","category":"marketing","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"content-editor","ru":"Контент-редактор","en":"Content editor","category":"marketing","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"seo","ru":"SEO-специалист","en":"SEO specialist","category":"marketing","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"social","ru":"SMM-менеджер","en":"Social media manager","category":"marketing","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"email-marketing","ru":"Email-маркетолог","en":"Email marketer","category":"marketing","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"research","ru":"Исследователь рынка","en":"Market researcher","category":"marketing","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"operations","ru":"Операционный координатор","en":"Operations coordinator","category":"operations","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"project-coord","ru":"Координатор проектов","en":"Project coordinator","category":"operations","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"procurement","ru":"Специалист закупок","en":"Procurement specialist","category":"operations","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"document-flow","ru":"Документооборот","en":"Document coordinator","category":"operations","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"event-planner","ru":"Координатор мероприятий","en":"Event planner","category":"operations","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"finance-analyst","ru":"Финансовый аналитик","en":"Financial analyst","category":"finance","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"invoice","ru":"Специалист счетов","en":"Billing specialist","category":"finance","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"expense","ru":"Контроль расходов","en":"Expense reviewer","category":"finance","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"data-analyst","ru":"Аналитик данных","en":"Data analyst","category":"data","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"reporting","ru":"Специалист отчётности","en":"Reporting specialist","category":"data","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"},{"id":"data-cleanup","ru":"Валидация данных","en":"Data quality specialist","category":"data","available":false,"detailRu":"Каталог будущих профессий","detailEn":"Future profession preview"}]);
const labels=[["Основное","Basics"],["Профессия","Profession"],["Инструкции","Instructions"],["Знания","Knowledge"],["Интеграции","Integrations"],["Разрешения","Permissions"],["Готовность","Readiness"]];
const label=(i,loc)=>labels[i-1]?.[loc==="en"?1:0]||"";
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(drafts));memory.saveError=false;return true;}catch(_){memory.saveError=true;return false;}};
const draftsFor=o=>Object.values(drafts).filter(d=>d.orgId===o.id&&["draft","created","active","stopped"].includes(d.status));
const catalogRecords=o=>draftsFor(o).map(d=>({id:d.id,name:d.name||"Без названия",type:d.type,state:d.status==="created"?"stopped":d.status,last:d.status==="draft"?"Черновик":"—",group:d.group||(d.type==="hr"?"HR":d.type==="sales"?"Продажи":"Без группы"),tags:[],taskCount:0,issues:0}));
const draft=(o,id)=>{const d=drafts[id];return d&&d.orgId===o.id?d:null;};
const ready=(d,o)=>{
 const connected=(d.connections||[]).filter(id=>o.integrations.some(i=>i.id===id&&i.status==="connected"));
 return [
 {name:"identity",ok:!!d.name.trim()},
 {name:"profession",ok:["sales","hr"].includes(d.type)},
 {name:"instructions",ok:!!d.company.trim()&&!!d.task.trim()},
 {name:"knowledge",ok:(d.knowledge||[]).length>0},
 {name:"connections",ok:connected.length>0},
 {name:"permissions",ok:!!(d.handoff||"").trim()&&!!d.group&&!!(d.handoffTarget||d.group)},
 {name:"testing",ok:!!d.tested}
 ];
};
const steps=(current,loc)=>'<nav class="wizard-steps" aria-label="'+L(loc,"Этапы настройки","Setup steps")+'">'+labels.map((name,index)=>'<a '+(current.id&&current.unselected&&index>1?'aria-disabled="true" tabindex="-1"':'href="'+(current.id?'#/agents/'+encodeURIComponent(current.id)+'/setup/'+(index+1):"#/agents/new")+'"')+' class="wizard-step '+(current.step===index+1?"active":"")+' '+(index+1<current.step?"completed":"")+'" '+(current.step===index+1?'aria-current="step"':'')+'><span>'+ (index+1)+'</span><small>'+E(name[loc==="en"?1:0])+'</small></a>').join("")+'</nav>';
function shellHeading(o,d,step,loc){
 const subtitle=d?E(d.name)+' · '+L(loc,"Локальный черновик","Local draft")+' · '+L(loc,"Шаг","Step")+' '+step+' / 7':L(loc,"Шаг 1 из 7 · Название и назначение агента","Step 1 of 7 · Name and purpose");
 return '<div class="wizard-heading"><div><a class="wizard-back-link" href="#/agents">‹ '+L(loc,"Каталог агентов","Agent catalog")+'</a><h1>'+L(loc,"Создать агента","Create agent")+'</h1><p>'+subtitle+'</p></div><span class="wizard-local-pill">'+L(loc,"МОК · без бэкенда","MOCK · no backend")+'</span></div>';
}
function newPage(o,loc,icon){
 return shellHeading(o,null,1,loc)+steps({step:1,id:null},loc)+
 '<section class="wizard-body"><div class="wizard-section-intro"><h2>'+L(loc,"Основная информация","Agent basics")+'</h2><p>'+L(loc,"Начните с названия и цели. Профессию выберете на следующем отдельном этапе.","Start with a name and purpose. Select a profession on the next dedicated page.")+'</p></div>'+
 '<label class="wizard-field wizard-name"><span>'+L(loc,"Название агента","Agent name")+'</span><input data-wizard-field="new-name" maxlength="80" value="'+E(memory.name)+'" placeholder="'+L(loc,"Например, Помощник отдела продаж","E.g. Sales department assistant")+'" autocomplete="off"><small>'+L(loc,"Отображается в каталоге вашей организации.","Shown in your organization catalog.")+'</small></label>'+
 '<label class="wizard-field"><span>'+L(loc,"Краткое описание","Short description")+'</span><textarea data-wizard-field="new-description" maxlength="400" rows="3" placeholder="'+L(loc,"Какие задачи должен решать будущий агент?","What should this agent help with?")+'">'+E(memory.description)+'</textarea><small>'+L(loc,"Описание можно изменить позже. Профессия задаст доступные возможности.","You can edit this later. The profession defines available capabilities.")+'</small></label>'+
 (memory.error?'<p class="wizard-error" role="alert">'+E(memory.error)+'</p>':'')+
 '</section><div class="wizard-footer"><a href="#/agents" class="wizard-btn wizard-secondary">'+L(loc,"Отмена","Cancel")+'</a>'+
 '<button type="button" class="wizard-btn wizard-primary" data-wizard-action="create">'+L(loc,"Далее: выбор профессии","Next: choose profession")+' →</button></div>';
}
const textArea=(label,field,value,placeholder,rows=4)=>'<label class="wizard-field"><span>'+label+'</span><textarea rows="'+rows+'" data-wizard-field="'+field+'" placeholder="'+placeholder+'">'+E(value)+'</textarea></label>';

const categories=[
 ["all","Все","All"],["sales","Продажи","Sales"],["hr","HR","HR"],["support","Поддержка","Support"],
 ["marketing","Маркетинг","Marketing"],["operations","Операции","Operations"],["finance","Финансы","Finance"],["data","Аналитика","Analytics"]
];
const professionPageSize=8;
function professionList(d,loc,icon){
 const query=memory.professionSearch.trim().toLocaleLowerCase();
 const available=professions.filter(p=>(memory.professionCategory==="all"||p.category===memory.professionCategory)
 &&(!query||[p.ru,p.en,p.detailRu,p.detailEn].join(" ").toLocaleLowerCase().includes(query)));
 const pageCount=Math.max(1,Math.ceil(available.length/professionPageSize));
 memory.professionPage=Math.max(1,Math.min(pageCount,memory.professionPage));
 const offset=(memory.professionPage-1)*professionPageSize;
 const current=available.slice(offset,offset+professionPageSize);
 return '<div class="profession-results"><span>'+L(loc,"Найдено: ","Results: ")+available.length+' · '+L(loc,"Доступно сейчас: 2","Available now: 2")+'</span><span>'+L(loc,"Страница ","Page ")+memory.professionPage+' / '+pageCount+'</span></div>'+
 '<div class="profession-grid">'+(current.length?current.map(p=>{
   const selected=d.type===p.id;
   return '<button type="button" class="profession-row '+(selected?"selected":"")+'" data-wizard-action="select-profession" data-value="'+E(p.id)+'" aria-pressed="'+selected+'" '+(!p.available?"disabled":"")+'>'+
   '<span class="profession-icon">'+icon(p.category==="hr"?"agents":p.category==="sales"?"inbox":"knowledge",20)+'</span>'+
   '<span class="profession-content"><strong>'+E(loc==="en"?p.en:p.ru)+'</strong><small>'+E(loc==="en"?p.detailEn:p.detailRu)+'</small></span>'+
   '<span class="profession-indicator '+(selected?"chosen":"")+'">'+(selected?icon("check",15):p.available?"+":L(loc,"Скоро","Soon"))+'</span></button>';
 }).join(""):'<p class="wizard-empty">'+L(loc,"Ничего не найдено. Измените поиск или категорию.","No professions match. Try another search or category.")+'</p>')+'</div>'+
 '<nav class="profession-pages" aria-label="'+L(loc,"Страницы профессий","Profession pages")+'"><button data-wizard-action="profession-page" data-value="'+(memory.professionPage-1)+'" '+(memory.professionPage===1?"disabled":"")+'>← '+L(loc,"Назад","Previous")+'</button>'+
 Array.from({length:pageCount},(_,i)=>'<button data-wizard-action="profession-page" data-value="'+(i+1)+'" class="'+(memory.professionPage===i+1?"current":"")+'" aria-current="'+(memory.professionPage===i+1?"page":"false")+'">'+(i+1)+'</button>').join("")+
 '<button data-wizard-action="profession-page" data-value="'+(memory.professionPage+1)+'" '+(memory.professionPage===pageCount?"disabled":"")+'>'+L(loc,"Далее","Next")+' →</button></nav>';
}
function professionStep(d,loc,icon){
 return '<div class="wizard-section-intro"><h2>'+L(loc,"Выберите профессию","Choose a profession")+'</h2><p>'+L(loc,"Каталог рассчитан на десятки направлений. Сейчас доступны два утверждённых шаблона, остальные показаны как будущие варианты.","The catalog scales to many professions. Two approved templates are available; others are future previews.")+'</p></div>'+
 '<div class="profession-toolbar"><label class="profession-search">'+icon("search",17)+'<input type="search" data-profession-search value="'+E(memory.professionSearch)+'" placeholder="'+L(loc,"Найти профессию…","Search professions…")+'" autocomplete="off" aria-label="'+L(loc,"Поиск профессии","Search professions")+'"></label>'+
 '<label class="profession-category"><span>'+L(loc,"Категория","Category")+'</span><select data-profession-category>'+categories.map(([id,ru,en])=>'<option value="'+id+'" '+(memory.professionCategory===id?"selected":"")+'>'+E(L(loc,ru,en))+'</option>').join("")+'</select></label></div>'+
 '<div class="profession-list-mount" aria-live="polite">'+professionList(d,loc,icon)+'</div>';
}
function refreshProfessionList(o,loc,icon){
 const id=location.hash.slice(2).split("/")[1];
 const d=draft(o,id),mount=document.querySelector(".profession-list-mount");
 if(d&&mount)mount.innerHTML=professionList(d,loc,icon);
}
function instructionExamples(type,loc){
 const hr=type==="hr";
 return {
 company:L(loc,hr?"Мы — IT-компания. Нанимаем разработчиков и аналитиков, проводим первичные беседы с кандидатами.":"Мы — студия ремонта квартир. Помогаем клиентам выбрать услугу, рассчитать стоимость и записаться на консультацию.",hr?"We recruit developers and analysts and handle initial conversations with candidates.":"We offer home renovation services and help customers plan a consultation."),
 task:L(loc,hr?"Уточняй вакансию, опыт и формат работы. Отвечай по утверждённым описаниям вакансий. Передавай HR краткую сводку, не принимай решений об отказе.":"Уточняй площадь, сроки и пожелания. Отвечай по актуальной базе знаний. Предлагай консультацию и передавай заявку менеджеру.",hr?"Ask about the role, experience and work format. Answer from approved job details and hand a summary to HR. Never reject applicants.":"Ask about the area, timeline and needs. Answer using the knowledge base and pass the lead to a manager."),
 handoff:L(loc,hr?"Передавай HR вопросы без проверенного ответа, жалобы и просьбы поговорить с рекрутером.":"Передавай менеджеру жалобы, просьбы о скидке, вопросы без проверенного ответа и просьбы поговорить с человеком.",hr?"Hand over unverified questions, complaints and requests to speak with a recruiter.":"Hand off complaints, discount requests, unverified questions or requests for a human.")
 };
}
function section2(d,loc){
 const items=[
  {key:"company",n:"01",title:L(loc,"Чем занимается компания?","What does your company do?"),help:L(loc,"Какие услуги, товары или вакансии вы предлагаете? Кому помогаете? Это контекст, чтобы агент понимал вашу работу.","What do you offer and whom do you serve? This gives the agent essential business context."),placeholder:L(loc,"Расскажите о компании простыми словами…","Describe the company in plain language…")},
  {key:"task",n:"02",title:L(loc,"Что должен делать агент?","What should the agent do?"),help:L(loc,"Опишите цепочку действий: какие вопросы задать, где искать ответы, какой результат получить.","Describe a workflow: what to ask, where to look up answers, and the desired result."),placeholder:L(loc,"Например: уточнить запрос, ответить по базе знаний, передать заявку…","For example: clarify a request, answer from knowledge, pass a lead…")},
  {key:"handoff",n:"03",title:L(loc,"Когда подключать сотрудника?","When should a teammate take over?"),help:L(loc,"В каких ситуациях агент обязан остановить самостоятельные ответы? Команду-получателя выберете на шаге «Разрешения».","When must the agent stop answering on its own? Select the receiving team in Permissions."),placeholder:L(loc,"Например: жалоба, просьба поговорить с человеком, нет точной информации…","For example: complaint, human requested, no verified information…")}
 ];
 const examples=instructionExamples(d.type,loc);
 return '<div class="wizard-section-intro"><h2>'+L(loc,"Настройте поведение агента","Define how the agent should work")+'</h2><p>'+L(loc,"Ответьте на три вопроса своими словами. Под каждым полем есть пояснение и готовый пример, который можно использовать как основу.","Answer three practical questions in your own words. Each has guidance and an example you can adapt.")+'</p></div>'+
 '<div class="wizard-guided-fields">'+items.map(it=>'<div class="wizard-guided-field"><div class="wizard-guided-heading"><span class="wizard-guided-number">'+it.n+'</span><div><label for="wizard-'+it.key+'">'+it.title+'</label><p id="wizard-help-'+it.key+'">'+it.help+'</p></div></div>'+
 '<textarea id="wizard-'+it.key+'" aria-describedby="wizard-help-'+it.key+'" rows="2" data-wizard-field="'+it.key+'" placeholder="'+E(it.placeholder)+'">'+E(d[it.key]||"")+'</textarea>'+
 '<details class="wizard-example"><summary>'+L(loc,"Показать пример заполнения","See an example")+'</summary><p>'+E(examples[it.key])+'</p><button type="button" data-wizard-action="fill-example" data-value="'+it.key+'">'+L(loc,"Использовать пример","Use example")+'</button></details></div>').join("")+'</div>'+
 '<div class="wizard-advisory">'+L(loc,"Инструкции влияют на ответы агента, но не выдают доступ к внешним сервисам и действиям. Разрешения задаются отдельно.","Instructions guide responses, but never grant access to external services or tools. Permissions are configured separately.")+'</div>';
}
const knowledgeFor=(d)=>d.type==="hr"?[{id:"vacancies",title:"Вакансии · 2026",detail:"Набор вакансий · актуально"},{id:"candidate-guide",title:"Политика работы с кандидатами",detail:"Порядок интервью · актуально"},{id:"old-hr",title:"Архив откликов",detail:"Устаревший · только просмотр",disabled:true}]:[{id:"services",title:"Услуги и цены · октябрь 2026",detail:"PDF · актуальная редакция"},{id:"faqs",title:"Частые вопросы клиентов",detail:"24 статьи · актуально"},{id:"old-prices",title:"Устаревшие тарифы",detail:"PDF · неактуально",disabled:true}];
function section3(d,loc){
 return '<div class="wizard-section-intro"><h2>'+L(loc,"Документы и база знаний","Knowledge & documents")+'</h2><p>'+L(loc,"Выберите материалы целиком по строке. Загрузка новых документов будет в разделе «База знаний».","Select materials by clicking their rows. Uploading new documents belongs to the Knowledge Base page.")+'</p></div>'+
 '<div class="wizard-choice-list">'+knowledgeFor(d).map(k=>{
 const selected=d.knowledge.includes(k.id);
 return '<button type="button" class="wizard-check-row wizard-knowledge-item '+(selected?"selected":"")+' '+(k.disabled?"disabled":"")+'" data-wizard-action="toggle-knowledge" data-value="'+E(k.id)+'" '+(k.disabled?'disabled aria-disabled="true"':'aria-pressed="'+selected+'"')+'>'+
 '<span class="wizard-check-icon">▤</span><span class="wizard-check-main"><strong>'+E(k.title)+'</strong><small>'+E(k.detail)+'</small></span>'+
 '<span class="wizard-integration-action">'+(selected?"✓":k.disabled?L(loc,"Неактуально","Outdated"):"+")+'</span></button>';
 }).join("")+'</div>'+
 '<a class="wizard-inline-link" href="#/knowledge/from-agent/'+encodeURIComponent(d.id)+'">'+L(loc,"Открыть базу знаний","Open Knowledge Base")+' ↗</a>';
}
function section4(d,o,loc,icon){
 const brand={telegram:"telegram.svg",max:"max.svg",bitrix:"bitrix24.svg",bitrix24:"bitrix24.svg",vk:"vk.svg",whatsapp:"whatsapp.svg",viber:"viber.svg",googlecalendar:"googlecalendar.svg"};
 const logo=i=>brand[i.brand]?'<img src="./src/assets/logos/'+brand[i.brand]+'" alt="" width="33" height="33" loading="lazy">':icon("integrations",25);
 const desc=i=>i.brand==="telegram"?L(loc,"Входящие обращения и диалоги","Incoming conversations"):
 i.brand==="max"?L(loc,"Сообщения команды и клиентов","Team and customer messages"):
 i.brand==="bitrix"?L(loc,"CRM, лиды и клиентские карточки","CRM, leads and customer records"):
 L(loc,"Подключение организации","Organization integration");
 const groups=[
 {heading:L(loc,"Подключено","Connected"),items:o.integrations.filter(i=>i.status==="connected")},
 {heading:L(loc,"Требуют действия","Needs attention"),items:o.integrations.filter(i=>i.status!=="connected")}
 ];
 return '<div class="wizard-section-intro"><h2>'+L(loc,"Подключения","Integrations")+'</h2><p>'+L(loc,"Выбирайте подключение целиком по строке. Недоступные подключения сначала необходимо исправить в Integration Hub.","Select a connection by clicking its entire row. Fix unavailable connections in Integration Hub first.")+'</p></div>'+
 '<div class="wizard-integrations">'+groups.filter(g=>g.items.length).map(g=>'<section class="wizard-integration-group"><div class="wizard-integration-heading"><h3>'+g.heading+'</h3><span>'+g.items.length+'</span></div><div class="wizard-integration-grid">'+
 g.items.map(i=>{const enabled=i.status==="connected",selected=d.connections.includes(i.id);
 return '<button type="button" class="wizard-integration-item '+(selected?"selected":"")+' '+(!enabled?"unavailable":"")+'" data-wizard-action="toggle-connection" data-value="'+E(i.id)+'" '+(!enabled?'disabled aria-disabled="true"':'aria-pressed="'+selected+'"')+'>'+
 '<span class="wizard-integration-logo">'+logo(i)+'</span><span class="wizard-integration-copy"><strong>'+E(i.name)+'</strong><small>'+E(desc(i))+'</small></span>'+
 '<span class="wizard-integration-action">'+(enabled?selected?icon("check",19):"+":L(loc,"Вход","Sign in"))+'</span></button>';}).join("")+
 '</div></section>').join("")+'</div>'+
 '<a class="wizard-inline-link" href="#/integrations/from-agent/'+encodeURIComponent(d.id)+'">'+L(loc,"Открыть Integration Hub","Open Integration Hub")+' ↗</a>'+
 '<p class="wizard-footnote">'+L(loc,"Добавление подключений и проверка эксклюзивных назначений выполняются сервером в боевой версии. Здесь только мок-выбор.","Connecting providers and checking exclusive assignments require the production backend. This step only stores demo selections.")+'</p>';
}
const groupOptions=[["Продажи","Отдел продаж","Sales team"],["HR","HR-команда","HR team"],["Поддержка","Поддержка","Support team"]];
function wizardDropdown(d,loc,field,title,description){
 const selected=d[field]||d.group||"Продажи",item=groupOptions.find(g=>g[0]===selected)||groupOptions[0];
 return '<div class="wizard-permission-setting"><div class="wizard-setting-label"><strong>'+title+'</strong><small>'+description+'</small></div>'+
 '<details class="wizard-select" data-wizard-select="'+field+'"><summary aria-label="'+title+'"><span class="wizard-select-current">'+E(L(loc,item[1],item[2]))+'</span><span class="wizard-select-arrow" aria-hidden="true">⌄</span></summary>'+
 '<div class="wizard-select-options" role="group" aria-label="'+title+'">'+groupOptions.map(g=>'<button type="button" data-wizard-action="select-choice" data-field="'+field+'" data-value="'+E(g[0])+'" aria-pressed="'+(g[0]===selected)+'">'+E(L(loc,g[1],g[2]))+(g[0]===selected?'<span aria-hidden="true">✓</span>':'')+'</button>').join("")+'</div></details></div>';
}
function section5(d,loc){
 const action=(title,detail,kind)=>'<div class="wizard-permission"><div><strong>'+title+'</strong><small>'+detail+'</small></div><span class="wizard-permission-'+kind+'">'+(kind==="allowed"?L(loc,"Разрешено","Allowed"):kind==="approval"?L(loc,"После подтверждения","Approval required"):L(loc,"Запрещено","Forbidden"))+'</span></div>';
 return '<div class="wizard-section-intro"><h2>'+L(loc,"Действия и ограничения","Permissions & safeguards")+'</h2><p>'+L(loc,"Кто может управлять агентом и какой команде передать разговор, если AI не должен отвечать самостоятельно?","Who can manage the agent and which team receives a conversation when AI should stop replying?")+'</p></div>'+
 '<div class="wizard-permissions">'+
 action(L(loc,"Читать сообщения","Read messages"),L(loc,"Только в назначенных каналах","Only in assigned channels"),"allowed")+
 action(d.type==="hr"?L(loc,"Создать карточку кандидата","Create candidate record"):L(loc,"Создать лид в CRM","Create CRM lead"),L(loc,"После проверки данных","After data verification"),"approval")+
 action(d.type==="hr"?L(loc,"Самостоятельно отклонять кандидатов","Reject candidates independently"):L(loc,"Менять цены и скидки","Change prices and discounts"),L(loc,"Недоступно этому типу агента","Not available to this agent type"),"denied")+
 '</div><div class="wizard-settings-grid">'+
 wizardDropdown(d,loc,"group",L(loc,"Кто может управлять агентом?","Who can manage this agent?"),L(loc,"Сотрудники выбранной группы смогут видеть и настраивать агента. Пока это демо без реального доступа.","Employees in the chosen group can manage the agent. This is a demo, with no actual permission changes."))+
 wizardDropdown(d,loc,"handoffTarget",L(loc,"Кому передавать диалоги?","Who receives handed-off conversations?"),L(loc,"Если агент не может продолжить сам, эту команду нужно подключить к диалогу. Реальная передача пока отключена.","This team takes over when the agent must stop answering. Live handoff is disabled."))+
 '</div><div class="wizard-handoff-note"><strong>'+L(loc,"Что означает передача человеку?","What does a human handoff mean?")+'</strong><p>'+L(loc,"Агент перестаёт отвечать самостоятельно, а вопрос получает сотрудник. Условия передачи вы описали на шаге «Инструкции».","The AI stops responding independently and a teammate takes over. You defined the trigger on the Instructions step.")+'</p><a href="#/agents/'+E(d.id)+'/setup/3">'+L(loc,"Посмотреть правила передачи","Review handoff rules")+' →</a></div>';
}
function section6(d,o,loc,icon){
 const items=ready(d,o);
 const titles=[L(loc,"Название","Name"),L(loc,"Профессия","Profession"),L(loc,"Инструкции","Instructions"),L(loc,"База знаний","Knowledge base"),L(loc,"Подключения","Integrations"),L(loc,"Разрешения","Permissions"),L(loc,"Тестирование","Testing")];
 return '<div class="wizard-section-intro"><h2>'+L(loc,"Проверка готовности","Readiness review")+'</h2><p>'+L(loc,"Проверьте обязательные шаги перед запуском. В этой версии реальный запуск отключён.","Check required steps before deployment. Live activation is disabled in this prototype.")+'</p></div>'+
 '<div class="wizard-readiness-list">'+items.map((item,i)=>'<div class="wizard-ready-row"><span class="wizard-ready-icon '+(item.ok?"ok":"todo")+'">'+icon(item.ok?"check":"alert",16)+'</span><span><strong>'+titles[i]+'</strong><small>'+L(loc,item.ok?"Готово":"Требует внимания",item.ok?"Ready":"Needs attention")+'</small></span></div>').join("")+'</div>'+
 '<div class="wizard-advisory">'+L(loc,"Это интерактивный прототип без бэкенда: даже при полной готовности AI-агент не запускается и не выполняет внешние действия.","This interactive prototype has no backend. Even a fully configured agent cannot go live or perform external actions.")+'</div>';
}
function testing(d,o,loc,icon){
 const tested=d.tested;
 return '<header class="wizard-heading"><div><a class="wizard-back-link" href="#/agents/'+E(d.id)+'/setup/7">‹ '+L(loc,"Назад к готовности","Back to readiness")+'</a><h1>'+L(loc,"Тестирование агента","Test agent")+'</h1><p>'+E(d.name)+' · '+L(loc,"Только безопасная локальная симуляция","Safe local simulation only")+'</p></div><span class="wizard-local-pill">MOCK</span></header>'+
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
 const d=draft(o,id);if(!d)return missing(loc);
 const s=Math.max(1,Math.min(7,Number(step)||2));
 const basics='<div class="wizard-section-intro"><h2>'+L(loc,"Основная информация","Agent basics")+'</h2><p>'+L(loc,"Измените название и описание черновика.","Edit the name and description of this draft.")+'</p></div>'+
 '<label class="wizard-field"><span>'+L(loc,"Название","Name")+'</span><input data-wizard-field="name" maxlength="80" value="'+E(d.name)+'"></label>'+
 '<label class="wizard-field"><span>'+L(loc,"Описание","Description")+'</span><textarea data-wizard-field="description" maxlength="400" rows="3">'+E(d.description||"")+'</textarea></label>';
 const content=s===1?basics:s===2?professionStep(d,loc,icon):s===3?section2(d,loc):s===4?section3(d,loc):s===5?section4(d,o,loc,icon):s===6?section5(d,loc):section6(d,o,loc,icon);
 const next='#/agents/'+E(d.id)+'/setup/'+(s+1);
 const blocked=s===2&&!["sales","hr"].includes(d.type);
 return shellHeading(o,d,s,loc)+steps({step:s,id:d.id,unselected:!d.type},loc)+'<section class="wizard-body '+(s===2?"wizard-profession-stage":"")+'">'+content+'</section>'+
 '<div class="wizard-footer"><a class="wizard-btn wizard-secondary" href="'+(s===1?"#/agents":"#/agents/"+E(d.id)+"/setup/"+(s-1))+'">← '+L(loc,"Назад","Back")+'</a>'+
 (s===7?'<a class="wizard-btn wizard-secondary" href="#/agents/'+E(d.id)+'/testing">'+L(loc,"Открыть тестирование","Open testing")+'</a><button class="wizard-btn wizard-primary" disabled title="'+L(loc,"Реальный запуск отключён","Live activation disabled")+'">'+L(loc,"Запустить · недоступно","Launch · unavailable")+'</button>':
 '<a class="wizard-btn wizard-primary '+(blocked?"wizard-disabled":"")+'" '+(blocked?'aria-disabled="true" tabindex="-1"':'href="'+next+'"')+'>'+L(loc,"Далее","Next")+' →</a>')+'</div>';
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
 const headings=[L(loc,"Название","Name"),L(loc,"Профессия","Profession"),L(loc,"Инструкции","Instructions"),L(loc,"База знаний","Knowledge"),L(loc,"Подключения","Connections"),L(loc,"Разрешения","Permissions"),L(loc,"Тестирование","Testing")];
 return '<aside class="right-rail wizard-rail '+(open?"mobile-open":"")+'" id="right-rail" aria-label="'+L(loc,"Контекст настройки","Setup context")+'"><div class="wizard-rail-top"><span class="eyebrow">'+L(loc,"ПОМОЩЬ ПО НАСТРОЙКЕ","SETUP GUIDE")+'</span><button class="close-mobile" data-close-panel type="button" aria-label="Close">'+icon("close",18)+'</button></div>'+
 '<h2>'+E(d?.name||L(loc,"Перед началом","Before you begin"))+'</h2><span class="wizard-rail-status">'+L(loc,"Локальный черновик · демо","Local draft · demo")+'</span>'+
 '<div class="wizard-rail-group"><strong>'+L(loc,"Сохранение","Save status")+'</strong><p class="wizard-save" data-wizard-save>'+L(loc,memory.saveError?"Ошибка локального сохранения":d?"Локально сохранено":"Черновик ещё не создан",memory.saveError?"Local save failed":d?"Saved locally":"Draft not created")+'</p><small>'+L(loc,"Синхронизация между устройствами пока недоступна.","Cross-device sync is not available yet.")+'</small></div>'+
 '<div class="wizard-rail-group"><strong>'+L(loc,"Готовность","Readiness")+'</strong><div class="wizard-rail-checklist">'+headings.map((title,i)=>'<div><span class="'+(scores[i]?.ok?"done":"pending")+'">'+icon(scores[i]?.ok?"check":"chevron",13)+'</span><small>'+title+'</small></div>').join("")+'</div></div>'+
 '<div class="wizard-rail-bottom"><strong>'+L(loc,"Перед запуском","Before launch")+'</strong><p>'+L(loc,"Проверьте знания, подключённые каналы и разрешения, затем протестируйте сценарий. Реальный запуск здесь недоступен.","Check knowledge, channels and permissions; then test the workflow. Live launch is disabled in this demo.")+'</p><a href="#/help/from-agent/'+encodeURIComponent(d?.id||"new")+'/'+(location.hash.slice(2).split("/")[3]||"2")+'">'+L(loc,"Помощь по созданию агента","Agent setup help")+' ↗</a></div></aside>';
}
function refreshRail(o,loc,icon){
 const old=document.querySelector(".wizard-rail");if(!old)return;
 const id=location.hash.slice(2).split("/")[1];old.outerHTML=panel(o,loc,icon,id,old.classList.contains("mobile-open"));
}
function setProfessionSearch(value){memory.professionSearch=value;memory.professionPage=1;}
function setProfessionCategory(value){memory.professionCategory=categories.some(c=>c[0]===value)?value:"all";memory.professionPage=1;}

function handleClick(el,o){
 const action=el.dataset.wizardAction;
 if(action==="create"){
  const name=memory.name.trim();
  if(!name){memory.error="Укажите название агента";return {rerender:true};}
  const id="draft-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7);
  drafts[id]={id,orgId:o.id,status:"draft",type:null,name,description:memory.description.trim(),company:"",task:"",handoff:"",knowledge:[],connections:[],group:"",handoffTarget:"",tested:false,createdAt:Date.now()};
  if(!save()){memory.error="Не удалось сохранить локальный черновик";delete drafts[id];return {rerender:true};}
  memory.name="";memory.description="";memory.error="";memory.professionSearch="";memory.professionCategory="all";memory.professionPage=1;
  return {navigate:"#/agents/"+id+"/setup/2"};
 }
 const id=location.hash.slice(2).split("/")[1],d=draft(o,id);
 if(!d)return null;
 if(action==="select-profession"){
   const item=professions.find(p=>p.id===el.dataset.value&&p.available);
   if(!item)return null;
   d.type=item.id;
   d.group=item.category==="hr"?"HR":"Продажи";d.handoffTarget=d.group;d.knowledge=[];d.connections=[];d.tested=false;
   save();return {rerender:true};
 }
 if(action==="profession-page"){
  const page=Number(el.dataset.value);
  const q=memory.professionSearch.trim().toLocaleLowerCase();
  const total=professions.filter(p=>(memory.professionCategory==="all"||p.category===memory.professionCategory)
   &&(!q||[p.ru,p.en,p.detailRu,p.detailEn].join(" ").toLocaleLowerCase().includes(q))).length;
  const count=Math.max(1,Math.ceil(total/professionPageSize));
  if(!Number.isInteger(page)||page<1||page>count)return null;
  memory.professionPage=page;return {professionList:true};
 }
 if(action==="fill-example"){
  if(!["company","task","handoff"].includes(el.dataset.value))return null;
  return {exampleField:el.dataset.value,exampleValue:instructionExamples(d.type,document.documentElement.lang)[el.dataset.value]};
 }
 if(action==="select-choice"){
  const field=el.dataset.field;
  if(!["group","handoffTarget"].includes(field)||!groupOptions.some(g=>g[0]===el.dataset.value))return null;
  d[field]=el.dataset.value;d.tested=false;save();
  return {choiceField:field};
 }
 if(action==="toggle-knowledge"){
  const item=knowledgeFor(d).find(k=>k.id===el.dataset.value&&!k.disabled);
  if(!item)return null;
  const entries=new Set(d.knowledge);
  if(entries.has(item.id))entries.delete(item.id);else entries.add(item.id);
  d.knowledge=Array.from(entries);d.tested=false;save();
  return {integrationButton:true,selected:d.knowledge.includes(item.id)};
 }
 if(action==="toggle-connection"){
   const connection=o.integrations.find(i=>i.id===el.dataset.value&&i.status==="connected");
   if(!connection)return null;
   const entries=new Set(d.connections);
   if(entries.has(connection.id))entries.delete(connection.id);else entries.add(connection.id);
   d.connections=Array.from(entries);d.tested=false;save();
   return {integrationButton:true,selected:d.connections.includes(connection.id)};
 }
 if(action==="simulate"){
  if(!memory.simulationInput.trim())return null;
  memory.simulationReply=L(document.documentElement.lang,"Спасибо! Я уточню детали и передам запрос уполномоченному сотруднику. Это демонстрационный ответ.","Thank you! I will collect the details and pass the inquiry to an authorized teammate. This is a scripted reply.");
  d.tested=true;save();return {rerender:true};
 }
 return null;
}
function handleInput(el,o){
 const key=el.dataset.wizardField;
 if(key==="new-name"){memory.name=el.value;memory.error="";return;}
 if(key==="new-description"){memory.description=el.value;return;}
 if(key==="simulation"){memory.simulationInput=el.value;memory.simulationReply="";return;}
 const id=location.hash.slice(2).split("/")[1],d=draft(o,id);
 if(!d||!["name","description","company","task","handoff","group"].includes(key))return;
 d[key]=el.value;d.tested=false;save();
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
function creationChecks(d){
 const label=key=>String(d?.[key]||"").trim();
 return [
  {key:"name",ok:!!label("name"),required:true},
  {key:"type",ok:["sales","hr"].includes(d?.type),required:true},
  {key:"task",ok:!!label("task"),required:true},
  {key:"group",ok:!!label("group"),required:false},
  {key:"knowledge",ok:(d?.knowledge||[]).length>0,required:false},
  {key:"connections",ok:(d?.connections||[]).length>0,required:false},
  {key:"handoff",ok:!!label("handoff"),required:false}
 ];
}
function finalizeAgent(o,id){
 const d=draft(o,id);
 if(!d||d.status!=="draft")return {ok:false,reason:"not_found"};
 const missing=creationChecks(d).filter(x=>x.required&&!x.ok).map(x=>x.key);
 if(missing.length)return {ok:false,missing,reason:"incomplete"};
 d.status="created";d.tested=false;d.enabled=false;d.createdAt=d.createdAt||Date.now();d.completedAt=Date.now();
 if(!save()){d.status="draft";delete d.completedAt;return {ok:false,reason:"storage_unavailable"};}
 return {ok:true,id:d.id};
}
function setAgentEnabled(o,id,enabled){
 const d=draft(o,id);
 if(!d||d.status==="draft")return false;
 const previous=d.status;
 d.status=enabled?"active":"stopped";d.enabled=Boolean(enabled);
 if(!save()){d.status=previous;d.enabled=previous==="active";return false;}
 return true;
}
function upsertEditorDraft(o,changes,id){
 const existing=id?draft(o,id):null;
 if(id&&!existing)return {error:"not_found"};
 const fresh=!existing;
 const key=fresh?"draft-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8):id;
 const agent=existing||{id:key,orgId:o.id,status:"draft",type:null,name:"",description:"",company:"",task:"",handoff:"",knowledge:[],connections:[],group:"",handoffTarget:"",tested:false,createdAt:Date.now()};
 const allowed=["name","description","company","task","handoff","type","group","handoffTarget","knowledge","connections","communicationStyle","instructions","quickRules","avatar"];
 const valid=Object.fromEntries(Object.entries(changes||{}).filter(([k,v])=>allowed.includes(k)&&(typeof v==="string"||Array.isArray(v))));
 if("name" in valid)valid.name=valid.name.slice(0,80);
 if("description" in valid)valid.description=valid.description.slice(0,500);
 if("type" in valid&&!professions.some(p=>p.id===valid.type&&p.available))delete valid.type;
 if("knowledge" in valid)valid.knowledge=valid.knowledge.filter(x=>typeof x==="string");
 if("connections" in valid)valid.connections=valid.connections.filter(x=>o.integrations.some(i=>i.id===x&&i.status==="connected"));
 Object.assign(agent,valid,{tested:false});
 if(fresh)drafts[key]=agent;
 const saved=save();
 if(!saved&&fresh)delete drafts[key];
 return {id:key,draft:saved?agent:null,saved,error:saved?null:"storage_unavailable"};
}
globalThis.AIMockCreator={page,panel,handleClick,handleInput,handleToggle,catalogRecords,draft,ready,refreshRail,refreshProfessionList,setProfessionSearch,setProfessionCategory,upsertEditorDraft,professions,creationChecks,finalizeAgent,setAgentEnabled};
})();