// ===== 19 Nov: WAR SKIP BREAKS setting. Off by default, synced in settings/warSkip, copied onto the war as w.skipB =====
const v30on=()=>!!(state.settings&&state.settings.warSkip&&state.settings.warSkip.on);
function v30set(on){const v={on:!!on,at:Date.now()};state.settings={...state.settings,warSkip:v};try{store.set("settings/warSkip",v);}catch(e){fail(e);}}
const V30_ON="Rounds of 50 min focus, no breaks. When a round ends the war waits at Ready until you press Start. Waiting is not logged. 2 hours waiting ends it.";
const V30_OFF="Rounds of 50 min focus and 10 min break. When a break ends the war waits at Ready until you press Start. Waiting is not logged. 2 hours waiting ends it.";
// the War setup sheet: add the toggle once per render of the sheet (the sheet re-renders itself, so a watcher re-adds it)
function v30inject(){const sh=document.querySelector(".ps-sheet");if(!sh||!sh.querySelector(".wr-go")||sh.querySelector(".wr-skip"))return;
  const on=v30on(),b=el("button",{type:"button",class:"wr-chip wr-skip"+(on?" on":""),"aria-pressed":String(on),onclick:()=>{v30set(!v30on());v30paint();}},el("b",{text:"Skip breaks"}));
  const hint=[...sh.querySelectorAll("p.hint")].find(p=>/^Rounds of 50/.test(p.textContent));
  const box=el("div",{class:"wr-opt"},b);
  if(hint){hint.classList.add("wr-hint");hint.textContent=on?V30_ON:V30_OFF;hint.before(box);}else sh.querySelector(".wr-go").before(box);}
function v30paint(){const on=v30on();document.querySelectorAll(".ps-sheet .wr-skip").forEach(b=>{b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on));});
  const h=document.querySelector(".ps-sheet .wr-hint");if(h)h.textContent=on?V30_ON:V30_OFF;}
new MutationObserver(()=>{try{v30inject();}catch(e){}}).observe(document.body,{childList:true,subtree:true});
// stamp the setting onto a war the first time it renders (new war or New session)
{const _wr=warRender;warRender=function(){try{const w=warGet();if(w&&w.skipB===undefined){w.skipB=v30on();warPut(w);}}catch(e){}return _wr.apply(this,arguments);};}
try{if(typeof PH_GLOSS!=="undefined")PH_GLOSS.push({id:"skipbreaks",g:"Focus",t:"Skip breaks",w:"A War setting, off by default, remembered on every device. On: rounds are focus only, with no break phase. Break now still works when you need one.",ex:"3h war: 50 min focus, Ready, Start, 50 min focus."});}catch(e){}
window.__u30={on:v30on,set:v30set};
