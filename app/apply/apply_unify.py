#!/usr/bin/env python3
"""UNIFY (14 Nov): Steps and Subtasks are one thing. Scripts only, never run on live without approval.
  apply_unify.py IN.json OUT.json [--baseline PATH] [--force]
1. Every task that carries a checklist `check` (list or object of {id,t,done,o}) gets real child subtask docs:
   {parent: <task id>, sub: true, title: t, done: kept, order: kept, cat/date/sprint inherited from the parent,
   archived/cut inherited so a hidden task stays hidden}, NO `mins`. The `check` field is then removed from the task.
   A subtask is never a task: the app ignores docs with sub:true in counts (Review, waterfall, buckets, Sprint).
2. Existing subtask docs made by the old "Add a subtask" box get `sub:true` and lose an auto-defaulted estimate.
   How they are detected (all must hold): the doc has a parent that is not a bucket; it is not archived; it has no
   `from`, `mergedFrom`, `replacedBy` (so it is not a plan or diet task); its `order` is a millisecond timestamp (>= 1e12),
   which the sheet box writes (Date.now()); and it has no `date` and no `sprint` (the box wrote neither, so a dated plan step
   with a timestamp-like order is never touched). An estimate is cleared
   only when it is exactly 60, the app default (estMin falls back to 60 when nothing is set); any other number was typed
   by him and stays. Parents keep their `mins` untouched (capacity uses the task's own estimate).
Rollback record diet/<runId> as in every apply script; the removed fields remember their position, so rollback_diet.py
restores the file byte-for-byte. Drift: tasks in the baseline (default liveapply/final.json) must still match
(done, date, title, check) or the run stops with exit 2 (--force skips)."""
import copy, json, os, sys
from applylib import parser, Run, load

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_BASE = os.path.join(HERE, "..", "..", "liveapply", "final.json")


def items_of(check):
    """{id,t,done,o} items from a list or an object, in display order (same rules as the app's ckList)."""
    if not check:
        return []
    pairs = [((v or {}).get("id") or f"i{i}", v) for i, v in enumerate(check)] if isinstance(check, list) else list(check.items())
    out = []
    for i, (k, v) in enumerate(pairs):
        if v and v.get("t") is not None:
            out.append({"id": k, "t": str(v["t"]), "done": bool(v.get("done")), "o": v.get("o", i), "i": i})
    return sorted(out, key=lambda x: (x["o"] if isinstance(x["o"], (int, float)) else x["i"], x["i"]))


def remove_field(r, coll, id_, k):
    doc = r.coll(coll)[id_]
    pos = list(doc).index(k)
    r.patch(coll, id_, {k: None})
    r.patched[coll][id_][k]["pos"] = pos
    del doc[k]


def is_sheet_subtask(t, T):
    p = T.get(t.get("parent"))
    return (bool(t.get("parent")) and p is not None and not p.get("bucket") and not t.get("archived") and not t.get("bucket")
            and not t.get("sub") and not t.get("date") and t.get("sprint") is None and not t.get("from") and not t.get("mergedFrom") and not t.get("replacedBy")
            and isinstance(t.get("order"), (int, float)) and t["order"] >= 1e12)


def main():
    ap = parser("Unify steps and subtasks")
    ap.add_argument("--baseline", default=DEFAULT_BASE, help="drift reference (default liveapply/final.json)")
    a = ap.parse_args()
    r = Run("unify", a)
    T = r.coll("tasks")
    if not a.force and os.path.exists(a.baseline):
        base = load(a.baseline)
        bad = []
        for i, b in base.get("tasks", {}).items():
            if not b.get("check"):
                continue
            cur = T.get(i)
            if cur is None:
                bad.append(f"{i}: missing")
                continue
            for f in ("done", "date", "title", "check"):
                if cur.get(f) != b.get(f):
                    bad.append(f"{i}.{f}: live {cur.get(f)!r} vs baseline {b.get(f)!r}")
        if bad:
            print("STOP: live data differs from the baseline. Re-export live and re-run (or --force).")
            for x in bad[:20]:
                print("  " + x)
            raise SystemExit(2)
    out = []
    n_sub = n_chk = 0
    taken = set(T)
    for tid in list(T):
        t = T[tid]
        L = items_of(t.get("check"))
        if "check" in t and not L and not t.get("check"):
            remove_field(r, "tasks", tid, "check"); n_chk += 1
            continue
        if not L:
            continue
        for n, it in enumerate(L):
            sid = it["id"] if it["id"] not in taken else f"{tid}-c{n + 1}"
            if sid in taken:
                sid = f"{tid}-sub-{n + 1}"
            taken.add(sid)
            doc = {"parent": tid, "sub": True, "title": it["t"], "cat": t.get("cat"), "date": t.get("date"),
                   "sprint": t.get("sprint"), "done": it["done"], "order": n}
            if t.get("archived"):
                doc["archived"] = True
            if t.get("cut"):
                doc["cut"] = True
            r.create("tasks", sid, doc)
            n_sub += 1
        remove_field(r, "tasks", tid, "check"); n_chk += 1
    cleared = flagged = 0
    for tid in list(T):
        t = T[tid]
        if tid in r.created.get("tasks", []) or not is_sheet_subtask(t, T):
            continue
        p = T[t["parent"]]
        r.patch("tasks", tid, {"sub": True}); flagged += 1
        if t.get("mins") == 60:
            remove_field(r, "tasks", tid, "mins"); cleared += 1
        fill = {}
        if not t.get("date") and p.get("date"):
            fill["date"] = p["date"]
        if t.get("sprint") is None and p.get("sprint") is not None:
            fill["sprint"] = p["sprint"]
        if fill:
            r.patch("tasks", tid, fill)
    out.append(f"checklists converted: {n_chk} tasks -> {n_sub} subtask docs (no estimate); `check` removed")
    out.append(f"old sheet subtasks flagged sub:true: {flagged}; auto-default estimate (60) cleared on {cleared}")
    r.finish(out)


if __name__ == "__main__":
    main()
