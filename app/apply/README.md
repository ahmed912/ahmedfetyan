# Round 4 data apply scripts

Scripts only. They read a JSON export `{collection: {id: doc}}`, write a patched copy and never touch live data. Importing the output into the live store is a separate, approved step (after rounds 2 and 3 and the approval gate).

Every run: writes a backup (`<outdir>/backup/<runId>.backup.json`, taken before any change), a rollback record (doc `diet/<runId>` in the output, plus `<runId>.rollback.json`), and prints a diff summary. Output is canonical JSON, so a rollback is byte-for-byte equal to the backup. A stale check compares ids to `plan/mock_final.json` (done, date, title) and stops with exit 2 if live differs; re-run the proposal on the fresh export, or pass `--force`.

## Run order (strict)
```
cd scratchpad/plan/apply
python3 apply_d1.py      live.json s1.json     # 1. HASM, Javelin out of Sprint 2 (17 docs)
python3 apply_diet.py    s1.json   s2.json     # 2. buckets, 35 milestones, archive old steps, set `block`
python3 apply_sprints.py s2.json   s3.json     # 3. re-cut S2 to S5, archive S6, settings.sprintCfg
python3 apply_renames.py s3.json   final.json  # 4. no-op after DIET (fallback titles only)
```
Diff before step 1: export live `tasks` and `sprints`. Each script stops on drift. Review the "MOVES for the user" lines printed by step 2 (a milestone moved because a bucket filled both blocks; currently m-hasm-03, 16 Nov to 19 Nov).
`apply_d1.py --cut-javelin` also sets `cut:true` on the Javelin steps (only if refill pulls undated tasks).

## One-command rollback
```
python3 rollback_diet.py final.json restored.json --all
```
Newest run first, restores every patched field, deletes created docs, removes `diet/<runId>`. One run only: `rollback_diet.py IN OUT diet-<ts>` (newer runs must be rolled back first). It stops if a patched field was edited after the run (`--force` overrides). The backups are the last resort.

## Test
`python3 test_apply.py` runs all four on `plan/mock_final.json` in a temp dir and asserts: backups exist, rollback byte-for-byte (all and stepwise), Sprint 2 visible tasks under 25, HASM and Javelin outside Sprint 2, no portfolio or HASM item moved to brand, daily design load at most 400, blocks hold one bucket and at most 240 min, shallow work only in block 3, stale export stops.

## Notes
- `sprint` is the integer sprint number in the data (2), not "s2".
- Learning and shallow milestones get block 3; shallow ones also `mode:"shallow"`. Deep blocks: larger bucket of the day gets B1 (tie: earlier bStart), a bucket over one block takes both.

## Replan (REPLAN_FOCUS.md round A1), step 5
```
python3 apply_replan.py final.json replan.json [--later-stubs] [--goals] [--force] [--baseline PATH]
python3 test_replan.py  final.json
python3 rollback_diet.py replan.json restored.json replan-<ts>     # byte-for-byte
```
One portfolio project at a time: HASM active, Javelin queue 1, Real estate 2, Mugassam last (queue 5, 10 tasks), bucket `kind`/`queue`/`bState`, milestone `phase`, dates and blocks (Fridays rest), Javelin 2000 min with 600 min buffer on 21 and 22 Nov. Learning, Reviews stay rails; LinkedIn paused; Taste makers not migrated; nothing deleted. Drift against `--baseline` (default `liveapply/final.json`) exits 2; the run is idempotent. `--later-stubs` adds empty paused F&B and Keynote buckets (queue 3, 4); `--goals` sets the Sprint 3 goal to "Real estate live, first inquiry calls". Note: the HASM and Javelin bucket `kind` was "parent" and becomes "portfolio" (rollback restores it).

## Unify steps and subtasks (14 Nov), step 6
Steps and Subtasks are one concept: child docs `{parent, sub:true, title, done, order}` with no estimate. The app never counts them as tasks.
```
python3 apply_unify.py final.json unified.json [--baseline PATH] [--force]     # scripts only, not run on live
python3 test_unify.py  final.json mock_final.json
python3 rollback_diet.py unified.json restored.json unify-<ts>                 # byte-for-byte
```
- Every task's `check` list (list or object of `{id,t,done,o}`) becomes real child docs (id = the old item id, title `t`, `done` and order kept, `cat`/`date`/`sprint` inherited, hidden if the parent is hidden), then `check` is removed from the task. 35 checklists become 115 subtasks on `liveapply/final.json`.
- Old subtasks made by the "Add a subtask" box get `sub:true`. They are found by: has a non-bucket parent, not archived, no `from`/`mergedFrom`/`replacedBy`, `order` is a timestamp (>= 1e12, written by the box), and no `date` and no `sprint`. A stored estimate is cleared only when it is exactly 60 (the app default when nothing is set); any other number was typed by him and stays. Parent estimates are never touched.
- Drift: every task that has a `check` in the baseline (default `liveapply/final.json`) must still match on done, date, title and check, or the run stops with exit 2. Idempotent: a second run changes nothing.
- `rollback_diet.py` now restores removed fields at their old position (`pos` in the record), so the rollback is byte-for-byte.
- `test_unify.py` runs on a copy of `final.json` and `mock_final.json` (also with synthetic old subtasks): backup, rollback byte-for-byte, Sprint counts unchanged (no subtask counted), parents' estimates unchanged, auto-default detection, drift stop, idempotent.
- App side: the app also converts any leftover `check` list the first time a task is opened, so an unconverted task never loses its list.
