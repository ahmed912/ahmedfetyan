const {openp,run}=require('./h.js');
run(async b=>{const pg=await openp(b,1300,{h:900});const W=ms=>pg.waitForTimeout(ms);
  await pg.locator('.navlinks button, .topnav button').filter({hasText:'Gym'}).first().click();await pg.clock.runFor(600);await W(600);
  console.log(await pg.evaluate("(()=>{const v=document.getElementById('gymBody');if(!v)return 'no gymBody';const d=e=>[...e.children].map(c=>c.tagName.toLowerCase()+'.'+String(c.className).split(' ').slice(0,2).join('.')+'['+Math.round(c.getBoundingClientRect().width)+'x'+Math.round(c.getBoundingClientRect().height)+']').join(' | ');return 'gymBody w='+Math.round(v.getBoundingClientRect().width)+' display='+getComputedStyle(v).display+' :: '+d(v)+' || gymView w='+Math.round(document.getElementById('gymView').getBoundingClientRect().width)})()"));
});
