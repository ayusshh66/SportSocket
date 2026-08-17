import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Activity, Zap, RefreshCw, LogIn, LogOut, User as UserIcon, Home, Tv } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardHeaderProps {
  isConnected: boolean;
  activeMatchesCount: number;
  totalMatchesCount: number;
  onOpenCreateMatch: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  activeTab: 'matches' | 'overview';
  setActiveTab: (tab: 'matches' | 'overview') => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isConnected,
  activeMatchesCount,
  totalMatchesCount,
  onOpenCreateMatch,
  onRefresh,
  isRefreshing,
  activeTab,
  setActiveTab,
}) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-[#FFFFFF] border-3 border-black shadow-[6px_6px_0px_0px_#000000] p-4 sm:p-6 mb-6 relative overflow-hidden"
    >
      {/* Decorative Neo-Brutalist Top Stripe */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#10B981] via-[#8B5CF6] to-[#F43F5E]" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left: Branding & Status */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-[#10B981] text-black border-2 border-black px-2.5 py-0.5 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-black stroke-black" />
              <span>SPORTSOCKET ENGINE</span>
            </div>

            {/* Live WebSocket Status Badge */}
            <div
              className={`flex items-center gap-2 px-3 py-0.5 border-2 border-black font-black text-xs uppercase tracking-wider rounded-full shadow-[2px_2px_0px_0px_#000000] ${
                isConnected
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-rose-100 text-rose-900'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isConnected ? 'bg-[#10B981]' : 'bg-[#F43F5E]'
                  }`}
                ></span>
              </span>
              <span>{isConnected ? 'LIVE CONNECTED' : 'WS RECONNECTING'}</span>
            </div>

            {/* Metrics */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 bg-[#8B5CF6]/15 text-[#6D28D9] border-2 border-black text-xs font-black uppercase rounded-full shadow-[2px_2px_0px_0px_#000000]">
              <Activity className="w-3 h-3" />
              <span>{activeMatchesCount} LIVE / {totalMatchesCount} MATCHES</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-black">
              SportSocket <span className="text-[#8B5CF6]">—</span> Real-Time Sports Engine
            </h1>
          </div>
        </div>

        {/* Right: Navigation & User Auth Options */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Navigation Mode Switcher */}
          <div className="flex items-center bg-[#F4F4F0] border-2 border-black p-1 shadow-[2px_2px_0px_0px_#000000]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'matches'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Live Engine</span>
            </button>
          </div>

          {/* Sync Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98, x: 2, y: 2 }}
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hidden sm:flex items-center gap-1.5 bg-[#F4F4F0] hover:bg-neutral-200 text-black font-bold px-3 py-2 border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs uppercase tracking-wide cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </motion.button>

          {/* New Match Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98, x: 2, y: 2 }}
            onClick={onOpenCreateMatch}
            className="flex items-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-black font-black px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-xs uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Match</span>
          </motion.button>

          {/* User Auth Profile / Login Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 bg-[#FAF5FF] border-2 border-black p-1 pl-3 shadow-[3px_3px_0px_0px_#000000]">
              <div className="flex items-center gap-1.5 text-xs font-black">
                <UserIcon className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span className="max-w-[100px] truncate">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1 hover:bg-rose-100 text-neutral-700 hover:text-rose-700 border border-black cursor-pointer ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98, x: 2, y: 2 }}
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-black px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-xs uppercase tracking-wider cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Sign In</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
