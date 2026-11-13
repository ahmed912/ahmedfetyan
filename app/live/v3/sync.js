const {openp,shot,run}=require('./h.js');
const html=process.argv[2]||'test.html';
run(async b=>{
  // A: ending a war must stay ended even when the server applies writes out of order
  const pg=await openp(b,390,{reorder:true,html});const W=ms=>pg.waitForTimeout(ms);
  await pg.click('#warCard');await pg.clock.runFor(500);await W(500);
  await pg.locator('.wr-grid .wr-chip').first().click();await pg.click('.wr-go');await pg.clock.runFor(1000);await W(500);
  console.log('war started, active:',await pg.evaluate("!!window.__sbWar.get()"));
  await pg.clock.runFor(185000);await W(300);
  const snapshot=await pg.evaluate("JSON.stringify(window.__sbWar.get())");
  await pg.click('.wr-end');await pg.clock.runFor(500);await W(300);await pg.click('.v3-conf .btn:not(.ghost)');await pg.clock.runFor(3000);await W(500);
  const srv=await pg.evaluate("JSON.stringify({active:window.__data.timers.war.active,hasW:!!window.__data.timers.war.w})");
  console.log('A server doc after End war:',srv,'| local view:',await pg.evaluate("!!window.__sbWar.get()"),'|',srv.includes('"active":false')?'PASS ended':'FAIL still active on server');
  // B: a second device with a stale local copy must not bring it back
  await pg.evaluate("sessionStorage.setItem('__mockdata',JSON.stringify(window.__data))");
  await pg.evaluate(`localStorage.setItem('sb-war',${JSON.stringify(JSON.stringify(JSON.parse(snapshot)))})`);
  await pg.reload();await pg.clock.install({time:new Date('2026-11-09T11:10:00')}).catch(()=>{});await pg.clock.runFor(8000);await W(500);
  const srv2=await pg.evaluate("JSON.stringify({active:window.__data.timers&&window.__data.timers.war&&window.__data.timers.war.active,war:window.__data.timers&&window.__data.timers.war?{a:window.__data.timers.war.active,w:!!window.__data.timers.war.w,ended:window.__data.timers.war.ended}:'missing',timersKeys:Object.keys(window.__data.timers||{})})");
  console.log('B after reload with stale local copy:',srv2,'| local view:',await pg.evaluate("!!window.__sbWar.get()"),'|',srv2.includes('true')?'FAIL war came back':'PASS stayed ended');
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,4));
});
