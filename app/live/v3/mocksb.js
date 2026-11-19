const http=require('http'),fs=require('fs'),path=require('path'),zlib=require('zlib');
const CT={'.html':'text/html','.js':'application/javascript','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png'};
function start({site,html,docs,port=8766,webPort=8765}){
  const writes=[];const rows=[];
  for(const col in docs){const v=docs[col];if(!v||typeof v!=='object')continue;for(const id in v)rows.push({col,id,data:v[id]});}
  for(let i=1;i<=4;i++)rows.push({col:'settings',id:'snd_m'+i,data:{url:'data:audio/mpeg;base64,'+'A'.repeat(1000000)}});
  const GZ=zlib.gzipSync(html).toString('base64');
  const web=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(site,p);
    if(!f.startsWith(site)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end('nf');return;}
    r.writeHead(200,{'Content-Type':CT[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));}).listen(webPort);
  const api=http.createServer((q,r)=>{
    const H={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'*','Access-Control-Expose-Headers':'*'};
    const send=(c,b,ct)=>{r.writeHead(c,Object.assign({},H,b===undefined?{}:{'Content-Type':ct||'application/json'}));r.end(b===undefined?undefined:(typeof b==='string'?b:JSON.stringify(b)));};
    if(q.method==='OPTIONS'){r.writeHead(204,H);r.end();return;}
    const u=new URL(q.url,'http://x');const pn=u.pathname;let body='';
    q.on('data',d=>body+=d);q.on('end',()=>{
      let j=null;try{j=JSON.parse(body);}catch(e){}
      if(q.method==='GET'&&pn==='/rest/v1/app_code'){const s=u.searchParams.get('select')||'';
        if(s.includes('chunk'))return send(200,[{part:0,chunk:GZ}]);if(s.includes('version'))return send(200,[{version:999}]);return send(200,[]);}
      if(q.method==='GET'&&pn==='/rest/v1/docs'){const c=(u.searchParams.get('col')||'').replace(/^eq\./,''),i=(u.searchParams.get('id')||'').replace(/^eq\./,'');
        if(u.searchParams.has('col')&&u.searchParams.has('id')){const row=rows.find(x=>x.col===c&&x.id===i);
          if(String(q.headers.accept||'').includes('vnd.pgrst.object'))return row?send(200,{data:row.data}):send(406,{code:'PGRST116',message:'no rows'});
          return send(200,row?[{data:row.data}]:[]);}
        const off=+(u.searchParams.get('offset')||0);return send(200,off?[]:rows);}
      if(q.method==='POST'&&pn==='/rest/v1/docs'){writes.push({kind:'upsert',body:j});const list=Array.isArray(j)?j:[j];
        list.forEach(b=>{if(!b)return;const k=rows.findIndex(x=>x.col===b.col&&x.id===b.id);const n={col:b.col,id:b.id,data:b.data};if(k>=0)rows[k]=n;else rows.push(n);});return send(201);}
      if(q.method==='POST'&&pn.startsWith('/rest/v1/rpc/')){writes.push({kind:'rpc',name:pn.split('/').pop(),body:j});return send(200,'null');}
      if(q.method==='DELETE'&&pn==='/rest/v1/docs'){writes.push({kind:'del',url:q.url});r.writeHead(204,H);r.end();return;}
      send(200,q.method==='GET'&&pn.startsWith('/rest/v1/')?[]:{});});});
  api.listen(port);
  return {writes,close:()=>{web.close();api.close();}};}
module.exports={start};
