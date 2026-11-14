// ===== 14 Nov: DATA SAFETY. Time entries are never deleted by an automatic path; one shared "worked" function; War controls; bucket fixes =====
// serves pillar: fear of overwhelm (a tracked session is never lost) and flexibility (Undo and Recently deleted for everything)

// ---- 1. entries: a removed entry stays in the document as a tombstone (deleted: time stamp). Only the user's Delete sets it. ----
const v20all=d=>{const e=state.entries&&state.entries[d];return e&&Array.isArray(e.items)?e.items:[];};
itemsRaw=function(d){return v20all(d).filter(x=>!x.deleted);};
entriesOn=function(d){return itemsRaw(d).slice().sort((a,b)=>firstAt(a)-firstAt(b));};
saveEntries=async function(d,items){
  const have=new Set(items.map(x=>x&&x.id).filter(Boolean)),out=items.slice(),now=Date.now();
  v20all(d).forEach(x=>{if(x&&x.id&&!have.has(x.id))out.push(x.deleted?x:{...x,deleted:now});});
  state.entries={...state.entries,[d]:{date:d,items:out}};render();
  const p=(async()=>{try{await store.set("entries/"+d,{date:d,items:out});}catch(e){fail(e);}})();window.__entP=p;return p;};
function v20deletedEntries(){const o=[];Object.keys(state.entries||{}).forEach(d=>{v20all(d).forEach(x=>{if(x&&x.deleted)o.push({d,x});});});return o.sort((a,b)=>(b.x.deleted||0)-(a.x.deleted||0));}
function v20restoreEntry(d,id){const items=v20all(d).map(x=>x.id===id?(({deleted,...r})=>r)(x):x);state.entries={...state.entries,[d]:{date:d,items}};render();
  (async()=>{try{await store.set("entries/"+d,{date:d,items});}catch(e){fail(e);}})();}
{const _ds=v3deletedSheet;v3deletedSheet=function(){_ds();const sh=document.querySelector(".ps-sheet");if(!sh)return;
  const E=v20deletedEntries();if(!E.length)return;
  const add=()=>{const body=sh.querySelector(".ps-body")||sh;if(body.querySelector(".rd-ent"))return;
    body.append(el("div",{class:"rd-ent"},el("p",{class:"hint",text:"Time entries"}),el("ul",{class:"ps-sh-list rd-list"},...E.slice(0,40).map(({d,x})=>el("li",{class:"bk-arow rd-row","data-entry":x.id},
      el("span",{class:"rd-t",text:(x.label||"Time entry")+" · "+dur(Number(x.minutes)||0)+" · "+fmt(d,{day:"numeric",month:"short"})}),
      el("button",{type:"button",class:"mini rd-restore",onclick:e=>{v20restoreEntry(d,x.id);toast("Restored: "+(x.label||"entry"));e.currentTarget.closest("li").remove();}},"Restore"))))));};
  add();};}
{const _dl=v3deletedList;v3deletedSec=function(){const n=_dl().filter(x=>!x.deletedBy).length+v20deletedEntries().length;return el("div",{class:"sh-sec"},el("button",{type:"button",class:"btn ghost rd-open",onclick:()=>v3deletedSheet()},"Recently deleted"+(n?" ("+n+")":"")));};}

// ---- 2. ONE shared "worked" function for Today, Time and Review (entries, running timers, War; overlaps once; no estimates, events or breaks) ----
function workedMin(d,pred){const it=itemsOn(d).filter(x=>x.kind!=="event"&&x.kind!=="break"&&!isEstimate(x)&&(!pred||pred(x)));return Math.max(0,unionMin(it));}
v3workMin=function(d){return workedMin(d,isWorkEntry);};
entryHours=function(d){return workedMin(d)/60;};

// ---- 3. War: pause time setting, never destructive saving ----
const v20count=()=>!!(state.settings&&state.settings.war&&state.settings.war.countPause);
function warLogged(w){const a=warActive(w);if(!v20count())return a;return a+(w.pausedMs||0)+((w.pausedAt&&!w.autoEnd)?Date.now()-w.pausedAt:0);}
warSave=function(w,foreign){w=w||warGet();if(!w)return;
  try{const d=iso(new Date(w.start)),mins=Math.floor((warLogged(w)-(w.cp||0))/60000);if(mins<1&&!w.savedMin)return;
    if(!w.eid)w.eid="war"+w.start.toString(36);const id=w.eid;
    if(w.noSave)return;
    const mine=v20all(d).find(x=>x.id===id);
    if(mine&&mine.deleted){w.noSave=true;if(!foreign)warPut(w);return;}          // you deleted it yourself: respected
    if(mins<1)return;                                                             // never remove an entry from here
    const items=itemsRaw(d).filter(x=>x.id!==id),end=w.pausedAt||Date.now(),cpAt=w.cpAt||0;
    let segs2;
    if(v20count())segs2=[{start:Math.max(w.start,cpAt),end,minutes:mins,paused:0}];
    else{const segs=(w.segs||[]).concat(w.pausedAt?[]:[{start:w.segStart||w.start,end:Date.now()}]).map(s=>({start:Math.max(s.start,cpAt),end:s.end})).filter(s=>s.end-s.start>=30000);
      if(!segs.length)segs.push({start:Math.max(w.start,cpAt),end});segs2=segs.map(s=>({start:s.start,end:s.end,minutes:Math.round((s.end-s.start)/60000),paused:0}));}
    items.push({...(mine||{}),id,start:Math.max(w.start,cpAt),end,ref:"other",kind:"manual",label:(mine&&mine.label)||"War on "+w.label,cat:warCatOf(w),note:w.done.length+" of "+w.ids.length+" done",minutes:mins,paused:v20count()?0:Math.round(((w.pausedMs||0)+(w.pausedAt?Date.now()-w.pausedAt:0))/60000),sessions:segs2});
    const changed=w.savedMin!==mins||!w.present;w.savedMin=mins;w.present=true;
    const p=saveEntries(d,items);if(!foreign&&changed)warPut(w);return p;}catch(e){console.warn(e);}};
warEnd=function(auto){const w=warGet();if(!w)return warClose();if(auto===true)w.autoEnd=true;   // unanswered: ends at the moment it paused, the entry stays
  warSave(w,true);const mins=Math.floor(warLogged(w)/60000);
  toast((auto===true?"War ended after 2 hours paused. ":"")+"War on "+w.label+": "+w.done.length+" of "+w.ids.length+" done, "+dur(mins)+" logged");warPut(null);warClose();};
// settings row
function warSetRow(){const rows=document.querySelector('.page[data-page="settings"] .set-rows');if(!rows)return;let r=document.getElementById("warPauseRow");const on=v20count();
  if(!r){r=el("div",{class:"set-row",id:"warPauseRow"});rows.append(r);}
  rc(r,el("div",{},el("b",{text:"War mode pause counts toward focus time"}),el("span",{class:"hint",id:"warPauseSum",text:on?"On: paused time is logged as focus":"Off: paused time is left out of the session"})),
    el("button",{type:"button",class:"btn ghost",id:"warPauseBtn","aria-pressed":String(on),onclick:()=>{const v={countPause:!on,at:Date.now()};state.settings={...state.settings,war:v};render();try{store.set("settings/war",v);}catch(e){fail(e);}}},on?"Turn off":"Turn on"));}
{const _r=render;render=function(){_r();try{warSetRow();}catch(e){console.warn(e);}};}
// focus controls that Focus mode had: +10 min, restart the round, start a new session
function warNewSession(){const w=warGet();if(!w)return;const left=w.ids.filter(id=>!w.done.includes(id)&&state.tasks[id]&&!state.tasks[id].done);
  warSave(w,true);warPut({k:w.k,v:w.v,label:w.label,ids:left,done:[],start:Date.now(),dur:w.dur,phase:"focus",phase0:0});toast("New session started");warRender();}
{const _wr=warRender;warRender=function(){_wr();try{const w=warGet(),box=document.querySelector("#warView .wr-btns");if(!w||!box||box.querySelector(".wr-ext"))return;
  if(w.dur)box.append(el("button",{type:"button",class:"wr-pause wr-ext",onclick:()=>{const x=warGet();if(!x)return;x.dur=(x.dur||0)+10;warPut(x);toast("+10 min added");warRender();}},"+10 min"));
  if(!w.pausedAt&&w.phase!=="break")box.append(el("button",{type:"button",class:"wr-pause wr-rst",onclick:()=>{const x=warGet();if(!x)return;x.phase="focus";x.phase0=warActive(x);warPut(x);toast("Round restarted");warRender();}},"Restart round"));
  const left=w.ids.some(id=>!w.done.includes(id)&&state.tasks[id]&&!state.tasks[id].done);
  if(left)box.append(el("button",{type:"button",class:"wr-pause wr-new",onclick:()=>v3confirm("Save this session and start a new one on "+w.label+"?","New session",warNewSession)},"New session"));}catch(e){console.warn(e);}};}

// ---- 4. buckets ----
// a task added to an active bucket lands on the next working day inside the bucket window (never Friday), with its sprint, so Today shows it at once
function bkDayFor(b){const today=iso(new Date());let d=b.bStart&&b.bStart>today?b.bStart:today;if(b.bEnd&&d>b.bEnd)d=today;let n=0;while(isFriday(d)&&n++<7)d=addDays(d,1);return d;}
bkAddTask=async function(bid,title){title=String(title||"").trim();if(!title)return;const b=bid&&state.tasks[bid];
  const body={title,cat:(b&&b.cat)||"setup",parent:bid||null,date:null,done:false,order:Date.now()};
  if(b&&b.bState==="active"&&(b.cat==="portfolio"||b.cat==="client"||b.kind==="portfolio"||b.kind==="client")){const d=bkDayFor(b);body.date=d;const sp=v3spOf(d);if(sp)body.sprint=sp.n;}
  const ref=await store.add("tasks",body);state.tasks[ref.id]=body;bkNote("Added: "+title);render();
  setTimeout(()=>{const i=document.querySelector(".ps-sheet .bk-add input")||document.querySelector((bid?'[data-bk="'+bid+'"]':'[data-bk="none"]')+" .bk-add input");if(i)i.focus();},60);};
// tap a bucket card: the whole bucket in a sheet (tasks below the header), Edit bucket as a secondary action
function bkSheet(bid){const b0=state.tasks[bid];if(!b0)return;
  psOpen(b0.title,re=>{const b=state.tasks[bid];if(!b)return [el("p",{class:"hint",text:"This bucket is gone."})];
    const kids=bkKids(bid).sort(bkSort),open=kids.filter(k=>!k.done),done=kids.length-open.length;
    const dates=b.bStart||b.bEnd?(bkShort(b.bStart)||"")+(b.bStart&&b.bEnd?" to ":"")+(b.bEnd?bkShort(b.bEnd):""):"No dates";
    const inp=el("input",{type:"text",class:"v3-in","aria-label":"Add a task to "+b.title,placeholder:"Add task"});
    inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();const v=inp.value;inp.value="";bkAddTask(bid,v).then(()=>setTimeout(re,200));}});
    return [el("p",{class:"ps-sh-sum bks-sum",text:dates+" · "+(kids.length?done+" of "+kids.length+" done":"No tasks yet")+(b.bState==="paused"?" · Paused":"")}),
      kids.length?el("div",{class:"bk-prog"},el("span",{class:"bk-bar","aria-hidden":"true"},el("i",{style:"width:"+Math.round(done/kids.length*100)+"%"}))):null,
      el("ul",{class:"bk-list bks-list"},...open.map((t,i)=>bkRow(t,false,{}))),
      done?el("p",{class:"hint",text:done+" done"}):null,
      el("div",{class:"bk-add"},inp),
      el("div",{class:"v3-row"},el("button",{type:"button",class:"btn ghost bks-sel",onclick:()=>selStart(null,re)},"Select"),el("button",{type:"button",class:"btn ghost bks-edit",onclick:()=>{psClose(true);bkForm(bid);}},"Edit bucket"))];});}
{const _bc=bkCard;bkCard=function(b){const c=_bc(b);if(b){const t=c.querySelector(".bk-title");if(t)t.onclick=()=>bkSheet(b.id);}return c;};}
window.__u20={saveEntries:(d,i)=>saveEntries(d,i),itemsRaw:d=>itemsRaw(d),workedMin,bkSheet,warLogged,v20deletedEntries,warNewSession};
