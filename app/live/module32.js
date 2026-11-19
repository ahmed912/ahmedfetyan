// ===== 19 Nov: READY. Nothing starts by itself: a round or break that ends waits at Ready, paused at its exact end. Waiting is never logged; logged time is never changed. =====
// ---- 1. War ----
function v32ready(w,at){w.segs=(w.segs||[]).concat([{start:w.segStart||w.start,end:at}]);w.pausedAt=at;w.ready=true;w.phase="focus";w.checkAt=null;w.phase0=warActive(w);}
function v32go(){const w=warGet();if(!w||!w.pausedAt)return;const now=Date.now(),wait=now-w.pausedAt;
  w.pausedMs=(w.pausedMs||0)+wait;w.readyMs=(w.readyMs||0)+wait;w.pausedAt=null;w.ready=false;w.segStart=now;w.phase="focus";w.phase0=warActive(w);w.checkAt=null;
  warPut(w);warSave(w);warRender();renderPopCards();v3wFab();}
wTick=function(){const dd=warDoc();if(dd&&dd.active&&dd.w&&warDead().includes(dd.w.start)){warPut(null);return;}
  const w=warGet();if(!w)return;const now=Date.now(),R=wRounds(w);let ch=false;
  if(w.pausedAt&&w.auto){w.segStart=w.pausedAt;w.checkAt=w.pausedAt;w.pausedAt=null;w.auto=false;w.ready=false;ch=true;}   // legacy auto pause: stays a check-in
  if(w.pausedAt){if(now-w.pausedAt>=W_IDLE*60000)warEnd(true);return;}                                                       // pause or Ready: 2 h ends the war, the wait is never logged
  if(w.checkAt&&now-w.checkAt>=W_IDLE*60000){warEnd(true);return;}                                                           // legacy check-in unanswered
  const inF=warActive(w)-(w.phase0||0);
  if(w.phase==="break"){if(now-w.breakAt>=R.b*60000){v32ready(w,w.breakAt+R.b*60000);ch=true;try{pNotify("Break is over. Ready when you are.","focus");}catch(e){}}}
  else if(R.f&&inF>=R.f*60000&&(R.b||w.skipB)){const at=now-(inF-R.f*60000);
    if(R.b&&!w.skipB){w.phase="break";w.breakAt=Math.min(now,at);try{pNotify(R.f+" minutes done. Take a "+R.b+" minute break.","break");}catch(e){}}
    else{v32ready(w,at);try{pNotify(R.f+" minutes done. Ready when you are.","focus");}catch(e){}}
    ch=true;}
  if(ch){warPut(w);warSave(w);warRender();v3wFab();renderPopCards();}};
{const _wp=warPause;warPause=function(){const w=warGet();if(w&&w.ready&&w.pausedAt)return v32go();return _wp.apply(this,arguments);};}
{const _wl=warLogged;warLogged=function(w){const v=_wl(w);if(!v20count())return v;const cur=(w.ready&&w.pausedAt&&!w.autoEnd)?Date.now()-w.pausedAt:0;return Math.max(warActive(w),v-(w.readyMs||0)-cur);};}
{const _wr=warRender;warRender=function(){const out=_wr.apply(this,arguments);try{const w=warGet();if(!w||!w.ready||!w.pausedAt)return out;
  const ph=document.querySelector("#warView .wr-ph");if(ph){ph.textContent="Ready";ph.classList.remove("brk");}
  const b=document.querySelector("#warView .wr-btns .wr-pause");if(b){b.textContent="Start";b.classList.add("wr-start");}}catch(e){console.warn(e);}return out;};}
{const _rp=renderPopCards;renderPopCards=function(){const out=_rp.apply(this,arguments);try{const w=warGet(),c=document.querySelector("#warCard .wr-cs");if(w&&w.ready&&w.pausedAt&&c)c.textContent="Ready · "+w.done.length+"/"+w.ids.length;}catch(e){}return out;};}
// ---- 2. Pomodoro ----
pOver=function(r){const endAt=r.startedAt+(r.pausedTotal||0)+r.durationMs;setPomo({...r,pausedAt:endAt,ready:true,overAt:null,overAs:null});
  const msg=r.five&&r.phase==="focus"?"5 minutes done. Keep going or stop here, both are fine.":r.phase==="focus"?"Focus round done. Ready when you are.":"Break over. Ready when you are.";
  try{pNotify(msg,r.phase==="focus"?"break":"focus");}catch(e){}};
async function v32pGo(){const r=pRun();if(!r||!r.ready)return;const now=Date.now(),wait=Math.max(0,now-(r.pausedAt||now));
  state.timers={...state.timers,pomo:{...r,ready:false,...(r.block?{block:{...r.block,end:r.block.end+wait}}:{})}};await pNext(true);}
{const _pr=pResume;pResume=function(){const r=pRun();if(r&&r.ready)return v32pGo();return _pr.apply(this,arguments);};}
{const _k=v3keep;v3keep=function(){const r=pRun();if(r&&r.ready&&r.pausedAt){state.timers={...state.timers,pomo:{...r,ready:false,pausedTotal:(r.pausedTotal||0)+(Date.now()-r.pausedAt),pausedAt:null}};}return _k.apply(this,arguments);};}
{const _rf=renderPomoFull;renderPomoFull=function(){const out=_rf.apply(this,arguments);try{const ov=document.getElementById("pomoFull"),r=pRun();if(!ov||!r||!r.ready)return out;
  ov.classList.add("ready");const ph=ov.querySelector(".pf-phase");if(ph)ph.textContent="Ready";
  ov.querySelectorAll(".pf-btns .pf-sec").forEach(x=>{if(x.textContent!=="Stop")x.remove();});
  ov.querySelectorAll(".pext,.pf-over,[data-pbrk]").forEach(x=>x.remove());
  const old=ov.querySelector(".pf-main"),go=el("button",{type:"button",class:"pf-main",onclick:()=>v32pGo()},pNextLabel(r));
  if(old)old.replaceWith(go);
  if(r.five)go.after(el("button",{type:"button",class:"pf-sec ck-keep",onclick:()=>v3keep()},"Keep going"));}catch(e){console.warn(e);}return out;};}
try{if(typeof PH_GLOSS!=="undefined")PH_GLOSS.push({id:"ready",g:"Focus",t:"Ready",w:"When a round or a break ends, the timer stops and waits at Ready. Nothing starts by itself and the wait is never logged. Press Start for the next round. 2 hours at Ready ends the war.",ex:"Break over at 10:10, Start at 10:25: 15 min not logged."});}catch(e){}
window.__u32={pStartFor:o=>pStartFor(o),pGo:()=>v32pGo(),warGo:()=>v32go()};
