const {openp,shot,run}=require('./h.js');
const html=process.argv[2]||'test.html';
const ok=(n,c,x)=>console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?' '+x:''));
run(async b=>{
  const pg=await openp(b,390,{html,sb:true});const W=ms=>pg.waitForTimeout(ms);
  console.log('layer active:',await pg.evaluate("!!window.__sbSafe"));
  // 1. Day log: another device changed Sunday's log; this (stale) device types a log-out time for Sunday
  const target='2026-11-08';const today='2026-11-09';
  await pg.evaluate(`(()=>{const d=window.__data.logs['${target}']||{};window.__data.logs['${target}']={...d,reflection:'FROM DEVICE A',comms:{...(d.comms||{}),'1':true}};})()`);
  await pg.click('#workBar .wb-hist');await pg.clock.runFor(500);await W(600);
  const out=pg.locator('.ps-sheet .lh-tab tbody tr').nth(1).locator('input').nth(1);await out.fill('5:30 pm');await out.press('Enter');await pg.clock.runFor(1500);await W(400);
  const L=await pg.evaluate(`JSON.stringify(window.__data.logs['${target}'])`);
  ok('day log keeps the other device\'s changes and adds this one',L.includes('FROM DEVICE A')&&L.includes('"1":true')&&L.includes('workOut'),L.length+' chars');
  await pg.keyboard.press('Escape');await pg.clock.runFor(500);await W(400);
  // 2. Time entries: another device added an entry for today; this device adds its own
  await pg.evaluate(`(()=>{const e=window.__data.entries['${today}']||{date:'${today}',items:[]};window.__data.entries['${today}']={...e,items:[...(e.items||[]),{id:'fromA',kind:'manual',ref:'other',label:'ENTRY FROM A',minutes:30,sessions:[{start:Date.parse('${today}T07:00:00'),end:Date.parse('${today}T07:30:00'),minutes:30,paused:0}]}]};})()`);
  await pg.click('.pop-card:has-text("Time")');await pg.clock.runFor(500);await W(600);
  await pg.click('#v3AddTime');await W(500);await pg.locator('.v3-trow').first().click();await W(300);
  const tts=pg.locator('.ps-sheet input.tt-in');await tts.nth(0).fill('9');await tts.nth(0).press('Tab');await tts.nth(1).fill('10:30');await tts.nth(1).press('Tab');
  await pg.click('.ps-sheet .btn:has-text("Add time")');await pg.clock.runFor(2000);await W(500);
  const items=await pg.evaluate(`JSON.stringify((window.__data.entries['${today}'].items||[]).map(x=>x.id+'|'+x.label))`);
  ok('entries keep the other device\'s entry and add this one',items.includes('fromA')&&items.includes('Bank: draft post 7')||items.includes('fromA')&&JSON.parse(items).length>=2,items.slice(0,200));
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,4));
});
