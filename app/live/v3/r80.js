// Round 80: retired mode keeps Today, Projects, Gym, Money, Roadmap, Settings working; retired collections are byte for byte the same.
const {openp,run}=require('./h.js');const {load}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-28T11:00:00',real:JSON.stringify(load()),retire:1,rm44:1});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  const ev=s=>pg.evaluate(s);
  const snap=()=>pg.evaluate("JSON.stringify(['learning','inquiries','reminders','sleep','salah','design','guard','resources','liposts','wins','entries','timers'].map(k=>window.__data[k]||null))");
  const s0=await snap();
  for(const p of ['today','projects','roadmap','gym','finance','settings']){await ev("__r2.setPage('"+p+"')");await R(800);
    ok('page '+p,await pg.locator(p==='gym'?'#gymView':'#workView .page[data-page="'+p+'"]').first().isVisible());}
  await ev("__r2.setPage('progress')");await R(800);
  ok('review goes to roadmap',await pg.locator('#workView .page[data-page="roadmap"]').isVisible());
  await ev("__r2.setPage('fellow')");await R(800);
  ok('retired page goes to today',await pg.locator('#workView .page[data-page="today"]').isVisible());
  ok('simple today shown',await pg.locator('#rmToday').count()===1);
  ok('reminder banners hidden',await pg.locator('#remBanners').count()===0||await pg.locator('#remBanners').isHidden());
  await R(30000);
  ok('data untouched',await snap()===s0);
  ok('no errors',pg.errs.filter(e=>!/Failed to load resource/.test(e)).length===0,pg.errs.join(' | '));
  await pg.screenshot({path:'v3/shots/r80-'+w+'.png'});
}});
