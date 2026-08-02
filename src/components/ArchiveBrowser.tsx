import React, { useState } from 'react';
import { Archive, Search, ChevronRight, Newspaper, Image as ImageIcon } from 'lucide-react';
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
      <div className="bg-[#0a0a0a] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-white flex items-center gap-2">
            <Archive className="w-5 h-5 text-amber-500" />
            <span>Edition Archives</span>
          </h2>
          <p className="text-[11px] font-mono text-white/50 mt-1 uppercase tracking-widest">
            Browse and review historical daily publications and generated artwork
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search dates or headlines..."
            className="w-full bg-black border border-white/10 pl-9 pr-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500 transition-colors font-mono"
          />
        </div>
      </div>

      {/* Grid of Past Briefings */}
      {filteredBriefings.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-white/10 p-12 text-center text-white/40 font-mono text-xs uppercase tracking-widest">
          No archived editions matching your search parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBriefings.map(b => (
            <div
              key={b.id}
              className="bg-[#0a0a0a] border border-white/10 overflow-hidden hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-xl"
            >
              {/* Thumbnail Image */}
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
                <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 border border-white/10 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                  {b.date}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-1">
                    <Newspaper className="w-3 h-3 text-amber-500" />
                    <span>{b.articles?.length || 0} Stories Compiled</span>
                  </div>
                  <p className="font-serif text-sm text-white/80 line-clamp-3 leading-relaxed mt-2">
                    {b.rawSummaryText.replace(/###/g, '').replace(/\*\*/g, '').slice(0, 180)}...
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-white/40 font-mono">
                    publication/{b.date}
                  </span>

                  <button
                    onClick={() => onSelectBriefing(b)}
                    className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest font-bold text-amber-400 hover:text-white transition-colors"
                  >
                    <span>Inspect Edition</span>
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
