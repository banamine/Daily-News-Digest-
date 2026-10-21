"""Offline tests for the hourly refresh. Run: python -I tests/test_refresh_feed.py"""
import sys, json, tempfile
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import daily_news as d

def art(i, url=None, title=None):
    return {"id": f"id{i}", "title": title or f"Story {i}", "headline": title or f"Story {i}",
            "url": url or f"https://example.test/{i}", "link": url or f"https://example.test/{i}",
            "summary": "s", "excerpt": "s"}

def check(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: check.failed = True
check.failed = False

tmp = Path(tempfile.mkdtemp())
d.DATA_CURRENT_DIR = tmp / "data/current"; d.CURRENT_DIR = tmp / "output/current"
state = {"scraped": [], "rss": [art(1), art(2)]}
d.fetch_all_stories = lambda: {**state, "combined": (state["scraped"] + state["rss"])[:d.MAX_STORIES]}
data_path = d.DATA_CURRENT_DIR / "data.json"

check("fallback generator publishes nothing", d._generate_fallback_alexjones_stories() == [])

r = d.refresh_feed()
check("first run writes both data.json files", r and data_path.exists() and (d.CURRENT_DIR / "data.json").exists())

saved = json.loads(data_path.read_text()); saved["raw_summary"] = "DAILY SUMMARY"; saved["image_prompt"] = "P"
data_path.write_text(json.dumps(saved))
mtime = data_path.stat().st_mtime_ns
check("same stories -> nothing written", d.refresh_feed() is None and data_path.stat().st_mtime_ns == mtime)

state["rss"] = [art(1), art(2), art(3)]
r = d.refresh_feed()
check("new story -> written, count updated", r and r["rss_articles_count"] == 3)
check("daily raw_summary and image_prompt preserved", r["raw_summary"] == "DAILY SUMMARY" and r["image_prompt"] == "P")

before = data_path.read_text()
state["rss"] = []; state["scraped"] = []
check("empty ingestion -> keeps existing file", d.refresh_feed() is None and data_path.read_text() == before)

state["rss"] = [art(1), art(9, url="https://www.alexjoneslive.com/story-1")]
r = d.refresh_feed()
check("fake fallback URL dropped", r and all("story-1" not in a["url"] for a in r["rss_feeds_articles"]) and r["rss_articles_count"] == 1)

# a change beyond the top MAX_STORIES still counts as new
state["rss"] = [art(i) for i in range(1, 21)]; d.refresh_feed()
state["rss"] = [art(i) for i in range(1, 21)] + [art(99)]
check("new story beyond the top 8 is detected", d.refresh_feed() is not None)
sys.exit(1 if check.failed else 0)
