"""Offline tests for summary cleaning. Run: python -I tests/test_clean_text.py"""
import sys, json, re
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import daily_news as d

LONG = "CBM" + "x" * 300
GN = f'<a href="https://news.google.com/rss/articles/{LONG}?oc=5" target="_blank">EXCLUSIVE: Order to limit Starshield - Reuters</a>&nbsp;&nbsp;<font color="#6f6f6f">Reuters</font>'

def check(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: check.failed = True
check.failed = False

check("tags removed, no URL left", "<" not in d.clean_text(GN) and "news.google.com" not in d.clean_text(GN))
check("entities decoded", d.clean_text("Tom &amp; Jerry&nbsp;&quot;x&quot;") == 'Tom & Jerry "x"')
check("plain text untouched", d.clean_text("  a   b\n c ") == "a b c")
check("title+publisher summary -> empty", d.summary_or_empty(GN, "EXCLUSIVE: Order to limit Starshield - Reuters") == "")
check("bare URL summary -> empty", d.summary_or_empty("https://example.com/" + "a" * 400, "T") == "")
check("real summary kept", d.summary_or_empty("<p>The former teacher was freed.</p>", "Hubbard freed") == "The former teacher was freed.")
n = d.normalize_story(title="EXCLUSIVE: Order to limit Starshield - Reuters", link="https://x.test/a", summary=GN, source_name="Reuters Top News")
check("normalize_story: summary falls back to title, no markup", n["summary"] == n["title"] and "<" not in n["summary"])
check("cut-off tag and WordPress footer removed", d.clean_text("Arrests rise. The post Big Story appeared first on <a href=\"https://x\">Site</a>.") == "Arrests rise." and d.clean_text("abc <a hre") == "abc")
data = Path(__file__).resolve().parent.parent / "data/current/data.json"
if data.exists():
    arts = json.load(open(data, encoding="utf-8"))["rss_feeds_articles"]
    bad = [a for a in arts if re.search(r"<[a-z/]", a["summary"], re.I)]
    cleaned = [d.clean_text(a["summary"]) for a in arts]
    check(f"committed data: {len(bad)} markup summaries all clean after clean_text", all("<" not in c for c in cleaned))
sys.exit(1 if check.failed else 0)
