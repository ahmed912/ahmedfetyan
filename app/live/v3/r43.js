// Round 43: an unanswered War prompt ends the session but keeps the entry; removals are soft (Recently deleted), never automatic
const {openp,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
run(async b=>{
  const pg=await openp(b,390,{sb:true});const W=ms=>pg.waitForTimeout(ms),today='2026-11-09';
  await pg.click('#warCard');await pg.clock.runFor(500);await W(400);
  await pg.locator('.wr-grid .wr-chip').first().click();await pg.click('.wr-go');await pg.clock.runFor(1000);await W(300);
  await pg.clock.runFor(8*60000);await W(300);
  await pg.click('.wr-pause');await pg.clock.runFor(2000);await W(300);
  const E=()=>pg.evaluate(`JSON.stringify(((window.__data.entries||{})['${today}']||{}).items||[])`).then(JSON.parse);
  let it=(await E()).filter(x=>/^war/.test(x.id));
  ok('pause saves the war entry with its time',it.length===1&&it[0].minutes>=7,JSON.stringify(it.map(x=>x.minutes)));
  const m0=it[0]&&it[0].minutes;
  await pg.clock.fastForward(125*60000);await pg.clock.runFor(4000);await W(500);
  const war=await pg.evaluate("JSON.stringify(window.__data.timers.war)");
  ok('unanswered war ended by itself after 2 h paused',/"active":false/.test(war),war.slice(0,120));
  it=(await E()).filter(x=>/^war/.test(x.id));
  ok('the entry is still there, not deleted',it.length===1&&!it[0].deleted,JSON.stringify(it));
  ok('its time stops at the pause (idle not logged)',it[0]&&it[0].minutes===m0,(it[0]||{}).minutes+' vs '+m0);
  // removal is soft: a list without the entry keeps it as a tombstone, hidden but restorable
  await pg.evaluate(`window.__u20.saveEntries('${today}',window.__u20.itemsRaw('${today}').filter(x=>!/^war/.test(x.id)))`);await pg.clock.runFor(1500);await W(300);
  const all=await E();
  ok('a removed entry stays in the document as deleted',all.some(x=>/^war/.test(x.id)&&x.deleted),JSON.stringify(all.map(x=>x.id+':'+x.deleted)));
  ok('and is hidden from the day',await pg.evaluate(`window.__u20.itemsRaw('${today}').every(x=>!/^war/.test(x.id))`));
  ok('Recently deleted lists it',await pg.evaluate(`window.__u20.v20deletedEntries().some(o=>/^war/.test(o.x.id))`));
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,4));
});
