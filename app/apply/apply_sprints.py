#!/usr/bin/env python3
"""Sprint re-cut (SPRINT_RECUT.md): 10 planned + 4 buffer days. Run after DIET."""
from applylib import parser, Run

CUT = {
 "s2": ("2026-11-14", "2026-11-27", ["2026-11-20", "2026-11-25", "2026-11-26", "2026-11-27"]),
 "s3": ("2026-11-28", "2026-12-11", ["2026-12-04", "2026-12-09", "2026-12-10", "2026-12-11"]),
 "s4": ("2026-12-12", "2026-12-25", ["2026-12-18", "2026-12-23", "2026-12-24", "2026-12-25"]),
 "s5": ("2026-12-26", "2027-01-03", ["2027-01-01", "2027-01-02", "2027-01-03"]),
}
a = parser("Sprint re-cut").parse_args()
r = Run("recut", a)
S = r.coll("sprints")
if "sprintCfg" in r.coll("settings"):
    raise SystemExit("STOP: re-cut already applied")
if not a.force and r.ref:
    for sid in ["s1", "s2", "s3", "s4", "s5", "s6"]:
        for f in ("start", "end"):
            if S[sid].get(f) != r.ref["sprints"][sid].get(f):
                raise SystemExit(f"STOP: sprints/{sid}.{f} differs from the proposal copy")
out = []
for sid, (st, en, buf) in CUT.items():
    r.patch("sprints", sid, {"start": st, "end": en, "buffer": buf})
    out.append(f"{sid}: {st} to {en}, buffer {len(buf)} days")
r.patch("sprints", "s6", {"archived": True, "mergedInto": "s5"})
out.append("s6: archived, mergedInto s5 (not deleted)")
r.create("settings", "sprintCfg", {"len": 14, "buffer": 4, "restWd": ["Fri"], "restIsBuffer": True})
# tasks already placed: list only, move nothing
bufdays = {d for _, _, b in CUT.values() for d in b} | {"2026-11-13"}
placed = sorted((t["date"], i) for i, t in r.coll("tasks").items()
                if not t.get("archived") and not t.get("done") and not t.get("bucket")
                and t.get("date") in bufdays)
out.append("open tasks on buffer days (none moved): " + ", ".join(f"{i}@{d[5:]}" for d, i in placed))
r.finish(out)
