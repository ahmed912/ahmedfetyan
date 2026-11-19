// Sprint Board standalone shell: sign-in, private app loading, offline cache, sync, backup.
(function(){
  const CFG=window.SB_CONFIG||{};
  const $=id=>document.getElementById(id);
  const LS={get:k=>{try{return localStorage.getItem(k);}catch(e){return null;}},set:(k,v)=>{try{localStorage.setItem(k,v);return true;}catch(e){return false;}},del:k=>{try{localStorage.removeItem(k);}catch(e){}}};
  const T=(p,ms)=>Promise.race([p,new Promise((_,j)=>setTimeout(()=>j(new Error("idb timeout")),ms))]);
  let idbDead=false,dbp=null;
  function idb(){if(idbDead)return Promise.reject(new Error("idb off"));
    if(!dbp)dbp=T(new Promise((res,rej)=>{const r=indexedDB.open("sb-store",1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}),3000).catch(e=>{idbDead=true;throw e;});
    return dbp;}
  function kv(mode,fn){return idb().then(db=>T(new Promise((res,rej)=>{const tx=db.transaction("kv",mode),rq=fn(tx.objectStore("kv"));tx.oncomplete=()=>res(rq&&rq.result);tx.onerror=tx.onabort=()=>rej(tx.error||new Error("idb tx"));}),5000));}
  const IDB={get:k=>kv("readonly",s=>s.get(k)),set:(k,v)=>kv("readwrite",s=>s.put(v,k)),del:k=>kv("readwrite",s=>s.delete(k))};
  let warned=false;
  function storeWarn(what,e){console.warn("Offline copy not saved:",what,e||"");document.documentElement.dataset.sbStore="fail";if(warned)return;warned=true;
    const show=()=>{const d=document.createElement("div");d.id="sbWarn";d.setAttribute("role","status");d.textContent="Offline copy could not be saved on this device. The app still works online. Tap to close.";
      d.style.cssText="position:fixed;left:12px;right:12px;bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:9999;padding:10px 14px;border-radius:14px;background:rgba(30,30,30,.92);color:#fff;font:14px/1.35 system-ui;text-align:center";d.onclick=()=>d.remove();document.body.append(d);};
    document.body?show():addEventListener("DOMContentLoaded",show);}
  const MEDIA_MAX=20000;
  function lite(c){const o={};for(const col in c){o[col]={};for(const id in c[col]){const d=c[col][id];let s="";try{s=JSON.stringify(d);}catch(e){continue;}if(s.length>MEDIA_MAX&&s.includes('"data:'))continue;o[col][id]=d;}}return o;}
  async function unzip(z){const bin=Uint8Array.from(atob(z),c=>c.charCodeAt(0));return new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"))).text();}
  async function zip(s){const buf=new Uint8Array(await new Response(new Blob([s]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());let out="";for(let i=0;i<buf.length;i+=32768)out+=String.fromCharCode.apply(null,buf.subarray(i,i+32768));return btoa(out);}
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist();}catch(e){}
  if("serviceWorker" in navigator&&location.protocol!=="file:")navigator.serviceWorker.register("sw.js").catch(()=>{});

  const sb=window.supabase.createClient(CFG.url,CFG.key,{auth:{persistSession:true,autoRefreshToken:true,storageKey:"sb-auth"}});
  window.__sb=sb;

  function screen(id){["boot","login"].forEach(x=>{const e=$(x);if(e)e.hidden=x!==id;});}
  function msg(t){const m=$("loginMsg");if(m)m.textContent=t||"";}

  // ---------- local cache of every document, so the board opens offline ----------
  const CK="sb-cache"; let cache={};
  const cacheReady=(async()=>{try{const v=await IDB.get("cache");if(v&&typeof v==="object"){cache=v;LS.del(CK);return;}}catch(e){}
    let old=null;try{old=JSON.parse(LS.get(CK)||"null");}catch(e){}
    if(old&&typeof old==="object"){cache=old;try{await IDB.set("cache",old);LS.del(CK);}catch(e){LS.del(CK);if(!LS.set(CK,JSON.stringify(lite(old))))storeWarn("cache",e);}}})();
  async function saveCache(){try{await IDB.set("cache",cache);LS.del(CK);return;}catch(e){LS.del(CK);if(LS.set(CK,JSON.stringify(lite(cache))))return;storeWarn("cache",e);}}
  let saveT=null; const persist=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{saveCache();},300);};
  // apply changes still waiting in the app's offline outbox, so a reload offline shows them
  function applyJob(job){const [c,...r]=job.path.split("/"),i=r.join("/");cache[c]=cache[c]||{};
    if(job.op==="set")cache[c][i]=job.body;else if(job.op==="update")cache[c][i]={...(cache[c][i]||{}),...job.body};else if(job.op==="del")delete cache[c][i];}
  function viewOf(c){const v={...(cache[c]||{})};let out=[];try{out=JSON.parse(LS.get("sb-outbox")||"[]")||[];}catch(e){}
    out.forEach(j=>{if(j.path.split("/")[0]!==c)return;const i=j.path.slice(c.length+1);if(j.op==="set")v[i]=j.body;else if(j.op==="update")v[i]={...(v[i]||{}),...j.body};else if(j.op==="del")delete v[i];});return v;}
  const listeners={}; let serverLoaded=false;
  function emit(c){const v=viewOf(c);const snap={docs:Object.entries(v).map(([id,d])=>({id,data:()=>d})),metadata:{fromCache:!serverLoaded}};(listeners[c]||[]).forEach(fn=>{try{fn(snap);}catch(e){console.error(e);}});}
  const emitAll=()=>Object.keys(listeners).forEach(emit);
  window.__sbOutboxChanged=()=>setTimeout(emitAll,0);

  const split=p=>{const i=p.indexOf("/");return [p.slice(0,i),p.slice(i+1)];};
  const netErr=e=>{const m=String(e&&e.message||e||"");return !navigator.onLine||/fetch|network|Failed|timeout|Load failed/i.test(m);};
  const wrap=e=>{const x=new Error(e&&e.message||"Request failed");x.code=netErr(e)?"unavailable":(e&&e.code)||"failed";return x;};
  let uid=null;
  async function call(p){let r;try{r=await p;}catch(e){throw wrap(e);}if(r&&r.error)throw wrap(r.error);return r&&r.data;}

  const db={
    collection(c){return {onSnapshot(next,err){(listeners[c]=listeners[c]||[]).push(next);setTimeout(()=>emit(c),0);return ()=>{listeners[c]=(listeners[c]||[]).filter(f=>f!==next);};}};},
    doc(path){const [c,i]=split(path);return {
      async set(body){await call(sb.from("docs").upsert({owner:uid,col:c,id:i,data:body,updated_at:new Date().toISOString()}));cache[c]=cache[c]||{};cache[c][i]=body;persist();emit(c);},
      async update(patch){await call(sb.rpc("doc_update",{p_col:c,p_id:i,p_patch:patch}));cache[c]=cache[c]||{};cache[c][i]={...(cache[c][i]||{}),...patch};persist();emit(c);},
      async delete(){await call(sb.from("docs").delete().eq("owner",uid).eq("col",c).eq("id",i));if(cache[c])delete cache[c][i];persist();emit(c);}
    };}
  };

  let lastFetch=0;
  async function fetchAll(){
    if(!navigator.onLine)return; const all={}; let from=0; const N=1000;
    while(true){const rows=await call(sb.from("docs").select("col,id,data").order("col").order("id").range(from,from+N-1));
      (rows||[]).forEach(r=>{(all[r.col]=all[r.col]||{})[r.id]=r.data;}); if(!rows||rows.length<N)break; from+=N;}
    cache=all; serverLoaded=true; lastFetch=Date.now(); persist(); emitAll();
  }
  function live(){
    sb.channel("docs-live").on("postgres_changes",{event:"*",schema:"public",table:"docs"},p=>{
      if(p.eventType==="DELETE"){const o=p.old||{};if(cache[o.col])delete cache[o.col][o.id];persist();emit(o.col);return;}
      const n=p.new;(cache[n.col]=cache[n.col]||{})[n.id]=n.data;persist();emit(n.col);
    }).subscribe();
  }
  const resync=()=>{fetchAll().catch(()=>{});};
  window.addEventListener("online",resync);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&Date.now()-lastFetch>60000)resync();});

  // ---------- backup API used by the app's Backup section ----------
  window.sbBackup={
    download(){const data={};const cols=new Set([...Object.keys(cache),...Object.keys(listeners)]);cols.forEach(c=>{data[c]=viewOf(c);});
      const blob=new Blob([JSON.stringify({app:"sprint-board",version:1,exportedAt:new Date().toISOString(),data},null,1)],{type:"application/json"});
      const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="sprint-board-backup-"+new Date().toISOString().slice(0,10)+".json";document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);},
    async list(){return (await call(sb.from("backups").select("id,kind,created_at").order("created_at",{ascending:false}).limit(24)))||[];},
    async snapshot(kind){return call(sb.rpc("make_backup",{p_kind:kind||"manual"}));},
    async restore(id){const data=await call(sb.rpc("backup_data",{p_id:id}));if(!data)throw new Error("Backup not found");return window.sbBackup.restoreData(data);},
    async restoreData(data){
      await call(sb.rpc("restore_board",{p_data:data}));
      // remove documents that are not in the copy
      const rows=await call(sb.from("docs").select("col,id").eq("owner",uid));
      for(const r of rows||[]){if(!(data[r.col]&&Object.prototype.hasOwnProperty.call(data[r.col],r.id)))await call(sb.from("docs").delete().eq("owner",uid).eq("col",r.col).eq("id",r.id));}
      LS.del("sb-outbox");await fetchAll();},
    async signOut(){await sb.auth.signOut();await Promise.allSettled([IDB.del("app"),IDB.del("cache")]);LS.del(CK);LS.del("sb-app");LS.del("sb-app2");LS.del("sb-outbox");location.reload();}
  };

  // ---------- the app itself is stored privately and only downloaded after sign-in ----------
  async function saveApp(rec){try{await IDB.set("app",rec);LS.del("sb-app");LS.del("sb-app2");return;}catch(e){LS.del("sb-app");if(rec.z&&LS.set("sb-app2",JSON.stringify(rec)))return;storeWarn("app",e);}}
  async function readApp(){let rec=null;try{rec=await IDB.get("app");}catch(e){}
    if(!rec){try{rec=JSON.parse(LS.get("sb-app2")||"null");}catch(e){}}
    if(!rec){try{rec=JSON.parse(LS.get("sb-app")||"null");}catch(e){}
      if(rec&&rec.html){IDB.set("app",rec).then(()=>LS.del("sb-app")).catch(async e=>{try{if(typeof CompressionStream==="function"){const z=await zip(rec.html);LS.del("sb-app");if(LS.set("sb-app2",JSON.stringify({version:rec.version,z})))return;}}catch(_){}storeWarn("app",e);});}}
    if(!rec)return null;
    try{const html=rec.z?await unzip(rec.z):rec.html;return html&&html.length>1000?{version:rec.version,html}:null;}catch(e){console.warn("Stored app unreadable",e);return null;}}
  async function hasApp(){try{if(await IDB.get("app"))return true;}catch(e){}return !!(LS.get("sb-app2")||LS.get("sb-app"));}
  async function loadApp(){
    let cached=await readApp();
    if(navigator.onLine){
      try{
        const top=await call(sb.from("app_code").select("version").order("version",{ascending:false}).limit(1));
        const v=top&&top[0]&&top[0].version;
        if(v&&(!cached||cached.version!==v)){
          const parts=await call(sb.from("app_code").select("part,chunk").eq("version",v).order("part"));
          const raw=(parts||[]).map(p=>p.chunk).join("");
          const rec=raw.startsWith("H4sI")?{version:v,z:raw}:{version:v,html:raw};
          const html=rec.z?await unzip(rec.z):rec.html;
          if(html.length>1000){cached={version:v,html};saveApp(rec);}
        }
      }catch(e){console.warn("App update check failed",e);}
    }
    return cached;
  }
  function mount(html){
    const tpl=document.createElement("div"); tpl.innerHTML=html;
    const scripts=[...tpl.querySelectorAll("script")]; scripts.forEach(s=>s.remove());
    tpl.querySelectorAll("title,meta,link[rel=preconnect]").forEach(e=>{if(e.tagName==="LINK"||e.tagName==="TITLE")document.head.append(e);else e.remove();});
    tpl.querySelectorAll("link[rel=stylesheet],style").forEach(e=>document.head.append(e));
    $("boot").remove(); $("login").remove();
    while(tpl.firstChild)document.body.append(tpl.firstChild);
    window.claude={use:async n=>n==="db"?db:null};
    scripts.forEach(s=>{const n=document.createElement("script");if(s.src)n.src=s.src;else n.textContent=s.textContent;document.body.append(n);});
  }

  async function start(session){
    uid=session.user.id;
    await cacheReady;
    try{
      const app=await loadApp();
      if(!app){screen("boot");$("bootMsg").textContent=navigator.onLine?"Your app couldn't be loaded. Check that this account is the owner's.":"Connect to the internet once to finish setting up this device.";return;}
      mount(app.html);
      if(navigator.onLine){call(sb.rpc("claim_import")).catch(()=>{}).then(()=>fetchAll()).then(()=>call(sb.rpc("auto_backup_if_due"))).then(made=>{if(made)window.dispatchEvent(new Event("sb-backups"));}).catch(()=>{});}
      live();
    }catch(e){console.error(e);const bt=$("boot");if(bt){screen("boot");$("bootMsg").textContent="Something went wrong loading the app. Reload to try again.";}}
  }

  // ---------- sign in ----------
  $("loginForm").addEventListener("submit",async e=>{
    e.preventDefault(); msg("Signing in…"); const email=$("email").value.trim(), password=$("password").value;
    const {data,error}=await sb.auth.signInWithPassword({email,password});
    if(error){msg(/confirm/i.test(error.message)?"Open the confirmation email first, then sign in.":"That email or password didn't work.");return;}
    msg(""); start(data.session);
  });
  $("signupBtn").addEventListener("click",async()=>{
    const email=$("email").value.trim(), password=$("password").value;
    if(!email||password.length<8){msg("Enter your email and a password of at least 8 characters.");return;}
    msg("Creating your account…");
    const {error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});
    msg(error?error.message:"Check your email and tap the confirmation link, then come back and sign in.");
  });

  (async()=>{
    let data=null;try{({data}=await sb.auth.getSession());}catch(e){console.warn(e);}
    let stored=null; try{stored=JSON.parse(LS.get("sb-auth")||"null");}catch(e){}
    if(data&&data.session)start(data.session);
    else if(!navigator.onLine&&stored&&stored.user&&await hasApp())start({user:stored.user}); // offline: open with the last signed-in account
    else{screen("login");if(!navigator.onLine)msg("You're offline. Sign in once while online, then it works offline.");}
    sb.auth.onAuthStateChange((ev,s)=>{if(ev==="SIGNED_IN"&&s&&!uid&&$("login")&&!$("login").hidden){start(s);}});
  })();
})();
