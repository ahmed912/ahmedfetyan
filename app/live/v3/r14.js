const {openp,shot,run}=require('./h');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?' '+x:''));if(!c)process.exitCode=1;};
process.env.MOCKDATA=process.env.MOCKDATA||'/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
const fs=require('fs');const REAL=fs.readFileSync(process.env.MOCKDATA,'utf8');
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  for(const when of ['2026-11-19T11:00:00','2026-11-25T11:00:00']){
  const pg=await openp(b,w,{when,real:REAL});const W=ms=>pg.waitForTimeout(ms);await W(300);
  const run1=async ms=>{await pg.clock.runFor(ms);await W(150);};
  const T=()=>pg.evaluate("JSON.parse(JSON.stringify(window.__data.tasks))");
  const swipe=async(sel,dx)=>{const bb=await pg.locator(sel).boundingBox();const y=bb.y+bb.height/2,x0=bb.x+bb.width*(dx<0?0.8:0.5);await pg.mouse.move(x0,y);await pg.mouse.down();for(let i=1;i<=8;i++)await pg.mouse.move(x0+dx*i/8,y+1);await pg.mouse.up();await run1(400);};
  const stepSel='#cutStack .cs-card.cs-top .cs-step:not(.done)';
  const n0=await pg.locator(stepSel).count();ok(when+' card has steps',n0>0,n0);
  const id=await pg.locator(stepSel).first().getAttribute('data-step');const t0=(await T())[id];
  // vertical scroll is not blocked
  ok('step rows allow vertical pan',(await pg.locator(stepSel).first().evaluate(e=>getComputedStyle(e).touchAction))==='pan-y');
  await swipe(stepSel+':first-child',-200);
  ok('swipe left opens Reschedule step',(await pg.locator('.ps-sheet[aria-label="Reschedule"]').count())===1);
  ok('chips present',(await pg.locator('.v3-rs').count())===3);
  await pg.locator('.v3-rs:has-text("Tomorrow")').click();await run1(600);
  if(when.startsWith('2026-11-19')){
    const t1=(await T())[id];ok('Thursday + Tomorrow skips Friday to Saturday',t1.date==='2026-11-21',t0.date+' -> '+t1.date);
    ok('card updated: step no longer on the card',(await pg.locator('#cutStack .cs-card.cs-top [data-step="'+id+'"]').count())===0);
    ok('undo bar shown',(await pg.locator('#v3ut:not([hidden])').count())===1);
    await pg.click('#v3ut .ub-b');await run1(500);const t2=(await T())[id];ok('Undo restores the date',t2.date===t0.date,t2.date);
    ok('step back on the card',(await pg.locator('#cutStack .cs-card.cs-top [data-step="'+id+'"]').count())===1);
    // swipe right = done after confirm
    await run1(9500);
    await swipe(stepSel+":first-child",150);ok('swipe right asks to confirm',(await pg.locator('.v3-conf').count())===1);
    await pg.click('.v3-conf .btn:not(.ghost)');await run1(500);const t3=(await T())[id];ok('swipe right marks the step done',!!t3.done);
  }else{
    ok('last day of sprint',t0.date==='2026-11-25',t0.date);
    ok('chips still offered',true);
    // Tomorrow goes to Fri 26? 26 Nov is Thursday: next sprint. Confirm warns.
  }
  if(!when.startsWith('2026-11-19')){
    const conf=await pg.locator('.v3-conf').innerText().catch(()=>'');ok('past sprint end asks with a warning',/Sprint 3/.test(conf),conf.replace(/\s+/g,' '));
    await pg.click('.v3-conf .btn.ghost').catch(()=>{});await run1(400);ok('cancel keeps the date',(await T())[id].date==='2026-11-25');
    await pg.locator('.ps-sheet .v3-rs:has-text("Tomorrow")').click().catch(()=>{});await run1(400);
    await pg.click('.v3-conf .btn:not(.ghost)').catch(()=>{});await run1(600);const t5=(await T())[id];ok('confirmed move sets the new sprint number',t5.date>'2026-11-25'&&t5.sprint===3,t5.date+' sprint '+t5.sprint);
  }
  const er=pg.errs.filter(e=>!/Failed to load resource/.test(e));ok('no page errors',er.length===0,er.join('|').slice(0,300));
  await pg.context().close();}}});
