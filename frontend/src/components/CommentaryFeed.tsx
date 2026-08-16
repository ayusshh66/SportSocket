import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Filter, Tag, Trophy, User } from 'lucide-react';
import type { Match, Commentary } from '../types';

interface CommentaryFeedProps {
  selectedMatch: Match | null;
  commentaries: Commentary[];
  isLoading: boolean;
  onAddCommentaryClick: () => void;
}

export const CommentaryFeed: React.FC<CommentaryFeedProps> = ({
  selectedMatch,
  commentaries,
  isLoading,
  onAddCommentaryClick,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  if (!selectedMatch) {
    return (
      <div className="bg-[#FFFFFF] border-3 border-black shadow-[6px_6px_0px_0px_#000000] p-8 flex flex-col items-center justify-center text-center min-h-[450px]">
        <div className="w-16 h-16 bg-[#8B5CF6]/20 border-2 border-black rounded-full flex items-center justify-center mb-4 shadow-[3px_3px_0px_0px_#000000]">
          <Trophy className="w-8 h-8 text-[#8B5CF6]" />
        </div>
        <h3 className="text-xl font-black text-black uppercase tracking-wide mb-2">
          No Match Selected
        </h3>
        <p className="text-neutral-600 font-semibold text-sm max-w-xs">
          Select any live or scheduled match from the left cards grid to stream real-time commentary and stats.
        </p>
      </div>
    );
  }

  // Filter commentary items
  const filteredCommentaries = commentaries.filter((c) => {
    if (filterType === 'all') return true;
    const type = (c.eventType || '').toLowerCase();
    const msg = (c.message || '').toLowerCase();
    if (filterType === 'goals') return type.includes('goal') || type.includes('wicket') || type.includes('six') || type.includes('point') || msg.includes('goal');
    if (filterType === 'cards') return type.includes('card') || type.includes('foul') || type.includes('penalty') || msg.includes('card');
    if (filterType === 'highlights') return (c.tags && c.tags.length > 0) || type.includes('goal') || type.includes('wicket');
    return true;
  });


  const getEventBadgeStyle = (eventType?: string | null) => {
    const type = (eventType || '').toUpperCase();
    if (type.includes('GOAL') || type.includes('WICKET') || type.includes('SIX')) {
      return 'bg-[#F43F5E] text-white border-black';
    }
    if (type.includes('CARD') || type.includes('YELLOW') || type.includes('RED')) {
      return 'bg-amber-300 text-black border-black';
    }
    if (type.includes('START') || type.includes('HALF') || type.includes('FULL')) {
      return 'bg-[#10B981] text-black border-black';
    }
    if (type.includes('FOUL') || type.includes('PENALTY')) {
      return 'bg-orange-300 text-black border-black';
    }
    return 'bg-[#8B5CF6] text-white border-black';
  };

  return (
    <div className="bg-[#FFFFFF] border-3 border-black shadow-[6px_6px_0px_0px_#000000] flex flex-col h-full overflow-hidden">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 border-b-3 border-black bg-[#F4F4F0]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
              Live Commentary
            </h2>
            {/* Skiper UI Animated Badge */}
            <div className="flex items-center gap-1.5 bg-[#8B5CF6] text-white border-2 border-black px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span>Real-time Stream</span>
            </div>
          </div>

          {/* Quick Add Commentary Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97, x: 2, y: 2 }}
            onClick={onAddCommentaryClick}
            className="flex items-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-black font-black text-xs uppercase tracking-wider px-3.5 py-2 border-2 border-black shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post Event</span>
          </motion.button>
        </div>

        {/* Selected Match Live Score Card */}
        <div className="bg-[#FFFFFF] border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#8B5CF6]">
              {selectedMatch.sports} • Match #{selectedMatch.id}
            </span>
            <div className="flex items-center gap-2 font-black text-base sm:text-lg text-black mt-0.5">
              <span>{selectedMatch.homeTeam}</span>
              <span className="text-neutral-400 font-bold">vs</span>
              <span>{selectedMatch.awayTeam}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-black text-white px-3 py-1.5 font-black text-xl border-2 border-black">
              {selectedMatch.homeScore ?? 0}
            </div>
            <span className="font-black text-lg text-neutral-400">-</span>
            <div className="bg-black text-white px-3 py-1.5 font-black text-xl border-2 border-black">
              {selectedMatch.awayScore ?? 0}
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
          <span className="text-xs font-black uppercase text-neutral-600 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Events' },
            { id: 'goals', label: '⚽ Goals / Wickets' },
            { id: 'cards', label: '🟨 Cards / Fouls' },
            { id: 'highlights', label: '⭐ Highlights' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer shrink-0 ${
                filterType === tab.id
                  ? 'bg-black text-white shadow-[2px_2px_0px_0px_#8B5CF6]'
                  : 'bg-white text-black hover:bg-neutral-100 shadow-[2px_2px_0px_0px_#000000]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Timeline Feed */}
      <div className="p-5 sm:p-6 overflow-y-auto max-h-[600px] custom-scrollbar flex-1 bg-[#FFFFFF]">
        {isLoading ? (
          <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
            <span className="font-black text-sm uppercase text-neutral-700">
              Loading Match Commentary...
            </span>
          </div>
        ) : filteredCommentaries.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
            <MessageSquare className="w-10 h-10 text-neutral-400" />
            <p className="font-black text-base text-neutral-800">No commentary events yet</p>
            <p className="text-xs font-semibold text-neutral-500 max-w-xs">
              Live updates will appear here automatically as they occur via WebSocket.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-1 before:bg-black">
            <AnimatePresence initial={false}>
              {filteredCommentaries.map((item, idx) => {
                const minuteDisplay = item.minute != null ? `${item.minute}'` : item.period || 'LIVE';
                const sequenceDisplay = item.sequence ? `Seq ${item.sequence}` : `Seq ${item.id}`;
                const eventBadgeStyle = getEventBadgeStyle(item.eventType);

                return (
                  <motion.div
                    key={item.id || `commentary-${idx}`}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    {/* Circular Node Indicator */}
                    <div className="absolute -left-[30px] sm:-left-[38px] top-1.5 w-4 h-4 rounded-full bg-[#10B981] border-2 border-black ring-4 ring-white shadow-[1px_1px_0px_0px_#000000]" />

                    {/* Event Header */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Minute */}
                      <span className="bg-black text-white font-black text-xs px-2.5 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                        {minuteDisplay}
                      </span>

                      {/* Event Type Pill */}
                      {item.eventType && (
                        <span
                          className={`font-black text-[11px] uppercase tracking-wider px-2.5 py-0.5 border-2 shadow-[2px_2px_0px_0px_#000000] ${eventBadgeStyle}`}
                        >
                          {item.eventType}
                        </span>
                      )}

                      {/* Sequence Badge */}
                      <span className="bg-neutral-100 text-neutral-800 font-bold text-[11px] px-2 py-0.5 border border-black uppercase">
                        {sequenceDisplay}
                      </span>

                      {/* Actor & Team */}
                      {item.actor && (
                        <span className="flex items-center gap-1 text-xs font-black text-black ml-auto">
                          <User className="w-3 h-3 text-[#8B5CF6]" />
                          <span>{item.actor}</span>
                          {item.team && (
                            <span className="text-neutral-500 font-bold">({item.team})</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Commentary Speech Bubble */}
                    <div className="bg-[#FAF5FF] border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000000] relative">
                      <p className="font-semibold text-sm sm:text-base text-neutral-900 leading-relaxed">
                        {item.message}
                      </p>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-black/20">
                          {item.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="inline-flex items-center gap-1 bg-[#10B981]/20 text-[#065F46] border border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
