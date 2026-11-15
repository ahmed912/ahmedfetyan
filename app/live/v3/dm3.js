// Diamonds round 3: Today row and Done sheet
const {openp,run,shot}=require('./h.js');const {load,seed2,reloadKeep}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  let pg=await openp(b,w,{sb:true,real:JSON.stringify(seed2(load()))});const W=ms=>pg.waitForTimeout(ms);
  await pg.clock.runFor(1500);const E=x=>pg.evaluate(x);const T=async s=>(await pg.locator(s).first().innerText()).trim();
  await E("__r2.setPage('today')");await pg.clock.runFor(800);await W(200);
  const cnt=await E("String(__dm.winsDoneCount('2026-11-07'))");
  ok('done count',(await T('#dmRow [data-dm="done"] .dm-n'))===cnt&&cnt!=='0',cnt);
  ok('shipped count 1',(await T('#dmRow [data-dm="shipped"] .dm-n'))==='1');
  ok('done diamond on',await E("document.querySelector('#dmRow [data-dm=\"done\"] .dm-ic').classList.contains('on')"));
  await shot(pg,'dm3-today-'+w);
  await pg.locator('#dmRow [data-dm="done"]').click();await pg.clock.runFor(700);await W(200);
  ok('done sheet open',await pg.locator('.ps-sheet[aria-label="Done"]').first().isVisible());
  ok('week header',(await T('.dm-wh .lh-wh'))==='Week of 7 Nov',await T('.dm-wh .lh-wh'));
  const exp=await E("(()=>{const s=__dm.winsDone('2026-11-07').reduce((a,r)=>a+r.min,0);return s>0?dur(s):''})()").catch(()=>null);
  const sum=await E("__dm.winsDone('2026-11-07').reduce((a,r)=>a+r.min,0)");
  const wt=await T('.dm-wt');const sr=Math.round(sum),h=Math.floor(sr/60),m=sr%60;const dd=h?(h+'h'+(m?' '+m+'m':'')):m+'m';
  ok('week total',wt===dd,wt+' vs '+dd);
  const n=await pg.locator('.dm-wk').first().locator('.dm-r').count();
  const total=await E("__dm.winsDone('2026-11-07').length");
  ok('max 4 rows and more button',n<=4&&(total<=4||await pg.locator('.ps-sheet .ck-more').count()>0),n+'/'+total);
  // show all to find rows
  if(total>4){await pg.locator('.ps-sheet .ck-more').first().click();await pg.clock.runFor(300);}
  const ms=await pg.locator('.dm-wk').first().locator('.dm-m').evaluateAll(a=>a.map(x=>Math.round(x.getBoundingClientRect().right)));
  ok('amount column aligned',ms.length>0&&Math.max(...ms)-Math.min(...ms)<=1,ms.join());
  const tag=await pg.locator('.dm-r[data-id="t_u1"] .dm-tag').first().innerText();
  ok('u1 tag',/in progress, 4h 30m so far/.test(tag)&&/3 sessions/.test(tag),tag);
  await shot(pg,'dm3-done-'+w);
  await pg.locator('.dm-r[data-id="t_d1"]').first().click();await pg.clock.runFor(700);await W(200);
  ok('win sheet',await pg.locator('.ps-sheet[aria-label="Win"]').first().isVisible());
  await pg.locator('.dm-refl').fill('Two late nights');await pg.locator('.dm-refl').blur();await pg.clock.runFor(100);
  ok('saved shows',await pg.locator('.dm-saved').first().isVisible());
  await pg.keyboard.press('Escape');await pg.clock.runFor(800);await W(200);
  ok('back on Done',await pg.locator('.ps-sheet[aria-label="Done"]').first().isVisible().catch(()=>false));
  await pg.keyboard.press('Escape');await pg.clock.runFor(800);
  await reloadKeep(pg);
  await E("__r2.setPage('today')");await pg.clock.runFor(800);
  await pg.locator('#dmRow [data-dm="done"]').click();await pg.clock.runFor(700);
  if(total>4){await pg.locator('.ps-sheet .ck-more').first().click();await pg.clock.runFor(300);}
  await pg.locator('.dm-r[data-id="t_d1"]').first().click();await pg.clock.runFor(700);
  const rv=await pg.locator('.dm-refl').inputValue().catch(e=>'none');ok('reflection persisted',rv==='Two late nights',rv+' ss='+await E("(sessionStorage.getItem('__mockdata')||'').includes('Two late')")+' keys='+await E("Object.keys(window.__data).join()")+' '+await E("document.querySelector('.ps-sheet').getAttribute('aria-label')"));
  await pg.keyboard.press('Escape');await pg.clock.runFor(800);
  // swipe left
  const row=pg.locator('.dm-r[data-id="t_d1"]').first();await row.scrollIntoViewIfNeeded();const bb=await row.boundingBox();
  await pg.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await pg.mouse.down();
  for(let i=1;i<=8;i++){await pg.mouse.move(bb.x+bb.width/2-i*20,bb.y+bb.height/2);}
  await pg.mouse.up();await pg.clock.runFor(500);
  ok('row hidden by swipe',(await pg.locator('.dm-r[data-id="t_d1"]').count())===0);
  await pg.locator('#v3ut button').first().click();await pg.clock.runFor(500);
  ok('undo returns row',(await pg.locator('.dm-r[data-id="t_d1"]').count())>0||await E("__dm.winsDone('2026-11-07').some(r=>r.id==='t_d1')"));
  await pg.keyboard.press('Escape');await pg.clock.runFor(500);
  // empty data
  const pe=await openp(b,w,{sb:true,real:JSON.stringify((()=>{const d=load();d.entries={};d.logs={};for(const k in d.tasks){if(d.tasks[k]&&(d.tasks[k].done||d.tasks[k].bucket))delete d.tasks[k];}return d;})())});
  await pe.clock.runFor(1500);await pe.evaluate("__r2.setPage('today')");await pe.clock.runFor(800);
  ok('empty counts 0',(await pe.locator('#dmRow .dm-n').allInnerTexts()).join()==='0,0',(await pe.locator('#dmRow .dm-n').allInnerTexts()).join());
  await pe.locator('#dmRow [data-dm="done"]').click();await pe.clock.runFor(700);
  ok('empty text',(await pe.locator('.dm-empty').first().innerText()).trim()==='Nothing here yet this week. Finished tasks, habit days and logged effort land here by themselves.');
  console.log('errors',[...pg.errs,...pe.errs].filter(e=>!e.includes('ERR_FAILED')).slice(0,4));await pg.context().close();await pe.context().close();}
});
