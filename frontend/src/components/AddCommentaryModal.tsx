import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle, MessageSquare } from 'lucide-react';
import type { Match, Commentary } from '../types';

interface AddCommentaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMatch: Match | null;
  onCommentaryAdded: (newCommentary: Commentary) => void;
  apiBaseUrl: string;
}

export const AddCommentaryModal: React.FC<AddCommentaryModalProps> = ({
  isOpen,
  onClose,
  selectedMatch,
  onCommentaryAdded,
  apiBaseUrl,
}) => {
  const [minuteStr, setMinuteStr] = useState<string>('45');
  const [period, setPeriod] = useState<string>('2nd Half');
  const [eventType, setEventType] = useState<string>('GOAL');
  const [actor, setActor] = useState<string>('');
  const [team, setTeam] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('highlight');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default values based on selected match sport
  useEffect(() => {
    if (!selectedMatch) return;
    const sport = selectedMatch.sports.toLowerCase();
    if (sport.includes('cricket')) {
      setPeriod('Over 18.2');
      setEventType('SIX');
      setMinuteStr('18');
      setTagsInput('maximum, boundary');
    } else if (sport.includes('basket')) {
      setPeriod('Q3 08:45');
      setEventType('3_POINTER');
      setMinuteStr('32');
      setTagsInput('clutch, three');
    } else if (sport.includes('esport') || sport.includes('gaming')) {
      setPeriod('Round 14');
      setEventType('ACE_PENTAKILL');
      setMinuteStr('24');
      setTagsInput('ace, clutch, highlight');
    } else {
      setPeriod('2nd Half');
      setEventType('GOAL');
      setMinuteStr('74');
      setTagsInput('goal, screamer');
    }
    setTeam(selectedMatch.homeTeam);
  }, [selectedMatch]);

  if (!isOpen || !selectedMatch) return null;

  const handleMinuteInput = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.length > 1 && digits.startsWith('0')) {
      digits = digits.replace(/^0+/, '');
    }
    setMinuteStr(digits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Commentary message is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      minute: minuteStr !== '' ? parseInt(minuteStr) : undefined,
      period: period.trim() || undefined,
      eventType: eventType || undefined,
      actor: actor.trim() || undefined,
      team: team.trim() || selectedMatch.homeTeam,
      message: message.trim(),
      tags: tags.length > 0 ? tags : undefined,
    };

    try {
      const res = await fetch(`${apiBaseUrl}/api/matches/${selectedMatch.id}/commentary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.detail?.[0]?.message || json.error || 'Failed to post commentary');
      }

      onCommentaryAdded(json.data);
      onClose();
      // Reset form
      setMessage('');
      setActor('');
    } catch (err: any) {
      setError(err.message || 'Error creating commentary');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCricket = selectedMatch.sports.toLowerCase().includes('cricket');
  const isBasketball = selectedMatch.sports.toLowerCase().includes('basket');
  const isEsports = selectedMatch.sports.toLowerCase().includes('esport') || selectedMatch.sports.toLowerCase().includes('gaming');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFFFF] border-3 border-black shadow-[8px_8px_0px_0px_#000000] w-full max-w-lg p-6 my-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="bg-[#8B5CF6] p-1.5 border-2 border-black text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-black uppercase tracking-tight">
                Post Live Commentary
              </h3>
              <p className="text-xs font-bold text-neutral-600">
                {selectedMatch.sports} • {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                {isCricket ? 'Over / Minute Number' : isBasketball ? 'Game Minute' : isEsports ? 'Game Minute / Round' : 'Match Minute'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 24"
                value={minuteStr}
                onChange={(e) => handleMinuteInput(e.target.value)}
                className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_#000000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                {isCricket ? 'Over / Session' : isBasketball ? 'Quarter & Clock' : isEsports ? 'Round & Map' : 'Match Period'}
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder={isCricket ? 'Over 18.2' : isBasketball ? 'Q3 08:42' : isEsports ? 'Round 14 (Map 2)' : '2nd Half'}
                className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_#000000] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_#000000] outline-none cursor-pointer"
              >
                {isCricket ? (
                  <>
                    <option value="WICKET">🏏 WICKET</option>
                    <option value="SIX">🏏 SIX</option>
                    <option value="FOUR">🏏 FOUR / BOUNDARY</option>
                    <option value="MILESTONE">⭐ 50 / 100 MILESTONE</option>
                    <option value="DOT_BALL">⚪ DOT BALL</option>
                    <option value="REVIEW">📺 DRS REVIEW</option>
                  </>
                ) : isBasketball ? (
                  <>
                    <option value="3_POINTER">🏀 3-POINTER</option>
                    <option value="DUNK">🏀 SLAM DUNK</option>
                    <option value="2_POINTER">🏀 2-POINTER</option>
                    <option value="FOUL">⚠️ PERSONAL FOUL</option>
                    <option value="TIMEOUT">⏱️ TIMEOUT</option>
                    <option value="STEAL">🔥 STEAL / BLOCK</option>
                  </>
                ) : isEsports ? (
                  <>
                    <option value="FIRST_BLOOD">💥 FIRST BLOOD</option>
                    <option value="ACE_PENTAKILL">👑 ACE / PENTAKILL</option>
                    <option value="CLUTCH_1V3">💣 1v3 CLUTCH</option>
                    <option value="ROUND_WIN">🏆 ROUND / MAP WIN</option>
                    <option value="OBJECTIVE">🐲 DRAGON / BARON SECURED</option>
                    <option value="HEADSHOT">🎯 HEADSHOT MULTI-KILL</option>
                  </>
                ) : (
                  <>
                    <option value="GOAL">⚽ GOAL</option>
                    <option value="YELLOW_CARD">🟨 YELLOW CARD</option>
                    <option value="RED_CARD">🟥 RED CARD</option>
                    <option value="FOUL">⚠️ FOUL / PENALTY</option>
                    <option value="SUBSTITUTION">🔄 SUBSTITUTION</option>
                    <option value="HIGHLIGHT">⭐ HIGHLIGHT</option>
                    <option value="START">🏁 MATCH EVENT</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Player / Actor
              </label>
              <input
                type="text"
                placeholder={isCricket ? 'e.g. Rohit Sharma' : isBasketball ? 'e.g. LeBron James' : isEsports ? 'e.g. Faker / TenZ' : 'e.g. Vinicius Jr'}
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_#000000] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Team
              </label>
              <input
                type="text"
                placeholder={selectedMatch.homeTeam}
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_#000000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                placeholder="highlight, decisive"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_#000000] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1">
              Commentary Message *
            </label>
            <textarea
              rows={3}
              required
              placeholder="What just happened on the pitch/court?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_#000000] outline-none resize-none focus:bg-white"
            />
          </div>

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
              className="px-5 py-2 border-2 border-black bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Stream'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
