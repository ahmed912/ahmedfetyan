// ===== 14 Nov: BILLABLE TIME. An unanswered War check-in never removes time. Only a pause the user presses is excluded, and only when the setting is off. =====
// serves pillar: fear of overwhelm (tracked hours never vanish) and flexibility (one tap trims a missed check-in)
const v21r1=n=>Math.round(n*10)/10;
// ---- 1. the break-over check-in no longer pauses the war: it marks w.checkAt and the clock keeps running ----
wTick=function(){const dd=warDoc();if(dd&&dd.active&&dd.w&&warDead().includes(dd.w.start)){warPut(null);return;}
  const w=warGet();if(!w)return;const now=Date.now(),R=wRounds(w);let ch=false;
  if(w.pausedAt&&w.auto){w.segStart=w.pausedAt;w.checkAt=w.pausedAt;w.pausedAt=null;w.auto=false;ch=true;}          // an old auto pause becomes a check-in, its time counts
  if(w.pausedAt){if(now-w.pausedAt>=W_IDLE*60000)warEnd(true);return;}                                                  // a pause you pressed: ends by itself after 2 h, the pause stays out
  if(w.checkAt&&now-w.checkAt>=W_IDLE*60000){warEnd(true);return;}                                                      // unanswered 2 h: the session ends, all elapsed time is kept
  if(w.phase==="break"){if(now-w.breakAt>=R.b*60000){const at=w.breakAt+R.b*60000;w.phase="focus";w.phase0=warActive(w)-(now-at);if(!w.checkAt)w.checkAt=at;ch=true;try{pNotify("Break is over. Check in: still working?","focus");}catch(e){}}}
  else if(R.b&&warActive(w)-(w.phase0||0)>=R.f*60000){w.phase="break";w.breakAt=Math.min(now,now-(warActive(w)-(w.phase0||0)-R.f*60000));ch=true;try{pNotify(R.f+" minutes done. Take a "+R.b+" minute break.","break");}catch(e){}}
  if(ch){warPut(w);warSave(w);warRender();v3wFab();}};
function warAnswer(){const w=warGet();if(!w||!w.checkAt)return;w.checkAt=null;warPut(w);warSave(w,true);warRender();}
{const _wd=warDone;warDone=function(id){const w=warGet();if(w&&w.checkAt){w.checkAt=null;warPut(w);}_wd(id);};}
// a pause you press is the only pause: it is recorded as an event on the entry (w.pauses)
warPause=function(){const w=warGet();if(!w)return;const now=Date.now();w.checkAt=null;
  if(w.pausedAt){w.pausedMs=(w.pausedMs||0)+(now-w.pausedAt);w.pausedAt=null;w.segStart=now;w.phase="focus";w.phase0=warActive(w);w.auto=false;const p=(w.pauses||[]);if(p.length&&!p[p.length-1].end)p[p.length-1].end=now;w.pauses=p;}
  else{w.segs=(w.segs||[]).concat([{start:w.segStart||w.start,end:now}]);w.pausedAt=now;w.pauses=(w.pauses||[]).concat([{start:now}]);}
  warPut(w);warSave(w);warRender();renderPopCards();v3wFab();};
{const _wr=warRender;warRender=function(){_wr();try{const w=warGet(),box=document.querySelector("#warView .wr-btns");if(!w||!box||!w.checkAt||w.pausedAt)return;
  const ph=document.querySelector("#warView .wr-ph");if(ph)ph.textContent="Check in: still working?";
  if(!box.querySelector(".wr-here"))box.prepend(el("button",{type:"button",class:"wr-pause wr-here",onclick:warAnswer},"Still here"));}catch(e){console.warn(e);}};}

// ---- 2. the war entry: all elapsed time, a note when the check-in was missed, pause events, session minutes that add up exactly ----
warSave=function(w,foreign){w=w||warGet();if(!w)return;
  try{const d=iso(new Date(w.start)),mins=Math.floor((warLogged(w)-(w.cp||0))/60000);if(mins<1&&!w.savedMin)return;
    if(!w.eid)w.eid="war"+w.start.toString(36);const id=w.eid;
    if(w.noSave)return;
    const mine=v20all(d).find(x=>x.id===id);
    if(mine&&mine.deleted){w.noSave=true;if(!foreign)warPut(w);return;}
    if(mins<1)return;
    const items=itemsRaw(d).filter(x=>x.id!==id),now=Date.now(),end=w.pausedAt||now,cpAt=w.cpAt||0;
    let segs2;
    if(v20count())segs2=[{start:Math.max(w.start,cpAt),end,minutes:mins,paused:0}];
    else{const segs=(w.segs||[]).concat(w.pausedAt?[]:[{start:w.segStart||w.start,end:now}]).map(s=>({start:Math.max(s.start,cpAt),end:s.end})).filter(s=>s.end-s.start>=30000);
      if(!segs.length)segs.push({start:Math.max(w.start,cpAt),end});segs2=segs.map(s=>({start:s.start,end:s.end,minutes:Math.round((s.end-s.start)/60000),paused:0}));
      const sum=segs2.reduce((a,s)=>a+s.minutes,0);segs2[segs2.length-1].minutes=Math.max(0,segs2[segs2.length-1].minutes+(mins-sum));}   // the sessions add up to the entry minutes exactly
    const pz=(w.pauses||[]).map(p=>({start:p.start,end:p.end||now})).filter(p=>p.end-p.start>=1000);
    const pausedMin=!v20count()&&pz.length?Math.round(pz.reduce((a,p)=>a+(p.end-p.start),0)/60000):0;
    const miss=w.missedAt?{at:w.missedAt,minutes:Math.max(0,mins-Math.round((end-w.missedAt)/60000))}:null;
    const it={...(mine||{}),id,start:Math.max(w.start,cpAt),end,ref:"other",kind:"manual",label:(mine&&mine.label)||"War on "+w.label,cat:warCatOf(w),note:w.done.length+" of "+w.ids.length+" done"+(miss?" · check-in missed":""),minutes:mins,paused:pausedMin,pauses:pz,sessions:segs2};
    if(miss)it.missed=miss;else delete it.missed;
    items.push(it);
    const changed=w.savedMin!==mins||!w.present;w.savedMin=mins;w.present=true;
    const p=saveEntries(d,items);if(!foreign&&changed)warPut(w);return p;}catch(e){console.warn(e);}};
warEnd=function(auto){const w=warGet();if(!w)return warClose();
  if(auto===true){w.autoEnd=true;if(w.checkAt&&!w.pausedAt)w.missedAt=w.checkAt;}
  warSave(w,true);const mins=Math.floor(warLogged(w)/60000);
  toast((auto===true?(w.missedAt?"War ended, check-in missed. ":"War ended after 2 hours paused. "):"")+"War on "+w.label+": "+w.done.length+" of "+w.ids.length+" done, "+dur(mins)+" logged");warPut(null);warClose();};

// ---- 3. one tap in the entry sheet: trim a missed check-in back to the check-in ----
function v21trim(d,id){const orig=v20all(d).map(x=>({...x}));const items=v20all(d).map(x=>({...x}));const x=items.find(y=>y.id===id);if(!x||!x.missed)return;
  const at=x.missed.at,ss=sessionsOf(x).map(s=>({...s})).filter(s=>s.start<at).map(s=>s.end>at?{...s,end:at,minutes:v21r1((at-s.start)/60000)}:s);
  if(!ss.length){toast("Nothing before the check-in");return;}
  const sum=ss.reduce((a,s)=>a+Number(s.minutes||0),0),target=Number(x.missed.minutes)||sum;ss[ss.length-1].minutes=v21r1(Math.max(0,ss[ss.length-1].minutes+(target-sum)));
  x.sessions=ss;x.minutes=v21r1(ss.reduce((a,s)=>a+Number(s.minutes||0),0));x.end=at;delete x.missed;x.note=String(x.note||"").replace(" · check-in missed","")+" · trimmed to the check-in";
  saveEntries(d,items.filter(y=>!y.deleted));v3undoToast("Trimmed to the check-in: "+dur(x.minutes),()=>{saveEntries(d,orig.filter(y=>!y.deleted));});}
window.__v21trim=v21trim;window.__v21edit=(d,id)=>entryEdit(d,id);

// the same day seen from Today (day total), Time (day rows), Review (work hours) and the plain sum of the entries
function v21surf(d){const it=entriesOn(d).filter(x=>!isEstimate(x)&&x.kind!=="event"&&x.kind!=="break");
  return {today:workedMin(d),time:unionMin(it),review:v3workMin(d),sum:Math.round(it.reduce((a,x)=>a+Number(x.minutes||0),0)*10)/10};}
window.__u21={warAnswer,surf:v21surf};
