// module49 roadmap board: Habits parent with tick circles, done/total counts
let rmHDown=null;
function rmHOn(){return !document.body.classList.contains("m33");}
function rmHTicked(d,id){return !!(log(d)||{})[id];}
function rmHTick(d,id,cell){const was=rmHTicked(d,id);setHabit(d,id,!was);
  v3undoToast((was?"Unticked ":"Ticked ")+hbName(id)+", "+fmt(d,{weekday:"short",day:"numeric",month:"short"}),()=>setHabit(d,id,was));}
function rmHMonthKey(d){return d.slice(0,7);}
let rmHMonth=null;
function rmHCur(){return rmHMonth||rmHMonthKey(iso(new Date()));}
function rmHFirst(){let f=START;try{Object.keys(state.logs||{}).forEach(k=>{const l=state.logs[k];if(l&&typeof l==="object"&&Object.keys(l).some(x=>x!=="date"&&l[x]===true)&&k<f)f=k;});}catch(e){}return f;}
function rmHPct(id,mk,today){const y=Number(mk.slice(0,4)),m=Number(mk.slice(5))-1,dim=new Date(y,m+1,0).getDate();let n=0,den=0;
  for(let i=1;i<=dim;i++){const d=mk+"-"+String(i).padStart(2,"0");if(d>today)break;den++;if(rmHTicked(d,id))n++;}
  return den?Math.round(100*n/den):0;}
function rmHCell(d,id,today){const on=rmHTicked(d,id),fut=d>today,n=Number(d.slice(8));
  const b=el("button",{type:"button",class:"rm-hday"+(on?" on":"")+(d===today?" today":"")+(fut?" fut":"")+(!on&&d<today?" miss":""),"data-d":d,"data-h":id,"aria-pressed":String(on),
    "aria-label":hbName(id)+", "+fmt(d,{weekday:"long",day:"numeric",month:"long"})+(on?", done":", not done"),text:String(n)});
  if(fut)b.disabled=true;
  b.onclick=e=>{e.stopPropagation();if(d>today)return;rmHTick(d,id);const o=rmHTicked(d,id);b.classList.toggle("on",o);b.classList.toggle("miss",!o&&d<today);b.setAttribute("aria-pressed",String(o));
    const pc=document.querySelector('.rm-hpct[data-hid="'+id+'"]');if(pc)pc.textContent=rmHPct(id,rmHCur(),today)+"%";};
  return b;}
function rmHPerRow(){return innerWidth<900?7:15;}
function rmHGrid(id,mk,today,per){const y=Number(mk.slice(0,4)),m=Number(mk.slice(5))-1,dim=new Date(y,m+1,0).getDate();
  const g=el("div",{class:"rm-hgrid","data-hid":id,style:"grid-template-columns:repeat("+per+",30px)"});
  for(let i=1;i<=dim;i++)g.append(rmHCell(mk+"-"+String(i).padStart(2,"0"),id,today));return g;}
function rmHShift(n){const cur=rmHCur(),tk=rmHMonthKey(iso(new Date())),fk=rmHMonthKey(rmHFirst());
  const d=new Date(Number(cur.slice(0,4)),Number(cur.slice(5))-1+n,1),k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
  if(k>tk||k<fk&&k<rmHMonthKey(addDays(iso(new Date()),-365)))return;rmHMonth=k;rmBoard();}
function rmHMonthName(mk){return new Date(Number(mk.slice(0,4)),Number(mk.slice(5))-1,1).toLocaleDateString("en-GB",{month:"long",year:"numeric"});}
function rmHabits(){const world=document.getElementById("rmWorld");if(!world||!rmHOn()||world.querySelector(".rm-hparent"))return;
  v3loadHabits();const today=iso(new Date()),list=hbList(),mk=rmHCur(),per=rmHPerRow();
  let mb=0;world.querySelectorAll(".rm-node,.rm-tree,.rm-addb,.rm-newp").forEach(n=>{mb=Math.max(mb,n.offsetTop+n.offsetHeight);});
  const tod=list.filter(h=>rmHTicked(today,h.id)).length;
  const pe=el("div",{class:"rm-node rm-hparent","data-node":"hp"},el("span",{class:"rm-pname",text:"Habits"}),el("span",{class:"rm-cnt",text:tod+"/"+list.length}));
  world.append(pe);const ph=pe.offsetHeight,y0=mb+80,x=40;rmPut(pe,x,y0);
  const nav=el("div",{class:"rm-hnav"},el("button",{type:"button",class:"rm-hprev","aria-label":"Earlier month",text:"‹"}),el("span",{class:"rm-hmon",text:rmHMonthName(mk)}),el("button",{type:"button",class:"rm-hnext","aria-label":"Later month",text:"›"}));
  world.append(nav);rmPut(nav,x,y0+ph+16);
  const ab=el("button",{type:"button",class:"rm-hadd"},el("span",{class:"rm-plus",text:"+"}),el("span",{text:"Add Branch"}));
  world.append(ab);rmPut(ab,x+16,y0+ph+64);rmLinks.push({a:pe,b:ab,t:"v"});
  const bx=340;let y=y0;
  list.forEach(h=>{
    const be=el("div",{class:"rm-node rm-hb","data-hid":h.id},el("span",{class:"rm-bname",text:h.name}));
    world.append(be);const bh=be.offsetHeight;rmPut(be,bx,y);rmLinks.push({a:pe,b:be,t:"h"});
    const gw=per*30+(per-1)*6,pc=el("span",{class:"rm-hpct","data-hid":h.id,text:rmHPct(h.id,mk,today)+"%"});
    world.append(pc);rmPut(pc,bx+gw-52,y+bh/2-9);
    const g=rmHGrid(h.id,mk,today,per);world.append(g);rmPut(g,bx,y+bh+14);
    y+=bh+14+g.offsetHeight+48;});
  rmWires();}
function rmRange(b){return b&&b.bStart&&b.bEnd?fmt(b.bStart,{day:"numeric",month:"short"})+" to "+fmt(b.bEnd,{day:"numeric",month:"short"}):"";}
function rmCounts(){const world=document.getElementById("rmWorld");if(!world)return;
  world.querySelectorAll(".rm-parent:not(.rm-hparent)").forEach(pe=>{if(pe.querySelector(".rm-cnt"))return;let d=0,t=0;
    rmBranches(pe.dataset.pid).forEach(b=>{const k=rmTasks(b.id);t+=k.length;d+=k.filter(x=>x.done).length;});
    pe.append(el("span",{class:"rm-cnt",text:d+"/"+t}));});
  world.querySelectorAll(".rm-branch").forEach(be=>{if(be.querySelector(".rm-cnt"))return;const bid=be.dataset.bid,k=rmTasks(bid),dn=k.filter(x=>x.done).length;
    be.append(el("span",{class:"rm-cnt",text:dn+"/"+k.length}));
    const w=be.offsetWidth,x=be.offsetLeft,y=be.offsetTop,pct=k.length?Math.round(100*dn/k.length):0;
    const pr=el("div",{class:"rm-prog","data-bid":bid,style:"width:"+w+"px"},el("span",{style:"width:"+pct+"%"}));world.append(pr);rmPut(pr,x,y+be.offsetHeight+3);
    const rg=rmRange(state.tasks[bid]);if(rg){const r=el("span",{class:"rm-brange","data-bid":bid,text:rg});world.append(r);rmPut(r,x+8,y-15);}});}
{const _b=rmBoard;rmBoard=function(){const had=rmView||rmLS("rm-view");_b();try{if(rmDrag)return;rmCounts();rmHabits();rmWires();if(!had)rmFit();}catch(e){console.warn(e);}};}
document.addEventListener("pointerdown",e=>{rmHDown={x:e.clientX,y:e.clientY};},true);
document.addEventListener("click",e=>{const body=document.getElementById("rmBody");if(!body||!body.contains(e.target))return;
  if(e.target.closest(".rm-in"))return;
  if(e.target.closest(".rm-hprev")){rmHShift(-1);return;}
  if(e.target.closest(".rm-hnext")){rmHShift(1);return;}
  const ad=e.target.closest(".rm-hadd");
  if(ad){e.stopPropagation();rmOpenAdd(ad,"Habit name",v=>{const name=v.trim().slice(0,40);if(!name)return;
    const id="h"+Date.now().toString(36),body={custom:true,name,min:3,max:5};
    state.habits={...(state.habits||{}),[id]:body};try{store.set("habits/"+id,body);}catch(x){}render();
    v3undoToast("Habit added: "+name,()=>{const b2={...body,deleted:Date.now()};state.habits={...state.habits,[id]:b2};try{store.set("habits/"+id,b2);}catch(x){}render();});},".rm-hadd");}
},true);
try{window.__rm=window.__rm||{};window.__rm.habits=()=>hbList().map(h=>h.id);}catch(e){}
