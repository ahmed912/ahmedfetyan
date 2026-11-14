
// ===== Round 5: sprints with buffer days =====
// Settings: sprintCfg {days:14, buffer:4}. A sprint may carry its own `buffer` (array of dates); otherwise buffer days are derived:
// every Friday counts, then the last working days of the sprint fill the rest up to the buffer count.
function spCfg(){const c=(state.settings&&state.settings.sprintCfg)||{},days=Math.min(28,Math.max(7,Math.round(Number(c.days))||14)),buffer=Math.min(days-3,Math.max(0,c.buffer==null?4:Math.round(Number(c.buffer))));return {days,buffer:isNaN(buffer)?4:buffer};}
function spDates(sp){const out=[];for(let d=sp.start;d<=sp.end&&out.length<60;d=addDays(d,1))out.push(d);return out;}
function spBufferOf(sp){if(!sp)return [];const all=spDates(sp);
  if(Array.isArray(sp.buffer))return all.filter(d=>sp.buffer.includes(d));
  const cfg=spCfg(),fr=all.filter(isFriday),want=Math.max(fr.length,Math.min(cfg.buffer,Math.round(all.length*cfg.buffer/cfg.days))),out=new Set(fr);
  for(let i=all.length-1;i>=0&&out.size<want;i--)out.add(all[i]);
  return all.filter(d=>out.has(d));}
function spBufferSet(sp){return new Set(spBufferOf(sp));}
function spCap(sp){const all=spDates(sp),buf=spBufferSet(sp),cfg=chCfg(),tH=Number(cfg.b1.h)+Number(cfg.b2.h),planned=all.filter(d=>!buf.has(d)),reserve=all.filter(d=>buf.has(d)&&!isFriday(d));
  return {total:all.length,planned:planned.length,buffer:all.filter(d=>buf.has(d)).length,workH:planned.length*tH,learnMin:planned.length*cfg.learn.minMin,reserveH:reserve.length*tH,reserveDays:reserve.length,tH};}
const spBufLine=sp=>{const c=spCap(sp);return c.planned+" planned + "+c.buffer+" buffer days";};
// saving sprintCfg, with Undo
function spSaveCfg(next){const cur=spCfg();if(cur.days===next.days&&cur.buffer===next.buffer)return;const old=(state.settings||{}).sprintCfg||{days:14,buffer:4,at:0},v={...next,at:Date.now()};state.settings={...(state.settings||{}),sprintCfg:v};
  try{store.set("settings/sprintCfg",v);}catch(e){fail(e);}
  v3undoToast("Sprint settings saved: "+v.days+" days, "+v.buffer+" buffer",()=>{const s={...(state.settings||{})};if(old){s.sprintCfg=old;try{store.set("settings/sprintCfg",old);}catch(e){}}else{delete s.sprintCfg;try{store.del("settings/sprintCfg");}catch(e){}}state.settings=s;render();});render();}
function spCfgSheet(){psOpen("Sprint length",re=>{const cfg=spCfg();
    const num=(v,lab,fn,min,max)=>{const i=el("input",{type:"number",class:"v3-in",step:"1",min:String(min),max:String(max),value:String(v),"aria-label":lab});i.onchange=()=>fn(Number(i.value));return el("label",{class:"field"},el("span",{class:"label",text:lab}),i);};
    return [el("p",{class:"hint",text:"Default is 14 days: 10 planned and 4 buffer. Every Friday counts as a buffer day. Applies to sprints without their own buffer days."}),
      el("div",{class:"v3-row"},num(cfg.days,"Sprint length (days)",v=>{if(!(v>=7&&v<=28)){toast("Length between 7 and 28 days");re();return;}spSaveCfg({days:v,buffer:Math.min(cfg.buffer,v-3)});setTimeout(re,200);},7,28),
        num(cfg.buffer,"Buffer days",v=>{if(!(v>=0&&v<=cfg.days-3)){toast("Buffer between 0 and "+(cfg.days-3));re();return;}spSaveCfg({days:cfg.days,buffer:v});setTimeout(re,200);},0,cfg.days-3)),
      el("p",{class:"hint",text:"Buffer days carry no planned load. They take overflow and moved work. Fridays stay rest days."})];});}
function spSettingsRow(){const rows=document.querySelector('.page[data-page="settings"] .set-rows');if(!rows||document.getElementById("spCfgRow"))return;const c=spCfg();
  rows.append(el("div",{class:"set-row",id:"spCfgRow"},el("div",{},el("b",{text:"Sprint length"}),el("span",{class:"hint",id:"spCfgSum",text:c.days+" days: "+(c.days-c.buffer)+" planned, "+c.buffer+" buffer"})),el("button",{type:"button",class:"btn ghost",id:"spCfgBtn",onclick:spCfgSheet},"Open")));}
// one sprint: toggle a day between planned and buffer (with Undo)
function spToggleDay(sp,d){const cur=spBufferOf(sp),on=cur.includes(d),next=on?cur.filter(x=>x!==d):[...cur,d].sort(),old=Array.isArray(sp.buffer)?sp.buffer.slice():null;
  patchSprint(sp.n,{buffer:next});
  v3undoToast((on?fmt(d,{weekday:"short",day:"numeric",month:"short"})+" is a planned day":fmt(d,{weekday:"short",day:"numeric",month:"short"})+" is a buffer day")+" · "+spBufLine({...sp,buffer:next}),()=>{patchSprint(sp.n,{buffer:old});});}
function spDaysCard(sp,re){const c=spCap(sp),buf=spBufferSet(sp),h=n=>(Math.round(n*10)/10)+" h";
  const chips=spDates(sp).map(d=>{const b=buf.has(d);return el("button",{type:"button",class:"mini sp-day"+(b?" sp-buf":""),"data-d":d,"aria-pressed":String(b),title:b?"Buffer day. Tap to plan it.":"Planned day. Tap to make it a buffer day.",onclick:()=>{spToggleDay(sp,d);setTimeout(re,250);}},fmt(d,{weekday:"short"}).slice(0,2)+" "+Number(d.slice(8)));});
  return el("section",{class:"v3-ncard sp-cap"},el("div",{class:"lh-wh"},el("b",{text:"Days"}),el("span"),el("span",{class:"hint num",id:"spLine",text:spBufLine(sp)})),
    el("p",{class:"hint",id:"spCapLine",text:"Work capacity "+h(c.workH)+" ("+c.planned+" days x "+h(c.tH)+") · Learning minimum "+c.learnMin+" min · Buffer reserve "+h(c.reserveH)+(c.reserveDays?" ("+c.reserveDays+" days)":" (Fridays only)")}),
    el("div",{class:"v3-cats sp-days"},...chips),
    el("p",{class:"hint",text:"Buffer days carry no planned load. They take overflow and moved work. Tap a day to change it."}));}
// Today: a visible line on a buffer day
function spDayNote(){const f=document.querySelector(".dbar-focus");if(!f)return;let n=f.querySelector(".sp-note");const sp=v3spOf(sel),b=sp&&spBufferSet(sp).has(sel);
  if(!b){if(n)n.remove();return;}if(!n){n=el("p",{class:"hint sp-note"});f.append(n);}
  n.textContent=isFriday(sel)?"Buffer day (Friday rest). No planned load.":"Buffer day. No planned load: overflow and moved work land here.";}
{const _r10=render;render=function(){_r10();try{spSettingsRow();spDayNote();}catch(e){console.warn(e);}};}
// overflow: planned days of the sprint first, then its buffer days, then the next sprints
function rlPlaceSp(groups,from,n,sim,o){const all=rlDays(from,n),sp=v3spOf(from);if(!sp)return rlPlace(groups,all,sim,o);
  const r1=rlPlace(groups,all.filter(d=>d<=sp.end),sim,o);let left=groups.map(g=>({...g,tasks:g.tasks.filter(t=>r1.wait.includes(t.id))})).filter(g=>g.tasks.length);
  let placed=r1.placed.slice(),over=[];
  if(left.length){const bufs=all.filter(d=>d<=sp.end&&spBufferSet(sp).has(d)&&!isFriday(d)),r2=rlPlace(left,bufs,sim,{...o,allowBuf:true});r2.placed.forEach(p=>{p.overflow=true;});placed=placed.concat(r2.placed);over=r2.placed;
    left=left.map(g=>({...g,tasks:g.tasks.filter(t=>r2.wait.includes(t.id))})).filter(g=>g.tasks.length);}
  let wait=[];if(left.length){const r3=rlPlace(left,all.filter(d=>d>sp.end),sim,o);placed=placed.concat(r3.placed);wait=r3.wait;}
  return {placed,wait,over};}
window.__sp={cfgSheet:spCfgSheet,board:n=>v3boardSheet(n),bufferOf:n=>spBufferOf(sprints().find(p=>p.n===n)),cap:n=>spCap(sprints().find(p=>p.n===n)),cfg:spCfg};
