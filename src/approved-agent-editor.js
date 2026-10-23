(function(){
"use strict";
const C=globalThis.AIMockCreator;
const ui={expanded:false,category:"all",q:"",page:1,fail:false,blank:{name:"",description:"",group:"",type:null,task:"",company:"",handoff:"",handoffTarget:"",knowledge:[],connections:[],quickRules:[],communicationStyle:"friendly"}};
const X=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(loc,ru,en)=>loc==="en"?en:ru;
const id=()=>location.hash.slice(2).split("/")[1];
const get=(o,key)=>key==="new"?null:C.draft(o,key);
const model=(o,key)=>get(o,key)||ui.blank;
const roleName=(d,loc)=>C.professions.find(p=>p.id===d.type)?.[loc==="en"?"en":"ru"]||L(loc,"Профессия не выбрана","Profession not selected");
const groupNames=[["Продажи","Продажи","Sales"],["HR","HR","HR"],["Поддержка","Поддержка","Support"]];
const tabs=[["all","Все","All"],["sales","Продажи","Sales"],["hr","HR","HR"],["support","Поддержка","Support"],["marketing","Маркетинг","Marketing"],["operations","Операции","Operations"],["data","Аналитика","Analytics"],["finance","Финансы","Finance"]];
const featured=["sales","hr","support","sales-b2b","data-analyst","content-editor"];
const suggestions=[["clarify","Уточняй запрос","Ask clarifying questions"],["verify","Не придумывай факты","Never invent facts"],["handoff","Передавай сложное человеку","Hand off complex cases"],["knowledge","Отвечай по знаниям","Answer using knowledge"]];
const logos={telegram:"telegram.svg",max:"max.svg",bitrix:"bitrix24.svg",slack:"slack.svg"};
const input=(key,label,value,placeholder,rows)=>'<label class="ae-field"><strong>'+label+'</strong>'+(rows?'<textarea data-editor-input="'+key+'" rows="'+rows+'" placeholder="'+X(placeholder)+'">'+X(value)+'</textarea>':'<input data-editor-input="'+key+'" value="'+X(value)+'" maxlength="80" placeholder="'+X(placeholder)+'">')+'</label>';
const header=(n,title,desc,extra)=>'<div class="ae-section-header"><span class="ae-number">'+n+'</span><div><h2>'+title+'</h2><p>'+desc+'</p></div>'+(extra?'<small>'+extra+'</small>':'')+'</div>';
const block=(n,title,desc,body,extra)=>'<section class="ae-block" id="ae-block-'+n+'">'+header(n,title,desc,extra)+body+'</section>';
const styledDropdown=(key,value,loc,choices)=>'<details class="ae-dropdown" data-editor-dropdown="'+key+'"><summary><span>'+L(loc,(choices.find(v=>v[0]===value)||["","Не выбрано","Not selected"])[1],(choices.find(v=>v[0]===value)||["","Не выбрано","Not selected"])[2])+'</span><b>⌄</b></summary><div class="ae-dropdown-options">'+[["","Не выбрано","Not selected"],...choices].map(v=>'<button type="button" data-editor-action="select-value" data-field="'+key+'" data-value="'+X(v[0])+'" aria-pressed="'+(value===v[0])+'">'+L(loc,v[1],v[2])+'</button>').join("")+'</div></details>';
const groupSelect=(key,value,loc)=>styledDropdown(key,value,loc,groupNames);
function basic(d,loc,icon){
 return block(1,L(loc,"Базовая информация","Basic information"),L(loc,"Укажите основную информацию об агенте.","Enter the key details for your agent."),
 '<div class="ae-basic"><div class="ae-avatar">'+icon("agents",31)+'</div><div class="ae-basic-fields"><div class="ae-two">'+input("name",L(loc,"Название агента","Agent name"),d.name,L(loc,"Например, Менеджер заявок","E.g. Lead manager"))+
 '<div class="ae-field"><strong>'+L(loc,"Группа","Team")+'</strong>'+groupSelect("group",d.group||"",loc)+'</div></div>'+
 input("description",L(loc,"Описание","Description"),d.description,L(loc,"Кратко опишите основную задачу агента","Describe the agent's purpose"),2)+
 '</div></div>');
}
const roleButton=(p,d,loc,icon)=>'<button class="ae-role '+(d.type===p.id?"selected":"")+'" type="button" data-editor-action="role" data-value="'+X(p.id)+'" aria-pressed="'+(d.type===p.id)+'" '+(!p.available?"disabled":"")+'> <span class="ae-role-icon">'+icon(p.category==="hr"?"agents":p.category==="sales"?"inbox":"knowledge",18)+'</span><span class="ae-role-content"><strong>'+X(p[loc==="en"?"en":"ru"])+'</strong><small>'+X(p[loc==="en"?"detailEn":"detailRu"])+'</small></span><span class="ae-role-status">'+(d.type===p.id?icon("check",14):p.available?"":L(loc,"Скоро","Soon"))+'</span></button>';
function matching(){
 return C.professions.filter(p=>(ui.category==="all"||ui.category===p.category)&&(!ui.q||[p.ru,p.en,p.detailRu,p.detailEn].join(" ").toLowerCase().includes(ui.q.toLowerCase())));
}
function roleList(d,loc,icon){
 const all=matching(),expand=ui.expanded||ui.q||ui.category!=="all";
 const count=Math.max(1,Math.ceil(all.length/9));ui.page=Math.min(Math.max(1,ui.page),count);
 const current=expand?all.slice((ui.page-1)*9,ui.page*9):featured.map(k=>C.professions.find(p=>p.id===k)).filter(Boolean);
 return '<div class="ae-role-grid">'+(current.length?current.map(p=>roleButton(p,d,loc,icon)).join(""):'<p class="ae-empty">'+L(loc,"Ничего не найдено","No matching professions")+'</p>')+'</div>'+
 (expand?'<nav class="ae-pages" aria-label="'+L(loc,"Страницы профессий","Profession pages")+'"><span>'+L(loc,"Найдено: ","Found: ")+all.length+'</span><div><button data-editor-action="page" data-value="'+(ui.page-1)+'" '+(ui.page===1?"disabled":"")+'>‹</button>'+
 Array.from({length:count},(_,i)=>'<button data-editor-action="page" data-value="'+(i+1)+'" '+(ui.page===i+1?'aria-current="page"':'')+'>'+(i+1)+'</button>').join("")+
 '<button data-editor-action="page" data-value="'+(ui.page+1)+'" '+(ui.page===count?"disabled":"")+'>›</button></div></nav><button data-editor-action="collapse" class="ae-more">'+L(loc,"Свернуть каталог","Collapse catalog")+'</button>':
 '<button class="ae-more" data-editor-action="expand">'+L(loc,"Показать ещё 30 профессий","Show 30 more professions")+' '+icon("chevron",13)+'</button>');
}
function professions(d,loc,icon){
 return block(2,L(loc,"Выберите профессию","Choose a profession"),L(loc,"Готовые настройки для разных задач.","Ready-made starting points for different tasks."),
 '<div class="ae-role-controls"><div class="ae-filters">'+tabs.map(t=>'<button type="button" data-editor-action="category" data-value="'+t[0]+'" aria-pressed="'+(ui.category===t[0])+'">'+L(loc,t[1],t[2])+'</button>').join("")+'</div><label class="ae-search">'+icon("search",15)+'<input data-editor-search type="search" value="'+X(ui.q)+'" placeholder="'+L(loc,"Поиск профессии…","Search professions…")+'" aria-label="'+L(loc,"Поиск профессии","Search profession")+'"></label></div><div data-editor-roles>'+roleList(d,loc,icon)+'</div>',d.type?L(loc,"Выбрано: ","Selected: ")+X(roleName(d,loc)):"");
}
function instructions(d,loc,icon){
 const options=[["friendly","Дружелюбный и профессиональный","Friendly and professional"],["formal","Формальный и точный","Formal and precise"],["calm","Спокойный и заботливый","Calm and supportive"]];
 return block(3,L(loc,"Поведение и инструкции","Behavior and instructions"),L(loc,"Как агент должен общаться и выполнять задачи.","How your agent should communicate and work."),
 '<div class="ae-two ae-instructions"><label class="ae-field"><strong>'+L(loc,"Стиль общения","Communication style")+'</strong><select data-editor-input="communicationStyle">'+options.map(x=>'<option value="'+x[0]+'" '+((d.communicationStyle||"friendly")===x[0]?"selected":"")+'>'+L(loc,x[1],x[2])+'</option>').join("")+'</select><small>'+L(loc,"Понятный, уважительный, без лишней формальности.","Clear and respectful tone.")+'</small></label>'+
 input("task",L(loc,"Инструкции для агента","Agent instructions"),d.task,L(loc,"Какие вопросы задавать и что делать?","What should the agent ask and do?"),3)+'</div>'+
 '<div class="ae-quick"><strong>'+L(loc,"Быстрые правила","Quick rules")+'</strong><div>'+suggestions.map(x=>'<button data-editor-action="rule" data-value="'+x[0]+'" aria-pressed="'+((d.quickRules||[]).includes(x[0]))+'">'+L(loc,x[1],x[2])+'</button>').join("")+'</div></div>'+
 '<details class="ae-details"><summary>'+L(loc,"Нужна помощь? Откройте примеры заполнения","Need help? Open guided examples")+'</summary><div>'+input("company",L(loc,"Чем занимается компания?","What does your company do?"),d.company,L(loc,"Продукты, услуги, ваши клиенты…","Products, services and customers…"),2)+
 input("handoff",L(loc,"Когда подключать сотрудника?","When to involve a person?"),d.handoff,L(loc,"Жалоба, вопрос без ответа, просьба о сотруднике…","Complaints, unknown answers or requests for a person…"),2)+'</div></details>');
}
function tools(d,o,loc,icon){
 const docs=[{id:d.type==="hr"?"vacancies":"services",name:L(loc,d.type==="hr"?"Вакансии":"Услуги и цены",d.type==="hr"?"Vacancies":"Services and pricing")},{id:d.type==="hr"?"candidate-guide":"faqs",name:L(loc,d.type==="hr"?"Правила найма":"Частые вопросы",d.type==="hr"?"Hiring guidelines":"FAQ")}];
 const conn=o.integrations.filter(i=>i.status==="connected");
 const items=(rows,key)=>rows.map(i=>'<button type="button" class="ae-option '+((d[key]||[]).includes(i.id)?"selected":"")+'" data-editor-action="'+(key==="knowledge"?"knowledge":"connection")+'" data-value="'+X(i.id)+'" aria-pressed="'+((d[key]||[]).includes(i.id))+'"><span>'+((key==="connections"&&logos[i.brand])?'<img src="./src/assets/logos/'+logos[i.brand]+'" alt="" width="20" height="20">':"")+X(i.name)+'</span><small>'+((d[key]||[]).includes(i.id)?L(loc,"Выбрано","Selected"):"+")+'</small></button>').join("");
 return block(4,L(loc,"Знания и интеграции","Knowledge and integrations"),L(loc,"Добавьте материалы и сервисы, с которыми работает агент.","Attach reference materials and connected services."),
 '<div class="ae-tools-grid"><div class="ae-tool"><h3>'+icon("knowledge",17)+L(loc,"База знаний","Knowledge base")+'</h3><p>'+L(loc,"Материалы для ответов","Reference materials")+'</p>'+items(docs,"knowledge")+
 '<a href="#/knowledge/from-agent/'+encodeURIComponent(id())+'">'+L(loc,"Открыть базу знаний","Open knowledge base")+' ↗</a></div>'+
 '<div class="ae-tool"><h3>'+icon("integrations",17)+L(loc,"Интеграции","Integrations")+'</h3><p>'+L(loc,"Подключения организации","Organization connections")+'</p>'+(conn.length?items(conn,"connections"):'<p class="ae-empty">'+L(loc,"Пока нет подключений","No connections yet")+'</p>')+
 '<a href="#/integrations/from-agent/'+encodeURIComponent(id())+'">'+L(loc,"Открыть Integration Hub","Open Integration Hub")+' ↗</a></div></div>',L(loc,"Выбираются отдельно","Choose individually"));
}
function access(d,loc,icon){
 return block(5,L(loc,"Доступ и передача диалогов","Access and human handoff"),L(loc,"Кто управляет агентом и кому он передаёт сложные случаи.","Choose who manages the agent and receives complex cases."),
 '<div class="ae-two">'+["group","handoffTarget"].map((key,i)=>'<div class="ae-field"><strong>'+L(loc,i?"Кому передавать диалоги?":"Кто управляет агентом?",i?"Who receives escalated conversations?":"Who manages the agent?")+'</strong>'+groupSelect(key,d[key]||"",loc)+'</div>').join("")+'</div>'+
 '');
}
function readiness(d,o,loc,icon){
 const checks=C.ready({...d,company:d.company||d.description},o);
 const titles=[L(loc,"Название","Name"),L(loc,"Профессия","Profession"),L(loc,"Инструкции","Instructions"),L(loc,"Знания","Knowledge"),L(loc,"Интеграции","Integrations"),L(loc,"Доступ","Access"),L(loc,"Тест","Test")];
 return block(6,L(loc,"Проверка готовности","Readiness check"),L(loc,"Проверьте необходимые настройки перед запуском.","Check required settings before launch."),
 '<div class="ae-checks">'+checks.map((x,i)=>'<span class="'+(x.ok?"ok":"")+'">'+icon(x.ok?"check":"clock",14)+titles[i]+'</span>').join("")+'</div>');
}
function page(o,loc,icon,key){
 const d=model(o,key);
 return '<header class="ae-head"><div><h1>'+L(loc,"Создание агента","Create agent")+'</h1><p>'+L(loc,"Настройте агента под задачи вашей команды. Все изменения сохраняются автоматически.","Set up an agent for your team. Changes save automatically.")+'</p></div><div class="ae-head-actions"><a href="#/agents" aria-label="'+L(loc,"Закрыть","Close")+'">'+icon("close",17)+'</a></div></header>'+
 '<section class="ae-hero"><div class="ae-hero-text"><span class="ae-spark">'+icon("sparkles",22)+'</span><div><h2>'+L(loc,"Создайте AI-сотрудника для вашей команды","Build an AI teammate for your team")+'</h2><p>'+L(loc,"Выберите профессию, настройте поведение и подключите нужные инструменты.","Choose a profession, configure behavior and connect useful tools.")+'</p><a class="ae-hero-guide" href="#/agents/'+encodeURIComponent(key)+'/guide">'+L(loc,"Пошаговая инструкция по настройке","Step-by-step setup guide")+' →</a></div></div><div class="ae-hero-art" aria-hidden="true"><span>'+icon("agents",26)+'</span><i>'+icon("message",17)+'</i><i>'+icon("integrations",17)+'</i><i>'+icon("knowledge",17)+'</i></div></section>'+
 '<div class="ae-sections">'+basic(d,loc,icon)+professions(d,loc,icon)+instructions(d,loc,icon)+tools(d,o,loc,icon)+access(d,loc,icon)+readiness(d,o,loc,icon)+'</div>'+
 '<footer class="ae-footer"><span>'+icon("check",14)+' '+L(loc,"Автоматическое сохранение черновика","Draft autosaves")+'</span><div><a href="#/agents">'+L(loc,"Отмена","Cancel")+'</a><button data-editor-action="test" class="ae-test">'+L(loc,"Протестировать","Test agent")+'</button><button class="ae-publish" disabled title="'+L(loc,"Запуск недоступен","Launch unavailable")+'">'+L(loc,"Опубликовать агента","Publish agent")+'</button></div></footer>';
}
globalThis.AIMockApprovedEditor={ui,L,X,id,get,model,page,roleList,matching,logo:logos,roleName,toolsSection:tools};
})();
