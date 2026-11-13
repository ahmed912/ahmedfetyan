// Time entries: each row is exactly name, duration, time; no coloured bar, dot or divider. Tap opens edit.
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?' '+x:''));if(!c)process.exitCode=1;};
run(async b=>{for(const w of [390,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-05T21:00:00'});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(200);};
  await pg.click('.pop-card:has-text("Time")');await R(900);
  const rows=pg.locator('#entList li.ent.v3-ent:not(.ev)');const c=await rows.count();ok('rows exist',c>=2,c);
  for(let i=0;i<c;i++){const r=rows.nth(i);
    const v=await r.evaluate(e=>{const vis=x=>{const s=getComputedStyle(x);return s.display!=='none'&&s.visibility!=='hidden'&&x.getBoundingClientRect().width>0;};
      const texts=[...e.querySelectorAll('.ent-label,.ent-dur,.ent-when')].filter(vis).map(x=>x.textContent.trim()).filter(Boolean);
      const leaf=[...e.querySelectorAll('*')].filter(vis).filter(x=>!x.children.length&&x.textContent.trim());
      const cs=getComputedStyle(e),bars=[...e.querySelectorAll('.ent-dot,.tb-sess')].filter(vis).length;
      const pseudo=[...e.querySelectorAll('.sess-btn')].some(x=>getComputedStyle(x,'::after').display!=='none'&&getComputedStyle(x,'::after').content!=='none'&&getComputedStyle(x,'::after').backgroundColor!=='rgba(0, 0, 0, 0)');
      return {texts,leaf:leaf.length,bars,pseudo,bb:cs.borderBottomWidth,bl:cs.borderLeftWidth,over:e.scrollWidth>e.clientWidth+1};});
    ok('row '+i+' has name, duration, time only',v.texts.length===3&&v.leaf===3,JSON.stringify(v.texts));
    ok('row '+i+' no bar/dot/divider/overflow',v.bars===0&&!v.pseudo&&v.bb==='0px'&&v.bl==='0px'&&!v.over);
    ok('row '+i+' time looks like a time',/\d{1,2}:\d{2}.* to .*\d{1,2}:\d{2}/.test(v.texts[0]||''),v.texts[0]);}
  await shot(pg,'r17_'+w);
  {const bb=await rows.nth(1).boundingBox(),y=bb.y+bb.height/2;
   await pg.mouse.move(bb.x+40,y);await pg.mouse.down();await pg.clock.runFor(700);await pg.mouse.up();await R(300);
   await pg.keyboard.press('Escape');await R(300);
   await pg.mouse.move(bb.x+bb.width*0.8,y);await pg.mouse.down();for(let i=1;i<=8;i++)await pg.mouse.move(bb.x+bb.width*0.8-200*i/8,y+1);await pg.mouse.up();await R(400);
   await pg.keyboard.press('Escape');await R(300);
   ok('hold and swipe leave the rows intact',(await rows.count())===c);}
  await rows.first().click({position:{x:20,y:10}});await R(500);
  ok('tap opens the edit sheet',(await pg.locator('.ps-sheet:has-text("Delete entry")').count())===1);
  ok('no page errors',pg.errs.filter(x=>!/ERR_FAILED/.test(x)).length===0,pg.errs.filter(x=>!/ERR_FAILED/.test(x)).join('|'));}});
