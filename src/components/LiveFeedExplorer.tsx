import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RSSFeed, NewsArticle } from '../types';
import {
  Globe,
  Sliders,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Layers,
  ChevronDown,
  CheckCircle2,
  Clock,
  BookOpen,
  X,
  Sparkles,
  Bookmark,
  Share2,
  Check
} from 'lucide-react';

interface LiveFeedExplorerProps {
  feeds: RSSFeed[];
}

export const LiveFeedExplorer: React.FC<LiveFeedExplorerProps> = ({ feeds }) => {
  // Selection Types: 'all' | 'Global' | 'Alternative' | 'custom' | 'single'
  const [selectionType, setSelectionType] = useState<'all' | 'Global' | 'Alternative' | 'custom' | 'single'>('all');
  const [selectedSingleFeedId, setSelectedSingleFeedId] = useState<string>('');
  const [selectedCustomFeedIds, setSelectedCustomFeedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Articles & Pagination state
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [sourceStatuses, setSourceStatuses] = useState<Record<string, { name: string; status: 'live' | 'cached'; count: number }>>({});

  // Selected story for full modal view
  const [activeStoryModal, setActiveStoryModal] = useState<NewsArticle | null>(null);
  const [savedStories, setSavedStories] = useState<Set<string>>(new Set());
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Intersection Observer sentinel ref for lazy loading
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Initialize custom feeds array to all enabled feeds on first load
  useEffect(() => {
    if (feeds.length > 0 && selectedCustomFeedIds.length === 0) {
      setSelectedCustomFeedIds(feeds.map(f => f.id));
      if (feeds[0]) setSelectedSingleFeedId(feeds[0].id);
    }
  }, [feeds]);

  // Construct target feed IDs parameter
  const getTargetFeedIds = useCallback(() => {
    if (selectionType === 'single' && selectedSingleFeedId) {
      return selectedSingleFeedId;
    }
    if (selectionType === 'custom') {
      return selectedCustomFeedIds.length > 0 ? selectedCustomFeedIds.join(',') : 'none';
    }
    return 'all';
  }, [selectionType, selectedSingleFeedId, selectedCustomFeedIds]);

  // Group Filter state: 'all' | 'rss' | 'scraped'
  const [activeSourceGroup, setActiveSourceGroup] = useState<'all' | 'rss' | 'scraped'>('all');

  // Fetch live stories from backend API with asynchronous chunked batch DOM insertion
  const fetchStories = async (pageNum: number, isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const feedIds = getTargetFeedIds();
      const category = (selectionType === 'Global' || selectionType === 'Alternative') ? selectionType : 'All';

      const queryParams = new URLSearchParams({
        feedIds,
        category,
        page: pageNum.toString(),
        limit: '12',
        search: searchQuery
      });

      const res = await fetch(`/api/live-stories?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch live stories');

      const data = await res.json();
      const incoming: NewsArticle[] = data.articles || [];

      if (isInitial) {
        // Chunked batch insertion via requestAnimationFrame to avoid main-thread blocking
        setArticles([]);
        if (incoming.length > 0) {
          const chunkSize = 3;
          let index = 0;
          const renderBatch = () => {
            const nextBatch = incoming.slice(index, index + chunkSize);
            if (nextBatch.length > 0) {
              setArticles(prev => [...prev, ...nextBatch]);
              index += chunkSize;
              if (index < incoming.length) {
                requestAnimationFrame(renderBatch);
              }
            }
          };
          requestAnimationFrame(renderBatch);
        }
      } else {
        // Append new stories smoothly using requestAnimationFrame chunking
        const chunkSize = 3;
        let index = 0;
        const renderBatch = () => {
          const nextBatch = incoming.slice(index, index + chunkSize);
          if (nextBatch.length > 0) {
            setArticles(prev => {
              const existingIds = new Set(prev.map(a => a.id));
              const newUnique = nextBatch.filter((a: NewsArticle) => !existingIds.has(a.id));
              return [...prev, ...newUnique];
            });
            index += chunkSize;
            if (index < incoming.length) {
              requestAnimationFrame(renderBatch);
            }
          }
        };
        requestAnimationFrame(renderBatch);
      }

      setHasMore(data.hasMore || false);
      setTotalCount(data.totalCount || 0);
      if (data.sourceStatuses) setSourceStatuses(data.sourceStatuses);
    } catch (err) {
      console.error("Error loading live feeds:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Re-fetch when filter selection, custom feeds, or search query changes
  useEffect(() => {
    setPage(1);
    fetchStories(1, true);
  }, [selectionType, selectedSingleFeedId, selectedCustomFeedIds, searchQuery]);

  // Handle Load More (Lazy Loading trigger)
  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStories(nextPage, false);
    }
  };

  // Intersection Observer setup for automatic infinite scroll lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, page]);

  // Toggle custom feed selection
  const toggleCustomFeed = (feedId: string) => {
    setSelectedCustomFeedIds(prev =>
      prev.includes(feedId) ? prev.filter(id => id !== feedId) : [...prev, feedId]
    );
  };

  // Bookmark / Save story locally
  const toggleBookmark = (id: string) => {
    setSavedStories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyStoryLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div id="live-feed-explorer" className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Heading */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> 11 Baked-In Global Feeds
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Lazy Loading Enabled
            </span>
          </div>
          <h2 className="font-extrabold text-2xl text-slate-100 tracking-tight mt-2">
            Global &amp; Custom Live Feed Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse live stories from baked-in global news networks (BBC, Reuters, Daily Mail UK, NY Post, 100% Fed Up, The Federalist, The Blaze, Hot Air, Judicial Watch, American Thinker, Epoch Times, and Alex Jones Live).
          </p>
        </div>

        <button
          onClick={() => fetchStories(1, true)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all active:scale-95 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh All Feeds</span>
        </button>
      </div>

      {/* Selection Types, Source Handler Groups & Search Bar Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        {/* Row 1: Source Selection Presets */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          {/* Preset Selection Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectionType('all')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectionType === 'all'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>All 11+ Sources</span>
            </button>

            <button
              onClick={() => setSelectionType('Global')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectionType === 'Global'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <span>Global Media</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800">4</span>
            </button>

            <button
              onClick={() => setSelectionType('Alternative')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectionType === 'Alternative'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <span>Alternative &amp; Opinion</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800">8</span>
            </button>

            <button
              onClick={() => setSelectionType('custom')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectionType === 'custom'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Custom Mix ({selectedCustomFeedIds.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live stories..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
            />
          </div>
        </div>

        {/* Row 2: Ingestion Handler Segment Selector (RSS vs HTML Scraper Boundary) */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Ingestion Handler:</span>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveSourceGroup('all')}
                className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                  activeSourceGroup === 'all'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Ingestion Handlers
              </button>
              <button
                onClick={() => setActiveSourceGroup('rss')}
                className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                  activeSourceGroup === 'rss'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                RSS / Atom Feeds
              </button>
              <button
                onClick={() => setActiveSourceGroup('scraped')}
                className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                  activeSourceGroup === 'scraped'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                HTML Scrapers
              </button>
            </div>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            Displaying <span className="text-sky-400 font-bold">{articles.filter(a => activeSourceGroup === 'all' || (a.sourceGroup || (a.ingestionType === 'scraper' ? 'scraped' : 'rss')) === activeSourceGroup).length}</span> items
          </div>
        </div>

        {/* Selection Sub-Panels */}
        {selectionType === 'single' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Select Source to Full Display:</span>
            </div>
            <select
              value={selectedSingleFeedId}
              onChange={e => setSelectedSingleFeedId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs font-semibold text-sky-400 focus:outline-none focus:border-sky-500 w-full md:w-80 cursor-pointer"
            >
              {feeds.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.category})
                </option>
              ))}
            </select>
          </div>
        )}

        {selectionType === 'custom' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                Check Sources to Include in Custom Feed ({selectedCustomFeedIds.length}/{feeds.length} selected):
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  onClick={() => setSelectedCustomFeedIds(feeds.map(f => f.id))}
                  className="text-sky-400 hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-600">&bull;</span>
                <button
                  onClick={() => setSelectedCustomFeedIds([])}
                  className="text-slate-400 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
              {feeds.map(f => {
                const isSelected = selectedCustomFeedIds.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleCustomFeed(f.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left font-medium transition-all ${
                      isSelected
                        ? 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                        : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                      isSelected ? 'bg-sky-500 border-sky-400 text-white' : 'border-slate-700 bg-slate-950'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{f.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Source Health Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 text-[11px] font-mono">
          <span className="text-slate-500 shrink-0 font-sans text-xs">Active Source Feeds:</span>
          {Object.entries(sourceStatuses).map(([id, rawInfo]) => {
            const info = rawInfo as { name: string; status: 'live' | 'cached'; count: number };
            return (
              <span
                key={id}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 shrink-0 ${
                  info.status === 'live'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${info.status === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                <span>{info.name} ({info.count})</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Stories Grid with Flex Space */}
      <div id="stories-grid-container" className="space-y-6">
        {isLoading && page === 1 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-4">
            <div className="w-10 h-10 rounded-full border-2 border-sky-500/20 border-t-sky-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-300 font-medium">Connecting and parsing live stories from news feeds...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No stories found matching your selected feed filter or search query.
          </div>
        ) : articles.filter(a => activeSourceGroup === 'all' || (a.sourceGroup || (a.ingestionType === 'scraper' ? 'scraped' : 'rss')) === activeSourceGroup).length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No stories found matching the active ingestion handler ({activeSourceGroup}).
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles
              .filter(a => activeSourceGroup === 'all' || (a.sourceGroup || (a.ingestionType === 'scraper' ? 'scraped' : 'rss')) === activeSourceGroup)
              .map((art, idx) => {
                const isSaved = savedStories.has(art.id);
                const isScraper = art.ingestionType === 'scraper' || art.sourceGroup === 'scraped';

                return (
                  <div
                    key={art.id || idx}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-sky-500/40 transition-all flex flex-col justify-between shadow-lg group hover:shadow-sky-500/5 relative"
                  >
                    <div>
                      {/* Top Source Badge, Ingestion Type Badge & Date */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            art.category === 'Global'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}>
                            {art.feedName || 'News Source'}
                          </span>

                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold border ${
                            isScraper
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                          }`}>
                            {isScraper ? 'HTML Scraper' : 'RSS Feed'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-600" />
                            {art.published || 'Today'}
                          </span>

                          <button
                            onClick={() => toggleBookmark(art.id)}
                            className={`p-1 rounded-md transition-colors ${
                              isSaved ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                            }`}
                            title={isSaved ? "Saved to bookmarks" : "Save story"}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                    {/* Story Title */}
                    <h3
                      onClick={() => setActiveStoryModal(art)}
                      className="font-bold text-slate-100 text-base leading-snug mb-2.5 group-hover:text-sky-300 transition-colors cursor-pointer line-clamp-3"
                    >
                      {art.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                      {art.summary}
                    </p>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setActiveStoryModal(art)}
                      className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Full Story View</span>
                    </button>

                    {art.link && art.link !== '#' && (
                      <a
                        href={art.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-slate-800 transition-colors"
                        title="Open direct original article link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lazy Loading Sentinel & Load More Action */}
        <div ref={observerRef} className="pt-6 pb-4 flex flex-col items-center justify-center gap-3">
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
              <div className="w-4 h-4 rounded-full border-2 border-sky-400/30 border-t-sky-400 animate-spin" />
              <span>Lazy loading more stories from source feeds...</span>
            </div>
          )}

          {!isLoadingMore && hasMore && (
            <button
              onClick={handleLoadMore}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all shadow-md active:scale-95"
            >
              Load More Stories ({articles.length} of {totalCount} displayed)
            </button>
          )}

          {!hasMore && articles.length > 0 && (
            <p className="text-xs text-slate-500 font-mono">
              &bull; All available stories loaded across selected news sources &bull;
            </p>
          )}
        </div>
      </div>

      {/* Expanded Story Detail Reader Modal */}
      {activeStoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveStoryModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 bg-slate-800/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {activeStoryModal.feedName || 'News Source'}
              </span>
              <span className="text-xs text-slate-400 font-mono">{activeStoryModal.published}</span>
            </div>

            <h2 className="font-extrabold text-xl text-slate-100 leading-snug">
              {activeStoryModal.title}
            </h2>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {activeStoryModal.summary}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleCopyStoryLink(activeStoryModal.link)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied' : 'Copy Article Link'}</span>
              </button>

              {activeStoryModal.link && activeStoryModal.link !== '#' && (
                <a
                  href={activeStoryModal.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs rounded-xl transition-all shadow-md active:scale-95"
                >
                  <span>Visit Full Article Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
