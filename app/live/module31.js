// ===== 19 Nov: SKIP BREAK. War: the break button reads Skip break (same action). Pomodoro: at Ready after a focus round, Skip break starts the next focus at once =====
{const _wr=warRender;warRender=function(){const out=_wr.apply(this,arguments);try{document.querySelectorAll("#warView .wr-btns button").forEach(b=>{if(b.textContent==="Back to focus")b.textContent="Skip break";});}catch(e){}return out;};}
async function v31pSkip(){const r=pRun();if(!r)return;
  if(r.ready){const now=Date.now(),wait=Math.max(0,now-(r.pausedAt||now));state.timers={...state.timers,pomo:{...r,ready:false,...(r.block?{block:{...r.block,end:r.block.end+wait}}:{})}};}
  await pNext(true);const r2=pRun();if(r2&&r2.phase&&r2.phase!=="focus")await pNext(false);}
{const _rf=renderPomoFull;renderPomoFull=function(){const out=_rf.apply(this,arguments);try{const ov=document.getElementById("pomoFull"),r=pRun();if(!ov||!r||!r.ready||r.five||r.phase!=="focus")return out;
  if(pNextLabel(r)!=="Start break"||ov.querySelector(".pf-skip"))return out;const bt=ov.querySelector(".pf-btns");
  if(bt)bt.append(el("button",{type:"button",class:"pf-skip",onclick:()=>v31pSkip()},"Skip break"));}catch(e){console.warn(e);}return out;};}
window.__u31={pSkip:()=>v31pSkip()};
