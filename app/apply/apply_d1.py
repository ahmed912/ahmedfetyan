#!/usr/bin/env python3
"""D1: HASM and Javelin leave Sprint 2 (D1_PATCH.md). 17 docs. Run first."""
from applylib import parser, Run

p = parser("D1 patch")
p.add_argument("--cut-javelin", action="store_true",
               help="also set cut:true on the 10 Javelin steps (only if refill pulls undated tasks)")
a = p.parse_args()
r = Run("d1", a)
T = r.coll("tasks")
if T["v4-p-hasm"].get("bucket"):
    raise SystemExit("STOP: D1 already applied")

hasm_steps = [f"v4-p-hasm-0{i}" for i in range(1, 6)]
jav_steps = [f"v4-p-javelin-0{i}" for i in range(1, 10)] + ["v4s-01"]
r.stale_check("tasks", ["v4-p-hasm", "v4-p-javelin"] + hasm_steps + jav_steps)

r.patch("tasks", "v4-p-hasm", dict(sprint=None, bucket=True, bState="active", bNoSprint=True,
                                  bStart="2026-11-03", bEnd=None, title="HASM showcase"))
for i in hasm_steps:
    r.patch("tasks", i, dict(sprint=None))
r.patch("tasks", "v4-p-javelin", dict(sprint=None, bucket=True, bState="paused", bNoSprint=True,
                                     bStart=None, bEnd=None, title="Javelin", date=None, days=None))
for i in jav_steps:
    f = dict(sprint=None, date=None)
    if a.cut_javelin:
        f["cut"] = True
    r.patch("tasks", i, f)

s2 = [t for t in T.values() if t.get("sprint") == 2 and not t.get("archived") and not t.get("done")]
r.finish([f"HASM: bucket, active, outside sprints, 5 steps keep their dates",
          f"Javelin: bucket, paused, 10 steps back to backlog (no date)",
          f"Sprint 2 open rows now: {len(s2)}"])
