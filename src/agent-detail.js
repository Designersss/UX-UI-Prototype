(function(){
"use strict";
const C=globalThis.AIMockCreator;
const Leads=globalThis.AIMockAgentLeads;
const v={confirm:null,edit:null,message:"",reply:"",coverMessage:"",editMessage:""};
const settingsState={sectionById:{},examples:null,saveError:false};
const H=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(l,a,b)=>l==="en"?b:a;
const coverKey="aimock-agent-covers-v1";
let covers={};
try{covers=JSON.parse(localStorage.getItem(coverKey)||"{}")||{}}catch(_){}
const coverId=(o,id)=>o.id+"/"+id;
const coverFor=(o,id)=>covers[coverId(o,id)]||null;
function saveCover(o,id,cover){
 const key=coverId(o,id),before=covers[key];
 if(cover)covers[key]=cover;else delete covers[key];
 try{localStorage.setItem(coverKey,JSON.stringify(covers));v.coverMessage="";return true}
 catch(_){if(before)covers[key]=before;else delete covers[key];v.coverMessage="save";return false}
}
async function coverFile(file,o,id){
 if(!file||!editableAgent(o,id))return false;
 if(!["image/jpeg","image/png","image/webp","image/avif"].includes(file.type)||file.size>12*1024*1024){v.coverMessage="type";v.editMessage="image_type";return false}
 const url=URL.createObjectURL(file);
 try{
  const img=new Image();
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url});
  const scale=Math.min(1,1600/img.naturalWidth,1100/img.naturalHeight);
  const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
  const ctx=canvas.getContext("2d");if(!ctx)throw Error("canvas");
  ctx.drawImage(img,0,0,canvas.width,canvas.height);
  let encoded=canvas.toDataURL("image/jpeg",.82);
  if(encoded.length>750000)encoded=canvas.toDataURL("image/jpeg",.64);
  if(encoded.length>1200000){v.coverMessage="size";v.editMessage="image_size";return false}
  const saved=saveCover(o,id,{...coverFor(o,id),image:encoded,position:coverFor(o,id)?.position||"center"});
  v.editMessage=saved?"":"save";return saved;
 }catch(_){v.coverMessage="type";v.editMessage="image_type";return false}
 finally{URL.revokeObjectURL(url)}
}

const editableAgent=(o,id)=>{const d=C.draft(o,id);return !!d&&!["active","financial_paused","paused","archived"].includes(d.status)};
async function avatarFile(file,o,id){
 if(!file)return false;
 if(!editableAgent(o,id))return false;
 if(!["image/jpeg","image/png","image/webp","image/avif"].includes(file.type)||file.size>12*1024*1024){v.editMessage="image_type";return false}
 const url=URL.createObjectURL(file);
 try{
  const img=new Image();
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url});
  const scale=Math.min(1,500/img.naturalWidth,500/img.naturalHeight);
  const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
  const ctx=canvas.getContext("2d");if(!ctx)throw Error("canvas");
  ctx.drawImage(img,0,0,canvas.width,canvas.height);
  const image=canvas.toDataURL("image/jpeg",.8);
  if(image.length>600000){v.editMessage="image_size";return false}
  if(!saveCover(o,id,{...coverFor(o,id),avatar:image})){v.editMessage="save";return false}
  v.editMessage="";return true;
 }catch(_){v.editMessage="image_type";return false}
 finally{URL.revokeObjectURL(url)}
}
function updateMeta(input,o,id,loc){
 if(!editableAgent(o,id))return false;
 const field=input.dataset.detailInput;
 if(!["name","description","group"].includes(field))return false;
 const value=input.value;
 if(field==="name"&&!value.trim()){v.editMessage="name";document.querySelector("[data-detail-save]")?.replaceChildren(document.createTextNode(loc==="en"?"Name is required":"Введите название агента"));return false}
 const result=C.upsertEditorDraft(o,{[field]:value},id);
 v.editMessage=result.saved?"":"save";
 const status=document.querySelector("[data-detail-save]");
 if(status)status.textContent=result.saved?(loc==="en"?"✓ Saved":"✓ Сохранено"):(loc==="en"?"Save failed":"Ошибка сохранения");
 if(result.saved){
  if(field==="name")document.querySelector(".ad-hero-title h1")?.replaceChildren(document.createTextNode(value));
  if(field==="description")document.querySelector(".ad-hero-copy>p")?.replaceChildren(document.createTextNode(value));
 }
 return result.saved;
}


const settingsMenus=[
 ["instructions","Инструкции","Instructions","knowledge"],
 ["behavior","Поведение","Behavior","settings"],
 ["handoff","Передача человеку","Human handoff","contacts"],
 ["access","Доступы и теги","Access & tags","integrations"],
 ["advanced","Расширенные настройки","Advanced settings","settings"]
];
const settingRules=[
 ["clarify","Уточняй запрос","Clarify requests"],
 ["verify","Не придумывай факты","Do not invent facts"],
 ["handoff","Передавай сложное человеку","Escalate complex requests"],
 ["knowledge","Отвечай по базе знаний","Use verified knowledge"],
 ["privacy","Не раскрывай личные данные","Protect personal information"],
 ["confirm","Подтверждай важные действия","Confirm important actions"],
 ["summary","Подводи итог диалога","Summarize conversations"],
 ["uncertain","Сообщай, когда нет ответа","Admit uncertainty"]
];
const toneChoices=[
 ["friendly","Дружелюбный и профессиональный","Friendly and professional"],
 ["formal","Формальный и точный","Formal and precise"],
 ["calm","Спокойный и заботливый","Calm and supportive"]
];
const settingField=(l,key,ru,en,value,placeholder,rows,editable,limit=2000)=>'<label class="ad-setting-field"><span class="ad-setting-label">'+L(l,ru,en)+'</span><textarea data-detail-setting="'+key+'" rows="'+rows+'" maxlength="'+limit+'" placeholder="'+H(L(l,placeholder[0],placeholder[1]))+'" '+(editable?"":"disabled")+'>'+H(value||"")+'</textarea></label>';
const toneField=(l,d,editable)=>'<label class="ad-setting-field"><span class="ad-setting-label">'+L(l,"Стиль общения","Communication style")+'</span><select data-detail-setting="communicationStyle" '+(editable?"":"disabled")+'>'+toneChoices.map(([value,ru,en])=>'<option value="'+value+'" '+((d.communicationStyle||"friendly")===value?"selected":"")+'>'+L(l,ru,en)+'</option>').join("")+'</select><small>'+L(l,"Выберите тон. Подробные правила можно настроить в расширенных настройках.","Choose the tone; fine-tune instructions in Advanced settings.")+'</small></label>';
function rulesField(l,d,p,editable){
 const allowed=p?.rules?.length?[...new Set([...p.rules,"clarify","handoff","privacy"])]:settingRules.map(x=>x[0]);
 return '<div class="ad-setting-rules"><div class="ad-setting-rules-top"><div><strong>'+L(l,"Быстрые правила","Quick rules")+'</strong><p>'+L(l,"Выберите правила, которые агент будет соблюдать при работе.","Select the rules that guide this agent.")+'</p></div></div><div class="ad-setting-chips">'+settingRules.filter(x=>allowed.includes(x[0])).map(([key,ru,en])=>'<button type="button" data-detail-setting-action="toggle-rule" data-value="'+key+'" aria-pressed="'+(d.quickRules||[]).includes(key)+'" '+(editable?"":"disabled")+'>'+L(l,ru,en)+' '+((d.quickRules||[]).includes(key)?"✓":"+ ")+'</button>').join("")+'</div></div>';
}
function settingsWorkspace(o,l,icon,id,d,editable){
 const E=globalThis.AIMockApprovedEditor,p=globalThis.AIMockProfessionPresets?.get(d.type,l),key=settingsState.sectionById[id]||"instructions";
 const current=settingsMenus.some(a=>a[0]===key)?key:"instructions";
 const name=settingsMenus.find(a=>a[0]===current),readOnly=!editable;
 const status='<div class="ad-settings-save" data-detail-settings-save aria-live="polite">'+icon(editable?"check":"lock",14)+'<span>'+L(l,editable?"Изменения сохраняются автоматически":"Только просмотр · остановите агента для изменений",editable?"Changes save automatically":"Read-only · stop agent to edit")+'</span></div>';
 const sectionTitle='<header class="ad-settings-content-head"><div><h2>'+L(l,name[1],name[2])+'</h2><p>'+L(l,current==="instructions"?"Определите основную задачу агента, дайте контекст и укажите правила работы.":current==="behavior"?"Настройте стиль ответов и правила поведения агента.":current==="handoff"?"Укажите, когда агент должен подключать ответственного сотрудника.":current==="access"?"Проверьте принадлежность к группе доступа и метки для поиска.":"Подробные системные инструкции, адаптированные под выбранного агента.",current==="instructions"?"Define the agent task, company context and working rules.":current==="behavior"?"Configure responses and behavior rules.":current==="handoff"?"Define when a human should intervene.":current==="access"?"Review access group and search labels.":"Fine-tune role-specific instructions.")+'</p></div>'+status+'</header>';
 let content="";
 if(current==="instructions"){
  content='<div class="ad-setting-two">'+
   settingField(l,"task","Основная задача агента","Agent's main task",d.task,["Что агент должен делать и что уточнять у клиента?","What should the agent do and clarify?"],5,editable)+toneField(l,d,editable)+
   settingField(l,"company","Контекст компании","Company context",d.company,["Чем занимается компания, какие услуги предлагает и для кого?","What does the company offer, and to whom?"],4,editable)+
   settingField(l,"handoff","Когда передавать сотруднику","When to involve a person",d.handoff,["Например, жалобы, нестандартные запросы или просьбы связаться с человеком.","E.g. complaints, unusual requests or requests for a person."],4,editable)+'</div>'+
   rulesField(l,d,p,editable)+
   '<div class="ad-settings-links"><button type="button" data-detail-setting-action="examples">'+icon("knowledge",20)+'<span><strong>'+L(l,"Примеры заполнения","Completed examples")+'</strong><small>'+L(l,"Посмотрите готовые формулировки для этого агента","View example instructions for this type")+'</small></span>'+icon("arrow",17)+'</button><button type="button" data-detail-setting-action="section" data-value="advanced">'+icon("settings",20)+'<span><strong>'+L(l,"Расширенные настройки","Advanced settings")+'</strong><small>'+L(l,"Дополнительные правила и системные инструкции","Additional instructions and restrictions")+'</small></span>'+icon("arrow",17)+'</button></div>';
 }else if(current==="behavior"){
  content='<div class="ad-setting-well"><div class="ad-setting-section-mini"><h3>'+L(l,"Стиль ответов","Response style")+'</h3><p>'+L(l,"Единый тон общения для всех подключённых каналов агента.","Consistent tone across the agent's channels.")+'</p></div>'+toneField(l,d,editable)+'</div>'+rulesField(l,d,p,editable)+'<p class="ad-setting-footnote">'+L(l,"Эти правила дополняют расширенные инструкции, но не заменяют ограничения безопасности.","These rules supplement the advanced instructions and safety limits.")+'</p>';
 }else if(current==="handoff"){
  content='<div class="ad-setting-well"><div class="ad-setting-section-mini"><h3>'+L(l,"Условия передачи","Escalation conditions")+'</h3><p>'+L(l,"Опишите случаи, когда агент должен прекратить самостоятельную обработку и передать вопрос человеку.","Describe when the agent should hand over to a human.")+'</p></div>'+settingField(l,"handoff","Когда подключать сотрудника","When to involve a person",d.handoff,["Например: жалоба, сложная ситуация, запрос звонка.","For example: complaint, complex case, request for a call."],7,editable)+'</div><div class="ad-setting-hint">'+icon("info",17)+'<span>'+L(l,"Передача отдельного диалога сотруднику не останавливает работу всего агента. Управление обращениями доступно в центре сообщений.","Human takeover of one conversation does not stop the whole agent. Handle conversations in the Inbox.")+'</span></div>';
 }else if(current==="access"){
  const choices=[...new Set(["Продажи","HR","Поддержка",...(o.agents||[]).map(agent=>agent.group),d.group].filter(Boolean))];
  const selected=d.tags||[],available=E.tagList(o);
  const disabled=editable?"":"disabled";
  content='<div class="ad-access-grid">'+
   '<section class="ad-setting-well ad-access-editor"><div class="ad-setting-section-mini"><h3>'+L(l,"Группа доступа","Access group")+' <span class="ad-meta-tip" tabindex="0" aria-label="'+H(L(l,"Группы определяют доступ сотрудников к агенту. Теги не дают прав.","Groups scope employee access to agents; tags do not grant permissions."))+'">ⓘ<span role="tooltip">'+L(l,"Группы определяют доступ сотрудников к агенту. Теги не дают прав.","Groups scope employee access to agents; tags do not grant permissions.")+'</span></span></h3><p>'+L(l,"Выберите группу, через которую сотрудникам предоставляются права на агента.","Choose the group used to control employee access to this agent.")+'</p></div>'+
   '<label class="ad-setting-field ad-access-group-field"><span class="ad-setting-label">'+L(l,"Назначенная группа","Assigned group")+'</span><select data-detail-setting="group" '+disabled+'><option value="">'+L(l,"Не выбрана","Not selected")+'</option>'+choices.map(g=>'<option value="'+H(g)+'" '+(d.group===g?"selected":"")+'>'+H(g)+'</option>').join("")+'</select></label>'+
   '<p class="ad-access-note">'+L(l,"Состав групп и права сотрудников управляются отдельно. Смена группы может изменить доступ к агенту.","Group membership and employee permissions are managed separately. Changing the group can affect access to this agent.")+'</p></section>'+
   '<section class="ad-setting-well ad-access-editor"><div class="ad-setting-section-mini"><h3>'+L(l,"Теги","Tags")+' <span class="ad-meta-tip" tabindex="0" aria-label="'+H(L(l,"Теги нужны только для фильтрации и поиска — они не предоставляют доступ.","Tags are for search and filtering only; they do not grant access."))+'">ⓘ<span role="tooltip">'+L(l,"Теги нужны только для фильтрации и поиска — они не предоставляют доступ.","Tags are for search and filtering only; they do not grant access.")+'</span></span></h3><p>'+L(l,"Выбирайте теги из общего справочника организации.","Choose tags from the organization-wide catalog.")+'</p></div>'+
   '<div class="ad-access-tags">'+(selected.length?selected.map(t=>'<span>'+H(t)+(editable?'<button type="button" data-detail-setting-action="toggle-access-tag" data-value="'+H(t)+'" aria-label="'+L(l,"Удалить тег ","Remove tag ")+H(t)+'">×</button>':"")+'</span>').join(""):'<small>'+L(l,"Теги пока не назначены","No tags assigned")+'</small>')+'</div>'+
   '<details class="ad-access-tag-picker" '+(editable?"":"aria-disabled=\"true\"")+'><summary>'+L(l,"Выбрать теги","Choose tags")+' · '+selected.length+'</summary><div><input data-detail-access-tag-search type="search" placeholder="'+L(l,"Поиск тегов…","Search tags…")+'" '+disabled+' aria-label="'+L(l,"Поиск тегов","Search tags")+'">'+available.map(t=>'<button type="button" data-detail-setting-action="toggle-access-tag" data-value="'+H(t)+'" aria-pressed="'+selected.includes(t)+'" '+disabled+'><span>'+H(t)+'</span><span>'+(selected.includes(t)?"✓":"+")+'</span></button>').join("")+'</div></details>'+
   '<a class="ad-settings-tag-manage" href="#/settings/tags">'+L(l,"Управление справочником тегов","Manage organization tags")+' →</a></section></div>'+
   '<div class="ad-setting-hint">'+icon("info",17)+'<span>'+L(l,"Группа доступа влияет на разрешения сотрудников; теги используются только для организации и поиска агентов.","Access groups affect employee permissions; tags only organize agents and help with search.")+'</span></div>';
 }else if(current==="advanced"){
  const fields=[["identity","Роль и назначение","Role & mission"],["workflow","Порядок работы","Workflow"],["restrictions","Ограничения и достоверность","Safety and accuracy"],["escalation","Передача человеку","Human escalation"]];
  content=p?'<div class="ad-setting-preset">'+icon("info",17)+'<span>'+L(l,"Предустановленные инструкции для типа агента: ","Recommended prompts for agent type: ")+H(p.headline)+'</span></div><div class="ad-setting-advanced">'+fields.map(([key,ru,en])=>settingField(l,"advanced:"+key,ru,en,Object.hasOwn(d.advancedRoleOverrides?.[d.type]||{},key)?d.advancedRoleOverrides[d.type][key]:p.advanced[key],["Настройте системную инструкцию","Customize instruction"],5,editable,5000)).join("")+'</div><div class="ad-settings-advanced-footer"><span>'+L(l,"Можно восстановить исходные промпты агента.","You can restore recommended defaults.")+'</span><button type="button" data-detail-setting-action="reset-advanced" '+(editable?"":"disabled")+'>'+L(l,"Восстановить настройки агента","Restore role defaults")+'</button></div>':'<div class="ad-setting-hint">'+L(l,"Для этого типа агента пока нет готовых инструкций.","No role-specific prompts are available yet.")+'</div>';
 }
 const modal=settingsState.examples===id&&p?'<div class="ad-settings-examples-backdrop" data-detail-settings-backdrop><section class="ad-settings-examples" role="dialog" aria-modal="true" aria-labelledby="ad-example-title"><header><div><h2 id="ad-example-title">'+L(l,"Примеры заполнения","Completed examples")+'</h2><p>'+L(l,"Три готовых примера. Только просмотр — ничего не будет вставлено автоматически.","Three read-only examples. Nothing is inserted automatically.")+'</p></div><button type="button" data-detail-setting-action="close-examples" aria-label="'+L(l,"Закрыть","Close")+'">×</button></header>'+[["task","Основная задача","Main task"],["company","О компании","Company context"],["handoff","Передача человеку","Human handoff"]].map(([key,ru,en])=>'<article><h3>'+L(l,ru,en)+'</h3><p>'+H(p.examples[key])+'</p></article>').join("")+'<footer><button type="button" data-detail-setting-action="close-examples">'+L(l,"Готово","Done")+'</button></footer></section></div>':"";
 return '<div class="ad-settings-workspace"><nav class="ad-settings-nav" aria-label="'+L(l,"Категории настроек агента","Agent settings categories")+'">'+settingsMenus.map(([slug,ru,en,ic])=>'<button type="button" data-detail-setting-action="section" data-value="'+slug+'" aria-current="'+(current===slug?"page":"false")+'">'+icon(ic,17)+'<span>'+L(l,ru,en)+'</span></button>').join("")+'</nav><section class="ad-settings-panel">'+sectionTitle+'<div class="ad-settings-panel-body">'+(readOnly?'<div class="ad-settings-locked">'+icon("lock",15)+L(l,"Для изменения конфигурации необходимо остановить агента.","Stop the agent to change its configuration.")+'</div>':"")+content+'</div></section></div>'+modal;
}

function editModal(o,l,icon,id,d,editable){
 const cover=coverFor(o,id)||{};
 const status=editable?L(l,"Изменения сохраняются автоматически","Changes save automatically"):L(l,"Только просмотр · остановите агента для изменений","Read-only · stop the agent to edit");
 const disabled=editable?"":" disabled";
 const error=v.editMessage?'<p class="ad-edit-error" role="alert">'+L(l,v.editMessage==="save"?"Не удалось сохранить изменения.":v.editMessage==="name"?"Введите название агента.":v.editMessage==="image_size"?"Изображение слишком большое.":"Используйте JPG, PNG, WebP или AVIF до 12 МБ.",v.editMessage==="save"?"Unable to save changes.":v.editMessage==="name"?"Agent name is required.":v.editMessage==="image_size"?"Image is too large.":"Choose JPG, PNG, WebP or AVIF up to 12 MB.")+'</p>':"";
 return '<div class="ad-edit-backdrop" data-detail-overlay><section class="ad-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="ad-edit-title" tabindex="-1">'+
 '<header class="ad-edit-head"><div><small>'+L(l,"КАРТОЧКА АГЕНТА","AGENT PROFILE")+'</small><h2 id="ad-edit-title">'+L(l,"Редактировать агента","Edit agent")+'</h2><p data-detail-save>'+status+'</p></div><button type="button" data-detail-action="close-edit" class="ad-edit-close" aria-label="'+L(l,"Закрыть","Close")+'">×</button></header>'+
 (!editable?'<div class="ad-edit-locked">'+icon("lock",16)+L(l,"Активный агент доступен только для просмотра. Для изменений сначала остановите его.","Active agent settings are read-only. Stop the agent before editing.")+'</div>':"")+
 '<div class="ad-edit-body"><div class="ad-edit-media">'+
 '<div class="ad-edit-cover-tile">'+(cover.image?'<img src="'+H(cover.image)+'" alt="">':'<div class="ad-edit-default-cover"></div>')+'<div class="ad-edit-media-shade"></div><div><strong>'+L(l,"Обложка","Cover photo")+'</strong><button type="button" data-detail-action="cover-upload"'+disabled+'>'+icon("image",15)+L(l,"Загрузить","Upload")+'</button></div></div>'+
 '<div class="ad-edit-avatar-tile"><span class="ad-edit-avatar-preview">'+(cover.avatar?'<img src="'+H(cover.avatar)+'" alt="">':icon("agents",29))+'</span><strong>'+L(l,"Аватар","Avatar")+'</strong><button type="button" data-detail-action="avatar-upload"'+disabled+'>'+L(l,"Изменить","Change")+'</button></div></div>'+
 '<div class="ad-edit-media-options"><label>'+L(l,"Положение обложки","Cover position")+'<select data-detail-select="cover-position"'+disabled+'>'+[["top","Сверху","Top"],["center","По центру","Center"],["bottom","Снизу","Bottom"]].map(([value,ru,en])=>'<option value="'+value+'" '+((cover.position||"center")===value?"selected":"")+'>'+L(l,ru,en)+'</option>').join("")+'</select></label><button type="button" data-detail-action="cover-reset" '+(!editable||!cover.image?"disabled":"")+'>'+L(l,"Удалить обложку","Remove cover")+'</button><button type="button" data-detail-action="avatar-reset" '+(!editable||!cover.avatar?"disabled":"")+'>'+L(l,"Удалить аватар","Remove avatar")+'</button></div>'+
 '<div class="ad-edit-fields"><label class="ad-edit-field"><strong>'+L(l,"Название агента","Agent name")+'</strong><input data-detail-input="name" maxlength="80" value="'+H(d.name)+'"'+disabled+'></label>'+
 '<label class="ad-edit-field ad-edit-description"><strong>'+L(l,"Описание","Description")+'</strong><textarea data-detail-input="description" maxlength="500" rows="3"'+disabled+'>'+H(d.description||"")+'</textarea></label>'+
 '</div>'+error+'</div>'+
 '<footer class="ad-edit-footer"><span>'+icon("info",15)+' '+L(l,"Данные сохраняются автоматически","Changes save automatically")+'</span><button type="button" data-detail-action="close-edit">'+L(l,"Готово","Done")+'</button></footer>'+
 '<input data-detail-cover-file type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden><input data-detail-avatar-file type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden></section></div>';
}

function page(o,l,icon,id,sub){
 const live=C.draft(o,id),sample=o.agents.find(a=>a.id===id),d=live||(sample?{...sample,status:sample.state,description:sample.description||"",connections:[],knowledge:[],quickRules:[],handoff:"",task:""}:null);
 if(!d||d.status==="draft")return '<div class="ad-missing"><h1>'+L(l,"Агент не найден","Agent not found")+'</h1><a href="#/agents">'+L(l,"Вернуться в каталог","Back to catalog")+'</a></div>';
 const E=globalThis.AIMockApprovedEditor,demo=!live,active=d.status==="active",locked=demo||active||d.status==="financial_paused"||d.status==="paused",editable=!locked&&d.status!=="archived";
 const status=active?L(l,"Активен","Active"):d.status==="financial_paused"?L(l,"Пауза · нет AI-средств","Paused · insufficient balance"):d.status==="stopped"?L(l,"Остановлен","Stopped"):L(l,"Не запущен","Not running");
 const role=H(C.professions.find(x=>x.id===d.type)?.[l==="en"?"en":"ru"]||"—");
 const tabs=[["overview","Обзор","Overview"],["settings","Настройки","Settings"],["integrations","Интеграции","Integrations"],["knowledge","База знаний","Knowledge"],["testing","Тестирование","Testing"],["journal","Журнал","Activity log"]];
 if(["sales","hr"].includes(d.type))tabs.splice(2,0,[d.type==="hr"?"candidates":"leads",d.type==="hr"?"Кандидаты":"Заявки",d.type==="hr"?"Candidates":"Leads"]);
 const key=tabs.find(x=>x[0]===sub)?.[0]||"overview";
 const base="#/agents/"+encodeURIComponent(id);
 const nav='<nav class="ad-tabs" aria-label="'+L(l,"Разделы агента","Agent sections")+'">'+tabs.map(([slug,ru,en])=>'<a href="'+base+(slug==="overview"?"":"/"+slug)+'" '+(key===slug?'aria-current="page"':'')+'>'+L(l,ru,en)+'</a>').join("")+'</nav>';
 const action=demo?'':active?'<button class="ad-danger" type="button" data-detail-action="confirm-stop">'+L(l,"Остановить","Stop")+'</button>':d.status==="financial_paused"?'<button class="ad-danger" type="button" data-detail-action="confirm-stop">'+L(l,"Остановить","Stop")+'</button>':'<button class="ad-primary" type="button" data-detail-action="enable">'+L(l,"Запустить","Start")+'</button>';
 const cover=coverFor(o,id),coverPosition=["top","center","bottom"].includes(cover?.position)?cover.position:"center";
 const coverControls='<div class="ad-cover-controls"><button type="button" class="ad-cover-upload" data-detail-action="open-edit">'+icon("settings",15)+L(l,"Редактировать","Edit")+'</button></div>';
 const coverError=v.coverMessage?'<div class="ad-cover-error" role="alert">'+L(l,v.coverMessage==="save"?"Не удалось сохранить обложку. Возможно, закончилось место в браузере.":v.coverMessage==="size"?"Изображение слишком большое после обработки.":"Используйте JPG, PNG, WebP или AVIF размером до 12 МБ.",v.coverMessage==="save"?"Could not save cover. Browser storage may be full.":v.coverMessage==="size"?"Image is too large after processing.":"Choose JPG, PNG, WebP or AVIF, up to 12 MB.")+'</div>':"";
 const head='<header class="ad-visual-hero" data-cover-position="'+coverPosition+'">'+(cover?.image?'<img class="ad-cover-image" src="'+H(cover.image)+'" alt="" aria-hidden="true">':'<div class="ad-default-cover" aria-hidden="true"></div>')+'<div class="ad-hero-shade" aria-hidden="true"></div><div class="ad-hero-top"><a class="ad-back" href="#/agents">← '+L(l,"Все агенты","All agents")+'</a>'+coverControls+'</div><div class="ad-hero-line"><span class="ad-hero-avatar">'+(cover?.avatar?'<img src="'+H(cover.avatar)+'" alt="">':icon("agents",26))+'</span><div class="ad-hero-copy"><div class="ad-hero-title"><h1>'+H(d.name)+'</h1><span class="ad-status '+(active?"enabled":"")+'">'+status+'</span></div><p>'+H(d.description||role)+'</p><div class="ad-hero-tags"><span>'+role+'</span>'+(d.tags||[]).map(t=>'<span>'+H(t)+'</span>').join("")+'</div></div><div class="ad-actions">'+action+'</div></div>'+coverError+'</header>'+nav;
 const total=(d.connections||[]).length,know=(d.knowledge||[]).length;
 const stats='<div class="ad-kpis">'+[[L(l,"Обращения","Inquiries"),"—"],[L(l,"Обработано","Handled"),"—"],[L(l,"Передано сотруднику","Handed off"),"—"],[L(l,"Успешность","Success rate"),"—"]].map(([name,n])=>'<div class="ad-kpi"><strong>'+n+'</strong><span>'+name+'</span></div>').join("")+'</div>';
 const readiness=C.creationChecks(d),passed=readiness.filter(x=>x.ok).length;
 const readinessCard='<section class="ad-card ad-readiness-inline"><div class="ad-card-head"><h2>'+L(l,"Готовность к запуску","Launch readiness")+'</h2><strong>'+passed+' / '+readiness.length+'</strong></div><div class="ad-readiness-items">'+readiness.map(x=>'<span class="'+(x.ok?"complete":"")+'">'+(x.ok?"✓":"○")+' '+H(({name:L(l,"Название","Name"),type:L(l,"Тип агента","Agent type"),task:L(l,"Инструкции","Instructions"),group:L(l,"Группа доступа","Access group"),knowledge:L(l,"Знания","Knowledge"),connections:L(l,"Интеграции","Integrations"),handoff:L(l,"Передача сотруднику","Handoff")})[x.key]||x.key)+'</span>').join("")+'</div></section>';
 const overview='<div class="ad-overview">'+stats+'<div class="ad-overview-grid"><section class="ad-card ad-chart"><div class="ad-card-head"><h2>'+L(l,"Активность агента","Agent activity")+'</h2><span>'+L(l,"Последние 7 дней","Last 7 days")+'</span></div><div class="ad-empty-chart"><span>'+L(l,"Статистика появится после реальной работы агента","Activity data will appear after real agent activity")+'</span></div></section><section class="ad-card"><h2>'+L(l,"Подключения и готовность","Connections and readiness")+'</h2><div class="ad-snapshot"><span>'+L(l,"Интеграции","Integrations")+'</span><strong>'+total+'</strong></div><div class="ad-snapshot"><span>'+L(l,"Материалы","Knowledge items")+'</span><strong>'+know+'</strong></div><div class="ad-snapshot"><span>'+L(l,"Группа доступа","Access group")+'</span><strong>'+H(d.group||"—")+'</strong></div><a class="ad-card-link" href="'+base+'/integrations">'+L(l,"Посмотреть подключения","View connections")+' →</a></section></div></div>';
 const readonly='<section class="ad-card ad-readonly"><div class="ad-readonly-heading">'+icon("lock",18)+'<strong>'+L(l,"Конфигурация доступна только для просмотра","Configuration is read-only")+'</strong></div><p>'+L(l,"Чтобы изменить инструкции, теги, интеграции или доступы, сначала остановите агента.","Stop the agent before changing instructions, tags, integrations or permissions.")+'</p></section>';
 const settings=settingsWorkspace(o,l,icon,id,d,editable);
 const integrated=o.integrations.filter(i=>(d.connections||[]).includes(i.id));
 const integrations='<section class="ad-card"><h2>'+L(l,"Назначенные подключения","Assigned integrations")+'</h2><p>'+L(l,"Подключения создаются в общем Integration Hub. Агенту назначаются только доступные ему возможности.","Connections are created in the organization Integration Hub and scoped per agent.")+'</p><div class="ad-item-list">'+(integrated.length?integrated.map(i=>'<div><strong>'+H(i.name)+'</strong><span>'+H(i.status||"—")+'</span></div>').join(""):'<p>'+L(l,"Нет назначенных подключений","No assigned connections")+'</p>')+'</div>'+(editable?'<a class="ad-card-link" href="'+base+'/settings">'+L(l,"Изменить назначения в настройках","Manage assignments in settings")+' →</a>':readonly)+'</section>';
 const knowledge='<section class="ad-card"><h2>'+L(l,"База знаний агента","Agent knowledge")+'</h2><p>'+L(l,"Материалы и их версии закреплены за агентом. Изменения при активном состоянии недоступны.","Linked knowledge and versions are locked while this agent is active.")+'</p><div class="ad-item-list">'+((d.knowledge||[]).length?d.knowledge.map(k=>'<div><strong>'+H(k)+'</strong></div>').join(""):'<p>'+L(l,"Материалы пока не выбраны","No materials selected")+'</p>')+'</div>'+(editable?'<a class="ad-card-link" href="'+base+'/settings">'+L(l,"Настроить материалы","Configure knowledge")+' →</a>':readonly)+'</section>';
 const test='<section class="ad-card"><h2>'+L(l,"Тестирование агента","Agent testing")+'</h2><p>'+L(l,"Демонстрационная симуляция. Реальных отправок и действий во внешних сервисах нет.","Local simulation only. No live external messages or actions.")+'</p><div class="ad-chat"><p>'+L(l,"Пример: клиент задаёт вопрос об услуге.","Example: a customer asks about a service.")+'</p>'+(v.message?'<p class="ad-sent">'+H(v.message)+'</p>':"")+(v.reply?'<p>'+H(v.reply)+'</p>':"")+'</div><div class="ad-test-controls"><input data-detail-test value="'+H(v.message)+'" placeholder="'+L(l,"Введите тестовое сообщение","Enter a test message")+'"><button data-detail-action="test">'+L(l,"Отправить","Send")+'</button></div></section>';
 const journal='<section class="ad-card"><h2>'+L(l,"Журнал действий","Activity log")+'</h2><p>'+L(l,"История запусков, остановок, изменений конфигурации и действий будет показана здесь после подключения backend.","Launch, stop, configuration and agent activity events will appear after backend integration.")+'</p></section>';
 const special='<section class="ad-card"><h2>'+L(l,d.type==="hr"?"Кандидаты":"Заявки",d.type==="hr"?"Candidates":"Leads")+'</h2><p>'+L(l,"Связанные записи агента появятся после подключения источников и обработки реальных событий.","Agent records appear here when connected sources begin processing events.")+'</p></section>';
 const body=key==="settings"?settings:key==="integrations"?integrations:key==="knowledge"?knowledge:key==="testing"?test:key==="journal"?journal:key==="leads"?Leads.section(o,l,icon,id,!!live):key==="candidates"?special:overview;
 return head+'<div class="ad-content">'+body+'</div>'+(v.edit===id?editModal(o,l,icon,id,d,editable):'')+(v.confirm===id?'<div class="ad-overlay"><section role="alertdialog" aria-modal="true" aria-labelledby="ad-stop-title"><h2 id="ad-stop-title">'+L(l,"Остановить агента?","Stop this agent?")+'</h2><p>'+L(l,"Агент прекратит автоматические действия. Настройки станут доступны для изменения. Для возобновления потребуется повторный запуск.","Automation will stop. Settings become editable until you explicitly restart.")+'</p><div><button data-detail-action="cancel-stop">'+L(l,"Отмена","Cancel")+'</button><button class="ad-danger" data-detail-action="stop">'+L(l,"Остановить","Stop")+'</button></div></section></div>':"");
}
function panel(o,l,icon,id,open){
 const d=C.draft(o,id)||o.agents.find(a=>a.id===id);if(!d)return "";
 const checks=C.creationChecks(d),done=checks.filter(c=>c.ok).length,ready=Math.round(done/checks.length*100);
 return '<aside class="right-rail ad-rail '+(open?"mobile-open":"")+'" id="right-rail"><div class="ad-rail-header"><h2>'+L(l,"Готовность к запуску","Launch readiness")+'</h2><button class="close-mobile" data-close-panel aria-label="Close">'+icon("close")+'</button></div><div class="ad-rail-progress"><strong>'+ready+'%</strong><span>'+done+' / '+checks.length+'</span><div><i style="width:'+ready+'%"></i></div></div><p>'+L(l,"Статус конфигурации","Configuration status")+'</p><div class="ad-rail-checks">'+checks.map(c=>'<div><span>'+(c.ok?"✓":"○")+'</span>'+H(({name:L(l,"Название","Name"),type:L(l,"Тип агента","Agent type"),task:L(l,"Инструкции","Instructions"),group:L(l,"Группа доступа","Access group"),knowledge:L(l,"База знаний","Knowledge"),connections:L(l,"Интеграции","Integrations"),handoff:L(l,"Передача человеку","Escalation")})[c.key]||c.key)+'</div>').join("")+'</div><p class="ad-rail-note">'+L(l,"Запуск доступен при активной подписке, положительном AI-балансе и выполнении обязательных условий. Здесь используются демонстрационные данные.","Activation requires a paid plan, positive AI balance and required validation. Demo values shown.")+'</p></aside>';
}


function settingInput(el,o,id,l){
 if(!editableAgent(o,id))return false;
 const key=el.dataset.detailSetting;
 if(!key)return false;
 const d=C.draft(o,id);
 let updates={};
 if(key.startsWith("advanced:")){
  const field=key.slice(9);
  if(!d.type||!["identity","workflow","restrictions","escalation"].includes(field))return false;
  const overrides={...(d.advancedRoleOverrides||{})};
  overrides[d.type]={...(overrides[d.type]||{}),[field]:el.value};
  updates={advancedRoleOverrides:overrides};
 }else if(["task","company","handoff","communicationStyle","group"].includes(key)){
  updates={[key]:el.value};
 }else return false;
 const result=C.upsertEditorDraft(o,updates,id);
 settingsState.saveError=!result.saved;
 const status=document.querySelector("[data-detail-settings-save]");
 if(status){
   const span=status.querySelector("span");
   if(span)span.textContent=L(l,result.saved?"✓ Сохранено":"Не удалось сохранить",result.saved?"✓ Saved":"Save failed");
   status.dataset.error=String(!result.saved);
 }
 return result.saved;
}
function settingClick(el,o,id){
 const action=el.dataset.detailSettingAction;
 if(action==="section"){
  if(!settingsMenus.some(x=>x[0]===el.dataset.value))return false;
  settingsState.sectionById[id]=el.dataset.value;
  settingsState.examples=null;return true;
 }
 if(action==="examples"){settingsState.examples=id;return true}
 if(action==="close-examples"){settingsState.examples=null;return true}
 if(!editableAgent(o,id))return false;
 if(action==="toggle-access-tag"){
  const tag=el.dataset.value;
  const d=C.draft(o,id),available=globalThis.AIMockApprovedEditor.tagList(o);
  const tags=new Set(d?.tags||[]);
  if(tags.has(tag))tags.delete(tag);
  else if(available.includes(tag)&&tags.size<12)tags.add(tag);
  else return false;
  const result=C.upsertEditorDraft(o,{tags:[...tags]},id);
  settingsState.saveError=!result.saved;
  return true;
 }
 if(action==="toggle-rule"){
  const name=el.dataset.value;
  if(!settingRules.some(x=>x[0]===name))return false;
  const d=C.draft(o,id),rules=new Set(d.quickRules||[]);
  if(rules.has(name))rules.delete(name);else rules.add(name);
  const result=C.upsertEditorDraft(o,{quickRules:[...rules]},id);
  settingsState.saveError=!result.saved;return true;
 }
 if(action==="reset-advanced"){
  const d=C.draft(o,id);
  if(!d?.type)return false;
  const overrides={...(d.advancedRoleOverrides||{})};
  delete overrides[d.type];
  const result=C.upsertEditorDraft(o,{advancedRoleOverrides:overrides},id);
  settingsState.saveError=!result.saved;return true;
 }
 return false;
}

function click(el,o,id){
 const action=el.dataset.detailAction;
 if(action==="open-edit"){v.edit=id;v.editMessage="";return true}
 if(action==="close-edit"){v.edit=null;v.editMessage="";return true}
 if(action==="cover-upload"||action==="avatar-upload"){
  if(!editableAgent(o,id))return false;
  document.querySelector(action==="cover-upload"?"[data-detail-cover-file]":"[data-detail-avatar-file]")?.click();
  return false;
 }
 if(action==="cover-position"){
  if(!editableAgent(o,id)||!["top","center","bottom"].includes(el.dataset.value))return false;
  return saveCover(o,id,{...coverFor(o,id),position:el.dataset.value});
 }
 if(action==="cover-reset"||action==="avatar-reset"){
  if(!editableAgent(o,id))return false;
  const cover={...coverFor(o,id)};
  if(action==="cover-reset")delete cover.image;else delete cover.avatar;
  return saveCover(o,id,cover);
 }
 if(action==="toggle-tag"){
  if(!editableAgent(o,id))return false;
  const tag=el.dataset.value,values=globalThis.AIMockApprovedEditor.tagList(o);
  const d=C.draft(o,id),tags=new Set(d.tags||[]);
  if(tags.has(tag))tags.delete(tag);else if(values.includes(tag)&&tags.size<12)tags.add(tag);
  const result=C.upsertEditorDraft(o,{tags:[...tags]},id);
  v.editMessage=result.saved?"":"save";return true;
 }
 if(!C.draft(o,id)&&["enable","stop","confirm-stop"].includes(action))return false;
 if(action==="confirm-stop"){v.confirm=id;return true}
 if(action==="cancel-stop"){v.confirm=null;return true}
 if(action==="enable"||action==="stop"){
  if(!C.setAgentEnabled(o,id,action==="enable"))return false;
  v.confirm=null;return true;
 }
 if(action==="test"){v.message=document.querySelector("[data-detail-test]")?.value.trim()||"";if(v.message)v.reply="Спасибо! Уточните, пожалуйста, детали запроса, чтобы я мог помочь.";return true}
 return false;
}
function closePopup(){v.edit=null;v.editMessage="";v.confirm=null;settingsState.examples=null}
globalThis.AIMockAgentDetail={page,panel,click,coverFile,avatarFile,updateMeta,editableAgent,closePopup,settingInput,settingClick};
})();