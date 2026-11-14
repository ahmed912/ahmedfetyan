// Round 47: an unanswered War check-in keeps every elapsed minute; only a pause you press is excluded (setting off); paused minutes never exist without a pause event; Today, Time and Review add up the same
const fs=require('fs');const {openp,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const today='2026-11-09',old='2026-11-07';
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.entries=d.entries||{};
  const t0=new Date('2026-11-07T09:00:00').getTime(),H=3600000;
  d.entries[old]={date:old,items:[
    {id:'warlegacy',kind:'manual',ref:'other',label:'War on HASM',cat:'portfolio',note:'1 of 3 done',start:t0,end:t0+H,minutes:60,paused:141,sessions:[{start:t0,end:t0+H,minutes:60,paused:0}]},
    {id:'warpressed',kind:'manual',ref:'other',label:'War on Javelin',cat:'portfolio',note:'x',start:t0+4*H,end:t0+5*H,minutes:50,paused:10,pauses:[{start:t0+4.5*H,end:t0+4.5*H+600000}],sessions:[{start:t0+4*H,end:t0+4*H+1800000,minutes:30,paused:0},{start:t0+4*H+2400000,end:t0+5*H,minutes:20,paused:0}]},
    {id:'blk1',kind:'block',ref:'deep1',label:'Deep work',start:t0+7*H,end:t0+8*H,minutes:60,paused:0,sessions:[{start:t0+7*H,end:t0+8*H,minutes:60,paused:0}]}]};
  return d;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{sb:true,real:JSON.stringify(base())});const W=ms=>pg.waitForTimeout(ms);
  const E=(d,re)=>pg.evaluate(`JSON.stringify(window.__u20.itemsRaw('${d}').filter(x=>/${re}/.test(x.id)))`).then(JSON.parse);
  const S=d=>pg.evaluate(`JSON.stringify(window.__u21.surf('${d}'))`).then(JSON.parse);
  // migration on load
  await pg.clock.runFor(1500);await W(300);
  let L=(await E(old,'^warlegacy'))[0],P=(await E(old,'^warpressed'))[0];
  ok('migration: paused minutes with no pause event are added back as a counted session',L&&L.minutes===201&&L.paused===0&&L.sessions.length===2&&L.sessions[1].minutes===141,JSON.stringify(L));
  ok('migration leaves a note',/added back/.test(L.note||''));
  ok('a pause you pressed (with its event) is untouched',P&&P.minutes===50&&P.paused===10&&P.pauses.length===1);
  await pg.evaluate('window.__u21.fix()');await pg.clock.runFor(800);await W(300);
  L=(await E(old,'^warlegacy'))[0];ok('migration is idempotent',L.minutes===201&&L.sessions.length===2&&(L.note.match(/added back/g)||[]).length===1,JSON.stringify(L));
  let s=await S(old);ok('Today, Time, Review and the entry sum agree on the migrated day',s.today===s.time&&s.time===s.sum-0&&true&&s.review<=s.today&&s.sum===201+50+60&&s.today===311,JSON.stringify(s));
  // unanswered War: 50 min focus, 10 min break, check-in unanswered 2 h
  await pg.click('#warCard');await pg.clock.runFor(500);await W(300);
  await pg.locator('.wr-grid .wr-chip').first().click();await pg.click('.wr-go');await pg.clock.runFor(2000);await W(300);
  await pg.clock.fastForward(51*60000);await pg.clock.runFor(3000);await W(300);
  ok('after the focus round the war is on break',await pg.evaluate("window.__sbWar.get().phase")==='break');
  await pg.clock.fastForward(11*60000);await pg.clock.runFor(3000);await W(300);
  let wr=await pg.evaluate("window.__sbWar.get()");
  ok('break over: check-in pending, the war is NOT paused',!!wr.checkAt&&!wr.pausedAt,JSON.stringify({c:wr.checkAt,p:wr.pausedAt}));
  ok('the screen asks Still here',(await pg.locator('.wr-here').count())===1);
  await pg.clock.fastForward(125*60000);await pg.clock.runFor(4000);await W(500);
  ok('unanswered for 2 h: the war ended by itself',/"active":false/.test(await pg.evaluate("JSON.stringify(window.__data.timers.war)")));
  let it=(await E(today,'^war'))[0];const full=51+11+125;
  ok('the entry keeps all elapsed time',it&&Math.abs(it.minutes-full)<=2&&it.paused===0,JSON.stringify({m:it&&it.minutes,p:it&&it.paused}));
  ok('note says check-in missed and a trim target is stored',/check-in missed/.test(it.note)&&it.missed&&it.missed.minutes>=60&&it.missed.minutes<=63,JSON.stringify(it.missed));
  ok('session minutes add up to the entry minutes',Math.abs(it.sessions.reduce((a,x)=>a+x.minutes,0)-it.minutes)<0.2);
  s=await S(today);ok('Today, Time and Review equal the entry sum',s.today===s.time&&s.time===s.review&&Math.abs(s.sum-s.today)<0.2&&Math.abs(s.today-it.minutes)<0.2,JSON.stringify(s));
  // one tap trim in the entry sheet
  await pg.evaluate("__r2.setPage('today')");await pg.clock.runFor(600);
  await pg.evaluate(`window.__v21trimOpen&&0`);
  const m0=it.missed.minutes;await pg.evaluate(`window.__v21trim('${today}','${it.id}')`);await pg.clock.runFor(1500);await W(300);
  it=(await E(today,'^war'))[0];ok('Trim brings it back to the check-in in one call',Math.abs(it.minutes-m0)<=1&&!it.missed&&/trimmed/.test(it.note),JSON.stringify({m:it.minutes,n:it.note}));
  // a pause you press, setting off: excluded and recorded as an event
  await pg.evaluate("window.__data.timers.war={active:false,w:null}");
  await pg.evaluate("__r2.setPage('today')");await pg.clock.runFor(600);await W(200);
  await pg.click('#warCard');await pg.clock.runFor(500);await W(300);await pg.locator('.wr-grid .wr-chip').first().click();await pg.click('.wr-go');await pg.clock.runFor(1000);await W(300);
  const PB='.wr-pause:not(.wr-ext):not(.wr-rst):not(.wr-new):not(.wr-here)';
  await pg.clock.runFor(10*60000);await pg.click(PB);await pg.clock.fastForward(20*60000);await pg.click(PB);await pg.clock.runFor(5*60000);await W(300);
  await pg.click('.wr-end');await pg.clock.runFor(300);await W(200);await pg.click('.v3-conf .btn:not(.ghost)');await pg.clock.runFor(1500);await W(300);
  const all=await E(today,'^war');const it2=all.find(x=>x.id!==it.id);
  ok('your pause is excluded and recorded as a pause event',it2&&it2.minutes>=14&&it2.minutes<=16&&it2.paused>=19&&it2.paused<=21&&it2.pauses.length===1,JSON.stringify(it2&&{m:it2.minutes,p:it2.paused,n:(it2.pauses||[]).length}));
  s=await S(today);ok('sums still agree with two wars on the day',s.today===s.time&&s.time===s.review&&Math.abs(s.sum-s.today)<0.3,JSON.stringify(s));
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,4));await pg.context().close();}
});
