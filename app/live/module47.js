// module47 roadmap board editing
let rmAddOpen=null,rmInBusy=false;
function rmInline(host,ph,onEnter,sel){
  if(!host)return;
  const inp=el("input",{class:"rm-in",type:"text",placeholder:ph,"aria-label":ph,autocomplete:"off"});
  rmAddOpen={sel:sel,ph:ph,fn:onEnter};
  host.replaceChildren(inp);
  ["keyup","keypress","pointerdown","click"].forEach(n=>inp.addEventListener(n,e=>e.stopPropagation()));
  inp.addEventListener("keydown",async e=>{
    e.stopPropagation();
    if(e.key==="Enter"){e.preventDefault();const v=inp.value.trim();if(!v)return;rmInBusy=true;try{await onEnter(v);}catch(x){console.warn(x);}rmInBusy=false;
      const h=sel&&document.querySelector("#rmBody "+sel);if(h&&!h.querySelector(".rm-in")&&rmAddOpen)rmInline(h,ph,onEnter,sel);}
    else if(e.key==="Escape"){e.preventDefault();rmAddOpen=null;render();}
  });
  inp.addEventListener("blur",()=>{if(rmInBusy||!inp.isConnected)return;if(!inp.value.trim()){rmAddOpen=null;render();}});
  setTimeout(()=>{try{inp.focus();}catch(e){}},0);
}
function rmOpenAdd(host,ph,fn,sel){if(host.querySelector&&host.querySelector(".rm-in"))return;rmInline(host,ph,fn,sel);}
function rmBranchMenu(bid){const b=state.tasks[bid];if(!b)return;
  psOpen(b.title,()=>{
    const ren=el("input",{class:"v3-in rm-ren",type:"text",value:b.title,"aria-label":"Branch name"});
    ren.onchange=()=>{const v=ren.value.trim().slice(0,60),old=b.title;if(!v||v===old){ren.value=old;return;}patchTask(bid,{title:v});v3undoToast("Renamed",()=>patchTask(bid,{title:old}));};
    const cur=rmParentOf(bid);
    return [ren,el("p",{class:"hint",text:"Parent"}),
      el("div",{class:"rm-chips"},...rmParents().map(p=>el("button",{type:"button",class:"rm-chip","data-pid":p.id,"aria-pressed":String(p.id===cur),text:p.name,onclick:()=>{rmSetBranchParent(bid,p.id);psClose();}}))),
      el("button",{type:"button",class:"btn ghost rm-proj",text:"Open in Projects",onclick:()=>{psClose();setPage("projects");}}),
      el("button",{type:"button",class:"btn ghost rm-arch",text:"Archive branch",onclick:()=>{psClose();bkArchive(bid,true);}})];
  });}
function rmParentMenu(pid){const p=rmParents().find(x=>x.id===pid);if(!p)return;
  psOpen(p.name,()=>{
    const ren=el("input",{class:"v3-in rm-ren",type:"text",value:p.name,"aria-label":"Parent name"});
    ren.onchange=()=>{if(rmRenameParent(pid,ren.value)===null)ren.value=p.name;};
    const n=rmBranches(pid).length;
    const out=[ren,el("p",{class:"hint",text:n+(n===1?" branch":" branches")})];
    if(pid!=="others")out.push(el("button",{type:"button",class:"btn ghost rm-del",text:"Delete parent",onclick:()=>{psClose();rmDeleteParent(pid);}}));
    return out;
  });}
document.addEventListener("click",e=>{
  const body=document.getElementById("rmBody");if(!body||!body.contains(e.target))return;
  if(e.target.closest&&e.target.closest(".rm-in"))return;
  const addt=e.target.closest(".rm-tree[data-bid] .rm-addt");
  if(addt){const bid=addt.closest(".rm-tree").dataset.bid;e.stopPropagation();
    rmOpenAdd(addt,"Task name",v=>bkAddTask(bid,v),'.rm-tree[data-bid="'+bid+'"] .rm-addt');return;}
  const addb=e.target.closest(".rm-addb[data-pid]");
  if(addb){const pid=addb.dataset.pid;e.stopPropagation();
    rmOpenAdd(addb,"Branch name",async v=>{const id=await bkAdd({title:v});if(pid==="brand"||pid==="learning")patchTask(id,{cat:pid});rmSetBranchParent(id,pid);},'.rm-addb[data-pid="'+pid+'"]');return;}
  const np=e.target.closest(".rm-newp");
  if(np){e.stopPropagation();rmOpenAdd(np,"Parent name",v=>rmAddParent(v),".rm-newp");}
},true);
{const _r=render;render=function(){_r();try{
  const body=document.getElementById("rmBody");
  if(body&&page==="roadmap"){
    body.querySelectorAll("ul.rm-tree[data-bid]").forEach(ul=>{const bid=ul.dataset.bid;
      v3dragList(ul,"li.rm-task:not(.done)",ids=>{
        const old={};ids.forEach(id=>{old[id]=state.tasks[id]?state.tasks[id].pos:null;});
        let ch=false;ids.forEach((id,i)=>{if(state.tasks[id]&&state.tasks[id].pos!==i){ch=true;patchTask(id,{pos:i});}});
        if(ch)v3undoToast("Reordered",()=>{Object.keys(old).forEach(id=>patchTask(id,{pos:old[id]==null?null:old[id]}));});
      });});
    if(rmAddOpen){const h=document.querySelector("#rmBody "+rmAddOpen.sel);if(h&&!h.querySelector(".rm-in"))rmInline(h,rmAddOpen.ph,rmAddOpen.fn,rmAddOpen.sel);else if(!h)rmAddOpen=null;}
  }
}catch(e){console.warn(e);}};}
try{window.__rm=window.__rm||{};window.__rm.move=(a,b)=>bkMove(a,b);}catch(e){}
