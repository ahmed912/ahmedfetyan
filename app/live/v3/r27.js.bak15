// Round 11 (capacity per chunk). Journey: Settings > Capacity (baseline, stretch, weekday, learning, shallow, sleep), the picker shows each day's blocks, Today header facts, Spread fills B1 to 4 h only, a chunk over its block is amber, Undo.
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const fs=require('fs');
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};d.entries={};d.sleep={};
  d.sprints={s2:{n:2,name:'Brand foundation',start:'2026-11-14',end:'2026-12-27',goal:'x'}};return d;};
const seed=async pg=>pg.evaluate(async()=>{const db=await window.claude.use('db');
  await db.doc('tasks/bk1').set({title:'Mugassam',bucket:true,bState:'active',order:1,done:false});
  await db.doc('tasks/bk2').set({title:'HASM',bucket:true,bState:'active',order:2,done:false});
  // Wed 18 Nov: Mugassam 5 h (over Block 1), a shallow item, a learning task
  for(let i=1;i<=5;i++)await db.doc('tasks/m'+i).set({title:'Mug step '+i,cat:'portfolio',parent:'bk1',date:'2026-11-18',mins:60,order:i,done:false,sprint:2});
  await db.doc('tasks/sh1').set({title:'Reply to comments',cat:'linkedin',date:'2026-11-18',mins:50,order:9,done:false,sprint:2});
  await db.doc('tasks/ln1').set({title:'Finish StoryBrand',cat:'learning',date:'2026-11-18',mins:30,order:10,done:false,sprint:2});
  // waiting: 5 h of HASM to spread
  for(let i=1;i<=5;i++)await db.doc('tasks/h'+i).set({title:'HASM slide '+i,cat:'portfolio',parent:'bk2',date:'2026-11-16',mins:60,order:20+i,done:false,waiting:true,sprint:2});
  const t=(h,m)=>new Date('2026-11-18T'+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':00').getTime();
  await db.doc('entries/2026-11-18').set({date:'2026-11-18',items:[{id:'e1',kind:'pomo',ref:'tasks:m1',label:'Mug step 1',minutes:50,sessions:[{start:t(21,20),end:t(22,10),paused:0,minutes:50}]}]});
  await db.doc('sleep/n1').set({kind:'night',start:new Date('2026-11-17T23:30:00').getTime(),end:new Date('2026-11-18T04:30:00').getTime()});});
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-18T10:00:00',real:JSON.stringify(base())});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(200);};
  await seed(pg);await R(600);
  const U=()=>pg.evaluate(()=>{const b=document.querySelector('#v3ut:not([hidden]) .ub-b');b&&b.click();});
  const cap=(d,k)=>pg.evaluate(([d,k])=>__cap.chunkCap(d,k),[d,k]);
  // 1 defaults: B1 4 h, B2 4 h, learning 60, shallow 120
  ok('defaults: B1 4 h, B2 4 h',(await cap('2026-11-18','b1'))===240&&(await cap('2026-11-18','b2'))===240);
  ok('defaults: learning 60, shallow 120',(await cap('2026-11-18','learn'))===60&&(await cap('2026-11-18','shallow'))===120);
  // 2 Today: amber over-block chunk, facts in plain words
  await pg.evaluate(()=>__r2.setPage('today'));await R(500);
  const card=await pg.evaluate(()=>{const c=document.querySelector('.ch-card[data-ch="b1"]');return c?{cls:c.className,t:c.getAttribute('aria-label')}:null;});
  ok('Mugassam 5 h in Block 1 is amber, over by 1 h',card&&/ch-over/.test(card.cls)&&/over by/.test(card.t),JSON.stringify(card));
  const hd=await pg.evaluate("document.querySelector('.dbar-focus').innerText.replace(/\\s+/g,' ')");
  ok('header: Work 1 of 8 h, Stretch 10 h, Learning, Gate',/Work 1 of 8 h/.test(hd)&&/Stretch 10 h/.test(hd)&&/Learning 0 of 30 min/.test(hd)&&/Gate 1/.test(hd),hd);
  ok('week fact: work 1 of 48 h, a heroic 23.5 h/day needed is shown as a fact',/Week: work 1 of 48 h, 23\.5 h\/day needed\. Learning 0 of 180 min/.test(hd),hd);
  ok('sleep facts: work 40 min past 21:30 and sleep 5 of 7 h',/Work ran 40 min past 21:30/.test(hd)&&/Sleep 5 of 7 h last night/.test(hd),hd);
  await shot(pg,'r27_today_'+w);
  // 3 the picker shows each day's blocks
  await pg.evaluate(()=>__sp10.rs('sh1','task'));await R(500);
  const f=await pg.evaluate(()=>[...document.querySelectorAll('.ps-sheet .rs-pick')].map(x=>x.dataset.facts));
  ok('picker: each day shows B1, B2, Learning and Shallow',f.length>=2&&f.every(x=>/B1 /.test(x)&&/B2 /.test(x)&&/Learning \d+ of 60/.test(x)&&/Shallow \d+ of 120/.test(x)),JSON.stringify(f));
  await shot(pg,'r27_picker_'+w);
  const df=await pg.evaluate(()=>__cap.dayFacts('2026-11-18'));
  ok('18 Nov facts: B1 Mugassam 5 of 4 h, B2 free 4 h, Learning 30 of 60, Shallow 50 of 120',df==='B1 Mugassam 5 of 4 h · B2 free 4 h · Learning 30 of 60 · Shallow 50 of 120',df);
  await pg.evaluate(()=>__r2.psClose());await R(300);
  // 4 Spread: B1 holds 4 h of HASM, the 5th hour goes to B2, never mixed with another bucket
  await pg.evaluate(()=>{__rl.spread();});await R(900);
  const sp=await pg.evaluate(()=>[1,2,3,4,5].map(i=>{const t=window.__data.tasks['h'+i];return [t.date,t.slot];}));
  const d0=sp[0][0];
  ok('Spread: first four hours in B1 on one day, the fifth in B2',sp.slice(0,4).every(x=>x[0]===d0&&x[1]===1)&&sp[4][0]===d0&&sp[4][1]===2,JSON.stringify(sp));
  ok('Spread day is not the over-full 18 Nov and not Friday',d0>'2026-11-18'&&new Date(d0+'T12:00').getDay()!==5,d0);
  await U();await R(500);
  ok('Spread Undo: waiting again',await pg.evaluate(()=>window.__data.tasks.h1.waiting===true));
  // 5 Settings > Capacity: baseline 10 gives Block 2 = 6 h
  await pg.evaluate(()=>__r2.setPage('settings'));await R(400);
  await pg.locator('#capBtn').click();await R(500);
  const bi=pg.locator('.ps-sheet input[aria-label="Work baseline (h)"]');await bi.fill('10');await bi.dispatchEvent('change');await R(600);
  ok('baseline 10: Block 2 is 6 h, Block 1 stays 4 h',(await cap('2026-11-18','b2'))===360&&(await cap('2026-11-18','b1'))===240);
  ok('sheet says Block 1: 4 h, Block 2: 6 h',/Block 1: 4 h, Block 2: 6 h/.test(await pg.locator('.ps-sheet .cap-split').innerText()));
  await shot(pg,'r27_capacity_'+w);
  await U();await R(500);
  ok('Undo: Block 2 back to 4 h',(await cap('2026-11-18','b2'))===240);
  // 6 a weekday baseline: Sat 6 h gives Block 2 = 2 h on Saturdays only
  await pg.evaluate(()=>__cap.sheet());await R(400);
  const sa=pg.locator('.ps-sheet input[aria-label="Sat baseline (h)"]');await sa.fill('6');await sa.dispatchEvent('change');await R(600);
  ok('Sat baseline 6 h: B2 2 h on 21 Nov; Wed unchanged',(await cap('2026-11-21','b2'))===120&&(await cap('2026-11-18','b2'))===240);
  await U();await R(400);ok('Undo: Sat back to 8 h',(await cap('2026-11-21','b2'))===240);
  // 7 learning minimum cannot go below 30; stretch below baseline refused
  await pg.evaluate(()=>__cap.sheet());await R(400);
  const lm=pg.locator('.ps-sheet input[aria-label="Learning minimum (min)"]');await lm.fill('20');await lm.dispatchEvent('change');await R(400);
  ok('learning minimum 20 refused',await pg.evaluate(()=>__ch.chCfg().learn.minMin)===30);
  const st=pg.locator('.ps-sheet input[aria-label="Stretch (h)"]');await st.fill('6');await st.dispatchEvent('change');await R(400);
  ok('stretch below baseline refused',await pg.evaluate(()=>__ch.chCfg().b3.h)===2);
  const sm=pg.locator('.ps-sheet input[aria-label="Sleep minimum (h)"]');await sm.fill('8');await sm.dispatchEvent('change');await R(500);
  ok('sleep minimum 8 h saved; sleep fact now reads 5 of 8 h',(await pg.evaluate(()=>__cap.rec().sleepMinH))===8&&/5 of 8 h/.test(await pg.evaluate(()=>__cap.sleepFact('2026-11-18'))));
  await pg.evaluate(()=>__r2.psClose());await R(300);
  // 8 a shallow item never counts as work: work hours stay 0 and B1 holds only design
  ok('shallow and learning never count in the blocks',await pg.evaluate(()=>{const c=__ch.chunksOn('2026-11-18');return c.find(x=>x.kind==='b1').tasks.every(t=>t.cat==='portfolio')&&c.find(x=>x.kind==='shallow').tasks.length===1;}));
  ok('no page errors',pg.errs.filter(e=>!/Failed to load resource/.test(e)).length===0,pg.errs.join('|'));
  await pg.close();}});
