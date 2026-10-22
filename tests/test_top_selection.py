"""Offline tests for Top-8 selection. Run: python -I tests/test_top_selection.py"""
import sys, datetime, email.utils
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import daily_news as d

NOW = datetime.datetime(2026, 10, 21, 22, 0, tzinfo=datetime.timezone.utc)
def check(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: check.failed = True
check.failed = False

def story(feed, i, hours_old=1):
    when = NOW - datetime.timedelta(hours=hours_old)
    return {"id": f"{feed}{i}", "feed": feed, "published": email.utils.format_datetime(when)}
TV = d.TV_SUMMARY_FEED["name"]
pool = [story(f, i) for f in "ABCD" for i in range(3)] + [story(TV, 0)]

top = d.select_top_stories(pool, now=NOW)
counts = {}
for s in top: counts[s["feed"]] = counts.get(s["feed"], 0) + 1
check("8 cards", len(top) == 8)
check("TV roundup gets a slot though last in pool", any(s["feed"] == TV for s in top))
check("no feed above cap of 2", max(counts.values()) <= 2)
check("original order kept", [s["id"] for s in top] == [s["id"] for s in pool if s in top])

many = [story(f, i) for f in "ABCDEF" for i in range(2)]
t2 = d.select_top_stories(many + [story(TV, 0, hours_old=60)], now=NOW)
check("stale (60h) TV story gets no guaranteed slot", all(s["feed"] != TV for s in t2))
t2b = d.select_top_stories(many + [story(TV, 0, hours_old=30)], now=NOW)
check("30h-old TV story still guaranteed", any(s["feed"] == TV for s in t2b))

wire = [story("A", i) for i in range(5)] + [story("Reuters Top News", 0)] + [story("B", i) for i in range(3)]
t3 = d.select_top_stories(wire, now=NOW)
check("Reuters gets the diversity slot when no fresh TV story", any(s["feed"] == "Reuters Top News" for s in t3))

one = [story("A", i) for i in range(10)]
t4 = d.select_top_stories(one, now=NOW)
check("single-feed pool tops up to 8 instead of showing 2", len(t4) == 8)
check("empty pool -> empty", d.select_top_stories([], now=NOW) == [])
four = [story(f, i) for f in "ABCD" for i in range(2)]
check("undated roundup story is not guaranteed", all(s["feed"] != TV for s in d.select_top_stories(four + [{"id": "x", "feed": TV, "published": "Recently"}], now=NOW)))
sys.exit(1 if check.failed else 0)
