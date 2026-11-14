// Round 41: resize by hand. Journey: tap a bar, handles appear on both ends; drag the right handle to change the length, the left handle to change the start, the body to move; tap again to let go; Undo.
const {ok,run,open,T,vis,undo,ctr,shot,dragTo}=require('./wf2h.js');
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const {pg,R}=await open(b,w);
  await pg.locator('#wfBody .wf-bkb').first().click();await R(400);
  const bar=pg.locator('#wfBody .wf-bar[data-id="a1"]');await vis(pg,bar,R);
  ok('no handles before the tap',(await pg.locator('#wfBody .wf-hdl').count())===0);
  let bb=await bar.boundingBox();await pg.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await R(400);
  ok('tap a bar: handles on both ends',(await pg.locator('#wfBody .wf-bar[data-id="a1"] .wf-hdl').count())===2);
  ok('a tap does not open a pop-up',(await pg.locator('.ps-sheet').count())===0||!(await pg.locator('.ps-sheet').isVisible()));
  await shot(pg,'r41_handles_'+w);
  const cw=await pg.evaluate("document.querySelector('#wfBody .wf-cell').getBoundingClientRect().width");
  // right handle: +2 days
  await vis(pg,pg.locator('#wfBody .wf-bar[data-id="a1"]'),R);
  let h=await pg.locator('#wfBody .wf-bar[data-id="a1"] .wf-hdl.r').boundingBox();
  await dragTo(pg,ctr(h),{x:ctr(h).x+cw*2,y:ctr(h).y},6);await R(500);
  let t=(await T(pg)).a1;ok('right handle lengthens: 3 days, same start',t.days===3&&t.date==='2026-11-15',JSON.stringify([t.date,t.days]));
  ok('handles stay on after the change',(await pg.locator('#wfBody .wf-bar[data-id="a1"] .wf-hdl').count())===2);
  await undo(pg,R);t=(await T(pg)).a1;ok('undo restores the length',!t.days||t.days===1,t.days);
  // left handle: -1 day (start earlier, end stays)
  await vis(pg,pg.locator('#wfBody .wf-bar[data-id="a1"]'),R);
  if(await pg.locator('#wfBody .wf-bar[data-id="a1"] .wf-hdl').count()===0){bb=await pg.locator('#wfBody .wf-bar[data-id="a1"]').boundingBox();await pg.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await R(400);}
  h=await pg.locator('#wfBody .wf-bar[data-id="a1"] .wf-hdl.l').boundingBox();
  await dragTo(pg,ctr(h),{x:ctr(h).x-cw,y:ctr(h).y},6);await R(500);
  t=(await T(pg)).a1;ok('left handle changes the start: 14 Nov, 2 days',t.date==='2026-11-14'&&t.days===2,JSON.stringify([t.date,t.days]));
  await undo(pg,R);t=(await T(pg)).a1;ok('undo restores the start',t.date==='2026-11-15'&&(!t.days||t.days===1),JSON.stringify([t.date,t.days]));
  // shrinking never goes below one day
  await vis(pg,pg.locator('#wfBody .wf-bar[data-id="a1"]'),R);
  if(await pg.locator('#wfBody .wf-bar[data-id="a1"] .wf-hdl').count()===0){bb=await pg.locator('#wfBody .wf-bar[data-id="a1"]').boundingBox();await pg.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await R(400);}
  h=await pg.locator('#wfBody .wf-bar[data-id="a1"] .wf-hdl.r').boundingBox();
  await dragTo(pg,ctr(h),{x:ctr(h).x-cw*3,y:ctr(h).y},6);await R(500);t=(await T(pg)).a1;ok('cannot shrink below 1 day',t.date==='2026-11-15'&&(!t.days||t.days===1),JSON.stringify([t.date,t.days]));
  // body drag moves a day, handles stay
  const a3=pg.locator('#wfBody .wf-bar[data-id="a3"]');await vis(pg,a3,R);bb=await a3.boundingBox();
  await dragTo(pg,{x:bb.x+bb.width/2,y:bb.y+bb.height/2},{x:bb.x+bb.width/2-cw,y:bb.y+bb.height/2},6);await R(600);
  t=(await T(pg)).a3;ok('drag the body moves the bar a day earlier',t.date==='2026-11-18',t.date);
  await undo(pg,R);
  // tap the same bar again lets go; tap elsewhere too
  await vis(pg,pg.locator('#wfBody .wf-bar[data-id="a1"]'),R);bb=await pg.locator('#wfBody .wf-bar[data-id="a1"]').boundingBox();
  if(await pg.locator('#wfBody .wf-bar[data-id="a1"] .wf-hdl').count()===0){await pg.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await R(400);}
  await pg.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await R(400);
  ok('tap again: handles go',(await pg.locator('#wfBody .wf-hdl').count())===0);
  // hold on a bar still opens the quick menu
  await vis(pg,pg.locator('#wfBody .wf-bar[data-id="a1"]'),R);bb=await pg.locator('#wfBody .wf-bar[data-id="a1"]').boundingBox();await pg.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await pg.mouse.down();await pg.clock.runFor(700);await pg.mouse.up();await R(400);
  ok('hold on a bar opens the quick menu',(await pg.locator('.ps-sheet .btn:has-text("Reschedule")').count())===1,(await pg.locator('.ps-sheet').allInnerTexts()).join('|').slice(0,100)+await pg.locator('.ps-sheet').count());await pg.keyboard.press('Escape');await R(300);
  const pe=pg.errs.filter(x=>!x.includes('ERR_FAILED'));ok('no page errors',pe.length===0,pe.join('|'));
}});
