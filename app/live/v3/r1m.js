const {openp,shot,run}=require('./h.js');
run(async b=>{for(const w of [390]){const pg=await openp(b,w);const W=ms=>pg.waitForTimeout(ms);
  await shot(pg,'r1_today_'+w,true);
  // login history
  await pg.click('#workBar .wb-hist');await W(600);await shot(pg,'r1_lh_'+w);
  const inp=pg.locator('.ps-sheet .lh-tab input').first();await inp.fill('8:15');await inp.press('Enter');await pg.clock.runFor(500);await W(500);
  console.log(w,'login set',await pg.evaluate("JSON.stringify(Object.entries(window.__data.logs).filter(([k,v])=>v.workIn).map(([k,v])=>[k,new Date(v.workIn).toTimeString().slice(0,5)]).slice(-3))"));
  await pg.keyboard.press('Escape');await W(400);
  // plan
  await pg.click('.v3-plan');await W(600);await shot(pg,'r1_plan_'+w);await pg.keyboard.press('Escape');await W(400);
  // time popup
  await pg.click('.pop-card:has-text("Time")');await W(700);await shot(pg,'r1_time_'+w);
  await pg.click('#v3AddTime');await W(600);await shot(pg,'r1_man_'+w);
  await pg.locator('.v3-trow').first().click();await W(300);
  const tts=pg.locator('.ps-sheet input.tt-in');await tts.nth(0).fill('9');await tts.nth(0).press('Tab');await tts.nth(1).fill('10:30');await tts.nth(1).press('Tab');
  await pg.click('.ps-sheet .btn:has-text("Add time")');await pg.clock.runFor(300);await W(500);
  console.log(w,'entries',await pg.evaluate("JSON.stringify((window.__data.entries['2026-11-09']||{}).items?.map(x=>[x.label,x.minutes,x.cat]))"));
  await pg.clock.runFor(450);await W(700);console.log(w,'time sheet reopened after Add time',await pg.evaluate("!!document.querySelector('.ps-sheet #entList')"));await shot(pg,'r1_time2_'+w);
  await pg.click('.v3-rev');await W(600);await shot(pg,'r1_rev_'+w);await pg.keyboard.press('Escape');await pg.clock.runFor(450);await W(500);await pg.keyboard.press('Escape');await pg.clock.runFor(450);await W(400);
  // task view
  await pg.evaluate(()=>__ch.openAll());await W(400);await shot(pg,'r1_tv_'+w);
  // start -> war setup
  await pg.locator('#cutStack .ch-go').first().click();await W(600);await shot(pg,'r1_wsetup_'+w);
  await pg.click('.wr-go');await W(800);await shot(pg,'r1_war_'+w);
  await pg.clock.runFor(51*60000);await W(300);await shot(pg,'r1_warbrk_'+w);
  console.log(w,'phase after 51m',await pg.evaluate("JSON.stringify((()=>{const w=window.__sbWar.get();return {ph:w.phase,p:!!w.pausedAt}})())"));
  await pg.clock.runFor(11*60000);await W(300);
  console.log(w,'after break 11m',await pg.evaluate("JSON.stringify((()=>{const w=window.__sbWar.get();return {ph:w.phase,p:!!w.pausedAt,auto:w.auto}})())"),await pg.evaluate("JSON.stringify((window.__data.entries['2026-11-09']||{}).items?.filter(x=>x.label.startsWith('War')).map(x=>[x.label,x.minutes,x.sessions.length]))"));
  await pg.click('.wr-hb .tv-x >> nth=0');await W(500);await shot(pg,'r1_min_'+w);
  await pg.clock.runFor(121*60000);await W(300);
  console.log(w,'after 2h paused war=',await pg.evaluate("JSON.stringify(window.__sbWar.get())"),await pg.evaluate("JSON.stringify((window.__data.entries['2026-11-09']||{}).items?.filter(x=>x.label.startsWith('War')).map(x=>[x.label,x.minutes]))"));
  console.log(w,'errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,6));await pg.close();}});
