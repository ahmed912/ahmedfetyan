// ===== Colour tags (plans/tg-tags) and matrix custom tasks (plans/mxc-<week>) =====
const TG_BUILT=[{id:"work",name:"Work",color:"#7f9fc4",b:1},{id:"learning",name:"Learning",color:"#c9a978",b:1},{id:"brand",name:"Personal brand",color:"#a994c9",b:1}];
const TG_PAL=["#7fb5a8","#c98f8f","#c9c27f","#8fa3c9","#b58fa9","#9fb58f","#c9a07f","#8fb0b8"];
const TG_DEF={portfolio:"work",client:"work",setup:"work",review:"work",learning:"learning",brand:"brand",linkedin:"brand"};
const TG_DOC="tg-tags";function tgRaw(){const p=(state.plans||{})[TG_DOC];return p&&!p.deleted?p:((state.settings||{}).tags||{});}
function tgCfg(){const d=tgRaw();return {list:Array.isArray(d.list)?d.list.filter(x=>x&&x.id&&x.name):[],map:d.map&&typeof d.map==="object"?d.map:{},over:d.over&&typeof d.over==="object"?d.over:{},created:d.created||null};}
const tgAll=()=>{const c=tgCfg();return TG_BUILT.map(g=>({...g,...(c.over[g.id]||{}),b:1})).concat(c.list.filter(x=>!x.deleted).sort((a,b)=>(a.ord??1e9)-(b.ord??1e9)));};
const tgGet=id=>id?(tgAll().find(x=>x.id===id)||null):null;
function tgFor(t,id){const m=tgGet(tgCfg().map[id]);return m||tgGet(TG_DEF[t&&t.cat]);}
function tgDot(g,cls){return el("span",{class:"tg-mark"+(cls?" "+cls:""),style:"--tg:"+g.color,title:g.name,role:"img","aria-label":"Tag: "+g.name,"data-tag":g.id});}
function tgRefresh(){try{render();}catch(e){console.warn(e);}try{sheetRefresh();}catch(e){}}
function tgSave(next,msg){const c0=tgCfg(),now=Date.now(),old=(state.plans||{})[TG_DOC]?mxClone(state.plans[TG_DOC]):null;next={list:c0.list,map:c0.map,over:c0.over,...next};
  const v={kind:"tags",list:next.list,map:next.map,over:next.over,created:c0.created||now,upd:now};state.plans={...(state.plans||{}),[TG_DOC]:v};store.set("plans/"+TG_DOC,v).catch(fail);tgRefresh();
  if(msg)v3undoToast(msg,()=>{const back=old?{...old,upd:Date.now()}:{kind:"tags",list:c0.list,map:c0.map,over:c0.over,created:now,upd:Date.now()};state.plans={...(state.plans||{}),[TG_DOC]:back};store.set("plans/"+TG_DOC,back).catch(fail);tgRefresh();});}
function tgSetTask(id,tagId){const c=tgCfg(),map={...c.map};if(tagId)map[id]=tagId;else delete map[id];const g=tgGet(tagId);
  tgSave({map},tagId?"Tag: "+(g?g.name:""):"Tag back to default");}
function tgAdd(name,color){name=String(name||"").trim().slice(0,24);if(!name){toast("Type a tag name");return false;}
  if(tgAll().some(x=>x.name.toLowerCase()===name.toLowerCase())){toast("That tag exists");return false;}
  const c=tgCfg(),g={id:"c"+Date.now().toString(36)+Math.random().toString(36).slice(2,4),name,color:color||TG_PAL[c.list.length%TG_PAL.length],ord:c.list.filter(x=>!x.deleted).length,created:Date.now(),upd:Date.now()};
  tgSave({list:c.list.concat([g])},"Tag added: "+name);return true;}
function tgEdit(id,patch,msg){const c=tgCfg();if(TG_BUILT.some(x=>x.id===id))tgSave({over:{...c.over,[id]:{...(c.over[id]||{}),...patch,upd:Date.now()}}},msg);
  else tgSave({list:c.list.map(x=>x.id===id?{...x,...patch,upd:Date.now()}:x)},msg);}
function tgRename(id,name){name=String(name||"").trim().slice(0,24);
  if(!name){toast("Type a tag name");tgRefresh();return;}
  if(tgAll().some(x=>x.id!==id&&x.name.toLowerCase()===name.toLowerCase())){toast("That tag exists");tgRefresh();return;}
  tgEdit(id,{name},"Tag renamed");}
function tgColor(id,color){tgEdit(id,{color},"Colour changed");}
function tgDelete(id){const c=tgCfg(),g=c.list.find(x=>x.id===id&&!x.deleted);if(!g)return;tgSave({list:c.list.map(x=>x.id===id?{...x,deleted:Date.now(),upd:Date.now()}:x)},"Tag deleted: "+g.name);}
// hold menu: tag chips
let tgMid=null;{const _tm=v3taskMenu;v3taskMenu=function(id){tgMid=id;return _tm(id);};}
PS_AFTER.push((title,body)=>{try{const id=tgMid,t=id&&state.tasks[id];if(title!=="More"||!t||t.bucket||body.querySelector(".tg-pick"))return;
  const sm=body.querySelector(".ps-sh-sum");if(!sm||sm.textContent!==t.title)return;
  const cur=tgFor(t,id),ex=tgCfg().map[id];
  const row=el("div",{class:"tg-pick",role:"group","aria-label":"Tag"},...tgAll().map(g=>el("button",{type:"button",class:"tg-chip",dir:"auto","data-tag":g.id,style:"--tg:"+g.color,"aria-pressed":String(!!cur&&cur.id===g.id),onclick:()=>{psClose(true);tgSetTask(id,ex===g.id?null:g.id);}},g.name)));
  const anchor=[...body.querySelectorAll("button")].find(x=>/^Edit$/.test(x.textContent));if(anchor)anchor.after(row);else sm.after(row);}catch(e){console.warn(e);}});
// marks on rows
{const _vc=v3card;v3card=function(t,top,ctx){const c=_vc(t,top,ctx);try{const head=c.querySelector(".cs-head");if(head&&t&&t.id&&!head.querySelector(".tg-mark")){const g=tgFor(state.tasks[t.id]||t,t.id);if(g){const cc=head.querySelector(".cat-chip");if(cc)cc.prepend(tgDot(g));else{const h=head.querySelector(".cs-t");h?h.after(tgDot(g)):head.append(tgDot(g));}}}}catch(e){console.warn(e);}return c;};}
{const _mc=mxCellEl;mxCellEl=function(w0,k,v){const td=_mc(w0,k,v);try{const c=v.doc.cells[k];if(c&&c.ref&&c.ref.indexOf("tasks:")===0){const id=c.ref.slice(6),t=state.tasks[id],g=t&&tgFor(t,id);if(g)td.append(tgDot(g,"tg-cell"));}}catch(e){}return td;};}
{const _br=bkRow;bkRow=function(t,first,opts){const li=_br(t,first,opts);try{const tg=li.querySelector(".ur-tags");if(tg&&!li.querySelector(".tg-mark")){const g=tgFor(state.tasks[t.id]||t,t.id);if(g)tg.prepend(tgDot(g));}}catch(e){console.warn(e);}return li;};}
// Settings: tags
function tgSheet(){let nm="",nc=TG_PAL[tgCfg().list.length%TG_PAL.length];
  psOpen("Tags",re=>{const c=tgCfg();
    const rowFor=g=>{const li=el("li",{class:"tg-row","data-tag":g.id,"data-id":g.id},tgDot(g));if(!g.b)li.dataset.custom="1";
      const inp=el("input",{type:"text",class:"v3-in tg-name",dir:"auto","aria-label":"Tag name",maxlength:"24"});inp.value=g.name;inp.onchange=()=>tgRename(g.id,inp.value);
      li.append(inp);if(g.b)li.append(el("span",{class:"hint",text:"built in"}));
      li.append(el("span",{class:"tg-sw"},...TG_PAL.map(p=>el("button",{type:"button",class:"tg-swb","aria-label":"Colour","aria-pressed":String(p===g.color),style:"--tg:"+p,onclick:()=>tgColor(g.id,p)}))));
      if(!g.b)swipeable(li,()=>{},()=>tgDelete(g.id),null,{direct:true,directR:true});return li;};
    const nin=el("input",{type:"text",class:"v3-in tg-new",dir:"auto","aria-label":"New tag name",placeholder:"New tag",maxlength:"24"});nin.value=nm;nin.oninput=()=>{nm=nin.value;};
    const form=el("form",{class:"tg-form",onsubmit:e=>{e.preventDefault();if(tgAdd(nm,nc)){nm="";nc=TG_PAL[(tgCfg().list.length)%TG_PAL.length];}}},nin,
      el("span",{class:"tg-sw"},...TG_PAL.map(p=>el("button",{type:"button",class:"tg-swb","aria-label":"Colour","aria-pressed":String(p===nc),style:"--tg:"+p,onclick:()=>{nc=p;re();}}))),
      el("button",{type:"submit",class:"btn tg-add"},"Add"));
    const ul=el("ul",{class:"tg-list"},...tgAll().map(rowFor));
    v3dragList(ul,".tg-row[data-custom]",ids=>{const c=tgCfg(),cur=c.list.filter(x=>!x.deleted).sort((a,b)=>(a.ord??1e9)-(b.ord??1e9)).map(x=>x.id);if(ids.join()===cur.join())return;tgSave({list:c.list.map(x=>{const i=ids.indexOf(x.id);return i<0?x:{...x,ord:i,upd:Date.now()};})},"Tags reordered");});
    return [el("p",{class:"ps-sh-sum",text:"Colour tags"}),ul,form,el("p",{class:"hint",text:"Hold a custom tag by its dot to drag it. Swipe left to delete. Set a task's tag from its hold menu."})];});}
function tgRow(){if(document.body.classList.contains("m33"))return;const rows=document.querySelector('.page[data-page="settings"] .set-rows');if(!rows||document.getElementById("tgRow"))return;
  rows.append(el("div",{class:"set-row",id:"tgRow"},el("div",{},el("b",{text:"Tags"}),el("span",{class:"hint",text:"Work, Learning, Personal brand and your own colour tags"})),el("button",{type:"button",class:"btn ghost",id:"tgBtn",onclick:tgSheet},"Open")));}
{const _r=render;render=function(){_r();try{tgRow();}catch(e){}};}
window.__tags={get:x=>{if(!x)return null;let g=null;if(typeof x==="string"){const t=state.tasks[x.indexOf("tasks:")===0?x.slice(6):x];g=t?tgFor(t,x.indexOf("tasks:")===0?x.slice(6):x):tgGet(x);}else if(x.id&&state.tasks[x.id])g=tgFor(state.tasks[x.id],x.id);else g=tgGet(x.tag)||tgFor(x,x.id);return g?{id:g.id,name:g.name,color:g.color}:null;},list:()=>tgAll().map(g=>({id:g.id,name:g.name,color:g.color})),dot:tgDot};
window.__tg={cfg:tgCfg,all:tgAll,forTask:id=>{const t=state.tasks[id];const g=t&&tgFor(t,id);return g?g.id:null;},set:tgSetTask,color:tgColor,raw:tgRaw,add:tgAdd,rename:tgRename,del:tgDelete,sheet:tgSheet};
