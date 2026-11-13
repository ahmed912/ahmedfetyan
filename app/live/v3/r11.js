const {openp,run}=require('./h.js');
run(async b=>{for(let k=1;k<=3;k++){const pg=await openp(b,1300,{when:'2026-11-12T09:00:00'});const W=ms=>pg.waitForTimeout(ms);
  await pg.locator('.navlinks button, .topnav button').filter({hasText:'Review'}).first().click();await pg.clock.runFor(600);await W(700);
  const t=await pg.evaluate("document.querySelector('#bars .bar')?.innerText.replace(/\\s+/g,' ')");
  const chips=await pg.evaluate("[...document.querySelectorAll('#progressSwitch button, .sp-chips button, [data-sprint-switch] button')].map(x=>x.textContent.trim()+':'+x.getAttribute('aria-pressed')).join(',')");
  console.log('load',k,'| first bar:',t,'| chips:',chips.slice(0,80));await pg.close();}
});
