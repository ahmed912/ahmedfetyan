// Round 45: War keeps the Focus controls (+10 min, Restart round, New session) and the "pause counts toward focus time" setting (default off)
const {openp,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const today='2026-11-09';
async function war(pg,W,pauseMin){await pg.click('#warCard');await pg.clock.runFor(500);await W(300);
  await pg.locator('.wr-grid .wr-chip').first().click();await pg.click('.wr-go');await pg.clock.runFor(1000);await W(300);return;}
run(async b=>{
  const pg=await openp(b,390,{sb:true});const W=ms=>pg.waitForTimeout(ms);
  const set=await pg.evaluate("(window.__data.settings&&window.__data.settings.war)||null");
  await pg.evaluate("__r2.setPage('settings')").catch(()=>{});await pg.clock.runFor(800);await W(300);
  ok('setting row exists, default off',(await pg.locator('#warPauseRow').count())===1&&set===null&&/Off/.test(await pg.locator('#warPauseSum').textContent()));
  await pg.evaluate("__r2.setPage('today')");await pg.clock.runFor(600);await W(200);
  await war(pg,W);
  ok('+10 min extends the block',await (async()=>{const d0=await pg.evaluate("window.__sbWar.get().dur");await pg.click('.wr-ext');await pg.clock.runFor(500);return (await pg.evaluate("window.__sbWar.get().dur"))===d0+10;})());
  ok('Restart round is there and restarts the round clock',await (async()=>{await pg.clock.runFor(120000);const p0=await pg.evaluate("window.__sbWar.get().phase0");await pg.click('.wr-rst');await pg.clock.runFor(500);return (await pg.evaluate("window.__sbWar.get().phase0"))>p0;})());
  // pause off: 4 min work, 10 min paused, 4 min work -> about 8 min logged
  await pg.click('.wr-pause:not(.wr-ext):not(.wr-rst):not(.wr-new)');await pg.clock.fastForward(10*60000);await pg.click('.wr-pause:not(.wr-ext):not(.wr-rst):not(.wr-new)');await pg.clock.runFor(4*60000);await W(300);
  const e1=await pg.evaluate(`JSON.stringify(window.__u20.itemsRaw('${today}').filter(x=>/^war/.test(x.id)).map(x=>x.minutes))`);
  const m1=JSON.parse(e1)[0];ok('pause off: paused time is left out',m1>=4&&m1<=8,e1);
  const s0=await pg.evaluate("window.__sbWar.get().start");
  await pg.click('.wr-new');await pg.clock.runFor(300);await W(200);await pg.click('.v3-conf .btn:not(.ghost)');await pg.clock.runFor(1500);await W(300);
  const s1=await pg.evaluate("window.__sbWar.get()&&window.__sbWar.get().start");
  ok('New session starts a fresh war and keeps the old entry',s1&&s1!==s0&&JSON.parse(await pg.evaluate(`JSON.stringify(window.__u20.itemsRaw('${today}').filter(x=>/^war/.test(x.id)).length)`))===1);
  // setting on: paused time counts
  await pg.click('.wr-end');await pg.clock.runFor(300);await W(200);await pg.click('.v3-conf .btn:not(.ghost)');await pg.clock.runFor(1500);await W(300);
  await pg.evaluate("__r2.setPage('settings')");await pg.clock.runFor(800);await W(200);await pg.click('#warPauseBtn');await pg.clock.runFor(800);await W(200);
  ok('turning it on saves the setting',await pg.evaluate("!!(window.__data.settings.war&&window.__data.settings.war.countPause)"));
  await pg.evaluate("__r2.setPage('today')");await pg.clock.runFor(600);await W(200);
  await war(pg,W);await pg.clock.runFor(3*60000);await pg.click('.wr-pause:not(.wr-ext):not(.wr-rst):not(.wr-new)');await pg.clock.fastForward(10*60000);await pg.click('.wr-pause:not(.wr-ext):not(.wr-rst):not(.wr-new)');await pg.clock.runFor(3*60000);await W(300);
  const e2=JSON.parse(await pg.evaluate(`JSON.stringify(window.__u20.itemsRaw('${today}').filter(x=>/^war/.test(x.id)).map(x=>x.minutes))`));
  ok('pause on: paused time counts (about 16 min)',e2.some(m=>m>=14&&m<=18),JSON.stringify(e2));
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,4));
});
