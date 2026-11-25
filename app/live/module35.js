// r35 gym data: daily tick docs x_YYYY-MM-DD, 5-day routine, weekly derived view
const G5_ANCHOR="2026-11-21";
function g5Parity(d){const n=Math.round((parse(weekStart(d))-parse(G5_ANCHOR))/864e5/7);return ((n%2)+2)%2;}
function g5Map(d){return [0,1,g5Parity(d)?5:2,3,4];}
function g5PosOf(idx){return idx===0?0:idx===1?1:(idx===2||idx===5)?2:idx===3?3:idx===4?4:-1;}
function g5Doc(d){const x=gDocs()["x_"+d];return x&&!x.deleted?x:null;}
function g5N(x){return x&&x.ex?Object.keys(x.ex).length:0;}
{const _gs=gSessions;let mk=null,mv=null;
 gSessions=function(){if(mk===state.gym&&mv)return mv.slice();const base=_gs();const dates=new Set(base.map(s=>s.date));
  const syn=Object.entries(gDocs()).filter(([k,v])=>k.startsWith("x_")&&v&&!v.deleted&&v.ex&&Object.keys(v.ex).length&&!dates.has(v.date)&&GYM[v.day]&&GYM[v.day].sl)
   .map(([k,v])=>{const sl=GYM[v.day].sl,t0=v.at||parse(v.date).getTime()+18*3600000;
     return {id:k,day:v.day,title:v.title||GYM[v.day].f,start:t0,end:t0,minutes:0,date:v.date,
       items:sl.map((s,i)=>{const e=v.ex[i];return e?{slot:i,m:s.m,ar:e.ar,en:e.en,alt:e.alt||0,target:"",sets:[]}:null;}).filter(Boolean),
       sets:Object.keys(v.ex).length,planned:sl.length,skipped:0,overMin:0,ticks:true};});
  mv=base.concat(syn).sort((a,b)=>b.start-a.start);mk=state.gym;return mv.slice();};}
function g5Week(d){const ws=weekStart(d),we=addDays(ws,6),ss=gSessions().filter(s=>s.date>=ws&&s.date<=we),m=g5Map(d);
  return [0,1,2,3,4].map(pos=>{const rec=ss.find(s=>g5PosOf(s.day)===pos)||null;
    return {pos,idx:m[pos],rec,state:!rec?"none":!rec.ticks?"done":(rec.sets>=rec.planned?"done":"part")};});}
function g5Next(d){const x=g5Doc(d);if(g5N(x))return g5PosOf(x.day);const w=g5Week(d);const i=w.findIndex(o=>o.state!=="done");return i<0?0:i;}
{const _dd=gDefaultDay;gDefaultDay=function(){if(gActive())return _dd();const t=iso(new Date());return g5Map(t)[g5Next(t)];};}
{const r=GYM_RULES.find(x=>x[0]==="تأهيل الركبة");if(r)r[1]=r[1].replace("في يومي الرجلين (3 و6)","في يوم الرجلين (اليوم 3)");}
let g5Pend=null,g5T=null;window.__g5quiet=0;
async function g5Flush(){clearTimeout(g5T);g5T=null;const p=g5Pend;g5Pend=null;if(!p)return;try{await store.set("gym/"+p.k,p.doc);}catch(e){fail(e);}}
function g5Tick(pos,slot){const d=iso(new Date()),k="x_"+d,idx=g5Map(d)[pos],cur=g5Doc(d);
  if(g5N(cur)&&cur.day!==idx){toast("النهارده متسجل يوم "+(g5PosOf(cur.day)+1));return null;}
  const ex={...((cur&&cur.ex)||{})},key=String(slot),alt=gAltIdx(idx,slot),e=GYM[idx].sl[slot].ex[alt];
  if(ex[key])delete ex[key];else ex[key]={at:Date.now(),ar:e.ar,en:e.en,alt};
  const doc={...(cur||{}),v:1,date:d,day:idx,title:GYM[idx].f,ex,at:(cur&&cur.at)||Date.now(),upd:Date.now()};
  state.gym={...state.gym,[k]:doc};g5Pend={k,doc};window.__g5quiet=Date.now()+1500;clearTimeout(g5T);g5T=setTimeout(g5Flush,400);
  const L=log(d),has=Object.keys(ex).length>0,hasS=gSessions().some(s=>s.date===d&&!s.ticks);
  if(has&&!L.gym){state.logs[d]={...L,date:d,gym:true};queueSave(d,300);}else if(!has&&L.gym&&!hasS){state.logs[d]={...L,date:d,gym:false};queueSave(d,300);}
  try{navigator.vibrate&&navigator.vibrate(20);}catch(_){} return doc;}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")g5Flush();});addEventListener("pagehide",()=>g5Flush());
{const _gd=gDelSession;gDelSession=async function(id){if(String(id).startsWith("x_")){const x=gDocs()[id];if(!x)return;await gSet(id,{...x,deleted:Date.now()});toast("اتمسحت");return;}return _gd(id);};}
{const _gm=gymMini;gymMini=function(){const n=_gm();try{const a=gActive(),d=a?a.day:gDefaultDay(),b=n.querySelector(".db-gym-t b");if(b&&GYM[d])b.textContent="\u{1F3CB} اليوم "+(g5PosOf(d)+1)+": "+GYM[d].f;
  const s=gSessions().find(x=>x.date===sel),c=n.querySelector(".chip.good");if(s&&s.ticks&&c)c.textContent="Done: "+s.sets+" of "+s.planned+" exercises";}catch(e){console.warn(e);}return n;};}
window.__g5={map:g5Map,parity:g5Parity,posOf:g5PosOf,week:d=>g5Week(d).map(o=>({pos:o.pos,idx:o.idx,state:o.state})),next:g5Next,def:()=>gDefaultDay(),tick:g5Tick,flush:g5Flush,del:id=>gDelSession(id),sessions:()=>gSessions().map(s=>({id:s.id,date:s.date,day:s.day,ticks:!!s.ticks,sets:s.sets})),mini:()=>gymMini().textContent,open:()=>setPage("gym"),tab:t=>{gTab=t;renderGym();}};
