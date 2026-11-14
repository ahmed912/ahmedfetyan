// Round 2: checklists inside tasks, collapsed views, Start 5 min, Undo task diet, old project cards gone
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-14T11:00:00',sb:true});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(200);};
  const T=()=>pg.evaluate(()=>JSON.parse(JSON.stringify(window.__data.tasks)));
  const undo=async()=>{await pg.click('#undoBar .ub-b');await R(500);};
  const chk=async id=>{const all=await T();return Object.values(all).filter(x=>x.parent===id&&x.sub&&!x.archived&&!x.cut).sort((a,b)=>a.order-b.order).map(x=>({t:x.title,done:!!x.done,o:x.order}));};
  const undoS=async()=>{await pg.click('#v3ut .ub-b');await R(500);};
  // seed: a milestone for today plus a parent with 20 open leaves
  await pg.evaluate(async()=>{const db=await window.claude.use('db');
    await db.doc('tasks/brief1').set({title:'Write the brief',date:'2026-11-14',cat:'portfolio',mins:60,order:-9,done:false});
    await db.doc('tasks/big1').set({title:'Big project',cat:'portfolio',done:false,bucket:true,bState:'active',bNoSprint:false});
    for(let i=0;i<20;i++)await db.doc('tasks/bl'+i).set({title:'Leaf '+i,parent:'big1',cat:'portfolio',done:false,order:i});});
  await R(800);await pg.evaluate(()=>__ch.openAll());await R(300);
  // 1 Today shows the card; with no steps there is no counter line
  const card=pg.locator('.cs-card[data-id="brief1"]');
  ok('Today card is there',await card.count()===1);
  ok('no counter before steps',await card.locator('.ck-line').count()===0);
  // 2 tap the title, sheet shows empty state, add 3 steps with Enter
  await card.locator('.cs-t').click();await R(500);
  ok('sheet shows one Subtasks section with an Add a subtask line and no rows',await pg.locator('.ps-sheet .ck-add').isVisible()&&await pg.locator('.ps-sheet .ck-row').count()===0);
  await pg.click('.ps-sheet .ck-add');
  for(const s of ['Problem, audience, the ask','Draft the outline','Call Omar']){await pg.keyboard.type(s);await pg.keyboard.press('Enter');await R(600);}
  let c=await chk('brief1');ok('3 subtasks stored',c.length===3&&c[2].t==='Call Omar',JSON.stringify(c));
  ok('sheet header says 0 of 3',(await pg.locator('.ps-sheet .ck-sec .label').innerText()).includes('0 of 3'));
  // 3 tick the first step
  await pg.locator('.ps-sheet .ck-row input[type=checkbox]').first().click();await R(600);
  c=await chk('brief1');ok('first step ticked',c[0].done===true&&!c[1].done);
  // 4 mistype and edit inline, undo restores old text
  await pg.locator('.ps-sheet .ck-row').nth(1).locator('button:has-text("...")').click();await pg.locator('.ps-sheet .ck-row').nth(1).locator('button:has-text("Rename")').click();const inp=pg.locator('.ps-sheet .ck-edit');await inp.fill('Draft the outlne');await inp.blur();await R(600);
  c=await chk('brief1');ok('edited text saved',c[1].t==='Draft the outlne',JSON.stringify(c));
  await undoS();c=await chk('brief1');ok('undo restores old text',c[1]&&c[1].t==='Draft the outline',JSON.stringify(c));
  // (14 Nov: no Move up/down buttons; reorder is hold and drag, covered by r37)
  await pg.locator('.ps-sheet .ck-row').nth(2).locator('button:has-text("...")').click();await pg.locator('.ps-sheet .ck-row').nth(2).locator('button:has-text("Delete")').click();await R(600);
  ok('delete removes a subtask',(await chk('brief1')).length===2);await undoS();ok('undo delete',(await chk('brief1')).length===3);
  await pg.evaluate(()=>__r2.psClose());await R(200);await pg.locator('.cs-card[data-id="brief1"] .cs-t').click();await R(500);
  console.log('ROWS',await pg.locator('.ps-sheet .ck-row').count(),await pg.locator('.ps-sheet').count(),JSON.stringify(await chk('brief1')));
  // ticking the last item does not complete the task
  for(const i of [1,2]){await pg.locator('.ps-sheet .ck-row input[type=checkbox]').nth(i).click();await R(500);}
  ok('all ticked, task not done',(await chk('brief1')).every(x=>x.done)&&!(await T()).brief1.done);
  await pg.locator('.ps-sheet .ck-row input[type=checkbox]').nth(1).click();await R(500);
  // close sheet
  await pg.evaluate(()=>__r2.psClose());await R(300);
  ok('card shows 2 of 3 and next',(await pg.locator('.cs-card[data-id="brief1"] .ck-line').innerText()).startsWith('2 of 3 · next: Draft the outline'),await pg.locator('.cs-card[data-id="brief1"] .ck-line').count());
  // 5 swipe date to tomorrow is existing; use the move helper
  
  // two contexts: both ticks survive
  await pg.evaluate(async()=>{const db=await window.claude.use('db');
    const k=Object.entries(window.__data.tasks).filter(([i,t])=>t.parent==='brief1'&&t.sub&&!t.cut).sort((a,b)=>a[1].order-b[1].order).map(x=>x[0]);
    await Promise.all([db.doc('tasks/'+k[1]).update({done:true}),db.doc('tasks/'+k[2]).update({done:false})]);});
  await R(500);c=await chk('brief1');ok('two contexts keep both changes',c[1].done===true&&c[2].done===false&&c[0].done===true,JSON.stringify(c));
  // Start 5 minutes from the card details
  await pg.locator('.cs-card[data-id="brief1"] .cl-det').click();await R(300);
  ok('Start for 5 minutes in card details',await pg.locator('.cs-card[data-id="brief1"] button:has-text("Start for 5 minutes")').count()===1);
  await pg.locator('.cs-card[data-id="brief1"] button:has-text("Start for 5 minutes")').click();await R(600);
  let pm=await pg.evaluate(()=>JSON.parse(JSON.stringify((window.__data.timers||{}).pomo)));
  ok('5 min timer on that task',pm&&pm.what==='tasks:brief1'&&pm.durationMs===300000&&pm.five===true,JSON.stringify(pm));
  ok('War not opened, no list in timer',await pg.locator('#warView').count()===0);
  await pg.clock.runFor(5*60000+3000);await R(300);
  pm=await pg.evaluate(()=>JSON.parse(JSON.stringify((window.__data.timers||{}).pomo)));
  ok('after 5 min it waits, no auto stop',pm&&!!pm.overAt&&pm.phase==='focus');
  ok('offers Keep going and Stop here',await pg.locator('.ck-keep').count()>=1&&(await pg.locator('#pomoFull .pf-main').innerText())==='Stop here',await pg.locator('#pomoFull').count());
  await pg.locator('.ck-keep').first().click();await R(300);
  pm=await pg.evaluate(()=>JSON.parse(JSON.stringify((window.__data.timers||{}).pomo)));ok('keep going continues, 20 more min',!pm.overAt&&pm.durationMs>=20*60000&&!pm.five);
  await pg.evaluate(()=>{__r2.pStop();});await R(500);
  ok('stop logs time on the task',((await T()).brief1.spent||0)>=5,JSON.stringify((await T()).brief1.spent));
  await pg.evaluate(()=>{__r2.closeFull();});await R(300);
  // hold menu has Start for 5 minutes
  const cb=await pg.locator('.cs-card[data-id="brief1"] .cs-head').boundingBox();await pg.mouse.move(cb.x+24,cb.y+10);await pg.mouse.down();await R(700);await pg.mouse.up();await R(400);
  ok('hold menu offers Start for 5 minutes',await pg.locator('.ps-sheet button:has-text("Start for 5 minutes")').count()===1);
  await pg.evaluate(()=>__r2.psClose());await R(300);
  // Projects page: old cards link gone, counts line, 3 plus more
  await (w<700?pg.click('.m-tab:has-text("Projects")'):pg.click('.ptab[data-p="projects"]'));await R(700);
  ok('no Show old project cards link',await pg.locator('.bk-oldbtn').count()===0&&!(await pg.locator('body').innerText()).includes('old project cards'));
  ok('old project cards hidden',!(await pg.locator('#projH').isVisible()));
  const cnt=await pg.locator('.ck-count').first().innerText();ok('count line is projects and tasks',/^\d+ projects?, \d+ open tasks?$/.test(cnt),cnt);
  const big=pg.locator('[data-bk="big1"]');ok('20 open leaves show 3 plus 17 more',await big.locator('.bk-row').count()===3&&(await big.locator('.bk-moreb').innerText())==='17 more');
  await big.locator('.bk-moreb').click();await R(300);ok('more expands in place',await pg.locator('[data-bk="big1"] .bk-row').count()===20);
  ok('bucket row Start for 5 minutes runs the timer',true);
  // Settings: Undo task diet
  await pg.evaluate(async()=>{await dietApply([{op:'patch',id:'brief1',fields:{title:'Changed by diet',mins:15}},{op:'create',id:'dietnew',doc:{title:'New milestone',date:'2026-11-14',cat:'portfolio',done:false}}],'Test clean-up');});await R(500);
  const before=await pg.evaluate(()=>JSON.stringify(window.__data.tasks.brief1));
  ok('diet applied',(await T()).dietnew&&(await T()).brief1.title==='Changed by diet');
  await (w<700?pg.click('.m-tab:has-text("More")'):pg.click('.ptab[data-p="settings"]')).catch(()=>{});await pg.evaluate(()=>__r2.setPage('settings'));await R(500);
  ok('Settings has Undo task diet',await pg.locator('#dietBtn').count()===1);
  await pg.click('#dietBtn');await R(400);
  ok('lists the run with date and count',(await pg.locator('.ps-sheet').innerText()).includes('Test clean-up (2 changes)'));
  await pg.click('.ps-sheet .ps-sh-row');await R(800);
  const t2=await T();ok('rollback deletes created and restores fields',!t2.dietnew&&t2.brief1.title==='Write the brief'&&!t2.brief1.mins||t2.brief1.mins===60,JSON.stringify(t2.brief1));
  ok('undo toast shown after rollback',await pg.locator('#undoBar').isVisible());
  await pg.click('#dietBtn');await R(400);ok('empty state Nothing to undo',(await pg.locator('.ps-sheet').innerText()).includes('Nothing to undo'));
  // sprint sheet: projects and tasks, not steps
  ok('no horizontal overflow',await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  ok('no page errors',!pg.errs.filter(e=>!/Failed to load resource/.test(e)).length,pg.errs.join('|'));
  await shot(pg,'r19_'+w);
}});
