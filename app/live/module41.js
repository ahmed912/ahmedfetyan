// ===== v02 refinements: Inbound default tag (not on phone layout), gym subtitle (everywhere) =====
{const _f=tgFor;tgFor=function(t,id){const m=_f(t,id);if(m||!t||t.cat!=="outreach"||document.body.classList.contains("m33"))return m;return tgGet("work");};}
function v41Gym(){try{document.querySelectorAll(".g-header .hint").forEach(h=>{if(h.textContent.indexOf("6 أيام")>=0)h.textContent=h.textContent.replace("6 أيام","5 أيام");});}catch(e){}}
try{v41Gym();new MutationObserver(v41Gym).observe(document.body,{childList:true,subtree:true,characterData:true});}catch(e){}
