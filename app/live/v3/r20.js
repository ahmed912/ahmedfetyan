// Round 2B: chunk cards on Today, mode, header, protected block, new tasks join their chunk
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const D='2026-11-30';
async function seed(pg){await pg.evaluate(async D=>{const db=await window.claude.use('db');
  await db.doc('tasks/bkM').set({title:'Mugassam',cat:'portfolio',done:false,bucket:true,bState:'active'});
  await db.doc('tasks/bkH').set({title:'HASM',cat:'portfolio',done:false,bucket:true,bState:'active'});
  await db.doc('tasks/m1').set({title:'Audit the original deck',parent:'bkM',cat:'portfolio',date:D,mins:60,order:1,done:false});
  await db.doc('tasks/h1').set({title:'Case study layout',parent:'bkH',cat:'portfolio',date:D,mins:60,order:2,done:false});
  await db.doc('tasks/l1').set({title:'Read chapter 3',cat:'learning',date:D,mins:30,order:3,done:false});
  for(let i=1;i<=3;i++)await db.doc('tasks/s'+i).set({title:'Comment batch '+i,cat:'linkedin',date:D,mins:15,order:10+i,done:false});},D);}
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  let pg=await openp(b,w,{when:D+'T06:00:00',sb:true});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(200);};
  const goD=async()=>{await pg.evaluate(D=>{window.__r2.setPage&&0;},D);};
  await seed(pg);
  // move the view to D: today is D by the clock
  await R(800);
  const cards=()=>pg.evaluate(()=>[...document.querySelectorAll('#cutStack .ch-card')].map(c=>({k:c.dataset.ch,open:c.classList.contains('open'),t:c.querySelector('.ch-t').innerText,txt:c.innerText})));
  let C=await cards();
  ok('4 cards in time order',C.map(c=>c.k).join()==='b1,b2,learn,shallow',C.map(c=>c.k).join());
  ok('Block 1 titled with its project',/^Block 1 · Mugassam · 4 h/.test(C[0].t)&&/^Block 2 · HASM · 4 h/.test(C[1].t),C.map(c=>c.t).join('|'));
  ok('only B1 open at 06:00',C.filter(c=>c.open).map(c=>c.k).join()==='b1');
  ok('no learning or shallow item visible at 06:00',!/Read chapter|Comment batch/.test(C.filter(c=>c.open).map(c=>c.txt).join(' ')));
  ok('only one Start on screen',await pg.locator('#cutStack .ch-go').count()===1);
  const hdr=await pg.evaluate("document.querySelector('.dbar-focus').innerText.replace(/\\s+/g,' ')");
  ok('header: work, learning, gate',/Work 0 of 8 h/.test(hdr)&&/Learning 0 of 30 min/.test(hdr)&&/Gate 1: 3 Jan, 34 days/.test(hdr),hdr);
  // 1 Start opens War on the first item
  await pg.click('#cutStack .ch-go');await R(500);
  ok('Start opens War sheet on Mugassam',/Mugassam|Audit/.test(await pg.locator('.ps-sheet').innerText()));
  await pg.locator('.ps-sheet .wr-go').click();await R(600);
  const war=await pg.evaluate("JSON.parse(localStorage.getItem('sb-war')||'null')");
  ok('War holds only the first target steps',!!war&&war.ids.length===1&&war.ids[0]==='m1',JSON.stringify(war&&war.ids));
  ok('War view has no task list',await pg.locator('#warView .cs-step, #warView .q-list, #warView ul').count()===0);
  await pg.evaluate("localStorage.removeItem('sb-war')");await pg.reload&&0;
  await pg.close();
  pg=await openp(b,w,{when:D+'T06:00:00',sb:true});await seed(pg);await R(800);
  // 2 add tasks: HASM joins Block 2, linkedin joins shallow
  const add=async(title,cat)=>{await pg.evaluate(({t,c})=>{document.getElementById('addTitle').value=t;document.getElementById('addCat').value=c;document.getElementById('addForm').requestSubmit();},{t:title,c:cat});await R(700);};
  const T=()=>pg.evaluate(()=>window.__data.tasks);
  const hasmPatch=async()=>{await pg.evaluate(async D=>{const db=await window.claude.use('db');await db.doc('tasks/hn').set({title:'Fix icons',parent:'bkH',cat:'portfolio',date:D,mins:30,order:5,done:false});},D);await R(500);};
  // a task made with the add field has no parent, so use the placement helper for HASM and the add field for linkedin
  const pl=await pg.evaluate(D=>__ch.placeInChunk({id:'zz',title:'Fix icons',parent:'bkH',cat:'portfolio',date:D},D),D);
  ok('placeInChunk: new HASM task gets HASM slot',pl.slot===2&&pl.mode==='deep',JSON.stringify(pl));
  const pl2=await pg.evaluate(D=>__ch.placeInChunk({id:'zz',title:'Reply to Omar',cat:'linkedin',date:D},D),D);
  ok('placeInChunk: linkedin is shallow, no slot',pl2.slot===null&&pl2.mode==='shallow',JSON.stringify(pl2));
  await add('Reply to Omar','linkedin');
  let t=Object.values(await T()).find(x=>x.title==='Reply to Omar');
  ok('add field: linkedin stored shallow, no slot',t&&t.mode==='shallow'&&!t.slot,JSON.stringify(t));
  await add('Polish deck','portfolio');
  t=Object.values(await T()).find(x=>x.title==='Polish deck');
  ok('add field: unbucketed design task takes a free slot (B3 stretch)',t&&t.slot===3&&t.mode==='deep',JSON.stringify(t));
  C=await cards();ok('stretch card appears in order',C.map(c=>c.k).join()==='b1,b2,b3,learn,shallow',C.map(c=>c.k).join());
  ok('third bucket on a full day is Stretch',/^Stretch · 2 h/.test(C[2].t),C[2].t);
  // undo of the add
  // 3 reschedule restores slot on undo
  await pg.evaluate(async()=>{const db=await window.claude.use('db');await db.doc('tasks/h1').update({slot:2});});await R(300);
  await pg.evaluate(()=>__ch.moveTaskTo('h1','2026-12-01'));await R(500);
  let h1=(await T()).h1;ok('moved task re-placed on new day',h1.date==='2026-12-01'&&h1.slot===1,JSON.stringify(h1));
  await pg.click('#undoBar .ub-b');await R(600);h1=(await T()).h1;
  ok('Undo restores date and slot',h1.date===D&&h1.slot===2,JSON.stringify(h1));
  // 4 mode toggle in the sheet
  await pg.evaluate(()=>__r2.psClose());await R(200);
  await pg.evaluate(()=>__ch.taskSheet('s1'));await R(500);
  await pg.locator('.ps-sheet .ch-mode',{hasText:'Deep'}).click();await R(600);
  let s1=(await T()).s1;ok('mode toggled to deep puts it in a design slot',s1.mode==='deep'&&s1.slot>=1,JSON.stringify(s1));
  await pg.locator('.ps-sheet .ch-mode',{hasText:'Shallow'}).click();await R(600);
  s1=(await T()).s1;ok('mode toggled back to shallow',s1.mode==='shallow'&&!s1.slot,JSON.stringify(s1));
  await pg.click('#undoBar .ub-b');await R(600);s1=(await T()).s1;ok('Undo restores deep',s1.mode==='deep',JSON.stringify(s1));
  await pg.click('#undoBar .ub-b').catch(()=>{});await R(600);
  await pg.evaluate(()=>__r2.psClose());await R(200);
  // 5 work vs learning hours
  const d0=await pg.evaluate(D=>({w:__ch.workHoursDone(D),l:__ch.learnDone(D)}),D);
  const now=new Date(D+'T07:00:00').getTime();
  await pg.evaluate(async({D,now})=>{__ch.addEntry(D,{kind:'manual',ref:'tasks:m1',label:'Audit',cat:'portfolio',start:now,end:now+50*60000,minutes:50});},{D,now});await R(600);
  let hd=await pg.evaluate("document.querySelector('.dbar-focus').innerText.replace(/\\s+/g,' ')");
  ok('50 min design = Work 1 of 8 h',/Work 1 of 8 h/.test(hd)&&/Learning 0 of 30/.test(hd),hd);
  const n2=new Date(D+'T08:00:00').getTime();
  await pg.evaluate(async({D,n2})=>{__ch.addEntry(D,{kind:'manual',ref:'tasks:l1',label:'Read',cat:'learning',learning:true,start:n2,end:n2+30*60000,minutes:30});},{D,n2});await R(600);
  hd=await pg.evaluate("document.querySelector('.dbar-focus').innerText.replace(/\\s+/g,' ')");
  ok('30 min learning = Learning 30 of 30, work unchanged',/Work 1 of 8 h/.test(hd)&&/Learning 30 of 30 min/.test(hd),hd);
  // 6 settings: b2.h = 5 gives 5 h and baseline 9 h; learning floor 30
  await pg.evaluate(()=>__ch.sheet());await R(400);
  const f=pg.locator('.ps-sheet input[aria-label="Block 2 hours"]');await f.fill('5');await f.dispatchEvent('change');await R(600);
  C=await cards();ok('B2 card shows 5 h',/· 5 h/.test(C.find(c=>c.k==='b2').t),C.find(c=>c.k==='b2').t);
  hd=await pg.evaluate("document.querySelector('.dbar-focus').innerText.replace(/\\s+/g,' ')");ok('baseline is 9 h',/of 9 h/.test(hd),hd);
  const lm=pg.locator('.ps-sheet input[aria-label="Learning minimum (min)"]');await lm.fill('10');await lm.dispatchEvent('change');await R(500);
  ok('learning minimum cannot go below 30',(await pg.evaluate(()=>__ch.chCfg().learn.minMin))===30);
  await pg.evaluate(()=>__r2.psClose());await R(200);
  // 7 empty states, and 15:30 clock
  await pg.close();
  pg=await openp(b,w,{when:D+'T15:30:00',sb:true});await seed(pg);await R(800);
  C=await cards();ok('15:30 Learning is open, B1 closed',C.find(c=>c.k==='learn').open&&!C.find(c=>c.k==='b1').open&&!C.find(c=>c.k==='b2').open,JSON.stringify(C.map(c=>[c.k,c.open])));
  await pg.locator('#cutStack .ch-card[data-ch="b1"] .ch-head').click();await R(300);
  ok('any card opens on tap',(await cards()).find(c=>c.k==='b1').open);
  const lt=await pg.evaluate(()=>{const a=document.querySelector('.dbar-focus');return a.innerText.replace(/\s+/g,' ');});ok('15:30 header shows Learning 0 of 30 min',/Learning 0 of 30 min/.test(lt),lt);
  await shot(pg,'r20_'+w,true);
  await pg.close();
  // empty states: a day with no tasks
  pg=await openp(b,w,{when:'2026-12-20T06:00:00',sb:true});await R(600);
  const e=await pg.evaluate(()=>document.querySelector('#cutStack').innerText.replace(/\s+/g,' '));
  ok('empty day: no design block, learning none, shallow hidden',/No design block planned/.test(e)&&/Learning: none planned, minimum 30 min/.test(e)&&!/Shallow batch/.test(e),e);
  const er=pg.errs.filter(x=>!x.includes('ERR_FAILED'));ok('no console errors',er.length===0,er.slice(0,2).join(' '));
  await pg.close();}});
