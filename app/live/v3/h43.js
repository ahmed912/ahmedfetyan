// two devices that share one "server": every write on one page is forwarded to the other (ops are merged, whole docs are replaced), with an optional hold to make writes cross
const {chromium}=require('playwright');const fs=require('fs');
const A_='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app';
const base=fs.readFileSync(A_+'/test.py','utf8').split('mock="""')[1].split('"""')[0].replace('%s','{}');
const real=fs.readFileSync(process.env.MOCKDATA||A_+'/cut/real.json','utf8');
const hsrc=fs.readFileSync(A_+'/v3/h.js','utf8');const SBMOCK=eval(hsrc.split('\n').find(l=>l.startsWith('const SBMOCK=')).replace(/^const SBMOCK=/,'').replace(/;$/,''));
let M=base.replace("const data={tasks:T,logs:{}}","const data="+real).replace("window.__data=data;","data.settings=data.settings||{};if(!data.settings.roll)data.settings.roll={auto:false};window.__data=data;window.__emit=emit;window.__inject=(k,c,id,p)=>{data[c]=data[c]||{};if(k==='ops')data[c][id]=window.__sbSafeApi.applyOps(data[c][id]||{},p);else if(k==='del')delete data[c][id];else data[c][id]=p;setTimeout(()=>emit(c),5);};");
M=M.replace("set:async b=>{data[c][id]=b;","set:async b=>{data[c][id]=b;window.__push&&window.__push('doc',c,id,b);")
 .replace("update:async b=>{data[c][id]={...(data[c][id]||{}),...b};","update:async b=>{data[c][id]={...(data[c][id]||{}),...b};if(Object.keys(b).length)window.__push&&window.__push('doc',c,id,data[c][id]);")
 .replace("delete:async()=>{delete data[c][id];","delete:async()=>{delete data[c][id];window.__push&&window.__push('del',c,id,null);");
const SB=SBMOCK.replace("(window.__data[c]=window.__data[c]||{})[i]=window.__sbSafeApi.applyOps(cur||{},a.p_ops);","(window.__data[c]=window.__data[c]||{})[i]=window.__sbSafeApi.applyOps(cur||{},a.p_ops);window.__push&&window.__push('ops',c,i,a.p_ops);");
async function openPair(b,o={}){o=o||{};const st={hold:false,q:[]};const pgs=[];
  for(let n=0;n<2;n++){const ctx=await b.newContext({viewport:{width:o.w||390,height:900}});const pg=await ctx.newPage();pg.errs=[];pg.on('pageerror',e=>pg.errs.push(String(e)));
    await pg.clock.install({time:new Date(o.when||'2026-11-09T11:00:00')});await pg.addInitScript(M);await pg.addInitScript(SB);await pg.route('**/*',r=>/^https?:/.test(r.request().url())?r.abort():r.continue());pgs.push(pg);}
  const fwd=(i,k,c,id,p)=>{const f=()=>pgs[1-i].evaluate(a=>window.__inject(a[0],a[1],a[2],a[3]),[k,c,id,p]).catch(()=>{});if(st.hold)st.q.push(f);else f();};
  await pgs[0].exposeFunction('__push',(k,c,id,p)=>fwd(0,k,c,id,p));await pgs[1].exposeFunction('__push',(k,c,id,p)=>fwd(1,k,c,id,p));
  for(const pg of pgs){await pg.goto('file://'+A_+'/test.html');await pg.clock.runFor(2500);}
  const adv=async ms=>{await Promise.all(pgs.map(p=>p.clock.runFor(ms)));await pgs[0].waitForTimeout(250);};
  const release=async()=>{st.hold=false;const q=st.q.splice(0);for(const f of q)await f();await adv(1500);};
  return {A:pgs[0],B:pgs[1],st,adv,release};}
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
async function run(fn){const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});try{await fn(b);}finally{await b.close();}}
module.exports={openPair,ok,run};
