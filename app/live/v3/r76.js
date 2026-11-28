// Round 76: Roadmap board
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
run(async b=>{for(const w of [1024,1300,390]){console.log('== width',w);
  const pg=await openp(b,w,{h:w===1024?768:900,when:'2026-11-19T11:00:00',real:JSON.stringify(fx()),rm44:1});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  const data=()=>pg.evaluate("JSON.stringify(window.__data)").then(JSON.parse);
  const cnt=s=>pg.locator(s).count();
  await pg.evaluate("__r2.setPage('roadmap')");await R(800);
  ok('canvas visible',await pg.locator('#rmCanvas').isVisible());
  ok('4 parents',await cnt('.rm-parent')===4);
  ok('branch rmB1',await cnt('.rm-branch[data-bid="rmB1"]')===1);
  ok('tree rows',await cnt('.rm-tree[data-bid="rmB1"] li.rm-task')>=2);
  ok('4 addb',await cnt('.rm-addb')===4);
  ok('newp',await pg.locator('.rm-newp').isVisible()&&(await pg.locator('.rm-newp').innerText()).includes('Create new Parent'));
  ok('wires',await cnt('#rmWires path')>=await cnt('.rm-branch')+4,await cnt('#rmWires path')+' '+await cnt('.rm-branch'));
  await pg.click('.rm-parent[data-pid="work"]');await R(400);
  ok('collapsed',await cnt('.rm-branch[data-bid="rmB1"]')===0&&(await pg.locator('.rm-parent[data-pid="work"] .rm-sub').innerText()).includes('branch'));
  await pg.click('.rm-parent[data-pid="work"]');await R(400);
  ok('expanded',await cnt('.rm-branch[data-bid="rmB1"]')===1);
  await pg.click('#rmBody .rm-task[data-id="rmT1"] .rm-check');await R(400);
  ok('checked',(await data()).tasks.rmT1.done===true);
  await pg.click('#v3ut .ub-b');await R(400);
  ok('unchecked',!(await data()).tasks.rmT1.done);
  if(w===1300){
    const view=()=>pg.evaluate("__rm.view()");
    let v0=await view();await pg.mouse.move(600,400);await pg.keyboard.down('Control');await pg.mouse.wheel(0,-200);await pg.keyboard.up('Control');await R(300);
    let v1=await view();ok('zoom',v1.k>v0.k,v0.k+' '+v1.k);
    const bx=await pg.locator('#rmCanvas').boundingBox();const px=bx.x+bx.width-30,py=bx.y+bx.height-30;
    v0=await view();await pg.mouse.move(px,py);await pg.mouse.down();await pg.mouse.move(px+100,py+50,{steps:5});await pg.mouse.up();
    v1=await view();ok('pan',v1.x-v0.x>=95&&v1.x-v0.x<=105,v1.x-v0.x);
    await pg.mouse.dblclick(px,py);await R(300);
    ok('fit',(await pg.evaluate('__rm.view()')).k>=0.8&&await (async()=>{const r=await pg.locator('.rm-parent').first().boundingBox();return r.x>=bx.x&&r.y>=bx.y&&r.x+r.width<=bx.x+bx.width&&r.y+r.height<=bx.y+bx.height;})());
    const bb=await pg.locator('.rm-branch[data-bid="rmB1"]').boundingBox();const cx=bb.x+bb.width/2,cy=bb.y+bb.height/2;
    const tl=async()=>(await pg.locator('.rm-tree[data-bid="rmB1"]').boundingBox()).x;const t0=await tl();
    await pg.mouse.move(cx,cy);await pg.mouse.down();await R(500);await pg.mouse.move(cx+120,cy+40,{steps:6});await pg.mouse.up();await R(600);
    ok('drag pos',!!((await data()).plans['rm-board']||{pos:{}}).pos['b:rmB1']);
    ok('tree followed',(await tl())>t0);
    await pg.click('#v3ut .ub-b');await R(600);
    ok('undo pos',(((await data()).plans['rm-board']||{}).pos||{})['b:rmB1']===undefined);
  }
  if(w===1300){await pg.reload();await pg.clock.runFor(2500);await R(300);ok('reload stays on roadmap',await pg.locator('#rmCanvas').isVisible());}
  await pg.screenshot({path:'v3/shots/r76-'+w+'.png'});
  const er=pg.errs.filter(x=>!/Failed to load resource/.test(x));ok('no errors',er.length===0,er.join('|'));
  await pg.context().close();}});
