// shared seed helpers for dm tests
const fs=require('fs');
function item(day,id,ref,label,h1,m1,min){const t0=new Date(day+'T'+String(h1).padStart(2,'0')+':'+String(m1).padStart(2,'0')+':00').getTime();
  const x={id,kind:'manual',label:label||'Work',cat:'portfolio',note:'',start:t0,end:t0+min*60000,minutes:min,paused:0,sessions:[{start:t0,end:t0+min*60000,minutes:min,paused:0}]};if(ref)x.ref=ref;return x;}
function addE(d,day,it){d.entries=d.entries||{};const e=d.entries[day]=d.entries[day]||{date:day,items:[]};e.items.push(it);}
function load(){const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.entries=d.entries||{};d.tasks=d.tasks||{};d.logs=d.logs||{};return d;}
function seed2(d){
  d.tasks.d1={title:'Done dm2',date:'2026-11-08',done:true,doneAt:'2026-11-08',cat:'portfolio'};
  addE(d,'2026-11-07',item('2026-11-07','a1','tasks:d1','Done dm2',9,0,30));addE(d,'2026-11-08',item('2026-11-08','a2','tasks:d1','Done dm2',9,0,45));
  d.tasks.u1={title:'Long dm2',date:'2026-11-09',cat:'portfolio',done:false};
  ['06','07','08'].forEach((n,i)=>addE(d,'2026-11-'+n,item('2026-11-'+n,'b'+i,'tasks:u1','Long dm2',10,0,90)));
  d.tasks.u2={title:'Short dm2',date:'2026-11-09',done:false};addE(d,'2026-11-09',item('2026-11-09','c1','tasks:u2','Short dm2',12,0,20));
  ['07','08','09'].forEach(n=>{d.logs['2026-11-'+n]={...(d.logs['2026-11-'+n]||{}),date:'2026-11-'+n,gym:true};});
  addE(d,'2026-11-09',item('2026-11-09','w1',null,'War block',14,0,50));addE(d,'2026-11-08',item('2026-11-08','w2',null,'War block',14,0,40));
  d.tasks.bS={title:'Shipped dm2',bucket:true,shipped:true,shippedAt:'2026-11-08',bStart:'2026-10-01',archived:true,cut:true};
  d.tasks.c1={title:'Child dm2',parent:'bS',done:true,doneAt:'2026-11-05'};addE(d,'2026-11-05',item('2026-11-05','s1','tasks:c1','Child dm2',9,0,120));
  d.tasks.bA={title:'Active dm2',bucket:true,bState:'active',cat:'portfolio',done:false,order:2};
  return d;}
// reload keeping the mock data (sessionStorage is sometimes empty after a file:// reload, so retry)
async function reloadKeep(pg){const j=await pg.evaluate("JSON.stringify(window.__data)");
  for(let i=0;i<4;i++){await pg.evaluate("sessionStorage.setItem('__mockdata',"+JSON.stringify(j)+")");await pg.reload();
    if(await pg.evaluate("!!window.__restore&&Object.keys(window.__restore).length>0"))break;}
  await pg.clock.runFor(3000);}
module.exports={reloadKeep,item,addE,load,seed2};
