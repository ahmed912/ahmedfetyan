const {openp,shot,run}=require('./h.js');
const ok=(n,c,extra)=>console.log((c?'PASS ':'FAIL ')+n+(extra!==undefined?' '+extra:''));
run(async b=>{for(const w of [390]){const pg=await openp(b,w);const W=ms=>pg.waitForTimeout(ms);const esc=async()=>{await pg.keyboard.press('Escape');await pg.clock.runFor(450);await W(400);};
  const D=()=>pg.evaluate("JSON.stringify({listen:Object.entries(window.__data.listen||{}).map(([i,x])=>[i,x.q??null,x.title]),habits:window.__data.habits,guard:!!(window.__data.guard&&window.__data.guard.main)})");
  console.log('DATA',(await D()).slice(0,300));
  // --- media
  ok('npBar hidden',await pg.evaluate("getComputedStyle(document.getElementById('npBar')).display==='none'"));
  console.log('fab hidden at start:',await pg.evaluate("document.getElementById('qFab')?document.getElementById('qFab').hidden:'none'"));
  await pg.click('.pop-card:has-text("Intentional media")');await pg.clock.runFor(500);await W(500);await shot(pg,'r2_media_'+w,true);
  ok('media page title/cards',await pg.evaluate("[...document.querySelectorAll('.snd-card .fc-t')].map(x=>x.textContent).join('|')"));
  await pg.click('.snd-card:has-text("To listen")');await pg.clock.runFor(500);await W(600);await shot(pg,'r2_bank_'+w);
  const addq=pg.locator('.ps-sheet .v3-addq');const nb=await addq.count();ok('bank rows have Add to queue',nb>0,nb);
  if(nb>1){await addq.nth(0).click();await W(500);await addq.nth(1).click();await W(500);}
  console.log('queued',(await D()).includes('"q"')||await pg.evaluate("Object.values(window.__data.listen).filter(x=>x.q!=null).length"));
  await esc();
  await pg.click('.snd-card:has-text("Queue")');await W(600);await shot(pg,'r2_queue_'+w);
  const rows=await pg.locator('.q-row').count();ok('queue rows',rows>=1,rows);
  if(rows>1){const first=await pg.locator('.q-row').nth(0).getAttribute('data-id');
    const bb=await pg.locator('.q-row').nth(1).boundingBox();const b0=await pg.locator('.q-row').nth(0).boundingBox();
    await pg.mouse.move(b0.x+b0.width/2,b0.y+b0.height/2);await pg.mouse.down();await pg.clock.runFor(500);await pg.mouse.move(b0.x+b0.width/2,bb.y+bb.height+10,{steps:6});await pg.mouse.up();await pg.clock.runFor(400);await W(500);
    const after=await pg.locator('.q-row').nth(0).getAttribute('data-id');ok('drag reorder changed first row',after!==first,first+' -> '+after);}
  await pg.locator('.q-row .x').first().click();await pg.clock.runFor(400);await W(400);ok('remove from queue',(await pg.locator('.q-row').count())===rows-1,(await pg.locator('.q-row').count()));
  await esc();
  // --- capture
  await pg.click('.m-tab:has-text("Today")');await pg.clock.runFor(400);await W(500);
  await pg.click('.pop-card:has-text("Capture")');await W(700);await shot(pg,'r2_cap_'+w);
  const dueBtn=pg.locator('.cap-due');const hasDue=await dueBtn.count();console.log('due chip',hasDue);
  if(hasDue){await dueBtn.first().click();await W(700);await shot(pg,'r2_rev_'+w);ok('review sheet open',await pg.evaluate("!!document.querySelector('.ps-sheet[aria-label=\"Review notes\"]')"));
    await pg.click('.ps-sheet .btn:has-text("Back to Capture")');await W(700);ok('back to capture',await pg.evaluate("!!document.querySelector('.ps-sheet #capIn')"));}
  await pg.click('.v3-notes');await W(700);await shot(pg,'r2_notes_'+w);const nn=await pg.locator('.ps-sheet .v3-trow').count();ok('stored notes listed',nn>0,nn);
  if(nn){await pg.locator('.ps-sheet .v3-trow').first().click();await W(500);ok('note opens with actions',(await pg.locator('.ps-sheet .v3-ncard .btn').count())>0);await shot(pg,'r2_note1_'+w);}
  await esc();ok('closing review returns to Capture',await pg.evaluate("!!document.querySelector('.ps-sheet #capIn')"));await esc();
  // --- habits
  await pg.click('.pop-card:has-text("Habits")');await W(700);await shot(pg,'r2_hab_'+w);
  ok('self-mastery folded',await pg.evaluate("document.getElementById('guardBody').textContent.includes('hidden on screen')"));
  await pg.click('.v3-habbar .btn:has-text("Add habit")');await W(500);
  await pg.fill('.ps-sheet input[aria-label="Habit name"]','Read 10 pages');await pg.click('.ps-sheet .btn:has-text("Add habit")');await pg.clock.runFor(800);await W(900);
  ok('habit added',await pg.evaluate("JSON.stringify(window.__data.habits)").then(s=>s.includes('Read 10 pages')),'');
  ok('habit visible',await pg.evaluate("document.getElementById('habits').textContent.includes('Read 10 pages')"));
  await pg.click('.v3-habbar .btn:has-text("Report")');await W(700);await shot(pg,'r2_rep_'+w);
  const tabs=await pg.locator('.v3-tabs .cat-chip').allTextContents();ok('report tabs',tabs.length>=3,tabs.join('|'));
  await pg.locator('.v3-tabs .cat-chip').nth(2).click();await W(400);await shot(pg,'r2_rep3_'+w);
  await esc();ok('closing report returns to Habits',await pg.evaluate("!!document.querySelector('.ps-sheet #guardBody')"));await esc();
  // guard
  const hasGuard=await pg.evaluate("!!(window.__data.guard&&window.__data.guard.main)");console.log('guard exists',hasGuard);
  await pg.click('.pop-card:has-text("Habits")');await W(700);
  await pg.click('.v3-gdt');await pg.clock.runFor(300);await W(400);
  if(!hasGuard){await pg.click('#guardBody .btn:has-text("Start from today")');await pg.clock.runFor(400);await W(400);}
  await shot(pg,'r2_guard_'+w);
  const tiles=await pg.locator('#guardBody .slp-tile[role=button]').count();ok('tiles clickable',tiles===3,tiles);
  if(tiles){await pg.locator('#guardBody .slp-tile').nth(0).click();await W(500);ok('streak sheet',await pg.evaluate("!!document.querySelector('.ps-sheet[aria-label=\"Streaks\"]')"));await shot(pg,'r2_streak_'+w);await esc();}
  ok('returned to Habits after closing streaks',await pg.evaluate("!!document.querySelector('.ps-sheet #guardBody')"));
  await pg.click('.v3-gdt');await pg.clock.runFor(300);await W(400);
  await pg.click('#guardBody .btn:has-text("Log a slip")');await W(600);
  const tIn=pg.locator('.ps-sheet input[aria-label="Time of the slip"]');await tIn.fill('2:30 pm');await tIn.press('Tab');
  await pg.click('.ps-sheet .v3-cats .cat-chip >> nth=2');await pg.click('.ps-sheet .btn:has-text("Log slip")');await pg.clock.runFor(500);await W(500);
  const n0=await pg.evaluate("(window.__data.guard.main.slips||[]).length");ok('slip before the start date is refused',n0===0,n0);
  await pg.click('.ps-sheet .v3-cats .cat-chip >> nth=0');await pg.click('.ps-sheet .btn:has-text("Log slip")');await pg.clock.runFor(500);await W(600);
  const sl=await pg.evaluate("JSON.stringify((window.__data.guard.main.slips||[]).map(s=>[s.date,new Date(s.at).toTimeString().slice(0,5)]))");ok('slip logged today with the typed time',sl.includes('14:30'),sl);
  await shot(pg,'r2_slips_'+w);
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,6));await pg.close();}});
