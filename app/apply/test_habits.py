#!/usr/bin/env python3
"""Tests for apply_habits.py: python3 test_habits.py [real_export.json]
Fixture built here. Asserts: backup bytes, rollback record, habits made, marks, rec removed, archive, monthly untouched,
presets, rollback byte-for-byte, idempotent, drift stop (exit 2) and --force. With an export path it only prints a summary."""
import copy, json, os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from applylib import load, save


def run(*args, ok=(0,)):
    p = subprocess.run([sys.executable, *args], capture_output=True, text=True, cwd=HERE)
    assert p.returncode in ok, (args, p.returncode, p.stdout, p.stderr)
    return p


def fixture():
    return {"habits": {"english": {"min": 5, "max": 6}, "h1": {"custom": True, "name": "Read", "min": 3, "max": 5}},
            "tasks": {"b1": {"title": "Health", "bucket": True, "order": 1},
                      "r0": {"title": "Comments", "date": "2026-11-07", "done": True, "doneAt": "2026-11-07", "rec": {"type": "daily"}, "recNext": "r1"},
                      "r1": {"title": "Comments", "date": "2026-11-08", "done": True, "doneAt": "2026-11-08", "rec": {"type": "daily"}, "recOf": "r0", "recNext": "r2"},
                      "r2": {"title": "Comments", "date": "2026-11-09", "done": False, "rec": {"type": "daily"}, "recOf": "r0", "parent": "b1"},
                      "w0": {"title": "Plan week", "date": "2026-11-09", "done": False, "rec": {"type": "weekly", "anchor": "2026-11-09"}},
                      "m0": {"title": "Rent", "date": "2026-11-09", "done": False, "rec": {"type": "monthly"}}},
            "logs": {"2026-11-07": {"date": "2026-11-07", "english": True}}}


def main():
    if len(sys.argv) > 1:
        tmp = tempfile.mkdtemp(prefix="habits-real-")
        p = run("apply_habits.py", sys.argv[1], os.path.join(tmp, "out.json"), "--force", "--run-id", "REAL")
        print(p.stdout)
        return
    d = fixture()
    tmp = tempfile.mkdtemp(prefix="habits-")
    inp, out, base = (os.path.join(tmp, n) for n in ("in.json", "out.json", "base.json"))
    save(inp, d); save(base, d)
    before = open(inp, "rb").read()
    p = run("apply_habits.py", inp, out, "--baseline", base, "--run-id", "T1")
    o = load(out)
    bk = os.path.join(tmp, "backup", "habits-T1.backup.json")
    assert os.path.exists(bk) and open(bk, "rb").read() == before, "backup"
    assert "habits-T1" in o["diet"], "rollback record"
    H, T, L = o["habits"], o["tasks"], o["logs"]
    assert H["hb-r0"]["rec"] == {"type": "daily"} and H["hb-r0"]["bucket"] == "b1" and H["hb-r0"]["from"] == "tasks:r0", H["hb-r0"]
    assert L["2026-11-07"]["hb-r0"] is True and L["2026-11-07"]["english"] is True
    assert L["2026-11-08"]["hb-r0"] is True
    assert not any("rec" in T[i] for i in ("r0", "r1", "r2", "w0")), "rec left"
    assert T["r2"]["archived"] and T["r2"]["cut"] and T["r2"]["habitOf"] == "hb-r0"
    assert H["hb-w0"]["rec"] == {"type": "weekly", "days": [1]}, H["hb-w0"]
    assert T["m0"]["rec"]["type"] == "monthly" and "left as repeating" in p.stdout
    assert H["english"]["rec"] == {"type": "weekdays"} and H["english"]["min"] == 5
    assert H["gym"]["rec"]["type"] == "xweek"
    assert H["h1"]["rec"] == {"type": "xweek", "n": 3}
    rb = os.path.join(tmp, "rb.json")
    run("rollback_diet.py", out, rb, "habits-T1")
    assert open(rb, "rb").read() == before, "rollback is not byte-for-byte"
    out2 = os.path.join(tmp, "out2.json")
    run("apply_habits.py", out, out2, "--baseline", base, "--force", "--run-id", "T2")
    o2 = load(out2)
    for k in ("tasks", "habits", "logs"):
        assert o2[k] == o[k], f"second run changed {k}"
    d2 = copy.deepcopy(d); d2["tasks"]["r2"]["title"] += " edited"
    drift = os.path.join(tmp, "drift.json"); save(drift, d2)
    pr = run("apply_habits.py", drift, os.path.join(tmp, "x.json"), "--baseline", base, ok=(2,))
    assert "STOP" in pr.stdout
    run("apply_habits.py", drift, os.path.join(tmp, "y.json"), "--baseline", base, "--force")
    print("OK")


main()
