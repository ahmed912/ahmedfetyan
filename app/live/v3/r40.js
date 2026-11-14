// Round 40: waterfall v2. Journey: open Review, the waterfall shows one bar per bucket; drag a row up or down to reorder (grip on desktop, hold then drag on touch), undo; open a bucket, a parent shows its subtasks nested under it; subtasks never count.
const {ok,run,open,T,vis,labels,rowIds,undo,dragTo,ctr,shot}=require('./wf2h.js');
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const {pg,R}=await open(b,w);
  ok('one draggable bar per bucket',(await pg.locator('#wfBody .wf-bkbar[data-bk]').count())===2);
  ok('default view: parent rows only, no task rows',(await rowIds(pg)).length===0);
  ok('bucket order starts as name order',(await labels(pg)).join()==='bkA,bkB');
  // grip drag: HASM below Javelin
  let a=await pg.locator('#wfBody .wf-bk[data-bk="bkA"]').boundingBox(),bb=await pg.locator('#wfBody .wf-bk[data-bk="bkB"]').boundingBox();
  await pg.locator('#wfBody .wf-bk[data-bk="bkA"]').hover();await R(100);
  await dragTo(pg,{x:a.x+4,y:a.y+a.height/2},{x:bb.x+bb.width/2,y:bb.y+bb.height-2});await R(500);
  ok('drag with the grip reorders buckets',(await labels(pg)).join()==='bkB,bkA',(await labels(pg)).join());
  ok('order is saved on the buckets',await pg.evaluate(()=>window.__data.tasks.bkB.wOrd<window.__data.tasks.bkA.wOrd));
  ok('undo toast is visible',await pg.locator('#v3ut:not([hidden])').count()===1);
  await undo(pg,R);ok('undo restores the order',(await labels(pg)).join()==='bkA,bkB',(await labels(pg)).join());
  ok('no Move up or Move down anywhere',!/Move up|Move down/i.test(await pg.locator('#wfBody').innerText()));
  // hold then drag (touch style, no grip): Javelin above HASM
  a=await pg.locator('#wfBody .wf-bk[data-bk="bkA"] .wf-bkb').boundingBox();bb=await pg.locator('#wfBody .wf-bk[data-bk="bkB"] .wf-bkb').boundingBox();
  await pg.mouse.move(bb.x+30,bb.y+bb.height/2);await pg.mouse.down();await pg.clock.runFor(300);
  ok('hold lifts the row',await pg.locator('#wfBody .wf-armed').count()===1);
  await pg.mouse.move(bb.x+30,bb.y+bb.height/2-10,{steps:2});await pg.mouse.move(a.x+30,a.y+2,{steps:6});
  ok('drop indicator shows while dragging',await pg.locator('#wfBody .wf-drop').count()===1);
  await pg.mouse.up();await R(500);
  ok('hold then drag reorders buckets',(await labels(pg)).join()==='bkB,bkA',(await labels(pg)).join());
  await undo(pg,R);
  // a plain tap still expands, a quick hold with no move still opens the bucket menu
  await pg.locator('#wfBody .wf-bkb').first().click();await R(400);
  ok('tap expands the bucket and lists its parent rows',(await rowIds(pg)).join()==='a1,a2,a3',(await rowIds(pg)).join());
  ok('progress counts top-level tasks only (3, subtasks never count)',/3 · 0%/.test(await pg.locator('#wfBody .wf-bk[data-bk="bkA"]').innerText()),await pg.locator('#wfBody .wf-bk[data-bk="bkA"]').innerText());
  // task rows reorder inside the bucket
  const g3=await pg.locator('#wfBody .v3-wfrow[data-id="a3"]').boundingBox(),g1=await pg.locator('#wfBody .v3-wfrow[data-id="a1"]').boundingBox();
  await pg.locator('#wfBody .v3-wfrow[data-id="a3"]').hover();await R(100);
  await dragTo(pg,{x:g3.x+4,y:g3.y+g3.height/2},{x:g1.x+g1.width/2,y:g1.y+2});await R(500);
  ok('drag reorders tasks inside a bucket',(await rowIds(pg)).join()==='a3,a1,a2',(await rowIds(pg)).join());
  await undo(pg,R);ok('undo restores task order',(await rowIds(pg)).join()==='a1,a2,a3',(await rowIds(pg)).join());
  // parent with nested subtasks
  const row=pg.locator('#wfBody .v3-wfrow[data-id="a2"]');
  ok('parent shows a toggle with 3 nested items (1 task and 2 subtasks)',(await row.locator('.wf-ex').innerText())==='3');
  ok('parent count ignores sub docs: 0/1',/0\/1/.test(await row.innerText()),await row.innerText());
  ok('nested rows are hidden by default',(await pg.locator('#wfBody .wf-nest').count())===0);
  await row.locator('.wf-ex').click();await R(400);
  ok('open parent shows its subtasks under it',(await pg.locator('#wfBody .wf-nest').count())===3);
  const ord=await pg.evaluate(()=>[...document.querySelectorAll('#wfBody .wf-lbl')].map(e=>e.dataset.id||e.dataset.nest||e.dataset.bk).join());
  ok('subtasks sit right under their parent',/a2,c1,k1,k2,a3/.test(ord),ord);
  await shot(pg,'r40_nested_'+w);
  await row.locator('.wf-ex').click();await R(300);ok('toggle hides them again',(await pg.locator('#wfBody .wf-nest').count())===0);
  // Week view: subtasks show under their parent without asking
  await pg.locator('#wfBody .wf-v-week').click();await R(500);
  ok('week view shows subtasks under the parent',(await pg.locator('#wfBody .wf-nest').count())===3);
  const pe=pg.errs.filter(x=>!x.includes('ERR_FAILED'));ok('no page errors',pe.length===0,pe.join('|'));
}});
