// ===== 21 Nov: PAUSE THEN RESUME CONTINUES. Resuming a War that you paused keeps the round where it was (the remaining time); it never starts the round again. Logged time is not touched. =====
// cause: warPause (module21) reset w.phase0 to the active time on resume, which restarts the round clock (and a break became a new focus round)
{const _wp=warPause;warPause=function(){const w=warGet();
  if(!w||!w.pausedAt||w.ready||w.auto)return _wp.apply(this,arguments);          // a pause, Ready and the old auto pause keep their own paths
  const ph=w.phase,p0=w.phase0,pAt=w.pausedAt,bAt=w.breakAt,now=Date.now();
  const out=_wp.apply(this,arguments);
  try{const x=warGet();if(x&&!x.pausedAt){x.phase=ph;x.phase0=p0;if(ph==="break"&&bAt)x.breakAt=bAt+(now-pAt);warPut(x);warRender();renderPopCards();v3wFab();}}catch(e){console.warn(e);}
  return out;};}
window.__u34={};
