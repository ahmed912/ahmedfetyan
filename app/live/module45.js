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
function rmLoadView(){if(rmView)return;try{const v=JSON.parse(rmLS("rm-view2")||"null");if(v&&isFinite(v.x)&&isFinite(v.y)&&isFinite(v.k))rmView={x:v.x,y:v.y,k:v.k};}catch(e){}}
function rmApply(){const w=document.getElementById("rmWorld");if(!w||!rmView)return;w.style.transform="translate("+rmView.x+"px,"+rmView.y+"px) scale("+rmView.k+")";clearTimeout(rmVT);rmVT=setTimeout(()=>{try{localStorage.setItem("rm-view2",JSON.stringify(rmView));}catch(e){}},300);}
function rmZoomAt(px,py,k2){if(!rmView)rmView={x:0,y:0,k:1};k2=rmClampK(k2);const v=rmView,k=v.k;v.x=px-(px-v.x)*(k2/k);v.y=py-(py-v.y)*(k2/k);v.k=k2;rmApply();}
function rmSize(){const c=document.getElementById("rmCanvas");if(!c)return;c.style.height=Math.max(420,innerHeight-c.getBoundingClientRect().top-16)+"px";}
const rmClampK=k=>Math.max(.1,Math.min(4,k));
function rmFit(){const c=document.getElementById("rmCanvas"),w=document.getElementById("rmWorld");if(!c||!w||!c.clientWidth)return;
  let a=1e9,b=1e9,r=-1e9;[...w.children].forEach(n=>{if(n.tagName==="svg"||n.classList.contains("rm-wires"))return;a=Math.min(a,n.offsetLeft);b=Math.min(b,n.offsetTop);r=Math.max(r,n.offsetLeft+n.offsetWidth);});
  if(r<a)return;const k=Math.min(1,Math.max(.8,c.clientWidth/(r-a+64)));
  rmView={x:32-a*k,y:24-b*k,k};rmApply();}
function rmTaskRow(t,opt){opt=opt||{};const id=t.id,bits=[];if(t.due)bits.push(plDue(t.due));if(opt.branch)bits.push(bkName(id));
  return el("li",{class:"rm-task"+(t.done?" done":""),"data-id":id},
    el("button",{type:"button",class:"rm-check","aria-label":"Mark done: "+(t.title||""),"aria-pressed":String(!!t.done),onclick:e=>{e.stopPropagation();rmCheck(id);}}),
    el("div",{},el("span",{class:"rm-tt",dir:"auto",text:t.title||"",onclick:()=>v3taskMenu(id)}),bits.length?el("span",{class:"rm-tag",text:bits.join(" · ")}):null));}
function rmTree(bid){const all=rmTasks(bid),open=all.filter(t=>!t.done),done=all.filter(t=>t.done);
  const ul=el("ul",{class:"rm-tree","data-bid":bid});
  open.slice(0,rmExp[bid]?open.length:4).forEach(t=>ul.append(rmTaskRow(t)));
  if(open.length>4)ul.append(el("li",{class:"rm-more",text:rmExp[bid]?"Show less":(open.length-4)+" more",onclick:()=>{rmExp[bid]=!rmExp[bid];rmBoard();}}));
  if(done.length){if(rmDoneOpen[bid])done.forEach(t=>ul.append(rmTaskRow(t)));ul.append(el("li",{class:"rm-more rm-donec",text:done.length+" done",onclick:()=>{rmDoneOpen[bid]=!rmDoneOpen[bid];rmBoard();}}));}
  ul.append(el("li",{class:"rm-addt"},el("span",{class:"rm-plus",text:"+"}),el("span",{text:"Add task"})));
  return ul;}
function rmPut(e,x,y){e.style.left=x+"px";e.style.top=y+"px";}
function rmRound(pts,r){let d="M"+pts[0][0]+" "+pts[0][1];
  for(let i=1;i<pts.length-1;i++){const p=pts[i],a=pts[i-1],n=pts[i+1],l1=Math.hypot(p[0]-a[0],p[1]-a[1]),l2=Math.hypot(n[0]-p[0],n[1]-p[1]),rr=Math.min(r,l1/2,l2/2);
    if(rr<1){d+=" L"+p[0]+" "+p[1];continue;}
    d+=" L"+(p[0]+(a[0]-p[0])*rr/l1)+" "+(p[1]+(a[1]-p[1])*rr/l1)+" Q"+p[0]+" "+p[1]+" "+(p[0]+(n[0]-p[0])*rr/l2)+" "+(p[1]+(n[1]-p[1])*rr/l2);}
  const z=pts[pts.length-1];return d+" L"+z[0]+" "+z[1];}
function rmWires(){const s=document.getElementById("rmWires");if(!s)return;s.replaceChildren();
  const add=(d,c)=>{const p=document.createElementNS(RM_NS,"path");p.setAttribute("d",d);if(c)p.style.stroke=c;s.append(p);};
  rmLinks.forEach(l=>{const a=l.a,b=l.b;if(!a.isConnected||!b.isConnected)return;
    if(l.t==="v"){const x=b.offsetLeft+9;add("M"+x+" "+(a.offsetTop+a.offsetHeight)+" L"+x+" "+b.offsetTop);return;}
    const ax=a.offsetLeft+a.offsetWidth,ay=a.offsetTop+a.offsetHeight/2;let bx=b.offsetLeft,by=b.offsetTop+b.offsetHeight/2;
    if(l.t==="li"){bx=l.ul.offsetLeft+b.offsetLeft-6;by=l.ul.offsetTop+b.offsetTop+13;}
    if(false&&l.ax===ax&&l.ay===ay&&l.bx===bx&&l.by===by){const tx=ax+36;
      add(rmRound(l.lane==null?[[ax,ay],[tx,ay],[tx,by],[bx,by]]:[[ax,ay],[tx,ay],[tx,l.lane],[bx-16,l.lane],[bx-16,by],[bx,by]],14));}
    else{const m=(ax+bx)/2;add("M"+ax+" "+ay+" C"+m+" "+ay+" "+m+" "+by+" "+bx+" "+by,a.dataset.tone);}});}
function rmFollow(n){const w=n.parentNode;if(!w)return;
  w.querySelectorAll('[data-for="'+n.dataset.node+'"]').forEach(s=>rmPut(s,n.offsetLeft+Number(s.dataset.dx),n.offsetTop+Number(s.dataset.dy)));}
const rmTone=id=>{try{const g=tgGet(id);if(g&&g.color)return g.color;}catch(e){}const m={others:"#8E949E",habits:"#9FB58F",today:"#C9A978"};if(m[id])return m[id];const i=rmParents().findIndex(p=>p.id===id);const pal=(typeof TG_PAL!=="undefined"&&TG_PAL.length)?TG_PAL:["#7F9FC4","#C9A978","#A994C9","#7FB5A8","#C98F8F","#9FB58F","#B58FA9","#8FB0B8"];return pal[(i<0?0:i)%pal.length];};
function rmTint(e,c){e.style.setProperty("--tone",c);e.dataset.tone=c;return e;}
const RM_GX=88,RM_CP=380,RM_RG=28,RM_BG=64,RM_LH=16,RM_TG=72,RM_BW=256;
function rmSat(world,e,node,dx,dy){e.dataset.for=node;e.dataset.dx=dx;e.dataset.dy=dy;world.append(e);return e;}
function rmAllC(){return rmLS("rm-allc")==="1";}
function rmAllToggle(){try{localStorage.setItem("rm-allc",rmAllC()?"0":"1");}catch(e){}rmView=null;rmBoard();}
function rmBranchBlock(world,b,bc,pos,tone){const t=state.tasks[b.id]||{},id=b.id,node="b:"+id;
  const k=rmTasks(id),dn=k.filter(x=>x.done).length;
  const st=t.bState==="paused"?"Paused":t.bState==="done"?"Finished":"";
  const be=el("div",{class:"rm-node rm-branch","data-node":node,"data-bid":id},el("span",{class:"rm-bname",dir:"auto",text:b.title||"Branch"}),el("span",{class:"rm-cnt",text:dn+"/"+k.length}));
  rmTint(be,tone||"#8E949E");be.style.width=RM_BW+"px";world.append(be);const ph=be.offsetHeight,sats=[];
  const rg=typeof rmRange==="function"?rmRange(t):"";
  if(rg)sats.push([el("span",{class:"rm-brange","data-bid":id,text:rg}),0,-RM_LH]);
  sats.push([el("div",{class:"rm-prog","data-bid":id,style:"width:"+be.offsetWidth+"px"},el("span",{style:"width:"+(k.length?Math.round(100*dn/k.length):0)+"%"})),0,ph+3]);
  if(st)sats.push([el("span",{class:"rm-status","data-bid":id,text:st}),8,ph+9]);
  const colH=RM_LH+ph+(st?26:8);let ul=null,th=0;
  if(!bc.has(id)&&!rmAllC()){ul=rmTree(id);world.append(ul);th=ul.offsetHeight;}
  const h=Math.max(colH,th);
  return {be,h,ul,place(x,top){const o=pos[node],px=o?o.x:x,py=o?o.y:top+(h-colH)/2+RM_LH;rmPut(be,px,py);
    sats.forEach(([e,dx,dy])=>{if(!e.parentNode)world.append(e);rmSat(world,e,node,dx,dy);});
    if(ul){rmSat(world,ul,node,be.offsetWidth+RM_TG,Math.round(top+(h-th)/2-py));
      ul.querySelectorAll("li.rm-task").forEach(li=>rmLinks.push({a:be,b:li,ul,t:"li"}));}
    rmFollow(be);}};}
function rmTodayLane(world,tIn){const d=iso(new Date()),L=rmTodayTasks(d);
  const tree=el("ul",{class:"rm-tree rm-ttree"});
  L.due.forEach(t=>tree.append(rmTaskRow(t,{branch:1})));
  if(L.early.length){tree.append(el("li",{class:"rm-more rm-early",onclick:()=>{rmTodayEarly=!rmTodayEarly;render();}},L.early.length+" from earlier days"));
    if(rmTodayEarly)L.early.forEach(t=>tree.append(rmTaskRow(t,{branch:1})));}
  if(L.done.length){tree.append(el("li",{class:"rm-more rm-donec",onclick:()=>{rmTodayDone=!rmTodayDone;render();}},L.done.length+" done"));
    if(rmTodayDone)L.done.forEach(t=>tree.append(rmTaskRow(t,{branch:1})));}
  if(!L.due.length&&!L.early.length)tree.append(el("li",{class:"rm-empty hint"},"Nothing due today. Give a task today's due date and it shows here."));
  const add=el("li",{class:"rm-addt"},el("span",{class:"rm-plus",text:"+"}),"Add task");tree.append(add);
  const be=el("div",{class:"rm-node rm-tbranch rm-static","data-node":"tb"},el("span",{class:"rm-bname",text:"Today"}),el("span",{class:"rm-cnt",text:String(L.due.length)}));
  world.append(be);world.append(tree);
  if(typeof rmTodayInput==="function"){add.onclick=()=>{rmTodayAdd=true;rmTodayInput(add,d);};
    if(rmTodayAdd){rmTodayInput(add,d,!!tIn.had);const n=tree.querySelector(".rm-in");if(n&&tIn.v)n.value=tIn.v;}}
  const ph=be.offsetHeight,th=tree.offsetHeight,h=RM_LH+ph+14+th;
  const dt=el("span",{class:"rm-brange",text:fmt(d,{weekday:"short",day:"numeric",month:"short"})});
  return {be,h,place(x,top){rmPut(be,x,top+RM_LH);[[dt,0,-RM_LH],[tree,24,ph+14]].forEach(([e,dx,dy])=>rmSat(world,e,"tb",dx,dy));rmFollow(be);}};}
function rmHabitsBand(world){if(!rmHOn()||typeof rmHGrid!=="function")return null;
  v3loadHabits();const today=iso(new Date()),list=hbList(),mk=rmHCur(),per=rmHPerRow();
  const tod=list.filter(h=>rmHTicked(today,h.id)).length;
  const pe=el("div",{class:"rm-node rm-hparent","data-node":"hp"},el("span",{class:"rm-pname",text:"Habits"}),el("span",{class:"rm-cnt",text:tod+"/"+list.length}));
  world.append(pe);
  const nav=el("div",{class:"rm-hnav"},el("button",{type:"button",class:"rm-hprev","aria-label":"Earlier month",text:"‹"}),el("span",{class:"rm-hmon",text:rmHMonthName(mk)}),el("button",{type:"button",class:"rm-hnext","aria-label":"Later month",text:"›"}));
  const ab=el("button",{type:"button",class:"rm-hadd"},el("span",{class:"rm-plus",text:"+"}),el("span",{text:"Add Branch"}));
  world.append(nav);world.append(ab);
  const blocks=list.map(h=>{const be=el("div",{class:"rm-node rm-hb","data-hid":h.id},el("span",{class:"rm-bname",text:h.name}));world.append(be);
    const bh=be.offsetHeight,bw=be.offsetWidth,gw=per*30+(per-1)*6,pc=el("span",{class:"rm-hpct","data-hid":h.id,text:rmHPct(h.id,mk,today)+"%"}),g=rmHGrid(h.id,mk,today,per);
    world.append(pc);world.append(g);
    return {be,h:bh+14+g.offsetHeight,lh:0,place(x,top){rmPut(be,x,top);rmPut(g,x,top+bh+14);rmPut(pc,x+Math.max(gw-52,bw+12),top+bh/2-9);},link:true};});
  return {pe,blocks,below:[[nav,16],[ab,16]],cols:1,hab:true,extra:{nav,ab}};}
function rmBoard(){const body=document.getElementById("rmBody");if(!body||rmDrag)return;rmLoadView();
  const pos=rmCfg().pos||{},bc=rmBc();
  const svg=document.createElementNS(RM_NS,"svg");svg.setAttribute("class","rm-wires");svg.id="rmWires";
  const world=el("div",{class:"rm-world",id:"rmWorld"});world.append(svg);
  const canvas=el("div",{class:"rm-canvas",id:"rmCanvas"},world);
  canvas.append(el("button",{type:"button",class:"rm-allc","aria-pressed":String(rmAllC()),title:"Show or hide all tasks",onclick:e=>{e.stopPropagation();rmAllToggle();}},rmAllC()?"Show tasks":"Hide tasks"));
  if(!rmLS("rm-hint"))canvas.append(el("p",{class:"rm-hint",text:"Drag to look around. Pinch or Ctrl and scroll to zoom. Double tap to fit. Hold a box to move it."}));
  const oi=document.querySelector("#rmBody .rm-ttree .rm-in");const tIn={had:!!oi&&document.activeElement===oi,v:oi?oi.value:""};
  body.replaceChildren(canvas);rmLinks=[];
  const bands=[];
  // Today lane first
  {const tp=el("div",{class:"rm-node rm-tparent rm-static","data-node":"tp"},el("span",{class:"rm-pname",text:"Today"}));rmTint(tp,"#C9A978");world.append(tp);
    const tb=typeof rmTodayBlocks==="function"?rmTodayBlocks(world,tIn):[rmTodayLane(world,tIn)],tbelow=[];if(typeof rmTodayAddBtn==="function"){const ab=rmTodayAddBtn();world.append(ab);tbelow.push([ab,16]);}bands.push({pe:tp,blocks:tb,below:tbelow,cols:1,today:true});}
  rmParents().forEach(p=>{const subs=p.collapsed?[]:rmBranches(p.id);let d=0,t=0;
    rmBranches(p.id).forEach(b=>{const k=rmTasks(b.id);t+=k.length;d+=k.filter(x=>x.done).length;});
    const pe=el("div",{class:"rm-node rm-parent","data-node":"p:"+p.id,"data-pid":p.id},el("span",{class:"rm-pname",dir:"auto",text:p.name}),
      el("span",{class:"rm-cnt",text:d+"/"+t}),p.collapsed?el("span",{class:"rm-sub",text:rmBranches(p.id).length+(rmBranches(p.id).length===1?" branch":" branches")}):null);
    rmTint(pe,rmTone(p.id));world.append(pe);const below=[];
    if(!p.collapsed){const ab=el("button",{type:"button",class:"rm-addb","data-pid":p.id},el("span",{class:"rm-plus",text:"+"}),el("span",{text:"Add Branch"}));world.append(ab);below.push([ab,16,"addb"]);}
    bands.push({pe,pid:p.id,blocks:subs.map(b=>rmBranchBlock(world,b,bc,pos,rmTone(p.id))),below,cols:1});});
  const hb=rmHabitsBand(world);if(hb)bands.push(hb);
  const np=el("button",{type:"button",class:"rm-newp"},el("span",{class:"rm-plus",text:"+"}),el("span",{text:"Create new Parent"}));world.append(np);
  // parent column width
  let PW=240;bands.forEach(b=>{PW=Math.max(PW,b.pe.offsetWidth);});PW=Math.min(PW,260);bands.forEach(b=>{b.pe.style.width=PW+"px";});
  const x0=40+PW+RM_GX,cw=canvas.clientWidth||1300;
  let cols=1;
  let y=40;
  bands.forEach(bd=>{const ph=bd.pe.offsetHeight,nc=bd.cols===1?1:cols;
    const rows=[];bd.blocks.forEach((b,i)=>{if(i%nc===0)rows.push([]);rows[rows.length-1].push(b);});
    const rowH=rows.map(r=>Math.max(...r.map(b=>b.h)));
    const content=rowH.reduce((a,b)=>a+b,0)+RM_RG*Math.max(0,rows.length-1);
    const belowH=bd.below.reduce((a,[e,g])=>a+g+e.offsetHeight,0);
    const bandH=Math.max(content,ph+2*belowH);
    const pp=pos[bd.pe.dataset.node]||{x:40,y:bd.today&&bd.blocks.length===1?y+RM_LH+Math.round((bd.blocks[0].be.offsetHeight-ph)/2):y+Math.round((bandH-ph)/2)};
    rmPut(bd.pe,pp.x,pp.y);let by=pp.y+ph;
    bd.below.forEach(([e,g,k])=>{by+=g;rmPut(e,pp.x+16,by);by+=e.offsetHeight;if(k==="addb")rmLinks.push({a:bd.pe,b:e,t:"v"});});
    let rt=y;
    rows.forEach((r,ri)=>{r.forEach((b,ci)=>{const bx=x0+ci*RM_CP;b.place(bx,rt);
      if(bd.today||b.link||b.be.classList.contains("rm-branch")){const lk={a:bd.pe,b:b.be,t:"h",lane:ci>0?rt-RM_RG/2:null};
        lk.ax=bd.pe.offsetLeft+bd.pe.offsetWidth;lk.ay=bd.pe.offsetTop+bd.pe.offsetHeight/2;lk.bx=b.be.offsetLeft;lk.by=b.be.offsetTop+b.be.offsetHeight/2;rmLinks.push(lk);}});
      rt+=rowH[ri]+RM_RG;});
    bd.pTop=y;bd.pH=bandH;y+=bandH+RM_BG;});
  bands.forEach(bd=>{if(bd.pTop==null)return;let r=bd.pe.offsetLeft+bd.pe.offsetWidth;bd.blocks.forEach(b=>{r=Math.max(r,b.be.offsetLeft+b.be.offsetWidth);if(b.ul)r=Math.max(r,b.ul.offsetLeft+b.ul.offsetWidth);});
    const lo=Math.min(bd.pTop,bd.pe.offsetTop),hi=Math.max(bd.pTop+bd.pH,bd.pe.offsetTop+bd.pe.offsetHeight+60);
    [...world.children].forEach(n=>{if(n.tagName==="svg"||n.classList.contains("rm-panel")||n===bd.pe)return;if(n.offsetTop>=lo-4&&n.offsetTop<hi&&n.offsetLeft>bd.pe.offsetLeft+bd.pe.offsetWidth)r=Math.max(r,n.offsetLeft+n.offsetWidth);});
    const pn=el("div",{class:"rm-panel","aria-hidden":"true"});pn.style.cssText="left:"+(bd.pe.offsetLeft-20)+"px;top:"+(lo-12)+"px;width:"+(r-bd.pe.offsetLeft+60)+"px;height:"+(hi-lo+24)+"px";pn.style.setProperty("--tone",bd.pe.dataset.tone||"#8E949E");world.insertBefore(pn,world.firstChild);});
  // below-parent elements follow their parent when dragged
  bands.forEach(bd=>{if(!bd.pid)return;bd.below.forEach(([e,g,k])=>{if(k==="addb"){e.dataset.for="p:"+bd.pid;e.dataset.dx=e.offsetLeft-bd.pe.offsetLeft;e.dataset.dy=e.offsetTop-bd.pe.offsetTop;}});});
  rmPut(np,40,y);
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
{const _r=render;render=function(){_r();try{if(page==="roadmap"&&!document.body.classList.contains("m33")){if(document.body.dataset.page!=="roadmap"){document.body.dataset.page="roadmap";try{buildNav();}catch(e){}}rmBoard();}}catch(e){console.warn(e);}};}
window.__rm=window.__rm||{};window.__rm.view=()=>({...(rmView||{x:0,y:0,k:1})});window.__rm.fit=rmFit;window.__rm.render=()=>render();
if(location.hash==="#roadmap")setTimeout(()=>{if(!document.body.classList.contains("m33")&&page!=="roadmap")setPage("roadmap");},60);
