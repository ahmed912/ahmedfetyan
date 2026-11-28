// Round 84: review strip, Done log
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
run(async b=>{for(const w of [1300,820]){
 const pg=await openp(b,w,{when:'2026-11-19T11:00:00',real:JSON.stringify(fx()),rm44:1,oh51:1});
 const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));const data=()=>pg.evaluate("JSON.stringify(window.__data)").then(JSON.parse);
 await R(800);const T=w+': ';
 ok(T+'rail visible',await pg.locator('#ohRail').isVisible());
 ok(T+'month pressed',await pg.getAttribute('.oh-per [data-p="month"]','aria-pressed')==='true');
 const nm=await pg.evaluate("__oh.doneList('month').length");
 ok(T+'month count',await pg.textContent('#ohDoneN .oh-num')===String(nm),nm);
 await pg.click('.oh-per [data-p="year"]');await R(300);
 ok(T+'year count',await pg.textContent('#ohDoneN .oh-num')===String(await pg.evaluate("__oh.doneList('year').length")));
 ok(T+'sub year',(await pg.textContent('#ohDoneN .oh-sub'))==='this year');
 ok(T+'shipped',await pg.textContent('#ohShipN .oh-num')===String(await pg.evaluate("__oh.shippedN('year')")));
  await pg.click('#ohDoneN');await R(400);
 ok(T+'log open',await pg.locator('.ps-sheet[aria-label="Done log"]').isVisible());
 ok(T+'rows',(await pg.locator('.oh-lrow[data-id="rmD1"]').count())===1&&(await pg.locator('.oh-lrow[data-id="rmD2"]').count())===1);
 const ids=await pg.evaluate("[...document.querySelectorAll('.oh-lrow')].map(e=>e.dataset.id)");
 ok(T+'order',ids.indexOf('rmD1')<ids.indexOf('rmD2')&&ids.indexOf('rmD1')>=0,JSON.stringify(ids));
 ok(T+'chip',(await pg.textContent('.oh-lrow[data-id="rmD1"] .oh-chip')).includes('18'));
 ok(T+'branch name',(await pg.textContent('.oh-lrow[data-id="rmD1"] .oh-lb')).includes('RM Work proj'));
 await pg.screenshot({path:__dirname+'/shots/r84-'+w+'.png'});
 await pg.click('.oh-lrow[data-id="rmD1"] .oh-restore');await R(400);
 let d=await data();ok(T+'restored',d.tasks.rmD1.done===false&&JSON.stringify(d.tasks.rmD1.doneHist)==='["2026-11-18"]',JSON.stringify(d.tasks.rmD1));
 await pg.click('#v3ut .ub-b');await R(400);d=await data();ok(T+'undo',d.tasks.rmD1.done===true&&d.tasks.rmD1.doneAt==='2026-11-18');
 await pg.keyboard.press('Escape');await R(400);
 await pg.context().close();}});
