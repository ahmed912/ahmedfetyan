// Round 13 (plan vs actual, personal bests). Journey: Saturday-Wednesday week; open Review; the panel says work vs baseline first, per chunk type planned vs done, deep blocks n of m, bests, sleep. Nothing added to Today.
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const fs=require('fs');
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};d.entries={};d.sleep={};d.rollover={};
  d.sprints={s2:{n:2,name:'Brand foundation',start:'2026-11-14',end:'2026-12-27',goal:'x'}};return d;};
const seed=async pg=>pg.evaluate(async()=>{const db=await window.claude.use('db');
  const ent=async(d,h1,m1,mins,extra)=>{const [y,mo,dd]=d.split('-').map(Number),s=new Date(y,mo-1,dd,h1,m1).getTime();
    await db.doc('entries/'+d).set({date:d,items:[{id:'e'+d+(extra&&extra.learning?'L':''),ref:'other',kind:'manual',label:'work',cat:'portfolio',minutes:mins,sessions:[{start:s,end:s+mins*60000,paused:0,minutes:mins}],...(extra||{})}]});};
  await ent('2026-11-07',9,0,450);          // previous week: 9 h, an older best
  await ent('2026-11-14',9,0,500);          // Sat 10 h: baseline and stretch
  await ent('2026-11-15',9,0,300);          // Sun 6 h: baseline missed
  await ent('2026-11-16',9,0,400);          // Mon 8 h
  await ent('2026-11-17',15,20,400);        // Tue 8 h, ends 22:00: sleep fact
  await db.doc('tasks/bk1').set({title:'Mugassam',bucket:true,bState:'active',order:1,done:false});
  await db.doc('tasks/bk2').set({title:'HASM',bucket:true,bState:'active',order:2,done:false});
  await db.doc('tasks/bk3').set({title:'Javelin',bucket:true,bState:'active',order:3,done:false});
  const T=(id,o)=>db.doc('tasks/'+id).set({cat:'portfolio',mins:60,done:false,order:1,...o});
  await T('m1',{title:'Mug a',parent:'bk1',date:'2026-11-14',slot:1,done:true});
  await T('m2',{title:'Mug b',parent:'bk1',date:'2026-11-14',slot:1,done:true});
  await T('m3',{title:'Mug c',parent:'bk1',date:'2026-11-15',slot:1,done:true});
  await T('m4',{title:'Mug d',parent:'bk1',date:'2026-11-15',slot:1});
  await T('h1',{title:'HASM a',parent:'bk2',date:'2026-11-16',slot:1,done:true});
  await T('j1',{title:'Jav a',parent:'bk3',date:'2026-11-16',slot:2});
  await T('l1',{title:'Learn a',cat:'learning',mins:30,date:'2026-11-14',done:true});
  await T('s1',{title:'Reply a',cat:'linkedin',mins:30,date:'2026-11-14',done:true});
  await T('s2',{title:'Reply b',cat:'linkedin',mins:30,date:'2026-11-15'});
  await T('f1',{title:'Future',parent:'bk1',date:'2026-11-19',slot:1});});
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-18T11:00:00',real:JSON.stringify(base())});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(250);};
  await seed(pg);await R(600);
  // Today stays light
  const todayTxt=(await pg.locator('.page[data-page="today"]').innerText()).replace(/\s+/g,' ');
  ok('Today shows no plan vs actual or bests',!/Plan vs actual|Personal bests|Best day/.test(todayTxt));
  await pg.evaluate(()=>__r2.setPage('progress'));await R(500);
  ok('Review has the Plan vs actual panel',(await pg.locator('#paRev').count())===1);
  const tx=(await pg.locator('#paRev').innerText()).replace(/\s+/g,' ');
  ok('work vs baseline first: 32 of 40 h, missed Sun',/Work: 32 of 40 h\. 8 h short\./.test(tx)&&/Baseline met on 3 of 5 days\. Missed: Sun/.test(tx)&&tx.indexOf('Work:')<tx.indexOf('Personal bests'),tx.slice(0,300));
  ok('stretch reached 1 day',/Stretch \(10 h\) reached on 1 day/.test(tx),tx);
  ok('learning planned vs done',/Learning: planned 0\.5 h, done 0\.5 h/.test(tx),tx);
  ok('deep planned vs done (6 h planned, 4 h done)',/Deep: planned 6 h, done 4 h/.test(tx),tx);
  ok('shallow planned vs done',/Shallow: planned 1 h, done 0\.5 h/.test(tx),tx);
  ok('deep blocks completed 2 of 4',/Deep blocks completed 2 of 4/.test(tx),tx);
  ok('best day 10 h, best week 32 h',/Best day: 10 h \(Sat 14 Nov\)\. Best week: 32 h/.test(tx),tx);
  ok('4-week trend',/Last 4 weeks: 0, 0, 9, 32 h/.test(tx),tx);
  ok('sleep fact flags work past 21:30',/Tue: Work ran 30 min past 21:30/.test(tx),tx);
  ok('no shame words',!/fail|lazy|shame|streak lost/i.test(tx));
  ok('at most 4 lines per group',(await pg.locator('#paRev .pa-grp').evaluateAll(g=>g.every(x=>x.querySelectorAll('li').length<=4))));
  await shot(pg,'r29_review_'+w);
  // navigate to the previous week, then back
  await pg.locator('#paRev .pa-prev').click();await R(300);
  let t2=(await pg.locator('#paRev').innerText()).replace(/\s+/g,' ');
  ok('earlier week shows its own facts',/Week of 7 Nov/.test(t2)&&/Work: 9 of 48 h/.test(t2),t2.slice(0,200));
  ok('later button appears only off the current week',(await pg.locator('#paRev .pa-next').count())===1);
  await pg.locator('#paRev .pa-next').click();await R(300);
  ok('back to this week',/This week so far/.test(await pg.locator('#paRev').innerText())&&(await pg.locator('#paRev .pa-next').count())===0);
  // a new personal best is said quietly
  await pg.evaluate(async()=>{const db=await window.claude.use('db');const s=new Date(2026,10,18,6,0).getTime();
    await db.doc('entries/2026-11-18').set({date:'2026-11-18',items:[{id:'etoday',ref:'other',kind:'manual',label:'work',cat:'portfolio',minutes:560,sessions:[{start:s,end:s+560*60000,paused:0,minutes:560}]}]});});
  await R(600);
  await pg.evaluate(()=>{__r2.setPage('today');});await R(300);await pg.evaluate(()=>__r2.setPage('progress'));await R(500);
  const t3=(await pg.locator('#paRev').innerText()).replace(/\s+/g,' ');
  ok('new best day stated as a fact',/Today is your best day so far: 11\.2 h, the previous best was 10 h/.test(t3)||/Best day: 11\.2 h/.test(t3),t3);
  ok('baseline line still comes first',t3.indexOf('Baseline met')<t3.indexOf('Personal bests'));
  ok('no page errors',pg.errs.filter(e=>!/Failed to load resource/.test(e)).length===0,pg.errs.join('|'));
  await pg.close();}});
