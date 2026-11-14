// Round 46: buckets. A task added to an active bucket shows on Today at once; every bucket task can be deleted (hold menu, 10 s Undo); tapping a bucket opens the whole bucket as a sheet
const fs=require('fs');const {openp,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};d.entries={};d.sleep={};d.rollover={};d.sprints={s2:{n:2,name:'Brand foundation',start:'2026-11-14',end:'2026-12-27',goal:'x'}};return d;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-14T08:00:00',real:JSON.stringify(base())});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(250);};
  await pg.evaluate(async()=>{const db=await window.claude.use('db');
    await db.doc('tasks/bkH').set({title:'HASM showcase',cat:'portfolio',kind:'portfolio',bucket:true,bState:'active',order:1,done:false,bStart:'2026-11-10',bEnd:'2026-11-30',bColor:'#2563EB'});
    for(const [i,t] of [['h1','Wireframes'],['h2','Moodboard']])await db.doc('tasks/'+i).set({title:t,cat:'portfolio',parent:'bkH',order:i==='h1'?1:2,done:false,date:'2026-11-16',sprint:2});});await R(800);
  await pg.evaluate("__r2.setPage('projects')");await R(800);
  const card=pg.locator('.bk-card[data-bk="bkH"]');
  const inp=card.locator('.bk-add input');await inp.scrollIntoViewIfNeeded();await inp.fill('Case study intro');await inp.press('Enter');await R(800);
  const T=()=>pg.evaluate(()=>JSON.parse(JSON.stringify(window.__data.tasks)));
  let t=await T();const nid=Object.keys(t).find(k=>t[k].title==='Case study intro');
  ok('the new task has a date and a sprint',!!nid&&t[nid].date==='2026-11-14'&&t[nid].sprint===2,JSON.stringify(t[nid]));
  await pg.evaluate("__r2.setPage('today')");await R(800);
  ok('Today shows it at once',(await pg.locator('body').innerText()).includes('Case study intro'));
  await pg.evaluate("__r2.setPage('projects')");await R(800);
  // hold menu on a bucket row, Delete, Undo
  const row=()=>pg.locator('.bk-card[data-bk="bkH"] .bk-row[data-id="h1"]');
  await row().scrollIntoViewIfNeeded();const bb=await row().locator('.bk-t').boundingBox();
  await pg.mouse.move(bb.x+20,bb.y+bb.height/2);await pg.mouse.down();await R(900);await pg.mouse.up();await R(500);
  ok('hold opens the task menu with Delete',(await pg.locator('.ps-sheet .del-menu').count())===1);
  await pg.click('.ps-sheet .del-menu');await R(700);
  t=await T();ok('Delete removes it from the bucket card',(await row().count())===0&&t.h1.cut===true&&!!t.h1.deleted,JSON.stringify(t.h1));
  ok('Undo bar is there for 10 s',await pg.locator('#v3ut').isVisible());
  await pg.click('#v3ut .ub-b');await R(700);
  ok('Undo brings it back',(await row().count())===1&&!(await T()).h1.cut);
  // tap the bucket: the whole bucket in a sheet
  await pg.locator('.bk-card[data-bk="bkH"] .bk-title').click();await R(700);
  ok('tap opens a bucket sheet, not the edit form',(await pg.locator('.ps-sheet .bks-list').count())===1&&(await pg.locator('.ps-sheet input[aria-label="Bucket name"]').count())===0);
  ok('the sheet lists every open task below the header',(await pg.locator('.ps-sheet .bks-list .bk-row').count())===3);
  ok('Select, add task line and Edit bucket are there',(await pg.locator('.ps-sheet .bks-sel').count())===1&&(await pg.locator('.ps-sheet .bk-add input').count())===1&&(await pg.locator('.ps-sheet .bks-edit').count())===1);
  const sin=pg.locator('.ps-sheet .bk-add input');await sin.fill('Final render');await sin.press('Enter');await R(900);
  ok('adding in the sheet lists the new task',(await pg.locator('.ps-sheet .bks-list .bk-row').count())===4);
  // delete from the sheet via the row's hold menu
  const sr=pg.locator('.ps-sheet .bks-list .bk-row[data-id="h2"] .bk-t');const sb=await sr.boundingBox();
  await pg.mouse.move(sb.x+20,sb.y+sb.height/2);await pg.mouse.down();await R(900);await pg.mouse.up();await R(500);
  if(await pg.locator('.ps-sheet .del-menu').count()){await pg.click('.ps-sheet .del-menu');await R(700);}
  ok('Delete works for a task opened from the bucket sheet',(await T()).h2.cut===true);
  await pg.click('#v3ut .ub-b');await R(500);ok('and Undo restores it',!(await T()).h2.cut);
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,4));await pg.context().close();}
});
