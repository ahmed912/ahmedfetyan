// unused, removed 27 Nov by user order
// ===== Matrix custom tasks: own doc plans/mxc-<sat>. Never in tasks, not in sprints, not in sprint load. =====
const mcId=w0=>"mxc-"+w0;
function mcDoc(w0){const d=(state.plans||{})[mcId(w0)];return d&&!d.deleted&&Array.isArray(d.items)?d:{kind:"matrix-custom",week:w0,items:[],hidden:[]};}
function mcPut(w0,fn,msg){const id=mcId(w0),raw=(state.plans||{})[id],old=raw?mxClone(raw):null,doc=mxClone(mcDoc(w0)),now=Date.now();
  doc.hidden=doc.hidden||[];fn(doc);doc.deleted=null;doc.upd=now;doc.created=doc.created||now;
  state.plans={...(state.plans||{}),[id]:doc};store.set("plans/"+id,doc).catch(fail);mxMemo=null;render();try{sheetRefresh();}catch(e){}
  if(msg)v3undoToast(msg,()=>{const p={...(state.plans||{})};if(old){const b={...old,upd:Date.now()};p[id]=b;store.set("plans/"+id,b).catch(fail);}else{const e={kind:"matrix-custom",week:w0,items:[],hidden:[],created:now,upd:Date.now()};p[id]=e;store.set("plans/"+id,e).catch(fail);}state.plans=p;mxMemo=null;render();try{sheetRefresh();}catch(e){}});}
const mcLive=w0=>mcDoc(w0).items.filter(x=>!x.deleted);
function mcAdd(w0,o){const t=String(o.title||"").trim();if(!t)return;
  mcPut(w0,d=>{d.items.push({id:"c"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),title:t,day:Math.max(0,Math.min(6,Number(o.day)||0)),min:Math.max(0,Number(o.min)||0),tag:o.tag||null,done:false,ord:mcLive(w0).length,created:Date.now(),upd:Date.now()});},"Added: "+t);}
function mcEdit(w0,id,o){mcPut(w0,d=>{const x=d.items.find(y=>y.id===id);if(!x)return;if(o.title!=null&&String(o.title).trim())x.title=String(o.title).trim();if(o.day!=null)x.day=Math.max(0,Math.min(6,Number(o.day)||0));if(o.min!=null)x.min=Math.max(0,Number(o.min)||0);if("tag" in o)x.tag=o.tag||null;x.upd=Date.now();},"Saved");}
function mcTick(w0,id){const q=mcLive(w0).find(y=>y.id===id);if(!q)return;const msg=q.done?"Not done: "+q.title:"Done: "+q.title;try{localStorage.setItem("mc-tip","1")}catch(e){}mcPut(w0,d=>{const x=d.items.find(y=>y.id===id);if(x){x.done=!x.done;x.upd=Date.now();}},msg);}
function mcDel(w0,id){const x=mcLive(w0).find(y=>y.id===id);if(!x)return;try{localStorage.setItem("mc-tip","1")}catch(e){}mcPut(w0,d=>{const y=d.items.find(z=>z.id===id);if(y){y.deleted=Date.now();y.upd=Date.now();}},"Deleted: "+x.title);}
function mcHide(w0,ref){mcPut(w0,d=>{if(d.hidden.indexOf(ref)<0)d.hidden.push(ref);},"Removed from matrix: "+(mxRefName(ref)||"task"));}
function mcDoneMin(w0){return mcLive(w0).filter(x=>x.done).reduce((s,x)=>s+Number(x.min||0),0);}
{const _c=mxCalc;let memo=null;mxCalc=function(w0){const v=_c(w0),cd=(state.plans||{})[mcId(w0)];if(memo&&memo.v===v&&memo.cd===cd)return memo.r;
  const add=mcDoneMin(w0),ach=v.ach+add,r=add?{...v,ach,pct:v.alloc>0?Math.round(ach/60/v.alloc*100):0,custMin:add}:v;memo={v,cd,r};return r;};}
try{window.__mx.calc=mxCalc;}catch(e){}
function mcTagMark(x){try{const T=window.__tags;if(!T)return null;const m=T.get&&T.get(x);if(!m||!m.name)return null;return el("span",{class:"mc-tag",dir:"auto",title:m.name,style:"--tg:"+(m.color||"")},m.name);}catch(e){return null;}}
function mcTags(){try{const l=window.__tags&&window.__tags.list&&window.__tags.list();return Array.isArray(l)?l:[];}catch(e){return [];}}
function mcReorder(w0,ids){mcPut(w0,d=>{ids.forEach((i,n)=>{const y=d.items.find(z=>z.id===i);if(y){y.ord=n;y.upd=Date.now();}});},"Reordered");}
let mcHeld=null;
function mcMenu(w0,id){const x=mcLive(w0).find(y=>y.id===id);if(!x)return;try{localStorage.setItem("mc-tip","1")}catch(e){}psOpen(x.title,()=>[el("button",{type:"button",class:"btn ghost",onclick:()=>{psClose(true);mcSheet(w0,id);}},"Edit"),el("button",{type:"button",class:"btn ghost",onclick:()=>{psClose(true);mcTick(w0,id);mxOpen();}},x.done?"Not done":"Done"),el("button",{type:"button",class:"btn ghost",onclick:()=>{psClose(true);mcDel(w0,id);mxOpen();}},"Delete")],{...mxBack});}
function mcSheet(w0,id){const ex=id?mcLive(w0).find(y=>y.id===id):null;
  psOpen(ex?"Edit task":"Add task",re=>{
    const ti=el("input",{class:"v3-in mc-title",dir:"auto",type:"text",placeholder:"Title","aria-label":"Title"});ti.value=ex?ex.title:"";
    const dy=el("select",{class:"v3-in mc-day","aria-label":"Day"},...[0,1,2,3,4,5,6].map(i=>el("option",{value:String(i)},mxDn(w0,i))));dy.value=String(ex?ex.day:0);
    const mi=el("input",{class:"v3-in mc-min",type:"number",min:"0",step:"5",placeholder:"Minutes","aria-label":"Minutes"});mi.value=ex?ex.min:60;
    const tg=mcTags(),ts=tg.length?el("select",{class:"v3-in mc-tagsel","aria-label":"Tag"},el("option",{value:""},"No tag"),...tg.map(t=>el("option",{value:t.id},t.name))):null;if(ts)ts.value=ex&&ex.tag||"";
    return [ti,dy,mi,ts,el("button",{type:"button",class:"btn mc-save",onclick:()=>{const o={title:ti.value,day:dy.value,min:mi.value,tag:ts?ts.value:null};psClose(true);if(ex)mcEdit(w0,id,o);else mcAdd(w0,o);mxOpen();}},"Save")];},{...mxBack});}
function mcSection(w0){const doc=mcDoc(w0),hid=doc.hidden||[],rows=[];
  const sp=Object.entries(state.tasks||{}).map(([id,t])=>({id,...t})).filter(t=>!t.bucket&&!t.sub&&!t.deleted&&!t.cut&&t.date>=w0&&t.date<=addDays(w0,6)&&hid.indexOf("tasks:"+t.id)<0).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
  const cu=mcLive(w0);
  const row=(cls,day,title,min,x,onR,onL,onT,done)=>{const r=el("li",{class:"mc-row "+cls+(done?" done":""),"data-id":x.id},el("span",{class:"mc-d"},day),el("span",{class:"mc-t",dir:"auto",title},title),mcTagMark(x.tagItem||x)||null,min?el("span",{class:"hint mc-m"},min+" min"):null);
    swipeable(r,onR,onL,onT,{direct:true,directR:!!onR});return r;};
  cu.slice().sort((a,b)=>(a.ord??1e9)-(b.ord??1e9)||a.day-b.day).forEach(x=>rows.push(row("mc-c",mxDn(w0,x.day),x.title,x.min,x,()=>mcTick(w0,x.id),()=>mcDel(w0,x.id),()=>mcSheet(w0,x.id),x.done)));
  sp.forEach(t=>rows.push(row("mc-s",fmt(t.date,{weekday:"short"}),t.title,0,t,null,()=>mcHide(w0,"tasks:"+t.id),null,t.done)));
  rows.forEach(r=>{if(r.classList.contains("mc-c"))r.addEventListener("pointerdown",()=>{mcHeld=r.dataset.id;});});
  const ul=el("ul",{class:"mc-list"},...rows);
  v3dragList(ul,".mc-row.mc-c",ids=>{const cur=[...ul.querySelectorAll(".mc-row.mc-c")].map(r=>r.dataset.id);if(ids.join()===cur.join()){if(mcHeld)mcMenu(w0,mcHeld);return;}mcReorder(w0,ids);});
  return el("section",{class:"mc-sec","aria-label":"Custom tasks"},el("div",{class:"mc-h"},el("span",{class:"hint"},"Custom tasks"),el("button",{type:"button",class:"mc-add",onclick:()=>mcSheet(w0,null)},"Add task")),
    !cu.length?el("p",{class:"hint mc-none"},"No custom tasks this week"):null,rows.length?ul:null,
    localStorage.getItem("mc-tip")?null:el("p",{class:"hint mc-tip"},"Swipe right to tick, left to delete or remove a sprint task from this matrix. Hold to drag or open the menu."));}
{const _g=mxGrid;mxGrid=function(w0,v,re){const g=_g(w0,v,re),hid=mcDoc(w0).hidden||[];
  try{hid.forEach(r=>{g.querySelectorAll("td.mx-c.has").forEach(td=>{const c=v.doc.cells[td.dataset.k];if(c&&c.ref===r){const n=td.querySelector(".mx-cn");if(n)n.textContent="";td.classList.remove("has");}});});}catch(e){}
  const wrap=el("div",{class:"mc-wrap"},g,mcSection(w0));return wrap;};}
window.__mxc={doc:mcDoc,add:mcAdd,edit:mcEdit,tick:mcTick,del:mcDel,hide:mcHide,live:mcLive};
