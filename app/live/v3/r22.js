// Round 5: sprints with buffer days. Journey: open a sprint, see 10 planned + 4 buffer, work capacity 80 h, change a day, change the setting, Today on a buffer day, overflow to buffer.
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const fs=require('fs');
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};
  d.sprints={s2:{n:2,name:'Brand foundation',start:'2026-11-14',end:'2026-11-27',goal:'x'},s3:{n:3,name:'First demand',start:'2026-11-28',end:'2026-12-11',goal:'y'}};return d;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-24T10:00:00',real:JSON.stringify(base())});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(200);};
  const SP=n=>pg.evaluate(n=>({buf:__sp.bufferOf(n),cap:__sp.cap(n)}),n);
  // 1 the sprint sheet shows planned + buffer, capacity and the buffer days
  let s=await SP(2);
  ok('S2 buffer days 20, 25, 26, 27 Nov',s.buf.join()==='2026-11-20,2026-11-25,2026-11-26,2026-11-27',s.buf.join());
  ok('10 planned, 80 h, reserve 16 h (Fridays rest)',s.cap.planned===10&&s.cap.buffer===4&&s.cap.workH===80&&s.cap.reserveH===16&&s.cap.learnMin===300,JSON.stringify(s.cap));
  await pg.evaluate(()=>__sp.board(2));await R(500);
  let tx=(await pg.locator('.ps-sheet').innerText()).replace(/\s+/g,' ');
  ok('sheet: 10 planned + 4 buffer days',/10 planned \+ 4 buffer days/.test(tx),tx.slice(0,300));
  ok('sheet: capacity line',/Work capacity 80 h \(10 days x 8 h\)/.test(tx)&&/Learning minimum 300 min/.test(tx)&&/Buffer reserve 16 h/.test(tx),tx.slice(0,400));
  ok('four buffer chips marked',(await pg.locator('.ps-sheet .sp-day.sp-buf').count())===4&&(await pg.locator('.ps-sheet .sp-day').count())===14);
  await shot(pg,'r22_sheet_'+w);
  // 2 tap a day to change it, Undo puts it back
  await pg.locator('.ps-sheet .sp-day[data-d="2026-11-26"]').click();await R(500);
  s=await SP(2);ok('26 Nov planned again: 11 planned + 3 buffer',s.cap.planned===11&&s.cap.buffer===3&&s.cap.workH===88&&!s.buf.includes('2026-11-26'),JSON.stringify(s.cap));
  const st=await pg.evaluate(()=>window.__data.sprints.s2.buffer);ok('stored on the sprint',Array.isArray(st)&&st.length===3,JSON.stringify(st));
  await pg.evaluate(()=>{const b=document.querySelector('#v3ut:not([hidden]) .ub-b');b&&b.click();});await R(400);s=await SP(2);
  ok('Undo: 4 buffer days again',s.cap.buffer===4&&s.buf.includes('2026-11-26'),JSON.stringify(s.cap));
  await pg.evaluate(()=>__r2.psClose());await R(200);
  // 3 setting: sprint length and buffer days, applies to sprints without their own buffer (S3)
  let c3=await SP(3);ok('S3 default 10 planned + 4 buffer (two Fridays count)',c3.cap.planned===10&&c3.cap.buffer===4&&c3.buf.includes('2026-12-04')&&c3.buf.includes('2026-12-11'),JSON.stringify(c3));
  await pg.evaluate(()=>__sp.cfgSheet());await R(400);
  const bi=pg.locator('.ps-sheet input[aria-label="Buffer days"]');await bi.fill('5');await bi.dispatchEvent('change');await R(500);
  c3=await SP(3);ok('buffer 5: S3 has 9 planned + 5 buffer',c3.cap.planned===9&&c3.cap.buffer===5,JSON.stringify(c3.cap));
  const U=()=>pg.evaluate(()=>{const b=document.querySelector('#v3ut:not([hidden]) .ub-b');b&&b.click();});
  await U();await R(400);
  c3=await SP(3);ok('Undo: back to 14 = 10 + 4',c3.cap.planned===10&&c3.cap.buffer===4,JSON.stringify(c3.cap));
  const bad=pg.locator('.ps-sheet input[aria-label="Buffer days"]');await bad.fill('40');await bad.dispatchEvent('change');await R(400);
  ok('out of range refused',(await pg.evaluate(()=>__sp.cfg())).buffer===4);
  await pg.evaluate(()=>__r2.psClose());await R(200);
  // 4 Today on a buffer day: visible note, work target stays on screen, nothing planned
  { const p2=await openp(b,w,{when:'2026-11-25T10:00:00',real:JSON.stringify(base())});await p2.clock.runFor(800);
    const note=await p2.evaluate(()=>{const n=document.querySelector('.sp-note');return n?n.innerText:'';}),hd=await p2.evaluate("document.querySelector('.dbar-focus').innerText.replace(/\\s+/g,' ')");
    ok('Today on 25 Nov says buffer day, no planned load',/Buffer day\. No planned load/.test(note),note);
    ok('work target and Gate stay on screen',/Work 0 of 8 h/.test(hd)&&/Gate 1/.test(hd),hd);
    await shot(p2,'r22_today_'+w);await p2.close();
    const p3=await openp(b,w,{when:'2026-11-24T10:00:00',real:JSON.stringify(base())});
    ok('a planned day shows no buffer note',(await p3.locator('.sp-note').count())===0);await p3.close();}
  await pg.evaluate(async()=>{const db=await window.claude.use('db');await db.doc('tasks/w1').set({title:'Draft the storyline',cat:'portfolio',date:'2026-11-23',mins:60,order:1,done:false,waiting:true});await db.doc('tasks/p1').set({title:'Audit the deck',cat:'portfolio',date:'2026-11-26',mins:60,order:2,done:false});});await R(400);
  // 5 overflow: nothing planned is left in S2 after 24 Nov, so Spread takes the buffer day, not Sprint 3
  const before=await pg.evaluate(()=>window.__data.tasks.p1.date);
  ok('seed: a planned task is not touched by the buffer view',before==='2026-11-26');
  await pg.locator('#rlWait .ce-head').click();await R(400);
  await pg.locator('.ps-sheet .rl-spread').click();await R(600);
  const t=await pg.evaluate(()=>window.__data.tasks.w1);
  ok('overflow lands on a buffer day inside the sprint (25 Nov)',t.date==='2026-11-25'&&!t.waiting&&t.sprint===2,JSON.stringify([t.date,t.waiting,t.sprint]));
  const toast=await pg.evaluate(()=>document.body.innerText.replace(/\s+/g,' '));
  ok('toast names the buffer days',/to buffer days/.test(toast));
  // 6 the buffer day is visible on Today and in the waterfall; Fill skips it
  ok('Spread undo is offered',await pg.evaluate(()=>[...document.querySelectorAll('button')].some(x=>/^Undo$/i.test(x.innerText.trim()))));
  ok('no page errors',pg.errs.filter(e=>!/Failed to load resource/.test(e)).length===0,pg.errs.join('|'));
  await pg.close();}});
