// module46 simple Today
let rmTodayEarly=false,rmTodayDone=false,rmTodayAdd=false;
function rmTodayOn(){let o;try{o=localStorage.getItem("rm-today");}catch(e){}return o!=="off"&&!document.body.classList.contains("m33");}
function rmTodayAddRow(d,tree){
  const li=el("li",{class:"rm-addt"},el("span",{class:"rm-plus",text:"+"}),"Add task");
  li.onclick=()=>{rmTodayAdd=true;rmTodayInput(li,d);};
  return li;}
function rmTodayInput(li,d){
  const inp=el("input",{class:"rm-in",type:"text",placeholder:"Task due today","aria-label":"Task due today"});
  li.replaceChildren(inp);li.onclick=null;inp.focus();let busy=false;
  inp.addEventListener("keydown",async e=>{
    if(e.key==="Escape"){rmTodayAdd=false;render();}
    else if(e.key==="Enter"){const title=inp.value.trim();if(!title||busy)return;busy=true;
      const body={title,cat:"setup",parent:null,date:d,due:d,done:false,order:Date.now()};
      try{const ref=await store.add("tasks",body);state.tasks[ref.id]=body;rmTodayAdd=true;inp.value="";render();
        v3undoToast("Added: "+title,()=>patchTask(ref.id,{cut:true}));}catch(err){fail(err);}}});
  inp.addEventListener("blur",()=>{if(!inp.value.trim()){rmTodayAdd=false;setTimeout(()=>{if(!document.querySelector("#rmToday .rm-in"))render();},0);}});}
function rmToday(){
  const pg=document.querySelector('#workView .page[data-page="today"]');if(!pg)return;
  if(typeof rmTodayTasks!=="function"||typeof rmTaskRow!=="function")return;
  document.querySelectorAll("#popCards>.pop-card").forEach(c=>c.classList.toggle("rm-keep",/^\s*Capture/.test(c.textContent)));
  let sec=document.getElementById("rmToday");
  if(!sec){sec=el("section",{class:"panel rm-today-sec",id:"rmToday","aria-label":"Today"});}
  const q=document.getElementById("brQuick");
  if(q&&q.parentNode===pg){if(q.nextSibling!==sec)q.after(sec);}else if(sec.parentNode!==pg)pg.prepend(sec);
  const keep=sec.querySelector(".rm-in"),kv=keep?keep.value:"";
  const d=iso(new Date()),L=rmTodayTasks(d);
  const tree=el("ul",{class:"rm-tree rm-static",id:"rmTodayTree"});
  L.due.forEach(t=>tree.append(rmTaskRow(t,{branch:1})));
  if(L.early.length){
    tree.append(el("li",{class:"rm-more rm-early",onclick:()=>{rmTodayEarly=!rmTodayEarly;render();}},L.early.length+" from earlier days"));
    if(rmTodayEarly)L.early.forEach(t=>tree.append(rmTaskRow(t,{branch:1})));}
  if(L.done.length){
    tree.append(el("li",{class:"rm-more rm-donec",onclick:()=>{rmTodayDone=!rmTodayDone;render();}},L.done.length+" done"));
    if(rmTodayDone)L.done.forEach(t=>tree.append(rmTaskRow(t,{branch:1})));}
  if(!L.due.length&&!L.early.length)tree.append(el("li",{class:"rm-empty hint"},"Nothing due today. Give a task today's due date and it shows here."));
  const add=rmTodayAddRow(d,tree);tree.append(add);
  sec.replaceChildren(
    el("div",{class:"rm-today-row"},
      el("div",{class:"rm-node rm-parent rm-static"},"Today"),
      el("span",{class:"rm-today-line"}),
      el("div",{class:"rm-node rm-branch rm-static"},"Today",el("span",{class:"rm-sub"},fmt(d,{weekday:"short",day:"numeric",month:"short"})))),
    tree);
  if(rmTodayAdd){rmTodayInput(add,d);const n=sec.querySelector(".rm-in");if(n&&kv)n.value=kv;}}
function rmTodayRow(){
  if(document.body.classList.contains("m33"))return;
  const rows=document.querySelector('.page[data-page="settings"] .set-rows');if(!rows||document.getElementById("rmTodayRow"))return;
  const btn=el("button",{type:"button",class:"btn ghost",id:"rmTodayBtn"},rmTodayOn()?"On":"Off");
  btn.onclick=()=>{const on=rmTodayOn();try{if(on)localStorage.setItem("rm-today","off");else localStorage.removeItem("rm-today");}catch(e){}
    btn.textContent=on?"Off":"On";render();toast(on?"Simple Today off":"Simple Today on");};
  rows.append(el("div",{class:"set-row",id:"rmTodayRow"},el("div",{},el("b",{text:"Simple Today"}),el("span",{class:"hint",text:"Only tasks due today, as Today > Today > tasks. Off brings back blocks, habits and buckets."})),btn));}
{const _r=render;render=function(){_r();try{document.body.classList.toggle("rm-today",rmTodayOn());if(rmTodayOn()&&page==="today")rmToday();else{const x=document.getElementById("rmToday");if(x)x.remove();}rmTodayRow();const b=document.getElementById("rmTodayBtn");if(b)b.textContent=rmTodayOn()?"On":"Off";}catch(e){console.warn(e);}};}
