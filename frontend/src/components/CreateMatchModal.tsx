import React, { useState, useEffect } from 'react';
import { X, Trophy, AlertCircle, Clock, Zap } from 'lucide-react';
import type { Match } from '../types';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatchCreated: (newMatch: Match) => void;
  apiBaseUrl: string;
}

interface SportFormatConfig {
  defaultDuration: number;
  presets: { label: string; duration: number; description: string }[];
  timeLabel: string;
  scorePlaceholder: string;
}

const SPORT_CONFIGS: Record<string, SportFormatConfig> = {
  Football: {
    defaultDuration: 90,
    presets: [
      { label: 'Standard (90m)', duration: 90, description: '2 halves of 45 mins' },
      { label: 'Extra Time (120m)', duration: 120, description: 'Includes 30m extra time' },
      { label: 'Friendly / Half (45m)', duration: 45, description: 'Single half / exhibition' },
    ],
    timeLabel: 'Match Timing (Halves & Stoppage)',
    scorePlaceholder: 'e.g. 2',
  },
  Cricket: {
    defaultDuration: 180,
    presets: [
      { label: 'T20 (20 Overs)', duration: 180, description: '20 overs per innings (~3 hrs)' },
      { label: 'ODI (50 Overs)', duration: 480, description: '50 overs per innings (~8 hrs)' },
      { label: 'Test Match (Day 1)', duration: 360, description: '90 overs full day play' },
      { label: 'The Hundred / 10-Over', duration: 90, description: 'Short-format match (~1.5 hrs)' },
    ],
    timeLabel: 'Overs / Innings Duration',
    scorePlaceholder: 'e.g. 186',
  },
  Basketball: {
    defaultDuration: 135,
    presets: [
      { label: 'NBA (4 × 12m)', duration: 135, description: '48m game time (~2.2 hrs broadcast)' },
      { label: 'FIBA / EuroLeague (4 × 10m)', duration: 110, description: '40m game time (~1.8 hrs broadcast)' },
      { label: 'NCAA (2 × 20m Halves)', duration: 120, description: 'College basketball regulation' },
    ],
    timeLabel: 'Quarters & Game Window',
    scorePlaceholder: 'e.g. 108',
  },
  Tennis: {
    defaultDuration: 150,
    presets: [
      { label: 'Best of 3 Sets', duration: 150, description: 'Standard tour matches (~2.5 hrs)' },
      { label: 'Best of 5 Sets (Grand Slam)', duration: 240, description: 'Men Grand Slam format (~4 hrs)' },
    ],
    timeLabel: 'Sets & Match Window',
    scorePlaceholder: 'e.g. 2',
  },
  Esports: {
    defaultDuration: 120,
    presets: [
      { label: 'Best of 1 (BO1)', duration: 50, description: 'Single map / game (~50 mins)' },
      { label: 'Best of 3 (BO3)', duration: 130, description: 'Standard series (~2.2 hrs)' },
      { label: 'Best of 5 (BO5 Grand Finals)', duration: 220, description: 'Championship finals (~3.5 hrs)' },
    ],
    timeLabel: 'Series Format & Duration',
    scorePlaceholder: 'e.g. 2',
  },
};

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
  isOpen,
  onClose,
  onMatchCreated,
  apiBaseUrl,
}) => {
  const [sports, setSports] = useState('Football');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  
  // Score stored as clean string to prevent leading zero issue (e.g. "213" instead of "0213")
  const [homeScoreStr, setHomeScoreStr] = useState('0');
  const [awayScoreStr, setAwayScoreStr] = useState('0');
  
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSportConfig = SPORT_CONFIGS[sports] || SPORT_CONFIGS['Football'];

  // Update presets when sports category changes
  useEffect(() => {
    const config = SPORT_CONFIGS[sports] || SPORT_CONFIGS['Football'];
    if (config.presets.length > 0) {
      setSelectedPreset(config.presets[0].label);
      setDurationMinutes(config.presets[0].duration);
    }
  }, [sports]);

  if (!isOpen) return null;

  // Clean numeric input that strips redundant leading zeros
  const handleScoreInput = (val: string, setter: (cleaned: string) => void) => {
    // If empty, set to '' so user can type freely
    if (val === '') {
      setter('0');
      return;
    }
    // Remove all non-digits
    let digits = val.replace(/\D/g, '');
    // Strip leading zeros if number > 0 (e.g. '0213' -> '213')
    if (digits.length > 1 && digits.startsWith('0')) {
      digits = digits.replace(/^0+/, '');
    }
    setter(digits || '0');
  };

  const handleDurationInput = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.length > 1 && digits.startsWith('0')) {
      digits = digits.replace(/^0+/, '');
    }
    const num = parseInt(digits) || 0;
    setDurationMinutes(num);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam.trim() || !awayTeam.trim()) {
      setError('Please provide names for both teams.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const now = new Date();
    const finalDuration = durationMinutes > 0 ? durationMinutes : 90;
    const endTime = new Date(now.getTime() + finalDuration * 60 * 1000);

    const payload = {
      sports,
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      homeScore: parseInt(homeScoreStr) || 0,
      awayScore: parseInt(awayScoreStr) || 0,
      startTime: now.toISOString(),
      endTime: endTime.toISOString(),
    };

    try {
      const res = await fetch(`${apiBaseUrl}/api/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json.error?.[0]?.message || json.detail || json.error || 'Failed to create match'
        );
      }

      onMatchCreated(json.data);
      onClose();
      // Reset form
      setHomeTeam('');
      setAwayTeam('');
      setHomeScoreStr('0');
      setAwayScoreStr('0');
    } catch (err: any) {
      setError(err.message || 'Error creating match');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFFFF] border-3 border-black shadow-[8px_8px_0px_0px_#000000] w-full max-w-lg p-6 my-8 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="bg-[#10B981] p-1.5 border-2 border-black">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-black text-black uppercase tracking-tight">
                Create New Match
              </h3>
              <p className="text-xs font-bold text-neutral-500">
                Configure sport format, live scores, and schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 border-2 border-black bg-[#F4F4F0] hover:bg-neutral-200 cursor-pointer shadow-[2px_2px_0px_0px_#000000]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-100 border-2 border-[#F43F5E] text-rose-900 text-xs font-black flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sports Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1">
              Sport Category
            </label>
            <select
              value={sports}
              onChange={(e) => setSports(e.target.value)}
              className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_#000000] outline-none focus:bg-white cursor-pointer"
            >
              <option value="Football">⚽ Football</option>
              <option value="Cricket">🏏 Cricket</option>
              <option value="Basketball">🏀 Basketball</option>
              <option value="Tennis">🎾 Tennis</option>
              <option value="Esports">🎮 Esports</option>
            </select>
          </div>

          {/* Teams */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Home Team
              </label>
              <input
                type="text"
                placeholder={sports === 'Cricket' ? 'e.g. Mumbai Indians' : 'e.g. Real Madrid'}
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                required
                className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_#000000] outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Away Team
              </label>
              <input
                type="text"
                placeholder={sports === 'Cricket' ? 'e.g. Chennai Super Kings' : 'e.g. Barcelona'}
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                required
                className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_#000000] outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* Initial Scores (Clean Input - No 0213 Bug) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Home Score
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={currentSportConfig.scorePlaceholder}
                value={homeScoreStr}
                onFocus={() => {
                  if (homeScoreStr === '0') setHomeScoreStr('');
                }}
                onBlur={() => {
                  if (homeScoreStr === '') setHomeScoreStr('0');
                }}
                onChange={(e) => handleScoreInput(e.target.value, setHomeScoreStr)}
                className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-black text-lg shadow-[2px_2px_0px_0px_#000000] outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Away Score
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={currentSportConfig.scorePlaceholder}
                value={awayScoreStr}
                onFocus={() => {
                  if (awayScoreStr === '0') setAwayScoreStr('');
                }}
                onBlur={() => {
                  if (awayScoreStr === '') setAwayScoreStr('0');
                }}

                onChange={(e) => handleScoreInput(e.target.value, setAwayScoreStr)}
                className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-black text-lg shadow-[2px_2px_0px_0px_#000000] outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* Sport-Specific Time & Format Presets */}
          <div className="bg-[#FAF5FF] border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000000] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#6D28D9] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {currentSportConfig.timeLabel}
              </span>
              <span className="text-[11px] font-bold text-neutral-600">
                {durationMinutes} mins total
              </span>
            </div>

            {/* Presets Chips */}
            <div className="grid grid-cols-2 gap-2">
              {currentSportConfig.presets.map((preset) => {
                const isSelected = selectedPreset === preset.label;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(preset.label);
                      setDurationMinutes(preset.duration);
                    }}
                    className={`p-2 text-left border-2 border-black transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0px_0px_#000000]'
                        : 'bg-white text-black hover:bg-neutral-100 shadow-[1px_1px_0px_0px_#000000]'
                    }`}
                  >
                    <div className="font-black text-xs">{preset.label}</div>
                    <div className={`text-[10px] truncate ${isSelected ? 'text-purple-100' : 'text-neutral-500'}`}>
                      {preset.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Duration Override */}
            <div className="pt-2 border-t border-black/15 flex items-center justify-between gap-3">
              <label className="text-[11px] font-black uppercase text-neutral-700">
                Custom Duration (Mins):
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={durationMinutes.toString()}
                onChange={(e) => handleDurationInput(e.target.value)}
                className="w-24 bg-white border-2 border-black px-2 py-1 font-bold text-xs shadow-[1px_1px_0px_0px_#000000] text-center"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-black bg-white hover:bg-neutral-100 font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 border-2 border-black bg-[#10B981] hover:bg-[#059669] text-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-black stroke-black" />
              <span>{isSubmitting ? 'Creating...' : 'Create Match'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
