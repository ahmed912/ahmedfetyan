// Round 37 (one concept: subtasks). Journey at 390 and 1300: open a task that has subtasks: ONE list "Subtasks (n of m)", no Steps section, no time on subtask rows,
// the task's own estimate is editable in the header, no Move up/down anywhere, hold-drag reorders subtasks, subtasks never count as tasks.
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const fs=require('fs');
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};d.entries={};d.sleep={};d.rollover={};
  d.sprints={s2:{n:2,name:'Brand foundation',start:'2026-11-14',end:'2026-12-27',goal:'x'}};return d;};
const SUBS=['Sketch the layout of every slide in the deck','Export the final files for the client review','Email the client with the link and the notes','Edit'];
const seed=async(pg,S)=>pg.evaluate(async S=>{const db=await window.claude.use('db');
  await db.doc('tasks/bk1').set({title:'Mugassam',bucket:true,bState:'active',order:1,done:false});
  await db.doc('tasks/p1').set({title:'Deck task',cat:'portfolio',parent:'bk1',date:'2026-11-16',slot:1,mode:'deep',mins:180,order:1,done:false,sprint:2});
  for(let i=0;i<S.length;i++)await db.doc('tasks/s'+i).set({title:S[i],cat:'portfolio',parent:'p1',sub:true,date:'2026-11-16',sprint:2,order:i,done:false});
  await db.doc('tasks/old1').set({title:'Legacy list task',cat:'portfolio',parent:'bk1',date:'2026-11-17',slot:1,mode:'deep',mins:60,order:2,done:false,sprint:2,check:{a:{t:'Old one',done:true,o:0},b:{t:'Old two',done:false,o:1}}});},S);
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-14T08:00:00',real:JSON.stringify(base())});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(250);};
  await seed(pg,SUBS);await R(600);
  await pg.evaluate(()=>__r2.setPage('projects'));await R(500);await pg.locator('.bk-row[data-id="p1"] .bk-t').click();await R(600);
  const tx=(await pg.locator('.ps-sheet').innerText()).replace(/\s+/g,' ');
  ok('one list: Subtasks (0 of 4), no Steps section',/Subtasks \(0 of 4\)/.test(tx)&&!/Steps|No steps|Add a step/.test(tx),tx.slice(0,220));
  ok('exactly one subtask list and one Add a subtask line',(await pg.locator('.ps-sheet .ck-sec').count())===1&&(await pg.locator('.ps-sheet .ck-add').count())===1);
  ok('no time on subtask rows',!/about|\bmin\b|\bh\b/.test(await pg.locator('.ps-sheet .ck-row').allInnerTexts().then(a=>a.join(' '))));
  ok('task estimate shown in the header (about 3 h)',/about 3 h/.test(tx),tx.slice(0,120));
  await pg.locator('.ps-sheet .v3-est-btn').click();await R(200);await pg.locator('.ps-sheet .v3-est-in').fill('2.5 h');await pg.locator('.ps-sheet .v3-est-in').press('Enter');await R(500);
  ok('estimate edited inline: 2.5 h saved on the task',await pg.evaluate(()=>__u.state.tasks.p1.mins)===150,await pg.evaluate(()=>__u.state.tasks.p1.mins));
  await pg.locator('.ps-sheet .v3-est-btn').click();await R(200);await pg.locator('.ps-sheet .v3-est-in').fill('90 min');await pg.locator('.ps-sheet .v3-est-in').press('Enter');await R(500);
  ok('estimate edited inline: 90 min',await pg.evaluate(()=>__u.state.tasks.p1.mins)===90);
  ok('subtasks keep no estimate',await pg.evaluate(()=>[0,1,2,3].every(i=>__u.state.tasks['s'+i].mins==null)));
  ok('no Move up / Move down in the task sheet',(await pg.locator('.ps-sheet').evaluate(e=>[...e.querySelectorAll('*')].filter(n=>/move up|move down/i.test((n.getAttribute('aria-label')||'')+' '+(n.children.length?'':n.textContent))).length))===0);
  await pg.locator('.ps-sheet button:has-text("Details")').click();await R(300);
  ok('no Move up / Move down under Details either',(await pg.locator('.ps-sheet').evaluate(e=>/move up|move down/i.test(e.innerText)))===false);
  await pg.locator('.ps-sheet button:has-text("Hide details")').click();await R(300);
  // add a subtask
  await pg.locator('.ps-sheet .ck-add').fill('Review with a friend');await pg.locator('.ps-sheet .ck-add').press('Enter');await R(800);
  ok('added subtask is a sub doc without estimate',await pg.evaluate(()=>{const s=Object.values(__u.state.tasks).find(t=>t.title==='Review with a friend');return !!s&&s.sub===true&&s.parent==='p1'&&s.mins==null;}));
  ok('Subtasks (0 of 5)',/Subtasks \(0 of 5\)/.test(await pg.locator('.ps-sheet').innerText()));
  // hold-drag reorder: drag the first row below the third
  const rows=pg.locator('.ps-sheet .ck-row[data-id]');const a=await rows.nth(0).boundingBox(),c=await rows.nth(2).boundingBox();
  await pg.mouse.move(a.x+a.width/2,a.y+a.height/2);await pg.mouse.down();await pg.clock.runFor(600);await pg.mouse.move(a.x+a.width/2,c.y+c.height-4,{steps:6});await pg.mouse.up();await R(600);
  const ord=await pg.evaluate(()=>['s0','s1','s2','s3'].map(i=>__u.state.tasks[i].order));
  ok('hold then drag reorders subtasks (first row moved down)',ord[0]>ord[1],JSON.stringify(ord));
  // counts: subtasks never count as tasks
  const cnt=await pg.evaluate(()=>({leaf:__u.leafTasks().map(t=>t.id).sort(),parentDeck:__u.isLeaf({id:'p1',...__u.state.tasks.p1}),sub:__u.isLeaf({id:'s0',...__u.state.tasks.s0})}));
  ok('subtasks are not tasks (leaf): parent counts, subs do not',cnt.parentDeck===true&&cnt.sub===false&&!cnt.leaf.some(i=>/^s\d/.test(i)),JSON.stringify(cnt));
  ok('parent capacity uses its own estimate (planMins 16 Nov = 90)',await pg.evaluate(()=>__u.planMins('2026-11-16'))===90,await pg.evaluate(()=>__u.planMins('2026-11-16')));
  // legacy check list converts into subtasks on open
  await pg.evaluate(()=>__u.psClose(true));await R(300);
  await pg.evaluate(()=>__u.v3taskSheet('old1'));await R(1200);
  const lg=await pg.evaluate(()=>({chk:__u.state.tasks.old1.check,subs:Object.values(__u.state.tasks).filter(t=>t.parent==='old1'&&t.sub).map(t=>t.title+':'+t.done)}));
  ok('legacy check list becomes subtasks (done kept) and is removed',!lg.chk&&lg.subs.length===2&&lg.subs.includes('Old one:true'),JSON.stringify(lg));
  ok('sheet shows Subtasks (1 of 2) for it',/Subtasks \(1 of 2\)/.test(await pg.locator('.ps-sheet').innerText()),await pg.locator('.ps-sheet').innerText());
  await pg.evaluate(()=>__u.psClose(true));await R(300);
  // Today quick menu has no reorder or up/down
  await pg.evaluate(()=>{try{__r2.setPage('today');}catch(e){}});await R(400);
  ok('no Move up / Move down in the Today quick menu',await pg.evaluate(()=>{__u.v3taskMenu('p1');const t=document.querySelector('.ps-sheet').innerText;__u.psClose(true);return !/move up|move down|reorder/i.test(t);}));
  ok('no page errors',!pg.errs.filter(e=>!/Failed to load resource/.test(e)).length,pg.errs.join('|').slice(0,300));
  await shot(pg,'r37_'+w);await pg.context().close();}});
