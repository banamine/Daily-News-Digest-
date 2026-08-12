import React, { useState, useEffect } from 'react';
import { Archive, Search, ChevronRight, Newspaper, Image as ImageIcon, Globe, Folder, CheckCircle2, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { BriefingData } from '../types';

interface ArchiveBrowserProps {
  briefings: BriefingData[];
  onSelectBriefing: (briefing: BriefingData) => void;
}

export const ArchiveBrowser: React.FC<ArchiveBrowserProps> = ({ briefings, onSelectBriefing }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeViewMode, setActiveViewMode] = useState<'editions' | 'articles'>('editions');
  const [searchResults, setSearchResults] = useState<{
    query: string;
    briefings: BriefingData[];
    matchingArticles: any[];
  }>({ query: '', briefings: [], matchingArticles: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [publishedStatus, setPublishedStatus] = useState<Record<string, boolean>>({});

  // Trigger search on backend for dedicated data archive
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ query: '', briefings: [], matchingArticles: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/archive/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults({
            query: data.query || '',
            briefings: data.briefings || [],
            matchingArticles: data.matchingArticles || []
          });
        }
      } catch (err) {
        console.error('Error searching archive:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Publish specific archived briefing to root index.html
  const handlePublishToRootIndex = async (b: BriefingData, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/export/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: b.date,
          briefing: b,
          htmlContent: b.htmlContent
        })
      });

      if (res.ok) {
        setPublishedStatus(prev => ({ ...prev, [b.date]: true }));
        setTimeout(() => {
          setPublishedStatus(prev => ({ ...prev, [b.date]: false }));
        }, 3000);
      }
    } catch (err) {
      console.error('Error publishing archived edition to root index:', err);
    }
  };

  // Filtered local briefings if no backend query
  const displayBriefings = searchQuery.trim()
    ? searchResults.briefings
    : briefings;

  return (
    <div id="archive-browser-container" className="space-y-6 max-w-7xl mx-auto">
      {/* Search & Header Banner */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Folder className="w-3 h-3" /> Dedicated Folder: data/archive/
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-white/10 text-white/70 border border-white/10">
              {(briefings || []).length} Saved Edition{(briefings || []).length === 1 ? '' : 's'}
            </span>
          </div>

          <h2 className="font-serif font-bold text-2xl text-white mt-2 flex items-center gap-2">
            <Archive className="w-6 h-6 text-amber-500" />
            <span>Dedicated News Archive &amp; Retrieval Engine</span>
          </h2>
          <p className="text-[11px] font-mono text-white/50 mt-1 uppercase tracking-widest">
            Search older news items, retrieve archived publications from <span className="text-amber-400">data/archive/</span>, and republish to public GitHub <span className="text-amber-400">index.html</span>
          </p>
        </div>

        {/* View Mode & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Mode Switcher */}
          <div className="flex items-center bg-black p-1 border border-white/10 shrink-0">
            <button
              onClick={() => setActiveViewMode('editions')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all ${
                activeViewMode === 'editions' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              Editions ({(displayBriefings || []).length})
            </button>
            <button
              onClick={() => setActiveViewMode('articles')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all ${
                activeViewMode === 'articles' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              Article Search ({(searchResults?.matchingArticles || []).length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search older news items..."
              className="w-full bg-black border border-white/10 pl-9 pr-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500 transition-colors font-mono"
            />
            {isSearching && (
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin absolute right-3 top-2.5" />
            )}
          </div>
        </div>
      </div>

      {/* Main View: Editions Grid vs Deep Article Results */}
      {activeViewMode === 'editions' ? (
        (displayBriefings || []).length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-12 text-center text-white/40 font-mono text-xs uppercase tracking-widest space-y-2">
            <div>NO ARCHIVED EDITIONS MATCHING "{searchQuery}"</div>
            <p className="text-[10px] text-white/30">
              Each time the news cycle runs, the previous page is archived in <code className="text-amber-500">data/archive/YYYY-MM-DD/</code> for retrieval.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(displayBriefings || []).map(b => {
              const isPublishedNow = publishedStatus[b.date];
              return (
                <div
                  key={b.id || b.date}
                  className="bg-[#0a0a0a] border border-white/10 overflow-hidden hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-xl"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative h-48 bg-black overflow-hidden border-b border-white/10">
                    {b.imageUrl ? (
                      <img
                        src={b.imageUrl}
                        alt={`Briefing thumbnail for ${b.date}`}
                        className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3 bg-black/90 px-2.5 py-1 border border-white/10 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Folder className="w-3 h-3 text-amber-500" />
                      <span>{b.date}</span>
                    </div>

                    <div className="absolute top-3 right-3 bg-black/80 px-2 py-0.5 border border-white/10 text-[9px] font-mono text-white/70 uppercase">
                      {b.articles?.length || 0} Stories
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-1">
                        <Newspaper className="w-3.5 h-3.5 text-amber-500" />
                        <span>Daily Publication Snapshot</span>
                      </div>
                      <p className="font-serif text-sm text-white/80 line-clamp-3 leading-relaxed mt-2">
                        {(b.rawSummaryText || '').replace(/###/g, '').replace(/\*\*/g, '').slice(0, 180)}...
                      </p>
                    </div>

                    {/* Dedicated Folder Path Badge */}
                    <div className="p-2.5 bg-black border border-white/10 rounded text-[10px] font-mono text-white/50 space-y-1">
                      <div className="flex items-center justify-between text-amber-400/90 font-bold">
                        <span>Archive Location:</span>
                        <span>data/archive/{b.date}/</span>
                      </div>
                      <div className="text-[9px] text-white/40 truncate">
                        &bull; index.html &bull; data.json
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                      <button
                        onClick={(e) => handlePublishToRootIndex(b, e)}
                        className={`px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                          isPublishedNow
                            ? 'bg-emerald-500 text-black'
                            : 'bg-white/10 hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/30'
                        }`}
                        title="Publish this archived briefing to root index.html for public viewing on GitHub"
                      >
                        {isPublishedNow ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Published to index.html</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3.5 h-3.5" />
                            <span>Publish to index.html</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onSelectBriefing(b)}
                        className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-widest font-bold text-amber-400 hover:text-white transition-colors py-1.5"
                      >
                        <span>Inspect Edition</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Deep Article Search View across all saved news items in data/archive/ */
        <div className="space-y-4">
          <div className="p-4 bg-[#0a0a0a] border border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-white/60">
              Found <span className="text-amber-400 font-bold">{(searchResults?.matchingArticles || []).length}</span> archived news articles matching <span className="text-white font-bold">"{searchQuery}"</span>
            </span>
            <span className="text-amber-500/80 uppercase tracking-widest text-[10px]">
              Deep Search &bull; data/archive/
            </span>
          </div>

          {(searchResults?.matchingArticles || []).length === 0 ? (
            <div className="bg-[#0a0a0a] border border-white/10 p-12 text-center text-white/40 font-mono text-xs uppercase tracking-widest">
              NO MATCHING ARTICLES FOUND IN ARCHIVED DATA FOLDER
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(searchResults?.matchingArticles || []).map((art, idx) => (
                <div key={idx} className="bg-[#0a0a0a] border border-white/10 p-5 space-y-3 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center justify-between text-[10px] font-mono border-b border-white/10 pb-2">
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-bold">
                      Edition: {art.editionDate}
                    </span>
                    <span className="text-white/40">{art.feedName || 'Archived Wire'}</span>
                  </div>

                  <h3 className="font-serif font-bold text-white text-base leading-snug">
                    {art.title}
                  </h3>

                  <p className="font-serif text-xs text-white/70 line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-white/40">{art.archivePath}</span>
                    {art.link && art.link !== '#' && (
                      <a
                        href={art.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:text-white flex items-center gap-1 uppercase tracking-wider"
                      >
                        <span>Original Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
