
import React, { useState } from 'react';
import { Bookmark } from '../types';
import { generateDetailedSummary } from '../services/geminiService';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const domain = new URL(bookmark.url).hostname;
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  const handleToggleSummary = async (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;

    const nextState = !isExpanded;
    setIsExpanded(nextState);

    if (nextState && !summary && !isLoading) {
      setIsLoading(true);
      try {
        const aiSummary = await generateDetailedSummary(bookmark.url, bookmark.title);
        setSummary(aiSummary);
      } catch (err) {
        setSummary("Failed to fetch summary.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div 
      onClick={handleToggleSummary}
      className={`group glass-effect rounded-2xl p-5 border transition-all duration-300 transform cursor-pointer ${
        isExpanded ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-800 hover:border-slate-700 hover:-translate-y-1'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-700 shadow-inner">
            <img 
              src={favicon} 
              alt="" 
              className="w-6 h-6 object-contain" 
              onError={(e) => (e.currentTarget.src = 'https://picsum.photos/40/40')} 
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-100 line-clamp-1 group-hover:text-blue-400 transition-colors">
              {bookmark.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{domain}</span>
              <span className="text-[10px] text-slate-600 font-medium bg-slate-800 px-1.5 rounded">{bookmark.readingTime || '2 min'}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(bookmark.id); }}
          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-all text-slate-500"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">
        {bookmark.description}
      </p>

      {/* AI Summary Section */}
      <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-64 mb-4' : 'max-h-0'}`}>
        <div className="bg-blue-600/5 border border-blue-500/20 rounded-xl p-4 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Deep Analysis</span>
          </div>
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-2 bg-blue-500/20 rounded w-full"></div>
              <div className="h-2 bg-blue-500/20 rounded w-4/5"></div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-300 leading-relaxed italic mb-3">"{summary}"</p>
              {bookmark.keyTakeaway && (
                <div className="text-[10px] text-blue-300/80 font-medium border-t border-blue-500/10 pt-2">
                   💡 {bookmark.keyTakeaway}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {bookmark.tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-800/50 text-[9px] font-bold text-slate-400 border border-slate-700 uppercase tracking-tighter">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          bookmark.category.toLowerCase() === 'work' ? 'text-indigo-400' :
          bookmark.category.toLowerCase() === 'learning' ? 'text-emerald-400' :
          bookmark.category.toLowerCase() === 'technology' ? 'text-purple-400' :
          'text-blue-400'
        }`}>
          {bookmark.category}
        </span>
        <a 
          href={bookmark.url} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-blue-400 hover:text-white font-medium flex items-center gap-1 transition-colors"
        >
          View 
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </a>
      </div>
    </div>
  );
};
