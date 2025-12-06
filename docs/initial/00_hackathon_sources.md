## Public Data Sources

### Streaming Metadata

**Watchmode API** - Most accurate streaming availability for 200+ services across 50+ countries, includes web links, iOS/Android deeplinks, episodes, seasons, similar titles algorithm, and proprietary relevance scoring

**Flix Patrol** https://flixpatrol.com/about/api/

**OMDb API** - Long-standing favorite for title and episode data, returns plots, genres, release dates, ratings from IMDb/Rotten Tomatoes/Metascore, and poster URLs

**IMDb API** (AWS Data Exchange) - Comprehensive entertainment metadata including films, TV, games, credits, plots, ratings, reviews, and Box Office Mojo data

**Simkl API** - Broad catalog for movies, TV, and anime with user tracking features, watchlists, history, and content recommendations

### TV Program Guide (EPG)

**iptv-org/epg** - Open-source utilities for downloading EPG data for thousands of TV channels from hundreds of sources, supports XMLTV format

**TV Maze API** - Free alternative after TVRage shutdown, provides TV listings and show data

### Podcast Data

**iTunes Search API** - Returns podcast publisher name, genre, thumbnails, and other metadata including original RSS feed URL

**Spotify Podcast API** - Search podcast catalog, follow/unfollow podcasts, fetch episode and show information, includes resume points for user listening position

**PodcastIndex.org** - Get details on podcasts and episodes with search capabilities

**Listen Notes API** - Alternative with comprehensive podcast database

### News & Content Feeds

**NewsAPI** - Simple integration for developers, supports customizable queries with JSON format output

**Google News RSS** - Lightweight RSS for any Google News page, Python library available for parsing

**Webz.io News API** - Comprehensive coverage from real-time and archived sources across open/deep/dark web, highly customizable for finance, risk intelligence, cybersecurity

**Open RSS Feeds** - Major news outlets provide free RSS feeds (BBC, Reuters, CNN, etc.)

### Social Media

**Reddit API** - Rich discussion data, subreddit-specific content
**Twitter/X API** (limited free tier) - Real-time trends, mentions
**YouTube Data API** - Video content, trending, channels, comments
**Hacker News API** - Tech-focused discussions
**Mastodon APIs** - Decentralized social network data

## Technical Architecture

```
┌─────────────────────────────────────────┐
│     Multi-Agent Orchestration Layer     │
│         (Flow-Nexus + claude-flow)      │
└─────────────────────────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
┌───▼───┐ ┌──▼───┐ ┌──▼────┐
│Crawler│ │Search│ │Reason │ ← AgentDB (state)
│Agents │ │Agents│ │Agents │ ← ReasoningBank (traces)
└───┬───┘ └──┬───┘ └──┬────┘
    │        │        │
    └────────┼────────┘
             │
    ┌────────▼─────────┐
    │  Data Ingestion  │ ← Rust/WASM pipeline
    │   & Embeddings   │
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │   Vector Store   │ ← ruvector/Qdrant
    │   + Metadata DB  │
    └──────────────────┘
```

**Phase 1: Pre-Hackathon (2-3 weeks before)**
- Build reference architecture with Flow-Nexus for agent orchestration
- Create data ingestion pipelines using Rust/WASM for performance
- Deploy AgentDB for state management across agent swarms
- Set up starter kits with pre-configured API integrations
- Establish evaluation framework (sub-second response targets, relevance scoring)

**Phase 2: Hackathon Structure**
- **Day 1**: Data layer + embedding pipelines
- **Day 2**: Agent workflows + reasoning chains
- **Day 3**: UI + integration + demos

**Phase 3: Infrastructure**
- Self-hosted vector store (your ruvector when ready, or Qdrant/Milvus interim)
- AgentDB for conversation state + user preferences
- ReasoningBank for decision traces
- OpenRouter for cost-optimized model routing



## Agent Workflow Example

**Discovery Agent Chain**:
1. **Intent Classifier** → Parse user query, extract preferences
2. **Multi-Source Aggregator** → Parallel API calls (Watchmode, OMDb, News)
3. **Reasoning Agent** → Apply context (viewing history, time of day, mood)
4. **Ranking Agent** → Score results using learned preferences
5. **Presentation Agent** → Format for UI with deeplinks

**Cost Optimization**:
- Cache frequently accessed data (AgentDB)
- Use smaller models for classification/routing (Haiku 4.5)
- Reserve Sonnet for complex reasoning only
- Implement semantic caching for similar queries

## Hackathon Deliverables

**Minimum Viable POC**:
- 3-5 data source integrations
- Basic recommendation engine (collaborative filtering + content-based)
- Simple chat interface showing sources
- Sub-2s response time target

**Stretch Goals**:
- Multi-modal input (text, voice, image)
- Federated learning across user bases
- Real-time streaming updates
- Cross-platform deeplinks working

## Data Access Strategy

**Free Tier Stacking**:
- Use free tiers during hackathon
- Rotate API keys across team members
- Cache aggressively in AgentDB
- Implement rate limiting/queueing

**Sponsored Credits**:
- Approach data providers (Watchmode, NewsAPI) for hackathon credits
- AWS credits for hosting
- OpenRouter credits for inference

This structure leverages your existing stack while staying platform-agnostic. The agent orchestration model scales naturally, and you can swap data sources without refactoring core logic.
---
```

🌍 AGENTICS : GLOBAL HACKATHON — "Learn. Build. Earn."
Presented by Agentics Foundation × TV5MONDE USA × Provence Tourisme
⸻
🎯 THE CHALLENGE
Every night, millions spend up to 45 minutes deciding what to watch,  billions of hours lost every day.
Not from lack of content, but from fragmentation.
The mission: Build the world's first AI-native map of cultural content.
So anyone, anywhere, can simply say:
"Find me a French comedy tonight" — and get an instant, verified answer.
⸻
🚀 THE EVENT
When: December 3-5, 2025
Where: Paris × Tokyo × Toronto × … + Online
Format: 72-hour global hybrid hackathon ,  collaborative, creative, and agentic.
Teams will prototype an AI-powered media-discoverability engine, connecting people, languages, and platforms through open innovation.
⸻
🧠 WHY JOIN
Learn. 
Gain hands-on experience with multi-agent AI, verifiable data, and decentralized tools.

Build. 
Collaborate with international teammates on a real-world cultural challenge.

Earn. 
Every contribution is logged on-chain via the Global Hackathon DAO, granting you GHA Tokens (Global Hackathon Agent) — proof of action, ownership, and impact.

You don't just build — you have a vested interest in what you create.
⸻
🪙 THE GLOBAL HACKATHON AGENT TOKEN (GHA)
Each participant's contribution generates Proof of Action, issued as GHA Tokens.
These tokens represent:

🧩 Your verified participation
💰 Your proportional stake in future project success
🗳️ Your governance rights within the DAO

If a prototype becomes a commercial product (for example, a TV5MONDE app), smart contracts automatically distribute shared revenue to all contributors holding GHA tokens.
Transparent. Fair. Global.
⸻
💰 HOW REVENUE SHARING WORKS
1️⃣ Project Launch — When a prototype developed during the hackathon becomes a product (app, API, or integration), it is registered under the Agentics DAO.
2️⃣ Revenue Flow — Any commercial income (licensing, sales, API usage, partnerships) passes through the DAO smart contract.
3️⃣ Token-Based Distribution — Revenue is proportionally divided among GHA token holders, according to their recorded contribution (Proof of Action).
4️⃣ Continuous Earnings — Contributors continue to receive micro-royalties each time their project generates revenue — even years later.
5️⃣ Transparency — All transactions are visible on-chain, ensuring a fair, auditable system that rewards effort, not hierarchy.
💎 Every contribution matters — every builder earns.
⸻
🏗️ BUILDING THE FUTURE OF HACKATHONS
This inaugural Global Hackathon isn't just a one-time event — it's the launch of an entire ecosystem.
We're creating a replicable pipeline that will attract more brands, more challenges, and more opportunities for builders worldwide.

Making History Together
We're pioneering a new model where developers, designers, and innovators can do what they love while sharing in the value they create. No more building for free. No more ideas without ownership. This is the first step toward a future where every hackathon becomes a launchpad for shared success.

Initial DAO Seeding
As a gesture of commitment and to kickstart the ecosystem, TV5MONDE will inject $5,000 USD into the DAO treasury. This seed funding will be converted to Bitcoin and tokenized within the DAO, providing initial liquidity and demonstrating the real value backing this initiative.
⸻
🌐 WHO'S INVOLVED
Founding Partners:

Agentics France - the trigger
Agentics Foundation & all chapters worldwide — Global ecosystem of superstars
TV5MONDE USA — North America's leading French-language network
Provence Tourisme — Cultural and experiential innovation partner

Hosts

École 42 (Paris / Tokyo / …)
Agentics Chapters Worldwide — from Toronto to Paris, London to Dubai, Marseille to Tokyo

⸻
💬 THE SPIRIT
"This isn't just another hackathon — it's a collective experiment in building the future together.
Open, inclusive, and powered by participation and curiosity."
⸻
🗓️ REGISTER NOW
🌐 globalhackathon.agentics.org
📅 December 3, 2025
🔖 #GlobalAIHackathon #LearnBuildEarn #AgenticsFoundation

```