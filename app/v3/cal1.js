// Calendar phases 0 and 1: views, grid, month, editor taps. Uses mock_final.json.
process.env.MOCKDATA=process.env.MOCKDATA||'/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?' '+x:''));if(!c)process.exitCode=1;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  for(const scheme of ['light','dark']){
  const pg=await openp(b,w,{when:'2026-11-14T11:00:00',scheme});const W=ms=>pg.waitForTimeout(ms);const ev=s=>pg.evaluate(s);
  await pg.click(w<700?'.m-tab:has-text("Review")':'.topnav :text("Review")');await pg.clock.runFor(500);await W(700);
  const tab=v=>pg.click('#wfBody .cal-views button[data-v="'+v+'"]').then(()=>pg.clock.runFor(300)).then(()=>W(400));
  const title=()=>ev("document.querySelector('.cal-title')?.textContent");
  if(scheme==='light'){
  const def=await ev("document.querySelector('.cal-views [aria-pressed=true]').dataset.v");
  ok('default view '+(w<700?'day':'week'),def===(w<700?'day':'week'),def);
  // pure helpers
  const U=await ev(`(()=>{const o=(ev,a,b)=>__cal.calOcc({id:'e',...ev},a,b).map(x=>x.date);
    return JSON.stringify({daily:o({date:'2026-11-14',rrule:{freq:'daily',interval:1}},'2026-11-14','2026-11-17'),
    weekly:o({date:'2026-11-14',rrule:{freq:'weekly',interval:1,byDay:[6,1,3],until:'2026-11-25'}},'2026-11-14','2026-12-31'),
    m31:o({date:'2026-10-31',rrule:{freq:'monthly',interval:1}},'2026-10-01','2027-02-28'),
    ex:o({date:'2026-11-14',exdates:['2026-11-15'],rrule:{freq:'daily',interval:1}},'2026-11-14','2026-11-16'),
    parse:['Javelin slides 2h tomorrow 9am','Dentist 45m sat 5pm @Maadi','Call Sam 14:00 today #linkedin','read book 3p mon','Lunch 13 nov','Plan nov 20 1.5h'].map(t=>{const p=__cal.calParse(t,'2026-11-14');return [p.title,p.mins,p.date,p.start,p.cat,p.location].join('|')})})})()`);
  const u=JSON.parse(U);console.log(JSON.stringify(u));
  ok('daily',u.daily.join()==='2026-11-14,2026-11-15,2026-11-16,2026-11-17');
  ok('weekly Sat/Mon/Wed until',u.weekly.join()==='2026-11-14,2026-11-16,2026-11-18,2026-11-21,2026-11-23,2026-11-25',u.weekly.join());
  ok('monthly 31st skips Nov',u.m31.join()==='2026-10-31,2026-12-31,2027-01-31',u.m31.join());
  ok('exdates dropped',u.ex.join()==='2026-11-14,2026-11-16');
  ok('calParse Javelin',u.parse[0]==='Javelin slides|120|2026-11-15|09:00|portfolio|',u.parse[0]);
  ok('calParse Dentist',u.parse[1]==='Dentist|45|2026-11-21|17:00||Maadi',u.parse[1]);
  ok('calParse Call Sam',u.parse[2]==='Call Sam||2026-11-14|14:00|linkedin|',u.parse[2]);
  ok('calParse 3p mon',u.parse[3]==='read book|150|2026-11-16|||',u.parse[3]);
  ok('calParse 13 nov',u.parse[4]==='Lunch||2026-11-13|||',u.parse[4]);
  ok('calParse nov 20',u.parse[5]==='Plan|90|2026-11-20|||',u.parse[5]);
  // title nav
  const t0=await title();await tab('week');const t1=await title();await pg.click('.cal-next');await pg.clock.runFor(200);await W(300);const t2=await title();await pg.click('.cal-prev');await pg.click('.cal-today');await pg.clock.runFor(200);await W(300);
  ok('title changes with next',t1!==t2,t1+' -> '+t2);ok('today returns',(await title())===t1,await title());
  ok('title format',/^[A-Z][a-z]{2} \d+ to (\d+|[A-Z][a-z]{2} \d+), 2026$/.test(t1),t1);
  // week grid
  const cols=await ev("document.querySelectorAll('.cal-col').length");ok('Week has 7 columns',cols===7,cols);
  const fri=await ev("document.querySelectorAll('.cal-col.fri').length+'|'+document.querySelector('.cal-col.fri')?.dataset.d");ok('Friday column has fri class',/^1\|/.test(fri),fri);
  const first=await ev("document.querySelector('.cal-col').dataset.d");ok('week starts Saturday (14 Nov)',first==='2026-11-14',first);
  const nl=await ev("(()=>{const l=document.querySelector('.cal-now').getBoundingClientRect(),g=document.querySelector('.cal-grid').getBoundingClientRect(),ph=+document.querySelector('.cal-grid').dataset.ph;return [l.top-g.top,(660-270)/60*ph]})()");
  ok('now line at 11:00',Math.abs(nl[0]-nl[1])<=2,nl.join(' vs '));
  const dh=await ev("[...document.querySelectorAll('.cal-dh .cap')].map(x=>x.textContent).join(',')");ok('header shows n of 8',/\d+(\.\d)? of 8/.test(dh),dh);
  // S2 rule on 13 Nov: previous week
  await pg.click('.cal-prev');await pg.clock.runFor(200);await W(300);
  const sp=await ev("(()=>{const c=document.querySelector('.cal-col[data-d=\"2026-11-13\"]');const h=document.querySelector('.cal-dh[data-d=\"2026-11-13\"] .sp');return [!!c&&c.classList.contains('sp0'),h&&h.textContent]})()");
  ok('S2 rule on 13 Nov',sp[0]&&sp[1]==='S2',JSON.stringify(sp));
  await pg.click('.cal-today');await pg.clock.runFor(200);await W(300);
  // seed a timed task and check position
  await ev(`(()=>{const state=__cal.st();const id=Object.keys(state.tasks).find(i=>state.tasks[i].date==='2026-11-15'&&!state.tasks[i].cut&&!state.tasks[i].archived&&__cal.leaf(i));window.__seed=id;state.tasks[id]={...state.tasks[id],start:'09:45',mins:50};__cal.rd();})()`);
  await pg.clock.runFor(200);await W(400);
  const sd=await ev("(()=>{const e=document.querySelector('.cal-it[data-id=\"'+window.__seed+'\"]');if(!e)return null;const g=document.querySelector('.cal-grid').getBoundingClientRect(),ph=+document.querySelector('.cal-grid').dataset.ph;return [e.getBoundingClientRect().top-g.top,(585-270)/60*ph,e.classList.contains('sugg')]})()");
  ok('task with start 09:45 sits at 9:45',sd&&Math.abs(sd[0]-sd[1])<=2&&!sd[2],JSON.stringify(sd));
  const sg=await ev("document.querySelectorAll('.cal-it.sugg').length");ok('suggested tasks drawn (dashed)',sg>0,sg);
  const lab=await ev("[...document.querySelectorAll('.cal-it')].every(e=>e.getAttribute('aria-label'))");ok('items have aria-label',lab);
  // parent bar
  const pb=await ev("document.querySelectorAll('.cal-bar.k-parent').length");
  await pg.click('.cal-prev');await pg.click('.cal-prev');await pg.clock.runFor(200);await W(300);
  const pb2=await ev("document.querySelectorAll('.cal-bar.k-parent').length");
  ok('parent shows as an all-day bar (some week)',pb+pb2>0,pb+','+pb2);
  await pg.click('.cal-today');await pg.clock.runFor(200);await W(300);
  // editor taps
  await pg.evaluate("document.querySelector('.cal-scroll').scrollTop=(12*60-270)/60*(+document.querySelector('.cal-grid').dataset.ph)");await W(200);
  await pg.evaluate("document.querySelector('.cal-scroll').scrollIntoView({block:'start'})");await W(200);
  const dd=await ev("(()=>{const c=document.querySelector('.cal-col[data-d=\"2026-11-16\"]'),r=c.getBoundingClientRect();return [r.left+r.width/2,r.top+(14*60-270)/60*(+document.querySelector('.cal-grid').dataset.ph)]})()");
  await pg.mouse.click(dd[0],dd[1]);await W(500);
  ok('tap an empty slot opens the editor',(await pg.locator('.ps-sheet .cal-f-title').count())===1);
  const sv=await ev("document.querySelector('.ps-sheet .cal-f-date').value+' '+document.querySelector('.ps-sheet .cal-f-start').value");console.log('slot ->',sv);
  ok('slot carries day and time',/^2026-11-16 1[34]:/.test(sv),sv);
  await pg.fill('.ps-sheet .cal-f-title','Dentist');await pg.click('.ps-sheet .cal-save');await pg.clock.runFor(400);await W(600);
  const ne=await ev("JSON.stringify(Object.values(window.__data.events||{}).map(e=>[e.title,e.date,e.start,e.mins]))");console.log('events',ne);
  ok('event saved to the store',/Dentist/.test(ne),ne);
  const eb=pg.locator('.cal-it.k-event');ok('event drawn on the grid',(await eb.count())===1);
  await eb.click();await W(500);ok('tap an event opens it',(await pg.locator('.ps-sheet .cal-f-title').inputValue())==='Dentist');
  await pg.click('.ps-sheet .btn.ghost:has-text("Cancel")');await pg.clock.runFor(450);await W(400);
  // task tap opens task sheet
  await pg.locator('.cal-it.k-task').first().click();await W(500);ok('tap a task opens its sheet',(await pg.locator('.ps-sheet').count())>0);await pg.keyboard.press('Escape');await pg.clock.runFor(450);await W(400);
  // day view
  await tab('day');const dsp=await ev("document.querySelectorAll('.cal-col.split').length+'|'+(document.querySelector('.cal-dh .wkd')||{}).textContent");ok('Day view splits plan and worked',/^1\|Planned/.test(dsp),dsp);
  // month
  await tab('month');
  const mc=await ev("document.querySelectorAll('.cal-mc').length");ok('Month has 42 cells',mc===42,mc);
  const mo=await ev("[...document.querySelectorAll('.cal-more')].length");ok('Month shows +n more',mo>0,mo);
  await shot(pg,'cal1_month_'+w);
  const sl=await ev("[...document.querySelectorAll('.cal-mc .sp')].map(x=>x.textContent).join()");ok('Month labels sprint start',/S2/.test(sl),sl);
  await pg.locator('.cal-more').first().click();await pg.clock.runFor(300);await W(400);
  ok('+n more opens Day',(await ev("document.querySelector('.cal-views [aria-pressed=true]').dataset.v"))==='day');
  await pg.locator('.cal-mc').count();
  await tab('month');await pg.locator('.cal-mc').nth(20).click({position:{x:10,y:60}});await W(500);ok('tap a month day opens the editor',(await pg.locator('.ps-sheet .cal-f-title').count())===1);await pg.keyboard.press('Escape');await pg.clock.runFor(450);await W(400);
  // timeline
  await tab('timeline');const wf=await ev("(document.querySelector('#wfBody .wf-sum')?.dataset.tip||'')");ok('Timeline keeps the waterfall summary',/of \d+ tasks/.test(wf),wf);
  ok('Timeline has rows',(await pg.locator('#wfBody .v3-wft').count())>0);
  }
  await tab('week');await pg.clock.runFor(300);await W(300);await shot(pg,'cal1_week_'+scheme+'_'+w);
  await tab('day');await W(200);await shot(pg,'cal1_day_'+scheme+'_'+w);
  const er=pg.errs.filter(e=>!e.includes('ERR_FAILED'));ok('no console errors ('+scheme+')',er.length===0,er.slice(0,3).join(' '));
  await pg.context().close();}}});
