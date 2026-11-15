// Round 48: what you type or change shows at once. Times (AM/PM), rename, status and order repaint without closing the sheet or leaving the screen
const fs=require('fs');const {openp,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const today='2026-11-09';
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.entries=d.entries||{};
  const t0=new Date(today+'T09:00:00').getTime(),H=3600000;
  d.entries[today]={date:today,items:[{id:'e1',kind:'manual',ref:'other',label:'Probe work',cat:'portfolio',note:'x',start:t0,end:t0+H,minutes:60,paused:0,sessions:[{start:t0,end:t0+H,minutes:60,paused:0}]}]};
  d.tasks=d.tasks||{};d.tasks.r48a={title:'Alpha r48',date:today,cat:'portfolio',done:false,order:1,sprint:1};d.tasks.r48b={title:'Beta r48',date:today,cat:'portfolio',done:false,order:2,sprint:1};return d;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{sb:true,real:JSON.stringify(base())});const W=ms=>pg.waitForTimeout(ms);
  await pg.clock.runFor(1500);
  await pg.evaluate(`window.__v21edit('${today}','e1')`);await pg.clock.runFor(800);await W(300);
  const inp=pg.locator('.ps-sheet input[aria-label="Session end"]'),len=()=>pg.locator('.ps-sheet .lh-tab td.num').innerText();
  await inp.click();await inp.fill('8 pm');
  ok('typed value shows',(await inp.inputValue())==='8 pm');
  await pg.locator('.ps-sheet input[aria-label="Name"]').click();await pg.clock.runFor(300);
  ok('PM shows as 8:00 PM and the length updates at once',(await inp.inputValue())==='8:00 PM'&&(await len())==='11h',(await inp.inputValue())+' '+(await len()));
  await inp.click();await inp.fill('9:30 am');await pg.locator('.ps-sheet input[aria-label="Name"]').click();await pg.clock.runFor(300);
  ok('AM toggle shows 9:30 AM and 30m',(await inp.inputValue())==='9:30 AM'&&(await len())==='30m',(await inp.inputValue())+' '+(await len()));
  await inp.click();await inp.fill('10:30 pm');await pg.locator('.ps-sheet input[aria-label="Name"]').click();await pg.clock.runFor(300);
  ok('back to PM shows 10:30 PM',(await inp.inputValue())==='10:30 PM',await inp.inputValue());
  await pg.keyboard.press('Escape');await pg.clock.runFor(500);
  // edits made while an inline edit or gesture holds the screen repaint when it ends
  await pg.evaluate("__r2.setPage('today')");await pg.clock.runFor(600);await W(200);
  const txt=()=>pg.evaluate("document.body.innerText");
  ok('both tasks show on Today',/Alpha r48/.test(await txt())&&/Beta r48/.test(await txt()));
  await pg.evaluate("window.__sbEditing=true;window.__u48.patchTask('r48a',{title:'Renamed r48'})");await pg.clock.runFor(300);
  await pg.evaluate("window.__sbEditing=false");await pg.clock.runFor(300);await W(200);
  ok('rename shows as soon as the edit ends',/Renamed r48/.test(await txt()));
  const pos=async()=>{const t=await txt();return [t.indexOf('Renamed r48'),t.indexOf('Beta r48')];};
  await pg.evaluate("window.__sbDragging=true;window.__u48.patchTask('r48a',{order:9});window.__u48.patchTask('r48b',{order:0})");await pg.clock.runFor(200);
  await pg.evaluate("window.__sbDragging=false");await pg.clock.runFor(400);await W(200);
  const [a,bb]=await pos();ok('reorder shows at once after the gesture',a>=0&&bb>=0&&bb<a,a+' '+bb);
  const before=await txt();
  await pg.evaluate("window.__sbEditing=true;window.__u48.setDone('r48b',true)");await pg.evaluate("window.__sbEditing=false");await pg.clock.runFor(400);await W(200);
  ok('status change shows at once',(await txt())!==before,'unchanged');
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,4));await pg.context().close();}
});
