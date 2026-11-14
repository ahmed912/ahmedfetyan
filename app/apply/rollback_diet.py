#!/usr/bin/env python3
"""Roll back one or more apply runs. Usage:
  rollback_diet.py IN.json OUT.json --all            (newest run first)
  rollback_diet.py IN.json OUT.json <runId> [<runId>...]
Restores old field values, deletes created docs, removes the diet/<runId> record.
Stops if a patched field was edited after the run (use --force to override)."""
import argparse, sys
from applylib import load, save, ABSENT, REC

p = argparse.ArgumentParser()
p.add_argument("input"); p.add_argument("output")
p.add_argument("runs", nargs="*"); p.add_argument("--all", action="store_true")
p.add_argument("--force", action="store_true")
a = p.parse_args()
d = load(a.input)
recs = d.get(REC, {})
ids = sorted(recs, key=lambda i: recs[i].get("seq", 0), reverse=True) if a.all else a.runs
if not ids:
    raise SystemExit("nothing to roll back")
newest = sorted(recs, key=lambda i: recs[i].get("seq", 0), reverse=True)
for rid in ids:
    if rid not in recs:
        raise SystemExit(f"STOP: no record diet/{rid}")
    later = [r for r in newest if recs[r]["seq"] > recs[rid]["seq"] and r not in ids]
    if later and not a.force:
        raise SystemExit(f"STOP: roll back newer runs first: {later}")
for rid in ids:
    r = recs[rid]
    for coll, docs in r["patched"].items():
        for i, fields in docs.items():
            doc = d[coll].get(i)
            if doc is None:
                continue
            for k, v in fields.items():
                if not a.force and doc.get(k) != v["new"]:
                    raise SystemExit(f"STOP: {coll}/{i}.{k} was edited after {rid}; use --force")
    for coll, docs in r["patched"].items():
        for i, fields in docs.items():
            doc = d[coll].get(i)
            if doc is None:
                continue
            for k, v in fields.items():
                if v["old"] == ABSENT:
                    doc.pop(k, None)
                elif "pos" in v and k not in doc:
                    # a field the run removed: put it back at its old place so the file is byte-for-byte equal
                    items = list(doc.items()); items.insert(v["pos"], (k, v["old"])); doc.clear(); doc.update(items)
                else:
                    doc[k] = v["old"]
    for coll, cids in r["created"].items():
        for i in cids:
            d.get(coll, {}).pop(i, None)
        if coll in d and not d[coll] and coll != REC:
            del d[coll]
    del recs[rid]
    print(f"rolled back {rid}")
if not recs:
    d.pop(REC, None)
save(a.output, d)
print(f"output: {a.output}")
