#!/usr/bin/env python3
"""Tests for apply_unify.py: python3 test_unify.py [final.json] [mock_final.json]
Runs on copies in a temp dir. Asserts: backup, rollback byte-for-byte, no subtask counted (Sprint counts unchanged),
parents' estimates unchanged, no estimate on new subtasks, auto-default detection, drift stop (exit 2), idempotent."""
import copy, json, os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
FINAL = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "liveapply", "final.json")
MOCK = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "plan", "mock_final.json")
sys.path.insert(0, HERE)
from applylib import canon, load, save


def run(*args, ok=(0,)):
    p = subprocess.run([sys.executable, *args], capture_output=True, text=True, cwd=HERE)
    assert p.returncode in ok, (args, p.returncode, p.stdout, p.stderr)
    return p


def leaf_counts(d):
    T = d["tasks"]
    pids = {t["parent"] for t in T.values() if t.get("parent") and not t.get("cut") and not t.get("archived") and not t.get("sub")}
    leaf = {i for i, t in T.items() if not t.get("bucket") and not t.get("sub") and i not in pids}
    c = {}
    for i in leaf:
        t = T[i]
        if t.get("archived") or t.get("cut"):
            continue
        c[t.get("sprint")] = c.get(t.get("sprint"), 0) + 1
    return c


def case(name, src, with_synth):
    d = load(src)
    if with_synth:
        T = d["tasks"]
        par = next(i for i, t in T.items() if not t.get("bucket") and not t.get("archived") and t.get("date"))
        T["syn-def"] = {"title": "first pass", "parent": par, "done": False, "order": 1794485584000, "cat": "portfolio"}
        T["syn-def"]["mins"] = 60            # auto-defaulted estimate: must be cleared
        T["syn-typed"] = {"title": "typed time", "parent": par, "done": False, "order": 1794485585000, "mins": 45}   # typed: stays
        T["syn-none"] = {"title": "no time", "parent": par, "done": True, "order": 1794485586000}
        T["syn-plan60"] = {"title": "plan step", "parent": par, "done": False, "order": 3, "mins": 60, "from": "s1-1"}  # plan doc: untouched
    ref = copy.deepcopy(d)                      # what the counts must stay: the same data with the old sheet subtasks already flagged
    for i in ("syn-def", "syn-typed", "syn-none"):
        if i in ref["tasks"]:
            ref["tasks"][i]["sub"] = True
    sp0 = leaf_counts(ref)
    tmp = tempfile.mkdtemp(prefix="unify-")
    inp = os.path.join(tmp, "in.json"); out = os.path.join(tmp, "out.json"); base = os.path.join(tmp, "base.json")
    save(inp, d); save(base, d)
    before_bytes = open(inp, "rb").read()
    n_check = sum(1 for t in d["tasks"].values() if t.get("check"))
    n_items = sum(len(t["check"]) for t in d["tasks"].values() if t.get("check"))
    parents_mins = {i: t.get("mins") for i, t in d["tasks"].items() if not t.get("sub")}
    p = run("apply_unify.py", inp, out, "--baseline", base, "--run-id", "T1")
    o = load(out)
    assert os.path.exists(os.path.join(tmp, "backup", "unify-T1.backup.json")), "backup"
    assert open(os.path.join(tmp, "backup", "unify-T1.backup.json"), "rb").read() == before_bytes, "backup differs"
    assert "unify-T1" in o["diet"], "rollback record"
    assert not any(t.get("check") for t in o["tasks"].values()), "check left"
    subs = [t for t in o["tasks"].values() if t.get("sub")]
    created = o["diet"]["unify-T1"]["created"].get("tasks", [])
    assert len(created) == n_items, (len(created), n_items)
    assert all(o["tasks"][i].get("sub") is True and "mins" not in o["tasks"][i] and o["tasks"][i]["parent"] in o["tasks"] for i in created), "subtask docs"
    for i in created:                                    # order, done kept, date and sprint inherited
        s = o["tasks"][i]; par = d["tasks"][s["parent"]]
        assert s["date"] == par.get("date") and s["sprint"] == par.get("sprint"), i
    for tid, t in d["tasks"].items():
        if t.get("check"):
            kids = sorted((o["tasks"][i] for i in created if o["tasks"][i]["parent"] == tid), key=lambda x: x["order"])
            exp = sorted(t["check"], key=lambda x: x.get("o", 0)) if isinstance(t["check"], list) else []
            assert [k["title"] for k in kids] == [x["t"] for x in exp], tid
            assert [k["done"] for k in kids] == [bool(x.get("done")) for x in exp], tid
    assert leaf_counts(o) == sp0, ("sprint counts changed", sp0, leaf_counts(o))
    for i, m in parents_mins.items():
        if with_synth and i in ("syn-def",):
            continue
        assert o["tasks"][i].get("mins") == m, ("estimate changed", i)
    if with_synth:
        assert "mins" not in o["tasks"]["syn-def"] and o["tasks"]["syn-def"]["sub"] is True
        assert o["tasks"]["syn-typed"]["mins"] == 45 and o["tasks"]["syn-typed"]["sub"] is True
        assert o["tasks"]["syn-none"]["sub"] is True
        assert o["tasks"]["syn-plan60"]["mins"] == 60 and not o["tasks"]["syn-plan60"].get("sub")
    # rollback byte-for-byte
    rb = os.path.join(tmp, "rb.json")
    run("rollback_diet.py", out, rb, "unify-T1")      # newest run only: earlier diet/replan runs in the file stay
    assert open(rb, "rb").read() == before_bytes, "rollback is not byte-for-byte"
    if not d.get("diet"):
        run("rollback_diet.py", out, rb, "--all")
        assert open(rb, "rb").read() == before_bytes, "rollback --all"
    # idempotent: a second run changes nothing
    out2 = os.path.join(tmp, "out2.json")
    run("apply_unify.py", out, out2, "--baseline", base, "--force", "--run-id", "T2")
    o2 = load(out2)
    assert {k: v for k, v in o2["tasks"].items()} == o["tasks"], "second run changed tasks"
    # drift: a task with a checklist was edited live -> exit 2
    if n_check:
        d2 = copy.deepcopy(d)
        tid = next(i for i, t in d2["tasks"].items() if t.get("check"))
        d2["tasks"][tid]["title"] += " edited"
        drift = os.path.join(tmp, "drift.json"); save(drift, d2)
        pr = run("apply_unify.py", drift, os.path.join(tmp, "x.json"), "--baseline", base, ok=(2,))
        assert "STOP" in pr.stdout
    print(f"PASS {name}: {n_check} checklists -> {len(created)} subtask docs; sprint counts {dict(sp0)} unchanged; parents' estimates unchanged; rollback byte-for-byte")


case("final.json (live copy)", FINAL, False)
case("final.json + synthetic old sheet subtasks", FINAL, True)
case("mock_final.json (no checklists)", MOCK, False)
case("mock_final.json + synthetic old sheet subtasks", MOCK, True)
print("ALL PASS")
