import React, { useState } from 'react';
import { Newspaper, Eye, Code, Sparkles, Download, Copy, Check, ExternalLink, RefreshCw, Layers, Calendar, Globe, CheckCircle2 } from 'lucide-react';
import { BriefingData } from '../types';

interface BriefingViewerProps {
  briefing: BriefingData | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export const BriefingViewer: React.FC<BriefingViewerProps> = ({ briefing, onRefresh, isLoading }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'stories' | 'prompt' | 'html'>('preview');
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div id="briefing-loading" className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mb-4" />
        <h3 className="font-serif text-lg text-white">Synthesizing Today's Intelligence...</h3>
        <p className="text-xs font-mono text-amber-500/80 mt-1 uppercase tracking-widest">Parsing Feeds • Gemini Summarization • Visual Rendering</p>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div id="briefing-empty" className="bg-[#0a0a0a] border border-white/10 p-12 text-center max-w-xl mx-auto my-12">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 rounded-full">
          <Newspaper className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-white uppercase tracking-wider">No Briefing Generated Today</h3>
        <p className="text-xs font-mono text-white/60 mt-3 max-w-md mx-auto leading-relaxed">
          Execute "Run Sync Cycle" in the navigation bar to pull active RSS feeds, generate concise Gemini 3.6 summaries, compile high-resolution artwork, and produce today's publication.
        </p>
      </div>
    );
  }

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([briefing.htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-briefing-${briefing.date}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePublishToGitHubIndex = async () => {
    setIsPublishing(true);
    setPublishMessage(null);
    try {
      const res = await fetch('/api/export/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: briefing.date,
          briefing,
          htmlContent: briefing.htmlContent
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPublishMessage(`Public GitHub index.html updated! Archived in ${data.archivePath || `data/archive/${briefing.date}/`}`);
        setTimeout(() => setPublishMessage(null), 6000);
      } else {
        setPublishMessage('Failed to publish index page');
      }
    } catch (err) {
      console.error('Publish error:', err);
      setPublishMessage('Network error during publish');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div id="briefing-viewer-container" className="space-y-6">
      {/* Top Controls & Meta Bar */}
      <div className="bg-[#0a0a0a] border border-white/10 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 uppercase tracking-widest">
              <Calendar className="w-3 h-3" /> {briefing.date}
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
              {briefing.articles?.length || 0} Stories Compiled
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
              Archive: data/archive/{briefing.date}/
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mt-2 tracking-wide">
            Daily Intelligence Synthesis
          </h2>
          <p className="text-[11px] font-mono text-white/50 mt-1 uppercase tracking-widest">
            Gemini 3.6 LLM • Public Index Publisher • Data Archiving Enabled
          </p>
        </div>

        {/* View Mode Selector Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-black p-1 border border-white/10">
            <button
              id="view-preview"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-all ${
                viewMode === 'preview' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>

            <button
              id="view-stories"
              onClick={() => setViewMode('stories')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-all ${
                viewMode === 'stories' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Summaries</span>
            </button>

            <button
              id="view-prompt"
              onClick={() => setViewMode('prompt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-all ${
                viewMode === 'prompt' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Artwork Prompt</span>
            </button>

            <button
              id="view-html"
              onClick={() => setViewMode('html')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-all ${
                viewMode === 'html' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>HTML Source</span>
            </button>
          </div>

          <button
            id="btn-publish-github-index"
            onClick={handlePublishToGitHubIndex}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-mono font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
            title="Publish HTML to root index.html for public viewing and archive in data/archive/"
          >
            {isPublishing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Globe className="w-3.5 h-3.5" />
            )}
            <span>{isPublishing ? 'Publishing...' : 'Publish to index.html'}</span>
          </button>

          <button
            id="btn-download-html"
            onClick={handleDownloadHtml}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[10px] font-mono font-bold uppercase tracking-widest transition-all active:scale-95"
            title="Download complete HTML briefing file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export File</span>
          </button>
        </div>
      </div>

      {/* Publish Notification Banner */}
      {publishMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{publishMessage}</span>
        </div>
      )}

      {/* Main Content Area depending on viewMode */}
      {viewMode === 'preview' && (
        <div id="preview-panel" className="bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl">
          <div className="bg-black px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block" />
              </div>
              <span className="text-[11px] font-mono text-amber-500/80 ml-2">publication/{briefing.date}/edition.html</span>
            </div>
            <button
              onClick={onRefresh}
              className="text-white/40 hover:text-amber-400 transition-colors"
              title="Refresh preview"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-2 md:p-6 bg-[#000000]">
            <iframe
              title="Daily Briefing Rendered HTML"
              srcDoc={briefing.htmlContent}
              className="w-full min-h-[800px] border border-white/10 bg-[#0f1115]"
            />
          </div>
        </div>
      )}

      {viewMode === 'stories' && (
        <div id="stories-panel" className="space-y-6">
          {/* Top Placement: Extracted Feed Photos Mixed Collage */}
          {(() => {
            const articlesList = briefing.articles || [];
            const articlesWithImages = articlesList.filter(a => a && a.imageUrl && typeof a.imageUrl === 'string' && a.imageUrl.length > 8);
            if (articlesWithImages.length === 0) return null;

            const fallbackImg = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
            const count = Math.min(articlesWithImages.length, 5);
            const displayArticles = articlesWithImages.slice(0, count);

            return (
              <div className="bg-[#0a0a0a] border border-white/10 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-mono">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-bold text-white uppercase tracking-wider">
                        Curated Visual Imagery
                      </h3>
                      <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                        Extracted media items from active syndicated streams ({count} source frame{count > 1 ? 's' : ''})
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                    Editorial Imagery
                  </span>
                </div>

                {/* Adaptive Layout Container */}
                {count === 1 ? (
                  <div className="relative group overflow-hidden border border-white/10 bg-black h-80">
                    <img
                      src={displayArticles[0].imageUrl}
                      alt={displayArticles[0].title || 'Hero Feed Photo'}
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
                      onError={(e) => { e.currentTarget.src = fallbackImg; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 flex flex-col justify-end">
                      <span className="self-start px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500 text-black mb-2 uppercase tracking-widest">
                        {displayArticles[0].feedName || 'Featured Wire'}
                      </span>
                      <h4 className="font-serif text-xl font-bold text-white">
                        {displayArticles[0].title}
                      </h4>
                    </div>
                  </div>
                ) : count === 2 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayArticles.map((art, idx) => (
                      <div key={idx} className="relative group overflow-hidden border border-white/10 bg-black h-64">
                        <img
                          src={art.imageUrl}
                          alt={art.title || 'Feed Photo'}
                          className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
                          onError={(e) => { e.currentTarget.src = fallbackImg; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end">
                          <span className="self-start px-2 py-0.5 text-[9px] font-mono font-bold bg-amber-500 text-black mb-1 uppercase tracking-widest">
                            {art.feedName || 'Wire Feed'}
                          </span>
                          <h4 className="font-serif text-sm font-bold text-white line-clamp-2">
                            {art.title}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* 3 to 5 items */
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Hero Tile */}
                    <div className="md:col-span-2 relative group overflow-hidden border border-white/10 bg-black h-full min-h-[260px]">
                      <img
                        src={displayArticles[0].imageUrl}
                        alt={displayArticles[0].title || 'Hero Feed Photo'}
                        className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
                        onError={(e) => { e.currentTarget.src = fallbackImg; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-5 flex flex-col justify-end">
                        <span className="self-start px-2 py-0.5 text-[9px] font-mono font-bold bg-amber-500 text-black mb-1.5 uppercase tracking-widest">
                          {displayArticles[0].feedName || 'Lead Story'}
                        </span>
                        <h4 className="font-serif text-lg font-bold text-white line-clamp-2">
                          {displayArticles[0].title}
                        </h4>
                      </div>
                    </div>

                    {/* Supporting Tiles */}
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                      {displayArticles.slice(1, 4).map((art, i) => (
                        <div key={i} className="relative group overflow-hidden border border-white/10 bg-black h-32">
                          <img
                            src={art.imageUrl}
                            alt={art.title || 'Feed Photo'}
                            className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
                            onError={(e) => { e.currentTarget.src = fallbackImg; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-3 flex flex-col justify-end">
                            <span className="self-start px-1.5 py-0.5 text-[8px] font-mono font-bold bg-white/20 text-white mb-1 uppercase tracking-widest">
                              {art.feedName || 'News'}
                            </span>
                            <p className="font-serif text-xs font-bold text-white line-clamp-1">
                              {art.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Stories List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(briefing.articles || []).map((art, idx) => (
              <div key={art.id || idx} className="bg-[#0a0a0a] border border-white/10 p-6 hover:border-amber-500/40 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                      {art.feedName || 'Wire Dispatch'}
                    </span>
                    <span className="text-[10px] font-mono text-white/40 uppercase">{art.published || 'Today'}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-400 leading-snug mb-3 transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed font-sans">
                    {art.summary}
                  </p>
                </div>

                {art.link && art.link !== '#' && (
                  <a
                    href={art.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-amber-400 hover:text-white mt-6 pt-4 border-t border-white/10 transition-colors"
                  >
                    <span>Read Original Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'prompt' && (
        <div id="prompt-panel" className="bg-[#0a0a0a] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Generative Master Artwork Prompt</span>
              </h3>
              <p className="text-[10px] font-mono text-amber-500/80 mt-1 uppercase tracking-widest">
                Synthesized by Gemini 3.6 for high-fidelity header artwork generation
              </p>
            </div>
            <button
              onClick={() => handleCopyCode(briefing.imagePrompt)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[10px] font-mono font-bold uppercase tracking-widest transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
            </button>
          </div>

          <pre className="p-5 bg-black border border-white/10 text-xs font-mono text-amber-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
            {briefing.imagePrompt}
          </pre>
        </div>
      )}

      {viewMode === 'html' && (
        <div id="html-panel" className="bg-[#0a0a0a] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-amber-400" />
                <span>Rendered HTML Output</span>
              </h3>
              <p className="text-[10px] font-mono text-white/50 mt-1 uppercase tracking-widest">
                Self-contained HTML5 file with embedded responsive styles &amp; typography
              </p>
            </div>
            <button
              onClick={() => handleCopyCode(briefing.htmlContent)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[10px] font-mono font-bold uppercase tracking-widest transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy HTML'}</span>
            </button>
          </div>

          <pre className="p-5 bg-black border border-white/10 text-xs font-mono text-white/80 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[550px]">
            {briefing.htmlContent}
          </pre>
        </div>
      )}
    </div>
  );
};
