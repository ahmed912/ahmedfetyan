// shared helpers for r40 to r42 (waterfall v2). Seeds two buckets with parents and subtasks and opens the waterfall.
const fs=require('fs');
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};d.entries={};d.sleep={};d.rollover={};
  d.sprints={s2:{n:2,name:'Brand foundation',start:'2026-11-14',end:'2026-12-27',goal:'x'}};return d;};
const seed=pg=>pg.evaluate(async()=>{const db=await window.claude.use('db');
  await db.doc('tasks/bkA').set({title:'HASM',cat:'portfolio',kind:'portfolio',bucket:true,bState:'active',order:1,done:false,bStart:'2026-11-15',bEnd:'2026-11-19',bColor:'#2563EB'});
  await db.doc('tasks/bkB').set({title:'Javelin',cat:'portfolio',kind:'portfolio',bucket:true,bState:'active',order:2,done:false,bStart:'2026-11-22',bEnd:'2026-11-26',bColor:'#7C3AED'});
  const mk=(id,par,o)=>db.doc('tasks/'+id).set({cat:'portfolio',parent:par,order:1,done:false,sprint:2,mode:'deep',slot:1,mins:60,...o});
  await mk('a1','bkA',{title:'Alpha one',date:'2026-11-15',order:1});
  await mk('a2','bkA',{title:'Alpha parent',date:'2026-11-17',days:2,order:2});
  await mk('a3','bkA',{title:'Alpha three',date:'2026-11-19',order:3});
  await mk('c1','a2',{title:'Real child',date:'2026-11-18',order:1});
  await mk('k1','a2',{title:'Sub one',date:'2026-11-17',sub:true,order:1});
  await mk('k2','a2',{title:'Sub two',date:'2026-11-17',sub:true,order:2});
  await mk('b1','bkB',{title:'Bravo one',date:'2026-11-22',order:1});
  await mk('b2','bkB',{title:'Bravo two',date:'2026-11-25',order:2});});
async function open(b,w){const pg=await openp(b,w,{when:'2026-11-14T08:00:00',real:JSON.stringify(base())});
  const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(250);};
  await seed(pg);await R(700);
  if(await pg.locator('.m-tab:has-text("Review")').count())await pg.click('.m-tab:has-text("Review")');else await pg.evaluate(()=>__r2.setPage('progress'));await R(700);
  await pg.evaluate("{const s=document.querySelector('section[aria-labelledby=\"wfH\"]');if(s&&s.classList.contains('collapsed')){const b=s.querySelector('.collapse-btn');if(b)b.click();}}");await R(500);
  await pg.locator('#wfBody').scrollIntoViewIfNeeded();await R(300);return {pg,R};}
const T=pg=>pg.evaluate(()=>JSON.parse(JSON.stringify(window.__data.tasks)));
// bring a grid item just right of the sticky label, vertically centred
const vis=async(pg,loc,R)=>{await loc.evaluate(e=>{e.scrollIntoView({block:'center'});const sc=e.closest('.wf-scroll');const lb=sc.querySelector('.wf-lbl').getBoundingClientRect();const r=e.getBoundingClientRect();sc.scrollLeft+=r.left-lb.right-12;});await R(400);};
const visR=async(pg,loc,R)=>{await loc.evaluate(e=>{e.scrollIntoView({block:'center'});const sc=e.closest('.wf-scroll');const r=e.getBoundingClientRect(),c=sc.getBoundingClientRect();sc.scrollLeft+=r.right-(c.right-28);});await R(400);};
const labels=pg=>pg.evaluate(()=>[...document.querySelectorAll('#wfBody .wf-bk[data-bk]')].map(e=>e.dataset.bk));
const rowIds=pg=>pg.evaluate(()=>[...document.querySelectorAll('#wfBody .v3-wfrow[data-id]')].map(e=>e.dataset.id));
const undo=async(pg,R)=>{await pg.locator('#v3ut .ub-b').click();await R(400);};
// drag a box centre to a y position with steps
const dragTo=async(pg,from,to,steps=8)=>{await pg.mouse.move(from.x,from.y);await pg.mouse.down();await pg.mouse.move(from.x+(to.x-from.x)/3,from.y+(to.y-from.y)/3,{steps:3});await pg.mouse.move(to.x,to.y,{steps});await pg.mouse.up();};
const ctr=bb=>({x:bb.x+bb.width/2,y:bb.y+bb.height/2});
module.exports={visR,ok,run,open,T,vis,labels,rowIds,undo,dragTo,ctr,shot};
