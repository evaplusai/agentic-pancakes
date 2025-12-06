# Data Models

Complete TypeScript data models for the Universal Content Discovery MVP.

## Overview

This directory contains all core data models with:
- **Zod schemas** for runtime validation
- **TypeScript interfaces** for compile-time type safety
- **Helper functions** for creation, validation, and manipulation
- **Complete JSDoc documentation**

## Models

### 1. Emotional State (`emotional-state.ts`)

**Purpose**: Domain-agnostic representation of user's emotional context.

**Key Interfaces**:
- `UniversalEmotionalState` - Main emotional state representation
- `EmotionalNeeds` - Psychological needs profile (Maslow-inspired)
- `ContextInfo` - Temporal and environmental context
- `CaptureMethod` - How the state was captured

**Based on**:
- Russell's Circumplex Model of Affect
- Maslow's Hierarchy of Needs

**Key Functions**:
- `createDefaultEmotionalState()` - Create with current context
- `quizToEmotionalState()` - Map quiz responses to emotional state
- `calculateEmotionalDistance()` - Cosine similarity between states
- `validateEmotionalState()` - Runtime validation

**Example**:
```typescript
import { quizToEmotionalState } from './emotional-state';

const state = quizToEmotionalState(
  'unwind',
  'laugh',
  sessionId,
  userId
);

// Result:
// {
//   energy: 0.3,
//   valence: 0.7,
//   needs: { joy: 0.9, relaxation: 0.8, ... }
// }
```

---

### 2. User Vector (`user-vector.ts`)

**Purpose**: 64-dimensional long-term taste profile.

**Key Interfaces**:
- `UserStyleVector` - 64D user embedding
- `ExplicitPreferences` - User-provided preferences
- `LearnedPatterns` - Behavioral patterns
- `GraphEmbedding` - GNN graph position

**Dimension Allocation** (64D):
- [0-14]  Genre affinities (15D)
- [15-24] Mood/Tone preferences (10D)
- [25-32] Pacing preferences (8D)
- [33-40] Content characteristics (8D)
- [41-48] French-specific attributes (8D)
- [49-56] Context patterns (8D)
- [57-63] Session modifiers (7D)

**Key Functions**:
- `createDefaultUserVector()` - Initialize new user
- `calculateUserSimilarity()` - Cosine similarity
- `updateFromInteraction()` - Learn from feedback
- `extractGenrePreferences()` - Get genre weights

**Example**:
```typescript
import { createDefaultUserVector, updateFromInteraction } from './user-vector';

let userVector = createDefaultUserVector(userId);

// After interaction
userVector = updateFromInteraction(
  userVector,
  ['comedy', 'romance'],
  0.9 // satisfaction
);
```

---

### 3. Content Vector (`content-vector.ts`)

**Purpose**: 768-dimensional content representation.

**Key Interfaces**:
- `ContentVector` - 768D content embedding
- `ContentMetadata` - Associated metadata

**Dimension Allocation** (768D):
- [0-511]   Plot/Synopsis embedding (512D) - text-embedding-3-small
- [512-575] Genre one-hot + features (64D)
- [576-639] Mood/Tone embedding (64D)
- [640-767] Metadata features (128D) - runtime, year, ratings

**Key Functions**:
- `createContentVectorFromMetadata()` - Create from metadata
- `calculateContentSimilarity()` - Cosine similarity
- `setGenreEncoding()` - Set genre one-hot
- `setMetadataFeatures()` - Set normalized metadata
- `calculateWeightedSimilarity()` - Multi-component similarity

**Example**:
```typescript
import { createContentVectorFromMetadata } from './content-vector';

const contentVector = createContentVectorFromMetadata({
  contentId: 'movie-123',
  title: 'Amélie',
  domain: 'movie',
  genres: ['comedy', 'romance'],
  runtime: 122,
  year: 2001,
  // ... more metadata
});
```

---

### 4. Trajectory (`trajectory.ts`)

**Purpose**: Track recommendation sessions for ReasoningBank learning.

**Key Interfaces**:
- `Trajectory` - Complete recommendation trajectory
- `AgentAction` - Individual agent step
- `Verdict` - Self-critique result
- `ReflexionEpisode` - Learning episode

**Key Functions**:
- `createTrajectory()` - Start new trajectory
- `addActionToTrajectory()` - Log agent action
- `setTrajectoryOutcome()` - Record result
- `generateVerdict()` - Self-critique
- `createReflexionEpisode()` - Create learning episode

**Example**:
```typescript
import { createTrajectory, addActionToTrajectory } from './trajectory';

let trajectory = createTrajectory(sessionId, userId, emotionalState, userVector);

trajectory = addActionToTrajectory(
  trajectory,
  'intent',
  'Extract emotional state',
  { mood: 'unwind', goal: 'laugh' },
  { energy: 0.3, valence: 0.7 },
  150 // latency ms
);
```

---

### 5. Recommendation (`recommendation.ts`)

**Purpose**: API input/output interfaces.

**Key Interfaces**:
- `GetRecommendationInput` - Request format
- `GetRecommendationOutput` - Response format
- `ContentItem` - Recommended content
- `Provenance` - Evidence and reasoning
- `RefineSearchInput/Output` - Refinement API

**Key Functions**:
- `validateGetRecommendationInput()` - Validate request
- `createProvenance()` - Generate provenance certificate
- `calculateMatchScore()` - Compute from breakdown
- `generateReasoningSummary()` - Natural language explanation

**Example**:
```typescript
import { validateGetRecommendationInput, createProvenance } from './recommendation';

const input = validateGetRecommendationInput({
  mood: 'unwind',
  goal: 'laugh',
  constraints: { maxRuntime: 120 },
  userId: 'user-123'
});

const provenance = createProvenance(
  42,   // evidence count
  0.87, // success rate
  'evening-comedy-skill',
  'Based on Friday evening patterns'
);
```

---

## Index (`index.ts`)

Central export point for all models. Import from here:

```typescript
import {
  UniversalEmotionalState,
  UserStyleVector,
  ContentVector,
  Trajectory,
  GetRecommendationInput
} from './models';
```

---

## Validation

All models use Zod for runtime validation:

```typescript
import { UniversalEmotionalStateSchema } from './models/emotional-state';

try {
  const state = UniversalEmotionalStateSchema.parse(untrustedData);
  // state is now validated and typed
} catch (error) {
  // Invalid data
}
```

---

## Serialization

All models include serialization helpers:

```typescript
import {
  serializeUserVector,
  deserializeUserVector
} from './models/user-vector';

// Save to storage
const json = serializeUserVector(userVector);
await storage.save('user-123', json);

// Load from storage
const data = await storage.load('user-123');
const userVector = deserializeUserVector(data);
```

---

## Testing

Models are fully testable:

```typescript
import { createDefaultEmotionalState } from './models/emotional-state';

test('should create valid emotional state', () => {
  const state = createDefaultEmotionalState('session-123');

  expect(state.energy).toBeGreaterThanOrEqual(0);
  expect(state.energy).toBeLessThanOrEqual(1);
  expect(state.sessionId).toBe('session-123');
});
```

---

## Implementation Status

- [x] emotional-state.ts (317 lines)
- [x] user-vector.ts (350 lines)
- [x] content-vector.ts (433 lines)
- [x] trajectory.ts (486 lines)
- [x] recommendation.ts (430 lines)
- [x] index.ts (70 lines)

**Total**: 2,086 lines of production-ready TypeScript

---

## Next Steps

1. Implement services that use these models:
   - `src/services/vectorizer.ts` - Text to vector embedding
   - `src/services/matcher.ts` - Scoring algorithm
   - `src/services/learner.ts` - Learning pipeline

2. Implement agents:
   - `src/agents/intent.ts` - Uses emotional-state
   - `src/agents/catalog.ts` - Uses content-vector
   - `src/agents/match.ts` - Uses trajectory

3. Implement storage integration:
   - AgentDB for vectors
   - SQLite for metadata
   - ReasoningBank for trajectories

---

## References

- **Specification**: `/home/evafive/agentic-pancakes/docs/specs/SPECIFICATION.md`
- **Architecture**: `/home/evafive/agentic-pancakes/docs/specs/ARCHITECTURE.md`
- **Zod Documentation**: https://zod.dev/
