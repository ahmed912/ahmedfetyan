
  // =====================================================================
  // 12 Nov: safe saving across devices. A device sends only what it changed and merges it into the newest server copy,
  // so a stale device (after a reload, or a dropped connection) can no longer overwrite what another device saved.
  // =====================================================================
    queueSave=function(s,ms){dirty.add(s);clearTimeout(pending[s]);pending[s]=setTimeout(()=>saveLog(s),Math.min(ms,60));};
  (function(){
    if(!window.claude||!window.__sb||window.__sbSafe)return;window.__sbSafe=true;
    const SAFE=new Set(["logs","entries","projects","learning","inquiries","sprints","habits","sleep","salah","listen","notes","design","guard","reminders","fin","finlog","buy","acct"]);
    const clone=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
    const isO=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
    const eq=(a,b)=>{if(a==null&&b==null)return true;if(a===b)return true;if(Array.isArray(a)&&Array.isArray(b))return a.length===b.length&&a.every((v,i)=>eq(v,b[i]));
      if(isO(a)&&isO(b)){const ka=Object.keys(a).filter(k=>a[k]!=null),kb=Object.keys(b).filter(k=>b[k]!=null);return ka.length===kb.length&&ka.every(k=>eq(a[k],b[k]));}return false;};
    // how to tell the elements of an array apart: by id, by date, by time stamp, or by value. Anything else is replaced whole.
    const keyFn=arr=>{if(arr.every(e=>isO(e)&&typeof e.id==="string"))return e=>e.id;
      if(arr.every(e=>isO(e)&&e.id==null&&typeof e.date==="string"))return e=>e.date;
      if(arr.every(e=>isO(e)&&e.id==null&&e.date==null&&typeof e.at==="number"))return e=>String(e.at);
      if(arr.every(e=>typeof e==="string"||typeof e==="number"))return e=>String(e);return null;};
    function arrDiff(x,y){const all=x.concat(y);if(!all.length)return null;const f=keyFn(all);if(!f)return null;const kx=x.map(f),ky=y.map(f);
      if(new Set(kx).size!==kx.length||new Set(ky).size!==ky.length)return null;const mx=new Map(x.map((e,i)=>[kx[i],e])),sy=new Set(ky),add=[],chg=[],del=[];
      y.forEach((e,i)=>{if(!mx.has(ky[i]))add.push(e);else if(!eq(mx.get(ky[i]),e))chg.push(e);});kx.forEach(k=>{if(!sy.has(k))del.push(k);});
      if(!add.length&&!chg.length&&!del.length)return null;return {add,chg,del,full:y};}
    function diffObj(a,b,path,ops){a=a||{};b=b||{};for(const k of new Set([...Object.keys(a),...Object.keys(b)])){const x=a[k],y=b[k];if(eq(x,y))continue;const p=path.concat(k);
      if(y==null)ops.push({p,del:1});else if(Array.isArray(y)&&(x==null||Array.isArray(x))){const o=arrDiff(x||[],y);ops.push(o?{p,arr:o}:{p,set:y});}
      else if(isO(y)&&(x==null||isO(x)))diffObj(x,y,p,ops);else ops.push({p,set:y});}}
    function applyOps(doc,ops){doc=clone(doc)||{};for(const op of ops){let cur=doc;for(let i=0;i<op.p.length-1;i++){if(!isO(cur[op.p[i]]))cur[op.p[i]]={};cur=cur[op.p[i]];}const k=op.p[op.p.length-1];
      if(op.del)delete cur[k];else if(op.arr){let arr=Array.isArray(cur[k])?cur[k]:[];const a=op.arr,f=keyFn(arr.concat(a.add,a.chg));
        if(!f)arr=clone(a.full);else{const dels=new Set(a.del);arr=arr.filter(e=>!dels.has(f(e)));a.chg.forEach(e=>{const i=arr.findIndex(z=>f(z)===f(e));if(i>=0)arr[i]=clone(e);else arr.push(clone(e));});a.add.forEach(e=>{if(!arr.some(z=>f(z)===f(e)))arr.push(clone(e));});}
        cur[k]=arr;}else cur[k]=clone(op.set);}return doc;}
    // outbox: what this device still has to send
    const recent={};let snapCount=0;
    const outboxMap=()=>{const m={};const now=Date.now();for(const k in recent){recent[k]=recent[k].filter(r=>now-r.t<4000);if(recent[k].length)(m[k]=m[k]||[]).push(...recent[k].flatMap(r=>r.ops));else delete recent[k];}try{(JSON.parse(localStorage.getItem("sb-outbox")||"[]")||[]).forEach(j=>{if(j&&j.op==="update"&&j.body&&j.body.$d)(m[j.path]=m[j.path]||[]).push(...j.body.$d);});}catch(e){}return m;};
    const view=(path,d,ob)=>{if(!isO(d))return d;const ops=ob[path];if(!ops&&!("$d" in d))return d;const x=clone(d);delete x.$d;return ops?applyOps(x,ops):x;};
    const uiSeen={},colIds={};
    // one request: the server merges the changes into the newest copy atomically. If the server function is not there yet, read, merge and write instead.
    async function applyToServer(raw,path,ops){const [c,...r]=path.split("/"),id=r.join("/");let res;
      try{res=await window.__sb.rpc("doc_apply",{p_col:c,p_id:id,p_ops:ops});}catch(e){const x=new Error((e&&e.message)||"Could not reach the server");x.code="unavailable";throw x;}
      if(res&&res.error){const er=res.error,missing=er.code==="PGRST202"||er.code==="42883"||/doc_apply/.test(er.message||"")&&/not find|does not exist|schema cache/i.test(er.message||"");
        if(!missing){const x=new Error(er.message||"Save failed");x.code=er.code&&/^(08|57|53|PGRST3)/.test(er.code)?"unavailable":(er.code||"failed");if(!er.code||/fetch|network|timeout|Failed/i.test(er.message||""))x.code="unavailable";throw x;}
        return slowMerge(raw,path,ops);}
      (recent[path]=recent[path]||[]).push({t:Date.now(),ops});}
    async function slowMerge(raw,path,ops){const [c,...r]=path.split("/"),id=r.join("/");let S=null;
      try{const q=await window.__sb.from("docs").select("data").eq("col",c).eq("id",id).maybeSingle();if(q.error)throw q.error;S=q.data?q.data.data:null;}
      catch(e){const x=new Error((e&&e.message)||"Could not read the latest copy");x.code="unavailable";throw x;}
      if(S==null)return raw.set(applyOps({},ops));
      const doc=applyOps(S,ops),patch={};for(const k of new Set([...Object.keys(S),...Object.keys(doc)])){if(!eq(S[k],doc[k]))patch[k]=(k in doc)?doc[k]:null;}
      if(!Object.keys(patch).length)return;return raw.update(patch);}
    function safeDb(d){return {
      collection(c){const o=d.collection(c);return {onSnapshot(next,err){return o.onSnapshot(snap=>{const ob=outboxMap();
          const docs=snap.docs.map(x=>{const path=c+"/"+x.id,raw=x.data(),v=view(path,raw,ob);uiSeen[path]=clone(v);return v===raw?x:{id:x.id,data:()=>v};});
          const ids=new Set(snap.docs.map(x=>x.id));(colIds[c]||[]).forEach(id=>{if(!ids.has(id))delete uiSeen[c+"/"+id];});colIds[c]=[...ids];
          snapCount++;next({...snap,docs});},err);}};},
      doc(path){const o=d.doc(path);return {set:b=>o.set(b),update:p=>(p&&p.$d)?applyToServer(o,path,p.$d):o.update(p),delete:()=>o.delete()};}};}
    const rawUse=window.claude.use;window.claude.use=async function(n){const d=await rawUse.apply(this,arguments);return n==="db"&&d?safeDb(d):d;};
    // every whole-document save becomes "only what changed"
    const _set=store.set;
    store.set=function(path,body){const c=String(path).split("/")[0];if(!SAFE.has(c)||!isO(body))return _set.apply(store,arguments);
      const base=uiSeen[path]===undefined?{}:uiSeen[path],ops=[];diffObj(base,body,[],ops);uiSeen[path]=clone(body);
      if(!ops.length)return Promise.resolve();return store.update(path,{$d:ops});};
    // queued changes go out at once and are retried every 1.5 s (it used to wait up to 20 s)
    ["set","update","del","add"].forEach(m=>{const o=store[m];store[m]=function(){const r=o.apply(store,arguments);setTimeout(()=>{try{if(store.pending())store.flush();}catch(e){}},0);return r;};});
    setInterval(()=>{try{if(store.pending()&&navigator.onLine)store.flush();}catch(e){}},1500);
    // safety net: if the server changed and no live update reached this device, fetch the latest
    let lastMax=null,lastCount=-1;
    setInterval(async()=>{if(document.visibilityState!=="visible"||!navigator.onLine)return;try{const q=await window.__sb.from("docs").select("updated_at").order("updated_at",{ascending:false}).limit(1);const t=q&&q.data&&q.data[0]?q.data[0].updated_at:null;
      if(t&&lastMax&&t!==lastMax&&snapCount===lastCount)window.dispatchEvent(new Event("online"));lastMax=t||lastMax;lastCount=snapCount;}catch(e){}},5000);
    // coming back to the app: fetch the latest from the server
    let hiddenAt=0;document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")hiddenAt=Date.now();else if(hiddenAt&&Date.now()-hiddenAt>15000){hiddenAt=0;try{window.dispatchEvent(new Event("online"));}catch(e){}}});
    window.__sbSafeApi={applyOps,diffObj,eq};
  })();
