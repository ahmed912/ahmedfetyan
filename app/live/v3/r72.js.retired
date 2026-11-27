// Round 72: matrix custom tasks (plans/mxc-<week>)
const {openp,run}=require('./h.js');const {load}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const W0='2026-11-14';
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const d=load();d.tasks.r72s={title:'R72 Sprint',cat:'portfolio',date:'2026-11-17',done:false,order:-9};
  d.plans=d.plans||{};delete d.plans['mx-default'];delete d.plans['mx-'+W0];delete d.plans['mxc-'+W0];
  const pg=await openp(b,w,{when:'2026-11-19T11:00:00',real:JSON.stringify(d)});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  const tv=k=>pg.textContent(`.mx-tile[data-k="${k}"] .mx-tv`);
  const plan=()=>pg.evaluate("JSON.stringify(window.__data.plans||{})").then(JSON.parse);
  const swipe=async(sel,dx)=>{await R(6000);await pg.evaluate(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:'center'})`);await R(150);const bb=await pg.locator(sel).first().boundingBox();console.log('DBG',sel,JSON.stringify(bb),await pg.evaluate(`(()=>{const b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();const e=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return e&&(e.className||e.tagName)})()`));const cx=bb.x+bb.width/2,cy=bb.y+bb.height/2;
    await pg.mouse.move(cx,cy);await pg.mouse.down();await pg.mouse.move(cx+dx,cy,{steps:10});await pg.mouse.up();await R(500);};
  await pg.evaluate("__r2.setPage('projects')");await R(800);
  await pg.click('#planMatrix .mx-open');await R(600);
  ok('30 empty',(await pg.textContent('.mc-none')).trim()==='No custom tasks this week');
  ok('9 tip',await pg.locator('.mc-tip').isVisible());
  const a0=await tv('ach');
  const S0=await pg.evaluate("(()=>{const c=__mx.calc('"+W0+"');return JSON.stringify({alloc:c.alloc,blW:c.blW,blA:c.blA,dayW:c.dayW,cm:c.cm})})()");
  const c0a=await pg.evaluate("__mx.calc('"+W0+"').ach");
  const T0=await pg.evaluate("JSON.stringify(__data.tasks)+JSON.stringify(__data.sprints)");
  await pg.click('.mc-add');await R(500);
  await pg.fill('.mc-title','R72 Custom');await pg.selectOption('.mc-day','3');await pg.fill('.mc-min','90');await pg.click('.mc-save');await R(600);
  let p=await plan();const c=p['mxc-'+W0];
  ok('own doc written',c&&c.items.length===1&&c.items[0].min===90&&c.items[0].day===3);
  ok('not in tasks',!JSON.stringify(await pg.evaluate("window.__data.tasks")).includes('R72 Custom'));
  ok('row shown',await pg.locator('.mc-row.mc-c:has-text("R72 Custom")').isVisible());
  ok('not done: ach same',(await tv('ach'))===a0);
  await swipe('.mc-row.mc-c',120);
  p=await plan();ok('ticked',p['mxc-'+W0].items[0].done===true);
  {const c1=await pg.evaluate("(()=>{const c=__mx.calc('"+W0+"');return {ach:c.ach,pct:c.pct,alloc:c.alloc,s:JSON.stringify({alloc:c.alloc,blW:c.blW,blA:c.blA,dayW:c.dayW,cm:c.cm})}})()");
  ok('24 exact',c1.ach-c0a===90,c0a+'|'+c1.ach);
  ok('24 pct',c1.pct===Math.round(c1.ach/60/c1.alloc*100),JSON.stringify(c1));
  ok('25 same',c1.s===S0);
  ok('26 sprint',(await pg.evaluate("JSON.stringify(__data.tasks)+JSON.stringify(__data.sprints)"))===T0);
  ok('9 tick undo',await pg.locator('#v3ut').isVisible());
  await pg.click('#v3ut .ub-b');await R(500);
  ok('9 undo done false',(await plan())['mxc-'+W0].items[0].done===false);
  await swipe('.mc-row.mc-c',120);ok('9 reticked',(await plan())['mxc-'+W0].items[0].done===true);
  ok('9 tip gone',(await pg.locator('.mc-tip').count())===0&&(await pg.evaluate("localStorage['mc-tip']"))==='1');}
  ok('ach +1.5h',parseFloat(await tv('ach'))-parseFloat(a0)>1.4,a0+'|'+await tv('ach'));
  await pg.locator('.mc-row.mc-c .mc-t').scrollIntoViewIfNeeded();await R(6000);await pg.click('.mc-row.mc-c .mc-t');await R(500);
  await pg.fill('.mc-title','R72 Renamed');await pg.click('.mc-save');await R(600);
  ok('edited',(await plan())['mxc-'+W0].items[0].title==='R72 Renamed');
  await swipe('.mc-row.mc-c',-120);
  ok('soft deleted',(await plan())['mxc-'+W0].items[0].deleted>0&&!(await pg.locator('.mc-row.mc-c').count()));
  ok('ach back',(await tv('ach'))===a0);
  await pg.click('#v3ut .ub-b');await R(500);
  ok('undo restores',(await pg.locator('.mc-row.mc-c').count())===1);
  const hold=async(sel,dy)=>{await pg.evaluate(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:'center'})`);await R(200);const bb=await pg.locator(sel).first().boundingBox();const cx=bb.x+bb.width/2,cy=bb.y+bb.height/2;await pg.mouse.move(cx,cy);await pg.mouse.down();await pg.clock.runFor(700);if(dy){await pg.mouse.move(cx,cy+dy,{steps:10});await pg.clock.runFor(100);}await pg.mouse.up();await R(500);};
  await hold('.mc-row.mc-c .mc-d',0);
  {const bt=await pg.locator('.ps-sheet button').allTextContents();ok('9 hold menu',['Edit','Delete'].every(t=>bt.some(b=>b.startsWith(t)))&&bt.some(t=>/done/i.test(t)),bt.join('|'));}
  await pg.keyboard.press('Escape');await R(400);if(await pg.locator('.ps-sheet').count()){await pg.evaluate("psClose&&psClose(true)").catch(()=>{});await R(300);}
  if(!(await pg.locator('.mc-row.mc-c').count())){await pg.evaluate("__mx.open&&__mx.open()");await R(500);}
  await pg.evaluate("__mxc.add('"+W0+"',{title:'R72 B',day:0,min:30})");await R(600);
  const order=()=>pg.$$eval('.mc-row.mc-c .mc-t',e=>e.map(x=>x.textContent));
  const o0=await order();
  await hold('.mc-row.mc-c:nth-child(2) .mc-d',-80);
  const o1=await order();
  ok('8 reorder',o1.join()===[o0[1],o0[0]].join(),o0.join()+'>'+o1.join());
  await pg.click('#v3ut .ub-b');await R(500);
  ok('8 reorder undo',(await order()).join()===o0.join());
  ok('8 no move up',(await pg.locator('text=Move up').count())===0);
  {const ids0=await pg.$$eval('.mc-row.mc-c',e=>e.map(x=>x.dataset.id));
  await swipe('.mc-row.mc-c',-120);await pg.click('#v3ut .ub-b');await R(500);
  ok('14 order',(await pg.$$eval('.mc-row.mc-c',e=>e.map(x=>x.dataset.id))).join()===ids0.join());}
  {const a=await pg.locator('.mc-row').first().boundingBox(),g=await pg.locator('.mx-grid').first().boundingBox();ok('5 edge',Math.abs(a.x-g.x)<=1,a.x+'|'+g.x);}
  await pg.evaluate("__mxc.add('"+W0+"',{title:'"+'X'.repeat(120)+"',day:2,min:10})");await R(600);
  {const r=await pg.evaluate("(()=>{const t=[...document.querySelectorAll('.mc-t')].find(e=>e.textContent.startsWith('XXXX'));const row=t.closest('.mc-row');return {o:t.scrollWidth>t.clientWidth,h:row.getBoundingClientRect().height,sw:document.scrollingElement.scrollWidth}})()");
  ok('31 long',r.o&&r.h<=48&&r.sw<=w,JSON.stringify(r));}
  await pg.evaluate("__mxc.add('"+W0+"',{title:'مهمة عربية',day:4,min:10})");await R(600);
  ok('33 RTL',(await pg.getAttribute('.mc-row.mc-c:has-text("مهمة") .mc-t','dir'))==='auto');
  await pg.screenshot({path:'v3/shots/r72-'+w+'.png',fullPage:true});
  ok('sprint row',await pg.locator('.mc-row.mc-s:has-text("R72 Sprint")').isVisible());
  await swipe('.mc-row.mc-s',-120);
  p=await plan();ok('hidden list',(p['mxc-'+W0].hidden||[]).includes('tasks:r72s')&&!(await pg.locator('.mc-row.mc-s:has-text("R72 Sprint")').count()));
  ok('task kept',(await pg.evaluate("window.__data.tasks.r72s&&!window.__data.tasks.r72s.deleted"))===true);
  await pg.context().setOffline(true);
  await pg.evaluate("__mxc.add('"+W0+"',{title:'R72 Off',day:1,min:15})");await R(500);
  ok('16 off row',await pg.locator('.mc-row:has-text("R72 Off")').isVisible());
  await pg.context().setOffline(false);await R(3000);
  ok('16 once',(await pg.evaluate("__mxc.doc('"+W0+"').items.filter(i=>i.title==='R72 Off').length"))===1);
  await pg.evaluate("__mx.close()");await pg.evaluate("__r2.setPage('today')");await R(600);
  ok('23 not elsewhere',!(await pg.evaluate("document.body.innerText")).includes('R72 Custom'));
  ok('28 rollover',(await pg.evaluate("__mxc.live('2026-11-21').length"))===0&&(await pg.evaluate("__mxc.live('"+W0+"').length"))>0);
  ok('no errors',pg.errs.filter(e=>!/ERR_FAILED/.test(e)).length===0,pg.errs.join('|'));
  await pg.context().close();}});
