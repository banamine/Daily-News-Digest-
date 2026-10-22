"""Offline tests for the Mastodon TV summary handler. Run: python -I tests/test_tv_summary.py"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import daily_news as d

def check(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: check.failed = True
check.failed = False

CUT = ("SUMMARY: A US citizen is released from Russia. A major internet security flaw disrupts websites worldwide; "
       "DHS gets approval t..")
t = d.tidy_truncated_post(CUT)
check("'..' cut backs up to last complete sentence", t == "SUMMARY: A US citizen is released from Russia.")
check("cut text not left mid-word", "approval t" not in t)
check("complete post untouched", d.tidy_truncated_post("One. Two.") == "One. Two.")
check("no marker, no punctuation -> trimmed + ellipsis", d.tidy_truncated_post("Alpha beta gamma delta") == "Alpha beta gamma…")
check("unicode ellipsis cut handled", not d.tidy_truncated_post("Done early. And then half a wor…").endswith("wor…"))
check("empty -> empty", d.tidy_truncated_post("") == "")

RSS = """<rss><channel><title>TV Third Eye</title><item><link>https://mastodon.archive.org/@tv/1</link>
<pubDate>Wed, 21 Oct 2026 22:03:05 +0000</pubDate>
<description>&lt;p&gt;SUMMARY: Trump&amp;rsquo;s approval fell. Other news followed.&lt;/p&gt;</description></item>
<item><link>https://mastodon.archive.org/@tv/0</link><pubDate>Wed, 21 Oct 2026 21:03:05 +0000</pubDate><description>&lt;p&gt;older&lt;/p&gt;</description></item></channel></rss>"""
d.http_get_text = lambda url, timeout=10: RSS
s = d.fetch_tv_summary()
check("one story only (newest)", len(s) == 1 and s[0]["url"].endswith("/@tv/1"))
check("title-less item gets a label title", s and s[0]["title"].startswith("TV news hourly summary") and "22:03 UTC" in s[0]["title"])
check("SUMMARY: prefix and markup stripped", s and s[0]["summary"] == "Trump’s approval fell. Other news followed.")
check("no stock image", s and s[0]["imageUrl"] == "")
check("source labelled", s and "Internet Archive TV News" in s[0]["feed"])
d.http_get_text = lambda url, timeout=10: ""
check("feed down -> empty list, no crash", d.fetch_tv_summary() == [])
check("other sources still get stock fallback", d.normalize_story(title="x", link="https://a.test", summary="y", source_name="s")["imageUrl"].startswith("https://images.unsplash.com"))
sys.exit(1 if check.failed else 0)
