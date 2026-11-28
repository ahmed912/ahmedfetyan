// module52 one page: slim review strip and Done log
function ohPerLbl(p){return p==="year"?"this year":p==="all"?"all time":"this month";}
function ohDoneLog(){
  const p=ohPer();
  psOpen("Done log",re=>{const L=ohDoneList(p),n=L.length;
    const ul=el("ul",{class:"oh-log"});
    if(!n)ul.append(el("li",{class:"hint",text:"Nothing completed in this period yet."}));
    L.forEach(t=>{const id=t.id,par=state.tasks[t.parent],br=par&&par.bucket?par:null,col=br?ohColor(br):OH_SW[0];
      ul.append(el("li",{class:"oh-lrow","data-id":id,style:"--bc:"+col},el("span",{class:"oh-lck"}),
        el("div",{class:"oh-lmain"},el("span",{class:"oh-lt",text:t.title}),el("span",{class:"oh-lb",text:bkName(id)})),
        el("span",{class:"oh-chip",text:t.doneAt?fmt(t.doneAt,{month:"short",day:"numeric"}):"Earlier"}),
        el("button",{type:"button",class:"mini oh-restore",text:"Restore",onclick:()=>{const tt=state.tasks[id],h0=tt.doneHist||[],d0=tt.doneAt;patchTask(id,{doneHist:d0?h0.concat(d0):h0});setDone(id,false);v3undoToast("Restored: "+tt.title,()=>{setDone(id,true);patchTask(id,{doneAt:d0||null,doneHist:h0});});setTimeout(re,150);}})));});
    return [el("p",{class:"hint oh-lper",text:n+(n===1?" task completed":" tasks completed")+" · "+ohPerLbl(p)}),ul];});
}
function ohRail(){
  if(!ohOn()||page!=="roadmap")return;
  let rail=document.getElementById("ohRail");
  if(!rail){const sh=document.getElementById("ohShell"),bar=document.getElementById("ohBar");if(!sh||!bar)return;rail=el("div",{id:"ohRail",class:"oh-rail","aria-label":"Review"});bar.after(rail);}
  const p=ohPer(),N=ohDoneList(p).length,S=ohShippedN(p);
  const seg=el("div",{class:"oh-seg oh-per",role:"group","aria-label":"Period"});
  [["month","Month"],["year","Year"],["all","All time"]].forEach(([k,l])=>seg.append(el("button",{type:"button","data-p":k,"aria-pressed":String(p===k),text:l,onclick:()=>{ohSetPer(k);render();}})));
  rail.replaceChildren(el("div",{class:"oh-stats"},seg,
    el("button",{type:"button",class:"oh-stat",id:"ohDoneN",onclick:()=>ohDoneLog()},el("span",{class:"oh-num",text:String(N)}),el("span",{class:"oh-lbl",text:N===1?"task completed":"tasks completed"}),el("span",{class:"oh-sub",text:ohPerLbl(p)})),
    el("div",{class:"oh-stat",id:"ohShipN"},el("span",{class:"oh-num",text:String(S)}),el("span",{class:"oh-lbl",text:S===1?"project shipped":"projects shipped"}))));
}
{const _r=render;render=function(){_r();try{ohRail();}catch(e){console.warn(e);}};}
