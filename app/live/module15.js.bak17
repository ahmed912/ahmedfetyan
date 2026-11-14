// ===== Round 32: select mode. One action bar replaces repeated per-row buttons (Detach etc). Rows stay clean. =====
let selOn=false,selIds=new Set(),selRe=null;
function selRefresh(re){try{render();}catch(e){}re=re||selRe;try{if(re&&document.querySelector(".ps-sheet"))setTimeout(re,260);}catch(e){}}
function selStart(id,re){selOn=true;selIds=new Set(id?[id]:[]);if(re)selRe=re;selBarDraw();selRefresh();}
function selEnd(){const re=selRe;selOn=false;selIds=new Set();selRe=null;const b=document.getElementById("selBar");if(b)b.remove();document.body.classList.remove("sel-on");selRefresh(re);}
function selRows(){const root=document.querySelector(".ps-sheet")||document.querySelector(".page:not([hidden])")||document.body;return [...root.querySelectorAll(".sel-row[data-id]")];}
function selToggle(id,li){selIds.has(id)?selIds.delete(id):selIds.add(id);if(li){li.classList.toggle("sel-picked",selIds.has(id));const c=li.querySelector(".sel-cb");if(c)c.checked=selIds.has(id);}selBarDraw();}
function selRow(li,id){if(!li||!selOn)return li;li.classList.add("sel-row");li.classList.toggle("sel-picked",selIds.has(id));
  const old=li.querySelector('input[type=checkbox]'),cb=el("input",{type:"checkbox",class:"sel-cb","aria-label":"Select"});cb.checked=selIds.has(id);if(old)old.replaceWith(cb);else li.prepend(cb);
  li.addEventListener("click",e=>{if(!selOn)return;e.preventDefault();e.stopPropagation();selToggle(id,li);},true);return li;}
function selTasks(){return [...selIds].map(i=>state.tasks[i]&&{...state.tasks[i],id:i}).filter(Boolean);}
function selDone(msg,undo){const n=selIds.size;selEnd();v3undoToast(msg,undo);}
function selBarDraw(){document.body.classList.add("sel-on");let b=document.getElementById("selBar");if(!b){b=el("div",{id:"selBar",class:"sel-bar",role:"toolbar","aria-label":"Selected tasks"});document.body.append(b);}
  const n=selIds.size,has=n>0,B=(t,c,f,dis)=>el("button",{type:"button",class:"mini "+c,disabled:dis?"":null,onclick:f},t);
  rc(b,el("span",{class:"sel-n",text:n+" selected"}),
    B("Detach","sel-detach",()=>{const T=selTasks().filter(t=>t.parent);if(!T.length){toast("Nothing to detach");return;}const old=T.map(t=>[t.id,t.parent]);T.forEach(t=>patchTask(t.id,{parent:null}));selDone("Detached "+T.length,()=>old.forEach(([i,p])=>patchTask(i,{parent:p})));},!has),
    B("Group","sel-group",()=>{const ids=[...selIds];selEnd();psClose(true);setTimeout(()=>v3parentPick(ids),60);},!has),
    B("Move to bucket","sel-move",()=>{const T=selTasks();if(!T.length)return;const old=T.map(t=>[t.id,t.parent||null]);b.hidden=true;psOpen("Move to bucket",()=>[el("p",{class:"ps-sh-sum",text:T.length+" selected"}),
      el("ul",{class:"ps-sh-list"},...[...bkList().filter(x=>!x.archived),{id:null,title:"Unbucketed"}].map(x=>el("li",{},el("button",{type:"button",class:"ps-sh-row",onclick:()=>{psClose(true);T.forEach(t=>patchTask(t.id,{parent:x.id}));selDone("Moved "+T.length+" to "+(x.title||"bucket"),()=>old.forEach(([i,p])=>patchTask(i,{parent:p})));}},x.title||"Bucket"))))],{onClose:()=>{const q=document.getElementById("selBar");if(q)q.hidden=false;}});},!has),
    B("Reschedule","sel-resched",()=>{const T=selTasks();selEnd();psClose(true);setTimeout(()=>rlMoveSheet(T,T.length+" tasks"),60);},!has),
    B("Archive","sel-archive",()=>{const ids=[...selIds];ids.forEach(i=>v3archive(i,true));selDone("Archived "+ids.length,()=>ids.forEach(i=>v3archive(i,false)));},!has),
    B("Select all","sel-all",()=>{selRows().forEach(li=>{selIds.add(li.dataset.id);li.classList.add("sel-picked");const c=li.querySelector(".sel-cb");if(c)c.checked=true;});selBarDraw();}),
    B("Cancel","sel-cancel",selEnd));}
{const _br=bkRow;bkRow=function(t,f){return selRow(_br(t,f),t.id);};}
{const _pr=plRow;plRow=function(t){return selRow(_pr(t),t.id);};}
{const _sp=setPage;setPage=function(p,...a){if(selOn)selEnd();return _sp(p,...a);};}
// the one entry: "Select" in the Plan header (and in the parent sheet next to Subtasks)
{const _rb=renderBuckets;renderBuckets=function(){_rb();try{const c=document.querySelector("#bucketSec .ck-count");if(c&&!selOn&&!c.parentElement.querySelector(".sel-go")){const g=el("button",{type:"button",class:"hint bk-link sel-go",onclick:()=>selStart(null)},"Select");c.after(g);}}catch(e){console.warn(e);}};}
