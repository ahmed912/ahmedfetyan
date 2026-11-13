// War setup: parent chips with step counts, horizon moves to the next sprint when the current one is empty
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?' '+x:''));if(!c)process.exitCode=1;};
run(async b=>{for(const when of ['2026-11-12T11:00:00','2026-11-14T11:00:00']){for(const w of [390,1300]){console.log('== '+when+' width '+w);
  const pg=await openp(b,w,{when});const W=ms=>pg.waitForTimeout(ms);await W(300);
  await pg.locator('#warCard, .pop-card:has-text("War")').first().click();await pg.clock.runFor(500);await W(600);
  const chips=await pg.evaluate("[...document.querySelectorAll('.ps-sheet .wr-grid .wr-chip')].map(c=>[c.querySelector('b').innerText,c.querySelector('span')?.innerText||'',c.querySelector('b').scrollWidth<=c.querySelector('b').clientWidth+1])");
  console.log(JSON.stringify(chips.map(c=>c.slice(0,2))));await shot(pg,'r10_'+when.slice(8,10)+'_'+w);
  const par=chips.filter(c=>/\d+ steps?, /.test(c[1]));
  ok('parent chips with N steps, about X h',par.length>=3,par.length);
  ok('Javelin area is listed',par.some(c=>/Javelin/i.test(c[0])));
  ok('titles are fully readable (no clipping)',chips.every(c=>c[2]));
  ok('category chips still present',chips.some(c=>/open$/.test(c[1])));
  const T=await pg.evaluate("window.__data.tasks");
  ok('no archived or cut task is behind a chip',!chips.some(c=>/Taste Makers test: 3-slide/.test(c[0])));
  const jav=await pg.evaluate("(()=>{const c=[...document.querySelectorAll('.ps-sheet .wr-grid .wr-chip')].find(c=>/Javelin/i.test(c.innerText));if(!c)return null;c.click();return true;})()");
  if(jav){await W(300);await pg.locator('.ps-sheet .wr-go').click();await pg.clock.runFor(500);await W(500);
    const ids=await pg.evaluate("JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>/war/i.test(k)&&localStorage.getItem(k)&&localStorage.getItem(k).includes('ids'))||'null')||'null')");
    const wid=ids&&ids.ids;ok('war on Javelin holds its steps',!!wid&&wid.length>0&&wid.every(i=>{const t=T[i];return t&&T[t.parent]&&/Javelin/i.test(T[t.parent].title)&&!t.done&&!t.archived&&!t.cut;}),wid&&wid.length);
    const dts=(wid||[]).map(i=>T[i].date);ok('steps in date order',JSON.stringify(dts)===JSON.stringify(dts.slice().sort()));}
  else ok('war on Javelin holds its steps',false,'no chip');
  const er=pg.errs.filter(e=>!e.includes('ERR_FAILED'));ok('no console errors',er.length===0,er.slice(0,2).join(' '));await pg.close();}}});
