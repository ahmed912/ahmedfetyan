// ===== Round 12: weekly planning by chunks, the management meeting. Plan > Plan the week: Review, Intake, Plan (grid of days x B1, B2, Learning, Shallow), Commit. =====
// Serves procrastination (one clear next step per screen, Start on the first chunk), overwhelm (one step at a time, one item at a time) and the firm line (facts, heroic plans flagged).
let wkS={step:0,wi:0,ii:0,sel:null,rm:null,from:null};
function wkStart(){const t=iso(new Date());return isFriday(t)?addDays(t,1):wfSat(t);}
function wkDays(w0){const t=iso(new Date()),out=[];for(let i=0;i<7;i++){const d=addDays(w0,i);if(isFriday(d)||rlBuffer(d)||d<t)continue;out.push(d);}return out;}
const wkDn=d=>fmt(d,{weekday:"short"});
const wkCellName={b1:"B1",b2:"B2",learn:"Learning",shallow:"Shallow"};
// what can still be placed: backlog and waiting tasks, grouped by project, learning, shallow
function wkPool(){const seen=new Set(),L=[];[...backlogList(),...rlWaiting()].forEach(t=>{if(!seen.has(t.id)&&!t.done&&!t.cut&&!t.archived&&!t.bucket){seen.add(t.id);L.push(t);}});
  const g=new Map();L.forEach(t=>{const k=chKind(t),key=k==="design"?"d|"+chBk(t):k;if(!g.has(key))g.set(key,{key,kind:k,bk:k==="design"?chBk(t):null,tasks:[]});g.get(key).tasks.push(t);});
  const kr={design:0,learn:1,shallow:2};
  g.forEach(x=>{x.tasks.sort((a,b)=>(Number(b.pri)||0)-(Number(a.pri)||0)||String(a.due||"9999").localeCompare(String(b.due||"9999"))||(a.order||0)-(b.order||0));
    x.name=x.kind==="design"?chBkName(x.bk):x.kind==="learn"?"Learning":"Shallow batch";x.mins=x.tasks.reduce((a,t)=>a+estMin(t),0);});
  return [...g.values()].sort((a,b)=>kr[a.kind]-kr[b.kind]||(a.tasks[0].order||0)-(b.tasks[0].order||0));}
function wkCell(d,k){const c=chunksOn(d).find(x=>x.kind===k);return {tasks:c?c.tasks:[],held:c&&c.held?c.held:[]};}
const wkMin=ts=>ts.reduce((a,t)=>a+estMin(t),0);
const wkH=m=>Math.round(m/6)/10;
// place a pool group into a cell: fills up to the block, the rest stays in the pool
function wkPlace(d,k){const gr=wkPool().find(g=>g.key===wkS.sel);if(!gr){toast("Pick a project first");return;}
  const kind=gr.kind,okCell=kind==="design"?(k==="b1"||k==="b2"):kind==="learn"?k==="learn":k==="shallow";
  if(!okCell){toast(kind==="shallow"?"Shallow work stays in the shallow batch":kind==="learn"?"Learning has its own block":"Projects go in Block 1 or Block 2");return;}
  const cell=wkCell(d,k),cap=chunkCap(d,k);let load=wkMin(cell.tasks);
  if(kind==="design"){const other=cell.held.some(x=>x!==gr.bk);if(other){toast(wkDn(d)+" "+wkCellName[k]+" holds "+chBkName(cell.held[0])+". One project per block.");return;}
  }
  const take=[];for(const t of gr.tasks){const m=estMin(t);if(take.length&&load+m>cap)break;if(!take.length&&load>=cap&&cell.tasks.length){break;}take.push(t);load+=m;}
  if(!take.length){toast(wkDn(d)+" "+wkCellName[k]+" is full");return;}
  const patches={},slot=kind==="design"?(k==="b1"?1:2):null;
  take.forEach(t=>{patches[t.id]={date:d,slot,mode:modeOf(t),sprint:rlSpN(d)!=null?rlSpN(d):null,waiting:null,inbox:false};});
  const old=rlWrite(patches);render();wkS.rm=null;const left=gr.tasks.length-take.length;
  v3undoToast(wkDn(d)+" "+wkCellName[k]+": "+gr.name+" "+wkH(load)+" of "+wkH(cap)+" h"+(left?". "+left+" left":""),()=>{rlRestore(old);if(wkS.open)wkReopen();});
  if(!left)wkS.sel=null;if(wkS.open)wkReopen();}
function wkRemove(d,k){const cell=wkCell(d,k);if(!cell.tasks.length)return;const patches={};cell.tasks.filter(t=>!t.done).forEach(t=>{patches[t.id]={date:null,slot:null,waiting:null};});
  const n=Object.keys(patches).length;if(!n){toast("Done work stays");return;}const old=rlWrite(patches);wkS.rm=null;render();v3undoToast(wkDn(d)+" "+wkCellName[k]+" cleared ("+n+")",()=>{rlRestore(old);if(wkS.open)wkReopen();});if(wkS.open)wkReopen();}
// facts
function wkFacts(w0){const days=wkDays(w0),all=[];for(let i=0;i<7;i++){const d=addDays(w0,i);if(!isFriday(d))all.push(d);}
  const mk=d=>{const ch=chunksOn(d),by={};ch.forEach(c=>{by[c.kind]=c;});return by;};
  let workMin=0,blocks=0,learnDays=0,heroic=[],tgt=0;
  all.forEach(d=>{const by=mk(d),dm=wkMin(by.b1.tasks)+wkMin(by.b2.tasks);workMin+=dm;tgt+=v3dayMin(d);
    ["b1","b2"].forEach(k=>{if(by[k].tasks.length)blocks++;});
    if(wkMin(by.learn.tasks)>=chCfg().learn.minMin)learnDays++;
    if(dm/60>Number(v3dayMin(d))/50+0.01)heroic.push(d);});
  return {workH:wkH(workMin),tgtH:pomN(tgt),blocks,learnDays,days:all.length,heroic,open:days};}
function wkRisk(){const today=iso(new Date()),out=[];
  bkList().filter(b=>!b.archived&&b.bState!=="paused"&&b.bState!=="done").forEach(b=>{const ts=Object.entries(state.tasks||{}).filter(([i,t])=>t&&t.parent===b.id&&!t.done&&!t.cut&&!t.archived).map(([i,t])=>t),
      due=[b.bEnd,...ts.map(t=>t.due)].filter(Boolean).sort()[0];if(!due||due<today)return;
    const h=wkH(wkMin(ts)),n=[];for(let d=today;d<=due;d=addDays(d,1))if(!isFriday(d))n.push(d);const capH=n.reduce((a,d)=>a+pomN(v3dayMin(d)),0);
    if(h>capH)out.push({name:b.title,due,h,days:n.length,short:Math.round((h-capH)*10)/10});});
  return out.sort((a,b)=>a.due<b.due?-1:1)[0]||null;}
function wkReview(w0){const prev=addDays(w0,-7),days=[];for(let i=0;i<7;i++){const d=addDays(prev,i);if(!isFriday(d))days.push(d);}
  const t=iso(new Date()),past=days.filter(d=>d<t),work=past.reduce((a,d)=>a+v3workMin(d),0),tg=past.reduce((a,d)=>a+v3dayMin(d),0),ln=past.reduce((a,d)=>a+learnDone(d),0),lt=past.length*chCfg().learn.minMin;
  const r=capRec(),short=days.filter(d=>{const ns=sleepsOn(d).filter(x=>x.kind==="night");return ns.length&&ns.reduce((a,x)=>a+(x.end-x.start)/36e5,0)<r.sleepMinH;}).length;
  return {work:pomS(work),tg:pomS(tg),ln,lt,short,risk:wkRisk(),carried:rlGroups(rlWaiting()),days:past.length};}
// the wizard
function wkReopen(){if(!wkS.open)return;const s=sheetStack&&sheetStack[0];if(s&&s.re)s.re();}
function wkSave(commit){const w0=wkS.w0,f=wkFacts(w0),map={};wkDays(w0).concat([]).forEach(d=>{chunksOn(d).forEach(c=>{if(c.tasks.length&&c.kind!=="b3")map[d+"|"+c.kind]=c.tasks.map(t=>t.id);});});
  const doc={week:w0,at:Date.now(),committed:!!commit,step:wkS.step,map,facts:{workH:f.workH,tgtH:f.tgtH,blocks:f.blocks,learnDays:f.learnDays,days:f.days}};
  state.plans={...(state.plans||{}),[w0]:doc};try{store.set("plans/"+w0,doc);}catch(e){fail(e);}return doc;}
function wkOpen(){wkS.w0=wkS.w0||wkStart();const w0=wkS.w0,ex=(state.plans||{})[w0];
  if(ex&&!ex.committed&&wkS.step===0&&!wkS.resumed){wkS.step=ex.step||0;wkS.resumed=true;}
  psOpen("Plan the week",re=>wkBody(re),{onClose:()=>{wkS.open=false;}});wkS.open=true;}
function wkStepBar(){const n=["Review","Intake","Plan","Commit"];return el("div",{class:"wk-steps",role:"group","aria-label":"Steps"},...n.map((x,i)=>el("span",{class:"wk-st"+(i===wkS.step?" on":""),"aria-current":i===wkS.step?"step":null,text:(i+1)+" "+x})));}
function wkNav(re,next,label,back){return el("div",{class:"v3-row wk-nav"},back?el("button",{type:"button",class:"btn ghost wk-back",onclick:()=>{wkS.step=Math.max(0,wkS.step-1);wkSave(false);re();}},"Back"):null,
  el("button",{type:"button",class:"btn wk-next",onclick:next},label||"Next"));}
function wkBody(re){const w0=wkS.w0,hdr=[el("p",{class:"hint wk-week",text:"Week of "+fmt(w0,{weekday:"long",day:"numeric",month:"short"})}),wkStepBar()];
  if(wkS.step===0)return hdr.concat(wkStep0(re,w0));if(wkS.step===1)return hdr.concat(wkStep1(re));if(wkS.step===2)return hdr.concat(wkStep2(re,w0));return hdr.concat(wkStep3(re,w0));}
function wkStep0(re,w0){const r=wkReview(w0),waitG=r.carried,dec=rlWaiting().filter(rlNeedsDecide);const lines=[];
  lines.push("Work "+r.work+" of "+r.tg+" h last week. Learning "+r.ln+" of "+r.lt+" min.");
  lines.push(r.risk?"Deadline at risk: "+r.risk.name+", due "+fmt(r.risk.due,{day:"numeric",month:"short"})+". "+r.risk.h+" h open, "+r.risk.days+" work days left, "+r.risk.short+" h short.":"No deadline at risk.");
  lines.push(r.short?"Sleep under the minimum on "+r.short+" night"+(r.short===1?"":"s")+".":"Sleep held its minimum.");
  lines.push(waitG.length?"Carried: "+waitG.length+" chunk"+(waitG.length===1?"":"s")+" waiting.":"Nothing carried.");
  const out=[el("ul",{class:"wk-facts"},...lines.map(x=>el("li",{text:x})))];
  if(waitG.length){const i=Math.min(wkS.wi,waitG.length-1),g=waitG[i],needs=g.tasks.filter(rlNeedsDecide);
    out.push(el("section",{class:"wk-wait"},el("b",{text:"Waiting "+(i+1)+" of "+waitG.length+": "+g.name+" · "+rlTasks(g.tasks.length)}),el("p",{class:"hint",text:g.tasks.slice(0,3).map(t=>t.title).join(", ")+(g.tasks.length>3?" and "+(g.tasks.length-3)+" more":"")}),
      ...needs.map(t=>el("div",{class:"rl-decide"},el("p",{class:"rl-dt",text:"Postponed "+rlPost(t)+" times. Decide: "+t.title}),rlDecideBtns(t.id,()=>setTimeout(wkOpen,150)))),
      needs.length?el("p",{class:"hint wk-must",text:"Decide first. It cannot go into the week postponed again."}):el("button",{type:"button",class:"btn ghost wk-keep",onclick:()=>{if(i<waitG.length-1){wkS.wi=i+1;re();}else{wkS.wi=waitG.length;re();}}},i<waitG.length-1?"Keep for the plan, next":"Keep for the plan")));}
  const blocked=dec.length>0;
  out.push(wkNav(re,()=>{if(blocked){toast("Decide "+dec.length+" postponed task"+(dec.length===1?"":"s")+" first");return;}wkS.step=1;wkSave(false);re();},"Next: intake"));return out;}
function wkStep1(re){const inb=inboxList();if(!inb.length)return [el("p",{class:"hint wk-empty",text:"Inbox is empty. Nothing to sort."}),wkNav(re,()=>{wkS.step=2;wkSave(false);re();},"Next: plan",true)];
  const i=Math.min(wkS.ii,inb.length-1),t=inb[i],id=t.id;
  return [el("p",{class:"hint",text:"Inbox "+(i+1)+" of "+inb.length}),el("p",{class:"ps-sh-sum wk-it",text:t.title}),chModeRow({...t,id},re),bkPicker(id,re),
    el("div",{class:"v3-row"},el("button",{type:"button",class:"btn wk-sort",onclick:()=>{const old={inbox:!!t.inbox};patchTask(id,{inbox:false});v3undoToast("Sorted: "+t.title,()=>{patchTask(id,old);if(wkS.open)wkReopen();});wkS.ii=0;re();}},"Sorted"),
      el("button",{type:"button",class:"btn ghost wk-later",onclick:()=>{wkS.ii=(i+1)%inb.length;re();}},"Later"),
      el("button",{type:"button",class:"btn ghost wk-bl",onclick:()=>{plToBacklog(id);wkS.ii=0;re();}},"Backlog")),
    wkNav(re,()=>{wkS.step=2;wkSave(false);re();},"Next: plan",true)];}
function wkStep2(re,w0){const days=wkDays(w0),pool=wkPool(),out=[];
  if(!days.length)return [el("p",{class:"hint wk-empty",text:"No days left this week to plan. Friday and buffer days stay free."}),wkNav(re,()=>{wkS.step=3;wkSave(false);re();},"Next: commit",true)];
  const sel=pool.find(g=>g.key===wkS.sel);if(!sel)wkS.sel=null;
  const chips=pool.slice(0,5).map(g=>el("button",{type:"button",class:"cat-chip wk-chip"+(wkS.sel===g.key?" on":""),"aria-pressed":String(wkS.sel===g.key),"data-k":g.key,onclick:()=>{wkS.sel=wkS.sel===g.key?null:g.key;wkS.rm=null;re();}},g.name+" · "+wkH(g.mins)+" h"));
  out.push(pool.length?el("div",{class:"v3-cats wk-pool",role:"group","aria-label":"To place"},...chips,pool.length>5?el("span",{class:"hint",text:(pool.length-5)+" more"}):null):el("p",{class:"hint wk-empty",text:"Nothing left to place. Add tasks in the Inbox or a project."}));
  out.push(el("p",{class:"hint",text:sel?"Tap a block for "+sel.name+". It fills to the block; the rest stays in the list.":"Tap a project, then a block. Hold a filled block to clear it."}));
  const rows=days.map(d=>{const by={};chunksOn(d).forEach(c=>{by[c.kind]=c;});const dm=wkMin(by.b1.tasks)+wkMin(by.b2.tasks),heroic=dm/60>v3dayMin(d)/50+0.01,noL=wkMin(by.learn.tasks)<chCfg().learn.minMin;
    const cell=(k)=>{const c=by[k],tk=c.tasks,cap=chunkCap(d,k),u=wkMin(tk),names=[...new Set(tk.map(t=>chBkName(chBk(t))))];
      const txt=tk.length?(k==="learn"||k==="shallow"?wkH(u)+" of "+wkH(cap)+" h":names.join("/")+" "+wkH(u)+"h"):"free";
      const b=el("button",{type:"button",class:"wk-cell"+(tk.length?" has":"")+(u>cap?" over":""),"data-d":d,"data-k":k,"aria-label":wkDn(d)+" "+wkCellName[k]+": "+txt,onclick:()=>{if(wkS.sel){wkPlace(d,k);}else if(tk.length){wkS.rm=wkS.rm===d+"|"+k?null:d+"|"+k;re();}}},el("span",{class:"wk-ck",text:wkCellName[k]}),el("span",{class:"wk-cv",text:txt}));
      if(tk.length)rsLong(b,()=>wkRemove(d,k));return b;};
    return el("div",{class:"wk-row","data-d":d},el("b",{class:"wk-d",text:wkDn(d)+" "+Number(d.slice(8))}),cell("b1"),cell("b2"),cell("learn"),cell("shallow"),
      (heroic||noL)?el("span",{class:"hint wk-flag"+(heroic?" heroic":""),text:(heroic?"Heavy: "+wkH(dm)+" h planned. ":"")+(noL?"No learning.":"")}):null);});
  out.push(el("div",{class:"wk-grid"},...rows));
  if(wkS.rm){const [d,k]=wkS.rm.split("|");out.push(el("div",{class:"v3-row wk-rm"},el("span",{class:"hint",text:wkDn(d)+" "+wkCellName[k]+" holds "+wkCell(d,k).tasks.length+" task(s)"}),el("button",{type:"button",class:"btn ghost wk-clear",onclick:()=>wkRemove(d,k)},"Clear it")));}
  out.push(wkNav(re,()=>{wkS.step=3;wkSave(false);re();},"Next: commit",true));return out;}
function wkStep3(re,w0){const f=wkFacts(w0),n=Math.round((parse(END)-parse(iso(new Date())))/864e5),ex=(state.plans||{})[w0];
  const lines=["Work "+f.workH+" of "+f.tgtH+" h in "+f.blocks+" deep block"+(f.blocks===1?"":"s")+".","Learning "+f.learnDays+" of "+f.days+" days.","Gate 1: "+fmt(END,{day:"numeric",month:"short"})+", "+n+" day"+(n===1?"":"s")+"."];
  if(f.heroic.length)lines.push("Heavy: "+f.heroic.map(wkDn).join(", ")+" above the baseline. Stretch is never planned in.");
  if(ex&&ex.committed)lines.push("Committed "+fmt(iso(new Date(ex.at)),{weekday:"short",day:"numeric",month:"short"})+". You can re-plan.");
  return [el("ul",{class:"wk-facts wk-commit"},...lines.map(x=>el("li",{text:x}))),
    el("button",{type:"button",class:"btn wk-go",onclick:()=>{wkSave(true);const first=wkFirstChunk();wkS.step=0;wkS.resumed=false;psClose(true);wkS.open=false;
      v3undoToast("Week planned: work "+f.workH+" of "+f.tgtH+" h",()=>{const d=(state.plans||{})[w0];if(d){const nd={...d,committed:false};state.plans={...state.plans,[w0]:nd};try{store.set("plans/"+w0,nd);}catch(e){}}});
      if(first)setTimeout(()=>chStart(first),200);}},"Commit and start"),
    el("button",{type:"button",class:"btn ghost wk-save",onclick:()=>{wkSave(true);wkS.step=0;wkS.resumed=false;psClose(true);wkS.open=false;toast("Week saved");}},"Commit, start later"),
    el("button",{type:"button",class:"btn ghost wk-back",onclick:()=>{wkS.step=2;wkSave(false);re();}},"Back to the plan")];}
// the first chunk of today with open work, as cards for Start
function wkFirstChunk(){const t=iso(new Date());for(const k of ["b1","b2"]){const c=chunksOn(t).find(x=>x.kind===k);if(c&&c.tasks.some(x=>!x.done))return chCards(c.tasks.filter(x=>!x.done),t).filter(x=>!x.done);}return null;}
// entry on the Plan page
function wkEntry(){const pg=document.querySelector('.page[data-page="projects"]');if(!pg||pg.hidden)return;const head=pg.querySelector(".pl-head");if(!head)return;let b=document.getElementById("wkBtn");
  const sat=CAP_WD[parse(iso(new Date())).getDay()]==="sat";
  if(!b){b=el("button",{type:"button",id:"wkBtn",class:"btn wk-open",onclick:()=>{wkS.step=0;wkS.w0=wkStart();wkS.resumed=false;wkOpen();}},"Plan the week");}
  b.className="btn wk-open"+(sat?"":" ghost");if(b.parentElement!==head)head.append(b);}
{const _r12=render;render=function(){_r12();try{wkEntry();}catch(e){console.warn(e);}};}
{const _sp=setPage;setPage=function(p,...a){const r=_sp(p,...a);try{wkEntry();}catch(e){}return r;};}
window.__wk={open:()=>{wkS.step=0;wkS.w0=wkStart();wkS.resumed=false;wkOpen();},facts:wkFacts,pool:wkPool,state:wkS,place:wkPlace,start:wkStart,days:wkDays};
