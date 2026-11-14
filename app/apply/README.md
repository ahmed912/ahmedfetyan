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
