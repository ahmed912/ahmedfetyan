// ===== Round 7: rename UI. Hold = quick menu > Rename, or double-click a title. One field in place, Enter saves, Esc cancels, Undo on the bar. =====
const RN_SEL=".cs-t,.cl-t,.cs-step-t,.wf-t,.q-t,.bk-t,.bk-title,.wr-nt,.fit-n";
function rnIdFor(n){const a=n.closest("[data-id]");if(a&&state.tasks[a.dataset.id]&&(state.tasks[a.dataset.id].title||"").trim()===n.textContent.trim())return a.dataset.id;
  const tx=n.textContent.trim();if(!tx)return null;const m=Object.entries(state.tasks||{}).filter(([i,t])=>t&&!t.cut&&!t.archived&&(t.title||"").trim()===tx);return m.length===1?m[0][0]:null;}
function rnTag(root){try{(root||document).querySelectorAll(RN_SEL).forEach(n=>{if(n.dataset.rn||n.closest(".rn-wrap"))return;const id=rnIdFor(n);if(id){n.dataset.rn=id;n.setAttribute("data-rn",id);}});}catch(e){console.warn(e);}}
let rnBusy=false;
function rnStart(arg){let n=typeof arg==="string"?null:arg,id=typeof arg==="string"?arg:arg&&arg.dataset.rn;const t=state.tasks[id];if(!t)return;
  if(!n){n=[...document.querySelectorAll('[data-rn="'+id+'"]')].find(x=>x.offsetParent!==null);}
  if(!n){v3taskSheet(id);setTimeout(()=>{const f=document.querySelector('.ps-sheet [aria-label="Task name"]');if(f){f.focus();try{f.select();}catch(e){}}},120);return;}
  if(rnBusy)return;rnBusy=true;const old=t.title||"";let done=false;
  const inp=el("input",{type:"text",class:"rn-in","aria-label":"Rename",value:old,maxlength:"140",spellcheck:"false"});
  ["pointerdown","pointermove","pointerup","click","dblclick","touchstart","keyup"].forEach(ev=>inp.addEventListener(ev,e=>e.stopPropagation()));
  const wrap=n.parentNode;n.style.display="none";n.after(inp);wrap&&wrap.classList&&wrap.classList.add("rn-wrap");
  const fin=save=>{if(done)return;done=true;rnBusy=false;const v=inp.value.trim().replace(/\s+/g," ");inp.remove();n.style.display="";wrap&&wrap.classList&&wrap.classList.remove("rn-wrap");
    if(save&&v&&v!==old){patchTask(id,{title:v});v3undoToast("Renamed to "+v,()=>{patchTask(id,{title:old});});}else if(save&&!v){toast("A name is needed. Kept: "+old);}};
  inp.addEventListener("keydown",e=>{e.stopPropagation();if(e.key==="Enter"){e.preventDefault();fin(true);}else if(e.key==="Escape"){e.preventDefault();fin(false);}});
  inp.addEventListener("blur",()=>fin(true));
  inp.focus();try{inp.select();}catch(e){}}
document.addEventListener("dblclick",e=>{const n=e.target.closest&&e.target.closest("[data-rn]");if(n&&!e.target.closest(".rn-in")){e.preventDefault();rnStart(n);}});
// tag the exact ids where the card knows them (steps share titles with other tasks)
{const _vr=v3card;v3card=function(t,top,ctx){const c=_vr(t,top,ctx);try{const h=c.querySelector(".cs-t");if(h&&state.tasks[t.id])h.dataset.rn=t.id;
    (t.steps||[]).forEach(s=>{const li=[...c.querySelectorAll(".cs-step")].find(x=>x.querySelector("input")&&x.querySelector("input").getAttribute("aria-label")==="Done: "+s.title);const tt=li&&li.querySelector(".cs-step-t");if(tt&&state.tasks[s.id])tt.dataset.rn=s.id;});}catch(e){console.warn(e);}return c;};}
{let q=false;const mo=new MutationObserver(()=>{if(q)return;q=true;Promise.resolve().then(()=>{q=false;rnTag();});});mo.observe(document.body,{childList:true,subtree:true});}
window.__rn={start:rnStart,tag:rnTag};

// ===== Round 8: inbox and backlog (Plan page). Capture in one line, triage on Saturday, schedule with the picker, send to backlog, Undo. =====
const plKindRank=t=>{const k=chKind(t);return k==="design"?0:k==="learn"?1:2;};
function plCmp(a,b){return plKindRank(a)-plKindRank(b)||(Number(b.pri)||0)-(Number(a.pri)||0)||String(a.due||"9999").localeCompare(String(b.due||"9999"))||(a.order||0)-(b.order||0);}
const plLive=t=>t&&!t.cut&&!t.archived&&!t.done&&!t.bucket&&t.title;
function inboxList(){return Object.entries(state.tasks||{}).filter(([i,t])=>plLive(t)&&t.inbox).map(([id,t])=>({id,...t})).sort(plCmp);}
function backlogList(){return Object.entries(state.tasks||{}).filter(([i,t])=>plLive(t)&&!t.inbox&&!t.date&&(!t.parent||isBk(t.parent))&&isLeaf({...t,id:i})).map(([id,t])=>({id,...t})).sort(plCmp);}
// scheduling an inbox task: leaves the inbox, is not counted as "moved", and Undo puts it back in the inbox
{const _s=setTask;setTask=function(id,patch){try{const t=state.tasks[id];
    if(patch&&typeof patch.date==="string"&&t&&t.inbox){patch={...patch,inbox:false,wasInbox:true,moved:Math.max(0,(Number(patch.moved)||1)-1)};state.tasks[id]={...state.tasks[id],inbox:false,wasInbox:true,moved:patch.moved};}
    else if(patch&&"date" in patch&&!patch.date&&t&&t.wasInbox&&!("inbox" in patch)){patch={...patch,date:null,inbox:true,wasInbox:false};state.tasks[id]={...state.tasks[id],date:null,inbox:true,wasInbox:false};}
    else if(patch&&"date" in patch&&patch.date===undefined){patch={...patch,date:null};}}catch(e){console.warn(e);}
  return _s.call(this,id,patch);};}
async function plCapture(txt){const v=(txt||"").trim().replace(/\s+/g," ");if(!v)return;
  const id=await v3newTask({title:v,inbox:true,done:false,cat:null,sprint:null,order:Date.now()});if(!id)return;
  v3undoToast("Added to inbox: "+v,()=>{patchTask(id,{archived:true,cut:true,inbox:false});});}
function plToBacklog(id){const t=state.tasks[id];if(!t)return;const old={inbox:!!t.inbox,date:t.date||null,slot:t.slot==null?null:t.slot,sprint:t.sprint==null?null:t.sprint};
  patchTask(id,{inbox:false,date:null,slot:null,sprint:null});v3undoToast("Sent to backlog: "+t.title,()=>{patchTask(id,old);});}
function plDue(d){const today=iso(new Date()),n=Math.round((parse(d)-parse(today))/864e5);
  return "Due "+fmt(d,{day:"numeric",month:"short"})+" ("+(n===0?"today":n===1?"tomorrow":n>1?"in "+n+" days":n===-1?"yesterday":(-n)+" days ago")+")";}
function plFact(t){const o=[];if(t.due)o.push(plDue(t.due));if(Number(t.pri)>0)o.push("High");return o.join(" · ");}
function plEst(m){m=Number(m)||0;return m<=0?"":(m<60?m+" min":(Math.round(m/6)/10)+" h");}
function plBadges(t){const o=[];const m=Number(t.mins)||0;if(m)o.push(plEst(m));if(t.due)o.push(plDue(t.due));if(Number(t.pri)>0)o.push("High");if(t.cat)o.push(CAT_NAME[t.cat]||t.cat);o.push(chKind(t)==="learn"?"Learning":modeOf(t)==="deep"?"Deep":"Shallow");
  const bk=t.parent&&isBk(t.parent)?state.tasks[t.parent].title:"";if(bk)o.push(bk);return o;}
// the triage sheet: bucket, estimate, block type (default from the category), then Schedule or Backlog
function plSheet(id){psOpen("Plan task",re=>{const t=state.tasks[id];if(!t)return [el("p",{class:"ps-sh-sum",text:"This task is gone."})];
    const est=el("div",{class:"v3-cats pl-est",role:"group","aria-label":"Estimate"},...[15,30,60,90,120].map(m=>el("button",{type:"button",class:"cat-chip"+(Number(t.mins)===m?" on":""),"aria-pressed":String(Number(t.mins)===m),"data-m":String(m),onclick:()=>{patchTask(id,{mins:Number(t.mins)===m?0:m});setTimeout(re,200);}},plEst(m))));
    const body=[el("p",{class:"ps-sh-sum",text:t.title}),
      el("div",{class:"field"},el("span",{class:"label",text:"Category"}),v3catChips(t.cat,c=>{patchTask(id,{cat:c});setTimeout(re,200);})),
      chModeRow({...t,id},re),
      el("div",{class:"field"},el("span",{class:"label",text:"Estimate"}),est),
      bkPicker(id,re)];
    if(typeof plExtra==="function")body.push(...plExtra(id,re));
    body.push(el("div",{class:"v3-row"},el("button",{type:"button",class:"btn pl-sched",onclick:()=>{psClose(true);v3rs(id,"task");}},"Schedule"),
      t.inbox?el("button",{type:"button",class:"btn ghost pl-back",onclick:()=>{psClose(true);plToBacklog(id);}},"Send to backlog"):null,
      t.inbox?el("button",{type:"button",class:"btn ghost pl-keep",onclick:()=>{psClose(true);}},"Later"):null),
    el("div",{class:"v3-row"},el("button",{type:"button",class:"btn ghost pl-edit",onclick:()=>{psClose(true);v3taskSheet(id,true);}},"Edit"),el("button",{type:"button",class:"btn ghost danger del-menu",onclick:()=>v3delete(id)},"Delete")),
      el("button",{type:"button",class:"btn ghost danger pl-drop",onclick:()=>{psClose(true);v3archive(id,true);}},"Drop it"));
    return body;});}
let plInExp=false,plBlOpen=false,plBlExp=false;
function plRow(t){return bkRow(t,false,{inbox:true});}
function renderInbox(){const pg=document.querySelector('.page[data-page="projects"]');if(!pg||pg.hidden)return;
  let sec=document.getElementById("planInbox");const bs=document.getElementById("bucketSec");if(!sec){sec=el("section",{id:"planInbox",class:"bucket-sec pl-sec","aria-label":"Inbox and backlog"});}
  if(bs){if(sec.nextElementSibling!==bs)bs.before(sec);}else if(sec.parentElement!==pg)pg.prepend(sec);
  if(sec.querySelector(".pl-cap:focus")&&document.activeElement&&sec.contains(document.activeElement)&&document.activeElement.value)return;
  const inb=inboxList(),bl=backlogList(),shown=plInExp?inb:inb.slice(0,3),blShown=plBlExp?bl:bl.slice(0,4);
  const cap=el("input",{type:"text",class:"v3-in pl-cap","aria-label":"Capture a task",placeholder:"Capture a task",maxlength:"140"});
  cap.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();const v=cap.value;cap.value="";plCapture(v);}});
  rc(sec,el("div",{class:"bk-head pl-head"},el("h3",{class:"bk-title",text:"Inbox"}),el("span",{class:"hint pl-in-count",text:inb.length?inb.length+" to sort":"Nothing to sort"})),
    el("div",{class:"bk-add"},cap),
    inb.length?el("ul",{class:"bk-list pl-inbox"},...shown.map(plRow)):el("p",{class:"hint pl-empty",text:"Inbox is empty. Capture the next thing in one line."}),
    inb.length>3?el("button",{type:"button",class:"mini bk-moreb",onclick:()=>{plInExp=!plInExp;render();}},plInExp?"Show less":(inb.length-3)+" more"):null,
    el("button",{type:"button",class:"hint bk-link pl-bl-head","aria-expanded":String(plBlOpen),onclick:()=>{plBlOpen=!plBlOpen;render();}},"Backlog ("+bl.length+")"+(plBlOpen?"":" ")),
    plBlOpen?(bl.length?el("ul",{class:"bk-list pl-backlog"},...blShown.map(plRow)):el("p",{class:"hint pl-empty",text:"Backlog is empty."})):null,
    plBlOpen&&bl.length>4?el("button",{type:"button",class:"mini bk-moreb",onclick:()=>{plBlExp=!plBlExp;render();}},plBlExp?"Show less":(bl.length-4)+" more"):null);}
{const _ri=render;render=function(){_ri();try{renderInbox();}catch(e){console.warn(e);}};}
{const _si=setPage;setPage=function(p,...a){const r=_si(p,...a);try{renderInbox();}catch(e){}return r;};}
window.__pl={inbox:inboxList,backlog:backlogList,capture:plCapture,sheet:plSheet,toBacklog:plToBacklog};

// ===== Round 9: planning fields on every task: estimate, due, priority, bucket, block type. Lists sort work, then learning, then shallow; badges are plain facts. =====
function plExtra(id,re){const t=state.tasks[id];if(!t)return [];
  const di=el("input",{type:"date",class:"tt-in v3-date pl-due","aria-label":"Due date",value:t.due||""});
  di.addEventListener("change",()=>{const old=t.due||null,v=di.value||null;patchTask(id,{due:v});v3undoToast(v?plDue(v)+": "+t.title:"Due date cleared: "+t.title,()=>{patchTask(id,{due:old});});setTimeout(re,250);});
  const hi=Number(t.pri)>0,pb=(on,txt)=>el("button",{type:"button",class:"cat-chip pl-pri"+(hi===on?" on":""),"aria-pressed":String(hi===on),onclick:()=>{if(hi===on)return;const old=Number(t.pri)||0;patchTask(id,{pri:on?2:0});v3undoToast((on?"High priority: ":"Normal priority: ")+t.title,()=>{patchTask(id,{pri:old});});setTimeout(re,250);}},txt);
  return [el("div",{class:"v3-row"},el("label",{class:"field"},el("span",{class:"label",text:"Due"}),di),
      el("div",{class:"field"},el("span",{class:"label",text:"Priority"}),el("div",{class:"v3-cats",role:"group","aria-label":"Priority"},pb(false,"Normal"),pb(true,"High"))))];}
// facts on Today cards and bucket rows (only when a due date or High is set)
{const _vf=v3card;v3card=function(t,top,ctx){const c=_vf(t,top,ctx);try{const tx=plFact(t),h=c.querySelector(".cs-head");if(tx&&h&&!c.querySelector(".pl-fact"))h.after(el("p",{class:"hint pl-fact",text:tx}));}catch(e){console.warn(e);}return c;};}
window.__pl.cmp=plCmp;window.__pl.badges=plBadges;
