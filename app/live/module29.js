// ===== Weekly time-block matrix: Sat..Fri x Blocks 1-4, picks, achieved from workedMin. Stored in plans/mx-<sat>. =====
PS_WIDE.add("Week matrix");
const MX_T=["wwwwwww","wwwwwwb","wwowowo","bbobooo"],MX_H=[4,4,4,3],MX_TN={w:"Work",b:"Buffer",o:"Off"};
let mxS={w0:null},mxSeen=null,mxSeen2=null,mxMemo=null;
const mxNarrow=()=>window.innerWidth<700;
const mxId=w0=>"mx-"+w0;
const mxDn=(w0,i)=>fmt(addDays(w0,i),{weekday:"short"});
const mxCellName=(w0,k)=>{const [i,b]=k.split("|").map(Number);return mxDn(w0,i)+" Block "+(b+1);};
const mxClone=o=>JSON.parse(JSON.stringify(o));
function mxWeekNo(w0){const t=new Date(addDays(w0,5)+"T12:00"),j4=new Date(t.getFullYear(),0,4);return 1+Math.round(((t-j4)/864e5-3+(j4.getDay()+6)%7)/7);}
function mxTpl(){const d=(state.plans||{})["mx-default"];return d&&!d.deleted&&Array.isArray(d.types)&&d.types.length===4?{types:d.types,blockH:(d.blockH||MX_H).map(Number)}:{types:MX_T,blockH:MX_H};}
function mxFresh(w0){const T=mxTpl(),cells={};for(let i=0;i<7;i++)for(let b=0;b<4;b++)cells[i+"|"+b]={t:T.types[b][i]||"o",ref:null,done:null};
  return {kind:"matrix",week:w0,label:null,focus:"",blockH:T.blockH.slice(),cells};}
function mxDoc(w0){const d=(state.plans||{})[mxId(w0)];return d&&!d.deleted&&d.cells?d:mxFresh(w0);}
function mxPut(w0,fn,msg){const id=mxId(w0),raw=(state.plans||{})[id],old=raw?mxClone(raw):null,doc=mxClone(mxDoc(w0)),now=Date.now();
  fn(doc);doc.deleted=null;doc.upd=now;doc.created=doc.created||now;
  state.plans={...(state.plans||{}),[id]:doc};store.set("plans/"+id,doc).catch(fail);mxMemo=null;render();try{sheetRefresh();}catch(e){}
  if(msg)v3undoToast(msg,()=>{const p={...(state.plans||{})};if(old){p[id]=old;store.set("plans/"+id,old).catch(fail);}else{delete p[id];store.del("plans/"+id).catch(fail);}state.plans=p;mxMemo=null;render();try{sheetRefresh();}catch(e){}});}
function mxDelete(w0){const id=mxId(w0),raw=(state.plans||{})[id];if(!raw||raw.deleted){toast("Nothing to delete");return;}
  const old=mxClone(raw),nd={...raw,deleted:Date.now()};
  state.plans={...(state.plans||{}),[id]:nd};store.set("plans/"+id,nd).catch(fail);mxMemo=null;render();try{sheetRefresh();}catch(e){}
  v3undoToast("Week deleted",()=>{state.plans={...(state.plans||{}),[id]:old};store.set("plans/"+id,old).catch(fail);mxMemo=null;render();try{sheetRefresh();}catch(e){}});}
function mxIds(ref){if(typeof ref!=="string"||ref.indexOf("tasks:")!==0)return new Set();const id=ref.slice(6);return new Set([id,...bkDescendants(id)]);}
function mxCalc(w0){const key=[w0,iso(new Date())].join();if(mxMemo&&mxMemo.key===key&&mxMemo.p===state.plans&&mxMemo.e===state.entries&&mxMemo.t===state.tasks)return mxMemo.v;
  const doc=mxDoc(w0),H=doc.blockH.map(Number),cm={},dayW=[0,0,0,0,0,0,0],dayB=[0,0,0,0,0,0,0],blW=[0,0,0,0],blA=[0,0,0,0];let alloc=0,buf=0,off=0,ach=0;
  for(let i=0;i<7;i++){const d=addDays(w0,i),by={};
    for(let b=0;b<4;b++){const k=i+"|"+b,c=doc.cells[k]||{t:"o"};cm[k]=0;
      if(c.t==="w"){alloc+=H[b];dayW[i]+=H[b];blW[b]+=H[b];}else if(c.t==="b"){buf+=H[b];dayB[i]+=H[b];}else off+=H[b];
      if(c.ref&&c.t!=="o")(by[c.ref]=by[c.ref]||[]).push(b);}
    Object.keys(by).forEach(ref=>{const S=mxIds(ref);let m=workedMin(d,x=>typeof x.ref==="string"&&x.ref.indexOf("tasks:")===0&&S.has(x.ref.slice(6)));
      by[ref].forEach((b,j)=>{const give=j===by[ref].length-1?m:Math.min(m,H[b]*60);m-=give;cm[i+"|"+b]=give;blA[b]+=give;ach+=give;});});}
  const v={doc,H,cm,dayW,dayB,blW,blA,alloc,buf,off,ach,pct:alloc>0?Math.round(ach/60/alloc*100):0};
  mxMemo={key,p:state.plans,e:state.entries,t:state.tasks,v};return v;}
const mxShown=(c,m,h)=>c.done===true||(c.done!==false&&!!c.ref&&m>=h*60);
const mxHs=h=>(Math.round(h*10)/10)+" h";
const mxMs=m=>mxHs(m/60);
function mxRefName(ref){const t=ref&&state.tasks[ref.slice(6)];return t?t.title:"";}
// ---- actions ----
function mxPick(w0,k,ref,quiet){mxPut(w0,d=>{const c=d.cells[k];c.ref=ref;c.done=null;},quiet?null:(mxCellName(w0,k)+": "+(ref?mxRefName(ref):"cleared")));}
function mxDone(w0,k){const v=mxCalc(w0),c=v.doc.cells[k]||{t:"o"},b=Number(k.split("|")[1]),shown=mxShown(c,v.cm[k]||0,v.H[b]);
  mxPut(w0,d=>{d.cells[k].done=!shown;},(shown?"Not done: ":"Done: ")+mxCellName(w0,k));}
function mxClear(w0,k){const c=mxDoc(w0).cells[k];if(!c||(!c.ref&&c.done==null))return;
  mxPut(w0,d=>{d.cells[k].ref=null;d.cells[k].done=null;},"Cleared: "+mxCellName(w0,k));}
function mxType(w0,k,t){mxPut(w0,d=>{const c=d.cells[k];c.t=t;if(t==="o"){c.ref=null;c.done=null;}},mxCellName(w0,k)+" set to "+MX_TN[t]);}
function mxBlockH(w0,b,h){h=Math.max(0,Math.min(12,Number(h)||0));mxPut(w0,d=>{d.blockH[b]=h;},"Block "+(b+1)+": "+mxHs(h));}
function mxField(w0,f,v){mxPut(w0,d=>{if(f==="label"){v=(v||"").trim();d.label=(!v||v==="Week "+mxWeekNo(w0))?null:v;}else d.focus=(v||"").trim();},"Saved");}
function mxSaveDefault(w0){const doc=mxDoc(w0),types=[0,1,2,3].map(b=>[0,1,2,3,4,5,6].map(i=>(doc.cells[i+"|"+b]||{t:"o"}).t).join("")),blockH=doc.blockH.map(Number);
  const raw=(state.plans||{})["mx-default"],old=raw?mxClone(raw):null,nd={kind:"matrix-default",types,blockH,upd:Date.now()};
  state.plans={...(state.plans||{}),"mx-default":nd};store.set("plans/mx-default",nd).catch(fail);mxMemo=null;render();try{sheetRefresh();}catch(e){}
  v3undoToast("Saved as default",()=>{const p={...(state.plans||{})};if(old){p["mx-default"]=old;store.set("plans/mx-default",old).catch(fail);}else{delete p["mx-default"];store.del("plans/mx-default").catch(fail);}state.plans=p;mxMemo=null;render();try{sheetRefresh();}catch(e){}});}
function mxReset(w0){const T=mxTpl();mxPut(w0,d=>{d.blockH=T.blockH.slice();for(let i=0;i<7;i++)for(let b=0;b<4;b++){const c=d.cells[i+"|"+b]||(d.cells[i+"|"+b]={t:"o",ref:null,done:null});c.t=T.types[b][i]||"o";if(c.t==="o"){c.ref=null;c.done=null;}}},"Week reset to default");}
// ---- sheets ----
const mxBack={onClose:()=>setTimeout(()=>{if(!sheetStack.length&&Date.now()-(window.__psOutside||0)>400)mxOpen();},260)};
function mxCellSheet(w0,k){psOpen("Pick for block",re=>{const v=mxCalc(w0),c=v.doc.cells[k]||{t:"o"},b=Number(k.split("|")[1]);
  const mk=(r,label,hint)=>el("li",null,el("button",{type:"button",class:"mx-opt","data-ref":r||"",onclick:()=>{psClose(true);mxPick(w0,k,r);mxOpen();}},label,hint?el("span",{class:"hint"},hint):null));
  const fill=q=>{q=(q||"").trim().toLowerCase();const rows=[];
    const dated=t=>fmt(t.date,{weekday:"short"});
    if(!q){if(c.ref)rows.push(mk(null,"None"));
      bkList().filter(x=>x&&!x.archived&&!x.shipped&&!x.deleted).slice(0,6).forEach(x=>rows.push(mk("tasks:"+x.id,x.title,"bucket")));
      Object.entries(state.tasks||{}).map(([id,t])=>({id,...t})).filter(t=>!t.bucket&&!t.sub&&!t.done&&!t.deleted&&!t.cut&&t.date>=w0&&t.date<=addDays(w0,6)).sort((a,b2)=>(a.date<b2.date?-1:a.date>b2.date?1:(a.order||0)-(b2.order||0))).slice(0,6).forEach(t=>rows.push(mk("tasks:"+t.id,t.title,dated(t))));}
    else{const bs=bkList().filter(x=>x&&!x.archived&&!x.shipped&&!x.deleted).map(x=>({...x,_b:1})),ts=Object.entries(state.tasks||{}).map(([id,t])=>({id,...t})).filter(t=>!t.bucket&&!t.sub&&!t.deleted&&!t.done);
      bs.concat(ts).filter(t=>String(t.title||"").toLowerCase().includes(q)).slice(0,8).forEach(t=>rows.push(mk("tasks:"+t.id,t.title,t._b?"bucket":(t.date?dated(t):null))));}
    return rows.length?rows:[el("p",{class:"hint"},"Nothing matches")];};
  const ul=el("ul",{class:"ps-sh-list mx-opts"},...fill(""));
  const find=el("input",{class:"v3-in mx-find",type:"text",placeholder:"Find a task","aria-label":"Find a task"});
  find.addEventListener("input",()=>rc(ul,...fill(find.value)));
  return [el("p",{class:"ps-sh-sum"},mxCellName(w0,k)+" · "+mxHs(v.H[b])),
    el("div",{class:"seg mx-seg"},...["w","b","o"].map(t=>el("button",{type:"button","aria-pressed":c.t===t?"true":"false",onclick:()=>mxType(w0,k,t)},MX_TN[t]))),
    ...(c.t!=="o"?[v.cm[k]>0?el("p",{class:"hint mx-ach"},"Achieved "+mxMs(v.cm[k])):null,find,ul]:[])];},{...mxBack});}
function mxBlockSheet(w0,b){psOpen("Block hours",re=>{const H=mxDoc(w0).blockH.map(Number);
  const inp=el("input",{class:"v3-in mx-bhin",type:"number",step:"0.5",min:"0",max:"12","aria-label":"Hours"});inp.value=H[b];
  return [el("p",{class:"ps-sh-sum"},"Block "+(b+1)+", every day"),inp,
    el("button",{type:"button",class:"btn mx-bh-save",onclick:()=>{psClose(true);mxBlockH(w0,b,inp.value);mxOpen();}},"Save")];},{...mxBack});}
function mxMenu(w0){psOpen("Week options",re=>{const go=(f)=>()=>{psClose(true);f();mxOpen();};
  return [el("button",{type:"button",class:"btn ghost mx-savedef",onclick:go(()=>mxSaveDefault(w0))},"Save as default"),
    el("button",{type:"button",class:"btn ghost mx-reset",onclick:go(()=>mxReset(w0))},"Reset to default"),
    el("button",{type:"button",class:"btn ghost danger mx-del",onclick:go(()=>mxDelete(w0))},"Delete this week")];},{...mxBack});}
// ---- board ----
function mxCellEl(w0,k,v){const c=v.doc.cells[k]||{t:"o"},b=Number(k.split("|")[1]),shown=mxShown(c,v.cm[k]||0,v.H[b]);
  const td=el("td",{class:"mx-c t-"+{w:"work",b:"buf",o:"off"}[c.t]+(c.ref?" has":"")+(shown?" done":""),"data-k":k,"aria-label":mxCellName(w0,k)+": "+(mxRefName(c.ref)||MX_TN[c.t])},
    el("span",{class:"mx-cn"},mxRefName(c.ref)));
  if(c.t!=="o"){const ck=el("input",{class:"mx-ck",type:"checkbox","aria-label":"Done",onchange:()=>mxDone(w0,k)});ck.checked=shown;td.append(ck);}
  swipeable(td,()=>mxDone(w0,k),()=>mxClear(w0,k),()=>mxCellSheet(w0,k),{direct:true,directR:true});return td;}
function mxGrid(w0,v,re){const narrow=mxNarrow(),T=iso(new Date());
  const dh=i=>el("th",{class:"mx-dh"+(addDays(w0,i)===T?" today":""),scope:"row"},mxDn(w0,i)+" "+Number(addDays(w0,i).slice(8)));
  const bh=b=>el("th",null,el("button",{type:"button",class:"mx-bh","data-b":String(b),onclick:()=>mxBlockSheet(w0,b)},"Block "+(b+1),el("span",{class:"hint"},mxHs(v.H[b]))));
  const days=[0,1,2,3,4,5,6],blocks=[0,1,2,3],num=(t,x)=>el("td",Object.assign({class:"num"},x||{}),t);
  let head,rows,foot;
  if(!narrow){
    head=el("tr",null,el("th",null,""),...days.map(i=>{const h=dh(i);h.scope="col";return h;}),el("th",null,"Alloc"),el("th",null,"Achieved"));
    rows=blocks.map(b=>el("tr",null,bh(b),...days.map(i=>mxCellEl(w0,i+"|"+b,v)),num(mxHs(v.blW[b]),{class:"num mx-bw","data-b":String(b)}),num(mxMs(v.blA[b]),{class:"num mx-ba","data-b":String(b)})));
    foot=[el("tr",{class:"mx-fw"},el("th",null,"Work"),...days.map(i=>num(mxHs(v.dayW[i]))),num(mxHs(v.alloc)),num(mxMs(v.ach))),
      el("tr",{class:"mx-fb"},el("th",null,"Buffer"),...days.map(i=>num(mxHs(v.dayB[i]))),num(mxHs(v.buf)),el("td",null,""))];}
  else{
    head=el("tr",null,el("th",null,""),...blocks.map(bh),el("th",null,"Work"),el("th",null,"Buf"));
    rows=days.map(i=>el("tr",null,dh(i),...blocks.map(b=>mxCellEl(w0,i+"|"+b,v)),num(mxHs(v.dayW[i])),num(mxHs(v.dayB[i]))));
    foot=[el("tr",{class:"mx-fw"},el("th",null,"Alloc"),...blocks.map(b=>num(mxHs(v.blW[b]),{class:"num mx-bw","data-b":String(b)})),num(mxHs(v.alloc)),num(mxHs(v.buf))),
      el("tr",{class:"mx-fa"},el("th",null,"Achieved"),...blocks.map(b=>num(mxMs(v.blA[b]),{class:"num mx-ba","data-b":String(b)})),num(mxMs(v.ach)),el("td",null,""))];}
  return el("table",{class:"mx-grid"+(narrow?" narrow":"")},el("thead",null,head),el("tbody",null,...rows),el("tfoot",null,...foot));}
function mxBody(re){mxSeen=state.plans;mxSeen2=state.entries;
  const w0=mxS.w0=mxS.w0||v3wkStart(iso(new Date())),v=mxCalc(w0),doc=v.doc;
  const lab=el("input",{class:"v3-in mx-label",type:"text","aria-label":"Week label",onchange:e=>mxField(w0,"label",e.target.value)});lab.value=doc.label||"Week "+mxWeekNo(w0);
  const wk=el("input",{class:"tt-in mx-wk",type:"date","aria-label":"Week of",onchange:e=>{if(e.target.value){mxS.w0=v3wkStart(e.target.value);re();}}});wk.value=w0;
  const foc=el("input",{class:"v3-in mx-focus",type:"text",placeholder:"Focus","aria-label":"Focus",onchange:e=>mxField(w0,"focus",e.target.value)});foc.value=doc.focus||"";
  const head=el("div",{class:"mx-head"},lab,wk,el("span",{class:"hint mx-dates"},fmt(w0,{day:"numeric",month:"short"})+" to "+fmt(addDays(w0,6),{day:"numeric",month:"short"})),foc);
  swipeable(head,()=>{mxS.w0=addDays(mxS.w0,-7);re();},()=>{mxS.w0=addDays(mxS.w0,7);re();},null);
  const tile=(k,l,val)=>el("div",{class:"mx-tile","data-k":k},el("span",{class:"hint mx-tl"},l),el("span",{class:"num mx-tv"},val));
  const tiles=el("div",{class:"mx-tiles"},tile("alloc","Allocated",mxHs(v.alloc)),tile("ach","Achieved",mxMs(v.ach)),tile("pct","Completion",v.pct+"%"),tile("buf","Buffer",mxHs(v.buf)),tile("off","Off",mxHs(v.off)));
  rsLong(tiles,()=>mxMenu(w0));
  const out=[head,tiles,el("div",{class:"tr-bar mx-bar"},el("span",{style:"width:"+Math.min(100,v.pct)+"%"}))];
  let seen=false;try{seen=!!localStorage.getItem("sb-mx-tip");}catch(e){}
  if(!seen){out.push(el("p",{class:"hint mx-tip"},"Tap a block to pick. Swipe right done, left clear. Hold the totals for options."));try{localStorage.setItem("sb-mx-tip","1");}catch(e){}}
  out.push(mxGrid(w0,v,re));return out;}
function mxOpen(){mxS.w0=mxS.w0||v3wkStart(iso(new Date()));psOpen("Week matrix",re=>mxBody(re));}
// ---- Plan page row ----
function mxEntry(){const pg=document.querySelector('.page[data-page="projects"]');if(!pg||pg.hidden)return;
  const w0=v3wkStart(iso(new Date())),v=mxCalc(w0),sum=(v.doc.label||"Week "+mxWeekNo(w0))+" · "+mxMs(v.ach)+" of "+mxHs(v.alloc)+" · "+v.pct+"%";
  let sec=document.getElementById("planMatrix");
  if(!sec){sec=el("section",{id:"planMatrix",class:"bucket-sec pl-sec mx-sec","aria-label":"Week matrix"});}
  if(!sec.parentElement){const ib=document.getElementById("planInbox");if(ib&&ib.parentElement)ib.parentElement.insertBefore(sec,ib);else pg.prepend(sec);}
  if(sec.dataset.sig===sum)return;sec.dataset.sig=sum;
  rc(sec,el("button",{type:"button",class:"mx-open",onclick:()=>{mxS.w0=null;mxOpen();}},el("span",{class:"bk-title mx-st"},"Week matrix"),el("span",{class:"hint mx-sum"},sum),el("div",{class:"tr-bar"},el("span",{style:"width:"+Math.min(100,v.pct)+"%"}))));}
{const _r29=render;render=function(){_r29();try{mxEntry();const s=sheetStack[sheetStack.length-1],a=document.activeElement;
  if(s&&s.title==="Week matrix"&&(mxSeen!==state.plans||mxSeen2!==state.entries)&&!(a&&a.closest&&a.closest(".ps-sheet")&&/INPUT|TEXTAREA/.test(a.tagName))){mxSeen=state.plans;mxSeen2=state.entries;s.re();}}catch(e){console.warn(e);}};}
{const _sp29=setPage;setPage=function(p,...a){const r=_sp29(p,...a);try{mxEntry();}catch(e){}return r;};}
try{if(typeof PH_GLOSS!=="undefined")PH_GLOSS.push({id:"mx",g:"Plan",t:"Week matrix",w:"Your week as 4 blocks x 7 days. Pick a task or bucket per block. Achieved fills from logged time; a block ticks itself when its hours are logged.",ex:"Week 47: 6.5 of 68 h, 10%."});}catch(e){}
window.__mx={open:mxOpen,doc:mxDoc,calc:mxCalc,pick:mxPick,done:mxDone,clear:mxClear,type:mxType,blockH:mxBlockH,saveDefault:mxSaveDefault,reset:mxReset,del:mxDelete,weekNo:mxWeekNo,S:mxS};
