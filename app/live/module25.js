// ===== Habits: habits and repeating tasks are one thing. One tap marks, swipe left skips or moves, streaks never punish a skip. =====
// Serves pillar: procrastination (a habit is one tap, no planning before starting), fear of overwhelm (one collapsed row "Habits 2 of 5" instead of a list of copies) and flexibility (skip, move to later or tomorrow, all with Undo, and a skip never breaks the streak).
const HB_TOD=[["morning","Morning"],["afternoon","Afternoon"],["evening","Evening"],["any","Any time"]];
const HB_REC=[["daily","Daily"],["weekdays","Weekdays"],["xweek","3x a week"],["weekly","Weekly"],["days","Custom days"]];
const HB_WD=[6,0,1,2,3,4,5];
const HB_WL=["S","S","M","T","W","T","F"];
const HB_WN=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const HB_EVE=19;
const HB_DEF={english:{rec:{type:"weekdays"},tod:"any",order:0},gym:{rec:{type:"xweek",n:4},tod:"any",order:1}};
function hbName(id){const d=(state.habits||{})[id],b=HABITS.find(x=>x.id===id);return (d&&d.name)||(b&&b.name)||id;}
function hbList(all){
  const ids=HABITS.filter(h=>!h.custom).map(h=>h.id);
  Object.entries(state.habits||{}).forEach(([id,d])=>{if(d&&d.custom&&d.name&&!ids.includes(id))ids.push(id);});
  const L=ids.map(id=>{const doc=(state.habits||{})[id]||{},df=HB_DEF[id];
    return {id,name:doc.name||hbName(id),rec:doc.rec||(df&&df.rec)||{type:"xweek",n:Math.max(2,Math.min(6,Number(doc.min)||3))},tod:doc.tod||"any",bucket:doc.bucket||null,order:doc.order!=null?doc.order:(df?df.order:0),builtin:!!df,archived:doc.archived||null,deleted:doc.deleted||null,created:doc.created||null};});
  const ti=t=>{const i=HB_TOD.findIndex(x=>x[0]===t);return i<0?3:i;};
  return L.filter(h=>all||(!h.archived&&!h.deleted)).sort((a,b)=>ti(a.tod)-ti(b.tod)||a.order-b.order);}
function hbDay(d,id){const L=log(d);return L[id]?"done":(L.hbs||{})[id]||"open";}
function hbWeekDone(h,d){const s=v3wkStart(d);let n=0;for(let i=0;i<7;i++)if(log(addDays(s,i))[h.id])n++;return n;}
function hbDue(h,d){
  if(h.archived||h.deleted)return false;
  if(h.created&&d<iso(new Date(h.created)))return false;
  const st=hbDay(d,h.id);if(st==="due"||st==="done"||st==="later")return true;
  const r=h.rec||{type:"daily"};
  if(r.type==="daily")return true;
  if(r.type==="weekdays")return !isFriday(d);
  if(r.type==="weekly"||r.type==="days"){const ds=(r.days&&r.days.length)?r.days:(r.type==="weekly"?[6]:[]);return ds.includes(parse(d).getDay());}
  if(r.type==="xweek")return hbWeekDone(h,d)<(r.n||3);
  return true;}
function hbTodayList(d){const L=hbList().filter(h=>hbDue(h,d)&&!["skip","moved"].includes(hbDay(d,h.id)));
  return L.filter(h=>hbDay(d,h.id)!=="later").concat(L.filter(h=>hbDay(d,h.id)==="later"));}
function hbCount(list,d){return {done:list.filter(h=>hbDay(d,h.id)==="done").length,n:list.length};}
function hbStreak(h){
  const today=iso(new Date()),r=h.rec||{};let cur=0,best=0,total=0,skips30=0;
  const lim=addDays(today,-730),from=START>lim?START:lim;
  if(r.type==="xweek"){const n=r.n||3,ws=v3wkStart(today);
    if(hbWeekDone(h,ws)>=n)cur++;
    for(let w=addDays(ws,-7);addDays(w,6)>=from;w=addDays(w,-7)){if(hbWeekDone(h,w)>=n)cur++;else break;}
    let run=0;for(let w=v3wkStart(from);w<=ws;w=addDays(w,7)){if(hbWeekDone(h,w)>=n){run++;best=Math.max(best,run);}else if(w!==ws)run=0;}
  }else{
    const skip=d=>["skip","moved"].includes(hbDay(d,h.id));let stop=false;
    for(let d=today;d>=from;d=addDays(d,-1)){if(!hbDue(h,d)||skip(d))continue;if(hbDay(d,h.id)==="done"){if(!stop)cur++;}else if(d===today)continue;else stop=true;if(stop)break;}
    let run=0;for(let d=from;d<=today;d=addDays(d,1)){if(!hbDue(h,d)||skip(d))continue;if(hbDay(d,h.id)==="done"){run++;best=Math.max(best,run);}else if(d!==today)run=0;}
  }
  Object.keys(state.logs||{}).forEach(d=>{if(state.logs[d]&&state.logs[d][h.id])total++;});
  for(let i=0;i<30;i++)if(hbDay(addDays(today,-i),h.id)==="skip")skips30++;
  return {cur,best,total,skips30};}
function hbRecName(r){r=r||{type:"daily"};
  if(r.type==="daily")return "Daily";if(r.type==="weekdays")return "Weekdays";
  if(r.type==="xweek")return (r.n||3)+"x a week";
  if(r.type==="weekly")return "Weekly, "+HB_WN[(r.days&&r.days[0]!=null)?r.days[0]:6];
  return HB_WD.filter(d=>(r.days||[]).includes(d)).map(d=>HB_WN[d]).join(", ");}
function hbZone(r){const t=r.type;if(t==="daily")return [7,7];if(t==="weekdays")return [6,6];if(t==="xweek"){const n=r.n||3;return [n,n];}if(t==="weekly")return [1,1];const n=(r.days||[]).length||1;return [n,n];}
function hbSave(id,patch,msg){
  const prev=state.habits[id]?{...state.habits[id]}:null;
  const body={...(prev||{}),...patch,upd:Date.now()};
  if(patch.rec){const z=hbZone(patch.rec);body.min=z[0];body.max=z[1];}
  if(!HB_DEF[id])body.custom=true;
  state.habits={...state.habits,[id]:body};
  try{store.set("habits/"+id,body);}catch(e){}
  render();
  if(msg!==false)v3undoToast(msg||"Saved",()=>{if(prev){state.habits={...state.habits,[id]:prev};try{store.set("habits/"+id,prev);}catch(e){}}else{const c={...state.habits};delete c[id];state.habits=c;try{store.del("habits/"+id);}catch(e){}}render();});
  return body;}
function hbAdd(name,bucket){name=String(name||"").trim();if(!name){toast("Type a name");return;}
  const id="h"+Date.now().toString(36);
  hbSave(id,{name,custom:true,rec:{type:"daily"},tod:"any",bucket:bucket||null,order:Date.now(),created:Date.now()},"Added habit: "+name);return id;}
function hbLog(d,fn){const L={...log(d),date:d};L.hbs={...(L.hbs||{})};fn(L);if(!Object.keys(L.hbs).length)delete L.hbs;state.logs[d]=L;render();queueSave(d,300);}
function hbSnap(d,id){const L=log(d);return {v:L[id],s:(L.hbs||{})[id],es:L.englishSteps};}
function hbRestoreSnap(d,id,o){hbLog(d,L=>{if(o.v)L[id]=o.v;else delete L[id];if(o.s)L.hbs[id]=o.s;else delete L.hbs[id];if(id==="english"){if(o.es)L.englishSteps=o.es;else delete L.englishSteps;}});}
function hbMark(d,id,on){const old=hbSnap(d,id);
  hbLog(d,L=>{if(on){L[id]=true;delete L.hbs[id];}else{delete L[id];}if(id==="english")L.englishSteps=on?Object.fromEntries(ENG_STEPS.map(s=>[s.id,true])):{};});
  v3undoToast((on?"Done: ":"Open again: ")+hbName(id),()=>hbRestoreSnap(d,id,old));}
function hbSet(d,id,st,msg){const old=hbSnap(d,id),n=addDays(d,1),oldN=st==="moved"?hbSnap(n,id):null;
  hbLog(d,L=>{delete L[id];if(st)L.hbs[id]=st;else delete L.hbs[id];});
  if(st==="moved")hbLog(n,L=>{L.hbs[id]="due";});
  v3undoToast(msg||"Saved",()=>{hbRestoreSnap(d,id,old);if(oldN)hbRestoreSnap(n,id,oldN);});}
window.__hb={list:hbList,due:hbDue,day:hbDay,todayList:hbTodayList,count:hbCount,streak:hbStreak,recName:hbRecName,save:hbSave,add:hbAdd,mark:hbMark,set:hbSet};
// ---------- Round 2: Today row, one-tap check, swipe skip or later, evening row ----------
let hbOpen={};
const hbBkTitle=id=>{const t=state.tasks&&state.tasks[id];return t&&t.bucket?t.title:null;};
function hbRow(h,d,ctx){
  const st=hbDay(d,h.id),li=el("li",{class:"hb-row ur-row"+(st==="done"?" done":""),"data-id":h.id,"aria-label":h.name});
  const cb=el("input",{type:"checkbox",class:"ur-c","aria-label":"Done: "+h.name});cb.checked=st==="done";cb.onchange=()=>hbMark(d,h.id,cb.checked);
  const tt=el("button",{type:"button",class:"ur-t hb-t","data-dragok":"",text:h.name,onclick:()=>{if(typeof hbSheet==="function")hbSheet(h.id);}});
  const sk=hbStreak(h),sv=sk.cur>=2?sk.cur+(h.rec.type==="xweek"?" wk":" d"):"";
  const stEl=el("span",{class:"ur-d hb-st num",text:sv,title:sv?"Streak":null});
  const tags=[];
  if(h.tod!=="any")tags.push((HB_TOD.find(x=>x[0]===h.tod)||[])[1]);
  if(ctx==="today"&&h.bucket&&hbBkTitle(h.bucket))tags.push(hbBkTitle(h.bucket));
  if(h.rec.type==="xweek")tags.push(hbWeekDone(h,d)+" of "+(h.rec.n||3)+" this week");
  if(st==="later")tags.push("later");
  li.append(cb,tt,stEl,el("span",{class:"hint ur-tags",text:tags.filter(Boolean).join(" · ")}));
  swipeable(li,()=>hbMark(d,h.id,true),()=>hbNotToday(h.id,d),null,{direct:true,directR:true});
  return li;}
function hbNotToday(id,d){const h=hbList(true).find(x=>x.id===id);if(!h)return;const today=iso(new Date());
  psOpen("Not today",()=>{const out=[el("p",{class:"ps-sh-sum",text:h.name})];
    if(d===today&&hbDay(d,id)!=="later")out.push(el("button",{type:"button",class:"btn ghost hb-later",onclick:()=>{psClose(true);hbSet(d,id,"later","Later today: "+h.name);}},"Later today"));
    out.push(el("button",{type:"button",class:"btn ghost hb-skip",onclick:()=>{psClose(true);hbSet(d,id,"skip","Skipped today: "+h.name);}},"Skip today"));
    if(!hbDue(h,addDays(d,1)))out.push(el("button",{type:"button",class:"btn ghost hb-tmr",onclick:()=>{psClose(true);hbSet(d,id,"moved","Moved to tomorrow: "+h.name);}},"Tomorrow"));
    return out;});}
function hbOrderWrite(ids,all){const rest=all.filter(i=>!ids.includes(i)),full=ids.concat(rest);
  const old=full.map(i=>[i,(state.habits[i]||{}).order]);
  full.forEach((i,k)=>hbSave(i,{order:k*10},false));
  v3undoToast("Order changed",()=>{old.forEach(([i,o])=>{if(o===undefined){const c={...(state.habits[i]||{})};delete c.order;state.habits={...state.habits,[i]:c};try{store.set("habits/"+i,c);}catch(e){}}else hbSave(i,{order:o},false);});render();});}
function hbList4(ul,list,d,ctx,key){
  const ex=!!hbOpen[key+"x"],show=ex?list:list.slice(0,4);
  rc(ul,...show.map(h=>hbRow(h,d,ctx)));
  const wrap=el("div",{class:"hb-wrap"},ul);
  if(list.length>4)wrap.append(el("button",{type:"button",class:"mini ck-more hb-more",onclick:()=>{hbOpen[key+"x"]=!ex;render();}},ex?"Show less":(list.length-4)+" more"));
  if(show.length>1)v3dragList(ul,".hb-row",ids=>{const held=ul.querySelector(".hb-row[data-dragged]");
    ul.querySelectorAll(".hb-row").forEach(r=>{try{r.dispatchEvent(new PointerEvent("pointercancel"));}catch(e){}});
    if(ids.join()===show.map(x=>x.id).join()){if(held)setTimeout(()=>hbMenu(held.dataset.id),0);return;}
    hbOrderWrite(ids,list.map(x=>x.id));});
  return wrap;}
function hbMenu(id){const h=hbList(true).find(x=>x.id===id);if(!h)return;
  psOpen("Habit options",()=>[el("p",{class:"ps-sh-sum",text:h.name}),
    el("button",{type:"button",class:"btn ghost",onclick:()=>{psClose(true);setTimeout(()=>{if(typeof hbSheet==="function")hbSheet(id);},60);}},"Edit"),
    el("button",{type:"button",class:"btn ghost",onclick:()=>{psClose(true);setTimeout(()=>hbBucketPick(id),60);}},"Move to bucket"),
    el("button",{type:"button",class:"btn ghost",onclick:()=>{psClose(true);hbSave(id,{archived:Date.now()},"Archived: "+h.name);}},"Archive"),
    h.builtin?null:el("button",{type:"button",class:"btn ghost danger",onclick:()=>{psClose(true);hbSave(id,{deleted:Date.now()},"Deleted: "+h.name);}},"Delete")]);}
function hbBucketPick(id){psOpen("Move to bucket",()=>[el("ul",{class:"ps-sh-list"},...[{id:null,title:"No bucket"},...bkList().filter(b=>!b.archived)].map(b=>el("li",{},el("button",{type:"button",class:"ps-sh-row",onclick:()=>{psClose(true);hbSave(id,{bucket:b.id},"Moved to "+b.title);}},b.title))))]);}
function hbToday(){
  const ul0=document.getElementById("cutStack");if(!ul0)return;
  ul0.querySelectorAll(".hb-card").forEach(x=>x.remove());
  if(hbList().length===0)return;
  const d=sel,list=hbTodayList(d),c=hbCount(list,d),open=!!hbOpen[d],today=iso(new Date());
  const title=c.n===0?"Habits · none due today":(c.done===c.n?"Habits · "+c.n+" of "+c.n+" done":"Habits "+c.done+" of "+c.n);
  const head=el("button",{type:"button",class:"ch-head hb-head","aria-expanded":String(open),onclick:()=>{hbOpen[d]=!open;renderCutList();}},el("span",{class:"ch-t",text:title}),el("span",{class:"hint ch-s",text:open?"Less":"Open"}));
  const kids=[head];
  const openL=list.filter(h=>["open","later"].includes(hbDay(d,h.id)));
  if(d===today&&new Date().getHours()>=HB_EVE&&openL.length){const names=openL.map(h=>h.name);
    kids.push(el("div",{class:"hb-eve"},el("span",{class:"hint",text:"Still open tonight: "+names.slice(0,3).join(", ")+(names.length>3?" and "+(names.length-3)+" more":"")}),
      el("button",{type:"button",class:"mini hb-eve-mark",onclick:()=>{hbOpen[d]=true;renderCutList();}},"Mark"),
      el("button",{type:"button",class:"mini hb-eve-go",onclick:()=>{const olds=openL.map(h=>[h.id,hbSnap(d,h.id)]);
        hbLog(d,L=>{openL.forEach(h=>{delete L[h.id];L.hbs[h.id]="skip";});});
        v3undoToast("Let go for today: "+openL.length+" habit"+(openL.length===1?"":"s"),()=>{hbLog(d,L=>{olds.forEach(([id,o])=>{if(o.v)L[id]=o.v;else delete L[id];if(o.s)L.hbs[id]=o.s;else delete L.hbs[id];});});});}},"Let go")));}
  if(open){const inp=el("input",{type:"text",class:"v3-in","aria-label":"Add a habit",placeholder:"Add habit"});
    inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();const v=inp.value;inp.value="";hbAdd(v,null);}});
    kids.push(el("div",{class:"ch-body"},hbList4(el("ul",{class:"hb-list"}),list,d,"today",d),el("div",{class:"hb-add bk-add"},inp),
      el("button",{type:"button",class:"mini ck-more hb-all",onclick:()=>{if(typeof hbListSheet==="function")hbListSheet();}},"All habits")));}
  ul0.append(el("section",{class:"ch-card hb-card"+(open?" open":""),"data-ch":"hab","aria-label":"Habits"},...kids));}
// chRender (module7) repaints #cutStack on its own too, so the habits row hangs on it
{const _ch25=chRender;chRender=function(){_ch25();try{hbToday();}catch(e){console.warn(e);}};}
setInterval(()=>{if(new Date().getHours()===HB_EVE&&new Date().getMinutes()===0)try{renderCutList();}catch(e){}},60000);
