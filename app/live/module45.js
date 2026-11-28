// module45 roadmap board
(function addRoadmapPage(){const tp=document.querySelector('#workView .page[data-page="today"]');if(!tp||document.querySelector('.page[data-page="roadmap"]'))return;
  tp.parentNode.append(el("div",{class:"page","data-page":"roadmap","aria-label":"Roadmap",hidden:""},el("div",{id:"rmBody"})));
  const rv=HUBS.find(h=>h.id==="review");if(rv&&!rv.pages.some(x=>x[0]==="roadmap")){const i=rv.pages.findIndex(x=>x[0]==="projects");rv.pages.splice(i<0?rv.pages.length:i+1,0,["roadmap","Roadmap"]);}})();
const RM_NS="http://www.w3.org/2000/svg";
let rmView=null,rmVT=0,rmExp={},rmDoneOpen={},rmDrag=false,rmLinks=[],rmG=null,rmLastTap=null,rmBcSet=null;
const rmPtr=new Map();
function rmLS(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function rmBc(){if(!rmBcSet){try{rmBcSet=new Set(JSON.parse(rmLS("rm-bc")||"[]"));}catch(e){rmBcSet=new Set();}}return rmBcSet;}
function rmBcToggle(id){const s=rmBc();if(s.has(id))s.delete(id);else s.add(id);try{localStorage.setItem("rm-bc",JSON.stringify([...s]));}catch(e){}}
function rmLoadView(){if(rmView)return;try{const v=JSON.parse(rmLS("rm-view")||"null");if(v&&isFinite(v.x)&&isFinite(v.y)&&isFinite(v.k))rmView={x:v.x,y:v.y,k:v.k};}catch(e){}}
function rmApply(){const w=document.getElementById("rmWorld");if(!w||!rmView)return;w.style.transform="translate("+rmView.x+"px,"+rmView.y+"px) scale("+rmView.k+")";clearTimeout(rmVT);rmVT=setTimeout(()=>{try{localStorage.setItem("rm-view",JSON.stringify(rmView));}catch(e){}},300);}
const rmClampK=k=>Math.max(.35,Math.min(2,k));
function rmZoomAt(px,py,k2){if(!rmView)rmView={x:0,y:0,k:1};k2=rmClampK(k2);const v=rmView,k=v.k;v.x=px-(px-v.x)*(k2/k);v.y=py-(py-v.y)*(k2/k);v.k=k2;rmApply();}
function rmSize(){const c=document.getElementById("rmCanvas");if(!c)return;c.style.height=Math.max(420,innerHeight-c.getBoundingClientRect().top-16)+"px";}
function rmFit(){const c=document.getElementById("rmCanvas"),w=document.getElementById("rmWorld");if(!c||!w||!c.clientWidth)return;
  let a=1e9,b=1e9,r=-1e9,d=-1e9;w.querySelectorAll(".rm-node,.rm-tree,.rm-addb,.rm-newp").forEach(n=>{a=Math.min(a,n.offsetLeft);b=Math.min(b,n.offsetTop);r=Math.max(r,n.offsetLeft+n.offsetWidth);d=Math.max(d,n.offsetTop+n.offsetHeight);});
  if(r<a)return;const fx=a,fy=b;a-=40;b-=40;r+=40;d+=40;const bw=r-a,bh=d-b,kf=Math.min(c.clientWidth/bw,c.clientHeight/bh,1),k=Math.min(2,Math.max(.8,kf));
  if(kf>=.8)rmView={x:(c.clientWidth-bw*k)/2-a*k,y:(c.clientHeight-bh*k)/2-b*k,k};
  else{const p=w.querySelector(".rm-parent"),px=p?p.offsetLeft:fx,py=p?p.offsetTop:fy;rmView={x:40-px*k,y:40-py*k,k};}
  rmApply();}
function rmTaskRow(t,opt){opt=opt||{};const id=t.id,bits=[];if(t.due)bits.push(plDue(t.due));if(opt.branch)bits.push(bkName(id));
  return el("li",{class:"rm-task"+(t.done?" done":""),"data-id":id},
    el("button",{type:"button",class:"rm-check","aria-label":"Mark done: "+(t.title||""),"aria-pressed":String(!!t.done),onclick:e=>{e.stopPropagation();rmCheck(id);}}),
    el("div",{},el("span",{class:"rm-tt",text:t.title||"",onclick:()=>v3taskMenu(id)}),bits.length?el("span",{class:"rm-tag",text:bits.join(" · ")}):null));}
function rmTree(bid){const all=rmTasks(bid),open=all.filter(t=>!t.done),done=all.filter(t=>t.done);
  const ul=el("ul",{class:"rm-tree","data-bid":bid});
  open.slice(0,rmExp[bid]?open.length:4).forEach(t=>ul.append(rmTaskRow(t)));
  if(open.length>4)ul.append(el("li",{class:"rm-more",text:rmExp[bid]?"Show less":(open.length-4)+" more",onclick:()=>{rmExp[bid]=!rmExp[bid];rmBoard();}}));
  if(done.length){if(rmDoneOpen[bid])done.forEach(t=>ul.append(rmTaskRow(t)));ul.append(el("li",{class:"rm-more rm-donec",text:done.length+" done",onclick:()=>{rmDoneOpen[bid]=!rmDoneOpen[bid];rmBoard();}}));}
  ul.append(el("li",{class:"rm-addt"},el("span",{class:"rm-plus",text:"+"}),el("span",{text:"Add task"})));
  return ul;}
function rmPut(e,x,y){e.style.left=x+"px";e.style.top=y+"px";}
function rmWires(){const s=document.getElementById("rmWires");if(!s)return;s.replaceChildren();
  const add=d=>{const p=document.createElementNS(RM_NS,"path");p.setAttribute("d",d);s.append(p);};
  rmLinks.forEach(l=>{const a=l.a,b=l.b;if(!a.isConnected||!b.isConnected)return;
    if(l.t==="v"){const x=b.offsetLeft+9;add("M"+x+" "+(a.offsetTop+a.offsetHeight)+" L"+x+" "+b.offsetTop);}
    else add("M"+(a.offsetLeft+a.offsetWidth)+" "+(a.offsetTop+a.offsetHeight/2)+" L"+b.offsetLeft+" "+(b.offsetTop+b.offsetHeight/2));});}
function rmFollow(n){const w=n.parentNode;if(!w)return;
  if(n.classList.contains("rm-branch")){const t=w.querySelector('.rm-tree[data-bid="'+n.dataset.bid+'"]');if(t)rmPut(t,n.offsetLeft+24,n.offsetTop+n.offsetHeight+12);}
  else{const b=w.querySelector('.rm-addb[data-pid="'+n.dataset.pid+'"]');if(b)rmPut(b,n.offsetLeft+16,n.offsetTop+n.offsetHeight+40);}}
function rmBoard(){const body=document.getElementById("rmBody");if(!body||rmDrag)return;rmLoadView();
  const pos=rmCfg().pos||{},bc=rmBc();
  const svg=document.createElementNS(RM_NS,"svg");svg.setAttribute("class","rm-wires");svg.id="rmWires";
  const world=el("div",{class:"rm-world",id:"rmWorld"});world.append(svg);
  const canvas=el("div",{class:"rm-canvas",id:"rmCanvas"},world);
  if(!rmLS("rm-hint"))canvas.append(el("p",{class:"rm-hint",text:"Drag to look around. Pinch or Ctrl and scroll to zoom. Double tap to fit. Hold a box to move it."}));
  body.replaceChildren(canvas);rmLinks=[];let y=40;
  rmParents().forEach(p=>{const subs=rmBranches(p.id);
    const pe=el("div",{class:"rm-node rm-parent","data-node":"p:"+p.id,"data-pid":p.id},el("span",{class:"rm-pname",text:p.name}),
      p.collapsed?el("span",{class:"rm-sub",text:subs.length+(subs.length===1?" branch":" branches")}):null);
    world.append(pe);const ph=pe.offsetHeight,pp=pos["p:"+p.id]||{x:40,y};rmPut(pe,pp.x,pp.y);let tall=0;
    if(!p.collapsed){
      const ab=el("button",{type:"button",class:"rm-addb","data-pid":p.id},el("span",{class:"rm-plus",text:"+"}),el("span",{text:"Add Branch"}));
      world.append(ab);rmPut(ab,pp.x+16,pp.y+ph+40);rmLinks.push({a:pe,b:ab,t:"v"});
      subs.forEach((b,i)=>{const t=state.tasks[b.id]||{};
        const be=el("div",{class:"rm-node rm-branch","data-node":"b:"+b.id,"data-bid":b.id},el("span",{class:"rm-bname",text:b.title||"Branch"}),t.bState==="paused"?el("span",{class:"rm-sub",text:"Paused"}):null);
        world.append(be);const bh=be.offsetHeight,bp=pos["b:"+b.id]||{x:340+i*320,y};rmPut(be,bp.x,bp.y);rmLinks.push({a:pe,b:be,t:"h"});
        let th=0;if(!bc.has(b.id)){const ul=rmTree(b.id);world.append(ul);rmPut(ul,bp.x+24,bp.y+bh+12);th=ul.offsetHeight;}
        tall=Math.max(tall,th+bh+24);});}
    y+=Math.max(ph+96,tall)+80;});
  let mb=0;world.querySelectorAll(".rm-node,.rm-tree,.rm-addb").forEach(n=>{mb=Math.max(mb,n.offsetTop+n.offsetHeight);});
  const np=el("button",{type:"button",class:"rm-newp"},el("span",{class:"rm-plus",text:"+"}),el("span",{text:"Create new Parent"}));world.append(np);rmPut(np,40,mb+80);
  rmSize();rmWires();if(rmView)rmApply();else rmFit();
  requestAnimationFrame(()=>{rmWires();if(!rmView)rmFit();});
  rmBind(canvas);}
function rmBind(canvas){
  const typing=()=>{const a=document.activeElement;return a&&a.classList&&a.classList.contains("rm-in");};
  canvas.addEventListener("pointerdown",e=>{if(typing()||e.button>0)return;if(!rmView)rmView={x:0,y:0,k:1};
    rmPtr.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(rmPtr.size===2){if(rmG){clearTimeout(rmG.timer);if(rmG.el)rmG.el.classList.remove("rm-lift");}rmDrag=false;
      const [a,b]=[...rmPtr.values()],r=canvas.getBoundingClientRect();
      rmG={mode:"pinch",d0:Math.hypot(a.x-b.x,a.y-b.y)||1,k0:rmView.k,x0:rmView.x,y0:rmView.y,mx:(a.x+b.x)/2-r.left,my:(a.y+b.y)/2-r.top};return;}
    if(e.target.closest(".rm-tree,button,input"))return;
    const nd=e.target.closest(".rm-parent,.rm-branch");
    if(nd){const node=nd.dataset.node,old=(rmCfg().pos||{})[node];
      const g=rmG={mode:"node",id:e.pointerId,el:nd,node,pid:nd.dataset.pid,bid:nd.dataset.bid,old:old&&{x:old.x,y:old.y},sx:e.clientX,sy:e.clientY,ox:nd.offsetLeft,oy:nd.offsetTop,lifted:false,moved:false};
      g.timer=setTimeout(()=>{if(rmG!==g)return;g.lifted=true;rmDrag=true;nd.classList.add("rm-lift");try{navigator.vibrate&&navigator.vibrate(10);}catch(x){}},350);}
    else rmG={mode:"pan",id:e.pointerId,sx:e.clientX,sy:e.clientY,vx:rmView.x,vy:rmView.y,moved:false};});
  canvas.addEventListener("wheel",e=>{if(typing())return;e.preventDefault();if(!rmView)rmView={x:0,y:0,k:1};const r=canvas.getBoundingClientRect();
    if(e.ctrlKey)rmZoomAt(e.clientX-r.left,e.clientY-r.top,rmView.k*Math.exp(-e.deltaY*.01));else{rmView.x-=e.deltaX;rmView.y-=e.deltaY;rmApply();}},{passive:false});
  canvas.addEventListener("dblclick",e=>{if(typing()||e.target.closest(".rm-node,.rm-tree,button,input"))return;rmFit();});}
if(!window.__rmBound){window.__rmBound=1;addEventListener("resize",()=>{if(page==="roadmap")rmSize();});
  document.addEventListener("pointermove",e=>{const p=rmPtr.get(e.pointerId);if(p){p.x=e.clientX;p.y=e.clientY;}const g=rmG;if(!g||!rmView)return;
    const c=document.getElementById("rmCanvas");
    if(g.mode==="pinch"){if(rmPtr.size<2||!c)return;const [a,b]=[...rmPtr.values()],r=c.getBoundingClientRect();
      const k=rmClampK(g.k0*(Math.hypot(a.x-b.x,a.y-b.y)||1)/g.d0),mx=(a.x+b.x)/2-r.left,my=(a.y+b.y)/2-r.top;
      rmView.x=mx-(g.mx-g.x0)*(k/g.k0);rmView.y=my-(g.my-g.y0)*(k/g.k0);rmView.k=k;rmApply();return;}
    if(e.pointerId!==g.id)return;const dx=e.clientX-g.sx,dy=e.clientY-g.sy,d=Math.hypot(dx,dy);
    if(g.mode==="node"&&!g.lifted&&d>8){clearTimeout(g.timer);rmG=g={mode:"pan",id:g.id,sx:g.sx,sy:g.sy,vx:rmView.x,vy:rmView.y,moved:false};}
    if(g.mode==="pan"){if(!g.moved&&d>3){g.moved=true;if(c)c.classList.add("rm-panning");if(!rmLS("rm-hint")){try{localStorage.setItem("rm-hint","1");}catch(x){}const h=document.querySelector(".rm-hint");if(h)h.remove();}}
      if(g.moved){rmView.x=g.vx+dx;rmView.y=g.vy+dy;rmApply();}return;}
    if(g.mode==="node"&&g.lifted){if(d>4)g.moved=true;rmPut(g.el,g.ox+dx/rmView.k,g.oy+dy/rmView.k);rmFollow(g.el);rmWires();}});
  const up=e=>{rmPtr.delete(e.pointerId);const g=rmG;if(!g)return;
    if(g.mode==="pinch"){if(rmPtr.size<2)rmG=null;return;}
    if(e.pointerId!==g.id)return;rmG=null;clearTimeout(g.timer);
    const c=document.getElementById("rmCanvas");if(c)c.classList.remove("rm-panning");
    if(g.mode==="pan"){if(!g.moved&&e.type==="pointerup"){const now=Date.now();
      if(rmLastTap&&now-rmLastTap.t<300&&Math.hypot(e.clientX-rmLastTap.x,e.clientY-rmLastTap.y)<24){rmLastTap=null;rmFit();}else rmLastTap={t:now,x:e.clientX,y:e.clientY};}return;}
    g.el.classList.remove("rm-lift");rmDrag=false;
    if(e.type==="pointercancel"){rmBoard();return;}
    const pid=g.pid,bid=g.bid;
    if(g.lifted&&g.moved){const sn=v=>Math.round(v/8)*8,x=sn(g.el.offsetLeft),y=sn(g.el.offsetTop),node=g.node,old=g.old;
      rmPut(g.el,x,y);rmFollow(g.el);rmWires();rmSetPos(node,x,y);
      v3undoToast("Moved",()=>{if(old)rmSetPos(node,old.x,old.y);else rmClearPos(node);render();});}
    else if(g.lifted){if(pid){if(typeof rmParentMenu==="function")rmParentMenu(pid);}else if(typeof rmBranchMenu==="function")rmBranchMenu(bid);}
    else if(pid)rmToggleParent(pid);
    else if(bid){rmBcToggle(bid);rmBoard();}};
  document.addEventListener("pointerup",up);document.addEventListener("pointercancel",up);}
{const _s=setPage;setPage=function(p,...a){if(p!=="roadmap"||document.body.classList.contains("m33"))return _s(p,...a);
  const r=_s("progress",...a);page="roadmap";try{history.replaceState(null,"","#roadmap");}catch(e){}
  document.querySelectorAll("#workView .page").forEach(pg=>{pg.hidden=pg.dataset.page!=="roadmap";});document.body.dataset.page="roadmap";
  try{buildNav();}catch(e){}render();return r;};}
{const _r=render;render=function(){_r();try{if(page==="roadmap"&&!document.body.classList.contains("m33"))rmBoard();}catch(e){console.warn(e);}};}
window.__rm=window.__rm||{};window.__rm.view=()=>({...(rmView||{x:0,y:0,k:1})});window.__rm.fit=rmFit;
if(location.hash==="#roadmap")setTimeout(()=>{if(!document.body.classList.contains("m33")&&page!=="roadmap")setPage("roadmap");},60);
