import React, { useState } from 'react';
import { Newspaper, Eye, Code, Sparkles, Download, Copy, Check, ExternalLink, RefreshCw, Layers, Calendar, Image as ImageIcon } from 'lucide-react';
import { BriefingData } from '../types';

interface BriefingViewerProps {
  briefing: BriefingData | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export const BriefingViewer: React.FC<BriefingViewerProps> = ({ briefing, onRefresh, isLoading }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'stories' | 'prompt' | 'html'>('preview');
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div id="briefing-loading" className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-sky-500/20 border-t-sky-500 animate-spin mb-4" />
        <h3 className="font-semibold text-slate-200 text-sm">Loading Latest Briefing...</h3>
        <p className="text-xs text-slate-400 mt-1">Fetching today's summaries and generated images</p>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div id="briefing-empty" className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mx-auto mb-4">
          <Newspaper className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-slate-100 text-lg">No Briefing Generated Today</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          Click the "Run Pipeline Now" button in the top right header to fetch news, summarize stories with Gemini LLM, generate a cinematic image, and assemble today's HTML briefing.
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

  return (
    <div id="briefing-viewer-container" className="space-y-6">
      {/* Top Controls & Meta Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {briefing.date}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {briefing.articles.length} Stories Included
            </span>
          </div>
          <h2 className="font-extrabold text-xl md:text-2xl text-slate-100 mt-2 tracking-tight">
            Daily Intelligence Briefing
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generated automatically via Google Gemini LLM &amp; Gemini Image Model
          </p>
        </div>

        {/* View Mode Selector Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              id="view-preview"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'preview' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Page Preview</span>
            </button>

            <button
              id="view-stories"
              onClick={() => setViewMode('stories')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'stories' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Summaries</span>
            </button>

            <button
              id="view-prompt"
              onClick={() => setViewMode('prompt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'prompt' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Image Prompt</span>
            </button>

            <button
              id="view-html"
              onClick={() => setViewMode('html')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'html' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>HTML Source</span>
            </button>
          </div>

          <button
            id="btn-download-html"
            onClick={handleDownloadHtml}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all active:scale-95"
            title="Download complete HTML briefing file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export HTML</span>
          </button>
        </div>
      </div>

      {/* Main Content Area depending on viewMode */}
      {viewMode === 'preview' && (
        <div id="preview-panel" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-xs font-mono text-slate-400 ml-2">output/{briefing.date}/index.html</span>
            </div>
            <button
              onClick={onRefresh}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              title="Refresh preview"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-2 md:p-6 bg-slate-950/40">
            <iframe
              title="Daily Briefing Rendered HTML"
              srcDoc={briefing.htmlContent}
              className="w-full min-h-[750px] border border-slate-800 rounded-xl bg-[#0b0f17] shadow-inner"
            />
          </div>
        </div>
      )}

      {viewMode === 'stories' && (
        <div id="stories-panel" className="space-y-4">
          {/* Hero Generated Image Preview */}
          {briefing.imageUrl && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  <span>Generated Hero Illustration</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Google Gemini Imagen</span>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <img
                  src={briefing.imageUrl}
                  alt="Hero generated news illustration"
                  className="w-full max-h-[450px] object-cover"
                />
              </div>
            </div>
          )}

          {/* Stories List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {briefing.articles.map((art, idx) => (
              <div key={art.id || idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {art.feedName || 'News Feed'}
                    </span>
                    <span className="text-[10px] text-slate-500">{art.published || 'Today'}</span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm leading-snug mb-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                {art.link && art.link !== '#' && (
                  <a
                    href={art.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 mt-4 pt-3 border-t border-slate-800/80 transition-colors"
                  >
                    <span>Read full original story</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'prompt' && (
        <div id="prompt-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Rich Master Image Prompt</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically constructed from today's news summaries and injected into the master cinematic template.
              </p>
            </div>
            <button
              onClick={() => handleCopyCode(briefing.imagePrompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Prompt' : 'Copy Prompt'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-sky-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
            {briefing.imagePrompt}
          </pre>
        </div>
      )}

      {viewMode === 'html' && (
        <div id="html-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Code className="w-4 h-4 text-sky-400" />
                <span>Generated HTML Output Code</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready to publish or host on GitHub Pages, Vercel, Netlify, or static server.
              </p>
            </div>
            <button
              onClick={() => handleCopyCode(briefing.htmlContent)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied HTML' : 'Copy HTML'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[550px]">
            {briefing.htmlContent}
          </pre>
        </div>
      )}
    </div>
  );
};
