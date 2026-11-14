// ===== Round 35: one decision per move. One recommended day, at most 3 quiet alternatives, no capacity numbers. =====
function mvNextFree(tasks,from){let d=from;for(let i=0;i<90;i++,d=addDays(d,1)){if(!(v3spOf(d)||!spOn())||rlOff(d))continue;if(!tasks||rlFits(tasks,d))return d;}return from;}
function rlMoveSheet(tasks,title){const open=tasks.filter(t=>!t.done);if(!open.length){toast("Nothing to move");return;}
  psOpen("Move chunk",re=>{const today=rlTodayIso(),d0=open.map(t=>t.date).filter(Boolean).sort().pop()||today,nf=mvNextFree(open,addDays(d0>today?d0:today,1)),tm=v3skipFri(addDays(today,1)),sat=rsNextSat();
    const di=v3dateField("New day",null,p=>{setTimeout(()=>rlMoveChunk(open,p,true),30);});
    const alts=[["Tomorrow, ",tm],["Next Saturday, ",sat]].filter(([n,d],i,a)=>d!==nf&&a.findIndex(x=>x[1]===d)===i);
    const more=[];for(let d=addDays(today,1),i=0;i<14&&more.length<5;d=addDays(d,1),i++){if((v3spOf(d)||!spOn())&&!rlOff(d))more.push(d);}
    return [el("p",{class:"ps-sh-sum",text:title}),
      el("div",{class:"mv-list"},el("button",{type:"button",class:"btn mv-choice mv-main rl-main","data-d":nf,onclick:()=>rlMoveChunk(open,nf,false)},"Next free day: "+rlDl(nf)),
        ...alts.map(([n,d])=>el("button",{type:"button",class:"btn ghost mv-choice","data-d":d,onclick:()=>rlMoveChunk(open,d,false)},n+rlDl(d))),
        el("label",{class:"field mv-date mv-choice"},el("span",{class:"label",text:"Pick a date"}),di)),
      el("details",{class:"mv-more"},el("summary",{class:"hint",text:"More days"}),el("div",{class:"mv-days"},...more.map(d=>el("button",{type:"button",class:"mini rl-day mv-day","data-d":d,onclick:()=>rlMoveChunk(open,d,false)},rlDay(d)+" "+(rlFits(open,d)?"free":"full")))))];});}
