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
function taskKids(id){return Object.entries(state.tasks||{}).filter(([k,x])=>x&&x.parent===id&&!x.bucket&&!x.deleted).map(([k])=>k);}
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

window.__dm={refMin,refSessions,refLast,taskMin,bkMin};
