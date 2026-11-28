// module51 one page: shell, nav, data helpers (Board only)
const OH_SW=["#c9a978","#7f9fc4","#a994c9","#7fb5a8","#c98f8f","#c9c27f","#9fb58f","#c9a07f","#8fb0b8"];
const OH_MAP={};BK_COL.forEach((c,i)=>{OH_MAP[c]=OH_SW[[3,1,2,4,7,5,6,8][i]];});
function ohColor(b){const c=b&&b.bColor;if(OH_SW.includes(c))return c;if(c&&OH_MAP[c])return OH_MAP[c];const l=c&&OH_SW.find(x=>x.toLowerCase()===String(c).toLowerCase());if(l)return l;const m=c&&Object.keys(OH_MAP).find(x=>x.toLowerCase()===String(c).toLowerCase());return m?OH_MAP[m]:OH_SW[0];}
function ohRange(b){if(!b||(!b.bStart&&!b.bEnd))return null;return {s:b.bStart||b.bEnd,e:b.bEnd||b.bStart};}
function ohRangeText(r){if(!r)return "";const o={day:"numeric",month:"short"};return r.s===r.e?fmt(r.s,o):fmt(r.s,o)+" to "+fmt(r.e,o);}
function ohProg(bid){const l=rmTasks(bid).filter(t=>!t.cut),n=l.length,done=l.filter(t=>t.done).length;return {done,n,pct:n?Math.round(done*100/n):0};}
function ohStatus(b){if(b&&b.bState==="done")return {k:"done",text:"Finished"};if(b&&b.bState==="paused")return {k:"paused",text:"Paused"};const r=ohRange(b);if(!r)return {k:"vault",text:"In the vault"};return {k:"run",text:"Running, due "+fmt(r.e,{month:"short",day:"numeric"})};}
function ohLive(){return bkList().filter(b=>!b.archived&&!b.cut);}
function ohDated(){return ohLive().filter(b=>ohRange(b)&&b.bState!=="done").sort((a,b)=>String(ohRange(a).e).localeCompare(String(ohRange(b).e))||bkSort(a,b));}
function ohVaultList(){return ohLive().filter(b=>!ohRange(b)&&b.bState!=="done").sort(bkSort);}
function ohSomeday(){return Object.entries(state.tasks||{}).filter(([i,t])=>t&&t.title&&!t.bucket&&!t.done&&!t.cut&&!t.archived&&!t.parent&&!t.due&&!t.date&&!t.sprint).map(([id,t])=>({id,...t})).sort(bkSort);}
function ohPer(){let p=null;try{p=localStorage.getItem("oh-per");}catch(e){}return ["month","year","all"].includes(p)?p:"month";}
function ohSetPer(p){try{localStorage.setItem("oh-per",p);}catch(e){}}
function ohInPer(d,p){const t=iso(new Date());if(p==="all")return true;if(!d)return false;return p==="year"?String(d).slice(0,4)===t.slice(0,4):String(d).slice(0,7)===t.slice(0,7);}
function ohDoneList(p){const l=Object.entries(state.tasks||{}).filter(([i,t])=>t&&t.done&&!t.bucket&&!t.cut&&t.title&&(t.doneAt?ohInPer(t.doneAt,p):p==="all")).map(([id,t])=>({id,...t}));return l.sort((a,b)=>{if(!a.doneAt!==!b.doneAt)return a.doneAt?-1:1;return String(b.doneAt||"").localeCompare(String(a.doneAt||""));});}
function ohShippedN(p){return bkList().filter(b=>b.bState==="done"&&b.bDoneAt&&ohInPer(b.bDoneAt,p)).length;}
function ohProf(){const q=(state.plans||{}).profile,base={name:"Ahmed",superpowers:[],shipped:[]};if(!q||q.deleted)return base;const m={...base,...q};if(!Array.isArray(m.superpowers))m.superpowers=[];if(!Array.isArray(m.shipped))m.shipped=[];return m;}
function ohProfSave(next,msg){const c0=ohProf(),now=Date.now(),old=((state.plans||{}).profile)?mxClone(state.plans.profile):null;
  const v={kind:"profile",...c0,...next,created:c0.created||now,upd:now};state.plans={...(state.plans||{}),profile:v};store.set("plans/profile",v).catch(fail);try{render();}catch(e){}
  if(msg)v3undoToast(msg,()=>{const back=old?{...old,upd:Date.now()}:{kind:"profile",name:c0.name,superpowers:c0.superpowers,shipped:c0.shipped,deleted:true,created:now,upd:Date.now()};state.plans={...(state.plans||{}),profile:back};store.set("plans/profile",back).catch(fail);try{render();}catch(e){}});}
function ohOld(){try{return localStorage.getItem("oh-old")==="on";}catch(e){return false;}}
function ohOn(){return !ohOld()&&!document.body.classList.contains("m33");}
let ohAddOpen=null,ohInBusy=false; // ohInline: root "#ohPage " kept for frozen name; reopen step is only used if a host exists
function ohInline(host,ph,onEnter,sel){
  if(!host)return;
  const prev=ohAddOpen&&ohAddOpen.sel===sel?ohAddOpen:null;
  const inp=el("input",{class:"rm-in",dir:"auto",type:"text",placeholder:ph,"aria-label":ph,autocomplete:"off"});
  inp.value=(prev&&prev.v)||"";
  ohAddOpen={sel:sel,ph:ph,fn:onEnter,v:inp.value,f:prev?prev.f!==false:true};
  inp.addEventListener("input",()=>{if(ohAddOpen)ohAddOpen.v=inp.value;});inp.addEventListener("focus",()=>{if(ohAddOpen)ohAddOpen.f=true;});
  host.replaceChildren(inp);
  ["keyup","keypress","pointerdown","click"].forEach(n=>inp.addEventListener(n,e=>e.stopPropagation()));
  inp.addEventListener("keydown",async e=>{
    e.stopPropagation();
    if(e.key==="Enter"){e.preventDefault();const v=inp.value.trim();if(!v)return;if(ohAddOpen)ohAddOpen.v="";inp.value="";ohInBusy=true;try{await onEnter(v);}catch(x){console.warn(x);}ohInBusy=false;
      const h=sel&&document.querySelector("#ohPage "+sel);if(h&&!h.querySelector(".rm-in")&&ohAddOpen)ohInline(h,ph,onEnter,sel);}
    else if(e.key==="Escape"){e.preventDefault();ohAddOpen=null;render();}
  });
  inp.addEventListener("blur",()=>setTimeout(()=>{if(ohInBusy||!inp.isConnected)return;if(!inp.value.trim()){ohAddOpen=null;render();}else if(ohAddOpen)ohAddOpen.f=false;},0));
  if(ohAddOpen&&ohAddOpen.f)setTimeout(()=>{try{inp.focus();}catch(e){}},0);
}
window.__oh={sw:OH_SW,color:ohColor,range:ohRange,rangeText:ohRangeText,prog:ohProg,status:ohStatus,dated:ohDated,vault:ohVaultList,someday:ohSomeday,per:ohPer,setPer:ohSetPer,doneList:ohDoneList,shippedN:ohShippedN,prof:ohProf,profSave:ohProfSave,on:ohOn};

// shell: one thin bar + the board
function ohShellBuild(){
  const pg=document.querySelector('.page[data-page="roadmap"]'),body=document.getElementById("rmBody");
  if(!pg||!body||document.getElementById("ohShell"))return;
  const shell=el("div",{id:"ohShell",class:"oh-shell"},el("div",{id:"ohBar",class:"oh-bar","aria-label":"Top bar"}),body);
  pg.append(shell);
}
try{ohShellBuild();}catch(e){console.warn(e);}

// nav
let OH_NAV0=null,ohLastOn=null;
function ohNavStale(){try{return HUBS.some(h=>h.pages.some(x=>["roadmap","progress","projects","today"].includes(x[0])&&!(h.id==="today"&&x[0]==="roadmap")));}catch(e){return false;}}
function ohNav(){
  if(!OH_NAV0)OH_NAV0={tn:(HUBS.find(h=>h.id==="today")||{}).name,all:HUBS.map(h=>({h,name:h.name,pages:h.pages.slice()}))};
  const gone=["roadmap","progress","projects","today"];
  if(ohOn()){
    const keep=[];
    OH_NAV0.all.forEach(o=>{
      if(o.h.id==="today"){o.h.name="Board";o.h.pages=[["roadmap","Board"]];keep.push(o.h);return;}
      o.h.name=o.name;o.h.pages=o.pages.filter(x=>!gone.includes(x[0]));
      if(o.h.pages.length)keep.push(o.h);
    });
    HUBS.splice(0,HUBS.length,...keep);
  }else{
    OH_NAV0.all.forEach(o=>{o.h.name=o.name;o.h.pages=o.pages.slice();});
    HUBS.splice(0,HUBS.length,...OH_NAV0.all.map(o=>o.h));
  }
  try{buildNav();}catch(e){}
}
let ohRed=false;
{const _r=render;render=function(){_r();try{
  const on=ohOn();document.body.classList.toggle("oh-on",on);
  if(on!==ohLastOn||(on&&ohNavStale())){ohLastOn=on;ohNav();}
  if(!document.getElementById("ohShell"))ohShellBuild();
  if(on&&!ohRed&&["today","progress","projects"].includes(page)){ohRed=true;try{setPage("roadmap");}finally{ohRed=false;}return;}
  if(on&&page==="roadmap"){
    const bar=document.getElementById("ohBar"),q=document.getElementById("brQuick");
    if(q&&bar&&q.parentNode!==bar)bar.append(q);
  }
  ohOldRow();
}catch(e){console.warn(e);}};}

function ohOldRow(){if(document.body.classList.contains("m33"))return;const rows=document.querySelector('.page[data-page="settings"] .set-rows');if(!rows||document.getElementById("ohOldRow"))return;
  rows.append(el("div",{class:"set-row",id:"ohOldRow"},el("div",{},el("b",{text:"Old pages"}),el("span",{class:"hint",text:"Brings back Today, Progress and Projects in the menu. Reloads the app."})),
    el("button",{type:"button",class:"btn ghost",id:"ohOldBtn",onclick:()=>{try{if(ohOld())localStorage.removeItem("oh-old");else localStorage.setItem("oh-old","on");}catch(e){}toast(ohOld()?"Old pages on":"Old pages off");setTimeout(()=>location.reload(),400);}},ohOld()?"On":"Off")));}
