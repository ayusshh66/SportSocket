import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { sportsAudio } from '../utils/sportsAudio';

interface AudioBarProps {
  currentSport?: string;
}

export const AudioBar: React.FC<AudioBarProps> = ({ currentSport }) => {
  const [audioState, setAudioState] = useState({
    isMuted: sportsAudio.getIsMuted(),
    volume: sportsAudio.getVolume(),
    currentSport: sportsAudio.getCurrentSport(),
    isPlaying: false,
  });

  useEffect(() => {
    const unsubscribe = sportsAudio.subscribeState((state) => {
      setAudioState(state);
    });
    return unsubscribe;
  }, []);

  const handleToggleMute = () => {
    sportsAudio.toggleMute();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    sportsAudio.setVolume(val);
  };

  const handleTestSFX = () => {
    const sportToPlay = currentSport || audioState.currentSport || 'Football';
    sportsAudio.playSportMatchSound(sportToPlay);
  };

  const displaySport = currentSport || audioState.currentSport || 'Arena';

  return (
    <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000000] p-3 sm:p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
      {/* Left: Active Sport Sound Status */}
      <div className="flex items-center gap-3">
        <div
          className={`p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition-colors ${
            !audioState.isMuted
              ? 'bg-[#10B981] text-black'
              : 'bg-neutral-200 text-neutral-600'
          }`}
        >
          {!audioState.isMuted ? (
            <Volume2 className="w-5 h-5 animate-pulse" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-xs sm:text-sm uppercase tracking-tight text-black">
              Sport Stadium Ambience:
            </span>
            <span className="bg-[#8B5CF6] text-white border border-black px-2 py-0.5 text-xs font-black uppercase shadow-[1px_1px_0px_0px_#000000]">
              {displaySport}
            </span>
          </div>
          <p className="text-[11px] font-bold text-neutral-500">
            {!audioState.isMuted
              ? 'Dynamic crowd sounds & stadium acoustic active'
              : 'Sound muted. Click unmute to enable match atmosphere'}
          </p>
        </div>
      </div>

      {/* Right: Sound Controls (Mute / Volume / Test SFX) */}
      <div className="flex items-center flex-wrap gap-3 ml-auto">
        {/* Test Sound Trigger */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTestSFX}
          className="flex items-center gap-1.5 bg-[#FAF5FF] hover:bg-[#8B5CF6]/20 text-black border-2 border-black px-3 py-1.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>Play SFX</span>
        </motion.button>

        {/* Volume Slider */}
        <div className="flex items-center gap-2 bg-[#F4F4F0] border-2 border-black px-2.5 py-1.5 shadow-[2px_2px_0px_0px_#000000]">
          <span className="text-[10px] font-black uppercase">Vol</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={audioState.isMuted ? 0 : audioState.volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 accent-[#8B5CF6] cursor-pointer h-2 bg-neutral-300 rounded-none border border-black"
          />
          <span className="text-[10px] font-mono font-black w-7 text-right">
            {audioState.isMuted ? '0%' : `${Math.round(audioState.volume * 100)}%`}
          </span>
        </div>

        {/* Toggle Mute Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleMute}
          className={`flex items-center gap-1.5 border-2 border-black px-3 py-1.5 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] cursor-pointer transition-colors ${
            audioState.isMuted
              ? 'bg-[#F43F5E] text-white hover:bg-[#E11D48]'
              : 'bg-[#10B981] text-black hover:bg-[#059669]'
          }`}
        >
          {audioState.isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Unmute</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Mute Audio</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
