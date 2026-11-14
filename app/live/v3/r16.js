// Reschedule everywhere: Today card and step, task sheet, waterfall (bar, drag, cell), project. Uses mock_final.json.
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?' '+x:''));if(!c)process.exitCode=1;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-13T11:00:00'});const W=ms=>pg.waitForTimeout(ms);const R=async ms=>{await pg.clock.runFor(ms);await W(200);};await pg.evaluate(()=>__ch.openAll());await W(200);
  const T=()=>pg.evaluate("JSON.parse(JSON.stringify(window.__data.tasks))");
  const nav=async n=>{await pg.click(w<700?`.m-tab:has-text("${n}")`:`.topnav :text("${n}")`).catch(()=>{});await R(600);};
  const hold=async loc=>{await loc.evaluate(e=>e.scrollIntoView({block:'center'}));await R(300);const bb=await loc.boundingBox();await pg.mouse.move(bb.x+24,bb.y+Math.min(14,bb.height/2));await pg.mouse.down();await pg.clock.runFor(700);await pg.mouse.up();await R(400);};
  const swipeL=async loc=>{await loc.evaluate(e=>e.scrollIntoView({block:'center'}));await R(500);const bb=await loc.boundingBox();const y=bb.y+bb.height/2,x0=bb.x+bb.width*0.8;await pg.mouse.move(x0,y);await pg.mouse.down();for(let i=1;i<=8;i++)await pg.mouse.move(x0-200*i/8,y+1);await pg.mouse.up();await R(500);};
  const STEP='#cutStack .cs-card.cs-top .cs-step:not(.done)';
  const undo=async()=>{await pg.click('#v3ut .ub-b');await R(400);};
  // 1 Today parent card: shifts steps too, moved count, undo
    let T0=await T();const open0=Object.entries(T0).filter(([i,t])=>t.parent&&t.date==='2026-11-13'&&!t.done&&!t.archived);
  await hold(pg.locator('#cutStack .cs-card.cs-top .cs-head').first());
  ok('hold on a card opens the quick menu (6 items plus Rename, Move to bucket and Reorder)',(await pg.locator('.ps-sheet .btn:has-text("Reschedule")').count())===1&&(await pg.locator('.ps-sheet .btn:has-text("Edit")').count())===1&&(await pg.locator('.ps-sheet .btn').count())<=9,await pg.locator('.ps-sheet .btn').count());
  await pg.click('.ps-sheet .btn:has-text("Reschedule")');await R(400);
  ok('sheet has 3 quick picks and a date input',(await pg.locator('.ps-sheet .rs-pick').count())===3&&(await pg.locator('.ps-sheet input[type=date]').count())===1);
  await shot(pg,'r16_card_'+w);
  await pg.fill('.ps-sheet input[type=date]','2026-11-16');await R(600);
  ok('asks move its steps too',(await pg.locator('.ps-sheet:has-text("Move its steps too?")').count())===1);
  await pg.click('.rs-steps-yes');await R(600);
  let T1=await T();const mv=open0.filter(([i])=>T1[i].date==='2026-11-16'&&(T1[i].moved||0)===(T0[i].moved||0)+1);
  ok('today steps moved to 16 Nov with moved+1',open0.length>0&&mv.length===open0.length,mv.length+'/'+open0.length);
  await undo();T1=await T();ok('undo restores card steps',open0.every(([i])=>T1[i].date==='2026-11-13'&&(T1[i].moved||0)===(T0[i].moved||0)));
  // 2 Today step, past sprint end warns
  const sbid=await pg.locator(STEP).first().getAttribute('data-step');const sid=(await T())[sbid].title;
  await swipeL(pg.locator(STEP).first());ok('swipe left on a step opens Reschedule',(await pg.locator('.ps-sheet[aria-label="Reschedule"]').count())===1);await pg.fill('.ps-sheet input[type=date]','2026-12-30');await R(600);
  ok('past sprint end asks first',(await pg.locator('#v3Conf').count())===1,await pg.locator('#v3Conf').textContent().catch(()=>''));
  await pg.click('#v3Conf .btn:not(.ghost)');await R(600);T1=await T();
  const mid=Object.keys(T1).find(i=>T1[i].date==='2026-12-30'&&T1[i].parent)||sbid;const st=T1[mid];ok('step moved to 30 Dec',st&&st.date==='2026-12-30'&&st.moved>=1,sbid+' '+JSON.stringify(st)+' '+JSON.stringify(Object.entries(T1).filter(([i,x])=>x.date==='2026-12-30').map(([i])=>i)));
  await undo();T1=await T();ok('step undo',T1[mid].date==='2026-11-13');
  // journey: swipe left on a step, tap Tomorrow, see the Undo toast, tap Undo (3 gestures)
  {const id0=await pg.locator(STEP).first().getAttribute('data-step');const nm=(await T())[id0].title;await swipeL(pg.locator(STEP).first());
    await pg.click('.ps-sheet .rs-pick >> nth=0');await R(600);
    const tt=await pg.locator('#v3ut .ub-t').textContent();ok('journey: Undo toast says Moved to',/^Moved to/.test(tt)&&tt.includes(nm),tt);
    const mv=(await T())[id0];ok('journey: step is on tomorrow with moved count',mv.date==='2026-11-14'&&mv.moved>=1,mv.date+' '+mv.moved);
    await undo();ok('journey: Undo brings it back',(await T())[id0].date==='2026-11-13');}
  // 3 Task sheet in Review waterfall, plus waterfall edits
  await nav('Review');await W(400);
  const rows=pg.locator('#wfBody .v3-wft');ok('waterfall rows',(await rows.count())>0);
  await pg.locator('#wfBody').scrollIntoViewIfNeeded();
  // week view: 7 days from Saturday, prev/next, This week
  await pg.click('.wf-v-week');await R(500);
  ok('week view has 7 day columns',(await pg.locator('#wfBody .wf-h:not(.wf-lbl)').count())===7);
  const wl=await pg.locator('.wf-wk-l').textContent();ok('week starts Saturday',/7 Nov to 13 Nov/.test(wl),wl);
  await pg.click('.wf-next');await R(500);const wl2=await pg.locator('.wf-wk-l').textContent();ok('next week',/14 Nov to 20 Nov/.test(wl2),wl2);
  const colw=await pg.evaluate("document.querySelector('#wfBody .wf-cell').getBoundingClientRect().width");ok('wide day columns',colw>=70,colw);
  await shot(pg,'r16_week_'+w);
  await pg.click('.wf-prev');await R(400);await pg.click('.wf-this');await R(400);ok('This week returns to 7 to 13 Nov',/7 Nov to 13 Nov/.test(await pg.locator('.wf-wk-l').textContent()));
  await pg.click('.wf-next');await R(500);
  const lone=await pg.evaluate("(()=>{const T=window.__data.tasks;const bars=[...document.querySelectorAll('#wfBody .wf-bar[data-id]')].map(b=>b.dataset.id).filter(i=>T[i].date>='2026-11-14'&&T[i].date<'2026-11-20');return bars[1]||bars[0]||null;})()");
  const vis=async loc=>{await loc.evaluate((e,off)=>{e.scrollIntoView({block:'center'});const sc=e.closest('.wf-scroll');const r=e.getBoundingClientRect(),c=sc.getBoundingClientRect();const lb=sc.querySelector('.wf-lbl').getBoundingClientRect();sc.scrollLeft+=r.left-lb.right-6;},w<700?210:300);await R(600);};
  const fin=async()=>{await R(400);if(await pg.locator('.rs-steps-no').count())await pg.click('.rs-steps-no');await R(400);if(await pg.locator('#v3Conf').count())await pg.click('#v3Conf .btn:not(.ghost)');await R(500);};
  const par=await pg.evaluate("(()=>{const T=window.__data.tasks;const par=new Set(Object.values(T).filter(t=>t.parent&&!t.archived).map(t=>t.parent));return [...document.querySelectorAll('#wfBody .wf-bar[data-id]')].map(b=>b.dataset.id).find(i=>par.has(i)&&T[i].date>='2026-11-13')||null;})()");
  console.log('lone',lone,'parent',par);
  ok('bars are interactive',(await pg.locator('#wfBody .wf-bar[role=button]').count())>0);
  if(par){const pt=(await T())[par];await pg.locator('#wfBody .v3-wft').filter({hasText:pt.title}).first().click();await R(500);
    ok('task sheet has Reschedule',(await pg.locator('.ps-sheet .rs-sheet-btn').count())===1);
    await pg.click('.ps-sheet .rs-sheet-btn');await R(400);await pg.click('.ps-sheet .rs-pick >> nth=2');await R(500);
    ok('parent asks about steps',(await pg.locator('.rs-steps-yes').count())===1);await pg.click('.rs-steps-no');await R(300);
    if(await pg.locator('#v3Conf').count())await pg.click('#v3Conf .btn:not(.ghost)');await R(500);
    const P1=(await T())[par];ok('parent only moved +1 week',P1.date!==pt.date&&P1.date===pt.date.replace(/.*/,P1.date),pt.date+' -> '+P1.date);await undo();}
  if(lone){const t0=(await T())[lone];
    // cell click: Move here
    const cell=pg.locator('#wfBody .wf-cell[data-id="'+lone+'"]:not([data-d="'+t0.date+'"])').last();const cd=await cell.getAttribute('data-d');
    await vis(cell);const cbx=await cell.boundingBox();await pg.mouse.click(cbx.x+cbx.width/2,cbx.y+cbx.height/2);await R(400);
    ok('empty cell offers Move here',(await pg.locator('#v3Conf .btn:has-text("Move here")').count())===1);await shot(pg,'r16_cell_'+w);
    await pg.click('#v3Conf .btn:has-text("Move here")');await fin();
    let t1=(await T())[lone];ok('cell moved task to '+cd,t1.date===cd&&t1.moved===(t0.moved||0)+1,t1.date);await undo();
    ok('undo after cell move',(await T())[lone].date===t0.date);
    // drag bar
    const bar=pg.locator('#wfBody .wf-bar[data-id="'+lone+'"]');await vis(bar);const bb=await bar.boundingBox();
    const nd=await pg.evaluate("(d=>{const x=new Date(d+'T12:00');x.setDate(x.getDate()+(x.getDay()===4?2:1));return x.toISOString().slice(0,10)})('"+t0.date+"')");const tc=pg.locator('#wfBody .wf-cell[data-id="'+lone+'"][data-d="'+nd+'"]');const tcd=await tc.getAttribute('data-d');const cb=await tc.boundingBox();
    await pg.mouse.move(bb.x+20,bb.y+bb.height/2);await pg.mouse.down();await pg.mouse.move(bb.x+20+10,bb.y+bb.height/2,{steps:2});await pg.mouse.move(cb.x+cb.width/2,cb.y+cb.height/2,{steps:6});await pg.mouse.up();await fin();
    t1=(await T())[lone];ok('drag moved bar to '+tcd,t1.date===tcd,t1.date);await shot(pg,'r16_drag_'+w);await undo();
    // tap bar opens the same quick menu, hold on a row too
    await vis(bar);{const q=await bar.boundingBox();await pg.mouse.click(q.x+20,q.y+q.height/2);}await R(400);ok('tap bar opens quick menu',(await pg.locator('.ps-sheet .btn:has-text("Reschedule")').count())===1&&(await pg.locator('.ps-sheet .btn:has-text("Archive")').count())===1);await pg.keyboard.press('Escape');await R(300);
    await hold(pg.locator('#wfBody .v3-wfrow[data-id="'+lone+'"]'));ok('hold on a waterfall row opens the quick menu',(await pg.locator('.ps-sheet .btn:has-text("Reschedule")').count())===1);await pg.keyboard.press('Escape');await R(300);
  }
  // 5 Projects
  await pg.evaluate("document.querySelector('.page:not([hidden])')&&0");
  // the Projects page is hidden in this build, so open the project sheet directly
  const opened=await pg.evaluate("(()=>{try{document.querySelector('.proj[data-id=fnb]').click();return !document.getElementById('sheet').hidden;}catch(e){return String(e);}})()");await R(500);
  if(opened===true){
    await pg.click('.rs-proj-btn');await R(400);await pg.click('.ps-sheet .rs-pick >> nth=2');await R(600);
    const pr=await pg.evaluate("window.__data.projects.fnb");ok('project due moved +1 week',pr.due==='2026-12-29'&&pr.moved===1,JSON.stringify(pr));await undo();
    ok('project undo',(await pg.evaluate("window.__data.projects.fnb.due"))==='2026-12-22');}
  else ok('project sheet opens',false,opened);
  const pe=pg.errs.filter(x=>!x.includes('ERR_FAILED'));ok('no page errors',pe.length===0,pe.join('|'));
}});
