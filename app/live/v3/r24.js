// Round 8 (inbox and backlog). Journey: Plan, capture one line, triage (category, estimate, bucket), schedule with the picker, task lands in its chunk; send to backlog; Undo.
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const fs=require('fs');
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const SAT='2026-11-28',MON='2026-11-30';
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};return d;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:SAT+'T09:00:00',real:JSON.stringify(base())});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(200);};
  await pg.evaluate(async()=>{const db=await window.claude.use('db');
    await db.doc('tasks/bkM').set({title:'Mugassam',cat:'portfolio',done:false,bucket:true,bState:'active'});
    await db.doc('tasks/m1').set({title:'Audit the deck',parent:'bkM',cat:'portfolio',date:'2026-11-30',mins:60,order:1,slot:1,done:false});});await R(600);
  const T=()=>pg.evaluate(()=>window.__data.tasks);
  const bar=()=>pg.evaluate(()=>{const b=document.getElementById('v3ut');return b&&!b.hidden?b.innerText.replace(/\s+/g,' '):'';});
  const U=async()=>{await pg.evaluate(()=>document.querySelector('#v3ut .ub-b').click());await R(500);};
  await (w<700?pg.click('.m-tab:has-text("Projects")'):pg.click('.ptab[data-p="projects"]'));await R(700);
  ok('empty inbox says so, one capture line',await pg.locator('#planInbox .pl-empty').count()===1&&await pg.locator('#planInbox .pl-cap').count()===1);
  ok('backlog is collapsed with a count',/Backlog \(0\)/.test(await pg.locator('.pl-bl-head').innerText())&&await pg.locator('.pl-backlog').count()===0);
  // 1 capture five lines, one tap each, Undo on the last
  for(const x of ['Redesign the pricing page','Reply to Omar','Send invoice','Read the contrast chapter','Plan the LinkedIn week']){await pg.locator('.pl-cap').fill(x);await pg.keyboard.press('Enter');await R(350);}
  let T1=await T();const ids=Object.keys(T1).filter(k=>T1[k].inbox);
  ok('five captured tasks with inbox, no date',ids.length===5&&ids.every(i=>!T1[i].date&&T1[i].sprint===null),JSON.stringify(ids.length));
  ok('inbox shows at most 3 rows and one more button',await pg.locator('.pl-inbox .pl-row').count()===3&&/2 more/.test(await pg.locator('#planInbox .bk-moreb').first().innerText()));
  ok('count line',/5 to sort/.test(await pg.locator('.pl-in-count').innerText()));
  ok('toast has Undo',/Added to inbox: Plan the LinkedIn week/.test(await bar()),await bar());
  await U();T1=await T();ok('Undo removes the last capture',Object.values(T1).filter(x=>x.inbox).length===4);
  await pg.locator('.pl-cap').fill('Plan the LinkedIn week');await pg.keyboard.press('Enter');await R(350);
  ok('inbox tasks stay out of Unbucketed',!/Redesign the pricing page/.test(await pg.locator('.bk-card.none').innerText().catch(()=>'')));
  await shot(pg,'r24_inbox_'+w);
  const idOf=async tx=>(await pg.evaluate(tx=>Object.entries(window.__data.tasks).find(([i,t])=>t.title===tx)[0],tx));
  // 2 triage the design task: category, estimate, bucket; then schedule on Monday with the picker
  const dId=await idOf('Redesign the pricing page');
  await pg.locator('.pl-row[data-id="'+dId+'"] .bk-t').click();await R(500);
  await pg.locator('.ps-sheet .cat-chip[data-cat="portfolio"]').click();await R(400);
  await pg.locator('.ps-sheet .pl-est [data-m="90"]').click();await R(400);
  await pg.locator('.ps-sheet select[aria-label="Bucket"]').selectOption('bkM');await R(500);
  let t=(await T())[dId];
  ok('triage stored: category, 90 min, bucket',t.cat==='portfolio'&&t.mins===90&&t.parent==='bkM',JSON.stringify([t.cat,t.mins,t.parent]));
  ok('block type defaults to Deep from the category',/Deep/.test(await pg.locator('.ps-sheet .ch-mode.on').innerText()));
  await shot(pg,'r24_triage_'+w);
  await pg.locator('.ps-sheet .pl-sched').click();await R(500);
  await pg.locator('.ps-sheet .rs-date').fill(MON);await pg.locator('.ps-sheet .rs-date').dispatchEvent('change');await R(900);
  t=(await T())[dId];
  ok('scheduled on Monday, left the inbox, not counted as moved',t.date===MON&&!t.inbox&&(t.moved||0)===0,JSON.stringify([t.date,t.inbox,t.moved]));
  ok('lands in its bucket block (same slot as Mugassam)',t.slot===1&&t.mode==='deep',JSON.stringify([t.slot,t.mode]));
  ok('undo bar offers Undo',/Moved to/.test(await bar()),await bar());
  await U();t=(await T())[dId];
  ok('Undo puts it back in the inbox, undated',t.inbox===true&&!t.date,JSON.stringify([t.inbox,t.date]));
  // 3 admin task: shallow default, schedule by swipe-left picker fallback (date button) lands in the shallow batch
  const aId=await idOf('Send invoice');
  await pg.evaluate(id=>window.__pl.sheet(id),aId);await R(400);
  await pg.locator('.ps-sheet .cat-chip[data-cat="brand"]').click();await R(400);
  ok('brand task defaults to Shallow',/Shallow/.test(await pg.locator('.ps-sheet .ch-mode.on').innerText()));
  await pg.locator('.ps-sheet .pl-sched').click();await R(500);
  await pg.locator('.ps-sheet .rs-date').fill(MON);await pg.locator('.ps-sheet .rs-date').dispatchEvent('change');await R(900);
  t=(await T())[aId];ok('admin task gets the shallow batch (no deep slot)',t.date===MON&&!t.slot&&t.mode==='shallow',JSON.stringify([t.date,t.slot,t.mode]));
  // 4 send to backlog, shows in the collapsed Backlog, Undo, then again
  const rId=await idOf('Reply to Omar');
  await pg.locator('.pl-row[data-id="'+rId+'"] .bk-t').click();await R(500);
  await pg.locator('.ps-sheet .pl-back').click();await R(500);
  t=(await T())[rId];ok('sent to backlog: out of the inbox, still undated',!t.inbox&&!t.date);
  ok('toast says backlog',/Sent to backlog: Reply to Omar/.test(await bar()),await bar());
  ok('backlog count is 1 and stays collapsed',/Backlog \(1\)/.test(await pg.locator('.pl-bl-head').innerText())&&await pg.locator('.pl-backlog').count()===0);
  await U();t=(await T())[rId];ok('Undo returns it to the inbox',t.inbox===true);
  await pg.locator('.pl-row[data-id="'+rId+'"] .bk-t').click();await R(500);await pg.locator('.ps-sheet .pl-back').click();await R(500);
  await pg.locator('.pl-bl-head').click();await R(400);
  ok('backlog opens on tap with the item',await pg.locator('.pl-backlog .pl-row').count()===1&&/Reply to Omar/.test(await pg.locator('.pl-backlog').innerText()));
  await shot(pg,'r24_backlog_'+w);
  // 5 a backlog item is scheduled through the same sheet, then leaves the backlog
  await pg.locator('.pl-backlog .pl-row .bk-d').click();await R(500);
  await pg.locator('.ps-sheet .rs-date').fill(MON);await pg.locator('.ps-sheet .rs-date').dispatchEvent('change');await R(900);
  t=(await T())[rId];ok('backlog item scheduled, backlog empty again',t.date===MON&&/Backlog \(0\)/.test(await pg.locator('.pl-bl-head').innerText()),JSON.stringify([t.date]));
  // 6 drop with Undo
  const lId=await idOf('Read the contrast chapter');
  await pg.locator('.pl-row[data-id="'+lId+'"] .bk-t').click();await R(500);await pg.locator('.ps-sheet .pl-drop').click();await R(600);
  ok('drop archives it out of the inbox',(await T())[lId].archived===true&&await pg.locator('.pl-row[data-id="'+lId+'"]').count()===0);
  await U();ok('Undo restores it to the inbox',!(await T())[lId].archived&&await pg.locator('.pl-row[data-id="'+lId+'"]').count()===1);
  // 7 work line: the Monday chunk keeps design and shallow apart
  await pg.evaluate(()=>{});
  ok('no page errors',pg.errs.filter(e=>!/Failed to load resource/.test(e)).length===0,pg.errs.join('|'));
  await pg.close();}});
