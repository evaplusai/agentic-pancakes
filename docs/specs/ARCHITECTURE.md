# System Architecture Document
## Universal Content Discovery Platform MVP

**Version**: 1.0
**Date**: 2025-12-06
**Phase**: Architecture (SPARC Methodology)
**Status**: Implementation-Ready

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Component Architecture](#2-component-architecture)
3. [Data Architecture](#3-data-architecture)
4. [Integration Architecture](#4-integration-architecture)
5. [Agent Communication](#5-agent-communication)
6. [Deployment Architecture](#6-deployment-architecture)
7. [Security Architecture](#7-security-architecture)
8. [Technology Decisions (ADRs)](#8-technology-decisions-adrs)
9. [Directory Structure](#9-directory-structure)
10. [Implementation Priorities](#10-implementation-priorities)

---

## 1. Architecture Overview

### 1.1 System Context Diagram (C4 Level 1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM CONTEXT                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
    │   User      │         │  Claude     │         │  ARW        │
    │  (Human)    │         │  Desktop    │         │  Clients    │
    └──────┬──────┘         └──────┬──────┘         └──────┬──────┘
           │                       │                       │
           │ Quiz/Voice/Text       │ MCP Protocol          │ HTTP/ARW
           │                       │                       │
           ▼                       ▼                       ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                                                                  │
    │              UNIVERSAL CONTENT DISCOVERY SYSTEM                  │
    │                                                                  │
    │    "What to Watch in 60 Seconds"                                │
    │                                                                  │
    │    • Emotion-first recommendations                              │
    │    • Self-learning via AgentDB v2.0                            │
    │    • 6-agent swarm architecture                                 │
    │                                                                  │
    └─────────────────────────────────────────────────────────────────┘
           │                       │                       │
           │                       │                       │
           ▼                       ▼                       ▼
    ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
    │  TV5MONDE   │         │   TMDB      │         │  FlixPatrol │
    │  Content    │         │   API       │         │  Trending   │
    └─────────────┘         └─────────────┘         └─────────────┘
```

### 1.2 Container Diagram (C4 Level 2)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CONTAINER DIAGRAM                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   MCP Clients    │  │    Web UI        │  │   CLI Tool       │          │
│  │   (Claude, etc)  │  │    (Future)      │  │   (Testing)      │          │
│  │                  │  │                  │  │                  │          │
│  │  STDIO/SSE       │  │  REST/WebSocket  │  │  STDIO           │          │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          │
└───────────┼──────────────────────┼──────────────────────┼───────────────────┘
            │                      │                      │
            ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API TIER                                        │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         MCP SERVER                                    │  │
│  │                                                                       │  │
│  │  ┌─────────────────┐              ┌─────────────────┐               │  │
│  │  │ STDIO Transport │              │  SSE Transport  │               │  │
│  │  │                 │              │                 │               │  │
│  │  │ • Synchronous   │              │ • Streaming     │               │  │
│  │  │ • CLI/Desktop   │              │ • Web clients   │               │  │
│  │  └────────┬────────┘              └────────┬────────┘               │  │
│  │           │                                │                         │  │
│  │           └────────────┬───────────────────┘                         │  │
│  │                        ▼                                             │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │                    TOOL HANDLERS                             │   │  │
│  │  │                                                              │   │  │
│  │  │  get_recommendation  │  refine_search  │  get_trending      │   │  │
│  │  │  user_feedback       │  get_profile    │  health_check      │   │  │
│  │  └──────────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AGENT TIER                                         │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      ORCHESTRATOR AGENT                               │  │
│  │                      (Claude Sonnet)                                  │  │
│  │                                                                       │  │
│  │  • Workflow coordination    • Error handling                         │  │
│  │  • Trajectory storage       • Result aggregation                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│            │                                                                 │
│            ├──────────────┬──────────────┬──────────────┐                  │
│            ▼              ▼              ▼              ▼                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │ INTENT AGENT │ │CATALOG AGENT │ │ TREND AGENT  │ │ MATCH AGENT  │     │
│  │   (Haiku)    │ │  (AgentDB)   │ │   (TMDB)     │ │   (Haiku)    │     │
│  │              │ │              │ │              │ │              │     │
│  │ • Emotion    │ │ • Vector     │ │ • Trending   │ │ • Scoring    │     │
│  │   extraction │ │   search     │ │   data       │ │ • Ranking    │     │
│  │ • Reflexion  │ │ • Causal     │ │ • Pattern    │ │ • Reasoning  │     │
│  │   Memory     │ │   Recall     │ │   learning   │ │   Bank       │     │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘     │
│            │              │              │              │                  │
│            └──────────────┴──────────────┴──────────────┘                  │
│                                          │                                  │
│                                          ▼                                  │
│                               ┌──────────────────┐                         │
│                               │  PRESENT AGENT   │                         │
│                               │    (Sonnet)      │                         │
│                               │                  │                         │
│                               │ • Format output  │                         │
│                               │ • Provenance     │                         │
│                               │ • Explanations   │                         │
│                               └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTELLIGENCE TIER                                    │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        AgentDB v2.0                                   │  │
│  │                                                                       │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │  │
│  │  │  Vector    │ │ Reasoning  │ │ Reflexion  │ │  Causal    │       │  │
│  │  │  Store     │ │ Bank       │ │ Memory     │ │  Graph     │       │  │
│  │  │  (HNSW)    │ │ (Patterns) │ │ (Episodes) │ │  (Future)  │       │  │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘       │  │
│  │                                                                       │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐                       │  │
│  │  │   Skill    │ │  Nightly   │ │   Self-    │                       │  │
│  │  │  Library   │ │  Learner   │ │  Healing   │                       │  │
│  │  │            │ │  (Cron)    │ │  (Monitor) │                       │  │
│  │  └────────────┘ └────────────┘ └────────────┘                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STORAGE TIER                                        │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   SQLite     │  │   AgentDB    │  │    Redis     │  │   Neo4j      │   │
│  │   (Metadata) │  │   (Vectors)  │  │   (Cache)    │  │  (Causal)    │   │
│  │              │  │              │  │   (Future)   │  │  (Future)    │   │
│  │ • Content    │  │ • 768D vecs  │  │ • Sessions   │  │ • p(y|do(x)) │   │
│  │ • Users      │  │ • HNSW idx   │  │ • Hot data   │  │ • Relations  │   │
│  │ • Episodes   │  │ • Quantized  │  │              │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Request Flow Sequence

```
┌──────┐  ┌─────────┐  ┌───────────┐  ┌────────┐  ┌─────────┐  ┌───────┐  ┌───────┐
│Client│  │MCP Srvr │  │Orchestratr│  │ Intent │  │ Catalog │  │ Match │  │Present│
└──┬───┘  └────┬────┘  └─────┬─────┘  └───┬────┘  └────┬────┘  └───┬───┘  └───┬───┘
   │           │             │            │            │           │          │
   │ get_recommendation      │            │            │           │          │
   │──────────>│             │            │            │           │          │
   │           │             │            │            │           │          │
   │           │  process()  │            │            │           │          │
   │           │────────────>│            │            │           │          │
   │           │             │            │            │           │          │
   │           │             │ extractIntent()         │           │          │
   │           │             │───────────>│            │           │          │
   │           │             │            │            │           │          │
   │           │             │  emotionalState         │           │          │
   │           │             │<───────────│            │           │          │
   │           │             │            │            │           │          │
   │           │             │      PARALLEL           │           │          │
   │           │             │ ┌──────────────────────────────────>│          │
   │           │             │ │   search()            │           │          │
   │           │             │ │          │            │           │          │
   │           │             │ │          │ getTrending()          │          │
   │           │             │ │          │───────────>│           │          │
   │           │             │ │          │            │           │          │
   │           │             │ │          │ candidates │           │          │
   │           │             │<┼──────────│<───────────│           │          │
   │           │             │            │            │           │          │
   │           │             │       score()           │           │          │
   │           │             │────────────────────────────────────>│          │
   │           │             │            │            │           │          │
   │           │             │       rankedResults     │           │          │
   │           │             │<────────────────────────────────────│          │
   │           │             │            │            │           │          │
   │           │             │            format()     │           │          │
   │           │             │─────────────────────────────────────────────>│
   │           │             │            │            │           │          │
   │           │             │            recommendation           │          │
   │           │             │<─────────────────────────────────────────────│
   │           │             │            │            │           │          │
   │           │  response   │            │            │           │          │
   │           │<────────────│            │            │           │          │
   │           │             │            │            │           │          │
   │  result   │             │            │            │           │          │
   │<──────────│             │            │            │           │          │
   │           │             │            │            │           │          │
```

---

## 2. Component Architecture

### 2.1 MCP Server

```
┌─────────────────────────────────────────────────────────────────┐
│                         MCP SERVER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   TRANSPORT LAYER                        │   │
│  │                                                          │   │
│  │  ┌──────────────────┐    ┌──────────────────┐          │   │
│  │  │  STDIO Transport │    │   SSE Transport  │          │   │
│  │  │                  │    │                  │          │   │
│  │  │ process.stdin    │    │ EventSource     │          │   │
│  │  │ process.stdout   │    │ HTTP streaming  │          │   │
│  │  └────────┬─────────┘    └────────┬─────────┘          │   │
│  │           └──────────┬────────────┘                     │   │
│  └──────────────────────┼──────────────────────────────────┘   │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   PROTOCOL LAYER                         │   │
│  │                                                          │   │
│  │  • JSON-RPC 2.0 message handling                        │   │
│  │  • Request/Response correlation                         │   │
│  │  • Error handling and formatting                        │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   HANDLER LAYER                          │   │
│  │                                                          │   │
│  │  ┌────────────────┐ ┌────────────────┐ ┌─────────────┐ │   │
│  │  │get_recommendation│ │ refine_search │ │get_trending │ │   │
│  │  └────────────────┘ └────────────────┘ └─────────────┘ │   │
│  │  ┌────────────────┐ ┌────────────────┐ ┌─────────────┐ │   │
│  │  │ user_feedback  │ │  get_profile   │ │health_check │ │   │
│  │  └────────────────┘ └────────────────┘ └─────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Responsibilities:                                               │
│  • Accept MCP protocol requests                                 │
│  • Route to appropriate tool handlers                           │
│  • Manage sessions and context                                  │
│  • Format responses per MCP specification                       │
│                                                                  │
│  Dependencies:                                                   │
│  • @modelcontextprotocol/sdk                                    │
│  • Orchestrator Agent                                           │
└─────────────────────────────────────────────────────────────────┘
```

**File**: `src/mcp/server.ts`

### 2.2 Orchestrator Agent

```
┌─────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR AGENT                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  WORKFLOW ENGINE                         │   │
│  │                                                          │   │
│  │  • Sequential step execution                            │   │
│  │  • Parallel fan-out coordination                        │   │
│  │  • Result aggregation                                   │   │
│  │  • Timeout management                                   │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│  ┌──────────────────────┼──────────────────────────────────┐   │
│  │                  AGENT REGISTRY                          │   │
│  │                                                          │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌───────┐ │   │
│  │  │ Intent │ │Catalog │ │ Trend  │ │ Match  │ │Present│ │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └───────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                ERROR HANDLING                            │   │
│  │                                                          │   │
│  │  • Retry with exponential backoff                       │   │
│  │  • Circuit breaker for external services                │   │
│  │  • Graceful degradation                                 │   │
│  │  • Error logging and alerting                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              TRAJECTORY MANAGEMENT                       │   │
│  │                                                          │   │
│  │  • Store recommendation sessions                        │   │
│  │  • Track outcomes for learning                          │   │
│  │  • Feed ReasoningBank                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Model: Claude Sonnet 4                                         │
│  Latency Target: < 500ms coordination overhead                  │
└─────────────────────────────────────────────────────────────────┘
```

**File**: `src/agents/orchestrator.ts`

### 2.3 Intent Agent

```
┌─────────────────────────────────────────────────────────────────┐
│                       INTENT AGENT                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INPUT                                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ QuizResponse: { round1, round2, round3? }               │   │
│  │ TextInput?: string (natural language)                    │   │
│  │ VoiceFeatures?: { tone, pace, sentiment }               │   │
│  │ Context: { time, device, location }                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                       │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              EMOTION EXTRACTION                          │   │
│  │                                                          │   │
│  │  Quiz Mapping:                                           │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ unwind + laugh → energy:0.3, valence:0.7, humor:0.9│ │   │
│  │  │ unwind + feel  → energy:0.2, valence:0.5, depth:0.8│ │   │
│  │  │ engage + thrill→ energy:0.8, arousal:0.9, action:0.9│ │   │
│  │  │ engage + think → energy:0.6, cognitive:0.9         │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              REFLEXION MEMORY QUERY                      │   │
│  │                                                          │   │
│  │  • Query past failures for similar context              │   │
│  │  • Extract constraints to avoid                         │   │
│  │  • Apply learned adjustments                            │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│                         ▼                                       │
│  OUTPUT                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ UniversalEmotionalState: {                              │   │
│  │   energy, valence, arousal, cognitiveCapacity,          │   │
│  │   needs: { comfort, escape, stimulation, ... },         │   │
│  │   context: { time, device, social },                    │   │
│  │   constraints: { avoid: [...], prefer: [...] }          │   │
│  │ }                                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Model: Claude Haiku (fast)                                     │
│  Latency Target: < 300ms                                        │
└─────────────────────────────────────────────────────────────────┘
```

**File**: `src/agents/intent.ts`

### 2.4 Catalog Agent

```
┌─────────────────────────────────────────────────────────────────┐
│                      CATALOG AGENT                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INPUT: UniversalEmotionalState, userId                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              QUERY BUILDER                               │   │
│  │                                                          │   │
│  │  emotionalState → queryVector (768D)                    │   │
│  │  + filters (platform, runtime, language)                │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│           ┌─────────────┴─────────────┐                        │
│           ▼                           ▼                        │
│  ┌─────────────────┐       ┌─────────────────┐                │
│  │  HNSW SEARCH    │       │  CAUSAL RECALL  │                │
│  │  (Similarity)   │       │  (Utility)      │                │
│  │                 │       │                 │                │
│  │  • Fast ANN     │       │ U = α·sim +     │                │
│  │  • Top-K        │       │     β·uplift -  │                │
│  │  • O(log n)     │       │     γ·latency   │                │
│  └────────┬────────┘       └────────┬────────┘                │
│           │                         │                          │
│           └────────────┬────────────┘                          │
│                        ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              RESULT MERGER                               │   │
│  │                                                          │   │
│  │  • Deduplicate candidates                               │   │
│  │  • Combine scores                                       │   │
│  │  • Apply hard filters                                   │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         ▼                                       │
│  OUTPUT: ContentCandidate[] (top 50)                           │
│                                                                  │
│  Storage: AgentDB v2.0                                          │
│  Latency Target: < 100ms                                        │
└─────────────────────────────────────────────────────────────────┘
```

**File**: `src/agents/catalog.ts`

### 2.5 Match Agent

```
┌─────────────────────────────────────────────────────────────────┐
│                       MATCH AGENT                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INPUT: ContentCandidate[], EmotionalState, TrendingBoosts      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            REASONING BANK QUERY                          │   │
│  │                                                          │   │
│  │  • Query learned patterns for context                   │   │
│  │  • Get dynamic weights                                  │   │
│  │  • Load applicable skills                               │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              SCORING ENGINE                              │   │
│  │                                                          │   │
│  │  MVP Formula (Static):                                   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ score = vectorSim × 0.25 + moodScore × 0.30 +      │ │   │
│  │  │         intentScore × 0.20 + contextScore × 0.15 + │ │   │
│  │  │         trendingScore × 0.10                       │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  Phase 2 Formula (Dynamic):                              │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ score = α × similarity + β × causalUplift +        │ │   │
│  │  │         patternBoost - γ × latency                 │ │   │
│  │  │ (where α, β, γ learned from ReasoningBank)         │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              RANKING & DIVERSIFICATION                   │   │
│  │                                                          │   │
│  │  • Sort by score descending                             │   │
│  │  • Apply diversity constraints                          │   │
│  │  • Select top 1 + 3 alternatives                        │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         ▼                                       │
│  OUTPUT: RankedContent[] (top 4)                               │
│                                                                  │
│  Model: Claude Haiku                                            │
│  Latency Target: < 200ms                                        │
└─────────────────────────────────────────────────────────────────┘
```

**File**: `src/agents/match.ts`

### 2.6 Present Agent

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENT AGENT                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INPUT: RankedContent[], EmotionalState, userId                 │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            PROVENANCE GENERATOR                          │   │
│  │                                                          │   │
│  │  • Count supporting trajectories                        │   │
│  │  • Calculate confidence interval                        │   │
│  │  • Generate evidence summary                            │   │
│  │  "Users like you completed this 87% of the time"       │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            EXPLANATION GENERATOR                         │   │
│  │                                                          │   │
│  │  • Generate human-readable reasoning                    │   │
│  │  • Explain why this match was chosen                    │   │
│  │  • Highlight key matching factors                       │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            DEEPLINK GENERATOR                            │   │
│  │                                                          │   │
│  │  • Generate TV5MONDE watch URL                          │   │
│  │  • Add tracking parameters                              │   │
│  │  • Format for platform                                  │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         ▼                                       │
│  OUTPUT:                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Recommendation: {                                        │   │
│  │   topPick: { title, matchScore, description, deeplink }, │   │
│  │   alternatives: [...],                                   │   │
│  │   provenance: { trajectories, confidence, evidence },   │   │
│  │   reasoning: "Because you wanted to unwind with..."     │   │
│  │ }                                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Model: Claude Sonnet (quality explanations)                    │
│  Latency Target: < 500ms                                        │
└─────────────────────────────────────────────────────────────────┘
```

**File**: `src/agents/present.ts`

---

## 3. Data Architecture

### 3.1 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW                                          │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   User Input    │
                    │  (Quiz/Voice)   │
                    └────────┬────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      REAL-TIME PATH (< 3 seconds)                          │
│                                                                            │
│   ┌─────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────┐    │
│   │  Quiz   │───>│   Intent     │───>│   Vector     │───>│  Match  │    │
│   │ Parser  │    │  Extraction  │    │   Search     │    │ Engine  │    │
│   └─────────┘    └──────────────┘    └──────────────┘    └────┬────┘    │
│                                                                │         │
│                         ┌──────────────────────────────────────┘         │
│                         ▼                                                │
│                  ┌──────────────┐                                        │
│                  │   Present    │──────> Recommendation                  │
│                  │   Agent      │                                        │
│                  └──────────────┘                                        │
└───────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      LEARNING PATH (Async)                                 │
│                                                                            │
│   ┌─────────────┐    ┌──────────────┐    ┌──────────────┐               │
│   │ User Action │───>│  Trajectory  │───>│ ReasoningBank│               │
│   │ (Feedback)  │    │   Storage    │    │   (Learn)    │               │
│   └─────────────┘    └──────────────┘    └──────────────┘               │
│                                                  │                        │
│                         ┌────────────────────────┘                        │
│                         ▼                                                 │
│   ┌─────────────┐    ┌──────────────┐    ┌──────────────┐               │
│   │   Nightly   │───>│   Pattern    │───>│    Skill     │               │
│   │   Learner   │    │   Discovery  │    │   Library    │               │
│   └─────────────┘    └──────────────┘    └──────────────┘               │
└───────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Storage Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STORAGE ARCHITECTURE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         AgentDB v2.0                                         │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      VECTOR STORE (HNSW)                             │   │
│  │                                                                       │   │
│  │  Content Vectors (768D):                                             │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │ [0-511]   Plot/Synopsis embedding (text-embedding-3-small)   │   │   │
│  │  │ [512-575] Genre one-hot (64D)                                │   │   │
│  │  │ [576-639] Mood/Tone embedding (64D)                          │   │   │
│  │  │ [640-767] Metadata features (runtime, year, ratings)         │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  User Vectors (64D):                                                 │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │ [0-14]  Genre affinities                                     │   │   │
│  │  │ [15-24] Mood/Tone preferences                                │   │   │
│  │  │ [25-32] Pacing preferences                                   │   │   │
│  │  │ [33-40] Content characteristics                              │   │   │
│  │  │ [41-48] French-specific attributes                           │   │   │
│  │  │ [49-56] Context patterns                                     │   │   │
│  │  │ [57-63] Session modifiers (dynamic)                          │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  Index: HNSW (M=16, efConstruction=200)                             │   │
│  │  Quantization: Product Quantization (4x compression)                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     REASONING BANK                                   │   │
│  │                                                                       │   │
│  │  Trajectory Table:                                                   │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ id | session_id | user_state | recommendation | outcome |   │    │   │
│  │  │    | timestamp  | context    | verdict        | confidence│    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Pattern Table:                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ id | trigger_condition | strategy | success_rate |         │    │   │
│  │  │    | evidence_count    | confidence| last_validated        │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Performance: 32.6M ops/sec                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     REFLEXION MEMORY                                 │   │
│  │                                                                       │   │
│  │  Episode Table:                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ id | user_id | context | action | outcome | self_critique | │    │   │
│  │  │    | better_action | expected_improvement | timestamp      │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      SKILL LIBRARY                                   │   │
│  │                                                                       │   │
│  │  Skill Table:                                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ id | name | trigger | strategy | success_rate | evidence | │    │   │
│  │  │    | composable_with | last_updated | validated_on        │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Performance: 694 ops/sec                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           SQLite (Metadata)                                  │
│                                                                              │
│  Tables:                                                                     │
│  • content (id, title, synopsis, genres, runtime, year, ...)               │
│  • users (id, profile_vector, created_at, ...)                             │
│  • interactions (user_id, content_id, action, timestamp, ...)              │
│  • trending (content_id, rank, region, source, timestamp)                  │
│                                                                              │
│  File: data/metadata.db                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Integration Architecture

### 4.1 AgentDB v2.0 Integration

```typescript
// src/integrations/agentdb.ts

import { AgentDB } from '@agentdb/core';
import { ReasoningBank } from '@agentdb/reasoning-bank';
import { ReflexionMemory } from '@agentdb/reflexion';
import { CausalRecall } from '@agentdb/causal-recall';

export class AgentDBIntegration {
  private db: AgentDB;
  private reasoningBank: ReasoningBank;
  private reflexion: ReflexionMemory;
  private causalRecall: CausalRecall;

  async initialize(config: AgentDBConfig): Promise<void> {
    this.db = new AgentDB({
      path: config.dbPath,
      vectorDimensions: 768,
      indexType: 'hnsw',
      hnswConfig: { M: 16, efConstruction: 200 }
    });

    this.reasoningBank = new ReasoningBank(this.db);
    this.reflexion = new ReflexionMemory(this.db);
    this.causalRecall = new CausalRecall(this.db, {
      alpha: 0.4,  // similarity weight
      beta: 0.5,   // uplift weight
      gamma: 0.1   // latency penalty
    });
  }

  // Vector search with utility
  async search(query: Float32Array, options: SearchOptions): Promise<SearchResult[]> {
    return this.causalRecall.search({
      query,
      context: options.context,
      limit: options.limit,
      includeProvenance: true
    });
  }

  // Store trajectory for learning
  async storeTrajectory(trajectory: Trajectory): Promise<void> {
    await this.reasoningBank.storeTrajectory(trajectory);
  }

  // Query patterns
  async queryPatterns(context: Context): Promise<Pattern[]> {
    return this.reasoningBank.queryPatterns({
      ...context,
      minConfidence: 0.75
    });
  }
}
```

### 4.2 External API Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL API INTEGRATION                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           TMDB API                                           │
│                                                                              │
│  Endpoints Used:                                                             │
│  • /movie/{id} - Movie details                                              │
│  • /tv/{id} - TV show details                                               │
│  • /search/multi - Content search                                           │
│  • /trending/{media_type}/{time_window} - Trending                          │
│                                                                              │
│  Rate Limits: 40 requests/10 seconds                                        │
│  Caching: 1 hour for details, 15 min for trending                          │
│                                                                              │
│  Integration Pattern:                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Request → Rate Limiter → Cache Check → API Call → Transform → Cache │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         FlixPatrol API                                       │
│                                                                              │
│  Data Scraped:                                                               │
│  • Top 10 Netflix France                                                     │
│  • Top 10 Amazon Prime France                                                │
│  • Top 10 Disney+ France                                                     │
│                                                                              │
│  Update Frequency: Daily at 00:00 UTC                                       │
│  Caching: 24 hours                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Agent Communication

### 5.1 Message Protocol

```typescript
// src/protocols/agent-message.ts

interface AgentMessage {
  id: string;
  type: 'request' | 'response' | 'error';
  source: AgentType;
  target: AgentType;
  timestamp: number;
  payload: unknown;
  correlationId?: string;
  metadata?: {
    latency?: number;
    retryCount?: number;
  };
}

interface AgentRequest<T = unknown> extends AgentMessage {
  type: 'request';
  payload: T;
  timeout?: number;
}

interface AgentResponse<T = unknown> extends AgentMessage {
  type: 'response';
  payload: T;
  success: boolean;
}

type AgentType =
  | 'orchestrator'
  | 'intent'
  | 'catalog'
  | 'trend'
  | 'match'
  | 'present';
```

### 5.2 Parallel Processing Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PARALLEL FAN-OUT PATTERN                                │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │  Orchestrator   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Catalog  │  │  Trend   │  │   GNN    │
        │ Agent    │  │  Agent   │  │ (Future) │
        └────┬─────┘  └────┬─────┘  └────┬─────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────┴────────┐
                    │    Aggregator   │
                    │   (Promise.all) │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Match Agent    │
                    └─────────────────┘

// Implementation
async function parallelAgentFanOut(
  emotionalState: UniversalEmotionalState,
  userId: string
): Promise<AggregatedResults> {
  const [catalogResults, trendingBoosts] = await Promise.all([
    catalogAgent.search(emotionalState, userId),
    trendAgent.getBoosts(emotionalState)
  ]);

  return {
    candidates: catalogResults,
    trending: trendingBoosts
  };
}
```

### 5.3 Error Handling Strategy

```typescript
// src/utils/error-handler.ts

class AgentErrorHandler {
  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_DELAY = 1000;

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    agentName: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= AgentErrorHandler.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (this.isRetryable(error)) {
          const delay = AgentErrorHandler.BASE_DELAY * Math.pow(2, attempt - 1);
          await this.sleep(delay);
          continue;
        }

        throw error;
      }
    }

    // Graceful degradation
    return this.getFallbackResult(agentName, lastError!);
  }

  private isRetryable(error: unknown): boolean {
    if (error instanceof NetworkError) return true;
    if (error instanceof TimeoutError) return true;
    if (error instanceof RateLimitError) return true;
    return false;
  }

  private getFallbackResult<T>(agentName: string, error: Error): T {
    // Return cached or default results
    switch (agentName) {
      case 'trend':
        return [] as T; // Empty trending, continue without
      case 'catalog':
        throw error; // Critical, must fail
      default:
        throw error;
    }
  }
}
```

---

## 6. Deployment Architecture

### 6.1 Development Environment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DEVELOPMENT ENVIRONMENT                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         Local Machine                                        │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                      Node.js Runtime                                │    │
│  │                                                                     │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │    │
│  │  │ MCP Server  │  │   Agents    │  │   Tests     │               │    │
│  │  │ (STDIO)     │  │  (Local)    │  │   (Jest)    │               │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                       Local Storage                                 │    │
│  │                                                                     │    │
│  │  ┌─────────────┐  ┌─────────────┐                                 │    │
│  │  │  SQLite     │  │  AgentDB    │                                 │    │
│  │  │ (metadata)  │  │  (vectors)  │                                 │    │
│  │  └─────────────┘  └─────────────┘                                 │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Environment Variables (.env.local):                                        │
│  • ANTHROPIC_API_KEY=sk-ant-...                                            │
│  • TMDB_API_KEY=...                                                         │
│  • AGENTDB_PATH=./data/agentdb                                             │
│  • LOG_LEVEL=debug                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Production Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PRODUCTION DEPLOYMENT                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           Cloud Provider                                     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Load Balancer                                 │   │
│  │                   (AWS ALB / Cloudflare)                            │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│           ┌─────────────────────┼─────────────────────┐                   │
│           ▼                     ▼                     ▼                   │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐            │
│  │  App Server 1   │ │  App Server 2   │ │  App Server N   │            │
│  │                 │ │                 │ │                 │            │
│  │  • MCP Server   │ │  • MCP Server   │ │  • MCP Server   │            │
│  │  • Agents       │ │  • Agents       │ │  • Agents       │            │
│  │  • 2 vCPU       │ │  • 2 vCPU       │ │  • 2 vCPU       │            │
│  │  • 4 GB RAM     │ │  • 4 GB RAM     │ │  • 4 GB RAM     │            │
│  └────────┬────────┘ └────────┬────────┘ └────────┬────────┘            │
│           │                   │                   │                      │
│           └───────────────────┼───────────────────┘                      │
│                               │                                           │
│  ┌────────────────────────────┼────────────────────────────────────────┐ │
│  │                     Shared Storage                                   │ │
│  │                                                                      │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │ │
│  │  │   AgentDB    │  │    Redis     │  │  PostgreSQL  │             │ │
│  │  │  (Primary)   │  │   (Cache)    │  │  (Metadata)  │             │ │
│  │  │              │  │              │  │              │             │ │
│  │  │  + Replicas  │  │  + Cluster   │  │  + Replicas  │             │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    Background Services                               │ │
│  │                                                                      │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │ │
│  │  │   Nightly    │  │ Self-Healing │  │   Metrics    │             │ │
│  │  │   Learner    │  │   Monitor    │  │  Collector   │             │ │
│  │  │  (Cron Job)  │  │  (Always On) │  │ (Prometheus) │             │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Security Architecture

### 7.1 Security Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY ARCHITECTURE                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: TRANSPORT SECURITY                                                │
│                                                                              │
│  • TLS 1.3 for all external connections                                     │
│  • Certificate pinning for API clients                                      │
│  • HSTS headers                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 2: API SECURITY                                                       │
│                                                                              │
│  • Rate limiting (100 req/min per client)                                   │
│  • Request validation (Zod schemas)                                         │
│  • API key authentication (MCP clients)                                     │
│  • CORS policy (strict origin)                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: DATA SECURITY                                                      │
│                                                                              │
│  • AES-256 encryption at rest                                               │
│  • User data anonymization (trajectories)                                   │
│  • PII separation (different storage)                                       │
│  • Audit logging                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 4: PRIVACY BY DESIGN (GDPR)                                          │
│                                                                              │
│  • Purpose limitation (recommendations only)                                │
│  • Data minimization (only necessary data)                                  │
│  • Right to erasure (user deletion endpoint)                               │
│  • Data portability (export endpoint)                                      │
│  • 90-day trajectory retention (configurable)                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Technology Decisions (ADRs)

### ADR-001: AgentDB for Vector Storage

**Status**: Accepted

**Context**: Need high-performance vector storage with learning capabilities.

**Decision**: Use AgentDB v2.0 over alternatives (Pinecone, Weaviate, ChromaDB).

**Rationale**:
- Built-in ReasoningBank, Reflexion Memory, Causal Recall
- 150x faster than naive search (HNSW)
- Self-healing capabilities (97.9%)
- Local-first (no cloud dependency for MVP)

**Consequences**:
- (+) Unified learning and storage
- (+) No external service costs
- (-) Less mature than Pinecone
- (-) Requires local compute for vectors

---

### ADR-002: MCP Protocol for Agent Interface

**Status**: Accepted

**Context**: Need standardized protocol for Claude integration.

**Decision**: Implement MCP with both STDIO and SSE transports.

**Rationale**:
- Native Claude Desktop integration
- Hackathon requirement
- Future-proof for other MCP clients

**Consequences**:
- (+) Direct Claude integration
- (+) Standard protocol
- (-) Additional complexity vs REST

---

### ADR-003: Parallel Agent Orchestration

**Status**: Accepted

**Context**: Need to meet <3 second latency target.

**Decision**: Use Promise.all for parallel agent execution with timeout.

**Rationale**:
- Catalog + Trend can run in parallel
- Reduces total latency by ~40%
- Simple error handling with Promise.allSettled

**Consequences**:
- (+) Faster recommendations
- (+) Better resource utilization
- (-) More complex error handling
- (-) Partial failures possible

---

### ADR-004: Static Formula for MVP, Dynamic for Phase 2

**Status**: Accepted

**Context**: Balance between MVP speed and learning capabilities.

**Decision**: Start with static weighted formula, add ReasoningBank in Phase 2.

**Rationale**:
- MVP can ship faster
- Static formula is debuggable
- Learning requires trajectory data (cold start)

**Formula (MVP)**:
```
score = vectorSim × 0.25 + moodScore × 0.30 +
        intentScore × 0.20 + contextScore × 0.15 +
        trendingScore × 0.10
```

---

### ADR-005: SQLite for Metadata, AgentDB for Vectors

**Status**: Accepted

**Context**: Need structured metadata alongside vector storage.

**Decision**: Use SQLite for metadata, AgentDB for vectors/learning.

**Rationale**:
- SQLite is simple, embedded, fast for relational queries
- AgentDB optimized for vector operations
- Clear separation of concerns

**Consequences**:
- (+) Best tool for each job
- (+) Simpler migrations
- (-) Two storage systems to manage

---

## 9. Directory Structure

```
universal-content-discovery/
├── src/
│   ├── mcp/
│   │   ├── server.ts              # MCP server entry point
│   │   ├── handlers/
│   │   │   ├── get-recommendation.ts
│   │   │   ├── refine-search.ts
│   │   │   ├── get-trending.ts
│   │   │   └── user-feedback.ts
│   │   └── transports/
│   │       ├── stdio.ts
│   │       └── sse.ts
│   │
│   ├── agents/
│   │   ├── orchestrator.ts        # Workflow coordinator
│   │   ├── intent.ts              # Emotion extraction
│   │   ├── catalog.ts             # Vector search
│   │   ├── trend.ts               # Trending data
│   │   ├── match.ts               # Scoring engine
│   │   └── present.ts             # Output formatting
│   │
│   ├── integrations/
│   │   ├── agentdb.ts             # AgentDB v2.0 client
│   │   ├── tmdb.ts                # TMDB API client
│   │   ├── flixpatrol.ts          # FlixPatrol scraper
│   │   └── anthropic.ts           # Claude API client
│   │
│   ├── models/
│   │   ├── emotional-state.ts     # UniversalEmotionalState
│   │   ├── user-vector.ts         # UserStyleVector (64D)
│   │   ├── content-vector.ts      # ContentVector (768D)
│   │   ├── trajectory.ts          # ReasoningBank trajectory
│   │   └── recommendation.ts      # Output types
│   │
│   ├── services/
│   │   ├── vectorizer.ts          # Content vectorization
│   │   ├── matcher.ts             # Scoring algorithm
│   │   └── learner.ts             # Learning pipeline
│   │
│   ├── utils/
│   │   ├── error-handler.ts
│   │   ├── logger.ts
│   │   ├── cache.ts
│   │   └── rate-limiter.ts
│   │
│   └── index.ts                   # Application entry
│
├── data/
│   ├── agentdb/                   # Vector storage
│   ├── metadata.db                # SQLite database
│   └── cache/                     # Temporary cache
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/
│   ├── vectorize-catalog.ts       # One-time vectorization
│   ├── import-trending.ts         # Daily trending import
│   └── nightly-learner.ts         # Learning pipeline
│
├── docs/
│   └── specs/                     # This documentation
│
├── .well-known/
│   └── arw-manifest.json          # ARW specification
│
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 10. Implementation Priorities

### 10.1 MVP Scope (Weeks 1-4)

**IN SCOPE**:
- [x] MCP Server (STDIO + SSE)
- [x] 6 Agents (Orchestrator, Intent, Catalog, Trend, Match, Present)
- [x] Static matching formula
- [x] AgentDB vector search (HNSW)
- [x] TMDB integration
- [x] ARW manifest
- [x] Basic provenance

**OUT OF SCOPE (Phase 2)**:
- [ ] ReasoningBank pattern learning
- [ ] Reflexion Memory
- [ ] Causal Recall utility search
- [ ] Nightly Learner
- [ ] Self-Healing
- [ ] GNN Attention

### 10.2 Critical Path

```
Week 1: Foundation
├── MCP Server skeleton
├── AgentDB setup
├── Content vectorization pipeline
└── Basic Intent Agent

Week 2: Agents
├── Catalog Agent (vector search)
├── Trend Agent (TMDB)
├── Match Agent (static formula)
└── Present Agent (formatting)

Week 3: Integration
├── Orchestrator (workflow)
├── End-to-end pipeline
├── Error handling
└── Basic testing

Week 4: Polish
├── ARW manifest
├── Provenance
├── Performance optimization
└── Documentation
```

### 10.3 Risk Mitigation

| Risk | Mitigation |
|------|------------|
| TMDB API limits | Cache aggressively, fallback to stored data |
| Claude API costs | Use Haiku for fast agents, cache common patterns |
| Vector search latency | Pre-filter by platform, limit candidate set |
| Cold start | Use sensible defaults, quick onboarding quiz |

---

## Appendix A: TypeScript Interfaces

```typescript
// Complete interfaces in src/models/

// See SPECIFICATION.md for full interface definitions
export interface UniversalEmotionalState { ... }
export interface UserStyleVector { ... }
export interface ContentVector { ... }
export interface Trajectory { ... }
export interface Recommendation { ... }
```

---

**Document Status**: Implementation-Ready
**Next Phase**: SPARC Refinement (TDD Implementation)
**Command**: `npx claude-flow sparc run refinement "Universal Content Discovery MVP"`
