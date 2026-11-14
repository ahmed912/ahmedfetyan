// ===== Round 14: recurring tasks. A task can repeat (daily, working days, weekly, every 2 weeks, monthly). Only one live copy exists: finishing it creates the next one, in the same block and mode, so it joins the same chunk each time. =====
// Serves procrastination (the routine is already there, nothing to re-plan), overwhelm (one live copy, never a wall of missed repeats) and flexibility (skip one, change or stop in a tap, with Undo).
const REC_T=[["daily","Every day"],["weekdays","Every working day"],["weekly","Every week"],["biweekly","Every 2 weeks"],["monthly","Every month"]];
const recName=r=>{const x=r&&REC_T.find(a=>a[0]===r.type);return x?x[1]:"";};
const recShift=(d,t)=>(isFriday(d)&&modeOf(t)!=="shallow")?addDays(d,1):d;
// the first matching day strictly after base; Friday is the rest day, so deep and learning copies move to Saturday
function recNextDate(t,base){const r=t.rec;if(!r)return null;const an=r.anchor||t.date||base;let d;
  if(r.type==="daily")d=addDays(base,1);
  else if(r.type==="weekdays"){d=addDays(base,1);while(isFriday(d))d=addDays(d,1);}
  else if(r.type==="weekly"){d=addDays(base,1);while(parse(d).getDay()!==parse(an).getDay())d=addDays(d,1);}
  else if(r.type==="biweekly"){d=an;while(d<=base)d=addDays(d,14);}
  else if(r.type==="monthly"){const dom=parse(an).getDate();let y=parse(base).getFullYear(),m=parse(base).getMonth();for(let i=0;i<14;i++){const last=new Date(y,m+1,0).getDate(),c=iso(new Date(y,m,Math.min(dom,last)));if(c>base){d=c;break;}m++;if(m>11){m=0;y++;}}}
  else return null;
  return d?recShift(d,t):null;}
const recBase=t=>{const today=iso(new Date());return t.date&&t.date>today?t.date:today;};
function recId(t,nd){return "rc-"+(t.recOf||t.id)+"-"+nd;}
function recCopy(t,nd){const c={title:t.title,cat:t.cat||null,mins:t.mins||null,date:nd,done:false,rec:t.rec,recOf:t.recOf||t.id,order:t.order||0};
  ["parent","slot","block","mode","pri","desc","due"].forEach(k=>{if(t[k]!==undefined&&t[k]!==null&&k!=="due")c[k]=t[k];});
  const sp=rlSpN(nd);c.sprint=sp!=null?sp:null;
  return c;}
async function recSpawn(id){const t=state.tasks[id];if(!t||!t.rec||t.recNext)return null;const nd=recNextDate({...t,id},recBase(t));if(!nd)return null;
  const nid=recId({...t,id},nd),body=recCopy({...t,id},nd);
  if(!state.tasks[nid]){state.tasks[nid]=body;try{await store.set("tasks/"+nid,body);}catch(e){console.warn(e);}}
  try{for(const x of ckList({...t,id}).filter(x=>!x.legacy)){const sb={title:x.t,cat:t.cat||null,parent:nid,sub:true,done:false,order:x.o,date:nd,sprint:body.sprint};const r=await store.add("tasks",sb);state.tasks[r.id]=sb;}}catch(e){console.warn(e);}
  state.tasks[id]={...state.tasks[id],recNext:nid};try{await setTask(id,{recNext:nid});}catch(e){}return nid;}
async function recUnspawn(id){const t=state.tasks[id];if(!t||!t.recNext)return;const n=state.tasks[t.recNext];
  if(n&&!n.done&&n.rec){delete state.tasks[t.recNext];try{await store.del("tasks/"+t.recNext);}catch(e){}}
  const x={...state.tasks[id]};delete x.recNext;state.tasks[id]=x;try{await setTask(id,{recNext:null});}catch(e){}}
let recBusy=false;
function recSync(){if(recBusy)return;const L=state.loaded||{};if(!L.tasks)return;const ids=Object.keys(state.tasks||{});let did=false;
  for(const id of ids){const t=state.tasks[id];if(!t||!t.rec||t.bucket||t.cut)continue;
    if(t.done&&!t.recNext&&!t.archived){recBusy=true;did=true;recSpawn(id).then(n=>{recBusy=false;if(n)render();}).catch(()=>{recBusy=false;});break;}
    if(!t.done&&t.recNext){recBusy=true;did=true;recUnspawn(id).then(()=>{recBusy=false;render();}).catch(()=>{recBusy=false;});break;}}
  return did;}
{const _r14=render;render=function(){_r14();try{recSync();recRow();}catch(e){console.warn(e);}};}
// set, change or stop, always with Undo
function recSet(id,type,msg){const t=state.tasks[id];if(!t)return;const old=t.rec||null,oldOf=t.recOf===undefined?null:t.recOf;
  const rec=type?{type,anchor:(old&&old.anchor)||t.date||iso(new Date())}:null,patch={rec:rec,recOf:type?(t.recOf||id):null};
  rlWrite({[id]:patch});render();
  v3undoToast(msg||(type?recName(rec)+": "+t.title:"Stopped repeating: "+t.title),()=>{rlRestore({[id]:{rec:old,recOf:oldOf}});});}
function recSkip(id){const t=state.tasks[id];if(!t||!t.rec||t.done)return;const nd=recNextDate({...t,id},recBase(t));if(!nd)return;
  const patch={archived:true,cut:true,archivedBy:null},old=rlWrite({[id]:patch});recSpawn(id).then(()=>render());render();
  v3undoToast("Skipped: "+t.title+". Next on "+fmt(nd,{weekday:"long",day:"numeric",month:"short"}),()=>{rlRestore(old);});}
function recSheet(id){psOpen("Repeat",re=>{const t=state.tasks[id];if(!t)return [];const r=t.rec,nd=r?recNextDate({...t,id},recBase(t)):null;
    return [el("p",{class:"ps-sh-sum",text:t.title}),
      el("p",{class:"hint",text:r?recName(r)+". Finish it and the next one appears"+(nd?" on "+fmt(nd,{weekday:"long",day:"numeric",month:"short"}):"")+", in the same block.":"One tap. Only one copy exists at a time, so nothing piles up."}),
      el("div",{class:"v3-cats rec-types"},...REC_T.map(([k,n])=>el("button",{type:"button",class:"cat-chip rec-opt"+(r&&r.type===k?" on":""),"data-t":k,onclick:()=>{recSet(id,k);setTimeout(re,150);}},n))),
      r&&!t.done?el("button",{type:"button",class:"btn ghost rec-skip",onclick:()=>{psClose(true);recSkip(id);}},"Skip this one"):null,
      r?el("button",{type:"button",class:"btn ghost rec-stop",onclick:()=>{recSet(id,null);setTimeout(re,150);}},"Stop repeating"):null];});}
// the long-press menu: one Repeat button under Edit
{const _tm=v3taskMenu;v3taskMenu=function(id){_tm(id);try{const t=state.tasks[id];if(!t||t.bucket||!isLeaf({...t,id}))return;const sh=document.querySelector(".ps-sheet");if(!sh||sh.querySelector(".rec-menu"))return;
    const b=el("button",{type:"button",class:"btn ghost rec-menu",onclick:()=>{psClose(true);setTimeout(()=>recSheet(id),60);}},t.rec?"Repeat: "+recName(t.rec):"Repeat"),
      anchor=[...sh.querySelectorAll("button")].find(x=>/^Edit$/.test(x.textContent));if(anchor)anchor.after(b);else sh.append(b);}catch(e){console.warn(e);}};}
// all repeating tasks in one place (Settings), each with its next day and a Stop
function recList(){return Object.entries(state.tasks||{}).filter(([i,t])=>t&&t.rec&&!t.done&&!t.archived&&!t.cut&&!t.bucket).map(([id,t])=>({id,...t})).sort((a,b)=>String(a.date||"").localeCompare(String(b.date||""))||(a.order||0)-(b.order||0));}
function recListSheet(){psOpen("Repeating tasks",re=>{const L=recList();
    if(!L.length)return [el("p",{class:"ps-sh-sum",text:"No repeating tasks."}),el("p",{class:"hint",text:"Press and hold a task, then Repeat."})];
    return [el("p",{class:"hint",text:"Each repeats once the live one is finished."}),
      el("ul",{class:"ps-sh-list rec-list"},...L.map(t=>el("li",{class:"ps-sh-hrow rec-row","data-id":t.id},el("span",{text:t.title+" · "+recName(t.rec)+(t.date?" · "+fmt(t.date,{weekday:"short",day:"numeric",month:"short"}):"")}),
        el("button",{type:"button",class:"mini rec-edit","aria-label":"Change: "+t.title,onclick:()=>{psClose(true);setTimeout(()=>recSheet(t.id),60);}},"Change"),
        el("button",{type:"button",class:"mini rec-x","aria-label":"Stop repeating: "+t.title,onclick:()=>{recSet(t.id,null);setTimeout(re,150);}},"Stop"))))];});}
function recRow(){const rows=document.querySelector('.page[data-page="settings"] .set-rows');if(!rows||document.getElementById("recRow"))return;
  rows.append(el("div",{class:"set-row",id:"recRow"},el("div",{},el("b",{text:"Repeating tasks"}),el("span",{class:"hint",text:"Daily, weekly or monthly routines, one live copy at a time"})),el("button",{type:"button",class:"btn ghost",id:"recBtn",onclick:recListSheet},"Open")));}
window.__rec={next:recNextDate,sheet:recSheet,set:recSet,skip:recSkip,list:recList,sync:recSync};
