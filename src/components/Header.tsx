import React from 'react';
import { Newspaper, Play, Rss, Archive, Code, Settings, Sparkles, CheckCircle2, Shield, Globe, Zap, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: 'briefing' | 'live-feeds' | 'scraper' | 'feeds' | 'archive' | 'python' | 'prebuilds' | 'settings';
  setActiveTab: (tab: 'briefing' | 'live-feeds' | 'scraper' | 'feeds' | 'archive' | 'python' | 'prebuilds' | 'settings') => void;
  onRunPipeline: () => void;
  onOpenExportPage?: () => void;
  isRunning: boolean;
  lastRunDate: string | null;
  activeFeedsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunPipeline,
  onOpenExportPage,
  isRunning,
  lastRunDate,
  activeFeedsCount
}) => {
  return (
    <header id="main-header" className="bg-[#0a0a0a] border-b border-white/10 sticky top-0 z-30 px-4 lg:px-10 py-4 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
        {/* App Title & Branding */}
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center font-serif font-bold text-black text-lg shrink-0 shadow-md">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-bold uppercase tracking-widest text-white">The Sentinel Brief</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Gemini 3.6
              </span>
            </div>
            <p className="text-[10px] text-amber-500 font-mono tracking-widest uppercase mt-0.5">Automated Intelligence Synthesis</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav id="nav-tabs" className="flex items-center gap-1 bg-black/80 p-1.5 rounded-lg border border-white/10 w-full xl:w-auto overflow-x-auto">
          <button
            id="tab-briefing"
            onClick={() => setActiveTab('briefing')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'briefing'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Today's Briefing</span>
          </button>

          <button
            id="tab-live-feeds"
            onClick={() => setActiveTab('live-feeds')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'live-feeds'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Live Feeds</span>
          </button>

          <button
            id="tab-scraper"
            onClick={() => setActiveTab('scraper')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'scraper'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Scraping Strategy</span>
          </button>

          <button
            id="tab-feeds"
            onClick={() => setActiveTab('feeds')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'feeds'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Rss className="w-3.5 h-3.5" />
            <span>RSS Feeds</span>
            <span className={`ml-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono ${activeTab === 'feeds' ? 'bg-black/20 text-black' : 'bg-white/10 text-amber-400'}`}>
              {activeFeedsCount}
            </span>
          </button>

          <button
            id="tab-archive"
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'archive'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archives</span>
          </button>

          <button
            id="tab-python"
            onClick={() => setActiveTab('python')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'python'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Python Script</span>
          </button>

          <button
            id="tab-prebuilds"
            onClick={() => setActiveTab('prebuilds')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'prebuilds'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Prebuild Config</span>
          </button>

          <button
            id="tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Manual Pipeline Trigger Action Button */}
        <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
          {lastRunDate && (
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-white/50 bg-white/5 px-3 py-1.5 rounded border border-white/10 uppercase tracking-widest">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span>Sync: {lastRunDate}</span>
            </div>
          )}

          {onOpenExportPage && (
            <button
              onClick={onOpenExportPage}
              className="flex items-center gap-2 px-3.5 py-2 text-[10px] uppercase font-mono font-bold tracking-widest bg-amber-500 hover:bg-amber-400 text-black transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Menu</span>
            </button>
          )}

          <button
            id="btn-run-pipeline"
            onClick={onRunPipeline}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase font-mono font-bold tracking-widest transition-all ${
              isRunning
                ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                : 'bg-white hover:bg-amber-500 text-black active:scale-[0.98]'
            }`}
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Synthesizing...' : 'Run Sync Cycle'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

