// ===== 14 Nov WF2: waterfall v2. One bar per bucket (move, resize), tap a bar for handles, hold-drag to reorder rows, Move bucket. =====
// ---- range helpers: a bucket or a parent task owns a date range, its open tasks follow it ----
function wfMovable(rootId){return bkDescendants(rootId).filter(i=>{const t=state.tasks[i];return t&&t.date&&!t.done&&!t.cut&&!t.archived&&!t.bucket;});}
function wfBkRange(bid){const b=state.tasks[bid];if(!b)return null;if(b.bStart&&b.bEnd)return {s:b.bStart,e:b.bEnd};
  const ds=bkDescendants(bid).map(i=>state.tasks[i]).filter(t=>t&&t.date&&!t.cut&&!t.archived).map(t=>t.date).sort();return ds.length?{s:ds[0],e:ds[ds.length-1]}:null;}
function wfTaskRange(id){const t=state.tasks[id];if(!t||!t.date)return null;let e=addDays(t.date,Math.max(1,t.days||1)-1);bkDescendants(id).forEach(i=>{const k=state.tasks[i];if(k&&k.date&&!k.cut&&!k.archived&&k.date>e)e=k.date;});return {s:t.date,e};}
function wfRangeApply(rootId,rootPatch,o,n,withKids,label){const root=state.tasks[rootId];if(!root)return;const prev={};prev[rootId]={};Object.keys(rootPatch).forEach(k=>{prev[rootId][k]=root[k]===undefined?null:root[k];});
  bkSet(rootId,rootPatch);
  if(withKids){const oL=rsDiff(o.s,o.e)+1,nL=rsDiff(n.s,n.e)+1;
    wfMovable(rootId).forEach(i=>{const t=state.tasks[i];const off=Math.max(0,Math.min(oL-1,rsDiff(o.s,t.date)));
      const nd=oL===nL?addDays(t.date,rsDiff(o.s,n.s)):addDays(n.s,Math.round(off*(nL-1)/Math.max(1,oL-1)));if(nd===t.date)return;prev[i]={date:t.date};bkSet(i,{date:nd});});}
  render();
  v3undoToast("Moved: "+label,()=>{Object.keys(prev).forEach(i=>{if(state.tasks[i])bkSet(i,prev[i]);});render();},9000);}
function wfRangeAsk(rootId,rootPatch,o,n,label){const ids=wfMovable(rootId);
  if(!ids.length){wfRangeApply(rootId,rootPatch,o,n,false,label);return;}
  const same=rsDiff(o.s,o.e)===rsDiff(n.s,n.e),sh=rsDiff(o.s,n.s);
  psOpen("Move its tasks too?",()=>[el("p",{class:"ps-sh-sum",text:label}),
    el("p",{class:"hint",text:ids.length+" open task"+(ids.length===1?"":"s")+(same?" move by "+Math.abs(sh)+" day"+(Math.abs(sh)===1?"":"s")+(sh<0?" earlier":" later")+".":" are spread to fit the new dates.")}),
    el("button",{type:"button",class:"btn wf-mv-yes",onclick:()=>{psClose(true);wfRangeApply(rootId,rootPatch,o,n,true,label);}},"Move its tasks too"),
    el("button",{type:"button",class:"btn ghost wf-mv-no",onclick:()=>{psClose(true);wfRangeApply(rootId,rootPatch,o,n,false,label);}},"Only the "+(state.tasks[rootId].bucket?"bucket dates":"bar")),
    el("button",{type:"button",class:"btn ghost",onclick:()=>psClose()},"Cancel")]);}
function wfBkSet(bid,nS,nE){const b=state.tasks[bid],o=wfBkRange(bid);if(!b||!o||!nS||!nE)return;if(nE<nS){toast("The end cannot be before the start");render();return;}
  if(nS===o.s&&nE===o.e){render();return;}wfRangeAsk(bid,{bStart:nS,bEnd:nE},o,{s:nS,e:nE},b.title);}
function wfTaskSet(id,nS,nE){const t=state.tasks[id],o=wfTaskRange(id);if(!t||!o)return;if(nE<nS){render();return;}if(nS===o.s&&nE===o.e){render();return;}
  wfRangeAsk(id,{date:nS,days:rsDiff(nS,nE)+1},o,{s:nS,e:nE},t.title);}
// bucket dates edited in the sheet: ask the same question
function bkDateEdit(bid,part,plain){const b=state.tasks[bid],o=wfBkRange(bid);if(!b||!o){plain();return;}
  const nS=part.bStart!==undefined?part.bStart:o.s,nE=part.bEnd!==undefined?part.bEnd:o.e;
  if(!nS||!nE||nE<nS||!wfMovable(bid).length||(nS===o.s&&nE===o.e)){plain();return;}
  psClose(true);setTimeout(()=>wfRangeAsk(bid,{bStart:nS,bEnd:nE},o,{s:nS,e:nE},b.title),40);}
// Move bucket: one new start day, the end follows
function bkMoveBucket(bid){const b=state.tasks[bid];if(!b)return;const o=wfBkRange(bid);if(!o){toast("Give it dates first");bkForm(bid);return;}
  const go=d=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(d))return;if(d===o.s){toast("It stays on "+rsDl(d));return;}const sh=rsDiff(o.s,d);psClose(true);setTimeout(()=>wfRangeAsk(bid,{bStart:d,bEnd:addDays(o.e,sh)},o,{s:d,e:addDays(o.e,sh)},b.title),40);};
  psOpen("Move bucket",()=>{const today=iso(new Date());const di=el("input",{type:"date",class:"tt-in v3-date bkm-date","aria-label":"New start day",value:o.s});di.addEventListener("change",()=>{if(di.value)go(di.value);});
    return [el("p",{class:"ps-sh-sum",text:b.title}),el("p",{class:"hint",text:"Now "+rsDl(o.s)+" to "+rsDl(o.e)+". Start and end move together."}),
      el("div",{class:"mv-list"},...[["Tomorrow, ",v3skipFri(addDays(today,1))],["Next Saturday, ",rsNextSat()],["+1 week, ",addDays(o.s,7)]].map(([n,d])=>el("button",{type:"button",class:"btn ghost mv-choice bkm-pick","data-d":d,onclick:()=>go(d)},n+rsDl(d)))),
      el("label",{class:"field mv-date"},el("span",{class:"label",text:"New start day"}),di)];});}
// ---- waterfall interaction (runs after every waterfall render) ----
{const _rw=renderWaterfall;renderWaterfall=function(){const o=document.querySelector("#wfBody .wf-scroll"),sl=o?o.scrollLeft:0,st=o?o.scrollTop:0;_rw();try{const n=document.querySelector("#wfBody .wf-scroll");if(n&&(sl||st)){n.scrollLeft=sl;n.scrollTop=st;}}catch(e){}try{wf2();}catch(e){console.warn(e);}};
  const colIdx=(row,x)=>{const cs=[...row.querySelectorAll(".wf-cell")];for(let i=0;i<cs.length;i++){const r=cs[i].getBoundingClientRect();if(x<r.right)return i;}return cs.length-1;};
  function rowCells(box,bar){const gr=bar.style.gridRow||bar.style.gridRowStart;const grid=box.querySelector(".wf-grid");return {cells:[...grid.querySelectorAll(".wf-cell")].filter(c=>(c.style.gridRow||c.style.gridRowStart)===gr),grid};}
  function wf2(){const box=document.getElementById("wfBody");if(!box)return;const grid=box.querySelector(".wf-grid");if(!grid)return;
    // --- bars: tap = handles, drag body = move, drag handle = resize, hold = menu ---
    const bars=[...grid.querySelectorAll(".wf-bar[data-id],.wf-bkbar[data-bk]")];
    bars.forEach(old=>{const isB=old.classList.contains("wf-bkbar"),id=isB?old.dataset.bk:old.dataset.id,t=state.tasks[id];if(!t)return;
      const b=old.cloneNode(true);old.replaceWith(b);b.removeAttribute("aria-hidden");b.setAttribute("role","button");b.tabIndex=0;b.style.touchAction="none";b.style.cursor="grab";b.classList.add("rs-bar");
      const key=(isB?"b:":"t:")+id,on=wfActive===key;b.dataset.key=key;
      b.setAttribute("aria-label",(on?"Resize ":"Select ")+t.title+". Tap for handles, drag to move, hold for more.");
      if(on){b.classList.add("active");b.setAttribute("aria-pressed","true");
        if(!b.dataset.clipl)b.append(el("span",{class:"wf-hdl l","data-h":"l","aria-label":"Start of "+t.title,role:"slider"}));
        if(!b.dataset.clipr)b.append(el("span",{class:"wf-hdl r","data-h":"r","aria-label":"End of "+t.title,role:"slider"}));}
      const menu=()=>isB?bkMenu(id):v3taskMenu(id);
      b.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();wfActive=on?null:key;render();}if(e.key==="ContextMenu")menu();});
      let x0=null,mode=null,drag=false,lt=null,held=false,i0=0,cells=[],w0=0,cw=0;
      b.addEventListener("pointerdown",e=>{if(e.button>0)return;const h=e.target.closest&&e.target.closest(".wf-hdl");mode=h?h.dataset.h:"m";x0=e.clientX;drag=false;held=false;clearTimeout(lt);
        cells=rowCells(box,b).cells;i0=colIdx({querySelectorAll:()=>cells},e.clientX);w0=b.getBoundingClientRect().width;cw=cells[0]?cells[0].getBoundingClientRect().width:34;
        if(mode==="m")lt=setTimeout(()=>{if(x0!=null&&!drag){held=true;menu();}},480);try{b.setPointerCapture(e.pointerId);}catch(_){}});
      b.addEventListener("pointermove",e=>{if(x0==null)return;const dx=e.clientX-x0;if(Math.abs(dx)>6){drag=true;clearTimeout(lt);}
        if(!drag)return;window.__sbDragging=true;const n=colIdx({querySelectorAll:()=>cells},e.clientX)-i0;b.style.opacity=".8";
        if(mode==="m")b.style.transform="translateX("+dx+"px)";
        else if(mode==="l"){b.style.transform="translateX("+n*cw+"px)";b.style.width=Math.max(cw*.6,w0-n*cw)+"px";b.style.justifySelf="start";}
        else{b.style.width=Math.max(cw*.6,w0+n*cw)+"px";b.style.justifySelf="start";}});
      const reset=()=>{b.style.transform="";b.style.opacity="";b.style.width="";b.style.justifySelf="";window.__sbDragging=false;};
      b.addEventListener("pointerup",e=>{clearTimeout(lt);if(x0==null)return;const wasDrag=drag,m=mode;const n=colIdx({querySelectorAll:()=>cells},e.clientX)-i0;x0=null;drag=false;reset();
        if(!wasDrag){if(held){held=false;return;}wfActive=on?null:key;render();return;}
        const sw=ev=>{ev.stopPropagation();ev.preventDefault();};document.addEventListener("click",sw,{capture:true,once:true});setTimeout(()=>document.removeEventListener("click",sw,true),350);
        if(n===0){return;}
        const days=cells.map(c=>c.dataset.d);
        if(isB){const o=wfBkRange(id);if(!o)return;
          if(m==="m")wfBkSet(id,addDays(o.s,n),addDays(o.e,n));
          else if(m==="l"){const ni=Math.max(0,days.indexOf(o.s)+n);wfBkSet(id,days[Math.min(ni,days.length-1)]||o.s,o.e);}
          else{const ei=days.indexOf(o.e)>=0?days.indexOf(o.e):days.length-1;wfBkSet(id,o.s,days[Math.max(0,Math.min(days.length-1,ei+n))]);}}
        else{const o=wfTaskRange(id);if(!o)return;const cur=state.tasks[id];
          if(m==="m")rsGo(id,days[Math.max(0,Math.min(days.length-1,days.indexOf(cur.date)+n))]||cur.date,"task");
          else if(m==="l"){const e0=addDays(cur.date,Math.max(1,cur.days||1)-1);const nd=days[Math.max(0,Math.min(days.indexOf(cur.date)+n,days.length-1))];wfTaskSet(id,nd,e0>nd?e0:nd);}
          else{const s0=days.indexOf(cur.date);const ne=days[Math.max(s0,Math.min(days.length-1,s0+Math.max(1,cur.days||1)-1+n))];wfTaskSet(id,cur.date,ne);}}});
      b.addEventListener("pointercancel",()=>{clearTimeout(lt);x0=null;drag=false;reset();});});
    // tapping anywhere else drops the handles
    if(!document.__wfOut){document.__wfOut=1;document.addEventListener("click",e=>{if(wfActive&&!(e.target.closest&&e.target.closest(".wf-bar,.wf-hdl"))){wfActive=null;document.querySelectorAll("#wfBody .wf-bar.active").forEach(x=>{x.classList.remove("active");x.querySelectorAll(".wf-hdl").forEach(h=>h.remove());});}},true);}
    // --- reorder rows: grip (desktop) or hold then drag (touch) ---
    const kids=[...grid.children];
    const labs=kids.filter(k=>k.classList.contains("wf-bk")&&k.dataset.bk&&k.dataset.bk!=="none"||k.classList.contains("v3-wfrow")&&k.dataset.id);
    let curB=null;const grpOf=new Map();kids.forEach(k=>{if(k.classList.contains("wf-bk"))curB=k.dataset.bk;if(labs.includes(k))grpOf.set(k,k.classList.contains("wf-bk")?"B":"T"+curB);});
    labs.forEach(lab=>{const kind=grpOf.get(lab),isB=kind==="B",id=isB?lab.dataset.bk:lab.dataset.id;
      const peers=()=>labs.filter(l=>grpOf.get(l)===kind&&l.isConnected);
      const rowEls=l=>{const gr=l.style.gridRow||l.style.gridRowStart;return kids.filter(k=>k.isConnected&&(k.style.gridRow||k.style.gridRowStart)===gr);};
      let st=null;
      const stopAll=()=>{if(!st)return;clearTimeout(st.tm);clearInterval(st.iv);document.removeEventListener("touchmove",tm,{capture:true});if(st.ind)st.ind.remove();if(st.els)st.els.forEach(x=>{x.style.transform="";x.classList.remove("wf-lift");});box.classList.remove("wf-reordering");lab.classList.remove("wf-armed");window.__sbDragging=false;st=null;};
      const tm=e=>{if(st&&(st.armed||st.on)&&e.cancelable)e.preventDefault();};
      lab.addEventListener("pointerdown",e=>{if(e.button>0||(e.target.closest&&e.target.closest("input,textarea")))return;stopAll();const grip=e.target.closest&&e.target.closest(".wf-grip");
        st={x0:e.clientX,y0:e.clientY,armed:!!grip,on:false,pid:e.pointerId,grip:!!grip};
        if(!grip)st.tm=setTimeout(()=>{if(st){st.armed=true;lab.classList.add("wf-armed");}},220);
        document.addEventListener("touchmove",tm,{capture:true,passive:false});});
      lab.addEventListener("pointermove",e=>{if(!st)return;const dy=e.clientY-st.y0,dx=e.clientX-st.x0;
        if(!st.on){if(!st.armed){if(Math.abs(dy)>8||Math.abs(dx)>8)stopAll();return;}if(Math.abs(dy)<7)return;
          st.on=true;clearTimeout(st.tm);window.__sbDragging=true;try{lab.setPointerCapture(st.pid);}catch(_){}
          st.els=rowEls(lab);st.els.forEach(x=>x.classList.add("wf-lift"));box.classList.add("wf-reordering");
          const sc=box.querySelector(".wf-scroll");st.sc=sc;st.ind=el("div",{class:"wf-drop","aria-hidden":"true"});sc.append(st.ind);
          st.iv=setInterval(()=>{if(!st||!st.on)return;const r=st.sc.getBoundingClientRect(),y=st.cy;if(y<r.top+40)st.sc.scrollTop-=10;else if(y>r.bottom-40)st.sc.scrollTop+=10;if(y<70)window.scrollBy(0,-10);else if(y>innerHeight-70)window.scrollBy(0,10);},30);}
        st.cy=e.clientY;st.els.forEach(x=>x.style.transform="translateY("+dy+"px)");
        const others=peers().filter(l=>l!==lab),mid=l=>{const r=l.getBoundingClientRect();return r.top+r.height/2;};let ins=0;others.forEach(l=>{if(mid(l)<e.clientY)ins++;});st.ins=ins;st.others=others;
        const sr=st.sc.getBoundingClientRect(),ref=others[ins]?others[ins].getBoundingClientRect().top:(others.length?others[others.length-1].getBoundingClientRect().bottom:sr.top);
        st.ind.style.top=(ref-sr.top+st.sc.scrollTop)+"px";});
      const fin=e=>{if(!st)return;const s=st;if(!s.on){stopAll();return;}
        const order=s.others.map(l=>isB?l.dataset.bk:l.dataset.id);order.splice(s.ins,0,id);const was=peers().map(l=>isB?l.dataset.bk:l.dataset.id);
        stopAll();lab.classList.remove("wf-armed");const swallow=ev=>{ev.stopPropagation();ev.preventDefault();};lab.addEventListener("click",swallow,{capture:true,once:true});setTimeout(()=>lab.removeEventListener("click",swallow,true),400);
        if(order.join()===was.join())return;
        const prev={};order.forEach((i,n)=>{const t=state.tasks[i];prev[i]=t&&t.wOrd!=null?t.wOrd:null;bkSet(i,{wOrd:n*10});});render();
        v3undoToast("Moved: "+(state.tasks[id]?state.tasks[id].title:"row"),()=>{Object.keys(prev).forEach(i=>{if(state.tasks[i])bkSet(i,{wOrd:prev[i]});});render();},9000);};
      lab.addEventListener("pointerup",fin);lab.addEventListener("pointercancel",()=>{stopAll();lab.classList.remove("wf-armed");});
      lab.addEventListener("pointerleave",()=>{if(st&&!st.on)stopAll();});
      if(isB&&!lab.dataset.rsl){lab.dataset.rsl="1";rsLong(lab,()=>{if(st&&st.on)return;bkMenu(id);});}});}}
