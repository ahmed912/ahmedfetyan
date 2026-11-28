// Round 64: first glance. Three visual tiles on top of the board: Today (ring), Week (7 day bars), Month (daily bars).
function glRing(done,total,c){const r=22,C=2*Math.PI*r,f=total?Math.min(1,done/total):0,NS="http://www.w3.org/2000/svg";
  const s=document.createElementNS(NS,"svg");s.setAttribute("viewBox","0 0 56 56");s.setAttribute("class","gl-ring");s.setAttribute("aria-hidden","true");
  const mk=(o,k)=>{const e=document.createElementNS(NS,"circle");e.setAttribute("cx",28);e.setAttribute("cy",28);e.setAttribute("r",r);e.setAttribute("fill","none");e.setAttribute("stroke-width",6);Object.entries(o).forEach(([a,v])=>e.setAttribute(a,v));return e;};
  s.append(mk({stroke:"currentColor",opacity:".18"}),mk({stroke:c,"stroke-dasharray":(C*f)+" "+C,"stroke-linecap":"round",transform:"rotate(-90 28 28)"}));return s;}
function glBars(vals,max,c,labels){const w=el("div",{class:"gl-bars","aria-hidden":"true"});
  vals.forEach(([d,t],i)=>{const col=el("span",{class:"gl-col"+(labels&&labels[i]?" now":"")},el("span",{class:"gl-bar",style:"height:"+Math.max(t?14:4,Math.round(100*t/Math.max(1,max)))+"%"},el("span",{style:"height:"+(t?Math.round(100*d/t):0)+"%;background:"+c})));w.append(col);});return w;}
function glTile(cls,c,visual,big,lbl,sub,fn,aria){return el("button",{type:"button",class:"gl-tile "+cls,style:"--tone:"+c,"aria-label":aria,onclick:fn},visual,el("span",{class:"gl-txt"},el("span",{class:"gl-big",text:big}),el("span",{class:"gl-lbl",text:lbl}),sub?el("span",{class:"gl-sub",text:sub}):null));}
function glanceBuild(){const rail=document.getElementById("ohRail");if(!rail||rail.querySelector(".gl-wrap"))return;const stats=rail.querySelector(".oh-stats");if(!stats)return;
  const today=iso(new Date());let L={due:[],early:[],done:[]};try{L=rmTodayTasks(today);}catch(e){}
  const left=L.due.length+L.early.length,dn=L.done.length,tot=left+dn;
  const t1=glTile("gl-today","#C9A978",glRing(dn,tot,"#C9A978"),tot?String(left):"0",tot?(left===1?"task left today":"tasks left today"):"nothing due today",tot?dn+" of "+tot+" done":"",()=>{try{x27SetView("board");}catch(e){}try{rmView=null;rmFit();}catch(e){}},"Today: "+left+" left");
  let ws=x27Start(today),days=x27Days(ws),all=x27Tasks(ws,days[6]),wd=all.filter(t=>t.done).length;
  const per=days.map(d=>{const a=all.filter(t=>t.due===d);return [a.filter(t=>t.done).length,a.length];}),mx=Math.max(1,...per.map(x=>x[1]));
  const t2=glTile("gl-week","#7F9FC4",glBars(per,mx,"#7F9FC4",days.map(d=>d===today)),all.length?wd+" / "+all.length:"0","this week","",()=>{try{x27SetView("week");}catch(e){}},"Week: "+wd+" of "+all.length);
  const now=new Date(),dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),ym=today.slice(0,8),cnt=Array(dim).fill(0);
  try{ohDoneList("month").forEach(t=>{const d=String(t.doneAt||"").slice(0,10);if(d.slice(0,8)===ym)cnt[Number(d.slice(8,10))-1]++;});}catch(e){}
  const mm=Math.max(1,...cnt),mtot=cnt.reduce((a,b)=>a+b,0);
  const vis=glBars(cnt.map(n=>[n,n]),mm,"#9FB58F",cnt.map((n,i)=>i+1===now.getDate()));
  const t3=el("div",{class:"gl-tile gl-month",style:"--tone:#9FB58F"},vis,el("span",{class:"gl-txt"},stats));
  const doneB=stats.querySelector("#ohDoneN"),shipE=stats.querySelector("#ohShipN");
  const GEM='<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="glg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF8A8A"/><stop offset="1" stop-color="#C21F3A"/></linearGradient><linearGradient id="glg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC2C2"/><stop offset="1" stop-color="#E5384F"/></linearGradient></defs><path d="M12 8h24l8 10-20 24L4 18z" fill="url(#glg1)"/><path d="M12 8l6 10h12l6-10z" fill="url(#glg2)"/><path d="M4 18h14l6 24zM44 18H30l-6 24z" fill="#9E1530" opacity=".55"/><path d="M18 18l6 24 6-24z" fill="#F2566B" opacity=".7"/></svg>';
  const BOLT='<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="glg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9C2FF"/><stop offset="1" stop-color="#7A47E0"/></linearGradient></defs><path d="M28 4L10 26h11l-4 18 21-24H26z" fill="url(#glg3)"/><path d="M28 4L21 26h5l-2 8 14-14H26z" fill="#fff" opacity=".18"/></svg>';
  const card=(cls,svg,node)=>{const ic=el("span",{class:"gl-ico"});ic.innerHTML=svg;return el("div",{class:"gl-card "+cls},ic,node);};
  const row=[];if(doneB)row.push(card("gl-gem",GEM,doneB));if(shipE)row.push(card("gl-bolt",BOLT,shipE));
  rail.replaceChildren(el("div",{class:"gl-wrap"},t1,t2,t3),el("div",{class:"gl-cards"},...row));}
{const _r=render;render=function(){_r();try{glanceBuild();}catch(e){console.warn(e);}};}
