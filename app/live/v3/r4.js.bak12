const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?' '+x:''));
run(async b=>{const pg=await openp(b,390);const W=ms=>pg.waitForTimeout(ms);const esc=async()=>{await pg.keyboard.press('Escape');await pg.clock.runFor(450);await W(400);};
  const T=()=>pg.evaluate("JSON.stringify(Object.entries(window.__data.tasks).map(([i,t])=>({i,t:t.title,d:t.date,parent:t.parent})))").then(JSON.parse);
  const dayTxt=()=>pg.evaluate("(document.querySelector('.hdate, #dayTitle, h1.date')||{}).textContent");
  // --- day progress and returning to the day you came from
  await pg.click('#prevDay');await pg.clock.runFor(300);await W(400);
  const bar=await pg.evaluate("document.querySelector('.dbar-focus .num')?.textContent");
  await pg.click('.pop-card:has-text("Time")');await pg.clock.runFor(500);await W(700);
  const hero=await pg.evaluate("document.querySelector('#entHero .eh-big')?.innerText.replace(/\\s+/g,' ')+' | '+document.querySelector('#entHero .eh-pct')?.innerText.replace(/\\s+/g,' ')");
  console.log('day bar:',bar,'| Time:',hero);
  ok('Today bar and Time use the same total',hero.includes((bar||'').split(' h')[0]),'');
  ok('Time yardstick is 8 pomodoros',/of 8 pomodoros/.test(hero),hero);
  await pg.click('.v3-dnav .v3-ar >> nth=0');await pg.clock.runFor(300);await W(400);
  await esc();
  console.log('day after closing Time:',await dayTxt());
  ok('closing Time returns to the day you came from (Sunday 8 November)',/8 November/.test(await dayTxt()||''),await dayTxt());
  await pg.click('#todayBtn');await pg.clock.runFor(300);await W(300);
  // --- Review
  await pg.click('.m-tab:has-text("Review")');await pg.clock.runFor(500);await W(700);
  ok('waterfall is open (rows visible)',(await pg.locator('#wfBody .v3-wft').count())>0,await pg.locator('#wfBody .v3-wft').count());
  ok('no fold button on waterfall/insights',(await pg.locator('section[aria-labelledby="wfH"] .collapse-btn, section[aria-labelledby="ihH"] .collapse-btn').count())===0);
  console.log('insights title:',await pg.evaluate("document.getElementById('ihH').textContent"),'| body:',(await pg.evaluate("document.getElementById('ihBody').innerText")).replace(/\n/g,' | ').slice(0,200));
  await pg.locator('#ihBody .btn:has-text("Open bank")').click();await pg.clock.runFor(500);await W(600);await shot(pg,'r4_bank');
  const nb=await pg.locator('.ps-sheet .v3-trow').count();ok('bank lists captures',nb>0,nb);
  await pg.locator('.ps-sheet .v3-trow').first().click();await pg.clock.runFor(400);await W(600);await shot(pg,'r4_bank1');
  ok('bank item opens a pop-up',await pg.evaluate("!!document.querySelector('.ps-sheet')"));await esc();await esc();
  // tasks sheet: All tab
  await pg.locator('#bars .bar').nth(0).click();await W(600);
  const tabs=await pg.locator('.ps-sheet .seg button').allTextContents();ok('tasks sheet has All tab',tabs.some(t=>/^All/.test(t)),tabs.join('|'));
  await pg.locator('.ps-sheet .seg button:has-text("All")').click();await W(400);const na=await pg.locator('.ps-sheet .v3-trow').count();ok('All lists every task in the sprint',na>=40,na);await esc();
  // subtask options, no data migration
  const t0=await T();const rows0=await pg.locator('#wfBody .v3-wft').count();
  await pg.locator('#wfBody .v3-wft').nth(1).click();await W(500);await pg.click('.ps-sheet .btn:has-text("Details")');await W(300);
  await pg.click('.ps-sheet .btn:has-text("Make it a subtask of")');await W(600);await shot(pg,'r4_pick');
  await pg.locator('.ps-sheet .v3-trow').nth(2).click();await W(300);await pg.click('.v3-conf .btn:not(.ghost)');await pg.clock.runFor(500);await W(700);
  const t1=await T();const nested=t1.filter(x=>x.parent);ok('one task nested under another (data otherwise unchanged)',nested.length===1&&t1.length===t0.length,JSON.stringify(nested));
  await shot(pg,'r4_parent');
  const det=await pg.locator('.ps-sheet .v3-sub .mini:has-text("Detach")').count();ok('parent sheet lists it with Detach',det===1,det);
  await pg.locator('.ps-sheet .v3-sub .mini:has-text("Detach")').click();await pg.clock.runFor(400);await W(500);
  ok('detach restores it',(await T()).filter(x=>x.parent).length===0);await esc();
  // group tool
  await pg.locator('#wfBody .mini:has-text("Group tasks")').click();await W(600);await shot(pg,'r4_group');
  await pg.locator('.ps-sheet .q-row input').nth(0).check();await pg.locator('.ps-sheet .q-row input').nth(1).check();await W(300);
  await pg.click('.ps-sheet .btn:has-text("Choose the parent for 2")');await W(600);await pg.locator('.ps-sheet .v3-trow').nth(3).click();await W(300);await pg.click('.v3-conf .btn:not(.ghost)');await pg.clock.runFor(500);await W(700);
  const t2=await T();ok('two tasks grouped under one parent',t2.filter(x=>x.parent).length===2&&t2.length===t0.length,t2.filter(x=>x.parent).length);
  console.log('waterfall rows before/after grouping:',rows0,await pg.locator('#wfBody .v3-wft').count());
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,5));
});
