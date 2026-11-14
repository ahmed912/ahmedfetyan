const {chromium}=require('playwright');const fs=require('fs');
const A='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app';
const base=fs.readFileSync(A+'/test.py','utf8').split('mock="""')[1].split('"""')[0].replace('%s','{}');
const real=fs.readFileSync(process.env.MOCKDATA||A+'/cut/real.json','utf8');
const mock=base.replace("const data={tasks:T,logs:{}}","const data="+real);
if(mock===base)throw new Error('mock replace failed');
const OUT=A+'/v3/shots';fs.mkdirSync(OUT,{recursive:true});
const RE_OLD="set:async b=>{data[c][id]=b;setTimeout(()=>emit(c),5);}";
const RE_NEW="set:async b=>{if(p==='timers/war'){window.__wn=(window.__wn||0)+1;await new Promise(r=>setTimeout(r,window.__wn%2?250:10));}data[c][id]=b;setTimeout(()=>emit(c),5);}";
const SBMOCK="window.__sb={rpc:async(n,a)=>{if(n==='doc_apply'){const c=a.p_col,i=a.p_id;const cur=((window.__data||{})[c]||{})[i];(window.__data[c]=window.__data[c]||{})[i]=window.__sbSafeApi.applyOps(cur||{},a.p_ops);const db=await window.claude.use('db');await db.doc(c+'/'+i).update({});return {data:null,error:null};}return {data:null,error:{message:'unknown'}};},from:()=>({select:()=>({eq:(a,c)=>({eq:(a2,id)=>({maybeSingle:async()=>{const d=((window.__data||{})[c]||{})[id];return {data:d===undefined?null:{data:JSON.parse(JSON.stringify(d))},error:null};}})})})})};";
async function openp(b,w,o={}){const ctx=await b.newContext({viewport:{width:w,height:o.h||900},colorScheme:o.scheme||'light'});const pg=await ctx.newPage();pg.errs=[];
  pg.on('pageerror',e=>pg.errs.push(String(e)));pg.on('console',m=>{if(m.type()==='error')pg.errs.push('console:'+m.text().slice(0,200));});
  await pg.clock.install({time:new Date(o.when||'2026-11-09T11:00:00')});
  let M=o.real?base.replace("const data={tasks:T,logs:{}}","const data="+o.real):mock;if(o.reorder){if(!M.includes(RE_OLD))throw new Error('reorder patch failed');M=M.replace(RE_OLD,RE_NEW);}
  if(!o.roll)M=M.replace("window.__data=data;","data.settings=data.settings||{};if(!data.settings.roll)data.settings.roll={auto:false};window.__data=data;");
  M=M.replace("window.__data=data;","if(window.__restore)for(const k in window.__restore)data[k]=window.__restore[k];window.__data=data;");
  await pg.addInitScript("try{const s=sessionStorage.getItem('__mockdata');if(s)window.__restore=JSON.parse(s);}catch(e){}");
  await pg.addInitScript(M);if(o.sb)await pg.addInitScript(SBMOCK);await pg.route('**/*',r=>/^https?:/.test(r.request().url())?r.abort():r.continue());
  await pg.goto('file://'+A+'/'+(o.html||'test.html'));await pg.clock.runFor(2500);return pg;}
const shot=(pg,n,full)=>pg.screenshot({path:OUT+'/'+n+'.png',fullPage:!!full});
async function run(fn){const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});try{await fn(b);}finally{await b.close();}}
module.exports={openp,shot,run,OUT};
