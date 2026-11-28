// Round 58: the task hold menu, simplified. Tag row, five one-line actions, a quiet More fold. No descriptions, no data change.
{const _p58=v3taskMenu;v3taskMenu=function(id){_p58(id);try{tm58(id);}catch(e){console.warn(e);}};}
try{if(window.__u){window.__u.v3taskMenu=v3taskMenu;window.__u.setDone=setDone;window.__u.render=render;window.__u.v3archive=v3archive;}}catch(e){}
function tm58(id){const t=state.tasks[id];if(!t)return;const sh=document.querySelector(".ps-sheet");if(!sh)return;
  const body=[...sh.querySelectorAll(".ps-sh-sum")].map(x=>x.parentElement).find(x=>x&&x.querySelector(":scope > .ps-sh-sum")&&x.querySelector("button.btn"));if(!body||body.querySelector(".tm-list"))return;
  const all=[...sh.querySelectorAll(".ps-sh-body button, .hb-from, .rec-menu")];
  const pick=txt=>all.find(b=>!b.matches(".tg-chip")&&(b.dataset.tm58||(b.firstChild&&b.firstChild.textContent||b.textContent)).trim().replace(/\s+/g," ")===txt);
  const take=(txt,label,cls)=>{const b=pick(txt);if(!b)return null;b.querySelectorAll(".ph-what").forEach(x=>x.remove());b.textContent=label;b.className="tm-row"+(cls?" "+cls:"");return b;};
  const rn=take("Rename","Rename"),rs=take("Reschedule","Date"),ed=take("Edit","Edit"),five=take("Start for 5 minutes","Start 5 minutes"),mv=take("Move to bucket","Move to project"),
    ar=take("Archive","Archive")||take("Restore","Restore"),hb=take("Make it a habit","Make it a habit"),dl=take("Delete","Delete","tm-del");
  const done=el("button",{type:"button",class:"tm-row tm-done",onclick:()=>{psClose(true);setDone(id,!t.done);render();}},t.done?"Not done":"Done");
  const tg=body.querySelector(".tg-pick");
  const sum=body.querySelector(".ps-sh-sum");
  const list=el("div",{class:"tm-list"},...[done,rs,mv,rn,ar].filter(Boolean));
  const more=el("details",{class:"tm-more"},el("summary",{text:"More"}),...[ed,five,hb,dl].filter(Boolean));
  const keep=[sum,tg,list,more].filter(Boolean);
  [...body.children].forEach(c=>{if(!keep.includes(c))c.remove();});
  body.append(...keep);}
// strip any description line that a later rebuild adds back
PS_AFTER.push((title,body)=>{if(title==="More"&&body.querySelector(".tm-list"))body.querySelectorAll(".ph-what,.ph-hint").forEach(x=>x.remove());});
