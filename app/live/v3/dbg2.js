const {openp,shot,run}=require('./h.js');
run(async b=>{const pg=await openp(b,390);const W=ms=>pg.waitForTimeout(ms);
  await pg.click('.pop-card:has-text("Habits")');await pg.clock.runFor(500);await W(700);
  console.log(await pg.evaluate("(()=>{const s=document.getElementById('guardSum');const sec=document.querySelector('section[aria-labelledby=\"gdH\"]');const r=s.getBoundingClientRect();const cs=getComputedStyle(s);return JSON.stringify({html:s.innerHTML.slice(0,120),disp:cs.display,vis:cs.visibility,w:r.width,h:r.height,secClass:sec.className,parentDisp:getComputedStyle(s.parentElement).display,body:document.getElementById('guardBody').textContent.slice(0,60)})})()"));
  await pg.evaluate("document.querySelector('.ps-sheet .ps-sh-body').scrollTop=9999");await W(300);await shot(pg,'dbg_hab');
});
