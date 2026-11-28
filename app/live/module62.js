// module62 item 26: execution is not the plan (no sprint context on Today and the board, row buttons, inline subtasks, slim menu)
let x26AddId=null,x26AddVal="";
function x26Exec(){if(document.body.classList.contains("m33"))return false;return page==="roadmap"||(page==="today"&&typeof rmTodayOn==="function"&&rmTodayOn());}
function x26Hidden(t){if(!t||!t.sub||!t.parent)return false;const p=state.tasks[t.parent];return !!(p&&!p.cut&&!p.archived);}
{const _tt=rmTodayTasks;rmTodayTasks=function(d){const L=_tt(d),k=t=>!x26Hidden(t);return {due:L.due.filter(k),early:L.early.filter(k),done:L.done.filter(k)};};}
{const _rt=rmTaskRow;rmTaskRow=function(t,opt){const li=_rt(t,opt);try{x26Row(li,t,opt||{});}catch(e){console.warn(e);}return li;};}
function x26Row(li,t,opt){const id=t.id,tt=li.querySelector(".rm-tt");if(tt)tt.dataset.rn=id;
  if(opt.branch)rsLong(li,()=>v3taskMenu(id));
  if(t.done)return;
  const mid=li.querySelector(":scope > div");
  li.append(el("div",{class:"x26-acts"},
    el("button",{type:"button",class:"x26-start","aria-label":"Start: "+(t.title||""),onclick:e=>{e.stopPropagation();v3start(id);}},"Start"),
    el("button",{type:"button",class:"x26-x","aria-label":"Delete: "+(t.title||""),onclick:e=>{e.stopPropagation();v3delete(id);}},"×")));
  const subs=subsOf(id),open=subs.filter(s=>!s.done),dn=subs.filter(s=>s.done);
  if(!subs.length&&x26AddId!==id)return;
  const ul=el("ul",{class:"x26-subs","data-for":id});
  open.concat(dn).forEach(s=>ul.append(x26SubRow(s)));
  if(x26AddId===id)ul.append(x26AddRow(id));
  (mid||li).append(ul);}
function x26SubRow(s){return el("li",{class:"x26-srow"+(s.done?" done":""),"data-id":s.id},
  el("button",{type:"button",class:"x26-scheck","aria-label":"Mark done: "+(s.title||""),"aria-pressed":String(!!s.done),onclick:e=>{e.stopPropagation();const on=!s.done;ckTick(s.id,on);if(on)v3undoToast("Done: "+s.title,()=>ckTick(s.id,false));}}),
  el("span",{class:"x26-stt",dir:"auto",text:s.title||""}),
  el("button",{type:"button",class:"x26-x","aria-label":"Delete: "+(s.title||""),onclick:e=>{e.stopPropagation();v3delete(s.id);}},"×"));}
function x26AddRow(id){const inp=el("input",{type:"text",class:"x26-sin","data-for":id,dir:"auto",placeholder:"Subtask","aria-label":"New subtask",value:x26AddVal});
  ["pointerdown","click"].forEach(ev=>inp.addEventListener(ev,e=>e.stopPropagation()));
  inp.addEventListener("input",()=>{x26AddVal=inp.value;});
  inp.addEventListener("keydown",async e=>{e.stopPropagation();
    if(e.key==="Escape"){x26AddId=null;x26AddVal="";render();return;}
    if(e.key==="Enter"){const v=inp.value.trim();if(!v)return;x26AddVal="";inp.value="";try{await ckAdd(id,v);}catch(err){fail(err);}render();}});
  inp.addEventListener("blur",()=>setTimeout(()=>{const a=document.activeElement;if(a&&a.classList.contains("x26-sin"))return;if(!x26AddVal.trim()){x26AddId=null;render();}},150));
  return el("li",{class:"x26-sadd"},inp);}
{const _tm=v3taskMenu;v3taskMenu=function(id){const t=state.tasks[id];if(t&&!t.bucket&&x26Exec())return x26Menu(id);return _tm(id);};}
function x26Menu(id){psOpen("Task",re=>{const t=state.tasks[id];if(!t)return [el("p",{class:"ps-sh-sum",text:"This task is gone."})];
  return [el("p",{class:"ps-sh-sum",text:t.title}),el("div",{class:"tm-list"},
    el("button",{type:"button",class:"tm-row x26-rn",onclick:()=>{psClose(true);setTimeout(()=>rnStart(id),60);}},"Rename"),
    el("button",{type:"button",class:"tm-row x26-date",onclick:()=>{psClose(true);x26Date(id);}},"Date"),
    el("button",{type:"button",class:"tm-row x26-addsub",onclick:()=>{psClose(true);x26AddId=id;x26AddVal="";render();}},"Add subtask"))];});}
try{if(window.__u)window.__u.v3taskMenu=v3taskMenu;}catch(e){}
function x26Date(id){psOpen("Date",re=>{const t=state.tasks[id];if(!t)return [];const today=iso(new Date()),tm=addDays(today,1);
  const set=d=>{const old=t.due||null;psClose(true);if(old===d)return;patchTask(id,{due:d});v3undoToast((d?plDue(d):"No date")+": "+t.title,()=>patchTask(id,{due:old}));};
  const di=el("input",{type:"date",class:"tt-in v3-date x26-din","aria-label":"Due date",value:t.due||""});
  di.addEventListener("change",()=>{if(di.value)setTimeout(()=>set(di.value),30);});
  return [el("p",{class:"ps-sh-sum",text:t.title}),
    el("div",{class:"mv-list"},el("button",{type:"button",class:"btn mv-choice x26-d","data-d":today,onclick:()=>set(today)},"Today"),el("button",{type:"button",class:"btn ghost mv-choice x26-d","data-d":tm,onclick:()=>set(tm)},"Tomorrow")),
    el("label",{class:"field mv-date"},el("span",{class:"label",text:"Pick a date"}),di),
    t.due?el("button",{type:"button",class:"btn ghost x26-nodate",onclick:()=>set(null)},"No date"):null].filter(Boolean);});}
{const _b=rmBoard;rmBoard=function(){const a=document.activeElement;if(a&&a.classList&&a.classList.contains("rn-in")&&a.closest("#rmBody"))return;return _b.apply(this,arguments);};}
{const _t=rmToday;rmToday=function(){const a=document.activeElement;if(a&&a.classList&&a.classList.contains("rn-in")&&a.closest("#rmToday"))return;return _t.apply(this,arguments);};}
{const _r=render;render=function(){_r();try{
  const c=document.getElementById("headChips");if(c)[...c.children].forEach(x=>{const s=(x.textContent||"").trim();x.classList.toggle("x26-sp",/^Sprint \d/.test(s)||/days left$/.test(s)||s==="Sprint review day");});
  if(x26AddId){const i=[...document.querySelectorAll('.x26-sin[data-for="'+x26AddId+'"]')].find(n=>n.offsetParent!==null);
    if(i&&document.activeElement!==i){i.focus();try{i.setSelectionRange(i.value.length,i.value.length);}catch(e){}}
    if(!i&&!document.querySelector(".x26-sin"))x26AddId=null;}
}catch(e){console.warn(e);}};}
window.__x26={exec:x26Exec,hidden:x26Hidden,menu:x26Menu,date:x26Date};
