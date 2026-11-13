  // =====================================================================
  // 12 Nov: V03 updates. Typed times, login history, day timeline, Time entries, task cards, War merged with the focus timer
  // =====================================================================
  // ---------- typed times: every time field takes typing (8:30, 830, 8:30 pm, 20:30), never a picker ----------
  function v3parse(s){s=String(s==null?"":s).trim().toLowerCase().replace(/\s+/g," ");if(!s)return null;
    const m=s.match(/^(\d{1,2})(?:[:.\s]?(\d{2}))?\s*(a|p|am|pm|a\.m\.|p\.m\.)?$/);if(!m)return null;
    let h=+m[1],mi=m[2]!=null?+m[2]:0;const ap=m[3]?m[3][0]:null;if(mi>59)return null;
    if(ap){if(h<1||h>12)return null;if(ap==="p"&&h<12)h+=12;if(ap==="a"&&h===12)h=0;}else if(h>23)return null;
    return String(h).padStart(2,"0")+":"+String(mi).padStart(2,"0");}
  const v3VD=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value");
  function v3typed(inp){if(!inp||inp.dataset.tt)return inp;inp.dataset.tt="1";const v=v3VD.get.call(inp);
    inp.type="text";inp.setAttribute("inputmode","text");inp.setAttribute("autocomplete","off");if(!inp.placeholder)inp.placeholder="8:30 AM";inp.classList.add("tt-in");
    v3VD.set.call(inp,v&&/^\d{2}:\d{2}/.test(v)?t12(v.slice(0,5)):"");
    Object.defineProperty(inp,"value",{configurable:true,get(){return v3parse(v3VD.get.call(inp))||"";},set(x){v3VD.set.call(inp,x&&/^\d{1,2}:\d{2}/.test(String(x))?t12(String(x).slice(0,5)):(x||""));}});
    inp.addEventListener("blur",()=>{const p=v3parse(v3VD.get.call(inp));if(p)v3VD.set.call(inp,t12(p));});
    inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();inp.blur();}});
    return inp;}
  // a typed time that does not read as a time never reaches the app: it is caught before any other handler
  document.addEventListener("change",e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.tt)return;const raw=v3VD.get.call(t).trim();if(raw&&!v3parse(raw)){e.stopImmediatePropagation();toast("Type a time like 8:30 AM or 20:30");}},true);
  function v3convertAll(root){(root||document).querySelectorAll('input[type="time"]').forEach(v3typed);}
  new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType!==1)continue;if(n.matches&&n.matches('input[type="time"]'))v3typed(n);else if(n.querySelector&&n.querySelector('input[type="time"]'))v3convertAll(n);}}).observe(document.body,{childList:true,subtree:true});
  v3convertAll();
  function v3time(label,val,onSet,o){o=o||{};const inp=v3typed(el("input",{type:"text","aria-label":label,class:"tt-in"+(o.cls?" "+o.cls:""),placeholder:o.ph||"8:30 AM"}));
    if(val)inp.value=val;inp.addEventListener("change",()=>{const p=inp.value;if(!p&&v3VD.get.call(inp).trim())return;onSet(p||null);});return inp;}
  const v3t=ms=>t12(hhmm(ms));
  // ---------- small confirm: every swipe asks before it acts ----------
  function v3confirm(msg,yesTxt,onYes,onNo){const old=document.getElementById("v3Conf");if(old)old.remove();
    const done=fn=>{w.remove();try{fn&&fn();}catch(e){console.warn(e);}};
    const w=el("div",{id:"v3Conf",class:"v3-conf-wrap",role:"dialog","aria-modal":"true","aria-label":msg,onclick:e=>{if(e.target===w)done(onNo);}},
      el("div",{class:"v3-conf"},el("p",{class:"v3-conf-t",text:msg}),
        el("div",{class:"v3-conf-b"},el("button",{type:"button",class:"btn ghost",onclick:()=>done(onNo)},"Cancel"),el("button",{type:"button",class:"btn",onclick:()=>done(onYes)},yesTxt||"Yes"))));
    document.body.append(w);setTimeout(()=>{const b=w.querySelector(".btn:not(.ghost)");if(b)b.focus();},30);}
  // ---------- gestures are never interrupted by a redraw: changes that arrive mid-swipe wait for it to end ----------
  let v3hold=0,v3pend=false;
  {const _r=render;render=function(){if(v3hold>0){v3pend=true;return;}_r();};}
  function v3holdOn(){v3hold++;}
  function v3holdOff(){v3hold=Math.max(0,v3hold-1);if(!v3hold&&v3pend){v3pend=false;setTimeout(()=>{try{render();}catch(e){}},0);}}
  // swipe that works with touch and mouse: a clear threshold, follows the finger, snaps back, then asks
  swipeable=function(card,onRight,onLeft,onTap,labels){labels=labels||{};let x0=null,y0=0,dx=0,dy=0,pid=null,mode=null;
    card.style.touchAction="pan-y";
    const reset=()=>{card.style.transition="transform .2s ease";card.style.transform="";card.dataset.dir="";};
    card.addEventListener("pointerdown",e=>{if(e.button>0||e.target.closest("button,a,input,select,textarea,.cat-chip"))return;x0=e.clientX;y0=e.clientY;dx=dy=0;mode=null;pid=e.pointerId;card.style.transition="none";v3holdOn();});
    card.addEventListener("pointermove",e=>{if(x0===null)return;dx=e.clientX-x0;dy=e.clientY-y0;
      if(!mode){if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)*1.2){mode="x";try{card.setPointerCapture(pid);}catch(_){}}else if(Math.abs(dy)>10)mode="y";}
      if(mode!=="x")return;e.preventDefault();card.style.transform="translateX("+dx+"px) rotate("+(dx/30)+"deg)";card.dataset.dir=dx>50?"r":dx<-50?"l":"";});
    const end=()=>{if(x0===null)return;x0=null;const m=mode;mode=null;v3holdOff();
      if(m!=="x"){reset();if(m===null&&Math.abs(dx)<6&&Math.abs(dy)<6&&onTap)onTap();return;}
      if(Math.abs(dx)<90){reset();return;}
      const r=dx>0;if(!r&&labels.direct){reset();onLeft();return;}card.style.transition="transform .2s ease";card.style.transform="translateX("+(r?1:-1)*Math.min(innerWidth,520)*0.45+"px) rotate("+(r?6:-6)+"deg)";
      const title=card.getAttribute("aria-label")||"this task";
      v3confirm((r?(labels.r||"Mark as done"):(labels.l||"Move to tomorrow"))+": "+title+"?",r?(labels.rb||"Done"):(labels.lb||"Move"),()=>{r?onRight():onLeft();},reset);};
    card.addEventListener("pointerup",end);card.addEventListener("pointercancel",()=>{if(x0===null)return;x0=null;mode=null;v3holdOff();reset();});};

  // ---------- 1. log in / log out history: every day, by week, all days on demand, edit any time by typing ----------
  const v3wkStart=d=>{const x=new Date(d+"T12:00");const back=(x.getDay()+1)%7;x.setDate(x.getDate()-back);return iso(x);};// weeks start on Saturday
  function v3loginDays(){const keys=Object.keys(state.logs||{}).filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)).sort(),today=iso(new Date());
    const first=keys.length?keys[0]:today,out=[];const x=new Date((first<START?START:first)+"T12:00");
    for(let i=0;i<400;i++){const d=iso(x);if(d>today)break;out.push(d);x.setDate(x.getDate()+1);}return out.reverse();}
  let v3lhAll=false,v3lhOpen={};
  function loginHistory(){psOpen("Log in history",re=>{const days=v3loginDays(),weeks=[];
    days.forEach(d=>{const w=v3wkStart(d);let g=weeks.find(x=>x.w===w);if(!g){g={w,days:[]};weeks.push(g);}g.days.push(d);});
    const span=d=>{const L=log(d);return L.workIn&&L.workOut&&L.workOut>L.workIn?(L.workOut-L.workIn)/60000:0;};
    const thisW=v3wkStart(iso(new Date()));
    const row=d=>{const L=log(d),m=span(d);
      return el("tr",{class:d===iso(new Date())?"lh-today":""},el("th",{scope:"row",class:"lh-d",text:fmt(d,{weekday:"short",day:"numeric",month:"short"})}),
        el("td",{},v3time("Log in on "+d,L.workIn?hhmm(L.workIn):"",v=>{setLogPatch(d,{workIn:v?atOn(d,v):null});toast(v?"Log in set to "+t12(v):"Log in cleared");setTimeout(re,350);},{ph:"In"})),
        el("td",{},v3time("Log out on "+d,L.workOut?hhmm(L.workOut):"",v=>{if(v&&L.workIn&&atOn(d,v)<=L.workIn){toast("Log out must be after log in");setTimeout(re,10);return;}setLogPatch(d,{workOut:v?atOn(d,v):null});toast(v?"Log out set to "+t12(v):"Log out cleared");setTimeout(re,350);},{ph:"Out"})),
        el("td",{class:"num lh-t",text:m?dur(m):(L.workIn&&!L.workOut&&d===iso(new Date())?"now":"")}));};
    return [el("div",{class:"lh-top"},el("p",{class:"hint",text:"Type a time like 8:30 or 4:15 pm. Weeks start on Saturday."}),
        el("button",{type:"button",class:"btn ghost lh-all","aria-pressed":String(v3lhAll),onclick:()=>{v3lhAll=!v3lhAll;re();}},v3lhAll?"Weeks only":"Show all days")),
      ...weeks.map(g=>{const tot=g.days.reduce((a,d)=>a+span(d),0),n=g.days.filter(d=>log(d).workIn).length,open=v3lhAll||v3lhOpen[g.w]!=null?(v3lhAll||v3lhOpen[g.w]):g.w===thisW;
        const end=new Date(g.w+"T12:00");end.setDate(end.getDate()+6);
        return el("section",{class:"lh-wk"+(open?" open":"")},
          el("button",{type:"button",class:"lh-wh","aria-expanded":String(open),onclick:()=>{v3lhOpen[g.w]=!open;re();}},
            el("span",{class:"lh-wn",text:fmt(g.w,{day:"numeric",month:"short"})+" to "+fmt(iso(end),{day:"numeric",month:"short"})}),
            el("span",{class:"hint",text:n+" day"+(n===1?"":"s")}),el("b",{class:"num",text:tot?dur(tot):"0m"})),
          open?el("div",{class:"lh-tw"},el("table",{class:"lh-tab"},el("thead",{},el("tr",{},el("th",{text:"Day"}),el("th",{text:"In"}),el("th",{text:"Out"}),el("th",{text:"At work"}))),el("tbody",{},...g.days.map(row)))):null);})];});}
  document.addEventListener("click",e=>{const wb=e.target.closest("#workBar");if(!wb||e.target.closest("button,a,input,select,textarea,label,.wb-low"))return;loginHistory();});
  {const _wb=renderWorkBar;renderWorkBar=function(){_wb();const box=document.getElementById("workBar");if(!box)return;
    if(!box.querySelector(".wb-hist")){const top=box.querySelector(".wb-top");if(top)top.append(el("button",{type:"button",class:"btn ghost wb-hist",onclick:loginHistory},"History"));}
    box.querySelectorAll('input[type="time"]').forEach(v3typed);};}

  // ---------- 2. day timeline: hover shows the time under the pointer, each block's end, the arrow's time; the plan is editable ----------
  let v3tip=null;function v3tipShow(x,y,txt){if(!v3tip){v3tip=el("div",{class:"v3-tip",role:"tooltip"});document.body.append(v3tip);}v3tip.textContent=txt;v3tip.hidden=false;
    const w=v3tip.offsetWidth||140;v3tip.style.left=Math.max(8,Math.min(innerWidth-w-8,x-w/2))+"px";v3tip.style.top=Math.max(8,y-44)+"px";}
  function v3tipHide(){if(v3tip)v3tip.hidden=true;}
  const v3mm=m=>{m=Math.round(m);return t12(String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"));};
  {const _db=dayBar2;dayBar2=function(d,items){const node=_db(d,items);try{v3dayBar(node,d,items);}catch(e){console.warn(e);}return node;};}
  function v3dayBar(node,d,items){const a=hmMin(DAY_START),z=hmMin(DAY_END),sp=z-a,track=node.querySelector(".dbar-track");if(!track)return;
    const segs=[...track.querySelectorAll(".dbar-seg")];items.forEach((b,i)=>{const s=segs[i];if(s){s.dataset.n=b.name||b.kind;s.dataset.f=b.from;s.dataset.t=b.to;s.setAttribute("aria-label",(b.name||b.kind)+", "+t12(b.from)+" to "+t12(b.to));}});
    // worked time: its own colour, as a thin line under the plan
    const pc=m=>Math.max(0,Math.min(100,(m-a)/sp*100));
    const work=el("div",{class:"dbar-work","aria-hidden":"true"});
    (entriesOn(d)||[]).filter(x=>x.kind!=="event"&&x.kind!=="break").forEach(x=>sessionsOf(x).forEach(se=>{const f=minsOf(se.start),t=minsOf(se.end);if(t>f)work.append(el("span",{style:"left:"+pc(f)+"%;width:"+Math.max(.6,pc(t)-pc(f))+"%"}));}));
    track.after(work);
    const ax=node.querySelector(".dbar-ax");if(ax&&innerWidth<700){[...ax.children].forEach((s,i,arr)=>{if(i!==0&&i!==arr.length-1&&i!==Math.floor(arr.length/2))s.hidden=true;});}
    const show=e=>{const r=track.getBoundingClientRect();const m=a+(e.clientX-r.left)/r.width*sp,b=items.find(x=>m>=hmMin(x.from)&&m<hmMin(x.to));
      const nowM=new Date().getHours()*60+new Date().getMinutes(),nearNow=d===iso(new Date())&&Math.abs((nowM-m)/sp*r.width)<10;
      v3tipShow(e.clientX,r.top,(nearNow?"Now "+v3mm(nowM)+" · ":v3mm(m)+" · ")+(b?(b.name||b.kind)+" ends "+t12(b.to):"Outside the plan"));};
    track.addEventListener("pointermove",e=>{if(e.pointerType==="mouse")show(e);});
    track.addEventListener("pointerleave",v3tipHide);
    // touch: press and hold reads the time, a tap still opens Time
    let ht=null;track.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse")return;ht=setTimeout(()=>{show(e);ht="shown";},350);});
    track.addEventListener("pointerup",e=>{if(ht==="shown"){e.stopPropagation();setTimeout(v3tipHide,1600);}else clearTimeout(ht);ht=null;});
    track.addEventListener("click",e=>{if(e.pointerType!=="mouse"&&v3tip&&!v3tip.hidden)e.stopPropagation();},true);
    const now=node.querySelector(".dbar-now");if(now)now.title="Now";
    const f=node.querySelector(".dbar-focus");
    if(f){const tg=v3dayMin(),wk=v3workMin(d),fp=Math.min(100,wk/tg*100),fill=f.querySelector(".fill"),nm=f.querySelector(".num");if(fill){fill.style.width=fp+"%";fill.classList.toggle("good",fp>=100);}
      if(nm){v3dayNum(nm,wk,tg,d);nm.classList.add("v3-edtarget");nm.setAttribute("role","button");nm.tabIndex=0;nm.title="Change the day target";nm.onclick=e=>{e.stopPropagation();dayTargetSheet();};nm.onkeydown=e=>{if(e.key==="Enter"){e.stopPropagation();dayTargetSheet();}};}}
    if(f&&!f.querySelector(".v3-fill"))f.append(el("button",{type:"button",class:"cl-det v3-fill",onclick:e=>{e.stopPropagation();v3fillDay();}},"Fill my day"));
    if(f&&!f.querySelector(".v3-plan"))f.append(el("button",{type:"button",class:"cl-det v3-plan",onclick:e=>{e.stopPropagation();planSheet();}},"Edit plan"));}
  function planSheet(){psOpen("Plan for "+(sel===iso(new Date())?"today":fmt(sel,{weekday:"short",day:"numeric",month:"short"})),re=>{const items=layout(sel,planOf(sel),true);
    return [el("p",{class:"hint",text:"Type when each part ends. The next part starts right after it. Design starts by 8:00 AM."}),
      el("table",{class:"lh-tab pl-tab"},el("thead",{},el("tr",{},el("th",{text:"Part"}),el("th",{text:"Starts"}),el("th",{text:"Ends"}),el("th",{text:"Length"}))),
        el("tbody",{},...items.map(b=>el("tr",{},el("th",{scope:"row",text:b.kind==="work"?holdName(b):(b.name||b.kind)}),el("td",{class:"num",text:t12(b.from)}),
          el("td",{},b.kind==="family"?el("span",{class:"num",text:t12(b.to)}):v3time(b.name+" ends",b.to,v=>{if(!v){re();return;}const len=hmMin(v)-hmMin(b.from)-(b.prayAdd||0)+(b.shrunk||0);if(len<=0){toast("The end must be after "+t12(b.from));re();return;}resizeItem(b.pid,Math.round(len),0);setTimeout(re,350);})),
          el("td",{class:"num",text:dur(b.len)}))))),
      el("div",{class:"v3-row"},el("button",{type:"button",class:"btn ghost",onclick:()=>{setLogPatch(sel,{plan:null});toast("Plan reset");setTimeout(re,300);}},"Reset plan"))];});}

  // ---------- 3. Time ----------
  // arrows beside the day, a review table, edit any entry, manual time only against a task with a category
  function v3timeHead(){const head=document.querySelector(".ps-sheet .ps-sh-head");if(!head||head.querySelector(".v3-dnav"))return;const h2=head.querySelector("h2");
    const go=k=>{const b=document.getElementById(k);if(b&&!b.disabled)b.click();setTimeout(()=>{const t=document.querySelector(".ps-sheet .ps-sh-head h2");if(t)t.textContent=sel===iso(new Date())?"Today":fmt(sel,{weekday:"long",day:"numeric",month:"short"});const n=document.querySelector(".v3-dnav .v3-nx");if(n)n.disabled=sel>=iso(new Date());},60);};
    const nav=el("div",{class:"v3-dnav"},el("button",{type:"button",class:"v3-ar","aria-label":"Previous day",onclick:()=>go("prevDay")},"‹"),h2,el("button",{type:"button",class:"v3-ar v3-nx","aria-label":"Next day",onclick:()=>go("nextDay")},"›"));
    head.prepend(nav);nav.querySelector(".v3-nx").disabled=sel>=iso(new Date());
    head.insertBefore(el("button",{type:"button",class:"btn ghost v3-rev",onclick:timeReview},"Review"),head.querySelector(".ps-sh-x"));
    const hint=document.querySelector(".ps-sheet .tm-hint");if(hint)hint.remove();}
  let v3tOrigin=null;
  {const _op=openPop;openPop=function(k){const origin=(k==="ent"&&v3tOrigin!=null)?v3tOrigin:sel;v3tOrigin=null;_op(k);
    if(k==="ent"){setTimeout(v3timeHead,0);const st=sheetStack[sheetStack.length-1];if(st){const oc=st.onClose;st.onClose=()=>{try{oc&&oc();}catch(e){}if(sel!==origin){sel=clampDate(origin);render();}};}}};}
  function timeReview(){psOpen("Time logged",re=>{const days=Object.keys(state.entries||{}).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort().reverse();
    const tot=d=>{const it=entriesOn(d).filter(x=>!isEstimate(x)&&x.kind!=="event"&&x.kind!=="break");return unionMin(it);};
    const weeks=[];days.forEach(d=>{const w=v3wkStart(d);let g=weeks.find(x=>x.w===w);if(!g){g={w,days:[]};weeks.push(g);}g.days.push(d);});
    if(!days.length)return [el("p",{class:"ps-sh-sum",text:"Nothing logged yet."})];
    return [el("p",{class:"hint",text:"Tap a day to open it."}),...weeks.map(g=>{const wt=g.days.reduce((a,d)=>a+tot(d),0);
      return el("section",{class:"lh-wk open"},el("div",{class:"lh-wh"},el("span",{class:"lh-wn",text:"Week of "+fmt(g.w,{day:"numeric",month:"short"})}),el("span"),el("b",{class:"num",text:dur(wt)})),
        el("table",{class:"lh-tab tr-tab"},el("tbody",{},...g.days.map(d=>{const m=tot(d);return el("tr",{class:"tr-row",tabindex:"0",role:"button","aria-label":"Open "+d,onclick:()=>v3openDay(d),onkeydown:e=>{if(e.key==="Enter")v3openDay(d);}},
          el("th",{scope:"row",text:fmt(d,{weekday:"short",day:"numeric",month:"short"})}),el("td",{},el("div",{class:"tr-bar"},el("span",{style:"width:"+Math.min(100,m/v3dayMin()*100)+"%"}))),el("td",{class:"num",text:dur(m)}));}))));})];});}
  function v3openDay(d){const o=sel;psClose(true);v3tOrigin=o;sel=clampDate(d);render();setTimeout(()=>{openPop("ent");},50);}
  // edit an entry after logging it: name, task, category, each session's start and end, or delete
  function entryEdit(d,id){psOpen("Edit entry",re=>{const items=entriesOn(d).map(x=>({...x,sessions:sessionsOf(x)})),x=items.find(y=>y.id===id);if(!x)return [el("p",{text:"This entry is gone."})];
    const save=(msg)=>{x.minutes=Math.round(x.sessions.reduce((a,s)=>a+Number(s.minutes||0),0)*10)/10;delete x.start;delete x.end;saveEntries(d,items);if(msg)toast(msg);setTimeout(re,300);};
    const name=el("input",{type:"text",class:"v3-in","aria-label":"Name",value:x.name||x.label||""});name.onchange=()=>{const n=name.value.trim();if(n&&n!==x.label)x.name=n;else delete x.name;save("Renamed");};
    const ts=v3taskChoices();const tsel=el("select",{class:"v3-in","aria-label":"Task"},el("option",{value:"",text:"No task"}),...ts.map(t=>el("option",{value:t.id,text:t.title})));
    tsel.value=String(x.ref||"").startsWith("tasks:")?x.ref.slice(6):"";tsel.onchange=()=>{const t=state.tasks[tsel.value];if(t){x.ref="tasks:"+tsel.value;x.label=t.title;if(!x.cat&&t.cat)x.cat=t.cat;}else{x.ref="other";}save("Task updated");};
    return [el("label",{class:"field"},el("span",{class:"label",text:"Name"}),name),
      el("label",{class:"field"},el("span",{class:"label",text:"Task"}),tsel),
      el("div",{class:"field"},el("span",{class:"label",text:"Category"}),v3catChips(x.cat||((state.tasks[String(x.ref||"").slice(6)]||{}).cat),c=>{x.cat=c;save("Category set");})),
      el("div",{class:"field"},el("span",{class:"label",text:"Sessions"}),
        el("table",{class:"lh-tab"},el("thead",{},el("tr",{},el("th",{text:"From"}),el("th",{text:"To"}),el("th",{text:"Length"}),el("th",{}))),
          el("tbody",{},...x.sessions.map((s,i)=>el("tr",{},
            el("td",{},v3time("Session start",hhmm(s.start),v=>{if(!v)return;const st=atOn(d,v);if(st>=s.end){toast("Start must be before the end");re();return;}s.start=st;s.minutes=Math.round((s.end-st)/600)/100;save("Session updated");})),
            el("td",{},v3time("Session end",hhmm(s.end),v=>{if(!v)return;const en=atOn(d,v);if(en<=s.start){toast("End must be after the start");re();return;}s.end=en;s.minutes=Math.round((en-s.start)/600)/100;save("Session updated");})),
            el("td",{class:"num",text:dur(s.minutes||0)}),
            el("td",{},el("button",{type:"button",class:"x","aria-label":"Delete this session",onclick:()=>v3confirm("Delete this session?","Delete",()=>{x.sessions.splice(i,1);if(!x.sessions.length){saveEntries(d,items.filter(y=>y.id!==id));psClose();toast("Entry removed");return;}save("Session deleted");})},"×"))))))),
      el("div",{class:"v3-row"},el("button",{type:"button",class:"btn ghost danger",onclick:()=>v3confirm("Delete the whole entry?","Delete",()=>{saveEntries(d,entriesOn(d).filter(y=>y.id!==id));psClose();toast("Entry removed. Hours updated.");})},"Delete entry"))];});}
  function v3catChips(cur,onPick){return el("div",{class:"v3-cats",role:"group"},...Object.entries(CAT_NAME).map(([k,n])=>el("button",{type:"button",class:"cat-chip"+(cur===k?" on":""),"data-cat":k,"aria-pressed":String(cur===k),onclick:()=>onPick(k)},n)));}
  function v3taskChoices(){const sp=sprintFor(iso(new Date()));return Object.entries(state.tasks||{}).map(([id,t])=>({id,...t})).filter(t=>isLeaf(t)&&!t.cut&&!t.archived&&t.title&&(!sp||!t.date||(t.date>=sp.start&&t.date<=sp.end)||t.date===sel)).sort((a,b)=>(a.done-b.done)||(a.date<b.date?-1:1));}
  // manual time: what you did must be a task; the category is set by hand
  function manualEntry(){let pick=null,cat=null,q="";const d=sel;let fromV="",toV="",note="";
    psOpen("Add time by hand",re=>{const ts=v3taskChoices().filter(t=>!q||t.title.toLowerCase().includes(q.toLowerCase()));const t=pick&&state.tasks[pick];
      const search=el("input",{type:"search",class:"v3-in",placeholder:"Find a task","aria-label":"Find a task",value:q});search.oninput=()=>{q=search.value;const pos=search.selectionStart;re();setTimeout(()=>{const s=document.querySelector(".ps-sheet .v3-in[type=search]");if(s){s.focus();try{s.setSelectionRange(pos,pos);}catch(e){}}},0);};
      return [el("p",{class:"hint",text:"For "+(d===iso(new Date())?"today":fmt(d,{weekday:"long",day:"numeric",month:"short"}))}),
        el("div",{class:"field"},el("span",{class:"label",text:"Task"}),t?el("div",{class:"v3-pick"},el("b",{text:t.title}),el("button",{type:"button",class:"cl-det",onclick:()=>{pick=null;re();}},"Change")):el("div",{},search,
          el("ul",{class:"v3-tlist"},...ts.slice(0,30).map(x=>el("li",{},el("button",{type:"button",class:"v3-trow",onclick:()=>{pick=x.id;if(!cat)cat=x.cat||null;re();}},el("span",{text:x.title}),x.cat?el("span",{class:"cat-chip","data-cat":x.cat,text:CAT_NAME[x.cat]||x.cat}):null))),ts.length||q.trim()?null:el("li",{class:"hint",text:"No task matches."}),q.trim()&&!ts.some(x=>x.title.trim().toLowerCase()===q.trim().toLowerCase())?el("li",{},el("button",{type:"button",class:"v3-trow v3-newtask",onclick:async()=>{const title=q.trim();if(!title)return;let c="other";try{const nm=new Date().getHours()*60+new Date().getMinutes(),bl=DAY_BLOCKS.find(b=>hmMin(b.from)<=nm&&nm<hmMin(b.to));if(bl)c=({1:"learning",2:"portfolio",3:"linkedin"})[bl.n]||"other";}catch(e){}
            const day=iso(new Date()),sp=sprintFor(day),id=await v3newTask({title,cat:c,date:day,sprint:sp&&sp.n,done:false,moved:0,order:Date.now()});if(!id)return;pick=id;if(!cat)cat=c;q="";re();}},el("span",{text:"Add \""+q.trim()+"\" as a new task"}))):null))),
        el("div",{class:"field"},el("span",{class:"label",text:"Category"}),v3catChips(cat,c=>{cat=c;re();})),
        el("div",{class:"v3-row"},el("label",{class:"field"},el("span",{class:"label",text:"From"}),v3time("From",fromV,v=>{fromV=v||"";})),el("label",{class:"field"},el("span",{class:"label",text:"To"}),v3time("To",toV,v=>{toV=v||"";}))),
        el("label",{class:"field"},el("span",{class:"label",text:"Note"}),(n=>{n.oninput=()=>{note=n.value;};return n;})(el("input",{type:"text",class:"v3-in",value:note,placeholder:"Optional"}))),
        el("button",{type:"button",class:"btn",onclick:()=>{const ae=document.activeElement;if(ae&&ae.blur)ae.blur();setTimeout(()=>{
          if(!pick){toast("Pick the task you worked on");return;}if(!cat){toast("Pick a category");return;}if(!fromV||!toV){toast("Type both times");return;}
          const st=atOn(d,fromV),en=atOn(d,toV);if(en<=st){toast("The end must be after the start");return;}
          if(v3overlap(d,st,en)){v3confirm("This overlaps time already logged. Add it anyway?","Add",()=>v3addManual(d,pick,cat,st,en,note));return;}v3addManual(d,pick,cat,st,en,note);},30);}},"Add time")];});}
  function v3overlap(d,st,en){return entriesOn(d).filter(x=>x.kind!=="event"&&x.kind!=="break").some(x=>sessionsOf(x).some(s=>s.start<en&&s.end>st));}
  function v3addManual(d,id,cat,st,en,note){const t=state.tasks[id];const minutes=(en-st)/60000;
    addEntry(d,{kind:"manual",ref:"tasks:"+id,label:t.title,cat,learning:cat==="learning",start:st,end:en,minutes,note:note||""});
    patchTask(id,{spent:Math.round(((t.spent||0)+minutes)*10)/10});psClose();toast(dur(minutes)+" added to "+t.title);}
  // entries list: an Edit button on every row; the old hand form is replaced by the task-based one
  {const _re=renderEntries;renderEntries=function(){_re();try{const ul=document.getElementById("entList");if(!ul)return;const items=entriesOn(sel).filter(x=>!isEstimate(x)).concat(liveItems(sel));
    const kids=[...ul.children];let i=0;
    items.forEach(x=>{const li=kids[i];if(!li)return;if(x.kind==="event"||x.live){i++;return;}i+=(sessFor===x.id?2:1);if(!li.classList.contains("ent"))return;li.dataset.eid=x.id;
      const acts=li.querySelector(".ent-acts");if(acts&&!acts.querySelector(".v3-edit"))acts.prepend(el("button",{type:"button",class:"mini v3-edit",onclick:()=>entryEdit(sel,x.id)},"Edit"));
      li.classList.add("v3-ent");li.addEventListener("click",e=>{if(e.target.closest("button,input"))return;entryEdit(sel,x.id);});});
    const add=document.getElementById("entAdd");if(add){add.hidden=true;let b=document.getElementById("v3AddTime");if(!b){b=el("button",{type:"button",id:"v3AddTime",class:"btn ghost",onclick:manualEntry},"Add time by hand");add.after(b);}}
    const hero=document.getElementById("entHero");if(hero)hero.classList.add("v3-line");}catch(e){console.warn(e);}};}

  // ---------- 4. task cards: category tab, tap to bring to front, hold to reorder, swipe asks first, Start opens War ----------
  function v3pos(t){return t.pos!=null?t.pos:1e6+((t.block||0)*1000)+(t.order||0);}
  sortedTasks=function(){return tasksOn(sel).sort((a,b)=>v3pos(a)-v3pos(b));};
  function v3front(id){const ts=sortedTasks();const min=ts.reduce((m,t)=>Math.min(m,v3pos(t)),1e9);ts.forEach((t,k)=>{const p=t.id===id?0:k+1;if(t.pos!==p)patchTask(t.id,{pos:p});});}
  function v3reorder(ids){ids.forEach((id,k)=>{const t=state.tasks[id];if(t&&t.pos!==k)patchTask(id,{pos:k});});}
  function v3start(id){if(warGet()){const w=warGet();if(!w.ids.includes(id)){w.ids.unshift(id);warPut(w);}else{w.ids=[id].concat(w.ids.filter(x=>x!==id));warPut(w);}warOpen();toast("Added to the war on "+w.label);return;}warSetup({task:id});}
  function v3card(t,top,ctx){const showD=cutDesc===t.id;
    const c=el("div",{class:"cs-card cs-top"+(top?"":" cs-flat"),role:"group","aria-label":t.title,"data-id":t.id},
      el("span",{class:"cs-hint cs-hr","aria-hidden":"true",text:"Done"}),el("span",{class:"cs-hint cs-hl","aria-hidden":"true",text:"Tomorrow"}),
      el("div",{class:"cs-head"},el("h3",{class:"cs-t",text:t.title}),t.cat?el("span",{class:"cat-chip","data-cat":t.cat,text:CAT_NAME[t.cat]||t.cat}):null,
        el("button",{type:"button",class:"cl-det","aria-expanded":String(showD),onclick:()=>{cutDesc=showD?null:t.id;ctx==="view"?renderTaskView():renderCutList();}},showD?"Less":"Details")),
      showD&&t.desc?el("p",{class:"cl-d",text:String(t.desc)}):null,
      (top||showD)?el("div",{class:"cl-acts"},el("button",{type:"button",class:"btn cl-go",onclick:()=>{if(ctx==="view")closeTaskView();v3start(t.id);}},"Start"),
        el("button",{type:"button",class:"btn ghost",onclick:()=>v3confirm("Mark as done: "+t.title+"?","Done",()=>setDone(t.id,true))},"Done")):null);
    swipeable(c,()=>{setDone(t.id,true);setTimeout(renderTaskView,350);},()=>{cutDesc=null;card_rs(t);setTimeout(renderTaskView,350);},
      ()=>{if(ctx==="view"){v3front(t.id);closeTaskView();toast("Now: "+t.title);}else openTaskView();});
    return c;}
  renderCutList=function(){const box=document.getElementById("taskList");if(!box)return;
    box.querySelectorAll(":scope>.rail,:scope>.rail-tip,:scope>.empty,:scope>#cutList").forEach(x=>x.hidden=true);
    let ul=document.getElementById("cutStack");if(!ul){ul=el("div",{id:"cutStack",class:"cut-stack"});}if(ul.parentElement!==box)box.append(ul);
    const all=sortedTasks(),ts=all.filter(t=>!t.done),done=all.length-ts.length;
    const earlier=sel>=iso(new Date())?Object.entries(state.tasks).map(([id,t])=>({id,...t})).filter(t=>isLeaf(t)&&t.date&&t.date<sel&&!t.done&&!t.cut).sort((a,b)=>a.date<b.date?-1:1):[];
    let eb=document.getElementById("cutEarlier");if(!eb){eb=el("div",{id:"cutEarlier",class:"cut-earlier"});}if(eb.parentElement!==box||eb.previousElementSibling!==ul)ul.after(eb);
    const earlierSheet=()=>psOpen("Earlier",re=>{const L=Object.entries(state.tasks).map(([id,t])=>({id,...t})).filter(t=>isLeaf(t)&&t.date&&t.date<sel&&!t.done&&!t.cut).sort((a,b)=>a.date<b.date?-1:1);
      return L.length?[el("ul",{class:"cut-list ce-list"},...L.map(t=>{const cb=el("input",{type:"checkbox","aria-label":"Done: "+t.title});cb.onchange=()=>{setDone(t.id,cb.checked);setTimeout(re,300);};
        return el("li",{class:"cl"},el("div",{class:"cl-row"},cb,el("span",{class:"cl-t",text:t.title}),t.cat?el("span",{class:"cat-chip","data-cat":t.cat,text:CAT_NAME[t.cat]||t.cat}):null,el("button",{type:"button",class:"btn ghost ce-go",onclick:()=>{moveTaskTo(t.id,sel);setTimeout(re,300);}},"Today")));}))]:[el("p",{class:"ps-sh-sum",text:"All clear."})];});
    if(!earlier.length)rc(eb);else rc(eb,el("button",{type:"button",class:"ce-head",onclick:earlierSheet},el("span",{text:"Earlier"}),el("span",{class:"ce-n",text:String(earlier.length)})));
    if(!ts.length){rc(ul,el("div",{class:"cs-empty"},el("b",{text:all.length?"All done.":"No tasks."}),all.length?el("button",{type:"button",class:"cl-det",onclick:allTasksSheet},"See all"):null));return;}
    cutCard=(t,top)=>v3card(t,top,"view");renderTaskView();
    const label=(ts.length>1?(ts.length-1)+" more":"")+(done?(ts.length>1?" · ":"")+done+" done":"");
    const behind=ts.slice(1,3).map((x,k)=>el("div",{class:"cs-card cs-b"+(k+1),"aria-hidden":"true"}));
    rc(ul,el("div",{class:"cs-pile"},...behind.reverse(),v3card(ts[0],true,"stack")),label?el("button",{type:"button",class:"cs-more",onclick:openTaskView},label+" · reorder"):null);};
  renderTaskView=function(){const v=document.getElementById("taskView");if(!v)return;const ts=sortedTasks().filter(t=>!t.done),sc=v.querySelector(".tv-scroll"),y=sc?sc.scrollTop:0;
    const list=el("div",{class:"cs-all"},...ts.map((t,k)=>v3card(t,k===0,"view")));
    const s=el("div",{class:"tv-scroll"},el("div",{class:"tv-head"},el("h2",{text:"Today"}),el("button",{type:"button",class:"tv-x v3-x","aria-label":"Close",onclick:closeTaskView},"×")),
      ts.length>1?el("p",{class:"hint tv-tip",text:"Tap a card to make it the one you do now. Press and hold, then drag to reorder."}):null,
      ts.length?list:el("p",{class:"tv-empty",text:"All done."}));
    rc(v,s);s.scrollTop=y;v3dragList(list,".cs-card",ids=>v3reorder(ids));};
  // press and hold, then drag: a generic reorder for any list of [data-id] rows
  function v3dragList(list,rowSel,onDrop){[...list.querySelectorAll(rowSel)].forEach(row=>{if(row.dataset.v3d)return;row.dataset.v3d="1";let t=null,y0=0,x0=0,on=false,before=null,pid=null;
    row.addEventListener("pointerdown",e=>{if(e.button>0)return;const blk=e.target.closest("button,input,select,a,textarea");if(blk&&!blk.hasAttribute("data-dragok"))return;y0=e.clientY;x0=e.clientX;pid=e.pointerId;
      t=setTimeout(()=>{on=true;v3holdOn();row.classList.add("v3-lift");try{row.setPointerCapture(pid);}catch(_){}try{navigator.vibrate&&navigator.vibrate(10);}catch(_){}},400);});
    row.addEventListener("pointermove",e=>{if(!on){if(Math.hypot(e.clientX-x0,e.clientY-y0)>8){clearTimeout(t);t=null;}return;}e.preventDefault();e.stopPropagation();row.style.transform="translateY("+(e.clientY-y0)+"px)";
      const sib=[...list.querySelectorAll(rowSel)].filter(x=>x!==row);before=null;for(const s of sib){const r=s.getBoundingClientRect();if(e.clientY<r.top+r.height/2){before=s;break;}}
      sib.forEach(s=>s.classList.toggle("v3-before",s===before));});
    const up=e=>{clearTimeout(t);t=null;if(!on)return;on=false;e&&e.stopPropagation&&e.stopPropagation();row.classList.remove("v3-lift");row.style.transform="";
      const rows=[...list.querySelectorAll(rowSel)].filter(x=>x!==row);rows.forEach(s=>s.classList.remove("v3-before"));const i=before?rows.indexOf(before):rows.length;rows.splice(i,0,row);
      row.dataset.dragged=String(Date.now());v3holdOff();onDrop(rows.map(x=>x.dataset.id).filter(Boolean));};
    row.addEventListener("pointerup",up,true);row.addEventListener("pointercancel",up,true);
    row.addEventListener("click",e=>{if(row.dataset.dragged&&Date.now()-row.dataset.dragged<400){e.stopPropagation();e.preventDefault();}},true);});}
  {const _ov=openTaskView;openTaskView=function(){_ov();setTimeout(renderTaskView,0);};}
  try{renderCutList();}catch(e){}

  // ---------- 5. notifications take you to the source ----------
  {const _nl=notifList;notifList=function(){return _nl().map(n=>{if(/^dl:/.test(n.id))return {...n,go:"dl"};if(/^spend:/.test(n.id))return {...n,go:"sprint"};if(/^pay:/.test(n.id))return {...n,go:"pay"};return n;});};}
  notifSheet=function(){psOpen("Notifications",re=>{const list=notifList();notifMark(list.map(x=>x.id));setTimeout(notifBadge,0);
    return list.length?[el("ul",{class:"ps-sh-list nf-list"},...list.map(n=>el("li",{class:"nf lvl"+n.lvl},el("button",{type:"button",class:"ps-sh-row",onclick:()=>{psClose(true);v3goNotif(n);}},
      el("span",{class:"sr-m"},el("b",{text:n.t}),n.sub?el("span",{class:"hint",text:n.sub}):null),el("span",{class:"nf-go",text:"Open"})))))]
      :[el("p",{class:"ps-sh-sum",text:"All clear."})];});};
  function v3goNotif(n){if(n.go==="dl")return deadlineSheet();if(n.go==="sprint"){setPage("progress");setTimeout(()=>{try{v3sprintSheet&&v3sprintSheet();}catch(e){}},200);return;}
    if(n.go==="pay"){setPage("finance");setTimeout(()=>{const c=[...document.querySelectorAll(".pop-card,.fin-card,button")].find(b=>/^Upcoming/.test((b.textContent||"").trim()));if(c)c.click();},250);return;}
    setPage(n.go);}
  function deadlineSheet(){const tm=tmOf(iso(new Date()));psOpen("Due tomorrow",re=>{const L=Object.entries(state.tasks).map(([id,t])=>({id,...t})).filter(t=>isLeaf(t)&&t.date===tm&&!t.done&&!t.cut);
    return L.length?[el("ul",{class:"cut-list"},...L.map(t=>el("li",{class:"cl"},el("div",{class:"cl-row"},el("span",{class:"cl-t",text:t.title}),t.cat?el("span",{class:"cat-chip","data-cat":t.cat,text:CAT_NAME[t.cat]||t.cat}):null,
      el("button",{type:"button",class:"btn ce-go",onclick:()=>{psClose(true);v3start(t.id);}},"Start"),el("button",{type:"button",class:"btn ghost ce-go",onclick:()=>{moveTaskTo(t.id,iso(new Date()));setTimeout(re,300);}},"Today")))))]:[el("p",{class:"ps-sh-sum",text:"Nothing due tomorrow."})];});}

  // ---------- 8. WAR mode takes over the focus timer ----------
  // rounds of 50 min focus and 10 min break for 2h, 3h, 4h or a typed length; break time counts up to 10 min, then the war pauses
  // a war paused for 2 hours ends by itself. Only work time is logged; extra break shows as a gap in Time
  const W_FOCUS=50,W_BREAK=10,W_IDLE=120;
  function wRounds(w){const tot=w.dur||0;if(tot&&tot<60)return {f:tot,b:0};return {f:W_FOCUS,b:W_BREAK};}
  function wPhaseLeft(w){const R=wRounds(w);if(w.phase==="break")return Math.max(0,R.b*60000-(Date.now()-w.breakAt));return Math.max(0,R.f*60000-(warActive(w)-(w.phase0||0)));}
  function wTick(){const dd=warDoc();if(dd&&dd.active&&dd.w&&warDead().includes(dd.w.start)){warPut(null);return;}// heal a war that was ended elsewhere but written back
    const w=warGet();if(!w)return;const now=Date.now(),R=wRounds(w);let ch=false;
    if(w.pausedAt){if(now-w.pausedAt>=W_IDLE*60000){warEnd(true);}return;}
    if(w.phase==="break"){if(now-w.breakAt>=R.b*60000){const at=w.breakAt+R.b*60000;w.segs=(w.segs||[]).concat([{start:w.segStart||w.start,end:at}]);w.pausedAt=at;w.phase="focus";w.auto=true;ch=true;try{pNotify("Break is over. The war is paused until you resume.","focus");}catch(e){}}}
    else if(R.b&&warActive(w)-(w.phase0||0)>=R.f*60000){w.phase="break";w.breakAt=Math.min(now,now-(warActive(w)-(w.phase0||0)-R.f*60000));ch=true;try{pNotify(R.f+" minutes done. Take a "+R.b+" minute break.","break");}catch(e){}}
    if(ch){warPut(w);warSave(w);warRender();v3wFab();}}
  setInterval(()=>{try{wTick();}catch(e){console.warn(e);}},1000);
  setTimeout(()=>{try{wTick();}catch(e){}},3500);
  warPause=function(){const w=warGet();if(!w)return;const now=Date.now();
    if(w.pausedAt){w.pausedMs=(w.pausedMs||0)+(now-w.pausedAt);w.pausedAt=null;w.segStart=now;w.phase="focus";w.phase0=warActive(w);w.auto=false;}
    else{w.segs=(w.segs||[]).concat([{start:w.segStart||w.start,end:now}]);w.pausedAt=now;}
    warPut(w);warSave(w);warRender();renderPopCards();v3wFab();};
  function warBreak(){const w=warGet();if(!w||w.pausedAt)return;if(w.phase==="break"){w.phase="focus";w.phase0=warActive(w);}else{w.phase="break";w.breakAt=Date.now();}warPut(w);warSave(w);warRender();}
  // target pool: a task (it first, then the rest of its category), a category, or a word
  {const _wp=warPool;warPool=function(tg){if(tg&&tg.k==="task"){const t=state.tasks[tg.v];if(!t)return [];const rest=t.cat?_wp({k:"cat",v:t.cat}).filter(x=>x.id!==tg.v):[];return [{id:tg.v,...t}].concat(rest);}return _wp(tg);};}
  warSetup=function(pre){let pick=null,mins=180,custom="",addMode=false;
    if(pre&&pre.task&&state.tasks[pre.task]){const t=state.tasks[pre.task];pick={k:"task",v:pre.task,label:t.title};}
    psOpen("War",re=>{const T=warTargets();
      const chip=(on,txt,fn,sub)=>el("button",{type:"button",class:"wr-chip"+(on?" on":""),"aria-pressed":String(on),onclick:fn},el("b",{text:txt}),sub!=null?el("span",{text:sub}):null);
      const len=el("input",{type:"text",class:"v3-in wr-len",inputmode:"numeric",placeholder:"Type minutes, like 90 or 1:30","aria-label":"Length in minutes",value:custom});
      len.oninput=()=>{custom=len.value;const m=v3mins(custom);if(m){mins=m;}const g=document.querySelector(".ps-sheet .wr-go");if(g)g.textContent=goTxt();document.querySelectorAll(".ps-sheet .wr-row .wr-chip").forEach(c=>c.classList.toggle("on",false));};
      const goTxt=()=>pick?"Start war on "+pick.label+(mins?" · "+dur(mins):" · open"):"Pick a target";
      return [
        pick&&pick.k==="task"?el("div",{class:"wr-task"},el("span",{class:"label",text:"Task"}),el("b",{text:pick.label}),el("button",{type:"button",class:"cl-det",onclick:()=>{pick=null;re();}},"Change")):null,
        pick&&pick.k==="task"?null:el("p",{class:"wr-q",text:"War on what?"}),
        pick&&pick.k==="task"?null:el("div",{class:"wr-grid"},...T.map(t=>chip(pick&&pick.k===t.k&&pick.v===t.v,t.label,()=>{pick=t;re();},t.sub||t.n+" open")),
          addMode?null:chip(false,"+ Custom",()=>{addMode=true;re();setTimeout(()=>{const i=document.getElementById("wrIn");if(i)i.focus();},50);})),
        addMode?el("form",{class:"wr-add",onsubmit:e=>{e.preventDefault();const v=(document.getElementById("wrIn").value||"").trim();if(!v)return;const c=warCustom().slice();if(!c.includes(v)){c.push(v);const d=warDoc()||{active:false,w:null};const body={...d,custom:c,at:Date.now()};state.timers={...(state.timers||{}),war:body};try{store.set("timers/war",body);}catch(e){}}pick={k:"word",v,label:v};addMode=false;re();}},
          el("input",{id:"wrIn",placeholder:"A word your tasks share, like HASM","aria-label":"Custom target"}),el("button",{type:"submit",class:"btn"},"Add")):null,
        el("p",{class:"wr-q",text:"Block length"}),
        el("div",{class:"wr-row"},...[[120,"2h"],[180,"3h"],[240,"4h"],[0,"Open"]].map(([m,l])=>chip(!v3mins(custom)&&mins===m,l,()=>{mins=m;custom="";re();}))),
        len,
        el("p",{class:"hint",text:"Rounds of 50 min focus and 10 min break. Breaks over 10 min pause the war and are not logged. 2 hours paused ends it."}),
        (b=>{b.disabled=!pick||!warPool(pick).length;return b;})(el("button",{type:"button",class:"btn wr-go",onclick:()=>{const ids=warPool(pick).map(t=>t.id);if(!ids.length)return;
          try{const r=pRun();if(r){setPomo({...P(),phase:null,startedAt:null,pausedAt:null,overAt:null});}}catch(e){}
          warPut({k:pick.k,v:pick.v,label:pick.label,ids,done:[],start:Date.now(),dur:mins,phase:"focus",phase0:0});psClose(true);warOpen();renderPopCards();}},goTxt()))];});};
  function v3mins(s){s=String(s||"").trim();if(!s)return 0;let m=s.match(/^(\d{1,2}):(\d{2})$/);if(m)return +m[1]*60+ +m[2];m=s.match(/^(\d+(?:\.\d+)?)\s*h(?:ours?|rs?)?$/i);if(m)return Math.round(+m[1]*60);m=s.match(/^(\d{1,3})\s*m?(?:in(?:utes?)?)?$/i);if(m&&+m[1]>0&&+m[1]<=600)return +m[1];return 0;}
  // full screen keeps the tablet awake; Minimize turns it into a small floating clock
  warOpen=function(){if(document.getElementById("warView")){warRender();return;}const v=el("div",{id:"warView",class:"task-view war-view",role:"dialog","aria-modal":"true","aria-label":"War"});
    document.body.append(v);document.body.classList.add("tv-open");warRender();requestAnimationFrame(()=>v.classList.add("in"));v3wFab();
    try{pWake(true);}catch(e){}try{if(document.documentElement.requestFullscreen&&!document.fullscreenElement)document.documentElement.requestFullscreen({navigationUI:"hide"}).catch(()=>{});}catch(e){}
    clearInterval(warTick);warTick=setInterval(()=>{const w=warGet(),c=document.getElementById("wrClock");if(!w||!c)return;c.textContent=hms(wPhaseLeft(w)/1000);const t=document.getElementById("wrTot");if(t)t.textContent=v3totTxt(w);},1000);};
  warClose=function(){clearInterval(warTick);warSave();const v=document.getElementById("warView");try{pWake(false);}catch(e){}try{if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});}catch(e){}
    if(v){v.classList.remove("in");document.body.classList.remove("tv-open");setTimeout(()=>{v.remove();renderPopCards();v3wFab();},200);}else v3wFab();};
  warEnd=function(auto){const w=warGet();if(!w)return warClose();if(auto===true&&w.pausedAt){/* ends at the moment it paused: idle time is never logged */}
    warSave(w,true);const mins=Math.floor(warActive(w)/60000);toast((auto===true?"War ended after 2 hours paused. ":"")+"War on "+w.label+": "+w.done.length+" of "+w.ids.length+" done, "+dur(mins)+" logged");warPut(null);warClose();};
  function v3totTxt(w){const s=warLeft(w),act=warActive(w)/60000;return (w.dur?(s>=0?dur(Math.ceil(s/60))+" left of "+dur(w.dur):dur(Math.floor(-s/60))+" over "+dur(w.dur)):dur(Math.floor(act))+" in")+" · "+w.done.length+" of "+w.ids.length+" done";}
  warRender=function(){const v=document.getElementById("warView"),w=warGet();if(!v||!w)return;
    const left=w.ids.filter(id=>!w.done.includes(id)&&state.tasks[id]&&!state.tasks[id].done);
    const top=left[0]&&state.tasks[left[0]]?{id:left[0],...state.tasks[left[0]]}:null;if(top){try{openTask=top.id;}catch(e){}}
    const R=wRounds(w),ph=w.pausedAt?(w.auto?"Break over. Resume when ready":"Paused"):w.phase==="break"?"Break":"Focus";
    let card=null;
    if(top){const showD=warDesc===top.id;card=el("div",{class:"cs-card cs-top wr-card",role:"group","aria-label":top.title,"data-id":top.id},
        el("span",{class:"cs-hint cs-hr","aria-hidden":"true",text:"Done"}),el("span",{class:"cs-hint cs-hl","aria-hidden":"true",text:"Later"}),
        el("div",{class:"cs-head"},el("h3",{class:"cs-t",text:top.title}),top.cat?el("span",{class:"cat-chip","data-cat":top.cat,text:CAT_NAME[top.cat]||top.cat}):null,el("button",{type:"button",class:"cl-det",onclick:()=>{warDesc=showD?null:top.id;warRender();}},showD?"Less":"Details")),
        showD&&top.desc?el("p",{class:"cl-d",text:String(top.desc)}):null,
        el("div",{class:"cl-acts"},el("button",{type:"button",class:"btn cl-go",onclick:()=>v3confirm("Mark as done: "+top.title+"?","Done",()=>warDone(top.id))},"Done")));
      swipeable(card,()=>warDone(top.id),()=>{const w2=warGet();w2.ids=w2.ids.filter(x=>x!==top.id).concat(top.id);warPut(w2);warDesc=null;warRender();},()=>{warDesc=warDesc===top.id?null:top.id;warRender();},{l:"Do later",lb:"Later"});}
    const next=left.slice(1);
    const nextList=next.length?el("div",{class:"wr-next"},el("span",{class:"label",text:"Up next · tap to do now, hold to reorder"}),
      (ul=>{v3dragList(ul,".wr-nrow",ids=>{const w2=warGet();const doneIds=w2.ids.filter(x=>!ids.includes(x)&&x!==top.id);w2.ids=[top.id].concat(ids,doneIds.filter(x=>x!==top.id));warPut(w2);warRender();});return ul;})(
        el("ul",{class:"wr-nl"},...next.map(id=>{const t=state.tasks[id];return el("li",{class:"wr-nrow","data-id":id,tabindex:"0",role:"button",onclick:()=>{const w2=warGet();w2.ids=[id].concat(w2.ids.filter(x=>x!==id));warPut(w2);warDesc=null;warRender();},onkeydown:e=>{if(e.key==="Enter")e.currentTarget.click();}},
          el("span",{class:"wr-nt",text:t.title}),t.cat?el("span",{class:"cat-chip","data-cat":t.cat,text:CAT_NAME[t.cat]||t.cat}):null);})))):null;
    rc(v,el("div",{class:"tv-scroll wr-scroll"},
      el("div",{class:"tv-head"},el("span",{class:"wr-tag",text:"War on "+w.label}),el("div",{class:"wr-hb"},el("button",{type:"button",class:"tv-x",onclick:warClose},"Minimize"),el("button",{type:"button",class:"tv-x v3-x","aria-label":"Close",onclick:warClose},"×"))),
      el("div",{class:"wr-clock-box"},el("div",{class:"wr-ph"+(w.phase==="break"&&!w.pausedAt?" brk":""),text:ph+(R.b&&!w.pausedAt?" · "+(w.phase==="break"?R.b:R.f)+" min":"")}),
        el("div",{id:"wrClock",class:"wr-clock num",text:hms(wPhaseLeft(w)/1000)}),
        el("div",{id:"wrTot",class:"wr-sub",text:v3totTxt(w)}),
        el("div",{class:"wr-btns"},el("button",{type:"button",class:"wr-pause",onclick:warPause},w.pausedAt?"Resume":"Pause"),
          R.b&&!w.pausedAt?el("button",{type:"button",class:"wr-pause",onclick:warBreak},w.phase==="break"?"Back to focus":"Break now"):null),
        el("div",{class:"wr-bar"},el("span",{style:"width:"+Math.round(w.done.length/Math.max(1,w.ids.length)*100)+"%"}))),
      top?el("div",{class:"cs-pile"},...left.slice(1,3).map((x,k)=>el("div",{class:"cs-card cs-b"+(k+1),"aria-hidden":"true"})).reverse(),card):el("div",{class:"cs-empty"},el("b",{text:"All cleared. War won."})),
      nextList,
      el("button",{type:"button",class:"btn ghost wr-end",onclick:()=>v3confirm("End the war on "+w.label+"?","End war",()=>warEnd())},"End war")));v.classList.toggle("paused",!!w.pausedAt);};
  // floating clock: only while a war runs; replaces the old Focus button
  function v3wFab(){let b=document.getElementById("warFab");const w=warGet(),open=!!document.getElementById("warView");
    if(!w||open){if(b)b.hidden=true;return;}
    if(!b){b=el("button",{type:"button",id:"warFab",class:"war-fab","aria-label":"Open War"});b.onclick=()=>warOpen();document.body.append(b);}
    b.hidden=false;b.classList.toggle("paused",!!w.pausedAt);b.classList.toggle("brk",w.phase==="break"&&!w.pausedAt);
    const t=hms(wPhaseLeft(w)/1000);if(b.textContent!==t)b.textContent=t;}
  setInterval(()=>{try{v3wFab();}catch(e){}},1000);
  // the old focus timer: every way in now leads to War
  {const pf=document.getElementById("pomoFab");if(pf){pf.onclick=e=>{e.preventDefault();let id=null;try{id=openTask;}catch(_){}if(id&&String(id).startsWith("c:"))id=String(id).slice(2);v3start&&id&&state.tasks[id]?v3start(id):(warGet()?warOpen():warSetup());};pf.hidden=true;}}
  {const _r=render;render=function(){_r();try{const pf=document.getElementById("pomoFab");if(pf)pf.hidden=true;const pp=document.getElementById("pomoPanel");if(pp)pp.hidden=true;document.querySelectorAll('.m-ib[aria-label="Focus timer"]').forEach(b=>b.remove());v3wFab();}catch(e){}};}
  {const _mo=renderMission;renderMission=function(){try{_mo();}catch(e){}};}
  try{render();}catch(e){}

  // =====================================================================
  // 12 Nov, part B: Intentional media + queue, Capture review, Habits
  // =====================================================================
  // ---------- 7. YouTube Music playlist links (browse/VL...) are read as playlists ----------
  {const _yp=ytParse;ytParse=function(u){try{const x=new URL(String(u).trim());const m=x.pathname.match(/^\/browse\/VL([\w-]{10,})/);if(m)return {v:null,list:m[1]};}catch(e){}return _yp(u);};}
  // ---------- 6/7. queue is separate from the bank: only items you pick, in your order ----------
  const v3done=x=>x.kind==="group"?lsGroupDone(x):!!x.done;
  function v3q(){return lsItems().filter(x=>x.q!=null&&!v3done(x)).sort((a,b)=>a.q-b.q);}
  function v3qAdd(id){lsUpd(id,{q:Date.now()});toast("Added to queue");}
  function v3qDel(id){lsUpd(id,{q:null});}
  function v3playItem(x){if(x.kind==="group"){const nx=lsGroupNext(x);ytPlay(nx||{id:x.id,title:x.title,url:x.url});}else ytPlay({id:x.id,title:x.title,url:x.url});}
  function v3last(m){const p={...((state.settings&&state.settings.prefs)||{}),lastMedia:m,at:Date.now()};state.settings={...(state.settings||{}),prefs:p};try{store.set("settings/prefs",p);}catch(e){}}
  {const _yl=ytLoad;ytLoad=function(item,start){_yl(item,start);try{v3last({id:item.id||null,title:item.title||"",url:item.url||"",at:Date.now()});}catch(e){}};}
  qFab=function(){let b=document.getElementById("qFab");const pr=(state.settings&&state.settings.prefs)||{};const any=!!(ytNow||locNow||nz||pr.lastMedia);
    if(!b){b=el("button",{type:"button",id:"qFab",class:"q-fab","aria-label":"Queue and now playing"},xico("music"),el("span",{class:"q-n"}));b.onclick=()=>queueSheet();document.body.append(b);}
    b.onclick=()=>queueSheet();b.hidden=!any;const n=v3q().length;b.querySelector(".q-n").textContent=n?String(n):"";b.classList.toggle("on",!!(ytNow&&!ytPaused));};
  let v3qSel=new Set();
  function v3nowCard(){const pr=(state.settings&&state.settings.prefs)||{};
    if(ytNow){return el("div",{class:"q-now"},el("div",{class:"q-nt"},el("span",{class:"label",text:ytPaused?"Paused":"Playing"}),el("b",{text:ytNow.title||"YouTube"})),
      el("div",{class:"q-nb"},el("button",{type:"button",class:"btn",onclick:()=>{ytToggle();setTimeout(sheetRefresh,200);}},ytPaused?"Play":"Pause"),
        ytNow.id&&state.listen[ytNow.id]?el("button",{type:"button",class:"btn ghost",onclick:()=>{prSet(ytNow.key,{f:1},true);if(ytNow.gid!=null&&ytNow.idx!=null){const g=ytNow.gid,i=ytNow.idx;lsMarkItem(g,i,true);const nx=lsGroupNext({...state.listen[g],id:g});if(nx)ytPlay(nx);else ytClose();}else{lsUpd(ytNow.id,{done:true,doneAt:iso(new Date())});ytClose();}toast("Marked as listened");setTimeout(sheetRefresh,300);}},"Listened"):null,
        el("button",{type:"button",class:"btn ghost",onclick:()=>{ytClose();setTimeout(sheetRefresh,200);}},"Stop")));}
    if(locNow){const pl=locEl&&!locEl.paused;return el("div",{class:"q-now"},el("div",{class:"q-nt"},el("span",{class:"label",text:pl?"Playing":"Paused"}),el("b",{text:locNow.name})),
      el("div",{class:"q-nb"},el("button",{type:"button",class:"btn",onclick:()=>{pl?locEl.pause():locEl.play();setTimeout(sheetRefresh,200);}},pl?"Pause":"Play"),el("button",{type:"button",class:"btn ghost",onclick:()=>{locStop();setTimeout(sheetRefresh,200);}},"Stop")));}
    if(nz)return el("div",{class:"q-now"},el("div",{class:"q-nt"},el("span",{class:"label",text:"Playing"}),el("b",{text:nzName||"Noise"})),el("div",{class:"q-nb"},el("button",{type:"button",class:"btn ghost",onclick:()=>{nzStop();setTimeout(sheetRefresh,200);}},"Stop")));
    if(pr.lastMedia&&pr.lastMedia.url)return el("div",{class:"q-now"},el("div",{class:"q-nt"},el("span",{class:"label",text:"Last played"}),el("b",{text:pr.lastMedia.title||"YouTube"})),
      el("div",{class:"q-nb"},el("button",{type:"button",class:"btn",onclick:()=>{ytPlay({id:pr.lastMedia.id,title:pr.lastMedia.title,url:pr.lastMedia.url});setTimeout(sheetRefresh,300);}},"Play")));
    return null;}
  function queueSheet(){v3qSel=new Set();psOpen("Queue",re=>{const q=v3q(),n=v3qSel.size;
    const list=el("ul",{class:"q-list"},...q.map(x=>{const cb=el("input",{type:"checkbox","aria-label":"Select "+x.title});cb.checked=v3qSel.has(x.id);cb.onchange=()=>{cb.checked?v3qSel.add(x.id):v3qSel.delete(x.id);re();};
      return el("li",{class:"q-row","data-id":x.id},cb,el("button",{type:"button",class:"q-t","data-dragok":"1",onclick:()=>v3playItem(x)},el("span",{text:x.title||"Untitled"}),x.kind==="group"?el("span",{class:"hint",text:((x.items||[]).filter(i=>!i.done).length)+" left"}):null),
        el("button",{type:"button",class:"x","aria-label":"Remove "+x.title+" from the queue",onclick:()=>{v3qDel(x.id);setTimeout(re,250);}},"×"));}));
    v3dragList(list,".q-row",ids=>{const base=Date.now();ids.forEach((id,k)=>{const c=state.listen[id];if(c&&c.q!==base+k)lsUpd(id,{q:base+k});});setTimeout(re,300);});
    return [v3nowCard(),q.length?el("p",{class:"hint",text:"Press and hold a row, then drag to reorder. Tap to play."}):null,
      n?el("div",{class:"v3-row"},el("button",{type:"button",class:"btn ghost danger",onclick:()=>{[...v3qSel].forEach(id=>v3qDel(id));v3qSel=new Set();setTimeout(re,300);}},"Remove selected ("+n+")"),el("button",{type:"button",class:"btn ghost",onclick:()=>{v3qSel=new Set();re();}},"Clear")):null,
      q.length?list:el("p",{class:"ps-sh-sum",text:"The queue is empty."}),
      el("button",{type:"button",class:"btn ghost",onclick:()=>{psClose(true);sndOpen="queue";openSnd("queue");}},"Choose from To listen")];});}
  {const _rs=renderSounds2;renderSounds2=function(){_rs();try{if(document.querySelector('.ps-sheet[aria-label="Queue"]'))sheetRefresh();document.querySelectorAll(".snd-card").forEach(c=>{if((c.querySelector(".fc-t")||{}).textContent==="Queue"){const s=c.querySelector(".snd-sub");if(s)s.textContent=v3q().length+" picked";}});}catch(e){}};}
  // the bank ("To listen"): every row gets Add to queue; no type grouping
  queueDrag=function(sec){const list=sec.querySelector(".ls-list");if(!list)return;const ids=lsItems().filter(x=>!v3done(x)).map(x=>x.id);
    [...list.children].forEach((li,i)=>{const id=ids[i];if(!id||li.querySelector(".v3-addq"))return;const x=state.listen[id];if(!x)return;const inQ=x.q!=null;
      (li.querySelector("summary")||li).append(el("button",{type:"button",class:"mini v3-addq",onclick:e=>{e.preventDefault();e.stopPropagation();inQ?v3qDel(id):v3qAdd(id);setTimeout(()=>{if(sndOpen)renderSounds2();},250);}},inQ?"In queue":"Add to queue"));});};
  {const _os=openSnd;openSnd=function(k){if(k==="q2")return queueSheet();_os(k);};}
  if(!SND.some(x=>x[0]==="q2"))SND.splice(1,0,["q2","Queue","play"]);

  // ---------- 9. Capture: stored notes can be reviewed and browsed, and you can come back ----------
  let v3cMode="due",v3cF="all",v3cQ="",v3cOpen=null;
  function captureReview(back){psOpen("Review notes",re=>{const today=iso(new Date()),after=()=>setTimeout(re,420);
    const head=el("div",{class:"v3-row"},el("div",{class:"seg",role:"group"},...[["due","To review ("+brDue().length+")"],["all","All notes ("+brNotes().length+")"]].map(([k,n])=>el("button",{type:"button","aria-pressed":String(v3cMode===k),onclick:()=>{v3cMode=k;v3cOpen=null;re();}},n))),
      el("button",{type:"button",class:"btn ghost",onclick:()=>openPop("cap")},"Back to Capture"));
    const actsFor=x=>x.type==="decision"?[["Good: archive",()=>brUpd(x.id,{status:"done",doneAt:today})],["Check in a month",()=>brKeep(x,30)],["Make a task",()=>brToTask(x,"today")]]
      :x.type==="learning"?[["I remember it",()=>brKeep(x)],["Make a task",()=>brToTask(x,"tomorrow")],["Archive",()=>brUpd(x.id,{status:"done",doneAt:today})]]
      :[["Task for tomorrow",()=>brToTask(x,"tomorrow")],["Keep a week",()=>brKeep(x,7)],["Someday",()=>brKeep(x,90)],["Let it go",()=>brUpd(x.id,{status:"done",doneAt:today,as:"dropped"})]];
    const card=(x,backTo)=>el("section",{class:"v3-ncard"},...brCardView(x),el("p",{class:"hint",text:BR_HINT[x.type]||""}),
      el("div",{class:"v3-row"},...actsFor(x).map(([l,f],i)=>el("button",{type:"button",class:i===0?"btn":"btn ghost",onclick:()=>{f();if(backTo)v3cOpen=null;after();}},l))),
      backTo?el("button",{type:"button",class:"cl-det",onclick:()=>{v3cOpen=null;re();}},"Back to list"):null);
    if(v3cMode==="due"){const due=brDue();return [head,due.length?el("p",{class:"hint",text:due.length+" left to review"}):null,due.length?card(due[0],false):el("p",{class:"ps-sh-sum",text:"Nothing due. Browse all notes any time."})];}
    if(v3cOpen&&state.notes[v3cOpen])return [head,card({id:v3cOpen,...state.notes[v3cOpen]},true)];
    const q=v3cQ.toLowerCase(),L=brNotes().filter(x=>(v3cF==="all"||x.type===v3cF)&&(!q||String(x.text||"").toLowerCase().includes(q))).sort((a,b)=>(b.created||0)-(a.created||0));
    const search=el("input",{type:"search",class:"v3-in",placeholder:"Search notes","aria-label":"Search notes",value:v3cQ});search.oninput=()=>{v3cQ=search.value;const p=search.selectionStart;re();setTimeout(()=>{const s=document.querySelector(".ps-sheet input[type=search]");if(s){s.focus();try{s.setSelectionRange(p,p);}catch(e){}}},0);};
    return [head,search,el("div",{class:"v3-cats"},...[["all","All"],...BR_T.map(t=>[t[0],t[1]])].map(([k,n])=>el("button",{type:"button",class:"cat-chip"+(v3cF===k?" on":""),"aria-pressed":String(v3cF===k),onclick:()=>{v3cF=k;re();}},n))),
      L.length?el("ul",{class:"v3-tlist"},...L.map(x=>el("li",{},el("button",{type:"button",class:"v3-trow",onclick:()=>{v3cOpen=x.id;re();}},el("span",{text:String(x.text||"").slice(0,90)}),el("span",{class:"hint",text:x.status==="done"?"done":x.status==="keep"&&x.review?"review "+fmt(x.review,{day:"numeric",month:"short"}):"new"}))))):el("p",{class:"ps-sh-sum",text:"No notes here."})];},back===false?{onClose:()=>{}}:undefined);}
  document.addEventListener("click",e=>{const b=e.target.closest(".cap-due,.br-due");if(!b)return;e.stopImmediatePropagation();e.preventDefault();v3cMode="due";v3cOpen=null;captureReview();},true);
  {const _rc=renderCapture;renderCapture=function(){_rc();try{const box=document.getElementById("capBody");if(box&&!box.querySelector(".v3-notes")){box.append(el("button",{type:"button",class:"btn ghost v3-notes",onclick:()=>{v3cMode="all";v3cOpen=null;captureReview();}},"Stored notes ("+brNotes().length+")"));}}catch(e){}};}

  // ---------- 10. Habits ----------
  const v3MN=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  function v3pDate(s){s=String(s||"").trim().toLowerCase();if(!s)return null;let y,mo,d,m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if(m){y=+m[1];mo=+m[2];d=+m[3];}else if((m=s.match(/^(\d{1,2})[\/\-. ](\d{1,2})(?:[\/\-. ](\d{2,4}))?$/))){d=+m[1];mo=+m[2];y=m[3]?(+m[3]<100?2000+ +m[3]:+m[3]):new Date().getFullYear();}
    else if((m=s.match(/^(\d{1,2})\s*([a-z]{3})[a-z]*$/))){d=+m[1];mo=v3MN.indexOf(m[2])+1;if(!mo)return null;y=new Date().getFullYear();}else return null;
    const dt=new Date(y,mo-1,d);if(dt.getFullYear()!==y||dt.getMonth()!==mo-1||dt.getDate()!==d)return null;return iso(dt);}
  const v3dFmt=d=>fmt(d,{weekday:"short",day:"numeric",month:"short"});
  function v3dateField(label,val,onSet){const i=el("input",{type:"text",class:"tt-in v3-date","aria-label":label,placeholder:"9/11 or 9 Nov",value:val?fmt(val,{day:"numeric",month:"short",year:"numeric"}):""});
    i.addEventListener("change",()=>{const p=v3pDate(i.value);if(!p){toast("Type a date like 9/11 or 9 Nov");return;}onSet(p);});return i;}
  // slips: typed date and time, edit or delete any, history shows the time
  let v3slipEdit=null;
  function slipSheet(){psOpen("Slips",re=>{const g=G();if(!g)return [el("p",{class:"ps-sh-sum",text:"Start tracking first."})];const today=iso(new Date()),all=(g.slips||[]).slice().sort((a,b)=>(b.at||0)-(a.at||0));
    const save=slips=>{saveGuard({...g,slips});setTimeout(re,350);};
    let nd=today,nt=hhmm(Date.now()),trig="",note="";
    const trigSel=el("select",{class:"v3-in","aria-label":"What came before it"},el("option",{value:"",text:"What came before it? (optional)"}),...TRIGGERS.map(t=>el("option",{value:t,text:t})));trigSel.onchange=()=>{trig=trigSel.value;};
    const noteIn=el("input",{type:"text",class:"v3-in",placeholder:"One line for future you (optional)","aria-label":"Note"});noteIn.oninput=()=>{note=noteIn.value;};
    const chips=el("div",{class:"v3-cats"},...[0,1,2,3,4,5,6].map(k=>{const d=addDays(today,-k);return el("button",{type:"button",class:"cat-chip"+(nd===d?" on":""),onclick:()=>{nd=d;dateIn.value=fmt(d,{day:"numeric",month:"short",year:"numeric"});chips.querySelectorAll(".cat-chip").forEach((c,i)=>c.classList.toggle("on",i===k));}},k===0?"Today":k===1?"Yesterday":fmt(d,{weekday:"short"}));}));
    const dateIn=v3dateField("Date of the slip",today,p=>{nd=p;chips.querySelectorAll(".cat-chip").forEach(c=>c.classList.remove("on"));});
    const timeIn=v3time("Time of the slip",nt,v=>{nt=v||nt;});
    const add=el("section",{class:"v3-ncard"},el("p",{class:"hint",text:"Forgot to log one? Pick the day and type the time. No shame, just honest."}),chips,
      el("div",{class:"v3-row"},el("label",{class:"field"},el("span",{class:"label",text:"Date"}),dateIn),el("label",{class:"field"},el("span",{class:"label",text:"Time"}),timeIn)),trigSel,noteIn,
      el("button",{type:"button",class:"btn",onclick:()=>{const ae=document.activeElement;if(ae&&ae.blur)ae.blur();setTimeout(()=>{if(nd>today){toast("That day has not happened yet");return;}if(nd<g.start){toast("That is before your start date");return;}
        const at=atOn(nd,nt),slips=[...(g.slips||[]).filter(x=>x.date!==nd),{date:nd,at,trigger:trig,note:note.trim()}];saveGuard({...g,slips});toast("Logged for "+v3dFmt(nd));setTimeout(re,350);},30);}},"Log slip"));
    const rows=all.length?el("ul",{class:"q-list"},...all.map(x=>{const editing=v3slipEdit===x.date;
      if(!editing)return el("li",{class:"slp-row v3-srow"},el("span",{class:"ent-what"},el("b",{text:v3dFmt(x.date)+" · "+(x.at?t12(hhmm(x.at)):"time not set")}),el("span",{class:"hint",text:[x.trigger,x.note].filter(Boolean).join(" · ")})),
        el("button",{type:"button",class:"mini",onclick:()=>{v3slipEdit=x.date;re();}},"Edit"),el("button",{type:"button",class:"x","aria-label":"Delete this slip",onclick:()=>v3confirm("Delete the slip on "+v3dFmt(x.date)+"?","Delete",()=>{save((g.slips||[]).filter(y=>y.date!==x.date));})},"×"));
      let ed=x.date,et=x.at?hhmm(x.at):"12:00";
      return el("li",{class:"v3-ncard"},el("div",{class:"v3-row"},el("label",{class:"field"},el("span",{class:"label",text:"Date"}),v3dateField("Slip date",x.date,p=>{ed=p;})),el("label",{class:"field"},el("span",{class:"label",text:"Time"}),v3time("Slip time",et,v=>{et=v||et;}))),
        el("div",{class:"v3-row"},el("button",{type:"button",class:"btn",onclick:()=>{const ae=document.activeElement;if(ae&&ae.blur)ae.blur();setTimeout(()=>{if(ed>today||ed<g.start){toast("Pick a day from your start date to today");return;}
          const upd=(g.slips||[]).filter(y=>y.date!==x.date&&y.date!==ed).concat([{...x,date:ed,at:atOn(ed,et)}]);v3slipEdit=null;save(upd);},30);}},"Save"),el("button",{type:"button",class:"btn ghost",onclick:()=>{v3slipEdit=null;re();}},"Cancel")));})):el("p",{class:"ps-sh-sum",text:"No slips logged."});
    return [add,el("span",{class:"label",text:"History"}),rows];});}
  // best streak, clean days, urges overcome: tap to see the days behind the number
  function v3streaks(g){const today=iso(new Date()),ss=new Set((g.slips||[]).map(x=>x.date)),out=[];let s=null;
    for(let d=g.start;d<=today;d=addDays(d,1)){if(ss.has(d)){if(s){out.push(s);s=null;}}else{if(!s)s={from:d,to:d,n:0};s.to=d;s.n++;}}if(s)out.push(s);return {out,ss};}
  function statSheet(kind){psOpen(kind==="best"?"Streaks":kind==="clean"?"Clean days":"Urges overcome",re=>{const g=G();if(!g)return [];const {out,ss}=v3streaks(g);
    if(kind==="best"){const L=out.slice().sort((a,b)=>b.n-a.n);return [el("table",{class:"lh-tab"},el("thead",{},el("tr",{},el("th",{text:"From"}),el("th",{text:"To"}),el("th",{text:"Days"}))),el("tbody",{},...L.map((s,i)=>el("tr",{},el("td",{text:v3dFmt(s.from)}),el("td",{text:s.to===iso(new Date())?"Now":v3dFmt(s.to)}),el("td",{class:"num",text:String(s.n)+(i===0?" best":"")}))))) ];}
    if(kind==="clean"){const days=[];for(let d=g.start;d<=iso(new Date());d=addDays(d,1))days.push(d);const mon={};days.forEach(d=>{(mon[d.slice(0,7)]=mon[d.slice(0,7)]||[]).push(d);});
      return Object.keys(mon).sort().reverse().map(m=>el("section",{class:"lh-wk open"},el("div",{class:"lh-wh"},el("span",{class:"lh-wn",text:fmt(m+"-01",{month:"long",year:"numeric"})}),el("span"),el("b",{class:"num",text:mon[m].filter(d=>!ss.has(d)).length+" clean"})),
        el("div",{class:"gd-dots v3-gdots"},...mon[m].map(d=>el("span",{class:"gd-dot "+(ss.has(d)?"slip":"ok"),title:v3dFmt(d)+(ss.has(d)?": slip":": clean"),"aria-label":v3dFmt(d)+(ss.has(d)?", slip":", clean")})))));}
    const W=(g.wins||[]).slice().sort((a,b)=>b.at-a.at);return W.length?[el("ul",{class:"q-list"},...W.map(w=>el("li",{class:"slp-row v3-srow"},el("span",{class:"ent-what"},el("b",{text:v3dFmt(iso(new Date(w.at)))}),el("span",{class:"hint",text:t12(hhmm(w.at))})))))]:[el("p",{class:"ps-sh-sum",text:"None logged yet."})];});}
  {const _g=renderGuard;renderGuard=function(){_g();try{const box=document.getElementById("guardBody");if(!box)return;
    box.querySelectorAll(".slp-tile").forEach((t,i)=>{const k=["best","clean","urge"][i];if(!k||t.dataset.v3)return;t.dataset.v3="1";t.setAttribute("role","button");t.tabIndex=0;t.style.cursor="pointer";t.onclick=()=>statSheet(k);t.onkeydown=e=>{if(e.key==="Enter")statSheet(k);};});
    box.querySelectorAll("details.edit-box").forEach(d=>{const s=d.querySelector("summary");if(s&&/Slip history/.test(s.textContent)&&!d.dataset.v3){d.dataset.v3="1";d.replaceWith(el("button",{type:"button",class:"btn ghost",onclick:()=>{v3slipEdit=null;slipSheet();}},"Slip history"));}});
    box.querySelectorAll(".slp-btns .btn.ghost").forEach(b=>{if(/Log a slip/.test(b.textContent)&&!b.dataset.v3){b.dataset.v3="1";b.onclick=e=>{e.preventDefault();e.stopPropagation();v3slipEdit=null;slipSheet();};}});
    if(!box.querySelector(".v3-gdt"))box.prepend(el("button",{type:"button",class:"btn ghost v3-gdt","aria-expanded":String(guardShown),onclick:()=>{guardShown=!guardShown;try{localStorage.setItem("sb-guard-show",guardShown?"1":"0");}catch(e){}render();}},guardShown?"Hide Self-mastery":"Show Self-mastery"));}catch(e){console.warn(e);}};}
  // habits: add by hand (synced), report with one tab per habit, Self-mastery always starts folded
  function v3loadHabits(){try{Object.entries(state.habits||{}).forEach(([id,h])=>{if(h&&h.custom&&h.name&&!HABITS.some(x=>x.id===id))HABITS.push({id,name:String(h.name),def:[Number(h.min)||3,Number(h.max)||5],custom:true});});}catch(e){}}
  {const _r=render;render=function(){v3loadHabits();_r();};}
  function addHabitSheet(){psOpen("Add a habit",re=>{let name="",lo=3,hi=5;
    const nIn=el("input",{type:"text",class:"v3-in",placeholder:"Habit name, like Read 10 pages","aria-label":"Habit name"});nIn.oninput=()=>{name=nIn.value;};
    const lIn=el("input",{type:"number",class:"v3-in",min:"1",max:"7",value:"3","aria-label":"Days a week, at least"}),hIn=el("input",{type:"number",class:"v3-in",min:"1",max:"7",value:"5","aria-label":"Days a week, at most"});
    return [el("label",{class:"field"},el("span",{class:"label",text:"Name"}),nIn),el("div",{class:"v3-row"},el("label",{class:"field"},el("span",{class:"label",text:"Days a week, from"}),lIn),el("label",{class:"field"},el("span",{class:"label",text:"to"}),hIn)),
      el("button",{type:"button",class:"btn",onclick:()=>{name=nIn.value.trim();lo=Math.max(1,Math.min(7,+lIn.value||3));hi=Math.max(lo,Math.min(7,+hIn.value||lo));if(!name){toast("Type a name");return;}
        const id="h"+Date.now().toString(36),body={custom:true,name,min:lo,max:hi};state.habits={...(state.habits||{}),[id]:body};try{store.set("habits/"+id,body);}catch(e){}toast("Habit added");psClose(true);render();openPop("hab");}},"Add habit")];});}
  function v3habStats(h){const today=iso(new Date()),L=d=>(state.logs[d]||{})[h.id];let cur=0;for(let d=today;d>=START;d=addDays(d,-1)){if(L(d))cur++;else if(d!==today)break;}
    let best=0,run=0;for(let d=START;d<=today;d=addDays(d,1)){if(L(d)){run++;best=Math.max(best,run);}else run=0;}return {cur,best,total:habitTotal(h)};}
  let v3repTab=null;
  function habitReport(){psOpen("Habits report",re=>{const tabs=[...HABITS.map(h=>[h.id,h.name]),["guard","Self-mastery"]];if(!v3repTab||!tabs.some(t=>t[0]===v3repTab))v3repTab=tabs[0][0];
    const bar=el("div",{class:"v3-tabs",role:"tablist"},...tabs.map(([k,n])=>el("button",{type:"button",role:"tab",class:"cat-chip"+(v3repTab===k?" on":""),"aria-selected":String(v3repTab===k),onclick:()=>{v3repTab=k;re();}},n)));
    const today=iso(new Date());let body;
    if(v3repTab==="guard"){const g=G();if(!g)body=el("p",{class:"ps-sh-sum",text:"Self-mastery is not started yet."});else{const st=guardStats(),{out}=v3streaks(g),weeks=[];for(let i=4;i>=0;i--){const ws=addDays(weekStart(today),-7*i),we=addDays(ws,6);
        weeks.push([ws,(g.slips||[]).filter(x=>x.date>=ws&&x.date<=we).length,(g.wins||[]).filter(w=>{const d=iso(new Date(w.at));return d>=ws&&d<=we;}).length]);}
      body=el("div",{class:"v3-rep"},el("div",{class:"slp-tiles"},el("div",{class:"slp-tile"},el("b",{class:"num",text:String(st.streak)}),el("span",{class:"hint",text:"current streak"})),el("div",{class:"slp-tile"},el("b",{class:"num",text:String(st.best)}),el("span",{class:"hint",text:"best streak"})),el("div",{class:"slp-tile"},el("b",{class:"num",text:st.clean+"/"+st.days}),el("span",{class:"hint",text:"clean days"})),el("div",{class:"slp-tile"},el("b",{class:"num",text:String(st.wins)}),el("span",{class:"hint",text:"urges overcome"}))),
        el("table",{class:"lh-tab"},el("thead",{},el("tr",{},el("th",{text:"Week of"}),el("th",{text:"Slips"}),el("th",{text:"Urges overcome"}))),el("tbody",{},...weeks.filter(x=>addDays(x[0],6)>=START).map(([ws,s,w])=>el("tr",{},el("th",{scope:"row",text:fmt(ws,{day:"numeric",month:"short"})}),el("td",{class:"num",text:String(s)}),el("td",{class:"num",text:String(w)}))))));}}
    else{const h=HABITS.find(x=>x.id===v3repTab),s=v3habStats(h),cur=weekInfo(h,today),weeks=[];for(let i=4;i>=0;i--)weeks.push(addDays(weekStart(today),-7*i));
      body=el("div",{class:"v3-rep"},el("div",{class:"slp-tiles"},el("div",{class:"slp-tile"},el("b",{class:"num",text:String(s.total)}),el("span",{class:"hint",text:"days done"})),el("div",{class:"slp-tile"},el("b",{class:"num",text:String(cur.n)}),el("span",{class:"hint",text:"this week · zone "+cur.lo+" to "+cur.hi})),el("div",{class:"slp-tile"},el("b",{class:"num",text:String(s.cur)}),el("span",{class:"hint",text:"current streak"})),el("div",{class:"slp-tile"},el("b",{class:"num",text:String(s.best)}),el("span",{class:"hint",text:"best streak"}))),
        el("span",{class:"label",text:"Last 5 weeks"}),
        ...weeks.filter(ws=>addDays(ws,6)>=START).map(ws=>{const wi=weekInfo(h,ws);return el("div",{class:"v3-wk"},el("span",{class:"hint num",text:fmt(ws,{day:"numeric",month:"short"})}),
          el("div",{class:"v3-cells"},...[0,1,2,3,4,5,6].map(k=>{const d=addDays(ws,k),on=!!(state.logs[d]||{})[h.id],fut=d>today;return el("span",{class:"v3-cell"+(on?" on":fut?" fut":""),title:v3dFmt(d)+(on?": done":fut?"":": missed"),"aria-label":v3dFmt(d)+(on?", done":fut?", upcoming":", missed")});})),
          el("span",{class:"hint num",text:wi.n+" · "+(wi.zone==="in"?"in zone":wi.zone==="above"?"above":"below")}));}));}
    return [bar,body];});}
  {const _op2=openPop;openPop=function(k){if(k==="hab"){guardShown=false;try{localStorage.setItem("sb-guard-show","0");}catch(e){}}_op2(k);if(k==="hab"){try{renderGuard();}catch(e){}setTimeout(()=>{const b=document.querySelector(".ps-sheet .ps-sh-body");if(b&&!b.querySelector(".v3-habbar"))b.prepend(el("div",{class:"v3-row v3-habbar"},el("button",{type:"button",class:"btn",onclick:habitReport},"Report"),el("button",{type:"button",class:"btn ghost",onclick:addHabitSheet},"Add habit")));},0);}};}
  try{v3loadHabits();render();}catch(e){}
  // sub-sheets return to the sheet they came from when closed (Habits, Capture, Time)
  const v3backFor={"Streaks":"hab","Clean days":"hab","Urges overcome":"hab","Slips":"hab","Habits report":"hab","Add a habit":"hab","Review notes":"cap","Time logged":"ent","Edit entry":"ent","Add time by hand":"ent"};
  {const _po=psOpen;psOpen=function(title,build,opt){opt=opt||{};const k=v3backFor[title];if(k&&!opt.onClose)opt.onClose=()=>setTimeout(()=>{if(!sheetStack.length)openPop(k);},260);return _po(title,build,opt);};}
