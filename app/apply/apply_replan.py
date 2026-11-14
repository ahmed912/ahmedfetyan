#!/usr/bin/env python3
"""Replan (REPLAN_FOCUS.md round A1): one portfolio project at a time.
HASM active; Javelin first in the Up next queue, then Real estate, Mugassam last
(10 tasks, capped). Sets bucket kind/queue/active flag, milestone dates, blocks
and phase, Javelin 2000 min with 600 min buffer on 21 and 22 Nov. Nothing deleted.
Usage: apply_replan.py IN.json OUT.json [--later-stubs] [--goals] [--force] [--baseline PATH]
Rollback: rollback_diet.py OUT.json restored.json replan-<ts>"""
import os
from applylib import parser, Run, load, save

HERE = os.path.dirname(os.path.abspath(__file__))
H, J, M, RE = "v4-p-hasm", "v4-p-javelin", "v4-p-mugassam", "b-realestate"
D = lambda s: "2026-" + s if len(s) == 5 else s

# bucket id: (kind, bState, queue, extra fields)
BUCKETS = {
    H: ("portfolio", "active", None, dict(bNoSprint=False, bStart="2026-11-03", bEnd="2026-11-15")),
    J: ("portfolio", "paused", 1, dict(bNoSprint=False, bStart="2026-11-15", bEnd="2026-11-22", mins=2000,
                                       bBuffer={"2026-11-21": 200, "2026-11-22": 400})),
    RE: ("portfolio", "paused", 2, dict(bStart="2026-11-23", bEnd="2026-12-10")),
    M: ("portfolio", "paused", 5, dict(sprint=None, bStart="2027-01-04", bEnd="2027-01-10")),
    "b-learning": (None, "active", None, {}),
    "b-reviews": (None, "active", None, {}),
    "b-linkedin": (None, "paused", None, {}),
}

# id: (date, block, mins, phase, sprint, extra)
SH = dict(mode="shallow")
PATCH = {
    "m-hasm-01": ("11-14", 1, 150, "Design", 2, {}),
    "m-hasm-02": ("11-14", 2, 150, "Publish", 2, {}),
    "m-hasm-03": ("11-15", 1, 60, "Publish", 2, {}),
    "m-hasm-04": ("11-15", 3, 150, "Outreach", 2, SH),
    "m-jav-01": ("11-15", 2, 200, "Plan", 2, dict(pri=1)),
    "m-jav-02": ("11-16", 1, 200, "Plan", 2, dict(pri=1)),
    "m-jav-05": ("11-19", 2, 200, "Publish", 2, dict(pri=1)),
    "m-jav-06": ("11-21", 1, 200, "Publish", 2, dict(pri=1)),
    "m-re-01": ("11-23", 1, 100, "Plan", None, {}),
    "m-re-02": ("11-23", 2, 180, "Plan", None, {}),
}
MUG = [  # n, date, block, mins, phase
    (1, "2027-01-04", 1, 150, "Plan"), (2, "2027-01-04", 2, 180, "Plan"),
    (3, "2027-01-05", 1, 150, "Plan"), (4, "2027-01-05", 2, 180, "Plan"),
    (5, "2027-01-06", 1, 180, "Design"), (6, "2027-01-06", 2, 180, "Design"),
    (7, "2027-01-07", 1, 150, "Design"), (8, "2027-01-07", 2, 150, "Design"),
    (9, "2027-01-09", 1, 150, "Design"), (10, "2027-01-09", 2, 150, "Publish"),
]
for n, d, b, m, ph in MUG:
    PATCH[f"m-mug-{n:02d}"] = (d, b, m, ph, None, dict(pri=1))
LEARN = ["11-14", "11-15", "11-16", "11-17", "11-18", "11-19"]
for n, d in enumerate(LEARN, 1):
    PATCH[f"m-learn-{n:02d}"] = (d, 3, None, None, 2, {})
LINKEDIN_SPRINT_OFF = ["m-li-01", "m-li-02", "m-li-03", "m-li-04"]

# new Javelin milestones: id, order, title, date, block, phase, checklist, mergedFrom
NEW = [
    ("m-jav-07", "Design slides 1 to 3", "11-16", 2, "Design", "Slide 1; Slide 2; Slide 3", ["m-jav-03"]),
    ("m-jav-08", "Design slides 4 to 6", "11-17", 1, "Design", "Slide 4; Slide 5; Slide 6", ["m-jav-03"]),
    ("m-jav-09", "Design slides 7 to 9", "11-17", 2, "Design", "Slide 7; Slide 8; Slide 9", ["m-jav-03"]),
    ("m-jav-10", "Design slides 10 to 12", "11-18", 1, "Design", "Slide 10; Slide 11; Slide 12", ["m-jav-03", "m-jav-04"]),
    ("m-jav-11", "Design slides 13 to 15", "11-18", 2, "Design", "Slide 13; Slide 14; Slide 15", ["m-jav-04"]),
    ("m-jav-12", "Polish and export", "11-19", 1, "Design", "Polish pass; Export", ["m-jav-04"]),
]
ARCHIVE = {"m-jav-03": "m-jav-07", "m-jav-04": "m-jav-10"}
PROJECTS = {"hasm": dict(due="2026-11-15", order=1), "javelin": dict(due="2026-11-22", order=2),
            "realestate": dict(order=3), "fnb": dict(order=4), "keynote": dict(order=5),
            "mugassam": dict(due="2027-01-10", order=6)}

p = parser("Replan: one portfolio project at a time")
p.add_argument("--later-stubs", action="store_true", help="create empty paused F&B and Keynote buckets (queue 3, 4)")
p.add_argument("--goals", action="store_true", help="set the Sprint 3 goal to 'Real estate live, first inquiry calls'")
p.add_argument("--baseline", default=os.path.join(HERE, "..", "..", "liveapply", "final.json"),
               help="export the replan was written on (drift check)")
a = p.parse_args()

pre = load(a.input)
if any(k.startswith("replan-") for k in pre.get("diet", {})) and "m-jav-07" in pre.get("tasks", {}):
    print("replan already applied (diet/replan-* exists); nothing to do")
    save(a.output, pre)
    raise SystemExit(0)

r = Run("replan", a)
T = r.coll("tasks")
base = load(a.baseline) if os.path.exists(a.baseline) else None
if base is None:
    print(f"note: baseline {a.baseline} not found, drift check skipped")

# drift check on every patched id
if base is not None and not a.force:
    bt, bad = base.get("tasks", {}), []
    ids = list(BUCKETS) + list(PATCH) + LINKEDIN_SPRINT_OFF + list(ARCHIVE)
    for i in ids:
        if i not in T:
            bad.append(f"{i}: missing in live")
            continue
        if i not in bt:
            continue
        for f in ("done", "date", "title", "archived", "bState"):
            if T[i].get(f) != bt[i].get(f):
                bad.append(f"{i}.{f}: live {T[i].get(f)!r} vs baseline {bt[i].get(f)!r}")
    if bad:
        print("STOP: live data differs from the baseline. Re-run on a fresh export or pass --force.")
        for b in bad[:20]:
            print("  " + b)
        raise SystemExit(2)
for i in list(BUCKETS) + list(PATCH) + list(ARCHIVE):
    if i not in T:
        raise SystemExit(f"STOP: {i} missing")


def put(coll, id_, fields):
    doc = r.coll(coll)[id_]
    ch = {k: v for k, v in fields.items() if k not in doc or doc[k] != v}
    if ch:
        r.patch(coll, id_, ch)


# buckets
for bid, (kind, state, queue, extra) in BUCKETS.items():
    put("tasks", bid, dict(kind=kind, bState=state, queue=queue, **extra))

# milestones
for mid, (date, block, mins, phase, spr, extra) in PATCH.items():
    f = dict(date=D(date), block=block, sprint=spr, **extra)
    if mins is not None:
        f["mins"] = mins
    if phase:
        f["phase"] = phase
    put("tasks", mid, f)
for mid in LINKEDIN_SPRINT_OFF:
    put("tasks", mid, dict(sprint=None))

# Javelin: archive the two big steps, create six one-block milestones
for mid, to in ARCHIVE.items():
    put("tasks", mid, dict(archived=True, parkReason="replan", replacedBy=to))
n0 = max(t.get("order") or 0 for t in T.values())
for k, (mid, title, date, block, phase, chk, merged) in enumerate(NEW, 1):
    items = [{"id": f"{mid}-c{j}", "t": t.strip(), "done": False} for j, t in enumerate(chk.split(";"), 1)]
    r.create("tasks", mid, dict(parent=J, title=title, cat="portfolio", date=D(date), mins=200, pri=1, sprint=2,
                                check=items, mergedFrom=merged, done=False, order=n0 + k, block=block, phase=phase))

# optional
if a.later_stubs:
    for k, (bid, title) in enumerate([("b-fnb", "Food and beverage"), ("b-keynote", "Keynote or investor update")]):
        if bid not in T:
            r.create("tasks", bid, dict(title=title, cat="portfolio", date=None, parent=None, bucket=True,
                                        kind="portfolio", bState="paused", queue=3 + k, bStart=None, bEnd=None,
                                        sprint=None, done=False, order=n0 + 10 + k))
if a.goals and "s3" in r.coll("sprints"):
    put("sprints", "s3", dict(goal="Real estate live, first inquiry calls"))

# projects
for pid, f in PROJECTS.items():
    if pid in r.coll("projects"):
        put("projects", pid, f)

live = lambda t: not (t.get("archived") or t.get("done") or t.get("bucket"))
load_by = {}
for t in T.values():
    if live(t) and t.get("cat") in ("portfolio", "client") and t.get("date"):
        load_by[t["date"]] = load_by.get(t["date"], 0) + (t.get("mins") or 0)
cnt = lambda b: sum(1 for t in T.values() if live(t) and t.get("parent") == b)
s2 = [t for t in T.values() if live(t) and t.get("sprint") == 2]
queue = sorted((t["queue"], t["title"]) for t in T.values() if t.get("bucket") and t.get("queue"))
act = [t["title"] for t in T.values() if t.get("bucket") and t.get("kind") == "portfolio" and t.get("bState") == "active"]
out = [f"active portfolio: {act}",
       "Up next: " + ", ".join(f"{q} {n}" for q, n in queue),
       f"live milestones: HASM {cnt(H)}, Javelin {cnt(J)}, Real estate {cnt(RE)}, Mugassam {cnt(M)}",
       f"Sprint 2 live tasks: {len(s2)}",
       "design load per day (min): " + ", ".join(f"{d[5:]}={v}" for d, v in sorted(load_by.items()) if d <= "2026-11-30")]
if base is not None:
    out.append("Live tasks not in baseline (untouched):")
    extra = [(i, t) for i, t in T.items() if live(t) and i not in base.get("tasks", {}) and i not in r.created.get("tasks", [])]
    out += [f"  {i} | {t.get('title')} | {t.get('date')} | {t.get('parent')} | {t.get('sprint')}" for i, t in extra] or ["  none"]
r.finish(out)
