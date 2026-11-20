// ===== 19 Nov: PHONE. At 600 px or less only Gym, Money and Capture; a running War or focus timer still shows. Data untouched. =====
const M33_PAGES=["gym","finance","settings"];
const M33_TABS=[["gym","Gym","mgym",["gym"]],["finance","Money","mmoney",["finance"]]];
const M33_FULL=MTABS.slice();
function m33on(){let off=false;try{off=localStorage.getItem("sb-m33")==="off";}catch(e){}return innerWidth<=600&&!off;}
function m33sync(){const on=m33on();document.body.classList.toggle("m33",on);const want=on?M33_TABS:M33_FULL;if(MTABS.length!==want.length||MTABS[0][0]!==want[0][0])MTABS.splice(0,MTABS.length,...want);}
{const _sp33=setPage;setPage=function(p,...a){if(m33on()&&!M33_PAGES.includes(p))p="gym";const r=_sp33(p,...a);try{if(document.body.classList.contains("m33"))m33ui();}catch(e){}return r;};}
function m33add(){const i=document.getElementById("m33In");const v=(i&&i.value||"").trim();if(!v)return;const ci=document.getElementById("capIn");if(ci)ci.value=v;capDraft=v;capSaveText();i.value="";}
function m33bar(){let b=document.getElementById("m33Bar");
  if(!b)b=el("div",{id:"m33Bar",class:"m33-bar",dir:"ltr"},
    el("input",{id:"m33In",class:"m33-in",dir:"auto",placeholder:"Capture a thought","aria-label":"Capture",onkeydown:e=>{if(e.key==="Enter"){e.preventDefault();m33add();}}}),
    el("button",{type:"button",class:"m33-add",onclick:m33add},"Add"),
    el("button",{type:"button",class:"m33-more","aria-label":"Open Capture",onclick:()=>openPop("cap")},xico("fpen")),
    el("button",{type:"button",id:"m33Run",class:"m33-run",hidden:true}));
  const hd=document.getElementById("mHead"),tn=document.querySelector(".topnav"),an=tn&&tn.dataset.m33?tn:hd;if(an&&an.nextElementSibling!==b)an.after(b);
  return b;}
function m33run(){const r=document.getElementById("m33Run");if(!r)return;let w=null,p=null;try{w=warGet();}catch(e){}try{p=pRun();}catch(e){}
  if(w){r.hidden=false;r.textContent="War "+hms(wPhaseLeft(w)/1000);r.onclick=()=>warOpen();}
  else if(p){r.hidden=false;r.textContent="Focus running";r.onclick=()=>openPomoFull();}
  else r.hidden=true;}
function m33tn(on){const tn=document.querySelector(".topnav");if(!tn)return;
  if(on){const hd=document.getElementById("mHead");if(hd&&tn.previousElementSibling!==hd){hd.after(tn);tn.dataset.m33="1";}}
  else if(tn.dataset.m33){delete tn.dataset.m33;const bn=document.getElementById("botNav");if(bn)bn.before(tn);}}
function m33ui(){if(!document.body.classList.contains("m33")){const b=document.getElementById("m33Bar");if(b)b.remove();m33tn(false);return;}m33bar();m33tn(true);{const hd=document.getElementById("mHead"),tn=document.querySelector(".topnav"),bar=document.getElementById("m33Bar");if(hd&&tn&&bar){if(hd.nextElementSibling!==tn)hd.after(tn);if(tn.nextElementSibling!==bar)tn.after(bar);}}m33run();try{const g=document.getElementById("gymTabs");if(g&&!g.hidden)slideInd(g,'button[aria-selected="true"]');}catch(e){}}
{const _r33=render;render=function(){m33sync();_r33();try{m33ui();}catch(e){console.warn(e);}};}
setInterval(()=>{if(document.body.classList.contains("m33"))try{m33run();}catch(e){}},1000);
let m33T=null;addEventListener("resize",()=>{clearTimeout(m33T);m33T=setTimeout(()=>{if(document.body.classList.contains("m33")!==m33on()){if(m33on()&&!M33_PAGES.includes(page))setPage("gym");else render();}},150);});
function m33tog(){const b=document.getElementById("m33Tog");if(!b)return;let off=false;try{off=localStorage.getItem("sb-m33")==="off";}catch(e){}b.textContent=off?"Off":"On";b.setAttribute("aria-pressed",String(!off));}
try{const rd=document.getElementById("rdBtn")?.closest(".set-row");
  if(rd&&!document.getElementById("m33Row")){rd.after(el("div",{class:"set-row",id:"m33Row"},el("div",{},el("b",{text:"Simple phone layout"}),el("span",{class:"hint",text:"On phones: only Gym, Money and Capture"})),el("button",{type:"button",class:"btn ghost",id:"m33Tog",onclick:()=>{try{if(localStorage.getItem("sb-m33")==="off")localStorage.removeItem("sb-m33");else localStorage.setItem("sb-m33","off");}catch(e){}m33tog();render();}})));m33tog();}}catch(e){console.warn(e);}
const M33CSS=`body.m33 .m-nav{grid-template-columns:repeat(2,1fr)}
body.m33 #hubSub{display:none!important}
body.m33.page-gym .topnav{display:block!important;position:static;background:transparent;box-shadow:none;border:0;-webkit-backdrop-filter:none;backdrop-filter:none}
body.m33 .topnav-in{padding:2px 16px 6px;gap:8px}
body.m33 #gymTabs{flex:1;mask-image:none;-webkit-mask-image:none;justify-content:space-between;overflow:visible}
body.m33 #gymTabs button{flex:1;min-height:40px;padding:6px 4px;font-size:13px}
body.m33 #bwBtnGym{min-width:44px;min-height:44px;margin:0;padding:0}
.m33-bar{position:sticky;top:0;z-index:55;display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px 16px;background:color-mix(in oklab,var(--bg) 82%,transparent);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px)}
.m33-in{flex:1;min-width:0;height:44px;padding:0 14px;border-radius:22px;border:0;background:var(--surface);color:var(--ink);font:inherit;box-shadow:inset 0 0 0 .5px color-mix(in oklab,var(--ink) 18%,transparent)}
.m33-add,.m33-more{all:unset;height:44px;min-width:44px;padding:0 14px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border-radius:22px;cursor:pointer;background:color-mix(in oklab,var(--md-primary,var(--accent)) 16%,transparent);color:var(--ink)}
.m33-more{padding:0}.m33-more svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8}
.m33-run{all:unset;flex-basis:100%;text-align:center;padding:8px 0;border-radius:16px;cursor:pointer;font-variant-numeric:tabular-nums;background:color-mix(in oklab,var(--good,#2e7d32) 18%,transparent)}
.m33-run[hidden]{display:none}`;
document.head.append(el("style",{id:"m33Css"},M33CSS));
setTimeout(()=>{if(m33on()&&!M33_PAGES.includes(page))setPage("gym");else render();},0);
window.__u33={on:m33on,add:m33add,setPage:p=>setPage(p),warClose:()=>warClose()};
