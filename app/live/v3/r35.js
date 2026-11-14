// Round 35 (one decision per move). Journey: hold a chunk header or tap Reschedule: one recommended day, at most 3 alternatives, no capacity text; one short toast with Undo.
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const fs=require('fs');
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};d.entries={};d.sleep={};d.rollover={};
  d.sprints={s2:{n:2,name:'Brand foundation',start:'2026-11-14',end:'2026-12-27',goal:'x'}};return d;};
const seed=async pg=>pg.evaluate(async()=>{const db=await window.claude.use('db');
  await db.doc('tasks/bk1').set({title:'Mugassam',bucket:true,bState:'active',order:1,done:false});
  for(let i=1;i<=3;i++)await db.doc('tasks/a'+i).set({title:'Mug step '+i,cat:'portfolio',parent:'bk1',date:'2026-11-15',slot:1,mode:'deep',mins:60,order:i,done:false});
  await db.doc('tasks/b1').set({title:'Single task',cat:'portfolio',parent:'bk1',date:'2026-11-15',slot:2,mode:'deep',mins:60,order:9,done:false});});
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-14T08:00:00',real:JSON.stringify(base())});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(250);};
  await seed(pg);await R(600);
  const T=id=>pg.evaluate(id=>window.__data.tasks[id],id);
  const sheet=async()=>(await pg.locator('.ps-sheet').innerText()).replace(/\s+/g,' ');
  for(const [name,open] of [['Move chunk',()=>pg.evaluate(()=>__rl.moveSheet(['a1','a2','a3'].map(i=>({...window.__data.tasks[i],id:i})),'Mugassam chunk'))],['Reschedule',()=>pg.evaluate(()=>__sp10.rs('b1','task'))]]){
    await open();await R(500);const tx=await sheet();
    const nch=await pg.locator('.ps-sheet .mv-choice').count();
    ok(name+': 4 choices at most ('+nch+')',nch>=2&&nch<=4,nch);
    ok(name+': one primary "Next free day"',(await pg.locator('.ps-sheet .mv-main').count())===1&&/Next free day: \w{3} \d+ \w{3}/.test(tx),tx.slice(0,160));
    ok(name+': no capacity text (of 4 h, B1, B2, Learning, Shallow)',!/ of \d+(\.\d)? ?h|\bB1\b|\bB2\b|Learning \d|Shallow \d/.test(tx),tx.slice(0,200));
    ok(name+': a Pick a date field',(await pg.locator('.ps-sheet .mv-date input').count())===1);
    ok(name+': no Friday offered',!/Fri /.test(await pg.locator('.ps-sheet .mv-list').innerText()));
    await shot(pg,'r35_'+name.replace(' ','')+'_'+w);
    if(name==='Move chunk'){await pg.locator('.ps-sheet .mv-main').click();await R(600);const bar=(await pg.locator('#v3ut').innerText()).replace(/\s+/g,' ');ok('one short toast with Undo',/^Moved to \w{3} \d+ \w{3}/.test(bar)&&bar.length<60&&/Undo/.test(bar),bar);
      const a=await T('a1');ok('whole chunk moved together',a.date===(await T('a2')).date&&a.date===(await T('a3')).date&&a.date!=='2026-11-15',a.date);
      await pg.evaluate(()=>{document.querySelector('#v3ut .ub-b').click();});await R(500);ok('Undo puts it back',(await T('a1')).date==='2026-11-15');}
    else await pg.keyboard.press('Escape');
    await R(300);}
  ok('no page errors',!pg.errs.filter(e=>!/Failed to load resource/.test(e)).length,pg.errs.join('|').slice(0,300));
  await pg.context().close();}});
