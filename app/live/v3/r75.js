// Round 75: roadmap data layer
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
run(async b=>{for(const w of [1300]){console.log('== width',w);
  const fix=fx(),keys=Object.keys(fix.tasks.rmB3).sort().join();
  const pg=await openp(b,w,{when:'2026-11-19T11:00:00',real:JSON.stringify(fix),rm44:1});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  const data=()=>pg.evaluate("JSON.stringify(window.__data)").then(JSON.parse);
  const ev=s=>pg.evaluate(s);
  await R(800);
  ok('built-in parents',await ev("__rm.parents().map(p=>p.name).join()")==="Work,Personal brand,Learning,Others");
  ok('parentOf defaults',await ev("[__rm.parentOf('rmB1'),__rm.parentOf('rmB2'),__rm.parentOf('rmB3')].join()")==="work,brand,others");
  const t=await ev("(()=>{const x=__rm.today('2026-11-19');const f=a=>a.map(t=>t.id);return JSON.stringify({d:f(x.due),e:f(x.early)})})()").then(JSON.parse);
  ok('today due',t.d.includes('rmT1')&&!t.d.includes('rmT3'));
  ok('today early',t.e.includes('rmT2')&&!t.e.includes('rmT3'));
  let d=await data();ok('no write on load',d.plans['rm-board']===undefined);
  await ev("__rm.setParent('rmB3','learning')");await R(500);
  d=await data();
  ok('moved',await ev("__rm.parentOf('rmB3')")==="learning"&&d.plans['rm-board'].map.rmB3==='learning');
  ok('undo toast',await pg.locator('#v3ut').isVisible());
  ok('bucket untouched',Object.keys(d.tasks.rmB3).sort().join()===keys);
  await pg.click('#v3ut .ub-b');await R(500);
  ok('undo',await ev("__rm.parentOf('rmB3')")==="others");
  const id=await ev("__rm.addParent('Health')");await R(500);
  ok('added',await ev("__rm.parents().length")===5);
  await ev("__rm.delParent('"+id+"')");await R(500);
  d=await data();
  ok('deleted soft',await ev("__rm.parents().length")===4&&d.plans['rm-board'].parents.some(p=>p.id===id&&p.deleted));
  ok('others stays',(await ev("__rm.delParent('others')"))===false&&await ev("__rm.parents().length")===4);
  await pg.close();}});
