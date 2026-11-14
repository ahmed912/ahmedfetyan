/* ===== 13 Nov Round 5: buckets (projects with dates, tasks inside). A bucket is a top-level task with bucket:true ===== */
const BK_COL=["#0F766E","#2563EB","#7C3AED","#DB2777","#EA580C","#CA8A04","#16A34A","#64748B"];
const bkShort=d=>d?fmt(d,{day:"numeric",month:"short"}):"";
const bkList=()=>Object.entries(state.tasks||{}).filter(([i,t])=>t&&t.bucket).map(([id,t])=>({id,...t}));
function bkOfId(id){let cur=state.tasks&&state.tasks[id],g=0;while(cur&&g++<6){if(cur.bucket)return null;const p=cur.parent;if(!p)return null;if(isBk(p))return p;cur=state.tasks[p];}return null;}
function bkName(id){const b=bkOfId(id);return b&&state.tasks[b]?state.tasks[b].title||"Bucket":"Unbucketed";}
function bkKids(bid){return Object.entries(state.tasks||{}).filter(([i,t])=>t&&t.parent===bid&&!t.bucket&&!t.cut&&!t.inbox&&!t.archived&&t.title).map(([id,t])=>({id,...t}));}
function bkLoose(){return Object.entries(state.tasks||{}).filter(([i,t])=>t&&!t.bucket&&!t.parent&&!t.cut&&!t.inbox&&!t.archived&&t.title).map(([id,t])=>({id,...t}));}
const bkSort=(a,b)=>(a.date?0:1)-(b.date?0:1)||String(a.date||"").localeCompare(String(b.date||""))||(a.order||0)-(b.order||0);
function bkSprintLabel(b){if(b.bNoSprint)return "Outside sprints";const s=b.bStart||b.bEnd,e=b.bEnd||b.bStart;if(!s)return "";const hit=sprints().filter(p=>p.start<=e&&p.end>=s).map(p=>"S"+p.n);return hit.length?hit.join(", "):"Outside sprints";}
function bkDescendants(bid){const out=[];const all=Object.entries(state.tasks||{});const seen=new Set([bid]);let grew=true;while(grew){grew=false;for(const [i,t] of all){if(t&&t.parent&&seen.has(t.parent)&&!seen.has(i)){seen.add(i);out.push(i);grew=true;}}}return out;}
function bkNote(msg){try{const b=undoBar();b.querySelector(".ub-t").textContent=msg;}catch(e){}}
function bkSet(id,patch){state.tasks[id]={...state.tasks[id],...patch};setTask(id,patch);}
let bkExp={},bkOld=false,bkDrag=null;
// ---- actions (each is one Undo step: every write happens in the same tick) ----
async function bkAdd(f){const body={title:f.title,bucket:true,bStart:f.bStart||null,bEnd:f.bEnd||null,bColor:f.bColor||BK_COL[0],bState:"active",bNoSprint:!!f.bNoSprint,done:false,order:Date.now()};
  const ref=await store.add("tasks",body);state.tasks[ref.id]=body;bkNote("Added bucket "+body.title);render();
  setTimeout(()=>{const i=document.querySelector('[data-bk="'+ref.id+'"] .bk-add input');if(i)i.focus();},60);return ref.id;}
async function bkAddTask(bid,title){title=String(title||"").trim();if(!title)return;const b=bid&&state.tasks[bid];
  const body={title,cat:(b&&b.cat)||"setup",parent:bid||null,date:null,done:false,order:Date.now()};
  const ref=await store.add("tasks",body);state.tasks[ref.id]=body;bkNote("Added: "+title);render();
  setTimeout(()=>{const i=document.querySelector((bid?'[data-bk="'+bid+'"]':'[data-bk="none"]')+" .bk-add input");if(i)i.focus();},60);}
function bkMove(id,bid){const t=state.tasks[id];if(!t||t.bucket)return;if((t.parent||null)===(bid||null)){toast("It is already there");return;}
  state.tasks[id]={...t,parent:bid||null};setTask(id,{parent:bid||null});render();bkNote("Moved to "+(bid?state.tasks[bid].title:"Unbucketed")+": "+t.title);}
function bkArchive(bid,on){const b=state.tasks[bid];if(!b)return;
  if(on){bkSet(bid,{archived:true,cut:true});bkDescendants(bid).forEach(i=>{const t=state.tasks[i];if(t&&!t.archived)bkSet(i,{archived:true,cut:true,archivedBy:bid});});bkNote("Archived "+b.title);}
  else{bkSet(bid,{archived:false,cut:false});bkDescendants(bid).forEach(i=>{const t=state.tasks[i];if(t&&t.archivedBy===bid)bkSet(i,{archived:false,cut:false,archivedBy:null});});bkNote("Restored "+b.title);}
  render();}
function bkDelete(bid,keep){const b=state.tasks[bid];if(!b)return;const name=b.title;
  if(keep){Object.entries(state.tasks).filter(([i,t])=>t&&t.parent===bid).forEach(([i])=>{state.tasks[i]={...state.tasks[i],parent:null};setTask(i,{parent:null});});}
  else bkDescendants(bid).forEach(i=>{const t=state.tasks[i];if(t&&!t.archived)bkSet(i,{archived:true,cut:true,archivedBy:bid});});
  const c={...state.tasks};delete c[bid];state.tasks=c;store.del("tasks/"+bid);bkNote("Deleted "+name+(keep?", tasks kept":" and its tasks"));render();}
// ---- sheets ----
function bkForm(bid){const b=bid?state.tasks[bid]:null;const f={title:b?b.title:"",bStart:b?b.bStart||"":iso(new Date()),bEnd:b?b.bEnd||"":addDays(iso(new Date()),13),bColor:b?b.bColor||BK_COL[0]:BK_COL[0],bNoSprint:b?!!b.bNoSprint:false};
  psOpen(b?"Edit bucket":"New bucket",re=>{
    const nm=el("input",{type:"text",class:"v3-in bk-name",placeholder:"Bucket name","aria-label":"Bucket name",value:f.title}),
      s=el("input",{type:"date",class:"tt-in","aria-label":"Start date",value:f.bStart||""}),e=el("input",{type:"date",class:"tt-in","aria-label":"End date",value:f.bEnd||""}),
      ns=el("input",{type:"checkbox","aria-label":"Outside sprints"});ns.checked=f.bNoSprint;
    const patch=o=>{Object.assign(f,o);if(b&&state.tasks[bid]){const p={};Object.keys(o).forEach(k=>{p[k]=o[k]===""?null:o[k];});if(p.title===null)return;bkSet(bid,p);bkNote("Changed "+(f.title||"bucket"));render();}};
    nm.onchange=()=>{const v=nm.value.trim();if(!v&&b){nm.value=b.title;return;}patch({title:v});};
    s.onchange=()=>patch({bStart:s.value});e.onchange=()=>patch({bEnd:e.value});ns.onchange=()=>patch({bNoSprint:ns.checked});
    const sw=el("div",{class:"bk-sw",role:"group","aria-label":"Colour"},...BK_COL.map(c=>el("button",{type:"button",class:"bk-swb"+(f.bColor===c?" on":""),style:"background:"+c,"aria-label":"Colour "+c,"aria-pressed":String(f.bColor===c),onclick:()=>{patch({bColor:c});re();}})));
    const st=b?el("div",{class:"seg",role:"group","aria-label":"State"},...[["active","Active"],["paused","Paused"]].map(([v,n])=>el("button",{type:"button","aria-pressed":String((b.bState||"active")===v),text:n,onclick:()=>{bkSet(bid,{bState:v});bkNote(n+": "+b.title);render();re();}}))):null;
    return [nm,el("div",{class:"v3-row"},el("label",{class:"field"},el("span",{class:"label",text:"Start"}),s),el("label",{class:"field"},el("span",{class:"label",text:"End"}),e)),
      el("div",{class:"field"},el("span",{class:"label",text:"Colour"}),sw),st?el("div",{class:"field"},el("span",{class:"label",text:"State"}),st):null,
      el("label",{class:"bk-chk"},ns,el("span",{text:"Outside sprints"})),
      b?null:el("button",{type:"button",class:"btn",onclick:()=>{const v=nm.value.trim();if(!v){toast("Give it a name");nm.focus();return;}f.title=v;f.bStart=s.value;f.bEnd=e.value;f.bNoSprint=ns.checked;psClose(true);bkAdd(f);}},"Save")];},{focus:true});}
function bkMenu(bid){const b=state.tasks[bid];if(!b)return;psOpen("Bucket",()=>{const paused=b.bState==="paused";
  return [el("p",{class:"ps-sh-sum",text:b.title}),
    el("button",{type:"button",class:"btn ghost rn-menu",onclick:()=>{psClose(true);setTimeout(()=>rnStart(bid),60);}},"Rename"),
    el("button",{type:"button",class:"btn ghost",onclick:()=>{psClose(true);bkForm(bid);}},"Edit"),
    el("button",{type:"button",class:"btn ghost",onclick:()=>{psClose(true);bkSet(bid,{bState:paused?"active":"paused"});bkNote((paused?"Resumed ":"Paused ")+b.title);render();}},paused?"Resume":"Pause"),
    el("button",{type:"button",class:"btn ghost",onclick:()=>{psClose(true);bkArchive(bid,true);}},"Archive"),
    el("button",{type:"button",class:"btn ghost danger",onclick:()=>{psClose(true);bkDeleteAsk(bid);}},"Delete")];});}
function bkDeleteAsk(bid){const b=state.tasks[bid];if(!b)return;const n=bkKids(bid).length;psOpen("Delete "+b.title+"?",()=>[
  el("p",{class:"hint",text:n?n+" task"+(n===1?"":"s")+" inside. Undo is on the bar below.":"It has no tasks. Undo is on the bar below."}),
  el("button",{type:"button",class:"btn",onclick:()=>{psClose(true);bkDelete(bid,true);}},"Delete, keep the tasks"),
  n?el("button",{type:"button",class:"btn ghost danger",onclick:()=>{psClose(true);bkDelete(bid,false);}},"Delete bucket and tasks"):null,
  el("button",{type:"button",class:"btn ghost",onclick:()=>psClose()},"Cancel")]);}
function bkMoveSheet(id){const t=state.tasks[id];if(!t)return;psOpen("Move to bucket",()=>[el("p",{class:"ps-sh-sum",text:t.title}),
  el("ul",{class:"ps-sh-list"},...[...bkList().filter(b=>!b.archived),{id:null,title:"Unbucketed"}].map(b=>el("li",{},el("button",{type:"button",class:"ps-sh-row",onclick:()=>{psClose(true);bkMove(id,b.id);}},b.title||"Bucket",(t.parent||null)===b.id?el("span",{class:"hint",text:" (here)"}):null))))]);}
function bkPicker(id,re){const t=state.tasks[id];const sel=el("select",{class:"v3-in","aria-label":"Bucket"},el("option",{value:"",text:"No bucket"}),...bkList().filter(b=>!b.archived).map(b=>el("option",{value:b.id,text:b.title})));
  sel.value=t.parent&&isBk(t.parent)?t.parent:"";sel.onchange=()=>{bkMove(id,sel.value||null);setTimeout(re,250);};
  return el("label",{class:"field"},el("span",{class:"label",text:"Bucket"}),sel);}
function bkArchSheet(){psOpen("Archived buckets",re=>{const L=bkList().filter(b=>b.archived);
  return L.length?[el("ul",{class:"ps-sh-list"},...L.map(b=>el("li",{class:"bk-arow"},el("span",{text:b.title}),el("button",{type:"button",class:"mini",onclick:()=>{bkArchive(b.id,false);re();}},"Restore"))))]:[el("p",{class:"hint",text:"No archived buckets."})];});}
// ---- the grid ----
// ONE shared row for bucket cards, Inbox and (through the same CSS) subtask and parent sheet lists:
// [check] [title, one line] [day chip]  and one tiny line under the title for the tags (type, High, "n of m"). Nothing else.
function urTags(t){const o=[];if(t.cat)o.push(CAT_NAME[t.cat]||t.cat);if(Number(t.pri)>0)o.push("High");try{const k=ckCount({...t});if(k.n)o.push(k.d+" of "+k.n);}catch(e){}return o.join(" \u00b7 ");}
function bkActiveId(){const L=bkList().filter(b=>!b.archived&&b.bState==="active"&&(b.cat==="portfolio"||b.cat==="client"||b.kind==="portfolio"||b.kind==="client"));L.sort((a,b)=>(Number(a.queue)||0)-(Number(b.queue)||0)||(a.order||0)-(b.order||0));return L[0]?L[0].id:null;}
function bkRow(t,first,opts){opts=opts||{};const li=el("li",{class:"bk-row ur-row"+(opts.inbox?" pl-row":"")+(t.done?" done":""),"data-id":t.id,draggable:"true","aria-label":t.title});
  const cb=el("input",{type:"checkbox",class:"ur-c","aria-label":"Done: "+t.title});cb.checked=!!t.done;cb.onchange=()=>{setDone(t.id,cb.checked);render();};
  const tt=el("button",{type:"button",class:"bk-t ur-t",text:t.title,onclick:()=>opts.inbox?plSheet(t.id):v3taskSheet(t.id)});
  const dc=el("button",{type:"button",class:"bk-d ur-d"+(t.date?"":" none"),"aria-label":(t.date?"Reschedule from "+bkShort(t.date):"Pick a date")+": "+t.title,text:t.date?bkShort(t.date):"No date",onclick:()=>v3rs(t.id,"task")});
  const tg=el("span",{class:"hint ur-tags",text:urTags({...t})});
  li.append(cb,tt,dc,tg);
  if(first&&!t.done&&opts.go)li.classList.add("has-go"),tg.append(el("button",{type:"button",class:"ur-go bk-go","aria-label":"Start now: "+t.title,onclick:()=>v3five(t.id)},"Start for 5 minutes"));
  li.addEventListener("dragstart",e=>{bkDrag=t.id;try{e.dataTransfer.setData("text/plain",t.id);e.dataTransfer.effectAllowed="move";}catch(_){}li.classList.add("drag");document.body.classList.add("bk-dragging");});
  li.addEventListener("dragend",()=>{bkDrag=null;li.classList.remove("drag");document.body.classList.remove("bk-dragging");document.querySelectorAll(".bk-over").forEach(x=>x.classList.remove("bk-over"));});
  if(!t.done){swipeable(li,()=>{setDone(t.id,true);render();},()=>v3rs(t.id,"task"),null,{r:"Mark as done",rb:"Done",direct:true});rsLong(li,()=>v3taskMenu(t.id));}
  return li;}
function bkCard(b){const none=!b,id=b?b.id:"none",kids=(none?bkLoose():bkKids(b.id)).sort(bkSort),open=kids.filter(k=>!k.done),done=kids.length-open.length,paused=!none&&b.bState==="paused",ex=!!bkExp[id],shown=ex?open:open.slice(0,3);
  const card=el("section",{class:"bk-card"+(paused?" paused":"")+(none?" none":""),"data-bk":id,"aria-label":none?"Unbucketed":b.title,style:none?"":"--bk:"+(b.bColor||BK_COL[0])});
  const dates=none?"":(b.bStart||b.bEnd?(bkShort(b.bStart)||"")+(b.bStart&&b.bEnd?" to ":"")+(b.bEnd?(b.bStart?"":"Until ")+bkShort(b.bEnd):""):"No dates"),spl=none?"":bkSprintLabel(b);
  const head=el("div",{class:"bk-head"},none?el("h3",{class:"bk-title",text:"Unbucketed"}):el("button",{type:"button",class:"bk-title",text:b.title,onclick:()=>bkForm(b.id)}),
    none?null:el("button",{type:"button",class:"mini bk-more","aria-label":"Menu for "+b.title,onclick:()=>bkMenu(b.id)},"..."));
  card.append(head);
  card.append(el("div",{class:"bk-sub hint"},none?open.length+" open":(dates?dates+" \u00b7 ":"")+(kids.length?done+" of "+kids.length:"No tasks yet")+(paused?" \u00b7 Paused":"")));
  if(!none&&kids.length)card.append(el("div",{class:"bk-prog"},el("span",{class:"bk-bar","aria-hidden":"true"},el("i",{style:"width:"+Math.round(done/kids.length*100)+"%"}))));
  const ul=el("ul",{class:"bk-list"},...shown.map((t,i)=>bkRow(t,i===0,{go:!none&&b.id===bkActiveId()})));card.append(ul);
  if(!none&&!kids.length)card.append(el("p",{class:"hint bk-empty",text:"No tasks yet"}));
  if(open.length>3)card.append(el("button",{type:"button",class:"mini bk-moreb",onclick:()=>{bkExp[id]=!ex;render();}},ex?"Show less":(open.length-3)+" more"));
  const inp=el("input",{type:"text",class:"v3-in","aria-label":"Add a task to "+(none?"Unbucketed":b.title),placeholder:"Add task"});
  inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();const v=inp.value;inp.value="";bkAddTask(none?null:b.id,v);}});
  card.append(el("div",{class:"bk-add"},inp));
  if(!none)rsLong(head,()=>bkMenu(b.id));
  card.addEventListener("dragover",e=>{if(bkDrag){e.preventDefault();card.classList.add("bk-over");}});
  card.addEventListener("dragleave",e=>{if(!card.contains(e.relatedTarget))card.classList.remove("bk-over");});
  card.addEventListener("drop",e=>{e.preventDefault();card.classList.remove("bk-over");let tid=bkDrag;try{tid=tid||e.dataTransfer.getData("text/plain");}catch(_){}bkDrag=null;if(tid)bkMove(tid,none?null:b.id);});
  return card;}
function renderBuckets(){const pg=document.querySelector('.page[data-page="projects"]');if(!pg||pg.hidden)return;
  let sec=document.getElementById("bucketSec");if(!sec){sec=el("section",{id:"bucketSec",class:"bucket-sec","aria-label":"Buckets"});pg.prepend(sec);}
  const act=bkList().filter(b=>!b.archived).sort((a,b)=>(a.bState==="paused")-(b.bState==="paused")||(a.bStart?0:1)-(b.bStart?0:1)||String(a.bStart||"").localeCompare(String(b.bStart||""))||String(a.title).localeCompare(String(b.title))),arch=bkList().filter(b=>b.archived).length;
  const nb=el("button",{type:"button",class:"bk-new",onclick:()=>bkForm(null)},el("span",{class:"bk-plus","aria-hidden":"true",text:"+"}),el("span",{text:"New bucket"}));
  const loose=bkLoose().length;
  const openAll=act.flatMap(b=>bkKids(b.id)).filter(k=>!k.done).concat(bkLoose().filter(k=>!k.done));
  rc(sec,el("p",{class:"hint ck-count",text:act.length+" project"+(act.length===1?"":"s")+", "+openAll.length+" open task"+(openAll.length===1?"":"s")}),el("div",{class:"bk-grid"},nb,...act.map(bkCard),loose?bkCard(null):null),
    el("div",{class:"bk-foot"},arch?el("button",{type:"button",class:"hint bk-link",onclick:bkArchSheet},"Archived buckets ("+arch+")"):null));
  try{if(!localStorage.getItem("sb-bk-hint")){localStorage.setItem("sb-bk-hint","1");toast("Tip: swipe a task right for done, left to reschedule. Hold for more, drag to another bucket.");}}catch(e){}}
{const _rb=render;render=function(){_rb();try{renderBuckets();}catch(e){console.warn(e);}};}
{const _sb=setPage;setPage=function(p,...a){const r=_sb(p,...a);try{renderBuckets();}catch(e){}return r;};}
// Today cards name their bucket
{const _vb=v3card;v3card=function(t,top,ctx){const c=_vb(t,top,ctx);try{const bid=bkOfId(t.id);const b=bid&&state.tasks[bid];const head=c.querySelector(".cs-head");
    if(b&&head&&!head.querySelector(".bk-tag")){const tag=el("span",{class:"hint bk-tag",text:b.title});const chip=head.querySelector(".cat-chip");chip?chip.after(tag):head.append(tag);}}catch(e){console.warn(e);}return c;};}
// reachable from the phone bottom bar too
if(!MTABS.some(t=>t[0]==="projects")){MTABS.splice(1,0,["projects","Projects","grid",["projects"]]);try{renderMobile();}catch(e){}}
