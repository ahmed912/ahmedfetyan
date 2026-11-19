// Round 63: phone layout m33 (Gym, Money, Capture only at 600 px or less)
const {openp,run}=require('./h.js');const {load}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const today='2026-11-19';
const seed=()=>{const d=load();d.settings=d.settings||{};d.settings.war={countPause:false};d.settings.warSkip={on:false};d.timers=d.timers||{};d.timers.war={active:false,w:null};delete d.timers.pomo;
  d.tasks.r63a={title:'R63 Alpha',cat:'portfolio',date:today,done:false,order:-9};return JSON.stringify(d);};
const noerr=pg=>pg.errs.filter(x=>!/ERR_FAILED/.test(x)).length===0;
run(async b=>{
  {const W=390;console.log('== width',W);
  const pg=await openp(b,W,{when:today+'T09:00:00',real:seed(),m33:true,sb:true});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  const page=()=>pg.evaluate("document.body.dataset.page");
  ok('m33 on',await pg.evaluate("document.body.classList.contains('m33')"));
  ok('lands on Gym',(await page())==='gym'&&await pg.locator('#gymView').isVisible());
  const tabs=(await pg.locator('#mNav .m-tab').allTextContents()).map(x=>x.trim());
  ok('two tabs',tabs.length===2&&tabs[0]==='Gym'&&tabs[1]==='Money',JSON.stringify(tabs));
  await pg.click('#mNav .m-tab >> nth=1');await R(300);ok('Money tab',(await page())==='finance');
  await pg.evaluate("__u33.setPage('today')");await R(300);ok('today goes to gym',(await page())==='gym');
  const by=(await pg.locator('#m33Bar').boundingBox()).y,ny=(await pg.locator('#mNav').boundingBox()).y;
  ok('bar on top',await pg.locator('#m33Bar').isVisible()&&by<ny&&await pg.locator('#m33Run').isHidden());
  await pg.fill('#m33In','R63 note');await pg.click('.m33-add');await R(500);
  ok('capture saved',await pg.evaluate("Object.values(__u.state.notes||{}).some(v=>v.text==='R63 note')")&&(await pg.inputValue('#m33In'))==='');
  await pg.click('.m33-more');await R(500);ok('full capture opens',(await pg.locator('.ps-sheet #capIn').count())===1);
  await pg.evaluate("window.__u.psClose()");await R(500);
  await pg.click('#mHead .m-ib[aria-label="Settings"]');await R(300);
  ok('settings via gear',(await page())==='settings'&&(await pg.textContent('#m33Tog')).trim()==='On');
  await pg.evaluate("document.getElementById('warCard').click()");await R(500);
  await pg.locator('.ps-sheet .wr-grid .wr-chip').nth(0).click();await R(200);
  await pg.click('.ps-sheet .wr-go');await R(2000);await pg.evaluate("__u33.warClose()");await R(500);
  await pg.evaluate("__u33.setPage('gym')");await R(1500);
  ok('war pill',await pg.locator('#m33Run').isVisible()&&(await pg.textContent('#m33Run')).startsWith('War '),await pg.textContent('#m33Run'));
  await pg.click('#m33Run');await R(500);ok('pill opens war',(await pg.locator('#warView').count())===1);
  await pg.evaluate("__u33.warClose()");await R(500);
  await pg.evaluate("__u33.setPage('settings')");await pg.click('#m33Tog');await R(300);
  ok('toggle off',!(await pg.evaluate("document.body.classList.contains('m33')"))&&(await pg.locator('#mNav .m-tab').count())>=4&&(await pg.textContent('#m33Tog')).trim()==='Off');
  await pg.click('#m33Tog');await R(300);
  ok('toggle on',await pg.evaluate("document.body.classList.contains('m33')")&&(await pg.locator('#m33Bar').count())===1);
  ok('no errors',noerr(pg),JSON.stringify(pg.errs.slice(0,3)));await pg.context().close();}
  for(const W of [650,1300]){console.log('== width',W);
  const pg=await openp(b,W,{when:today+'T09:00:00',real:seed(),m33:true});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  ok(W+' no m33',!(await pg.evaluate("document.body.classList.contains('m33')")));
  if(W===650)ok('650 full tabs',(await pg.locator('#mNav .m-tab').count())>=4);
  ok(W+' no bar',(await pg.locator('#m33Bar').count())===0);
  if(W===1300){await pg.evaluate("__u33.setPage('today')");await R(300);ok('1300 today',(await pg.evaluate("document.body.dataset.page"))==='today');}
  await pg.context().close();}
});
