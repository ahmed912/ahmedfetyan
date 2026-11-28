// Round 88: board design (type scale, fills, wires, zoom)
const {openp,run}=require('./h.js');const {load}=require('./dmlib.js');
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
function fx(){const d=load();d.plans=d.plans||{};delete d.plans['rm-board'];
 Object.assign(d.tasks,{
  rmB1:{title:"RM Work proj",bucket:true,cat:"portfolio",bState:"active",done:false,order:1},
  rmB2:{title:"RM Brand proj",bucket:true,cat:"brand",bState:"active",done:false,order:2},
  rmB3:{title:"RM Misc",bucket:true,bState:"active",done:false,order:3},
  rmT1:{title:"rm t1",parent:"rmB1",due:"2026-11-19",date:null,done:false,order:1},
  rmT2:{title:"rm t2",parent:"rmB1",due:"2026-11-17",date:null,done:false,order:2},
  rmT3:{title:"rm t3",parent:"rmB2",date:null,done:false,order:3},
  rmT4:{title:"rm t4",parent:"rmB1",done:true,order:5},
  rmS1:{title:"rm sprint",sprint:1,date:"2026-11-19",done:false,order:4}});return d;}
run(async b=>{for(const w of [1300,390]){console.log('== width',w);
  const pg=await openp(b,w,{h:w===390?800:900,scheme:'dark',when:'2026-11-19T11:00:00',real:JSON.stringify(fx()),rm44:1});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  await pg.evaluate("__r2.setPage('roadmap')");await R(800);
  if(w===390){ok('phone 7 cols',await pg.locator('.rm-hgrid').first().evaluate(g=>getComputedStyle(g).gridTemplateColumns.split(' ').length)===7);continue;}
  await pg.locator('.rm-donec').first().click();await R(500);
  const r=await pg.evaluate(()=>{
    const cs=(s,p)=>{const e=document.querySelector(s);return e?getComputedStyle(e)[p]:null;};
    const lum=c=>{const m=c.match(/[\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2]);};
    const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
    const comp=(fg,bg)=>{const f=fg.match(/[\d.]+/g).map(Number),g=bg.match(/[\d.]+/g).map(Number),a=f.length>3?f[3]:1;return 'rgb('+[0,1,2].map(i=>Math.round(f[i]*a+g[i]*(1-a))).join(',')+')';};
    const role=s=>cs(s,'fontSize')+'/'+cs(s,'fontWeight');
    const roles=['.rm-pname','.rm-bname','.rm-tt','.rm-tag','.rm-hday'].map(role);
    const cbg=cs('.rm-canvas','backgroundColor');
    const w300=[...document.querySelectorAll('[class*="rm-"]')].filter(e=>getComputedStyle(e).fontWeight==='300').length;
    const hd=document.querySelector('.rm-hday');
    return {pn:[cs('.rm-pname','fontSize'),cs('.rm-pname','fontWeight'),cs('.rm-pname','lineHeight')],bn:role('.rm-bname'),tt:role('.rm-tt'),tag:role('.rm-tag'),more:role('.rm-more'),hday:role('.rm-hday'),cnt:role('.rm-cnt'),tab:[cs('.rm-hday','fontVariantNumeric'),cs('.rm-cnt','fontVariantNumeric')],
      uniq:new Set(roles.concat([role('.rm-cnt')])).size,w300,
      pbg:cs('.rm-parent','backgroundColor'),pbl:cs('.rm-parent','borderLeftWidth'),
      bbg:cs('.rm-branch[data-bid="rmB1"]','backgroundColor'),blw:cs('.rm-branch[data-bid="rmB1"]','borderLeftWidth'),prad:cs('.rm-parent','borderTopLeftRadius'),pw:document.querySelector('.rm-prog[data-bid="rmB1"] span').style.width,p:document.querySelector('.rm-branch[data-bid="rmB1"]').style.getPropertyValue('--p'),
      c1:ratio(cs('.rm-pname','color'),comp(cs('.rm-parent','backgroundColor'),cbg)),c2:ratio(cs('.rm-tt','color'),cbg),c3:ratio(cs('.rm-tag','color'),cbg),
      dchk:cs('.rm-task.done .rm-check','backgroundColor'),dtt:cs('.rm-task.done .rm-tt','color'),tod:cs('.rm-hday.today','boxShadow'),
      w1:cs('.rm-wires path.rm-w1','strokeWidth')};});
  ok('t1 22/500/28',r.pn.join()==='22px,500,28px',r.pn);
  ok('t2 16/500',r.bn==='16px/500',r.bn);ok('t3 14/400',r.tt==='14px/400',r.tt);
  ok('t4 12/400',r.tag==='12px/400'&&(r.more===null||r.more==='12px/400'),r.tag+' '+r.more);
  ok('t5 11/500 tabular',r.hday==='11px/500'&&r.cnt==='11px/500'&&/tabular/.test(r.tab.join()),r.hday+' '+r.cnt+' '+r.tab);
  ok('5 type roles',r.uniq===5,r.uniq);ok('no weight 300',r.w300===0,r.w300);
  ok('parent pill filled+outline',!/rgba\(0, 0, 0, 0\)|transparent/.test(r.pbg)&&r.pbl==='1px'&&r.prad!=='0px',r.pbg+r.pbl+r.prad);
  ok('branch card 33% meter',r.bbg==='rgb(14, 14, 14)'&&r.blw==='4px'&&r.p==='33%'&&r.pw==='33%',[r.bbg,r.blw,r.p,r.pw]);
  ok('contrast',r.c1>=7&&r.c2>=4.5&&r.c3>=3,[r.c1,r.c2,r.c3]);
  ok('done check+text',!/rgba\(0, 0, 0, 0\)/.test(r.dchk)&&r.dtt==='rgb(134, 139, 149)',r.dchk+r.dtt);
  ok('today ring',/201, 169, 120/.test(r.tod),r.tod);
  ok('wire 1.5px',r.w1==='1.5px',r.w1);
  await pg.evaluate("__rm.zoom(0,0,.4)");await R(300);
  let z=await pg.evaluate("[document.getElementById('rmCanvas').dataset.zoom,getComputedStyle(document.querySelector('#rmCanvas .rm-tree')).opacity]");
  ok('far zoom hides tree',z[0]==='far'&&z[1]==='0',z);
  await pg.screenshot({path:'v3/shots/r88-far.png'});
  await pg.evaluate("__rm.zoom(0,0,1)");await R(300);
  z=await pg.evaluate("[document.getElementById('rmCanvas').dataset.zoom,getComputedStyle(document.querySelector('#rmCanvas .rm-tree')).opacity]");
  ok('near zoom shows tree',z[0]==='near'&&z[1]==='1',z);
  await pg.screenshot({path:'v3/shots/r88-1.png'});
  await pg.evaluate("__rm.fit()");await R(300);await pg.screenshot({path:'v3/shots/r88-fit.png'});
  ok('no page errs',!pg.errs.some(x=>!/Failed to load resource/.test(x)),pg.errs[0]);
}});
