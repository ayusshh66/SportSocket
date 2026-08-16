import "dotenv/config";
import fs from "fs/promises";

export interface SeedMatch {
    id?: number;
    sport?: string;
    sports?: string;
    homeTeam: string;
    awayTeam: string;
    startTime?: string;
    endTime?: string;
    homeScore?: number;
    awayScore?: number;
    status?: "scheduled" | "live" | "finished";
}

export interface MatchRecord {
    id: number;
    sports: string;
    homeTeam: string;
    awayTeam: string;
    status: "scheduled" | "live" | "finished";
    startTime: string | Date;
    endTime: string | Date;
    homeScore: number;
    awayScore: number;
    createdAt?: string | Date;
}

export interface CommentaryEntry {
    matchId?: number;
    minute?: number;
    sequence?: number;
    period?: string;
    eventType?: string;
    actor?: string;
    team?: string;
    message: string;
    metadata?: Record<string, unknown>;
    tags?: string[];
    scoreDelta?: {
        home?: number;
        away?: number;
    };
    runs?: number;
}

export interface SeedJsonStructure {
    matches?: SeedMatch[];
    commentary?: CommentaryEntry[];
    feed?: CommentaryEntry[];
}

export interface MatchState {
    match: MatchRecord;
    score: { home: number; away: number };
    fakeNext: "home" | "away";
}

const DELAY_MS = Number.parseInt(process.env.DELAY_MS || "250", 10);
const NEW_MATCH_DELAY_MIN_MS = 2000;
const NEW_MATCH_DELAY_MAX_MS = 3000;
const DEFAULT_MATCH_DURATION_MINUTES = Number.parseInt(
    process.env.SEED_MATCH_DURATION_MINUTES || "120",
    10,
);
const FORCE_LIVE =
    process.env.SEED_FORCE_LIVE !== "0" &&
    process.env.SEED_FORCE_LIVE !== "false";

const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 8000}/api`;

const DEFAULT_DATA_FILE = new URL("../data/data.json", import.meta.url);

async function readJsonFile<T>(fileUrl: URL | string): Promise<T> {
    const raw = await fs.readFile(fileUrl, "utf8");
    const trimmed = raw.trim();
    if (!trimmed) {
        throw new Error(`Seed data file at ${String(fileUrl)} is empty.`);
    }
    return JSON.parse(trimmed) as T;
}

async function loadSeedData(): Promise<{ feed: CommentaryEntry[]; matches: SeedMatch[] }> {
    const parsed = await readJsonFile<SeedJsonStructure | CommentaryEntry[]>(DEFAULT_DATA_FILE);

    if (Array.isArray(parsed)) {
        return { feed: parsed, matches: [] };
    }

    if (Array.isArray(parsed.commentary)) {
        return { feed: parsed.commentary, matches: parsed.matches ?? [] };
    }

    if (Array.isArray(parsed.feed)) {
        return { feed: parsed.feed, matches: parsed.matches ?? [] };
    }

    throw new Error(
        "Seed data must be an array or contain a commentary/feed array.",
    );
}

async function fetchMatches(limit = 100): Promise<MatchRecord[]> {
    try {
        const response = await fetch(`${API_URL}/matches?limit=${limit}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch matches: ${response.status} ${response.statusText}`);
        }
        const payload = (await response.json()) as { data?: MatchRecord[] };
        return Array.isArray(payload.data) ? payload.data : [];
    } catch (err: any) {
        if (err.cause && (err.cause.code === "ECONNREFUSED" || err.message.includes("fetch failed"))) {
            throw new Error(`Could not connect to backend server at ${API_URL}. Please make sure your server is running first ('npm run dev').`);
        }
        throw err;
    }
}

function parseDate(value?: string | Date | null): Date | null {
    if (!value) {
        return null;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function isLiveMatch(match: { startTime?: string | Date | null; endTime?: string | Date | null }): boolean {
    const start = parseDate(match.startTime);
    const end = parseDate(match.endTime);
    if (!start || !end) {
        return false;
    }
    const now = new Date();
    return now >= start && now < end;
}

function buildMatchTimes(seedMatch: SeedMatch): { startTime: string; endTime: string } {
    const now = new Date();
    const durationMs = DEFAULT_MATCH_DURATION_MINUTES * 60 * 1000;

    let start = parseDate(seedMatch.startTime);
    let end = parseDate(seedMatch.endTime);

    if (!start && !end) {
        start = new Date(now.getTime() - 5 * 60 * 1000);
        end = new Date(start.getTime() + durationMs);
    } else {
        if (start && !end) {
            end = new Date(start.getTime() + durationMs);
        }
        if (!start && end) {
            start = new Date(end.getTime() - durationMs);
        }
    }

    if (FORCE_LIVE && start && end) {
        if (!(now >= start && now < end)) {
            start = new Date(now.getTime() - 5 * 60 * 1000);
            end = new Date(start.getTime() + durationMs);
        }
    }

    if (!start || !end) {
        throw new Error("Seed match must include valid startTime and endTime.");
    }

    return {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
    };
}

async function createMatch(seedMatch: SeedMatch): Promise<MatchRecord> {
    const { startTime, endTime } = buildMatchTimes(seedMatch);
    const sportName = seedMatch.sports || seedMatch.sport || "general";

    const response = await fetch(`${API_URL}/matches`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            sports: sportName,
            homeTeam: seedMatch.homeTeam,
            awayTeam: seedMatch.awayTeam,
            startTime,
            endTime,
            homeScore: seedMatch.homeScore ?? 0,
            awayScore: seedMatch.awayScore ?? 0,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create match: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responsePayload = (await response.json()) as { data: MatchRecord };
    return responsePayload.data;
}

async function insertCommentary(matchId: number, entry: CommentaryEntry): Promise<CommentaryEntry> {
    const payload: Record<string, unknown> = {
        message: entry.message ?? "Update",
    };
    if (entry.minute !== undefined && entry.minute !== null) {
        payload.minute = entry.minute;
    }
    if (entry.sequence !== undefined && entry.sequence !== null) {
        payload.sequence = entry.sequence;
    }
    if (entry.period !== undefined && entry.period !== null) {
        payload.period = entry.period;
    }
    if (entry.eventType !== undefined && entry.eventType !== null) {
        payload.eventType = entry.eventType;
    }
    if (entry.actor !== undefined && entry.actor !== null) {
        payload.actor = entry.actor;
    }
    if (entry.team !== undefined && entry.team !== null) {
        payload.team = entry.team;
    }
    if (entry.metadata !== undefined && entry.metadata !== null) {
        payload.metadata = entry.metadata;
    }
    if (entry.tags !== undefined && entry.tags !== null) {
        payload.tags = entry.tags;
    }

    const response = await fetch(`${API_URL}/matches/${matchId}/commentary`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create commentary: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responsePayload = (await response.json()) as { data: CommentaryEntry };
    return responsePayload.data;
}

function inningsRank(period?: string | null): number {
    if (!period) {
        return 0;
    }
    const lower = String(period).toLowerCase();
    const match = lower.match(/(\d+)(st|nd|rd|th)/);
    if (match) {
        return Number(match[1]) || 0;
    }
    if (lower.includes("first")) {
        return 1;
    }
    if (lower.includes("second")) {
        return 2;
    }
    if (lower.includes("third")) {
        return 3;
    }
    if (lower.includes("fourth")) {
        return 4;
    }
    return 0;
}

function normalizeCricketFeed(entries: CommentaryEntry[], match: MatchRecord): CommentaryEntry[] {
    const sorted = [...entries].sort((a, b) => {
        const inningsDiff = inningsRank(a.period) - inningsRank(b.period);
        if (inningsDiff !== 0) {
            return inningsDiff;
        }
        const seqA = Number.isFinite(a.sequence)
            ? (a.sequence as number)
            : Number.MAX_SAFE_INTEGER;
        const seqB = Number.isFinite(b.sequence)
            ? (b.sequence as number)
            : Number.MAX_SAFE_INTEGER;
        if (seqA !== seqB) {
            return seqA - seqB;
        }
        const minA = Number.isFinite(a.minute) ? (a.minute as number) : Number.MAX_SAFE_INTEGER;
        const minB = Number.isFinite(b.minute) ? (b.minute as number) : Number.MAX_SAFE_INTEGER;
        return minA - minB;
    });

    const grouped = new Map<number, CommentaryEntry[]>();
    for (const entry of sorted) {
        const key = inningsRank(entry.period);
        if (!grouped.has(key)) {
            grouped.set(key, []);
        }
        grouped.get(key)!.push(entry);
    }

    const ordered: CommentaryEntry[] = [];
    const inningsKeys = Array.from(grouped.keys()).sort((a, b) => a - b);

    for (const key of inningsKeys) {
        const inningsEntries = grouped.get(key) || [];
        const primaryTeam = inningsEntries.find(
            (entry) => entry.team === match.homeTeam || entry.team === match.awayTeam,
        )?.team;
        const secondaryTeam =
            primaryTeam === match.homeTeam ? match.awayTeam : match.homeTeam;

        const neutral = inningsEntries.filter(
            (entry) => !entry.team || entry.team === "neutral",
        );
        const primary = inningsEntries.filter(
            (entry) => entry.team === primaryTeam,
        );
        const secondary = inningsEntries.filter(
            (entry) => entry.team === secondaryTeam,
        );
        const other = inningsEntries.filter(
            (entry) =>
                entry.team &&
                entry.team !== "neutral" &&
                entry.team !== primaryTeam &&
                entry.team !== secondaryTeam,
        );

        ordered.push(...neutral, ...primary, ...secondary, ...other);
    }

    return ordered;
}

function replaceTrailingTeam(message: string, replacements: Map<string, string>): string {
    if (typeof message !== "string") {
        return message;
    }
    const match = message.match(/\(([^)]+)\)\s*$/);
    if (!match) {
        return message;
    }
    const nextTeam = replacements.get(match[1]);
    if (!nextTeam) {
        return message;
    }
    return message.replace(/\([^)]+\)\s*$/, `(${nextTeam})`);
}

function cloneCommentaryEntries(
    entries: CommentaryEntry[],
    templateMatch: SeedMatch,
    targetMatch: SeedMatch,
): CommentaryEntry[] {
    const replacements = new Map<string, string>([
        [templateMatch.homeTeam, targetMatch.homeTeam],
        [templateMatch.awayTeam, targetMatch.awayTeam],
    ]);

    return entries.map((entry) => {
        const next: CommentaryEntry = { ...entry, matchId: targetMatch.id };
        if (entry.team === templateMatch.homeTeam) {
            next.team = targetMatch.homeTeam;
        } else if (entry.team === templateMatch.awayTeam) {
            next.team = targetMatch.awayTeam;
        }
        if (entry.message) {
            next.message = replaceTrailingTeam(entry.message, replacements);
        }
        return next;
    });
}

function expandFeedForMatches(feed: CommentaryEntry[], seedMatches: SeedMatch[]): CommentaryEntry[] {
    if (!Array.isArray(seedMatches) || seedMatches.length === 0) {
        return feed;
    }

    const byMatchId = new Map<number, CommentaryEntry[]>();
    for (const entry of feed) {
        if (!Number.isInteger(entry.matchId)) {
            continue;
        }
        const mId = entry.matchId as number;
        if (!byMatchId.has(mId)) {
            byMatchId.set(mId, []);
        }
        byMatchId.get(mId)!.push(entry);
    }

    const templateBySport = new Map<string, SeedMatch>();
    for (const match of seedMatches) {
        const sportKey = match.sports || match.sport || "general";
        if (match.id !== undefined && !templateBySport.has(sportKey) && byMatchId.has(match.id)) {
            templateBySport.set(sportKey, match);
        }
    }

    const expanded = [...feed];
    for (const match of seedMatches) {
        if (match.id !== undefined && byMatchId.has(match.id)) {
            continue;
        }
        const sportKey = match.sports || match.sport || "general";
        const templateMatch = templateBySport.get(sportKey);
        if (!templateMatch || templateMatch.id === undefined) {
            continue;
        }
        const templateEntries = byMatchId.get(templateMatch.id) || [];
        expanded.push(
            ...cloneCommentaryEntries(templateEntries, templateMatch, match),
        );
    }

    return expanded;
}

function buildRandomizedFeed(
    feed: CommentaryEntry[],
    matchMap: Map<number, MatchState>,
): CommentaryEntry[] {
    const buckets = new Map<number | null, CommentaryEntry[]>();
    for (const entry of feed) {
        const key = Number.isInteger(entry.matchId) ? (entry.matchId as number) : null;
        if (!buckets.has(key)) {
            buckets.set(key, []);
        }
        buckets.get(key)!.push(entry);
    }

    for (const [matchId, entries] of buckets) {
        if (matchId === null || !Number.isInteger(matchId)) {
            continue;
        }
        const target = matchMap.get(matchId);
        const sport = (target?.match?.sports || "").toLowerCase();
        if (sport === "cricket" && target?.match) {
            buckets.set(matchId, normalizeCricketFeed(entries, target.match));
        }
    }

    const matchIds = Array.from(buckets.keys()).filter((id): id is number => id !== null);
    const randomized: CommentaryEntry[] = [];
    let lastMatchId: number | null = null;

    while (randomized.length < feed.length) {
        const candidates = matchIds.filter(
            (id) => (buckets.get(id) || []).length > 0,
        );
        if (candidates.length === 0) {
            break;
        }

        let selectable = candidates;
        if (lastMatchId !== null && candidates.length > 1) {
            const withoutLast = candidates.filter((id) => id !== lastMatchId);
            if (withoutLast.length > 0) {
                selectable = withoutLast;
            }
        }

        const choice = selectable[Math.floor(Math.random() * selectable.length)];
        const nextEntry = buckets.get(choice)!.shift();
        if (nextEntry) {
            randomized.push(nextEntry);
        }
        lastMatchId = choice;
    }

    return randomized;
}

function getMatchEntry(entry: CommentaryEntry, matchMap: Map<number, MatchState>): MatchState | null {
    if (!Number.isInteger(entry.matchId)) {
        return null;
    }
    return matchMap.get(entry.matchId as number) ?? null;
}

function randomMatchDelay(): number {
    const range = NEW_MATCH_DELAY_MAX_MS - NEW_MATCH_DELAY_MIN_MS;
    return NEW_MATCH_DELAY_MIN_MS + Math.floor(Math.random() * (range + 1));
}

export async function seed(): Promise<void> {
    console.log(`📡 Seeding via API: ${API_URL}`);

    const { feed, matches: seedMatches } = await loadSeedData();
    const matchesList = await fetchMatches();

    const matchMap = new Map<number, MatchState>();
    const matchKeyMap = new Map<string, MatchRecord>();

    for (const match of matchesList) {
        if (FORCE_LIVE && !isLiveMatch(match)) {
            continue;
        }
        const sportKey = match.sports;
        const key = `${sportKey}|${match.homeTeam}|${match.awayTeam}`;
        if (!matchKeyMap.has(key)) {
            matchKeyMap.set(key, match);
        }
        matchMap.set(match.id, {
            match,
            score: { home: match.homeScore ?? 0, away: match.awayScore ?? 0 },
            fakeNext: Math.random() < 0.5 ? "home" : "away",
        });
    }

    if (Array.isArray(seedMatches) && seedMatches.length > 0) {
        for (const seedMatch of seedMatches) {
            const sportKey = seedMatch.sports || seedMatch.sport || "general";
            const key = `${sportKey}|${seedMatch.homeTeam}|${seedMatch.awayTeam}`;
            let match = matchKeyMap.get(key);

            if (!match || (FORCE_LIVE && !isLiveMatch(match))) {
                match = await createMatch(seedMatch);
                matchKeyMap.set(key, match);
                const delayMs = randomMatchDelay();
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }

            if (Number.isInteger(seedMatch.id)) {
                matchMap.set(seedMatch.id as number, {
                    match,
                    score: { home: match.homeScore ?? 0, away: match.awayScore ?? 0 },
                    fakeNext: Math.random() < 0.5 ? "home" : "away",
                });
            }
            matchMap.set(match.id, {
                match,
                score: { home: match.homeScore ?? 0, away: match.awayScore ?? 0 },
                fakeNext: Math.random() < 0.5 ? "home" : "away",
            });
        }
    }

    if (matchMap.size === 0) {
        throw new Error("No matches found or created in the database.");
    }

    const expandedFeed = expandFeedForMatches(feed, seedMatches);
    const randomizedFeed = buildRandomizedFeed(expandedFeed, matchMap);

    console.log(`🚀 Starting commentary stream (${randomizedFeed.length} updates)...`);

    for (let i = 0; i < randomizedFeed.length; i += 1) {
        const entry = randomizedFeed[i];
        const target = getMatchEntry(entry, matchMap);
        if (!target) {
            console.warn(
                "⚠️ Skipping entry: matchId missing or not found:",
                entry.message,
            );
            continue;
        }
        const match = target.match;

        const row = await insertCommentary(match.id, entry);
        console.log(`📣 [Match ${match.id}] ${row.message}`);

        if (DELAY_MS > 0) {
            await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
        }
    }

    console.log("✅ Seeding completed successfully.");
}

// Auto-run if executed directly
seed().catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
});