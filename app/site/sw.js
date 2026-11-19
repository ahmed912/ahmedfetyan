// Keeps the sign-in shell and fonts on the device so the app opens offline. Data never goes through here.
const V="sb-shell-v2";
const SHELL=["./","index.html","config.js","supabase.js","boot.js","manifest.webmanifest","icon.svg","icon-192.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>c.add(new Request(u,{cache:"reload"})).catch(err=>console.warn("sw skip",u,err))))).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=="sb-fonts").map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url); if(e.request.method!=="GET")return;
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.open("sb-fonts").then(async c=>{const hit=await c.match(e.request);if(hit)return hit;const r=await fetch(e.request);c.put(e.request,r.clone());return r;}));return;}
  if(u.origin!==location.origin)return;
  // shell: network first so updates arrive, cache when offline
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cl=r.clone();caches.open(V).then(c=>c.put(e.request,cl));}return r;}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==="navigate"?caches.match("index.html"):Response.error()))));
});
