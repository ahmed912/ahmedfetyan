// r36 gym ui: daily exercise ticks, week strip, calm list
let g5Pos=null;
gToday=function(){
  const today=iso(new Date()),w=g5Week(today),pos=g5Pos==null?g5Next(today):g5Pos,idx=g5Map(today)[pos],day=GYM[idx],x=g5Doc(today),
    lockOther=!!(g5N(x)&&x.day!==idx),rec=w[pos].rec,past=!!(rec&&rec.date!==today),a=gActive();
  gDay=idx;
  const out=[gLevelBar(true)];
  if(a)out.push(el("div",{class:"g5-legacy"},el("span",{class:"hint",text:"فيه تمرين قديم شغال بالسيتات."}),el("button",{type:"button",class:"btn",text:"احفظه",onclick:gFinish}),el("button",{type:"button",class:"mini",text:"إلغاء",onclick:e=>gCancel(e.currentTarget)})));
  out.push(el("div",{class:"g5-week",role:"tablist","aria-label":"أيام الأسبوع"},...[0,1,2,3,4].map(p=>
    el("button",{type:"button",role:"tab","data-pos":String(p),class:(p===pos?"cur ":"")+(w[p].state==="done"||w[p].state==="part"?w[p].state:""),
      "aria-label":"اليوم "+(p+1)+": "+GYM[w[p].idx].f,"aria-selected":String(p===pos),text:String(p+1),
      onclick:()=>{window.__g5quiet=0;g5Pos=p;renderGym();}}))));
  const head=el("div",{class:"g5-head"},el("h2",{text:day.f}));
  if(pos===2)head.append(el("span",{class:"chip g5-par",text:(g5Parity(today)?"تأهيل ب":"تأهيل أ")+" · الأسبوع ده"}));
  head.append(el("p",{class:"g5-goal",text:day.g}));out.push(head);
  let n=0;
  const rows=day.sl.map((sl,i)=>{
    const ticked=past?!!rec.items.find(it=>it.slot===i&&(rec.ticks||(it.sets&&it.sets.length))):!!(x&&x.day===idx&&x.ex&&x.ex[i]);
    if(ticked)n++;
    const e=gEx(idx,i);
    const li=el("li",{class:"g5-row"+(ticked?" on":"")+(lockOther?" lock":"")+(past?" past":""),"data-slot":String(i),role:"checkbox","aria-checked":String(ticked),tabindex:"0","aria-label":e.ar},
      el("span",{class:"g5-tick","aria-hidden":"true"}),
      el("div",{class:"g5-name"},el("b",{text:e.ar}),el("span",{class:"en",lang:"en",dir:"ltr",text:e.en})),
      el("span",{class:"g5-meta num",text:sl.s+" × "+sl.r}));
    g5Wire(li,i);return li;});
  function g5Wire(li,i){let t=null,held=false,x0=0,y0=0;
    const clr=()=>{clearTimeout(t);t=null;};
    const act=()=>{
      if(past||lockOther){toast(lockOther?"النهارده متسجل يوم "+(g5PosOf(x.day)+1)+". شيل العلامات منه الأول.":"اليوم ده اتعمل قبل كده الأسبوع ده.");return;}
      const doc=g5Tick(pos,i);if(doc){const on=!!doc.ex[i];li.classList.toggle("on",on);li.setAttribute("aria-checked",String(on));g5Paint(doc);}};
    li.addEventListener("pointerdown",e=>{x0=e.clientX;y0=e.clientY;held=false;clr();t=setTimeout(()=>{held=true;g5Sheet(idx,i);},500);});
    li.addEventListener("pointermove",e=>{if(t&&(Math.abs(e.clientX-x0)>10||Math.abs(e.clientY-y0)>10))clr();});
    li.addEventListener("pointercancel",clr);li.addEventListener("pointerup",clr);
    li.addEventListener("click",()=>{if(held){held=false;return;}act();});
    li.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();act();}});
    li.addEventListener("contextmenu",e=>e.preventDefault());}
  out.push(el("ul",{class:"g5-list"},...rows));
  out.push(el("div",{class:"g5-foot"},el("span",{class:"g5-count num",text:n+" من "+day.sl.length}),
    el("span",{class:"g5-note",text:lockOther?"النهارده متسجل يوم "+(g5PosOf(x.day)+1):past?"اتعمل "+new Date(rec.start).toLocaleDateString("ar-EG",{weekday:"long"}):(n===day.sl.length?"اليوم خلص":"")})));
  out.push(el("details",{class:"g-rules"},el("summary",{text:"قواعد التوقيت والسلامة"}),el("dl",{},...GYM_RULES.flatMap(([k,v])=>[el("dt",{text:k}),el("dd",{text:v})]))));
  return out;
};
function g5Paint(doc){const n=g5N(doc),len=GYM[doc.day].sl.length;
  const c=document.querySelector("#gymBody .g5-count"),nt=document.querySelector("#gymBody .g5-note"),b=document.querySelector("#gymBody .g5-week button.cur");
  if(c)c.textContent=n+" من "+len;if(nt)nt.textContent=n===len?"اليوم خلص":"";
  if(b){b.classList.remove("part","done");if(n===len)b.classList.add("done");else if(n>0)b.classList.add("part");}}
function g5Sheet(idx,i){const sl=GYM[idx].sl[i],cur=gAltIdx(idx,i),e=sl.ex[cur];
  psOpen(e.ar,re=>[el("p",{class:"ps-sh-sum",text:"العضلة: "+MUSC[sl.m]+" · "+sl.s+" × "+sl.r}),el("p",{class:"hint",text:e.cue||""}),gLinks(e),
    el("ul",{class:"ps-sh-list g5-alts"},...sl.ex.map((z,j)=>el("li",{},el("button",{type:"button",class:"ps-sh-row"+(j===cur?" cur":""),text:z.ar+(j===0?" (الأساسي)":""),
      onclick:()=>{const p=gPrefs();gSet("prefs",{...p,alts:{...(p.alts||{}),[idx+"-"+i]:j}});psClose();}}))))]);}
{const _rg=renderGym;renderGym=function(){const v=document.getElementById("gymView");if(v&&!v.hidden&&gTab==="today"&&Date.now()<window.__g5quiet&&v.querySelector(".g5-list"))return;_rg();
  try{const t=iso(new Date()),x=g5Doc(t),full=x&&GYM[x.day]&&g5N(x)>=GYM[x.day].sl.length;if(v&&!v.hidden&&gTab==="today"&&!full)gWakeLock(true);else if(!gActive())gWakeLock(false);}catch(e){}};}
{const _sp=setPage;setPage=function(p,...r){const o=_sp(p,...r);try{if(p!=="gym"&&!gActive())gWakeLock(false);}catch(e){}return o;};}
{const gt=document.getElementById("gymTabs");if(gt)gt.addEventListener("click",()=>{window.__g5quiet=0;},true);}
{const _gh=gHistory;gHistory=function(){const r=_gh();try{const ss=gSessions(),ul=r[0];if(ul&&ul.children)[...ul.children].forEach((li,i)=>{const s=ss[i];if(!s||!s.ticks)return;
  const t=li.querySelector(".g-h-t");if(t)t.textContent="اليوم "+(g5PosOf(s.day)+1)+": "+s.title;
  const n=li.querySelector("summary .num");if(n)n.textContent=s.sets+" من "+s.planned+" تمارين";
  li.querySelectorAll(".g-h-items .hint").forEach(h=>{h.textContent="اتعمل";});});}catch(e){console.warn(e);}return r;};}
{const _st=gStats;gStats=function(){const r=_st();try{
  const t=r[0]&&r[0].querySelector?r[0].querySelector(".slp-tile b.num"):null;if(t&&/\/ 6/.test(t.textContent))t.textContent=t.textContent.replace("/ 6","/ 5");
  const wk=weekStart(iso(new Date())),mus={};Object.keys(MUSC).forEach(k=>mus[k]=0);
  gSessions().filter(s=>s.date>=wk).forEach(s=>(s.items||[]).forEach(it=>{if(s.ticks||(it.sets&&it.sets.length))mus[it.m]=(mus[it.m]||0)+1;}));
  const mx=Math.max(1,...Object.values(mus));
  const mchart=el("div",{class:"g-mus"},...Object.entries(mus).map(([k,v])=>el("div",{class:"g-mrow"},el("span",{text:MUSC[k]}),el("div",{class:"track"},el("div",{class:"fill",style:"width:"+(v/mx*100)+"%"})),el("span",{class:"num",text:String(v)}))));
  r.forEach((n,i)=>{if(!n||!n.classList)return;if(n.classList.contains("g-mus"))r[i]=mchart;else if(n.tagName==="H2"&&n.textContent==="عدد السيتات لكل عضلة الأسبوع ده")n.textContent="عدد التمارين لكل عضلة الأسبوع ده";else if(n.classList.contains("hint")&&n.textContent.startsWith("سجّل الوزن في كل سيت"))n.textContent="الأوزان القديمة محفوظة هنا.";});
  }catch(e){console.warn(e);}return r;};}
