import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, AlertTriangle } from 'lucide-react';
import { DashboardHeader } from './components/DashboardHeader';
import { MatchCard } from './components/MatchCard';
import { CommentaryFeed } from './components/CommentaryFeed';
import { CreateMatchModal } from './components/CreateMatchModal';
import { AddCommentaryModal } from './components/AddCommentaryModal';
import { AuthModal } from './components/AuthModal';
import { LandingHero } from './components/LandingHero';
import { Footer } from './components/Footer';
import { AudioBar } from './components/AudioBar';
import { sportsAudio } from './utils/sportsAudio';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { Match, Commentary, WSMessage } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const WS_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('http', 'ws') + '/ws' : 'ws://localhost:8000/ws';


// Fallback seed matches if backend database is completely empty
const INITIAL_DEMO_MATCHES: Match[] = [
  {
    id: 1,
    sports: 'Football',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    status: 'live',
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    homeScore: 2,
    awayScore: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    sports: 'Cricket',
    homeTeam: 'India',
    awayTeam: 'Australia',
    status: 'live',
    startTime: new Date(Date.now() - 7200000).toISOString(),
    endTime: new Date(Date.now() + 10800000).toISOString(),
    homeScore: 186,
    awayScore: 142,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    sports: 'Basketball',
    homeTeam: 'LA Lakers',
    awayTeam: 'Golden State',
    status: 'scheduled',
    startTime: new Date(Date.now() + 7200000).toISOString(),
    endTime: new Date(Date.now() + 14400000).toISOString(),
    homeScore: 0,
    awayScore: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    sports: 'Football',
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    status: 'finished',
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() - 80000000).toISOString(),
    homeScore: 3,
    awayScore: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    sports: 'Esports',
    homeTeam: 'T1 (LoL)',
    awayTeam: 'Gen.G',
    status: 'live',
    startTime: new Date(Date.now() - 1800000).toISOString(),
    endTime: new Date(Date.now() + 5400000).toISOString(),
    homeScore: 14,
    awayScore: 9,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    sports: 'Esports',
    homeTeam: 'Sentinels (VAL)',
    awayTeam: 'Fnatic',
    status: 'scheduled',
    startTime: new Date(Date.now() + 10800000).toISOString(),
    endTime: new Date(Date.now() + 18000000).toISOString(),
    homeScore: 0,
    awayScore: 0,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_DEMO_COMMENTARIES: Record<number, Commentary[]> = {
  1: [
    {
      id: 540,
      matchId: 1,
      minute: 74,
      sequence: 540,
      period: '2nd Half',
      eventType: 'GOAL',
      actor: 'Vinicius Jr',
      team: 'Real Madrid',
      message: 'GOAAAL! Vinicius Jr cuts inside from the left flank and curls a sublime strike into the far top corner!',
      tags: ['goal', 'screamer', 'elclasico'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 539,
      matchId: 1,
      minute: 58,
      sequence: 539,
      period: '2nd Half',
      eventType: 'YELLOW_CARD',
      actor: 'Gavi',
      team: 'Barcelona',
      message: 'Yellow card shown to Gavi for a tactical foul breaking up a dangerous counter-attack.',
      tags: ['booking', 'foul'],
      createdAt: new Date().toISOString(),
    },
  ],
  2: [
    {
      id: 601,
      matchId: 2,
      minute: 18,
      sequence: 601,
      period: 'Over 18.4',
      eventType: 'SIX',
      actor: 'Virat Kohli',
      team: 'India',
      message: 'MAXIMUM! Kohli steps out and launches it over long-on into the second tier. What a shot!',
      tags: ['six', 'maximum', 'kohli'],
      createdAt: new Date().toISOString(),
    },
  ],
  5: [
    {
      id: 702,
      matchId: 5,
      minute: 24,
      sequence: 702,
      period: 'Game 2 (24m)',
      eventType: 'ACE_PENTAKILL',
      actor: 'Faker (Azir)',
      team: 'T1 (LoL)',
      message: 'PENTAKILL FOR FAKER! Shurima Shuffle into 4 enemies and melts the entire backline under the inhibitor turret!',
      tags: ['pentakill', 'faker', 'highlight', 'worlds'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 701,
      matchId: 5,
      minute: 18,
      sequence: 701,
      period: 'Game 2 (18m)',
      eventType: 'OBJECTIVE',
      actor: 'Oner',
      team: 'T1 (LoL)',
      message: 'BARON NASHOR SECURED! Flawless smite fight around the river pit turns the tide of the match.',
      tags: ['baron', 'objective', 'smite'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 700,
      matchId: 5,
      minute: 4,
      sequence: 700,
      period: 'Game 2 (4m)',
      eventType: 'FIRST_BLOOD',
      actor: 'Gumayusi',
      team: 'T1 (LoL)',
      message: 'FIRST BLOOD! Gumayusi lands the root at bot river bush to draw the opening kill against Ruler.',
      tags: ['firstblood', 'kill'],
      createdAt: new Date().toISOString(),
    },
  ],
};

const DashboardContent: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [commentaries, setCommentaries] = useState<Commentary[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(true);
  const [isLoadingCommentary, setIsLoadingCommentary] = useState<boolean>(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'matches' | 'overview'>('overview');

  // Modals
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState<boolean>(false);
  const [isAddCommentaryOpen, setIsAddCommentaryOpen] = useState<boolean>(false);

  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);
  const selectedMatchRef = useRef<Match | null>(null);

  useEffect(() => {
    selectedMatchRef.current = selectedMatch;
  }, [selectedMatch]);

  // Fetch Matches from API
  const fetchMatches = useCallback(async () => {
    setIsLoadingMatches(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/matches`);
      if (!res.ok) throw new Error('API unavailable');
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        setMatches(json.data);
        if (!selectedMatchRef.current) {
          setSelectedMatch(json.data[0]);
        }
      } else {
        setMatches(INITIAL_DEMO_MATCHES);
        if (!selectedMatchRef.current) {
          setSelectedMatch(INITIAL_DEMO_MATCHES[0]);
        }
      }
    } catch (err) {
      console.warn('Backend API offline or unreachable, using local fallback:', err);
      setMatches(INITIAL_DEMO_MATCHES);
      if (!selectedMatchRef.current) {
        setSelectedMatch(INITIAL_DEMO_MATCHES[0]);
      }
    } finally {
      setIsLoadingMatches(false);
    }
  }, []);

  // Fetch Commentary for a given Match
  const fetchCommentary = useCallback(async (matchId: number) => {
    setIsLoadingCommentary(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/matches/${matchId}/commentary`);
      if (!res.ok) throw new Error('Commentary API unavailable');
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setCommentaries(json.data);
      } else {
        setCommentaries(INITIAL_DEMO_COMMENTARIES[matchId] || []);
      }
    } catch (err) {
      console.warn('Could not fetch commentary from backend, using fallback:', err);
      setCommentaries(INITIAL_DEMO_COMMENTARIES[matchId] || []);
    } finally {
      setIsLoadingCommentary(false);
    }
  }, []);

  // WebSocket Subscription Manager
  const subscribeToMatch = useCallback((matchId: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'subscribe',
          matchId: matchId,
        })
      );
    }
  }, []);

  const unsubscribeFromMatch = useCallback((matchId: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'unsubscribe',
          matchId: matchId,
        })
      );
    }
  }, []);

  // Connect WebSocket
  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connectWs = () => {
      try {
        const socket = new WebSocket(WS_URL);
        wsRef.current = socket;

        socket.onopen = () => {
          console.log('⚡ Connected to Sports WebSocket Server');
          setIsConnected(true);
          if (selectedMatchRef.current) {
            socket.send(
              JSON.stringify({
                type: 'subscribe',
                matchId: selectedMatchRef.current.id,
              })
            );
          }
        };

        socket.onmessage = (event) => {
          try {
            const data: WSMessage = JSON.parse(event.data);

            if (data.type === 'match_created' && data.data) {
              const newMatch: Match = data.data;
              setMatches((prev) => {
                const exists = prev.some((m) => Number(m.id) === Number(newMatch.id));
                return exists ? prev : [newMatch, ...prev];
              });
            }

            if (data.type === 'commentary' && data.data) {
              const newComm: Commentary = data.data;
              if (
                selectedMatchRef.current &&
                Number(newComm.matchId) === Number(selectedMatchRef.current.id)
              ) {
                setCommentaries((prev) => {
                  const exists = prev.some((c) => Number(c.id) === Number(newComm.id));
                  return exists ? prev : [newComm, ...prev];
                });
              }
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        socket.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connectWs, 3000);
        };

        socket.onerror = () => {
          socket.close();
        };
      } catch (err) {
        console.warn('Failed to establish WebSocket connection:', err);
        reconnectTimeout = setTimeout(connectWs, 3000);
      }
    };

    connectWs();
    fetchMatches();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchMatches]);

  // Handle Match Selection
  const handleSelectMatch = (match: Match) => {
    // Play sport specific sound & start ambience
    sportsAudio.playSportMatchSound(match.sports);

    // If not authenticated, prompt login but still allow viewing
    if (!isAuthenticated) {
      openAuthModal('signup');
    }

    if (selectedMatch?.id === match.id) return;

    if (selectedMatch) {
      unsubscribeFromMatch(selectedMatch.id);
    }

    setSelectedMatch(match);
    subscribeToMatch(match.id);
    fetchCommentary(match.id);
    setActiveTab('matches');
  };

  // Initial commentary load when selected match changes
  useEffect(() => {
    if (selectedMatch) {
      fetchCommentary(selectedMatch.id);
      subscribeToMatch(selectedMatch.id);
    }
  }, [selectedMatch?.id, fetchCommentary, subscribeToMatch]);

  // Filter Matches
  const filteredMatches = matches.filter((m) => {
    if (selectedStatusFilter !== 'all' && m.status !== selectedStatusFilter) {
      return false;
    }
    if (
      selectedSportFilter !== 'all' &&
      m.sports.toLowerCase() !== selectedSportFilter.toLowerCase()
    ) {
      return false;
    }
    return true;
  });

  const liveMatchesCount = matches.filter((m) => m.status === 'live').length;

  return (
    <div className="min-h-screen bg-[#F4F4F0] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Banner Header */}
        <DashboardHeader
          isConnected={isConnected}
          activeMatchesCount={liveMatchesCount}
          totalMatchesCount={matches.length}
          onOpenCreateMatch={() => setIsCreateMatchOpen(true)}
          onRefresh={fetchMatches}
          isRefreshing={isLoadingMatches}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Conditional View: Overview / Landing Hero vs Live Matches Engine */}
        {activeTab === 'overview' && (
          <LandingHero
            onEnterDashboard={() => setActiveTab('matches')}
            liveMatchesCount={liveMatchesCount}
          />
        )}

        {/* Sport Match Sound & Ambience Controller */}
        <AudioBar currentSport={selectedMatch?.sports} />

        {/* Live Engine Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight flex items-center gap-2">
              <span>Current Matches</span>
            </h2>
            <div className="bg-black text-[#10B981] border-2 border-black px-3 py-1 font-mono font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000]">
              API: 11 ONLINE
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pills */}
            <div className="flex items-center bg-white border-2 border-black p-1 shadow-[3px_3px_0px_0px_#000000]">
              {[
                { id: 'all', label: 'All' },
                { id: 'live', label: '● Live' },
                { id: 'scheduled', label: 'Upcoming' },
                { id: 'finished', label: 'Past' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedStatusFilter(pill.id)}
                  className={`px-3 py-1 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    selectedStatusFilter === pill.id
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-neutral-100'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Sport Category Filter */}
            <select
              value={selectedSportFilter}
              onChange={(e) => setSelectedSportFilter(e.target.value)}
              className="bg-white border-2 border-black px-3 py-1.5 font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] outline-none cursor-pointer"
            >
              <option value="all">All Sports</option>
              <option value="football">⚽ Football</option>
              <option value="cricket">🏏 Cricket</option>
              <option value="basketball">🏀 Basketball</option>
              <option value="tennis">🎾 Tennis</option>
              <option value="esports">🎮 Esports</option>
            </select>
          </div>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column — Match Cards Grid (2-Column Grid on desktop) */}
          <div className="lg:col-span-7">
            {isLoadingMatches ? (
              <div className="bg-white border-3 border-black p-12 text-center shadow-[6px_6px_0px_0px_#000000]">
                <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="font-black text-sm uppercase">Loading live matches...</p>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="bg-white border-3 border-black p-8 text-center shadow-[6px_6px_0px_0px_#000000]">
                <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                <h4 className="font-black text-lg uppercase">No matches found</h4>
                <p className="text-sm font-semibold text-neutral-600 mt-1">
                  Try changing your status or sport filter, or create a new match.
                </p>
                <button
                  onClick={() => setIsCreateMatchOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 bg-[#10B981] text-black font-black px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-xs uppercase cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create Match
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <AnimatePresence>
                  {filteredMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      isSelected={selectedMatch?.id === match.id}
                      onSelect={handleSelectMatch}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right Column — Live Commentary Sidebar */}
          <div className="lg:col-span-5 sticky top-6">
            <CommentaryFeed
              selectedMatch={selectedMatch}
              commentaries={commentaries}
              isLoading={isLoadingCommentary}
              apiBaseUrl={API_BASE_URL}
              onCommentaryAdded={(newComm) => {
                setCommentaries((prev) => {
                  const exists = prev.some((c) => Number(c.id) === Number(newComm.id));
                  return exists ? prev : [newComm, ...prev];
                });
              }}
              onAddCommentaryClick={() => {
                if (!isAuthenticated) {
                  openAuthModal('signup');
                } else {
                  setIsAddCommentaryOpen(true);
                }
              }}
            />
          </div>
        </div>

        {/* Developer Info & System Architecture Footer */}
        <Footer />
      </div>

      {/* Modals */}
      <CreateMatchModal
        isOpen={isCreateMatchOpen}
        onClose={() => setIsCreateMatchOpen(false)}
        onMatchCreated={(newMatch) => {
          setMatches((prev) => {
            const exists = prev.some((m) => Number(m.id) === Number(newMatch.id));
            return exists ? prev : [newMatch, ...prev];
          });
          setSelectedMatch(newMatch);
        }}
        apiBaseUrl={API_BASE_URL}
      />

      <AddCommentaryModal
        isOpen={isAddCommentaryOpen}
        onClose={() => setIsAddCommentaryOpen(false)}
        selectedMatch={selectedMatch}
        onCommentaryAdded={(newComm) => {
          setCommentaries((prev) => {
            const exists = prev.some((c) => Number(c.id) === Number(newComm.id));
            return exists ? prev : [newComm, ...prev];
          });
        }}
        apiBaseUrl={API_BASE_URL}
      />

      <AuthModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
};

export default App;
