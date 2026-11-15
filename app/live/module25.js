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
