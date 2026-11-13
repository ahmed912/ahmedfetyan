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
