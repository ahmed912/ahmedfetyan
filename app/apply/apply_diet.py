#!/usr/bin/env python3
"""Task diet (DIET.md) plus the round 4 `block` assignment. Run after apply_d1.py.
Creates 4 buckets + 35 milestones, patches Mugassam, archives replaced steps
(nothing deleted), sets `block` on every dated milestone by the chunk rules."""
import datetime
from applylib import parser, Run

SPRINT = 2          # sprint docs use integer n in the data (s2 -> 2)
BLOCK_MIN = 240     # one deep block = 4 h
BUFFER = {"2026-11-20", "2026-11-25", "2026-11-26", "2026-11-27"}
M, H, J = "v4-p-mugassam", "v4-p-hasm", "v4-p-javelin"

BUCKETS = {  # id: (title, cat, bStart, bEnd)
 "b-realestate": ("Real estate", "portfolio", "2026-11-17", "2026-12-10"),
 "b-learning": ("Learning", "learning", None, None),
 "b-linkedin": ("LinkedIn", "linkedin", None, None),
 "b-reviews": ("Reviews", "review", None, None),
}
BSTART = {H: "2026-11-03", M: "2026-11-14", "b-realestate": "2026-11-17"}
P = "v4-p-"
def rng(prefix, *nums):
    return [f"{prefix}{n:02d}" for n in nums]

# id, bucket, title, date(MM-DD or None), mins, cat, sprint, checklist, mergedFrom
MS = [
 ("m-mug-01", M, "Audit the original deck", "11-14", 150, "portfolio", SPRINT, "Gather the deck and company facts; Note what an investor would doubt; Mark up the 5 weakest slides", ["v4r-01", "v4r-02", "v4r-03"]),
 ("m-mug-02", M, "Write the brief", "11-15", 180, "portfolio", SPRINT, "Problem, audience, the ask; List 10 investor questions; Check numbers and claims", [P+"mugassam-01", "v4s-02", "v4r-04"]),
 ("m-mug-03", M, "Write the storyline", "11-16", 150, "portfolio", SPRINT, "Company story in one line; Headlines only", ["v4s-03", P+"mugassam-02"]),
 ("m-mug-04", M, "Choose the visual direction", "11-16", 180, "portfolio", SPRINT, "Collect references; 3 directions with AI; Pick one, set grid and type", [P+"mugassam-03", P+"mugassam-04"]),
 ("m-mug-05", M, "Design slides 1 to 3", "11-17", 180, "portfolio", SPRINT, "Slide 1; Slide 2; Slide 3", [P+"mugassam-05"]),
 ("m-mug-06", M, "Design slides 4 to 6", "11-18", 180, "portfolio", SPRINT, "Problem slide; Solution slide; Market slide; Export 3 before and after pairs", ["v4r-05", "v4s-06"]),
 ("m-mug-07", M, "Design slides 7 to 9", "11-18", 150, "portfolio", SPRINT, "Product; Traction; Business model", ["v4r-06"]),
 ("m-mug-08", M, "Design slides 10 to 12", "11-19", 150, "portfolio", SPRINT, "Competition; Team; Data slides", ["v4r-06"]),
 ("m-mug-09", M, "Design slides 13 to 15", "11-21", 150, "portfolio", SPRINT, "The ask; Use of funds; Closing slide; Export all 15", ["v4r-08"]),
 ("m-mug-10", M, "Write the case study", "11-22", 150, "portfolio", SPRINT, "Original problem; Storyline as headlines; Why each decision helps", ["v4r-09"]),
 ("m-re-01", "b-realestate", "Choose property and deck type", "11-17", 100, "portfolio", SPRINT, "Pick the property or developer; Sales or investor deck; Save 3 reference decks with notes", ["v4s-04", "v4s-05"]),
 ("m-re-02", "b-realestate", "Write brief and storyline", "11-21", 180, "portfolio", SPRINT, "Audience and the one decision; 15-slide scope; 15 headlines", ["v4r-07", "v4r-10"]),
 ("m-learn-01", "b-learning", "Finish StoryBrand", "11-14", 150, "learning", SPRINT, "Ch 10 and 11; Ch 12 and 13", rng(P+"storybrand-", 1, 2)),
 ("m-learn-02", "b-learning", "Write the brand script", "11-16", 125, "learning", SPRINT, "Brand script (SB7); One-liner and 5 pillars; Direct and transitional CTA", rng(P+"storybrand-", 3, 4, 5)),
 ("m-learn-03", "b-learning", "Read Show Your Work", "11-18", 180, "learning", SPRINT, "First half; Finish, write 3 notes", rng(P+"sywmts-", 1, 2)),
 ("m-learn-04", "b-learning", "Read Made to Stick 1 to 4", "11-21", 180, "learning", SPRINT, "Ch 1 and 2; Ch 3 and 4", rng(P+"sywmts-", 3, 4)),
 ("m-learn-05", "b-learning", "Finish Made to Stick", "11-23", 180, "learning", SPRINT, "Ch 5 and 6; Write the hook checklist", rng(P+"sywmts-", 5, 6)),
 ("m-learn-06", "b-learning", "Finish AI course Module 4", "11-24", 125, "learning", SPRINT, "Finish Module 4; One note on Mugassam", rng(P+"ai-m4-", 1, 2)),
 ("m-li-01", "b-linkedin", "Set up the LinkedIn profile", "11-18", 150, "linkedin", SPRINT, "Follow 10 designers, save 10 hooks; Follow 10 founders; Headline and About; Featured: HASM link and CTA", rng(P+"li-1-", 3, 6, 14, 15)),
 ("m-li-02", "b-linkedin", "Publish posts 1 to 4", "11-14", 150, "linkedin", SPRINT, "x Draft post 1; x Draft post 2; Sat: post 1 live; Sun: post 2 live; Draft post 3; Mon: post 3 live; Draft post 4 carousel; Tue: post 4 live", rng(P+"li-1-", 1, 2, 4, 5, 7, 8, 9, 10)),
 ("m-li-03", "b-linkedin", "Publish posts 5 to 8", "11-19", 180, "linkedin", SPRINT, "Draft post 5; Draft post 6; Wed: post 5 live; Thu: post 6 live; Draft post 7; Sat: post 7 live; Draft post 8; Sun: post 8 live", rng(P+"li-1-", 11, 12, 13, 16, 17) + rng(P+"li-2-", 1, 2, 3)),
 ("m-li-04", "b-linkedin", "Publish posts 9 to 11", "11-23", 180, "linkedin", SPRINT, "Draft post 9; Mon: post 9 live; Draft post 10 carousel; Tue: post 10 live; Draft post 11; Draft post 12; Wed: post 11 live; Draft post 13 for the bank", rng(P+"li-2-", *range(4, 12))),
 ("m-rev-00", "b-reviews", "Close Sprint 1", "11-13", 60, "review", None, "Fill Sprint 1 numbers; x Apply the new plan; Check Sprint 2 targets", rng(P+"review-s1-", 1, 2, 3)),
 ("m-rev-01", "b-reviews", "Weekly review", "11-20", 30, "review", SPRINT, "Shipped this week; Inquiries and source; Red signals", [P+"review-w1-01"]),
 ("m-rev-02", "b-reviews", "Review Sprint 2", "11-26", 60, "review", SPRINT, "Depth rule check; Fill Sprint 2 numbers; Plan Sprint 3", rng(P+"review-s2-", 1, 2, 3)),
 ("m-hasm-01", H, "Finish slides 5 to 7", "11-14", 150, "portfolio", None, "Slide 5; Slide 6; Slide 7; Export all 7", [P+"hasm-01"]),
 ("m-hasm-02", H, "Publish HASM on Behance", "11-15", 150, "portfolio", None, "Polish pass; Behance text and tags; Behance bio with contact; Publish", rng(P+"hasm-", 2, 3)),
 ("m-hasm-03", H, "Get testimonial, update Upwork", "11-16", 60, "portfolio", None, "Ask the client for 2 lines; Upwork profile line; HASM as first Upwork piece", rng(P+"hasm-", 4, 5)),
 ("m-hasm-04", H, "Send 3 studio applications", "11-17", 150, "outreach", None, "Application 1; Application 2; Application 3", rng(P+"apps-", 1, 2, 3)),
 ("m-jav-01", J, "Check status, set slide master", None, 200, "portfolio", None, "List what is left; Grid, type, colour, 4 layouts", [P+"javelin-01", "v4s-01"]),
 ("m-jav-02", J, "Write the storyline", None, 250, "portfolio", None, "One headline per slide", [P+"javelin-02"]),
 ("m-jav-03", J, "Design slides 1 to 10", None, 700, "portfolio", None, "Slides 1 to 5; Slides 6 to 10", rng(P+"javelin-", 3, 4)),
 ("m-jav-04", J, "Design 11 to 15, polish", None, 650, "portfolio", None, "Slides 11 to 15; Polish pass; Export", rng(P+"javelin-", 5, 6)),
 ("m-jav-05", J, "Write the case study", None, 300, "portfolio", None, "Problem; Storyline; Decisions", [P+"javelin-07"]),
 ("m-jav-06", J, "Publish on Behance", None, 350, "portfolio", None, "Behance text; Publish; Save 3 hero slides for the PDF", rng(P+"javelin-", 8, 9)),
]
REPLACED_PARENTS = {P+"storybrand": "b-learning", P+"sywmts": "b-learning", P+"ai-m4": "b-learning",
                    P+"li-1": "b-linkedin", P+"li-2": "b-linkedin", P+"review-s1": "b-reviews",
                    P+"review-w1": "b-reviews", P+"review-s2": "b-reviews", P+"apps": "m-hasm-04"}
DEEP_CATS = ("portfolio", "client")


def next_day(d):
    x = datetime.date.fromisoformat(d)
    while True:
        x += datetime.timedelta(days=1)
        s = x.isoformat()
        if x.weekday() != 4 and s not in BUFFER:   # Friday rest, buffer days
            return s


def assign_blocks(ms):
    """ms: {id: {date,mins,cat,parent}}. Returns (block map, moves list).
    Per day the larger design bucket takes B1, the other B2; a bucket larger
    than one block takes both and the other bucket moves to its next free block."""
    blocks, moves, orig = {}, [], {}
    deep = {i: m for i, m in ms.items() if m["date"] and m["cat"] in DEEP_CATS}
    for i, m in ms.items():
        if not m["date"]:
            continue
        if m["cat"] not in DEEP_CATS:
            blocks[i] = 3
    day = {}
    pending = sorted(deep, key=lambda i: (deep[i]["date"], i))
    state = {}   # date -> {block: bucket, used}
    for i in pending:
        day.setdefault(deep[i]["date"], []).append(i)
    d = min(day) if day else None
    while d:
        ids = day.get(d, [])
        tot = {}
        for i in ids:
            tot[deep[i]["parent"]] = tot.get(deep[i]["parent"], 0) + deep[i]["mins"]
        order = sorted(tot, key=lambda b: (-tot[b], BSTART.get(b, "9"), b))
        free = {1: BLOCK_MIN, 2: BLOCK_MIN}   # remaining minutes per block
        owner = {}
        deferred = []
        for b in order:
            for i in [x for x in ids if deep[x]["parent"] == b]:
                m = deep[i]
                placed = False
                for blk in (1, 2):
                    if owner.get(blk, b) == b and free[blk] >= m["mins"]:
                        owner[blk] = b; free[blk] -= m["mins"]; blocks[i] = blk; placed = True
                        break
                if not placed:
                    deferred.append(i)
        for i in deferred:
            nd = next_day(deep[i]["date"])
            orig.setdefault(i, deep[i]["date"])
            deep[i]["date"] = nd
            day.setdefault(nd, []).append(i)
        later = [x for x in day if x > d]
        d = min(later) if later else None
    moves = [(i, orig[i], deep[i]["date"]) for i in orig]
    return blocks, moves, {i: m["date"] for i, m in deep.items()}


a = parser("Task diet").parse_args()
r = Run("diet", a)
T = r.coll("tasks")
if "m-mug-01" in T:
    raise SystemExit("STOP: DIET already applied")
if not T.get(H, {}).get("bucket"):
    raise SystemExit("STOP: run apply_d1.py first")

old_ids = sorted({i for m in MS for i in m[8]} | set(REPLACED_PARENTS))
r.stale_check("tasks", old_ids + [M], fields=("done", "title"))
# date drift is checked only for steps D1 did not touch (stale_check skips patched ids)
r.stale_check("tasks", [i for i in old_ids if i not in T[M] and "javelin" not in i and i != "v4s-01"], fields=("date",))

# buckets
order = 0
for bid, (title, cat, bs, be) in BUCKETS.items():
    order += 1
    r.create("tasks", bid, dict(title=title, cat=cat, date=None, parent=None, bucket=True,
                                bState="active", bStart=bs, bEnd=be, sprint=None, done=False, order=order))
r.patch("tasks", M, dict(title="Mugassam", bucket=True, bState="active", bStart="2026-11-14",
                         bEnd="2026-12-02", sprint=None, date=None, days=None))

msd = {m[0]: dict(date=("2026-" + m[3]) if m[3] else None, mins=m[4], cat=m[5], parent=m[1]) for m in MS}
blocks, moves, newdates = assign_blocks(msd)
for k, v in newdates.items():
    msd[k]["date"] = v

created = 0
for n, (mid, bucket, title, _d, mins, cat, spr, chk, merged) in enumerate(MS, 1):
    items = []
    for k, t in enumerate([x.strip() for x in chk.split(";")], 1):
        done = t.startswith("x ")
        items.append({"id": f"{mid}-c{k}", "t": t[2:] if done else t, "done": done})
    doc = dict(parent=bucket, title=title, cat=cat, date=msd[mid]["date"], mins=mins,
               pri=1 if bucket in (M, H) else 2, sprint=spr, check=items, mergedFrom=merged,
               done=False, order=n)
    if mid in blocks:
        doc["block"] = blocks[mid]
        if cat not in DEEP_CATS and cat != "learning":
            doc["mode"] = "shallow"
    r.create("tasks", mid, doc)
    created += 1

# archive every merged step and the replaced parents (nothing deleted)
rep = {}
for m in MS:
    for i in m[8]:
        rep.setdefault(i, m[0])
for i, to in {**rep, **REPLACED_PARENTS}.items():
    r.patch("tasks", i, dict(archived=True, replacedBy=to, parkReason="diet"))

load = {}
for t in T.values():
    if not (t.get("archived") or t.get("done") or t.get("bucket")) and t.get("cat") in DEEP_CATS and t.get("date"):
        load[t["date"]] = load.get(t["date"], 0) + t["mins"]
s2 = [t for t in T.values() if t.get("sprint") == SPRINT and not t.get("archived") and not t.get("done") and not t.get("bucket")]
out = [f"buckets: {len(BUCKETS)} new, Mugassam renamed; milestones: {created}; archived steps/parents: {len(rep) + len(REPLACED_PARENTS)}",
       f"Sprint 2 visible milestones: {len(s2)}",
       "design load per day (min): " + ", ".join(f"{d[5:]}={v}" for d, v in sorted(load.items()))]
if moves:
    out.append("MOVES for the user (block conflicts):")
    out += [f"  {i} {T[i]['title']}: {a_[5:]} -> {b_[5:]}" for i, a_, b_ in moves]
else:
    out.append("no milestone moved")
r.finish(out)
