// ===== Colour tags (settings/tags) and matrix custom tasks (plans/mxc-<week>) =====
const TG_BUILT=[{id:"work",name:"Work",color:"#7f9fc4",b:1},{id:"learning",name:"Learning",color:"#c9a978",b:1},{id:"brand",name:"Personal brand",color:"#a994c9",b:1}];
const TG_PAL=["#7fb5a8","#c98f8f","#c9c27f","#8fa3c9","#b58fa9","#9fb58f","#c9a07f","#8fb0b8"];
const TG_DEF={portfolio:"work",client:"work",setup:"work",review:"work",learning:"learning",brand:"brand",linkedin:"brand"};
function tgCfg(){const d=(state.settings||{}).tags||{};return {list:Array.isArray(d.list)?d.list.filter(x=>x&&x.id&&x.name):[],map:d.map&&typeof d.map==="object"?d.map:{}};}
const tgAll=()=>TG_BUILT.concat(tgCfg().list);
const tgGet=id=>id?(tgAll().find(x=>x.id===id)||null):null;
function tgFor(t,id){const m=tgGet(tgCfg().map[id]);return m||tgGet(TG_DEF[t&&t.cat]);}
function tgDot(g,cls){return el("span",{class:"tg-mark"+(cls?" "+cls:""),style:"--tg:"+g.color,title:g.name,role:"img","aria-label":"Tag: "+g.name,"data-tag":g.id});}
function tgRefresh(){try{render();}catch(e){console.warn(e);}try{sheetRefresh();}catch(e){}}
function tgSave(next,msg){const old=(state.settings||{}).tags||null,v={list:next.list,map:next.map,at:Date.now()};
  state.settings={...(state.settings||{}),tags:v};try{store.set("settings/tags",v).catch(fail);}catch(e){fail(e);}tgRefresh();
  if(msg)v3undoToast(msg,()=>{const s={...(state.settings||{})};if(old){s.tags=old;try{store.set("settings/tags",old).catch(fail);}catch(e){}}else{delete s.tags;try{store.set("settings/tags",{list:[],map:{},at:Date.now()}).catch(fail);}catch(e){}}state.settings=s;tgRefresh();});}
function tgSetTask(id,tagId){const c=tgCfg(),map={...c.map};if(tagId)map[id]=tagId;else delete map[id];const g=tgGet(tagId);
  tgSave({list:c.list,map},tagId?"Tag: "+(g?g.name:""):"Tag back to default");}
function tgAdd(name,color){name=String(name||"").trim().slice(0,24);if(!name){toast("Type a tag name");return false;}
  if(tgAll().some(x=>x.name.toLowerCase()===name.toLowerCase())){toast("That tag exists");return false;}
  const c=tgCfg(),g={id:"c"+Date.now().toString(36)+Math.random().toString(36).slice(2,4),name,color:color||TG_PAL[c.list.length%TG_PAL.length]};
  tgSave({list:c.list.concat([g]),map:c.map},"Tag added: "+name);return true;}
function tgRename(id,name){name=String(name||"").trim().slice(0,24);const c=tgCfg();if(!name||tgAll().some(x=>x.id!==id&&x.name.toLowerCase()===name.toLowerCase())){tgRefresh();return;}
  tgSave({list:c.list.map(x=>x.id===id?{...x,name}:x),map:c.map},"Tag renamed");}
function tgColor(id,color){const c=tgCfg();tgSave({list:c.list.map(x=>x.id===id?{...x,color}:x),map:c.map},null);}
function tgDelete(id){const c=tgCfg(),g=c.list.find(x=>x.id===id);if(!g)return;tgSave({list:c.list.filter(x=>x.id!==id),map:c.map},"Tag deleted: "+g.name);}
// hold menu: tag chips
let tgMid=null;{const _tm=v3taskMenu;v3taskMenu=function(id){tgMid=id;return _tm(id);};}
PS_AFTER.push((title,body)=>{try{const id=tgMid,t=id&&state.tasks[id];if(title!=="More"||!t||t.bucket||body.querySelector(".tg-pick"))return;
  const sm=body.querySelector(".ps-sh-sum");if(!sm||sm.textContent!==t.title)return;
  const cur=tgFor(t,id),ex=tgCfg().map[id];
  const row=el("div",{class:"tg-pick",role:"group","aria-label":"Tag"},...tgAll().map(g=>el("button",{type:"button",class:"tg-chip","data-tag":g.id,style:"--tg:"+g.color,"aria-pressed":String(!!cur&&cur.id===g.id),onclick:()=>{psClose(true);tgSetTask(id,ex===g.id?null:g.id);}},g.name)));
  const anchor=[...body.querySelectorAll("button")].find(x=>/^Edit$/.test(x.textContent));if(anchor)anchor.after(row);else sm.after(row);}catch(e){console.warn(e);}});
// marks on rows
{const _vc=v3card;v3card=function(t,top,ctx){const c=_vc(t,top,ctx);try{const head=c.querySelector(".cs-head");if(head&&t&&t.id&&!head.querySelector(".tg-mark")){const g=tgFor(state.tasks[t.id]||t,t.id);if(g)head.prepend(tgDot(g));}}catch(e){console.warn(e);}return c;};}
{const _br=bkRow;bkRow=function(t,first,opts){const li=_br(t,first,opts);try{const tg=li.querySelector(".ur-tags");if(tg&&!li.querySelector(".tg-mark")){const g=tgFor(state.tasks[t.id]||t,t.id);if(g)tg.prepend(tgDot(g));}}catch(e){console.warn(e);}return li;};}
// Settings: tags
function tgSheet(){let nm="",nc=TG_PAL[tgCfg().list.length%TG_PAL.length];
  psOpen("Tags",re=>{const c=tgCfg();
    const rowFor=g=>{const li=el("li",{class:"tg-row","data-tag":g.id},tgDot(g));
      if(g.b){li.append(el("span",{class:"tg-nm",text:g.name}),el("span",{class:"hint",text:"built in"}));return li;}
      const inp=el("input",{type:"text",class:"v3-in tg-name","aria-label":"Tag name",maxlength:"24"});inp.value=g.name;inp.onchange=()=>tgRename(g.id,inp.value);
      li.append(inp,el("span",{class:"tg-sw"},...TG_PAL.map(p=>el("button",{type:"button",class:"tg-swb","aria-label":"Colour","aria-pressed":String(p===g.color),style:"--tg:"+p,onclick:()=>tgColor(g.id,p)}))));
      swipeable(li,()=>{},()=>tgDelete(g.id),null,{direct:true,directR:true});return li;};
    const nin=el("input",{type:"text",class:"v3-in tg-new","aria-label":"New tag name",placeholder:"New tag",maxlength:"24"});nin.value=nm;nin.oninput=()=>{nm=nin.value;};
    const form=el("form",{class:"tg-form",onsubmit:e=>{e.preventDefault();if(tgAdd(nm,nc)){nm="";nc=TG_PAL[(tgCfg().list.length)%TG_PAL.length];}}},nin,
      el("span",{class:"tg-sw"},...TG_PAL.map(p=>el("button",{type:"button",class:"tg-swb","aria-label":"Colour","aria-pressed":String(p===nc),style:"--tg:"+p,onclick:()=>{nc=p;re();}}))),
      el("button",{type:"submit",class:"btn tg-add"},"Add"));
    return [el("p",{class:"ps-sh-sum",text:"Colour tags"}),el("ul",{class:"tg-list"},...tgAll().map(rowFor)),form,el("p",{class:"hint",text:"Swipe a custom tag left to delete. Set a task's tag from its hold menu."})];});}
function tgRow(){const rows=document.querySelector('.page[data-page="settings"] .set-rows');if(!rows||document.getElementById("tgRow"))return;
  rows.append(el("div",{class:"set-row",id:"tgRow"},el("div",{},el("b",{text:"Tags"}),el("span",{class:"hint",text:"Work, Learning, Personal brand and your own colour tags"})),el("button",{type:"button",class:"btn ghost",id:"tgBtn",onclick:tgSheet},"Open")));}
{const _r=render;render=function(){_r();try{tgRow();}catch(e){}};}
window.__tags={get:x=>{if(!x)return null;let g=null;if(typeof x==="string"){const t=state.tasks[x.indexOf("tasks:")===0?x.slice(6):x];g=t?tgFor(t,x.indexOf("tasks:")===0?x.slice(6):x):tgGet(x);}else if(x.id&&state.tasks[x.id])g=tgFor(state.tasks[x.id],x.id);else g=tgGet(x.tag)||tgFor(x,x.id);return g?{id:g.id,name:g.name,color:g.color}:null;},list:()=>tgAll().map(g=>({id:g.id,name:g.name,color:g.color})),dot:tgDot};
window.__tg={cfg:tgCfg,all:tgAll,forTask:id=>{const t=state.tasks[id];const g=t&&tgFor(t,id);return g?g.id:null;},set:tgSetTask,add:tgAdd,rename:tgRename,del:tgDelete,sheet:tgSheet};
