/* ===== 12 Nov replan: leaf counting, parent cards, pomodoros, estimates ===== */
let _pidC=null;
function parentIds(){if(!_pidC){const s=new Set();for(const t of Object.values(state.tasks||{}))if(t&&t.parent&&!t.cut&&!t.archived)s.add(t.parent);_pidC=s;Promise.resolve().then(()=>{_pidC=null;});}return _pidC;}
function isLeaf(t){return !!t&&!t.bucket&&!parentIds().has(t.id);}
function isBk(id){const t=state.tasks&&state.tasks[id];return !!(t&&t.bucket);}
function isParentId(id){return parentIds().has(id);}
function leafTasks(){return Object.entries(state.tasks||{}).map(([id,t])=>({id,...t})).filter(isLeaf);}
function kidsOf(id){return Object.entries(state.tasks||{}).map(([i,t])=>({id:i,...t})).filter(t=>t.parent===id&&!t.cut&&!t.archived).sort((a,b)=>(a.date||"").localeCompare(b.date||"")||(a.order||0)-(b.order||0));}
// estimates: "about 1 h", "about 1.5 h", "about 30 min"
function aboutH(m){m=Math.round(Number(m)||0);if(m<=0)return "";if(m<45)return "about "+m+" min";const h=Math.round(m/30)/2;return "about "+String(h)+" h";}
function pomN(m){return Math.round(m/50*10)/10;}
function pomS(m){return String(pomN(m));}
function planMins(d){return tasksOn(d).reduce((a,t)=>a+estMin(t),0);}
// ---- the day number: "3 of 8 pomodoros" with the minutes small, and the planned load ----
function v3dayNum(nm,wk,tg,d){nm.textContent="";nm.append(document.createTextNode("Work "+pomS(wk)+" of "+pomS(tg)+" pomodoros"+(wk>=tg?" · full day":"")+" "),el("small",{class:"v3-pmin",text:dur(wk)}));
  const f=nm.closest(".dbar-focus");if(!f)return;let pl=f.querySelector(".v3-planned");const pm=planMins(d);
  if(!pl){pl=el("span",{class:"hint v3-planned"});f.append(pl);}pl.hidden=!pm;pl.textContent=pm?"planned "+pomS(pm)+" of "+pomS(tg):"";}
// ---- Time hero in pomodoros ----
renderEntHero=function(items,total){const box=document.getElementById("entHero");if(!box)return;
  const adj=hoursAdj(sel)*60,worked=Math.max(0,total+adj),fri=isFriday(sel),plan=fri?0:v3dayMin(sel);
  const real=items.filter(x=>x.kind!=="event"&&x.kind!=="break"),learnM=unionMin(real.filter(isLearning)),workM=Math.min(unionMin(real.filter(isWorkEntry)),worked),brkM=items.filter(x=>x.kind==="break").reduce((a,x)=>a+Number(x.minutes||0),0),live=items.some(x=>x.live),scale=Math.max(plan,worked,1);
  const othM=Math.max(0,worked-workM-Math.min(learnM,worked));
  const seg=(cls,mm,t)=>mm>0?el("span",{class:"eh-seg "+cls,style:"width:"+(mm/scale*100)+"%",title:t+": "+dur(mm)}):null;
  const bar=el("div",{class:"eh-bar",role:"img","aria-label":pomS(worked)+" pomodoros, work "+pomS(workM)+(plan?" of "+pomS(plan):"")},...[seg("work",workM,"Work"),seg("learn",Math.min(learnM,worked),"Learning"),seg("oth",othM,"Other"),seg("brk",brkM,"Breaks")].filter(Boolean));
  const pct=plan?Math.round(workM/plan*100):null,stat=(cls,label,mm)=>el("span",{class:"eh-k"},el("i",{class:"eh-sw "+cls}),label+" ",el("b",{class:"num",text:dur(mm)}));
  rc(box,el("div",{class:"eh-top"},el("div",{class:"eh-big"},el("b",{class:"num",text:pomS(worked)}),el("span",{class:"eh-lbl",text:"pomodoros in total"+(sel===iso(new Date())?" today":" on "+fmt(sel,{weekday:"short",day:"numeric",month:"short"}))+(live?" · live":"")}),el("small",{class:"hint v3-pmin",text:dur(worked)})),
      plan?el("div",{class:"eh-pct"},el("b",{class:"num",text:pct+"%"}),el("span",{class:"hint v3-edtarget",role:"button",tabindex:"0",title:"Change the day target",onclick:dayTargetSheet,onkeydown:e=>{if(e.key==="Enter")dayTargetSheet();},text:"Work "+pomS(workM)+" of "+pomS(plan)+" pomodoros"})):el("div",{class:"eh-pct"},el("span",{class:"hint",text:"Friday: rest day"}))),bar,
    el("div",{class:"eh-keys"},stat("work","Work",workM),stat("learn","Learning",Math.min(learnM,worked)),othM?stat("oth","Other",othM):null,brkM?stat("brk","Breaks",brkM):null,adj?el("span",{class:"hint",text:(adj>0?"+":"-")+dur(Math.abs(adj))+" adjusted by hand"}):null));};
// ---- parent cards: Today shows a parent with the steps dated today, never a step on its own ----
function slotRank(cat){return cat==="portfolio"||cat==="client"?0:cat==="learning"?1:cat==="linkedin"?2:3;}
// work = portfolio or client only
function isWorkEntry(x){if(!x||x.kind==="event"||x.kind==="break")return false;let c=x.cat;if(!c&&typeof x.ref==="string"&&x.ref.startsWith("tasks:")){const t=state.tasks[x.ref.slice(6)];c=t&&t.cat;}return c==="portfolio"||c==="client";}
function v3workMin(d){const it=entriesOn(d).filter(x=>!isEstimate(x)).concat(liveItems(d)).filter(isWorkEntry);return Math.max(0,unionMin(it));}
function cardsOn(d){const groups=new Map();
  tasksOn(d).forEach(l=>{const p=l.parent&&state.tasks[l.parent]&&!state.tasks[l.parent].bucket&&!state.tasks[l.parent].cut&&!state.tasks[l.parent].archived?l.parent:null,key=p||l.id;
    if(!groups.has(key))groups.set(key,{key,p,steps:[]});groups.get(key).steps.push(l);});
  return [...groups.values()].map(g=>{if(!g.p)return {...g.steps[0],rank:slotRank(g.steps[0].cat)};
    const P=state.tasks[g.p],steps=g.steps.sort((a,b)=>(a.order||0)-(b.order||0));
    return {...P,id:g.p,steps,_card:true,date:d,cat:P.cat||steps[0].cat,mins:steps.reduce((a,s)=>a+estMin(s),0),done:steps.every(s=>s.done),order:Math.min(...steps.map(s=>s.order||0)),rank:slotRank(P.cat||steps[0].cat)};});}
sortedTasks=function(){return cardsOn(sel).sort((a,b)=>{const pa=a.pos!=null,pb=b.pos!=null;if(pa&&pb)return a.pos-b.pos;if(pa!==pb)return pa?-1:1;return (a.rank-b.rank)||((a.order||0)-(b.order||0));});};
// a parent card done or moved means: the steps of the shown day
{const _sd=setDone,_mv=moveTaskTo,sync=pid=>{const P=state.tasks[pid];if(!P||P.bucket)return;const ks=kidsOf(pid),all=ks.length&&ks.every(k=>k.done);if(!!P.done!==!!all){state.tasks[pid]={...P,done:!!all,doneAt:all?sel:null};try{setTask(pid,{done:!!all,doneAt:all?sel:null});}catch(e){}}};
  setDone=function(id,on){const t=state.tasks[id];if(!t)return;if(isParentId(id)){on=!!on;kidsOf(id).filter(k=>k.date===sel&&!!k.done!==on).forEach(k=>_sd(k.id,on));sync(id);render();return;}
    _sd(id,on);if(t.parent)sync(t.parent);};
  moveTaskTo=function(id,d){const t=state.tasks[id];if(!t)return;if(isParentId(id)){const ks=kidsOf(id).filter(k=>k.date===sel&&!k.done);if(!ks.length){toast("Nothing to move");return;}ks.forEach(k=>_mv(k.id,d));return;}_mv(id,d);};}
// Start: War with the parent's steps (today's open steps, else all open steps)
function cardSteps(id){const ks=kidsOf(id).filter(k=>!k.done),td=ks.filter(k=>k.date===sel);return td.length?td:ks;}
{const _wp=warPool;warPool=function(tg){if(tg&&tg.k==="task"&&isParentId(tg.v)){return cardSteps(tg.v);}return _wp(tg);};}
v3start=function(id){if(isParentId(id)){const ids=cardSteps(id).map(x=>x.id);if(!ids.length){toast("Nothing left in this card");return;}
    const w=warGet();if(w){w.ids=ids.concat(w.ids.filter(x=>!ids.includes(x)));warPut(w);warOpen();toast("Added to the war on "+w.label);return;}warSetup({task:id});return;}
  if(warGet()){const w=warGet();if(!w.ids.includes(id)){w.ids.unshift(id);warPut(w);}else{w.ids=[id].concat(w.ids.filter(x=>x!==id));warPut(w);}warOpen();toast("Added to the war on "+w.label);return;}warSetup({task:id});};
// the card itself: header with estimate, steps as tick boxes
{const _vc=v3card;v3card=function(t,top,ctx){const c=_vc(t,top,ctx);try{const head=c.querySelector(".cs-head");if(!head)return c;
    if(t.cat==="linkedin"&&window.__liDay){const h=c.querySelector(".cs-t");if(h&&!h.dataset.li){h.dataset.li="1";h.classList.add("li-open");h.setAttribute("role","button");h.addEventListener("pointerdown",e=>e.stopPropagation());h.addEventListener("click",e=>{e.stopPropagation();window.__liDay(sel);});}}
    const est=aboutH(t._card?t.mins:(Number(t.mins)>0?t.mins:estMin(t)));if(est)head.insertBefore(el("span",{class:"hint cs-est",text:est}),head.querySelector(".cl-det"));
    if(t.steps){const showD=cutDesc===t.id;const ul=el("ul",{class:"cs-steps"},...t.steps.map(s=>{const cb=el("input",{type:"checkbox","aria-label":"Done: "+s.title});cb.checked=!!s.done;cb.onchange=()=>{setDone(s.id,cb.checked);};
        cb.addEventListener("pointerdown",e=>e.stopPropagation());
        const li=(()=>{const tt=el("span",{class:"cs-step-t",text:s.title});if(s.cat==="linkedin"&&window.__liDay){tt.classList.add("li-open");tt.setAttribute("role","button");tt.title="Open today's LinkedIn post";tt.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();window.__liDay(sel);});}
        const l=el("li",{class:"cs-step"+(s.done?" done":"")},el("label",{class:"cs-step-l"},cb,tt,el("span",{class:"hint cs-est",text:aboutH(estMin(s))})),showD&&(s.note||s.desc)?el("p",{class:"cl-d",text:String(s.note||s.desc)}):null);if(!s.done)v3stepSwipe(l,s);return l;})();return li;}));
      head.after(ul);}
  }catch(e){console.warn(e);}return c;};}

/* ===== 13 Nov: one Reschedule for every task, step, parent and project ===== */
const rsDl=d=>fmt(d,{weekday:"short",day:"numeric",month:"short"});
const rsDiff=(a,b)=>Math.round((parse(b)-parse(a))/864e5);
function rsNextSat(){let d=addDays(iso(new Date()),1);while(parse(d).getDay()!==6)d=addDays(d,1);return d;}
// ctx: "card" (a parent card on Today, base = shown day), anything else = the item's own date
function rsBase(id,ctx){const t=state.tasks[id];return ctx==="card"&&kidsOf(id).length?sel:(t.date||sel);}
function rsApply(id,d,ctx,withSteps){const t=state.tasks[id];if(!t)return;const rec=v3rec(),base=rsBase(id,ctx),off=rsDiff(base,d),kids=kidsOf(id),pids={};
  const mv=(i,nd)=>{const x=state.tasks[i];if(!x||x.date===nd)return;if(!rec.moves.some(m=>m.id===i))rec.moves.push({id:i,date:x.date,sprint:x.sprint,moved:x.moved||0});
    const sp=v3spOf(nd),p={date:nd,moved:(x.moved||0)+1,sprint:sp?sp.n:null};state.tasks[i]={...x,...p};setTask(i,p);};
  if(kids.length){
    if(ctx==="card"){kids.filter(k=>k.date===base&&!k.done).forEach(k=>mv(k.id,d));if(withSteps)kids.filter(k=>k.date!==base&&!k.done&&k.date).forEach(k=>mv(k.id,addDays(k.date,off)));rec.parents[id]=null;v3syncParents(rec);}
    else{mv(id,d);if(withSteps){kids.filter(k=>!k.done&&k.date).forEach(k=>mv(k.id,addDays(k.date,off)));rec.parents[id]=null;v3syncParents(rec);}}
  }else{mv(id,d);if(t.parent){rec.parents[t.parent]=null;v3syncParents(rec);}}
  if(!rec.moves.length){toast("It stays on "+rsDl(d));return;}
  if(openTask)openTask=null;render();
  v3undoToast("Moved to "+rsDl(d)+": "+t.title,()=>{v3recUndo(rec);rec.moves.forEach(m=>{const x=state.tasks[m.id];if(x){state.tasks[m.id]={...x,moved:m.moved};setTask(m.id,{moved:m.moved});}});render();});
  psClose(true);}
function rsWarn(id,d,ctx,withSteps){const t=state.tasks[id],base=rsBase(id,ctx),from=v3spOf(base),to=v3spOf(d),w=[];
  if(isFriday(d))w.push("Friday is your rest day.");
  if(from&&to&&to.n!==from.n)w.push("This moves it into Sprint "+to.n+".");
  else if(from&&!to&&d>from.end)w.push("That is past the end of Sprint "+from.n+" ("+rsDl(from.end)+").");
  else if(!to&&spOn()&&spAny())w.push("That day is outside the sprints.");
  const go=()=>rsApply(id,d,ctx,withSteps);
  if(w.length)v3confirm(w.join(" ")+" Move to "+rsDl(d)+"?","Move",go);else go();}
function rsAsk(id,d,ctx){psOpen("Move its steps too?",re=>{const t=state.tasks[id],n=kidsOf(id).filter(k=>!k.done).length;
  return [el("p",{class:"ps-sh-sum",text:t.title}),el("p",{class:"hint",text:"Moving to "+rsDl(d)+". "+n+" open step"+(n===1?"":"s")+". Steps shift by the same number of days."}),
    el("button",{type:"button",class:"btn rs-steps-yes",onclick:()=>rsWarn(id,d,ctx,true)},"Move steps too"),
    el("button",{type:"button",class:"btn ghost rs-steps-no",onclick:()=>rsWarn(id,d,ctx,false)},ctx==="card"?"Only this day's steps":"Only the parent"),
    el("button",{type:"button",class:"btn ghost",onclick:()=>psClose(true)},"Cancel")];});}
function rsGo(id,d,ctx){const t=state.tasks[id];if(!t||!d)return;if(!/^\d{4}-\d{2}-\d{2}$/.test(d)){toast("Pick a date");return;}
  if(d===rsBase(id,ctx)){toast("It stays on "+rsDl(d));return;}
  if(kidsOf(id).length)rsAsk(id,d,ctx);else rsWarn(id,d,ctx,false);}
function v3rs(id,ctx){if(!state.tasks[id])return;psOpen("Reschedule",re=>{const t=state.tasks[id];if(!t)return [el("p",{class:"ps-sh-sum",text:"This task is gone."})];
  const today=iso(new Date()),base=rsBase(id,ctx),sp=v3spOf(base),kids=kidsOf(id).length;
  const picks=[["Tomorrow",v3skipFri(addDays(today,1))],["Next Sat",rsNextSat()],["+1 week",addDays(base,7)]];
  const di=el("input",{type:"date",class:"tt-in v3-date rs-date","aria-label":"New day",value:base});
  di.addEventListener("change",()=>{if(di.value)setTimeout(()=>rsGo(id,di.value,ctx),30);});
  return [el("p",{class:"ps-sh-sum",text:t.title}),el("p",{class:"hint",text:"Now on "+rsDl(base)+(sp?". Sprint "+sp.n+" ends "+rsDl(sp.end)+". Moving past it asks first.":". Outside the sprints.")+(kids?" It has steps, so you will be asked about them.":"")}),
    el("div",{class:"v3-cats"},...picks.map(([n,d])=>el("button",{type:"button",class:"cat-chip v3-rs rs-pick","data-d":d,onclick:()=>rsGo(id,d,ctx)},n+" · "+rsDl(d)))),
    el("label",{class:"field"},el("span",{class:"label",text:"Pick any date"}),di)];});}
v3stepResched=function(id){v3rs(id,"step");};
v3resched=function(id){v3rs(id,"task");};
// one gesture set everywhere: swipe left = reschedule, swipe right = done, hold = quick menu (same menu as the ... button), drag bars in the waterfall
function rsLong(node,fn){let tm=null,x0=0,y0=0,fired=false;const stop=()=>{clearTimeout(tm);tm=null;};
  node.addEventListener("pointerdown",e=>{if(e.button>0||e.target.closest("input,textarea"))return;fired=false;x0=e.clientX;y0=e.clientY;stop();tm=setTimeout(()=>{tm=null;fired=true;if(navigator.vibrate)try{navigator.vibrate(12);}catch(_){}fn();},480);});
  node.addEventListener("pointermove",e=>{if(tm&&(Math.abs(e.clientX-x0)>8||Math.abs(e.clientY-y0)>8))stop();});
  ["pointerup","pointercancel","pointerleave"].forEach(ev=>node.addEventListener(ev,stop));
  node.addEventListener("click",e=>{if(fired){fired=false;e.stopPropagation();e.preventDefault();}},true);
  node.addEventListener("contextmenu",e=>e.preventDefault());}
{const _vc2=v3card;v3card=function(t,top,ctx){const c=_vc2(t,top,ctx);try{
    if(!t.done&&!c.dataset.rsl){c.dataset.rsl="1";rsLong(c,()=>v3taskMenu(t.id));}
    (t.steps||[]).forEach(s=>{const li=[...c.querySelectorAll(".cs-step")].find(x=>x.querySelector("input")&&x.querySelector("input").getAttribute("aria-label")==="Done: "+s.title);
      if(li&&!s.done&&!li.dataset.rsl){li.dataset.rsl="1";rsLong(li,()=>v3taskMenu(s.id));}});
  }catch(e){console.warn(e);}return c;};}
// one quiet hint, once
setTimeout(()=>{try{if(localStorage.getItem("sb-rs-hint"))return;localStorage.setItem("sb-rs-hint","1");toast("Tip: swipe left to reschedule, hold for more.");}catch(e){}},3000);
// waterfall: tap or drag a bar, tap an empty cell
{const _rw=renderWaterfall;renderWaterfall=function(){_rw();try{rsWf();}catch(e){console.warn(e);}};
  function rsWf(){const box=document.getElementById("wfBody");if(!box)return;
    box.querySelectorAll(".wf-cell[data-id]").forEach(c=>{c.classList.add("rs-cell");c.addEventListener("click",()=>{const id=c.dataset.id,d=c.dataset.d,t=state.tasks[id];if(!t||d===t.date)return;
      v3confirm("Move "+t.title+" to "+rsDl(d)+"?","Move here",()=>rsGo(id,d,"task"));});});
    box.querySelectorAll(".v3-wfrow").forEach(r=>{if(r.dataset.id&&!r.dataset.rsl){r.dataset.rsl="1";rsLong(r,()=>v3taskMenu(r.dataset.id));}});
    box.querySelectorAll(".wf-bar[data-id]").forEach(b=>{const id=b.dataset.id,t=state.tasks[id];if(!t)return;b.removeAttribute("aria-hidden");b.setAttribute("role","button");b.tabIndex=0;b.setAttribute("aria-label","Menu for "+t.title+". Tap for options, drag to another day.");b.style.touchAction="none";b.style.cursor="grab";b.classList.add("rs-bar");
      b.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();v3taskMenu(id);}});
      let x0=null,drag=false,lt=null;
      b.addEventListener("pointerdown",e=>{x0=e.clientX;drag=false;b._lp=false;clearTimeout(lt);lt=setTimeout(()=>{if(x0!=null&&!drag){b._lp=true;v3taskMenu(id);}},480);try{b.setPointerCapture(e.pointerId);}catch(_){}});
      b.addEventListener("pointermove",e=>{if(x0==null)return;const dx=e.clientX-x0;if(Math.abs(dx)>6){drag=true;clearTimeout(lt);}if(drag){window.__sbDragging=true;b.style.transform="translateX("+dx+"px)";b.style.opacity=".75";}});
      const end=e=>{clearTimeout(lt);if(x0==null)return;const wasDrag=drag;x0=null;drag=false;window.__sbDragging=false;b.style.transform="";b.style.opacity="";
        if(!wasDrag){if(!b._lp)v3taskMenu(id);b._lp=false;return;}
        const cell=[...box.querySelectorAll('.wf-cell[data-id="'+id+'"]')].find(c=>{const r=c.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right;});
        if(cell&&cell.dataset.d!==t.date)rsGo(id,cell.dataset.d,"task");};
      b.addEventListener("pointerup",end);b.addEventListener("pointercancel",()=>{x0=null;drag=false;window.__sbDragging=false;b.style.transform="";b.style.opacity="";});});}}
// projects: shift start and due together
function rsProject(p){psOpen("Reschedule",re=>{const q=state.projects[p.id]||p,base=q.due||q.start||iso(new Date()),today=iso(new Date());
  const go=d=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(d))return;if(d===base){toast("It stays on "+rsDl(d));return;}const off=rsDiff(base,d),prev={start:q.start||"",due:q.due||"",moved:q.moved||0},patch={moved:prev.moved+1};
    if(q.due)patch.due=d;if(q.start)patch.start=q.due?addDays(q.start,off):d;if(!q.due&&!q.start)patch.due=d;
    const put=pt=>{state.projects[p.id]={...state.projects[p.id],...pt};render();try{store.update("projects/"+p.id,pt);}catch(e){}};
    put(patch);psClose(true);v3undoToast("Moved to "+rsDl(d)+": "+q.name,()=>put(prev));};
  const di=el("input",{type:"date",class:"tt-in v3-date rs-date","aria-label":"New day",value:base});di.addEventListener("change",()=>{if(di.value)go(di.value);});
  return [el("p",{class:"ps-sh-sum",text:q.name}),el("p",{class:"hint",text:(q.due?"Due "+rsDl(q.due):q.start?"Starts "+rsDl(q.start):"No date yet")+". Start and due move together."}),
    el("div",{class:"v3-cats"},...[["Tomorrow",v3skipFri(addDays(today,1))],["Next Sat",rsNextSat()],["+1 week",addDays(base,7)]].map(([n,d])=>el("button",{type:"button",class:"cat-chip v3-rs rs-pick",onclick:()=>go(d)},n+" · "+rsDl(d)))),
    el("label",{class:"field"},el("span",{class:"label",text:"Pick any date"}),di)];});}
function rsProjBtn(p){return el("div",{class:"sh-sec"},el("button",{type:"button",class:"btn ghost rs-proj-btn",onclick:()=>{closeSheet();rsProject(p);}},"Reschedule"));}

function card_rs(t){render();v3rs(t.id,t._card?"card":"task");}
