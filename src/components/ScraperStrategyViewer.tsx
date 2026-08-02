import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Play, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Layers, FileText, Cpu, Clock, MessageSquare, ArrowRight, Sparkles, FolderCheck, Code } from 'lucide-react';

interface ScraperStory {
  id: string;
  headline: string;
  title: string;
  url: string;
  excerpt: string;
  relative_time: string;
  author: string;
  comment_count?: number | null;
  scraped_at: string;
  extractionMethod?: string;
}

export const ScraperStrategyViewer: React.FC = () => {
  const [testResult, setTestResult] = useState<{
    targetSite: string;
    scraped_at: string;
    stories_count: number;
    stories: ScraperStory[];
  } | null>(null);

  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'briefing' | 'tester' | 'selectors' | 'output'>('briefing');

  // Trigger scraper test
  const handleRunTest = async () => {
    setIsTesting(true);
    setError(null);
    try {
      const res = await fetch('/api/scraper/test', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scraper test failed');
      setTestResult(data);
    } catch (err: any) {
      setError(err.message || 'Scraper execution error');
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    handleRunTest();
  }, []);

  return (
    <div id="scraper-strategy-container" className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Target: alexjoneslive.com
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Playwright + Cheerio Engine
            </span>
          </div>
          <h2 className="font-extrabold text-2xl text-slate-100 mt-2 tracking-tight">
            Dev Team Briefing: Scraping Strategy
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Custom scraper built to bypass missing public RSS feeds, enforce 2–6 line story excerpts, execute daily overwrite file updates, and maintain archive history.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveSubTab('briefing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'briefing' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Briefing Spec
          </button>
          <button
            onClick={() => setActiveSubTab('tester')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'tester' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Scraper Test
          </button>
          <button
            onClick={() => setActiveSubTab('selectors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'selectors' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DOM Selectors
          </button>
          <button
            onClick={() => setActiveSubTab('output')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'output' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overwrite Architecture
          </button>
        </div>
      </div>

      {/* Main SubTab Content */}

      {/* 1. Briefing Spec */}
      {activeSubTab === 'briefing' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>1. Recommended Scraping Approach</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Use <strong>Playwright</strong> (preferred) or <strong>BeautifulSoup + requests</strong> as fallback.
                Playwright handles dynamic page loading, client-side rendering, and basic anti-bot protection.
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Minimum Data to Extract per Story (2–6 lines target):</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside pl-2">
                  <li>Full headline / story title link</li>
                  <li>Direct URL to article page</li>
                  <li>Short excerpt / first paragraph (aim for 2–4 sentences / 80–250 words)</li>
                  <li>Published timestamp or relative time (“7 hours ago”)</li>
                  <li>Author tag (if present)</li>
                  <li>Comment count (when available)</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>2. Pipeline Cycle &amp; Content Length Rule</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="font-semibold text-sky-400 block mb-1">Content Length Enforcement</span>
                  <p className="text-slate-400 leading-relaxed">
                    If homepage excerpt is &lt; 120 characters, automatically open the individual article page and extract the first 2–4 paragraphs to ensure 2–6 lines of clean factual content.
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="font-semibold text-sky-400 block mb-1">Change Detection</span>
                  <p className="text-slate-400 leading-relaxed">
                    Compare MD5 hashes of new story headlines against previous runs to avoid unnecessary visual regenerations when content hasn't changed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Quick Info */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h4 className="font-bold text-slate-100 text-xs flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Target Site Specs</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>URL:</span>
                  <span className="font-mono text-slate-200">alexjoneslive.com</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>RSS Feed:</span>
                  <span className="text-rose-400 font-semibold">Not Available</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Extraction Engine:</span>
                  <span className="text-emerald-400 font-semibold">Playwright / Cheerio</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Target Length:</span>
                  <span className="text-sky-400 font-semibold">2–6 Lines / Story</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRunTest}
              disabled={isTesting}
              className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-sky-500/20 active:scale-98 flex items-center justify-center gap-2"
            >
              <Play className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing Scraper...' : 'Run Live Scraper Test Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Live Scraper Tester */}
      {activeSubTab === 'tester' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                <span>Live Scraping Test Results</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: <code className="text-sky-400 font-mono">https://www.alexjoneslive.com/</code>
              </p>
            </div>

            <button
              onClick={handleRunTest}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-sky-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Extracting...' : 'Re-Run Scraper'}</span>
            </button>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isTesting ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <div className="w-10 h-10 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
              <h4 className="text-xs font-semibold text-slate-200">Connecting to alexjoneslive.com...</h4>
              <p className="text-[11px] text-slate-400 mt-1">Executing DOM query selector parsing and deep article excerpt checks</p>
            </div>
          ) : testResult ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testResult.stories.map((s, idx) => (
                <div key={s.id || idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {s.extractionMethod || 'Homepage Selector'}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{s.relative_time}</span>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-100 text-sm leading-snug">
                      {s.headline || s.title}
                    </h4>

                    {/* 2-6 Line Excerpt */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 mt-3 text-xs text-slate-300 leading-relaxed">
                      <div className="text-[10px] text-slate-500 font-mono mb-1 flex items-center justify-between">
                        <span>Extracted Story Excerpt (2–6 lines)</span>
                        <span>{s.excerpt.length} chars</span>
                      </div>
                      <p>{s.excerpt}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400 font-medium">{s.author}</span>

                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-xs font-semibold transition-colors"
                      >
                        <span>View Original</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* 3. DOM Selectors */}
      {activeSubTab === 'selectors' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Code className="w-4 h-4 text-sky-400" />
              <span>Core CSS &amp; DOM Selectors (alexjoneslive.com)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              Tuned for Aug 2026 Layout
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-sans font-semibold text-[11px] block text-sky-400">Story Title Links</span>
              <code className="text-emerald-300">h2 a, h3 a, .entry-title a, article h2 a</code>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-sans font-semibold text-[11px] block text-sky-400">Excerpt / Description</span>
              <code className="text-emerald-300">.entry-summary, .excerpt, p</code>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-sans font-semibold text-[11px] block text-sky-400">Timestamp / Relative Time</span>
              <code className="text-emerald-300">time, .posted-on, .entry-date</code>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-sans font-semibold text-[11px] block text-sky-400">Author</span>
              <code className="text-emerald-300">.author, .byline, [rel='author']</code>
            </div>
          </div>
        </div>
      )}

      {/* 4. Overwrite Architecture */}
      {activeSubTab === 'output' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <FolderCheck className="w-4 h-4 text-emerald-400" />
            <span>Daily File Strategy (Overwrite Model)</span>
          </h3>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre">
{`output/
├── current/                  ← Always the latest live page
│   ├── index.html            ← The live HTML briefing (overwritten every run)
│   ├── data.json             ← Structured JSON with 2–6 line excerpts
│   └── latest.jpg            ← Daily generated cinematic image
└── archive/                  ├── YYYY-MM-DD/
    └── 2026-08-02/
        ├── index.html
        └── data.json`}
          </div>

          <p className="text-xs text-slate-400">
            Every run updates <code className="text-sky-400 font-mono">/output/current/index.html</code> so any web server pointing to the current directory always displays the latest daily briefing without requiring URL changes.
          </p>
        </div>
      )}
    </div>
  );
};
