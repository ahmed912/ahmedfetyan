// Round 68: week view derived from records, weekly reset, history, stats, soft delete, legacy active workout still saves
const {openp,run}=require('./h.js');const {load}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const ts=s=>Date.parse(s);
const x22={v:1,date:'2026-11-22',day:0,title:'t',ex:{0:{ar:'a',en:'a'},1:{ar:'b',en:'b'},2:{ar:'c',en:'c'},3:{ar:'d',en:'d'},4:{ar:'e',en:'e'}},at:ts('2026-11-22T18:00:00')};
const G=()=>({'x_2026-11-22':x22,'x_2026-11-23':{v:1,date:'2026-11-23',day:1,title:'ضهر وباي',ex:{0:{ar:'a',en:'a'},1:{ar:'b',en:'b'}},at:ts('2026-11-23T18:00:00')},
  s_last:{day:2,title:'رجلين (تأهيل أ)',start:ts('2026-11-17T18:00:00'),end:ts('2026-11-17T18:40:00'),minutes:40,date:'2026-11-17',items:[],sets:3,planned:15,skipped:0,overMin:0}});
const seed=g=>{const d=load();d.gym=g;return JSON.stringify(d);};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const open=async(when,g)=>{const pg=await openp(b,w,{when,sb:true,real:seed(g)});pg.R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(200);};await pg.evaluate("__g5.open()");await pg.R(800);return pg;};
  const cls=(pg,p)=>pg.evaluate(`document.querySelector('.g5-week button[data-pos="${p}"]').className`);
  let pg=await open('2026-11-25T18:00:00',G());
  ok('pos0 done',/done/.test(await cls(pg,0)));ok('pos1 part',/part/.test(await cls(pg,1)));
  const c2=await cls(pg,2);ok('pos2 neither',!/done|part/.test(c2),c2);
  ok('week states',await pg.evaluate("JSON.stringify(__g5.week('2026-11-25').map(o=>o.state))")==='["done","part","none","none","none"]');
  await pg.evaluate("__g5.tab('history')");await pg.R(500);
  ok('history title starts اليوم 2: ',(await pg.textContent('.g-hist .g-h-t')).startsWith('اليوم 2: '));
  ok('history summary 2 من 5',(await pg.textContent('.g-hist summary .num')).includes('2 من 5'));
  await pg.evaluate("__g5.tab('stats')");await pg.R(500);
  ok('stats / 5',(await pg.textContent('.slp-tile b.num')).includes('/ 5'));
  ok('stats muscle chart',await pg.evaluate("!!document.querySelector('.g-mus')"));
  await pg.evaluate("__g5.tab('mission')");await pg.R(500);
  ok('mission 2/5',(await pg.textContent('.gm-w .num')).trim()==='2/5',await pg.textContent('.gm-w .num'));
  await pg.evaluate("__g5.del('x_2026-11-23')");await pg.R(800);
  ok('soft deleted, doc kept',await pg.evaluate("!!window.__data.gym['x_2026-11-23'].deleted"));
  ok('gone from sessions',await pg.evaluate("__g5.sessions().some(s=>s.id==='x_2026-11-23')===false"));
  ok('no errors p1',pg.errs.filter(x=>!x.includes('ERR_FAILED')).length===0,JSON.stringify(pg.errs.slice(0,3)));await pg.context().close();
  pg=await open('2026-11-28T09:00:00',G());
  ok('new week: nothing done',await pg.evaluate("![...document.querySelectorAll('.g5-week button')].some(b=>/done|part/.test(b.className))"));
  ok('old record still exists',await pg.evaluate("!!window.__data.gym['x_2026-11-22']"));
  ok('no errors p2',pg.errs.filter(x=>!x.includes('ERR_FAILED')).length===0);await pg.context().close();
  pg=await open('2026-11-25T18:00:00',{active:{id:'g68',day:0,startedAt:ts('2026-11-25T17:40:00'),sets:{'0-0':{done:true,at:ts('2026-11-25T17:45:00'),w:20,r:10}},alts:{},restUntil:null,restFor:null}});
  ok('legacy bar visible',await pg.isVisible('.g5-legacy'));
  await pg.click('.g5-legacy .btn');await pg.R(1500);
  ok('legacy saved as s_g68',await pg.evaluate("window.__data.gym.s_g68&&window.__data.gym.s_g68.sets===1&&!(window.__data.gym.active&&window.__data.gym.active.startedAt)"));
  ok('no errors p3',pg.errs.filter(x=>!x.includes('ERR_FAILED')).length===0,JSON.stringify(pg.errs.slice(0,3)));await pg.context().close();}
});
