// Round 78: roadmap board editing
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
run(async b=>{for(const w of [1300,820]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-19T11:00:00',real:JSON.stringify(fx()),rm44:1,h:1400});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  const data=()=>pg.evaluate("JSON.stringify(window.__data)").then(JSON.parse);
  const ev=s=>pg.evaluate(s);
  const byTitle=(d,t)=>Object.entries(d.tasks).find(([k,v])=>v.title===t);
  await ev("__r2.setPage('roadmap')");await R(800);
  await pg.click('.rm-tree[data-bid="rmB1"] .rm-addt');await R(300);
  await pg.fill('.rm-in','rm added');await pg.keyboard.press('Enter');await R(800);
  let d=await data();const t=byTitle(d,'rm added');
  ok('task added',!!t&&t[1].parent==='rmB1');
  ok('input ready again',await pg.locator('.rm-in').count()===1);
  await pg.fill('.rm-in','keep me');await ev("__rm.render()");await R(300);
  ok('typed text kept',await pg.locator('.rm-in').inputValue()==='keep me');
  await pg.keyboard.press('Escape');await R(400);
  await pg.click('.rm-addb[data-pid="brand"]');await R(300);
  await pg.fill('.rm-in','rm new branch');await pg.keyboard.press('Enter');await R(1000);
  d=await data();const nb=byTitle(d,'rm new branch');
  ok('branch added',!!nb&&nb[1].bucket&&nb[1].cat==='brand');
  ok('branch parent brand',!!nb&&await ev("__rm.parentOf('"+nb[0]+"')")==='brand');
  ok('branch node shown',!!nb&&await pg.locator('.rm-branch[data-bid="'+nb[0]+'"]').count()===1);
  await pg.keyboard.press('Escape');await R(400);
  await pg.click('.rm-newp');await R(300);
  await pg.fill('.rm-in','Health');await pg.keyboard.press('Enter');await R(800);
  ok('5 parents',await pg.locator('.rm-parent').count()===5);
  await pg.keyboard.press('Escape');await R(400);
  const hb=await pg.locator('.rm-parent',{hasText:'Health'}).boundingBox();
  await pg.mouse.move(hb.x+hb.width/2,hb.y+hb.height/2);await pg.mouse.down();await R(600);await pg.mouse.up();await R(500);
  ok('sheet visible',await pg.locator('.ps-sheet').isVisible());
  ok('del visible',await pg.locator('.rm-del').isVisible());
  await pg.click('.rm-del');await R(400);
  ok('4 parents',await pg.locator('.rm-parent').count()===4);
  d=await data();const hp=d.plans['rm-board'].parents.find(p=>p.name==='Health');
  ok('Health soft deleted',!!hp&&!!hp.deleted);
  const b3=await pg.locator('.rm-branch[data-bid="rmB3"]').boundingBox();
  await pg.mouse.move(b3.x+b3.width/2,b3.y+b3.height/2);await pg.mouse.down();await R(600);await pg.mouse.up();await R(500);
  await pg.click('.rm-chip[data-pid="learning"]');await R(500);
  ok('rmB3 learning',await ev("__rm.parentOf('rmB3')")==='learning');
  await ev("__rm.move('rmS1','rmB1')");await R(600);
  if(await pg.locator('.rm-tree[data-bid="rmB1"] .rm-task[data-id="rmS1"]').count()===0){const m=pg.locator('.rm-tree[data-bid="rmB1"] .rm-more:not(.rm-donec)');if(await m.count())await m.first().click();await R(400);}
  ok('sprint attached',await pg.locator('.rm-tree[data-bid="rmB1"] .rm-task[data-id="rmS1"]').count()===1);
  const r2=await pg.locator('.rm-task[data-id="rmT2"] .rm-tt').boundingBox();
  const r1=await pg.locator('.rm-task[data-id="rmT1"] .rm-tt').boundingBox();
  await pg.mouse.move(r2.x+10,r2.y+r2.height/2);await pg.mouse.down();await R(500);
  await pg.mouse.move(r2.x+10,r1.y-4,{steps:8});await R(200);await pg.mouse.up();await R(600);
  d=await data();
  ok('reorder',d.tasks.rmT2.pos!=null&&d.tasks.rmT2.pos<d.tasks.rmT1.pos,JSON.stringify([d.tasks.rmT2.pos,d.tasks.rmT1.pos]));
  ok('page stays roadmap',await ev("document.body.dataset.page")==='roadmap');
  if(w>=1300)ok('no today header',!(await pg.locator('#workView .top').first().isVisible()));
  ok('rtl auto',await pg.locator('.rm-tt').first().getAttribute('dir')==='auto');
  await pg.screenshot({path:'v3/shots/r78-'+w+'.png'});
}});
