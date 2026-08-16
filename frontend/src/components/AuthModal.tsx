import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Mail, User, Trophy, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, signup } = useAuth();

  
  const [mode, setMode] = useState<'login' | 'signup'>(authModalMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [favoriteSport, setFavoriteSport] = useState('Football');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync mode with authModalMode
  React.useEffect(() => {
    setMode(authModalMode);
    setError(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(name, email, password, favoriteSport);
      }
      // Reset fields
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#FFFFFF] border-3 border-black shadow-[8px_8px_0px_0px_#000000] w-full max-w-md p-6 sm:p-7 relative my-8"
      >
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#10B981] via-[#8B5CF6] to-[#F43F5E]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#10B981] p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-black text-black uppercase tracking-tight">
                {mode === 'login' ? 'Fan Sign In' : 'Join Spotrz Fan Club'}
              </h3>
              <p className="text-xs font-bold text-neutral-500">
                {mode === 'login'
                  ? 'Access live commentary, match voting & alerts'
                  : 'Unlock unlimited real-time match streaming'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1 border-2 border-black bg-[#F4F4F0] hover:bg-neutral-200 cursor-pointer shadow-[2px_2px_0px_0px_#000000]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-[#F4F4F0] border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-black text-white shadow-[2px_2px_0px_0px_#10B981]'
                : 'text-black hover:bg-white/50'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-black text-white shadow-[2px_2px_0px_0px_#8B5CF6]'
                : 'text-black hover:bg-white/50'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-100 border-2 border-[#F43F5E] text-rose-900 text-xs font-black flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#F43F5E]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Full Name / Nickname
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 pl-9 font-bold text-sm shadow-[2px_2px_0px_0px_#000000] outline-none focus:bg-white"
                />
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="fan@sportz.live"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 pl-9 font-bold text-sm shadow-[2px_2px_0px_0px_#000000] outline-none focus:bg-white"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 pl-9 font-bold text-sm shadow-[2px_2px_0px_0px_#000000] outline-none focus:bg-white"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
            </div>
            {mode === 'signup' && (
              <span className="text-[10px] font-bold text-neutral-500 mt-1 block">
                Minimum 6 characters
              </span>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Favorite Sport
              </label>
              <select
                value={favoriteSport}
                onChange={(e) => setFavoriteSport(e.target.value)}
                className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_#000000] outline-none focus:bg-white cursor-pointer"
              >
                <option value="Football">⚽ Football / Soccer</option>
                <option value="Cricket">🏏 Cricket</option>
                <option value="Basketball">🏀 Basketball</option>
                <option value="Tennis">🎾 Tennis</option>
                <option value="Esports">🎮 Esports</option>
              </select>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 border-2 border-black bg-[#10B981] hover:bg-[#059669] text-black font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_#000000] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1"
            >
              <span>{isSubmitting ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-5 pt-4 border-t-2 border-dashed border-neutral-300 text-center">
          <p className="text-xs font-bold text-neutral-600">
            {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
              }}
              className="ml-1 text-black font-black underline hover:text-[#8B5CF6] cursor-pointer"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
