// Round 71: colour tags (settings/tags): default by category, set from the hold menu, custom tags in Settings, marks on rows and matrix blocks
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const {openp,run}=require('./h.js');const {load}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const today='2026-11-19';
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const d=load();d.settings=d.settings||{};delete d.settings.tags;d.plans=d.plans||{};delete d.plans['mx-2026-11-14'];delete d.plans['mxc-2026-11-14'];
  d.tasks.t1={title:'R71 Work one',cat:'portfolio',date:today,done:false,order:-9};
  d.tasks.t2={title:'R71 Learn',cat:'learning',date:today,done:false,order:-8};
  d.tasks.t3={title:'R71 Brand',cat:'linkedin',date:today,done:false,order:-7};
  d.tasks.t4={title:'R71 Plain',cat:'outreach',date:today,done:false,order:-6};
  const pg=await openp(b,w,{when:today+'T11:00:00',real:JSON.stringify(d)});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  const T=id=>pg.evaluate(`__tg.forTask('${id}')`);
  const set=()=>pg.evaluate("JSON.stringify((window.__data.settings||{}).tags||null)").then(JSON.parse);
  ok('1 defaults by category',(await T('t1'))==='work'&&(await T('t2'))==='learning'&&(await T('t3'))==='brand'&&(await T('t4'))===null,[await T('t1'),await T('t2'),await T('t3'),await T('t4')].join());
  ok('1 no tags doc yet',(await set())===null);
  // marks on Today card
  const card=pg.locator('.cs-card.cs-top').first();
  ok('2 Today card has a mark',await pg.locator('.cs-card .cs-head .tg-mark').count()>=1);
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
  ok('4 own settings doc',!!doc&&doc.map&&doc.map[id]==='brand');
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
  ok('5 no overflow',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth+1"));
  await pg.evaluate(`__tg.del('${cid}')`);await R(500);
  ok('5 deleted, task falls back to default',(await T('t2'))==='learning'&&(await pg.evaluate("__tg.cfg().list.length"))===0);
  ok('5 task still exists',await pg.evaluate("!!window.__data.tasks.t2&&window.__data.tasks.t2.title==='R71 Learn'"));
  ok('6 shared helper',await pg.evaluate("(()=>{const g=__tags.get('t1');return g&&g.name==='Work'&&/^#/.test(g.color)&&__tags.list().length>=3})()"));
  ok('6 no overflow',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth+1"));
  {const er=pg.errs.filter(x=>!/Failed to load resource/.test(x));ok('no page errors',er.length===0,JSON.stringify(er.slice(0,3)));}
  await pg.context().close();}});
