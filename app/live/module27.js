// ===== Round 58: planned learning resources (English first). Link, type, day/slot, length, note. One tap Start opens it and times it. =====
const LR_TYPES=[["shadow","Shadow",5,"shadow"],["listen","Listen",4,"listen"],["read","Read",10,"listen"],["speak","Speak",6,"speak"],["write","Write",10,"phrase"],["vocab","Vocab",5,"phrase"]]; // key, label, default min, ENG_STEPS id
const LR_SLOTS=[["learn","Learning block"],["eve","After work"],["","Any time"]];
const LR_GLOSS={shadow:"Shadow: play a line, pause, say it the same way.",listen:"Listen: just listen once, no pausing.",read:"Read: read it out loud.",speak:"Speak: answer the prompt and record yourself.",write:"Write: write five lines with today's phrase.",vocab:"Vocab: save three new words with an example."};
// glossary entries live in module26's How it works list (group Habits)
try{if(typeof PH_GLOSS!=="undefined"){
  PH_GLOSS.push({id:"resources",g:"Habits",t:"Learning resources",w:"Links you plan ahead for a habit, such as English. Start opens the link in a new tab and times it. Next up shows in the Learning block and under the habit.",ex:"A TED clip tagged Shadow, 5 min, Learning block."});
  LR_TYPES.forEach(t=>PH_GLOSS.push({id:"res-"+t[0],g:"Habits",t:"Resource type: "+t[1],w:LR_GLOSS[t[0]].replace(/^[^:]+:\s*/,""),ex:"Start sets the "+t[1]+" step and logs "+t[2]+" min."}));
}}catch(e){console.warn(e);}
function lrT(k){return LR_TYPES.find(t=>t[0]===k)||LR_TYPES[0];}
function lrAll(area){return Object.entries(state.resources||{}).map(([id,x])=>({id,...x})).filter(x=>!x.deleted&&(x.area||"english")===area).sort((a,b)=>(a.order||0)-(b.order||0));}
function lrOpen(area){return lrAll(area).filter(x=>!x.done);}
function lrNext(area,d,slot){return lrOpen(area).filter(x=>x.skipOn!==d&&(!x.day||x.day<=d)&&(slot==null||!x.slot||x.slot===slot)).sort((a,b)=>((a.day===d?0:1)-(b.day===d?0:1))||((a.order||0)-(b.order||0)))[0]||null;}
function lrPut(id,doc){state.resources={...(state.resources||{}),[id]:doc};render();store.set("resources/"+id,doc).catch(fail);}
function lrUpd(id,patch){const cur=(state.resources||{})[id];if(!cur)return;state.resources={...state.resources,[id]:{...cur,...patch}};render();store.update("resources/"+id,patch).catch(fail);}
function lrHost(u){try{return new URL(u).hostname.replace(/^(www|m)\./,"");}catch(e){return "";}}
function lrDayTxt(d){if(!d)return "";if(d===iso(new Date()))return "Today";if(d===addDays(iso(new Date()),1))return "Tomorrow";return fmt(d,{weekday:"short",day:"numeric",month:"short"});}
function lrTag(x){return [lrT(x.type)[1],(Number(x.len)||lrT(x.type)[2])+" min",lrDayTxt(x.day),(LR_SLOTS.find(s=>s[0]===x.slot&&s[0])||[0,""])[1]].filter(Boolean).join(" · ");}
async function lrAdd(o){let url=String(o.url||"").trim();
  if(url&&!/^https?:\/\//i.test(url))url="https://"+url;
  if(url){try{new URL(url);}catch(e){toast("That link doesn't look right");return false;}}
  const note=String(o.note||"").trim();let title=String(o.title||"").trim();
  if(!url&&!title&&!note){toast("Paste a link or type a title");return false;}
  if(!title){if(url&&ytParse(url))title=(await ytTitle(url))||"";if(!title)title=lrHost(url)||note.slice(0,60);}
  const id="lr"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),T=lrT(o.type);
  const doc={area:o.area||"english",url,title,type:T[0],day:o.day||"",slot:o.slot==null?"learn":o.slot,len:Number(o.len)>0?Math.round(Number(o.len)):T[2],note,order:Date.now(),done:false,doneAt:null,skipOn:null,spent:0,lastRun:null,lastAt:null,deleted:false,deletedAt:null,created:Date.now()};
  lrPut(id,doc);toast("Added: "+title);return id;}
function lrRe(){setTimeout(()=>{if(document.querySelector(".ps-sheet .lr-add"))sheetRefresh();},300);}
function lrDone(id){const x=(state.resources||{})[id];if(!x)return;const old={done:!!x.done,doneAt:x.doneAt||null};lrUpd(id,{done:true,doneAt:iso(new Date())});v3undoToast("Marked done",()=>{lrUpd(id,old);lrRe();});}
function lrSkip(id,d){const x=(state.resources||{})[id];if(!x)return;const old={order:x.order,skipOn:x.skipOn||null},max=Math.max(0,...lrAll(x.area||"english").map(y=>y.order||0));lrUpd(id,{order:max+1,skipOn:d});v3undoToast("Skipped for today",()=>{lrUpd(id,old);lrRe();});}
function lrDel(id){lrUpd(id,{deleted:true,deletedAt:Date.now()});v3undoToast("Resource deleted",()=>{lrUpd(id,{deleted:false,deletedAt:null});lrRe();});}
function lrAreaName(area){return area==="english"?"English":((HABITS.find(h=>h.id===area)||{}).name||"Learning");}
function lrSheet(area){psOpen(area==="english"?"English resources":lrAreaName(area)+" resources",re=>{
  const url=el("input",{type:"url",class:"lr-url",placeholder:"Paste a link: video, podcast, article","aria-label":"Link"});
  const type=el("select",{class:"lr-type","aria-label":"Type"},...LR_TYPES.map(t=>el("option",{value:t[0],text:t[1]})));type.value="shadow";
  const title=el("input",{type:"text",class:"lr-title",placeholder:"Title (optional)"});
  const day=el("input",{type:"date",class:"lr-day","aria-label":"Planned day"});
  const slot=el("select",{class:"lr-slot","aria-label":"Slot"},...LR_SLOTS.map(s=>el("option",{value:s[0],text:s[1]})));slot.value="learn";
  const len=el("input",{type:"number",class:"lr-len",min:"1",max:"120",placeholder:"Minutes","aria-label":"Length in minutes"});
  const note=el("input",{type:"text",class:"lr-note",placeholder:"Note or prompt (optional)","aria-label":"Note"});
  const sa=el("select",{class:"lr-area","aria-label":"For"},...HABITS.map(h=>el("option",{value:h.id,text:h.name})));sa.value=area;
  const form=el("form",{class:"ls-add lr-add",onsubmit:async e=>{e.preventDefault();const id=await lrAdd({url:url.value,type:type.value,title:title.value,day:day.value,slot:slot.value,len:len.value,note:note.value,area:sa.value});if(id)setTimeout(re,250);}},
    url,type,el("button",{type:"submit",class:"btn"},"Add"),
    el("details",{class:"lr-more"},el("summary",{text:"More: title, day, length, note"}),title,day,slot,len,note,sa));
  const open=lrOpen(area),done=lrAll(area).filter(x=>x.done);let body;
  if(open.length){
    const list=el("ul",{class:"lr-list"},...open.map(x=>el("li",{class:"lr-row","data-id":x.id},
      el("button",{type:"button",class:"lr-t","data-dragok":"1",onclick:()=>{psClose(true);lrStart(x.id);}},el("b",{text:x.title}),el("span",{class:"lr-tag",title:LR_GLOSS[x.type]||"",text:lrTag(x)}),x.note?el("span",{class:"hint lr-nn",text:x.note}):null),
      el("button",{type:"button",class:"mini ghost lr-done",onclick:()=>{lrDone(x.id);setTimeout(re,250);}},"Done"),
      el("button",{type:"button",class:"mini ghost lr-skip",onclick:()=>{lrSkip(x.id,sel);setTimeout(re,250);}},"Skip"),
      el("button",{type:"button",class:"x lr-del","aria-label":"Delete "+x.title,onclick:()=>{lrDel(x.id);setTimeout(re,250);}},"×"))));
    v3dragList(list,".lr-row",ids=>{if(ids.join()===open.map(x=>x.id).join())return;const old=ids.map(i=>[i,state.resources[i].order]),base=Date.now();ids.forEach((i,k)=>lrUpd(i,{order:base+k}));v3undoToast("Order changed",()=>{old.forEach(([i,o])=>lrUpd(i,{order:o}));lrRe();});setTimeout(re,300);});
    body=[el("p",{class:"hint",text:"Tap a row to start. Press and hold, then drag to reorder."}),list];
  }else body=[el("p",{class:"ps-sh-sum",text:"Nothing planned yet. Paste a link above."})];
  return [el("p",{class:"hint lr-help",text:Object.values(LR_GLOSS).join(" ")}),form,...body,
    done.length?el("details",{class:"lr-donel"},el("summary",{text:"Done ("+done.length+")"}),el("ul",{},...done.map(x=>el("li",{class:"lr-drow"},el("span",{text:x.title}),el("button",{type:"button",class:"mini lr-restore",onclick:()=>{lrUpd(x.id,{done:false,doneAt:null});setTimeout(re,250);}},"Restore"))))):null];});}
function lrStart(id){toast("Start comes in round 2");}
window.__lr={sheet:lrSheet,next:lrNext,all:lrAll,start:id=>lrStart(id),gloss:LR_GLOSS};
