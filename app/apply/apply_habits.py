#!/usr/bin/env python3
"""HABITS (15 Nov): habits and repeating tasks are one thing. Scripts only, never run on live without approval.
  apply_habits.py IN.json OUT.json [--baseline PATH] [--force]
1. Built-in habits get a preset when the doc has no `rec`: english -> weekdays, gym -> xweek n (from its `min`, 2..6, default 4),
   `tod:"any"`, order 0 and 1. A missing doc is created. `min`/`max` are never touched.
2. Custom habits (custom true, no `rec`) get a preset from `min`: n>=7 daily, n<=1 weekly on Saturday, else xweek n (2..6);
   `tod:"any"`, order 10+index in sorted id order.
3. Repeating chains (tasks with `rec`, grouped by root = recOf or own id) of type daily, weekdays or weekly become one habit
   `habits/hb-<root>` {name, custom, rec, tod:"any", bucket (nearest bucket ancestor), order 100+index, min/max, created, from:"tasks:<root>"}.
   Weekly uses the weekday of the anchor (or the root's date). biweekly and monthly chains are left as repeating tasks and listed.
4. Marks: every done copy writes `logs/<doneAt or date>.<hid>=true` (kept docs are patched, missing ones created).
5. Every copy loses `rec` and `recNext` (position remembered), gets `habitOf`; the undone live copy is also archived and cut.
6. Idempotent: every rule checks first, a second run on its own output changes nothing.
Rollback record diet/<runId> as in every apply script; rollback_diet.py restores the file byte-for-byte. Drift: tasks in the
baseline (default liveapply/final.json) that have `rec` must still match (done, date, title, rec) or the run stops with exit 2 (--force skips)."""
import os, sys, time
from applylib import parser, Run, load

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_BASE = os.path.join(HERE, "..", "..", "liveapply", "final.json")
ZONE = {"daily": (7, 7), "weekdays": (6, 6), "weekly": (1, 1)}


def remove_field(r, coll, id_, k):
    doc = r.coll(coll)[id_]
    pos = list(doc).index(k)
    r.patch(coll, id_, {k: None})
    r.patched[coll][id_][k]["pos"] = pos
    del doc[k]


def js_weekday(iso):
    import datetime
    y, m, d = (int(x) for x in iso.split("-"))
    return (datetime.date(y, m, d).weekday() + 1) % 7


def bucket_of(t, T):
    cur, g = t, 0
    while cur is not None and g < 6:
        if cur.get("bucket"):
            return None
        p = cur.get("parent")
        if not p:
            return None
        if (T.get(p) or {}).get("bucket"):
            return p
        cur = T.get(p)
        g += 1
    return None


def main():
    ap = parser("Habits and repeating tasks are one thing")
    ap.add_argument("--baseline", default=DEFAULT_BASE, help="drift reference (default liveapply/final.json)")
    a = ap.parse_args()
    r = Run("habits", a)
    H, T, LG = r.coll("habits"), r.coll("tasks"), r.coll("logs")
    if not a.force and os.path.exists(a.baseline):
        base = load(a.baseline)
        bad = []
        for i, b in base.get("tasks", {}).items():
            if not b.get("rec"):
                continue
            cur = T.get(i)
            if cur is None:
                bad.append(f"{i}: missing")
                continue
            for f in ("done", "date", "title", "rec"):
                if cur.get(f) != b.get(f):
                    bad.append(f"{i}.{f}: live {cur.get(f)!r} vs baseline {b.get(f)!r}")
        if bad:
            print("STOP: live data differs from the baseline. Re-export live and re-run (or --force).")
            for x in bad[:20]:
                print("  " + x)
            raise SystemExit(2)
    n_built = n_cust = n_chain = n_marks = n_arch = 0
    for hid, order in (("english", 0), ("gym", 1)):
        doc = H.get(hid)
        if hid == "english":
            rec = {"type": "weekdays"}
        else:
            n = int((doc or {}).get("min") or 4)
            rec = {"type": "xweek", "n": max(2, min(6, n))}
        if doc is not None and "rec" in doc:
            continue
        if doc is None:
            r.create("habits", hid, {"rec": rec, "tod": "any", "order": order})
        else:
            r.patch("habits", hid, {"rec": rec, "tod": "any", "order": order})
        n_built += 1
    for idx, hid in enumerate(sorted(H)):
        doc = H[hid]
        if not doc.get("custom") or "rec" in doc or hid in r.created.get("habits", []):
            continue
        n = int(doc.get("min") or 3)
        rec = {"type": "daily"} if n >= 7 else {"type": "weekly", "days": [6]} if n <= 1 else {"type": "xweek", "n": max(2, min(6, n))}
        r.patch("habits", hid, {"rec": rec, "tod": "any", "order": 10 + idx})
        n_cust += 1
    chains = {}
    for tid, t in T.items():
        if t.get("rec"):
            chains.setdefault(t.get("recOf") or tid, []).append(tid)
    left = []
    now = int(time.time() * 1000)
    for ci, root in enumerate(sorted(chains)):
        ids = sorted(chains[root], key=lambda i: (T[i].get("date") or "", i))
        newest = T[ids[-1]]
        ty = newest["rec"].get("type")
        if ty not in ZONE:
            left.append(f"{newest.get('title')} ({ty})")
            continue
        hid = "hb-" + root
        if hid not in H:
            undone = [i for i in ids if not T[i].get("done") and not T[i].get("archived")]
            title = T[(undone or ids)[-1]].get("title")
            if ty == "weekly":
                anchor = newest["rec"].get("anchor") or (T.get(root) or newest).get("date") or newest.get("date")
                rec = {"type": "weekly", "days": [js_weekday(anchor)]}
            else:
                rec = {"type": ty}
            bk = next((b for b in (bucket_of(T[i], T) for i in reversed(undone or ids)) if b), None)
            lo, hi = ZONE[ty]
            r.create("habits", hid, {"name": title, "custom": True, "rec": rec, "tod": "any", "bucket": bk, "order": 100 + ci,
                                     "min": lo, "max": hi, "created": now, "from": "tasks:" + root})
            n_chain += 1
        for i in ids:
            t = T[i]
            if t.get("done"):
                d = t.get("doneAt") or t.get("date")
                if d:
                    if d in LG:
                        if not LG[d].get(hid):
                            r.patch("logs", d, {hid: True}); n_marks += 1
                    else:
                        r.create("logs", d, {"date": d, hid: True}); n_marks += 1
            if "recNext" in t:      # recNext first: rollback restores in this order, so positions line up
                remove_field(r, "tasks", i, "recNext")
            if "rec" in t:
                remove_field(r, "tasks", i, "rec")
            if t.get("habitOf") != hid:
                r.patch("tasks", i, {"habitOf": hid})
            if not t.get("done") and not t.get("archived"):
                r.patch("tasks", i, {"archived": True, "cut": True}); n_arch += 1
    out = [f"built-in habits given a preset: {n_built}",
           f"custom habits given a preset: {n_cust}",
           f"chains converted: {n_chain}, marks written: {n_marks}, copies archived: {n_arch}",
           "left as repeating tasks: " + (", ".join(left) if left else "none")]
    r.finish(out)


if __name__ == "__main__":
    main()
