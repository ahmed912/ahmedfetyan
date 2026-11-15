// Round 57: forgotten sessions. Gym ends 60 min after its start at most; a work day, War or work timer left running closes at 21:30 with the time kept, a note, and one-tap Edit
const fs=require('fs');const {openp,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const today='2026-11-09',yday='2026-11-08';const at=(d,h,m)=>new Date(d+'T'+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':00').getTime();
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.entries={};d.sleep={};d.rollover={};
  d.logs[today]={date:today,workIn:at(today,8,0)};
  d.logs[yday]={date:yday,workIn:at(yday,8,0),workOut:at(yday,17,0)};
  d.timers=d.timers||{};d.timers.war={active:true,w:{k:'cat',v:'portfolio',label:'Design',ids:[],done:[],start:at(today,20,5),dur:480,phase:'focus',phase0:0},at:Date.now()};
  d.timers.active={block:'deep1',date:today,startedAt:at(today,19,0),pausedAt:null,pausedTotal:0};
  d.gym=d.gym||{};d.gym.active={id:'g57',day:0,startedAt:at(today,19,30),sets:{'0-0':{done:true,at:at(today,19,40),w:20,r:10}},alts:{},restUntil:null,restFor:null};
  return d;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:today+'T20:00:00',real:JSON.stringify(base())});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(250);};
  const D=()=>pg.evaluate(()=>JSON.parse(JSON.stringify(window.__data)));
  await R(8000);
  let d=await D();
  ok('before the cap nothing is closed: day open',!d.logs[today].workOut);
  ok('before the cap: War and block timer still running',d.timers.war.active===true&&d.timers.active.block==='deep1');
  ok('gym under 60 min still running',d.gym.active&&d.gym.active.id==='g57');
  await pg.clock.fastForward(35*60000);await R(35000);   // 20:35
  d=await D();const gs=d.gym.s_g57;
  ok('Gym ends 60 min after its start at most',!!gs&&gs.minutes===60&&gs.end===at(today,20,30)&&gs.auto===true&&/auto-ended/.test(gs.note||''),JSON.stringify(gs&&{m:gs.minutes,e:gs.end,n:gs.note}));
  ok('gym no longer running, the set is kept',(!d.gym.active||!d.gym.active.id)&&gs&&gs.sets===1);
  ok('still before 21:30: day, War, timer untouched',!d.logs[today].workOut&&d.timers.war.active===true&&d.timers.active.block==='deep1');
  await pg.clock.fastForward(60*60000);await R(35000);   // 21:35
  d=await D();
  ok('work day closes at 21:30 with a note',d.logs[today].workOut===at(today,21,30)&&d.logs[today].workNote==='auto-closed at 21:30',JSON.stringify(d.logs[today]));
  ok('a day closed by the user is untouched',d.logs[yday].workOut===at(yday,17,0)&&!d.logs[yday].workNote);
  const E=((d.entries[today]||{}).items)||[];
  const war=E.find(x=>/War on Design/.test(x.label||'')),blk=E.find(x=>x.kind==='block');
  ok('War entry kept up to 21:30, billable minutes, with the note',!!war&&war.minutes===85&&/auto-closed at 21:30/.test(war.note||'')&&!war.deleted,JSON.stringify(war&&{m:war.minutes,n:war.note}));
  ok('War is closed',!d.timers.war||d.timers.war.active===false);
  ok('block timer entry kept to 21:30 with the note',!!blk&&blk.minutes===150&&/auto-closed at 21:30/.test(blk.note||''),JSON.stringify(blk&&{m:blk.minutes,n:blk.note}));
  ok('block timer stopped',!d.timers.active||!d.timers.active.block);
  ok('no entry was dropped or duplicated',E.length===2,E.map(x=>x.label).join('|'));
  // a second run (another device) does not close twice
  await pg.evaluate("window.__u57.run()");await R(1000);d=await D();const E2=((d.entries[today]||{}).items)||[];
  ok('closing again does nothing',E2.length===2&&d.logs[today].workOut===at(today,21,30));
  // one tap Edit
  const bar=pg.locator('#v57n');ok('a quiet note with Edit is shown',await bar.isVisible()&&(await pg.locator('#v57n .v57-edit').count())===1);
  await pg.locator('#v57n .v57-edit').click();await R(800);
  ok('Edit opens the correction sheet',(await pg.locator('.ps-sheet').count())===1);
  await pg.keyboard.press('Escape');await R(400);
  // total counts towards the day
  const worked=await pg.evaluate("window.__u20.workedMin('"+today+"')");ok('the time counts as worked',worked>=85,String(worked));
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,4));await pg.context().close();}
});
