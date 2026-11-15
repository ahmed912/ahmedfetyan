// ===== Round 57: forgotten sessions. A Gym session left running ends 60 min after its start at most. A work day, War or work timer left running closes at 21:30 local unless it was closed before. Nothing is deleted and no time is dropped: the entry keeps the time up to the cap (billable), carries the note "auto-closed at 21:30", and a one-tap Edit corrects it. Runs on open and while open. Entry ids come from the session start, so two devices closing the same session write the same entry once. =====
const V57_CAPT="21:30",V57_GYM=60*60000,V57_K="sb-v57";
// the first 21:30 local after a start
function v57cap(startMs){const d=new Date(startMs);d.setHours(21,30,0,0);if(d.getTime()<=startMs)d.setDate(d.getDate()+1);return d.getTime();}
function v57notes(){try{return JSON.parse(localStorage.getItem(V57_K)||"[]");}catch(e){return [];}}
function v57put(a){try{localStorage.setItem(V57_K,JSON.stringify(a.slice(-6)));}catch(e){}}
function v57note(n){const a=v57notes().filter(x=>x.id!==n.id);a.push(n);v57put(a);v57bar();}
function v57bar(){let b=document.getElementById("v57n");const a=v57notes();
  if(!a.length){if(b)b.hidden=true;return;}
  const n=a[a.length-1];
  if(!b){b=el("div",{id:"v57n",class:"undo-bar",role:"status","aria-live":"polite"},el("span",{class:"ub-t"}),el("button",{type:"button",class:"ub-b v57-edit"},"Edit"),el("button",{type:"button",class:"ub-b v57-x","aria-label":"Dismiss"},"Close"));document.body.append(b);}
  b.querySelector(".ub-t").textContent=n.txt+(a.length>1?" (+"+(a.length-1)+" more)":"");
  b.querySelector(".v57-edit").onclick=()=>{b.hidden=true;v57put(v57notes().filter(x=>x.id!==n.id));v57edit(n);};
  b.querySelector(".v57-x").onclick=()=>{v57put(v57notes().filter(x=>x.id!==n.id));v57bar();};b.hidden=false;}
function v57edit(n){if(n.k==="gym"){v57gymEdit(n.sid);return;}if(n.k==="day"){try{loginHistory();}catch(e){}return;}try{entryEdit(n.d,n.id);}catch(e){console.warn(e);}}
// annotate a time entry: keeps its minutes, adds the note
function v57annotate(d,id){const items=(itemsRaw(d)||[]).map(x=>x.id===id&&!String(x.note||"").includes("auto-closed at "+V57_CAPT)?{...x,note:(x.note?x.note+" · ":"")+"auto-closed at "+V57_CAPT}:x);saveEntries(d,items);}
const v57r1=x=>Math.round(x*10)/10;
// ---- work day ----
function v57day(){if(!state.loaded||!state.loaded.logs)return;const now=Date.now(),from=addDays(iso(new Date()),-2);   // today and the last two days; older history is left as it is
  Object.keys(state.logs||{}).forEach(d=>{const L=state.logs[d];if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||d<from||!L||!L.workIn||L.workOut)return;const cap=v57cap(L.workIn);if(now<cap)return;
    setLogPatch(d,{workOut:cap,workNote:"auto-closed at "+V57_CAPT});
    v57note({id:"day"+d,k:"day",d,txt:"Work day "+fmt(d,{day:"numeric",month:"short"})+" closed at "+t12(V57_CAPT)+". Edit if you finished earlier."});});}
// ---- War ----
function v57war(){if(!state.loaded||!state.loaded.timers)return;const w=warGet();if(!w||!w.start)return;const cap=v57cap(w.start);if(Date.now()<cap)return;
  w.segs=(w.segs||[]).map(s=>({start:s.start,end:Math.min(s.end,cap)})).filter(s=>s.end>s.start);
  if(!w.pausedAt){w.segs.push({start:w.segStart||w.start,end:cap});w.pausedAt=cap;}else if(w.pausedAt>cap)w.pausedAt=cap;
  w.autoEnd=true;w.autoCap=V57_CAPT;const d=iso(new Date(w.start));
  warSave(w,true);if(w.eid)v57annotate(d,w.eid);
  const mins=Math.floor(warLogged(w)/60000);
  warPut(null);try{warClose();}catch(e){}
  v57note({id:w.eid||"war"+w.start,k:"war",d,txt:"War on "+w.label+" closed at "+t12(V57_CAPT)+": "+dur(mins)+" kept. Edit if you finished earlier."});}
// ---- block timer and task timer ----
function v57block(){if(!state.loaded||!state.loaded.timers)return;const t=activeTimer();if(!t||!t.startedAt)return;const cap=v57cap(t.startedAt);if(Date.now()<cap)return;
  const end=t.pausedAt&&t.pausedAt<cap?t.pausedAt:cap,minutes=Math.max(0,(end-t.startedAt-(t.pausedTotal||0))/60000),id="auto"+t.startedAt.toString(36),name=(BLOCKS.find(b=>b.id===t.block)||{}).name||"Block";
  setTimerDoc({block:null});if(minutes<1)return;
  if((itemsRaw(t.date)||[]).some(x=>x.id===id))return;
  addBlockMinutes(t.date,t.block,minutes);
  saveEntries(t.date,(itemsRaw(t.date)||[]).concat([{id,kind:"block",ref:t.block,label:name,note:"auto-closed at "+V57_CAPT,minutes:v57r1(minutes),sessions:[{start:t.startedAt,end,minutes:v57r1(minutes),paused:v57r1((t.pausedTotal||0)/60000)}]}]));
  v57note({id,k:"block",d:t.date,txt:name+" timer closed at "+t12(V57_CAPT)+": "+dur(minutes)+" kept. Edit if you finished earlier."});}
function v57task(){if(!state.loaded||!state.loaded.timers)return;const k=taskTimer();if(!k||!k.startedAt)return;const cap=v57cap(k.startedAt);if(Date.now()<cap)return;
  const end=k.pausedAt&&k.pausedAt<cap?k.pausedAt:cap;let ms=Math.max(0,end-k.startedAt-(k.pausedTotal||0));if(k.mode==="down")ms=Math.min(ms,k.durationMs||ms);const minutes=ms/60000,id="auto"+k.startedAt.toString(36);
  setTaskDoc({ref:null,project:null});if(minutes<1)return;
  if((itemsRaw(k.date)||[]).some(x=>x.id===id))return;
  const owner=k.src==="tasks"?null:state[k.src]&&state[k.src][k.ref],label=k.src==="tasks"?k.text:((owner?owner.name+": ":"")+k.text);
  saveEntries(k.date,(itemsRaw(k.date)||[]).concat([{id,kind:"task",ref:k.src==="projects"?k.ref:k.src+":"+k.ref,todoId:k.todoId,label,mode:k.mode,note:"auto-closed at "+V57_CAPT,minutes:v57r1(minutes),sessions:[{start:k.startedAt,end,minutes:v57r1(minutes),paused:v57r1((k.pausedTotal||0)/60000)}]}]));
  if(k.src==="tasks"){const t=state.tasks[k.ref];if(t){const spent=Math.round(((t.spent||0)+minutes)*10)/10;state.tasks[k.ref]={...t,spent};try{store.update("tasks/"+k.ref,{spent});}catch(e){}}}
  v57note({id,k:"task",d:k.date,txt:label+" timer closed at "+t12(V57_CAPT)+": "+dur(minutes)+" kept. Edit if you finished earlier."});}
// ---- Gym: 60 minutes at most ----
async function v57gym(){if(!state.loaded||!state.loaded.gym)return;const a=gActive();if(!a)return;const cap=a.startedAt+V57_GYM;if(Date.now()<cap)return;
  const d=a.day,sid="s_"+a.id;
  if(!gDocs()[sid]){
    const items=GYM[d].sl.map((sl,i)=>{const alt=(a.alts&&a.alts[i]!=null)?a.alts[i]:0,e=sl.ex[alt];const sets=[];for(let k=0;k<sl.s;k++){const v=a.sets[i+"-"+k];if(v&&v.done){const num=z=>z!=null&&z!==""?Number(z):null;const x=(v.x||[]).map(p=>({w:num(p.w),r:num(p.r)})).filter(p=>p.w!=null||p.r!=null);sets.push({w:num(v.w),r:num(v.r),at:v.at,...(x.length?{x}:{})});}}
      return {slot:i,m:sl.m,ar:e.ar,en:e.en,alt,target:sl.s+" × "+sl.r,sets};});
    const done=items.reduce((n,x)=>n+x.sets.length,0);
    await gSet(sid,{day:d,title:GYM[d].f,start:a.startedAt,end:cap,minutes:60,date:iso(new Date(a.startedAt)),items,sets:done,planned:GYM[d].sl.reduce((n,s)=>n+s.s,0),skipped:Object.keys(a.skip||{}).length,overMin:0,auto:true,note:"auto-ended after 60 min"});
    const dd=iso(new Date(a.startedAt));state.logs[dd]={...log(dd),date:dd,gym:true};queueSave(dd,300);}
  await gSet("active",{});gWakeLock(false);
  v57note({id:sid,k:"gym",sid:sid.slice(2),d:iso(new Date(a.startedAt)),txt:"Gym session ended after 60 min. Edit if it was shorter."});}
function v57gymEdit(id){const s=gDocs()["s_"+id];if(!s)return;psOpen("Edit workout",re=>{const inp=el("input",{type:"number",class:"v3-in","aria-label":"Minutes",min:"1",max:"600",value:String(Math.round(s.minutes||0))});
  inp.onchange=()=>{const m=Math.max(1,Math.min(600,Number(inp.value)||0));if(!m)return;gSet("s_"+id,{...gDocs()["s_"+id],minutes:m,end:s.start+m*60000,auto:false,note:"auto-ended after 60 min, corrected to "+m+" min"});toast("Workout set to "+m+" min");setTimeout(re,80);};
  return [el("p",{class:"ps-sh-sum",text:(GYM[s.day]?GYM[s.day].t+": ":"")+(s.title||"")}),el("label",{class:"field"},el("span",{class:"label",text:"Minutes"}),inp),el("p",{class:"hint",text:s.note||""})];});}
// the history row of an auto-ended workout says so and offers Edit
{const _gh=gHistory;gHistory=function(){const r=_gh();try{const ss=gSessions(),ul=r[0];if(ul&&ul.children)[...ul.children].forEach((li,i)=>{const s=ss[i];if(!s||!s.auto)return;li.append(el("div",{class:"g-auto hint"},el("span",{text:"اتقفل تلقائي بعد ٦٠ دقيقة "}),el("button",{type:"button",class:"mini v57-gedit",onclick:()=>v57gymEdit(s.id.slice(2))},"تعديل")));});}catch(e){console.warn(e);}return r;};}
// the log-in history row shows the note
function v57all(){try{v57day();}catch(e){console.warn(e);}try{v57war();}catch(e){console.warn(e);}try{v57block();}catch(e){console.warn(e);}try{v57task();}catch(e){console.warn(e);}try{v57gym();}catch(e){console.warn(e);}}
setTimeout(()=>{v57all();v57bar();},5000);setInterval(v57all,30000);
window.__u57={run:v57all,cap:v57cap};
