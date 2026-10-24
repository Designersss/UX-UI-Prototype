(function agentLeads(){
"use strict";
/* Read-only sales-lead register preview. No CRM or Inbox records are invented. */
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(loc,ru,en)=>loc==="en"?en:ru;
const fixtures=[
 {id:"1048",name:"Анна Смирнова",company:"Bloom Studio",status:"qualified",channel:"telegram",date:"24 окт · 12:42",topic:"Разработка сайта",summary:"Нужен корпоративный сайт с каталогом услуг и формой заявки. Клиент уточнил основные требования и готов обсудить детали с менеджером.",need:"Корпоративный сайт",budget:"150–250 тыс. ₽",deadline:"В течение месяца",next:"Передать менеджеру для расчёта",owner:"Отдел продаж",qualification:"Данные собраны",notes:"Нужны примеры работ и предварительная смета"},
 {id:"1047",name:"Михаил Орлов",company:"Northline",status:"human",channel:"max",date:"24 окт · 11:18",topic:"Индивидуальные условия",summary:"Клиент запросил нестандартные условия сотрудничества. Агент собрал контекст и отметил необходимость участия сотрудника.",need:"Партнёрская программа",budget:"Обсуждается",deadline:"В ближайшие 2 недели",next:"Ответственный должен уточнить условия",owner:"Ожидает сотрудника",qualification:"Требуется человек",notes:"Запросил личный звонок"},
 {id:"1046",name:"Екатерина Лебедева",company:"Линия",status:"new",channel:"web",date:"24 окт · 10:54",topic:"Фирменный стиль",summary:"Первичное обращение по разработке айдентики. Ожидаются детали о направлении компании и желаемых сроках.",need:"Логотип и брендбук",budget:"Не указан",deadline:"Не указан",next:"Уточнить бюджет и сроки",owner:"AI-агент",qualification:"Не хватает данных",notes:"Пока только первичный запрос"},
 {id:"1045",name:"Дмитрий Волков",company:"Volkov Media",status:"working",channel:"telegram",date:"23 окт · 17:30",topic:"Редизайн продукта",summary:"Клиент прислал описание существующего продукта. Агент уточняет объём задач перед формированием заявки.",need:"Редизайн интерфейса",budget:"100–180 тыс. ₽",deadline:"6 недель",next:"Уточнить количество экранов",owner:"AI-агент",qualification:"В процессе",notes:"Есть макеты текущей версии"},
 {id:"1044",name:"Ольга Романова",company:"Green Cafe",status:"qualified",channel:"web",date:"23 окт · 14:07",topic:"Сайт для кафе",summary:"Собраны пожелания по сайту, меню и онлайн-заявкам. Заявка подготовлена для рассмотрения специалистом.",need:"Сайт и цифровое меню",budget:"80–120 тыс. ₽",deadline:"До середины ноября",next:"Связаться для обсуждения сметы",owner:"Отдел продаж",qualification:"Данные собраны",notes:"Интересует адаптация для мобильных"},
 {id:"1043",name:"Алексей Ким",company:"Kim Consulting",status:"closed",channel:"max",date:"22 окт · 09:22",topic:"Презентация компании",summary:"Клиент получил перечень услуг и согласился вернуться с подробным техническим заданием позднее.",need:"Презентация",budget:"До 40 тыс. ₽",deadline:"Не срочно",next:"Ожидаем новую информацию",owner:"Отдел продаж",qualification:"Обращение завершено",notes:"Повторное обращение ожидается"},
 {id:"1042",name:"Виктория Соколова",company:"Vika Beauty",status:"new",channel:"telegram",date:"21 окт · 16:08",topic:"Продвижение и дизайн",summary:"Первичный запрос о визуальных материалах для продвижения. Агент ожидает список задач.",need:"Посты и рекламные макеты",budget:"Не указан",deadline:"Не указан",next:"Уточнить объём",owner:"AI-агент",qualification:"Не хватает данных",notes:"Планируется серия кампаний"},
 {id:"1041",name:"Павел Егоров",company:"Egorov Tech",status:"working",channel:"web",date:"20 окт · 12:11",topic:"Дизайн приложения",summary:"Запрос на разработку дизайна мобильного приложения. Собраны требования к основным пользовательским сценариям.",need:"UI/UX мобильного приложения",budget:"200–350 тыс. ₽",deadline:"2 месяца",next:"Уточнить количество платформ",owner:"AI-агент",qualification:"В процессе",notes:"Есть прототип экранов"}
];
const statuses={new:["Новая","New"],working:["В работе","In progress"],qualified:["Квалифицирована","Qualified"],human:["Нужен человек","Needs human"],closed:["Завершена","Completed"]};
const channels={telegram:["Telegram","Telegram"],max:["MAX","MAX"],web:["Сайт","Website"]};
const store={};
function state(o,id,hasSaved){
 const key=o.id+":"+id;
 if(!store[key])store[key]={q:"",status:"all",channel:"all",selection:null,page:1,demo:!hasSaved};
 return store[key];
}
function data(s){return s.demo?fixtures:[]}
function filtered(s){
 const q=s.q.toLocaleLowerCase().trim();
 return data(s).filter(x=>(s.status==="all"||s.status===x.status)&&(s.channel==="all"||s.channel===x.channel)&&(!q||[x.id,x.name,x.company,x.topic,x.need].some(t=>String(t).toLocaleLowerCase().includes(q))));
}
function selected(rows,s){return rows.find(x=>x.id===s.selection)||rows[0]||null}
function statusBadge(row,l){return '<span class="al-status al-status-'+row.status+'">'+escape(L(l,...statuses[row.status]))+'</span>'}
function list(rows,s,l){
 const count=rows.length,pages=Math.max(1,Math.ceil(count/5));
 s.page=Math.min(Math.max(s.page,1),pages);
 const slice=rows.slice((s.page-1)*5,s.page*5),current=selected(rows,s);
 const items=slice.map(x=>'<button type="button" class="al-lead-item" data-lead-action="select" data-value="'+x.id+'" aria-pressed="'+(current?.id===x.id)+'"><span class="al-lead-top"><strong>'+escape(x.name)+'</strong>'+statusBadge(x,l)+'</span><span class="al-lead-company">'+escape(x.company)+' · #'+escape(x.id)+'</span><span class="al-lead-topic">'+escape(x.topic)+'</span><span class="al-lead-foot"><span>'+escape(L(l,...channels[x.channel]))+'</span><span>'+escape(x.date)+'</span></span></button>').join("");
 return '<div class="al-results" data-leads-results>'+(items||'<div class="al-list-empty">'+L(l,"Нет заявок по выбранным фильтрам.","No leads match these filters.")+'</div>')+'</div><footer class="al-pagination" data-leads-pagination><span>'+L(l,"Показано","Showing")+' '+(count?(s.page-1)*5+1:0)+'–'+Math.min(s.page*5,count)+' '+L(l,"из","of")+' '+count+'</span><div><button type="button" data-lead-action="page" data-value="'+(s.page-1)+'" '+(s.page<=1?"disabled":"")+' aria-label="'+L(l,"Предыдущая страница","Previous page")+'">‹</button><span>'+s.page+' / '+pages+'</span><button type="button" data-lead-action="page" data-value="'+(s.page+1)+'" '+(s.page>=pages?"disabled":"")+' aria-label="'+L(l,"Следующая страница","Next page")+'">›</button></div></footer>';
}
function detail(x,l){
 if(!x)return '<div class="al-blank-detail"><strong>'+L(l,"Заявка не выбрана","No lead selected")+'</strong><p>'+L(l,"Измените условия поиска или выберите заявку в списке.","Adjust filters or select an item in the list.")+'</p></div>';
 const item=(ru,en,value)=>'<div class="al-detail-fact"><span>'+L(l,ru,en)+'</span><strong>'+escape(value)+'</strong></div>';
 return '<div class="al-detail-head"><div><span class="al-detail-id">'+L(l,"ЗАЯВКА","LEAD")+' #'+escape(x.id)+'</span><h3>'+escape(x.name)+'</h3><p>'+escape(x.company)+'</p></div>'+statusBadge(x,l)+'</div>'+
 '<div class="al-detail-scroll">'+
 '<div class="al-detail-grid">'+item("Интересует","Request",x.need)+item("Источник","Source",L(l,...channels[x.channel]))+item("Бюджет","Budget",x.budget)+item("Срок","Timeline",x.deadline)+item("Ответственный","Assigned to",x.owner)+item("Квалификация","Qualification",x.qualification)+'</div>'+
 '<section class="al-detail-section"><h4>'+L(l,"Суть обращения","Inquiry summary")+'</h4><p>'+escape(x.summary)+'</p></section>'+
 '<section class="al-detail-section"><h4>'+L(l,"Следующий шаг","Next step")+'</h4><p>'+escape(x.next)+'</p></section>'+
 '<section class="al-detail-section"><h4>'+L(l,"Дополнительный контекст","Additional context")+'</h4><p>'+escape(x.notes)+'</p></section>'+
 '<div class="al-related"><h4>'+L(l,"Связанные объекты","Linked records")+'</h4><div class="al-related-row"><div><strong>'+L(l,"Диалог","Conversation")+'</strong><small>'+L(l,"Недоступен в демонстрационном режиме","Not available in the demo")+'</small></div><button type="button" disabled title="'+L(l,"Нужны реальные сообщения и разрешение на просмотр","Requires an actual conversation and permission")+'">'+L(l,"Открыть","Open")+'</button></div><div class="al-related-row"><div><strong>'+L(l,"Сделка в CRM","CRM deal")+'</strong><small>'+L(l,"Нет подтверждённой CRM-ссылки","No verified CRM link")+'</small></div><button type="button" disabled title="'+L(l,"Доступно после синхронизации с CRM","Available after CRM synchronization")+'">'+L(l,"Открыть","Open")+'</button></div></div>'+
 '</div>';
}
function metrics(s,l){
 const all=data(s);
 return '<div class="al-metrics"><div><strong>'+all.length+'</strong><span>'+L(l,"Всего заявок","Total leads")+'</span></div><div><strong>'+all.filter(x=>x.status==="qualified").length+'</strong><span>'+L(l,"Квалифицированы","Qualified")+'</span></div><div><strong>'+all.filter(x=>x.status==="human").length+'</strong><span>'+L(l,"Нужен сотрудник","Need attention")+'</span></div></div>';
}
function section(o,l,icon,id,hasSaved){
 const s=state(o,id,hasSaved),rows=filtered(s);
 if(!s.demo)return '<div class="al-empty-mode"><div class="al-empty-icon">'+icon("inbox",25)+'</div><h2>'+L(l,"Заявок пока нет","No leads yet")+'</h2><p>'+L(l,"Здесь появятся квалифицированные заявки этого агента после обработки реальных обращений. Это внутренний реестр, а не замена вашей CRM.","Qualified leads will appear here after the agent processes actual inquiries. This is an internal register, not a replacement for your CRM.")+'</p><button type="button" data-lead-action="demo-on">'+icon("layout",16)+' '+L(l,"Посмотреть пример интерфейса","Preview example leads")+'</button></div>';
 const card='<div class="al-shell"><div class="al-heading"><div><h2>'+L(l,"Заявки","Leads")+'</h2><p>'+L(l,"Квалификация обращений и результаты работы агента","Qualified inquiries and agent results")+'</p></div><div class="al-heading-right"><span class="al-demo-flag">'+L(l,"Демонстрационные данные","Sample data")+'</span>'+(hasSaved?'<button class="al-demo-exit" data-lead-action="demo-off">'+L(l,"Завершить просмотр","Exit preview")+'</button>':"")+'</div></div>'+
 metrics(s,l)+
 '<div class="al-columns"><section class="al-master"><div class="al-master-top"><div><strong>'+L(l,"Список заявок","Lead list")+'</strong><span>'+rows.length+'</span></div><div class="al-filters"><label class="al-search">'+icon("search",15)+'<input type="search" data-lead-search value="'+escape(s.q)+'" placeholder="'+L(l,"Имя, компания, тема…","Name, company, topic…")+'" aria-label="'+L(l,"Поиск заявок","Search leads")+'"></label><select data-lead-filter="status" aria-label="'+L(l,"Статус заявки","Lead status")+'"><option value="all">'+L(l,"Все статусы","All statuses")+'</option>'+Object.keys(statuses).map(k=>'<option value="'+k+'" '+(s.status===k?"selected":"")+'>'+L(l,...statuses[k])+'</option>').join("")+'</select><select data-lead-filter="channel" aria-label="'+L(l,"Источник заявки","Lead source")+'"><option value="all">'+L(l,"Все каналы","All channels")+'</option>'+Object.keys(channels).map(k=>'<option value="'+k+'" '+(s.channel===k?"selected":"")+'>'+L(l,...channels[k])+'</option>').join("")+'</select></div></div><div class="al-list-host" data-leads-list-host>'+list(rows,s,l)+'</div></section>'+
 '<section class="al-detail" aria-label="'+L(l,"Подробности заявки","Lead details")+'" data-leads-detail>'+detail(selected(rows,s),l)+'</section></div>'+
 '<p class="al-disclaimer">'+icon("info",14)+' '+L(l,"Это демонстрационные записи: они не являются настоящими клиентами, диалогами или сделками. Переходы к Inbox и CRM станут доступными только для подтверждённых связанных объектов.","These are sample records, not real customers, conversations or CRM deals. Linked actions require verified records.")+'</p></div>';
 return card;
}
function refresh(o,id,l){
 const root=document.querySelector(".al-shell");if(!root)return;
 const s=state(o,id,true),rows=filtered(s);
 const host=root.querySelector("[data-leads-list-host]");
 const panel=root.querySelector("[data-leads-detail]");
 if(host)host.innerHTML=list(rows,s,l);
 if(panel)panel.innerHTML=detail(selected(rows,s),l);
}
function action(el,o,id,l){
 const s=state(o,id,true),a=el.dataset.leadAction;
 if(a==="demo-on"){s.demo=true;s.page=1;s.selection=null;return true}
 if(a==="demo-off"){s.demo=false;s.page=1;s.selection=null;return true}
 if(a==="select"){s.selection=el.dataset.value;refresh(o,id,l);return false}
 if(a==="page"){const n=Number(el.dataset.value),pages=Math.max(1,Math.ceil(filtered(s).length/5));if(!Number.isInteger(n)||n<1||n>pages)return false;s.page=n;refresh(o,id,l);return false}
 return false;
}
function input(el,o,id,l){
 const s=state(o,id,true);
 if(el.matches("[data-lead-search]"))s.q=el.value;
 else if(el.matches('[data-lead-filter="status"]'))s.status=el.value;
 else if(el.matches('[data-lead-filter="channel"]'))s.channel=el.value;
 else return false;
 s.page=1;s.selection=null;refresh(o,id,l);return true;
}
globalThis.AIMockAgentLeads={section,action,input};
})();