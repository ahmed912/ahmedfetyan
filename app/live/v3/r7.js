const {openp,shot,run}=require('./h.js');const fs=require('fs');
const ok=(n,c,x)=>console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?' '+x:''));
const R=JSON.parse(fs.readFileSync('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pubbuild/app/cut/real.json','utf8'));
// own fixture: 3 parents, 10 steps over Mon 16, Tue 17, Wed 18 Nov 2026
const SP=[[1,'2026-11-03','2026-11-12'],[2,'2026-11-13','2026-11-25'],[3,'2026-11-26','2026-12-05'],[4,'2026-12-06','2026-12-15'],[5,'2026-12-16','2026-12-25'],[6,'2026-12-26','2027-01-03']];
R.sprints={};SP.forEach(([n,s,e])=>{R.sprints['s'+n]={n,start:s,end:e,name:'Sprint '+n,goal:'g'+n,posts:5,comments:40,applications:2};});
R.settings.prefs={dayMin:400};
const P=(title,cat,date,days,mins,order)=>({title,cat,date,days,mins,sprint:2,desc:'',done:false,order,kind:'parent'});
const S=(title,cat,date,parent,mins,order)=>({title,cat,date,parent,mins,sprint:2,done:false,order});
R.tasks={
  pC:P('LinkedIn daily routine','linkedin','2026-11-16',2,60,3),pB:P('StoryBrand chapters','learning','2026-11-16',3,180,2),pA:P('Javelin deck','portfolio','2026-11-16',3,420,1),
  sA1:S('Javelin status','portfolio','2026-11-16','pA',60,1),sA2:S('Javelin storyline','portfolio','2026-11-16','pA',90,2),sA3:S('Javelin slides 1 to 5','portfolio','2026-11-17','pA',120,3),sA4:S('Javelin slides 6 to 8','portfolio','2026-11-17','pA',60,4),sA5:S('Javelin export','portfolio','2026-11-18','pA',60,5),
  sB1:S('StoryBrand ch 10','learning','2026-11-16','pB',60,1),sB2:S('StoryBrand ch 11','learning','2026-11-17','pB',60,2),sB3:S('StoryBrand ch 12','learning','2026-11-18','pB',60,3),
  sC1:S('Post 3 live and comments','linkedin','2026-11-16','pC',30,1),sC2:S('Post 4 live and comments','linkedin','2026-11-17','pC',30,2)};
// 3 parents, 10 leaves? count: A 5 + B 3 + C 2 = 10
R.habits={hx:{custom:true,name:'4-hour focus block first',min:5,max:6}};
const FIX=JSON.stringify(R);
run(async b=>{for(const w of [390,1300]){console.log('== width',w);const pg=await openp(b,w,{real:FIX,when:'2026-11-16T11:00:00'});const W=ms=>pg.waitForTimeout(ms);
  const esc=async()=>{await pg.keyboard.press('Escape');await pg.clock.runFor(450);await W(300);};
  const TK=()=>pg.evaluate("JSON.stringify(window.__data.tasks)").then(JSON.parse);
  const leaves=Object.values(R.tasks).filter(t=>t.parent).length;ok('fixture: 3 parents, 10 steps',Object.values(R.tasks).filter(t=>t.kind==='parent').length===3&&leaves===10);
  await W(300);
  // END
  const dsub=await pg.evaluate("document.querySelector('.dsub')?.innerText");ok('header says of 62',/of 62/.test(dsub||''),dsub);
  // stack: one pile, open the full list
  const top=await pg.evaluate("[...document.querySelectorAll('#cutStack .cs-card[data-id]')].map(c=>c.dataset.id)");
  ok('top card is a parent (work first: Javelin)',top.length===1&&top[0]==='pA',JSON.stringify(top));
  await pg.evaluate(()=>__ch.openAll());await pg.clock.runFor(500);await W(500);await shot(pg,'r7_view_'+w);
  const ids=await pg.evaluate("[...document.querySelectorAll('#cutStack .ch-list > .cs-card')].map(c=>c.dataset.id)");
  ok('cards shown are parents only, never steps',ids.length>0&&ids.every(i=>/^p[ABC]$/.test(i)),JSON.stringify(ids));
  ok('at most 4 cards',ids.length<=4,ids.length);
  ok('order work, learning, linkedin',JSON.stringify(ids)==='["pA","pB","pC"]',JSON.stringify(ids));
  const est=await pg.evaluate("document.querySelector('#cutStack')?.innerText");
  ok('estimates visible (about 1 h, about 1.5 h, about 2.5 h)',/about 1 h/.test(est)&&/about 1\.5 h/.test(est)&&/about 2\.5 h/.test(est),est.replace(/\n/g,' | ').slice(0,200));
  ok('steps listed with tick boxes',(await pg.locator('#cutStack .ch-list > .cs-card').first().locator('input[type=checkbox]').count())===2);
  // day bar in hours (round 2B header)
  const bar=await pg.evaluate("document.querySelector('.dbar-focus')?.innerText.replace(/\\s+/g,' ')");
  ok('day bar shows work hours and planned',/Work 0 of 8 h/.test(bar)&&/planned 4\.8 of 8 h/.test(bar),bar);
  // ticking all of today's steps completes the card
  const cbs=pg.locator('#cutStack .ch-card:first-child input[type=checkbox]');ok('top card has 2 steps today',(await cbs.count())===2);
  await cbs.nth(0).check();await pg.clock.runFor(400);await W(400);
  let t=await TK();ok('first step ticked, parent not done yet',t.sA1.done&&!t.sA2.done&&!t.pA.done);
  await pg.locator('#cutStack .ch-card:first-child input[type=checkbox]').nth(1).click();await pg.clock.runFor(500);await W(500);
  t=await TK();ok('both steps done, other days untouched',t.sA2.done&&!t.sA3.done&&!t.sA5.done,'pA.done='+t.pA.done);
  const top2=await pg.evaluate("[...document.querySelectorAll('#cutStack .cs-card[data-id]')].map(c=>c.dataset.id)");
  ok('card is complete and the next card (learning) is on top',top2[0]==='pB',JSON.stringify(top2));
  await shot(pg,'r7_after_'+w);
  // Done on a parent card = today's steps done
  await pg.locator('#cutStack .cs-card[data-id] .cl-det').first().click();await W(300);await pg.locator('#cutStack .cs-card[data-id]').first().locator('.btn.ghost:has-text("Done")').click();await W(300);
  await pg.click('.v3-conf .btn:not(.ghost)').catch(()=>{});await pg.clock.runFor(500);await W(400);
  t=await TK();ok('Done on the card finishes its steps for today',t.sB1.done&&!t.sB2.done,JSON.stringify([t.sB1.done,t.sB2.done]));
  // Review: sprint progress counts leaves only
  await pg.click(w<700?'.m-tab:has-text("Review")':'.topnav :text("Review")');await pg.clock.runFor(500);await W(700);
  const bars=await pg.evaluate("document.querySelector('#bars .bar')?.innerText.replace(/\\s+/g,' ')");console.log('tasks bar:',bars);
  ok('sprint tasks bar counts leaves (10), not parents',/\b10\b/.test(bars)&&!/\b13\b/.test(bars),bars);
  await pg.locator('#bars .bar').nth(0).click();await W(600);await pg.locator('.ps-sheet .seg button:has-text("All")').click();await W(400);
  const na=await pg.locator('.ps-sheet .v3-trow').count();ok('All lists the 10 steps only',na===10,na);await esc();
  const wf=await pg.locator('#wfBody .v3-wft').count();ok('waterfall still shows parents only',wf===3,wf);
  // habit
  await pg.click(w<700?'.m-tab:has-text("Today")':'.topnav :text("Today")').catch(()=>{});await pg.clock.runFor(300);
  await pg.locator('.pop-card:has-text("Habits")').first().click();await pg.clock.runFor(500);await W(500);const hab=await pg.evaluate("document.body.innerText.includes('4-hour focus block first')");ok('custom habit appears in Habits',hab);await esc();
  // LinkedIn
  await pg.evaluate("window.__liOpen&&window.__liOpen()");await pg.clock.runFor(500);await W(500);
  const li=await pg.evaluate("document.querySelector('.ps-sheet')?.innerText.replace(/\\n/g,' | ')");ok('LinkedIn calendar from linkedin.json',/Personal story|Project lesson|Redesign breakdown|Off|Who you are/.test(li),li.slice(0,160));
  for(const tab of ['Pillars','Guide','Posts','Calendar']){await pg.locator('.ps-sheet .li4-tabs button:has-text("'+tab+'")').click();await W(300);}
  await shot(pg,'r7_li_'+w);
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,5));ok('no console errors at '+w,pg.errs.filter(e=>!e.includes('ERR_FAILED')).length===0);await pg.close();}});
