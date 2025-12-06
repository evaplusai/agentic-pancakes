# User Style Vector Schema (64 Dimensions)

**Version:** 1.0.0
**Date:** 2025-12-06
**Author:** System Architecture Designer
**Purpose:** Complete specification for TV5MONDE user preference modeling

---

## Executive Summary

The User Style Vector is a 64-dimensional representation of viewer preferences, emotional state, and contextual needs. It enables semantic matching between user intent and TV5MONDE content through vector similarity search in AgentDB/Ruvector.

**Key Design Principles:**
1. **Dual-purpose dimensions**: Model both stable preferences AND session-specific state
2. **Interpretability**: Each dimension has clear semantic meaning
3. **Learnable**: Updates from implicit (viewing behavior) and explicit (user input) signals
4. **Cold-start resilient**: Sensible defaults enable immediate recommendations
5. **French content optimized**: Includes dimensions specific to Francophone content

---

## Table of Contents

1. [Vector Structure Overview](#vector-structure-overview)
2. [Dimension Groups](#dimension-groups)
3. [TypeScript Interface](#typescript-interface)
4. [Vector Operations](#vector-operations)
5. [Learning & Update Mechanisms](#learning--update-mechanisms)
6. [Similarity Computation](#similarity-computation)
7. [Cold Start Strategy](#cold-start-strategy)
8. [Implementation Notes](#implementation-notes)

---

## Vector Structure Overview

```
┌──────────────────────────────────────────────────────────┐
│           USER STYLE VECTOR (64 dimensions)              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [0-14]   Genre Affinities (15 dims)                    │
│           Stable preferences for content categories      │
│                                                          │
│  [15-24]  Mood & Tone Preferences (10 dims)             │
│           Emotional content characteristics              │
│                                                          │
│  [25-32]  Pacing & Structure (8 dims)                   │
│           Narrative rhythm and complexity                │
│                                                          │
│  [33-40]  Content Characteristics (8 dims)              │
│           Thematic elements and intensity                │
│                                                          │
│  [41-48]  French Content Specific (8 dims)              │
│           Francophone cultural dimensions                │
│                                                          │
│  [49-56]  Context Patterns (8 dims)                     │
│           Viewing situation preferences                  │
│                                                          │
│  [57-63]  Session Modifiers (7 dims)                    │
│           Real-time emotional state and needs            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Dimension Groups

### Group 1: Genre Affinities [0-14] (15 dimensions)

**Purpose:** Stable preferences for content categories and storytelling styles.

| Dimension | Name | Range | Default | Description | Learning Source |
|-----------|------|-------|---------|-------------|-----------------|
| 0 | `comedy_affinity` | 0.0-1.0 | 0.5 | Preference for comedic content | Watch completion, explicit ratings, "laughed" voice cues |
| 1 | `drama_affinity` | 0.0-1.0 | 0.5 | Preference for dramatic narratives | Watch time, re-watches, emotional engagement |
| 2 | `romance_affinity` | 0.0-1.0 | 0.5 | Preference for romantic content | Genre selection history, date context |
| 3 | `thriller_affinity` | 0.0-1.0 | 0.5 | Preference for suspense/mystery | Watch during high-attention contexts |
| 4 | `action_affinity` | 0.0-1.0 | 0.5 | Preference for action/adventure | High-energy viewing sessions |
| 5 | `documentary_affinity` | 0.0-1.0 | 0.5 | Preference for factual content | Learning-oriented viewing patterns |
| 6 | `fantasy_affinity` | 0.0-1.0 | 0.5 | Preference for fantasy/sci-fi | Escapism need correlation |
| 7 | `horror_affinity` | 0.0-1.0 | 0.3 | Preference for horror (lower default) | Explicit selection, night viewing |
| 8 | `animation_affinity` | 0.0-1.0 | 0.4 | Preference for animated content | Family context, art style appreciation |
| 9 | `biographical_affinity` | 0.0-1.0 | 0.5 | Preference for true stories | Growth-seeking viewing patterns |
| 10 | `musical_affinity` | 0.0-1.0 | 0.4 | Preference for musicals | Music engagement, emotional uplift |
| 11 | `crime_affinity` | 0.0-1.0 | 0.5 | Preference for crime/detective | Problem-solving engagement |
| 12 | `family_affinity` | 0.0-1.0 | 0.5 | Preference for family-oriented | Social viewing context |
| 13 | `historical_affinity` | 0.0-1.0 | 0.5 | Preference for period pieces | Cultural depth appreciation |
| 14 | `artfilm_affinity` | 0.0-1.0 | 0.4 | Preference for arthouse cinema | Complexity tolerance, repeated viewings |

**Update Frequency:** Slow decay (weeks to months)
**Impact on Matching:** High (30% weight in similarity)

---

### Group 2: Mood & Tone Preferences [15-24] (10 dimensions)

**Purpose:** Emotional qualities user seeks in content.

| Dimension | Name | Range | Default | Description | Learning Source |
|-----------|------|-------|---------|-------------|-----------------|
| 15 | `valence_preference` | -1.0 to 1.0 | 0.2 | Preferred emotional tone (negative=dark, positive=uplifting) | Completion rates by content valence |
| 16 | `humor_level_preference` | 0.0-1.0 | 0.6 | Desired amount of comedy | Comedy genre affinity + laugh detection |
| 17 | `warmth_preference` | 0.0-1.0 | 0.7 | Desire for heartwarming content | Comfort-seeking behavior |
| 18 | `tension_tolerance` | 0.0-1.0 | 0.5 | Comfort with suspense/stress | Thriller completion vs abandonment |
| 19 | `darkness_tolerance` | 0.0-1.0 | 0.4 | Comfort with heavy/tragic themes | Night vs day viewing patterns |
| 20 | `cynicism_preference` | 0.0-1.0 | 0.3 | Preference for cynical vs optimistic | Correlation with mood state |
| 21 | `nostalgia_seeking` | 0.0-1.0 | 0.5 | Desire for nostalgic content | Rewatch behavior, era preferences |
| 22 | `quirky_preference` | 0.0-1.0 | 0.5 | Attraction to unconventional content | Indie film engagement |
| 23 | `bittersweet_tolerance` | 0.0-1.0 | 0.5 | Comfort with mixed emotions | Drama completion patterns |
| 24 | `intensity_preference` | 0.0-1.0 | 0.5 | Desired emotional intensity | Energy state correlation |

**Update Frequency:** Medium decay (days to weeks)
**Impact on Matching:** High (25% weight in similarity)

---

### Group 3: Pacing & Structure [25-32] (8 dimensions)

**Purpose:** Preferences for narrative rhythm and storytelling complexity.

| Dimension | Name | Range | Default | Description | Learning Source |
|-----------|------|-------|---------|-------------|-----------------|
| 25 | `pacing_preference` | 0.0-1.0 | 0.5 | Preferred speed (0=slow/meditative, 1=fast/kinetic) | Energy level during viewing |
| 26 | `cognitive_load_tolerance` | 0.0-1.0 | 0.6 | Comfort with complex plots | Time of day, energy state |
| 27 | `attention_budget` | 0.0-1.0 | 0.6 | Available focus capacity | Session context, device |
| 28 | `plot_complexity_preference` | 0.0-1.0 | 0.5 | Desired narrative complexity | Rewatch patterns, pause behavior |
| 29 | `nonlinear_tolerance` | 0.0-1.0 | 0.5 | Comfort with non-chronological storytelling | Artfilm affinity correlation |
| 30 | `ensemble_preference` | 0.0-1.0 | 0.5 | Preference for multi-character vs single protagonist | Drama type completion |
| 31 | `dialogue_density_preference` | 0.0-1.0 | 0.6 | Desired amount of dialogue vs visual | Language complexity tolerance |
| 32 | `arc_preference` | 0.0-1.0 | 0.5 | Preference for clear arcs (0=episodic, 1=journey) | Series vs film behavior |

**Update Frequency:** Medium decay (days to weeks)
**Impact on Matching:** Medium (15% weight in similarity)

---

### Group 4: Content Characteristics [33-40] (8 dimensions)

**Purpose:** Thematic elements and content intensity preferences.

| Dimension | Name | Range | Default | Description | Learning Source |
|-----------|------|-------|---------|-------------|-----------------|
| 33 | `violence_tolerance` | 0.0-1.0 | 0.4 | Comfort with violence/action intensity | Action genre + family context |
| 34 | `romance_level_preference` | 0.0-1.0 | 0.5 | Desired amount of romantic content | Romance affinity + date context |
| 35 | `sexual_content_tolerance` | 0.0-1.0 | 0.5 | Comfort with sexual content | Solo vs social viewing |
| 36 | `language_tolerance` | 0.0-1.0 | 0.7 | Comfort with profanity | Age, family context |
| 37 | `substance_tolerance` | 0.0-1.0 | 0.6 | Comfort with drug/alcohol themes | Content warnings ignored |
| 38 | `death_sensitivity` | 0.0-1.0 | 0.5 | Sensitivity to death/loss themes | Emotional state, life events |
| 39 | `social_commentary_interest` | 0.0-1.0 | 0.5 | Interest in political/social themes | Documentary affinity |
| 40 | `spiritual_interest` | 0.0-1.0 | 0.5 | Interest in spiritual/philosophical themes | Thoughtful content engagement |

**Update Frequency:** Slow decay (weeks to months)
**Impact on Matching:** Medium (15% weight in similarity)

---

### Group 5: French Content Specific [41-48] (8 dimensions)

**Purpose:** Dimensions unique to Francophone content discovery on TV5MONDE.

| Dimension | Name | Range | Default | Description | Learning Source |
|-----------|------|-------|---------|-------------|-----------------|
| 41 | `french_language_proficiency` | 0.0-1.0 | 0.5 | French comprehension level (0=beginner, 1=native) | Subtitle usage, dialogue density choices |
| 42 | `subtitle_preference` | 0.0-1.0 | 0.5 | Preference for subtitles (0=none, 1=always) | Explicit settings, language level |
| 43 | `cultural_depth_interest` | 0.0-1.0 | 0.6 | Interest in French cultural references | Historical/cultural content engagement |
| 44 | `accent_diversity_comfort` | 0.0-1.0 | 0.5 | Comfort with regional French accents | Québécois, African, Belgian content |
| 45 | `francophone_region_preference` | 0.0-1.0 | 0.5 | Interest in non-French Francophone content | Geographic diversity in viewing |
| 46 | `language_learning_mode` | 0.0-1.0 | 0.3 | Using content for language learning | Rewatch, pause behavior |
| 47 | `cultural_authenticity_preference` | 0.0-1.0 | 0.7 | Preference for authentically French vs international | French production vs dubbing |
| 48 | `wordplay_appreciation` | 0.0-1.0 | 0.5 | Appreciation for linguistic humor | Comedy affinity + language proficiency |

**Update Frequency:** Slow decay (months)
**Impact on Matching:** High for TV5MONDE (20% weight)

---

### Group 6: Context Patterns [49-56] (8 dimensions)

**Purpose:** Learned preferences for different viewing situations.

| Dimension | Name | Range | Default | Description | Learning Source |
|-----------|------|-------|---------|-------------|-----------------|
| 49 | `solo_viewing_preference` | 0.0-1.0 | 0.5 | Content preferred when alone | Viewing context history |
| 50 | `social_viewing_preference` | 0.0-1.0 | 0.5 | Content preferred with others | Social context patterns |
| 51 | `date_night_preference` | 0.0-1.0 | 0.5 | Content preferred for romantic contexts | Date tag correlation |
| 52 | `family_viewing_preference` | 0.0-1.0 | 0.5 | Content preferred with family | Family context patterns |
| 53 | `weeknight_preference` | 0.0-1.0 | 0.5 | Content preferred on weeknights | Temporal patterns |
| 54 | `weekend_preference` | 0.0-1.0 | 0.6 | Content preferred on weekends | Temporal patterns |
| 55 | `rainy_day_preference` | 0.0-1.0 | 0.6 | Content preferred in cozy weather | Weather correlation |
| 56 | `background_tolerance` | 0.0-1.0 | 0.3 | Content suitable for partial attention | Device, multitasking behavior |

**Update Frequency:** Medium decay (weeks)
**Impact on Matching:** Context-dependent (10% base weight, up to 25% when context matches)

---

### Group 7: Session Modifiers [57-63] (7 dimensions)

**Purpose:** Real-time state during current search session. HIGH volatility.

| Dimension | Name | Range | Default | Description | Learning Source |
|-----------|------|-------|---------|-------------|-----------------|
| 57 | `current_energy_level` | 0.0-1.0 | 0.6 | Energy right now (0=exhausted, 1=energized) | Voice analysis, text cues, time of day |
| 58 | `current_valence` | -1.0 to 1.0 | 0.0 | Mood right now (negative=sad, positive=happy) | Voice tone, word choice, context |
| 59 | `arousal_level` | 0.0-1.0 | 0.5 | Emotional arousal (0=calm, 1=excited/anxious) | Voice energy, speech rate |
| 60 | `comfort_need` | 0.0-1.0 | 0.5 | Need for comfort/safety right now | "tired", "rough day" cues |
| 61 | `escape_need` | 0.0-1.0 | 0.5 | Need to escape/distract right now | "want to forget", "transport me" |
| 62 | `stimulation_need` | 0.0-1.0 | 0.5 | Need for excitement/engagement | "bored", "restless" cues |
| 63 | `connection_need` | 0.0-1.0 | 0.5 | Need to feel understood/less alone | "lonely", "isolated" cues |

**Update Frequency:** Per-session only (reset after interaction)
**Impact on Matching:** Very high in current session (30% weight), zero in future sessions

---

## TypeScript Interface

```typescript
/**
 * User Style Vector - 64-dimensional preference model
 * Combines stable preferences with real-time session state
 */
export interface UserStyleVector {
  // === METADATA ===
  userId: string;
  version: string; // Schema version
  lastUpdated: Date;
  totalWatchTime: number; // Total minutes watched (for confidence weighting)

  // === VECTOR DATA (64 dimensions) ===
  vector: Float32Array; // Typed array for performance

  // === HUMAN-READABLE STRUCTURE ===
  // (Mapped from vector for API/debugging)

  /** Group 1: Genre Affinities [0-14] */
  genres: {
    comedy: number;           // [0]
    drama: number;            // [1]
    romance: number;          // [2]
    thriller: number;         // [3]
    action: number;           // [4]
    documentary: number;      // [5]
    fantasy: number;          // [6]
    horror: number;           // [7]
    animation: number;        // [8]
    biographical: number;     // [9]
    musical: number;          // [10]
    crime: number;            // [11]
    family: number;           // [12]
    historical: number;       // [13]
    artfilm: number;          // [14]
  };

  /** Group 2: Mood & Tone Preferences [15-24] */
  mood: {
    valencePreference: number;      // [15] -1 to 1
    humorLevel: number;             // [16]
    warmth: number;                 // [17]
    tensionTolerance: number;       // [18]
    darknessTolerance: number;      // [19]
    cynicism: number;               // [20]
    nostalgiaSeeking: number;       // [21]
    quirkyPreference: number;       // [22]
    bittersweetTolerance: number;   // [23]
    intensity: number;              // [24]
  };

  /** Group 3: Pacing & Structure [25-32] */
  structure: {
    pacingPreference: number;       // [25] 0=slow, 1=fast
    cognitiveLoad: number;          // [26]
    attentionBudget: number;        // [27]
    plotComplexity: number;         // [28]
    nonlinearTolerance: number;     // [29]
    ensemblePreference: number;     // [30]
    dialogueDensity: number;        // [31]
    arcPreference: number;          // [32]
  };

  /** Group 4: Content Characteristics [33-40] */
  characteristics: {
    violenceTolerance: number;      // [33]
    romanceLevel: number;           // [34]
    sexualContentTolerance: number; // [35]
    languageTolerance: number;      // [36]
    substanceTolerance: number;     // [37]
    deathSensitivity: number;       // [38]
    socialCommentary: number;       // [39]
    spiritualInterest: number;      // [40]
  };

  /** Group 5: French Content Specific [41-48] */
  french: {
    languageProficiency: number;    // [41] 0=beginner, 1=native
    subtitlePreference: number;     // [42]
    culturalDepthInterest: number;  // [43]
    accentDiversityComfort: number; // [44]
    regionPreference: number;       // [45]
    languageLearningMode: number;   // [46]
    culturalAuthenticity: number;   // [47]
    wordplayAppreciation: number;   // [48]
  };

  /** Group 6: Context Patterns [49-56] */
  context: {
    soloViewing: number;            // [49]
    socialViewing: number;          // [50]
    dateNight: number;              // [51]
    familyViewing: number;          // [52]
    weeknight: number;              // [53]
    weekend: number;                // [54]
    rainyDay: number;               // [55]
    backgroundTolerance: number;    // [56]
  };

  /** Group 7: Session Modifiers [57-63] - VOLATILE */
  session: {
    currentEnergy: number;          // [57]
    currentValence: number;         // [58] -1 to 1
    arousal: number;                // [59]
    comfortNeed: number;            // [60]
    escapeNeed: number;             // [61]
    stimulationNeed: number;        // [62]
    connectionNeed: number;         // [63]
  };
}

/**
 * Content Vector - matching structure for TV5MONDE content
 * Same 64 dimensions as UserStyleVector for direct similarity computation
 */
export interface ContentVector {
  contentId: string;
  title: string;
  vector: Float32Array; // Same 64-dim structure

  // Metadata for filtering
  platform: 'tv5monde';
  runtime: number;
  releaseYear: number;
  tv5mondeUrl: string;

  // Tag confidence
  confidenceScore: number; // 0.0-1.0
  taggedAt: Date;
}

/**
 * Session Context - used to extract session modifiers [57-63]
 */
export interface SessionContext {
  // User input
  textInput?: string;
  voiceAudio?: ArrayBuffer;

  // Ambient context
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  weather?: 'sunny' | 'rainy' | 'cloudy' | 'snowy';
  device: 'mobile' | 'tablet' | 'desktop' | 'tv';

  // Social context
  viewingMode: 'solo' | 'date' | 'family' | 'friends';

  // Voice features (if available)
  voiceFeatures?: {
    energy: number;       // 0.0-1.0
    pitch: number;        // 0.0-1.0
    speechRate: number;   // 0.0-1.0
    sighs: boolean;
    laughter: boolean;
  };
}

/**
 * Vector update signals - what causes vector to change
 */
export interface VectorUpdateSignal {
  signalType:
    | 'watch_start'
    | 'watch_complete'
    | 'watch_abandon'
    | 'explicit_rating'
    | 'skip_intro'
    | 'rewatch'
    | 'share'
    | 'save_to_list'
    | 'voice_input'
    | 'explicit_preference';

  contentId: string;
  contentVector: Float32Array;

  // Signal strength
  weight: number; // 0.0-1.0 (completion=1.0, abandon=0.3, etc)

  // Signal metadata
  timestamp: Date;
  watchDuration?: number;
  totalRuntime?: number;
  userContext?: SessionContext;
}
```

---

## Vector Operations

### 1. User-Content Similarity Computation

```typescript
/**
 * Compute similarity between user vector and content vector
 * Uses weighted cosine similarity with group-specific weights
 */
function computeSimilarity(
  userVector: UserStyleVector,
  contentVector: ContentVector,
  sessionContext: SessionContext
): number {
  // Extract raw vectors
  const U = userVector.vector; // 64 dims
  const C = contentVector.vector; // 64 dims

  // === WEIGHTED COSINE SIMILARITY ===
  // Different dimension groups have different importance

  const weights = {
    genres: 0.30,           // [0-14] High importance for stable preferences
    mood: 0.25,             // [15-24] High importance for emotional fit
    structure: 0.15,        // [25-32] Medium importance
    characteristics: 0.15,  // [33-40] Medium importance
    french: 0.20,           // [41-48] High for TV5MONDE
    context: 0.10,          // [49-56] Variable (see below)
    session: 0.30,          // [57-63] Very high during active session
  };

  // === CONTEXT BOOST ===
  // Increase context weight if session context matches learned patterns
  if (sessionContext.viewingMode === 'date' && userVector.context.dateNight > 0.7) {
    weights.context = 0.25; // Boost from 0.10 to 0.25
    weights.genres -= 0.05;
    weights.mood -= 0.05;
    weights.structure -= 0.05;
  }

  // === DIMENSION GROUP SIMILARITIES ===
  const genreSim = cosineSimilarity(U.slice(0, 15), C.slice(0, 15));
  const moodSim = cosineSimilarity(U.slice(15, 25), C.slice(15, 25));
  const structureSim = cosineSimilarity(U.slice(25, 33), C.slice(25, 33));
  const charSim = cosineSimilarity(U.slice(33, 41), C.slice(33, 41));
  const frenchSim = cosineSimilarity(U.slice(41, 49), C.slice(41, 49));
  const contextSim = cosineSimilarity(U.slice(49, 57), C.slice(49, 57));
  const sessionSim = cosineSimilarity(U.slice(57, 64), C.slice(57, 64));

  // === WEIGHTED COMBINATION ===
  const similarity =
    genreSim * weights.genres +
    moodSim * weights.mood +
    structureSim * weights.structure +
    charSim * weights.characteristics +
    frenchSim * weights.french +
    contextSim * weights.context +
    sessionSim * weights.session;

  return similarity; // 0.0-1.0
}

/**
 * Standard cosine similarity for vector slices
 */
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

### 2. Session Modifier Application

```typescript
/**
 * Extract session modifiers [57-63] from user input and context
 * This updates the volatile session dimensions in real-time
 */
async function extractSessionModifiers(
  textInput: string,
  voiceAudio: ArrayBuffer | undefined,
  context: SessionContext
): Promise<Partial<UserStyleVector['session']>> {

  // === 1. TEXT ANALYSIS ===
  const textSignals = await analyzeTextIntent(textInput);
  // Returns: { energy, valence, needs: {...} }

  // === 2. VOICE ANALYSIS (if available) ===
  let voiceSignals = null;
  if (voiceAudio) {
    voiceSignals = await analyzeVoiceFeatures(voiceAudio);
    // Returns: { energy, pitch, speechRate, sighs, laughter }
  }

  // === 3. COMBINE SIGNALS ===
  const session = {
    // Energy: combine text + voice + time of day
    currentEnergy: combineSignals([
      { value: textSignals.energy, weight: 0.5 },
      { value: voiceSignals?.energy || 0.5, weight: voiceSignals ? 0.3 : 0 },
      { value: timeOfDayEnergy(context.timeOfDay), weight: 0.2 },
    ]),

    // Valence: text is primary signal
    currentValence: textSignals.valence, // -1 to 1

    // Arousal: voice energy + speech rate
    arousal: voiceSignals
      ? (voiceSignals.energy + voiceSignals.speechRate) / 2
      : textSignals.energy,

    // Needs: extracted from text intent
    comfortNeed: textSignals.needs.comfort || 0.5,
    escapeNeed: textSignals.needs.escape || 0.5,
    stimulationNeed: textSignals.needs.stimulation || 0.5,
    connectionNeed: textSignals.needs.connection || 0.5,
  };

  return session;
}

/**
 * Apply session modifiers to base user vector
 */
function applySessionModifiers(
  baseVector: UserStyleVector,
  sessionModifiers: Partial<UserStyleVector['session']>
): UserStyleVector {

  // Clone base vector
  const sessionVector = { ...baseVector };

  // Update session dimensions [57-63]
  sessionVector.session = {
    ...baseVector.session,
    ...sessionModifiers,
  };

  // Update vector array
  sessionVector.vector = new Float32Array(64);
  sessionVector.vector.set(baseVector.vector); // Copy base

  // Overwrite session dimensions
  sessionVector.vector[57] = sessionVector.session.currentEnergy;
  sessionVector.vector[58] = (sessionVector.session.currentValence + 1) / 2; // Normalize -1..1 to 0..1
  sessionVector.vector[59] = sessionVector.session.arousal;
  sessionVector.vector[60] = sessionVector.session.comfortNeed;
  sessionVector.vector[61] = sessionVector.session.escapeNeed;
  sessionVector.vector[62] = sessionVector.session.stimulationNeed;
  sessionVector.vector[63] = sessionVector.session.connectionNeed;

  return sessionVector;
}
```

### 3. Vector Update from Viewing History

```typescript
/**
 * Update user vector based on viewing behavior
 * Uses exponential moving average with signal-specific learning rates
 */
function updateVectorFromSignal(
  currentVector: UserStyleVector,
  signal: VectorUpdateSignal
): UserStyleVector {

  // === LEARNING RATES BY DIMENSION GROUP ===
  // How quickly each group adapts to new signals
  const learningRates = {
    genres: 0.05,           // [0-14] Slow: stable preferences
    mood: 0.10,             // [15-24] Medium: evolves over weeks
    structure: 0.10,        // [25-32] Medium
    characteristics: 0.05,  // [33-40] Slow: stable tolerances
    french: 0.03,           // [41-48] Very slow: language level changes slowly
    context: 0.15,          // [49-56] Fast: situational patterns
    // session: not updated (per-session only)
  };

  // === SIGNAL STRENGTH MODIFIERS ===
  // Different actions have different confidence levels
  const signalStrengths = {
    'watch_complete': 1.0,      // Strong positive signal
    'rewatch': 1.2,             // Extra strong (loved it enough to rewatch)
    'explicit_rating': 1.5,     // Very strong (explicit feedback)
    'watch_abandon': 0.5,       // Medium negative signal
    'skip_intro': 0.2,          // Weak signal (might be impatient, not dislike)
    'save_to_list': 0.8,        // Strong interest signal
    'share': 0.9,               // Strong positive signal
  };

  const strength = signalStrengths[signal.signalType] * signal.weight;

  // === UPDATE EACH DIMENSION GROUP ===
  const updated = new Float32Array(64);

  // Genres [0-14]
  for (let i = 0; i < 15; i++) {
    const learningRate = learningRates.genres * strength;
    updated[i] = currentVector.vector[i] * (1 - learningRate) +
                 signal.contentVector[i] * learningRate;
  }

  // Mood [15-24]
  for (let i = 15; i < 25; i++) {
    const learningRate = learningRates.mood * strength;
    updated[i] = currentVector.vector[i] * (1 - learningRate) +
                 signal.contentVector[i] * learningRate;
  }

  // Structure [25-32]
  for (let i = 25; i < 33; i++) {
    const learningRate = learningRates.structure * strength;
    updated[i] = currentVector.vector[i] * (1 - learningRate) +
                 signal.contentVector[i] * learningRate;
  }

  // Characteristics [33-40]
  for (let i = 33; i < 41; i++) {
    const learningRate = learningRates.characteristics * strength;
    updated[i] = currentVector.vector[i] * (1 - learningRate) +
                 signal.contentVector[i] * learningRate;
  }

  // French [41-48]
  for (let i = 41; i < 49; i++) {
    const learningRate = learningRates.french * strength;
    updated[i] = currentVector.vector[i] * (1 - learningRate) +
                 signal.contentVector[i] * learningRate;
  }

  // Context [49-56]
  for (let i = 49; i < 57; i++) {
    const learningRate = learningRates.context * strength;
    updated[i] = currentVector.vector[i] * (1 - learningRate) +
                 signal.contentVector[i] * learningRate;
  }

  // Session [57-63] - NOT UPDATED (per-session only)
  for (let i = 57; i < 64; i++) {
    updated[i] = currentVector.vector[i]; // Keep current
  }

  // === NORMALIZATION ===
  // Ensure values stay in valid ranges
  for (let i = 0; i < 64; i++) {
    if (i === 15 || i === 58) {
      // Valence dimensions: -1 to 1 range
      updated[i] = Math.max(-1, Math.min(1, updated[i]));
    } else {
      // All other dimensions: 0 to 1 range
      updated[i] = Math.max(0, Math.min(1, updated[i]));
    }
  }

  // Return updated vector
  return {
    ...currentVector,
    vector: updated,
    lastUpdated: new Date(),
    totalWatchTime: currentVector.totalWatchTime + (signal.watchDuration || 0),
  };
}
```

---

## Similarity Computation

### Distance Metric: Weighted Cosine Similarity

**Why weighted cosine?**
1. **Magnitude invariance**: Don't penalize users with less extreme preferences
2. **Interpretable**: 1.0 = perfect match, 0.0 = orthogonal, -1.0 = opposite
3. **Efficient**: Single dot product + norms
4. **Weights**: Allow prioritizing dimensions (session state > stable preferences)

### Alternative Metrics Considered

| Metric | Pros | Cons | Verdict |
|--------|------|------|---------|
| Euclidean distance | Simple, intuitive | Penalizes magnitude differences | ❌ Rejected |
| Manhattan distance | Fast, robust | Not ideal for high-dim | ❌ Rejected |
| Weighted cosine | Efficient, flexible, interpretable | Requires tuning weights | ✅ **Selected** |
| Learned metric (neural) | Optimal for data | Requires training data | 🔄 Future enhancement |

### Similarity Formula

```
similarity(U, C) = Σ(weight_i × cosine(U_group_i, C_group_i))

where:
  U = user vector (64 dims)
  C = content vector (64 dims)
  group_i = dimension group (genres, mood, etc.)
  weight_i = importance weight for group_i

Σ weights = 1.0 (normalized)
```

---

## Learning & Update Mechanisms

### Signal Types & Learning Rates

```typescript
const LEARNING_CONFIG = {
  // === IMPLICIT SIGNALS ===
  'watch_complete': {
    strength: 1.0,
    confidence: 0.9,
    note: 'Watched entire content - strong positive signal'
  },

  'watch_abandon': {
    strength: 0.5,
    confidence: 0.6,
    note: 'Abandoned early - medium negative signal (might be external reason)'
  },

  'rewatch': {
    strength: 1.2,
    confidence: 0.95,
    note: 'Rewatched content - very strong positive signal'
  },

  'skip_intro': {
    strength: 0.2,
    confidence: 0.3,
    note: 'Skipped intro - weak signal (impatience, not necessarily dislike)'
  },

  'save_to_list': {
    strength: 0.8,
    confidence: 0.85,
    note: 'Saved for later - strong interest signal'
  },

  'share': {
    strength: 0.9,
    confidence: 0.9,
    note: 'Shared with others - strong positive + social signal'
  },

  // === EXPLICIT SIGNALS ===
  'explicit_rating': {
    strength: 1.5,
    confidence: 0.98,
    note: 'User explicitly rated - very strong signal'
  },

  'explicit_preference': {
    strength: 2.0,
    confidence: 1.0,
    note: 'User explicitly stated preference - strongest signal'
  },

  'voice_input': {
    strength: 1.3,
    confidence: 0.85,
    note: 'Voice input analyzed - strong contextual signal'
  },
};
```

### Update Frequency & Decay

```typescript
/**
 * Vector dimensions decay over time (regression to mean)
 * Represents changing tastes and prevents over-fitting to recent behavior
 */
const DECAY_CONFIG = {
  // === SLOW DECAY (Stable preferences) ===
  genres: {
    halfLife: 90, // days - takes 90 days to decay 50% toward mean
    decayTarget: 0.5, // Decay toward neutral preference
  },

  characteristics: {
    halfLife: 120, // days - very stable tolerances
    decayTarget: 0.5,
  },

  french: {
    halfLife: 180, // days - language level changes very slowly
    decayTarget: 0.5,
  },

  // === MEDIUM DECAY (Evolving preferences) ===
  mood: {
    halfLife: 30, // days - mood preferences change monthly
    decayTarget: 0.5,
  },

  structure: {
    halfLife: 45, // days
    decayTarget: 0.5,
  },

  // === FAST DECAY (Contextual patterns) ===
  context: {
    halfLife: 14, // days - context preferences change quickly
    decayTarget: 0.5,
  },

  // === NO DECAY (Session state) ===
  session: {
    halfLife: 0, // Reset every session
    decayTarget: 0.5,
  },
};

/**
 * Apply exponential decay to vector dimensions
 */
function applyDecay(vector: UserStyleVector, daysSinceUpdate: number): UserStyleVector {
  const decayed = new Float32Array(64);

  for (let i = 0; i < 64; i++) {
    const group = getDimensionGroup(i);
    const config = DECAY_CONFIG[group];

    if (config.halfLife === 0) {
      // No decay (session variables)
      decayed[i] = vector.vector[i];
    } else {
      // Exponential decay toward target
      const decayFactor = Math.pow(0.5, daysSinceUpdate / config.halfLife);
      decayed[i] = vector.vector[i] * decayFactor +
                   config.decayTarget * (1 - decayFactor);
    }
  }

  return { ...vector, vector: decayed };
}
```

---

## Cold Start Strategy

### New User Initialization

```typescript
/**
 * Initialize vector for new user
 * Uses sensible defaults + optional onboarding quiz
 */
function initializeNewUserVector(
  onboardingAnswers?: OnboardingQuiz
): UserStyleVector {

  // === DEFAULT VECTOR ===
  const defaultVector = new Float32Array(64);

  // Genres [0-14] - neutral preferences
  for (let i = 0; i < 15; i++) {
    defaultVector[i] = 0.5;
  }

  // Mood [15-24] - slightly positive bias
  defaultVector[15] = 0.2;  // valencePreference: slightly uplifting
  defaultVector[16] = 0.6;  // humorLevel: moderate comedy preference
  defaultVector[17] = 0.7;  // warmth: prefer warm content
  defaultVector[18] = 0.5;  // tensionTolerance: neutral
  defaultVector[19] = 0.4;  // darknessTolerance: slightly lower
  defaultVector[20] = 0.3;  // cynicism: prefer optimistic
  defaultVector[21] = 0.5;  // nostalgia: neutral
  defaultVector[22] = 0.5;  // quirky: neutral
  defaultVector[23] = 0.5;  // bittersweet: neutral
  defaultVector[24] = 0.5;  // intensity: neutral

  // Structure [25-32] - moderate defaults
  for (let i = 25; i < 33; i++) {
    defaultVector[i] = 0.5;
  }
  defaultVector[26] = 0.6;  // cognitiveLoad: slightly higher (assume engaged viewers)

  // Characteristics [33-40] - moderate tolerances
  for (let i = 33; i < 41; i++) {
    defaultVector[i] = 0.5;
  }
  defaultVector[33] = 0.4;  // violence: slightly lower default
  defaultVector[35] = 0.5;  // sexual: neutral
  defaultVector[38] = 0.5;  // death: neutral

  // French [41-48] - assume learning French
  defaultVector[41] = 0.5;  // languageProficiency: intermediate
  defaultVector[42] = 0.7;  // subtitlePreference: prefer subtitles
  defaultVector[43] = 0.6;  // culturalDepth: interested in culture
  defaultVector[44] = 0.5;  // accentDiversity: neutral
  defaultVector[45] = 0.5;  // regionPreference: neutral
  defaultVector[46] = 0.5;  // languageLearning: maybe
  defaultVector[47] = 0.7;  // culturalAuthenticity: prefer authentic
  defaultVector[48] = 0.5;  // wordplay: neutral

  // Context [49-56] - neutral patterns (will learn quickly)
  for (let i = 49; i < 57; i++) {
    defaultVector[i] = 0.5;
  }

  // Session [57-63] - neutral state
  defaultVector[57] = 0.6;  // currentEnergy: slightly energized
  defaultVector[58] = 0.5;  // currentValence: neutral (normalized from 0)
  defaultVector[59] = 0.5;  // arousal: neutral
  defaultVector[60] = 0.5;  // comfortNeed: neutral
  defaultVector[61] = 0.5;  // escapeNeed: neutral
  defaultVector[62] = 0.5;  // stimulationNeed: neutral
  defaultVector[63] = 0.5;  // connectionNeed: neutral

  // === APPLY ONBOARDING QUIZ (if provided) ===
  if (onboardingAnswers) {
    applyOnboardingAnswers(defaultVector, onboardingAnswers);
  }

  return {
    userId: generateUserId(),
    version: '1.0.0',
    lastUpdated: new Date(),
    totalWatchTime: 0,
    vector: defaultVector,
    // ... (map to human-readable structure)
  };
}

/**
 * Optional onboarding quiz to bootstrap preferences
 */
interface OnboardingQuiz {
  // "What genres do you enjoy?" (multi-select)
  genres?: string[];

  // "How do you want to feel after watching?" (select one)
  desiredFeeling?: 'energized' | 'peaceful' | 'thoughtful' | 'joyful';

  // "How much French do you understand?" (slider)
  frenchLevel?: 'beginner' | 'intermediate' | 'advanced' | 'native';

  // "Do you prefer fast-paced or slow-paced content?" (slider)
  pacing?: number; // 0.0-1.0

  // "Are you comfortable with dark/heavy themes?" (yes/no)
  darkThemesOk?: boolean;
}

/**
 * Bootstrap vector from onboarding answers
 */
function applyOnboardingAnswers(
  vector: Float32Array,
  answers: OnboardingQuiz
): void {

  // Apply genre selections
  if (answers.genres) {
    const genreMap = {
      'comedy': 0, 'drama': 1, 'romance': 2, 'thriller': 3,
      'action': 4, 'documentary': 5, 'fantasy': 6, 'horror': 7,
      'animation': 8, 'biographical': 9, 'musical': 10, 'crime': 11,
      'family': 12, 'historical': 13, 'artfilm': 14,
    };

    // Boost selected genres to 0.8, reduce others to 0.3
    for (let i = 0; i < 15; i++) {
      vector[i] = 0.3;
    }
    answers.genres.forEach(genre => {
      const idx = genreMap[genre.toLowerCase()];
      if (idx !== undefined) {
        vector[idx] = 0.8;
      }
    });
  }

  // Apply desired feeling
  if (answers.desiredFeeling) {
    const feelingMap = {
      'energized': { valence: 0.6, intensity: 0.7, pacing: 0.7 },
      'peaceful': { valence: 0.4, intensity: 0.3, pacing: 0.3, warmth: 0.8 },
      'thoughtful': { valence: 0.3, plotComplexity: 0.7, cognitiveLoad: 0.7 },
      'joyful': { valence: 0.8, humor: 0.8, warmth: 0.8 },
    };

    const values = feelingMap[answers.desiredFeeling];
    if (values.valence) vector[15] = values.valence;
    if (values.intensity) vector[24] = values.intensity;
    if (values.pacing) vector[25] = values.pacing;
    if (values.warmth) vector[17] = values.warmth;
    if (values.plotComplexity) vector[28] = values.plotComplexity;
    if (values.cognitiveLoad) vector[26] = values.cognitiveLoad;
    if (values.humor) vector[16] = values.humor;
  }

  // Apply French level
  if (answers.frenchLevel) {
    const levelMap = {
      'beginner': { proficiency: 0.2, subtitles: 0.95, learning: 0.8 },
      'intermediate': { proficiency: 0.5, subtitles: 0.7, learning: 0.6 },
      'advanced': { proficiency: 0.8, subtitles: 0.3, learning: 0.3 },
      'native': { proficiency: 1.0, subtitles: 0.1, learning: 0.1 },
    };

    const values = levelMap[answers.frenchLevel];
    vector[41] = values.proficiency;
    vector[42] = values.subtitles;
    vector[46] = values.learning;
  }

  // Apply pacing preference
  if (answers.pacing !== undefined) {
    vector[25] = answers.pacing;
  }

  // Apply dark themes tolerance
  if (answers.darkThemesOk !== undefined) {
    vector[19] = answers.darkThemesOk ? 0.7 : 0.2; // darknessTolerance
    vector[38] = answers.darkThemesOk ? 0.6 : 0.3; // deathSensitivity
  }
}
```

### Rapid Learning Phase

For new users, increase learning rates for first 10 interactions:

```typescript
function getAdaptiveLearningRate(
  baseRate: number,
  totalWatchTime: number
): number {

  // First 20 hours: 3x learning rate
  if (totalWatchTime < 1200) { // 20 hours in minutes
    return baseRate * 3.0;
  }

  // 20-50 hours: 2x learning rate
  if (totalWatchTime < 3000) { // 50 hours
    return baseRate * 2.0;
  }

  // 50-100 hours: 1.5x learning rate
  if (totalWatchTime < 6000) { // 100 hours
    return baseRate * 1.5;
  }

  // 100+ hours: normal rate
  return baseRate;
}
```

---

## Implementation Notes

### Storage Requirements

```typescript
/**
 * Storage per user vector
 */
const STORAGE_ESTIMATE = {
  vectorData: 64 * 4,        // 256 bytes (Float32Array)
  metadata: 200,             // ~200 bytes (userId, timestamp, etc)
  humanReadable: 1000,       // ~1KB JSON structure (optional, for API)
  total: 1456,               // ~1.5KB per user
};

// For 1 million users: ~1.5GB
// For 10 million users: ~15GB
// Very manageable!
```

### Performance Considerations

1. **Vector operations**: Use SIMD-optimized libraries (e.g., `ndarray`, `vectorious`)
2. **Database**: Store vectors in AgentDB for fast similarity search
3. **Caching**: Cache user vectors in Redis for active sessions
4. **Batch updates**: Process viewing signals in batches, not real-time

### AgentDB Integration

```typescript
/**
 * Store user vector in AgentDB for similarity search
 */
async function storeUserVector(
  db: AgentDB,
  vector: UserStyleVector
): Promise<void> {

  await db.upsert({
    table: 'user_vectors',
    id: vector.userId,
    vector: Array.from(vector.vector), // Convert Float32Array to Array
    metadata: {
      version: vector.version,
      lastUpdated: vector.lastUpdated.toISOString(),
      totalWatchTime: vector.totalWatchTime,
    },
  });
}

/**
 * Find similar content for user
 */
async function findSimilarContent(
  db: AgentDB,
  userVector: UserStyleVector,
  context: SessionContext,
  limit: number = 10
): Promise<ContentVector[]> {

  // Apply session modifiers
  const sessionModifiers = await extractSessionModifiers(
    context.textInput || '',
    context.voiceAudio,
    context
  );

  const queryVector = applySessionModifiers(userVector, sessionModifiers);

  // Search AgentDB
  const results = await db.search({
    table: 'content_vectors',
    vector: Array.from(queryVector.vector),
    filter: {
      platform: 'tv5monde',
      // Optional runtime filter based on session context
      ...(context.timeOfDay === 'night' && { runtime: { $lt: 120 } }),
    },
    limit,
  });

  return results.map(r => ({
    contentId: r.id,
    title: r.metadata.title,
    vector: new Float32Array(r.vector),
    platform: 'tv5monde',
    runtime: r.metadata.runtime,
    releaseYear: r.metadata.releaseYear,
    tv5mondeUrl: r.metadata.deeplink,
    confidenceScore: r.metadata.confidence,
    taggedAt: new Date(r.metadata.taggedAt),
  }));
}
```

### Version Management

```typescript
/**
 * Handle vector schema versions
 * Allows migrating users to new schema without data loss
 */
const SCHEMA_MIGRATIONS = {
  '1.0.0': {
    // Initial schema
    migrate: (oldVector: any) => oldVector,
  },

  '1.1.0': {
    // Example: Add dimension 64 for "cultural_curiosity"
    migrate: (oldVector: UserStyleVector) => {
      const newVector = new Float32Array(65);
      newVector.set(oldVector.vector);
      newVector[64] = 0.5; // Default for new dimension

      return {
        ...oldVector,
        version: '1.1.0',
        vector: newVector,
      };
    },
  },
};

/**
 * Migrate vector to current schema version
 */
function migrateVector(vector: UserStyleVector): UserStyleVector {
  const currentVersion = '1.0.0'; // Update as schema evolves

  if (vector.version === currentVersion) {
    return vector; // Already current
  }

  // Apply migrations in sequence
  let migrated = vector;
  const versions = Object.keys(SCHEMA_MIGRATIONS).sort();

  for (const version of versions) {
    if (version > vector.version && version <= currentVersion) {
      migrated = SCHEMA_MIGRATIONS[version].migrate(migrated);
    }
  }

  return migrated;
}
```

---

## Appendix: Example Vectors

### Example 1: New User (Cold Start)

```typescript
const newUser: UserStyleVector = {
  userId: 'user_12345',
  version: '1.0.0',
  lastUpdated: new Date('2025-12-06'),
  totalWatchTime: 0,

  vector: new Float32Array([
    // Genres [0-14] - all neutral
    0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,

    // Mood [15-24] - slight positive bias
    0.2, 0.6, 0.7, 0.5, 0.4, 0.3, 0.5, 0.5, 0.5, 0.5,

    // Structure [25-32] - moderate
    0.5, 0.6, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,

    // Characteristics [33-40] - moderate
    0.4, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,

    // French [41-48] - beginner learner
    0.3, 0.8, 0.6, 0.5, 0.5, 0.6, 0.7, 0.5,

    // Context [49-56] - neutral
    0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,

    // Session [57-63] - neutral state
    0.6, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
  ]),

  // ... (human-readable mapping)
};
```

### Example 2: Experienced User (100+ hours watched)

```typescript
const experiencedUser: UserStyleVector = {
  userId: 'user_67890',
  version: '1.0.0',
  lastUpdated: new Date('2025-12-06'),
  totalWatchTime: 6500, // 108 hours

  vector: new Float32Array([
    // Genres [0-14] - learned preferences
    0.85, // comedy - loves comedy
    0.70, // drama - enjoys drama
    0.45, // romance - neutral-low
    0.30, // thriller - dislikes
    0.25, // action - dislikes
    0.60, // documentary - moderate interest
    0.40, // fantasy - low interest
    0.10, // horror - avoids
    0.50, // animation - neutral
    0.65, // biographical - moderate interest
    0.55, // musical - moderate interest
    0.35, // crime - low interest
    0.75, // family - enjoys
    0.55, // historical - moderate
    0.70, // artfilm - enjoys

    // Mood [15-24] - prefers uplifting content
    0.65, // valencePreference - prefers positive (normalized from 0.3)
    0.80, // humorLevel - loves humor
    0.85, // warmth - seeks warmth
    0.25, // tensionTolerance - low tolerance
    0.20, // darknessTolerance - avoids dark content
    0.15, // cynicism - prefers optimistic
    0.60, // nostalgia - enjoys nostalgia
    0.65, // quirky - appreciates quirky
    0.50, // bittersweet - neutral
    0.40, // intensity - prefers lower intensity

    // Structure [25-32] - prefers slower, thoughtful content
    0.35, // pacing - prefers slower
    0.70, // cognitiveLoad - enjoys complexity
    0.60, // attentionBudget - can focus
    0.75, // plotComplexity - enjoys complex plots
    0.60, // nonlinear - comfortable with non-linear
    0.55, // ensemble - enjoys ensemble casts
    0.65, // dialogueDensity - enjoys dialogue
    0.70, // arcPreference - prefers clear arcs

    // Characteristics [33-40] - low tolerance for intense content
    0.20, // violence - avoids violence
    0.55, // romance - moderate
    0.40, // sexual - lower tolerance
    0.60, // language - moderate tolerance
    0.50, // substance - neutral
    0.30, // death - sensitive to death
    0.70, // socialCommentary - interested in social themes
    0.60, // spiritual - interested in spiritual themes

    // French [41-48] - advanced learner
    0.75, // languageProficiency - advanced
    0.30, // subtitlePreference - rarely needs subtitles
    0.85, // culturalDepth - loves cultural content
    0.70, // accentDiversity - comfortable with accents
    0.65, // regionPreference - interested in diverse regions
    0.20, // languageLearning - not primary goal anymore
    0.90, // culturalAuthenticity - strongly prefers authentic
    0.80, // wordplay - appreciates linguistic humor

    // Context [49-56] - learned viewing patterns
    0.65, // solo - often watches alone
    0.55, // social - sometimes with others
    0.60, // dateNight - moderate preference
    0.70, // family - often watches with family
    0.45, // weeknight - less on weeknights
    0.75, // weekend - prefers weekend viewing
    0.80, // rainyDay - loves cozy viewing
    0.25, // background - rarely background viewing

    // Session [57-63] - current session state (tired Friday evening)
    0.25, // currentEnergy - low energy
    0.35, // currentValence - slightly down (normalized from -0.3)
    0.30, // arousal - low arousal
    0.85, // comfortNeed - high comfort need
    0.60, // escapeNeed - moderate escape need
    0.20, // stimulationNeed - low stimulation need
    0.50, // connectionNeed - moderate
  ]),

  // ... (human-readable mapping)
};
```

### Example 3: Content Vector (Le Sens de la Fête)

```typescript
const leSensDeLaFete: ContentVector = {
  contentId: 'tt1639084',
  title: 'Le Sens de la Fête',
  platform: 'tv5monde',
  runtime: 117,
  releaseYear: 2017,
  tv5mondeUrl: 'https://tv5monde.com/watch/tt1639084',
  confidenceScore: 0.92,
  taggedAt: new Date('2025-12-05'),

  vector: new Float32Array([
    // Genres [0-14]
    0.95, // comedy - primarily comedy
    0.40, // drama - some dramatic elements
    0.40, // romance - subplot
    0.10, // thriller - not a thriller
    0.05, // action - minimal action
    0.05, // documentary - not documentary
    0.05, // fantasy - not fantasy
    0.00, // horror - not horror
    0.05, // animation - not animation
    0.10, // biographical - not biographical
    0.10, // musical - not musical
    0.10, // crime - not crime
    0.75, // family - family-friendly
    0.15, // historical - contemporary
    0.25, // artfilm - some artistic elements

    // Mood [15-24]
    0.88, // valence - very positive (normalized from 0.75)
    0.85, // humor - very funny
    0.80, // warmth - very warm
    0.50, // tension - moderate comedic tension
    0.10, // darkness - very light
    0.20, // cynicism - optimistic
    0.30, // nostalgia - not particularly nostalgic
    0.60, // quirky - somewhat quirky
    0.35, // bittersweet - mostly happy
    0.55, // intensity - moderate intensity

    // Structure [25-32]
    0.65, // pacing - moderately fast
    0.25, // cognitiveLoad - low complexity
    0.40, // attention - can glance away
    0.30, // plotComplexity - simple plot
    0.20, // nonlinear - chronological
    0.75, // ensemble - ensemble cast
    0.60, // dialogueDensity - moderate dialogue
    0.70, // arc - clear arc

    // Characteristics [33-40]
    0.05, // violence - essentially none
    0.40, // romance - subplot
    0.10, // sexual - minimal
    0.60, // language - some French swearing
    0.40, // substance - alcohol at wedding
    0.05, // death - no death themes
    0.30, // socialCommentary - light social themes
    0.20, // spiritual - not spiritual

    // French [41-48]
    0.70, // languageProficiency - intermediate+ needed
    0.50, // subtitles - helpful but not required
    0.75, // culturalDepth - French wedding culture
    0.40, // accentDiversity - standard French
    0.20, // regionPreference - Parisian
    0.50, // languageLearning - some wordplay to learn
    0.90, // culturalAuthenticity - authentically French
    0.70, // wordplay - good amount of French humor

    // Context [49-56]
    0.60, // solo - good alone
    0.85, // social - great with others
    0.90, // dateNight - excellent date movie
    0.75, // family - mostly family-safe
    0.85, // weeknight - perfect for tired weeknight
    0.80, // weekend - great weekend watch
    0.90, // rainyDay - cozy rainy day perfect
    0.40, // background - better with full attention

    // Session matching [57-63]
    // These match viewer needs, not content properties
    0.30, // energyMatch - good for LOW energy (inverse)
    0.88, // valenceMatch - provides POSITIVE mood boost
    0.45, // arousalMatch - moderate stimulation
    0.75, // comfortProvides - provides comfort
    0.80, // escapeProvides - good escapism
    0.50, // stimulationProvides - moderate stimulation
    0.65, // connectionProvides - feel-good connection
  ]),
};
```

**Similarity Score:**
```typescript
const similarity = computeSimilarity(
  experiencedUser,  // Tired, wants comfort
  leSensDeLaFete,   // Light, warm comedy
  {
    timeOfDay: 'evening',
    dayOfWeek: 'weekend',
    weather: 'rainy',
    device: 'tv',
    viewingMode: 'solo',
  }
);

// Result: 0.91 (excellent match!)
// Why: User wants comfort, low energy, positive mood boost
// Content provides: Light comedy, warm, easy watch, cozy
```

---

## Summary

This 64-dimension User Style Vector schema provides:

1. **Comprehensive modeling**: Captures stable preferences, evolving tastes, and real-time state
2. **TV5MONDE optimized**: Dedicated dimensions for French language and cultural nuances
3. **Learnable**: Clear update mechanisms from implicit and explicit signals
4. **Cold-start resilient**: Sensible defaults + optional onboarding
5. **Interpretable**: Each dimension has clear semantic meaning
6. **Efficient**: Only 256 bytes per user, fast similarity computation
7. **Flexible**: Version-managed schema for future evolution

**Next Steps:**
1. Implement TypeScript interfaces and vector operations
2. Integrate with AgentDB for vector storage and search
3. Build intent extraction system (text + voice → session modifiers)
4. Create content tagging pipeline (TV5MONDE catalog → content vectors)
5. Develop learning pipeline (viewing signals → vector updates)
6. Build evaluation framework (A/B testing, precision@k metrics)

---

**Document Version:** 1.0.0
**Last Updated:** 2025-12-06
**Status:** Architecture Design Complete ✅
