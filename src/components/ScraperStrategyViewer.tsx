import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Play, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Layers, FileText, Cpu, Clock, FolderCheck, Code } from 'lucide-react';

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
    <div id="scraper-strategy-container" className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Target: alexjoneslive.com
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-white/10 text-white/70 border border-white/10">
              Playwright + Cheerio Engine
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-white mt-2">
            Scraping &amp; Ingestion Specification
          </h2>
          <p className="text-[11px] font-mono text-white/50 mt-1 uppercase tracking-widest">
            Custom DOM scraper built to bypass missing public RSS feeds, enforce 2–6 line story excerpts, and execute daily updates
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center bg-black p-1 border border-white/10 shrink-0">
          <button
            onClick={() => setActiveSubTab('briefing')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all ${
              activeSubTab === 'briefing' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            Briefing Spec
          </button>
          <button
            onClick={() => setActiveSubTab('tester')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all ${
              activeSubTab === 'tester' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            Live Scraper Test
          </button>
          <button
            onClick={() => setActiveSubTab('selectors')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all ${
              activeSubTab === 'selectors' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            DOM Selectors
          </button>
          <button
            onClick={() => setActiveSubTab('output')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all ${
              activeSubTab === 'output' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            Pipeline Output
          </button>
        </div>
      </div>

      {/* Main SubTab Content */}

      {/* 1. Briefing Spec */}
      {activeSubTab === 'briefing' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#0a0a0a] border border-white/10 p-6 space-y-4">
              <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>1. Recommended Scraping Approach</span>
              </h3>
              <p className="text-xs font-serif text-white/80 leading-relaxed">
                Uses <strong>Playwright</strong> or <strong>BeautifulSoup / Cheerio</strong> for dynamic DOM query execution. Playwright handles client-side rendering and anti-bot validation naturally.
              </p>

              <div className="bg-black p-4 border border-white/10 space-y-2">
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Target Story Data Fields:</span>
                </div>
                <ul className="text-xs font-serif text-white/60 space-y-1 list-disc list-inside pl-2">
                  <li>Full headline / story title link</li>
                  <li>Direct URL to article page</li>
                  <li>Short excerpt / first paragraph (aim for 2–4 sentences / 80–250 words)</li>
                  <li>Published timestamp or relative time (“7 hours ago”)</li>
                  <li>Author tag (if present)</li>
                  <li>Comment count (when available)</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 p-6 space-y-4">
              <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>2. Pipeline Cycle &amp; Excerpt Rules</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-black p-4 border border-white/10">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 block mb-1">Content Enforcement</span>
                  <p className="text-white/60 font-serif leading-relaxed">
                    If homepage excerpt is &lt; 120 characters, automatically open the individual article page and extract the first 2–4 paragraphs to ensure 2–6 lines of clean factual content.
                  </p>
                </div>

                <div className="bg-black p-4 border border-white/10">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 block mb-1">Deduplication</span>
                  <p className="text-white/60 font-serif leading-relaxed">
                    Compare MD5 hashes of new story headlines against previous runs to avoid unnecessary processing when wire content is unchanged.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Quick Info */}
          <div className="space-y-4">
            <div className="bg-[#0a0a0a] border border-white/10 p-6 space-y-3">
              <h4 className="font-mono font-bold uppercase tracking-widest text-white text-[11px] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-500" />
                <span>Target Site Specs</span>
              </h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/10 text-white/50">
                  <span>URL:</span>
                  <span className="text-white">alexjoneslive.com</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10 text-white/50">
                  <span>RSS Stream:</span>
                  <span className="text-amber-400">Unavailable (DOM Scraped)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10 text-white/50">
                  <span>Engine:</span>
                  <span className="text-emerald-400">Playwright / Cheerio</span>
                </div>
                <div className="flex justify-between py-1 text-white/50">
                  <span>Target Length:</span>
                  <span className="text-amber-400">2–6 Lines / Story</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRunTest}
              disabled={isTesting}
              className="w-full bg-white hover:bg-amber-500 text-black font-mono font-bold py-3.5 text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Play className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Executing Scraper...' : 'Execute Scraper Test'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Live Scraper Tester */}
      {activeSubTab === 'tester' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#0a0a0a] border border-white/10 p-4">
            <div>
              <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-500" />
                <span>Live Scraping Diagnostic</span>
              </h3>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-0.5">
                Target: https://www.alexjoneslive.com/
              </p>
            </div>

            <button
              onClick={handleRunTest}
              disabled={isTesting}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-amber-500 text-black font-mono text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Extracting...' : 'Re-Run Scraper'}</span>
            </button>
          </div>

          {error && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 flex items-center gap-3 text-amber-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isTesting ? (
            <div className="bg-[#0a0a0a] border border-white/10 p-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 animate-spin mx-auto" />
              <h4 className="text-xs font-mono uppercase tracking-widest text-white">Connecting to alexjoneslive.com...</h4>
              <p className="text-[10px] font-mono text-white/40">Executing DOM query selector parsing and deep article excerpt checks</p>
            </div>
          ) : testResult ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testResult.stories.map((s, idx) => (
                <div key={s.id || idx} className="bg-[#0a0a0a] border border-white/10 p-6 space-y-3 flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 border-b border-white/10 pb-3">
                      <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {s.extractionMethod || 'Homepage Selector'}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>{s.relative_time}</span>
                      </div>
                    </div>

                    <h4 className="font-serif font-bold text-white text-base leading-snug">
                      {s.headline || s.title}
                    </h4>

                    {/* Excerpt */}
                    <div className="bg-black p-4 border border-white/10 mt-3 text-xs font-serif text-white/70 leading-relaxed">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1 flex items-center justify-between">
                        <span>Extracted Excerpt</span>
                        <span>{s.excerpt.length} chars</span>
                      </div>
                      <p>{s.excerpt}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                    <span className="text-white/40 font-mono text-[10px]">{s.author}</span>

                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-amber-400 hover:text-white font-mono text-[10px] uppercase tracking-widest transition-colors"
                      >
                        <span>Original Article</span>
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
        <div className="bg-[#0a0a0a] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
              <Code className="w-4 h-4 text-amber-500" />
              <span>Core CSS &amp; DOM Selectors (alexjoneslive.com)</span>
            </h3>
            <span className="text-[10px] font-mono text-white/50 bg-black px-2.5 py-1 border border-white/10 uppercase tracking-widest">
              Tuned for Active Layout
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-black p-4 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest block text-amber-500">Story Title Links</span>
              <code className="text-amber-200">h2 a, h3 a, .entry-title a, article h2 a</code>
            </div>

            <div className="bg-black p-4 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest block text-amber-500">Excerpt / Description</span>
              <code className="text-amber-200">.entry-summary, .excerpt, p</code>
            </div>

            <div className="bg-black p-4 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest block text-amber-500">Timestamp / Relative Time</span>
              <code className="text-amber-200">time, .posted-on, .entry-date</code>
            </div>

            <div className="bg-black p-4 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest block text-amber-500">Author Tag</span>
              <code className="text-amber-200">.author, .byline, [rel='author']</code>
            </div>
          </div>
        </div>
      )}

      {/* 4. Overwrite Architecture */}
      {activeSubTab === 'output' && (
        <div className="bg-[#0a0a0a] border border-white/10 p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
            <FolderCheck className="w-4 h-4 text-amber-500" />
            <span>Daily File Strategy (Overwrite Model)</span>
          </h3>

          <div className="bg-black p-4 border border-white/10 text-xs font-mono text-amber-200/90 leading-relaxed whitespace-pre">
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

          <p className="text-xs font-serif text-white/60">
            Every run updates <code className="text-amber-400 font-mono bg-black px-1.5 py-0.5 border border-white/10">/output/current/index.html</code> so any web server pointing to the current directory always displays the latest daily briefing without requiring URL changes.
          </p>
        </div>
      )}
    </div>
  );
};

