// r37 today
let v37open=false;
function v37dayCard(){if(window.__v37off)return;document.querySelectorAll(".dbar-focus").forEach(f=>{
  let chips=f.querySelector(".v37-chips");if(!chips){chips=document.createElement("div");chips.className="v37-chips";}
  const keep=f.querySelector(".v3-planned");if(keep&&keep.parentNode===chips)f.append(keep);
  chips.textContent="";
  const tx=s=>{const n=f.querySelector(s);return n?n.textContent:"";};
  let m=tx(".ch-hdr").match(/Learning (\d+) of (\d+) min/);
  if(m){const c=document.createElement("span");c.className="v37-chip";c.textContent="Learning "+m[1]+" of "+m[2]+" min";chips.append(c);}
  m=tx(".cap-week").match(/work ([\d.]+) of ([\d.]+) h/);
  if(m){const c=document.createElement("span");c.className="v37-chip";c.textContent="Week "+m[1]+" of "+m[2]+" h";chips.append(c);}
  const pl=f.querySelector(".v3-planned");
  if(pl&&!pl.hidden&&pl.style.display!=="none"){pl.classList.add("v37-chip");chips.append(pl);}
  let acts=f.querySelector(".v37-acts");if(!acts){acts=document.createElement("div");acts.className="v37-acts";}
  [".v3-fill",".v3-plan"].forEach(s=>{const b=f.querySelector(s);if(b){b.classList.add("btn","ghost");acts.append(b);}});
  let d=f.querySelector("details.v37-more");
  if(!d){d=document.createElement("details");d.className="v37-more";const sm=document.createElement("summary");sm.textContent="Details";d.append(sm);d.ontoggle=()=>{v37open=d.open;};}
  d.open=v37open;
  [".ch-hdr",".cap-week",".cap-sleep",".sp-note"].forEach(s=>{const n=f.querySelector(s);if(n)d.append(n);});
  f.append(chips,acts,d);
});}
{const _r37=render;render=function(){_r37();try{v37dayCard();}catch(e){console.warn(e);}};}
window.__v37={run:v37dayCard};
