# Product Requirements Document (PRD)
## TV5MONDE Content Discovery System - "What to Watch in 60 Seconds"

**Version**: 1.0
**Date**: 2025-12-06
**Author**: Agentic Pancakes Team
**Hackathon**: TV5 Agentics Hackathon

---

## 1. Executive Summary

### 1.1 Problem Statement

> **"Millions spend up to 45 minutes deciding what to watch — billions of hours lost every day."**

Users face decision paralysis when choosing content across streaming platforms. The current browse-scroll-abandon cycle wastes time and leads to frustration, often resulting in rewatching familiar content rather than discovering new favorites.

### 1.2 Solution

**"What to Watch in 60 Seconds"** — An emotion-first content discovery system that:

1. Asks "How do you feel?" instead of "What genre?"
2. Uses 2 binary choices to capture emotional state
3. Deploys a 6-agent AI swarm to analyze thousands of options
4. Delivers a perfect match with one-tap deeplink to TV5MONDE

### 1.3 Value Proposition

| Old Way | Our Way |
|---------|---------|
| Browse → Scroll → Read → Watch trailers → Scroll → Give up | 2 quick taps → AI analyzes → Perfect match |
| 45 minutes wasted | 60 seconds total |
| Decision fatigue | Delightful discovery |

---

## 2. Product Vision

### 2.1 Vision Statement

*"Transform content discovery from a chore into a conversation — making TV5MONDE the most intuitive way to find French content that matches how you feel right now."*

### 2.2 Success Criteria

- **Time to recommendation**: < 60 seconds
- **Match accuracy**: > 85% user satisfaction
- **Engagement rate**: > 40% click-through to watch
- **Return usage**: > 60% weekly active return

### 2.3 Hackathon Track

**Track 1: Entertainment Discovery** — Natural language/AI-powered content discovery

---

## 3. User Personas

### 3.1 Primary Personas

| Persona | Profile | Key Need |
|---------|---------|----------|
| **Marie Dubois** | French Cinema Enthusiast, 42, Lyon | Deep cultural, auteur cinema discovery |
| **James Mitchell** | French Learner, 28, Seattle | Language learning + entertainment |
| **Sophie Renard** | Expat Nostalgia Seeker, 56, Toronto | Cultural comfort, connection to home |
| **Alexandre Fontaine** | Busy Professional, 34, Brussels | Fast, mood-accurate recommendations |
| **Yuki Tanaka** | Francophile Explorer, 31, Tokyo | Pan-Francophone cultural discovery |
| **Pierre Lefebvre** | Family Viewer, 39, Montreal | Multi-generational appropriate content |

### 3.2 User Journey (Happy Path)

```
┌─────────────────────────────────────────────────────────────────┐
│  1. OPEN APP                                                     │
│     "Hey! What are you in the mood for tonight?"                │
│                                                                  │
│  2. BINARY CHOICE 1 (5 sec)                                     │
│     [🌙 Unwind]  vs  [⚡ Engage]                                 │
│     User taps: Unwind                                           │
│                                                                  │
│  3. BINARY CHOICE 2 (5 sec)                                     │
│     [😄 Laugh]  vs  [🎭 Feel]                                   │
│     User taps: Laugh                                            │
│                                                                  │
│  4. AI PROCESSING (3 sec)                                       │
│     "Analyzing 2,847 titles for your perfect match..."          │
│     ✓ Checked trending charts                                   │
│     ✓ Matched your taste profile                                │
│     ✓ Found 3 perfect picks                                     │
│                                                                  │
│  5. RECOMMENDATION                                               │
│     🏆 "Le Sens de la Fête" - 94% match                         │
│     Light-hearted French comedy, 1h57m                          │
│     🔥 #3 Trending in France                                    │
│     [▶ WATCH NOW ON TV5MONDE]                                   │
│                                                                  │
│  6. REFINEMENT (optional)                                       │
│     💬 "Something else?" | 🎲 "Surprise me" | ⚙️ Refine         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Feature Requirements

### 4.1 MoSCoW Prioritization

#### MUST HAVE (MVP)

| ID | Feature | Description |
|----|---------|-------------|
| M1 | **Binary Choice Quiz** | 2-round mood capture UI (Unwind/Engage → Laugh/Feel/Thrill/Think) |
| M2 | **Intent Agent** | Extract emotional state from quiz + voice/text input |
| M3 | **Catalog Search** | Vector search against TV5MONDE content via RuVector |
| M4 | **Match Engine** | Score and rank content by user vector similarity |
| M5 | **Recommendation Card** | Display top pick with match %, description, deeplink |
| M6 | **MCP Server** | STDIO/SSE transport for hackathon compliance |
| M7 | **ARW Manifest** | `.well-known/arw-manifest.json` for agent discovery |

#### SHOULD HAVE

| ID | Feature | Description |
|----|---------|-------------|
| S1 | **Trend Integration** | FlixPatrol/TMDB trending boost in scoring |
| S2 | **Chat Refinement** | Natural language refinement ("more recent", "less romantic") |
| S3 | **User Profile** | Persistent 64D style vector with learning |
| S4 | **Voice Input** | Mood detection from voice tone and natural speech |
| S5 | **3 Alternatives** | Show runner-up recommendations |

#### COULD HAVE

| ID | Feature | Description |
|----|---------|-------------|
| C1 | **Watch History** | Track completions, abandons, rewatches |
| C2 | **Social Context** | Adjust for "watching with partner/family/alone" |
| C3 | **Time-Aware** | Weeknight vs weekend behavior patterns |
| C4 | **Language Learning Mode** | Difficulty ratings, subtitle options |

#### WON'T HAVE (This Release)

| ID | Feature | Reason |
|----|---------|--------|
| W1 | Multi-platform aggregation | Focus on TV5MONDE only |
| W2 | Social features | Out of scope for hackathon |
| W3 | Mobile apps | Web-first MVP |

### 4.2 Feature Specifications

#### M1: Binary Choice Quiz

**User Story**: As a user, I want to answer 2 simple questions so that the system understands my mood without cognitive effort.

**Acceptance Criteria**:
- [ ] Round 1: Unwind vs Engage (mood axis)
- [ ] Round 2: Adapts based on Round 1 (Laugh/Feel for Unwind, Thrill/Think for Engage)
- [ ] Optional Round 3: Movie vs Series (time constraint)
- [ ] Each choice takes < 3 seconds
- [ ] Visual feedback on selection
- [ ] Maps to 64D vector modifiers

**Decision Tree**:
```
                    START
                      │
         ┌────────────┴────────────┐
         │                         │
      UNWIND                    ENGAGE
         │                         │
    ┌────┴────┐               ┌────┴────┐
    │         │               │         │
  LAUGH     FEEL           THRILL    THINK
```

#### M2: Intent Agent

**User Story**: As a user, I want my emotional state understood from minimal input so that recommendations feel personalized.

**Acceptance Criteria**:
- [ ] Parse quiz answers into preference vector
- [ ] Extract mood from voice/text cues
- [ ] Identify constraints (time, who's watching)
- [ ] Update session modifiers in user vector
- [ ] Response time < 500ms

**Input → Output**:
```javascript
Input: { round1: "unwind", round2: "laugh", text: "brutal week" }
Output: {
  energy: 0.25,
  valence: 0.6,
  needs: { comfort: 0.85, humor: 0.9 },
  constraints: { maxRuntime: 120 }
}
```

#### M3: Catalog Search (RuVector)

**User Story**: As a system, I need to search thousands of titles efficiently to find the best matches.

**Acceptance Criteria**:
- [ ] Content vectors stored in RuVector (768D)
- [ ] Vector composition: plot (512D) + genre (64D) + mood (64D) + meta (128D)
- [ ] Query latency < 100ms
- [ ] Filter by platform availability (TV5MONDE)
- [ ] Return top 50 candidates for re-ranking

**Reuse**: `apps/agentdb` for vector storage and HNSW indexing

#### M6: MCP Server

**User Story**: As a hackathon judge, I need to verify MCP compliance for the submission.

**Acceptance Criteria**:
- [ ] STDIO transport for CLI integration
- [ ] SSE transport for web integration
- [ ] Tools: `get_recommendation`, `refine_search`, `get_trending`
- [ ] Resources: User profile, content catalog metadata
- [ ] Prompts: `discover_content`, `refine_recommendation`

**Reuse**: `apps/cli` MCP server implementation pattern

---

## 5. Technical Architecture

### 5.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│                   (Web App / Voice / Chat)                       │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR AGENT                           │
│                    (Claude Sonnet 4.5)                          │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
        ┌─────────────┬───────────┼───────────┬─────────────┐
        │             │           │           │             │
        ▼             ▼           ▼           ▼             ▼
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│  INTENT   │ │  CATALOG  │ │   TREND   │ │   MATCH   │ │  PRESENT  │
│  AGENT    │ │  AGENT    │ │   AGENT   │ │   AGENT   │ │   AGENT   │
│  (Haiku)  │ │ (RuVector)│ │  (TMDB)   │ │  (Haiku)  │ │ (Sonnet)  │
└───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘
        │             │           │           │             │
        └─────────────┴───────────┴───────────┴─────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
├──────────────────┬──────────────────┬───────────────────────────┤
│    RuVector      │    TMDB/Trakt    │    User Profiles          │
│  (Content DB)    │   (Trending)     │   (64D Vectors)           │
└──────────────────┴──────────────────┴───────────────────────────┘
```

### 5.2 Component Reuse

| Component | Source | Purpose |
|-----------|--------|---------|
| **AgentDB** | `apps/agentdb` | Vector storage, HNSW indexing, 150x faster search |
| **Agentic-Flow** | `apps/agentic-flow` | Agent orchestration, ReasoningBank, 66 agents |
| **MCP Server** | `apps/cli` | STDIO/SSE transport, tool definitions |
| **ARW Manifest** | `apps/media-discovery` | ARW specification compliance |
| **Chrome Extension** | `apps/arw-chrome-extension` | ARW validation |

### 5.3 Data Flow

```
1. User Input → Intent Agent
   - Quiz answers + voice/text
   - Output: Session vector modifiers

2. Intent Agent → Parallel Fan-Out
   - Catalog Agent: Query RuVector with user vector
   - Trend Agent: Fetch FlixPatrol/TMDB trending
   - (Parallel execution for speed)

3. Results → Match Agent
   - Combine similarity scores + trending boost
   - Apply constraints (time, social)
   - Rank and select top 3

4. Match Agent → Present Agent
   - Generate compelling description
   - Create deeplink to TV5MONDE
   - Format recommendation card
```

### 5.4 Matching Formula

```javascript
finalScore = (
  vectorSimilarity × 0.25 +    // Static taste DNA
  moodScore × 0.30 +           // Current mood (HIGHEST)
  intentScore × 0.20 +         // Viewing purpose
  contextScore × 0.15 +        // Situation
  trendingScore × 0.10         // What's hot
) × constraintMultiplier       // Hard filters (time, social)
```

---

## 6. API Specifications

### 6.1 MCP Tools

```typescript
// Tool: get_recommendation
interface GetRecommendationInput {
  mood: "unwind" | "engage";
  goal: "laugh" | "feel" | "thrill" | "think";
  maxRuntime?: number;
  context?: "alone" | "partner" | "family";
}

interface GetRecommendationOutput {
  topPick: {
    id: string;
    title: string;
    matchScore: number;
    description: string;
    runtime: number;
    genres: string[];
    trendingRank?: number;
    deeplink: string;
  };
  alternatives: Array<{...}>;
  reasoning: string;
}

// Tool: refine_search
interface RefineSearchInput {
  previousRecommendation: string;
  feedback: string; // Natural language: "more recent", "less intense"
}

// Tool: get_trending
interface GetTrendingInput {
  region?: string;
  contentType?: "movie" | "series";
  limit?: number;
}
```

### 6.2 ARW Endpoints

```yaml
# .well-known/arw-manifest.json
{
  "version": "0.1",
  "profile": "ARW-1",
  "site": {
    "name": "TV5MONDE Discovery",
    "description": "AI-powered French content discovery"
  },
  "content": {
    "/": { "machine_view": "/llms.txt" },
    "/discover": { "machine_view": "/discover.llm.md" }
  },
  "actions": [
    {
      "name": "get_recommendation",
      "endpoint": "/api/recommend",
      "method": "POST",
      "schema": { "$ref": "#/schemas/recommendation" }
    }
  ]
}
```

---

## 7. Success Metrics

### 7.1 Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time to First Recommendation** | < 60 seconds | From app open to recommendation displayed |
| **Match Satisfaction Rate** | > 85% | User accepts recommendation (clicks Watch) |
| **Session Completion Rate** | > 90% | Users complete quiz without abandoning |
| **Refinement Usage** | < 20% | Low refinement = good first match |
| **Return Rate** | > 60% weekly | Users return within 7 days |

### 7.2 Hackathon-Specific Metrics

| Criteria | Requirement | Status |
|----------|-------------|--------|
| MCP Server Implementation | Required | ⬜ TODO |
| ARW Manifest | Required | ⬜ TODO |
| Claude-Flow Integration | Bonus | ⬜ TODO |
| Working Demo | Required | ⬜ TODO |

---

## 8. Implementation Roadmap

### 8.1 Phase 1: Foundation (SPARC Specification)

- [ ] Content vector schema finalized
- [ ] RuVector integration with AgentDB
- [ ] User style vector (64D) implementation
- [ ] Basic quiz UI prototype

### 8.2 Phase 2: Core Engine (SPARC Architecture)

- [ ] 6-agent swarm implementation with claude-flow
- [ ] Intent extraction from quiz + text
- [ ] Matching engine with scoring formula
- [ ] MCP server (STDIO + SSE)

### 8.3 Phase 3: Integration (SPARC Refinement)

- [ ] TMDB/Trakt API integration
- [ ] ARW manifest and machine views
- [ ] Deeplink generation for TV5MONDE
- [ ] End-to-end testing

### 8.4 Phase 4: Polish (SPARC Completion)

- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Demo preparation
- [ ] Documentation

---

## 9. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| TV5MONDE API unavailable | High | Medium | Use TMDB as fallback, mock deeplinks |
| Cold start (new users) | Medium | High | Sensible defaults, quick onboarding quiz |
| Vector search latency | High | Low | AgentDB HNSW indexing (150x faster) |
| Model costs | Medium | Medium | Use Haiku for fast agents, cache results |

---

## 10. Appendices

### A. Research Documents

- [01_hackathon_requirements.md](./research/01_hackathon_requirements.md)
- [02_content_discovery_architecture.md](./research/02_content_discovery_architecture.md)
- [03_ruvector_integration.md](./research/03_ruvector_integration.md)
- [04_agentic_swarm_patterns.md](./research/04_agentic_swarm_patterns.md)
- [05_api_data_sources.md](./research/05_api_data_sources.md)
- [06_arw_specification.md](./research/06_arw_specification.md)
- [07_user_personas_static.md](./research/07_user_personas_static.md)
- [08_user_personas_dynamic.md](./research/08_user_personas_dynamic.md)
- [09_user_style_vector_schema.md](./research/09_user_style_vector_schema.md)
- [10_user_persona_archetypes.md](./research/10_user_persona_archetypes.md)

### B. Existing Components

- `apps/agentdb` - Vector database with HNSW indexing
- `apps/agentic-flow` - Agent orchestration framework
- `apps/cli` - MCP server implementation
- `apps/media-discovery` - ARW reference implementation

### C. External APIs

- TMDB API (free tier) - Content metadata
- Trakt.tv API (free tier) - Trending/popularity
- Watchmode API (paid) - Streaming availability

---

**Document Status**: Ready for SPARC Specification Phase
**Next Step**: `npx claude-flow sparc run spec-pseudocode "TV5MONDE Content Discovery"`
