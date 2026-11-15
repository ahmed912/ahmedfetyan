// Habits round 1: model and logic
const fs=require('fs');const {openp,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const base=(skip)=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.logs=d.logs||{};
  d.habits={...(d.habits||{}),hd:{custom:true,name:'Read',rec:{type:'daily'},tod:'any',order:1},hw:{custom:true,name:'Walk',rec:{type:'weekdays'},order:2},hx:{custom:true,name:'Swim',rec:{type:'xweek',n:3},order:3},hk:{custom:true,name:'Plan',rec:{type:'weekly',days:[1]},order:4},hc:{custom:true,name:'Call',rec:{type:'days',days:[0,2]},order:5}};
  const L=(x,k)=>{d.logs[x]={...(d.logs[x]||{}),date:x,[k]:true};};
  ['05','06','07','08'].forEach(n=>L('2026-11-'+n,'hd'));['03','04','05','07','08'].forEach(n=>L('2026-11-'+n,'hw'));['07','08'].forEach(n=>L('2026-11-'+n,'hx'));
  if(skip){delete d.logs['2026-11-06'].hd;d.logs['2026-11-06'].hbs={hd:'skip'};}
  return d;};
run(async b=>{for(const w of [1300]){
  let pg=await openp(b,w,{sb:true,real:JSON.stringify(base(false))});
  await pg.clock.runFor(1500);
  const E=x=>pg.evaluate(x);
  const H=id=>`__hb.list().find(h=>h.id==='${id}')`;
  const ids=await E("__hb.list().map(h=>h.id)");
  ok('list has all',['english','gym','hd','hw','hx','hk','hc'].every(i=>ids.includes(i)),ids.join());
  ok('hd streak 4',(await E(`__hb.streak(${H('hd')}).cur`))===4);
  ok('hw streak 5',(await E(`__hb.streak(${H('hw')}).cur`))===5,await E(`__hb.streak(${H('hw')}).cur`));
  ok('hx due 9',(await E(`__hb.due(${H('hx')},'2026-11-09')`))===true);
  await E("__hb.mark('2026-11-09','hx',true)");await pg.clock.runFor(300);
  ok('hx not due 10 after mark',(await E(`__hb.due(${H('hx')},'2026-11-10')`))===false);
  ok('hk due mon',(await E(`__hb.due(${H('hk')},'2026-11-09')`))===true&&(await E(`__hb.due(${H('hk')},'2026-11-10')`))===false);
  ok('hc due tue',(await E(`__hb.due(${H('hc')},'2026-11-09')`))===false&&(await E(`__hb.due(${H('hc')},'2026-11-10')`))===true);
  ok('recName',(await E("__hb.recName({type:'days',days:[0,2]})"))==='Sun, Tue'&&(await E("__hb.recName({type:'xweek',n:3})"))==='3x a week');
  await E("__hb.set('2026-11-09','hk','moved')");await pg.clock.runFor(300);
  ok('moved makes next day due',(await E("__hb.day('2026-11-10','hk')"))==='due'&&(await E(`__hb.due(${H('hk')},'2026-11-10')`))===true);
  await pg.locator('#v3ut .ub-b').click();await pg.clock.runFor(300);
  ok('undo removes due',(await E("__hb.day('2026-11-10','hk')"))==='open'&&(await E("__hb.day('2026-11-09','hk')"))==='open');
  ok('no errs',pg.errs.filter(e=>!/ERR_FAILED/.test(e)).length===0,pg.errs.join('|'));
  pg=await openp(b,w,{sb:true,real:JSON.stringify(base(true))});await pg.clock.runFor(1500);
  ok('hd streak 3 with skip',(await pg.evaluate(`__hb.streak(${H('hd')}).cur`))===3,await pg.evaluate(`__hb.streak(${H('hd')}).cur`));
  ok('no errs 2',pg.errs.filter(e=>!/ERR_FAILED/.test(e)).length===0,pg.errs.join('|'));
}});
