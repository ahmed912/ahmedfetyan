// Round 95: hide all tasks, show only parents and branches
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

run(async b=>{const pg=await openp(b,1300,{h:1200,when:'2026-11-28T11:00:00',real:JSON.stringify(fx()),rm44:1,oh51:1});
 const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
 await pg.evaluate("__r2.setPage('roadmap')");await R(1000);
 const n=()=>pg.evaluate("document.querySelectorAll('#rmWorld .rm-task').length");
 const before=await n();ok('tasks shown first '+before,before>0);
 await pg.locator('.rm-allc').click();await R(600);
 ok('all tasks hidden',(await n())===0);
 ok('branches and parents stay',await pg.evaluate("document.querySelectorAll('#rmWorld .rm-branch,#rmWorld .rm-parent,#rmWorld .rm-tbranch').length")>2);
 ok('button says Show tasks',(await pg.locator('.rm-allc').innerText()).trim()==='Show tasks');
 await pg.locator('.rm-allc').click();await R(600);
 ok('tasks back',(await n())===before);
});
