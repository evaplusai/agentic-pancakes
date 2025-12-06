# TV5MONDE User Persona Dynamic Attributes System

**Research Document**
**Date:** 2025-12-06
**Source:** Content Discovery Research Analysis
**Focus:** Dynamic contextual factors that modify user recommendations in real-time

---

## Executive Summary

This document defines the **dynamic attribute system** for TV5MONDE user personas - the contextual, mood-based, and intent-driven factors that change per session and dramatically influence content recommendations. Unlike static "taste DNA" attributes (genre preferences, pacing tolerance, etc.), dynamic attributes capture the **current state** of the user at the moment of interaction.

**Key Principle:** The same user wants different content on Friday night (energized, social) vs. Tuesday morning (tired, alone) vs. Sunday afternoon (relaxed, curious).

**Dynamic Attribute Categories:**
1. **Context** - Environmental and situational factors
2. **Mood States** - Emotional and energy levels
3. **Intent** - Viewing goals and attention levels
4. **Session Modifiers** - Real-time preference adjustments

---

## 1. Context Attributes

Context captures the **external circumstances** of the viewing session that influence content appropriateness.

### 1.1 Time of Day Impact

**Attribute:** `timeOfDay`
**Type:** String enum
**Values:** `"morning"` | `"afternoon"` | `"evening"` | `"lateNight"`

**Behavioral Patterns:**

| Time Period | Typical Energy | Content Preference | Cognitive Load Tolerance |
|-------------|----------------|-------------------|-------------------------|
| **Morning (6am-12pm)** | Low → Rising | Light, educational, news | Low → Medium |
| **Afternoon (12pm-6pm)** | Medium → High | Engaging, stimulating | Medium → High |
| **Evening (6pm-10pm)** | High → Medium | Entertainment, relaxation | High → Medium |
| **Late Night (10pm-6am)** | Low → Very Low | Comfort, familiar, calming | Very Low |

**Recommendation Modifiers:**

```javascript
const timeOfDayModifiers = {
  morning: {
    boost: ["documentary", "educational", "uplifting", "light"],
    reduce: ["intense", "dark", "complex"],
    preferredRuntime: 30-60,  // minutes
    cognitiveLoadMax: 0.5
  },

  afternoon: {
    boost: ["engaging", "stimulating", "adventurous"],
    reduce: ["sleepy", "slow"],
    preferredRuntime: 45-120,
    cognitiveLoadMax: 0.8
  },

  evening: {
    boost: ["entertainment", "immersive", "social"],
    reduce: ["educational", "work-related"],
    preferredRuntime: 90-180,
    cognitiveLoadMax: 0.7
  },

  lateNight: {
    boost: ["comfort", "familiar", "calming", "low-stakes"],
    reduce: ["intense", "thriller", "horror"],
    preferredRuntime: 20-90,
    cognitiveLoadMax: 0.3,
    fallAsleepSafe: true
  }
};
```

### 1.2 Day of Week Patterns

**Attribute:** `dayOfWeek`
**Type:** String enum
**Values:** `"weekday"` | `"weekend"` | Specific days for advanced patterns

**Behavioral Patterns:**

| Day Type | Energy/Stress | Time Available | Social Context | Content Preference |
|----------|---------------|----------------|----------------|-------------------|
| **Weekday (Mon-Thu)** | Medium-High stress | Limited (30-90min) | Often solo | Quick, escapist, comfort |
| **Friday** | High energy, relief | Medium (90-180min) | Social possible | Celebratory, fun, energizing |
| **Saturday** | High energy, free | Unlimited | Social likely | Adventurous, binge-worthy |
| **Sunday** | Medium, anticipatory | Medium-High | Mixed | Comforting, quality, thoughtful |

**Recommendation Modifiers:**

```javascript
const dayOfWeekModifiers = {
  weekday: {
    maxRuntime: 90,
    preferEpisodic: true,
    stressRelief: 0.8,
    escapismBoost: 0.7,
    cognitiveLoadPreference: "low-medium"
  },

  friday: {
    energyMatch: "high",
    celebratoryBoost: 0.8,
    socialAppropriate: 0.9,
    allowLongerRuntime: true,
    funFactor: 0.9
  },

  saturday: {
    bingeEnabled: true,
    noTimeConstraints: true,
    socialContext: 0.7,
    adventurousBoost: 0.8,
    noveltyTolerance: 0.9
  },

  sunday: {
    qualityFocus: 0.9,
    thoughtfulContent: 0.8,
    comfortBoost: 0.7,
    anticipatoryRelaxation: 0.8,
    nostalgiaTolerance: 0.6
  }
};
```

### 1.3 Available Time

**Attribute:** `availableTime`
**Type:** Number (minutes) or String enum
**Values:** `30` | `60` | `120` | `180+` | `"unlimited"`

**Impact on Recommendations:**

```javascript
const timeAvailableFilters = {
  30: {
    runtimeMax: 35,
    preferFormat: ["short", "episode", "clip"],
    serialWarning: true,  // Don't start series
    completionRequired: true  // Must finish in session
  },

  60: {
    runtimeMax: 70,
    preferFormat: ["episode", "short-film", "feature-compact"],
    serialOK: true,
    completionPreferred: true
  },

  120: {
    runtimeMax: 130,
    preferFormat: ["feature", "multi-episode"],
    serialOK: true,
    bingeStart: "possible"
  },

  180: {
    runtimeMax: 200,
    preferFormat: ["feature", "mini-series", "binge"],
    serialOK: true,
    bingeStart: "encouraged"
  },

  unlimited: {
    noRuntimeConstraint: true,
    bingeOptimal: true,
    serialPreferred: true,
    multiFeaturePossible: true
  }
};
```

**Recommendation Strategy:**

- **30 minutes:** Recommend single episodes, shorts, or documentaries <35min
- **60 minutes:** Feature films <70min or 2-3 episodes
- **120 minutes:** Standard feature films or 3-5 episodes
- **180+ minutes:** Epic films, mini-series, or binge sessions
- **Unlimited:** Series deep dives, director retrospectives

### 1.4 Watching Situation

**Attribute:** `watchingWith`
**Type:** String enum
**Values:** `"alone"` | `"partner"` | `"family"` | `"friends"` | `"kids"`

**Social Context Impact:**

```javascript
const socialContextModifiers = {
  alone: {
    personalPreferenceWeight: 1.0,
    guiltPleasures: true,
    nicheTolerance: 0.9,
    pauseFlexibility: "high",
    attentionLevel: "flexible",
    familySafeRequired: false
  },

  partner: {
    preferenceBlending: true,
    romanticBoost: 0.6,
    dateAppropriate: 0.8,
    conversationStarters: 0.7,
    sharedExperienceFocus: true,
    familySafe: 0.7  // Depends on relationship
  },

  family: {
    familySafeRequired: true,
    familySafeMinimum: 0.85,
    ageAppropriate: true,
    universalAppeal: 0.8,
    offensiveContentFilter: "strict",
    educationalBonus: 0.5
  },

  friends: {
    groupFriendly: 0.9,
    conversationPotential: 0.8,
    controversyTolerance: "medium",
    funFactor: 0.9,
    socialCommentary: 0.6,
    familySafe: 0.6
  },

  kids: {
    familySafeRequired: true,
    familySafeMinimum: 0.95,
    educationalBonus: 0.8,
    ageAppropriate: true,
    violenceFilter: "strict",
    complexityMax: 0.4
  }
};
```

**Content Filtering Rules:**

| Social Context | Family Safe Min | Violence Max | Sexual Content Max | Language Filter |
|----------------|-----------------|--------------|-------------------|----------------|
| **Alone** | 0.0 | 1.0 | 1.0 | None |
| **Partner** | 0.5 | 0.7 | 0.7 | Moderate |
| **Family** | 0.85 | 0.3 | 0.2 | Strict |
| **Friends** | 0.6 | 0.6 | 0.5 | Moderate |
| **Kids** | 0.95 | 0.1 | 0.0 | Very Strict |

### 1.5 Device Context

**Attribute:** `device`
**Type:** String enum
**Values:** `"tv"` | `"laptop"` | `"mobile"` | `"tablet"`

**Device Impact on Experience:**

```javascript
const deviceContextModifiers = {
  tv: {
    visuallyStunning: 0.9,
    cinematicBoost: 0.9,
    attentionLevel: "high",
    audioQualityImportant: true,
    subtitleReadability: "excellent",
    socialViewing: "likely",
    optimalRuntime: "90-180min"
  },

  laptop: {
    flexibleViewing: true,
    attentionLevel: "medium-high",
    pausingLikely: true,
    multitaskingPossible: true,
    subtitleReadability: "good",
    socialViewing: "unlikely",
    optimalRuntime: "45-120min"
  },

  mobile: {
    attentionLevel: "low-medium",
    backgroundViewing: "common",
    visualDetailLost: true,
    subtitleReadability: "poor",
    preferSimplePlots: true,
    shortFormPreferred: true,
    socialViewing: "rare",
    optimalRuntime: "10-45min"
  },

  tablet: {
    attentionLevel: "medium",
    casualViewing: true,
    portableContext: true,
    subtitleReadability: "fair",
    socialViewing: "occasional",
    optimalRuntime: "30-90min"
  }
};
```

**Recommendation Adjustments:**

- **TV:** Favor visually stunning, cinematic content
- **Laptop:** Allow complex plots, assume focused viewing
- **Mobile:** Recommend dialogue-heavy, simple plots, short runtime
- **Tablet:** Balanced recommendations, medium runtime

---

## 2. Mood States

Mood captures the **internal emotional state** of the user at the moment of interaction.

### 2.1 Energy Level

**Attribute:** `currentEnergy`
**Type:** Number (0-1 scale)
**Values:**
- `0.0-0.2` - Exhausted
- `0.2-0.4` - Low energy
- `0.4-0.6` - Moderate
- `0.6-0.8` - Energized
- `0.8-1.0` - Highly energized

**Content Matching by Energy:**

```javascript
const energyContentMapping = {
  exhausted: {
    range: [0.0, 0.2],
    contentEnergy: 0.1-0.3,
    preferences: {
      pacing: "slow",
      complexity: "minimal",
      emotionalIntensity: "low",
      visualStyle: "calming",
      cognitiveLoad: 0.1-0.2
    },
    boost: ["comfort-watch", "familiar", "predictable", "soothing"],
    avoid: ["thriller", "intense", "complex", "demanding"]
  },

  lowEnergy: {
    range: [0.2, 0.4],
    contentEnergy: 0.2-0.5,
    preferences: {
      pacing: "moderate",
      complexity: "light",
      emotionalIntensity: "low-medium",
      visualStyle: "pleasant",
      cognitiveLoad: 0.2-0.4
    },
    boost: ["easy-watch", "feel-good", "light-hearted"],
    avoid: ["heavy", "dark", "intellectually-demanding"]
  },

  moderate: {
    range: [0.4, 0.6],
    contentEnergy: 0.4-0.7,
    preferences: {
      pacing: "flexible",
      complexity: "medium",
      emotionalIntensity: "medium",
      visualStyle: "varied",
      cognitiveLoad: 0.4-0.6
    },
    boost: ["balanced", "engaging", "satisfying"],
    avoid: ["extremes"]
  },

  energized: {
    range: [0.6, 0.8],
    contentEnergy: 0.6-0.9,
    preferences: {
      pacing: "fast",
      complexity: "medium-high",
      emotionalIntensity: "high",
      visualStyle: "dynamic",
      cognitiveLoad: 0.6-0.8
    },
    boost: ["exciting", "engaging", "stimulating", "adventure"],
    avoid: ["slow", "quiet", "meditative"]
  },

  highlyEnergized: {
    range: [0.8, 1.0],
    contentEnergy: 0.8-1.0,
    preferences: {
      pacing: "very-fast",
      complexity: "high",
      emotionalIntensity: "intense",
      visualStyle: "kinetic",
      cognitiveLoad: 0.7-0.9
    },
    boost: ["action", "thriller", "intense", "challenging"],
    avoid: ["slow-burn", "contemplative", "quiet"]
  }
};
```

### 2.2 Emotional Goal

**Attribute:** `emotionalGoal`
**Type:** String enum or Array (multiple goals possible)
**Values:** `"escape"` | `"learn"` | `"feel"` | `"laugh"` | `"challenged"` | `"comforted"` | `"inspired"`

**Goal-to-Content Mapping:**

```javascript
const emotionalGoalMapping = {
  escape: {
    description: "Transport me away from current reality",
    contentAttributes: {
      immersion: 0.9,
      worldBuilding: 0.8,
      fantasyElements: 0.7,
      realismAvoid: true
    },
    boost: ["fantasy", "sci-fi", "adventure", "period-piece"],
    avoid: ["documentary", "news", "current-events"],
    emotionalDistance: "high"
  },

  learn: {
    description: "Expand my knowledge or perspective",
    contentAttributes: {
      educational: 0.9,
      thoughtProvoking: 0.8,
      culturalDepth: 0.8,
      factualAccuracy: 0.9
    },
    boost: ["documentary", "historical", "biographical", "cultural"],
    avoid: ["fantasy", "escapist", "formulaic"],
    cognitiveEngagement: "high"
  },

  feel: {
    description: "Experience deep emotions",
    contentAttributes: {
      emotionalIntensity: 0.9,
      characterDepth: 0.9,
      dramaticArc: 0.8,
      catharsis: 0.8
    },
    boost: ["drama", "romance", "character-driven"],
    avoid: ["action-focused", "plot-over-character"],
    emotionalVulnerability: "high"
  },

  laugh: {
    description: "Joy, humor, lightheartedness",
    contentAttributes: {
      humorLevel: 0.9,
      lighthearted: 0.8,
      positiveValence: 0.8,
      funFactor: 0.9
    },
    boost: ["comedy", "romantic-comedy", "satire"],
    avoid: ["dark", "tragic", "heavy"],
    moodLift: true
  },

  challenged: {
    description: "Intellectually or emotionally challenged",
    contentAttributes: {
      complexity: 0.9,
      ambiguity: 0.7,
      unconventional: 0.8,
      thoughtProvoking: 0.9
    },
    boost: ["art-house", "experimental", "philosophical"],
    avoid: ["formulaic", "predictable", "simple"],
    cognitiveLoad: "high"
  },

  comforted: {
    description: "Feel safe, warm, reassured",
    contentAttributes: {
      warmth: 0.9,
      familiarity: 0.8,
      positiveEndings: 0.9,
      emotionalSafety: 0.9
    },
    boost: ["feel-good", "heartwarming", "nostalgic", "wholesome"],
    avoid: ["dark", "tragic", "unsettling", "ambiguous-endings"],
    emotionalSafety: "required"
  },

  inspired: {
    description: "Feel motivated, uplifted, empowered",
    contentAttributes: {
      inspirational: 0.9,
      triumphant: 0.8,
      aspirational: 0.8,
      positiveValence: 0.9
    },
    boost: ["biographical", "triumph-over-adversity", "sports", "achievement"],
    avoid: ["cynical", "defeatist", "dark"],
    uplift: true
  }
};
```

### 2.3 Stress Level

**Attribute:** `stressLevel`
**Type:** String enum or Number (0-1)
**Values:** `"low"` | `"medium"` | `"high"` or `0.0-1.0`

**Stress-Based Content Adjustment:**

```javascript
const stressLevelModifiers = {
  low: {
    range: [0.0, 0.3],
    openness: 0.9,
    noveltyTolerance: 0.9,
    complexityTolerance: 0.8,
    riskTolerance: 0.8,
    contentStrategy: "adventurous"
  },

  medium: {
    range: [0.3, 0.7],
    openness: 0.6,
    noveltyTolerance: 0.6,
    complexityTolerance: 0.5,
    riskTolerance: 0.5,
    contentStrategy: "balanced"
  },

  high: {
    range: [0.7, 1.0],
    openness: 0.2,
    noveltyTolerance: 0.2,
    complexityTolerance: 0.3,
    riskTolerance: 0.1,
    contentStrategy: "comfort-zone",
    boostFamiliar: 0.9,
    avoidStressors: ["intense", "dark", "complex", "unpredictable"]
  }
};
```

**High Stress Recommendations:**
- Favor familiar content (rewatches, comfort shows)
- Avoid unpredictable plots or dark themes
- Prefer simple, linear narratives
- Boost feel-good, positive content
- Recommend proven crowd-pleasers

### 2.4 Current Emotional State

**Attribute:** `currentEmotion`
**Type:** String enum or Object with valence/arousal
**Values:** `"happy"` | `"sad"` | `"anxious"` | `"bored"` | `"curious"` | `"angry"` | `"nostalgic"`

**Emotion-Driven Content Strategy:**

```javascript
const emotionalStateStrategies = {
  happy: {
    strategy: "match-and-elevate",
    boost: ["uplifting", "joyful", "celebratory"],
    avoid: ["depressing", "dark"],
    valenceBias: 0.7
  },

  sad: {
    strategy: "comfort-or-catharsis",
    options: {
      comfort: {
        boost: ["heartwarming", "uplifting", "hopeful"],
        avoid: ["tragic", "bittersweet"]
      },
      catharsis: {
        boost: ["emotional", "cathartic", "beautiful-sadness"],
        allowTragic: true
      }
    },
    askUser: "Do you want to feel better, or feel your feelings?"
  },

  anxious: {
    strategy: "calm-and-distract",
    boost: ["calming", "predictable", "comforting", "low-stakes"],
    avoid: ["thriller", "suspense", "intense", "chaotic"],
    cognitiveLoadMax: 0.4,
    emotionalIntensityMax: 0.3
  },

  bored: {
    strategy: "stimulate-and-engage",
    boost: ["exciting", "surprising", "fast-paced", "novel"],
    avoid: ["slow", "predictable", "familiar"],
    noveltyPreference: 0.9,
    pacingMin: 0.7
  },

  curious: {
    strategy: "educate-and-explore",
    boost: ["documentary", "cultural", "thought-provoking", "unusual"],
    avoid: ["formulaic", "mindless"],
    educationalBonus: 0.8,
    culturalBonus: 0.8
  },

  angry: {
    strategy: "channel-or-calm",
    options: {
      channel: {
        boost: ["action", "cathartic", "justice", "triumph"],
        allowViolence: true
      },
      calm: {
        boost: ["soothing", "gentle", "hopeful"],
        avoidViolence: true
      }
    },
    askUser: "Do you want something intense, or something calming?"
  },

  nostalgic: {
    strategy: "embrace-nostalgia",
    boost: ["classic", "period-piece", "throwback", "familiar"],
    avoid: ["ultra-modern", "futuristic"],
    timePreference: "past",
    familiarityBonus: 0.9
  }
};
```

---

## 3. Intent Categories

Intent captures the **viewing purpose** - what the user wants to get out of the session.

### 3.1 Intent Definitions

**Attribute:** `viewingIntent`
**Type:** String enum
**Values:** `"background"` | `"engage"` | `"fall-asleep"` | `"learn"` | `"feel"` | `"entertain"`

### 3.2 Intent-Based Content Matching

```javascript
const intentContentProfiles = {
  background: {
    name: "Just background noise",
    attentionRequired: 0.1-0.3,
    description: "Content that works with divided attention",
    contentAttributes: {
      plotComplexity: 0.2,
      visuallyDemanding: false,
      dialogueHeavy: true,
      episodic: true,
      rewatch: "ideal"
    },
    boost: ["sitcom", "familiar", "episodic", "predictable"],
    avoid: ["complex-plot", "visual-spectacle", "requires-attention"],
    pauseTolerance: "high",
    missedScenesPenalty: "low"
  },

  engage: {
    name: "Really engage",
    attentionRequired: 0.8-1.0,
    description: "Content demanding full attention",
    contentAttributes: {
      plotComplexity: 0.7-1.0,
      visuallyDemanding: true,
      characterDepth: 0.8,
      thematicRichness: 0.8,
      rewatch: "valuable"
    },
    boost: ["complex", "layered", "cinematic", "thought-provoking"],
    avoid: ["shallow", "formulaic", "background-appropriate"],
    immersionRequired: true,
    distractionPenalty: "high"
  },

  fallAsleep: {
    name: "Fall asleep to",
    attentionRequired: 0.1-0.2,
    description: "Calming content for sleep transition",
    contentAttributes: {
      calmingScore: 0.9,
      stimulationLevel: 0.1,
      loudNoises: false,
      suspense: false,
      emotionalIntensity: 0.2
    },
    boost: ["calming", "gentle", "nature", "low-key", "familiar"],
    avoid: ["thriller", "horror", "loud", "intense", "surprising"],
    audioProfile: "consistent-quiet",
    visualProfile: "soothing",
    sleepSafe: true
  },

  learnSomething: {
    name: "Learn something",
    attentionRequired: 0.6-0.9,
    description: "Educational and informative content",
    contentAttributes: {
      educational: 0.9,
      factual: 0.8,
      informative: 0.9,
      culturalValue: 0.8,
      knowledgeGain: true
    },
    boost: ["documentary", "educational", "historical", "cultural", "biographical"],
    avoid: ["pure-entertainment", "fantasy", "mindless"],
    cognitiveEngagement: "high",
    retentionFocus: true
  },

  feelSomething: {
    name: "Feel something",
    attentionRequired: 0.7-0.9,
    description: "Emotionally impactful content",
    contentAttributes: {
      emotionalIntensity: 0.8-1.0,
      characterDepth: 0.9,
      emotionalRange: "wide",
      catharsis: 0.8,
      heartStrings: 0.9
    },
    boost: ["drama", "emotional", "character-driven", "moving"],
    avoid: ["emotionally-flat", "action-focused", "comedy-only"],
    emotionalJourney: "required",
    cryingAllowed: true
  },

  entertain: {
    name: "Be entertained",
    attentionRequired: 0.5-0.7,
    description: "Fun, enjoyable, satisfying content",
    contentAttributes: {
      entertainmentValue: 0.9,
      funFactor: 0.8,
      satisfaction: 0.8,
      pacing: 0.7,
      enjoyability: 0.9
    },
    boost: ["crowd-pleaser", "fun", "engaging", "satisfying"],
    avoid: ["boring", "slow", "difficult"],
    enjoymentPriority: "highest",
    massPapeal: 0.8
  }
};
```

### 3.3 Intent Impact on Recommendation Algorithm

```javascript
function adjustRecommendationsByIntent(baseRecommendations, intent) {
  const intentProfile = intentContentProfiles[intent];

  return baseRecommendations
    .filter(content => {
      // Filter by attention requirements
      if (content.attentionRequired > intentProfile.attentionRequired[1]) {
        return false;
      }

      // Apply intent-specific filters
      for (let avoidTag of intentProfile.avoid) {
        if (content.tags.includes(avoidTag)) return false;
      }

      return true;
    })
    .map(content => {
      let score = content.baseScore;

      // Boost matching tags
      for (let boostTag of intentProfile.boost) {
        if (content.tags.includes(boostTag)) {
          score *= 1.3;
        }
      }

      // Apply attribute matching
      for (let [attr, value] of Object.entries(intentProfile.contentAttributes)) {
        if (typeof value === 'number') {
          const match = 1 - Math.abs(content[attr] - value);
          score *= (1 + match * 0.2);
        }
      }

      return { ...content, intentAdjustedScore: score };
    })
    .sort((a, b) => b.intentAdjustedScore - a.intentAdjustedScore);
}
```

---

## 4. Session Modifiers - Combined Dynamic State

### 4.1 Complete Session State Object

```javascript
const sessionDynamicState = {
  // === CONTEXT ===
  context: {
    timeOfDay: "evening",           // morning | afternoon | evening | lateNight
    dayOfWeek: "friday",            // weekday | weekend | friday | saturday | sunday
    availableTime: 120,             // minutes
    watchingWith: "partner",        // alone | partner | family | friends | kids
    device: "tv",                   // tv | laptop | mobile | tablet
    weather: "rainy",               // Optional: sunny | rainy | snowy | etc.
    location: "home"                // Optional: home | commute | travel | etc.
  },

  // === MOOD ===
  mood: {
    currentEnergy: 0.40,            // 0.0 (exhausted) - 1.0 (energized)
    emotionalGoal: "escape",        // escape | learn | feel | laugh | challenged | comforted | inspired
    stressLevel: 0.65,              // 0.0 (relaxed) - 1.0 (highly stressed)
    currentEmotion: "tired",        // happy | sad | anxious | bored | curious | angry | nostalgic

    // Derived psychological dimensions
    valence: 0.20,                  // -1.0 (negative) - 1.0 (positive)
    arousal: 0.25,                  // 0.0 (calm) - 1.0 (activated)
    openness: 0.40                  // 0.0 (closed) - 1.0 (open to new)
  },

  // === INTENT ===
  intent: {
    viewingIntent: "engage",        // background | engage | fall-asleep | learn | feel | entertain
    attentionLevel: 0.70,           // 0.0 (none) - 1.0 (full focus)
    completionIntent: true,         // Do they intend to finish?
    bingeIntent: false,             // Planning to watch multiple?

    // Specific needs
    needs: {
      comfort: 0.75,                // Need for familiar, safe content
      stimulation: 0.20,            // Need for exciting, novel content
      escape: 0.60,                 // Need to disconnect from reality
      connection: 0.40,             // Need to feel understood, less alone
      growth: 0.15,                 // Need to learn, expand perspective
      catharsis: 0.30,              // Need for emotional release
      joy: 0.50,                    // Need for laughter, happiness
      relaxation: 0.80              // Need to unwind, decompress
    }
  },

  // === CONSTRAINTS ===
  constraints: {
    runtimeMax: 130,                // Derived from availableTime
    familySafeMin: 0.7,             // Derived from watchingWith
    violenceMax: 0.5,               // Derived from watchingWith + mood
    complexityMax: 0.6,             // Derived from energy + intent
    cognitiveLoadMax: 0.5           // Derived from energy + stress
  },

  // === SESSION METADATA ===
  session: {
    sessionId: "session_123",
    timestamp: "2025-12-06T20:47:00Z",
    recentAbandons: ["thriller", "horror"],  // Recently abandoned genres
    recentCompletions: ["comedy", "drama"],  // Recently finished genres
    currentStreak: "feel-good-friday",       // Detected behavioral pattern
    moodTrend: "declining-energy"            // Energy trend in session
  }
};
```

### 4.2 Dynamic State Initialization

**From Natural Language Input:**

```javascript
async function extractDynamicState(userInput, ambientContext) {
  // User input: "Ugh, brutal week. Need something light. Got about 2 hours before bed."

  const extracted = await aiAgent.extract({
    input: userInput,
    context: ambientContext,
    extractFields: [
      "emotionalState",
      "energyLevel",
      "timeAvailable",
      "emotionalGoal",
      "stressLevel",
      "preferences",
      "constraints"
    ]
  });

  return {
    context: {
      timeOfDay: ambientContext.timeOfDay,              // "evening"
      dayOfWeek: ambientContext.dayOfWeek,              // "friday"
      availableTime: extracted.timeAvailable || 120,    // "2 hours" → 120
      watchingWith: ambientContext.socialContext || "alone",
      device: ambientContext.device || "tv"
    },

    mood: {
      currentEnergy: extracted.energyLevel || 0.20,     // "brutal week" → low
      emotionalGoal: extracted.emotionalGoal || "escape", // "need something" → escape
      stressLevel: extracted.stressLevel || 0.75,       // "brutal week" → high
      currentEmotion: extracted.emotion || "exhausted", // "ugh" → exhausted
      valence: -0.20,                                    // Negative mood detected
      arousal: 0.20,                                     // Low activation
      openness: 0.30                                     // Closed to complexity
    },

    intent: {
      viewingIntent: "engage",                           // Wants to watch, not background
      attentionLevel: 0.50,                              // Medium attention capacity
      completionIntent: true,                            // "2 hours" suggests full feature
      bingeIntent: false,

      needs: {
        comfort: 0.85,      // "something light"
        escape: 0.80,       // "brutal week" → need escape
        relaxation: 0.90,   // Pre-bed, stressed
        stimulation: 0.20,  // Low energy
        joy: 0.70           // "light" suggests positive
      }
    },

    constraints: {
      runtimeMax: 130,               // 2 hours + buffer
      complexityMax: 0.40,           // Low energy → simple
      cognitiveLoadMax: 0.30,        // Exhausted → minimal load
      darknessMax: 0.30              // "light" → avoid dark content
    }
  };
}
```

**From Quiz/Form:**

```javascript
const quizBasedDynamicState = {
  // Question 1: "How are you feeling right now?"
  // Answer: Slider from "Exhausted" to "Energized" → 0.35
  mood: {
    currentEnergy: 0.35,
    // ... derived from answer
  },

  // Question 2: "What's your mood tonight?"
  // Answer: Multiple choice → "Relaxed but curious"
  mood: {
    currentEmotion: "curious",
    stressLevel: 0.30,
    openness: 0.70
  },

  // Question 3: "How much time do you have?"
  // Answer: "About 90 minutes"
  context: {
    availableTime: 90
  },

  // Question 4: "What are you in the mood for?"
  // Answer: "Something that makes me laugh"
  mood: {
    emotionalGoal: "laugh"
  },
  intent: {
    needs: { joy: 0.95 }
  }
};
```

### 4.3 Dynamic State Modification During Session

As the user interacts, the dynamic state evolves:

```javascript
function updateDynamicState(currentState, userAction) {
  switch (userAction.type) {
    case "reject_recommendation":
      // User rejected a thriller
      return {
        ...currentState,
        session: {
          ...currentState.session,
          recentAbandons: [...currentState.session.recentAbandons, userAction.genre]
        },
        constraints: {
          ...currentState.constraints,
          // Increase filter strength for rejected genre
          genreExclusions: [...currentState.constraints.genreExclusions, userAction.genre]
        }
      };

    case "request_refinement":
      // User says "something lighter"
      return {
        ...currentState,
        mood: {
          ...currentState.mood,
          emotionalGoal: "laugh"  // Shift goal
        },
        constraints: {
          ...currentState.constraints,
          darknessMax: Math.min(currentState.constraints.darknessMax, 0.25)
        }
      };

    case "time_passing":
      // 30 minutes elapsed
      return {
        ...currentState,
        context: {
          ...currentState.context,
          availableTime: currentState.context.availableTime - 30
        },
        mood: {
          ...currentState.mood,
          currentEnergy: currentState.mood.currentEnergy * 0.90  // Energy decay
        }
      };
  }
}
```

---

## 5. Recommendation Scoring with Dynamic Attributes

### 5.1 Complete Scoring Formula

```javascript
function calculateFinalScore(content, userProfile, dynamicState) {
  // Base vector similarity (static taste match)
  const baseMatch = cosineSimilarity(
    userProfile.staticVector,
    content.contentVector
  );

  // === DYNAMIC MODIFIERS ===

  // 1. Context Matching
  const contextScore = calculateContextMatch(content, dynamicState.context);

  // 2. Mood Alignment
  const moodScore = calculateMoodAlignment(content, dynamicState.mood);

  // 3. Intent Satisfaction
  const intentScore = calculateIntentMatch(content, dynamicState.intent);

  // 4. Constraint Compliance
  const constraintScore = checkConstraints(content, dynamicState.constraints);

  // 5. Trending Boost
  const trendingScore = content.trendingRank ? (100 - content.trendingRank) / 100 : 0.5;

  // === WEIGHTED COMBINATION ===
  const finalScore = (
    baseMatch * 0.25 +              // Static taste (25%)
    moodScore * 0.30 +              // Current mood (30%) - HIGHEST WEIGHT
    intentScore * 0.20 +            // Viewing intent (20%)
    contextScore * 0.15 +           // Situational context (15%)
    trendingScore * 0.10            // What's hot (10%)
  ) * constraintScore;              // Hard constraints (multiply, 0 or 1)

  return {
    content,
    finalScore,
    breakdown: {
      baseMatch,
      contextScore,
      moodScore,
      intentScore,
      constraintScore,
      trendingScore
    }
  };
}
```

### 5.2 Context Matching Function

```javascript
function calculateContextMatch(content, context) {
  let score = 1.0;

  // Time of day matching
  const timeModifiers = timeOfDayModifiers[context.timeOfDay];
  for (let boostTag of timeModifiers.boost) {
    if (content.tags.includes(boostTag)) score *= 1.2;
  }
  for (let reduceTag of timeModifiers.reduce) {
    if (content.tags.includes(reduceTag)) score *= 0.7;
  }

  // Runtime matching
  if (content.runtime > context.availableTime + 10) {
    score *= 0.3;  // Heavy penalty for too long
  }

  // Social context matching
  const socialMod = socialContextModifiers[context.watchingWith];
  if (content.familySafe < socialMod.familySafeMinimum) {
    score = 0;  // Hard fail
  }
  score *= content.socialFit[context.watchingWith] || 0.7;

  // Device optimization
  const deviceMod = deviceContextModifiers[context.device];
  if (context.device === "mobile" && content.visualComplexity > 0.7) {
    score *= 0.6;  // Visually complex content on small screen
  }

  return Math.min(score, 1.0);
}
```

### 5.3 Mood Alignment Function

```javascript
function calculateMoodAlignment(content, mood) {
  let score = 1.0;

  // Energy matching (most important)
  const energyDelta = Math.abs(content.energyRequired - mood.currentEnergy);
  const energyMatch = 1 - energyDelta;
  score *= (0.5 + energyMatch * 0.5);  // 50% base + 50% from match

  // Emotional goal matching
  const goalProfile = emotionalGoalMapping[mood.emotionalGoal];
  for (let boostTag of goalProfile.boost) {
    if (content.tags.includes(boostTag)) score *= 1.3;
  }
  for (let avoidTag of goalProfile.avoid) {
    if (content.tags.includes(avoidTag)) score *= 0.5;
  }

  // Stress level consideration
  if (mood.stressLevel > 0.7) {
    // High stress: boost familiar, reduce novel
    if (content.familiarityScore > 0.7) score *= 1.4;
    if (content.complexityScore > 0.6) score *= 0.6;
  }

  // Needs satisfaction
  for (let [need, importance] of Object.entries(mood.needs)) {
    if (importance > 0.6) {  // High importance
      const contentSatisfaction = content.serves[need] || 0;
      score *= (1 + contentSatisfaction * importance * 0.3);
    }
  }

  return score;
}
```

### 5.4 Intent Matching Function

```javascript
function calculateIntentMatch(content, intent) {
  const intentProfile = intentContentProfiles[intent.viewingIntent];
  let score = 1.0;

  // Attention level matching
  if (content.attentionRequired > intentProfile.attentionRequired[1]) {
    score *= 0.4;  // Content too demanding for intent
  } else if (content.attentionRequired < intentProfile.attentionRequired[0]) {
    score *= 0.7;  // Content too light for intent
  }

  // Intent-specific attribute matching
  for (let [attr, targetValue] of Object.entries(intentProfile.contentAttributes)) {
    if (typeof targetValue === 'number') {
      const delta = Math.abs(content[attr] - targetValue);
      const match = 1 - Math.min(delta, 1);
      score *= (0.8 + match * 0.2);
    } else if (typeof targetValue === 'boolean') {
      if (content[attr] === targetValue) score *= 1.1;
      else score *= 0.8;
    }
  }

  // Boost/avoid tags
  for (let boostTag of intentProfile.boost) {
    if (content.tags.includes(boostTag)) score *= 1.25;
  }
  for (let avoidTag of intentProfile.avoid) {
    if (content.tags.includes(avoidTag)) score *= 0.6;
  }

  return score;
}
```

---

## 6. Practical Examples

### Example 1: Friday Night, Energized with Partner

```javascript
const dynamicState = {
  context: {
    timeOfDay: "evening",
    dayOfWeek: "friday",
    availableTime: 180,
    watchingWith: "partner",
    device: "tv"
  },
  mood: {
    currentEnergy: 0.75,
    emotionalGoal: "laugh",
    stressLevel: 0.30,
    currentEmotion: "happy"
  },
  intent: {
    viewingIntent: "entertain",
    needs: { joy: 0.90, connection: 0.60 }
  }
};

// Recommended: Upbeat romantic comedy, 100-120min
// "The Intouchables" - French feel-good comedy-drama
```

### Example 2: Weeknight, Exhausted, Alone

```javascript
const dynamicState = {
  context: {
    timeOfDay: "lateNight",
    dayOfWeek: "weekday",
    availableTime: 45,
    watchingWith: "alone",
    device: "laptop"
  },
  mood: {
    currentEnergy: 0.15,
    emotionalGoal: "comforted",
    stressLevel: 0.80,
    currentEmotion: "exhausted"
  },
  intent: {
    viewingIntent: "fall-asleep",
    needs: { comfort: 0.95, relaxation: 0.95 }
  }
};

// Recommended: Familiar sitcom episode, 22min
// Something calming, no sudden noises or suspense
```

### Example 3: Sunday Afternoon, Curious

```javascript
const dynamicState = {
  context: {
    timeOfDay: "afternoon",
    dayOfWeek: "sunday",
    availableTime: 120,
    watchingWith: "alone",
    device: "tv"
  },
  mood: {
    currentEnergy: 0.60,
    emotionalGoal: "learn",
    stressLevel: 0.20,
    currentEmotion: "curious"
  },
  intent: {
    viewingIntent: "learn",
    needs: { growth: 0.90, stimulation: 0.70 }
  }
};

// Recommended: French documentary or cultural film
// Intellectually engaging, 90-110min
```

---

## 7. Implementation Guidelines

### 7.1 Minimum Viable Dynamic System

**Essential Attributes (Phase 1):**
1. `currentEnergy` (0-1)
2. `availableTime` (minutes)
3. `watchingWith` (social context)
4. `emotionalGoal` (primary need)

**Simple Scoring:**
```javascript
const simpleScore = (
  baseMatch * 0.40 +
  energyMatch * 0.30 +
  timeMatch * 0.20 +
  socialMatch * 0.10
);
```

### 7.2 Full-Featured Dynamic System

**All Attributes (Phase 2):**
- Complete context (time, day, device, weather)
- Full mood state (energy, valence, arousal, stress, emotion)
- Detailed intent (viewing purpose, attention level, needs)
- Comprehensive constraints

**Advanced Scoring:**
Use full formula with 5+ dynamic factors and real-time session updates.

### 7.3 Dynamic State Capture Methods

**Method 1: Natural Language (Recommended)**
```
"Hey, how are you feeling tonight?"
→ AI extracts dynamic state from conversational input
```

**Method 2: Smart Quiz (2-3 questions)**
```
Q1: Energy slider (exhausted → energized)
Q2: "What do you need?" (laugh | escape | learn | feel)
Q3: Time available dropdown
```

**Method 3: Ambient Detection (Advanced)**
```
- Time/day from system clock
- Recent viewing patterns
- Device detection
- Location context (home vs mobile)
```

---

## 8. Conclusion

Dynamic attributes are the **secret sauce** of personalized content discovery. While static taste profiles tell you what a user *generally* likes, dynamic attributes tell you what they need **right now**.

**Key Principles:**

1. **Context is King:** Same user wants different content Friday 9pm vs Tuesday 11pm
2. **Mood Matters Most:** Energy level and emotional state are the strongest predictors
3. **Intent Guides Experience:** Background vs. engagement vs. sleep require completely different content
4. **Real-Time Evolution:** Dynamic state changes within a single session

**Implementation Priority:**

1. **Start with energy + time + social context** (80% of value)
2. **Add emotional goal** (15% additional value)
3. **Layer in advanced mood/intent** (5% additional value, high complexity)

**Success Metric:**

> "Can the system recommend content that feels **perfect for this exact moment**, not just generally aligned with taste?"

When dynamic attributes are properly implemented, users should experience the system as emotionally intelligent - understanding not just what they like, but **how they feel right now** and **what they need from this viewing session**.

---

**Document Complete**

**Next Steps:**
1. Integrate dynamic state capture into quiz/input flow
2. Implement dynamic scoring modifiers
3. Test with real user scenarios across different contexts
4. Measure improvement in first-recommendation acceptance rate

**Related Documents:**
- `/docs/research/02_content_discovery_architecture.md` - System architecture
- `/docs/initial/00_content_discovery_research.md` - Full research source
- `/docs/research/01_hackathon_requirements.md` - Project requirements

**File Location:** `/home/evafive/agentic-pancakes/docs/research/08_user_personas_dynamic.md`
