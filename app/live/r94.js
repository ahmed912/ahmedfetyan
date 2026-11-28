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
  ohS1:{title:"oh someday",parent:null,date:null,due:null,done:false,order:8}});return d;}

const o0=(x)=>Object.assign({when:'2026-11-19T11:00:00',real:JSON.stringify(fx()),rm44:1,oh51:1},x||{});
run(async b=>{for(const w of [1300,390]){console.log('== width',w);
  const pg=await openp(b,w,o0());const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  await R(800);const ev=s=>pg.evaluate(s);const C=s=>pg.locator(s).count();
  await ev("localStorage.removeItem('x27-view')");await pg.reload();await pg.clock.runFor(2500);await R(800);
  ok('tabs',JSON.stringify(await pg.locator('#ohBar .x27-sw .x27-tab').allInnerTexts())===JSON.stringify(["Board","Week"]));
  ok('board selected',await pg.locator('.x27-tab[data-v="board"]').getAttribute('aria-selected')==="true");
  ok('canvas visible',await pg.locator('#rmCanvas').isVisible());
  ok('no sprint in board',!/Sprint \d/.test(await ev("document.getElementById('rmBody').innerText")));
  await pg.click('.x27-tab[data-v="week"]');await R(600);
  ok('week visible',await pg.locator('#x27Week').isVisible());
  ok('canvas gone',await C('#rmCanvas')===0);
  ok('view saved',await ev("localStorage.getItem('x27-view')")==="week");
  ok('7 cols',await C('.x27-dcol')===7);
  ok('first col',await pg.locator('.x27-dcol').first().getAttribute('data-d')==="2026-11-14");
  ok('last col',await pg.locator('.x27-dcol').last().getAttribute('data-d')==="2026-11-20");
  ok('today col',await pg.locator('.x27-dcol.today').getAttribute('data-d')==="2026-11-19");
  const rg=await pg.locator('.x27-range').innerText();ok('range',/14/.test(rg)&&/20/.test(rg),rg);
  ok('bar B1',await ev("document.querySelector('.x27-bar[data-bid=\"rmB1\"]').style.gridColumn")==="3 / 7");
  ok('bar B2',await ev("document.querySelector('.x27-bar[data-bid=\"rmB2\"]').style.gridColumn")==="1 / 8"&&await C('.x27-bar[data-bid="rmB2"].x27-cl.x27-cr')===1);
  ok('no B3 B4',await C('.x27-bar[data-bid="rmB3"],.x27-bar[data-bid="rmB4"]')===0);
  ok('T1 on 19',await C('.x27-dcol[data-d="2026-11-19"] .rm-task[data-id="rmT1"]')===1);
  ok('T2 on 17',await C('.x27-dcol[data-d="2026-11-17"] .rm-task[data-id="rmT2"]')===1&&await C('.x27-dcol[data-d="2026-11-17"] .rm-task[data-id="rmT2"] .x26-start')===1);
  const sp=await C('.x27-sp')?await pg.locator('.x27-sp').innerText():"";
  ok('sprint text',sp===await ev("__x27.sprintText('2026-11-14')")&&(sp===""||/^Sprint /.test(sp)),sp);
  await pg.click('.x27-next');await R(400);
  ok('next week',await pg.locator('.x27-dcol').first().getAttribute('data-d')==="2026-11-21"&&await pg.locator('.x27-now').isVisible());
  await pg.click('.x27-now');await R(400);
  ok('back to this week',await pg.locator('.x27-dcol').first().getAttribute('data-d')==="2026-11-14"&&!(await pg.locator('.x27-now').isVisible()));
  await pg.click('.x27-dcol[data-d="2026-11-17"] .rm-task[data-id="rmT2"] .rm-check');await R(400);
  ok('tick',await ev("__data.tasks.rmT2.done")===true);
  await pg.reload();await pg.clock.runFor(2500);await R(800);
  ok('view remembered',await pg.locator('#x27Week').isVisible());
  if(w===390)ok('mobile stack',await ev("getComputedStyle(document.querySelector('.x27-days')).display")==="block");
  await pg.click('.x27-tab[data-v="board"]');await R(600);
  ok('board back',await pg.locator('#rmCanvas').isVisible()&&await C('#x27Week')===0);
  ok('no page errors',(pg.errs||[]).every(e=>/ERR_FAILED/.test(String(e))),JSON.stringify(pg.errs));
  await pg.context().close();}
  {const pg=await openp(b,1300,o0({oh51:0}));const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));await R(800);
   await pg.evaluate("__r2.setPage('roadmap')");await R(600);
   ok('old mode no switch',await pg.locator('.x27-sw').count()===0&&await pg.locator('#rmCanvas').isVisible());
   await pg.context().close();}
});
