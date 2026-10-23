(function(){
"use strict";
const C=globalThis.AIMockCreator;
const v={confirm:null,edit:null,message:"",reply:"",coverMessage:"",editMessage:""};
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

function editModal(o,l,icon,id,d,editable){
 const E=globalThis.AIMockApprovedEditor,cover=coverFor(o,id)||{},chosen=d.tags||[];
 const status=editable?L(l,"Изменения сохраняются автоматически","Changes save automatically"):L(l,"Только просмотр · остановите агента для изменений","Read-only · stop the agent to edit");
 const opts=[...new Set(["Продажи","HR","Поддержка",d.group].filter(Boolean))];
 const disabled=editable?"":" disabled";
 const tip=(ru,en)=>'<span class="ad-meta-tip" tabindex="0" aria-label="'+H(L(l,ru,en))+'">ⓘ<span role="tooltip">'+H(L(l,ru,en))+'</span></span>';
 const error=v.editMessage?'<p class="ad-edit-error" role="alert">'+L(l,v.editMessage==="save"?"Не удалось сохранить изменения.":v.editMessage==="name"?"Введите название агента.":v.editMessage==="image_size"?"Изображение слишком большое.":"Используйте JPG, PNG, WebP или AVIF до 12 МБ.",v.editMessage==="save"?"Unable to save changes.":v.editMessage==="name"?"Agent name is required.":v.editMessage==="image_size"?"Image is too large.":"Choose JPG, PNG, WebP or AVIF up to 12 MB.")+'</p>':"";
 return '<div class="ad-edit-backdrop" data-detail-overlay><section class="ad-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="ad-edit-title" tabindex="-1">'+
 '<header class="ad-edit-head"><div><small>'+L(l,"КАРТОЧКА АГЕНТА","AGENT PROFILE")+'</small><h2 id="ad-edit-title">'+L(l,"Редактировать агента","Edit agent")+'</h2><p data-detail-save>'+status+'</p></div><button type="button" data-detail-action="close-edit" class="ad-edit-close" aria-label="'+L(l,"Закрыть","Close")+'">×</button></header>'+
 (!editable?'<div class="ad-edit-locked">'+icon("lock",16)+L(l,"Активный агент доступен только для просмотра. Для изменений сначала остановите его.","Active agent settings are read-only. Stop the agent before editing.")+'</div>':"")+
 '<div class="ad-edit-body"><div class="ad-edit-media">'+
 '<div class="ad-edit-cover-tile">'+(cover.image?'<img src="'+H(cover.image)+'" alt="">':'<div class="ad-edit-default-cover"></div>')+'<div class="ad-edit-media-shade"></div><div><strong>'+L(l,"Обложка","Cover photo")+'</strong><button type="button" data-detail-action="cover-upload"'+disabled+'>'+icon("image",15)+L(l,"Загрузить","Upload")+'</button></div></div>'+
 '<div class="ad-edit-avatar-tile"><span class="ad-edit-avatar-preview">'+(cover.avatar?'<img src="'+H(cover.avatar)+'" alt="">':icon("agents",29))+'</span><strong>'+L(l,"Аватар","Avatar")+'</strong><button type="button" data-detail-action="avatar-upload"'+disabled+'>'+L(l,"Изменить","Change")+'</button></div></div>'+
 '<div class="ad-edit-media-options"><label>'+L(l,"Положение обложки","Cover position")+'<select data-detail-select="cover-position"'+disabled+'>'+[["top","Сверху","Top"],["center","По центру","Center"],["bottom","Снизу","Bottom"]].map(([value,ru,en])=>'<option value="'+value+'" '+((cover.position||"center")===value?"selected":"")+'>'+L(l,ru,en)+'</option>').join("")+'</select></label><button type="button" data-detail-action="cover-reset" '+(!editable||!cover.image?"disabled":"")+'>'+L(l,"Удалить обложку","Remove cover")+'</button><button type="button" data-detail-action="avatar-reset" '+(!editable||!cover.avatar?"disabled":"")+'>'+L(l,"Удалить аватар","Remove avatar")+'</button></div>'+
 '<div class="ad-edit-fields"><label class="ad-edit-field"><strong>'+L(l,"Название агента","Agent name")+'</strong><input data-detail-input="name" maxlength="80" value="'+H(d.name)+'"'+disabled+'></label>'+
 '<label class="ad-edit-field"><span class="ad-edit-label"><strong>'+L(l,"Группа доступа","Access group")+'</strong>'+tip("Группа определяет область доступа сотрудников. Права настраиваются отдельно в Настройках.","Access group scopes employee permissions, managed separately in Settings.")+'</span><select data-detail-input="group"'+disabled+'><option value="">'+L(l,"Не выбрано","Not selected")+'</option>'+opts.map(g=>'<option value="'+H(g)+'" '+(d.group===g?"selected":"")+'>'+H(g)+'</option>').join("")+'</select></label>'+
 '<label class="ad-edit-field ad-edit-description"><strong>'+L(l,"Описание","Description")+'</strong><textarea data-detail-input="description" maxlength="500" rows="3"'+disabled+'>'+H(d.description||"")+'</textarea></label>'+
 '<div class="ad-edit-field ad-edit-tags"><div class="ad-edit-label"><strong>'+L(l,"Теги","Tags")+'</strong>'+tip("Теги нужны для поиска и фильтрации, но не выдают доступ. Управляются отдельно в Настройках.","Tags help search and filtering but do not grant access. Manage them in Settings.")+'</div>'+
 '<div class="ad-edit-tags-list">'+chosen.map(t=>'<span>'+H(t)+(editable?'<button data-detail-action="toggle-tag" data-value="'+H(t)+'" type="button" aria-label="'+L(l,"Удалить тег ","Remove tag ")+H(t)+'">×</button>':"")+'</span>').join("")+'</div>'+
 '<details class="ad-edit-tag-dropdown"><summary>'+L(l,"Выбрать теги","Choose tags")+' · '+chosen.length+'</summary><div><input type="search" data-detail-tag-search placeholder="'+L(l,"Поиск тегов","Search tags")+'"'+disabled+'>'+E.tagList(o).map(t=>'<button type="button" data-detail-action="toggle-tag" data-value="'+H(t)+'" aria-pressed="'+chosen.includes(t)+'"'+disabled+'>'+H(t)+' <span>'+(chosen.includes(t)?"✓":"+")+'</span></button>').join("")+'</div></details>'+
 '<a class="ad-edit-tags-link" href="#/settings/tags">'+L(l,"Управление тегами","Manage tags")+' →</a></div></div>'+error+'</div>'+
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
 const settings=locked?readonly+'<div class="ad-card-grid"><section class="ad-card"><h2>'+L(l,"Основная информация","Basic information")+'</h2><div class="ad-facts"><div><span>'+L(l,"Название","Name")+'</span><strong>'+H(d.name)+'</strong></div><div><span>'+L(l,"Группа доступа","Access group")+'</span><strong>'+H(d.group||"—")+'</strong></div><div><span>'+L(l,"Теги","Tags")+'</span><strong>'+H((d.tags||[]).join(", ")||"—")+'</strong></div></div></section><section class="ad-card"><h2>'+L(l,"Инструкции","Instructions")+'</h2><p>'+H(d.task||"—")+'</p><h3>'+L(l,"Передача сотруднику","Human escalation")+'</h3><p>'+H(d.handoff||"—")+'</p></section></div>':
 '<div class="ad-inline-settings"><div class="ad-edit-info">'+icon("check",16)+' '+L(l,"Все изменения сохраняются автоматически. Дополнительная кнопка редактирования не нужна.","Changes save automatically; no Edit button is necessary.")+'</div>'+
 E.basicSection(d,l,icon,o)+E.instructionsSection(d,l,icon)+E.toolsSection(d,o,l,icon)+E.accessSection(d,l,icon)+'</div>';
 const integrated=o.integrations.filter(i=>(d.connections||[]).includes(i.id));
 const integrations='<section class="ad-card"><h2>'+L(l,"Назначенные подключения","Assigned integrations")+'</h2><p>'+L(l,"Подключения создаются в общем Integration Hub. Агенту назначаются только доступные ему возможности.","Connections are created in the organization Integration Hub and scoped per agent.")+'</p><div class="ad-item-list">'+(integrated.length?integrated.map(i=>'<div><strong>'+H(i.name)+'</strong><span>'+H(i.status||"—")+'</span></div>').join(""):'<p>'+L(l,"Нет назначенных подключений","No assigned connections")+'</p>')+'</div>'+(editable?'<a class="ad-card-link" href="'+base+'/settings">'+L(l,"Изменить назначения в настройках","Manage assignments in settings")+' →</a>':readonly)+'</section>';
 const knowledge='<section class="ad-card"><h2>'+L(l,"База знаний агента","Agent knowledge")+'</h2><p>'+L(l,"Материалы и их версии закреплены за агентом. Изменения при активном состоянии недоступны.","Linked knowledge and versions are locked while this agent is active.")+'</p><div class="ad-item-list">'+((d.knowledge||[]).length?d.knowledge.map(k=>'<div><strong>'+H(k)+'</strong></div>').join(""):'<p>'+L(l,"Материалы пока не выбраны","No materials selected")+'</p>')+'</div>'+(editable?'<a class="ad-card-link" href="'+base+'/settings">'+L(l,"Настроить материалы","Configure knowledge")+' →</a>':readonly)+'</section>';
 const test='<section class="ad-card"><h2>'+L(l,"Тестирование агента","Agent testing")+'</h2><p>'+L(l,"Демонстрационная симуляция. Реальных отправок и действий во внешних сервисах нет.","Local simulation only. No live external messages or actions.")+'</p><div class="ad-chat"><p>'+L(l,"Пример: клиент задаёт вопрос об услуге.","Example: a customer asks about a service.")+'</p>'+(v.message?'<p class="ad-sent">'+H(v.message)+'</p>':"")+(v.reply?'<p>'+H(v.reply)+'</p>':"")+'</div><div class="ad-test-controls"><input data-detail-test value="'+H(v.message)+'" placeholder="'+L(l,"Введите тестовое сообщение","Enter a test message")+'"><button data-detail-action="test">'+L(l,"Отправить","Send")+'</button></div></section>';
 const journal='<section class="ad-card"><h2>'+L(l,"Журнал действий","Activity log")+'</h2><p>'+L(l,"История запусков, остановок, изменений конфигурации и действий будет показана здесь после подключения backend.","Launch, stop, configuration and agent activity events will appear after backend integration.")+'</p></section>';
 const special='<section class="ad-card"><h2>'+L(l,d.type==="hr"?"Кандидаты":"Заявки",d.type==="hr"?"Candidates":"Leads")+'</h2><p>'+L(l,"Связанные записи агента появятся после подключения источников и обработки реальных событий.","Agent records appear here when connected sources begin processing events.")+'</p></section>';
 const body=key==="settings"?settings:key==="integrations"?integrations:key==="knowledge"?knowledge:key==="testing"?test:key==="journal"?journal:key==="leads"||key==="candidates"?special:overview;
 return head+'<div class="ad-content">'+body+'</div>'+(v.edit===id?editModal(o,l,icon,id,d,editable):'')+(v.confirm===id?'<div class="ad-overlay"><section role="alertdialog" aria-modal="true" aria-labelledby="ad-stop-title"><h2 id="ad-stop-title">'+L(l,"Остановить агента?","Stop this agent?")+'</h2><p>'+L(l,"Агент прекратит автоматические действия. Настройки станут доступны для изменения. Для возобновления потребуется повторный запуск.","Automation will stop. Settings become editable until you explicitly restart.")+'</p><div><button data-detail-action="cancel-stop">'+L(l,"Отмена","Cancel")+'</button><button class="ad-danger" data-detail-action="stop">'+L(l,"Остановить","Stop")+'</button></div></section></div>':"");
}
function panel(o,l,icon,id,open){
 const d=C.draft(o,id)||o.agents.find(a=>a.id===id);if(!d)return "";
 const checks=C.creationChecks(d),done=checks.filter(c=>c.ok).length,ready=Math.round(done/checks.length*100);
 return '<aside class="right-rail ad-rail '+(open?"mobile-open":"")+'" id="right-rail"><div class="ad-rail-header"><h2>'+L(l,"Готовность к запуску","Launch readiness")+'</h2><button class="close-mobile" data-close-panel aria-label="Close">'+icon("close")+'</button></div><div class="ad-rail-progress"><strong>'+ready+'%</strong><span>'+done+' / '+checks.length+'</span><div><i style="width:'+ready+'%"></i></div></div><p>'+L(l,"Статус конфигурации","Configuration status")+'</p><div class="ad-rail-checks">'+checks.map(c=>'<div><span>'+(c.ok?"✓":"○")+'</span>'+H(({name:L(l,"Название","Name"),type:L(l,"Тип агента","Agent type"),task:L(l,"Инструкции","Instructions"),group:L(l,"Группа доступа","Access group"),knowledge:L(l,"База знаний","Knowledge"),connections:L(l,"Интеграции","Integrations"),handoff:L(l,"Передача человеку","Escalation")})[c.key]||c.key)+'</div>').join("")+'</div><p class="ad-rail-note">'+L(l,"Запуск доступен при активной подписке, положительном AI-балансе и выполнении обязательных условий. Здесь используются демонстрационные данные.","Activation requires a paid plan, positive AI balance and required validation. Demo values shown.")+'</p></aside>';
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
function closePopup(){v.edit=null;v.editMessage="";v.confirm=null}
globalThis.AIMockAgentDetail={page,panel,click,coverFile,avatarFile,updateMeta,editableAgent,closePopup};
})();