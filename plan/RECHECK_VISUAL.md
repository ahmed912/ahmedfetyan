# RECHECK_VISUAL (R71, R72 shots at 390 and 1300)

Verdict: FIX (one small CSS rule, R72). R71 passes.

Serves pillar: overwhelm, because one left edge per list keeps the week matrix scannable.

## Findings
R71 (Today chunk rows, 390 and 1300): PASS.
- Theme unchanged vs earlier shots (wF2 r31_today_1300, r35_Movechunk_390): same surfaces, radius, shadows, hairlines.
- Tag dot now sits inside the Portfolio pill; dot visible on peach, size consistent at both widths.
- Long title ellipsizes, no overlap with tag, "about 1 h" or Details. Nothing clipped.

R72 (week matrix, Custom tasks list): FIX.
- Wed row "مهمة عربية" is right-aligned against "10 min" (r72-390 and r72-1300). Cause: `.mc-t` has dir="auto", so text-align:start resolves to right. Breaks the one-left-edge rule of the list (all other titles start at the same x).
- Everything else passes: hairlines between rows, long XXXX title ellipsizes in one row, Work tag pill with dot readable, no horizontal overflow.

Pre-existing, not from R71/R72 (no action this round, listed for the queue):
- "Thu 19" header in the grid and "Undo" in the toast are very faint peach in these light shots. `.mx-grid .mx-dh.today` and the toast use `--accent-ink`, which here resolves to the dark-scheme value #FFB38A on a light surface. Same faintness already visible in wF2 r18_grid_1300_light. Likely the Playwright context runs colorScheme dark while the page renders light. Check the shot setup before touching CSS.
- Week date input at 1300 shows "11/14/202" clipped at the top right.

## Round 1 (builder: Sonnet; runner for test)
1. File /home/user/ahmedfetyan/app/live/style40.css, line 7. In the rule `.mc-t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}` append `;text-align:left`. Keep `dir:"auto"` in module40.js line 34 unchanged (glyph order stays correct).
2. File /home/user/ahmedfetyan/app/live/v3/r72.js, after line 72 add:
   `{const a=await pg.locator('.mc-row.mc-c:has-text("مهمة") .mc-t').boundingBox(),b=await pg.locator('.mc-row.mc-c').first().locator('.mc-t').boundingBox();const tx=await pg.evaluate("(()=>{const t=[...document.querySelectorAll('.mc-t')].find(e=>e.textContent.includes('مهمة'));const r=document.createRange();r.selectNodeContents(t);return r.getBoundingClientRect().x})()");ok('33 RTL left edge',Math.abs(tx-b.x)<=2&&Math.abs(a.x-b.x)<=1,tx+'|'+b.x);}`
   Expected: Arabic title text starts at the same x as the other titles (within 2 px) at 390 and 1300.
3. Run (runner):
   `cd /home/user/ahmedfetyan/app/live && node v3/r72.js` (use the same MOCKDATA env the R72 run used, e.g. `MOCKDATA=/home/user/ahmedfetyan/app/live/v3/mock.json node v3/r72.js` if that is how r72 was launched). All checks pass; open v3/shots/r72-390.png and r72-1300.png and confirm the Arabic title starts at the left title edge.
4. Commit:
   `cd /home/user/ahmedfetyan && git add app/live/style40.css app/live/v3/r72.js app/live/v3/shots/r72-*.png && git commit -m "R72: left-align custom task titles incl. RTL"` (with the session attribution trailer). Publish per standing rule when tests pass.

## Open questions
None.

## Suggestions (not built)
- Queue: fix the shot context colour scheme so light shots use light `--accent-ink` (#9A3412); then recheck Thu header and toast Undo contrast.
- Queue: widen or let the week date input shrink so "11/14/2026" is not clipped at 1300.
