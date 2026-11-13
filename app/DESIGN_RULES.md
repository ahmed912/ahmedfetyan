# THE THREE PILLARS (above every other rule)
Procrastination, fear of overwhelm, flexibility. Every feature, every tool, every decision, every word exists for these. Gate for every round and every change: write one line "serves pillar: X because Y". If it serves none, or works against one, do not build it.

# Design rules (user standing order, 13 Nov)
Every task and feature is judged by how Ahmed will actually use it. Applies to architect, builder and runner.

0. **Scope: do what was asked, nothing more.** If there is a better way to do something, write it as a short suggestion for Ahmed to accept or ignore. Never build or apply it unasked. This applies to the planner too: plans contain only what he requested, with ideas in a separate "Suggestions" list at the end.
1. **Journey first.** Before building, write a 5-line "day in use" projection: when he opens it, what he wants, the fewest taps, what he sees after. Put it at the top of each plan round. If the journey is not simple, redesign before coding.
2. **Whole feature, not half.** A feature ships with all its logic: add, edit, move, undo, delete or archive, empty state, and how it shows everywhere it appears (Today, Plan, Review, projects, buckets).
3. **Simple and calm.** Show the next 1 to 3 things, collapse the rest. Counts are for projects and milestones, never tiny steps. Defaults are sensible so he types as little as possible.
4. **Editable by him.** Everything the app or Claude creates (names, dates, buckets, sprints) can be changed in the app without help.
5. **No surprises.** Every change has Undo or a rollback. Data changes get a backup first.
6. **Seamless.** Same gestures and words in every place. Calm glass style, no new icons, no em dashes.
7. **Test the journey.** Each round has a Playwright check that follows the projected journey at 390 and 1300.
8. **Gestures over buttons.** Use swipe and long-press to replace buttons and cut clutter. Keep one gesture vocabulary everywhere (same as today: swipe right = done, swipe left = reschedule; long-press = quick menu with edit, move, rename, archive, delete; drag = move between days or buckets). Every gesture also has a visible fallback (a tap opens the same menu) and a one-time subtle hint, never a permanent extra button. Undo after every gesture.
9. **Brain-friendly design (neuroscience and cognitive load).** Treat attention and working memory as scarce.
   - Working memory holds about 4 chunks: show at most 3 to 4 items per group; collapse the rest behind one "more".
   - One primary action per screen and per card; one decision at a time; good defaults so he decides less (decision fatigue).
   - Recognition over recall: show the thing, do not make him remember where it is. Keep layouts and positions stable so spatial memory works.
   - Progressive disclosure: detail only on tap or long-press. Chunk related items into labelled groups.
   - Protect focus: avoid context switches, pop-ups and motion; calm colour, high contrast text, no flashing; no more than one notification at a time.
   - Show clear progress and a visible "done" state (closure reduces mental load); ask for few inputs and let him capture first, organise later.
   - Every new feature includes a short "cognitive load check" line in its round: items on screen, decisions asked, taps to finish.
10. **User pillars: procrastination, fear of overwhelm, flexibility seeker.** Every round must serve these three.
   - Procrastination: make starting tiny. Every task offers a "just 5 minutes" start (timer or first step), the next action is always one tap away, capture takes one line, and nothing demands a decision before he can begin.
   - Fear of overwhelm: never show the whole mountain. Default views show today's one to three things and a calm count; backlog and the rest stay collapsed; big tasks open into a small first step; no red overdue walls, no guilt language, no streak punishment.
   - Flexibility: nothing is locked. Move, shrink, split, postpone or drop any task or bucket in one gesture with Undo; buffer days and soft dates (a date is a plan, not a verdict); "not today" is a normal, free action; plans re-flow easily when the day changes.
   - Wording is gentle and neutral ("moved to Saturday", not "missed").
