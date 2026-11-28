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
 const T=async()=>(await pg.locator('#v3ut').innerText().catch(()=>'')).toLowerCase();
 await pg.evaluate("window.__oh.setView('page')");await R(800);
 const p=w+' ';
 await pg.click('.oh-proj[data-bid="rmB1"] .oh-open');await R(400);
 ok(p+'sheet visible',await pg.locator('.ps-sheet[aria-label="Branch"]').isVisible());
 ok(p+'stat',(await pg.locator('.oh-sstat').innerText()).trim()==='Running, due Nov 19, 1/3 tasks done',await pg.locator('.oh-sstat').innerText());
 await pg.fill('.oh-to','2026-11-21');
 let d=await data();ok(p+'draft not written',d.tasks.rmB1.bEnd==='2026-11-19');
 await pg.click('.oh-ok');await R(400);d=await data();
 ok(p+'confirm',d.tasks.rmB1.bEnd==='2026-11-21');
 const ce=await pg.locator('.oh-bar[data-bid="rmB1"]').evaluate(e=>getComputedStyle(e).gridColumnEnd).catch(()=>'x');
 ok(p+'bar end 8',ce==='8',ce);
 await pg.click('#v3ut .ub-b');await R(400);d=await data();
 ok(p+'undo',d.tasks.rmB1.bEnd==='2026-11-19');
 await pg.click('.oh-proj[data-bid="rmB1"] .oh-open');await R(400);
 await pg.fill('.oh-from','2026-11-25');await pg.click('.oh-ok');await R(200);
 ok(p+'to before from',(await pg.locator('.toast, #toast, [role=status]').allInnerTexts()).join('|').includes('To is before From')&&await pg.locator('.ps-sheet[aria-label="Branch"]').isVisible());
 await pg.keyboard.press('Escape');await R(400);
 await pg.evaluate("__oh.sheet('rmB3')");await R(400);
 ok(p+'vault stat',(await pg.locator('.oh-sstat').innerText()).startsWith('In the vault'));
 await pg.fill('.oh-from','2026-11-18');await pg.fill('.oh-to','2026-11-20');await pg.click('.oh-ok');await R(400);
 ok(p+'vault moved',await pg.locator('#ohVault .oh-vrow[data-bid="rmB3"]').count()===0&&await pg.locator('.oh-proj[data-bid="rmB3"]').count()===1);
 const n0=parseInt(await pg.locator('#ohShipN .oh-num').innerText());
 await pg.evaluate("__oh.sheet('rmB2')");await R(400);await pg.click('.oh-fin');await R(400);d=await data();
 ok(p+'finish',d.tasks.rmB2.bState==='done'&&d.tasks.rmB2.bDoneAt==='2026-11-19'&&d.plans.profile.shipped[0].bid==='rmB2');
 ok(p+'ship n',parseInt(await pg.locator('#ohShipN .oh-num').innerText())===n0+1);
 ok(p+'gone from page',await pg.locator('.oh-proj[data-bid="rmB2"]').count()===0);
 await pg.click('#v3ut .ub-b');await R(400);d=await data();
 ok(p+'finish undo',d.tasks.rmB2.bState==='active'&&!(d.plans.profile.shipped||[]).some(x=>x.bid==='rmB2'));
 await pg.evaluate("__oh.sheet('rmB1')");await R(400);await pg.screenshot({path:__dirname+'/shots/r87-'+w+'.png'});
 await pg.keyboard.press('Escape');await R(400);
 await pg.click('.oh-vb[data-v="board"]');await R(600);
 const bb=await pg.locator('.rm-branch[data-bid="rmB1"]').boundingBox();
 await pg.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await pg.mouse.down();await R(600);await pg.mouse.up();await R(400);
 ok(p+'hold opens sheet',await pg.locator('.ps-sheet[aria-label="Branch"]').isVisible());
 await pg.keyboard.press('Escape');await R(400);
 const k0=Object.keys((await data()).tasks).length;
 await pg.evaluate("__oh.sheet('rmB3')");await R(400);await pg.click('.oh-arch');await R(400);d=await data();
 ok(p+'archive',d.tasks.rmB3.archived===true&&Object.keys(d.tasks).length===k0);
 ok(p+'no errors',pg.errs.length===0,pg.errs.join('|'));
 await pg.context().close();}});
