// shot: roadmap layout, no overlaps, Today lane first, fit
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
run(async b=>{for(const th of ['light','dark']){console.log('== theme',th);
  const pg=await openp(b,1600,{h:2400,when:'2026-11-28T11:00:00',real:JSON.stringify(fx()),rm44:1});
  const R=ms=>pg.clock.runFor(ms).then(()=>pg.waitForTimeout(250));
  await pg.evaluate("__r2.setPage('roadmap')");await R(1000);
  const boxes=async()=>pg.evaluate(sel=>{const wr=document.getElementById('rmWorld');const out=[];wr.querySelectorAll(sel).forEach(e=>{if(e.closest('.rm-tree')&&e.tagName!=='LI')return;if(e.tagName==='LI'&&e.parentElement.classList.contains('rm-tree')===false)return;
    out.push({n:(e.className||e.tagName)+'|'+(e.textContent||'').slice(0,18),x:e.offsetLeft+(e.tagName==='LI'?e.parentElement.offsetLeft:0),y:e.offsetTop+(e.tagName==='LI'?e.parentElement.offsetTop:0),w:e.offsetWidth,h:e.offsetHeight});});
    return {out,cw:wr.parentElement.clientWidth};},BOX);
  
await pg.evaluate("document.documentElement.dataset.theme='"+th+"'");
await pg.evaluate("document.getElementById('rmWorld').style.transform='translate(20px,10px) scale(1)'");await pg.waitForTimeout(400);
const data=await pg.evaluate(()=>{const out=[];const w=document.getElementById('rmWorld');
 w.querySelectorAll('*').forEach(e=>{if(e.closest('svg'))return;let own='';e.childNodes.forEach(n=>{if(n.nodeType===3)own+=n.textContent.trim();});if(!own)return;
  const r=e.getBoundingClientRect();if(r.width<4||r.height<4||r.top<0||r.bottom>innerHeight||r.left<0||r.right>innerWidth)return;const cs=getComputedStyle(e);
  out.push({t:own.slice(0,28),c:cs.color,fs:parseFloat(cs.fontSize),fw:cs.fontWeight,op:parseFloat(cs.opacity),x:r.left,y:r.top,w:r.width,h:r.height,cls:e.className.toString().slice(0,30)});});
 const names=[...document.querySelectorAll('#rmWorld button,#rmWorld [role=button],#rmWorld input')].filter(e=>!(e.getAttribute('aria-label')||e.textContent.trim()||e.placeholder)).length;
 const small=[...document.querySelectorAll('#rmWorld .rm-check')].map(e=>{const r=e.getBoundingClientRect();return Math.round(Math.min(r.width,r.height));});
 return {out,names,small:small.slice(0,3)};});
await pg.addStyleTag({content:'#rmWorld *{color:transparent!important;text-shadow:none!important;-webkit-text-fill-color:transparent!important}'});await pg.waitForTimeout(200);
const buf=await pg.screenshot();
const pix=await pg.evaluate(async b64=>{const im=new Image();im.src='data:image/png;base64,'+b64;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);return {w:im.width,h:im.height,d:Array.from(x.getImageData(0,0,im.width,im.height).data)};},buf.toString('base64'));
const img={width:pix.w,height:pix.h,data:pix.d};
const px=(x,y)=>{x=Math.max(0,Math.min(img.width-1,Math.round(x)));y=Math.max(0,Math.min(img.height-1,Math.round(y)));const i=(img.width*y+x)*4;return [img.data[i],img.data[i+1],img.data[i+2]];};
const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]);};
const bad=[];let n=0,min=99;
for(const d of data.out){const m=d.c.match(/[\d.]+/g).map(Number);const a=m[3]===undefined?1:m[3];
 const pts=[[d.x+2,d.y+2],[d.x+d.w-2,d.y+2],[d.x+2,d.y+d.h-2],[d.x+d.w-2,d.y+d.h-2],[d.x+d.w/2,d.y+1],[d.x+d.w/2,d.y+d.h-1]].map(p=>px(p[0],p[1]));
 const bg=[0,1,2].map(k=>pts.map(p=>p[k]).sort((a,b)=>a-b)[3]);
 const al=a*(isNaN(d.op)?1:d.op);const fg=[0,1,2].map(k=>m[k]*al+bg[k]*(1-al));
 const L1=lum(fg),L2=lum(bg),r=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);n++;min=Math.min(min,r);
 const large=d.fs>=24||(d.fs>=18.66&&+d.fw>=700);const need=large?3:4.5;if(r<need)bad.push(r.toFixed(2)+' '+d.fs+'px "'+d.t+'" '+d.cls);}
console.log(th,'checked',n,'min ratio',min.toFixed(2),'below AA',bad.length);bad.slice(0,14).forEach(x=>console.log('  LOW',x));
console.log(th,'controls without a name',data.names,'check circle size px',JSON.stringify(data.small));
}});
