// Round 33 (counts). Journey: open Review: Sprint progress and the waterfall count live milestones only; archived diet docs appear only under Show archived.
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/liveapply/final.json';
process.env.MOCKDATA=MOCK;
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-14T08:00:00'});const W=ms=>pg.waitForTimeout(ms);
  await pg.click(w<700?'.m-tab:has-text("Review")':'.topnav :text("Review")');await pg.clock.runFor(500);await W(700);
  const bars=(await pg.locator('#bars').innerText()).replace(/\s+/g,' ');console.log(bars.slice(0,200));
  const m=bars.match(/Tasks done\s*(\d+)\s*\/\s*(\d+)/i)||bars.match(/Tasks[^0-9]*(\d+)\s*\/\s*(\d+)/i);
  const m2=bars.match(/(\d+)% (\d+) of (\d+) in active buckets/);ok('Tasks done is a calm percentage over live milestones only (about 24, not 114)',!!m2&&+m2[3]>=20&&+m2[3]<=30&&+m2[1]===0,bars.slice(0,120));
  const rows=async()=>pg.evaluate(()=>document.querySelectorAll('#wfBody .v3-wft').length);
  ok('default view is By bucket, collapsed: one row per bucket, no task list',(await pg.locator('#wfBody .wf-bk').count())>=3&&(await pg.locator('#wfBody .wf-bk').count())<=14&&(await rows())===0,(await pg.locator('#wfBody .wf-bk').count())+' '+(await rows()));
  await pg.locator('#wfBody .wf-bkb').first().click();await pg.clock.runFor(300);await W(300);ok('tap a bucket expands its tasks (max 5 then n more)',(await rows())>=1&&(await rows())<=5,await rows());
  await pg.locator('#wfBody button:has-text("By day")').click();await pg.clock.runFor(300);await W(400);
  const r0=await rows();ok('waterfall lists live rows only by default (about 28)',r0>=24&&r0<=34,r0);
  const btn=pg.locator('#wfBody button:has-text("Show archived")');ok('Show archived toggle exists',(await btn.count())===1);
  await btn.click();await pg.clock.runFor(400);await W(500);
  const r1=await rows();ok('Show archived adds the diet docs',r1>r0+20,r0+' -> '+r1);
  await shot(pg,'r33_wf_'+w);
  await pg.locator('#wfBody button:has-text("Hide archived")').click();await pg.clock.runFor(300);await W(300);
  // focus: pause a bucket, it leaves Review counts and sits on the Later shelf
  
  await pg.evaluate(async()=>{const db=await window.claude.use('db');await db.doc('tasks/v4-p-mugassam').update({bState:'paused'});});await pg.clock.runFor(600);await W(400);
  const after=(await pg.locator('#bars').innerText()).match(/of (\d+) in active/);
  ok('Review counts only active buckets (fewer after pausing Mugassam)',after&&+after[1]<24,after&&after[0]);
  await pg.evaluate(()=>__r2.setPage('projects'));await pg.clock.runFor(500);await W(400);
  ok('Plan shows a quiet Later shelf, no paused card',(await pg.locator('#bucketSec .bk-later-h').count())===1&&(await pg.locator('#bucketSec .bk-card.paused').count())===0);
  ok('no page errors',!pg.errs.filter(e=>!/Failed to load resource/.test(e)).length,pg.errs.join('|').slice(0,300));
  await pg.context().close();}});
