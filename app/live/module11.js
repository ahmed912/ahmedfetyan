// ===== Round 11: capacity per chunk: work, learning, shallow, recovery. Baseline (the standard) and stretch (one tap more). chunkCap(d,block) is the one place that says how much a block holds. =====
// Serves overwhelm and stakes: a holdable day, shown as facts before it breaks; recovery is never offered as free time.
const CAP_WD=["sun","mon","tue","wed","thu","fri","sat"],CAP_WN={sat:"Sat",sun:"Sun",mon:"Mon",tue:"Tue",wed:"Wed",thu:"Thu"};
function capCfg(){const c=(state.settings&&state.settings.cap)||{};return {wd:c.wd||{},dates:c.dates||{}};}
function capRec(){const r=(state.settings&&state.settings.recovery)||{},h=Number(r.sleepMinH);return {sleepMinH:h>=4&&h<=12?h:7,sleepFrom:/^\d{2}:\d{2}$/.test(r.sleepFrom||"")?r.sleepFrom:"21:30"};}
// the work baseline of one day, in minutes (a date override beats the weekday, the weekday beats the default)
function capDayMin(d,base){const c=capCfg(),h=Number(c.dates[d])||Number(c.wd[CAP_WD[parse(d).getDay()]])||0;return h>0?Math.round(h*50):base;}
function chunkCap(d,k){const cfg=chCfg(),base=Math.round(v3dayMin(d)/50*60),b1=Math.min(Math.round(cfg.b1.h*60),base);
  if(k==="b1")return b1;if(k==="b2")return Math.max(0,base-b1);if(k==="b3")return Math.round(cfg.b3.h*60);
  if(k==="learn")return cfg.learn.targetMin;if(k==="shallow")return cfg.shallowMin;return 0;}
// minutes a chunk holds beyond its block (amber, never a stop)
function capUsed(c){return c.tasks.reduce((a,t)=>a+estMin(t),0);}
function capOver(c){return capUsed(c)-chunkCap(c.key.slice(0,10),c.kind);}
function capOverText(c){const o=capOver(c);return o>0&&c.tasks.some(t=>!t.done)?" · over by "+dur(o):"";}
// one line per day: what each block holds
function capDayFacts(d){if(isFriday(d))return "Rest day";const ch=chunksOn(d),by={};ch.forEach(c=>{by[c.kind]=c;});const h=m=>(Math.round(m/6)/10);
  const bl=k=>{const c=by[k],cap=chunkCap(d,k),u=c.tasks.reduce((a,t)=>a+estMin(t),0),names=[...new Set(c.tasks.map(t=>chBkName(chBk(t))))];
    return (k==="b1"?"B1 ":"B2 ")+(u?names.join("/")+" "+h(u)+" of "+h(cap)+" h":"free "+h(cap)+" h");};
  const L=by.learn.tasks.reduce((a,t)=>a+estMin(t),0),S=by.shallow.tasks.reduce((a,t)=>a+estMin(t),0);
  return (rlBuffer(d)?"Buffer day · ":"")+bl("b1")+" · "+bl("b2")+" · Learning "+L+" of "+chunkCap(d,"learn")+" · Shallow "+S+" of "+chunkCap(d,"shallow");}
// the picker shows the facts under each day it offers (read-only; CSS prints data-facts)
function capDecorate(root){try{(root||document).querySelectorAll(".ps-sheet button.v3-rs[data-d]").forEach(b=>{const d=b.getAttribute("data-d");if(!/^\d{4}-\d{2}-\d{2}$/.test(d||"")||b.dataset.facts)return;b.dataset.facts=capDayFacts(d);b.classList.add("cap-pick");});}catch(e){console.warn(e);}}
{let q=false;const mo=new MutationObserver(()=>{if(q)return;q=true;Promise.resolve().then(()=>{q=false;capDecorate();});});mo.observe(document.body,{childList:true,subtree:true});}
// week and sleep facts under the Today header
function capWeekStart(d){let x=d;while(CAP_WD[parse(x).getDay()]!=="sat")x=addDays(x,-1);return x;}
function capWeek(d){const w0=capWeekStart(d),days=[];for(let i=0;i<7;i++)days.push(addDays(w0,i));const work=days.filter(x=>!isFriday(x)),today=iso(new Date()),upto=d<today?d:today;
  const cfg=chCfg(),tgt=work.reduce((a,x)=>a+v3dayMin(x),0),done=work.filter(x=>x<=upto).reduce((a,x)=>a+v3workMin(x),0),left=work.filter(x=>x>=(d<today?d:today)&&x>=w0);
  const ld=work.filter(x=>x<=upto).reduce((a,x)=>a+learnDone(x),0),ltg=work.length*cfg.learn.minMin;
  const rem=Math.max(0,tgt-done),perDay=left.length?rem/left.length:0;
  return {w0,tgtH:pomN(tgt),doneH:pomN(done),needH:Math.round(perDay/50*10)/10,daysLeft:left.length,learnDone:ld,learnTgt:ltg};}
function capSleepFact(d){const r=capRec(),out=[];
  const items=entriesOn(d).filter(x=>x&&x.kind!=="event"&&x.kind!=="break"&&(isWorkEntry(x)||isLearning(x)));let last=0;
  items.forEach(x=>{(x.sessions||[]).forEach(s=>{if(s.end&&Number(s.end)>last)last=Number(s.end);});});
  if(last){const e=new Date(last),m=e.getHours()*60+e.getMinutes(),lim=hmMin(r.sleepFrom);if(e.toDateString()===parse(d).toDateString()&&m>lim&&m<24*60)out.push("Work ran "+(m-lim)+" min past "+r.sleepFrom+".");}
  const ns=sleepsOn(d).filter(x=>x.kind==="night"),hrs=ns.reduce((a,x)=>a+(x.end-x.start)/36e5,0);
  if(ns.length&&hrs<r.sleepMinH)out.push("Sleep "+(Math.round(hrs*10)/10)+" of "+r.sleepMinH+" h last night.");
  return out.join(" ");}
function capHeaderFacts(f,d){let p=f.querySelector(".cap-week");if(!p){p=el("p",{class:"hint cap-week"});f.append(p);}
  const w=capWeek(d);p.textContent="Week: work "+w.doneH+" of "+w.tgtH+" h"+(w.daysLeft?", "+w.needH+" h/day needed":"")+". Learning "+w.learnDone+" of "+w.learnTgt+" min.";
  let s=f.querySelector(".cap-sleep");const t=capSleepFact(d);if(!t){if(s)s.remove();return;}if(!s){s=el("p",{class:"hint cap-sleep"});f.append(s);}s.textContent=t;}
// settings with Undo
function capSaveCap(next,msg){const c0=capCfg();if(JSON.stringify([c0.wd,c0.dates])===JSON.stringify([next.wd||{},next.dates||{}]))return;const old=(state.settings||{}).cap||null,v={wd:next.wd||{},dates:next.dates||{},at:Date.now()};state.settings={...(state.settings||{}),cap:v};try{store.set("settings/cap",v);}catch(e){fail(e);}
  v3undoToast(msg,()=>{const s={...(state.settings||{})};if(old){s.cap=old;try{store.set("settings/cap",old);}catch(e){}}else{delete s.cap;try{store.set("settings/cap",{wd:{},dates:{},at:Date.now()});}catch(e){}}state.settings=s;render();});render();}
function capSaveRec(next,msg){const r0=capRec();if(r0.sleepMinH===next.sleepMinH&&r0.sleepFrom===next.sleepFrom)return;const old=(state.settings||{}).recovery||null,v={...next,at:Date.now()};state.settings={...(state.settings||{}),recovery:v};try{store.set("settings/recovery",v);}catch(e){fail(e);}
  v3undoToast(msg,()=>{const s={...(state.settings||{})};if(old){s.recovery=old;try{store.set("settings/recovery",old);}catch(e){}}else{delete s.recovery;try{store.set("settings/recovery",{sleepMinH:7,sleepFrom:"21:30",at:Date.now()});}catch(e){}}state.settings=s;render();});render();}
function capSheet(){psOpen("Capacity",re=>{const cfg=chCfg(),c=capCfg(),r=capRec(),base=Number(cfg.b1.h)+Number(cfg.b2.h),str=base+Number(cfg.b3.h);
    const num=(v,lab,fn,step,min,max)=>{const i=el("input",{type:"number",class:"v3-in",step:String(step||.5),min:String(min),max:String(max),value:String(v),"aria-label":lab});i.onchange=()=>fn(Number(i.value));return el("label",{class:"field"},el("span",{class:"label",text:lab}),i);};
    const blk=(fn)=>{const c0=chCfg();const n={b1:{...c0.b1},b2:{...c0.b2},b3:{...c0.b3},learn:{...c0.learn},shallowMin:c0.shallowMin};fn(n);return n;};
    const setBase=v=>{if(!(v>=Number(cfg.b1.h)+.5&&v<=12)){toast("Baseline between "+(Number(cfg.b1.h)+.5)+" and 12 h");re();return;}chSave(blk(n=>{n.b2.h=Math.round((v-Number(n.b1.h))*10)/10;}),"Work baseline: "+v+" h");setTimeout(re,200);};
    const setStr=v=>{if(!(v>=base&&v<=16)){toast("Stretch is at least the baseline ("+base+" h), up to 16");re();return;}chSave(blk(n=>{n.b3.h=Math.round((v-base)*10)/10;}),"Stretch: "+v+" h");setTimeout(re,200);};
    const wd=el("div",{class:"v3-row cap-wd"},...["sat","sun","mon","tue","wed","thu"].map(k=>{const i=el("input",{type:"number",class:"v3-in",step:".5",min:"0",max:"12",placeholder:String(base),value:c.wd[k]?String(c.wd[k]):"","aria-label":CAP_WN[k]+" baseline (h)"});
      i.onchange=()=>{const v=Number(i.value),nx={...capCfg().wd};if(i.value===""||v===0)delete nx[k];else if(v>=1&&v<=12)nx[k]=v;else{toast("Between 1 and 12 h");re();return;}capSaveCap({wd:nx,dates:capCfg().dates},CAP_WN[k]+" baseline: "+(nx[k]?nx[k]+" h":"default"));setTimeout(re,200);};
      return el("label",{class:"field"},el("span",{class:"label",text:CAP_WN[k]}),i);}));
    return [el("p",{class:"hint cap-split",text:"Block 1: "+chH(cfg.b1.h)+", Block 2: "+chH(Math.round((base-cfg.b1.h)*10)/10)+" (it grows when the baseline rises). Stretch up to "+chH(str)+"."}),
      el("p",{class:"label",text:"Work"}),el("div",{class:"v3-row"},num(base,"Work baseline (h)",setBase,.5,1,12),num(str,"Stretch (h)",setStr,.5,1,16)),
      el("p",{class:"hint",text:"A weekday can carry its own baseline. Empty means the default. Friday is the rest day."}),wd,
      el("p",{class:"label",text:"Learning"}),el("div",{class:"v3-row"},num(cfg.learn.minMin,"Learning minimum (min)",v=>{if(v<30){toast("Learning minimum cannot go below 30 min");re();return;}chSave(blk(n=>{n.learn.minMin=v;}),"Learning minimum: "+v+" min");setTimeout(re,200);},5,30,240),
        num(cfg.learn.targetMin,"Learning target (min)",v=>{if(!(v>=cfg.learn.minMin)){toast("Target is at least the minimum");re();return;}chSave(blk(n=>{n.learn.targetMin=v;}),"Learning target: "+v+" min");setTimeout(re,200);},5,30,240)),
      el("p",{class:"label",text:"Shallow batch"}),el("div",{class:"v3-row"},num(cfg.shallowMin,"Shallow batch (min)",v=>{if(!(v>=10)){toast("At least 10 min");re();return;}chSave(blk(n=>{n.shallowMin=v;}),"Shallow batch: "+v+" min");setTimeout(re,200);},10,10,480)),
      el("p",{class:"label",text:"Recovery"}),el("div",{class:"v3-row"},num(r.sleepMinH,"Sleep minimum (h)",v=>{if(!(v>=6&&v<=10)){toast("Sleep minimum between 6 and 10 h");re();return;}capSaveRec({sleepMinH:v,sleepFrom:capRec().sleepFrom},"Sleep minimum: "+v+" h");setTimeout(re,200);},.5,6,10),
        (()=>{const i=el("input",{type:"time",class:"v3-in",value:r.sleepFrom,"aria-label":"Sleep from"});i.onchange=()=>{if(/^\d{2}:\d{2}$/.test(i.value)){capSaveRec({sleepMinH:capRec().sleepMinH,sleepFrom:i.value},"Sleep from "+i.value);setTimeout(re,200);}};return el("label",{class:"field"},el("span",{class:"label",text:"Sleep from"}),i);})()),
      el("p",{class:"hint",text:"Sleep, prayers, gym and Friday are never offered as free time. Work or learning past the sleep time is shown as a fact."})];});}
function capRow(){const rows=document.querySelector('.page[data-page="settings"] .set-rows');if(!rows||document.getElementById("capRow"))return;
  rows.append(el("div",{class:"set-row",id:"capRow"},el("div",{},el("b",{text:"Capacity"}),el("span",{class:"hint",id:"capSum",text:"Work baseline and stretch, learning, shallow batch, sleep"})),el("button",{type:"button",class:"btn ghost",id:"capBtn",onclick:capSheet},"Open")));}
{const _r11=render;render=function(){_r11();try{capRow();}catch(e){console.warn(e);}};}
window.__cap={chunkCap,dayFacts:capDayFacts,week:capWeek,sleepFact:capSleepFact,sheet:capSheet,rec:capRec,over:capOver};
