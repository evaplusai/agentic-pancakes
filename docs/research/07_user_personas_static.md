# TV5MONDE User Personas - Static Attributes

**Research Document**
**Date:** 2025-12-06
**Focus:** User persona archetypes with complete static attribute profiles
**Source:** Content Discovery Research Analysis

---

## Executive Summary

This document defines 6 distinct user persona archetypes for the TV5MONDE content discovery system, each with comprehensive static attributes (demographics, taste DNA, history signals, and French content specifics). These personas represent the diversity of TV5MONDE's francophone and French-learning audience across North America, Europe, Africa, and beyond.

**Key Dimensions:**
- **Demographics:** Age, location, language fluency, cultural background
- **Taste DNA:** Genre affinity, pacing, complexity, intensity preferences
- **History Signals:** Viewing patterns, completion rates, binge vs episodic behavior
- **French Specifics:** Fluency level, subtitle preference, European cinema familiarity

---

## Persona 1: Sophie - The Curious French Learner

### Background Story

**Name:** Sophie Chen
**Age:** 28
**Location:** San Francisco, California (Pacific Time, GMT-8)
**Occupation:** UX Designer at tech startup
**Cultural Background:** Chinese-American, second-generation immigrant

Sophie started learning French in high school and rekindled her interest during the pandemic. She uses TV5MONDE to improve her language skills while enjoying European culture. She's drawn to content that feels authentic and helps her prepare for her dream trip to Paris. She watches with subtitles on and appreciates slower-paced dialogue-heavy content where she can catch phrases and expressions.

### Static Demographics

```yaml
demographics:
  age_range: "26-35"
  gender: "Female"
  location: "North America - West Coast"
  timezone: "Pacific (GMT-8)"
  city_type: "Urban - Major tech hub"
  education: "Bachelor's degree (Design)"
  household: "Lives with roommate"
  language_background: "English native, Mandarin conversational"
  cultural_identity: "Asian-American, cosmopolitan"
```

### Taste DNA Profile

```javascript
const sophieTasteDNA = {
  // Genre affinity scores (0-1 scale)
  genres: {
    romance: 0.80,           // High - loves relationship-driven stories
    drama: 0.75,             // High - appreciates character depth
    comedy: 0.70,            // High - especially romantic comedies
    documentary: 0.60,       // Medium - travel and culture docs
    thriller: 0.35,          // Low-medium - occasional mystery
    action: 0.15,            // Low - not her preference
    horror: 0.05,            // Very low - actively avoids
  },

  // Mood/tone preferences
  tone: {
    lighthearted: 0.75,      // Prefers upbeat, positive content
    heartwarming: 0.85,      // Very high - feel-good stories
    intense: 0.25,           // Low - prefers gentler content
    thoughtProvoking: 0.65,  // Medium-high - likes substance
    dark: 0.10,              // Very low - avoids heavy themes
    whimsical: 0.70,         // High - enjoys quirky French humor
  },

  // Pacing preferences
  pacing: {
    preference: 0.40,        // 0=slow burn, 1=fast paced
    toleranceForSlow: 0.80,  // High tolerance for slower pacing
    needsAction: 0.15,       // Low need for constant action
    attentionSpan: 0.70,     // Good - can focus on dialogue
  },

  // Complexity tolerance
  complexity: {
    narrativeComplexity: 0.60,    // Medium - likes layered stories
    cognitiveLoad: 0.55,          // Medium - not too demanding
    subtletyAppreciation: 0.75,   // High - appreciates nuance
    preferredPlotStructure: "character-driven", // vs plot-driven
  },

  // Violence/intensity thresholds
  intensity: {
    violenceTolerance: 0.20,      // Low - prefers minimal violence
    emotionalIntensity: 0.60,     // Medium-high - handles emotional depth
    stressThreshold: 0.35,        // Low-medium - avoids high stress
    sexualContent: 0.50,          // Medium - OK with mature romance
  },

  // Nostalgia vs novelty
  exploration: {
    nostalgiaPreference: 0.30,    // Low-medium - prefers new content
    noveltyPreference: 0.85,      // Very high - loves discovery
    comfortZoneRisk: 0.70,        // High willingness to try new
    culturalCuriosity: 0.95,      // Extremely high - main driver
  },
};
```

### History Signals

```javascript
const sophieHistorySignals = {
  // Completion patterns
  completion: {
    completionRate: 0.75,         // Finishes most things she starts
    abandonmentPattern: "first-30-min", // Drops early if not engaging
    episodeDropoffRate: 0.15,     // Low - usually commits to series
    movieCompletionRate: 0.85,    // High - almost always finishes movies
  },

  // Rewatch behavior
  rewatch: {
    rewatchFrequency: 0.40,       // Occasional rewatcher
    rewatchReason: "language-practice", // Educational motivation
    favoriteRewatches: ["Amélie", "Call My Agent", "A Very Secret Service"],
    rewatchDelay: "6-12 months",  // Time before rewatching
  },

  // Viewing patterns
  patterns: {
    bingePropensity: 0.45,        // Medium - occasional binger
    episodicPreference: 0.55,     // Slight preference for episodic
    averageSessionLength: 60,     // 1 hour typical
    multipleEpisodesLimit: 2,     // Usually stops after 2 episodes
    movieVsSeriesRatio: "40:60",  // Slightly prefers series
  },

  // Peak viewing times
  schedule: {
    peakDays: ["Tuesday", "Thursday", "Sunday"],
    peakTimes: ["19:00-21:00", "22:00-23:30"], // Weeknight wind-down
    weekendBehavior: "afternoon-movie",         // Weekend matinee viewer
    devicePreference: "laptop-with-headphones", // For focused learning
  },
};
```

### French Content Specifics

```javascript
const sophieFrenchProfile = {
  // Language fluency (0-1 scale)
  fluency: {
    overall: 0.45,                // Intermediate learner (B1-B2)
    listening: 0.50,              // Stronger - lots of practice
    reading: 0.60,                // Strong - relies on subtitles
    speaking: 0.35,               // Weaker - limited practice
    comprehensionSpeed: 0.55,     // Needs moderate pacing
  },

  // Subtitle preferences
  subtitles: {
    preference: "english-always",  // Always needs English subs
    frenchSubsInterest: 0.70,      // Would use French subs occasionally
    dualSubtitles: true,           // Loves French + English together
    subtitleDependency: 0.90,      // Highly dependent on subtitles
  },

  // Content preferences
  preferences: {
    dialoguePreference: "clear-moderate-pace", // Not too fast
    accentTolerance: 0.60,        // Handles standard French well
    slangTolerance: 0.30,         // Struggles with heavy slang
    preferredDialect: "Parisian", // Most familiar with standard
    regionalToleranceLow: 0.40,   // Struggles with strong accents
  },

  // European cinema familiarity
  cinema: {
    familiarity: 0.55,            // Growing familiarity
    favoriteDirectors: ["Jean-Pierre Jeunet", "Agnès Varda"],
    classicExposure: 0.40,        // Some classic film exposure
    contemporaryFocus: 0.80,      // Prefers modern content
    arthouse_tolerance: 0.50,     // Medium tolerance for arthouse
  },

  // Cultural context
  cultural: {
    frenchCultureKnowledge: 0.60,  // Decent cultural literacy
    motivationForFrench: "travel-and-culture", // Primary driver
    parisianDreamLevel: 0.95,      // Very high - dream destination
    foodCultureInterest: 0.90,     // Loves French cuisine content
    fashionInterest: 0.75,         // High interest in French fashion
  },
};
```

### Vector Representation (64-dimensional summary)

```javascript
const sophieVector = {
  // Compact persona vector for matching
  comedy: 0.70, drama: 0.75, romance: 0.80, documentary: 0.60,
  lighthearted: 0.75, heartwarming: 0.85, thoughtProvoking: 0.65,
  slowBurn: 0.60, fastPaced: 0.40, dialogueHeavy: 0.85,
  culturalDepth: 0.90, frenchFluency: 0.45, subtitleDependency: 0.90,
  europeanCinema: 0.55, noveltyPreference: 0.85, completionRate: 0.75,
  bingePropensity: 0.45, rewatchFrequency: 0.40,
};
```

---

## Persona 2: Marc - The Francophone Expat Professional

### Background Story

**Name:** Marc Dubois
**Age:** 42
**Location:** Montreal, Quebec (Eastern Time, GMT-5)
**Occupation:** Financial analyst at international bank
**Cultural Background:** French-Canadian, born in Quebec City

Marc grew up speaking French and consumes French content as a connection to his cultural roots. He has sophisticated tastes, appreciates auteur cinema, and stays current with French news and culture. He watches with his wife on weekends and alone on weeknights. He's discerning about quality and favors critically acclaimed content over popular mainstream fare.

### Static Demographics

```yaml
demographics:
  age_range: "36-50"
  gender: "Male"
  location: "North America - Quebec"
  timezone: "Eastern (GMT-5)"
  city_type: "Urban - Major financial center"
  education: "Master's degree (Finance)"
  household: "Married, 2 children (ages 8, 11)"
  language_background: "French native, English fluent, Spanish basic"
  cultural_identity: "Québécois, proudly francophone"
```

### Taste DNA Profile

```javascript
const marcTasteDNA = {
  // Genre affinity scores
  genres: {
    drama: 0.90,             // Very high - appreciates depth
    thriller: 0.75,          // High - enjoys smart suspense
    documentary: 0.70,       // High - politics, history, culture
    comedy: 0.55,            // Medium - prefers sophisticated humor
    action: 0.45,            // Medium - occasional well-made action
    romance: 0.35,           // Low-medium - not primary interest
    horror: 0.15,            // Low - rarely interested
  },

  // Mood/tone preferences
  tone: {
    thoughtProvoking: 0.90,  // Very high - main criterion
    intense: 0.75,           // High - handles heavy content
    dark: 0.60,              // Medium-high - not averse to darkness
    lighthearted: 0.35,      // Low-medium - occasional preference
    heartwarming: 0.30,      // Low - not primary driver
    satirical: 0.80,         // High - loves French satire
  },

  // Pacing preferences
  pacing: {
    preference: 0.55,        // Medium - balanced pacing
    toleranceForSlow: 0.90,  // Very high - appreciates slow burn
    needsAction: 0.25,       // Low - values character over action
    attentionSpan: 0.95,     // Excellent - highly engaged viewer
  },

  // Complexity tolerance
  complexity: {
    narrativeComplexity: 0.95,    // Very high - loves intricate plots
    cognitiveLoad: 0.85,          // High - seeks intellectual engagement
    subtletyAppreciation: 0.90,   // Very high - appreciates layers
    preferredPlotStructure: "non-linear", // Enjoys complex structures
  },

  // Violence/intensity thresholds
  intensity: {
    violenceTolerance: 0.70,      // High - handles graphic content
    emotionalIntensity: 0.85,     // Very high - seeks emotional depth
    stressThreshold: 0.75,        // High - handles tense narratives
    sexualContent: 0.65,          // Medium-high - mature viewer
  },

  // Nostalgia vs novelty
  exploration: {
    nostalgiaPreference: 0.60,    // Medium-high - revisits classics
    noveltyPreference: 0.75,      // High - but curated novelty
    comfortZoneRisk: 0.70,        // High - but quality-filtered
    culturalCuriosity: 0.80,      // High - especially French culture
  },
};
```

### History Signals

```javascript
const marcHistorySignals = {
  // Completion patterns
  completion: {
    completionRate: 0.90,         // Very high - commits fully
    abandonmentPattern: "end-of-episode", // Gives content fair chance
    episodeDropoffRate: 0.05,     // Very low - finishes series
    movieCompletionRate: 0.95,    // Extremely high
  },

  // Rewatch behavior
  rewatch: {
    rewatchFrequency: 0.60,       // High - revisits favorites
    rewatchReason: "quality-appreciation", // Cinematic value
    favoriteRewatches: ["Le Bureau des Légendes", "Un Prophète", "Intouchables"],
    rewatchDelay: "2-3 years",    // Longer intervals
  },

  // Viewing patterns
  patterns: {
    bingePropensity: 0.70,        // High - weekend binges
    episodicPreference: 0.50,     // Balanced - depends on content
    averageSessionLength: 120,    // 2 hours typical
    multipleEpisodesLimit: 4,     // Can watch full mini-season
    movieVsSeriesRatio: "50:50",  // Balanced preference
  },

  // Peak viewing times
  schedule: {
    peakDays: ["Friday", "Saturday", "Sunday"],
    peakTimes: ["21:00-23:30", "14:00-17:00"], // Late evening, weekend afternoon
    weekendBehavior: "family-movie-night",      // Friday with family
    devicePreference: "home-theater-setup",     // Cinematic experience
  },
};
```

### French Content Specifics

```javascript
const marcFrenchProfile = {
  // Language fluency
  fluency: {
    overall: 1.0,                 // Native speaker
    listening: 1.0,               // Perfect comprehension
    reading: 1.0,                 // Native literacy
    speaking: 1.0,                // Native fluency
    comprehensionSpeed: 1.0,      // No limitations
  },

  // Subtitle preferences
  subtitles: {
    preference: "french-only-if-needed", // For regional accents
    frenchSubsInterest: 0.20,     // Rarely needs them
    dualSubtitles: false,         // No interest
    subtitleDependency: 0.05,     // Essentially independent
  },

  // Content preferences
  preferences: {
    dialoguePreference: "rapid-witty-complex", // Can handle fast dialogue
    accentTolerance: 0.95,        // Handles all French accents
    slangTolerance: 0.90,         // Understands Québécois + French slang
    preferredDialect: "any-francophone", // No preference
    regionalToleranceLow: 0.95,   // Appreciates regional diversity
  },

  // European cinema familiarity
  cinema: {
    familiarity: 0.90,            // Deep knowledge
    favoriteDirectors: ["François Truffaut", "Jacques Audiard", "Céline Sciamma"],
    classicExposure: 0.85,        // Strong classic film background
    contemporaryFocus: 0.80,      // Balances classic and contemporary
    arthouse_tolerance: 0.90,     // High appreciation for arthouse
  },

  // Cultural context
  cultural: {
    frenchCultureKnowledge: 0.95,  // Expert-level cultural literacy
    motivationForFrench: "cultural-identity", // Core identity
    quebecIdentityStrong: 0.95,    // Strong Québécois identity
    francophoneNetworkValue: 0.90, // Values francophone connections
    culturalPreservation: 0.85,    // Supports French language/culture
  },
};
```

### Vector Representation

```javascript
const marcVector = {
  comedy: 0.55, drama: 0.90, thriller: 0.75, documentary: 0.70,
  thoughtProvoking: 0.90, intense: 0.75, dark: 0.60, satirical: 0.80,
  slowBurn: 0.90, complexNarrative: 0.95, dialogueHeavy: 0.85,
  culturalDepth: 0.95, frenchFluency: 1.0, subtitleDependency: 0.05,
  europeanCinema: 0.90, noveltyPreference: 0.75, completionRate: 0.90,
  bingePropensity: 0.70, rewatchFrequency: 0.60,
};
```

---

## Persona 3: Amara - The Pan-African Cultural Explorer

### Background Story

**Name:** Amara Ndiaye
**Age:** 31
**Location:** Dakar, Senegal (GMT+0)
**Occupation:** Digital marketing manager for Pan-African tech company
**Cultural Background:** Senegalese, multilingual (Wolof, French, English)

Amara represents TV5MONDE's African audience—educated, cosmopolitan, and interested in both French/European content and African francophone productions. She uses TV5MONDE to stay connected to the broader francophone world while seeking authentic African representation. She's socially engaged, watches content to discuss with friends, and values contemporary relevant stories.

### Static Demographics

```yaml
demographics:
  age_range: "26-35"
  gender: "Female"
  location: "Africa - West Africa"
  timezone: "GMT+0"
  city_type: "Urban - Major African capital"
  education: "Bachelor's degree (Marketing/Communications)"
  household: "Lives with family (extended household)"
  language_background: "Wolof native, French fluent, English fluent"
  cultural_identity: "Pan-African, modern Senegalese"
```

### Taste DNA Profile

```javascript
const amaraTasteDNA = {
  // Genre affinity scores
  genres: {
    drama: 0.85,             // High - socially conscious stories
    comedy: 0.75,            // High - African and French comedy
    documentary: 0.65,       // Medium-high - social issues
    romance: 0.70,           // High - contemporary romance
    thriller: 0.55,          // Medium - occasional interest
    action: 0.45,            // Medium - not primary preference
    horror: 0.25,            // Low - occasional Nollywood horror
  },

  // Mood/tone preferences
  tone: {
    thoughtProvoking: 0.80,  // High - values social commentary
    heartwarming: 0.75,      // High - community-focused stories
    lighthearted: 0.70,      // High - enjoys upbeat content
    intense: 0.50,           // Medium - selective
    dark: 0.35,              // Low-medium - prefers hopeful
    contemporary: 0.95,      // Very high - wants current relevance
  },

  // Pacing preferences
  pacing: {
    preference: 0.65,        // Medium-high - moderately fast
    toleranceForSlow: 0.50,  // Medium - depends on content
    needsAction: 0.45,       // Medium - values story over action
    attentionSpan: 0.70,     // Good - but competes with social media
  },

  // Complexity tolerance
  complexity: {
    narrativeComplexity: 0.70,    // High - enjoys layered stories
    cognitiveLoad: 0.65,          // Medium-high - intelligent content
    subtletyAppreciation: 0.70,   // High - culturally nuanced viewer
    preferredPlotStructure: "ensemble-cast", // Multiple perspectives
  },

  // Violence/intensity thresholds
  intensity: {
    violenceTolerance: 0.55,      // Medium - context-dependent
    emotionalIntensity: 0.75,     // High - connects emotionally
    stressThreshold: 0.60,        // Medium-high - handles tension
    sexualContent: 0.60,          // Medium-high - mature viewer
  },

  // Nostalgia vs novelty
  exploration: {
    nostalgiaPreference: 0.40,    // Low-medium - forward-looking
    noveltyPreference: 0.85,      // Very high - seeks new voices
    comfortZoneRisk: 0.80,        // High - adventurous viewer
    culturalCuriosity: 0.95,      // Extremely high - Pan-African focus
  },
};
```

### History Signals

```javascript
const amaraHistorySignals = {
  // Completion patterns
  completion: {
    completionRate: 0.65,         // Medium-high - busy lifestyle
    abandonmentPattern: "mid-series", // Drops if loses interest
    episodeDropoffRate: 0.25,     // Medium - selective commitment
    movieCompletionRate: 0.80,    // High for movies
  },

  // Rewatch behavior
  rewatch: {
    rewatchFrequency: 0.25,       // Low - prefers new content
    rewatchReason: "social-viewing", // Watches with friends/family
    favoriteRewatches: ["Queen Sono", "Binta and the Great Idea", "Atlantics"],
    rewatchDelay: "12+ months",   // Long intervals
  },

  // Viewing patterns
  patterns: {
    bingePropensity: 0.55,        // Medium - occasional weekend binges
    episodicPreference: 0.60,     // Medium-high - fits schedule better
    averageSessionLength: 45,     // 45 minutes typical
    multipleEpisodesLimit: 2,     // Usually 2 episodes max
    movieVsSeriesRatio: "35:65",  // Prefers series for flexibility
  },

  // Peak viewing times
  schedule: {
    peakDays: ["Saturday", "Sunday", "Wednesday"],
    peakTimes: ["20:00-22:00", "13:00-15:00"], // Evening + weekend lunch
    weekendBehavior: "social-viewing-gatherings", // Watches with friends
    devicePreference: "mobile-tablet-flexible",    // Multi-device
  },
};
```

### French Content Specifics

```javascript
const amaraFrenchProfile = {
  // Language fluency
  fluency: {
    overall: 0.85,                // Near-native (African French)
    listening: 0.90,              // Excellent comprehension
    reading: 0.85,                // Strong reading
    speaking: 0.90,               // Fluent speaker (Senegalese French)
    comprehensionSpeed: 0.90,     // Fast comprehension
  },

  // Subtitle preferences
  subtitles: {
    preference: "english-for-european-french", // Sometimes for European French
    frenchSubsInterest: 0.30,     // Occasional use
    dualSubtitles: false,         // Generally doesn't need
    subtitleDependency: 0.20,     // Low dependency
  },

  // Content preferences
  preferences: {
    dialoguePreference: "natural-conversational", // Prefers authentic
    accentTolerance: 0.95,        // Handles all francophone accents
    slangTolerance: 0.85,         // Strong - multilingual background
    preferredDialect: "african-french", // Preference for African French
    regionalToleranceLow: 0.95,   // Appreciates all francophone variants
  },

  // European cinema familiarity
  cinema: {
    familiarity: 0.60,            // Moderate European cinema knowledge
    favoriteDirectors: ["Ousmane Sembène", "Mati Diop", "Abderrahmane Sissako"],
    classicExposure: 0.45,        // Some classic French cinema
    contemporaryFocus: 0.90,      // Strong focus on contemporary
    arthouse_tolerance: 0.70,     // High - values artistic expression
  },

  // Cultural context
  cultural: {
    frenchCultureKnowledge: 0.75,  // Good knowledge, selective interest
    motivationForFrench: "professional-cultural", // Work + identity
    africanRepresentationPriority: 0.95, // Very high - key criterion
    panAfricanIdentity: 0.90,      // Strong Pan-African consciousness
    diasporaConnectionValue: 0.80, // Values francophone network
  },
};
```

### Vector Representation

```javascript
const amaraVector = {
  comedy: 0.75, drama: 0.85, romance: 0.70, documentary: 0.65,
  thoughtProvoking: 0.80, heartwarming: 0.75, contemporary: 0.95,
  moderatePacing: 0.65, ensembleCast: 0.80, sociallyConscious: 0.90,
  culturalDepth: 0.85, frenchFluency: 0.85, subtitleDependency: 0.20,
  europeanCinema: 0.60, noveltyPreference: 0.85, completionRate: 0.65,
  bingePropensity: 0.55, africanRepresentation: 0.95,
};
```

---

## Persona 4: Jean-Luc - The Retired Cinephile

### Background Story

**Name:** Jean-Luc Moreau
**Age:** 67
**Location:** Lyon, France (Central European Time, GMT+1)
**Occupation:** Retired professor of French literature
**Cultural Background:** French, born in Burgundy

Jean-Luc has decades of cinema-going experience and refined tastes shaped by the French New Wave and beyond. He watches TV5MONDE for classic films, cultural programs, and high-quality dramas. He has all the time in the world to watch and values artistic merit above all else. He's not interested in mainstream entertainment and seeks content that challenges and enriches.

### Static Demographics

```yaml
demographics:
  age_range: "60+"
  gender: "Male"
  location: "Europe - France"
  timezone: "Central European Time (GMT+1)"
  city_type: "Urban - Mid-sized cultural city"
  education: "Doctorate (French Literature)"
  household: "Married, empty nest (children grown)"
  language_background: "French native, English good, Italian basic"
  cultural_identity: "Traditional French intellectual"
```

### Taste DNA Profile

```javascript
const jeanLucTasteDNA = {
  // Genre affinity scores
  genres: {
    drama: 0.95,             // Extremely high - core preference
    documentary: 0.85,       // Very high - arts, history, politics
    thriller: 0.60,          // Medium - classic French noir
    romance: 0.55,           // Medium - sophisticated romance
    comedy: 0.50,            // Medium - classical French comedy
    action: 0.10,            // Very low - no interest
    horror: 0.05,            // Essentially zero interest
  },

  // Mood/tone preferences
  tone: {
    thoughtProvoking: 0.98,  // Maximum - primary criterion
    intense: 0.70,           // High - emotional/intellectual intensity
    dark: 0.65,              // Medium-high - existential themes
    lighthearted: 0.20,      // Low - not typical preference
    heartwarming: 0.35,      // Low-medium - selective
    artistic: 0.95,          // Very high - aesthetic sophistication
  },

  // Pacing preferences
  pacing: {
    preference: 0.25,        // Low - prefers slow, contemplative
    toleranceForSlow: 1.0,   // Maximum - loves slow cinema
    needsAction: 0.05,       // Essentially zero
    attentionSpan: 1.0,      // Perfect - highly focused viewer
  },

  // Complexity tolerance
  complexity: {
    narrativeComplexity: 1.0,     // Maximum - seeks complexity
    cognitiveLoad: 0.95,          // Very high - intellectual engagement
    subtletyAppreciation: 1.0,    // Maximum - master reader
    preferredPlotStructure: "experimental", // Open to all forms
  },

  // Violence/intensity thresholds
  intensity: {
    violenceTolerance: 0.60,      // Medium-high - if artistically justified
    emotionalIntensity: 0.90,     // Very high - seeks depth
    stressThreshold: 0.80,        // High - handles difficult content
    sexualContent: 0.70,          // High - mature sophisticated viewer
  },

  // Nostalgia vs novelty
  exploration: {
    nostalgiaPreference: 0.80,    // High - revisits classics frequently
    noveltyPreference: 0.60,      // Medium-high - curated contemporary
    comfortZoneRisk: 0.70,        // High - but within arthouse realm
    culturalCuriosity: 0.85,      // Very high - lifelong learner
  },
};
```

### History Signals

```javascript
const jeanLucHistorySignals = {
  // Completion patterns
  completion: {
    completionRate: 0.95,         // Extremely high - respects the work
    abandonmentPattern: "rarely", // Gives everything full chance
    episodeDropoffRate: 0.02,     // Essentially never drops
    movieCompletionRate: 0.98,    // Almost always completes
  },

  // Rewatch behavior
  rewatch: {
    rewatchFrequency: 0.85,       // Very high - constant revisiting
    rewatchReason: "artistic-analysis", // Deepening appreciation
    favoriteRewatches: ["400 Blows", "Hiroshima Mon Amour", "Le Samouraï"],
    rewatchDelay: "6 months-5 years", // Variable, thematic revisits
  },

  // Viewing patterns
  patterns: {
    bingePropensity: 0.30,        // Low - savors each work
    episodicPreference: 0.30,     // Low - prefers complete films
    averageSessionLength: 150,    // 2.5 hours typical
    multipleEpisodesLimit: 1,     // One at a time, reflective
    movieVsSeriesRatio: "75:25",  // Strong preference for films
  },

  // Peak viewing times
  schedule: {
    peakDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    peakTimes: ["15:00-18:00", "20:30-23:30"], // Afternoon + evening
    weekendBehavior: "repertory-cinema-attendance", // Goes to cinema
    devicePreference: "high-quality-home-theater", // Cinematic setup
  },
};
```

### French Content Specifics

```javascript
const jeanLucFrenchProfile = {
  // Language fluency
  fluency: {
    overall: 1.0,                 // Native speaker, literary French
    listening: 1.0,               // Perfect comprehension
    reading: 1.0,                 // Native literacy, classical training
    speaking: 1.0,                // Native eloquence
    comprehensionSpeed: 1.0,      // No limitations
  },

  // Subtitle preferences
  subtitles: {
    preference: "never-french",   // Only for foreign films
    frenchSubsInterest: 0.0,      // No interest
    dualSubtitles: false,         // Never
    subtitleDependency: 0.0,      // Zero dependency
  },

  // Content preferences
  preferences: {
    dialoguePreference: "literary-eloquent", // Appreciates eloquent dialogue
    accentTolerance: 1.0,         // Appreciates all French variants
    slangTolerance: 0.50,         // Prefers standard literary French
    preferredDialect: "standard-french", // Classical preference
    regionalToleranceLow: 0.80,   // Appreciates but not preferred
  },

  // European cinema familiarity
  cinema: {
    familiarity: 1.0,             // Expert-level encyclopedic knowledge
    favoriteDirectors: ["François Truffaut", "Jean-Luc Godard", "Éric Rohmer", "Alain Resnais"],
    classicExposure: 1.0,         // Comprehensive classic knowledge
    contemporaryFocus: 0.55,      // Selective contemporary interest
    arthouse_tolerance: 1.0,      // Pure arthouse preference
  },

  // Cultural context
  cultural: {
    frenchCultureKnowledge: 1.0,   // Expert cultural/literary knowledge
    motivationForFrench: "cultural-intellectual", // Core identity
    literaryConnectionStrong: 1.0, // Literature-cinema connection
    academicPerspective: 0.95,     // Analytical viewing approach
    preservationistValues: 0.90,   // Values cultural heritage
  },
};
```

### Vector Representation

```javascript
const jeanLucVector = {
  drama: 0.95, documentary: 0.85, thriller: 0.60, arthouse: 1.0,
  thoughtProvoking: 0.98, artistic: 0.95, intense: 0.70,
  slowBurn: 1.0, experimentalNarrative: 0.95, literaryDialogue: 0.95,
  culturalDepth: 1.0, frenchFluency: 1.0, subtitleDependency: 0.0,
  europeanCinema: 1.0, classicCinema: 1.0, completionRate: 0.95,
  bingePropensity: 0.30, rewatchFrequency: 0.85,
};
```

---

## Persona 5: Zoé - The Young Professional Night Owl

### Background Story

**Name:** Zoé Beaumont
**Age:** 24
**Location:** Brussels, Belgium (Central European Time, GMT+1)
**Occupation:** Junior consultant at EU affairs firm
**Cultural Background:** Belgian, bilingual French-Flemish

Zoé is young, busy, and uses streaming to unwind after demanding workdays. She watches late at night when she should be sleeping, favoring binge-worthy series and easy-watching content. She's not a cinephile but appreciates quality entertainment that doesn't require too much mental energy after a long day. She's interested in contemporary European productions and relatable young-adult stories.

### Static Demographics

```yaml
demographics:
  age_range: "18-25"
  gender: "Female"
  location: "Europe - Belgium"
  timezone: "Central European Time (GMT+1)"
  city_type: "Urban - International/European capital"
  education: "Master's degree (Political Science)"
  household: "Shares apartment with 2 roommates"
  language_background: "French native, Flemish fluent, English fluent"
  cultural_identity: "Young European professional"
```

### Taste DNA Profile

```javascript
const zoéTasteDNA = {
  // Genre affinity scores
  genres: {
    comedy: 0.80,            // High - primary wind-down content
    drama: 0.70,             // High - character-driven stories
    romance: 0.75,           // High - contemporary romance
    thriller: 0.65,          // Medium-high - binge-worthy suspense
    documentary: 0.45,       // Medium - weekend viewing
    action: 0.40,            // Medium - occasional
    horror: 0.30,            // Low-medium - occasional scary series
  },

  // Mood/tone preferences
  tone: {
    lighthearted: 0.85,      // Very high - after-work preference
    heartwarming: 0.70,      // High - feel-good content
    thoughtProvoking: 0.50,  // Medium - occasional
    intense: 0.55,           // Medium - binge-worthy drama
    dark: 0.45,              // Medium - Nordic noir interest
    contemporary: 0.90,      // Very high - relatable content
  },

  // Pacing preferences
  pacing: {
    preference: 0.75,        // High - prefers engaging pacing
    toleranceForSlow: 0.35,  // Low - loses interest if slow
    needsAction: 0.60,       // Medium-high - wants engagement
    attentionSpan: 0.60,     // Medium - phone-distracted viewing
  },

  // Complexity tolerance
  complexity: {
    narrativeComplexity: 0.55,    // Medium - not too demanding
    cognitiveLoad: 0.40,          // Low-medium - tired after work
    subtletyAppreciation: 0.55,   // Medium - appreciates but doesn't require
    preferredPlotStructure: "episodic-with-arc", // Satisfying episodes + overall arc
  },

  // Violence/intensity thresholds
  intensity: {
    violenceTolerance: 0.50,      // Medium - context-dependent
    emotionalIntensity: 0.65,     // Medium-high - handles emotional content
    stressThreshold: 0.40,        // Low-medium - wants relaxation
    sexualContent: 0.70,          // High - young adult viewer
  },

  // Nostalgia vs novelty
  exploration: {
    nostalgiaPreference: 0.35,    // Low-medium - forward-looking
    noveltyPreference: 0.80,      // High - wants latest releases
    comfortZoneRisk: 0.70,        // High - adventurous within comfort
    culturalCuriosity: 0.75,      // High - European cultural exchange
  },
};
```

### History Signals

```javascript
const zoéHistorySignals = {
  // Completion patterns
  completion: {
    completionRate: 0.60,         // Medium - busy lifestyle
    abandonmentPattern: "after-episode-2", // Drops if not hooked
    episodeDropoffRate: 0.30,     // Medium-high - selective
    movieCompletionRate: 0.70,    // Medium-high for movies
  },

  // Rewatch behavior
  rewatch: {
    rewatchFrequency: 0.35,       // Low-medium - comfort rewatches
    rewatchReason: "comfort-viewing", // Background/sleep content
    favoriteRewatches: ["Call My Agent", "Dix Pour Cent", "Plan Coeur"],
    rewatchDelay: "3-6 months",   // Relatively short
  },

  // Viewing patterns
  patterns: {
    bingePropensity: 0.85,        // Very high - classic binger
    episodicPreference: 0.70,     // High - series over movies
    averageSessionLength: 90,     // 1.5 hours typical (2-3 episodes)
    multipleEpisodesLimit: 5,     // Can binge full seasons
    movieVsSeriesRatio: "20:80",  // Strong preference for series
  },

  // Peak viewing times
  schedule: {
    peakDays: ["Friday", "Saturday", "Sunday", "Wednesday"],
    peakTimes: ["22:30-01:00", "23:00-02:00"], // Late night binging
    weekendBehavior: "all-night-binge-sessions", // Weekend marathons
    devicePreference: "laptop-in-bed",           // Bedtime viewing
  },
};
```

### French Content Specifics

```javascript
const zoéFrenchProfile = {
  // Language fluency
  fluency: {
    overall: 1.0,                 // Native speaker (Belgian French)
    listening: 1.0,               // Perfect comprehension
    reading: 1.0,                 // Native literacy
    speaking: 1.0,                // Native fluency
    comprehensionSpeed: 1.0,      // No limitations
  },

  // Subtitle preferences
  subtitles: {
    preference: "english-subs-for-english-content", // Bilingual habits
    frenchSubsInterest: 0.10,     // Rarely uses
    dualSubtitles: false,         // Doesn't need
    subtitleDependency: 0.05,     // Essentially independent
  },

  // Content preferences
  preferences: {
    dialoguePreference: "contemporary-colloquial", // Modern French
    accentTolerance: 0.95,        // Handles all accents
    slangTolerance: 0.90,         // Comfortable with slang
    preferredDialect: "belgian-french", // Slight preference
    regionalToleranceLow: 0.90,   // Open to all francophone
  },

  // European cinema familiarity
  cinema: {
    familiarity: 0.50,            // Moderate - not cinephile
    favoriteDirectors: ["Contemporary TV showrunners"],
    classicExposure: 0.25,        // Limited classic knowledge
    contemporaryFocus: 0.95,      // Strongly contemporary
    arthouse_tolerance: 0.35,     // Low - prefers accessible
  },

  // Cultural context
  cultural: {
    frenchCultureKnowledge: 0.75,  // Good but not scholarly
    motivationForFrench: "native-entertainment", // Primary language
    europeanIdentityStrong: 0.85,  // Strong EU identity
    multilingualContext: 0.95,     // Highly multilingual environment
    youthCultureFocus: 0.90,       // Age-appropriate content important
  },
};
```

### Vector Representation

```javascript
const zoéVector = {
  comedy: 0.80, drama: 0.70, romance: 0.75, thriller: 0.65,
  lighthearted: 0.85, heartwarming: 0.70, contemporary: 0.90,
  fastPaced: 0.75, episodicArc: 0.85, accessibleNarrative: 0.75,
  culturalDepth: 0.60, frenchFluency: 1.0, subtitleDependency: 0.05,
  europeanCinema: 0.50, noveltyPreference: 0.80, completionRate: 0.60,
  bingePropensity: 0.85, lateNightViewer: 0.90,
};
```

---

## Persona 6: David - The Anglophone Culture Bridge

### Background Story

**Name:** David Thompson
**Age:** 55
**Location:** Toronto, Ontario (Eastern Time, GMT-5)
**Occupation:** Architect with international clients
**Cultural Background:** English-Canadian, studied in France

David doesn't speak French natively but developed fluency during graduate studies in Paris. He uses TV5MONDE to maintain his French and stay connected to French culture, which he loves. He's sophisticated, traveled, and appreciates European perspectives. He watches with English subtitles and prefers content that bridges cultures—French stories accessible to international audiences.

### Static Demographics

```yaml
demographics:
  age_range: "50+"
  gender: "Male"
  location: "North America - Ontario"
  timezone: "Eastern (GMT-5)"
  city_type: "Urban - Major multicultural city"
  education: "Master's degree (Architecture)"
  household: "Married, 1 teenager (age 16)"
  language_background: "English native, French fluent, Spanish basic"
  cultural_identity: "Cosmopolitan anglophone with francophile interests"
```

### Taste DNA Profile

```javascript
const davidTasteDNA = {
  // Genre affinity scores
  genres: {
    drama: 0.85,             // Very high - character-driven
    documentary: 0.75,       // High - architecture, design, culture
    thriller: 0.70,          // High - European thrillers
    comedy: 0.60,            // Medium-high - sophisticated humor
    romance: 0.50,           // Medium - European romance
    action: 0.35,            // Low-medium - occasional
    horror: 0.10,            // Very low - not interested
  },

  // Mood/tone preferences
  tone: {
    thoughtProvoking: 0.85,  // Very high - intellectual engagement
    intense: 0.65,           // Medium-high - sophisticated tension
    heartwarming: 0.55,      // Medium - occasional preference
    lighthearted: 0.50,      // Medium - balanced
    dark: 0.55,              // Medium - European noir
    sophisticated: 0.90,     // Very high - refinement important
  },

  // Pacing preferences
  pacing: {
    preference: 0.50,        // Medium - balanced pacing
    toleranceForSlow: 0.75,  // High - appreciates European pacing
    needsAction: 0.35,       // Low-medium - story over action
    attentionSpan: 0.85,     // Very high - focused viewer
  },

  // Complexity tolerance
  complexity: {
    narrativeComplexity: 0.80,    // High - enjoys layered stories
    cognitiveLoad: 0.75,          // High - intellectual viewer
    subtletyAppreciation: 0.85,   // Very high - refined taste
    preferredPlotStructure: "character-driven", // Depth over plot
  },

  // Violence/intensity thresholds
  intensity: {
    violenceTolerance: 0.60,      // Medium-high - mature viewer
    emotionalIntensity: 0.75,     // High - appreciates depth
    stressThreshold: 0.70,        // High - handles tension
    sexualContent: 0.65,          // Medium-high - European sensibility
  },

  // Nostalgia vs novelty
  exploration: {
    nostalgiaPreference: 0.55,    // Medium - balanced
    noveltyPreference: 0.70,      // High - culturally curious
    comfortZoneRisk: 0.75,        // High - adventurous viewer
    culturalCuriosity: 0.90,      // Very high - cross-cultural interest
  },
};
```

### History Signals

```javascript
const davidHistorySignals = {
  // Completion patterns
  completion: {
    completionRate: 0.80,         // High - committed viewer
    abandonmentPattern: "end-of-season", // Gives full seasons chance
    episodeDropoffRate: 0.15,     // Low - usually completes
    movieCompletionRate: 0.90,    // Very high for movies
  },

  // Rewatch behavior
  rewatch: {
    rewatchFrequency: 0.45,       // Medium - occasional rewatches
    rewatchReason: "language-maintenance", // Keep French active
    favoriteRewatches: ["Le Bureau des Légendes", "Engrenages", "Les Revenants"],
    rewatchDelay: "1-2 years",    // Medium intervals
  },

  // Viewing patterns
  patterns: {
    bingePropensity: 0.60,        // Medium-high - weekend viewing
    episodicPreference: 0.55,     // Medium - balanced
    averageSessionLength: 90,     // 1.5 hours typical
    multipleEpisodesLimit: 3,     // Moderate binging
    movieVsSeriesRatio: "45:55",  // Slight series preference
  },

  // Peak viewing times
  schedule: {
    peakDays: ["Saturday", "Sunday", "Tuesday"],
    peakTimes: ["21:00-23:00", "15:00-17:00"], // Evening + weekend afternoon
    weekendBehavior: "couple-viewing",          // Watches with spouse
    devicePreference: "smart-tv-living-room",   // Family viewing setup
  },
};
```

### French Content Specifics

```javascript
const davidFrenchProfile = {
  // Language fluency
  fluency: {
    overall: 0.75,                // Advanced/fluent (non-native)
    listening: 0.80,              // Strong comprehension
    reading: 0.85,                // Excellent reading (academic training)
    speaking: 0.70,               // Good but less practiced
    comprehensionSpeed: 0.75,     // Good but benefits from subs
  },

  // Subtitle preferences
  subtitles: {
    preference: "english-always", // Always uses English subs
    frenchSubsInterest: 0.40,     // Occasional interest
    dualSubtitles: false,         // Prefers English only
    subtitleDependency: 0.75,     // Moderately dependent
  },

  // Content preferences
  preferences: {
    dialoguePreference: "clear-standard-french", // Prefers standard dialect
    accentTolerance: 0.65,        // Handles standard French best
    slangTolerance: 0.50,         // Struggles with heavy slang
    preferredDialect: "parisian-standard", // Most familiar
    regionalToleranceLow: 0.50,   // Prefers standard French
  },

  // European cinema familiarity
  cinema: {
    familiarity: 0.75,            // Strong familiarity
    favoriteDirectors: ["François Ozon", "Jacques Audiard", "Claire Denis"],
    classicExposure: 0.65,        // Good classic knowledge
    contemporaryFocus: 0.80,      // Prefers contemporary
    arthouse_tolerance: 0.75,     // High appreciation
  },

  // Cultural context
  cultural: {
    frenchCultureKnowledge: 0.80,  // Strong cultural literacy
    motivationForFrench: "cultural-enrichment", // Personal enrichment
    parisYearsNostalgia: 0.85,     // Strong positive associations
    architecturalInterest: 0.95,   // Profession-related interest
    culturalBridgeIdentity: 0.90,  // Sees self as cultural bridge
  },
};
```

### Vector Representation

```javascript
const davidVector = {
  drama: 0.85, documentary: 0.75, thriller: 0.70, comedy: 0.60,
  thoughtProvoking: 0.85, sophisticated: 0.90, intense: 0.65,
  balanced: 0.50, characterDriven: 0.85, culturalDepth: 0.90,
  frenchFluency: 0.75, subtitleDependency: 0.75,
  europeanCinema: 0.75, crossCultural: 0.90, completionRate: 0.80,
  bingePropensity: 0.60, architectureInterest: 0.95,
};
```

---

## Persona Comparison Matrix

### Quick Reference Chart

| Dimension | Sophie (Learner) | Marc (Expat) | Amara (Pan-African) | Jean-Luc (Cinephile) | Zoé (Night Owl) | David (Anglophone) |
|-----------|-----------------|--------------|---------------------|---------------------|-----------------|-------------------|
| **Age Range** | 26-35 | 36-50 | 26-35 | 60+ | 18-25 | 50+ |
| **French Fluency** | 0.45 (B1-B2) | 1.0 (Native) | 0.85 (Near-native) | 1.0 (Native) | 1.0 (Native) | 0.75 (Fluent) |
| **Subtitle Dependency** | 0.90 (High) | 0.05 (None) | 0.20 (Low) | 0.0 (None) | 0.05 (None) | 0.75 (High) |
| **Complexity Tolerance** | 0.60 (Medium) | 0.95 (Very high) | 0.70 (High) | 1.0 (Maximum) | 0.55 (Medium) | 0.80 (High) |
| **Binge Propensity** | 0.45 (Medium) | 0.70 (High) | 0.55 (Medium) | 0.30 (Low) | 0.85 (Very high) | 0.60 (Med-high) |
| **Completion Rate** | 0.75 (High) | 0.90 (Very high) | 0.65 (Med-high) | 0.95 (Extremely high) | 0.60 (Medium) | 0.80 (High) |
| **Novelty Preference** | 0.85 (Very high) | 0.75 (High) | 0.85 (Very high) | 0.60 (Med-high) | 0.80 (High) | 0.70 (High) |
| **Top Genre 1** | Romance (0.80) | Drama (0.90) | Drama (0.85) | Drama (0.95) | Comedy (0.80) | Drama (0.85) |
| **Top Genre 2** | Drama (0.75) | Thriller (0.75) | Comedy (0.75) | Documentary (0.85) | Romance (0.75) | Documentary (0.75) |
| **Top Genre 3** | Comedy (0.70) | Documentary (0.70) | Romance (0.70) | Thriller (0.60) | Drama (0.70) | Thriller (0.70) |
| **Peak Viewing** | Weeknight evening | Weekend binges | Weekend social | Afternoon daily | Late night | Weekend couple |
| **Primary Motivation** | Language learning | Cultural identity | Pan-African representation | Artistic merit | Entertainment/relaxation | Cultural enrichment |

---

## Usage Recommendations

### For Recommendation Engine

**Matching Strategy by Persona Type:**

1. **Sophie (Learner)** - Prioritize:
   - Clear dialogue at moderate pace
   - Romance/drama with positive valence
   - Cultural authenticity markers
   - Subtitle quality indicators
   - Educational value signals

2. **Marc (Expat)** - Prioritize:
   - Critical acclaim scores
   - Narrative complexity
   - Quebec/Francophone cultural relevance
   - Auteur directors
   - Political/intellectual themes

3. **Amara (Pan-African)** - Prioritize:
   - African representation markers
   - Contemporary relevance
   - Social consciousness indicators
   - Pan-African production signals
   - Ensemble cast diversity

4. **Jean-Luc (Cinephile)** - Prioritize:
   - Arthouse/festival selections
   - Classic cinema connections
   - Artistic merit indicators
   - Slow cinema markers
   - French New Wave influences

5. **Zoé (Night Owl)** - Prioritize:
   - Binge-worthy series structure
   - Contemporary European productions
   - Accessible entertainment value
   - Engaging pacing
   - Young adult relevance

6. **David (Anglophone)** - Prioritize:
   - Cross-cultural appeal
   - Subtitle quality
   - Internationally acclaimed content
   - Cultural bridge themes
   - Professional/sophisticated content

### Dynamic Adjustment Factors

Even with static profiles, these contextual factors should modulate recommendations:

- **Time of day:** Late night → lighter content (even for Jean-Luc)
- **Day of week:** Weekend → longer/binge content
- **Recent viewing:** Avoid genre fatigue
- **Abandonment signals:** Adjust complexity down
- **Completion signals:** Confidence to suggest challenging content

---

## Conclusion

These six personas represent the diversity of TV5MONDE's audience across:
- **Age:** 18-67 (5 decades)
- **Geography:** North America, Europe, Africa
- **Language fluency:** 0.45-1.0 (Learner to native)
- **Cultural background:** 6 distinct cultural identities
- **Viewing styles:** Learner, expat, explorer, cinephile, binger, bridge

Each persona includes:
- ✅ Complete demographic profile
- ✅ 64-dimensional taste DNA
- ✅ Historical viewing patterns
- ✅ French language specifics
- ✅ Cultural context
- ✅ Vector representation for matching

**Next Steps:**
1. Validate personas with TV5MONDE user research data
2. Build persona detection quiz (2-3 rounds)
3. Create persona-specific recommendation weights
4. Test matching engine against persona expectations
5. Iterate based on actual user feedback

---

**Document Status:** Complete
**Next Document:** `/docs/research/08_user_personas_dynamic.md` (Dynamic/contextual attributes)
**Owner:** Research Agent
**Last Updated:** 2025-12-06
