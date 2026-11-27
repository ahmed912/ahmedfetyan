// Round 73: v02 refinements (contrast, date input, gym subtitle, inbound tag)
const {openp,run,shot}=require('./h.js');const {load}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const d=load();d.tasks.r73i={title:'R73 Inbound',cat:'outreach',date:'2026-11-19',done:false,order:-9};
  const pg=await openp(b,w,{when:'2026-11-19T11:00:00',real:JSON.stringify(d)});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  ok('4 inbound tag work',(await pg.evaluate("__tags.get('r73i')")||{}).id==='work');
  await pg.evaluate("__r2.setPage('projects')");await R(800);
  await pg.click('#planMatrix .mx-open');await R(600);
  const cs=await pg.evaluate("(()=>{const e=document.querySelector('.mx-grid .mx-dh.today');return e?getComputedStyle(e).color:null})()");
  ok('1 today header dark ink',cs==='rgb(155, 47, 0)',cs);
  ok('2 date input not clipped',await pg.evaluate("(()=>{const e=document.querySelector('.mx-wk');return e.scrollWidth<=e.clientWidth+1&&e.getBoundingClientRect().width>=140})()"));
  await shot(pg,'r73-mx-'+w,false);
  await pg.evaluate("document.body.insertAdjacentHTML('beforeend','<div id=v3ut class=undo-bar><span class=ub-t>Done</span><button class=ub-b>Undo</button></div>')");await R(400);
  const uc=await pg.evaluate("(()=>{const e=document.querySelector('#v3ut .ub-b');return e?getComputedStyle(e).color:null})()");
  ok('1 undo colour set',uc&&uc!=='rgb(255, 236, 231)',uc);await shot(pg,'r73-toast-'+w,false);
  ok('no errors',pg.errs.filter(e=>!/ERR_FAILED/.test(e)).length===0,pg.errs.join('|'));
  await pg.context().close();
  const g=await openp(b,w,{when:'2026-11-19T11:00:00',real:JSON.stringify(load())});
  const gt=await g.evaluate("(()=>{const h=document.querySelector('.g-header .hint');return h?h.textContent:''})()");
  ok('3 gym 5 days',gt.includes('5 أيام')&&!gt.includes('6 أيام'),gt);
  await g.context().close();}
  // phone layout: m33 on at 390, nothing new outside Gym
  const d=load();d.tasks.r73i={title:'R73 Inbound',cat:'outreach',date:'2026-11-19',done:false,order:-9};
  const p=await openp(b,390,{when:'2026-11-19T11:00:00',real:JSON.stringify(d),m33:true});
  await p.waitForTimeout(300);
  ok('6 m33 on',await p.evaluate("document.body.classList.contains('m33')"));
  ok('6 m33 no inbound tag',(await p.evaluate("__tags.get('r73i')"))===null);
  await p.evaluate("document.body.insertAdjacentHTML('beforeend','<div id=v3ut class=undo-bar><span class=ub-t>Done</span><button class=ub-b>Undo</button></div>')");await p.clock.runFor(300);
  const uc=await p.evaluate("getComputedStyle(document.querySelector('#v3ut .ub-b')).color");
  const ref=await p.evaluate("(()=>{const e=document.createElement('i');e.style.color='var(--md-inverse-primary)';document.body.append(e);return getComputedStyle(e).color})()");
  console.log('m33 undo colour',uc);ok('6 m33 undo untouched',uc!=='rgb(155, 47, 0)'||ref===uc,uc);
  await shot(p,'r73-m33-390',false);await p.context().close();});
