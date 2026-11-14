// Round 12 (weekly planning by chunks). Journey: Plan > Plan the week: Review (decide first), Intake, Plan the grid (tap a project, tap a block), Commit and Start on today's first chunk.
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const fs=require('fs');
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};d.entries={};d.sleep={};
  d.sprints={s2:{n:2,name:'Brand foundation',start:'2026-11-14',end:'2026-12-27',goal:'x'}};return d;};
const seed=async pg=>pg.evaluate(async()=>{const db=await window.claude.use('db');
  await db.doc('tasks/bk1').set({title:'Mugassam',bucket:true,bState:'active',order:1,done:false});
  await db.doc('tasks/bk2').set({title:'HASM',bucket:true,bState:'active',order:2,done:false});
  await db.doc('tasks/bk3').set({title:'Javelin',bucket:true,bState:'active',order:3,done:false});
  await db.doc('tasks/bk4').set({title:'Big pitch',bucket:true,bState:'active',order:4,done:false});
  for(let i=1;i<=6;i++)await db.doc('tasks/m'+i).set({title:'Mug step '+i,cat:'portfolio',parent:'bk1',mins:60,order:i,done:false});
  for(let i=1;i<=3;i++)await db.doc('tasks/h'+i).set({title:'HASM slide '+i,cat:'portfolio',parent:'bk2',mins:60,order:10+i,done:false});
  for(let i=1;i<=2;i++)await db.doc('tasks/j'+i).set({title:'Javelin page '+i,cat:'portfolio',parent:'bk3',mins:60,order:20+i,done:false});
  await db.doc('tasks/big1').set({title:'Pitch deck, all of it',cat:'client',parent:'bk4',mins:540,order:30,done:false});
  for(let i=1;i<=7;i++)await db.doc('tasks/l'+i).set({title:'Learn part '+i,cat:'learning',mins:30,order:40+i,done:false});
  for(let i=1;i<=2;i++)await db.doc('tasks/s'+i).set({title:'Reply batch '+i,cat:'linkedin',mins:30,order:60+i,done:false});
  await db.doc('tasks/in1').set({title:'Call the printer',inbox:true,done:false,order:70});
  await db.doc('tasks/w1').set({title:'Old audit',cat:'portfolio',parent:'bk1',date:'2026-11-10',mins:60,order:80,done:false,waiting:true,post:3,decide:true});});
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-14T08:00:00',real:JSON.stringify(base())});pg.on('console',m=>{if(m.type()==='warning')console.log('WARN',m.text().slice(0,300));});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(250);};
  await seed(pg);await R(600);
  const T=id=>pg.evaluate(id=>window.__data.tasks[id],id);
  const sheet=async()=>(await pg.locator('.ps-sheet').innerText()).replace(/\s+/g,' ');
  const U=()=>pg.evaluate(()=>{const b=document.querySelector('#v3ut:not([hidden]) .ub-b');b&&b.click();});
  const cell=(d,k)=>pg.locator('.wk-cell[data-d="'+d+'"][data-k="'+k+'"]');
  const chip=n=>pg.locator('.wk-chip',{hasText:n});
  // 1 Plan page has the entry, primary on Saturday
  await pg.evaluate(()=>__r2.setPage('projects'));await R(500);
  ok('Plan page has Plan the week',(await pg.locator('#wkBtn').count())===1);
  ok('primary on Saturday',!(await pg.locator('#wkBtn').getAttribute('class')).includes('ghost'));
  await pg.locator('#wkBtn').click();await R(500);
  let tx=await sheet();
  ok('review: work, learning, deadline, sleep, carried facts',/Work 0 of 48 h last week/.test(tx)&&/Learning 0 of 180 min/.test(tx)&&/deadline/i.test(tx)&&/Sleep/.test(tx)&&/Carried: 1 chunk/.test(tx),tx.slice(0,400));
  await shot(pg,'r28_review_'+w);
  // decide items must be decided
  await pg.locator('.ps-sheet .wk-next').click();await R(300);
  ok('decide first: stays on Review',/Decide first/.test(await sheet())&&/Review/.test(await pg.locator('.wk-st.on').innerText()));
  await pg.locator('.ps-sheet .rl-drop').click();await R(700);
  ok('dropped item gone from waiting',(await T('w1')).archived===true);
  if(!(await pg.locator('.ps-sheet .wk-next').count())){await pg.evaluate(()=>__wk.open());await R(500);}
  await pg.locator('.ps-sheet .wk-next').click();await R(400);
  // 2 intake: one at a time, bucket and mode
  tx=await sheet();ok('intake shows the inbox item, one at a time',/Inbox 1 of 1/.test(tx)&&/Call the printer/.test(tx),tx.slice(0,200));
  await pg.locator('.ps-sheet select[aria-label="Bucket"]').selectOption('bk3');await R(500);
  await pg.locator('.ps-sheet .ch-mode',{hasText:'Shallow'}).click();await R(500);
  await pg.locator('.ps-sheet .wk-sort').click();await R(500);
  const in1=await T('in1');ok('sorted: out of the inbox, in a bucket, shallow by default',in1.inbox===false&&in1.parent==='bk3'&&await pg.evaluate(()=>__ch.modeOf({...window.__data.tasks.in1,id:'in1'})==='shallow'),JSON.stringify([in1.inbox,in1.parent,in1.mode]));
  ok('empty inbox state',/Inbox is empty/.test(await sheet()));
  await shot(pg,'r28_intake_'+w);
  await pg.locator('.ps-sheet .wk-next').click();await R(400);
  // 3 grid
  const days=await pg.evaluate(()=>__wk.days(__wk.start()));
  ok('grid offers Sat to Thu, never Friday',days.join()==='2026-11-14,2026-11-15,2026-11-16,2026-11-17,2026-11-18,2026-11-19',days.join());
  ok('24 cells (6 days x 4 chunks)',(await pg.locator('.wk-cell').count())===24);
  // HASM on Sat B1 (today), Mugassam on Mon B1 then B2
  await chip('HASM').click();await R(200);await cell('2026-11-14','b1').click();await R(500);
  ok('Sat B1 holds the 3 HASM milestones',(await pg.evaluate(()=>['h1','h2','h3'].map(i=>window.__data.tasks[i].date+'|'+window.__data.tasks[i].slot).join()))==='2026-11-14|1,2026-11-14|1,2026-11-14|1');
  await chip('Mugassam').click();await R(200);await cell('2026-11-16','b1').click();await R(500);
  let mug=await pg.evaluate(()=>[1,2,3,4,5,6].map(i=>window.__data.tasks['m'+i].date||'-').join());
  ok('Mon B1 takes Mugassam up to 4 h, the rest stays',mug==='2026-11-16,2026-11-16,2026-11-16,2026-11-16,-,-',mug);
  await cell('2026-11-16','b2').click();await R(500);
  mug=await pg.evaluate(()=>[1,2,3,4,5,6].map(i=>window.__data.tasks['m'+i].date+'|'+window.__data.tasks['m'+i].slot).join());
  ok('the rest flows into Mon B2',mug==='2026-11-16|1,2026-11-16|1,2026-11-16|1,2026-11-16|1,2026-11-16|2,2026-11-16|2',mug);
  // one project per block
  await chip('Javelin').click();await R(200);await cell('2026-11-14','b1').click();await R(400);
  ok('Javelin cannot join HASM in Sat B1',(await T('j1')).date==null,JSON.stringify(await T('j1')));
  await cell('2026-11-17','b1').click();await R(500);ok('Javelin takes Tue B1',(await T('j1')).date==='2026-11-17'&&(await T('j1')).slot===1);
  // shallow cannot go into B1 or B2; it batches into one shallow chunk
  await chip('Shallow').click();await R(200);await cell('2026-11-18','b1').click();await R(400);
  ok('shallow item cannot be dropped into B1',(await T('s1')).date==null&&/stays in the shallow batch/.test(await pg.evaluate(()=>document.body.innerText)));
  await cell('2026-11-18','shallow').click();await R(500);
  ok('shallow batch holds the 3 shallow items on Wed',(await pg.evaluate(()=>['s1','s2','in1'].map(i=>window.__data.tasks[i].date).join()))==='2026-11-18,2026-11-18,2026-11-18');
  // learning fills each day's learning chunk
  await chip('Learning').click();await R(200);
  for(const d of ['2026-11-14','2026-11-15','2026-11-16','2026-11-17']){await cell(d,'learn').click();await R(400);}
  const ln=await pg.evaluate(()=>[1,2,3,4,5,6,7].map(i=>window.__data.tasks['l'+i].date||'-').join());
  ok('learning: 2 tasks (60 min) a day, 7 placed',ln==='2026-11-14,2026-11-14,2026-11-15,2026-11-15,2026-11-16,2026-11-16,2026-11-17',ln);
  ok('a day without learning is flagged',(await pg.locator('.wk-row[data-d="2026-11-19"] .wk-flag').innerText()).includes('No learning')&&(await pg.locator('.wk-row[data-d="2026-11-14"] .wk-flag').count())===0);
  // heroic plan flagged, then cleared by tap fallback with Undo
  await chip('Big pitch').click();await R(200);await cell('2026-11-19','b1').click();await R(500);
  ok('heroic day flagged',/Heavy: 9 h planned/.test(await pg.locator('.wk-row[data-d="2026-11-19"] .wk-flag').innerText()));
  await shot(pg,'r28_grid_'+w);
  await cell('2026-11-19','b1').click();await R(300);
  ok('filled block offers Clear it',(await pg.locator('.ps-sheet .wk-clear').count())===1);
  await pg.locator('.ps-sheet .wk-clear').click();await R(500);
  ok('cleared: back in the pool',(await T('big1')).date==null);
  await U();await R(500);
  ok('Undo puts it back',(await T('big1')).date==='2026-11-19');
  // 4 commit
  if(!(await pg.locator('.ps-sheet .wk-next').count())){await pg.evaluate(()=>__wk.open());await R(400);}
  await pg.locator('.ps-sheet .wk-next').click();await R(400);
  tx=await sheet();
  ok('commit facts: work, blocks, learning days, Gate',/Work 20 of 48 h in 5 deep blocks/.test(tx)&&/Learning 4 of 6 days/.test(tx)&&/Gate 1: 3 Jan/.test(tx)&&/Heavy: Thu/.test(tx),tx.slice(0,400));
  await shot(pg,'r28_commit_'+w);
  await pg.locator('.ps-sheet .wk-go').click();await R(900);
  const pl=await pg.evaluate(()=>window.__data.plans&&window.__data.plans['2026-11-14']);
  ok('plan stored with the chunk map',!!pl&&pl.committed===true&&!!pl.map['2026-11-16|b1']&&pl.map['2026-11-16|b1'].length===4&&pl.map['2026-11-14|b1'].length===3,JSON.stringify(pl&&Object.keys(pl.map)));
  // Start on today's first chunk: War opens on HASM, one target
  ok('Start opens War on today\'s first chunk',/HASM/.test(await pg.locator('.ps-sheet').innerText()));
  ok('no page errors',pg.errs.filter(e=>!/Failed to load resource/.test(e)).length===0,pg.errs.join('|'));
  await pg.close();}});
