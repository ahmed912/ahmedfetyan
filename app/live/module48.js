// module48 retire: hide and stop features he does not use. Data and logged time are never touched. Settings > Show retired features (per device, off by default).
function retShow(){try{return localStorage.getItem("ret-show")==="on";}catch(e){return false;}}
// RETIRE list. Kept by Ahmed (not retired): "habits","media","prayer". Retired on his yes: "rollover","review" (old review views only, Roadmap tab stays).
function retList(){return ["fellow","brain","sleep","guard","reminders","game","reflect","wins","health","learning","inquiries","linkedin","oldtoday","rollover","review"];}
const RET_ALL=["fellow","brain","sleep","guard","reminders","game","reflect","wins","health","learning","inquiries","linkedin","oldtoday","habits","media","review","rollover","prayer"];
function retIs(k){return !retShow()&&retList().includes(k);}
function retOff(k,tag){if(!retIs(k))return false;const c=window.__retSkip=window.__retSkip||{},t=tag||k;c[t]=(c[t]||0)+1;return true;}
function retReload(){if(window.__retNoReload){window.__retReloaded=(window.__retReloaded||0)+1;return;}location.reload();}
try{if(retIs("fellow")){renderFellow=function(){};}}catch(e){console.warn(e);}
try{if(retIs("brain")){renderBrain=function(){};renderBrainList=function(){};}}catch(e){console.warn(e);}
try{if(retIs("sleep")){renderSleep=function(){};}}catch(e){console.warn(e);}
try{if(retIs("guard")){renderGuard=function(){};}}catch(e){console.warn(e);}
try{if(retIs("reminders")){renderReminders=function(){};}}catch(e){console.warn(e);}
try{if(retIs("game")){renderGame=function(){};}}catch(e){console.warn(e);}
try{if(retIs("reflect")){renderRefl=function(){};renderInsights=function(){};renderVision=function(){};}}catch(e){console.warn(e);}
try{if(retIs("wins")){renderWins=function(){};}}catch(e){console.warn(e);}
try{if(retIs("health")){renderBWHealth=function(){};}}catch(e){console.warn(e);}
try{if(retIs("linkedin")){renderLinkedIn=function(){};}}catch(e){console.warn(e);}
try{if(retIs("habits")){renderHabits=function(){};}}catch(e){console.warn(e);}
try{if(retIs("media")){renderSounds2=function(){};}}catch(e){console.warn(e);}
try{if(retIs("review")){renderHeat=function(){};paReview=function(){};rlReview=function(){};}}catch(e){console.warn(e);}
try{if(retIs("rollover")){rlAuto=function(){};}}catch(e){console.warn(e);}
try{if(retIs("prayer")){renderPrayer=function(){};renderSalah=function(){};}}catch(e){console.warn(e);}
try{const _c=renderCutList;renderCutList=function(){if(retIs("oldtoday")&&rmTodayOn())return;return _c.apply(this,arguments);};}catch(e){console.warn(e);}
try{if(retIs("review")){const rv=HUBS.find(h=>h.id==="review");if(rv){const i=rv.pages.findIndex(x=>x[0]==="progress");if(i>=0)rv.pages.splice(i,1);}buildNav();}}catch(e){console.warn(e);}
{const _sp=setPage;setPage=function(p,...a){if(p==="progress"&&retIs("review"))p="roadmap";else if(p==="sounds"&&retIs("media"))p="today";return _sp(p,...a);};}
const RET_CARD={"Habits":"habits","Intentional media":"media"};
function retRow(){
  const rows=document.querySelector('.page[data-page="settings"] .set-rows');if(!rows)return;
  let btn=document.getElementById("retBtn");
  if(!btn){btn=el("button",{type:"button",class:"btn ghost",id:"retBtn"},"Off");
    btn.onclick=()=>{const on=retShow();try{if(on)localStorage.removeItem("ret-show");else localStorage.setItem("ret-show","on");}catch(e){}
      btn.textContent=on?"Off":"On";toast(on?"Retired features hidden":"Retired features shown");
      if(typeof gActive==="function"&&gActive()){toast("Saved. Applies next time you open the app.");return;}
      try{store.flush&&store.flush();}catch(e){}setTimeout(retReload,600);};
    rows.append(el("div",{class:"set-row",id:"retRow"},el("div",{},el("b",{text:"Show retired features"}),el("span",{class:"hint",text:"Off hides and stops features you do not use. Your data and logged time stay. Changing it reloads the app."})),btn));}
  btn.textContent=retShow()?"On":"Off";}
{const _r=render;render=function(){try{window.__v37off=retIs("oldtoday")&&rmTodayOn();}catch(e){}_r();try{
  RET_ALL.forEach(k=>document.body.classList.toggle("ret-"+k,retIs(k)));
  document.querySelectorAll("#popCards .pop-card").forEach(b=>{const t=b.querySelector(".fc-t"),k=t&&RET_CARD[t.textContent];b.hidden=!!(k&&retIs(k));});
  retRow();}catch(e){console.warn(e);}};}
window.__ret={is:k=>retIs(k),list:()=>retList(),show:()=>retShow()};
