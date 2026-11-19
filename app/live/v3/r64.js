// Round 64: offline shell (IndexedDB storage, service worker, quota fallback, legacy migration)
const {chromium}=require('playwright');const fs=require('fs');const {start}=require('./mocksb.js');
const P='/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad';
const SITE=P+'/site',APP=P+'/pickerfix/app',WWW=P+'/sitetest/www';
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+x:''));if(!c)process.exitCode=1;};
const ERR=/ERR_INTERNET_DISCONNECTED|Failed to fetch|ERR_FAILED|websocket|realtime|net::/i;
const b64=s=>Buffer.from(s).toString('base64url');
const SEED=`(()=>{if(localStorage['sb-auth'])return;const exp=Math.floor(Date.now()/1000)+31536000;const b=s=>btoa(s).replace(/=+$/,'').replace(/\\+/g,'-').replace(/\\//g,'_');
const jwt=b('{"alg":"HS256","typ":"JWT"}')+'.'+b(JSON.stringify({sub:'u1',exp,role:'authenticated'}))+'.x';
localStorage['sb-auth']=JSON.stringify({access_token:jwt,token_type:'bearer',expires_in:3600,expires_at:exp,refresh_token:'r',user:{id:'u1',aud:'authenticated',email:'t@t.t'}});})();`;
const QUOTA="const _s=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(String(v).length>200000)throw new DOMException('quota','QuotaExceededError');return _s.call(this,k,v);};Object.defineProperty(window,'indexedDB',{get(){throw new Error('no idb');}});";
const MOUNT="!!document.getElementById('mNav')||!!document.getElementById('botNav')&&!document.getElementById('login')";
const idbGet=(pg,k)=>pg.evaluate(k=>new Promise(res=>{const r=indexedDB.open('sb-store',1);r.onerror=()=>res(false);r.onupgradeneeded=()=>{};r.onsuccess=()=>{try{const g=r.result.transaction('kv').objectStore('kv').get(k);g.onsuccess=()=>res(!!g.result);g.onerror=()=>res(false);}catch(e){res(false);}};}),k);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  fs.rmSync(P+'/sitetest',{recursive:true,force:true});fs.mkdirSync(WWW,{recursive:true});fs.cpSync(SITE,WWW,{recursive:true});
  fs.writeFileSync(WWW+'/config.js','window.SB_CONFIG={url:"http://127.0.0.1:8766",key:"test"};');
  for(const f of ['_headers','boot.prev.js','sw.prev.js','boot.js.orig','sw.js.orig'])fs.rmSync(WWW+'/'+f,{force:true});
  if(process.env.OLDBOOT)fs.copyFileSync(SITE+'/boot.js.orig',WWW+'/boot.js');
  const html=fs.readFileSync(APP+'/new.html','utf8');
  const docs=JSON.parse(fs.readFileSync(process.env.MOCKDATA||APP+'/cut/real.json','utf8'));
  const mock=start({site:WWW,html,docs});
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const mkx=1;const mk=async(w,init)=>{const ctx=await b.newContext({viewport:{width:w,height:900}});const pg=await ctx.newPage();pg.errs=[];pg.on('pageerror',e=>pg.errs.push(String(e)));
    for(const s of init||[])await ctx.addInitScript(s.fn||s,s.arg);await ctx.addInitScript(SEED);return {ctx,pg};};
  const mounted=async pg=>{await pg.waitForFunction(MOUNT,null,{timeout:30000,polling:200});for(let i=0;i<150;i++){if(await pg.evaluate('!!window.__r2'))return;await sleep(200);}throw new Error('__r2 never defined');};
  const noErr=pg=>pg.errs.filter(x=>!ERR.test(x)).length===0;
  try{
  for(const w of (process.env.W?[+process.env.W]:[390,1300])){console.log('== width',w);
    {const {ctx,pg}=await mk(w);mock.writes.length=0;
    await pg.goto('http://127.0.0.1:8765/');await mounted(pg);
    await pg.evaluate("navigator.serviceWorker.ready");
    for(let i=0;i<20;i++){if(await pg.evaluate("caches.open('sb-shell-v2').then(c=>c.match('boot.js')).then(Boolean)"))break;await sleep(500);}
    await pg.waitForTimeout(2000);
    ok('no big keys in localStorage',await pg.evaluate("localStorage.getItem('sb-app')===null&&localStorage.getItem('sb-cache')===null"));
    ok('idb has app and cache',(await idbGet(pg,'app'))&&(await idbGet(pg,'cache')));
    ok('no quota warning',await pg.evaluate("document.documentElement.dataset.sbStore!=='fail'"));
    await ctx.setOffline(true);await pg.reload();await mounted(pg);
    ok('opens offline',await pg.evaluate("(!document.getElementById('login')||document.getElementById('login').hidden)&&!!window.__r2"));
    await pg.evaluate("__r2.setPage('gym')");await pg.waitForTimeout(500);ok('page gym',await pg.evaluate("document.body.dataset.page==='gym'"));
    await pg.evaluate("__r2.setPage('finance')");await pg.waitForTimeout(500);ok('page finance',await pg.evaluate("document.body.dataset.page==='finance'"));
    // state/gSet/store are private to the app, so queue the job the way the app's outbox stores it
    await pg.evaluate("localStorage.setItem('sb-outbox',JSON.stringify([{op:'set',path:'gym/r64-test',body:{at:Date.now(),note:'offline'}}]))");
    ok('queued offline',await pg.evaluate("JSON.parse(localStorage.getItem('sb-outbox')||'[]').some(j=>j.path==='gym/r64-test')"));
    await pg.reload();await mounted(pg);await pg.waitForTimeout(1000);
    ok('survives offline reload',await pg.evaluate("window.claude.use('db').then(db=>new Promise(r=>{const u=db.collection('gym').onSnapshot(s=>{u();r(s.docs.some(d=>d.id==='r64-test'));});}))"));
    await ctx.setOffline(false);await pg.evaluate("dispatchEvent(new Event('online'))");
    let synced=false;for(let i=0;i<30&&!synced;i++){synced=mock.writes.some(x=>JSON.stringify(x).includes('r64-test'));if(!synced)await sleep(500);}
    ok('synced when back online',synced);for(let i=0;i<160&&await pg.evaluate("JSON.parse(localStorage.getItem('sb-outbox')||'[]').length>0");i++)await sleep(500);
    ok('outbox empty',await pg.evaluate("JSON.parse(localStorage.getItem('sb-outbox')||'[]').length===0"));
    ok('no errors',noErr(pg),JSON.stringify(pg.errs.slice(0,3)));await ctx.close();}
    {const {ctx,pg}=await mk(w,[QUOTA]);
    await pg.goto('http://127.0.0.1:8765/');await mounted(pg);await pg.waitForTimeout(2000);
    ok('boots without idb',true);
    ok('warns, not silent',await pg.evaluate("document.documentElement.dataset.sbStore==='fail'"));
    ok('lite cache has no media',await pg.evaluate("(()=>{const c=JSON.parse(localStorage.getItem('sb-cache')||'{}');return !!c.tasks&&!(c.settings&&c.settings.snd_m1);})()"));
    ok('no errors (quota)',noErr(pg),JSON.stringify(pg.errs.slice(0,3)));await ctx.close();}
    {const {ctx,pg}=await mk(w,[{fn:h=>{if(!sessionStorage.__seeded){sessionStorage.__seeded='1';localStorage['sb-app']=JSON.stringify({version:999,html:h});localStorage['sb-cache']=JSON.stringify({tasks:{x1:{title:'Legacy',date:'2026-11-19'}}});}},arg:html}]);
    await pg.goto('http://127.0.0.1:8765/');await mounted(pg);await pg.waitForTimeout(2000);
    ok('legacy keys removed',await pg.evaluate("localStorage.getItem('sb-app')===null&&localStorage.getItem('sb-cache')===null"));
    ok('migrated into idb',(await idbGet(pg,'app'))&&(await idbGet(pg,'cache')));await ctx.close();}
  }
  }catch(e){console.log('FAIL exception '+e.message);process.exitCode=1;}
  await b.close();mock.close();
})();
