// Round 44: two devices. The timer and the entries are shared; writes that cross are merged per entry, nothing newer is overwritten, the other device updates by itself
const {openPair,ok,run}=require('./h43.js');
run(async b=>{const {A,B,st,adv,release}=await openPair(b);const today='2026-11-09';
  const items=pg=>pg.evaluate(`JSON.stringify(window.__u20.itemsRaw('${today}').map(x=>x.id))`).then(JSON.parse);
  // 1. A starts a war: B shows the same war
  await A.click('#warCard');await adv(500);await A.locator('.wr-grid .wr-chip').first().click();await A.click('.wr-go');await adv(3000);
  const wa=await A.evaluate("JSON.stringify(window.__sbWar.get())"),wb=await B.evaluate("JSON.stringify(window.__sbWar.get())");
  ok('timer started on A shows on B',wb!=='null'&&JSON.parse(wb).start===JSON.parse(wa).start,wb.slice(0,80));
  // 2. A pauses: B sees paused
  await adv(4*60000);await A.click('.wr-pause');await adv(3000);
  ok('pause on A shows on B',(JSON.parse(await B.evaluate("JSON.stringify(window.__sbWar.get())"))||{}).pausedAt>0);
  ok('the war entry reached B',(await items(B)).some(i=>/^war/.test(i)),JSON.stringify(await items(B)));
  const wA=await A.evaluate(`window.__u20.workedMin('${today}')`),wB=await B.evaluate(`window.__u20.workedMin('${today}')`);
  ok('both devices total the same worked time',wA>=3&&Math.abs(wA-wB)<0.01,wA+' vs '+wB);
  // 3. both add an entry at the same time (writes cross): both survive on both devices
  st.hold=true;
  const add=(pg,id)=>pg.evaluate(`window.__u20.saveEntries('${today}',window.__u20.itemsRaw('${today}').concat([{id:'${id}',kind:'manual',ref:'other',label:'${id}',minutes:20,sessions:[{start:Date.now()-1200000,end:Date.now(),minutes:20,paused:0}]}]))`);
  await add(A,'fromA');await add(B,'fromB');await adv(500);await release();await adv(2000);
  const ia=await items(A),ib=await items(B);
  ok('crossing writes keep every entry on A',ia.includes('fromA')&&ia.includes('fromB')&&ia.some(i=>/^war/.test(i)),JSON.stringify(ia));
  ok('crossing writes keep every entry on B',ib.includes('fromA')&&ib.includes('fromB')&&ib.some(i=>/^war/.test(i)),JSON.stringify(ib));
  // 4. B ends the war: A shows it ended and keeps the entry
  await B.click('#warCard');await adv(500);await B.click('.wr-end');await adv(500);
  if(await B.locator('.v3-conf .btn:not(.ghost)').count())await B.click('.v3-conf .btn:not(.ghost)');await adv(3000);
  ok('end on B shows on A',(await A.evaluate("JSON.stringify(window.__sbWar.get())"))==='null');
  ok('the entry is kept after the war ended',(await items(A)).some(i=>/^war/.test(i)));
  console.log('errors',[...A.errs,...B.errs].filter(e=>!e.includes('ERR_FAILED')).slice(0,4));
});
