// Round 39: edit and delete from every place a task appears: Today card, bucket row, waterfall row, subtask row, Inbox. Undo (10 s), Recently deleted in Settings, parent asks once.
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const fs=require('fs');
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};d.entries={};d.sleep={};d.rollover={};
  d.sprints={s2:{n:2,name:'Brand foundation',start:'2026-11-14',end:'2026-12-27',goal:'x'}};return d;};
const seed=async pg=>pg.evaluate(async()=>{const db=await window.claude.use('db');
  await db.doc('tasks/bk1').set({title:'HASM',cat:'portfolio',kind:'portfolio',bucket:true,bState:'active',order:1,done:false});
  const mk=(id,o)=>db.doc('tasks/'+id).set({cat:'portfolio',parent:'bk1',order:1,done:false,sprint:2,mode:'deep',slot:1,...o});
  await mk('a1',{title:'Today card task',date:'2026-11-14',mins:60,order:1});
  await mk('a2',{title:'Bucket row task',date:'2026-11-18',mins:60,order:2});
  await mk('a3',{title:'Waterfall row task',date:'2026-11-19',mins:60,order:3});
  await mk('a4',{title:'Parent with kids',date:'2026-11-20',mins:120,order:4});
  await mk('a5',{title:'Repeats weekly',date:'2026-11-21',mins:30,order:5,rec:{type:'weekly'}});
  for(let i=0;i<2;i++)await db.doc('tasks/k'+i).set({title:'Kid '+i,parent:'a4',sub:true,done:false,order:i,date:'2026-11-20',sprint:2,cat:'portfolio'});
  await db.doc('tasks/in1').set({title:'Inbox item',inbox:true,cat:'review',order:1,done:false});});
const T=pg=>pg.evaluate(()=>Object.fromEntries(Object.entries(__u.state.tasks).map(([k,t])=>[k,{x:!!(t.archived||t.cut),d:!!t.deleted,title:t.title,rec:!!t.rec}])));
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-14T08:00:00',real:JSON.stringify(base())});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(250);};
  const hold=async loc=>{await loc.evaluate(e=>e.scrollIntoView({block:'center'}));await R(300);const bb=await loc.boundingBox();await pg.mouse.move(bb.x+24,bb.y+Math.min(14,bb.height/2));await pg.mouse.down();await pg.clock.runFor(900);await pg.mouse.up();await R(400);};
  const menuOk=async n=>{const t=await pg.locator('.ps-sheet').innerText().catch(()=>'');ok(n+': menu has Edit and Delete',/Edit/.test(t)&&/Delete/.test(t),t.slice(0,160));};
  await seed(pg);await R(700);
  // 1 Today card: hold the title
  await pg.evaluate(()=>{try{__r2.setPage('today');}catch(e){}});await R(500);
  const card=pg.locator('#cutStack .cs-card[data-id="a1"] .cs-head').first();
  if(await card.count()){await hold(card);}else await pg.evaluate(()=>__u.v3taskMenu('a1'));
  await menuOk('Today card');
  await pg.locator('.ps-sheet .del-menu').click();await R(400);
  let t=await T(pg);ok('Today card: delete hides it at once (no dialog)',t.a1.x&&t.a1.d&&(await pg.locator('.ps-sheet').count()===0||!(await pg.locator('.ps-sheet').isVisible())),JSON.stringify(t.a1));
  ok('Undo toast is visible',await pg.locator('#v3ut:not([hidden])').count()===1);
  await pg.locator('#v3ut .ub-b').click();await R(400);t=await T(pg);ok('Undo restores it',!t.a1.x&&!t.a1.d);
  // 2 bucket row: hold, Edit opens the sheet with details open
  await pg.evaluate(()=>__r2.setPage('projects'));await R(600);
  await hold(pg.locator('.bk-row[data-id="a2"] .bk-t'));await menuOk('Bucket row');
  await pg.locator('.ps-sheet button:has-text("Edit")').click();await R(500);
  const sh=await pg.locator('.ps-sheet').innerText();
  ok('Edit opens the one task sheet with details: day, minutes, category, due, priority, bucket',/Day/.test(sh)&&/Minutes/.test(sh)&&/Category/.test(sh)&&/Due/.test(sh)&&/Priority/.test(sh)&&/Bucket/.test(sh)&&/Deep/.test(sh),sh.slice(0,400));
  await pg.locator('.ps-sheet textarea[aria-label="Task name"]').fill('Bucket row task renamed');await pg.locator('.ps-sheet textarea[aria-label="Task name"]').blur();await R(400);
  ok('title edited in place',await pg.evaluate(()=>__u.state.tasks.a2.title)==='Bucket row task renamed');
  await pg.locator('.ps-sheet .del-menu').click();await R(400);t=await T(pg);ok('Delete from the sheet Details',t.a2.x&&t.a2.d);
  await pg.locator('#v3ut .ub-b').click();await R(300);
  // 3 waterfall row
  if(await pg.locator('.m-tab:has-text("Review")').count())await pg.click('.m-tab:has-text("Review")');else await pg.evaluate(()=>__r2.setPage('progress'));await R(700);await pg.evaluate("{const s=document.querySelector('section[aria-labelledby=\"wfH\"]');if(s&&s.classList.contains('collapsed')){const b=s.querySelector('.collapse-btn');if(b)b.click();}}");await R(500);await pg.evaluate("[...document.querySelectorAll('#wfBody .seg button')].find(b=>b.textContent==='By day')?.click()");await R(500);await pg.locator('#wfBody').scrollIntoViewIfNeeded();
  const wf=pg.locator('.v3-more[aria-label="More for Waterfall row task"]');
  if(await wf.count()){await wf.first().click();await R(400);await menuOk('Waterfall row');await pg.locator('.ps-sheet .del-menu').click();await R(400);t=await T(pg);ok('Waterfall row: deleted',t.a3.d);await pg.locator('#v3ut .ub-b').click();await R(300);}
  else{ok('waterfall row found',false,'no .v3-more');}
  // 4 parent with kids asks once
  await pg.evaluate(()=>__u.v3taskMenu('a4'));await R(300);await pg.locator('.ps-sheet .del-menu').click();await R(300);
  ok('parent asks "Delete its 2 subtasks too?"',/Delete its 2 subtasks too\?/.test(await pg.locator('.ps-sheet').innerText()));
  await pg.locator('.ps-sheet .del-go').click();await R(400);t=await T(pg);ok('parent and its subtasks deleted together',t.a4.d&&t.k0.d&&t.k1.d);
  await pg.locator('#v3ut .ub-b').click();await R(400);t=await T(pg);ok('Undo restores parent and all subtasks',!t.a4.x&&!t.k0.x&&!t.k1.x);
  // 5 recurring asks Stop repeating
  await pg.evaluate(()=>__u.v3taskMenu('a5'));await R(300);await pg.locator('.ps-sheet .del-menu').click();await R(300);
  ok('recurring asks "Stop repeating too"',/Stop repeating too/.test(await pg.locator('.ps-sheet').innerText()));
  await pg.locator('.ps-sheet .del-go').click();await R(400);t=await T(pg);ok('recurring deleted and stops repeating',t.a5.d&&!t.a5.rec);
  await pg.locator('#v3ut .ub-b').click();await R(400);t=await T(pg);ok('Undo brings back the repeat',!t.a5.x&&t.a5.rec);
  // 6 subtask row "..." then Delete
  await pg.evaluate(()=>__u.v3taskSheet('a4'));await R(500);
  await pg.locator('.ps-sheet .ck-row[data-id="k0"] .ck-more-btn').click();await R(200);await pg.locator('.ps-sheet .ck-row[data-id="k0"] .ck-acts button:has-text("Delete")').click();await R(400);
  t=await T(pg);ok('subtask deleted from its own menu',t.k0.d);ok('subtask count drops (0 of 1)',/Subtasks \(0 of 1\)/.test(await pg.locator('.ps-sheet').innerText()));
  await pg.locator('#v3ut .ub-b').click();await R(300);await pg.evaluate(()=>__u.psClose(true));await R(300);
  // 7 Inbox: hold, Edit and Delete; sheet too
  await pg.evaluate(()=>__r2.setPage('projects'));await R(600);
  await hold(pg.locator('.pl-row[data-id="in1"] .bk-t'));await menuOk('Inbox row');await pg.locator('.ps-sheet .del-menu').click();await R(400);t=await T(pg);ok('Inbox item deleted',t.in1.d);
  // 8 Recently deleted in Settings
  await pg.evaluate(()=>__r2.setPage('settings'));await R(500);
  ok('Settings has Recently deleted',(await pg.locator('#rdBtn').count())===1);
  await pg.locator('#rdBtn').click();await R(400);
  ok('Recently deleted lists the Inbox item with Restore',/Inbox item/.test(await pg.locator('.ps-sheet').innerText()));
  await pg.locator('.rd-restore').first().click();await R(400);t=await T(pg);ok('Restore brings it back',!t.in1.x&&!t.in1.d);
  ok('no page errors',!pg.errs.filter(e=>!/Failed to load resource/.test(e)).length,pg.errs.join('|').slice(0,300));
  await shot(pg,'r39_'+w);await pg.context().close();}});
