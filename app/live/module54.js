// module54 one page: minimal branch sheet, finish, archive
function ohSheet(bid){const b=state.tasks[bid];if(!b)return;
  const dr={title:b.title||"",bStart:b.bStart||"",bEnd:b.bEnd||""};
  psOpen("Branch",re=>{
    const nm=el("input",{class:"v3-in oh-sname",dir:"auto",type:"text",maxlength:"60",value:dr.title,"aria-label":"Branch name"});
    nm.addEventListener("input",()=>{dr.title=nm.value;});
    const pr=ohProg(bid),st=ohStatus({...b,bStart:dr.bStart||null,bEnd:dr.bEnd||null});
    const stat=el("p",{class:"oh-sstat",text:st.text+", "+pr.done+"/"+pr.n+" tasks done"});stat.style.setProperty("--bc",ohColor(b));
    const from=el("input",{type:"date",class:"tt-in oh-from","aria-label":"From",value:dr.bStart});
    const to=el("input",{type:"date",class:"tt-in oh-to","aria-label":"To",value:dr.bEnd});
    from.addEventListener("change",()=>{dr.bStart=from.value;re();});to.addEventListener("change",()=>{dr.bEnd=to.value;re();});
    const dates=el("div",{class:"oh-field"},el("span",{class:"label",text:"Dates"}),el("div",{},from,el("span",{class:"hint",text:" to "}),to));
    const done=b.bState==="done";
    const foot=el("div",{class:"oh-sfoot"},
      el("button",{type:"button",class:"btn ghost oh-arch",text:"Archive",onclick:()=>{psClose();bkArchive(bid,true);}}),
      el("button",{type:"button",class:"btn ghost oh-fin",text:done?"Reopen":"Mark finished",onclick:()=>{done?ohReopen(bid):ohFinish(bid);}}),
      el("button",{type:"button",class:"btn oh-ok",text:"Confirm",onclick:()=>{
        if(dr.bStart&&dr.bEnd&&dr.bEnd<dr.bStart){toast("To is before From");return;}
        const nt=(dr.title||"").trim(),next={};
        if(nt&&nt!==b.title)next.title=nt;
        if((dr.bStart||null)!==(b.bStart||null))next.bStart=dr.bStart||null;
        if((dr.bEnd||null)!==(b.bEnd||null))next.bEnd=dr.bEnd||null;
        const old={};Object.keys(next).forEach(k=>{old[k]=b[k]===undefined?null:b[k];});
        const has=Object.keys(next).length>0;
        if(has)patchTask(bid,next);
        psClose();
        if(has)v3undoToast("Branch saved",()=>patchTask(bid,old));}}));
    return [nm,stat,dates,foot];
  });}
function ohFinish(bid){const b=state.tasks[bid];if(!b)return;
  const d=iso(new Date()),old={bState:b.bState||"active",bDoneAt:b.bDoneAt||null},prof0=mxClone(ohProf());
  patchTask(bid,{bState:"done",bDoneAt:d});
  ohProfSave({shipped:[{id:"s"+Date.now().toString(36),text:b.title,bid,at:d}].concat((prof0.shipped||[]).filter(x=>x.bid!==bid))});
  psClose();
  v3undoToast("Finished: "+b.title,()=>{patchTask(bid,old);ohProfSave({shipped:prof0.shipped||[]});});}
function ohReopen(bid){const b=state.tasks[bid];if(!b)return;
  const old={bState:b.bState||"active",bDoneAt:b.bDoneAt||null};
  patchTask(bid,{bState:"active",bDoneAt:null});psClose();
  v3undoToast("Reopened: "+b.title,()=>patchTask(bid,old));}
{const _bm=rmBranchMenu;rmBranchMenu=function(bid){if(ohOn())return ohSheet(bid);return _bm(bid);};}
try{window.__oh=window.__oh||{};window.__oh.sheet=ohSheet;window.__oh.finish=ohFinish;window.__oh.reopen=ohReopen;}catch(e){}
