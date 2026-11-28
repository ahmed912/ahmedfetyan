// module57 board visuals: decorate only (classes, --tone, --p, wire classes, zoom bands)
function rmDecorate(){try{
  const root=document.getElementById("rmBody"),today=document.getElementById("rmToday");
  const bt={};try{rmParents().forEach(p=>{rmBranches(p.id).forEach(b=>{bt[b.id]=rmTone(p.id);});});}catch(e){}
  const sv=(n,k,v)=>{if(n.style.getPropertyValue(k)!==v)n.style.setProperty(k,v);};
  const td=iso(new Date());
  [root,today].forEach(r=>{if(!r)return;
    r.querySelectorAll(".rm-parent").forEach(n=>{sv(n,"--tone",r===today?"#C9A978":rmTone(n.dataset.pid));});
    r.querySelectorAll(".rm-hparent").forEach(n=>sv(n,"--tone","#9FB58F"));
    r.querySelectorAll(".rm-tparent,.rm-tbranch,.rm-ttree").forEach(n=>sv(n,"--tone","#C9A978"));
    r.querySelectorAll(".rm-branch[data-bid]").forEach(n=>{const b=n.dataset.bid,all=rmTasks(b),dn=all.filter(x=>x.done).length;
      sv(n,"--tone",bt[b]||"#8E949E");sv(n,"--p",(all.length?Math.round(dn/all.length*100):0)+"%");
      n.classList.toggle("is-paused",(state.tasks[b]||{}).bState==="paused");});
    r.querySelectorAll(".rm-hb").forEach(n=>{const p=r.querySelector('.rm-hpct[data-hid="'+n.dataset.hid+'"]');sv(n,"--tone","#9FB58F");sv(n,"--p",(p?parseInt(p.textContent,10)||0:0)+"%");});
    r.querySelectorAll(".rm-hgrid").forEach(n=>sv(n,"--tone","#9FB58F"));
    r.querySelectorAll(".rm-tree[data-bid]").forEach(n=>sv(n,"--tone",bt[n.dataset.bid]||"#8E949E"));
    r.querySelectorAll(".rm-task[data-id]").forEach(n=>{const t=state.tasks[n.dataset.id]||{};n.classList.toggle("is-waiting",!!t.waiting);n.classList.toggle("is-today",t.due===td&&!t.done);});});
  if(today){today.querySelectorAll(".rm-branch").forEach(n=>{const L=today.querySelectorAll(".rm-tree .rm-task");let d=0;L.forEach(x=>{if(x.classList.contains("done"))d++;});sv(n,"--tone","#C9A978");sv(n,"--p",(L.length?Math.round(d/L.length*100):0)+"%");});
    const tr=today.querySelector(".rm-tree");if(tr)sv(tr,"--tone","#C9A978");}
  const c=document.getElementById("rmCanvas");if(c&&rmView)c.dataset.zoom=rmView.k<.6?"far":rmView.k<.9?"mid":"near";
}catch(e){console.warn(e);}}
function rmWireClass(){try{const s=document.getElementById("rmWires");if(!s)return;const ls=rmLinks.filter(l=>l.a.isConnected&&l.b.isConnected),ps=s.children;
  ls.forEach((l,i)=>{const p=ps[i];if(!p)return;const h=l.t==="h";p.setAttribute("class",h?"rm-w1":"rm-wv");
    if(h){const t=getComputedStyle(l.a).getPropertyValue("--tone").trim()||"#8E949E";p.style.setProperty("--w",t);
      const ax=l.a.offsetLeft+l.a.offsetWidth,ay=l.a.offsetTop+l.a.offsetHeight/2,bx=l.b.offsetLeft,by=l.b.offsetTop+l.b.offsetHeight/2,m=(ax+bx)/2;p.setAttribute("d","M"+ax+" "+ay+" C"+m+" "+ay+" "+m+" "+by+" "+bx+" "+by);}});}catch(e){}}
{const _a=rmApply;rmApply=function(){_a.apply(this,arguments);try{const c=document.getElementById("rmCanvas");if(c&&rmView)c.dataset.zoom=rmView.k<.6?"far":rmView.k<.9?"mid":"near";}catch(e){}};}
{const _w=rmWires;rmWires=function(){_w.apply(this,arguments);rmDecorate();rmWireClass();};}
{const _b=rmBoard;rmBoard=function(){_b.apply(this,arguments);rmDecorate();rmWireClass();};}
{const _r=render;render=function(){_r.apply(this,arguments);rmDecorate();};}
try{window.__rm=window.__rm||{};window.__rm.zoom=rmZoomAt;}catch(e){}
