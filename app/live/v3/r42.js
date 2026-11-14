// Round 42: Move bucket. Journey: drag the bucket bar (or hold the bucket row, Move bucket) and it asks "Move its tasks too?"; yes shifts the open tasks, no moves only the bucket dates; editing the bucket dates asks the same; resizing a parent task rescales its subtasks; Undo for all.
const {ok,run,open,T,vis,visR,undo,ctr,shot,dragTo}=require('./wf2h.js');
const D=(t)=>[t.a1.date,t.a2.date,t.a3.date,t.c1.date,t.k1.date,t.b1.date].join();
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const {pg,R}=await open(b,w);
  const cw=await pg.evaluate("document.querySelector('#wfBody .wf-cell').getBoundingClientRect().width");
  const bar=()=>pg.locator('#wfBody .wf-bkbar[data-bk="bkA"]');
  const t0=await T(pg);const D0=D(t0);
  ok('bucket bar spans the bucket dates (15 to 19 Nov = 5 cells)',Math.abs((await bar().boundingBox()).width-cw*5)<cw*0.5,(await bar().boundingBox()).width+' vs '+cw*5);
  await vis(pg,bar(),R);let bb=await bar().boundingBox();await pg.mouse.click(bb.x+Math.min(bb.width/2,40),bb.y+bb.height/2);await R(400);
  ok('tap the bucket bar: handles on both ends',(await pg.locator('#wfBody .wf-bkbar .wf-hdl').count())===2);
  // drag body +1 day, answer yes
  await vis(pg,bar(),R);bb=await bar().boundingBox();
  await dragTo(pg,{x:bb.x+Math.min(bb.width/2,40),y:bb.y+bb.height/2},{x:bb.x+Math.min(bb.width/2,40)+cw,y:bb.y+bb.height/2},6);await R(500);
  ok('dragging a bucket bar asks "Move its tasks too?"',/Move its tasks too\?/.test(await pg.locator('.ps-sheet').innerText().catch(()=>'')));
  ok('the question says how many tasks',/open tasks? move by 1 day later/.test(await pg.locator('.ps-sheet').innerText()),await pg.locator('.ps-sheet').innerText());
  await pg.locator('.ps-sheet .wf-mv-yes').click();await R(500);
  let t=await T(pg);ok('bucket dates moved +1 day',t.bkA.bStart==='2026-11-16'&&t.bkA.bEnd==='2026-11-20',t.bkA.bStart+' '+t.bkA.bEnd);
  ok('its open tasks moved +1 day, other bucket untouched',D(t)==='2026-11-16,2026-11-18,2026-11-20,2026-11-19,2026-11-18,2026-11-22',D(t));
  await undo(pg,R);t=await T(pg);ok('undo restores bucket and tasks',D(t)===D0&&t.bkA.bStart==='2026-11-15',D(t));
  // right handle: lengthen by 1, answer "Only the bucket dates"
  await vis(pg,bar(),R);
  if(await pg.locator('#wfBody .wf-bkbar .wf-hdl').count()===0){bb=await bar().boundingBox();await pg.mouse.click(bb.x+Math.min(bb.width/2,40),bb.y+bb.height/2);await R(400);}
  await visR(pg,bar(),R);
  let h=await pg.locator('#wfBody .wf-bkbar[data-bk="bkA"] .wf-hdl.r').boundingBox();
  await dragTo(pg,ctr(h),{x:ctr(h).x+cw,y:ctr(h).y},6);await R(500);
  ok('resizing a bucket also asks',/Move its tasks too\?/.test(await pg.locator('.ps-sheet').innerText().catch(()=>'')));
  await pg.locator('.ps-sheet .wf-mv-no').click();await R(500);
  t=await T(pg);ok('only the bucket end changed (tasks stay)',t.bkA.bStart==='2026-11-15'&&t.bkA.bEnd==='2026-11-20'&&D(t)===D0,t.bkA.bEnd+' '+D(t));
  await undo(pg,R);t=await T(pg);ok('undo restores the end',t.bkA.bEnd==='2026-11-19');
  // Cancel leaves everything as it was
  await vis(pg,bar(),R);bb=await bar().boundingBox();
  await dragTo(pg,{x:bb.x+Math.min(bb.width/2,40),y:bb.y+bb.height/2},{x:bb.x+Math.min(bb.width/2,40)+cw*2,y:bb.y+bb.height/2},6);await R(500);
  await pg.locator('.ps-sheet button:has-text("Cancel")').click();await R(400);t=await T(pg);
  ok('cancel changes nothing',t.bkA.bStart==='2026-11-15'&&D(t)===D0);
  // Move bucket from the row menu (hold or the row menu)
  await pg.locator('#wfBody .wf-bk[data-bk="bkA"] .wf-bk-more').click();await R(400);
  ok('bucket menu has Move bucket',(await pg.locator('.ps-sheet .bk-move-menu').count())===1);
  await pg.locator('.ps-sheet .bk-move-menu').click();await R(500);
  ok('Move bucket offers a few days and a date',(await pg.locator('.ps-sheet .bkm-pick').count())===3&&(await pg.locator('.ps-sheet .bkm-date').count())===1);
  await pg.locator('.ps-sheet .bkm-pick').nth(2).click();await R(500);
  ok('then asks Move its tasks too?',/Move its tasks too\?/.test(await pg.locator('.ps-sheet').innerText()));
  await pg.locator('.ps-sheet .wf-mv-yes').click();await R(500);t=await T(pg);
  ok('+1 week moved bucket and tasks',t.bkA.bStart==='2026-11-22'&&t.bkA.bEnd==='2026-11-26'&&t.a1.date==='2026-11-22'&&t.a3.date==='2026-11-26',D(t));
  ok('done tasks would stay: only open ones were moved (all open here)',t.a1.done===false);
  await undo(pg,R);t=await T(pg);ok('undo of Move bucket',D(t)===D0&&t.bkA.bStart==='2026-11-15');
  // hold on the bucket row opens the same menu
  await pg.locator('#wfBody .wf-bk[data-bk="bkA"] .wf-bkb').evaluate(e=>e.scrollIntoView({block:'center'}));await R(300);
  bb=await pg.locator('#wfBody .wf-bk[data-bk="bkA"] .wf-bkb').boundingBox();await pg.mouse.move(bb.x+40,bb.y+bb.height/2);await pg.mouse.down();await pg.clock.runFor(700);await pg.mouse.up();await R(400);
  ok('hold on a bucket row opens its menu',(await pg.locator('.ps-sheet .bk-move-menu').count())===1);await pg.keyboard.press('Escape');await R(300);
  // editing the bucket dates in the sheet asks the same question
  await pg.evaluate(()=>window.__u&&0);await pg.evaluate(()=>{__u.bkForm('bkA');});await R(500);
  await pg.locator('.ps-sheet input[aria-label="End date"]').fill('2026-11-24');await R(600);
  ok('editing bucket dates asks "Move its tasks too?"',/Move its tasks too\?/.test(await pg.locator('.ps-sheet').innerText().catch(()=>'')));
  await pg.locator('.ps-sheet .wf-mv-yes').click();await R(500);t=await T(pg);
  ok('longer range: end saved, tasks spread over the new dates',t.bkA.bEnd==='2026-11-24'&&t.a3.date>'2026-11-19'&&t.a1.date==='2026-11-15',D(t));
  await undo(pg,R);t=await T(pg);ok('undo restores the dates and tasks',t.bkA.bEnd==='2026-11-19'&&D(t)===D0,D(t));
  // a bucket without open dated tasks changes its dates without asking
  await pg.evaluate(()=>{__u.bkForm('bkB');});await R(500);
  await pg.evaluate(async()=>{const db=await window.claude.use('db');await db.doc('tasks/b1').update({done:true});await db.doc('tasks/b2').update({done:true});});await R(400);
  await pg.locator('.ps-sheet input[aria-label="End date"]').fill('2026-11-28');await R(500);
  t=await T(pg);ok('no open tasks: no question, dates saved',t.bkB.bEnd==='2026-11-28'&&(await pg.locator('.ps-sheet .wf-mv-yes').count())===0,t.bkB.bEnd);
  await pg.keyboard.press('Escape');await R(300);
  // parent bar: resize rescales its subtasks and asks
  await pg.locator('#wfBody .wf-bkb').first().click();await R(400);
  const pbar=()=>pg.locator('#wfBody .wf-bar[data-id="a2"]');await vis(pg,pbar(),R);
  bb=await pbar().boundingBox();await pg.mouse.click(bb.x+Math.min(bb.width/2,40),bb.y+bb.height/2);await R(400);
  await visR(pg,pbar(),R);await pg.evaluate(c=>{const sc=document.querySelector('#wfBody .wf-scroll');sc.scrollLeft+=0*c;},cw);h=await pg.locator('#wfBody .wf-bar[data-id="a2"] .wf-hdl.r').boundingBox();
  await dragTo(pg,ctr(h),{x:ctr(h).x+cw*2,y:ctr(h).y},6);await R(500);
  ok('resizing a parent asks "Move its tasks too?"',/Move its tasks too\?/.test(await pg.locator('.ps-sheet').innerText().catch(()=>'')));
  await pg.locator('.ps-sheet .wf-mv-yes').click();await R(500);t=await T(pg);
  ok('parent now 4 days; its real child is spread (18 to 20 Nov)',t.a2.days===4&&t.c1.date==='2026-11-20',JSON.stringify([t.a2.days,t.c1.date]));
  ok('sub docs follow too (kept at the start)',t.k1.date==='2026-11-17');
  await undo(pg,R);t=await T(pg);ok('undo restores parent and child',(t.a2.days===2)&&t.c1.date==='2026-11-18');
  const pe=pg.errs.filter(x=>!x.includes('ERR_FAILED'));ok('no page errors',pe.length===0,pe.join('|'));
}});
