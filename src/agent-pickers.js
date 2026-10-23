(function(){
const C=globalThis.AIMockCreator,E=globalThis.AIMockApprovedEditor;
const state={q:"",only:false,page:1};
const text=(l,ru,en)=>l==="en"?en:ru;
function list(o,d,kind,l){
 return kind==="integrations"?o.integrations.filter(i=>E.agentIntegrationIds(d.type).includes(i.id)||E.agentIntegrationIds(d.type).includes(i.brand)).map(i=>({id:i.id,name:i.name,ok:i.status==="connected"})):(d.type==="hr"?[["vacancies","Вакансии"],["candidate-guide","Правила найма"]]:[["services","Услуги и цены"],["faqs","Частые вопросы"]]).map(i=>({id:i[0],name:i[1],ok:true}));
}
function cards(o,l,id,kind){
 const d=E.model(o,id),field=kind==="knowledge"?"knowledge":"connections",chosen=d[field]||[];
 const all=list(o,d,kind,l).filter(x=>x.name.toLowerCase().includes(state.q.toLowerCase())&&(!state.only||chosen.includes(x.id)));
 const total=Math.max(1,Math.ceil(all.length/8));state.page=Math.min(total,Math.max(1,state.page));
 return '<div class="ap-list">'+all.slice((state.page-1)*8,state.page*8).map(item=>'<button data-pick-action="toggle" data-value="'+E.X(item.id)+'" aria-pressed="'+chosen.includes(item.id)+'" '+(!item.ok?"disabled":"")+'><strong>'+E.X(item.name)+'</strong><small>'+(chosen.includes(item.id)?"✓":item.ok?"+":"—")+'</small></button>').join("")+'</div><div class="ap-pagination"><button data-pick-action="prev" '+(state.page===1?"disabled":"")+'>‹</button> '+state.page+' / '+total+' <button data-pick-action="next" '+(state.page===total?"disabled":"")+'>›</button></div>';
}
function page(o,l,icon,id,kind){
 return '<div class="ap-head"><a href="#/agents/'+id+'/edit/tools">← '+text(l,"Назад к агенту","Back to agent")+'</a><h1>'+text(l,kind==="knowledge"?"База знаний":"Интеграции",kind==="knowledge"?"Knowledge base":"Integrations")+'</h1><p>'+text(l,"Отметьте нужные материалы. Изменения сохраняются автоматически.","Select what the agent needs. Changes save automatically.")+'</p></div><section class="ap-card"><div class="ap-controls"><input type="search" data-pick-search value="'+E.X(state.q)+'" placeholder="'+text(l,"Поиск по названию","Search by name")+'"><label><input type="checkbox" data-pick-only '+(state.only?"checked":"")+'>'+text(l,"Только выбранные","Selected only")+'</label></div><div data-pick-results>'+cards(o,l,id,kind)+'</div></section><a class="ap-done" href="#/agents/'+id+'/edit/tools">'+text(l,"Готово","Done")+' →</a>';
}
function refresh(o,l){let a=location.hash.slice(2).split("/");const node=document.querySelector("[data-pick-results]");if(node)node.innerHTML=cards(o,l,a[1],a[3]);}
function click(el,o,l){
 const parts=location.hash.slice(2).split("/"),id=parts[1],kind=parts[3],action=el.dataset.pickAction;
 if(action==="prev"||action==="next"){state.page+=action==="prev"?-1:1;refresh(o,l);return;}
 const field=kind==="knowledge"?"knowledge":"connections",d=E.model(o,id);
 const item=list(o,d,kind,l).find(i=>i.id===el.dataset.value&&i.ok);if(!item)return;
 const chosen=new Set(d[field]||[]);if(chosen.has(item.id))chosen.delete(item.id);else chosen.add(item.id);
 const result=C.upsertEditorDraft(o,{[field]:[...chosen]},id==="new"?null:id);
 if(result.saved){if(id==="new"){history.replaceState(null,"","#/agents/"+result.id+"/pick/"+kind);document.querySelector(".ap-done")?.setAttribute("href","#/agents/"+result.id+"/edit/tools");document.querySelector(".ap-head a")?.setAttribute("href","#/agents/"+result.id+"/edit/tools");}refresh(o,l);}
}
function input(el,o,l){if(el.matches("[data-pick-search]")){state.q=el.value;state.page=1;refresh(o,l);return;}if(el.matches("[data-pick-only]")){state.only=el.checked;state.page=1;refresh(o,l);}}
globalThis.AIMockPicker={page,click,input};
})();