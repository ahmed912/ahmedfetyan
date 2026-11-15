#!/usr/bin/env node
// Diamonds backfill helper. Plain Node, no dependencies. Not loaded by the app, never run on live data by itself.
// Usage: node wins_backfill.js IN.json [--apply id,id] [--out OUT.json]
//   default (dry run): backs up, prints shipped candidates and done tasks without doneAt, writes nothing else.
//   --apply id,id: only for candidate buckets; writes OUT (default IN.applied.json) with shipped:true and shippedAt,
//                  plus backup/wins-<ts>.rollback.json. Never deletes, never touches other fields.
const fs=require('fs'),path=require('path');
const a=process.argv.slice(2);let inp=null,apply=null,out=null;
for(let i=0;i<a.length;i++){if(a[i]==='--apply')apply=(a[++i]||'').split(',').map(s=>s.trim()).filter(Boolean);else if(a[i]==='--out')out=a[++i];else if(!inp)inp=a[i];}
if(!inp){console.error('usage: node wins_backfill.js IN.json [--apply id,id] [--out OUT.json]');process.exit(1);}
const raw=fs.readFileSync(inp,'utf8'),data=JSON.parse(raw);
const pad=n=>String(n).padStart(2,'0'),n0=new Date();
const ts=''+n0.getFullYear()+pad(n0.getMonth()+1)+pad(n0.getDate())+'T'+pad(n0.getHours())+pad(n0.getMinutes())+pad(n0.getSeconds());
const bdir=path.join(path.dirname(path.resolve(inp)),'backup');fs.mkdirSync(bdir,{recursive:true});
const bk={};['tasks','logs','entries','wins'].forEach(k=>{bk[k]=data[k]===undefined?{}:JSON.parse(JSON.stringify(data[k]));});
fs.writeFileSync(path.join(bdir,'wins-'+ts+'.json'),JSON.stringify(bk));
const tasks=data.tasks||{},entries=data.entries||{};
const desc=bid=>{const out=[],seen=new Set([bid]);let grew=true;while(grew){grew=false;for(const [i,t] of Object.entries(tasks)){if(t&&t.parent&&seen.has(t.parent)&&!seen.has(i)){seen.add(i);out.push(i);grew=true;}}}return out;};
const real=i=>{const t=tasks[i];return t&&!t.bucket&&!t.sub&&!t.deleted;};
const lastEntry=id=>{let l=null;const kids=Object.keys(tasks).filter(k=>tasks[k]&&tasks[k].parent===id);const refs=new Set(['tasks:'+id,...kids.map(k=>'tasks:'+k)]);
  for(const [d,e] of Object.entries(entries)){const its=(e&&e.items)||[];if(its.some(x=>x&&refs.has(x.ref))&&(!l||d>l))l=d;}return l;};
const cands={};
for(const [id,b] of Object.entries(tasks)){if(!b||!b.bucket||b.shipped===true)continue;const ks=desc(id).filter(real);if(ks.length&&ks.every(k=>tasks[k].done)){
  let la=null;ks.forEach(k=>{const d=tasks[k].doneAt;if(d&&(!la||d>la))la=d;});cands[id]={title:b.title,n:ks.length,shippedAt:la||lastEntry(id)||n0.toISOString().slice(0,10)};}}
if(apply===null){
  for(const [id,c] of Object.entries(cands))console.log('shipped candidate: '+id+' '+c.title+' ('+c.n+' tasks)');
  for(const [id,t] of Object.entries(tasks)){if(t&&!t.bucket&&!t.sub&&!t.deleted&&t.done&&!t.doneAt){const l=lastEntry(id);console.log('done without doneAt: '+id+' '+t.title+' '+(l?'would show on '+l:'skipped, no entry'));}}
  console.log('dry run: nothing written except the backup in '+bdir);process.exit(0);}
const bad=apply.filter(i=>!cands[i]);if(!apply.length||bad.length){console.error('not a shipped candidate: '+(bad.join(',')||'(no ids)'));process.exit(2);}
const o=JSON.parse(raw);const rb=[];
apply.forEach(id=>{const b=o.tasks[id];rb.push({id,shipped:b.shipped===undefined?null:b.shipped,shippedAt:b.shippedAt===undefined?null:b.shippedAt});b.shipped=true;b.shippedAt=cands[id].shippedAt;});
const op=out||inp.replace(/\.json$/,'')+'.applied.json';fs.writeFileSync(op,JSON.stringify(o));
fs.writeFileSync(path.join(bdir,'wins-'+ts+'.rollback.json'),JSON.stringify(rb));
console.log('applied to '+op+': '+apply.join(','));
