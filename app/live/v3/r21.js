// Round 3: quiet carry-forward, Waiting tray, Spread, Move chunk, decide after 3, Reorder in the quick menu
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const fs=require('fs');
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const SAT='2026-11-28',SUN='2026-11-29',MON='2026-11-30',TUE='2026-12-01',FRI='2026-12-04';
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};return d;};
async function seedSat(pg){await pg.evaluate(async D=>{const db=await window.claude.use('db');
  await db.doc('tasks/bkM').set({title:'Mugassam',cat:'portfolio',done:false,bucket:true,bState:'active'});
  await db.doc('tasks/bkH').set({title:'HASM',cat:'portfolio',done:false,bucket:true,bState:'active'});
  await db.doc('tasks/m1').set({title:'Audit the original deck',parent:'bkM',cat:'portfolio',date:D,mins:60,order:1,done:false});
  await db.doc('tasks/m2').set({title:'Draft the storyline',parent:'bkM',cat:'portfolio',date:D,mins:60,order:2,done:false});
  await db.doc('tasks/h1').set({title:'Case study layout',parent:'bkH',cat:'portfolio',date:D,mins:60,order:3,done:false});
  await db.doc('tasks/l1').set({title:'Read chapter 3',cat:'learning',date:D,mins:30,order:4,done:false});
  for(let i=1;i<=3;i++)await db.doc('tasks/s'+i).set({title:'Comment batch '+i,cat:'linkedin',date:D,mins:15,order:10+i,done:false});},SAT);
  const a=new Date(SAT+'T08:00:00').getTime(),l=new Date(SAT+'T15:00:00').getTime();
  await pg.evaluate(({SAT,a,l})=>{__ch.addEntry(SAT,{kind:'manual',ref:'tasks:m1',label:'Audit',cat:'portfolio',start:a,end:a+250*60000,minutes:250});
    __ch.addEntry(SAT,{kind:'manual',ref:'tasks:l1',label:'Read',cat:'learning',learning:true,start:l,end:l+10*60000,minutes:10});},{SAT,a,l});}
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  // Saturday: seed, then take the data to Sunday 05:15 (first open of the new day)
  let pg=await openp(b,w,{when:SAT+'T10:00:00',sb:true,roll:true,real:JSON.stringify(base())});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(200);};
  await seedSat(pg);await R(600);
  const json=await pg.evaluate("JSON.stringify(window.__data)");await pg.close();
  const open=async(when,real)=>{const p=await openp(b,w,{when,sb:true,roll:true,real:real||json});await p.clock.runFor(1500);await p.waitForTimeout(300);return p;};
  pg=await open(SUN+'T05:15:00');
  const T=()=>pg.evaluate(()=>window.__data.tasks);
  const bar=()=>pg.evaluate(()=>{const b=document.getElementById('v3ut');return b&&!b.hidden?b.innerText.replace(/\s+/g,' '):'';});
  const cards=()=>pg.evaluate(()=>[...document.querySelectorAll('#cutStack .ch-card')].map(c=>({k:c.dataset.ch,open:c.classList.contains('open'),t:c.querySelector('.ch-t').innerText,txt:c.innerText})));
  // 1 the quiet toast and the placement
  const msg=await bar();
  ok('toast: facts, carried chunks, waiting',/^Sat: work 5 of 8 h, learning 10 of 30 min\. Carried: Mugassam chunk \(2 tasks\), HASM chunk \(1 task\)\. Waiting: 4\./.test(msg),msg);
  let t=await T();
  ok('Mugassam carried together into Block 1',t.m1.date===SUN&&t.m2.date===SUN&&t.m1.slot===1&&t.m2.slot===1,JSON.stringify([t.m1,t.m2]));
  ok('HASM takes Block 2, never the same block',t.h1.date===SUN&&t.h1.slot===2,JSON.stringify(t.h1));
  ok('at most 3 carried on Today, rest wait on their old day',[t.l1,t.s1,t.s2,t.s3].every(x=>x.waiting===true&&x.date===SAT&&!x.slot),JSON.stringify([t.l1,t.s1]));
  ok('miss history kept: post 1 and the missed day',t.m1.post===1&&t.m1.rolled.join()===SAT&&t.l1.post===1,JSON.stringify([t.m1.post,t.m1.rolled]));
  const L=await pg.evaluate(D=>window.__data.rollover&&window.__data.rollover[D],SUN);
  ok('ledger written once: work, learning, carried, waiting',!!L&&L.work===5&&L.learn===10&&L.carried.length===2&&L.waiting.length===4&&L.undone===false,JSON.stringify(L&&{w:L.work,l:L.learn,c:L.carried.length,wt:L.waiting.length}));
  let C=await cards();
  ok('Block 1 and 2 chunks, Block 1 says from Sat',C[0].k==='b1'&&/Mugassam/.test(C[0].t)&&/from Sat/.test(C[0].txt)&&C[1].k==='b2'&&/HASM/.test(C[1].t),C.map(c=>c.t).join('|'));
  ok('no learning or shallow item inside a deep block',!/Read chapter|Comment batch/.test(C.filter(c=>c.k==='b1'||c.k==='b2').map(c=>c.txt).join(' ')));
  ok('miss history visible on the card',/Missed Sat/.test(C[0].txt),C[0].txt.slice(0,160));
  const hdr=await pg.evaluate("document.querySelector('.dbar-focus').innerText.replace(/\\s+/g,' ')");
  ok('header: work, learning, gate stay on screen',/Work 0 of 8 h/.test(hdr)&&/Learning 0 of 30 min/.test(hdr)&&/Gate 1/.test(hdr),hdr);
  // 2 the Waiting tray is one collapsed line
  ok('Waiting tray: one collapsed line with 4',(await pg.locator('#rlWait .ce-head').innerText()).replace(/\s+/g,' ').trim()==='Waiting 4');
  ok('tray list is not shown until tapped',await pg.locator('.ps-sheet').count()===0);
  // 3 Start opens War on one target, no list
  await pg.click('#cutStack .ch-go');await R(500);await pg.locator('.ps-sheet .wr-go').click();await R(600);
  ok('Start opens War on the first target of the chunk',await pg.locator('#warView').count()===1&&/Audit the original deck/i.test(await pg.locator('#warView').innerText()));
  await pg.evaluate("localStorage.removeItem('sb-war')");
  await pg.close();pg=await open(SUN+'T05:15:00');
  ok('no second rollover on the next open of the same day',(await T()).m1.post===1);
  // 4 Move chunk: long press on the header, capacity honoured
  const hold=async sel=>{await pg.evaluate(()=>{const u=document.getElementById('v3ut');if(u)u.hidden=true;});const el=pg.locator(sel).first();await el.scrollIntoViewIfNeeded();await R(100);const bb=await el.boundingBox();const cardHold=/cs-card/.test(sel);await pg.mouse.move(cardHold?bb.x+24:bb.x+bb.width/3,cardHold?bb.y+14:bb.y+bb.height/2);await pg.mouse.down();await R(650);await pg.mouse.up();await R(300);};
  await pg.evaluate(async D=>{const db=await window.claude.use('db');await db.doc('tasks/x1').set({title:'Pearl wireframes',cat:'portfolio',date:D,mins:240,order:50,slot:1,done:false,parent:'bkH'});},MON);await R(500);
  await hold('#cutStack .ch-card[data-ch="b1"] .ch-head');
  ok('long press on the chunk header opens Move chunk',/Move chunk/.test(await pg.locator('.ps-sheet').innerText()),await pg.locator('.ps-sheet').innerText().catch(()=>''));
  await pg.locator('.ps-sheet .mv-more summary').click();await R(200);
  const chips=await pg.evaluate(()=>[...document.querySelectorAll('.ps-sheet .rl-day')].map(x=>x.innerText));
  ok('days skip Friday; a full Monday shows as full or has room',chips.length>=3&&!chips.some(x=>/Fri/.test(x)),chips.join('|'));
  await pg.locator('.ps-sheet .rl-day[data-d="'+MON+'"]').click();await R(500);
  t=await T();ok('whole chunk moved together to Monday, in the free Block 2',t.m1.date===MON&&t.m2.date===MON&&t.m1.slot===2&&t.m2.slot===2,JSON.stringify([t.m1.date,t.m1.slot,t.m2.date,t.m2.slot]));
  ok('manual later-move adds 1 to post',t.m1.post===2,t.m1.post);
  await pg.click('#v3ut .ub-b');await R(500);t=await T();ok('Undo puts the chunk back',t.m1.date===SUN&&t.m1.slot===1&&t.m1.post===1&&t.m2.date===SUN,JSON.stringify([t.m1.date,t.m1.slot,t.m1.post]));
  await pg.evaluate(async D=>{const db=await window.claude.use('db');await db.doc('tasks/x2').set({title:'Pearl visuals',cat:'portfolio',date:D,mins:240,order:51,slot:2,done:false,parent:'bkM2'});await db.doc('tasks/bkM2').set({title:'Pearl',cat:'portfolio',done:false,bucket:true});},MON);await R(500);
  await pg.evaluate(async()=>{const db=await window.claude.use('db');await db.doc('tasks/x1').update({parent:'bkM2'});});await R(400);
  await pg.evaluate(ts=>__rl.moveChunk(ts,'2026-11-30',false),[(await T()).m1,(await T()).m2].map(x=>x).map((x,i)=>({...x,id:i?'m2':'m1'})));await R(500);
  t=await T();ok('a full Monday sends the chunk to the next free day (Tuesday)',t.m1.date===TUE&&t.m2.date===TUE&&t.m1.slot===1,JSON.stringify([t.m1.date,t.m1.slot]));
  ok('toast is one short line: Moved to a day',/^Moved to /.test(await bar())&&!/full or resting/.test(await bar()),await bar());
  await pg.click('#v3ut .ub-b');await R(500);
  // fallback: open chunk has a visible Move chunk button
  ok('tap fallback: Move chunk button inside the open chunk',await pg.locator('#cutStack .ch-card.open .rl-mv').count()===1);
  // 5 Waiting sheet and Spread (buffer days and Friday skipped)
  await pg.locator('#rlWait .ce-head').click();await R(400);
  const wt=await pg.locator('.ps-sheet').innerText();
  ok('Waiting sheet groups by chunk',/Learning · 1 task/.test(wt)&&/Shallow batch · 3 tasks/.test(wt)&&/Missed Sat/.test(wt),wt.replace(/\s+/g,' '));
  await pg.evaluate(()=>__r2.psClose());await R(200);
  await pg.evaluate(async()=>{const db=await window.claude.use('db');await db.doc('sprints/s3').update({buffer:['2026-11-30','2026-12-01','2026-12-02','2026-12-03']});});await R(500);
  await pg.locator('#rlWait .ce-head').click();await R(400);await pg.locator('.ps-sheet .rl-spread').click();await R(600);
  t=await T();ok('Spread skips buffer days and Friday: lands on Saturday 5 Dec',[t.l1,t.s1,t.s2,t.s3].every(x=>x.date==='2026-12-05'&&!x.waiting),JSON.stringify([t.l1.date,t.s1.date,t.s3.date]));
  ok('Spread does not add to post',t.s1.post===1);
  ok('tray gone when nothing waits',await pg.locator('#rlWait').count()===0);
  await pg.click('#v3ut .ub-b');await R(500);t=await T();ok('Undo puts them back in Waiting',t.l1.waiting===true&&t.l1.date===SAT&&await pg.locator('#rlWait').count()===1);
  await pg.evaluate(async()=>{const db=await window.claude.use('db');await db.doc('sprints/s3').update({buffer:null});});await R(400);
  await pg.locator('#rlWait .ce-head').click();await R(400);await pg.locator('.ps-sheet .rl-spread').click();await R(600);
  t=await T();ok('Spread whole chunks to one day each: learning and shallow on Monday',t.l1.date===MON&&t.s1.date===MON&&t.s2.date===MON&&t.s3.date===MON&&!t.s1.slot,JSON.stringify([t.l1.date,t.s1.date]));
  await pg.click('#v3ut .ub-b');await R(500);
  // 6 settings and review
  await pg.evaluate(()=>__r2.setPage('settings'));await R(500);
  ok('Settings has the Rollover row',await pg.locator('#rlRow').count()===1);
  await pg.locator('#rlBtn').click();await R(400);
  ok('Rollover sheet shows the ledger line',/Sat 28 Nov: work 5 of 8 h, learning 10 of 30 min/.test((await pg.locator('.ps-sheet').innerText()).replace(/\s+/g,' ')),(await pg.locator('.ps-sheet').innerText()).replace(/\s+/g,' '));
  await pg.evaluate(()=>__r2.psClose());await R(200);
  await pg.evaluate(()=>__r2.setPage('progress'));await R(500);
  ok('Progress shows Carried over',/Carried over/.test(await pg.locator('#rlRev').innerText()));
  await pg.evaluate(()=>__r2.setPage('today'));await R(400);
  // 7 (14 Nov) Reorder is hold then drag on the card list. No Reorder entry in the hold menu.
  await hold('#cutStack .ch-card[data-ch="b1"] .cs-card');
  ok('hold menu opens and has no Reorder, Move up or Move down',(await pg.locator('.ps-sheet .btn:has-text("Reschedule")').count())===1&&await pg.locator('.ps-sheet .rl-reorder').count()===0&&!/move up|move down|reorder/i.test(await pg.locator('.ps-sheet').innerText().catch(()=>'')));
  await pg.evaluate(()=>__r2.psClose());await R(300);
  const order=()=>pg.evaluate(()=>[...document.querySelectorAll('#cutStack .ch-card[data-ch="b1"] .cs-card')].map(x=>x.dataset.id));
  await pg.evaluate(()=>document.querySelectorAll('.cs-card').forEach(c=>c.dispatchEvent(new PointerEvent('pointercancel'))));await R(500);
  const o1=await order();
  {const rows=pg.locator('#cutStack .ch-card[data-ch="b1"] .cs-card');const a=await rows.nth(0).boundingBox(),c=await rows.nth(1).boundingBox();await pg.mouse.move(a.x+24,a.y+14);await pg.mouse.down();await pg.clock.runFor(600);await pg.mouse.move(a.x+24,c.y+c.height-4,{steps:6});await pg.mouse.up();await R(800);}
  await pg.evaluate(()=>document.querySelectorAll('.cs-card').forEach(c=>c.dispatchEvent(new PointerEvent('pointercancel'))));await R(800);
  const o2=await order();
  ok('hold then drag moves an item down in its chunk',o1.length===2&&o2[0]===o1[1]&&o2[1]===o1[0],o1.join()+' -> '+o2.join());
  await shot(pg,'r21_'+w,true);
  await pg.close();
  // 8 decide after 3: the 3rd postponement
  const d3=base();d3.tasks={bkM:{title:'Mugassam',cat:'portfolio',done:false,bucket:true,bState:'active'},
    d1:{title:'Write the case study',parent:'bkM',cat:'portfolio',date:SAT,mins:60,order:1,done:false,post:2,rolled:['2026-11-25','2026-11-26']}};
  pg=await open(SUN+'T05:15:00',JSON.stringify(d3));
  let d=(await T()).d1;ok('3rd postponement is counted',d.post===3&&d.rolled.length===3,JSON.stringify([d.post,d.rolled]));
  const card=await pg.locator('#cutStack .cs-card').first().innerText();
  ok('card says Postponed 3 times. Decide:',/Postponed 3 times\. Decide:/.test(card)&&/Do now/.test(card)&&/Shrink/.test(card)&&/Split/.test(card)&&/Drop/.test(card),card.replace(/\s+/g,' '));
  ok('miss history lists the days',/Missed Wed, Thu, Sat/.test(card),card.replace(/\s+/g,' '));
  await pg.evaluate(()=>__r2.psClose());
  await pg.evaluate(()=>{__r2.psClose();window.__rsTry=1;});
  await pg.evaluate(()=>{const f=window.__ch.moveTaskTo;f('d1','2026-12-02');});await R(500);
  ok('postponing again opens the decision, not the move',/Decide/.test(await pg.locator('.ps-sheet').innerText().catch(()=>''))&&(await T()).d1.date===SUN);
  await pg.evaluate(()=>__r2.psClose());await R(200);
  await pg.locator('#cutStack .rl-split').first().click();await R(700);
  t=await T();let parts=Object.values(t).filter(x=>/^Write the case study/.test(x.title||''));
  ok('Split makes two halves, post reset',parts.length===2&&parts.every(x=>x.mins===30&&!x.post),JSON.stringify(parts.map(x=>[x.title,x.mins,x.date])));
  await pg.click('#v3ut .ub-b');await R(700);t=await T();parts=Object.values(t).filter(x=>/^Write the case study/.test(x.title||''));
  ok('Undo split removes part 2 and restores',parts.length===1&&parts[0].mins===60&&parts[0].post===3,JSON.stringify(parts.map(x=>[x.title,x.mins,x.post])));
  await pg.locator('#cutStack .rl-shrink').first().click();await R(400);
  await pg.locator('.ps-sheet .rl-shrink-pick').first().click();await R(500);
  t=await T();ok('Shrink halves it and resets post',t.d1.mins===30&&!t.d1.post,JSON.stringify([t.d1.mins,t.d1.post]));
  await pg.click('#v3ut .ub-b');await R(500);t=await T();ok('Undo shrink',t.d1.mins===60&&t.d1.post===3);
  await pg.locator('#cutStack .rl-drop').first().click();await R(500);
  t=await T();ok('Drop archives it',t.d1.archived===true&&t.d1.cut===true);
  await pg.click('#v3ut .ub-b');await R(500);t=await T();ok('Undo drop',!t.d1.archived&&!t.d1.cut&&t.d1.post===3);
  await pg.locator('#cutStack .rl-now').first().click();await R(900);
  t=await T();ok('Do now: set for today, post reset, War opens',t.d1.date===SUN&&!t.d1.post&&await pg.locator('.ps-sheet, #warView').count()>0,JSON.stringify([t.d1.date,t.d1.post]));
  await pg.close();
  // 9 Friday: nothing is carried into the rest day, all wait
  const d4=base();d4.tasks={bkM:{title:'Mugassam',cat:'portfolio',done:false,bucket:true,bState:'active'},
    f1:{title:'Audit the deck',parent:'bkM',cat:'portfolio',date:'2026-12-03',mins:60,order:1,done:false}};
  pg=await open(FRI+'T05:15:00',JSON.stringify(d4));
  t=await T();ok('Friday: carried work waits, nothing lands on the rest day',t.f1.waiting===true&&t.f1.date==='2026-12-03'&&t.f1.post===1,JSON.stringify(t.f1));
  ok('Friday: Waiting tray shows 1',(await pg.locator('#rlWait .ce-head').innerText()).replace(/\s+/g,' ').trim()==='Waiting 1');
  // Undo of the whole rollover
  await pg.click('#v3ut .ub-b').catch(()=>{});await R(500);t=await T();ok('Undo rollover restores the tasks',!t.f1.waiting&&!t.f1.post&&t.f1.date==='2026-12-03',JSON.stringify(t.f1));
  ok('no page errors',pg.errs.filter(e=>!/ERR_FAILED/.test(e)).length===0,pg.errs.join('|').slice(0,300));
  await pg.close();}});
