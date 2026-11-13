
  const __shadow={};
  // =====================================================================
  // 7 Nov redesign: 4 hubs, work in/out, Quran block, buffer, dad gym, undo, one line icon set
  // =====================================================================
  // ---------- line icons (one rounded set, used everywhere) ----------
  const XI={
    play:'<path d="M8 5.5v13l10-6.5z"/>',bell:'<path d="M6 9a6 6 0 0112 0c0 5 2 6.5 2 6.5H4S6 14 6 9z"/><path d="M10 19a2 2 0 004 0"/>',
    moon:'<path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/>',dumbbell:'<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
    scale:'<path d="M12 4v16M6 20h12M5 7h14M5 7l-2.5 6a2.5 2.5 0 005 0zM19 7l-2.5 6a2.5 2.5 0 005 0z"/>',
    trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z"/><path d="M17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3"/>',
    flame:'<path d="M12 3s5 4.5 5 9.5a5 5 0 01-10 0C7 9 9.5 8 9.5 5.5 11 7 12 3 12 3z"/>',
    star:'<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    pen:'<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',pencil:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    inbox:'<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1 2h6l1-2h5"/>',book:'<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z"/><path d="M4 19a2 2 0 012-2h13"/>',
    briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 12h18"/>',refresh:'<path d="M20 11a8 8 0 00-14.5-4.5L3 9M4 13a8 8 0 0014.5 4.5L21 15"/><path d="M3 4v5h5M21 20v-5h-5"/>',
    brain:'<path d="M9 4a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 002 5 3 3 0 006 0V7a3 3 0 00-3-3z"/><path d="M15 4a3 3 0 013 3 3 3 0 012 5 3 3 0 01-2 5 3 3 0 01-6 0"/>',
    pin:'<path d="M12 21s7-6.2 7-12a7 7 0 00-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    heart:'<path d="M20.8 5.6a5 5 0 00-7.1 0L12 7.3l-1.7-1.7a5 5 0 10-7.1 7.1L12 21.5l8.8-8.8a5 5 0 000-7.1z"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',warn:'<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5v.5"/>',
    drop:'<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/>',music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 010 11H11"/>',login:'<path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/>',
    logout:'<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 016 4.8"/>',
    battery:'<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2M6 11v2"/>',log:'<path d="M5 4h11l3 3v13H5z"/><path d="M9 10h6M9 14h6M9 18h3"/>',
    grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>'};
  function xico(k,cls){const sp=document.createElement("span");sp.className=cls||"ic";sp.setAttribute("aria-hidden","true");sp.innerHTML='<svg viewBox="0 0 24 24">'+(XI[k]||ICO[k]||"")+'</svg>';return sp;}
  Object.assign(ICO,{log:XI.log,review:ICO.progress,more:XI.grid});
  // every emoji on screen becomes a line icon (known ones) or is removed (the rest)
  const EMO={"🎙":"mic","▶":"play","⏯":"play","🔔":"bell","🕌":"moon","🌙":"moon","🌛":"moon","🏋":"dumbbell","💪":"dumbbell","⚖":"scale","🏆":"trophy","🎮":"trophy","🥇":"trophy","🔥":"flame","⭐":"star","🌟":"star","✨":"star","✅":"check","✔":"check","☑":"check","☀":"sun","🌅":"sun","⚙":"gear","🎨":"pen","🧭":"compass","✍":"pencil","📝":"pencil","📥":"inbox","📚":"book","📖":"book","💼":"briefcase","🔁":"refresh","🔄":"refresh","🧠":"brain","📍":"pin","❤":"heart","🎯":"target","⏰":"clock","⏱":"clock","⏳":"clock","🕐":"clock","⚠":"warn","💧":"drop","🎧":"music","🎵":"music","😴":"moon","🛌":"moon","👨":"users","👥":"users"};
  const EMRE=/\p{Extended_Pictographic}(?:️|⃣|[\u{1F3FB}-\u{1F3FF}]|‍\p{Extended_Pictographic}️?)*/gu;
  const EMSKIP="textarea,script,style,[contenteditable],input,select,.ie-in,.no-emo,svg";
  function deEmoji(node){
    if(node.nodeType!==3||!node.data)return;EMRE.lastIndex=0;if(!EMRE.test(node.data))return;
    const p=node.parentNode;if(!p||p.nodeType!==1||p.closest(EMSKIP))return;
    if(p.tagName==="OPTION"||p.tagName==="TITLE"){EMRE.lastIndex=0;node.data=node.data.replace(EMRE,"").replace(/^\s+/,"");return;}
    const frag=document.createDocumentFragment();let last=0;EMRE.lastIndex=0;let m;const s=node.data;
    while((m=EMRE.exec(s))){if(m.index>last)frag.append(s.slice(last,m.index));const base=[...m[0]][0];const k=EMO[base];if(k)frag.append(xico(k));last=m.index+m[0].length;if(!k&&s[last]===" ")last++;}
    if(last<s.length)frag.append(s.slice(last));p.replaceChild(frag,node);}
  function deEmojiTree(root){if(!root)return;if(root.nodeType===3){deEmoji(root);return;}if(root.nodeType!==1||root.closest&&root.closest(EMSKIP))return;
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),list=[];let n;while((n=w.nextNode()))list.push(n);list.forEach(deEmoji);}
  deEmojiTree(document.body);
  new MutationObserver(ms=>{for(const m of ms){if(m.type==="characterData")deEmoji(m.target);else m.addedNodes.forEach(deEmojiTree);}}).observe(document.body,{childList:true,subtree:true,characterData:true});
  try{document.title="Milestone 1 Sprint Board";}catch(e){}

  // ---------- undo: every change can be taken back ----------
  const UNDO=[];let undoing=false,ugrp=null,uTimer=null;
  const USKIP=/^(timers|settings|design|listen)\//;
  function uRecord(path){if(undoing||USKIP.test(path))return;const i=path.indexOf("/"),col=path.slice(0,i),id=path.slice(i+1),sh=__shadow[col];if(!sh)return;
    const now=Date.now();if(!ugrp||now-ugrp.t>250){ugrp={t:now,items:{}};UNDO.push(ugrp);if(UNDO.length>40)UNDO.shift();}
    if(!(path in ugrp.items))ugrp.items[path]=sh[id]===undefined?null:JSON.parse(JSON.stringify(sh[id]));ugrp.t=now;showUndo();}
  ["set","update","del"].forEach(op=>{const o=store[op];store[op]=function(path){uRecord(path);return o.apply(this,arguments);};});
  {const oa=store.add;store.add=async function(col,body){const r=await oa.apply(this,arguments);if(!undoing&&r&&r.id&&__shadow[col]){const now=Date.now();if(!ugrp||now-ugrp.t>250){ugrp={t:now,items:{}};UNDO.push(ugrp);}ugrp.items[col+"/"+r.id]=null;ugrp.t=now;showUndo();}return r;};}
  async function doUndo(){const g=UNDO.pop();ugrp=null;hideUndo();if(!g){toast("Nothing to undo");return;}undoing=true;
    try{for(const [path,prev] of Object.entries(g.items)){const i=path.indexOf("/"),col=path.slice(0,i),id=path.slice(i+1);
      if(col==="logs"){clearTimeout(pending[id]);dirty.delete(id);}
      if(prev===null){if(state[col]){const c={...state[col]};delete c[id];state[col]=c;}await store.del(path);}
      else{if(state[col])state[col]={...state[col],[id]:prev};await store.set(path,prev);}}}
    catch(e){fail(e);}finally{undoing=false;}
    render();toast("Undone");updUndoBtn();}
  function undoBar(){let b=document.getElementById("undoBar");if(!b){b=el("div",{id:"undoBar",class:"undo-bar",role:"status","aria-live":"polite",hidden:""},el("span",{class:"ub-t",text:"Change saved"}),el("button",{type:"button",class:"ub-b",onclick:doUndo},xico("undo"),"Undo"));document.body.append(b);}return b;}
  function showUndo(){const b=undoBar();b.hidden=false;clearTimeout(uTimer);uTimer=setTimeout(hideUndo,6000);updUndoBtn();}
  function hideUndo(){const b=document.getElementById("undoBar");if(b)b.hidden=true;}
  function updUndoBtn(){const b=document.getElementById("undoTop");if(b){b.disabled=!UNDO.length;b.title=UNDO.length?"Undo the last change ("+UNDO.length+" in history)":"Nothing to undo";}}
  {const dn=document.querySelector(".dnav");if(dn&&!document.getElementById("undoTop")){const b=el("button",{type:"button",id:"undoTop",class:"icon-btn undo-top","aria-label":"Undo the last change",onclick:doUndo},xico("undo"));b.disabled=true;dn.append(b);}}
  document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&!e.shiftKey&&e.key.toLowerCase()==="z"&&!e.target.closest("input,textarea,[contenteditable]")){e.preventDefault();doUndo();}});

  // ---------- the day: Quran first, blocks follow your arrival, gym with Dad, family as buffer ----------

  // ---------- 12-hour time everywhere (8:00 AM, 8:00 PM); inputs keep 24-hour values ----------
  const hhmm24=hhmm;
  function t12(hm){const [h,mi]=String(hm).split(":").map(Number);if(!isFinite(h))return String(hm);return ((h%12)||12)+":"+String(mi||0).padStart(2,"0")+" "+(h<12?"AM":"PM");}
  hhmm=function(ms){return t12(hhmm24(ms));};
  const QURAN_BLOCK={n:0,name:"Quran and adhkar",from:"04:30",to:"05:15"};
  const MORNING=[["quran","Quran wird"],["adhkar","Morning adhkar"],["rakah","2 rak'ahs"]];
  const GYM_MIN=45;
  function xmm(m){m=Math.max(0,Math.min(23*60+59,Math.round(m)));return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");}
  function minsOf(ts){const t=new Date(ts);return t.getHours()*60+t.getMinutes();}
  const LEARN_FROM="05:15",DESIGN_FROM="08:00",DESIGN_TO="16:00",LI_FROM="16:15",LI_TO="17:45",GYM_FROM="18:00",DAY_END="21:30";
  function b1Name(d){try{const ts=tasksOn(d).filter(t=>!t.cut&&taskBlock(t)===1);return ts.length&&ts.every(t=>["linkedin","brand","outreach"].includes(t.cat))?"Brand batch":"Learning";}catch(e){return "Learning";}}
  // ---------- movable blocks: per-day order, times re-flow, Design never later than 8:00 AM ----------
  const BLEN={1:150,2:480,3:90};
  function validOrder(o){return Array.isArray(o)&&o.length===3&&[1,2,3].every(n=>o.includes(n))?o.map(Number):null;}
  function designStartFor(ord,startM){let c=startM;for(let i=0;i<ord.length;i++){if(i)c+=15;if(ord[i]===2)return c;c+=BLEN[ord[i]];}return c;}
  function curOrder(d){const L=log(d)||{};return validOrder(L.blockOrder)||dayBlocksDefault(d).filter(b=>b.n>=1&&b.n<=3).sort((a,b)=>hmMin(a.from)-hmMin(b.from)).map(b=>b.n);}
  function moveBlock(n,dir){const ord=curOrder(sel).slice(),i=ord.indexOf(n),j=i+dir;if(i<0||j<0||j>=ord.length)return;[ord[i],ord[j]]=[ord[j],ord[i]];
    if(designStartFor(ord,hmMin(LEARN_FROM))>hmMin(DESIGN_FROM)){toast("Design can't start after 8:00 AM. Move Design up instead.");return;}
    setLogPatch(sel,{blockOrder:ord.join()==="1,2,3"?null:ord});const nb=dayBlocksFor(sel).find(b=>b.n===n);toast((nb?nb.name:"Block")+" now "+t12(nb.from)+" to "+t12(nb.to));}
  function eveningBlocks(L,g0,out){const gm=GYM_MIN*(L.dadGym?2:1),g1=g0+gm,dayEnd=hmMin(DAY_END);
    out.push({n:4,name:L.dadGym?"Gym with Dad":"Gym",from:xmm(g0),to:xmm(g1),note:L.dadGym?"Double time today: "+dur(gm):""});
    const famLeft=Math.max(0,dayEnd-g1);
    if(L.famBuffer&&famLeft>60){out.push({n:5,name:"Buffer",from:xmm(g1),to:xmm(dayEnd-60),note:"Family time given to overdue work today"});out.push({n:6,name:"Family",from:xmm(dayEnd-60),to:DAY_END,note:"1 hour, phone away"});}
    else out.push({n:6,name:"Family",from:xmm(g1),to:xmm(Math.max(g1,dayEnd)),note:"Dinner, Isha, phone away"});return out;}
  var dayBlocksFor=function(d){const L=log(d)||{},ord=validOrder(L.blockOrder);if(!ord)return dayBlocksDefault(d);
    const out=[{...QURAN_BLOCK}];let cur=hmMin(LEARN_FROM);if(L.workIn&&iso(new Date(L.workIn))===d)cur=Math.max(cur,minsOf(L.workIn));
    const NM={1:b1Name(d),2:"Design",3:"LinkedIn and brand"};
    ord.forEach((n,i)=>{if(i)cur+=15;out.push({n,name:NM[n],from:xmm(cur),to:xmm(cur+BLEN[n]),note:n===2?(i===0?"Big task first. Hardest work before Dhuhr.":"Hard start. Hardest task first."):i===0?"Your order for today":""});cur+=BLEN[n];});
    return eveningBlocks(L,Math.max(hmMin(GYM_FROM),cur+15),out);}
  function dayBlocksDefault(d){
    const L=log(d)||{},out=[{...QURAN_BLOCK}];
    let lf=hmMin(LEARN_FROM);if(L.workIn&&iso(new Date(L.workIn))===d)lf=Math.max(lf,minsOf(L.workIn));
    const lateLearn=hmMin(DESIGN_FROM)-lf<30;
    const design={n:2,name:"Design",from:DESIGN_FROM,to:DESIGN_TO,note:"Hard start. Hardest task first."};
    const li={n:3,name:"LinkedIn and brand",from:LI_FROM,to:LI_TO};
    let g0=hmMin(GYM_FROM);
    if(!lateLearn)out.push({n:1,name:b1Name(d),from:xmm(lf),to:DESIGN_FROM,note:lf>hmMin(LEARN_FROM)?"Started at "+hhmm(L.workIn)+", learning gets what is left before 8:00 AM":b1Name(d)==="Brand batch"?"Writing at your focus peak":"Your focus peak"},design,li);
    else{out.push(design,li,{n:1,name:b1Name(d),from:LI_TO,to:xmm(hmMin(LI_TO)+30),note:"Late start, so learning is 30 min after LinkedIn today"});g0=Math.max(g0,hmMin(LI_TO)+30);}
    const gm=GYM_MIN*(L.dadGym?2:1),g1=g0+gm,dayEnd=hmMin(DAY_END);
    out.push({n:4,name:L.dadGym?"Gym with Dad":"Gym",from:xmm(g0),to:xmm(g1),note:L.dadGym?"Double time today: "+dur(gm):""});
    const famLeft=Math.max(0,dayEnd-g1);
    if(L.famBuffer&&famLeft>60){out.push({n:5,name:"Buffer",from:xmm(g1),to:xmm(dayEnd-60),note:"Family time given to overdue work today"});out.push({n:6,name:"Family",from:xmm(dayEnd-60),to:DAY_END,note:"1 hour, phone away"});}
    else out.push({n:6,name:"Family",from:xmm(g1),to:xmm(Math.max(g1,dayEnd)),note:"Dinner, Isha, phone away"});
    return out;}
  function setLogPatch(d,patch){const L={...log(d),date:d,...patch};Object.keys(patch).forEach(k=>{if(patch[k]===null)delete L[k];});state.logs[d]=L;queueSave(d,300);render();}
  function morningRow(showAll){const L=log(sel),m=L.morning||{};
    return el("ul",{class:"tasks db-list mrn"},...MORNING.filter(([k])=>showAll||!m[k]).map(([k,n])=>{const cb=el("input",{type:"checkbox","aria-label":n});cb.checked=!!m[k];
      cb.addEventListener("change",()=>{setLogPatch(sel,{morning:{...(log(sel).morning||{}),[k]:cb.checked}});if(cb.checked)toast(n+" done");});
      return el("li",{class:"task trow"+(m[k]?" done":"")},el("div",{class:"trow-top"},el("div",{class:"trow-main"},cb,el("span",{class:"title",text:n}))));}));}
  function overdueTasks(){return Object.entries(state.tasks).map(([id,t])=>({id,...t})).filter(t=>isLeaf(t)&&t.date<sel&&!t.done&&!t.cut&&sprintFor(t.date).n===sprintFor(sel).n);}
  function useBuffer(on){const today=sel;
    if(on){const od=overdueTasks();od.forEach(t=>{const p={date:today,block:5,moved:(t.moved||0)+1,sprint:sprintFor(today).n};state.tasks[t.id]={...state.tasks[t.id],...p};setTask(t.id,p);});
      setLogPatch(today,{famBuffer:true});toast(od.length?od.length+" overdue task"+(od.length>1?"s":"")+" moved into your next buffer":"Buffer open");}
    else{tasksOn(today).filter(t=>Number(t.block)===5&&!t.done).forEach(t=>{const p={block:taskBlock({cat:t.cat})};state.tasks[t.id]={...state.tasks[t.id],...p};setTask(t.id,p);});setLogPatch(today,{famBuffer:null});toast("Overdue tasks back in their blocks");}}
  // patched block renderer: a vertical time rail, tasks inside each block, empty blocks collapsed
  const BLOCK_CAT={1:"learning",2:"portfolio",3:"linkedin",5:"portfolio"};
  function addInto(n){const s=document.getElementById("addCat"),i=document.getElementById("addTitle");if(s&&BLOCK_CAT[n])s.value=BLOCK_CAT[n];if(i){i.scrollIntoView({block:"center"});i.focus();}}
  function prayMarks(d){try{const t=prayTimesFor(d.split("-").map(Number),prayCfg().city);if(!t)return [];
    return [["fajr","Fajr"],["dhuhr","Dhuhr and lunch"],["asr","Asr"],["maghrib","Maghrib"]].filter(([k])=>t[k]).map(([k,l])=>({at:minsOf(t[k]),name:l}));}catch(e){return [];}}
  var workBlockOrder=function(d){return dayBlocksFor(d).filter(b=>[1,2,3,5].includes(b.n)).sort((a,b)=>hmMin(a.from)-hmMin(b.from)).map(b=>b.n);}
  function blockMoveBtns(t){const ord=workBlockOrder(t.date||sel),i=ord.indexOf(taskBlock(t)===1?3:taskBlock(t)),nm=n=>({2:"Design",3:"Batch",5:"Buffer"})[n]||"block "+n;
    const mv=n=>{patchTask(t.id,{block:n});toast("Moved to "+nm(n));};
    return [i>0?el("button",{class:"mini",type:"button",text:"↑ To "+nm(ord[i-1]),onclick:()=>mv(ord[i-1])}):null,
      i>=0&&i<ord.length-1?el("button",{class:"mini",type:"button",text:"↓ To "+nm(ord[i+1]),onclick:()=>mv(ord[i+1])}):null];}
  function dayBar(d,blocks){const a=hmMin("04:30"),z=hmMin("22:00"),sp=z-a,pc=m=>Math.max(0,Math.min(100,(m-a)/sp*100));
    const today=iso(new Date()),nowM=new Date().getHours()*60+new Date().getMinutes();
    return el("div",{class:"dbar",role:"img","aria-label":"The day from 4:30 AM to 10:00 PM"},
      el("div",{class:"dbar-track"},...blocks.map(b=>el("span",{class:"dbar-seg k"+b.n,style:"left:"+pc(hmMin(b.from))+"%;width:"+(pc(hmMin(b.to))-pc(hmMin(b.from)))+"%"})),
        d===today&&nowM>=a&&nowM<=z?el("span",{class:"dbar-now",style:"left:"+pc(nowM)+"%"}):null),
      el("div",{class:"dbar-ax"},...["04:30","08:00","12:00","16:00","22:00"].map(h=>el("span",{style:"left:"+pc(hmMin(h))+"%",text:t12(h).replace(":00","")}))));}
  const railOpen={},railDone={};let railDay=null;
  function blockOpenN(b,ts,L){if(b.n===0)return MORNING.filter(([k])=>!(L.morning||{})[k]).length;if(b.n===4)return gSessions().some(s=>s.date===sel)?0:1;if(b.n===6)return 0;return ts.filter(t=>taskBlock(t)===b.n&&!t.done).length;}
  function focusBlock(blocks,ts,L){const today=iso(new Date()),nowM=new Date().getHours()*60+new Date().getMinutes();
    const c=blocks.filter(b=>blockOpenN(b,ts,L)>0&&(b.n!==4||sel!==today||nowM>=hmMin(b.from)-30));if(!c.length)return null;if(sel!==today)return c[0].n;
    const now=c.find(b=>nowM>=hmMin(b.from)&&nowM<hmMin(b.to));if(now)return now.n;const nx=c.find(b=>hmMin(b.from)>nowM);const past=c.find(b=>hmMin(b.to)<=nowM&&[1,2,3,5].includes(b.n));
    return (past||nx||c[0]).n;}
  function blockFocusMin(b,ts){const ids=new Set(ts.filter(t=>taskBlock(t)===b.n).map(t=>"tasks:"+t.id));let s=0;try{(entriesOn(sel)||[]).forEach(x=>{if(ids.has(x.ref))s+=Number(x.minutes||0);});}catch(e){}return s;}
  // time on a task counts in that task's block only; untagged focus counts in the block whose window it falls in
  function untaggedInWin(b){const A=atOn(sel,b.from),Z=atOn(sel,b.to);let tagged=0;
    try{(entriesOn(sel)||[]).forEach(x=>{if(!String(x.ref||"").startsWith("tasks:"))return;(x.sessions||[]).forEach(se=>{const o=Math.min(Z,se.end||0)-Math.max(A,se.start||0);if(o>0)tagged+=o/60000;});});}catch(e){}
    return Math.max(0,winFocusMin(sel,b.from,b.to)-tagged);}
  // ---------- real start, lateness and fit check ----------
  {const _s=startTaskFocus;startTaskFocus=function(t){const cur=state.tasks[t.id]||{};if(!t.done&&!(cur.startedAt&&iso(new Date(cur.startedAt))===sel))patchTask(t.id,{startedAt:Date.now()});return _s(t);};}
  function estMin(t){if(Number(t.mins)>0)return Number(t.mins);const s=(t.title||"")+" "+(t.desc||"");let m=s.match(/(\d+(?:\.\d+)?)\s*(?:hrs?|hours?|h)\b/i);if(m)return Number(m[1])*60;m=s.match(/(\d+)\s*(?:-\s*)?min/i);if(m)return Number(m[1]);if(/1 day of work/i.test(s))return 360;return 60;}
  function realStart(b,ts){let st=null;const ids=new Set(ts.filter(t=>taskBlock(t)===b.n).map(t=>t.id));
    ts.forEach(t=>{if(ids.has(t.id)&&t.startedAt&&iso(new Date(t.startedAt))===sel)st=st==null?t.startedAt:Math.min(st,t.startedAt);});
    try{(entriesOn(sel)||[]).forEach(x=>{const r=String(x.ref||"");if(!r.startsWith("tasks:")||!ids.has(r.slice(6)))return;(x.sessions||[]).forEach(se=>{if(se.start)st=st==null?se.start:Math.min(st,se.start);});});}catch(e){}
    return st;}
  function lateLine(b,ts){const today=iso(new Date());if(sel!==today||![1,2,3,5].includes(b.n))return null;const nowM=new Date().getHours()*60+new Date().getMinutes(),from=hmMin(b.from);
    const st=realStart(b,ts);if(st){const late=minsOf(st)-from;return el("div",{class:"late-l"+(late>10?" late":"")},"Planned "+t12(b.from)+" · started "+hhmm(st)+(late>10?" · "+dur(late)+" late":" · on time"));}
    if(nowM>from+10&&nowM<hmMin(b.to)&&ts.some(t=>taskBlock(t)===b.n&&!t.done))return el("div",{class:"late-l late"},"Not started · "+dur(nowM-from)+" late");return null;}
  function fitCheck(b,ts){const today=iso(new Date());if(![1,2,3,5].includes(b.n))return null;const open=ts.filter(t=>taskBlock(t)===b.n&&!t.done);if(!open.length)return null;
    const nowM=new Date().getHours()*60+new Date().getMinutes(),start=sel===today?Math.max(nowM,hmMin(b.from)):hmMin(b.from),left=Math.max(0,hmMin(b.to)-start);
    let acc=0;const over=[];open.forEach(t=>{const need=Math.max(0,estMin(t)-(sel===today?0:0));acc+=need;if(acc>left)over.push(t);});if(!over.length)return null;
    return el("div",{class:"fit",role:"status"},el("div",{class:"fit-t"},over.length+" task"+(over.length>1?"s":"")+" won't fit before "+t12(b.to)+". About "+dur(acc)+" of work, "+dur(left)+" left."),
      el("ul",{class:"fit-l"},...over.map(t=>el("li",{},el("span",{class:"fit-n",text:t.title}),
        el("button",{type:"button",class:"mini",onclick:()=>{openTask=t.id;railOpen[b.n]=true;render();toast("Make it smaller: tap its title or description");}},"Shrink"),
        sel===today?el("button",{type:"button",class:"mini",onclick:()=>{patchTask(t.id,{block:5});if(!log(sel).famBuffer)setLogPatch(sel,{famBuffer:true});toast("Moved to tonight's buffer, family time is 1 hour");}},"Buffer"):null,
        el("button",{type:"button",class:"mini danger",onclick:()=>{patchTask(t.id,{cut:true});toast("Cut. Undo is on the bar below");}},"Cut")))));}
  // ---------- flexible task times: set a start, extend, re-flow ----------
  let tEdit=null;
  function tAt(t){return t.at&&/^\d{2}:\d{2}$/.test(t.at)&&t.date===sel?hmMin(t.at):null;}
  function reflowFrom(id,startM,durM){const me=state.tasks[id];const later=tasksOn(sel).filter(t=>t.id!==id&&!t.done&&tAt(t)!=null&&tAt(t)>=startM).sort((a,b)=>tAt(a)-tAt(b));
    let cur=startM+durM,moved=0;later.forEach(t=>{if(tAt(t)<cur){const nt=xmm(cur);state.tasks[t.id]={...state.tasks[t.id],at:nt};patchTask(t.id,{at:nt});moved++;cur=cur+estMin(t);}else cur=tAt(t)+estMin(t);});return moved;}
  function setTaskTime(t,hm){if(!hm){patchTask(t.id,{at:null});state.tasks[t.id]={...state.tasks[t.id]};delete state.tasks[t.id].at;render();toast("Back inside its block");return;}
    state.tasks[t.id]={...state.tasks[t.id],at:hm};patchTask(t.id,{at:hm});const n=reflowFrom(t.id,hmMin(hm),estMin(t));render();toast("Starts "+t12(hm)+(n?" · "+n+" later task"+(n>1?"s":"")+" moved to make room":""));}
  function addDur(t,d){const nd=Math.max(15,estMin(t)+d);state.tasks[t.id]={...state.tasks[t.id],mins:nd};patchTask(t.id,{mins:nd});let n=0;const a=tAt(t);if(a!=null)n=reflowFrom(t.id,a,nd);render();toast("Now "+dur(nd)+(n?" · "+n+" later task"+(n>1?"s":"")+" moved":""));}
  function timeChip(t,startM,fixed){const d=estMin(t),open=tEdit===t.id;
    const chip=el("button",{type:"button",class:"tchip"+(fixed?" fixed":""),"aria-expanded":String(open),onclick:e=>{e.stopPropagation();tEdit=open?null:t.id;render();}},
      (fixed?"":"~")+t12(xmm(startM))+" · "+dur(d));
    if(!open)return el("div",{class:"tline"},chip);
    const inp=el("input",{type:"time",class:"wb-time","aria-label":"Start time for "+t.title,value:xmm(startM)});
    inp.addEventListener("change",()=>{if(/^\d{2}:\d{2}$/.test(inp.value))setTaskTime(t,inp.value);});
    const b=(txt,fn,cls)=>el("button",{type:"button",class:"mini"+(cls?" "+cls:""),onclick:e=>{e.stopPropagation();fn();}},txt);
    return el("div",{class:"tline open",onclick:e=>e.stopPropagation()},chip,el("div",{class:"tedit2"},
      el("label",{class:"wb-f"},el("span",{class:"label",text:"Start"}),inp),
      b("\u221215m",()=>addDur(t,-15)),b("+15m",()=>addDur(t,15)),b("+30m",()=>addDur(t,30)),
      fixed?b("Clear time",()=>setTaskTime(t,null),"ghost"):b("Start now",()=>{const n=new Date();setTaskTime(t,xmm(n.getHours()*60+n.getMinutes()));}),
      b("Done",()=>{tEdit=null;render();})));}
  function withTime(node,t,startM,fixed){try{node.append(timeChip(t,startM,fixed));}catch(e){}return node;}
  renderDayBlocks=function(box,ts){
    if(!state.loaded.tasks){rc(box,el("div",{class:"empty",text:"Loading tasks..."}));return;}
    const L=log(sel),notes=L.blockNotes||{},today=iso(new Date()),nowM=new Date().getHours()*60+new Date().getMinutes();
    if(railDay!==sel){for(const k in railOpen)delete railOpen[k];for(const k in railDone)delete railDone[k];railDay=sel;}
    const blocks=dayBlocksFor(sel),rows=[],fb=focusBlock(blocks,ts,L);
    blocks.forEach(b=>rows.push({at:hmMin(b.from),b}));
    const timed=ts.filter(t=>tAt(t)!=null&&!t.done);timed.forEach(t=>rows.push({at:tAt(t),t}));const tIds=new Set(timed.map(t=>t.id));
    prayMarks(sel).forEach(p=>rows.push({at:p.at,p}));
    rows.push({at:hmMin(DAY_END),p:{at:hmMin(DAY_END),name:"Sleep",sub:"Hard stop"}});
    rows.sort((x,y)=>x.at-y.at||(x.p?-1:1));
    const items=rows.map(r=>{
      if(r.t){const t=r.t,s=r.at,e=s+estMin(t),now=sel===today&&nowM>=s&&nowM<e,past=sel===today&&nowM>=e;
        return el("li",{class:"rl rl-block rl-task"+(now?" now":"")+(past?" past":""),role:"group","aria-label":t.title+", "+t12(xmm(s))+" to "+t12(xmm(e))},
          el("span",{class:"rl-t num",text:t12(xmm(s))}),el("span",{class:"rl-dot","aria-hidden":"true"}),
          el("div",{class:"rl-b"},el("ul",{class:"tasks db-list"},withTime(taskRow(t,false),t,s,true))));}
      if(r.p){const past=sel===today&&nowM>r.p.at;return el("li",{class:"rl rl-thin rl-fixed"+(past?" past":"")},el("span",{class:"rl-t num",text:t12(xmm(r.p.at))}),el("span",{class:"rl-dot","aria-hidden":"true"}),
        el("div",{class:"rl-b"},el("span",{class:"rl-name",text:r.p.name}),r.p.sub?el("span",{class:"hint",text:r.p.sub}):null));}
      const b=r.b,mine=ts.filter(t=>taskBlock(t)===b.n&&!tIds.has(t.id)),len=blkLen(b),work=[1,2,3,5].includes(b.n),dn=mine.filter(t=>t.done).length;
      const now=sel===today&&nowM>=hmMin(b.from)&&nowM<hmMin(b.to),past=sel===today&&nowM>=hmMin(b.to);
      const mdone=b.n===0?MORNING.filter(([k])=>(L.morning||{})[k]).length:0;
      if(work&&!mine.length)return el("li",{class:"rl rl-thin rl-empty"+(now?" now":"")+(past?" past":"")},el("span",{class:"rl-t num",text:t12(b.from)}),el("span",{class:"rl-dot","aria-hidden":"true"}),
        el("div",{class:"rl-b"},el("span",{class:"rl-name",text:b.name}),el("span",{class:"hint",text:dur(len)+" · nothing planned"}),el("button",{type:"button",class:"mini rl-add",onclick:()=>addInto(b.n)},"+ Add")));
      const openN=blockOpenN(b,ts,L),total=b.n===0?3:b.n===4?1:mine.length,isOpen=railOpen[b.n]!==undefined?railOpen[b.n]:b.n===fb;
      const tog=()=>{railOpen[b.n]=!isOpen;render();};
      if(!isOpen)return el("li",{class:"rl rl-thin rl-min"+(now?" now":"")+(past?" past":"")+(openN===0&&total?" alldone":"")},el("span",{class:"rl-t num",text:t12(b.from)}),el("span",{class:"rl-dot","aria-hidden":"true"}),
        el("button",{type:"button",class:"rl-b rl-tog","aria-expanded":"false",onclick:tog},el("span",{class:"rl-name",text:b.name}),
          el("span",{class:"hint num",text:total?(openN===0?"All done":openN+" open")+(b.n===4?"":" · "+(total-openN)+"/"+total):dur(len)}),el("span",{class:"rl-chev","aria-hidden":"true"})));
      const fm=blockFocusMin(b,ts)+(work&&b.n!==5?untaggedInWin(b):0),pct=len?Math.min(100,fm/len*100):0;
      const head=el("div",{class:"rl-head"},el("span",{class:"rl-name big",text:b.name}),
          el("span",{class:"hint num",text:t12(b.from)+" to "+t12(b.to)+" · "+dur(len)}),
          b.n===0?el("span",{class:"rl-count num",text:mdone+"/3"}):mine.length?el("span",{class:"rl-count num",text:dn+"/"+mine.length}):null,
          b.n>=1&&b.n<=3?el("span",{class:"bmove"},el("button",{type:"button",class:"bm","aria-label":"Move "+b.name+" earlier",onclick:()=>moveBlock(b.n,-1),disabled:curOrder(sel).indexOf(b.n)===0?"":null},"\u2191"),el("button",{type:"button",class:"bm","aria-label":"Move "+b.name+" later",onclick:()=>moveBlock(b.n,1),disabled:curOrder(sel).indexOf(b.n)===2?"":null},"\u2193")):null,
          el("button",{type:"button",class:"rl-chev-b","aria-expanded":"true","aria-label":"Collapse "+b.name,onclick:tog},el("span",{class:"rl-chev up","aria-hidden":"true"})));
      const showDone=!!railDone[b.n],doneTs=mine.filter(t=>t.done),shown=showDone?mine:mine.filter(t=>!t.done);
      let cur=Math.max(hmMin(b.from),sel===today&&now?nowM:0);const ul=el("ul",{class:"tasks db-list"},...shown.map(t=>{if(t.done)return taskRow(t,false);const s=cur;cur+=estMin(t);return withTime(taskRow(t,false),t,s,false);}));
      const doneBtn=doneTs.length?el("button",{type:"button",class:"rl-donebtn",onclick:()=>{railDone[b.n]=!showDone;render();}},(showDone?"Hide ":"Show ")+doneTs.length+" done"):null;
      return el("li",{class:"rl rl-block b"+b.n+(now?" now":"")+(past?" past":""),role:"group","aria-label":b.name+", "+t12(b.from)+" to "+t12(b.to)},
        el("span",{class:"rl-t num",text:t12(b.from)}),el("span",{class:"rl-dot","aria-hidden":"true"}),
        el("div",{class:"rl-b"},head,b.note?el("div",{class:"db-sub",text:b.note}):null,lateLine(b,ts),fitCheck(b,ts),
          work&&b.n!==5?el("div",{class:"db-bar"},el("div",{class:"track",role:"img","aria-label":"Deep work "+dur(fm)+" of "+dur(len)},el("div",{class:"fill"+(pct>=100?" good":""),style:"width:"+pct+"%"})),el("span",{class:"hint num",text:"Deep work "+dur(fm)+" / "+dur(len)})):null,
          b.n===0?morningRow(showDone):null,b.n===0&&mdone?el("button",{type:"button",class:"rl-donebtn",onclick:()=>{railDone[0]=!showDone;render();}},(showDone?"Hide ":"Show ")+mdone+" done"):null,b.n===4?gymMini():null,shown.length?ul:null,doneBtn,
          b.n>=1&&b.n<=4?inl(el("span",{class:"db-note",text:notes[b.n]||""}),{value:notes[b.n]||"",label:"insight for "+b.name,empty:"+ Add an insight",onSave:v=>setBlockNote(sel,b.n,v)}):null));});
    rc(box,dayBar(sel,blocks),!ts.length&&isFriday(sel)?el("div",{class:"empty",text:"Friday is off. Do the 30-minute weekly review, then rest."}):null,el("ol",{class:"rail"},...items));};

  // ---------- work bar on Today: log in, log out, dad, buffer, low energy ----------
  let lowOpen=false;
  function timeEdit(d,key,label){const v=log(d)[key];const inp=el("input",{type:"time",class:"wb-time","aria-label":label,value:v?hhmm24(v):""});
    inp.addEventListener("change",()=>{if(!/^\d{2}:\d{2}$/.test(inp.value)){setLogPatch(d,{[key]:null});return;}setLogPatch(d,{[key]:atOn(d,inp.value)});toast(label+" set to "+t12(inp.value));});return inp;}
  function renderWorkBar(){
    const pg=document.querySelector('#workView .page[data-page="today"]');if(!pg||pg.hidden)return;
    let box=document.getElementById("workBar");if(!box){box=el("section",{id:"workBar",class:"panel wb","aria-label":"Work day"});pg.prepend(box);}
    if(box.contains(document.activeElement)&&document.activeElement.tagName==="INPUT")return;
    const d=sel,L=log(d),today=iso(new Date()),isToday=d===today,inT=L.workIn,outT=L.workOut;
    const span=inT?((outT||Date.now())-inT)/60000:0;
    let status,main;
    if(!inT){status=el("div",{class:"wb-st"},el("b",{text:isToday?"Not at work yet":"No arrival logged"}),el("span",{class:"hint",text:"Log in when you arrive. Every block starts from that moment."}));
      main=isToday?el("button",{type:"button",class:"btn wb-go",onclick:()=>{setLogPatch(d,{workIn:Date.now(),workOut:null});toast("Logged in. Blocks now start at "+hhmm(Date.now()));}},xico("login"),"Log in"):null;}
    else if(!outT){status=el("div",{class:"wb-st"},el("b",{text:"At work since "+hhmm(inT)}),el("span",{class:"hint num",text:dur(span)+" so far"}));
      main=isToday?el("button",{type:"button",class:"btn ghost wb-go",onclick:()=>{setLogPatch(d,{workOut:Date.now()});toast("Logged out after "+dur((Date.now()-inT)/60000));}},xico("logout"),"Log out"):null;}
    else{status=el("div",{class:"wb-st"},el("b",{text:"Worked "+hhmm(inT)+" to "+hhmm(outT)}),el("span",{class:"hint num",text:dur(span)+" at the office"}));main=null;}
    const od=overdueTasks().length,bufOn=!!L.famBuffer;
    const chipsRow=el("div",{class:"wb-row"},
      el("button",{type:"button",class:"wb-tg","aria-pressed":String(!!L.dadGym),onclick:()=>{setLogPatch(d,{dadGym:L.dadGym?null:true});toast(L.dadGym?"Gym back to "+GYM_MIN+" min":"Dad is coming: gym is "+GYM_MIN*2+" min today");}},xico("users"),"Dad at the gym"),
      (od||bufOn)?el("button",{type:"button",class:"wb-tg"+(od&&!bufOn?" warn":""),"aria-pressed":String(bufOn),onclick:()=>useBuffer(!bufOn)},xico("clock"),bufOn?"Overdue in buffer":"Move "+od+" overdue into a buffer"):null,
      el("button",{type:"button",class:"wb-tg","aria-expanded":String(lowOpen),onclick:()=>{lowOpen=!lowOpen;render();}},xico("battery"),"Low energy"));
    const low=lowOpen?el("div",{class:"wb-low",role:"region","aria-label":"Low energy reset"},
      el("b",{text:"Reset before you renegotiate the day"}),
      el("ol",{},el("li",{text:"Wudu."}),el("li",{text:"Pray 2 rak'ahs. Ask for strength in today's work."}),el("li",{text:"Open the smallest next task and work on it for 10 minutes only."}),el("li",{text:"Still empty after that? Open Rough day and follow the table."})),
      el("div",{class:"wb-row"},el("button",{type:"button",class:"btn",onclick:()=>{const t=tasksOn(sel).find(x=>!x.done&&taskBlock(x)>=1);lowOpen=false;if(t){openTask=t.id;render();toast("10 minutes on: "+t.title);}else render();}},"I prayed, show my next task"),
        el("button",{type:"button",class:"btn ghost",onclick:()=>{lowOpen=false;render();openRough();}},"Rough day"))):null;
    const wins=leafTasks().filter(t=>t.done&&t.doneAt===d&&!t.cut).length;
    rc(box,el("div",{class:"wb-top"},el("div",{class:"wb-ico"},xico(inT&&!outT?"login":"clock")),status,main),
      el("div",{class:"wb-row wb-times"},el("label",{class:"wb-f"},el("span",{class:"label",text:"In"}),timeEdit(d,"workIn","Arrival")),el("label",{class:"wb-f"},el("span",{class:"label",text:"Out"}),timeEdit(d,"workOut","Leaving")),
        el("button",{type:"button",class:"wb-wins",onclick:()=>setPage("wins")},xico("trophy"),wins+" win"+(wins===1?"":"s")+" today")),
      chipsRow,low);}

  // ---------- 4 hubs instead of 13 tabs ----------
  const HUBS=[
    {id:"today",name:"Today",ico:"today",pages:[["today","Today"]]},
    {id:"log",name:"Log",ico:"log",pages:[["health","Sleep and habits"],["gym","Gym"],["salah","Prayer"],["time","Work hours"]]},
    {id:"review",name:"Review",ico:"review",pages:[["progress","Progress"],["wins","Wins"],["projects","Projects"],["learning","Learning"]]},
    {id:"more",name:"More",ico:"more",pages:[["fellow","Fellow"],["brain","Brain"],["sounds","Sounds"],["settings","Settings"]]}];
  function hubOf(p){return HUBS.find(h=>h.pages.some(x=>x[0]===p))||HUBS[0];}
  function hubLast(h){let v=null;try{v=localStorage.getItem("sb-hub-"+h.id);}catch(e){}return h.pages.some(x=>x[0]===v)?v:h.pages[0][0];}
  buildNav=function(){
    const hub=hubOf(page);
    const hb=(h,cls)=>el("button",{type:"button",class:cls,"data-p":h===hub?h.pages[0][0]:hubLast(h),"data-hue":"x","aria-current":String(h===hub?"page":"false")},svgIco(h.ico),el("span",{class:"tname",text:h.name}));
    const pt=document.getElementById("pageTabs");rc(pt,...HUBS.map(h=>hb(h,"ptab")));requestAnimationFrame(()=>slideInd(pt,'[aria-current="page"]'));
    const st=document.getElementById("setTab");if(st)st.remove();
    document.getElementById("botNav").replaceChildren(...HUBS.map(h=>hb(h,"btab")));
    let sub=document.getElementById("hubSub");if(!sub){sub=el("div",{id:"hubSub",class:"hubsub",role:"navigation","aria-label":"Sections"});document.querySelector(".topnav").after(sub);}
    try{const tn=document.querySelector(".topnav");if(tn&&tn.offsetHeight)document.documentElement.style.setProperty("--tnh",tn.offsetHeight+"px");}catch(e){}
    sub.hidden=hub.pages.length<2;rc(sub,...hub.pages.map(([id,n])=>el("button",{type:"button",class:"hsub","data-p":id,"aria-current":String(id===page?"page":"false")},n)));
    const mm=document.getElementById("moreMenu");if(mm)mm.hidden=true;};
  {const _sp=setPage;setPage=function(p){try{localStorage.setItem("sb-hub-"+hubOf(p).id,p);}catch(e){}return _sp(p);};}
  {const _r=render;render=function(){_r();try{renderWorkBar();}catch(e){}};}

  // gym: finished exercises and the ones after the current one stay folded; tap to open
  const gOpenCard={};
  {const _gc=gCard;gCard=function(d,i){const node=_gc(d,i);try{const a=gActive(),mine=a&&a.day===d,sl=GYM[d].sl;
    const doneOf=j=>{let n=0;for(let k=0;k<sl[j].s;k++)if(mine&&(a.sets[j+"-"+k]||{}).done)n++;return n;};
    let fi=sl.findIndex((x,j)=>doneOf(j)<x.s);const key=d+"-"+i,all=doneOf(i)>=sl[i].s;
    const open=gOpenCard[key]!==undefined?gOpenCard[key]:(!all&&i===fi);
    const top=node.querySelector(".g-top");
    const btn=el("button",{type:"button",class:"g-fold","aria-expanded":String(open),"aria-label":open?"اقفل التمرين":"افتح التمرين",onclick:()=>{gOpenCard[key]=!open;renderGym();}},
      el("span",{class:"hint num",text:all?"خلص":doneOf(i)+"/"+sl[i].s}),el("span",{class:"rl-chev"+(open?" up":""),"aria-hidden":"true"}));
    if(top)top.append(btn);if(!open)node.classList.add("g-min");}catch(e){}return node;};}
  // ===== v3 day: 3 work blocks with buffers, press-and-hold to move, resize, no prayer rows =====
  const TPL={q:{kind:"quran",name:"Quran and adhkar",mins:45},pre:{kind:"buffer",name:"Breakfast",mins:30,note:"15 min scan, reply to comments on today's post"},
    w1:{kind:"work",holds:"design",mins:240,label:"Block 1 Deep",nopray:true},
    w2:{kind:"work",holds:"design",mins:300,label:"Block 2 Execution",nopray:true,note:"3 planned pomodoros and 1 free buffer. Prayers and lunch inside"},x2:{kind:"buffer",name:"Break",mins:15},
    w3:{kind:"work",holds:"batch",mins:150,label:"Block 3 After work",nopray:true,note:"LinkedIn card, learning card, 20 min English"},x3:{kind:"buffer",name:"Reset",mins:15},gym:{kind:"gym",name:"Gym",mins:45},fam:{kind:"family",name:"Family and rest",mins:0}};
  const TPL_ORDER=["q","w1","pre","w2","x2","w3","x3","gym","fam"],PN={q:0,pre:9,w1:2,w2:7,x2:8,w3:3,x3:10,gym:4,fam:6},DAY_START="04:30",MAXW=300,FULL_DAY=400;
  function planOf(d){const L=log(d)||{};let p=Array.isArray(L.plan)?L.plan.filter(x=>x&&TPL[x.id]):null;
    if(!p||p.length!==TPL_ORDER.length||new Set(p.map(x=>x.id)).size!==TPL_ORDER.length)p=TPL_ORDER.map(id=>({id}));
    return p.map(x=>({...TPL[x.id],...x,mins:Number(x.mins)>0?Number(x.mins):TPL[x.id].mins}));}
  function savePlan(d,p){const isDef=p.every((x,i)=>x.id===TPL_ORDER[i]&&x.mins===TPL[x.id].mins&&(x.holds||null)===(TPL[x.id].holds||null));
    setLogPatch(d,{plan:isDef?null:p.map(x=>{const o={id:x.id};if(x.mins!==TPL[x.id].mins)o.mins=x.mins;if(x.holds&&x.holds!==TPL[x.id].holds)o.holds=x.holds;return o;})});}
  // late start: the day shifts, then the buffers after it give the time back (each down to half, never under 30 min)
  function layout(d,p,useLogin){const L=log(d)||{};let cur=hmMin(DAY_START),first=true,debt=0;const out=[];
    p.forEach(it=>{if(it.kind==="work"&&first){first=false;if(useLogin&&L.workIn&&iso(new Date(L.workIn))===d){const li=minsOf(L.workIn);if(li>cur){debt=li-cur;cur=li;}}}
      let m=it.mins,shrunk=0;if(it.kind==="gym"&&L.dadGym)m*=2;
      if(it.kind==="buffer"&&!first&&debt>0&&m>30){shrunk=Math.min(debt,m-Math.max(30,Math.ceil(m/2)));m-=shrunk;debt-=shrunk;}
      let prayAdd=0,prayN=0;if(it.kind==="work"&&!it.nopray){const pr=prayersOn(d);for(let k=0;k<5;k++){const c=pr.filter(x=>x>=cur&&x<cur+m+prayAdd).length;if(c*PRAY_MIN===prayAdd){prayN=c;break;}prayAdd=c*PRAY_MIN;prayN=c;}m+=prayAdd;}
      if(it.kind==="family")m=Math.max(30,hmMin(DAY_END)-cur);
      out.push({...it,pid:it.id,n:PN[it.id],name:it.name||"Work",from:xmm(cur),to:xmm(cur+m),len:m,work:m-prayAdd,prayAdd,prayN,shrunk,tasks:[]});cur+=m;});return out;}
  // a prayer inside a work block adds 25 minutes to it
  const PRAY_MIN=25,_prC={};
  function prayersOn(d){if(_prC[d])return _prC[d];let r=[];try{const t=prayTimesFor(d.split("-").map(Number),prayCfg().city);if(t)r=["fajr","dhuhr","asr","maghrib","isha"].filter(k=>t[k]).map(k=>minsOf(t[k]));}catch(e){}return _prC[d]=r;}
  function holdName(b){if(b.label)return b.label;if(b.holds==="design")return "Design";const c=new Set(b.tasks.map(t=>t.cat));
    if(c.size&&[...c].every(x=>x==="learning"))return "Learning";if(c.size&&[...c].every(x=>["linkedin","brand","outreach"].includes(x)))return "Brand batch";return c.size?"Learning and brand":"Batch";}
  function assign(d,items,ts){const today=iso(new Date()),nowM=new Date().getHours()*60+new Date().getMinutes();
    const open=ts.filter(t=>!(tAt(t)!=null&&!t.done)),by=h=>items.filter(b=>b.kind==="work"&&b.holds===h);
    const fill=(list,bs)=>{if(!bs.length)return false;let i=0,used=0;list.forEach(t=>{const e=t.done?0:estMin(t);while(i<bs.length-1&&used>0&&used+e>(bs[i].work||bs[i].len)){i++;used=0;}bs[i].tasks.push(t);used+=e;});return true;};
    const design=open.filter(t=>taskBlock(t)===2),batch=open.filter(t=>taskBlock(t)===1||taskBlock(t)===3).sort((a,b)=>taskBlock(a)-taskBlock(b)),buf=open.filter(t=>taskBlock(t)===5);
    if(!fill(design,by("design")))fill(design,by("batch"));if(!fill(batch,by("batch")))fill(batch,by("design"));
    const bufs=items.filter(b=>b.kind==="buffer");if(bufs.length&&buf.length){const tgt=(d===today&&bufs.find(b=>hmMin(b.to)>nowM))||bufs[bufs.length-1];tgt.tasks.push(...buf);}
    items.forEach(b=>{if(b.kind==="work")b.name=holdName(b);});return items;}
  dayBlocksFor=function(d){return assign(d,layout(d,planOf(d),true),tasksOn(d));};
  function designGuard(p){const f=layout(sel,p,false).find(b=>b.kind==="work"&&b.holds==="design");return !f||hmMin(f.from)<=hmMin(DESIGN_FROM);}
  function resizeItem(pid,set,delta){const p=planOf(sel),it=p.find(x=>x.id===pid);if(!it)return;
    const lim={work:[30,MAXW],buffer:[15,120],gym:[30,90],quran:[15,90]}[it.kind]||[15,600];let m=set!=null?set:it.mins+delta;
    if(it.kind==="work"&&m>MAXW){toast("No block over 5 hours. Add the rest after a buffer.");m=MAXW;}m=Math.max(lim[0],Math.min(lim[1],m));
    if(m===it.mins)return;it.mins=m;if(!designGuard(p)){toast("Design must start by 8:00 AM.");return;}savePlan(sel,p);
    const i=p.findIndex(x=>x.id===pid),nx=p[i+1];if(it.kind==="work"&&m===MAXW&&!(nx&&nx.kind==="buffer"&&nx.mins>=60))toast("4-hour block: keep a 1-hour buffer after it.");}
  function setHolds(pid,h){const p=planOf(sel),it=p.find(x=>x.id===pid);if(!it||it.holds===h)return;it.holds=h;if(!designGuard(p)){toast("Design must start by 8:00 AM.");return;}savePlan(sel,p);toast(h==="design"?"This block now holds Design":"This block now holds the batch");}
  // ---------- message windows: 3 a day, only inside buffers ----------
  const COMMS={x1:[1,15,"Email and business WhatsApp first, then personal WhatsApp"],x2:[2,20,"Email and business WhatsApp first, then WhatsApp, then LinkedIn messages"],x3:[3,20,"Email and business WhatsApp first, then WhatsApp, then LinkedIn messages"]};
  function commsDone(pid){const c=COMMS[pid];return !!(c&&((log(sel).comms||{})[c[0]]));}
  function commsRow(b){const c=COMMS[b.pid];if(!c)return null;const done=commsDone(b.pid),cb=el("input",{type:"checkbox","aria-label":"Messages window "+c[0]+" done"});cb.checked=done;
    cb.addEventListener("change",()=>{setLogPatch(sel,{comms:{...(log(sel).comms||{}),[c[0]]:cb.checked}});if(cb.checked)toast("Window "+c[0]+" closed. Back to work.");});
    return el("ul",{class:"tasks db-list mrn"},el("li",{class:"task trow"+(done?" done":"")},el("div",{class:"trow-top"},el("div",{class:"trow-main"},cb,
      el("span",{class:"tm-txt"},el("span",{class:"title",text:"Messages window "+c[0]+" · "+c[1]+" min"}),el("span",{class:"hint",text:c[2]+". Reply or schedule, no feed."}))))));}
  let pEdit=null,dragEnded=0;
  function planEditor(b){const B=(t,fn,c)=>el("button",{type:"button",class:"mini"+(c?" "+c:""),onclick:e=>{e.stopPropagation();fn();}},t);
    const fam=b.kind==="family";
    return el("div",{class:"tedit2 pedit",onclick:e=>e.stopPropagation()},
      fam?el("span",{class:"hint",text:"Family takes the rest of the evening. Shorten another block to give it more."}):null,
      fam?null:B("−15m",()=>resizeItem(b.pid,null,-15)),fam?null:B("+15m",()=>resizeItem(b.pid,null,15)),fam?null:B("+30m",()=>resizeItem(b.pid,null,30)),
      b.kind==="work"?el("span",{class:"seg"},el("button",{type:"button","aria-pressed":String(b.holds==="design"),onclick:e=>{e.stopPropagation();setHolds(b.pid,"design");}},"Design"),el("button",{type:"button","aria-pressed":String(b.holds!=="design"),onclick:e=>{e.stopPropagation();setHolds(b.pid,"batch");}},"Batch")):null,
      B("Reset day",()=>{pEdit=null;setLogPatch(sel,{plan:null});toast("Day layout reset");},"ghost"),B("Done",()=>{pEdit=null;render();}));}
  function dayBar2(d,items){const a=hmMin(DAY_START),z=hmMin(DAY_END),sp=z-a,pc=m=>Math.max(0,Math.min(100,(m-a)/sp*100)),today=iso(new Date()),nowM=new Date().getHours()*60+new Date().getMinutes();
    const focus=(entriesOn(d)||[]).reduce((s,x)=>s+Number(x.minutes||0),0),fp=Math.min(100,focus/FULL_DAY*100);
    return el("div",{class:"dbar"},
      el("div",{class:"dbar-track",role:"img","aria-label":"Your day from "+t12(DAY_START)+" to "+t12(DAY_END)},...items.map(b=>el("span",{class:"dbar-seg k-"+b.kind+(b.kind==="work"&&b.holds!=="design"?" k-batch":""),style:"left:"+pc(hmMin(b.from))+"%;width:"+Math.max(0,pc(hmMin(b.to))-pc(hmMin(b.from)))+"%"})),
        d===today&&nowM>=a&&nowM<=z?el("span",{class:"dbar-now",style:"left:"+pc(nowM)+"%"}):null),
      el("div",{class:"dbar-ax"},...["04:30","09:15","14:45","17:30","21:30"].map(h=>el("span",{style:"left:"+pc(hmMin(h))+"%",text:t12(h).replace(":00","")}))),
      el("div",{class:"dbar-focus"},el("span",{class:"hint",text:"Focused today"}),el("div",{class:"track"},el("div",{class:"fill"+(fp>=100?" good":""),style:"width:"+fp+"%"})),
        el("span",{class:"hint num",text:dur(focus)+" / 8 pomodoros"+(focus>=FULL_DAY?" · full day":"")})));}
  function attachDrag(ol){let timer=null,drag=null,sx=0,sy=0;
    const clear=()=>{clearTimeout(timer);timer=null;};
    ol.addEventListener("pointerdown",e=>{const li=e.target.closest("li[data-pid]");if(!li||e.button>0||e.target.closest("input,textarea,select,.tedit2,.db-list,.mrn,.g-card,.ie,.tline"))return;
      sx=e.clientX;sy=e.clientY;clear();timer=setTimeout(()=>{drag={li,pid:li.dataset.pid,y0:sy,id:e.pointerId};li.classList.add("lifted");ol.classList.add("sorting");try{navigator.vibrate&&navigator.vibrate(12);}catch(_){}},380);});
    ol.addEventListener("pointermove",e=>{if(!drag){if(timer&&Math.hypot(e.clientX-sx,e.clientY-sy)>8)clear();return;}e.preventDefault();drag.li.style.transform="translateY("+(e.clientY-drag.y0)+"px)";drag.y=e.clientY;
      ol.querySelectorAll("li[data-pid]").forEach(x=>x.classList.remove("drop-a","drop-b"));const t=target(e.clientY);if(t)t.el.classList.add(t.after?"drop-b":"drop-a");});
    ol.addEventListener("touchmove",e=>{if(drag)e.preventDefault();},{passive:false});
    ol.addEventListener("contextmenu",e=>{if(drag||timer)e.preventDefault();});
    function target(y){let best=null;ol.querySelectorAll("li[data-pid]").forEach(x=>{if(x===drag.li)return;const r=x.getBoundingClientRect(),mid=r.top+r.height/2,dd=Math.abs(y-mid);if(!best||dd<best.d)best={el:x,d:dd,after:y>mid};});return best;}
    const end=e=>{clear();if(!drag)return;const t=drag.y!=null?target(drag.y):null,pid=drag.pid;drag.li.style.transform="";drag.li.classList.remove("lifted");ol.classList.remove("sorting");
      ol.querySelectorAll("li[data-pid]").forEach(x=>x.classList.remove("drop-a","drop-b"));drag=null;dragEnded=Date.now();if(!t)return;
      const p=planOf(sel),from=p.findIndex(x=>x.id===pid),it=p.splice(from,1)[0];let to=p.findIndex(x=>x.id===t.el.dataset.pid);if(to<0)return;if(t.after)to++;p.splice(to,0,it);
      if(p.map(x=>x.id).join()===planOf(sel).map(x=>x.id).join())return;if(!designGuard(p)){toast("Design must start by 8:00 AM.");render();return;}
      savePlan(sel,p);const nb=dayBlocksFor(sel).find(b=>b.pid===pid);toast((nb?nb.name:"Block")+" now "+t12(nb.from)+" to "+t12(nb.to));};
    ol.addEventListener("pointerup",end);ol.addEventListener("pointercancel",end);}
  function itemFocus(b){const ids=new Set(b.tasks.map(t=>"tasks:"+t.id));return (entriesOn(sel)||[]).reduce((s,x)=>s+(ids.has(x.ref)?Number(x.minutes||0):0),0);}
  function lateLine3(b){const today=iso(new Date());if(sel!==today||b.kind!=="work"||!b.tasks.length)return null;const nowM=new Date().getHours()*60+new Date().getMinutes(),from=hmMin(b.from);
    let st=null;const ids=new Set(b.tasks.map(t=>t.id));b.tasks.forEach(t=>{if(t.startedAt&&iso(new Date(t.startedAt))===sel)st=st==null?t.startedAt:Math.min(st,t.startedAt);});
    (entriesOn(sel)||[]).forEach(x=>{const r=String(x.ref||"");if(r.startsWith("tasks:")&&ids.has(r.slice(6)))(x.sessions||[]).forEach(se=>{if(se.start&&minsOf(se.start)>=from-60)st=st==null?se.start:Math.min(st,se.start);});});
    if(st){const late=minsOf(st)-from;return el("div",{class:"late-l"+(late>10?" late":"")},"Planned "+t12(b.from)+" · started "+hhmm(st)+(late>10?" · "+dur(late)+" late":" · on time"));}
    if(nowM>from+10&&nowM<hmMin(b.to)&&b.tasks.some(t=>!t.done))return el("div",{class:"late-l late"},"Not started · "+dur(nowM-from)+" late");return null;}
  function fit3(b){if(b.kind!=="work")return null;const today=iso(new Date()),nowM=new Date().getHours()*60+new Date().getMinutes(),open=b.tasks.filter(t=>!t.done);if(!open.length)return null;
    const st0=sel===today?Math.max(nowM,hmMin(b.from)):hmMin(b.from),left=Math.max(0,hmMin(b.to)-st0-prayersOn(sel).filter(x=>x>=st0&&x<hmMin(b.to)).length*PRAY_MIN);let acc=0;const over=[];open.forEach(t=>{acc+=estMin(t);if(acc>left)over.push(t);});if(!over.length)return null;
    return el("div",{class:"fit",role:"status"},el("div",{class:"fit-t"},over.length+" task"+(over.length>1?"s":"")+" won't fit before "+t12(b.to)+". About "+dur(acc)+" of work, "+dur(left)+" left."),
      el("ul",{class:"fit-l"},...over.map(t=>el("li",{},el("span",{class:"fit-n",text:t.title}),
        el("button",{type:"button",class:"mini",onclick:()=>{tEdit=t.id;render();}},"Shrink"),
        el("button",{type:"button",class:"mini",onclick:()=>{patchTask(t.id,{block:5});toast("Moved to your next buffer");}},"Buffer"),
        el("button",{type:"button",class:"mini danger",onclick:()=>{patchTask(t.id,{cut:true});toast("Cut. Undo is on the bar below");}},"Cut")))));}
  renderDayBlocks=function(box,ts){
    if(!state.loaded.tasks){rc(box,el("div",{class:"empty",text:"Loading tasks..."}));return;}
    const L=log(sel),notes=L.blockNotes||{},today=iso(new Date()),nowM=new Date().getHours()*60+new Date().getMinutes();
    if(railDay!==sel){for(const k in railOpen)delete railOpen[k];for(const k in railDone)delete railDone[k];railDay=sel;}
    const items=assign(sel,layout(sel,planOf(sel),true),ts),timed=ts.filter(t=>tAt(t)!=null&&!t.done);
    const openOf=b=>b.kind==="quran"?MORNING.filter(([k])=>!(L.morning||{})[k]).length:b.kind==="gym"?(gSessions().some(s=>s.date===sel)?0:1):b.tasks.filter(t=>!t.done).length+(COMMS[b.pid]&&!commsDone(b.pid)&&sel===today&&nowM>=hmMin(b.from)&&nowM<hmMin(b.to)?1:0);
    const cand=items.filter(b=>openOf(b)>0&&b.kind!=="family");let fb=null;
    if(cand.length){if(sel!==today)fb=cand[0].pid;else{const nw=cand.find(b=>nowM>=hmMin(b.from)&&nowM<hmMin(b.to)),pw=cand.find(b=>hmMin(b.to)<=nowM&&(b.kind==="work"||b.kind==="buffer")),nx=cand.find(b=>hmMin(b.from)>nowM);fb=(nw||pw||nx||cand[0]).pid;}}
    const rows=items.map(b=>({at:hmMin(b.from),b}));timed.forEach(t=>rows.push({at:tAt(t),t}));rows.push({at:hmMin(DAY_END)+1,end:true});rows.sort((x,y)=>x.at-y.at||(x.t?1:-1));
    const lis=rows.map(r=>{
      if(r.end)return el("li",{class:"rl rl-thin rl-fixed"},el("span",{class:"rl-t num",text:t12(DAY_END)}),el("span",{class:"rl-dot","aria-hidden":"true"}),el("div",{class:"rl-b"},el("span",{class:"rl-name",text:"Sleep"}),el("span",{class:"hint",text:"Hard stop"})));
      if(r.t){const t=r.t,s=r.at,e=s+estMin(t),now=sel===today&&nowM>=s&&nowM<e,past=sel===today&&nowM>=e;
        return el("li",{class:"rl rl-block rl-task"+(now?" now":"")+(past?" past":"")},el("span",{class:"rl-t num",text:t12(xmm(s))}),el("span",{class:"rl-dot","aria-hidden":"true"}),
          el("div",{class:"rl-b"},el("ul",{class:"tasks db-list"},withTime(taskRow(t,false),t,s,true))));}
      const b=r.b,s=hmMin(b.from),e=hmMin(b.to),now=sel===today&&nowM>=s&&nowM<e,past=sel===today&&nowM>=e,mine=b.tasks,openN=openOf(b),total=b.kind==="quran"?3:b.kind==="gym"?1:mine.length;
      const isOpen=railOpen[b.pid]!==undefined?railOpen[b.pid]:b.pid===fb,tog=()=>{if(Date.now()-dragEnded<400)return;railOpen[b.pid]=!isOpen;render();};
      const cls="rl k-"+b.kind+(b.kind==="work"&&b.holds!=="design"?" k-batch":"")+(isOpen?" rl-block":" rl-thin rl-min")+(now?" now":"")+(past?" past":"")+(total&&openN===0?" alldone":"");
      const td=[el("span",{class:"rl-t num",text:t12(b.from)}),el("span",{class:"rl-dot","aria-hidden":"true"})];
      if(!isOpen){const h=Math.max(COMMS[b.pid]?24:16,Math.round(b.len*0.55)),work=b.kind==="work",nowPct=now?Math.round((nowM-s)/b.len*100):null;
        const lab=work?[el("span",{class:"sl-name",text:b.name}),el("span",{class:"sl-sub num",text:(total?(openN===0?"Done":openN+" open")+" · ":"")+dur(b.work)+(b.prayAdd?" + "+b.prayAdd+"m prayer":"")})]
          :h>=22?[el("span",{class:"sl-tag",text:b.name+(b.shrunk?" · "+dur(b.len)+", shortened by your late start":"")+(COMMS[b.pid]?(b.pid==="x3"?" · ":" · messages ")+(commsDone(b.pid)?"done":COMMS[b.pid][1]+"m"):"")+(b.kind==="buffer"&&mine.length?" · "+mine.filter(t=>!t.done).length+" task":"")})]:[];
        return el("li",{class:cls+" slab-row","data-pid":b.pid},el("span",{class:"rl-t num"+(work?"":" faint"),text:work||h>=22?t12(b.from):""}),
          el("button",{type:"button",class:"slab s-"+b.kind+(b.kind==="work"&&b.holds!=="design"?" s-batch":"")+(total&&openN===0?" done":""),style:"height:"+h+"px","aria-expanded":"false","aria-label":b.name+", "+t12(b.from)+" to "+t12(b.to),onclick:tog},...lab,
            nowPct!=null?el("span",{class:"sl-now",style:"top:"+nowPct+"%","aria-hidden":"true"}):null));}
      const showDone=!!railDone[b.pid],doneTs=mine.filter(t=>t.done),shown=showDone?mine:mine.filter(t=>!t.done);
      let cur=Math.max(s,sel===today&&now?nowM:0);const ul=el("ul",{class:"tasks db-list"},...shown.map(t=>{if(t.done)return taskRow(t,false);const st=cur;cur+=estMin(t);return withTime(taskRow(t,false),t,st,false);}));
      const mdone=b.kind==="quran"?3-openN:0,fm=b.kind==="work"?itemFocus(b):0,pct=b.len?Math.min(100,fm/b.len*100):0;
      const head=el("div",{class:"rl-head"},el("span",{class:"rl-name big",text:b.name}),
        el("button",{type:"button",class:"rl-len num","aria-expanded":String(pEdit===b.pid),"aria-label":"Change "+b.name+" length",onclick:ev=>{ev.stopPropagation();pEdit=pEdit===b.pid?null:b.pid;render();}},t12(b.from)+" to "+t12(b.to)+" · "+(b.kind==="work"?dur(b.work)+(b.prayAdd?" + "+b.prayAdd+"m prayer":""):dur(b.len))),
        total&&b.kind!=="gym"?el("span",{class:"rl-count num",text:(total-openN)+"/"+total}):null,
        el("button",{type:"button",class:"rl-chev-b","aria-expanded":"true","aria-label":"Collapse "+b.name,onclick:tog},el("span",{class:"rl-chev up","aria-hidden":"true"})));
      return el("li",{class:cls,"data-pid":b.pid,role:"group","aria-label":b.name+", "+t12(b.from)+" to "+t12(b.to)},...td,
        el("div",{class:"rl-b"},head,pEdit===b.pid?planEditor(b):null,commsRow(b),b.note&&b.kind==="buffer"?el("div",{class:"db-sub",text:b.note}):null,lateLine3(b),fit3(b),
          b.kind==="work"?el("div",{class:"db-bar"},el("div",{class:"track",role:"img","aria-label":"Focus "+dur(fm)+" of "+dur(b.len)},el("div",{class:"fill"+(pct>=100?" good":""),style:"width:"+pct+"%"})),el("span",{class:"hint num",text:"Focus "+dur(fm)+" / "+dur(b.len)})):null,
          b.kind==="quran"?morningRow(showDone):null,b.kind==="quran"&&mdone?el("button",{type:"button",class:"rl-donebtn",onclick:()=>{railDone[b.pid]=!showDone;render();}},(showDone?"Hide ":"Show ")+mdone+" done"):null,
          b.kind==="gym"?gymMini():null,shown.length?ul:null,
          doneTs.length?el("button",{type:"button",class:"rl-donebtn",onclick:()=>{railDone[b.pid]=!showDone;render();}},(showDone?"Hide ":"Show ")+doneTs.length+" done"):null,
          b.kind==="work"&&!mine.length?el("div",{class:"rl-emptyw"},el("span",{class:"hint",text:"Nothing planned."}),el("button",{type:"button",class:"mini",onclick:()=>addInto(b.holds==="design"?2:1)},"+ Add")):null,
          b.kind==="work"?inl(el("span",{class:"db-note",text:notes[b.n]||""}),{value:notes[b.n]||"",label:"insight for "+b.name,empty:"+ Add an insight",onSave:v=>setBlockNote(sel,b.n,v)}):null));});
    const ol=el("ol",{class:"rail",id:"rail"},...lis);attachDrag(ol);
    rc(box,dayBar2(sel,items),!ts.length&&isFriday(sel)?el("div",{class:"empty",text:"Friday is off. Do the 30-minute weekly review, then rest."}):null,ol,
      el("p",{class:"hint rail-tip",text:"Press and hold a block to move it. Tap its time to resize."}));};
  workBlockOrder=function(){return [2,3,5];};

  // ===== 8 Nov: Today = tasks, Capture, habits, Day log (compact); voice notes; LinkedIn page =====
  Object.assign(XI,{mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',stop:'<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>',trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    linkedin:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10.5V17M8 7.5v.01M12 17v-3.5a2.5 2.5 0 015 0V17M12 10.5V17"/>'});
  ICO.linkedin=XI.linkedin;
  (function restructureToday(){
    const pg=document.querySelector('#workView .page[data-page="today"]'),grid=pg&&pg.querySelector(".grid");if(!grid||document.getElementById("capSec"))return;
    const tasks=grid.querySelector('section[aria-labelledby="tasksH"]'),logS=document.querySelector('section[aria-labelledby="logH"]'),hab=document.querySelector('section[aria-labelledby="habH"]');
    const cap=el("section",{class:"panel cap",id:"capSec","aria-labelledby":"capH"},el("div",{class:"panel-head"},el("h2",{id:"capH",text:"Capture"}),el("span",{class:"hint",dir:"rtl",lang:"ar",text:"اكتب أو سجّل أي فكرة في ثانية، وارجع لشغلك"})),el("div",{id:"capBody"}));
    const br=document.getElementById("brQuick");if(br){br.hidden=true;cap.append(br);}
    grid.replaceChildren(...[tasks,cap,hab,logS].filter(Boolean));
  })();
  // compact Day log: 3 groups, one line per counter
  function compactDayLog(){const box=document.getElementById("counters");if(!box)return;const c=[...box.children].filter(x=>x.classList&&x.classList.contains("ctr"));if(c.length!==6)return;
    const lab=(n,t)=>{const l=n.querySelector(".label");if(l&&l.firstChild&&l.firstChild.nodeType===3)l.firstChild.data=t;};
    lab(c[0],"Worked");lab(c[1],"Learning");lab(c[2],"Posts");lab(c[3],"Drafts");lab(c[4],"Comments");lab(c[5],"Applications");
    const lw=c[1].querySelector(".wkbar");if(lw)lw.remove();
    let bank=0;try{bank=Math.max(0,bankN());}catch(e){}
    const g=(t,sub,...xs)=>el("div",{class:"cgroup"},el("div",{class:"cg-t"},t,sub?el("span",{class:"cg-s",text:sub}):null),...xs);
    box.replaceChildren(g("Hours",null,c[0],c[1]),g("LinkedIn","Bank "+bank+" ready",c[2],c[3],c[4]),g("Outreach",null,c[5]));}
  // ---------- voice notes and captures ----------
  const VOICE={};let capKind="idea",capLang="ar-EG",rec=null,recChunks=[],recStart=0,recTimer=null,recSR=null,recText="",capSig="";
  const CAPK=[["idea","Idea"],["reflection","Reflection"],["insight","Insight"],["task","Task note"],["linkedin","LinkedIn"]];
  (async()=>{try{const d=await window.claude?.use?.("db");if(!d)return;d.collection("voice").onSnapshot(s=>{for(const k in VOICE)delete VOICE[k];s.docs.forEach(x=>{VOICE[x.id]=x.data();});capSig="";renderCapture();try{if(page==="linkedin")renderLinkedIn();}catch(e){}});}catch(e){}})();
  async function startRec(){if(rec)return;let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:true});}catch(e){toast("Microphone blocked. Allow it for this app in your browser settings.");return;}
    const mt=["audio/webm;codecs=opus","audio/mp4","audio/webm"].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t))||"";
    try{rec=new MediaRecorder(stream,mt?{mimeType:mt,audioBitsPerSecond:16000}:{audioBitsPerSecond:16000});}catch(e){stream.getTracks().forEach(t=>t.stop());toast("Voice notes aren't supported in this browser.");return;}
    recChunks=[];recText="";const kind=capKind,day=sel;
    rec.ondataavailable=e=>{if(e.data&&e.data.size)recChunks.push(e.data);};
    rec.onstop=async()=>{stream.getTracks().forEach(t=>t.stop());clearInterval(recTimer);try{recSR&&recSR.stop();}catch(e){}
      const secs=Math.round((Date.now()-recStart)/1000),blob=new Blob(recChunks,{type:(rec&&rec.mimeType)||mt||"audio/webm"});rec=null;capSig="";
      if(blob.size<800||secs<1){renderCapture();return;}
      const url=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(blob);});
      setTimeout(async()=>{const id="v"+Date.now().toString(36),body={date:day,at:Date.now(),kind,secs,audio:url,text:recText.trim()};VOICE[id]=body;capSig="";renderCapture();
        try{await store.set("voice/"+id,body);toast("Voice note saved");}catch(e){toast("Couldn't save the voice note");}},400);};
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;recSR=null;
    if(SR){try{recSR=new SR();recSR.lang=capLang;recSR.continuous=true;recSR.interimResults=false;recSR.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)recText+=e.results[i][0].transcript+" ";};recSR.onerror=()=>{};recSR.start();}catch(e){recSR=null;}}
    rec.start(1000);recStart=Date.now();capSig="";renderCapture();
    recTimer=setInterval(()=>{const s=Math.round((Date.now()-recStart)/1000),t=document.getElementById("recT");if(t)t.textContent=Math.floor(s/60)+":"+String(s%60).padStart(2,"0")+" / 2:00";if(s>=120)stopRec();},500);}
  function stopRec(){try{if(rec&&rec.state!=="inactive")rec.stop();}catch(e){}}
  function delVoice(id){const prev=VOICE[id];delete VOICE[id];capSig="";renderCapture();try{if(page==="linkedin")renderLinkedIn();}catch(e){}
    store.del("voice/"+id).catch?.(()=>{});
    const b=undoBar();b.querySelector(".ub-t").textContent="Voice note deleted";b.hidden=false;clearTimeout(uTimer);uTimer=setTimeout(hideUndo,6000);
    b.querySelector(".ub-b").onclick=async()=>{VOICE[id]=prev;capSig="";renderCapture();hideUndo();try{await store.set("voice/"+id,prev);}catch(e){}b.querySelector(".ub-b").onclick=doUndo;};}
  function voiceItem(id,v){const k=(CAPK.find(x=>x[0]===v.kind)||[0,"Note"])[1];
    return el("li",{class:"vn"},el("div",{class:"vn-top"},el("span",{class:"vn-k",text:k}),el("span",{class:"hint num",text:hhmm(v.at)+(v.secs?" · "+Math.floor(v.secs/60)+":"+String(v.secs%60).padStart(2,"0"):"")}),
        el("button",{type:"button",class:"x","aria-label":"Delete voice note",onclick:()=>delVoice(id)},xico("trash"))),
      v.audio?el("audio",{controls:"",preload:"none",src:v.audio,class:"vn-a"}):null,v.text?el("p",{class:"vn-t",dir:"auto",text:v.text}):null);}
  let capDraft="";
  function capSaveText(){const i=document.getElementById("capIn");const t=(i?i.value:capDraft).trim();if(!t)return;
    if(capKind==="idea"){brAdd(t,"idea").then(ok=>{if(ok){capDraft="";if(i)i.value="";capSig="";renderCapture();toast("Idea sent to Brain");}});return;}
    const id="t"+Date.now().toString(36),body={date:sel,at:Date.now(),kind:capKind,secs:0,text:t};VOICE[id]=body;capDraft="";capSig="";renderCapture();
    store.set("voice/"+id,body).then?.(()=>toast("Saved")).catch?.(()=>toast("Couldn't save"));}
  function renderCapture(){const box=document.getElementById("capBody");if(!box)return;
    const ids=Object.keys(VOICE).filter(k=>VOICE[k].date===sel).sort((a,b)=>VOICE[b].at-VOICE[a].at),due=(()=>{try{return brDue().length;}catch(e){return 0;}})();
    const sig=sel+"|"+capKind+"|"+capLang+"|"+(rec?"r":"")+"|"+ids.join()+"|"+due;
    if(sig===capSig)return;capSig=sig;
    const kinds=el("div",{class:"cap-k",role:"group","aria-label":"What are you capturing"},...CAPK.map(([k,n])=>el("button",{type:"button",class:"cap-chip","aria-pressed":String(capKind===k),onclick:()=>{const i=document.getElementById("capIn");if(i)capDraft=i.value;capKind=k;capSig="";renderCapture();}},n)),
      due?el("button",{type:"button",class:"cap-chip cap-due",onclick:()=>{try{brReview=true;}catch(e){}setPage("brain");}},due+" to review"):null);
    let row;
    if(rec){row=el("div",{class:"cap-bar rec"},el("span",{class:"cap-dot"}),el("span",{id:"recT",class:"num cap-tm",text:"0:00 / 2:00"}),el("span",{class:"cap-rk",text:(CAPK.find(x=>x[0]===capKind)||[0,""])[1]}),
      el("button",{type:"button",class:"cap-btn stop","aria-label":"Stop and save",onclick:stopRec},xico("stop")));}
    else{const inp=el("input",{id:"capIn",dir:"auto",placeholder:"Type, or tap the mic","aria-label":"Capture",value:capDraft,
        oninput:e=>{capDraft=e.target.value;const s=!!capDraft.trim();sb.hidden=!s;mb.hidden=s;},onkeydown:e=>{if(e.key==="Enter"){e.preventDefault();capSaveText();}}});
      const has=!!capDraft.trim();
      const sb=el("button",{type:"button",class:"cap-btn send","aria-label":"Save",onclick:capSaveText,hidden:has?null:""},xico("check"));
      const mb=el("button",{type:"button",class:"cap-btn mic","aria-label":"Record a voice note",onclick:startRec,hidden:has?"":null},xico("mic"));
      const lang=el("button",{type:"button",class:"cap-lang","aria-label":"Voice language",title:"Voice language",onclick:()=>{const i=document.getElementById("capIn");if(i)capDraft=i.value;capLang=capLang==="ar-EG"?"en-US":"ar-EG";capSig="";renderCapture();}},capLang==="ar-EG"?"ع":"EN");
      row=el("div",{class:"cap-bar"},inp,lang,sb,mb);}
    rc(box,kinds,row,ids.length?el("ul",{class:"vn-list"},...ids.slice(0,5).map(id=>voiceItem(id,VOICE[id]))):null);}
  // ---------- LinkedIn page ----------
  const LIP={};
  (async()=>{try{const d=await window.claude?.use?.("db");if(!d)return;d.collection("liposts").onSnapshot(s=>{for(const k in LIP)delete LIP[k];s.docs.forEach(x=>{LIP[x.id]=x.data();});if(page==="linkedin")renderLinkedIn();});}catch(e){}})();
  (function addLinkedInPage(){const tp=document.querySelector('#workView .page[data-page="today"]');if(!tp||document.querySelector('.page[data-page="linkedin"]'))return;
    tp.parentNode.insertBefore(el("div",{class:"page","data-page":"linkedin","aria-label":"LinkedIn",hidden:""},el("div",{id:"liBody"})),tp.nextSibling);
    HUBS.splice(1,0,{id:"linkedin",name:"LinkedIn",ico:"linkedin",pages:[["linkedin","LinkedIn"]]});})();
  function liSave(id,patch){LIP[id]={...LIP[id],...patch};renderLinkedIn();store.set("liposts/"+id,LIP[id]).catch?.(()=>{});}
  function renderLinkedIn(){const box=document.getElementById("liBody");if(!box)return;const sp=sprintFor(sel);let bank=0;try{bank=Math.max(0,bankN());}catch(e){}
    const pub=sumLogs(START,sel,"posts"),com=sumLogs(START,sel,"comments"),app=sumLogs(START,sel,"applications");
    const tile=(n,v,goal)=>el("div",{class:"li-tile"},el("span",{class:"li-v num",text:String(v)+(goal!=null?" / "+goal:"")}),el("span",{class:"hint",text:n}));
    const posts=Object.entries(LIP).sort((a,b)=>(b[1].date||"").localeCompare(a[1].date||""));
    const live=posts.filter(([,p])=>p.status==="published"&&Number(p.impressions)>0),avg=live.length?Math.round(live.reduce((s,[,p])=>s+Number(p.impressions||0),0)/live.length):0;
    const best=live.slice().sort((a,b)=>Number(b[1].impressions||0)-Number(a[1].impressions||0))[0];
    const ramp=sp.n<=1?0:sp.n===2?3:sp.n<=4?5:7;
    const num=(id,p,k,label)=>inl(el("span",{class:"li-n num",text:String(p[k]||0)}),{value:p[k]||0,label,type:"number",min:0,step:1,onSave:v=>liSave(id,{[k]:Number(v)||0})});
    const STAT=[["idea","Idea"],["draft","Draft"],["scheduled","Scheduled"],["published","Live"]];
    const row=([id,p])=>el("li",{class:"li-post"},el("div",{class:"li-top"},inl(el("span",{class:"li-title",text:p.title||"Untitled"}),{value:p.title||"",label:"post title",onSave:v=>liSave(id,{title:v})}),
        el("select",{class:"li-st","aria-label":"Status",onchange:e=>liSave(id,{status:e.target.value,date:e.target.value==="published"&&p.status!=="published"?iso(new Date()):p.date})},...STAT.map(([k,n])=>{const o=el("option",{value:k,text:n});if(p.status===k)o.selected=true;return o;}))),
      el("div",{class:"li-m hint"},el("span",{class:"num",text:p.date||""}),p.status==="published"?el("span",{class:"li-ms"},num(id,p,"impressions","impressions")," views · ",num(id,p,"reactions","reactions")," reactions · ",num(id,p,"comments","comments")," comments"):null));
    const ti=el("input",{placeholder:"New post idea or draft title","aria-label":"Post title"});
    const add=el("form",{class:"add li-add",onsubmit:e=>{e.preventDefault();const t=ti.value.trim();if(!t)return;const id="p"+Date.now().toString(36);LIP[id]={title:t,status:"draft",date:iso(new Date()),at:Date.now()};renderLinkedIn();store.set("liposts/"+id,LIP[id]).catch?.(()=>{});ti.value="";}},ti,el("button",{class:"btn",type:"submit"},"Add"));
    const notes=Object.keys(VOICE).filter(k=>VOICE[k].kind==="linkedin").sort((a,b)=>VOICE[b].at-VOICE[a].at).slice(0,6);
    rc(box,
      el("section",{class:"panel"},el("div",{class:"panel-head"},el("h2",{text:"LinkedIn"}),el("span",{class:"hint",text:"Sprint "+sp.n+" · comments "+ramp+" a day"})),
        el("div",{class:"li-tiles"},tile("Published",pub,sp.posts),tile("Bank ready",bank,5),tile("Comments",com,sp.comments),tile("Applications",app,sp.applications)),
        live.length?el("p",{class:"li-ins"},"Average ",el("b",{text:avg.toLocaleString()})," views per post",best?[" · best: ",el("b",{text:best[1].title})," (",String(best[1].impressions)," views)"]:null):el("p",{class:"hint",text:"Mark posts Published and add their views. Insights appear here."})),
      el("section",{class:"panel"},el("div",{class:"panel-head"},el("h2",{text:"Posts"}),el("span",{class:"hint",text:posts.length+" tracked"})),add,posts.length?el("ul",{class:"li-list"},...posts.map(row)):el("p",{class:"hint",text:"Add your bank drafts here to track them from idea to published."})),
      el("section",{class:"panel"},el("div",{class:"panel-head"},el("h2",{text:"LinkedIn insights"}),el("span",{class:"hint",text:"Record them in Capture with LinkedIn selected"})),
        notes.length?el("ul",{class:"vn-list"},...notes.map(id=>voiceItem(id,VOICE[id]))):el("p",{class:"hint",text:"No LinkedIn insights yet."})));}
  {const _r2=render;render=function(){_r2();try{compactDayLog();}catch(e){}try{renderCapture();}catch(e){}try{if(page==="linkedin")renderLinkedIn();}catch(e){}};}

  // ---------- 8 Nov: Finance (work money only): recurring payments, money in and out, things to buy ----------
  const FIN={},FLOG={},BUY={};let finOpen=null;
  const REP=[["0","One time"],["1","Monthly"],["3","Every 3 months"],["6","Every 6 months"],["12","Yearly"],["d","Every X days"]];
  function repLabel(f){return f.repDays>0?"Every "+f.repDays+" days":(REP.find(r=>r[0]===String(f.rep||0))||REP[0])[1];}
  function finShift(d,rep,rd,sign){if(!d)return "";if(rd>0)return addDays(d,sign*rd);if(rep>0)return addMonths(d,sign*rep);return "";}
  function addDays(isoD,n){const t=new Date(isoD+"T00:00");t.setDate(t.getDate()+n);return iso(t);}
  (async()=>{try{const d=await window.claude?.use?.("db");if(!d)return;
    const sub=(c,o)=>d.collection(c).onSnapshot(s=>{for(const k in o)delete o[k];s.docs.forEach(x=>{o[x.id]=x.data();});if(page==="finance")renderFinance();try{renderFinDue();}catch(e){}if(c!=="buy")finSyncAll();});
    sub("fin",FIN);sub("finlog",FLOG);sub("buy",BUY);}catch(e){}})();
  (function addFinancePage(){const tp=document.querySelector('#workView .page[data-page="today"]');if(!tp||document.querySelector('.page[data-page="finance"]'))return;
    tp.parentNode.append(el("div",{class:"page","data-page":"finance","aria-label":"Finance",hidden:""},el("div",{id:"finBody"})));
    const more=HUBS.find(h=>h.id==="more");if(more&&!more.pages.some(x=>x[0]==="finance"))more.pages.splice(more.pages.length-1,0,["finance","Finance"]);})();
  function finSave(col,o,id,v){if(v)o[id]=v;else delete o[id];renderFinance();try{sheetRefresh();}catch(e){}try{renderFinDue();}catch(e){}if(v)store.set(col+"/"+id,v).catch?.(()=>{});else store.del(col+"/"+id).catch?.(()=>{});}
  function addMonths(isoD,n){const [y,m,d]=isoD.split("-").map(Number);const t=new Date(y,m-1+n,1),last=new Date(t.getFullYear(),t.getMonth()+1,0).getDate();t.setDate(Math.min(d,last));return iso(t);}
  function daysTo(isoD){const a=new Date(iso(new Date())+"T00:00"),b=new Date(isoD+"T00:00");return Math.round((b-a)/864e5);}
  const CURS=["EGP","USD","EUR","USDT"];
  let finHide=false;try{finHide=localStorage.getItem("sb-finhide")==="1";}catch(e){}
  function money(n,c){const v=Number(n)||0,s=finHide?"••••••":v.toLocaleString(undefined,{maximumFractionDigits:2});c=c||"EGP";return c==="USD"?"$"+s:c==="EUR"?"€"+s:s+" "+c;}
  function finHideToggle(){finHide=!finHide;try{localStorage.setItem("sb-finhide",finHide?"1":"0");}catch(e){}renderFinance();try{renderFinDue();}catch(e){}try{sheetRefresh();}catch(e){}}
  function finTypes(){return [...new Set([...Object.values(FIN).map(x=>x.type),...Object.values(FLOG).map(x=>x.type)].filter(Boolean))].sort();}
  function payItem(id){const f=FIN[id];if(!f)return;const lid="l"+Date.now().toString(36),today=iso(new Date());
    finSave("finlog",FLOG,lid,{date:today,name:f.name,type:f.type||"",amount:Number(f.amount)||0,cur:f.cur||"EGP",dir:f.dir||"out",item:id,acct:f.acct||"",excl:!!f.excl,at:Date.now()});
    const rep=Number(f.rep||0),rd=Number(f.repDays||0),base=f.next&&f.next<=today?f.next:(f.next||today);
    finSave("fin",FIN,id,(rep||rd)?{...f,next:rd?addDays(base,rd):addMonths(base,rep),lastPaid:today}:{...f,lastPaid:today,done:true});toast(f.name+" logged as paid");}
  // keep History in step with each payment's Last paid date (no manual logging needed)
  function finSyncLog(id,o){if(!o||!o.lastPaid||(o.dir||"out")!=="out")return;
    const logs=Object.entries(FLOG).filter(([,l])=>l.item===id).sort((a,b)=>(b[1].date||"").localeCompare(a[1].date||""));
    if(logs.some(([,l])=>l.date===o.lastPaid))return;const latest=logs[0];
    if(latest&&(latest[1].date||"")>o.lastPaid){finSave("finlog",FLOG,latest[0],{...latest[1],date:o.lastPaid});return;}
    finSave("finlog",FLOG,"l"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),{date:o.lastPaid,name:o.name,type:o.type||"",amount:Number(o.amount)||0,cur:o.cur||"EGP",dir:"out",item:id,excl:!!o.excl,at:Date.now(),auto:true});}
  let finSynced=false,finSyncT=null;
  function finSyncAll(){if(finSynced)return;clearTimeout(finSyncT);finSyncT=setTimeout(()=>{if(finSynced||!Object.keys(FIN).length)return;finSynced=true;
    Object.entries(FIN).forEach(([id,f])=>{if(f.done)return;let o=f;if(!o.lastPaid&&o.next&&isRec(o)){const l=finShift(o.next,Number(o.rep)||0,Number(o.repDays)||0,-1);if(l&&l<=iso(new Date())){o={...o,lastPaid:l};finSave("fin",FIN,id,o);}}finSyncLog(id,o);});},2500);}
  function dueList(){return Object.entries(FIN).filter(([,f])=>!f.done&&f.next&&(f.dir||"out")==="out").map(([id,f])=>({id,...f,d:daysTo(f.next)})).sort((a,b)=>a.d-b.d);}
  // Today: a small line when a payment is due within 3 days or overdue
  function renderFinDue(){const wb=document.getElementById("workBar");if(!wb)return;let box=document.getElementById("finDue");
    const soon=dueList().filter(x=>x.d<=3);if(!soon.length){if(box)box.remove();return;}
    if(!box){box=el("div",{id:"finDue",class:"fin-due"});wb.after(box);}
    rc(box,...soon.slice(0,3).map(x=>el("button",{type:"button",class:"fin-due-i"+(x.d<0?" late":""),onclick:()=>setPage("finance")},el("b",{text:x.name}),el("span",{text:" "+(x.d<0?Math.abs(x.d)+" days overdue":x.d===0?"due today":x.d===1?"due tomorrow":"due in "+x.d+" days")+" · "+money(x.amount,x.cur)}))));}
  // ---------- shared ps-sheet (pop-up page), usable on any page ----------
  let sheetStack=[];
  function psOpen(title,build,opt){opt=opt||{};psClose(true);
    const body=el("div",{class:"ps-sh-body"});
    const panel=el("div",{class:"ps-sheet",role:"dialog","aria-modal":"true","aria-label":title},
      el("div",{class:"ps-sh-grab","aria-hidden":"true"}),
      el("div",{class:"ps-sh-head"},el("h2",{text:title}),el("button",{type:"button",class:"ps-sh-x","aria-label":"Close",onclick:()=>psClose()},xico("x"))),body);
    const wrap=el("div",{class:"ps-sheet-wrap",onclick:e=>{if(e.target===wrap)psClose();}},panel);
    document.body.append(wrap);document.body.classList.add("ps-sheet-open");
    const re=()=>{try{rc(body,...[].concat(build(re)).filter(Boolean));}catch(e){console.warn(e);}};re();
    sheetStack=[{wrap,re,title,onClose:opt.onClose}];requestAnimationFrame(()=>wrap.classList.add("in"));
    const f=panel.querySelector("input,select,button:not(.ps-sh-x)");if(f&&opt.focus)f.focus();return re;}
  function psClose(now){const s=sheetStack.pop();if(!s)return;try{s.onClose&&s.onClose();}catch(e){}document.body.classList.remove("ps-sheet-open");if(now){s.wrap.remove();return;}s.wrap.classList.remove("in");setTimeout(()=>s.wrap.remove(),220);}
  function sheetRefresh(){const s=sheetStack[sheetStack.length-1];if(s)s.re();}
  addEventListener("keydown",e=>{if(e.key==="Escape"&&sheetStack.length)psClose();});
  if(!XI.x)XI.x='<path d="M6 6l12 12M18 6L6 18"/>';
  if(!XI.plus)XI.plus='<path d="M12 5v14M5 12h14"/>';
  // ---------- Finance, minimal: budget chart on top, option cards, everything else in sheets ----------
  function finCfg(){return (state.settings&&state.settings.finance)||{};}
  function finCfgSave(v){const doc={...finCfg(),...v,at:Date.now()};state.settings={...state.settings,finance:doc};try{store.set("settings/finance",doc);}catch(e){}renderFinance();sheetRefresh();}
  // ---------- 8 Nov: live exchange rate, accounts, encrypted details vault ----------
  let liveRate=null;(function(){try{const c=JSON.parse(localStorage.getItem("sb-fx2")||"null");if(c&&c.r)liveRate=c;}catch(e){}
    const stale=!liveRate||Date.now()-liveRate.t>3*3600e3;if(!stale)return;
    const o={credentials:"omit",referrerPolicy:"no-referrer",cache:"no-store"};
    Promise.all([fetch("https://open.er-api.com/v6/latest/USD",o).then(r=>r.json()).catch(()=>null),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd",o).then(r=>r.json()).catch(()=>null)]).then(([fx,cg])=>{
      const R=fx&&fx.rates;if(!R||!(R.EGP>1&&R.EGP<1000))return;const t=cg&&cg.tether&&Number(cg.tether.usd);
      liveRate={r:Number(R.EGP),rates:{USD:1,EGP:Number(R.EGP),EUR:Number(R.EUR)||0,USDT:t>0.8&&t<1.2?1/t:1},t:Date.now(),usdt:!!(t>0.8&&t<1.2)};
      try{localStorage.setItem("sb-fx2",JSON.stringify(liveRate));}catch(e){}if(page==="finance")renderFinance();});})();
  function fxRate(){return (liveRate&&liveRate.r)||Number(finCfg().rate)||0;}
  function perUSD(c){c=c||"EGP";if(c==="USD")return 1;if(liveRate&&liveRate.rates&&liveRate.rates[c])return liveRate.rates[c];if(c==="USDT")return 1;if(c==="EGP")return Number(finCfg().rate)||0;return 0;}
  const ACC={},VAULT={};
  (async()=>{try{const d=await window.claude?.use?.("db");if(!d)return;
    d.collection("acct").onSnapshot(s=>{for(const k in ACC)delete ACC[k];s.docs.forEach(x=>{ACC[x.id]=x.data();});if(page==="finance")renderFinance();try{sheetRefresh();}catch(e){}});
    d.collection("vault").onSnapshot(s=>{for(const k in VAULT)delete VAULT[k];s.docs.forEach(x=>{VAULT[x.id]=x.data();});});}catch(e){}})();
  function conv(a,from,to){a=Number(a)||0;from=from||"EGP";to=to||"EGP";if(from===to)return a;const f=perUSD(from),t=perUSD(to);if(!f||!t)return null;return a/f*t;}
  function logParts(l){const its=l.items||[];if(its.length&&its.some(x=>x.d))return its.map(x=>({date:x.d||l.date||"",a:Number(x.a)||0}));return [{date:l.date||"",a:Number(l.amount)||0}];}
  function parseAmt(s){s=String(s==null?"":s).replace(/,/g,"").trim();const m2=s.match(/^(-?[\d.]+)\s*(?:-|to|–|الى|إلى)\s*([\d.]+)$/i);if(m2){const a=Number(m2[1]),b=Number(m2[2]);return {a:Math.min(a,b),b:Math.max(a,b)};}const n=Number(s);return {a:isNaN(n)?0:n,b:null};}
  function amtTxt(a,b,c){return b!=null&&b!==a?money(a,c)+" to "+money(b,c):money(a,c);}
  function shortD(d){return d?new Date(d+"T00:00").toLocaleDateString("en",{day:"numeric",month:"short"}):"";}
  function accBal(id){const a=ACC[id];if(!a)return 0;let b=Number(a.bal)||0;const today=iso(new Date()),asD=iso(new Date(a.asOf||0));Object.values(FLOG).forEach(l=>{if(l.acct!==id||l.excl)return;const dated=l.items&&l.items.some(x=>x.d);
      if(!dated&&(l.at||0)<=(a.asOf||0))return;logParts(l).forEach(p=>{if(p.date>today)return;if(dated&&(p.date<asD||(p.date===asD&&(l.at||0)<=(a.asOf||0))))return;const v=conv(p.a,l.cur,a.cur);if(v==null)return;b+=l.dir==="in"?v:-v;});});return b;}
  function accTotal(base){let t=0,miss=0;Object.keys(ACC).forEach(id=>{const v=conv(accBal(id),ACC[id].cur,base);if(v==null)miss++;else t+=v;});return {t,miss,n:Object.keys(ACC).length};}
  function accSelect(v,k){const s=el("select",{onchange:e=>{v[k]=e.target.value;}},el("option",{value:"",text:"No account"}),...Object.entries(ACC).map(([id,a])=>el("option",{value:id,text:a.name+" ("+(a.cur||"EGP")+")"})));s.value=v[k]||"";return s;}
  function accountsSheet(){psOpen("Accounts",re=>{const base=finCfg().cur||"EGP",tot=accTotal(base),other=base==="EGP"?"USD":"EGP",ox=conv(tot.t,base,other);
    return [el("div",{class:"acc-head"},el("div",{},el("span",{class:"hint",text:"Your budget"}),el("div",{class:"fh-big num",text:money(Math.round(tot.t),base)}),ox!=null?el("span",{class:"hint num",text:"≈ "+money(Math.round(ox),other)+(tot.miss?" · some not converted":"")}):null),
        el("div",{class:"seg"},...["EGP","USD"].map(c=>el("button",{type:"button","aria-pressed":String(base===c),onclick:()=>{finCfgSave({cur:c});re();}},c)))),
      el("ul",{class:"ps-sh-list"},...Object.entries(ACC).map(([id,a])=>el("li",{},el("button",{type:"button",class:"ps-sh-row",onclick:()=>accForm(id)},el("span",{class:"sr-m"},el("b",{text:a.name}),el("span",{class:"hint",text:(a.kind||"Account")+" · "+(a.cur||"EGP")})),el("span",{class:"num sr-r",text:money(Math.round(accBal(id)*100)/100,a.cur)}))))),
      el("button",{type:"button",class:"btn",onclick:()=>accForm(null)},"Add account"),
      el("p",{class:"hint",text:"Set each balance once. After that, money in, money out and paid items linked to an account update it by themselves."})];});}
  function accForm(id){const a=id?{...ACC[id]}:{name:"",kind:"Bank",cur:"EGP",bal:""};const v={...a,bal:id?Math.round(accBal(id)*100)/100:""};
    const vi=()=>vItems?vItems.find(x=>x.acct===id):null;v.info=id&&vKey&&vi()?vi().value:"";let err="",pass="";
    psOpen(id?a.name:"New account",re=>{const n=el("input",{value:v.name,placeholder:"e.g. CIB, Payoneer, Cash",oninput:e=>v.name=e.target.value}),k=el("input",{value:v.kind||"",list:"accKinds",oninput:e=>v.kind=e.target.value});
      const c=el("select",{onchange:e=>v.cur=e.target.value},...CURS.map(x=>el("option",{value:x,text:x})));c.value=v.cur||"EGP";
      const b=el("input",{type:"number",step:"0.01",inputmode:"decimal",value:v.bal,oninput:e=>v.bal=e.target.value});
      const hasInfo=id&&VAULT.main&&!vKey&&(VAULT.main.accts||[]).includes(id);
      const info=vKey?el("textarea",{rows:2,placeholder:"IBAN, account number, branch...",autocomplete:"off",oninput:e=>v.info=e.target.value},v.info||""):
        el("div",{class:"acc-lock"},el("span",{class:"hint",text:hasInfo?"Saved and encrypted. Enter your passphrase to see or edit it.":(VAULT.main?"Enter your passphrase to add account info.":"Create a passphrase to add account info. It is encrypted on this device.")}),
          el("input",{type:"password",autocomplete:"off",placeholder:"Passphrase",oninput:e=>pass=e.target.value,onkeydown:e=>{if(e.key==="Enter")unlock();}}),el("button",{type:"button",class:"btn ghost",onclick:()=>unlock()},"Unlock"));
      async function unlock(){err="";try{await vUnlock(pass);vTouch();const it=vi();v.info=it?it.value:"";}catch(e){err=e&&e.message&&e.message.startsWith("Use")?e.message:"Wrong passphrase.";}re();}
      return [el("datalist",{id:"accKinds"},...["Bank","Wallet","Cash","Payoneer","InstaPay","Crypto"].map(x=>el("option",{value:x}))),
        el("div",{class:"ps-sh-form"},fl("Account name",n),fl("Type",k),fl("Currency",c),fl("Balance now",b)),
        el("div",{class:"ps-sh-sec"},el("span",{class:"label",text:"Account info (encrypted)"}),info),
        err?el("p",{class:"fin-warn",text:err}):null,
        el("div",{class:"ps-sh-acts"},el("button",{type:"button",class:"btn ps-sh-main",onclick:async()=>{if(!String(v.name).trim())return;
            const nid=id||("a"+Date.now().toString(36)),info=String(v.info||"").trim();
            if(vKey&&info&&(luhn(info.replace(/[^0-9]/g," ").split(" ").sort((x,y)=>y.length-x.length)[0]||"")||/cvv|cvc|password|\bpin\b/i.test(info))){err="Card numbers, CVV, PINs and passwords are never stored here.";re();return;}
            const o={name:String(v.name).trim(),kind:String(v.kind||"").trim(),cur:v.cur||"EGP",bal:Number(v.bal)||0,asOf:Date.now()};
            ACC[nid]=o;store.set("acct/"+nid,o).catch?.(()=>{});
            if(vKey){const i=vItems.findIndex(x=>x.acct===nid);if(info){const it={label:o.name+" account info",value:info,acct:nid};if(i>=0)vItems[i]=it;else vItems.push(it);}else if(i>=0)vItems.splice(i,1);
              VAULT.main=VAULT.main||{};await vSaveAcc();}
            psClose();renderFinance();toast("Saved");}},"Save"),
          id?el("button",{type:"button",class:"btn ghost",onclick:async()=>{delete ACC[id];store.del("acct/"+id).catch?.(()=>{});if(vKey){const i=vItems.findIndex(x=>x.acct===id);if(i>=0){vItems.splice(i,1);await vSaveAcc();}}psClose();renderFinance();toast("Deleted");}},"Delete"):null)];});}
  async function vSaveAcc(){await vSave();}
  // details vault: encrypted on this device with your passphrase before it is saved. Nobody else can read it, including the database
  const V_BLOCK=/card|cvv|cvc|pin\b|password|passcode|otp|كلمة|سر|بطاقة/i;
  function luhn(s){const d=s.replace(/\D/g,"");if(d.length<13||d.length>19)return false;let sum=0,alt=false;for(let i=d.length-1;i>=0;i--){let n=+d[i];if(alt){n*=2;if(n>9)n-=9;}sum+=n;alt=!alt;}return sum%10===0;}
  let vKey=null,vItems=null,vTimer=null;const enc=new TextEncoder(),dec=new TextDecoder();
  const b64=u=>btoa(String.fromCharCode(...new Uint8Array(u))),ub64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  async function vDerive(pass,salt){const k=await crypto.subtle.importKey("raw",enc.encode(pass),"PBKDF2",false,["deriveKey"]);return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:310000,hash:"SHA-256"},k,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);}
  function vLock(){vKey=null;vItems=null;clearTimeout(vTimer);}
  function vTouch(){clearTimeout(vTimer);vTimer=setTimeout(()=>{vLock();try{if(sheetStack.length&&sheetStack[0].title==="My details")psClose();}catch(e){}toast("Details locked");},5*60e3);}
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&vKey){vLock();try{if(sheetStack.length&&sheetStack[0].title==="My details")psClose(true);}catch(e){}}});
  async function vSave(){const m=VAULT.main||{};const salt=m.salt?ub64(m.salt):crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
    const ct=await crypto.subtle.encrypt({name:"AES-GCM",iv},vKey,enc.encode(JSON.stringify(vItems)));const doc={v:1,salt:b64(salt),iv:b64(iv),ct:b64(ct),n:vItems.length,accts:vItems.filter(x=>x.acct).map(x=>x.acct),at:Date.now()};VAULT.main=doc;await store.set("vault/main",doc);}
  async function vUnlock(pass){const m=VAULT.main;if(!m){if(pass.length<10)throw new Error("Use at least 10 characters.");const salt=crypto.getRandomValues(new Uint8Array(16));vKey=await vDerive(pass,salt);vItems=[];VAULT.main={salt:b64(salt)};await vSave();return;}
    const key=await vDerive(pass,ub64(m.salt));const pt=await crypto.subtle.decrypt({name:"AES-GCM",iv:ub64(m.iv)},key,ub64(m.ct));vKey=key;vItems=JSON.parse(dec.decode(pt));}
  function detailsSheet(){let err="",reveal={},adding=false;const nv={label:"",value:""};
    psOpen("My details",re=>{
      if(!vKey){const p=el("input",{type:"password",autocomplete:"off",placeholder:VAULT.main?"Your passphrase":"Create a passphrase (10+ characters)"});
        const go=async()=>{err="";try{await vUnlock(p.value);vTouch();}catch(e){err=e&&e.message&&e.message.startsWith("Use")?e.message:"Wrong passphrase.";}re();};
        p.addEventListener("keydown",e=>{if(e.key==="Enter")go();});setTimeout(()=>p.focus(),200);
        return [el("p",{class:"hint",text:VAULT.main?"Locked. Enter your passphrase to see your details.":"Your details are encrypted on this device before they are saved. Only your passphrase opens them. If you forget it, they cannot be recovered."}),
          fl("Passphrase",p),err?el("p",{class:"fin-warn",text:err}):null,el("button",{type:"button",class:"btn ps-sh-main",onclick:go},VAULT.main?"Unlock":"Create and unlock")];}
      vTouch();const PRE=["Account holder name","Bank name","IBAN","Account number","SWIFT / BIC","Branch","InstaPay address","Payoneer email","Tax ID"];
      const rows=vItems.map((it,i)=>el("li",{class:"ps-sh-hrow"},el("span",{class:"sr-m"},el("span",{class:"hint",text:it.label}),el("b",{class:"num v-val",text:reveal[i]?it.value:(it.value.length>4?"•••• "+it.value.slice(-4):"••••")})),
        el("button",{type:"button",class:"btn ghost",onclick:()=>{reveal[i]=!reveal[i];re();}},reveal[i]?"Hide":"Show"),
        el("button",{type:"button",class:"btn ghost",onclick:async()=>{try{await navigator.clipboard.writeText(it.value);toast("Copied. Clears in 30 seconds");setTimeout(()=>{navigator.clipboard.writeText("").catch(()=>{});},30000);}catch(e){toast("Copy not allowed here");}}},"Copy"),
        el("button",{type:"button",class:"x","aria-label":"Delete",onclick:async()=>{vItems.splice(i,1);await vSave();re();}},xico("trash"))));
      const lab=el("input",{value:nv.label,placeholder:"Label",list:"vPre",oninput:e=>nv.label=e.target.value}),val=el("input",{value:nv.value,placeholder:"Value",autocomplete:"off",oninput:e=>nv.value=e.target.value});
      return [el("ul",{class:"ps-sh-list"},...rows),
        el("datalist",{id:"vPre"},...PRE.map(x=>el("option",{value:x}))),
        el("div",{class:"ps-sh-form"},fl("Label",lab),fl("Value",val)),
        err?el("p",{class:"fin-warn",text:err}):null,
        el("div",{class:"ps-sh-acts"},el("button",{type:"button",class:"btn ps-sh-main",onclick:async()=>{err="";const L=nv.label.trim(),Vv=nv.value.trim();if(!L||!Vv)return;
            if(V_BLOCK.test(L)||luhn(Vv)){err="Card numbers, CVV, PINs and passwords are never stored here. Keep them in your bank app or a password manager.";re();return;}
            vItems.push({label:L,value:Vv});nv.label=nv.value="";await vSave();re();toast("Saved, encrypted");}},"Add"),
          el("button",{type:"button",class:"btn ghost",onclick:()=>{vLock();psClose();toast("Locked");}},"Lock")),
        el("p",{class:"hint",text:"Encrypted with AES-256 on this device. Locks after 5 minutes or when you leave the app."})];});}
  function toBase(a,c){return conv(a,c,finCfg().cur||"EGP");}
  function isRec(f){return Number(f.rep||0)>0||Number(f.repDays||0)>0;}
  function finKind(f){return isRec(f)?"Recurring":"One time";}
  function monthKey(d){return (d||"").slice(0,7);}
  function finStats(){const cfg=finCfg(),base=cfg.cur||"EGP",since=cfg.since||"0000";let inn=0,out=0,skipped=0;
    const today=iso(new Date());Object.values(FLOG).forEach(l=>{if(l.excl)return;logParts(l).forEach(p=>{if(p.date<since||p.date>today)return;const v=toBase(p.a,l.cur);if(v==null){skipped++;return;}if(l.dir==="in")inn+=v;else out+=v;});});
    return {base,budget:Number(cfg.budget)||0,inn,out,left:(Number(cfg.budget)||0)+inn-out,skipped};}
  let finSelM=null;
  function finChart(){const now=new Date(),months=[];for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.push(iso(d).slice(0,7));}
    const base=finCfg().cur||"EGP";
    const data=months.map(m=>{let i=0,o=0,n=0;Object.values(FLOG).forEach(l=>{let hit=false;logParts(l).forEach(p=>{if(monthKey(p.date)!==m)return;const v=toBase(p.a,l.cur);if(v==null)return;hit=true;if(l.dir==="in")i+=v;else o+=v;});if(hit)n++;});return {m,i,o,n};});
    const max=Math.max(1,...data.map(d=>Math.max(d.i,d.o)));if(!finSelM||!months.includes(finSelM))finSelM=months[5];
    const nm=k=>new Date(k+"-01T00:00").toLocaleString("en",{month:"short"}),full=k=>new Date(k+"-01T00:00").toLocaleString("en",{month:"long",year:"numeric"});
    const cols=data.map(d=>el("button",{type:"button",class:"fc-col"+(d.m===finSelM?" sel":""),"aria-pressed":String(d.m===finSelM),"aria-label":full(d.m)+": out "+money(Math.round(d.o),base)+", in "+money(Math.round(d.i),base),
        onclick:()=>{finSelM=d.m;renderFinance();}},
      el("span",{class:"fc-bars"},el("span",{class:"fc-b out",style:"height:"+Math.max(2,d.o/max*100)+"%"}),el("span",{class:"fc-b in",style:"height:"+Math.max(2,d.i/max*100)+"%"})),
      el("span",{class:"fc-l",text:nm(d.m)})));
    const s=data.find(d=>d.m===finSelM),net=s.i-s.o;
    const det=el("div",{class:"fc-det"},el("b",{text:full(s.m)}),
      el("span",{class:"num"},"In ",el("b",{text:money(Math.round(s.i),base)})),el("span",{class:"num"},"Out ",el("b",{text:money(Math.round(s.o),base)})),
      el("span",{class:"num"+(net<0?" neg":"")},"Net ",el("b",{text:(net<0?"-":"+")+money(Math.round(Math.abs(net)),base)})),
      el("button",{type:"button",class:"btn ghost fc-go",onclick:()=>historySheet(s.m)},s.n?"See "+s.n+(s.n===1?" entry":" entries"):"Open history"));
    return el("div",{class:"fin-chart"},el("div",{class:"fc-cols",role:"group","aria-label":"Money in and out, last 6 months. Tap a month for details."},...cols),det);}
  Object.assign(XI,{
    eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff:'<path d="M3 3l18 18"/><path d="M10.6 5.6A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.7M6.3 6.9A16 16 0 0 0 2.5 12S6 18.5 12 18.5a9.4 9.4 0 0 0 4.1-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    fcal:'<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    fhist:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    frep:'<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
    fbag:'<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    fbank:'<path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
    flock:'<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    fpen:'<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
    fbook:'<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v16H6.5A1.5 1.5 0 0 0 5 20.5v-16z"/><path d="M5 20.5A1.5 1.5 0 0 0 6.5 22H19"/>'});
  function renderFinance(){const box=document.getElementById("finBody");if(!box)return;const st=finStats(),cfg=finCfg();
    const due=dueList(),soon=due.filter(x=>x.d<=7),mon=iso(new Date()).slice(0,7),mlogs=Object.values(FLOG).filter(l=>logParts(l).some(p=>monthKey(p.date)===mon));
    const buy=Object.values(BUY).filter(b=>!b.done),rec=Object.values(FIN).filter(f=>!f.done);
    const at=accTotal(st.base),hasAcc=at.n>0,cash=hasAcc?at.t:0;
    const hero=el("section",{class:"panel fin-hero"},
      el("div",{class:"fh-row"},el("button",{type:"button",class:"fh-eye","aria-label":finHide?"Show amounts":"Hide amounts","aria-pressed":String(finHide),onclick:()=>finHideToggle()},xico(finHide?"eyeoff":"eye")),el("button",{type:"button",class:"fh-top",onclick:()=>accountsSheet(),"aria-label":"Open accounts"},el("div",{},el("span",{class:"hint",text:hasAcc?"Your budget: all accounts now":"Add your bank accounts to start"}),
          el("div",{class:"fh-big num"+(cash<0?" neg":""),text:hasAcc?money(Math.round(cash),st.base):"--"}),(()=>{const o=st.base==="EGP"?"USD":"EGP",x=conv(cash,st.base,o);return hasAcc&&x!=null?el("span",{class:"hint num",text:"≈ "+money(Math.round(x),o)}):null;})()),
        el("span",{class:"fh-go",text:hasAcc?at.n+(at.n===1?" account":" accounts"):"Add"}))),
      (()=>{let need=0,unk=0;due.filter(x=>x.d<=30).forEach(x=>{const v=toBase(x.amount,x.cur);if(v==null)unk++;else need+=v;});const after=cash-need,n=due[0];
        const t=!hasAcc?"Bottom line: add your bank accounts so the app can tell you if you can cover what is coming.":
          (after<0?"Bottom line: you are short "+money(Math.round(-after),st.base)+" for the next 30 days.":"Bottom line: after the next 30 days of payments you keep "+money(Math.round(after),st.base)+".")+(n?" Next: "+n.name+(n.d<0?", overdue":n.d===0?", today":", in "+n.d+" days")+".":"")+(unk?" "+unk+" payment in another currency not counted.":"");
        return el("p",{class:"fh-bl"+(hasAcc&&after<0?" neg":""),text:t});})(),
      finChart(),el("div",{class:"fh-leg"},el("span",{class:"lg out"},"Out"),el("span",{class:"lg in"},"In"),el("span",{class:"hint fx",text:fxRate()?"1 USD = "+fxRate().toFixed(2)+" EGP"+(perUSD("EUR")?" · 1 EUR = "+(1/perUSD("EUR")).toFixed(2)+" USD":"")+" · 1 USDT = "+(1/perUSD("USDT")).toFixed(3)+" USD"+(liveRate?" · live "+new Date(liveRate.t).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}):" · your rate"):"Rates unavailable offline"}),st.skipped?el("span",{class:"hint",text:st.skipped+" not converted"}):null));
    const card=(t,v,sub,fn,warn,ic)=>el("button",{type:"button",class:"fin-card"+(warn?" warn":""),onclick:fn},ic?el("span",{class:"fc-ic"},xico(ic)):null,el("span",{class:"fc-t",text:t}),el("span",{class:"fc-v num",text:v}),el("span",{class:"hint",text:sub}));
    const next=due[0];
    const cards=el("div",{class:"fin-cards"},
      card("Upcoming",String(due.length),next?next.name+(next.d<0?" overdue":next.d===0?" today":" in "+next.d+"d"):"Nothing due",()=>upcomingSheet(),due.some(x=>x.d<=3),"fcal"),
      card("History",String(mlogs.length),"This month",()=>historySheet(),false,"fhist"),
      card("Accounts",String(at.n),"",()=>accountsSheet(),false,"fbank"),
      card("More","","",()=>psOpen("More",()=>[el("ul",{class:"ps-sh-list"},...[["Payments",paymentsSheet],["To buy",buySheet],["My details",detailsSheet]].map(([n,fn])=>el("li",{},el("button",{type:"button",class:"ps-sh-row",onclick:()=>{psClose();setTimeout(fn,200);}},el("span",{class:"sr-m"},el("b",{text:n})),el("span",{class:"nf-go","aria-hidden":"true"},xico("chev"))))))]),false,"frep"));
    rc(box,hero,cards);
    let fab=document.getElementById("finFab");if(!fab){fab=el("button",{type:"button",id:"finFab",class:"fin-fab","aria-label":"Add",onclick:()=>addSheet()},xico("plus"),el("span",{text:"Add"}));document.body.append(fab);}}
  {const _sp8=setPage;setPage=function(p,...a){const r=_sp8(p,...a);const f=document.getElementById("finFab");if(f)f.hidden=p!=="finance";return r;};}
  // sheets
  function budgetSheet(){psOpen("Budget",()=>{const c=finCfg();const b=el("input",{type:"number",min:0,step:"0.01",value:c.budget||"",inputmode:"decimal"}),cu=el("select",{},...CURS.map(x=>el("option",{value:x,text:x})));cu.value=c.cur||"EGP";
    const r=el("input",{type:"number",min:0,step:"0.01",value:c.rate||"",placeholder:"e.g. 50",inputmode:"decimal"}),s=el("input",{type:"date",value:c.since||iso(new Date())});
    return [el("div",{class:"ps-sh-form"},fl("Current budget",b),fl("Currency",cu),fl("1 USD in EGP",r),fl("Counting from",s)),
      el("p",{class:"hint",text:"Every payment and income logged from this date adds to or takes from this budget."}),
      el("button",{type:"button",class:"btn ps-sh-main",onclick:()=>{finCfgSave({budget:Number(b.value)||0,cur:cu.value,rate:Number(r.value)||0,since:s.value||iso(new Date())});psClose();toast("Budget saved");}},"Save")];});}
  function fl(t,n){return el("label",{class:"ps-sh-f"},el("span",{class:"label",text:t}),n);}
  function catChips(cur,onPick){const types=finTypes();return el("div",{class:"ps-sh-chips"},...types.map(t=>el("button",{type:"button",class:"chip-b","aria-pressed":String(cur===t),onclick:()=>onPick(t)},t)));}
  function addSheet(){psOpen("Add",()=>[el("div",{class:"add-grid"},
      ...[["rec","Recurring payment","Subscription or bill that repeats"],["due","Payment to make","One time, with a date"],["out","Money out","Already spent"],["in","Money in","Income or payment received"],["buy","To buy","Remember it for when you have money"]]
      .map(([k,t,s])=>el("button",{type:"button",class:"add-opt",onclick:()=>k==="buy"?buyForm():k==="out"||k==="in"?moneyForm(k):payForm(null,k)},el("b",{text:t}),el("span",{class:"hint",text:s}))))]);}
  function payForm(id,kind){const f=id?{...FIN[id]}:{name:"",type:kind==="rec"?"Subscription":"",amount:"",cur:"EGP",dir:"out",rep:kind==="rec"?1:0,repDays:0,lastPaid:"",next:""};
    const v={...f,rep:f.repDays>0?"d":String(f.rep||0)};
    psOpen(id?f.name:(kind==="rec"?"New recurring payment":"New payment to make"),re=>{
      const name=el("input",{value:v.name,placeholder:"Name",oninput:e=>v.name=e.target.value});
      const type=el("input",{value:v.type||"",placeholder:"Category, or type a new one",list:"finTypesG",oninput:e=>v.type=e.target.value});
      const amt=el("input",{type:"number",min:0,step:"0.01",value:v.amount||"",inputmode:"decimal",oninput:e=>v.amount=e.target.value});
      const cur=el("select",{onchange:e=>v.cur=e.target.value},...CURS.map(x=>el("option",{value:x,text:x})));cur.value=v.cur||"EGP";
      const rp=el("select",{onchange:e=>{v.rep=e.target.value;re();}},...REP.map(([a,b])=>el("option",{value:a,text:b})));rp.value=v.rep;
      const rd=el("input",{type:"number",min:1,step:1,value:v.repDays||"",placeholder:"Days",inputmode:"numeric",oninput:e=>{v.repDays=e.target.value;sync("last");}});
      const lp=el("input",{type:"date",value:v.lastPaid||"",oninput:e=>{v.lastPaid=e.target.value;sync("last");}}),nx=el("input",{type:"date",value:v.next||"",oninput:e=>{v.next=e.target.value;sync("next");}});
      const per=()=>[v.rep==="d"?0:Number(v.rep)||0,v.rep==="d"?Number(v.repDays)||0:0];
      function sync(from){const [a,b]=per();if(from==="last"&&v.lastPaid){const n=finShift(v.lastPaid,a,b,1);if(n){v.next=n;nx.value=n;}}else if(from==="next"&&v.next){const l=finShift(v.next,a,b,-1);if(l){v.lastPaid=l;lp.value=l;}}}
      const rec=v.rep!=="0";
      const hist=id?Object.values(FLOG).filter(l=>l.item===id).sort((a,b)=>b.at-a.at).slice(0,5):[];
      return [el("datalist",{id:"finTypesG"},...finTypes().map(t=>el("option",{value:t}))),
        el("div",{class:"ps-sh-form"},fl("Name",name),fl("Category",type),fl("Amount",amt),fl("Currency",cur),fl("Repeats",rp),v.rep==="d"?fl("Every how many days",rd):null,rec?fl("Last paid",lp):null,fl(rec?"Next pay":"Pay by",nx),fl("Pay from",accSelect(v,"acct"))),inBudget(v),
        catChips(v.type,t=>{v.type=t;type.value=t;}),
        el("div",{class:"ps-sh-acts"},el("button",{type:"button",class:"btn ps-sh-main",onclick:()=>{if(!String(v.name).trim()){name.focus();return;}const [a,b]=per();
            const o={...f,name:String(v.name).trim(),type:String(v.type||"").trim(),amount:Number(v.amount)||0,cur:v.cur||"EGP",dir:"out",rep:a,repDays:b,lastPaid:v.lastPaid||"",next:v.next||"",acct:v.acct||"",excl:!!v.excl,at:f.at||Date.now()};
            if(!o.next&&o.lastPaid)o.next=finShift(o.lastPaid,a,b,1);if(!o.lastPaid&&o.next&&(a||b))o.lastPaid=finShift(o.next,a,b,-1);
            const nid=id||("f"+Date.now().toString(36));finSave("fin",FIN,nid,o);finSyncLog(nid,o);psClose();toast("Saved");}},"Save"),
          id?el("button",{type:"button",class:"btn ghost",onclick:()=>{payItem(id);psClose();}},"Paid now"):null,
          id?el("button",{type:"button",class:"btn ghost",onclick:()=>{finSave("fin",FIN,id,null);psClose();toast("Deleted");}},"Delete"):null),
        hist.length?el("div",{class:"ps-sh-sec"},el("span",{class:"label",text:"Paid before"}),el("ul",{class:"ps-sh-list"},...hist.map(l=>el("li",{},el("span",{class:"num",text:l.date}),el("span",{class:"num",text:money(l.amount,l.cur)}))))):null];});}
  function inBudget(v){const b=el("button",{type:"button",class:"bud-t","aria-pressed":String(!v.excl),onclick:()=>{v.excl=!v.excl;b.setAttribute("aria-pressed",String(!v.excl));t.textContent=v.excl?"Not counted in your budget or account balance":"Counted in your budget and account balance";}},el("span",{class:"bud-sw"}),el("span",{text:"Count in budget"}));
    const t=el("span",{class:"hint",text:v.excl?"Not counted in your budget or account balance":"Counted in your budget and account balance"});return el("div",{class:"bud-row"},b,t);}
  function moneyForm(dir,id){const L=id?FLOG[id]:null;if(L)dir=L.dir==="in"?"in":"out";
    const v=L?{name:L.name||"",type:L.type||"",amount:L.amount2!=null&&L.amount2!==L.amount?L.amount+"-"+L.amount2:(L.amount||""),cur:L.cur||"EGP",date:L.date||iso(new Date()),acct:L.acct||"",items:(L.items||[]).map(x=>({n:x.n,d:x.d||"",a:x.a2!=null&&x.a2!==x.a?x.a+"-"+x.a2:x.a})),excl:!!L.excl}
      :{name:"",type:"",amount:"",cur:finCfg().cur||"EGP",date:iso(new Date()),acct:Object.keys(ACC)[0]||"",items:[],excl:false};
    const tot=()=>{let a=0,b=0,r=false;v.items.forEach(x=>{const p=parseAmt(x.a);a+=p.a;b+=p.b!=null?p.b:p.a;if(p.b!=null)r=true;});return {a:Math.round(a*100)/100,b:r?Math.round(b*100)/100:null};};
    const span=()=>{const ds=v.items.map(x=>x.d).filter(Boolean).sort();return ds.length?{from:ds[0],to:ds[ds.length-1]}:null;};
    psOpen(L?(L.name||"Entry"):(dir==="in"?"Money in":"Money out"),re=>{const name=el("input",{value:v.name,placeholder:"What",oninput:e=>v.name=e.target.value}),type=el("input",{placeholder:"Category",list:"finTypesG",value:v.type,oninput:e=>v.type=e.target.value});
      const split=v.items.length>0,T=tot(),S=span();
      const amt=el("input",{type:"text",inputmode:"decimal",placeholder:"e.g. 500 or 1000-2000",value:split?(T.b!=null?T.a+"-"+T.b:T.a):v.amount,readonly:split?"":null,oninput:e=>v.amount=e.target.value}),cur=el("select",{onchange:e=>{v.cur=e.target.value;if(split)re();}},...CURS.map(x=>el("option",{value:x,text:x})));cur.value=v.cur;
      const d=S?el("input",{type:"text",readonly:"",value:S.from===S.to?shortD(S.from):shortD(S.from)+" to "+shortD(S.to)}):el("input",{type:"date",value:v.date,oninput:e=>v.date=e.target.value});
      const total=el("span",{class:"num it-tot",text:amtTxt(T.a,T.b,v.cur)});
      const upd=()=>{const t=tot();amt.value=t.b!=null?t.a+"-"+t.b:t.a;total.textContent=amtTxt(t.a,t.b,v.cur);};
      const line=(x,i)=>el("div",{class:"it-row it-row3"},
        el("input",{value:x.n||"",placeholder:"Item",oninput:e=>{x.n=e.target.value;}}),
        el("input",{type:"date",value:x.d||"","aria-label":"Item date",onchange:e=>{x.d=e.target.value;v.items.sort((p,q)=>(p.d||"9").localeCompare(q.d||"9"));re();}}),
        el("input",{type:"text",inputmode:"decimal",value:x.a!=null?x.a:"",placeholder:"Amount or 1000-2000",oninput:e=>{x.a=e.target.value;upd();}}),
        el("button",{type:"button",class:"x","aria-label":"Remove item",onclick:()=>{v.items.splice(i,1);if(!v.items.length)v.amount="";re();}},xico("trash")));
      const items=split?el("div",{class:"ps-sh-sec it-box"},el("span",{class:"label",text:"Items, by date"}),...v.items.map(line),
          el("div",{class:"it-foot"},el("button",{type:"button",class:"btn ghost",onclick:()=>{const last=v.items[v.items.length-1];v.items.push({n:"",d:"",a:""});re();setTimeout(()=>{const r=document.querySelectorAll(".it-row input");if(r.length)r[r.length-3].focus();},50);}},"Add item"),el("span",{},"Total ",total))):
        el("button",{type:"button",class:"btn ghost it-open",onclick:()=>{v.items=v.amount?[{n:v.name||"",d:v.date,a:v.amount},{n:"",d:"",a:""}]:[{n:"",d:v.date,a:""}];re();}},"Split into items");
      return [el("datalist",{id:"finTypesG"},...finTypes().map(t=>el("option",{value:t}))),el("div",{class:"ps-sh-form"},fl("What",name),fl("Category",type),fl(split?"Amount (sum of items)":"Amount",amt),fl("Currency",cur),fl(S?"Dates (from items)":"Date",d),fl(dir==="in"?"Into account":"From account",accSelect(v,"acct"))),inBudget(v),items,catChips(v.type,t=>{v.type=t;type.value=t;}),
        el("p",{class:"hint",text:"Items with a future date count when that date arrives. For a range, the lower amount is counted."}),
        el("div",{class:"ps-sh-acts"},el("button",{type:"button",class:"btn ps-sh-main",onclick:()=>{
            const its=v.items.filter(x=>String(x.n||"").trim()||String(x.a||"").trim()).map(x=>{const p=parseAmt(x.a),o={n:String(x.n||"").trim(),a:p.a};if(p.b!=null)o.a2=p.b;if(x.d)o.d=x.d;return o;}).sort((p,q)=>(p.d||"9").localeCompare(q.d||"9"));
            let amount,amount2=null;if(its.length){amount=Math.round(its.reduce((s,x)=>s+x.a,0)*100)/100;if(its.some(x=>x.a2!=null))amount2=Math.round(its.reduce((s,x)=>s+(x.a2!=null?x.a2:x.a),0)*100)/100;}else{const p=parseAmt(v.amount);amount=p.a;amount2=p.b;}
            const nm=v.name.trim()||(its[0]&&its[0].n)||"";if(!nm||!(amount||amount2))return;const ds=its.map(x=>x.d).filter(Boolean);
            const o={...(L||{}),date:ds.length?ds[0]:(v.date||iso(new Date())),name:nm,type:v.type.trim(),amount,cur:v.cur,dir,acct:v.acct||"",at:L?L.at:Date.now()};
            if(amount2!=null)o.amount2=amount2;else delete o.amount2;if(ds.length>1&&ds[ds.length-1]!==ds[0])o.dateTo=ds[ds.length-1];else delete o.dateTo;
            if(its.length){o.items=its;if(!its.some(x=>x.d))o.items=its;}else delete o.items;if(v.excl)o.excl=true;else delete o.excl;
            finSave("finlog",FLOG,id||("l"+Date.now().toString(36)),o);psClose();toast(L?"Saved":"Logged");}},L?"Save":"Log"),
          L?el("button",{type:"button",class:"btn ghost",onclick:()=>{finSave("finlog",FLOG,id,null);psClose();toast("Deleted");}},"Delete"):null)];});}
  function buyForm(){const v={name:"",price:"",pri:1};psOpen("To buy",()=>{const n=el("input",{placeholder:"What you need",oninput:e=>v.name=e.target.value}),p=el("input",{type:"number",min:0,step:"0.01",inputmode:"decimal",oninput:e=>v.price=e.target.value});
      const pr=el("div",{class:"seg"},el("button",{type:"button","aria-pressed":String(v.pri===1),onclick:e=>{v.pri=1;pr.children[0].setAttribute("aria-pressed","true");pr.children[1].setAttribute("aria-pressed","false");}},"Must have"),el("button",{type:"button","aria-pressed":String(v.pri===2),onclick:()=>{v.pri=2;pr.children[1].setAttribute("aria-pressed","true");pr.children[0].setAttribute("aria-pressed","false");}},"Nice to have"));
      return [el("div",{class:"ps-sh-form"},fl("Item",n),fl("Price (EGP)",p)),pr,el("div",{class:"ps-sh-acts"},el("button",{type:"button",class:"btn ps-sh-main",onclick:()=>{if(!v.name.trim())return;finSave("buy",BUY,"b"+Date.now().toString(36),{name:v.name.trim(),price:Number(v.price)||0,pri:v.pri,at:Date.now()});psClose();toast("Added");}},"Add"))];});}
  function rowBtn(main,sub,right,fn,cls){return el("li",{},el("button",{type:"button",class:"ps-sh-row"+(cls?" "+cls:""),onclick:fn},el("span",{class:"sr-m"},el("b",{text:main}),el("span",{class:"hint",text:sub})),el("span",{class:"num sr-r",text:right})));}
  function upcomingSheet(){psOpen("Upcoming",()=>{const due=dueList(),nd=Object.entries(FIN).filter(([,f])=>!f.done&&!f.next);const need={};due.filter(x=>x.d<=30).forEach(x=>{need[x.cur||"EGP"]=(need[x.cur||"EGP"]||0)+(Number(x.amount)||0);});
    return [el("p",{class:"ps-sh-sum",text:"Next 30 days: "+(Object.keys(need).length?Object.entries(need).map(([c,v])=>money(v,c)).join(" + "):"nothing")}),
      due.length?el("ul",{class:"ps-sh-list"},...due.map(x=>el("li",{class:"ps-sh-due"+(x.d<0?" late":x.d<=3?" soon":"")},el("button",{type:"button",class:"ps-sh-row",onclick:()=>payForm(x.id)},el("span",{class:"sr-m"},el("b",{text:x.name}),el("span",{class:"hint",text:(x.type||finKind(x))+" · "+(x.d<0?Math.abs(x.d)+" days overdue":x.d===0?"today":x.d===1?"tomorrow":x.next)})),el("span",{class:"num sr-r",text:money(x.amount,x.cur)})),
        el("button",{type:"button",class:"btn ps-sh-paid",onclick:()=>{payItem(x.id);sheetRefresh();}},"Paid")))):el("p",{class:"hint",text:"Nothing scheduled."}),
      nd.length?el("div",{class:"ps-sh-sec"},el("span",{class:"label",text:"Needs a date"}),el("ul",{class:"ps-sh-list"},...nd.map(([id,f])=>rowBtn(f.name,f.type||finKind(f),money(f.amount,f.cur),()=>payForm(id))))):null];});}
  function paymentsSheet(){let cat="All";psOpen("Payments",re=>{const all=Object.entries(FIN).filter(([,f])=>!f.done),cats=["All",...new Set(all.map(([,f])=>f.type||"Other"))];
    const list=all.filter(([,f])=>cat==="All"||(f.type||"Other")===cat).sort((a,b)=>String(a[1].next||"9").localeCompare(String(b[1].next||"9")));
    return [el("div",{class:"ps-sh-chips"},...cats.map(c=>el("button",{type:"button",class:"chip-b","aria-pressed":String(c===cat),onclick:()=>{cat=c;re();}},c))),
      list.length?el("ul",{class:"ps-sh-list"},...list.map(([id,f])=>rowBtn(f.name,(f.type||"Other")+" · "+repLabel(f)+(f.next?" · next "+f.next:""),money(f.amount,f.cur),()=>payForm(id)))):el("p",{class:"hint",text:"Nothing here. Use Add."})];});}
  function historySheet(mk){let cat="All",range="month";const mon=mk||iso(new Date()).slice(0,7),monName=new Date(mon+"-01T00:00").toLocaleString("en",{month:"long"});psOpen("History",re=>{const logs=Object.entries(FLOG).filter(([,l])=>range==="all"||logParts(l).some(p=>monthKey(p.date)===mon));
    const cats=["All",...new Set(logs.map(([,l])=>l.type||"Other"))],shown=logs.filter(([,l])=>cat==="All"||(l.type||"Other")===cat).sort((a,b)=>((b[1].dateTo||b[1].date)||"").localeCompare((a[1].dateTo||a[1].date)||"")||b[1].at-a[1].at);
    const byCat={};logs.forEach(([,l])=>{if(l.dir==="in")return;logParts(l).forEach(p=>{if(range!=="all"&&monthKey(p.date)!==mon)return;const v=toBase(p.a,l.cur);if(v==null)return;const k=l.type||"Other";byCat[k]=(byCat[k]||0)+v;});});
    const tot=Object.values(byCat).reduce((a,b)=>a+b,0),base=finCfg().cur||"EGP",bars=Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
    return [el("div",{class:"seg ps-sh-range"},el("button",{type:"button","aria-pressed":String(range==="month"),onclick:()=>{range="month";cat="All";re();}},mk&&mk!==iso(new Date()).slice(0,7)?monName:"This month"),el("button",{type:"button","aria-pressed":String(range==="all"),onclick:()=>{range="all";cat="All";re();}},"All time")),
      bars.length?el("div",{class:"ps-sh-sec"},el("span",{class:"label",text:"Spent by category · "+money(Math.round(tot),base)}),...bars.map(([k,v])=>el("div",{class:"cat-bar"},el("span",{class:"cb-n",text:k}),el("span",{class:"cb-t"},el("span",{class:"cb-f",style:"width:"+Math.round(v/tot*100)+"%"})),el("span",{class:"num cb-v",text:Math.round(v/tot*100)+"%"})))):null,
      el("div",{class:"ps-sh-chips"},...cats.map(c=>el("button",{type:"button",class:"chip-b","aria-pressed":String(c===cat),onclick:()=>{cat=c;re();}},c))),
      shown.length?el("ul",{class:"ps-sh-list"},...shown.map(([id,l])=>el("li",{class:"ps-sh-hrow",onclick:e=>{if(e.target.closest(".x"))return;moneyForm(l.dir,id);}},el("span",{class:"num hint",text:l.dateTo?shortD(l.date)+" to "+shortD(l.dateTo):((l.date||"").slice(0,4)===iso(new Date()).slice(0,4)?shortD(l.date):(l.date||""))}),el("span",{class:"sr-m"},el("b",{text:l.name}),el("span",{class:"hint",text:(l.type||"Other")+(l.auto?" · from Last paid":"")+(l.excl?" · not in budget":"")+(l.items&&l.items.length?" · "+l.items.map(x=>(x.n||"Item")+" "+(x.a2!=null?x.a+"-"+x.a2:x.a)+(x.d?" ("+shortD(x.d)+")":"")).join(", "):"")})),el("span",{class:"num sr-r"+(l.dir==="in"?" in":""),text:(l.dir==="in"?"+":"-")+amtTxt(l.amount,l.amount2,l.cur)}),
        el("button",{type:"button",class:"x","aria-label":"Delete",onclick:()=>{finSave("finlog",FLOG,id,null);re();}},xico("trash"))))):el("p",{class:"hint",text:"Nothing logged yet."})];});}
  function buySheet(){psOpen("To buy",re=>{const list=Object.entries(BUY).filter(([,b])=>!b.done).sort((a,b)=>a[1].pri-b[1].pri||a[1].at-b[1].at),must=list.filter(([,b])=>b.pri===1).reduce((s,[,b])=>s+(Number(b.price)||0),0);
    return [el("p",{class:"ps-sh-sum",text:list.length?"Must haves: "+money(must,"EGP"):"Your list is empty."}),
      el("ul",{class:"ps-sh-list"},...list.map(([id,b])=>el("li",{class:"ps-sh-hrow"+(b.pri===1?" must":"")},el("button",{type:"button",class:"chk","aria-label":"Bought",onclick:()=>{finSave("buy",BUY,id,{...b,done:true,doneAt:iso(new Date())});re();toast("Bought");}}),el("span",{class:"sr-m"},el("b",{text:b.name}),el("span",{class:"hint",text:b.pri===1?"Must have":"Nice to have"})),el("span",{class:"num sr-r",text:b.price?money(b.price,"EGP"):""}),
        el("button",{type:"button",class:"x","aria-label":"Delete",onclick:()=>{finSave("buy",BUY,id,null);re();}},xico("trash"))))),
      el("button",{type:"button",class:"btn ghost",onclick:()=>buyForm()},"Add item")];});}
  {const _r7=render;render=function(){_r7();try{renderFinDue();if(page==="finance")renderFinance();}catch(e){console.warn(e);}};}
  {const _sp7=setPage;setPage=function(p,...a){const r=_sp7(p,...a);try{if(p==="finance")renderFinance();}catch(e){}return r;};}
  // 8 Nov: Capture and Day log open as pop-ups from two small cards on Today
  let popOpen=null;
  function popHold(){let h=document.getElementById("popHold");if(!h){h=el("div",{id:"popHold",hidden:""});document.body.append(h);}return h;}
  function popSec(k){return k==="cap"?document.getElementById("capSec"):document.querySelector('section[aria-labelledby="logH"]');}
  function openPop(k){const sec=popSec(k);if(!sec)return;popOpen=k;sec.classList.add("in-pop");
    psOpen(k==="cap"?"Capture":"Day log",()=>[sec],{onClose:()=>{popOpen=null;sec.classList.remove("in-pop");popHold().append(sec);renderPopCards();}});
    if(k==="cap")setTimeout(()=>{const i=document.getElementById("capIn");if(i)i.focus();},250);}
  function renderPopCards(){const grid=document.querySelector('#workView .page[data-page="today"] .grid');if(!grid)return;
    ["cap","log"].forEach(k=>{const s=popSec(k);if(s&&popOpen!==k&&s.parentElement!==popHold())popHold().append(s);});
    let row=document.getElementById("popCards");if(!row){row=el("section",{id:"popCards",class:"pop-cards","aria-label":"Capture and day log"});}
    const hab=grid.querySelector('section[aria-labelledby="habH"]');if(row.parentElement!==grid||row.nextElementSibling!==hab)grid.insertBefore(row,hab||null);
    const today=Object.values(VOICE).filter(v=>v.date===sel).length;let due=0;try{due=brDue().length;}catch(e){}
    const ls=popSec("log"),stEl=ls&&ls.querySelector('.seg [aria-pressed="true"]'),ta=ls&&ls.querySelector("textarea"),refl=ta&&ta.value.trim();
    const card=(k,t,v,sub)=>el("button",{type:"button",class:"pop-card",onclick:()=>openPop(k)},el("span",{class:"fc-ic"},xico(k==="cap"?"fpen":"fbook")),el("span",{class:"fc-t",text:t}),el("span",{class:"pc-v",text:v}),el("span",{class:"hint",text:sub}));
    rc(row,card("cap","Capture",today?today+" today":"New",due?due+" ideas to review":"Idea, reflection, voice"),
      card("log","Day log",stEl?stEl.textContent.trim():"Normal",refl?"Reflection written":"Write today's reflection"));}
  {const _r9=render;render=function(){_r9();try{renderPopCards();}catch(e){console.warn(e);}};}
  // ---------- 8 Nov: notifications, one bell for every page ----------
  if(!XI.bell2)XI.bell2='<path d="M6 14.5v-5a6 6 0 0 1 12 0v5l1.5 2h-15L6 14.5z"/><path d="M10 19a2 2 0 0 0 4 0"/>';
  function notifSeen(){try{return JSON.parse(localStorage.getItem("sb-nseen")||"{}");}catch(e){return {};}}
  function notifMark(ids){const s=notifSeen(),t=Date.now();ids.forEach(i=>s[i]=t);for(const k in s)if(t-s[k]>14*864e5)delete s[k];try{localStorage.setItem("sb-nseen",JSON.stringify(s));}catch(e){}}
  function notifList(){const out=[],today=iso(new Date()),now=new Date(),nowM=now.getHours()*60+now.getMinutes();
    const add=(id,lvl,ico,t,sub,go)=>out.push({id,lvl,ico,t,sub,go});
    try{const sp=sprintFor(today),open=leafTasks().filter(t=>!t.done&&!t.cut&&t.date);
      const over=open.filter(t=>t.date<today&&t.date>=sp.start);if(over.length)add("ov:"+today+":"+over.length,2,"warn",over.length+(over.length===1?" objective":" objectives")+" overdue. Never miss a deadline",over.slice(0,3).map(t=>t.title).join(", "),"today");
      const tod=open.filter(t=>t.date===today);if(tod.length)add("td:"+today,0,"check",tod.length+" open "+(tod.length===1?"task":"tasks")+" today",tod.slice(0,2).map(t=>t.title).join(", "),"today");
      const dl=Math.round((new Date(sp.end+"T23:59")-now)/864e5);if(dl<=2&&dl>=0)add("sp:"+sp.end,2,"target","Sprint "+sp.n+" ends "+(dl===0?"today":dl===1?"tomorrow":"in 2 days"),"Hard deadline: goals never move to the next sprint","progress");
      const tm=open.filter(t=>t.date===iso(new Date(now.getTime()+864e5)));if(tm.length)add("tm:"+today,0,"clock",tm.length+" tasks tomorrow",tm.slice(0,2).map(t=>t.title).join(", "),"today");}catch(e){}
    try{const L=(state.logs||{})[today]||{};if(!L.workIn&&nowM>8*60&&nowM<20*60)add("li:"+today,2,"clock","Not reported for duty yet","Design starts by 8:00 AM. Log in and deploy","today");}catch(e){}
    try{dueList().filter(x=>x.d<=3).forEach(x=>add("pay:"+x.id+":"+x.next,x.d<0?2:1,"fcal",x.name+(x.d<0?" overdue":x.d===0?" due today":x.d===1?" due tomorrow":" due in "+x.d+" days"),money(x.amount,x.cur)+(x.type?" · "+x.type:""),"finance"));
      Object.values(FIN).filter(f=>!f.done&&!f.next&&(f.dir||"out")==="out").forEach(f=>add("nd:"+f.name,0,"fcal",f.name+" has no next date","Set it so the app can remind you","finance"));
      Object.entries(FLOG).forEach(([id,l])=>(l.items||[]).forEach(x=>{if(x.d===today)add("exp:"+id+x.n,1,"fbank",(l.dir==="in"?"Expected today: ":"Due today: ")+(x.n||l.name),l.name+" · "+money(x.a,l.cur),"finance");}));}catch(e){}
    try{Object.values(LIP).forEach(p=>{if(p.status==="scheduled"&&p.date===today)add("li2:"+p.title,1,"linkedin","Post goes live today","Reply to every comment in the first hour: "+p.title,"linkedin");});}catch(e){}
    try{if(now.getDay()!==5&&nowM>10*60&&nowM<21*60){const f=focusMin(today),pace=Math.min(420,420*(nowM-360)/780);if(f<pace*0.5)add("pace:"+today+":"+Math.floor(nowM/60),2,"target","Behind the mission: "+dur(f)+" of about "+dur(Math.round(pace))+" by now","The day is not finished yet. No excuses. Do it tired. Push through now, not tomorrow","today");}}catch(e){}
    try{const L=(state.logs||{})[today]||{};if(!L.gym&&now.getDay()!==5&&nowM>=17*60)add("gym:"+today,2,"mgym","Training day. No excuses","Never miss a training day. Get to the gym","gym");}catch(e){}
    return out.sort((a,b)=>b.lvl-a.lvl);}
  function notifSheet(){psOpen("Notifications",re=>{const list=notifList();notifMark(list.map(x=>x.id));setTimeout(notifBadge,0);
    return list.length?[el("ul",{class:"ps-sh-list nf-list"},...list.map(n=>el("li",{class:"nf lvl"+n.lvl},el("button",{type:"button",class:"ps-sh-row",onclick:()=>{psClose();setPage(n.go);}},
      el("span",{class:"nf-ic"},xico(n.ico)),el("span",{class:"sr-m"},el("b",{text:n.t}),el("span",{class:"hint",text:n.sub})),el("span",{class:"nf-go","aria-hidden":"true"},xico("chev")))))) ]
      :[el("p",{class:"ps-sh-sum",text:"All clear."}),el("p",{class:"hint",text:"Deadlines, late starts, payments and posts show up here."})];});}
  if(!XI.chev)XI.chev='<path d="M9 6l6 6-6 6"/>';
  function notifBadge(){const sub=document.getElementById("hubSub");if(!sub)return;let b=document.getElementById("nfBtn");
    if(!b){b=el("button",{type:"button",id:"nfBtn",class:"nf-btn","aria-label":"Notifications",onclick:()=>notifSheet()},xico("bell2"),el("span",{class:"nf-n",hidden:""}));}
    const top=document.getElementById("layTop");if(top&&b.nextElementSibling!==top)sub.insertBefore(b,top);else if(!b.parentNode)sub.append(b);
    const seen=notifSeen(),list=notifList(),n=list.filter(x=>!seen[x.id]).length,urgent=list.some(x=>!seen[x.id]&&x.lvl===2),c=b.querySelector(".nf-n");
    c.hidden=!n;c.textContent=n>9?"9+":String(n);b.classList.toggle("urgent",urgent);b.setAttribute("aria-label",n?n+" new notifications":"Notifications");}
  {const _r10=render;render=function(){_r10();try{notifBadge();}catch(e){console.warn(e);}};}
  setInterval(()=>{try{notifBadge();}catch(e){}},5*60e3);
  // icon alignment: day arrows as real icons, centered
  (function(){XI.chevL='<path d="M15 6l-6 6 6 6"/>';XI.chevR='<path d="M9 6l6 6-6 6"/>';
    [["prevDay","chevL"],["nextDay","chevR"]].forEach(([id,k])=>{const b=document.getElementById(id);if(b&&!b.querySelector(".ic"))b.replaceChildren(xico(k));});})();
  // ---------- 8 Nov: simple phone version (under 700 px). Desktop and iPad stay as they are ----------
  Object.assign(XI,{
    mtoday:'<rect x="4" y="5" width="16" height="15" rx="3.5"/><path d="M4 10h16M9 3v4M15 3v4"/><path d="M9 14.5l2 2 4-4"/>',
    mgym:'<path d="M3 10v4M6.5 7.5v9M17.5 7.5v9M21 10v4M6.5 12h11"/>',
    mmoney:'<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10.5h18"/><circle cx="16.5" cy="14.5" r="1.3"/>',
    mreview:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    mfocus:'<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 1.5M10 2.5h4M18.5 6l1.5-1.5"/>',
    mmore:'<circle cx="5.5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18.5" cy="12" r="1.4"/>'});
  const MTABS=[["today","Today","mtoday",["today"]],["gym","Gym","mgym",["gym"]],["finance","Money","mmoney",["finance"]],["progress","Review","mreview",["progress","wins","projects","learning","linkedin"]]];
  const MMORE=[["health","Sleep and habits"],["salah","Prayer"],["time","Work hours"],["linkedin","LinkedIn"],["brain","Brain"],["sounds","Sounds"],["fellow","Fellow"],["settings","Settings"]];
  let mLastReview="progress";
  function isM(){return innerWidth<700;}
  function mTab(){return MTABS.find(t=>t[3].includes(page));}
  function renderMobile(){const on=isM();document.body.classList.toggle("m1",on);if(!on){const sub=document.getElementById("hubSub"),tn=document.querySelector(".topnav");if(sub&&tn&&sub.previousElementSibling!==tn)tn.after(sub);return;}
    const tab=mTab();document.body.classList.toggle("m1-review",!!tab&&tab[0]==="progress");
    if(tab&&tab[0]==="progress"&&page!=="progress")mLastReview=page;
    // bottom bar: 4 tabs
    let nav=document.getElementById("mNav");if(!nav){nav=el("nav",{id:"mNav",class:"m-nav","aria-label":"Main"});document.body.append(nav);}
    rc(nav,...MTABS.map(([p,n,ic])=>el("button",{type:"button",class:"m-tab","aria-current":String(!!tab&&tab[0]===p?"page":"false"),onclick:()=>{if(layEdit)layToggle();setPage(p==="progress"?mLastReview:p);scrollTo(0,0);}},xico(ic),el("span",{text:n}))));
    // header: big title, bell, more
    const wv=document.getElementById("workView");let hd=document.getElementById("mHead");
    if(!hd){hd=el("header",{id:"mHead",class:"m-head",dir:"ltr"});}const gv=document.getElementById("gymView");if(gv&&hd.nextElementSibling!==gv)gv.before(hd);
    const sub0=document.getElementById("hubSub");const nl=(()=>{try{const s=notifSeen();return notifList().filter(x=>!s[x.id]);}catch(e){return [];}})();
    const title=tab?tab[1]:page==="sounds"?"Intentional media":((MMORE.find(x=>x[0]===page)||[0,"More"])[1]);
    rc(hd,el("div",{class:"m-row"},el("h1",{class:"m-title",text:title}),el("div",{class:"m-acts"},
      el("button",{type:"button",class:"m-ib","aria-label":"Focus timer",onclick:()=>{const f=document.getElementById("pomoFab");if(f)f.click();}},xico("mfocus")),
      el("button",{type:"button",class:"m-ib","aria-label":nl.length?nl.length+" notifications":"Notifications",onclick:()=>notifSheet()},xico("bell2"),nl.length?el("span",{class:"m-dot"+(nl.some(x=>x.lvl===2)?" urgent":"")}):null),
      el("button",{type:"button",class:"m-ib","aria-label":MMORE.length===1?MMORE[0][1]:"More pages",onclick:()=>MMORE.length===1?(setPage(MMORE[0][0]),scrollTo(0,0)):psOpen("More",()=>[el("ul",{class:"ps-sh-list"},...MMORE.map(([p,n])=>el("li",{},el("button",{type:"button",class:"ps-sh-row",onclick:()=>{psClose();setPage(p);scrollTo(0,0);}},el("span",{class:"sr-m"},el("b",{text:n})),el("span",{class:"nf-go","aria-hidden":"true"},xico("chev"))))))])},xico(MMORE.length===1?"cset":"mmore")))));
    // Review: section chips (Progress, Wins, Projects, Learning, LinkedIn)
    {const tn=document.querySelector(".topnav");if(sub0&&!(tab&&tab[0]==="progress")&&tn&&sub0.previousElementSibling!==tn)tn.after(sub0);}
    if(tab&&tab[0]==="progress"){const sub=sub0;if(sub&&!sub.querySelector('[data-p="linkedin"]'))sub.insertBefore(el("button",{type:"button",class:"hsub","data-p":"linkedin","aria-current":String(page==="linkedin"?"page":"false")},"LinkedIn"),sub.querySelector("#nfBtn")||null);if(sub){sub.hidden=false;hd.append(sub);}}
    if(layEdit)layToggle();}
  {const _r11=render;render=function(){_r11();try{renderMobile();}catch(e){console.warn(e);}};}
  // phone: bring the current block into view in the sideways timeline
  let railUser=0;addEventListener("touchstart",e=>{if(e.target.closest&&e.target.closest("#rail"))railUser=Date.now();},{passive:true,capture:true});
  function railFocus(){if(!document.body.classList.contains("m1")||page!=="today"||Date.now()-railUser<20000)return;const r=document.getElementById("rail");if(!r)return;
    const t=r.querySelector(".rl.now")||r.querySelector(".rl.rl-block")||r.querySelector(".rl .slab.s-work:not(.done)")?.closest(".rl");if(!t)return;
    const left=t.offsetLeft-(r.clientWidth-t.offsetWidth)/2;if(Math.abs(r.scrollLeft-left)>8)r.scrollLeft=Math.max(0,left);}
  {const _r12=render;render=function(){_r12();try{mTasksBtn();}catch(e){}};}
  let mTasksPh=null;
  function mTasksBtn(){const sec=document.querySelector('section[aria-labelledby="tasksH"]');let b=document.getElementById("mTasksOpen");if(sec&&!sec.classList.contains("in-pop")&&document.body.classList.contains("m1"))sec.scrollTop=0;
    if(!sec||sec.classList.contains("in-pop"))return;
    if(!b){b=el("button",{type:"button",id:"mTasksOpen",class:"m-tasks-open",onclick:()=>openTasksPop()},"Show all tasks");}
    if(b.previousElementSibling!==sec)sec.after(b);}
  function openTasksPop(){const sec=document.querySelector('section[aria-labelledby="tasksH"]');if(!sec)return;mTasksPh=document.createComment("tasks");sec.before(mTasksPh);sec.classList.add("in-pop");
    psOpen("Today's tasks",()=>[sec],{onClose:()=>{sec.classList.remove("in-pop");if(mTasksPh&&mTasksPh.parentNode){mTasksPh.replaceWith(sec);}mTasksPh=null;try{mTasksBtn();}catch(e){}}});}
  {const _sp11=setPage;setPage=function(p,...a){const r=_sp11(p,...a);try{renderMobile();}catch(e){}return r;};}
  addEventListener("resize",()=>{try{renderMobile();}catch(e){}});
  // 8 Nov: special forces creed, one line a day on Today and Gym
  const CREED=["Do it for your family.","Do it tired.","Be like Khalid ibn al-Walid: battle after battle, never stopping.","Spartan rule: come back with your shield, or on it.","Spartans do not negotiate with comfort.","The day is not finished yet. No excuses.","Embrace the pain.","The only easy day was yesterday.","Samurai mindset: no hesitation. Commit fully.","A samurai keeps his word. So do you.","Kill your comfort zone.","Never miss a deadline. Never miss training.","Do it for your family.","Mission first. Then rest.","Discipline is doing it when you don't feel like it.","When you think you're done, you're only at 40%.","Comfort is the enemy. Move.","No one is coming to do it for you.","Earn your rest. Every single day."];
  const CREED_AR=["اعملها عشان عيلتك","فلا نامت أعين الجبناء. خالد بن الوليد","كن زي خالد بن الوليد: معركة بعد معركة، من غير ما تقف","اعملها وانت تعبان","اليوم لسه ما خلصش. مفيش أعذار","اتقبّل الألم","روح الساموراي: من غير تردد","الساموراي بيوفي بكلمته","مفيش يوم سهل غير امبارح","اقتل منطقة الراحة","ولا يوم تمرين يضيع","اعملها عشان عيلتك","المهمة الأول، الراحة بعدين","الانضباط إنك تعمل حتى لو مش حابب","الراحة عدوّك، اتحرك","محدش جاي يعملها بدالك"];
  function creedOf(list){const d=Math.floor(Date.now()/864e5);return list[d%list.length];}
  function renderCreed(){const hd=document.querySelector('#workView>header.top');if(hd){let c=document.getElementById("creedT");if(!c){c=el("p",{id:"creedT",class:"creed"});}c.textContent=creedOf(CREED);if(c.previousElementSibling!==hd)hd.after(c);}
    const gv=document.getElementById("gymView");if(gv){let g=document.getElementById("creedG");if(!g){g=el("p",{id:"creedG",class:"creed",dir:"rtl"});gv.prepend(g);}g.textContent=creedOf(CREED_AR);if(gv.firstElementChild!==g)gv.prepend(g);}}
  {const _r13=render;render=function(){_r13();try{renderCreed();}catch(e){}};}
  // ---------- 8 Nov: mission card on Today (both versions): objective, live mission clock, engage ----------
  const IMPACT=["One focused hour today is security for your family next year.","Comfort today means struggle for them tomorrow. Choose.","They will not remember your excuses. They will live with your results.",
    "Every finished slide is a step toward the life you promised them.","Your family is betting on you. Prove they bet right.","Scrolling feeds no one. Finished work does.",
    "Every hour you waste today, your family pays for later.","The client paying you today is your family's next month. Deliver.","Be the reason your family never has to worry about money."];
  let mTick=null;
  function missionNow(){const d=iso(new Date());const items=dayBlocksFor(d),nowM=new Date().getHours()*60+new Date().getMinutes();
    const works=items.filter(b=>b.kind==="work");const cur=works.find(b=>hmMin(b.from)<=nowM&&nowM<hmMin(b.to)),next=works.find(b=>hmMin(b.from)>nowM);
    const blk=cur||next;const started=works.filter(b=>hmMin(b.from)<=nowM);let tgt=null;for(const b of [...started,...(next?[next]:[])]){tgt=(b.tasks||[]).find(t=>!t.done);if(tgt)break;}if(!tgt)tgt=tasksOn(d).find(t=>!t.done)||null;const all=tasksOn(d),done=all.filter(t=>t.done).length;return {cur,next,blk,tgt,all:all.length,done,f:focusMin(d),nowM};}
  function renderMission(){if(sel!==iso(new Date())){const c=document.getElementById("mission");if(c)c.hidden=true;return;}
    const grid=document.querySelector('#workView .page[data-page="today"] .grid');if(!grid)return;let c=document.getElementById("mission");
    if(!c){c=el("section",{id:"mission",class:"mission","aria-label":"Mission"});}const first=grid.firstElementChild;if(c.parentElement!==grid||grid.firstElementChild!==c)grid.insertBefore(c,first);c.hidden=false;
    const M=missionNow(),pace=Math.min(420,Math.max(0,420*(M.nowM-360)/780)),behind=M.nowM>600&&M.f<pace*0.5;
    const pct=Math.min(100,Math.round(M.f/420*100));
    rc(c,el("p",{class:"ms-why",text:"DO IT FOR YOUR FAMILY"}),el("div",{class:"ms-top"},el("span",{class:"ms-tag",text:M.cur?"MISSION · ACTIVE":"MISSION · NEXT OP"}),el("span",{class:"ms-tag ms-r",text:"OBJECTIVES "+M.done+"/"+M.all})),
      el("p",{class:"ms-impact"+(behind?" hard":""),text:behind?("It is "+hhmm(Date.now())+" and you have "+dur(M.f)+" of real work. Your family deserves more than this."):IMPACT[(new Date().getHours()+new Date().getDate())%IMPACT.length]}),
      el("h2",{class:"ms-obj",text:M.tgt?M.tgt.title:(M.blk?M.blk.name+": no objective assigned":"Day complete. Recover. Report tomorrow.")}),
      el("div",{class:"ms-clock-row"},el("span",{id:"msClock",class:"ms-clock num",text:"--:--:--"}),el("span",{class:"ms-sub",text:M.cur?"left in "+M.cur.name:(M.next?"to "+M.next.name+" at "+hhmm(hmMin(M.next.from)):"")})),
      el("div",{class:"ms-bar"},el("span",{style:"width:"+pct+"%"})),
      el("div",{class:"ms-foot"},el("span",{class:"ms-sub num",text:"Focus "+dur(M.f)+" of "+dur(FULL_DAY)}),
        M.tgt?el("button",{type:"button",class:"ms-go",onclick:()=>{try{openTask=M.tgt.id;}catch(e){}const f=document.getElementById("pomoFab");if(f)f.click();toast("Engaged: "+M.tgt.title);}},"Engage"):null),
      behind?el("p",{class:"ms-alert",text:"The day is not finished. No excuses. Do it tired."}):null);
    const tick=()=>{const el2=document.getElementById("msClock");if(!el2)return;const n=new Date(),nm=n.getHours()*60+n.getMinutes(),M2=M;const end=M2.cur?hmMin(M2.cur.to):(M2.next?hmMin(M2.next.from):null);
      if(end==null){el2.textContent="00:00:00";return;}let s=end*60-(nm*60+n.getSeconds());if(s<0)s=0;const h=Math.floor(s/3600),mi=Math.floor(s%3600/60),se=s%60;el2.textContent=[h,mi,se].map(x=>String(x).padStart(2,"0")).join(":");};
    tick();clearInterval(mTick);mTick=setInterval(tick,1000);}
  {const _r14=render;render=function(){_r14();try{renderMission();}catch(e){console.warn(e);}};}
  // 8 Nov: Time entries shown on Today too (same live section, moved to whichever page is open)
  function placeEnt(){const sec=document.querySelector('section[aria-labelledby="entH"]');if(!sec)return;
    const tp=document.querySelector('.page[data-page="time"]'),grid=document.querySelector('#workView .page[data-page="today"] .grid');
    if(page==="time"){if(sec.parentElement!==tp)tp.prepend(sec);}
    else if(grid){const cap=document.getElementById("capSec");if(sec.parentElement!==grid)grid.insertBefore(sec,cap||null);}}
  {const _r4=render;render=function(){try{placeEnt();}catch(e){}_r4();try{placeEnt();}catch(e){}};}
  {const _sp4=setPage;setPage=function(p,...a){const r=_sp4(p,...a);try{placeEnt();}catch(e){}return r;};}
  // 8 Nov: sticky glass day bar on Today
  function setStickyVars(){try{const s=document.getElementById("hubSub");if(s)document.documentElement.style.setProperty("--hsh",(s.hidden?0:s.offsetHeight)+"px");}catch(e){}}
  {const _r5=render;render=function(){_r5();setStickyVars();};}
  addEventListener("resize",setStickyVars);
  // 8 Nov: long English descriptions hide; hold the pointer on the area (or long-press) to read them
  const DESC_SEL=".hint,.ehow,.db-note,.panel-head .sub,p.muted,.desc,.cap-help";
  function isDesc(n){if(n.children.length||n.closest("button,label,select,input,textarea,#descTip,.lay-bar,.dbar,.cap-k"))return false;const t=(n.textContent||"").trim();
    if(t.length<28||/[\u0600-\u06FF]/.test(t))return false;const d=(t.match(/[0-9]/g)||[]).length;if(d/t.length>.04)return false;return (t.match(/[a-z]/gi)||[]).length/t.length>.6;}
  function hideDescs(root){(root||document).querySelectorAll(DESC_SEL).forEach(n=>{if(n.dataset.descDone)return;n.dataset.descDone="1";if(!isDesc(n))return;
    const host=n.parentElement;if(!host)return;n.classList.add("desc-hid");host.dataset.tip=[...new Set([...host.querySelectorAll(":scope>.desc-hid")].map(x=>x.textContent.trim()).filter(Boolean))].join("\n");});}
  (function(){const tip=el("div",{id:"descTip",role:"tooltip",hidden:""});document.body.append(tip);let tm=null,cur=null;
    const show=(h,x,y)=>{tip.textContent=h.dataset.tip;tip.hidden=false;const w=tip.offsetWidth,hh=tip.offsetHeight;tip.style.left=Math.max(8,Math.min(x-w/2,innerWidth-w-8))+"px";tip.style.top=(y-hh-14<8?y+20:y-hh-14)+"px";};
    const hide=()=>{clearTimeout(tm);tm=null;cur=null;tip.hidden=true;};
    addEventListener("pointerover",e=>{const h=e.target.closest&&e.target.closest("[data-tip]");if(h===cur)return;hide();if(!h||e.pointerType==="touch")return;cur=h;const x=e.clientX,y=e.clientY;tm=setTimeout(()=>show(h,x,y),700);},{passive:true});
    addEventListener("pointerdown",e=>{hide();if(e.pointerType!=="touch")return;const h=e.target.closest&&e.target.closest("[data-tip]");if(!h)return;const x=e.clientX,y=e.clientY;tm=setTimeout(()=>show(h,x,y),550);},{passive:true});
    ["pointerup","pointercancel","scroll"].forEach(t=>addEventListener(t,()=>{if(t!=="pointerup"||!tip.hidden)setTimeout(hide,t==="pointerup"?1600:0);clearTimeout(tm);},{passive:true,capture:true}));
    const wv=document.getElementById("workView")||document.body;let raf=0;new MutationObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>hideDescs(wv));}).observe(wv,{childList:true,subtree:true});hideDescs(wv);})();
  // ---------- 8 Nov: free layout editor. Sections move anywhere (wide screens), inner elements on Today reorder, resize, hide ----------
  let layEdit=false,laySel=null,layRO=null,layRaf=0,layDraft=null;
  const LAY_GAP=8,LAY_SNAP=8;
  const LAY_FILL=[["","None","transparent"],["surface","Surface","var(--surface)"],["sunk","Sunk","var(--sunk)"],["pc","Red","var(--md-primary-container)"],["tc","Teal","var(--md-tertiary-container)"],["ink","Inverse","var(--ink)"]];
  const LAY_FC={surface:["var(--surface)","var(--ink)"],sunk:["var(--sunk)","var(--ink)"],pc:["var(--md-primary-container)","var(--md-on-primary-container)"],tc:["var(--md-tertiary-container)","var(--md-on-tertiary-container)"],ink:["var(--ink)","var(--bg)"]};
  function layStyle(n,s){const f=LAY_FC[s.fill];n.style.background=f?f[0]:"";n.style.color=f?f[1]:"";n.style.borderRadius=f?"14px":"";if(f&&n.dataset.layi&&!n.style.padding)n.style.padding="10px 12px";if(!f&&n.dataset.layi)n.style.padding="";n.style.fontWeight=s.wt?String(s.wt):"";n.style.zoom=s.z&&s.z!==1?String(s.z):"";n.dataset.layZ=String(s.z||1);}
  function layAll(){return (state.settings&&state.settings.layout&&state.settings.layout.pages)||{};}
  function layOf(p){if(layDraft&&layDraft.page===p)return layDraft.L;const L=layAll()[p];return L&&L.mode==="free"?L:null;}
  function laySave(p,v){layDraft=null;const pages={...layAll()};if(v)pages[p]=v;else delete pages[p];const doc={pages,at:Date.now()};state.settings={...state.settings,layout:doc};try{store.set("settings/layout",doc);}catch(e){}}
  function layPg(){return document.querySelector('#workView .page[data-page="'+page+'"]')||document.querySelector('.page[data-page="'+page+'"]');}
  function layNarrow(){return innerWidth<700;}
  function layIsWrap(n){if(n.tagName!=="DIV"||n.classList.contains("panel"))return false;return [...n.children].some(c=>c.tagName==="SECTION"||c.classList.contains("panel"));}
  function layBlocks(pg){const out=[];
    const walk=par=>{[...par.children].forEach(c=>{if(/^(SCRIPT|TEMPLATE|STYLE)$/.test(c.tagName)||c.classList.contains("lay-bar")||c.classList.contains("lay-rs"))return;if(c.hidden&&!c.classList.contains("lay-hid"))return;
      if(c.classList.contains("lay-flat")||layIsWrap(c)){c.classList.add("lay-flat");walk(c);}else out.push(c);});};
    walk(pg);const seen={};
    out.forEach(c=>{let k=c.id||c.getAttribute("aria-labelledby")||"";if(!k){const h=c.querySelector("h2,h3");k=h?"h:"+h.textContent.trim().slice(0,30):c.tagName.toLowerCase()+"."+([...c.classList].filter(x=>!x.startsWith("lay-"))[0]||"x");}
      seen[k]=(seen[k]||0)+1;if(seen[k]>1)k+="#"+seen[k];c.dataset.lay=k;});
    return out.filter(b=>getComputedStyle(b).display!=="none"||b.classList.contains("lay-hid"));}
  // inner elements of a Today section
  const LAY_NOFLAT="#rail,ul,ol,form,table,.panel-head,.rl-list,.seg";
  function layInner(sec){const res=[];const sk=sec.dataset.lay;
    const kids=par=>[...par.children].filter(c=>!/^(SCRIPT|TEMPLATE|STYLE)$/.test(c.tagName)&&!c.classList.contains("lay-bar")&&!c.classList.contains("lay-rs")&&(!c.hidden||c.classList.contains("lay-ihid")));
    const add=(par,list)=>{const seen={};if(!par.classList.contains("lay-in")&&!par.dataset.layDisp)par.dataset.layDisp=getComputedStyle(par).display;if(par.dataset.layDisp==="block")par.classList.add("lay-in");list.forEach(c=>{let k=c.id||([...c.classList].filter(x=>!x.startsWith("lay-"))[0])||c.tagName.toLowerCase();seen[k]=(seen[k]||0)+1;if(seen[k]>1)k+="#"+seen[k];c.dataset.layi=sk+"/"+k;res.push(c);});};
    const top=kids(sec);const flat=[];
    top.forEach(c=>{const ch=kids(c);if(c.tagName==="DIV"&&!c.matches(LAY_NOFLAT)&&ch.length>=2&&!c.querySelector(":scope>.panel-head")){add(c,ch);flat.push(c);}});
    add(sec,top);return res;}
  function layCapture(pg,bl){const pr=pg.getBoundingClientRect(),items={};
    bl.forEach(b=>{const r=b.getBoundingClientRect();if(!r.width&&!r.height)return;items[b.dataset.lay]={x:+((r.left-pr.left)/pr.width*100).toFixed(2),w:+(r.width/pr.width*100).toFixed(2),y:Math.round(r.top-pr.top),h0:Math.round(r.height)};});
    return {mode:"free",items,inner:{}};}
  function layClean(pg){pg.classList.remove("lay","lay-on","lay-free","lay-nar");pg.style.minHeight="";
    pg.querySelectorAll("[data-lay]").forEach(b=>{["position","left","top","width","height","order","background","color","borderRadius","fontWeight","zoom"].forEach(p=>b.style[p]="");if(b.classList.contains("lay-hid"))b.hidden=false;b.classList.remove("lay-hid","lay-scroll","lay-selb");b.querySelectorAll(":scope>.lay-bar,:scope>.lay-rs").forEach(x=>x.remove());});
    pg.querySelectorAll("[data-layi]").forEach(i=>{["order","flexBasis","zoom","background","color","borderRadius","fontWeight","padding"].forEach(p=>i.style[p]="");if(i.classList.contains("lay-ihid"))i.hidden=false;i.classList.remove("lay-ihid","lay-sel");});
    pg.querySelectorAll(".lay-in").forEach(x=>x.classList.remove("lay-in"));pg.querySelectorAll("[data-lay-disp]").forEach(x=>delete x.dataset.layDisp);pg.querySelectorAll(".lay-flat").forEach(x=>x.classList.remove("lay-flat"));}
  function applyLayout(){const pg=layPg();if(!pg)return;document.querySelectorAll(".page.lay").forEach(p=>{if(p!==pg)layClean(p);});
    let L=layOf(page);if(!L&&!layEdit){if(pg.classList.contains("lay"))layClean(pg);layIBarHide();return;}
    if(!L){const bl0=layBlocks(pg);L=layCapture(pg,bl0);layDraft={page,L};}
    pg.classList.add("lay");pg.classList.toggle("lay-on",layEdit);const nar=layNarrow();pg.classList.toggle("lay-nar",nar);pg.classList.toggle("lay-free",!nar);
    const bl=layBlocks(pg),it=L.items||{};
    bl.forEach(b=>{const k=b.dataset.lay;if(!it[k]){const pr=pg.getBoundingClientRect();let maxB=0;Object.values(it).forEach(s=>{maxB=Math.max(maxB,(s.y||0)+(s.h0||0));});it[k]={x:0,w:100,y:maxB+LAY_GAP*2,h0:b.offsetHeight||100};}
      const s=it[k];layStyle(b,s);const hid=!!s.hide;b.classList.toggle("lay-hid",hid);b.hidden=hid&&!layEdit;
      if(s.h){b.style.height=s.h+"px";b.classList.add("lay-scroll");}else{b.style.height="";b.classList.remove("lay-scroll");}
      let bar=b.querySelector(":scope>.lay-bar");
      if(layEdit){if(!bar){bar=layBar(b);b.prepend(bar);}if(!b.querySelector(":scope>.lay-rs"))b.append(el("span",{class:"lay-rs","aria-hidden":"true",onpointerdown:e=>layResize(e,b)}));bar.querySelector(".lay-hide").textContent=hid?"Show":"Hide";}
      else{if(bar)bar.remove();const r=b.querySelector(":scope>.lay-rs");if(r)r.remove();}});
    // inner elements (Today)
    if(page==="today")bl.forEach(b=>{if(b.hidden)return;const inn=(L.inner||{})[b.dataset.lay]||{};const items=layInner(b);
      items.forEach((i,n)=>{const k=i.dataset.layi.split("/").slice(1).join("/"),s=inn[k]||{};i.style.order=s.o!=null?String(s.o):String(n);i.style.flexBasis=s.w===50?"calc(50% - 6px)":"";layStyle(i,s);
        const hid=!!s.hide;i.classList.toggle("lay-ihid",hid);i.hidden=hid&&!layEdit;});});
    layFit(pg,L);layFlow(pg,L,bl);
    if(layEdit){if(!layRO){layRO=new ResizeObserver(()=>{cancelAnimationFrame(layRaf);layRaf=requestAnimationFrame(()=>{const p=layPg(),l=layOf(page);if(p&&l){layFit(p,l);layFlow(p,l,layBlocks(p));}layIBarPos();});});}}
    if(layRO){layRO.disconnect();bl.forEach(b=>layRO.observe(b));}
    else{layRO=new ResizeObserver(()=>{cancelAnimationFrame(layRaf);layRaf=requestAnimationFrame(()=>{const p=layPg(),l=layOf(page);if(p&&l){layFit(p,l);layFlow(p,l,layBlocks(p));}});});bl.forEach(b=>layRO.observe(b));}
    layIBarPos();const tb=document.getElementById("layTop");if(tb)tb.textContent=layEdit?"Done":"Edit layout";}
  function layFlow(pg,L,bl){const it=L.items||{};
    if(layNarrow()){pg.style.minHeight="";const srt=bl.slice().sort((a,c)=>((it[a.dataset.lay]||{}).y||0)-((it[c.dataset.lay]||{}).y||0)||((it[a.dataset.lay]||{}).x||0)-((it[c.dataset.lay]||{}).x||0));
      srt.forEach((b,i)=>{["position","left","top","width"].forEach(p=>b.style[p]="");b.style.order=String(i);});return;}
    const W=pg.clientWidth||pg.getBoundingClientRect().width;const vis=bl.filter(b=>!b.hidden).sort((a,c)=>((it[a.dataset.lay]||{}).y||0)-((it[c.dataset.lay]||{}).y||0));
    const placed=[];let maxB=0;
    vis.forEach(b=>{const s=it[b.dataset.lay];b.style.position="absolute";b.style.left=s.x+"%";b.style.width=s.w+"%";b.style.order="";
      const x1=s.x,x2=s.x+s.w,ov=p=>p.x1<x2-0.5&&p.x2>x1+0.5;let delta=null,minTop=0;
      placed.forEach(p=>{if(!ov(p))return;const d=(p.top+p.hc)-(p.y+p.h0);delta=delta==null?d:Math.max(delta,d);minTop=Math.max(minTop,p.top+p.hc+LAY_GAP);});
      let top=s.y+(delta||0);if(placed.some(ov))top=Math.max(top,minTop);top=Math.max(0,Math.round(top));b.style.top=top+"px";
      const hc=b.offsetHeight;placed.push({x1,x2,y:s.y,h0:s.h0||hc,top,hc});maxB=Math.max(maxB,top+hc);});
    pg.style.minHeight=(maxB+48)+"px";}
  // fit: a Today section with a set height scales its content to fit, no scrolling. Today's tasks scroll instead and keep the current task in view
  let tasksUserScroll=0;
  function layKids(b){return [...b.children].filter(c=>!c.classList.contains("lay-bar")&&!c.classList.contains("lay-rs")&&!c.hidden);}
  function layFit(pg,L){if(page!=="today")return;const it=(L&&L.items)||{};
    pg.querySelectorAll("[data-lay]").forEach(b=>{const k=b.dataset.lay,s=it[k]||{},kids=layKids(b);
      kids.forEach(c=>{const z=+(c.dataset.layZ||1);c.style.zoom=z!==1?String(z):"";});
      if(k==="tasksH"||!s.h||layNarrow()){if(k!=="tasksH")b.classList.toggle("lay-scroll",!!s.h);b.classList.remove("lay-fit");return;}
      b.classList.remove("lay-scroll");b.classList.add("lay-fit");
      const cs=getComputedStyle(b),avail=s.h-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);let f=1;
      for(let n=0;n<3;n++){const H=kids.reduce((t,c)=>Math.max(t,c.offsetTop+c.offsetHeight),0)-(kids[0]?kids[0].offsetTop:0);if(H<=avail+1)break;f=Math.max(.7,f*avail/H);kids.forEach(c=>{const z=+(c.dataset.layZ||1)*f;c.style.zoom=String(+z.toFixed(3));});if(f<=.7)break;}
      if(f<=.7){b.classList.remove("lay-fit");b.classList.add("lay-scroll");}});}
  function tasksFocus(force){if(document.body.classList.contains("m1"))return;const sec=document.querySelector('.page[data-page="today"] section[aria-labelledby="tasksH"]');if(!sec||page!=="today")return;
    if(sec.scrollHeight<=sec.clientHeight+4)return;if(!force&&Date.now()-tasksUserScroll<20000)return;
    const t=sec.querySelector(".rl.now")||sec.querySelector(".rl-block.k-work,.rl-block.k-batch")||sec.querySelector(".rl .slab.s-work:not(.done)");if(!t)return;
    const row=t.closest(".rl")||t,bar=sec.querySelector(".dbar"),off=(bar?bar.offsetHeight+12:0);
    const top=row.getBoundingClientRect().top-sec.getBoundingClientRect().top+sec.scrollTop-off;if(Math.abs(sec.scrollTop-top)>8)sec.scrollTop=Math.max(0,top);}
  (function(){const h=e=>{if(e.target.closest&&e.target.closest('section[aria-labelledby="tasksH"]'))tasksUserScroll=Date.now();};["wheel","touchmove","keydown"].forEach(t=>addEventListener(t,h,{passive:true,capture:true}));})();
  {const _r6=render;render=function(){_r6();try{const pg=layPg();if(page==="today"){layFit(pg,layOf(page));requestAnimationFrame(()=>tasksFocus(false));}}catch(e){}};}
  function laySnapshot(pg,L){layBlocks(pg).forEach(b=>{const s=L.items[b.dataset.lay];if(!s||b.hidden)return;if(!layNarrow()){s.y=parseInt(b.style.top)||s.y;}s.h0=b.offsetHeight;});}
  function layCommit(){const pg=layPg(),L=layOf(page);if(!pg||!L)return;laySnapshot(pg,L);laySave(page,JSON.parse(JSON.stringify(L)));applyLayout();}
  function layBar(b){const k=()=>b.dataset.lay,S=()=>layOf(page).items[k()];
    return el("div",{class:"lay-bar"},
      el("button",{type:"button",class:"lay-h","aria-label":"Hold and drag to move",onpointerdown:e=>layMove(e,b)},xico("grip")),
      el("button",{type:"button",onclick:()=>{const s=S();s.x=0;s.w=100;layCommit();}},"Full width"),
      el("button",{type:"button",onclick:()=>{const s=S();s.h=s.h?0:320;layCommit();}},"Height"),
      el("button",{type:"button",class:"lay-hide",onclick:()=>{const s=S();s.hide=!s.hide;layCommit();}},"Hide"));}
  function layMove(e,b){e.preventDefault();e.stopPropagation();const pg=layPg(),L=layOf(page),s=L.items[b.dataset.lay],pr=pg.getBoundingClientRect();
    const sx=e.clientX,sy=e.clientY,ox=b.offsetLeft,oy=b.offsetTop;b.classList.add("lay-lift");let moved=false;
    const mv=ev=>{moved=true;if(layNarrow()){const t=document.elementFromPoint(ev.clientX,ev.clientY),tb=t&&t.closest("[data-lay]");if(tb&&tb!==b){const ts=L.items[tb.dataset.lay],r=tb.getBoundingClientRect();s.y=ts.y+(ev.clientY>r.top+r.height/2?1:-1);layFlow(pg,L,layBlocks(pg));}return;}
      let nx=ox+(ev.clientX-sx),ny=oy+(ev.clientY-sy);nx=Math.round(nx/LAY_SNAP)*LAY_SNAP;ny=Math.round(ny/LAY_SNAP)*LAY_SNAP;
      nx=Math.max(0,Math.min(nx,pr.width-b.offsetWidth));ny=Math.max(0,ny);b.style.left=(nx/pr.width*100)+"%";b.style.top=ny+"px";s.x=+(nx/pr.width*100).toFixed(2);s.y=ny;};
    const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);b.classList.remove("lay-lift");if(!moved)return;
      if(layNarrow()){const srt=layBlocks(pg).sort((a,c)=>(L.items[a.dataset.lay].y)-(L.items[c.dataset.lay].y));srt.forEach((x,i)=>{L.items[x.dataset.lay].y=i*100;});laySave(page,JSON.parse(JSON.stringify(L)));applyLayout();return;}
      // keep the dropped position, push the rest
      const keep={...s};layFlow(pg,L,layBlocks(pg));layBlocks(pg).forEach(x=>{const xs=L.items[x.dataset.lay];if(xs&&!x.hidden&&x!==b){xs.y=parseInt(x.style.top)||xs.y;xs.h0=x.offsetHeight;}});s.y=keep.y;s.h0=b.offsetHeight;
      laySave(page,JSON.parse(JSON.stringify(L)));applyLayout();};
    addEventListener("pointermove",mv);addEventListener("pointerup",up);}
  function layResize(e,b){e.preventDefault();e.stopPropagation();const pg=layPg(),L=layOf(page),s=L.items[b.dataset.lay],pr=pg.getBoundingClientRect();
    const sx=e.clientX,sy=e.clientY,ow=b.offsetWidth,oh=b.offsetHeight;b.style.height="";const nat=b.scrollHeight;if(s.h)b.style.height=s.h+"px";let ch=false;
    const mv=ev=>{ch=true;if(!layNarrow()){let w=Math.round((ow+ev.clientX-sx)/LAY_SNAP)*LAY_SNAP;w=Math.max(160,Math.min(w,pr.width-b.offsetLeft));b.style.width=(w/pr.width*100)+"%";s.w=+(w/pr.width*100).toFixed(2);}
      const dy=ev.clientY-sy;if(Math.abs(dy)>10){const h=Math.max(100,Math.round((oh+dy)/LAY_SNAP)*LAY_SNAP);if(h>=nat-8){s.h=0;b.style.height="";b.classList.remove("lay-scroll");}else{s.h=h;b.style.height=h+"px";b.classList.add("lay-scroll");}}};
    const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);if(ch)layCommit();};
    addEventListener("pointermove",mv);addEventListener("pointerup",up);}
  // inner element toolbar
  function layIBar(){let b=document.getElementById("layIBar");if(b)return b;
    const S=()=>{const L=layOf(page);if(!laySel.dataset.layi)return L.items[laySel.dataset.lay];const [sk,...r]=laySel.dataset.layi.split("/"),k=r.join("/");L.inner=L.inner||{};L.inner[sk]=L.inner[sk]||{};return (L.inner[sk][k]=L.inner[sk][k]||{});};
    const save=()=>{const L=layOf(page);laySave(page,JSON.parse(JSON.stringify(L)));applyLayout();};
    b=el("div",{id:"layIBar",class:"lay-bar lay-ibar",hidden:""},
      el("button",{type:"button",class:"lay-h","aria-label":"Hold and drag to reorder",onpointerdown:e=>layIMove(e)},xico("grip")),
      el("button",{type:"button",onclick:()=>{const s=S();s.w=s.w===50?0:50;save();}},"Half / Full"),
      el("button",{type:"button","aria-label":"Smaller",onclick:()=>{const s=S();s.z=Math.max(.7,+((s.z||1)-.1).toFixed(2));save();}},"A-"),
      el("button",{type:"button","aria-label":"Bigger",onclick:()=>{const s=S();s.z=Math.min(1.6,+((s.z||1)+.1).toFixed(2));save();}},"A+"),
      el("button",{type:"button",class:"lay-ihide",onclick:()=>{const s=S();s.hide=!s.hide;save();}},"Hide"),
      el("span",{class:"lay-sep"}),
      ...LAY_FILL.map(([k,n,c])=>el("button",{type:"button",class:"lay-sw","aria-label":"Fill: "+n,title:n,style:"background:"+c,onclick:()=>{const s=S();s.fill=k||undefined;save();}})),
      el("button",{type:"button",onclick:()=>{const s=S();s.wt=s.wt===700?400:700;save();}},"Bold"));
    document.body.append(b);return b;}
  function layIBarHide(){const b=document.getElementById("layIBar");if(b)b.hidden=true;document.querySelectorAll(".lay-sel").forEach(x=>x.classList.remove("lay-sel"));laySel=null;}
  function layIBarPos(){const b=document.getElementById("layIBar");if(!b)return;if(!layEdit||!laySel){b.hidden=true;return;}
    const cur=laySel.dataset.layi?document.querySelector('[data-layi="'+CSS.escape(laySel.dataset.layi)+'"]'):document.querySelector('[data-lay="'+CSS.escape(laySel.dataset.lay)+'"]');if(!cur){b.hidden=true;return;}laySel=cur;cur.classList.add("lay-sel");
    const r=cur.getBoundingClientRect();b.hidden=false;b.style.top=Math.max(64,r.top-46)+"px";b.style.left=Math.max(8,Math.min(r.left,innerWidth-b.offsetWidth-8))+"px";
    const L=layOf(page);let s={};if(cur.dataset.layi){const [sk,...rr]=cur.dataset.layi.split("/");s=(((L||{}).inner||{})[sk]||{})[rr.join("/")]||{};}else s=((L||{}).items||{})[cur.dataset.lay]||{};b.classList.toggle("lay-ib-block",!cur.dataset.layi);b.querySelector(".lay-ihide").textContent=s.hide?"Show":"Hide";}
  function layIMove(e){e.preventDefault();e.stopPropagation();const it=laySel;if(!it)return;const par=it.parentElement,L=layOf(page),sk=it.dataset.layi.split("/")[0];it.classList.add("lay-lift");
    const sib=()=>[...par.children].filter(c=>c.dataset.layi&&c.dataset.layi.startsWith(sk+"/")).sort((a,c)=>(+a.style.order||0)-(+c.style.order||0));
    const mv=ev=>{const t=document.elementFromPoint(ev.clientX,ev.clientY),tg=t&&t.closest("[data-layi]");if(!tg||tg===it||tg.parentElement!==par)return;
      const list=sib().filter(x=>x!==it),r=tg.getBoundingClientRect(),after=ev.clientY>r.top+r.height/2||(ev.clientX>r.left+r.width/2&&ev.clientY>r.top);let i=list.indexOf(tg)+(after?1:0);list.splice(i,0,it);list.forEach((x,n)=>x.style.order=String(n));layIBarPos();};
    const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);it.classList.remove("lay-lift");L.inner=L.inner||{};L.inner[sk]=L.inner[sk]||{};
      sib().forEach((x,n)=>{const k=x.dataset.layi.split("/").slice(1).join("/");L.inner[sk][k]={...(L.inner[sk][k]||{}),o:n};});laySave(page,JSON.parse(JSON.stringify(L)));applyLayout();};
    addEventListener("pointermove",mv);addEventListener("pointerup",up);}
  // while editing, the page is inert: taps select instead of acting
  ["click","pointerdown","mousedown","touchstart","contextmenu"].forEach(t=>document.addEventListener(t,e=>{if(!layEdit)return;const pg=e.target.closest&&e.target.closest(".page.lay-on");if(!pg)return;
    if(e.target.closest(".lay-bar,.lay-rs,#layIBar"))return;e.preventDefault();e.stopPropagation();
    if(t==="click"){const i=(page==="today"&&e.target.closest("[data-layi]"))||e.target.closest("[data-lay]");document.querySelectorAll(".lay-sel").forEach(x=>x.classList.remove("lay-sel"));if(i){laySel=i;layIBar();layIBarPos();}else layIBarHide();}},{capture:true,passive:false}));
  addEventListener("scroll",()=>{if(layEdit)layIBarPos();},{passive:true});
  addEventListener("resize",()=>{try{applyLayout();}catch(e){}});
  XI.grip='<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>';
  function layToggle(){if(layEdit){const L=layOf(page);if(layDraft&&layDraft.page===page){layDraft=null;}layEdit=false;layIBarHide();}else{layEdit=true;}
    document.body.classList.toggle("lay-editing",layEdit);layTopBtn();applyLayout();if(layEdit)toast(page==="today"?"Drag sections anywhere. Tap anything inside a section to rearrange it.":"Drag sections anywhere. Drag the corner to resize.");}
  function layReset(){laySave(page,null);layDraft=null;layIBarHide();const pg=layPg();if(pg)layClean(pg);applyLayout();toast("Layout reset for this page");}
  function layTopBtn(){const sub=document.getElementById("hubSub");if(!sub)return;let b=document.getElementById("layTop");
    if(!b){b=el("button",{type:"button",id:"layTop",class:"lay-top",onclick:layToggle},"Edit layout");}
    let r=document.getElementById("layReset");if(!r){r=el("button",{type:"button",id:"layReset",class:"lay-top lay-reset",onclick:layReset},"Reset");}
    sub.hidden=false;if(b.parentNode!==sub)sub.append(b);if(r.parentNode!==sub)sub.append(r);r.hidden=!layEdit;b.textContent=layEdit?"Done":"Edit layout";}
  {const _r3=render;render=function(){_r3();try{layTopBtn();applyLayout();}catch(e){console.warn(e);}};}
  {const _sp=setPage;setPage=function(p,...a){if(layEdit){layEdit=false;layDraft=null;document.body.classList.remove("lay-editing");layIBarHide();}const r=_sp(p,...a);try{layTopBtn();applyLayout();}catch(e){}return r;};}
  // Material 3 type: Roboto from Google Fonts
  try{if(!document.getElementById("md-font")){const l=document.createElement("link");l.id="md-font";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap";document.head.append(l);}}catch(e){}


  // 9 Nov: calm mission card. No countdown, no guilt lines. One task, one Start button.
  renderMission=function(){const c0=document.getElementById("mission");if(c0)c0.remove();clearInterval(mTick);return;const grid=document.querySelector('#workView .page[data-page="today"] .grid');let c=document.getElementById("mission");
    if(sel!==iso(new Date())||!grid){if(c)c.hidden=true;return;}
    if(!c){c=el("section",{id:"mission","aria-label":"Next task"});}c.className="panel calm";if(c.parentElement!==grid||grid.firstElementChild!==c)grid.insertBefore(c,grid.firstElementChild);c.hidden=false;
    clearInterval(mTick);const M=missionNow();
    rc(c,el("span",{class:"label",text:"Next"}),el("h2",{class:"cm-t",text:M.tgt?M.tgt.title:"Nothing left today"}),
      M.tgt?el("button",{type:"button",class:"btn cm-go",onclick:()=>{try{openTask=M.tgt.id;}catch(e){}const f=document.getElementById("pomoFab");if(f)f.click();}},"Start"):null);};
  // ===== 9 Nov: THE CUT. Keep only what helps execute today, train, and not get surprised by money. Data is untouched. =====
  (function cut1(){
    document.body.classList.add("cut1");
    const KEEP=["today","projects","gym","finance","progress","settings","sounds"];
    ICO.gym=XI.mgym;ICO.money=XI.mmoney;
    ICO.cset='<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>';
    XI.cset=ICO.cset;
    HUBS.splice(0,HUBS.length,
      {id:"today",name:"Today",ico:"today",pages:[["today","Today"]]},
      {id:"projects",name:"Projects",ico:"more",pages:[["projects","Projects"]]},
      {id:"gym",name:"Gym",ico:"gym",pages:[["gym","Gym"]]},
      {id:"money",name:"Money",ico:"money",pages:[["finance","Money"]]},
      {id:"review",name:"Review",ico:"review",pages:[["progress","Review"]]},
      {id:"set",name:"Settings",ico:"cset",pages:[["settings","Settings"]]});
    MTABS[3][3].splice(1);MMORE.splice(0,MMORE.length,["settings","Settings"]);
    CAPK.splice(3);
    // anything removed sends you back to Today
    {const _sp=setPage;setPage=function(p,...a){if(!KEEP.includes(p))p="today";return _sp(p,...a);};}
    if(!KEEP.includes(page))setTimeout(()=>setPage("today"),0);
    // layout editor gone: always the clean default layout
    layEdit=false;
    applyLayout=function(){document.querySelectorAll(".page.lay").forEach(p=>layClean(p));};
    layTopBtn=function(){["layTop","layReset","layIBar"].forEach(id=>{const x=document.getElementById(id);if(x)x.remove();});const sub=document.getElementById("hubSub");if(sub)sub.hidden=false;};
    // Today: three quiet cards. Each opens its full section in a pop-up: Capture, Time entries, Habits (incl. bad habits)
    const POPS={cap:["Capture","fpen",()=>[document.getElementById("capSec")]],
      ent:["Time","clock",()=>[document.querySelector('section[aria-labelledby="entH"]')]],
      hab:["Habits","check",()=>[document.querySelector('section[aria-labelledby="habH"]'),document.querySelector('section[aria-labelledby="gdH"]')]],
      mus:["Intentional media","music",()=>[]]};
    placeEnt=function(){};
    openPop=function(k){if(k==="mus"){setPage("sounds");scrollTo(0,0);return;}const P=POPS[k];if(!P)return;const secs=P[2]().filter(Boolean);if(!secs.length)return;popOpen=k;secs.forEach(s=>s.classList.add("in-pop"));
      secs.forEach(s=>{s.querySelectorAll('details[open]').forEach(d=>d.open=false);s.classList.remove("collapsed");});
      psOpen(P[0],()=>secs,{onClose:()=>{popOpen=null;secs.forEach(s=>{s.classList.remove("in-pop");popHold().append(s);});if(k==="ent"&&sel!==iso(new Date())){const tb=document.getElementById("todayBtn");if(tb)tb.click();}renderPopCards();}});
      if(k==="cap")setTimeout(()=>{const i=document.getElementById("capIn");if(i)i.focus();},250);
      if(k==="ent")timeSwipe();};
    // Time pop-up: the title is the day; swipe left or right to move through days and see performance
    function timeTitle(){const h=document.querySelector(".ps-sheet .ps-sh-head h2");if(h)h.textContent=sel===iso(new Date())?"Today":fmt(sel,{weekday:"long",day:"numeric",month:"short"});}
    function timeSwipe(){timeTitle();const body=document.querySelector(".ps-sheet .ps-sh-body");if(!body)return;
      if(!body.querySelector(".tm-hint"))body.prepend(el("p",{class:"tm-hint",text:"Swipe for other days"}));
      let x0=null,y0=0;body.addEventListener("pointerdown",e=>{x0=e.clientX;y0=e.clientY;});
      body.addEventListener("pointerup",e=>{if(x0===null)return;const dx=e.clientX-x0,dy=e.clientY-y0;x0=null;if(Math.abs(dx)<60||Math.abs(dy)>Math.abs(dx))return;
        if(dx<0&&sel>=iso(new Date()))return;const b=document.getElementById(dx>0?"prevDay":"nextDay");if(b)b.click();setTimeout(timeTitle,50);
        body.animate([{transform:"translateX("+(dx>0?-24:24)+"px)",opacity:.4},{transform:"none",opacity:1}],{duration:200,easing:"ease-out"});});}
    // the day bar above tasks opens Time
    document.addEventListener("click",e=>{const d=e.target.closest('#taskList .dbar');if(d&&!e.target.closest("button,a,input"))openPop("ent");});
    renderPopCards=function(){const grid=document.querySelector('#workView .page[data-page="today"] .grid');if(!grid)return;
      Object.keys(POPS).forEach(k=>{if(popOpen===k)return;POPS[k][2]().forEach(s=>{if(s&&s.parentElement!==popHold())popHold().append(s);});});
      {const lg=document.querySelector('section[aria-labelledby="logH"]');if(lg&&lg.parentElement!==popHold())popHold().append(lg);}
      let row=document.getElementById("popCards");if(!row){row=el("section",{id:"popCards",class:"pop-cards","aria-label":"Capture, time, habits"});}
      if(row.parentElement!==grid)grid.append(row);
      rc(row,...Object.entries(POPS).map(([k,[t,ic]])=>el("button",{type:"button",class:"pop-card",onclick:()=>openPop(k)},el("span",{class:"fc-ic"},xico(ic)),el("span",{class:"fc-t",text:t}))));};
    // Notifications: 3 types, each at most once a day
    notifList=function(){const out=[],now=new Date(),today=iso(now),nowM=now.getHours()*60+now.getMinutes();
      const add=(id,lvl,ico,t,go)=>out.push({id:id+":"+today,lvl,ico,t,sub:"",go});
      try{dueList().filter(x=>x.d<=2).forEach(x=>add("pay:"+x.id+":"+x.next,x.d<0?2:1,"fcal",x.name+(x.d<0?" overdue":x.d===0?" due today":x.d===1?" due tomorrow":" due in 2 days")+" · "+money(x.amount,x.cur),"finance"));}catch(e){}
      try{const sp=sprintFor(today),open=leafTasks().filter(t=>!t.done&&!t.cut&&t.date);
        const tm=iso(new Date(now.getTime()+864e5)),dt=open.filter(t=>t.date===tm).length;
        if(sp.end===tm)add("spend",2,"target","Sprint "+sp.n+" ends tomorrow","progress");else if(dt)add("dl",1,"target",dt+(dt===1?" deadline tomorrow":" deadlines tomorrow"),"today");}catch(e){}
      try{const L=(state.logs||{})[today]||{};if(!L.gym&&now.getDay()!==5&&nowM>=18*60)add("gym",2,"mgym","Training not logged","gym");}catch(e){}
      return out.sort((a,b)=>b.lvl-a.lvl);};
    // no sound in the first 20 seconds after opening, whatever the reason
    {const T0=Date.now(),_b=bell,_w=woo;bell=function(k){if(Date.now()-T0<20000)return;return _b(k);};woo=function(){if(Date.now()-T0<20000)return;return _w();};}
    try{render();}catch(e){}
  })();

  // 9 Nov: tasks as a card stack. Top card = now. Swipe right = done, left = tomorrow. Full list in a pop-up.
  let cutOpen=null,cutTouched=false,cutEarlierOpen=false,cutDesc=null,cutExpanded=false;
  const tmOf=d=>{const x=new Date(d+"T12:00");x.setDate(x.getDate()+1);return iso(x);};
  function sortedTasks(){return tasksOn(sel).sort((a,b)=>((a.block||0)-(b.block||0))||((a.order||0)-(b.order||0)));}
  function allTasksSheet(){psOpen("Today's tasks",re=>{const ts=sortedTasks().sort((a,b)=>!!a.done-!!b.done),tm=tmOf(sel);
    return [el("ul",{class:"cut-list"},...ts.map(t=>{const cb=el("input",{type:"checkbox","aria-label":"Done: "+t.title});cb.checked=!!t.done;cb.onchange=()=>{setDone(t.id,cb.checked);setTimeout(re,300);};
      return el("li",{class:"cl"+(t.done?" done":"")},el("div",{class:"cl-row"},cb,el("span",{class:"cl-t",text:t.title}),t.done?null:el("button",{type:"button",class:"btn ghost ce-go",onclick:()=>{moveTaskTo(t.id,tm);setTimeout(re,300);}},"Tomorrow")));}))];});}
  function swipeable(card,onRight,onLeft,onTap){let x0=null,y0=0,dx=0,dy=0,id=null,vert=false;
    card.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;x0=e.clientX;y0=e.clientY;dx=0;dy=0;vert=false;id=e.pointerId;card.style.transition="none";});
    card.addEventListener("pointermove",e=>{if(x0===null)return;dx=e.clientX-x0;dy=e.clientY-y0;if(!vert&&Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){vert=true;}if(vert){card.style.transform="";return;}if(Math.abs(dx)>8){try{card.setPointerCapture(id);}catch(_){}}card.style.transform="translateX("+dx+"px) rotate("+(dx/25)+"deg)";card.dataset.dir=dx>40?"r":dx<-40?"l":"";});
    const end=()=>{if(x0===null)return;x0=null;card.style.transition="";if(vert||Math.abs(dy)>8){card.style.transform="";card.dataset.dir="";return;}if(Math.abs(dx)<6&&onTap){card.style.transform="";onTap();return;}if(Math.abs(dx)>110){const r=dx>0;card.style.transform="translateX("+(r?1:-1)*innerWidth+"px) rotate("+(r?20:-20)+"deg)";card.style.opacity="0";setTimeout(()=>{r?onRight():onLeft();},220);}else{card.style.transform="";card.dataset.dir="";}};
    card.addEventListener("pointerup",end);card.addEventListener("pointercancel",end);}
  function renderCutList(){const box=document.getElementById("taskList");if(!box)return;
    box.querySelectorAll(":scope>.rail,:scope>.rail-tip,:scope>.empty,:scope>#cutList").forEach(x=>x.hidden=true);
    let ul=document.getElementById("cutStack");if(!ul){ul=el("div",{id:"cutStack",class:"cut-stack"});}
    if(ul.parentElement!==box)box.append(ul);
    const all=sortedTasks(),ts=all.filter(t=>!t.done),done=all.length-ts.length,tm=tmOf(sel);
    const earlier=sel>=iso(new Date())?Object.entries(state.tasks).map(([id,t])=>({id,...t})).filter(t=>isLeaf(t)&&t.date&&t.date<sel&&!t.done&&!t.cut).sort((a,b)=>a.date<b.date?-1:1):[];
    let eb=document.getElementById("cutEarlier");if(!eb){eb=el("div",{id:"cutEarlier",class:"cut-earlier"});}if(eb.parentElement!==box||eb.previousElementSibling!==ul)ul.after(eb);
    const earlierSheet=()=>psOpen("Earlier",re=>{const L=Object.entries(state.tasks).map(([id,t])=>({id,...t})).filter(t=>isLeaf(t)&&t.date&&t.date<sel&&!t.done&&!t.cut).sort((a,b)=>a.date<b.date?-1:1);
      return L.length?[el("ul",{class:"cut-list ce-list"},...L.map(t=>{const cb=el("input",{type:"checkbox","aria-label":"Done: "+t.title});cb.onchange=()=>{setDone(t.id,cb.checked);setTimeout(re,300);};
        return el("li",{class:"cl"},el("div",{class:"cl-row"},cb,el("span",{class:"cl-t",text:t.title}),el("button",{type:"button",class:"btn ghost ce-go",onclick:()=>{moveTaskTo(t.id,sel);setTimeout(re,300);}},"Today")));}))]:[el("p",{class:"ps-sh-sum",text:"All clear."})];});
    if(!earlier.length)rc(eb);else rc(eb,el("button",{type:"button",class:"ce-head",onclick:earlierSheet},el("span",{text:"Earlier"}),el("span",{class:"ce-n",text:String(earlier.length)})));

    if(!ts.length){rc(ul,el("div",{class:"cs-empty"},el("b",{text:all.length?"All done.":"No tasks."}),all.length?el("button",{type:"button",class:"cl-det",onclick:allTasksSheet},"See all"):null));return;}
    const card=(t,top)=>{const showD=cutDesc===t.id;
      const c=el("div",{class:"cs-card cs-top"+(top?"":" cs-flat"),role:"group","aria-label":t.title},
        el("span",{class:"cs-hint cs-hr","aria-hidden":"true",text:"Done"}),el("span",{class:"cs-hint cs-hl","aria-hidden":"true",text:"Tomorrow"}),
        el("div",{class:"cs-head"},el("h3",{class:"cs-t",text:t.title}),el("button",{type:"button",class:"cl-det","aria-expanded":String(showD),onclick:()=>{cutDesc=showD?null:t.id;renderCutList();}},showD?"Less":"Details")),
        showD&&t.desc?el("p",{class:"cl-d",text:String(t.desc)}):null,
        (top||showD)?el("div",{class:"cl-acts"},el("button",{type:"button",class:"btn cl-go",onclick:()=>{try{openTask=t.id;}catch(e){}const f=document.getElementById("pomoFab");if(f)f.click();}},"Start"),
          el("button",{type:"button",class:"btn ghost",onclick:()=>setDone(t.id,true)},"Done")):null);
      swipeable(c,()=>{setDone(t.id,true);setTimeout(renderTaskView,350);},()=>{cutDesc=null;moveTaskTo(t.id,tm);setTimeout(renderTaskView,350);},()=>{if(document.getElementById("taskView"))closeTaskView();else openTaskView();});return c;};
    const label=(ts.length>1?(ts.length-1)+" more":"")+(done?(ts.length>1?" · ":"")+done+" done":"");
    cutCard=card;renderTaskView();
    const behind=ts.slice(1,3).map((x,k)=>el("div",{class:"cs-card cs-b"+(k+1),"aria-hidden":"true"}));
    rc(ul,el("div",{class:"cs-pile"},...behind.reverse(),card(ts[0],true)),
      label?el("button",{type:"button",class:"cs-more",onclick:openTaskView},label):null);}
  let cutCard=null;
  function openTaskView(){if(document.getElementById("taskView"))return;cutDesc=null;const v=el("div",{id:"taskView",class:"task-view",role:"dialog","aria-modal":"true","aria-label":"Today's tasks"});
    v.addEventListener("click",e=>{if(e.target===v||e.target.classList.contains("tv-scroll"))closeTaskView();});
    document.body.append(v);document.body.classList.add("tv-open");renderTaskView();requestAnimationFrame(()=>v.classList.add("in"));
    addEventListener("keydown",tvKey);}
  function tvKey(e){if(e.key==="Escape")closeTaskView();}
  function closeTaskView(){const v=document.getElementById("taskView");if(!v)return;removeEventListener("keydown",tvKey);v.classList.remove("in");document.body.classList.remove("tv-open");setTimeout(()=>{v.remove();cutDesc=null;renderCutList();},200);}
  function renderTaskView(){const v=document.getElementById("taskView");if(!v||!cutCard)return;const ts=sortedTasks().filter(t=>!t.done),sc=v.querySelector(".tv-scroll"),y=sc?sc.scrollTop:0;
    const s=el("div",{class:"tv-scroll"},el("div",{class:"tv-head"},el("h2",{text:"Today"}),el("button",{type:"button",class:"tv-x",onclick:closeTaskView},"Close")),
      ts.length?el("div",{class:"cs-all"},...ts.map((t,k)=>cutCard(t,k===0))):el("p",{class:"tv-empty",text:"All done."}));
    rc(v,s);s.scrollTop=y;}
  {const _r=render;render=function(){_r();try{renderCutList();}catch(e){console.warn(e);}};}
  try{renderCutList();}catch(e){}
  // 9 Nov: levels of information on Money. Bottom line first, chart only when asked
  let finChartOn=false;try{finChartOn=localStorage.getItem("sb-chart")==="1";}catch(e){}
  {const _rf=renderFinance;renderFinance=function(){_rf();try{const h=document.querySelector(".fin-hero");if(!h)return;const ch=h.querySelector(".fin-chart"),lg=h.querySelector(".fh-leg");
    if(ch)ch.hidden=!finChartOn;if(lg)lg.hidden=!finChartOn;
    h.append(el("button",{type:"button",class:"cl-det fin-tg","aria-expanded":String(finChartOn),onclick:()=>{finChartOn=!finChartOn;try{localStorage.setItem("sb-chart",finChartOn?"1":"0");}catch(e){}renderFinance();}},finChartOn?"Hide chart":"Chart"));}catch(e){console.warn(e);}};}
  // 9 Nov: Review shows titles first (level 1). Waterfall and Insights start folded; tap to open
  try{if(!localStorage.getItem("sb-cut1-fold")){["wfH","ihH"].forEach(id=>{const sec=document.querySelector('section[aria-labelledby="'+id+'"]');const b=sec&&sec.querySelector(".collapse-btn");if(b&&!sec.classList.contains("collapsed"))b.click();});localStorage.setItem("sb-cut1-fold","1");}}catch(e){}
  try{const sp=document.querySelector('section[aria-labelledby="sprintH"]');if(sp&&sp.parentElement)sp.parentElement.prepend(sp);}catch(e){}
  // ===== 9 Nov: WAR MODE. Pick a target, gather its unfinished tasks, run one timer, clear them as cards =====
  const WAR_K="sb-war",WAR_C="sb-war-custom";
  // war state lives in the database (timers/war) so every device sees the same war; local copy only as offline fallback
  const warDoc=()=>(state.timers&&state.timers.war)||null;
  // ended wars are remembered (tombstone), so no device can bring one back
  const warDead=()=>{try{return JSON.parse(localStorage.getItem("sb-war-dead")||"[]");}catch(e){return [];}};
  const warBury=s=>{if(!s)return;const a=warDead();if(!a.includes(s)){a.push(s);try{localStorage.setItem("sb-war-dead",JSON.stringify(a.slice(-8)));}catch(e){}}};
  const warGet=()=>{const d=warDoc(),dead=warDead();if(d&&d.ended&&d.ended.start&&!dead.includes(d.ended.start))warBury(d.ended.start);
    if(d&&state.loaded&&state.loaded.timers){if(!d.active){try{if(localStorage.getItem(WAR_K))localStorage.removeItem(WAR_K);}catch(e){}return null;}return d.w&&!warDead().includes(d.w.start)?d.w:null;}
    try{const l=JSON.parse(localStorage.getItem(WAR_K)||"null");return l&&!dead.includes(l.start)?l:null;}catch(e){return null;}};
  // writes go out one at a time, newest last, so the server always ends on the latest state
  let warBusy=false,warNext=null;
  const warFlush=async()=>{if(warBusy||!warNext)return;warBusy=true;try{while(warNext){const b=warNext;warNext=null;try{await store.set("timers/war",b);}catch(e){}}}finally{warBusy=false;}};
  const warPut=w=>{const prev=(warDoc()||{}).w||null;try{w?localStorage.setItem(WAR_K,JSON.stringify(w)):localStorage.removeItem(WAR_K);}catch(e){}
    const body={active:!!w,w:w||null,custom:warCustom(),at:Date.now()};if(!w&&prev&&prev.start){warBury(prev.start);body.ended={start:prev.start,at:Date.now()};}
    state.timers={...(state.timers||{}),war:body};warNext=body;warFlush();};
  const warCustom=()=>{const d=warDoc();if(d&&Array.isArray(d.custom))return d.custom;try{return JSON.parse(localStorage.getItem(WAR_C)||"[]");}catch(e){return [];}};
  // start-up: a war that ended anywhere stays ended. A local copy that never reached the database is saved to Time, then dropped
  setTimeout(()=>{try{if(!(state.loaded&&state.loaded.timers))return;const d0=warDoc(),l0=JSON.parse(localStorage.getItem(WAR_K)||"null");
      if(l0&&warDead().includes(l0.start)){localStorage.removeItem(WAR_K);}
      else if(l0&&d0&&!(d0.active&&d0.w&&d0.w.start===l0.start)){
        if(!l0.pausedAt){l0.segs=(l0.segs||[]).concat([{start:l0.segStart||l0.start,end:Date.now()}]);l0.pausedAt=Date.now();}
        warSave(l0,true);warBury(l0.start);localStorage.removeItem(WAR_K);toast("This device had its own war on "+l0.label+". Its time is saved in Time.");render();}
      else if(!d0){const c0=JSON.parse(localStorage.getItem(WAR_C)||"[]");if(l0||c0.length){const body={active:!!l0,w:l0,custom:c0,at:Date.now()};state.timers={...(state.timers||{}),war:body};store.set("timers/war",body);}}}catch(e){}},2500);
  // horizon: the end of the current sprint; when nothing is left in it, the end of the next sprint
  const warOpenT=t=>!t.done&&!t.cut&&!t.archived&&t.kind!=="parent"&&t.date;
  function warHorizon(){const today=iso(new Date()),sp=sprintFor(today);if(!sp)return "9999";if(leafTasks().some(t=>warOpenT(t)&&t.date<=sp.end))return sp.end;const nx=sprints().find(p=>p.n===sp.n+1);return nx?nx.end:sp.end;}
  function warPool(tg){const end=warHorizon();
    return leafTasks().filter(t=>warOpenT(t)&&t.date<=end&&
      (tg.k==="parent"?t.parent===tg.v:tg.k==="cat"?t.cat===tg.v:String(t.title||"").toLowerCase().includes(String(tg.v).toLowerCase()))).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:(a.order||0)-(b.order||0));}
  function warTargets(){const out=[];
    const kids={};leafTasks().filter(t=>warOpenT(t)&&t.parent&&!isBk(t.parent)).forEach(t=>{(kids[t.parent]=kids[t.parent]||[]).push(t);});
    const end=warHorizon();Object.keys(kids).forEach(pid=>{const P=state.tasks[pid];if(!P||P.cut||P.archived)return;const L=kids[pid].filter(t=>t.date<=end);if(!L.length)return;
      out.push({k:"parent",v:pid,label:P.title||"Task",n:L.length,sub:L.length+" step"+(L.length>1?"s":"")+", "+(aboutH(L.reduce((a,x)=>a+estMin(x),0))||"no estimate"),first:L.reduce((a,x)=>x.date<a?x.date:a,"9999"),ord:P.order||0});});
    out.sort((a,b)=>a.first.localeCompare(b.first)||a.ord-b.ord);
    Object.keys(CAT_NAME).forEach(c=>{const n=warPool({k:"cat",v:c}).length;if(n)out.push({k:"cat",v:c,label:CAT_NAME[c],n});});
    warCustom().forEach(v=>out.push({k:"word",v,label:v,n:warPool({k:"word",v}).length,custom:true}));return out;}
  const hms=s=>{s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+":":"")+String(m).padStart(h?2:1,"0")+":"+String(x).padStart(2,"0");};
  function warActive(w){const now=Date.now();return Math.max(0,(now-w.start)-(w.pausedMs||0)-(w.pausedAt?now-w.pausedAt:0));}
  function warLeft(w){const el2=warActive(w)/1000;return w.dur?w.dur*60-el2:el2;}
  // save real time to Time: one entry per war, updated every minute, on pause, on each done task, on hide and when the app goes to the background
  function warCatOf(w){if(!w)return null;if(w.k==="cat")return w.v;if(w.k==="parent"||w.k==="task"){const t=state.tasks[w.v];if(t&&t.cat)return t.cat;}const t2=state.tasks[(w.ids||[])[0]];return (t2&&t2.cat)||null;}
  function warSave(w,foreign){w=w||warGet();if(!w)return;try{const d=iso(new Date(w.start)),mins=Math.floor((warActive(w)-(w.cp||0))/60000);if(mins<1&&!w.savedMin)return;
    if(!w.eid)w.eid="war"+w.start.toString(36);const id=w.eid,raw=itemsRaw(d)||[];
    // you deleted this war's entry: respect it, never write it back
    if(w.noSave)return;if((w.present||(w.present===undefined&&w.savedMin))&&!raw.some(x=>x.id===id)){w.noSave=true;warPut(w);return;}
    const items=raw.filter(x=>x.id!==id);const end=w.pausedAt||Date.now();
    const cpAt=w.cpAt||0;const segs=(w.segs||[]).concat(w.pausedAt?[]:[{start:w.segStart||w.start,end:Date.now()}]).map(s=>({start:Math.max(s.start,cpAt),end:s.end})).filter(s=>s.end-s.start>=30000);if(!segs.length)segs.push({start:Math.max(w.start,cpAt),end:w.pausedAt||Date.now()});const segs2=segs.map(s=>({start:s.start,end:s.end,minutes:Math.round((s.end-s.start)/60000),paused:0}));
    if(mins<1){if(w.present){saveEntries(d,items);w.present=false;if(!foreign)warPut(w);}return;}
    items.push({id,start:Math.max(w.start,cpAt),end,ref:"other",kind:"manual",label:"War on "+w.label,cat:warCatOf(w),note:w.done.length+" of "+w.ids.length+" done",minutes:mins,paused:Math.round(((w.pausedMs||0)+(w.pausedAt?Date.now()-w.pausedAt:0))/60000),sessions:segs2});
    saveEntries(d,items);w.savedMin=mins;w.present=true;if(!foreign)warPut(w);}catch(e){console.warn(e);}}
  function warPause(){const w=warGet();if(!w)return;if(w.pausedAt){w.pausedMs=(w.pausedMs||0)+(Date.now()-w.pausedAt);w.pausedAt=null;w.segStart=Date.now();}
    else{w.segs=(w.segs||[]).concat([{start:w.segStart||w.start,end:Date.now()}]);w.pausedAt=Date.now();}warPut(w);warSave(w);warRender();renderPopCards();}
  setInterval(()=>{const w=warGet();if(w&&!w.pausedAt)warSave(w);},60000);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")warSave();});
  addEventListener("pagehide",()=>warSave());
  setTimeout(()=>warSave(),3000);
  function warSetup(){let pick=null,dur=180,addMode=false;
    psOpen("War",re=>{const T=warTargets();
      const chip=(on,txt,fn,sub)=>el("button",{type:"button",class:"wr-chip"+(on?" on":""),"aria-pressed":String(on),onclick:fn},el("b",{text:txt}),sub!=null?el("span",{text:sub}):null);
      let addIn;
      return [el("p",{class:"wr-q",text:"War on what?"}),
        el("div",{class:"wr-grid"},...T.map(t=>chip(pick&&pick.k===t.k&&pick.v===t.v,t.label,()=>{pick=t;re();},t.n+" open")),
          addMode?null:chip(false,"+ Custom",()=>{addMode=true;re();setTimeout(()=>{const i=document.getElementById("wrIn");if(i)i.focus();},50);})),
        addMode?el("form",{class:"wr-add",onsubmit:e=>{e.preventDefault();const v=(document.getElementById("wrIn").value||"").trim();if(!v)return;const c=warCustom().slice();if(!c.includes(v)){c.push(v);try{localStorage.setItem(WAR_C,JSON.stringify(c));}catch(e){}const d=warDoc()||{active:false,w:null};const body={...d,custom:c,at:Date.now()};state.timers={...(state.timers||{}),war:body};try{store.set("timers/war",body);}catch(e){}}pick={k:"word",v,label:v};addMode=false;re();}},
          el("input",{id:"wrIn",placeholder:"A word your tasks share, like HASM","aria-label":"Custom target"}),el("button",{type:"submit",class:"btn"},"Add")):null,
        el("p",{class:"wr-q",text:"For how long?"}),
        el("div",{class:"wr-row"},...[[120,"2h"],[180,"3h"],[240,"4h"],[0,"Open"]].map(([m,l])=>chip(dur===m,l,()=>{dur=m;re();}))),
        (b=>{b.disabled=!pick||!warPool(pick).length;return b;})(el("button",{type:"button",class:"btn wr-go",onclick:()=>{const ids=warPool(pick).map(t=>t.id);warPut({k:pick.k,v:pick.v,label:pick.label,ids,done:[],start:Date.now(),dur});psClose();warOpen();renderPopCards();}},pick?"Start war on "+pick.label:"Pick a target"))];});}
  let warTick=0;
  function warOpen(){if(document.getElementById("warView"))return;const v=el("div",{id:"warView",class:"task-view war-view",role:"dialog","aria-modal":"true","aria-label":"War"});
    document.body.append(v);document.body.classList.add("tv-open");warRender();requestAnimationFrame(()=>v.classList.add("in"));
    clearInterval(warTick);warTick=setInterval(()=>{const w=warGet(),c=document.getElementById("wrClock");if(!w||!c)return;const s=warLeft(w);c.textContent=hms(Math.abs(s));c.classList.toggle("over",!!w.dur&&s<0);},1000);}
  function warClose(){clearInterval(warTick);warSave();const v=document.getElementById("warView");if(!v)return;v.classList.remove("in");document.body.classList.remove("tv-open");setTimeout(()=>{v.remove();renderPopCards();},200);}
  function warEnd(){const w=warGet();if(!w)return warClose();const mins=Math.floor(warActive(w)/60000);
    warSave(w);
    toast("War on "+w.label+": "+w.done.length+" of "+w.ids.length+" done in "+dur(mins));warPut(null);warClose();}
  let warDesc=null;
  function warRender(){const v=document.getElementById("warView"),w=warGet();if(!v||!w)return;
    const left=w.ids.filter(id=>!w.done.includes(id)&&state.tasks[id]&&!state.tasks[id].done);
    const s=warLeft(w);
    const top=left[0]&&state.tasks[left[0]]?{id:left[0],...state.tasks[left[0]]}:null;if(top){try{openTask=top.id;}catch(e){}}
    let card=null;
    if(top){const showD=warDesc===top.id;card=el("div",{class:"cs-card cs-top wr-card"},
        el("span",{class:"cs-hint cs-hr","aria-hidden":"true",text:"Done"}),el("span",{class:"cs-hint cs-hl","aria-hidden":"true",text:"Later"}),
        el("div",{class:"cs-head"},el("h3",{class:"cs-t",text:top.title}),el("button",{type:"button",class:"cl-det",onclick:()=>{warDesc=showD?null:top.id;warRender();}},showD?"Less":"Details")),
        showD&&top.desc?el("p",{class:"cl-d",text:String(top.desc)}):null,
        el("div",{class:"cl-acts"},el("button",{type:"button",class:"btn cl-go",onclick:()=>warDone(top.id)},"Done")));
      swipeable(card,()=>warDone(top.id),()=>{w.ids=w.ids.filter(x=>x!==top.id).concat(top.id);warPut(w);warDesc=null;warRender();},()=>{warDesc=warDesc===top.id?null:top.id;warRender();});}
    const behind=left.slice(1,3).map((x,k)=>el("div",{class:"cs-card cs-b"+(k+1),"aria-hidden":"true"}));
    rc(v,el("div",{class:"tv-scroll wr-scroll"},
      el("div",{class:"tv-head"},el("span",{class:"wr-tag",text:"War on "+w.label}),el("button",{type:"button",class:"tv-x",onclick:warClose},"Hide")),
      el("div",{class:"wr-clock-box"},el("div",{id:"wrClock",class:"wr-clock num"+(w.dur&&s<0?" over":""),text:hms(Math.abs(s))}),
        el("div",{class:"wr-sub",text:(w.pausedAt?"paused":w.dur?(s<0?"over time":"left"):"elapsed")+" · "+w.done.length+" of "+w.ids.length+" done"+(warActive(w)>=60000?" · "+dur(Math.floor(warActive(w)/60000))+" saved":"")}),
        el("button",{type:"button",class:"wr-pause",onclick:warPause},w.pausedAt?"Resume":"Pause"),
        el("div",{class:"wr-bar"},el("span",{style:"width:"+Math.round(w.done.length/Math.max(1,w.ids.length)*100)+"%"}))),
      top?el("div",{class:"cs-pile"},...behind.reverse(),card):el("div",{class:"cs-empty"},el("b",{text:"All cleared. War won."})),
      left.length>1?el("p",{class:"wr-left",text:(left.length-1)+" more after this"}):null,
      el("button",{type:"button",class:"btn ghost wr-end",onclick:warEnd},"End war")));v.classList.toggle("paused",!!w.pausedAt);}
  function warDone(id){const w=warGet();if(!w)return;setDone(id,true);if(!w.done.includes(id))w.done.push(id);
    try{const act=warActive(w),ms=act-(w.cp||0),t=state.tasks[id]||{};if(ms>=60000){const now=Date.now(),d=iso(new Date(w.start)),raw=(itemsRaw(d)||[]).slice();
      raw.push({id:"wt"+w.start.toString(36)+id.replace(/[^a-z0-9]/gi,""),ref:"tasks:"+id,kind:"manual",label:t.title||"Task",note:"War on "+w.label,minutes:Math.round(ms/60000),start:now-ms,end:now,paused:0,sessions:[{start:now-ms,end:now,minutes:Math.round(ms/60000),paused:0}]});
      saveEntries(d,raw);}w.cp=act;w.cpAt=Date.now();}catch(e){console.warn(e);}
    warPut(w);warSave(w);warDesc=null;setTimeout(warRender,250);}
  // the War card on Today: distinctive, full width; shows the target and time when a war is running
  {const _rp=renderPopCards;renderPopCards=function(){_rp();const row=document.getElementById("popCards");if(!row)return;const w=warGet();
    let c=document.getElementById("warCard");if(!c){c=el("button",{type:"button",id:"warCard",class:"pop-card war-card"});c.onclick=()=>{warGet()?warOpen():warSetup();};}
    rc(c,el("span",{class:"fc-t",text:w?"War on "+w.label:"War"}),el("span",{class:"wr-cs",text:w?(w.pausedAt?"Paused":w.dur?Math.max(0,Math.round(warLeft(w)/60))+" min left":Math.round(warLeft(w)/60)+" min in")+" · "+w.done.length+"/"+w.ids.length:"Clear unfinished tasks"}));
    if(c.parentElement!==row)row.prepend(c);};}
  setInterval(()=>{if(warGet()&&!document.getElementById("warView"))try{renderPopCards();}catch(e){}},60000);
  {const _r2=render;render=function(){_r2();try{const v=document.getElementById("warView");if(v){if(!warGet())warClose();else warRender();}}catch(e){}};}
  try{renderPopCards();}catch(e){}
  window.__sbWar={get:()=>warGet(),put:w=>warPut(w)};
  // 9 Nov: everything that matters syncs through the database. Seen notifications and the Money chart choice follow you across devices
  notifSeen=function(){const d=(state.settings&&state.settings.nseen)||null;let l={};try{l=JSON.parse(localStorage.getItem("sb-nseen")||"{}");}catch(e){}return {...l,...((d&&d.m)||{})};};
  notifMark=function(ids){const s=notifSeen(),t=Date.now();ids.forEach(i=>s[i]=t);for(const k in s)if(t-s[k]>14*864e5)delete s[k];try{localStorage.setItem("sb-nseen",JSON.stringify(s));}catch(e){}
    state.settings={...(state.settings||{}),nseen:{m:s,at:t}};try{store.set("settings/nseen",{m:s,at:t});}catch(e){}};
  {const _rf2=renderFinance;renderFinance=function(){const p=state.settings&&state.settings.prefs;if(p&&typeof p.chart==="boolean")finChartOn=p.chart;_rf2();
    const b=document.querySelector(".fin-hero .fin-tg");if(b){const o=b.onclick;b.onclick=()=>{const v=!finChartOn;state.settings={...(state.settings||{}),prefs:{...((state.settings||{}).prefs||{}),chart:v,at:Date.now()}};try{store.set("settings/prefs",state.settings.prefs);}catch(e){}o&&o();};}};}
  // 9 Nov: Time shows when things happened visually, not as clock text. One day bar on top, a thin bar per entry
  const TB0=5*60,TB1=22*60;
  const tbPos=t=>{const d=new Date(+t),mm=d.getHours()*60+d.getMinutes();return Math.max(0,Math.min(100,(mm-TB0)/(TB1-TB0)*100));};
  function timeVisual(){const sec=document.querySelector('section[aria-labelledby="entH"]');if(!sec)return;
    sec.querySelectorAll(".sess-btn[data-s]").forEach(b=>{if(b.dataset.vis)return;b.dataset.vis="1";const l=tbPos(b.dataset.s),r=tbPos(b.dataset.e);
      b.style.setProperty("--l",l+"%");b.style.setProperty("--w",Math.max(1.2,r-l)+"%");});
    let top=sec.querySelector(".tb-day");const ss=[...sec.querySelectorAll(".sess-btn[data-s]")].map(b=>[+b.dataset.s,+b.dataset.e]);
    if(!top){top=el("div",{class:"tb-day","aria-hidden":"true"});const list=sec.querySelector("ul,ol");if(list)list.before(top);else sec.append(top);}
    const now=Date.now(),isToday=sel===iso(new Date());
    rc(top,el("div",{class:"tb-track"},...ss.map(([a,b])=>el("span",{class:"tb-seg",style:"left:"+tbPos(a)+"%;width:"+Math.max(1,tbPos(b)-tbPos(a))+"%"})),isToday?el("span",{class:"tb-now",style:"left:"+tbPos(now)+"%"}):null),
      el("div",{class:"tb-lab"},...["5 AM","9 AM","1 PM","5 PM","10 PM"].map(t=>el("span",{text:t}))));}
  {const _r3=render;render=function(){_r3();try{timeVisual();}catch(e){}};}
  try{timeVisual();}catch(e){}
  // ===== 9 Nov: Sounds as pop-ups. Three cards: Noise mixer, To listen, Your files. A floating Queue button on every page =====
  let sndOpen=null;const SND=[["mix","Noise mixer","music"],["queue","To listen","play"],["files","Your files","inbox"]];
  {const _rs=renderSounds2;renderSounds2=function(){const box=document.getElementById("soundsBody");if(!box)return;const pg=box.closest(".page");
    if(sndOpen){const b0=document.querySelector(".ps-sheet .ps-sh-body"),ae=document.activeElement;if(b0&&ae&&b0.contains(ae)&&/INPUT|SELECT|TEXTAREA/.test(ae.tagName)&&ae.type!=="range")return;}
    const wasHidden=pg&&pg.hidden;if(wasHidden&&!sndOpen)return;if(wasHidden)pg.hidden=false;
    try{_rs();}finally{if(wasHidden)pg.hidden=true;}
    const secs=[...box.children].filter(x=>x.tagName==="SECTION");if(secs.length<3)return;
    let hold=document.getElementById("sndHold");if(!hold){hold=el("div",{id:"sndHold",hidden:""});document.body.append(hold);}
    const map={mix:secs[0],queue:secs[1],files:secs[2]};
    if(sndOpen){const body=document.querySelector(".ps-sheet .ps-sh-body");if(body){const s=map[sndOpen];s.classList.add("in-pop");if(sndOpen==="queue")queueDrag(s);rc(body,s);}}
    const waiting=lsItems().filter(x=>x.kind==="group"?!lsGroupDone(x):!x.done).length;
    const sub={mix:nz?"Playing "+nzName:"Off",queue:waiting+" waiting",q2:"",files:locFiles.length?locFiles.length+" files":"On this device"};
    rc(box,el("div",{class:"snd-cards"},...SND.map(([k,t,ic])=>el("button",{type:"button",class:"pop-card snd-card",onclick:()=>openSnd(k)},el("span",{class:"fc-ic"},xico(ic)),el("span",{class:"fc-t",text:t}),el("span",{class:"snd-sub",text:sub[k]})))));
    Object.entries(map).forEach(([k,s])=>{if(k!==sndOpen)hold.append(s);});
    qFab();};}
  function openSnd(k){sndOpen=k;const t=SND.find(x=>x[0]===k)[1];psOpen(t,()=>{setTimeout(()=>{if(sndOpen)renderSounds2();},0);return [el("div",{class:"snd-wait"})];},{onClose:()=>{sndOpen=null;setTimeout(renderSounds2,0);}});}
  // reorder the queue: press and hold a row, then drag it up or down
  function queueDrag(sec){const list=sec.querySelector(".ls-list");if(!list||list.dataset.dr)return;list.dataset.dr="1";
    const ids=lsItems().filter(x=>x.kind==="group"?!lsGroupDone(x):!x.done).map(x=>x.id);
    [...list.children].forEach((li,i)=>{li.dataset.id=ids[i];li.classList.add("q-drag");
      let t=null,y0=0,on=false,ph=null;
      li.addEventListener("pointerdown",e=>{if(e.target.closest("button,summary button,input,a"))return;y0=e.clientY;t=setTimeout(()=>{on=true;li.classList.add("q-lift");try{li.setPointerCapture(e.pointerId);}catch(_){}if(navigator.vibrate)navigator.vibrate(10);},280);});
      li.addEventListener("pointermove",e=>{if(!on){if(Math.abs(e.clientY-y0)>8)clearTimeout(t);return;}e.preventDefault();const dy=e.clientY-y0;li.style.transform="translateY("+dy+"px)";
        const sib=[...list.children].filter(x=>x!==li);const mid=e.clientY;let before=null;for(const s of sib){const r=s.getBoundingClientRect();if(mid<r.top+r.height/2){before=s;break;}}ph=before;});
      const up=()=>{clearTimeout(t);if(!on)return;on=false;li.classList.remove("q-lift");li.style.transform="";
        const order=[...list.children].filter(x=>x!==li);const idx=ph?order.indexOf(ph):order.length;order.splice(idx,0,li);
        const newIds=order.map(x=>x.dataset.id).filter(Boolean);const base=Date.now();newIds.forEach((id,k)=>{const cur=state.listen[id];if(cur&&cur.order!==base+k)lsUpd(id,{order:base+k});});};
      li.addEventListener("pointerup",up);li.addEventListener("pointercancel",up);});}
  // floating Queue button: on every page, opens To listen
  function qFab(){let b=document.getElementById("qFab");if(!b){b=el("button",{type:"button",id:"qFab",class:"q-fab","aria-label":"Listening queue"},xico("music"),el("span",{class:"q-n"}));b.onclick=()=>openSnd("queue");document.body.append(b);}
    const n=lsItems().filter(x=>x.kind==="group"?!lsGroupDone(x):!x.done).length;b.querySelector(".q-n").textContent=n?String(n):"";b.classList.toggle("on",!!(typeof ytNow!=="undefined"&&ytNow));}
  {const _r4=render;render=function(){_r4();try{qFab();}catch(e){}};}
  try{qFab();}catch(e){}
