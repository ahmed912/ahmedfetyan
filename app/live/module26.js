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
