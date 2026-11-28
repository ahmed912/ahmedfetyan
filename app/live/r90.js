// Round 90: roadmap layout, no overlaps, Today lane first, fit
process.env.MOCKDATA=process.env.MOCKDATA||__dirname+'/../cut/real.json';
const {openp,run}=require('./h.js');const {load}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
function fx(){const d=load();d.plans=d.plans||{};delete d.plans['rm-board'];let o=1;
 const B=(id,title,extra)=>{d.tasks[id]=Object.assign({title,bucket:true,bState:"active",done:false,order:o++},extra||{});};
 B('b1','HASM website',{cat:'client',bStart:'2026-11-01',bEnd:'2026-12-20'});B('b2','Javelin pitch',{cat:'client',bState:'paused'});B('b3','Real estate leads');
 B('b4','Mugassam studio');B('b5','Reviews with a very long branch name that must stay on one line');B('b6','Client onboarding',{bState:'done'});
 B('b7','Personal brand');B('b8','LinkedIn posts');B('b9','English course');B('b10','Misc errands');
 let n=0;for(const b of ['b1','b1','b1','b1','b1','b2','b2','b3','b4','b4','b5','b6','b7','b7','b8','b9','b10','b10','b10'])
  d.tasks['t'+(n++)]={title:'Task '+n+' with a fairly long title to wrap around the row '+n,parent:b,done:n%7===0,order:n,due:n%5===0?'2026-11-28':null};
 d.tasks.tt1={title:'Due today A',cat:'setup',due:'2026-11-28',date:'2026-11-28',done:false,order:900};
 d.tasks.tt2={title:'Late B',cat:'setup',due:'2026-11-20',date:'2026-11-20',done:false,order:901};
 return d;}
const BOX='.rm-parent,.rm-tparent,.rm-hparent,.rm-branch,.rm-tbranch,.rm-hb,.rm-tree li,.rm-addb,.rm-hadd,.rm-newp,.rm-hgrid,.rm-hnav';
run(async b=>{for(const w of [1300,1024]){console.log('== width',w);
  const pg=await openp(b,w,{h:900,when:'2026-11-28T11:00:00',real:JSON.stringify(fx()),rm44:1});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  await pg.evaluate("__r2.setPage('roadmap')");await R(1000);
  const boxes=async()=>pg.evaluate(sel=>{const wr=document.getElementById('rmWorld');const out=[];wr.querySelectorAll(sel).forEach(e=>{if(e.closest('.rm-tree')&&e.tagName!=='LI')return;if(e.tagName==='LI'&&e.parentElement.classList.contains('rm-tree')===false)return;
    out.push({n:(e.className||e.tagName)+'|'+(e.textContent||'').slice(0,18),x:e.offsetLeft+(e.tagName==='LI'?e.parentElement.offsetLeft:0),y:e.offsetTop+(e.tagName==='LI'?e.parentElement.offsetTop:0),w:e.offsetWidth,h:e.offsetHeight});});
    return {out,cw:wr.parentElement.clientWidth};},BOX);
  const {out}=await boxes();
  ok('has boxes '+out.length,out.length>30);
  let bad=[];for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++){const a=out[i],c=out[j];
    if(a.x<c.x+c.w-2&&c.x<a.x+a.w-2&&a.y<c.y+c.h-2&&c.y<a.y+a.h-2)bad.push(a.n+JSON.stringify([a.x,a.y,a.w,a.h])+' X '+c.n+JSON.stringify([c.x,c.y,c.w,c.h]));}
  {const pn=await pg.evaluate("[...document.querySelectorAll('#rmWorld .rm-panel')].map(e=>({x:e.offsetLeft,y:e.offsetTop,w:e.offsetWidth,h:e.offsetHeight}))");let pb=0;
   for(let i=0;i<pn.length;i++)for(let j=i+1;j<pn.length;j++){const a=pn[i],b=pn[j];if(a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h)pb++;}
   ok('no panel overlaps '+pn.length,pn.length>3&&pb===0,pb);
   const tx=await pg.evaluate("(()=>{const r=[...document.querySelectorAll('#rmWorld .rm-node,#rmWorld .rm-tree')].map(e=>e.getBoundingClientRect()).filter(q=>q.width>0);let n=0;for(let i=0;i<r.length;i++)for(let j=i+1;j<r.length;j++){const a=r[i],b=r[j];if(a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1)n++;}return n;})()");
   ok('no node or task column overlaps',tx===0,tx);}
  ok('no overlaps',bad.length===0,bad.slice(0,4).join(' ; '));
  ok('none negative',out.every(o=>o.x>=0&&o.y>=0));
  const tops=await pg.evaluate("[...document.querySelectorAll('#rmWorld .rm-parent,#rmWorld .rm-tparent,#rmWorld .rm-hparent')].map(e=>[e.className.split(' ')[1],e.offsetTop])");
  ok('today first',tops[0][0]==='rm-tparent'&&tops.every(t=>t[1]>=tops[0][1]),JSON.stringify(tops));
  ok('today text',(await pg.locator('.rm-tparent').innerText()).trim()==='Today'&&(await pg.locator('.rm-tbranch').allInnerTexts()).some(x=>x.includes('Work'))&&await pg.locator('.rm-ttree .rm-addt').count()>=2);
  const pm=await pg.evaluate("['b1','b7','b8','b9','b10','b4','b5'].map(i=>__rm.parentOf(i)).join()");
  ok('mapping',pm==='work,brand,brand,learning,others,work,work',pm);
  ok('pill one line',await pg.evaluate("[...document.querySelectorAll('.rm-branch,.rm-tbranch')].every(e=>e.offsetHeight<=72)"));
  ok('paused text',await pg.locator('.rm-status',{hasText:'Paused'}).count()===1&&await pg.locator('.rm-status',{hasText:'Finished'}).count()===1);
  const v=await pg.evaluate('__rm.view()');ok('fit k>=0.8',v.k>=0.8,JSON.stringify(v));
  const t=await pg.locator('.rm-tparent').boundingBox(),tb=await pg.locator('.rm-tbranch').first().boundingBox(),cv=await pg.locator('#rmCanvas').boundingBox();
  ok('anchored top-left',t.x-cv.x<80&&tb.y-cv.y<260&&t.x>=cv.x&&tb.y>=cv.y&&t.y-cv.y<500,JSON.stringify([t,cv]));
  await pg.screenshot({path:__dirname+'/shots/r90-fit-'+w+'.png'});
  await pg.evaluate("(()=>{const c=document.getElementById('rmCanvas'),r=c.getBoundingClientRect();})()");
  await pg.mouse.move(300,300);await pg.keyboard.down('Control');await pg.mouse.wheel(0,-15);await pg.keyboard.up('Control');await R(300);
  const v2=await pg.evaluate('__rm.view()');
  await pg.screenshot({path:__dirname+'/shots/r90-z-'+w+'.png'});
  ok('zoom works',v2.k>v.k);
  await pg.mouse.wheel(0,820);await R(300);await pg.screenshot({path:__dirname+'/shots/r90-b-'+w+'.png'});await pg.mouse.wheel(0,900);await R(300);await pg.screenshot({path:__dirname+'/shots/r90-c-'+w+'.png'});await pg.mouse.wheel(0,800);await R(300);await pg.screenshot({path:__dirname+'/shots/r90-d-'+w+'.png'});
  const er=pg.errs.filter(x=>!/Failed to load resource/.test(x));ok('no errors',er.length===0,er.join('|'));
  await pg.context().close();}});
