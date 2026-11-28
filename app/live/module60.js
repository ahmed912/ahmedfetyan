// Round 60: Today is a parent. Its branches are Work, Personal brand, Learning... each with the tasks due today.
function rmTbrKey(){return "rm-tbr-"+iso(new Date());}
function rmTbrGet(){try{return JSON.parse(localStorage.getItem(rmTbrKey())||"[]");}catch(e){return [];}}
function rmTbrSet(a){try{localStorage.setItem(rmTbrKey(),JSON.stringify(a));}catch(e){}}
function rmTGroup(t){const b=t.parent&&state.tasks[t.parent];return b&&b.bucket?rmParentOf(t.parent):"others";}
function rmTodayAddBtn(){return el("button",{type:"button",class:"rm-addb rm-taddb",onclick:()=>{
  const shown=new Set(rmTbrGet());const rest=rmParents().filter(p=>!shown.has(p.id));
  psOpen("Add a branch to Today",()=>[el("p",{class:"hint",text:rest.length?"Pick a parent to show under Today":"All parents are already shown"}),el("div",{class:"rm-chips"},...rest.map(p=>el("button",{type:"button",class:"rm-chip",text:p.name,onclick:()=>{rmTbrSet(rmTbrGet().concat([p.id]));psClose();render();}})))]);}},el("span",{class:"rm-plus",text:"+"}),el("span",{text:"Add Branch"}));}
function rmTholdMenu(pid){const p=rmParents().find(x=>x.id===pid);if(!p)return;
  psOpen(p.name,()=>{const ren=el("input",{class:"v3-in rm-ren",dir:"auto",type:"text",value:p.name,"aria-label":"Branch name"});
    ren.onchange=()=>{if(rmRenameParent(pid,ren.value)===null)ren.value=p.name;};
    return [ren,el("p",{class:"hint",text:"Renames the parent everywhere"}),el("button",{type:"button",class:"btn ghost",text:"Hide from Today",onclick:()=>{psClose();const a=rmTbrGet().filter(x=>x!==pid);a.push("-"+pid);rmTbrSet(a);render();}})];});}
function rmTodayBlocks(world,tIn){const d=iso(new Date()),L=rmTodayTasks(d),hidden=new Set(rmTbrGet().filter(x=>x[0]==="-").map(x=>x.slice(1))),manual=new Set(rmTbrGet().filter(x=>x[0]!=="-"));
  const rows={};const put=(t,k)=>{const g=rmTGroup(t);(rows[g]=rows[g]||{due:[],early:[],done:[]})[k].push(t);};
  L.due.forEach(t=>put(t,"due"));L.early.forEach(t=>put(t,"early"));L.done.forEach(t=>put(t,"done"));
  const ids=rmParents().map(p=>p.id).filter(id=>(rows[id]||manual.has(id))&&!(hidden.has(id)&&!rows[id]));
  if(!ids.length){const g=el("div",{class:"rm-empty hint rm-node rm-tbranch rm-static","data-node":"tb:none"},"Nothing due today");world.append(g);
    return [{be:g,h:g.offsetHeight+RM_LH,place(x,top){rmPut(g,x,top+RM_LH);}}];}
  return ids.map(pid=>{const p=rmParents().find(x=>x.id===pid),r=rows[pid]||{due:[],early:[],done:[]},node="tb:"+pid;
    const be=rmTint(el("div",{class:"rm-node rm-tbranch rm-static","data-node":node,"data-tpid":pid},el("span",{class:"rm-bname",dir:"auto",text:p.name}),el("span",{class:"rm-cnt",text:String(r.due.length+r.early.length)})),rmTone(pid));
    be.style.width=RM_BW+"px";
    let timer=null;be.addEventListener("pointerdown",()=>{timer=setTimeout(()=>{timer=null;rmTholdMenu(pid);},500);});["pointerup","pointerleave","pointercancel"].forEach(ev=>be.addEventListener(ev,()=>{clearTimeout(timer);}));
    world.append(be);const ph=be.offsetHeight;
    const tree=el("ul",{class:"rm-tree rm-ttree"});
    r.due.concat(r.early).forEach(t=>tree.append(rmTaskRow(t,{})));
    if(r.done.length){tree.append(el("li",{class:"rm-more rm-donec",onclick:()=>{rmTodayDone=!rmTodayDone;render();}},r.done.length+" done"));if(rmTodayDone)r.done.forEach(t=>tree.append(rmTaskRow(t,{})));}
    const add=el("li",{class:"rm-addt"},el("span",{class:"rm-plus",text:"+"}),"Add task");tree.append(add);
    add.onclick=()=>{const inp=el("input",{class:"rm-in",dir:"auto",type:"text",placeholder:"Task due today"});add.replaceChildren(inp);add.onclick=null;inp.focus();
      inp.addEventListener("keydown",async e=>{if(e.key==="Escape")render();else if(e.key==="Enter"){const title=inp.value.trim();if(!title)return;
        const br=rmBranches(pid)[0],body={title,cat:"setup",parent:br?br.id:null,date:d,due:d,done:false,order:Date.now()};
        try{const ref=await store.add("tasks",body);state.tasks[ref.id]=body;render();v3undoToast("Added: "+title,()=>patchTask(ref.id,{cut:true}));}catch(err){fail(err);}}});
      inp.addEventListener("blur",()=>{if(!inp.value.trim())setTimeout(render,0);});};
    world.append(tree);const th=tree.offsetHeight,colH=RM_LH+ph+8,h=Math.max(colH,th);
    return {be,h,place(x,top){rmPut(be,x,top+(h-colH)/2+RM_LH);rmSat(world,tree,node,be.offsetWidth+RM_TG,Math.round(top+(h-th)/2-(top+(h-colH)/2+RM_LH)));
      tree.querySelectorAll("li.rm-task").forEach(li=>rmLinks.push({a:be,b:li,ul:tree,t:"li"}));rmFollow(be);}};});}
