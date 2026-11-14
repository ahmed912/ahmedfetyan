import re
src=open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/orig.html').read();first,s=src.split('\n',1)
old_db='''  const DAY_BLOCKS=[
    {n:1,name:"Learning",from:"05:00",to:"06:30"},
    {n:2,name:"Design",from:"07:00",to:"15:00"},
    {n:3,name:"LinkedIn and brand",from:"15:30",to:"17:30"},
    {n:4,name:"Gym and family",from:"17:45",to:"21:30"}];'''
new_db=old_db.replace('"05:00",to:"06:30"','"05:15",to:"08:00"').replace('"07:00",to:"15:00"','"08:00",to:"16:00"').replace('"15:30",to:"17:30"','"16:15",to:"17:45"').replace('"17:45",to:"21:30"','"18:00",to:"21:30"')
R=[('["sounds","Sounds"]','["sounds","Intentional media"]',1),('<title>🧠Milestone 1 Sprint Board</title>','<title>Milestone 1 Sprint Board</title>',1),(old_db,new_db,1),
('if(b===1||b===2||b===3)return b;','if(b===1||b===2||b===3||b===5)return b;',1),
('const ordered=DAY_BLOCKS.flatMap(','const ordered=[...DAY_BLOCKS,{n:5}].flatMap(',1),
('...DAY_BLOCKS.filter(b=>bn[b.n])','...dayBlocksFor(d).filter(b=>bn[b.n])',1),
('.topnav,.botnav,#moreMenu','.topnav,.botnav,#moreMenu,#hubSub',2),
('const m={};snap.docs.forEach(d=>{m[d.id]=d.data();});','const m={};snap.docs.forEach(d=>{m[d.id]=d.data();});__shadow[name]=JSON.parse(JSON.stringify(m));',1),
('from:hhmm(se.start),to:hhmm(se.end)})','from:hhmm24(se.start),to:hhmm24(se.end)})',1),
('el("button",{class:"mini",type:"button",text:"Done",onclick:()=>{moveFor=null;','...blockMoveBtns(t),el("button",{class:"mini",type:"button",text:"Done",onclick:()=>{moveFor=null;',1),
('text:"⇅",onclick','text:"Move",onclick',1),('say(PAGES.find(x=>x[0]===p)[1]+" page");','say(((PAGES.find(x=>x[0]===p)||[0,p==="linkedin"?"LinkedIn":p==="finance"?"Finance":p])[1])+" page");',1),('if(ui.motion==="reduce")r.setAttribute("data-motion","reduce");else r.removeAttribute("data-motion");','if(ui.motion==="reduce")r.setAttribute("data-motion","reduce");else r.removeAttribute("data-motion");\n    if(ui.look==="apple")r.setAttribute("data-look","apple");else r.removeAttribute("data-look");',1),
('    rc(b,\n      el("div",{class:"sh-sec"},el("span",{class:"label",id:"ui-accent",text:"Theme"}),','    rc(b,\n      segOf("Look","look",[["material","Material"],["apple","Apple theme"]]),\n      el("div",{class:"sh-sec"},el("span",{class:"label",id:"ui-accent",text:"Theme"}),',1),('"▶ Start timer"','"Start now"',2),
('state.tasks[id]={...t,done:on,doneAt:on?sel:null};render();','state.tasks[id]={...t,done:on,doneAt:on?sel:null};if(on){if(openTask===id||openTask==="c:"+id)openTask=null;const rest=tasksOn(sel).filter(x=>!x.done&&x.id!==id),nx=rest.find(x=>taskBlock(x)===taskBlock(t))||rest[0];if(nx)openTask=nx.id;}render();',1),
('el("option",{value:k,text:ic+" "+n})','el("option",{value:k,text:n})',2)]
import json as _j
R+= [tuple(x) for x in _j.load(open("seal.json"))]
R+=[('    if(isP||isL)secs.push(editDetails(p,isP));','    if(isP||isL)secs.push(editDetails(p,isP));\n    if(isP)secs.push(rsProjBtn({...p,id:sheet.id}));',1)]
R+=[('class:"sess-btn",type:"button",','class:"sess-btn",type:"button","data-s":String(se.start),"data-e":String(se.end),',1)]
# 9 Nov cut: no sound or banner for old missed reminders on open; no wudu pop-up
R+=[('.filter(r=>!r.fired&&r.at<=now);\n    const box=document.getElementById("remBanners");','.filter(r=>!r.fired&&r.at<=now&&now-r.at<10*60000);\n    const box=document.getElementById("remBanners");',1),
 ('wuduShown[key]=1;bell("prayer");showWudu(n,t[k]);','wuduShown[key]=1;',1),
 ('if(lv>gameSeen.lv)setTimeout(()=>{woo();toast("Promoted! Rank "+lv+": "+wLevel(T.xp).name);},3400);','',1)]
for a,b,n in R:
    assert s.count(a)==n,(a[:50],s.count(a));s=s.replace(a,b)
a='  setInterval(checkUpdate,10*60000); setTimeout(checkUpdate,4000);\n'

# ---- 8 Nov: special forces theme for the game (both versions) ----
THEME=[
 ('["Starter","Showing up","Steady","Committed","Relentless","Craftsman","Master"]','["Recruit","Trainee","Operator","Team leader","Chief","Senior chief","Commander"]'),
 ('["مبتدئ","متحمس","ملتزم","قوي","مقاتل","وحش","أسطورة"]','["مجنّد","متدرب","مقاتل","قائد فريق","رقيب أول","قائد","أسطورة"]'),
  ('"Today\'s quests"','"Today\'s orders"'),('>Today\'s quests<','>Today\'s orders<'),
 ('text:"Quests"','text:"Orders"'),('"Quests on "','"Orders on "'),('"Quest done: "','"Order executed: "'),('"Quest: "','"Order: "'),
 ('"Quests add their own XP, and finishing every quest adds +30."','"Each order adds XP. Execute every one for +30."'),
 ('"Each quest rewards the effort of doing it, whatever the result."','"Every order rewards execution. No excuses."'),
 ('"Every quest done today. +30 XP bonus"','"Every order executed. +30 XP"'),('"🔥 Every quest done: +30 XP"','"Every order executed: +30 XP"'),
 ('"Today\'s effort"','"Today\'s op"'),('"Not started yet"','"Not deployed yet"'),
 ('" XP more makes it an effort day."','" XP more completes today\'s op."'),
 ('"This counts as an effort day for your sprint."','"Op complete. That is how operators are made."'),
 ('"Effort day: "','"Mission day: "'),('"Effort day"','"Mission day"'),('"effort days ("','"mission days ("'),
 ('"Start a deep block or a focus timer. Every 10 focused minutes earn 1 XP."','"Deploy: start a deep block or the focus timer. Every 10 focused minutes = 1 XP."'),
 ('"Starting a deep block = +5, whatever happens next. Showing up is the win."','"Starting a deep block = +5. Report for duty. Every single day."'),
 ('"Level up! Level "','"Promoted! Rank "'),('text:"Weekly challenge"','text:"Weekly mission"'),('text:"Badges"','text:"Insignia"'),('text:"How XP works"','text:"How you earn rank"'),
 ('" showing up in a row"','" on mission, no days off"'),
 ('t:"Show up for a focus block"','t:"Report for duty: one focus block"'),('t:"Move 3 tasks forward"','t:"Take 3 objectives"'),
 ('t:"Sleep 7 hours last night"','t:"Recover: 7 hours of sleep"'),('"Recovery is part of the effort"','"Recovery is part of the mission"'),
 ('"Perfect day"','"Flawless op"'),('"Full effort"','"Full send"'),('"No medal yet"','"No medal yet. Earn it."'),
]
for _ta,_tb in THEME:
  if _ta in s: s=s.replace(_ta,_tb)
# ---- 12 Nov replan: END, sprints, leaf counting ----
_sp_block='    {n:1,name:"Set up and first proof",start:"2026-11-03",end:"2026-11-12",goal:"Systems running, StoryBrand finished, HASM case study live",posts:5,comments:40,applications:2},\n    {n:2,name:"Brand foundation and first proof",start:"2026-11-13",end:"2026-11-25",goal:"HASM and Javelin live, brand script and LinkedIn profile done, posting daily",posts:11,comments:35,applications:4},\n    {n:3,name:"First demand",start:"2026-11-26",end:"2026-12-05",goal:"Mugassam live, post bank back to 5, first inquiry calls",posts:22,comments:75,applications:8},\n    {n:4,name:"Second project, portfolio draft",start:"2026-12-06",end:"2026-12-15",goal:"Real estate live by 13 Dec, offline portfolio draft",posts:34,comments:120,applications:12},\n    {n:5,name:"Portfolio v1",start:"2026-12-16",end:"2026-12-25",goal:"Offline portfolio v1 in 2 versions by 18 Dec, F&B live",posts:47,comments:175,applications:16},\n    {n:6,name:"Close Milestone 1",start:"2026-12-26",end:"2027-01-03",goal:"Keynote live by 31 Dec, Gate 1 review on 3 Jan",posts:60,comments:240,applications:20}'
R2=[('sub("guard");sub("gym"','sub("guard");sub("diet");sub("plans");sub("rollover");sub("gym"',1),
('START = "2026-11-03", END = "2026-12-31";','START = "2026-11-03", END = "2027-01-03";',1),
('Day <span id="dayNum">--</span> of 59','Day <span id="dayNum">--</span> of 62',1),
('(3 Nov to 31 Dec 2026)','(3 Nov to 3 Jan 2027)',1),
('Target: 20 by 31 December.','Target: 20 by 3 January.',1),
('.filter(t=>t.date===s&&!t.cut).sort((a,b)=>(a.order||0)-(b.order||0));}','.filter(t=>t.date===s&&!t.cut&&isLeaf(t)).sort((a,b)=>(a.order||0)-(b.order||0));}',1),
('function tasksDoneOn(d){return Object.values(state.tasks).filter(','function tasksDoneOn(d){return leafTasks().filter(',1),
('.filter(t=>t.date<sel&&!t.done&&!t.cut).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:(a.order||0)-(b.order||0));','.filter(t=>isLeaf(t)&&t.date<sel&&!t.done&&!t.cut).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:(a.order||0)-(b.order||0));',1),
('const sTasks=Object.values(state.tasks).filter(t=>t.sprint===sp.n&&!t.cut)','const sTasks=leafTasks().filter(t=>t.sprint===sp.n&&!t.cut)',1),
('const all=Object.entries(state.tasks).map(([id,t])=>({id,...t})).filter(t=>t.done&&!t.cut).sort(','const all=leafTasks().filter(t=>t.done&&!t.cut).sort(',1),
('same=Object.values(state.tasks).filter(x=>x.cat===t.cat&&!x.cut&&','same=leafTasks().filter(x=>x.cat===t.cat&&!x.cut&&',1)]
for a_,b_,n_ in R2:
    assert s.count(a_)==n_,(a_[:50],s.count(a_));s=s.replace(a_,b_)
R3=[("    // sprint bars: cumulative vs this sprint's target, with a pace marker\n","    {const sp=spViewOf(sprintFor(sel));\n    // sprint bars: cumulative vs this sprint's target, with a pace marker\n",1),
('gone=Math.min(total,idx-dayIndex(sp.start)+1)','gone=Math.max(0,Math.min(total,idx-dayIndex(sp.start)+1))',1),
('const sTasks=leafTasks().filter(t=>t.sprint===sp.n&&!t.cut), sDone','const sTasks=spTasks(sp), sDone',1),
('sumLogs(START,sel,"posts"),sp.posts','sumLogs(START,spEnd(sp,sel),"posts"),sp.posts',1),
('sumLogs(START,sel,"comments"),sp.comments','sumLogs(START,spEnd(sp,sel),"comments"),sp.comments',1),
('sumLogs(START,sel,"applications"),sp.applications','sumLogs(START,spEnd(sp,sel),"applications"),sp.applications',1),
('    }));\n\n    // learning','    }));spChips(sp);}\n\n    // learning',1)]
for a_,b_,n_ in R3:
    assert s.count(a_)==n_,(a_[:50],s.count(a_));s=s.replace(a_,b_)
_m=re.search(r'const DEFAULT_SPRINTS = \[\n.*?\n  \];',s,re.S);assert _m
s=s.replace(_m.group(0),'const DEFAULT_SPRINTS = [\n'+_sp_block+'\n  ];')
mod=(open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/module.js').read()+'\n'+open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/syncsafe.js').read()+'\n'+open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/module2.js').read()+'\n'+open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/module3.js').read()+'\n'+open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/module4.js').read()+'\n'+open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/module5.js').read()+'\n'+open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/module6.js').read()+'\n'+open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/module7.js').read()+'\n'+open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/module8.js').read()+'\n'+open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/module9.js').read()).replace('b.from+" to "+b.to','t12(b.from)+" to "+t12(b.to)')
s=s.replace(a,a+mod+'\n').replace('b.from+" to "+b.to','t12(b.from)+" to "+t12(b.to)')
i=s.index('</style>\n\n<nav class="topnav"');s=s[:i]+(open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/style.css').read()+'\n'+open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/style2.css').read())+s[i:]
open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/new.html','w').write(s)
open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/main.js','w').write(re.findall(r'<script>(.*?)</script>',s,re.S)[-1])
open('/tmp/claude-0/-home-user-ahmedfetyan/a43a4871-81e3-5037-9abb-260f84a9877e/scratchpad/pickerfix/app/test.html','w').write('<meta charset="utf-8">'+s)
