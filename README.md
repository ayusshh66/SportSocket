# ⚡ Sportz — Real-Time Sports Broadcasting & Fan Engagement Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express.js_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Arcjet Security](https://img.shields.io/badge/Arcjet-Shield_Security-6D28D9?style=for-the-badge)](https://arcjet.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **A high-throughput, low-latency live sports commentary and fan engagement engine built with Express 5, WebSockets, React 19, Drizzle ORM, and Web Audio API procedural acoustics.**

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Scalability Blueprint: From 1k to 1M+ Concurrent Fans](#-scalability-blueprint-from-1k-to-1m-concurrent-fans)
- [Security & Rate Limiting](#-security--rate-limiting)
- [Tech Stack](#-tech-stack)
- [API & WebSocket Protocol Specification](#-api--websocket-protocol-specification)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Development](#-getting-started--local-development)
- [Environment Configuration](#-environment-configuration)
- [Author & Acknowledgments](#-author--acknowledgments)

---

## 🎯 Overview

**Sportz Dashboard** is a sub-second sports telemetry platform that bridges the gap between official broadcast feeds and real-time community engagement. Designed with a **Neo-Brutalist aesthetic**, the system enables sports commentators to broadcast rapid match events and gives fans a zero-latency stream of live scores, highlights, ball-by-ball updates, and interactive live reactions.

Traditional sports dashboards suffer from high polling latencies or cumbersome manual commentary input. Sportz solves this through:
1. **Sub-second Event Broadcasts**: Channel-isolated WebSocket subscriptions (`subscribe(matchId)`).
2. **1-Click Commentator Studio**: Rapid macro actions that auto-generate and publish structured match events instantly with zero manual typing.
3. **Client-Side Procedural Audio Engine**: Web Audio API acoustics that synthesize stadium roar, referee whistles, cricket bat impacts, basketball floor squeaks, and gaming killstreaks without downloading heavy MP3/WAV assets.
4. **Deduplicated Optimistic Pipeline**: Resilient multi-channel event ingestion that guarantees zero duplicate events across simultaneous HTTP responses and WebSocket broadcast pushes.

---

## ✨ Key Features

### 1. 🏟️ Multi-Sport Real-Time Engine
- Out-of-the-box support for **Football**, **Cricket**, **Basketball**, **Tennis**, and **Esports** (League of Legends, Valorant).
- Dynamic sport format validation, quarter/half/over tracking, and sport-specific timeline badges.

### 2. ⚡ 1-Click Quick Actions (Macro Bar)
- Commentators can broadcast instant match events with **one single click**:
  - **Esports**: `💥 First Blood`, `👑 Ace / Pentakill`, `💣 1v3 Clutch`, `🐲 Baron/Dragon`, `🏆 Round Win`
  - **Football**: `⚽ GOAL!`, `🧤 Huge Save`, `🟨 Yellow Card`, `🟥 Red Card`, `🎯 Penalty`
  - **Cricket**: `🏏 SIX (6)`, `🏏 FOUR (4)`, `💥 WICKET!`, `🎯 DRS Review`, `⭐ 50/100 Milestone`
  - **Basketball**: `🏀 3-Pointer`, `💥 Slam Dunk`, `🛡️ Big Block`, `⏱️ Timeout`
  - **Tennis**: `🎾 Ace`, `💥 Break Point`, `🔥 Match Point`
- Automatically injects contextual players, timestamps, sequence IDs, and searchable tag indexes.

### 3. 🔥 Interactive Fan Live Reactions Bar
- Real-time emoji reaction burst: **🔥 Hype**, **👏 GG/Applause**, **😱 Shock**, **🏆 Victory**, **💀 RIP**.
- Physics-based **floating particle animations** using Framer Motion that drift up the screen on click.
- Real-time live count aggregation with audible pop feedback.

### 4. 🔊 Procedural Web Audio Engine
- Synthesizes 100% pure audio through the browser's native `AudioContext`:
  - **Football**: Dual-tone referee whistle (`2.8 kHz`) + pink-noise crowd surge.
  - **Cricket**: Willow wood acoustic thwack + boundary roar.
  - **Basketball**: Hardwood sneaker squeak (`sawtooth 1.8-2.6 kHz`) + heavy floor dribble thud.
  - **Esports**: Sci-fi laser synthesizer + arena excitement drone.
  - **Stadium Ambience**: Modulated continuous crowd bed with low-pass LFO filters.

### 5. 🛡️ Arcjet Enterprise Security
- Integrated **Arcjet bot detection and rate limiting** on both HTTP REST endpoints and incoming WebSocket connections.
- Defense against DDoS attacks, automated scraping, and spam flooding.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Frontend Client (React 19 + Framer Motion)"]
        UI["Neo-Brutalist Dashboard UI"]
        Audio["Procedural Web Audio Engine"]
        WSClient["WebSocket Client Manager"]
        QuickStudio["1-Click Quick Action Studio"]
    end

    subgraph SecurityLayer ["Security & Ingress (Arcjet)"]
        WAF["Arcjet Bot Protection & Rate Limiter"]
    end

    subgraph APILayer ["Backend Server (Node.js + Express 5)"]
        Router["Express REST API (/api/*)"]
        WSServer["WebSocket Server (ws:// /ws)"]
        SubManager["Channel Room Subscription Manager"]
    end

    subgraph DataLayer ["Data & Persistence"]
        Drizzle["Drizzle ORM Engine"]
        Postgres[("PostgreSQL Database (Neon DB)")]
        RedisCache[("Redis Pub/Sub & In-Memory Cache")]
    end

    UI --> WSClient
    QuickStudio -->|HTTP POST| WAF
    WSClient -->|WS Connect & Subscribe| WAF
    WAF --> Router
    WAF --> WSServer

    Router --> Drizzle
    Drizzle --> Postgres
    Router -->|broadcastCommentary| SubManager
    SubManager -->|Push to Match Room| WSClient
    WSServer --> SubManager

    SubManager -.->|Distributed Mode| RedisCache
    UI --> Audio
```

---

## 📈 Scalability Blueprint: From 1k to 1M+ Concurrent Fans

Scaling a real-time sports broadcasting system requires decoupling **data ingestion** from **client broadcast distribution**.

```
Single Match (e.g. El Clásico) ➔ 1 Event (Goal) ➔ 500,000 Connected Fans ➔ 500,000 WebSocket Messages / sec
```

### Architecture Evolution Phases:

```mermaid
graph LR
    subgraph Phase1 ["Phase 1: Single Node (0 - 10k Fans)"]
        A1[Single Express + WS Node] --> B1[In-Memory Map]
        A1 --> C1[PostgreSQL Database]
    end

    subgraph Phase2 ["Phase 2: Clustered Backend (10k - 200k Fans)"]
        A2[Nginx / ALB Load Balancer] --> B2[Node Instance 1]
        A2 --> C2[Node Instance 2]
        A2 --> D2[Node Instance N]
        B2 & C2 & D2 <--> E2[(Redis Pub/Sub Message Bus)]
        B2 & C2 & D2 --> F2[(PostgreSQL + Read Replicas)]
    end

    subgraph Phase3 ["Phase 3: Global Edge Scale (200k - 1M+ Fans)"]
        A3[Cloudflare Edge / Anycast DNS] --> B3[Edge WebSocket Gateways]
        B3 --> C3[(Dragonfly / Redis Cluster)]
        C3 <--> D3[Kafka Event Broker]
        D3 --> E3[Event Processing Workers]
        E3 --> F3[(Distributed Postgres / Neon Serverless)]
    end
```

### 1. Phase 1 (Current Implementation): Single-Node Room In-Memory Subscription
- In-memory `Map<string, WebSocket[]>` handles room subscriptions.
- PostgreSQL manages persistent matches and commentaries.
- Zero-latency broadcast with low server memory footprint (< 100MB).

### 2. Phase 2 (10,000 – 200,000 Concurrent Users): Redis Pub/Sub Cluster
- **Horizontal Pod Autoscaling**: Spin up multiple stateless backend nodes behind an AWS ALB or Nginx Reverse Proxy.
- **Redis Pub/Sub Relay**: When Node A receives a new commentary via HTTP, it publishes `PUBLISH match:123 payload`. Nodes B, C, and D receive the message and push it to their locally connected subscribers.
- **PgBouncer Connection Pooling**: Prevents database connection exhaustion during traffic spikes.

### 3. Phase 3 (200,000 – 1,000,000+ Concurrent Fans): Global Edge & Kafka Stream
- **Edge WebSocket Gateways**: Terminate WebSockets at edge locations (Cloudflare Workers / AWS API Gateway WebSockets) to reduce round-trip time.
- **Kafka Event Streaming**: Commentary events and high-velocity fan reactions stream into Apache Kafka topics for asynchronous durability, audit logs, and analytical aggregation.
- **Database Write Decoupling**: Score updates write immediately to Redis in-memory cache; background consumers write batches to PostgreSQL.

---

## 🔒 Security & Rate Limiting

The application incorporates **Arcjet** for defense-in-depth:
- **WebSocket Shield**: Evaluates incoming handshake requests, client user agents, and source IP addresses.
- **Token Bucket Rate Limiting**: Restricts rapid comment spamming or brute-force subscription attacks (HTTP 429 / WS Close 1013).
- **Zod Schema Validation**: Strict type enforcement for match parameters, score boundaries, and input payload sanitization before reaching the ORM.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Neo-Brutalist Design Tokens
- **Animations**: Framer Motion (Layout transitions, physics floating reactions)
- **Icons**: Lucide React
- **Audio**: Web Audio API (Native browser procedural oscillator & noise synthesis)
- **Build Tool**: Vite 8

### Backend
- **Runtime**: Node.js (ES Modules), TypeScript (`tsx`)
- **Web Framework**: Express 5
- **Real-Time Engine**: `ws` (High-performance WebSocket implementation)
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL / Neon Serverless
- **Validation**: Zod
- **Security & WAF**: Arcjet (`@arcjet/node`, `@arcjet/inspect`)

---

## 📡 API & WebSocket Protocol Specification

### REST API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/matches` | Retrieve all matches with sport and status filtering | No |
| `POST` | `/api/matches` | Create a new match fixture | Yes |
| `GET` | `/api/matches/:id/commentary` | Fetch timeline commentaries for a match (Limit 100) | No |
| `POST` | `/api/matches/:id/commentary` | Post a new commentary event & trigger WS broadcast | Yes |
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Login and obtain JWT authentication token | No |

---

### WebSocket Protocol (`ws://localhost:8000/ws`)

#### 1. Subscribe to Match Channel
```json
{
  "type": "subscribe",
  "matchId": 1
}
```
**Server Response:**
```json
{
  "type": "subscribed",
  "matchId": 1,
  "timestamp": 1771234567890
}
```

#### 2. Broadcasted Commentary Event (Server ➔ Client)
```json
{
  "type": "commentary",
  "data": {
    "id": 540,
    "matchId": 1,
    "minute": 74,
    "period": "2nd Half",
    "eventType": "GOAL",
    "actor": "Vinicius Jr",
    "team": "Real Madrid",
    "message": "GOAAAL! Vinicius Jr cuts inside from the left flank and curls a sublime strike into the far top corner!",
    "tags": ["goal", "screamer", "elclasico"],
    "createdAt": "2026-08-17T16:30:00.000Z"
  }
}
```

#### 3. Match Created Broadcast (Server ➔ All Clients)
```json
{
  "type": "match_created",
  "data": {
    "id": 5,
    "sports": "Esports",
    "homeTeam": "T1 (LoL)",
    "awayTeam": "Gen.G",
    "status": "live",
    "homeScore": 14,
    "awayScore": 9
  }
}
```

---

## 📂 Project Directory Structure

```text
sportz_dashboard/
├── backend/
│   ├── drizzle/                     # Database migrations & schema snapshots
│   ├── src/
│   │   ├── db/                      # Drizzle ORM configuration, schema & relations
│   │   │   ├── schema.ts            # Matches, commentary, users schemas
│   │   │   ├── relations.ts         # Database foreign key relations
│   │   │   └── index.ts             # Connection pool initialization
│   │   ├── routes/                  # Express REST routes
│   │   │   ├── commentary.ts        # Commentary GET & POST handlers
│   │   │   ├── matches.ts           # Match CRUD handlers
│   │   │   └── auth.ts              # Authentication handlers
│   │   ├── validation/              # Zod validation schemas
│   │   ├── ws/                      # WebSocket server & room subscription engine
│   │   │   └── index.ts             # ws attachment, connection lifecycle, broadcasting
│   │   ├── arcjet.ts                # Security & rate-limiting configuration
│   │   ├── data/                    # Seed mock fixtures & initial commentary dataset
│   │   └── index.ts                 # Main Express server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/              # React UI components (Neo-Brutalist design)
│   │   │   ├── CommentaryFeed.tsx   # Timeline feed, 1-Click Studio & Fan Reactions
│   │   │   ├── MatchCard.tsx        # Sport match cards with active live indicators
│   │   │   ├── AddCommentaryModal.tsx # Full custom event publisher modal
│   │   │   ├── CreateMatchModal.tsx # Match creator with sport timing presets
│   │   │   ├── AudioBar.tsx         # Stadium ambience & sound controller
│   │   │   ├── DashboardHeader.tsx  # Header navigation, stats & connection status
│   │   │   ├── LandingHero.tsx      # Overview banner & stats overview
│   │   │   ├── AuthModal.tsx        # Login & Registration modal
│   │   │   └── Footer.tsx           # Architecture info & Developer credits
│   │   ├── context/                 # React Context (AuthContext)
│   │   ├── utils/
│   │   │   └── sportsAudio.ts       # Procedural Web Audio API sound synthesis engine
│   │   ├── types.ts                 # Shared TypeScript interfaces & types
│   │   ├── App.tsx                  # Core application orchestration & WebSocket listeners
│   │   └── main.tsx                 # React DOM mount
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **pnpm**
- **PostgreSQL Database** (Local or Neon DB serverless instance)

---

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/sportz_dashboard.git
cd sportz_dashboard
```

---

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=8000
DATABASE_URL=postgresql://username:password@localhost:5432/sportz_db
JWT_SECRET=your_super_secret_jwt_key
ARCJET_KEY=ajkey_your_arcjet_key_here
ARCJET_ENV=development
```

Run database migrations & seed:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```
*Backend runs on `http://localhost:8000` (API) and `ws://localhost:8000/ws` (WebSockets).*

---

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 👨‍💻 Author & Architecture

**Ayush Hemdani**
- **Role**: Full Stack & Distributed Systems Developer
- **Specialization**: Real-time WebSocket infrastructures, procedural audio synthesis, and high-performance reactive interfaces.
- **GitHub**: [@ayusshh66](https://github.com/ayusshh66)

---

## 📜 License
This project is open-source and available under the [ISC License](LICENSE).
