// r38 timer: project timer (bucket Start) and multi-select Start
const v38open=t=>t&&!t.done&&!t.cut&&!t.archived&&!t.deleted&&!t.bucket;
function v38bkIds(bid){return bkKids(bid).sort(bkSort).flatMap(t=>{const k=taskKids(t.id);return k.length?k.map(i=>({id:i,...state.tasks[i]})):[t];}).filter(v38open).map(t=>t.id);}
function v38go(k,v,label,ids){if(warGet()){toast("End the current war first");warOpen();return;}if(!ids.length){toast("No open tasks");return;}warPut({k,v,label,ids,done:[],start:Date.now(),dur:0});psClose();warOpen();renderPopCards();}
function v38bkStart(bid){const b=state.tasks[bid];if(!b)return;v38go("bk",bid,b.title||"Bucket",v38bkIds(bid));}
{const _se=saveEntries;saveEntries=function(d,items){try{const w=warGet();if(w&&w.k==="bk"&&w.eid&&Array.isArray(items))items=items.map(x=>x&&x.id===w.eid&&x.ref==="other"?{...x,ref:"tasks:"+w.v}:x);}catch(e){}return _se(d,items);};}
let v38bid=null;{const _bm=bkMenu;bkMenu=function(bid){v38bid=bid;return _bm(bid);};}{const _bs=bkSheet;bkSheet=function(bid){v38bid=bid;return _bs(bid);};}
PS_AFTER.push((title,body)=>{if(!v38bid||body.querySelector(".v38-start"))return;const bid=v38bid,b=state.tasks[bid];if(!b||!b.bucket)return;const btn=el("button",{type:"button",class:"btn ghost v38-start",onclick:()=>v38bkStart(bid)},"Start");if(title==="Bucket"){const s=body.querySelector(".ps-sh-sum");if(s)s.after(btn);}else if(body.querySelector(".bks-sum")){const sb=body.querySelector(".bks-sel");if(sb)sb.before(btn);}});
{const _ss=selStart;selStart=function(id,re){if(selOn){if(re)selRe=re;if(id)selIds.add(id);selBarDraw();selRefresh();return;}return _ss(id,re);};}
{const _sb=selBarDraw;selBarDraw=function(){_sb();try{const b=document.getElementById("selBar");if(!b||b.querySelector(".sel-start"))return;
  const ids=[...selIds].flatMap(i=>{const t=state.tasks[i];if(!t||t.bucket)return [];const k=taskKids(i);return k.length?k:[i];}).filter(i=>v38open(state.tasks[i]));
  const btn=el("button",{type:"button",class:"mini sel-start",disabled:ids.length?null:"",onclick:()=>{const L=ids.slice();selEnd();v38go("pick","pick"+Date.now(),L.length+" picked tasks",L);}},"Start");
  b.insertBefore(btn,b.querySelector(".sel-cancel"));}catch(e){console.warn(e);}};}
window.__v38={go:id=>v38bkStart(id),ids:id=>v38bkIds(id),bkMenu:id=>bkMenu(id),bkSheet:id=>bkSheet(id),sel:()=>selStart(null),war:()=>{const w=warGet();return w&&JSON.parse(JSON.stringify(w));},items:d=>itemsRaw(d),bkMin:id=>bkMin(id),save:()=>warSave()};
