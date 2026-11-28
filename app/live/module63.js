// module63 item 27: Week plan view (Board | Week switch, 7 day columns, branch bars, tasks by due day, sprints only here)
let x27Ws=null;
function x27View(){try{return localStorage.getItem("x27-view")==="week"?"week":"board";}catch(e){return "board";}}
function x27SetView(v){try{localStorage.setItem("x27-view",v);}catch(e){}render();}
function x27Start(d){const w=parse(d).getDay();return addDays(d,-((w+1)%7));}
function x27Days(ws){return [0,1,2,3,4,5,6].map(i=>addDays(ws,i));}
function x27SpText(ws){if(typeof spOn==="function"&&!spOn())return "";const seen=[],out=[];
  x27Days(ws).forEach(d=>{const sp=v3spOf(d);if(sp&&!seen.includes(sp.n)){seen.push(sp.n);out.push("Sprint "+sp.n+", ends "+fmt(sp.end,{day:"numeric",month:"short"}));}});return out.join(" · ");}
function x27Tasks(ws,we){return Object.entries(state.tasks||{}).filter(([i,t])=>t&&t.title&&!t.bucket&&!t.cut&&!t.archived&&!t.inbox&&t.due&&t.due>=ws&&t.due<=we).map(([id,t])=>({id,...t})).filter(t=>!x26Hidden(t));}
function x27Switch(){const bar=document.getElementById("ohBar");if(!bar||typeof ohOn!=="function"||!ohOn())return;
  let sw=bar.querySelector(".x27-sw");const v=x27View();
  if(!sw){sw=el("div",{class:"x27-sw",role:"tablist","aria-label":"View"},
    el("button",{type:"button",class:"x27-tab","data-v":"board",role:"tab",onclick:()=>x27SetView("board")},"Board"),
    el("button",{type:"button",class:"x27-tab","data-v":"week",role:"tab",onclick:()=>x27SetView("week")},"Week"));bar.append(sw);}
  sw.querySelectorAll(".x27-tab").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.v===v)));}
function x27Week(body){const today=iso(new Date()),cur=x27Start(today),ws=x27Ws||cur,days=x27Days(ws),we=days[6];
  const o={day:"numeric",month:"short"},sp=x27SpText(ws);
  const head=el("div",{class:"x27-head"},
    el("button",{type:"button",class:"x27-prev","aria-label":"Earlier week",onclick:()=>{x27Ws=addDays(ws,-7);render();}},"‹"),
    el("span",{class:"x27-range",text:fmt(ws,o)+" to "+fmt(we,o)}),
    el("button",{type:"button",class:"x27-next","aria-label":"Later week",onclick:()=>{x27Ws=addDays(ws,7);render();}},"›"),
    el("button",{type:"button",class:"btn ghost x27-now",hidden:ws===cur?"":null,onclick:()=>{x27Ws=null;render();}},"This week"),
    sp?el("span",{class:"x27-sp",text:sp}):null);
  const bars=el("div",{class:"x27-bars"});
  ohDated().forEach(b=>{const r=ohRange(b);if(!r||r.e<ws||r.s>we)return;const si=Math.max(0,days.indexOf(r.s<ws?ws:r.s)),ei=days.indexOf(r.e>we?we:r.e);
    const bar=el("div",{class:"x27-bar"+(r.s<ws?" x27-cl":"")+(r.e>we?" x27-cr":""),"data-bid":b.id,title:b.title||""},el("span",{class:"x27-bn",dir:"auto",text:b.title||"Branch"}),el("span",{class:"x27-br",text:ohRangeText(r)}));
    bar.style.gridColumn=(si+1)+" / "+(ei+2);bar.style.setProperty("--tone",ohColor(b));bars.append(bar);});
  const L=x27Tasks(ws,we),grid=el("div",{class:"x27-days"});
  days.forEach(d=>{const spd=v3spOf(d),buf=!!(spd&&typeof spBufferSet==="function"&&spBufferSet(spd).has(d));
    const ul=el("ul",{class:"rm-tree x27-col","data-d":d});
    L.filter(t=>t.due===d).sort((a,b)=>(a.done-b.done)||bkSort(a,b)).forEach(t=>ul.append(rmTaskRow(t,{branch:1})));
    grid.append(el("div",{class:"x27-dcol"+(d===today?" today":"")+(buf?" buf":""),"data-d":d},
      el("div",{class:"x27-day"},el("span",{class:"x27-wd",text:fmt(d,{weekday:"short"})}),el("span",{class:"x27-dn",text:fmt(d,{day:"numeric"})}),buf?el("span",{class:"x27-buf",text:"buffer"}):null),ul));});
  body.replaceChildren(el("section",{class:"x27-week",id:"x27Week","aria-label":"Week plan"},head,bars.childElementCount?bars:null,grid));}
{const _b=rmBoard;rmBoard=function(){const body=document.getElementById("rmBody");
  if(body&&typeof ohOn==="function"&&ohOn()&&x27View()==="week"){const a=document.activeElement;if(a&&a.classList&&(a.classList.contains("rn-in"))&&a.closest("#rmBody"))return;x27Week(body);return;}
  return _b.apply(this,arguments);};}
{const _r=render;render=function(){_r();try{if(page==="roadmap")x27Switch();}catch(e){console.warn(e);}};}
window.__x27={start:x27Start,days:x27Days,sprintText:x27SpText,view:x27View};
