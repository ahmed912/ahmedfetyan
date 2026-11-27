// ===== Matrix block sheet: type, tag (cells[k].tag in plans/mx-<week>), attached task, Choose / Add a task. Desktop only (not body.m33). =====
const m42Ph=()=>document.body.classList.contains("m33");
const m42={add:false,nm:"",nc:null,tnm:"",addT:false};
function m42Set(w0,k,id){const g=id&&tgGet(id);mxPut(w0,d=>{const c=d.cells[k]||(d.cells[k]={t:"o",ref:null,done:null});if(id)c.tag=id;else delete c.tag;},mxCellName(w0,k)+": "+(g?g.name:"no tag"));}
function m42TagRow(w0,k,cur){
  const chip=(id,name,color)=>el("button",{type:"button",class:"tg-chip m42-chip","data-tag":id||"none",style:"--tg:"+(color||"var(--muted)"),"aria-pressed":String(cur===id),onclick:()=>{if(cur!==id)m42Set(w0,k,id);}},name);
  const box=el("div",{class:"tg-pick m42-pick",role:"group","aria-label":"Tag"},chip(null,"No tag"),...tgAll().map(g=>chip(g.id,g.name,g.color)),
    el("button",{type:"button",class:"tg-chip m42-plus","aria-expanded":String(m42.add),onclick:()=>{m42.add=!m42.add;if(!m42.nc)m42.nc=TG_PAL[tgCfg().list.length%TG_PAL.length];sheetRefresh();}},"+ custom"));
  if(m42.add){const nin=el("input",{type:"text",class:"v3-in tg-new m42-new",dir:"auto","aria-label":"New tag name",placeholder:"New tag",maxlength:"24"});nin.value=m42.nm;nin.oninput=()=>{m42.nm=nin.value;};
    box.append(el("form",{class:"tg-form m42-form",onsubmit:e=>{e.preventDefault();const nm=m42.nm;if(tgAdd(nm,m42.nc)){m42.nm="";m42.add=false;m42.nc=null;const g=tgAll().find(x=>x.name.toLowerCase()===nm.trim().toLowerCase());if(g)m42Set(w0,k,g.id);}}},nin,
      el("span",{class:"tg-sw"},...TG_PAL.map(p=>el("button",{type:"button",class:"tg-swb","aria-label":"Colour","aria-pressed":String(p===m42.nc),style:"--tg:"+p,onclick:()=>{m42.nc=p;sheetRefresh();}}))),
      el("button",{type:"submit",class:"btn tg-add"},"Add")));}
  return box;}
const m42Open=t=>t&&t.title&&!t.done&&!t.cut&&!t.archived&&!t.deleted&&!t.bucket&&!t.sub;
function m42Choose(w0,k){let bid;const pick=id=>{psClose(true);mxPick(w0,k,"tasks:"+id);mxOpen();};
  psOpen("Choose a task",re=>{
    if(bid===undefined){const bs=bkList().filter(x=>x&&!x.archived&&!x.shipped&&!x.deleted);
      return [el("p",{class:"ps-sh-sum"},"Projects"),el("ul",{class:"ps-sh-list m42-bks"},...bs.map(b=>el("li",null,el("button",{type:"button",class:"mx-opt m42-bk","data-bk":b.id,onclick:()=>{bid=b.id;re();}},b.title,el("span",{class:"hint"},String(bkKids(b.id).filter(m42Open).length))))),
        el("li",null,el("button",{type:"button",class:"mx-opt m42-bk","data-bk":"none",onclick:()=>{bid=null;re();}},"Unbucketed")))];}
    const ts=(bid?bkKids(bid):Object.entries(state.tasks||{}).map(([id,t])=>({id,...t})).filter(t=>!t.parent&&!t.bucket)).filter(m42Open).sort((a,b)=>(a.order||0)-(b.order||0));
    return [el("button",{type:"button",class:"btn ghost m42-back",onclick:()=>{bid=undefined;re();}},"Back"),
      el("ul",{class:"ps-sh-list m42-tasks"},...(ts.length?ts.map(t=>el("li",null,el("button",{type:"button",class:"mx-opt m42-tk","data-id":t.id,onclick:()=>pick(t.id)},t.title))):[el("p",{class:"hint"},"No open tasks here")]))];},{...mxBack});}
async function m42Create(w0,k,title){title=String(title||"").trim();if(!title)return;
  const body={title,cat:"setup",parent:null,date:iso(new Date()),done:false,order:Date.now()};
  const ref=await store.add("tasks",body);state.tasks[ref.id]=body;m42.tnm="";m42.addT=false;psClose(true);mxPick(w0,k,"tasks:"+ref.id);mxOpen();}
{const _s=mxCellSheet;mxCellSheet=function(w0,k){if(m42Ph())return _s(w0,k);m42.add=false;m42.addT=false;
  psOpen("Pick for block",re=>{const v=mxCalc(w0),c=v.doc.cells[k]||{t:"o"},b=Number(k.split("|")[1]),cur=c.tag&&tgGet(c.tag)?c.tag:null,tn=mxRefName(c.ref);
    const out=[el("p",{class:"ps-sh-sum"},mxCellName(w0,k)+" · "+mxHs(v.H[b])),
      el("div",{class:"seg mx-seg"},...["w","b","o"].map(t=>el("button",{type:"button","aria-pressed":c.t===t?"true":"false",onclick:()=>mxType(w0,k,t)},MX_TN[t]))),
      el("p",{class:"hint m42-lb"},"Tag"),m42TagRow(w0,k,cur)];
    if(c.t!=="o"){
      if(v.cm[k]>0)out.push(el("p",{class:"hint mx-ach"},"Achieved "+mxMs(v.cm[k])));
      if(c.ref)out.push(el("div",{class:"m42-cur"},el("span",{class:"m42-curn"},tn||"Task"),el("button",{type:"button",class:"btn ghost m42-rm",onclick:()=>mxPick(w0,k,null)},"Remove")));
      out.push(el("div",{class:"m42-btns"},el("button",{type:"button",class:"btn ghost m42-choose",onclick:()=>{psClose(true);m42Choose(w0,k);}},"Choose a task"),
        el("button",{type:"button",class:"btn ghost m42-addt","aria-expanded":String(m42.addT),onclick:()=>{m42.addT=!m42.addT;re();}},"Add a task")));
      if(m42.addT){const ti=el("input",{type:"text",class:"v3-in m42-title",dir:"auto","aria-label":"Task title",placeholder:"Task title"});ti.value=m42.tnm;ti.oninput=()=>{m42.tnm=ti.value;};
        out.push(el("form",{class:"m42-addf",onsubmit:e=>{e.preventDefault();m42Create(w0,k,m42.tnm);}},ti,el("button",{type:"submit",class:"btn m42-addsave"},"Add")));}}
    return out;},{...mxBack});};}
{const _c=mxCellEl;mxCellEl=function(w0,k,v){const td=_c(w0,k,v);if(m42Ph())return td;try{td.querySelectorAll(".tg-mark").forEach(x=>x.remove());
  const c=v.doc.cells[k],g=c&&c.tag&&tgGet(c.tag);if(g){td.append(el("span",{class:"m42-chip-c",title:g.name},tgDot(g,"m42-dot"),el("span",{class:"m42-nm"},g.name)));td.dataset.tag=g.id;td.style.setProperty("--tg",g.color);}}catch(e){console.warn(e);}return td;};}
window.__mxtag={set:m42Set,create:m42Create};
