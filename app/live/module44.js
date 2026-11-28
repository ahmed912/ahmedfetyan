// ===== module44 roadmap data layer (plans/rm-board) =====
const RM_DOC="rm-board";
const RM_BUILT=[{id:"work",name:"Work",ord:0},{id:"brand",name:"Personal brand",ord:1},{id:"learning",name:"Learning",ord:2},{id:"others",name:"Others",ord:3}];
function rmRaw(){const p=(state.plans||{})[RM_DOC];return p&&!p.deleted?p:null;}
function rmCfg(){const r=rmRaw()||{};
  const parents=Array.isArray(r.parents)?r.parents.filter(x=>x&&x.id&&x.name):RM_BUILT.map(p=>({...p,collapsed:false,deleted:null}));
  return {parents,map:r.map&&typeof r.map==="object"?r.map:{},pos:r.pos&&typeof r.pos==="object"?r.pos:{},created:r.created||null};}
const rmParents=()=>rmCfg().parents.filter(p=>!p.deleted).sort((a,b)=>(a.ord??1e9)-(b.ord??1e9));
function rmParentOf(bid){const c=rmCfg(),alive=id=>c.parents.some(p=>p.id===id&&!p.deleted);
  const m=c.map[bid];if(m&&alive(m))return m;
  const t=state.tasks[bid]||{},ti=String(t.title||"");let id=null;
  if(/brand|linkedin/i.test(ti))id="brand";
  else if(/\b(learning|study|course|book)/i.test(ti))id="learning";
  else if(/hasm|javelin|real estate|mugassam|review|portfolio|client|studio/i.test(ti))id="work";
  else{let g=null;try{g=tgFor(t,bid);}catch(e){}id=g&&g.id;}
  return id&&(id==="work"||id==="brand"||id==="learning")&&alive(id)?id:"others";}
const rmBranches=pid=>bkList().filter(b=>!b.archived&&!b.cut&&rmParentOf(b.id)===pid).sort(bkSort);
const rmTasks=bid=>bkKids(bid).sort(bkSort);
function rmSave(next,msg){const c0=rmCfg(),now=Date.now(),old=(state.plans||{})[RM_DOC]?mxClone(state.plans[RM_DOC]):null;
  next={parents:c0.parents,map:c0.map,pos:c0.pos,...next};
  const v={kind:"roadmap",parents:next.parents,map:next.map,pos:next.pos,created:c0.created||now,upd:now};
  state.plans={...(state.plans||{}),[RM_DOC]:v};store.set("plans/"+RM_DOC,v).catch(fail);render();
  if(msg)v3undoToast(msg,()=>{const back=old?{...old,upd:Date.now()}:{kind:"roadmap",parents:c0.parents,map:c0.map,pos:c0.pos,created:now,upd:Date.now()};
    state.plans={...(state.plans||{}),[RM_DOC]:back};store.set("plans/"+RM_DOC,back).catch(fail);render();});}
function rmNameOk(name,exceptId){name=String(name||"").trim().slice(0,24);
  if(!name){toast("Type a name");return null;}
  if(rmParents().some(p=>p.id!==exceptId&&p.name.toLowerCase()===name.toLowerCase())){toast("That parent exists");return null;}
  return name;}
function rmAddParent(name){name=rmNameOk(name);if(!name)return null;
  const c=rmCfg(),now=Date.now(),id="p"+now.toString(36)+Math.random().toString(36).slice(2,4);
  const max=c.parents.reduce((m,p)=>Math.max(m,p.ord??0),-1);
  rmSave({parents:c.parents.concat([{id,name,ord:max+1,collapsed:false,deleted:null,created:now,upd:now}])},"Parent added: "+name);return id;}
function rmRenameParent(id,name){name=rmNameOk(name,id);if(!name)return null;
  const c=rmCfg();rmSave({parents:c.parents.map(p=>p.id===id?{...p,name,upd:Date.now()}:p)},"Parent renamed");return id;}
function rmDeleteParent(id){if(id==="others"){toast("Others stays");return false;}
  const c=rmCfg(),p=c.parents.find(x=>x.id===id&&!x.deleted);if(!p)return false;
  rmSave({parents:c.parents.map(x=>x.id===id?{...x,deleted:Date.now(),upd:Date.now()}:x)},"Parent deleted: "+p.name+". Its branches went back to their default parent");return true;}
function rmToggleParent(id){const c=rmCfg();rmSave({parents:c.parents.map(p=>p.id===id?{...p,collapsed:!p.collapsed,upd:Date.now()}:p)});}
function rmSetBranchParent(bid,pid){const c=rmCfg(),p=c.parents.find(x=>x.id===pid);
  rmSave({map:{...c.map,[bid]:pid}},"Moved to "+(p?p.name:pid));}
let rmPosT=null;
function rmSetPos(node,x,y){x=Math.round(x/8)*8;y=Math.round(y/8)*8;
  const c=rmCfg(),now=Date.now(),v={kind:"roadmap",parents:c.parents,map:c.map,pos:{...c.pos,[node]:{x,y}},created:c.created||now,upd:now};
  state.plans={...(state.plans||{}),[RM_DOC]:v};
  clearTimeout(rmPosT);rmPosT=setTimeout(()=>{const cur=(state.plans||{})[RM_DOC];if(cur)store.set("plans/"+RM_DOC,cur).catch(fail);},400);}
function rmClearPos(node){const c=rmCfg(),pos={...c.pos};delete pos[node];rmSave({pos});}
function rmCheck(id){const t=state.tasks[id];if(!t)return;const on=!t.done;setDone(id,on);if(on)v3undoToast("Done: "+t.title,()=>setDone(id,false));}
function rmTodayTasks(d){
  const base=Object.entries(state.tasks||{}).filter(([i,t])=>t&&t.title&&!t.bucket&&!t.cut&&!t.archived&&!t.inbox&&t.due).map(([id,t])=>({id,...t}));
  return {due:base.filter(t=>!t.done&&t.due===d).sort(bkSort),
    early:base.filter(t=>!t.done&&t.due<d).sort(bkSort),
    done:base.filter(t=>t.done&&String(t.doneAt||"").slice(0,10)===d&&t.due<=d).sort(bkSort)};}
window.__rm={cfg:rmCfg,parents:rmParents,parentOf:rmParentOf,today:rmTodayTasks,addParent:rmAddParent,delParent:rmDeleteParent,setParent:rmSetBranchParent,setPos:rmSetPos};
