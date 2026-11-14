#!/usr/bin/env python3
"""Rename pass (RENAMES.md). Section A is written by apply_diet.py. This script
checks section A, and applies section C (fallback titles) only to open steps
that still carry the old title, so it is a no-op after DIET."""
from applylib import parser, Run

A = {"v4-p-hasm": "HASM showcase", "v4-p-javelin": "Javelin", "v4-p-mugassam": "Mugassam",
     "b-realestate": "Real estate", "b-learning": "Learning", "b-linkedin": "LinkedIn", "b-reviews": "Reviews"}
C = {
 "v4-p-hasm-01": ("Slides 5 to 7, export all 7", "Finish slides 5 to 7"),
 "v4-p-hasm-03": ("Polish, Behance text, publish", "Publish HASM on Behance"),
 "v4-p-hasm-05": ("Upwork line, HASM as first piece", "Update the Upwork profile"),
 "v4-p-javelin-01": ("Status check: list what is left", "List what is left"),
 "v4-p-javelin-02": ("Storyline: one headline per slide", "Write the storyline"),
 "v4-p-javelin-07": ("Case study: problem, storyline, decisions", "Write the case study"),
 "v4-p-mugassam-01": ("Brief: problem, audience, the ask", "Write the brief"),
 "v4-p-mugassam-02": ("Storyline: headlines only", "Write the storyline"),
 "v4-p-mugassam-03": ("References and 3 directions with AI", "Explore 3 directions"),
 "v4-p-mugassam-04": ("Pick direction, grid and type", "Pick direction and grid"),
 "v4r-07": ("Real estate: brief and audience", "Write the real estate brief"),
 "v4r-10": ("Real estate: storyline headlines", "Write real estate headlines"),
 "v4s-04": ("Real estate: property and deck type", "Choose property and deck type"),
 "v4s-05": ("Real estate: 3 reference decks", "Save 3 reference decks"),
 "v4-p-storybrand-03": ("Brand script v1 (SB7)", "Write the brand script"),
 "v4-p-li-1-03": ("Designer list: follow 10, save 10 hooks", "Follow 10 designers"),
 "v4-p-sywmts-06": ("Hook checklist from SUCCESs", "Write the hook checklist"),
 "v4-p-ai-m4-01": ("Module 4, course finished", "Finish AI Module 4"),
 "v4-p-ai-m4-02": ("One note: use on Mugassam", "Note how AI helps Mugassam"),
 "v4-p-review-s2-01": ("Depth rule: HASM and Javelin live?", "Check the depth rule"),
 "v4-p-review-w1-01": ("Shipped, inquiries, red signals", "Write the weekly review"),
 "v4-p-review-s1-02": ("Apply tasks.json in the app", "Apply the new plan"),
}
a = parser("Rename pass").parse_args()
r = Run("rename", a)
T = r.coll("tasks")
out = []
for i, (old, new) in C.items():
    t = T.get(i)
    if t is None:
        out.append(f"skip {i}: not in data"); continue
    if t.get("archived"):
        continue  # replaced by DIET, already named by rule
    if t.get("title") != old:
        out.append(f"skip {i}: title already changed ({t.get('title')!r})"); continue
    r.patch("tasks", i, {"title": new})
for i, name in A.items():
    t = T.get(i)
    if t is not None and t.get("bucket") and t.get("title") != name:
        out.append(f"note: bucket {i} is {t.get('title')!r}, section A says {name!r}")
n = sum(len(v) for v in r.patched.values())
out.insert(0, f"section A: covered by DIET; section C: {n} open steps renamed")
r.finish(out)
