(function(){
"use strict";
const E=globalThis.AIMockApprovedEditor,C=globalThis.AIMockCreator;
const ui=E.ui,L=E.L;
function persist(o,update){
 const key=E.id();
 const result=C.upsertEditorDraft(o,update,key&&key!=="new"?key:null);
 ui.fail=!result.saved;
 if(result.saved&&key==="new"){
   history.replaceState(null,"","#/agents/"+encodeURIComponent(result.id)+"/edit");
   // Links were rendered before the first keystroke, when no draft ID existed.
   // Retarget guide and picker links without rebuilding the form or dropping focus.
   document.querySelectorAll('a[href^="#/agents/new/"]').forEach(link=>{
     link.setAttribute("href",link.getAttribute("href").replace("#/agents/new/","#/agents/"+encodeURIComponent(result.id)+"/"));
   });
   ui.blank={name:"",description:"",group:"",type:null,task:"",company:"",handoff:"",handoffTarget:"",knowledge:[],connections:[],quickRules:[],communicationStyle:"friendly",tags:[]};
 }
 return result;
}
function withRolePreference(d,changes){
 if(!d.type)return changes;
 const prefs={...(d.rolePreferences||{})};
 const before=prefs[d.type]||{};
 const update={};
 for(const key of ["task","handoff","quickRules","communicationStyle"]){
   if(Object.prototype.hasOwnProperty.call(changes,key))update[key]=changes[key];
 }
 if(!Object.keys(update).length)return changes;
 prefs[d.type]={...before,...update};
 return {...changes,rolePreferences:prefs};
}
function input(el,o,loc,icon){
 const key=el.dataset.editorInput;
 if(!["name","description","company","task","handoff","group","handoffTarget","communicationStyle","tags"].includes(key))return false;
 const draft=E.model(o,E.id());
 const result=persist(o,withRolePreference(draft,{[key]:key==="tags"?el.value.split(",").map(v=>v.trim().replace(/\s+/g," ")).filter(Boolean).slice(0,12):el.value}));
 if(result.saved){
   if(key==="group")document.querySelectorAll('[data-editor-input="group"]').forEach(s=>{if(s!==el)s.value=el.value;});
   E.refresh(o,loc,icon);
 }else{
   const label=document.querySelector("[data-editor-save]");if(label)label.textContent=L(loc,"Не удалось сохранить","Save failed");
 }
 return true;
}
function search(value,o,loc,icon){ui.q=value;ui.page=1;renderRoles(o,loc,icon);}
function renderRoles(o,loc,icon){
 const mount=document.querySelector("[data-editor-roles]");if(!mount)return;
 mount.innerHTML=E.roleList(E.model(o,E.id()),loc,icon);
 document.querySelectorAll(".ae-filters button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.value===ui.category)));
}
function click(el,o,loc,icon){
 const key=E.id(),d=E.model(o,key),action=el.dataset.editorAction,value=el.dataset.value;
 if(action==="category"){ui.category=value;ui.page=1;renderRoles(o,loc,icon);return true;}
 if(action==="expand"||action==="collapse"){ui.expanded=action==="expand";ui.page=1;renderRoles(o,loc,icon);return true;}
 if(action==="page"){
   const page=Number(value),total=Math.max(1,Math.ceil(E.matching().length/9));
   if(Number.isInteger(page)&&page>=1&&page<=total){ui.page=page;renderRoles(o,loc,icon);}return true;
 }
 if(action==="role"){
   const profession=C.professions.find(p=>p.id===value&&p.available);
   if(!profession)return true;
   if(d.type===profession.id)return true;
   const nextPreset=globalThis.AIMockProfessionPresets.get(profession.id,loc);
   const selectedGroup=profession.category==="hr"?"HR":"Продажи";
   const oldDefault=d.type==="hr"?"HR":d.type==="sales"?"Продажи":"";
   const previous={...(d.rolePreferences||{})};
   if(d.type){
     previous[d.type]={
       ...(previous[d.type]||{}),
       task:d.task||"",handoff:d.handoff||"",
       quickRules:[...(d.quickRules||[])],
       communicationStyle:d.communicationStyle||"friendly"
     };
   }
   const saved=previous[profession.id]||{};
   const patch={
     type:profession.id,
     rolePreferences:previous,
     group:d.group===oldDefault?"":d.group,
     handoffTarget:d.handoffTarget===oldDefault?"":d.handoffTarget,
     task:typeof saved.task==="string"?saved.task:"",
     handoff:typeof saved.handoff==="string"?saved.handoff:"",
     quickRules:Array.isArray(saved.quickRules)?[...saved.quickRules]:[],
     communicationStyle:saved.communicationStyle||nextPreset.tone,
     knowledge:[]
   };
   patch.connections=(d.connections||[]).filter(id=>o.integrations.some(i=>i.id===id&&(E.agentIntegrationIds(profession.id).includes(i.id)||E.agentIntegrationIds(profession.id).includes(i.brand))));
   const result=persist(o,patch);
   if(result.saved){
     const updated=result.draft;
     renderRoles(o,loc,icon);
     document.querySelectorAll('[data-editor-dropdown="group"]').forEach(dd=>{
       const group=dd.querySelector("summary span");
       if(group)group.textContent=updated.group||L(loc,"Не выбрано","Not selected");
     });
     const instructions=document.getElementById("ae-block-3");
     if(instructions)instructions.outerHTML=E.instructionsSection(updated,loc,icon);
     const knowledge=document.getElementById("ae-block-4");
     if(knowledge)knowledge.outerHTML=E.toolsSection(updated,o,loc,icon);
     const access=document.getElementById("ae-block-5");
     if(access)access.outerHTML=E.accessSection(updated,loc,icon);
     E.refresh(o,loc,icon);
   }
   return true;
 }
 if(action==="rule"){
   const rules=new Set(d.quickRules||[]);if(rules.has(value))rules.delete(value);else rules.add(value);
   const res=persist(o,withRolePreference(d,{quickRules:[...rules]}));
   if(res.saved){el.setAttribute("aria-pressed",String(rules.has(value)));E.refresh(o,loc,icon);}return true;
 }
 if(action==="knowledge"||action==="connection"){
   const k=action==="knowledge"?"knowledge":"connections";
   if(k==="connections"&&!o.integrations.some(i=>i.id===value&&i.status==="connected"&&(E.agentIntegrationIds(d.type).includes(i.id)||E.agentIntegrationIds(d.type).includes(i.brand))))return true;
   const set=new Set(d[k]||[]);if(set.has(value))set.delete(value);else set.add(value);
   const res=persist(o,{[k]:[...set]});
   if(res.saved){
     const selected=set.has(value);el.setAttribute("aria-pressed",String(selected));el.classList.toggle("selected",selected);
     const flag=el.querySelector("small");if(flag)flag.textContent=selected?L(loc,"Выбрано","Selected"):"+";
     E.refresh(o,loc,icon);
   }return true;
 }
 if(action==="done"){location.hash="#/agents/"+key;return true;}
 if(action==="create"){
   const saved=key==="new"?persist(o,{}):{saved:!!C.draft(o,key),id:key};
   if(!saved.saved)return true;
   const result=C.finalizeAgent(o,saved.id);
   if(result.ok){location.hash="#/agents/"+result.id;return true;}
   const missing=result.missing||[];
   const locs={name:"название",type:"агента",task:"инструкции"};
   const msg=loc==="ru"?"Заполните: "+missing.map(k=>locs[k]||k).join(", "):"Complete: "+missing.join(", ");
   const alert=document.querySelector("[data-editor-error]");
   if(alert){alert.textContent=msg;alert.hidden=false;}
   const field=missing.includes("name")?'[data-editor-input="name"]':missing.includes("type")?"#ae-block-2":'[data-editor-input="task"]';
   document.querySelector(field)?.scrollIntoView({block:"center",behavior:"smooth"});
   return true;
 }
 if(action==="open-examples"){document.querySelector("[data-editor-modal-backdrop]")?.remove();document.querySelector(".shell").insertAdjacentHTML("beforeend",E.examplesModal(d,loc));document.querySelector(".ae-modal")?.focus();return true;}
 if(action==="close-examples"){document.querySelector("[data-editor-modal-backdrop]")?.remove();return true;}
 if(action==="example"){
   const field=el.dataset.field,p=E.preset(d,loc);
   if(!["company","task","handoff"].includes(field)||!p?.examples[field])return true;
   const textarea=document.querySelector('[data-editor-input="'+field+'"]');
   if(textarea){
     textarea.value=p.examples[field];
     if(persist(o,{[field]:textarea.value}).saved){
       textarea.focus({preventScroll:true});
       E.refresh(o,loc,icon);
     }
   }
   return true;
 }
 if(action==="reset-advanced"){
   if(!d.type)return true;
   const next={...(d.advancedRoleOverrides||{})};
   delete next[d.type];
   if(persist(o,{advancedRoleOverrides:next}).saved){
     const p=E.preset(d,loc);
     document.querySelectorAll("[data-editor-advanced]").forEach(input=>{
       input.value=p?.advanced[input.dataset.editorAdvanced]||"";
     });
   }
   return true;
 }
 if(action==="select-value"){
   const field=el.dataset.field;
   if(!["group","handoffTarget","communicationStyle"].includes(field))return true;
   const changed=persist(o,withRolePreference(d,{[field]:value}));
   if(changed.saved){
      document.querySelectorAll('[data-editor-dropdown="'+field+'"]').forEach(d=>{
        d.querySelector("summary span").textContent=el.textContent.trim();
        d.querySelectorAll("[data-editor-action='select-value']").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.value===value)));
        d.open=false;
      });
      E.refresh(o,loc,icon);
   }
   return true;
 }
 if(action==="test"){
   const res=key!=="new"?{saved:!!C.draft(o,key),id:key}:persist(o,{});
   if(res.saved)location.hash="#/agents/"+res.id+"/testing";
   return true;
 }
 return false;
}
function advancedInput(el,o,loc,icon){
  const field=el.dataset.editorAdvanced,d=E.model(o,E.id());
  if(!d.type||!["identity","workflow","restrictions","escalation"].includes(field))return false;
  const next={...(d.advancedRoleOverrides||{})};
  next[d.type]={...(next[d.type]||{}),[field]:el.value};
  const result=persist(o,{advancedRoleOverrides:next});
  if(result.saved)E.refresh(o,loc,icon);
  return result.saved;
}
E.input=input;E.advancedInput=advancedInput;E.search=search;E.click=click;E.renderRoles=renderRoles;
})();
