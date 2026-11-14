#!/usr/bin/env python3
"""Runs all four apply scripts on plan/mock_final.json (a copy in a temp dir;
no live data) and checks backups, rollback, Sprint 2, HASM/Javelin, categories, load."""
import glob, json, os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from applylib import canon, load, save

REF = os.path.join(HERE, "..", "mock_final.json")
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

tmp = tempfile.mkdtemp(prefix="apply_test_")
base = os.path.join(tmp, "base.json")
save(base, load(REF))
base_bytes = open(base, "rb").read()
steps = [("apply_d1.py", "d1"), ("apply_diet.py", "diet"), ("apply_sprints.py", "recut"), ("apply_renames.py", "rename")]
cur, prev_bytes, outs = base, [], {}
for n, (script, kind) in enumerate(steps, 1):
    out = os.path.join(tmp, f"step{n}.json")
    prev_bytes.append(open(cur, "rb").read())
    outs[kind] = run(script, cur, out, "--backup-dir", os.path.join(tmp, "backup"), "--run-id", f"t{n}")
    cur = out
print(outs["diet"])
final = load(cur)

# backups and rollback records exist; each backup equals its step input
for n, (script, kind) in enumerate(steps, 1):
    b = os.path.join(tmp, "backup", f"{kind}-t{n}.backup.json")
    check(f"backup exists {kind}", os.path.exists(b) and open(b, "rb").read() == prev_bytes[n - 1])
    check(f"rollback record file {kind}", os.path.exists(os.path.join(tmp, "backup", f"{kind}-t{n}.rollback.json")))
    check(f"diet/{kind}-t{n} in data", f"{kind}-t{n}" in final["diet"])

T = final["tasks"]
live = lambda t: not t.get("archived") and not t.get("done") and not t.get("bucket")
s2 = [i for i, t in T.items() if live(t) and t.get("sprint") == 2]
check("Sprint 2 visible tasks under 25", len(s2) < 25, len(s2))
bad = [i for i, t in T.items() if live(t) and t.get("sprint") == 2 and (t.get("parent") in ("v4-p-hasm", "v4-p-javelin"))]
check("HASM and Javelin outside Sprint 2", not bad and T["v4-p-hasm"]["sprint"] is None and T["v4-p-javelin"]["sprint"] is None, bad)
check("HASM and Javelin milestones outside Sprint 2",
      all(T[i]["sprint"] is None for i in T if i.startswith(("m-hasm", "m-jav"))))
moved = [i for i, t in T.items() if t.get("cat") in ("brand", "linkedin", "outreach") and
         (t.get("parent") in ("v4-p-hasm", "v4-p-javelin", "v4-p-mugassam", "b-realestate") and i != "m-hasm-04")]
base_t = load(REF)["tasks"]
flipped = [i for i, t in base_t.items() if t.get("cat") in ("portfolio", "client") and T[i].get("cat") != t["cat"]]
check("no portfolio/HASM item moved to brand", not moved and not flipped and
      all(T[f"m-hasm-0{k}"]["cat"] == "portfolio" for k in (1, 2, 3)) and
      T["m-hasm-04"]["cat"] == "outreach" and not any(t.get("cat") == "brand" and base_t.get(i, {}).get("cat") != "brand" for i, t in T.items()), (moved, flipped))

load_by = {}
blocks = {}
for i, t in T.items():
    if live(t) and t.get("cat") in ("portfolio", "client") and t.get("date"):
        load_by[t["date"]] = load_by.get(t["date"], 0) + t["mins"]
        key = (t["date"], t.get("block"))
        blocks.setdefault(key, []).append(t)
check("daily design load never over 400 min", all(v <= 400 for v in load_by.values()), load_by)
check("every dated milestone has a block", all(t.get("block") for i, t in T.items() if i.startswith("m-") and t.get("date")))
check("no deep block mixes buckets or exceeds 240",
      all(len({x["parent"] for x in v}) == 1 and sum(x["mins"] for x in v) <= 240 for v in blocks.values()))
check("shallow work never in B1 or B2", all(t.get("block") == 3 for i, t in T.items()
      if i.startswith("m-") and t.get("date") and t["cat"] not in ("portfolio", "client")))
check("Sprint 2 recut dates", final["sprints"]["s2"]["start"] == "2026-11-14" and final["sprints"]["s5"]["end"] == "2027-01-03"
      and final["sprints"]["s6"]["archived"] and "sprintCfg" in final["settings"])
check("nothing deleted", all(i in T for i in base_t))

# stale check stops
stale = load(REF); stale["tasks"]["v4-p-hasm-01"]["done"] = True
sp = os.path.join(tmp, "stale.json"); save(sp, stale)
run("apply_d1.py", sp, os.path.join(tmp, "stale_out.json"), "--backup-dir", os.path.join(tmp, "b2"), expect=2)
check("stale export stops the run", not os.path.exists(os.path.join(tmp, "stale_out.json")))

# rollback: one command, byte for byte
rb = os.path.join(tmp, "rolled.json")
print(run("rollback_diet.py", cur, rb, "--all"))
check("rollback --all restores byte for byte", open(rb, "rb").read() == base_bytes)
# stepwise rollback equals each step input
c = cur
for n in range(4, 0, -1):
    kind = steps[n - 1][1]
    o = os.path.join(tmp, f"rb{n}.json")
    run("rollback_diet.py", c, o, f"{kind}-t{n}")
    check(f"rollback {kind} restores its input", open(o, "rb").read() == prev_bytes[n - 1])
    c = o
check("rollback leaves no diet collection", "diet" not in load(rb))
print("\nALL PASS" if ok else "\nFAILURES")
sys.exit(0 if ok else 1)
