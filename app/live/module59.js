// Round 59: change the level of any board object. Task <-> Branch <-> Parent. Soft only, one Undo, nothing deleted.
const LV=(()=>{
  const snap=(id,keys)=>{const t=state.tasks[id]||{},o={};keys.forEach(k=>{o[k]=t[k]===undefined?null:t[k];});return o;};
  const K=["bucket","parent","bState","archived","cut"];
  function undoer(steps){return()=>{steps.reverse().forEach(f=>{try{f();}catch(e){console.warn(e);}});render();};}
  function toBranch(tid,pid){const t=state.tasks[tid];if(!t)return;const steps=[],c=rmCfg(),old=snap(tid,K),oldMap=c.map[tid];
    bkSet(tid,{bucket:true,parent:null,bState:"active"});rmSave({map:{...c.map,[tid]:pid}});
    steps.push(()=>{bkSet(tid,old);const c2=rmCfg(),m={...c2.map};if(oldMap===undefined)delete m[tid];else m[tid]=oldMap;rmSave({map:m});});
    const p=rmParents().find(x=>x.id===pid);v3undoToast("Now a branch under "+(p?p.name:"parent"),undoer(steps));}
  function toTask(bid,target){const b=state.tasks[bid];if(!b||bid===target)return;const kids=bkKids(bid),steps=[],old=snap(bid,K);
    const olds=kids.map(k=>[k.id,snap(k.id,K)]);
    bkSet(bid,{bucket:false,parent:target,bState:null});kids.forEach(k=>bkSet(k.id,{parent:target}));
    steps.push(()=>{bkSet(bid,old);olds.forEach(([i,o])=>bkSet(i,o));});
    v3undoToast("Now a task in "+((state.tasks[target]||{}).title||"branch"),undoer(steps));}
  function branchToParent(bid){const b=state.tasks[bid];if(!b)return;const name=String(b.title||"").trim().slice(0,24);
    const pid=rmAddParent(name);if(!pid)return;const kids=bkKids(bid),steps=[],c=rmCfg(),map={...c.map};
    const olds=kids.map(k=>[k.id,snap(k.id,K)]),oldB=snap(bid,K);
    kids.forEach(k=>{bkSet(k.id,{bucket:true,parent:null,bState:"active"});map[k.id]=pid;});rmSave({map});
    bkSet(bid,{archived:true,cut:true});
    steps.push(()=>{bkSet(bid,oldB);olds.forEach(([i,o])=>bkSet(i,o));rmDeleteParent(pid);});
    v3undoToast("Now a parent: "+name+". Its tasks became branches",undoer(steps));}
  async function parentToBranch(pid,target){const p=rmParents().find(x=>x.id===pid);if(!p||pid===target||pid==="others"&&false)return;
    const subs=rmBranches(pid),c=rmCfg(),map={...c.map};subs.forEach(b=>{map[b.id]=target;});
    const nid=await bkAdd({title:p.name});map[nid]=target;rmSave({map});
    rmDeleteParent(pid);
    const steps=[()=>{bkSet(nid,{archived:true,cut:true});const c2=rmCfg();rmSave({parents:c2.parents.map(x=>x.id===pid?{...x,deleted:null}:x),map:Object.fromEntries(Object.entries(c2.map).filter(([k])=>k!==nid&&!subs.some(s=>s.id===k)).concat(subs.map(s=>[s.id,pid])))});}];
    v3undoToast("Now a branch: "+p.name,undoer(steps));}
  return {toBranch,toTask,branchToParent,parentToBranch};})();
window.__lv=LV;
function lvChoose(title,items,hint){psOpen(title,()=>[el("p",{class:"hint",text:hint||"Pick where it goes"}),el("div",{class:"rm-chips"},...items.map(([label,fn])=>el("button",{type:"button",class:"rm-chip",text:label,onclick:()=>{psClose();fn();}})))]);}
function lvTaskMenu(id){const t=state.tasks[id];if(!t)return;const par=rmParentOf(t.parent||"");
  lvChoose("Make it a branch under",rmParents().map(p=>[p.name,()=>LV.toBranch(id,p.id)]),"This task becomes a branch of the parent you pick");}
function lvBranchMenu(bid){const b=state.tasks[bid];if(!b)return;
  psOpen("Change level",()=>[
    el("button",{type:"button",class:"btn ghost lv-do",text:"Make it a task",onclick:()=>{psClose();lvChoose("Make it a task in",rmBranches(rmParentOf(bid)).concat(rmParents().flatMap(p=>rmBranches(p.id))).filter((x,i,a)=>x.id!==bid&&a.findIndex(y=>y.id===x.id)===i).map(x=>[x.title,()=>LV.toTask(bid,x.id)]),"Its tasks move to the branch you pick");}}),
    el("button",{type:"button",class:"btn ghost lv-do",text:"Make it a parent",onclick:()=>{psClose();LV.branchToParent(bid);}})]);}
function lvParentMenu(pid){
  psOpen("Change level",()=>[el("button",{type:"button",class:"btn ghost lv-do",text:"Make it a branch",onclick:()=>{psClose();lvChoose("Make it a branch under",rmParents().filter(p=>p.id!==pid).map(p=>[p.name,()=>LV.parentToBranch(pid,p.id)]),"Its branches move to the parent you pick");}})]);}
{const _b=rmBranchMenu;rmBranchMenu=function(bid){_b(bid);try{const sh=document.querySelector(".ps-sheet .ps-sh-body")||document.querySelector(".ps-sheet");if(sh&&!sh.querySelector(".lv-open"))sh.append(el("button",{type:"button",class:"btn ghost lv-open",text:"Change level",onclick:()=>{psClose();lvBranchMenu(bid);}}));}catch(e){}};}
{const _p=rmParentMenu;rmParentMenu=function(pid){_p(pid);try{const sh=document.querySelector(".ps-sheet .ps-sh-body")||document.querySelector(".ps-sheet");if(sh&&!sh.querySelector(".lv-open")&&pid!=="others")sh.append(el("button",{type:"button",class:"btn ghost lv-open",text:"Change level",onclick:()=>{psClose();lvParentMenu(pid);}}));}catch(e){}};}
{const _t=v3taskMenu;v3taskMenu=function(id){_t(id);try{const m=document.querySelector(".ps-sheet .tm-more");if(m&&!m.querySelector(".lv-open")&&!(state.tasks[id]||{}).bucket)m.append(el("button",{type:"button",class:"tm-row lv-open",text:"Make it a branch",onclick:()=>{psClose(true);lvTaskMenu(id);}}));}catch(e){}};}
window.__lv.m={b:bid=>rmBranchMenu(bid),p:pid=>rmParentMenu(pid),t:id=>v3taskMenu(id),bt:()=>bkSet,ls:()=>({p:rmParents().map(p=>p.id+":"+p.name),br:(pid)=>rmBranches(pid).map(b=>b.id)})};
window.__lv.S=()=>state;
