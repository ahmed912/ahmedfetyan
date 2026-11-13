const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?' '+x:''));
run(async b=>{for(const w of [390,1300]){const pg=await openp(b,w);const W=ms=>pg.waitForTimeout(ms);const esc=async()=>{await pg.keyboard.press('Escape');await pg.clock.runFor(450);await W(400);};
  console.log('== width',w);
  // day target is editable and Today and Time match
  await pg.click('#prevDay');await pg.clock.runFor(300);await W(300);
  await pg.click('.dbar-focus .num');await pg.clock.runFor(400);await W(600);await shot(pg,'r5_target_'+w);
  await pg.fill('.ps-sheet input[aria-label="Pomodoros for a full day"]','6:30');await pg.click('.ps-sheet .btn:has-text("Save")');await pg.clock.runFor(500);await W(600);
  const dm=await pg.evaluate("window.__data.settings&&window.__data.settings.prefs&&window.__data.settings.prefs.dayMin");ok('target saved (390 min)',dm===390,dm);
  const bar=await pg.evaluate("document.querySelector('.dbar-focus .num')?.textContent");
  await pg.click('.pop-card:has-text("Time")');await pg.clock.runFor(500);await W(700);
  const hero=await pg.evaluate("document.querySelector('#entHero .eh-pct')?.innerText.replace(/\\s+/g,' ')");
  console.log('bar:',bar,'| Time:',hero);ok('Today and Time show the same target',/of 7\.8 pomodoros/.test(bar||'')&&/of 7\.8 pomodoros/.test(hero||''));
  await pg.click('#entHero .eh-pct .v3-edtarget');await pg.clock.runFor(400);await W(500);ok('target editable from Time too',await pg.evaluate("document.querySelector('.ps-sheet .ps-sh-head h2')?.textContent==='Day target'"));await esc();await esc();
  await pg.click('#todayBtn').catch(()=>{});await pg.clock.runFor(300);
  // pop-card text has room on the right
  const m=await pg.evaluate("(()=>{const c=[...document.querySelectorAll('.pop-card')].find(x=>/Intentional/.test(x.textContent));if(!c)return null;const t=c.querySelector('.fc-t'),rc=c.getBoundingClientRect(),rt=t.getBoundingClientRect();const rg=document.createRange();rg.selectNodeContents(t);const rr=[...rg.getClientRects()].reduce((a,r)=>Math.max(a,r.right),0);return {cardRight:Math.round(rc.right),textRight:Math.round(rr),gap:Math.round(rc.right-rr)}})()");
  console.log('Intentional media card',JSON.stringify(m));ok('card title keeps a right buffer (>=12px)',m&&m.gap>=12,m&&m.gap);
  await pg.locator('.pop-card:has-text("Intentional")').scrollIntoViewIfNeeded();await shot(pg,'r5_cards_'+w);
  // waterfall names are complete
  await pg.click(w<700?'.m-tab:has-text("Review")':'.topnav :text("Review")');await pg.clock.runFor(500);await W(700);
  await pg.locator('#wfBody').scrollIntoViewIfNeeded();await shot(pg,'r5_wf_'+w);
  const full=await pg.evaluate("(()=>{const els=[...document.querySelectorAll('#wfBody .v3-wft .wf-t')];const bad=els.filter(e=>{const cs=getComputedStyle(e);return cs.textOverflow==='ellipsis'||e.scrollHeight>e.clientHeight+2||e.scrollWidth>e.clientWidth+2;});return {n:els.length,clipped:bad.length,sample:bad.slice(0,2).map(e=>e.textContent)}})()");
  console.log('waterfall names',JSON.stringify(full));ok('no waterfall name is cut off',full.n>0&&full.clipped===0);
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,4));await pg.close();}});
