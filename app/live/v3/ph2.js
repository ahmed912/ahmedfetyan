// Panel round 2: one line "what this does" under every option, hold a label for an example
const fs=require('fs');const {openp,run,shot}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks=d.tasks||{};
  d.tasks.bkP={title:'Panel test',bucket:true,bState:'active',cat:'portfolio',bStart:'2026-11-01',bEnd:'2026-11-30',done:false,order:1};
  d.tasks.pa={title:'Alpha ph1',parent:'bkP',date:'2026-11-09',cat:'portfolio',done:false,order:1};
  d.tasks.pb={title:'Beta ph1',parent:'bkP',date:'2026-11-09',cat:'portfolio',done:false,order:2};return d;};
run(async b=>{const errs=[];for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{sb:true,real:JSON.stringify(base())});await pg.clock.runFor(1500);const W=ms=>pg.waitForTimeout(ms);
  const after=(lab)=>pg.evaluate(l=>{const e=[...document.querySelectorAll('.ps-sheet .label')].find(x=>x.textContent.trim()===l);return e&&e.nextElementSibling&&e.nextElementSibling.classList.contains('ph-what')?e.nextElementSibling.textContent:null;},lab);
  await pg.evaluate("__u.v3taskSheet('pa',true)");await pg.clock.runFor(500);await W(300);
  const n1=await pg.locator('.ps-sheet .ph-what').count();ok('>=6 lines',n1>=6,n1);
  ok('Days it spans line',(await after('Days it spans'))==='How many days in a row it takes. It shows on each of them.',await after('Days it spans'));
  ok('Start for 5 has ph-in',(await pg.locator('.ps-sheet button:has-text("Start for 5 minutes") .ph-in').count())>=1);
  await shot(pg,'ph2-task-'+w);
  const hi=pg.locator('.ps-sheet .cat-chip, .ps-sheet button:text-is("High")').first();
  await pg.locator('.ps-sheet button:text-is("High")').first().click().catch(()=>{});await pg.clock.runFor(500);await W(200);
  ok('no duplicates after re-render',(await pg.locator('.ps-sheet .ph-what').count())===n1,n1+' '+await pg.locator('.ps-sheet .ph-what').count());
  await pg.evaluate("__u.capSheet()");await pg.clock.runFor(500);await W(300);
  ok('Stretch line',(await after('Stretch (h)'))==='The extra you can push to. Tracked, never required.',await after('Stretch (h)'));
  await shot(pg,'ph2-cap-'+w);
  const lab=pg.locator('.ps-sheet p.label',{hasText:'Shallow batch'}).first();await lab.scrollIntoViewIfNeeded();await W(200);const bx=await lab.boundingBox();
  await pg.mouse.move(bx.x+10,bx.y+bx.height/2);await pg.mouse.down();await pg.clock.runFor(700);await pg.mouse.up();await W(200);
  ok('hold shows pop',(await pg.locator('.ph-pop').count())===1&&/Example: 45 min after lunch\./.test(await pg.locator('.ph-pop').innerText()),await pg.locator('.ph-pop').allInnerTexts());
  await pg.keyboard.press('Escape');await pg.clock.runFor(300);await W(200);
  ok('Esc closes pop only',(await pg.locator('.ph-pop').count())===0&&(await pg.locator('.ps-sheet').count())===1);
  await pg.evaluate("__u.v3taskMenu('pa')");await pg.clock.runFor(500);await W(300);
  for(const t of ['Rename','Reschedule','Edit','Start for 5 minutes','Move to bucket','Archive','Delete']){
    const c=await pg.locator('.ps-sheet button.btn',{hasText:t}).evaluateAll((e,t)=>e.filter(x=>x.textContent.replace(/\s+/g,' ').trim().startsWith(t)&&x.querySelector('.ph-in')).length,t);ok('menu '+t+' has .ph-in',c>=1);}
  ok('no em dash in help lines',!(await pg.evaluate("JSON.stringify(window.__ph.help).includes('—')")));
  errs.push(...pg.errs);await pg.context().close();}
  console.log('errors',errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,4));
});
