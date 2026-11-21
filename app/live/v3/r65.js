// Round 65: Pause then Resume continues from the remaining time (Pomodoro timer and War); logged time is never reset; also after a reload while paused
const {openp,run}=require('./h.js');const {load,reloadKeep}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const today='2026-11-19';
const seed=(count)=>{const d=load();d.settings=d.settings||{};d.settings.war={countPause:!!count};d.settings.warSkip={on:false};d.timers=d.timers||{};d.timers.war={active:false,w:null};delete d.timers.pomo;
  d.tasks.r62a={title:'R62 Alpha',cat:'portfolio',date:today,done:false,order:-9};return JSON.stringify(d);};
const kit=pg=>({R:ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250)),
  FF:async ms=>{await pg.clock.fastForward(ms);await pg.clock.runFor(3000);await pg.waitForTimeout(300);},
  W:()=>pg.evaluate("JSON.parse(JSON.stringify(window.__sbWar.get()))"),
  PM:()=>pg.evaluate("JSON.parse(JSON.stringify((window.__data.timers||{}).pomo||{}))"),
  mins:()=>pg.evaluate(`window.__u21.surf('${today}').today`)});
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  // ---- Pomodoro ----
  for(const reload of [false,true]){
  {const pg=await openp(b,w,{when:today+'T09:00:00',sb:true,real:seed(false)});const k=kit(pg);
  await pg.evaluate("__u32.pStartFor({what:'other',label:'R65 focus',minutes:25})");await k.R(600);
  await k.FF(10*60000);
  const before=await pg.textContent('#pomoFull .pf-clock');
  await pg.click('#pomoFull .pf-main');await k.R(500);   // Pause
  let p=await k.PM();ok('Pomodoro paused'+(reload?' (reload)':''),!!p.pausedAt);
  await k.FF(5*60000);
  if(reload){await reloadKeep(pg);await pg.evaluate("document.getElementById('pomoFab').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}))");await k.R(500);}
  const paused=await pg.textContent('#pomoFull .pf-clock');
  ok('Pomodoro clock frozen while paused: '+before+' -> '+paused,before===paused||Math.abs(toS(before)-toS(paused))<=2);
  await pg.click('#pomoFull .pf-main');await k.R(1200);   // Resume
  p=await k.PM();
  const after=await pg.textContent('#pomoFull .pf-clock');
  ok('Pomodoro resume continues (no restart): '+after,!!p.startedAt&&!p.pausedAt&&toS(after)<=toS(before)+2&&toS(after)>toS(before)-10&&toS(after)<20*60,JSON.stringify({s:p.startedAt,pt:p.pausedTotal,d:p.durationMs}));
  ok('Pomodoro pausedTotal about 5 min',(p.pausedTotal||0)>=290000&&(p.pausedTotal||0)<=320000,String(p.pausedTotal));
  await k.FF(5*60000);const m=await k.mins();
  ok('Pomodoro logged elapsed about 15 min, not reset: '+m,m>=14&&m<=16);
  ok('no errors',pg.errs.filter(x=>!x.includes('ERR_FAILED')).length===0,JSON.stringify(pg.errs.slice(0,3)));
  await pg.context().close();}}
  // ---- War (both pause settings) ----
  for(const count of [false,true])for(const reload of [false,true]){
  const pg=await openp(b,w,{when:today+'T09:00:00',sb:true,real:seed(count)});const k=kit(pg);const tag=` (count=${count}${reload?', reload':''})`;
  await pg.evaluate("document.getElementById('warCard').click()");await k.R(500);await pg.locator('.ps-sheet .wr-grid .wr-chip').first().click();await k.R(200);await pg.click('.ps-sheet .wr-go');await k.R(2000);
  await k.FF(10*60000);
  const left0=await pg.textContent('#wrClock').then(toS);
  await pg.locator('#warView .wr-btns button:has-text("Pause")').first().click();await k.R(500);
  let w0=await k.W();ok('War paused'+tag,!!w0.pausedAt);
  await k.FF(5*60000);
  if(reload){await reloadKeep(pg);await k.R(1500);await pg.evaluate("document.getElementById('warCard').click()");await k.R(800);}
  w0=await k.W();ok('War still paused after wait'+tag,!!w0&&!!w0.pausedAt);
  const startBefore=w0.start;
  await pg.locator('#warView .wr-btns button:has-text("Resume")').first().click();await k.R(1200);
  const w1=await k.W(),left1=await pg.textContent('#wrClock').then(toS);
  ok('War resumed, same start, not reset'+tag,w1.start===startBefore&&!w1.pausedAt&&w1.phase==='focus'&&!w1.ready,JSON.stringify({ph:w1.phase,r:w1.ready,pm:w1.pausedMs}));
  ok('War remaining continues: '+left0+' -> '+left1+' min'+tag,left1<=left0+2&&left1>left0-90,String(left1));
  await k.FF(5*60000);const m=await k.mins();
  ok('War logged elapsed >= 15 min (not reset): '+m+tag,count?m>=19&&m<=21:m>=14&&m<=16);
  const lt=await pg.evaluate("Math.round(window.__u20.warLogged(window.__sbWar.get())/60000)");ok('warLogged consistent'+tag,count?lt>=19:lt>=14,String(lt));
  ok('no errors'+tag,pg.errs.filter(x=>!x.includes('ERR_FAILED')).length===0,JSON.stringify(pg.errs.slice(0,3)));
  await pg.context().close();}
}});
function toS(t){const a=t.trim().split(':').map(Number);return a.length===3?a[0]*3600+a[1]*60+a[2]:a[0]*60+a[1];}
