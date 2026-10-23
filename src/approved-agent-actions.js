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
   ui.blank={name:"",description:"",group:"",type:null,task:"",company:"",handoff:"",handoffTarget:"",knowledge:[],connections:[],quickRules:[],communicationStyle:"friendly"};
 }
 return result;
}
function input(el,o,loc,icon){
 const key=el.dataset.editorInput;
 if(!["name","description","company","task","handoff","group","handoffTarget","communicationStyle"].includes(key))return false;
 const result=persist(o,{[key]:el.value});
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
   const oldPreset=E.preset(d,loc),nextPreset=globalThis.AIMockProfessionPresets.get(profession.id,loc);
   const selectedGroup=profession.category==="hr"?"HR":"Продажи";
   const currentRules=d.quickRules||[];
   const hadRole=Boolean(d.type);
   const sameDefaults=oldPreset&&currentRules.length===oldPreset.rules.length&&currentRules.every(rule=>oldPreset.rules.includes(rule));
   const patch={
     type:profession.id,
     ...(!d.group?{group:selectedGroup}:{}),
     ...(!d.handoffTarget?{handoffTarget:selectedGroup}:{})
   };
   if(nextPreset&&(!d.task||d.task===oldPreset?.task))patch.task=nextPreset.task;
   if(nextPreset&&(!hadRole||!currentRules.length||sameDefaults))patch.quickRules=[...nextPreset.rules];
   if(nextPreset&&(!hadRole||!d.communicationStyle||d.communicationStyle===oldPreset?.tone))patch.communicationStyle=nextPreset.tone;
   if(d.type!==profession.id)patch.knowledge=[];
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
     E.refresh(o,loc,icon);
   }
   return true;
 }
 if(action==="rule"){
   const rules=new Set(d.quickRules||[]);if(rules.has(value))rules.delete(value);else rules.add(value);
   const res=persist(o,{quickRules:[...rules]});
   if(res.saved){el.setAttribute("aria-pressed",String(rules.has(value)));E.refresh(o,loc,icon);}return true;
 }
 if(action==="knowledge"||action==="connection"){
   const k=action==="knowledge"?"knowledge":"connections";
   if(k==="connections"&&!o.integrations.some(i=>i.id===value&&i.status==="connected"))return true;
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
   const locs={name:"название",type:"профессию",task:"инструкции"};
   const msg=loc==="ru"?"Заполните: "+missing.map(k=>locs[k]||k).join(", "):"Complete: "+missing.join(", ");
   const alert=document.querySelector("[data-editor-error]");
   if(alert){alert.textContent=msg;alert.hidden=false;}
   const field=missing.includes("name")?'[data-editor-input="name"]':missing.includes("type")?"#ae-block-2":'[data-editor-input="task"]';
   document.querySelector(field)?.scrollIntoView({block:"center",behavior:"smooth"});
   return true;
 }
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
   const changed=persist(o,{[field]:value});
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
