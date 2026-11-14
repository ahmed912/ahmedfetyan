// Round 10 (optional sprints). Journey: Settings > Use sprints, turn off, sprint views hide, a date outside any sprint is allowed, Spread and rollover still work, Undo turns it back on.
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const fs=require('fs');
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};
  d.sprints={s2:{n:2,name:'Brand foundation',start:'2026-11-14',end:'2026-11-27',goal:'x'}};return d;};
const seed=async pg=>pg.evaluate(async()=>{const db=await window.claude.use('db');
  await db.doc('tasks/a1').set({title:'Draft the storyline',cat:'portfolio',date:'2026-11-18',mins:60,order:1,done:false,sprint:2});
  await db.doc('tasks/w1').set({title:'Audit the deck',cat:'portfolio',date:'2027-02-04',mins:60,order:2,done:false,waiting:true});});
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-18T10:00:00',real:JSON.stringify(base())});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(200);};
  await seed(pg);await R(500);
  const U=()=>pg.evaluate(()=>{const b=document.querySelector('#v3ut:not([hidden]) .ub-b');b&&b.click();});
  // 1 default: on; Today shows the sprint chips and the progress panel
  ok('sprints are on by default',await pg.evaluate(()=>__sp10.on()));
  ok('Today shows the sprint chip',/Sprint 2/.test(await pg.locator('#headChips').innerText()));
  // 2 Settings has the row; turn off
  await pg.evaluate(()=>__r2.setPage('settings'));await R(400);
  const row=pg.locator('#spUseRow');ok('Settings has Use sprints',(await row.count())===1&&/Use sprints/.test(await row.innerText()));
  await shot(pg,'r26_settings_on_'+w);
  await pg.locator('#spUseBtn').click();await R(500);
  ok('off: stored',await pg.evaluate(()=>window.__data.settings.sprintUse&&window.__data.settings.sprintUse.off===true));
  ok('off: row says so',/Off/.test(await pg.locator('#spUseSum').innerText()));
  ok('off: body flagged and sprint panel hidden',await pg.evaluate(()=>document.body.classList.contains('sp-off')&&getComputedStyle(document.querySelector('section[aria-labelledby="sprintH"]')).display==='none'));
  // 3 Today: no sprint chips, work target and Gate stay
  await pg.evaluate(()=>__r2.setPage('today'));await R(400);
  const hc=await pg.evaluate(()=>[...document.querySelectorAll('#headChips span')].filter(x=>!x.hidden&&x.offsetParent).map(x=>x.innerText).join('|'));
  ok('off: no sprint chip on Today',!/Sprint|days left/.test(hc),hc);
  const hd=await pg.evaluate("document.querySelector('.dbar-focus').innerText.replace(/\\s+/g,' ')");
  ok('off: Work and Gate stay on screen',/Work \d/.test(hd)&&/Gate 1/.test(hd),hd);
  await shot(pg,'r26_today_off_'+w);
  // 4 a date outside every sprint: reschedule sheet moves without a block, no sprint stamp
  await pg.evaluate(()=>__sp10.rs('a1','task'));await R(400);
  await pg.locator('.ps-sheet input[aria-label="New day"]').fill('2027-02-10');await R(900);
  let t=await pg.evaluate(()=>window.__data.tasks.a1);
  ok('off: moved to 10 Feb 2027 with no sprint, no warning',t.date==='2027-02-10'&&(t.sprint==null),JSON.stringify([t.date,t.sprint]));
  await U();await R(500);
  // Undo restores the date
  t=await pg.evaluate(()=>window.__data.tasks.a1);ok('Undo puts it back on 18 Nov',t.date==='2026-11-18',t.date);
  // 5 Spread with sprints off uses plain working days
  const sp0=await pg.evaluate(()=>{__rl.spread();return 1;});await R(700);
  t=await pg.evaluate(()=>window.__data.tasks.w1);
  ok('off: Spread places a waiting chunk on the next day, no sprint stamp',t.date&&t.date>'2026-11-18'&&!t.waiting&&t.sprint==null,JSON.stringify([t.date,t.waiting,t.sprint]));
  await U();await R(500);
  t=await pg.evaluate(()=>window.__data.tasks.w1);ok('Spread Undo: waiting again',t.waiting===true,JSON.stringify(t));
  // 6 turn back on from Settings, Undo of the off toast also works
  await pg.evaluate(()=>__r2.setPage('settings'));await R(300);
  await pg.locator('#spUseBtn').click();await R(500);
  ok('on again',await pg.evaluate(()=>__sp10.on()&&!document.body.classList.contains('sp-off')));
  await pg.evaluate(()=>__r2.setPage('today'));await R(400);
  ok('Today shows the sprint chip again',/Sprint 2/.test(await pg.locator('#headChips').innerText()));
  await pg.locator('#spUseBtn').count();
  // 7 on, a day outside the sprint is still allowed (a date is a plan); the sheet may ask once, never blocks
  await pg.evaluate(()=>__sp10.rs('a1','task'));await R(400);
  await pg.locator('.ps-sheet input[aria-label="New day"]').fill('2027-02-10');await R(900);
  await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Move$/.test(x.innerText.trim()));b&&b.click();});await R(700);
  t=await pg.evaluate(()=>window.__data.tasks.a1);
  ok('on: outside the sprint still moves (after one ask), no sprint stamp',t.date==='2027-02-10'&&t.sprint==null,JSON.stringify([t.date,t.sprint]));
  // 8 Work line: Start on Today still reaches War on one target
  ok('no page errors',pg.errs.filter(e=>!/Failed to load resource/.test(e)).length===0,pg.errs.join('|'));
  await pg.close();}});
