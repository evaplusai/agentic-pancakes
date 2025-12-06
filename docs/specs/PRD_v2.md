# Product Requirements Document (PRD) v2.0
## Universal Content Discovery Platform - "What to Watch in 60 Seconds"

**Version**: 2.0
**Date**: 2025-12-06
**Author**: Agentic Pancakes Team
**Hackathon**: TV5 Agentics Hackathon
**Status**: Unified Vision (MVP + AgentDB + Future-Proof Architecture)

---

## 1. Executive Summary

### 1.1 Problem Statement

> **"Millions spend up to 45 minutes deciding what to watch — billions of hours lost every day."**

Users face decision paralysis when choosing content across streaming platforms. The current browse-scroll-abandon cycle wastes time and leads to frustration, often resulting in rewatching familiar content rather than discovering new favorites.

### 1.2 Solution Evolution

**Phase 1 (MVP)**: "What to Watch in 60 Seconds" — An emotion-first content discovery system for TV5MONDE
**Phase 2 (Enhanced)**: Self-learning platform using AgentDB v2.0 capabilities
**Phase 3 (Universal)**: Cross-domain platform extending to music, podcasts, books, and beyond

### 1.3 Key Innovation: Emotion-First Paradigm

| Old Way | Our Way |
|---------|---------|
| "What genre?" | "How do you feel?" |
| Browse → Scroll → Read → Give up | 2 quick taps → AI analyzes → Perfect match |
| 45 minutes wasted | 60 seconds total |
| Static recommendations | Self-learning system that improves with every interaction |
| Single-domain | Universal cross-domain content discovery |

### 1.4 Value Proposition Matrix

| Stakeholder | Immediate Value (MVP) | Medium-Term (Learning) | Long-Term (Universal) |
|-------------|----------------------|------------------------|----------------------|
| **Users** | 60-second recommendations | System gets smarter | One platform for all content |
| **TV5MONDE** | Higher engagement | Lower churn | Platform for any content |
| **Engineering** | Clear architecture | Self-healing reduces ops | Extensible to new domains |

---

## 2. Product Vision

### 2.1 Vision Statement

*"Transform content discovery from a chore into a conversation — building a self-learning, universal platform that understands human emotions and serves any content type, from French cinema today to neural experiences in 2035."*

### 2.2 Core Architecture Principle

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  VARIABLE: How we capture emotional state                  │
│  (Touch → Voice → Gaze → Neural)                           │
│                                                             │
│                         ↓                                   │
│                                                             │
│  CONSTANT: Emotional state representation                  │
│  (Energy, valence, needs - psychology doesn't change)     │
│                                                             │
│                         ↓                                   │
│                                                             │
│  CONSTANT: Matching algorithm                              │
│  (Utility-based search in emotional space)                │
│                                                             │
│                         ↓                                   │
│                                                             │
│  VARIABLE: Content domains                                 │
│  (Movies → Music → Podcasts → Books → VR → ???)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Success Criteria (Tiered)

| Metric | MVP (Phase 1) | Learning (Phase 2) | Universal (Phase 3) |
|--------|--------------|--------------------|--------------------|
| **Time to recommendation** | < 60 seconds | < 45 seconds | < 30 seconds |
| **Match satisfaction** | > 85% | > 92% | > 95% |
| **First-try success** | > 80% | > 90% | > 95% |
| **Weekly return rate** | > 60% | > 75% | > 85% |
| **Content domains** | 1 (TV5MONDE) | 1 + learning | 5+ domains |

---

## 3. User Personas

### 3.1 Primary Personas

| Persona | Profile | Key Need | Universal Potential |
|---------|---------|----------|---------------------|
| **Marie Dubois** | Cinema Enthusiast, 42, Lyon | Auteur cinema discovery | Cross-domain: Film scores, podcasts about cinema |
| **James Mitchell** | French Learner, 28, Seattle | Language learning + entertainment | Cross-domain: French music, podcasts |
| **Sophie Renard** | Expat, 56, Toronto | Cultural comfort, connection | Cross-domain: French news, podcasts from home region |
| **Alexandre Fontaine** | Busy Professional, 34, Brussels | Fast, mood-accurate picks | Cross-domain: Quick podcasts, short-form |
| **Yuki Tanaka** | Francophile Explorer, 31, Tokyo | Pan-Francophone discovery | Cross-domain: World cinema, global music |
| **Pierre Lefebvre** | Family Viewer, 39, Montreal | Multi-generational content | Cross-domain: Family games, educational content |

### 3.2 User Journey (Enhanced with Learning)

```
┌─────────────────────────────────────────────────────────────────┐
│  1. OPEN APP                                                     │
│     "Hey! What are you in the mood for tonight?"                │
│     [System queries ReasoningBank for similar successful        │
│      contexts from past sessions]                               │
│                                                                  │
│  2. BINARY CHOICE 1 (5 sec)                                     │
│     [🌙 Unwind]  vs  [⚡ Engage]                                 │
│     User taps: Unwind                                           │
│     [System triggers "Friday Evening Unwind" skill if learned] │
│                                                                  │
│  3. BINARY CHOICE 2 (5 sec)                                     │
│     [😄 Laugh]  vs  [🎭 Feel]                                   │
│     User taps: Laugh                                            │
│     [Reflexion Memory: Avoid patterns that failed before]      │
│                                                                  │
│  4. AI PROCESSING (3 sec)                                       │
│     "Analyzing 2,847 titles for your perfect match..."          │
│     ✓ Utility-based search (not just similarity)               │
│     ✓ Causal uplift: p(completion|do(recommend))               │
│     ✓ GNN: What similar users loved                            │
│                                                                  │
│  5. RECOMMENDATION                                               │
│     🏆 "Le Sens de la Fête" - 94% match                         │
│     "Users like you completed this 87% of the time"            │
│     [Provenance: 47 similar trajectories]                      │
│     [▶ WATCH NOW ON TV5MONDE]                                   │
│                                                                  │
│  6. OUTCOME TRACKING                                             │
│     User watches 85% → Success trajectory stored               │
│     Pattern learned: "Friday unwind + laugh = French comedy"   │
│                                                                  │
│  7. CROSS-DOMAIN SUGGESTION (Future)                            │
│     "Liked that? Try this French comedy podcast..."             │
│     [Transfer learning from movie preferences]                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Feature Requirements

### 4.1 Phase 1: MVP Features (Hackathon)

#### MUST HAVE

| ID | Feature | Description | AgentDB Enhancement |
|----|---------|-------------|---------------------|
| M1 | **Binary Choice Quiz** | 2-round mood capture (Unwind/Engage → Laugh/Feel/Thrill/Think) | Maps to UniversalEmotionalState |
| M2 | **Intent Agent** | Extract emotional state from quiz + voice/text | + Reflexion Memory (avoid past failures) |
| M3 | **Catalog Search** | Vector search via AgentDB | + Causal Recall (utility-based) |
| M4 | **Match Engine** | Score and rank content | + Dynamic weights (learned, not static) |
| M5 | **Recommendation Card** | Top pick with match %, description, deeplink | + Provenance certificate |
| M6 | **MCP Server** | STDIO/SSE transport for hackathon | + Trajectory logging |
| M7 | **ARW Manifest** | `.well-known/arw-manifest.json` | Standard compliance |

#### SHOULD HAVE

| ID | Feature | Description | AgentDB Enhancement |
|----|---------|-------------|---------------------|
| S1 | **Trend Integration** | FlixPatrol/TMDB trending boost | + Causal validation (does trending actually help?) |
| S2 | **Chat Refinement** | Natural language refinement | + Learn from refinements (self-critique) |
| S3 | **User Profile** | 64D style vector | + Graph-embedded in user graph for GNN |
| S4 | **Voice Input** | Mood detection from voice | Future: Multimodal input adapter |
| S5 | **3 Alternatives** | Show runner-up recommendations | + Diverse utility (fast/safe/adventurous) |

### 4.2 Phase 2: AgentDB v2.0 Learning Features

| ID | Feature | Description | Benefit |
|----|---------|-------------|---------|
| L1 | **ReasoningBank** | Pattern learning at 32.6M ops/sec | Formula weights adapt based on outcomes |
| L2 | **Reflexion Memory** | Episode storage with self-critique | Never repeat same mistakes |
| L3 | **Causal Memory Graph** | Track p(outcome\|do(action)) | Understand what CAUSES engagement |
| L4 | **Causal Recall** | Utility search: `U = α·sim + β·uplift - γ·latency` | Recommend what WORKS |
| L5 | **Skill Library** | Auto-consolidated strategies (694 ops/sec) | Reusable expertise |
| L6 | **Nightly Learner** | Background pattern discovery | Autonomous optimization |
| L7 | **Self-Healing** | MPC adaptation (97.9% success) | Auto-resolve degradation |
| L8 | **GNN Attention** | 8-head graph neural network | +12.4% recall improvement |

### 4.3 Phase 3: Universal Content Features

| ID | Feature | Description | Benefit |
|----|---------|-------------|---------|
| U1 | **Universal Content Vector (UCV)** | 384D domain-agnostic embedding | Any content type |
| U2 | **Domain Adapters** | Pluggable content vectorization | Easy domain addition |
| U3 | **Cross-Domain Transfer** | Learn preferences across domains | "Likes French movies → French podcasts" |
| U4 | **Shared Emotional Space** | Common emotional representation | Cross-domain similarity search |
| U5 | **Meta-Learning Cold Start** | 3-interaction personalization | Instant cross-domain recommendations |
| U6 | **Multimodal Input** | Gaze, gesture, neural adapters | Future interface evolution |
| U7 | **Causal Content Graph** | Cross-domain causal relationships | Why content works |

---

## 5. Technical Architecture

### 5.1 Layered Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     INPUT LAYER (Evolves)                        │
│              Touch/Voice/Text → Gaze/Gesture → Neural           │
│                                                                  │
│                    InputAdapter Interface                        │
│              extractEmotionalState() → UniversalEmotionalState  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 UNIVERSAL EMOTIONAL STATE (Constant)            │
│                                                                  │
│  interface UniversalEmotionalState {                            │
│    energy: number;        // 0-1: Low to high energy           │
│    valence: number;       // -1 to 1: Negative to positive     │
│    arousal: number;       // 0-1: Calm to excited              │
│    cognitiveCapacity: number;  // Mental bandwidth available   │
│    needs: {                                                      │
│      comfort, escape, stimulation, connection,                  │
│      growth, catharsis, joy, relaxation, meaning, beauty       │
│    };                                                            │
│    context: { time, device, social, location };                 │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AGENT SWARM LAYER                            │
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ INTENT  │ │ CATALOG │ │  TREND  │ │  MATCH  │ │ PRESENT │  │
│  │ AGENT   │ │ AGENT   │ │  AGENT  │ │  AGENT  │ │  AGENT  │  │
│  │         │ │         │ │         │ │         │ │         │  │
│  │+Reflexio│ │+Causal  │ │+Pattern │ │+Utility │ │+Provena │  │
│  │ Memory  │ │ Recall  │ │Learning │ │Optimiz  │ │  nce    │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AGENTDB v2.0 INTELLIGENCE LAYER               │
│                                                                  │
│  ┌──────────────┬──────────────┬──────────────┬─────────────┐ │
│  │ ReasoningBank│ Reflexion    │ Causal Graph │ Skill       │ │
│  │ (32.6M ops/s)│ Memory       │ (Intervent.) │ Library     │ │
│  │              │              │              │ (694 ops/s) │ │
│  │ Pattern      │ Episode      │ p(y|do(x))   │ Auto-       │ │
│  │ Learning     │ Self-Critique│ A/B Testing  │ consolidated│ │
│  └──────────────┴──────────────┴──────────────┴─────────────┘ │
│                                                                  │
│  ┌──────────────┬──────────────┬──────────────┐                │
│  │ Nightly      │ Self-Healing │ GNN Attention│                │
│  │ Learner      │ (97.9%)      │ (8-head)     │                │
│  │              │              │              │                │
│  │ Background   │ MPC Adapt.   │ +12.4%       │                │
│  │ Discovery    │ 30-day valid │ Recall       │                │
│  └──────────────┴──────────────┴──────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  UNIVERSAL CONTENT LAYER                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Universal Content Vector (384D)                │   │
│  │                                                           │   │
│  │  Emotional Signature (128D)  │  Engagement Pattern (128D)│   │
│  │  - Plutchik emotions         │  - Attention curve        │   │
│  │  - VAD model                 │  - Pacing/rhythm          │   │
│  │  - Emotional arc             │  - Session characteristics│   │
│  │                              │                           │   │
│  │  Complexity & Depth (128D)                               │   │
│  │  - Cognitive demand          │  - Thematic richness      │   │
│  │  - Domain embedding          │  - Cultural context       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Domain Adapters (Pluggable):                                   │
│  [TV5MONDE] [Spotify] [Kindle] [Podcasts] [Courses] [VR...]   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       STORAGE LAYER                              │
│                                                                  │
│  ┌────────────────┬────────────────┬────────────────┐          │
│  │ AgentDB Vector │ Trajectory DB  │ Causal Graph   │          │
│  │ (HNSW 150x)    │ (Episodes)     │ (Neo4j)        │          │
│  │                │                │                │          │
│  │ Content 768D   │ Session memory │ p(y|do(x))     │          │
│  │ User 64D+      │ Self-critique  │ Interventions  │          │
│  │ Quantized      │ Provenance     │ Confidence     │          │
│  └────────────────┴────────────────┴────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Matching Formula Evolution

#### Phase 1: Static Formula (MVP)
```javascript
finalScore = (
  vectorSimilarity × 0.25 +    // Static taste DNA
  moodScore × 0.30 +           // Current mood
  intentScore × 0.20 +         // Viewing purpose
  contextScore × 0.15 +        // Situation
  trendingScore × 0.10         // What's hot
) × constraintMultiplier       // Hard filters
```

#### Phase 2: Utility-Based Formula (Learning)
```javascript
finalScore = (
  α × vectorSimilarity +           // Learned weight (not fixed)
  β × causalUplift +               // p(completion|do(recommend)) - NEW
  contextPatternBoost              // Learned from ReasoningBank
) - γ × latency                    // Speed penalty

// Where weights α, β, γ are learned from outcomes
// And contextPatternBoost comes from discovered skills:
// e.g., "Friday evening unwind + laugh" → boost_comedy × 1.4
```

#### Phase 3: Cross-Domain Formula (Universal)
```javascript
finalScore = utilitySearch({
  userEmotionalState,              // Domain-agnostic
  candidateContentProfiles,        // Universal Content Vectors
  crossDomainTransfer: true,       // Enable transfer learning
  diversifyByDomain: MAX_PER_DOMAIN // Mix content types
})
```

### 5.3 Data Flow with Learning

```
1. User Input → Intent Agent (with Reflexion Memory)
   - Query episodes: "Similar context + outcome patterns"
   - Apply self-critique: "Avoid patterns that led to abandonment"
   - Output: UniversalEmotionalState + learned constraints

2. Intent → Parallel Processing (GNN-Enhanced)
   - Catalog Agent: Utility-based Causal Recall search
   - Trend Agent: Pattern Learning (what's actually trending)
   - GNN Attention: 8-head graph-aware query expansion

3. Results → Match Agent (with ReasoningBank)
   - Query learned patterns: "What worked for similar contexts?"
   - Apply dynamic weights (not static formula)
   - Compute utility: similarity + uplift - latency

4. Match → Present Agent (with Provenance)
   - Generate explanation with evidence trajectories
   - Show: "Users like you completed this 87% of the time"
   - Create deeplink

5. Outcome → Learning Loop (Continuous)
   - Store trajectory in ReasoningBank
   - Update Reflexion Memory with self-critique if needed
   - Feed Causal Graph with intervention outcomes
   - Nightly Learner consolidates into Skills
```

---

## 6. Universal Content Architecture

### 6.1 Universal Content Vector (384D)

The UCV captures content essence independent of medium:

```typescript
interface UniversalContentVector {
  // Emotional Signature (128D) - From Plutchik + VAD
  emotionalSignature: {
    joy: number; trust: number; fear: number; surprise: number;
    sadness: number; disgust: number; anger: number; anticipation: number;
    valence: number; arousal: number; dominance: number;
    arcPattern: number[]; // 64D temporal journey
    peakMoments: number; variability: number;
  };

  // Engagement Pattern (128D)
  engagementPattern: {
    attentionCurve: number[]; // 32D
    retentionRate: number; reEngagementLikelihood: number;
    pacingSpeed: number; rhythmVariability: number;
    intensityCurve: number[]; // 32D
    optimalSessionLength: number; bingeability: number;
  };

  // Complexity & Depth (128D)
  complexityDepth: {
    cognitiveLoad: number; abstractionLevel: number;
    themeCount: number; themeDepth: number[]; // 32D
    narrativeComplexity: number; perspectiveCount: number;
    domainEmbedding: number[]; // 64D
    culturalContext: number[]; // 16D
  };
}
```

### 6.2 Domain Adapter Pattern

```typescript
interface DomainAdapter<T = any> {
  readonly domain: ContentDomain;
  fetchContent(contentId: string): Promise<T>;
  standardize(content: T): Promise<StandardizedContent>;
  extractFeatures(content: T): Promise<ContentFeatures>;
  denormalize(ucv: UniversalContentVector): Promise<DomainRecommendation[]>;
}

// Adding new domain = 1-2 weeks effort:
class TV5MondeAdapter implements DomainAdapter<TV5Content> { ... }
class SpotifyAdapter implements DomainAdapter<SpotifyTrack> { ... }
class PodcastAdapter implements DomainAdapter<Podcast> { ... }
class KindleAdapter implements DomainAdapter<KindleBook> { ... }
class CourseAdapter implements DomainAdapter<Course> { ... }
class VRExperienceAdapter implements DomainAdapter<VRExperience> { ... }
```

### 6.3 Cross-Domain Transfer Learning

```yaml
# Example: User Profile from Movies → Podcasts

user_movie_preferences:
  loved:
    - "The Social Network" (complex dialogue, modern)
    - "Moneyball" (data-driven, strategic)
  meta_features:
    complexity: 0.85
    dominant_needs: [growth: 0.9, stimulation: 0.8]
    tone_preference: 0.6 (witty/clever)

# Zero-shot transfer to podcasts:
predicted_podcast_preferences:
  - "Acquired" (business deep-dives) - 0.92 confidence
    why: "Matches growth need + complexity"
  - "Planet Money" (economics, witty) - 0.88 confidence
    why: "Matches tone + stimulation"
```

---

## 7. Learning System Details

### 7.1 ReasoningBank — Pattern Learning

**Purpose**: Learn what recommendation strategies actually work.

```javascript
// Trajectory stored after each session
{
  trajectory: {
    userMood: "unwind + laugh",
    contentRecommended: "Le Sens de la Fête",
    vectorSimilarity: 0.87,
    outcome: "watched_85%_completion"
  },
  verdict: {
    success: true,
    confidenceScore: 0.92,
    reasoning: "Light comedy + high completion"
  },
  learnedPattern: {
    ifCondition: "mood=unwind+laugh AND time=evening AND day=friday",
    thenAction: "boost_weight_comedy × 1.3",
    confidence: 0.88,
    evidenceCount: 47
  }
}
```

**Performance**: 32.6M ops/sec with super-linear scaling (gets faster with more data).

### 7.2 Causal Memory Graph — Understand Causation

**Purpose**: Distinguish correlation from causation.

```javascript
// Track: Does trending actually help?
{
  intervention: "recommend_trending_content",
  outcome: "watch_completion_rate",
  causalEffect: {
    baseline: 0.62,           // Without trending
    withIntervention: 0.71,   // With trending
    uplift: +0.09,            // Causal effect
    confidence: 0.94
  },
  moderators: {
    "user_age_18_30": { uplift: +0.15 },  // Strong
    "user_age_50+": { uplift: +0.02 }     // Weak
  }
}
```

### 7.3 Skill Library — Consolidated Expertise

**Purpose**: Auto-discover and store reusable recommendation strategies.

```javascript
// Auto-discovered after 1000+ sessions
{
  skill: "Friday Evening Unwind Specialist",
  consolidatedFrom: 1247 trajectories,
  pattern: {
    trigger: "day=friday AND time>18:00 AND mood=unwind",
    strategy: {
      boostComedy: 1.4,
      boostClassics: 1.2,
      penalizeIntense: 0.6,
      preferRuntime: [90, 120],
      avoidCliffhangers: true
    },
    successRate: 0.87,
    validatedOn: 312 holdout sessions
  },
  composableWith: ["Language Learning Mode", "Family Viewing"]
}
```

### 7.4 Nightly Learner — Autonomous Discovery

**Purpose**: Background process discovers new patterns and optimizes weights.

```javascript
// Runs every night at 2 AM
nightlyLearner.run({
  tasks: [
    "discover_new_patterns",     // Find emerging behavior
    "validate_existing_skills",  // Test if skills still work
    "prune_low_confidence",      // Remove outdated patterns
    "optimize_formula_weights",  // Tune matching formula
    "detect_seasonal_trends"     // Christmas, summer patterns
  ]
});

// Example output:
{
  newPattern: {
    name: "Winter Comfort Seeking",
    observation: "December users prefer 'cozy' content +23%",
    evidence: 892 trajectories,
    recommendation: "Add seasonal boost for 'cozy' tag"
  },
  optimizedWeight: {
    parameter: "trendingScore",
    oldWeight: 0.10,
    newWeight: 0.14,
    confidence: 0.93
  }
}
```

### 7.5 Self-Healing — 97.9% Success Rate

**Purpose**: Automatically recover from performance degradation.

```javascript
// System detects: Match satisfaction dropped
if (healthMetrics.avgMatchSatisfaction < 0.85) {
  selfHealing.diagnose({
    symptom: "Match satisfaction dropped from 0.89 to 0.82",
    possibleCauses: [
      "Formula weights drifted",
      "New content not vectorized",
      "User behavior shift"
    ]
  });

  // Auto-heal with 30-day validation
  selfHealing.adapt({
    action: "rollback_formula_to_proven_state",
    validationPeriod: "30 days",
    autoRollback: true
  });
}
```

---

## 8. Interface Evolution (2025-2040)

### 8.1 Timeline

| Era | Years | Input Methods | Emotion Detection |
|-----|-------|--------------|-------------------|
| **Touch + Voice** | 2025-2027 | Tap, voice, text | Sentiment analysis, explicit input |
| **Multimodal** | 2028-2030 | Gaze, gesture, facial | Micro-expressions, gaze patterns |
| **Context-Aware** | 2031-2035 | Passive sensing | Biosignals, behavioral patterns |
| **Neural** | 2036-2040 | Brain-computer interface | Direct emotional state reading |

### 8.2 Input Adapter Pattern

```typescript
// Core contract: Any input → UniversalEmotionalState
interface InputAdapter {
  modality: 'touch' | 'voice' | 'gaze' | 'neural';
  extractEmotionalState(
    rawInput: RawInput,
    context: AmbientContext
  ): Promise<UniversalEmotionalState>;
}

// 2025: Touch + Voice
class TouchVoiceAdapter implements InputAdapter { ... }

// 2030: Gaze + Facial
class MultimodalAdapter implements InputAdapter { ... }

// 2040: Neural
class NeuralAdapter implements InputAdapter { ... }
```

**Key Insight**: The matching algorithm stays constant; only input extraction changes.

---

## 9. API Specifications

### 9.1 MCP Tools

```typescript
// Tool: get_recommendation (Enhanced)
interface GetRecommendationInput {
  mood: "unwind" | "engage";
  goal: "laugh" | "feel" | "thrill" | "think";
  maxRuntime?: number;
  context?: "alone" | "partner" | "family";
  includeProvenance?: boolean; // NEW: Show evidence
}

interface GetRecommendationOutput {
  topPick: {
    id: string;
    title: string;
    matchScore: number;
    utilityScore: number;           // NEW: From Causal Recall
    description: string;
    deeplink: string;
    provenance?: {                  // NEW: Evidence
      evidenceTrajectories: number;
      confidenceInterval: [number, number];
      similarUsersCompleted: string; // "87% completed"
    };
  };
  alternatives: Array<{...}>;
  reasoning: string;
  skillUsed?: string;               // NEW: Which learned skill
}
```

### 9.2 ARW Manifest

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "site": {
    "name": "Universal Content Discovery",
    "description": "AI-powered emotion-first content discovery"
  },
  "actions": [
    {
      "name": "get_recommendation",
      "endpoint": "/api/recommend",
      "method": "POST"
    },
    {
      "name": "get_cross_domain",
      "endpoint": "/api/cross-domain",
      "method": "POST"
    }
  ]
}
```

---

## 10. Success Metrics (Complete)

### 10.1 User Experience Metrics

| Metric | MVP | Learning | Universal | Measurement |
|--------|-----|----------|-----------|-------------|
| **Time to recommendation** | < 60s | < 45s | < 30s | App open to displayed |
| **Match satisfaction** | > 85% | > 92% | > 95% | Click-through on first pick |
| **First-try success** | > 80% | > 90% | > 95% | No refinement needed |
| **Refinement rate** | < 20% | < 12% | < 8% | Requests for alternatives |
| **Return rate** | > 60% | > 75% | > 85% | Weekly active return |

### 10.2 Learning System Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Pattern discovery rate** | 5-10/week | Nightly Learner output |
| **Causal confidence** | > 0.85 avg | Confidence intervals |
| **Self-healing success** | > 95% | Auto-resolved / total degradations |
| **Skill validation rate** | > 88% | Holdout success |
| **GNN recall improvement** | > +10% | vs. vector-only |

### 10.3 Long-Term Vision Metrics (10 Years)

| Metric | Year 1 | Year 3 | Year 10 |
|--------|--------|--------|---------|
| **Autonomous improvements** | 20% | 60% | 95% |
| **Learned formula components** | 15 | 50 | 200+ |
| **Skill library size** | 20 | 150 | 1000+ |
| **Causal relationships mapped** | 30 | 200 | 2000+ |
| **Content domains** | 1 | 3-5 | 10+ |
| **Supported interfaces** | Touch/Voice | + Gaze/Gesture | + Neural |

---

## 11. Implementation Roadmap

### Phase 1: MVP Foundation (Weeks 1-4)

- [ ] Binary choice quiz UI with emotional mapping
- [ ] 64D user style vector implementation
- [ ] Content vectorization pipeline for TV5MONDE
- [ ] AgentDB vector storage with HNSW indexing
- [ ] Basic 6-agent swarm (Orchestrator, Intent, Catalog, Trend, Match, Present)
- [ ] MCP server (STDIO + SSE)
- [ ] ARW manifest

**Milestone**: "60-second recommendation flow works end-to-end"

### Phase 2: AgentDB v2.0 Integration (Weeks 5-7)

- [ ] ReasoningBank trajectory storage and pattern query
- [ ] Reflexion Memory episode storage and self-critique
- [ ] Causal Recall utility-based search
- [ ] GNN Attention 8-head integration
- [ ] Dynamic weight learning (replace static formula)
- [ ] Provenance certificates in recommendations

**Milestone**: "System learns from every interaction"

### Phase 3: Background Learning (Weeks 8-10)

- [ ] Skill Library auto-consolidation
- [ ] Nightly Learner pipeline
- [ ] Self-Healing health monitoring
- [ ] 30-day validation loop
- [ ] A/B testing framework

**Milestone**: "Autonomous optimization without human intervention"

### Phase 4: Universal Content Foundation (Weeks 11-16)

- [ ] Universal Content Vector (384D) specification
- [ ] Domain adapter interface
- [ ] Cross-domain transfer learning
- [ ] Shared emotional space
- [ ] First additional domain (music or podcasts)

**Milestone**: "Cross-domain recommendations working"

### Phase 5: Multimodal Input (Months 5-6)

- [ ] Voice input adapter enhancement
- [ ] Gaze tracking integration (research)
- [ ] Input abstraction layer

**Milestone**: "Multimodal emotion extraction"

### Phase 6: Production Scale (Months 7-12)

- [ ] Scale to 1M+ users
- [ ] 10M+ content items
- [ ] Sub-100ms latency
- [ ] 99.9% uptime

**Milestone**: "Production-ready universal platform"

---

## 12. Risk Analysis

### 12.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Cold start (new users)** | High | Medium | GNN uses similar users; Skill Library defaults |
| **Cold start (new content)** | Medium | Medium | Similarity fallback; Thompson sampling |
| **Pattern overfitting** | Medium | High | 30-day validation; holdout testing |
| **Self-healing false positives** | Low | Medium | Threshold tuning; human review for critical |
| **Storage costs** | Medium | Medium | Trajectory compression; optimize schedule |

### 12.2 Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **API provider changes** | Low | Medium | Multi-source; adapter pattern |
| **Privacy concerns** | Medium | High | Anonymization; GDPR compliance |
| **Over-optimization** | Medium | Medium | Diversity injection; exploration bonus |

---

## 13. Future-Proofing Checklist

### Architecture Principles ✅

- [x] Separation of concerns: Input ↔ State ↔ Matching ↔ Output
- [x] Abstraction layers that evolve independently
- [x] Plugin architecture for new features
- [x] Domain-agnostic matching core
- [x] Versioned schemas with migration paths
- [x] Backward compatibility

### Extensibility ✅

- [x] New content domain: 1-2 weeks via adapter pattern
- [x] New input modality: 2-4 weeks via input adapter
- [x] New matching algorithm: 4-8 weeks + A/B testing
- [x] New language/region: 1-2 weeks
- [x] New platform: 1-2 weeks via output adapter

### 10-Year Targets

```yaml
2025: TV5MONDE catalog, 10K users, 85% accuracy
2027: 5 domains, 100K users, 90% accuracy
2030: 10 domains, 1M users, 95% accuracy, multimodal input
2035: Universal platform, 10M users, 98% accuracy, neural interface
```

---

## 14. Conclusion

This PRD v2.0 unifies three architectural visions:

1. **MVP (Original PRD)**: Emotion-first 60-second recommendations for TV5MONDE
2. **Self-Learning (AgentDB Enhancement)**: Autonomous improvement through ReasoningBank, Causal Memory, and Self-Healing
3. **Universal Platform (Future-Proof)**: Cross-domain content discovery with pluggable adapters

**The key insight**: We're building on timeless psychological truths (humans have emotional needs; content serves emotional functions) while making the technological parts pluggable (input methods, content domains, output formats).

**Investment**:
- MVP: 4 weeks
- Learning: +6 weeks
- Universal foundation: +10 weeks

**Return**:
- Industry-leading recommendation system
- 95% autonomous improvement
- Platform extensible to any content type for 10+ years

---

## Appendices

### A. Research Documents

- `/docs/research/01_hackathon_requirements.md`
- `/docs/research/07-10_user_personas.md`
- `/docs/specs/PRD.md` (Original MVP)
- `/docs/specs/PRD_IMPROVEMENTS_AGENTDB.md`
- `/docs/specs/PRD_FUTURE_PROOF_ARCHITECTURE.md`
- `/docs/specs/PRD_UNIVERSAL_CONTENT_ARCHITECTURE.md`

### B. Existing Components

- `apps/agentdb` - Vector database with HNSW, ReasoningBank, Causal Recall
- `apps/agentic-flow` - Agent orchestration framework (66 agents)
- `apps/cli` - MCP server implementation

### C. External APIs

- TMDB API - Content metadata
- FlixPatrol - Trending data
- Spotify API (Phase 3) - Music metadata
- Podcast API (Phase 3) - Podcast metadata

### D. Technology Stack

```yaml
Core:
  - TypeScript/Node.js
  - AgentDB v2.0 (vector + learning)
  - Claude (Sonnet/Haiku)

Storage:
  - AgentDB HNSW (vectors)
  - SQLite (metadata)
  - Neo4j (causal graph, Phase 2+)

APIs:
  - MCP Server (STDIO/SSE)
  - REST API
  - WebSocket (real-time)
```

---

**Document Status**: Ready for Implementation
**Next Step**: `npx claude-flow sparc run spec-pseudocode "Universal Content Discovery MVP"`

---

**END OF DOCUMENT**

*This unified PRD transforms TV5MONDE's content discovery from a static recommendation engine into a self-learning, universal platform designed to improve autonomously for a decade.*
