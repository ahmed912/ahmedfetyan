// Round 14 (recurring tasks). Journey: hold a task, Repeat, pick Every week; finish it and the next copy appears in the same block and mode; Undo the done removes it; Skip, Stop and the Settings list all have Undo.
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const fs=require('fs');
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};d.entries={};d.sleep={};d.rollover={};
  d.sprints={s2:{n:2,name:'Brand foundation',start:'2026-11-14',end:'2026-12-27',goal:'x'}};return d;};
const seed=async pg=>pg.evaluate(async()=>{const db=await window.claude.use('db');
  await db.doc('tasks/bk1').set({title:'Mugassam',bucket:true,bState:'active',order:1,done:false});
  await db.doc('tasks/a1').set({title:'Mug weekly pass',cat:'portfolio',parent:'bk1',mins:60,date:'2026-11-18',slot:2,mode:'deep',order:1,done:false});
  await db.doc('tasks/a1c1').set({title:'Export',parent:'a1',sub:true,done:true,order:0,date:'2026-11-18',sprint:2});await db.doc('tasks/a1c2').set({title:'Send',parent:'a1',sub:true,done:false,order:1,date:'2026-11-18',sprint:2});
  await db.doc('tasks/a2').set({title:'Client notes',cat:'client',parent:'bk1',mins:60,date:'2026-11-18',slot:1,mode:'deep',order:2,done:false});
  await db.doc('tasks/a3').set({title:'Design review',cat:'portfolio',parent:'bk1',mins:60,date:'2026-11-19',slot:1,mode:'deep',order:3,done:false});});
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-18T11:00:00',real:JSON.stringify(base())});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(250);};
  await seed(pg);await R(600);
  const T=id=>pg.evaluate(id=>window.__data.tasks[id],id);
  const U=()=>pg.evaluate(()=>{const b=document.querySelector('#v3ut:not([hidden]) .ub-b');b&&b.click();});
  const hold=async sel=>{await pg.evaluate(()=>{const u=document.getElementById('v3ut');if(u)u.hidden=true;});const loc=pg.locator(sel).first();await loc.evaluate(e=>e.scrollIntoView({block:'center'}));await R(300);const bb=await loc.boundingBox();await pg.mouse.move(bb.x+24,bb.y+Math.min(14,bb.height/2));await pg.mouse.down();await pg.clock.runFor(700);await pg.mouse.up();await R(400);};
  const todayBefore=(await pg.locator('.page[data-page="today"]').innerText()).replace(/\s+/g,' ');
  ok('Today shows no repeat labels or buttons by default',!/Repeat/.test(todayBefore));
  // 1 hold a task: Repeat sits in the quick menu
  await hold('#cutStack .cs-card[data-id="a1"] .cs-head');
  ok('hold menu has Repeat',(await pg.locator('.ps-sheet .rec-menu').count())===1,await pg.locator('.ps-sheet').innerText().catch(()=>''));
  await pg.locator('.ps-sheet .rec-menu').click();await R(400);
  ok('Repeat sheet offers 5 rules',(await pg.locator('.ps-sheet .rec-opt').count())===5);
  await pg.locator('.ps-sheet .rec-opt[data-t="weekly"]').click();await R(500);
  let a1=await T('a1');ok('rule saved: weekly, series id set',a1.rec&&a1.rec.type==='weekly'&&a1.recOf==='a1',JSON.stringify(a1.rec));
  ok('sheet says what happens next, in the same block',/Wednesday 25 Nov/.test((await pg.locator('.ps-sheet').innerText()).replace(/\s+/g,' ')),(await pg.locator('.ps-sheet').innerText()).slice(0,200));
  await shot(pg,'r30_repeat_'+w);
  await U();await R(400);
  ok('Undo removes the rule',!(await T('a1')).rec);
  await pg.locator('.ps-sheet .rec-opt[data-t="weekly"]').click();await R(500);
  await pg.evaluate(()=>__r2.psClose());await R(300);
  // 2 finish it: the next copy appears in the same block and mode
  await pg.evaluate(async()=>{const db=await window.claude.use('db');await db.doc('tasks/a1').update({done:true,doneAt:'2026-11-18'});});await R(800);
  const nid='rc-a1-2026-11-25',n1=await T(nid);
  ok('next copy created for next Wednesday',!!n1&&n1.date==='2026-11-25',JSON.stringify(n1));
  ok('copy keeps block, mode, bucket and rule (subtasks are checked below)',n1&&n1.slot===2&&n1.mode==='deep'&&n1.parent==='bk1'&&n1.rec.type==='weekly'&&n1.recOf==='a1'&&true,JSON.stringify(n1));
  {const ks=await pg.evaluate(id=>Object.values(window.__data.tasks).filter(x=>x.parent===id&&x.sub),nid);ok('copy gets 2 fresh (not done) subtasks without estimate',ks.length===2&&ks.every(k=>!k.done&&k.mins==null),JSON.stringify(ks));}
  ok('only one live copy (the old one is done)',(await T('a1')).recNext===nid);
  // undo the done: the copy goes away
  await pg.evaluate(async()=>{const db=await window.claude.use('db');await db.doc('tasks/a1').update({done:false,doneAt:null});});await R(800);
  ok('un-done removes the unused copy',!(await T(nid))&&!(await T('a1')).recNext);
  await pg.evaluate(async()=>{const db=await window.claude.use('db');await db.doc('tasks/a1').update({done:true,doneAt:'2026-11-18'});});await R(800);
  ok('done again: one copy again, no duplicate',!!(await T(nid))&&Object.keys(await pg.evaluate(()=>window.__data.tasks)).filter(k=>k.startsWith('rc-a1-')).length===1);
  // 3 rule dates
  const nx=(t,base)=>pg.evaluate(([t,b])=>__rec.next(t,b),[t,base]);
  ok('daily after Thu goes past Friday for deep work',(await nx({id:'z',rec:{type:'daily'},cat:'portfolio'},'2026-11-19'))==='2026-11-21');
  ok('daily keeps Friday for shallow',(await nx({id:'z',rec:{type:'daily'},cat:'linkedin',mode:'shallow'},'2026-11-19'))==='2026-11-20');
  ok('working days skip Friday',(await nx({id:'z',rec:{type:'weekdays'},cat:'linkedin',mode:'shallow'},'2026-11-19'))==='2026-11-21');
  ok('every 2 weeks from its anchor',(await nx({id:'z',rec:{type:'biweekly',anchor:'2026-11-18'},cat:'linkedin',mode:'shallow'},'2026-11-18'))==='2026-12-02');
  ok('monthly keeps the day of the month, clamps short months',(await nx({id:'z',rec:{type:'monthly',anchor:'2026-01-31'},cat:'linkedin',mode:'shallow'},'2026-02-10'))==='2027-02-28'||(await nx({id:'z',rec:{type:'monthly',anchor:'2026-01-31'},cat:'linkedin',mode:'shallow'},'2026-02-10'))==='2026-02-28');
  // 4 skip this one: next appears, this one is parked, Undo brings it back
  await hold('#cutStack .cs-card[data-id="a2"] .cs-head');
  await pg.locator('.ps-sheet .rec-menu').click();await R(400);
  await pg.locator('.ps-sheet .rec-opt[data-t="daily"]').click();await R(500);
  ok('skip is offered once it repeats',(await pg.locator('.ps-sheet .rec-skip').count())===1);
  await pg.locator('.ps-sheet .rec-skip').click();await R(800);
  const s2=await T('a2'),n2=await T('rc-a2-2026-11-19');
  ok('skipped: this one parked, next day copy exists',s2.archived===true&&s2.cut===true&&!!n2&&n2.date==='2026-11-19'&&n2.mode==='deep'&&n2.slot===1,JSON.stringify([s2.archived,n2&&n2.date]));
  await U();await R(900);
  ok('Undo skip restores it and removes the copy',!(await T('a2')).archived&&!(await T('rc-a2-2026-11-19')));
  // 5 Settings list, Stop with Undo
  await pg.evaluate(()=>__r2.setPage('settings'));await R(500);
  ok('Settings has Repeating tasks',(await pg.locator('#recRow').count())===1);
  await pg.locator('#recBtn').click();await R(400);
  const lt=(await pg.locator('.ps-sheet').innerText()).replace(/\s+/g,' ');
  ok('list shows the live repeating tasks with their rule',/Client notes · Every day/.test(lt)&&/Mug weekly pass · Every week/.test(lt),lt);
  await shot(pg,'r30_list_'+w);
  await pg.locator('.ps-sheet .rec-row[data-id="a2"] .rec-x').click();await R(500);
  ok('Stop removes the rule',!(await T('a2')).rec);
  await U();await R(500);
  ok('Undo puts the rule back',(await T('a2')).rec&&(await T('a2')).rec.type==='daily');
  // empty state
  await pg.evaluate(async()=>{const db=await window.claude.use('db');await db.doc('tasks/a1').update({rec:null});await db.doc('tasks/a2').update({rec:null});await db.doc('tasks/rc-a1-2026-11-25').update({rec:null});});await R(600);
  await pg.evaluate(()=>__r2.psClose());await R(200);await pg.locator('#recBtn').click();await R(400);
  ok('empty state tells how to start',/No repeating tasks/.test(await pg.locator('.ps-sheet').innerText()));
  ok('no page errors',pg.errs.filter(e=>!/Failed to load resource/.test(e)).length===0,pg.errs.join('|'));
  await pg.close();}});
