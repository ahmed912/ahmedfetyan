/* ===== 12 Nov: LinkedIn section (read only plan view). LIPLAN is the content of plan/linkedin.json ===== */
const LIPLAN={
 "calendar": [
  {
   "weekday": "Sat",
   "type": "Personal story",
   "pillar": 5,
   "format": "text",
   "notes": "Medicine to design, lessons, values. Ends with a soft invitation."
  },
  {
   "weekday": "Sun",
   "type": "Project lesson",
   "pillar": 1,
   "format": "text",
   "notes": "One lesson cut from the current portfolio project. Counts toward its 3 posts."
  },
  {
   "weekday": "Mon",
   "type": "Behind the scenes",
   "pillar": 3,
   "format": "text",
   "notes": "How you work, AI in a senior workflow. Taste stays human."
  },
  {
   "weekday": "Tue",
   "type": "Redesign breakdown",
   "pillar": 4,
   "format": "carousel",
   "notes": "5 to 8 slides: problem, before, after, your reasoning, one takeaway. Strongest format."
  },
  {
   "weekday": "Wed",
   "type": "Craft breakdown",
   "pillar": 2,
   "format": "text plus one slide image",
   "notes": "One typography, layout or data visualization decision and why it helps the audience say yes."
  },
  {
   "weekday": "Thu",
   "type": "Founder post",
   "pillar": 1,
   "format": "text or carousel",
   "notes": "Founder-facing: why structure and narrative close deals."
  },
  {
   "weekday": "Fri",
   "type": "Off",
   "pillar": null,
   "format": null,
   "notes": "Jumuah, family, rest, weekly review. No post, no comments."
  },
  {
   "date": "2026-11-14",
   "type": "Who you are",
   "pillar": 5,
   "format": "text",
   "notes": "Post 1, already drafted. Exception to the Sat slot only in content, not pillar."
  },
  {
   "date": "2026-11-15",
   "type": "Project lesson",
   "pillar": 1,
   "format": "text",
   "notes": "Post 2, HASM, already drafted."
  },
  {
   "date": "2026-11-16",
   "type": "Behind the scenes",
   "pillar": 3,
   "format": "text",
   "notes": "Post 3, story behind the HASM showcase."
  },
  {
   "date": "2026-11-17",
   "type": "Redesign breakdown",
   "pillar": 4,
   "format": "carousel",
   "notes": "Post 4, HASM carousel."
  },
  {
   "date": "2026-11-18",
   "type": "Craft breakdown",
   "pillar": 2,
   "format": "text plus image",
   "notes": "Post 5, HASM type or layout."
  },
  {
   "date": "2026-11-19",
   "type": "Founder post",
   "pillar": 1,
   "format": "text",
   "notes": "Post 6."
  },
  {
   "date": "2026-11-21",
   "type": "Personal story",
   "pillar": 5,
   "format": "text",
   "notes": "Post 7."
  },
  {
   "date": "2026-11-22",
   "type": "Project lesson",
   "pillar": 1,
   "format": "text",
   "notes": "Post 8, Javelin."
  },
  {
   "date": "2026-11-23",
   "type": "Behind the scenes",
   "pillar": 3,
   "format": "text",
   "notes": "Post 9."
  },
  {
   "date": "2026-11-24",
   "type": "Redesign breakdown",
   "pillar": 4,
   "format": "carousel",
   "notes": "Post 10, Javelin."
  },
  {
   "date": "2026-11-25",
   "type": "Craft breakdown",
   "pillar": 2,
   "format": "text plus image",
   "notes": "Post 11, Javelin type."
  }
 ],
 "pillars": [
  {
   "n": 1,
   "name": "The story behind winning decks",
   "what": "Why structure and narrative close deals",
   "examples": [
    "Why most pitch decks lose investors on slide 3",
    "One storyline lesson from a live project"
   ]
  },
  {
   "n": 2,
   "name": "Craft and taste",
   "what": "Typography, layout and data visualization breakdowns",
   "examples": [
    "One type decision and why it works",
    "One chart redesigned for a decision maker"
   ]
  },
  {
   "n": 3,
   "name": "Process and AI",
   "what": "How you work, behind the scenes, AI in a senior workflow",
   "examples": [
    "What AI drafts and what stays human",
    "Why 7 slides and what was cut"
   ]
  },
  {
   "n": 4,
   "name": "Before and after",
   "what": "Redesigns with the reasoning",
   "examples": [
    "HASM before and after carousel",
    "2 slides redesigned with the reason for each change"
   ]
  },
  {
   "n": 5,
   "name": "Your path",
   "what": "From medicine to design, lessons, values",
   "examples": [
    "Who you are and who you help",
    "What medicine taught you about high-stakes rooms"
   ]
  }
 ],
 "hooks": [
  {
   "rule": "One line that names a problem your client has",
   "example": "Why most pitch decks lose investors on slide 3"
  },
  {
   "rule": "Write the hook first, 10 minutes, before building the post"
  },
  {
   "rule": "Study 10 designers you admire: hooks, length, formats. Save their best hooks word for word"
  },
  {
   "rule": "From Made to Stick: hooks and headlines for every post (simple, unexpected, concrete)"
  }
 ],
 "recipe": [
  {
   "step": "Pick",
   "what": "One slide or decision from a project you are working on",
   "mins": 5
  },
  {
   "step": "Write the hook",
   "what": "One line naming a client problem",
   "mins": 10
  },
  {
   "step": "Build",
   "what": "5 to 8 slides: the problem, before, after, your reasoning, one takeaway",
   "mins": 40
  },
  {
   "step": "Caption",
   "what": "3 to 5 short lines plus a question. Claude drafts, you edit into your voice",
   "mins": 10
  },
  {
   "step": "Post and engage",
   "what": "Post in the morning Gulf time, reply to every comment, leave the day's comments",
   "mins": 20
  }
 ],
 "commentFormula": {
  "name": "Spot, Add, Ask",
  "steps": [
   "Spot: name the specific point in their post",
   "Add: one insight or example from your work",
   "Ask: one real question"
  ],
  "split": "Half with designers and creative directors, half on posts by founders, VCs and Gulf business leaders",
  "volume": [
   {
    "from": "2026-11-13",
    "perDay": 3
   },
   {
    "from": "2027-01-01",
    "perDay": 7
   }
  ],
  "note": "Engagement, not outreach: being visible where buyers already are."
 },
 "tiers": [
  {
   "tier": "A",
   "who": "Creative directors at UAE agencies and international presentation studios",
   "action": "Follow, bell on, comment"
  },
  {
   "tier": "C",
   "who": "Designers at your level",
   "action": "Follow, comment, learn hooks"
  },
  {
   "tier": "Buyers",
   "who": "Founders, VCs and Gulf business leaders",
   "action": "Follow, comment on half of daily comments"
  }
 ],
 "rules": [
  "Every post ends with a soft invitation, for example: Working on a pitch deck for your next round? My inbox is open.",
  "Done and posted beats perfect. The first 20 posts are practice.",
  "Post in the morning Gulf time, 8 to 10 AM, and reply to every comment.",
  "Keep a bank of 5 ready posts.",
  "Every portfolio project produces 3 posts.",
  "About 12 pieces per pillar in Milestone 1; 60 pieces by Gate 1.",
  "Carousels are the strongest format: a carousel is a short presentation saved as a PDF.",
  "If posting falls behind, fix posting before starting another portfolio project.",
  "Every learning item must also turn into LinkedIn content.",
  "Log every inquiry with its source so you know which content brings clients.",
  "From Milestone 2: shift from craft to proof (results, client stories), 12 per week."
 ]
};
(function(){
  const DN=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const pName=n=>{const p=LIPLAN.pillars.find(x=>x.n===n);return p?p.n+". "+p.name:"None";};
  let liTab="cal";
  let liOff=0;
  function weekDays(){const t=new Date();t.setHours(12,0,0,0);const sat=new Date(t);sat.setDate(t.getDate()-((t.getDay()+1)%7)+liOff*7);return Array.from({length:7},(_,i)=>{const d=new Date(sat);d.setDate(sat.getDate()+i);return d;});}
  function planFor(d){const di=typeof d==="string"?d:iso(d),wd=DN[parse(di).getDay()].slice(0,3);return LIPLAN.calendar.find(x=>x.date===di)||LIPLAN.calendar.find(x=>x.weekday===wd&&!x.date);}
  function calTab(re){const today=iso(new Date()),wk=weekDays();
    const nav=el("div",{class:"li4-wk"},el("button",{type:"button",class:"mini li4-prev","aria-label":"Previous week",onclick:()=>{liOff--;re();}},"\u2039"),
      el("span",{class:"li4-wl",text:fmt(iso(wk[0]),{day:"numeric",month:"short"})+" to "+fmt(iso(wk[6]),{day:"numeric",month:"short"})}),
      liOff?el("button",{type:"button",class:"mini",onclick:()=>{liOff=0;re();}},"This week"):null,
      el("button",{type:"button",class:"mini li4-next","aria-label":"Next week",onclick:()=>{liOff++;re();}},"\u203a"));
    const days=wk.map(d=>{const p=planFor(d)||{type:"Open day",pillar:null,format:null,notes:""};const di=iso(d),isT=di===today,np=postsOn(di).filter(([,x])=>x.body||x.hook||x.title).length;
      return el("button",{type:"button",class:"li4-day"+(isT?" today":"")+(p.pillar?"":" rest"),"data-date":di,"aria-current":isT?"date":null,onclick:()=>liDayOpen(di)},
        el("span",{class:"li4-dn",text:DN[d.getDay()].slice(0,3)+" "+d.getDate()}),
        el("strong",{class:"li4-ty",text:p.type}),
        p.pillar?el("span",{class:"hint",text:pName(p.pillar)}):null,
        p.format?el("span",{class:"hint",text:p.format}):null,
        np?el("span",{class:"li4-has",text:np+" post"+(np>1?"s":"")+" written"}):null,
        el("span",{class:"li4-note hint",text:p.notes}));});
    return el("div",{},nav,el("div",{class:"li4-grid"},...days));}
  const back=()=>setTimeout(()=>{if(!sheetStack.length)openLI();},260);
  function pilTab(re){return el("div",{class:"li4-grid"},...LIPLAN.pillars.map(p=>el("button",{type:"button",class:"li4-pil",onclick:()=>psOpen(p.n+". "+p.name,()=>pilDetail(p),{onClose:back})},
      el("span",{class:"li4-dn",text:"Pillar "+p.n}),el("strong",{class:"li4-ty",text:p.name}),el("span",{class:"hint",text:p.what}))),
      el("button",{type:"button",class:"li4-pil",onclick:()=>psOpen(LIPLAN.commentFormula.name,()=>comDetail(),{onClose:back})},el("span",{class:"li4-dn",text:"Comments"}),el("strong",{class:"li4-ty",text:LIPLAN.commentFormula.name}),el("span",{class:"hint",text:"How to comment"})));}
  const list=a=>el("ul",{class:"li4-list"},...a.map(x=>el("li",{text:x})));
  const sec=(t,n)=>el("div",{class:"li4-sec"},el("span",{class:"label",text:t}),n);
  function pilDetail(p){return [sec("What it is",el("p",{text:p.what})),sec("Examples",list(p.examples)),sec("Comment formula",el("p",{text:LIPLAN.commentFormula.name+". Tap Comments on the Pillars tab for the detail."}))];}
  function comDetail(){const c=LIPLAN.commentFormula;return [sec("Steps",list(c.steps)),sec("Who",el("p",{text:c.split})),
    sec("How many a day",list(c.volume.map(v=>v.perDay+" a day from "+fmt(v.from,{day:"numeric",month:"short",year:"numeric"})))),sec("Note",el("p",{text:c.note})),
    sec("Tiers",list(LIPLAN.tiers.map(t=>t.tier+": "+t.who+". "+t.action)))];}
  function guideTab(){return el("div",{},sec("Post recipe",list(LIPLAN.recipe.map(r=>r.step+" ("+r.mins+" min): "+r.what))),
    sec("Hooks",list(LIPLAN.hooks.map(h=>h.rule+(h.example?". Example: "+h.example:"")))),sec("Rules",list(LIPLAN.rules)));}
  const ST=[["idea","Idea"],["draft","Draft"],["scheduled","Scheduled"],["published","Live"]];
  const stKey=p=>p.status==="live"?"published":(p.status||"draft");
  const stName=p=>(ST.find(x=>x[0]===stKey(p))||ST[1])[1];
  function postsOn(d){return Object.entries(LIP).filter(([,p])=>p.date===d).sort((a,b)=>(a[1].at||0)-(b[1].at||0));}
  function postTab(){const ps=Object.entries(LIP).sort((a,b)=>(b[1].date||"").localeCompare(a[1].date||"")||(b[1].at||0)-(a[1].at||0));
    const head=el("button",{type:"button",class:"btn li4-new",onclick:()=>liDayOpen(iso(new Date()))},"Write today's post");
    if(!ps.length)return el("div",{},head,el("p",{class:"hint",text:"No posts yet."}));
    return el("div",{},head,el("ul",{class:"li4-posts"},...ps.map(([id,p])=>{const first=String(p.body||"").split("\n").find(x=>x.trim())||"";
      return el("li",{},el("button",{type:"button",class:"li4-post","data-post":id,onclick:()=>liDayOpen(p.date||iso(new Date()),id)},
        el("span",{class:"li4-pt"},el("b",{text:p.hook||p.title||"Untitled"}),first?el("span",{class:"hint li4-pl",text:first.slice(0,90)}):null),
        el("span",{class:"hint num",text:(p.date||"")}),el("span",{class:"li4-st","data-s":stKey(p),text:stName(p)})));})));}
  // ---- the day page: plan slot and the editor for the posts of that date ----
  const FMTS=["text","text plus image","carousel","document","video","poll"];
  const copyText=t=>{try{if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t).catch(()=>fb(t));}catch(e){}return fb(t);};
  function fb(t){const a=document.createElement("textarea");a.value=t;a.style.position="fixed";a.style.opacity="0";document.body.append(a);a.select();try{document.execCommand("copy");}catch(e){}a.remove();return Promise.resolve();}
  let liDate=null,liFocus=null;const liPend=new Map(),liNew={};
  function flushAll(){liPend.forEach(f=>f());}
  function savePost(id,vals,quiet){const cur=LIP[id]||{};const doc={...cur,...vals,title:vals.hook||cur.title||"",at:cur.at||Date.now(),upd:Date.now()};LIP[id]=doc;try{store.set("liposts/"+id,doc);}catch(e){}if(!quiet)toast("Saved");}
  function postCard(id,date,plan,re){const cur=LIP[id]||{};const hasPlan=plan&&plan.pillar;
    const hook=el("input",{type:"text",class:"v3-in li4-hook","aria-label":"Hook line",placeholder:"Hook line: one line that names a problem your client has",value:cur.hook||cur.title||""});
    const body=el("textarea",{class:"v3-in li4-body","aria-label":"Post body",rows:"14",placeholder:"Write the post"});body.value=cur.body||"";
    const cnt=el("span",{class:"hint num li4-cnt","aria-live":"polite"});
    const fill=el("i",{class:"li4-fill"}),meter=el("div",{class:"li4-meter","aria-hidden":"true"},fill,el("b",{class:"li4-mk",style:"left:7%",title:"feed cut-off"}),el("b",{class:"li4-mk",style:"left:50%",title:"sweet spot ends"}));
    const mlab=el("div",{class:"li4-mlab hint"},el("span",{text:"210 feed cut-off"}),el("span",{text:"1500 sweet spot ends"}));
    const meterBox=el("div",{class:"li4-mbox"},cnt,meter,mlab);
    const fmtV=cur.format||(plan&&plan.format)||"text",fo=FMTS.includes(fmtV)?FMTS:FMTS.concat([fmtV]);
    const fs=el("select",{class:"v3-in","aria-label":"Format"},...fo.map(f=>{const o=el("option",{value:f,text:f});if(f===fmtV)o.selected=true;return o;}));
    const pv=cur.pillar!==undefined?cur.pillar:(hasPlan?plan.pillar:null);
    const ps=el("select",{class:"v3-in","aria-label":"Pillar"},...[null,...LIPLAN.pillars.map(x=>x.n)].map(n=>{const o=el("option",{value:n==null?"":String(n),text:n==null?"None":pName(n)});if((pv==null&&n==null)||pv===n)o.selected=true;return o;}));
    const sv=stKey(cur),ss=el("select",{class:"v3-in","aria-label":"Status"},...ST.map(([k,n])=>{const o=el("option",{value:k,text:n});if(k===sv)o.selected=true;return o;}));
    const notes=el("textarea",{class:"v3-in","aria-label":"Notes",rows:"2",placeholder:"Notes (optional)"});notes.value=cur.notes||"";
    const vals=()=>({date,hook:hook.value.trim(),body:body.value,format:fs.value,pillar:ps.value===""?null:Number(ps.value),status:ss.value,notes:notes.value.trim()});
    const upd=()=>{const n=body.value.length;cnt.textContent=n+" / 3000";const z=n>3000?"red":n>1500?"amber":n>=210?"green":"calm";meterBox.dataset.zone=z;fill.style.width=Math.min(100,n/30)+"%";cnt.classList.toggle("over",n>3000);if(typeof save!=="undefined"){save.disabled=n>3000;save.title=n>3000?"Over 3000 characters":"";}};
    let t=null;const flush=()=>{clearTimeout(t);t=null;liPend.delete(id);if(body.value.length>3000){toast("Over 3000 characters, not saved");return;}const v=vals();if(!LIP[id]&&!v.hook&&!v.body&&!v.notes)return;savePost(id,v,true);delete liNew[date];};
    const sched=()=>{upd();clearTimeout(t);t=setTimeout(flush,700);liPend.set(id,flush);};
    [hook,body,notes].forEach(x=>x.addEventListener("input",sched));[fs,ps,ss].forEach(x=>x.addEventListener("change",()=>{flush();}));
    const copy=el("button",{type:"button",class:"btn ghost li4-copy",onclick:()=>{copyText((hook.value.trim()+"\n\n"+body.value).trim()).then(()=>toast("Post copied"));}},"Copy post");
    const save=el("button",{type:"button",class:"btn li4-save",onclick:()=>{if(body.value.length>3000){flush();return;}flush();if(!LIP[id]){toast("Nothing to save yet");return;}toast("Saved");}},"Save");upd();
    const del=LIP[id]?el("button",{type:"button",class:"btn ghost danger",onclick:()=>v3confirm("Delete this post?","Delete",()=>{liPend.delete(id);delete LIP[id];try{store.del("liposts/"+id);}catch(e){}re();})},"Delete"):null;
    if(liFocus===id){setTimeout(()=>{try{body.scrollIntoView({block:"nearest"});}catch(e){}},50);}
    return el("section",{class:"li4-ed","data-post":id},el("label",{class:"field"},el("span",{class:"label",text:"Hook"}),hook),
      el("label",{class:"field"},el("span",{class:"label",text:"Post"}),body,meterBox),
      el("div",{class:"v3-row"},el("label",{class:"field"},el("span",{class:"label",text:"Format"}),fs),el("label",{class:"field"},el("span",{class:"label",text:"Pillar"}),ps),el("label",{class:"field"},el("span",{class:"label",text:"Status"}),ss)),
      el("label",{class:"field"},el("span",{class:"label",text:"Notes"}),notes),el("div",{class:"v3-row"},save,copy,del));}
  function liDayBody(re){const d=liDate,plan=planFor(d),wd=DN[parse(d).getDay()];
    const nav=el("div",{class:"li4-dnav"},el("button",{type:"button",class:"mini li4-dprev","aria-label":"Previous day",onclick:()=>{flushAll();liDate=addDays(d,-1);liFocus=null;re();hd();}},"\u2039 "+fmt(addDays(d,-1),{day:"numeric",month:"short"})),
      el("strong",{class:"li4-dt",text:wd+" "+fmt(d,{day:"numeric",month:"long",year:"numeric"})}),
      el("button",{type:"button",class:"mini li4-dnext","aria-label":"Next day",onclick:()=>{flushAll();liDate=addDays(d,1);liFocus=null;re();hd();}},fmt(addDays(d,1),{day:"numeric",month:"short"})+" \u203a"));
    const slot=plan?el("div",{class:"li4-slot"},el("span",{class:"label",text:wd+" slot"}),el("strong",{class:"li4-ty",text:plan.type}),
      plan.pillar?el("span",{class:"hint",text:"Pillar: "+pName(plan.pillar)}):el("span",{class:"hint",text:"Rest day: no post planned"}),plan.format?el("span",{class:"hint",text:"Format: "+plan.format}):null,
      plan.notes?el("span",{class:"hint",text:plan.notes}):null,el("span",{class:"hint li4-hf",text:"Hook formula: "+LIPLAN.hooks[0].rule+". Example: "+LIPLAN.hooks[0].example})):null;
    let ids=postsOn(d).map(([id])=>id);if(!ids.length){if(!liNew[d])liNew[d]="p"+Date.now().toString(36)+"a";ids=[liNew[d]];}
    const extra=liNew["+"+d];if(extra&&!ids.includes(extra))ids.push(extra);
    return [nav,slot,...ids.map(id=>postCard(id,d,plan,re)),el("button",{type:"button",class:"btn ghost li4-add2",onclick:()=>{flushAll();const cur=postsOn(d).map(([i])=>i);if(!cur.length&&liNew[d]){toast("Write the first post before adding another");return;}liNew["+"+d]="p"+Date.now().toString(36)+"b";re();}},"Add another post")];}
  function hd(){const h=document.querySelector(".ps-sheet h2");if(h)h.textContent=fmt(liDate,{weekday:"long",day:"numeric",month:"short"});}
  function liDayOpen(d,focus,solo){liDate=d;liFocus=focus||null;liNew["+"+d]=null;psOpen(fmt(d,{weekday:"long",day:"numeric",month:"short"}),re=>liDayBody(re),{onClose:()=>{flushAll();if(!solo)back();}});}
  function openLI(){psOpen("LinkedIn",re=>{const T=[["cal","Calendar"],["pil","Pillars"],["guide","Guide"],["posts","Posts"]];
    return [el("div",{class:"seg li4-tabs",role:"tablist"},...T.map(([k,n])=>el("button",{type:"button",role:"tab","aria-pressed":String(liTab===k),onclick:()=>{liTab=k;re();}},n))),
      liTab==="cal"?calTab(re):liTab==="pil"?pilTab(re):liTab==="guide"?guideTab():postTab()];});}
  const _rp=renderPopCards;renderPopCards=function(){_rp();const row=document.getElementById("popCards");if(!row)return;
    let c=document.getElementById("liCard");if(!c){c=el("button",{type:"button",id:"liCard",class:"pop-card"},el("span",{class:"fc-ic"},xico("fpen")),el("span",{class:"fc-t",text:"LinkedIn"}));c.onclick=openLI;}
    if(c.parentElement!==row)row.append(c);};
  try{renderPopCards();}catch(e){}
  window.__liOpen=openLI;window.__liDay=d=>liDayOpen(d,null,true);window.__liDayFull=liDayOpen;
})();
