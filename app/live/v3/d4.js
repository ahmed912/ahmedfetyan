const {openp,shot,run}=require('./h.js');
run(async b=>{for(const w of [390,1300]){const pg=await openp(b,w);const W=ms=>pg.waitForTimeout(ms);
  const row=async()=>({day:await pg.evaluate("document.querySelector('#workView .page[data-page=today] h1, #dayTitle, .m-title')?.textContent?.trim()"),
    bar:(await pg.evaluate("document.querySelector('.dbar-focus')?.innerText.replace(/\\s+/g,' ')")),
    work:await pg.evaluate("document.querySelectorAll('.dbar-work span').length")});
  const hero=async()=>pg.evaluate("(()=>{const s=document.querySelector('#entHero .eh-big');return s?s.innerText.replace(/\\s+/g,' '):null})()");
  console.log('== width',w);
  const days=['2026-11-09','2026-11-08','2026-11-07','2026-11-06','2026-11-05','2026-11-04','2026-11-03'];
  for(let i=0;i<days.length;i++){
    // go back one day on the page
    if(i>0){await pg.click(w<700?'#prevDay, .m-head [aria-label="Previous day"]':'#prevDay');await pg.clock.runFor(300);await W(300);}
    const r=await row();
    // open Time to read hero for the same day without changing sel
    await pg.click('.pop-card:has-text("Time")');await pg.clock.runFor(500);await W(500);const h=await hero();await pg.keyboard.press('Escape');await pg.clock.runFor(500);await W(400);
    const after=await row();
    console.log(days[i],'| bar:',r.bar,'| workLine segs:',r.work,'| Time hero:',h,'| after closing Time -> day:',after.day);
  }
  await pg.close();}});
