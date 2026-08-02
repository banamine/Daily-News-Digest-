import React, { useState } from 'react';
import { Rss, Plus, Trash2, CheckCircle2, AlertCircle, ExternalLink, Globe, Tag } from 'lucide-react';
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-xl text-slate-100 flex items-center gap-2">
            <Rss className="w-5 h-5 text-sky-400" />
            <span>News Sources &amp; RSS Feeds</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure the news sources scraped during every automated daily pipeline run.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategoryFilter === cat
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Feed Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Add Custom RSS Feed</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Feed Title / Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Associated Press"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">RSS Feed URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/rss.xml"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="Global">Global News</option>
                <option value="Tech">Tech &amp; Science</option>
                <option value="Alternative">Alternative &amp; Media</option>
                <option value="Finance">Finance &amp; Economy</option>
                <option value="Custom">Custom Source</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-sky-500/20 active:scale-98 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Source Feed</span>
            </button>
          </form>
        </div>

        {/* Active Feeds List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredFeeds.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
              No RSS feeds found matching the selected category.
            </div>
          ) : (
            filteredFeeds.map(feed => (
              <div
                key={feed.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl ${
                    feed.enabled
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    <Globe className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-100 text-sm truncate">{feed.name}</h4>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                        {feed.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono truncate max-w-md mt-0.5">
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
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>

                  <button
                    onClick={() => onDeleteFeed(feed.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
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
