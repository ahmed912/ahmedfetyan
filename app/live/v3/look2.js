const {openp,shot,run}=require('./h.js');
run(async b=>{const pg=await openp(b,390);
  const pop=async(sel,n)=>{await pg.click(sel);await pg.clock.runFor(600);await pg.waitForTimeout(700);await shot(pg,n,false);const s=await pg.$('.ps-sheet .ps-sh-body');if(s){await pg.evaluate(()=>{const b=document.querySelector('.ps-sheet .ps-sh-body');b.scrollTop=b.scrollHeight;});await pg.waitForTimeout(200);await shot(pg,n+'_b');}
    await pg.keyboard.press('Escape');await pg.clock.runFor(400);await pg.waitForTimeout(400);};
  await pop('.pop-card:has-text("Time")','p_time');
  await pop('.pop-card:has-text("Habits")','p_hab');
  await pop('.pop-card:has-text("Capture")','p_cap');
  await pg.click('#warCard');await pg.clock.runFor(500);await pg.waitForTimeout(700);await shot(pg,'p_war');await pg.keyboard.press('Escape');await pg.clock.runFor(400);await pg.waitForTimeout(400);
  await pg.click('.cs-more');await pg.clock.runFor(500);await pg.waitForTimeout(700);await shot(pg,'p_tv');await pg.keyboard.press('Escape');await pg.clock.runFor(400);await pg.waitForTimeout(400);
  await pg.click('.pop-card:has-text("Music")');await pg.clock.runFor(800);await shot(pg,'p_music',true);
  console.log(pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,5));
});
