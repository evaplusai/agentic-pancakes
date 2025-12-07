# Hackathon TV5 Project Analysis
## Repository: bencium/hackathon-tv5

---

## Executive Summary

**Project Name:** Media Discovery Platform (Agentics Foundation TV5 Hackathon Entry)

**Repository Owner:** bencium (forked from agenticsorg)

**License:** Apache License 2.0

**Core Innovation:** Behavioral profiling system that creates personalized streaming recommendations in under 60 seconds through micro-interaction tracking, eliminating traditional questionnaires that cause 40% trial abandonment.

---

## Problem Statement

**Industry Challenge:**
- Users spend 45 minutes daily deciding what to watch across fragmented streaming platforms
- Traditional onboarding questionnaires take 5-10 minutes
- 40% of new users abandon trials during onboarding
- 20+ minutes of frustrated browsing for first-time users

**Their Solution:**
Profile users through behavioral observation in under 60 seconds using micro-interaction tracking instead of explicit questionnaires.

---

## Tech Stack Overview

### Frontend Stack
- **Framework:** Next.js 15 (App Router)
- **React:** v19.0.0
- **State Management:**
  - Zustand v5.0.9 (client state)
  - @tanstack/react-query v5.60.0 (server state)
- **Styling:** Tailwind CSS v3.4.0 + Framer Motion + canvas-confetti
- **Type Safety:** TypeScript with Zod v3.23.0 schema validation

### AI/ML Integration
- **AI SDKs:**
  - `ai` v4.0.0 (core AI SDK framework)
  - `@ai-sdk/google` v1.0.0 (Google AI integration)
  - `@ai-sdk/openai` v1.0.0 (OpenAI integration)
- **Vector Database:**
  - `ruvector` v0.1.31 (embedded vector operations)
  - 768-dimension embeddings (text-embedding-3-small)
  - HNSW indexing with 100,000 element capacity
  - Cosine similarity search with 0.3 default threshold

### Data Sources
- **Media API:** `tmdb-ts` v2.0.3 (TheMovieDatabase integration)
- **Persistence:** In-memory Map structure (development mode)

### Deployment Infrastructure
- **Cloud Platforms:** Google Cloud Run, Netlify, Vercel
- **Container:** Docker with cloudbuild.yaml pipeline
- **CI/CD:** Google Cloud Build

### Ruv Component Usage
**Primary Ruv Package:**
- `ruvector` v0.1.31 - Embedded vector database for semantic search

**Notable:** Only claude-flow v2.7.41 is present in root package.json. The media-discovery app does NOT use:
- AgentDB (planned for Phase 2)
- Claude Flow orchestration
- Other ruv-swarm components
- MCP server integration in the recommendation engine

---

## Architecture Deep Dive

### 1. Behavioral Profiling System

**Tracked Micro-Interactions:**
```typescript
// Discovery Store (Zustand)
{
  hoverTime: number          // Total milliseconds hovering on thumbnails
  clickCounts: number        // Frequency of selections
  clickSequence: string[]    // Ordered array of genre IDs
  mouseVelocity: number[]    // Speed measurements
  skipEvents: number         // High-velocity scrolls (>2000 units)
  totalTime: number          // Session duration
}
```

**Signal Weighting Algorithm:**
```typescript
// Genre Scoring Formula
genreScore = hoverTime + (clickOrder ? (9 - clickOrder) * 800 : 0)

// Individual Signal Weights
{
  returnVisits: 3.0x      // Strongest intent signal
  clicks: 2.5x            // Conscious selection
  microHesitations: 2.0x  // >500ms cursor slowdown
  hoverDuration: 1.5x     // >1000ms sustained attention
  highVelocityScroll: -1.5x // Active rejection
}
```

**Behavioral Triggers:**
```typescript
// Profile Completion Logic
hasProfile = !(
  clickSequence.length === 0 ||
  (totalTime <= 8 && clickSequence.length < 3)
)

showContinueButton = totalTime > 8 || clickSequence.length >= 3
```

### 2. Recommendation Engine Architecture

**Three-Strategy Sequential Pipeline:**

#### Strategy 1: Similar Content (Score: 0.85-0.90)
```typescript
// TMDB Similar Content API
similarContent = await getTMDBSimilar(contentId, mediaType, limit=8)
// Assign 0.9 relevance score

// Vector Similarity Search (ruvector)
vectorResults = await findSimilarContent(contentId, mediaType, k=5, threshold=0.3)
// Assign 0.85 relevance score

// Deduplicate by mediaType + ID
```

#### Strategy 2: Genre Discovery (Score: 0.75)
```typescript
// User genre preferences from behavioral profiling
topGenres = getTopGenresByScore(userProfile)

// TMDB Discovery API with filters
genreMatches = await discoverMovies({
  genres: topGenres,
  minRating: 7.0,
  sort: 'popularity.desc'
})
```

#### Strategy 3: Trending Fallback (Score: 0.5 - 0.01*index)
```typescript
// Supplement if insufficient recommendations
if (recommendations.length < requestedLimit) {
  trending = await getTrending('all', 'week')
  // Progressively decreasing scores
}
```

**Response Structure:**
```json
{
  "success": true,
  "recommendations": [
    {
      "id": 12345,
      "title": "Movie Title",
      "mediaType": "movie",
      "posterPath": "/path.jpg",
      "overview": "Description...",
      "voteAverage": 8.2
    }
  ],
  "scores": [0.92, 0.88, 0.85, ...],
  "reasoning": [
    ["Similar to your watched content", "High rating match"],
    ["Genre: Action, Sci-Fi", "Trending in your region"]
  ],
  "strategy_distribution": {
    "similar": 5,
    "genre": 3,
    "trending": 2
  }
}
```

### 3. Vector Search Implementation

**Ruvector Configuration:**
```typescript
// Singleton VectorDB instance
const db = new VectorDB({
  dimensions: 768,           // text-embedding-3-small
  maxElements: 100000,
  indexType: 'hnsw',         // Hierarchical Navigable Small World
  efConstruction: 200,       // Build-time accuracy
  M: 16                      // Max connections per layer
})
```

**Embedding Generation:**
```typescript
// OpenAI API integration with fallback
async function generateEmbedding(text: string): Promise<Float32Array> {
  if (OPENAI_API_KEY) {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    })
    return new Float32Array(response.data[0].embedding)
  } else {
    // Deterministic mock for development
    return generateDeterministicMockEmbedding(text)
  }
}
```

**Server-Side Caching:**
```typescript
// 5-minute TTL cache
const embeddingCache = new Map<string, {
  embedding: Float32Array,
  timestamp: number
}>()

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
```

**Semantic Search Flow:**
```typescript
async function semanticSearch(
  query: string,
  k: number = 10,
  threshold: number = 0.3,
  filters?: { mediaType?: string, genres?: number[] }
) {
  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(query)

  // 2. Vector similarity search
  const results = db.search(queryEmbedding, k)

  // 3. Filter by threshold
  const filtered = results.filter(r => r.score >= threshold)

  // 4. Post-filter by metadata
  return applyMetadataFilters(filtered, filters)
}
```

**Cosine Similarity Calculation:**
```typescript
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    magnitudeA += a[i] * a[i]
    magnitudeB += b[i] * b[i]
  }

  const magnitude = Math.sqrt(magnitudeA * magnitudeB)
  return magnitude === 0 ? 0 : dotProduct / magnitude
}
```

### 4. User Preferences & Personalization

**Data Persistence (In-Memory):**
```typescript
interface UserPreferences {
  userId: string
  favoriteGenres: number[]           // Top 10 genre IDs by score
  likedContent: string[]             // contentId array
  dislikedContent: string[]          // contentId array
  watchHistory: WatchHistoryEntry[]  // Max 500 recent entries
  preferenceVectors: Map<string, number>
  lastUpdated: Date
  createdAt: Date
}

const userPreferencesStore = new Map<string, UserPreferences>()
```

**Personalized Scoring Logic:**
```typescript
function getPersonalizedScore(content: MediaContent, userPrefs: UserPreferences): number {
  let score = 0

  // Genre matching (0.1 per match)
  const genreMatches = content.genres.filter(g =>
    userPrefs.favoriteGenres.includes(g)
  )
  score += genreMatches.length * 0.1

  // Explicit feedback
  if (userPrefs.likedContent.includes(content.id)) score += 0.2
  if (userPrefs.dislikedContent.includes(content.id)) score -= 0.5

  // Recency penalty (avoid redundancy)
  const recentWatch = userPrefs.watchHistory.find(w =>
    w.contentId === content.id &&
    Date.now() - w.timestamp < 30 * 24 * 60 * 60 * 1000 // 30 days
  )
  if (recentWatch && recentWatch.progress >= 0.9) score -= 0.3

  return score
}
```

**Watch Tracking with Weighted Signals:**
```typescript
const WATCH_WEIGHTS = {
  watch_completed: 0.3,      // progress >= 90%
  watch_partial: 0.1,        // 50% <= progress < 90%
  explicit_like: 0.5,        // User clicked "like"
  explicit_dislike: -0.4     // User clicked "dislike"
}

async function recordWatch(data: {
  userId: string
  contentId: string
  mediaType: string
  progress: number          // 0.0 to 1.0
  rating?: number          // 1-10
}) {
  const prefs = getUserPreferences(data.userId)

  // Update watch history
  prefs.watchHistory.push({
    ...data,
    timestamp: Date.now()
  })

  // Update genre preferences if progress >= 50%
  if (data.progress >= 0.5) {
    const content = await getContentDetails(data.contentId, data.mediaType)
    updateGenrePreferences(prefs, content.genres, data.progress)
  }

  // Maintain max 500 entries
  if (prefs.watchHistory.length > 500) {
    prefs.watchHistory = prefs.watchHistory.slice(-500)
  }

  saveUserPreferences(prefs)
}
```

**Dynamic Genre Learning:**
```typescript
function updateGenrePreferences(
  prefs: UserPreferences,
  contentGenres: number[],
  completionRate: number
) {
  const weight = completionRate >= 0.9
    ? WATCH_WEIGHTS.watch_completed
    : WATCH_WEIGHTS.watch_partial

  // Accumulate scores
  const genreScores = new Map<number, number>()

  for (const genre of contentGenres) {
    const currentScore = genreScores.get(genre) || 0
    genreScores.set(genre, currentScore + weight)
  }

  // Merge with existing preferences
  for (const [genre, score] of prefs.preferenceVectors) {
    genreScores.set(genre, (genreScores.get(genre) || 0) + score)
  }

  // Keep top 10 genres
  const sortedGenres = Array.from(genreScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([genreId]) => genreId)

  prefs.favoriteGenres = sortedGenres
  prefs.lastUpdated = new Date()
}
```

### 5. API Route Architecture

**Seven RESTful Endpoints:**

1. **`GET /api/discover`** - Browse media with filters
2. **`GET /api/health`** - Service health check
3. **`GET/POST /api/recommendations`** - Personalized suggestions
4. **`GET/POST/DELETE /api/preferences`** - User profile management
5. **`GET /api/search`** - Multi-modal search (semantic + keyword)
6. **`GET /api/movies/[id]`** - Movie details with credits, videos, similar
7. **`GET /api/tv/[id]`** - TV show details with cast, episodes, similar

**TMDB Integration Pattern:**
```typescript
// Comprehensive data fetching
async function getFullMovieDetails(id: number) {
  const response = await tmdb.movie.details(id, {
    append_to_response: 'credits,videos,similar,recommendations'
  })

  return {
    ...transformToMediaContent(response),
    credits: response.credits,
    videos: response.videos.results,
    similar: response.similar.results.map(transformToMediaContent),
    recommendations: response.recommendations.results.map(transformToMediaContent)
  }
}
```

### 6. User Flow & UX Design

**Three-Screen Journey:**

#### Screen 1: Entry (Sign-In)
```typescript
// Initial welcome interface
<WelcomeScreen>
  <h1>Discover Your Next Watch</h1>
  <p>No questionnaires. No endless scrolling.
     Just a few moments of your attention.</p>
  <EmailInput />
  <Button>Start Exploring</Button>
</WelcomeScreen>
```

#### Screen 2: Discovery Grid (Profiling)
```typescript
// 8 genre thumbnails, no labels
<DiscoveryGrid>
  {shuffledGenres.map(genre => (
    <Thumbnail
      key={genre.id}
      src={genre.posterPath}
      aspectRatio="9:16"           // Portrait orientation
      onHoverStart={trackHover}
      onHoverEnd={calculateDuration}
      onClick={recordClick}
      onMouseMove={measureVelocity}
    />
  ))}

  <Timer>{totalTime.toFixed(3)}s</Timer>

  {showContinueButton && (
    <Button className="animate-gradient-border">
      See My Recommendations
    </Button>
  )}
</DiscoveryGrid>
```

#### Screen 3: Results (Personalized Feed)
```typescript
// Personalized recommendations with revealed labels
<ResultsScreen>
  {hasProfile ? (
    <>
      <Section title={`Perfect for ${topGenres.join(', ')} Fans`}>
        {personalizedRecommendations.map(renderMediaCard)}
      </Section>
      <Badge>
        You saved {45 - totalTime} minutes vs traditional browsing
      </Badge>
      <Confetti />
    </>
  ) : (
    <Section title="Trending Now">
      {trendingContent.map(renderMediaCard)}
    </Section>
  )}
</ResultsScreen>
```

**Key Design Decisions:**

1. **No Genre Labels During Profiling**
   - Users react to visuals using intuitive "System 1" thinking
   - Prevents conscious categorization bias
   - Generates authentic preference signals

2. **Labels Revealed in Results**
   - Creates "aha moment" validation
   - Users feel genuinely understood
   - Demonstrates profiling accuracy

3. **Live Millisecond Timer**
   - Builds confidence in 60-second promise
   - Real-time proof of speed claim
   - Gamification element

4. **Large Numbered Badges on Selection**
   - Clear visual feedback (1, 2, 3 indicators)
   - Shows click sequence priority
   - Reinforces interaction tracking

5. **Portrait Thumbnails (9:16 aspect ratio)**
   - Higher visual impact than landscape
   - Mimics mobile streaming app UX
   - Better genre identification from posters

---

## Key Features & Innovations

### 1. Behavioral Signal Intelligence

**Multi-Modal Tracking:**
- Hover duration (1000ms+ = sustained attention)
- Click sequence ordering (earlier = higher priority)
- Mouse velocity analysis (>2000 units = skip behavior)
- Return visits (3.0x multiplier for strong intent)
- Micro-hesitations (>500ms cursor slowdown = subconscious interest)

**Advantages Over Questionnaires:**
- 95% faster (60 seconds vs 5-10 minutes)
- Eliminates response bias
- Captures subconscious preferences
- No user fatigue
- Real-time adaptation

### 2. Hybrid Recommendation System

**Three-Layer Architecture:**
1. Vector semantic similarity (ruvector + OpenAI embeddings)
2. TMDB collaborative filtering
3. Trending content fallback

**Score Blending:**
```typescript
finalScore = (
  vectorScore * 0.85 +
  tmdbScore * 0.9 +
  personalizedScore
) / 3
```

### 3. Production-Ready Features

- **Suspense Boundaries:** Progressive content loading
- **Zod Schema Validation:** Type-safe API contracts
- **Error Handling:** Graceful degradation for skipped profiles
- **GDPR Compliance:** Data export and deletion APIs
- **Responsive Design:** Mobile-first with smart TV optimization
- **Performance:** React Query caching + 5-minute embedding TTL
- **Animations:** Framer Motion + CSS keyframes + confetti celebrations

### 4. Transparency & Trust

**Disclosure Banner:**
```typescript
{!hasProfile && (
  <Banner>
    We couldn't build your profile yet.
    Showing trending content instead.
  </Banner>
)}
```

**Success Metrics Display:**
```typescript
<MetricsBadge>
  ✓ Profile created in {totalTime.toFixed(1)}s
  ✓ {45 - totalTime} minutes saved
  ✓ 80%+ users report "this feels right"
</MetricsBadge>
```

---

## Strengths & Innovations

### 🏆 Major Strengths

1. **Novel Behavioral Profiling Approach**
   - First-of-its-kind micro-interaction tracking for streaming
   - Eliminates cold-start problem without questionnaires
   - 95% time reduction vs traditional onboarding

2. **Sophisticated Multi-Strategy Recommendations**
   - Combines vector similarity, collaborative filtering, and trending
   - Smart score blending with reasoning transparency
   - Fallback mechanisms ensure zero empty results

3. **Production-Grade Vector Search**
   - Proper ruvector integration with HNSW indexing
   - Server-side caching with 5-minute TTL
   - Cosine similarity with configurable thresholds
   - Metadata filtering for precision

4. **User-Centric UX Design**
   - Label-free profiling prevents bias
   - Real-time timer builds trust
   - Confetti celebration creates delight
   - Graceful degradation for edge cases

5. **Comprehensive TMDB Integration**
   - Full movie/TV details with credits, videos, similar content
   - Multi-modal search (semantic + keyword + trending)
   - Dynamic genre discovery with rating filters

### 💡 Innovative Approaches

1. **Mouse Velocity Analysis**
   - Detects skip behavior (>2000 units)
   - Identifies engaged vs disengaged browsing
   - Negative weighting for active rejection

2. **Click Sequence Weighting**
   - Earlier clicks receive higher scores: `(9 - clickOrder) * 800`
   - Captures priority ordering in decision-making
   - Mimics natural selection hierarchy

3. **Adaptive Genre Learning**
   - Dynamically updates preferences from watch behavior
   - Completion rate weighted (0.3 for 90%+, 0.1 for 50-90%)
   - Maintains top 10 genres by accumulated scores

4. **Recency Penalty Algorithm**
   - -0.3 score for content watched in last 30 days
   - Prevents redundant recommendations
   - Encourages discovery of new content

5. **Transparency in AI Reasoning**
   - Each recommendation includes reasoning array
   - Strategy distribution metadata
   - Builds user trust through explainability

---

## Phase 2 Roadmap (Planned Features)

1. **AgentDB Integration**
   - Persistent behavioral profiles across sessions
   - Cross-device synchronization
   - Long-term preference evolution tracking

2. **CLIP Embeddings for Visual Similarity**
   - Thumbnail-based matching beyond text
   - Visual style preferences (cinematography, color palettes)
   - Poster art similarity clustering

3. **Emotional Arc Matching**
   - Story trajectory recommendations
   - Pacing preferences (slow-burn vs action-packed)
   - Emotional journey similarity

4. **Multi-Device Optimization**
   - Smart TV interface with remote-friendly UX
   - Mobile swipe gestures for profiling
   - Cross-device history synchronization

---

## Gaps & Limitations

### Current Limitations

1. **No Actual AgentDB Integration**
   - In-memory Map storage (lost on server restart)
   - No persistence across sessions
   - Single-instance limitation (no horizontal scaling)

2. **Missing MCP Server Integration**
   - Claude Flow present in root package.json but unused
   - No agent orchestration in recommendation pipeline
   - No multi-agent collaboration for complex queries

3. **Limited AI Model Usage**
   - OpenAI embeddings only (no Gemini, Claude usage)
   - No LLM-based natural language query understanding
   - AI SDK packages present but underutilized

4. **Deterministic Mock Fallback**
   - Falls back to hash-based embeddings without OpenAI key
   - Reduces semantic accuracy in development/demo mode

5. **No Real-Time Collaboration**
   - No WebSocket integration for live updates
   - No shared discovery sessions
   - Single-user profiling only

### Potential Improvements

1. **Add AgentDB for True Persistence**
   ```typescript
   import { AgentDB } from 'agentdb'

   const db = new AgentDB({
     name: 'media-discovery-prefs',
     schema: UserPreferencesSchema
   })

   async function saveUserPreferences(prefs: UserPreferences) {
     await db.upsert(prefs.userId, prefs)
   }
   ```

2. **Integrate Claude Flow for Multi-Agent Workflows**
   ```typescript
   import { ClaudeFlow } from 'claude-flow'

   const flow = new ClaudeFlow({
     agents: ['researcher', 'ranker', 'explainer'],
     topology: 'pipeline'
   })

   const recommendations = await flow.execute({
     task: 'Generate personalized recommendations',
     context: { userProfile, genrePreferences, watchHistory }
   })
   ```

3. **Add Natural Language Query Agent**
   ```typescript
   async function naturalLanguageSearch(query: string) {
     const intent = await gemini.extractIntent(query)
     const vectorResults = await semanticSearch(intent.embedding)
     const explanation = await claude.generateExplanation(vectorResults)

     return { results: vectorResults, reasoning: explanation }
   }
   ```

4. **Implement CLIP for Visual Similarity**
   ```typescript
   import { CLIP } from '@ai-sdk/clip'

   const visualEmbedding = await CLIP.encode(posterImage)
   const similarPosters = await db.search(visualEmbedding, {
     mediaType: 'visual',
     k: 10
   })
   ```

---

## Comparison to Our Project

### Similarities
- Both use TMDB API for content
- Both implement recommendation systems
- Both use behavioral tracking
- Both aim for personalization

### Differences

| Feature | hackathon-tv5 | Our Project |
|---------|---------------|-------------|
| **Vector Search** | Ruvector with OpenAI embeddings | Not implemented |
| **Behavioral Profiling** | Micro-interaction tracking (hover, velocity, clicks) | Basic click tracking |
| **Data Persistence** | In-memory Map (development) | JSON file storage |
| **AI Integration** | Google AI SDK + OpenAI | Not implemented |
| **State Management** | Zustand + React Query | Manual state |
| **Recommendation Strategy** | 3-layer (vector, collaborative, trending) | Single TMDB similar |
| **Scoring Algorithm** | Multi-signal weighted (8 signals) | Basic genre matching |
| **Genre Learning** | Dynamic updates from watch behavior | Static preferences |
| **UX Flow** | 3-screen profiling journey | Direct recommendation |
| **Deployment** | Google Cloud Run + Netlify | Not deployed |

### What We Can Learn

1. **Implement Ruvector for Semantic Search**
   - Add `ruvector` package
   - Generate embeddings for all content
   - Use cosine similarity for related content

2. **Add Behavioral Profiling**
   - Track hover time on thumbnails
   - Measure mouse velocity for skip detection
   - Implement click sequence weighting

3. **Multi-Strategy Recommendations**
   - Combine vector similarity + TMDB similar + trending
   - Implement score blending with reasoning
   - Add fallback mechanisms

4. **Improve Personalization Scoring**
   - Add weighted signals (watch completion, explicit feedback)
   - Implement recency penalties
   - Dynamic genre learning from behavior

5. **Better State Management**
   - Use Zustand for client state
   - Add React Query for server state caching
   - Implement proper TypeScript types

6. **Production Features**
   - Zod schema validation for APIs
   - Suspense boundaries for loading states
   - Error handling and graceful degradation
   - GDPR compliance (export/delete)

---

## Code Samples for Reference

### Behavioral Tracking Hook
```typescript
// From discovery-store.ts
const useDiscoveryMetrics = create<DiscoveryMetrics>((set, get) => ({
  genres: {},
  clickSequence: [],
  mouseVelocity: [],
  skipEvents: 0,
  startTime: Date.now(),
  totalTime: 0,
  currentScreen: 'welcome',

  trackGenreHover: (genreId: string, genreName: string) => {
    set((state) => ({
      genres: {
        ...state.genres,
        [genreId]: {
          ...state.genres[genreId],
          name: genreName,
          hoverCount: (state.genres[genreId]?.hoverCount || 0) + 1,
          lastHoverStart: Date.now()
        }
      }
    }))
  },

  trackGenreHoverEnd: (genreId: string) => {
    set((state) => {
      const genre = state.genres[genreId]
      if (!genre?.lastHoverStart) return state

      const duration = Date.now() - genre.lastHoverStart
      return {
        genres: {
          ...state.genres,
          [genreId]: {
            ...genre,
            hoverTime: (genre.hoverTime || 0) + duration,
            lastHoverStart: undefined
          }
        }
      }
    })
  },

  trackGenreClick: (genreId: string) => {
    set((state) => ({
      clickSequence: [...state.clickSequence, genreId],
      genres: {
        ...state.genres,
        [genreId]: {
          ...state.genres[genreId],
          clickCount: (state.genres[genreId]?.clickCount || 0) + 1
        }
      }
    }))
  },

  trackMouseVelocity: (velocity: number) => {
    set((state) => {
      const newVelocity = [...state.mouseVelocity, velocity]
      const skipEvents = velocity > 2000
        ? state.skipEvents + 1
        : state.skipEvents

      return {
        mouseVelocity: newVelocity,
        skipEvents
      }
    })
  },

  getGenreScore: (genreId: string) => {
    const genre = get().genres[genreId]
    if (!genre) return 0

    const hoverScore = genre.hoverTime || 0
    const clickOrder = get().clickSequence.indexOf(genreId)
    const clickScore = clickOrder >= 0 ? (9 - clickOrder) * 800 : 0

    return hoverScore + clickScore
  }
}))
```

### Vector Search Implementation
```typescript
// From vector-search.ts
import { VectorDB } from 'ruvector'

let vectorDB: VectorDB | null = null

function getVectorDB(): VectorDB {
  if (!vectorDB) {
    vectorDB = new VectorDB({
      dimensions: 768,
      maxElements: 100000,
      indexType: 'hnsw',
      efConstruction: 200,
      M: 16
    })
  }
  return vectorDB
}

async function storeContentEmbedding(
  contentId: string,
  mediaType: string,
  title: string,
  overview: string,
  genres: number[],
  voteAverage: number,
  releaseDate: string,
  posterPath: string | null
) {
  const text = `${title} ${overview} genres: ${genres.join(' ')}`
  const embedding = await generateEmbedding(text)

  const db = getVectorDB()
  await db.add({
    id: `${mediaType}-${contentId}`,
    vector: embedding,
    metadata: {
      contentId,
      mediaType,
      title,
      overview,
      genres,
      voteAverage,
      releaseDate,
      posterPath
    }
  })
}

async function semanticSearch(
  query: string,
  k: number = 10,
  threshold: number = 0.3,
  filters?: {
    mediaType?: string
    genres?: number[]
  }
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query)
  const db = getVectorDB()

  let results = await db.search(queryEmbedding, k * 2) // Over-fetch for filtering

  // Filter by similarity threshold
  results = results.filter(r => r.score >= threshold)

  // Apply metadata filters
  if (filters?.mediaType) {
    results = results.filter(r => r.metadata.mediaType === filters.mediaType)
  }

  if (filters?.genres && filters.genres.length > 0) {
    results = results.filter(r =>
      r.metadata.genres.some(g => filters.genres!.includes(g))
    )
  }

  return results.slice(0, k)
}

async function findSimilarContent(
  contentId: string,
  mediaType: string,
  k: number = 5,
  threshold: number = 0.3
): Promise<MediaContent[]> {
  const db = getVectorDB()
  const item = await db.get(`${mediaType}-${contentId}`)

  if (!item) return []

  const results = await db.search(item.vector, k + 1) // +1 to exclude self

  return results
    .filter(r => r.id !== `${mediaType}-${contentId}`) // Exclude original
    .filter(r => r.score >= threshold)
    .slice(0, k)
    .map(r => r.metadata as MediaContent)
}
```

### Personalized Scoring
```typescript
// From preferences.ts
function getPersonalizedScore(
  content: MediaContent,
  userPrefs: UserPreferences
): number {
  let score = 0

  // Genre matching
  const genreMatches = content.genres.filter(g =>
    userPrefs.favoriteGenres.includes(g)
  )
  score += genreMatches.length * 0.1

  // Explicit feedback
  if (userPrefs.likedContent.includes(content.id)) {
    score += 0.2
  }

  if (userPrefs.dislikedContent.includes(content.id)) {
    score -= 0.5
  }

  // Recency penalty (avoid redundancy)
  const recentWatch = userPrefs.watchHistory.find(w =>
    w.contentId === content.id &&
    Date.now() - w.timestamp < 30 * 24 * 60 * 60 * 1000
  )

  if (recentWatch && recentWatch.progress >= 0.9) {
    score -= 0.3
  }

  return score
}

async function recordWatch(data: {
  userId: string
  contentId: string
  mediaType: string
  progress: number
  rating?: number
}) {
  const prefs = getUserPreferences(data.userId)

  prefs.watchHistory.push({
    ...data,
    timestamp: Date.now()
  })

  // Update genre preferences if >= 50% watched
  if (data.progress >= 0.5) {
    const content = await getContentDetails(data.contentId, data.mediaType)
    updateGenrePreferences(prefs, content.genres, data.progress)
  }

  // Maintain max 500 entries
  if (prefs.watchHistory.length > 500) {
    prefs.watchHistory = prefs.watchHistory.slice(-500)
  }

  saveUserPreferences(prefs)
}

function updateGenrePreferences(
  prefs: UserPreferences,
  contentGenres: number[],
  completionRate: number
) {
  const weight = completionRate >= 0.9 ? 0.3 : 0.1

  const genreScores = new Map<number, number>()

  // Add current content genres
  for (const genre of contentGenres) {
    genreScores.set(genre, weight)
  }

  // Merge with existing preferences
  for (const [genre, score] of prefs.preferenceVectors) {
    genreScores.set(genre, (genreScores.get(genre) || 0) + score)
  }

  // Keep top 10
  const sortedGenres = Array.from(genreScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([genreId]) => genreId)

  prefs.favoriteGenres = sortedGenres
  prefs.lastUpdated = new Date()
}
```

---

## Conclusion

**hackathon-tv5** is a well-architected production-ready application demonstrating sophisticated behavioral profiling and multi-strategy recommendations. While it only uses one ruv component (`ruvector`), it showcases best practices in:

1. Vector search implementation
2. Behavioral analytics
3. Multi-layer recommendation systems
4. Production-grade TypeScript architecture
5. User-centric UX design

**Key Takeaways for Our Project:**
- Implement ruvector for semantic search
- Add behavioral profiling beyond clicks
- Use multi-strategy recommendations with score blending
- Improve state management with Zustand/React Query
- Add production features (validation, caching, error handling)

**Notable Gap:** Despite having claude-flow in dependencies, they don't leverage MCP or agent orchestration, which could enhance their recommendation pipeline with multi-agent collaboration.
