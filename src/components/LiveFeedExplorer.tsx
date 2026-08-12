import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RSSFeed, NewsArticle } from '../types';
import {
  Globe,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Clock,
  BookOpen,
  X,
  Bookmark,
  Share2,
  Check,
  CheckCircle2,
  Download,
  Copy,
  FileCode,
  FileText,
  Printer,
  Type,
  ArrowRight
} from 'lucide-react';

interface LiveFeedExplorerProps {
  feeds: RSSFeed[];
  initialOpenExportDrawer?: boolean;
}

export const LiveFeedExplorer: React.FC<LiveFeedExplorerProps> = ({ feeds, initialOpenExportDrawer = false }) => {
  // Selection Types: 'all' | 'Global' | 'Alternative' | 'Finance' | 'Tech' | 'custom' | 'single'
  const [selectionType, setSelectionType] = useState<'all' | 'Global' | 'Alternative' | 'Finance' | 'Tech' | 'custom' | 'single'>('all');
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

  // Slide-Out Export Menu Drawer State
  const [isExportDrawerOpen, setIsExportDrawerOpen] = useState<boolean>(initialOpenExportDrawer);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge' | 'xxlarge'>('large');
  const [copiedDigest, setCopiedDigest] = useState<boolean>(false);

  useEffect(() => {
    if (initialOpenExportDrawer) {
      setIsExportDrawerOpen(true);
    }
  }, [initialOpenExportDrawer]);

  const handleCopyDigestText = () => {
    const text = articles.map((a, i) =>
      `[${i + 1}] ${a.title.toUpperCase()}\nSource: ${a.feedName || 'Global Source'} | Published: ${a.published || 'Today'}\nLink: ${a.link}\n\n${a.summary}\n----------------------------------------`
    ).join('\n\n');

    const fullDigest = `========================================================\nMASTER GLOBAL WIRE INTELLIGENCE DIGEST\nGenerated: ${new Date().toLocaleString()}\nTotal Stories: ${articles.length}\n========================================================\n\n${text}`;

    navigator.clipboard.writeText(fullDigest);
    setCopiedDigest(true);
    setTimeout(() => setCopiedDigest(false), 2000);
  };

  const handleDownloadHTML = () => {
    const storiesHtml = articles.map((a, i) => `
      <article style="border:1px solid #333; padding:20px; margin-bottom:20px; background:#111; border-radius:8px;">
        <div style="font-family:monospace; font-size:11px; color:#d97706; margin-bottom:10px;">
          #${i + 1} | ${a.feedName || 'Global Source'} | Published: ${a.published || 'Today'}
        </div>
        <h2 style="font-family:serif; color:#ffffff; margin-top:0; margin-bottom:12px;">${a.title}</h2>
        <p style="font-family:serif; color:#cccccc; line-height:1.6;">${a.summary}</p>
        ${a.link && a.link !== '#' ? `<p style="margin-top:16px; margin-bottom:0;"><a href="${a.link}" target="_blank" style="display:inline-flex; align-items:center; gap:8px; padding:6px 14px; background:rgba(220,38,38,0.15); color:#f87171; text-decoration:none; font-family:monospace; font-size:12px; font-weight:bold; border:1px solid rgba(220,38,38,0.3); border-radius:20px;"><span>Go to source</span><span style="display:inline-flex; align-items:center; justify-center; width:18px; height:18px; background:#dc2626; color:#ffffff; border-radius:50%; font-size:11px;">&rarr;</span></a></p>` : ''}
      </article>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Global Wire Intelligence Digest</title>
  <style>
    body { background: #0a0a0a; color: #ffffff; font-family: serif; padding: 40px; max-width: 900px; margin: 0 auto; }
    h1 { font-family: serif; border-bottom: 2px solid #d97706; padding-bottom: 10px; }
  </style>
</head>
<body>
  <h1>MASTER GLOBAL WIRE INTELLIGENCE DIGEST</h1>
  <p style="font-family:monospace; color:#888;">Generated on ${new Date().toLocaleString()} | Total Stories: ${articles.length}</p>
  <hr style="border-color:#222; margin-bottom:30px;" />
  ${storiesHtml}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `global-wire-digest-${new Date().toISOString().slice(0,10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const markdown = `# MASTER GLOBAL WIRE INTELLIGENCE DIGEST\n*Generated: ${new Date().toLocaleString()} | Total Stories: ${articles.length}*\n\n---\n\n` +
      articles.map((a, i) => `### ${i + 1}. ${a.title}\n**Source:** ${a.feedName || 'Global Source'} | **Published:** ${a.published || 'Today'} | [Original Source](${a.link})\n\n${a.summary}\n\n---`).join('\n\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `global-wire-digest-${new Date().toISOString().slice(0,10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Fetch all stories for complete export
  const handleFetchAllStoriesForExport = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/live-stories?feedIds=all&category=All&page=1&limit=200`);
      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          setArticles(data.articles);
        }
      }
    } catch (err) {
      console.error("Error loading all stories for export:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Intersection Observer sentinel ref for lazy loading
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Initialize custom feeds array to all enabled feeds on first load
  useEffect(() => {
    if ((feeds || []).length > 0 && (selectedCustomFeedIds || []).length === 0) {
      setSelectedCustomFeedIds((feeds || []).map(f => f.id));
      if (feeds[0]) setSelectedSingleFeedId(feeds[0].id);
    }
  }, [feeds]);

  // Construct target feed IDs parameter
  const getTargetFeedIds = useCallback(() => {
    if (selectionType === 'single' && selectedSingleFeedId) {
      return selectedSingleFeedId;
    }
    if (selectionType === 'custom') {
      return (selectedCustomFeedIds || []).length > 0 ? selectedCustomFeedIds.join(',') : 'none';
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
      const category = (['Global', 'Alternative', 'Finance', 'Tech'].includes(selectionType)) ? selectionType : 'All';

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

  useEffect(() => {
    setPage(1);
    fetchStories(1, true);
  }, [selectionType, selectedSingleFeedId, selectedCustomFeedIds, searchQuery]);

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStories(nextPage, false);
    }
  };

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

  const toggleCustomFeed = (feedId: string) => {
    setSelectedCustomFeedIds(prev =>
      prev.includes(feedId) ? prev.filter(id => id !== feedId) : [...prev, feedId]
    );
  };

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
      <div className="bg-[#0a0a0a] border border-white/10 p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Globe className="w-3 h-3" /> {feeds.length} Active Syndicated Feeds
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-white/10 text-white/70 border border-white/10">
              Alex Jones Live / AJN + Global Wire Active
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-white mt-2">
            Global Wire Intelligence Feed
          </h2>
          <p className="text-[11px] font-mono text-white/50 mt-1 uppercase tracking-widest">
            Real-time feed aggregation from syndicated global networks, Alex Jones Live / AJN scraper, and alternative wire feeds
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsExportDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-mono font-bold uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Slide-Out Export ({articles.length})</span>
          </button>

          <button
            onClick={() => fetchStories(1, true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-amber-500 text-black text-[10px] font-mono font-bold uppercase tracking-widest transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live Wire</span>
          </button>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="bg-[#0a0a0a] border border-white/10 p-5 space-y-4">
        {/* Row 1 */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectionType('all')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all ${
                selectionType === 'all'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-black text-white/60 border border-white/10 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 inline mr-1" />
              All Feeds ({feeds.length})
            </button>

            <button
              onClick={() => setSelectionType('Global')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all ${
                selectionType === 'Global'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-black text-white/60 border border-white/10 hover:text-white'
              }`}
            >
              Global ({feeds.filter(f => f.category === 'Global').length})
            </button>

            <button
              onClick={() => setSelectionType('Alternative')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all ${
                selectionType === 'Alternative'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-black text-white/60 border border-white/10 hover:text-white'
              }`}
            >
              Alternative ({feeds.filter(f => f.category === 'Alternative').length})
            </button>

            <button
              onClick={() => setSelectionType('Finance')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all ${
                selectionType === 'Finance'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-black text-white/60 border border-white/10 hover:text-white'
              }`}
            >
              Finance ({feeds.filter(f => f.category === 'Finance').length})
            </button>

            <button
              onClick={() => setSelectionType('Tech')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all ${
                selectionType === 'Tech'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-black text-white/60 border border-white/10 hover:text-white'
              }`}
            >
              Tech ({feeds.filter(f => f.category === 'Tech').length})
            </button>

            <button
              onClick={() => setSelectionType('custom')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all ${
                selectionType === 'custom'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-black text-white/60 border border-white/10 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5 inline mr-1" />
              Custom Selection ({selectedCustomFeedIds.length})
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wire articles..."
              className="w-full pl-9 pr-3 py-2 bg-black border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>

        {/* Row 2: Ingestion Handler */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500">Ingestion Strategy:</span>
            <div className="flex items-center gap-1 bg-black p-1 border border-white/10">
              <button
                onClick={() => setActiveSourceGroup('all')}
                className={`px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all ${
                  activeSourceGroup === 'all'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                All Pipeline Handlers
              </button>
              <button
                onClick={() => setActiveSourceGroup('rss')}
                className={`px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all ${
                  activeSourceGroup === 'rss'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                RSS / Atom Streams
              </button>
              <button
                onClick={() => setActiveSourceGroup('scraped')}
                className={`px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all ${
                  activeSourceGroup === 'scraped'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                HTML DOM Scrapers
              </button>
            </div>
          </div>

          <div className="text-white/40 font-mono text-[10px] uppercase tracking-widest">
            Showing <span className="text-amber-400 font-bold">{articles.filter(a => activeSourceGroup === 'all' || (a.sourceGroup || (a.ingestionType === 'scraper' ? 'scraped' : 'rss')) === activeSourceGroup).length}</span> stories
          </div>
        </div>

        {/* Custom Mix selector */}
        {selectionType === 'custom' && (
          <div className="bg-black p-4 border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500">
                Active Source Checklist ({selectedCustomFeedIds.length}/{feeds.length}):
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest">
                <button
                  onClick={() => setSelectedCustomFeedIds(feeds.map(f => f.id))}
                  className="text-amber-400 hover:underline"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedCustomFeedIds([])}
                  className="text-white/40 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-1">
              {feeds.map(f => {
                const isSelected = selectedCustomFeedIds.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleCustomFeed(f.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs text-left font-mono transition-all border ${
                      isSelected
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
                        : 'bg-[#0a0a0a] text-white/40 border-white/10 hover:text-white'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 flex items-center justify-center border ${
                      isSelected ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/20 bg-black'
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

        {/* Health Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 text-[10px] font-mono">
          <span className="text-white/40 uppercase tracking-widest shrink-0">Source Status:</span>
          {Object.entries(sourceStatuses).map(([id, rawInfo]) => {
            const info = rawInfo as { name: string; status: 'live' | 'cached'; count: number };
            return (
              <span
                key={id}
                className={`px-2 py-0.5 border flex items-center gap-1.5 shrink-0 ${
                  info.status === 'live'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-white/5 text-white/50 border-white/10'
                }`}
              >
                <span className={`w-1.5 h-1.5 ${info.status === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-white/40'}`} />
                <span>{info.name} ({info.count})</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Stories Grid */}
      <div id="stories-grid-container" className="space-y-6">
        {isLoading && page === 1 ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-16 text-center space-y-4">
            <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 animate-spin mx-auto" />
            <p className="text-xs font-mono text-white/60 uppercase tracking-widest">Parsing live syndicated feed items...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-12 text-center text-white/40 font-mono text-xs uppercase tracking-widest">
            NO STORIES MATCHING SELECTED FILTERS
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
                    className="bg-[#0a0a0a] border border-white/10 p-6 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xl group relative"
                  >
                    <div>
                      {/* Top Source Badge & Date */}
                      <div className="flex items-center justify-between gap-2 mb-3 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {art.feedName || 'News Source'}
                          </span>

                          <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest bg-white/10 text-white/70 border border-white/10">
                            {isScraper ? 'HTML Scraper' : 'RSS Stream'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/40 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-amber-500" />
                            {art.published || 'Today'}
                          </span>

                          <button
                            onClick={() => toggleBookmark(art.id)}
                            className={`p-1 transition-colors ${
                              isSaved ? 'text-amber-400' : 'text-white/30 hover:text-white'
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Story Title */}
                      <h3
                        onClick={() => setActiveStoryModal(art)}
                        className="font-serif font-bold text-white text-lg leading-snug mb-3 group-hover:text-amber-300 transition-colors cursor-pointer line-clamp-3"
                      >
                        {art.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-xs text-white/60 leading-relaxed line-clamp-4 font-serif">
                        {art.summary}
                      </p>
                    </div>

                    {/* Card Bottom Actions */}
                    <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setActiveStoryModal(art)}
                        className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-400 hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Inspect Article</span>
                      </button>

                      {art.link && art.link !== '#' && (
                        <a
                          href={art.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-600/30 rounded-full text-[10px] font-mono font-bold transition-all group"
                          title="Go to original source"
                        >
                          <span>Go to source</span>
                          <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center transition-transform group-hover:translate-x-0.5 shadow-sm">
                            <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Lazy Loading Sentinel */}
        <div ref={observerRef} className="pt-6 pb-4 flex flex-col items-center justify-center gap-3">
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono uppercase tracking-widest">
              <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
              <span>Fetching stream segment...</span>
            </div>
          )}

          {!isLoadingMore && hasMore && (
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-white hover:bg-amber-500 text-black font-mono font-bold text-[10px] uppercase tracking-widest transition-all"
            >
              Load Additional Wire Stories ({articles.length} of {totalCount})
            </button>
          )}
        </div>
      </div>

      {/* Expanded Story Detail Modal */}
      {activeStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0a0a0a] border border-white/10 max-w-2xl w-full p-8 space-y-6 relative">
            <button
              onClick={() => setActiveStoryModal(null)}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-black border border-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {activeStoryModal.feedName || 'News Source'}
              </span>
              <span className="text-[10px] text-white/40 font-mono">{activeStoryModal.published}</span>
            </div>

            <h2 className="font-serif font-bold text-2xl text-white leading-snug">
              {activeStoryModal.title}
            </h2>

            <div className="bg-black p-5 border border-white/10 text-xs font-serif text-white/80 leading-relaxed whitespace-pre-wrap">
              {activeStoryModal.summary}
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => handleCopyStoryLink(activeStoryModal.link)}
                className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-white/10 text-white text-[10px] font-mono font-bold uppercase tracking-widest border border-white/10 transition-colors"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied' : 'Copy Article Link'}</span>
              </button>

              {activeStoryModal.link && activeStoryModal.link !== '#' && (
                <a
                  href={activeStoryModal.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-600/30 rounded-full text-xs font-mono font-bold transition-all group"
                >
                  <span>Go to source</span>
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center transition-transform group-hover:translate-x-0.5 shadow-sm">
                    <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide-Out Export Drawer */}
      {isExportDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex justify-end transition-opacity duration-300">
          <div className="w-full max-w-4xl bg-[#0d0d0d] border-l border-white/10 h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/10 bg-black flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <Download className="w-3 h-3" /> Complete Digest Export Engine
                  </span>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-white/10 text-white/70 border border-white/10">
                    {articles.length} Stories Collected
                  </span>
                </div>
                <h2 className="font-serif font-bold text-2xl text-white mt-1.5">
                  Global Wire Intelligence Complete Digest
                </h2>
                <p className="text-[11px] font-mono text-white/50 mt-0.5 uppercase tracking-widest">
                  Full story aggregation release with custom font scale for readable page exports
                </p>
              </div>

              <button
                onClick={() => setIsExportDrawerOpen(false)}
                className="p-2 text-white/50 hover:text-white bg-black border border-white/10 transition-colors self-start sm:self-auto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Export Controls Bar */}
            <div className="p-4 bg-[#141414] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Font Scale Control */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5" /> Typography Scale:
                </span>
                <div className="flex items-center gap-1 bg-black p-1 border border-white/10 text-[10px] font-mono uppercase">
                  <button
                    onClick={() => setFontSize('normal')}
                    className={`px-2 py-1 ${fontSize === 'normal' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'}`}
                  >
                    100%
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`px-2 py-1 ${fontSize === 'large' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'}`}
                  >
                    125%
                  </button>
                  <button
                    onClick={() => setFontSize('xlarge')}
                    className={`px-2 py-1 ${fontSize === 'xlarge' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'}`}
                  >
                    150%
                  </button>
                  <button
                    onClick={() => setFontSize('xxlarge')}
                    className={`px-2 py-1 ${fontSize === 'xxlarge' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'}`}
                  >
                    175%
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleFetchAllStoriesForExport}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Fetch All Stories Across All Feeds</span>
                </button>

                <button
                  onClick={handleCopyDigestText}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-white/10 text-white border border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors"
                >
                  {copiedDigest ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDigest ? 'Copied Text' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={handleDownloadHTML}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-white/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Export HTML</span>
                </button>

                <button
                  onClick={handleDownloadMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-white/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export MD</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-mono font-bold uppercase tracking-wider transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            {/* Main Export Document Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-[#080808]" id="printable-export-area">
              {/* Release Title Banner */}
              <div className="p-6 border border-white/10 bg-black space-y-2 shadow-lg">
                <div className="flex justify-between items-center text-[10px] font-mono text-amber-500 uppercase tracking-widest border-b border-white/10 pb-2">
                  <span>OFFICIAL WIRE INTELLIGENCE RELEASE</span>
                  <span>DATE: {new Date().toLocaleDateString()}</span>
                </div>
                <h1 className="font-serif font-bold text-3xl text-white tracking-wide pt-2">
                  MASTER GLOBAL WIRE INTELLIGENCE DIGEST
                </h1>
                <p className="text-xs font-mono text-white/50 uppercase tracking-widest">
                  Aggregated Full-Text Document Containing {articles.length} Wire Stories Across Feeds
                </p>
              </div>

              {/* Complete Stories Document View */}
              <div className={`space-y-6 ${
                fontSize === 'xxlarge' ? 'text-xl leading-relaxed' : fontSize === 'xlarge' ? 'text-lg leading-relaxed' : fontSize === 'large' ? 'text-base leading-relaxed' : 'text-sm leading-normal'
              }`}>
                {articles.map((art, idx) => (
                  <div key={art.id || idx} className="p-6 border border-white/10 bg-black space-y-3 shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 text-[10px] font-mono text-white/40">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-bold">
                          #{idx + 1} &bull; {art.feedName || 'Global Source'}
                        </span>
                        <span className="uppercase text-white/60">
                          [{art.ingestionType === 'scraper' ? 'HTML Scraper' : 'RSS Stream'}]
                        </span>
                      </div>
                      <span>{art.published || 'Today'}</span>
                    </div>

                    <h2 className={`font-serif font-bold text-white ${
                      fontSize === 'xxlarge' ? 'text-3xl' : fontSize === 'xlarge' ? 'text-2xl' : fontSize === 'large' ? 'text-xl' : 'text-lg'
                    }`}>
                      {art.title}
                    </h2>

                    <p className="font-serif text-white/80 leading-relaxed whitespace-pre-wrap">
                      {art.summary}
                    </p>

                    {art.link && art.link !== '#' && (
                      <div className="pt-3 border-t border-white/10 flex items-center justify-start">
                        <a
                          href={art.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-600/30 rounded-full text-xs font-mono font-bold transition-all group shadow-sm"
                        >
                          <span>Go to source</span>
                          <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center transition-transform group-hover:translate-x-0.5 shadow">
                            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
