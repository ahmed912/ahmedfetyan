const {openp,shot,run}=require('./h');const fs=require('fs');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?' '+x:''));if(!c)process.exitCode=1;};
const MOCK=process.env.MOCKDATA||'/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=MOCK;
run(async b=>{const pg=await openp(b,390,{when:'2026-11-14T11:00:00',real:fs.readFileSync(MOCK,'utf8')});const W=ms=>pg.waitForTimeout(ms);
  const r=async ms=>{await pg.clock.runFor(ms);await W(150);};
  await pg.click('#liCard');await r(500);await pg.click('.li4-day[data-date="2026-11-15"]');await r(500);
  const z=()=>pg.evaluate("document.querySelector('.li4-mbox').dataset.zone");
  for(const [n,zone] of [[100,'calm'],[300,'green'],[2000,'amber'],[3100,'red']]){
    await pg.fill('.li4-body','a'.repeat(n));await r(100);
    ok(n+' chars -> '+zone,(await z())===zone&&(await pg.locator('.li4-cnt').innerText())===n+' / 3000',await z());
    if(n===2000)await shot(pg,'cnt1_amber');}
  await shot(pg,'cnt1_red');
  ok('save disabled over 3000',await pg.locator('.li4-save').isDisabled());
  await r(1500);const lp=await pg.evaluate("Object.values(window.__data.liposts||{})");
  ok('over-limit text not stored',lp.every(p=>(p.body||'').length<=3000),lp.length);
  await pg.fill('.li4-body','a'.repeat(500));await r(100);
  ok('save enabled again',!(await pg.locator('.li4-save').isDisabled()));
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,3));
});
