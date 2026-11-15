// ===== Round 56: bucket tasks. Hold and drag to reorder (same order as Today cards and the waterfall, Undo), swipe left = Schedule (date picker only), swipe right = Done or Archive, archived tasks in a collapsed "Archived n" row with Restore. Every change goes through bkCommit so Today, waterfall, sprint counts and Review repaint at once, also for buckets outside the current sprint. =====
let bkArchOpen={};
// the one shared state path for bucket changes: write the task, keep its sprint in step with its day, repaint everything once, offer Undo
function bkApplyCh(ch){Object.keys(ch).forEach(id=>{const t=state.tasks[id];if(!t)return;const p={...ch[id]};if(p.date&&p.sprint===undefined&&!t.bucket){try{p.sprint=sprintFor(p.date).n;}catch(e){}}state.tasks[id]={...t,...p};setTask(id,p);});}
function bkCommit(ch,msg){const old={};Object.keys(ch).forEach(id=>{const t=state.tasks[id];if(!t)return;old[id]={};Object.keys(ch[id]).forEach(k=>{old[id][k]=t[k]===undefined?null:t[k];});});
  bkApplyCh(ch);render();if(msg)v3undoToast(msg,()=>{bkApplyCh(old);render();});}
// a task given a new day anywhere (edit sheet, reschedule, add) always carries the sprint of that day
{const _pt=patchTask;patchTask=function(id,patch){try{const t=state.tasks[id];if(patch&&patch.date&&patch.sprint===undefined&&t&&!t.bucket&&/^\d{4}-\d{2}-\d{2}$/.test(patch.date)){const n=sprintFor(patch.date).n;if(t.sprint!==n)patch={...patch,sprint:n};}}catch(e){}return _pt.call(this,id,patch);};}
// saved order: the same pos field Today cards and the waterfall sort by. The moved tasks reuse their own slots so other buckets keep their place.
function bkReorder(shown,open){const rest=open.filter(t=>!shown.includes(t.id)).map(t=>t.id),all=shown.concat(rest).filter(i=>state.tasks[i]);
  const pool=all.map(i=>v3pos(state.tasks[i])).sort((a,b)=>a-b);for(let i=1;i<pool.length;i++)if(pool[i]<=pool[i-1])pool[i]=pool[i-1]+0.001;
  const ch={};all.forEach((id,k)=>{if(state.tasks[id].pos!==pool[k])ch[id]={pos:pool[k]};});
  if(Object.keys(ch).length)bkCommit(ch,"Order changed");}
function bkWire(ul,open,re){if(!ul)return;const shown=[...ul.querySelectorAll(".bk-row")].map(x=>x.dataset.id);if(!shown.length)return;
  v3dragList(ul,".bk-row",ids=>{ul.querySelectorAll(".bk-row").forEach(r=>{try{r.dispatchEvent(new PointerEvent("pointercancel"));}catch(e){}});/* the lift stops pointerup, so the swipe on the same row is released here */const held=[...ul.querySelectorAll(".bk-row[data-dragged]")].sort((a,b)=>Number(b.dataset.dragged)-Number(a.dataset.dragged))[0];
    if(ids.join()===shown.join()){if(held)setTimeout(()=>v3taskMenu(held.dataset.id),0);return;}
    bkReorder(ids,open);if(re&&re!==render)setTimeout(re,60);});}
// mouse: a quick drag still moves the task to another bucket, a hold lifts it for reordering
function bkGuard(li){let tm=null,px=0,py=0,lx=0,ly=0;li.addEventListener("pointermove",e=>{lx=e.clientX;ly=e.clientY;},true);
  li.addEventListener("dragstart",e=>{if(Math.abs(lx-px)>Math.abs(ly-py)*1.2){e.preventDefault();e.stopImmediatePropagation();}},true);
  li.addEventListener("pointerdown",e=>{px=lx=e.clientX;py=ly=e.clientY;if(e.pointerType==="touch")return;clearTimeout(tm);tm=setTimeout(()=>{li.draggable=false;},360);});
  const back=()=>{clearTimeout(tm);setTimeout(()=>{li.draggable=true;},0);};["pointerup","pointercancel"].forEach(ev=>li.addEventListener(ev,back,true));}
function bkHints(li){li.append(el("span",{class:"bk-hint bk-hr","aria-hidden":"true",text:"Done  Archive"}),el("span",{class:"bk-hint bk-hl","aria-hidden":"true",text:"Schedule"}));}
// swipe left: only the date
function bkSchedule(id){if(!state.tasks[id])return;psOpen("Schedule",re=>{const t=state.tasks[id];if(!t)return [el("p",{class:"ps-sh-sum",text:"This task is gone."})];
  const base=t.date||iso(new Date()),di=el("input",{type:"date",class:"tt-in v3-date rs-date","aria-label":"New day",value:base});
  di.addEventListener("change",()=>{if(di.value)setTimeout(()=>rsGo(id,di.value,"task"),30);});
  return [el("p",{class:"ps-sh-sum",text:t.title}),el("p",{class:"hint",text:t.date?"Now on "+rsDl(t.date):"No date yet"}),el("label",{class:"field mv-date"},el("span",{class:"label",text:"Pick a date"}),di)];});}
// swipe right: Done and Archive as a pair
function bkPair(id){const t=state.tasks[id];if(!t)return;psOpen("Done or archive",re=>[el("p",{class:"ps-sh-sum",text:t.title}),
  el("div",{class:"v3-row bk-pair"},el("button",{type:"button",class:"btn bk-p-done",onclick:()=>{psClose(true);bkCommit({[id]:{done:true,doneAt:Date.now()}},"Done: "+t.title);}},"Done"),
    el("button",{type:"button",class:"btn ghost bk-p-arch",onclick:()=>{psClose(true);v3archive(id,true);}},"Archive"))]);}
// archived tasks of a bucket: one quiet collapsed row
function bkArchRow(bid,re){const L=Object.entries(state.tasks||{}).filter(([i,t])=>t&&!t.bucket&&(bid==="none"?!t.parent:t.parent===bid)&&t.archived&&!t.deleted&&!t.archivedBy&&t.title).map(([id,t])=>({id,...t}));if(!L.length)return null;
  const on=!!bkArchOpen[bid];
  return el("div",{class:"bk-arch"},el("button",{type:"button",class:"hint bk-link bk-arch-b","aria-expanded":String(on),onclick:()=>{bkArchOpen[bid]=!on;re();}},"Archived "+L.length),
    on?el("ul",{class:"bk-arch-l"},...L.map(t=>el("li",{class:"bk-arow"},el("span",{class:"bk-arch-t",text:t.title}),el("button",{type:"button",class:"mini bk-restore","aria-label":"Restore "+t.title,onclick:()=>{v3archive(t.id,false);setTimeout(re,120);}},"Restore")))):null);}
{const _bc=bkCard;bkCard=function(b){const c=_bc(b);try{const id=b?b.id:"none",kids=(b?bkKids(b.id):bkLoose()).sort(bkSort),open=kids.filter(k=>!k.done);
  bkWire(c.querySelector(".bk-list"),open,render);const ar=bkArchRow(id,render),add=c.querySelector(".bk-add");if(ar&&add)add.before(ar);}catch(e){console.warn(e);}return c;};}
window.__u56={tasks:()=>state.tasks,commit:bkCommit};
