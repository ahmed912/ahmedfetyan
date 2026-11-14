// Round 7 (rename UI). Journey: hold a card, Rename, type, Enter, Undo; double-click a title; rename a step; rename a bucket from Plan.
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const fs=require('fs');
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const D='2026-11-24';
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};return d;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:D+'T10:00:00',real:JSON.stringify(base())});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(200);};
  await pg.evaluate(async D=>{const db=await window.claude.use('db');
    await db.doc('tasks/bkM').set({title:'Mugassam',cat:'portfolio',done:false,bucket:true,bState:'active'});
    await db.doc('tasks/m1').set({title:'Audit the deck',parent:'bkM',cat:'portfolio',date:D,mins:60,order:1,done:false});
    await db.doc('tasks/m2').set({title:'Audit the deck',parent:'bkM',cat:'portfolio',date:D,mins:60,order:2,done:false});
    await db.doc('tasks/l1').set({title:'Audit the deck',cat:'learning',date:D,mins:30,order:3,done:false});},D);await R(700);
  const T=id=>pg.evaluate(id=>window.__data.tasks[id].title,id);
  const bar=()=>pg.evaluate(()=>{const b=document.getElementById('v3ut');return b&&!b.hidden?b.innerText.replace(/\s+/g,' '):'';});
  // 1 hold the card: the quick menu lists Rename, the field opens in place
  const card=pg.locator('.cs-card[data-id="m1"]').first();await card.evaluate(e=>e.scrollIntoView({block:'center'}));
  const bx=await card.boundingBox();await pg.mouse.move(bx.x+bx.width/2,bx.y+10);await pg.mouse.down();await R(700);await pg.evaluate(()=>{const c=document.querySelector('.cs-card[data-id="m1"]');c.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true}));});await pg.mouse.up();await R(400);
  ok('hold opens the menu with Rename',await pg.locator('.ps-sheet .rn-menu').count()===1);
  await pg.locator('.ps-sheet .rn-menu').click();await R(500);
  ok('field opens in place with the old name',await pg.locator('.rn-in').count()===1&&(await pg.locator('.rn-in').inputValue())==='Audit the deck');
  ok('no sheet is left open',await pg.locator('.ps-sheet').count()===0||!(await pg.locator('.ps-sheet').first().isVisible()));
  await shot(pg,'r23_inline_'+w);
  await pg.locator('.rn-in').fill('Audit the plan');await pg.keyboard.press('Enter');await R(500);
  ok('Enter saves',(await T('m1'))==='Audit the plan',await T('m1'));
  ok('Undo bar says Renamed',/Renamed to Audit the plan/.test(await bar()),await bar());
  ok('card shows the new name',/Audit the plan/.test(await pg.locator('.cs-card[data-id="m1"]').first().innerText()));
  await pg.evaluate(()=>document.querySelector('#v3ut .ub-b').click());await R(500);
  ok('Undo restores the name',(await T('m1'))==='Audit the deck',await T('m1'));
  // 2 Escape cancels, empty keeps the name
  await pg.evaluate(()=>__rn.start('m1'));await R(300);await pg.locator('.rn-in').fill('Nope');await pg.keyboard.press('Escape');await R(400);
  ok('Escape cancels',(await T('m1'))==='Audit the deck'&&await pg.locator('.rn-in').count()===0);
  await pg.evaluate(()=>__rn.start('m1'));await R(300);await pg.locator('.rn-in').fill('   ');await pg.keyboard.press('Enter');await R(400);
  ok('empty name keeps the old one',(await T('m1'))==='Audit the deck');
  // 3 double-click a title; two tasks with the same title rename the right one (card ids)
  const t2=pg.locator('.cs-card[data-id="m2"] .cs-t, .cs-card[data-id="bkM"] .cs-t').first();
  const dup=await pg.evaluate(()=>[...document.querySelectorAll('.cs-t[data-rn]')].map(n=>n.dataset.rn+':'+n.textContent));
  console.log('tags',dup.join(' | '));
  await pg.evaluate(()=>{const n=[...document.querySelectorAll('.cs-t[data-rn]')].find(x=>x.dataset.rn==='m2');n&&n.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));});await R(400);
  const had=await pg.locator('.rn-in').count();
  ok('double-click opens the field on the right duplicate',had===1);
  if(had){await pg.locator('.rn-in').fill('Audit the brief');await pg.locator('.rn-in').blur();await R(500);
    ok('blur saves; the twin keeps its name',(await T('m2'))==='Audit the brief'&&(await T('m1'))==='Audit the deck',(await T('m2'))+'|'+(await T('m1')));
    await pg.evaluate(()=>document.querySelector('#v3ut .ub-b').click());await R(400);ok('Undo again',(await T('m2'))==='Audit the deck');}
  // 4 rename a bucket from the Plan page menu, with Undo
  await (w<700?pg.click('.m-tab:has-text("Projects")'):pg.click('.ptab[data-p="projects"]'));await R(700);
  await pg.locator('.bk-card[data-bk="bkM"] .bk-more').click();await R(400);
  ok('bucket menu has Rename',await pg.locator('.ps-sheet .rn-menu').count()===1);
  await pg.locator('.ps-sheet .rn-menu').click();await R(500);
  ok('bucket name field opens',await pg.locator('.bk-card[data-bk="bkM"] .rn-in').count()===1);
  await pg.locator('.rn-in').fill('Mugassam site');await pg.keyboard.press('Enter');await R(500);
  ok('bucket renamed',(await T('bkM'))==='Mugassam site'&&/Mugassam site/.test(await pg.locator('.bk-card[data-bk="bkM"] .bk-title').innerText()));
  await pg.evaluate(()=>document.querySelector('#v3ut .ub-b').click());await R(400);ok('bucket Undo',(await T('bkM'))==='Mugassam');
  // 5 a task row in a bucket renames through its menu
  await pg.evaluate(()=>__rn.start('m1'));await R(400);
  ok('row field opens',await pg.locator('.rn-in').count()===1);await pg.keyboard.press('Escape');await R(300);
  // 6 a step inside a card (title shared with a twin) renames by its own id
  await pg.evaluate(async D=>{const db=await window.claude.use('db');
    await db.doc('tasks/pp').set({title:'Case study',cat:'portfolio',date:D,mins:120,order:5,done:false});
    await db.doc('tasks/st1').set({title:'Write intro',parent:'pp',cat:'portfolio',date:D,mins:30,order:1,done:false});
    await db.doc('tasks/st2').set({title:'Write intro',parent:'pp',cat:'portfolio',date:D,mins:30,order:2,done:false});},D);await R(500);
  await (w<700?pg.click('.m-tab:has-text("Today")'):pg.click('.ptab[data-p="today"]'));await R(600);
  const sc=await pg.evaluate(()=>[...document.querySelectorAll('.cs-step-t[data-rn]')].map(n=>n.dataset.rn).join());console.log('steps',sc);
  await pg.evaluate(()=>{const n=document.querySelector('.cs-step-t[data-rn="st2"]');n&&n.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));});await R(300);
  if(await pg.locator('.rn-in').count()){await pg.locator('.rn-in').fill('Write the hook');await pg.keyboard.press('Enter');await R(400);}
  ok('step renamed by id, twin untouched',(await T('st2'))==='Write the hook'&&(await T('st1'))==='Write intro',(await T('st2'))+'|'+(await T('st1')));
  ok('no page errors',pg.errs.filter(e=>!/Failed to load resource/.test(e)).length===0,pg.errs.join('|'));
  await pg.close();}});
