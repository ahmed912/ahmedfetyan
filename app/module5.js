/* ===== 12 Nov replan: leaf counting, parent cards, pomodoros, estimates ===== */
let _pidC=null;
function parentIds(){if(!_pidC){const s=new Set();for(const t of Object.values(state.tasks||{}))if(t&&t.parent&&!t.cut&&!t.archived)s.add(t.parent);_pidC=s;Promise.resolve().then(()=>{_pidC=null;});}return _pidC;}
function isLeaf(t){return !!t&&!parentIds().has(t.id);}
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
  const adj=hoursAdj(sel)*60,worked=Math.max(0,total+adj),fri=isFriday(sel),plan=fri?0:v3dayMin();
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
  tasksOn(d).forEach(l=>{const p=l.parent&&state.tasks[l.parent]&&!state.tasks[l.parent].cut&&!state.tasks[l.parent].archived?l.parent:null,key=p||l.id;
    if(!groups.has(key))groups.set(key,{key,p,steps:[]});groups.get(key).steps.push(l);});
  return [...groups.values()].map(g=>{if(!g.p)return {...g.steps[0],rank:slotRank(g.steps[0].cat)};
    const P=state.tasks[g.p],steps=g.steps.sort((a,b)=>(a.order||0)-(b.order||0));
    return {...P,id:g.p,steps,_card:true,date:d,cat:P.cat||steps[0].cat,mins:steps.reduce((a,s)=>a+estMin(s),0),done:steps.every(s=>s.done),order:Math.min(...steps.map(s=>s.order||0)),rank:slotRank(P.cat||steps[0].cat)};});}
sortedTasks=function(){return cardsOn(sel).sort((a,b)=>{const pa=a.pos!=null,pb=b.pos!=null;if(pa&&pb)return a.pos-b.pos;if(pa!==pb)return pa?-1:1;return (a.rank-b.rank)||((a.order||0)-(b.order||0));});};
// a parent card done or moved means: the steps of the shown day
{const _sd=setDone,_mv=moveTaskTo,sync=pid=>{const P=state.tasks[pid];if(!P)return;const ks=kidsOf(pid),all=ks.length&&ks.every(k=>k.done);if(!!P.done!==!!all){state.tasks[pid]={...P,done:!!all,doneAt:all?sel:null};try{setTask(pid,{done:!!all,doneAt:all?sel:null});}catch(e){}}};
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
