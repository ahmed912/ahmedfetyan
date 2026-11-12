const {openp,shot,run}=require('./h.js');
run(async b=>{for(const w of [390,820,1300]){const pg=await openp(b,w,{h:900});const W=ms=>pg.waitForTimeout(ms);
  const go=async(name,sel)=>{await pg.click(sel);await pg.clock.runFor(500);await W(600);await shot(pg,`g1_${name}_${w}`,true);};
  await shot(pg,`g1_today_${w}`,true);
  
  const click=async(t)=>{const l=pg.locator(w>=700?'.navlinks button, .topnav button':'.m-tab').filter({hasText:t}).first();await l.click();await pg.clock.runFor(500);await W(600);};
  await click('Review');await shot(pg,`g1_review_${w}`,true);
  await click('Money');await shot(pg,`g1_money_${w}`,true);
  await click('Gym');await shot(pg,`g1_gym_${w}`,true);
  await pg.close();}});
