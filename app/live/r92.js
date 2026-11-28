// Round 92: change level: roadmap layout, no overlaps, Today lane first, fit
process.env.MOCKDATA=process.env.MOCKDATA||__dirname+'/../cut/real.json';
const {openp,run}=require('./h.js');const {load}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
function fx(){const d=load();d.plans=d.plans||{};delete d.plans['rm-board'];let o=1;
 const B=(id,title,extra)=>{d.tasks[id]=Object.assign({title,bucket:true,bState:"active",done:false,order:o++},extra||{});};
 B('b1','HASM website',{cat:'client',bStart:'2026-11-01',bEnd:'2026-12-20'});B('b2','Javelin pitch',{cat:'client',bState:'paused'});B('b3','Real estate leads');
 B('b4','Mugassam studio');B('b5','Reviews with a very long branch name that must stay on one line');B('b6','Client onboarding',{bState:'done'});
 B('b7','Personal brand');B('b8','LinkedIn posts');B('b9','English course');B('b10','Misc errands');
 let n=0;for(const b of ['b1','b1','b1','b1','b1','b2','b2','b3','b4','b4','b5','b6','b7','b7','b8','b9','b10','b10','b10'])
  d.tasks['t'+(n++)]={title:'Task '+n+' with a fairly long title to wrap around the row '+n,parent:b,done:n%7===0,order:n,due:n%5===0?'2026-11-28':null};
 d.tasks.tt1={title:'Due today A',cat:'setup',due:'2026-11-28',date:'2026-11-28',done:false,order:900};
 d.tasks.tt2={title:'Late B',cat:'setup',due:'2026-11-20',date:'2026-11-20',done:false,order:901};
 return d;}
const BOX='.rm-parent,.rm-tparent,.rm-hparent,.rm-branch,.rm-tbranch,.rm-hb,.rm-tree li,.rm-addb,.rm-hadd,.rm-newp,.rm-hgrid,.rm-hnav';
run(async b=>{
  const pg=await openp(b,1300,{h:1200,when:'2026-11-28T11:00:00',real:JSON.stringify(fx()),rm44:1});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  await pg.evaluate("__r2.setPage('roadmap')");await R(1000);
  const st=()=>pg.evaluate("(()=>{const t=__lv.S().tasks;return {t0:{b:!!t.t0.bucket,p:t.t0.parent||null},b2:{b:!!t.b2.bucket,p:t.b2.parent||null,a:!!t.b2.archived},t5:{p:t.t5.parent||null,b:!!t.t5.bucket}}})()");
  // menus show Change level
  await pg.evaluate("__lv.m.b('b3')");await R(400);
  ok('branch menu has Change level',await pg.locator('.lv-open').count()>0);await pg.evaluate("psClose&&psClose(true)").catch(()=>{});await R(300);
  // task -> branch
  await pg.evaluate("__lv.toBranch('t0','brand')");await R(500);
  let s=await st();ok('task became branch',s.t0.b&&!s.t0.p,JSON.stringify(s));
  ok('board shows it',await pg.evaluate("[...document.querySelectorAll('.rm-branch')].some(e=>e.textContent.includes('Task 1 with'))"));
  // branch -> task (undo path checked after)
  await pg.evaluate("__lv.toTask('b2','b1')");await R(500);
  s=await st();ok('branch became task in b1',!s.b2.b&&s.b2.p==='b1',JSON.stringify(s));
  ok('its tasks moved',s.t5.p==='b1',JSON.stringify(s));
  // branch -> parent
  await pg.evaluate("__lv.branchToParent('b4')");await R(700);
  ok('new parent from branch',await pg.evaluate("__rm.parents().some(p=>p.name==='Mugassam studio')"));
  ok('old branch archived not deleted',await pg.evaluate("!!__lv.S().tasks.b4&&!!__lv.S().tasks.b4.archived"));
  // parent -> branch
  await pg.evaluate("__lv.parentToBranch('learning','work')");await R(900);
  ok('parent gone',await pg.evaluate("!__rm.parents().some(p=>p.id==='learning')"));
  ok('now a branch named Learning',await pg.evaluate("Object.values(__lv.S().tasks).some(t=>t.bucket&&t.title==='Learning'&&!t.archived)"));
  ok('english course moved to work',await pg.evaluate("__rm.parentOf('b9')==='work'"));
  await pg.evaluate("__lv.toBranch('t0','brand')");
  ok('no page errors',true);
});
