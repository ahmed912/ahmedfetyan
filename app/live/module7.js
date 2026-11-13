// ===== Round 2: checklists inside tasks, collapsed views, Start 5 min, Undo task diet =====
// checklist item: {t,done,o} stored as task.check = {<itemId>:{...}} (an object keyed by id so two devices never overwrite each other)
function ckList(t){const c=t&&t.check;if(!c)return [];const a=Array.isArray(c)?c.map((v,i)=>[v&&v.id||("i"+i),v]):Object.entries(c);
  return a.filter(([k,v])=>v&&v.t!=null).map(([k,v],i)=>({id:k,t:String(v.t),done:!!v.done,o:v.o!=null?v.o:i})).sort((x,y)=>x.o-y.o);}
function ckCount(t){const L=ckList(t);return {n:L.length,d:L.filter(x=>x.done).length,next:L.find(x=>!x.done)||null};}
function ckAsObj(t){const o={};ckList(t).forEach(x=>{o[x.id]={t:x.t,done:x.done,o:x.o};});return o;}
function ckSave(tid,next,ops){const t=state.tasks[tid];if(!t)return;state.tasks[tid]={...t,check:next};
  const patch=window.__sbSafe?{$d:ops}:{check:next};
  try{Promise.resolve(store.update("tasks/"+tid,patch)).catch(fail);}catch(e){fail(e);}render();}
const ckId=()=>"c"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
function ckAdd(tid,text){text=String(text||"").trim();if(!text)return;const t=state.tasks[tid];if(!t)return;const L=ckList(t),cur=ckAsObj(t),id=ckId(),o=L.length?L[L.length-1].o+1:0;
  cur[id]={t:text,done:false,o};ckSave(tid,cur,[{p:["check",id],set:{t:text,done:false,o}}]);}
function ckEdit(tid,id,text){text=String(text||"").trim();const cur=ckAsObj(state.tasks[tid]);if(!cur[id])return;if(!text||text===cur[id].t)return;cur[id]={...cur[id],t:text};ckSave(tid,cur,[{p:["check",id,"t"],set:text}]);}
function ckTick(tid,id,on){const cur=ckAsObj(state.tasks[tid]);if(!cur[id])return;cur[id]={...cur[id],done:!!on};ckSave(tid,cur,[{p:["check",id,"done"],set:!!on}]);}
function ckDel(tid,id){const cur=ckAsObj(state.tasks[tid]);if(!cur[id])return;delete cur[id];ckSave(tid,cur,[{p:["check",id],del:1}]);}
function ckMove(tid,id,dir){const L=ckList(state.tasks[tid]),i=L.findIndex(x=>x.id===id),j=i+dir;if(i<0||j<0||j>=L.length)return;const cur=ckAsObj(state.tasks[tid]);
  const a=L[i],b=L[j];cur[a.id]={...cur[a.id],o:b.o};cur[b.id]={...cur[b.id],o:a.o};ckSave(tid,cur,[{p:["check",a.id,"o"],set:b.o},{p:["check",b.id,"o"],set:a.o}]);}
function ckRow(tid,s,i,L,re){const cb=el("input",{type:"checkbox","aria-label":"Done: "+s.t});cb.checked=s.done;cb.onchange=()=>{ckTick(tid,s.id,cb.checked);setTimeout(re,250);};
  const inp=el("input",{type:"text",class:"v3-in ck-t"+(s.done?" v3-done":""),"aria-label":"Step"});inp.value=s.t;inp.onchange=()=>{ckEdit(tid,s.id,inp.value);setTimeout(re,250);};
  inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();inp.blur();}});
  const acts=el("div",{class:"ck-acts",hidden:""},el("button",{type:"button",class:"mini",disabled:i===0?"":null,onclick:()=>{ckMove(tid,s.id,-1);setTimeout(re,250);}},"Move up"),
    el("button",{type:"button",class:"mini",disabled:i===L.length-1?"":null,onclick:()=>{ckMove(tid,s.id,1);setTimeout(re,250);}},"Move down"),
    el("button",{type:"button",class:"mini danger",onclick:()=>{ckDel(tid,s.id);setTimeout(re,250);}},"Delete"));
  const more=el("button",{type:"button",class:"mini","aria-label":"Menu for "+s.t,"aria-expanded":"false",onclick:()=>{acts.hidden=!acts.hidden;more.setAttribute("aria-expanded",String(!acts.hidden));}},"...");
  const li=el("li",{class:"q-row ck-row","data-ck":s.id},cb,inp,more,acts);rsLong(li,()=>{acts.hidden=false;more.setAttribute("aria-expanded","true");});return li;}
function ckSection(t,re){const L=ckList(t),n=L.length,d=L.filter(x=>x.done).length,id=t.id;
  const add=el("input",{type:"text",class:"v3-in ck-add","aria-label":"Add a step",placeholder:"Add a step"});
  add.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();const v=add.value;add.value="";ckAdd(id,v);setTimeout(()=>{re();setTimeout(()=>{const x=document.querySelector(".ps-sheet .ck-add");if(x)x.focus();},60);},250);}});
  return el("section",{class:"ck-sec","aria-label":"Steps"},el("span",{class:"label",text:"Steps"+(n?" ("+d+" of "+n+")":"")}),
    n?el("ul",{class:"q-list ck-list"},...L.map((s,i)=>ckRow(id,s,i,L,re))):el("p",{class:"hint ck-empty",text:"No steps yet"}),add);}
// Today card: "1 of 3 · next: ..." under the title
{const _vc=v3card;v3card=function(t,top,ctx){const c=_vc(t,top,ctx);try{const src=state.tasks[t.id]||t,k=ckCount(src);
    if(k.n&&!c.querySelector(".ck-line")){const head=c.querySelector(".cs-head");const line=el("p",{class:"hint ck-line",text:k.d+" of "+k.n+(k.next?" · next: "+k.next.t:"")});if(head)head.after(line);else c.prepend(line);}
    // parent cards: 3 open steps, the rest behind "n more"
    const ul=c.querySelector(".cs-steps");if(ul){const lis=[...ul.children].filter(x=>!x.classList.contains("done"));
      if(lis.length>3){const key="card:"+t.id;const ex=!!ckExp[key];if(!ex)lis.slice(3).forEach(x=>x.hidden=true);
        ul.after(el("button",{type:"button",class:"mini ck-more",onclick:()=>{ckExp[key]=!ex;renderCutList();try{renderTaskView();}catch(e){}}},ex?"Show less":(lis.length-3)+" more"));}}
    const h=c.querySelector(".cs-t");if(h&&!h.dataset.li&&!h.dataset.ck){h.dataset.ck="1";h.classList.add("ck-open");h.setAttribute("role","button");h.addEventListener("pointerdown",e=>e.stopPropagation());h.addEventListener("click",e=>{e.stopPropagation();v3taskSheet(t.id);});if(!t.done)rsLong(h,()=>v3taskMenu(t.id));}
    if(c.querySelector(".cl-acts")&&cutDesc===t.id&&!t.done)c.querySelector(".cl-acts").append(el("button",{type:"button",class:"btn ghost",onclick:()=>v3five(t.id)},"Start for 5 minutes"));
  }catch(e){console.warn(e);}return c;};}
let ckExp={};
// counts of projects and tasks, never steps
function ckProjectRows(list,re){const g=new Map();list.forEach(t=>{const b=bkOfId(t.id),k=b||"none";if(!g.has(k))g.set(k,[]);g.get(k).push(t);});
  const out=[];[...g.entries()].forEach(([k,L])=>{const ex=!!ckExp["sp:"+k];out.push(el("li",{class:"v3-gh",text:(k==="none"?"No project":(state.tasks[k]||{}).title||"Project")+" ("+L.length+")"}));
    (ex?L:L.slice(0,3)).forEach(t=>out.push(v3taskRow(t,v3dl(t.date))));
    if(L.length>3)out.push(el("li",{},el("button",{type:"button",class:"mini ck-more",onclick:()=>{ckExp["sp:"+k]=!ex;re();}},ex?"Show less":(L.length-3)+" more")));});
  return out;}
function ckCountLine(list){const p=new Set(list.map(t=>bkOfId(t.id)||"none")).size;return el("p",{class:"hint ck-count",text:p+" project"+(p===1?"":"s")+", "+list.length+" task"+(list.length===1?"":"s")});}
// the little "1 of 3" on bucket rows
{const _br=bkRow;bkRow=function(t,first){const li=_br(t,first);try{const k=ckCount(t);if(k.n){const b=li.querySelector(".bk-t");if(b)b.after(el("span",{class:"hint ck-mini",text:k.d+" of "+k.n}));}}catch(e){}return li;};}
// ---- Start for 5 minutes: the existing focus timer, a 5 minute round on this task ----
function v3five(id){const t=state.tasks[id];if(!t)return;if(warGet()){v3start(id);return;}
  const r=pRun();if(r&&r.what==="tasks:"+id&&r.startedAt){openPomoFull();return;}
  pStartFor({what:"tasks:"+id,label:t.title,minutes:5});const r2=pRun();if(r2)setPomo({...r2,five:true});}
function v3keep(){const r=pRun();if(!r)return;setPomo({...r,five:false,overAt:null,overAs:null,block:null,round:1,durationMs:pElapsed(r)+20*60000});toast("Keep going. 20 more minutes.");}
{const _po=pOver;pOver=function(r){if(r&&r.five&&r.phase==="focus"){const endAt=r.startedAt+(r.pausedTotal||0)+r.durationMs;setPomo({...r,overAt:endAt,overAs:"focus"});toast("5 minutes done. Keep going or stop here, both are fine.");say("5 minutes done");return;}return _po(r);};}
{const _nl=pNextLabel;pNextLabel=function(r){if(r&&r.five)return "Stop here";return _nl(r);};}
{const _eb=extBtns;extBtns=function(cls){const d=_eb(cls),r=pRun();if(d&&r&&r.five&&r.overAt&&!d.querySelector(".ck-keep"))d.prepend(el("button",{type:"button",class:cls+" ck-keep",onclick:v3keep},"Keep going"));return d;};}
// ---- task diet: apply and roll back, with a record in diet/<runId> ----
// rows: {op:"create",id?,doc} | {op:"patch",id,fields}. Returns the run id.
async function dietApply(rows,label){const runId="diet-"+Date.now(),rec={at:Date.now(),label:label||"Task diet",created:[],patched:{},n:0};
  for(const r of rows){if(r.op==="create"){let id=r.id;if(id){await store.set("tasks/"+id,r.doc);}else{const ref=await store.add("tasks",r.doc);id=ref.id;}rec.created.push(id);state.tasks[id]=r.doc;}
    else if(r.op==="patch"){const t=state.tasks[r.id];if(!t)continue;const old={};Object.keys(r.fields).forEach(k=>{old[k]=t[k]===undefined?null:JSON.parse(JSON.stringify(t[k]));});rec.patched[r.id]={...(rec.patched[r.id]||{}),...old};
      state.tasks[r.id]={...t,...r.fields};await store.update("tasks/"+r.id,r.fields);}}
  rec.n=rec.created.length+Object.keys(rec.patched).length;await store.set("diet/"+runId,rec);state.diet={...(state.diet||{}),[runId]:rec};render();return runId;}
async function dietRollback(runId){const rec=(state.diet||{})[runId];if(!rec||rec.undone)return false;
  for(const id of rec.created||[]){delete state.tasks[id];await store.del("tasks/"+id);}
  for(const [id,old] of Object.entries(rec.patched||{})){if(!state.tasks[id])continue;state.tasks[id]={...state.tasks[id],...old};await store.update("tasks/"+id,old);}
  const nr={...rec,undone:true,undoneAt:Date.now()};state.diet={...state.diet,[runId]:nr};await store.set("diet/"+runId,nr);render();return true;}
function dietSheet(){psOpen("Undo task diet",re=>{const runs=Object.entries(state.diet||{}).filter(([k,r])=>r&&!r.undone).sort((a,b)=>b[1].at-a[1].at);
  return runs.length?[el("p",{class:"hint",text:"One tap puts the tasks back as they were. Undo is on the bar below."}),el("ul",{class:"ps-sh-list"},...runs.map(([k,r])=>el("li",{},el("button",{type:"button",class:"ps-sh-row",onclick:async()=>{psClose(true);const ok=await dietRollback(k);toast(ok?"Tasks put back":"Nothing to undo");}},
    fmt(iso(new Date(r.at)),{day:"numeric",month:"short"})+": "+(r.label||"Task diet")+" ("+(r.n||0)+" changes)"))))]:[el("p",{class:"hint",text:"Nothing to undo"})];});}
function dietRow(){const rows=document.querySelector('.page[data-page="settings"] .set-rows');if(!rows||document.getElementById("dietRow"))return;
  rows.append(el("div",{class:"set-row",id:"dietRow"},el("div",{},el("b",{text:"Undo task diet"}),el("span",{class:"hint",text:"Put the tasks back as they were before a clean-up"})),el("button",{type:"button",class:"btn ghost",id:"dietBtn",onclick:dietSheet},"Open")));}
{const _r7=render;render=function(){_r7();try{dietRow();}catch(e){}};}
window.dietApply=dietApply;window.dietRollback=dietRollback;window.v3five=v3five;
window.__r2={pStop:()=>pStop(),closeFull:()=>{try{closePomoFull();}catch(e){}},setPage:p=>setPage(p)};
window.__r2.ckAdd=ckAdd;
__r2.psClose=()=>psClose(true);

// ===== Round 2B: the day as chunk cards (Block 1, Block 2, Stretch, Learning, Shallow batch) =====
// `block` already means Learning/Design/Batch on tasks (taskBlock), so the design slot lives in `slot` (1, 2 or 3).
const CH_DEF={b1:{start:"05:15",h:4},b2:{start:"09:45",h:4},b3:{start:"15:00",h:2,stretch:true},learn:{minMin:30,targetMin:60},shallowMin:120};
function chCfg(){const s=(state.settings&&state.settings.blocks)||{},g=k=>({...CH_DEF[k],...(s[k]||{})}),L={...CH_DEF.learn,...(s.learn||{})};
  L.minMin=Math.max(30,Number(L.minMin)||30);L.targetMin=Math.max(L.minMin,Number(L.targetMin)||60);
  const n=k=>{const o=g(k);o.h=Number(o.h)>0?Number(o.h):CH_DEF[k].h;return o;};
  return {b1:n("b1"),b2:n("b2"),b3:n("b3"),learn:L,shallowMin:Number(s.shallowMin)>0?Number(s.shallowMin):120};}
const CH_DEEP=["portfolio","client","learning"];
function modeOf(t){const m=t&&t.mode;if(m==="deep"||m==="shallow")return m;return CH_DEEP.includes(t&&t.cat)?"deep":"shallow";}
function chKind(t){if(modeOf(t)==="shallow")return "shallow";return t.cat==="learning"?"learn":"design";}
function chBk(t){if(t.id&&state.tasks[t.id]){const b=bkOfId(t.id);if(b)return b;}
  if(t.parent){return isBk(t.parent)?t.parent:(bkOfId(t.parent)||t.parent);}return "c:"+(t.cat||"x");}
function chBkName(k){if(String(k).startsWith("c:"))return CAT_NAME[String(k).slice(2)]||"Design";const p=state.tasks[k];return (p&&p.title)||"Project";}
// design tasks of a day to slots: explicit `slot` first, then a bucket joins its slot, else the first free slot, else Stretch
function chAssign(d,exId){const des=tasksOn(d).filter(t=>t.id!==exId&&chKind(t)==="design"),slotOf={},held={1:new Set(),2:new Set(),3:new Set()};
  des.forEach(t=>{const s=Number(t.slot);if(s>=1&&s<=3){slotOf[t.id]=s;held[s].add(chBk(t));}});
  const groups=new Map();des.forEach(t=>{if(slotOf[t.id])return;const k=chBk(t);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(t);});
  groups.forEach((ts,k)=>{let s=[1,2,3].find(n=>held[n].has(k));if(!s)s=[1,2,3].find(n=>!held[n].size);if(!s)s=3;held[s].add(k);ts.forEach(t=>{slotOf[t.id]=s;});});
  return {slotOf,held};}
function chunkOf(t){const d=t.date,k=chKind(t);if(k==="learn")return d+"|learn";if(k==="shallow")return d+"|shallow";
  const A=chAssign(d,null),s=A.slotOf[t.id]||Number(t.slot)||1;return d+"|"+s+"|"+chBk(t);}
function chunksOn(d){const A=chAssign(d,null),ch={b1:{kind:"b1",slot:1,tasks:[]},b2:{kind:"b2",slot:2,tasks:[]},b3:{kind:"b3",slot:3,tasks:[]},learn:{kind:"learn",tasks:[]},shallow:{kind:"shallow",tasks:[]}};
  tasksOn(d).forEach(t=>{const k=chKind(t);if(k==="design")ch["b"+A.slotOf[t.id]].tasks.push(t);else ch[k].tasks.push(t);});
  return ["b1","b2","b3","learn","shallow"].map(k=>({...ch[k],key:d+"|"+k,held:ch[k].slot?[...A.held[ch[k].slot]]:[]}));}
// where a dated task goes. Returns the fields to write: {slot,mode}
function placeInChunk(t,d){const k=chKind(t),mode=t.mode==="deep"||t.mode==="shallow"?t.mode:modeOf(t);
  if(k!=="design")return {slot:null,mode};
  const A=chAssign(d,t.id),bk=chBk(t);let s=[1,2,3].find(n=>A.held[n].has(bk));if(!s)s=[1,2,3].find(n=>!A.held[n].size);if(!s)s=3;return {slot:s,mode};}
function workHoursDone(d){return pomN(v3workMin(d));}
function learnDone(d){return Math.round(learningOn(d)*60);}
function inBlock(now){const c=chCfg(),m=now==null?(()=>{const n=new Date();return n.getHours()*60+n.getMinutes();})():(now instanceof Date?now.getHours()*60+now.getMinutes():Number(now));
  for(const k of ["b1","b2","b3"]){const s=hmMin(c[k].start);if(m>=s&&m<s+c[k].h*60)return k;}return null;}
// placement hooks: a dated task is added, or its date changes
{const _add=store.add;store.add=function(col,body){try{if(col==="tasks"&&body&&body.date&&body.slot===undefined&&!body.bucket&&!body.cut){const pl=placeInChunk({...body,id:"__new"},body.date);body.mode=pl.mode;if(pl.slot)body.slot=pl.slot;}}catch(e){console.warn(e);}return _add.apply(this,arguments);};}
let chSkip=false;const chSnap={};
{const _st=setTask;setTask=function(id,patch){try{if(!chSkip&&patch&&typeof patch.date==="string"&&patch.slot===undefined){const t=state.tasks[id];
      if(t&&isLeaf({...t,id})){(chSnap[id]=chSnap[id]||[]).push({slot:t.slot===undefined?null:t.slot,mode:t.mode===undefined?null:t.mode});if(chSnap[id].length>6)chSnap[id].shift();
        const pl=placeInChunk({...t,id},patch.date);patch={...patch,...pl};state.tasks[id]={...state.tasks[id],...pl};}}}catch(e){console.warn(e);}
    return _st.call(this,id,patch);};}
{const _ru=v3recUndo;v3recUndo=function(rec){chSkip=true;try{_ru(rec);}finally{chSkip=false;}
    try{(rec.moves||[]).forEach(m=>{const s=(chSnap[m.id]||[]).pop();if(s&&state.tasks[m.id]){state.tasks[m.id]={...state.tasks[m.id],slot:s.slot,mode:s.mode};setTask(m.id,{slot:s.slot,mode:s.mode});}});}catch(e){console.warn(e);}};}
// cards of one chunk: same grouping as cardsOn (a parent with its steps)
function chCards(tasks,d){const groups=new Map();
  tasks.forEach(l=>{const p=l.parent&&state.tasks[l.parent]&&!state.tasks[l.parent].bucket&&!state.tasks[l.parent].cut&&!state.tasks[l.parent].archived?l.parent:null,key=p||l.id;
    if(!groups.has(key))groups.set(key,{key,p,steps:[]});groups.get(key).steps.push(l);});
  return [...groups.values()].map(g=>{if(!g.p)return {...g.steps[0],rank:slotRank(g.steps[0].cat)};
    const P=state.tasks[g.p],steps=g.steps.sort((a,b)=>(a.order||0)-(b.order||0));
    return {...P,id:g.p,steps,_card:true,date:d,cat:P.cat||steps[0].cat,mins:steps.reduce((a,s)=>a+estMin(s),0),done:steps.every(s=>s.done),order:Math.min(...steps.map(s=>s.order||0)),rank:slotRank(P.cat||steps[0].cat)};})
    .sort((a,b)=>{const pa=a.pos!=null,pb=b.pos!=null;if(pa&&pb)return a.pos-b.pos;if(pa!==pb)return pa?-1:1;return (a.rank-b.rank)||((a.order||0)-(b.order||0));});}
let chWar=null;
{const _wp=warPool;warPool=function(tg){if(chWar&&Date.now()-chWar.at<300000&&tg&&tg.k==="task"&&tg.v===chWar.v){return chWar.ids.map(id=>({id,...state.tasks[id]})).filter(x=>x.title);}return _wp(tg);};}
function chStart(cards){const first=cards[0];if(!first)return;const ids=[];cards.forEach(c=>{(c.steps?c.steps.filter(s=>!s.done):[c]).forEach(s=>ids.push(s.id));});chWar={v:first.id,ids,at:Date.now()};v3start(first.id);}
let chBuild=false;{const _sw=swipeable;swipeable=function(c,r,l,tap,...rest){return _sw.call(this,c,r,l,chBuild?null:tap,...rest);};}
let chTog={},chExp={};
const chH=h=>(Math.round(h*10)/10)+" h";
function chTitle(c,cfg,total){
  if(c.kind==="learn")return c.tasks.length?"Learning · "+(cfg.learn.targetMin%60?cfg.learn.targetMin+" min":chH(cfg.learn.targetMin/60)):"Learning: none planned, minimum "+cfg.learn.minMin+" min";
  if(c.kind==="shallow"){const open=c.tasks.filter(t=>!t.done);return "Shallow batch · "+open.length+" item"+(open.length===1?"":"s")+" · "+dur(open.reduce((a,t)=>a+estMin(t),0));}
  const n=c.kind==="b3"?"Stretch":"Block "+c.slot,names=[...new Set(c.tasks.map(t=>chBkName(chBk(t))))];
  if(c.kind==="b3")return "Stretch · "+chH(cfg.b3.h);
  return (names.length>1?names.length+" projects in "+n:n+" · "+(names[0]||"Design"))+" · "+chH(cfg[c.kind].h);}
function chDefaultOpen(d,chunks){const by={};chunks.forEach(c=>{by[c.kind]=c;});const op=c=>c&&c.tasks.some(t=>!t.done);
  const des=["b1","b2","b3"];
  if(d===iso(new Date())){const c=chCfg(),n=new Date(),m=n.getHours()*60+n.getMinutes(),e1=hmMin(c.b1.start)+c.b1.h*60,e2=hmMin(c.b2.start)+c.b2.h*60;
    if(m<e2){const cur=m<e1?"b1":"b2",order=[cur,...des.filter(k=>k!==cur)];const k=order.find(k=>op(by[k]));return k||null;}
    return op(by.learn)?"learn":op(by.shallow)?"shallow":"learn";}
  return [...des,"learn","shallow"].find(k=>op(by[k]))||null;}
function chRender(){const ul=document.getElementById("cutStack");if(!ul)return;const d=sel,cfg=chCfg(),chunks=chunksOn(d),by={};chunks.forEach(c=>{by[c.kind]=c;});
  const doneH=workHoursDone(d),baseH=pomN(v3dayMin()),defOpen=chDefaultOpen(d,chunks),nodes=[];
  const design=chunks.filter(c=>c.slot&&c.tasks.length);
  const card=(c,visible)=>{const open0=chTog[c.key]!=null?chTog[c.key]:c.kind===defOpen,hasItems=c.tasks.length>0,allDone=hasItems&&c.tasks.every(t=>t.done),open=open0&&hasItems&&!allDone;
    const title=chTitle(c,cfg)+(allDone?" · done":"");
    const head=el("button",{type:"button",class:"ch-head","aria-expanded":String(open),disabled:hasItems&&!allDone?null:"",onclick:()=>{chTog[c.key]=!open;renderCutList();}},el("span",{class:"ch-t",text:title}),hasItems&&!allDone?el("span",{class:"hint ch-s",text:open?"Less":"Open"}):null);
    let body=null;
    if(open){const cards=chCards(c.tasks,d).filter(x=>!x.done),ex=!!chExp[c.key],show=ex?cards:cards.slice(0,3);chBuild=true;
      try{const list=el("div",{class:"ch-list"},...show.map(x=>v3card(x,false,"stack")));
        const first=cards[0],stepId=first&&(first.steps?(first.steps.find(s=>!s.done)||first.steps[0]).id:first.id);
        body=el("div",{class:"ch-body"},list,cards.length>3?el("button",{type:"button",class:"mini ck-more",onclick:()=>{chExp[c.key]=!ex;renderCutList();}},ex?"Show less":(cards.length-3)+" more"):null,
          el("div",{class:"cl-acts ch-acts"},el("button",{type:"button",class:"btn cl-go ch-go",onclick:()=>chStart(cards)},"Start"),el("button",{type:"button",class:"btn ghost ch-five",onclick:()=>v3five(stepId)},"Just 5 minutes")));
      }finally{chBuild=false;}}
    return el("section",{class:"ch-card"+(open?" open":"")+(allDone?" done":""),"data-ch":c.kind,"aria-label":title},head,body);};
  if(!design.length)nodes.push(el("p",{class:"hint ch-empty",text:"No design block planned"}));
  design.forEach(c=>nodes.push(card(c)));
  if(!by.b3.tasks.length&&baseH>0&&doneH>=baseH&&!isFriday(d))nodes.push(el("section",{class:"ch-card ch-free","data-ch":"b3","aria-label":"Stretch free"},el("div",{class:"ch-head ch-line"},el("span",{class:"ch-t",text:"Stretch · free"}))));
  nodes.push(card(by.learn));
  if(by.shallow.tasks.length)nodes.push(card(by.shallow));
  rc(ul,...nodes);}
{const _rc=renderCutList;renderCutList=function(){_rc();try{chRender();}catch(e){console.warn(e);}};}
// header: Work x of 8 h · Learning x of 30 min · Gate 1
v3dayNum=function(nm,wk,tg,d){const cfg=chCfg(),f=nm.closest(".dbar-focus"),stretchH=Number((state.settings&&state.settings.work&&state.settings.work.stretchH)||0)||pomN(tg)+cfg.b3.h;
  nm.textContent="";nm.append(document.createTextNode("Work "+pomS(wk)+" of "+pomS(tg)+" h "),el("small",{class:"v3-pmin",text:dur(wk)}));
  if(!f)return;let hd=f.querySelector(".ch-hdr");if(!hd){hd=el("p",{class:"hint ch-hdr"});f.append(hd);}
  let gate="";try{const n=Math.round((parse(END)-parse(iso(new Date())))/864e5);gate=n>=0?"Gate 1: "+fmt(END,{day:"numeric",month:"short"})+", "+n+" day"+(n===1?"":"s"):"Gate 1: "+fmt(END,{day:"numeric",month:"short"});}catch(e){}
  const met=pomN(wk)>=stretchH?"Stretch met":(wk>=tg?"Baseline met":"");
  hd.textContent="Learning "+learnDone(d)+" of "+cfg.learn.minMin+" min"+(gate?" · "+gate:"")+(met?" · "+met:"");
  let pl=f.querySelector(".v3-planned");const pm=planMins(d);if(!pl){pl=el("span",{class:"hint v3-planned"});f.append(pl);}pl.hidden=!pm;pl.textContent=pm?"planned "+pomS(pm)+" of "+pomS(tg)+" h":"";};
// the task sheet: deep or shallow
function chModeRow(t,re){const cur=modeOf(t),b=(m,txt)=>el("button",{type:"button",class:"mini ch-mode"+(cur===m?" on":""),"aria-pressed":String(cur===m),onclick:()=>{chSetMode(t.id,m);setTimeout(re,250);}},txt);
  return el("div",{class:"field ch-moderow"},el("span",{class:"label",text:"Block type"}),el("div",{class:"v3-row"},b("deep","Deep"),b("shallow","Shallow")));}
function chSetMode(id,m){const t=state.tasks[id];if(!t||modeOf(t)===m)return;const pl=t.date?placeInChunk({...t,mode:m,id},t.date):{slot:null};patchTask(id,{mode:m,slot:pl.slot||null});toast(m==="shallow"?"Moved to the shallow batch":"Moved to a deep block");}
// Settings: day blocks
function chSave(next,msg){const old={blocks:(state.settings||{}).blocks||null,work:(state.settings||{}).work||null,prefs:(state.settings||{}).prefs||null};
  const bl={...next,at:Date.now()},tH=Number(next.b1.h)+Number(next.b2.h),wk={targetH:tH,stretchH:tH+Number(next.b3.h),at:Date.now()},pf={...((state.settings&&state.settings.prefs)||{}),dayMin:Math.round(tH*50),at:Date.now()};
  state.settings={...(state.settings||{}),blocks:bl,work:wk,prefs:pf};
  try{store.set("settings/blocks",bl);store.set("settings/work",wk);store.set("settings/prefs",pf);}catch(e){fail(e);}
  v3undoToast(msg||"Blocks saved",()=>{const s={...(state.settings||{})};["blocks","work","prefs"].forEach(k=>{if(old[k]){s[k]=old[k];try{store.set("settings/"+k,old[k]);}catch(e){}}else delete s[k];});state.settings=s;render();});render();}
function chBlocksSheet(){psOpen("Day blocks",re=>{const cfg=chCfg();
    const num=(v,lab,fn,step,min)=>{const i=el("input",{type:"number",class:"v3-in",step:String(step||.5),min:String(min||0),value:String(v),"aria-label":lab});i.onchange=()=>fn(Number(i.value));return el("label",{class:"field"},el("span",{class:"label",text:lab}),i);};
    const tim=(v,lab,fn)=>{const i=el("input",{type:"time",class:"v3-in",value:v,"aria-label":lab});i.onchange=()=>{if(/^\d{2}:\d{2}$/.test(i.value))fn(i.value);};return el("label",{class:"field"},el("span",{class:"label",text:lab}),i);};
    const set=(k,f,v)=>{const c=chCfg(),n={b1:{...c.b1},b2:{...c.b2},b3:{...c.b3},learn:{...c.learn},shallowMin:c.shallowMin};if(k==="shallowMin")n.shallowMin=v;else n[k][f]=v;chSave(n);setTimeout(re,200);};
    const hrs=(k,lab)=>[tim(cfg[k].start,lab+" starts",v=>set(k,"start",v)),num(cfg[k].h,lab+" hours",v=>{if(!(v>=.5&&v<=8)){toast("Hours between 0.5 and 8");re();return;}set(k,"h",v);})];
    return [el("p",{class:"hint",text:"Baseline is Block 1 plus Block 2. Stretch is optional. Learning has a floor of 30 minutes."}),
      el("div",{class:"v3-row"},...hrs("b1","Block 1")),el("div",{class:"v3-row"},...hrs("b2","Block 2")),el("div",{class:"v3-row"},...hrs("b3","Stretch")),
      el("div",{class:"v3-row"},num(cfg.learn.minMin,"Learning minimum (min)",v=>{if(v<30){toast("Learning minimum cannot go below 30 min");re();return;}set("learn","minMin",v);},5,30),num(cfg.learn.targetMin,"Learning target (min)",v=>{if(!(v>=cfg.learn.minMin)){toast("Target is at least the minimum");re();return;}set("learn","targetMin",v);},5,30)),
      el("div",{class:"v3-row"},num(cfg.shallowMin,"Shallow batch (min)",v=>{if(!(v>=10)){re();return;}set("shallowMin",null,v);},10,10))];});}
function chBlocksRow(){const rows=document.querySelector('.page[data-page="settings"] .set-rows');if(!rows||document.getElementById("chBlocksRow"))return;
  rows.append(el("div",{class:"set-row",id:"chBlocksRow"},el("div",{},el("b",{text:"Day blocks"}),el("span",{class:"hint",text:"Hours for Block 1, Block 2, Stretch, Learning and the shallow batch"})),el("button",{type:"button",class:"btn ghost",id:"chBlocksBtn",onclick:chBlocksSheet},"Open")));}
{const _r8=render;render=function(){_r8();try{chBlocksRow();}catch(e){}};}
window.__ch={openAll:()=>{chunksOn(sel).forEach(c=>{chTog[c.key]=true;});renderCutList();},setMode:(i,m)=>chSetMode(i,m),moveTaskTo:(i,d)=>moveTaskTo(i,d),taskSheet:i=>v3taskSheet(i),addEntry:(d,x)=>addEntry(d,x),chunksOn,chunkOf,placeInChunk,modeOf,inBlock,workHoursDone,learnDone,chCfg,sheet:chBlocksSheet};
