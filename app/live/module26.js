// Panel and help: docked side panel, option help, first-use hints, How it works
// Serves pillar: fear of overwhelm (the main screen stays in sight, so opening an option never hides the day; every option says in one line what it does) and procrastination (no guessing, no hunting for how something works, so starting is cheaper).
try{if(window.__u){window.__u.psOpen=psOpen;window.__u.openPop=openPop;window.__u.capSheet=capSheet;}}catch(e){}
const PH_HELP={
 // Task sheet (module3 v3taskSheet, module9 plExtra, module7 chModeRow and ckSection, module6 bkPicker)
 "Day":["The day this task sits on Today.","Move the client review to Sunday.","resched"],
 "Days it spans":["How many days in a row it takes. It shows on each of them.","3 for a deck that needs three sessions.","plan"],
 "Minutes":["Your estimate of work time. Capacity checks the day still fits.","90 for one deep session.","capacity"],
 "Minutes of work":["Your estimate of work time. Capacity checks the day still fits.","90 for one deep session.","capacity"],
 "Category":["What kind of work this is. Only Portfolio and Client work count as work hours.","Portfolio for HASM, Brand for a LinkedIn banner.","work"],
 "Block type":["Deep goes into a work block, Shallow into the shallow batch.","Email replies are Shallow.","chunks"],
 "Estimate":["Rough length, so the day is not overfilled.","30 min for a quick revision.","capacity"],
 "Due":["The date it must be delivered. Shown on the card as a plain fact.","Client deadline 20 Nov.","due"],
 "Priority":["High goes first when time is short.","High for client feedback due today.","due"],
 "Bucket":["The project this belongs to.","Javelin, or No bucket.","buckets"],
 "Subtasks":["Small steps inside this task. Tick them as you go.","Sketch, layout, export.","subtasks"],
 "Start now":["Starts the timer on this task.","Start the hero slide.","war"],
 "Start for 5 minutes":["A tiny start. Stop after 5 minutes if you want.","Open the file and name the layers.","five"],
 "Reschedule":["Move it to another day. Swipe left does the same.","Push it to Saturday.","resched"],
 "Make it a subtask of...":["Nest it under a bigger task. It keeps its own day.","Put Export PNGs under HASM case study.","subtasks"],
 "Detach":["Make it a normal task again.","Take Export PNGs out of the case study.","subtasks"],
 "Archive":["Hide it but keep it. Restore any time.","Archive an idea you will not do this month.","archive"],
 "Delete":["Remove it. Undo for 10 seconds, then Recently deleted in Settings.","Delete a duplicate.","deleted"],
 // More menu (module3 v3taskMenu, module14)
 "Rename":["Change the name in place.","Hero slide to Hero slide v2.","edit"],
 "Edit":["All details: day, length, bucket, priority.","Change the estimate to 60 min.","edit"],
 "Move to bucket":["Put it in another project.","Move to Mugassam.","buckets"],
 "Restore":["Bring it back where it was.","Restore an archived task.","archive"],
 "Make it a habit":["It repeats as a habit instead of a task.","LinkedIn comments every weekday.","habits"],
 "Repeat":["It repeats as a habit instead of a task.","LinkedIn comments every weekday.","habits"],
 // Reschedule sheets (module3, module5, module22, module17)
 "Or type a day":["Type a day instead of tapping one.","24 Nov.","resched"],
 "Pick a date":["Choose the new day. Nothing is lost by moving.","Tomorrow, or Saturday.","resched"],
 "Pick any date":["Any day, also outside this sprint. It asks before crossing a sprint end.","1 Dec.","sprints"],
 // Buckets (module6 bkForm and bkMenu, module19, module20 bkSheet)
 "Edit bucket|Start":["First day of the project.","10 Nov.","buckets"],
 "New bucket|Start":["First day of the project.","10 Nov.","buckets"],
 "End":["Last planned day. A plan, not a verdict.","Gate date 30 Nov.","gates"],
 "Colour":["Its colour on cards and in the waterfall.","Teal for HASM.","buckets"],
 "State":["Active shows it on Today. Paused keeps it waiting on the shelf.","Pause Javelin while a client project runs.","oneproject"],
 "Move bucket":["Shift the whole project to new dates.","Start Mugassam a week later.","buckets"],
 "Pause":["Takes it off Today without losing anything.","Pause a portfolio project when a client lands.","oneproject"],
 "Resume":["Puts it back on Today.","Resume Javelin after delivery.","oneproject"],
 "New start day":["The new first day. Its tasks can move with it.","Start Mugassam on 1 Dec.","buckets"],
 "Edit bucket":["Name, dates, colour and state of this project.","Change the end date.","buckets"],
 "Select":["Tick several tasks, then act on all of them once.","Move three tasks to Saturday.","select"],
 // Capacity (module11 capSheet)
 "Work":["Your daily design hours. Baseline is the standard, stretch is the extra.","8 h baseline, 10 h stretch.","work"],
 "Work baseline (h)":["The standard work day. Only design work counts.","8.","work"],
 "Stretch (h)":["The extra you can push to. Tracked, never required.","10.","work"],
 "Learning":["The daily protected learning block. Not counted as work.","30 min minimum, 60 target.","learning"],
 "Learning minimum (min)":["The least learning that makes a complete day. Not below 30.","30.","learning"],
 "Learning target (min)":["What a good learning day looks like.","60.","learning"],
 "Shallow batch":["One block for small tasks: replies, admin, comments.","45 min after lunch.","chunks"],
 "Shallow batch (min)":["How long the shallow batch is.","45.","chunks"],
 "Recovery":["Sleep and rest that keep the season sustainable.","7 h sleep from 23:30.","recovery"],
 "Sleep minimum (h)":["Work that cuts into this is shown as a fact.","7.","recovery"],
 "Sleep from":["When the night starts. Nothing is offered after it.","23:30.","recovery"],
 // Time entries (module2)
 "Edit entry|Name":["What this time was spent on.","HASM layout.","time"],
 "Task":["The task this time belongs to. It adds to that task's time.","Javelin hero slide.","time"],
 "Sessions":["Each start and stop. Fix one if a timer ran on.","9:00 AM to 10:30 AM.","time"],
 "From":["When it started.","9:00 AM.","time"],
 "To":["When it ended.","10:30 AM.","time"],
 "Note":["Anything to remember about this time.","Client call ran long.","time"],
 // Media queue (module2)
 "Up next · tap to do now, hold to reorder":["What comes after this. Tap to play now, hold and drag to reorder.","Move a talk to the top.","media"],
 "Playing":["What is on now.","A design podcast.","media"],
 "Last played":["Recently played, to pick up again.","Yesterday's talk.","media"],
 // Self-mastery slips (module2)
 "Slips|Date":["The day it happened.","Today.","guard"],
 "Slips|Time":["Roughly when. Patterns show by time of day.","22:00.","guard"],
 "History":["Past entries, newest first.","Last week's moves.","review"],
 "Rollover|History":["What moved, when and why. Missing is recorded, not erased.","3 tasks moved from Monday.","rollover"],
 // Habits (module2 legacy add sheet and report; module25 if present)
 "Add a habit|Name":["What you want to repeat.","Read 10 pages.","habits"],
 "Days a week, from":["Low end of your weekly zone. Landing in the zone is a good week.","3.","habits"],
 "to":["High end of the zone. Above is fine, rest is part of the plan.","5.","habits"],
 "Last 5 weeks":["Five recent weeks side by side.","3, 4, 5, 4, 2 days.","habits"],
 "Habit|Repeat":["How often it comes back.","Weekdays, or 3x a week.","habits"],
 "Times a week":["How many days this week, any days you like.","3.","habits"],
 "Days":["The exact days it is due.","Sat, Mon, Wed.","habits"],
 "Time of day":["When it sits in the list. Evening ones come last.","Morning for gym.","habits"],
 "This week":["Your week at a glance. Tap a day to fix it.","Tap Thursday if you forgot to mark it.","habits"],
 // Sprints and day target (module3, module8)
 "Sprint|Name":["The sprint's name. Change it any time.","Portfolio push.","sprints"],
 "Goal":["What this sprint is for, in one line.","Ship the HASM case study.","sprints"],
 "Sprint|Day":["The day inside this sprint.","Tuesday 18 Nov.","sprints"],
 "Pomodoros":["Work target for this day in 50 minute rounds.","9 rounds is 7.5 h of focus.","work"],
 // LinkedIn (module4)
 "Hook":["The first line that stops the scroll.","Most decks fail on slide 2.","linkedin"],
 "Format":["The shape of the post.","Carousel.","linkedin"],
 "Pillar":["Which content theme this post serves.","Pitch decks.","linkedin"],
 "Status":["Where the post is now.","Draft.","linkedin"],
 "Notes":["Anything for this post.","Ask Sara for the case numbers.","linkedin"],
 // Money (module.js)
 "Account info (encrypted)":["Stored encrypted. Only you can read it.","IBAN for rent.","money"],
 "Paid before":["Payments already made for this.","October rent.","money"],
 "Items, by date":["What is coming, nearest first.","Internet bill on 20 Nov.","money"],
 "Needs a date":["Items still without a day. Give each one a date.","Car service.","money"],
 // Diamonds (if DIAMONDS has landed)
 "Reflection":["One line on what this took. Only you read it.","Two late nights, worth it.","diamonds"],
 "Mark shipped":["Records the project as delivered and moves it off the active list.","HASM delivered on 28 Nov.","diamonds"],
 "Unship":["Puts the project back on the active list.","Reopen for client changes.","diamonds"]
};
function phTitle(title,body){if(body.querySelector(".bks-sum"))return "Bucket sheet";if(/^Sprint /.test(title))return "Sprint";return title;}
function phKey(title,txt){txt=String(txt||"").replace(/\s+/g," ").trim();return PH_HELP[title+"|"+txt]||PH_HELP[txt]||null;}
function phDecorate(t,body){
  body.querySelectorAll(".label").forEach(label=>{if(label.dataset.ph)return;const h=phKey(t,label.textContent);if(!h)return;
    label.dataset.ph="1";label.after(el("span",{class:"ph-what",text:h[0]}));rsLong(label,()=>phPop(label,h));});
  const direct=[...body.children].flatMap(c=>c.classList.contains("v3-row")?[...c.children]:[c]);
  direct.forEach(b=>{if(!b.matches||!b.matches("button.btn")||b.matches(".mini,.cat-chip,.ps-sh-x")||b.dataset.ph)return;
    const own=[...b.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join("")||b.textContent;const h=phKey(t,own);if(!h)return;
    b.dataset.ph="1";b.append(el("span",{class:"ph-what ph-in",text:h[0]}));});}
PS_AFTER.push((title,body)=>phDecorate(phTitle(title,body),body));
function phPop(anchor,h){document.querySelectorAll(".ph-pop").forEach(x=>x.remove());
  const p=el("div",{class:"ph-pop",role:"note"},el("p",{text:h[0]}),el("p",{class:"ph-pop-ex",text:"Example: "+h[1]}));
  if(h[2])p.append(el("button",{type:"button",class:"mini ph-pop-go",onclick:()=>{p.remove();if(typeof phGlossary==="function")phGlossary(h[2]);}},"How it works"));
  document.body.append(p);const r=anchor.getBoundingClientRect(),w=Math.min(320,innerWidth-16),pw=p.offsetWidth||w,ph=p.offsetHeight||80;
  p.style.left=Math.max(8,Math.min(r.left,innerWidth-pw-8))+"px";p.style.top=Math.max(8,Math.min(r.bottom+4,innerHeight-ph-8))+"px";
  const off=e=>{if(p.contains(e.target))return;p.remove();document.removeEventListener("pointerdown",off,true);};
  setTimeout(()=>document.addEventListener("pointerdown",off,true),0);
  const sh=document.querySelector(".ps-sheet");if(sh)sh.addEventListener("scroll",()=>p.remove(),{once:true,passive:true});}
document.addEventListener("keydown",e=>{const p=document.querySelector(".ph-pop");if(e.key==="Escape"&&p){p.remove();e.stopPropagation();}},true);
window.__ph={key:phKey,help:PH_HELP,pop:phPop};
const PH_HINTS={
 "Task":"Details holds the day, length, bucket and priority. When it feels heavy, Start for 5 minutes.",
 "More":"Everything you can do with this task. Hold any task to get here.",
 "Reschedule":"A date is a plan, not a verdict. Pick a day, nothing is lost.",
 "Bucket":"Rename, move, pause, archive or delete this project.",
 "Bucket sheet":"One project: its tasks, dates and time logged. Hold and drag tasks to reorder.",
 "Capacity":"Baseline is the standard, stretch is the extra. Work is protected first.",
 "Plan the week":"Set the week's targets once. Days re-flow when plans change.",
 "Time logged":"Every tracked minute, by week. Tap a row to fix it.",
 "War":"One task, one timer, nothing else. Pick the task and start.",
 "Rollover":"What did not happen moves forward, and the history stays.",
 "Habit":"One tap marks it. Swipe left to skip or move it. A skip never breaks the streak.",
 "Done":"Finished work lands here by itself. Nothing to log.",
 "Sprint":"A sprint is 10 working days plus buffer. Dates are plans, not verdicts."
};
const PH_GLOSS=[
 {id:"today",g:"Day",t:"Today",w:"The day as a few chunks: work blocks, learning, the shallow batch. The next one to three things are open, the rest is folded.",ex:"Block 1 HASM, then Learning, then replies in the shallow batch."},
 {id:"chunks",g:"Day",t:"Chunks",w:"Similar tasks are grouped so they get finished together. A deep block holds one project; small tasks go to the shallow batch.",ex:"All LinkedIn comments in one 45 min batch."},
 {id:"work",g:"Day",t:"Work target",w:"Design hours for the day: the baseline is the standard, the stretch is the extra. Only portfolio and client work count.",ex:"Work 6.5 of 8 h. Stretch 10 h."},
 {id:"learning",g:"Day",t:"Learning block",w:"A protected daily block, not counted as work. A day with work but no learning is not complete.",ex:"Learning 20 of 30 min."},
 {id:"recovery",g:"Day",t:"Recovery",w:"Sleep minimum, Friday rest and buffer days are part of the system. Work past the sleep time is shown as a fact.",ex:"Sleep from 23:30, 7 h minimum."},
 {id:"capacity",g:"Day",t:"Capacity",w:"Checks that the planned minutes fit the day. When it overflows, the chunk says so plainly.",ex:"Block 2 is 40 min over."},
 {id:"five",g:"Focus",t:"Start for 5 minutes",w:"The smallest possible start. Stop after 5 minutes if you want; usually you will not.",ex:"Open the file and name the layers."},
 {id:"war",g:"Focus",t:"War",w:"One task, one timer, no distractions, in 50 and 10 minute rounds. Time lands on the task by itself.",ex:"War on Javelin hero slide, round 2 of 4."},
 {id:"pomodoro",g:"Focus",t:"Rounds",w:"Work is counted in 50 minute rounds with a 10 minute break.",ex:"9 rounds is 7.5 h of focus."},
 {id:"plan",g:"Plan",t:"Plan the week",w:"The weekly management meeting: targets per department, then the days fill from the buckets.",ex:"Portfolio 30 h, client 10 h, learning 3.5 h."},
 {id:"pva",g:"Plan",t:"Plan vs actual",w:"What was planned next to what happened, in neutral numbers.",ex:"Planned 40 h, worked 34 h."},
 {id:"sprints",g:"Plan",t:"Sprints",w:"Blocks of 10 working days plus buffer days. Moving work past a sprint end asks first.",ex:"Sprint 2: 10 to 23 Nov."},
 {id:"gates",g:"Plan",t:"Gates",w:"Company milestones with a date, always visible as a fact with the days left.",ex:"Gate 1: 30 Nov, 15 days."},
 {id:"resched",g:"Plan",t:"Reschedule",w:"Move a task to another day. A date is a plan, not a verdict.",ex:"Swipe left, pick Saturday."},
 {id:"rollover",g:"Plan",t:"Rollover",w:"Unfinished tasks move to the next working day, together with their chunk. The history stays visible.",ex:"3 tasks moved from Monday."},
 {id:"decide",g:"Plan",t:"Decide",w:"After 3 postpones a task asks for a decision: do it now, shrink it, split it or drop it.",ex:"Case study intro, moved 3 times."},
 {id:"waiting",g:"Plan",t:"Waiting",w:"Tasks blocked by someone else, kept out of the day until they move.",ex:"Waiting for client logo files."},
 {id:"due",g:"Plan",t:"Due and priority",w:"A due date is a delivery date shown as a fact; High goes first when time is short.",ex:"Due 20 Nov, High."},
 {id:"buckets",g:"Projects",t:"Buckets",w:"A bucket is one project with dates and its own tasks. Its tasks keep together on Today.",ex:"HASM, 1 to 30 Nov, 4 of 12 done."},
 {id:"oneproject",g:"Projects",t:"One portfolio project at a time",w:"Exactly one portfolio project is active; the next ones wait in Up next on the Later shelf.",ex:"HASM active, Javelin and Mugassam up next."},
 {id:"client",g:"Projects",t:"Client buckets",w:"Client work runs beside the active portfolio project and gets the first deep block.",ex:"Client deck gets Block 1 until delivery."},
 {id:"later",g:"Projects",t:"Later shelf and Up next",w:"Paused and future projects wait here in order, out of sight of the day.",ex:"Up next: Javelin, then Mugassam."},
 {id:"waterfall",g:"Projects",t:"Waterfall",w:"Projects on a timeline. Drag to move, hold and drag to reorder.",ex:"Move Javelin a week later."},
 {id:"subtasks",g:"Projects",t:"Subtasks",w:"Small steps inside a task. Counts are shown for projects, never for tiny steps.",ex:"Sketch, layout, export."},
 {id:"select",g:"Projects",t:"Select",w:"Tick several tasks, then one action acts on all of them.",ex:"Select three, Reschedule to Saturday."},
 {id:"inbox",g:"Projects",t:"Capture and inbox",w:"Type one line to capture. Organise later.",ex:"Call the printer about the deck."},
 {id:"time",g:"Time",t:"Time logged",w:"Every tracked minute, from timers, War and by hand. Overlaps count once.",ex:"Week of 9 Nov: 31 h."},
 {id:"byhand",g:"Time",t:"Add time by hand",w:"Log time you forgot to track, against a task or a label.",ex:"Client call, 2:00 PM to 3:00 PM."},
 {id:"spent",g:"Time",t:"Time spent",w:"Each task shows the time logged on it; a bucket shows the total of its tasks.",ex:"Hero slide 3h 20m. HASM 24h logged."},
 {id:"habits",g:"Habits",t:"Habits",w:"Things you repeat, shown once on Today as Habits 2 of 5. One tap marks one; swipe left to skip or move it.",ex:"Gym 3x a week, English on weekdays."},
 {id:"streak",g:"Habits",t:"Streak",w:"Due days done in a row. A day that is not due, or skipped, never breaks it.",ex:"Read: 12 d, best 20."},
 {id:"guard",g:"Habits",t:"Self-mastery",w:"Bad habits tracked quietly: slips, urges overcome, clean days.",ex:"Clean 9 of 10 days."},
 {id:"diamonds",g:"Records",t:"Done and Shipped",w:"A quiet record of finished tasks, habit days, logged effort and delivered projects. Nothing to log.",ex:"Done 7 this week. Shipped 2."},
 {id:"review",g:"Records",t:"Review and insights",w:"The week in facts: hours, tasks carried over, patterns.",ex:"Best day this week: Tuesday, 9 h."},
 {id:"linkedin",g:"Records",t:"LinkedIn day pages",w:"Each day has a post page: hook, format, pillar and status.",ex:"Hook: Most decks fail on slide 2."},
 {id:"media",g:"Records",t:"Intentional media",w:"A chosen queue of talks and podcasts, instead of the feed.",ex:"Up next: a pitching talk."},
 {id:"money",g:"Money",t:"Finance",w:"Payments due, budget, things to buy and accounts. A due payment shows on Today three days ahead.",ex:"Rent due in 2 days."},
 {id:"undo",g:"Safety",t:"Undo",w:"Every change shows Undo on the bar for a few seconds.",ex:"Moved to Saturday. Undo."},
 {id:"archive",g:"Safety",t:"Archive",w:"Hide something without losing it. Restore any time.",ex:"Archived buckets (2)."},
 {id:"deleted",g:"Safety",t:"Recently deleted",w:"Deleted tasks, habits and time entries wait in Settings to be restored.",ex:"Restore a deleted task."},
 {id:"sync",g:"Safety",t:"Sync",w:"Changes save as you make them and show on your other devices.",ex:"Tick on the phone, see it on the desk."},
 {id:"swipe",g:"Gestures",t:"Swipe",w:"Swipe right for done, swipe left to reschedule or skip.",ex:"Swipe a task right: Done."},
 {id:"hold",g:"Gestures",t:"Hold",w:"Hold to open the quick menu; hold and drag to reorder any list.",ex:"Hold a habit, drag it to the top."},
 {id:"edit",g:"Gestures",t:"Edit anything",w:"Every name, date, bucket and sprint can be changed in the app.",ex:"Rename Sprint 3."},
 {id:"panel",g:"Help",t:"Side panel",w:"On a wide screen options open on the right while the day stays live. Esc or a tap outside closes it.",ex:"Tap another task to swap the panel."},
 {id:"help",g:"Help",t:"Option help",w:"Every option has one line saying what it does. Hold a label for an example.",ex:"Hold Stretch (h)."}
];
function phCfg(){return {seen:{},shown:{},off:false,...((state.settings||{}).help||{})};}
function phWrite(next){state.settings={...(state.settings||{}),help:{...next,at:Date.now()}};try{store.set("settings/help",state.settings.help);}catch(e){console.warn(e);}}
function phHint(k,body,first){const c=phCfg();if(c.off||c.seen[k]||!PH_HINTS[k])return;
  if(first){const seen={...c.seen},shown={...c.shown};shown[k]=(shown[k]||0)+1;if(shown[k]>=4){seen[k]=Date.now();phWrite({...c,seen,shown});return;}phWrite({...c,seen,shown});}
  if(body.querySelector(".ph-hint"))return;
  const d=el("div",{class:"ph-hint"},el("span",{text:PH_HINTS[k]}),el("button",{type:"button",class:"mini ph-hint-ok",onclick:()=>{const c2=phCfg();phWrite({...c2,seen:{...c2.seen,[k]:Date.now()}});d.remove();}},"Got it"));
  body.prepend(d);}
PS_AFTER.push((title,body,panel,first)=>phHint(phTitle(title,body),body,first));
const PH_GROUPS=["Day","Focus","Plan","Projects","Time","Habits","Records","Money","Safety","Gestures","Help"];
function phGlossary(focusId){let q="",open={},scrolled=false;if(focusId){open[focusId]=true;const f=PH_GLOSS.find(x=>x.id===focusId);if(f)open["g:"+f.g]=true;}
  psOpen("How it works",re=>{
    const search=el("input",{type:"search",class:"v3-in ph-gl-q",placeholder:"Search, like rollover or stretch","aria-label":"Search How it works",value:q});
    search.oninput=()=>{q=search.value;const p=search.selectionStart;re();setTimeout(()=>{const x=document.querySelector(".ps-sheet .ph-gl-q");if(x){x.focus();try{x.setSelectionRange(p,p);}catch(e){}}},0);};
    const off=phCfg().off;
    const set=el("div",{class:"v3-row ph-gl-set"},el("span",{class:"hint",text:"First-use hints"}),
      el("div",{class:"seg"},...[["On",false],["Off",true]].map(([n,v])=>el("button",{type:"button","aria-pressed":String(off===v),onclick:()=>{phWrite({...phCfg(),off:v});re();}},n))),
      el("button",{type:"button",class:"mini ph-gl-reset",onclick:()=>{phWrite({...phCfg(),seen:{},shown:{}});toast("Hints will show again");}},"Show hints again"));
    const qq=q.trim().toLowerCase(),L=PH_GLOSS.filter(x=>!qq||(x.t+" "+x.w+" "+x.ex).toLowerCase().includes(qq));
    const secs=PH_GROUPS.map(g=>{const rows=L.filter(x=>x.g===g);if(!rows.length)return null;
      const showAll=!!qq||open["g:"+g]||rows.length<=4,vis=showAll?rows:rows.slice(0,4);
      return el("section",{class:"ph-gl-sec"},el("h3",{class:"ph-gl-h",text:g}),
        el("ul",{class:"ph-gl-list"},...vis.map(x=>{const ex=!!qq||open[x.id];
          return el("li",{class:"ph-gl-row","data-id":x.id},el("button",{type:"button",class:"ph-gl-t","aria-expanded":String(!!open[x.id]),onclick:()=>{open[x.id]=!open[x.id];re();}},x.t),el("span",{class:"ph-gl-w",text:x.w}),ex?el("span",{class:"ph-gl-ex",text:"Example: "+x.ex}):null);})),
        !qq&&rows.length>4&&!showAll?el("button",{type:"button",class:"mini ck-more",onclick:()=>{open["g:"+g]=true;re();}},(rows.length-4)+" more"):null);}).filter(Boolean);
    setTimeout(()=>{if(focusId&&!scrolled){const r=document.querySelector('.ps-sheet .ph-gl-row[data-id="'+focusId+'"]');if(r){scrolled=true;r.scrollIntoView({block:"center"});}}},0);
    return [search,set,...(secs.length?secs:[el("p",{class:"hint ph-gl-none",text:"Nothing matches. Try another word."})])];});}
function phRow(){const rows=document.querySelector('.page[data-page="settings"] .set-rows');if(!rows||document.getElementById("howRow"))return;
  rows.append(el("div",{class:"set-row",id:"howRow"},el("div",{},el("b",{text:"How it works"}),el("span",{class:"hint",text:"Every feature in one or two lines, with an example"})),el("button",{type:"button",class:"btn ghost",id:"howBtn",onclick:()=>phGlossary()},"Open")));}
{const _r26=render;render=function(){_r26();try{phRow();}catch(e){console.warn(e);}};}
window.__ph.glossary=phGlossary;window.__ph.cfg=phCfg;window.__ph.write=phWrite;window.__ph.gloss=PH_GLOSS;window.__ph.hints=PH_HINTS;
