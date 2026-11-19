// Round 61: weekly time-block matrix (Sat..Fri x 4 blocks), picks, achieved from logged time
const {openp,run}=require('./h.js');const {item,addE,load,reloadKeep}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const today='2026-11-19',W0='2026-11-14';
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const d=load();
  d.tasks.r61t={title:'R61 Alpha',cat:'portfolio',date:'2026-11-19',done:false,order:-9};
  d.tasks.r61b={title:'R61 Bucket',bucket:true,bState:'active',cat:'portfolio',done:false,order:-9};
  d.tasks.r61c={title:'R61 child',parent:'r61b',cat:'portfolio',date:'2026-11-18',done:false};
  d.plans=d.plans||{};delete d.plans['mx-default'];delete d.plans['mx-2026-11-14'];
  addE(d,'2026-11-19',item('2026-11-19','e1','tasks:r61t','R61 Alpha',9,0,90));
  addE(d,'2026-11-18',item('2026-11-18','e2','tasks:r61c','R61 child',8,0,300));
  const pg=await openp(b,w,{when:today+'T11:00:00',real:JSON.stringify(d)});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  const tv=k=>pg.textContent(`.mx-tile[data-k="${k}"] .mx-tv`);
  const cell=k=>`.ps-sheet td.mx-c[data-k="${k}"]`;
  const vis=s=>pg.locator(s).first().isVisible();
  const plan=()=>pg.evaluate("JSON.stringify(window.__data.plans||{})").then(JSON.parse);
  const swipe=async(sel,dx)=>{const bb=await pg.locator(sel).boundingBox(),cx=bb.x+bb.width/2,cy=bb.y+bb.height/2;
    await pg.mouse.move(cx,cy);await pg.mouse.down();await pg.mouse.move(cx+dx,cy,{steps:10});await pg.mouse.up();await R(500);};
  const hold=async()=>{const bb=await pg.locator('.mx-tiles').boundingBox();await pg.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await pg.mouse.down();await R(700);await pg.mouse.up();await R(300);};
  // 1
  await pg.evaluate("__r2.setPage('projects')");await R(800);
  ok('plan row visible',await vis('#planMatrix'));
  const sum=await pg.textContent('.mx-sum');
  ok('row text',sum.includes('Week 47')&&sum.includes('6.5 h of 68 h'),sum);
  ok('lazy: no doc written',(await plan())['mx-2026-11-14']===undefined);
  // 2
  await pg.click('#planMatrix .mx-open');await R(600);
  ok('board sheet open',await vis('.ps-sheet[aria-label="Week matrix"]'));
  ok('tiles initial',(await tv('alloc'))==='68 h'&&(await tv('ach'))==='6.5 h'&&(await tv('pct'))==='10%'&&(await tv('buf'))==='13 h'&&(await tv('off'))==='24 h',[await tv('alloc'),await tv('ach'),await tv('pct'),await tv('buf'),await tv('off')].join('|'));
  ok('label/week/dates',(await pg.inputValue('.mx-label'))==='Week 47'&&(await pg.inputValue('.mx-wk'))===W0&&(await pg.textContent('.mx-dates')).trim()==='14 Nov to 20 Nov');
  // 3
  const cnt=s=>pg.locator(s).count();
  ok('counts',(await cnt('.ps-sheet td.mx-c'))===28&&(await cnt('.ps-sheet .mx-c.t-work'))===17&&(await cnt('.ps-sheet .mx-c.t-buf'))===4&&(await cnt('.ps-sheet .mx-c.t-off'))===7&&(await cnt('.ps-sheet .mx-dh'))===7,[await cnt('.ps-sheet td.mx-c'),await cnt('.ps-sheet .mx-c.t-work'),await cnt('.ps-sheet .mx-c.t-buf'),await cnt('.ps-sheet .mx-c.t-off'),await cnt('.ps-sheet .mx-dh')].join(','));
  // 4
  await pg.click(cell('5|0'));await R(600);
  ok('picker open',await vis('.ps-sheet[aria-label="Pick for block"]')&&(await pg.textContent('.ps-sh-sum')).includes('Thu Block 1'));
  await pg.fill('.mx-find','R61 Al');await R(200);
  await pg.click('.mx-opt:has-text("R61 Alpha")');await R(600);
  ok('back on board',await vis('.ps-sheet[aria-label="Week matrix"]'));
  ok('cell name',(await pg.textContent(cell('5|0')+' .mx-cn'))==='R61 Alpha');
  ok('toast pick',(await pg.textContent('#v3ut')).includes('Thu Block 1: R61 Alpha'));
  ok('ach unchanged by pick',(await tv('ach'))==='6.5 h',await tv('ach'));
  ok('not checked',!(await pg.isChecked(cell('5|0')+' .mx-ck')));
  // 5
  await pg.evaluate("__mx.pick('2026-11-14','4|0','tasks:r61b',true);__mx.pick('2026-11-14','4|1','tasks:r61b',true)");await R(400);
  ok('ach 6.5 pct 10',(await tv('ach'))==='6.5 h'&&(await tv('pct'))==='10%',await tv('ach')+'|'+await tv('pct'));
  ok('auto tick 4|0 only',(await pg.isChecked(cell('4|0')+' .mx-ck'))&&!(await pg.isChecked(cell('4|1')+' .mx-ck')));
  ok('block ach',(await pg.textContent('.ps-sheet .mx-ba[data-b="0"]'))==='5.5 h'&&(await pg.textContent('.ps-sheet .mx-ba[data-b="1"]'))==='1 h',await pg.textContent('.ps-sheet .mx-ba[data-b="0"]')+'|'+await pg.textContent('.ps-sheet .mx-ba[data-b="1"]'));
  // 6
  await pg.click(cell('5|0')+' .mx-ck');await R(400);
  ok('hand tick',(await pg.isChecked(cell('5|0')+' .mx-ck'))&&(await plan())['mx-2026-11-14'].cells['5|0'].done===true);
  await pg.click('#v3ut .ub-b');await R(400);
  ok('undo tick',!(await pg.isChecked(cell('5|0')+' .mx-ck'))&&(await plan())['mx-2026-11-14'].cells['5|0'].done==null);
  // 6b: tick adds block hours at once, untick drops
  {const w=await pg.evaluate("(()=>{const v=__mx.calc('2026-11-14');for(let i=0;i<7;i++)for(let b=0;b<4;b++){const c=v.doc.cells[i+'|'+b];if(c&&c.t==='w'&&!v.cm[i+'|'+b]&&c.done==null&&!c.ref&&i!==4&&i!==5)return {k:i+'|'+b,h:v.H[b],ach:v.ach};}})()");
  await pg.click(cell(w.k)+' .mx-ck');await R(400);
  const a1=parseFloat(await tv('ach'));ok('tick adds block hours',Math.abs(a1-(w.ach/60+w.h))<0.06,a1+'|'+JSON.stringify(w));
  await pg.click(cell(w.k)+' .mx-ck');await R(400);
  ok('untick drops',Math.abs(parseFloat(await tv('ach'))-w.ach/60)<0.06,await tv('ach'));}
  // 7
  await swipe(cell('5|1'),-130);
  ok('empty swipe no change',(await pg.textContent(cell('5|1')+' .mx-cn'))==='');
  await swipe(cell('5|0'),-130);
  ok('swipe left clears',(await pg.textContent(cell('5|0')+' .mx-cn'))===''&&(await pg.textContent('#v3ut')).includes('Cleared: Thu Block 1'));
  await pg.click('#v3ut .ub-b');await R(400);
  ok('undo clear',(await pg.textContent(cell('5|0')+' .mx-cn'))==='R61 Alpha');
  // 8
  await swipe(cell('4|1'),130);
  ok('swipe right done',(await pg.isChecked(cell('4|1')+' .mx-ck'))&&(await pg.textContent('#v3ut')).includes('Done: Wed Block 2'));
  await pg.click('#v3ut .ub-b');await R(400);
  ok('undo done',!(await pg.isChecked(cell('4|1')+' .mx-ck')));
  // 9
  await reloadKeep(pg);await pg.evaluate("__r2.setPage('projects')");await R(800);
  const s2=await pg.textContent('.mx-sum');
  ok('persist row',s2.includes('6.5 h of 68 h · 10%'),s2);
  await pg.click('#planMatrix .mx-open');await R(600);
  ok('persist pick',(await pg.textContent(cell('4|0')+' .mx-cn'))==='R61 Bucket');
  // 10
  await pg.click(cell('1|3'));await R(600);await pg.click('.mx-seg button:has-text("Work")');await R(400);
  await pg.evaluate("__u.psClose()");await R(500);await pg.evaluate("__mx.open()");await R(400);
  ok('type work',(await tv('alloc'))==='71 h'&&(await tv('buf'))==='10 h',await tv('alloc')+'|'+await tv('buf'));
  await pg.click('#v3ut .ub-b');await R(400);
  ok('type undo',(await tv('alloc'))==='68 h',await tv('alloc'));
  // 11
  await pg.click('.mx-bh[data-b="3"]');await R(600);await pg.fill('.mx-bhin','2');await pg.click('.mx-bh-save');await R(500);
  ok('block hours',(await tv('buf'))==='10 h'&&(await tv('off'))==='20 h'&&(await tv('alloc'))==='68 h',[await tv('buf'),await tv('off'),await tv('alloc')].join('|'));
  // 12
  await hold();
  ok('options sheet',await vis('.ps-sheet[aria-label="Week options"]'));
  await pg.click('.mx-del');await R(500);
  ok('deleted',(await tv('ach'))==='6.5 h'&&(await tv('buf'))==='13 h'&&!!(await plan())['mx-2026-11-14'].deleted,await tv('ach')+'|'+await tv('buf'));
  await pg.click('#v3ut .ub-b');await R(400);
  ok('delete undo',(await tv('ach'))==='6.5 h'&&(await tv('buf'))==='10 h',await tv('ach')+'|'+await tv('buf'));
  // 13
  await hold();await pg.click('.mx-savedef');await R(500);
  const df=(await plan())['mx-default'];
  ok('default saved',!!df&&df.types.length===4&&df.blockH[3]===2,JSON.stringify(df));
  await pg.fill('.mx-wk','2026-11-23');await pg.dispatchEvent('.mx-wk','change');await R(400);
  ok('next week',(await pg.inputValue('.mx-wk'))==='2026-11-21'&&(await pg.inputValue('.mx-label'))==='Week 48'&&(await tv('buf'))==='10 h'&&(await tv('ach'))==='0 h',[await pg.inputValue('.mx-wk'),await pg.inputValue('.mx-label'),await tv('buf'),await tv('ach')].join('|'));
  ok('next week lazy',(await plan())['mx-2026-11-21']===undefined);
  // 14
  const lay=await pg.evaluate("(()=>{const g=document.querySelector('.ps-sheet .mx-grid');return {r:g.getBoundingClientRect().right,iw:innerWidth,n:g.classList.contains('narrow')}})()");
  ok('layout fits',lay.r<=lay.iw+1,JSON.stringify(lay));
  ok('narrow class',lay.n===(w===390),JSON.stringify(lay));
  // 15
  ok('no errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).length===0,JSON.stringify(pg.errs.slice(0,3)));
  await pg.context().close();
  {const d2=load();addE(d2,'2026-11-16',item('2026-11-16','w9','other','War block',9,0,120));
  const p2=await openp(b,w,{when:today+'T11:00:00',real:JSON.stringify(d2)});
  const r=await p2.evaluate("(()=>{const v=__mx.calc('2026-11-14');return {ach:v.ach,cm:['2|0','2|1','2|2','2|3'].map(k=>v.cm[k])}})()");
  ok('other (War) entry counts',r.ach===120&&r.cm.reduce((x,y)=>x+y,0)===120,JSON.stringify(r));
  await p2.context().close();}}
});
