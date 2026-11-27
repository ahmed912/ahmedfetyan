// Round 71: colour tags (settings/tags): default by category, set from the hold menu, custom tags in Settings, marks on rows and matrix blocks
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260.84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const {openp,run}=require('./h.js');const {load}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const today='2026-11-19';
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const d=load();d.settings=d.settings||{};delete d.settings.tags;d.plans=d.plans||{};delete d.plans['mx-2026-11-14'];delete d.plans['mxc-2026-11-14'];
  d.tasks.t1={title:'R71 Work one',cat:'portfolio',date:today,done:false,order:-9};
  d.tasks.t2={title:'R71 Learn',cat:'learning',date:today,done:false,order:-8};
  d.tasks.t3={title:'R71 Brand',cat:'linkedin',date:today,done:false,order:-7};
  d.tasks.t5={title:'مهمة عربية',cat:'learning',date:today,done:false,order:-5};
  d.tasks.t6={title:'X'.repeat(120),cat:'portfolio',date:today,done:false,order:-4};
  d.tasks.t4={title:'R71 Plain',cat:'outreach',date:today,done:false,order:-6};
  const pg=await openp(b,w,{when:today+'T11:00:00',real:JSON.stringify(d)});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  const T=id=>pg.evaluate(`__tg.forTask('${id}')`);
  const set=()=>pg.evaluate("JSON.stringify((window.__data.plans||{})['tg-tags']||null)").then(JSON.parse);
  ok('1 defaults by category',(await T('t1'))==='work'&&(await T('t2'))==='learning'&&(await T('t3'))==='brand'&&(await T('t4'))===null,[await T('t1'),await T('t2'),await T('t3'),await T('t4')].join());
  ok('1 no tags doc yet',(await set())===null);
  // marks on Today card
  const card=pg.locator('.cs-card.cs-top').first();
  ok('2 Today card has a mark',await pg.locator('.cs-card .cs-head .tg-mark').count()>=1);
  ok('2 mark in chip',await pg.locator('.cs-card .cat-chip .tg-mark').count()>=1&&await pg.locator('.cs-card .cs-head > .tg-mark').count()===0);
  ok('3 muted',await pg.evaluate("__tags.list().every(g=>{const m=g.color.match(/[0-9a-f]{2}/gi).map(h=>parseInt(h,16)/255),mx=Math.max(...m),mn=Math.min(...m),l=(mx+mn)/2,sat=mx===mn?0:(mx-mn)/(1-Math.abs(2*l-1));return sat<=0.45})"));
  const ttl=(await card.locator('.cs-t').textContent()).trim();
  const tid=Object.entries(d.tasks).find(([k,v])=>v.title===ttl);
  // hold menu on the card
  const hold=async()=>{await card.evaluate(e=>e.scrollIntoView({block:'center'}));await R(300);const bb=await card.boundingBox();await pg.mouse.move(bb.x+24,bb.y+Math.min(14,bb.height/2));await pg.mouse.down();await pg.clock.runFor(900);await pg.mouse.up();await card.evaluate(e=>e.dispatchEvent(new PointerEvent('pointerup',{bubbles:true})));await R(400);};
  await hold();
  ok('3 hold menu has tag chips',await pg.locator('.ps-sheet .tg-pick .tg-chip').count()===3,await pg.locator('.ps-sheet .tg-chip').count());
  ok('3 no emoji icons',!/[\u{1F300}-\u{1FAFF}]/u.test(await pg.locator('.ps-sheet .tg-pick').textContent()));
  const id=tid?tid[0]:'t1';
  await pg.locator('.ps-sheet .tg-chip[data-tag="brand"]').click();await R(500);
  ok('4 tag set from menu',(await T(id))==='brand',await T(id));
  const doc=await set();
  ok('4 own plans doc',!!doc&&doc.map&&doc.map[id]==='brand'&&doc.upd>0&&doc.created>0,JSON.stringify(doc));
  ok('4 task doc untouched',await pg.evaluate(`!('tag' in (window.__data.tasks['${id}']||{}))`));
  ok('4 mark colour changed',await pg.evaluate(`(()=>{const m=document.querySelector('.cs-card[data-id="${id}"] .tg-mark');return !!m&&m.dataset.tag==='brand'})()`),await pg.evaluate(`[...document.querySelectorAll('.cs-card')].map(c=>c.dataset.id+':'+(c.querySelector('.tg-mark')||{dataset:{}}).dataset.tag).join()`)+' id='+id);
  // settings: custom tag add, rename, delete
  await pg.evaluate("__r2.setPage('settings')");await R(800);
  ok('5 Settings row',await pg.locator('#tgRow #tgBtn').isVisible());
  await pg.click('#tgBtn');await R(500);
  ok('5 sheet lists 3 built in',await pg.locator('.tg-row').count()===3);
  await pg.fill('.tg-new','Deep focus');await pg.locator('.tg-swb').last().click();await R(300);
  await pg.fill('.tg-new','Deep focus');await pg.click('.tg-add');await R(600);
  let c=await pg.evaluate("JSON.stringify(__tg.cfg())").then(JSON.parse);
  ok('5 custom added with colour',c.list.length===1&&c.list[0].name==='Deep focus'&&/^#[0-9a-f]{6}$/i.test(c.list[0].color),JSON.stringify(c));
  const cid=c.list[0].id;
  await pg.fill('.tg-row[data-tag="'+cid+'"] .tg-name','Deep');await pg.press('.tg-row[data-tag="'+cid+'"] .tg-name','Tab');await R(500);
  c=await pg.evaluate("JSON.stringify(__tg.cfg())").then(JSON.parse);
  ok('5 renamed',c.list[0].name==='Deep',JSON.stringify(c));
  await pg.evaluate(`__tg.set('t2','${cid}')`);await R(400);
  ok('5 custom tag on task',(await T('t2'))===cid);
  ok('21 rename live',await (async()=>{const vid=await pg.evaluate("document.querySelector('.cs-card[data-id]')&&document.querySelector('.cs-card[data-id]').dataset.id");if(!vid)return false;await pg.evaluate(`__tg.set('${vid}','${cid}')`);await R(300);await pg.evaluate(`__tg.rename('${cid}','Focus2')`);await R(400);const t=await pg.evaluate(`(document.querySelector('.cs-card[data-id="${vid}"] .tg-mark')||{}).title`);await pg.evaluate(`__tg.set('${vid}',null)`);await R(200);return t==='Focus2';})());
  await pg.evaluate(`__tg.rename('${cid}','Deep')`);await R(300);
  ok('5 no overflow',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth+1"));
  await pg.evaluate(`__tg.del('${cid}')`);await R(500);
  ok('12 soft delete',await pg.evaluate(`__tg.raw().list.find(x=>x.id==='${cid}').deleted>0`));
  ok('13 value kept',await pg.evaluate(`__tg.raw().map.t2==='${cid}'`));
  await pg.click('#v3ut .ub-b');await R(500);
  ok('12 undo restores',(await T('t2'))===cid&&await pg.evaluate(`__tags.get('t2').name==='Deep'`));
  await pg.evaluate(`__tg.del('${cid}')`);await R(500);
  ok('5 deleted, task falls back to default',(await T('t2'))==='learning'&&(await pg.evaluate("__tg.cfg().list.filter(x=>!x.deleted).length"))===0);
  ok('5 task still exists',await pg.evaluate("!!window.__data.tasks.t2&&window.__data.tasks.t2.title==='R71 Learn'"));
  ok('34 missing',await pg.evaluate("(__tg.set('t1','ghost'),__tg.forTask('t1')==='work')"));
  await pg.evaluate("__tg.set('t1',null)");await R(200);
  await pg.evaluate("__tg.rename('work','Client')");await R(300);
  ok('19 built-in rename',await pg.evaluate("__tags.get('t1').name==='Client'"));
  await pg.click('#v3ut .ub-b');await R(400);
  ok('19 rename undo',await pg.evaluate("__tags.get('t1').name==='Work'"));
  await pg.evaluate("__tg.del('work')");await R(300);
  ok('19 built-in not deletable',await pg.evaluate("__tags.list().length>=3&&__tags.list().some(g=>g.id==='work')"));
  await pg.evaluate("__tg.color('work','#c98f8f')");await R(300);
  ok('19 colour changed',await pg.evaluate("__tags.get('t1').color==='#c98f8f'"));
  await pg.click('#v3ut .ub-b');await R(400);
  ok('19 colour undo',await pg.evaluate("__tags.get('t1').color==='#7f9fc4'"));
  ok('20 refused',await pg.evaluate("(()=>{const n=__tags.list().length;return __tg.add('  ')===false&&__tg.add(' work ')===false&&__tags.list().length===n})()"));
  ok('32 long tag',await pg.evaluate("(__tg.add('L'.repeat(40)),__tg.cfg().list.some(x=>x.name.length===24))"));
  ok('33 RTL add',await pg.evaluate("__tg.add('وسم عربي')"));
  ok('6 shared helper',await pg.evaluate("(()=>{const g=__tags.get('t1');return g&&g.name==='Work'&&/^#/.test(g.color)&&__tags.list().length>=3})()"));
  await pg.evaluate("__tg.add('RA');__tg.add('RB')");await R(400);
  await pg.evaluate("__tg.sheet()");await R(500);
  ok('33 RTL dir',await pg.evaluate("document.querySelector('.tg-row .tg-name').dir==='auto'"));
  {const rbid=await pg.evaluate("__tg.cfg().list.find(x=>x.name==='RB').id");const m=pg.locator('.tg-row[data-tag="'+rbid+'"] .tg-mark');await m.scrollIntoViewIfNeeded();const bb=await m.boundingBox();
   if(bb){await pg.mouse.move(bb.x+4,bb.y+4);await pg.mouse.down();await pg.clock.runFor(600);await pg.mouse.move(bb.x+4,bb.y-70,{steps:8});await pg.clock.runFor(200);await pg.mouse.up();await R(600);}
   ok('8 reorder',await pg.evaluate("(()=>{const n=__tags.list().map(g=>g.name);return n.indexOf('RB')<n.indexOf('RA')})()"),await pg.evaluate("__tags.list().map(g=>g.name).join()"));}
  ok('8 no move up',await pg.locator('text=Move up').count()===0);
  await pg.evaluate("__r2.psClose()");await R(300);
  await pg.evaluate("__r2.setPage('today')");await R(600);
  await pg.evaluate("__tg.set('t1','work')");await R(300);
  {const card2=pg.locator('.cs-card').first();await card2.evaluate(e=>e.scrollIntoView({block:'center'}));await R(300);const bb=await card2.boundingBox();await pg.mouse.move(bb.x+24,bb.y+Math.min(14,bb.height/2));await pg.mouse.down();await pg.clock.runFor(900);await pg.mouse.up();await card2.evaluate(e=>e.dispatchEvent(new PointerEvent('pointerup',{bubbles:true})));await R(400);}
  ok('32 chips height',await pg.evaluate("(()=>{const c=[...document.querySelectorAll('.ps-sheet .tg-chip')];return c.length>0&&c.every(x=>x.getBoundingClientRect().height<=37)})()"),await pg.evaluate("[...document.querySelectorAll('.ps-sheet .tg-chip')].map(x=>x.getBoundingClientRect().height).join()"));
  ok('33 chip dir',await pg.evaluate("[...document.querySelectorAll('.ps-sheet .tg-chip')].every(x=>x.dir==='auto')"));
  {const bf=await pg.evaluate("__tg.forTask('t1')");const ch=pg.locator('.ps-sheet .tg-chip[data-tag="learning"]');if(await ch.count()){await ch.click();await R(400);await pg.click('#v3ut .ub-b');await R(400);}
   ok('22 undo',(await T('t1'))===bf);}
  ok('6 no overflow',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth+1"));
  await pg.screenshot({path:__dirname+'/shots/r71-'+w+'.png'});
  {const er=pg.errs.filter(x=>!/Failed to load resource/.test(x));ok('no page errors',er.length===0,JSON.stringify(er.slice(0,3)));}
  await pg.context().close();}});
