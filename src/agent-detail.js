(function(){
"use strict";
const C=globalThis.AIMockCreator;
const v={confirm:null,message:"",reply:""};
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
 if(!file)return false;
 if(!["image/jpeg","image/png","image/webp","image/avif"].includes(file.type)||file.size>12*1024*1024){v.coverMessage="type";return false}
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
  if(encoded.length>1200000){v.coverMessage="size";return false}
  return saveCover(o,id,{image:encoded,position:coverFor(o,id)?.position||"center"});
 }catch(_){v.coverMessage="type";return false}
 finally{URL.revokeObjectURL(url)}
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
 const coverControls='<div class="ad-cover-controls"><label class="ad-cover-upload" for="ad-cover-file">'+icon("image",15)+L(l,"Изменить обложку","Change cover")+'</label><input class="ad-cover-file" type="file" id="ad-cover-file" data-detail-cover-file accept="image/jpeg,image/png,image/webp,image/avif" aria-label="'+L(l,"Загрузить обложку агента","Upload agent cover")+'"><details class="ad-cover-menu"><summary aria-label="'+L(l,"Настройки обложки","Cover settings")+'">'+icon("more-horizontal",17)+'</summary><div><strong>'+L(l,"Положение изображения","Image position")+'</strong>'+[["top","Сверху","Top"],["center","По центру","Center"],["bottom","Снизу","Bottom"]].map(([value,ru,en])=>'<button type="button" data-detail-action="cover-position" data-value="'+value+'" aria-pressed="'+(value===coverPosition)+'">'+L(l,ru,en)+(value===coverPosition?" ✓":"")+'</button>').join("")+'<button type="button" data-detail-action="cover-reset" '+(cover?.image?"":"disabled")+'>'+L(l,"Убрать изображение","Remove image")+'</button></div></details></div>';
 const coverError=v.coverMessage?'<div class="ad-cover-error" role="alert">'+L(l,v.coverMessage==="save"?"Не удалось сохранить обложку. Возможно, закончилось место в браузере.":v.coverMessage==="size"?"Изображение слишком большое после обработки.":"Используйте JPG, PNG, WebP или AVIF размером до 12 МБ.",v.coverMessage==="save"?"Could not save cover. Browser storage may be full.":v.coverMessage==="size"?"Image is too large after processing.":"Choose JPG, PNG, WebP or AVIF, up to 12 MB.")+'</div>':"";
 const head='<header class="ad-visual-hero" data-cover-position="'+coverPosition+'">'+(cover?.image?'<img class="ad-cover-image" src="'+H(cover.image)+'" alt="" aria-hidden="true">':'<div class="ad-default-cover" aria-hidden="true"></div>')+'<div class="ad-hero-shade" aria-hidden="true"></div><div class="ad-hero-top"><a class="ad-back" href="#/agents">← '+L(l,"Все агенты","All agents")+'</a>'+coverControls+'</div><div class="ad-hero-line"><span class="ad-hero-avatar">'+icon("agents",26)+'</span><div class="ad-hero-copy"><div class="ad-hero-title"><h1>'+H(d.name)+'</h1><span class="ad-status '+(active?"enabled":"")+'">'+status+'</span></div><p>'+H(d.description||role)+'</p><div class="ad-hero-tags"><span>'+role+'</span>'+(d.tags||[]).map(t=>'<span>'+H(t)+'</span>').join("")+'</div></div><div class="ad-actions">'+action+'</div></div>'+coverError+'</header>'+nav;
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
 return head+'<div class="ad-content">'+body+'</div>'+(v.confirm===id?'<div class="ad-overlay"><section role="alertdialog" aria-modal="true" aria-labelledby="ad-stop-title"><h2 id="ad-stop-title">'+L(l,"Остановить агента?","Stop this agent?")+'</h2><p>'+L(l,"Агент прекратит автоматические действия. Настройки станут доступны для изменения. Для возобновления потребуется повторный запуск.","Automation will stop. Settings become editable until you explicitly restart.")+'</p><div><button data-detail-action="cancel-stop">'+L(l,"Отмена","Cancel")+'</button><button class="ad-danger" data-detail-action="stop">'+L(l,"Остановить","Stop")+'</button></div></section></div>':"");
}
function panel(o,l,icon,id,open){
 const d=C.draft(o,id)||o.agents.find(a=>a.id===id);if(!d)return "";
 const checks=C.creationChecks(d),done=checks.filter(c=>c.ok).length,ready=Math.round(done/checks.length*100);
 return '<aside class="right-rail ad-rail '+(open?"mobile-open":"")+'" id="right-rail"><div class="ad-rail-header"><h2>'+L(l,"Готовность к запуску","Launch readiness")+'</h2><button class="close-mobile" data-close-panel aria-label="Close">'+icon("close")+'</button></div><div class="ad-rail-progress"><strong>'+ready+'%</strong><span>'+done+' / '+checks.length+'</span><div><i style="width:'+ready+'%"></i></div></div><p>'+L(l,"Статус конфигурации","Configuration status")+'</p><div class="ad-rail-checks">'+checks.map(c=>'<div><span>'+(c.ok?"✓":"○")+'</span>'+H(({name:L(l,"Название","Name"),type:L(l,"Тип агента","Agent type"),task:L(l,"Инструкции","Instructions"),group:L(l,"Группа доступа","Access group"),knowledge:L(l,"База знаний","Knowledge"),connections:L(l,"Интеграции","Integrations"),handoff:L(l,"Передача человеку","Escalation")})[c.key]||c.key)+'</div>').join("")+'</div><p class="ad-rail-note">'+L(l,"Запуск доступен при активной подписке, положительном AI-балансе и выполнении обязательных условий. Здесь используются демонстрационные данные.","Activation requires a paid plan, positive AI balance and required validation. Demo values shown.")+'</p></aside>';
}
function click(el,o,id){
 const action=el.dataset.detailAction;
 if(!C.draft(o,id)&&["enable","stop","confirm-stop"].includes(action))return false;
 if(action==="cover-position"){
  const value=el.dataset.value;
  if(!["top","center","bottom"].includes(value))return false;
  return saveCover(o,id,{...coverFor(o,id),position:value});
 }
 if(action==="cover-reset")return saveCover(o,id,null);
 if(action==="confirm-stop"){v.confirm=id;return true;}
 if(action==="cancel-stop"){v.confirm=null;return true;}
 if(action==="enable"||action==="stop"){
  if(!C.setAgentEnabled(o,id,action==="enable"))return false;
  v.confirm=null;return true;
 }
 if(action==="test"){v.message=document.querySelector("[data-detail-test]")?.value.trim()||"";if(v.message)v.reply="Спасибо! Уточните, пожалуйста, детали запроса, чтобы я мог помочь.";return true;}
 return false;
}
globalThis.AIMockAgentDetail={page,panel,click,coverFile};
})();