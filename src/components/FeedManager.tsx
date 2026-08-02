import React, { useState } from 'react';
import { Rss, Plus, Trash2, Globe } from 'lucide-react';
import { RSSFeed } from '../types';

interface FeedManagerProps {
  feeds: RSSFeed[];
  onToggleFeed: (id: string, enabled: boolean) => void;
  onAddFeed: (name: string, url: string, category: 'Global' | 'Tech' | 'Alternative' | 'Finance' | 'Custom') => void;
  onDeleteFeed: (id: string) => void;
}

export const FeedManager: React.FC<FeedManagerProps> = ({
  feeds,
  onToggleFeed,
  onAddFeed,
  onDeleteFeed
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<'Global' | 'Tech' | 'Alternative' | 'Finance' | 'Custom'>('Custom');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onAddFeed(name.trim(), url.trim(), category);
    setName('');
    setUrl('');
  };

  const categories = ['All', 'Global', 'Tech', 'Alternative', 'Finance', 'Custom'];

  const filteredFeeds = selectedCategoryFilter === 'All'
    ? feeds
    : feeds.filter(f => f.category === selectedCategoryFilter);

  return (
    <div id="feed-manager-container" className="space-y-6 max-w-5xl mx-auto">
      {/* Header Info Banner */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-white flex items-center gap-2">
            <Rss className="w-5 h-5 text-amber-500" />
            <span>Syndicated News Sources</span>
          </h2>
          <p className="text-[11px] font-mono text-white/50 mt-1 uppercase tracking-widest">
            Configure RSS feeds scraped during automated daily intelligence cycles
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-black p-1 border border-white/10 overflow-x-auto w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all ${
                selectedCategoryFilter === cat
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Feed Form */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 space-y-4 h-fit">
          <h3 className="font-serif font-bold text-white text-base flex items-center gap-2 border-b border-white/10 pb-3">
            <Plus className="w-4 h-4 text-amber-500" />
            <span>Add Syndicated Source</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-1">Source Publication Title</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Financial Times"
                required
                className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-1">RSS Endpoint URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/feed.xml"
                required
                className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs text-amber-300 placeholder-white/30 focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-1">Taxonomy Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors font-mono uppercase"
              >
                <option value="Global">Global News</option>
                <option value="Tech">Tech &amp; Science</option>
                <option value="Alternative">Alternative Media</option>
                <option value="Finance">Finance &amp; Economy</option>
                <option value="Custom">Custom Source</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-white hover:bg-amber-500 text-black font-mono font-bold py-2.5 text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register Feed Source</span>
            </button>
          </form>
        </div>

        {/* Active Feeds List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredFeeds.length === 0 ? (
            <div className="bg-[#0a0a0a] border border-white/10 p-8 text-center text-white/40 font-mono text-xs">
              NO SYNDICATED FEEDS MATCHING CATEGORY FILTER
            </div>
          ) : (
            filteredFeeds.map(feed => (
              <div
                key={feed.id}
                className="bg-[#0a0a0a] border border-white/10 p-4 flex items-center justify-between gap-4 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2.5 border ${
                    feed.enabled
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-white/5 text-white/30 border-white/10'
                  }`}>
                    <Globe className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-white text-base truncate">{feed.name}</h4>
                      <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-white/10 text-white/70 border border-white/10">
                        {feed.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-500/70 font-mono truncate max-w-md mt-0.5">
                      {feed.url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={feed.enabled}
                      onChange={e => onToggleFeed(feed.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>

                  <button
                    onClick={() => onDeleteFeed(feed.id)}
                    className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Delete feed source"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
