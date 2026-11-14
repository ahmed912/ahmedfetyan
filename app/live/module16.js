// ===== Round 33b: focus. Paused ("later") buckets sit on a quiet shelf and stay out of Today, waterfall, Review counts, rollover and weekly planning. =====
function laterTask(t){if(!t||t.bucket)return false;const b=state.tasks&&state.tasks[bkOfId(t.id||"")||""];if(b&&b.bucket&&b.bState==="paused")return true;const p=t.parent&&state.tasks[t.parent];return !!(p&&p.bucket&&p.bState==="paused");}
{const _to=tasksOn;tasksOn=function(s){return _to(s).filter(t=>!laterTask(t));};}
try{wfGroup="bucket";}catch(e){}
let bkLaterOpen=false;
{const _rb=renderBuckets;renderBuckets=function(){_rb();try{const sec=document.getElementById("bucketSec");if(!sec)return;
    sec.querySelectorAll(".bk-card.paused").forEach(c=>c.remove());sec.querySelectorAll(".bk-later").forEach(c=>c.remove());
    const L=bkList().filter(b=>!b.archived&&b.bState==="paused");if(!L.length)return;
    const sh=el("div",{class:"bk-later"},el("button",{type:"button",class:"hint bk-link bk-later-h","aria-expanded":String(bkLaterOpen),onclick:()=>{bkLaterOpen=!bkLaterOpen;render();}},"Later ("+L.length+")"),
      bkLaterOpen?el("ul",{class:"bk-list bk-later-l"},...L.map(b=>{const n=bkKids(b.id).filter(k=>!k.done).length;return el("li",{class:"bk-lrow"},el("span",{class:"bk-lt",text:b.title}),el("span",{class:"hint",text:n+" open"}),el("button",{type:"button",class:"mini","aria-label":"Resume "+b.title,onclick:()=>{bkSet(b.id,{bState:"active"});bkNote("Resumed "+b.title);render();}},"Resume"));})):null);
    const foot=sec.querySelector(".bk-foot");foot?foot.before(sh):sec.append(sh);}catch(e){console.warn(e);}};}
// Review: the task tile shows a calm percentage and one short fact, not a big x / n
{const _r=render;render=function(){_r();try{const bars=document.getElementById("bars");if(!bars)return;
    [...bars.querySelectorAll(".bar")].forEach(b=>{const l=b.querySelector(".label");if(!l||l.textContent!=="Tasks done"||b.dataset.pct)return;const n=b.querySelector(".num");const m=n&&n.textContent.match(/(\d+)\s*\/\s*(\d+)/);if(!m)return;
      const d=+m[1],t=+m[2];b.dataset.pct="1";n.textContent=(t?Math.round(d/t*100):0)+"%";b.querySelector(".row").append(el("span",{class:"hint",text:d+" of "+t+" in active buckets"}));});}catch(e){}};}
