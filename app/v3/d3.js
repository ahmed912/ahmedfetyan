const {openp,shot,run}=require('./h.js');
run(async b=>{const pg=await openp(b,390);const W=ms=>pg.waitForTimeout(ms);
  const ents=()=>pg.evaluate("JSON.stringify(Object.fromEntries(Object.entries(window.__data.entries||{}).map(([d,v])=>[d,(v.items||[]).map(x=>x.label+' '+x.minutes+'m')])))");
  console.log('ENTRIES',(await ents()).slice(0,500));
  // Today: day bar focus
  console.log('today focused text:',await pg.evaluate("document.querySelector('.dbar-focus')?.innerText"));
  await pg.click('.pop-card:has-text("Time")');await pg.clock.runFor(500);await W(700);
  const snap=async n=>{console.log(n,'| title:',await pg.evaluate("document.querySelector('.ps-sheet .ps-sh-head h2')?.textContent"),'| sel hero:',await pg.evaluate("document.querySelector('#entHero .eh-big')?.innerText.replace(/\\n/g,' ')"),'| list:',await pg.evaluate("[...document.querySelectorAll('#entList .ent-label')].map(x=>x.textContent).join(' / ')"),'| page day:',await pg.evaluate("document.querySelector('.hdate, #dayTitle, h1.date')?.textContent"));};
  await snap('today');
  await pg.click('.v3-dnav .v3-ar >> nth=0');await pg.clock.runFor(300);await W(500);await snap('prev1');await shot(pg,'d3_prev1');
  await pg.click('.v3-dnav .v3-ar >> nth=0');await pg.clock.runFor(300);await W(500);await snap('prev2');
  await pg.click('.v3-dnav .v3-nx');await pg.clock.runFor(300);await W(500);await snap('next1');
  await pg.keyboard.press('Escape');await pg.clock.runFor(500);await W(500);
  console.log('after close, Today day title:',await pg.evaluate("document.querySelector('#workView .page[data-page=today] h1, .m-title')?.textContent"),'focused:',await pg.evaluate("document.querySelector('.dbar-focus')?.innerText"));
  console.log('errs',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,4));
});
