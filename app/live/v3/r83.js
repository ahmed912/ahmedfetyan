// Round 83: one page shell, nav, views, data helpers
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
const o0=()=>({when:'2026-11-19T11:00:00',real:JSON.stringify(fx()),rm44:1,oh51:1});
run(async b=>{for(const w of [1300,820]){console.log('== width',w);
  const pg=await openp(b,w,o0());const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  await R(800);const ev=s=>pg.evaluate(s);
  ok('page roadmap',await ev("document.body.dataset.page")==="roadmap");
  ok('shell visible',await pg.locator('#ohShell').isVisible());
  ok('canvas visible',await pg.locator('#rmCanvas').isVisible());
  ok('no view switch, rail or Page',await pg.locator('.oh-vb,#ohRail,#ohPage,#ohVault').count()===0);
  const nav=(await pg.locator('#botNav').innerText())+(await pg.locator('#pageTabs').innerText());
  ok('nav has Board',/Board/.test(nav),nav);
  ok('nav lacks Today/Progress/Projects',!/Today|Progress|Projects/.test(nav),nav);
  for(const p of ['progress','projects','today']){await ev("__r2.setPage('"+p+"')");await R(400);ok('redirect '+p,await ev("document.body.dataset.page")==="roadmap");}
  await pg.reload();await pg.clock.runFor(2500);await R(800);
  ok('reload lands on board',await ev("document.body.dataset.page")==="roadmap"&&await pg.locator('#rmCanvas').isVisible());
  ok('brQuick in bar once',await pg.locator('.oh-bar #brQuick').count()===1);
  ok('color rmB1',await ev("__oh.color(__data.tasks.rmB1)")==="#7f9fc4");
  ok('status rmB3',await ev("__oh.status(__data.tasks.rmB3).text")==="In the vault");
  ok('status rmB1',await ev("__oh.status(__data.tasks.rmB1).text")==="Running, due 19 Nov",await ev("__oh.status(__data.tasks.rmB1).text"));
  ok('status rmB4',await ev("__oh.status(__data.tasks.rmB4).text")==="Finished");
  ok('prog rmB1',JSON.stringify(await ev("__oh.prog('rmB1')"))===JSON.stringify({done:1,n:3,pct:33}),JSON.stringify(await ev("__oh.prog('rmB1')")));
  const d=await ev("__oh.dated().map(b=>b.id)");ok('dated',d[0]==="rmB1"&&d[1]==="rmB2",JSON.stringify(d));
  const v=await ev("__oh.vault().map(b=>b.id)");ok('vault',v.includes("rmB3")&&!v.includes("rmB4"));
  ok('someday',(await ev("__oh.someday().map(t=>t.id)")).includes("ohS1"));
  const dl=p=>ev("__oh.doneList('"+p+"').map(t=>t.id)");
  let m=await dl('month'),y=await dl('year'),a=await dl('all');
  ok('doneList month',m.includes("rmD1")&&!m.includes("rmD2"));ok('doneList year',y.includes("rmD2")&&!y.includes("rmD3"));ok('doneList all',a.includes("rmD3"));
  ok('shippedN',await ev("__oh.shippedN('month')")>=1);
  ok('no profile',await ev("__data.plans.profile")===undefined);
  await pg.screenshot({path:'v3/shots/r83-'+w+'.png'});
  await pg.context().close();}
  {const pg=await openp(b,1300,{...o0(),oh51:0});const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));await R(800);
   await pg.evaluate("__r2.setPage('today')");await R(400);
   ok('old mode today stays',await pg.evaluate("document.body.dataset.page")==="today");
   ok('old mode bar hidden',!(await pg.locator('#ohBar').isVisible()));
   await pg.evaluate("__r2.setPage('roadmap')");await R(600);
   ok('old mode canvas',await pg.locator('#rmCanvas').isVisible(),await pg.evaluate("document.body.dataset.page+' '+document.body.className+' '+(document.getElementById('rmBody')||{}).offsetHeight"));await pg.context().close();}
  {const pg=await openp(b,390,{...o0(),m33:1});await pg.clock.runFor(800);await pg.waitForTimeout(250);
   ok('phone no oh-on',!(await pg.evaluate("document.body.classList.contains('oh-on')")));await pg.context().close();}
});
