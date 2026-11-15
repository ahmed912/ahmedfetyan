// ===== Diamonds: Done and Shipped, plus time spent on every task and bucket (one refMin) =====
// Pillar: procrastination (a quiet record of real progress lowers the cost of starting) and fear of overwhelm (display only, no new logging duty).
let refIx=null,refIxE=null,refIxT=0;
function refIndex(){const now=Date.now();if(refIx&&refIxE===state.entries&&now-refIxT<60000)return refIx;
  const ix={days:{},n:{},min:{}},ds=new Set(Object.keys(state.entries||{}));ds.add(iso(new Date()));
  ds.forEach(d=>{itemsOn(d).forEach(x=>{if(!x||typeof x.ref!=="string"||x.kind==="event"||x.kind==="break"||isEstimate(x))return;
    (ix.days[x.ref]=ix.days[x.ref]||new Set()).add(d);ix.n[x.ref]=(ix.n[x.ref]||0)+1;});});
  refIx=ix;refIxE=state.entries;refIxT=now;return ix;}
function refMin(ref){const ix=refIndex();if(ix.min[ref]!=null)return ix.min[ref];let m=0;(ix.days[ref]||new Set()).forEach(d=>{m+=workedMin(d,x=>x.ref===ref);});return ix.min[ref]=m;}
function refSessions(ref){return refIndex().n[ref]||0;}
function refLast(ref){const s=[...(refIndex().days[ref]||[])].sort();return s[s.length-1]||null;}
let dmKids=null;
function taskKids(id){if(dmKids)return dmKids[id]||[];return Object.entries(state.tasks||{}).filter(([k,x])=>x&&x.parent===id&&!x.bucket&&!x.deleted).map(([k])=>k);}
function taskMin(id,g){g=g||0;let m=refMin("tasks:"+id);if(g<6)taskKids(id).forEach(k=>{m+=taskMin(k,g+1);});return m;}
function taskSessions(id,g){g=g||0;let n=refSessions("tasks:"+id);if(g<6)taskKids(id).forEach(k=>{n+=taskSessions(k,g+1);});return n;}
function bkMin(bid){let m=refMin("tasks:"+bid);bkDescendants(bid).forEach(i=>{const t=state.tasks[i];if(t&&!t.deleted)m+=refMin("tasks:"+i);});return m;}
const spentTxt=m=>m>0?dur(m):"";
{const _se24=saveEntries;saveEntries=function(d,i){refIx=null;return _se24(d,i);};}
{const _ut24=urTags;urTags=function(t){const a=_ut24(t),s=t&&t.id&&!t.bucket?spentTxt(taskMin(t.id)):"";return s?(a?a+" · "+s:s):a;};}
{const _v24=v3card;v3card=function(t,top,ctx){const c=_v24(t,top,ctx);try{const head=c.querySelector(".cs-head"),s=t&&t.id&&!t.bucket?spentTxt(taskMin(t.id)):"";
  if(head&&s&&!head.querySelector(".tm-spent")){const sp=el("span",{class:"hint tm-spent",text:s});const a=head.querySelector(".bk-tag")||head.querySelector(".cat-chip");a?a.after(sp):head.append(sp);}}catch(e){console.warn(e);}return c;};}
{const _bc24=bkCard;bkCard=function(b){const c=_bc24(b);try{if(b){const s=c.querySelector(".bk-sub"),m=bkMin(b.id);if(s&&m>0&&!s.dataset.tm){s.dataset.tm="1";s.textContent+=" · "+dur(m)+" logged";}}}catch(e){console.warn(e);}return c;};}
let dmSheetBid=null;
{const _bs24=bkSheet;bkSheet=function(bid){dmSheetBid=bid;return _bs24(bid);};}
PS_AFTER.push((title,body)=>{const s=body.querySelector(".bks-sum");if(!s||s.dataset.tm||!dmSheetBid)return;const m=bkMin(dmSheetBid);s.dataset.tm="1";if(m>0)s.textContent+=" · "+dur(m)+" logged";});
let dmTaskId=null;
{const _ts24=v3taskSheet;v3taskSheet=function(id,edit){dmTaskId=id;return _ts24(id,edit);};try{if(window.__u)window.__u.v3taskSheet=v3taskSheet;}catch(e){}}
PS_AFTER.push((title,body)=>{if(title!=="Task"||body.querySelector(".tm-line"))return;const id=dmTaskId;if(!id||!state.tasks[id])return;const m=taskMin(id),n=taskSessions(id);
  const p=el("p",{class:"hint tm-line",text:m>0?"Time spent "+dur(m)+" · "+n+" session"+(n===1?"":"s"):"No time logged yet"});
  const nm=body.querySelector('[aria-label="Task name"]');nm?nm.after(p):body.prepend(p);});

// ----- data layer: records are derived live; only user writes go to the wins collection -----
const WINS={};
(async()=>{try{const d=await window.claude?.use?.("db");if(!d)return;d.collection("wins").onSnapshot(s=>{for(const k in WINS)delete WINS[k];s.docs.forEach(x=>{WINS[x.id]=x.data();});try{render();const a=document.activeElement;if(!(a&&a.closest&&a.closest(".ps-sheet")&&/INPUT|TEXTAREA/.test(a.tagName)))sheetRefresh();}catch(e){}});}catch(e){}})();
function dmSlug(s){return String(s||"Time entry").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)||"entry";}
function dmLastOf(id,g){g=g||0;let l=refLast("tasks:"+id);if(g<6)taskKids(id).forEach(k=>{const x=dmLastOf(k,g+1);if(x&&(!l||x>l))l=x;});return l;}
function dmTaskRecs(){const out=[];Object.entries(state.tasks||{}).forEach(([id,t])=>{if(!t||t.bucket||t.sub||t.deleted||!t.title)return;
  const min=taskMin(id),last=dmLastOf(id),done=!!(t.done&&t.doneAt);if(!done&&min<30)return;
  out.push({id:"t_"+id,kind:"task",diamond:"done",state:done?"done":"progress",ref:"tasks:"+id,title:t.title,cat:t.cat||null,date:done?(last&&last>t.doneAt?last:t.doneAt):last,min,sessions:taskSessions(id),note:t.desc||""});});return out;}
function dmHabitRecs(){const out=[],H=window.__hb?window.__hb.list(true):HABITS;
  (H||[]).forEach(h=>{const g={};Object.keys(state.logs||{}).forEach(k=>{const l=state.logs[k];if(l&&l[h.id]===true){const ws=v3wkStart(k);(g[ws]=g[ws]||[]).push(k);}});
    Object.keys(g).forEach(ws=>{const ds=g[ws].sort();out.push({id:"h_"+h.id+"_"+ws,kind:"habit",diamond:"done",state:"done",ref:"habits:"+h.id,title:h.name,date:ds[ds.length-1],days:ds.length,min:0});});});return out;}
function dmLabelRecs(){const out=[];const noTask=x=>typeof x.ref!=="string"||x.ref.indexOf("tasks:")!==0||!state.tasks[x.ref.slice(6)];
  Object.keys(state.entries||{}).forEach(d=>{const its=itemsRaw(d).filter(x=>x&&x.kind!=="event"&&x.kind!=="break"&&!isEstimate(x)&&noTask(x)),g={};
    its.forEach(x=>{const l=x.label||"Time entry";(g[l]=g[l]||[]).push(x);});
    Object.keys(g).forEach(l=>{const min=workedMin(d,y=>y.kind!=="event"&&y.kind!=="break"&&noTask(y)&&(y.label||"Time entry")===l);
      if(min>0)out.push({id:"l_"+d+"_"+dmSlug(l),kind:"label",diamond:"done",state:"done",title:l,cat:g[l][0].cat||null,date:d,min,sessions:g[l].length});});});return out;}
function dmShipRecs(){return bkList().filter(b=>b.shipped===true&&b.title).map(b=>({id:"p_"+b.id,kind:"ship",diamond:"shipped",state:"done",ref:"tasks:"+b.id,title:b.title,cat:b.cat||b.kind||null,date:b.shippedAt,start:b.bStart||null,min:bkMin(b.id),tasks:bkDescendants(b.id).filter(i=>state.tasks[i]&&!state.tasks[i].sub&&!state.tasks[i].deleted).length}));}
function dmManualRecs(){return Object.keys(WINS).filter(k=>WINS[k]&&WINS[k].kind==="manual"&&!WINS[k].deleted).map(k=>({...WINS[k],id:k,state:"done",min:Number(WINS[k].min)||0}));}
function dmMerge(r){const o=WINS[r.id];return o&&r.kind!=="manual"?{...r,title:o.title||r.title,date:o.date||r.date,note:o.note!=null?o.note:r.note,reflection:o.reflection||"",hidden:o.hidden||null}:{...r,reflection:(o&&o.reflection)||r.reflection||""};}
function winsAll(){dmKids={};Object.entries(state.tasks||{}).forEach(([k,x])=>{if(x&&x.parent&&!x.bucket&&!x.deleted)(dmKids[x.parent]=dmKids[x.parent]||[]).push(k);});try{return dmAll();}finally{dmKids=null;}}
function dmAll(){return [].concat(dmTaskRecs(),dmHabitRecs(),dmLabelRecs(),dmShipRecs(),dmManualRecs()).map(dmMerge).filter(r=>!r.hidden&&r.date).sort((a,b)=>(a.date<b.date?1:a.date>b.date?-1:String(a.title).localeCompare(String(b.title))));}
function winsDone(ws){return winsAll().filter(r=>r.diamond==="done"&&v3wkStart(r.date)===ws);}
function winsDoneCount(ws){return winsDone(ws).filter(r=>r.state==="done").length;}
function winsShipped(){return winsAll().filter(r=>r.diamond==="shipped");}
function projectTaskEffort(bid){return bkDescendants(bid).filter(i=>{const t=state.tasks[i];return t&&!t.sub&&!t.deleted;}).map(i=>({id:i,title:state.tasks[i].title,min:taskMin(i),doneAt:state.tasks[i].doneAt||null})).filter(x=>!(x.min===0&&!x.doneAt)).sort((a,b)=>b.min-a.min);}
function winPut(id,patch,msg,keep){const had=!!WINS[id],old={};Object.keys(patch).forEach(k=>{old[k]=had&&WINS[id][k]!==undefined?WINS[id][k]:null;});const now=Date.now();
  if(had){WINS[id]={...WINS[id],...patch,upd:now};store.update("wins/"+id,{...patch,upd:now}).catch(fail);}
  else{WINS[id]={...patch,created:now,upd:now};store.set("wins/"+id,WINS[id]).catch(fail);}
  render();if(!keep){try{sheetRefresh();}catch(e){}}
  if(msg!==false&&msg)v3undoToast(msg,()=>{if(had){WINS[id]={...WINS[id],...old,upd:Date.now()};store.update("wins/"+id,{...old,upd:Date.now()}).catch(fail);}else{delete WINS[id];store.del("wins/"+id).catch(fail);}render();try{sheetRefresh();}catch(e){}});}
function winHide(id){winPut(id,{hidden:Date.now()},"Hidden from Done");}
function winUnhide(id){winPut(id,{hidden:null},false);}
function winDelete(id){const w=WINS[id];winPut(id,{deleted:Date.now()},"Deleted: "+((w&&w.title)||"win"));}
function winRestore(id){const w=WINS[id];winPut(id,{deleted:null},"Restored: "+((w&&w.title)||"win"));}
{const _bm24=bkMenu;bkMenu=function(bid){_bm24(bid);try{const b=state.tasks[bid],sh=document.querySelector(".ps-sheet");if(!b||!sh||sh.querySelector(".dm-ship"))return;
  const un=b.shipped===true;
  const btn=el("button",{type:"button",class:"btn ghost dm-ship",onclick:()=>{psClose(true);
    if(!un){const old={shipped:!!b.shipped,shippedAt:b.shippedAt||null};bkSet(bid,{shipped:true,shippedAt:iso(new Date())});bkArchive(bid,true);render();v3undoToast("Shipped: "+b.title,()=>{bkArchive(bid,false);bkSet(bid,old);render();});}
    else{const old={shipped:true,shippedAt:b.shippedAt||null};bkSet(bid,{shipped:false});bkArchive(bid,false);render();v3undoToast("Back on the active list: "+b.title,()=>{bkSet(bid,old);bkArchive(bid,true);render();});}}},un?"Unship":"Mark shipped");
  const a=[...sh.querySelectorAll("button")].find(x=>/^Archive$/.test(x.textContent));a?a.before(btn):sh.querySelector(".ps-sh-body")?sh.querySelector(".ps-sh-body").append(btn):sh.append(btn);}catch(e){console.warn(e);}};
  try{if(window.__u)window.__u.bkMenu=bkMenu;}catch(e){}}

window.__dm={refMin,refSessions,refLast,taskMin,bkMin,winsAll,winsDone,winsDoneCount,winsShipped,projectTaskEffort,winPut,winHide,winUnhide,winDelete,winRestore,WINS};
