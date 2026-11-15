// Round 56: bucket tasks. Hold-drag reorder (shared with Today), swipe left = Schedule only, swipe right = Done / Archive pair, Archived n row with Restore, one shared path
const fs=require('fs');const {openp,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};d.entries={};d.sleep={};d.rollover={};d.sprints={s2:{n:2,name:'Brand foundation',start:'2026-11-14',end:'2026-12-27',goal:'x'}};return d;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-14T08:00:00',real:JSON.stringify(base())});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(250);};
  await pg.evaluate(async()=>{const db=await window.claude.use('db');
    await db.doc('tasks/bkH').set({title:'HASM showcase',cat:'portfolio',kind:'portfolio',bucket:true,bState:'active',order:1,done:false,bStart:'2026-11-10',bEnd:'2026-11-30',bColor:'#2563EB'});
    await db.doc('tasks/bkP').set({title:'Later brand',cat:'setup',bucket:true,bState:'active',order:2,done:false,bStart:'2027-02-01',bEnd:'2027-02-20'});
    for(const [i,t,o] of [['h1','Wireframes',1],['h2','Moodboard',2],['h3','Type scale',3],['h4','Icons',4]])await db.doc('tasks/'+i).set({title:t,cat:'portfolio',parent:'bkH',order:o,done:false,date:'2026-11-14',sprint:2});
    for(const [i,t,o] of [['p1','Brand story',1],['p2','Brand voice',2]])await db.doc('tasks/'+i).set({title:t,cat:'setup',parent:'bkP',order:o,done:false,date:'2027-02-02',sprint:3});});await R(800);
  await pg.evaluate("__r2.setPage('projects')");await R(800);
  const T=()=>pg.evaluate(()=>JSON.parse(JSON.stringify(window.__data.tasks)));
  const ids=sel=>pg.locator(sel+' .bk-row').evaluateAll(r=>r.map(x=>x.dataset.id));
  const C='.bk-card[data-bk="bkH"]';
  const tt=(sel,id)=>pg.locator(sel+' .bk-row[data-id="'+id+'"] .bk-t');
  const pt=async l=>{await l.evaluate(e=>{const r=e.getBoundingClientRect();if(r.top<80||r.bottom>innerHeight-130)e.scrollIntoView({block:'center'});});const bb=await l.boundingBox();return {x:bb.x+bb.width/2,y:bb.y+bb.height/2};};
  // --- reorder by hold and drag in the card
  const before=await ids(C);ok('card lists the open tasks (first three shown)',before.length===3,before.join());
  const a=await pt(tt(C,before[2])),b0=await pt(tt(C,before[0]));
  await pg.mouse.move(a.x,a.y);await pg.mouse.down();await R(700);await pg.mouse.move(a.x,(a.y+b0.y)/2,{steps:4});await pg.mouse.move(a.x,b0.y-8,{steps:4});await R(100);await pg.mouse.up();await R(700);
  const after=await ids(C);ok('hold and drag moves the third task to the top',after[0]===before[2]&&after.length===3,after.join());
  let t=await T();ok('saved order is the pos field Today uses',t[before[2]].pos!=null&&t[before[2]].pos<t[before[0]].pos,JSON.stringify([t[before[2]].pos,t[before[0]].pos]));
  await pg.evaluate("__r2.setPage('today')");await R(800);
  const txt=await pg.evaluate("document.body.innerText"),i3=txt.indexOf("Type scale"),i1=txt.indexOf("Wireframes");
  ok('Today cards follow the same order',i3>=0&&i1>=0&&i3<i1,i3+' '+i1);
  await pg.evaluate("__r2.setPage('projects')");await R(800);
  ok('Undo bar offered, Undo restores the order',await pg.locator('#v3ut').isVisible());
  await pg.click('#v3ut .ub-b');await R(700);ok('order is back',(await ids(C)).join()===before.join(),(await ids(C)).join());
  // --- swipe left = Schedule only
  const sw=async(id,dx,sel)=>{const p=await pt(tt(sel||C,id));await pg.mouse.move(p.x,p.y);await pg.mouse.down();await pg.mouse.move(p.x+dx/2,p.y,{steps:4});await pg.mouse.move(p.x+dx,p.y,{steps:4});await pg.mouse.up();await R(600);};
  await sw(before[0],-160);
  ok('swipe left opens Schedule with a date picker and no shortcuts',(await pg.locator('.ps-sheet input[type="date"]').count())===1&&(await pg.locator('.ps-sheet .rs-pick').count())===0&&/Schedule/.test(await pg.locator('.ps-sheet').first().innerText()));
  await pg.locator('.ps-sheet input[type="date"]').fill('2026-12-02');await R(900);
  t=await T();ok('picking a day moves the task and its sprint',t[before[0]].date==='2026-12-02'&&t[before[0]].sprint===2,JSON.stringify(t[before[0]]));
  if(await pg.locator('.ps-sheet').count()){await pg.keyboard.press('Escape');await R(400);}
  // --- swipe right = Done and Archive pair
  await sw(before[1],160);
  ok('swipe right shows Done and Archive as a pair',(await pg.locator('.ps-sheet .bk-p-done').count())===1&&(await pg.locator('.ps-sheet .bk-p-arch').count())===1);
  await pg.click('.ps-sheet .bk-p-arch');await R(900);
  t=await T();ok('Archive archives the task',t[before[1]].archived===true,JSON.stringify(t[before[1]]));
  if(await pg.locator('#v3Conf').count()){await pg.click('#v3Conf .btn:not(.ghost)');await R(600);}
  ok('archived row is collapsed with a count',(await pg.locator(C+' .bk-arch-b').innerText())==='Archived 1'&&(await pg.locator(C+' .bk-arch-l').count())===0);
  await pg.locator(C+' .bk-arch-b').click();await R(500);
  ok('opening it lists the task with Restore',(await pg.locator(C+' .bk-restore').count())===1);
  await pg.locator(C+' .bk-restore').click();await R(900);
  t=await T();ok('Restore brings it back',!t[before[1]].archived&&(await pg.locator(C+' .bk-arch-b').count())===0,JSON.stringify(t[before[1]]));
  await sw(before[2],160);await pg.click('.ps-sheet .bk-p-done');await R(900);
  t=await T();ok('Done marks it done at once',t[before[2]].done===true);
  // --- hold menu has Archive
  const rest=(await ids(C))[0];const hp=await pt(tt(C,rest));await pg.mouse.move(hp.x,hp.y);await pg.mouse.down();await R(900);await pg.mouse.up();await R(500);
  ok('hold menu has Archive',(await pg.locator('.ps-sheet button',{hasText:/^Archive/}).count())===1);
  await pg.keyboard.press('Escape');await R(400);
  // --- the bucket sheet
  await pg.locator(C+' .bk-title').click();await R(700);
  const SS='.ps-sheet';ok('sheet lists open tasks',(await ids(SS)).length>=1);
  const sids=await ids(SS);
  if(sids.length>=2){const x=await pt(tt(SS,sids[sids.length-1])),y=await pt(tt(SS,sids[0]));
    await pg.mouse.move(x.x,x.y);await pg.mouse.down();await R(700);await pg.mouse.move(x.x,(x.y+y.y)/2,{steps:4});await pg.mouse.move(x.x,y.y-8,{steps:4});await R(100);await pg.mouse.up();await R(900);
    const s2=await ids(SS);ok('sheet reorders by hold and drag',s2[0]===sids[sids.length-1],s2.join());}
  await sw(sids[0],-160,SS);ok('sheet swipe left is Schedule only',(await pg.locator('.ps-sheet input[type="date"]').count())===1&&(await pg.locator('.ps-sheet .rs-pick').count())===0);
  await pg.keyboard.press('Escape');await R(400);await pg.keyboard.press('Escape');await R(400);
  // --- a bucket outside the current sprint reflects at once
  const P='.bk-card[data-bk="bkP"]';
  if(await pg.locator(P).count()){const cnt=()=>pg.locator('.bk-card[data-bk="bkP"] .bk-sub').innerText();const c0=await cnt();
    await sw('p1',160,P);await pg.click('.ps-sheet .bk-p-done');await R(900);
    ok('done in a bucket outside the sprint updates its count at once',(await cnt())!==c0,c0+' -> '+await cnt());
    t=await T();ok('and the stored sprint stays that of its day',t.p1.done===true&&t.p1.sprint===3,JSON.stringify(t.p1));}
  else ok('later bucket present',false);
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,4));await pg.context().close();}
});
