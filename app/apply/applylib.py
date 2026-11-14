"""Shared helpers for the round 4 data apply scripts.
Data shape: {collection: {id: doc}}. All writes are canonical JSON, so a
backup and a rolled-back file are byte-for-byte identical."""
import argparse, copy, datetime, json, os, sys

ABSENT = {"__absent__": True}
REC = "diet"


def canon(data):
    return json.dumps(data, indent=1, ensure_ascii=False) + "\n"


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save(path, data):
    with open(path, "w", encoding="utf-8") as f:
        f.write(canon(data))


def parser(desc):
    p = argparse.ArgumentParser(description=desc)
    p.add_argument("input", help="JSON export of the live docs")
    p.add_argument("output", help="patched JSON to write (never the live data)")
    p.add_argument("--ref", default=os.path.join(os.path.dirname(__file__), "..", "mock_final.json"),
                   help="reference copy the proposals were written on (stale check)")
    p.add_argument("--force", action="store_true", help="skip the stale check")
    p.add_argument("--run-id", help="override the run id suffix (default: timestamp)")
    p.add_argument("--backup-dir", help="default: <output dir>/backup")
    return p


class Run:
    def __init__(self, kind, args):
        self.kind = kind
        ts = args.run_id or datetime.datetime.now().strftime("%Y%m%dT%H%M%S")
        self.id = f"{kind}-{ts}"
        self.args = args
        self.data = load(args.input)
        self.ref = load(args.ref) if os.path.exists(args.ref) else None
        self.created = {}   # coll -> [ids]
        self.patched = {}   # coll -> id -> field -> {old,new}
        self.log = []
        bdir = args.backup_dir or os.path.join(os.path.dirname(os.path.abspath(args.output)), "backup")
        os.makedirs(bdir, exist_ok=True)
        self.bdir = bdir
        self.backup_path = os.path.join(bdir, f"{self.id}.backup.json")
        save(self.backup_path, self.data)  # backup first, before any change

    def coll(self, name):
        return self.data.setdefault(name, {})

    def patch(self, coll, id_, fields):
        doc = self.coll(coll)[id_]
        rec = self.patched.setdefault(coll, {}).setdefault(id_, {})
        for k, v in fields.items():
            old = copy.deepcopy(doc[k]) if k in doc else ABSENT
            if k not in rec:
                rec[k] = {"old": old, "new": None}
            doc[k] = v
            rec[k]["new"] = copy.deepcopy(v)

    def create(self, coll, id_, doc):
        c = self.coll(coll)
        if id_ in c:
            raise SystemExit(f"STOP: {coll}/{id_} already exists")
        c[id_] = doc
        self.created.setdefault(coll, []).append(id_)

    def prior_ids(self):
        ids = set()
        for r in self.data.get(REC, {}).values():
            for c in r.get("patched", {}).values():
                ids.update(c)
            for c in r.get("created", {}).values():
                ids.update(c)
        return ids

    def stale_check(self, coll, ids, fields=("done", "date", "title"), required=True):
        if self.args.force or self.ref is None:
            return
        touched = self.prior_ids()
        bad = []
        for i in ids:
            cur = self.data.get(coll, {}).get(i)
            old = self.ref.get(coll, {}).get(i)
            if cur is None or old is None:
                if required:
                    bad.append(f"{i}: missing")
                continue
            if i in touched:
                continue
            for f in fields:
                if cur.get(f) != old.get(f):
                    bad.append(f"{i}.{f}: live {cur.get(f)!r} vs copy {old.get(f)!r}")
        if bad:
            print("STOP: live data differs from the proposal copy. Re-run the proposal on a fresh export.")
            for b in bad[:20]:
                print("  " + b)
            raise SystemExit(2)

    def finish(self, summary_lines):
        record = {"kind": self.kind, "runId": self.id, "seq": 1 + max(
            [r.get("seq", 0) for r in self.data.get(REC, {}).values()] or [0]),
            "created": self.created, "patched": self.patched}
        self.coll(REC)[self.id] = record
        save(self.args.output, self.data)
        rb = os.path.join(self.bdir, f"{self.id}.rollback.json")
        save(rb, record)
        n_p = sum(len(v) for v in self.patched.values())
        n_f = sum(len(f) for v in self.patched.values() for f in v.values())
        n_c = sum(len(v) for v in self.created.values())
        print(f"== {self.id} ==")
        print(f"created {n_c} docs, patched {n_p} docs ({n_f} fields)")
        for l in summary_lines:
            print("  " + l)
        print(f"backup:   {self.backup_path}")
        print(f"rollback: diet/{self.id} (also {rb})")
        print(f"output:   {self.args.output}")


def daymin_by_date(tasks, cats=("portfolio", "client")):
    out = {}
    for t in tasks.values():
        if t.get("archived") or t.get("done") or t.get("bucket") or not t.get("date"):
            continue
        if t.get("cat") in cats:
            out[t["date"]] = out.get(t["date"], 0) + (t.get("mins") or 0)
    return out
