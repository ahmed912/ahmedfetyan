const {openp,run}=require('./h.js');const {load}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
function fx(){const d=load();d.plans=d.plans||{};delete d.plans['rm-board'];
 Object.assign(d.tasks,{
  rmB1:{title:"RM Work proj",bucket:true,cat:"portfolio",bState:"active",done:false,order:1},
  rmB2:{title:"RM Brand proj",bucket:true,cat:"brand",bState:"active",done:false,order:2},
  rmB3:{title:"RM Misc",bucket:true,bState:"active",done:false,order:3},
  rmT1:{title:"rm t1",parent:"rmB1",due:"2026-11-19",date:null,done:false,order:1},
  rmT2:{title:"rm t2",parent:"rmB1",due:"2026-11-17",date:null,done:false,order:2},
  rmT3:{title:"rm t3",parent:"rmB2",date:null,done:false,order:3},
  rmS1:{title:"rm sprint",sprint:1,date:"2026-11-19",done:false,order:4}});return d;}
run(async(b)=>{
 for(const w of [1300,390]){
  const pg=await openp(b,w,{when:'2026-11-19T11:00:00',real:JSON.stringify(fx()),rm44:1});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  const data=()=>pg.evaluate("JSON.stringify(window.__data)").then(JSON.parse);
  const vis=s=>pg.locator(s).first().isVisible().catch(()=>false);
  const cnt=s=>pg.locator(s).count();
  const T=n=>w+' '+n;
  await pg.evaluate("__r2.setPage('today')");await R(800);
  ok(T('rmToday visible'),await vis('#rmToday'));
  ok(T('parent text'),(await pg.locator('#rmToday .rm-parent').first().innerText()).trim()==='Today');
  ok(T('branch text'),(await pg.locator('#rmToday .rm-branch').first().innerText()).includes('Today'));
  ok(T('rmT1 row'),await cnt('#rmTodayTree li.rm-task[data-id="rmT1"]')===1);
  ok(T('rmT3 absent'),await cnt('#rmTodayTree li.rm-task[data-id="rmT3"]')===0);
  ok(T('tag branch'),(await pg.locator('.rm-task[data-id="rmT1"] .rm-tag').first().innerText()).includes('RM Work proj'));
  ok(T('early'),(await pg.locator('.rm-early').first().innerText()).includes('1 from earlier days'));
  await pg.locator('.rm-early').first().click();await R(400);
  ok(T('rmT2 visible'),await vis('.rm-task[data-id="rmT2"]'));
  ok(T('taskList hidden'),!(await vis('#taskList')));
  ok(T('logH hidden'),!(await vis('section[aria-labelledby="logH"]')));
  ok(T('no hb-card'),await cnt('.hb-card:visible')===0);
  ok(T('capture'),await vis('#popCards .rm-keep'));
  if(await cnt('#warCard'))ok(T('warCard'),await vis('#warCard'));
  await pg.screenshot({path:__dirname+'/shots/r77-'+w+'.png'});
  await pg.locator('#rmToday .rm-addt').click();
  await pg.locator('#rmToday .rm-in').fill('rm new today');await pg.keyboard.press('Enter');await R(800);
  const d=await data();const nt=Object.entries(d.tasks).find(([k,t])=>t.title==='rm new today');
  ok(T('new task'),!!nt&&nt[1].due==='2026-11-19'&&nt[1].date==='2026-11-19');
  ok(T('new row'),!!nt&&await cnt('.rm-task[data-id="'+nt[0]+'"]')===1);
  await pg.keyboard.press('Escape');await R(300);
  await pg.locator('.rm-task[data-id="rmT1"] .rm-check').click();await R(400);
  ok(T('check'),(await data()).tasks.rmT1.done===true);
  await pg.evaluate("__r2.setPage('settings')");await R(400);
  await pg.locator('#rmTodayBtn').click();await R(400);
  ok(T('class off'),!(await pg.evaluate("document.body.classList.contains('rm-today')")));
  await pg.evaluate("__r2.setPage('today')");await R(600);
  ok(T('old today'),await vis('#taskList')&&!(await vis('#rmToday')));
  await pg.close();
 }
 const pg=await openp(b,390,{when:'2026-11-19T11:00:00',real:JSON.stringify(fx()),rm44:1,m33:1});
 await pg.clock.runFor(800);
 ok('m33 no rmToday',await pg.locator('#rmToday').count()===0);
});
