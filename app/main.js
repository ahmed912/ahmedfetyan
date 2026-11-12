
(function(){
  const START = "2026-11-03", END = "2027-01-03";
  const CAT = {setup:"#7C8696",portfolio:"#C2410C",brand:"#7048E8",linkedin:"#1C7ED6",outreach:"#2B8A3E",learning:"#B7791F",client:"#0B7285",review:"#5E6472"};
  const CAT_NAME = {setup:"Setup",portfolio:"Portfolio",brand:"Brand",linkedin:"LinkedIn",outreach:"Inbound",learning:"Learning",client:"Client work",review:"Review"};
  const DEFAULT_SPRINTS = [
    {n:1,name:"Set up and first proof",start:"2026-11-03",end:"2026-11-12",goal:"Systems running, StoryBrand finished, HASM case study live",posts:5,comments:40,applications:2},
    {n:2,name:"Brand foundation and first proof",start:"2026-11-13",end:"2026-11-25",goal:"HASM and Javelin live, brand script and LinkedIn profile done, posting daily",posts:11,comments:35,applications:4},
    {n:3,name:"First demand",start:"2026-11-26",end:"2026-12-05",goal:"Mugassam live, post bank back to 5, first inquiry calls",posts:22,comments:75,applications:8},
    {n:4,name:"Second project, portfolio draft",start:"2026-12-06",end:"2026-12-15",goal:"Real estate live by 13 Dec, offline portfolio draft",posts:34,comments:120,applications:12},
    {n:5,name:"Portfolio v1",start:"2026-12-16",end:"2026-12-25",goal:"Offline portfolio v1 in 2 versions by 18 Dec, F&B live",posts:47,comments:175,applications:16},
    {n:6,name:"Close Milestone 1",start:"2026-12-26",end:"2027-01-03",goal:"Keynote live by 31 Dec, Gate 1 review on 3 Jan",posts:60,comments:240,applications:20}
  ];
  const STATUS = ["todo","doing","live"], STATUS_NAME = {todo:"To do",doing:"In progress",live:"Live"};

  const state = {tasks:{}, logs:{}, sprints:{}, projects:{}, learning:{}, inquiries:{}, timers:{}, entries:{}, reminders:{}, events:{}, habits:{}, sleep:{}, guard:{}, settings:{}, gym:{}, salah:{}, listen:{}, notes:{}, design:{}, loaded:{design:false,notes:false,listen:false,salah:false,gym:false,settings:false,sleep:false,guard:false,habits:false,reminders:false,entries:false,timers:false,tasks:false,logs:false,sprints:false,projects:false,learning:false,inquiries:false}};
  const ISTATUS=["new","call","proposal","won","lost"], ISTATUS_NAME={new:"New",call:"Call booked",proposal:"Proposal sent",won:"Won",lost:"Lost"};
  const SOURCES=["LinkedIn","Behance","Upwork","Referral","Other"];
  function inquiriesOn(d){return Object.values(state.inquiries).filter(x=>x.date===d).length;}
  const LSTATUS=["todo","doing","done"], LSTATUS_NAME={todo:"To do",doing:"In progress",done:"Done"};
  const CSTATUS_NAME={todo:"Not started",doing:"In progress",live:"Delivered"};
  let db = null, sel = clampDate(iso(new Date()));

  function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function parse(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d);}
  function addDays(s,n){const d=parse(s);d.setDate(d.getDate()+n);return iso(d);}
  function clampDate(s){return s<START?START:(s>END?END:s);}
  function dayIndex(s){return Math.round((parse(s)-parse(START))/864e5)+1;}
  function isFriday(s){return parse(s).getDay()===5;}
  function fmt(s,opts){return parse(s).toLocaleDateString("en-GB",opts||{weekday:"long",day:"numeric",month:"long"});}
  // replaceChildren that skips empty parts (null, undefined, false) instead of printing them as text
  function rc(node,...kids){node.replaceChildren(...kids.flat().filter(k=>k!==null&&k!==undefined&&k!==false&&k!==""));}
  function el(tag,attrs,...kids){const e=document.createElement(tag);if(attrs)for(const k in attrs){if(attrs[k]===null||attrs[k]===undefined)continue;if(k==="class")e.className=attrs[k];else if(k==="text")e.textContent=attrs[k];else if(k.startsWith("on"))e.addEventListener(k.slice(2),attrs[k]);else if(k==="style")e.style.cssText=attrs[k];else e.setAttribute(k,attrs[k]);}for(const c of kids){if(c==null)continue;e.append(c.nodeType?c:document.createTextNode(c));}if((tag==="textarea"||(tag==="input"&&(!attrs||!attrs.type||attrs.type==="text"||attrs.type==="search")))&&!e.hasAttribute("dir"))e.dir="auto";return e;}

  // ---------- offline outbox: changes made without a connection wait here and sync when back online ----------
  const store=(function(){
    let outbox=[]; try{outbox=JSON.parse(localStorage.getItem("sb-outbox")||"[]")||[];}catch(e){outbox=[];}
    let flushing=false;
    const persist=()=>{try{localStorage.setItem("sb-outbox",JSON.stringify(outbox));}catch(e){}updateSync();if(window.__sbOutboxChanged)window.__sbOutboxChanged();};
    const transient=e=>!navigator.onLine||!e||!e.code||["unavailable","resource_exhausted","revoked"].includes(e.code)||e.code==="capability_disabled";
    async function run(job){
      if(job.op==="set")return db.doc(job.path).set(job.body);
      if(job.op==="update")return db.doc(job.path).update(job.body);
      if(job.op==="del")return db.doc(job.path).delete();
    }
    async function exec(job){
      if(!db||!navigator.onLine||outbox.length){outbox.push(job);persist();return;}
      try{await run(job);}catch(e){if(transient(e)){outbox.push(job);persist();}else throw e;}
    }
    async function flush(){
      if(flushing||!db||!navigator.onLine||!outbox.length)return; flushing=true;
      try{while(outbox.length){try{await run(outbox[0]);}catch(e){if(transient(e))break;}outbox.shift();persist();}}
      finally{flushing=false;updateSync();if(!outbox.length&&syncWasPending){syncWasPending=false;toast("All changes synced");}}
    }
    let syncWasPending=outbox.length>0;
    window.addEventListener("online",()=>{updateSync();flush();});
    window.addEventListener("offline",updateSync);
    setInterval(flush,20000);
    return {
      set:(path,body)=>exec({op:"set",path,body}),
      update:(path,body)=>exec({op:"update",path,body}),
      del:(path)=>exec({op:"del",path}),
      add:async(col,body)=>{const id=(Date.now().toString(36)+Math.random().toString(36).slice(2,8));await exec({op:"set",path:col+"/"+id,body});return {id};},
      flush, pending:()=>{if(outbox.length)syncWasPending=true;return outbox.length;}
    };
  })();
  function updateSync(){
    const c=document.getElementById("syncChip"); if(!c)return; const n=store?store.pending():0;
    if(!navigator.onLine){c.className="chip warn";c.textContent="Offline"+(n?": "+n+" change"+(n>1?"s":"")+" waiting":"");c.hidden=false;}
    else if(n){c.className="chip warn";c.textContent="Syncing "+n+" change"+(n>1?"s":"");c.hidden=false;}
    else{c.hidden=true;}
  }
  // ---------- deep work blocks ----------
  const BLOCKS=[
    {id:"deep1",name:"Deep 1",win:"5:00 to 8:00",min:180,use:"Portfolio or client: the hardest design work"},
    {id:"deep2",name:"Deep 2",win:"8:20 to 11:20",min:180,use:"Portfolio or client work"},
    {id:"block3",name:"Block 3",win:"12:20 to 2:30",min:130,use:"LinkedIn content creation"},
    {id:"block4",name:"Block 4",win:"2:45 to 4:50",min:125,use:"Engagement, applications, inquiry replies"},
    {id:"block5",name:"Block 5",win:"5:05 to 7:05",min:120,use:"Learning and English",learning:true}
  ]; // the old fixed blocks: kept only so logged history and hours still read correctly
  // ---------- the day in 4 blocks (Today view) ----------
  const DAY_BLOCKS=[
    {n:1,name:"Learning",from:"05:15",to:"08:00"},
    {n:2,name:"Design",from:"08:00",to:"16:00"},
    {n:3,name:"LinkedIn and brand",from:"16:15",to:"17:45"},
    {n:4,name:"Gym and family",from:"18:00",to:"21:30"}];
  const CAT_ICO={setup:"⚙️",portfolio:"\u{1F3A8}",brand:"\u{1F9ED}",linkedin:"✍️",outreach:"\u{1F4E5}",learning:"\u{1F4DA}",client:"\u{1F4BC}",review:"\u{1F501}"};
  const DSTATES=[["normal","Normal"],["low","Low"],["sick","Sick"],["rest","Rest"]], DSTATE_NAME=Object.fromEntries(DSTATES);
  function hmMin(s){const [h,m]=String(s).split(":").map(Number);return h*60+m;}
  function blkLen(b){return hmMin(b.to)-hmMin(b.from);}
  function taskBlock(t){const b=Number(t&&t.block);if(b===1||b===2||b===3||b===5)return b;const c=t&&t.cat;return c==="learning"?1:(c==="portfolio"||c==="client")?2:3;}
  function isDesign(t){return !!t&&(t.cat==="portfolio"||t.cat==="client");}
  function isBankTask(t){return /^bank:/i.test(String((t&&t.title)||"").trim());}
  function restDay(d){const s=log(d).dayState;return s==="sick"||s==="rest";}
  // focus minutes logged inside a block's window on day d (overlapping timers count once)
  function winFocusMin(d,from,to){const a=atOn(d,from),b=atOn(d,to),iv=[];
    itemsOn(d).forEach(x=>{if(x.kind==="event"||x.kind==="break"||isEstimate(x))return;sessionsOf(x).forEach(se=>{const s=Math.max(a,se.start),e=Math.min(b,se.end);if(e>s)iv.push([s,e]);});});
    iv.sort((p,q)=>p[0]-q[0]);let tot=0,cs=null,ce=null;
    iv.forEach(([s,e])=>{if(cs===null){cs=s;ce=e;}else if(s<=ce)ce=Math.max(ce,e);else{tot+=ce-cs;cs=s;ce=e;}});if(cs!==null)tot+=ce-cs;return tot/60000;}
  function blkPrayers(d,b){try{const t=prayTimesFor(d.split("-").map(Number),prayCfg().city);if(!t)return [];const a=atOn(d,b.from),z=atOn(d,b.to);
    return PRAY_NAMES.filter(([n])=>n!=="sunrise"&&t[n]>=a&&t[n]<z).map(([n,l])=>l+" "+prayFmt(t[n]));}catch(e){return [];}}
  function bankN(){let dr=0,ps=0;for(const k in state.logs){const L=state.logs[k]||{};dr+=Number(L.drafts||0);ps+=Number(L.posts||0);}return dr-ps;}
  function nextWork(d){let x=addDays(d,1);while(isFriday(x))x=addDays(x,1);return x;}
  function activeTimer(){const t=state.timers.active;return t&&t.block?t:null;}
  function elapsedMs(t){if(!t)return 0;const end=t.pausedAt||Date.now();return Math.max(0,end-t.startedAt-(t.pausedTotal||0));}
  function clock(ms){const sec=Math.floor(ms/1000),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),x=sec%60;return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(x).padStart(2,"0");}
  function dur(min){min=Math.round(min);const h=Math.floor(min/60),m=min%60;return h?(h+"h"+(m?" "+m+"m":"")):m+"m";}
  async function setTimerDoc(body){
    state.timers={...state.timers,active:body};render();
    if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return;}
    try{await store.set("timers/active",body);}catch(e){fail(e);}
  }
  function startBlock(id){const now=Date.now();setTimerDoc({block:id,date:iso(new Date()),startedAt:now,pausedAt:null,pausedTotal:0});toast(BLOCKS.find(b=>b.id===id).name+" started. Phone on focus mode.");}
  function pauseBlock(){const t=activeTimer();if(!t||t.pausedAt)return;say("Block paused");setTimerDoc({...t,pausedAt:Date.now()});}
  function resumeBlock(){const t=activeTimer();if(!t||!t.pausedAt)return;say("Block resumed");setTimerDoc({...t,pausedTotal:(t.pausedTotal||0)+(Date.now()-t.pausedAt),pausedAt:null});}
  function addBlockMinutes(date,id,minutes){
    const b=BLOCKS.find(x=>x.id===id); const L={...log(date)}; const blocks={...(L.blocks||{})};
    blocks[id]=Math.round(((blocks[id]||0)+minutes)*10)/10; L.blocks=blocks; L.date=date;
    state.logs[date]=L; queueSave(date,50);
  }
  function stopBlock(){
    const t=activeTimer(); if(!t)return; const minutes=elapsedMs(t)/60000;
    setTimerDoc({block:null});
    if(minutes<1){toast("Under a minute, so nothing was logged");return;}
    addBlockMinutes(t.date,t.block,minutes);
    addEntry(t.date,{kind:"block",ref:t.block,label:BLOCKS.find(b=>b.id===t.block).name,start:t.startedAt,end:t.pausedAt||Date.now(),minutes,paused:(t.pausedTotal||0)/60000}); woo(); toast(BLOCKS.find(b=>b.id===t.block).name+": "+dur(minutes)+" logged");
  }
  function renderRunbar(){
    const bar=document.getElementById("runbar"), t=activeTimer(), k=taskTimer(), parts=[];
    if(t){const b=BLOCKS.find(x=>x.id===t.block);
      parts.push(el("span",{class:"rb"},el("span",{class:"dot"}),el("span",{text:b?b.name:"Block"}),el("span",{class:"t","data-clock":"1",text:clock(elapsedMs(t))}),
        t.pausedAt?el("button",{text:"Resume",onclick:resumeBlock}):el("button",{text:"Pause",onclick:pauseBlock}),el("button",{class:"stop",text:"Stop",onclick:stopBlock})));}
    if(k){parts.push(el("span",{class:"rb"},el("span",{class:"dot tdot"}),el("span",{class:"rbname",text:k.text}),el("span",{class:"t","data-tclock":"1",text:taskClockText(k)}),
        k.pausedAt?el("button",{text:"Resume",onclick:resumeTask}):el("button",{text:"Pause",onclick:pauseTask}),el("button",{class:"stop",text:"Stop",onclick:()=>stopTask(false)})));}
    const sl=sleepActive();
    if(sl)parts.push(el("span",{class:"rb"},el("span",{text:sl.kind==="nap"?"💤":"🌙"}),el("span",{text:sl.kind==="nap"?"Nap":"Sleeping"}),el("span",{class:"t","data-sclock":"1",text:clock(Date.now()-sl.startedAt)}),el("button",{class:"stop",text:"I'm awake",onclick:wakeUp})));
    rc(bar,...parts);
    if(parts.length){bar.hidden=false;document.body.classList.add("has-run");}else{bar.hidden=true;document.body.classList.remove("has-run");}
  }
  // ---------- time entries: when you worked, kept per day; one entry can hold several sessions ----------
  function sessionsOf(x){if(Array.isArray(x.sessions))return x.sessions;return x.start&&x.end?[{start:x.start,end:x.end,minutes:x.minutes,paused:x.paused||0}]:[];}
  function firstAt(x){return x.at||((sessionsOf(x)[0]||{}).start)||9e15;}
  function entriesOn(d){const e=state.entries[d];return (e&&Array.isArray(e.items)?e.items:[]).slice().sort((a,b)=>firstAt(a)-firstAt(b));}
  async function saveEntries(d,items){state.entries={...state.entries,[d]:{date:d,items}};render();try{await store.set("entries/"+d,{date:d,items});}catch(e){fail(e);}}
  const r1=n=>Math.round(n*10)/10;
  function addEntry(d,item){
    const items=entriesOn(d).map(x=>({...x,sessions:sessionsOf(x)}));
    const sess=item.start&&item.end?{start:item.start,end:item.end,minutes:r1(item.minutes),paused:r1(item.paused||0)}:null;
    const same=(item.kind==="block"||item.kind==="task")&&items.find(x=>x.kind===item.kind&&x.ref===item.ref&&x.label===item.label);
    if(same&&sess){same.sessions=[...same.sessions,sess];same.minutes=r1((same.minutes||0)+item.minutes);delete same.start;delete same.end;saveEntries(d,items);return;}
    const {start,end,paused,...rest}=item;
    items.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),...rest,minutes:r1(item.minutes),sessions:sess?[sess]:[]});
    saveEntries(d,items);
  }
  function addSessionTo(d,entryId,start,end){
    const items=entriesOn(d).map(x=>({...x,sessions:sessionsOf(x)})), x=items.find(y=>y.id===entryId); if(!x)return;
    const minutes=(end-start)/60000; x.sessions=[...x.sessions,{start,end,minutes:r1(minutes),paused:0}]; x.minutes=r1((x.minutes||0)+minutes); delete x.start; delete x.end;
    // keep the totals in step with the entry
    const b=BLOCKS.find(z=>z.id===x.ref);
    if((x.kind==="task"||x.kind==="manual")&&state.projects[x.ref]){const p=state.projects[x.ref];
      const todos=x.todoId?(p.todos||[]).map(t=>t.id===x.todoId?{...t,spent:r1((t.spent||0)+minutes)}:t):(p.todos||[]);
      state.projects[x.ref]={...p,todos};store.update("projects/"+x.ref,{todos}).catch(fail);}
    else if(b)addBlockMinutes(d,b.id,minutes);
    else{/* "Other work": the session itself counts toward Hours worked */}
    saveEntries(d,items); toast(dur(minutes)+" session added to "+x.label);
  }
  function hhmm(ms){const d=new Date(ms);return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");}
  function atOn(d,hm){const [h,m]=hm.split(":").map(Number),b=parse(d);return new Date(b.getFullYear(),b.getMonth(),b.getDate(),h,m).getTime();}
  const STRIP_FROM=3, STRIP_TO=23; let sessFor=null, renaming=null;
  function renameEntry(d,id,name){const items=entriesOn(d).map(x=>({...x,sessions:sessionsOf(x)}));const x=items.find(y=>y.id===id);if(!x)return;
    const n=String(name||"").trim();if(n&&n!==x.label)x.name=n;else delete x.name;renaming=null;saveEntries(d,items);toast(n?"Renamed":"Name reset");}
  // the bottom line of the day: hours worked, big, with what it was made of
  function renderEntHero(items,total){
    const box=document.getElementById("entHero");if(!box)return;
    const adj=hoursAdj(sel)*60, worked=Math.max(0,total+adj), fri=isFriday(sel), plan=fri?0:DAY_BLOCKS.filter(b=>b.n<4).reduce((a,b)=>a+blkLen(b),0);
    const real=items.filter(x=>x.kind!=="event"&&x.kind!=="break");
    const learnM=unionMin(real.filter(isLearning)), deepM=unionMin(real.filter(x=>!isLearning(x))), brkM=items.filter(x=>x.kind==="break").reduce((a,x)=>a+Number(x.minutes||0),0);
    const live=items.some(x=>x.live);
    const scale=Math.max(plan,worked,1);
    const seg=(cls,m,t)=>m>0?el("span",{class:"eh-seg "+cls,style:"width:"+(m/scale*100)+"%",title:t+": "+dur(m)}):null;
    const workPart=Math.max(0,worked-learnM);
    const bar=el("div",{class:"eh-bar",role:"img","aria-label":dur(worked)+" worked"+(plan?" of "+dur(plan)+" planned":"")},
      ...[seg("work",workPart,"Work"),seg("learn",Math.min(learnM,worked),"Learning"),seg("brk",brkM,"Breaks")].filter(Boolean),
      plan&&worked<plan?null:null);
    const pct=plan?Math.round(worked/plan*100):null;
    const stat=(cls,label,m)=>el("span",{class:"eh-k"},el("i",{class:"eh-sw "+cls}),label+" ",el("b",{class:"num",text:dur(m)}));
    rc(box,
      el("div",{class:"eh-top"},
        el("div",{class:"eh-big"},el("b",{class:"num",text:worked>=1?dur(worked):"0m"}),el("span",{class:"eh-lbl",text:"worked"+(sel===iso(new Date())?" today":" on "+fmt(sel,{weekday:"short",day:"numeric",month:"short"}))+(live?" · live":"")})),
        plan?el("div",{class:"eh-pct"},el("b",{class:"num",text:pct+"%"}),el("span",{class:"hint",text:"of "+dur(plan)+" planned"})):el("div",{class:"eh-pct"},el("span",{class:"hint",text:"Friday: rest day"}))),
      bar,
      el("div",{class:"eh-keys"},stat("work","Work",workPart),stat("learn","Learning",Math.min(learnM,worked)),brkM?stat("brk","Breaks",brkM):null,
        adj?el("span",{class:"hint",text:(adj>0?"+":"−")+dur(Math.abs(adj))+" adjusted by hand"}):null));
  }
  function renderEntries(){
    const items=entriesOn(sel).filter(x=>!isEstimate(x)).concat(liveItems(sel)), total=unionMin(items), work=items.filter(x=>x.kind!=="event");
    document.getElementById("entSum").textContent=work.length?work.length+" entr"+(work.length>1?"ies":"y")+" · overlaps counted once":"nothing recorded yet";
    renderEntHero(items,total);
    const strip=document.getElementById("entStrip"), span=(STRIP_TO-STRIP_FROM)*60, segs=[];
    items.forEach(x=>sessionsOf(x).forEach(se=>{const a=new Date(se.start),b=new Date(se.end);
      const m1=Math.max(0,a.getHours()*60+a.getMinutes()-STRIP_FROM*60), m2=Math.min(span,b.getHours()*60+b.getMinutes()-STRIP_FROM*60+(b.getDate()!==a.getDate()?24*60:0));
      segs.push(el("span",{class:"seg-"+x.kind,style:"left:"+(m1/span*100)+"%;width:"+Math.max(0.6,(m2-m1)/span*100)+"%",title:hhmm(se.start)+" to "+hhmm(se.end)+" "+x.label}));}));
    items.filter(x=>x.kind==="event"&&x.at).forEach(x=>{const a=new Date(x.at),m=a.getHours()*60+a.getMinutes()-STRIP_FROM*60;if(m>=0&&m<=span)segs.push(el("span",{class:"tick",style:"left:"+(m/span*100)+"%",title:hhmm(x.at)+" "+x.label}));});
    rc(strip,...segs);
    const ax=document.getElementById("entAxis");
    if(!ax.children.length)ax.replaceChildren(...[3,6,9,12,15,18,21].map(h=>el("span",{style:"left:"+((h-STRIP_FROM)/(STRIP_TO-STRIP_FROM)*100)+"%",text:(h<10?"0":"")+h+":00"})));
    const ul=document.getElementById("entList");
    rc(ul,...(items.length?items.flatMap(x=>{
      if(x.kind==="event"){const del=el("button",{class:"x","aria-label":"Remove this "+x.label,text:"\u00d7",onclick:()=>{saveEntries(sel,entriesOn(sel).filter(y=>y.id!==x.id));if(x.key==="post"){const L={...log(sel),date:sel};L.posts=Math.max(0,Number(L.posts||0)-1);state.logs[sel]=L;render();queueSave(sel,300);}toast("Removed");}});
        return [el("li",{class:"ent ev"},el("span",{class:"ent-dot seg-event"}),el("span",{class:"ent-when num",text:x.at?hhmm(x.at):""}),el("span",{class:"ent-what"},el("span",{class:"ent-label",text:x.label}),el("span",{class:"hint",text:"Published"})),el("span",{class:"ent-dur"}),el("span",{class:"ent-acts"},del))];}
      if(x.live)return [el("li",{class:"ent live"},el("span",{class:"ent-dot seg-pomo"}),el("span",{class:"ent-when num",text:hhmm(x.sessions[0].start)+" to now"}),
        el("span",{class:"ent-what"},el("span",{class:"ent-label",text:x.label}),el("span",{class:"hint ent-rec",text:"● Recording live from the focus timer"})),el("span",{class:"ent-dur num",text:dur(x.minutes)}),el("span",{class:"ent-acts"}))];
      const del=el("button",{class:"x","aria-label":"Delete this entry",text:"×"});let armed=false;
      del.onclick=()=>{if(!armed){armed=true;del.textContent="Delete?";del.classList.add("armed");setTimeout(()=>{armed=false;del.textContent="×";del.classList.remove("armed");},3000);return;}
        saveEntries(sel,entriesOn(sel).filter(y=>y.id!==x.id));toast("Entry removed. Hours worked updated.");};
      const ss=sessionsOf(x);
      const when=ss.length?el("span",{class:"ent-when num"},...ss.map((se,i)=>el("button",{class:"sess-btn",type:"button","data-s":String(se.start),"data-e":String(se.end),title:"Edit or delete this session","aria-label":"Edit session "+hhmm(se.start)+" to "+hhmm(se.end),text:hhmm(se.start)+" to "+hhmm(se.end),onclick:()=>openTimeDlg({mode:"edit",title:"Edit session: "+x.label,entryId:x.id,index:i,from:hhmm24(se.start),to:hhmm24(se.end)})}))):el("span",{class:"ent-when hint",text:"time not recorded"});
      const tag={block:"Deep work",task:x.mode==="down"?"Task countdown":"Task timer",manual:"By hand",pomo:"Focus timer"}[x.kind]||"";
      const paused=ss.reduce((a,b)=>a+Number(b.paused||0),0);
      const plus=el("button",{class:"icon-btn sm","aria-label":"Add another session to "+x.label,title:"Add another session to this entry",text:"+",onclick:()=>{sessFor=sessFor===x.id?null:x.id;renderEntries();}});
      const row=el("li",{class:"ent"},el("span",{class:"ent-dot seg-"+x.kind}),when,
        el("span",{class:"ent-what"},renaming===x.id?(()=>{const inp=el("input",{type:"text",class:"ent-rename","aria-label":"Entry name",value:x.name||x.label});
          inp.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();renameEntry(sel,x.id,inp.value);}if(e.key==="Escape"){renaming=null;renderEntries();}};inp.onblur=()=>{if(renaming===x.id)renameEntry(sel,x.id,inp.value);};setTimeout(()=>{inp.focus();inp.select();},0);return inp;})()
          :el("span",{class:"ent-label",text:x.name||x.label}),el("span",{class:"hint",text:[x.name?x.label:"",tag,ss.length>1?ss.length+" sessions":"",x.note||"",paused?dur(paused)+" paused":""].filter(Boolean).join(" · ")})),
        el("span",{class:"ent-dur num",text:dur(x.minutes)}),el("span",{class:"ent-acts"},el("button",{class:"x ren","aria-label":"Rename "+(x.name||x.label),title:"Rename this entry",text:"\u270E",onclick:()=>{renaming=x.id;renderEntries();}}),plus,del));
      if(sessFor!==x.id)return [row];
      const f=el("input",{type:"time",value:"13:00","aria-label":"Session start"}),t2=el("input",{type:"time",value:"14:00","aria-label":"Session end"}),msg=el("span",{class:"saved"});
      const form=el("li",{class:"sess-form"},el("span",{class:"hint",text:"Add a session to "+x.label+":"}),f,el("span",{class:"hint",text:"to"}),t2,
        el("button",{class:"btn",type:"button",text:"Add session",onclick:()=>{if(!f.value||!t2.value){msg.textContent="Set both times.";return;}const st=atOn(sel,f.value),en=atOn(sel,t2.value);if(en<=st){msg.textContent="End must be after start.";return;}sessFor=null;addSessionTo(sel,x.id,st,en);}}),
        el("button",{class:"mini",type:"button",text:"Cancel",onclick:()=>{sessFor=null;renderEntries();}}),msg);
      return [row,form];
    }):[el("li",{class:"empty",text:state.loaded.entries?"No time recorded for this day. Start a deep work block or a task timer and it lands here when you stop it.":"Loading entries..."})]));
    const sel2=document.getElementById("enWhat");
    if(!sel2.children.length)rc(sel2,...BLOCKS.map(b=>el("option",{value:b.id,text:b.name+" ("+b.use.split(":")[0]+")"})),el("option",{value:"other",text:"Other work"}));
  }
  document.getElementById("enSave").onclick=()=>{
    const f=document.getElementById("enFrom").value,t=document.getElementById("enTo").value,w=document.getElementById("enWhat").value,note=document.getElementById("enNote").value.trim(),msg=document.getElementById("enMsg");
    if(!f||!t){msg.textContent="Set both times.";return;}
    const [fh,fm]=f.split(":").map(Number),[th,tm]=t.split(":").map(Number),base=parse(sel);
    const start=new Date(base.getFullYear(),base.getMonth(),base.getDate(),fh,fm).getTime(),end=new Date(base.getFullYear(),base.getMonth(),base.getDate(),th,tm).getTime();
    if(end<=start){msg.textContent="The end time must be after the start.";return;}
    const minutes=(end-start)/60000, b=BLOCKS.find(x=>x.id===w);
    if(b)addBlockMinutes(sel,b.id,minutes);
    addEntry(sel,{kind:"manual",ref:w,label:b?b.name:"Other work",start,end,minutes,note});
    document.getElementById("enNote").value="";msg.textContent="";toast(dur(minutes)+" added");
  };
  // ---------- precise hours: everything is a time entry, overlaps count once ----------
  function isEstimate(x){return x&&x.kind==="manual"&&!!(state.projects&&state.projects[x.ref]);}
  function itemsRaw(d){return (state.entries[d]&&Array.isArray(state.entries[d].items))?state.entries[d].items:[];}
  // the focus timer that is running right now, shown as a live entry so hours, learning and XP update in real time.
  // It is written for real when the round ends, is stopped, or is skipped.
  function liveItems(d){try{const r=pRun();if(!r||!r.startedAt||r.date!==d)return [];const now=r.pausedAt||Date.now(),out=[];
      const learning=r.what==="block5"||String(r.what).startsWith("eng:")||r.what==="other-learning"||String(r.what).startsWith("todo:learning:")||(String(r.what).startsWith("tasks:")&&(state.tasks[r.what.slice(6)]||{}).cat==="learning");
      const mk=(start,end,min)=>({id:"live",live:true,kind:"pomo",ref:r.what,label:pLabel(r.what,r.note),learning,minutes:min,sessions:[{start,end,minutes:min}]});
      if(r.phase==="focus"){let ms=pElapsed(r);if(r.durationMs&&!(r.overAt&&r.overAs==="focus"))ms=Math.min(ms,r.durationMs);const min=ms/60000;if(min>=0.5)out.push(mk(r.startedAt,r.startedAt+(r.pausedTotal||0)+ms,min));}
      else if(r.overAt&&r.overAs==="focus"){const min=Math.max(0,now-r.overAt)/60000;if(min>=0.5)out.push(mk(r.overAt,now,min));}
      return out;}catch(e){return [];}}
  function itemsOn(d){const raw=itemsRaw(d),lv=liveItems(d);return lv.length?raw.concat(lv):raw;}
  function unionMin(items){
    let timed=0,untimed=0;const iv=[];
    items.forEach(x=>{if(x.kind==="event"||x.kind==="break"||isEstimate(x))return;const ss=sessionsOf(x);if(!ss.length){untimed+=Number(x.minutes||0);return;}ss.forEach(se=>{timed+=Number(se.minutes||0);iv.push([se.start,se.end]);});});
    iv.sort((a,b)=>a[0]-b[0]);let raw=0,union=0,cs=null,ce=null;
    iv.forEach(([a,b])=>{raw+=b-a;if(cs===null){cs=a;ce=b;}else if(a<=ce){ce=Math.max(ce,b);}else{union+=ce-cs;cs=a;ce=b;}});if(cs!==null)union+=ce-cs;
    return Math.max(0,timed-Math.max(0,(raw-union)/60000)+untimed);
  }
  function isLearning(x){
    if(x.kind==="event")return false;
    if(x.learning===true||x.ref==="block5")return true;
    if(typeof x.ref==="string"&&x.ref.startsWith("learning:"))return true;
    if(typeof x.ref==="string"&&x.ref.startsWith("tasks:")){const t=state.tasks[x.ref.slice(6)];return !!(t&&t.cat==="learning");}
    return false;
  }
  function learningAdj(d){const L=log(d);if(L.learningAdj!==undefined)return Number(L.learningAdj)||0;return itemsOn(d).some(isLearning)?0:Number(L.learning||0);}
  function learningOn(d){return Math.max(0,Math.round((unionMin(itemsOn(d).filter(isLearning))/60+learningAdj(d))*100)/100);}
  function blockDone(d,id){const own=itemsOn(d).filter(x=>x.ref===id&&x.kind!=="event");if(own.length)return unionMin(own);const L=log(d);return Number((L.blocks||{})[id]||0);}
  function addEvent(d,key,label,at){
    const items=entriesOn(d).map(x=>({...x,sessions:sessionsOf(x)}));
    items.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),kind:"event",key,label,at,minutes:0,sessions:[]});
    saveEntries(d,items);
  }
  function removeLastEvent(d,key){
    const items=entriesOn(d); const evs=items.filter(x=>x.kind==="event"&&x.key===key).sort((a,b)=>(b.at||0)-(a.at||0));
    if(!evs.length)return; saveEntries(d,items.filter(x=>x.id!==evs[0].id));
  }
  function bumpPosts(delta,at){
    const L={...log(sel),date:sel}; const next=Math.max(0,Number(L.posts||0)+delta); if(next===Number(L.posts||0))return;
    L.posts=next; state.logs[sel]=L; render(); queueSave(sel,300);
    if(delta>0)addEvent(sel,"post","LinkedIn post",at);else removeLastEvent(sel,"post");
  }
  // ---------- time dialog: add time, edit a session, or set the time of a post ----------
  let tdCtx=null;
  function nowHm(off){return hhmm(Date.now()+(off||0)*60000);}
  function openTimeDlg(ctx){
    tdCtx=ctx; const $=id=>document.getElementById(id);
    $("tdTitle").textContent=ctx.title; $("tdSub").textContent=fmt(sel,{weekday:"long",day:"numeric",month:"long"})+(ctx.sub?" · "+ctx.sub:"");
    $("tdSpan").hidden=ctx.mode==="point"; $("tdPoint").hidden=ctx.mode!=="point";
    $("tdWhatRow").hidden=ctx.mode!=="new"; $("tdNoteRow").hidden=ctx.mode!=="new"; $("tdDel").hidden=ctx.mode!=="edit"; $("tdMsg").textContent="";
    if(ctx.mode==="new"){
      const opts=ctx.learning?[...Object.entries(state.learning).sort((a,b)=>(a[1].order||0)-(b[1].order||0)).map(([id,x])=>["learning:"+id,x.name]),["block5","Block 5 (learning and English)"],["other-learning","Other learning"]]
        :[...BLOCKS.map(b=>[b.id,b.name+" ("+b.use.split(":")[0]+")"]),["other","Other work"]];
      $("tdWhat").replaceChildren(...opts.map(([v,t])=>el("option",{value:v,text:t}))); if(ctx.what)$("tdWhat").value=ctx.what;
      $("tdNote").value="";
    }
    if(ctx.mode==="point")$("tdAt").value=ctx.at||nowHm(0);
    else{$("tdFrom").value=ctx.from||nowHm(-30);$("tdTo").value=ctx.to||nowHm(0);}
    $("tdBg").hidden=false; $("tdDlg").hidden=false; setTimeout(()=>$(ctx.mode==="point"?"tdAt":"tdFrom").focus(),0);
  }
  function closeTimeDlg(){tdCtx=null;document.getElementById("tdBg").hidden=true;document.getElementById("tdDlg").hidden=true;}
  document.getElementById("tdCancel").onclick=closeTimeDlg; document.getElementById("tdBg").onclick=closeTimeDlg;
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&tdCtx)closeTimeDlg();});
  document.getElementById("tdSave").onclick=()=>{
    const c=tdCtx; if(!c)return; const $=id=>document.getElementById(id), msg=$("tdMsg");
    if(c.mode==="point"){if(!$("tdAt").value){msg.textContent="Set the time.";return;}const at=atOn(sel,$("tdAt").value);closeTimeDlg();c.onPoint(at);return;}
    if(!$("tdFrom").value||!$("tdTo").value){msg.textContent="Set both times.";return;}
    const start=atOn(sel,$("tdFrom").value), end=atOn(sel,$("tdTo").value);
    if(end<=start){msg.textContent="The end time must be after the start.";return;}
    if(start>Date.now()+60000){msg.textContent="That time hasn't happened yet.";return;}
    const minutes=(end-start)/60000;
    if(c.mode==="edit"){
      const items=entriesOn(sel).map(x=>({...x,sessions:sessionsOf(x)})), x=items.find(y=>y.id===c.entryId); if(!x){closeTimeDlg();return;}
      x.sessions=x.sessions.map((se,i)=>i===c.index?{start,end,minutes:r1(minutes),paused:0}:se); x.minutes=r1(x.sessions.reduce((a,b)=>a+Number(b.minutes||0),0)); delete x.start; delete x.end;
      closeTimeDlg(); saveEntries(sel,items); toast("Session updated"); return;
    }
    const w=$("tdWhat").value, note=$("tdNote").value.trim(), b=BLOCKS.find(z=>z.id===w);
    let label=b?b.name:(w==="other"?"Other work":w==="other-learning"?"Other learning":"");
    if(w.startsWith("learning:")){const it=state.learning[w.slice(9)];label=it?it.name:"Learning";}
    const learning=!!c.learning||w==="block5";
    closeTimeDlg(); addEntry(sel,{kind:"manual",ref:w,label,learning,start,end,minutes,note});
    toast(dur(minutes)+" added to "+label);
  };
  document.getElementById("tdDel").onclick=()=>{
    const c=tdCtx; if(!c||c.mode!=="edit")return;
    const items=entriesOn(sel).map(x=>({...x,sessions:sessionsOf(x)})), x=items.find(y=>y.id===c.entryId); if(!x){closeTimeDlg();return;}
    x.sessions=x.sessions.filter((_,i)=>i!==c.index); x.minutes=r1(x.sessions.reduce((a,b)=>a+Number(b.minutes||0),0)); delete x.start; delete x.end;
    closeTimeDlg(); saveEntries(sel,x.sessions.length?items:items.filter(y=>y.id!==x.id)); toast("Session removed. Hours updated.");
  };
  // ---------- reminders: in-app banner + bell, optional Google Calendar notification ----------
  let mcp=null, remCtx=null;
  function reminderFor(kind,id){return Object.entries(state.reminders).map(([rid,r])=>({rid,...r})).find(r=>!r.fired&&r.source&&r.source.kind===kind&&r.source.id===id)||null;}
  function fmtAt(ms){const d=new Date(ms),t=iso(new Date());return (iso(d)===t?"today":fmt(iso(d),{weekday:"short",day:"numeric",month:"short"}))+" "+hhmm(ms);}
  function bellBtn(text,source,rm){return el("button",{class:"tbtn bell"+(rm?" on":""),"aria-label":(rm?"Change reminder for ":"Set a reminder for ")+text,title:rm?"Reminder "+fmtAt(rm.at):"Set a reminder",text:"\u{1F514}",onclick:e=>{e.stopPropagation();openRem(text,source,rm);}});}
  function openRem(text,source,rm){
    remCtx={text,source,rm};
    const at=rm?new Date(rm.at):new Date(Date.now()+60*60000); if(!rm)at.setMinutes(Math.ceil(at.getMinutes()/5)*5,0,0);
    document.getElementById("remTitle").textContent=text;
    document.getElementById("remDate").value=iso(at); document.getElementById("remTime").value=hhmm(at.getTime());
    document.getElementById("remCal").checked=rm?!!rm.calEventId:false; document.getElementById("remCal").parentElement.hidden=!mcp;
    document.getElementById("remDel").hidden=!rm; document.getElementById("remMsg").textContent="";
    document.getElementById("remQuick").replaceChildren(...[["In 30 min",30],["In 1 hour",60],["In 3 hours",180],["Tomorrow 9:00",-1]].map(([l,m])=>el("button",{class:"mini",type:"button",text:l,onclick:()=>{let d;if(m<0){d=new Date();d.setDate(d.getDate()+1);d.setHours(9,0,0,0);}else d=new Date(Date.now()+m*60000);document.getElementById("remDate").value=iso(d);document.getElementById("remTime").value=hhmm(d.getTime());}})));
    document.getElementById("remBg").hidden=false; document.getElementById("remDlg").hidden=false; setTimeout(()=>document.getElementById("remTime").focus(),0);
  }
  function closeRem(){remCtx=null;document.getElementById("remBg").hidden=true;document.getElementById("remDlg").hidden=true;}
  function findEventId(v,depth){if(!v||depth>4)return null;if(typeof v==="object"){for(const k of ["eventId","id"])if(typeof v[k]==="string"&&v[k].length>4)return v[k];for(const k in v){const r=findEventId(v[k],depth+1);if(r)return r;}}if(typeof v==="string"){try{return findEventId(JSON.parse(v),depth+1);}catch(e){}}return null;}
  function localIso(ms){const d=new Date(ms);return iso(d)+"T"+hhmm(ms)+":00";}
  async function calCreate(text,at){
    const res=await mcp.callTool("Google Calendar","create_event",{summary:"\u{1F514} "+text,startTime:localIso(at),endTime:localIso(at+15*60000),overrideReminders:[{method:"popup",minutes:0}],description:"Reminder from your Milestone 1 Sprint Board"});
    return {id:findEventId(res&&res.payload!==undefined?res.payload:res,0)};
  }
  async function calDelete(id){try{await mcp.callTool("Google Calendar","delete_event",{eventId:id});}catch(e){}}
  function calError(e){const c=e&&e.code;return c==="server_not_connected"?"Google Calendar isn't connected. Add it in claude.ai Settings, Connectors.":c==="needs_reauth"?"Reconnect Google Calendar in claude.ai Settings, Connectors.":c==="not_in_manifest"?"Google Calendar isn't allowed for this page.":"Couldn't add it to Google Calendar.";}
  document.getElementById("remCancel").onclick=closeRem; document.getElementById("remBg").onclick=closeRem;
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&remCtx)closeRem();});
  document.getElementById("remSet").onclick=async()=>{
    if(!remCtx)return; const d=document.getElementById("remDate").value,t=document.getElementById("remTime").value,msg=document.getElementById("remMsg");
    if(!d||!t){msg.textContent="Pick a date and a time.";return;}
    const at=atOn(d,t); if(at<Date.now()-60000){msg.textContent="That time has already passed.";return;}
    const ctx=remCtx, wantCal=document.getElementById("remCal").checked&&!!mcp, btn=document.getElementById("remSet"); btn.disabled=true;
    const rid=ctx.rm?ctx.rm.rid:(Date.now().toString(36)+Math.random().toString(36).slice(2,6));
    let calEventId=ctx.rm&&ctx.rm.calEventId||null, onCal=!!calEventId, note="";
    if(calEventId&&(!wantCal||ctx.rm.at!==at)){calDelete(calEventId);calEventId=null;onCal=false;}
    if(wantCal&&!onCal){msg.textContent="Adding to Google Calendar...";try{const r=await calCreate(ctx.text,at);calEventId=r.id;onCal=true;}catch(e){note=". "+calError(e);}}
    const body={text:ctx.text,at,source:ctx.source,fired:false,calEventId:calEventId||null,onCal};
    state.reminders={...state.reminders,[rid]:body}; render();
    try{await store.set("reminders/"+rid,body);}catch(e){fail(e);}
    btn.disabled=false; closeRem(); toast("Reminder set for "+fmtAt(at)+(onCal?", also in Google Calendar":note));
  };
  document.getElementById("remDel").onclick=async()=>{if(!remCtx||!remCtx.rm)return;const r=remCtx.rm;closeRem();await removeReminder(r.rid);toast("Reminder removed");};
  async function removeReminder(rid){const r=state.reminders[rid];if(!r)return;const next={...state.reminders};delete next[rid];state.reminders=next;render();
    if(r.calEventId&&mcp&&!r.fired)calDelete(r.calEventId); try{await store.del("reminders/"+rid);}catch(e){fail(e);}}
  function bell(kind){if(!soundOn)return;if(kind&&playSlot(kind))return;bellRaw();}
  function bellRaw(){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==="suspended")actx.resume();const t=actx.currentTime;
    [[880,0],[1318.5,0.18],[880,0.6],[1318.5,0.78]].forEach(([f,o])=>{const os=actx.createOscillator(),g=actx.createGain();os.type="sine";os.frequency.value=f;g.gain.setValueAtTime(0.0001,t+o);g.gain.exponentialRampToValueAtTime(0.3,t+o+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+o+0.5);os.connect(g);g.connect(actx.destination);os.start(t+o);os.stop(t+o+0.55);});}catch(e){}}
  const shown=new Set();
  function checkReminders(){
    const now=Date.now(), due=Object.entries(state.reminders).map(([rid,r])=>({rid,...r})).filter(r=>!r.fired&&r.at<=now&&now-r.at<10*60000);
    const box=document.getElementById("remBanners");
    rc(box,...due.map(r=>el("div",{class:"rem-banner",role:"alert"},el("span",{class:"rb-ico",text:"\u{1F514}"}),
      el("span",{class:"rb-txt"},el("b",{text:r.text}),el("span",{class:"hint",text:(now-r.at>5*60000?"Missed reminder, ":"")+fmtAt(r.at)})),
      el("button",{class:"mini",text:"Snooze 10 min",onclick:async()=>{const b={...state.reminders[r.rid],at:Date.now()+10*60000};state.reminders={...state.reminders,[r.rid]:b};shown.delete(r.rid);render();try{await store.update("reminders/"+r.rid,{at:b.at});}catch(e){fail(e);}}}),
      el("button",{class:"btn",text:"Done",onclick:async()=>{const b={...state.reminders[r.rid],fired:true};state.reminders={...state.reminders,[r.rid]:b};render();try{await store.update("reminders/"+r.rid,{fired:true});}catch(e){fail(e);}}}))));
    if(due.some(r=>!shown.has(r.rid))){bell("reminder");due.forEach(r=>shown.add(r.rid));}
  }
  setInterval(checkReminders,15000);
  function renderReminders(){
    const up=Object.entries(state.reminders).map(([rid,r])=>({rid,...r})).filter(r=>!r.fired).sort((a,b)=>a.at-b.at);
    document.getElementById("remBox").hidden=!up.length; document.getElementById("remCount").textContent=up.length?up.length+" upcoming":"";
    document.getElementById("remList").replaceChildren(...up.map(r=>el("li",{class:"rem"},el("span",{class:"num rem-at",text:fmtAt(r.at)}),el("span",{class:"rem-t",text:r.text}),
      r.onCal?el("span",{class:"hint",title:"Also in Google Calendar",text:"\u{1F4C5}"}):el("span"),
      el("button",{class:"x","aria-label":"Remove reminder for "+r.text,text:"×",onclick:()=>{removeReminder(r.rid);toast("Reminder removed");}}))));
    checkReminders();
  }
  (async()=>{try{mcp=await window.claude?.use?.("mcp");}catch(e){mcp=null;}})();
  // ---------- task timers on every kind of task: count up or count down ----------
  // A timer target is {src, ref, todoId, text}: src "tasks" (Today's tasks, todoId null) or "projects" / "learning" / "inquiries" (a to-do inside that card).
  let pickerFor=null, pickMode="up", pickH="1", pickM="0";
  const DEVICE=(()=>{try{let d=localStorage.getItem("sb-device");if(!d){d=Math.random().toString(36).slice(2,10);localStorage.setItem("sb-device",d);}return d;}catch(e){return Math.random().toString(36).slice(2,10);}})();
  function taskTimer(){const t=state.timers.task;if(!t)return null;if(t.ref)return t;if(t.project)return {...t,src:"projects",ref:t.project};return null;}
  function tkey(x){return x.src+"/"+x.ref+"/"+(x.todoId||"");}
  function taskRemaining(k){return Math.max(0,(k.durationMs||0)-elapsedMs(k));}
  function taskClockText(k){return k.mode==="down"?clock(taskRemaining(k))+" left":clock(elapsedMs(k));}
  async function setTaskDoc(body){state.timers={...state.timers,task:body};render();try{await store.set("timers/task",body);}catch(e){fail(e);}}
  async function startTimer(ctx,mode,durationMs){
    if(mode==="down"&&!(durationMs>=60000)){toast("Set at least 1 minute for a countdown");return;}
    if(taskTimer())await stopTask(false);
    pickerFor=null;
    await setTaskDoc({src:ctx.src,ref:ctx.ref,todoId:ctx.todoId||null,text:ctx.text,mode,durationMs:mode==="down"?durationMs:0,date:iso(new Date()),startedAt:Date.now(),pausedAt:null,pausedTotal:0});
    toast(mode==="down"?"Countdown started: "+dur(durationMs/60000):"Timer started");
  }
  function pauseTask(){const k=taskTimer();if(!k||k.pausedAt)return;say("Task timer paused");setTaskDoc({...k,pausedAt:Date.now()});}
  function resumeTask(){const k=taskTimer();if(!k||!k.pausedAt)return;say("Task timer resumed");setTaskDoc({...k,pausedTotal:(k.pausedTotal||0)+(Date.now()-k.pausedAt),pausedAt:null});}
  let stopping=false;
  const addSpent=(list,id,m)=>(list||[]).map(x=>x.id===id?{...x,spent:Math.round(((x.spent||0)+m)*10)/10}:x);
  async function stopTask(finished){
    const k=taskTimer(); if(!k||stopping)return; stopping=true;
    try{
      if(finished&&db&&db.doc("timers/task").acquire){try{const r=await db.doc("timers/task").acquire({holder:DEVICE,ttlMs:15000});if(!r.acquired)return;}catch(e){}}
      let ms=elapsedMs(k); if(k.mode==="down")ms=Math.min(ms,k.durationMs||ms);
      const minutes=ms/60000;
      await setTaskDoc({ref:null,project:null});
      if(minutes<1){toast("Under a minute, so nothing was logged");return;}
      const end=finished&&k.mode==="down"?k.startedAt+(k.pausedTotal||0)+k.durationMs:(k.pausedAt||Date.now());
      const owner=k.src==="tasks"?null:state[k.src]&&state[k.src][k.ref];
      const label=k.src==="tasks"?k.text:((owner?owner.name+": ":"")+k.text);
      addEntry(k.date,{kind:"task",ref:k.src==="projects"?k.ref:k.src+":"+k.ref,todoId:k.todoId,label,mode:k.mode,start:k.startedAt,end,minutes,paused:(k.pausedTotal||0)/60000});
      if(k.src==="tasks"){const t=state.tasks[k.ref];if(t){const spent=Math.round(((t.spent||0)+minutes)*10)/10;state.tasks[k.ref]={...t,spent};render();try{await store.update("tasks/"+k.ref,{spent});}catch(e){fail(e);}}}
      else if(owner){
        const patch={todos:addSpent(owner.todos,k.todoId,minutes)};
        state[k.src][k.ref]={...owner,...patch};render();
        try{await store.update(k.src+"/"+k.ref,patch);}catch(e){fail(e);}
      }
      woo(); toast(finished?"Time's up: "+dur(minutes)+" logged on "+k.text:dur(minutes)+" logged on "+k.text);
    }finally{stopping=false;}
  }
  setInterval(()=>{const k=taskTimer();if(!k)return;
    if(k.mode==="down"&&!k.pausedAt&&taskRemaining(k)<=0){stopTask(true);return;}
    if(k.pausedAt)return;const txt=taskClockText(k);document.querySelectorAll("[data-tclock]").forEach(e=>{e.textContent=txt;});},1000);
  function pWhatFor(ctx){return ctx.src==="tasks"?"tasks:"+ctx.ref:"todo:"+ctx.src+":"+ctx.ref+":"+ctx.todoId;}
  function timerBtn(ctx){const pr=pRun(),w=pWhatFor(ctx),on=!!(pr&&pr.phase==="focus"&&pr.what===w&&pr.startedAt),k0=taskTimer(),legacy=!!(k0&&tkey(k0)===tkey(ctx));
    return el("button",{class:"tbtn"+(on||legacy?" on":""),"aria-label":(on?"Open the focus timer for ":"Start the focus timer for ")+ctx.text,title:on?"Focus timer running":"Focus on this in the focus timer",text:"⏱",
      onclick:e=>{e.stopPropagation();if(on){openPomoFull();return;}const owner=ctx.src==="tasks"?null:state[ctx.src]&&state[ctx.src][ctx.ref];pStartFor({what:w,label:ctx.src==="tasks"?ctx.text:((owner?owner.name+": ":"")+ctx.text)});}});}
  function timerBtnOld(ctx){
    const k=taskTimer(), running=k&&tkey(k)===tkey(ctx), key=tkey(ctx);
    return el("button",{class:"tbtn"+(running?" on":""),"aria-label":"Time this task: "+ctx.text,title:running?"Timer running":"Start a timer for this task",text:"⏱",onclick:e=>{e.stopPropagation();pickerFor=(pickerFor===key||running)?null:key;render();}});
  }
  function timerUI(ctx,spentMin){
    const k=taskTimer(), mine=k&&tkey(k)===tkey(ctx);
    const spent=spentMin?el("span",{class:"tspent",text:dur(spentMin)+" tracked"}):null;
    {const pr=pRun();if(pr&&pr.phase==="focus"&&pr.startedAt&&pr.what===pWhatFor(ctx))return el("div",{class:"trun"},el("span",{class:"dot tdot"}),el("span",{class:"num","data-pclock":"1",text:pClock(pr)}),el("span",{class:"hint",text:"in the focus timer"}),el("button",{class:"mini",type:"button",text:"Open",onclick:openPomoFull}),spent);}
    if(mine){
      return el("div",{class:"trun"},el("span",{class:"dot tdot"}),el("span",{class:"num","data-tclock":"1",text:taskClockText(k)}),el("span",{class:"hint",text:k.mode==="down"?"counting down":"counting up"}),
        k.pausedAt?el("button",{class:"mini",text:"Resume",onclick:resumeTask}):el("button",{class:"mini",text:"Pause",onclick:pauseTask}),
        el("button",{class:"mini",text:"Stop and log",onclick:()=>stopTask(false)}));
    }
    if(pickerFor===tkey(ctx)){
      const h=el("input",{type:"number",min:"0",max:"12",step:"1",value:pickH,"aria-label":"Hours",class:"tnum"});h.oninput=()=>{pickH=h.value;};
      const m=el("input",{type:"number",min:"0",max:"59",step:"5",value:pickM,"aria-label":"Minutes",class:"tnum"});m.oninput=()=>{pickM=m.value;};
      const seg=el("div",{class:"seg",role:"group","aria-label":"Timer mode"},
        el("button",{type:"button","aria-pressed":String(pickMode==="up"),text:"Count up",onclick:()=>{pickMode="up";render();}}),
        el("button",{type:"button","aria-pressed":String(pickMode==="down"),text:"Count down",onclick:()=>{pickMode="down";render();}}));
      return el("div",{class:"tpick"},seg,
        pickMode==="down"?el("span",{class:"tdur"},h,el("span",{class:"hint",text:"h"}),m,el("span",{class:"hint",text:"min"})):el("span",{class:"hint",text:"Counts up until you stop it"}),
        el("button",{class:"btn",type:"button",text:"Start",onclick:()=>startTimer(ctx,pickMode,((Number(pickH)||0)*60+(Number(pickM)||0))*60000)}),
        el("button",{class:"mini",type:"button",text:"Cancel",onclick:()=>{pickerFor=null;render();}}));
    }
    return spent;
  }
  setInterval(()=>{const t=activeTimer();if(!t||t.pausedAt)return;const txt=clock(elapsedMs(t));document.querySelectorAll("[data-clock]").forEach(e=>{e.textContent=txt;});},1000);

  // ---------- Ask Claude (in-app assistant) ----------
  (function(){
    let sample=null, turns=[], ctl=null, busy=false, toolsOk=true;
    const chatEl=document.getElementById("chatLog"), input=document.getElementById("chatInput");
    const SUGG=["What should I focus on right now?","Move today's unfinished tasks to tomorrow","Add a task for tomorrow: write post about HASM","Log 2 hours of learning today","Mark StoryBrand as done and rate it 5"];
    function bubble(cls,text){const b=el("div",{class:"msg "+cls,text});chatEl.append(b);chatEl.scrollTop=chatEl.scrollHeight;return b;}
    function open(){document.getElementById("chat").hidden=false;document.getElementById("askFab").hidden=true;setTimeout(()=>input.focus(),0);
      if(!chatEl.children.length){bubble("ai","Ahmed. I'm your coach, and I read your board before I answer. Tell me what to change, or ask what to do next. Expect straight answers. For changes to the app's design or features, ask Claude in your main chat.");}}
    function close(){document.getElementById("chat").hidden=true;document.getElementById("askFab").hidden=!sample;}
    document.getElementById("askFab").onclick=open;
    document.getElementById("chatClose").onclick=close;
    document.getElementById("chatSugg").replaceChildren(...SUGG.map(t=>el("button",{type:"button",text:t,onclick:()=>{input.value=t;input.focus();}})));
    input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();document.getElementById("chatForm").requestSubmit();}});
    document.getElementById("chatStop").onclick=()=>ctl&&ctl.abort();

    const list=(k)=>Object.entries(state[k]).map(([id,x])=>({id,...x}));
    function snapshot(){
      const today=iso(new Date()), sp=sprintFor(sel);
      const near=list("tasks").filter(t=>!t.cut&&t.date>=addDays(today,-3)&&t.date<=addDays(today,7)).map(t=>({id:t.id,date:t.date,title:t.title,cat:t.cat,block:taskBlock(t),done:!!t.done,moved:t.moved||0,tracked_min:Math.round(t.spent||0)}));
      const recent=[];for(let i=6;i>=0;i--){const d=addDays(today,-i);if(d<START)continue;const L=log(d);recent.push({date:d,friday:isFriday(d),day_state:L.dayState||"normal",reflection:L.reflection||"",block_notes:L.blockNotes||{},hours_worked:hoursOn(d),tasks_done:tasksOn(d).filter(t=>t.done).length,tasks_planned:tasksOn(d).length,day_counted:dayKept(d)});}
      const blocks_today=DAY_BLOCKS.map(b=>({block:b.n,name:b.name,window:b.from+"-"+b.to,focus_minutes_logged:b.n===4?null:Math.round(winFocusMin(today,b.from,b.to)),window_minutes:blkLen(b),open_tasks:tasksOn(today).filter(t=>!t.done&&taskBlock(t)===b.n).map(t=>t.title)}));
      const moved_again=list("tasks").filter(t=>!t.cut&&!t.done&&(t.moved||0)>=2).map(t=>({id:t.id,date:t.date,title:t.title,moved:t.moved}));
      return JSON.stringify({today, selected_day:sel, current_sprint:{n:sp.n,name:sp.name,start:sp.start,end:sp.end,goal:sp.goal,targets:{posts:sp.posts,comments:sp.comments,applications:sp.applications}},
        totals_so_far:{posts:sumLogs(START,today,"posts"),comments:sumLogs(START,today,"comments"),applications:sumLogs(START,today,"applications"),hours_this_week:sumLogs(weekStart(today),addDays(weekStart(today),6),"hours")},
        day_log_today:{...log(today),hours_worked:hoursOn(today),learning_hours:learningOn(today)}, blocks_today, last_7_days:recent, tasks_moved_twice_or_more:moved_again, linkedin_bank_ready:Math.max(0,bankN()), day_streak:streak(), tasks_near_today:near, unfinished_older:list("tasks").filter(t=>!t.cut&&!t.done&&t.date<addDays(today,-3)).map(t=>({id:t.id,date:t.date,title:t.title})),
        learning:list("learning").map(x=>({id:x.id,name:x.name,status:x.status,when:x.when,rating:x.rating||0})),
        projects:list("projects").map(x=>({id:x.id,group:x.group||"portfolio",name:x.name,client:x.client,status:x.status,start:x.start,due:x.due,paid:x.paid})),
        inquiries:list("inquiries").map(x=>({id:x.id,name:x.name,date:x.date,source:x.source,status:x.status})),
        sprints:sprints().map(p=>({n:p.n,name:p.name,start:p.start,end:p.end}))});
    }
    function rules(){return "You are Ahmed's coach inside his Milestone 1 Sprint Board (3 Nov to 3 Jan 2027). He is a senior presentation designer building his personal brand with inbound only: no cold outreach. Weekly hours target: 50 in November, 60 in December; learning target 10 h a week; Friday is off (Jumuah, family, weekly review). His day runs in 4 blocks: Block 1 Learning 05:00 to 06:30, Block 2 Design 07:00 to 15:00, Block 3 LinkedIn and brand 15:30 to 17:30, Block 4 Gym and family 17:45 to 21:30. LinkedIn posts come from a bank of drafts.\n\n"+
      "How you coach: you are a tough, honest coach, not a cheerleader. Read the board data below before every answer and use the real numbers: hours worked, focus minutes inside each block, tasks done against tasks planned, tasks moved again and again, day states and reflections. Name procrastination and low effort plainly when the data shows it, for example a task moved twice or more, an empty deep work bar in Block 2, or a working day with no hours and no stated reason. When his reasoning is weak or is an excuse, say so and counter it with the data and a better plan. Credit real reasons fairly: sickness, a planned rest day, family duties and prayer are valid, and sick or rest days in the data count as kept; on those days do not push him, help him recover and restart the next working day. Keep Islamic principles in mind: sincere intention (niyyah) and excellence (ihsan) in the work, effort is his duty while results are with Allah, his body and his family have rights over him, and small consistent deeds beat bursts. Do not lecture or moralize at length. End every reply with exactly one hard question that makes him commit to a specific next action with a time. Be brief: short paragraphs, no fluff, no flattery.\n\n"+
      "Tools: use them to make every change he asks for; never just describe a change. Dates are YYYY-MM-DD; resolve words like today or tomorrow from the data below. Use ids from the data; call list_tasks for other dates. Do not delete anything unless he clearly asks; prefer marking a task cut. After acting, say exactly what you changed in 1 to 3 short sentences, then ask your question. If he asks to change the app's layout, design or features, say that needs a change to the app itself and he should ask Claude in his main chat. Never use em dashes.\n\nBoard data now:\n"+snapshot();}
    const req=(x,n)=>{if(x===undefined||x===null||x==="")throw new Error(n+" is required");return x;};
    const isDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(String(d));
    async function write(path,body,merge){if(!db)throw new Error("Saving isn't available in this view");if(merge)await store.update(path,body);else await store.set(path,body);}
    function act(t){bubble("act","→ "+t);}
    const TOOLS=[
      {name:"get_time_entries",description:"Returns the time entries for a date: when each deep work block, task timer or manual entry started and ended (local HH:MM), its label and minutes.",inputSchema:{type:"object",properties:{date:{type:"string"}},required:["date"]},
        execute:({date})=>entriesOn(String(date)).map(x=>({sessions:sessionsOf(x).map(se=>hhmm(se.start)+"-"+hhmm(se.end)),label:x.name||x.label,kind:x.kind,minutes:x.minutes,note:x.note||""}))},
      {name:"list_tasks",description:"Returns tasks between two dates (inclusive) as [{id,date,title,cat,done,cut}].",inputSchema:{type:"object",properties:{from:{type:"string"},to:{type:"string"}},required:["from","to"]},
        execute:({from,to})=>list("tasks").filter(t=>t.date>=String(from)&&t.date<=String(to)).map(t=>({id:t.id,date:t.date,title:t.title,cat:t.cat,done:!!t.done,cut:!!t.cut}))},
      {name:"add_task",description:"Adds a task to a day. cat is one of portfolio, linkedin, outreach (means inbound/applications), brand, learning, setup, client (paid or trial client work, not for the portfolio), review. Returns the new id.",inputSchema:{type:"object",properties:{date:{type:"string"},title:{type:"string"},cat:{type:"string"}},required:["date","title"]},
        execute:async({date,title,cat})=>{if(!isDate(date))throw new Error("date must be YYYY-MM-DD");const body={title:String(req(title,"title")),cat:CAT[cat]?String(cat):"portfolio",date:String(date),sprint:sprintFor(String(date)).n,done:false,moved:0,order:Date.now()};
          if(!db)throw new Error("Saving isn't available");const ref=await store.add("tasks",body);state.tasks[ref.id]=body;render();act("Added task: "+body.title+" ("+body.date+")");return {id:ref.id};}},
      {name:"update_task",description:"Changes a task: new title, move to another date, mark done or not, or cut it (hide it). Returns ok.",inputSchema:{type:"object",properties:{id:{type:"string"},title:{type:"string"},date:{type:"string"},done:{type:"boolean"},cut:{type:"boolean"}},required:["id"]},
        execute:async({id,title,date,done,cut})=>{id=String(id);const t=state.tasks[id];if(!t)throw new Error("No task with id "+id);const patch={};
          if(title)patch.title=String(title);if(date){if(!isDate(date))throw new Error("date must be YYYY-MM-DD");patch.date=String(date);patch.moved=(t.moved||0)+1;patch.sprint=sprintFor(String(date)).n;}
          if(typeof done==="boolean"){patch.done=done;patch.doneAt=done?iso(new Date()):null;bankAdjust(t,done,done?iso(new Date()):(t.doneAt||t.date));}if(typeof cut==="boolean")patch.cut=cut;
          await write("tasks/"+id,patch,true);state.tasks[id]={...t,...patch};render();if(patch.done)woo();act("Updated task: "+(patch.title||t.title));return "ok";}},
      {name:"set_day_log",description:"Sets the day log for a date. Values are absolute totals for that day: hours (total hours worked; the app keeps time entries and stores the difference as a manual adjustment), learning (hours), posts, drafts (LinkedIn drafts added to the bank), comments, applications as numbers; english and gym as true/false; day_state one of normal, low, sick, rest; reflection as text. Only the fields you pass change.",
        inputSchema:{type:"object",properties:{date:{type:"string"},hours:{type:"number"},learning:{type:"number"},posts:{type:"number"},drafts:{type:"number"},comments:{type:"number"},applications:{type:"number"},english:{type:"boolean"},gym:{type:"boolean"},day_state:{type:"string"},reflection:{type:"string"}},required:["date"]},
        execute:async(a)=>{const d=String(a.date);if(!isDate(d))throw new Error("date must be YYYY-MM-DD");const L={...log(d),date:d};
          for(const k of ["posts","drafts","comments","applications"])if(a[k]!==undefined)L[k]=Math.max(0,Number(a[k])||0);
          if(a.day_state!==undefined&&DSTATE_NAME[String(a.day_state)])L.dayState=String(a.day_state);if(a.reflection!==undefined)L.reflection=String(a.reflection).slice(0,2000);
          if(a.learning!==undefined){L.learningAdj=Math.round((Math.max(0,Number(a.learning)||0)-unionMin(itemsRaw(d).filter(isLearning))/60)*100)/100;L.learning=Math.max(0,Number(a.learning)||0);}
          if(a.hours!==undefined){const eh=entryHours(d);L.hoursAdj=Math.round((Math.max(0,Number(a.hours)||0)-eh)*100)/100;L.hours=Math.max(0,Number(a.hours)||0);}
          for(const k of ["english","gym"])if(a[k]!==undefined)L[k]=!!a[k];
          await write("logs/"+d,L,false);state.logs[d]=L;render();act("Updated day log for "+d);return "ok";}},
      {name:"upsert_learning",description:"Adds a learning item (no id) or changes one (with id). status: todo, doing, done. rating 0 to 5. add_todos adds to its to-do list; append_notes adds a paragraph to its notes. Returns the id.",
        inputSchema:{type:"object",properties:{id:{type:"string"},name:{type:"string"},when:{type:"string"},hours:{type:"number"},track:{type:"string"},output:{type:"string"},status:{type:"string"},rating:{type:"number"},add_todos:{type:"array",items:{type:"string"}},append_notes:{type:"string"}}},
        execute:async(a)=>{const id=a.id?String(a.id):null;const cur=id?state.learning[id]:null;if(id&&!cur)throw new Error("No learning item with id "+id);
          const patch={};for(const k of ["name","when","track","output"])if(a[k])patch[k]=String(a[k]);if(a.hours!==undefined)patch.hours=Number(a.hours)||0;
          if(a.status&&LSTATUS.includes(String(a.status)))patch.status=String(a.status);if(a.rating!==undefined)patch.rating=Math.max(0,Math.min(5,Math.round(Number(a.rating)||0)));
          if(Array.isArray(a.add_todos)&&a.add_todos.length)patch.todos=[...((cur&&cur.todos)||[]),...a.add_todos.map((t,i)=>({id:(Date.now()+i).toString(36),text:String(t),done:false}))];
          if(a.append_notes)patch.notes=((cur&&cur.notes)?cur.notes+"\n\n":"")+String(a.append_notes);
          if(!db)throw new Error("Saving isn't available");
          if(cur){await store.update("learning/"+id,patch);state.learning[id]={...cur,...patch};render();if(patch.status==="done")woo();act("Updated learning: "+(patch.name||cur.name));return {id};}
          const body={name:String(req(a.name,"name")),when:"Nov",hours:0,track:"Brand and LinkedIn",output:"",status:"todo",order:Date.now(),todos:[],rating:0,notes:"",...patch};
          const ref=await store.add("learning",body);state.learning[ref.id]=body;render();act("Added learning: "+body.name);return {id:ref.id};}},
      {name:"add_project",description:"Adds a project. group is portfolio or client. For client work pass client, fee, start, due. Returns the id.",
        inputSchema:{type:"object",properties:{group:{type:"string"},name:{type:"string"},type:{type:"string"},client:{type:"string"},fee:{type:"string"},start:{type:"string"},due:{type:"string"}},required:["name"]},
        execute:async(a)=>{const g=String(a.group)==="client"?"client":"portfolio";const body={name:String(a.name),type:String(a.type||""),group:g,status:"todo",order:Date.now(),todos:[],notes:"",hourLog:[]};
          if(g==="client"){body.client=String(a.client||"");body.fee=String(a.fee||"");body.paid=false;}for(const k of ["start","due"])if(a[k]&&isDate(a[k]))body[k]=String(a[k]);
          if(!db)throw new Error("Saving isn't available");const ref=await store.add("projects",body);state.projects[ref.id]=body;render();act("Added "+g+" project: "+body.name);return {id:ref.id};}},
      {name:"update_project",description:"Changes a portfolio or client project by id. Can rename (name), change type, client, fee, paid (true/false), start and due (YYYY-MM-DD). status: todo, doing, live (live means delivered for client work). add_todos adds to-dos; append_notes adds notes; log_hours adds {hours, note} to its hours log for today.",
        inputSchema:{type:"object",properties:{id:{type:"string"},name:{type:"string"},type:{type:"string"},client:{type:"string"},fee:{type:"string"},paid:{type:"boolean"},start:{type:"string"},status:{type:"string"},due:{type:"string"},add_todos:{type:"array",items:{type:"string"}},append_notes:{type:"string"},log_hours:{type:"object",properties:{hours:{type:"number"},note:{type:"string"}}}},required:["id"]},
        execute:async(a)=>{const id=String(a.id),cur=state.projects[id];if(!cur)throw new Error("No project with id "+id);const patch={};
          if(a.status&&STATUS.includes(String(a.status)))patch.status=String(a.status);if(a.due&&isDate(a.due))patch.due=String(a.due);
          for(const k of ["name","type","client","fee"])if(a[k])patch[k]=String(a[k]);if(a.start&&isDate(a.start))patch.start=String(a.start);if(typeof a.paid==="boolean")patch.paid=a.paid;
          if(Array.isArray(a.add_todos)&&a.add_todos.length)patch.todos=[...(cur.todos||[]),...a.add_todos.map((t,i)=>({id:(Date.now()+i).toString(36),text:String(t),done:false}))];
          if(a.append_notes)patch.notes=(cur.notes?cur.notes+"\n\n":"")+String(a.append_notes);
          if(a.log_hours&&Number(a.log_hours.hours)>0)patch.hourLog=[...(cur.hourLog||[]),{id:Date.now().toString(36),date:iso(new Date()),hours:Number(a.log_hours.hours),note:String(a.log_hours.note||"")}];
          await write("projects/"+id,patch,true);state.projects[id]={...cur,...patch};render();if(patch.status==="live")woo();act("Updated project: "+cur.name);return "ok";}},
      {name:"upsert_inquiry",description:"Logs a new client inquiry (no id) or updates one (with id). source: LinkedIn, Behance, Upwork, Referral, Other. status: new, call, proposal, won, lost. Returns the id.",
        inputSchema:{type:"object",properties:{id:{type:"string"},date:{type:"string"},name:{type:"string"},source:{type:"string"},asked:{type:"string"},status:{type:"string"},append_notes:{type:"string"}}},
        execute:async(a)=>{const id=a.id?String(a.id):null,cur=id?state.inquiries[id]:null;if(id&&!cur)throw new Error("No inquiry with id "+id);const patch={};
          for(const k of ["name","asked"])if(a[k])patch[k]=String(a[k]);if(a.source)patch.source=SOURCES.includes(String(a.source))?String(a.source):"Other";
          if(a.date&&isDate(a.date))patch.date=String(a.date);if(a.status&&ISTATUS.includes(String(a.status)))patch.status=String(a.status);
          if(a.append_notes)patch.notes=((cur&&cur.notes)?cur.notes+"\n\n":"")+String(a.append_notes);
          if(!db)throw new Error("Saving isn't available");
          if(cur){await store.update("inquiries/"+id,patch);state.inquiries[id]={...cur,...patch};render();if(patch.status==="won")woo();act("Updated inquiry: "+cur.name);return {id};}
          const body={date:iso(new Date()),source:"Other",asked:"",status:"new",order:Date.now(),todos:[],notes:"",...patch,name:String(req(a.name,"name"))};
          const ref=await store.add("inquiries",body);state.inquiries[ref.id]=body;render();act("Logged inquiry: "+body.name);return {id:ref.id};}},
      {name:"update_sprint",description:"Changes a sprint's name, goal or cumulative targets (posts, comments, applications) by sprint number n (1 to 6).",
        inputSchema:{type:"object",properties:{n:{type:"number"},name:{type:"string"},goal:{type:"string"},posts:{type:"number"},comments:{type:"number"},applications:{type:"number"}},required:["n"]},
        execute:async(a)=>{const n=Math.round(Number(a.n)),cur=sprints().find(p=>p.n===n);if(!cur)throw new Error("No sprint "+n);const patch={};
          for(const k of ["name","goal"])if(a[k])patch[k]=String(a[k]);for(const k of ["posts","comments","applications"])if(a[k]!==undefined)patch[k]=Math.max(0,Number(a[k])||0);
          const body={...cur,...patch};await write("sprints/s"+n,body,false);state.sprints["s"+n]=body;render();act("Updated sprint "+n);return "ok";}}
    ];
    document.getElementById("chatForm").addEventListener("submit",async e=>{
      e.preventDefault(); const q=input.value.trim(); if(!q||busy||!sample)return;
      input.value=""; bubble("me",q); turns.push({role:"user",content:q}); if(turns.length>16)turns=turns.slice(-16); while(turns.length&&turns[0].role!=="user")turns.shift();
      const out=bubble("ai","Thinking..."); busy=true; ctl=new AbortController();
      document.getElementById("chatStop").hidden=false; document.getElementById("chatSend").disabled=true;
      try{
        const opts={signal:ctl.signal,onText:({text})=>{out.textContent=text;chatEl.scrollTop=chatEl.scrollHeight;}};
        if(toolsOk)opts.tools=TOOLS; else opts.cache=false;
        const {text}=await sample([{role:"user",content:rules()},...turns],opts);
        out.textContent=text; turns.push({role:"assistant",content:text});
      }catch(err){
        const c=err&&err.code;
        if(c==="cancelled"){out.textContent=(err.text||"")||"Stopped.";}
        else if(c==="tools_unavailable"){toolsOk=false;out.remove();bubble("err","Editing isn't available in this view, so I can only answer questions here. Try sending again.");turns.pop();}
        else if(["not_granted","sampling_disabled","not_declared","capability_disabled","capability_removed"].includes(c)){out.remove();bubble("err","Claude isn't available on this page right now. You can still ask Claude in your main chat.");sample=null;document.getElementById("chatSend").disabled=true;}
        else if(c==="rate_limited"){out.textContent=err.text||"";bubble("err","Too many requests for now. Wait a bit, then try again.");}
        else {out.textContent=err&&err.text||"";bubble("err","Something went wrong. Try again in a moment.");}
      }finally{busy=false;ctl=null;document.getElementById("chatStop").hidden=true;if(sample)document.getElementById("chatSend").disabled=false;}
    });
    (async()=>{
      sample=await window.claude?.use?.("sample"); if(!sample)return;
      try{const lim=await sample.limits();toolsOk=!!(lim&&lim.tools&&lim.tools.maxCount>=TOOLS.length);}catch(e){toolsOk=false;}
      document.getElementById("askFab").hidden=false;
    })();
  })();
  // ---------- info icons: hover 2 s, or tap / focus to show ----------
  const CTR_INFO={hours:"Filled in automatically from your Time entries for the day (if two timers overlap, that time counts once). Use + Add time to log work you did without a timer: it asks when, so it lands in Time entries too. Weekly target: 50 in November, 60 in December.",
    learning:"Filled in from Time entries that are learning: Block 5, timers on learning tasks or learning to-dos, and time you add here. Overlaps count once. Weekly target: 10. Learning is part of hours worked.",
    posts:"LinkedIn posts published that day. Each + also records the time you posted in Time entries. Target: 5 a week in November, 10 a week in December.",
    comments:"Thoughtful comments on posts by founders and Gulf startup people. Target: 10 a day. This is how inbound starts, without cold messages.",
    applications:"Studio and job applications sent that day. Target: 20 by 3 January.",
    drafts:"LinkedIn drafts you wrote that day. They fill your bank: bank = all drafts minus all posts. Ticking a task whose name starts with Bank: adds one draft by itself."};
  function info(text){return el("button",{type:"button",class:"info","aria-label":"What is this?","data-info":text,text:"i"});}
  (function(){
    const tip=document.getElementById("infoTip"); let timer=null, cur=null;
    function show(b){cur=b;tip.textContent=b.dataset.info;tip.classList.add("show");b.setAttribute("aria-expanded","true");
      const r=b.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;let x=r.left+r.width/2-w/2,y=r.bottom+8;
      x=Math.max(8,Math.min(window.innerWidth-w-8,x));if(y+h>window.innerHeight-8)y=r.top-h-8;tip.style.left=x+"px";tip.style.top=y+"px";}
    function hide(){clearTimeout(timer);timer=null;tip.classList.remove("show");if(cur)cur.removeAttribute("aria-expanded");cur=null;}
    document.addEventListener("mouseover",e=>{const b=e.target.closest&&e.target.closest(".info");if(!b||b===cur)return;clearTimeout(timer);timer=setTimeout(()=>show(b),2000);});
    document.addEventListener("mouseout",e=>{const b=e.target.closest&&e.target.closest(".info");if(b&&!b.contains(e.relatedTarget))hide();});
    document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest(".info");if(b){e.preventDefault();e.stopPropagation();if(cur===b)hide();else{clearTimeout(timer);show(b);}}else if(cur)hide();},true);
    document.addEventListener("focusin",e=>{if(e.target.classList&&e.target.classList.contains("info")&&e.target.matches(":focus-visible"))show(e.target);});
    document.addEventListener("focusout",e=>{if(e.target===cur)hide();});
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&cur)hide();});
    window.addEventListener("scroll",()=>{if(cur)hide();},{passive:true});
  })();
  // ---------- "wooo" sound, synthesized (no audio files) ----------
  // ---------- notification sounds: built-in tones plus your own uploaded files ----------
  const SND_SLOTS=[["break","Focus ends, break starts","bowl"],["focus","Break ends, back to focus","rise"],["end","Block or session finished","chime"],["reminder","Reminders","bells"],["prayer","Prayer time","bowl"],["done","Ticking something done","woo"],["gym","Gym timer and rest","digital"]];
  const TONES={chime:"Chime",bowl:"Singing bowl",rise:"Rising notes",marimba:"Marimba",soft:"Soft ding",bells:"Bells",digital:"Digital beeps",woo:"Cheer",none:"Silent"};
  function sndCfg(){const c=(state.settings&&state.settings.sounds)||{};return {map:c.map||{},vol:c.vol==null?0.8:Number(c.vol)};}
  function sndCustoms(){return Object.entries(state.settings||{}).filter(([k,v])=>k.startsWith("snd_")&&v&&v.data).map(([k,v])=>({id:k,name:v.name||"My sound",data:v.data}));}
  function sndFor(slot){const d=SND_SLOTS.find(x=>x[0]===slot);const v=sndCfg().map[slot];if(v&&(TONES[v]||(state.settings||{})[v]))return v;return d?d[2]:"chime";}
  function ac(){actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==="suspended")actx.resume();return actx;}
  function synth(id,vol){
    if(id==="chime")return bellRaw();if(id==="woo")return wooRaw();if(id==="none")return;
    const a=ac(),t=a.currentTime,out=a.createGain();out.gain.value=vol;out.connect(a.destination);
    const note=(f,o,len,type,peak)=>{const os=a.createOscillator(),g=a.createGain();os.type=type||"sine";os.frequency.value=f;g.gain.setValueAtTime(0.0001,t+o);g.gain.exponentialRampToValueAtTime(peak||0.3,t+o+0.015);g.gain.exponentialRampToValueAtTime(0.0001,t+o+len);os.connect(g);g.connect(out);os.start(t+o);os.stop(t+o+len+0.05);};
    if(id==="bowl"){[[220,0.35],[444.4,0.12],[673.2,0.06],[871.2,0.04]].forEach(([f,p])=>note(f,0,3.2,"sine",p));}
    else if(id==="rise"){[523.3,659.3,784,1046.5].forEach((f,i)=>note(f,i*0.13,0.5,"triangle",0.25));}
    else if(id==="marimba"){[[784,0],[659.3,0.14],[523.3,0.28]].forEach(([f,o])=>{note(f,o,0.35,"sine",0.35);note(f*4,o,0.08,"sine",0.06);});}
    else if(id==="soft"){note(1046.5,0,1.2,"sine",0.22);note(2093,0,0.4,"sine",0.04);}
    else if(id==="bells"){[[659.3,0],[523.3,0.45],[587.3,0.9],[392,1.35]].forEach(([f,o])=>{note(f,o,1.4,"sine",0.25);note(f*2.76,o,0.6,"sine",0.05);});}
    else if(id==="digital"){[0,0.18,0.36].forEach(o=>note(1568,o,0.12,"square",0.08));}
  }
  const sndBuf={};
  function b64buf(data){const bin=atob(String(data).split(",")[1]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;}
  async function playCustom(cid,vol){const c=(state.settings||{})[cid];if(!c||!c.data)return false;
    try{const a=ac();if(!sndBuf[cid]||sndBuf[cid].src!==c.data)sndBuf[cid]={src:c.data,buf:await a.decodeAudioData(b64buf(c.data))};
      const src=a.createBufferSource(),g=a.createGain();src.buffer=sndBuf[cid].buf;src.connect(g);g.connect(a.destination);
      const now=a.currentTime,len=Math.min(src.buffer.duration,8);g.gain.setValueAtTime(vol,now);g.gain.setValueAtTime(vol,now+Math.max(0,len-0.4));g.gain.linearRampToValueAtTime(0.0001,now+len);src.start(now);src.stop(now+len+0.05);return true;}catch(e){return false;}}
  function playTone(id,vol){vol=vol==null?sndCfg().vol:vol;if(id&&id.startsWith("snd_")){playCustom(id,vol).then(ok=>{if(!ok)try{synth("chime",vol);}catch(e){}});return;}try{synth(id||"chime",vol);}catch(e){}}
  function playSlot(slot){if(!soundOn)return true;playTone(sndFor(slot));return true;}
  async function saveSounds(patch){const c=(state.settings&&state.settings.sounds)||{},v={...c,...patch,at:Date.now()};state.settings={...state.settings,sounds:v};renderSounds();
    if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return;}try{await store.set("settings/sounds",v);}catch(e){fail(e);}}
  function renderSounds(){
    const box=document.getElementById("sndBody");if(!box)return;if(box.contains(document.activeElement)&&document.activeElement.tagName!=="BUTTON")return;
    const cfg=sndCfg(),cs=sndCustoms();
    const opts=(cur)=>[...Object.entries(TONES).map(([k,n])=>{const o=el("option",{value:k,text:n});if(k===cur)o.selected=true;return o;}),...(cs.length?[el("optgroup",{label:"Your sounds"},...cs.map(c=>{const o=el("option",{value:c.id,text:c.name});if(c.id===cur)o.selected=true;return o;}))]:[])];
    const rows=SND_SLOTS.map(([k,lbl])=>{const sel=el("select",{class:"snd-sel","aria-label":"Sound for "+lbl,onchange:e=>{playTone(e.target.value);saveSounds({map:{...sndCfg().map,[k]:e.target.value}});}},...opts(sndFor(k)));
      return el("div",{class:"snd-row"},el("span",{class:"snd-l",text:lbl}),sel,el("button",{type:"button",class:"mini","aria-label":"Play the sound for "+lbl,text:"▶ Play",onclick:()=>playTone(sndFor(k))}));});
    const vol=el("input",{type:"range",min:"0.1",max:"1",step:"0.1","aria-label":"Volume",onchange:e=>{const v=Number(e.target.value);saveSounds({vol:v});playTone(sndFor("break"),v);}});vol.value=String(cfg.vol);
    const file=el("input",{type:"file",accept:"audio/*,.mp3,.wav,.m4a,.ogg,.aac",hidden:"",onchange:e=>addSound(e.target)});
    const up=el("div",{class:"snd-up"},el("button",{type:"button",class:"btn ghost",text:"Upload a sound",onclick:()=>file.click()}),file,
      el("span",{class:"hint",text:"MP3, M4A or OGG, up to 180 KB (about 8 to 10 seconds). A sound plays for 8 seconds at most."}));
    const list=cs.length?el("div",{class:"snd-list"},...cs.map(c=>el("div",{class:"snd-item"},el("span",{text:"♪ "+c.name}),el("button",{type:"button",class:"mini",text:"▶ Play","aria-label":"Play "+c.name,onclick:()=>playTone(c.id)}),
      el("button",{type:"button",class:"mini",text:"Remove","aria-label":"Remove "+c.name,onclick:()=>delSound(c.id)})))):null;
    box.replaceChildren(...[el("div",{class:"snd-rows"},...rows),el("label",{class:"snd-vol"},el("span",{text:"Volume"}),vol),up,list].filter(Boolean));
  }
  async function addSound(input){const f=input.files&&input.files[0];input.value="";if(!f)return;
    if(f.size>180*1024){toast("That file is "+Math.round(f.size/1024)+" KB. Trim it to under 180 KB (about 8 to 10 seconds) and try again.");return;}
    const data=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f);});
    try{await ac().decodeAudioData(b64buf(data));}catch(e){toast("This file can't be played. Try an MP3 or WAV.");return;}
    const id="snd_"+Date.now().toString(36),doc={name:f.name.replace(/[.][^.]+$/,"").slice(0,40),data};
    state.settings={...state.settings,[id]:doc};renderSounds();playTone(id);toast("Sound added. Pick it for any moment above");
    if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return;}try{await store.set("settings/"+id,doc);}catch(e){fail(e);}}
  async function delSound(id){const next={...state.settings};delete next[id];const map={...sndCfg().map};Object.keys(map).forEach(k=>{if(map[k]===id)delete map[k];});
    state.settings=next;if(db){try{await store.del("settings/"+id);}catch(e){fail(e);}}saveSounds({map});}
  let actx=null, soundOn=true;
  try{soundOn=localStorage.getItem("sb-sound")!=="off";}catch(e){}
  function woo(){
    if(!soundOn)return;if(playSlot("done"))return;wooRaw();}
  function wooRaw(){
    try{
      actx=actx||new (window.AudioContext||window.webkitAudioContext)();
      if(actx.state==="suspended")actx.resume();
      const t=actx.currentTime, out=actx.createGain(); out.gain.value=0.9; out.connect(actx.destination);
      // voice-like "wooo": sawtooth with rising then falling pitch, vibrato, through "oo" formants
      const o=actx.createOscillator(); o.type="sawtooth";
      o.frequency.setValueAtTime(260,t); o.frequency.exponentialRampToValueAtTime(620,t+0.28); o.frequency.exponentialRampToValueAtTime(540,t+0.75);
      const vib=actx.createOscillator(), vg=actx.createGain(); vib.frequency.value=6.5; vg.gain.setValueAtTime(0,t); vg.gain.linearRampToValueAtTime(14,t+0.35); vib.connect(vg); vg.connect(o.frequency);
      const env=actx.createGain(); env.gain.setValueAtTime(0.0001,t); env.gain.exponentialRampToValueAtTime(0.35,t+0.06); env.gain.setValueAtTime(0.35,t+0.5); env.gain.exponentialRampToValueAtTime(0.0001,t+0.85);
      const f1=actx.createBiquadFilter(); f1.type="bandpass"; f1.frequency.value=380; f1.Q.value=5;
      const f2=actx.createBiquadFilter(); f2.type="bandpass"; f2.frequency.value=900; f2.Q.value=6;
      const g2=actx.createGain(); g2.gain.value=0.5;
      o.connect(env); env.connect(f1); env.connect(f2); f2.connect(g2); f1.connect(out); g2.connect(out);
      // a small sparkle on top
      [1318.5,1760,2093].forEach((fr,i)=>{const so=actx.createOscillator(),sg=actx.createGain();so.type="triangle";so.frequency.value=fr;const st=t+0.05+i*0.07;sg.gain.setValueAtTime(0.0001,st);sg.gain.exponentialRampToValueAtTime(0.08,st+0.01);sg.gain.exponentialRampToValueAtTime(0.0001,st+0.35);so.connect(sg);sg.connect(out);so.start(st);so.stop(st+0.4);});
      o.start(t); vib.start(t); o.stop(t+0.9); vib.stop(t+0.9);
    }catch(e){}
  }
  function setSound(on){soundOn=on;try{localStorage.setItem("sb-sound",on?"on":"off");}catch(e){}const b=document.getElementById("soundBtn");b.setAttribute("aria-pressed",String(on));b.textContent=on?"Sound on":"Sound off";if(on)woo();}
  function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("show"),1600);}

  function sprints(){const list=Object.values(state.sprints);return (list.length?list:DEFAULT_SPRINTS).slice().sort((a,b)=>a.n-b.n);}
  function sprintFor(s){return sprints().find(p=>s>=p.start&&s<=p.end)||sprints()[0];}
  function weekStart(s){let d=s;while(parse(d).getDay()!==6)d=addDays(d,-1);return d;} // weeks run Sat to Fri
  function weeklyTarget(s){return s<"2026-12-01"?50:60;}
  function log(s){return state.logs[s]||{};}
  function sumLogs(from,to,key){
    if(key==="hours"||key==="learning"){let t=0;for(let d=from;d<=to;d=addDays(d,1))t+=key==="hours"?hoursOn(d):learningOn(d);return Math.round(t*100)/100;}
    let t=0;for(const k in state.logs){if(k>=from&&k<=to)t+=Number(state.logs[k][key]||0);}return t;}
  // Hours worked = time entries for the day (overlaps counted once) + any manual adjustment from the +/- buttons.
  function entryHours(d){return unionMin(itemsOn(d))/60;}
  function entryHoursOld(d){
    const items=(state.entries[d]&&Array.isArray(state.entries[d].items))?state.entries[d].items:[];
    let timed=0,untimed=0;const iv=[];
    items.forEach(x=>{const ss=sessionsOf(x);if(!ss.length){untimed+=Number(x.minutes||0);return;}ss.forEach(se=>{timed+=Number(se.minutes||0);iv.push([se.start,se.end]);});});
    iv.sort((a,b)=>a[0]-b[0]);let raw=0,union=0,cs=null,ce=null;
    iv.forEach(([a,b])=>{raw+=b-a;if(cs===null){cs=a;ce=b;}else if(a<=ce){ce=Math.max(ce,b);}else{union+=ce-cs;cs=a;ce=b;}});if(cs!==null)union+=ce-cs;
    const overlap=Math.max(0,(raw-union)/60000);
    return Math.max(0,(timed-overlap+untimed)/60);
  }
  function hoursAdj(d){const L=log(d);if(L.hoursAdj!==undefined)return Number(L.hoursAdj)||0;const has=state.entries[d]&&Array.isArray(state.entries[d].items)&&state.entries[d].items.length;return has?0:Number(L.hours||0);}
  function hoursOn(d){return Math.max(0,Math.round((entryHours(d)+hoursAdj(d))*100)/100);}
  function tasksOn(s){return Object.entries(state.tasks).map(([id,t])=>({id,...t})).filter(t=>t.date===s&&!t.cut&&isLeaf(t)).sort((a,b)=>(a.order||0)-(b.order||0));}
  function dayKept(s){const L=log(s);if(L.dayState==="sick"||L.dayState==="rest")return true;const ts=tasksOn(s);const allDone=ts.length>0&&ts.every(t=>t.done);return hoursOn(s)>=1&&(Number(L.posts||0)>=1||Number(L.comments||0)>=10||allDone);}
  function streak(){let s=iso(new Date());if(s>END)s=END;let n=0;if(!dayKept(s))s=addDays(s,-1);while(s>=START){if(isFriday(s)){s=addDays(s,-1);continue;}if(!dayKept(s))break;n++;s=addDays(s,-1);}return n;}

  // ---------- writes ----------
  async function setTask(id,patch){if(!db)return;try{await store.update("tasks/"+id,patch);}catch(e){fail(e);}}
  const pending={}, dirty=new Set();
  function queueSave(s,ms){dirty.add(s);clearTimeout(pending[s]);pending[s]=setTimeout(()=>saveLog(s),ms);}
  function bumpLog(key,delta){
    const L={...log(sel)};L.date=sel;
    if(key==="hours"){const eh=entryHours(sel);L.hoursAdj=Math.max(-eh,Math.round((hoursAdj(sel)+delta)*100)/100);L.hours=Math.round((eh+L.hoursAdj)*100)/100;}
    else L[key]=Math.max(0,Math.round((Number(L[key]||0)+delta)*2)/2);
    state.logs[sel]=L;render();queueSave(sel,600);
  }
  // ---------- self-mastery: days avoided, urges overcome, gentle slips (private, discreet by default) ----------
  const GUARD_MILES=[1,3,7,14,21,30,40,60,90];
  const TRIGGERS=["After waking or a nap","Phone in bed","Bored or no plan","Tired or low sleep","Stress","Alone late at night","Other"];
  let guardShown=false, urgeEnd=null, urgeTimer=null, slipForm=false;
  try{guardShown=localStorage.getItem("sb-guard-show")==="1";}catch(e){}
  function G(){const g=state.guard&&state.guard.main;return g||null;}
  async function saveGuard(body){state.guard={...state.guard,main:body};render();if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return;}try{await store.set("guard/main",body);}catch(e){fail(e);}}
  function guardStats(){
    const g=G(); if(!g)return null; const today=iso(new Date());
    const slips=(g.slips||[]).map(x=>x.date).sort(), slipSet=new Set(slips), last=slips.length?slips[slips.length-1]:null;
    // streak = full days without a slip since the start or the last slip; today counts once it is clean so far
    let from=last?addDays(last,1):g.start; let streak=0; for(let d=from;d<=today;d=addDays(d,1))streak++;
    if(from>today)streak=0;
    let clean=0,best=0,run=0; for(let d=g.start;d<=today;d=addDays(d,1)){if(slipSet.has(d)){run=0;}else{clean++;run++;best=Math.max(best,run);}}
    const wins=(g.wins||[]).length, winsToday=(g.wins||[]).filter(w=>iso(new Date(w.at))===today).length;
    const trig={};(g.slips||[]).forEach(x=>{if(x.trigger)trig[x.trigger]=(trig[x.trigger]||0)+1;});
    const top=Object.entries(trig).sort((a,b)=>b[1]-a[1])[0];
    const next=GUARD_MILES.find(m=>m>streak)||null;
    return {g,today,streak,clean,best,wins,winsToday,slipSet,top,next,days:Math.max(1,Math.round((parse(today)-parse(g.start))/864e5)+1)};
  }
  function startUrge(){urgeEnd=Date.now()+10*60000;clearInterval(urgeTimer);urgeTimer=setInterval(()=>{const e=document.getElementById("urgeClock");if(!urgeEnd){clearInterval(urgeTimer);return;}const left=Math.max(0,urgeEnd-Date.now());if(e)e.textContent=clock(left).slice(3);if(left<=0){clearInterval(urgeTimer);render();}},1000);render();say("Urge plan opened. Ten minute countdown started.");}
  async function urgeWon(){const g=G();if(!g)return;urgeEnd=null;clearInterval(urgeTimer);await saveGuard({...g,wins:[...(g.wins||[]),{at:Date.now()}]});woo();toast("You overcame it. That's a real win");}
  async function logSlip(trigger,note){const g=G();if(!g)return;const today=iso(new Date());slipForm=false;
    const slips=[...(g.slips||[]).filter(x=>x.date!==today),{date:today,at:Date.now(),trigger:trigger||"",note:note||""}];
    await saveGuard({...g,slips});toast("Logged. Fresh start from tomorrow. Make tawbah, then do the next small task");}
  async function undoSlip(date){const g=G();if(!g)return;await saveGuard({...g,slips:(g.slips||[]).filter(x=>x.date!==date)});toast("Removed");}
  function renderGuard(){
    const box=document.getElementById("guardBody"); if(!box)return;
    const st=guardStats(), hdrHint=document.getElementById("guardSum");
    const toggle=el("button",{type:"button",class:"mini",text:guardShown?"Hide":"Show","aria-pressed":String(guardShown),onclick:()=>{guardShown=!guardShown;try{localStorage.setItem("sb-guard-show",guardShown?"1":"0");}catch(e){}render();}});
    rc(hdrHint,toggle);
    if(!guardShown){rc(box,el("p",{class:"hint",text:"Private section, hidden on screen. Tap Show to open it."}));return;}
    if(!st){rc(box,el("div",{class:"gd-empty"},el("p",{text:"Track the days you stay in control, and every urge you overcome. Slips are logged gently, without shame."}),
      el("button",{class:"btn",type:"button",text:"Start from today",onclick:()=>saveGuard({start:iso(new Date()),slips:[],wins:[]})})));return;}
    const msg=st.streak===0?"Today is day one. Keep it clean from now.":st.streak===1?"1 clean day. Every streak starts here.":st.streak+" days in control. Keep going.";
    const hero=el("div",{class:"gd-hero"},
      el("div",{class:"gd-big"},el("b",{class:"num",text:String(st.streak)}),el("span",{class:"label",text:st.streak===1?"day":"days"})),
      el("div",{class:"gd-side"},el("span",{class:"gd-msg",text:msg}),
        st.next?el("div",{class:"gd-next"},el("div",{class:"track"},el("div",{class:"fill good",style:"width:"+Math.min(100,st.streak/st.next*100)+"%"})),el("span",{class:"hint",text:"Next milestone: "+st.next+" days ("+(st.next-st.streak)+" to go)"})):el("span",{class:"hint",text:"Beyond 90 days. Masha'Allah, keep protecting it."})));
    const tiles=el("div",{class:"slp-tiles"},
      el("div",{class:"slp-tile"},el("b",{class:"num",text:String(st.best)}),el("span",{class:"hint",text:"best streak"})),
      el("div",{class:"slp-tile"},el("b",{class:"num",text:st.clean+"/"+st.days}),el("span",{class:"hint",text:"clean days since "+fmt(st.g.start,{day:"numeric",month:"short"})})),
      el("div",{class:"slp-tile"},el("b",{class:"num",text:String(st.wins)}),el("span",{class:"hint",text:"urges overcome"+(st.winsToday?" ("+st.winsToday+" today)":"")})));
    const days=[];for(let i=13;i>=0;i--){const d=addDays(st.today,-i);const before=d<st.g.start;const slip=st.slipSet.has(d);
      days.push(el("span",{role:"img",class:"gd-dot"+(before?" out":slip?" slip":d===st.today?" today":" ok"),title:fmt(d,{weekday:"short",day:"numeric",month:"short"})+(before?"":slip?": slip":d===st.today?": today":": clean"),"aria-label":fmt(d,{weekday:"short",day:"numeric",month:"short"})+(before?", before start":slip?", slip":", clean")}));}
    const dots=el("div",{class:"sh-sec"},el("span",{class:"label",text:"Last 14 days"}),el("div",{class:"gd-dots"},...days));
    const badges=el("div",{class:"gd-badges"},...GUARD_MILES.map(m=>el("span",{class:"chip"+(st.best>=m?" good":""),text:(st.best>=m?"✓ ":"")+m+" day"+(m>1?"s":"")})));
    let urge;
    if(urgeEnd){const left=Math.max(0,urgeEnd-Date.now());
      urge=el("div",{class:"gd-urge",role:"region","aria-label":"Urge plan"},
        el("div",{class:"gd-urge-top"},el("b",{text:"Ride it out. It peaks and passes."}),el("span",{class:"num gd-clock",id:"urgeClock",text:clock(left).slice(3)})),
        el("ol",{class:"gd-steps"},el("li",{text:"Stand up and leave the room, now."}),el("li",{text:"Make wudu with cool water. Pray two rak'at or say your adhkar."}),el("li",{text:"Move for 2 minutes: 20 squats or push-ups, or a short walk."}),el("li",{text:"Start the smallest task: tap ⏱ on one task for 15 minutes."})),
        el("div",{class:"slp-btns"},el("button",{class:"btn",type:"button",text:left<=0?"I made it. Log the win":"I'm through it. Log the win",onclick:urgeWon}),el("button",{class:"mini",type:"button",text:"Close",onclick:()=>{urgeEnd=null;clearInterval(urgeTimer);render();}})));
    }else urge=el("div",{class:"slp-btns"},el("button",{class:"btn",type:"button",text:"I feel an urge",onclick:startUrge}),el("button",{class:"btn ghost",type:"button",text:"Log a slip",onclick:()=>{slipForm=!slipForm;render();}}));
    let slip=null;
    if(slipForm){const sel3=el("select",{"aria-label":"What came before it"},el("option",{value:"",text:"What came before it? (optional)"}),...TRIGGERS.map(t=>el("option",{value:t,text:t})));
      const note=el("input",{type:"text",placeholder:"One line for future you (optional)","aria-label":"Note"});
      slip=el("div",{class:"gd-slip"},el("p",{class:"hint",text:"No shame here. Logging it honestly is part of getting stronger. Allah loves those who turn back to Him often."}),sel3,note,
        el("div",{class:"slp-btns"},el("button",{class:"btn ghost",type:"button",text:"Log it and restart",onclick:()=>logSlip(sel3.value,note.value.trim())}),el("button",{class:"mini",type:"button",text:"Cancel",onclick:()=>{slipForm=false;render();}})));}
    const recent=(st.g.slips||[]).slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
    const insight=st.top&&st.top[1]>=2?el("p",{class:"hint",text:"Pattern: "+st.top[1]+" slips came after “"+st.top[0]+"”. Plan for that moment in advance."}):null;
    const hist=recent.length?el("details",{class:"edit-box"},el("summary",{text:"Slip history"}),el("ul",{class:"slp-list"},...recent.map(x=>el("li",{class:"slp-row"},el("span",{text:"·"}),el("span",{class:"ent-what"},el("span",{text:fmt(x.date,{weekday:"short",day:"numeric",month:"short"})}),el("span",{class:"hint",text:[x.trigger,x.note].filter(Boolean).join(" · ")})),el("span"),el("button",{class:"x","aria-label":"Remove this slip entry",text:"×",onclick:()=>undoSlip(x.date)}))))):null;
    box.replaceChildren(...[hero,tiles,urge,slip,dots,el("div",{class:"sh-sec"},el("span",{class:"label",text:"Milestones"}),badges),insight,hist].filter(Boolean));
  }
  // ---------- sleep tracker: its own entries and analytics, kept apart from work hours ----------
  let sleepWs=null, sleepEdit=null, sleepDraft=null;
  const SLP_DAY=24*60;
  function sleepDay(end){return iso(new Date(end+6*3600000));} // a sleep belongs to the day you woke up (anything ending after 18:00 counts for the next day)
  function sleepsOn(d){return Object.entries(state.sleep).map(([id,x])=>({id,...x})).filter(x=>x.start&&x.end&&sleepDay(x.end)===d).sort((a,b)=>a.start-b.start);}
  function sleepMin(x){return Math.max(0,(x.end-x.start)/60000);}
  function sleepActive(){const t=state.timers.sleep;return t&&t.startedAt?t:null;}
  function toLocalInput(ms){return iso(new Date(ms))+"T"+hhmm(ms);}
  async function setSleepTimer(body){state.timers={...state.timers,sleep:body};render();
    if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return;}try{await store.set("timers/sleep",body);}catch(e){fail(e);}}
  function startSleep(kind){setSleepTimer({startedAt:Date.now(),kind});toast(kind==="nap"?"Nap started. Rest well":"Good night. Tap I'm awake when you get up");}
  async function wakeUp(){
    const t=sleepActive();if(!t)return;const end=Date.now(),m=(end-t.startedAt)/60000;
    await setSleepTimer({startedAt:null});
    if(m<5){toast("Under 5 minutes, so nothing was saved");return;}
    await saveSleep(null,{start:t.startedAt,end,kind:t.kind||"night"});woo();
    toast((t.kind==="nap"?"Nap":"Slept")+": "+dur(m)+" logged");
  }
  async function saveSleep(id,body){
    const sid=id||(Date.now().toString(36)+Math.random().toString(36).slice(2,6));
    state.sleep={...state.sleep,[sid]:body};render();
    if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return;}
    try{await store.set("sleep/"+sid,body);}catch(e){fail(e);}
  }
  async function delSleep(id){const n={...state.sleep};delete n[id];state.sleep=n;render();toast("Sleep entry removed");if(db){try{await store.del("sleep/"+id);}catch(e){fail(e);}}}
  function sleepStats(ws){
    const rows=[0,1,2,3,4,5,6].map(i=>{const d=addDays(ws,i),xs=sleepsOn(d),ns=xs.filter(x=>x.kind!=="nap"),ps=xs.filter(x=>x.kind==="nap");
      return {d,xs,night:ns.reduce((a,x)=>a+sleepMin(x),0),nap:ps.reduce((a,x)=>a+sleepMin(x),0),naps:ps.length,bed:ns.length?ns[0].start:null,wake:ns.length?ns[ns.length-1].end:null};});
    const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
    const rel=(ms,d)=>(ms-atOn(addDays(d,-1),"18:00"))/60000;
    const logged=rows.filter(r=>r.xs.length), nights=rows.filter(r=>r.night>0);
    return {rows,logged:logged.length,nights:nights.length,
      avgTotal:avg(logged.map(r=>r.night+r.nap)),avgNight:avg(nights.map(r=>r.night)),
      avgBed:avg(nights.map(r=>rel(r.bed,r.d))),avgWake:avg(nights.map(r=>rel(r.wake,r.d))),
      napMin:rows.reduce((a,r)=>a+r.nap,0),napCount:rows.reduce((a,r)=>a+r.naps,0),
      shortest:nights.length?nights.reduce((a,b)=>b.night<a.night?b:a):null,longest:nights.length?nights.reduce((a,b)=>b.night>a.night?b:a):null};
  }
  function relClock(min){const t=((18*60+Math.round(min))%SLP_DAY+SLP_DAY)%SLP_DAY;return String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0");}
  function sleepCls(min){return min>=420?"good":min>=360?"warn":"bad";}
  function sleepForm(x){
    if(!sleepDraft){const base=x||{kind:"night",start:atOn(addDays(sel,-1),"23:00"),end:atOn(sel,"07:00")};sleepDraft={kind:base.kind||"night",from:toLocalInput(base.start),to:toLocalInput(base.end)};}
    const kind=el("select",{"aria-label":"Type"},el("option",{value:"night",text:"Night sleep"}),el("option",{value:"nap",text:"Nap"}));kind.value=sleepDraft.kind;kind.onchange=()=>{sleepDraft.kind=kind.value;};
    const from=el("input",{type:"datetime-local","aria-label":"Fell asleep"});from.value=sleepDraft.from;from.oninput=()=>{sleepDraft.from=from.value;};
    const to=el("input",{type:"datetime-local","aria-label":"Woke up"});to.value=sleepDraft.to;to.oninput=()=>{sleepDraft.to=to.value;};
    const msg=el("span",{class:"saved"});
    const close=()=>{sleepEdit=null;sleepDraft=null;render();};
    return el("li",{class:"slp-form"},
      el("label",{class:"field"},el("span",{class:"label",text:"Type"}),kind),
      el("label",{class:"field"},el("span",{class:"label",text:"Fell asleep"}),from),
      el("label",{class:"field"},el("span",{class:"label",text:"Woke up"}),to),
      el("div",{class:"acts"},
        el("button",{class:"btn",type:"button",text:x?"Save changes":"Add sleep",onclick:()=>{
          if(!from.value||!to.value){msg.textContent="Set both times.";return;}
          const s=new Date(from.value).getTime(),e=new Date(to.value).getTime();
          if(!(e>s)){msg.textContent="Wake-up must be after falling asleep.";return;}
          if(e-s>20*3600000){msg.textContent="That's over 20 hours. Check the dates.";return;}
          if(e>Date.now()+60000){msg.textContent="The wake-up time hasn't happened yet.";return;}
          const id=x?x.id:null, body={start:s,end:e,kind:kind.value};sleepEdit=null;sleepDraft=null;saveSleep(id,body);toast((x?"Updated: ":"Added: ")+dur((e-s)/60000));}}),
        el("button",{class:"mini",type:"button",text:"Cancel",onclick:close}),msg));
  }
  function sleepRow(x){
    if(sleepEdit===x.id)return sleepForm(x);
    const del=el("button",{class:"x","aria-label":"Delete this sleep entry",text:"×"});let armed=false;
    del.onclick=()=>{if(!armed){armed=true;del.textContent="Delete?";del.classList.add("armed");setTimeout(()=>{armed=false;del.textContent="×";del.classList.remove("armed");},3000);return;}delSleep(x.id);};
    const m=sleepMin(x);
    return el("li",{class:"slp-row"},el("span",{class:"slp-ico",text:x.kind==="nap"?"💤":"🌙"}),
      el("span",{class:"ent-what"},el("span",{class:"ent-label",text:x.kind==="nap"?"Nap":"Night sleep"}),el("span",{class:"hint num",text:hhmm(x.start)+" to "+hhmm(x.end)+(iso(new Date(x.start))!==iso(new Date(x.end))?" (from "+fmt(iso(new Date(x.start)),{weekday:"short"})+")":"")})),
      el("span",{class:"ent-dur num",text:dur(m)}),
      el("span",{class:"ent-acts"},el("button",{class:"x ren","aria-label":"Edit this sleep entry",title:"Edit times",text:"✎",onclick:()=>{sleepEdit=x.id;sleepDraft=null;render();}}),del));
  }
  function renderSleep(){
    const box=document.getElementById("sleepBody");if(!box)return;
    const t=sleepActive(), today=iso(new Date()), ws=sleepWs||weekStart(sel), st=sleepStats(ws), pv=sleepStats(addDays(ws,-7));
    const last7=sleepStats(addDays(today,-6));
    document.getElementById("slpSum").textContent=last7.avgTotal!=null?"Last 7 days: "+dur(last7.avgTotal)+" a day on average":"";
    // 1) now: start / wake up
    const ctrl=t?el("div",{class:"slp-now"},el("span",{class:"slp-moon",text:t.kind==="nap"?"💤":"🌙"}),
        el("div",{class:"slp-now-t"},el("b",{text:(t.kind==="nap"?"Napping":"Sleeping")+" since "+hhmm(t.startedAt)+(iso(new Date(t.startedAt))!==today?" yesterday":"")}),el("span",{class:"num slp-clock","data-sclock":"1",text:clock(Date.now()-t.startedAt)})),
        el("button",{class:"btn",type:"button",text:"I'm awake",onclick:wakeUp}),
        el("button",{class:"mini",type:"button",text:"Cancel",onclick:()=>{setSleepTimer({startedAt:null});toast("Cancelled, nothing saved");}}))
      :el("div",{class:"slp-btns"},
        el("button",{class:"btn slp-go",type:"button",text:"🌙 Going to sleep",onclick:()=>startSleep("night")}),
        el("button",{class:"btn ghost",type:"button",text:"💤 Start a nap",onclick:()=>startSleep("nap")}),
        el("button",{class:"btn ghost",type:"button",text:"+ Add by hand",onclick:()=>{sleepEdit="new";sleepDraft=null;render();}}));
    // 2) the selected day
    const xs=sleepsOn(sel), tot=xs.reduce((a,x)=>a+sleepMin(x),0);
    const day=el("div",{class:"sh-sec"},
      el("div",{class:"panel-head"},el("span",{class:"label",text:sel===today?"Last night and today":"Sleep for "+fmt(sel,{weekday:"short",day:"numeric",month:"short"})}),el("span",{class:"hint num",text:xs.length?dur(tot)+" in total":""})),
      el("ul",{class:"slp-list"},...(xs.length?xs.map(sleepRow):(sleepEdit==="new"?[]:[el("li",{class:"empty",text:"No sleep logged for this day. Tap Going to sleep tonight, or add it by hand."})])),sleepEdit==="new"?sleepForm(null):null));
    // 3) the week
    const thisWs=weekStart(today);
    const wkhead=el("div",{class:"slp-wkhead"},
      el("button",{class:"mini",type:"button",text:"‹ Prev week",onclick:()=>{sleepWs=addDays(ws,-7);render();}}),
      el("span",{class:"slp-wklbl",text:"Week of "+fmt(ws,{day:"numeric",month:"short"})+" to "+fmt(addDays(ws,6),{day:"numeric",month:"short"})}),
      el("button",{class:"mini",type:"button",text:"Next week ›",onclick:()=>{sleepWs=addDays(ws,7);render();}}),
      ws!==thisWs?el("button",{class:"mini",type:"button",text:"This week",onclick:()=>{sleepWs=thisWs;render();}}):null);
    const delta=(st.avgTotal!=null&&pv.avgTotal!=null)?st.avgTotal-pv.avgTotal:null;
    const tile=(v,lbl,sub,cls)=>el("div",{class:"slp-tile"},el("b",{class:"num"+(cls?" "+cls:""),text:v}),el("span",{class:"hint",text:lbl}),sub?el("span",{class:"hint",text:sub}):null);
    const tiles=el("div",{class:"slp-tiles"},
      tile(st.avgTotal!=null?dur(st.avgTotal):"--","sleep a day, naps included",delta!=null&&Math.abs(delta)>=1?(delta>0?"+":"−")+dur(Math.abs(delta))+" vs last week":(delta!=null?"same as last week":null),st.avgTotal!=null?"tot "+sleepCls(st.avgTotal):""),
      tile(st.avgNight!=null?dur(st.avgNight):"--","average night",st.nights?st.nights+" night"+(st.nights>1?"s":"")+" logged":null),
      tile(st.avgBed!=null?relClock(st.avgBed):"--","average bedtime",null),
      tile(st.avgWake!=null?relClock(st.avgWake):"--","average wake-up",null),
      tile(st.napCount?String(st.napCount):"0","nap"+(st.napCount===1?"":"s")+" this week",st.napMin?dur(st.napMin)+" in total":null));
    const pos=(ms,d)=>Math.max(0,Math.min(100,(ms-atOn(addDays(d,-1),"18:00"))/60000/SLP_DAY*100));
    const chart=el("div",{class:"slp-chart"},...st.rows.map(r=>{
      const total=r.night+r.nap, future=r.d>today;
      return el("div",{class:"slp-crow"+(r.d===sel?" sel":"")+(future?" future":"")},
        el("button",{class:"d",type:"button",title:"Open this day",text:fmt(r.d,{weekday:"short",day:"numeric"}),onclick:()=>{sel=clampDate(r.d);sleepWs=ws;render();}}),
        el("div",{class:"slp-track"},el("span",{class:"ng",style:"left:25%"}),
          ...r.xs.map(x=>el("span",{class:"bn"+(x.kind==="nap"?" nap":""),style:"left:"+pos(x.start,r.d)+"%;width:"+Math.max(0.8,pos(x.end,r.d)-pos(x.start,r.d))+"%",title:(x.kind==="nap"?"Nap ":"Sleep ")+hhmm(x.start)+" to "+hhmm(x.end)+" · "+dur(sleepMin(x))}))),
        el("span",{class:"tot num"+(total?" "+sleepCls(total):""),text:total?dur(total):(future?"":"–")}));
    }));
    const axis=el("div",{class:"slp-axis","aria-hidden":"true"},el("span"),el("div",{class:"ax"},...[["18:00",0],["00:00",25],["06:00",50],["12:00",75],["18:00",100]].map(([l,p])=>el("span",{style:"left:"+p+"%",text:l}))),el("span"));
    const legend=el("div",{class:"slp-legend"},el("span",{},el("i",{style:"background:var(--sleep)"}),"Night sleep"),el("span",{},el("i",{style:"background:color-mix(in oklab,var(--sleep) 45%,var(--track))"}),"Nap"),
      el("span",{},el("i",{style:"background:var(--good)"}),"7 h or more"),el("span",{},el("i",{style:"background:var(--warn)"}),"6 to 7 h"),el("span",{},el("i",{style:"background:var(--bad)"}),"under 6 h"));
    const notes=[];
    if(st.shortest&&st.longest&&st.nights>1)notes.push("Shortest night: "+fmt(st.shortest.d,{weekday:"short"})+" ("+dur(st.shortest.night)+"). Longest: "+fmt(st.longest.d,{weekday:"short"})+" ("+dur(st.longest.night)+").");
    if(st.nights>1){const beds=st.rows.filter(r=>r.night>0).map(r=>(r.bed-atOn(addDays(r.d,-1),"18:00"))/60000);const spread=Math.max(...beds)-Math.min(...beds);notes.push("Bedtime varied by "+dur(spread)+" this week"+(spread<=60?". Nicely steady.":". A steadier bedtime usually means better sleep."));}
    rc(box,ctrl,day,el("div",{class:"sh-sec"},el("span",{class:"label",text:"Week view"}),wkhead,tiles,chart,axis,legend,notes.length?el("span",{class:"hint",text:notes.join(" ")}):null));
  }
  setInterval(()=>{const t=sleepActive();if(!t)return;const txt=clock(Date.now()-t.startedAt);document.querySelectorAll("[data-sclock]").forEach(e=>{e.textContent=txt;});},1000);
  // ---------- sprint waterfall: every task of a sprint on a day timeline. Status is automatic, never set by hand ----------
  let wfSprint=null, wfGroup="day", wfCut=false;
  const WF_ST={done:"Done",doing:"In progress",planned:"Planned",late:"Overdue",cut:"Cut"};
  const WF_HOW={done:"you ticked it",doing:"you started a timer on it",planned:"its day hasn't passed",late:"its day passed and it isn't done",cut:"you cut it"};
  function taskStatus(t,today){if(t.cut)return "cut";if(t.done)return "done";const pr=pRun();if((t.spent||0)>0||(pr&&pr.what==="tasks:"+t.id&&pr.startedAt))return "doing";return t.date<today?"late":"planned";}
  function renderWaterfall(){
    const box=document.getElementById("wfBody");if(!box)return;const pg=box.closest(".page");if(pg&&pg.hidden)return;
    const today=iso(new Date()),cur=sprintFor(sel>today?today:sel),sp=sprints().find(p=>p.n===(wfSprint||cur.n))||cur;
    const days=[];for(let d=sp.start;d<=sp.end;d=addDays(d,1))days.push(d);
    const all=Object.entries(state.tasks).map(([id,t])=>({id,...t})).filter(t=>t.date>=sp.start&&t.date<=sp.end);
    const counts={};all.forEach(t=>{const s=taskStatus(t,today);counts[s]=(counts[s]||0)+1;});
    const ts=all.filter(t=>wfCut||!t.cut).sort(wfGroup==="cat"
      ?(a,b)=>(CAT_NAME[a.cat]||"").localeCompare(CAT_NAME[b.cat]||"")||a.date.localeCompare(b.date)||(a.order||0)-(b.order||0)
      :(a,b)=>a.date.localeCompare(b.date)||(a.order||0)-(b.order||0));
    const ctrls=el("div",{class:"wf-ctrls"},
      el("div",{class:"seg",role:"group","aria-label":"Sprint"},...sprints().map(p=>el("button",{type:"button","aria-pressed":String(p.n===sp.n),text:"Sprint "+p.n,title:p.name,onclick:()=>{wfSprint=p.n;render();}}))),
      el("div",{class:"seg",role:"group","aria-label":"Group tasks"},
        el("button",{type:"button","aria-pressed":String(wfGroup==="day"),text:"By day",onclick:()=>{wfGroup="day";render();}}),
        el("button",{type:"button","aria-pressed":String(wfGroup==="cat"),text:"By category",onclick:()=>{wfGroup="cat";render();}})),
      el("button",{type:"button",class:"mini","aria-pressed":String(wfCut),text:wfCut?"Hide cut tasks":"Show cut tasks",onclick:()=>{wfCut=!wfCut;render();}}));
    const done=counts.done||0,tot=all.filter(t=>!t.cut).length;
    const sum=el("div",{class:"wf-sum"},el("span",{class:"wf-pct num",text:(tot?Math.round(done/tot*100):0)+"%"}),
      el("span",{class:"hint",text:done+" of "+tot+" tasks done · "+sp.name}),
      ...["done","doing","planned","late","cut"].filter(k=>counts[k]).map(k=>el("span",{class:"wf-chip st-"+k,text:WF_ST[k]+" "+counts[k]})));
    const grid=el("div",{class:"wf-grid",style:"--n:"+days.length});
    let r=1;
    grid.append(el("div",{class:"wf-h wf-lbl",style:"grid-row:1;grid-column:1",text:"Task"}),
      ...days.map((d,i)=>el("div",{class:"wf-h"+(d===today?" today":"")+(isFriday(d)?" fri":""),style:"grid-row:1;grid-column:"+(i+2),title:fmt(d)},el("span",{text:fmt(d,{weekday:"short"}).slice(0,2)}),el("b",{class:"num",text:String(parse(d).getDate())}))));
    if(!ts.length){r++;grid.append(el("div",{class:"wf-empty",style:"grid-row:"+r,text:"No tasks planned in this sprint yet. They appear here as soon as you add them to a day."}));}
    let last=null;
    ts.forEach(t=>{
      const st=taskStatus(t,today), g=wfGroup==="cat"?(CAT_NAME[t.cat]||"Other"):fmt(t.date,{weekday:"long",day:"numeric",month:"short"});
      if(g!==last){r++;grid.append(el("div",{class:"wf-grp",style:"grid-row:"+r,text:g}));last=g;}
      r++;
      const a=days.indexOf(t.date); let b=a;
      if(st==="done"&&t.doneAt&&t.doneAt>t.date)b=Math.max(a,days.indexOf(t.doneAt>sp.end?sp.end:t.doneAt));
      if((st==="late"||st==="doing")&&t.date<today)b=Math.max(a,days.indexOf(today>sp.end?sp.end:today));
      grid.append(el("button",{type:"button",class:"wf-lbl wf-task st-"+st,style:"grid-row:"+r+";grid-column:1",title:t.title+" · "+WF_ST[st]+". Open this day.","aria-label":t.title+", "+WF_ST[st]+", "+fmt(t.date,{weekday:"long",day:"numeric",month:"short"})+". Open this day.",onclick:()=>{sel=clampDate(t.date);setPage("today");}},
        el("span",{class:"cat",style:"--c:"+(CAT[t.cat]||"var(--muted)")}),el("span",{class:"wf-t",text:t.title})));
      days.forEach((d,i)=>grid.append(el("div",{class:"wf-cell"+(d===today?" today":"")+(isFriday(d)?" fri":""),style:"grid-row:"+r+";grid-column:"+(i+2)})));
      grid.append(el("div",{class:"wf-bar st-"+st,style:"grid-row:"+r+";grid-column:"+(a+2)+" / "+(b+3),"aria-hidden":"true",
          title:WF_ST[st]+(t.moved?" · moved "+t.moved+" time"+(t.moved>1?"s":""):"")+((t.spent||0)>0?" · "+dur(t.spent)+" tracked":"")+(st==="done"&&t.doneAt&&t.doneAt!==t.date?" · finished "+fmt(t.doneAt,{weekday:"short",day:"numeric"}):"")},
        el("span",{text:st==="done"?"✓":st==="cut"?"✕":st==="doing"?"▶":st==="late"?"!":""}),
        t.moved?el("i",{class:"wf-mv",text:"↷"+t.moved}):null));
    });
    const legend=el("div",{class:"wf-legend"},...["done","doing","planned","late","cut"].map(k=>el("span",{},el("i",{class:"wf-sw st-"+k}),el("b",{text:WF_ST[k]}),": "+WF_HOW[k])),
      el("span",{},el("b",{text:"↷"}),": times a task was moved to another day"));
    rc(box,ctrls,sum,el("div",{class:"wf-scroll"},grid),legend);
  }
  // ---------- sprint game: effort XP, daily quests, weekly challenge, seasons and badges. It rewards effort, not results ----------
  const WLVL=["Recruit","Candidate","Operator","Team Leader","Chief","Master Chief","Commander"];
  const EFFORT_DAY=60, MEDAL={gold:"🥇",silver:"🥈",bronze:"🥉"};
  function focusMin(d){return unionMin(itemsOn(d));}
  function tasksDoneOn(d){return leafTasks().filter(t=>!t.cut&&t.done&&(t.doneAt||t.date)===d).length;}
  function nightOn(d){return sleepsOn(d).filter(x=>x.kind!=="nap").reduce((a,x)=>a+sleepMin(x),0);}
  function wQuests(d){
    const L=log(d), f=focusMin(d);
    if(isFriday(d))return [
      {k:"rest",ico:"🕌",t:"Rest day: Jumuah, family, weekly review",done:f<60,xp:20,hint:"Under 1 hour of work counts as rest honored"},
      {k:"sleep",ico:"🌙",t:"Sleep 7 hours",done:nightOn(d)>=420,xp:10}];
    const deep=itemsOn(d).some(x=>x.kind!=="event"&&x.kind!=="break"&&(x.ref==="deep1"||x.ref==="deep2"||(x.kind==="pomo"&&Number(x.minutes||0)>=25)));
    return [
      {k:"show",ico:"🌅",t:"Report for duty: one focus block",done:deep,xp:20,hint:"Start a 2 h focus block in the focus timer, even for 25 minutes"},
      {k:"focus",ico:"⏱",t:"Focus 3 hours",done:f>=180,xp:30,prog:[Math.round(f),180],unit:"min"},
      {k:"tasks",ico:"✅",t:"Take 3 objectives",done:tasksDoneOn(d)>=3,xp:20,prog:[tasksDoneOn(d),3]},
      {k:"comments",ico:"💬",t:"10 thoughtful comments",done:Number(L.comments||0)>=10,xp:15,prog:[Number(L.comments||0),10]},
      {k:"english",ico:"",t:"English: one baby step",done:engCount(d)>=1,xp:15,hint:"Health page: tap Start on Listen, only 4 minutes"},
      {k:"learn",ico:"📚",t:"Learn 30 minutes",done:learningOn(d)>=0.5,xp:15},
      {k:"sleep",ico:"🌙",t:"Recover: 7 hours of sleep",done:nightOn(d)>=420,xp:10,hint:"Recovery is part of the mission"}];
  }
  function dayXP(d){
    const items=[],add=(t,v)=>{if(v>0)items.push([t,Math.round(v)]);};
    const L=log(d),f=focusMin(d);
    add("Focus "+dur(f),Math.min(72,Math.floor(f/10)));
    const blocks=new Set(itemsOn(d).filter(x=>x.kind!=="event"&&BLOCKS.some(b=>b.id===x.ref)).map(x=>x.ref));
    add("Showed up for "+blocks.size+" block"+(blocks.size>1?"s":""),blocks.size*5);
    const td=tasksDoneOn(d);add(td+" task"+(td>1?"s":"")+" done",td*5);
    const ps=Number(L.posts||0),cm=Number(L.comments||0),ap=Number(L.applications||0);
    add(ps+" post"+(ps>1?"s":"")+" shared",ps*15);
    add(cm+" comment"+(cm>1?"s":""),Math.min(20,cm));
    add(ap+" application"+(ap>1?"s":""),ap*5);
    if(L.gym)add("Gym",10);
    add("English steps",engCount(d)*2);
    const q=wQuests(d),qd=q.filter(x=>x.done);
    qd.forEach(x=>add("Mission: "+x.t,x.xp));
    if(qd.length===q.length)add("All missions complete",30);
    return {items,xp:items.reduce((a,b)=>a+b[1],0),q};
  }
  function wTotals(){
    const today=iso(new Date()),end=today<END?today:END;let xp=0,focus=0,posts=0,comments=0,learn=0,deepDays=0,perfect=0;const per={};
    for(let d=START;d<=end;d=addDays(d,1)){const x=dayXP(d);per[d]=x.xp;xp+=x.xp;focus+=focusMin(d);posts+=Number(log(d).posts||0);comments+=Number(log(d).comments||0);learn+=learningOn(d);
      if(x.q.every(z=>z.done)&&!isFriday(d))perfect++;if(itemsOn(d).some(z=>z.kind!=="event"&&BLOCKS.some(b=>b.id===z.ref)))deepDays++;}
    return {xp,focus,posts,comments,learn,deepDays,perfect,per};
  }
  function wLevel(xp){const per=500,lv=Math.floor(xp/per)+1;return {lv,name:WLVL[Math.min(WLVL.length-1,Math.floor((lv-1)/2))],into:xp%per,per};}
  function showedUp(d){return focusMin(d)>=60||restDay(d);}
  function wStreak(){const today=iso(new Date());let d=today>END?END:today,n=0;if(!showedUp(d))d=addDays(d,-1);while(d>=START){if(isFriday(d)){d=addDays(d,-1);continue;}if(!showedUp(d))break;n++;d=addDays(d,-1);}return n;}
  function wBest(){let best=0,run=0;const today=iso(new Date()),end=today<END?today:END;for(let d=START;d<=end;d=addDays(d,1)){if(isFriday(d))continue;if(showedUp(d)){run++;best=Math.max(best,run);}else if(d!==today)run=0;}return best;}
  function seasonOf(sp,T){
    const today=iso(new Date());let xp=0,eff=0,work=0;
    for(let d=sp.start;d<=sp.end;d=addDays(d,1)){if(!isFriday(d))work++;if(d>today)continue;const v=T.per[d]||0;xp+=v;if(!isFriday(d)&&v>=EFFORT_DAY)eff++;}
    const pct=work?eff/work:0, medal=pct>=.85?"gold":pct>=.7?"silver":pct>=.5?"bronze":null;
    const nx=medal==="gold"?null:medal==="silver"?["gold",.85]:medal==="bronze"?["silver",.7]:["bronze",.5];
    return {xp,eff,work,pct,medal,need:nx?Math.max(0,Math.ceil(nx[1]*work)-eff):0,nextName:nx?nx[0]:null,done:sp.end<today};
  }
  function wBadges(T,best){
    const seasons=sprints().map(sp=>seasonOf(sp,T)), today=iso(new Date());
    let sleepWeek=false;for(let ws=weekStart(START);ws<=weekStart(today)&&!sleepWeek;ws=addDays(ws,7)){let n=0;for(let i=0;i<7;i++)if(nightOn(addDays(ws,i))>=420)n++;if(n>=5)sleepWeek=true;}
    return [["🌅","First deep block",T.deepDays>=1],["🔥","3 days in a row",best>=3],["⚡","7 days in a row",best>=7],["⏱","10 focus hours",T.focus>=600],["🏗","50 focus hours",T.focus>=3000],["🚀","100 focus hours",T.focus>=6000],
      ["✍️","First post shared",T.posts>=1],["💬","100 comments",T.comments>=100],["📚","10 learning hours",T.learn>=10],["🎯","Flawless op",T.perfect>=1],["🌙","5 good nights in a week",sleepWeek],["🏆","Gold sprint",seasons.some(s=>s.medal==="gold"&&s.done)]];
  }
  let gameSeen=null;
  function gameCelebrate(today,T){
    if(!(state.loaded.tasks&&state.loaded.logs&&state.loaded.entries))return;
    const x=dayXP(today),done=x.q.filter(z=>z.done),lv=wLevel(T.xp).lv;
    if(gameSeen&&gameSeen.d===today){
      if(done.length>gameSeen.keys.length){const nq=done.filter(z=>!gameSeen.keys.includes(z.k)),all=done.length===x.q.length;
        setTimeout(()=>toast(all?"All missions complete. +30 XP bonus":"Mission complete: "+(nq[0]?nq[0].t+" · +"+nq[0].xp+" XP":"")),1700);}
      
    }
    gameSeen={d:today,lv,keys:done.map(z=>z.k)};
  }
  function wLevelBar(T,compact){
    const L=wLevel(T.xp),today=iso(new Date()),tx=dayXP(today>END?END:today).xp;
    return el("div",{class:"gm-level"+(compact?" compact":"")},el("span",{class:"gm-lv",text:"Lv "+L.lv}),
      el("div",{class:"gm-lv-mid"},el("span",{class:"gm-lv-name",text:L.name+" · "+T.xp.toLocaleString("en")+" XP"+(compact?" · today +"+tx:"")}),el("div",{class:"track"},el("div",{class:"fill gm-fill",style:"width:"+(L.into/L.per*100)+"%"}))),
      compact?el("button",{type:"button",class:"mini",text:"Missions",onclick:()=>setPage("progress")}):el("span",{class:"hint",text:(L.per-L.into)+" XP to rank "+(L.lv+1)}));
  }
  function renderGame(){
    const box=document.getElementById("gameBody"),mini=document.getElementById("gameMini");if(!box&&!mini)return;
    const today=iso(new Date()),T=wTotals();
    gameCelebrate(today,T);
    if(mini)rc(mini,wLevelBar(T,true));
    if(!box)return;const pg=box.closest(".page");if(pg&&pg.hidden)return;
    const d=sel>today?today:sel, isT=d===today, X=dayXP(d), streakNow=wStreak(), best=Math.max(wBest(),streakNow);
    const dayLbl=fmt(d,{weekday:"short",day:"numeric",month:"short"});
    // effort today
    const tier=X.xp>=100?"Full send":X.xp>=EFFORT_DAY?"Mission day":X.xp>=25?"Showed up":"Not deployed yet";
    const effort=el("div",{class:"gm-card gm-goal"},el("span",{class:"label",text:isT?"Today's drill":"Effort on "+dayLbl}),
      el("div",{class:"gw-hero"},el("b",{class:"num gw-xp",text:"+"+X.xp}),el("div",{class:"gw-side"},el("span",{class:"gw-tier",text:tier}),
        el("span",{class:"hint",text:X.xp>=EFFORT_DAY?"Today counts. The only easy day was yesterday.":(EFFORT_DAY-X.xp)+" XP more and today counts. No easy days."}))),
      el("div",{class:"track"},el("div",{class:"fill gm-fill",style:"width:"+Math.min(100,X.xp/120*100)+"%"}),el("div",{class:"pace",style:"left:calc("+(EFFORT_DAY/120*100)+"% - 1px)",title:"Mission day: "+EFFORT_DAY+" XP"})),
      X.items.length?el("ul",{class:"gw-list"},...X.items.map(([t,v])=>el("li",{},el("span",{text:t}),el("b",{class:"num",text:"+"+v})))):el("p",{class:"hint",text:"Deploy: start a deep block or the focus timer. Every 10 focused minutes = 1 XP."}),
      el("div",{class:"gw-streak"},el("span",{"aria-hidden":"true",text:"🔥"}),el("span",{},el("b",{class:"num",text:String(streakNow)})," day"+(streakNow===1?"":"s")+" without quitting"),
        el("span",{class:"hint",text:"Best "+best+" · 1 focused hour keeps it alive · Fridays never break it"})));
    // quests
    const q=X.q, qn=q.filter(z=>z.done).length;
    const quests=el("div",{class:"gm-card wq"},el("div",{class:"gm-head"},el("h3",{class:"g-h3",text:isT?"Today's missions":"Missions on "+dayLbl}),el("span",{class:"num",text:qn+"/"+q.length})),
      ...q.map(z=>el("div",{class:"gm-q"+(z.done?" done":"")},el("span",{class:"wq-ck","aria-hidden":"true",text:z.done?"✓":""}),
        el("div",{class:"gm-qt"},el("b",{text:z.t}),el("span",{class:"hint",text:"+"+z.xp+" XP"+(z.prog?" · "+Math.min(z.prog[0],z.prog[1])+" / "+z.prog[1]+(z.unit?" "+z.unit:""):"")+(z.hint&&!z.done?" · "+z.hint:"")})),
        z.prog?el("div",{class:"track gm-qbar"},el("div",{class:"fill"+(z.done?" good":""),style:"width:"+Math.min(100,z.prog[0]/z.prog[1]*100)+"%"})):el("span"))),
      qn===q.length?el("p",{class:"gm-all",text:"All missions complete: +30 XP"}):el("p",{class:"hint",text:"Each mission rewards the effort, whatever the result. Never quit."}));
    // weekly challenge
    const ws=weekStart(d);let wf=0,wd=0,wc=0,wsl=0,wxp=0;
    for(let i=0;i<7;i++){const x=addDays(ws,i);if(x>today)continue;const f=focusMin(x);wf+=f;if(!isFriday(x)&&f>=60)wd++;wc+=Number(log(x).comments||0);if(nightOn(x)>=420)wsl++;wxp+=T.per[x]||0;}
    const wq=[["🌅","Show up 5 days",wd,5],["⏱","Focus "+weeklyTarget(d)+" hours",Math.floor(wf/60),weeklyTarget(d)],["💬","60 comments",wc,60],["🌙","5 good nights",wsl,5]];
    const weekly=el("div",{class:"gm-card"},el("div",{class:"gm-head"},el("h3",{class:"g-h3",text:"Weekly mission"}),el("span",{class:"num hint",text:"+"+wxp.toLocaleString("en")+" XP this week"})),
      ...wq.map(([i,t,v,n])=>el("div",{class:"gm-w"},el("span",{"aria-hidden":"true",text:i}),el("span",{text:t}),el("div",{class:"track"},el("div",{class:"fill"+(v>=n?" good":""),style:"width:"+Math.min(100,v/n*100)+"%"})),el("span",{class:"num",text:Math.min(v,n)+"/"+n}))));
    // sprint season
    const sp=sprintFor(d),S=seasonOf(sp,T);
    const season=el("div",{class:"gm-card"},el("div",{class:"gm-head"},el("h3",{class:"g-h3",text:"Sprint "+sp.n+" season"}),el("span",{class:"hint",text:S.done?"Finished":Math.max(0,dayIndex(sp.end)-dayIndex(today))+" days left"})),
      el("div",{class:"gw-season"},
        el("div",{},el("b",{class:"num",text:S.eff+"/"+S.work}),el("span",{class:"hint",text:"mission days ("+EFFORT_DAY+"+ XP)"})),
        el("div",{},el("b",{class:"num",text:S.xp.toLocaleString("en")}),el("span",{class:"hint",text:"XP this sprint"})),
        el("div",{},el("b",{text:S.medal?MEDAL[S.medal]:"–"}),el("span",{class:"hint",text:S.medal?S.medal[0].toUpperCase()+S.medal.slice(1)+" medal":"No medal yet. Earn it."}))),
      el("div",{class:"gw-mtrack"},...[[.5,"🥉"],[.7,"🥈"],[.85,"🥇"]].map(([p,i])=>el("span",{class:"gw-mk",style:"left:"+(p*100)+"%","aria-hidden":"true",text:i})),
        el("div",{class:"track"},el("div",{class:"fill gm-fill",style:"width:"+(S.pct*100)+"%"}))),
      el("span",{class:"hint",text:S.nextName?(S.need?S.need+" more effort day"+(S.need>1?"s":"")+" earns "+S.nextName+".":"On track for "+S.nextName+"."):"Gold. Now protect your rest."}),
      el("div",{class:"gw-allsp"},...sprints().map(p=>{const s=seasonOf(p,T);return el("div",{class:"gw-sp"+(p.n===sp.n?" now":""),title:"Sprint "+p.n+": "+p.name},el("span",{class:"n",text:"S"+p.n}),el("b",{text:s.medal?MEDAL[s.medal]:p.start>today?"🔒":s.done?"·":"…"}));})));
    // badges and rules
    const badges=el("div",{class:"gm-card"},el("h3",{class:"g-h3",text:"Insignia"}),el("div",{class:"gm-badges"},...wBadges(T,best).map(([i,t,on])=>el("div",{class:"gm-badge"+(on?" on":""),"aria-label":t+(on?", earned":", locked")},el("span",{"aria-hidden":"true",text:on?i:"🔒"}),el("span",{text:t})))));
    const how=el("details",{class:"gm-card"},el("summary",{text:"How you earn rank"}),el("ul",{class:"gm-why"},...[
      "Every 10 focused minutes from Time entries = 1 XP, up to 12 hours a day. Overlapping timers count once.",
      "Starting a deep block = +5. Report for duty. Every single day.",
      "Each task done +5, post shared +15, comment +1 (up to 20), application +5, gym +10, each English step +2.",
      "Each mission adds its own XP. Complete all of them for +30.",
      "An effort day is 60+ XP. Effort days earn your sprint medal: 50% bronze, 70% silver, 85% gold.",
      "Friday rest earns XP too. Rest is part of the plan, and the streak never breaks on Fridays."].map(t=>el("li",{text:t}))));
    rc(box,wLevelBar(T,false),el("div",{class:"gw-grid"},effort,quests),weekly,season,badges,how);
  }
  // ---------- daily habits: clear done state, weekly zone, full history, English in baby steps ----------
  const HABITS=[{id:"english",name:"English 20 min",def:[5,6]},{id:"gym",name:"Gym",def:[4,6]}];
  const ENG_STEPS=[
    {id:"listen",ico:"\u{1F3A7}",t:"Listen",min:4,how:"Play one short clip (podcast, TED talk, YouTube) about design, pitching or business. Just listen once, no pausing."},
    {id:"shadow",ico:"\u{1F501}",t:"Shadow it",min:5,how:"Play it again. Pause after each sentence and say it out loud, copying the speed, the stress and the pauses."},
    {id:"phrase",ico:"✍️",t:"Steal one phrase",min:2,how:"Write down one phrase you liked, word for word, in your phrase list. Only one."},
    {id:"speak",ico:"\u{1F399}️",t:"Speak and record",min:6,how:"Record yourself answering today's prompt for 1 to 2 minutes. Use your new phrase once."},
    {id:"review",ico:"\u{1F442}",t:"Listen back, fix one thing",min:3,how:"Play your recording. Pick one fix only: a word, a sound or a pause. Say that sentence again, correctly."}
  ];
  const PROMPTS=["Explain what you do to a startup founder in 60 seconds.","Walk through one slide you designed: the problem, your fix, the result.","A client asks why they should pay you more than a cheaper designer. Answer calmly.","Describe your design process in 4 steps.","Tell a client, kindly, that their deck has too much text.","Summarize the last chapter you read and one idea you will use.","Quote a fee for a 15-slide pitch deck and explain what is included.","Describe your ideal client and the problem you solve for them.","Explain why a good story matters more than nice slides."];
  const ZONES=[[2,3],[3,4],[3,5],[4,6],[5,6],[6,7]];
  let engOpen=null;
  function habitRange(h){const s=state.habits[h.id];return s&&s.min?[Number(s.min),Number(s.max)]:h.def;}
  function engSteps(d){return log(d).englishSteps||{};}
  function engCount(d){const s=engSteps(d);return ENG_STEPS.filter(x=>s[x.id]).length;}
  function inMilestone(d){return d>=START&&d<=END;}
  function weekInfo(h,d){
    const ws=weekStart(d), days=[0,1,2,3,4,5,6].map(i=>addDays(ws,i)), today=iso(new Date());
    const avail=days.filter(inMilestone).length, n=days.filter(x=>inMilestone(x)&&log(x)[h.id]).length;
    const [a,b]=habitRange(h), lo=avail>=7?a:Math.max(1,Math.round(a*avail/7)), hi=avail>=7?b:Math.max(lo,Math.round(b*avail/7));
    const left=days.filter(x=>inMilestone(x)&&x>=today&&!log(x)[h.id]).length;
    const state2=n>hi?"above":n>=lo?"in":"below";
    return {ws,days,n,lo,hi,short:avail<7,left,zone:state2,current:days.includes(today),past:days[6]<today};
  }
  function zoneText(w){
    if(w.zone==="in")return "In your zone this week";
    if(w.zone==="above")return "Above your zone. Rest days are part of the plan too";
    const need=w.lo-w.n;
    if(w.past)return "Below your zone that week";
    return need<=w.left?need+" more day"+(need>1?"s":"")+" to reach your zone":"Zone out of reach this week. Every day still counts";
  }
  function habitTotal(h){let t=0;for(const k in state.logs){if(inMilestone(k)&&state.logs[k][h.id])t++;}return t;}
  function setHabit(d,key,val){
    const L={...log(d),date:d}; L[key]=val;
    if(key==="english")L.englishSteps=val?Object.fromEntries(ENG_STEPS.map(s=>[s.id,true])):{};
    state.logs[d]=L; render(); queueSave(d,300);
    if(val){woo();toast(HABITS.find(x=>x.id===key).name+" done"+(d===iso(new Date())?" today":", "+fmt(d,{weekday:"short",day:"numeric",month:"short"})));}
  }
  function toggleStep(d,id){
    const L={...log(d),date:d}, steps={...(L.englishSteps||{})}; steps[id]=!steps[id];
    const all=ENG_STEPS.every(s=>steps[s.id]), was=!!L.english; L.englishSteps=steps; L.english=all;
    state.logs[d]=L; render(); queueSave(d,300);
    if(all&&!was){woo();toast("All 5 steps done. English complete");}
    else if(steps[id]){const nx=ENG_STEPS.find(s=>!steps[s.id]);toast(nx?"Next: "+nx.t:"Done");}
  }
  function dayDots(h,d,interactive){
    const w=weekInfo(h,d), today=iso(new Date());
    return el("div",{class:"hdots"},...w.days.map((x,i)=>{
      const on=!!log(x)[h.id], c=h.id==="english"&&!on?engCount(x):0, ok=inMilestone(x)&&x<=today;
      const cls="hdot"+(on?" on":c?" part":"")+(x===today?" today":"")+(!inMilestone(x)?" out":"")+(x>today&&inMilestone(x)?" future":"");
      const lbl=fmt(x,{weekday:"long",day:"numeric",month:"short"})+": "+(on?"done":c?c+" of 5 steps":"not done");
      if(!interactive)return el("span",{class:cls,title:lbl,text:"SSMTWTF"[i]});
      const btn=el("button",{type:"button",class:cls,title:lbl+(ok?". Tap to change":""),"aria-label":lbl+(ok?". Tap to change":""),"aria-pressed":String(on),text:"SSMTWTF"[i],onclick:()=>{if(ok)setHabit(x,h.id,!on);}});
      if(!ok)btn.disabled=true; return btn;
    }));
  }
  function engBlock(){
    const st=engSteps(sel), c=engCount(sel), today=iso(new Date()), next=ENG_STEPS.find(s=>!st[s.id]);
    const det=el("details",{class:"esteps"}); det.open=engOpen===null?(c<5&&sel===today):engOpen;
    det.addEventListener("toggle",()=>{engOpen=det.open;});
    const prog=el("span",{class:"eprog","aria-hidden":"true"},...ENG_STEPS.map(s=>el("i",{class:st[s.id]?"on":""})));
    det.append(el("summary",{},el("span",{class:"esum-t",text:"Today's 5 baby steps"}),prog,el("span",{class:"num hint",text:c+"/5"})));
    det.append(el("ol",{class:"elist"},...ENG_STEPS.map((s,i)=>{
      const done=!!st[s.id];
      return el("li",{class:"estep"+(done?" done":"")+(next&&next.id===s.id?" next":"")},
        el("button",{type:"button",class:"ecb","aria-pressed":String(done),"aria-label":"Step "+(i+1)+", "+s.t+(done?": done. Tap to undo":": tap when done"),text:done?"✓":s.ico,onclick:()=>toggleStep(sel,s.id)}),
        el("div",{class:"ebody"},
          el("div",{class:"et"},el("span",{class:"enum num",text:String(i+1)}),el("span",{class:"ett",text:s.t}),el("span",{class:"emin",text:s.min+" min"})),
          el("div",{class:"ehow",text:s.how}),
          !done&&next&&next.id===s.id&&sel===today?el("button",{type:"button",class:"mini estart",text:"▶ Start "+s.min+" min timer","aria-label":"Start a "+s.min+" minute focus timer for "+s.t,onclick:()=>pStartFor({what:"eng:"+s.id,label:"English: "+s.t,minutes:s.min})}):null,
          s.id==="speak"?el("div",{class:"eprompt"},el("b",{text:"Today's prompt: "}),PROMPTS[dayIndex(sel)%PROMPTS.length]):null));
    })));
    return det;
  }
  function renderHabits(){
    const box=document.getElementById("habits"); if(!box)return; const L=log(sel), today=iso(new Date());
    rc(box,...HABITS.map(h=>{
      const done=!!L[h.id], w=weekInfo(h,sel), total=habitTotal(h), isE=h.id==="english", c=isE?engCount(sel):0;
      const when=sel===today?"today":fmt(sel,{weekday:"short",day:"numeric",month:"short"});
      return el("div",{class:"habit"+(done?" done":"")},
        el("div",{class:"hrow"},
          el("button",{type:"button",class:"hchk","aria-pressed":String(done),"aria-label":(done?"Undo ":"Mark done: ")+h.name+", "+when,onclick:()=>setHabit(sel,h.id,!done)}),
          el("div",{class:"hname-wrap"},el("span",{class:"hname",text:h.name}),el("span",{class:"hint",text:done?"Done "+when:isE&&c?c+" of 5 steps "+(sel===today?"so far":"done"):"Not done "+when})),
          el("span",{class:"hcount",title:"Days done since 3 Nov"},el("b",{class:"num",text:String(total)}),el("span",{text:" total"})),
          el("button",{type:"button",class:"mini",text:"History","aria-label":h.name+" history",onclick:e=>openHabit(h.id,e.currentTarget)})),
        el("div",{class:"hweek"},dayDots(h,sel,false),el("span",{class:"hint num",text:w.n+" this week · zone "+w.lo+" to "+w.hi+(w.short?" (short week)":"")})),
        el("span",{class:"hzone "+w.zone,text:zoneText(w)}),
        isE?engBlock():null);
    }));
  }
  function openHabit(id,from){sheet={kind:"habit",id:null,habit:id};sheetReturn=from||null;document.getElementById("sheetBg").hidden=false;document.getElementById("sheet").hidden=false;buildHabitSheet();setTimeout(()=>document.getElementById("shClose").focus(),0);}
  async function setZone(h,z){state.habits={...state.habits,[h.id]:{min:z[0],max:z[1]}};render();toast("Zone set to "+z[0]+" to "+z[1]+" days a week");
    if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return;}try{await store.set("habits/"+h.id,{min:z[0],max:z[1]});}catch(e){fail(e);}}
  function buildHabitSheet(){
    const h=HABITS.find(x=>x.id===sheet.habit); if(!h){closeSheet();return;}
    const body=document.getElementById("shBody"), keep=body.scrollTop, today=iso(new Date()), last=today<END?today:END, [a,b]=habitRange(h), total=habitTotal(h);
    const weeks=[];for(let ws=weekStart(START);ws<=weekStart(last);ws=addDays(ws,7))weeks.push(weekInfo(h,ws));
    const inZone=weeks.filter(w=>w.zone!=="below").length;
    const cur=weekInfo(h,today<=END?today:END);
    document.getElementById("shKind").textContent="Habit history";
    document.getElementById("shTitle").textContent=h.name;
    document.getElementById("shMeta").textContent=total+" day"+(total===1?"":"s")+" since 3 Nov · "+inZone+" of "+weeks.length+" week"+(weeks.length===1?"":"s")+" in your zone";
    const meter=el("div",{class:"hmeter","aria-hidden":"true"},...[1,2,3,4,5,6,7].map(i=>el("i",{class:(i<=cur.n?"hf":"")+(i>=cur.lo&&i<=cur.hi?" hz":"")})));
    const mlbl=el("div",{class:"hmeter-lbl","aria-hidden":"true"},...[1,2,3,4,5,6,7].map(i=>el("span",{text:String(i)})));
    const doneDays=Object.keys(state.logs).filter(k=>inMilestone(k)&&state.logs[k][h.id]).sort().reverse();
    const partDays=h.id==="english"?Object.keys(state.logs).filter(k=>inMilestone(k)&&!state.logs[k].english&&engCount(k)>0).sort().reverse():[];
    rc(body,
      el("div",{class:"hstats"},
        el("div",{class:"hstat"},el("b",{class:"num",text:String(total)}),el("span",{class:"hint",text:"days done in total"})),
        el("div",{class:"hstat"},el("b",{class:"num",text:String(cur.n)}),el("span",{class:"hint",text:"this week (zone "+cur.lo+" to "+cur.hi+(cur.short?", short week":"")+")"})),
        el("div",{class:"hstat"},el("b",{class:"num",text:inZone+"/"+weeks.length}),el("span",{class:"hint",text:"weeks in your zone"}))),
      el("div",{class:"sh-sec"},el("span",{class:"label",text:"Your weekly zone"}),
        el("span",{class:"hint",text:"A range, not a fixed number. Land anywhere inside it and the week counts. On a heavy week the bottom of the zone is enough."}),
        el("div",{class:"seg",role:"group","aria-label":"Weekly zone"},...ZONES.map(z=>el("button",{type:"button","aria-pressed":String(z[0]===a&&z[1]===b),text:z[0]+" to "+z[1],onclick:()=>setZone(h,z)}))),
        meter,mlbl,el("span",{class:"hzone "+cur.zone,text:zoneText(cur)})),
      el("div",{class:"sh-sec"},el("div",{class:"panel-head"},el("span",{class:"label",text:"Week by week"}),el("span",{class:"hint",text:"Tap a day to mark or unmark it"})),
        el("ul",{class:"hweeks"},...weeks.slice().reverse().map(w=>el("li",{class:"hwk"},
          el("span",{class:"d",text:fmt(w.ws<START?START:w.ws,{day:"numeric",month:"short"})}),
          dayDots(h,w.ws,true),
          el("span",{class:"hwk-r"},el("span",{class:"num",text:String(w.n)}),
            el("span",{class:"chip "+(w.current&&w.zone==="below"?"":w.zone==="in"?"good":w.zone==="above"?"accent":"warn"),text:w.current&&w.zone==="below"?"In progress":w.zone==="in"?"In zone":w.zone==="above"?"Above":"Below"})))))),
      el("div",{class:"sh-sec"},el("span",{class:"label",text:"Days you did it"}),
        doneDays.length?el("div",{class:"hlast"},...doneDays.map(k=>el("span",{class:"chip good",text:fmt(k,{weekday:"short",day:"numeric",month:"short"})}))):el("span",{class:"empty",text:"Nothing yet. Tick it on the Day log, or tap a day above."}),
        partDays.length?el("span",{class:"hint",text:"Started but not finished: "+partDays.map(k=>fmt(k,{weekday:"short",day:"numeric",month:"short"})+" ("+engCount(k)+"/5)").join(", ")}):null)
    );
    body.scrollTop=keep;
  }
  function toggleHabit(key){const L={...log(sel)};L[key]=!L[key];L.date=sel;state.logs[sel]=L;render();queueSave(sel,300);}
  let saving=Promise.resolve();
  function saveLog(s){
    if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return;}
    const body={...state.logs[s]};
    saving=saving.then(()=>store.set("logs/"+s,body)).then(()=>{if(JSON.stringify(state.logs[s])===JSON.stringify(body))dirty.delete(s);}).catch(fail);
  }
  function fail(e){const code=e&&e.code;showNotice(code==="quota_exceeded"?"Storage is full. Ask Claude to archive old days.":"That change didn't save. Check your connection and try again.");}
  function showNotice(msg){const n=document.getElementById("notice");n.textContent=msg;n.hidden=!msg;}

  // ---------- render ----------
  function render(){
    if(window.__sbDragging||window.__sbEditing||window.__sbSwiping)return;
    const sp=sprintFor(sel), idx=dayIndex(sel);
    document.getElementById("dayNum").textContent=String(idx);
    document.getElementById("dateLabel").textContent=fmt(sel);
    const sprintDaysLeft=Math.max(0,dayIndex(sp.end)-idx);
    const head=document.getElementById("headChips");rc(head,
      el("span",{title:sp.name,text:"Sprint "+sp.n}),
      el("span",{text:sprintDaysLeft===0?"Sprint review day":sprintDaysLeft+" days left"}),
      ...(sel!==iso(new Date())?[el("span",{class:"dsub-warn",text:"Not today"})]:[]));
    document.getElementById("todayBtn").hidden=sel===iso(new Date());
    document.getElementById("prevDay").disabled=sel<=START;document.getElementById("nextDay").disabled=sel>=END;
    document.getElementById("dayType").textContent=isFriday(sel)?"Friday: off, weekly review only":"Working day";

    // tasks
    const list=document.getElementById("taskList"), ts=tasksOn(sel);
    renderDayBlocks(list,ts);
    const done=ts.filter(t=>t.done).length;document.getElementById("taskCount").textContent=ts.length?done+" of "+ts.length+" done":"";

    // carry-over: unfinished tasks from earlier days, only when viewing today or later
    const carry=Object.entries(state.tasks).map(([id,t])=>({id,...t})).filter(t=>isLeaf(t)&&t.date<sel&&!t.done&&!t.cut).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:(a.order||0)-(b.order||0));
    const cb=document.getElementById("carryBox"),cl=document.getElementById("carryList");cb.hidden=!carry.length;rc(cl,...carry.map(t=>taskRow(t,true)));

    // counters
    const L=log(sel), wk=weekStart(sel), wkEnd=addDays(wk,6);
    const weekHours=sumLogs(wk,wkEnd,"hours");
    const ctrs=[
      ["hours","Hours worked",0.5,"From time entries"+(hoursAdj(sel)?(hoursAdj(sel)>0?" + ":" − ")+fmtNum(Math.abs(hoursAdj(sel)))+" h by hand":"")+". The dark line shows where you should be by today."],
      ["learning","Learning hours",0.5,"From time entries"+(learningAdj(sel)?" + "+fmtNum(learningAdj(sel))+" h earlier":"")+", part of hours worked."],
      ["posts","LinkedIn posts",1,"Sprint total "+sumLogs(START,sel,"posts")+" / "+sp.posts+" · Bank: "+Math.max(0,bankN())+" ready"],
      ["drafts","LinkedIn drafts",1,"Bank: "+Math.max(0,bankN())+" ready"],
      ["comments","Comments on target clients' posts",1,"Sprint total "+sumLogs(START,sel,"comments")+" / "+sp.comments],
      ["applications","Applications",1,"Sprint total "+sumLogs(START,sel,"applications")+" / "+sp.applications]
    ];
    document.getElementById("counters").replaceChildren(...ctrs.map(([k,name,step,hint])=>el("div",{class:"ctr"},
      el("div",{class:"label",style:"display:flex;align-items:center;gap:6px"},name,info(CTR_INFO[k])),
      el("div",{class:"row"},(k==="hours"||k==="learning")?el("span",{class:"val",text:fmtNum(k==="hours"?hoursOn(sel):learningOn(sel))}):inl(el("span",{class:"val",text:fmtNum(L[k]||0)}),{value:L[k]||0,label:name,type:"number",min:0,step:1,onSave:v=>setLogValue(k,v)}),
        (k==="hours"||k==="learning")?el("div",{class:"step"},el("button",{class:"addtime","aria-label":"Add "+(k==="learning"?"learning":"work")+" time with start and end",onclick:()=>openTimeDlg({mode:"new",learning:k==="learning",title:k==="learning"?"Add learning time":"Add work time",sub:"When did you do it?"}),text:"+ Add time"}))
        :el("div",{class:"step"},
          el("button",{"aria-label":"Remove "+step+" "+name,onclick:()=>k==="posts"?bumpPosts(-1):bumpLog(k,-step),text:"\u2212"}),
          el("button",{"aria-label":"Add "+step+" "+name,onclick:()=>{if(k!=="posts")return bumpLog(k,step);if(sel===iso(new Date()))bumpPosts(1,Date.now());else openTimeDlg({mode:"point",title:"LinkedIn post",sub:"so it lands in Time entries",onPoint:at=>bumpPosts(1,at)});},text:"+"}))),
      (k==="hours"||k==="learning")?(()=>{const done=k==="hours"?weekHours:sumLogs(wk,wkEnd,"learning"),goal=k==="hours"?weeklyTarget(sel):10,pct=Math.min(100,done/goal*100),
        days=Math.min(6,Math.max(1,Math.round((parse(sel)-parse(wk))/864e5)+1)),pace=Math.min(100,days/6*100),ok=done>=goal*days/6;
        return el("div",{class:"wkbar",title:"This week: "+fmtNum(done)+" of "+goal+" h"},el("div",{class:"track"},el("div",{class:"fill"+(ok?" good":""),style:"width:"+pct+"%"}),el("div",{class:"pace",style:"left:calc("+pace+"% - 1px)"})),
          el("div",{class:"wkbar-l"},el("span",{class:"num",text:fmtNum(done)+" / "+goal+" h this week"}),el("span",{text:Math.round(pct)+"%"})));})():null,
      el("div",{class:"hint",text:hint}))));
    renderHabits();
    renderRefl();
    document.getElementById("streak").textContent=streak();
    document.getElementById("dayVerdict").textContent=restDay(sel)?"Logged as "+DSTATE_NAME[log(sel).dayState].toLowerCase()+". It counts for your streak.":dayKept(sel)?"This day counts. Well done.":"A day counts when you log 1+ hour and either 1 post, 10 comments, or every task done.";

    {const sp=spViewOf(sprintFor(sel));
    // sprint bars: cumulative vs this sprint's target, with a pace marker
    const prev=sprints().find(p=>p.n===sp.n-1)||{posts:0,comments:0,applications:0};
    const total=dayIndex(sp.end)-dayIndex(sp.start)+1, gone=Math.max(0,Math.min(total,idx-dayIndex(sp.start)+1)), frac=gone/total;
    const sTasks=spTasks(sp), sDone=sTasks.filter(t=>t.done).length;
    {const g=document.getElementById("sprintGoal");const ng=inl(el("span",{text:sp.goal||""}),{value:sp.goal||"",label:"sprint "+sp.n+" goal",empty:"Add a goal for this sprint",onSave:v=>patchSprint(sp.n,{goal:v})});rc(g,ng);}
    const bars=[
      ["Tasks done",sDone,sTasks.length||0,0],
      ["LinkedIn posts",sumLogs(START,spEnd(sp,sel),"posts"),sp.posts,prev.posts],
      ["Comments on target posts",sumLogs(START,spEnd(sp,sel),"comments"),sp.comments,prev.comments],
      ["Applications",sumLogs(START,spEnd(sp,sel),"applications"),sp.applications,prev.applications],
      ["Hours this week",weekHours,weeklyTarget(sel),0]
    ];
    document.getElementById("bars").replaceChildren(...bars.map(([name,val,target,from])=>{
      const pct=target?Math.min(100,val/target*100):0, expected=name==="Tasks done"||name==="Hours this week"?null:from+(target-from)*frac;
      const ok=expected==null?val>=target:val>=expected;
      const t=el("div",{class:"track"},el("div",{class:"fill"+(ok?" good":""),style:"width:"+pct+"%"}));
      if(expected!=null&&target)t.append(el("div",{class:"pace",style:"left:calc("+Math.min(100,expected/target*100)+"% - 1px)",title:"Where you should be today"}));
      const tkey={"LinkedIn posts":"posts","Comments on target posts":"comments","Applications":"applications"}[name];
      const num=tkey?el("span",{class:"num"},fmtNum(val)+" / ",inl(el("span",{text:String(target)}),{value:target,label:"sprint "+sp.n+" target for "+name,type:"number",min:0,step:1,onSave:v=>patchSprint(sp.n,{[tkey]:Math.max(0,Math.round(v))})})):el("span",{class:"num",text:fmtNum(val)+" / "+target});
      return el("div",{class:"bar"},el("div",{class:"row"},el("span",{class:"label",text:name}),num),t,
        expected!=null?el("span",{class:"hint",text:ok?"On pace":"Pace today: "+Math.ceil(expected)}):null);
    }));spChips(sp);}

    // learning
    const ls=Object.entries(state.learning).map(([id,p])=>({id,...p})).sort((a,b)=>(a.order||0)-(b.order||0));
    const lPlan=ls.reduce((a,b)=>a+Number(b.hours||0),0), lDoneH=ls.filter(x=>x.status==="done").reduce((a,b)=>a+Number(b.hours||0),0);
    const lLogged=sumLogs(START,sel,"learning");
    document.getElementById("learnSum").textContent=ls.length?ls.filter(x=>x.status==="done").length+" of "+ls.length+" done \u00b7 "+fmtNum(lLogged)+" h logged of about "+lPlan+" h planned":"";
    document.getElementById("learnFill").style.width=(lPlan?Math.min(100,lDoneH/lPlan*100):0)+"%";
    document.getElementById("learning").replaceChildren(...(ls.length?ls.map(p=>el("button",{class:"proj","data-id":p.id,onclick:e=>openSheet("learning",p.id,e.currentTarget),"aria-label":p.name+": "+LSTATUS_NAME[p.status||"todo"]+". Open details."},
      el("span",{class:"chip "+(p.status==="done"?"good":p.status==="doing"?"warn":""),text:LSTATUS_NAME[p.status||"todo"]}),
      el("span",{class:"name lname"},el("span",{class:"lico",role:"img",title:LTYPE_NAME[ltype(p)],"aria-label":LTYPE_NAME[ltype(p)],text:LTYPE_ICO[ltype(p)]}),el("span",{text:p.name})),
      el("span",{class:"type",text:(p.when||"")+(p.hours?" \u00b7 about "+p.hours+" h":"")+(p.track?" \u00b7 "+p.track:"")}),
      p.output?el("span",{class:"type",text:"Output: "+p.output}):null,cardMeta(p,true))):[el("div",{class:"empty",text:state.loaded.learning?"No learning items yet.":"Loading learning..."})]));

    // inquiries
    const iq=Object.entries(state.inquiries).map(([id,x])=>({id,...x})).sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.order||0)-(a.order||0));
    const bySrc={};iq.forEach(x=>{bySrc[x.source||"Other"]=(bySrc[x.source||"Other"]||0)+1;});
    document.getElementById("inqSum").textContent=iq.length?iq.length+" total \u00b7 "+Object.entries(bySrc).map(([k,v])=>k+" "+v).join(" \u00b7 ")+" \u00b7 won "+iq.filter(x=>x.status==="won").length:"";
    document.getElementById("inquiries").replaceChildren(...(iq.length?iq.map(x=>el("li",{},el("button",{class:"inq",onclick:e=>openSheet("inquiries",x.id,e.currentTarget),"aria-label":"Inquiry from "+x.name+", "+ISTATUS_NAME[x.status||"new"]+". Open details."},
      el("span",{class:"d",text:x.date?fmt(x.date,{day:"numeric",month:"short"}):""}),
      el("span",{style:"min-width:0;display:flex;flex-direction:column;gap:2px"},el("span",{class:"who",text:x.name}),el("span",{class:"ask",text:(x.source||"")+(x.asked?" \u00b7 "+x.asked:"")})),
      el("span",{class:"chip "+(x.status==="won"?"good":x.status==="lost"?"bad":x.status==="new"?"accent":"warn"),text:ISTATUS_NAME[x.status||"new"]})))):
      [el("li",{class:"empty",text:state.loaded.inquiries?"No inquiries yet. When someone contacts you, tap + and log who, where they found you, and what they asked.":"Loading inquiries..."})]));

    // projects
    const allP=Object.entries(state.projects).map(([id,p])=>({id,...p})).sort((a,b)=>(a.order||0)-(b.order||0));
    const ps=allP.filter(p=>p.group!=="client"), cs=allP.filter(p=>p.group==="client");
    const dates=p=>[p.start?"start "+fmt(p.start,{day:"numeric",month:"short"}):"",p.due?"due "+fmt(p.due,{day:"numeric",month:"short"}):""].filter(Boolean).join(" \u00b7 ");
    const pcard=p=>{const names=p.group==="client"?CSTATUS_NAME:STATUS_NAME;return el("button",{class:"proj","data-id":p.id,onclick:e=>openSheet("projects",p.id,e.currentTarget),"aria-label":p.name+": "+names[p.status||"todo"]+". Open details."},
      el("span",{class:"chip "+(p.status==="live"?"good":p.status==="doing"?"warn":""),text:names[p.status||"todo"]}),
      el("span",{class:"name",text:p.name}),
      p.group==="client"&&p.client?el("span",{class:"type",text:p.client}):null,
      el("span",{class:"type",text:[p.type||"",dates(p)].filter(Boolean).join(" \u00b7 ")}),
      p.group==="client"&&(p.fee||p.paid)?el("span",{class:"meta2"},p.fee?el("span",{text:p.fee}):null,el("span",{text:p.paid?"paid":"not paid yet"})):null,
      cardMeta(p,false));};
    document.getElementById("projects").replaceChildren(...(ps.length?ps.map(pcard):[el("div",{class:"empty",text:state.loaded.projects?"No portfolio projects yet. Tap + to add one.":"Loading projects..."})]));
    document.getElementById("clients").replaceChildren(...(cs.length?cs.map(pcard):[el("div",{class:"empty",text:state.loaded.projects?"No client projects yet. When a client lands, tap + to add it here.":"Loading..."})]));
    document.getElementById("clientSum").textContent=cs.length?cs.length+" project"+(cs.length>1?"s":"")+" \u00b7 "+cs.filter(c=>c.status==="live").length+" delivered \u00b7 "+cs.filter(c=>c.paid).length+" paid":"";

    // timeline
    document.getElementById("timeline").replaceChildren(...sprints().map(p=>el("div",{class:"spr"+(p.n===sp.n?" now":sel>p.end?" past":"")},
      el("span",{class:"n",text:"Sprint "+p.n}),inl(el("span",{class:"name",text:p.name}),{value:p.name,label:"sprint "+p.n+" name",onSave:v=>patchSprint(p.n,{name:v})}),
      el("span",{class:"d",text:fmt(p.start,{day:"numeric",month:"short"})+" to "+fmt(p.end,{day:"numeric",month:"short"})}))));
    renderHeat();
    renderRunbar();
    renderEntries();
    renderSleep();
    renderGuard();
    renderReminders();
    renderPomo();
    renderGym();
    renderBWHealth();
    renderGame();
    renderWaterfall();try{renderWins();renderInsights();renderVision();renderSounds();renderInspo();renderPrayer();renderSalah();renderSounds2();renderDrive();renderBrain();renderBrQuick();renderFellow();}catch(e){}
    if(sheet&&sheet.kind==="habit")buildHabitSheet();else if(sheet&&sheet.id)refreshSheet();
  }
  // ---------- heatmap ----------
  let hm="hours";
  const HM={hours:{label:"Hours",steps:[0.5,3,6,9],unit:"h"},posts:{label:"Posts",steps:[1,2,3,4],unit:""},comments:{label:"Comments",steps:[1,5,10,15],unit:""},learning:{label:"Learning",steps:[0.5,1,2,3],unit:"h"}};
  function level(v,steps){if(!v)return 0;let l=1;for(let i=1;i<steps.length;i++)if(v>=steps[i])l=i+1;return Math.min(4,l);}
  function renderHeat(){
    const grid=document.getElementById("heat"), today=iso(new Date()), cfg=HM[hm];
    const first=weekStart(START); let last=END; while(parse(last).getDay()!==5)last=addDays(last,1);
    const cols=Math.round((parse(last)-parse(first))/864e5+1)/7; grid.style.setProperty("--cols",cols);
    const kids=[el("span")];
    let lastMonth="";
    for(let c=0;c<cols;c++){const d=addDays(first,c*7+3);const m=fmt(d<START?START:d,{month:"short"});kids.push(el("span",{class:"mo",text:m!==lastMonth?m:""}));lastMonth=m;}
    const WD=["Sat","Sun","Mon","Tue","Wed","Thu","Fri"];
    for(let r=0;r<7;r++){
      kids.push(el("span",{class:"wd",text:WD[r]}));
      for(let c=0;c<cols;c++){
        const d=addDays(first,c*7+r); const L=log(d); const v=hm==="hours"?hoursOn(d):hm==="learning"?learningOn(d):Number(L[hm]||0);
        let cls="cell";
        if(d<START||d>END)cls+=" out"; else if(d>today)cls+=" future"; else if(isFriday(d)&&!v)cls+=" off";
        if(d===sel)cls+=" sel"; if(d>=START&&d<=END&&d<=today&&dayKept(d))cls+=" kept";
        const b=el("button",{class:cls,"data-l":String(d>today?0:level(v,cfg.steps)),"aria-label":fmt(d)+": "+fmtNum(v)+" "+cfg.label.toLowerCase()+(dayKept(d)?", day counted":"")});
        if(d<START||d>END){b.tabIndex=-1;}
        else{
          b.addEventListener("click",()=>{sel=d;render();});
          b.addEventListener("mouseenter",e=>showTip(d,e.currentTarget));b.addEventListener("focus",e=>showTip(d,e.currentTarget));
          b.addEventListener("mouseleave",hideTip);b.addEventListener("blur",hideTip);
        }
        kids.push(b);
      }
    }
    rc(grid,...kids);
    // place children: first row month labels, then rows; grid auto-flow row works since we pushed row by row
    const lg=document.getElementById("heatLegend"), st=cfg.steps;
    const ranges=["0",st[0]+(cfg.unit)+"+",st[1]+cfg.unit+"+",st[2]+cfg.unit+"+",st[3]+cfg.unit+"+"];
    rc(lg,
      el("span",{text:cfg.label+":"}),
      ...[0,1,2,3,4].map(l=>el("span",{class:"sw"},el("i",{class:"cell","data-l":String(l),style:"width:12px;height:12px;border-radius:3px"}),ranges[l])),
      el("span",{class:"sw"},el("i",{class:"cell off",style:"width:12px;height:12px;border-radius:3px"}),"Friday off"),
      el("span",{class:"sw"},el("i",{class:"cell kept",style:"width:12px;height:12px;border-radius:3px;background:var(--track)"}),"Day counted"));
    let logged=0,kept=0,hours=0,end=today<END?today:END;
    for(let d=START;d<=end;d=addDays(d,1)){const L=log(d);if(Object.keys(L).some(k=>k!=="date"&&L[k]))logged++;if(dayKept(d))kept++;hours+=hoursOn(d);}
    document.getElementById("heatSum").replaceChildren(
      el("span",{},"Days logged ",el("b",{text:String(logged)})),el("span",{},"Days counted ",el("b",{text:String(kept)})),el("span",{},"Total hours ",el("b",{text:fmtNum(hours)})),el("span",{text:"Tap a day to open it"}));
  }
  function showTip(d,target){
    const L=log(d), ts=tasksOn(d), t=document.getElementById("tip");
    rc(t,el("b",{text:fmt(d,{weekday:"short",day:"numeric",month:"short"})}),
      el("div",{text:fmtNum(hoursOn(d))+" h \u00b7 "+(L.posts||0)+" posts \u00b7 "+(L.comments||0)+" comments"}),
      el("div",{text:fmtNum(learningOn(d))+" h learning \u00b7 "+(L.applications||0)+" applications \u00b7 "+inquiriesOn(d)+" inquiries"}),
      el("div",{text:ts.length?ts.filter(x=>x.done).length+" of "+ts.length+" tasks done":(isFriday(d)?"Friday: off":"No tasks")}),
      dayKept(d)?el("div",{text:"Day counted"}):null);
    const r=target.getBoundingClientRect(); t.classList.add("show");
    const w=t.offsetWidth,h=t.offsetHeight; let x=r.left+r.width/2-w/2, y=r.top-h-8;
    x=Math.max(8,Math.min(window.innerWidth-w-8,x)); if(y<8)y=r.bottom+8;
    t.style.left=x+"px"; t.style.top=y+"px";
  }
  function hideTip(){document.getElementById("tip").classList.remove("show");}
  function setHm(k){hm=k;for(const [id,key] of [["hmHours","hours"],["hmPosts","posts"],["hmComments","comments"],["hmLearning","learning"]])document.getElementById(id).setAttribute("aria-pressed",String(key===k));renderHeat();}
  document.getElementById("hmHours").onclick=()=>setHm("hours");
  document.getElementById("hmPosts").onclick=()=>setHm("posts");
  document.getElementById("hmComments").onclick=()=>setHm("comments");
  document.getElementById("hmLearning").onclick=()=>setHm("learning");

  // ---------- learning item types ----------
  const LTYPES=["book","course","video","other"], LTYPE_ICO={book:"\u{1F4D6}",course:"\u{1F3AC}",video:"\u{1F3AC}",other:"\u{1F4DD}"}, LTYPE_NAME={book:"Book",course:"Course",video:"Video",other:"Other"};
  function ltype(p){if(p&&LTYPES.includes(p.type))return p.type;const n=String(p&&p.name||"");return /course|module|for everyone|prompting|engineering|yanfaa|tutorial|class|lesson/i.test(n)?"course":/video|youtube|talk|webinar/i.test(n)?"video":"book";}
  // ---------- collapse any section (remembered on this device) ----------
  (function(){
    let saved={};try{saved=JSON.parse(localStorage.getItem("sb-collapsed")||"{}")||{};}catch(e){}
    const persist=()=>{try{localStorage.setItem("sb-collapsed",JSON.stringify(saved));}catch(e){}};
    document.querySelectorAll(".wrap section").forEach((sec,i)=>{
      const head=sec.querySelector(":scope > .panel-head, :scope > .heat-top, :scope > h2"); if(!head)return;
      const h=sec.querySelector("h2"); const key=(h&&h.id)||("sec"+i);
      const btn=el("button",{type:"button",class:"collapse-btn","aria-expanded":"true","aria-label":"Minimize "+(h?h.textContent.trim():"section"),title:"Minimize"});
      const set=c=>{sec.classList.toggle("collapsed",c);btn.setAttribute("aria-expanded",String(!c));btn.title=c?"Expand":"Minimize";btn.setAttribute("aria-label",(c?"Expand ":"Minimize ")+(h?h.textContent.trim():"section"));};
      btn.onclick=e=>{e.stopPropagation();const c=!sec.classList.contains("collapsed");set(c);if(c)saved[key]=1;else delete saved[key];persist();};
      head.classList.add("has-collapse"); head.append(btn); set(!!saved[key]);
    });
  })();
  // ---------- accessibility helpers ----------
  document.documentElement.lang="en";
  function say(msg){const r=document.getElementById("srLive");if(!r)return;r.textContent="";setTimeout(()=>{r.textContent=msg;},30);}
  // Each info icon gets a specific name and a hidden description screen readers can read.
  (function(){
    let n=0;
    function labelFor(b){
      const own=e=>[...e.childNodes].filter(x=>x.nodeType===3).map(x=>x.textContent).join("").trim();
      const ctr=b.closest(".ctr"); if(ctr){const l=ctr.querySelector(".label");if(l&&own(l))return own(l);}
      const lbl=b.closest(".label"); if(lbl&&own(lbl))return own(lbl);
      const hd=b.closest(".panel-head,.heat-top,header,.counter"); if(hd&&hd.classList.contains("counter"))return "the day counter";
      const sec=b.closest("section,header,details"); const h=sec&&sec.querySelector("h2,h3,summary"); if(h&&own(h))return own(h);
      if(b.previousElementSibling&&own(b.previousElementSibling))return own(b.previousElementSibling);
      return "this";
    }
    function fix(){document.querySelectorAll("button.info").forEach(b=>{
      const txt=b.getAttribute("data-info")||""; if(b.dataset.a11y===txt)return; b.dataset.a11y=txt;
      let d=b.nextElementSibling&&b.nextElementSibling.classList.contains("sr-desc")?b.nextElementSibling:null;
      if(!d){d=el("span",{class:"sr-only sr-desc",id:"infod"+(++n)});b.after(d);}
      d.textContent=txt; b.setAttribute("aria-describedby",d.id); b.setAttribute("aria-label","About "+labelFor(b));
    });}
    new MutationObserver(()=>fix()).observe(document.body,{childList:true,subtree:true}); fix();
  })();
  // Keep keyboard focus inside an open dialog, and give it back to the opener when it closes.
  (function(){
    const DLG=["tdDlg","remDlg","uiDlg","bwDlg","pomoFull","sheet"];
    const openDlg=()=>DLG.map(id=>document.getElementById(id)).find(d=>d&&!d.hidden);
    const focusables=d=>[...d.querySelectorAll('button,input,select,textarea,a[href],summary,[tabindex]:not([tabindex="-1"])')].filter(e=>!e.disabled&&e.offsetParent!==null);
    document.addEventListener("keydown",e=>{if(e.key!=="Tab")return;const d=openDlg();if(!d)return;const f=focusables(d);if(!f.length)return;
      const first=f[0],last=f[f.length-1];
      if(!d.contains(document.activeElement)){e.preventDefault();first.focus();return;}
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
    const opener={};
    ["tdDlg","remDlg","uiDlg","bwDlg"].forEach(id=>{const d=document.getElementById(id);
      new MutationObserver(()=>{if(!d.hidden){opener[id]=document.activeElement;}else if(opener[id]){const o=opener[id];opener[id]=null;if(document.body.contains(o))setTimeout(()=>o.focus(),0);}}).observe(d,{attributes:true,attributeFilter:["hidden"]});});
  })();
  // Reorder without dragging: Alt + Arrow keys on a focused task or card.
  let moveFor=null;
  // reorder inside the task's own block
  function moveTask(id,dir){
    const all=tasksOn(sel),t=all.find(x=>x.id===id);if(!t)return false;const b=taskBlock(t);
    const ordered=[...DAY_BLOCKS,{n:5}].flatMap(B=>all.filter(x=>taskBlock(x)===B.n)).map(x=>x.id);
    const grp=all.filter(x=>taskBlock(x)===b).map(x=>x.id),i=grp.indexOf(id),j=i+dir; if(i<0||j<0||j>=grp.length){say(dir<0?"Already at the top":"Already at the bottom");return false;}
    const p=ordered.indexOf(grp[i]),q=ordered.indexOf(grp[j]);[ordered[p],ordered[q]]=[ordered[q],ordered[p]];
    saveOrder("tasks",ordered); say((dir<0?"Moved up":"Moved down")+", position "+(j+1)+" of "+grp.length+" in block "+b); return true;
  }
  function refocus(sel2){setTimeout(()=>{const e=document.querySelector(sel2);if(e)e.focus();},60);}
  document.addEventListener("keydown",e=>{
    if(!e.altKey||!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key))return;
    const dir=(e.key==="ArrowUp"||e.key==="ArrowLeft")?-1:1, a=document.activeElement;
    const li=a&&a.closest&&a.closest("li.task[data-id]");
    if(li){e.preventDefault();const id=li.dataset.id;if(moveTask(id,dir))refocus('li.task[data-id="'+id+'"] .tmove-btn');return;}
    const card=a&&a.closest&&a.closest(".proj[data-id]");
    if(card){e.preventDefault();const box=card.parentElement,id=card.dataset.id,col=box.dataset.col,grp=box.id==="clients"?"client":box.id==="projects"?"portfolio":null;
      moveItem(col,id,dir,grp);refocus('#'+box.id+' .proj[data-id="'+id+'"]');}
  });
  // ---------- detail sheet ----------
  const KIND={learning:{label:"Learning",statuses:LSTATUS,names:LSTATUS_NAME},projects:{label:"Project",statuses:STATUS,names:STATUS_NAME},inquiries:{label:"Inquiry",statuses:ISTATUS,names:ISTATUS_NAME}};
  let sheet=null, sheetReturn=null, notesTimer=null, notesDirty=false;
  const AUTO_NOTE=/\((countdown|timer|focus timer|session added)\)$/;
  function estList(p){return (Array.isArray(p.hourLog)?p.hourLog:[]).filter(x=>!AUTO_NOTE.test(x.note||""));}
  function projKey(pid){const n=String((state.projects[pid]||{}).name||"").trim().split(/\s+/)[0]||"";return n.length>=3?n.toLowerCase():"";}
  // which project a time entry belongs to: its own link, a project to-do timer, or a board task whose title starts with the project's first word
  function entryProject(x){
    if(!x||x.kind==="event"||x.kind==="break"||isEstimate(x))return null;
    if(x.project&&state.projects[x.project])return x.project;
    const ref=String(x.ref||"");
    if(state.projects[ref])return ref;
    let m=ref.match(/^todo:projects:([^:]+)/);if(m&&state.projects[m[1]])return m[1];
    const tid=ref.startsWith("tasks:")?ref.slice(6):null,t=tid&&state.tasks[tid];
    if(t&&t.project&&state.projects[t.project])return t.project;
    const title=String((t&&t.title)||x.label||"").toLowerCase().trim();
    if(!title)return null;
    for(const pid in state.projects){const k=projKey(pid);if(k&&(title===k||title.startsWith(k+" ")||title.startsWith(k+":")))return pid;}
    return null;
  }
  function projActivity(pid){const out=[];
    Object.keys(state.entries).sort().forEach(d=>{itemsOn(d).forEach(x=>{if(entryProject(x)!==pid)return;const ss=sessionsOf(x);
      if(ss.length)ss.forEach(se=>out.push({date:d,start:se.start,end:se.end,min:Number(se.minutes||0),label:x.label,kind:x.kind,live:!!x.live}));
      else out.push({date:d,start:null,end:null,min:Number(x.minutes||0),label:x.label,kind:x.kind});});});
    return out;}
  function cardMeta(p,isLearning){
    const t=Array.isArray(p.todos)?p.todos:[]; const bits=[];
    if(t.length)bits.push(t.filter(x=>x.done).length+"/"+t.length+" to-dos");
    if(isLearning&&p.rating)bits.push("\u2605".repeat(p.rating));
    if(!isLearning){const pid=Object.keys(state.projects).find(k=>state.projects[k]===p);if(pid){const tr=projActivity(pid).reduce((a,b)=>a+b.min,0);if(tr>=1)bits.push(dur(tr)+" tracked");}}
    if(p.notes)bits.push("notes");
    return bits.length?el("span",{class:"meta2"},...bits.map(b=>el("span",{text:b}))):null;
  }
  function item(){return sheet&&sheet.id?state[sheet.kind][sheet.id]:null;}
  async function saveItem(patch){
    const k=sheet.kind,id=sheet.id; state[k][id]={...state[k][id],...patch}; render();
    if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return;}
    try{await store.update(k+"/"+id,patch);}catch(e){fail(e);}
  }
  function openSheet(kind,id,from){
    sheet={kind,id}; sheetReturn=from||null; notesDirty=false;
    document.getElementById("sheetBg").hidden=false; document.getElementById("sheet").hidden=false;
    buildSheet(); setTimeout(()=>document.getElementById("shClose").focus(),0);
  }
  function closeSheet(){
    if(notesTimer){clearTimeout(notesTimer);flushNotes();}
    sheet=null; document.getElementById("sheetBg").hidden=true; document.getElementById("sheet").hidden=true;
    if(sheetReturn&&document.body.contains(sheetReturn))sheetReturn.focus();
  }
  function flushNotes(){notesTimer=null;const ta=document.getElementById("shNotes");if(!ta||!sheet)return;saveItem({notes:ta.value}).then(()=>{notesDirty=false;const s=document.getElementById("shSaved");if(s)s.textContent="Saved";});}
  function buildSheet(){
    const body=document.getElementById("shBody");
    if(!sheet.id&&sheet.kind==="inquiries"){
      document.getElementById("shKind").textContent="New inquiry";
      document.getElementById("shTitle").textContent="Someone reached out";
      document.getElementById("shMeta").textContent="Log it now, so you learn which content brings clients.";
      const date=el("input",{type:"text",id:"niDate",value:sel,placeholder:"YYYY-MM-DD"});
      const name=el("input",{type:"text",id:"niName",placeholder:"Name and company"});
      const source=el("select",{id:"niSource"},...SOURCES.map(m=>el("option",{value:m,text:m})));
      const asked=el("input",{type:"text",id:"niAsked",placeholder:"What did they ask for? e.g. Series A pitch deck"});
      const err=el("div",{class:"saved"});
      const save=el("button",{class:"btn",text:"Log inquiry",onclick:async()=>{
        if(!name.value.trim()){err.textContent="Add who it is first.";name.focus();return;}
        if(!/^\d{4}-\d{2}-\d{2}$/.test(date.value.trim())){err.textContent="Use a date like 2026-11-14.";date.focus();return;}
        if(!db){err.textContent="Saving isn't available in this view. Open the page signed in.";return;}
        const doc={date:date.value.trim(),name:name.value.trim(),source:source.value,asked:asked.value.trim(),status:"new",order:Date.now(),todos:[],notes:""};
        save.disabled=true;
        try{const ref=await store.add("inquiries",doc);state.inquiries[ref.id]=doc;toast("Inquiry logged");sheet={kind:"inquiries",id:ref.id};buildSheet();render();}
        catch(e){save.disabled=false;fail(e);}
      }});
      rc(body,
        el("label",{class:"field"},el("span",{class:"label",text:"Who"}),name),
        el("div",{class:"row2"},el("label",{class:"field"},el("span",{class:"label",text:"Date"}),date),el("label",{class:"field"},el("span",{class:"label",text:"Where they found you"}),source)),
        el("label",{class:"field"},el("span",{class:"label",text:"What they asked"}),asked),
        save,err);
      setTimeout(()=>name.focus(),0);
      return;
    }
    if(!sheet.id&&sheet.kind==="projects"){
      const client=sheet.group==="client";
      document.getElementById("shKind").textContent=client?"New client project":"New portfolio project";
      document.getElementById("shTitle").textContent=client?"A client landed":"Add a portfolio project";
      document.getElementById("shMeta").textContent=client?"Paid work lives here, next to your portfolio.":"It joins your portfolio projects as To do.";
      const f=detailFields({},true,client);
      const err=el("div",{class:"saved"});
      const save=el("button",{class:"btn",text:client?"Add client project":"Add project",onclick:async()=>{
        const v=f.read(); if(!v.name){err.textContent="Give it a name first.";return;}
        if(!db){err.textContent="Saving isn't available in this view. Open the page signed in.";return;}
        const doc={...v,group:client?"client":"portfolio",status:"todo",order:Date.now(),todos:[],notes:"",hourLog:[]};
        save.disabled=true;
        try{const ref=await store.add("projects",doc);state.projects[ref.id]=doc;toast(client?"Client project added":"Project added");sheet={kind:"projects",id:ref.id};buildSheet();render();}
        catch(e){save.disabled=false;fail(e);}
      }});
      rc(body,f.node,save,err);
      return;
    }
    if(!sheet.id){ // new learning item
      document.getElementById("shKind").textContent="New learning item";
      document.getElementById("shTitle").textContent="Add to your learning";
      document.getElementById("shMeta").textContent="It joins the Learning row as To do.";
      const name=el("input",{type:"text",id:"nlName",placeholder:"Book, course or chapter"});
      const when=el("select",{id:"nlWhen"},...["Nov","Dec","Jan","Feb","Mar","Apr"].map(m=>el("option",{value:m,text:m})));
      const hours=el("input",{type:"number",id:"nlHours",min:"0",step:"0.5",placeholder:"e.g. 4"});
      const ltypeSel=el("select",{id:"nlType"},...LTYPES.map(t=>el("option",{value:t,text:LTYPE_ICO[t]+" "+LTYPE_NAME[t]})));
      const track=el("select",{id:"nlTrack"},...["Brand and LinkedIn","Sales","Craft into content","AI","Other"].map(m=>el("option",{value:m,text:m})));
      const out=el("input",{type:"text",id:"nlOut",placeholder:"What will it turn into? e.g. a carousel"});
      const err=el("div",{class:"saved"});
      const save=el("button",{class:"btn",text:"Add learning item",onclick:async()=>{
        if(!name.value.trim()){err.textContent="Give it a name first.";name.focus();return;}
        if(!db){err.textContent="Saving isn't available in this view. Open the page signed in.";return;}
        const doc={name:name.value.trim(),type:ltypeSel.value,when:when.value,hours:Number(hours.value)||0,track:track.value,output:out.value.trim(),status:"todo",order:Date.now(),todos:[],rating:0,notes:""};
        save.disabled=true;
        try{const ref=await store.add("learning",doc);state.learning[ref.id]=doc;toast("Added to learning");sheet={kind:"learning",id:ref.id};buildSheet();render();}
        catch(e){save.disabled=false;fail(e);}
      }});
      rc(body,
        el("label",{class:"field"},el("span",{class:"label",text:"Name"}),name),
        el("div",{class:"row2"},el("label",{class:"field"},el("span",{class:"label",text:"When"}),when),el("label",{class:"field"},el("span",{class:"label",text:"Hours (about)"}),hours)),
        el("div",{class:"row2"},el("label",{class:"field"},el("span",{class:"label",text:"Type"}),ltypeSel),el("label",{class:"field"},el("span",{class:"label",text:"Track"}),track)),
        el("label",{class:"field"},el("span",{class:"label",text:"Applied output"}),out),
        save,err);
      setTimeout(()=>name.focus(),0);
      return;
    }
    const p=item(); if(!p){closeSheet();return;}
    const isL=sheet.kind==="learning", isI=sheet.kind==="inquiries", isP=sheet.kind==="projects";
    document.getElementById("shKind").textContent=isP&&p.group==="client"?"Client project":KIND[sheet.kind].label;
    {const h=document.getElementById("shTitle");rc(h,isL?LTYPE_ICO[ltype(p)]+" ":"",inl(el("span",{text:p.name}),{value:p.name,label:"name",onSave:v=>saveItem({name:v})}));}
    document.getElementById("shMeta").textContent=isI?[p.date?fmt(p.date,{day:"numeric",month:"short"}):"",p.source||"",p.asked||""].filter(Boolean).join(" \u00b7 "):isL?[(p.when||""),(p.hours?"about "+p.hours+" h":""),p.track||"",p.output?"Output: "+p.output:""].filter(Boolean).join(" \u00b7 "):[p.group==="client"?p.client:"",p.type,p.start?"start "+fmt(p.start,{day:"numeric",month:"short"}):"",p.due?"due "+fmt(p.due,{day:"numeric",month:"short"}):"",p.group==="client"?(p.fee?p.fee+" \u00b7 ":"")+(p.paid?"paid":"not paid yet"):""].filter(Boolean).join(" \u00b7 ");
    const notes=el("textarea",{id:"shNotes",placeholder:isL?"Key ideas, quotes, frameworks, and how you'll use them":isI?"Budget, timeline, contact details, what they liked in your work":"Decisions, client feedback, links, anything you must not forget"});
    notes.value=p.notes||"";
    notes.addEventListener("input",()=>{notesDirty=true;document.getElementById("shSaved").textContent="Saving...";clearTimeout(notesTimer);notesTimer=setTimeout(flushNotes,800);});
    const addIn=el("input",{type:"text",id:"shTodoIn",placeholder:"Add a to-do"});
    const addForm=el("form",{class:"add",onsubmit:e=>{e.preventDefault();const v=addIn.value.trim();if(!v)return;const t=[...(item().todos||[]),{id:Date.now().toString(36),text:v,done:false}];addIn.value="";saveItem({todos:t});}},addIn,el("button",{class:"btn",type:"submit",text:"Add"}));
    const secs=[
      el("div",{class:"sh-sec"},el("span",{class:"label",text:isI?"Outcome":"Status"}),el("div",{class:"seg",id:"shStatus",role:"group","aria-label":"Status"})),
      isL?el("div",{class:"sh-sec"},el("span",{class:"label",text:"Rating: how useful is it?"}),el("div",{class:"stars",id:"shStars",role:"group","aria-label":"Rating"})):null,
      isP?el("div",{class:"sh-sec"},el("div",{class:"panel-head"},el("span",{class:"label",text:"Time"}),el("span",{class:"hint",text:"Tracked automatically from your timers"})),
        el("div",{id:"shTime"}),
        el("details",{class:"pt-det",id:"shEstDet"},el("summary",{},el("span",{text:"Estimated hours"}),el("span",{class:"hint",id:"shHrsTotal"})),
        el("p",{class:"hint",style:"margin:6px 0",text:"For your records only. Estimates never count as hours worked."}),
        el("ul",{class:"hrs",id:"shHrs"}),
        el("form",{class:"hrs-add",onsubmit:e=>{e.preventDefault();const h=Number(document.getElementById("shHrsIn").value);if(!(h>0))return;const note=document.getElementById("shHrsNote").value.trim();const log=[...(item().hourLog||[]),{id:Date.now().toString(36),date:sel,hours:h,note}];document.getElementById("shHrsIn").value="";document.getElementById("shHrsNote").value="";saveItem({hourLog:log});toast("Estimate saved. It is for your records and doesn't count as hours worked");}},
          el("input",{type:"number",id:"shHrsIn",min:"0",step:"0.25",placeholder:"Hours","aria-label":"Estimated hours"}),el("input",{type:"text",id:"shHrsNote",placeholder:"For what, e.g. slides 1 to 8","aria-label":"What the estimate is for"}),el("button",{class:"btn",type:"submit",text:"Save estimate"})))):null,
      el("div",{class:"sh-sec"},el("div",{class:"panel-head"},el("span",{class:"label",text:isI?"Follow-ups":"To-do list"}),el("span",{class:"hint",id:"shTodoCount"})),el("ul",{class:"todos",id:"shTodos"}),addForm),
      el("div",{class:"sh-sec"},el("span",{class:"label",text:isL?"Important notes and takeaways":"Important notes"}),notes,el("div",{class:"saved",id:"shSaved"}))
    ];
    if(isP||isL)secs.push(editDetails(p,isP));
    if(isI){const src=el("select",{"aria-label":"Where they found you"},...SOURCES.map(m=>el("option",{value:m,text:m})));src.value=p.source||SOURCES[0];src.onchange=()=>saveItem({source:src.value});
      const dt=el("input",{type:"date","aria-label":"Date",value:p.date||""});dt.onchange=()=>{if(/^\d{4}-\d{2}-\d{2}$/.test(dt.value))saveItem({date:dt.value});};
      secs.push(el("div",{class:"sh-sec"},el("span",{class:"label",text:"Details"}),
        el("div",{class:"row2"},el("label",{class:"field"},el("span",{class:"label",text:"Date"}),dt),el("label",{class:"field"},el("span",{class:"label",text:"Where they found you"}),src)),
        el("div",{class:"field"},el("span",{class:"label",text:"What they asked"}),inl(el("span",{class:"ie-block",text:p.asked||""}),{value:p.asked||"",label:"what they asked",empty:"Add what they asked for",onSave:v=>saveItem({asked:v})}))));}
    if(isP||isL){const col=sheet.kind, grp=isP?(p.group==="client"?"client":"portfolio"):null;
      secs.push(el("div",{class:"sh-sec"},el("span",{class:"label",text:"Order"}),el("div",{class:"btns",style:"display:flex;gap:6px;flex-wrap:wrap"},
        el("button",{class:"mini",text:"\u2190 Move earlier",onclick:()=>moveItem(col,sheet.id,-1,grp)}),el("button",{class:"mini",text:"Move later \u2192",onclick:()=>moveItem(col,sheet.id,1,grp)}),
        el("span",{class:"hint",text:"Or hold a card on the board and drag it."}))));}
    if(isL||isI||isP){
      const label=isL?"Delete this learning item":isI?"Delete this inquiry":"Delete this project", k=sheet.kind;
      const del=el("button",{class:"mini danger",text:label});
      let armed=false;
      del.onclick=async()=>{if(!armed){armed=true;del.textContent="Tap again to delete";setTimeout(()=>{armed=false;del.textContent=label;},3000);return;}
        const id=sheet.id;closeSheet();delete state[k][id];render();if(db){try{await store.del(k+"/"+id);toast("Deleted");}catch(e){fail(e);}}};
      secs.push(el("div",{},del));
    }
    rc(body,...secs.filter(Boolean));
    refreshSheet();
  }
  function refreshSheet(){
    if(!sheet||!sheet.id)return; const p=item(); if(!p){closeSheet();return;}
    const K=KIND[sheet.kind], NAMES=(sheet.kind==="projects"&&p.group==="client")?CSTATUS_NAME:K.names;
    const st=document.getElementById("shStatus");
    if(st)rc(st,...K.statuses.map(v=>el("button",{"aria-pressed":String((p.status||"todo")===v),text:NAMES[v],onclick:()=>{if(["done","live","won"].includes(v)&&p.status!==v)woo();saveItem({status:v});if(v==="done")toast("Done. Now turn it into a post");if(v==="live")toast(p.name+(p.group==="client"?" delivered":" is live"));}})));
    const stars=document.getElementById("shStars");
    if(stars)stars.replaceChildren(...[1,2,3,4,5].map(n=>el("button",{class:"star","aria-pressed":String((p.rating||0)>=n),"aria-label":n+" of 5",text:"\u2605",onclick:()=>saveItem({rating:(p.rating===n?0:n)})})));
    const todos=Array.isArray(p.todos)?p.todos:[];
    const ul=document.getElementById("shTodos");
    if(ul){rc(ul,...(todos.length?todos.map(t=>{
      const cb=el("input",{type:"checkbox","aria-label":t.text});cb.checked=!!t.done;
      cb.onchange=()=>{if(cb.checked)woo();saveItem({todos:(item().todos||[]).map(x=>x.id===t.id?{...x,done:cb.checked}:x)});};
      const tctx={src:sheet.kind,ref:sheet.id,todoId:t.id,text:t.text};
      const rmd=reminderFor("todo",t.id);
      const bell=bellBtn(t.text,{kind:"todo",id:t.id,parent:sheet.kind+"/"+sheet.id},rmd);
      const tbtn=timerBtn(tctx);
      return el("li",{class:"todo"+(t.done?" done":"")},cb,el("div",{style:"min-width:0;display:flex;flex-direction:column;gap:4px"},inl(el("span",{text:t.text}),{value:t.text,label:"to-do",onSave:v=>saveItem({todos:(item().todos||[]).map(x=>x.id===t.id?{...x,text:v}:x)})}),rmd?el("span",{class:"chip accent",style:"align-self:flex-start",text:"\u{1F514} "+fmtAt(rmd.at)}):null,timerUI(tctx,t.spent)),el("span",{style:"display:flex;gap:4px"},bell,tbtn),el("button",{class:"x","aria-label":"Remove "+t.text,text:"\u00d7",onclick:()=>saveItem({todos:(item().todos||[]).filter(x=>x.id!==t.id)})}));
    }):[el("li",{class:"empty",text:"No to-dos yet. Break it into small steps you can finish in one sitting."})]));}
    const hl=document.getElementById("shHrs");
    if(hl){const log=estList(p);
      rc(hl,...(log.length?log.slice().reverse().map(x=>el("li",{},el("span",{class:"d",text:fmt(x.date,{day:"numeric",month:"short"})}),el("span",{class:"num"},inl(el("span",{text:fmtNum(Number(x.hours))}),{value:Number(x.hours),label:"hours",type:"number",min:0,step:0.25,onSave:v=>saveItem({hourLog:(item().hourLog||[]).map(y=>y.id===x.id?{...y,hours:Math.max(0,v)}:y)})})," h"),inl(el("span",{text:x.note||""}),{value:x.note||"",label:"what you did",empty:"Add a note",onSave:v=>saveItem({hourLog:(item().hourLog||[]).map(y=>y.id===x.id?{...y,note:v}:y)})}),el("button",{class:"x","aria-label":"Remove entry",text:"\u00d7",onclick:()=>saveItem({hourLog:(item().hourLog||[]).filter(y=>y.id!==x.id)})}))):[el("li",{class:"empty",style:"display:block",text:"No estimates yet. Add one to compare plan against what you really tracked."})]));
      document.getElementById("shHrsTotal").textContent=log.length?fmtNum(log.reduce((a,b)=>a+Number(b.hours||0),0))+" h":"";}
    const tb=document.getElementById("shTime");
    if(tb&&sheet.kind==="projects"){const act=projActivity(sheet.id),tot=act.reduce((a,b)=>a+b.min,0),est=estList(p).reduce((a,b)=>a+Number(b.hours||0),0)*60;
      const days=[...new Set(act.map(a=>a.date))];
      const pct=est>0?Math.min(100,tot/est*100):0;
      const stats=el("div",{class:"pt-stats"},
        el("div",{},el("b",{class:"num",text:tot>=1?dur(tot):"0m"}),el("span",{class:"hint",text:"tracked"})),
        el("div",{},el("b",{class:"num",text:String(act.length)}),el("span",{class:"hint",text:"session"+(act.length===1?"":"s")})),
        el("div",{},el("b",{class:"num",text:String(days.length)}),el("span",{class:"hint",text:"day"+(days.length===1?"":"s")})),
        est>0?el("div",{},el("b",{class:"num",text:dur(est)}),el("span",{class:"hint",text:"estimated"})):null);
      const bar=est>0?el("div",{class:"track pt-bar",title:Math.round(tot/est*100)+"% of the estimate"},el("div",{class:"fill"+(tot>est?" over":""),style:"width:"+pct+"%"})):null;
      const byDay=days.slice().reverse().map(d=>{const its=act.filter(a=>a.date===d);
        return el("li",{class:"pt-day"},el("div",{class:"pt-dh"},el("span",{text:fmt(d,{weekday:"short",day:"numeric",month:"short"})}),el("b",{class:"num",text:dur(its.reduce((a,b)=>a+b.min,0))})),
          ...its.map(a=>el("div",{class:"pt-row"},el("span",{class:"num pt-t",text:a.start?hhmm(a.start)+(a.live?" to now":" to "+hhmm(a.end)):"no time"}),el("span",{class:"pt-l",text:a.label}),el("span",{class:"num",text:dur(a.min)}))));});
      const det=el("details",{class:"pt-det",id:"shActDet"},el("summary",{},el("span",{text:"Activity"}),el("span",{class:"hint",text:act.length?act.length+" session"+(act.length===1?"":"s"):"none yet"})),
        act.length?el("ul",{class:"pt-list"},...byDay):el("p",{class:"hint",text:"Start a timer on one of this project's to-dos, or on a Today task whose name starts with \u201c"+(String(p.name||"").split(/\s+/)[0]||"")+"\u201d. Every session lands here."}));
      const old=document.getElementById("shActDet");if(old&&old.open)det.open=true;
      tb.replaceChildren(...[stats,bar,det].filter(Boolean));}
    const c=document.getElementById("shTodoCount"); if(c)c.textContent=todos.length?todos.filter(x=>x.done).length+" of "+todos.length+" done":"";
    const ta=document.getElementById("shNotes"); if(ta&&!notesDirty&&document.activeElement!==ta&&ta.value!==(p.notes||""))ta.value=p.notes||"";
  }
  document.getElementById("shClose").onclick=closeSheet;
  document.getElementById("sheetBg").onclick=closeSheet;
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&sheet)closeSheet();});
  document.getElementById("addInquiry").onclick=e=>{sheet={kind:"inquiries",id:null};sheetReturn=e.currentTarget;document.getElementById("sheetBg").hidden=false;document.getElementById("sheet").hidden=false;buildSheet();};
  function openNew(kind,group,from){sheet={kind,id:null,group};sheetReturn=from;document.getElementById("sheetBg").hidden=false;document.getElementById("sheet").hidden=false;buildSheet();}
  document.getElementById("addProject").onclick=e=>openNew("projects","portfolio",e.currentTarget);
  document.getElementById("addClient").onclick=e=>openNew("projects","client",e.currentTarget);
  // ---------- edit details ----------
  function detailFields(p,isP,client){
    const inp=(id,type,val,ph)=>{const i=el("input",{type,id,placeholder:ph||""});i.value=val==null?"":val;return i;};
    const f=(label,node)=>el("label",{class:"field"},el("span",{class:"label",text:label}),node);
    const parts=[], get={};
    if(isP){
      get.name=inp("edName","text",p.name,client?"e.g. Series A deck for Acme":"e.g. Mugassam pitch deck redesign");
      get.type=inp("edType","text",p.type,"e.g. Pitch deck, company profile");
      get.start=inp("edStart","date",p.start||"");get.due=inp("edDue","date",p.due||"");
      parts.push(f("Name",get.name),f("Type",get.type),el("div",{class:"row2"},f("Start date",get.start),f("Due date",get.due)));
      if(client){get.client=inp("edClient","text",p.client,"Client name and company");get.fee=inp("edFee","text",p.fee,"e.g. $800");
        get.paid=el("input",{type:"checkbox",id:"edPaid"});get.paid.checked=!!p.paid;
        parts.push(f("Client",get.client),el("div",{class:"row2"},f("Fee",get.fee),el("label",{class:"field"},el("span",{class:"label",text:"Paid"}),el("span",{style:"display:flex;align-items:center;gap:8px;min-height:38px"},get.paid,el("span",{text:"Payment received"})))));}
    }else{
      get.name=inp("edName","text",p.name,"Book, course or chapter");
      get.when=el("select",{id:"edWhen"},...["Nov","Dec","Jan","Feb","Mar","Apr"].map(m=>el("option",{value:m,text:m})));get.when.value=p.when||"Nov";
      get.hours=inp("edHours","number",p.hours||"","e.g. 4");get.hours.step="0.5";
      get.track=el("select",{id:"edTrack"},...["Brand and LinkedIn","Sales","Craft into content","AI","Other"].map(m=>el("option",{value:m,text:m})));get.track.value=p.track||"Brand and LinkedIn";
      get.output=inp("edOut","text",p.output,"What will it turn into?");
      get.type=el("select",{id:"edLType"},...LTYPES.map(t=>el("option",{value:t,text:LTYPE_ICO[t]+" "+LTYPE_NAME[t]})));get.type.value=ltype(p);
      parts.push(f("Name",get.name),el("div",{class:"row2"},f("Type",get.type),f("When",get.when)),el("div",{class:"row2"},f("Hours (about)",get.hours),f("Track",get.track)),f("Applied output",get.output));
    }
    return {node:el("div",{class:"sh-sec"},...parts),read:()=>{const o={};for(const k in get){const e=get[k];o[k]=e.type==="checkbox"?e.checked:(k==="hours"?(Number(e.value)||0):String(e.value).trim());}return o;}};
  }
  function editDetails(p,isP){
    const f=detailFields(p,isP,p.group==="client"), msg=el("span",{class:"saved"});
    const save=el("button",{class:"btn",type:"button",text:"Save details",onclick:()=>{const v=f.read();if(!v.name){msg.textContent="The name can't be empty.";return;}saveItem(v);buildSheet();toast("Details saved");}});
    return el("details",{class:"edit-box"},el("summary",{text:"Edit details"}),f.node,el("div",{style:"display:flex;align-items:center;gap:10px"},save,msg));
  }
  // ---------- reorder: hold and drag, or move buttons ----------
  function siblingsOf(col,group){
    if(col==="learning")return Object.entries(state.learning).map(([id,x])=>({id,...x})).sort((a,b)=>(a.order||0)-(b.order||0));
    return Object.entries(state.projects).map(([id,x])=>({id,...x})).filter(x=>(x.group==="client")===(group==="client")).sort((a,b)=>(a.order||0)-(b.order||0));
  }
  async function saveOrder(col,ids){
    const writes=[];ids.forEach((id,i)=>{const cur=state[col][id];if(cur&&cur.order!==i+1){state[col][id]={...cur,order:i+1};writes.push([id,i+1]);}});
    render(); for(const [id,o] of writes){try{await store.update(col+"/"+id,{order:o});}catch(e){fail(e);}}
  }
  function moveItem(col,id,dir,group){
    const ids=siblingsOf(col,group).map(x=>x.id), i=ids.indexOf(id), j=i+dir; if(i<0||j<0||j>=ids.length)return;
    [ids[i],ids[j]]=[ids[j],ids[i]]; saveOrder(col,ids); toast(dir<0?"Moved earlier":"Moved later");
  }
  (function(){
    let press=null, drag=null, suppressClick=false;
    const HOLD=380;
    const SEL={projects:".proj[data-id]",clients:".proj[data-id]",learning:".proj[data-id]",taskList:"li.task[data-id]"};
    function cardAt(container,sel,x,y){const elx=document.elementFromPoint(x,y);const c=elx&&elx.closest(sel);return c&&container.contains(c)?c:null;}
    ["projects","clients","learning","taskList"].forEach(cid=>{
      const box=document.getElementById(cid), sel=SEL[cid], vertical=cid==="taskList";
      box.addEventListener("pointerdown",e=>{const card=e.target.closest(sel);if(!card||e.button>0)return;if(vertical&&e.target.closest("button,input,select,textarea,a,label"))return;
        press={card,box,x:e.clientX,y:e.clientY,id:e.pointerId,timer:setTimeout(()=>{if(!press)return;
          drag={card,box,sel,vertical,col:box.dataset.col};window.__sbDragging=true;card.classList.add("lifted");box.classList.add("sorting");try{card.setPointerCapture(press.id);}catch(_){}
          if(navigator.vibrate)try{navigator.vibrate(15);}catch(_){} },HOLD)};});
      box.addEventListener("pointermove",e=>{
        if(press&&!drag&&(Math.abs(e.clientX-press.x)>8||Math.abs(e.clientY-press.y)>8)){clearTimeout(press.timer);press=null;return;}
        if(!drag)return; e.preventDefault();
        const over=cardAt(drag.box,drag.sel,e.clientX,e.clientY); if(!over||over===drag.card||over.parentNode!==drag.card.parentNode)return; // tasks stay inside their block
        const r=over.getBoundingClientRect(), after=drag.vertical?(e.clientY-r.top)>r.height/2:((e.clientX-r.left)>r.width/2||(e.clientY-r.top)>r.height*0.75);
        over.parentNode.insertBefore(drag.card,after?over.nextSibling:over);
      });
      const end=()=>{if(press){clearTimeout(press.timer);press=null;}
        if(drag){const d=drag;drag=null;window.__sbDragging=false;d.card.classList.remove("lifted");d.box.classList.remove("sorting");suppressClick=true;setTimeout(()=>{suppressClick=false;},250);
          const ids=[...d.box.querySelectorAll(d.sel)].map(c=>c.dataset.id);saveOrder(d.col,ids);toast("Order saved");}};
      box.addEventListener("pointerup",end);box.addEventListener("pointercancel",end);
      box.addEventListener("click",e=>{if(suppressClick){e.stopPropagation();e.preventDefault();}},true);
      box.addEventListener("contextmenu",e=>{if(press||drag)e.preventDefault();});
    });
    document.addEventListener("touchmove",e=>{if(drag)e.preventDefault();},{passive:false});
  })();
  document.getElementById("addLearning").onclick=e=>{sheet={kind:"learning",id:null};sheetReturn=e.currentTarget;document.getElementById("sheetBg").hidden=false;document.getElementById("sheet").hidden=false;buildSheet();};
  async function cycleLearning(p){
    const next=LSTATUS[(LSTATUS.indexOf(p.status||"todo")+1)%LSTATUS.length];
    state.learning[p.id]={...state.learning[p.id],status:next};render();
    if(db){try{await store.update("learning/"+p.id,{status:next});}catch(e){fail(e);}}
    if(next==="done")toast(p.name+": done. Now turn it into a post");
  }
  function fmtNum(n){return Number.isInteger(n)?String(n):n.toFixed(1);}

  // ---------- inline editing: tap any editable text to change it in place ----------
  // Enter or leaving the field saves, Escape cancels. While a field is open, the board doesn't redraw under you.
  function inl(node,{value,label,type,multiline,min,step,onSave,empty}){
    node.classList.add("ie"); node.tabIndex=0; node.setAttribute("role","button");
    node.setAttribute("aria-label","Edit "+label+(value!==undefined&&value!==""?": "+value:""));
    node.title="Tap to edit";
    if((value===undefined||value==="")&&empty&&!node.textContent)node.textContent=empty;
    const open=e=>{
      if(e){e.preventDefault();e.stopPropagation();}
      const inp=el(multiline?"textarea":"input",{class:"ie-in"+(multiline?" ml":""),"aria-label":label,...(multiline?{rows:"3"}:{type:type||"text"}),...(min!=null?{min:String(min)}:{}),...(step?{step:String(step)}:{})});
      inp.value=value==null?"":value;
      window.__sbEditing=true; node.replaceWith(inp); inp.focus(); try{inp.select();}catch(_){}
      let done=false;
      const finish=async ok=>{
        if(done)return; done=true; window.__sbEditing=false;
        let v=inp.value; if(type!=="number")v=v.trim();
        const changed=ok&&String(v)!==String(value==null?"":value)&&!(type!=="number"&&v===""&&!empty);
        if(changed){const out=type==="number"?(v===""?0:Number(v)):v; if(type==="number"&&!isFinite(out)){render();return;} try{await onSave(out);}catch(err){fail(err);} say("Saved");}
        render();
      };
      inp.addEventListener("keydown",ev=>{if(ev.key==="Escape"){ev.preventDefault();finish(false);}else if(ev.key==="Enter"&&(!multiline||ev.ctrlKey||ev.metaKey)){ev.preventDefault();finish(true);}});
      inp.addEventListener("blur",()=>finish(true));
      inp.addEventListener("click",ev=>ev.stopPropagation());
    };
    node.addEventListener("click",open);
    node.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" ")open(e);});
    return node;
  }
  function patchTask(id,patch){state.tasks[id]={...state.tasks[id],...patch};render();return setTask(id,patch);}
  async function patchSprint(n,patch){const k="s"+n;state.sprints[k]={...(state.sprints[k]||{}),...patch};render();try{await store.update("sprints/"+k,patch);}catch(e){fail(e);}}
  function setLogValue(key,v){const L={...log(sel),date:sel};L[key]=Math.max(0,Math.round(Number(v)*2)/2);state.logs[sel]=L;render();queueSave(sel,300);}
  let editFor=null;
  function taskEditRow(t){
    const cat=el("select",{"aria-label":"Category for "+t.title},...Object.entries(CAT_NAME).map(([v,n])=>el("option",{value:v,text:n})));cat.value=t.cat||"setup";
    cat.onchange=()=>{patchTask(t.id,{cat:cat.value});toast("Category changed");};
    const date=el("input",{type:"date","aria-label":"Day for "+t.title,value:t.date,min:START,max:END});
    date.onchange=()=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(date.value))return;patchTask(t.id,{date:date.value});toast("Moved to "+fmt(date.value,{weekday:"short",day:"numeric",month:"short"}));};
    const del=el("button",{class:"mini danger",type:"button",text:"Delete task"});let armed=false;
    del.onclick=async()=>{if(!armed){armed=true;del.textContent="Tap again to delete";setTimeout(()=>{armed=false;del.textContent="Delete task";},3000);return;}
      editFor=null;delete state.tasks[t.id];render();try{await store.del("tasks/"+t.id);toast("Task deleted");}catch(e){fail(e);}};
    return el("div",{class:"tedit",role:"group","aria-label":"Edit "+t.title},
      el("label",{class:"field"},el("span",{class:"label",text:"Category"}),cat),
      el("label",{class:"field"},el("span",{class:"label",text:"Day"}),date),
      el("div",{class:"tedit-btns"},del,el("button",{class:"mini",type:"button",text:"Done",onclick:()=>{editFor=null;render();refocus('li.task[data-id="'+t.id+'"] .tedit-btn');}})));
  }
  // ---------- compact task rows: one line, tap to open the description and actions, swipe for the quick actions ----------
  let openTask=null;
  const SW_MIN=72;
  function bankAdjust(t,on,day){if(!isBankTask(t)||!!t.done===!!on||!day)return;const L={...log(day),date:day};L.drafts=Math.max(0,Number(L.drafts||0)+(on?1:-1));state.logs[day]=L;queueSave(day,300);}
  function setDone(id,on){const t=state.tasks[id];if(!t)return;on=!!on;const day=on?sel:(t.doneAt||sel);
    bankAdjust(t,on,day);
    state.tasks[id]={...t,done:on,doneAt:on?sel:null};if(on){if(openTask===id||openTask==="c:"+id)openTask=null;const rest=tasksOn(sel).filter(x=>!x.done&&x.id!==id),nx=rest.find(x=>taskBlock(x)===taskBlock(t))||rest[0];if(nx)openTask=nx.id;}render();setTask(id,{done:on,doneAt:on?sel:null});
    if(on){toast(isBankTask(t)?"Done. +1 draft in the bank ("+Math.max(0,bankN())+" ready)":"Done");woo();}else if(isBankTask(t))toast("Draft removed from the bank");}
  function startTaskFocus(t){pStartFor({what:"tasks:"+t.id,label:t.title});}
  function swipeLeft(t){if(isDesign(t)&&!t.done){startTaskFocus(t);return;}if(t.done){toast("Already done");return;}setDone(t.id,true);}
  function attachSwipe(li,main,t){
    let sx=0,sy=0,dx=0,on=false,pid=null,dead=false;
    main.addEventListener("pointerdown",e=>{if(e.button>0||e.target.closest("input,select,textarea,.ie-in"))return;sx=e.clientX;sy=e.clientY;dx=0;on=false;dead=false;pid=e.pointerId;});
    main.addEventListener("pointermove",e=>{if(pid!==e.pointerId||dead||window.__sbDragging)return;const mx=e.clientX-sx,my=e.clientY-sy;
      if(!on){if(Math.abs(my)>10&&Math.abs(my)>Math.abs(mx)){dead=true;return;}
        if(Math.abs(mx)>12&&Math.abs(mx)>Math.abs(my)*1.3){on=true;window.__sbSwiping=true;main.style.transition="none";try{main.setPointerCapture(e.pointerId);}catch(_){}}else return;}
      dx=Math.max(-150,Math.min(150,mx));main.style.transform="translateX("+dx+"px)";
      li.classList.toggle("sw-left",dx<-16);li.classList.toggle("sw-right",dx>16);li.classList.toggle("sw-arm",Math.abs(dx)>=SW_MIN);});
    const end=(e,cancel)=>{if(pid!==e.pointerId)return;pid=null;if(!on)return;on=false;window.__sbSwiping=false;
      main.style.transition="";main.style.transform="";li.classList.remove("sw-left","sw-right","sw-arm");
      main.dataset.swiped="1";setTimeout(()=>{delete main.dataset.swiped;},350);
      if(cancel)return;if(dx<=-SW_MIN)swipeLeft(t);else if(dx>=SW_MIN)openResched(t.id);else render();};
    main.addEventListener("pointerup",e=>end(e,false));main.addEventListener("pointercancel",e=>end(e,true));
  }
  function taskRow(t,isCarry){
    const key=(isCarry?"c:":"")+t.id, open=openTask===key;
    const toggle=()=>{openTask=open?null:key;if(open){editFor=editFor===t.id?null:editFor;moveFor=moveFor===t.id?null:moveFor;}render();refocus('li.task[data-k="'+key+'"] .title');};
    const cb=el("input",{type:"checkbox","aria-label":"Done: "+t.title});cb.checked=!!t.done;
    cb.addEventListener("click",e=>e.stopPropagation());
    cb.addEventListener("change",()=>setDone(t.id,cb.checked));
    const pr=pRun(), running=!!(pr&&pr.phase==="focus"&&pr.startedAt&&pr.what==="tasks:"+t.id);
    const rm=reminderFor("task",t.id), mv=t.moved||0;
    const stateTag=running?el("span",{class:"tstate on num","data-pclock":"1",title:"Focus timer running",text:pClock(pr)}):(t.spent||0)>0?el("span",{class:"tstate num",title:dur(t.spent)+" tracked",text:dur(t.spent)}):null;
    const ttl=el("span",{class:"title",role:"button",tabindex:"0","aria-expanded":String(open),title:t.title,text:t.title});
    ttl.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle();}});
    const main=el("div",{class:"trow-main"},cb,
      el("span",{class:"tcat",style:"--c:"+(CAT[t.cat]||"var(--muted)"),title:CAT_NAME[t.cat]||"Task",role:"img","aria-label":CAT_NAME[t.cat]||"Task",text:CAT_ICO[t.cat]||"•"}),
      ttl,
      isCarry?el("span",{class:"tflag",title:"From "+fmt(t.date),text:fmt(t.date,{day:"numeric",month:"short"})}):null,
      mv>=2&&!t.done?el("span",{class:"tflag bad",title:"Moved "+mv+" times: shrink or cut",text:"↷"+mv}):null,
      rm?el("span",{class:"tflag",title:"Reminder "+fmtAt(rm.at),text:"\u{1F514}"}):null,
      stateTag);
    main.addEventListener("click",e=>{if(main.dataset.swiped||e.target.closest("input"))return;toggle();});
    const leftTxt=isDesign(t)&&!t.done?"Start now":"✓ Done";
    const top=el("div",{class:"trow-top"},el("div",{class:"tswipe","aria-hidden":"true"},el("span",{class:"sw-l",text:"↷ Reschedule"}),el("span",{class:"sw-r",text:leftTxt})),main);
    let more=null;
    if(open){
      const tctx={src:"tasks",ref:t.id,todoId:null,text:t.title};
      const sub=el("div",{class:"sub"},el("span",{class:"cat",style:"--c:"+(CAT[t.cat]||"var(--muted)"),text:CAT_NAME[t.cat]||t.cat||"Task"}),el("span",{class:"cat",text:"Block "+taskBlock(t)}));
      if(isCarry)sub.append(el("span",{class:"cat",text:"from "+fmt(t.date,{weekday:"short",day:"numeric",month:"short"})}));
      if(mv>=2&&!t.done)sub.append(el("span",{class:"chip bad",text:"Moved "+mv+" times: shrink or cut"}));
      if(rm)sub.append(el("span",{class:"chip accent",text:"\u{1F514} "+fmtAt(rm.at)}));
      const acts=el("div",{class:"tacts"},
        !t.done?el("button",{class:"mini",type:"button",text:running?"Open timer":"Start now",onclick:()=>running?openPomoFull():startTaskFocus(t)}):null,
        el("button",{class:"mini",type:"button",text:t.done?"Mark not done":"✓ Done",onclick:()=>setDone(t.id,!t.done)}),
        !t.done?el("button",{class:"mini",type:"button",text:"↷ Reschedule",onclick:()=>openResched(t.id)}):null,
        bellBtn(t.title,{kind:"task",id:t.id},rm),
        !isCarry?el("button",{class:"tbtn tmove-btn","aria-label":"Reorder: "+t.title,"aria-expanded":String(moveFor===t.id),title:"Move up or down in this block (or Alt + Arrow keys)",text:"Move",onclick:e=>{e.stopPropagation();moveFor=moveFor===t.id?null:t.id;render();refocus('li.task[data-id="'+t.id+'"] '+(moveFor?'.tmove button':'.tmove-btn'));}}):null,
        el("button",{class:"tbtn tedit-btn","aria-label":"More options: "+t.title,"aria-expanded":String(editFor===t.id),title:"Category, day, delete",text:"⋯",onclick:e=>{e.stopPropagation();editFor=editFor===t.id?null:t.id;render();refocus('li.task[data-k="'+key+'"] '+(editFor?'.tedit select':'.tedit-btn'));}}),
        isCarry?el("button",{class:"mini",type:"button",text:"Move here",onclick:()=>{const m=mv+1;state.tasks[t.id]={...state.tasks[t.id],date:sel,moved:m,sprint:sprintFor(sel).n};openTask=null;render();setTask(t.id,{date:sel,moved:m,sprint:sprintFor(sel).n});toast("Moved to "+fmt(sel,{weekday:"short",day:"numeric",month:"short"}));}}):null,
        isCarry?el("button",{class:"mini danger",type:"button",text:"Cut",onclick:()=>{state.tasks[t.id]={...state.tasks[t.id],cut:true};openTask=null;render();setTask(t.id,{cut:true});toast("Cut");}}):null);
      more=el("div",{class:"trow-more"},
        inl(el("div",{class:"title-full ie-block",text:t.title}),{value:t.title,label:"task name",onSave:v=>patchTask(t.id,{title:v})}),
        sub,
        inl(el("div",{class:"tdesc ie-block",text:t.desc||""}),{value:t.desc||"",label:"description",multiline:true,empty:"Add a description",onSave:v=>patchTask(t.id,{desc:v})}),
        timerUI(tctx,t.spent),acts,
        editFor===t.id?taskEditRow(t):null,
        (!isCarry&&moveFor===t.id)?el("div",{class:"tmove",role:"group","aria-label":"Move "+t.title},
          el("button",{class:"mini",type:"button","data-dir":"-1",text:"↑ Move up",onclick:()=>{if(moveTask(t.id,-1))refocus('li.task[data-id="'+t.id+'"] .tmove button[data-dir="-1"]');}}),
          el("button",{class:"mini",type:"button","data-dir":"1",text:"↓ Move down",onclick:()=>{if(moveTask(t.id,1))refocus('li.task[data-id="'+t.id+'"] .tmove button[data-dir="1"]');}}),
          ...blockMoveBtns(t),el("button",{class:"mini",type:"button",text:"Done",onclick:()=>{moveFor=null;render();refocus('li.task[data-id="'+t.id+'"] .tmove-btn');}})):null);
    }
    const li=el("li",{class:"task trow"+(t.done?" done":"")+(open?" open":""),"data-k":key,...(isCarry?{}:{"data-id":t.id})},top,more);
    attachSwipe(li,main,t);
    return li;
  }
  // ---------- Today: the selected day in 4 blocks ----------
  function setBlockNote(d,n,v){const L={...log(d),date:d},bn={...(L.blockNotes||{})};if(v)bn[n]=String(v).slice(0,300);else delete bn[n];L.blockNotes=bn;state.logs[d]=L;queueSave(d,300);render();}
  function gymMini(){
    const today=iso(new Date()),a=gActive(),ses=gSessions().filter(s=>s.date===sel),d=a?a.day:gDefaultDay(),day=GYM[d]||GYM[0];
    const status=a?el("span",{class:"chip accent",text:"Workout running since "+hhmm(a.startedAt)}):ses.length?el("span",{class:"chip good",text:"Done: "+ses[0].sets+" sets, "+Math.round(ses[0].minutes||0)+" min"}):el("span",{class:"hint",text:sel===today?"Not trained yet today":"No workout logged"});
    return el("div",{class:"db-gym"},el("div",{class:"db-gym-t"},el("b",{lang:"ar",dir:"auto",text:"\u{1F3CB} "+day.t+": "+day.f}),status,el("span",{class:"hint",text:"After the gym: family time, phone away."})),
      el("button",{type:"button",class:"btn ghost",text:a?"Open workout":"Open gym",onclick:()=>setPage("gym")}));
  }
  function renderDayBlocks(box,ts){
    if(!state.loaded.tasks){rc(box,el("div",{class:"empty",text:"Loading tasks..."}));return;}
    const L=log(sel),notes=L.blockNotes||{},today=iso(new Date()),nowM=new Date().getHours()*60+new Date().getMinutes(),kids=[];
    if(!ts.length)kids.push(el("div",{class:"empty",text:isFriday(sel)?"Friday is off. Do the 30-minute weekly review, then rest.":"No tasks planned for this day yet. Add one below, or ask Claude to plan the next sprint at your sprint review."}));
    DAY_BLOCKS.forEach(b=>{
      const mine=ts.filter(t=>taskBlock(t)===b.n),len=blkLen(b),fm=b.n===4?0:winFocusMin(sel,b.from,b.to),pct=Math.min(100,fm/len*100),pr=blkPrayers(sel,b),dn=mine.filter(t=>t.done).length;
      const now=sel===today&&nowM>=hmMin(b.from)&&nowM<hmMin(b.to);
      const head=el("div",{class:"db-head"},
        el("div",{class:"db-top"},el("span",{class:"db-n num","aria-hidden":"true",text:String(b.n)}),el("h3",{class:"db-name",text:b.name}),
          el("span",{class:"db-win num",text:t12(b.from)+" to "+t12(b.to)+" · "+dur(len)+(now?" · now":"")}),mine.length?el("span",{class:"hint num",text:dn+"/"+mine.length+" done"}):null),
        pr.length?el("div",{class:"db-pray","aria-label":"Prayer times in this block"},...pr.map(p=>el("span",{class:"chip",text:"\u{1F54C} "+p}))):null,
        b.n!==4?el("div",{class:"db-bar",title:"Focus logged inside "+t12(b.from)+" to "+t12(b.to)},el("div",{class:"track",role:"img","aria-label":"Deep work "+dur(fm)+" of "+dur(len)},el("div",{class:"fill"+(pct>=100?" good":""),style:"width:"+pct+"%"})),el("span",{class:"hint num",text:"Deep work "+dur(fm)+" / "+dur(len)})):null,
        inl(el("span",{class:"db-note",text:notes[b.n]||""}),{value:notes[b.n]||"",label:"insight for block "+b.n,empty:"+ Add an insight for this block",onSave:v=>setBlockNote(sel,b.n,v)}));
      const ul=el("ul",{class:"tasks db-list"},...mine.map(t=>taskRow(t,false)));
      if(!mine.length&&b.n!==4)ul.append(el("li",{class:"db-empty",text:"Nothing planned in this block."}));
      kids.push(el("div",{class:"dblock"+(now?" now":""),role:"group","aria-label":"Block "+b.n+": "+b.name+", "+t12(b.from)+" to "+t12(b.to)},head,b.n===4?gymMini():null,ul.children.length?ul:null));
    });
    rc(box,...kids);
  }
  // ---------- reschedule: tomorrow or the next buffer slot, never past the sprint's end, never Friday ----------
  function sprintLastDay(sp){let d=sp.end;while(isFriday(d))d=addDays(d,-1);return d;}
  function bufferSlot(t,base,sp){
    const cand=Object.entries(state.tasks).map(([id,x])=>({id,...x})).filter(x=>x.id!==t.id&&!x.done&&!x.cut&&x.date>base&&x.date<=sp.end&&!isFriday(x.date)&&/buffer/i.test(x.title||"")).sort((a,b)=>a.date.localeCompare(b.date));
    if(cand.length)return cand[0].date;
    let best=null,bn=1e9;for(let d=nextWork(base);d<=sp.end;d=nextWork(d)){const n=tasksOn(d).filter(x=>!x.done).length;if(n<bn){bn=n;best=d;}}return best;}
  function moveTaskTo(id,d){const t=state.tasks[id];if(!t)return;if(t.date===d){toast("It stays on "+fmt(d,{weekday:"short",day:"numeric",month:"short"}));return;}
    const m=(t.moved||0)+1,patch={date:d,moved:m,sprint:sprintFor(d).n};state.tasks[id]={...t,...patch};if(openTask&&openTask.endsWith(id))openTask=null;render();setTask(id,patch);
    toast("Moved to "+fmt(d,{weekday:"short",day:"numeric",month:"short"})+(m>=2?". Moved "+m+" times: shrink or cut it":""));}
  function openResched(id){
    if(!state.tasks[id])return;const t={id,...state.tasks[id]},dlg=document.getElementById("reschDlg"),close=()=>{dlg.hidden=true;};
    const today=iso(new Date()),base=t.date>today?t.date:today,sp=sprintFor(base),mv=t.moved||0;
    const tm=nextWork(base),buf=bufferSlot(t,base,sp);
    const opts=[[tm===addDays(base,1)?"Tomorrow":"Next working day",tm<=sp.end?tm:null],["Next buffer slot",buf&&buf<=sp.end?buf:null]].filter(o=>o[1]);
    const last=sprintLastDay(sp);
    const fmtD=d=>fmt(d,{weekday:"short",day:"numeric",month:"short"});
    rc(dlg,el("div",{class:"rs-card",role:"dialog","aria-modal":"true","aria-labelledby":"rsdT"},
      el("div",{class:"hint",text:"Reschedule · Sprint "+sp.n+" ends "+fmtD(sp.end)+(mv?" · moved "+mv+" time"+(mv>1?"s":"")+" already":"")}),
      el("h2",{id:"rsdT",class:"rs-t",text:t.title}),
      mv>=2?el("div",{class:"rsd-warn",role:"status"},el("b",{text:"Shrink or cut."}),el("span",{text:" This task has moved "+mv+" times. Make it smaller, or cut it."}),
        el("div",{class:"rs-btns"},el("button",{type:"button",class:"btn ghost",text:"Shrink it",onclick:()=>{close();openTask=(t.date<sel?"c:":"")+t.id;render();toast("Tap the title or description to make it smaller");}}),
          el("button",{type:"button",class:"btn ghost",text:"Cut it",onclick:()=>{close();openTask=null;patchTask(t.id,{cut:true});toast("Cut");}}))):null,
      opts.length?el("div",{class:"rsd-opts"},...opts.map(([l,d])=>el("button",{type:"button",class:"rsd-opt",onclick:()=>{close();moveTaskTo(t.id,d);}},el("b",{text:l}),el("span",{class:"hint",text:fmtD(d)}))))
        :el("div",{class:"rsd-warn",role:"status"},el("b",{text:"Sprint ends: shrink it or do more today."}),el("span",{text:" No working day is left in Sprint "+sp.n+", so the task stays on "+fmtD(last)+"."}),
          el("div",{class:"rs-btns"},t.date!==last?el("button",{type:"button",class:"btn ghost",text:"Keep it on "+fmtD(last),onclick:()=>{close();moveTaskTo(t.id,last);}}):null,
            el("button",{type:"button",class:"btn ghost",text:"Shrink it",onclick:()=>{close();openTask=(t.date<sel?"c:":"")+t.id;render();toast("Tap the title or description to make it smaller");}}))),
      el("p",{class:"hint",text:"Nothing moves into the next sprint. Every sprint has a hard deadline."}),
      el("div",{class:"rs-btns"},el("button",{type:"button",class:"mini",text:"Cancel",onclick:close}))));
    dlg.hidden=false;dlg.onclick=e=>{if(e.target===dlg)close();};setTimeout(()=>{const b=dlg.querySelector(".rsd-opt,.btn,.mini");if(b)b.focus();},30);
  }
  // ---------- rough day: say how many hours are left, keep what matters, spread the rest over this sprint ----------
  const ROUGH=[["normal","8+","Normal day minus extras: learning 30 min"],["half","5 to 8","Half day: Block 2 gets 4 h on the first task only, Block 3 gets 1 h, learning 20 min"],["rescue","2 to 5","Rescue: 2 h on the first task, publish one post from the bank"],["rest","Under 2 or sick","Rest. Log it, and the streak holds"]];
  function roughPlan(h,ts,sick){
    const open=ts.filter(t=>!t.done),by=n=>open.filter(t=>taskBlock(t)===n),b1=by(1),b2=by(2),b3=by(3),first=b2[0]||open[0]||null,bank=Math.max(0,bankN());
    if(sick||h<2)return {h,mode:"rest",name:sick?"Sick day: rest":"Rest day",keep:[],lines:["No work today. Your body has a right over you, so rest well.","It is logged, so your streak holds.","Everything open moves to the lightest days left in this sprint."]};
    if(h>=8)return {h,mode:"normal",name:"Normal day, minus extras",keep:open,lines:["Every block runs as planned.","Learning capped at 30 min"+(b1[0]?" on "+b1[0].title:"")+".","No new tasks today."]};
    if(h>=5){const keep=[first,b3[0],b1[0]].filter((x,i,a)=>x&&a.indexOf(x)===i);return {h,mode:"half",name:"Half day",keep,lines:["Block 2: 4 h on "+(first?first.title:"your first design task")+" only.","Block 3: 1 h"+(b3[0]?" on "+b3[0].title:"")+".","Learning: 20 min"+(b1[0]?" on "+b1[0].title:"")+"."]};}
    return {h,mode:"rescue",name:"Rescue day",keep:[first].filter(Boolean),lines:["2 h on "+(first?first.title:"your first task")+".",bank?"Publish 1 post from the bank ("+bank+" ready).":"The bank is empty: skip the post and protect the 2 h."]};
  }
  // spread tasks over the remaining working days of the sprint, lightest day first
  function roughTargets(move,d){const sp=sprintFor(d),days=[];for(let x=nextWork(d);x<=sp.end;x=nextWork(x))days.push(x);if(!days.length)return null;
    const load={};days.forEach(x=>{load[x]=tasksOn(x).filter(t=>!t.done).length;});
    return move.map(t=>{const x=days.slice().sort((a,b)=>load[a]-load[b]||a.localeCompare(b))[0];load[x]++;return [t,x];});}
  function applyRough(plan,pairs,sick){const d=sel;
    (pairs||[]).forEach(([t,x])=>{const patch={date:x,moved:(t.moved||0)+1,sprint:sprintFor(x).n};state.tasks[t.id]={...state.tasks[t.id],...patch};setTask(t.id,patch);});
    const L={...log(d),date:d};L.rough={h:plan.h,mode:plan.mode,at:Date.now()};
    L.dayState=plan.mode==="rest"?(sick?"sick":"rest"):plan.mode==="normal"?(L.dayState||"normal"):"low";
    if(plan.mode==="rest"&&!L.reflection)L.reflection=sick?"Sick, no work.":"Rest day: under 2 hours left.";
    state.logs[d]=L;queueSave(d,300);render();
    const n=(pairs||[]).length;toast(n?n+" task"+(n>1?"s":"")+" spread over the rest of the sprint":"Plan set for today");}
  function openRough(){
    const dlg=document.getElementById("roughDlg");let h=null,sick=false;const close=()=>{dlg.hidden=true;};
    const now=new Date(),till=Math.max(0,Math.round((atOn(iso(now),"17:30")-now.getTime())/1800000)/2);
    const fmtD=d=>fmt(d,{weekday:"short",day:"numeric",month:"short"});
    const draw=()=>{
      const ts=tasksOn(sel),plan=h==null?null:roughPlan(h,ts,sick),move=plan?ts.filter(t=>!t.done&&!plan.keep.includes(t)):[],pairs=plan&&move.length?roughTargets(move,sel):null,noRoom=!!(plan&&move.length&&!pairs);
      const inp=el("input",{type:"number",min:"0",max:"16",step:"0.5",inputmode:"decimal",id:"roughH",value:h==null?"":String(h)});
      inp.addEventListener("change",()=>{const v=Number(inp.value);h=inp.value!==""&&isFinite(v)?Math.max(0,v):null;sick=false;draw();});
      inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();inp.blur();}});
      const tbl=el("table",{class:"rough-tbl"},el("thead",{},el("tr",{},el("th",{text:"Hours left"}),el("th",{text:"Plan"}))),
        el("tbody",{},...ROUGH.map(([k,a,b])=>el("tr",{class:plan&&plan.mode===k?"on":""},el("td",{class:"num",text:a}),el("td",{text:b})))));
      const view=plan?el("div",{class:"rough-plan",role:"status"},el("b",{text:plan.name+(sick?"":" ("+fmtNum(h)+" h left)")}),el("ul",{},...plan.lines.map(l=>el("li",{text:l}))),
        el("span",{class:"label",text:"Keep today ("+plan.keep.length+")"}),plan.keep.length?el("ul",{},...plan.keep.map(t=>el("li",{text:t.title}))):el("span",{class:"hint",text:"Nothing. Rest."}),
        el("span",{class:"label",text:(noRoom?"Stays today, sprint is ending (":"Move inside this sprint (")+move.length+")"}),
        noRoom?el("span",{class:"hint",text:"No working day is left in Sprint "+sprintFor(sel).n+", so these stay today. Shrink them or do more today."}):null,
        move.length?el("ul",{},...(pairs||move.map(t=>[t,null])).map(([t,x])=>el("li",{text:t.title+(x?" → "+fmtD(x):"")}))):el("span",{class:"hint",text:"Nothing to move."})):null;
      rc(dlg,el("div",{class:"rs-card rough",role:"dialog","aria-modal":"true","aria-labelledby":"rghT"},
        el("div",{class:"hint",text:fmt(sel,{weekday:"long",day:"numeric",month:"short"})}),el("h2",{id:"rghT",class:"rs-t",text:"Rough day"}),
        el("p",{class:"hint",text:"Be honest about the hours you really have. Keep what matters, move the rest inside this sprint."}),
        el("div",{class:"rough-in"},el("label",{class:"field",for:"roughH"},el("span",{class:"label",text:"Hours left"}),inp),
          el("button",{type:"button",class:"btn ghost",text:"Until 17:30 ("+fmtNum(till)+" h)",onclick:()=>{h=till;sick=false;draw();}}),
          el("button",{type:"button",class:"btn ghost",text:"I'm sick",onclick:()=>{h=0;sick=true;draw();}})),
        tbl,view,
        el("div",{class:"rs-btns"},el("button",{type:"button",class:"btn",text:"Apply",disabled:plan?null:"",onclick:()=>{if(!plan)return;close();applyRough(plan,pairs,sick);}}),el("button",{type:"button",class:"btn ghost",text:"Cancel",onclick:close}))));
    };
    draw();dlg.hidden=false;dlg.onclick=e=>{if(e.target===dlg)close();};setTimeout(()=>{const i=document.getElementById("roughH");if(i)i.focus();},30);
  }
  document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;["reschDlg","roughDlg"].forEach(id=>{const d=document.getElementById(id);if(d&&!d.hidden)d.hidden=true;});});
  // ---------- reflections: day state and one line, per day ----------
  function setLogField(d,k,v){const L={...log(d),date:d};if((L[k]||"")===(v||""))return;L[k]=v;state.logs[d]=L;queueSave(d,300);render();}
  function renderRefl(){
    const box=document.getElementById("dayRefl");if(!box)return;if(box.contains(document.activeElement)&&document.activeElement.tagName==="TEXTAREA")return;
    const L=log(sel),ds=L.dayState||"normal";
    const ta=el("textarea",{rows:"2",placeholder:"One line: what happened, what you learned","aria-label":"Reflection for "+fmt(sel)});ta.value=L.reflection||"";
    let tmr=null;const save=()=>{clearTimeout(tmr);tmr=null;setLogField(sel,"reflection",ta.value.trim().slice(0,2000));};
    ta.addEventListener("input",()=>{clearTimeout(tmr);tmr=setTimeout(save,900);});ta.addEventListener("blur",save);
    rc(box,el("div",{class:"refl-head"},el("span",{class:"label",id:"dsLbl",text:"Day state"}),
        el("div",{class:"seg",role:"group","aria-labelledby":"dsLbl"},...DSTATES.map(([k,n])=>el("button",{type:"button","aria-pressed":String(ds===k),text:n,onclick:()=>setLogField(sel,"dayState",k)})))),
      ds==="sick"||ds==="rest"?el("span",{class:"hint",text:"Counts as kept for your streak. Rest is part of the plan."}):null,
      el("label",{class:"field"},el("span",{class:"label",text:"Reflection"}),ta));
  }
  // ---------- insights history: reflections and block notes, newest first ----------
  function renderInsights(){
    const box=document.getElementById("ihBody");if(!box)return;const pg=box.closest(".page");if(pg&&pg.hidden)return;
    const days=Object.keys(state.logs).filter(d=>{const L=state.logs[d]||{};return L.reflection||(L.dayState&&L.dayState!=="normal")||(L.blockNotes&&Object.values(L.blockNotes).some(Boolean));}).sort().reverse();
    if(!days.length){rc(box,el("p",{class:"hint",text:"Nothing yet. Write a reflection on the Day log, or add an insight under any block on Today."}));return;}
    rc(box,el("ul",{class:"ih-list"},...days.map(d=>{const L=state.logs[d],bn=L.blockNotes||{};
      return el("li",{class:"ih-day"},
        el("div",{class:"ih-dh"},el("button",{type:"button",class:"sess-btn",text:fmt(d,{weekday:"short",day:"numeric",month:"short"}),onclick:()=>{sel=clampDate(d);setPage("today");}}),
          L.dayState&&L.dayState!=="normal"?el("span",{class:"chip "+(L.dayState==="low"?"warn":"accent"),text:DSTATE_NAME[L.dayState]||L.dayState}):null),
        L.reflection?el("p",{class:"ih-refl",text:L.reflection}):null,
        ...dayBlocksFor(d).filter(b=>bn[b.n]).map(b=>el("div",{class:"ih-bn"},el("span",{class:"label",text:"Block "+b.n+" · "+b.name}),el("span",{text:bn[b.n]}))));})));
  }
  // ---------- small wins: every finished task, newest first ----------
  let winsCat="all";
  function renderWins(){
    const box=document.getElementById("winsBody");if(!box)return;const pg=box.closest(".page");if(pg&&pg.hidden)return;
    const all=leafTasks().filter(t=>t.done&&!t.cut).sort((a,b)=>String(b.doneAt||b.date||"").localeCompare(String(a.doneAt||a.date||""))||(b.order||0)-(a.order||0));
    const counts={};all.forEach(t=>{counts[t.cat]=(counts[t.cat]||0)+1;});
    const cats=Object.keys(CAT_NAME).filter(k=>counts[k]);if(winsCat!=="all"&&!counts[winsCat])winsCat="all";
    const xs=winsCat==="all"?all:all.filter(t=>t.cat===winsCat);
    const pick=k=>{winsCat=k;renderWins();};
    const chips=el("div",{class:"wins-chips",role:"group","aria-label":"Filter by category"},
      el("button",{type:"button","aria-pressed":String(winsCat==="all"),onclick:()=>pick("all")},"All ",el("b",{text:String(all.length)})),
      ...cats.map(k=>el("button",{type:"button","aria-pressed":String(winsCat===k),onclick:()=>pick(k)},(CAT_ICO[k]||"")+" "+CAT_NAME[k]+" ",el("b",{text:String(counts[k])}))));
    const items=[];let last=null;
    xs.forEach(t=>{const d=t.doneAt||t.date;if(d!==last){items.push(el("li",{class:"wins-d",text:fmt(d,{weekday:"long",day:"numeric",month:"short"})}));last=d;}
      items.push(el("li",{class:"wins-row"},el("span",{class:"tcat",style:"--c:"+(CAT[t.cat]||"var(--muted)"),role:"img","aria-label":CAT_NAME[t.cat]||"Task",text:CAT_ICO[t.cat]||"•"}),el("span",{class:"wins-t",text:t.title}),el("span",{class:"hint",text:CAT_NAME[t.cat]||""})));});
    rc(box,el("section",{class:"panel","aria-labelledby":"winsH"},
      el("div",{class:"panel-head"},el("h2",{id:"winsH",text:"Small wins"}),el("span",{class:"hint",text:all.length+" task"+(all.length===1?"":"s")+" done"})),
      el("p",{class:"hint",style:"margin:0",text:"Every task you finished, newest first. Tap a category to see only its wins."}),chips,
      xs.length?el("ul",{class:"wins-list"},...items):el("p",{class:"empty",text:state.loaded.tasks?"Nothing finished yet. Tick your first task on Today.":"Loading..."})));
  }

  async function cycleProject(p){
    const next=STATUS[(STATUS.indexOf(p.status||"todo")+1)%STATUS.length];
    state.projects[p.id]={...state.projects[p.id],status:next};render();
    if(db){try{await store.update("projects/"+p.id,{status:next});}catch(e){fail(e);}}
    if(next==="live")toast(p.name+" is live");
  }

  // ---------- events ----------
  document.getElementById("prevDay").onclick=()=>{sel=clampDate(addDays(sel,-1));render();};
  document.getElementById("nextDay").onclick=()=>{sel=clampDate(addDays(sel,1));render();};
  document.getElementById("soundBtn").onclick=()=>setSound(!soundOn);
  {const sb=document.getElementById("soundBtn");sb.setAttribute("aria-pressed",String(soundOn));sb.textContent=soundOn?"Sound on":"Sound off";}
  document.getElementById("todayBtn").onclick=()=>{sel=clampDate(iso(new Date()));render();};
  document.getElementById("roughBtn").onclick=openRough;
  document.getElementById("addForm").addEventListener("submit",async e=>{
    e.preventDefault();const inp=document.getElementById("addTitle"),title=inp.value.trim();if(!title)return;
    if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return;}
    const body={title,cat:document.getElementById("addCat").value,date:sel,sprint:sprintFor(sel).n,done:false,moved:0,order:Date.now()};
    inp.value="";
    try{await store.add("tasks",body);toast("Added");}catch(err){fail(err);}
  });


  // ---------- backup and restore (only in the standalone app, where window.sbBackup exists) ----------
  (function(){
    const B=window.sbBackup, sec=document.getElementById("bkSec"); if(!B||!sec)return; sec.hidden=false;
    const box=document.getElementById("bkBody");
    const when=t=>new Date(t).toLocaleString("en-GB",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
    async function draw(){
      const list=el("ul",{class:"slp-list"});
      let autos=[];try{autos=await B.list();}catch(e){}
      autos.forEach(a=>list.append(el("li",{class:"slp-row"},el("span",{text:"·"}),el("span",{class:"ent-what"},el("span",{text:when(a.created_at)}),el("span",{class:"hint",text:a.kind==="nightly"?"Nightly copy (2:00 am)":a.kind==="auto"?"Automatic weekly copy":a.kind==="safety"?"Safety copy, saved before a restore":"Saved by you"})),el("span"),
        el("button",{class:"mini",type:"button",text:"Restore","aria-label":"Restore the backup from "+when(a.created_at),onclick:async()=>{if(!confirm("Replace everything on your board with the copy from "+when(a.created_at)+"? A safety copy of your current board is saved first."))return;try{await B.restore(a.id);toast("Restored. Reloading");setTimeout(()=>location.reload(),900);}catch(e){showNotice("Restore failed: "+(e.message||e));}}}))));
      const file=el("input",{type:"file",accept:"application/json,.json",hidden:"","aria-label":"Backup file"});
      file.onchange=async()=>{const f=file.files[0];if(!f)return;let j;try{j=JSON.parse(await f.text());}catch(e){showNotice("That file isn't a Sprint Board backup.");return;}
        if(!j||!j.data||typeof j.data!=="object"){showNotice("That file isn't a Sprint Board backup.");return;}
        if(!confirm("Replace everything on your board with this file from "+(j.exportedAt?when(j.exportedAt):"an unknown date")+"? A safety copy of your current board is saved first."))return;
        try{await B.restoreData(j.data);toast("Restored. Reloading");setTimeout(()=>location.reload(),900);}catch(e){showNotice("Restore failed: "+(e.message||e));}};
      rc(box,
        el("div",{class:"slp-btns"},
          el("button",{class:"btn",type:"button",text:"Download backup",onclick:()=>{B.download();toast("Backup file saved");}}),
          el("button",{class:"btn ghost",type:"button",text:"Save a copy online now",onclick:async()=>{try{await B.snapshot("manual");toast("Copy saved");draw();}catch(e){showNotice("Couldn't save the copy. Check your connection.");}}}),
          el("button",{class:"btn ghost",type:"button",text:"Restore from file",onclick:()=>file.click()}),file),
        el("div",{class:"sh-sec"},el("span",{class:"label",text:"Online copies"}),autos.length?list:el("p",{class:"hint",text:navigator.onLine?"None yet. The first automatic copy is made today.":"Connect to the internet to see your online copies."})));
    }
    draw(); window.addEventListener("online",draw); window.addEventListener("sb-backups",draw);
  })();
  // ---------- appearance: theme, light or dark, text size, motion. Saved on this device and synced to your others ----------
  const THEMES=[["red","Red","#D92D3A","#EE3442"],["ember","Ember","#C2410C","#FF7A3D"],["ocean","Ocean","#1D4ED8","#7AA7FF"],["teal","Teal","#0F766E","#2DD4BF"],["plum","Plum","#7C3AED","#B69CFA"],["rose","Rose","#BE185D","#F47AB6"],["graphite","Graphite","#2B2D33","#E2E4E9"]];
  const UI_DEF={accent:"ember",mode:"auto",size:"m",motion:"auto"};
  let ui={...UI_DEF}; try{ui={...UI_DEF,...JSON.parse(localStorage.getItem("sb-ui")||"{}")};}catch(e){}
  function applyUI(){
    const r=document.documentElement;
    if(ui.accent&&ui.accent!=="ember")r.setAttribute("data-accent",ui.accent);else r.removeAttribute("data-accent");
    if(ui.mode==="light"||ui.mode==="dark")r.setAttribute("data-theme",ui.mode);else r.removeAttribute("data-theme");
    r.style.setProperty("--zoom",{m:"1",l:"1.12",xl:"1.25"}[ui.size]||"1");
    if(ui.motion==="reduce")r.setAttribute("data-motion","reduce");else r.removeAttribute("data-motion");
    if(ui.look==="apple")r.setAttribute("data-look","apple");else r.removeAttribute("data-look");
  }
  applyUI();
  async function setUI(patch){const at=Date.now();ui={...ui,...patch};try{localStorage.setItem("sb-ui",JSON.stringify({...ui,at}));}catch(e){}applyUI();renderUI();try{applyPT();}catch(e){}
    if(db){try{await store.set("settings/ui",{...ui,at});}catch(e){}}}
  function syncUI(remote){if(!remote||!remote.at)return;let local=0;try{local=JSON.parse(localStorage.getItem("sb-ui")||"{}").at||0;}catch(e){}
    if(remote.at>local){const {at,...rest}=remote;ui={...UI_DEF,...rest};try{localStorage.setItem("sb-ui",JSON.stringify({...ui,at}));}catch(e){}applyUI();renderUI();}}
  function segOf(label,key,opts){return el("div",{class:"sh-sec"},el("span",{class:"label",id:"ui-"+key,text:label}),el("div",{class:"seg",role:"group","aria-labelledby":"ui-"+key},...opts.map(([v,t])=>el("button",{type:"button","aria-pressed":String(ui[key]===v),text:t,onclick:()=>setUI({[key]:v})}))));}
  function renderUI(){
    const b=document.getElementById("uiBody"); if(!b||document.getElementById("uiDlg").hidden)return;
    const dark=document.documentElement.getAttribute("data-theme")==="dark"||(!document.documentElement.getAttribute("data-theme")&&matchMedia("(prefers-color-scheme: dark)").matches);
    rc(b,
      segOf("Look","look",[["material","Material"],["apple","Apple theme"]]),
      el("div",{class:"sh-sec"},el("span",{class:"label",id:"ui-accent",text:"Theme"}),
        el("div",{class:"swatches",role:"radiogroup","aria-labelledby":"ui-accent"},...THEMES.map(([k,n,l,d])=>el("button",{type:"button",role:"radio","aria-checked":String(ui.accent===k),class:"swatch",onclick:()=>setUI({accent:k})},
          el("span",{class:"sw-dot",style:"background:"+(dark?d:l),"aria-hidden":"true"}),el("span",{text:n}))))),
      segOf("Light or dark","mode",[["auto","Auto"],["light","Light"],["dark","Dark"]]),
      segOf("Text size","size",[["m","Default"],["l","Large"],["xl","Larger"]]),
      segOf("Motion","motion",[["auto","As my device"],["reduce","Reduce"]]),
      el("p",{class:"hint",text:"Auto follows your device. Changes save on this device and sync to your others."}));
  }
  function openUI(){const d=document.getElementById("uiDlg");document.getElementById("uiBg").hidden=false;d.hidden=false;renderUI();setTimeout(()=>{const f=d.querySelector('[aria-checked="true"]')||d.querySelector("button");if(f)f.focus();},0);}
  function closeUI(){document.getElementById("uiBg").hidden=true;document.getElementById("uiDlg").hidden=true;}
  document.getElementById("uiBtn").onclick=openUI; document.getElementById("uiClose").onclick=closeUI; document.getElementById("uiBg").onclick=closeUI;
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!document.getElementById("uiDlg").hidden)closeUI();});
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change",renderUI);
  // ---------- focus timer (Pomodoro): count down or up, editable lengths, optional logging to Time entries ----------
  const POMO_DEF={focus:25,short:5,long:15,rounds:4,auto:false,log:true,mode:"down"};
  let pomoOpen=false, pomoEnding=false, pomoCfgOpen=false, pomoLookOpen=false;
  function P(){return state.timers.pomo||{};}
  function pCfg(){return {...POMO_DEF,...(P().cfg||{})};}
  function pRun(){const p=P();return p.phase?p:null;}
  function pElapsed(r){if(!r||!r.startedAt)return 0;return Math.max(0,(r.pausedAt||Date.now())-r.startedAt-(r.pausedTotal||0));}
  function pLeft(r){return Math.max(0,(r.durationMs||0)-pElapsed(r));}
  function pClock(r){if(r.overAt)return "+"+clock(Math.max(0,(r.pausedAt||Date.now())-r.overAt)).replace(/^00:/,"");const ms=r.durationMs?pLeft(r):pElapsed(r);return clock(ms).replace(/^00:/,"");}
  function pOverMin(r){return r&&r.overAt?Math.floor(Math.max(0,Date.now()-r.overAt)/60000):0;}
  // what the "next" button does when a phase has ended
  function pNextLabel(r){if(!r)return "";if(r.block){const left=r.block.end-Date.now();if(r.phase==="focus")return left>=(BLK_BREAK+5)*60000?"Start break":"Finish block";return left>=5*60000?"Start focus":"Finish block";}return r.phase==="focus"?"Start break":"Start focus";}
  // the phase hit zero: keep counting, wait for the user
  function pOver(r){const endAt=r.startedAt+(r.pausedTotal||0)+r.durationMs;setPomo({...r,overAt:endAt,overAs:r.phase==="focus"?"focus":"break"});
    const nl=pNextLabel(r);
    if(r.phase==="focus")pNotify(nl==="Finish block"?pLabel(r.what,"")+": last round done. Tap Finish block.":"Focus round done. Tap Start break when you're ready.",nl==="Finish block"?"end":"break");
    else pNotify(nl==="Finish block"?"Break over. Tap Finish block.":"Break over. Tap Start focus when you're ready.","focus");}
  // restart the current focus round: the time spent in it is thrown away, never logged
  let pRestartArm=0;
  function pRestart(btn){const r=pRun();if(!r||r.phase!=="focus"||!r.startedAt)return;
    if(Date.now()-pRestartArm>3000){pRestartArm=Date.now();if(btn){btn.textContent="Tap again to restart";btn.classList.add("arm");}setTimeout(()=>{if(btn&&btn.isConnected){btn.textContent="↺ Restart round";btn.classList.remove("arm");}},3000);return;}
    pRestartArm=0;const now=Date.now(),lost=Math.max(0,(r.pausedAt||now)-r.startedAt-(r.pausedTotal||0)+(r.overAt?0:0));
    const thrown=r.overAt?now-r.startedAt-(r.pausedTotal||0):lost;
    setPomo({...r,startedAt:now,pausedAt:null,pausedTotal:0,overAt:null,overAs:null,...(r.block?{block:{...r.block,end:r.block.end+thrown},durationMs:Math.min(BLK_FOCUS*60000,r.block.end+thrown-now)}:{})});
    if(thrown>=60000)addEntry(r.date,{kind:"break",ref:"break",label:"Break (restarted round): "+pLabel(r.what,""),learning:false,start:r.startedAt,end:now,minutes:thrown/60000,paused:0});
    toast("Round restarted. "+dur(thrown/60000)+" saved as a break, not focus");say("Round restarted");}
  const PH_NAME={focus:"Focus",short:"Short break",long:"Long break"};
  async function setPomo(body){state.timers={...state.timers,pomo:body};render();try{await store.set("timers/pomo",body);}catch(e){fail(e);}}
  function pStartFor(o){const c=pCfg(),p=P(),r=pRun();
    if(r&&r.phase==="focus"&&r.startedAt){if(r.what===o.what&&!o.force){openPomoFull();return;}pLogFocus(r);}
    const now=Date.now(), blk=o.minutes?{total:o.minutes,end:now+o.minutes*60000}:null;
    setPomo({...p,cfg:c,phase:"focus",round:1,startedAt:now,pausedAt:null,pausedTotal:0,durationMs:blk?Math.min(BLK_FOCUS,o.minutes)*60000:pDurMs("focus",c),block:blk,what:o.what,label:o.label||"",note:"",date:iso(new Date())});
    say("Focus started: "+(o.label||""));openPomoFull();}
  const BLK_FOCUS=50, BLK_BREAK=10;
  // "Break in X min": shown once 80% of a focus round has passed, in whole minutes only
  function pBreakIn(r){if(!r||r.overAt||r.phase!=="focus"||!r.startedAt||!r.durationMs)return null;const el2=pElapsed(r);if(el2<r.durationMs*0.8)return null;const m=Math.max(1,Math.ceil((r.durationMs-el2)/60000));
    const last=r.block&&(r.block.end-Date.now()-(r.durationMs-el2))<(BLK_BREAK+5)*60000;return (last?"Block ends in ":"Break in ")+m+" min";}
  function pWhatOpts(){
    const ts=tasksOn(iso(new Date())).filter(t=>!t.done);
    const list=[["other","Other work"],...BLOCKS.map(b=>[b.id,b.name]),["other-learning","Other learning"],...ts.map(t=>["tasks:"+t.id,"Task: "+t.title])];
    const cur=P().what;if(cur&&!list.some(x=>x[0]===cur))list.push([cur,P().label||"Current focus"]);return list;
  }
  function pLabel(what,note){const o=pWhatOpts().find(x=>x[0]===what);const base=o?o[1].replace(/^Task: /,""):"Focus";return note?base+": "+note:base;}
  function pDurMs(phase,c){return (phase==="focus"?(c.mode==="up"?0:c.focus):phase==="short"?c.short:c.long)*60000;}
  function pStart(){const c=pCfg(),p=P();
    if("Notification" in window&&Notification.permission==="default"){try{Notification.requestPermission();}catch(e){}}
    setPomo({...p,cfg:c,phase:"focus",round:p.round&&p.phase==null&&p.round<=c.rounds?p.round:1,startedAt:Date.now(),pausedAt:null,pausedTotal:0,durationMs:pDurMs("focus",c),what:p.what||"other",note:p.note||"",date:iso(new Date())});
    say("Focus started");}
  function pExtend(min){const r=pRun();if(!r||!r.durationMs)return;setPomo(r.overAt?{...r,overAt:null,overAs:null,durationMs:pElapsed(r)+min*60000}:{...r,durationMs:r.durationMs+min*60000});toast("+"+min+" min added");say(min+" minutes added");}
  function extBtns(cls){const r=pRun();if(!r||!r.durationMs)return null;return el("div",{class:"pext",role:"group","aria-label":"Add time to this "+(r.phase==="focus"?"focus":"break")},
    ...[1,5,10].map(m=>el("button",{type:"button",class:cls,"aria-label":"Add "+m+" minute"+(m>1?"s":""),text:"+"+m+" min",onclick:()=>pExtend(m)})));}
  function pPause(){const r=pRun();if(!r||r.pausedAt||!r.startedAt)return;setPomo({...r,pausedAt:Date.now()});}
  function pResume(){const r=pRun();if(!r)return;if(!r.startedAt){setPomo({...r,startedAt:Date.now(),pausedAt:null,pausedTotal:0,date:iso(new Date())});return;}
    if(!r.pausedAt)return;const pz=Date.now()-r.pausedAt;setPomo({...r,pausedTotal:(r.pausedTotal||0)+pz,pausedAt:null,...(r.block?{block:{...r.block,end:r.block.end+pz}}:{})});}
  function pLogFocus(r,endAt){
    const c=pCfg(); if(!c.log||r.phase!=="focus"||!r.startedAt)return 0;
    let ms=pElapsed(r); if(r.durationMs)ms=Math.min(ms,r.durationMs); const minutes=ms/60000; if(minutes<1)return 0;
    const start=r.startedAt, end=endAt||(r.pausedAt||Date.now());
    if(itemsRaw(r.date).some(x=>sessionsOf(x).some(se=>se.start===start)))return minutes; // already logged on another device
    const learning=r.what==="block5"||r.what.startsWith("eng:")||r.what==="other-learning"||r.what.startsWith("todo:learning:")||(r.what.startsWith("tasks:")&&(state.tasks[r.what.slice(6)]||{}).cat==="learning");
    addEntry(r.date,{kind:"pomo",ref:r.what,label:pLabel(r.what,r.note),learning,start,end,minutes,paused:(r.pausedTotal||0)/60000,note:r.note||""});
    if(r.what.startsWith("todo:")){const [,src,ref,tid]=r.what.split(":"),owner=state[src]&&state[src][ref];
      if(owner){const patch={todos:addSpent(owner.todos,tid,minutes)};
        state[src][ref]={...owner,...patch};store.update(src+"/"+ref,patch).catch(fail);}}
    if(r.what.startsWith("eng:")){const sid=r.what.slice(4);if(!engSteps(r.date)[sid])toggleStep(r.date,sid);}
    if(r.what.startsWith("tasks:")){const id=r.what.slice(6),t=state.tasks[id];if(t){const spent=Math.round(((t.spent||0)+minutes)*10)/10;state.tasks[id]={...t,spent};store.update("tasks/"+id,{spent}).catch(fail);}}
    return minutes;
  }
  function pNotify(msg,kind){bell(kind||"focus");toast(msg);say(msg);try{if("Notification" in window&&Notification.permission==="granted"&&document.visibilityState!=="visible")new Notification("Sprint Board",{body:msg,tag:"pomo"});}catch(e){}}
  async function pNext(natural){
    const r=pRun(); if(!r||pomoEnding)return; pomoEnding=true;
    try{
      const c=pCfg(); let next, round=r.round||1, msg, m=0; const now0=Date.now();
      if(r.phase==="focus"){m=r.overAt?(r.overAs==="focus"?pLogFocus({...r,durationMs:0},now0):pLogFocus(r,r.overAt)):pLogFocus(r,natural&&r.durationMs?r.startedAt+(r.pausedTotal||0)+r.durationMs:null);}
      else if(r.overAt&&r.overAs==="focus"){m=pLogFocus({...r,phase:"focus",startedAt:r.overAt,pausedAt:null,pausedTotal:0,durationMs:0},now0);}
      if(r.block){
        const now=Date.now(), left=r.block.end-now, name=pLabel(r.what,"");
        if(r.phase==="focus"){
          if(left>=(BLK_BREAK+5)*60000){await setPomo({...r,cfg:c,phase:"short",startedAt:now,pausedAt:null,pausedTotal:0,overAt:null,overAs:null,durationMs:Math.min(BLK_BREAK*60000,left-5*60000),date:iso(new Date())});toast((m?dur(m)+" of focus logged. ":"")+"Break started. Stand up, drink water, rest your eyes.");}
          else{await setPomo({cfg:c,what:r.what,note:r.note,phase:null,round:1});woo();toast(name+" done. "+(m?dur(m)+" of focus logged.":""));}
        }else{
          if(left>=5*60000){await setPomo({...r,cfg:c,phase:"focus",round:round+1,startedAt:now,pausedAt:null,pausedTotal:0,overAt:null,overAs:null,durationMs:Math.min(BLK_FOCUS*60000,left),date:iso(new Date())});toast((m?dur(m)+" of extra focus logged. ":"")+"Focus round "+(round+1)+" started.");}
          else{await setPomo({cfg:c,what:r.what,note:r.note,phase:null,round:1});woo();toast(name+" done."+(m?" "+dur(m)+" of extra focus logged.":""));}
        }
        return;
      }
      if(r.phase==="focus"){
        next=round>=c.rounds?"long":"short";
        msg=(m?dur(m)+" of focus"+(c.log?" logged":"")+". ":"")+(next==="long"?"Take a long break.":"Take a short break.");
      }else{next="focus";round=r.phase==="long"?1:round+1;msg=r.phase==="long"?"Break over. New set: focus round 1.":"Break over. Focus round "+round+".";}
      await setPomo({...r,cfg:c,phase:next,round,startedAt:Date.now(),pausedAt:null,pausedTotal:0,overAt:null,overAs:null,durationMs:pDurMs(next,c),date:iso(new Date())});
      toast(msg);
    }finally{pomoEnding=false;}
  }
  async function pStop(){const r=pRun();if(!r)return;const now0=Date.now();
    const m=r.phase==="focus"?(r.overAt?(r.overAs==="focus"?pLogFocus({...r,durationMs:0},now0):pLogFocus(r,r.overAt)):pLogFocus(r)):(r.overAt&&r.overAs==="focus"?pLogFocus({...r,phase:"focus",startedAt:r.overAt,pausedAt:null,pausedTotal:0,durationMs:0},now0):0);
    await setPomo({cfg:pCfg(),what:r.what,note:r.note,phase:null,round:1});toast(m?dur(m)+" of focus logged":"Focus timer stopped");}
  function pSaveCfg(patch){const p=P();const c={...pCfg(),...patch};const r=pRun();
    let body={...p,cfg:c};
    if(r&&!r.startedAt)body.durationMs=pDurMs(r.phase,c); // waiting phase picks up the new length
    if(r&&r.startedAt&&r.phase==="focus"&&"mode" in patch){const el2=pElapsed(r);body.durationMs=c.mode==="up"?0:Math.max(c.focus*60000,el2+60000);}
    setPomo(body);}
  function pTodayStats(){const d=iso(new Date());const it=itemsOn(d).filter(x=>x.kind==="pomo");let n=0,m=0;it.forEach(x=>sessionsOf(x).forEach(se=>{n++;m+=Number(se.minutes||0);}));return {n,m};}
  function numField(label,key,min,max,unit){
    const c=pCfg();const inp=el("input",{type:"number",min:String(min),max:String(max),step:"1",value:String(c[key]),"aria-label":label+" in "+unit,class:"tnum"});
    const commit=()=>{let v=Math.round(Number(inp.value));if(!isFinite(v))v=c[key];v=Math.min(max,Math.max(min,v));inp.value=String(v);if(v!==pCfg()[key])pSaveCfg({[key]:v});};
    inp.addEventListener("change",commit);inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();commit();}});
    const bump=d=>{inp.value=String(Math.min(max,Math.max(min,(Number(inp.value)||0)+d)));commit();};
    return el("div",{class:"pf"},el("span",{class:"label",text:label}),el("div",{class:"pf-row"},
      el("button",{type:"button",class:"mini","aria-label":"Less "+label,text:"−",onclick:()=>bump(-1)}),inp,el("span",{class:"hint",text:unit}),
      el("button",{type:"button",class:"mini","aria-label":"More "+label,text:"+",onclick:()=>bump(1)})));
  }
  const PT_ACC={red:["#D92D3A","#EE3442"],ember:["#C2410C","#FF7A3D"],ocean:["#1D4ED8","#7AA7FF"],teal:["#0F766E","#2DD4BF"],plum:["#7C3AED","#B69CFA"],rose:["#BE185D","#F47AB6"],graphite:["#2B2D33","#E2E4E9"]};
  function pTheme(){const c=pCfg(),r=document.documentElement,pageDark=r.getAttribute("data-theme")==="dark"||(!r.getAttribute("data-theme")&&matchMedia("(prefers-color-scheme: dark)").matches);
    const base=c.tbase==="dark"?"dark":c.tbase==="light"?"light":(pageDark?"light":"dark");return {base,acc:c.taccent||""};}
  function applyPT(){const t=pTheme();["pomoFab","pomoPanel","pomoFull"].forEach(id=>{const e=document.getElementById(id);if(!e)return;e.setAttribute("data-tbase",t.base);if(t.acc)e.setAttribute("data-taccent",t.acc);else e.removeAttribute("data-taccent");});}
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>applyPT());
  function renderPomo(){
    applyPT();
    renderPomoFull();
    const fab=document.getElementById("pomoFab"), pan=document.getElementById("pomoPanel"); if(!fab)return;
    const r=pRun(), c=pCfg();
    fab.setAttribute("aria-expanded",String(pomoOpen));
    fab.classList.toggle("on",!!(r&&r.startedAt&&!r.pausedAt));
    rc(fab,el("span",{"aria-hidden":"true",text:"⏲"}),el("span",{"data-pclock":"1",text:r&&r.startedAt?pClock(r):r?PH_NAME[r.phase]:"Focus"}));
    fab.setAttribute("aria-label",r?"Focus timer: "+PH_NAME[r.phase]+(r.startedAt?", "+pClock(r)+(r.durationMs?" left":""):" ready"):"Open focus timer");
    document.title=(r&&r.startedAt&&!r.pausedAt?"("+pClock(r)+") ":"")+"Milestone 1 Sprint Board";
    pan.hidden=!pomoOpen; if(!pomoOpen)return;
    if(pan.contains(document.activeElement)&&/INPUT|SELECT/.test(document.activeElement.tagName)){updPomoClock();return;} // don't redraw under the cursor
    const phase=r?r.phase:"focus", running=r&&r.startedAt&&!r.pausedAt, paused=r&&r.startedAt&&r.pausedAt;
    const pct=r&&r.durationMs?Math.min(100,pElapsed(r)/r.durationMs*100):0;
    const what=el("select",{"aria-label":"What are you focusing on"},...pWhatOpts().map(([v,t])=>el("option",{value:v,text:t})));what.value=(P().what)||"other";
    what.onchange=()=>setPomo({...P(),what:what.value});
    const note=el("input",{type:"text",placeholder:"Note (optional)","aria-label":"Focus note",value:P().note||""});
    note.addEventListener("change",()=>setPomo({...P(),note:note.value.trim()}));
    const st=pTodayStats();
    const btns=[];
    if(!r||!r.startedAt)btns.push(el("button",{class:"btn",type:"button",text:r?"Start "+PH_NAME[phase].toLowerCase():"Start focus",onclick:r?pResume:pStart}));
    if(r&&r.overAt)btns.push(el("button",{class:"btn",type:"button",text:pNextLabel(r),onclick:()=>pNext(false)}));
    else if(running)btns.push(el("button",{class:"btn ghost",type:"button",text:"Pause",onclick:pPause}));
    if(paused)btns.push(el("button",{class:"btn",type:"button",text:"Resume",onclick:pResume}));
    if(r&&phase==="focus"&&r.startedAt&&!r.durationMs)btns.push(el("button",{class:"btn ghost",type:"button",text:"Take a break",onclick:()=>pNext(false)}));
    if(r&&!r.overAt)btns.push(el("button",{class:"mini",type:"button",text:phase==="focus"?"Skip to break":"Skip break",onclick:()=>pNext(false)}));
    if(r&&phase==="focus"&&r.startedAt)btns.push(el("button",{class:"mini pf-rst",type:"button",text:"↺ Restart round",title:"Start this round again. The time spent in it is not counted as focus",onclick:e=>pRestart(e.currentTarget)}));
    if(r)btns.push(el("button",{class:"mini danger",type:"button",text:"Stop",onclick:pStop}));
    const logBox=el("input",{type:"checkbox",id:"pomoLog"});logBox.checked=c.log;logBox.onchange=()=>pSaveCfg({log:logBox.checked});
    rc(pan,
      el("div",{class:"pomo-head"},el("h2",{id:"pomoTitle",text:"Focus timer"}),el("div",{style:"display:flex;gap:6px"},el("button",{class:"mini pf-open",type:"button",text:"\u26F6 Full screen","aria-label":"Open the focus timer in full screen and keep the screen on",onclick:openPomoFull}),el("button",{class:"mini",type:"button",text:"Close",onclick:()=>{pomoOpen=false;renderPomo();fab.focus();}}))),
      el("div",{class:"pomo-face "+phase},
        el("span",{class:"label",text:PH_NAME[phase]+(phase==="focus"?" · round "+((r&&r.round)||1)+" of "+(r&&r.block?Math.max(1,Math.round(r.block.total/60)):c.rounds):"")}),
        el("span",{class:"pomo-clock num",role:"timer","aria-live":"off","data-pclock":"1",text:r&&r.startedAt?pClock(r):(phase==="focus"&&c.mode==="up"?"00:00":String(phase==="focus"?c.focus:phase==="short"?c.short:c.long).padStart(2,"0")+":00")}),
        el("div",{class:"track"},el("div",{class:"fill","data-pfill":"1",style:"width:"+pct+"%"})),
        el("span",{class:"hint",text:paused?"Paused":r&&r.block?(phase==="focus"?"Round "+(r.round||1)+" of this block · 50 min focus, 10 min break":"Break inside this block"):c.mode==="up"&&phase==="focus"?"Counting up until you take a break":"Counting down"}),
        el("span",{class:"pf-brk","data-pbrk":"1",hidden:pBreakIn(r)?null:"",text:pBreakIn(r)||""})),
      el("div",{class:"pomo-btns"},...btns),
      el("div",{class:"sh-sec"},el("span",{class:"label",id:"pblkLbl",text:"Focus block"}),
        el("div",{class:"pomo-btns",role:"group","aria-labelledby":"pblkLbl"},...[2,3,4].map(hh=>el("button",{type:"button",class:"btn ghost",text:hh+" h","aria-label":"Start a "+hh+" hour focus block on "+pLabel(P().what||"other",""),onclick:()=>{const w=P().what||"other";pStartFor({what:w,label:pLabel(w,""),minutes:hh*60,force:true});}}))),
        el("span",{class:"hint",text:"50 min focus and 10 min break, until the block ends. Pick what you work on below first."})),
      ...[pOverUI(r,false)].filter(Boolean),
      extBtns("mini pext-b"),
      el("div",{class:"sh-sec"},el("span",{class:"label",text:"Working on"}),what,note),
      el("div",{class:"sh-sec"},el("span",{class:"label",id:"pmode",text:"Timer"}),el("div",{class:"seg",role:"group","aria-labelledby":"pmode"},
        el("button",{type:"button","aria-pressed":String(c.mode==="down"),text:"Count down",onclick:()=>pSaveCfg({mode:"down"})}),
        el("button",{type:"button","aria-pressed":String(c.mode==="up"),text:"Count up",onclick:()=>pSaveCfg({mode:"up"})}))),
      el("label",{class:"pomo-check"},logBox,el("span",{},el("b",{text:"Add focus time to Time entries"}),el("span",{class:"hint",text:"Counts toward your hours worked. Breaks are never logged."}))),
      el("details",{class:"edit-box",...(pomoCfgOpen?{open:""}:{}),ontoggle:e=>{pomoCfgOpen=e.currentTarget.open;}},el("summary",{text:"Lengths and breaks"}),
        el("div",{class:"pf-grid"},c.mode==="down"?numField("Focus","focus",1,180,"min"):null,numField("Short break","short",1,60,"min"),numField("Long break","long",1,90,"min"),numField("Long break after","rounds",1,12,"rounds")),
        null),
      (()=>{const t=pTheme(),cb=c.tbase||"auto";
        return el("details",{class:"edit-box",...(pomoLookOpen?{open:""}:{}),ontoggle:e=>{pomoLookOpen=e.currentTarget.open;}},el("summary",{text:"Timer look"}),
          el("div",{class:"sh-sec",style:"margin-top:10px"},el("span",{class:"label",id:"ptBase",text:"Base"}),el("div",{class:"seg",role:"group","aria-labelledby":"ptBase"},
            ...[["auto","Opposite of app"],["dark","Dark"],["light","Light"]].map(([v,n])=>el("button",{type:"button","aria-pressed":String(cb===v),text:n,onclick:()=>pSaveCfg({tbase:v==="auto"?null:v})})))),
          el("div",{class:"sh-sec",style:"margin-top:10px"},el("span",{class:"label",id:"ptAcc",text:"Colour"}),el("div",{class:"pt-sw",role:"radiogroup","aria-labelledby":"ptAcc"},
            el("button",{type:"button",role:"radio",class:"pt-dot","aria-checked":String(!c.taccent),"aria-label":"Same as app",title:"Same as app",text:"App",onclick:()=>pSaveCfg({taccent:null})}),
            ...Object.entries(PT_ACC).map(([k,v])=>el("button",{type:"button",role:"radio",class:"pt-dot","aria-checked":String(c.taccent===k),"aria-label":k[0].toUpperCase()+k.slice(1),title:k,style:"background:"+(t.base==="dark"?v[1]:v[0])+";border-color:transparent",onclick:()=>pSaveCfg({taccent:k})})))));})(),
      el("p",{class:"hint",text:st.n?"Today: "+st.n+" focus session"+(st.n>1?"s":"")+", "+dur(st.m)+" logged.":"No focus sessions logged today yet."}));
  }
  // ---------- focus timer full screen: giant clock, keeps the screen awake (Wake Lock) ----------
  let pFullOpen=false, pLock=null, pLockOk=null;
  async function pWake(on){try{
      if(on){if(!("wakeLock" in navigator)){pLockOk=false;return;}if(!pLock){pLock=await navigator.wakeLock.request("screen");pLockOk=true;pLock.addEventListener("release",()=>{pLock=null;});}}
      else if(pLock){await pLock.release();pLock=null;}
    }catch(e){pLockOk=false;}
    renderPomoFull();}
  async function openPomoFull(){pFullOpen=true;const ov=document.getElementById("pomoFull");ov.hidden=false;document.body.classList.add("pfull-on");
    try{if(document.documentElement.requestFullscreen&&!document.fullscreenElement)await document.documentElement.requestFullscreen({navigationUI:"hide"});}catch(e){}
    await pWake(true);renderPomoFull();setTimeout(()=>{const b=ov.querySelector(".pf-main");if(b)b.focus();},0);}
  async function closePomoFull(){pFullOpen=false;document.getElementById("pomoFull").hidden=true;document.body.classList.remove("pfull-on");
    try{if(document.fullscreenElement&&document.exitFullscreen)await document.exitFullscreen();}catch(e){}
    if(!gActive())pWake(false);renderPomo();const f=document.getElementById("pomoFab");if(f)f.focus();}
  document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement&&pFullOpen)closePomoFull();});
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&pFullOpen)pWake(true);});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&pFullOpen)closePomoFull();});
  // ---------- impact ladder: this session, what it builds, where it leads ----------
  function pSessXP(r){return r&&r.phase==="focus"&&r.startedAt?Math.floor(pElapsed(r)/600000):0;}
  function pBlockLeft(r){if(!r||!r.block)return "";const now=r.pausedAt||Date.now(),ms=Math.max(0,r.block.end-now),end=new Date(r.block.end);
    return "Block: "+dur(Math.ceil(ms/60000))+" left · ends "+end.toLocaleTimeString("en",{hour:"numeric",minute:"2-digit"})+" · breaks included";}
  function pImpact(r){
    const what=r.what||"other",today=iso(new Date()),V=(state.settings&&state.settings.vision)||{};
    const L=wLevel(wTotals().xp);
    let b2="Today",sub2=dur(focusMin(today))+" / 3h",p2=Math.min(1,focusMin(today)/180),isClient=false;
    if(what.startsWith("tasks:")){const t=state.tasks[what.slice(6)];if(t){const sp=sprintFor(t.date),same=leafTasks().filter(x=>x.cat===t.cat&&!x.cut&&x.date>=sp.start&&x.date<=sp.end),dn=same.filter(x=>x.done).length;
      b2=(CAT_NAME[t.cat]||"Tasks")+" · Sprint "+sp.n;sub2=dn+" / "+same.length;p2=same.length?dn/same.length:0;isClient=t.cat==="client";}}
    else if(what.startsWith("todo:")){const [,src,ref]=what.split(":"),o=state[src]&&state[src][ref];if(o){const td=o.todos||[],dn=td.filter(x=>x.done).length;b2=o.name||"Project";
      sub2=dn+" / "+td.length+(o.due?" · "+fmt(o.due,{day:"numeric",month:"short"}):"");p2=td.length?dn/td.length:0;isClient=o.group==="client";}}
    else if(what.startsWith("eng:")){b2="English";sub2=engCount(today)+" / 5 steps";p2=engCount(today)/5;}
    else{const bk=BLOCKS.find(x=>x.id===what);if(bk)b2=bk.name;}
    const pp=Object.values(state.projects).filter(x=>x.group!=="client"),ppd=pp.filter(x=>x.status==="done").length,p3=pp.length?ppd/pp.length:0;
    const left=Math.max(0,Math.round((parse(END)-parse(today))/864e5));
    const goal=[V.clients?V.clients+" clients":null,V.income||null].filter(Boolean).join(" · ")||V.why||null;
    const stop=(cls,v,sub,label)=>el("div",{class:"pf-stop "+cls,title:label},el("span",{class:"pf-dot"}),v,el("span",{class:"s",text:sub}));
    return el("div",{class:"pf-imp",role:"group","aria-label":"This session: "+pSessXP(r)+" XP. Builds "+b2+", "+sub2+". Leads to "+(goal||"your goal")+", "+ppd+" of "+pp.length+" portfolio pieces, "+left+" days left."},
      el("div",{class:"pf-line","aria-hidden":"true"},el("i",{},el("b",{style:"width:"+Math.round(p2*100)+"%"})),el("i",{},el("b",{style:"width:"+Math.round(p3*100)+"%"}))),
      stop("now",el("span",{class:"v","data-pxp":"1",text:"+"+pSessXP(r)+" XP"}),"Lv "+L.lv+" · "+L.name,"This session: 1 XP every 10 focused minutes"),
      stop("mid",el("span",{class:"v",text:b2}),sub2,"What this session builds"),
      stop("goal",goal?el("span",{class:"v",text:goal}):el("button",{type:"button",class:"v pf-set",text:"Set your goal",onclick:()=>{closePomoFull();setPage("settings");setTimeout(()=>{const i=document.getElementById("visWhy");if(i)i.focus();},200);}}),
        (isClient?"funds · ":"")+ppd+"/"+pp.length+" · "+left+"d left","Where it leads"));
  }
  function renderVision(){
    const f=document.getElementById("visForm");if(!f||f.contains(document.activeElement))return;const V=(state.settings&&state.settings.vision)||{};
    f.visWhy.value=V.why||"";f.visClients.value=V.clients||"";f.visIncome.value=V.income||"";}
  document.getElementById("visForm").addEventListener("submit",async e=>{e.preventDefault();const f=e.currentTarget;
    const v={why:f.visWhy.value.trim(),clients:f.visClients.value.trim(),income:f.visIncome.value.trim(),at:Date.now()};
    state.settings={...state.settings,vision:v};toast("Goal saved. You'll see it in the focus timer");
    if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return;}try{await store.set("settings/vision",v);}catch(err){fail(err);}});
  // ---------- prayer times: Egyptian General Authority of Survey (Fajr 19.5°, Isha 17.5°, Asr Shafi'i), Cairo time ----------
  const PRAY_CITIES={cairo:["Cairo",30.0444,31.2357],giza:["Giza",30.0131,31.2089],shibin:["Shibin El Kom",30.5526,31.0124],alex:["Alexandria",31.2001,29.9187],tanta:["Tanta",30.7865,31.0004],mansoura:["Mansoura",31.0409,31.3785]};
  const PRAY_NAMES=[["fajr","Fajr"],["sunrise","Sunrise"],["dhuhr","Dhuhr"],["asr","Asr"],["maghrib","Maghrib"],["isha","Isha"]];
  function prayCfg(){const c=(state.settings&&state.settings.prayer)||{};return {city:PRAY_CITIES[c.city]?c.city:"cairo"};}
  function cairoYMD(ms){const p=new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Cairo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(ms));const [y,m,d]=p.split("-").map(Number);return [y,m,d];}
  const prayCache={};
  function prayTimesFor(ymd,cityKey){const k=cityKey+"|"+ymd.join("-");if(prayCache[k])return prayCache[k];
    try{const [,lat,lng]=PRAY_CITIES[cityKey],P=adhan.CalculationMethod.Egyptian();P.madhab=adhan.Madhab.Shafi;P.methodAdjustments={...P.methodAdjustments,dhuhr:0};
      const t=new adhan.PrayerTimes(new adhan.Coordinates(lat,lng),new Date(ymd[0],ymd[1]-1,ymd[2],12),P),o={};PRAY_NAMES.forEach(([n])=>o[n]=t[n].getTime());return prayCache[k]=o;}catch(e){return null;}}
  const prayFmt=ms=>new Date(ms).toLocaleTimeString("en-US",{timeZone:"Africa/Cairo",hour:"numeric",minute:"2-digit"});
  function prayNext(now,city){const today=cairoYMD(now),t=prayTimesFor(today,city);if(!t)return null;
    for(const [n,l] of PRAY_NAMES){if(n==="sunrise")continue;if(t[n]>now)return {key:n,label:l,at:t[n],times:t,day:today};}
    const tm=cairoYMD(now+86400000),t2=prayTimesFor(tm,city);return t2?{key:"fajr",label:"Fajr",at:t2.fajr,times:t,day:today,tomorrow:true}:null;}
  function prayIn(ms){const m=Math.max(0,Math.ceil(ms/60000));if(m<60)return m+" min";const h=Math.floor(m/60);return h+"h"+(m%60?" "+(m%60)+"m":"");}
  let prayLastKey=null,prayRung={};
  function renderPrayer(){
    const box=document.getElementById("praySec");if(!box)return;const now=Date.now(),cfg=prayCfg(),nx=prayNext(now,cfg.city);
    if(!nx){rc(box,el("p",{class:"hint",text:"Prayer times couldn't be calculated on this device."}));return;}
    const key=nx.key+nx.at+cfg.city+(box.dataset.min||"");const minNow=Math.ceil((nx.at-now)/60000);
    if(box.dataset.k===nx.key+nx.at+cfg.city&&box.dataset.min===String(minNow))return;
    box.dataset.k=nx.key+nx.at+cfg.city;box.dataset.min=String(minNow);
    const hijri=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura",{day:"numeric",month:"long",year:"numeric",timeZone:"Africa/Cairo"}).format(new Date(now));
    const city=el("select",{class:"pr-city","aria-label":"City for prayer times",onchange:async e=>{const v={city:e.target.value,at:Date.now()};state.settings={...state.settings,prayer:v};box.dataset.k="";renderPrayer();if(db){try{await store.set("settings/prayer",v);}catch(err){fail(err);}}}},
      ...Object.entries(PRAY_CITIES).map(([k,[n]])=>{const o=el("option",{value:k,text:n});if(k===cfg.city)o.selected=true;return o;}));
    const cur=(()=>{let c=null;for(const [n] of PRAY_NAMES){if(nx.times[n]<=now)c=n;}return nx.tomorrow?"isha":c;})();
    rc(box,
      el("div",{class:"pr-head"},el("h2",{id:"prayH",class:"label",text:"Next prayer"}),el("span",{class:"pr-date hint",text:hijri}),city),
      el("div",{class:"pr-next"},el("b",{class:"pr-name",text:nx.label}),el("span",{class:"pr-at num",text:prayFmt(nx.at)+(nx.tomorrow?" tomorrow":"")}),el("span",{class:"pr-in",text:"in "+prayIn(nx.at-now)})),
      el("div",{class:"pr-row"},...PRAY_NAMES.map(([n,l])=>el("div",{class:"pr-cell"+(n===nx.key&&!nx.tomorrow?" next":"")+(n===cur?" now":"")+(n==="sunrise"?" sun":"")},el("span",{text:l}),el("b",{class:"num",text:prayFmt(nx.times[n])})))));
  }
  // at the exact time: sound and a short message, once per prayer
  setInterval(()=>{try{const now=Date.now(),cfg=prayCfg(),t=prayTimesFor(cairoYMD(now),cfg.city);if(t)for(const [n,l] of PRAY_NAMES){if(n==="sunrise")continue;const k=n+t[n];if(now>=t[n]&&now-t[n]<90000&&!prayRung[k]){prayRung[k]=1;bell("prayer");toast("حان الآن موعد أذان "+({fajr:"الفجر",dhuhr:"الظهر",asr:"العصر",maghrib:"المغرب",isha:"العشاء"})[n]);}}renderPrayer();}catch(e){}},20000);
  // ---------- صلاة: الصلوات، قيام الليل، الأذكار، آية اليوم وحديث قدسي ----------
  const AYAT=[{"t":"فَٱذۡكُرُونِيٓ أَذۡكُرۡكُمۡ وَٱشۡكُرُواْ لِي وَلَا تَكۡفُرُونِ ﴿١٥٢﴾","s":"البقرة","a":"١٥٢"},{"t":"وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌۖ أُجِيبُ دَعۡوَةَ ٱلدَّاعِ إِذَا دَعَانِۖ فَلۡيَسۡتَجِيبُواْ لِي وَلۡيُؤۡمِنُواْ بِي لَعَلَّهُمۡ يَرۡشُدُونَ ﴿١٨٦﴾","s":"البقرة","a":"١٨٦"},{"t":"فَإِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرًا ﴿٥﴾ إِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرٗا ﴿٦﴾","s":"الشرح","a":"٥-٦"},{"t":"ٱلَّذِينَ ءَامَنُواْ وَتَطۡمَئِنُّ قُلُوبُهُم بِذِكۡرِ ٱللَّهِۗ أَلَا بِذِكۡرِ ٱللَّهِ تَطۡمَئِنُّ ٱلۡقُلُوبُ ﴿٢٨﴾","s":"الرعد","a":"٢٨"},{"t":"وَمَن يَتَّقِ ٱللَّهَ يَجۡعَل لَّهُۥ مَخۡرَجٗا ﴿٢﴾","s":"الطلاق","a":"٢"},{"t":"وَيَرۡزُقۡهُ مِنۡ حَيۡثُ لَا يَحۡتَسِبُۚ وَمَن يَتَوَكَّلۡ عَلَى ٱللَّهِ فَهُوَ حَسۡبُهُۥٓۚ إِنَّ ٱللَّهَ بَٰلِغُ أَمۡرِهِۦۚ قَدۡ جَعَلَ ٱللَّهُ لِكُلِّ شَيۡءٖ قَدۡرٗا ﴿٣﴾","s":"الطلاق","a":"٣"},{"t":"وَلَا تَهِنُواْ وَلَا تَحۡزَنُواْ وَأَنتُمُ ٱلۡأَعۡلَوۡنَ إِن كُنتُم مُّؤۡمِنِينَ ﴿١٣٩﴾","s":"آل عمران","a":"١٣٩"},{"t":"وَٱلَّذِينَ جَٰهَدُواْ فِينَا لَنَهۡدِيَنَّهُمۡ سُبُلَنَاۚ وَإِنَّ ٱللَّهَ لَمَعَ ٱلۡمُحۡسِنِينَ ﴿٦٩﴾","s":"العنكبوت","a":"٦٩"},{"t":"۞قُلۡ يَٰعِبَادِيَ ٱلَّذِينَ أَسۡرَفُواْ عَلَىٰٓ أَنفُسِهِمۡ لَا تَقۡنَطُواْ مِن رَّحۡمَةِ ٱللَّهِۚ إِنَّ ٱللَّهَ يَغۡفِرُ ٱلذُّنُوبَ جَمِيعًاۚ إِنَّهُۥ هُوَ ٱلۡغَفُورُ ٱلرَّحِيمُ ﴿٥٣﴾","s":"الزمر","a":"٥٣"},{"t":"إِنَّنِيٓ أَنَا ٱللَّهُ لَآ إِلَٰهَ إِلَّآ أَنَا۠ فَٱعۡبُدۡنِي وَأَقِمِ ٱلصَّلَوٰةَ لِذِكۡرِيٓ ﴿١٤﴾","s":"طه","a":"١٤"},{"t":"وَٱسۡتَعِينُواْ بِٱلصَّبۡرِ وَٱلصَّلَوٰةِۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى ٱلۡخَٰشِعِينَ ﴿٤٥﴾","s":"البقرة","a":"٤٥"},{"t":"يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُواْ ٱسۡتَعِينُواْ بِٱلصَّبۡرِ وَٱلصَّلَوٰةِۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ ﴿١٥٣﴾","s":"البقرة","a":"١٥٣"},{"t":"وَمِنَ ٱلَّيۡلِ فَتَهَجَّدۡ بِهِۦ نَافِلَةٗ لَّكَ عَسَىٰٓ أَن يَبۡعَثَكَ رَبُّكَ مَقَامٗا مَّحۡمُودٗا ﴿٧٩﴾","s":"الإسراء","a":"٧٩"},{"t":"إِنَّ نَاشِئَةَ ٱلَّيۡلِ هِيَ أَشَدُّ وَطۡـٔٗا وَأَقۡوَمُ قِيلًا ﴿٦﴾","s":"المزمل","a":"٦"},{"t":"كَانُواْ قَلِيلٗا مِّنَ ٱلَّيۡلِ مَا يَهۡجَعُونَ ﴿١٧﴾ وَبِٱلۡأَسۡحَارِ هُمۡ يَسۡتَغۡفِرُونَ ﴿١٨﴾","s":"الذاريات","a":"١٧-١٨"},{"t":"تَتَجَافَىٰ جُنُوبُهُمۡ عَنِ ٱلۡمَضَاجِعِ يَدۡعُونَ رَبَّهُمۡ خَوۡفٗا وَطَمَعٗا وَمِمَّا رَزَقۡنَٰهُمۡ يُنفِقُونَ ﴿١٦﴾","s":"السجدة","a":"١٦"},{"t":"يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُواْ ٱذۡكُرُواْ ٱللَّهَ ذِكۡرٗا كَثِيرٗا ﴿٤١﴾ وَسَبِّحُوهُ بُكۡرَةٗ وَأَصِيلًا ﴿٤٢﴾","s":"الأحزاب","a":"٤١-٤٢"},{"t":"لَا يُكَلِّفُ ٱللَّهُ نَفۡسًا إِلَّا وُسۡعَهَا ﴿٢٨٦﴾","s":"البقرة","a":"٢٨٦"},{"t":"يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُواْ ٱصۡبِرُواْ وَصَابِرُواْ وَرَابِطُواْ وَٱتَّقُواْ ٱللَّهَ لَعَلَّكُمۡ تُفۡلِحُونَ ﴿٢٠٠﴾","s":"آل عمران","a":"٢٠٠"},{"t":"وَقُلِ ٱعۡمَلُواْ فَسَيَرَى ٱللَّهُ عَمَلَكُمۡ وَرَسُولُهُۥ وَٱلۡمُؤۡمِنُونَۖ وَسَتُرَدُّونَ إِلَىٰ عَٰلِمِ ٱلۡغَيۡبِ وَٱلشَّهَٰدَةِ فَيُنَبِّئُكُم بِمَا كُنتُمۡ تَعۡمَلُونَ ﴿١٠٥﴾","s":"التوبة","a":"١٠٥"},{"t":"وَأَن لَّيۡسَ لِلۡإِنسَٰنِ إِلَّا مَا سَعَىٰ ﴿٣٩﴾ وَأَنَّ سَعۡيَهُۥ سَوۡفَ يُرَىٰ ﴿٤٠﴾","s":"النجم","a":"٣٩-٤٠"},{"t":"إِنَّ ٱللَّهَ لَا يُغَيِّرُ مَا بِقَوۡمٍ حَتَّىٰ يُغَيِّرُواْ مَا بِأَنفُسِهِمۡ ﴿١١﴾","s":"الرعد","a":"١١"},{"t":"قَدۡ أَفۡلَحَ ٱلۡمُؤۡمِنُونَ ﴿١﴾ ٱلَّذِينَ هُمۡ فِي صَلَاتِهِمۡ خَٰشِعُونَ ﴿٢﴾","s":"المؤمنون","a":"١-٢"},{"t":"ٱتۡلُ مَآ أُوحِيَ إِلَيۡكَ مِنَ ٱلۡكِتَٰبِ وَأَقِمِ ٱلصَّلَوٰةَۖ إِنَّ ٱلصَّلَوٰةَ تَنۡهَىٰ عَنِ ٱلۡفَحۡشَآءِ وَٱلۡمُنكَرِۗ وَلَذِكۡرُ ٱللَّهِ أَكۡبَرُۗ وَٱللَّهُ يَعۡلَمُ مَا تَصۡنَعُونَ ﴿٤٥﴾","s":"العنكبوت","a":"٤٥"},{"t":"فَإِذَا قُضِيَتِ ٱلصَّلَوٰةُ فَٱنتَشِرُواْ فِي ٱلۡأَرۡضِ وَٱبۡتَغُواْ مِن فَضۡلِ ٱللَّهِ وَٱذۡكُرُواْ ٱللَّهَ كَثِيرٗا لَّعَلَّكُمۡ تُفۡلِحُونَ ﴿١٠﴾","s":"الجمعة","a":"١٠"},{"t":"وَٱصۡبِرۡ فَإِنَّ ٱللَّهَ لَا يُضِيعُ أَجۡرَ ٱلۡمُحۡسِنِينَ ﴿١١٥﴾","s":"هود","a":"١١٥"},{"t":"إِنَّ ٱللَّهَ مَعَ ٱلَّذِينَ ٱتَّقَواْ وَّٱلَّذِينَ هُم مُّحۡسِنُونَ ﴿١٢٨﴾","s":"النحل","a":"١٢٨"},{"t":"إِنَّ ٱلَّذِينَ ءَامَنُواْ وَعَمِلُواْ ٱلصَّـٰلِحَٰتِ إِنَّا لَا نُضِيعُ أَجۡرَ مَنۡ أَحۡسَنَ عَمَلًا ﴿٣٠﴾","s":"الكهف","a":"٣٠"},{"t":"قُلۡ يَٰعِبَادِ ٱلَّذِينَ ءَامَنُواْ ٱتَّقُواْ رَبَّكُمۡۚ لِلَّذِينَ أَحۡسَنُواْ فِي هَٰذِهِ ٱلدُّنۡيَا حَسَنَةٞۗ وَأَرۡضُ ٱللَّهِ وَٰسِعَةٌۗ إِنَّمَا يُوَفَّى ٱلصَّـٰبِرُونَ أَجۡرَهُم بِغَيۡرِ حِسَابٖ ﴿١٠﴾","s":"الزمر","a":"١٠"},{"t":"وَلَنَبۡلُوَنَّكُم بِشَيۡءٖ مِّنَ ٱلۡخَوۡفِ وَٱلۡجُوعِ وَنَقۡصٖ مِّنَ ٱلۡأَمۡوَٰلِ وَٱلۡأَنفُسِ وَٱلثَّمَرَٰتِۗ وَبَشِّرِ ٱلصَّـٰبِرِينَ ﴿١٥٥﴾ ٱلَّذِينَ إِذَآ أَصَٰبَتۡهُم مُّصِيبَةٞ قَالُوٓاْ إِنَّا لِلَّهِ وَإِنَّآ إِلَيۡهِ رَٰجِعُونَ ﴿١٥٦﴾","s":"البقرة","a":"١٥٥-١٥٦"},{"t":"وَقَالَ رَبُّكُمُ ٱدۡعُونِيٓ أَسۡتَجِبۡ لَكُمۡۚ إِنَّ ٱلَّذِينَ يَسۡتَكۡبِرُونَ عَنۡ عِبَادَتِي سَيَدۡخُلُونَ جَهَنَّمَ دَاخِرِينَ ﴿٦٠﴾","s":"غافر","a":"٦٠"},{"t":"وَلَقَدۡ خَلَقۡنَا ٱلۡإِنسَٰنَ وَنَعۡلَمُ مَا تُوَسۡوِسُ بِهِۦ نَفۡسُهُۥۖ وَنَحۡنُ أَقۡرَبُ إِلَيۡهِ مِنۡ حَبۡلِ ٱلۡوَرِيدِ ﴿١٦﴾","s":"ق","a":"١٦"},{"t":"ٱدۡعُواْ رَبَّكُمۡ تَضَرُّعٗا وَخُفۡيَةًۚ إِنَّهُۥ لَا يُحِبُّ ٱلۡمُعۡتَدِينَ ﴿٥٥﴾","s":"الأعراف","a":"٥٥"},{"t":"فَإِذَا فَرَغۡتَ فَٱنصَبۡ ﴿٧﴾ وَإِلَىٰ رَبِّكَ فَٱرۡغَب ﴿٨﴾","s":"الشرح","a":"٧-٨"},{"t":"وَلَسَوۡفَ يُعۡطِيكَ رَبُّكَ فَتَرۡضَىٰٓ ﴿٥﴾","s":"الضحى","a":"٥"},{"t":"وَمَن يَتَّقِ ٱللَّهَ يَجۡعَل لَّهُۥ مِنۡ أَمۡرِهِۦ يُسۡرٗا ﴿٤﴾","s":"الطلاق","a":"٤"}];
  const QUDSI=[
    ["يا عبادي، إني حرمت الظلم على نفسي، وجعلته بينكم محرمًا، فلا تظالموا.","رواه مسلم"],
    ["أنا عند ظن عبدي بي، وأنا معه إذا ذكرني، فإن ذكرني في نفسه ذكرته في نفسي، وإن ذكرني في ملأ ذكرته في ملأ خير منهم.","متفق عليه"],
    ["وما تقرب إليّ عبدي بشيء أحب إليّ مما افترضت عليه، وما يزال عبدي يتقرب إليّ بالنوافل حتى أحبه.","رواه البخاري"],
    ["ينزل ربنا تبارك وتعالى كل ليلة إلى السماء الدنيا حين يبقى ثلث الليل الآخر، يقول: من يدعوني فأستجيب له، من يسألني فأعطيه، من يستغفرني فأغفر له.","متفق عليه"],
    ["قسمت الصلاة بيني وبين عبدي نصفين، ولعبدي ما سأل.","رواه مسلم"],
    ["كل عمل ابن آدم له إلا الصوم، فإنه لي وأنا أجزي به.","متفق عليه"],
    ["أنا أغنى الشركاء عن الشرك، من عمل عملًا أشرك فيه معي غيري تركته وشركه.","رواه مسلم"],
    ["إذا تقرب العبد إليّ شبرًا تقربت إليه ذراعًا، وإذا تقرب إليّ ذراعًا تقربت منه باعًا، وإذا أتاني يمشي أتيته هرولة.","رواه البخاري"],
    ["أعددت لعبادي الصالحين ما لا عين رأت، ولا أذن سمعت، ولا خطر على قلب بشر.","متفق عليه"],
    ["إن رحمتي سبقت غضبي.","متفق عليه"],
    ["يا ابن آدم، أنفق أُنفق عليك.","متفق عليه"],
    ["يا عبادي، كلكم ضال إلا من هديته، فاستهدوني أهدكم.","رواه مسلم"],
    ["يا ابن آدم، إنك ما دعوتني ورجوتني غفرت لك على ما كان فيك ولا أبالي.","رواه الترمذي"],
    ["المتحابون في جلالي لهم منابر من نور يغبطهم النبيون والشهداء.","رواه الترمذي"]
  ];
  const SL_PR=[["fajr","الفجر"],["dhuhr","الظهر"],["asr","العصر"],["maghrib","المغرب"],["isha","العشاء"]];
  const SL_ST=[["masjid","في المسجد"],["home","في البيت"],["missed","لم أصلِّ"]];
  const DHIKR=[["tasbih","سبحان الله"],["tahmid","الحمد لله"],["tahlil","لا إله إلا الله"],["istighfar","أستغفر الله"]];
  const arN=n=>Number(n||0).toLocaleString("ar-EG");
  function slDay(d){return (state.salah&&state.salah[d])||{};}
  function slDayIdx(d){return Math.floor(parse(d)/864e5);}
  function slSave(d,patch){const cur=slDay(d),v={...cur,...patch,date:d};state.salah={...state.salah,[d]:v};render();
    if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return;}store.set("salah/"+d,v).catch(fail);}
  function slAskNotify(){try{if("Notification" in window&&Notification.permission==="default")Notification.requestPermission();}catch(e){}}
  function slSetPrayer(d,k,v){slAskNotify();const cur=slDay(d).p||{};const nv={...cur};if(nv[k]===v)delete nv[k];else nv[k]=v;slSave(d,{p:nv});if(v==="masjid"&&nv[k])woo();}
  function slDhikr(d,k,n){const cur=slDay(d).dhikr||{};slSave(d,{dhikr:{...cur,[k]:Math.max(0,Math.round(n))}});}
  function slStats(days){const today=iso(new Date());let rec=0,mas=0,home=0,miss=0,full=0,qiyam=0;const per={};SL_PR.forEach(([k])=>per[k]={mas:0,home:0,miss:0});
    const dz={tasbih:0,tahmid:0,tahlil:0,istighfar:0};
    for(let i=days-1;i>=0;i--){const d=addDays(today,-i),D=slDay(d),P=D.p||{};let all=true;
      SL_PR.forEach(([k])=>{const v=P[k];if(v){rec++;if(v==="masjid"){mas++;per[k].mas++;}else if(v==="home"){home++;per[k].home++;}else{miss++;per[k].miss++;}}if(!v||v==="missed")all=false;});
      if(all)full++;if(D.qiyam)qiyam++;DHIKR.forEach(([k])=>dz[k]+=Number((D.dhikr||{})[k]||0));}
    return {rec,mas,home,miss,full,qiyam,per,dz};}
  function slStreak(test){const today=iso(new Date());let d=today,n=0;if(!test(d))d=addDays(d,-1);while(test(d)){n++;d=addDays(d,-1);if(n>400)break;}return n;}
  function renderSalah(){
    const box=document.getElementById("salahBody");if(!box)return;const pg=box.closest(".page");if(pg&&pg.hidden)return;
    if(box.contains(document.activeElement)&&document.activeElement.tagName==="INPUT")return;
    const today=iso(new Date()),d=sel>today?today:sel,D=slDay(d),P=D.p||{},isT=d===today,idx=slDayIdx(d);
    const ay=AYAT[((idx%AYAT.length)+AYAT.length)%AYAT.length],hq=QUDSI[(((idx*7)%QUDSI.length)+QUDSI.length)%QUDSI.length];
    const ymd=d.split("-").map(Number),cfg=prayCfg(),T=prayTimesFor(ymd,cfg.city)||{},nx=isT?prayNext(Date.now(),cfg.city):null;
    const hijri=new Intl.DateTimeFormat("ar-EG-u-ca-islamic-umalqura",{day:"numeric",month:"long",year:"numeric"}).format(parse(d));
    const greg=parse(d).toLocaleDateString("ar-EG",{weekday:"long",day:"numeric",month:"long"});
    // 1. ayah + hadith
    const words=el("div",{class:"sl-words"},
      el("section",{class:"panel sl-ayah","aria-label":"آية اليوم"},el("div",{class:"sl-k",text:"آية اليوم"}),el("p",{class:"sl-q",text:ay.t}),el("div",{class:"sl-src",text:"سورة "+ay.s+" · "+ay.a})),
      el("section",{class:"panel sl-hadith","aria-label":"حديث قدسي"},el("div",{class:"sl-k",text:"حديث قدسي"}),el("p",{class:"sl-h",text:"قال الله تعالى: «"+hq[0]+"»"}),el("div",{class:"sl-src",text:hq[1]})));
    // 2. the five prayers
    const done=SL_PR.filter(([k])=>P[k]==="masjid"||P[k]==="home").length;
    const rows=SL_PR.map(([k,n])=>{const v=P[k],isNext=nx&&nx.key===k&&!nx.tomorrow;
      return el("div",{class:"sl-row"+(isNext?" next":"")+(v?" st-"+v:"")},
        el("div",{class:"sl-pn"},el("b",{text:n}),el("span",{class:"num",text:T[k]?new Date(T[k]).toLocaleTimeString("ar-EG",{timeZone:"Africa/Cairo",hour:"numeric",minute:"2-digit"}):""}),isNext?el("span",{class:"sl-in",text:"بعد "+prayInAr(nx.at-Date.now())}):null),
        el("div",{class:"seg sl-seg",role:"group","aria-label":"صلاة "+n},...SL_ST.map(([sv,sl])=>el("button",{type:"button",class:"sv-"+sv,"aria-pressed":String(v===sv),text:sl,onclick:()=>slSetPrayer(d,k,sv)}))));});
    const prayers=el("section",{class:"panel"},el("div",{class:"sl-head"},el("h2",{text:"صلوات "+(isT?"اليوم":greg)}),el("span",{class:"hint",text:hijri+" · "+arN(done)+" من ٥"})),...rows);
    // 3. qiyam
    const qStreak=slStreak(x=>!!slDay(x).qiyam);
    const wk=[];for(let i=6;i>=0;i--){const x=addDays(today,-i);wk.push(el("span",{class:"sl-dot"+(slDay(x).qiyam?" on":"")+(x===d?" cur":""),title:parse(x).toLocaleDateString("ar-EG",{weekday:"long"})}))}
    const qiyam=el("section",{class:"panel sl-qiyam"},
      el("button",{type:"button",class:"sl-qbtn"+(D.qiyam?" on":""),"aria-pressed":String(!!D.qiyam),onclick:()=>{slSave(d,{qiyam:!D.qiyam});if(!D.qiyam)woo();}},
        el("span",{class:"sl-ck","aria-hidden":"true",text:D.qiyam?"✓":""}),el("span",{},el("b",{text:"ركعتان من قيام الليل"}),el("span",{class:"hint",text:D.qiyam?"تقبّل الله منك":"ولو ركعتين قبل الفجر"}))),
      el("div",{class:"sl-qmeta"},el("div",{class:"sl-dots"},...wk),el("span",{class:"hint",text:qStreak?arN(qStreak)+" ليالٍ متتالية":"ابدأ الليلة"})));
    // 4. adhkar: record today's totals
    const DZ=D.dhikr||{};
    const dz=DHIKR.map(([k,n])=>{const v=Number(DZ[k]||0),inp=el("input",{type:"number",min:"0",inputmode:"numeric",class:"sl-num","aria-label":"عدد "+n,value:String(v)});
      inp.addEventListener("change",()=>slDhikr(d,k,Number(inp.value)||0));
      return el("div",{class:"sl-dz"},el("div",{class:"sl-dzh"},el("b",{text:n}),el("span",{class:"num sl-dzv",text:arN(v)})),
        el("div",{class:"track"},el("div",{class:"fill good",style:"width:"+Math.min(100,v)+"%"})),
        el("div",{class:"sl-dzb"},el("button",{type:"button",class:"mini",text:"+٣٣",onclick:()=>slDhikr(d,k,v+33)}),el("button",{type:"button",class:"mini",text:"+١٠٠",onclick:()=>slDhikr(d,k,v+100)}),inp));});
    const afterSalah=el("button",{type:"button",class:"btn ghost sl-after",text:"أذكار بعد الصلاة (+٣٣ تسبيح وتحميد، +١ تهليل)",onclick:()=>{const c=slDay(d).dhikr||{};slSave(d,{dhikr:{...c,tasbih:(c.tasbih||0)+33,tahmid:(c.tahmid||0)+33,tahlil:(c.tahlil||0)+1}});toast("تقبّل الله");}});
    const adhkar=el("section",{class:"panel"},el("div",{class:"sl-head"},el("h2",{text:"الأذكار"}),el("span",{class:"hint",text:"سجّل ما قلته اليوم، الهدف ١٠٠ لكل ذكر"})),el("div",{class:"sl-dzs"},...dz),afterSalah);
    // 5. analytics
    const S7=slStats(7),S30=slStats(30),fullStreak=slStreak(x=>{const P2=slDay(x).p||{};return SL_PR.every(([k])=>P2[k]==="masjid"||P2[k]==="home");});
    const pct=(a,b)=>b?Math.round(a/b*100):0;
    const kpi=(v,l)=>el("div",{class:"sl-kpi"},el("b",{class:"num",text:v}),el("span",{text:l}));
    const grid=el("div",{class:"sl-grid",role:"img","aria-label":"آخر ٣٠ يومًا"},...SL_PR.map(([k,n])=>el("div",{class:"sl-gr"},el("span",{class:"sl-gl",text:n}),
      ...Array.from({length:30},(_,i)=>{const x=addDays(today,-(29-i)),v=(slDay(x).p||{})[k];return el("i",{class:"g-"+(v||"none"),title:parse(x).toLocaleDateString("ar-EG",{day:"numeric",month:"short"})+": "+(v?SL_ST.find(z=>z[0]===v)[1]:"لم تُسجَّل")});}))));
    const weakest=SL_PR.map(([k,n])=>[n,S30.per[k].mas]).sort((a,b)=>a[1]-b[1])[0];
    const insights=[];
    if(S30.rec){insights.push("أضعف صلاة في المسجد هذا الشهر: "+weakest[0]+". اجعلها هدف الأسبوع القادم.");}
    if(S30.miss)insights.push("فاتتك "+arN(S30.miss)+" صلوات في ٣٠ يومًا. منبّه الوضوء قبل الصلاة بـ١٠ دقائق يساعدك على اللحاق بها.");
    insights.push("قال ﷺ: «أحب الأعمال إلى الله أدومها وإن قلّ». ركعتا قيام كل ليلة خير من ليلة طويلة ثم انقطاع.");
    const an=el("section",{class:"panel"},el("div",{class:"sl-head"},el("h2",{text:"التحليلات"}),el("span",{class:"hint",text:"آخر ٧ و٣٠ يومًا"})),
      el("div",{class:"sl-kpis"},kpi(arN(pct(S7.mas,35))+"٪","في المسجد هذا الأسبوع"),kpi(arN(pct(S7.mas+S7.home,35))+"٪","صلوات أُدّيت هذا الأسبوع"),kpi(arN(fullStreak),"أيام متتالية بالصلوات الخمس"),kpi(arN(S30.qiyam),"ليلة قيام في ٣٠ يومًا")),
      grid,el("div",{class:"sl-legend"},...SL_ST.map(([k,l])=>el("span",{},el("i",{class:"g-"+k}),l)),el("span",{},el("i",{class:"g-none"}),"لم تُسجَّل")),
      el("div",{class:"sl-kpis sl-dzk"},...DHIKR.map(([k,n])=>kpi(arN(S7.dz[k]),n+" هذا الأسبوع"))),
      el("ul",{class:"sl-ins"},...insights.map(t=>el("li",{text:t}))));
    rc(box,words,prayers,qiyam,adhkar,an);
  }
  function prayInAr(ms){const m=Math.max(0,Math.ceil(ms/60000));if(m<60)return arN(m)+" دقيقة";const h=Math.floor(m/60);return arN(h)+" ساعة"+(m%60?" و"+arN(m%60)+" دقيقة":"");}
  // ten minutes before each prayer: stop and go make wudu
  let wuduShown={};
  function showWudu(name,at){const ov=document.getElementById("wuduOv");if(!ov)return;
    const r=pRun();
    rc(ov,el("div",{class:"wd-card",role:"alertdialog","aria-labelledby":"wdT",lang:"ar",dir:"rtl"},
      el("div",{class:"wd-k",text:"صلاة "+name+" بعد ١٠ دقائق"}),el("h2",{id:"wdT",class:"wd-t",text:"قم إلى الوضوء"}),
      el("div",{class:"wd-btns"},r&&r.startedAt&&!r.pausedAt?el("button",{type:"button",class:"btn",text:"أوقف المؤقت وقم",onclick:()=>{pPause();ov.hidden=true;}}):el("button",{type:"button",class:"btn",text:"حاضر",onclick:()=>{ov.hidden=true;}}),
        r&&r.startedAt&&!r.pausedAt?el("button",{type:"button",class:"mini",text:"إغلاق",onclick:()=>{ov.hidden=true;}}):null)));
    ov.hidden=false;setTimeout(()=>{const b=ov.querySelector("button");if(b)b.focus();},50);}
  setInterval(()=>{try{const now=Date.now(),cfg=prayCfg(),t=prayTimesFor(cairoYMD(now),cfg.city);if(!t)return;
    for(const [k,n] of SL_PR){const w=t[k]-600000,key=k+t[k];if(now>=w&&now<w+120000&&!wuduShown[key]){wuduShown[key]=1;
      try{if("Notification" in window&&Notification.permission==="granted")new Notification("قم إلى الوضوء",{body:"صلاة "+n+" بعد ١٠ دقائق",tag:"wudu"});}catch(e){}}}}catch(e){}},15000);
  // ---------- sounds: noise made live in the browser (no files), plus a "to listen" queue played with the YouTube player ----------
  const NZ_CH=[["brown","Brown noise"],["pink","Pink noise"],["white","White noise"],["rain","Rain"],["waves","Waves"],["fan","Fan"]];
  const NZ_PRESETS=[{id:"p_deep",name:"Deep focus",lv:{brown:.7}},{id:"p_rain",name:"Rain",lv:{rain:.7,brown:.25}},{id:"p_ocean",name:"Ocean",lv:{waves:.8,pink:.1}},{id:"p_fan",name:"Fan",lv:{fan:.75}},{id:"p_cafe",name:"Soft blend",lv:{pink:.35,rain:.3,brown:.3}}];
  let nz=null, nzLv={brown:.7}, nzName="Deep focus", nzVol=.6;
  try{const sv=JSON.parse(localStorage.getItem("sb-nz")||"null");if(sv){nzLv=sv.lv||nzLv;nzName=sv.name||nzName;nzVol=sv.vol==null?nzVol:sv.vol;}}catch(e){}
  function nzRemember(){try{localStorage.setItem("sb-nz",JSON.stringify({lv:nzLv,name:nzName,vol:nzVol}));}catch(e){}}
  function nzBuffers(a){const n=a.sampleRate*4,mk=()=>a.createBuffer(1,n,a.sampleRate);const W=mk(),Pk=mk(),B=mk();const w=W.getChannelData(0),pk=Pk.getChannelData(0),b=B.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,last=0;
    for(let i=0;i<n;i++){const x=Math.random()*2-1;w[i]=x*.5;
      b0=.99886*b0+x*.0555179;b1=.99332*b1+x*.0750759;b2=.969*b2+x*.153852;b3=.8665*b3+x*.3104856;b4=.55*b4+x*.5329522;b5=-.7616*b5-x*.016898;pk[i]=(b0+b1+b2+b3+b4+b5+b6+x*.5362)*.11;b6=x*.115926;
      last=(last+.02*x)/1.02;b[i]=last*3.5;}
    // smooth the loop seam
    for(const d of [w,pk,b])for(let i=0;i<2000;i++){const k=i/2000;d[n-2000+i]=d[n-2000+i]*(1-k)+d[i]*k;}
    return {white:W,pink:Pk,brown:B};}
  function nzStart(){const a=ac();if(nz)return;const bufs=nzBuffers(a),master=a.createGain();master.gain.value=nzVol;master.connect(a.destination);
    const ch={},srcs=[];const src=b=>{const s2=a.createBufferSource();s2.buffer=b;s2.loop=true;s2.start(0,Math.random()*3);srcs.push(s2);return s2;};
    const g=k=>{const x=a.createGain();x.gain.value=nzLv[k]||0;x.connect(master);ch[k]=x;return x;};
    src(bufs.brown).connect(g("brown"));src(bufs.pink).connect(g("pink"));src(bufs.white).connect(g("white"));
    {const hp=a.createBiquadFilter();hp.type="highpass";hp.frequency.value=900;const bp=a.createBiquadFilter();bp.type="peaking";bp.frequency.value=3000;bp.gain.value=6;src(bufs.pink).connect(hp);hp.connect(bp);bp.connect(g("rain"));}
    {const lp=a.createBiquadFilter();lp.type="lowpass";lp.frequency.value=700;const sw=a.createGain();sw.gain.value=.55;const lfo=a.createOscillator(),depth=a.createGain();lfo.frequency.value=.08;depth.gain.value=.45;lfo.connect(depth);depth.connect(sw.gain);lfo.start();srcs.push(lfo);
      src(bufs.brown).connect(lp);lp.connect(sw);sw.connect(g("waves"));}
    {const lp=a.createBiquadFilter();lp.type="lowpass";lp.frequency.value=380;const hum=a.createOscillator(),hg=a.createGain();hum.frequency.value=58;hg.gain.value=.03;hum.connect(hg);hg.connect(ch.fan||g("fan"));hum.start();srcs.push(hum);src(bufs.brown).connect(lp);lp.connect(ch.fan);}
    nz={master,ch,srcs};npRender();}
  function nzStop(){if(!nz)return;const t=actx.currentTime;nz.master.gain.setTargetAtTime(0,t,.15);const z=nz;nz=null;setTimeout(()=>{z.srcs.forEach(x=>{try{x.stop();}catch(e){}});try{z.master.disconnect();}catch(e){}},700);npRender();renderSounds2();}
  function nzSet(k,v){nzLv={...nzLv,[k]:v};nzName="Custom mix";nzRemember();if(nz&&nz.ch[k])nz.ch[k].gain.setTargetAtTime(v,actx.currentTime,.1);}
  function nzApply(pr){nzLv={...pr.lv};nzName=pr.name;nzRemember();if(nz)NZ_CH.forEach(([k])=>nz.ch[k].gain.setTargetAtTime(nzLv[k]||0,actx.currentTime,.2));else nzStart();renderSounds2();npRender();}
  function nzMixes(){const m=(state.settings&&state.settings.mixes&&state.settings.mixes.list)||[];return Array.isArray(m)?m:[];}
  async function nzSaveMix(name){const list=[...nzMixes().filter(x=>x.name!==name),{id:"m"+Date.now().toString(36),name,lv:{...nzLv}}].slice(-12);const v={list,at:Date.now()};state.settings={...state.settings,mixes:v};nzName=name;nzRemember();renderSounds2();
    if(db){try{await store.set("settings/mixes",v);}catch(e){fail(e);}}toast("Mix saved: "+name);}
  async function nzDelMix(id){const v={list:nzMixes().filter(x=>x.id!==id),at:Date.now()};state.settings={...state.settings,mixes:v};renderSounds2();if(db){try{await store.set("settings/mixes",v);}catch(e){fail(e);}}}
  // ---- the "to listen" queue ----
  const LS_TAGS=[["learning","Learning"],["podcast","Podcast"],["quran","Quran"],["music","Music"]];
  function ytParse(u){try{const x=new URL(String(u).trim());const h=x.hostname.replace(/^www\.|^m\.|^music\./,"");let v=null,list=x.searchParams.get("list");
      if(h==="youtu.be")v=x.pathname.slice(1).split("/")[0];else if(h.endsWith("youtube.com")){if(x.pathname==="/watch")v=x.searchParams.get("v");else{const m=x.pathname.match(/^\/(shorts|live|embed)\/([\w-]{6,})/);if(m)v=m[2];}}
      if(!v&&!list)return null;return {v,list};}catch(e){return null;}}
  function lsItems(){return Object.entries(state.listen||{}).map(([id,x])=>({id,...x})).sort((a,b)=>(a.order||0)-(b.order||0));}
  async function ytTitle(u){try{const r=await fetch("https://noembed.com/embed?url="+encodeURIComponent(u));const j=await r.json();return j&&j.title?String(j.title).slice(0,140):"";}catch(e){return "";}}
  // read a playlist's video ids through a hidden YouTube player (no API key, nothing stored but the ids)
  function ytPlaylistIds(list){return new Promise(res=>{
    const f=document.createElement("iframe");let done=false,tick=null;
    const q=new URLSearchParams({listType:"playlist",list,enablejsapi:"1",mute:"1"});try{if(/^https?:/.test(location.origin))q.set("origin",location.origin);}catch(e){}
    f.setAttribute("referrerpolicy","strict-origin-when-cross-origin");f.setAttribute("aria-hidden","true");f.tabIndex=-1;
    f.style.cssText="position:fixed;left:-9999px;top:0;width:320px;height:180px;border:0;opacity:0;pointer-events:none";
    f.src="https://www.youtube.com/embed/videoseries?"+q.toString();
    const finish=ids=>{if(done)return;done=true;clearInterval(tick);window.removeEventListener("message",onMsg);f.remove();res(ids||[]);};
    const onMsg=e=>{if(e.source!==f.contentWindow)return;let d=e.data;try{if(typeof d==="string")d=JSON.parse(d);}catch(err){return;}
      const pl=d&&d.info&&d.info.playlist;if(Array.isArray(pl)&&pl.length)finish(pl.filter(x=>typeof x==="string"));};
    window.addEventListener("message",onMsg);
    f.onload=()=>{tick=setInterval(()=>{try{f.contentWindow.postMessage(JSON.stringify({event:"listening",id:"pl",channel:"widget"}),"*");}catch(e){}},400);};
    document.body.appendChild(f);setTimeout(()=>finish([]),15000);});}
  async function lsAddPlaylist(url,yp,title,tag){
    toast("Reading the playlist...");
    const [ids,ptitle]=await Promise.all([ytPlaylistIds(yp.list),title?Promise.resolve(title):ytTitle("https://www.youtube.com/playlist?list="+yp.list)]);
    const vids=ids.slice(0,200),items=vids.map((v,i)=>({v,title:"",done:false}));
    // titles, a few at a time
    let k=0;await Promise.all(Array.from({length:4},async()=>{while(k<items.length){const it=items[k++];it.title=(await ytTitle("https://www.youtube.com/watch?v="+it.v))||"";}}));
    items.forEach((it,i)=>{if(!it.title)it.title="Video "+(i+1);});
    const doc={kind:"group",url:String(url).trim(),list:yp.list,title:(ptitle||"YouTube playlist").slice(0,140),tag,done:false,order:Date.now(),items};
    if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return false;}
    try{const ref=await store.add("listen",doc);state.listen={...state.listen,[ref.id]:doc};render();
      toast(items.length?"Playlist added: "+items.length+" videos":"Playlist added. Its videos couldn't be listed, so it plays as one item");return true;}catch(e){fail(e);return false;}}
  async function lsAdd(url,title,tag){const yp=ytParse(url);if(!yp){toast("Paste a YouTube or YouTube Music link");return false;}
    if(yp.list&&!/^(RD|UL|LL|WL)/.test(yp.list))return lsAddPlaylist(url,yp,(title||"").trim(),tag);
    const doc={url:String(url).trim(),title:(title||"").trim(),tag,done:false,order:Date.now()};
    if(!doc.title&&yp.v){try{const r=await fetch("https://noembed.com/embed?url="+encodeURIComponent("https://www.youtube.com/watch?v="+yp.v));const j=await r.json();if(j&&j.title)doc.title=String(j.title).slice(0,140);}catch(e){}}
    if(!doc.title)doc.title=yp.list&&!yp.v?"YouTube playlist":"YouTube video";
    if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return false;}
    try{const ref=await store.add("listen",doc);state.listen={...state.listen,[ref.id]:doc};render();toast("Added to your listening queue");return true;}catch(e){fail(e);return false;}}
  function lsUpd(id,patch){const cur=state.listen[id];if(!cur)return;state.listen={...state.listen,[id]:{...cur,...patch}};render();store.update("listen/"+id,patch).catch(fail);}
  async function lsDel(id){const n={...state.listen};delete n[id];state.listen=n;render();if(db){try{await store.del("listen/"+id);}catch(e){fail(e);}}}
  function lsGroupNext(g){const its=g.items||[];const i=its.findIndex(x=>!x.done);return i<0?null:{id:g.id,gid:g.id,idx:i,v:its[i].v,title:its[i].title,url:"https://www.youtube.com/watch?v="+its[i].v,tag:g.tag,gtitle:g.title};}
  function lsGroupDone(g){const its=g.items||[];return its.length?its.every(x=>x.done):!!g.done;}
  function lsNext(tags){for(const x of lsItems()){if(tags&&!tags.includes(x.tag))continue;if(x.kind==="group"){if(lsGroupDone(x))continue;const n=lsGroupNext(x);if(n)return n;return x;}if(!x.done)return x;}return null;}
  function lsMarkItem(gid,idx,val){const g=state.listen[gid];if(!g)return;const items=(g.items||[]).map((x,i)=>i===idx?{...x,done:val,doneAt:val?iso(new Date()):null}:x);
    const allDone=items.length&&items.every(x=>x.done);lsUpd(gid,{items,done:!!allDone,...(allDone?{doneAt:iso(new Date())}:{})});}
  // ---- YouTube player, docked in the corner so it keeps playing while you move around the app ----
  let ytNow=null, ytPaused=false, ytMin=false; const lsOpen={};
  function ytPlay(item){const yp=ytParse(item.url);if(!yp)return;const k=ytKey(item);askResume(k,item.title,start=>ytLoad(item,start));}
  function ytLoad(item,start){const yp=ytParse(item.url);if(!yp)return;if(nz)nzStop();if(locNow)locStop();ytNow={...item,key:ytKey(item)};ytPaused=false;ytInfo={t:start||0,d:(prGet(ytKey(item))||{}).d||0};ytEnded=false;
    const q=new URLSearchParams({autoplay:"1",enablejsapi:"1",rel:"0",playsinline:"1"});if(start>0)q.set("start",String(Math.floor(start)));try{if(/^https?:/.test(location.origin))q.set("origin",location.origin);}catch(e){}if(yp.list)q.set("list",yp.list);
    const src="https://www.youtube.com/embed/"+(yp.v||"videoseries")+"?"+q.toString();
    const dock=document.getElementById("ytDock");
    rc(dock,el("div",{class:"yt-head"},el("span",{class:"yt-t",text:item.title||"YouTube"}),
        el("button",{type:"button",class:"mini",text:ytMin?"Show":"Hide","aria-label":ytMin?"Show the video":"Hide the video",onclick:()=>{ytMin=!ytMin;dock.classList.toggle("min",ytMin);npRender();ytPlayHead();}}),
        el("button",{type:"button",class:"mini",text:"↗",title:"If the video shows an error, open it in its own small window",
          "aria-label":"Open in a small YouTube window",onclick:()=>{const u=item.url;ytClose();try{window.open(u,"ytpop","popup,width=480,height=320");}catch(e){window.open(u,"_blank");}}}),
        el("button",{type:"button",class:"mini",text:"×","aria-label":"Close the player",onclick:ytClose})),
      el("div",{class:"yt-frame"},el("iframe",{id:"ytFrame",src,title:item.title||"YouTube player",referrerpolicy:"strict-origin-when-cross-origin",allow:"autoplay; encrypted-media; picture-in-picture; fullscreen",allowfullscreen:""})));
    dock.classList.toggle("min",ytMin);dock.hidden=false;if(item.id&&state.listen[item.id]&&!state.listen[item.id].started)lsUpd(item.id,{started:Date.now()});npRender();
    const fr=document.getElementById("ytFrame");clearInterval(ytListen);fr.addEventListener("load",()=>{clearInterval(ytListen);ytListen=setInterval(()=>{try{fr.contentWindow.postMessage(JSON.stringify({event:"listening",id:"np",channel:"widget"}),"*");}catch(e){}},800);setTimeout(()=>{clearInterval(ytListen);ytListen=null;},15000);});
    renderSounds2();}
  function ytPlayHead(){const b=document.querySelector("#ytDock .yt-head .mini");if(b)b.textContent=ytMin?"Show":"Hide";}
  function ytCmd(func){const f=document.getElementById("ytFrame");if(f&&f.contentWindow)f.contentWindow.postMessage(JSON.stringify({event:"command",func,args:[]}),"*");}
  function ytToggle(){ytPaused=!ytPaused;ytCmd(ytPaused?"pauseVideo":"playVideo");npRender();}
  function ytClose(){prFlush();ytNow=null;const d=document.getElementById("ytDock");rc(d);d.hidden=true;npRender();}
  // ---- listening progress: one small record keeps where you stopped in every video and file, synced across devices ----
  function prMap(){return (state.settings&&state.settings.yprog&&state.settings.yprog.m)||{};}
  function prGet(k){return k?prMap()[k]||null:null;}
  let prDirty=false,prTimer=null;
  function prSet(k,patch,soon){if(!k)return;const m={...prMap()};m[k]={...(m[k]||{}),...patch,u:Date.now()};
    const ks=Object.keys(m);if(ks.length>500)ks.sort((a,b)=>(m[a].u||0)-(m[b].u||0)).slice(0,ks.length-500).forEach(x=>delete m[x]);
    state.settings={...state.settings,yprog:{m,at:Date.now()}};prDirty=true;
    if(soon){clearTimeout(prTimer);prTimer=null;prFlush();}else if(!prTimer)prTimer=setTimeout(()=>{prTimer=null;prFlush();},20000);}
  async function prFlush(){if(!prDirty||!db)return;prDirty=false;try{await store.set("settings/yprog",state.settings.yprog);}catch(e){}}
  window.addEventListener("pagehide",prFlush);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")prFlush();});
  const mmss=sec=>{sec=Math.max(0,Math.floor(sec||0));const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),x=sec%60;return (h?h+":"+String(m).padStart(2,"0"):m)+":"+String(x).padStart(2,"0");};
  const lenTxt=sec=>sec>=60?dur(sec/60):Math.round(sec)+"s";
  function prLabel(k,done){const p=prGet(k),d=p&&p.d;if(done||(p&&p.f))return "Finished"+(d?" · "+lenTxt(d):"");
    if(p&&p.t>=5)return "In progress · "+(d?lenTxt(Math.max(0,d-p.t))+" left":"at "+mmss(p.t));return "Not started"+(d?" · "+lenTxt(d):"");}
  function prBar(k,done){const p=prGet(k);if(!p||!p.d||(!(p.t>=5)&&!done&&!p.f))return null;const w=done||p.f?100:Math.min(100,p.t/p.d*100);return el("div",{class:"pr-line"},el("i",{style:"width:"+w+"%"}));}
  function ytKey(item){if(!item)return null;if(item.v)return item.v;const yp=ytParse(item.url||"");return yp?(yp.v||(yp.list?"L"+yp.list:null)):null;}
  // ask before playing something you already started
  function askResume(k,title,go){const p=prGet(k);if(!p||!(p.t>30)||(p.d&&p.t>p.d-20)||p.f){go(0);return;}
    const dlg=document.getElementById("resumeDlg"),close=()=>{dlg.hidden=true;};
    const at=el("input",{type:"text",inputmode:"numeric",placeholder:"mm:ss","aria-label":"Start at, minutes and seconds",class:"rs-at"});
    const atGo=()=>{const parts=String(at.value).trim().split(":").map(Number);if(parts.some(isNaN)||!parts.length)return;const sec=parts.reduce((a,b)=>a*60+b,0);close();go(sec);};
    at.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();atGo();}});
    rc(dlg,el("div",{class:"rs-card",role:"dialog","aria-labelledby":"rsT"},el("div",{class:"hint",text:"You started this before"}),el("h2",{id:"rsT",class:"rs-t",text:title||"Continue?"}),
      p.d?el("div",{class:"pr-line rs-line"},el("i",{style:"width:"+Math.min(100,p.t/p.d*100)+"%"})):null,
      el("div",{class:"rs-btns"},el("button",{type:"button",class:"btn",text:"Continue from "+mmss(p.t),onclick:()=>{close();go(Math.max(0,p.t-3));}}),
        el("button",{type:"button",class:"btn ghost",text:"Start over",onclick:()=>{close();go(0);}})),
      el("div",{class:"rs-custom"},el("span",{class:"hint",text:"Or start at"}),at,el("button",{type:"button",class:"mini",text:"Go",onclick:atGo}),
        el("button",{type:"button",class:"mini",text:"Cancel",onclick:close}))));
    dlg.hidden=false;setTimeout(()=>{const b=dlg.querySelector(".btn");if(b)b.focus();},30);}
  // YouTube tells the page where it is; we keep that, and finish items on their own
  let ytInfo={t:0,d:0},ytListen=null,ytEnded=false;
  window.addEventListener("message",e=>{const f=document.getElementById("ytFrame");if(!f||e.source!==f.contentWindow||!ytNow)return;let d=e.data;try{if(typeof d==="string")d=JSON.parse(d);}catch(err){return;}
    const info=d&&d.info;if(!info)return;if(ytListen){clearInterval(ytListen);ytListen=null;}
    if(typeof info.duration==="number"&&info.duration>0)ytInfo.d=info.duration;if(typeof info.currentTime==="number")ytInfo.t=info.currentTime;
    if(typeof info.playerState==="number"){ytPaused=info.playerState===2;}
    const k=ytNow.key;if(k&&ytInfo.t>0)prSet(k,{t:ytInfo.t,...(ytInfo.d?{d:ytInfo.d}:{})});
    if(!ytEnded&&(info.playerState===0||(ytInfo.d>60&&ytInfo.t>=ytInfo.d-15))){ytEnded=true;ytFinished();}});
  function ytFinished(){const it=ytNow;if(!it)return;prSet(it.key,{f:1,t:ytInfo.d||ytInfo.t},true);
    if(it.gid!=null&&it.idx!=null&&state.listen[it.gid]){lsMarkItem(it.gid,it.idx,true);const nx=lsGroupNext({...state.listen[it.gid],id:it.gid});toast("Finished. "+(nx?"Next: "+nx.title:"Playlist complete"));if(nx)setTimeout(()=>ytPlay(nx),1500);}
    else if(it.id&&state.listen[it.id]&&state.listen[it.id].kind!=="group"){lsUpd(it.id,{done:true,doneAt:iso(new Date())});toast("Finished: "+(it.title||""));}}
  // durations for a playlist's videos: probe quietly one at a time when you open the group
  const probeQ=[];let probing=false;
  function ytProbe(v){if(!v||prGet(v)&&prGet(v).d||probeQ.includes(v))return;probeQ.push(v);if(!probing)probeNext();}
  function probeNext(){const v=probeQ.shift();if(!v){probing=false;renderSounds2();return;}probing=true;
    const f=document.createElement("iframe");f.setAttribute("referrerpolicy","strict-origin-when-cross-origin");f.setAttribute("aria-hidden","true");f.tabIndex=-1;
    f.style.cssText="position:fixed;left:-9999px;top:0;width:320px;height:180px;border:0;opacity:0;pointer-events:none";
    const q=new URLSearchParams({enablejsapi:"1",mute:"1"});try{if(/^https?:/.test(location.origin))q.set("origin",location.origin);}catch(e){}
    f.src="https://www.youtube.com/embed/"+v+"?"+q.toString();let tick=null,done=false;
    const fin=()=>{if(done)return;done=true;clearInterval(tick);window.removeEventListener("message",on);f.remove();setTimeout(probeNext,150);};
    const on=e=>{if(e.source!==f.contentWindow)return;let d=e.data;try{if(typeof d==="string")d=JSON.parse(d);}catch(err){return;}const du=d&&d.info&&d.info.duration;if(typeof du==="number"&&du>0){prSet(v,{d:du});fin();}};
    window.addEventListener("message",on);f.onload=()=>{tick=setInterval(()=>{try{f.contentWindow.postMessage(JSON.stringify({event:"listening",id:"pr",channel:"widget"}),"*");}catch(e){}},400);};
    document.body.appendChild(f);setTimeout(fin,7000);}
  // ---- your own files: played straight from your device, never uploaded ----
  const AUD_RE=/\.(mp3|m4a|aac|wav|ogg|oga|opus|flac|mp4|m4b|webm)$/i;
  let locFiles=[],locDirName="",locDirState="none",locNow=null,locEl=null;
  function idb(){return new Promise((res,rej)=>{const r=indexedDB.open("sb-local",1);r.onupgradeneeded=()=>r.result.createObjectStore("h");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
  async function idbGet(k){try{const d=await idb();return await new Promise(res=>{const t=d.transaction("h").objectStore("h").get(k);t.onsuccess=()=>res(t.result);t.onerror=()=>res(null);});}catch(e){return null;}}
  async function idbSet(k,v){try{const d=await idb();await new Promise(res=>{const t=d.transaction("h","readwrite").objectStore("h").put(v,k);t.onsuccess=res;t.onerror=res;});}catch(e){}}
  async function locScan(dir){const out=[];async function walk(h,path,depth){for await(const [n,c] of h.entries()){if(out.length>=400)return;if(c.kind==="file"&&AUD_RE.test(n))out.push({name:n,path:path+n,handle:c});else if(c.kind==="directory"&&depth<2)await walk(c,path+n+"/",depth+1);}}
    await walk(dir,"",0);out.sort((a,b)=>a.path.localeCompare(b.path,undefined,{numeric:true}));return out;}
  async function locInit(){if(!window.showDirectoryPicker)return;const h=await idbGet("dir");if(!h)return;locDirName=h.name;
    try{const st=await h.queryPermission({mode:"read"});if(st==="granted"){locDirState="ok";locFiles=[...locFiles.filter(f=>!f.handle),...await locScan(h)];}else locDirState="ask";}catch(e){locDirState="ask";}renderSounds2();}
  async function locPick(){try{const h=await window.showDirectoryPicker({mode:"read",id:"sb-audio"});await idbSet("dir",h);locDirName=h.name;locDirState="ok";locFiles=[...locFiles.filter(f=>!f.handle),...await locScan(h)];renderSounds2();toast(locFiles.length+" audio files found");}catch(e){}}
  async function locReconnect(){const h=await idbGet("dir");if(!h)return locPick();try{const st=await h.requestPermission({mode:"read"});if(st==="granted"){locDirState="ok";locFiles=[...locFiles.filter(f=>!f.handle),...await locScan(h)];renderSounds2();}}catch(e){}}
  function locAdd(input){const fs=[...(input.files||[])].filter(f=>AUD_RE.test(f.name)||/^audio\//.test(f.type));input.value="";fs.forEach(f=>{if(!locFiles.some(x=>x.name===f.name&&x.file&&x.file.size===f.size))locFiles.push({name:f.name,path:f.name,file:f});});renderSounds2();if(fs.length)toast(fs.length+" file"+(fs.length>1?"s":"")+" added for this session");}
  function locKey(x){return "f:"+x.path;}
  async function locPlay(x){const file=x.file||(x.handle?await x.handle.getFile().catch(()=>null):null);if(!file){toast("This file can't be opened. Reconnect the folder.");return;}
    askResume(locKey(x),x.name,start=>{if(nz)nzStop();if(ytNow)ytClose();
      if(!locEl){locEl=document.createElement("audio");locEl.preload="auto";document.body.appendChild(locEl);
        locEl.addEventListener("timeupdate",()=>{if(locNow&&locEl.currentTime>0)prSet(locNow.key,{t:locEl.currentTime,...(isFinite(locEl.duration)?{d:locEl.duration}:{})});});
        locEl.addEventListener("loadedmetadata",()=>{if(locNow&&isFinite(locEl.duration))prSet(locNow.key,{d:locEl.duration});});
        locEl.addEventListener("play",npRender);locEl.addEventListener("pause",npRender);
        locEl.addEventListener("ended",()=>{if(!locNow)return;prSet(locNow.key,{f:1},true);const i=locFiles.findIndex(f=>locKey(f)===locNow.key);const nx=locFiles.slice(i+1).find(f=>!(prGet(locKey(f))||{}).f);toast("Finished: "+locNow.name);if(nx)locPlay(nx);else{locNow=null;npRender();renderSounds2();}});}
      if(locNow&&locNow.url)URL.revokeObjectURL(locNow.url);
      const url=URL.createObjectURL(file);locNow={key:locKey(x),name:x.name,url};locEl.src=url;
      locEl.addEventListener("loadedmetadata",()=>{if(start>0)try{locEl.currentTime=start;}catch(e){}},{once:true});
      locEl.play().catch(()=>{});
      try{if("mediaSession" in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:x.name.replace(AUD_RE,""),artist:"Sprint Board"});
        navigator.mediaSession.setActionHandler("play",()=>locEl.play());navigator.mediaSession.setActionHandler("pause",()=>locEl.pause());}}catch(e){}
      npRender();renderSounds2();});}
  function locStop(){if(locEl){locEl.pause();}if(locNow&&locNow.url)URL.revokeObjectURL(locNow.url);locNow=null;prFlush();npRender();renderSounds2();}
  setTimeout(locInit,1500);
  // ---- now playing bar ----
  function npRender(){const bar=document.getElementById("npBar");if(!bar)return;
    if(ytNow){rc(bar,el("span",{class:"np-ico","aria-hidden":"true",text:"▶"}),el("button",{type:"button",class:"np-t",text:ytNow.title||"YouTube",title:"Open Sounds",onclick:()=>setPage("sounds")}),
        el("button",{type:"button",class:"np-b","aria-label":ytPaused?"Play":"Pause",text:ytPaused?"▶":"❚❚",onclick:ytToggle}),
        ytNow.id&&state.listen[ytNow.id]?el("button",{type:"button",class:"np-b","aria-label":"Mark as listened",title:"Mark as listened",text:"✓",onclick:()=>{
          prSet(ytNow.key,{f:1},true);if(ytNow.gid!=null&&ytNow.idx!=null){const g=ytNow.gid,i=ytNow.idx;lsMarkItem(g,i,true);toast("Marked as listened");const nx=lsGroupNext({...state.listen[g],id:g});if(nx)ytPlay(nx);else ytClose();}
          else{lsUpd(ytNow.id,{done:true,doneAt:iso(new Date())});toast("Marked as listened");ytClose();}}}):null,
        el("button",{type:"button",class:"np-b","aria-label":"Close",text:"×",onclick:ytClose}));bar.hidden=false;return;}
    if(locNow){const pl=locEl&&!locEl.paused;rc(bar,el("span",{class:"np-ico","aria-hidden":"true",text:"♫"}),el("button",{type:"button",class:"np-t",text:locNow.name,title:"Open Sounds",onclick:()=>setPage("sounds")}),
        el("button",{type:"button",class:"np-b","aria-label":pl?"Pause":"Play",text:pl?"❚❚":"▶",onclick:()=>{pl?locEl.pause():locEl.play();}}),
        el("button",{type:"button",class:"np-b","aria-label":"Mark as finished",title:"Mark as finished",text:"✓",onclick:()=>{prSet(locNow.key,{f:1},true);toast("Marked as finished");locStop();}}),
        el("button",{type:"button",class:"np-b","aria-label":"Close",text:"×",onclick:locStop}));bar.hidden=false;return;}
    if(nz){rc(bar,el("span",{class:"np-ico","aria-hidden":"true",text:"≋"}),el("button",{type:"button",class:"np-t",text:nzName,title:"Open Sounds",onclick:()=>setPage("sounds")}),
        el("button",{type:"button",class:"np-b","aria-label":"Stop the noise",text:"■",onclick:nzStop}));bar.hidden=false;return;}
    bar.hidden=true;}
  // ---- the Sounds page ----
  function renderSounds2(){
    const box=document.getElementById("soundsBody");if(!box)return;const pg=box.closest(".page");if(pg&&pg.hidden)return;
    if(box.contains(document.activeElement)&&/INPUT|SELECT/.test(document.activeElement.tagName)&&document.activeElement.type!=="range")return;
    const all=[...NZ_PRESETS,...nzMixes()];
    const chips=el("div",{class:"nz-chips"},...all.map(pr=>el("span",{class:"nz-chip"+(pr.name===nzName?" on":"")},el("button",{type:"button",text:pr.name,onclick:()=>nzApply(pr)}),
      pr.id.startsWith("m")?el("button",{type:"button",class:"nz-x","aria-label":"Delete mix "+pr.name,text:"×",onclick:()=>nzDelMix(pr.id)}):null)));
    const sliders=el("div",{class:"nz-sl"},...NZ_CH.map(([k,n])=>{const r=el("input",{type:"range",min:"0",max:"1",step:"0.05","aria-label":n});r.value=String(nzLv[k]||0);
      r.addEventListener("input",()=>{nzSet(k,Number(r.value));const c=box.querySelector(".nz-chip.on");if(c)c.classList.remove("on");npRender();});
      return el("label",{class:"nz-row"},el("span",{text:n}),r);}));
    const vol=el("input",{type:"range",min:"0",max:"1",step:"0.05","aria-label":"Noise volume"});vol.value=String(nzVol);
    vol.addEventListener("input",()=>{nzVol=Number(vol.value);nzRemember();if(nz)nz.master.gain.setTargetAtTime(nzVol,actx.currentTime,.1);});
    const nameIn=el("input",{type:"text",class:"nz-name",maxlength:"30",placeholder:"Name this mix","aria-label":"Mix name"});
    const mixer=el("section",{class:"panel"},el("div",{class:"panel-head"},el("h2",{text:"Noise mixer"}),el("span",{class:"hint",text:"Made live by your device · no files · works offline"})),
      el("div",{class:"nz-top"},el("button",{type:"button",class:"btn nz-play",text:nz?"■ Stop":"▶ Play",onclick:()=>{nz?nzStop():nzStart();renderSounds2();}}),el("label",{class:"nz-vol"},el("span",{text:"Volume"}),vol)),
      chips,sliders,
      el("form",{class:"nz-save",onsubmit:e=>{e.preventDefault();const n=nameIn.value.trim();if(n){nzSaveMix(n);nameIn.value="";}}},nameIn,el("button",{type:"submit",class:"btn ghost",text:"Save mix"})));
    // queue
    const urlIn=el("input",{type:"url",placeholder:"Paste a YouTube or YouTube Music link","aria-label":"Link"}),titleIn=el("input",{type:"text",placeholder:"Title (optional)","aria-label":"Title"});
    const tagSel=el("select",{"aria-label":"Type"},...LS_TAGS.map(([k,n])=>el("option",{value:k,text:n})));
    const add=el("form",{class:"ls-add",onsubmit:async e=>{e.preventDefault();if(await lsAdd(urlIn.value,titleIn.value,tagSel.value)){urlIn.value="";titleIn.value="";}}},urlIn,titleIn,tagSel,el("button",{type:"submit",class:"btn",text:"Add"}));
    const items=lsItems(),isDone=x=>x.kind==="group"?lsGroupDone(x):!!x.done,todo=items.filter(x=>!isDone(x)),done=items.filter(isDone);
    const grow=g=>{const its=g.items||[],n=its.filter(x=>x.done).length,nx=lsGroupNext(g),playingHere=ytNow&&ytNow.gid===g.id;
      const det=el("details",{class:"ls-grp"},el("summary",{},
        el("button",{type:"button",class:"ls-play","aria-label":"Play "+g.title,text:playingHere?"♪":"▶",onclick:e=>{e.preventDefault();if(nx)ytPlay(nx);else ytPlay({id:g.id,title:g.title,url:g.url});}}),
        el("div",{class:"ls-txt"},el("span",{class:"ls-t",text:g.title}),el("span",{class:"hint",text:(LS_TAGS.find(t=>t[0]===g.tag)||["","Other"])[1]+" · playlist · "+(its.length?n+" of "+its.length+" listened":"plays as one")})),
        its.length?el("div",{class:"track ls-gbar"},el("div",{class:"fill good",style:"width:"+(n/its.length*100)+"%"})):null,
        el("button",{type:"button",class:"x","aria-label":"Remove "+g.title,text:"×",onclick:e=>{e.preventDefault();lsDel(g.id);}})),
        its.length?el("ol",{class:"ls-sub"},...its.map((x,i)=>el("li",{class:"ls-srow"+(x.done?" done":"")+(playingHere&&ytNow.idx===i?" playing":"")},
          el("button",{type:"button",class:"ls-mini","aria-label":"Play "+x.title,text:playingHere&&ytNow.idx===i?"♪":"▶",onclick:()=>ytPlay({id:g.id,gid:g.id,idx:i,v:x.v,title:x.title,url:"https://www.youtube.com/watch?v="+x.v,tag:g.tag})}),
          el("span",{class:"ls-st"},el("span",{class:"ls-stt",text:x.title}),el("span",{class:"ls-pl"+((prGet(x.v)||{}).t>=5&&!x.done?" on":""),text:prLabel(x.v,x.done)}),prBar(x.v,x.done)),
          el("button",{type:"button",class:"ls-ck"+(x.done?" on":""),"aria-pressed":String(!!x.done),"aria-label":(x.done?"Mark not listened: ":"Mark listened: ")+x.title,text:x.done?"✓":"",onclick:()=>lsMarkItem(g.id,i,!x.done)})))):
          el("p",{class:"hint",text:"This playlist couldn't be split into videos. It plays as one item."}));
      if(playingHere||lsOpen[g.id])det.open=true;det.addEventListener("toggle",()=>{lsOpen[g.id]=det.open;if(det.open)its.forEach(x=>ytProbe(x.v));});if(det.open)its.forEach(x=>ytProbe(x.v));
      return el("li",{class:"ls-gli"},det);};
    const row=x=>x.kind==="group"?grow(x):el("li",{class:"ls-row"+(ytNow&&ytNow.id===x.id?" playing":"")},
      el("button",{type:"button",class:"ls-play","aria-label":"Play "+x.title,text:ytNow&&ytNow.id===x.id?"♪":"▶",onclick:()=>ytPlay(x)}),
      el("div",{class:"ls-txt"},el("span",{class:"ls-t",text:x.title}),el("span",{class:"hint",text:(LS_TAGS.find(t=>t[0]===x.tag)||["","Other"])[1]+" · "+prLabel(ytKey(x),x.done)}),prBar(ytKey(x),x.done)),
      x.done?el("button",{type:"button",class:"mini",text:"Undo",onclick:()=>lsUpd(x.id,{done:false})}):el("button",{type:"button",class:"mini",title:"Mark as listened",text:"✓ Listened",onclick:()=>lsUpd(x.id,{done:true,doneAt:iso(new Date())})}),
      el("button",{type:"button",class:"x","aria-label":"Remove "+x.title,text:"×",onclick:()=>lsDel(x.id)}));
    const queue=el("section",{class:"panel"},el("div",{class:"panel-head"},el("h2",{text:"To listen"}),el("span",{class:"hint",text:todo.length?todo.length+" waiting · the next one is offered when a matching block starts":"Nothing waiting"})),add,
      todo.length?el("ul",{class:"ls-list"},...todo.map(row)):el("p",{class:"hint",text:"Add the podcasts and lectures you keep forgetting. Learning ones are offered when Block 5 or a learning timer starts; Quran and music when a deep block starts."}),
      done.length?el("details",{class:"pt-det"},el("summary",{},el("span",{text:"Listened"}),el("span",{class:"hint",text:String(done.length)})),el("ul",{class:"ls-list"},...done.slice().reverse().map(row))):null);
    const canDir=!!window.showDirectoryPicker;
    const fileIn=el("input",{type:"file",accept:"audio/*,video/mp4,.mp3,.m4a,.wav,.ogg,.opus,.flac,.m4b",multiple:"",hidden:"",onchange:e=>locAdd(e.target)});
    const fbtns=el("div",{class:"lf-btns"},
      canDir?(locDirState==="ask"?el("button",{type:"button",class:"btn",text:"Reconnect "+locDirName,onclick:locReconnect}):el("button",{type:"button",class:"btn"+(locDirState==="ok"?" ghost":""),text:locDirState==="ok"?"Change folder":"Choose a folder",onclick:locPick})):null,
      el("button",{type:"button",class:"btn ghost",text:"Add files",onclick:()=>fileIn.click()}),fileIn,
      el("span",{class:"hint",text:canDir?(locDirState==="ok"?"Folder: "+locDirName+" · remembered on this computer":"Your folder is remembered on this computer. Nothing is uploaded"):"On phones and tablets, pick files each time. Nothing is uploaded"}));
    const frow=x=>{const k=locKey(x),p=prGet(k),on=locNow&&locNow.key===k;return el("li",{class:"ls-row"+(on?" playing":"")},
      el("button",{type:"button",class:"ls-play","aria-label":"Play "+x.name,text:on?"♪":"▶",onclick:()=>locPlay(x)}),
      el("div",{class:"ls-txt"},el("span",{class:"ls-t",text:x.name.replace(AUD_RE,"")}),el("span",{class:"hint",text:(x.path!==x.name?x.path.replace(/[^/]+$/,"")+" · ":"")+prLabel(k)}),prBar(k)),
      el("button",{type:"button",class:"ls-ck"+(p&&p.f?" on":""),"aria-pressed":String(!!(p&&p.f)),"aria-label":(p&&p.f?"Mark not finished: ":"Mark finished: ")+x.name,text:p&&p.f?"✓":"",onclick:()=>prSet(k,{f:p&&p.f?0:1},true)||renderSounds2()}));};
    const files=el("section",{class:"panel"},el("div",{class:"panel-head"},el("h2",{text:"Your files"}),el("span",{class:"hint",text:locFiles.length?locFiles.length+" files":"Quran, lectures, anything on this device"})),fbtns,
      locFiles.length?el("ul",{class:"ls-list lf-list"},...locFiles.slice(0,400).map(frow)):null);
    rc(box,mixer,queue,files);
  }
  // what to suggest for the block that's running
  function pSoundFor(r){if(!r)return null;const w=String(r.what||"");
    const learn=w==="block5"||w==="other-learning"||w.startsWith("eng:")||w.startsWith("todo:learning:")||(w.startsWith("tasks:")&&(state.tasks[w.slice(6)]||{}).cat==="learning");
    if(learn){const it=lsNext(["learning","podcast"]);return it?{kind:"yt",item:it}:null;}
    const it=lsNext(["quran","music"]);return it?{kind:"yt",item:it}:{kind:"nz"};}
  function pSoundChip(r){if(!r||r.phase!=="focus"||ytNow)return null;const sg=pSoundFor(r);if(!sg)return null;
    if(sg.kind==="nz"){if(nz)return null;return el("button",{type:"button",class:"pf-sound",onclick:()=>{nzStart();renderPomoFull();}},"≋ Play "+nzName);}
    return el("button",{type:"button",class:"pf-sound",onclick:()=>{ytPlay(sg.item);renderPomoFull();}},"▶ Up next: "+sg.item.title);}
  // ---------- Google Drive: your own Drive holds images and files; the app only keeps their ids ----------
  // Access is limited to files this app creates (drive.file). The sign-in token lives in this browser tab only.
  const GD_SCOPE="https://www.googleapis.com/auth/drive.file";
  let gdTok=null,gdExp=0,gdClient=null,gdBusy=false,gdLast=null;
  try{const t=JSON.parse(sessionStorage.getItem("sb-gd")||"null");if(t&&t.exp>Date.now()+60000){gdTok=t.tok;gdExp=t.exp;}}catch(e){}
  function gdCfg(){return (state.settings&&state.settings.drive)||{};}
  async function gdSaveCfg(patch){const v={...gdCfg(),...patch,at:Date.now()};state.settings={...state.settings,drive:v};renderDrive();if(db){try{await store.set("settings/drive",v);}catch(e){fail(e);}}}
  function gdLoadGis(){return new Promise((res,rej)=>{if(window.google&&google.accounts&&google.accounts.oauth2)return res();const sc=document.createElement("script");sc.src="https://accounts.google.com/gsi/client";sc.async=true;sc.onload=()=>res();sc.onerror=()=>rej(new Error("gis"));document.head.appendChild(sc);});}
  function gdOk(){return gdTok&&gdExp>Date.now()+30000;}
  // must be called from a tap: opens Google's sign-in window
  async function gdConnect(){const cid=(gdCfg().clientId||"").trim();if(!cid){toast("Paste your Client ID first");return;}
    try{await gdLoadGis();}catch(e){toast("Couldn't reach Google. Check your connection.");return;}
    return new Promise(res=>{const want=(gdCfg().want||gdCfg().email||"").trim();gdClient=google.accounts.oauth2.initTokenClient({client_id:cid,scope:GD_SCOPE,...(want?{hint:want,login_hint:want}:{}),prompt:"select_account",
      callback:async r=>{if(r&&r.access_token){gdTok=r.access_token;gdExp=Date.now()+(Number(r.expires_in)||3600)*1000;try{sessionStorage.setItem("sb-gd",JSON.stringify({tok:gdTok,exp:gdExp}));}catch(e){}
          try{const me=await gdApi("https://www.googleapis.com/drive/v3/about?fields=user(emailAddress,displayName),storageQuota");const patch={email:me.user&&me.user.emailAddress,name:me.user&&me.user.displayName};
            if(!gdCfg().folderId){const f=await gdFolder("Sprint Board",null);patch.folderId=f;}await gdSaveCfg(patch);gdLast=me.storageQuota||null;toast("Google Drive connected");}catch(e){toast("Connected, but Drive didn't answer. Is the Drive API turned on?");}}
        else toast("Google sign-in was cancelled");renderDrive();res();},
      error_callback:e=>{toast(e&&e.type==="popup_closed"?"Sign-in window closed":"Google sign-in didn't open. Allow pop-ups for this app.");res();}});
      gdClient.requestAccessToken();});}
  function gdDisconnect(){try{if(gdTok&&window.google)google.accounts.oauth2.revoke(gdTok,()=>{});}catch(e){}gdTok=null;gdExp=0;try{sessionStorage.removeItem("sb-gd");}catch(e){}renderDrive();}
  async function gdApi(url,opt){if(!gdOk())throw new Error("signin");const r=await fetch(url,{...(opt||{}),headers:{...((opt&&opt.headers)||{}),Authorization:"Bearer "+gdTok}});
    if(r.status===401){gdTok=null;renderDrive();throw new Error("signin");}if(!r.ok)throw new Error("drive "+r.status);const ct=r.headers.get("content-type")||"";return ct.includes("json")?r.json():r;}
  async function gdFolder(name,parent){const q="mimeType='application/vnd.google-apps.folder' and trashed=false and name='"+name.replace(/'/g,"\\'")+"'"+(parent?" and '"+parent+"' in parents":"");
    const l=await gdApi("https://www.googleapis.com/drive/v3/files?q="+encodeURIComponent(q)+"&fields=files(id)&spaces=drive");if(l.files&&l.files[0])return l.files[0].id;
    const c=await gdApi("https://www.googleapis.com/drive/v3/files?fields=id",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,mimeType:"application/vnd.google-apps.folder",...(parent?{parents:[parent]}:{})})});return c.id;}
  const gdSub={};
  async function gdSubfolder(name){const root=gdCfg().folderId;if(!name)return root;if(gdSub[name])return gdSub[name];gdSub[name]=await gdFolder(name,root);return gdSub[name];}
  // upload a file or image to Sprint Board/<sub> in your Drive; returns {id,name,mimeType,webViewLink}
  async function gdUpload(blob,name,sub){const parent=await gdSubfolder(sub);const meta={name:name||("file-"+Date.now()),parents:[parent]};
    const fd=new FormData();fd.append("metadata",new Blob([JSON.stringify(meta)],{type:"application/json"}));fd.append("file",blob);
    return gdApi("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size",{method:"POST",body:fd});}
  const gdUrlCache={};
  async function gdObjectUrl(id){if(gdUrlCache[id])return gdUrlCache[id];const r=await gdApi("https://www.googleapis.com/drive/v3/files/"+id+"?alt=media");const b=await r.blob();return gdUrlCache[id]=URL.createObjectURL(b);}
  window.sbDrive={upload:gdUpload,url:gdObjectUrl,ready:gdOk,connect:gdConnect}; // used by the design tools to come
  let gdTest=[];
  async function gdTestUpload(files){if(!gdOk()){toast("Connect Google Drive first");return;}gdBusy=true;renderDrive();
    try{for(const f of files){const ext=(f.type.split("/")[1]||"png").replace("jpeg","jpg");const up=await gdUpload(f,f.name&&f.name!=="image.png"?f.name:"pasted-"+new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")+"."+ext,"Inbox");
      gdTest.unshift({...up,local:URL.createObjectURL(f)});}toast("Saved to your Drive: Sprint Board / Inbox");}catch(e){toast(e.message==="signin"?"Your Drive session ended. Tap Reconnect.":"Upload failed. Try again.");}
    gdBusy=false;renderDrive();}
  function renderDrive(){const box=document.getElementById("gdBody");if(!box)return;if(box.contains(document.activeElement)&&document.activeElement.tagName==="INPUT")return;
    const c=gdCfg(),cidIn=el("input",{class:"input gd-cid",placeholder:"Paste your OAuth Client ID (ends with .apps.googleusercontent.com)","aria-label":"Google OAuth Client ID"});cidIn.value=c.clientId||"";
    const saveCid=el("button",{type:"button",class:"btn ghost",text:"Save",onclick:()=>{const v=cidIn.value.trim();if(!/\.apps\.googleusercontent\.com$/.test(v)){toast("That doesn't look like a Client ID");return;}gdSaveCfg({clientId:v});toast("Client ID saved on all your devices");}});
    const status=gdOk()?el("div",{class:"gd-st ok"},el("b",{text:"Connected"}),el("span",{class:"hint",text:(c.email||"")+(gdLast&&gdLast.limit?" · "+(Number(gdLast.usage)/1e9).toFixed(1)+" of "+(Number(gdLast.limit)/1e9).toFixed(0)+" GB used":"")}))
      :c.email?el("div",{class:"gd-st"},el("b",{text:"Linked to "+c.email}),el("span",{class:"hint",text:"Tap Reconnect once per session to use it on this device"}))
      :el("div",{class:"gd-st"},el("b",{text:"Not connected"}),el("span",{class:"hint",text:c.clientId?"Tap Connect and choose the Google account you want to use":"Step 1: create a free Client ID (see below), then paste it here"}));
    const btns=el("div",{class:"gd-btns"},gdOk()?null:el("button",{type:"button",class:"btn",text:c.email?"Reconnect":"Connect Google Drive",disabled:c.clientId?null:"",onclick:gdConnect}),
      c.folderId?el("a",{class:"btn ghost",href:"https://drive.google.com/drive/folders/"+c.folderId,target:"_blank",rel:"noopener",text:"Open the folder in Drive"}):null,
      gdOk()?el("button",{type:"button",class:"mini",text:"Sign out on this device",onclick:gdDisconnect}):null);
    const drop=gdOk()?el("div",{class:"gd-drop",tabindex:"0",role:"button","aria-label":"Paste or drop an image to save it to your Drive",onclick:()=>fi.click()},
      el("b",{text:gdBusy?"Saving to Drive...":"Paste, drop or tap to add an image"}),el("span",{class:"hint",text:"Test it now: it goes to Sprint Board / Inbox in your Drive"})):null;
    const fi=el("input",{type:"file",accept:"image/*",multiple:"",hidden:"",onchange:e=>{gdTestUpload([...e.target.files]);e.target.value="";}});
    if(drop){drop.addEventListener("dragover",e=>{e.preventDefault();drop.classList.add("on");});drop.addEventListener("dragleave",()=>drop.classList.remove("on"));
      drop.addEventListener("drop",e=>{e.preventDefault();drop.classList.remove("on");const fs=[...e.dataTransfer.files].filter(f=>/^image\//.test(f.type));if(fs.length)gdTestUpload(fs);});
      drop.addEventListener("paste",e=>{const fs=[...(e.clipboardData||{}).items||[]].filter(i=>i.kind==="file").map(i=>i.getAsFile()).filter(Boolean);if(fs.length){e.preventDefault();gdTestUpload(fs);}});}
    const thumbs=gdTest.length?el("div",{class:"gd-thumbs"},...gdTest.slice(0,8).map(t=>el("a",{href:t.webViewLink||"#",target:"_blank",rel:"noopener",title:t.name},el("img",{src:t.local,alt:t.name})))):null;
    const help=el("details",{class:"pt-det"},el("summary",{},el("span",{text:"How to get your free Client ID (one time, about 5 minutes)"})),
      el("ol",{class:"gd-steps"},
        el("li",{},"Open console.cloud.google.com and sign in with ",el("b",{text:"the Google account whose Drive you want to use"}),". Create a project, e.g. “Sprint Board”."),
        el("li",{},"APIs & Services > Library: search ",el("b",{text:"Google Drive API"})," and tap Enable."),
        el("li",{},"APIs & Services > OAuth consent screen: choose External, fill the app name and your email. Under Audience or Test users, add that same Google account."),
        el("li",{},"APIs & Services > Credentials > Create credentials > ",el("b",{text:"OAuth client ID"}),". Type: Web application. Under Authorized JavaScript origins add: ",el("code",{text:location.origin&&/^https?:/.test(location.origin)?location.origin:"https://jade-frangollo-4f5a90.netlify.app"})),
        el("li",{},"Copy the Client ID, paste it above, tap Save, then Connect.")));
    const wantIn=el("input",{class:"input gd-cid",type:"email",placeholder:"Google account to use, e.g. name@gmail.com (optional)","aria-label":"Google account to use"});wantIn.value=c.want||"";
    const saveWant=el("button",{type:"button",class:"btn ghost",text:"Save",onclick:()=>{const v=wantIn.value.trim();if(v&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)){toast("That doesn't look like an email");return;}gdSaveCfg({want:v});toast(v?"Connect will suggest "+v:"Cleared");}});
    const switchBtn=c.email?el("button",{type:"button",class:"mini",text:"Use a different account",onclick:()=>{gdDisconnect();gdSaveCfg({email:"",folderId:""});setTimeout(gdConnect,50);}}):null;
    const here=(()=>{try{return location.origin;}catch(e){return "";}})();
    const originRow=el("div",{class:"gd-origin"},el("span",{class:"hint",text:"This app's address (must be listed in Google Cloud under Authorised JavaScript origins):"}),
      el("div",{class:"gd-cidrow"},el("code",{class:"gd-code",text:here&&/^https?:/.test(here)?here:"(not a web address: open the standalone app to connect)"}),
        /^https?:/.test(here)?el("button",{type:"button",class:"btn ghost",text:"Copy",onclick:async()=>{try{await navigator.clipboard.writeText(here);toast("Copied");}catch(e){}}}):null));
    rc(box,status,originRow,el("div",{class:"gd-cidrow"},cidIn,saveCid),el("div",{class:"gd-cidrow"},wantIn,saveWant),btns,switchBtn,
      el("p",{class:"hint",text:"Connect always shows Google's account picker. Choose the account, or tap “Use another account” there to sign in to a different one."}),drop,fi,thumbs,help);
  }
  // ---------- Brain: capture now, review later. Ideas, learning, decisions and notes ----------
  const BR_T=[["idea","Idea","💡"],["learning","Learning","📘"],["decision","Decision","⚖"],["note","Note","📝"]];
  const BR_HINT={idea:"Not now. You'll decide at the weekly review: do it, keep it, or let it go.",learning:"It comes back after 3 days, 1 week, 1 month and 3 months so it sticks.",decision:"Write what you decided and why. You'll check the outcome on the review date.",note:"Kept for reference. It comes back once a month."};
  let brFilter="all",brQ="",brReview=false,brOpen=null;
  const brName=t=>(BR_T.find(x=>x[0]===t)||BR_T[3])[1];
  function brNotes(){return Object.entries(state.notes||{}).map(([id,x])=>({id,...x})).filter(x=>x.status!=="deleted");}
  function brNextFriday(d){let x=addDays(d,1);while(!isFriday(x))x=addDays(x,1);return x;}
  function brFirstReview(t,today){return t==="learning"?addDays(today,3):t==="decision"?addDays(today,30):t==="note"?addDays(today,30):brNextFriday(today);}
  function brDue(){const today=iso(new Date());return brNotes().filter(x=>x.status==="inbox"||(x.status==="keep"&&x.review&&x.review<=today)).sort((a,b)=>(a.created||0)-(b.created||0));}
  async function brAdd(text,type,extra){text=String(text||"").trim();if(!text&&!(extra&&extra.img))return false;if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return false;}
    const today=iso(new Date()),doc={text,type:type||"idea",status:"inbox",created:Date.now(),date:today,review:brFirstReview(type,today),n:0,...(extra||{})};
    try{const ref=await store.add("notes",doc);state.notes={...state.notes,[ref.id]:doc};render();toast(brName(type)+" captured. Back to your day");return true;}catch(e){fail(e);return false;}}
  function brUpd(id,patch){const cur=state.notes[id];if(!cur)return;state.notes={...state.notes,[id]:{...cur,...patch}};render();store.update("notes/"+id,patch).catch(fail);}
  const BR_STEPS=[3,7,30,90,180];
  function brKeep(x,days){const today=iso(new Date()),n=(x.n||0)+1,d=days||(x.type==="learning"?BR_STEPS[Math.min(n,BR_STEPS.length-1)]:x.type==="idea"?7:30);brUpd(x.id,{status:"keep",n,review:addDays(today,d),reviewed:Date.now()});}
  async function brToTask(x,when){const today=iso(new Date()),d=when==="tomorrow"?addDays(today,1):today;
    const body={title:String(x.text).split("\n")[0].slice(0,120),cat:x.type==="learning"?"learning":"setup",date:d,sprint:sprintFor(d).n,done:false,moved:0,order:Date.now(),fromNote:x.id};
    try{await store.add("tasks",body);brUpd(x.id,{status:"done",doneAt:iso(new Date()),as:"task"});toast("Added as a task for "+(when==="tomorrow"?"tomorrow":"today"));}catch(e){fail(e);}}
  async function brPasteImg(files,cb){if(!(window.sbDrive&&sbDrive.ready())){toast("Connect Google Drive in Settings to keep images");return;}
    try{for(const f of files){const up=await sbDrive.upload(f,"brain-"+Date.now()+"."+((f.type.split("/")[1]||"png").replace("jpeg","jpg")),"Brain");cb(up.id);}toast("Image saved to your Drive");}catch(e){toast("Image upload failed");}}
  function brImg(id){const im=el("img",{class:"br-img",alt:"Image from your Drive"});if(window.sbDrive&&sbDrive.ready())sbDrive.url(id).then(u=>{im.src=u;}).catch(()=>{});else im.alt="Connect Google Drive to see this image";return im;}
  function brCapture(prefType){const ov=document.getElementById("brCap");let type=prefType||"idea",imgs=[];
    const ta=el("textarea",{class:"br-ta",rows:"4",placeholder:"Write it down. You'll come back to it at review time.","aria-label":"Your thought"});
    const chips=el("div",{class:"br-types",role:"group","aria-label":"Type"});const hint=el("p",{class:"hint br-h"});
    const draw=()=>{rc(chips,...BR_T.map(([k,n,ic])=>el("button",{type:"button","aria-pressed":String(type===k),text:ic+" "+n,onclick:()=>{type=k;draw();}})));hint.textContent=BR_HINT[type];why.hidden=type!=="decision";};
    const why=el("input",{class:"input br-why",placeholder:"Why: the reasons, so you can judge it later","aria-label":"Why"});draw();
    const save=async()=>{if(await brAdd(ta.value,type,{...(why.value.trim()?{why:why.value.trim()}:{}),...(imgs.length?{img:imgs}:{})})){ov.hidden=true;}};
    ta.addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();save();}if(e.key==="Escape")ov.hidden=true;});
    ta.addEventListener("paste",e=>{const fs=[...((e.clipboardData||{}).items||[])].filter(i=>i.kind==="file").map(i=>i.getAsFile()).filter(Boolean);if(fs.length){e.preventDefault();brPasteImg(fs,id=>{imgs.push(id);toast(imgs.length+" image"+(imgs.length>1?"s":"")+" attached");});}});
    rc(ov,el("div",{class:"rs-card br-card",role:"dialog","aria-label":"Capture to Brain"},el("h2",{class:"rs-t",text:"Capture"}),chips,ta,dictBar(ta,{kind:"a short note"}),why,hint,
      el("div",{class:"rs-btns"},el("button",{type:"button",class:"btn",text:"Save to Brain",onclick:save}),el("button",{type:"button",class:"btn ghost",text:"Cancel",onclick:()=>{ov.hidden=true;}}),el("span",{class:"hint",text:"Ctrl + Enter saves · paste an image to keep it in Drive"}))));
    ov.hidden=false;setTimeout(()=>ta.focus(),30);}
  // N anywhere opens capture (when you're not typing)
  document.addEventListener("keydown",e=>{if((e.key==="n"||e.key==="N")&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||"")&&!document.activeElement.isContentEditable&&!pFullOpen){e.preventDefault();brCapture();}});
  {const sel2=document.getElementById("brQuickType");if(sel2)rc(sel2,...BR_T.map(([k,n,ic])=>el("option",{value:k,text:n})));
   const f=document.getElementById("brQuick");if(f){const qi=document.getElementById("brQuickIn");setTimeout(()=>qi.after(dictBar(qi,{compact:true,autoClean:true})),0);}
   if(f)f.addEventListener("submit",async e=>{e.preventDefault();const i=document.getElementById("brQuickIn");if(await brAdd(i.value,document.getElementById("brQuickType").value))i.value="";});}
  function brCardView(x){const t=BR_T.find(z=>z[0]===x.type)||BR_T[3];
    return [el("div",{class:"br-meta"},el("span",{class:"br-tag t-"+x.type,text:t[2]+" "+t[1]}),el("span",{class:"hint",text:"captured "+fmt(x.date||iso(new Date(x.created||Date.now())),{day:"numeric",month:"short"})+(x.n?" · reviewed "+x.n+"×":"")})),
      el("p",{class:"br-text",text:x.text}),x.why?el("p",{class:"br-why-t"},el("b",{text:"Why: "}),x.why):null,...(x.img||[]).map(brImg),
      x.outcome?el("p",{class:"br-why-t"},el("b",{text:"Outcome: "}),x.outcome):null];}
  function renderBrain(){
    const box=document.getElementById("brainBody");if(!box)return;const pg=box.closest(".page");if(pg&&pg.hidden)return;
    if(box.contains(document.activeElement)&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;
    const all=brNotes(),due=brDue(),today=iso(new Date());
    const head=el("section",{class:"panel br-head"},el("div",{class:"br-hrow"},el("div",{},el("h2",{text:"Your Brain"}),el("p",{class:"hint",text:"Capture anything now, so it stops pulling you away from today's plan. Decide on it at review time."})),
        el("div",{class:"br-hbtns"},el("button",{type:"button",class:"btn",text:"+ Capture",onclick:()=>brCapture()}),
          el("button",{type:"button",class:"btn"+(due.length?"":" ghost"),text:due.length?"Review "+due.length:"Nothing to review",disabled:due.length?null:"",onclick:()=>{brReview=true;renderBrain();}}))),
      el("div",{class:"br-kpis"},...BR_T.map(([k,n,ic])=>{const c=all.filter(x=>x.type===k&&x.status!=="done").length;return el("button",{type:"button",class:"br-kpi"+(brFilter===k?" on":""),onclick:()=>{brFilter=brFilter===k?"all":k;renderBrain();}},el("b",{class:"num",text:String(c)}),el("span",{text:ic+" "+n+(c===1?"":"s")}));})));
    // review mode: one card at a time
    let review=null;
    if(brReview){const x=due[0];
      if(!x){brReview=false;}else{
        const acts=x.type==="decision"?[["Outcome was good: archive",()=>{const o=prompt("How did it turn out? (optional)");brUpd(x.id,{status:"done",doneAt:today,...(o?{outcome:o}:{})});}],["Check again in a month",()=>brKeep(x,30)],["Turn into a task",()=>brToTask(x,"today")]]
          :x.type==="learning"?[["I remember it: show me later",()=>brKeep(x)],["Apply it: make a task",()=>brToTask(x,"tomorrow")],["Archive",()=>brUpd(x.id,{status:"done",doneAt:today})]]
          :[["Do it: task for tomorrow",()=>brToTask(x,"tomorrow")],["Keep: next week",()=>brKeep(x,7)],["Someday: in 3 months",()=>brKeep(x,90)],["Let it go",()=>brUpd(x.id,{status:"done",doneAt:today,as:"dropped"})]];
        review=el("section",{class:"panel br-rev"},el("div",{class:"br-rhead"},el("span",{class:"hint",text:"Review · "+due.length+" left"}),el("button",{type:"button",class:"mini",text:"Stop review",onclick:()=>{brReview=false;renderBrain();}})),
          ...brCardView(x),el("p",{class:"hint",text:BR_HINT[x.type]}),
          el("div",{class:"br-acts"},...acts.map(([l,f],i)=>el("button",{type:"button",class:i===0?"btn":"btn ghost",text:l,onclick:f}))));}}
    // list
    const qIn=el("input",{class:"input br-search",type:"search",placeholder:"Search your Brain","aria-label":"Search"});qIn.value=brQ;
    qIn.addEventListener("input",()=>{brQ=qIn.value;clearTimeout(qIn._t);qIn._t=setTimeout(()=>{const pos=qIn.selectionStart;renderBrainList();},150);});
    const listBox=el("div",{id:"brList"});
    rc(box,head,review,el("section",{class:"panel"},el("div",{class:"br-lhead"},qIn,el("span",{class:"hint",text:brFilter==="all"?"All":brName(brFilter)+"s"})),listBox));
    renderBrainList();
  }
  function renderBrainList(){const box=document.getElementById("brList");if(!box)return;const q=brQ.trim().toLowerCase(),today=iso(new Date());
    let xs=brNotes().filter(x=>(brFilter==="all"||x.type===brFilter)&&(!q||String(x.text+" "+(x.why||"")).toLowerCase().includes(q))).sort((a,b)=>(b.created||0)-(a.created||0));
    const open=xs.filter(x=>x.status!=="done"),closed=xs.filter(x=>x.status==="done");
    const row=x=>{const t=BR_T.find(z=>z[0]===x.type)||BR_T[3],isO=brOpen===x.id;
      const li=el("li",{class:"br-row"+(isO?" open":"")+(x.status==="done"?" done":"")},
        el("button",{type:"button",class:"br-rbtn","aria-expanded":String(isO),onclick:()=>{brOpen=isO?null:x.id;renderBrainList();}},
          el("span",{class:"br-dot t-"+x.type,"aria-hidden":"true",text:t[2]}),
          el("span",{class:"br-snip",text:x.text||"(image)"}),
          el("span",{class:"hint br-when",text:x.status==="done"?(x.as==="task"?"became a task":x.as==="dropped"?"let go":"archived"):x.status==="inbox"?"new":(x.review<=today?"due":"review "+fmt(x.review,{day:"numeric",month:"short"}))})));
      if(isO){const ta=el("textarea",{class:"br-ta",rows:"3"});ta.value=x.text||"";
        li.append(el("div",{class:"br-detail"},ta,dictBar(ta),x.why?el("p",{class:"br-why-t"},el("b",{text:"Why: "}),x.why):null,...(x.img||[]).map(brImg),
          el("div",{class:"br-acts"},el("button",{type:"button",class:"btn ghost",text:"Save",onclick:()=>{brUpd(x.id,{text:ta.value.trim()});toast("Saved");}}),
            x.status!=="done"?el("button",{type:"button",class:"btn ghost",text:"Make it a task",onclick:()=>brToTask(x,"tomorrow")}):el("button",{type:"button",class:"btn ghost",text:"Bring back",onclick:()=>brUpd(x.id,{status:"inbox"})}),
            x.status!=="done"?el("button",{type:"button",class:"btn ghost",text:"Archive",onclick:()=>brUpd(x.id,{status:"done",doneAt:iso(new Date())})}):null,
            el("select",{"aria-label":"Type",onchange:e=>brUpd(x.id,{type:e.target.value})},...BR_T.map(([k,n,ic])=>{const o=el("option",{value:k,text:n});if(k===x.type)o.selected=true;return o;})),
            el("button",{type:"button",class:"mini danger",text:"Delete",onclick:()=>{if(confirmDel(li))brUpd(x.id,{status:"deleted"});}}))));}
      return li;};
    rc(box,open.length?el("ul",{class:"br-list"},...open.map(row)):el("p",{class:"hint",text:q?"Nothing matches.":"Empty. Press N anywhere, or use the Capture line on Today."}),
      closed.length?el("details",{class:"pt-det"},el("summary",{},el("span",{text:"Archived"}),el("span",{class:"hint",text:String(closed.length)})),el("ul",{class:"br-list"},...closed.slice(0,200).map(row))):null);}
  function renderBrQuick(){const f=document.getElementById("brQuick");if(!f)return;const n=brDue().length,b=f.querySelector(".br-due");
    if(n&&!b)f.append(el("button",{type:"button",class:"mini br-due",text:n+" to review",onclick:()=>{brReview=true;setPage("brain");}}));else if(b){if(n)b.textContent=n+" to review";else b.remove();}}
  function confirmDel(li){if(li.dataset.arm==="1")return true;li.dataset.arm="1";toast("Tap Delete again to remove it");setTimeout(()=>{li.dataset.arm="";},3000);return false;}
  // ---------- dictation: speak, it types, then clean it up (on your device) or enhance it (with Claude) ----------
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  let dictLang="en-US";try{dictLang=localStorage.getItem("sb-dict")||dictLang;}catch(e){}
  let dictNow=null;
  function dictClean(t,lang){let x=" "+String(t||"")+" ";
    x=x.replace(/\s+(um+|uh+|erm+|hmm+|ah+)\s*,?/gi," ").replace(/\b(you know|i mean|like),\s*/gi,"");
    x=x.replace(/\s(يعني|امم+|اه+|ممم+)\s/g," ").replace(/\s(يعني|امم+|اه+|ممم+)\s/g," ");
    x=x.replace(/\s+/g," ").replace(/\s+([,.!?،؟])/g,"$1").replace(/—/g,",").trim();
    if(!/[؀-ۿ]/.test(x)){x=x.replace(/\bi\b/g,"I").replace(/(^|[.!?]\s+)([a-z])/g,(m,a,b)=>a+b.toUpperCase());}
    if(x&&!/[.!?؟…:]$/.test(x))x+=/[؀-ۿ]/.test(x)?".":".";
    return x;}
  function dictSet(field,v){field.value=v;field.dispatchEvent(new Event("input",{bubbles:true}));}
  function dictStop(){if(!dictNow)return;dictNow.keep=false;try{dictNow.rec.stop();}catch(e){}}
  function dictStart(field,btn,onEnd){if(!SR){toast("Speech isn't supported in this browser. Use Chrome, Edge or Safari, or your keyboard's mic.");return;}
    if(dictNow){const same=dictNow.field===field;dictStop();if(same)return;}
    const rec=new SR();rec.lang=dictLang;rec.continuous=true;rec.interimResults=true;
    const base=field.value?field.value.replace(/\s*$/," "):"";const st={rec,field,btn,keep:true,final:"",base,onEnd};dictNow=st;
    rec.onresult=e=>{let interim="";for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(r.isFinal)st.final+=r[0].transcript.trim()+" ";else interim+=r[0].transcript;}
      dictSet(field,st.base+st.final+interim);try{field.scrollTop=field.scrollHeight;}catch(err){}};
    rec.onerror=e=>{if(e.error==="not-allowed"||e.error==="service-not-allowed"){st.keep=false;toast("Allow the microphone for this app, then try again");}else if(e.error==="network"){st.keep=false;toast("Speech needs an internet connection");}};
    rec.onend=()=>{if(st.keep&&dictNow===st){try{rec.start();return;}catch(err){}}
      if(dictNow===st)dictNow=null;btn.classList.remove("rec");btn.setAttribute("aria-pressed","false");btn.textContent="🎙";
      dictSet(field,(st.base+st.final).replace(/\s+$/,"")+(st.final?"":field.value.slice((st.base+st.final).length)));if(st.onEnd&&st.final)st.onEnd();};
    try{rec.start();btn.classList.add("rec");btn.setAttribute("aria-pressed","true");btn.textContent="■";field.focus();}catch(e){toast("The microphone couldn't start");dictNow=null;}}
  // the small bar under a text box: mic · language · clean up · enhance
  function dictBar(field,opt){opt=opt||{};let undo=null;
    const mic=el("button",{type:"button",class:"dc-mic","aria-pressed":"false","aria-label":"Dictate. Tap again to stop",title:"Speak to type",text:"🎙",onclick:()=>dictStart(field,mic,()=>{if(opt.autoClean){dictSet(field,dictClean(field.value,dictLang));}})});
    const lang=el("button",{type:"button",class:"dc-lang",title:"Dictation language","aria-label":"Dictation language: "+(dictLang.startsWith("ar")?"Arabic":"English"),text:dictLang.startsWith("ar")?"ع":"EN",onclick:()=>{dictLang=dictLang.startsWith("ar")?"en-US":"ar-EG";try{localStorage.setItem("sb-dict",dictLang);}catch(e){}
      document.querySelectorAll(".dc-lang").forEach(b=>{b.textContent=dictLang.startsWith("ar")?"ع":"EN";b.setAttribute("aria-label","Dictation language: "+(dictLang.startsWith("ar")?"Arabic":"English"));});if(dictNow){const f=dictNow.field,b=dictNow.btn;dictStop();setTimeout(()=>dictStart(f,b),250);}}});
    if(opt.compact)return el("span",{class:"dc-bar compact"},mic,lang);
    const undoBtn=el("button",{type:"button",class:"mini",text:"Undo",hidden:"",onclick:()=>{if(undo!==null){dictSet(field,undo);undo=null;undoBtn.hidden=true;}}});
    const clean=el("button",{type:"button",class:"mini",text:"Clean up",title:"Remove filler words, fix capitals and punctuation. Works offline",onclick:()=>{if(dictNow&&dictNow.field===field){dictStop();setTimeout(()=>clean.click(),300);return;}if(!field.value.trim())return;undo=field.value;dictSet(field,dictClean(field.value,dictLang));undoBtn.hidden=false;}});
    const enh=el("button",{type:"button",class:"mini",text:"✦ Enhance",title:"Claude rewrites it clearly in your voice and rules",onclick:async()=>{if(dictNow&&dictNow.field===field){dictStop();setTimeout(()=>enh.click(),300);return;}const t0=field.value.trim();if(!t0)return;enh.disabled=true;enh.textContent="Enhancing...";
      const t=await dfRun("This text was dictated by voice. Rewrite it as clean written text: fix grammar, punctuation and flow, remove filler and repetition, keep my meaning, my voice and the language I spoke"+(opt.kind?", shaped as "+opt.kind:"")+". Return only the text.\n\n"+t0);
      enh.disabled=false;enh.textContent="✦ Enhance";if(t){undo=field.value;dictSet(field,t.trim());undoBtn.hidden=false;}}});
    return el("div",{class:"dc-bar"},mic,lang,clean,enh,undoBtn);}
  // ---------- Design Fellow: prompts, mood boards, content and briefs per project. Works offline; Claude helps when online ----------
  const DF_TOOLS=[["prompt","Prompts"],["board","Mood boards"],["draft","Content"],["brief","Briefs"],["ask","Ask Fellow"]];
  const DF_BANNED=["leverage","elevate","seamless","robust","delve","unlock","empower","holistic","cutting-edge","passionate","dedicated","meticulous","risk free","risk-free"];
  const DF_MODELS={flux:"Flux Pro",mj:"Midjourney",nano:"Nano Banana",firefly:"Adobe Firefly"};
  const DF_STYLE=["Photoreal editorial","Cinematic still","Minimal studio product","3D render, soft materials","Flat vector illustration","Isometric illustration","Abstract data art"];
  const DF_LIGHT=["Soft diffused studio light","Golden hour","Dramatic rim light","Overcast, even light","Neon accents in the dark","Window light, soft shadows"];
  const DF_CAM=["35mm, eye level","85mm portrait, shallow depth","Top-down flat lay","Wide establishing shot","Macro close-up","Three-quarter angle"];
  const DF_AR=["16:9","4:3","1:1","3:2","9:16","4:5"];
  const DF_DRAFT=[["linkedin","LinkedIn post"],["proposal","Upwork proposal"],["client","Client message"],["case","Case study"],["titles","Slide titles"],["other","Other"]];
  const DF_BRIEF=[["context","Business context"],["goal","Goal and success"],["audience","Audience"],["message","Message"],["delivery","Delivery mode"],["constraints","Constraints"],["story","Content and story"],["visual","Brand and visual direction"]];
  let dfTool="prompt",dfProj="all",dfSel=null,dfTimer=null,dfAsk=[],dfBusy=false,dfSample=undefined;
  try{const v=JSON.parse(localStorage.getItem("sb-df")||"{}");dfTool=v.tool||dfTool;dfProj=v.proj||dfProj;}catch(e){}
  function dfRemember(){try{localStorage.setItem("sb-df",JSON.stringify({tool:dfTool,proj:dfProj}));}catch(e){}}
  function dfItems(kind){return Object.entries(state.design||{}).map(([id,x])=>({id,...x})).filter(x=>x.kind===kind&&!x.deleted&&(dfProj==="all"||x.project===dfProj)).sort((a,b)=>(b.updated||0)-(a.updated||0));}
  function dfProjName(id){const p=state.projects&&state.projects[id];return p?p.name:"";}
  function dfSave(id,patch,now){const cur=state.design[id];if(!cur)return;const v={...cur,...patch,updated:Date.now()};state.design={...state.design,[id]:v};
    clearTimeout(dfTimer);const go=()=>store.set("design/"+id,v).catch(fail);if(now)go();else dfTimer=setTimeout(go,700);}
  async function dfNew(kind,extra){if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return;}
    const base={kind,project:dfProj==="all"?"":dfProj,title:"Untitled "+(DF_TOOLS.find(t=>t[0]===kind)||["",""])[1].toLowerCase().replace(/s$/,""),created:Date.now(),updated:Date.now(),...(extra||{})};
    try{const ref=await store.add("design",base);state.design={...state.design,[ref.id]:base};dfSel=ref.id;renderFellow(true);}catch(e){fail(e);}}
  function dfDel(id,btn){if(btn.dataset.arm!=="1"){btn.dataset.arm="1";btn.textContent="Tap again to delete";setTimeout(()=>{btn.dataset.arm="";btn.textContent="Delete";},3000);return;}
    dfSave(id,{deleted:true},true);if(dfSel===id)dfSel=null;renderFellow(true);}
  // ---- AI (Claude) when available ----
  async function dfAI(){if(dfSample!==undefined)return dfSample;try{dfSample=await window.claude?.use?.("sample")||null;}catch(e){dfSample=null;}return dfSample;}
  function dfRules(){return ["You are Design Fellow, the creative partner of Ahmed Fetyan, a Cairo-based presentation designer and deck strategist (\"Ex-Doctor. Deck Strategist.\").",
    "He works content-first: content and structure before layout, then design system, then polish. AI executes; Ahmed decides.",
    "Copy rules: no em dashes ever; no \"not just X, it's Y\"; never these words: "+DF_BANNED.join(", ")+"; no self-praise, no hedging; plain language.",
    "Slide titles are action titles carrying one factual takeaway, never category labels. Client messages stay under 500 characters.",
    "LinkedIn: lead with the reader's pain, teach or reveal a dysfunction, no self-promotion. Proposals: open with \"You need...\" plus one insight, matched proof, end with 1 to 2 specialist questions.",
    "Visual prompts: first 4 content keywords, 4 message shapes, 4 visual ideas, then one detailed prompt. Always return the full prompt, never a fragment.",
    "Answer briefly and directly, ready to paste. Arabic or English, matching the request."].join("\n");}
  async function dfRun(task,onText){const sm=await dfAI();if(!sm){toast("Claude is available when you open the app inside Claude. The offline tools still work here.");return null;}
    dfBusy=true;try{const {text}=await sm([{role:"user",content:dfRules()+"\n\n"+task}],{onText:onText?({text})=>onText(text):undefined});return text;}
    catch(e){toast(e&&e.code==="rate_limited"?"Too many requests. Try again in a moment.":"Claude couldn't answer right now.");return null;}finally{dfBusy=false;}}
  // ---- prompt builder (offline) ----
  function dfPromptText(x){const ideas=(x.ideas||[]).filter(Boolean),k=(x.kw||[]).filter(Boolean),sh=(x.shapes||[]).filter(Boolean);
    const subject=(x.subject||"").trim()||ideas[0]||k.join(", ");const parts=[subject,x.style,x.light,x.cam,x.palette?("color palette: "+x.palette):"",x.mood?("mood: "+x.mood):"",sh[0]?("the image should communicate "+sh[0].toLowerCase()):""].filter(Boolean);
    const m=x.model||"flux",ar=x.ar||"16:9";
    if(m==="mj")return parts.join(", ")+" --ar "+ar+" --style raw --v 7"+(x.avoid?" --no "+x.avoid:"")+(x.sref?" --sref "+x.sref+" --sw 250":"");
    if(m==="nano")return "Create an image: "+parts.join(". ")+". Aspect ratio "+ar+"."+(x.avoid?" Avoid: "+x.avoid+".":"");
    return parts.map((t,i)=>i?t.charAt(0).toUpperCase()+t.slice(1):t).join(". ")+". Aspect ratio "+ar+"."+(x.avoid?" Do not include: "+x.avoid+".":"");}
  function dfPromptCheck(x){return [["Subject",!!(x.subject||(x.ideas||[])[0])],["Message",(x.shapes||[]).some(Boolean)],["Style",!!x.style],["Lighting",!!x.light],["Camera",!!x.cam],["Palette",!!x.palette],["Mood",!!x.mood]];}
  function dfKeywords(text){const stop=new Set("the a an and or of for to in on with from that this is are be as at by it its into your our their we you they about over under more most less very just".split(" "));
    const seen=[];String(text||"").toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu," ").split(/\s+/).forEach(w=>{if(w.length>3&&!stop.has(w)&&!seen.includes(w))seen.push(w);});return seen.slice(0,4);}
  const dfInp=(val,ph,on,cls)=>{const i=el("input",{class:"df-in"+(cls?" "+cls:""),placeholder:ph,"aria-label":ph});i.value=val||"";i.addEventListener("input",()=>on(i.value));return i;};
  const dfTa=(val,ph,on,rows)=>{const t=el("textarea",{class:"df-ta",rows:String(rows||4),placeholder:ph,"aria-label":ph});t.value=val||"";t.addEventListener("input",()=>on(t.value));return t;};
  const dfChips=(opts,cur,on)=>el("div",{class:"df-chips"},...opts.map(o=>el("button",{type:"button","aria-pressed":String(cur===o),text:o,onclick:()=>on(cur===o?"":o)})));
  const dfCopy=(getText,label)=>el("button",{type:"button",class:"btn",text:label||"Copy",onclick:async()=>{try{await navigator.clipboard.writeText(getText());toast("Copied");}catch(e){toast("Select the text and copy it");}}});
  function dfPromptEditor(x){const id=x.id,upd=(k,v,re)=>{dfSave(id,{[k]:v});x[k]=v;out.textContent=dfPromptText(x);paintCheck();if(re)renderFellow(true);};
    const out=el("pre",{class:"df-out",text:dfPromptText(x)}),chk=el("div",{class:"df-check"});
    const paintCheck=()=>rc(chk,...dfPromptCheck(x).map(([n,ok])=>el("span",{class:ok?"ok":"",text:(ok?"✓ ":"○ ")+n})));paintCheck();
    const four=(key,label,ph)=>el("div",{class:"df-four"},el("span",{class:"label",text:label}),el("div",{class:"df-4grid"},...[0,1,2,3].map(i=>dfInp((x[key]||[])[i],ph+" "+(i+1),v=>{const a=[...(x[key]||["","","",""])];a[i]=v;upd(key,a);}))));
    const aiBtn=el("button",{type:"button",class:"btn ghost",text:"✦ Level up with Claude",onclick:async()=>{aiBtn.disabled=true;aiBtn.textContent="Thinking...";
      const t=await dfRun("Brief: "+(x.brief||"")+"\nCurrent fields: "+JSON.stringify({kw:x.kw,shapes:x.shapes,ideas:x.ideas,subject:x.subject,style:x.style,light:x.light,cam:x.cam,palette:x.palette,mood:x.mood,avoid:x.avoid})+"\nTarget model: "+DF_MODELS[x.model||"flux"]+", aspect "+(x.ar||"16:9")+
        "\nReturn ONLY JSON: {\"kw\":[4],\"shapes\":[4],\"ideas\":[4],\"subject\":\"\",\"style\":\"\",\"light\":\"\",\"cam\":\"\",\"palette\":\"\",\"mood\":\"\",\"avoid\":\"\",\"prompt\":\"full final prompt for the target model\"}");
      aiBtn.disabled=false;aiBtn.textContent="✦ Level up with Claude";if(!t)return;try{const j=JSON.parse(t.slice(t.indexOf("{"),t.lastIndexOf("}")+1));const patch={};["kw","shapes","ideas","subject","style","light","cam","palette","mood","avoid","prompt"].forEach(k=>{if(j[k])patch[k]=j[k];});dfSave(id,patch,true);Object.assign(x,patch);renderFellow(true);toast("Promoted");}catch(e){toast("Claude answered in an unexpected format. Try again.");}}});
    return el("div",{class:"df-ed"},
      dfInp(x.title,"Title",v=>{dfSave(id,{title:v});}, "df-title"),
      el("span",{class:"label",text:"Brief or keywords"}),(()=>{const t=dfTa(x.brief,"What is the slide or asset about? Paste the content, or a few keywords",v=>upd("brief",v),3);return el("div",{class:"df-ed"},t,dictBar(t,{kind:"a short visual brief"}));})(),
      el("div",{class:"df-row"},el("button",{type:"button",class:"btn ghost",text:"Pull 4 keywords from the brief",onclick:()=>{const k=dfKeywords(x.brief);if(!k.length){toast("Write a brief first");return;}upd("kw",[...k,"","","",""].slice(0,4),true);}}),aiBtn),
      four("kw","1 · 4 content keywords","Keyword"),four("shapes","2 · 4 message shapes the visual can carry","e.g. growth from chaos"),four("ideas","3 · 4 visual ideas","Idea"),
      el("span",{class:"label",text:"4 · The prompt"}),
      el("div",{class:"df-row"},el("select",{class:"df-sel","aria-label":"Model",onchange:e=>upd("model",e.target.value)},...Object.entries(DF_MODELS).map(([k,n])=>{const o=el("option",{value:k,text:n});if((x.model||"flux")===k)o.selected=true;return o;})),
        el("select",{class:"df-sel","aria-label":"Aspect ratio",onchange:e=>upd("ar",e.target.value)},...DF_AR.map(a=>{const o=el("option",{value:a,text:a});if((x.ar||"16:9")===a)o.selected=true;return o;}))),
      dfInp(x.subject,"Main subject (defaults to visual idea 1)",v=>upd("subject",v)),
      el("span",{class:"label",text:"Style"}),dfChips(DF_STYLE,x.style,v=>upd("style",v,true)),
      el("span",{class:"label",text:"Lighting"}),dfChips(DF_LIGHT,x.light,v=>upd("light",v,true)),
      el("span",{class:"label",text:"Camera"}),dfChips(DF_CAM,x.cam,v=>upd("cam",v,true)),
      el("div",{class:"df-2"},dfInp(x.palette,"Palette, e.g. deep navy, warm sand, one coral accent",v=>upd("palette",v)),dfInp(x.mood,"Mood, e.g. calm confidence",v=>upd("mood",v))),
      el("div",{class:"df-2"},dfInp(x.avoid,"Avoid, e.g. text, logos, clutter",v=>upd("avoid",v)),x.model==="mj"?dfInp(x.sref,"Midjourney --sref code (optional)",v=>upd("sref",v)):el("span")),
      chk,out,x.prompt?el("div",{class:"df-ai"},el("span",{class:"label",text:"Claude's version"}),el("pre",{class:"df-out",text:x.prompt}),dfCopy(()=>x.prompt,"Copy Claude's prompt")):null,
      el("div",{class:"df-row"},dfCopy(()=>out.textContent,"Copy prompt"),el("span",{class:"hint",text:"Built on your device. Works offline."})));}
  // ---- mood board ----
  function dfBoardEditor(x){const id=x.id,items=x.items||[];
    const addItem=it=>{const n=[...(state.design[id].items||[]),{...it,at:Date.now()}];dfSave(id,{items:n},true);x.items=n;renderFellow(true);};
    const urlIn=el("input",{class:"df-in",placeholder:"Paste an image link from the web, or paste / drop an image here","aria-label":"Image link"});
    const addUrl=()=>{const v=urlIn.value.trim();if(!/^https?:\/\//.test(v)){toast("Paste an image link that starts with http");return;}addItem({url:v});urlIn.value="";};
    urlIn.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addUrl();}});
    const upFiles=async fs=>{if(!(window.sbDrive&&sbDrive.ready())){toast("Connect Google Drive in Settings to keep images. Links work without it.");return;}
      for(const f of fs){try{const up=await sbDrive.upload(f,"board-"+Date.now()+"."+((f.type.split("/")[1]||"png").replace("jpeg","jpg")),"Mood boards");addItem({drive:up.id});}catch(e){toast("Upload failed");}}};
    urlIn.addEventListener("paste",e=>{const fs=[...((e.clipboardData||{}).items||[])].filter(i=>i.kind==="file").map(i=>i.getAsFile()).filter(Boolean);if(fs.length){e.preventDefault();upFiles(fs);}});
    const drop=el("div",{class:"df-drop"},urlIn,el("button",{type:"button",class:"btn",text:"Add",onclick:addUrl}));
    drop.addEventListener("dragover",e=>{e.preventDefault();drop.classList.add("on");});drop.addEventListener("dragleave",()=>drop.classList.remove("on"));
    drop.addEventListener("drop",e=>{e.preventDefault();drop.classList.remove("on");const fs=[...e.dataTransfer.files].filter(f=>/^image\//.test(f.type));if(fs.length)upFiles(fs);else{const u=e.dataTransfer.getData("text/uri-list")||e.dataTransfer.getData("text");if(/^https?:/.test(u))addItem({url:u.trim()});}});
    const pal=x.palette||[];
    const sw=el("div",{class:"df-pal"},...pal.map((c,i)=>el("button",{type:"button",class:"df-sw",style:"background:"+c,title:c+" · tap to remove","aria-label":"Remove colour "+c,onclick:()=>{const n=pal.filter((_,j)=>j!==i);dfSave(id,{palette:n},true);x.palette=n;renderFellow(true);}})),
      pal.length<8?(()=>{const ci=el("input",{type:"color","aria-label":"Add a colour",class:"df-color"});ci.addEventListener("change",()=>{const n=[...pal,ci.value];dfSave(id,{palette:n},true);x.palette=n;renderFellow(true);});return ci;})():null);
    const grid=el("div",{class:"df-grid"},...items.map((it,i)=>{const img=el("img",{alt:it.note||"Reference",loading:"lazy",referrerpolicy:"no-referrer"});
      if(it.url)img.src=it.url;else if(it.drive&&window.sbDrive&&sbDrive.ready())sbDrive.url(it.drive).then(u=>img.src=u).catch(()=>{});
      const note=el("input",{class:"df-note",placeholder:"Why this one?","aria-label":"Note"});note.value=it.note||"";note.addEventListener("input",()=>{const n=[...(state.design[id].items||[])];n[i]={...n[i],note:note.value};dfSave(id,{items:n});});
      return el("figure",{class:"df-tile"},img,note,el("button",{type:"button",class:"df-x","aria-label":"Remove image",text:"×",onclick:()=>{const n=(state.design[id].items||[]).filter((_,j)=>j!==i);dfSave(id,{items:n},true);x.items=n;renderFellow(true);}}));}));
    const st=el("div",{class:"seg",role:"group","aria-label":"Status"},...[["exploring","Exploring"],["review","Ready for review"],["approved","Approved"]].map(([k,n])=>el("button",{type:"button","aria-pressed":String((x.status||"exploring")===k),text:n,onclick:()=>{dfSave(id,{status:k},true);x.status=k;renderFellow(true);}})));
    return el("div",{class:"df-ed"},dfInp(x.title,"Board title",v=>dfSave(id,{title:v}),"df-title"),
      el("span",{class:"label",text:"Tone → Style → Approval"}),
      el("div",{class:"df-2"},dfInp(x.tone,"Tone: 3 words, e.g. calm, precise, warm",v=>dfSave(id,{tone:v})),dfInp(x.styleref,"Style references, e.g. Swiss grid, editorial photography",v=>dfSave(id,{styleref:v}))),
      st,el("span",{class:"label",text:"Palette"}),sw,el("span",{class:"label",text:"References ("+items.length+")"}),drop,
      items.length?grid:el("p",{class:"hint",text:"Links cost no storage. Pasted or dropped image files go to your Google Drive."}));}
  // ---- content drafts with a live copy check ----
  function dfLint(x){const t=String(x.text||""),low=t.toLowerCase(),out=[];
    DF_BANNED.forEach(w=>{const n=(low.match(new RegExp("\\b"+w.replace("-","[- ]")+"\\b","g"))||[]).length;if(n)out.push(["bad","\""+w+"\" ×"+n]);});
    const em=(t.match(/—/g)||[]).length;if(em)out.push(["bad","Em dash ×"+em]);
    if(/\bnot just\b/i.test(t))out.push(["bad","\"not just\" construction"]);
    if(x.type==="client"&&t.length>500)out.push(["bad",t.length+" characters, keep client messages under 500"]);
    if(x.type==="proposal"&&t.trim()&&!/^you need/i.test(t.trim()))out.push(["warn","Open with \"You need...\" plus one insight"]);
    if(x.type==="titles")t.split("\n").filter(Boolean).forEach(l=>{if(l.trim().split(/\s+/).length<4)out.push(["warn","\""+l.trim()+"\" reads like a label. Make it an action title"]);});
    if(x.type==="linkedin"&&t.trim()&&/^(i |i'm|we |my )/i.test(t.trim()))out.push(["warn","Lead with the reader's pain, not yourself"]);
    return out;}
  function dfDraftEditor(x){const id=x.id,lint=el("div",{class:"df-lint"}),meta=el("span",{class:"hint"});
    const paint=()=>{const t=String(x.text||"");meta.textContent=t.length+" characters · "+(t.trim()?t.trim().split(/\s+/).length:0)+" words";const L=dfLint(x);
      rc(lint,...(L.length?L.map(([k,m])=>el("span",{class:"df-l "+k,text:(k==="bad"?"✕ ":"! ")+m})):[el("span",{class:"df-l ok",text:"✓ Passes your copy rules"})]));};
    const ta=dfTa(x.text,"Write here. Your copy rules are checked as you type.",v=>{x.text=v;dfSave(id,{text:v});paint();},12);paint();
    const aiBtn=el("button",{type:"button",class:"btn ghost",text:"✦ Improve with Claude",onclick:async()=>{if(!String(x.text||"").trim()){toast("Write a draft first");return;}aiBtn.disabled=true;aiBtn.textContent="Thinking...";
      const t=await dfRun("Improve this "+(DF_DRAFT.find(d=>d[0]===x.type)||["","draft"])[1]+(x.cat?" ("+x.cat+" post)":"")+". Keep my voice and meaning, apply my rules, return only the improved text.\n\n"+x.text);
      aiBtn.disabled=false;aiBtn.textContent="✦ Improve with Claude";if(t){dfSave(id,{alt:t},true);x.alt=t;renderFellow(true);}}});
    return el("div",{class:"df-ed"},dfInp(x.title,"Title",v=>dfSave(id,{title:v}),"df-title"),
      el("div",{class:"df-row"},el("select",{class:"df-sel","aria-label":"Type",onchange:e=>{dfSave(id,{type:e.target.value},true);x.type=e.target.value;renderFellow(true);}},...DF_DRAFT.map(([k,n])=>{const o=el("option",{value:k,text:n});if((x.type||"linkedin")===k)o.selected=true;return o;})),
        (x.type||"linkedin")==="linkedin"?el("div",{class:"seg",role:"group","aria-label":"Post category"},...["CONVERT","HIRE","REACH"].map(c=>el("button",{type:"button","aria-pressed":String(x.cat===c),text:c,onclick:()=>{const v=x.cat===c?"":c;dfSave(id,{cat:v},true);x.cat=v;renderFellow(true);}}))):null),
      ta,dictBar(ta,{kind:(DF_DRAFT.find(d=>d[0]===(x.type||"linkedin"))||["","draft"])[1]}),el("div",{class:"df-row"},meta,dfCopy(()=>x.text||"","Copy"),aiBtn),lint,
      x.alt?el("div",{class:"df-ai"},el("span",{class:"label",text:"Claude's version"}),el("pre",{class:"df-out",text:x.alt}),el("div",{class:"df-row"},dfCopy(()=>x.alt,"Copy"),el("button",{type:"button",class:"btn ghost",text:"Use it",onclick:()=>{dfSave(id,{text:x.alt,alt:""},true);x.text=x.alt;x.alt="";renderFellow(true);}}),el("button",{type:"button",class:"mini",text:"Discard",onclick:()=>{dfSave(id,{alt:""},true);x.alt="";renderFellow(true);}}))):null);}
  // ---- 8-layer brief ----
  function dfBriefMd(x){return "# "+(x.title||"Brief")+(x.brand?"\nBrand: "+x.brand:"")+"\n\n"+DF_BRIEF.map(([k,n],i)=>"## "+(i+1)+". "+n+"\n"+(x[k]||"")).join("\n\n");}
  function dfBriefEditor(x){const id=x.id;const filled=DF_BRIEF.filter(([k])=>String(x[k]||"").trim()).length;
    const aiBtn=el("button",{type:"button",class:"btn ghost",text:"✦ Fill the gaps with Claude",onclick:async()=>{aiBtn.disabled=true;aiBtn.textContent="Thinking...";
      const t=await dfRun("Complete this 8-layer brief. Keep what I wrote, fill empty layers with sensible proposals marked [proposed]. Return ONLY JSON with keys "+DF_BRIEF.map(b=>b[0]).join(", ")+".\n"+JSON.stringify(Object.fromEntries(DF_BRIEF.map(([k])=>[k,x[k]||""]).concat([["brand",x.brand||""],["title",x.title||""]]))));
      aiBtn.disabled=false;aiBtn.textContent="✦ Fill the gaps with Claude";if(!t)return;try{const j=JSON.parse(t.slice(t.indexOf("{"),t.lastIndexOf("}")+1));const patch={};DF_BRIEF.forEach(([k])=>{if(j[k]&&!String(x[k]||"").trim())patch[k]=j[k];});dfSave(id,patch,true);Object.assign(x,patch);renderFellow(true);}catch(e){toast("Claude answered in an unexpected format. Try again.");}}});
    return el("div",{class:"df-ed"},el("div",{class:"df-2"},dfInp(x.title,"Brief title",v=>dfSave(id,{title:v}),"df-title"),dfInp(x.brand,"Brand name",v=>dfSave(id,{brand:v}))),
      el("div",{class:"df-row"},el("span",{class:"hint",text:filled+" of 8 layers filled"}),dfCopy(()=>dfBriefMd(x),"Copy as Markdown"),aiBtn),
      ...DF_BRIEF.map(([k,n],i)=>el("label",{class:"df-layer"},el("span",{class:"label",text:(i+1)+" · "+n}),dfTa(x[k],n,v=>{x[k]=v;dfSave(id,{[k]:v});},2))));}
  // ---- Ask Fellow: chat with Claude about the selected project ----
  function dfAskView(){const log=el("div",{class:"df-chat"},...(dfAsk.length?dfAsk.map(m=>el("div",{class:"df-msg "+m.role,text:m.text})):[el("p",{class:"hint",text:"Ask for ideas, critiques, titles, hooks, prompts or plans. Fellow knows your rules"+(dfProj!=="all"?" and the project \u201c"+dfProjName(dfProj)+"\u201d":"")+". Answers can be saved to your Brain."})]));
    const ta=el("textarea",{class:"df-ta",rows:"3",placeholder:"e.g. Give me 5 action titles for a Series A traction slide","aria-label":"Ask Fellow"});
    const send=async()=>{const q=ta.value.trim();if(!q||dfBusy)return;ta.value="";dfAsk.push({role:"me",text:q});const ai={role:"ai",text:"Thinking..."};dfAsk.push(ai);renderFellow(true);
      const ctx=dfProj!=="all"?(()=>{const p=state.projects[dfProj]||{};return "Project: "+(p.name||"")+(p.type?" ("+p.type+")":"")+(p.notes?"\nNotes: "+String(p.notes).slice(0,1500):"");})():"";
      const hist=dfAsk.slice(-10,-1).map(m=>(m.role==="me"?"Ahmed: ":"Fellow: ")+m.text).join("\n\n");
      const t=await dfRun((ctx?ctx+"\n\n":"")+(hist?"Conversation so far:\n"+hist+"\n\n":"")+"Ahmed: "+q,txt=>{ai.text=txt;const last=document.querySelector(".df-chat .df-msg.ai:last-child");if(last)last.textContent=txt;});
      ai.text=t||"Claude isn't available here. Open the app inside Claude to ask Fellow.";renderFellow(true);};
    ta.addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();send();}});
    const last=[...dfAsk].reverse().find(m=>m.role==="ai"&&m.text&&m.text!=="Thinking...");
    return el("div",{class:"df-ed"},log,ta,dictBar(ta,{kind:"a clear question"}),el("div",{class:"df-row"},el("button",{type:"button",class:"btn",text:"Ask",onclick:send}),
      last?el("button",{type:"button",class:"btn ghost",text:"Save last answer to Brain",onclick:()=>brAdd(last.text,"note")}):null,
      dfAsk.length?el("button",{type:"button",class:"mini",text:"Clear",onclick:()=>{dfAsk=[];renderFellow(true);}}):null,el("span",{class:"hint",text:"Ctrl + Enter sends"})));}
  function renderFellow(force){
    const box=document.getElementById("fellowBody");if(!box)return;const pg=box.closest(".page");if(pg&&pg.hidden)return;
    if(!force&&box.contains(document.activeElement)&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;
    const keep=window.scrollY;
    const projs=Object.entries(state.projects||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
    const psel=el("select",{class:"df-sel df-proj","aria-label":"Project",onchange:e=>{dfProj=e.target.value;dfSel=null;dfRemember();renderFellow(true);}},el("option",{value:"all",text:"All projects"}),...projs.map(([id,p])=>{const o=el("option",{value:id,text:p.name||"Project"});if(dfProj===id)o.selected=true;return o;}));
    const tabs=el("div",{class:"seg df-tabs",role:"tablist","aria-label":"Tools"},...DF_TOOLS.map(([k,n])=>el("button",{type:"button",role:"tab","aria-selected":String(dfTool===k),"aria-pressed":String(dfTool===k),text:n,onclick:()=>{dfTool=k;dfSel=null;dfRemember();renderFellow(true);}})));
    const head=el("div",{class:"df-head"},el("div",{},el("h2",{text:"Design Fellow"}),el("p",{class:"hint",text:"Prompts, mood boards, content and briefs for every project. Works offline; Claude helps when it's available."})),psel);
    let body;
    if(dfTool==="ask")body=el("section",{class:"panel"},dfAskView());
    else{const list=dfItems(dfTool);if(!dfSel||!list.some(x=>x.id===dfSel))dfSel=list[0]?list[0].id:null;const cur=list.find(x=>x.id===dfSel);
      const side=el("div",{class:"df-side"},el("button",{type:"button",class:"btn",text:"+ New "+(DF_TOOLS.find(t=>t[0]===dfTool)[1]).toLowerCase().replace(/s$/,""),onclick:()=>dfNew(dfTool,dfTool==="draft"?{type:"linkedin"}:{})}),
        el("ul",{class:"df-list"},...list.map(x=>el("li",{},el("button",{type:"button",class:"df-li"+(x.id===dfSel?" on":""),onclick:()=>{dfSel=x.id;renderFellow(true);}},
          el("span",{class:"df-lt",text:x.title||"Untitled"}),el("span",{class:"hint",text:(x.project&&dfProj==="all"?dfProjName(x.project)+" · ":"")+fmt(iso(new Date(x.updated||x.created)),{day:"numeric",month:"short"})}))))));
      const ed=cur?(dfTool==="prompt"?dfPromptEditor(cur):dfTool==="board"?dfBoardEditor(cur):dfTool==="draft"?dfDraftEditor(cur):dfBriefEditor(cur)):el("p",{class:"hint df-empty",text:"Nothing here yet. Tap New to start."});
      const del=cur?el("button",{type:"button",class:"mini danger",text:"Delete",onclick:e=>dfDel(cur.id,e.currentTarget)}):null;
      const pmove=cur?el("select",{class:"df-sel","aria-label":"Move to project",onchange:e=>{dfSave(cur.id,{project:e.target.value},true);renderFellow(true);}},el("option",{value:"",text:"No project"}),...projs.map(([id,p])=>{const o=el("option",{value:id,text:p.name||"Project"});if(cur.project===id)o.selected=true;return o;})):null;
      body=el("section",{class:"panel df-split"},side,el("div",{class:"df-main"},ed,cur?el("div",{class:"df-row df-foot"},el("span",{class:"hint",text:"Project"}),pmove,del):null));}
    rc(box,el("section",{class:"panel"},head,tabs),body);window.scrollTo(0,keep);
  }
  // ---------- inspiration photo + quote of the day ----------
  const QUOTES=[
    ["Indeed, Allah will not change the condition of a people until they change what is in themselves.","Quran 13:11"],
    ["And that there is not for man except that for which he strives.","Quran 53:39"],
    ["Indeed, with hardship comes ease.","Quran 94:6"],
    ["The most beloved deeds to Allah are the most consistent, even if small.","Prophet Muhammad ﷺ, Bukhari and Muslim"],
    ["Allah loves that when one of you does a job, he does it with excellence.","Prophet Muhammad ﷺ, al-Bayhaqi"],
    ["The strong believer is better and more beloved to Allah than the weak believer. Strive for what benefits you, seek Allah's help, and do not give up.","Prophet Muhammad ﷺ, Muslim"],
    ["Take advantage of five before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before you are busy, and your life before your death.","Prophet Muhammad ﷺ, al-Hakim"],
    ["If the Hour comes while one of you has a sapling in his hand, let him plant it.","Prophet Muhammad ﷺ, Ahmad"],
    ["Tie your camel, then put your trust in Allah.","Prophet Muhammad ﷺ, Tirmidhi"],
    ["Whoever takes a path seeking knowledge, Allah makes easy for him a path to Paradise.","Prophet Muhammad ﷺ, Muslim"],
    ["And whoever relies upon Allah, then He is sufficient for him.","Quran 65:3"],
    ["So remember Me; I will remember you.","Quran 2:152"],
    ["You do not rise to the level of your goals. You fall to the level of your systems.","James Clear, Atomic Habits"],
    ["Amateurs sit and wait for inspiration. The rest of us just get up and go to work.","Stephen King, On Writing"],
    ["It is not that we have a short time to live, but that we waste a lot of it.","Seneca, On the Shortness of Life"],
    ["Waste no more time arguing what a good man should be. Be one.","Marcus Aurelius, Meditations"],
    ["We are what we repeatedly do. Excellence, then, is not an act, but a habit.","Will Durant, on Aristotle"],
    ["Good design is as little design as possible.","Dieter Rams"],
    ["Design is not just what it looks like and feels like. Design is how it works.","Steve Jobs"],
    ["Focus means saying no to the hundred other good ideas.","Steve Jobs"],
    ["Hard work beats talent when talent doesn't work hard.","Tim Notke"],
    ["Kill the boy, and let the man be born.","Maester Aemon, A Song of Ice and Fire"]
  ];
  function inspo(){return (state.settings&&state.settings.inspo)||{};}
  function quoteOfDay(d){const n=Math.floor(parse(d)/864e5);return QUOTES[((n%QUOTES.length)+QUOTES.length)%QUOTES.length];}
  function renderInspo(){
    const I=inspo(),hero=document.getElementById("inspoHero");
    if(hero){const show=I.img&&I.onToday!==false;hero.hidden=!show;
      if(show&&hero.dataset.k!==I.img.length+"|"+(I.quote||"")){hero.dataset.k=I.img.length+"|"+(I.quote||"");
        hero.replaceChildren(...[el("img",{src:I.img,alt:""}),I.quote?el("figcaption",{class:"inspo-q",text:I.quote}):null].filter(Boolean));}}
    const qb=document.getElementById("qodBody");
    if(qb){const today=iso(new Date()),[q,src]=quoteOfDay(today);if(qb.dataset.d!==today){qb.dataset.d=today;rc(qb,el("p",{class:"qod-q",text:"“"+q+"”"}),el("div",{class:"qod-s",text:src}));}}
    const box=document.getElementById("inspoSet");if(box&&!box.contains(document.activeElement))renderInspoSet();
  }
  function renderInspoSet(){
    const box=document.getElementById("inspoSet");if(!box)return;const I=inspo();
    const file=el("input",{type:"file",accept:"image/*",hidden:"",onchange:e=>addInspoImg(e.target)});
    const q=el("input",{class:"input",maxlength:"80",placeholder:"A line that pushes you","aria-label":"Line shown on the photo"});q.value=I.quote||"";
    const chk=(k,lbl)=>{const c=el("input",{type:"checkbox",onchange:e=>saveInspo({[k]:e.target.checked})});c.checked=I[k]!==false;return el("label",{class:"ins-chk"},c,el("span",{text:lbl}));};
    rc(box,
      el("div",{class:"ins-row"},I.img?el("img",{class:"ins-thumb",src:I.img,alt:"Your inspiration photo"}):el("div",{class:"ins-thumb empty",text:"No photo"}),
        el("div",{class:"ins-ctl"},el("div",{class:"ins-btns"},el("button",{type:"button",class:"btn ghost",text:I.img?"Change photo":"Upload a photo",onclick:()=>file.click()}),file,
          I.img?el("button",{type:"button",class:"mini",text:"Remove photo",onclick:()=>saveInspo({img:""})}):null),
          el("label",{class:"ins-q"},el("span",{text:"Line on the photo"}),q),
          el("button",{type:"button",class:"btn",text:"Save line",onclick:()=>{saveInspo({quote:q.value.trim()});toast("Saved");}}),
          chk("onToday","Show big on Today"),chk("onTimer","Show beside the focus timer"))));
  }
  async function addInspoImg(input){const f=input.files&&input.files[0];input.value="";if(!f)return;
    try{const url=URL.createObjectURL(f),im=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url;});
      const sc=Math.min(1,1000/Math.max(im.width,im.height)),cv=document.createElement("canvas");cv.width=Math.round(im.width*sc);cv.height=Math.round(im.height*sc);
      cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);URL.revokeObjectURL(url);let data="";for(const q of [0.8,0.7,0.6,0.5,0.4]){data=cv.toDataURL("image/jpeg",q);if(data.length<240000)break;}
      if(data.length>=240000){toast("That photo is too detailed to save. Try a smaller one.");return;}
      saveInspo({img:data});toast("Photo saved");}catch(e){toast("This file can't be opened as an image.");}}
  async function saveInspo(patch){const v={...inspo(),...patch,at:Date.now()};state.settings={...state.settings,inspo:v};const h=document.getElementById("inspoHero");if(h)h.dataset.k="";renderInspo();renderInspoSet();if(pFullOpen)renderPomoFull();
    if(!db){showNotice("Saving isn't available in this view. Open the page signed in.");return;}try{await store.set("settings/inspo",v);}catch(e){fail(e);}}
  function pInspoBg(){const I=inspo();if(!I.img||I.onTimer===false)return null;return el("div",{class:"pf-bg","aria-hidden":"true"},el("img",{src:I.img,alt:""}),I.quote?el("p",{text:I.quote}):null);}
  function pOverUI(r,big){if(!r||!r.overAt)return null;const mm=pOverMin(r);
    const b=(v,t)=>el("button",{type:"button","aria-pressed":String(r.overAs===v),text:t,onclick:()=>setPomo({...P(),overAs:v})});
    return el("div",{class:"pf-over"+(big?" big":"")},el("span",{"data-pover":"1",text:"The extra "+(mm?mm+" min":"time")+" was"}),el("div",{class:"seg",role:"group","aria-label":"Count the extra time as"},b("focus","Focus"),b("break","More break")));}
  function renderPomoFull(){
    const ov=document.getElementById("pomoFull");if(!ov||!pFullOpen)return;
    const r=pRun(),c=pCfg(),phase=r?r.phase:"focus",running=r&&r.startedAt&&!r.pausedAt,paused=r&&r.startedAt&&r.pausedAt;
    const pct=r&&r.durationMs?Math.min(100,pElapsed(r)/r.durationMs*100):0;
    const clk=r&&r.startedAt?pClock(r):(phase==="focus"&&c.mode==="up"?"00:00":String(phase==="focus"?c.focus:phase==="short"?c.short:c.long).padStart(2,"0")+":00");
    const main=!r||!r.startedAt?el("button",{type:"button",class:"pf-main",text:r?"Start "+PH_NAME[phase].toLowerCase():"Start focus",onclick:r?pResume:pStart})
      :r.overAt?el("button",{type:"button",class:"pf-main",text:pNextLabel(r),onclick:()=>pNext(false)})
      :running?el("button",{type:"button",class:"pf-main",text:"Pause",onclick:pPause}):el("button",{type:"button",class:"pf-main",text:"Resume",onclick:pResume});
    const bg=pInspoBg();
    ov.className="pomo-full "+phase+(paused?" paused":"")+(r&&r.overAt?" over":"")+(bg?" inspo-on":"");
    rc(ov,...[bg].filter(Boolean),
      el("div",{class:"pf-top"},el("span",{class:"pf-phase",text:(r&&r.overAt?PH_NAME[phase]+" done · counting extra time":PH_NAME[phase])+(phase==="focus"&&!(r&&r.overAt)?"  ·  round "+((r&&r.round)||1)+" of "+(r&&r.block?Math.max(1,Math.round(r.block.total/60)):c.rounds):"")}),
        el("button",{type:"button",class:"pf-x",text:"Exit full screen",onclick:closePomoFull})),
      el("div",{class:"pf-clock num",role:"timer","aria-live":"off","data-pclock":"1",text:clk}),
      el("div",{class:"pf-bar"},el("div",{"data-pfill":"1",style:"width:"+pct+"%"})),
      el("div",{class:"pf-what",text:r?pLabel((P().what)||"other",P().note):""}),
      r&&r.block?el("div",{class:"pf-blk","data-pblk":"1",text:pBlockLeft(r)}):null,
      el("div",{class:"pf-brk big","data-pbrk":"1",hidden:pBreakIn(r)?null:"",text:pBreakIn(r)||""}),
      r?pImpact(r):null,
      pSoundChip(r),
      el("div",{class:"pf-btns"},main,
        r&&!r.overAt?el("button",{type:"button",class:"pf-sec",text:phase==="focus"?(r.startedAt&&!r.durationMs?"Take a break":"Skip to break"):"Skip break",onclick:()=>pNext(false)}):null,
        r&&phase==="focus"&&r.startedAt?el("button",{type:"button",class:"pf-sec pf-rst",text:"↺ Restart round",title:"Start this round again. The time spent in it is not counted as focus",onclick:e=>pRestart(e.currentTarget)}):null,
        r?el("button",{type:"button",class:"pf-sec",text:"Stop",onclick:pStop}):null),
      ...[pOverUI(r,true)].filter(Boolean),
      extBtns("pf-ext"),
      el("div",{class:"pf-note",text:pLockOk===false?"This browser can't keep the screen on. Set your tablet's screen timeout longer while you focus.":"Screen stays on while this is open."}));
  }
  function updPomoClock(){const r=pRun();if(!r||!r.startedAt)return;const t=pClock(r);
    document.querySelectorAll("[data-pclock]").forEach(e=>{e.textContent=t;});
    document.querySelectorAll("[data-pfill]").forEach(f=>{if(r.durationMs)f.style.width=Math.min(100,pElapsed(r)/r.durationMs*100)+"%";});
    const bl=pBlockLeft(r);document.querySelectorAll("[data-pblk]").forEach(e=>{if(e.textContent!==bl)e.textContent=bl;});
    const om=pOverMin(r);document.querySelectorAll("[data-pover]").forEach(e=>{const t2="The extra "+(om?om+" min":"time")+" was";if(e.textContent!==t2)e.textContent=t2;});
    const sx=pSessXP(r);document.querySelectorAll("[data-pxp]").forEach(e=>{const t2="+"+sx+" XP";if(e.textContent!==t2)e.textContent=t2;});
    const bi=pBreakIn(r);document.querySelectorAll("[data-pbrk]").forEach(e=>{if(e.textContent!==(bi||""))e.textContent=bi||"";e.hidden=!bi;});
    if(!r.pausedAt)document.title="("+t+") Milestone 1 Sprint Board";}
  // a long focus started without 50 min rounds (older version, or another device): turn it into a block with breaks
  let pFixing=false;
  function pFixLong(r){if(pFixing||!r||r.phase!=="focus"||r.block||!r.startedAt||!r.durationMs||r.durationMs<=BLK_FOCUS*60000)return false;
    pFixing=true;const end=r.startedAt+(r.pausedTotal||0)+r.durationMs+(r.pausedAt?Date.now()-r.pausedAt:0);
    setPomo({...r,block:{total:Math.round(r.durationMs/60000),end},durationMs:BLK_FOCUS*60000});setTimeout(()=>{pFixing=false;},1500);return true;}
  let pLiveTick=0;setInterval(()=>{const r=pRun();if(!r||!r.startedAt||r.pausedAt||(r.phase!=="focus"&&!(r.overAt&&r.overAs==="focus")))return;if(++pLiveTick%2===0)render();},15000);
  setInterval(()=>{const r=pRun();if(!r||!r.startedAt||r.pausedAt)return;
    if(pFixLong(r))return;
    if(r.durationMs&&!r.overAt&&pLeft(r)<=0){pOver(r);return;}
    updPomoClock();},1000);
  document.getElementById("pomoFab").onclick=()=>{pomoOpen=!pomoOpen;renderPomo();if(pomoOpen)setTimeout(()=>{const b=document.querySelector("#pomoPanel .pomo-btns button");if(b)b.focus();},0);};
  // double-click (or double-tap) the timer: fill the screen
  function pDblFull(e){if(e.target.closest("button:not(#pomoFab),input,select,textarea,a"))return;e.preventDefault();pomoOpen=false;openPomoFull();}
  document.getElementById("pomoFab").addEventListener("dblclick",pDblFull);
  document.getElementById("pomoPanel").addEventListener("dblclick",e=>{if(e.target.closest(".pomo-face"))pDblFull(e);});
  document.getElementById("pomoFull").addEventListener("dblclick",async e=>{if(!e.target.closest(".pf-clock,.pf-bar"))return;try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen({navigationUI:"hide"});}catch(err){}});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&pomoOpen){pomoOpen=false;renderPomo();document.getElementById("pomoFab").focus();}});
  // ---------- gym routine: 6 training days, 5 exercises each, no supersets. Each slot has a main exercise and 2 alternatives ----------
  // x(ar, en, cue)  slot: {m: muscle group, s: sets, r: reps, rest: seconds, ex: [main, alt1, alt2]}
  const x=(ar,en,cue)=>({ar,en,cue});
  const GYM=[
   {t:"اليوم 1",f:"صدر وكتف وتراي",g:"بناء الصدر والكتف بتقل تقيل، مع تراي بالرأس الجانبي",sl:[
    {m:"chest",s:3,r:"6-8",rest:120,ex:[x("بنش بريس مستوي","Flat Bench Press","كتافك لورا وتحت، انزل البار لنص الصدر ببطء وادفع من غير ما ضهرك يفصل عن البنش."),x("بنش دامبل مستوي","Flat Dumbbell Press","انزل الدامبل لجنب الصدر وكوعك بزاوية 45 درجة، وادفع لفوق وقرّبهم من غير ما يخبطوا."),x("شيست برس ماشين","Chest Press Machine","المقابض في مستوى نص الصدر، ادفع بصدرك وكتافك لورا، ورجوع بطيء.")]},
    {m:"shoulders",s:3,r:"8-10",rest:90,ex:[x("شولدر بريس دامبل قاعد","Seated Dumbbell Shoulder Press","ضهرك ملزوق في الكرسي، ادفع لفوق من غير ما تقفل كوعك بالكامل."),x("شولدر بريس ماشين","Machine Shoulder Press","ظبط الكرسي إن المقابض تبقى في مستوى كتفك، وادفع لفوق من غير ما ترفع كتافك لودانك."),x("شولدر بريس سميث","Smith Machine Shoulder Press","البار ينزل قدام وشك لمستوى الدقن، وضهرك ثابت على المسند.")]},
    {m:"chest",s:3,r:"10-12",rest:90,ex:[x("شيست علوي ماشين","Incline Chest Press Machine","المقعد على زاوية خفيفة، ادفع بصدرك وكتافك لورا."),x("شيست علوي سميث","Incline Smith Machine Press","البنش على 30 درجة، البار ينزل لأعلى الصدر، وكتافك لورا."),x("شيست علوي دامبل","Incline Dumbbell Press","زاوية البنش 30 لـ 45 درجة، وانزل الدامبل لجنب الصدر العلوي.")]},
    {m:"shoulders",s:3,r:"12-15",rest:60,ex:[x("كتف جانبي كابل","Cable Lateral Raise","ارفع بكوعك مش بإيدك لحد مستوى الكتف، ونزول بطيء."),x("كتف جانبي دامبل","Dumbbell Lateral Raise","ارفع للجنب لمستوى الكتف وكوعك مثني شوية، من غير تأرجح."),x("كتف جانبي ماشين","Machine Lateral Raise","المخدات على دراعك من برا، ارفع لمستوى الكتف ونزول بطيء.")]},
    {m:"triceps",s:3,r:"12-15",rest:60,ex:[x("تراي بالحبل لتحت","Rope Triceps Pushdown","وزن أخف. كوعك ثابت جنب جسمك، افرد لتحت وافتح الحبل في الآخر."),x("تراي كابل بالبار المستقيم","Straight Bar Triceps Pushdown","كوعك ثابت جنب جسمك، افرد لتحت للآخر ورجوع بطيء لحد مستوى الصدر."),x("تراي ماشين قاعد","Seated Triceps Extension Machine","ظبط الكرسي إن كوعك على المخدة، وافرد لتحت من غير ما ترفع كتافك.")]}]},
   {t:"اليوم 2",f:"ضهر وباي",g:"عرض الضهر وسمكه، وباي داخلي، وتقوية البطن",sl:[
    {m:"back",s:3,r:"8-10",rest:120,ex:[x("سحب علوي لاتس واسع","Wide-Grip Lat Pulldown","اسحب البار لأعلى الصدر وكوعك لتحت، ومتميلش بضهرك لورا كتير."),x("سحب علوي ضيق","Close-Grip Lat Pulldown","مقبض ضيق، اسحب لأعلى الصدر وكوعك جنب جسمك."),x("سحب علوي ماشين","Machine Lat Pulldown","صدرك على المخدة، اسحب لتحت بكوعك وشد الضهر في الآخر.")]},
    {m:"back",s:3,r:"8-10",rest:90,ex:[x("سحب أرضي واسع هامر","Wide Seated Row (Hammer Strength)","اسحب لبطنك وشد لوحي الكتف لورا، وثبّت جذعك."),x("سحب أرضي كابل","Seated Cable Row","ضهرك مفرود، اسحب المقبض لبطنك وشد لوحي الكتف، ومتميلش لورا."),x("سحب دامبل بإيد واحدة","One-Arm Dumbbell Row","إيدك وركبتك على البنش، اسحب الدامبل لوسطك وكوعك قريب من جسمك.")]},
    {m:"shoulders",s:3,r:"12-15",rest:60,ex:[x("كتف خلفي","Rear Delt Fly","كوعك مثني شوية، افتح للجنب وركّز على الكتف الخلفي بوزن خفيف."),x("كتف خلفي فراشة عكسي","Reverse Pec Deck","صدرك على المخدة، افتح دراعك لورا لحد مستوى الكتف ونزول بطيء."),x("فيس بول بالحبل","Face Pull","الحبل في مستوى وشك، اسحب لوشك وافتح إيدك للجنب في الآخر.")]},
    {m:"biceps",s:3,r:"10-12",rest:60,ex:[x("باي ماشين","Machine Biceps Curl","دراعك على المخدة، اطلع بإيدك بس من غير ما ترفع كتفك، وانزل ببطء."),x("باي كابل بالبار","Cable Bar Curl","قف قريب من الجهاز، كوعك ثابت جنب جسمك، اطلع وانزل ببطء."),x("برتشر كيرل ماشين","Machine Preacher Curl","دراعك على المسند، انزل ببطء ومتفردش كوعك بقوة في الآخر.")]},
    {m:"core",s:3,r:"12-15",rest:60,ex:[x("كرانش كابل","Cable Crunch","اركع واتحرك من بطنك مش من إيدك، وقرّب صدرك من وركك."),x("كرانش ماشين","Ab Crunch Machine","اتحرك من بطنك، واقف ثانية في الآخر، ورجوع بطيء."),x("رفع ركب معلق","Hanging Knee Raise","اتعلق في العقلة وارفع ركبك لصدرك من غير تأرجح.")]}]},
   {t:"اليوم 3",f:"رجلين (تأهيل أ)",g:"تقوية مثبتات الركبة والورك (الجنب الخارجي) لتأهيل الركبة، وبناء المؤخرة والفخذ",sl:[
    {m:"glutes",s:3,r:"15",rest:60,ex:[x("جهاز تبعيد الفخذ","Hip Abduction Machine","اضغط بركبتك للجنب، ونزول بطيء 3 ثواني، وضهرك ثابت على الكرسي."),x("مشي جانبي بالأستك","Banded Lateral Walk","الأستك فوق الركبة، انزل نص قعدة وامشي للجنب خطوات صغيرة."),x("تبعيد فخذ كابل","Cable Hip Abduction","الكابل على كاحلك البعيد، ارفع رجلك للجنب ببطء وجسمك ثابت.")]},
    {m:"legs",s:3,r:"12",rest:120,ex:[x("ليج برس","Leg Press","رجلك في نص المنصة وعرض الكتف، انزل لـ 90 درجة وركبتك في اتجاه صوابعك."),x("هاك سكوات","Hack Squat","ضهرك ملزوق، انزل لـ 90 درجة وركبتك في اتجاه صوابعك."),x("سكوات سميث","Smith Machine Squat","رجلك قدام البار شوية، انزل لـ 90 درجة وضهرك مفرود.")]},
    {m:"legs",s:3,r:"10",rest:90,ex:[x("رومانيان ديدلفت بالدامبل","Dumbbell Romanian Deadlift","ضهرك مفرود، ادفع وركك لورا والدامبل قريب من رجلك."),x("رومانيان ديدلفت بالبار","Barbell Romanian Deadlift","البار قريب من رجلك، ادفع وركك لورا لحد نص الساق وارجع بالمؤخرة."),x("ليج كيرل نايم","Lying Leg Curl","وركك ملزوق في الجهاز، اسحب بكعبك وانزل 3 ثواني.")]},
    {m:"legs",s:3,r:"10 لكل رجل",rest:90,ex:[x("سبليت سكوات ثابت بالدامبل","Dumbbell Static Split Squat","الرجلين ثابتين في مكانهم، انزل مستقيم والركبة الأمامية ورا صوابعك."),x("سبليت سكوات سميث","Smith Machine Split Squat","البار بيثبتك، انزل مستقيم والركبة الأمامية في اتجاه صوابعك."),x("ليج برس برجل واحدة","Single-Leg Leg Press","وزن خفيف، رجل واحدة في نص المنصة، انزل ببطء من غير ألم.")]},
    {m:"glutes",s:3,r:"12",rest:90,ex:[x("هيب ثرست","Hip Thrust","اضغط المؤخرة في القمة ثانية ونص، وذقنك لتحت."),x("هيب ثرست ماشين","Hip Thrust Machine","ظبط الحزام على وركك، اطلع واضغط المؤخرة ثانية ونص فوق."),x("جلوت بريدج بالبار","Barbell Glute Bridge","نايم على الأرض والبار على وركك، اطلع بوسطك واضغط المؤخرة.")]}]},
   {t:"اليوم 4",f:"صدر وكتف وتراي (نسخة تانية)",g:"صدر علوي وسفلي وداخلي، وكتف جانبي، وتراي بالرأس الطويل",sl:[
    {m:"chest",s:3,r:"8-10",rest:120,ex:[x("شيست علوي دامبل","Incline Dumbbell Press","زاوية البنش 30 لـ 45 درجة، وانزل الدامبل لجنب الصدر العلوي."),x("شيست علوي ماشين","Incline Chest Press Machine","المقعد على زاوية خفيفة، ادفع بصدرك وكتافك لورا."),x("شيست علوي سميث","Incline Smith Machine Press","البنش على 30 درجة، البار ينزل لأعلى الصدر، وكتافك لورا.")]},
    {m:"chest",s:3,r:"8-10",rest:90,ex:[x("تراي متوازي","Parallel Bar Dips","ميّل جسمك لقدام شوية عشان الصدر السفلي، وانزل لحد 90 درجة بالكوع."),x("جهاز المتوازي بالمساعدة","Assisted Dip Machine","نفس حركة المتوازي، والجهاز بيشيل جزء من وزنك. كل ما تقوى قلل المساعدة."),x("شيست سفلي ماشين","Decline Chest Press Machine","ادفع لقدام وتحت بصدرك، ورجوع بطيء.")]},
    {m:"chest",s:3,r:"12-15",rest:60,ex:[x("تفتيح فراشة","Pec Deck Fly","اضغط بصدرك مش بإيدك، واستنى ثانية وانت قافل."),x("تفتيح كابل","Cable Fly","خطوة لقدام، قفّل إيدك قدام صدرك بقوس، وكوعك مثني شوية."),x("تفتيح دامبل","Dumbbell Fly","وزن خفيف، افتح لحد ما تحس بشد خفيف في الصدر وقفّل بقوس.")]},
    {m:"shoulders",s:3,r:"12-15",rest:60,ex:[x("كتف جانبي دامبل","Dumbbell Lateral Raise","ارفع للجنب لمستوى الكتف وكوعك مثني شوية، من غير تأرجح."),x("كتف جانبي كابل","Cable Lateral Raise","ارفع بكوعك مش بإيدك لحد مستوى الكتف، ونزول بطيء."),x("كتف جانبي ماشين","Machine Lateral Raise","المخدات على دراعك من برا، ارفع لمستوى الكتف ونزول بطيء.")]},
    {m:"triceps",s:3,r:"10-12",rest:60,ex:[x("تراي ماشين قاعد","Seated Triceps Extension Machine","ظبط الكرسي إن كوعك على المخدة، وافرد لتحت من غير ما ترفع كتافك."),x("تراي بالحبل لتحت","Rope Triceps Pushdown","كوعك ثابت جنب جسمك، افرد لتحت وافتح الحبل في الآخر."),x("تراي دامبل بإيد واحدة فوق الراس قاعد","Seated One-Arm Overhead Dumbbell Extension","قاعد وضهرك مسنود، وزن خفيف، انزل الدامبل ورا راسك وافرد لفوق.")]}]},
   {t:"اليوم 5",f:"ضهر وباي (نسخة تانية)",g:"سمك الضهر وعرضه، وترابيس، وباي، وتقوية البطن",sl:[
    {m:"back",s:3,r:"6-10",rest:120,ex:[x("عقلة","Pull-Up","ابدأ من تعليق كامل، اسحب صدرك للعقلة وكتافك لتحت، ونزول بطيء."),x("عقلة بالمساعدة","Assisted Pull-Up Machine","نفس حركة العقلة، والجهاز بيشيل جزء من وزنك. قلل المساعدة كل ما تقوى."),x("سحب علوي ضيق","Close-Grip Lat Pulldown","مقبض ضيق، اسحب لأعلى الصدر وكوعك جنب جسمك.")]},
    {m:"back",s:3,r:"8-12",rest:90,ex:[x("تي بار","T-Bar Row","ضهرك مفرود وجذعك مايل لقدام، اسحب المقبض لبطنك وشد لوحي الكتف."),x("سحب صدر مسنود ماشين","Chest-Supported Row Machine","صدرك على المخدة، اسحب لورا وشد لوحي الكتف، من غير ما تشيل صدرك."),x("سحب أرضي كابل","Seated Cable Row","ضهرك مفرود، اسحب المقبض لبطنك وشد لوحي الكتف، ومتميلش لورا.")]},
    {m:"back",s:3,r:"12-15",rest:60,ex:[x("ترابيس","Dumbbell Shrug","ارفع كتافك لودانك وقف ثانية فوق، من غير ما تلف كتافك."),x("ترابيس بالبار","Barbell Shrug","البار قدامك، ارفع كتافك لفوق وقف ثانية، ونزول بطيء."),x("ترابيس سميث","Smith Machine Shrug","البار ورا أو قدام، ارفع كتافك لفوق من غير ما تثني كوعك.")]},
    {m:"biceps",s:3,r:"10-12",rest:60,ex:[x("باي هامر بالدامبل","Dumbbell Hammer Curl","مسكة زي الشاكوش، كوعك ثابت جنب جسمك، اطلع وانزل ببطء."),x("هامر بالحبل كابل","Rope Hammer Curl","الحبل في الكابل التحتاني، كوعك ثابت، اطلع لصدرك ونزول بطيء."),x("باي ماشين","Machine Biceps Curl","دراعك على المخدة، اطلع بإيدك بس من غير ما ترفع كتفك، وانزل ببطء.")]},
    {m:"forearms",s:3,r:"15-20",rest:45,ex:[x("رست كيرل بالدامبل","Dumbbell Wrist Curl","اقعد ودراعك على فخدك وكف إيدك لفوق، سيب الدامبل ينزل لصوابعك واطلع بالرسغ بس ببطء."),x("رست كيرل عكسي","Reverse Wrist Curl","نفس القعدة وكف إيدك لتحت، وزن خفيف، ارفع ضهر إيدك بالرسغ ونزول بطيء."),x("مشي المزارع","Farmer's Walk","30 ثانية لكل سيت: امسك دامبل تقيل في كل إيد، اقف مفرود وكتافك لورا، وامشي خطوات ثابتة.")]}]},
   {t:"اليوم 6",f:"رجلين (تأهيل ب)",g:"تقوية الورك والفخذ من برا ومن جوه، وثبات الجذع، من غير ضغط على جنب الركبة",sl:[
    {m:"glutes",s:3,r:"15",rest:60,ex:[x("جهاز تبعيد الفخذ","Hip Abduction Machine","اضغط بركبتك للجنب، ونزول بطيء 3 ثواني، وضهرك ثابت على الكرسي."),x("مشي جانبي بالأستك","Banded Lateral Walk","الأستك فوق الركبة، انزل نص قعدة وامشي للجنب خطوات صغيرة."),x("تبعيد فخذ كابل","Cable Hip Abduction","الكابل على كاحلك البعيد، ارفع رجلك للجنب ببطء وجسمك ثابت.")]},
    {m:"legs",s:3,r:"10",rest:120,ex:[x("سكوات بالدامبل لحد البنش","Bench Goblet Squat","الدامبل قدام صدرك، انزل لحد ما تلمس البنش وركبتك في اتجاه صوابعك."),x("ليج برس","Leg Press","رجلك في نص المنصة وعرض الكتف، انزل لـ 90 درجة وركبتك في اتجاه صوابعك."),x("سكوات سميث لحد البنش","Smith Machine Box Squat","البنش وراك، انزل لحد ما تلمسه واطلع، وركبتك في اتجاه صوابعك.")]},
    {m:"legs",s:3,r:"12",rest:90,ex:[x("ليج كيرل ماشين","Leg Curl Machine","ثبّت وركك على الكرسي، اسحب بكعبك وانزل 3 ثواني."),x("ليج كيرل نايم","Lying Leg Curl","وركك ملزوق في الجهاز، اسحب بكعبك وانزل 3 ثواني."),x("رومانيان ديدلفت بالدامبل","Dumbbell Romanian Deadlift","ضهرك مفرود، ادفع وركك لورا والدامبل قريب من رجلك.")]},
    {m:"legs",s:3,r:"12",rest:60,ex:[x("جهاز تقريب الفخذ","Hip Adduction Machine","اضغط بحركة بطيئة من غير ارتداد، وارجع ببطء."),x("تقريب فخذ كابل","Cable Hip Adduction","الكابل على كاحلك القريب، اسحب رجلك لجوه ببطء وجسمك ثابت."),x("كوبنهاجن بلانك على الركبة","Short-Lever Copenhagen Plank","ركبتك على البنش وانت على جنبك، ارفع وركك وثبّت. ابدأ بوقت قصير.")]},
    {m:"core",s:3,r:"30 ثانية لكل ناحية",rest:45,ex:[x("بلانك جانبي","Side Plank","كوعك تحت كتفك وجسمك خط مستقيم، ارفع وركك وثبّت."),x("بلانك جانبي على الركبة","Kneeling Side Plank","نفس البلانك الجانبي والركب على الأرض، أسهل وأخف."),x("بالوف بريس","Pallof Press","الكابل جنبك، ادفع إيدك لقدام وامنع جسمك إنه يلف، وارجع ببطء.")]}]},
   {t:"اليوم 7",f:"راحة",g:"راحة وتعافي للعضلات",sl:null}
  ];
  const MUSC={chest:"صدر",back:"ضهر",shoulders:"كتف",biceps:"باي",triceps:"تراي",legs:"رجلين",glutes:"مؤخرة",core:"بطن",forearms:"سواعد"};
  const GYM_RULES=[["الراحة","مكتوبة على كل تمرين: دقيقتين للتمرين الأول، ودقيقة ونص أو دقيقة للباقي. خد راحتك بالإحساس، وعلّم على السيت بعد ما تخلّصه."],["من غير سوبر سيت","كل تمرين لوحده، واحد ورا التاني."],["الوقت","تسخين 5 دقايق، والجلسة كلها من 36 لـ 42 دقيقة."],["الباي والتراي","وزن تقدر تتحكم فيه، وخلّي آخر عدة أو اتنين صعبين بس من غير ما تكسر الحركة."],["الفشل العضلي","في التمارين التقيلة (بنش، سكوات، ديدلفت) وقف قبل الفشل بعدة أو اتنين."],["التقدم","لما توصل لأعلى عدد عدات في كل السيتات، زوّد الوزن 2.5 كيلو."],["أسبوع خفيف","كل 6 لـ 8 أسابيع، اعمل أسبوع بنص السيتات."],["الألم","ألم حاد في مفصل (مش حرقان عضلة) معناه وقّف التمرين وجرّب البديل أو حاجة أخف."],["تأهيل الركبة","في يومي الرجلين (3 و6): نزول بطيء 3 ثواني، والركبة في اتجاه صوابع رجلك، ومدى من غير ألم. لو حسيت بوخز على الجنب الخارجي للركبة، قلل الوزن أو المدى. تجنب الجري مؤقتا."],["الإحماء","5 دقايق مشي سريع أو عجلة خفيفة، وبعدها سيت خفيف من أول تمرين بنص الوزن."],["التهدئة","5 دقايق مط خفيف للعضلات اللي اشتغلت. متعملش مط عنيف لجنب الركبة الخارجي."],["النوم والبروتين","نوم 7 لـ 9 ساعات، وبروتين من 1.6 لـ 2.2 جرام لكل كيلو من وزنك."]];
  // ---------- gym page: one session timer, tap-to-log sets, alternatives, history, analytics ----------
  let gDay=null, gTab="today", gWake=null;
  const GQ=s=>encodeURIComponent(s);
  function gDocs(){return state.gym||{};}
  function gActive(){const a=gDocs().active;return a&&a.startedAt?a:null;}
  function gPrefs(){return gDocs().prefs||{alts:{}};}
  function gSessions(){return Object.entries(gDocs()).filter(([k,v])=>k.startsWith("s_")&&v&&v.start).map(([id,v])=>({id,...v})).sort((a,b)=>b.start-a.start);}
  function gAltIdx(d,i){const a=gActive();if(a&&a.day===d&&a.alts&&a.alts[i]!=null)return a.alts[i];const p=gPrefs().alts||{};return p[d+"-"+i]||0;}
  function gEx(d,i,alt){const s=GYM[d].sl[i];return s.ex[alt==null?gAltIdx(d,i):alt];}
  function gDefaultDay(){const a=gActive();if(a)return a.day;const last=gSessions()[0];if(!last)return 0;let n=(last.day+1)%7;if(n===6&&iso(new Date(last.start))!==iso(new Date()))n=0;return n;}
  async function gSet(path,body){state.gym={...state.gym,[path]:body};render();try{await store.set("gym/"+path,body);}catch(e){fail(e);}}
  function gClock(ms){const s=Math.max(0,Math.round(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+":"+String(m).padStart(2,"0"):String(m))+":"+String(x).padStart(2,"0");}
  async function gWakeLock(on){try{if(on&&!gWake&&navigator.wakeLock){gWake=await navigator.wakeLock.request("screen");gWake.addEventListener("release",()=>{gWake=null;});}else if(!on&&gWake){await gWake.release();gWake=null;}}catch(e){}}
  function gStart(d){if(GYM[d].sl==null)return;const alts={};GYM[d].sl.forEach((_,i)=>{alts[i]=gAltIdx(d,i);});
    gSet("active",{id:Date.now().toString(36),day:d,startedAt:Date.now(),sets:{},alts,restUntil:null,restFor:null});toast("بدأ التمرين");say("Workout started");gWakeLock(true);}
  function gToggleSet(d,i,k,on){
    let a=gActive(); if(!a){gStart(d);a=gActive();}
    if(a.day!==d){toast("فيه تمرين شغال ليوم تاني. خلّصه الأول.");return;}
    const sets={...a.sets}, key=i+"-"+k, cur=sets[key]||{};
    if(on){sets[key]={...cur,done:true,at:Date.now()};gSet("active",{...a,sets});try{navigator.vibrate&&navigator.vibrate(30);}catch(e){}say("Set "+(k+1)+" logged");}
    else{sets[key]={...cur,done:false};gSet("active",{...a,sets});}
  }
  function gSetVal(d,i,k,field,v){const a=gActive();if(!a||a.day!==d)return;const key=i+"-"+k;const sets={...a.sets,[key]:{...(a.sets[key]||{}),[field]:v}};gSet("active",{...a,sets});}
  function gPart(d,i,k,fn){let a=gActive();if(!a){gStart(d);a=gActive();}if(!a||a.day!==d)return;const key=i+"-"+k,cur=a.sets[key]||{};const x=fn((cur.x||[]).slice());gSet("active",{...a,sets:{...a.sets,[key]:{...cur,x}}});}
  const gAddPart=(d,i,k)=>{gPart(d,i,k,x=>{x.push({w:"",r:""});return x;});setTimeout(()=>{const c=document.querySelectorAll(".g-card")[i];const ins=c&&c.querySelectorAll('[data-part="'+k+'"] .g-num');if(ins&&ins.length)ins[ins.length-2].focus();},60);};
  const gSetPart=(d,i,k,j,f,v)=>gPart(d,i,k,x=>{x[j]={...x[j],[f]:v};return x;});
  const gDelPart=(d,i,k,j)=>gPart(d,i,k,x=>{x.splice(j,1);return x;});
  function gFmtSet(z){const one=(w,r)=>(w!=null&&w!==""?w+" كجم":"")+(r!=null&&r!==""?((w!=null&&w!=="")?" × ":"")+r:"");
    const parts=[one(z.w,z.r),...(z.x||[]).map(p=>one(p.w,p.r))].filter(Boolean);return parts.length?parts.join(" ← "):"✓";}
  function gCycleAlt(d,i){const n=(gAltIdx(d,i)+1)%3;const a=gActive();
    const p=gPrefs();gSet("prefs",{...p,alts:{...(p.alts||{}),[d+"-"+i]:n}});
    if(a&&a.day===d)gSet("active",{...a,alts:{...a.alts,[i]:n}});
    toast(n?"البديل "+n+": "+GYM[d].sl[i].ex[n].ar:"رجعت للتمرين الأساسي");}
  async function gFinish(){
    const a=gActive();if(!a)return;const d=a.day,end=Date.now();
    const items=GYM[d].sl.map((sl,i)=>{const alt=(a.alts&&a.alts[i]!=null)?a.alts[i]:0,e=sl.ex[alt];const sets=[];for(let k=0;k<sl.s;k++){const v=a.sets[i+"-"+k];if(v&&v.done){const num=z=>z!=null&&z!==""?Number(z):null;const x=(v.x||[]).map(p=>({w:num(p.w),r:num(p.r)})).filter(p=>p.w!=null||p.r!=null);sets.push({w:num(v.w),r:num(v.r),at:v.at,...(x.length?{x}:{})});}}
      return {slot:i,m:sl.m,ar:e.ar,en:e.en,alt,target:sl.s+" × "+sl.r,sets};});
    const done=items.reduce((n,x)=>n+x.sets.length,0);
    if(!done){toast("مفيش ولا سيت متعلّم. اضغط إلغاء لو مش هتكمل.");return;}
    const doc={day:d,title:GYM[d].f,start:a.startedAt,end,minutes:Math.round((end-a.startedAt)/600)/100,date:iso(new Date(a.startedAt)),items,sets:done,planned:GYM[d].sl.reduce((n,s)=>n+s.s,0),skipped:Object.keys(a.skip||{}).length,overMin:Math.max(0,Math.round((end-a.startedAt-G_MAIN)/60000))};
    await gSet("s_"+a.id,doc); await gSet("active",{});
    const dd=doc.date; const L={...log(dd),date:dd,gym:true}; state.logs[dd]=L; queueSave(dd,300);
    gWakeLock(false); woo(); toast("عاش! "+done+" سيت · \u2066+"+(100+5*done)+" XP\u2069"); gDay=null; gTab="history"; renderGym();
  }
  let gCancelArmed=false;
  function gCancel(btn){if(!gCancelArmed){gCancelArmed=true;btn.textContent="اضغط تاني للإلغاء";setTimeout(()=>{gCancelArmed=false;btn.textContent="إلغاء";},3000);return;}gCancelArmed=false;gSet("active",{});gWakeLock(false);toast("اتلغى التمرين");}
  async function gDelSession(id){const n={...state.gym};delete n[id];state.gym=n;render();try{await store.del("gym/"+id);toast("اتمسحت");}catch(e){fail(e);}}
  function gLinks(e){return el("span",{class:"g-links"},
    el("a",{href:"https://www.google.com/search?tbm=isch&q="+GQ(e.en+" exercise"),target:"_blank",rel:"noopener","aria-label":"صور "+e.ar,text:"صور الحركة"}),
    el("a",{href:"https://www.youtube.com/results?search_query="+GQ(e.en+" exercise proper form"),target:"_blank",rel:"noopener","aria-label":"فيديو "+e.ar,text:"فيديو"}));}
  function gCard(d,i){
    const sl=GYM[d].sl[i], alt=gAltIdx(d,i), e=sl.ex[alt], a=gActive(), mine=a&&a.day===d;
    const rows=[];let doneN=0;
    for(let k=0;k<sl.s;k++){const v=(mine&&a.sets[i+"-"+k])||{};if(v.done)doneN++;
      const cb=el("input",{type:"checkbox","aria-label":"سيت "+(k+1)+" من "+e.ar});cb.checked=!!v.done;cb.onchange=()=>gToggleSet(d,i,k,cb.checked);
      const w=el("input",{type:"number",inputmode:"decimal",min:"0",step:"0.5",placeholder:"كجم","aria-label":"الوزن، سيت "+(k+1),value:v.w!=null?String(v.w):"",class:"g-num"});
      const r=el("input",{type:"number",inputmode:"numeric",min:"0",step:"1",placeholder:sl.r.split(" ")[0],"aria-label":"العدات، سيت "+(k+1),value:v.r!=null?String(v.r):"",class:"g-num"});
      [w,r].forEach(inp=>{inp.addEventListener("focus",()=>{window.__sbEditing=true;});inp.addEventListener("blur",()=>{window.__sbEditing=false;});});
      w.onchange=()=>{if(!gActive())gStart(d);gSetVal(d,i,k,"w",w.value);};r.onchange=()=>{if(!gActive())gStart(d);gSetVal(d,i,k,"r",r.value);};
      const plus=el("button",{type:"button",class:"g-plus","aria-label":"أضف وزن تاني لسيت "+(k+1)+" (لو نزّلت الوزن في نفس السيت)",title:"وزن تاني في نفس السيت",text:"+",onclick:()=>gAddPart(d,i,k)});
      const sk=mine&&gSkipped(a,i,k)&&!v.done;
      rows.push(el("div",{class:"g-set"+(v.done?" done":"")+(sk?" skipped":"")},el("label",{class:"g-chk"},cb,el("span",{text:"سيت "+(k+1)+(sk?" (اتشال)":"")})),w,r,plus));
      (v.x||[]).forEach((pt,j)=>{
        const pw=el("input",{type:"number",inputmode:"decimal",min:"0",step:"0.5",placeholder:"كجم","aria-label":"الوزن التاني "+(j+1)+"، سيت "+(k+1),value:pt.w!=null?String(pt.w):"",class:"g-num"});
        const pr=el("input",{type:"number",inputmode:"numeric",min:"0",step:"1",placeholder:"عدات","aria-label":"العدات بالوزن التاني "+(j+1)+"، سيت "+(k+1),value:pt.r!=null?String(pt.r):"",class:"g-num"});
        [pw,pr].forEach(inp=>{inp.addEventListener("focus",()=>{window.__sbEditing=true;});inp.addEventListener("blur",()=>{window.__sbEditing=false;});});
        pw.onchange=()=>gSetPart(d,i,k,j,"w",pw.value);pr.onchange=()=>gSetPart(d,i,k,j,"r",pr.value);
        rows.push(el("div",{class:"g-set g-part","data-part":String(k)},el("span",{class:"g-part-l",text:"↳ وبعدها"}),pw,pr,
          el("button",{type:"button",class:"g-plus g-x","aria-label":"امسح الوزن التاني "+(j+1)+" من سيت "+(k+1),text:"×",onclick:()=>gDelPart(d,i,k,j)})));});}
    const all=doneN===sl.s;
    return el("article",{class:"g-card"+(all?" all":""),"aria-label":e.ar},
      el("div",{class:"g-top"},el("span",{class:"g-n",text:String(i+1)}),
        el("div",{class:"g-name"},el("b",{text:e.ar}),el("span",{class:"en",lang:"en",dir:"ltr",text:e.en}),alt?el("span",{class:"chip accent",text:"بديل "+alt}):null),
        el("div",{class:"g-meta"},el("span",{class:"g-target",text:sl.s+" × "+sl.r}),el("span",{class:"chip",text:"راحة "+gClock(sl.rest*1000)}))),
      el("p",{class:"g-cue",text:"الأداء: "+e.cue}),
      el("span",{class:"hint",text:"العضلة: "+MUSC[sl.m]}),
      el("div",{class:"g-acts"},gLinks(e),el("button",{type:"button",class:"mini",text:"⇄ بديل ("+((alt+1)%3===0?"الأساسي":(alt+1))+")","aria-label":"غيّر لـ "+GYM[d].sl[i].ex[(alt+1)%3].ar,onclick:()=>gCycleAlt(d,i)})),
      el("details",{class:"g-alts"},el("summary",{text:"كل البدائل"}),el("ul",{},...sl.ex.map((z,j)=>el("li",{class:j===alt?"cur":""},el("div",{},el("b",{text:z.ar+(j===0?" (الأساسي)":"")}),el("span",{class:"en",lang:"en",dir:"ltr",text:z.en}),el("span",{class:"hint",text:z.cue})),
        el("div",{class:"g-alt-acts"},gLinks(z),j===alt?el("span",{class:"chip good",text:"مختار"}):el("button",{type:"button",class:"mini",text:"اختار ده",onclick:()=>{const p=gPrefs();gSet("prefs",{...p,alts:{...(p.alts||{}),[d+"-"+i]:j}});const a2=gActive();if(a2&&a2.day===d)gSet("active",{...a2,alts:{...a2.alts,[i]:j}});}})))))),
      el("div",{class:"g-sets"},el("div",{class:"g-set g-head","aria-hidden":"true"},el("span",{text:"السيت"}),el("span",{text:"الوزن"}),el("span",{text:"العدات"}),el("span")),...rows));
  }
  // ---------- time budget: 45 minutes + 10 minutes extra. Keeps the important sets, trims the rest when time is short ----------
  const G_MAIN=45*60000, G_BUF=10*60000, G_SET=45000;
  function gSkipped(a,i,k){return !!(a.skip&&a.skip[i+"-"+k]);}
  // one session timer: counts up from the saved start time, so it stays right after closing and reopening the app
  function gTimeText(a){const el2=Math.max(0,Date.now()-a.startedAt);
    return {t:gClock(el2),cls:el2<G_MAIN?"":el2<G_MAIN+G_BUF?"buf":"over",lbl:el2<G_MAIN?"مدة التمرين (من 45 د)":el2<G_MAIN+G_BUF?"وقت إضافي":"عدّيت الوقت"};}
  let gWarned={};
  setInterval(()=>{const a=gActive();if(!a)return;const el2=Date.now()-a.startedAt;
    const tt=gTimeText(a);document.querySelectorAll("[data-gclock]").forEach(e=>{e.textContent=tt.t;e.className=e.className.replace(/\b(buf|over)\b/g,"").trim()+(tt.cls?" "+tt.cls:"");});
    const k=a.id+":"+(el2>=G_MAIN+G_BUF?2:el2>=G_MAIN?1:0);
    if(el2>=G_MAIN&&!gWarned[k]){gWarned[k]=1;bell("gym");try{navigator.vibrate&&navigator.vibrate([400,150,400]);}catch(e){}
      toast(el2>=G_MAIN+G_BUF?"خلص الوقت. احفظ التمرين وروّح":"خلصت الـ 45 دقيقة. معاك 10 دقايق زيادة");renderGym();}
  },1000);
  // ---------- body weight: one number a day, quick to log from the Gym page or Health ----------
  function bwList(){return Object.entries(state.gym||{}).filter(([k,v])=>k.startsWith("w_")&&v&&v.kg>0).map(([k,v])=>({d:k.slice(2),kg:Number(v.kg)})).sort((a,b)=>a.d.localeCompare(b.d));}
  function bwAvg(list,days){const from=addDays(iso(new Date()),-(days-1));const xs=list.filter(x=>x.d>=from);return xs.length?xs.reduce((a,b)=>a+b.kg,0)/xs.length:null;}
  let bwDate=null,bwVal=null;
  const r1d=v=>Math.round(v*10)/10;
  function openBW(){const L=bwList();bwDate=iso(new Date());const t=L.find(x=>x.d===bwDate);bwVal=t?t.kg:(L.length?L[L.length-1].kg:70);
    document.getElementById("bwBg").hidden=false;document.getElementById("bwDlg").hidden=false;drawBW();setTimeout(()=>{const b=document.querySelector("#bwDlg .bw-save");if(b)b.focus();},0);}
  function closeBW(){document.getElementById("bwBg").hidden=true;document.getElementById("bwDlg").hidden=true;}
  function drawBW(){
    const body=document.getElementById("bwBody");if(!body)return;
    const inp=el("input",{type:"number",inputmode:"decimal",step:"0.1",min:"20",max:"300",class:"bw-in","aria-label":"الوزن بالكيلو",value:String(bwVal)});
    inp.addEventListener("input",()=>{const v=Number(inp.value);if(isFinite(v)&&v>0)bwVal=v;});
    const step=(dv)=>{bwVal=Math.max(20,r1d(bwVal+dv));inp.value=String(bwVal);};
    const date=el("input",{type:"date",value:bwDate,max:iso(new Date()),"aria-label":"اليوم"});date.onchange=()=>{if(date.value){bwDate=date.value;const t=bwList().find(x=>x.d===bwDate);if(t){bwVal=t.kg;inp.value=String(bwVal);}}};
    rc(body,
      el("div",{class:"bw-step"},el("button",{type:"button",class:"gl-sb","aria-label":"ناقص 1 كيلو",text:"−1",onclick:()=>step(-1)}),el("button",{type:"button",class:"gl-sb","aria-label":"ناقص 100 جرام",text:"−.1",onclick:()=>step(-0.1)}),
        el("label",{class:"bw-mid"},inp,el("span",{text:"كجم"})),
        el("button",{type:"button",class:"gl-sb","aria-label":"زيادة 100 جرام",text:"+.1",onclick:()=>step(0.1)}),el("button",{type:"button",class:"gl-sb","aria-label":"زيادة 1 كيلو",text:"+1",onclick:()=>step(1)})),
      el("label",{class:"field"},el("span",{class:"label",text:"اليوم"}),date),
      el("p",{class:"hint",text:"أحسن وقت: الصبح بعد الحمام وقبل الأكل، كل يوم بنفس الطريقة."}),
      el("button",{type:"button",class:"gl-done bw-save",text:"احفظ الوزن",onclick:async()=>{const v=r1d(Number(inp.value)||bwVal);if(!(v>0))return;closeBW();await gSet("w_"+bwDate,{kg:v,at:Date.now()});try{navigator.vibrate&&navigator.vibrate(30);}catch(e){}toast("اتسجّل "+v+" كجم");}}));
  }
  function bwSpark(list,W,H){const pts=list.slice(-30);if(pts.length<2)return null;const vs=pts.map(p=>p.kg),mx=Math.max(...vs),mn=Math.min(...vs);
    const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 "+W+" "+H);svg.setAttribute("class","bw-spark");svg.setAttribute("aria-hidden","true");
    const pe=document.createElementNS("http://www.w3.org/2000/svg","path");pe.setAttribute("d",pts.map((p,j)=>(j?"L":"M")+(j/(pts.length-1)*W).toFixed(1)+","+(H-3-(mx===mn?0.5:(p.kg-mn)/(mx-mn))*(H-6)).toFixed(1)).join(" "));svg.append(pe);return svg;}
  function bwSummary(lang){const L=bwList();const today=iso(new Date());const t=L.find(x=>x.d===today),last=L[L.length-1],a7=bwAvg(L,7),old=L.find(x=>x.d>=addDays(today,-30));
    const ch=last&&old&&old!==last?r1d(last.kg-old.kg):null;
    const ar=lang==="ar";
    return {t,last,a7,ch,L,lines:[
      [ar?"النهارده":"Today",t?t.kg+(ar?" كجم":" kg"):(ar?"لسه":"Not logged")],
      [ar?"متوسط 7 أيام":"7-day average",a7!=null?r1d(a7)+(ar?" كجم":" kg"):"--"],
      [ar?"التغير في 30 يوم":"Change, 30 days",ch!=null?"\u2066"+(ch>0?"+":ch<0?"\u2212":"")+Math.abs(ch)+"\u2069"+(ar?" كجم":" kg"):"--"]]};}
  function renderBWHealth(){const box=document.getElementById("bwHealth");if(!box)return;const s=bwSummary("en");
    rc(box,el("div",{class:"slp-tiles"},...s.lines.map(([k,v])=>el("div",{class:"slp-tile"},el("b",{class:"num",text:v}),el("span",{class:"hint",text:k})))),
      ...[bwSpark(s.L,600,60)].filter(Boolean),el("button",{class:"btn",type:"button",text:s.t?"Update today's weight":"Log today's weight",onclick:openBW}));}
  document.getElementById("bwClose").onclick=closeBW;document.getElementById("bwBg").onclick=closeBW;
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!document.getElementById("bwDlg").hidden)closeBW();});
  // ---------- mission + game mode: lean chest, flanks and lower belly, while getting stronger ----------
  // Fat loss is whole-body (no spot reduction), so the mission tracks what drives it: training, steps, protein, weigh-ins and the waist tape.
  const GOAL_DEF={stepsT:8000,proteinT:null,waist0:null,waistT:null,chest0:null};
  function gGoal(){return {...GOAL_DEF,...(gDocs().goal||{})};}
  function gDayDoc(d){return gDocs()["d_"+d]||{};}
  function gMeas(){return Object.entries(gDocs()).filter(([k,v])=>k.startsWith("m_")&&v).map(([k,v])=>({d:k.slice(2),...v})).sort((a,b)=>a.d.localeCompare(b.d));}
  function gProteinT(){const g=gGoal();if(g.proteinT)return g.proteinT;const L=bwList();return L.length?Math.round(L[L.length-1].kg*2/5)*5:160;}
  function gQuests(d){const g=gGoal(),dd=gDayDoc(d),ses=gSessions().some(s=>s.date===d),rest=parse(d).getDay()===5;
    return [
      {k:"weigh",ico:"⚖",t:"اتوزن",done:!!(gDocs()["w_"+d]),xp:20},
      {k:"steps",ico:"👟",t:"مشي "+g.stepsT.toLocaleString("en")+" خطوة",done:(dd.steps||0)>=g.stepsT,xp:30,val:dd.steps,unit:"خطوة",field:"steps"},
      {k:"protein",ico:"🍗",t:"بروتين "+gProteinT()+" جرام",done:(dd.protein||0)>=gProteinT(),xp:30,val:dd.protein,unit:"جرام",field:"protein"},
      {k:"train",ico:"🏋",t:rest?"راحة الجمعة":"خلّص تمرين اليوم",done:rest||ses,xp:rest?0:0}];}
  function gXP(){let xp=0;const ach=[];
    const ss=gSessions().slice().reverse(); const best={};let prs=0;
    ss.forEach(s=>{xp+=100+5*(s.sets||0)+(s.skipped?0:20)+((s.overMin||0)<=0?20:0);
      (s.items||[]).forEach(it=>{const b=Math.max(0,...(it.sets||[]).flatMap(z=>[Number(z.w)||0,...(z.x||[]).map(p=>Number(p.w)||0)]));if(b>0){if(best[it.ar]&&b>best[it.ar]){prs++;xp+=25;}best[it.ar]=Math.max(best[it.ar]||0,b);}});});
    const W=bwList();xp+=W.length*20;
    Object.keys(gDocs()).filter(k=>k.startsWith("d_")).forEach(k=>{const d=k.slice(2);const q=gQuests(d);q.forEach(x=>{if(x.done&&(x.k==="steps"||x.k==="protein"))xp+=x.xp;});
      if(q.every(x=>x.done))xp+=30;});
    const M=gMeas();xp+=M.length*40;
    return {xp,prs,sessions:ss.length,weighins:W.length,meas:M.length};}
  const LVL=["مجنّد","متدرّب","مقاتل","قائد فريق","قائد","نخبة","قوات خاصة"];
  function gLevel(xp){const per=500,lv=Math.floor(xp/per)+1;return {lv,name:LVL[Math.min(LVL.length-1,Math.floor((lv-1)/2))],into:xp%per,per};}
  function gStreak(){let n=0;for(let d=iso(new Date());;d=addDays(d,-1)){if(gDocs()["w_"+d])n++;else if(d!==iso(new Date()))break;if(n>999)break;}return n;}
  function gBadges(x){const g=gGoal(),M=gMeas(),w0=g.waist0||(M[0]&&M[0].waist),wN=M.length?M[M.length-1].waist:null,lost=w0&&wN?w0-wN:0;
    return [["🥇","أول تمرين",x.sessions>=1],["🔟","10 تمارين",x.sessions>=10],["💯","25 تمرين",x.sessions>=25],["📈","أول رقم قياسي",x.prs>=1],["🚀","10 أرقام قياسية",x.prs>=10],
      ["⚖","7 أيام وزن ورا بعض",gStreak()>=7],["📏","أول قياس وسط",M.length>=1],["✂","الوسط نزل 2 سم",lost>=2],["🔥","الوسط نزل 5 سم",lost>=5],["🏆","وصلت هدف الوسط",!!(g.waistT&&wN&&wN<=g.waistT)]];}
  async function gSaveDay(d,patch){const cur=gDayDoc(d);const before=gQuests(d).filter(q=>q.done).length;await gSet("d_"+d,{...cur,...patch});
    const after=gQuests(d).filter(q=>q.done).length;if(after>before){woo();toast("مهمة خلصت 🎯");try{navigator.vibrate&&navigator.vibrate(40);}catch(e){}}}
  function numIn(label,val,ph,on){const i=el("input",{type:"number",inputmode:"numeric",min:"0",class:"gm-in","aria-label":label,placeholder:ph,value:val!=null?String(val):""});
    i.addEventListener("focus",()=>{window.__sbEditing=true;});i.addEventListener("blur",()=>{window.__sbEditing=false;});
    i.addEventListener("change",()=>{const v=Number(i.value);if(isFinite(v)&&v>=0)on(v);});i.addEventListener("keydown",e=>{if(e.key==="Enter")i.blur();});return i;}
  function gLevelBar(compact){const x=gXP(),L=gLevel(x.xp);
    return el("div",{class:"gm-level"+(compact?" compact":"")},el("span",{class:"gm-lv",text:"Lv "+L.lv}),
      el("div",{class:"gm-lv-mid"},el("span",{class:"gm-lv-name",text:L.name+" · \u2066"+x.xp.toLocaleString("en")+" XP\u2069"}),el("div",{class:"track"},el("div",{class:"fill gm-fill",style:"width:"+(L.into/L.per*100)+"%"}))),
      compact?el("button",{type:"button",class:"mini",text:"المهمة",onclick:()=>{gTab="mission";renderGym();window.scrollTo(0,0);}}):el("span",{class:"hint",text:"\u2066"+(L.per-L.into)+" XP\u2069 للمستوى الجاي"}));}
  function gMission(){
    const g=gGoal(),today=iso(new Date()),M=gMeas(),W=bwList(),q=gQuests(today);
    const w0=g.waist0||(M[0]&&M[0].waist),wN=M.length?M[M.length-1].waist:null,cN=M.length?M[M.length-1].chest:null,c0=g.chest0||(M[0]&&M[0].chest);
    const pct=w0&&g.waistT&&wN?Math.max(0,Math.min(100,(w0-wN)/(w0-g.waistT)*100)):0;
    const goalCard=el("div",{class:"gm-card gm-goal"},
      el("span",{class:"gl-k",text:"المهمة"}),el("h2",{class:"gm-title",text:"صدر وجنب وبطن أنشف، وقوة أكتر"}),
      el("div",{class:"gm-tape"},
        el("div",{},el("span",{class:"hint",text:"الوسط دلوقتي"}),el("b",{class:"num",text:wN?wN+" سم":"--"})),
        el("div",{},el("span",{class:"hint",text:"البداية"}),el("b",{class:"num",text:w0?w0+" سم":"--"})),
        el("div",{},el("span",{class:"hint",text:"الهدف"}),el("b",{class:"num",text:g.waistT?g.waistT+" سم":"--"}))),
      el("div",{class:"track"},el("div",{class:"fill good",style:"width:"+pct+"%"})),
      el("span",{class:"hint",text:g.waistT?Math.round(pct)+"% من الهدف":"حدد هدف الوسط تحت في الإعدادات"}),
      cN||c0?el("span",{class:"hint",text:"الصدر: "+(c0?c0+" سم البداية":"")+(cN?"  ·  "+cN+" سم دلوقتي":"")}):null);
    const qs=el("div",{class:"gm-card"},el("div",{class:"gm-head"},el("h2",{class:"g-h3",text:"مهام النهارده"}),el("span",{class:"num",text:q.filter(x=>x.done).length+"/"+q.length})),
      ...q.map(x=>el("div",{class:"gm-q"+(x.done?" done":"")},el("span",{class:"gm-ico","aria-hidden":"true",text:x.done?"✅":x.ico}),
        el("div",{class:"gm-qt"},el("b",{text:x.t}),x.xp?el("span",{class:"hint",text:"\u2066+"+x.xp+" XP\u2069"}):null),
        x.field?numIn(x.t,x.val,x.unit,v=>gSaveDay(today,{[x.field]:v})):x.k==="weigh"?el("button",{type:"button",class:"gl-chip",text:x.done?"تعديل":"سجّل",onclick:openBW}):null)),
      q.every(x=>x.done)?el("p",{class:"gm-all",text:"🔥 كل مهام النهارده خلصت: +30 XP"}):null);
    // weekly
    const wk=weekStart(today),wkEnd=addDays(wk,6);
    const wW=gSessions().filter(s=>s.date>=wk&&s.date<=wkEnd).length,wB=W.filter(x=>x.d>=wk&&x.d<=wkEnd).length,wM=M.filter(x=>x.d>=wk&&x.d<=wkEnd).length;
    const wq=[["🏋","5 تمارين",wW,5],["⚖","6 مرات وزن",wB,6],["📏","قياس الوسط مرة",wM,1]];
    const weekly=el("div",{class:"gm-card"},el("h2",{class:"g-h3",text:"تحدي الأسبوع"}),...wq.map(([i,t,v,n])=>el("div",{class:"gm-w"},el("span",{"aria-hidden":"true",text:i}),el("span",{text:t}),
      el("div",{class:"track"},el("div",{class:"fill"+(v>=n?" good":""),style:"width:"+Math.min(100,v/n*100)+"%"})),el("span",{class:"num",text:Math.min(v,n)+"/"+n}))));
    // measurements
    const wi=numIn("الوسط بالسنتيمتر",null,"الوسط سم",()=>{}),ci=numIn("الصدر بالسنتيمتر",null,"الصدر سم",()=>{});
    const meas=el("div",{class:"gm-card"},el("h2",{class:"g-h3",text:"القياسات (مرة في الأسبوع)"}),
      el("p",{class:"hint",text:"الوسط: عند السُرّة، الصبح قبل الأكل، والشريط مفرود من غير شد. الصدر: عند الحلمة."}),
      el("div",{class:"gm-mrow"},wi,ci,el("button",{type:"button",class:"btn",text:"احفظ",onclick:async()=>{const w=Number(wi.value),c=Number(ci.value);if(!(w>0)&&!(c>0)){toast("اكتب رقم الوسط أو الصدر");return;}
        const doc={...(gDocs()["m_"+today]||{})};if(w>0)doc.waist=w;if(c>0)doc.chest=c;await gSet("m_"+today,doc);
        const gg=gGoal();if(!gg.waist0&&doc.waist)await gSet("goal",{...gDocs().goal,waist0:doc.waist,chest0:gg.chest0||doc.chest||null});woo();toast("اتسجل القياس · \u2066+40 XP\u2069");}})),
      M.length?el("ul",{class:"gm-mlist"},...M.slice(-6).reverse().map(m=>el("li",{},el("span",{text:fmt(m.d,{day:"numeric",month:"short"})}),el("span",{class:"num",text:(m.waist?"وسط "+m.waist:"")+(m.chest?"  ·  صدر "+m.chest:"")})))):null);
    const x=gXP(),badges=el("div",{class:"gm-card"},el("h2",{class:"g-h3",text:"الأوسمة"}),el("div",{class:"gm-badges"},...gBadges(x).map(([i,t,on])=>el("div",{class:"gm-badge"+(on?" on":""),"aria-label":t+(on?"، مفتوح":"، لسه")},el("span",{"aria-hidden":"true",text:on?i:"🔒"}),el("span",{text:t})))));
    const setup=el("details",{class:"gm-card gm-set"},el("summary",{text:"إعدادات الهدف"}),
      el("div",{class:"gm-mrow"},
        el("label",{class:"field"},el("span",{class:"label",text:"هدف الوسط (سم)"}),numIn("هدف الوسط",g.waistT,"مثلا 86",v=>gSet("goal",{...gDocs().goal,waistT:v||null}))),
        el("label",{class:"field"},el("span",{class:"label",text:"خطوات في اليوم"}),numIn("هدف الخطوات",g.stepsT,"8000",v=>gSet("goal",{...gDocs().goal,stepsT:v||8000}))),
        el("label",{class:"field"},el("span",{class:"label",text:"بروتين (جرام)"}),numIn("هدف البروتين",g.proteinT,String(gProteinT()),v=>gSet("goal",{...gDocs().goal,proteinT:v||null})))),
      el("p",{class:"hint",text:"البروتين الافتراضي = 2 جرام لكل كيلو من وزنك."}));
    const why=el("details",{class:"gm-card"},el("summary",{text:"ليه كده؟ (العلم ورا المهمة)"}),el("ul",{class:"gm-why"},
      ...["الدهون مش بتتحرق من مكان معين بتمرين المكان ده. بتنزل من الجسم كله، والصدر والجنب والبطن من آخر الأماكن، فالصبر مهم.","عجز سعرات بسيط (حوالي 300 لـ 500 سعر في اليوم) بينزّل الدهون من غير ما يضيّع العضل.","تمرين المقاومة والبروتين العالي بيحافظوا على العضل ويخلّوا الصدر شكله مشدود وانت بتنشف.","المشي اليومي أسهل طريقة تزوّد الحرق من غير ما تتعب تمرينك.","هدف آمن: تنزل نص لـ واحد في المية من وزنك في الأسبوع. لو بتنزل أسرع من كده، كُل أكتر شوية.","الوسط عند السُرّة أصدق من الميزان: لو الوسط بينزل والوزن ثابت، انت بتنشف وبتبني عضل."].map(t=>el("li",{text:t}))));
    return [gLevelBar(false),goalCard,qs,weekly,meas,badges,setup,why];
  }
  function gToday(){
    const a=gActive(); if(gDay==null)gDay=gDefaultDay(); const d=gDay, day=GYM[d];
    const tabs=el("div",{class:"g-days",role:"tablist","aria-label":"أيام البرنامج"},...GYM.map((x,j)=>el("button",{type:"button",role:"tab","aria-selected":String(j===d),text:x.t+(a&&a.day===j?" ●":""),onclick:()=>{gDay=j;renderGym();}})));
    const head=el("div",{class:"g-dayhead"},gLevelBar(true),el("h2",{text:day.f}),el("p",{class:"g-goal",text:"هدف اليوم: "+day.g}));
    if(!day.sl)return [tabs,head,el("div",{class:"g-rest-day",text:"النهارده راحة. نام كويس وكُل بروتين كفاية، وبكرة ترجع أقوى."})];
    const planned=day.sl.reduce((n,s)=>n+s.s,0), done=a&&a.day===d?Object.values(a.sets).filter(v=>v.done).length:0;
    const bar=a&&a.day===d?el("div",{class:"g-live"},
        el("div",{class:"g-live-l"},el("span",{class:"label",text:gTimeText(a).lbl}),el("b",{class:"num","data-gclock":"1",text:gTimeText(a).t})),
        el("div",{class:"g-live-m"},el("span",{class:"num",text:done+" / "+planned+" سيت"}),el("div",{class:"track"},el("div",{class:"fill good",style:"width:"+(done/planned*100)+"%"}))),
        el("div",{class:"g-live-r"},el("button",{class:"btn",type:"button",text:"خلّصت التمرين",onclick:gFinish}),el("button",{class:"mini",type:"button",text:"إلغاء",onclick:e=>gCancel(e.currentTarget)})))
      :el("div",{class:"g-live idle"},el("span",{class:"hint",text:a?"فيه تمرين شغال لـ "+GYM[a.day].t+".":"التايمر بيبدأ لوحده أول ما تعلّم على أول سيت."}),
        a?el("button",{class:"btn ghost",type:"button",text:"روح للتمرين الشغال",onclick:()=>{gDay=a.day;renderGym();}}):el("button",{class:"btn",type:"button",text:"ابدأ التمرين",onclick:()=>gStart(d)}));
    return [tabs,head,bar,...day.sl.map((_,i)=>gCard(d,i)),
      el("details",{class:"g-rules"},el("summary",{text:"قواعد التوقيت والسلامة"}),el("dl",{},...GYM_RULES.flatMap(([k,v])=>[el("dt",{text:k}),el("dd",{text:v})])))];
  }
  function gHistory(){
    const ss=gSessions();
    if(!ss.length)return [el("p",{class:"g-empty",text:"لسه مفيش تمارين محفوظة. أول ما تخلّص تمرين، هيظهر هنا."})];
    return [el("ul",{class:"g-hist"},...ss.map(s=>{
      const del=el("button",{type:"button",class:"x","aria-label":"امسح تمرين "+fmt(s.date,{day:"numeric",month:"short"}),text:"×"});let armed=false;
      del.onclick=()=>{if(!armed){armed=true;del.textContent="؟";setTimeout(()=>{armed=false;del.textContent="×";},3000);return;}gDelSession(s.id);};
      return el("li",{},el("details",{},el("summary",{},
          el("span",{class:"g-h-d",text:new Date(s.start).toLocaleDateString("ar-EG",{weekday:"long",day:"numeric",month:"long"})}),
          el("span",{class:"g-h-t",text:GYM[s.day]?GYM[s.day].t+": "+s.title:s.title}),
          el("span",{class:"num",text:gClock(s.end-s.start)+" · "+s.sets+"/"+(s.planned||s.sets)+" سيت"})),
        el("ul",{class:"g-h-items"},...(s.items||[]).map(it=>el("li",{},el("b",{text:it.ar}),el("span",{class:"en",lang:"en",dir:"ltr",text:it.en}),
          el("span",{class:"hint",text:it.sets.length?it.sets.map(gFmtSet).join("   |   "):"متعملش"}))))),del);}))];
  }
  function gStats(){
    const ss=gSessions(); if(!ss.length){const bs=bwSummary("ar");return [el("h2",{class:"g-h3",text:"وزن الجسم"}),el("div",{class:"slp-tiles"},...bs.lines.map(([k,v])=>el("div",{class:"slp-tile"},el("b",{class:"num",text:v}),el("span",{class:"hint",text:k})))),bwSpark(bs.L,600,60),el("p",{class:"g-empty",text:"تحليلات التمرين بتظهر بعد أول تمرين تخلّصه."})].filter(Boolean);}
    const today=iso(new Date()), wk=weekStart(today);
    const inWeek=ss.filter(s=>s.date>=wk), mins=ss.slice(0,10).map(s=>(s.end-s.start)/60000), avg=mins.reduce((a,b)=>a+b,0)/mins.length;
    const days=new Set(ss.map(s=>s.date)); let streak=0; for(let d=today;;d=addDays(d,-1)){if(days.has(d))streak++;else if(d!==today&&parse(d).getDay()!==5)break;if(streak>400)break;}
    const tiles=el("div",{class:"slp-tiles"},
      el("div",{class:"slp-tile"},el("b",{class:"num",text:inWeek.length+" / 6"}),el("span",{class:"hint",text:"تمارين الأسبوع ده"})),
      el("div",{class:"slp-tile"},el("b",{class:"num",text:String(ss.length)}),el("span",{class:"hint",text:"إجمالي التمارين"})),
      el("div",{class:"slp-tile"},el("b",{class:"num",text:Math.round(avg)+" د"}),el("span",{class:"hint",text:"متوسط مدة التمرين"})),
      el("div",{class:"slp-tile"},el("b",{class:"num",text:String(streak)}),el("span",{class:"hint",text:"أيام ورا بعض (الجمعة مش بتكسر السلسلة)"})));
    // last 8 weeks
    const weeks=[];for(let j=7;j>=0;j--){const s=addDays(wk,-7*j),e=addDays(s,6);weeks.push({s,n:ss.filter(x=>x.date>=s&&x.date<=e).length});}
    const wchart=el("div",{class:"g-weeks",role:"img","aria-label":"عدد التمارين في آخر 8 أسابيع: "+weeks.map(w=>w.n).join("، ")},...weeks.map(w=>el("div",{class:"g-wk"},el("div",{class:"g-wk-bar"},el("div",{style:"height:"+Math.min(100,w.n/6*100)+"%"})),el("span",{class:"num",text:String(w.n)}),el("span",{class:"hint",text:fmt(w.s,{day:"numeric",month:"numeric"})}))));
    // sets per muscle this week
    const mus={};Object.keys(MUSC).forEach(k=>mus[k]=0);inWeek.forEach(s=>(s.items||[]).forEach(it=>{mus[it.m]=(mus[it.m]||0)+it.sets.length;}));
    const mx=Math.max(1,...Object.values(mus));
    const mchart=el("div",{class:"g-mus"},...Object.entries(mus).map(([k,v])=>el("div",{class:"g-mrow"},el("span",{text:MUSC[k]}),el("div",{class:"track"},el("div",{class:"fill",style:"width:"+(v/mx*100)+"%"})),el("span",{class:"num",text:String(v)}))));
    // weight progress per exercise
    const by={};ss.slice().reverse().forEach(s=>(s.items||[]).forEach(it=>{const best=Math.max(0,...it.sets.flatMap(z=>[Number(z.w)||0,...(z.x||[]).map(p=>Number(p.w)||0)]));if(best>0){(by[it.ar]=by[it.ar]||{en:it.en,pts:[]}).pts.push({d:s.date,w:best,r:null});}}));
    const prog=Object.keys(by).length?el("ul",{class:"g-prog"},...Object.entries(by).map(([n,o])=>{const f=o.pts[0].w,l=o.pts[o.pts.length-1].w,ch=l-f;
        const max=Math.max(...o.pts.map(p=>p.w)),min=Math.min(...o.pts.map(p=>p.w));const pts=o.pts.slice(-12);
        const W=120,H=28;const path=pts.map((p,j)=>(j?"L":"M")+(pts.length>1?j/(pts.length-1)*W:W/2).toFixed(1)+","+(H-2-(max===min?0.5:(p.w-min)/(max-min))*(H-4)).toFixed(1)).join(" ");
        const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 "+W+" "+H);svg.setAttribute("class","g-spark");svg.setAttribute("aria-hidden","true");
        const pe=document.createElementNS("http://www.w3.org/2000/svg","path");pe.setAttribute("d",path);svg.append(pe);
        return el("li",{},el("div",{},el("b",{text:n}),el("span",{class:"en",lang:"en",dir:"ltr",text:o.en})),svg,
          el("span",{class:"num",text:l+" كجم"}),el("span",{class:"chip "+(ch>0?"good":""),text:ch>0?"\u2066+"+ch+"\u2069 كجم":ch<0?"\u2066\u2212"+Math.abs(ch)+"\u2069 كجم":"ثابت"}));})):el("p",{class:"hint",text:"سجّل الوزن في كل سيت عشان تشوف تطورك في كل تمرين."});
    const bs=bwSummary("ar");
    const bwBlock=[el("h2",{class:"g-h3",text:"وزن الجسم"}),el("div",{class:"slp-tiles"},...bs.lines.map(([k,v])=>el("div",{class:"slp-tile"},el("b",{class:"num",text:v}),el("span",{class:"hint",text:k})))),bwSpark(bs.L,600,60)].filter(Boolean);
    return [tiles,...bwBlock,el("h2",{class:"g-h3",text:"التمارين في آخر 8 أسابيع"}),wchart,el("h2",{class:"g-h3",text:"عدد السيتات لكل عضلة الأسبوع ده"}),mchart,el("h2",{class:"g-h3",text:"تطور الأوزان"}),prog];
  }
  function renderGym(){
    const v=document.getElementById("gymView"); if(!v||v.hidden)return;
    if(window.__sbEditing&&v.contains(document.activeElement))return;
    const a=gActive();
    const gtb=document.getElementById("gymTabs");gtb.querySelectorAll("button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.t===gTab)));requestAnimationFrame(()=>slideInd(gtb,'button[aria-selected="true"]'));
    const body=document.getElementById("gymBody");
    rc(body,...(gTab==="today"?gToday():gTab==="history"?gHistory():gTab==="mission"?gMission():gStats()));
    if(a)gWakeLock(true);
  }
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&gActive())gWakeLock(true);});
  document.getElementById("bwBtnGym").onclick=openBW;
  document.getElementById("gymTabs").addEventListener("click",e=>{const b=e.target.closest("button[data-t]");if(!b)return;gTab=b.dataset.t;renderGym();});
  // ---------- pages: one job per page. Top tabs on a computer, bottom tabs on a phone ----------
  const ICO={today:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    time:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',projects:'<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    learning:'<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z"/><path d="M4 19a2 2 0 012-2h13"/>',progress:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    health:'<path d="M20.8 5.6a5 5 0 00-7.1 0L12 7.3l-1.7-1.7a5 5 0 10-7.1 7.1L12 21.5l8.8-8.8a5 5 0 000-7.1z"/>',
    gym:'<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    fellow:'<path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z"/><path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/><path d="M5 16l.6 1.4L7 18l-1.4.6L5 20l-.6-1.4L3 18l1.4-.6z"/>',
    brain:'<path d="M9 4a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 002 5 3 3 0 006 0V7a3 3 0 00-3-3z"/><path d="M15 4a3 3 0 013 3 3 3 0 012 5 3 3 0 01-2 5 3 3 0 01-6 0"/>',
    sounds:'<path d="M3 14v-2a9 9 0 0118 0v2"/><rect x="2.5" y="14" width="4.5" height="7" rx="1.5"/><rect x="17" y="14" width="4.5" height="7" rx="1.5"/>',
    salah:'<path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/><path d="M17 4.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>',
    wins:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z"/><path d="M17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3"/>',
    more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>'};
  function svgIco(k){const sp=document.createElement("span");sp.className="tico";sp.setAttribute("aria-hidden","true");sp.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+ICO[k]+'</svg>';return sp;}
  const PAGES=[["today","Today"],["fellow","Fellow"],["brain","Brain"],["salah","صلاة"],["time","Time"],["projects","Projects"],["learning","Learning"],["progress","Progress"],["wins","Wins"],["health","Health"],["sounds","Intentional media"],["gym","Gym"],["settings","Settings"]];
  const MOBILE_MAIN=["today","fellow","brain","salah"];
  let page="today"; try{const h=location.hash.slice(1);if(PAGES.some(x=>x[0]===h))page=h;}catch(e){}
  let moreOpen=false;
  function tabBtn([id,name],cls){return el("button",{type:"button",class:cls,"data-p":id,"data-hue":id,"aria-current":String(page===id?"page":"false")},svgIco(id),el("span",{class:"tname",text:name}));}
  function slideInd(box,sel){if(!box)return;let ind=box.querySelector(".ind");if(!ind){ind=el("span",{class:"ind","aria-hidden":"true"});box.prepend(ind);}
    const a=box.querySelector(sel);if(!a){ind.style.opacity="0";return;}ind.style.opacity="1";ind.style.width=a.offsetWidth+"px";ind.style.transform="translateX("+a.offsetLeft+"px)";ind.dataset.hue=a.dataset.hue||"";}
  function buildNav(){
    const pt=document.getElementById("pageTabs");rc(pt,...PAGES.filter(x=>x[0]!=="settings").map(x=>tabBtn(x,"ptab")));requestAnimationFrame(()=>slideInd(pt,'[aria-current="page"]'));
    let st=document.getElementById("setTab");if(!st){st=el("div",{id:"setTab",class:"ptabs-set"});pt.after(st);}rc(st,tabBtn(PAGES.find(x=>x[0]==="settings"),"ptab ptab-set"));
    const inMore=!MOBILE_MAIN.includes(page);
    document.getElementById("botNav").replaceChildren(...PAGES.filter(x=>MOBILE_MAIN.includes(x[0])).map(x=>tabBtn(x,"btab")),
      el("button",{type:"button",class:"btab"+(inMore?" on":""),id:"moreBtn","data-hue":inMore?page:"more","aria-expanded":String(moreOpen),"aria-controls":"moreMenu"},svgIco(inMore?page:"more"),el("span",{class:"tname",text:inMore?PAGES.find(x=>x[0]===page)[1]:"More"})));
    const mm=document.getElementById("moreMenu");mm.hidden=!moreOpen;
    rc(mm,...PAGES.filter(x=>!MOBILE_MAIN.includes(x[0])).map(x=>tabBtn(x,"mtab")));
  }
  window.addEventListener("resize",()=>{slideInd(document.getElementById("pageTabs"),'[aria-current="page"]');slideInd(document.getElementById("gymTabs"),'button[aria-selected="true"]');});
  function setPage(p){
    page=p; moreOpen=false;
    try{history.replaceState(null,"","#"+p);}catch(e){}
    document.getElementById("workView").hidden=p==="gym"; document.getElementById("gymView").hidden=p!=="gym";
    document.querySelectorAll("#workView .page").forEach(pg=>{pg.hidden=pg.dataset.page!==p;});
    document.querySelector("#workView .top").hidden=p==="settings";
    document.body.classList.toggle("page-gym",p==="gym"); document.body.dataset.page=p;
    document.getElementById("gymTabs").hidden=p!=="gym";document.getElementById("bwBtnGym").hidden=p!=="gym";
    buildNav();
    if(p==="gym")renderGym();else render();
    window.scrollTo(0,0);
    const h=p==="gym"?document.querySelector("#gymView h1"):document.querySelector('#workView .page[data-page="'+p+'"] h2')||document.getElementById("dateLabel");
    if(h&&document.activeElement&&document.activeElement.closest&&document.activeElement.closest(".topnav,.botnav,#moreMenu,#hubSub")){h.setAttribute("tabindex","-1");h.focus({preventScroll:true});}
    say(((PAGES.find(x=>x[0]===p)||[0,p==="linkedin"?"LinkedIn":p==="finance"?"Finance":p])[1])+" page");
  }
  document.addEventListener("click",e=>{
    const b=e.target.closest("[data-p]");
    if(b&&b.closest(".topnav,.botnav,#moreMenu,#hubSub")){e.preventDefault();setPage(b.dataset.p);return;}
    if(e.target.closest("#moreBtn")){moreOpen=!moreOpen;buildNav();if(moreOpen)setTimeout(()=>{const f=document.querySelector("#moreMenu button");if(f)f.focus();},0);return;}
    if(moreOpen&&!e.target.closest("#moreMenu")){moreOpen=false;buildNav();}
  });
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&moreOpen){moreOpen=false;buildNav();document.getElementById("moreBtn").focus();}});
  // tips: the small i buttons are hidden unless you turn them on
  let tipsOn=false; try{tipsOn=localStorage.getItem("sb-tips")==="on";}catch(e){}
  function applyTips(){document.documentElement.toggleAttribute("data-tips",tipsOn);const b=document.getElementById("tipsBtn");if(b){b.setAttribute("aria-pressed",String(tipsOn));b.textContent=tipsOn?"Tips on":"Tips off";}}
  document.getElementById("tipsBtn").onclick=()=>{tipsOn=!tipsOn;try{localStorage.setItem("sb-tips",tipsOn?"on":"off");}catch(e){}applyTips();};
  applyTips();
  // Arabic or English: every text field and textarea picks its direction from what you type
  function autoDir(root){(root||document).querySelectorAll('input:not([type]),input[type="text"],input[type="search"],textarea').forEach(x=>{if(!x.hasAttribute("dir"))x.dir="auto";});}
  autoDir(); new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)autoDir(n.parentNode||n);}))).observe(document.body,{childList:true,subtree:true});
  // new versions: when the app comes back to the screen, check for an update and reload safely
  async function checkUpdate(){try{const sb=window.__sb;if(!sb||!navigator.onLine)return;const cur=(JSON.parse(localStorage.getItem("sb-app")||"{}")||{}).version;if(!cur)return;
    const {data}=await sb.from("app_code").select("version").order("version",{ascending:false}).limit(1);const v=data&&data[0]&&data[0].version;
    if(v&&v!==cur){let tried=null;try{tried=sessionStorage.getItem("sb-upd");}catch(e){}if(tried===String(v))return;if(!gActive()&&!window.__sbEditing){try{sessionStorage.setItem("sb-upd",String(v));}catch(e){}location.reload();}else{const n=document.getElementById("notice");rc(n,"A new version is ready. ",el("button",{class:"mini",type:"button",text:"Update now",onclick:()=>location.reload()}));n.hidden=false;}}}catch(e){}}
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")checkUpdate();});
  {const v=(()=>{try{return (JSON.parse(localStorage.getItem("sb-app")||"{}")||{}).version;}catch(e){return null;}})();const av=document.getElementById("appVer");if(av&&v)av.textContent="Version "+String(v).slice(-6);
   document.getElementById("updBtn").onclick=async()=>{toast("Checking...");await checkUpdate();setTimeout(()=>toast("You're on the latest version"),1500);};}
  setInterval(checkUpdate,10*60000); setTimeout(checkUpdate,4000);

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
    const KEEP=["today","gym","finance","progress","settings","sounds"];
    ICO.gym=XI.mgym;ICO.money=XI.mmoney;
    ICO.cset='<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>';
    XI.cset=ICO.cset;
    HUBS.splice(0,HUBS.length,
      {id:"today",name:"Today",ico:"today",pages:[["today","Today"]]},
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
    const kids={};leafTasks().filter(t=>warOpenT(t)&&t.parent).forEach(t=>{(kids[t.parent]=kids[t.parent]||[]).push(t);});
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
      b.style.setProperty("--l",l+"%");b.style.setProperty("--w",Math.max(1.2,r-l)+"%");b.classList.add("tb-sess");});
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


  // =====================================================================
  // 12 Nov: safe saving across devices. A device sends only what it changed and merges it into the newest server copy,
  // so a stale device (after a reload, or a dropped connection) can no longer overwrite what another device saved.
  // =====================================================================
    queueSave=function(s,ms){dirty.add(s);clearTimeout(pending[s]);pending[s]=setTimeout(()=>saveLog(s),Math.min(ms,60));};
  (function(){
    if(!window.claude||!window.__sb||window.__sbSafe)return;window.__sbSafe=true;
    const SAFE=new Set(["logs","entries","projects","learning","inquiries","sprints","habits","sleep","salah","listen","notes","design","guard","reminders","events","fin","finlog","buy","acct"]);
    const clone=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
    const isO=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
    const eq=(a,b)=>{if(a==null&&b==null)return true;if(a===b)return true;if(Array.isArray(a)&&Array.isArray(b))return a.length===b.length&&a.every((v,i)=>eq(v,b[i]));
      if(isO(a)&&isO(b)){const ka=Object.keys(a).filter(k=>a[k]!=null),kb=Object.keys(b).filter(k=>b[k]!=null);return ka.length===kb.length&&ka.every(k=>eq(a[k],b[k]));}return false;};
    // how to tell the elements of an array apart: by id, by date, by time stamp, or by value. Anything else is replaced whole.
    const keyFn=arr=>{if(arr.every(e=>isO(e)&&typeof e.id==="string"))return e=>e.id;
      if(arr.every(e=>isO(e)&&e.id==null&&typeof e.date==="string"))return e=>e.date;
      if(arr.every(e=>isO(e)&&e.id==null&&e.date==null&&typeof e.at==="number"))return e=>String(e.at);
      if(arr.every(e=>typeof e==="string"||typeof e==="number"))return e=>String(e);return null;};
    function arrDiff(x,y){const all=x.concat(y);if(!all.length)return null;const f=keyFn(all);if(!f)return null;const kx=x.map(f),ky=y.map(f);
      if(new Set(kx).size!==kx.length||new Set(ky).size!==ky.length)return null;const mx=new Map(x.map((e,i)=>[kx[i],e])),sy=new Set(ky),add=[],chg=[],del=[];
      y.forEach((e,i)=>{if(!mx.has(ky[i]))add.push(e);else if(!eq(mx.get(ky[i]),e))chg.push(e);});kx.forEach(k=>{if(!sy.has(k))del.push(k);});
      if(!add.length&&!chg.length&&!del.length)return null;return {add,chg,del,full:y};}
    function diffObj(a,b,path,ops){a=a||{};b=b||{};for(const k of new Set([...Object.keys(a),...Object.keys(b)])){const x=a[k],y=b[k];if(eq(x,y))continue;const p=path.concat(k);
      if(y==null)ops.push({p,del:1});else if(Array.isArray(y)&&(x==null||Array.isArray(x))){const o=arrDiff(x||[],y);ops.push(o?{p,arr:o}:{p,set:y});}
      else if(isO(y)&&(x==null||isO(x)))diffObj(x,y,p,ops);else ops.push({p,set:y});}}
    function applyOps(doc,ops){doc=clone(doc)||{};for(const op of ops){let cur=doc;for(let i=0;i<op.p.length-1;i++){if(!isO(cur[op.p[i]]))cur[op.p[i]]={};cur=cur[op.p[i]];}const k=op.p[op.p.length-1];
      if(op.del)delete cur[k];else if(op.arr){let arr=Array.isArray(cur[k])?cur[k]:[];const a=op.arr,f=keyFn(arr.concat(a.add,a.chg));
        if(!f)arr=clone(a.full);else{const dels=new Set(a.del);arr=arr.filter(e=>!dels.has(f(e)));a.chg.forEach(e=>{const i=arr.findIndex(z=>f(z)===f(e));if(i>=0)arr[i]=clone(e);else arr.push(clone(e));});a.add.forEach(e=>{if(!arr.some(z=>f(z)===f(e)))arr.push(clone(e));});}
        cur[k]=arr;}else cur[k]=clone(op.set);}return doc;}
    // outbox: what this device still has to send
    const recent={};let snapCount=0;
    const outboxMap=()=>{const m={};const now=Date.now();for(const k in recent){recent[k]=recent[k].filter(r=>now-r.t<4000);if(recent[k].length)(m[k]=m[k]||[]).push(...recent[k].flatMap(r=>r.ops));else delete recent[k];}try{(JSON.parse(localStorage.getItem("sb-outbox")||"[]")||[]).forEach(j=>{if(j&&j.op==="update"&&j.body&&j.body.$d)(m[j.path]=m[j.path]||[]).push(...j.body.$d);});}catch(e){}return m;};
    const view=(path,d,ob)=>{if(!isO(d))return d;const ops=ob[path];if(!ops&&!("$d" in d))return d;const x=clone(d);delete x.$d;return ops?applyOps(x,ops):x;};
    const uiSeen={},colIds={};
    // one request: the server merges the changes into the newest copy atomically. If the server function is not there yet, read, merge and write instead.
    async function applyToServer(raw,path,ops){const [c,...r]=path.split("/"),id=r.join("/");let res;
      try{res=await window.__sb.rpc("doc_apply",{p_col:c,p_id:id,p_ops:ops});}catch(e){const x=new Error((e&&e.message)||"Could not reach the server");x.code="unavailable";throw x;}
      if(res&&res.error){const er=res.error,missing=er.code==="PGRST202"||er.code==="42883"||/doc_apply/.test(er.message||"")&&/not find|does not exist|schema cache/i.test(er.message||"");
        if(!missing){const x=new Error(er.message||"Save failed");x.code=er.code&&/^(08|57|53|PGRST3)/.test(er.code)?"unavailable":(er.code||"failed");if(!er.code||/fetch|network|timeout|Failed/i.test(er.message||""))x.code="unavailable";throw x;}
        return slowMerge(raw,path,ops);}
      (recent[path]=recent[path]||[]).push({t:Date.now(),ops});}
    async function slowMerge(raw,path,ops){const [c,...r]=path.split("/"),id=r.join("/");let S=null;
      try{const q=await window.__sb.from("docs").select("data").eq("col",c).eq("id",id).maybeSingle();if(q.error)throw q.error;S=q.data?q.data.data:null;}
      catch(e){const x=new Error((e&&e.message)||"Could not read the latest copy");x.code="unavailable";throw x;}
      if(S==null)return raw.set(applyOps({},ops));
      const doc=applyOps(S,ops),patch={};for(const k of new Set([...Object.keys(S),...Object.keys(doc)])){if(!eq(S[k],doc[k]))patch[k]=(k in doc)?doc[k]:null;}
      if(!Object.keys(patch).length)return;return raw.update(patch);}
    function safeDb(d){return {
      collection(c){const o=d.collection(c);return {onSnapshot(next,err){return o.onSnapshot(snap=>{const ob=outboxMap();
          const docs=snap.docs.map(x=>{const path=c+"/"+x.id,raw=x.data(),v=view(path,raw,ob);uiSeen[path]=clone(v);return v===raw?x:{id:x.id,data:()=>v};});
          const ids=new Set(snap.docs.map(x=>x.id));(colIds[c]||[]).forEach(id=>{if(!ids.has(id))delete uiSeen[c+"/"+id];});colIds[c]=[...ids];
          snapCount++;next({...snap,docs});},err);}};},
      doc(path){const o=d.doc(path);return {set:b=>o.set(b),update:p=>(p&&p.$d)?applyToServer(o,path,p.$d):o.update(p),delete:()=>o.delete()};}};}
    const rawUse=window.claude.use;window.claude.use=async function(n){const d=await rawUse.apply(this,arguments);return n==="db"&&d?safeDb(d):d;};
    // every whole-document save becomes "only what changed"
    const _set=store.set;
    store.set=function(path,body){const c=String(path).split("/")[0];if(!SAFE.has(c)||!isO(body))return _set.apply(store,arguments);
      const base=uiSeen[path]===undefined?{}:uiSeen[path],ops=[];diffObj(base,body,[],ops);uiSeen[path]=clone(body);
      if(!ops.length)return Promise.resolve();return store.update(path,{$d:ops});};
    // queued changes go out at once and are retried every 1.5 s (it used to wait up to 20 s)
    ["set","update","del","add"].forEach(m=>{const o=store[m];store[m]=function(){const r=o.apply(store,arguments);setTimeout(()=>{try{if(store.pending())store.flush();}catch(e){}},0);return r;};});
    setInterval(()=>{try{if(store.pending()&&navigator.onLine)store.flush();}catch(e){}},1500);
    // safety net: if the server changed and no live update reached this device, fetch the latest
    let lastMax=null,lastCount=-1;
    setInterval(async()=>{if(document.visibilityState!=="visible"||!navigator.onLine)return;try{const q=await window.__sb.from("docs").select("updated_at").order("updated_at",{ascending:false}).limit(1);const t=q&&q.data&&q.data[0]?q.data[0].updated_at:null;
      if(t&&lastMax&&t!==lastMax&&snapCount===lastCount)window.dispatchEvent(new Event("online"));lastMax=t||lastMax;lastCount=snapCount;}catch(e){}},5000);
    // coming back to the app: fetch the latest from the server
    let hiddenAt=0;document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")hiddenAt=Date.now();else if(hiddenAt&&Date.now()-hiddenAt>15000){hiddenAt=0;try{window.dispatchEvent(new Event("online"));}catch(e){}}});
    window.__sbSafeApi={applyOps,diffObj,eq};
  })();

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
        el("button",{type:"button",class:"btn ghost",onclick:()=>v3confirm("Mark as done: "+t.title+"?","Done",()=>setDone(t.id,true))},"Done"),
        el("button",{type:"button",class:"btn ghost",onclick:()=>v3confirm("Move to tomorrow: "+t.title+"?","Move",()=>moveTaskTo(t.id,tmOf(sel)))},"Tomorrow")):null);
    swipeable(c,()=>{setDone(t.id,true);setTimeout(renderTaskView,350);},()=>{cutDesc=null;moveTaskTo(t.id,tmOf(sel));setTimeout(renderTaskView,350);},
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


  // =====================================================================
  // 12 Nov, part C: Review screen. Sprint progress sheets, calm waterfall with subtasks, day insights, sprint board
  // =====================================================================
  WF_ST.cut="Archived";WF_HOW.cut="you archived it";
  const v3chip=t=>t.cat?el("span",{class:"cat-chip","data-cat":t.cat,text:CAT_NAME[t.cat]||t.cat}):null;
  const v3tk=()=>Object.entries(state.tasks||{}).map(([id,t])=>({id,...t}));
  const v3real=t=>!t.parent&&!t.cut&&!t.archived&&t.date;
  const v3leaf=t=>!t.cut&&!t.archived&&t.date&&isLeaf(t);
  // sprint switcher: any sprint's performance, closed sprints include the tasks the replan archived
  window.spView=null;window.spViewOf=cur=>sprints().find(p=>p.n===window.spView)||cur;
  window.spEnd=(sp,d)=>sp.end<d?sp.end:d;
  window.spTasks=sp=>leafTasks().filter(t=>t.sprint===sp.n&&(!t.cut||t.replacedBy||t.parkReason));
  window.spChips=sp=>{const bars=document.getElementById("bars");if(!bars)return;let row=document.getElementById("spSwitch");if(!row){row=el("div",{class:"seg sp-switch",id:"spSwitch",role:"group","aria-label":"Sprint"});bars.parentNode.insertBefore(row,bars);}
    rc(row,...sprints().map(p=>el("button",{type:"button","aria-pressed":String(p.n===sp.n),text:"Sprint "+p.n,title:p.name,onclick:()=>{window.spView=p.n;wfSprint=p.n;render();}})));};
  const v3dl=d=>fmt(d,{weekday:"short",day:"numeric",month:"short"});
  async function v3newTask(body){try{const ref=await store.add("tasks",body);state.tasks[ref.id]=body;render();return ref.id;}catch(e){fail(e);return null;}}
  // archive = hidden everywhere (it also sets cut, which the whole app already respects)
  // ---- archive with automatic refill, reschedule helpers, undo bar ----
  const v3isWork=t=>t.cat==="portfolio"||t.cat==="client";
  const v3skipFri=d=>{while(isFriday(d))d=addDays(d,1);return d;};
  function v3undoToast(msg,fn){let b=document.getElementById("v3ut");if(!b){b=el("div",{id:"v3ut",class:"undo-bar",role:"status","aria-live":"polite",hidden:""},el("span",{class:"ub-t"}),el("button",{type:"button",class:"ub-b"},"Undo"));document.body.append(b);}
    b.querySelector(".ub-t").textContent=msg;const bt=b.querySelector(".ub-b");bt.onclick=()=>{b.hidden=true;try{fn();}catch(e){console.warn(e);}};b.hidden=false;
    try{hideUndo();}catch(e){}clearTimeout(v3undoToast._t);v3undoToast._t=setTimeout(()=>{b.hidden=true;},9000);}
  const v3rec=()=>({moves:[],arch:[],parents:{}});
  function v3recMove(rec,id,d){const t=state.tasks[id];if(!t||t.date===d)return;if(!rec.moves.some(m=>m.id===id))rec.moves.push({id,date:t.date,sprint:t.sprint});
    const sp=sprintFor(d).n;state.tasks[id]={...t,date:d,sprint:sp};setTask(id,{date:d,sprint:sp});if(t.parent)rec.parents[t.parent]=rec.parents[t.parent]||null;}
  function v3recArch(rec,id,on,by){const t=state.tasks[id];if(!t)return;rec.arch.push({id,archived:!!t.archived,cut:!!t.cut,by:t.archivedBy||null});
    const patch=on?{archived:true,cut:true,archivedBy:by||null}:{archived:false,cut:false,archivedBy:null};state.tasks[id]={...t,...patch};setTask(id,patch);if(t.parent)rec.parents[t.parent]=rec.parents[t.parent]||null;}
  // keep each touched parent's date, span and minutes in step with its live steps
  function v3syncParents(rec){Object.keys(rec.parents).forEach(pid=>{const P=state.tasks[pid];if(!P||P.archived)return;
    const ks=Object.entries(state.tasks).map(([i,x])=>({id:i,...x})).filter(x=>x.parent===pid&&!x.archived&&!x.cut&&x.date);if(!ks.length)return;
    const dates=ks.map(x=>x.date).sort(),first=dates[0],last=dates[dates.length-1],days=Math.max(1,Math.round((new Date(last+"T12:00")-new Date(first+"T12:00"))/864e5)+1),mins=ks.reduce((a,x)=>a+estMin(x),0);
    if(!rec.parents[pid])rec.parents[pid]={date:P.date,days:P.days,mins:P.mins};
    const patch={date:first,days,mins};state.tasks[pid]={...P,...patch};setTask(pid,patch);});}
  function v3recUndo(rec){rec.moves.forEach(m=>{const t=state.tasks[m.id];if(!t)return;const patch={date:m.date,sprint:m.sprint===undefined?sprintFor(m.date).n:m.sprint};state.tasks[m.id]={...t,...patch};setTask(m.id,patch);});
    rec.arch.slice().reverse().forEach(a=>{const t=state.tasks[a.id];if(!t)return;const patch={archived:a.archived,cut:a.cut,archivedBy:a.by};state.tasks[a.id]={...t,...patch};setTask(a.id,patch);});
    Object.entries(rec.parents).forEach(([pid,pv])=>{if(!pv||!state.tasks[pid])return;state.tasks[pid]={...state.tasks[pid],...pv};setTask(pid,pv);});render();try{hideUndo();}catch(e){}toast("Undone");}
  // fill: for each working day, pull the next open portfolio/client steps forward until the day reaches the target
  function v3fill(days,rec){const tgt=v3dayMin(),out={days:[],mins:0,parents:[],steps:0};
    const work=()=>leafTasks().filter(t=>v3isWork(t)&&!t.cut&&!t.archived&&t.date);
    days.forEach(d=>{if(isFriday(d))return;let load=work().filter(t=>t.date===d).reduce((a,t)=>a+estMin(t),0);if(load>=tgt)return;
      const cand=work().filter(t=>!t.done&&t.date>d).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:(a.order||0)-(b.order||0));let got=0;
      for(const c of cand){if(load>=tgt)break;const m=estMin(c);if(!(m>0)||load+m>tgt+25)continue;
        const pt=c.parent&&state.tasks[c.parent]?state.tasks[c.parent].title:c.title;if(!out.parents.includes(pt))out.parents.push(pt);
        v3recMove(rec,c.id,d);load+=m;got+=m;out.steps++;}
      if(got){out.days.push(d);out.mins+=got;}});
    return out;}
  function v3fillText(r){const dl=r.days.length===1?v3dl(r.days[0]):r.days.length+" days",ys=r.parents.length<=2?r.parents.join(" and "):r.steps+" steps";return "Filled "+dl+" with "+ys+" ("+r.mins+" min)";}
  function v3daysFrom(d){const sp=sprintFor(d),out=[];for(let x=d;x<=sp.end;x=addDays(x,1))out.push(x);return out;}
  function v3fillDay(){const d=sel,today=iso(new Date());if(isFriday(d)){toast("Friday is a rest day");return;}if(d<today){toast("Pick today or a later day");return;}
    const rec=v3rec(),r=v3fill([d],rec);v3syncParents(rec);render();
    if(!r.days.length){toast("Nothing to fill. The day is full or no open work is left.");return;}v3undoToast(v3fillText(r),()=>v3recUndo(rec));}
  function v3archive(id,on){const t=state.tasks[id];if(!t)return;
    if(!on){const rec=v3rec();v3recArch(rec,id,false);Object.entries(state.tasks).forEach(([k,x])=>{if(x.parent===id&&x.archivedBy===id)v3recArch(rec,k,false);});render();toast("Restored");return;}
    const rec=v3rec(),kids=Object.entries(state.tasks).filter(([k,x])=>x.parent===id&&!x.archived).map(([k])=>k);
    v3recArch(rec,id,true);kids.forEach(k=>v3recArch(rec,k,true,id));
    const today=iso(new Date()),r=v3fill(v3daysFrom(today),rec);v3syncParents(rec);render();
    v3undoToast("Archived "+(t.title||"task")+". "+(r.days.length?v3fillText(r):"Nothing open to fill with."),()=>v3recUndo(rec));}
  // ---- reschedule one step: swipe left on a step row opens this ----
  const v3spOf=d=>sprints().find(p=>d>=p.start&&d<=p.end)||null;
  function v3stepMove(id,d,typed){const t=state.tasks[id];if(!t)return false;
    if(!typed&&isFriday(d))d=addDays(d,1);
    if(d===t.date){toast("It stays on "+v3dl(d));return false;}
    const to=v3spOf(d),from=v3spOf(t.date);if(!to){toast("No sprint covers "+v3dl(d));return false;}
    const warn=[];if(typed&&isFriday(d))warn.push("Friday is your rest day.");if(from&&to.n!==from.n)warn.push("This moves it into Sprint "+to.n+".");
    const run=()=>{const rec=v3rec();v3recMove(rec,id,d);v3syncParents(rec);render();v3undoToast("Moved to "+v3dl(d)+": "+t.title,()=>v3recUndo(rec));psClose(true);};
    if(warn.length){v3confirm(warn.join(" ")+" Move to "+v3dl(d)+"?","Move",run);return true;}
    run();return true;}
  function v3stepResched(id){const t0=state.tasks[id];if(!t0)return;psOpen("Reschedule step",re=>{const t=state.tasks[id];if(!t)return [el("p",{class:"ps-sh-sum",text:"This step is gone."})];
    const today=iso(new Date()),base=t.date||today,sp=sprintFor(base);
    const opts=[["Tomorrow",v3skipFri(addDays(base,1))],["Next working day",nextWork(base>today?base:today)],["In 2 days",v3skipFri(addDays(base,2))],["Next week",v3skipFri(addDays(base,7))]];
    const go=(d,typed)=>{const ae=document.activeElement;if(ae&&ae.blur)ae.blur();setTimeout(()=>{v3stepMove(id,d,typed);},30);};
    const di=v3dateField("New day",t.date,p=>go(p,true));
    return [el("p",{class:"ps-sh-sum",text:t.title}),el("p",{class:"hint",text:"Now on "+v3dl(base)+". Sprint "+sp.n+" ends "+v3dl(sp.end)+". Friday is a rest day."}),
      el("div",{class:"v3-cats"},...opts.map(([n,d])=>el("button",{type:"button",class:"cat-chip v3-rs","data-d":d,onclick:()=>go(d)},n+" · "+v3dl(d)))),
      el("label",{class:"field"},el("span",{class:"label",text:"Or type a day"}),di)];});}
  // wire the swipe on a step row: left = reschedule, right = done (after the usual confirm)
  function v3stepSwipe(li,s){li.addEventListener("pointerdown",e=>{li._x=e.clientX;li._drag=false;e.stopPropagation();});
    li.addEventListener("pointermove",e=>{if(li._x!=null&&Math.abs(e.clientX-li._x)>10)li._drag=true;});
    li.addEventListener("click",e=>{if(li._drag){e.preventDefault();e.stopPropagation();li._drag=false;}},true);
    li.setAttribute("aria-label",s.title);li.setAttribute("data-step",s.id);
    swipeable(li,()=>{setDone(s.id,true);},()=>v3stepResched(s.id),null,{r:"Mark step as done",rb:"Done",direct:true});}
  function v3sprintOf(t){return sprints().find(p=>p.n===(t.sprint||sprintFor(t.date).n))||sprintFor(t.date);}
  // order inside a day: moves the task up or down and keeps Today in step
  function v3move(id,dir){const t=state.tasks[id];if(!t)return;const L=v3tk().filter(x=>v3real(x)&&x.date===t.date).sort((a,b)=>(v3pos(a)-v3pos(b)));const i=L.findIndex(x=>x.id===id),j=i+dir;
    if(i<0||j<0||j>=L.length){toast(dir<0?"Already first":"Already last");return;}[L[i],L[j]]=[L[j],L[i]];L.forEach((x,k)=>{if(x.pos!==k)patchTask(x.id,{pos:k});});toast("Moved");}
  // ---- task pop-up: name and description, subtasks, start now. Details behind one button ----
  let v3tEdit=false;
  function v3taskSheet(id){v3tEdit=false;psOpen("Task",re=>{const t=state.tasks[id];if(!t)return [el("p",{class:"ps-sh-sum",text:"This task is gone."})];
    const subs=v3tk().filter(x=>x.parent===id&&!x.archived).sort((a,b)=>(a.order||0)-(b.order||0));
    const nm=el("textarea",{class:"v3-in v3-big","aria-label":"Task name",rows:"2"});nm.value=t.title||"";nm.onchange=()=>{const v=nm.value.trim();if(v&&v!==t.title)patchTask(id,{title:v});};
    const ds=el("textarea",{class:"v3-in","aria-label":"Description",rows:"3",placeholder:"Description"});ds.value=t.desc||"";ds.onchange=()=>patchTask(id,{desc:ds.value.trim()});
    const list=el("ul",{class:"q-list"},...subs.map(s=>{const cb=el("input",{type:"checkbox","aria-label":"Done: "+s.title});cb.checked=!!s.done;cb.onchange=()=>{patchTask(s.id,{done:cb.checked,doneAt:cb.checked?iso(new Date()):null});setTimeout(re,250);};
      return ((li,s)=>{if(s.date&&!s.done)v3stepSwipe(li,s);return li;})(el("li",{class:"q-row v3-sub"+(s.date?" v3-sub-d":""),"data-id":s.id},cb,el("span",{class:"q-t"+(s.done?" v3-done":""),text:s.title}),el("span",{class:"hint cs-est",text:aboutH(estMin(s))}),s.date?el("span",{class:"hint",text:v3dl(s.date)}):null,s.date?el("button",{type:"button",class:"mini","aria-label":"Detach "+s.title+" from this task",onclick:()=>{patchTask(s.id,{parent:null});toast("Detached. It is a normal task again.");setTimeout(re,250);}},"Detach"):el("button",{type:"button",class:"x","aria-label":"Remove "+s.title,onclick:()=>{patchTask(s.id,{archived:true,cut:true});setTimeout(re,250);}},"\u00d7")),s);}));
    v3dragList(list,".v3-sub",ids=>{ids.forEach((sid,k)=>patchTask(sid,{order:k}));setTimeout(re,300);});
    const sIn=el("input",{type:"text",class:"v3-in",placeholder:"Add a subtask","aria-label":"New subtask"});
    const addSub=async()=>{const v=sIn.value.trim();if(!v)return;sIn.value="";await v3newTask({title:v,cat:t.cat||null,parent:id,done:false,order:Date.now()});setTimeout(re,250);};
    sIn.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addSub();}});
    const sp=v3sprintOf(t);
    const det=v3tEdit?el("section",{class:"v3-ncard"},
      el("div",{class:"v3-row"},el("label",{class:"field"},el("span",{class:"label",text:"Day"}),v3dateField("Task day",t.date,p=>{if(!v3spOf(p)){toast("No sprint covers that day");re();return;}const go=()=>{moveTaskTo(id,p);setTimeout(re,300);};if(p>sp.end||p<sp.start)v3confirm("This moves it into Sprint "+v3spOf(p).n+". Move to "+v3dl(p)+"?","Move",go,re);else go();})),
        el("label",{class:"field"},el("span",{class:"label",text:"Days it spans"}),(i=>{i.onchange=()=>{const n=Math.max(1,Math.min(14,+i.value||1));if(addDays(t.date,n-1)>sp.end){toast("That runs past the end of Sprint "+sp.n);i.value=String(t.days||1);return;}patchTask(id,{days:n});};return i;})(el("input",{type:"number",class:"v3-in",min:"1",max:"14",value:String(t.days||1),"aria-label":"Days it spans"}))),
        el("label",{class:"field"},el("span",{class:"label",text:"Minutes"}),(i=>{i.onchange=()=>patchTask(id,{mins:Math.max(0,Math.round(+i.value||0))});return i;})(el("input",{type:"number",class:"v3-in",min:"0",step:"5",value:t.mins?String(t.mins):"","aria-label":"Estimated minutes",placeholder:"min"})))),
      el("div",{class:"field"},el("span",{class:"label",text:"Category"}),v3catChips(t.cat,c=>{patchTask(id,{cat:c});setTimeout(re,200);})),
      t.parent&&state.tasks[t.parent]?el("div",{class:"v3-row"},el("span",{class:"hint",text:"Part of: "+state.tasks[t.parent].title}),el("button",{type:"button",class:"mini",onclick:()=>{psClose(true);v3taskSheet(t.parent);}},"Open"),el("button",{type:"button",class:"mini",onclick:()=>{patchTask(id,{parent:null});toast("Detached. It is a normal task again.");setTimeout(re,250);}},"Detach")):
        el("button",{type:"button",class:"btn ghost",onclick:()=>{psClose(true);v3parentPick([id]);}},"Make it a subtask of..."),
      el("div",{class:"v3-row"},el("button",{type:"button",class:"btn ghost",onclick:()=>{v3move(id,-1);}},"Move up"),el("button",{type:"button",class:"btn ghost",onclick:()=>{v3move(id,1);}},"Move down"),
        el("button",{type:"button",class:"btn ghost danger",onclick:()=>v3confirm("Archive: "+t.title+"?","Archive",()=>{v3archive(id,true);psClose(true);})},"Archive"))):null;
    const estM=subs.length?subs.reduce((q,k)=>q+estMin(k),0):estMin(t);
    return [nm,v3chip(t),aboutH(estM)?el("span",{class:"hint v3-estl",text:aboutH(estM)}):null,ds,el("span",{class:"label",text:"Subtasks"+(subs.length?" ("+subs.filter(s=>s.done).length+" of "+subs.length+")":"")}),subs.length?list:null,sIn,
      el("div",{class:"v3-row"},el("button",{type:"button",class:"btn",onclick:()=>{psClose(true);v3start(id);}},"Start now"),el("button",{type:"button",class:"btn ghost","aria-expanded":String(v3tEdit),onclick:()=>{v3tEdit=!v3tEdit;re();}},v3tEdit?"Hide details":"Details")),det];});}
  // ---- nesting: no data is changed until you choose. Any task can become a subtask of another, and come back out ----
  const v3wfSprint=()=>{const today=iso(new Date()),cur=sprintFor(sel>today?today:sel);return sprints().find(p=>p.n===(wfSprint||cur.n))||cur;};
  function v3parentPick(ids){let q="";psOpen("Subtask of...",re=>{const sp=v3wfSprint(),L=v3tk().filter(t=>v3real(t)&&!ids.includes(t.id)&&t.date>=sp.start&&t.date<=sp.end&&(!q||t.title.toLowerCase().includes(q.toLowerCase()))).sort((a,b)=>a.date.localeCompare(b.date)||(v3pos(a)-v3pos(b)));
      const search=el("input",{type:"search",class:"v3-in",placeholder:"Find the parent task","aria-label":"Find the parent task",value:q});search.oninput=()=>{q=search.value;const p=search.selectionStart;re();setTimeout(()=>{const x=document.querySelector(".ps-sheet input[type=search]");if(x){x.focus();try{x.setSelectionRange(p,p);}catch(e){}}},0);};
      return [el("p",{class:"hint",text:(ids.length>1?ids.length+" tasks become":"This task becomes")+" subtasks. They keep their own days and stay on Today. Detach any time."}),search,
        L.length?el("ul",{class:"v3-tlist v3-tall"},...L.map(t=>el("li",{},el("button",{type:"button",class:"v3-trow",onclick:()=>v3confirm("Nest under: "+t.title+"?","Nest",()=>{ids.forEach(i=>patchTask(i,{parent:t.id}));toast("Nested");psClose(true);v3taskSheet(t.id);})},el("span",{text:t.title}),el("span",{class:"v3-rtag"},v3chip(t),el("span",{class:"hint",text:v3dl(t.date)})))))):el("p",{class:"ps-sh-sum",text:"No task matches."})];});}
  let v3gSel=new Set(),v3gQ="";
  function v3groupSheet(){v3gSel=new Set();v3gQ="";psOpen("Group tasks",re=>{const sp=v3wfSprint(),L=v3tk().filter(t=>v3real(t)&&t.date>=sp.start&&t.date<=sp.end&&(!v3gQ||t.title.toLowerCase().includes(v3gQ.toLowerCase()))).sort((a,b)=>a.date.localeCompare(b.date)||(v3pos(a)-v3pos(b)));
      const search=el("input",{type:"search",class:"v3-in",placeholder:"Find tasks","aria-label":"Find tasks",value:v3gQ});search.oninput=()=>{v3gQ=search.value;const p=search.selectionStart;re();setTimeout(()=>{const x=document.querySelector(".ps-sheet input[type=search]");if(x){x.focus();try{x.setSelectionRange(p,p);}catch(e){}}},0);};
      return [el("p",{class:"hint",text:"Tick the steps, then choose the task they belong to. Nothing changes until you confirm."}),search,
        el("ul",{class:"q-list"},...L.map(t=>{const cb=el("input",{type:"checkbox","aria-label":"Select "+t.title});cb.checked=v3gSel.has(t.id);cb.onchange=()=>{cb.checked?v3gSel.add(t.id):v3gSel.delete(t.id);re();};
          return el("li",{class:"q-row"},cb,el("span",{class:"q-t",text:t.title}),v3chip(t));})),
        el("button",{type:"button",class:"btn",disabled:v3gSel.size?null:"",onclick:()=>{const ids=[...v3gSel];psClose(true);v3parentPick(ids);}},v3gSel.size?"Choose the parent for "+v3gSel.size:"Tick the steps first")];});}
  // ---- the ⋯ menu on every waterfall task: reschedule, change length, move, archive ----
  function v3taskMenu(id){const t=state.tasks[id];if(!t)return;psOpen("More",re=>{const sp=v3sprintOf(t);
    return [el("p",{class:"ps-sh-sum",text:t.title}),
      el("button",{type:"button",class:"btn ghost",onclick:()=>{psClose(true);v3resched(id);}},"Reschedule"),
      el("button",{type:"button",class:"btn ghost",onclick:()=>{psClose(true);v3length(id);}},"Change length"),
      el("div",{class:"v3-row"},el("button",{type:"button",class:"btn ghost",onclick:()=>{v3move(id,-1);}},"Move up"),el("button",{type:"button",class:"btn ghost",onclick:()=>{v3move(id,1);}},"Move down")),
      t.archived?el("button",{type:"button",class:"btn",onclick:()=>{v3archive(id,false);psClose(true);}},"Restore"):el("button",{type:"button",class:"btn ghost danger",onclick:()=>v3confirm("Archive: "+t.title+"?","Archive",()=>{v3archive(id,true);psClose(true);})},"Archive")];});}
  function v3resched(id){psOpen("Reschedule",re=>{const t=state.tasks[id],sp=v3sprintOf(t),today=iso(new Date());let nd=t.date;
    const days=[];for(let d=today>sp.start?today:sp.start;d<=sp.end&&days.length<7;d=addDays(d,1))days.push(d);
    const chips=el("div",{class:"v3-cats"},...days.map(d=>el("button",{type:"button",class:"cat-chip"+(nd===d?" on":""),onclick:()=>{nd=d;di.value=fmt(d,{day:"numeric",month:"short",year:"numeric"});chips.querySelectorAll(".cat-chip").forEach((c,i)=>c.classList.toggle("on",days[i]===d));}},d===today?"Today":fmt(d,{weekday:"short",day:"numeric"}))));
    const di=v3dateField("New day",t.date,p=>{nd=p;chips.querySelectorAll(".cat-chip").forEach(c=>c.classList.remove("on"));});
    return [el("p",{class:"ps-sh-sum",text:t.title}),el("p",{class:"hint",text:"Sprint "+sp.n+" ends "+v3dl(sp.end)+". Moving past it asks first."}),chips,el("label",{class:"field"},el("span",{class:"label",text:"Or type a day"}),di),
      el("button",{type:"button",class:"btn",onclick:()=>{const ae=document.activeElement;if(ae&&ae.blur)ae.blur();setTimeout(()=>{if(!v3spOf(nd)){toast("No sprint covers that day");return;}const go=()=>{moveTaskTo(id,nd);psClose(true);};if(nd>sp.end||nd<sp.start)v3confirm("This moves it into Sprint "+v3spOf(nd).n+". Move to "+v3dl(nd)+"?","Move",go);else go();},30);}},"Reschedule")];});}
  function v3length(id){psOpen("Change length",re=>{const t=state.tasks[id],sp=v3sprintOf(t);let dys=t.days||1,mn=t.mins||0;
    const d=el("input",{type:"number",class:"v3-in",min:"1",max:"14",value:String(dys),"aria-label":"Days it spans"}),m=el("input",{type:"number",class:"v3-in",min:"0",step:"5",value:mn?String(mn):"",placeholder:"min","aria-label":"Estimated minutes"});
    return [el("p",{class:"ps-sh-sum",text:t.title}),el("div",{class:"v3-row"},el("label",{class:"field"},el("span",{class:"label",text:"Days it spans"}),d),el("label",{class:"field"},el("span",{class:"label",text:"Minutes of work"}),m)),
      el("button",{type:"button",class:"btn",onclick:()=>{const n=Math.max(1,Math.min(14,+d.value||1));if(addDays(t.date,n-1)>sp.end){toast("That runs past the end of Sprint "+sp.n);return;}patchTask(id,{days:n,mins:Math.max(0,Math.round(+m.value||0))});psClose(true);toast("Length updated");}},"Save")];});}
  var wfTimeline;
  // ---- waterfall: parent tasks only, calm rows, tap a task for its pop-up ----
  wfTimeline=function(box){
    const today=iso(new Date()),cur=sprintFor(sel>today?today:sel),sp=sprints().find(p=>p.n===(wfSprint||cur.n))||cur;
    const days=[];for(let d=sp.start;d<=sp.end;d=addDays(d,1))days.push(d);
    const all=v3tk().filter(t=>!t.parent&&t.date>=sp.start&&t.date<=sp.end);
    const counts={};all.forEach(t=>{const s=taskStatus(t,today);counts[s]=(counts[s]||0)+1;});
    const legacy=t=>t.archived&&(t.replacedBy||t.parkReason),ts=all.filter(t=>wfCut||!t.archived||legacy(t)).sort(wfGroup==="cat"?(a,b)=>(CAT_NAME[a.cat]||"").localeCompare(CAT_NAME[b.cat]||"")||a.date.localeCompare(b.date)||(v3pos(a)-v3pos(b)):(a,b)=>a.date.localeCompare(b.date)||(v3pos(a)-v3pos(b)));
    const ctrls=el("div",{class:"wf-ctrls"},
      el("div",{class:"seg",role:"group","aria-label":"Sprint"},...sprints().map(p=>el("button",{type:"button","aria-pressed":String(p.n===sp.n),text:"Sprint "+p.n,title:p.name,onclick:()=>{wfSprint=p.n;render();}}))),
      el("div",{class:"seg",role:"group","aria-label":"Group tasks"},el("button",{type:"button","aria-pressed":String(wfGroup==="day"),text:"By day",onclick:()=>{wfGroup="day";render();}}),el("button",{type:"button","aria-pressed":String(wfGroup==="cat"),text:"By category",onclick:()=>{wfGroup="cat";render();}})),
      el("button",{type:"button",class:"mini","aria-pressed":String(wfCut),text:wfCut?"Hide archived":"Show archived",onclick:()=>{wfCut=!wfCut;render();}}),
      el("button",{type:"button",class:"mini",onclick:()=>v3groupSheet()},"Group tasks"));
    const live=all.filter(t=>!t.archived||legacy(t)),done=live.filter(t=>t.done).length;
    const sum=el("div",{class:"wf-sum"},el("span",{class:"wf-pct num",text:(live.length?Math.round(done/live.length*100):0)+"%"}),el("span",{class:"hint",text:done+" of "+live.length+" tasks done · "+sp.name}));
    const grid=el("div",{class:"wf-grid",style:"--n:"+days.length});let r=1;
    grid.append(el("div",{class:"wf-h wf-lbl",style:"grid-row:1;grid-column:1",text:"Task"}),...days.map((d,i)=>el("div",{class:"wf-h"+(d===today?" today":"")+(isFriday(d)?" fri":""),style:"grid-row:1;grid-column:"+(i+2),title:fmt(d)},el("span",{text:fmt(d,{weekday:"short"}).slice(0,2)}),el("b",{class:"num",text:String(parse(d).getDate())}))));
    if(!ts.length){r++;grid.append(el("div",{class:"wf-empty",style:"grid-row:"+r,text:"No tasks in this sprint yet."}));}
    let last=null;
    ts.forEach(t=>{const st=legacy(t)&&t.done?"done":taskStatus(t,today),g=wfGroup==="cat"?(CAT_NAME[t.cat]||"Other"):fmt(t.date,{weekday:"long",day:"numeric",month:"short"});
      if(g!==last){r++;grid.append(el("div",{class:"wf-grp",style:"grid-row:"+r,text:g}));last=g;}r++;
      const a=days.indexOf(t.date);let b=a;
      if(st==="done"&&t.doneAt&&t.doneAt>t.date)b=Math.max(a,days.indexOf(t.doneAt>sp.end?sp.end:t.doneAt));
      if((st==="late"||st==="doing")&&t.date<today)b=Math.max(a,days.indexOf(today>sp.end?sp.end:today));
      b=Math.max(b,Math.min(days.length-1,a+(t.days||1)-1));
      const subs=v3tk().filter(x=>x.parent===t.id&&!x.archived),sd=subs.filter(x=>x.done).length;
      grid.append(el("div",{class:"wf-lbl v3-wfrow st-"+st,style:"grid-row:"+r+";grid-column:1"},
        el("button",{type:"button",class:"wf-task v3-wft","aria-label":t.title+", "+WF_ST[st]+", "+v3dl(t.date)+". Open task.",onclick:()=>v3taskSheet(t.id)},el("span",{class:"wf-t",text:t.title}),v3chip(t),subs.length?el("span",{class:"hint num",text:sd+"/"+subs.length}):null),
        el("button",{type:"button",class:"mini v3-more","aria-label":"More for "+t.title,onclick:()=>v3taskMenu(t.id)},"\u22EF")));
      days.forEach((d,i)=>grid.append(el("div",{class:"wf-cell"+(d===today?" today":"")+(isFriday(d)?" fri":""),style:"grid-row:"+r+";grid-column:"+(i+2)})));
      grid.append(el("div",{class:"wf-bar st-"+st,style:"grid-row:"+r+";grid-column:"+(a+2)+" / "+(b+3),"aria-hidden":"true",title:WF_ST[st]+(t.moved?" · moved "+t.moved+" time"+(t.moved>1?"s":""):"")+((t.spent||0)>0?" · "+dur(t.spent)+" tracked":"")}));});
    rc(box,ctrls,sum,el("div",{class:"wf-scroll"},grid));};
  // ---- sprint progress: every bar opens its own pop-up ----
  let v3stTab="todo",v3stAdd=false;
  function v3taskRow(t,extra){return el("li",{},el("button",{type:"button",class:"v3-trow",onclick:()=>v3taskSheet(t.id)},el("span",{text:t.title}),el("span",{class:"v3-rtag"},v3chip(t),extra?el("span",{class:"hint",text:extra}):null)));}
  function v3grouped(list,keyf,lab){const out=[];let last=null;list.forEach(t=>{const k=keyf(t);if(k!==last){out.push(el("li",{class:"v3-gh",text:lab(k)}));last=k;}out.push(v3taskRow(t,t.done?"Done":""));});return out;}
  function v3sprintSheet(k){k=k||"tasks";const today=iso(new Date()),sp=spViewOf(sprintFor(sel>today?today:sel));
    const T={tasks:"Tasks",posts:"LinkedIn posts",comments:"Comments",applications:"Applications",hours:"Hours this week"};
    psOpen("Sprint "+sp.n+" · "+T[k],re=>{
      if(k==="tasks"){const all=v3tk().filter(t=>v3leaf(t)||(isLeaf(t)&&t.date&&t.archived&&(t.replacedBy||t.parkReason))),inSp=all.filter(t=>t.date>=sp.start&&t.date<=sp.end);
        const todo=inSp.filter(t=>!t.done).sort((a,b)=>a.date.localeCompare(b.date)||(v3pos(a)-v3pos(b))),dn=all.filter(t=>t.done).sort((a,b)=>String(b.doneAt||b.date).localeCompare(String(a.doneAt||a.date)));
        const tabs=el("div",{class:"seg",role:"group"},...[["todo","Not done ("+todo.length+")"],["done","Done ("+dn.length+")"],["all","All ("+inSp.length+")"]].map(([x,n])=>el("button",{type:"button","aria-pressed":String(v3stTab===x),onclick:()=>{v3stTab=x;re();}},n)));
        let nt="",nd=today>=sp.start&&today<=sp.end?today:sp.start,nc=null;
        const form=v3stAdd?el("section",{class:"v3-ncard"},(i=>{i.oninput=()=>{nt=i.value;};return i;})(el("input",{type:"text",class:"v3-in",placeholder:"Task name","aria-label":"New task name"})),
          el("div",{class:"v3-row"},el("label",{class:"field"},el("span",{class:"label",text:"Day"}),v3dateField("Task day",nd,p=>{nd=p;}))),
          v3catChips(null,c=>{nc=c;form.querySelectorAll(".cat-chip").forEach(b=>b.classList.toggle("on",b.dataset.cat===c));}),
          el("div",{class:"v3-row"},el("button",{type:"button",class:"btn",onclick:async()=>{const ae=document.activeElement;if(ae&&ae.blur)ae.blur();await new Promise(r=>setTimeout(r,30));const title=nt.trim();if(!title){toast("Type a name");return;}if(nd>sp.end||nd<sp.start){toast("Pick a day inside Sprint "+sp.n);return;}
            await v3newTask({title,cat:nc||"portfolio",date:nd,sprint:sp.n,done:false,moved:0,order:Date.now()});v3stAdd=false;toast("Added");re();}},"Add task"),el("button",{type:"button",class:"btn ghost",onclick:()=>{v3stAdd=false;re();}},"Cancel"))):null;
        const allT=inSp.slice().sort((a,b)=>a.date.localeCompare(b.date)||(v3pos(a)-v3pos(b)));
        const rows=v3stTab==="todo"?v3grouped(todo,t=>t.date,v3dl):v3stTab==="all"?v3grouped(allT,t=>t.date,v3dl):v3grouped(dn,t=>t.doneAt||t.date,d=>v3dl(d));
        return [tabs,v3stAdd?form:el("button",{type:"button",class:"btn ghost v3-addt",onclick:()=>{v3stAdd=true;re();}},"Add task"),rows.length?el("ul",{class:"v3-tlist v3-tall"},...rows):el("p",{class:"ps-sh-sum",text:v3stTab==="todo"?"Everything in this sprint is done.":v3stTab==="all"?"No tasks in this sprint yet.":"Nothing done yet."})];}
      if(k==="hours"){const ws=weekStart(sel>today?today:sel),tgt=weeklyTarget(sel);const rows=[0,1,2,3,4,5,6].map(i=>{const d=addDays(ws,i);return [d,d>today?0:focusMin(d)];});const tot=rows.reduce((a,x)=>a+x[1],0);
        return [el("p",{class:"ps-sh-sum",text:dur(tot)+" of "+tgt+" hours"+(tot/60>=tgt?". Done.":". "+dur(Math.max(0,tgt*60-tot))+" to go.")}),el("table",{class:"lh-tab"},el("thead",{},el("tr",{},el("th",{text:"Day"}),el("th",{text:"Worked"}))),el("tbody",{},...rows.map(([d,m])=>el("tr",{},el("th",{scope:"row",text:v3dl(d)}),el("td",{class:"num",text:d>today?"":dur(m)})))))];}
      const tgtv=sp[k]||0,val=sumLogs(START,spEnd(sp,sel),k),days=[];for(let d=START;d<=spEnd(sp,today);d=addDays(d,1)){const n=Number((state.logs[d]||{})[k]||0);if(n)days.push([d,n]);}days.reverse();
      return [el("p",{class:"ps-sh-sum",text:fmtNum(val)+" of "+tgtv+" so far"+(val>=tgtv?". Target reached.":". "+fmtNum(tgtv-val)+" to go.")}),days.length?el("table",{class:"lh-tab"},el("thead",{},el("tr",{},el("th",{text:"Day"}),el("th",{text:"Done"}))),el("tbody",{},...days.map(([d,n])=>el("tr",{},el("th",{scope:"row",text:v3dl(d)}),el("td",{class:"num",text:String(n)}))))):el("p",{class:"ps-sh-sum",text:"None logged yet."})];});}
  function v3wireReview(){const keys=["tasks","posts","comments","applications","hours"];document.querySelectorAll("#bars .bar").forEach((b,i)=>{const k=keys[i];if(!k||b.dataset.v3)return;b.dataset.v3=k;b.setAttribute("role","button");b.tabIndex=0;b.style.cursor="pointer";
      b.addEventListener("click",e=>{if(e.target.closest("input,.ie,button"))return;v3sprintSheet(k);});b.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.target.closest("input"))v3sprintSheet(k);});});
    const ph=document.querySelector("#sprintH");if(ph&&!document.getElementById("v3Done")){const hd=ph.closest(".panel-head");if(hd)hd.append(el("button",{type:"button",id:"v3Done",class:"mini",onclick:()=>{v3stTab="done";v3sprintSheet("tasks");}},"Tasks done"));}
    document.querySelectorAll("#timeline .spr").forEach((c,i)=>{if(c.dataset.v3)return;c.dataset.v3="1";c.setAttribute("role","button");c.tabIndex=0;c.style.cursor="pointer";const p=sprints()[i];if(!p)return;
      c.addEventListener("click",e=>{e.stopImmediatePropagation();e.preventDefault();v3boardSheet(p.n);},true);c.addEventListener("keydown",e=>{if(e.key==="Enter")v3boardSheet(p.n);});});
    const ih=document.querySelector("#ihH");if(ih&&ih.nextElementSibling)ih.nextElementSibling.textContent="Daily insights, newest first";}
  {const _rw=render;render=function(){_rw();try{v3wireReview();}catch(e){console.warn(e);}};}
  // ---- sprint board: the sprint's goals and its tasks by category, one simple view ----
  function v3boardSheet(n){const sp=sprints().find(p=>p.n===n);if(!sp)return;psOpen("Sprint "+sp.n+": "+sp.name,re=>{const all=v3tk().filter(t=>v3leaf(t)&&t.date>=sp.start&&t.date<=sp.end),by={};all.forEach(t=>{(by[t.cat||"other"]=by[t.cat||"other"]||[]).push(t);});
    const goals=[["LinkedIn posts",sp.posts],["Comments",sp.comments],["Applications",sp.applications]].filter(g=>g[1]);
    const nmI=el("input",{type:"text",class:"v3-in","aria-label":"Sprint name",value:sp.name||""});nmI.onchange=()=>{const v=nmI.value.trim();if(v&&v!==sp.name)patchSprint(sp.n,{name:v});};
    const goI=el("textarea",{class:"v3-in","aria-label":"Sprint goal",rows:"2",placeholder:"What this sprint ships"});goI.value=sp.goal||"";goI.onchange=()=>patchSprint(sp.n,{goal:goI.value.trim()});
    return [el("p",{class:"hint",text:fmt(sp.start,{day:"numeric",month:"short"})+" to "+fmt(sp.end,{day:"numeric",month:"short"})+" · "+all.filter(t=>t.done).length+" of "+all.length+" tasks done"}),
      el("section",{class:"v3-ncard"},el("label",{class:"field"},el("span",{class:"label",text:"Name"}),nmI),el("label",{class:"field"},el("span",{class:"label",text:"Goal"}),goI),goals.length?el("div",{class:"v3-row"},...goals.map(([l,v])=>el("span",{class:"hint num",text:l+": "+v+" by the end"}))):null),
      ...Object.keys(by).sort((a,b)=>(CAT_NAME[a]||"zz").localeCompare(CAT_NAME[b]||"zz")).map(c=>{const L=by[c].sort((a,b)=>a.date.localeCompare(b.date));
        return el("section",{class:"v3-ncard"},el("div",{class:"lh-wh"},el("span",{class:"cat-chip","data-cat":c,text:CAT_NAME[c]||"Other"}),el("span"),el("b",{class:"num",text:L.filter(t=>t.done).length+"/"+L.length})),
          el("ul",{class:"v3-tlist v3-tall"},...L.map(t=>el("li",{},el("button",{type:"button",class:"v3-trow"+(t.done?" v3-done":""),onclick:()=>v3taskSheet(t.id)},el("span",{text:t.title}),el("span",{class:"hint",text:t.done?"Done":v3dl(t.date)}))))));}),
      all.length?null:el("p",{class:"ps-sh-sum",text:"No tasks in this sprint yet."})];});}
  // ---- Insights: the bank of Capture. Ideas, notes, reflections, voice notes and day insights in one place, with the Capture pop-up ----
  const V3K={idea:"Idea",reflection:"Reflection",insight:"Insight",task:"Task note",linkedin:"LinkedIn",learning:"Learning",decision:"Decision",note:"Note",dayinsight:"Day insight"};
  function v3bank(){const out=[];
    Object.entries(state.notes||{}).forEach(([id,x])=>{if(x&&x.status!=="deleted"&&x.text)out.push({src:"note",id,kind:x.type||"note",text:String(x.text),at:x.created||Date.parse((x.date||"")+"T12:00")||0,date:x.date||iso(new Date(x.created||Date.now()))});});
    Object.entries(VOICE).forEach(([id,v])=>{if(v&&(v.text||v.audio))out.push({src:"voice",id,kind:v.kind||"note",text:String(v.text||"Voice note"),at:v.at||0,date:v.date||iso(new Date(v.at||Date.now())),audio:v.audio,secs:v.secs});});
    Object.keys(state.logs||{}).forEach(d=>{const r=(state.logs[d]||{}).reflection;if(r&&String(r).trim())out.push({src:"day",id:d,kind:"dayinsight",text:String(r),at:Date.parse(d+"T20:00")||0,date:d});});
    return out.sort((a,b)=>b.at-a.at);}
  const v3bankRow=x=>el("li",{},el("button",{type:"button",class:"v3-trow",onclick:()=>v3bankOpen(x)},el("span",{class:"v3-bt",text:x.text.length>110?x.text.slice(0,110)+"...":x.text}),el("span",{class:"v3-rtag"},el("span",{class:"cat-chip",text:V3K[x.kind]||x.kind}),el("span",{class:"hint",text:v3dl(x.date)}))));
  function v3bankOpen(x){if(x.src==="note"){v3cMode="all";v3cOpen=x.id;captureReview(false);return;}
    if(x.src==="day"){psOpen("Day insight",re=>{const ta=el("textarea",{class:"v3-in","aria-label":"Day insight",rows:"6"});ta.value=(state.logs[x.id]||{}).reflection||"";ta.onchange=()=>{setLogPatch(x.id,{reflection:ta.value.trim()||null});toast("Saved");};
        return [el("p",{class:"hint",text:v3dl(x.id)}),ta];});return;}
    psOpen(V3K[x.kind]||"Capture",re=>[el("p",{class:"hint",text:v3dl(x.date)+(x.at?" · "+t12(hhmm(x.at)):"")}),x.audio?el("audio",{controls:"",preload:"none",src:x.audio,class:"vn-a"}):null,el("p",{class:"vn-t",dir:"auto",text:x.text}),
      el("div",{class:"v3-row"},el("button",{type:"button",class:"btn ghost",onclick:()=>{psClose(true);sel=clampDate(x.date);render();setTimeout(()=>openPop("cap"),60);}},"Open that day in Capture"),
        el("button",{type:"button",class:"btn ghost danger",onclick:()=>v3confirm("Delete this capture?","Delete",()=>{delVoice(x.id);psClose(true);})},"Delete"))]);}
  let v3bkF="all",v3bkQ="";
  function v3bankSheet(){psOpen("Insights",re=>{const all=v3bank(),kinds=[...new Set(all.map(x=>x.kind))],q=v3bkQ.toLowerCase(),L=all.filter(x=>(v3bkF==="all"||x.kind===v3bkF)&&(!q||x.text.toLowerCase().includes(q)));
      const search=el("input",{type:"search",class:"v3-in",placeholder:"Search the bank","aria-label":"Search the bank",value:v3bkQ});search.oninput=()=>{v3bkQ=search.value;const p=search.selectionStart;re();setTimeout(()=>{const s=document.querySelector(".ps-sheet input[type=search]");if(s){s.focus();try{s.setSelectionRange(p,p);}catch(e){}}},0);};
      const byDay={};L.forEach(x=>{(byDay[x.date]=byDay[x.date]||[]).push(x);});
      return [el("div",{class:"v3-row"},el("button",{type:"button",class:"btn",onclick:()=>openPop("cap")},"Capture"),el("button",{type:"button",class:"btn ghost",onclick:()=>{v3cMode="due";v3cOpen=null;captureReview(false);}},"Review ("+brDue().length+")")),search,
        el("div",{class:"v3-cats"},...[["all","All ("+all.length+")"],...kinds.map(k=>[k,(V3K[k]||k)+" ("+all.filter(x=>x.kind===k).length+")"])].map(([k,n])=>el("button",{type:"button",class:"cat-chip"+(v3bkF===k?" on":""),"aria-pressed":String(v3bkF===k),onclick:()=>{v3bkF=k;re();}},n))),
        L.length?el("ul",{class:"v3-tlist v3-tall"},...Object.keys(byDay).sort().reverse().flatMap(d=>[el("li",{class:"v3-gh",text:v3dl(d)}),...byDay[d].map(v3bankRow)])):el("p",{class:"ps-sh-sum",text:"Nothing here."})];});}
  renderInsights=function(){const box=document.getElementById("ihBody");if(!box)return;const pg=box.closest(".page");if(pg&&pg.hidden)return;const pn=box.closest(".panel"),all=v3bank();
    const h=pn&&pn.querySelector("h2");if(h&&h.textContent!=="Insights")h.textContent="Insights";const hn=pn&&pn.querySelector(".panel-head .hint");if(hn)hn.textContent="Your Capture bank";
    rc(box,el("div",{class:"v3-row"},el("button",{type:"button",class:"btn",onclick:v3bankSheet},"Open bank ("+all.length+")"),el("button",{type:"button",class:"btn ghost",onclick:()=>openPop("cap")},"Capture")),
      all.length?el("ul",{class:"v3-tlist v3-tall"},...all.slice(0,4).map(v3bankRow)):el("p",{class:"hint",text:"Nothing captured yet. Use Capture on Today."}));};
  // the waterfall and Insights are always open: no folded cards to hunt for
  const v3unfold=()=>["wfH","ihH"].forEach(id=>{const sec=document.querySelector('section[aria-labelledby="'+id+'"]');if(!sec)return;sec.classList.remove("collapsed");const b=sec.querySelector(".collapse-btn");if(b)b.remove();});
  {const _ru=render;render=function(){_ru();try{v3unfold();}catch(e){}};}
  try{render();}catch(e){}
  // ---- day progress: one total and one yardstick (7h) in Today and in Time ----
  function v3worked(d){const it=entriesOn(d).filter(x=>!isEstimate(x)).concat(liveItems(d));return Math.max(0,unionMin(it)+hoursAdj(d)*60);}
  renderEntHero=function(items,total){const box=document.getElementById("entHero");if(!box)return;
    const adj=hoursAdj(sel)*60,worked=Math.max(0,total+adj),fri=isFriday(sel),plan=fri?0:v3dayMin();
    const real=items.filter(x=>x.kind!=="event"&&x.kind!=="break"),learnM=unionMin(real.filter(isLearning)),brkM=items.filter(x=>x.kind==="break").reduce((a,x)=>a+Number(x.minutes||0),0),live=items.some(x=>x.live),scale=Math.max(plan,worked,1);
    const seg=(cls,mm,t)=>mm>0?el("span",{class:"eh-seg "+cls,style:"width:"+(mm/scale*100)+"%",title:t+": "+dur(mm)}):null,workPart=Math.max(0,worked-learnM);
    const bar=el("div",{class:"eh-bar",role:"img","aria-label":dur(worked)+" worked"+(plan?" of "+dur(plan):"")},...[seg("work",workPart,"Work"),seg("learn",Math.min(learnM,worked),"Learning"),seg("brk",brkM,"Breaks")].filter(Boolean));
    const pct=plan?Math.round(worked/plan*100):null,stat=(cls,label,mm)=>el("span",{class:"eh-k"},el("i",{class:"eh-sw "+cls}),label+" ",el("b",{class:"num",text:dur(mm)}));
    rc(box,el("div",{class:"eh-top"},el("div",{class:"eh-big"},el("b",{class:"num",text:worked>=1?dur(worked):"0m"}),el("span",{class:"eh-lbl",text:"worked"+(sel===iso(new Date())?" today":" on "+fmt(sel,{weekday:"short",day:"numeric",month:"short"}))+(live?" · live":"")})),
        plan?el("div",{class:"eh-pct"},el("b",{class:"num",text:pct+"%"}),el("span",{class:"hint v3-edtarget",role:"button",tabindex:"0",title:"Change the day target",onclick:dayTargetSheet,onkeydown:e=>{if(e.key==="Enter")dayTargetSheet();},text:"of "+dur(plan)})):el("div",{class:"eh-pct"},el("span",{class:"hint",text:"Friday: rest day"}))),bar,
      el("div",{class:"eh-keys"},stat("work","Work",workPart),stat("learn","Learning",Math.min(learnM,worked)),brkM?stat("brk","Breaks",brkM):null,adj?el("span",{class:"hint",text:(adj>0?"+":"-")+dur(Math.abs(adj))+" adjusted by hand"}):null));};
  // ---- the day target (default 7 hours) is yours to set. Today and Time both read it, so they always match ----
  function v3dayMin(){const p=(state.settings&&state.settings.prefs)||{},mn=Number(p.dayMin);return mn>=50&&mn<=1200?mn:FULL_DAY;}
  function v3parseHours(t){t=String(t||"").trim().toLowerCase();let m;if((m=t.match(/^(\d+(?:[.,]\d+)?)\s*(?:p|pom|poms|pomodoro|pomodoros)$/)))return Math.round(parseFloat(m[1].replace(",","."))*50);if((m=t.match(/^(\d+(?:[.,]\d+)?)$/)))return Math.round(parseFloat(m[1].replace(",","."))*50);if((m=t.match(/^(\d{1,2}):(\d{2})$/)))return +m[1]*60+ +m[2];if((m=t.match(/^(\d+)\s*h(?:ours?|rs?)?\s*(?:(\d+)\s*m(?:in)?)?$/)))return +m[1]*60+(+m[2]||0);if((m=t.match(/^(\d+)\s*m(?:in(?:utes?)?)?$/)))return +m[1];if((m=t.match(/^(\d+(?:[.,]\d+)?)$/)))return Math.round(parseFloat(m[1].replace(",","."))*60);return 0;}
  function dayTargetSheet(){psOpen("Day target",re=>{const cur=v3dayMin(),inp=el("input",{type:"text",class:"v3-in tt-in","aria-label":"Pomodoros for a full day",placeholder:"8, or 6h, or 7:30",value:pomS(cur)});
    const save=mn=>{if(!(mn>=30&&mn<=1200)){toast("Type pomodoros like 8, or hours like 6h or 7:30");return;}const p={...((state.settings&&state.settings.prefs)||{}),dayMin:mn,at:Date.now()};state.settings={...(state.settings||{}),prefs:p};try{store.set("settings/prefs",p);}catch(e){}toast("Day target: "+pomS(mn)+" pomodoros");psClose(true);render();};
    inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();save(v3parseHours(inp.value));}});
    return [el("p",{class:"hint",text:"1 pomodoro is 50 minutes of focus. Type a number of pomodoros (8), or hours (6h or 7:30). Today and Time use the same number."}),el("label",{class:"field"},el("span",{class:"label",text:"Pomodoros"}),inp),
      el("div",{class:"v3-row"},el("button",{type:"button",class:"btn",onclick:()=>save(v3parseHours(inp.value))},"Save"),el("button",{type:"button",class:"btn ghost",onclick:()=>save(FULL_DAY)},"Back to "+pomS(FULL_DAY)+" pomodoros"))];});}

/* ===== 12 Nov: LinkedIn section (read only plan view). LIPLAN is the content of plan/linkedin.json ===== */
const LIPLAN={
 "calendar": [
  {
   "weekday": "Sat",
   "type": "Personal story",
   "pillar": 5,
   "format": "text",
   "notes": "Medicine to design, lessons, values. Ends with a soft invitation."
  },
  {
   "weekday": "Sun",
   "type": "Project lesson",
   "pillar": 1,
   "format": "text",
   "notes": "One lesson cut from the current portfolio project. Counts toward its 3 posts."
  },
  {
   "weekday": "Mon",
   "type": "Behind the scenes",
   "pillar": 3,
   "format": "text",
   "notes": "How you work, AI in a senior workflow. Taste stays human."
  },
  {
   "weekday": "Tue",
   "type": "Redesign breakdown",
   "pillar": 4,
   "format": "carousel",
   "notes": "5 to 8 slides: problem, before, after, your reasoning, one takeaway. Strongest format."
  },
  {
   "weekday": "Wed",
   "type": "Craft breakdown",
   "pillar": 2,
   "format": "text plus one slide image",
   "notes": "One typography, layout or data visualization decision and why it helps the audience say yes."
  },
  {
   "weekday": "Thu",
   "type": "Founder post",
   "pillar": 1,
   "format": "text or carousel",
   "notes": "Founder-facing: why structure and narrative close deals."
  },
  {
   "weekday": "Fri",
   "type": "Off",
   "pillar": null,
   "format": null,
   "notes": "Jumuah, family, rest, weekly review. No post, no comments."
  },
  {
   "date": "2026-11-14",
   "type": "Who you are",
   "pillar": 5,
   "format": "text",
   "notes": "Post 1, already drafted. Exception to the Sat slot only in content, not pillar."
  },
  {
   "date": "2026-11-15",
   "type": "Project lesson",
   "pillar": 1,
   "format": "text",
   "notes": "Post 2, HASM, already drafted."
  },
  {
   "date": "2026-11-16",
   "type": "Behind the scenes",
   "pillar": 3,
   "format": "text",
   "notes": "Post 3, story behind the HASM showcase."
  },
  {
   "date": "2026-11-17",
   "type": "Redesign breakdown",
   "pillar": 4,
   "format": "carousel",
   "notes": "Post 4, HASM carousel."
  },
  {
   "date": "2026-11-18",
   "type": "Craft breakdown",
   "pillar": 2,
   "format": "text plus image",
   "notes": "Post 5, HASM type or layout."
  },
  {
   "date": "2026-11-19",
   "type": "Founder post",
   "pillar": 1,
   "format": "text",
   "notes": "Post 6."
  },
  {
   "date": "2026-11-21",
   "type": "Personal story",
   "pillar": 5,
   "format": "text",
   "notes": "Post 7."
  },
  {
   "date": "2026-11-22",
   "type": "Project lesson",
   "pillar": 1,
   "format": "text",
   "notes": "Post 8, Javelin."
  },
  {
   "date": "2026-11-23",
   "type": "Behind the scenes",
   "pillar": 3,
   "format": "text",
   "notes": "Post 9."
  },
  {
   "date": "2026-11-24",
   "type": "Redesign breakdown",
   "pillar": 4,
   "format": "carousel",
   "notes": "Post 10, Javelin."
  },
  {
   "date": "2026-11-25",
   "type": "Craft breakdown",
   "pillar": 2,
   "format": "text plus image",
   "notes": "Post 11, Javelin type."
  }
 ],
 "pillars": [
  {
   "n": 1,
   "name": "The story behind winning decks",
   "what": "Why structure and narrative close deals",
   "examples": [
    "Why most pitch decks lose investors on slide 3",
    "One storyline lesson from a live project"
   ]
  },
  {
   "n": 2,
   "name": "Craft and taste",
   "what": "Typography, layout and data visualization breakdowns",
   "examples": [
    "One type decision and why it works",
    "One chart redesigned for a decision maker"
   ]
  },
  {
   "n": 3,
   "name": "Process and AI",
   "what": "How you work, behind the scenes, AI in a senior workflow",
   "examples": [
    "What AI drafts and what stays human",
    "Why 7 slides and what was cut"
   ]
  },
  {
   "n": 4,
   "name": "Before and after",
   "what": "Redesigns with the reasoning",
   "examples": [
    "HASM before and after carousel",
    "2 slides redesigned with the reason for each change"
   ]
  },
  {
   "n": 5,
   "name": "Your path",
   "what": "From medicine to design, lessons, values",
   "examples": [
    "Who you are and who you help",
    "What medicine taught you about high-stakes rooms"
   ]
  }
 ],
 "hooks": [
  {
   "rule": "One line that names a problem your client has",
   "example": "Why most pitch decks lose investors on slide 3"
  },
  {
   "rule": "Write the hook first, 10 minutes, before building the post"
  },
  {
   "rule": "Study 10 designers you admire: hooks, length, formats. Save their best hooks word for word"
  },
  {
   "rule": "From Made to Stick: hooks and headlines for every post (simple, unexpected, concrete)"
  }
 ],
 "recipe": [
  {
   "step": "Pick",
   "what": "One slide or decision from a project you are working on",
   "mins": 5
  },
  {
   "step": "Write the hook",
   "what": "One line naming a client problem",
   "mins": 10
  },
  {
   "step": "Build",
   "what": "5 to 8 slides: the problem, before, after, your reasoning, one takeaway",
   "mins": 40
  },
  {
   "step": "Caption",
   "what": "3 to 5 short lines plus a question. Claude drafts, you edit into your voice",
   "mins": 10
  },
  {
   "step": "Post and engage",
   "what": "Post in the morning Gulf time, reply to every comment, leave the day's comments",
   "mins": 20
  }
 ],
 "commentFormula": {
  "name": "Spot, Add, Ask",
  "steps": [
   "Spot: name the specific point in their post",
   "Add: one insight or example from your work",
   "Ask: one real question"
  ],
  "split": "Half with designers and creative directors, half on posts by founders, VCs and Gulf business leaders",
  "volume": [
   {
    "from": "2026-11-13",
    "perDay": 3
   },
   {
    "from": "2027-01-01",
    "perDay": 7
   }
  ],
  "note": "Engagement, not outreach: being visible where buyers already are."
 },
 "tiers": [
  {
   "tier": "A",
   "who": "Creative directors at UAE agencies and international presentation studios",
   "action": "Follow, bell on, comment"
  },
  {
   "tier": "C",
   "who": "Designers at your level",
   "action": "Follow, comment, learn hooks"
  },
  {
   "tier": "Buyers",
   "who": "Founders, VCs and Gulf business leaders",
   "action": "Follow, comment on half of daily comments"
  }
 ],
 "rules": [
  "Every post ends with a soft invitation, for example: Working on a pitch deck for your next round? My inbox is open.",
  "Done and posted beats perfect. The first 20 posts are practice.",
  "Post in the morning Gulf time, 8 to 10 AM, and reply to every comment.",
  "Keep a bank of 5 ready posts.",
  "Every portfolio project produces 3 posts.",
  "About 12 pieces per pillar in Milestone 1; 60 pieces by Gate 1.",
  "Carousels are the strongest format: a carousel is a short presentation saved as a PDF.",
  "If posting falls behind, fix posting before starting another portfolio project.",
  "Every learning item must also turn into LinkedIn content.",
  "Log every inquiry with its source so you know which content brings clients.",
  "From Milestone 2: shift from craft to proof (results, client stories), 12 per week."
 ]
};
(function(){
  const DN=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const pName=n=>{const p=LIPLAN.pillars.find(x=>x.n===n);return p?p.n+". "+p.name:"None";};
  let liTab="cal";
  let liOff=0;
  function weekDays(){const t=new Date();t.setHours(12,0,0,0);const sat=new Date(t);sat.setDate(t.getDate()-((t.getDay()+1)%7)+liOff*7);return Array.from({length:7},(_,i)=>{const d=new Date(sat);d.setDate(sat.getDate()+i);return d;});}
  function planFor(d){const di=typeof d==="string"?d:iso(d),wd=DN[parse(di).getDay()].slice(0,3);return LIPLAN.calendar.find(x=>x.date===di)||LIPLAN.calendar.find(x=>x.weekday===wd&&!x.date);}
  function calTab(re){const today=iso(new Date()),wk=weekDays();
    const nav=el("div",{class:"li4-wk"},el("button",{type:"button",class:"mini li4-prev","aria-label":"Previous week",onclick:()=>{liOff--;re();}},"\u2039"),
      el("span",{class:"li4-wl",text:fmt(iso(wk[0]),{day:"numeric",month:"short"})+" to "+fmt(iso(wk[6]),{day:"numeric",month:"short"})}),
      liOff?el("button",{type:"button",class:"mini",onclick:()=>{liOff=0;re();}},"This week"):null,
      el("button",{type:"button",class:"mini li4-next","aria-label":"Next week",onclick:()=>{liOff++;re();}},"\u203a"));
    const days=wk.map(d=>{const p=planFor(d)||{type:"Open day",pillar:null,format:null,notes:""};const di=iso(d),isT=di===today,np=postsOn(di).filter(([,x])=>x.body||x.hook||x.title).length;
      return el("button",{type:"button",class:"li4-day"+(isT?" today":"")+(p.pillar?"":" rest"),"data-date":di,"aria-current":isT?"date":null,onclick:()=>liDayOpen(di)},
        el("span",{class:"li4-dn",text:DN[d.getDay()].slice(0,3)+" "+d.getDate()}),
        el("strong",{class:"li4-ty",text:p.type}),
        p.pillar?el("span",{class:"hint",text:pName(p.pillar)}):null,
        p.format?el("span",{class:"hint",text:p.format}):null,
        np?el("span",{class:"li4-has",text:np+" post"+(np>1?"s":"")+" written"}):null,
        el("span",{class:"li4-note hint",text:p.notes}));});
    return el("div",{},nav,el("div",{class:"li4-grid"},...days));}
  const back=()=>setTimeout(()=>{if(!sheetStack.length)openLI();},260);
  function pilTab(re){return el("div",{class:"li4-grid"},...LIPLAN.pillars.map(p=>el("button",{type:"button",class:"li4-pil",onclick:()=>psOpen(p.n+". "+p.name,()=>pilDetail(p),{onClose:back})},
      el("span",{class:"li4-dn",text:"Pillar "+p.n}),el("strong",{class:"li4-ty",text:p.name}),el("span",{class:"hint",text:p.what}))),
      el("button",{type:"button",class:"li4-pil",onclick:()=>psOpen(LIPLAN.commentFormula.name,()=>comDetail(),{onClose:back})},el("span",{class:"li4-dn",text:"Comments"}),el("strong",{class:"li4-ty",text:LIPLAN.commentFormula.name}),el("span",{class:"hint",text:"How to comment"})));}
  const list=a=>el("ul",{class:"li4-list"},...a.map(x=>el("li",{text:x})));
  const sec=(t,n)=>el("div",{class:"li4-sec"},el("span",{class:"label",text:t}),n);
  function pilDetail(p){return [sec("What it is",el("p",{text:p.what})),sec("Examples",list(p.examples)),sec("Comment formula",el("p",{text:LIPLAN.commentFormula.name+". Tap Comments on the Pillars tab for the detail."}))];}
  function comDetail(){const c=LIPLAN.commentFormula;return [sec("Steps",list(c.steps)),sec("Who",el("p",{text:c.split})),
    sec("How many a day",list(c.volume.map(v=>v.perDay+" a day from "+fmt(v.from,{day:"numeric",month:"short",year:"numeric"})))),sec("Note",el("p",{text:c.note})),
    sec("Tiers",list(LIPLAN.tiers.map(t=>t.tier+": "+t.who+". "+t.action)))];}
  function guideTab(){return el("div",{},sec("Post recipe",list(LIPLAN.recipe.map(r=>r.step+" ("+r.mins+" min): "+r.what))),
    sec("Hooks",list(LIPLAN.hooks.map(h=>h.rule+(h.example?". Example: "+h.example:"")))),sec("Rules",list(LIPLAN.rules)));}
  const ST=[["idea","Idea"],["draft","Draft"],["scheduled","Scheduled"],["published","Live"]];
  const stKey=p=>p.status==="live"?"published":(p.status||"draft");
  const stName=p=>(ST.find(x=>x[0]===stKey(p))||ST[1])[1];
  function postsOn(d){return Object.entries(LIP).filter(([,p])=>p.date===d).sort((a,b)=>(a[1].at||0)-(b[1].at||0));}
  function postTab(){const ps=Object.entries(LIP).sort((a,b)=>(b[1].date||"").localeCompare(a[1].date||"")||(b[1].at||0)-(a[1].at||0));
    const head=el("button",{type:"button",class:"btn li4-new",onclick:()=>liDayOpen(iso(new Date()))},"Write today's post");
    if(!ps.length)return el("div",{},head,el("p",{class:"hint",text:"No posts yet."}));
    return el("div",{},head,el("ul",{class:"li4-posts"},...ps.map(([id,p])=>{const first=String(p.body||"").split("\n").find(x=>x.trim())||"";
      return el("li",{},el("button",{type:"button",class:"li4-post","data-post":id,onclick:()=>liDayOpen(p.date||iso(new Date()),id)},
        el("span",{class:"li4-pt"},el("b",{text:p.hook||p.title||"Untitled"}),first?el("span",{class:"hint li4-pl",text:first.slice(0,90)}):null),
        el("span",{class:"hint num",text:(p.date||"")}),el("span",{class:"li4-st","data-s":stKey(p),text:stName(p)})));})));}
  // ---- the day page: plan slot and the editor for the posts of that date ----
  const FMTS=["text","text plus image","carousel","document","video","poll"];
  const copyText=t=>{try{if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t).catch(()=>fb(t));}catch(e){}return fb(t);};
  function fb(t){const a=document.createElement("textarea");a.value=t;a.style.position="fixed";a.style.opacity="0";document.body.append(a);a.select();try{document.execCommand("copy");}catch(e){}a.remove();return Promise.resolve();}
  let liDate=null,liFocus=null;const liPend=new Map(),liNew={};
  function flushAll(){liPend.forEach(f=>f());}
  function savePost(id,vals,quiet){const cur=LIP[id]||{};const doc={...cur,...vals,title:vals.hook||cur.title||"",at:cur.at||Date.now(),upd:Date.now()};LIP[id]=doc;try{store.set("liposts/"+id,doc);}catch(e){}if(!quiet)toast("Saved");}
  function postCard(id,date,plan,re){const cur=LIP[id]||{};const hasPlan=plan&&plan.pillar;
    const hook=el("input",{type:"text",class:"v3-in li4-hook","aria-label":"Hook line",placeholder:"Hook line: one line that names a problem your client has",value:cur.hook||cur.title||""});
    const body=el("textarea",{class:"v3-in li4-body","aria-label":"Post body",rows:"14",placeholder:"Write the post"});body.value=cur.body||"";
    const cnt=el("span",{class:"hint num li4-cnt","aria-live":"polite"});
    const fill=el("i",{class:"li4-fill"}),meter=el("div",{class:"li4-meter","aria-hidden":"true"},fill,el("b",{class:"li4-mk",style:"left:7%",title:"feed cut-off"}),el("b",{class:"li4-mk",style:"left:50%",title:"sweet spot ends"}));
    const mlab=el("div",{class:"li4-mlab hint"},el("span",{text:"210 feed cut-off"}),el("span",{text:"1500 sweet spot ends"}));
    const meterBox=el("div",{class:"li4-mbox"},cnt,meter,mlab);
    const fmtV=cur.format||(plan&&plan.format)||"text",fo=FMTS.includes(fmtV)?FMTS:FMTS.concat([fmtV]);
    const fs=el("select",{class:"v3-in","aria-label":"Format"},...fo.map(f=>{const o=el("option",{value:f,text:f});if(f===fmtV)o.selected=true;return o;}));
    const pv=cur.pillar!==undefined?cur.pillar:(hasPlan?plan.pillar:null);
    const ps=el("select",{class:"v3-in","aria-label":"Pillar"},...[null,...LIPLAN.pillars.map(x=>x.n)].map(n=>{const o=el("option",{value:n==null?"":String(n),text:n==null?"None":pName(n)});if((pv==null&&n==null)||pv===n)o.selected=true;return o;}));
    const sv=stKey(cur),ss=el("select",{class:"v3-in","aria-label":"Status"},...ST.map(([k,n])=>{const o=el("option",{value:k,text:n});if(k===sv)o.selected=true;return o;}));
    const notes=el("textarea",{class:"v3-in","aria-label":"Notes",rows:"2",placeholder:"Notes (optional)"});notes.value=cur.notes||"";
    const vals=()=>({date,hook:hook.value.trim(),body:body.value,format:fs.value,pillar:ps.value===""?null:Number(ps.value),status:ss.value,notes:notes.value.trim()});
    const upd=()=>{const n=body.value.length;cnt.textContent=n+" / 3000";const z=n>3000?"red":n>1500?"amber":n>=210?"green":"calm";meterBox.dataset.zone=z;fill.style.width=Math.min(100,n/30)+"%";cnt.classList.toggle("over",n>3000);if(typeof save!=="undefined"){save.disabled=n>3000;save.title=n>3000?"Over 3000 characters":"";}};
    let t=null;const flush=()=>{clearTimeout(t);t=null;liPend.delete(id);if(body.value.length>3000){toast("Over 3000 characters, not saved");return;}const v=vals();if(!LIP[id]&&!v.hook&&!v.body&&!v.notes)return;savePost(id,v,true);delete liNew[date];};
    const sched=()=>{upd();clearTimeout(t);t=setTimeout(flush,700);liPend.set(id,flush);};
    [hook,body,notes].forEach(x=>x.addEventListener("input",sched));[fs,ps,ss].forEach(x=>x.addEventListener("change",()=>{flush();}));
    const copy=el("button",{type:"button",class:"btn ghost li4-copy",onclick:()=>{copyText((hook.value.trim()+"\n\n"+body.value).trim()).then(()=>toast("Post copied"));}},"Copy post");
    const save=el("button",{type:"button",class:"btn li4-save",onclick:()=>{if(body.value.length>3000){flush();return;}flush();if(!LIP[id]){toast("Nothing to save yet");return;}toast("Saved");}},"Save");upd();
    const del=LIP[id]?el("button",{type:"button",class:"btn ghost danger",onclick:()=>v3confirm("Delete this post?","Delete",()=>{liPend.delete(id);delete LIP[id];try{store.del("liposts/"+id);}catch(e){}re();})},"Delete"):null;
    if(liFocus===id){setTimeout(()=>{try{body.scrollIntoView({block:"nearest"});}catch(e){}},50);}
    return el("section",{class:"li4-ed","data-post":id},el("label",{class:"field"},el("span",{class:"label",text:"Hook"}),hook),
      el("label",{class:"field"},el("span",{class:"label",text:"Post"}),body,meterBox),
      el("div",{class:"v3-row"},el("label",{class:"field"},el("span",{class:"label",text:"Format"}),fs),el("label",{class:"field"},el("span",{class:"label",text:"Pillar"}),ps),el("label",{class:"field"},el("span",{class:"label",text:"Status"}),ss)),
      el("label",{class:"field"},el("span",{class:"label",text:"Notes"}),notes),el("div",{class:"v3-row"},save,copy,del));}
  function liDayBody(re){const d=liDate,plan=planFor(d),wd=DN[parse(d).getDay()];
    const nav=el("div",{class:"li4-dnav"},el("button",{type:"button",class:"mini li4-dprev","aria-label":"Previous day",onclick:()=>{flushAll();liDate=addDays(d,-1);liFocus=null;re();hd();}},"\u2039 "+fmt(addDays(d,-1),{day:"numeric",month:"short"})),
      el("strong",{class:"li4-dt",text:wd+" "+fmt(d,{day:"numeric",month:"long",year:"numeric"})}),
      el("button",{type:"button",class:"mini li4-dnext","aria-label":"Next day",onclick:()=>{flushAll();liDate=addDays(d,1);liFocus=null;re();hd();}},fmt(addDays(d,1),{day:"numeric",month:"short"})+" \u203a"));
    const slot=plan?el("div",{class:"li4-slot"},el("span",{class:"label",text:wd+" slot"}),el("strong",{class:"li4-ty",text:plan.type}),
      plan.pillar?el("span",{class:"hint",text:"Pillar: "+pName(plan.pillar)}):el("span",{class:"hint",text:"Rest day: no post planned"}),plan.format?el("span",{class:"hint",text:"Format: "+plan.format}):null,
      plan.notes?el("span",{class:"hint",text:plan.notes}):null,el("span",{class:"hint li4-hf",text:"Hook formula: "+LIPLAN.hooks[0].rule+". Example: "+LIPLAN.hooks[0].example})):null;
    let ids=postsOn(d).map(([id])=>id);if(!ids.length){if(!liNew[d])liNew[d]="p"+Date.now().toString(36)+"a";ids=[liNew[d]];}
    const extra=liNew["+"+d];if(extra&&!ids.includes(extra))ids.push(extra);
    return [nav,slot,...ids.map(id=>postCard(id,d,plan,re)),el("button",{type:"button",class:"btn ghost li4-add2",onclick:()=>{flushAll();const cur=postsOn(d).map(([i])=>i);if(!cur.length&&liNew[d]){toast("Write the first post before adding another");return;}liNew["+"+d]="p"+Date.now().toString(36)+"b";re();}},"Add another post")];}
  function hd(){const h=document.querySelector(".ps-sheet h2");if(h)h.textContent=fmt(liDate,{weekday:"long",day:"numeric",month:"short"});}
  function liDayOpen(d,focus,solo){liDate=d;liFocus=focus||null;liNew["+"+d]=null;psOpen(fmt(d,{weekday:"long",day:"numeric",month:"short"}),re=>liDayBody(re),{onClose:()=>{flushAll();if(!solo)back();}});}
  function openLI(){psOpen("LinkedIn",re=>{const T=[["cal","Calendar"],["pil","Pillars"],["guide","Guide"],["posts","Posts"]];
    return [el("div",{class:"seg li4-tabs",role:"tablist"},...T.map(([k,n])=>el("button",{type:"button",role:"tab","aria-pressed":String(liTab===k),onclick:()=>{liTab=k;re();}},n))),
      liTab==="cal"?calTab(re):liTab==="pil"?pilTab(re):liTab==="guide"?guideTab():postTab()];});}
  const _rp=renderPopCards;renderPopCards=function(){_rp();const row=document.getElementById("popCards");if(!row)return;
    let c=document.getElementById("liCard");if(!c){c=el("button",{type:"button",id:"liCard",class:"pop-card"},el("span",{class:"fc-ic"},xico("fpen")),el("span",{class:"fc-t",text:"LinkedIn"}));c.onclick=openLI;}
    if(c.parentElement!==row)row.append(c);};
  try{renderPopCards();}catch(e){}
  window.__liOpen=openLI;window.__liDay=d=>liDayOpen(d,null,true);window.__liDayFull=liDayOpen;
})();

/* ===== 12 Nov replan: leaf counting, parent cards, pomodoros, estimates ===== */
let _pidC=null;
function parentIds(){if(!_pidC){const s=new Set();for(const t of Object.values(state.tasks||{}))if(t&&t.parent&&!t.cut&&!t.archived)s.add(t.parent);_pidC=s;Promise.resolve().then(()=>{_pidC=null;});}return _pidC;}
function isLeaf(t){return !!t&&!parentIds().has(t.id);}
function isParentId(id){return parentIds().has(id);}
function leafTasks(){return Object.entries(state.tasks||{}).map(([id,t])=>({id,...t})).filter(isLeaf);}
function kidsOf(id){return Object.entries(state.tasks||{}).map(([i,t])=>({id:i,...t})).filter(t=>t.parent===id&&!t.cut&&!t.archived).sort((a,b)=>(a.date||"").localeCompare(b.date||"")||(a.order||0)-(b.order||0));}
// estimates: "about 1 h", "about 1.5 h", "about 30 min"
function aboutH(m){m=Math.round(Number(m)||0);if(m<=0)return "";if(m<45)return "about "+m+" min";const h=Math.round(m/30)/2;return "about "+String(h)+" h";}
function pomN(m){return Math.round(m/50*10)/10;}
function pomS(m){return String(pomN(m));}
function planMins(d){return tasksOn(d).reduce((a,t)=>a+estMin(t),0);}
// ---- the day number: "3 of 8 pomodoros" with the minutes small, and the planned load ----
function v3dayNum(nm,wk,tg,d){nm.textContent="";nm.append(document.createTextNode("Work "+pomS(wk)+" of "+pomS(tg)+" pomodoros"+(wk>=tg?" · full day":"")+" "),el("small",{class:"v3-pmin",text:dur(wk)}));
  const f=nm.closest(".dbar-focus");if(!f)return;let pl=f.querySelector(".v3-planned");const pm=planMins(d);
  if(!pl){pl=el("span",{class:"hint v3-planned"});f.append(pl);}pl.hidden=!pm;pl.textContent=pm?"planned "+pomS(pm)+" of "+pomS(tg):"";}
// ---- Time hero in pomodoros ----
renderEntHero=function(items,total){const box=document.getElementById("entHero");if(!box)return;
  const adj=hoursAdj(sel)*60,worked=Math.max(0,total+adj),fri=isFriday(sel),plan=fri?0:v3dayMin();
  const real=items.filter(x=>x.kind!=="event"&&x.kind!=="break"),learnM=unionMin(real.filter(isLearning)),workM=Math.min(unionMin(real.filter(isWorkEntry)),worked),brkM=items.filter(x=>x.kind==="break").reduce((a,x)=>a+Number(x.minutes||0),0),live=items.some(x=>x.live),scale=Math.max(plan,worked,1);
  const othM=Math.max(0,worked-workM-Math.min(learnM,worked));
  const seg=(cls,mm,t)=>mm>0?el("span",{class:"eh-seg "+cls,style:"width:"+(mm/scale*100)+"%",title:t+": "+dur(mm)}):null;
  const bar=el("div",{class:"eh-bar",role:"img","aria-label":pomS(worked)+" pomodoros, work "+pomS(workM)+(plan?" of "+pomS(plan):"")},...[seg("work",workM,"Work"),seg("learn",Math.min(learnM,worked),"Learning"),seg("oth",othM,"Other"),seg("brk",brkM,"Breaks")].filter(Boolean));
  const pct=plan?Math.round(workM/plan*100):null,stat=(cls,label,mm)=>el("span",{class:"eh-k"},el("i",{class:"eh-sw "+cls}),label+" ",el("b",{class:"num",text:dur(mm)}));
  rc(box,el("div",{class:"eh-top"},el("div",{class:"eh-big"},el("b",{class:"num",text:pomS(worked)}),el("span",{class:"eh-lbl",text:"pomodoros in total"+(sel===iso(new Date())?" today":" on "+fmt(sel,{weekday:"short",day:"numeric",month:"short"}))+(live?" · live":"")}),el("small",{class:"hint v3-pmin",text:dur(worked)})),
      plan?el("div",{class:"eh-pct"},el("b",{class:"num",text:pct+"%"}),el("span",{class:"hint v3-edtarget",role:"button",tabindex:"0",title:"Change the day target",onclick:dayTargetSheet,onkeydown:e=>{if(e.key==="Enter")dayTargetSheet();},text:"Work "+pomS(workM)+" of "+pomS(plan)+" pomodoros"})):el("div",{class:"eh-pct"},el("span",{class:"hint",text:"Friday: rest day"}))),bar,
    el("div",{class:"eh-keys"},stat("work","Work",workM),stat("learn","Learning",Math.min(learnM,worked)),othM?stat("oth","Other",othM):null,brkM?stat("brk","Breaks",brkM):null,adj?el("span",{class:"hint",text:(adj>0?"+":"-")+dur(Math.abs(adj))+" adjusted by hand"}):null));};
// ---- parent cards: Today shows a parent with the steps dated today, never a step on its own ----
function slotRank(cat){return cat==="portfolio"||cat==="client"?0:cat==="learning"?1:cat==="linkedin"?2:3;}
// work = portfolio or client only
function isWorkEntry(x){if(!x||x.kind==="event"||x.kind==="break")return false;let c=x.cat;if(!c&&typeof x.ref==="string"&&x.ref.startsWith("tasks:")){const t=state.tasks[x.ref.slice(6)];c=t&&t.cat;}return c==="portfolio"||c==="client";}
function v3workMin(d){const it=entriesOn(d).filter(x=>!isEstimate(x)).concat(liveItems(d)).filter(isWorkEntry);return Math.max(0,unionMin(it));}
function cardsOn(d){const groups=new Map();
  tasksOn(d).forEach(l=>{const p=l.parent&&state.tasks[l.parent]&&!state.tasks[l.parent].cut&&!state.tasks[l.parent].archived?l.parent:null,key=p||l.id;
    if(!groups.has(key))groups.set(key,{key,p,steps:[]});groups.get(key).steps.push(l);});
  return [...groups.values()].map(g=>{if(!g.p)return {...g.steps[0],rank:slotRank(g.steps[0].cat)};
    const P=state.tasks[g.p],steps=g.steps.sort((a,b)=>(a.order||0)-(b.order||0));
    return {...P,id:g.p,steps,_card:true,date:d,cat:P.cat||steps[0].cat,mins:steps.reduce((a,s)=>a+estMin(s),0),done:steps.every(s=>s.done),order:Math.min(...steps.map(s=>s.order||0)),rank:slotRank(P.cat||steps[0].cat)};});}
sortedTasks=function(){return cardsOn(sel).sort((a,b)=>{const pa=a.pos!=null,pb=b.pos!=null;if(pa&&pb)return a.pos-b.pos;if(pa!==pb)return pa?-1:1;return (a.rank-b.rank)||((a.order||0)-(b.order||0));});};
// a parent card done or moved means: the steps of the shown day
{const _sd=setDone,_mv=moveTaskTo,sync=pid=>{const P=state.tasks[pid];if(!P)return;const ks=kidsOf(pid),all=ks.length&&ks.every(k=>k.done);if(!!P.done!==!!all){state.tasks[pid]={...P,done:!!all,doneAt:all?sel:null};try{setTask(pid,{done:!!all,doneAt:all?sel:null});}catch(e){}}};
  setDone=function(id,on){const t=state.tasks[id];if(!t)return;if(isParentId(id)){on=!!on;kidsOf(id).filter(k=>k.date===sel&&!!k.done!==on).forEach(k=>_sd(k.id,on));sync(id);render();return;}
    _sd(id,on);if(t.parent)sync(t.parent);};
  moveTaskTo=function(id,d){const t=state.tasks[id];if(!t)return;if(isParentId(id)){const ks=kidsOf(id).filter(k=>k.date===sel&&!k.done);if(!ks.length){toast("Nothing to move");return;}ks.forEach(k=>_mv(k.id,d));return;}_mv(id,d);};}
// Start: War with the parent's steps (today's open steps, else all open steps)
function cardSteps(id){const ks=kidsOf(id).filter(k=>!k.done),td=ks.filter(k=>k.date===sel);return td.length?td:ks;}
{const _wp=warPool;warPool=function(tg){if(tg&&tg.k==="task"&&isParentId(tg.v)){return cardSteps(tg.v);}return _wp(tg);};}
v3start=function(id){if(isParentId(id)){const ids=cardSteps(id).map(x=>x.id);if(!ids.length){toast("Nothing left in this card");return;}
    const w=warGet();if(w){w.ids=ids.concat(w.ids.filter(x=>!ids.includes(x)));warPut(w);warOpen();toast("Added to the war on "+w.label);return;}warSetup({task:id});return;}
  if(warGet()){const w=warGet();if(!w.ids.includes(id)){w.ids.unshift(id);warPut(w);}else{w.ids=[id].concat(w.ids.filter(x=>x!==id));warPut(w);}warOpen();toast("Added to the war on "+w.label);return;}warSetup({task:id});};
// the card itself: header with estimate, steps as tick boxes
{const _vc=v3card;v3card=function(t,top,ctx){const c=_vc(t,top,ctx);try{const head=c.querySelector(".cs-head");if(!head)return c;
    if(t.cat==="linkedin"&&window.__liDay){const h=c.querySelector(".cs-t");if(h&&!h.dataset.li){h.dataset.li="1";h.classList.add("li-open");h.setAttribute("role","button");h.addEventListener("pointerdown",e=>e.stopPropagation());h.addEventListener("click",e=>{e.stopPropagation();window.__liDay(sel);});}}
    const est=aboutH(t._card?t.mins:(Number(t.mins)>0?t.mins:estMin(t)));if(est)head.insertBefore(el("span",{class:"hint cs-est",text:est}),head.querySelector(".cl-det"));
    if(t.steps){const showD=cutDesc===t.id;const ul=el("ul",{class:"cs-steps"},...t.steps.map(s=>{const cb=el("input",{type:"checkbox","aria-label":"Done: "+s.title});cb.checked=!!s.done;cb.onchange=()=>{setDone(s.id,cb.checked);};
        cb.addEventListener("pointerdown",e=>e.stopPropagation());
        const li=(()=>{const tt=el("span",{class:"cs-step-t",text:s.title});if(s.cat==="linkedin"&&window.__liDay){tt.classList.add("li-open");tt.setAttribute("role","button");tt.title="Open today's LinkedIn post";tt.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();window.__liDay(sel);});}
        const l=el("li",{class:"cs-step"+(s.done?" done":"")},el("label",{class:"cs-step-l"},cb,tt,el("span",{class:"hint cs-est",text:aboutH(estMin(s))})),showD&&(s.note||s.desc)?el("p",{class:"cl-d",text:String(s.note||s.desc)}):null);if(!s.done)v3stepSwipe(l,s);return l;})();return li;}));
      head.after(ul);}
  }catch(e){console.warn(e);}return c;};}


  // =====================================================================
  // Calendar (module6): the Review waterfall slot becomes a calendar. The old waterfall is the Timeline view.
  // Weeks start on Saturday. Items without a start time are drawn where the day's template puts them ("suggested").
  // =====================================================================
  const CAL_VIEWS=[["day","Day"],["3day","3 days"],["work","Work week"],["week","Week"],["month","Month"],["timeline","Timeline"]];
  const CAL_T0=270,CAL_T1=23*60,CAL_CAP=8,CAL_MON=["January","February","March","April","May","June","July","August","September","October","November","December"];
  let calView=null,calAnchor=null,calScroll=null,calMiniM=null,calMiniOpen=false,calArch=false,calClock=null;
  const calPH=()=>innerWidth<700?56:48;
  const calMinsOf=hm=>{const [h,m]=String(hm).split(":").map(Number);return h*60+(m||0);};
  const calHM=m=>{m=Math.max(0,Math.round(m));return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");};
  const calSnap=(m,k)=>Math.round(m/k)*k;
  function calDefView(){let v=null;try{v=localStorage.getItem("cal-view");}catch(e){}if(v&&CAL_VIEWS.some(x=>x[0]===v))return v;return innerWidth<700?"day":(innerWidth>=600&&innerWidth>innerHeight&&innerWidth<700?"3day":"week");}
  function calSetView(v){calView=v;try{localStorage.setItem("cal-view",v);}catch(e){}calScroll=null;render();}
  function calMonthAdd(s,n){const d=parse(s);d.setDate(1);d.setMonth(d.getMonth()+n);return iso(d);}
  // ---- pure helpers ----
  function calRange(view,anchor){const days=[],n=(s,k)=>{for(let i=0;i<k;i++)days.push(addDays(s,i));};
    if(view==="day")n(anchor,1);else if(view==="3day")n(anchor,3);else if(view==="week")n(weekStart(anchor),7);else if(view==="work")n(weekStart(anchor),6);
    else if(view==="month")n(weekStart(anchor.slice(0,8)+"01"),42);
    else{const sp=sprintFor(anchor);for(let d=sp.start;d<=sp.end;d=addDays(d,1))days.push(d);}
    return {view,days,from:days[0],to:days[days.length-1]};}
  function calTitle(r,anchor){const sm=d=>parse(d).toLocaleDateString("en-US",{month:"short"}),dn=d=>parse(d).getDate(),y=d=>parse(d).getFullYear();
    if(r.view==="month"){const d=parse(anchor);return CAL_MON[d.getMonth()]+" "+d.getFullYear();}
    if(r.view==="timeline")return "Sprint "+sprintFor(anchor).n;
    if(r.days.length===1)return parse(r.from).toLocaleDateString("en-US",{weekday:"short"})+", "+sm(r.from)+" "+dn(r.from)+", "+y(r.from);
    const a=r.from,b=r.to;if(sm(a)===sm(b)&&y(a)===y(b))return sm(a)+" "+dn(a)+" to "+dn(b)+", "+y(a);
    if(y(a)===y(b))return sm(a)+" "+dn(a)+" to "+sm(b)+" "+dn(b)+", "+y(a);return sm(a)+" "+dn(a)+", "+y(a)+" to "+sm(b)+" "+dn(b)+", "+y(b);}
  function calOcc(ev,from,to){const r=ev.rrule,out=[],ex=new Set(ev.exdates||[]),ov=ev.overrides||{};
    const push=d=>{if(ex.has(d))return;const o=ov[d]||{},ed=o.date||d;if(ed<from||ed>to)return;
      out.push({key:(ev.id||"")+"@"+d,orig:d,date:ed,ev,title:o.title!==undefined?o.title:ev.title,start:o.start!==undefined?o.start:ev.start,mins:o.mins||ev.mins,location:o.location!==undefined?o.location:ev.location,notes:o.notes!==undefined?o.notes:ev.notes,rep:!!r});};
    if(!ev.date)return out;if(!r){push(ev.date);return out;}
    const until=r.until||null,cnt=r.count||0,iv=Math.max(1,r.interval||1),dow0=parse(ev.date).getDay();let n=0;
    const take=d=>{if(d<ev.date)return true;if(until&&d>until)return false;n++;if(cnt&&n>cnt)return false;push(d);return true;};
    if(r.freq==="daily"){for(let d=ev.date,i=0;i<800&&d<=to;i++,d=addDays(d,iv))if(!take(d))break;}
    else if(r.freq==="weekly"){const by=(r.byDay&&r.byDay.length?r.byDay:[dow0]).slice().sort((a,b)=>((a+1)%7)-((b+1)%7)),ws=weekStart(ev.date);
      outer:for(let k=0;k<500;k++){const wk=addDays(ws,7*iv*k);if(wk>to)break;for(const w of by){if(!take(addDays(wk,(w+1)%7)))break outer;}}}
    else if(r.freq==="monthly"){const dn=parse(ev.date).getDate(),y0=parse(ev.date).getFullYear(),m0=parse(ev.date).getMonth();
      for(let k=0;k<500;k++){const first=new Date(y0,m0+iv*k,1);if(iso(first)>to)break;const y=first.getFullYear(),m=first.getMonth(),dim=new Date(y,m+1,0).getDate();let day;
        if(r.monthMode==="nth"){const nth=Math.ceil(dn/7),f=first.getDay();day=1+((dow0-f+7)%7)+7*(nth-1);if(day>dim)day-=7;}else{if(dn>dim)continue;day=dn;}
        if(!take(iso(new Date(y,m,day))))break;}}
    else push(ev.date);
    return out;}
  // words -> {title,mins,date,start,cat,location,parent}
  function calParse(text,today){today=today||iso(new Date());let s=" "+String(text||"").trim()+" ",o={title:"",mins:null,date:null,start:null,cat:null,location:null,parent:null};
    const cut=(re,fn)=>{const m=re.exec(s);if(m){fn(m);s=s.replace(m[0]," ");}};
    cut(/\s@(\S+)/,m=>{o.location=m[1];});cut(/\s#(\w+)/,m=>{const k=m[1].toLowerCase();o.cat=Object.keys(CAT_NAME).find(c=>c===k||CAT_NAME[c].toLowerCase().replace(/\s/g,"")===k)||null;});
    cut(/\s(\d+(?:\.\d+)?)\s*h(?:ours?|rs?)?(?=\s)/i,m=>{o.mins=Math.round(+m[1]*60);});cut(/\s(\d+)\s*m(?:ins?)?(?=\s)/i,m=>{o.mins=+m[1];});cut(/\s(\d+)\s*p(?=\s)/i,m=>{o.mins=+m[1]*50;});
    cut(/\s(\d{1,2})(?::(\d{2}))?\s*(am|pm)(?=\s)/i,m=>{let h=+m[1]%12;if(/pm/i.test(m[3]))h+=12;o.start=calHM(h*60+(+m[2]||0));});
    if(!o.start)cut(/\s(\d{1,2}):(\d{2})(?=\s)/,m=>{o.start=calHM(+m[1]*60+ +m[2]);});
    const WD=["sun","mon","tue","wed","thu","fri","sat"],MN=CAL_MON.map(x=>x.slice(0,3).toLowerCase());
    cut(/\s(today|tomorrow|tmr|tmrw)(?=\s)/i,m=>{o.date=/^to[d]/i.test(m[1])?today:addDays(today,1);});
    if(!o.date)cut(/\s(sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:rs|rsday)?|fri(?:day)?|sat(?:urday)?)(?=\s)/i,m=>{const w=WD.indexOf(m[1].toLowerCase());let d=addDays(today,1);while(parse(d).getDay()!==w)d=addDays(d,1);o.date=d;});
    if(!o.date)cut(/\s(\d{1,2})\s+([a-z]{3})[a-z]*(?=\s)/i,m=>{const mi=MN.indexOf(m[2].toLowerCase());if(mi<0){s+=m[0];return;}o.date=parse(today).getFullYear()+"-"+String(mi+1).padStart(2,"0")+"-"+String(+m[1]).padStart(2,"0");});
    if(!o.date)cut(/\s([a-z]{3})[a-z]*\s+(\d{1,2})(?=\s)/i,m=>{const mi=MN.indexOf(m[1].toLowerCase());if(mi<0){s+=m[0];return;}o.date=parse(today).getFullYear()+"-"+String(mi+1).padStart(2,"0")+"-"+String(+m[2]).padStart(2,"0");});
    o.title=s.replace(/\s+/g," ").trim();
    const low=o.title.toLowerCase(),pids=parentIds();let best=null;
    if(low.length>=3)for(const id of pids){const t=state.tasks[id];if(!t||t.cut||t.archived||t.done)continue;const pt=String(t.title||"").toLowerCase(),w=low.split(" ")[0];if(w.length>=3&&pt.startsWith(w)){best=id;break;}}
    if(best){o.parent=best;if(!o.cat)o.cat=state.tasks[best].cat||null;}
    return o;}
  // everything visible in [from,to]: per day items (timed, untimed, suggested) and all-day bars
  function calIndex(from,to,opt){opt=opt||{};const days=new Map(),bars=[],get=d=>{let x=days.get(d);if(!x){x={items:[],cap:0,plan:0};days.set(d,x);}return x;};
    const pids=parentIds(),kids={};
    for(const [id,t] of Object.entries(state.tasks||{})){if(!t||!t.parent||t.cut||t.archived||!t.date)continue;const k=kids[t.parent]||(kids[t.parent]={a:t.date,b:t.date,n:0,d:0});if(t.date<k.a)k.a=t.date;if(t.date>k.b)k.b=t.date;k.n++;if(t.done)k.d++;}
    for(const [id,t] of Object.entries(state.tasks||{})){if(!t||!t.date||t.cut)continue;const arch=!!t.archived;if(arch&&!opt.archived)continue;
      if(pids.has(id)){const k=kids[id];if(!k)continue;if(k.b<from||k.a>to)continue;bars.push({kind:"parent",id,t,title:t.title,cat:t.cat,a:k.a,b:k.b,done:k.d,total:k.n,arch});continue;}
      const span=Math.max(1,t.days||1),e=addDays(t.date,span-1);if(e<from||t.date>to)continue;
      if(t.allDay||span>1){bars.push({kind:"task",id,t,title:t.title,cat:t.cat,a:t.date,b:e,isDone:!!t.done,arch});continue;}
      const x=get(t.date);x.items.push({kind:"task",id,t,title:t.title,cat:t.cat,date:t.date,start:t.start||null,mins:Number(t.mins)>0?Number(t.mins):50,done:!!t.done,arch});
      if(!t.done&&!arch)x.cap+=(Number(t.mins)||0)/50;}
    for(const [id,ev] of Object.entries(state.events||{})){if(!ev)continue;for(const o of calOcc({...ev,id},from,to)){
      if(ev.allDay||!o.start||(ev.days||1)>1){bars.push({kind:"event",id,occ:o,title:o.title,cat:ev.cat,a:o.date,b:addDays(o.date,Math.max(1,ev.days||1)-1),ek:ev.kind});}
      else get(o.date).items.push({kind:"event",id,occ:o,title:o.title,cat:ev.cat,date:o.date,start:o.start,mins:Number(o.mins)>0?Number(o.mins):50,ek:ev.kind,rep:o.rep,loc:o.location});}}
    return {days,bars,get};}
  // suggested placement: where the day template would put leaf tasks that have no start
  function calSugg(d,list){const un=new Map(list.filter(x=>x.kind==="task"&&!x.start).map(x=>[x.id,x]));if(!un.size)return;
    let bl=[];try{bl=dayBlocksFor(d)||[];}catch(e){bl=[];}let last=calMinsOf("09:00");
    for(const b of bl){let cur=calMinsOf(b.from);for(const t of (b.tasks||[])){const x=un.get(t.id);if(!x)continue;un.delete(t.id);x.start=calHM(cur);x.sugg=true;cur+=x.mins;last=cur;}}
    for(const x of un.values()){x.start=calHM(last);x.sugg=true;last+=x.mins;}}
  function calPack(list){list.sort((a,b)=>a.s-b.s||b.e-a.e);let cols=[],cl=[];
    const done=()=>{cl.forEach(x=>{x.n=cols.length;});cols=[];cl=[];};
    for(const x of list){if(cl.length&&x.s>=Math.max(...cols))done();let c=cols.findIndex(e=>e<=x.s);if(c<0){c=cols.length;cols.push(0);}cols[c]=x.e;x.col=c;cl.push(x);}done();
    list.forEach(x=>{x.over=x.col>0&&x.n>1;});return list;}
  // Today order: items with a start first (ascending), then the old order
  {const _to=tasksOn;tasksOn=function(s){const L=_to(s);if(!L.some(t=>t.start))return L;return L.slice().sort((a,b)=>a.start&&b.start?a.start.localeCompare(b.start):a.start?-1:b.start?1:0);};}
  // ---- the view ----
  function calNav(dir){const v=calView;if(v==="timeline")return;
    if(v==="month")calAnchor=calMonthAdd(calAnchor,dir);else calAnchor=addDays(calAnchor,dir*(v==="day"?1:v==="3day"?3:7));calMiniM=null;calScroll=calScroll;render();}
  const calDayLab=d=>parse(d).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
  function calToolbar(r){const wide=innerWidth>=1000;
    const sw=el("div",{class:"seg cal-views",role:"group","aria-label":"Calendar view"},...CAL_VIEWS.map(([k,n])=>el("button",{type:"button","data-v":k,"aria-pressed":String(calView===k),text:n,onclick:()=>calSetView(k)})));
    const tl=calView==="timeline";
    return el("div",{class:"cal-tools"},
      tl?null:el("div",{class:"cal-nav"},el("button",{type:"button",class:"mini cal-today",text:"Today",onclick:()=>{calAnchor=iso(new Date());calMiniM=null;calScroll=null;render();}}),
        el("button",{type:"button",class:"mini cal-prev","aria-label":"Previous",text:"‹",onclick:()=>calNav(-1)}),el("button",{type:"button",class:"mini cal-next","aria-label":"Next",text:"›",onclick:()=>calNav(1)}),
        el("button",{type:"button",class:"cal-title",text:calTitle(r,calAnchor),"aria-expanded":String(wide||calMiniOpen),onclick:()=>{if(!wide){calMiniOpen=!calMiniOpen;render();}}})),
      sw,
      tl?null:el("div",{class:"cal-acts"},el("button",{type:"button",class:"mini cal-arch","aria-pressed":String(calArch),text:calArch?"Hide archived":"Show archived",onclick:()=>{calArch=!calArch;render();}}),
        el("button",{type:"button",class:"mini cal-new",text:"New",onclick:()=>calEdit({date:calAnchor<r.from||calAnchor>r.to?r.from:calAnchor})})));}
  function calMini(){const m=calMiniM||calAnchor.slice(0,8)+"01",days=[],ws=weekStart(m),today=iso(new Date());for(let i=0;i<42;i++)days.push(addDays(ws,i));
    const ix=calIndex(days[0],days[41],{archived:false}),starts=new Set(sprints().map(p=>p.start)),inR=calRange(calView,calAnchor);
    const hd=["S","S","M","T","W","T","F"];
    return el("div",{class:"cal-mini"},el("div",{class:"cm-h"},el("button",{type:"button",class:"mini","aria-label":"Previous month",text:"‹",onclick:()=>{calMiniM=calMonthAdd(m,-1);render();}}),el("b",{text:CAL_MON[parse(m).getMonth()]+" "+parse(m).getFullYear()}),el("button",{type:"button",class:"mini","aria-label":"Next month",text:"›",onclick:()=>{calMiniM=calMonthAdd(m,1);render();}})),
      el("div",{class:"cm-g"},...hd.map(x=>el("span",{class:"cm-w",text:x})),...days.map(d=>{const x=ix.days.get(d),has=(x&&x.items.length)||ix.bars.some(b=>b.a<=d&&b.b>=d);
        return el("button",{type:"button",class:"cm-d"+(parse(d).getMonth()!==parse(m).getMonth()?" out":"")+(d===today?" today":"")+(d>=inR.from&&d<=inR.to&&calView!=="month"?" in":"")+(starts.has(d)?" sp":"")+(has?" has":""),"data-d":d,"aria-label":calDayLab(d)+(starts.has(d)?", sprint start":""),text:String(parse(d).getDate()),
          onclick:()=>{calAnchor=d;calMiniOpen=false;calScroll=null;render();}});})));}
  function calItemLabel(x){const t=x.start?t12(x.start)+" to "+t12(calHM(calMinsOf(x.start)+x.mins)):"all day";return x.title+", "+calDayLab(x.date)+", "+t+(x.cat&&CAT_NAME[x.cat]?", "+CAT_NAME[x.cat]:"")+(x.kind==="event"?", event":x.sugg?", suggested":", planned");}
  function calOpen(x){if(x.kind==="task")v3taskSheet(x.id);else if(x.kind==="parent")v3taskSheet(x.id);else calEdit({event:x.id,occ:x.occ});}
  function calBar(b,extra){const ct=b.kind==="parent"?b.done+"/"+b.total:null;
    return el("button",{type:"button",class:"cal-bar k-"+b.kind+(b.isDone?" done":"")+(b.arch?" arch":"")+(extra||""),"data-cat":b.cat||"","data-id":b.id,"aria-label":b.title+", "+calDayLab(b.a)+(b.b>b.a?" to "+calDayLab(b.b):"")+", all day"+(ct?", "+ct+" done":""),onclick:e=>{e.stopPropagation();calOpen(b);}},el("span",{class:"ct",text:b.title}),ct?el("span",{class:"cn num",text:ct}):null);}
  function calGrid(r){const days=r.days,n=days.length,ph=calPH(),today=iso(new Date()),ix=calIndex(r.from,r.to,{archived:calArch}),single=n===1,starts=new Map(sprints().map(p=>[p.start,p.n]));
    const H=(CAL_T1-CAL_T0)/60*ph,top=m=>(m-CAL_T0)/60*ph;
    // header
    const head=el("div",{class:"cal-head",style:"--n:"+n},el("div",{class:"cal-gut"}),...days.map(d=>{const x=ix.days.get(d)||{cap:0},cap=Math.round(x.cap*10)/10,fri=isFriday(d);let wk=0;
      for(const e of entriesOn(d))for(const se of sessionsOf(e))if(se.end>se.start)wk+=(se.end-se.start)/60000;
      return el("button",{type:"button",class:"cal-dh"+(d===today?" today":"")+(fri?" fri":"")+(starts.has(d)?" sp0":"")+(cap>CAL_CAP?" over":""),"data-d":d,"aria-label":calDayLab(d)+", "+cap+" of "+CAL_CAP+" pomodoros planned",onclick:()=>{calView="day";calAnchor=d;calScroll=null;render();}},
        el("span",{class:"dn",text:parse(d).toLocaleDateString("en-GB",{weekday:"short"})}),el("b",{class:"dd num",text:String(parse(d).getDate())}),
        starts.has(d)?el("span",{class:"sp",text:"S"+starts.get(d)}):null,
        el("span",{class:"cap num",text:fri?"Rest":cap+" of "+CAL_CAP}),
        single?el("span",{class:"wkd num",text:"Planned "+cap+"p · Worked "+Math.round(wk/50*10)/10+"p"}):null);}));
    // all-day lane
    const bars=ix.bars.filter(b=>b.a<=r.to&&b.b>=r.from).sort((a,b)=>a.a.localeCompare(b.a)||b.b.localeCompare(a.b)),rows=[];
    const placed=bars.map(b=>{const a=Math.max(0,days.indexOf(b.a<r.from?r.from:b.a)),e=Math.max(a,days.indexOf(b.b>r.to?r.to:b.b));let rw=rows.findIndex(en=>en<a);if(rw<0){rw=rows.length;rows.push(-1);}rows[rw]=e;return {b,a,e,rw};});
    const lane=el("div",{class:"cal-lane","data-rows":String(rows.length)},el("div",{class:"cal-gut cal-lab",text:rows.length?"All day":""}),
      el("div",{class:"cal-lg",style:"--n:"+n+";min-height:"+Math.max(1,rows.length)*24+"px"},...days.map((d,i)=>el("div",{class:"cal-lc"+(isFriday(d)?" fri":"")+(starts.has(d)?" sp0":""),"data-d":d,style:"grid-column:"+(i+1)+";grid-row:1 / span "+Math.max(1,rows.length)})),
        ...placed.map(p=>{const bn=calBar(p.b);bn.style.gridColumn=(p.a+1)+" / "+(p.e+2);bn.style.gridRow=String(p.rw+1);return bn;})));
    // time grid
    const gut=el("div",{class:"cal-gut cal-hours","aria-hidden":"true"});for(let h=Math.ceil(CAL_T0/60);h<=22;h++){gut.append(el("span",{class:"hr",style:"top:"+top(h*60)+"px",text:((h%12)||12)+(h<12?" AM":" PM")}));}
    const cols=days.map((d,ci)=>{const x=ix.days.get(d)||{items:[],cap:0},fri=isFriday(d),items=x.items.filter(i=>true);calSugg(d,items);
      const lay=calPack(items.map(i=>({...i,s:calMinsOf(i.start),e:calMinsOf(i.start)+Math.max(25,i.mins)})));
      const col=el("div",{class:"cal-col"+(d===today?" today":"")+(fri?" fri":"")+(starts.has(d)?" sp0":"")+(single?" split":""),"data-d":d,role:"group","aria-label":calDayLab(d),style:"height:"+H+"px"});
      const plan=el("div",{class:"cal-plan"});
      if(!fri){let bl=[];try{bl=dayBlocksFor(d)||[];}catch(e){}bl.forEach(b=>{const a=calMinsOf(b.from),z=calMinsOf(b.to);if(z<=CAL_T0||a>=CAL_T1)return;plan.append(el("div",{class:"cal-band k-"+(b.kind||"x"),style:"top:"+top(Math.max(a,CAL_T0))+"px;height:"+(Math.min(z,CAL_T1)-Math.max(a,CAL_T0))/60*ph+"px"},ci===0||single?el("span",{class:"bl",text:b.name||""}):null));});}
      else plan.append(el("span",{class:"cal-rest",text:"Rest"}));
      lay.forEach(i=>{const s=Math.max(CAL_T0,i.s),e=Math.min(CAL_T1,Math.max(i.e,i.s+25)),h=Math.max(18,(e-s)/60*ph-1),w=100/(i.n||1);
        const meta=[];if(i.rep)meta.push("R");
        const b=el("button",{type:"button",class:"cal-it k-"+i.kind+(i.sugg?" sugg":"")+(i.done?" done":"")+(i.arch?" arch":"")+(i.over?" ovl":"")+(i.ek==="block"?" blk":""),"data-cat":i.cat||"","data-id":i.id,"data-start":i.start,
          style:"top:"+top(s)+"px;height:"+h+"px;left:calc("+(i.col*w)+"% + 1px);width:calc("+w+"% - 3px)","aria-label":calItemLabel(i),onclick:ev=>{ev.stopPropagation();calOpen(i);}},
          el("span",{class:"ct",text:(i.done?"✓ ":"")+i.title}),el("span",{class:"cm num",text:t12(i.start).replace(" AM","").replace(" PM","")+(i.sugg?" suggested":"")+(i.loc?" · "+i.loc:"")+(meta.length?" · "+meta.join(" "):"")+(i.over?" · Overlap":"")}));
        plan.append(b);});
      col.append(plan);
      const wk=el("div",{class:"cal-wk","aria-label":"Worked"});let wm=0;
      for(const e of entriesOn(d))for(const se of sessionsOf(e)){if(!(se.end>se.start))continue;const a=minsOf(se.start),z=Math.min(CAL_T1,a+(se.end-se.start)/60000);wm+=(se.end-se.start)/60000;if(z<=CAL_T0)continue;
        const tk=String(e.ref||"").startsWith("tasks:")?state.tasks[String(e.ref).slice(6)]:null;
        wk.append(el("div",{class:"cal-ws",title:(tk?tk.title:e.label||e.note||"Worked"),style:"top:"+top(Math.max(a,CAL_T0))+"px;height:"+Math.max(2,(z-Math.max(a,CAL_T0))/60*ph)+"px"},single?el("span",{text:tk?tk.title:(e.label||e.note||"Worked")}):null));}
      if(wm)wk.setAttribute("aria-label","Worked "+dur(wm));wk.title=wm?"Worked "+dur(wm):"";
      col.append(wk);
      if(d===today){const nm=new Date().getHours()*60+new Date().getMinutes();if(nm>=CAL_T0&&nm<=CAL_T1)col.append(el("div",{class:"cal-now",style:"top:"+top(nm)+"px"}));}
      return col;});
    const grid=el("div",{class:"cal-grid",role:"grid","aria-label":"Calendar","data-ph":String(ph),style:"--n:"+n+";--ph:"+ph+"px"},gut,el("div",{class:"cal-cols",style:"--n:"+n},...cols));
    const sc=el("div",{class:"cal-scroll"},grid);
    sc.addEventListener("scroll",()=>{calScroll=sc.scrollTop;});
    grid.addEventListener("click",e=>{const c=e.target.closest(".cal-col");if(!c||e.target.closest(".cal-it"))return;const y=e.clientY-c.getBoundingClientRect().top,m=Math.max(CAL_T0,Math.min(CAL_T1-50,calSnap(CAL_T0+y/ph*60,15)));calEdit({date:c.dataset.d,start:calHM(m),mins:50});});
    lane.addEventListener("click",e=>{if(e.target.closest(".cal-bar"))return;const g=lane.querySelector(".cal-lg"),rc0=g.getBoundingClientRect(),i=Math.max(0,Math.min(n-1,Math.floor((e.clientX-rc0.left)/(rc0.width/n))));calEdit({date:days[i],allDay:true});});
    requestAnimationFrame(()=>{if(!sc.isConnected)return;if(calScroll==null){const nm=new Date().getHours()*60+new Date().getMinutes(),tgt=days.includes(today)?Math.max(CAL_T0,nm-60):300;calScroll=Math.max(0,top(tgt));}sc.scrollTop=calScroll;});
    return [head,lane,sc];}
  function calMonth(r){const today=iso(new Date()),ix=calIndex(r.from,r.to,{archived:calArch}),starts=new Map(sprints().map(p=>[p.start,p.n])),cm=parse(calAnchor).getMonth();
    const hd=["Sat","Sun","Mon","Tue","Wed","Thu","Fri"];
    const cells=r.days.map(d=>{const x=ix.days.get(d)||{items:[]},all=[...ix.bars.filter(b=>b.a<=d&&b.b>=d&&b.kind!=="parent").map(b=>({...b,bar:true,date:d})),...x.items.slice().sort((a,b)=>String(a.start||"99").localeCompare(String(b.start||"99")))];
      const show=all.slice(0,3),more=all.length-show.length,cap=Math.round((x.cap||0)*10)/10;
      return el("div",{class:"cal-mc"+(d===today?" today":"")+(isFriday(d)?" fri":"")+(parse(d).getMonth()!==cm?" out":"")+(starts.has(d)?" sp0":""),"data-d":d,role:"group","aria-label":calDayLab(d)},
        el("div",{class:"mh"},el("button",{type:"button",class:"md num","aria-label":"Open "+calDayLab(d),text:String(parse(d).getDate()),onclick:e=>{e.stopPropagation();calView="day";calAnchor=d;calScroll=null;render();}}),starts.has(d)?el("span",{class:"sp",text:"S"+starts.get(d)}):null,cap&&!isFriday(d)?el("span",{class:"cap num",text:cap+" of "+CAL_CAP}):null),
        ...show.map(i=>el("button",{type:"button",class:"cal-mi k-"+i.kind+(i.done||i.isDone?" done":"")+(i.arch?" arch":""),"data-cat":i.cat||"","aria-label":i.title+", "+calDayLab(d),onclick:e=>{e.stopPropagation();calOpen(i);}},el("span",{class:"ct",text:(i.start?t12(i.start).replace(" AM","a").replace(" PM","p").replace(":00","")+" ":"")+i.title}))),
        more>0?el("button",{type:"button",class:"cal-more",text:"+"+more+" more",onclick:e=>{e.stopPropagation();calView="day";calAnchor=d;calScroll=null;render();}}):null);});
    const g=el("div",{class:"cal-mg"},...hd.map(h=>el("span",{class:"mw",text:h})),...cells);
    g.addEventListener("click",e=>{const c=e.target.closest(".cal-mc");if(c)calEdit({date:c.dataset.d});});
    return [g];}
  // ---- editor (tap a slot or an event) ----
  function calEdit(o){o=o||{};const ev=o.event?(state.events||{})[o.event]:null;if(o.event&&!ev){toast("This event is gone");return;}
    psOpen(ev?"Event":"New",re=>{
      const occ=o.occ||null,src=ev?{title:occ?occ.title:ev.title,date:ev.date,start:occ?occ.start:ev.start,mins:occ?occ.mins:ev.mins,cat:ev.cat,location:ev.location||"",notes:ev.notes||"",allDay:!!ev.allDay}:{title:"",date:o.date||iso(new Date()),start:o.start||null,mins:o.mins||50,cat:null,location:"",notes:"",allDay:!!o.allDay};
      let kind=ev?"event":(o.kind||"event"),cat=src.cat;
      const f={};const inp=(k,type,val,lab,extra)=>{const i=el("input",{type,class:"v3-in cal-f-"+k,"aria-label":lab,value:val==null?"":String(val),...(extra||{})});f[k]=i;return el("label",{class:"field"},el("span",{class:"label",text:lab}),i);};
      const seg=ev?null:el("div",{class:"seg cal-kind",role:"group","aria-label":"Kind"},...[["event","Event"],["task","Task"]].map(([k,n])=>el("button",{type:"button","aria-pressed":String(kind===k),text:n,onclick:()=>{kind=k;seg.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.textContent===n)));}})));
      const title=inp("title","text",src.title,"Title",{placeholder:"What is it?"});
      const chips=v3catChips(cat,c=>{cat=cat===c?null:c;chips.querySelectorAll(".cat-chip").forEach(b=>{const on=b.dataset.cat===cat;b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on));});});
      const ad=el("input",{type:"checkbox",class:"cal-f-allday","aria-label":"All day"});ad.checked=src.allDay;f.allDay=ad;
      const save=async()=>{const ae=document.activeElement;if(ae&&ae.blur)ae.blur();await new Promise(r=>setTimeout(r,30));
        const ttl=f.title.value.trim();if(!ttl){toast("Type a title");return;}const date=f.date.value||src.date,all=f.allDay.checked,st=all||!f.start.value?null:f.start.value,mn=Math.max(5,Math.round(+f.mins.value||50));
        if(ev){const patch={title:ttl,cat:cat||null,date:occ?ev.date:date,start:st,mins:mn,allDay:all,location:f.location.value.trim(),notes:f.notes.value.trim(),updatedAt:Date.now()};
          if(occ&&ev.rrule){const ovs={...(ev.overrides||{}),[occ.orig]:{date,start:st,mins:mn,title:ttl,location:patch.location,notes:patch.notes}};state.events={...state.events,[o.event]:{...ev,overrides:ovs}};render();try{await store.update("events/"+o.event,{overrides:ovs});}catch(e){fail(e);}}
          else{state.events={...state.events,[o.event]:{...ev,...patch}};render();try{await store.update("events/"+o.event,patch);}catch(e){fail(e);}}
          psClose(true);toast("Saved");return;}
        if(kind==="task"){const sp=sprintFor(date);const body={title:ttl,cat:cat||"portfolio",date,sprint:sp.n,done:false,moved:0,order:Date.now(),mins:mn};if(st)body.start=st;if(all)body.allDay=true;
          await v3newTask(body);psClose(true);toast("Task added");return;}
        const body={title:ttl,kind:"appt",cat:cat||null,date,start:st,mins:mn,allDay:all,days:1,notes:f.notes.value.trim(),location:f.location.value.trim(),remind:[],rrule:null,exdates:[],overrides:{},createdAt:Date.now(),updatedAt:Date.now()};
        try{const ref=await store.add("events",body);state.events={...state.events,[ref.id]:body};render();}catch(e){fail(e);}
        psClose(true);toast("Event added");};
      const del=ev?el("button",{type:"button",class:"btn ghost cal-del",text:"Delete",onclick:async()=>{state.events=Object.fromEntries(Object.entries(state.events).filter(([k])=>k!==o.event));render();try{await store.del("events/"+o.event);}catch(e){fail(e);}psClose(true);toast("Deleted");}}):null;
      return [seg,title,el("div",{class:"v3-row"},inp("date","date",src.date,"Day"),inp("start","time",src.start||"","Start"),inp("mins","number",src.mins,"Minutes",{min:"5",step:"5"})),
        el("label",{class:"field cal-chk"},ad,el("span",{text:"All day"})),chips,
        inp("location","text",src.location,"Location"),inp("notes","text",src.notes,"Notes"),
        el("div",{class:"v3-row"},el("button",{type:"button",class:"btn cal-save",text:"Save",onclick:save}),del,el("button",{type:"button",class:"btn ghost",text:"Cancel",onclick:()=>psClose()}))];});}
  // ---- entry point ----
  renderWaterfall=function(){const box=document.getElementById("wfBody");if(!box)return;const pg=box.closest(".page");if(pg&&pg.hidden)return;
    try{const h=document.getElementById("wfH");if(h&&h.textContent!=="Calendar")h.textContent="Calendar";const sec=box.closest("section");const hn=sec&&sec.querySelector(".panel-head .hint");if(hn&&hn.textContent)hn.textContent="";const inf=sec&&sec.querySelector(".panel-head .info");if(inf)inf.hidden=true;}catch(e){}
    if(!calView)calView=calDefView();if(!calAnchor)calAnchor=iso(new Date());
    const r=calRange(calView,calAnchor),wide=innerWidth>=1000,view=el("div",{class:"cal-view v-"+calView});
    if(calView==="timeline")wfTimeline(view);
    else{const main=el("div",{class:"cal-main"},...(calView==="month"?calMonth(r):calGrid(r)));
      if(wide)rc(view,el("div",{class:"cal-side"},calMini()),main);else rc(view,calMiniOpen?calMini():null,main);}
    rc(box,calToolbar(r),view);box.classList.add("cal-box");};
  if(!calClock)calClock=setInterval(()=>{try{const nw=document.querySelector(".cal-now");if(!nw)return;const g=nw.closest(".cal-grid"),ph=+g.dataset.ph,nm=new Date().getHours()*60+new Date().getMinutes();nw.style.top=(nm-CAL_T0)/60*ph+"px";}catch(e){}},60000);
  window.__cal={calOcc,calParse,calRange,calIndex,calEdit,st:()=>state,rd:()=>render(),leaf:id=>isLeaf({id})};

  render();
  setPage(page);

  // ---------- data ----------
  (async()=>{
    db=await window.claude?.use?.("db");
    if(!db){showNotice("Your progress can't be loaded in this view. Open the page in claude.ai while signed in.");return;}
    setTimeout(()=>store.flush(),1500);
    const timer=setTimeout(()=>showNotice("Your board can't be reached yet. It will appear once the connection returns."),10000);
    const sub=(name,fn)=>db.collection(name).onSnapshot(snap=>{
      const m={};snap.docs.forEach(d=>{m[d.id]=d.data();});__shadow[name]=JSON.parse(JSON.stringify(m));
      if(name==="logs")for(const k of dirty){if(state.logs[k])m[k]=state.logs[k];} // keep unsaved local edits
      state[name]=fn?fn(m):m;state.loaded[name]=true;
      if(!snap.metadata.fromCache){clearTimeout(timer);if(document.getElementById("notice").textContent.startsWith("Your board"))showNotice("");}
      render();
    },err=>{clearTimeout(timer);state.loaded[name]=true;showNotice("Part of your board couldn't load. Reopen the page to try again.");render();});
    sub("tasks");sub("logs");sub("sprints");sub("projects");sub("learning");sub("inquiries");sub("timers");sub("entries");sub("reminders");sub("events");sub("habits");sub("sleep");sub("salah");sub("listen");sub("notes");sub("design");sub("guard");sub("gym",m=>{if(!window.__gymAuto&&m.active&&m.active.startedAt){window.__gymAuto=true;if(page!=="gym")setTimeout(()=>setPage("gym"),0);}else window.__gymAuto=true;return m;});sub("settings",m=>{syncUI(m.ui);return m;});
  })();
})();
