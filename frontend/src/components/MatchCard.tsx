import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Eye, CheckCircle2 } from 'lucide-react';
import type { Match } from '../types';


interface MatchCardProps {
  match: Match;
  isSelected: boolean;
  onSelect: (match: Match) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, isSelected, onSelect }) => {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  // Format date / time
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const getSportColor = (sport: string) => {
    const s = sport.toLowerCase();
    if (s.includes('cricket')) return 'bg-amber-300 text-black';
    if (s.includes('football') || s.includes('soccer')) return 'bg-emerald-300 text-black';
    if (s.includes('basket')) return 'bg-orange-300 text-black';
    if (s.includes('tennis')) return 'bg-lime-300 text-black';
    return 'bg-[#8B5CF6]/30 text-black';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4, x: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(match)}
      className={`relative cursor-pointer transition-all border-3 border-black p-5 flex flex-col justify-between ${
        isSelected
          ? 'bg-[#FFFFFF] ring-4 ring-[#10B981] shadow-[7px_7px_0px_0px_#000000]'
          : 'bg-[#FFFFFF] shadow-[4px_4px_0px_0px_#000000] hover:shadow-[7px_7px_0px_0px_#000000]'
      }`}
    >
      {/* Selected Ribbon Badge */}
      {isSelected && (
        <div className="absolute -top-3.5 right-4 bg-[#10B981] text-black border-2 border-black px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1 z-10">
          <CheckCircle2 className="w-3 h-3 stroke-[3]" />
          <span>Active View</span>
        </div>
      )}

      {/* Top Bar: Sport Category + Live Indicator */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-dashed border-neutral-300">
        <span
          className={`px-3 py-1 text-xs font-black uppercase tracking-wider border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000000] ${getSportColor(
            match.sports
          )}`}
        >
          {match.sports}
        </span>

        <div className="flex items-center gap-1.5">
          {isLive ? (
            <span className="flex items-center gap-1.5 bg-[#F43F5E] text-white border-2 border-black px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide shadow-[2px_2px_0px_0px_#000000]">
              <span className="w-2 h-2 rounded-full bg-white animate-ping inline-block" />
              <span>LIVE</span>
            </span>
          ) : isFinished ? (
            <span className="bg-neutral-200 text-neutral-800 border-2 border-black px-2.5 py-0.5 rounded-full text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#000000]">
              Finished
            </span>
          ) : (
            <span className="bg-sky-100 text-sky-900 border-2 border-black px-2.5 py-0.5 rounded-full text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#000000]">
              Scheduled
            </span>
          )}
        </div>
      </div>

      {/* Score Area: Teams stacked on left, Scores in heavy-bordered boxes on right */}
      <div className="flex items-center justify-between gap-4 my-2">
        {/* Teams */}
        <div className="flex flex-col gap-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#8B5CF6] border border-black shrink-0" />
            <span className="font-extrabold text-base sm:text-lg text-black truncate">
              {match.homeTeam}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-neutral-400 border border-black shrink-0" />
            <span className="font-extrabold text-base sm:text-lg text-black truncate">
              {match.awayTeam}
            </span>
          </div>
        </div>

        {/* Scores Boxes */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="min-w-[48px] text-center bg-[#F4F4F0] border-2 border-black px-3 py-1 font-black text-xl text-black shadow-[2px_2px_0px_0px_#000000]">
            {match.homeScore ?? 0}
          </div>
          <div className="min-w-[48px] text-center bg-[#F4F4F0] border-2 border-black px-3 py-1 font-black text-xl text-black shadow-[2px_2px_0px_0px_#000000]">
            {match.awayScore ?? 0}
          </div>
        </div>
      </div>

      {/* Card Bottom Bar: Timestamp + Action Button */}
      <div className="mt-5 pt-3 border-t-2 border-black flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-600">
          <Clock className="w-3.5 h-3.5 text-neutral-800" />
          <span>{formatTime(match.startTime)}</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, x: 2, y: 2 }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(match);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] cursor-pointer transition-colors ${
            isSelected
              ? 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]'
              : 'bg-[#10B981] text-black hover:bg-[#059669]'
          }`}
        >
          <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{isSelected ? 'Watching Live' : 'Watch Live'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
