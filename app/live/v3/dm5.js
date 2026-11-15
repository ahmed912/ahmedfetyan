// Diamonds round 5: backfill script (Node, no browser)
const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process'),assert=require('assert');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const S=path.join(__dirname,'..','tools','wins_backfill.js');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dm5-'));const IN=path.join(dir,'in.json'),OUT=path.join(dir,'out.json');
const d={tasks:{
  b1:{title:'Cand one',bucket:true},t1:{title:'a',parent:'b1',done:true,doneAt:'2026-10-01'},t2:{title:'b',parent:'b1',done:true,doneAt:'2026-10-05'},s1:{title:'sub',parent:'t1',sub:true,done:false},
  b2:{title:'Cand two',bucket:true},t3:{title:'c',parent:'b2',done:true,doneAt:'2026-09-01'},
  b3:{title:'Open one',bucket:true},t4:{title:'d',parent:'b3',done:true,doneAt:'2026-09-02'},t5:{title:'e',parent:'b3',done:false},
  t6:{title:'No doneAt',done:true},t7:{title:'No doneAt no entry',done:true}},
  logs:{},entries:{'2026-10-03':{date:'2026-10-03',items:[{id:'x',ref:'tasks:t6',minutes:30}]}},wins:{}};
fs.writeFileSync(IN,JSON.stringify(d));
const run=(...a)=>cp.spawnSync('node',[S,IN,...a],{encoding:'utf8'});
let r=run();
ok('dry run exit 0',r.status===0,r.stderr);
ok('dry run: OUT absent',!fs.existsSync(OUT)&&!fs.existsSync(IN.replace(/\.json$/,'')+'.applied.json'));
const bd=path.join(dir,'backup'),bf=fs.existsSync(bd)?fs.readdirSync(bd):[];
ok('backup present',bf.length===1&&/^wins-\d{8}T\d{6}\.json$/.test(bf[0]),bf.join());
ok('both candidates printed',/shipped candidate: b1 Cand one \(2 tasks\)/.test(r.stdout)&&/shipped candidate: b2 Cand two \(1 tasks\)/.test(r.stdout)&&!/b3/.test(r.stdout));
ok('doneAt report',/t6 No doneAt would show on 2026-10-03/.test(r.stdout)&&/t7 .*skipped, no entry/.test(r.stdout));
r=run('--apply','b1','--out',OUT);
ok('apply exit 0',r.status===0,r.stderr);
const o=JSON.parse(fs.readFileSync(OUT,'utf8'));
ok('b1 flagged',o.tasks.b1.shipped===true&&o.tasks.b1.shippedAt==='2026-10-05');
ok('b2 untouched',o.tasks.b2.shipped===undefined&&o.tasks.b3.shipped===undefined);
const rbf=fs.readdirSync(bd).filter(f=>/rollback/.test(f));ok('rollback file',rbf.length===1);
const rb=JSON.parse(fs.readFileSync(path.join(bd,rbf[0]),'utf8'));
rb.forEach(x=>{const b=o.tasks[x.id];if(x.shipped===null)delete b.shipped;else b.shipped=x.shipped;if(x.shippedAt===null)delete b.shippedAt;else b.shippedAt=x.shippedAt;});
let same=true;try{assert.deepStrictEqual(o.tasks,d.tasks);}catch(e){same=false;}
ok('rollback restores tasks',same);
r=run('--apply','b3','--out',path.join(dir,'o2.json'));
ok('non-candidate exits 2',r.status===2&&!fs.existsSync(path.join(dir,'o2.json')),String(r.status));
fs.rmSync(dir,{recursive:true,force:true});
