import React, { useState } from 'react';
import { Archive, Calendar, Eye, Download, Search, FileText, ChevronRight, Newspaper, Image as ImageIcon } from 'lucide-react';
import { BriefingData } from '../types';

interface ArchiveBrowserProps {
  briefings: BriefingData[];
  onSelectBriefing: (briefing: BriefingData) => void;
}

export const ArchiveBrowser: React.FC<ArchiveBrowserProps> = ({ briefings, onSelectBriefing }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBriefings = briefings.filter(b => {
    const q = searchQuery.toLowerCase();
    return b.date.includes(q) || b.rawSummaryText.toLowerCase().includes(q);
  });

  return (
    <div id="archive-browser-container" className="space-y-6 max-w-6xl mx-auto">
      {/* Search & Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-xl text-slate-100 flex items-center gap-2">
            <Archive className="w-5 h-5 text-sky-400" />
            <span>Daily Briefing Archives</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse and download historical daily news pages and generated illustrations.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search dates or stories..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid of Past Briefings */}
      {filteredBriefings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
          No archived briefings match your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBriefings.map(b => (
            <div
              key={b.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group shadow-lg"
            >
              {/* Thumbnail Image */}
              <div className="relative h-44 bg-slate-950 overflow-hidden border-b border-slate-800">
                {b.imageUrl ? (
                  <img
                    src={b.imageUrl}
                    alt={`Briefing thumbnail for ${b.date}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-bold text-sky-400">
                  {b.date}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 mb-1">
                    <Newspaper className="w-3 h-3 text-sky-400" />
                    <span>{b.articles?.length || 0} Stories Summarized</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                    {b.rawSummaryText.replace(/###/g, '').replace(/\*\*/g, '').slice(0, 180)}...
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    output/{b.date}/index.html
                  </span>

                  <button
                    onClick={() => onSelectBriefing(b)}
                    className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <span>View Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
