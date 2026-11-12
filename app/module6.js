
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
