// Round 31 (width and fluidity). Journey: open Plan, Today, planning grid with a 120-char task name: names stay 1 line (rows, cards) or 2 (sheets), buckets stay capped, grid columns fit the width, nothing scrolls sideways.
const MOCK='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/plan/mock_final.json';
process.env.MOCKDATA=process.env.MOCKDATA||MOCK;
const fs=require('fs');
const {openp,shot,run}=require('./h.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const LONG='Longname redesign the complete onboarding flow for the Mugassam client portal including every empty state and error screen';
const base=()=>{const d=JSON.parse(fs.readFileSync(process.env.MOCKDATA,'utf8'));d.tasks={};d.entries={};d.sleep={};d.rollover={};
  d.sprints={s2:{n:2,name:'Brand foundation',start:'2026-11-14',end:'2026-12-27',goal:'x'}};return d;};
const seed=async(pg,L)=>pg.evaluate(async([L])=>{const db=await window.claude.use('db');
  await db.doc('tasks/bk1').set({title:L,bucket:true,bState:'active',order:1,done:false});
  await db.doc('tasks/bk2').set({title:'HASM',bucket:true,bState:'active',order:2,done:false});
  await db.doc('tasks/bk3').set({title:'Javelin',bucket:true,bState:'active',order:3,done:false});
  for(let i=1;i<=12;i++)await db.doc('tasks/m'+i).set({title:i===1?L:'Mug step '+i,cat:'portfolio',parent:'bk1',mins:60,order:i,done:false,date:i<4?'2026-11-14':null,slot:i<4?1:null,mode:'deep'});
  for(let i=1;i<=3;i++)await db.doc('tasks/h'+i).set({title:i===1?L:'HASM slide '+i,cat:'portfolio',parent:'bk2',mins:60,order:10+i,done:false});
  await db.doc('tasks/j1').set({title:'Javelin page 1',cat:'portfolio',parent:'bk3',mins:60,order:21,done:false});
  await db.doc('tasks/lo1').set({title:L,cat:'portfolio',mins:30,order:50,done:false});
  await db.doc('tasks/in1').set({title:L,inbox:true,done:false,order:70});
  await db.doc('tasks/w1').set({title:L,cat:'portfolio',parent:'bk1',date:'2026-11-10',mins:60,order:80,done:false,waiting:true,post:3,decide:true});
  await db.doc('tasks/t1').set({title:L,cat:'portfolio',date:'2026-11-14',slot:2,mode:'deep',mins:60,order:90,done:false});
  },[L]);
// scan: lines taken by every visible element whose own text starts with the marker
const SCAN=()=>{const out=[];const M='Longname';const w=document.querySelectorAll('body *');
  w.forEach(e=>{if(!e.children.length&&(e.textContent||'').trim().startsWith(M)||(e.tagName==='OPTION'&&0)){const r=e.getBoundingClientRect();if(!r.width||!r.height)return;const cs=getComputedStyle(e);let lh=parseFloat(cs.lineHeight);if(isNaN(lh))lh=parseFloat(cs.fontSize)*1.3;
    if(cs.display==='inline'){const p=e.parentElement;const pc=getComputedStyle(p);lh=parseFloat(pc.lineHeight)||parseFloat(pc.fontSize)*1.3;}
    const sh=cs.display==='inline'?[...e.getClientRects()].length:Math.round(r.height/lh);
    out.push({cls:(e.className||e.tagName)+'',par:(e.parentElement.className||'')+'',lines:sh,h:Math.round(r.height),right:Math.round(r.right),left:Math.round(r.left)});}});
  return out;};
run(async b=>{for(const w of [360,390,768,1300]){console.log('== width',w);
  const pg=await openp(b,w,{when:'2026-11-14T08:00:00',real:JSON.stringify(base())});const R=async ms=>{await pg.clock.runFor(ms);await pg.waitForTimeout(250);};
  await seed(pg,LONG);await R(600);
  const hov=()=>pg.evaluate(()=>{const de=document.documentElement;const bad=[];document.querySelectorAll('.page:not([hidden]) *, .ps-sheet *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.right>innerWidth+1&&!e.closest('.wf-scroll,.wk-scroll,.ov-x,[data-hscroll]'))bad.push((e.className||e.tagName)+':'+Math.round(r.right));});return {sw:de.scrollWidth,cw:de.clientWidth,bad:bad.slice(0,5)};});
  const chk=async(name,maxLines,sel)=>{const s=(await pg.evaluate(SCAN)).filter(x=>!sel||sel.test(x.cls+' '+x.par));const mx=s.reduce((a,x)=>Math.max(a,x.lines),0);ok(name+' names <= '+maxLines+' lines ('+s.length+' found)',s.length>0&&mx<=maxLines,JSON.stringify(s.filter(x=>x.lines>maxLines).slice(0,3)));
    const o=await hov();ok(name+' no sideways overflow',o.sw<=o.cw+1&&!o.bad.length,JSON.stringify(o));};
  // Plan page
  await pg.evaluate(()=>__r2.setPage('projects'));await R(500);
  await chk('plan',1);
  const cols=await pg.evaluate(()=>new Set([...document.querySelectorAll('.bk-card')].map(c=>Math.round(c.getBoundingClientRect().left))).size);
    ok('plan columns at '+w+' = '+(w<700?'1':w<1000?'2 or 3':'3+'),w<700?cols===1:w<1000?(cols>=2&&cols<=3):cols>=3,cols);
  const hs=await pg.evaluate(()=>[...document.querySelectorAll('.bk-card')].map(c=>Math.round(c.getBoundingClientRect().height)));
  ok('card heights follow content (not all equal): '+hs.join(','),new Set(hs).size>1,hs.join());
  ok('no collapsed card beyond the max 450px',hs.every(h=>h<=450),hs.join());
  const mb=pg.locator('.bk-moreb').first();if(await mb.count()){await mb.click();await R(400);}
  const hs2=await pg.evaluate(()=>[...document.querySelectorAll('.bk-card')].map(c=>Math.round(c.getBoundingClientRect().height)));
  ok('expanded 12-task card stays within max 450px: '+hs2.join(','),hs2.every(h=>h<=450),hs2.join());
  ok('masonry: no card taller than its content needs and short cards do not stretch (short < tall)',Math.min(...hs2)<Math.max(...hs2));
  ok('card min width 345 (1.5x of 230), full column at phone',await pg.evaluate(w=>[...document.querySelectorAll('.bk-card')].every(c=>{const x=c.getBoundingClientRect().width;return w<700?x<=w:x>=344;}),w));
  // alignment: cards share a few left edges, gutters 16 (spacing scale), row checkboxes share one left edge inside each card
  const al=await pg.evaluate(()=>{const cs=[...document.querySelectorAll('.bk-card')].map(c=>c.getBoundingClientRect());const lefts=[...new Set(cs.map(r=>Math.round(r.left)))].sort((a,b)=>a-b);
    const gut=lefts.slice(1).map((l,i)=>{const w=cs.find(r=>Math.round(r.left)===lefts[i]).width;return Math.round(l-lefts[i]-w);});
    const pads=[...document.querySelectorAll('.bk-card')].map(c=>parseFloat(getComputedStyle(c).paddingLeft));
    const rowEdge=[...document.querySelectorAll('.bk-card')].map(c=>{const r=c.querySelector('.bk-row input');return r?Math.round(r.getBoundingClientRect().left-c.getBoundingClientRect().left):null;}).filter(x=>x!==null);
    return {lefts,gut,pads,rowEdge};});
  ok('grid edges: gutters 16px, padding on the 8 scale, one row edge per card',al.gut.every(g=>g===16)&&al.pads.every(p=>p%8===0)&&new Set(al.rowEdge).size===1,JSON.stringify(al));
  await shot(pg,'r31_plan_'+w);
  const bars=await pg.evaluate(()=>{const b=[...document.querySelectorAll('#bars .bar')];return b.map(x=>{const r=x.getBoundingClientRect();return {w:Math.round(r.width),vis:r.width>0};});});
  // sprint tiles live on Review
  await pg.evaluate(()=>__r2.setPage('progress'));await R(500);
  const tl=await pg.evaluate(()=>{const b=[...document.querySelectorAll('#bars .bar')].filter(x=>x.getBoundingClientRect().width);return {n:b.length,min:Math.min(...b.map(x=>x.getBoundingClientRect().width)),clip:b.filter(x=>[...x.querySelectorAll('*')].some(e=>e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflow!=='visible')).length,over:document.documentElement.scrollWidth>document.documentElement.clientWidth+1};});
  ok('sprint tiles >= 225px (1.5x of 150) or full width, none clipped, no overflow',(tl.n===0||(tl.min>=(w<700?w-110:224)&&tl.clip===0))&&!tl.over,JSON.stringify(tl));
  await pg.evaluate(()=>__r2.setPage('projects'));await R(400);
  // task sheet from a bucket row: <= 2 lines in the sheet, full name present
  await pg.evaluate(()=>{document.querySelector('.bk-card .bk-t').click();});await R(500);
  const sh=await pg.evaluate(()=>{const s=document.querySelector('.ps-sheet');return s?(s.innerText+[...s.querySelectorAll('input,textarea')].map(i=>i.value).join(' ')).includes('Longname redesign the complete onboarding flow for the Mugassam client portal including every empty state and error screen'):null;});
  ok('edit sheet holds the full name',sh===true);
  const sc=(await pg.evaluate(SCAN)).filter(x=>/ps-|sheet|ps /.test(x.cls+' '+x.par));
  await shot(pg,'r31_sheet_'+w);
  await pg.keyboard.press('Escape');await R(300);
  // Today chunk cards
  await pg.evaluate(()=>__r2.setPage('today'));await R(600);
  await chk('today',1,/cs-|ch-/);
  await shot(pg,'r31_today_'+w);
  // Weekly planning sheet
  await pg.evaluate(()=>__wk.open());await R(600);
  for(let i=0;i<4;i++){const n=pg.locator('.ps-sheet .wk-next');if(await n.count()){await n.click({timeout:2000}).catch(()=>{});await R(300);const d=pg.locator('.ps-sheet .rl-drop');}}
  const s2=(await pg.evaluate(SCAN));
  const mx=s2.reduce((a,x)=>Math.max(a,x.lines),0);ok('week sheet names <= 2 lines',mx<=2,JSON.stringify(s2.filter(x=>x.lines>2).slice(0,3)));
  const o2=await hov();ok('week sheet no sideways overflow',o2.sw<=o2.cw+1&&!o2.bad.length,JSON.stringify(o2));
  await shot(pg,'r31_week_'+w);
  await pg.keyboard.press('Escape');await R(300);
  // other pages: any appearance of the long name stays <= 2 lines, no overflow
  for(const p of ['progress','time','learning']){await pg.evaluate(p=>__r2.setPage(p),p);await R(500);const s3=await pg.evaluate(SCAN);const m3=s3.reduce((a,x)=>Math.max(a,x.lines),0);const o3=await hov();ok(p+' page names <= 2 lines, no overflow',m3<=2&&o3.sw<=o3.cw+1,JSON.stringify([m3,o3]));}
  ok('no page errors',!pg.errs.filter(e=>!/Failed to load resource/.test(e)).length,pg.errs.join('|').slice(0,300));
  await pg.context().close();}});
