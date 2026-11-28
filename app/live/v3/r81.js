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
run(async b=>{for(const w of [1300,1024,390]){console.log('== width',w);
  const pg=await openp(b,w,{h:w===1024?768:900,when:'2026-11-19T11:00:00',real:JSON.stringify(fx()),rm44:1});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  const data=()=>pg.evaluate("JSON.stringify(window.__data)").then(JSON.parse);
  await pg.evaluate("__r2.setPage('roadmap')");await R(800);
  if(w===390){ok('phone width: 7 per row',await pg.locator('.rm-hgrid').first().evaluate(g=>getComputedStyle(g).gridTemplateColumns.split(' ').length)===7);continue;}
  ok('habits parent',await pg.locator('.rm-hparent').count()===1);
  ok('habit branches',await pg.locator('.rm-hb').count()>=2);
  ok('30 cells in Nov',await pg.locator('.rm-hgrid[data-hid="english"] .rm-hday').count()===30);
  ok('today marked',await pg.locator('.rm-hgrid[data-hid="english"] .rm-hday.today').count()===1);
  ok('future dim',await pg.locator('.rm-hgrid[data-hid="english"] .rm-hday.fut').count()===11);
  ok('past X',await pg.locator('.rm-hgrid[data-hid="english"] .rm-hday.miss').count()>=1);
  ok('counts',await pg.locator('.rm-parent .rm-cnt').count()>=4&&await pg.locator('.rm-branch .rm-cnt').count()>=3);
  ok('progress lines',await pg.locator('.rm-prog').count()>=3);
  const cols=await pg.locator('.rm-hgrid[data-hid="english"]').evaluate(g=>getComputedStyle(g).gridTemplateColumns.split(' ').length);
  ok('cells per row',cols===(w>=900?15:7),cols);
  const cell=pg.locator('.rm-hgrid[data-hid="english"] .rm-hday[data-d="2026-11-19"]');
  await cell.click();await R(500);
  let d=await data();ok('tick saved',!!(d.logs['2026-11-19']||{}).english);
  ok('cell filled',await cell.evaluate(e=>e.classList.contains('on')));
  ok('pct shown',/^[1-9]/.test(await pg.locator('.rm-hpct[data-hid="english"]').innerText()));
  await pg.locator('#v3ut .ub-b').click({timeout:3000});await R(500);d=await data();
  ok('undo unticks',!(d.logs['2026-11-19']||{}).english);
  await pg.locator('.rm-hgrid[data-hid="english"] .rm-hday[data-d="2026-11-10"]').click();await R(500);
  d=await data();ok('past tick keeps date',!!(d.logs['2026-11-10']||{}).english);
  await pg.locator('.rm-hprev').click();await R(500);
  ok('prev month Oct',await pg.locator('.rm-hmon').innerText()==='October 2026');
  ok('31 cells Oct',await pg.locator('.rm-hgrid[data-hid="english"] .rm-hday').count()===31);
  await pg.locator('.rm-hnext').click();await R(500);
  ok('back to Nov',await pg.locator('.rm-hmon').innerText()==='November 2026');
  await pg.screenshot({path:'v3/shots/r81-'+w+'.png'});
  ok('no page errs',!pg.errs.some(x=>!/Failed to load resource/.test(x)),pg.errs[0]);
}});
