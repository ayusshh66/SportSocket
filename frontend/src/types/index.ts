export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface Match {
  id: number;
  sports: string;
  homeTeam: string;
  awayTeam: string;
  status: MatchStatus;
  startTime: string;
  endTime: string;
  homeScore: number;
  awayScore: number;
  createdAt: string;
}

export interface Commentary {
  id: number;
  matchId: number;
  minute?: number | null;
  sequence?: number | null;
  period?: string | null;
  eventType?: string | null;
  actor?: string | null;
  team?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
  tags?: string[] | null;
  createdAt: string;
}

export interface WSMessage {
  type: 'welcome' | 'match_created' | 'commentary' | 'subscribed' | 'unsubscribed' | 'error';
  data?: any;
  matchId?: number | string;
  message?: string;
  timestamp?: number;
}
