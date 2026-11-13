# Handoff (12 Nov 2026). Read this instead of the old chat.
## Rules (user)
- Pick the cheapest model per task: architect (Opus) plans, builder (Sonnet) codes, runner (Haiku) builds/tests/uploads. Briefs under 10 lines, replies 5 lines. Rules also in ~/.claude/CLAUDE.md.
- Publish without asking when tests pass. Free plans only. No em dashes. Calm glass style. Non-essential items go to BACKLOG_WEDNESDAY.md.
## App and where things are
- Source: /home/claude/app (symlink to scratchpad/src): orig.html + module.js, syncsafe.js, module2..5.js, style2.css, build.py. Build: python3 build.py && node --check main.js. Tests: v3/*.js (Playwright, harness v3/h.js, data via MOCKDATA env).
- Live phone app = Supabase project nycgqujjlwwhomuuudnx table app_code, last published version 1794480794. Rollback: delete the newest version's rows.
- Publish flow: build, gzip+base64 in 60000 char parts (pub/), fresh secret, migration enables upload_app_tmp2 with sha256(secret), python POST parts to /rest/v1/rpc/upload_app_tmp2 with the publishable key from site/config.js, migration disables it again (raise exception, revoke), delete secret, compare md5 of parts with string_agg md5 in app_code.
## Data state (already applied)
- Replan option B applied: Sprint 2 13 to 25 Nov, Gate 1 3 Jan 2027, Gates 2 and 3 fixed. 13 parent tasks with steps (ids v4-..., v4r-NN, v4s-NN), old 50 tasks archived (replacedBy/parkReason). Day target 400 min (8 pomodoros) of portfolio/client work, Fri off. Taste Makers is OUT (archived). Backups taken before each apply.
- Plan files: scratchpad/plan/ (PLAN.md, tasks.json, rebalance.json, rebalance2.json, linkedin.json, CAL_DESIGN.md, SPEC_*.md).
## In progress (builder a220c3baa4448ffc5, not yet published)
- LinkedIn day pages with post editor; archive from waterfall + auto refill; work = portfolio/client only; swipe to reschedule steps (past sprint end allowed with warning); music floating button fix (module2.js, already edited, untested). After it reports: run full regression with a runner (r1m r2 r3 r4 r5 r7 r9 r10 r12 r13 r14 s1 s2), then publish.
## Next
- Calendar replacing the waterfall: plan/CAL_DESIGN.md (6 phases, custom module6.js, events collection). Decisions: stays in Review, weeks start Saturday, past sprint end allowed with a warning.
## Delivered
- gym-page.zip and app-share.zip (data-free copy for the friend). Not done: Claude artifact copy (needs a 170k token read), see BACKLOG_WEDNESDAY.md.
## Open questions for the user
- Is Javelin published? Gates 2 and 3 fixed? Strip knee-rehab text from the gym zip?

## UPDATE 12 Nov (after compact)
- Published version 1794485584 (LinkedIn day pages, archive+refill, work-only bar, swipe reschedule, music queue). All tests pass (r3 test updated). Upload function upload_app_tmp2 now has int signature only; re-enable by create or replace with sha256 check, then disable again.
- Source committed to repo branch claude/cloud-environment-setup-llsle2 under app/ (commit c4cd227). Repo must be made private by the user in GitHub Settings (blocked here). Offline zip sent for C:\Claude (no folder shared).
- Skill token-efficiency created (~/.claude/skills and zip sent).
- Next: calendar phases from plan/CAL_DESIGN.md; backlog in BACKLOG_WEDNESDAY.md.

## UPDATE 12 Nov (2)
- Published 1794487710: calendar phases 0-1 (module6, Day/3 days/Work week/Week/Month/Timeline, events synced) + LinkedIn post counter. Next: calendar phase 2 (drag/resize). Tests: run changed + cal1 only, full suite before publish.

## STANDING ORDER 13 Nov (user asleep)
- Publish every finished round when tests pass, no asking. Data changes (task diet, renames, sprint re-cut to 14 days = 10 + 4 buffer) are approved too, BUT: take a Supabase backup of the docs first, keep a one-tap rollback, and keep everything editable in the app. Order: reschedule/waterfall edit (builder a2218142c36c5863b), then PLAN_LOGIC.md rounds (plan/PLAN_LOGIC.md), task diet first.

## PUBLISHED 13 Nov: 1794596581
- Live = c4cd227 sources + picker fix + reschedule everywhere + waterfall edit + Week view (no calendar). Source of the live build is app/live/ (data files and secrets excluded). The older app/*.js tree contains the unpublished calendar (module6).
- All 15 tests passed. Next: time-entry visual simplification (#19), task diet (#14), sprints (#15), buckets (#16), renames (#17), planning rounds (#18).
