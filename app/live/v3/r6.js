const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?' '+x:''));
run(async b=>{for(const w of [390,1300]){const pg=await openp(b,w);const W=ms=>pg.waitForTimeout(ms);console.log('--- width',w);
  ok('LinkedIn tile on Today',(await pg.locator('#popCards #liCard').count())===1);
  await pg.click('#liCard');await pg.clock.runFor(500);await W(500);await shot(pg,'r6_cal_'+w);
  ok('pop-up has 3 tabs',(await pg.locator('.ps-sheet .li4-tabs button').allTextContents()).join('|')==='Calendar|Pillars|Guide|Posts');
  ok('7 day cards, one today',(await pg.locator('.li4-day').count())===7&&(await pg.locator('.li4-day.today').count())===1);
  ok('no horizontal overflow',await pg.evaluate("(()=>{const s=document.querySelector('.ps-sheet');return s.scrollWidth<=s.clientWidth+1&&document.documentElement.scrollWidth<=innerWidth+1})()"));
  await pg.click('.li4-tabs button:has-text("Pillars")');await W(300);
  ok('5 pillar tiles plus comments',(await pg.locator('.li4-pil').count())===6);
  await pg.locator('.li4-pil').nth(2).click();await pg.clock.runFor(400);await W(500);await shot(pg,'r6_pil_'+w);
  const t=await pg.locator('.ps-sheet').innerText();ok('pillar detail has what, examples, hooks, comment',/What it is/.test(t)&&/Examples/.test(t)&&/Comment formula/.test(t));
  await pg.keyboard.press('Escape');await pg.clock.runFor(450);await W(400);
  await pg.click('.li4-tabs button:has-text("Posts")');await W(300);await shot(pg,'r6_posts_'+w);
  ok('Posts tab renders',await pg.evaluate("!!document.querySelector('.li4-posts,.ps-sheet p.hint')"));
  const all=await pg.locator('.ps-sheet').innerText();ok('no em dashes',!/—/.test(all));
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,5));}
});
