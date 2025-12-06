# AgentDB v2.0 Enhancement Proposal for TV5MONDE Discovery System
## Transforming from MVP to 10-Year Self-Learning Platform

**Version**: 2.0
**Date**: 2025-12-06
**Author**: System Architecture Designer
**Status**: Proposed Enhancements

---

## Executive Summary

The current PRD focuses on a sophisticated recommendation engine but lacks **adaptive intelligence**. This document proposes integrating AgentDB v2.0's advanced capabilities to create a **self-learning system** that improves from every user interaction, understands causality, and evolves without manual intervention.

**Key Gap Identified**: The current system is **static** — it matches content well but doesn't learn what actually works, doesn't understand why recommendations succeed or fail, and requires manual optimization.

**Proposed Solution**: Transform into a **living recommendation system** using:
- ReasoningBank for pattern learning (32.6M ops/sec)
- Reflexion Memory for experience-based improvement
- Causal Memory Graph for intervention-based understanding
- Causal Recall for utility-based retrieval
- Nightly Learner for autonomous pattern discovery
- Self-Healing for 97.9% automated optimization

---

## 1. Critical Gaps in Current PRD

### 1.1 No Learning From User Behavior

**Current State**:
- Static matching formula: `vectorSimilarity × 0.25 + moodScore × 0.30 + ...`
- Fixed weights that never improve
- No understanding of what recommendations actually lead to watch completion

**Gap Impact**:
- System never gets smarter
- Failed recommendations repeat
- Successful patterns aren't consolidated
- Every user session is independent

### 1.2 No Causal Understanding

**Current State**:
- Correlation-based matching only
- No understanding of p(watch|do(recommend))
- Can't A/B test recommendation strategies

**Gap Impact**:
- Can't answer: "Does recommending trending content actually increase completion rates?"
- Can't distinguish spurious correlations from true causes
- No systematic improvement framework

### 1.3 No Adaptive Memory

**Current State**:
- User profile is static 64D vector
- No episode storage or replay
- No self-critique mechanism

**Gap Impact**:
- Can't learn from mistakes
- Can't identify why good recommendations worked
- No memory consolidation

### 1.4 No Autonomous Optimization

**Current State**:
- Manual tuning required
- No background learning
- No self-healing mechanisms

**Gap Impact**:
- Requires constant human intervention
- Can't discover new user behavior patterns
- No adaptation to seasonal trends

---

## 2. Proposed Enhancements Using AgentDB v2.0

### 2.1 ReasoningBank Integration — Pattern Learning System

**What It Is**: Store successful recommendation trajectories and learn patterns at 32.6M ops/sec with super-linear scaling.

**How It Works**:
```javascript
// After each recommendation session
{
  trajectory: {
    userMood: "unwind + laugh",
    contentRecommended: "Le Sens de la Fête",
    vectorSimilarity: 0.87,
    trendingBoost: 0.15,
    outcome: "watched_85%_completion"
  },
  verdict: {
    success: true,
    confidenceScore: 0.92,
    reasoning: "Light comedy + high completion = validated pattern"
  },
  learnedPattern: {
    ifCondition: "user_mood=unwind+laugh AND time=evening AND day=friday",
    thenAction: "boost_weight_comedy_classics × 1.3",
    confidence: 0.88,
    evidenceCount: 47
  }
}
```

**PRD Integration Points**:

| Current Feature | Enhancement |
|-----------------|-------------|
| M4: Match Engine (static formula) | **Dynamic weight learning**: Formula weights adapt based on what actually works |
| S3: User Profile (static 64D vector) | **Pattern memory**: Store successful recommendation trajectories, not just preferences |
| S2: Chat Refinement | **Reflexive learning**: "More recent" requests teach system temporal patterns |

**Benefits**:
- Formula evolves: `moodScore × W(learned)` where W adapts
- Super-linear performance: Gets FASTER as patterns accumulate
- Automatic discovery: "Friday evening unwind + laugh = classic comedies perform 34% better"

**Implementation**:
```typescript
// Add to apps/agentdb/src/reasoning-bank/
interface RecommendationTrajectory {
  sessionId: string;
  userState: {
    mood: string;
    goal: string;
    context: string;
    time: Date;
  };
  recommendation: {
    contentId: string;
    matchScore: number;
    formulaBreakdown: Record<string, number>;
  };
  outcome: {
    clicked: boolean;
    watchedPercent: number;
    ratingGiven?: number;
    returnedWithin7Days: boolean;
  };
  verdict: {
    success: boolean;
    confidenceScore: number;
    reasoning: string;
  };
}

// Store and query
await reasoningBank.storeTrajectory(trajectory);
const patterns = await reasoningBank.queryPatterns({
  mood: "unwind",
  dayOfWeek: "friday",
  minConfidence: 0.75
}); // 32.6M ops/sec
```

---

### 2.2 Reflexion Memory — Learn From Experience

**What It Is**: Store episodes with self-critique, replay successful strategies, track failures.

**How It Works**:
```javascript
// Episode storage
{
  episode: {
    userInput: { mood: "engage", goal: "thrill" },
    systemAction: "recommended_action_thriller_X",
    reward: 0.3,  // Low — user watched only 15%
    selfCritique: "Action thriller too intense for midweek evening. Should have considered time context more heavily."
  },
  revision: {
    betterAction: "recommended_suspense_drama_Y",
    expectedReward: 0.85,
    reasoning: "Midweek 'thrill' seekers prefer cerebral suspense over physical action"
  }
}
```

**PRD Integration Points**:

| Current Feature | Enhancement |
|-----------------|-------------|
| C1: Watch History | **Episode replay**: Not just history, but annotated learning episodes |
| S2: Chat Refinement | **Self-critique**: System explains why previous pick wasn't ideal |
| M2: Intent Agent | **Context memory**: Remember what time-of-week patterns work |

**Use Case Example**:

```
User at 10pm Tuesday:
  Input: "engage + thrill"

Old System:
  → Recommends high-action blockbuster
  → User abandons after 20 minutes (too draining)

New System with Reflexion:
  1. Queries episodes: "engage + thrill + late_evening + weekday"
  2. Finds pattern: "Late weekday thrill-seekers abandon action, prefer suspense"
  3. Self-critique from past failures: "Avoid high-energy action after 9pm"
  4. Recommends: Cerebral thriller instead
  5. User completes 90%
  6. Stores: "Late weekday thrill = suspense > action" (confidence +0.08)
```

**Benefits**:
- Never repeat mistakes
- Compound learning: Each failure teaches better heuristics
- Transparent reasoning: System can explain "I learned from similar situations that..."

---

### 2.3 Causal Memory Graph — Intervention-Based Understanding

**What It Is**: Track p(outcome|do(action)) — what actually CAUSES watch completion, not just correlation.

**How It Works**:
```javascript
// Causal relationships
{
  intervention: "recommend_trending_content",
  outcome: "watch_completion_rate",
  causalEffect: {
    baseline: 0.62,              // Without trending boost
    withIntervention: 0.71,      // With trending boost
    uplift: +0.09,               // Causal effect size
    confidence: 0.94,
    sampleSize: 1247
  },
  moderators: {
    "user_age_18_30": { uplift: +0.15 },  // Strong effect
    "user_age_50+": { uplift: +0.02 }     // Weak effect
  }
}
```

**PRD Integration Points**:

| Current PRD Element | Causal Enhancement |
|---------------------|-------------------|
| S1: Trend Integration (fixed +10% boost) | **Learned causal boost**: "Trending matters +15% for age 18-30, only +2% for 50+" |
| 5.4: Matching Formula (static weights) | **Causal weights**: Each factor weighted by true causal impact |
| C2: Social Context | **Intervention testing**: Does "watching with family" actually change preferences or just correlate? |

**A/B Testing Framework**:
```typescript
// Automatic causal discovery
const experiment = {
  hypothesis: "Does recommending regional content increase completion for expats?",
  intervention: {
    control: "standard_matching_formula",
    treatment: "boost_regional_content × 1.5"
  },
  measurement: "completion_rate",
  segmentation: ["user_type", "time_since_expat", "region"]
};

// AgentDB automatically:
// 1. Runs interventions
// 2. Measures p(completion|do(boost_regional))
// 3. Computes causal effects with confidence intervals
// 4. Updates formula weights with proven interventions
```

**Real-World Use Cases**:

1. **Trending Weight Optimization**:
   - Question: "Does trending boost actually help?"
   - Current: Fixed 10% weight
   - Causal: "Trending causes +8% completion for new users, -2% for veterans" → Personalized weights

2. **Mood Formula Validation**:
   - Question: "Should mood weight be 30% or different?"
   - Current: Static 30%
   - Causal: "Mood causes 42% of completion variance on weekends, only 18% on weekdays" → Temporal weights

3. **Refinement Strategy**:
   - Question: "When user says 'more recent', how much should recency increase?"
   - Current: Manual tuning
   - Causal: "Boosting recency by 0.6 causes optimal balance between freshness and quality" → Data-driven parameter

**Benefits**:
- No more guessing at formula weights
- Understand what ACTUALLY drives engagement
- Systematic A/B testing without manual setup
- Confidence intervals: "We're 94% certain trending helps age 18-30"

---

### 2.4 Causal Recall — Utility-Based Retrieval

**What It Is**: Retrieve content that WORKS, not just content that's similar.

**Formula**: `U = α·similarity + β·uplift − γ·latency`

**How It Works**:
```javascript
// Old: Vector similarity only
query = userMoodVector;
results = topK(cosineSimilarity(query, contentVectors));
// Problem: Returns similar content that might not lead to watching

// New: Utility-based with causal uplift
query = userMoodVector;
results = topK(
  α × cosineSimilarity(query, content) +     // Still consider similarity
  β × p(completion|do(recommend(content))) - // But prioritize what WORKS
  γ × latency(content)                       // And is fast to deliver
);
```

**PRD Integration Points**:

| Current Feature | Utility Enhancement |
|-----------------|---------------------|
| M3: Catalog Search (similarity-only) | **Utility search**: Rank by "what leads to completion", not just "what's similar" |
| M4: Match Engine | **Uplift scoring**: Add causal uplift to similarity score |
| S5: 3 Alternatives | **Diverse utility**: Show runner-ups optimized for different utilities (fast/safe/adventurous) |

**Example Comparison**:

```
User: "unwind + laugh" on Friday evening

Old Similarity Search:
  1. "Comedy A" — 0.92 similarity, 58% historical completion
  2. "Comedy B" — 0.89 similarity, 51% historical completion
  3. "Comedy C" — 0.87 similarity, 44% historical completion
  → Picks highest similarity

New Utility Search:
  1. "Comedy B" — U = 0.89×0.4 + 0.78×0.5 - 0.02×0.1 = 0.744
     (Lower similarity BUT 78% causal completion rate for this context)
  2. "Comedy A" — U = 0.92×0.4 + 0.61×0.5 - 0.01×0.1 = 0.673
  3. "Comedy D" — U = 0.81×0.4 + 0.85×0.5 - 0.05×0.1 = 0.744
     (Not even in top 3 by similarity, but highest completion for "Friday unwind")
  → Picks highest utility
```

**Provenance Certificates**:
```javascript
recommendation: {
  content: "Comedy B",
  utilityScore: 0.744,
  provenance: {
    similarityComponent: 0.356,   // α × 0.89
    upliftComponent: 0.390,       // β × 0.78 ← Why this was chosen
    latencyComponent: -0.002,     // γ × 0.02
    evidenceTrajectories: [       // Proof of uplift
      { sessionId: "xyz", outcome: "completed_92%" },
      { sessionId: "abc", outcome: "completed_88%" }
      // ... 47 similar trajectories
    ],
    confidenceInterval: [0.72, 0.84]
  }
}
```

**Benefits**:
- Recommend what WORKS, not just what's similar
- Transparent: User can see WHY this was recommended
- Optimized for outcomes: Maximize completion, not just relevance
- Provable: Cryptographic proof of uplift claims

---

### 2.5 Skill Library — Lifelong Learning

**What It Is**: Auto-consolidate successful recommendation strategies into reusable skills.

**How It Works**:
```javascript
// After 1000+ sessions, system discovers:
{
  skill: "Friday Evening Unwind Specialist",
  consolidatedFrom: 1247 successful trajectories,
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
  composableWith: ["Language Learning Mode", "Social Context: Family"],
  lastUpdated: "2025-12-06T18:30:00Z"
}
```

**PRD Integration Points**:

| Current Feature | Skill Enhancement |
|-----------------|------------------|
| M2: Intent Agent | **Skill invocation**: Recognize "Friday unwind" → invoke specialized skill |
| C4: Language Learning Mode | **Composable skills**: Combine "Language Learning" + "Friday Unwind" → optimized for both |
| C3: Time-Aware | **Temporal skills**: Auto-discover weeknight vs weekend strategies |

**Auto-Discovered Skills Examples**:

1. **"Expat Comfort Food" Skill** (discovered from Sophie Renard persona patterns):
   ```javascript
   {
     trigger: "user_type=expat AND mood=unwind AND time_since_expat>1year",
     strategy: "boost regional content × 2.1, prefer nostalgia themes × 1.6",
     successRate: 0.91,
     evidenceBase: 523 trajectories
   }
   ```

2. **"Learner Sweet Spot" Skill** (discovered from James Mitchell patterns):
   ```javascript
   {
     trigger: "language_learning_mode=true AND level=intermediate",
     strategy: {
       targetDialogueSpeed: "moderate",
       preferSubtitleStyle: "full_french",
       avoidSlang: 0.7,
       boostClearDialogue: 1.8
     },
     successRate: 0.84,
     measuredBy: "completion_rate + comprehension_quiz_score"
   }
   ```

3. **"Busy Professional Quick Win" Skill** (discovered from Alexandre Fontaine patterns):
   ```javascript
   {
     trigger: "time_available<30min AND day=weekday",
     strategy: {
       preferShortForm: 2.5,
       boostEpisodic: 1.4,
       avoidMovies: 0.1,
       preferStandalone: 1.3  // No cliffhangers for short sessions
     },
     successRate: 0.89
   }
   ```

**Composition Engine**:
```typescript
// User: Busy professional + language learner on weeknight
const activeSkills = [
  skillLibrary.get("Busy Professional Quick Win"),
  skillLibrary.get("Learner Sweet Spot"),
  skillLibrary.get("Weeknight Energy Management")
];

const composedStrategy = skillLibrary.compose(activeSkills);
// Result: Short-form episodic French content with clear dialogue
// and standalone episodes (no cliffhangers)
```

**Benefits**:
- Automatic expertise accumulation
- Reusable across similar users
- Composable for multi-constraint scenarios
- 694 ops/sec skill search (ultra-fast)

---

### 2.6 Nightly Learner — Autonomous Pattern Discovery

**What It Is**: Background process runs nightly to discover patterns, prune low-quality strategies, optimize weights.

**How It Works**:
```javascript
// Runs every night at 2 AM
nightlyLearner.run({
  analyzeLastNDays: 7,
  tasks: [
    "discover_new_patterns",      // Find emerging user behavior
    "validate_existing_skills",   // Test if skills still work
    "prune_low_confidence",       // Remove outdated patterns
    "optimize_formula_weights",   // Tune matching formula
    "detect_seasonal_trends",     // Christmas movies, summer feel-good
    "identify_content_clusters"   // Auto-discover micro-genres
  ]
});

// Example discoveries:
{
  newPattern: {
    name: "Winter Comfort Seeking",
    discovered: "2025-12-06",
    observation: "Users in December prefer 'cozy' themed content +23%",
    evidence: 892 trajectories,
    confidence: 0.86,
    recommendation: "Add seasonal boost for 'cozy' tag in winter months"
  },
  prunedPattern: {
    name: "Monday Morning Escapism",
    pruned: "2025-12-06",
    reason: "Success rate dropped from 0.78 to 0.52 over 30 days",
    hypothesis: "User behavior shifted — investigate further"
  },
  optimizedWeight: {
    parameter: "trendingScore",
    oldWeight: 0.10,
    newWeight: 0.14,
    reason: "Trending content showing 12% higher completion over last 30 days",
    confidence: 0.93
  }
}
```

**PRD Integration Points**:

| Current Static Element | Nightly Learner Enhancement |
|------------------------|----------------------------|
| 5.4: Fixed formula weights | **Auto-tuned weights**: Optimized monthly based on performance data |
| S1: Trend Integration (manual) | **Automated trend detection**: Discovers what's actually trending in completions |
| C3: Time-Aware (manual rules) | **Discovered temporal patterns**: Auto-finds weeknight vs weekend vs seasonal patterns |

**30-Day Validation Loop**:
```typescript
// Nightly learner proposes change
proposal = {
  change: "increase mood weight from 0.30 to 0.35",
  hypothesis: "Mood is stronger predictor than previously thought",
  expectedLift: "+4.2% completion rate",
  confidence: 0.89
};

// Deploy to 10% of users (A/B test)
await deploy(proposal, { rollout: 0.10, duration: "30 days" });

// After 30 days
results = await validate(proposal);
if (results.actualLift >= proposal.expectedLift * 0.8) {
  rolloutToAll(proposal);  // 97.9% validation success rate
} else {
  revert(proposal);
  learn("Mood weight hypothesis was incorrect");
}
```

**Benefits**:
- Autonomous improvement — no human intervention
- Seasonal adaptation — automatically discovers holiday patterns
- Continuous optimization — formula never goes stale
- Safe experimentation — 30-day validation with auto-rollback

---

### 2.7 Self-Healing (97.9%) — MPC Adaptation

**What It Is**: Multi-Party Computation (MPC) adaptation that automatically heals performance degradation.

**How It Works**:
```javascript
// System monitors key metrics
healthMetrics = {
  avgMatchSatisfaction: 0.87,
  avgCompletionRate: 0.73,
  avgTimeToRecommendation: 2.3,
  refinementRate: 0.15
};

// Detects degradation
if (healthMetrics.avgMatchSatisfaction < 0.85) {
  selfHealing.diagnose({
    symptom: "Match satisfaction dropped from 0.89 to 0.82 over 3 days",
    possibleCauses: [
      "Formula weights drifted",
      "New content not properly vectorized",
      "User behavior shift",
      "Trending data stale"
    ]
  });

  // Auto-heal
  selfHealing.adapt({
    action: "rollback_formula_to_proven_state",
    fallback: "use_conservative_matching",
    notification: "alert_eng_team",
    validationPeriod: "7 days"
  });
}
```

**PRD Integration Points**:

| Current Risk (Section 9) | Self-Healing Mitigation |
|-------------------------|------------------------|
| Vector search latency | **Auto-optimize**: Detects slow queries, rebuilds HNSW index |
| Cold start (new users) | **Adaptive defaults**: Learns best defaults from similar new users |
| Model costs | **Cost-performance balancing**: Switches to Haiku when Sonnet not needed |

**Example Self-Healing Scenario**:

```
Day 1: Match satisfaction = 0.89 (baseline)
Day 4: Match satisfaction drops to 0.81 (anomaly detected)

Self-Healing Process:
  1. Diagnose: "Trending boost causing mis-matches"
  2. Hypothesis: "Recent trending content not aligned with user base"
  3. Adapt: Reduce trending weight from 0.14 → 0.08
  4. Validate: Monitor for 48 hours
  5. Result: Match satisfaction recovers to 0.88
  6. Learn: "Trending weight needs user-base calibration"
  7. Update: Add user-base size as moderator in trending formula
```

**97.9% Success Rate**:
- Self-healing resolves issues without human intervention 97.9% of time
- 30-day validation ensures adaptations are safe
- Automatic rollback if adaptations fail

---

### 2.8 GNN Attention (8-Head) — +12.4% Recall Improvement

**What It Is**: 8-head Graph Neural Network attention for adaptive query improvement.

**How It Works**:
```javascript
// User query (mood vector)
queryVector = [0.25, 0.6, ...];  // 64D

// GNN processes through user graph
userGraph = {
  user: currentUser,
  neighbors: [
    similarUser1,  // Cosine sim 0.87
    similarUser2,  // Cosine sim 0.82
    ...
  ],
  edges: [
    { from: currentUser, to: similarUser1, weight: 0.87, type: "taste_similarity" },
    { from: currentUser, to: "Comedy Genre", weight: 0.65, type: "preference" },
    ...
  ]
};

// 8-head attention refines query
refinedQuery = gnnAttention.process(queryVector, userGraph);
// Result: +12.4% recall improvement
// Finds content similar users loved that pure vector search missed
```

**PRD Integration Points**:

| Current Feature | GNN Enhancement |
|-----------------|-----------------|
| M3: Catalog Search (vector-only) | **Graph-aware search**: Considers similar users' successful watches |
| S3: User Profile (isolated vector) | **Graph-embedded profile**: User represented in taste graph |
| S5: 3 Alternatives | **Diverse GNN retrieval**: Each head finds different valid alternatives |

**Example**:

```
User: New to French cinema, liked "Amélie"

Vector Search Only:
  → Finds: Other whimsical French films
  → Miss: Critically-acclaimed auteur films that "Amélie" lovers also watch

GNN Attention Search:
  → Follows graph edges to similar users who loved "Amélie"
  → Discovers: They also loved Truffaut, Godard (not whimsical but similar aesthetic)
  → Recommends: "The 400 Blows" (95% match via graph, only 72% via vector)
  → Result: User discovers French New Wave, becomes long-term engaged user
```

**8 Attention Heads**:
1. **Taste Similarity Head**: Users with similar overall preferences
2. **Mood Alignment Head**: Users in similar emotional states
3. **Context Head**: Users in similar viewing contexts (time, social)
4. **Discovery Head**: Users who successfully discovered new genres
5. **Completion Head**: Users with similar completion patterns
6. **Temporal Head**: Users with similar time-of-day preferences
7. **Cultural Head**: Users with similar cultural backgrounds
8. **Learning Head**: Users with similar progression paths (for language learners)

**Benefits**:
- +12.4% recall improvement (proven in AgentDB benchmarks)
- Discovers non-obvious recommendations
- Leverages collective intelligence
- Multi-faceted matching beyond simple similarity

---

## 3. Architecture Decision Records (ADRs)

### ADR-001: Integrate ReasoningBank for Pattern Learning

**Status**: Proposed

**Context**: Current matching formula uses static weights that never improve from user feedback.

**Decision**: Integrate AgentDB ReasoningBank to store recommendation trajectories and learn patterns.

**Consequences**:
- **Positive**:
  - Formula weights adapt based on real outcomes
  - Super-linear scaling (gets faster with data)
  - Automatic discovery of user behavior patterns

- **Negative**:
  - Requires trajectory storage (bandwidth/storage cost)
  - 30-day validation adds deployment latency for changes

- **Mitigation**:
  - Use compressed trajectory storage
  - Parallel A/B testing shortens validation

**Alternatives Considered**:
1. Manual weight tuning → Rejected: Not scalable
2. Simple A/B testing → Rejected: No pattern consolidation
3. Reinforcement Learning → Rejected: ReasoningBank is RL + memory + provenance

---

### ADR-002: Use Causal Memory Graph Instead of Correlation-Only Matching

**Status**: Proposed

**Context**: Current system cannot distinguish correlation from causation in recommendation effectiveness.

**Decision**: Implement Causal Memory Graph to track p(outcome|do(action)) for all recommendation strategies.

**Consequences**:
- **Positive**:
  - Understand what CAUSES engagement vs. what correlates
  - Systematic A/B testing framework
  - Confidence intervals for all formula components

- **Negative**:
  - Requires intervention tracking (more complex)
  - Needs sufficient sample sizes for causal inference

- **Mitigation**:
  - Start with high-traffic user segments
  - Use Bayesian priors from similar systems

**Alternatives Considered**:
1. Continue correlation-only → Rejected: Can't optimize systematically
2. Manual A/B tests → Rejected: Doesn't scale to 100+ parameters
3. Observational causal inference → Considered: May add later for rare events

---

### ADR-003: Implement Causal Recall for Utility-Based Retrieval

**Status**: Proposed

**Context**: Current vector search returns similar content, not necessarily content that leads to watching.

**Decision**: Replace pure similarity search with utility-based Causal Recall: `U = α·similarity + β·uplift − γ·latency`

**Consequences**:
- **Positive**:
  - Recommend what WORKS, not just what's similar
  - Provenance certificates for transparency
  - Optimized for business outcomes (completion rate)

- **Negative**:
  - Cold start challenge (no uplift data for new content)
  - More complex than cosine similarity

- **Mitigation**:
  - Fallback to similarity-only for new content
  - Thompson sampling for exploration-exploitation balance

**Alternatives Considered**:
1. Pure similarity → Current: Doesn't optimize for outcomes
2. Collaborative filtering → Rejected: Doesn't handle cold start well
3. Hybrid (similarity + CF) → Rejected: Still correlation-based

---

### ADR-004: Deploy Nightly Learner for Autonomous Optimization

**Status**: Proposed

**Context**: Current system requires manual tuning and can't adapt to seasonal patterns or behavior shifts.

**Decision**: Deploy AgentDB Nightly Learner to run background pattern discovery, weight optimization, and validation.

**Consequences**:
- **Positive**:
  - Autonomous improvement without human intervention
  - Seasonal adaptation (Christmas patterns, summer vibes)
  - Continuous optimization (never goes stale)

- **Negative**:
  - Resource cost for nightly batch processing
  - 30-day validation means changes aren't instant

- **Mitigation**:
  - Run on low-cost compute during off-peak hours
  - Critical fixes can bypass 30-day validation with approval

**Alternatives Considered**:
1. Real-time learning → Rejected: Too noisy, need batch consolidation
2. Weekly learning → Considered: May implement if nightly too expensive
3. Manual review of all changes → Rejected: Doesn't scale

---

### ADR-005: Enable Self-Healing with 30-Day MPC Validation

**Status**: Proposed

**Context**: System degradation (e.g., match satisfaction drop) currently requires manual diagnosis and fixes.

**Decision**: Enable AgentDB Self-Healing with 97.9% success rate and 30-day validation loops.

**Consequences**:
- **Positive**:
  - Automatic recovery from performance degradation
  - Reduced on-call burden for engineering team
  - Safe experimentation with auto-rollback

- **Negative**:
  - False positives (healing when not needed)
  - 30-day validation delay for adaptations

- **Mitigation**:
  - Threshold tuning to reduce false positives
  - Fast-track validation for critical issues

**Alternatives Considered**:
1. Manual monitoring and fixes → Current: Not scalable
2. Automatic healing without validation → Rejected: Too risky
3. Human-in-loop for all changes → Rejected: Defeats purpose

---

## 4. Updated Technical Architecture

### 4.1 Enhanced System Diagram

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
│                   + ReasoningBank Coordinator                    │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
        ┌─────────────┬───────────┼───────────┬─────────────┐
        │             │           │           │             │
        ▼             ▼           ▼           ▼             ▼
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│  INTENT   │ │  CATALOG  │ │   TREND   │ │   MATCH   │ │  PRESENT  │
│  AGENT    │ │  AGENT    │ │   AGENT   │ │   AGENT   │ │   AGENT   │
│  (Haiku)  │ │ (AgentDB) │ │  (TMDB)   │ │  (Haiku)  │ │ (Sonnet)  │
│           │ │           │ │           │ │           │ │           │
│ +Reflexion│ │ +Causal   │ │ +Pattern  │ │ +Utility  │ │ +Provena  │
│  Memory   │ │  Recall   │ │  Learning │ │  Optimiz  │ │   nce     │
└───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘
        │             │           │           │             │
        └─────────────┴───────────┴───────────┴─────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AGENTDB v2.0 LAYER                            │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ ReasoningBank│ Reflexion    │ Causal Graph │ Skill Library     │
│ (32.6M ops/s)│ Memory       │ (Interventio)│ (694 ops/s)       │
│              │              │              │                   │
│ Pattern      │ Episode      │ p(y|do(x))   │ Auto-consolidated │
│ Learning     │ Self-Critique│ A/B Testing  │ Strategies        │
└──────────────┴──────────────┴──────────────┴───────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKGROUND SERVICES                         │
├──────────────────┬──────────────────┬───────────────────────────┤
│  Nightly Learner │  Self-Healing    │   GNN Attention (8-head) │
│  (2 AM daily)    │  (97.9% success) │   (+12.4% recall)        │
│                  │                  │                           │
│  - Pattern disc. │  - MPC Adapt.    │   - Graph-aware search   │
│  - Weight optim. │  - 30-day valid. │   - Multi-head attention │
│  - Skill prune   │  - Auto-rollback │   - Collective intel.    │
└──────────────────┴──────────────────┴───────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
├──────────────────┬──────────────────┬───────────────────────────┤
│    RuVector      │  Trajectory DB   │    User Graph             │
│  (Content 768D)  │  (Episodes)      │   (GNN embeddings)        │
└──────────────────┴──────────────────┴───────────────────────────┘
```

### 4.2 Enhanced Data Flow

```
1. User Input → Intent Agent (with Reflexion Memory)
   - Query episodes: "Similar context + outcome patterns"
   - Critique past failures: "Avoid patterns that led to abandonment"
   - Output: Intent vector + learned constraints

2. Intent → Parallel Processing
   - Catalog Agent: Causal Recall search (utility-based, not similarity)
   - Trend Agent: Pattern Learning (discover trending patterns)
   - GNN Attention: Graph-aware query expansion

3. Results → Match Agent (with ReasoningBank)
   - Query learned patterns: "What worked for similar users/contexts?"
   - Apply dynamic weights (not static formula)
   - Compute utility scores (similarity + uplift - latency)

4. Match → Present Agent (with Provenance)
   - Generate explanation with evidence trajectories
   - Show provenance certificate
   - Create deeplink

5. Outcome → Learning Loop
   - Store trajectory in ReasoningBank
   - Update Reflexion Memory with self-critique
   - Feed Causal Graph with intervention outcomes
   - Trigger Nightly Learner for pattern consolidation
```

---

## 5. Implementation Roadmap (Updated)

### Phase 1: Foundation (Weeks 1-2) ✅ UNCHANGED

- [ ] Content vector schema finalized
- [ ] RuVector integration with AgentDB
- [ ] User style vector (64D) implementation
- [ ] Basic quiz UI prototype

### Phase 2: AgentDB v2.0 Integration (Weeks 3-5) 🆕 NEW

**Week 3: ReasoningBank + Reflexion**
- [ ] Trajectory schema design
  - Session metadata
  - Recommendation details
  - Outcome tracking
  - Verdict structure
- [ ] ReasoningBank integration
  - Store trajectories
  - Query patterns (32.6M ops/sec)
  - Confidence scoring
- [ ] Reflexion Memory setup
  - Episode storage
  - Self-critique generation
  - Replay mechanism

**Week 4: Causal Memory + Recall**
- [ ] Causal Graph schema
  - Intervention tracking
  - Outcome measurement
  - Moderator effects
- [ ] Causal Recall implementation
  - Utility formula: `α·sim + β·uplift - γ·latency`
  - Provenance certificates
  - Confidence intervals
- [ ] A/B testing framework
  - Automatic intervention deployment
  - Sample size calculation
  - Statistical validation

**Week 5: Skills + GNN**
- [ ] Skill Library setup
  - Auto-consolidation from patterns
  - Composition engine
  - 694 ops/sec search
- [ ] GNN Attention integration
  - User graph construction
  - 8-head attention mechanism
  - Query expansion
- [ ] Initial skill discovery
  - Run on historical data
  - Validate on holdout set

### Phase 3: Core Engine (Weeks 6-7) 🔄 ENHANCED

- [ ] **Dynamic matching formula** (not static)
  - Query ReasoningBank for learned weights
  - Apply context-specific patterns
  - Utility-based ranking
- [ ] **Intent Agent with Reflexion**
  - Query episode memory
  - Apply self-critique heuristics
- [ ] **Catalog Agent with Causal Recall**
  - Utility search (not similarity-only)
  - GNN query expansion
- [ ] MCP server (STDIO + SSE) ✅ UNCHANGED

### Phase 4: Background Services (Weeks 8-9) 🆕 NEW

**Week 8: Nightly Learner**
- [ ] Pattern discovery pipeline
  - Analyze last 7 days
  - Discover new patterns
  - Validate on holdout
- [ ] Weight optimization
  - Formula parameter tuning
  - A/B test proposals
  - 30-day validation setup
- [ ] Skill pruning
  - Remove low-confidence patterns
  - Update skill library

**Week 9: Self-Healing**
- [ ] Health monitoring
  - Match satisfaction tracking
  - Completion rate monitoring
  - Latency alerts
- [ ] MPC adaptation
  - Degradation diagnosis
  - Auto-healing strategies
  - Rollback mechanisms
- [ ] 30-day validation loop
  - Deployment pipeline
  - Metrics tracking
  - Auto-rollout/revert

### Phase 5: Integration + Validation (Weeks 10-11) 🔄 ENHANCED

- [ ] TMDB/Trakt integration ✅ UNCHANGED
- [ ] ARW manifest ✅ UNCHANGED
- [ ] **End-to-end learning validation**
  - Run 1000 simulated sessions
  - Verify pattern learning
  - Confirm utility improvement
- [ ] **Causal validation**
  - Run controlled A/B tests
  - Measure causal effects
  - Validate confidence intervals

### Phase 6: Polish + Demo (Week 12) ✅ UNCHANGED

- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Demo preparation
- [ ] Documentation

---

## 6. Updated Success Metrics

### 6.1 Enhanced KPIs

| Metric | Original Target | Enhanced Target with AgentDB v2.0 |
|--------|----------------|-----------------------------------|
| **Match Satisfaction** | > 85% | > 90% (via pattern learning) |
| **First-Try Success** | > 80% | > 92% (via Reflexion Memory avoiding failures) |
| **Refinement Rate** | < 20% | < 12% (via utility-based recall) |
| **Return Rate** | > 60% weekly | > 75% weekly (via skill consolidation) |

### 6.2 New Learning Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Pattern Discovery Rate** | 5-10 new patterns/week | Nightly Learner output |
| **Causal Confidence** | > 0.85 avg | Confidence intervals for formula weights |
| **Self-Healing Success** | > 95% | Auto-resolved degradations / total |
| **Skill Validation Rate** | > 88% | Holdout success rate for new skills |
| **GNN Recall Improvement** | > +10% | Compared to vector-only search |
| **Adaptation Speed** | < 7 days | Time from pattern discovery to deployment |

### 6.3 Long-Term Intelligence Metrics (10-Year Vision)

| Metric | Year 1 | Year 3 | Year 10 |
|--------|--------|--------|---------|
| **Autonomous Improvements** | 20% of optimizations | 60% | 95% |
| **Formula Components Learned** | 15 parameters | 50 parameters | 200+ parameters |
| **Skill Library Size** | 20 skills | 150 skills | 1000+ skills |
| **Causal Relationships Mapped** | 30 interventions | 200 interventions | 2000+ interventions |
| **Super-Linear Scaling** | 1.2x speedup | 3.5x speedup | 10x+ speedup |

---

## 7. Risk Analysis (Updated)

### 7.1 Technical Risks

| Risk | Mitigation with AgentDB v2.0 |
|------|------------------------------|
| **Cold Start (new users)** | ✅ **Solved**: GNN uses similar users' patterns, Skill Library provides defaults |
| **Cold Start (new content)** | ⚠️ **Partial**: Fallback to similarity-only until uplift data accumulates, Thompson sampling for exploration |
| **Pattern Overfitting** | ✅ **Mitigated**: 30-day validation, holdout testing, confidence intervals |
| **Self-Healing False Positives** | ✅ **Mitigated**: Threshold tuning, human review for critical changes |
| **Causal Inference Sample Size** | ⚠️ **Monitor**: Start with high-traffic segments, expand gradually |
| **Storage/Compute Costs** | ⚠️ **Monitor**: Trajectory compression, optimize Nightly Learner schedule |

### 7.2 Business Risks

| Risk | Mitigation |
|------|------------|
| **User Privacy Concerns** | Trajectory anonymization, GDPR-compliant storage, transparent provenance |
| **Explanation Complexity** | Simple UI: "Users like you loved this 87% of the time" vs. technical provenance |
| **Over-Optimization** | Diversity injection in utility formula, exploration bonus |

---

## 8. Technology Stack Update

### 8.1 New Dependencies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **ReasoningBank** | AgentDB v2.0 | Pattern learning (32.6M ops/sec) |
| **Reflexion Memory** | AgentDB v2.0 | Episode storage + self-critique |
| **Causal Memory Graph** | AgentDB v2.0 | Intervention tracking p(y|do(x)) |
| **Causal Recall** | AgentDB v2.0 | Utility-based retrieval |
| **Skill Library** | AgentDB v2.0 | Auto-consolidated strategies (694 ops/sec) |
| **Nightly Learner** | AgentDB v2.0 | Background pattern discovery |
| **Self-Healing** | AgentDB v2.0 | MPC adaptation (97.9% success) |
| **GNN Attention** | AgentDB v2.0 | 8-head graph neural network |

### 8.2 Integration Points

```typescript
// apps/media-discovery/src/agentdb/
├── reasoning-bank/
│   ├── trajectory-store.ts       // Store recommendation trajectories
│   ├── pattern-query.ts          // 32.6M ops/sec pattern search
│   └── verdict-judge.ts          // Success/failure verdicts
├── reflexion/
│   ├── episode-memory.ts         // Episode storage
│   ├── self-critique.ts          // Generate critiques
│   └── replay.ts                 // Replay successful strategies
├── causal/
│   ├── intervention-graph.ts     // Track p(y|do(x))
│   ├── ab-test-manager.ts        // Auto A/B testing
│   └── confidence-intervals.ts   // Statistical validation
├── recall/
│   ├── utility-search.ts         // α·sim + β·uplift - γ·latency
│   ├── provenance.ts             // Certificates + evidence
│   └── thompson-sampling.ts      // Exploration-exploitation
├── skills/
│   ├── library.ts                // Skill storage (694 ops/sec)
│   ├── consolidator.ts           // Auto-create skills from patterns
│   └── composer.ts               // Compose multiple skills
├── nightly/
│   ├── pattern-discovery.ts      // Find new patterns
│   ├── weight-optimizer.ts       // Tune formula weights
│   └── skill-pruner.ts           // Remove outdated patterns
├── self-healing/
│   ├── health-monitor.ts         // Detect degradation
│   ├── mpc-adapter.ts            // Auto-adaptation
│   └── validator.ts              // 30-day validation loop
└── gnn/
    ├── graph-builder.ts          // User graph construction
    ├── attention-8head.ts        // 8-head attention
    └── query-expansion.ts        // Graph-aware search
```

---

## 9. Comparison: Before vs. After AgentDB v2.0

### 9.1 Recommendation Quality

| Aspect | Before (Static) | After (AgentDB v2.0) |
|--------|----------------|----------------------|
| **Formula Weights** | Fixed: `mood × 0.30` | Learned: `mood × W(context)` where W adapts |
| **Search Strategy** | Similarity-only | Utility-based (what WORKS, not just similar) |
| **User Understanding** | Static 64D vector | Graph-embedded + episode memory |
| **Cold Start** | Sensible defaults | GNN + Skill Library defaults from similar users |
| **Failure Handling** | Repeat same mistakes | Reflexion: Never repeat failures |

### 9.2 System Intelligence

| Capability | Before | After |
|------------|--------|-------|
| **Learning** | None | Continuous from every session |
| **Causality** | Correlation-only | True causal understanding p(y|do(x)) |
| **Adaptation** | Manual tuning | Autonomous (Nightly Learner + Self-Healing) |
| **Transparency** | Black box | Provenance certificates + evidence |
| **Scalability** | Linear search | Super-linear (faster with more data) |

### 9.3 Engineering Effort

| Task | Before | After |
|------|--------|-------|
| **Formula Optimization** | Manual A/B tests (weeks) | Automatic (days, 97.9% success) |
| **New User Segments** | Create rules manually | System auto-discovers patterns |
| **Seasonal Trends** | Manual updates | Nightly Learner auto-adapts |
| **Performance Issues** | On-call diagnosis | Self-Healing (97.9% auto-resolve) |
| **Feature Engineering** | Manual analysis | Skill Library auto-consolidates |

---

## 10. Business Case: Why AgentDB v2.0 is Worth It

### 10.1 Immediate Benefits (Months 1-6)

- **+5-8% match satisfaction** via utility-based Causal Recall
- **-40% refinement requests** via Reflexion Memory (learn from failures)
- **+12.4% recall** via GNN Attention (proven benchmark)
- **-60% engineering time** on formula tuning (Self-Healing + Nightly Learner)

### 10.2 Medium-Term Benefits (Year 1-2)

- **Autonomous optimization**: 60% of improvements without human intervention
- **Skill library**: 50-150 consolidated strategies for instant reuse
- **Causal understanding**: 100+ validated interventions with confidence intervals
- **Super-linear scaling**: 2-3x speedup as user base grows

### 10.3 Long-Term Vision (10 Years)

- **95% autonomous**: System self-improves, humans only guide high-level strategy
- **1000+ skills**: Deep expertise across all user segments and contexts
- **2000+ causal relationships**: Complete map of what drives engagement
- **10x performance**: Super-linear scaling makes system FASTER as it grows
- **Industry-leading**: Only streaming recommendation system with true causal understanding

### 10.4 Competitive Moat

| Competitor Capability | TV5MONDE with AgentDB v2.0 |
|-----------------------|----------------------------|
| Netflix: Collaborative filtering | ✅ + Causal understanding + Provenance |
| Spotify: Similarity search | ✅ + Utility-based recall + GNN |
| YouTube: Engagement prediction | ✅ + ReasoningBank patterns + Self-critique |
| Amazon: A/B testing | ✅ + Automatic interventions + 30-day validation |

**Unique advantage**: Only system that learns CAUSAL relationships and provides PROVENANCE for every recommendation.

---

## 11. Next Steps

### 11.1 Immediate Actions (Week 1)

1. **Technical Review**:
   - [ ] Review AgentDB v2.0 documentation
   - [ ] Validate ReasoningBank performance claims (32.6M ops/sec)
   - [ ] Test Causal Memory Graph on sample data

2. **Schema Design**:
   - [ ] Design trajectory schema for recommendation sessions
   - [ ] Define verdict structure (success/failure criteria)
   - [ ] Plan user graph structure for GNN

3. **Prototype**:
   - [ ] Build minimal ReasoningBank integration
   - [ ] Test pattern storage and query
   - [ ] Validate super-linear scaling claim

### 11.2 Decision Points

| Decision | Stakeholder | Deadline |
|----------|-------------|----------|
| **Approve AgentDB v2.0 integration** | Engineering Lead | Week 1 |
| **Allocate budget for storage/compute** | Product Manager | Week 2 |
| **Define success metrics for learning** | Data Science Team | Week 2 |
| **Privacy review of trajectory storage** | Legal/Compliance | Week 3 |

### 11.3 Risk Mitigation Plan

1. **Phased Rollout**:
   - Week 3-5: Build on dev dataset
   - Week 6-8: Deploy to 10% of users
   - Week 9-11: Expand to 50% with A/B validation
   - Week 12+: Full rollout if metrics validate

2. **Fallback Strategy**:
   - Maintain static formula as backup
   - Auto-revert if learning degradation detected
   - Human override for critical issues

3. **Monitoring**:
   - Real-time dashboards for all learning metrics
   - Alerting for self-healing failures
   - Weekly review of discovered patterns

---

## 12. Conclusion

The current PRD delivers a **strong MVP** but remains **static**. Integrating AgentDB v2.0's full capabilities transforms the system into a **living, learning platform** that:

1. **Learns from every interaction** (ReasoningBank + Reflexion)
2. **Understands causality** (Causal Memory Graph)
3. **Optimizes for outcomes** (Causal Recall utility-based search)
4. **Self-improves continuously** (Nightly Learner + Self-Healing)
5. **Scales super-linearly** (Gets FASTER as data grows)

**This is the difference between:**
- A great recommendation engine → **A 10-year competitive moat**
- Manual optimization → **Autonomous intelligence**
- Correlation-based matching → **Causal understanding**
- Static formulas → **Adaptive learning system**

**Investment**: +2-3 weeks development, modest storage/compute costs
**Return**: Industry-leading recommendation system that improves autonomously for a decade

---

## Appendix A: Code Examples

### A.1 ReasoningBank Trajectory Storage

```typescript
import { ReasoningBank } from '@agentdb/reasoning-bank';

interface RecommendationTrajectory {
  sessionId: string;
  timestamp: Date;
  userState: {
    mood: string;
    goal: string;
    context: string;
    dayOfWeek: string;
    timeOfDay: string;
  };
  recommendation: {
    contentId: string;
    title: string;
    matchScore: number;
    formulaBreakdown: {
      vectorSimilarity: number;
      moodScore: number;
      intentScore: number;
      contextScore: number;
      trendingScore: number;
    };
  };
  outcome: {
    clicked: boolean;
    watchedPercent: number;
    completedFully: boolean;
    ratingGiven?: number;
    returnedWithin7Days: boolean;
    refinementRequested: boolean;
  };
  verdict: {
    success: boolean;
    confidenceScore: number;
    reasoning: string;
  };
}

// Store trajectory
async function storeSession(trajectory: RecommendationTrajectory) {
  const reasoningBank = new ReasoningBank();

  await reasoningBank.storeTrajectory({
    id: trajectory.sessionId,
    state: trajectory.userState,
    action: trajectory.recommendation,
    reward: trajectory.outcome.watchedPercent,
    verdict: trajectory.verdict
  });
}

// Query patterns
async function getLearnedPatterns(context: any) {
  const patterns = await reasoningBank.queryPatterns({
    mood: context.mood,
    dayOfWeek: context.dayOfWeek,
    timeOfDay: context.timeOfDay,
    minConfidence: 0.75,
    limit: 10
  });

  // 32.6M ops/sec — ultra-fast
  return patterns.map(p => ({
    condition: p.trigger,
    strategy: p.action,
    successRate: p.confidence,
    evidenceCount: p.trajectories.length
  }));
}
```

### A.2 Causal Recall Utility Search

```typescript
import { CausalRecall } from '@agentdb/causal-recall';

async function utilityBasedSearch(
  userQuery: number[],  // 64D mood vector
  context: any
) {
  const causalRecall = new CausalRecall({
    // Utility formula: U = α·similarity + β·uplift − γ·latency
    alpha: 0.4,   // Similarity weight
    beta: 0.5,    // Uplift weight (highest)
    gamma: 0.1    // Latency penalty
  });

  const results = await causalRecall.search({
    query: userQuery,
    context: {
      mood: context.mood,
      dayOfWeek: context.dayOfWeek,
      userSegment: context.userType
    },
    limit: 10,
    includeProvenance: true
  });

  return results.map(r => ({
    content: r.content,
    utilityScore: r.utility,
    breakdown: {
      similarity: r.components.similarity,
      uplift: r.components.uplift,       // p(completion|do(recommend))
      latency: r.components.latency
    },
    provenance: {
      evidenceTrajectories: r.provenance.trajectories,
      confidenceInterval: r.provenance.confidenceInterval,
      sampleSize: r.provenance.sampleSize
    }
  }));
}
```

### A.3 Nightly Learner Pipeline

```typescript
import { NightlyLearner } from '@agentdb/nightly-learner';

async function runNightlyLearning() {
  const learner = new NightlyLearner();

  const results = await learner.run({
    analyzeLastNDays: 7,
    tasks: [
      'discover_new_patterns',
      'validate_existing_skills',
      'prune_low_confidence',
      'optimize_formula_weights',
      'detect_seasonal_trends'
    ]
  });

  // New patterns discovered
  for (const pattern of results.newPatterns) {
    console.log(`Discovered: ${pattern.name}`);
    console.log(`Evidence: ${pattern.trajectories.length} sessions`);
    console.log(`Confidence: ${pattern.confidence}`);

    if (pattern.confidence > 0.85) {
      // Auto-deploy to A/B test
      await deployToABTest(pattern, { rollout: 0.10 });
    }
  }

  // Optimized weights
  for (const weight of results.optimizedWeights) {
    console.log(`Weight change: ${weight.parameter}`);
    console.log(`${weight.oldValue} → ${weight.newValue}`);
    console.log(`Expected lift: ${weight.expectedLift}`);

    // Deploy with 30-day validation
    await deployWithValidation(weight, { validationDays: 30 });
  }
}
```

---

**END OF DOCUMENT**

*This enhancement proposal transforms TV5MONDE's content discovery system from a sophisticated recommendation engine into a self-learning, causally-aware platform that improves autonomously for decades.*
