import React from 'react';
import { Newspaper, Play, Clock, Rss, Archive, Code, Settings, Sparkles, CheckCircle2, Shield, Globe } from 'lucide-react';

interface HeaderProps {
  activeTab: 'briefing' | 'live-feeds' | 'scraper' | 'feeds' | 'archive' | 'python' | 'settings';
  setActiveTab: (tab: 'briefing' | 'live-feeds' | 'scraper' | 'feeds' | 'archive' | 'python' | 'settings') => void;
  onRunPipeline: () => void;
  isRunning: boolean;
  lastRunDate: string | null;
  activeFeedsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunPipeline,
  isRunning,
  lastRunDate,
  activeFeedsCount
}) => {
  return (
    <header id="main-header" className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* App Title & Branding */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight">Daily News Digest AI</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gemini 3.6
              </span>
            </div>
            <p className="text-xs text-slate-400">Automated news fetching, LLM summarization &amp; cinematic image generation</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav id="nav-tabs" className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 w-full md:w-auto overflow-x-auto">
          <button
            id="tab-briefing"
            onClick={() => setActiveTab('briefing')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'briefing'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Today's Briefing</span>
          </button>

          <button
            id="tab-live-feeds"
            onClick={() => setActiveTab('live-feeds')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'live-feeds'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Live Feeds &amp; Custom</span>
          </button>

          <button
            id="tab-scraper"
            onClick={() => setActiveTab('scraper')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'scraper'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Scraping Strategy</span>
          </button>

          <button
            id="tab-feeds"
            onClick={() => setActiveTab('feeds')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'feeds'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Rss className="w-3.5 h-3.5" />
            <span>RSS Feeds</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {activeFeedsCount}
            </span>
          </button>

          <button
            id="tab-archive"
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'archive'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archives</span>
          </button>

          <button
            id="tab-python"
            onClick={() => setActiveTab('python')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'python'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Python Script</span>
          </button>

          <button
            id="tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Manual Pipeline Trigger Action Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {lastRunDate && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Latest: {lastRunDate}</span>
            </div>
          )}

          <button
            id="btn-run-pipeline"
            onClick={onRunPipeline}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-lg ${
              isRunning
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/25 active:scale-[0.98]'
            }`}
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running Pipeline...' : 'Run Pipeline Now'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
