// module50 next-prayer countdown chip + 10-minute heads-up.
// Honest limit: a web app cannot fire notifications while it is closed without a push server.
// This works while the app is open, installed and running, or open in a background tab.
// Reuses prayNext/prayTimesFor (same times as the Prayer panel). The adhan and the page are untouched.
// Only data written: a small dedupe key in localStorage (sb-pc-seen). Nothing goes to the database.
const PC_LEAD=600000,PC_KEY="sb-pc-seen";
function pcLabel(ms){const m=Math.max(0,Math.ceil(ms/60000));if(m>=60)return Math.floor(m/60)+":"+String(m%60).padStart(2,"0")+" h";return (m<1?"<1":m)+" min";}
function pcSeen(){try{return JSON.parse(localStorage.getItem(PC_KEY)||"{}")||{};}catch(e){return {};}}
function pcMark(k,at){try{const s=pcSeen(),o={};for(const x in s)if(s[x]>at-172800000)o[x]=s[x];o[k]=at;localStorage.setItem(PC_KEY,JSON.stringify(o));}catch(e){}}
function pcChip(){let c=document.getElementById("pcChip");if(c)return c;
  c=el("button",{type:"button",id:"pcChip",class:"pc-chip",hidden:true,onclick:()=>{
    try{if("Notification" in window&&Notification.permission==="default"){Notification.requestPermission().then(p=>toast(p==="granted"?"You'll get a heads-up 10 minutes before each prayer":"Heads-up notifications are off. In-app reminders stay on")).catch(()=>{});return;}}catch(e){}
    const nx=prayNext(Date.now(),prayCfg().city);if(nx)toast(nx.label+" at "+prayFmt(nx.at));}});
  document.body.appendChild(c);return c;}
function pcTick(){try{const now=Date.now(),nx=prayNext(now,prayCfg().city),c=pcChip();
    if(!nx){c.hidden=true;return;}
    const left=nx.at-now;c.hidden=false;c.textContent=nx.label+" "+pcLabel(left);
    c.setAttribute("aria-label","Next prayer "+nx.label+" in "+pcLabel(left));
    if(left>0&&left<=PC_LEAD){const k=nx.key+"|"+nx.at;if(!pcSeen()[k]){pcMark(k,nx.at);
      const m=Math.max(1,Math.ceil(left/60000));toast(nx.label+" in "+m+" min");
      try{if("Notification" in window&&Notification.permission==="granted")new Notification(nx.label+" in "+m+" min",{body:prayFmt(nx.at),tag:"wudu"});}catch(e){}}}
  }catch(e){}}
setInterval(pcTick,30000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)pcTick();});
setTimeout(pcTick,0);
