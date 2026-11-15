// Round 60: War on a task = its open subtasks (else just the task), no longer the whole category
const fs=require('fs');const {openp,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const today='2026-11-09';
const load=()=>JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const open=async d=>{const pg=await openp(b,w,{when:today+'T11:00:00',real:JSON.stringify(d)});return pg;};
  const R=(pg,ms)=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  const startTop=async pg=>{await pg.evaluate("window.__u.v3taskSheet('r60t')");await R(pg,700);
    await pg.click('.ps-sheet .btn:has-text("Start now")');await R(pg,600);await pg.click('.wr-go');await R(pg,800);return {id:'r60t',wd:await pg.evaluate("window.__sbWar.get()")};};
  const T0=d=>{d.tasks.r60t={title:'R60 solo task',cat:'portfolio',date:today,done:false,order:-9,mins:30};return d;};
  // 1) task without subtasks
  let pg=await open(T0(load()));
  const a=await startTop(pg);
  ok('task without subtasks: ids == [task] only',a.id==='r60t'&&!!a.wd&&a.wd.ids.length===1&&a.wd.ids[0]==='r60t',JSON.stringify(a));
  ok('no Up next rows for a single task',(await pg.locator('.wr-nrow').count())===0);
  await pg.context().close();
  // 2) task with 2 sub:true subtasks
  const d=T0(load());
  d.tasks.r60s1={title:'R60 sub one',cat:'portfolio',parent:'r60t',sub:true,done:false,order:1};
  d.tasks.r60s2={title:'R60 sub two',cat:'portfolio',parent:'r60t',sub:true,done:false,order:2};
  pg=await open(d);
  const c=await startTop(pg);
  ok('started from the task r60t',c.id==='r60t',c.id);
  ok('war doc ids equal exactly the 2 subtasks',!!c.wd&&c.wd.ids.length===2&&c.wd.ids.includes('r60s1')&&c.wd.ids.includes('r60s2'),JSON.stringify(c.wd&&c.wd.ids));
  ok('Up next lists 1 row',(await pg.locator('.wr-nrow').count())===1,String(await pg.locator('.wr-nrow').count()));
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,4));await pg.context().close();}
});
