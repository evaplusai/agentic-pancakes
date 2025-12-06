# TV5MONDE Content Discovery System Architecture

**Research Document**
**Date:** 2025-12-06
**Source:** Initial Research Analysis (00_content_discovery_research.md)
**Focus:** System architecture, emotional intelligence, and timeless design principles

---

## Executive Summary

The TV5MONDE Content Discovery System revolutionizes content recommendation by shifting from **"What do you want?"** to **"How do you feel?"** This fundamental paradigm shift creates a 20-year solution that remains relevant regardless of interface evolution (tap → voice → gaze → neural).

**Key Innovation:** Emotional state matching over preference interrogation
**Core Metric:** 60 seconds from app open to watching (vs 45 minutes scrolling)
**Architecture:** Vector-based emotional matching with multi-agent orchestration

---

## 1. Core Concept: "What to Watch in 60 Seconds"

### 1.1 Problem Statement

**Current Reality:**
- Users spend 45 minutes scrolling through content
- Analysis paralysis from too many choices
- Traditional systems ask: "What genre? What decade? Foreign or domestic?"
- Users don't know what they want until they see it

**Solution Approach:**
- Capture emotional state, not content preferences
- 2-3 binary choices OR single natural language input
- Agent analyzes thousands of options invisibly
- Present single confident recommendation

### 1.2 The Timeless Truth: Emotion → Decision

```
HUMAN DECISION FLOW:
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   FEELING   │  →   │    WANT     │  →   │   CHOICE    │
│ (instant,   │      │(constructed,│      │(rationalized│
│ unconscious)│      │ emergent)   │      │ afterward)  │
└─────────────┘      └─────────────┘      └─────────────┘

Examples:
"I feel drained"     → "Something easy"    → "A comedy"
"I feel restless"    → "Something gripping"→ "A thriller"
"I feel curious"     → "Something new"     → "A documentary"
"I feel nostalgic"   → "Something familiar"→ "A rewatch"
```

**Key Insight:** If you capture the FEELING, you skip asking about the WANT. The system infers preferences from emotional state.

---

## 2. User Style Profile - "Viewing Personality"

### 2.1 Two-Layer Personality Model

```
┌─────────────────────────────────────────────────────────────────┐
│                 VIEWING PERSONALITY DIMENSIONS                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STATIC (changes rarely)              DYNAMIC (changes per session)
│  ─────────────────────                ─────────────────────────  │
│                                                                  │
│  Demographics:                        Context:                   │
│  • Age range                          • Time of day              │
│  • Location/timezone                  • Day of week (weekend?)   │
│  • Language fluency (FR/EN/both)      • Available time (30m/2h?) │
│                                       • Watching alone/with whom │
│  Taste DNA:                                                      │
│  • Genre affinity scores              Mood:                      │
│  • Pacing preference (slow/fast)      • Energy level (high/low)  │
│  • Complexity tolerance               • Emotional goal           │
│  • Violence/intensity threshold         (escape/learn/feel/laugh)│
│  • Nostalgia vs novelty               • Stress level today       │
│                                                                  │
│  History Signals:                     Intent:                    │
│  • Completed vs abandoned             • "Just background noise"  │
│  • Rewatch patterns                   • "Really engage"          │
│  • Binge vs episodic                  • "Fall asleep to"         │
│  • Peak viewing times                 • "Learn something"        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 User Vector Representation (64 Dimensions)

```javascript
const userStyleVector = {
  // Genre affinities (0-1 scale, learned over time)
  comedy: 0.85,
  drama: 0.72,
  documentary: 0.45,
  thriller: 0.30,
  romance: 0.60,
  action: 0.25,

  // Mood/tone preferences
  lighthearted: 0.80,
  intense: 0.35,
  thoughtProvoking: 0.55,
  heartwarming: 0.70,
  dark: 0.20,

  // Pacing & structure
  slowBurn: 0.40,
  fastPaced: 0.65,
  episodic: 0.50,
  serialized: 0.70,

  // Content characteristics
  dialogueHeavy: 0.75,
  visuallyDriven: 0.60,
  culturalDepth: 0.80,  // Important for TV5MONDE!

  // French content specific
  frenchFluency: 0.60,
  subtitlePreference: 0.70,
  europeanCinemaFamiliarity: 0.45,

  // Current session modifiers (dynamic)
  currentMood: "relaxed",
  currentEnergy: 0.40,
  availableTime: 120,
  watchingWith: "partner"
};
```

---

## 3. The "How Do You Feel?" Paradigm

### 3.1 One-Round Input: Natural Language

Instead of binary quiz, the system accepts natural conversation:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   🎙️ "Hey! How are you feeling tonight?"                        │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │  [Speak or type naturally]                              │   │
│   │                                                         │   │
│   │  Examples that work:                                    │   │
│   │  • "Long meetings, brain is fried"                      │   │
│   │  • "Pretty good actually, feeling curious"              │   │
│   │  • "Meh"                                                │   │
│   │  • "Excited! Just got great news!"                      │   │
│   │  • "Honestly? Sad. Need something uplifting"            │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Emotion → Content Mapping

```
┌─────────────────────────────────────────────────────────────────┐
│                   EMOTION → CONTENT MAPPING                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  "Brain is fried"                                               │
│    → Energy: 0.2, Need: restoration                             │
│    → COMFORT ZONE: Light comedy, familiar, low cognitive load   │
│                                                                  │
│  "Feeling curious"                                              │
│    → Energy: 0.7, Need: stimulation                             │
│    → DISCOVERY ZONE: Documentary, foreign, acclaimed            │
│                                                                  │
│  "Meh"                                                          │
│    → Energy: 0.4, Need: elevation                               │
│    → BOOST ZONE: Crowd-pleasers, feel-good, proven hits         │
│                                                                  │
│  "Excited!"                                                     │
│    → Energy: 0.9, Need: matching energy                         │
│    → THRILL ZONE: Action, adventure, fast-paced                 │
│                                                                  │
│  "Sad, need uplifting"                                          │
│    → Energy: 0.3, Need: explicit uplift                         │
│    → HEAL ZONE: Heartwarming, triumphant endings, no tragedy    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Emotional State Vector (The Timeless Core)

This structure works forever — only the INPUT METHOD changes:

```javascript
const emotionalState = {
  // Core emotional dimensions (from psychology research)
  energy: 0.35,        // 0=depleted, 1=energized
  valence: 0.20,       // -1=negative mood, +1=positive mood
  arousal: 0.25,       // 0=calm, 1=activated

  // Content-specific dimensions
  openness: 0.40,      // 0=want familiar, 1=want novel
  cognitive: 0.30,     // 0=want easy, 1=want complex
  social: 0.80,        // 0=solo content, 1=group-appropriate

  // Inferred needs (derived from above)
  needs: {
    comfort: 0.75,     // High when low energy + negative valence
    stimulation: 0.20, // High when high energy + high openness
    escape: 0.60,      // High when negative valence
    connection: 0.40,  // High when social + negative valence
    growth: 0.15,      // High when positive valence + high openness
  },

  // Context modifiers
  context: {
    timeOfDay: "evening",
    dayOfWeek: "friday",
    weather: "rainy",
    device: "tv",
    companions: "solo",
    recentAbandons: ["thriller", "horror"],
    timeAvailable: 120
  }
};
```

---

## 4. Content Emotional Tagging System

### 4.1 Emotional Dimensions Framework

Content is tagged NOT by what it IS, but by HOW it FEELS:

```
┌─────────────────────────────────────────────────────────────────┐
│                 CONTENT EMOTIONAL DIMENSIONS                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  VIEWER DEMAND (What it asks FROM you)                          │
│  ─────────────────────────────────────                          │
│                                                                  │
│  energy_required      [0.0 ─────────── 1.0]                     │
│   Passive viewing  →  Intense engagement                        │
│                                                                  │
│  cognitive_load       [0.0 ─────────── 1.0]                     │
│   Simple, linear   →  Complex, layered                          │
│                                                                  │
│  emotional_intensity  [0.0 ─────────── 1.0]                     │
│   Light, breezy    →  Heavy, impactful                          │
│                                                                  │
│  VIEWER REWARD (What it gives TO you)                           │
│  ─────────────────────────────────────                          │
│                                                                  │
│  emotional_valence    [-1.0 ────── 0 ────── 1.0]                │
│    Dark/Heavy   Neutral/Mixed   Uplifting                       │
│                                                                  │
│  EMOTIONAL NEEDS SERVED                                          │
│  ──────────────────────                                          │
│                                                                  │
│  serves_comfort       Familiar, safe, reassuring                │
│  serves_escape        Transport to another world                │
│  serves_stimulation   Excite, thrill, engage                    │
│  serves_connection    Feel less alone, understood               │
│  serves_growth        Learn, expand perspective                 │
│  serves_catharsis     Emotional release, crying OK              │
│  serves_joy           Laughter, happiness                       │
│  serves_relaxation    Easy watch, unwind                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Complete Content Tag Schema

```javascript
const ContentEmotionalTag = {
  // === VIEWER DEMAND ===
  demand: {
    energy_required: 0.30,        // Low - easy watch
    cognitive_load: 0.25,         // Simple plot
    emotional_intensity: 0.35,    // Light emotional investment
    attention_required: 0.40,     // Can glance away occasionally
  },

  // === VIEWER REWARD ===
  reward: {
    emotional_valence: 0.75,      // Strongly positive
    satisfaction_guarantee: 0.85, // High chance of enjoyment
    rewatch_value: 0.70,          // Enjoyable repeat viewing
  },

  // === CHARACTER TRAITS ===
  character: {
    pacing: 0.65,                 // Moderately fast
    humor_level: 0.85,            // Very funny
    romance_level: 0.40,          // Subplot, not central
    violence_level: 0.05,         // Essentially none
    darkness_level: 0.10,         // Very light
    warmth_level: 0.80,           // Very warm
  },

  // === SOCIAL SUITABILITY ===
  social: {
    family_safe: 0.75,            // Most families OK
    date_appropriate: 0.90,       // Excellent date movie
    group_friendly: 0.95,         // Perfect for groups
    solo_optimal: 0.60,           // Fine alone too
  },

  // === NEEDS SERVED ===
  serves: {
    comfort: 0.75,
    escape: 0.80,
    stimulation: 0.50,
    connection: 0.65,
    growth: 0.20,
    catharsis: 0.40,
    joy: 0.90,                    // Primary offering
    relaxation: 0.70,
  },

  // === CONTEXTUAL FIT ===
  context_fit: {
    friday_night: 0.95,           // Perfect
    weeknight_tired: 0.85,        // Good easy watch
    feeling_sad: 0.80,            // Will lift mood
    rainy_day: 0.90,              // Cozy match
  },
};
```

### 4.3 Emotional Tagging Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                   EMOTIONAL TAGGING PIPELINE                     │
└─────────────────────────────────────────────────────────────────┘

STEP 1: GATHER RAW DATA
───────────────────────
┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│  OMDb     │    │  IMDb     │    │  Rotten   │    │Watchmode  │
│  API      │    │  Reviews  │    │  Tomatoes │    │  API      │
└─────┬─────┘    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
      └────────────────┼────────────────┼────────────────┘
                       ▼
              ┌─────────────────┐
              │   RAW CONTENT   │
              │   title, plot,  │
              │   genres, etc.  │
              └────────┬────────┘
                       │
                       ▼

STEP 2: EXTRACT EMOTIONAL SIGNALS
─────────────────────────────────
┌─────────────────────────────────────────┐
│  PLOT ANALYZER (Claude)                 │
│  Input: Plot synopsis                   │
│  Output: arc_type, stakes, tone         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  REVIEW SENTIMENT ANALYZER (Claude)     │
│  Input: 50 sampled user reviews         │
│  Output: dominant_reactions, energy     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  GENRE MAPPER (Rule-based + ML)         │
│  Input: Genre tags                      │
│  Output: base_valence, humor_baseline   │
└─────────────────────────────────────────┘
                       │
                       ▼

STEP 3: SYNTHESIZE EMOTIONAL PROFILE
────────────────────────────────────
┌─────────────────────────────────────────┐
│  SYNTHESIS AGENT (Claude Sonnet)        │
│  Combines all signals into coherent     │
│  emotional profile                      │
└────────────┬────────────────────────────┘
             │
             ▼

STEP 4: VECTORIZE & STORE
─────────────────────────
┌─────────────────────────────────────────┐
│  emotional_tag → normalize → vector     │
│  Store in RuVector with metadata        │
└─────────────────────────────────────────┘
```

**Data Sources & Weights:**
- Plot Synopsis (OMDb): 25% - Core emotional arc
- User Reviews (IMDb): 30% - Actual emotional impact
- Critic Reviews (RT): 15% - Tone, quality signals
- Genre Tags: 15% - Base emotional profile
- Content Ratings: 10% - Intensity indicators
- Trailer/Poster: 5% - Visual emotional cues

---

## 5. Intent Extraction from Voice/Text

### 5.1 What We Extract from Natural Input

```
┌─────────────────────────────────────────────────────────────────┐
│              EXTRACTABLE SIGNALS FROM NATURAL INPUT              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. EMOTIONAL STATE                                              │
│     "I'm exhausted" → energy: 0.15                              │
│     "Feeling great!" → energy: 0.85, valence: 0.9               │
│     "Kind of anxious" → arousal: 0.7, valence: -0.3             │
│                                                                  │
│  2. EXPLICIT NEEDS                                               │
│     "Need to laugh" → serves.joy priority                       │
│     "Want to escape" → serves.escape priority                   │
│     "Just want to zone out" → low cognitive, background OK      │
│                                                                  │
│  3. CONTENT PREFERENCES (if stated)                             │
│     "Nothing too heavy" → darkness_level < 0.3                  │
│     "Something French" → language filter                        │
│     "Not another thriller" → genre exclusion                    │
│                                                                  │
│  4. CONSTRAINTS                                                  │
│     "Only have an hour" → runtime < 70                          │
│     "Kids are watching" → family_safe > 0.8                     │
│     "Date night" → date_appropriate > 0.7                       │
│                                                                  │
│  5. VOICE TONE (if audio)                                       │
│     Speaking speed → energy level                               │
│     Pitch variation → emotional arousal                         │
│     Sighs/pauses → fatigue, uncertainty                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Intent Extraction Architecture

```
USER INPUT
    │
    ├──→ [VOICE] ──→ Speech-to-Text ──→ Text + Audio Features
    │                                         │
    └──→ [TEXT] ─────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CONTEXT AGGREGATOR                           │
│  Input Text: "Ugh, brutal week. Need something light."          │
│  Ambient Context: Friday 9:47pm, Rainy, TV, Solo               │
│  Voice Features: Slow speech (0.3), Low energy (0.25), Sighs   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-LAYER EXTRACTION                        │
│                                                                  │
│  LAYER 1: EMOTIONAL STATE EXTRACTOR                             │
│  "brutal week" → stress, fatigue                                │
│  → energy: 0.20, valence: -0.10, arousal: 0.25                  │
│                                                                  │
│  LAYER 2: NEEDS EXTRACTOR                                       │
│  "Need something light" → explicit need                          │
│  → needs.comfort: 0.8, needs.relaxation: 0.9                    │
│                                                                  │
│  LAYER 3: CONSTRAINT EXTRACTOR                                  │
│  (none explicit in this input)                                   │
│  → inferred: solo evening viewing                               │
│                                                                  │
│  LAYER 4: PREFERENCE EXTRACTOR                                  │
│  "light" → exclude: darkness > 0.4                              │
│  → boost: humor, warmth                                          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EMOTIONAL STATE SYNTHESIZER                    │
│  Output: UserEmotionalState                                      │
│  {                                                               │
│    energy: 0.20,                                                 │
│    valence: -0.10,                                               │
│    needs: { comfort: 0.85, escape: 0.80, joy: 0.70 },          │
│    constraints: { runtime_max: null, family_safe: false },      │
│    confidence: 0.88                                              │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Emotional Lexicon Examples

```javascript
const EMOTIONAL_LEXICON = {
  // Low energy negative
  exhausted: { energy: 0.1, valence: -0.3, arousal: 0.2 },
  tired: { energy: 0.2, valence: -0.2, arousal: 0.25 },
  drained: { energy: 0.15, valence: -0.35, arousal: 0.2 },

  // High energy positive
  excited: { energy: 0.9, valence: 0.8, arousal: 0.8 },
  pumped: { energy: 0.95, valence: 0.7, arousal: 0.9 },

  // Neutral/Mixed
  bored: { energy: 0.3, valence: -0.2, arousal: 0.2, needs_stimulation: true },
  curious: { energy: 0.6, valence: 0.4, arousal: 0.5, needs_growth: true },
};

const NEED_PHRASES = {
  "need to relax": { comfort: 0.9, relaxation: 0.95 },
  "switch off": { relaxation: 0.95, cognitive_load_max: 0.2 },
  "need to laugh": { joy: 0.95, humor_min: 0.7 },
  "make me think": { growth: 0.9, cognitive_load_min: 0.5 },
  "good cry": { catharsis: 0.95, emotional_intensity_min: 0.7 },
};
```

---

## 6. Matching Engine Design

### 6.1 Vector Similarity Matching

```
USER EMOTIONAL STATE VECTOR (64 dims)
              ↕
    Vector Similarity Search
              ↕
CONTENT EMOTIONAL VECTORS (64 dims each)
```

**Matching Formula:**
```javascript
finalScore = (
  vectorSimilarity * 0.60 +      // Base emotional match
  trendingScore * 0.25 +         // What's hot right now
  personalHistory * 0.15         // Past viewing patterns
);
```

### 6.2 Complete Matching Flow

```javascript
async function matchUserToContent(userEmotionalState) {
  // 1. Convert user state to query vector
  const queryVector = buildQueryVector(userEmotionalState);

  // 2. Search RuVector for similar content
  const candidates = await ruvector.search(queryVector, {
    limit: 50,
    filter: {
      platform: "tv5monde",
      runtime: { $lte: userEmotionalState.time_available },
      family_safe: { $gte: userEmotionalState.family_required ? 0.7 : 0 }
    }
  });

  // 3. Re-rank with trend boost and context
  const ranked = candidates.map(c => ({
    ...c,
    finalScore: (
      c.similarity * 0.60 +
      c.trendScore * 0.25 +
      c.personalBoost * 0.15
    )
  }));

  // 4. Return top match
  return ranked.sort((a, b) => b.finalScore - a.finalScore)[0];
}
```

### 6.3 Trending Signals

```
┌─────────────────────────────────────────────────────────────────┐
│                    TREND SIGNAL SOURCES                          │
└─────────────────────────────────────────────────────────────────┘

SOURCE              WHAT IT TELLS US              WEIGHT
──────              ────────────────              ──────
FlixPatrol API      Daily top 10s on              40%
                    streaming platforms

OMDb/IMDb           Critic scores,                25%
                    audience ratings

Reddit/Social       What people are               20%
                    talking about

News APIs           Recent press,                 10%
                    festival selections

TV5MONDE Internal   Featured content              5%
```

**Trend Score Calculation:**
```javascript
function calculateTrendScore(content) {
  const popularityScore = Math.max(0, (100 - chartPosition) / 100);
  const criticScore = (imdbScore + rtScore) / 2;
  const buzzScore = Math.min(1, socialMentions / 100);
  const freshnessScore = Math.max(0, 1 - (ageWeeks / 52));

  return (
    popularityScore * 0.40 +
    criticScore * 0.25 +
    buzzScore * 0.20 +
    freshnessScore * 0.10 +
    awardBoost * 0.05
  );
}
```

---

## 7. Agentic Swarm Architecture

### 7.1 Agent Roles

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT SWARM ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR AGENT                           │
│              (Coordinates all agents, talks to user)             │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌────────────┬────────┼────────────┬────────────┐
        │            │        │            │            │
        ▼            ▼        ▼            ▼            ▼
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│  INTENT   │ │  CATALOG  │ │  TREND    │ │  MATCH    │ │  PRESENT  │
│  AGENT    │ │  AGENT    │ │  AGENT    │ │  AGENT    │ │  AGENT    │
└───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘
     │             │             │             │             │
Understands   Searches      Fetches       Scores &      Formats
user input    TV5MONDE      trending      ranks         response
+ extract     content DB    signals       matches       + deeplinks
emotion       (ruvector)    (APIs)        (vectors)     for user
```

### 7.2 Agent Specifications

```yaml
agents:
  orchestrator:
    role: "Coordinator"
    model: "claude-sonnet-4-20250514"
    responsibilities:
      - Manage conversation flow
      - Delegate to specialist agents
      - Synthesize final recommendation
      - Handle user refinements

  intent_agent:
    role: "Intent Parser"
    model: "claude-haiku-4-5-20251001"  # Fast, cheap
    responsibilities:
      - Parse natural language into emotional state
      - Detect mood from voice/text cues
      - Identify constraints (time, audience)
      - Update user profile

  catalog_agent:
    role: "Content Searcher"
    responsibilities:
      - Query ruvector for similar content
      - Filter by availability on TV5MONDE
      - Retrieve metadata
    tools:
      - ruvector_search
      - watchmode_api
      - omdb_api

  trend_agent:
    role: "Trend Analyzer"
    responsibilities:
      - Fetch current trending data
      - Calculate trend scores
      - Identify "hot right now" content
    tools:
      - flixpatrol_api
      - reddit_api
      - news_api

  match_agent:
    role: "Recommendation Engine"
    model: "claude-haiku-4-5-20251001"
    responsibilities:
      - Compute user-content similarity
      - Apply trend boost
      - Rank candidates
      - Select top 3

  present_agent:
    role: "Response Formatter"
    model: "claude-sonnet-4-20250514"
    responsibilities:
      - Generate compelling descriptions
      - Create comparison view
      - Include deeplinks
      - Explain "why this matches you"
```

### 7.3 Complete System Flow

```
USER OPENS APP
      │
      ▼
┌───────────────────────────────┐
│  "Hey! How are you feeling    │
│   tonight?"                   │
└───────────────┬───────────────┘
                │
           User responds
                │
                ▼
┌─────────────────────────────────────────┐
│  "Give me a moment — analyzing          │
│   2,847 titles on TV5MONDE..."          │
│                                         │
│   ✓ Checked trending charts             │
│   ✓ Matched your taste profile          │
│   ✓ Found 3 perfect picks                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  🏆 YOUR PERFECT MATCH                   │
│  ┌─────────────────────────────────┐    │
│  │  [POSTER]  Le Sens de la Fête   │    │
│  │            94% match • 1h 57m    │    │
│  │            🔥 #3 Trending        │    │
│  │            ⭐ 7.4 IMDb            │    │
│  │                                  │    │
│  │  Light-hearted French comedy     │    │
│  │  with ensemble cast.             │    │
│  │                                  │    │
│  │  Why for you: Matches your love  │    │
│  │  of witty dialogue and feel-good │    │
│  │  endings. Perfect for unwinding. │    │
│  │                                  │    │
│  │  [▶ WATCH NOW ON TV5MONDE]       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Also great for tonight:                │
│  2. Intouchables (91% match)            │
│  3. Le Prénom (89% match)               │
│                                         │
│  💬 "Something else?" | 🎲 "Surprise me"│
└─────────────────────────────────────────┘
```

---

## 8. Data Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA PIPELINE (runs continuously)             │
└─────────────────────────────────────────────────────────────────┘

EVERY HOUR:
───────────
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Watchmode   │────▶│   Ingest     │────▶│   RuVector   │
│  API         │     │   Pipeline   │     │   (content)  │
│  (catalog)   │     │              │     │              │
└──────────────┘     │  • Embed     │     └──────────────┘
                     │  • Normalize │
┌──────────────┐     │  • Store     │     ┌──────────────┐
│  OMDb API    │────▶│              │────▶│   Metadata   │
│  (metadata)  │     └──────────────┘     │   DB         │
└──────────────┘                          └──────────────┘

EVERY 6 HOURS:
──────────────
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  FlixPatrol  │────▶│   Trend      │────▶│   Update     │
│  (charts)    │     │   Scoring    │     │   RuVector   │
├──────────────┤     │   Engine     │     │   metadata   │
│  Reddit API  │────▶│              │     │   (scores)   │
└──────────────┘     └──────────────┘     └──────────────┘

REAL-TIME (per user session):
─────────────────────────────
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Voice/ │────▶│   Intent     │────▶│   Query      │
│  Text Input  │     │   Agent      │     │   RuVector   │
├──────────────┤     │              │     │              │
│  User        │────▶│              │────▶│   Return     │
│  Profile     │     │              │     │   Top 3      │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 9. Implementation Recommendations

### 9.1 MVP Scope (3-Day Hackathon)

**Day 1: Foundation**
- ✅ TV5MONDE content catalog → emotional vectors in RuVector
- ✅ Basic trend scoring (FlixPatrol + OMDb)
- ✅ User emotional state schema

**Day 2: Agents**
- ✅ Claude-flow orchestrator + 3 core agents (Intent, Catalog, Match)
- ✅ Natural language input (text first, voice optional)
- ✅ Vector matching logic

**Day 3: Polish**
- ✅ Chat refinement flow
- ✅ Demo-ready UI (single screen)
- ✅ Deeplinks working

**What to Cut if Time is Short:**
- ❌ Reddit social buzz (use only FlixPatrol)
- ❌ Learning from viewing history (use static profile)
- ❌ Voice (stick with text input)
- ✅ **Keep:** Voice/Text → Emotional State → Match → Recommend

### 9.2 Technical Stack

```yaml
Vector Database:
  - RuVector (150x faster than alternatives)
  - 64-dimensional emotional vectors
  - Metadata filtering (runtime, platform, etc.)

AI/ML:
  - Claude Sonnet 4: Orchestration, synthesis, presentation
  - Claude Haiku 4.5: Fast intent extraction, matching

APIs:
  - Watchmode: Content catalog + availability
  - OMDb: Metadata, ratings, plots
  - FlixPatrol: Trending charts
  - (Optional) Reddit: Social buzz

Framework:
  - Claude-flow: Agent orchestration
  - Node.js/TypeScript: Backend
  - React/Next.js: Frontend (optional for demo)
```

### 9.3 Performance Targets

```
┌─────────────────────────────────────────────────────────────────┐
│                      PERFORMANCE METRICS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Flow:                                                      │
│  • App open → Recommendation shown: < 10 seconds                │
│  • Total user input time: 15-30 seconds                         │
│  • Time to start watching: < 60 seconds                         │
│                                                                  │
│  Backend:                                                        │
│  • Intent extraction: < 2 seconds (Claude Haiku)                │
│  • Vector search: < 100ms (RuVector)                            │
│  • Trend score calculation: < 50ms (cached)                     │
│  • Total recommendation: < 3 seconds                            │
│                                                                  │
│  Content Tagging:                                                │
│  • Cost: ~$0.01 per content item                                │
│  • Speed: ~2 seconds per item                                   │
│  • Catalog size: 1,000-5,000 items for TV5MONDE                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.4 Key Success Metrics

1. **Speed**: 60 seconds from open to watching (vs 45 minutes)
2. **Accuracy**: 85%+ user satisfaction with first recommendation
3. **Engagement**: 70%+ users accept recommendation vs refine
4. **Efficiency**: 95% reduction in decision time

---

## 10. The 20-Year Architecture

### 10.1 Separation of Concerns

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   INTERFACE LAYER (changes every 5 years)                       │
│   ─────────────────────────────────────                         │
│   2025: Tap/Voice on phone                                       │
│   2030: Gaze selection on AR glasses                            │
│   2035: Gesture in ambient room                                  │
│   2040: Neural interface thought detection                       │
│                                                                  │
│                         ↓                                        │
│                                                                  │
│   EMOTIONAL STATE VECTOR (timeless)                             │
│   ─────────────────────────────────                             │
│   {                                                              │
│     energy: 0.0 - 1.0,                                          │
│     valence: -1.0 - 1.0,                                        │
│     openness: 0.0 - 1.0,                                        │
│     needs: { comfort, escape, joy, ... }                        │
│   }                                                              │
│                                                                  │
│                         ↓                                        │
│                                                                  │
│   MATCHING ENGINE (evolves but core stays)                      │
│   ────────────────────────────────────────                      │
│   emotional_state_vector ↔ content_emotional_vector             │
│   + trending signals                                             │
│   + personal history                                             │
│   → Top recommendation                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Why This Lasts 20 Years

| Aspect | Why It's Timeless |
|--------|-------------------|
| **Emotional state as core** | Human emotions haven't changed in 10,000 years |
| **Context inference** | More sensors = better inference, same architecture |
| **Single input model** | Interface evolves, input stays "feeling" |
| **Vector matching** | Mathematical similarity works forever |
| **Confidence over choice** | "Here's what you need" beats "Here are 50 options" |
| **Override available** | Power users can refine, most won't need to |

---

## 11. Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│              TV5MONDE DISCOVERY SYSTEM SUMMARY                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USER INTERACTION:                                               │
│  • Natural language: "How are you feeling?"                     │
│  • Voice or text input                                           │
│  • ~15 seconds of input                                          │
│  • Chat for refinement                                           │
│                                                                  │
│  AGENT SWARM:                                                    │
│  • Orchestrator (Sonnet) - coordinates                          │
│  • Intent Agent (Haiku) - extracts emotional state              │
│  • Catalog Agent - searches RuVector                            │
│  • Trend Agent - fetches popularity                             │
│  • Match Agent (Haiku) - ranks candidates                       │
│  • Present Agent (Sonnet) - formats output                      │
│                                                                  │
│  DATA SOURCES:                                                   │
│  • Watchmode API → catalog + availability                       │
│  • OMDb API → metadata + ratings                                │
│  • FlixPatrol → trending charts                                 │
│  • (Optional) Reddit → social buzz                              │
│                                                                  │
│  MATCHING FORMULA:                                               │
│  score = similarity×0.6 + trending×0.25 + personal×0.15        │
│                                                                  │
│  VECTOR DIMENSIONS:                                              │
│  • User emotional state: 64 dimensions                          │
│  • Content emotional tags: 64 dimensions                        │
│  • Matching: Cosine similarity                                   │
│                                                                  │
│  OUTPUT:                                                         │
│  • Top pick + 2 alternates                                       │
│  • "Why this matches you" explanation                           │
│  • One-tap deeplink to TV5MONDE                                 │
│  • 60 seconds total from open to watching                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Key Insights

### Paradigm Shift
- **Old:** "What do you want to watch?" (cognitive burden)
- **New:** "How do you feel?" (natural, instant)

### Core Innovation
- Emotion → Content matching replaces preference → Content matching
- Feelings are universal and timeless; preferences change

### Technical Excellence
- 64-dimensional emotional vectors capture human experience
- Multi-signal tagging (plot + reviews + genre) ensures accuracy
- Vector similarity matching is fast (<100ms) and scalable

### User Experience
- 45 minutes → 60 seconds (98% time reduction)
- Natural conversation vs form interrogation
- Single confident recommendation vs analysis paralysis

### Future-Proof Design
- Interface changes (tap → voice → gaze → neural)
- Core emotional matching architecture remains constant
- Sensors improve → better emotional detection, same system

---

## References

**Source Material:**
- /home/evafive/agentic-pancakes/docs/initial/00_content_discovery_research.md

**Key Technologies:**
- RuVector: Vector database
- Claude Sonnet 4 & Haiku 4.5: AI agents
- Claude-flow: Agent orchestration
- Watchmode, OMDb, FlixPatrol: Content APIs

**Research Foundation:**
- Psychology of emotional decision-making
- Affective computing
- Recommendation system design
- Vector-based similarity matching

---

**End of Research Document**

**Next Steps:**
1. Prototype intent extraction agent with Claude
2. Build emotional tagging pipeline for TV5MONDE catalog
3. Implement RuVector storage and search
4. Create orchestrator agent for end-to-end flow
5. Test with real users and measure 60-second target
