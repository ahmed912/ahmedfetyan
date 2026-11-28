const {openp,run}=require('./h.js');const {load}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
function fx(){const d=load();d.plans=d.plans||{};delete d.plans['rm-board'];delete d.plans['profile'];
 Object.assign(d.tasks,{
  rmB1:{title:"RM Work proj",bucket:true,cat:"portfolio",bState:"active",bStart:"2026-11-16",bEnd:"2026-11-19",bColor:"#2563EB",done:false,order:1},
  rmB2:{title:"RM Brand proj with a long name that wraps",bucket:true,cat:"brand",bState:"active",bStart:"2026-11-10",bEnd:"2026-11-24",bColor:"#a994c9",done:false,order:2},
  rmB3:{title:"RM Misc",bucket:true,bState:"active",done:false,order:3},
  rmB4:{title:"RM Shipped",bucket:true,bState:"done",bDoneAt:"2026-11-12",bStart:"2026-11-01",bEnd:"2026-11-12",done:false,order:4},
  rmT1:{title:"rm t1",parent:"rmB1",due:"2026-11-19",date:null,done:false,order:1},
  rmT2:{title:"rm t2",parent:"rmB1",due:"2026-11-17",date:null,done:false,order:2},
  rmT3:{title:"rm t3",parent:"rmB2",date:null,done:false,order:3},
  rmD1:{title:"rm d1",parent:"rmB1",done:true,doneAt:"2026-11-18",order:5},
  rmD2:{title:"rm d2",parent:"rmB2",done:true,doneAt:"2026-10-31",order:6},
  rmD3:{title:"rm d3",parent:"rmB2",done:true,doneAt:"2025-12-01",order:7},
  x26T1:{title:"x26 parent",parent:"rmB1",due:"2026-11-19",date:null,done:false,order:0},
  x26S1:{title:"x26 sub a",parent:"x26T1",sub:true,due:"2026-11-19",done:false,order:0},
  x26S2:{title:"x26 sub b",parent:"x26T1",sub:true,done:true,doneAt:"2026-11-18",order:1},
  x26D1:{title:"x26 done",parent:"rmB1",due:"2026-11-19",done:true,doneAt:"2026-11-19",order:9},
  ohS1:{title:"oh someday",parent:null,date:null,due:null,done:false,order:8}});return d;}

const o0=(x)=>Object.assign({when:'2026-11-19T11:00:00',real:JSON.stringify(fx()),rm44:1,oh51:1},x||{});
const TX=(pg,sel)=>pg.locator(sel).allInnerTexts();
run(async b=>{for(const w of [1300,390]){console.log('== width',w);
  const pg=await openp(b,w,o0());const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  await R(800);const ev=s=>pg.evaluate(s);const C=s=>pg.locator(s).count();
  const L='.rm-ttree .rm-task[data-id="x26T1"]';
  ok('page roadmap',await ev("document.body.dataset.page")==="roadmap");
  ok('parent row once',await C(L)===1);
  ok('sub not own row',await C('.rm-ttree .rm-task[data-id="x26S1"]')===0);
  ok('2 subs inline',await C(L+' .x26-srow')===2);
  ok('first sub text',(await TX(pg,L+' .x26-stt'))[0]==="x26 sub a");
  ok('second sub done',/done/.test(await pg.locator(L+' .x26-srow').nth(1).getAttribute('class')));
  ok('subs under branch',await C('.rm-tree[data-bid="rmB1"] .rm-task[data-id="x26T1"] .x26-srow')===2);
  ok('Start text',(await pg.locator(L+' .x26-start').first().innerText())==="Start");
  ok('x label',await pg.locator(L+' > .x26-acts .x26-x').getAttribute('aria-label')==="Delete: x26 parent");
  ok('done row no acts',await C('.rm-task[data-id="x26D1"] .x26-acts')===0);
  ok('no sprint text',!/Sprint \d|days left|Sprint review day/.test(await ev("document.getElementById('rmBody').innerText")));
  ok('chips hidden',await ev("[...document.querySelectorAll('#headChips .x26-sp')].every(n=>n.offsetParent===null)"));
  await pg.click(L+' .x26-srow[data-id="x26S1"] .x26-scheck');await R(400);
  ok('sub tick',await ev("__data.tasks.x26S1.done")===true);
  await pg.click(L+' .x26-srow[data-id="x26S2"] .x26-x');await R(400);
  ok('sub delete soft',await ev("__data.tasks.x26S2.cut===true&&!!__data.tasks.x26S2.deleted"));
  ok('sub gone',await C(L+' .x26-srow')===1);
  await pg.click('#v3ut .ub-b');await R(400);
  ok('sub undo',await ev("__data.tasks.x26S2.cut")===false);
  await ev("__u.v3taskMenu('x26T1')");await R(400);
  const rows=await TX(pg,'.ps-sheet .tm-list > .tm-row');
  ok('slim menu rows',JSON.stringify(rows)===JSON.stringify(["Rename","Date","Add subtask"]),JSON.stringify(rows));
  ok('no more',await C('.ps-sheet .tm-more')===0);
  ok('menu text clean',!/Archive|Delete|Move|Sprint/i.test(await ev("document.querySelector('.ps-sheet .ps-sh-sum').innerText+document.querySelector('.ps-sheet .tm-list').innerText")));
  await pg.click('.x26-date');await R(400);
  ok('date choices',JSON.stringify(await TX(pg,'.ps-sheet .x26-d'))===JSON.stringify(["Today","Tomorrow"]));
  ok('date no sprint',!/Sprint/.test(await ev("document.querySelector('.ps-sheet').innerText")));
  await pg.click('.x26-d[data-d="2026-11-20"]');await R(400);
  ok('due set',await ev("__data.tasks.x26T1.due")==="2026-11-20"&&await ev("__data.tasks.x26T1.date")===null&&await ev("__data.tasks.x26T1.sprint")===undefined);
  ok('row left today',await C(L)===0);
  await pg.click('#v3ut .ub-b');await R(400);
  ok('due restored',await ev("__data.tasks.x26T1.due")==="2026-11-19"&&await C(L)===1);
  await ev("__u.v3taskMenu('x26T1')");await R(400);await pg.click('.x26-addsub');await R(400);
  ok('add input focused',await C('.x26-sin[data-for="x26T1"]')>=1&&await ev("document.activeElement.classList.contains('x26-sin')"));
  await pg.keyboard.type('x26 sub c');await pg.keyboard.press('Enter');await R(800);
  ok('sub c created',await ev("Object.values(__data.tasks).some(t=>t.title==='x26 sub c'&&t.parent==='x26T1'&&t.sub===true)"));
  ok('sub c listed',(await TX(pg,L+' .x26-stt')).includes('x26 sub c'));
  ok('input still active',await ev("document.activeElement.classList.contains('x26-sin')"));
  await pg.keyboard.press('Escape');await R(400);
  ok('input closed',await C('.x26-sin')===0);
  await pg.locator(L+' .rm-tt').scrollIntoViewIfNeeded();await R(100);const bx=await pg.locator(L+' .rm-tt').boundingBox();const cx=bx.x+bx.width/2,cy=bx.y+bx.height/2;
  await pg.mouse.move(cx,cy);await pg.mouse.down();await R(600);await pg.mouse.up();await R(300);
  ok('hold opens menu',await C('.ps-sheet .x26-rn')===1);
  await ev("document.querySelector('.ps-sheet .x26-rn').click()");await R(600);
  ok('inline rename',await C('.rn-in')===1);
  await pg.keyboard.press('Escape');await R(400);
  await pg.click(L+' .x26-start');await R(600);
  ok('start opens setup',await C('.ps-sheet')>=1||await pg.locator('#warCard').isVisible());
  ok('no page errors',(pg.errs||[]).every(e=>/ERR_FAILED/.test(String(e))),JSON.stringify(pg.errs));
  await pg.context().close();}
  {const pg=await openp(b,1300,o0({oh51:0}));const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));await R(800);
   const ev=s=>pg.evaluate(s);await ev("__r2.setPage('today')");await R(600);
   ok('today subs',await pg.locator('#rmToday .rm-task[data-id="x26T1"] .x26-srow').count()===2);
   ok('today no sprint',!/Sprint \d/.test(await ev("document.getElementById('rmToday').innerText")));
   ok('today chips hidden',await ev("[...document.querySelectorAll('#headChips .x26-sp')].every(n=>n.offsetParent===null)"));
   await ev("__u.v3taskMenu('x26T1')");await R(400);
   ok('today slim menu',JSON.stringify(await TX(pg,'.ps-sheet .tm-list > .tm-row'))===JSON.stringify(["Rename","Date","Add subtask"]));
   await pg.context().close();}
  {const pg=await openp(b,1300);const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));await R(800);
   const id=await pg.evaluate("Object.entries(__data.tasks).find(([i,t])=>t&&t.title&&!t.bucket&&!t.sub&&!t.done&&!t.cut)[0]");
   await pg.evaluate("__u.v3taskMenu('"+id+"')");await R(400);
   ok('plan full menu',await pg.locator('.ps-sheet .tm-more').count()===1);
   await pg.context().close();}
});
