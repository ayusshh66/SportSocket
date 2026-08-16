import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  ShieldCheck,
  Radio,
  ArrowRight,
  Trophy,
  Flame,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';


interface LandingHeroProps {
  onEnterDashboard: () => void;
  liveMatchesCount: number;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onEnterDashboard, liveMatchesCount }) => {
  const { isAuthenticated, user, openAuthModal } = useAuth();

  return (
    <div className="w-full space-y-8 mb-10">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-[#FFFFFF] border-3 border-black shadow-[8px_8px_0px_0px_#000000] p-6 sm:p-10 relative overflow-hidden"
      >
        {/* Neon Gradient Accent Stripe */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-[#10B981] via-[#8B5CF6] to-[#F43F5E]" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left: Project Vision & Value Proposition */}
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-[#10B981] text-black border-2 border-black px-3 py-1 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>Next-Gen Sports Engine</span>
              </span>

              <span className="bg-[#8B5CF6] text-white border-2 border-black px-3 py-1 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                <span>Zero-Latency WebSockets</span>
              </span>

              <span className="bg-rose-100 text-rose-900 border-2 border-black px-3 py-1 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Arcjet Protected</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-[1.08]">
              Live Scores & Ball-by-Ball <br />
              <span className="bg-[#8B5CF6] text-white px-2 border-2 border-black shadow-[3px_3px_0px_0px_#000000] inline-block mt-1">
                Commentary Stream
              </span>
            </h1>

            <p className="text-base sm:text-lg font-semibold text-neutral-700 leading-relaxed">
              Spotrz is a high-speed sports engine that delivers instant live score updates, ball-by-ball commentary, and match highlights directly to your screen with zero page refreshes.
            </p>

            {/* Quick CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97, x: 2, y: 2 }}
                onClick={onEnterDashboard}
                className="flex items-center gap-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-black text-sm sm:text-base uppercase tracking-wider px-6 py-3.5 border-3 border-black shadow-[5px_5px_0px_0px_#000000] cursor-pointer"
              >
                <Flame className="w-5 h-5 fill-black stroke-black" />
                <span>Watch Live Matches ({liveMatchesCount})</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </motion.button>

              {!isAuthenticated ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97, x: 2, y: 2 }}
                  onClick={() => openAuthModal('signup')}
                  className="flex items-center gap-2 bg-[#FAF5FF] hover:bg-[#8B5CF6]/15 text-black font-black text-sm sm:text-base uppercase tracking-wider px-6 py-3.5 border-3 border-black shadow-[5px_5px_0px_0px_#000000] cursor-pointer"
                >
                  <Users className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Join Fan Club (Free)</span>
                </motion.button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 bg-[#FAF5FF] border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span className="text-xs font-black uppercase text-black">
                    Signed in as <span className="text-[#8B5CF6]">{user?.name}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Interactive "Sneak Peek" Card */}
          <div className="w-full lg:w-96 bg-[#F4F4F0] border-3 border-black p-5 shadow-[6px_6px_0px_0px_#000000] shrink-0">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F43F5E] animate-ping" />
                <span className="font-black text-xs uppercase tracking-wider">Live Engine Sneak Peek</span>
              </div>
              <span className="bg-black text-[#10B981] font-mono text-[10px] font-black px-2 py-0.5 border border-black">
                WS: ACTIVE
              </span>
            </div>

            {/* Sneak Peek Match Preview */}
            <div className="bg-white border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000000] mb-3">
              <div className="flex items-center justify-between text-[11px] font-black uppercase text-[#8B5CF6] mb-1">
                <span>Cricket • T20 Series</span>
                <span className="bg-rose-100 text-rose-900 border border-black px-1.5 py-0.2 rounded-full text-[10px]">
                  ● LIVE
                </span>
              </div>
              <div className="flex items-center justify-between font-black text-base">
                <span>India</span>
                <span className="bg-[#FAF5FF] border border-black px-2 py-0.5 text-sm">186/3 (18.4)</span>
              </div>
              <div className="flex items-center justify-between font-black text-base mt-1">
                <span>Australia</span>
                <span className="bg-[#FAF5FF] border border-black px-2 py-0.5 text-sm">142/6 (16.1)</span>
              </div>
            </div>

            {/* Sneak Peek Live Feed Item */}
            <div className="bg-[#FAF5FF] border-2 border-black p-3 shadow-[2px_2px_0px_0px_#000000] relative">
              <div className="flex items-center gap-1.5 mb-1 text-[11px] font-black">
                <span className="bg-black text-white px-1.5 py-0.2 text-[10px]">18.4</span>
                <span className="bg-[#F43F5E] text-white px-1.5 py-0.2 text-[10px] uppercase">SIX</span>
                <span className="text-[#8B5CF6]">Virat Kohli</span>
              </div>
              <p className="text-xs font-semibold text-neutral-800 line-clamp-2">
                "MAXIMUM! Kohli steps out and launches it over long-on into the second tier!"
              </p>
            </div>

            <button
              onClick={onEnterDashboard}
              className="w-full mt-4 py-2 border-2 border-black bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Explore All Live Matches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 3 Pillars Explaining the Project in Simple Terms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1 */}
        <div className="bg-white border-3 border-black p-6 shadow-[5px_5px_0px_0px_#000000] relative flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-[#10B981] border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center justify-center mb-4">
              <Radio className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-black text-black uppercase tracking-tight mb-2">
              1. Real-Time Push Stream
            </h3>
            <p className="text-sm font-semibold text-neutral-600 leading-relaxed">
              No need to refresh the page. Scores, wickets, goals, and commentary slide onto your screen milliseconds after they happen via active WebSocket channels.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t-2 border-dashed border-neutral-300 flex items-center gap-1.5 text-xs font-black text-[#10B981]">
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            <span>Under 50ms Latency</span>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white border-3 border-black p-6 shadow-[5px_5px_0px_0px_#000000] relative flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-[#8B5CF6] border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center justify-center mb-4 text-white">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-black uppercase tracking-tight mb-2">
              2. Multi-Sport Formats
            </h3>
            <p className="text-sm font-semibold text-neutral-600 leading-relaxed">
              Engineered with dedicated timekeeping and event schemas for Cricket (Overs/Innings), Football (Halves/Stoppage), Basketball (Quarters), and Tennis.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t-2 border-dashed border-neutral-300 flex items-center gap-1.5 text-xs font-black text-[#8B5CF6]">
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            <span>Cricket, Football, NBA & More</span>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white border-3 border-black p-6 shadow-[5px_5px_0px_0px_#000000] relative flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-amber-300 border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center justify-center mb-4 text-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-black uppercase tracking-tight mb-2">
              3. Arcjet Bot Shield
            </h3>
            <p className="text-sm font-semibold text-neutral-600 leading-relaxed">
              Industrial security prevents DDoS attacks, spam scraping, and unauthorized automated bot flooding during high-traffic championship game nights.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t-2 border-dashed border-neutral-300 flex items-center gap-1.5 text-xs font-black text-amber-700">
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            <span>Bot Defense & Rate Limits</span>
          </div>
        </div>
      </div>
    </div>
  );
};
