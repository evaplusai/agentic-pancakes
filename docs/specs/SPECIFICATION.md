# Technical Specification Document
## Universal Content Discovery Platform MVP

**Version**: 1.0
**Date**: 2025-12-06
**Based on**: PRD v2.0
**Status**: Implementation-Ready
**Phase**: MVP (Phase 1) with AgentDB v2.0 Learning Foundation

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Data Models](#2-data-models)
3. [API Specifications](#3-api-specifications)
4. [Agent Specifications](#4-agent-specifications)
5. [Integration Points](#5-integration-points)
6. [Performance Requirements](#6-performance-requirements)
7. [Security & Privacy](#7-security--privacy)
8. [Implementation Plan](#8-implementation-plan)

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ MCP Clients  │  │  Web UI      │  │  Mobile App  │              │
│  │ (Claude etc.)│  │  (Future)    │  │  (Future)    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│      MCP SERVER              │ │      REST API                │
│   (STDIO + SSE Transport)    │ │   (Future Enhancement)       │
│                              │ │                              │
│  • get_recommendation        │ │  • POST /api/recommend       │
│  • refine_search             │ │  • GET /api/trending         │
│  • get_trending              │ │  • WS /api/stream            │
│  • user_feedback             │ │                              │
└──────────────────────────────┘ └──────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   ORCHESTRATOR        │
                    │   (Main Controller)   │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ INTENT AGENT │      │ CATALOG      │      │ TREND AGENT  │
│              │      │ AGENT        │      │              │
│ • Emotion    │      │              │      │ • FlixPatrol │
│   extraction │      │ • Vector     │      │ • TMDB       │
│ • Context    │      │   search     │      │   trending   │
│   analysis   │      │ • Filters    │      │ • Pattern    │
│ • Reflexion  │      │ • Causal     │      │   learning   │
│   Memory     │      │   Recall     │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
                      ┌──────────────────┐
                      │   MATCH AGENT    │
                      │                  │
                      │ • Score content  │
                      │ • Utility calc   │
                      │ • ReasoningBank  │
                      │ • Ranking        │
                      └──────────────────┘
                                │
                                ▼
                      ┌──────────────────┐
                      │  PRESENT AGENT   │
                      │                  │
                      │ • Format output  │
                      │ • Provenance     │
                      │ • Deeplinks      │
                      │ • Explanations   │
                      └──────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────────┐
│                      STORAGE & INTELLIGENCE LAYER                    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    AgentDB v2.0                              │   │
│  │                                                               │   │
│  │  ┌──────────────┬──────────────┬──────────────┬───────────┐ │   │
│  │  │ Vector Store │ ReasoningBank│ Reflexion    │ Causal    │ │   │
│  │  │ (HNSW)       │ (Patterns)   │ Memory       │ Graph     │ │   │
│  │  │              │              │ (Episodes)   │ (Neo4j)   │ │   │
│  │  │ • Content    │ • 32.6M ops/s│              │           │ │   │
│  │  │   768D       │ • Trajectory │ • Self-      │ • p(y|x)  │ │   │
│  │  │ • User 64D   │   learning   │   critique   │ • Uplift  │ │   │
│  │  │ • HNSW       │ • Skill      │ • Evidence   │ • Conf.   │ │   │
│  │  │   150x       │   Library    │              │   0.85+   │ │   │
│  │  └──────────────┴──────────────┴──────────────┴───────────┘ │   │
│  │                                                               │   │
│  │  ┌──────────────┬──────────────┬──────────────┐             │   │
│  │  │ GNN Attention│ Nightly      │ Self-Healing │             │   │
│  │  │ (8-head)     │ Learner      │ (MPC Adapt.) │             │   │
│  │  │              │              │              │             │   │
│  │  │ +12.4%       │ Background   │ 97.9%        │             │   │
│  │  │ recall       │ discovery    │ success      │             │   │
│  │  └──────────────┴──────────────┴──────────────┘             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Metadata Storage                          │   │
│  │                      (SQLite)                                │   │
│  │                                                               │   │
│  │  • Content metadata (title, year, runtime, etc.)            │   │
│  │  • User profiles (preferences, history)                     │   │
│  │  • Session data (trajectories, outcomes)                    │   │
│  │  • Analytics (metrics, A/B tests)                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                           │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ TV5MONDE API │  │  TMDB API    │  │ FlixPatrol   │             │
│  │              │  │              │  │              │             │
│  │ • Catalog    │  │ • Metadata   │  │ • Trending   │             │
│  │ • Deeplinks  │  │ • Images     │  │ • Rankings   │             │
│  │ • Streaming  │  │ • Details    │  │ • Regional   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Components

| Component | Responsibility | Technology |
|-----------|---------------|------------|
| **MCP Server** | Protocol interface for client tools | Node.js, MCP SDK, STDIO/SSE |
| **Orchestrator Agent** | Coordinate multi-agent workflow | TypeScript, agentic-flow |
| **Intent Agent** | Extract emotional state from input | Claude Haiku, Reflexion Memory |
| **Catalog Agent** | Search content via vector similarity | AgentDB, HNSW, Causal Recall |
| **Trend Agent** | Inject trending/popularity signals | TMDB/FlixPatrol APIs, Pattern Learning |
| **Match Agent** | Score, rank, and select best matches | ReasoningBank, Utility optimization |
| **Present Agent** | Format recommendations with provenance | TypeScript, Provenance certificates |
| **AgentDB v2.0** | Vector storage + learning intelligence | Rust core, Node.js bindings |
| **Metadata Store** | Content/user/session metadata | SQLite |
| **Causal Graph** | Track causal relationships (Phase 2+) | Neo4j (optional) |

### 1.3 Technology Stack

```yaml
Core:
  language: TypeScript
  runtime: Node.js 18+
  ai_models:
    - Claude Sonnet 4.5 (complex reasoning)
    - Claude Haiku 3.5 (fast extraction)

Storage:
  vector_db: AgentDB v2.0 (HNSW, quantization)
  metadata_db: SQLite
  causal_graph: Neo4j (Phase 2+)

Intelligence:
  reasoning: ReasoningBank (32.6M ops/sec)
  memory: Reflexion Memory (episode storage)
  search: Causal Recall (utility-based)
  graph: GNN Attention (8-head)
  learning: Nightly Learner (background)
  healing: Self-Healing MPC (97.9%)

APIs:
  protocol: MCP (Model Context Protocol)
  transports: [STDIO, SSE]
  rest_api: Express.js (future)
  websocket: Socket.io (future)

External:
  content_apis: [TV5MONDE, TMDB, FlixPatrol]
  embedding: all-MiniLM-L6-v2 (384D) via Transformers.js

Infrastructure:
  containerization: Docker
  orchestration: docker-compose (dev), Kubernetes (prod)
  monitoring: Prometheus + Grafana
  logging: Winston + structured logs
```

---

## 2. Data Models

### 2.1 UniversalEmotionalState Interface

**Purpose**: Domain-agnostic representation of user's emotional context.

```typescript
/**
 * Universal Emotional State
 *
 * Based on Russell's Circumplex Model of Affect + Maslow's Hierarchy
 * This representation is constant across all content domains and input modalities.
 */
interface UniversalEmotionalState {
  // === Affective Dimensions (Russell's Circumplex) ===

  /**
   * Energy level: 0 (exhausted) to 1 (energized)
   * Maps to arousal axis in dimensional emotion models
   */
  energy: number;  // 0-1

  /**
   * Emotional valence: -1 (negative) to 1 (positive)
   * Core dimension of emotional experience
   */
  valence: number;  // -1 to 1

  /**
   * Arousal/excitement: 0 (calm) to 1 (excited)
   * Orthogonal to valence in 2D emotion space
   */
  arousal: number;  // 0-1

  /**
   * Cognitive capacity: Mental bandwidth available
   * 0 (depleted) to 1 (full capacity)
   */
  cognitiveCapacity: number;  // 0-1

  // === Psychological Needs (Maslow-inspired) ===

  /**
   * Weighted needs profile
   * Each need: 0 (not present) to 1 (strongly present)
   */
  needs: {
    comfort: number;      // Need for familiarity, safety
    escape: number;       // Need to avoid reality/stress
    stimulation: number;  // Need for novelty, excitement
    connection: number;   // Need for social/emotional bonding
    growth: number;       // Need for learning, self-improvement
    catharsis: number;    // Need for emotional release
    joy: number;          // Need for pleasure, fun
    relaxation: number;   // Need to unwind, de-stress
    meaning: number;      // Need for depth, purpose
    beauty: number;       // Aesthetic appreciation need
  };

  // === Contextual Metadata ===

  context: {
    /**
     * Time context for temporal patterns
     */
    time: {
      hour: number;           // 0-23
      dayOfWeek: string;      // 'monday' | 'tuesday' | ... | 'sunday'
      isWeekend: boolean;
      timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    };

    /**
     * Device context
     */
    device: {
      type: 'mobile' | 'tablet' | 'desktop' | 'tv';
      screenSize: 'small' | 'medium' | 'large';
    };

    /**
     * Social context
     */
    social: 'alone' | 'partner' | 'family' | 'friends';

    /**
     * Location context (optional, privacy-aware)
     */
    location?: {
      type: 'home' | 'work' | 'transit' | 'public';
    };

    /**
     * Ambient environment (future: from sensors)
     */
    ambient?: {
      noise: 'quiet' | 'moderate' | 'loud';
      lighting: 'bright' | 'dim' | 'dark';
    };
  };

  // === Input Metadata ===

  /**
   * How this state was captured
   */
  captureMethod: {
    modality: 'touch' | 'voice' | 'text' | 'gaze' | 'neural';
    confidence: number;  // 0-1: How confident in this extraction
    timestamp: string;   // ISO 8601
  };

  // === Learning Support ===

  /**
   * Session ID for trajectory tracking
   */
  sessionId: string;

  /**
   * User ID (anonymized hash)
   */
  userId?: string;
}
```

### 2.2 UserStyleVector (64D)

**Purpose**: Long-term taste profile learned from user interactions.

```typescript
/**
 * User Style Vector (64 dimensions)
 *
 * Persistent representation of user's content preferences.
 * Evolves over time through implicit feedback.
 */
interface UserStyleVector {
  /**
   * 64-dimensional embedding vector
   * Learned via matrix factorization / neural collaborative filtering
   */
  vector: Float32Array;  // length: 64

  /**
   * Metadata about the vector
   */
  metadata: {
    userId: string;           // Anonymized user ID
    version: number;          // Vector version (for migration)
    lastUpdated: string;      // ISO 8601 timestamp
    interactionCount: number; // How many interactions trained this
    confidence: number;       // 0-1: Confidence in this profile
  };

  /**
   * Explicit preferences (optional, user-provided)
   */
  explicitPreferences?: {
    favoriteGenres: string[];        // ['comedy', 'drama', ...]
    dislikedGenres: string[];
    preferredLanguages: string[];    // ['fr', 'en', ...]
    maxRuntime?: number;             // Minutes
    contentRating?: string;          // 'G' | 'PG' | 'PG-13' | 'R' | ...
  };

  /**
   * Learned behavioral patterns
   */
  learnedPatterns?: {
    avgCompletionRate: number;       // 0-1
    preferredTimeOfDay: string[];    // When user typically watches
    bingeWatcher: boolean;           // Tends to watch multiple in a row
    explorationVsExploitation: number; // 0 (stick to favorites) - 1 (adventurous)
  };

  /**
   * Graph embedding (for GNN)
   */
  graphEmbedding?: {
    nodeId: string;                  // In user-content bipartite graph
    neighbors: string[];             // Similar users
    communityId?: string;            // Cluster assignment
  };
}
```

### 2.3 UniversalContentVector (384D)

**Purpose**: Domain-agnostic content representation for cross-domain recommendations.

```typescript
/**
 * Universal Content Vector (384 dimensions)
 *
 * Content representation that generalizes across domains.
 * Phase 1: Movies/TV only
 * Phase 3: Movies, music, podcasts, books, etc.
 */
interface UniversalContentVector {
  /**
   * 384-dimensional embedding
   * Dimensions allocated as:
   * - Emotional Signature: 128D
   * - Engagement Pattern: 128D
   * - Complexity & Depth: 128D
   */
  vector: Float32Array;  // length: 384

  /**
   * Emotional Signature (128 dimensions)
   * What emotions does this content evoke?
   */
  emotionalSignature: {
    // Plutchik's 8 primary emotions (0-1 each)
    joy: number;
    trust: number;
    fear: number;
    surprise: number;
    sadness: number;
    disgust: number;
    anger: number;
    anticipation: number;

    // VAD (Valence-Arousal-Dominance) model
    valence: number;      // -1 (negative) to 1 (positive)
    arousal: number;      // 0 (calm) to 1 (exciting)
    dominance: number;    // 0 (submissive) to 1 (empowering)

    // Emotional arc (64D temporal pattern)
    arcPattern: Float32Array;  // How emotions evolve over time

    // Summary stats
    peakMoments: number;       // Number of emotional peaks
    variability: number;       // Emotional roller-coaster vs flat
  };

  /**
   * Engagement Pattern (128 dimensions)
   * How does this content engage users?
   */
  engagementPattern: {
    // Attention curve (32D): How attention is sustained
    attentionCurve: Float32Array;  // Typical attention over time

    // Retention metrics
    retentionRate: number;         // % users who complete
    reEngagementLikelihood: number; // Chance of re-watch/re-listen

    // Pacing
    pacingSpeed: number;           // Slow (0) to fast (1)
    rhythmVariability: number;     // Steady vs dynamic pacing

    // Intensity curve (32D)
    intensityCurve: Float32Array;  // Energy/intensity over time

    // Session characteristics
    optimalSessionLength: number;  // Minutes
    bingeability: number;          // 0 (standalone) to 1 (serialized)
  };

  /**
   * Complexity & Depth (128 dimensions)
   */
  complexityDepth: {
    // Cognitive demand
    cognitiveLoad: number;         // Mental effort required (0-1)
    abstractionLevel: number;      // Concrete (0) to abstract (1)

    // Thematic richness
    themeCount: number;            // Number of themes
    themeDepth: Float32Array;      // 32D: How deeply explored

    // Narrative/structure
    narrativeComplexity: number;   // Simple (0) to complex (1)
    perspectiveCount: number;      // Points of view

    // Domain embedding (64D)
    // Captures domain-specific features (genre, style, etc.)
    domainEmbedding: Float32Array;

    // Cultural context (16D)
    culturalContext: Float32Array; // Language, origin, cultural references
  };

  /**
   * Metadata
   */
  metadata: {
    contentId: string;
    domain: 'movie' | 'tv' | 'music' | 'podcast' | 'book' | 'course' | 'vr';
    title: string;
    version: number;               // Vector version
    lastUpdated: string;           // ISO 8601

    // Performance stats
    avgUtilityScore?: number;      // Average utility across users
    successRate?: number;          // % users satisfied
    causalUplift?: number;         // Causal effect on engagement
  };
}
```

### 2.4 Content Metadata Schema (SQLite)

```sql
-- Content table
CREATE TABLE content (
  id TEXT PRIMARY KEY,                 -- Unique content ID
  domain TEXT NOT NULL,                -- 'movie' | 'tv' | ...

  -- Basic metadata
  title TEXT NOT NULL,
  original_title TEXT,
  year INTEGER,
  release_date TEXT,                   -- ISO 8601 date

  -- TV5MONDE specific
  tv5_id TEXT UNIQUE,                  -- TV5MONDE internal ID
  tv5_deeplink TEXT,                   -- Direct streaming link
  tv5_availability TEXT,               -- JSON: regions, expiry

  -- TMDB metadata
  tmdb_id INTEGER,
  imdb_id TEXT,
  overview TEXT,                       -- Description
  tagline TEXT,
  poster_path TEXT,                    -- TMDB image path
  backdrop_path TEXT,

  -- Classification
  genres TEXT,                         -- JSON array: ['comedy', 'drama']
  tags TEXT,                           -- JSON array: user-generated tags
  content_rating TEXT,                 -- 'G', 'PG', 'PG-13', 'R', etc.

  -- Attributes
  runtime INTEGER,                     -- Minutes
  language TEXT,                       -- ISO 639-1 code
  country TEXT,                        -- ISO 3166-1 alpha-2

  -- Popularity metrics
  tmdb_popularity REAL,
  tmdb_vote_average REAL,
  tmdb__vote_count INTEGER,
  flixpatrol_rank INTEGER,

  -- Vector reference
  vector_id TEXT,                      -- Reference to vector store

  -- Timestamps
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_domain ON content(domain),
  INDEX idx_tv5_id ON content(tv5_id),
  INDEX idx_tmdb_id ON content(tmdb_id),
  INDEX idx_year ON content(year),
  INDEX idx_language ON content(language)
);

-- User profiles table
CREATE TABLE users (
  id TEXT PRIMARY KEY,                 -- Anonymized user hash

  -- Style vector reference
  vector_id TEXT NOT NULL,             -- Reference to AgentDB

  -- Metadata
  interaction_count INTEGER DEFAULT 0,
  first_interaction TEXT,              -- ISO 8601
  last_interaction TEXT,               -- ISO 8601

  -- Graph info
  graph_node_id TEXT,                  -- For GNN
  community_id TEXT,                   -- Cluster assignment

  -- Created/updated
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Interaction history
CREATE TABLE interactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content_id TEXT NOT NULL,

  -- Interaction type
  type TEXT NOT NULL,                  -- 'view' | 'complete' | 'abandon' | 'skip'

  -- Engagement metrics
  watch_duration INTEGER,              -- Seconds watched
  completion_rate REAL,                -- 0-1

  -- Context
  emotional_state TEXT,                -- JSON: UniversalEmotionalState
  context TEXT,                        -- JSON: device, time, social

  -- Outcome
  satisfaction_rating INTEGER,         -- 1-5 (if explicitly provided)
  implicit_satisfaction REAL,          -- 0-1 inferred

  -- Timestamps
  started_at TEXT NOT NULL,
  ended_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (content_id) REFERENCES content(id),

  INDEX idx_user_interactions ON interactions(user_id, created_at),
  INDEX idx_content_interactions ON interactions(content_id, created_at)
);

-- Trending data cache
CREATE TABLE trending (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL,

  -- Source
  source TEXT NOT NULL,                -- 'tmdb' | 'flixpatrol' | 'tv5monde'

  -- Metrics
  rank INTEGER,
  score REAL,
  region TEXT,                         -- ISO 3166-1 alpha-2

  -- Time window
  window_start TEXT NOT NULL,          -- ISO 8601
  window_end TEXT NOT NULL,

  -- Timestamps
  fetched_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (content_id) REFERENCES content(id),

  INDEX idx_trending_content ON trending(content_id, fetched_at),
  INDEX idx_trending_source ON trending(source, window_start)
);
```

### 2.5 Trajectory/Episode Schema (ReasoningBank)

```typescript
/**
 * Trajectory for ReasoningBank pattern learning
 * Stored in AgentDB's ReasoningBank
 */
interface Trajectory {
  /**
   * Unique trajectory ID
   */
  id: string;

  /**
   * Session information
   */
  session: {
    sessionId: string;
    userId: string;                    // Anonymized
    timestamp: string;                 // ISO 8601
  };

  /**
   * Initial state
   */
  initialState: {
    emotionalState: UniversalEmotionalState;
    userVector: Float32Array;          // 64D user style
    context: Record<string, any>;
  };

  /**
   * Actions taken (multi-step trajectory)
   */
  actions: Array<{
    step: number;
    agentType: 'intent' | 'catalog' | 'trend' | 'match' | 'present';
    action: string;                    // Description
    parameters: Record<string, any>;
    result: Record<string, any>;
    latency: number;                   // Milliseconds
  }>;

  /**
   * Final recommendation
   */
  recommendation: {
    contentId: string;
    matchScore: number;
    utilityScore: number;
    vectorSimilarity: number;
    causalUplift?: number;
    skillUsed?: string;                // Learned skill name
  };

  /**
   * Outcome
   */
  outcome: {
    interactionType: 'view' | 'complete' | 'abandon' | 'skip' | 'refine';
    completionRate?: number;           // 0-1
    watchDuration?: number;            // Seconds
    implicitSatisfaction: number;      // 0-1 inferred
    explicitRating?: number;           // 1-5
  };

  /**
   * Verdict (self-critique for Reflexion Memory)
   */
  verdict: {
    success: boolean;
    confidenceScore: number;           // 0-1
    reasoning: string;

    // What went well
    strengths: string[];

    // What could improve
    weaknesses: string[];

    // What to avoid next time
    avoidPatterns?: string[];

    // Suggested improvements
    improvements?: string[];
  };

  /**
   * Learning signals
   */
  learningSignals: {
    // Should this trajectory be used for pattern learning?
    useForTraining: boolean;

    // Anomaly detection
    isOutlier: boolean;

    // Causal signals
    interventions?: Array<{
      variable: string;
      value: any;
      effect: number;
    }>;
  };
}

/**
 * Reflexion Memory Episode
 * Stored for self-critique and learning
 */
interface ReflexionEpisode {
  id: string;
  trajectoryId: string;

  /**
   * Self-critique analysis
   */
  critique: {
    // What was the task?
    task: string;

    // What did we try?
    approach: string;

    // What happened?
    outcome: string;

    // Why did it succeed/fail?
    analysis: string;

    // What should we do differently?
    reflection: string;

    // Confidence in this critique
    confidence: number;  // 0-1
  };

  /**
   * Provenance
   */
  provenance: {
    timestamp: string;
    agentType: string;
    evidenceCount: number;
    similarEpisodes: string[];         // IDs of similar episodes
  };
}
```

---

## 3. API Specifications

### 3.1 MCP Tools

```typescript
/**
 * MCP Tool: get_recommendation
 *
 * Main recommendation endpoint
 */
interface GetRecommendationInput {
  /**
   * Mood selection from binary choice quiz
   */
  mood: 'unwind' | 'engage';

  /**
   * Goal selection from binary choice quiz
   */
  goal: 'laugh' | 'feel' | 'thrill' | 'think';

  /**
   * Optional constraints
   */
  constraints?: {
    maxRuntime?: number;               // Maximum runtime in minutes
    minYear?: number;                  // Minimum release year
    maxYear?: number;                  // Maximum release year
    languages?: string[];              // ISO 639-1 codes
    genres?: string[];                 // Preferred genres
    excludeGenres?: string[];          // Excluded genres
  };

  /**
   * Context (auto-detected or user-provided)
   */
  context?: {
    social?: 'alone' | 'partner' | 'family' | 'friends';
    device?: 'mobile' | 'tablet' | 'desktop' | 'tv';
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  };

  /**
   * User ID (optional, for personalization)
   */
  userId?: string;

  /**
   * Request options
   */
  options?: {
    includeAlternatives?: boolean;     // Include runner-up recommendations
    alternativeCount?: number;         // How many alternatives (default: 3)
    includeProvenance?: boolean;       // Include evidence/reasoning (default: true)
    includeTrending?: boolean;         // Boost trending content (default: true)
    explainReasoning?: boolean;        // Natural language explanation (default: true)
  };
}

interface GetRecommendationOutput {
  /**
   * Top recommendation
   */
  topPick: {
    // Content details
    id: string;
    title: string;
    originalTitle?: string;
    year: number;
    runtime: number;                   // Minutes
    language: string;
    genres: string[];

    // Description
    overview: string;
    tagline?: string;

    // Images
    posterUrl?: string;
    backdropUrl?: string;

    // Scores
    matchScore: number;                // 0-1: Overall match
    utilityScore: number;              // 0-1: Expected utility (NEW)
    vectorSimilarity: number;          // 0-1: Vector similarity
    causalUplift?: number;             // Expected engagement boost (NEW)

    // Breakdown
    scoreBreakdown?: {
      moodMatch: number;
      intentMatch: number;
      styleMatch: number;
      contextMatch: number;
      trendingBoost: number;
      skillBoost?: number;             // Learned pattern boost
    };

    // Provenance (NEW)
    provenance?: {
      evidenceTrajectories: number;    // How many similar past successes
      confidenceInterval: [number, number];  // [lower, upper] bounds
      similarUsersCompleted: string;   // "87% of similar users completed"
      skillUsed?: string;              // Name of learned skill applied
      reasoning: string;               // Why this was recommended
    };

    // Streaming info
    deeplink: string;                  // Direct link to watch on TV5MONDE
    availability: {
      regions: string[];
      expiresAt?: string;              // ISO 8601 (if limited time)
    };
  };

  /**
   * Alternative recommendations
   */
  alternatives?: Array<{
    // Same structure as topPick
    id: string;
    title: string;
    matchScore: number;
    utilityScore: number;
    reasoning: string;
    deeplink: string;
    // ... (abbreviated for brevity)
  }>;

  /**
   * Natural language explanation
   */
  reasoning?: {
    summary: string;                   // "Perfect for unwinding with a laugh"
    why: string;                       // "Based on your Friday evening patterns..."
    confidenceLevel: 'high' | 'medium' | 'low';
  };

  /**
   * Metadata
   */
  metadata: {
    requestId: string;
    timestamp: string;                 // ISO 8601
    latency: number;                   // Milliseconds
    agentsInvolved: string[];          // Which agents participated
    skillsApplied: string[];           // Learned skills used
    candidatesEvaluated: number;       // Total content items scored
  };
}

/**
 * MCP Tool: refine_search
 *
 * Refine previous recommendation based on feedback
 */
interface RefineSearchInput {
  /**
   * Previous request ID
   */
  previousRequestId: string;

  /**
   * Feedback on previous recommendation
   */
  feedback: {
    reason: 'too_long' | 'wrong_mood' | 'seen_it' | 'not_interested' | 'prefer_different';
    detail?: string;                   // Natural language refinement
  };

  /**
   * Additional constraints
   */
  additionalConstraints?: {
    excludeContentIds?: string[];      // Don't show these again
    preferGenres?: string[];
    // ... (same as GetRecommendationInput.constraints)
  };
}

interface RefineSearchOutput {
  // Same structure as GetRecommendationOutput
  topPick: { /* ... */ };
  alternatives?: Array<{ /* ... */ }>;
  reasoning?: { /* ... */ };
  metadata: {
    refinementCount: number;           // How many refinements in this session
    learnedFrom: string;               // What we learned from feedback
    // ... (other metadata)
  };
}

/**
 * MCP Tool: get_trending
 *
 * Get trending content (no personalization)
 */
interface GetTrendingInput {
  /**
   * Region
   */
  region?: string;                     // ISO 3166-1 alpha-2 (default: 'FR')

  /**
   * Time window
   */
  window?: 'day' | 'week' | 'month';

  /**
   * Filters
   */
  filters?: {
    domain?: 'movie' | 'tv';
    genres?: string[];
  };

  /**
   * Limit
   */
  limit?: number;                      // Default: 10
}

interface GetTrendingOutput {
  trending: Array<{
    rank: number;
    content: {
      id: string;
      title: string;
      year: number;
      genres: string[];
      posterUrl?: string;
      deeplink: string;
    };
    metrics: {
      trendingScore: number;
      source: 'tmdb' | 'flixpatrol' | 'tv5monde';
    };
  }>;

  metadata: {
    region: string;
    window: string;
    timestamp: string;
    sources: string[];
  };
}

/**
 * MCP Tool: user_feedback
 *
 * Record user feedback (for learning)
 */
interface UserFeedbackInput {
  /**
   * Request ID from recommendation
   */
  requestId: string;

  /**
   * Content ID
   */
  contentId: string;

  /**
   * Interaction type
   */
  interaction: {
    type: 'started' | 'completed' | 'abandoned' | 'skipped';
    watchDuration?: number;            // Seconds
    completionRate?: number;           // 0-1
  };

  /**
   * Optional explicit rating
   */
  rating?: {
    score: number;                     // 1-5
    comment?: string;
  };

  /**
   * Timestamp
   */
  timestamp: string;                   // ISO 8601
}

interface UserFeedbackOutput {
  success: boolean;
  message: string;

  /**
   * Learning confirmation
   */
  learning?: {
    trajectoryId: string;
    verdictRecorded: boolean;
    patternUpdated: boolean;
  };
}
```

### 3.2 MCP Tool Manifest (ARW)

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "site": {
    "name": "Universal Content Discovery",
    "description": "AI-powered emotion-first content discovery platform",
    "url": "https://content-discovery.tv5monde.com",
    "vendor": "TV5MONDE / Agentic Pancakes",
    "contact": "api@tv5monde.com"
  },
  "capabilities": {
    "recommendation": true,
    "refinement": true,
    "trending": true,
    "learning": true,
    "provenance": true
  },
  "tools": [
    {
      "name": "get_recommendation",
      "description": "Get personalized content recommendation based on mood and context",
      "endpoint": {
        "protocol": "mcp",
        "transport": ["stdio", "sse"]
      },
      "parameters": {
        "mood": {
          "type": "string",
          "enum": ["unwind", "engage"],
          "required": true,
          "description": "User's current energy level"
        },
        "goal": {
          "type": "string",
          "enum": ["laugh", "feel", "thrill", "think"],
          "required": true,
          "description": "User's viewing goal"
        },
        "constraints": {
          "type": "object",
          "required": false,
          "description": "Optional filters and constraints"
        },
        "context": {
          "type": "object",
          "required": false,
          "description": "Contextual information"
        },
        "userId": {
          "type": "string",
          "required": false,
          "description": "User ID for personalization"
        },
        "options": {
          "type": "object",
          "required": false,
          "description": "Request options"
        }
      }
    },
    {
      "name": "refine_search",
      "description": "Refine previous recommendation based on user feedback",
      "endpoint": {
        "protocol": "mcp",
        "transport": ["stdio", "sse"]
      },
      "parameters": {
        "previousRequestId": {
          "type": "string",
          "required": true
        },
        "feedback": {
          "type": "object",
          "required": true
        },
        "additionalConstraints": {
          "type": "object",
          "required": false
        }
      }
    },
    {
      "name": "get_trending",
      "description": "Get trending content without personalization",
      "endpoint": {
        "protocol": "mcp",
        "transport": ["stdio", "sse"]
      },
      "parameters": {
        "region": {
          "type": "string",
          "required": false,
          "default": "FR"
        },
        "window": {
          "type": "string",
          "enum": ["day", "week", "month"],
          "required": false,
          "default": "week"
        },
        "filters": {
          "type": "object",
          "required": false
        },
        "limit": {
          "type": "number",
          "required": false,
          "default": 10
        }
      }
    },
    {
      "name": "user_feedback",
      "description": "Record user interaction for learning",
      "endpoint": {
        "protocol": "mcp",
        "transport": ["stdio", "sse"]
      },
      "parameters": {
        "requestId": {
          "type": "string",
          "required": true
        },
        "contentId": {
          "type": "string",
          "required": true
        },
        "interaction": {
          "type": "object",
          "required": true
        },
        "rating": {
          "type": "object",
          "required": false
        },
        "timestamp": {
          "type": "string",
          "required": true
        }
      }
    }
  ],
  "authentication": {
    "type": "none",
    "note": "Public API for MVP; OAuth2 for production"
  },
  "rateLimit": {
    "requestsPerMinute": 60,
    "requestsPerHour": 1000
  },
  "monitoring": {
    "healthcheck": "/.well-known/health",
    "status": "/.well-known/status"
  }
}
```

### 3.3 REST API Endpoints (Future Enhancement)

```typescript
/**
 * REST API for web/mobile clients (Phase 2+)
 */

// POST /api/v1/recommend
interface RecommendRequest {
  // Same as GetRecommendationInput
}
interface RecommendResponse {
  // Same as GetRecommendationOutput
}

// POST /api/v1/refine
interface RefineRequest {
  // Same as RefineSearchInput
}
interface RefineResponse {
  // Same as RefineSearchOutput
}

// GET /api/v1/trending
interface TrendingQuery {
  region?: string;
  window?: string;
  limit?: number;
}
interface TrendingResponse {
  // Same as GetTrendingOutput
}

// POST /api/v1/feedback
interface FeedbackRequest {
  // Same as UserFeedbackInput
}
interface FeedbackResponse {
  // Same as UserFeedbackOutput
}

// GET /api/v1/content/:id
interface ContentResponse {
  content: {
    // Full content metadata
  };
}

// WebSocket: /api/v1/stream
interface StreamMessage {
  type: 'recommendation' | 'refinement' | 'feedback' | 'status';
  data: any;
  timestamp: string;
}
```

---

## 4. Agent Specifications

### 4.1 Orchestrator Agent

**Purpose**: Coordinate the multi-agent workflow for recommendation generation.

```typescript
/**
 * Orchestrator Agent
 *
 * Main controller that coordinates all other agents
 */
class OrchestratorAgent {
  /**
   * Process a recommendation request
   */
  async processRequest(input: GetRecommendationInput): Promise<GetRecommendationOutput> {
    const sessionId = generateSessionId();
    const startTime = Date.now();

    try {
      // Step 1: Intent extraction
      const intentResult = await this.invokeAgent('intent', {
        input,
        sessionId
      });

      // Step 2: Parallel content retrieval
      const [catalogResult, trendResult] = await Promise.all([
        this.invokeAgent('catalog', {
          emotionalState: intentResult.emotionalState,
          userVector: intentResult.userVector,
          constraints: input.constraints,
          sessionId
        }),
        this.invokeAgent('trend', {
          region: this.detectRegion(),
          includeTrending: input.options?.includeTrending ?? true,
          sessionId
        })
      ]);

      // Step 3: Match and rank
      const matchResult = await this.invokeAgent('match', {
        emotionalState: intentResult.emotionalState,
        candidates: catalogResult.candidates,
        trendingData: trendResult.trending,
        userVector: intentResult.userVector,
        sessionId
      });

      // Step 4: Present recommendations
      const presentResult = await this.invokeAgent('present', {
        recommendations: matchResult.ranked,
        emotionalState: intentResult.emotionalState,
        includeProvenance: input.options?.includeProvenance ?? true,
        explainReasoning: input.options?.explainReasoning ?? true,
        sessionId
      });

      // Step 5: Store trajectory for learning
      await this.storeTrajectory({
        sessionId,
        input,
        intentResult,
        catalogResult,
        trendResult,
        matchResult,
        presentResult,
        latency: Date.now() - startTime
      });

      return presentResult.output;

    } catch (error) {
      // Error handling and logging
      await this.logError(sessionId, error);
      throw error;
    }
  }

  /**
   * Invoke a specific agent
   */
  private async invokeAgent(
    agentType: 'intent' | 'catalog' | 'trend' | 'match' | 'present',
    input: any
  ): Promise<any> {
    const agent = this.agents[agentType];
    const startTime = Date.now();

    const result = await agent.process(input);

    // Log agent execution
    await this.logAgentExecution({
      agentType,
      input,
      result,
      latency: Date.now() - startTime
    });

    return result;
  }
}
```

**Inputs**:
- `GetRecommendationInput` from MCP tool call

**Outputs**:
- `GetRecommendationOutput` with full recommendation

**Responsibilities**:
1. Coordinate agent execution order
2. Handle parallel agent invocation
3. Aggregate results from multiple agents
4. Store trajectories for learning
5. Handle errors and retries
6. Log performance metrics

**Performance Target**: < 2 seconds end-to-end latency

---

### 4.2 Intent Agent

**Purpose**: Extract emotional state and context from user input.

```typescript
/**
 * Intent Agent
 *
 * Extracts UniversalEmotionalState from user input
 */
class IntentAgent {
  /**
   * Process user input into emotional state
   */
  async process(input: {
    mood: 'unwind' | 'engage';
    goal: 'laugh' | 'feel' | 'thrill' | 'think';
    context?: any;
    userId?: string;
    sessionId: string;
  }): Promise<{
    emotionalState: UniversalEmotionalState;
    userVector?: Float32Array;
    reflexionAdvice?: string[];
  }> {
    // Step 1: Query Reflexion Memory for similar past contexts
    const reflexionContext = await this.queryReflexionMemory({
      mood: input.mood,
      goal: input.goal,
      context: input.context,
      userId: input.userId
    });

    // Step 2: Map quiz inputs to emotional dimensions
    const emotionalState = this.mapToEmotionalState({
      mood: input.mood,
      goal: input.goal,
      context: input.context,
      reflexionAdvice: reflexionContext.avoidPatterns
    });

    // Step 3: Load user style vector (if user is known)
    let userVector: Float32Array | undefined;
    if (input.userId) {
      userVector = await this.loadUserVector(input.userId);
    }

    // Step 4: Enhance with LLM for nuanced understanding
    const enhanced = await this.enhanceWithLLM({
      emotionalState,
      rawInput: input,
      reflexionContext
    });

    return {
      emotionalState: enhanced.emotionalState,
      userVector,
      reflexionAdvice: reflexionContext.avoidPatterns
    };
  }

  /**
   * Map binary quiz choices to UniversalEmotionalState
   */
  private mapToEmotionalState(input: {
    mood: 'unwind' | 'engage';
    goal: 'laugh' | 'feel' | 'thrill' | 'think';
    context?: any;
    reflexionAdvice?: string[];
  }): UniversalEmotionalState {
    // Energy mapping
    const energy = input.mood === 'unwind' ? 0.3 : 0.7;

    // Goal mapping to needs
    const needsMap = {
      laugh: { joy: 0.9, relaxation: 0.7, escape: 0.6 },
      feel: { connection: 0.8, catharsis: 0.7, meaning: 0.6 },
      thrill: { stimulation: 0.9, arousal: 0.8, escape: 0.5 },
      think: { growth: 0.8, meaning: 0.7, cognitiveCapacity: 0.8 }
    };

    const baseNeeds = needsMap[input.goal];

    // Arousal mapping
    const arousalMap = {
      laugh: 0.6,
      feel: 0.4,
      thrill: 0.9,
      think: 0.5
    };

    // Valence mapping
    const valenceMap = {
      laugh: 0.8,
      feel: 0.0,  // Neutral (could be positive or negative emotions)
      thrill: 0.3,
      think: 0.5
    };

    // Build emotional state
    return {
      energy,
      valence: valenceMap[input.goal],
      arousal: arousalMap[input.goal],
      cognitiveCapacity: input.mood === 'unwind' ? 0.5 : 0.7,
      needs: {
        comfort: input.mood === 'unwind' ? 0.7 : 0.3,
        escape: baseNeeds.escape ?? 0.5,
        stimulation: baseNeeds.stimulation ?? 0.5,
        connection: baseNeeds.connection ?? 0.4,
        growth: baseNeeds.growth ?? 0.4,
        catharsis: baseNeeds.catharsis ?? 0.3,
        joy: baseNeeds.joy ?? 0.5,
        relaxation: baseNeeds.relaxation ?? (input.mood === 'unwind' ? 0.8 : 0.3),
        meaning: baseNeeds.meaning ?? 0.5,
        beauty: 0.5
      },
      context: this.buildContext(input.context),
      captureMethod: {
        modality: 'touch',
        confidence: 0.85,
        timestamp: new Date().toISOString()
      },
      sessionId: input.sessionId,
      userId: input.userId
    };
  }

  /**
   * Query Reflexion Memory for similar contexts
   */
  private async queryReflexionMemory(input: any): Promise<{
    avoidPatterns: string[];
    similarSuccesses: string[];
  }> {
    // Query AgentDB Reflexion Memory
    const episodes = await agentdb.reflexion.query({
      context: {
        mood: input.mood,
        goal: input.goal,
        timeOfDay: input.context?.timeOfDay,
        dayOfWeek: new Date().getDay()
      },
      limit: 10
    });

    // Extract patterns to avoid (from failures)
    const avoidPatterns = episodes
      .filter(ep => !ep.verdict.success)
      .flatMap(ep => ep.verdict.avoidPatterns || []);

    // Extract successful patterns
    const similarSuccesses = episodes
      .filter(ep => ep.verdict.success)
      .map(ep => ep.id);

    return { avoidPatterns, similarSuccesses };
  }
}
```

**Inputs**:
- Mood: `unwind` | `engage`
- Goal: `laugh` | `feel` | `thrill` | `think`
- Context: device, time, social
- User ID (optional)

**Outputs**:
- `UniversalEmotionalState` (64+ dimensions)
- User style vector (64D, if available)
- Reflexion advice (patterns to avoid)

**Responsibilities**:
1. Map binary choices to emotional dimensions
2. Query Reflexion Memory for similar contexts
3. Load user profile/style vector
4. Enhance understanding with LLM (Claude Haiku)
5. Build complete emotional context

**Performance Target**: < 300ms

---

### 4.3 Catalog Agent

**Purpose**: Search content catalog using vector similarity and causal recall.

```typescript
/**
 * Catalog Agent
 *
 * Searches content using AgentDB vector search + Causal Recall
 */
class CatalogAgent {
  /**
   * Search for candidate content
   */
  async process(input: {
    emotionalState: UniversalEmotionalState;
    userVector?: Float32Array;
    constraints?: any;
    sessionId: string;
  }): Promise<{
    candidates: Array<{
      contentId: string;
      vectorSimilarity: number;
      utilityScore: number;
      causalUplift?: number;
    }>;
  }> {
    // Step 1: Convert emotional state to query vector
    const queryVector = await this.emotionalStateToVector(
      input.emotionalState,
      input.userVector
    );

    // Step 2: Build filter constraints
    const filters = this.buildFilters(input.constraints);

    // Step 3: Execute hybrid search (vector + causal recall)
    const searchResults = await this.hybridSearch({
      queryVector,
      emotionalState: input.emotionalState,
      filters,
      limit: 100  // Get top 100 candidates
    });

    return {
      candidates: searchResults
    };
  }

  /**
   * Hybrid search: Vector similarity + Causal Recall
   */
  private async hybridSearch(params: {
    queryVector: Float32Array;
    emotionalState: UniversalEmotionalState;
    filters: any;
    limit: number;
  }): Promise<Array<any>> {
    // Option 1: Use AgentDB's Causal Recall directly
    const causalResults = await agentdb.causalRecall.search({
      query: params.queryVector,

      // Utility function: balance similarity, uplift, and latency
      utilityFunction: (candidate) => {
        const alpha = 0.4;  // Similarity weight (learned)
        const beta = 0.5;   // Causal uplift weight (learned)
        const gamma = 0.1;  // Latency penalty weight

        return (
          alpha * candidate.vectorSimilarity +
          beta * (candidate.causalUplift || 0) -
          gamma * (candidate.retrievalLatency / 1000)
        );
      },

      // Filters
      filters: params.filters,

      // Limit
      limit: params.limit,

      // Include provenance
      includeProvenance: true
    });

    // Option 2: Fallback to HNSW if Causal Recall not ready
    if (!causalResults || causalResults.length === 0) {
      const hnsw Results = await agentdb.vector.search({
        query: params.queryVector,
        limit: params.limit,
        filters: params.filters
      });

      return hnswResults.map(result => ({
        contentId: result.id,
        vectorSimilarity: result.similarity,
        utilityScore: result.similarity,  // Fallback: utility = similarity
        causalUplift: undefined
      }));
    }

    return causalResults;
  }

  /**
   * Convert emotional state to query vector
   */
  private async emotionalStateToVector(
    emotionalState: UniversalEmotionalState,
    userVector?: Float32Array
  ): Promise<Float32Array> {
    // Combine emotional state + user style vector
    const stateVector = this.encodeEmotionalState(emotionalState);

    if (userVector) {
      // Weighted combination
      const combined = new Float32Array(384);  // Assuming 384D UCV

      // First 64D: User style (0.3 weight)
      for (let i = 0; i < 64; i++) {
        combined[i] = userVector[i] * 0.3;
      }

      // Remaining: Emotional state (0.7 weight)
      for (let i = 0; i < stateVector.length; i++) {
        combined[64 + i] = stateVector[i] * 0.7;
      }

      return combined;
    }

    return stateVector;
  }

  /**
   * Encode emotional state as vector
   */
  private encodeEmotionalState(state: UniversalEmotionalState): Float32Array {
    // Simplified encoding (in practice, use learned encoder)
    const vector = new Float32Array(320);  // 384 - 64 = 320

    let idx = 0;

    // Affective dimensions (4)
    vector[idx++] = state.energy;
    vector[idx++] = (state.valence + 1) / 2;  // Normalize to 0-1
    vector[idx++] = state.arousal;
    vector[idx++] = state.cognitiveCapacity;

    // Needs (10)
    Object.values(state.needs).forEach(need => {
      vector[idx++] = need;
    });

    // Context encoding (simplified, 20 dimensions)
    // In practice: use learned embeddings for context
    vector[idx++] = state.context.time.hour / 24;
    vector[idx++] = state.context.time.isWeekend ? 1 : 0;
    // ... encode other context features

    // Remaining dimensions: zero-padded (or use LLM embeddings)

    return vector;
  }
}
```

**Inputs**:
- `UniversalEmotionalState`
- User style vector (optional)
- Constraints (filters)

**Outputs**:
- Candidate content items (100+)
- Vector similarity scores
- Utility scores (from Causal Recall)
- Causal uplift estimates

**Responsibilities**:
1. Convert emotional state to query vector
2. Execute hybrid search (HNSW + Causal Recall)
3. Apply filters and constraints
4. Return top candidates with scores

**Performance Target**: < 500ms (with HNSW 150x speedup)

---

### 4.4 Trend Agent

**Purpose**: Fetch and integrate trending/popularity signals.

```typescript
/**
 * Trend Agent
 *
 * Fetches trending data from external APIs and learned patterns
 */
class TrendAgent {
  /**
   * Get trending data
   */
  async process(input: {
    region: string;
    includeTrending: boolean;
    sessionId: string;
  }): Promise<{
    trending: Map<string, number>;  // contentId -> trending score
    patterns?: any;
  }> {
    if (!input.includeTrending) {
      return { trending: new Map() };
    }

    // Step 1: Fetch from cache or APIs
    const trendingData = await this.fetchTrendingData(input.region);

    // Step 2: Query learned patterns from ReasoningBank
    const learnedPatterns = await this.queryLearnedPatterns({
      region: input.region,
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay()
    });

    // Step 3: Combine trending + learned patterns
    const combinedScores = this.combineScores(
      trendingData,
      learnedPatterns
    );

    return {
      trending: combinedScores,
      patterns: learnedPatterns
    };
  }

  /**
   * Fetch trending data from APIs
   */
  private async fetchTrendingData(region: string): Promise<Map<string, number>> {
    // Check cache first
    const cached = await this.checkCache(region);
    if (cached) return cached;

    // Fetch from external APIs in parallel
    const [tmdbTrending, flixpatrolTrending] = await Promise.all([
      this.fetchTMDBTrending(region),
      this.fetchFlixPatrolTrending(region)
    ]);

    // Merge and normalize scores
    const merged = this.mergeTrendingData(tmdbTrending, flixpatrolTrending);

    // Cache for 1 hour
    await this.cacheResults(region, merged, 3600);

    return merged;
  }

  /**
   * Query learned trending patterns from ReasoningBank
   */
  private async queryLearnedPatterns(context: any): Promise<any> {
    // Query skill library for trending patterns
    const skills = await agentdb.skills.query({
      skillType: 'trending_pattern',
      context
    });

    // Example learned pattern:
    // "Friday evening: Comedy trending +40% vs baseline"

    return skills;
  }

  /**
   * Fetch TMDB trending
   */
  private async fetchTMDBTrending(region: string): Promise<Map<string, number>> {
    const response = await fetch(
      `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();

    const scores = new Map<string, number>();
    data.results.forEach((item: any, index: number) => {
      // Normalize: rank 1 = 1.0, rank 20 = 0.5
      const score = 1.0 - (index / 40);
      scores.set(item.id.toString(), score);
    });

    return scores;
  }

  /**
   * Fetch FlixPatrol trending
   */
  private async fetchFlixPatrolTrending(region: string): Promise<Map<string, number>> {
    // Similar to TMDB, fetch from FlixPatrol API
    // (Implementation details depend on FlixPatrol API)

    return new Map();
  }
}
```

**Inputs**:
- Region (e.g., 'FR')
- Include trending flag

**Outputs**:
- Trending scores by content ID
- Learned patterns (from ReasoningBank)

**Responsibilities**:
1. Fetch trending data from TMDB/FlixPatrol
2. Cache trending data (1 hour TTL)
3. Query learned trending patterns from ReasoningBank
4. Combine API data with learned patterns
5. Normalize scores

**Performance Target**: < 200ms (with caching)

---

### 4.5 Match Agent

**Purpose**: Score, rank, and select best recommendations using learned patterns.

```typescript
/**
 * Match Agent
 *
 * Scores and ranks candidates using ReasoningBank patterns
 */
class MatchAgent {
  /**
   * Score and rank candidates
   */
  async process(input: {
    emotionalState: UniversalEmotionalState;
    candidates: Array<any>;
    trendingData: Map<string, number>;
    userVector?: Float32Array;
    sessionId: string;
  }): Promise<{
    ranked: Array<{
      contentId: string;
      finalScore: number;
      breakdown: any;
      skillUsed?: string;
    }>;
  }> {
    // Step 1: Query learned skills from ReasoningBank
    const skills = await this.queryRelevantSkills(input.emotionalState);

    // Step 2: Score each candidate
    const scored = await Promise.all(
      input.candidates.map(candidate =>
        this.scoreCandidate({
          candidate,
          emotionalState: input.emotionalState,
          trendingScore: input.trendingData.get(candidate.contentId) || 0,
          skills,
          userVector: input.userVector
        })
      )
    );

    // Step 3: Apply diversity and deduplication
    const diversified = this.applyDiversity(scored);

    // Step 4: Rank by final score
    const ranked = diversified.sort((a, b) => b.finalScore - a.finalScore);

    return { ranked };
  }

  /**
   * Query relevant skills from ReasoningBank
   */
  private async queryRelevantSkills(
    emotionalState: UniversalEmotionalState
  ): Promise<Array<any>> {
    const context = {
      mood: emotionalState.energy > 0.5 ? 'engage' : 'unwind',
      timeOfDay: emotionalState.context.time.timeOfDay,
      dayOfWeek: emotionalState.context.time.dayOfWeek,
      isWeekend: emotionalState.context.time.isWeekend
    };

    // Query skill library
    const skills = await agentdb.skills.query({
      context,
      limit: 5,
      minConfidence: 0.80
    });

    return skills;
  }

  /**
   * Score a single candidate
   */
  private async scoreCandidate(params: {
    candidate: any;
    emotionalState: UniversalEmotionalState;
    trendingScore: number;
    skills: Array<any>;
    userVector?: Float32Array;
  }): Promise<any> {
    const { candidate, emotionalState, trendingScore, skills } = params;

    // Base scores from Catalog Agent
    const vectorSim = candidate.vectorSimilarity;
    const utilityScore = candidate.utilityScore;
    const causalUplift = candidate.causalUplift || 0;

    // Apply learned skill boosts
    let skillBoost = 0;
    let skillUsed: string | undefined;

    for (const skill of skills) {
      const boost = skill.apply(candidate, emotionalState);
      if (boost > skillBoost) {
        skillBoost = boost;
        skillUsed = skill.name;
      }
    }

    // Compute final score using learned weights
    const weights = await this.getLearnedWeights();

    const finalScore = (
      weights.vectorSimilarity * vectorSim +
      weights.causalUplift * causalUplift +
      weights.trending * trendingScore +
      weights.skillBoost * skillBoost
    );

    return {
      contentId: candidate.contentId,
      finalScore,
      breakdown: {
        vectorSimilarity: vectorSim,
        utilityScore,
        causalUplift,
        trendingScore,
        skillBoost
      },
      skillUsed
    };
  }

  /**
   * Get learned weights from ReasoningBank
   */
  private async getLearnedWeights(): Promise<any> {
    // Query ReasoningBank for optimized weights
    // Initially: Use static defaults
    // After 1000+ interactions: Use learned weights

    const learnedWeights = await agentdb.reasoningBank.getWeights('matching_formula');

    if (learnedWeights && learnedWeights.confidence > 0.85) {
      return learnedWeights.weights;
    }

    // Fallback: Static defaults
    return {
      vectorSimilarity: 0.40,
      causalUplift: 0.35,
      trending: 0.15,
      skillBoost: 0.10
    };
  }

  /**
   * Apply diversity (avoid over-recommending similar content)
   */
  private applyDiversity(scored: Array<any>): Array<any> {
    // MMR (Maximal Marginal Relevance) algorithm
    const selected: Array<any> = [];
    const remaining = [...scored];
    const lambda = 0.7;  // Relevance vs diversity trade-off

    // Select top item
    selected.push(remaining.shift()!);

    // Iteratively select diverse items
    while (remaining.length > 0 && selected.length < 10) {
      let bestScore = -Infinity;
      let bestIdx = 0;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];

        // Relevance score
        const relevance = candidate.finalScore;

        // Similarity to already selected
        const maxSim = Math.max(...selected.map(s =>
          this.computeSimilarity(s.contentId, candidate.contentId)
        ));

        // MMR score
        const mmrScore = lambda * relevance - (1 - lambda) * maxSim;

        if (mmrScore > bestScore) {
          bestScore = mmrScore;
          bestIdx = i;
        }
      }

      selected.push(remaining.splice(bestIdx, 1)[0]);
    }

    return selected;
  }
}
```

**Inputs**:
- Emotional state
- Candidate content items (from Catalog)
- Trending data (from Trend)
- User vector (optional)

**Outputs**:
- Ranked recommendations with scores
- Score breakdowns
- Skills applied

**Responsibilities**:
1. Query learned skills from ReasoningBank
2. Score each candidate using learned formula
3. Apply skill boosts
4. Ensure diversity (MMR algorithm)
5. Rank by final score

**Performance Target**: < 400ms

---

### 4.6 Present Agent

**Purpose**: Format recommendations with provenance and explanations.

```typescript
/**
 * Present Agent
 *
 * Formats final recommendations with provenance certificates
 */
class PresentAgent {
  /**
   * Format recommendations for output
   */
  async process(input: {
    recommendations: Array<any>;
    emotionalState: UniversalEmotionalState;
    includeProvenance: boolean;
    explainReasoning: boolean;
    sessionId: string;
  }): Promise<{
    output: GetRecommendationOutput;
  }> {
    const topPick = input.recommendations[0];
    const alternatives = input.recommendations.slice(1, 4);  // Next 3

    // Load full content metadata
    const topPickContent = await this.loadContentMetadata(topPick.contentId);
    const alternativesContent = await Promise.all(
      alternatives.map(alt => this.loadContentMetadata(alt.contentId))
    );

    // Generate provenance if requested
    let provenance: any;
    if (input.includeProvenance) {
      provenance = await this.generateProvenance(topPick, input.sessionId);
    }

    // Generate explanation if requested
    let reasoning: any;
    if (input.explainReasoning) {
      reasoning = await this.generateExplanation(
        topPick,
        input.emotionalState,
        topPickContent
      );
    }

    // Build output
    const output: GetRecommendationOutput = {
      topPick: {
        // Content details
        id: topPickContent.id,
        title: topPickContent.title,
        originalTitle: topPickContent.originalTitle,
        year: topPickContent.year,
        runtime: topPickContent.runtime,
        language: topPickContent.language,
        genres: topPickContent.genres,
        overview: topPickContent.overview,
        tagline: topPickContent.tagline,
        posterUrl: topPickContent.posterUrl,
        backdropUrl: topPickContent.backdropUrl,

        // Scores
        matchScore: topPick.finalScore,
        utilityScore: topPick.breakdown.utilityScore,
        vectorSimilarity: topPick.breakdown.vectorSimilarity,
        causalUplift: topPick.breakdown.causalUplift,
        scoreBreakdown: topPick.breakdown,

        // Provenance
        provenance,

        // Streaming
        deeplink: topPickContent.deeplink,
        availability: topPickContent.availability
      },

      alternatives: alternativesContent.map((content, i) => ({
        id: content.id,
        title: content.title,
        matchScore: alternatives[i].finalScore,
        utilityScore: alternatives[i].breakdown.utilityScore,
        reasoning: `Alternative ${i + 1}`,
        deeplink: content.deeplink
      })),

      reasoning,

      metadata: {
        requestId: input.sessionId,
        timestamp: new Date().toISOString(),
        latency: 0,  // Filled by Orchestrator
        agentsInvolved: ['intent', 'catalog', 'trend', 'match', 'present'],
        skillsApplied: [topPick.skillUsed].filter(Boolean),
        candidatesEvaluated: input.recommendations.length
      }
    };

    return { output };
  }

  /**
   * Generate provenance certificate
   */
  private async generateProvenance(
    recommendation: any,
    sessionId: string
  ): Promise<any> {
    // Query ReasoningBank for evidence trajectories
    const evidence = await agentdb.reasoningBank.queryEvidence({
      contentId: recommendation.contentId,
      context: {
        // Similar context to current session
      },
      minConfidence: 0.80
    });

    // Calculate statistics
    const evidenceTrajectories = evidence.length;
    const completionRates = evidence.map(e => e.outcome.completionRate);
    const avgCompletion = completionRates.reduce((a, b) => a + b, 0) / completionRates.length;

    return {
      evidenceTrajectories,
      confidenceInterval: this.computeConfidenceInterval(completionRates),
      similarUsersCompleted: `${Math.round(avgCompletion * 100)}% of similar users completed this`,
      skillUsed: recommendation.skillUsed,
      reasoning: `Based on ${evidenceTrajectories} similar successful recommendations`
    };
  }

  /**
   * Generate natural language explanation
   */
  private async generateExplanation(
    recommendation: any,
    emotionalState: UniversalEmotionalState,
    content: any
  ): Promise<any> {
    // Use Claude to generate explanation
    const prompt = `
      Generate a brief explanation for why we're recommending "${content.title}" to a user who:
      - Wants to ${emotionalState.energy > 0.5 ? 'engage' : 'unwind'}
      - Primary need: ${this.getTopNeed(emotionalState.needs)}
      - Context: ${emotionalState.context.time.timeOfDay}

      Recommendation details:
      - Match score: ${(recommendation.finalScore * 100).toFixed(0)}%
      - Genres: ${content.genres.join(', ')}
      - Overview: ${content.overview}

      Keep it under 40 words, friendly and conversational.
    `;

    const explanation = await this.callLLM(prompt);

    return {
      summary: explanation,
      why: `Matches your ${emotionalState.energy > 0.5 ? 'energetic' : 'relaxed'} mood`,
      confidenceLevel: recommendation.finalScore > 0.85 ? 'high' :
                       recommendation.finalScore > 0.70 ? 'medium' : 'low'
    };
  }
}
```

**Inputs**:
- Ranked recommendations
- Emotional state
- Provenance flag
- Explanation flag

**Outputs**:
- `GetRecommendationOutput` (fully formatted)

**Responsibilities**:
1. Load full content metadata
2. Generate provenance certificates
3. Generate natural language explanations (via LLM)
4. Format complete response
5. Add metadata (timing, agents, skills)

**Performance Target**: < 300ms

---

## 5. Integration Points

### 5.1 AgentDB v2.0 Integration

**Components Used**:

```typescript
/**
 * AgentDB v2.0 Integration
 */

// 1. Vector Store (HNSW)
import { AgentDB } from '@agentdb/core';

const vectorStore = new AgentDB({
  indexType: 'hnsw',
  dimensions: 384,
  metric: 'cosine',
  quantization: '8bit',  // 4-32x memory reduction
  efConstruction: 200,
  M: 16
});

// Insert content vectors
await vectorStore.insert({
  id: contentId,
  vector: contentVector,  // 384D UniversalContentVector
  metadata: {
    domain: 'movie',
    genres: ['comedy', 'drama'],
    year: 2017
  }
});

// Search (150x faster than brute force)
const results = await vectorStore.search({
  query: queryVector,
  limit: 100,
  filters: {
    domain: 'movie',
    year: { $gte: 2010 }
  }
});

// 2. ReasoningBank (Pattern Learning)
const reasoningBank = agentdb.reasoningBank;

// Store trajectory after each recommendation
await reasoningBank.storeTrajectory({
  id: trajectoryId,
  session: { sessionId, userId, timestamp },
  initialState: { emotionalState, userVector, context },
  actions: [...],  // Multi-step actions
  recommendation: { contentId, matchScore, ... },
  outcome: { completionRate, satisfaction, ... },
  verdict: {
    success: true,
    confidenceScore: 0.92,
    reasoning: "High completion rate",
    strengths: ["Good mood match", "Appropriate runtime"],
    weaknesses: [],
    improvements: []
  },
  learningSignals: {
    useForTraining: true,
    isOutlier: false
  }
});

// Query learned patterns (32.6M ops/sec)
const patterns = await reasoningBank.queryPatterns({
  context: {
    mood: 'unwind',
    dayOfWeek: 'friday',
    timeOfDay: 'evening'
  },
  minConfidence: 0.85,
  limit: 10
});

// 3. Reflexion Memory (Episode Storage)
const reflexion = agentdb.reflexion;

// Store episode with self-critique
await reflexion.storeEpisode({
  id: episodeId,
  trajectoryId,
  critique: {
    task: "Recommend content for Friday evening unwind",
    approach: "Applied 'Comedy Boost' skill",
    outcome: "User watched 85%",
    analysis: "Skill worked well for this context",
    reflection: "Continue using this pattern for similar contexts",
    confidence: 0.88
  },
  provenance: {
    timestamp,
    agentType: 'match',
    evidenceCount: 47,
    similarEpisodes: [...]
  }
});

// Query for avoidance patterns
const failures = await reflexion.queryEpisodes({
  context: { mood: 'unwind' },
  verdict: { success: false },
  limit: 20
});

const avoidPatterns = failures.flatMap(ep =>
  ep.critique.reflection.includes('avoid') ? [ep.critique.reflection] : []
);

// 4. Causal Recall (Utility-Based Search)
const causalRecall = agentdb.causalRecall;

// Search with utility function
const utilityResults = await causalRecall.search({
  query: queryVector,

  utilityFunction: (candidate) => {
    const alpha = 0.4;   // Similarity weight
    const beta = 0.5;    // Causal uplift weight
    const gamma = 0.1;   // Latency penalty

    return (
      alpha * candidate.vectorSimilarity +
      beta * candidate.causalUplift -
      gamma * (candidate.retrievalLatency / 1000)
    );
  },

  limit: 100,
  includeProvenance: true
});

// 5. Skill Library (Auto-Consolidated Strategies)
const skillLibrary = agentdb.skills;

// Query applicable skills
const skills = await skillLibrary.query({
  context: {
    mood: 'unwind',
    dayOfWeek: 'friday',
    timeOfDay: 'evening'
  },
  minConfidence: 0.80,
  limit: 5
});

// Apply skill to candidate
for (const skill of skills) {
  const boost = skill.apply(candidate, emotionalState);
  // Use boost in scoring
}

// 6. GNN Attention (8-Head Graph Neural Network)
const gnn = agentdb.gnn;

// Query with graph-aware expansion (+12.4% recall)
const gnnResults = await gnn.search({
  query: queryVector,
  userId,  // Use user's graph position
  numHeads: 8,
  attentionMechanism: 'multi-head',
  limit: 100
});

// 7. Nightly Learner (Background Pattern Discovery)
const nightlyLearner = agentdb.nightlyLearner;

// Schedule nightly learning (runs at 2 AM)
nightlyLearner.schedule({
  tasks: [
    'discover_new_patterns',
    'validate_existing_skills',
    'prune_low_confidence',
    'optimize_formula_weights',
    'detect_seasonal_trends'
  ],
  cron: '0 2 * * *'  // 2 AM daily
});

// Get learning results
const learningResults = await nightlyLearner.getResults();

// 8. Self-Healing (97.9% Success Rate)
const selfHealing = agentdb.selfHealing;

// Monitor health
const healthMetrics = await selfHealing.checkHealth();

if (healthMetrics.avgMatchSatisfaction < 0.85) {
  // Diagnose and heal
  const diagnosis = await selfHealing.diagnose();
  const healingAction = await selfHealing.heal({
    diagnosis,
    validationPeriod: '30 days',
    autoRollback: true
  });
}
```

**Performance Benefits**:
- **HNSW**: 150x faster than brute force search
- **ReasoningBank**: 32.6M ops/sec pattern learning
- **Causal Recall**: Utility-optimized search (not just similarity)
- **GNN**: +12.4% recall improvement
- **Self-Healing**: 97.9% success rate
- **Quantization**: 4-32x memory reduction

---

### 5.2 External API Integration

#### 5.2.1 TV5MONDE API

```typescript
/**
 * TV5MONDE API Integration
 */
interface TV5MondeAPI {
  /**
   * Get catalog
   */
  async getCatalog(params: {
    region?: string;
    limit?: number;
    offset?: number;
  }): Promise<TV5Content[]>;

  /**
   * Get content details
   */
  async getContentDetails(id: string): Promise<TV5Content>;

  /**
   * Get streaming link
   */
  async getStreamingLink(id: string): Promise<string>;
}

interface TV5Content {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  runtime: number;
  language: string;
  genres: string[];
  overview: string;
  posterUrl?: string;
  availability: {
    regions: string[];
    expiresAt?: string;
  };
  streamingUrl: string;
}

// Usage
const tv5api = new TV5MondeAPI({
  apiKey: process.env.TV5MONDE_API_KEY,
  baseUrl: 'https://api.tv5monde.com/v1'
});

const catalog = await tv5api.getCatalog({ region: 'FR', limit: 1000 });
```

#### 5.2.2 TMDB API

```typescript
/**
 * TMDB API Integration
 */
interface TMDBAPI {
  /**
   * Get trending content
   */
  async getTrending(params: {
    mediaType: 'all' | 'movie' | 'tv';
    timeWindow: 'day' | 'week';
  }): Promise<TMDBContent[]>;

  /**
   * Get content details
   */
  async getDetails(id: number, mediaType: 'movie' | 'tv'): Promise<TMDBContent>;

  /**
   * Search content
   */
  async search(query: string): Promise<TMDBContent[]>;
}

interface TMDBContent {
  id: number;
  title: string;
  overview: string;
  releaseDate: string;
  genres: Array<{ id: number; name: string }>;
  posterPath: string;
  backdropPath: string;
  popularity: number;
  voteAverage: number;
  voteCount: number;
}

// Usage
const tmdb = new TMDBAPI({
  apiKey: process.env.TMDB_API_KEY
});

const trending = await tmdb.getTrending({
  mediaType: 'movie',
  timeWindow: 'week'
});
```

#### 5.2.3 FlixPatrol API

```typescript
/**
 * FlixPatrol API Integration
 */
interface FlixPatrolAPI {
  /**
   * Get trending by platform
   */
  async getTrending(params: {
    platform: string;
    region: string;
  }): Promise<FlixPatrolContent[]>;

  /**
   * Get rankings
   */
  async getRankings(params: {
    region: string;
    date: string;
  }): Promise<FlixPatrolRanking[]>;
}

interface FlixPatrolContent {
  tmdbId: number;
  title: string;
  rank: number;
  points: number;
}

interface FlixPatrolRanking {
  platform: string;
  region: string;
  content: FlixPatrolContent[];
}

// Usage
const flixpatrol = new FlixPatrolAPI({
  apiKey: process.env.FLIXPATROL_API_KEY
});

const trending = await flixpatrol.getTrending({
  platform: 'streaming',
  region: 'FR'
});
```

---

### 5.3 MCP Server Requirements

```typescript
/**
 * MCP Server Implementation
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

// Create MCP server
const server = new Server({
  name: 'universal-content-discovery',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {
      get_recommendation: {},
      refine_search: {},
      get_trending: {},
      user_feedback: {}
    }
  }
});

// Register tool handlers
server.tool('get_recommendation', async (input: GetRecommendationInput) => {
  const orchestrator = new OrchestratorAgent();
  const result = await orchestrator.processRequest(input);
  return result;
});

server.tool('refine_search', async (input: RefineSearchInput) => {
  const orchestrator = new OrchestratorAgent();
  const result = await orchestrator.processRefinement(input);
  return result;
});

server.tool('get_trending', async (input: GetTrendingInput) => {
  const trendAgent = new TrendAgent();
  const result = await trendAgent.process(input);
  return result;
});

server.tool('user_feedback', async (input: UserFeedbackInput) => {
  await storeFeedback(input);
  return { success: true, message: 'Feedback recorded' };
});

// Start server with STDIO transport
async function startStdio() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP server running on stdio');
}

// Start server with SSE transport
async function startSSE(port: number = 3000) {
  const transport = new SSEServerTransport('/sse', server);
  const app = express();
  app.use('/sse', transport.handler);
  app.listen(port);
  console.error(`MCP server running on SSE: http://localhost:${port}/sse`);
}

// Environment-based startup
if (process.env.TRANSPORT === 'sse') {
  startSSE(parseInt(process.env.PORT || '3000'));
} else {
  startStdio();
}
```

---

## 6. Performance Requirements

### 6.1 Latency Targets

| Component | Target Latency | Max Acceptable | Measurement |
|-----------|---------------|----------------|-------------|
| **Intent Agent** | < 300ms | 500ms | Input → Emotional state extraction |
| **Catalog Agent** | < 500ms | 800ms | Vector search + candidate retrieval |
| **Trend Agent** | < 200ms | 400ms | Trending data fetch (cached) |
| **Match Agent** | < 400ms | 600ms | Scoring + ranking all candidates |
| **Present Agent** | < 300ms | 500ms | Formatting + provenance generation |
| **End-to-End** | < 2000ms | 3000ms | Full recommendation pipeline |
| **Refinement** | < 1500ms | 2500ms | Refine previous recommendation |

### 6.2 Throughput Requirements

| Metric | MVP (Month 1) | 3 Months | 6 Months | 12 Months |
|--------|--------------|----------|----------|-----------|
| **Concurrent users** | 100 | 500 | 2,000 | 10,000 |
| **Requests/sec** | 10 | 50 | 200 | 1,000 |
| **Daily recommendations** | 1,000 | 10,000 | 50,000 | 500,000 |
| **Vector searches/sec** | 20 | 100 | 400 | 2,000 |

### 6.3 Scaling Considerations

```yaml
# Horizontal Scaling Plan

Phase 1 (MVP):
  architecture: Monolithic
  deployment: Single server
  database: SQLite + AgentDB local
  capacity: 100 concurrent users

Phase 2 (3 months):
  architecture: Microservices (agent per service)
  deployment: 3 servers (load balanced)
  database: PostgreSQL + AgentDB cluster
  cache: Redis (trending, user profiles)
  capacity: 500 concurrent users

Phase 3 (6 months):
  architecture: Fully distributed agents
  deployment: Auto-scaling (3-10 servers)
  database: PostgreSQL (read replicas) + AgentDB distributed
  cache: Redis Cluster
  cdn: CloudFront (static assets)
  capacity: 2,000 concurrent users

Phase 4 (12 months):
  architecture: Global multi-region
  deployment: Auto-scaling (10-50 servers)
  database: PostgreSQL (multi-region) + AgentDB geo-distributed
  cache: Redis Cluster (multi-region)
  cdn: CloudFront (global)
  message_queue: Kafka (async learning)
  capacity: 10,000+ concurrent users
```

### 6.4 Resource Requirements

```yaml
# Per-Server Requirements (Phase 1)

Compute:
  cpu: 4 vCPUs
  memory: 16 GB RAM
  storage: 100 GB SSD

Network:
  bandwidth: 1 Gbps

Estimated Costs:
  server: $100/month (AWS c6i.xlarge)
  storage: $10/month (100 GB SSD)
  bandwidth: $50/month
  apis: $100/month (TMDB, FlixPatrol)
  total: ~$260/month for MVP
```

### 6.5 Performance Monitoring

```typescript
/**
 * Performance Metrics to Track
 */
interface PerformanceMetrics {
  // Latency metrics
  latency: {
    p50: number;     // Median
    p90: number;     // 90th percentile
    p95: number;     // 95th percentile
    p99: number;     // 99th percentile
    max: number;     // Maximum
  };

  // Throughput metrics
  throughput: {
    requestsPerSecond: number;
    recommendationsPerDay: number;
    vectorSearchesPerSecond: number;
  };

  // Agent-specific metrics
  agents: {
    [agentType: string]: {
      avgLatency: number;
      p95Latency: number;
      errorRate: number;
      invocationCount: number;
    };
  };

  // Database metrics
  database: {
    vectorSearchLatency: number;
    queryLatency: number;
    connectionPoolUtilization: number;
  };

  // Cache metrics
  cache: {
    hitRate: number;
    missRate: number;
    evictionRate: number;
  };

  // External API metrics
  externalApis: {
    [apiName: string]: {
      avgLatency: number;
      errorRate: number;
      rateLimitStatus: number;
    };
  };
}

// Monitoring setup with Prometheus
import prometheus from 'prom-client';

const requestDuration = new prometheus.Histogram({
  name: 'recommendation_request_duration_seconds',
  help: 'Duration of recommendation requests',
  labelNames: ['agent', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 2, 3, 5]
});

const recommendationCounter = new prometheus.Counter({
  name: 'recommendations_total',
  help: 'Total number of recommendations',
  labelNames: ['status', 'skill_used']
});
```

---

## 7. Security & Privacy

### 7.1 Data Handling Requirements

```yaml
# GDPR Compliance

Data Minimization:
  - Collect only essential data for recommendations
  - Anonymize user IDs (SHA-256 hash)
  - No PII (personally identifiable information) stored
  - Aggregate analytics only

User Rights:
  - Right to access: API endpoint to retrieve user data
  - Right to erasure: Delete all user data on request
  - Right to portability: Export user data in JSON format
  - Right to rectification: Update user preferences

Data Retention:
  - User profiles: Retained while account active
  - Interaction history: 24 months, then anonymized
  - Trajectories (learning): Anonymized, retained indefinitely
  - Logs: 90 days, then deleted

Encryption:
  - At rest: AES-256 encryption for sensitive data
  - In transit: TLS 1.3 for all API communication
  - Backups: Encrypted with separate keys
```

### 7.2 User Privacy Considerations

```typescript
/**
 * Privacy-Preserving Features
 */

// 1. Anonymization
function anonymizeUserId(rawUserId: string): string {
  return crypto
    .createHash('sha256')
    .update(rawUserId + process.env.SALT)
    .digest('hex');
}

// 2. Differential Privacy (for aggregate statistics)
function addNoise(value: number, epsilon: number = 1.0): number {
  const scale = 1 / epsilon;
  const noise = laplacianNoise(0, scale);
  return value + noise;
}

// 3. Data Deletion
async function deleteUserData(userId: string) {
  const anonymizedId = anonymizeUserId(userId);

  // Delete from all stores
  await Promise.all([
    db.users.delete(anonymizedId),
    db.interactions.deleteWhere({ userId: anonymizedId }),
    agentdb.vector.deleteUser(anonymizedId),
    // Trajectories: Keep anonymized for learning, but remove user link
    agentdb.reasoningBank.unlinkUser(anonymizedId)
  ]);
}

// 4. Minimal Context Storage
interface MinimalContext {
  // Store only what's needed, not raw inputs
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  isWeekend: boolean;
  device: 'mobile' | 'desktop';
  // NO: exact location, IP address, device ID, etc.
}
```

### 7.3 Authentication Approach

```yaml
# Authentication (Phase 2+)

MVP (Phase 1):
  - No authentication required
  - Anonymous usage
  - User ID: optional client-provided hash

Production (Phase 2+):
  type: OAuth 2.0
  providers:
    - TV5MONDE SSO (primary)
    - Google OAuth
    - GitHub OAuth (dev/testing)

  token_management:
    - Access tokens: JWT, 1 hour expiry
    - Refresh tokens: 30 days expiry
    - Rotation: Automatic on refresh

  authorization:
    - Roles: user, admin, analyst
    - Permissions: RBAC (role-based access control)

  rate_limiting:
    - Anonymous: 10 req/min, 100 req/hour
    - Authenticated: 60 req/min, 1000 req/hour
    - Premium: 120 req/min, 10000 req/hour
```

### 7.4 Security Best Practices

```typescript
/**
 * Security Measures
 */

// 1. Input Validation
import Joi from 'joi';

const recommendationInputSchema = Joi.object({
  mood: Joi.string().valid('unwind', 'engage').required(),
  goal: Joi.string().valid('laugh', 'feel', 'thrill', 'think').required(),
  constraints: Joi.object({
    maxRuntime: Joi.number().min(30).max(300),
    minYear: Joi.number().min(1900).max(new Date().getFullYear()),
    // ...
  }).optional(),
  // ...
});

function validateInput(input: any): GetRecommendationInput {
  const { error, value } = recommendationInputSchema.validate(input);
  if (error) throw new Error(`Invalid input: ${error.message}`);
  return value;
}

// 2. SQL Injection Prevention
// Use parameterized queries ALWAYS
const query = db.prepare('SELECT * FROM content WHERE id = ?');
const content = query.get(contentId);  // SAFE

// 3. API Key Management
import { SecretsManager } from 'aws-sdk';

async function getApiKey(keyName: string): Promise<string> {
  const secretsManager = new SecretsManager();
  const secret = await secretsManager.getSecretValue({
    SecretId: keyName
  }).promise();
  return JSON.parse(secret.SecretString || '{}').apiKey;
}

// 4. Rate Limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 60,              // 60 requests per minute
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);

// 5. CORS Configuration
import cors from 'cors';

app.use(cors({
  origin: [
    'https://tv5monde.com',
    'https://app.tv5monde.com',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''
  ].filter(Boolean),
  credentials: true
}));

// 6. Security Headers
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'https://image.tmdb.org', 'https://tv5monde.com']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));
```

---

## 8. Implementation Plan

### 8.1 Phase 1: MVP Foundation (Weeks 1-4)

```yaml
Week 1: Core Infrastructure
  tasks:
    - Set up project structure (monorepo)
    - Configure TypeScript, ESLint, Prettier
    - Set up AgentDB v2.0 integration
    - Create SQLite schema
    - Implement MCP server skeleton (STDIO transport)
    - Set up CI/CD (GitHub Actions)

  deliverables:
    - Repository initialized
    - AgentDB integrated and tested
    - MCP server responds to ping

  success_criteria:
    - All tests pass
    - MCP server starts successfully
    - AgentDB vector insert/search works

Week 2: Data Pipeline & Agents
  tasks:
    - Implement TV5MONDE API integration
    - Implement TMDB API integration
    - Create content vectorization pipeline
    - Build Intent Agent
    - Build Catalog Agent
    - Implement UniversalEmotionalState mapping

  deliverables:
    - 100+ content items vectorized
    - Intent Agent extracts emotional state
    - Catalog Agent returns candidates

  success_criteria:
    - Vector search returns relevant results
    - Emotional state mapping validated manually
    - Latency < 500ms for catalog search

Week 3: Matching & Presentation
  tasks:
    - Build Trend Agent (TMDB trending)
    - Build Match Agent with static formula
    - Build Present Agent
    - Build Orchestrator Agent
    - Implement end-to-end pipeline
    - Add basic error handling

  deliverables:
    - Complete recommendation pipeline
    - get_recommendation tool working
    - Basic provenance (no learning yet)

  success_criteria:
    - End-to-end latency < 3 seconds
    - Recommendations make sense manually
    - No crashes on valid input

Week 4: Learning Foundation & Testing
  tasks:
    - Integrate ReasoningBank trajectory storage
    - Integrate Reflexion Memory
    - Implement user feedback recording
    - Add ARW manifest
    - Write integration tests
    - Performance optimization pass
    - Documentation

  deliverables:
    - Trajectories stored in ReasoningBank
    - user_feedback tool working
    - ARW manifest published
    - Test coverage > 70%

  success_criteria:
    - All MCP tools functional
    - End-to-end latency < 2 seconds
    - Learning data accumulating
    - Ready for demo
```

### 8.2 Phase 2: AgentDB Learning Integration (Weeks 5-7)

```yaml
Week 5: Causal Recall & GNN
  tasks:
    - Replace HNSW with Causal Recall search
    - Integrate GNN 8-head attention
    - Implement utility-based scoring
    - Measure causal uplift from A/B tests

  deliverables:
    - Causal Recall active
    - GNN improving recall by >10%
    - Utility scores in recommendations

  success_criteria:
    - Recommendation quality improves measurably
    - Latency still < 2 seconds
    - Causal confidence > 0.80

Week 6: Skill Library & Dynamic Weights
  tasks:
    - Replace static formula with learned weights
    - Integrate Skill Library queries
    - Implement skill application in Match Agent
    - Build skill discovery pipeline

  deliverables:
    - Dynamic weights learned from data
    - Skills applied to boost recommendations
    - Provenance shows skills used

  success_criteria:
    - First skills auto-discovered (after 1000+ trajectories)
    - Match satisfaction > 85%
    - Skill confidence > 0.80

Week 7: Nightly Learner & Self-Healing
  tasks:
    - Implement Nightly Learner pipeline
    - Set up background jobs (cron)
    - Integrate Self-Healing monitoring
    - Implement 30-day validation loop
    - Build admin dashboard for monitoring

  deliverables:
    - Nightly Learner running daily
    - Self-Healing auto-detects issues
    - Admin dashboard shows learning metrics

  success_criteria:
    - Patterns discovered automatically
    - Self-Healing success rate > 95%
    - System improves without human intervention
```

### 8.3 Phase 3: Testing & Optimization (Weeks 8-10)

```yaml
Week 8: Performance Optimization
  tasks:
    - Profile end-to-end pipeline
    - Optimize vector search (HNSW tuning)
    - Add caching (Redis)
    - Optimize database queries
    - Implement connection pooling

  deliverables:
    - Latency reduced by 30%+
    - Cache hit rate > 60%
    - Database queries optimized

  success_criteria:
    - End-to-end latency < 1.5 seconds (stretch)
    - Throughput > 50 req/sec
    - Resource usage optimized

Week 9: Comprehensive Testing
  tasks:
    - Write unit tests (>80% coverage)
    - Write integration tests
    - Load testing (1000+ concurrent users)
    - Security audit (OWASP Top 10)
    - A/B testing framework

  deliverables:
    - Test coverage > 80%
    - Load test results documented
    - Security vulnerabilities addressed
    - A/B testing ready

  success_criteria:
    - All tests pass
    - System stable under load
    - No critical security issues

Week 10: Documentation & Launch Prep
  tasks:
    - Write API documentation
    - Write developer guide
    - Create demo video
    - Set up monitoring (Prometheus + Grafana)
    - Prepare launch checklist
    - Final bug fixes

  deliverables:
    - Complete documentation
    - Monitoring dashboards
    - Demo-ready system

  success_criteria:
    - Documentation complete
    - All critical bugs fixed
    - Ready for launch
```

### 8.4 Success Metrics (MVP)

```yaml
# Metrics to Track Post-Launch

User Experience:
  - Time to recommendation: < 60 seconds ✅
  - Match satisfaction (CTR): > 85% ✅
  - First-try success: > 80% ✅
  - Refinement rate: < 20% ✅
  - Weekly return rate: > 60% ✅

Technical:
  - End-to-end latency (p95): < 2 seconds ✅
  - Throughput: > 50 req/sec ✅
  - Uptime: > 99.5% ✅
  - Error rate: < 1% ✅

Learning:
  - Trajectories collected: 1000+ in first month ✅
  - Patterns discovered: 10+ in first month ✅
  - Causal confidence: > 0.80 average ✅
  - Self-healing success: > 95% ✅

Business:
  - Daily active users: 100+ ✅
  - Recommendations per day: 1000+ ✅
  - User satisfaction score: > 4/5 ✅
```

---

## Appendices

### A. Technology Versions

```json
{
  "dependencies": {
    "typescript": "^5.3.0",
    "node": "^18.18.0",
    "@modelcontextprotocol/sdk": "^0.5.0",
    "@agentdb/core": "^2.0.0",
    "better-sqlite3": "^9.2.0",
    "express": "^4.18.2",
    "zod": "^3.22.4",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0",
    "prom-client": "^15.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "jest": "^29.7.0",
    "tsx": "^4.7.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  }
}
```

### B. File Structure

```
/home/evafive/agentic-pancakes/
├── apps/
│   ├── agentdb/                    # AgentDB v2.0 (existing)
│   ├── agentic-flow/               # Agent orchestration (existing)
│   ├── cli/                        # MCP server (existing)
│   └── content-discovery/          # NEW: This project
│       ├── src/
│       │   ├── agents/
│       │   │   ├── orchestrator.ts
│       │   │   ├── intent.ts
│       │   │   ├── catalog.ts
│       │   │   ├── trend.ts
│       │   │   ├── match.ts
│       │   │   └── present.ts
│       │   ├── data/
│       │   │   ├── models.ts          # TypeScript interfaces
│       │   │   ├── schema.sql         # SQLite schema
│       │   │   └── agentdb-config.ts  # AgentDB configuration
│       │   ├── integrations/
│       │   │   ├── tv5monde.ts
│       │   │   ├── tmdb.ts
│       │   │   └── flixpatrol.ts
│       │   ├── mcp/
│       │   │   ├── server.ts          # MCP server
│       │   │   ├── tools.ts           # Tool handlers
│       │   │   └── manifest.json      # ARW manifest
│       │   ├── learning/
│       │   │   ├── reasoning-bank.ts
│       │   │   ├── reflexion.ts
│       │   │   ├── causal-recall.ts
│       │   │   ├── skills.ts
│       │   │   └── nightly-learner.ts
│       │   ├── utils/
│       │   │   ├── vectorization.ts
│       │   │   ├── logging.ts
│       │   │   └── metrics.ts
│       │   └── index.ts               # Entry point
│       ├── tests/
│       │   ├── unit/
│       │   ├── integration/
│       │   └── performance/
│       ├── scripts/
│       │   ├── vectorize-catalog.ts   # Initial vectorization
│       │   └── migrate-db.ts          # Database migrations
│       ├── package.json
│       ├── tsconfig.json
│       ├── .env.example
│       └── README.md
├── docs/
│   ├── specs/
│   │   ├── PRD_v2.md                  # Product Requirements (existing)
│   │   └── SPECIFICATION.md           # This document
│   └── research/
└── .well-known/
    └── arw-manifest.json              # ARW manifest (public)
```

### C. Environment Variables

```bash
# .env.example

# Node Environment
NODE_ENV=development

# MCP Server
TRANSPORT=stdio  # or 'sse'
PORT=3000

# AgentDB
AGENTDB_PATH=./data/agentdb
AGENTDB_INDEX_TYPE=hnsw
AGENTDB_DIMENSIONS=384
AGENTDB_QUANTIZATION=8bit

# Database
DATABASE_PATH=./data/content-discovery.db

# External APIs
TV5MONDE_API_KEY=your_tv5monde_key
TMDB_API_KEY=your_tmdb_key
FLIXPATROL_API_KEY=your_flixpatrol_key

# Security
SALT=your_random_salt_for_user_hashing

# Caching
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# Learning
NIGHTLY_LEARNER_CRON=0 2 * * *  # 2 AM daily
MIN_TRAJECTORIES_FOR_LEARNING=100

# Monitoring
PROMETHEUS_PORT=9090
LOG_LEVEL=info

# Feature Flags
ENABLE_CAUSAL_RECALL=true
ENABLE_GNN=true
ENABLE_SELF_HEALING=true
ENABLE_NIGHTLY_LEARNER=true
```

### D. API Rate Limits

```yaml
# External API Rate Limits (to respect)

TMDB:
  requests_per_second: 40
  daily_limit: 1000000

FlixPatrol:
  requests_per_minute: 60
  daily_limit: 10000

TV5MONDE:
  requests_per_second: 10
  daily_limit: 100000

# Our API Rate Limits (to enforce)

Anonymous:
  requests_per_minute: 10
  requests_per_hour: 100

Authenticated:
  requests_per_minute: 60
  requests_per_hour: 1000

Premium:
  requests_per_minute: 120
  requests_per_hour: 10000
```

---

## Document Status

**Status**: ✅ Implementation-Ready
**Next Steps**:
1. Review and approve this specification
2. Set up project repository structure
3. Begin Week 1 implementation
4. Daily standups to track progress

**Contact**:
- Technical Lead: [Your Name]
- Product Owner: [Product Owner Name]
- Stakeholders: TV5MONDE team, Agentic Pancakes team

---

**END OF TECHNICAL SPECIFICATION DOCUMENT**

*This specification provides a complete, implementation-ready blueprint for building the Universal Content Discovery Platform MVP with AgentDB v2.0 learning capabilities.*
