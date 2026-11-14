#!/usr/bin/env python3
"""Tests apply_replan.py on liveapply/final.json (argv[1] overrides) in a temp dir. No live data."""
import datetime, os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from applylib import canon, load, save

SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "liveapply", "final.json")
ok = True
def check(name, cond, extra=""):
    global ok
    print(("PASS " if cond else "FAIL ") + name + (" " + str(extra) if extra and not cond else ""))
    ok &= bool(cond)
def run(*args, expect=0):
    r = subprocess.run([sys.executable, *args], capture_output=True, text=True, cwd=HERE)
    if r.returncode != expect:
        print(r.stdout, r.stderr); raise SystemExit(f"unexpected exit {r.returncode}: {args}")
    return r.stdout

tmp = tempfile.mkdtemp(prefix="replan_test_")
base = os.path.join(tmp, "base.json"); save(base, load(SRC))
bb = open(base, "rb").read()
out = os.path.join(tmp, "out.json")
bd = os.path.join(tmp, "backup")
print(run("apply_replan.py", base, out, "--baseline", base, "--backup-dir", bd, "--run-id", "t1"))
d = load(out); T = d["tasks"]
live = lambda t: not (t.get("archived") or t.get("done") or t.get("bucket"))

check("backup equals input", open(os.path.join(bd, "replan-t1.backup.json"), "rb").read() == bb)
check("rollback record", os.path.exists(os.path.join(bd, "replan-t1.rollback.json")) and "replan-t1" in d["diet"])
act = [i for i, t in T.items() if t.get("bucket") and t.get("kind") == "portfolio" and t.get("bState") == "active"]
check("one active portfolio bucket (HASM)", act == ["v4-p-hasm"], act)
q = {i: t["queue"] for i, t in T.items() if t.get("bucket") and t.get("queue")}
check("queue Javelin 1, Real estate 2, Mugassam 5", q == {"v4-p-javelin": 1, "b-realestate": 2, "v4-p-mugassam": 5}, q)
check("no client bucket", not any(t.get("kind") == "client" for t in T.values()))
check("every bucket kind portfolio or null", all(t.get("kind") in ("portfolio", None) for t in T.values() if t.get("bucket")))
cnt = lambda b: [i for i, t in T.items() if live(t) and t.get("parent") == b]
check("HASM 4, Javelin 10, Mugassam 10", (len(cnt("v4-p-hasm")), len(cnt("v4-p-javelin")), len(cnt("v4-p-mugassam"))) == (4, 10, 10),
      (len(cnt("v4-p-hasm")), len(cnt("v4-p-javelin")), len(cnt("v4-p-mugassam"))))
check("each project at most 12 live", all(len(cnt(b)) <= 12 for b in ("v4-p-hasm", "v4-p-javelin", "v4-p-mugassam", "b-realestate")))
check("every project milestone has phase", all(T[i].get("phase") in ("Plan", "Design", "Publish", "Outreach")
      for b in ("v4-p-hasm", "v4-p-javelin", "v4-p-mugassam", "b-realestate") for i in cnt(b)))
check("Mugassam categorised (phase) and no sprint", all(T[i].get("phase") and T[i]["sprint"] is None for i in cnt("v4-p-mugassam")))

load_by, blocks = {}, {}
for i, t in T.items():
    if live(t) and t.get("cat") in ("portfolio", "client") and t.get("date"):
        load_by[t["date"]] = load_by.get(t["date"], 0) + t["mins"]
        blocks.setdefault((t["date"], t.get("block")), []).append(t)
check("daily design load never over 400", all(v <= 400 for v in load_by.values()), load_by)
check("blocks hold one bucket and at most 240", all(len({x["parent"] for x in v}) == 1 and sum(x["mins"] for x in v) <= 240 for v in blocks.values()))
fri = [i for i, t in T.items() if live(t) and t.get("date") and t["date"] >= "2026-11-14" and datetime.date.fromisoformat(t["date"]).weekday() == 4]
check("only m-rev-01 on a Friday", fri == ["m-rev-01"], fri)

hs = max(T[i]["date"] for i in cnt("v4-p-hasm")); js = min(T[i]["date"] for i in cnt("v4-p-javelin"))
je = max(T[i]["date"] for i in cnt("v4-p-javelin"))
check("HASM then Javelin sequential (hand-over day in separate blocks)", hs <= js and
      not set((t["date"], t["block"]) for i in cnt("v4-p-hasm") for t in [T[i]] if t["cat"] == "portfolio") &
      set((T[i]["date"], T[i]["block"]) for i in cnt("v4-p-javelin")))
check("Javelin ends by Sun 22 Nov, buffer 600", je <= "2026-11-22" and sum(T["v4-p-javelin"]["bBuffer"].values()) == 600 and
      T["v4-p-javelin"]["mins"] == 2000 and sum(T[i]["mins"] for i in cnt("v4-p-javelin")) == 2000)
s2 = [i for i, t in T.items() if live(t) and t.get("sprint") == 2]
by = lambda p: len([i for i in s2 if T[i]["parent"] == p])
check("Sprint 2 leaves 22 (HASM 4, Javelin 10, Learning 6, Reviews 2)",
      (len(s2), by("v4-p-hasm"), by("v4-p-javelin"), by("b-learning"), by("b-reviews")) == (22, 4, 10, 6, 2), len(s2))
shelved = {b for b, t in T.items() if t.get("bucket") and t.get("bState") == "paused" and t.get("queue") != 1}
check("no paused non-queue-1 task has a sprint", not [i for i, t in T.items() if live(t) and t.get("parent") in shelved and t.get("sprint")])
check("Taste makers not migrated (untouched)", not any(i in d["diet"]["replan-t1"]["patched"].get("tasks", {}) or i in d["diet"]["replan-t1"]["created"].get("tasks", [])
      for i, t in T.items() if "taste" in (t.get("title") or "").lower()) and not any(t.get("bucket") and "taste" in t["title"].lower() and t.get("queue") for t in T.values()))
check("nothing deleted", all(i in T for i in load(base)["tasks"]))
check("buffer days kept", d["sprints"]["s2"]["buffer"] == load(base)["sprints"]["s2"]["buffer"])
check("sprint goals untouched without --goals", d["sprints"]["s3"]["goal"] == load(base)["sprints"]["s3"]["goal"])

# idempotent
out2 = os.path.join(tmp, "out2.json")
run("apply_replan.py", out, out2, "--baseline", base, "--backup-dir", bd, "--run-id", "t2")
check("idempotent", open(out2, "rb").read() == open(out, "rb").read())

# flags
out3 = os.path.join(tmp, "out3.json")
run("apply_replan.py", base, out3, "--baseline", base, "--backup-dir", os.path.join(tmp, "b3"), "--run-id", "t3", "--later-stubs", "--goals")
d3 = load(out3)
check("--later-stubs and --goals", d3["tasks"]["b-fnb"]["queue"] == 3 and d3["tasks"]["b-keynote"]["queue"] == 4
      and d3["sprints"]["s3"]["goal"] == "Real estate live, first inquiry calls")

# drift stops
dr = load(base); dr["tasks"]["m-hasm-01"]["done"] = True
dp = os.path.join(tmp, "drift.json"); save(dp, dr)
run("apply_replan.py", dp, os.path.join(tmp, "drift_out.json"), "--baseline", base, "--backup-dir", os.path.join(tmp, "b4"), expect=2)
check("drift stops with exit 2", not os.path.exists(os.path.join(tmp, "drift_out.json")))

# rollback byte for byte
rb = os.path.join(tmp, "rolled.json")
run("rollback_diet.py", out, rb, "replan-t1")
check("rollback restores byte for byte", open(rb, "rb").read() == bb)
print("\nALL PASS" if ok else "\nFAILURES")
sys.exit(0 if ok else 1)
