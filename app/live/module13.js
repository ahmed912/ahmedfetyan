// ===== Round 13: plan vs actual, with personal bests. Review > Plan vs actual: work hours against the baseline and stretch, then per chunk type planned vs done, deep blocks completed, bests, sleep facts. Facts only, nothing on Today. =====
// Serves procrastination (a short honest read, no digging), overwhelm (4 labelled groups of at most 4 lines, one week at a time) and the firm line (a missed baseline is always shown first; a best never hides it).
let paOff=0;
function paWeekDays(w0){const out=[];for(let i=0;i<7;i++){const d=addDays(w0,i);if(!isFriday(d))out.push(d);}return out;}
function paStretchH(d){return Math.round((pomN(v3dayMin(d))+Number(chCfg().b3.h||0))*10)/10;}
const paKind=t=>chKind(t);
function paTasks(d){return tasksOn(d).filter(t=>!t.archived);}
function paBest(){const days=Object.keys(state.entries||{}).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)),today=iso(new Date()),byDay={},byWeek={};
  days.forEach(d=>{if(d>today)return;const m=v3workMin(d);if(m>0){byDay[d]=pomN(m);const w=capWeekStart(d);byWeek[w]=Math.round(((byWeek[w]||0)+pomN(m))*10)/10;}});
  let bd=null,bw=null;Object.entries(byDay).forEach(([d,h])=>{if(!bd||h>bd.h||(h===bd.h&&d>bd.d))bd={d,h};});
  Object.entries(byWeek).forEach(([w,h])=>{if(!bw||h>bw.h||(h===bw.h&&w>bw.w))bw={w,h};});
  const cur=capWeekStart(today),trend=[3,2,1,0].map(i=>{const w=addDays(cur,-7*i);return {w,h:byWeek[w]||0};});
  // best before today and before this week, to say a best is new
  let pd=0,pw=0;Object.entries(byDay).forEach(([d,h])=>{if(d<today&&h>pd)pd=h;});Object.entries(byWeek).forEach(([w,h])=>{if(w<cur&&h>pw)pw=h;});
  return {day:bd,week:bw,trend,prevDay:pd,prevWeek:pw,today:byDay[today]||0,thisWeek:byWeek[cur]||0};}
function paWeek(w0){const today=iso(new Date()),days=paWeekDays(w0),upto=days.filter(d=>d<=today),past=days.filter(d=>d<today),cfg=chCfg();
  let work=0,tgt=0,met=0,str=0;const missed=[];
  upto.forEach(d=>{const h=pomN(v3workMin(d)),t=pomN(v3dayMin(d));work+=h;tgt+=t;if(h>=t)met++;else if(d<today)missed.push(d);if(h>=paStretchH(d)&&paStretchH(d)>t)str++;});
  const planned={design:0,learn:0,shallow:0},done={design:0,learn:0,shallow:0};let bm=0,bd=0,ln=0,lmet=0,carried=0;
  upto.forEach(d=>{paTasks(d).forEach(t=>{const k=paKind(t),m=estMin(t);planned[k]+=m;if(t.done)done[k]+=m;});
    chunksOn(d).filter(c=>c.kind==="b1"||c.kind==="b2"||c.kind==="b3").forEach(c=>{const ts=c.tasks.filter(t=>!t.archived);if(!ts.length)return;bm++;if(ts.every(t=>t.done))bd++;});
    const l=learnDone(d);ln+=l;if(l>=cfg.learn.minMin)lmet++;
    const r=(state.rollover||{})[d];if(r&&!r.undone&&Array.isArray(r.carried))carried+=r.carried.reduce((a,c)=>a+(c.n||0),0);});
  const sleep=[];upto.forEach(d=>{const s=capSleepFact(d);if(s)sleep.push(fmt(d,{weekday:"short"})+": "+s);});
  return {w0,days:upto.length,past:past.length,work:Math.round(work*10)/10,tgt,met,str,missed,planned,done,blocks:bm,blocksDone:bd,learn:ln,learnTgt:upto.length*cfg.learn.minMin,learnMet:lmet,carried,sleep,stretchH:upto.length?paStretchH(upto[upto.length-1]):0};}
const paH=m=>(Math.round(m/6)/10)+" h";
function paLines(w){const mw=w.missed.length,L={work:[],chunks:[],best:[],sleep:[]};
  if(!w.days){L.work.push("No work days in this week yet.");return {L,B:paBest()};}
  L.work.push("Work: "+w.work+" of "+w.tgt+" h."+(w.work<w.tgt?" "+Math.round((w.tgt-w.work)*10)/10+" h short.":""));
  L.work.push("Baseline met on "+w.met+" of "+w.days+" days"+(mw?". Missed: "+w.missed.map(d=>fmt(d,{weekday:"short"})).join(", "):"")+".");
  L.work.push(w.str?"Stretch ("+w.stretchH+" h) reached on "+w.str+" day"+(w.str===1?"":"s")+".":"Stretch ("+w.stretchH+" h) not reached.");
  L.work.push("Learning logged: "+w.learn+" of "+w.learnTgt+" min. Minimum met on "+w.learnMet+" of "+w.days+" days.");
  L.chunks.push("Deep: planned "+paH(w.planned.design)+", done "+paH(w.done.design));
  L.chunks.push("Learning: planned "+paH(w.planned.learn)+", done "+paH(w.done.learn));
  L.chunks.push("Shallow: planned "+paH(w.planned.shallow)+", done "+paH(w.done.shallow));
  L.chunks.push("Deep blocks completed "+w.blocksDone+" of "+w.blocks+(w.carried?". Carried over: "+w.carried+" task"+(w.carried===1?"":"s")+".":"."));
  const B=paBest();
  if(B.day)L.best.push("Best day: "+B.day.h+" h ("+fmt(B.day.d,{weekday:"short",day:"numeric",month:"short"})+"). Best week: "+B.week.h+" h (week of "+fmt(B.week.w,{day:"numeric",month:"short"})+").");
  else L.best.push("No work hours logged yet.");
  L.best.push("Last 4 weeks: "+B.trend.map(x=>x.h).join(", ")+" h (last one is this week so far).");
  if(B.today>0&&B.today>B.prevDay&&B.prevDay>0)L.best.push("Today is your best day so far: "+B.today+" h, the previous best was "+B.prevDay+" h.");
  if(B.thisWeek>0&&B.thisWeek>B.prevWeek&&B.prevWeek>0)L.best.push("This week is your best so far: "+B.thisWeek+" h, the previous best was "+B.prevWeek+" h.");
  w.sleep.slice(0,4).forEach(s=>L.sleep.push(s));
  return {L,B};}
function paReview(){const pg=document.querySelector('.page[data-page="progress"]');if(!pg)return;let s=document.getElementById("paRev");
  if(pg.hidden){if(!s)return;}
  const cur=capWeekStart(iso(new Date())),w0=addDays(cur,7*paOff),w=paWeek(w0),{L}=paLines(w);
  if(!s){s=el("section",{class:"panel",id:"paRev","aria-label":"Plan vs actual"});const rev=document.getElementById("rlRev");if(rev)pg.insertBefore(s,rev);else pg.append(s);}
  const grp=(lab,lines,cls)=>lines.length?el("div",{class:"pa-grp"+(cls?" "+cls:"")},el("span",{class:"label",text:lab}),el("ul",{class:"ps-sh-list"},...lines.slice(0,4).map(t=>el("li",{class:"ps-sh-hrow"},el("span",{text:t}))))):null;
  rc(s,el("div",{class:"panel-head"},el("h2",{text:"Plan vs actual"}),el("span",{class:"hint",text:paOff?"Week of "+fmt(w0,{day:"numeric",month:"short"}):"This week so far"})),
    el("div",{class:"v3-row pa-nav"},el("button",{type:"button",class:"mini pa-prev","aria-label":"Earlier week",onclick:()=>{paOff--;paReview();}},"Earlier"),paOff?el("button",{type:"button",class:"mini pa-next","aria-label":"Later week",onclick:()=>{paOff++;paReview();}},"Later"):null),
    grp("Work and learning",L.work),grp("By chunk type",L.chunks),grp("Personal bests",L.best,"pa-best"),grp("Recovery",L.sleep));}
{const _r13=render;render=function(){_r13();try{paReview();}catch(e){console.warn(e);}};}
window.__pa={week:paWeek,lines:paLines,best:paBest,view:paReview};
