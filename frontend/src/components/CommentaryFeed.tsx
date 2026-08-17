import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Filter, Tag, Trophy, User, Zap, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { Match, Commentary } from '../types';
import { sportsAudio } from '../utils/sportsAudio';

interface CommentaryFeedProps {
  selectedMatch: Match | null;
  commentaries: Commentary[];
  isLoading: boolean;
  onAddCommentaryClick: () => void;
  apiBaseUrl?: string;
  onCommentaryAdded?: (newCommentary: Commentary) => void;
}

interface FloatingParticle {
  id: number;
  emoji: string;
  x: number;
}

interface QuickActionConfig {
  label: string;
  eventType: string;
  badge: string;
  tags: string[];
  generateMessage: (home: string, away: string, actor: string) => string;
  defaultActor: (home: string, away: string) => string;
  minute: number;
  period: string;
}

export const CommentaryFeed: React.FC<CommentaryFeedProps> = ({
  selectedMatch,
  commentaries,
  isLoading,
  onAddCommentaryClick,
  apiBaseUrl = '',
  onCommentaryAdded,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [showQuickStudio, setShowQuickStudio] = useState<boolean>(true);
  const [isQuickPublishing, setIsQuickPublishing] = useState<boolean>(false);
  const [quickToast, setQuickToast] = useState<string | null>(null);

  // Fan Live Reactions State
  const [reactions, setReactions] = useState<{ [key: string]: number }>({
    '🔥': 142,
    '👏': 98,
    '😱': 45,
    '🏆': 76,
    '💀': 32,
  });
  const [particles, setParticles] = useState<FloatingParticle[]>([]);

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

  // Sport-Specific 1-Click Macro Actions
  const getQuickActions = (sport: string): QuickActionConfig[] => {
    const s = sport.toLowerCase();
    if (s.includes('esport') || s.includes('gaming')) {
      return [
        {
          label: '💥 First Blood',
          eventType: 'FIRST_BLOOD',
          badge: 'bg-rose-500 text-white',
          tags: ['firstblood', 'kill', 'opening'],
          defaultActor: (h) => (h.includes('T1') ? 'Faker' : 'TenZ'),
          generateMessage: (h, a, actor) =>
            `FIRST BLOOD! ${actor} (${h}) hits a crisp headshot pick at early round to draw first blood against ${a}!`,
          minute: 4,
          period: 'Round 4',
        },
        {
          label: '👑 Ace / Pentakill',
          eventType: 'ACE_PENTAKILL',
          badge: 'bg-amber-400 text-black',
          tags: ['ace', 'pentakill', 'clutch', 'highlight'],
          defaultActor: (h) => (h.includes('T1') ? 'Faker' : 'Cryocells'),
          generateMessage: (_h, _a, actor) =>
            `UNBELIEVABLE ACE! ${actor} single-handedly wipes out all 5 opponents in a cinematic 1v5 display!`,
          minute: 18,
          period: 'Round 18',
        },
        {
          label: '💣 1v3 Clutch',
          eventType: 'CLUTCH_1V3',
          badge: 'bg-purple-600 text-white',
          tags: ['clutch', '1v3', 'defuse'],
          defaultActor: (h) => (h.includes('T1') ? 'Gumayusi' : 'Zekken'),
          generateMessage: (h, a, actor) =>
            `INSANE 1v3 CLUTCH! With the spike timer ticking down, ${actor} (${h}) outplays 3 defenders of ${a} to win the round!`,
          minute: 22,
          period: 'Round 22',
        },
        {
          label: '🐲 Baron / Dragon',
          eventType: 'OBJECTIVE',
          badge: 'bg-cyan-400 text-black',
          tags: ['objective', 'baron', 'dragon'],
          defaultActor: (h) => (h.includes('T1') ? 'Oner' : 'Boaster'),
          generateMessage: (h, _a, actor) =>
            `OBJECTIVE SECURED! ${actor} secures the Baron Nashor / Dragon buff for ${h} after a chaotic river brawl!`,
          minute: 26,
          period: 'Map 2 (26m)',
        },
        {
          label: '🏆 Round Win',
          eventType: 'ROUND_WIN',
          badge: 'bg-emerald-400 text-black',
          tags: ['roundwin', 'matchpoint'],
          defaultActor: (h) => (h.includes('T1') ? 'Zeus' : 'Johnqt'),
          generateMessage: (h, _a, actor) =>
            `ROUND WON! Flawless retake execution by ${h} anchored by ${actor}!`,
          minute: 14,
          period: 'Round 14',
        },
      ];
    }

    if (s.includes('cricket')) {
      return [
        {
          label: '🏏 SIX (6)',
          eventType: 'SIX',
          badge: 'bg-rose-500 text-white',
          tags: ['six', 'maximum', 'boundary'],
          defaultActor: (h) => (h.includes('India') ? 'Virat Kohli' : 'Rohit Sharma'),
          generateMessage: (h, _a, actor) =>
            `MAXIMUM! ${actor} (${h}) steps down the track and deposits the ball into the top tier for a huge SIX!`,
          minute: 18,
          period: 'Over 18.2',
        },
        {
          label: '🏏 FOUR (4)',
          eventType: 'FOUR',
          badge: 'bg-amber-400 text-black',
          tags: ['four', 'boundary'],
          defaultActor: (h) => (h.includes('India') ? 'Rohit Sharma' : 'Shubman Gill'),
          generateMessage: (h, _a, actor) =>
            `CRACKING FOUR! ${actor} (${h}) punches it through the covers, timing it to perfection for a boundary!`,
          minute: 12,
          period: 'Over 12.4',
        },
        {
          label: '💥 WICKET!',
          eventType: 'WICKET',
          badge: 'bg-red-600 text-white',
          tags: ['wicket', 'breakthrough', 'cleanbowled'],
          defaultActor: (_h, a) => (a.includes('Australia') ? 'Mitchell Starc' : 'Jasprit Bumrah'),
          generateMessage: (h, a, actor) =>
            `OUT! Timber strikes! ${actor} (${a}) breaches the defence of ${h} with a vicious swinging yorker!`,
          minute: 15,
          period: 'Over 15.1',
        },
        {
          label: '🎯 DRS Review',
          eventType: 'REVIEW',
          badge: 'bg-indigo-500 text-white',
          tags: ['drs', 'review', 'umpire'],
          defaultActor: (_h, a) => (a.includes('Australia') ? 'Pat Cummins' : 'Captain'),
          generateMessage: (_h, a, actor) =>
            `DRS REVIEW! ${actor} (${a}) signals for a DRS review on an LBW decision. UltraEdge on screen...`,
          minute: 16,
          period: 'Over 16.3',
        },
        {
          label: '⭐ Milestone 50/100',
          eventType: 'MILESTONE',
          badge: 'bg-emerald-400 text-black',
          tags: ['milestone', 'fifty', 'century'],
          defaultActor: (h) => (h.includes('India') ? 'Virat Kohli' : 'Top Scorer'),
          generateMessage: (h, _a, actor) =>
            `MAGNIFICENT FIFTY! ${actor} raises the bat to a standing ovation from the crowd for ${h}!`,
          minute: 19,
          period: 'Over 19.5',
        },
      ];
    }

    if (s.includes('basket')) {
      return [
        {
          label: '🏀 3-Pointer',
          eventType: '3_POINTER',
          badge: 'bg-amber-400 text-black',
          tags: ['three', 'splash', 'downtown'],
          defaultActor: (h) => (h.includes('Lakers') ? 'LeBron James' : 'Steph Curry'),
          generateMessage: (h, _a, actor) =>
            `FROM DOWNTOWN! ${actor} (${h}) drains a pull-up 3-pointer right in the defender's eye!`,
          minute: 34,
          period: 'Q3 06:12',
        },
        {
          label: '💥 Slam Dunk',
          eventType: 'DUNK',
          badge: 'bg-rose-500 text-white',
          tags: ['dunk', 'poster', 'highlight'],
          defaultActor: (h) => (h.includes('Lakers') ? 'Anthony Davis' : 'Giannis'),
          generateMessage: (h, _a, actor) =>
            `MONSTER SLAM! ${actor} (${h}) throws down a thunderous two-handed alley-oop dunk!`,
          minute: 28,
          period: 'Q3 09:45',
        },
        {
          label: '🛡️ Big Block',
          eventType: 'STEAL',
          badge: 'bg-purple-600 text-white',
          tags: ['block', 'defense', 'swat'],
          defaultActor: (h) => (h.includes('Lakers') ? 'Anthony Davis' : 'Rudy Gobert'),
          generateMessage: (h, a, actor) =>
            `REJECTED! ${actor} (${h}) swats away the layup attempt from ${a} into the 3rd row!`,
          minute: 19,
          period: 'Q2 03:20',
        },
        {
          label: '⏱️ Timeout',
          eventType: 'TIMEOUT',
          badge: 'bg-neutral-800 text-white',
          tags: ['timeout', 'tactics'],
          defaultActor: (_h, a) => `${a} Head Coach`,
          generateMessage: (_h, _a, actor) =>
            `TIMEOUT CALLED! ${actor} calls for a full 60-second timeout to halt the scoring run.`,
          minute: 36,
          period: 'Q4 11:30',
        },
      ];
    }

    // Default Football
    return [
      {
        label: '⚽ GOAL!',
        eventType: 'GOAL',
        badge: 'bg-emerald-500 text-white',
        tags: ['goal', 'screamer', 'highlight'],
        defaultActor: (h) => (h.includes('Real') ? 'Vinicius Jr' : 'Erling Haaland'),
        generateMessage: (h, a, actor) =>
          `GOAAAL! ${actor} (${h}) cuts inside from the wing and unleashes an unstoppable rocket past the ${a} goalkeeper!`,
        minute: 68,
        period: '2nd Half',
      },
      {
        label: '🧤 Huge Save',
        eventType: 'HIGHLIGHT',
        badge: 'bg-cyan-400 text-black',
        tags: ['save', 'keeper', 'reflex'],
        defaultActor: (_h, a) => (a.includes('Barcelona') ? 'Ter Stegen' : 'Goalkeeper'),
        generateMessage: (_h, a, actor) =>
          `WORLD-CLASS SAVE! ${actor} (${a}) pulls off an acrobatic diving fingertip stop to keep his team in the match!`,
        minute: 72,
        period: '2nd Half',
      },
      {
        label: '🟨 Yellow Card',
        eventType: 'YELLOW_CARD',
        badge: 'bg-amber-300 text-black',
        tags: ['booking', 'foul', 'yellowcard'],
        defaultActor: (_h, a) => (a.includes('Barcelona') ? 'Gavi' : 'Midfielder'),
        generateMessage: (_h, a, actor) =>
          `YELLOW CARD! ${actor} (${a}) receives a caution from the referee for a late tactical tackle.`,
        minute: 54,
        period: '2nd Half',
      },
      {
        label: '🟥 Red Card',
        eventType: 'RED_CARD',
        badge: 'bg-rose-600 text-white',
        tags: ['redcard', 'sentoff', 'drama'],
        defaultActor: (_h, a) => (a.includes('Barcelona') ? 'Defender' : 'Player'),
        generateMessage: (_h, a, actor) =>
          `RED CARD! Straight red shown to ${actor} (${a}) after a dangerous high tackle! Game-changing moment!`,
        minute: 81,
        period: '2nd Half',
      },
      {
        label: '🎯 Penalty / Foul',
        eventType: 'FOUL',
        badge: 'bg-orange-400 text-black',
        tags: ['penalty', 'var', 'decision'],
        defaultActor: (h) => (h.includes('Real') ? 'Kylian Mbappe' : 'Striker'),
        generateMessage: (h, a, actor) =>
          `PENALTY AWARDED! ${actor} (${h}) is brought down in the 18-yard box by ${a}! Huge moment!`,
        minute: 85,
        period: '2nd Half',
      },
    ];
  };

  const quickActions = getQuickActions(selectedMatch.sports);

  // Handle 1-Click Quick Commentary Post
  const handleTriggerQuickAction = async (action: QuickActionConfig) => {
    if (isQuickPublishing) return;
    setIsQuickPublishing(true);

    const actor = action.defaultActor(selectedMatch.homeTeam, selectedMatch.awayTeam);
    const message = action.generateMessage(selectedMatch.homeTeam, selectedMatch.awayTeam, actor);

    const payload = {
      minute: action.minute,
      period: action.period,
      eventType: action.eventType,
      actor: actor,
      team: selectedMatch.homeTeam,
      message: message,
      tags: action.tags,
    };

    try {
      sportsAudio.playQuickActionSound();

      const res = await fetch(`${apiBaseUrl}/api/matches/${selectedMatch.id}/commentary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        if (onCommentaryAdded) {
          onCommentaryAdded(json.data);
        }
      } else {
        // Fallback local commentary object if backend is offline
        const mockComm: Commentary = {
          id: Date.now(),
          matchId: selectedMatch.id,
          minute: action.minute,
          period: action.period,
          eventType: action.eventType,
          actor: actor,
          team: selectedMatch.homeTeam,
          message: message,
          tags: action.tags,
          createdAt: new Date().toISOString(),
        };
        if (onCommentaryAdded) {
          onCommentaryAdded(mockComm);
        }
      }

      setQuickToast(`⚡ ${action.label} Published Instantly!`);
      setTimeout(() => setQuickToast(null), 3000);
    } catch {
      // Fallback local optimistic update
      const mockComm: Commentary = {
        id: Date.now(),
        matchId: selectedMatch.id,
        minute: action.minute,
        period: action.period,
        eventType: action.eventType,
        actor: actor,
        team: selectedMatch.homeTeam,
        message: message,
        tags: action.tags,
        createdAt: new Date().toISOString(),
      };
      if (onCommentaryAdded) {
        onCommentaryAdded(mockComm);
      }
      setQuickToast(`⚡ ${action.label} Published!`);
      setTimeout(() => setQuickToast(null), 3000);
    } finally {
      setIsQuickPublishing(false);
    }
  };

  // Handle Fan Live Reaction Click
  const handleReactionClick = (emoji: string) => {
    sportsAudio.playReactionPop();
    setReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));

    // Spawn floating particle
    const particleId = Date.now() + Math.random();
    const newParticle: FloatingParticle = {
      id: particleId,
      emoji: emoji,
      x: Math.random() * 80 + 10, // percentage offset
    };
    setParticles((prev) => [...prev, newParticle]);

    // Auto cleanup particle after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== particleId));
    }, 1800);
  };

  // Filter commentary items
  const filteredCommentaries = commentaries.filter((c) => {
    if (filterType === 'all') return true;
    const type = (c.eventType || '').toLowerCase();
    const msg = (c.message || '').toLowerCase();
    if (filterType === 'goals')
      return (
        type.includes('goal') ||
        type.includes('wicket') ||
        type.includes('six') ||
        type.includes('point') ||
        type.includes('blood') ||
        type.includes('ace') ||
        msg.includes('goal') ||
        msg.includes('wicket') ||
        msg.includes('kill')
      );
    if (filterType === 'cards')
      return (
        type.includes('card') ||
        type.includes('foul') ||
        type.includes('penalty') ||
        type.includes('timeout') ||
        msg.includes('card')
      );
    if (filterType === 'highlights')
      return (
        (c.tags && c.tags.length > 0) ||
        type.includes('goal') ||
        type.includes('wicket') ||
        type.includes('ace') ||
        type.includes('clutch')
      );
    return true;
  });

  const getEventBadgeStyle = (eventType?: string | null) => {
    const type = (eventType || '').toUpperCase();
    if (
      type.includes('GOAL') ||
      type.includes('WICKET') ||
      type.includes('SIX') ||
      type.includes('FIRST_BLOOD')
    ) {
      return 'bg-[#F43F5E] text-white border-black';
    }
    if (type.includes('ACE') || type.includes('MILESTONE')) {
      return 'bg-amber-400 text-black border-black';
    }
    if (type.includes('CARD') || type.includes('YELLOW') || type.includes('RED')) {
      return 'bg-amber-300 text-black border-black';
    }
    if (type.includes('START') || type.includes('HALF') || type.includes('FULL') || type.includes('WIN')) {
      return 'bg-[#10B981] text-black border-black';
    }
    if (type.includes('OBJECTIVE') || type.includes('DRS') || type.includes('REVIEW')) {
      return 'bg-cyan-300 text-black border-black';
    }
    if (type.includes('FOUL') || type.includes('PENALTY') || type.includes('CLUTCH')) {
      return 'bg-orange-300 text-black border-black';
    }
    return 'bg-[#8B5CF6] text-white border-black';
  };

  return (
    <div className="bg-[#FFFFFF] border-3 border-black shadow-[6px_6px_0px_0px_#000000] flex flex-col h-full overflow-hidden relative">
      {/* Floating Reaction Particles Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, y: 350, x: `${p.x}%`, scale: 0.8, rotate: -15 }}
              animate={{ opacity: 0, y: -50, scale: 1.8, rotate: 25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
              className="absolute text-3xl font-bold select-none drop-shadow-md"
            >
              {p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header Banner */}
      <div className="p-5 sm:p-6 border-b-3 border-black bg-[#F4F4F0]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
              Live Commentary
            </h2>
            {/* Real-Time Stream Badge */}
            <div className="flex items-center gap-1.5 bg-[#8B5CF6] text-white border-2 border-black px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span>Real-time</span>
            </div>
          </div>

          {/* Detailed Custom Add Commentary Modal Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97, x: 2, y: 2 }}
            onClick={onAddCommentaryClick}
            className="flex items-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-black font-black text-xs uppercase tracking-wider px-3.5 py-2 border-2 border-black shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Custom Event</span>
          </motion.button>
        </div>

        {/* Selected Match Live Score Card */}
        <div className="bg-[#FFFFFF] border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between gap-3 mb-4">
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
            <div className="bg-black text-white px-3 py-1.5 font-black text-xl border-2 border-black shadow-[2px_2px_0px_0px_#8B5CF6]">
              {selectedMatch.homeScore ?? 0}
            </div>
            <span className="font-black text-lg text-neutral-400">-</span>
            <div className="bg-black text-white px-3 py-1.5 font-black text-xl border-2 border-black shadow-[2px_2px_0px_0px_#8B5CF6]">
              {selectedMatch.awayScore ?? 0}
            </div>
          </div>
        </div>

        {/* 1-Click Instant Macro Action Bar (Commentator Studio) */}
        <div className="bg-[#FAF5FF] border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000000] mb-4">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#6D28D9]">
              <Zap className="w-3.5 h-3.5 fill-[#8B5CF6] text-black" />
              <span>⚡ 1-Click Quick Actions (Instant Post)</span>
            </div>
            <button
              onClick={() => setShowQuickStudio((prev) => !prev)}
              className="text-xs font-bold text-neutral-700 hover:text-black flex items-center gap-0.5 cursor-pointer"
            >
              {showQuickStudio ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showQuickStudio && (
            <div>
              <p className="text-[11px] font-semibold text-neutral-600 mb-2">
                Click any action below to broadcast instant, pre-formatted commentary with zero typing:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    disabled={isQuickPublishing}
                    onClick={() => handleTriggerQuickAction(action)}
                    className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer disabled:opacity-50 transition-all ${
                      action.badge.includes('bg-') ? action.badge : 'bg-white text-black hover:bg-purple-100'
                    }`}
                  >
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Action Success Toast Notification */}
          <AnimatePresence>
            {quickToast && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2.5 bg-[#10B981] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000000]"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{quickToast}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Fan Reactions Bar */}
        <div className="bg-[#FFFFFF] border-2 border-black p-3 shadow-[3px_3px_0px_0px_#000000] flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-xs font-black uppercase text-neutral-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Fan Reactions:</span>
          </span>

          <div className="flex items-center gap-2">
            {Object.entries(reactions).map(([emoji, count]) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => handleReactionClick(emoji)}
                className="flex items-center gap-1 bg-[#F4F4F0] hover:bg-amber-100 border-2 border-black px-2.5 py-1 text-xs font-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer transition-colors"
              >
                <span className="text-base leading-none">{emoji}</span>
                <span className="text-[11px] font-extrabold text-neutral-800">{count}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
          <span className="text-xs font-black uppercase text-neutral-600 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Events' },
            { id: 'goals', label: '⚽ Goals / Kills / 6s' },
            { id: 'cards', label: '🟨 Cards / Fouls' },
            { id: 'highlights', label: '⭐ Highlights / Ace' },
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
              Live updates will appear here automatically via WebSocket or when you click a 1-Click Quick Action above!
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
