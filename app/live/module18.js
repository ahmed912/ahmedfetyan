// ===== 14 Nov: every task is editable and deletable everywhere (one Delete, Undo for 10 s, Recently deleted in Settings) =====
function v3delIds(id){return Object.entries(state.tasks||{}).filter(([k,x])=>x&&x.parent===id&&!x.bucket&&!x.archived&&!x.cut).map(([k])=>k);}
function v3delete(id,keep){const t=state.tasks[id];if(!t||t.bucket)return;const kids=v3delIds(id),rec=!!t.rec;
  const go=(withKids,stop)=>{const ids=[id].concat(withKids?kids:[]),old=ids.map(i=>{const x=state.tasks[i]||{};return [i,{archived:!!x.archived,cut:!!x.cut}];}),oldRec=rec&&stop?{rec:t.rec,recNext:t.recNext||null}:null,now=Date.now();
    ids.forEach(i=>patchTask(i,{archived:true,cut:true,deleted:now,deletedBy:i===id?null:id}));if(oldRec)patchTask(id,{rec:null,recNext:null});
    if(!keep)try{psClose(true);}catch(e){}
    v3undoToast("Deleted: "+(t.title||"task"),()=>{old.forEach(([i,o])=>patchTask(i,{archived:o.archived,cut:o.cut,deleted:null,deletedBy:null}));if(oldRec)patchTask(id,oldRec);render();},10000);render();};
  if(!kids.length&&!rec){go(false,false);return;}
  let stop=true;
  psOpen("Delete",re=>[el("p",{class:"ps-sh-sum",text:t.title}),
    rec?el("button",{type:"button",class:"cat-chip del-stop"+(stop?" on":""),"aria-pressed":String(stop),onclick:()=>{stop=!stop;re();}},"Stop repeating too"):null,
    kids.length?el("p",{class:"hint",text:"Delete its "+kids.length+" subtask"+(kids.length===1?"":"s")+" too?"}):null,
    el("div",{class:"v3-row"},el("button",{type:"button",class:"btn danger del-go",onclick:()=>go(true,stop)},kids.length?"Delete with subtasks":"Delete"),kids.length?el("button",{type:"button",class:"btn ghost del-only",onclick:()=>go(false,stop)},"Delete only this task"):null)]);}
function v3deletedList(){return Object.entries(state.tasks||{}).filter(([k,x])=>x&&x.deleted).map(([id,x])=>({id,...x})).sort((a,b)=>(b.deleted||0)-(a.deleted||0));}
function v3restoreDeleted(id){const ids=[id].concat(Object.entries(state.tasks).filter(([k,x])=>x.deletedBy===id).map(([k])=>k));ids.forEach(i=>patchTask(i,{archived:false,cut:false,deleted:null,deletedBy:null}));render();}
function v3deletedSheet(){psOpen("Recently deleted",re=>{const L=v3deletedList().filter(x=>!x.deletedBy);
  return L.length?[el("ul",{class:"ps-sh-list rd-list"},...L.slice(0,40).map(x=>el("li",{class:"bk-arow rd-row","data-id":x.id},el("span",{class:"rd-t",text:x.title}),el("button",{type:"button",class:"mini rd-restore",onclick:()=>{v3restoreDeleted(x.id);toast("Restored: "+x.title);setTimeout(re,250);}},"Restore"))))]:[el("p",{class:"hint",text:"Nothing deleted."})];});}
function v3deletedSec(){const n=v3deletedList().filter(x=>!x.deletedBy).length;return el("div",{class:"sh-sec"},el("button",{type:"button",class:"btn ghost rd-open",onclick:()=>v3deletedSheet()},"Recently deleted"+(n?" ("+n+")":"")));}
window.__u={get state(){return state;},isLeaf,leafTasks,planMins,psClose,v3taskSheet,v3taskMenu,v3delete,v3deletedSheet,v3deletedList,ckCount,subsOf,kidsOf,bkActiveId,spTasks:typeof spTasks==="function"?spTasks:null,tasksOn};
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#rdBtn"))v3deletedSheet();});
