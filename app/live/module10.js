// ===== Round 10: optional sprints. Settings > Use sprints (on or off, Undo). Off: dates stand alone, no sprint stamp, sprint views hidden, rollover and Spread use every working day. A day outside any sprint is a normal day. =====
// Serves flexibility: a date is a plan, a sprint is a container he can leave out; nothing blocks a move.
function spOn(){const u=state.settings&&state.settings.sprintUse;return !(u&&u.off);}
function spAny(){return Object.keys(state.sprints||{}).length>0;}
function spUseSave(off){const old=(state.settings||{}).sprintUse||null,v={off:!!off,at:Date.now()};state.settings={...(state.settings||{}),sprintUse:v};
  try{store.set("settings/sprintUse",v);}catch(e){fail(e);}
  v3undoToast(off?"Sprints are off. Dates stand on their own.":"Sprints are on.",()=>{const s={...(state.settings||{})};if(old){s.sprintUse=old;try{store.set("settings/sprintUse",old);}catch(e){}}else{delete s.sprintUse;try{store.set("settings/sprintUse",{off:false,at:Date.now()});}catch(e){}}state.settings=s;render();});render();}
function spUseRow(){const rows=document.querySelector('.page[data-page="settings"] .set-rows');if(!rows)return;let r=document.getElementById("spUseRow");const on=spOn();
  if(!r){r=el("div",{class:"set-row",id:"spUseRow"});const a=document.getElementById("spCfgRow");if(a)a.before(r);else rows.append(r);}
  rc(r,el("div",{},el("b",{text:"Use sprints"}),el("span",{class:"hint",id:"spUseSum",text:on?"On: work is grouped in sprints with buffer days":"Off: dates stand on their own, no sprint views"})),
    el("button",{type:"button",class:"btn ghost",id:"spUseBtn","aria-pressed":String(on),onclick:()=>spUseSave(on)},on?"Turn off":"Turn on"));}
// no sprint stamp on a date that no sprint covers (or when sprints are off)
{const _s=setTask;setTask=function(id,patch){try{if(patch&&typeof patch.date==="string"&&!v3spOf(patch.date)&&patch.sprint!==null){patch={...patch,sprint:null};if(state.tasks[id])state.tasks[id]={...state.tasks[id],sprint:null};}}catch(e){console.warn(e);}return _s.call(this,id,patch);};}
{const _r=render;render=function(){_r();try{const on=spOn();document.body.classList.toggle("sp-off",!on);spUseRow();
    if(!on){const c=document.getElementById("headChips");if(c)[...c.children].forEach(x=>{const t=x.textContent||"";if(/^Sprint \d/.test(t)||/days left$/.test(t)||t==="Sprint review day")x.hidden=true;});
      const n=document.querySelector(".sp-note");if(n)n.remove();}}catch(e){console.warn(e);}};}
window.__sp10={on:spOn,save:spUseSave,rs:(id,c)=>v3rs(id,c)};
