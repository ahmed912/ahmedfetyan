// Round 5 buckets: journey at 390 and 1300 (Plan area: Projects page, buckets grid)
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const {openp,shot,run}=require('./h.js');
const SS=o=>JSON.stringify(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(q=>[q,v[q]])):v);
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?' '+x:''));if(!c)process.exitCode=1;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  for(const scheme of ['light','dark']){
  const pg=await openp(b,w,{when:'2026-11-14T09:00:00',scheme});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(200);};
  const T=()=>pg.evaluate(()=>JSON.parse(JSON.stringify(window.__data.tasks)));
  const bkId=async name=>pg.evaluate(n=>Object.entries(window.__data.tasks).find(([i,t])=>t.bucket&&t.title===n&&!t.archived)?.[0]||null,name);
  const undo=async()=>{await pg.click('#undoBar .ub-b');await R(400);};
  // 1 reach it from the nav
  await (w<700?pg.click('.m-tab:has-text("Projects")'):pg.click('.ptab[data-p="projects"]'));await R(600);
  ok('Projects page open with the buckets grid',await pg.locator('#bucketSec .bk-grid').isVisible());
  ok('old project cards hidden by default',!(await pg.locator('#projH').isVisible()));
  const cols=await pg.evaluate(()=>getComputedStyle(document.querySelector('.bk-grid')).gridTemplateColumns.split(' ').length);
  ok('columns '+cols,cols===(w===390?1:4),cols);
  ok('no horizontal overflow',await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  ok('empty state: no buckets shows New bucket card',(await pg.locator('.bk-new').count())===1&&(await pg.locator('.bk-card:not(.none)').count())===0);
  ok('Unbucketed card shows next 3 plus more',(await pg.locator('.bk-card.none .bk-row').count())===3&&(await pg.locator('.bk-card.none .bk-moreb').count())===1);
  if(scheme==='light')await shot(pg,'r18_empty_'+w);
  // 2 new bucket
  await pg.click('.bk-new');await R(500);
  await pg.fill('.ps-sheet .bk-name','Website');await pg.fill('.ps-sheet input[aria-label="Start date"]','2026-11-14');await pg.fill('.ps-sheet input[aria-label="End date"]','2026-12-02');
  await pg.click('.ps-sheet .bk-swb:nth-child(2)');await pg.click('.ps-sheet .btn:has-text("Save")');await R(700);
  const id=await bkId('Website');const d=id&&(await T())[id];
  ok('bucket doc fields',!!d&&d.bucket===true&&d.bStart==='2026-11-14'&&d.bEnd==='2026-12-02'&&d.bColor==='#2563EB'&&d.bState==='active'&&d.bNoSprint===false&&!d.date,JSON.stringify(d));
  const card=pg.locator('[data-bk="'+id+'"]');
  ok('card shows No tasks yet, dates and sprint labels',(await card.innerText()).includes('No tasks yet')&&(await card.innerText()).includes('14 Nov to 2 Dec')&&/S2, S3/.test(await card.innerText()),(await card.innerText()).replace(/\n/g,'|'));
  ok('add field focused',await pg.evaluate(i=>document.activeElement&&document.activeElement.closest('[data-bk="'+i+'"]')&&document.activeElement.tagName==='INPUT',id));
  // 3 add a task
  await pg.keyboard.type('Wireframes');await pg.keyboard.press('Enter');await R(700);
  let tk=Object.entries(await T()).find(([i,t])=>t.title==='Wireframes');
  ok('added task has parent, no date, cat',!!tk&&tk[1].parent===id&&!tk[1].date&&!!tk[1].cat,JSON.stringify(tk&&tk[1]));
  ok('progress line 0 of 1',(await card.innerText()).includes('0 of 1 done'));
  // 4 move a loose task in (drag on desktop, hold + menu on phone), then undo
  const looseRow=pg.locator('.bk-card.none .bk-row').first();const lid=await looseRow.getAttribute('data-id');const before=(await T())[lid].parent;
  if(w>=700){await looseRow.dragTo(card);await R(600);}
  else{const bb=await looseRow.boundingBox();await pg.mouse.move(bb.x+60,bb.y+bb.height/2);await pg.mouse.down();await R(700);await pg.mouse.up();await R(400);
    ok('hold opens the menu with Move to bucket',await pg.locator('.ps-sheet .btn:has-text("Move to bucket")').count()===1);
    await pg.click('.ps-sheet .btn:has-text("Move to bucket")');await R(400);await pg.click('.ps-sheet .ps-sh-row:has-text("Website")');await R(600);}
  ok('task moved into the bucket',(await T())[lid].parent===id);
  await undo();ok('undo restores parent',(await T())[lid].parent===before);
  await pg.evaluate(([l,i])=>{},[lid,id]);
  // move again and keep it for the Today check
  if(w>=700){await pg.locator('.bk-card.none .bk-row[data-id="'+lid+'"]').dragTo(card);await R(600);}
  else{const r=pg.locator('.bk-card.none .bk-row[data-id="'+lid+'"]');const bb=await r.boundingBox();await pg.mouse.move(bb.x+60,bb.y+bb.height/2);await pg.mouse.down();await R(700);await pg.mouse.up();await R(400);await pg.click('.ps-sheet .btn:has-text("Move to bucket")');await R(400);await pg.click('.ps-sheet .ps-sh-row:has-text("Website")');await R(600);}
  // 5 tick and reschedule
  const rid=tk[0];const row=card.locator('.bk-row[data-id="'+rid+'"]');
  await row.locator('input[type=checkbox]').click();await R(500);
  ok('tick sets done',(await T())[rid].done===true);
  await undo();ok('undo tick',!(await T())[rid].done);
  await card.locator('.bk-row[data-id="'+rid+'"] .bk-d').click();await R(500);
  ok('date chip opens Reschedule',(await pg.locator('.ps-sheet:has-text("Reschedule")').count())===1);
  await pg.click('.ps-sheet .rs-pick >> nth=0');await R(900);await pg.keyboard.press('Escape');await R(400);
  ok('rescheduled',!!(await T())[rid].date);
  ok('one-tap start on the top task only',(await card.locator('.bk-go').count())<=1&&(await pg.locator('.bk-card.none .bk-go').count())===1);
  ok('neutral wording, no red',!/overdue|late|behind/i.test(await pg.locator('#bucketSec').innerText()));
  // 6 menu: edit/rename, pause, archive, restore
  await pg.click('[data-bk="'+id+'"] .bk-more');await R(400);await pg.click('.ps-sheet .btn:has-text("Edit")');await R(400);
  await pg.fill('.ps-sheet .bk-name','Site');await pg.keyboard.press('Tab');await R(400);await pg.fill('.ps-sheet input[aria-label="End date"]','2026-12-10');await pg.keyboard.press('Tab');await R(400);
  await pg.click('.ps-sheet .bk-swb:nth-child(3)');await R(300);await pg.click('.ps-sheet .seg button:has-text("Paused")');await R(400);
  await pg.check('.ps-sheet input[aria-label="Outside sprints"]');await R(400);
  const e=(await T())[id];ok('edit writes fields',e.title==='Site'&&e.bEnd==='2026-12-10'&&e.bColor==='#7C3AED'&&e.bState==='paused'&&e.bNoSprint===true,JSON.stringify(e));
  await pg.keyboard.press('Escape');await R(500);
  ok('paused label and outside sprints',/Paused/.test(await pg.locator('[data-bk="'+id+'"]').innerText())&&/Outside sprints/.test(await pg.locator('[data-bk="'+id+'"]').innerText()));
  if(scheme==='light'||w===1300)await shot(pg,'r18_grid_'+w+'_'+scheme);
  const pre=await T();
  await pg.click('[data-bk="'+id+'"] .bk-more');await R(400);await pg.click('.ps-sheet .btn:has-text("Archive")');await R(700);
  ok('archive hides bucket',(await pg.locator('[data-bk="'+id+'"]').count())===0);
  const T2=await T();ok('archive hides its tasks',Object.entries(T2).filter(([i,t])=>t.parent===id).every(([i,t])=>t.archived&&t.cut));
  await undo();ok('undo archive brings both back',(await pg.locator('[data-bk="'+id+'"]').count())===1&&JSON.stringify(await T())===JSON.stringify(pre));
  await pg.click('[data-bk="'+id+'"] .bk-more');await R(400);await pg.click('.ps-sheet .btn:has-text("Archive")');await R(700);
  await pg.click('.bk-link:has-text("Archived buckets")');await R(400);await pg.click('.ps-sheet .mini:has-text("Restore")');await R(700);await pg.keyboard.press('Escape');await R(400);
  ok('restore brings bucket and tasks back',(await pg.locator('[data-bk="'+id+'"]').count())===1&&Object.entries(await T()).filter(([i,t])=>t.parent===id).every(([i,t])=>!t.archived&&!t.cut));
  // delete keep tasks, then undo deep-equals
  const pre2=await T();
  await pg.click('[data-bk="'+id+'"] .bk-more');await R(400);await pg.click('.ps-sheet .btn:has-text("Delete")');await R(400);await pg.click('.ps-sheet .btn:has-text("keep the tasks")');await R(700);
  const T3=await T();ok('delete keep: bucket gone, tasks parent null',!T3[id]&&Object.keys(pre2).filter(i=>pre2[i].parent===id).every(i=>T3[i]&&!T3[i].parent));
  await undo();ok('undo delete deep-equals',SS(await T())===SS(pre2));
  // delete with tasks
  await pg.click('[data-bk="'+id+'"] .bk-more');await R(400);await pg.click('.ps-sheet .btn:has-text("Delete")');await R(400);await pg.click('.ps-sheet .btn:has-text("bucket and tasks")');await R(700);
  const T4=await T();ok('delete with tasks: tasks archived',!T4[id]&&Object.keys(pre2).filter(i=>pre2[i].parent===id).every(i=>T4[i]&&T4[i].archived));
  await undo();ok('undo delete with tasks deep-equals',SS(await T())===SS(pre2));
  // Today shows the bucket name on a task dated today inside it
  const today=await pg.evaluate(()=>{const d=window.__data.tasks;return Object.entries(d).find(([i,t])=>t.date==='2026-11-14'&&!t.done&&!t.cut&&!t.archived&&!t.parent)?.[0];});
  if(today){await pg.evaluate(([i,b])=>{window.__data.tasks[i].parent=b;},[today,id]);}
  // empty bucket never shows in Today
  await pg.evaluate(()=>{});
  await (w<700?pg.click('.m-tab:has-text("Today")'):pg.click('.ptab[data-p="today"]'));await R(900);
  const tt=await pg.evaluate(()=>document.body.innerText);
  ok('Today does not list a bucket as a task',!/Site\n.*0 of/.test(tt));
  // nav reachable
  ok('no page errors',pg.errs.filter(x=>!/ERR_FAILED/.test(x)).length===0,pg.errs.filter(x=>!/ERR_FAILED/.test(x)).join('|'));
  await pg.context().close();}}});
