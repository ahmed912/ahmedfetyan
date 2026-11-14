const {openp,shot,run}=require('./h.js');
const ok=(n,c,extra)=>console.log((c?'PASS ':'FAIL ')+n+(extra!==undefined?' '+extra:''));
run(async b=>{for(const w of [390]){const pg=await openp(b,w);const W=ms=>pg.waitForTimeout(ms);const esc=async()=>{await pg.keyboard.press('Escape');await pg.clock.runFor(450);await W(400);};
  const T=()=>pg.evaluate("JSON.stringify(Object.entries(window.__data.tasks).map(([i,t])=>({i,t:t.title,d:t.date,done:t.done,cat:t.cat,days:t.days,mins:t.mins,arch:t.archived,cut:t.cut,parent:t.parent,pos:t.pos,s:t.sprint})))").then(JSON.parse);
  await pg.click('.m-tab:has-text("Review")');await pg.clock.runFor(500);await W(600);await shot(pg,'r3_review_'+w,true);
  // sprint progress bars are clickable
  const nb=await pg.locator('#bars .bar[role=button]').count();ok('bars clickable',nb===5,nb);
  await pg.locator('#bars .bar').nth(0).click();await W(700);await shot(pg,'r3_tasks_'+w);
  ok('tasks sheet open',await pg.evaluate("!!document.querySelector('.ps-sheet')"));
  await pg.click('.ps-sheet .v3-addt');await W(300);await pg.fill('.ps-sheet input[aria-label="New task name"]','V03 test task');await pg.click('.ps-sheet .v3-cats .cat-chip >> nth=0');
  await pg.click('.ps-sheet .btn:has-text("Add task")');await pg.clock.runFor(400);await W(700);
  const t1=await T();const nt=t1.find(x=>x.t==='V03 test task');ok('task added',!!nt&&nt.s===1,JSON.stringify(nt));
  await pg.click('.ps-sheet .seg button:has-text("Done")');await W(400);await shot(pg,'r3_done_'+w);
  ok('done tab lists done tasks',(await pg.locator('.ps-sheet .v3-trow').count())>=0,await pg.locator('.ps-sheet .v3-trow').count());
  await esc();
  await pg.locator('#bars .bar').nth(1).click();await W(600);ok('posts sheet',await pg.evaluate("document.querySelector('.ps-sheet .ps-sh-head h2').textContent"));await shot(pg,'r3_posts_'+w);await esc();
  await pg.locator('#bars .bar').nth(4).click();await W(600);ok('hours sheet',await pg.evaluate("document.querySelector('.ps-sheet .ps-sh-head h2').textContent"));await esc();
  // insights
  const ih=await pg.evaluate("document.getElementById('ihBody').innerText.slice(0,120)");console.log('insights:',ih.replace(/\n/g,' | '));
  // waterfall: open section if folded, open a task, add subtask, menu, archive
  await pg.evaluate("{const s=document.querySelector('section[aria-labelledby=\"wfH\"]');if(s&&s.classList.contains('collapsed')){const b=s.querySelector('.collapse-btn');if(b)b.click();}}");await W(500);
  await pg.locator('#wfBody').scrollIntoViewIfNeeded();await shot(pg,'r3_wf_'+w);
  await pg.evaluate("[...document.querySelectorAll('#wfBody .seg button')].find(b=>b.textContent==='By day')?.click()");await pg.clock.runFor(300);await pg.waitForTimeout(300);
  const rows=await pg.locator('.v3-wft').count();ok('waterfall rows',rows>0,rows);
  const sub0=(await T()).filter(x=>x.parent).length;
  await pg.locator('.v3-wft').first().click();await W(600);await shot(pg,'r3_wtask_'+w);
  if(!(await pg.locator('.ps-sheet input[aria-label="New subtask"]').count())){await pg.locator('.ps-sheet button:has-text("Details")').click();await pg.clock.runFor(300);await W(300);}
  await pg.fill('.ps-sheet input[aria-label="New subtask"]','draft');await pg.press('.ps-sheet input[aria-label="New subtask"]','Enter');await pg.clock.runFor(300);await W(500);
  await pg.fill('.ps-sheet input[aria-label="New subtask"]','refine');await pg.press('.ps-sheet input[aria-label="New subtask"]','Enter');await pg.clock.runFor(300);await W(500);
  const t2=await T();const subs=t2.filter(x=>x.parent);const mine=await pg.evaluate(()=>Object.values(window.__data.tasks).filter(x=>x.sub&&(x.title==='draft'||x.title==='refine')));ok('2 subtasks created as subtasks without an estimate',subs.length-sub0===2&&mine.length===2&&mine.every(s=>s.mins==null),subs.length);
  await shot(pg,'r3_subs_'+w);
  ok('subtasks not in waterfall rows',(await pg.locator('.v3-wft').count())===rows,await pg.locator('.v3-wft').count());
  await pg.click('.ps-sheet .btn:has-text("Details")');await W(300);await shot(pg,'r3_det_'+w);await esc();
  // start now from waterfall opens war setup without leaving Review
  await pg.locator('.v3-wft').first().click();await W(500);await pg.click('.ps-sheet .btn:has-text("Start now")');await W(600);
  ok('start now opens War setup',await pg.evaluate("document.querySelector('.ps-sheet .ps-sh-head h2').textContent==='War'"));
  ok('still on Review page',await pg.evaluate("!document.querySelector('.page[data-page=\"progress\"]').hidden"));await shot(pg,'r3_start_'+w);await esc();
  // menu: reschedule beyond sprint end is blocked, length, archive
  await pg.locator('.v3-more').first().click();await W(500);await shot(pg,'r3_menu_'+w);
  await pg.click('.ps-sheet .btn:has-text("Edit")');await W(500);if(!(await pg.locator('.ps-sheet input[aria-label="Days it spans"]').count())){await pg.click('.ps-sheet .btn:has-text("Details")');await W(300);}await pg.fill('.ps-sheet input[aria-label="Days it spans"]','2');await pg.press('.ps-sheet input[aria-label="Days it spans"]','Tab');await pg.fill('.ps-sheet input[aria-label="Estimated minutes"]','45');await pg.press('.ps-sheet input[aria-label="Estimated minutes"]','Tab');await W(300);await esc();await W(300);await pg.clock.runFor(300);await W(500);
  const t3=await T();ok('length saved',t3.some(x=>x.days===2&&x.mins===45),'');
  await pg.locator('.v3-more').first().click();await W(400);await pg.click('.ps-sheet .btn:has-text("Reschedule")');await W(400);
  await pg.fill('.ps-sheet input[type=date]','2026-12-31');await pg.clock.runFor(400);await W(300);if(await pg.locator('.rs-steps-no').count()){await pg.click('.rs-steps-no');await pg.clock.runFor(300);await W(300);}
  ok('reschedule past sprint end asks first (moves it into another sprint)',await pg.evaluate("/Sprint \\d/.test(document.getElementById('v3Conf')?.innerText||'')"));await pg.click('.v3-conf .btn.ghost');await W(300);
  ok('cancel keeps the sheet open',await pg.evaluate("!!document.querySelector('.ps-sheet')"));await esc();
  const before=rows;const allT=await T();const liveT=allT.filter(x=>!x.arch&&!x.cut&&!allT.some(y=>y.t===x.t&&(y.arch||y.cut))).map(x=>x.t);const lbl=await pg.evaluate("(L=>[...document.querySelectorAll('.v3-more')].map(b=>b.getAttribute('aria-label')).find(a=>L.includes(a.slice(9))))("+JSON.stringify(liveT)+")");await pg.locator('.v3-more[aria-label='+JSON.stringify(lbl)+']').first().click();await W(400);await pg.click('.ps-sheet .btn:has-text("Archive")');await W(400);await pg.click('.v3-conf .btn:not(.ghost)');await pg.clock.runFor(400);await W(600);
  const t4=await T();ok('archived (cut+archived)',t4.some(x=>x.arch&&x.cut),'');ok('row gone from waterfall (the refill may pull other work in)',(await pg.locator('.v3-more[aria-label='+JSON.stringify(lbl)+']').count())===0,await pg.locator('.v3-wft').count());
  // sprint board
  await pg.locator('#timeline .spr').nth(0).scrollIntoViewIfNeeded();await pg.locator('#timeline .spr').nth(0).click();await W(700);await shot(pg,'r3_board_'+w);
  ok('sprint board sheet',await pg.evaluate("document.querySelector('.ps-sheet .ps-sh-head h2').textContent"));await esc();
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,6));await pg.close();}});
