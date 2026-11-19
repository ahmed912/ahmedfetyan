// Round 62c: Ready. Nothing starts by itself; the wait is never logged (War with and without breaks, countPause on, 2 h at Ready, Pomodoro)
const {openp,run}=require('./h.js');const {load}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const today='2026-11-19';
const seed=(war,skip)=>{const d=load();d.settings=d.settings||{};d.settings.war=war;d.settings.warSkip={on:skip};d.timers=d.timers||{};d.timers.war={active:false,w:null};delete d.timers.pomo;
  d.tasks.r62a={title:'R62 Alpha',cat:'portfolio',date:today,done:false,order:-9};return JSON.stringify(d);};
const kit=pg=>({R:ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250)),
  FF:async ms=>{await pg.clock.fastForward(ms);await pg.clock.runFor(3000);await pg.waitForTimeout(300);},
  W:()=>pg.evaluate("window.__sbWar.get()"),
  E:()=>pg.evaluate(`JSON.stringify(window.__u20.itemsRaw('${today}').filter(x=>/^war/.test(x.id)))`).then(JSON.parse).then(a=>a[0]),
  start:async()=>{await pg.evaluate("document.getElementById('warCard').click()");await pg.clock.runFor(500);await pg.waitForTimeout(250);await pg.locator('.ps-sheet .wr-grid .wr-chip').first().click();await pg.clock.runFor(200);await pg.click('.ps-sheet .wr-go');await pg.clock.runFor(2000);await pg.waitForTimeout(250);
    await pg.evaluate("(()=>{const w=window.__sbWar.get();if(w.skipB===undefined){w.skipB=!!(window.__data.settings.warSkip||{}).on;window.__sbWar.put(w);}})()");}});   // works with or without part A
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  // A. skip breaks on
  {const pg=await openp(b,w,{when:today+'T09:00:00',real:seed({countPause:false},true)});const {R,FF,W,E,start}=kit(pg);
  ok('glossary has Ready',await pg.evaluate("__ph.gloss.some(x=>x.id==='ready')"));
  await start();await FF(50*60000);let wr=await W();
  ok('A round end: Ready at the exact end',wr.ready===true&&wr.phase==='focus'&&!wr.checkAt&&Math.abs(wr.pausedAt-wr.start-3000000)<2000,JSON.stringify({r:wr.ready,d:wr.pausedAt-wr.start}));
  ok('A screen: Ready, Start, 50:00',(await pg.textContent('#warView .wr-ph')).trim()==='Ready'&&(await pg.textContent('#warView .wr-start')).trim()==='Start'&&(await pg.textContent('#wrClock')).trim()==='50:00');
  ok('A logged 50',(await E()).minutes===50);
  const p0=wr.pausedAt;await FF(30*60000);wr=await W();
  ok('A waiting logs nothing',wr.ready===true&&wr.pausedAt===p0&&(await E()).minutes===50);
  await pg.click('#warView .wr-start');await R(1000);wr=await W();
  ok('A Start runs the next round',!wr.pausedAt&&!wr.ready&&wr.readyMs>=30*60000&&wr.readyMs<=31*60000,JSON.stringify({rm:wr.readyMs}));
  await R(5*60000);let m=(await E()).minutes;ok('A logs again',m>=54&&m<=56,String(m));
  await FF(45*60000);ok('A Ready again',(await W()).ready===true);
  await FF(125*60000);await R(4000);
  ok('A 2 h at Ready ends the war',/"active":false/.test(await pg.evaluate("JSON.stringify(window.__data.timers.war)")));
  const e=await E();ok('A entry = work only',e.minutes>=99&&e.minutes<=101&&e.paused===0&&!e.missed&&Math.abs(e.sessions.reduce((a,s)=>a+s.minutes,0)-e.minutes)<0.5,JSON.stringify({m:e.minutes,p:e.paused}));
  ok('A no errors',pg.errs.filter(x=>!x.includes('ERR_FAILED')).length===0,JSON.stringify(pg.errs.slice(0,3)));await pg.context().close();}
  // B. breaks on, paused-counts on
  {const pg=await openp(b,w,{when:today+'T09:00:00',real:seed({countPause:true},false)});const {R,FF,W,E,start}=kit(pg);
  await start();await FF(50*60000);let wr=await W();
  ok('B break starts by itself after the round',wr.phase==='break'&&!wr.pausedAt);
  await FF(10*60000);wr=await W();
  ok('B break over: Ready at exact break end, no check-in',wr.ready===true&&Math.abs(wr.pausedAt-wr.breakAt-600000)<1000&&!wr.checkAt&&(await pg.locator('.wr-here').count())===0,JSON.stringify({d:wr.pausedAt-wr.breakAt}));
  ok('B logged 60',(await E()).minutes===60);
  await FF(30*60000);ok('B Ready not logged with paused-counts on',(await E()).minutes===60,String((await E()).minutes));
  await pg.click('#warView .wr-start');await R(2*60000+500);let m=(await E()).minutes;ok('B logging resumes',m>=61&&m<=63,String(m));
  const PB='#warView .wr-pause:not(.wr-ext):not(.wr-rst):not(.wr-new):not(.wr-here)';
  await pg.locator(PB).first().click();await FF(10*60000);await pg.locator(PB).first().click();await R(1000);
  m=(await E()).minutes;ok('B a pressed pause still counts with the setting on',m>=71&&m<=74,String(m));
  await pg.click('#warView .wr-end');await R(300);await pg.click('.v3-conf .btn:not(.ghost)');await R(1500);
  m=(await E()).minutes;ok('B ended by hand, nothing removed',m>=71&&m<=74,String(m));
  ok('B no errors',pg.errs.filter(x=>!x.includes('ERR_FAILED')).length===0,JSON.stringify(pg.errs.slice(0,3)));await pg.context().close();}
  // C. Pomodoro
  {const pg=await openp(b,w,{when:today+'T09:00:00',real:seed({countPause:false},false)});const {R,FF}=kit(pg);
  const PM=()=>pg.evaluate("JSON.parse(JSON.stringify((window.__data.timers||{}).pomo||{}))");
  const PT=()=>pg.evaluate(`window.__u20.itemsRaw('${today}').filter(x=>x.kind==='pomo').reduce((a,x)=>a+Number(x.minutes||0),0)`);
  const t=s=>pg.textContent(s).then(x=>(x||'').trim());const p0=await PT();
  await pg.evaluate("__u32.pStartFor({what:'other',label:'R62 focus',minutes:120})");await R(600);
  await FF(50*60000);let pm=await PM();
  ok('C Ready at exact end, no extra time',pm.ready===true&&!pm.overAt&&Math.abs(pm.pausedAt-(pm.startedAt+(pm.pausedTotal||0)+3000000))<1000);
  ok('C screen: Ready, Start break, no chooser',(await t('#pomoFull .pf-phase'))==='Ready'&&(await t('#pomoFull .pf-main'))==='Start break'&&(await pg.locator('#pomoFull .pf-over').count())===0);
  const pa=pm.pausedAt;await FF(30*60000);pm=await PM();
  ok('C waiting logs nothing',pm.pausedAt===pa&&Math.abs((await PT())-p0)<0.01);
  await pg.click('#pomoFull .pf-main');await R(1000);pm=await PM();
  ok('C Start break: break runs, round 1 logged 50',pm.phase==='short'&&!pm.pausedAt&&Math.abs((await PT())-p0-50)<0.2,String((await PT())-p0));
  await FF(10*60000);pm=await PM();
  ok('C break over: Ready, Start focus',pm.ready===true&&pm.phase==='short'&&(await t('#pomoFull .pf-main'))==='Start focus');
  await FF(20*60000);ok('C waiting after break logs nothing',Math.abs((await PT())-p0-50)<0.2);
  await pg.click('#pomoFull .pf-main');await R(1000);pm=await PM();
  ok('C Start focus: round 2 runs',pm.phase==='focus'&&pm.round===2&&!pm.pausedAt);
  await pg.evaluate("__r2.pStop()");await R(500);
  ok('C no errors',pg.errs.filter(x=>!x.includes('ERR_FAILED')).length===0,JSON.stringify(pg.errs.slice(0,3)));await pg.context().close();}}});
