const {openp,run}=require('./h.js');
const ok=(n,c,x)=>console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?' '+x:''));
run(async b=>{for(const w of [390,1300]){const pg=await openp(b,w);const W=ms=>pg.waitForTimeout(ms);
  await pg.evaluate("document.getElementById('qFab').click()");await pg.clock.runFor(500);await W(600);
  const title=await pg.evaluate("document.querySelector('.ps-sheet .ps-sh-head h2')?.textContent");
  ok('floating music button opens the Queue ('+w+')',title==='Queue',title);
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,3));await pg.close();}});
