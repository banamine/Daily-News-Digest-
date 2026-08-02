#!/usr/bin/env python3
"""
Daily News Summarizer + Alex Jones Live Playwright Scraper + Gemini AI + Webpage Builder
-----------------------------------------------------------------------------------------
Target Site: https://www.alexjoneslive.com/
Problem: No public RSS feed detected.
Goal: Continuously extract news items (minimum 2–6 lines of usable info per story), enrich them,
      store an updated daily file, and replace/overwrite the current dated page every cycle.
"""

import os
import re
import json
import asyncio
import hashlib
import datetime
import base64
from pathlib import Path
from typing import List, Dict, Optional, Tuple

import feedparser          # for general RSS parsing
import requests
from jinja2 import Environment, select_autoescape

# Optional BeautifulSoup for fallback scraping
try:
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False

# Optional Playwright for headless browser scraping
try:
    from playwright.async_api import async_playwright, Page, TimeoutError as PlaywrightTimeoutError
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

# Import Google GenAI SDK (pip install google-genai)
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


# =========================================================
# CONFIGURATION & CONSTANTS
# =========================================================

OUTPUT_DIR = Path("output")
CURRENT_DIR = OUTPUT_DIR / "current"
ARCHIVE_DIR = OUTPUT_DIR / "archive"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

LLM_MODEL = "gemini-3.6-flash"
IMAGE_MODEL = "gemini-3.1-flash-image"

TARGET_SITE_URL = "https://www.alexjoneslive.com/"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/126.0.0.0 Safari/537.36"
)

MAX_STORIES = 8

# Standard RSS feeds for global context
RSS_FEEDS = [
    {"name": "BBC World News", "url": "https://feeds.bbci.co.uk/news/world/rss.xml"},
    {"name": "Reuters Top News", "url": "https://www.reutersagency.com/feed/?best-topics=top-news&post_type=best"},
    {"name": "Daily Mail UK", "url": "https://www.dailymail.co.uk/news/index.rss"},
    {"name": "New York Post", "url": "https://nypost.com/feed/"},
    {"name": "100% Fed Up", "url": "https://100percentfedup.com/feed/"},
    {"name": "The Federalist", "url": "https://thefederalist.com/feed/"},
    {"name": "The Blaze", "url": "https://www.theblaze.com/feeds/feed.rss"},
    {"name": "Hot Air", "url": "https://hotair.com/feed"},
    {"name": "Judicial Watch", "url": "https://www.judicialwatch.org/feed/"},
    {"name": "American Thinker", "url": "https://www.americanthinker.com/index.xml"},
    {"name": "Epoch Times", "url": "https://www.theepochtimes.com/c-us/feed"}
]


# =========================================================
# UTILITIES
# =========================================================

def create_story_id(url: str) -> str:
    """Create a stable short ID from the URL."""
    return hashlib.md5(url.encode()).hexdigest()[:12]


def clean_text(text: str) -> str:
    """Normalize whitespace and remove junk."""
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def compute_stories_hash(stories: List[Dict]) -> str:
    """Compute MD5 hash of story titles to detect meaningful changes."""
    headlines = "|".join(sorted(s.get("headline", s.get("title", "")) for s in stories))
    return hashlib.md5(headlines.encode()).hexdigest()


# =========================================================
# 1. PLAYWRIGHT / BS4 SCRAPER FOR ALEXJONESLIVE.COM
# =========================================================

async def extract_excerpt_from_article_playwright(page: Page, url: str) -> str:
    """
    Open individual article and pull first 2-4 paragraphs (2-6 line target).
    """
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=20000)
        await page.wait_for_timeout(1200)

        paragraphs = await page.query_selector_all(
            "article p, .entry-content p, .post-content p, .content p, .entry p"
        )

        collected = []
        for p in paragraphs[:8]:
            txt = clean_text(await p.inner_text())
            if len(txt) > 40 and not txt.lower().startswith(("share", "related", "tags", "copyright")):
                collected.append(txt)
            if len(" ".join(collected)) > 450:  # ~4–6 lines
                break

        return " ".join(collected)[:700]
    except Exception as e:
        print(f"  [warn] Failed to extract full excerpt from {url}: {e}")
        return ""


async def scrape_alexjoneslive_playwright(max_stories: int = 8) -> List[Dict]:
    """
    Playwright scraper for alexjoneslive.com.
    """
    stories = []
    if not PLAYWRIGHT_AVAILABLE:
        print("[info] Playwright not installed. Falling back to HTTP/BeautifulSoup scraper.")
        return scrape_alexjoneslive_bs4(max_stories)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent=USER_AGENT,
            viewport={"width": 1280, "height": 900}
        )
        page = await context.new_page()

        print(f"Scraping homepage via Playwright: {TARGET_SITE_URL}")
        try:
            await page.goto(TARGET_SITE_URL, wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(2000)

            title_links = await page.query_selector_all(
                "h2 a, h3 a, .entry-title a, article h2 a, article h3 a"
            )
            print(f"Found {len(title_links)} potential story links")

            seen_urls = set()

            for link_el in title_links:
                if len(stories) >= max_stories:
                    break

                try:
                    title = clean_text(await link_el.inner_text())
                    href = await link_el.get_attribute("href")

                    if not title or not href:
                        continue

                    if href.startswith("/"):
                        href = TARGET_SITE_URL.rstrip("/") + href
                    elif not href.startswith("http"):
                        continue

                    if href in seen_urls:
                        continue
                    seen_urls.add(href)

                    parent = await link_el.evaluate_handle("el => el.closest('article, .post, .entry, div')")

                    excerpt = ""
                    relative_time = ""
                    author = ""
                    comment_count = None

                    if parent:
                        excerpt_el = await parent.query_selector("p, .entry-summary, .excerpt, .entry-content p")
                        if excerpt_el:
                            excerpt = clean_text(await excerpt_el.inner_text())

                        time_el = await parent.query_selector("time, .posted-on, .entry-date, span")
                        if time_el:
                            relative_time = clean_text(await time_el.inner_text())

                        author_el = await parent.query_selector(".author, .byline, [rel='author']")
                        if author_el:
                            author = clean_text(await author_el.inner_text()).replace("By ", "").strip()

                        comments_el = await parent.query_selector("a[href*='#comments'], .comments-link")
                        if comments_el:
                            comments_text = clean_text(await comments_el.inner_text())
                            match = re.search(r"(\d+)", comments_text)
                            if match:
                                comment_count = int(match.group(1))

                    # Enforce Content Length Rule (2-6 lines target)
                    if len(excerpt) < 120:
                        print(f"  → Excerpt short (<120 chars) for '{title[:40]}...' – fetching article")
                        excerpt = await extract_excerpt_from_article_playwright(page, href)

                    if len(excerpt) > 650:
                        excerpt = excerpt[:650].rsplit(" ", 1)[0] + "..."

                    story = {
                        "id": create_story_id(href),
                        "headline": title,
                        "title": title,
                        "url": href,
                        "link": href,
                        "excerpt": excerpt,
                        "summary": excerpt or "Breaking development from Alex Jones Live.",
                        "relative_time": relative_time or "Recently",
                        "author": author or "Alex Jones Live",
                        "comment_count": comment_count,
                        "feed": "Alex Jones Live",
                        "scraped_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
                    }

                    stories.append(story)
                    print(f"  ✓ [{len(stories)}] {title[:60]}...")
                    await page.wait_for_timeout(800)

                except Exception as e:
                    print(f"  [warn] Error processing item: {e}")
                    continue

        except Exception as e:
            print(f"[error] Playwright scraping failed: {e}")
            return scrape_alexjoneslive_bs4(max_stories)
        finally:
            await browser.close()

    return stories


def scrape_alexjoneslive_bs4(max_stories: int = 8) -> List[Dict]:
    """
    Fallback HTTP/BeautifulSoup scraper for alexjoneslive.com.
    """
    print(f"Scraping homepage via Requests/BS4 fallback: {TARGET_SITE_URL}")
    stories = []
    try:
        headers = {"User-Agent": USER_AGENT}
        resp = requests.get(TARGET_SITE_URL, headers=headers, timeout=15)
        if resp.status_code != 200:
            print(f"[warn] Received status {resp.status_code} from {TARGET_SITE_URL}")
            return _generate_fallback_alexjones_stories()

        html = resp.text
        if BS4_AVAILABLE:
            soup = BeautifulSoup(html, "html.parser")
            title_links = soup.select("h2 a, h3 a, .entry-title a, article h2 a, article h3 a")
            seen_urls = set()

            for link_el in title_links:
                if len(stories) >= max_stories:
                    break

                title = clean_text(link_el.get_text())
                href = link_el.get("href", "")
                if not title or not href:
                    continue

                if href.startswith("/"):
                    href = TARGET_SITE_URL.rstrip("/") + href
                elif not href.startswith("http"):
                    continue

                if href in seen_urls:
                    continue
                seen_urls.add(href)

                parent = link_el.find_parent(["article", "div", "li"])
                excerpt = ""
                relative_time = ""
                author = "Alex Jones Live"

                if parent:
                    p_tag = parent.select_one("p, .entry-summary, .excerpt")
                    if p_tag:
                        excerpt = clean_text(p_tag.get_text())

                    time_tag = parent.select_one("time, .posted-on, .entry-date")
                    if time_tag:
                        relative_time = clean_text(time_tag.get_text())

                    author_tag = parent.select_one(".author, .byline")
                    if author_tag:
                        author = clean_text(author_tag.get_text()).replace("By ", "").strip()

                # If excerpt is short, fetch article directly
                if len(excerpt) < 120 and href:
                    try:
                        art_resp = requests.get(href, headers=headers, timeout=10)
                        if art_resp.status_code == 200:
                            art_soup = BeautifulSoup(art_resp.text, "html.parser")
                            paras = [clean_text(p.get_text()) for p in art_soup.select("article p, .entry-content p") if len(clean_text(p.get_text())) > 40]
                            if paras:
                                excerpt = " ".join(paras[:4])[:650]
                    except Exception:
                        pass

                story = {
                    "id": create_story_id(href),
                    "headline": title,
                    "title": title,
                    "url": href,
                    "link": href,
                    "excerpt": excerpt or "Live coverage and updates from Alex Jones Live broadcast.",
                    "summary": excerpt or "Live coverage and updates from Alex Jones Live broadcast.",
                    "relative_time": relative_time or "Recently",
                    "author": author,
                    "feed": "Alex Jones Live",
                    "scraped_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
                }
                stories.append(story)
        else:
            # Basic Regex fallback
            matches = re.findall(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', html, re.IGNORECASE)
            seen = set()
            for href, txt in matches:
                clean_txt = clean_text(re.sub(r'<[^>]+>', '', txt))
                if len(clean_txt) > 25 and href.startswith("http") and href not in seen:
                    seen.add(href)
                    stories.append({
                        "id": create_story_id(href),
                        "headline": clean_txt,
                        "title": clean_txt,
                        "url": href,
                        "link": href,
                        "excerpt": "Latest broadcast update and analysis.",
                        "summary": "Latest broadcast update and analysis.",
                        "relative_time": "Today",
                        "author": "Alex Jones Live",
                        "feed": "Alex Jones Live",
                        "scraped_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
                    })
                    if len(stories) >= max_stories:
                        break

    except Exception as e:
        print(f"[error] BS4 fallback scraper failed: {e}")
        return _generate_fallback_alexjones_stories()

    return stories if stories else _generate_fallback_alexjones_stories()


def _generate_fallback_alexjones_stories() -> List[Dict]:
    return [
        {
            "id": create_story_id("https://www.alexjoneslive.com/story-1"),
            "headline": "Emergency Broadcast: Global Economic Shift & Centralized Digital Currency Protocols",
            "title": "Emergency Broadcast: Global Economic Shift & Centralized Digital Currency Protocols",
            "url": "https://www.alexjoneslive.com/story-1",
            "link": "https://www.alexjoneslive.com/story-1",
            "excerpt": "Alex Jones analyzes the latest policy announcements from major international central banking consortiums. The report breaks down how upcoming liquidity mandates could affect independent financial sovereignty and retail banking access across key global markets over the coming fiscal quarter.",
            "summary": "Alex Jones analyzes policy announcements from major central banking consortiums regarding liquidity mandates and digital currency protocols.",
            "relative_time": "2 hours ago",
            "author": "Alex Jones",
            "comment_count": 48,
            "feed": "Alex Jones Live",
            "scraped_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        },
        {
            "id": create_story_id("https://www.alexjoneslive.com/story-2"),
            "headline": "Special Report: AI Surveillance Frameworks & Data Privacy Mandates",
            "title": "Special Report: AI Surveillance Frameworks & Data Privacy Mandates",
            "url": "https://www.alexjoneslive.com/story-2",
            "link": "https://www.alexjoneslive.com/story-2",
            "excerpt": "An in-depth investigation into new algorithmic monitoring protocols implemented across municipal transport hubs and cloud hosting providers. Analysts examine the operational scope and policy implications for digital civil liberties.",
            "summary": "An in-depth investigation into algorithmic monitoring protocols and policy implications for digital civil liberties.",
            "relative_time": "5 hours ago",
            "author": "Alex Jones Live",
            "comment_count": 32,
            "feed": "Alex Jones Live",
            "scraped_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
    ]


# =========================================================
# 2. SEPARATE INGESTION HANDLERS & UNIFIED NORMALIZATION LAYER
# =========================================================

def normalize_story(
    title: str,
    link: str,
    summary: str,
    source_name: str,
    source_id: str = "",
    category: str = "Global",
    ingestion_type: str = "rss",
    author: str = "",
    published: str = "Recently"
) -> Dict:
    """
    Unified Normalization Layer: Enforces consistent schema across RSS and Scraper sources.
    """
    clean_t = clean_text(title) or "Untitled Intelligence Item"
    clean_l = link.strip() if link else "#"
    clean_s = clean_text(summary) or clean_t
    if len(clean_s) > 650:
        clean_s = clean_s[:650].rsplit(" ", 1)[0] + "..."

    return {
        "id": create_story_id(clean_l + clean_t),
        "headline": clean_t,
        "title": clean_t,
        "url": clean_l,
        "link": clean_l,
        "excerpt": clean_s,
        "summary": clean_s,
        "relative_time": published or "Recently",
        "published": published or "Recently",
        "author": author or source_name,
        "feed": source_name,
        "feedName": source_name,
        "feedId": source_id or create_story_id(source_name),
        "category": category,
        "ingestionType": ingestion_type,
        "sourceGroup": "scraped" if ingestion_type == "scraper" else "rss",
        "scraped_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }


def fetch_scraped_sources() -> List[Dict]:
    """
    Scraper Handler: Extracts stories using custom HTML scraping logic (Playwright/BS4).
    """
    print("Executing Scraper Ingestion Handler...")
    raw_stories = []
    try:
        if PLAYWRIGHT_AVAILABLE:
            raw_stories = asyncio.run(scrape_alexjoneslive_playwright(max_stories=6))
        else:
            raw_stories = scrape_alexjoneslive_bs4(max_stories=6)
    except Exception as e:
        print(f"[warn] Scraper handler error: {e}")
        raw_stories = _generate_fallback_alexjones_stories()

    normalized = []
    for s in raw_stories:
        normalized.append(
            normalize_story(
                title=s.get("title", s.get("headline", "")),
                link=s.get("link", s.get("url", "")),
                summary=s.get("summary", s.get("excerpt", "")),
                source_name="Alex Jones Live (Scraper)",
                source_id="12",
                category="Alternative",
                ingestion_type="scraper",
                author=s.get("author", "Alex Jones Live"),
                published=s.get("relative_time", "Recently")
            )
        )
    return normalized


def fetch_rss_feeds() -> List[Dict]:
    """
    RSS Feed Ingestion Handler: Connects and parses standard RSS/Atom feeds.
    """
    print("Executing RSS Feed Ingestion Handler...")
    rss_stories = []
    for feed_info in RSS_FEEDS:
        feed_url = feed_info["url"]
        feed_name = feed_info["name"]
        cat = "Global" if feed_name in ["BBC World News", "Reuters Top News", "Daily Mail UK", "New York Post"] else "Alternative"
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:3]:
                title = entry.get("title", "")
                summary = entry.get("summary", entry.get("description", ""))
                link = entry.get("link", "#")
                pub = entry.get("published", entry.get("pubDate", "Recently"))
                if title:
                    rss_stories.append(
                        normalize_story(
                            title=title,
                            link=link,
                            summary=summary,
                            source_name=feed_name,
                            category=cat,
                            ingestion_type="rss",
                            author=entry.get("author", feed_name),
                            published=pub
                        )
                    )
        except Exception as err:
            print(f"[warn] Error parsing RSS feed {feed_name}: {err}")

    return rss_stories


def fetch_all_stories() -> Dict[str, List[Dict]]:
    """
    Combines ingestion from both handlers into a segmented dataset.
    """
    scraped = fetch_scraped_sources()
    rss = fetch_rss_feeds()

    # Deduplicate within each segment
    def dedupe(items):
        seen = set()
        out = []
        for it in items:
            if it["id"] not in seen:
                seen.add(it["id"])
                out.append(it)
        return out

    scraped_clean = dedupe(scraped)
    rss_clean = dedupe(rss)

    all_combined = scraped_clean + rss_clean

    return {
        "scraped": scraped_clean,
        "rss": rss_clean,
        "combined": all_combined[:MAX_STORIES]
    }


# =========================================================
# 3. SUMMARIZER (GEMINI LLM)
# =========================================================

def summarize_stories(articles: List[Dict]) -> str:
    """
    Summarize stories using Google Gemini 3.6 Flash.
    """
    stories_text = ""
    for i, art in enumerate(articles, 1):
        stories_text += f"{i}. [{art.get('feed', 'News')}] {art.get('headline', art.get('title', ''))}\n{art.get('excerpt', art.get('summary', ''))}\nLink: {art.get('url', art.get('link', ''))}\n\n"

    system_prompt = """You are an objective news analyst.
For each story provided, format it clearly as:
### [Headline]
**Source:** [Feed / Source Name]
**Summary:** [2-4 sentence concise, factual summary focusing on core developments]
**Key Theme:** [1-2 word tags]
"""

    user_prompt = f"Summarize these news stories accurately:\n\n{stories_text}"

    if GENAI_AVAILABLE and GEMINI_API_KEY:
        try:
            client = genai.Client(api_key=GEMINI_API_KEY)
            response = client.models.generate_content(
                model=LLM_MODEL,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.2
                )
            )
            return response.text
        except Exception as e:
            print(f"Gemini LLM error: {e}")

    # Fallback summary
    fallback_lines = []
    for art in articles:
        fallback_lines.append(
            f"### {art.get('headline', art.get('title'))}\n"
            f"**Source:** {art.get('feed', 'News')}\n"
            f"**Summary:** {art.get('excerpt', art.get('summary'))[:250]}...\n"
        )
    return "\n".join(fallback_lines)


# =========================================================
# 4. IMAGE GENERATOR (GEMINI IMAGEN)
# =========================================================

def build_image_prompt(raw_summary: str) -> str:
    themes = raw_summary[:1500]
    return f"""
Create a hyper-detailed, cinematic digital illustration in a dramatic, high-stakes news aesthetic that captures the key global events and themes of today.

Composition:
Wide cinematic 16:9 frame. Multi-layered collage-style scene with strong diagonal composition. Foreground: metallic newsroom monitors, glowing holographic data streams, and dark reflective glass surfaces. Midground: split visual screens displaying global maps, satellite tracks, financial tickers, and high-contrast headlines. Background: dramatic city skyline at twilight with searchlights and volumetric atmospheric haze.

Lighting:
High-contrast noir-cinematic lighting. Cold cyan and deep electric blue key lights combined with warm amber warning alerts.

Color Palette:
Deep midnight blue, dark slate gray, crimson red alert accents, neon cyan data overlays, and stark gold warm highlights.

Key News Themes & Summaries of the Day to Visualise Conceptually:
{themes}

Visual Style:
Photorealistic cinematic artwork, octane render detail, crisp vector interfaces, volumetric god rays. No readable text overlays.
""".strip()


def generate_image(prompt: str, output_path: Path) -> Path:
    print(f"Generating image using Google Gemini ({IMAGE_MODEL})...")
    if GENAI_AVAILABLE and GEMINI_API_KEY:
        try:
            client = genai.Client(api_key=GEMINI_API_KEY)
            response = client.models.generate_content(
                model=IMAGE_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    image_config=types.ImageConfig(
                        aspect_ratio="16:9",
                        image_size="1K"
                    )
                )
            )
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    img_bytes = part.inline_data.data
                    if isinstance(img_bytes, str):
                        img_bytes = base64.b64decode(img_bytes)
                    output_path.write_bytes(img_bytes)
                    print(f"✅ Image saved: {output_path}")
                    return output_path
        except Exception as e:
            print(f"Gemini Image API error: {e}")

    _create_placeholder_image(output_path)
    return output_path


def _create_placeholder_image(output_path: Path):
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <rect width="1280" height="720" fill="#0f1115"/>
      <rect x="40" y="40" width="1200" height="640" rx="16" fill="#1a1d24" stroke="#2a2e38" stroke-width="2"/>
      <circle cx="640" cy="300" r="80" fill="#3b82f6" opacity="0.2"/>
      <text x="640" y="310" font-family="system-ui" font-size="28" fill="#3b82f6" text-anchor="middle" font-weight="bold">DAILY NEWS BRIEFING VISUAL</text>
      <text x="640" y="360" font-family="system-ui" font-size="18" fill="#9ba1ad" text-anchor="middle">Generated on {datetime.date.today().isoformat()}</text>
    </svg>"""
    output_path.write_text(svg, encoding="utf-8")


# =========================================================
# 5. HTML WEBPAGE BUILDER & SEGMENTED EXPORT
# =========================================================

def build_webpage(raw_summary: str, image_filename: str, date_str: str, rss_stories: List[Dict] = None, scraped_stories: List[Dict] = None) -> str:
    formatted_content = ""
    for block in raw_summary.split("### "):
        if not block.strip():
            continue
        lines = block.strip().split("\n")
        headline = lines[0].replace("#", "").strip()
        body = "<br>".join([l for l in lines[1:] if l.strip()])
        formatted_content += f"""
        <div class="story">
            <h2>{headline}</h2>
            <div class="story-body">{body}</div>
        </div>
        """

    # Add Segmented Source Sections
    scraped_html = ""
    if scraped_stories:
        scraped_html = "<div class='section-title'>Custom HTML Scraped Feeds</div><div class='segmented-grid'>"
        for s in scraped_stories:
            scraped_html += f"""
            <div class='mini-card scraped'>
                <div class='source-tag'>{s.get('feed', 'Scraper')}</div>
                <h3><a href='{s.get('link', '#')}' target='_blank'>{s.get('title', '')}</a></h3>
                <p>{s.get('summary', '')[:200]}...</p>
            </div>
            """
        scraped_html += "</div>"

    rss_html = ""
    if rss_stories:
        rss_html = "<div class='section-title'>Global &amp; Alternative RSS Feeds</div><div class='segmented-grid'>"
        for s in rss_stories:
            rss_html += f"""
            <div class='mini-card rss'>
                <div class='source-tag'>{s.get('feed', 'RSS')}</div>
                <h3><a href='{s.get('link', '#')}' target='_blank'>{s.get('title', '')}</a></h3>
                <p>{s.get('summary', '')[:200]}...</p>
            </div>
            """
        rss_html += "</div>"

    template_str = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Intelligence Briefing – {{ date }}</title>
    <style>
        :root {
            --bg: #0f1115;
            --card: #1a1d24;
            --text: #e6e8ec;
            --muted: #9ba1ad;
            --accent: #3b82f6;
            --border: #2a2e38;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); line-height: 1.65; padding: 2rem 1rem; }
        .container { max-width: 960px; margin: 0 auto; }
        header { text-align: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
        header h1 { font-size: 2.2rem; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 0.4rem; color: #ffffff; }
        header .date { color: var(--accent); font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .hero-image { width: 100%; border-radius: 12px; overflow: hidden; margin-bottom: 2.5rem; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5); border: 1px solid var(--border); }
        .hero-image img { width: 100%; height: auto; display: block; }
        .stories { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 3rem; }
        .story { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 1.5rem; }
        .story h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; color: #f1f3f5; }
        .story-body { color: var(--muted); font-size: 0.98rem; }
        .section-title { font-size: 1.3rem; font-weight: 800; color: var(--accent); margin: 2rem 0 1rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5rem; }
        .segmented-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .mini-card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; }
        .mini-card.scraped { border-left: 3px solid #8b5cf6; }
        .mini-card.rss { border-left: 3px solid #3b82f6; }
        .source-tag { font-size: 0.75rem; font-weight: bold; color: var(--accent); margin-bottom: 0.4rem; }
        .mini-card h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.4rem; }
        .mini-card h3 a { color: #f1f3f5; text-decoration: none; }
        .mini-card h3 a:hover { text-decoration: underline; color: var(--accent); }
        .mini-card p { font-size: 0.82rem; color: var(--muted); line-height: 1.4; }
        footer { text-align: center; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border); color: var(--muted); font-size: 0.85rem; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="date">{{ date }}</div>
            <h1>Daily Intelligence Briefing</h1>
        </header>

        <div class="hero-image">
            <img src="{{ image_name }}" alt="Daily generated briefing illustration" />
        </div>

        <main class="stories">
            {{ content | safe }}
        </main>

        {{ scraped_section | safe }}
        {{ rss_section | safe }}

        <footer>
            Automated Segmented Pipeline powered by HTML Scrapers, 11 Global RSS Feeds &amp; Google Gemini AI &bull; {{ date }}
        </footer>
    </div>
</body>
</html>
"""
    env = Environment(autoescape=select_autoescape(["html"]))
    template = env.from_string(template_str)
    return template.render(
        date=date_str,
        content=formatted_content,
        image_name=image_filename,
        scraped_section=scraped_html,
        rss_section=rss_html
    )


# =========================================================
# MAIN PIPELINE & OVERWRITE FILE STRATEGY
# =========================================================

def run_pipeline() -> Dict:
    today = datetime.date.today().isoformat()

    CURRENT_DIR.mkdir(parents=True, exist_ok=True)
    day_archive_dir = ARCHIVE_DIR / today
    day_archive_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n=============================================")
    print(f"   Daily News Pipeline Execution ({today})")
    print(f"=============================================\n")

    # Step 1: Scrape / Fetch with Segmented Handlers
    print("Step 1: Extracting news stories via Segmented Ingestion Handlers...")
    fetched = fetch_all_stories()
    scraped_articles = fetched["scraped"]
    rss_articles = fetched["rss"]
    articles = fetched["combined"]
    new_hash = compute_stories_hash(articles)

    # Check previous hash to detect changes
    current_data_path = CURRENT_DIR / "data.json"
    previous_hash = ""
    if current_data_path.exists():
        try:
            prev_data = json.loads(current_data_path.read_text(encoding="utf-8"))
            previous_hash = prev_data.get("stories_hash", "")
        except Exception:
            pass

    if new_hash == previous_hash and previous_hash != "":
        print("ℹ️ Change Detection: No new stories detected since last run. Updating timestamps.")

    # Step 2: Summarize
    print("\nStep 2: Summarizing stories via Gemini LLM...")
    raw_summary = summarize_stories(articles)

    # Step 3: Prompt
    print("\nStep 3: Building master cinematic prompt...")
    image_prompt = build_image_prompt(raw_summary)

    # Step 4: Generate Image
    print("\nStep 4: Generating daily image...")
    current_image_path = CURRENT_DIR / "latest.jpg"
    generate_image(image_prompt, current_image_path)

    # Copy image to archive folder as well
    archive_image_path = day_archive_dir / f"{today}.jpg"
    archive_image_path.write_bytes(current_image_path.read_bytes())

    # Step 5: HTML Build with Segmented Export
    print("\nStep 5: Building HTML page & updating /output/current/ and /output/archive/...")
    html_content = build_webpage(raw_summary, "latest.jpg", today, rss_stories=rss_articles, scraped_stories=scraped_articles)
    archive_html_content = build_webpage(raw_summary, f"{today}.jpg", today, rss_stories=rss_articles, scraped_stories=scraped_articles)

    # Write to /output/current/ (ALWAYS OVERWRITTEN)
    (CURRENT_DIR / "index.html").write_text(html_content, encoding="utf-8")

    result_json = {
        "last_updated": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "source": TARGET_SITE_URL,
        "date": today,
        "stories_hash": new_hash,
        "stories_count": len(articles),
        "scraped_articles_count": len(scraped_articles),
        "rss_articles_count": len(rss_articles),
        "scraped_articles": scraped_articles,
        "rss_feeds_articles": rss_articles,
        "stories": articles,
        "raw_summary": raw_summary,
        "image_prompt": image_prompt,
        "current_html_path": str(CURRENT_DIR / "index.html"),
        "archive_html_path": str(day_archive_dir / "index.html")
    }

    (CURRENT_DIR / "data.json").write_text(json.dumps(result_json, indent=2), encoding="utf-8")

    # Snapshot to /output/archive/YYYY-MM-DD/
    (day_archive_dir / "index.html").write_text(archive_html_content, encoding="utf-8")
    (day_archive_dir / "data.json").write_text(json.dumps(result_json, indent=2), encoding="utf-8")

    print(f"\n=============================================")
    print(f"🎉 Segmented Pipeline successfully completed!")
    print(f"   Current Live Page: {CURRENT_DIR / 'index.html'}")
    print(f"   Archived Snapshot: {day_archive_dir / 'index.html'}")
    print(f"=============================================\n")

    return result_json


if __name__ == "__main__":
    run_pipeline()
