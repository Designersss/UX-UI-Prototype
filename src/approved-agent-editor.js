(function(){
"use strict";
const C=globalThis.AIMockCreator;
const Presets=globalThis.AIMockProfessionPresets;
const preset=(d,loc)=>Presets.get(d?.type,loc);
const ui={expanded:false,category:"all",q:"",page:1,fail:false,blank:{name:"",description:"",group:"",type:null,task:"",company:"",handoff:"",handoffTarget:"",knowledge:[],connections:[],quickRules:[],communicationStyle:"friendly",tags:[]}};
const X=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(loc,ru,en)=>loc==="en"?en:ru;
const id=()=>location.hash.slice(2).split("/")[1];
const get=(o,key)=>key==="new"?null:C.draft(o,key);
const model=(o,key)=>get(o,key)||ui.blank;
const roleName=(d,loc)=>C.professions.find(p=>p.id===d.type)?.[loc==="en"?"en":"ru"]||L(loc,"Профессия не выбрана","Profession not selected");
const groupNames=[["Продажи","Продажи","Sales"],["HR","HR","HR"],["Поддержка","Поддержка","Support"]];
const tabs=[["all","Все","All"],["sales","Продажи","Sales"],["hr","HR","HR"],["support","Поддержка","Support"],["marketing","Маркетинг","Marketing"],["operations","Операции","Operations"],["data","Аналитика","Analytics"],["finance","Финансы","Finance"]];

const suggestions=[["clarify","Уточняй запрос","Ask clarifying questions"],["verify","Не придумывай факты","Never invent facts"],["handoff","Передавай сложное человеку","Hand off complex cases"],["knowledge","Отвечай по базе знаний","Answer using knowledge"],["summary","Подводи итог диалога","Summarize chats"],["privacy","Не раскрывай личные данные","Protect private data"],["confirm","Подтверждай важные действия","Confirm important actions"],["concise","Отвечай кратко","Keep answers brief"],["polite","Общайся вежливо","Stay polite"],["questions","Уточняй недостающие данные","Ask for missing details"],["uncertain","Сообщай, когда ответа нет","Admit uncertainty"],["followup","Проверяй результат обращения","Check the outcome"]];
const logos={telegram:"telegram.svg",max:"max.svg",bitrix:"bitrix24.svg",slack:"slack.svg"};
const input=(key,label,value,placeholder,rows)=>'<label class="ae-field"><strong>'+label+'</strong>'+(rows?'<textarea data-editor-input="'+key+'" rows="'+rows+'" placeholder="'+X(placeholder)+'">'+X(value)+'</textarea>':'<input data-editor-input="'+key+'" value="'+X(value)+'" maxlength="80" placeholder="'+X(placeholder)+'">')+'</label>';
const header=(n,title,desc,extra)=>'<div class="ae-section-header"><span class="ae-number">'+n+'</span><div><h2>'+title+'</h2><p>'+desc+'</p></div>'+(extra?'<small>'+extra+'</small>':'')+'</div>';
const block=(n,title,desc,body,extra)=>'<section class="ae-block" id="ae-block-'+n+'">'+header(n,title,desc,extra)+body+'</section>';
const styledDropdown=(key,value,loc,choices)=>'<details class="ae-dropdown" data-editor-dropdown="'+key+'"><summary><span>'+L(loc,(choices.find(v=>v[0]===value)||["","Не выбрано","Not selected"])[1],(choices.find(v=>v[0]===value)||["","Не выбрано","Not selected"])[2])+'</span><b>⌄</b></summary><div class="ae-dropdown-options">'+[["","Не выбрано","Not selected"],...choices].map(v=>'<button type="button" data-editor-action="select-value" data-field="'+key+'" data-value="'+X(v[0])+'" aria-pressed="'+(value===v[0])+'">'+L(loc,v[1],v[2])+'</button>').join("")+'</div></details>';
const groupSelect=(key,value,loc)=>styledDropdown(key,value,loc,groupNames);
const tagStoreKey="aimock-tags-by-org-v1";
function tagList(o){let m={};try{m=JSON.parse(localStorage.getItem(tagStoreKey)||"{}")||{}}catch(_){}return Array.isArray(m[o.id])?m[o.id]:["Продажи","HR","Клиенты","Приоритет","Москва"];}
function storeTags(o,list){let m={};try{m=JSON.parse(localStorage.getItem(tagStoreKey)||"{}")||{}}catch(_){}m[o.id]=list;try{localStorage.setItem(tagStoreKey,JSON.stringify(m));return true}catch(_){return false}}
const helpTip=(loc,ru,en)=>'<span class="ae-help-tip" tabindex="0" aria-label="'+X(L(loc,ru,en))+'">ⓘ<span role="tooltip">'+X(L(loc,ru,en))+'</span></span>';
function tagPicker(d,o,loc){
 const selected=d.tags||[];
 return '<div class="ae-field ae-tags-field"><div class="ae-label-with-help"><strong>'+L(loc,"Теги","Tags")+'</strong>'+helpTip(loc,"Теги помогают искать и фильтровать агентов, но не выдают доступ. Общий справочник находится в Настройках.","Tags help search and filtering, not access. Manage shared tags in Settings.")+'</div><details class="ae-tag-select"><summary>'+L(loc,"Выбрать теги","Choose tags")+' · '+selected.length+'</summary><div class="ae-tag-options"><input type="search" data-tag-search placeholder="'+L(loc,"Поиск тегов…","Search tags…")+'">'+tagList(o).map(t=>'<button type="button" data-editor-action="toggle-tag" data-value="'+X(t)+'" aria-pressed="'+selected.includes(t)+'">'+X(t)+' <span>'+(selected.includes(t)?"✓":"+")+'</span></button>').join("")+'</div></details><div class="ae-selected-tags">'+selected.map(t=>'<span>'+X(t)+' <button type="button" data-editor-action="toggle-tag" data-value="'+X(t)+'">×</button></span>').join("")+'</div><a class="ae-manage-tags" href="#/settings/tags">'+L(loc,"Управление тегами","Manage tags")+' →</a></div>';
}
function tagsPage(o,loc){
 return '<div class="ae-tag-manager"><header><a href="#/settings">← '+L(loc,"Настройки","Settings")+'</a><h1>'+L(loc,"Теги организации","Organization tags")+'</h1><p>'+L(loc,"Единый каталог меток для агентов. Доступ управляется отдельно через роли и группы.","Shared labels for agents. Access is controlled separately by roles and groups.")+'</p></header><div class="ae-tag-manager-form"><input data-tag-new maxlength="30" placeholder="'+L(loc,"Название нового тега","New tag name")+'"><button type="button" data-editor-action="create-tag">'+L(loc,"Добавить","Add")+'</button></div><p data-tag-feedback aria-live="polite"></p><div class="ae-tag-manager-items">'+tagList(o).map(t=>'<div><strong>'+X(t)+'</strong><button type="button" data-editor-action="delete-tag" data-value="'+X(t)+'" aria-label="'+L(loc,"Удалить тег ","Delete tag ")+X(t)+'">×</button></div>').join("")+'</div></div>';
}

function basic(d,loc,icon,o){
 return block(1,L(loc,"Базовая информация","Basic information"),L(loc,"Укажите основную информацию об агенте.","Enter the key details for your agent."),
 '<div class="ae-basic"><div class="ae-avatar">'+icon("agents",31)+'</div><div class="ae-basic-fields"><div class="ae-two">'+input("name",L(loc,"Название агента","Agent name"),d.name,L(loc,"Например, Менеджер заявок","E.g. Lead manager"))+
 '<div class="ae-field"><div class="ae-label-with-help"><strong>'+L(loc,"Группа доступа","Access group")+'</strong>'+helpTip(loc,"Группа задаёт область доступа сотрудников. Права настраиваются в Настройках, не через теги.","Access groups define employee scope; permissions are managed in Settings, not with tags.")+'</div>'+groupSelect("group",d.group||"",loc)+'</div></div>'+
 input("description",L(loc,"Описание","Description"),d.description,L(loc,"Кратко опишите основную задачу агента","Describe the agent's purpose"),2)+
 tagPicker(d,o,loc)+
 '</div></div>');
}
const roleButton=(p,d,loc,icon)=>'<button class="ae-role '+(d.type===p.id?"selected":"")+'" type="button" data-editor-action="role" data-value="'+X(p.id)+'" aria-pressed="'+(d.type===p.id)+'" '+(!p.available?"disabled":"")+'> <span class="ae-role-icon">'+icon(p.category==="hr"?"agents":p.category==="sales"?"inbox":"knowledge",18)+'</span><span class="ae-role-content"><strong>'+X(p[loc==="en"?"en":"ru"])+'</strong><small>'+X(p[loc==="en"?"detailEn":"detailRu"])+'</small></span><span class="ae-role-status">'+(d.type===p.id?icon("check",14):p.available?"":L(loc,"Скоро","Soon"))+'</span></button>';
function matching(){
 return C.professions.filter(p=>(ui.category==="all"||ui.category===p.category)&&(!ui.q||[p.ru,p.en,p.detailRu,p.detailEn].join(" ").toLowerCase().includes(ui.q.toLowerCase())));
}
function roleList(d,loc,icon){
 const all=matching(),count=Math.max(1,Math.ceil(all.length/9));
 ui.page=Math.min(Math.max(1,ui.page),count);
 const current=all.slice((ui.page-1)*9,ui.page*9);
 return '<div class="ae-role-grid">'+(current.length?current.map(p=>roleButton(p,d,loc,icon)).join(""):'<p class="ae-empty">'+L(loc,"Ничего не найдено","No matching professions")+'</p>')+'</div>'+
 '<nav class="ae-pages" aria-label="'+L(loc,"Страницы профессий","Profession pages")+'"><span>'+L(loc,"Показано ","Showing ")+(all.length?(ui.page-1)*9+1:0)+'–'+Math.min(ui.page*9,all.length)+' '+L(loc,"из ","of ")+all.length+'</span><div>'+
 '<button type="button" data-editor-action="page" data-value="'+(ui.page-1)+'" '+(ui.page===1?"disabled":"")+' aria-label="'+L(loc,"Предыдущая страница","Previous page")+'">‹</button>'+
 Array.from({length:count},(_,i)=>'<button type="button" data-editor-action="page" data-value="'+(i+1)+'" '+(ui.page===i+1?'aria-current="page"':'')+'>'+(i+1)+'</button>').join("")+
 '<button type="button" data-editor-action="page" data-value="'+(ui.page+1)+'" '+(ui.page===count?"disabled":"")+' aria-label="'+L(loc,"Следующая страница","Next page")+'">›</button></div></nav>';
}
function professions(d,loc,icon){
 return block(2,L(loc,"Выберите агента","Choose an agent"),L(loc,"Готовые настройки для разных задач.","Ready-made starting points for different tasks."),
 '<div class="ae-role-controls"><div class="ae-filters">'+tabs.map(t=>'<button type="button" data-editor-action="category" data-value="'+t[0]+'" aria-pressed="'+(ui.category===t[0])+'">'+L(loc,t[1],t[2])+'</button>').join("")+'</div><label class="ae-search">'+icon("search",15)+'<input data-editor-search type="search" value="'+X(ui.q)+'" placeholder="'+L(loc,"Поиск агента…","Search agents…")+'" aria-label="'+L(loc,"Поиск агента","Search profession")+'"></label></div><div data-editor-roles>'+roleList(d,loc,icon)+'</div>');
}
const agentIntegrationIds=(type)=>type==="hr"?["telegram","max","bitrix","bitrix24"]:type==="sales"?["telegram","max","bitrix","bitrix24","whatsapp","vk","viber"]:[];
const lockedSection=(n,title,loc)=>'<section class="ae-block ae-block-locked" id="ae-block-'+n+'" aria-disabled="true"><div class="ae-section-header"><span class="ae-number">'+n+'</span><div><h2>'+title+'</h2><p>'+L(loc,"Сначала выберите агента в разделе 2.","Choose an agent in section 2 first.")+'</p></div></div></section>';
function instructions(d,loc,icon){
 if(!d.type)return lockedSection(3,L(loc,"Поведение и инструкции","Behavior and instructions"),loc);
 const p=preset(d,loc);
 const toneOptions=[["friendly","Дружелюбный и профессиональный","Friendly and professional"],["formal","Формальный и точный","Formal and precise"],["calm","Спокойный и заботливый","Calm and supportive"]];
 const exampleRows=p?[
   ["company",L(loc,"О компании","About the business"),p.examples.company],
   ["task",L(loc,"Задачи и инструкции","Tasks & instructions"),p.examples.task],
   ["handoff",L(loc,"Передача человеку","Human handoff"),p.examples.handoff]
 ]:[];
 const roleRules=suggestions.filter(x=>(p?.rules||[]).includes(x[0]));
 return block(3,L(loc,"Поведение и инструкции","Behavior and instructions"),p?p.summary:L(loc,"Выберите агента, чтобы увидеть нужные поля.","Choose a role to see tailored fields."),
 '<div class="ae-instruction-form">'+
 '<div class="ae-instruction-leading">'+input("task",p?.taskLabel||L(loc,"Задачи и инструкции","Tasks and instructions"),d.task||"",p?.taskHint||L(loc,"Опишите действия агента","Describe agent actions"),4)+'</div>'+
 '<div class="ae-two ae-instructions-extra">'+input("company",p?.companyLabel||L(loc,"О компании","About the company"),d.company||"",p?.companyHint||L(loc,"Опишите ваши товары, услуги и клиентов","Describe your products, services and customers"),3)+input("handoff",p?.handoffLabel||L(loc,"Когда подключать сотрудника?","When to involve a person?"),d.handoff||"",p?.handoffHint||L(loc,"Опишите случаи, в которых нужен человек","Describe when a person should step in"),3)+'</div>'+
 '<div class="ae-instruction-preferences"><div class="ae-field"><strong>'+L(loc,"Стиль общения","Communication style")+'</strong>'+styledDropdown("communicationStyle",d.communicationStyle||p?.tone||"friendly",loc,toneOptions)+'</div><div class="ae-quick"><div class="ae-quick-head"><strong>'+L(loc,"Быстрые правила","Quick rules")+'</strong><p>'+L(loc,"Дополнительные правила для этого агента","Optional behavior for this agent")+'</p></div><div>'+roleRules.map(x=>'<button type="button" data-editor-action="rule" data-value="'+x[0]+'" aria-pressed="'+((d.quickRules||[]).includes(x[0]))+'">'+L(loc,x[1],x[2])+'</button>').join("")+'</div></div></div>'+
 '</div>'+
 '<div class="ae-configuration-links">'+(p?'<button type="button" class="ae-example-cta" data-editor-action="open-examples">'+icon("book-open",18)+'<span><strong>'+L(loc,"Примеры заполнения","Completed examples")+'</strong><small>'+L(loc,"3 примера · только просмотр","3 examples · view only")+'</small></span><b>→</b></button><a class="ae-advanced-link" href="#/agents/'+encodeURIComponent(id())+'/advanced">'+icon("settings",18)+'<span><strong>'+L(loc,"Расширенные настройки","Advanced settings")+'</strong><small>'+L(loc,"Готовые инструкции агента","Preconfigured instructions")+'</small></span><b>→</b></a>':"")+'</div>');
}
function advancedPage(o,loc,icon,key){
 const d=model(o,key),p=preset(d,loc),fields=[["identity","Роль и назначение","Role & mission"],["workflow","Порядок работы","Workflow"],["restrictions","Ограничения и достоверность","Safety & accuracy"],["escalation","Передача человеку","Human escalation"]];
 return '<div class="ae-advanced-page"><a class="ae-advanced-back" href="#/agents/'+encodeURIComponent(key)+'/edit">← '+L(loc,"Вернуться к настройке","Back to editor")+'</a><header><h1>'+L(loc,"Расширенные настройки","Advanced settings")+'</h1><p>'+L(loc,"Готовые инструкции для агента. При желании отредактируйте их — изменения сохраняются автоматически.","Role-specific instructions are ready. Edit only what you need; changes autosave.")+'</p></header>'+
 (p?'<div class="ae-advanced-role"><strong>'+X(p.headline)+'</strong><small>'+L(loc,"Предустановленные инструкции","Prepared instructions")+'</small></div><div class="ae-advanced-fields">'+fields.map(([field,ru,en])=>'<label class="ae-field"><strong>'+L(loc,ru,en)+'</strong><textarea rows="6" maxlength="5000" data-editor-advanced="'+field+'">'+X(Object.prototype.hasOwnProperty.call(d.advancedRoleOverrides?.[d.type]||{},field)?d.advancedRoleOverrides[d.type][field]:p.advanced[field])+'</textarea></label>').join("")+'</div><div class="ae-advanced-footer"><p>'+L(loc,"Можно восстановить исходные значения.","You can restore the recommended prompts.")+'</p><button type="button" data-editor-action="reset-advanced">'+L(loc,"Восстановить настройки агента","Restore role defaults")+'</button></div>':'<p>'+L(loc,"Сначала выберите агента.","Choose an agent first.")+'</p>')+'</div>';
}
function examplesModal(d,loc){
 const p=preset(d,loc);if(!p)return "";
 const examples=[["company",L(loc,"О компании","Company information")],["task",L(loc,"Инструкции агента","Agent instructions")],["handoff",L(loc,"Передача человеку","Human handoff")]];
 return '<div class="ae-modal-backdrop" data-editor-modal-backdrop><section class="ae-modal" role="dialog" aria-modal="true" tabindex="-1" aria-labelledby="ae-modal-title"><header><div><small>'+X(p.headline)+'</small><h2 id="ae-modal-title">'+L(loc,"Примеры заполнения","Completed examples")+'</h2><p>'+L(loc,"Три примера для этой агента. Только просмотр.","Three examples for this profession. View only.")+'</p></div><button type="button" data-editor-action="close-examples" aria-label="'+L(loc,"Закрыть","Close")+'">×</button></header><div class="ae-modal-examples">'+examples.map(([field,label],i)=>'<article><span>0'+(i+1)+'</span><h3>'+label+'</h3><p>'+X(p.examples[field])+'</p></article>').join("")+'</div><footer><button type="button" data-editor-action="close-examples">'+L(loc,"Закрыть","Close")+'</button></footer></section></div>';
}
function tools(d,o,loc,icon){
 if(!d.type)return lockedSection(4,L(loc,"Знания и интеграции","Knowledge and integrations"),loc);
 const docs=[{id:d.type==="hr"?"vacancies":"services",name:L(loc,d.type==="hr"?"Вакансии":"Услуги и цены",d.type==="hr"?"Vacancies":"Services and pricing")},{id:d.type==="hr"?"candidate-guide":"faqs",name:L(loc,d.type==="hr"?"Правила найма":"Частые вопросы",d.type==="hr"?"Hiring guidelines":"FAQ")}];
 const allowed=agentIntegrationIds(d.type);
 const conn=o.integrations.filter(i=>i.status==="connected"&&allowed.includes(i.id)||i.status==="connected"&&allowed.includes(i.brand));
 const items=(rows,key)=>rows.map(i=>'<button type="button" class="ae-option '+((d[key]||[]).includes(i.id)?"selected":"")+'" data-editor-action="'+(key==="knowledge"?"knowledge":"connection")+'" data-value="'+X(i.id)+'" aria-pressed="'+((d[key]||[]).includes(i.id))+'"><span>'+((key==="connections"&&logos[i.brand])?'<img src="./src/assets/logos/'+logos[i.brand]+'" alt="" width="20" height="20">':"")+X(i.name)+'</span><small>'+((d[key]||[]).includes(i.id)?L(loc,"Выбрано","Selected"):"+")+'</small></button>').join("");
 return block(4,L(loc,"Знания и интеграции","Knowledge and integrations"),L(loc,"Добавьте материалы и сервисы, с которыми работает агент.","Attach reference materials and connected services."),
 '<div class="ae-tools-grid"><div class="ae-tool"><h3>'+icon("knowledge",17)+L(loc,"База знаний","Knowledge base")+'</h3><p>'+L(loc,"Материалы для ответов","Reference materials")+'</p>'+items(docs,"knowledge")+
 '<a href="#/agents/'+encodeURIComponent(id())+'/pick/knowledge">'+L(loc,"Выбрать материалы из каталога","Choose knowledge from catalog")+' →</a></div>'+
 '<div class="ae-tool"><h3>'+icon("integrations",17)+L(loc,"Интеграции","Integrations")+'</h3><p>'+L(loc,"Подключения организации","Organization connections")+'</p>'+(conn.length?items(conn.slice(0,3),"connections"):'<p class="ae-empty">'+L(loc,"Пока нет подключений","No connections yet")+'</p>')+
 '<a href="#/agents/'+encodeURIComponent(id())+'/pick/integrations">'+L(loc,"Выбрать подключения из каталога","Choose connected services")+' →</a></div></div>',L(loc,"Выбираются отдельно","Choose individually"));
}
function access(d,loc,icon){
 if(!d.type)return lockedSection(5,L(loc,"Доступ и управление","Access and management"),loc);
 return block(5,L(loc,"Доступ и передача диалогов","Access and human handoff"),L(loc,"Кто управляет агентом и кому он передаёт сложные случаи.","Choose who manages the agent and receives complex cases."),
 '<div class="ae-two">'+["group","handoffTarget"].map((key,i)=>'<div class="ae-field"><strong>'+L(loc,i?"Кому передавать диалоги?":"Кто управляет агентом?",i?"Who receives escalated conversations?":"Who manages the agent?")+'</strong>'+groupSelect(key,d[key]||"",loc)+'</div>').join("")+'</div>'+
 '');
}
function page(o,loc,icon,key){
 const d=model(o,key);
 if(location.hash.split("/")[3]==="advanced")return d.type?advancedPage(o,loc,icon,key):'<div class="ae-advanced-page"><a href="#/agents/'+encodeURIComponent(key)+'/edit">← '+L(loc,"К настройке","Back to editor")+'</a><h1>'+L(loc,"Сначала выберите агента","Choose an agent first")+'</h1></div>';
 const editing=get(o,key)&&get(o,key).status!=="draft";
 return '<header class="ae-head"><div><h1>'+(editing?L(loc,"Редактирование агента","Edit agent"):L(loc,"Создание агента","Create agent"))+'</h1><p>'+L(loc,"Настройте агента под задачи вашей команды. Все изменения сохраняются автоматически.","Set up an agent for your team. Changes save automatically.")+'</p></div><div class="ae-head-actions"><a href="#/agents" aria-label="'+L(loc,"Закрыть","Close")+'">'+icon("close",17)+'</a></div></header>'+
 '<section class="ae-hero"><div class="ae-hero-text"><span class="ae-spark">'+icon("sparkles",22)+'</span><div><h2>'+L(loc,"Создайте AI-сотрудника для вашей команды","Build an AI teammate for your team")+'</h2><p>'+L(loc,"Выберите агента, настройте поведение и подключите нужные инструменты.","Choose an agent, configure behavior and connect useful tools.")+'</p><a class="ae-hero-guide" href="#/help/from-agent/'+encodeURIComponent(key)+'">'+L(loc,"Пошаговая инструкция по настройке","Step-by-step setup guide")+' →</a></div></div><div class="ae-hero-art" aria-hidden="true"><span>'+icon("agents",26)+'</span><i>'+icon("message",17)+'</i><i>'+icon("integrations",17)+'</i><i>'+icon("knowledge",17)+'</i></div></section>'+
 '<div class="ae-sections">'+basic(d,loc,icon,o)+professions(d,loc,icon)+instructions(d,loc,icon)+tools(d,o,loc,icon)+access(d,loc,icon)+'</div>'+
 '<div class="ae-form-error" data-editor-error role="alert" hidden></div><footer class="ae-footer"><span>'+icon("check",14)+' '+L(loc,"Автоматическое сохранение черновика","Draft autosaves")+'</span><div><a href="#/agents">'+L(loc,"Отмена","Cancel")+'</a><button data-editor-action="'+(editing?"done":"create")+'" class="ae-publish">'+(editing?L(loc,"Готово","Done"):L(loc,"Создать агента","Create agent"))+'</button></div></footer>';
}
globalThis.AIMockApprovedEditor={ui,L,X,id,get,model,page,advancedPage,examplesModal,roleList,matching,logo:logos,roleName,tagList,storeTags,tagsPage,tagPicker,basicSection:basic,toolsSection:tools,instructionsSection:instructions,accessSection:access,preset,agentIntegrationIds};
})();
