// Round 82: next-prayer countdown chip + 10-minute heads-up (toast once, dedupe, midnight rollover, both layouts)
const {openp,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const times=(pg,ymd)=>pg.evaluate(`(()=>{const P=adhan.CalculationMethod.Egyptian();P.madhab=adhan.Madhab.Shafi;P.methodAdjustments={...P.methodAdjustments,dhuhr:0};
  const t=new adhan.PrayerTimes(new adhan.Coordinates(30.0444,31.2357),new Date(${ymd[0]},${ymd[1]-1},${ymd[2]},12),P);return {fajr:t.fajr.getTime(),asr:t.asr.getTime(),isha:t.isha.getTime()};})()`);
const iso=ms=>{const d=new Date(ms),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const p0=await openp(b,w,{when:'2026-11-19T09:00:00'});const T=await times(p0,[2026,11,19]);const T2=await times(p0,[2026,11,20]);await p0.context().close();
  const pg=await openp(b,w,{when:iso(T.asr-12*60000)});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(150));
  await pg.evaluate("window.__toasts=[];new MutationObserver(()=>{const t=document.getElementById('toast');if(t.classList.contains('show'))window.__toasts.push(t.textContent)}).observe(document.getElementById('toast'),{attributes:true,childList:true,characterData:true,subtree:true})");
  const chip=()=>pg.locator('#pcChip').innerText();
  const n=()=>pg.evaluate("window.__toasts.filter(x=>/^Asr in \\d+ min$/.test(x)).length");
  await R(500);
  let t=await chip();ok('chip shows Asr 12 min',/^Asr 1[23] min$/.test(t),t);
  ok('chip visible',await pg.locator('#pcChip').isVisible());
  ok('no toast at 12 min',(await n())===0);
  await R(3*60000);
  t=await chip();ok('chip at 9 min',/^Asr 9 min$/.test(t)||/^Asr 8 min$/.test(t),t);
  ok('toast once',(await n())===1,await n());
  await R(4*60000);
  ok('toast not repeated',(await n())===1);
  ok('dedupe key stored',await pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('sb-pc-seen')||'{}')).length")===1);
  const bx=await pg.locator('#pcChip').boundingBox();ok('chip in viewport',bx&&bx.x>=0&&bx.x+bx.width<=w&&bx.y>=0);
  await pg.screenshot({path:'v3/shots/r82-'+w+'.png'});
  // hour format
  const pg2=await openp(b,w,{when:iso(T.asr-72*60000)});await pg2.waitForTimeout(200);
  t=await pg2.locator('#pcChip').innerText();ok('hour format',/^Asr 1:1[23] h$/.test(t),t);await pg2.context().close();
  // midnight rollover: after Isha, next is Fajr
  const pg3=await openp(b,w,{when:'2026-11-19T23:50:00'});await pg3.waitForTimeout(200);
  t=await pg3.locator('#pcChip').innerText();ok('after Isha shows Fajr',/^Fajr \d+:\d\d h$/.test(t),t);
  await pg3.context().close();
  const pg4=await openp(b,w,{when:'2026-11-20T00:10:00'});await pg4.waitForTimeout(200);
  t=await pg4.locator('#pcChip').innerText();ok('Fajr after midnight',/^Fajr \d+:\d\d h$/.test(t),t);await pg4.context().close();
  ok('no errors',pg.errs.filter(x=>!/ERR_FAILED/.test(x)).length===0,pg.errs.join('|'));
  await pg.context().close();}});
