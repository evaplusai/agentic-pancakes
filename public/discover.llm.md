# Universal Content Discovery - AI Agent Discovery Endpoint

## Overview

This document describes the discovery endpoint for AI agents to interact with the Universal Content Discovery Platform. The platform provides emotion-based content recommendations using a multi-agent swarm architecture.

## Base Information

- **Service Name**: Universal Content Discovery Platform
- **Version**: 1.0 (MVP)
- **Base URL**: `https://content-discovery.tv5monde.com/api`
- **Protocol**: REST API + MCP (Model Context Protocol)
- **Authentication**: API Key (header: `X-API-Key`)
- **Rate Limit**: 100 requests/minute per user

## Primary Capabilities

### 1. Emotion-Based Recommendations

The core capability of this platform is translating emotional states into content recommendations.

**Endpoint**: `POST /recommendations`

**Input Format**:
```json
{
  "quizResponse": {
    "round1": "unwind",
    "round2": "laugh",
    "round3": {
      "genres": ["comedy", "animation"],
      "maxRuntime": 120
    }
  },
  "context": {
    "timeOfDay": "evening",
    "device": "tv",
    "social": true
  },
  "userId": "optional-user-id"
}
```

**Alternative Input (Natural Language)**:
```json
{
  "textInput": "I want something light and funny to watch with my family tonight, nothing too long",
  "context": {
    "timeOfDay": "evening",
    "device": "tv",
    "social": true
  }
}
```

**Output Format**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "topPick": {
    "title": "The Grand Budapest Hotel",
    "matchScore": 92,
    "description": "A quirky comedy about a famous European hotel...",
    "genres": ["Comedy", "Drama"],
    "runtime": 99,
    "year": 2014,
    "platform": "TV5MONDE",
    "deeplink": "https://tv5monde.com/watch/grand-budapest-hotel",
    "metadata": {
      "director": "Wes Anderson",
      "cast": ["Ralph Fiennes", "Tony Revolori"],
      "rating": 8.1,
      "language": "English/French",
      "subtitles": ["French", "English"]
    }
  },
  "alternatives": [
    {
      "title": "Amélie",
      "matchScore": 88,
      "description": "A whimsical French comedy about a shy waitress...",
      "genres": ["Comedy", "Romance"],
      "runtime": 122,
      "year": 2001,
      "platform": "Netflix",
      "deeplink": "https://netflix.com/watch/...",
      "metadata": {...}
    },
    {
      "title": "Paddington 2",
      "matchScore": 85,
      "description": "The beloved bear returns for more adventures...",
      "genres": ["Comedy", "Family", "Animation"],
      "runtime": 103,
      "year": 2017,
      "platform": "Amazon Prime",
      "deeplink": "https://primevideo.com/watch/...",
      "metadata": {...}
    },
    {
      "title": "Ratatouille",
      "matchScore": 84,
      "description": "A rat who dreams of becoming a chef in Paris...",
      "genres": ["Animation", "Comedy", "Family"],
      "runtime": 111,
      "year": 2007,
      "platform": "Disney+",
      "deeplink": "https://disneyplus.com/watch/...",
      "metadata": {...}
    }
  ],
  "reasoning": "Based on your desire to unwind with laughter, I've selected visually stunning, heartwarming comedies perfect for evening family viewing. The Grand Budapest Hotel matches your preference for shorter runtimes while delivering consistent laughs through its quirky characters and witty dialogue. The whimsical visual style creates a relaxed atmosphere ideal for unwinding together.",
  "provenance": {
    "trajectories": 247,
    "confidence": 0.92,
    "evidence": "Users with similar emotional states completed this content 87% of the time and rated it 4.3/5 on average. The 'unwind + laugh' pattern has 247 supporting trajectories in our learning system."
  },
  "latency": 2847
}
```

**Response Time**: < 3000ms (target)

### 2. Search Refinement

Refine recommendations with additional filters while preserving emotional context.

**Endpoint**: `POST /search`

**Input Format**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "filters": {
    "genres": ["comedy", "drama"],
    "platform": ["TV5MONDE", "Netflix"],
    "runtime": {
      "min": 60,
      "max": 120
    },
    "language": ["French"],
    "releaseYear": {
      "min": 2015,
      "max": 2024
    }
  }
}
```

**Output Format**:
```json
{
  "results": [
    {
      "title": "...",
      "matchScore": 89,
      "...": "same structure as topPick"
    }
  ],
  "totalResults": 15,
  "filters": {
    "applied": {...},
    "available": {
      "genres": ["comedy", "drama", "thriller", "..."],
      "platforms": ["TV5MONDE", "Netflix", "Amazon Prime", "Disney+"],
      "languages": ["French", "English", "Spanish", "..."]
    }
  }
}
```

### 3. Trending Content

Get trending content across platforms with optional emotional filtering.

**Endpoint**: `GET /trending`

**Query Parameters**:
- `platform` (optional): "all" | "Netflix" | "Amazon Prime" | "Disney+" | "TV5MONDE"
- `region` (optional): ISO country code (default: "FR")
- `emotionalFilter` (optional): JSON object with energy/valence scores

**Example**:
```
GET /trending?platform=Netflix&region=FR
```

**Output Format**:
```json
{
  "trending": [
    {
      "title": "Lupin",
      "rank": 1,
      "platform": "Netflix",
      "trendingScore": 98,
      "emotionalMatch": null,
      "genres": ["Thriller", "Drama"],
      "description": "...",
      "deeplink": "https://netflix.com/watch/..."
    },
    {
      "title": "Emily in Paris",
      "rank": 2,
      "platform": "Netflix",
      "trendingScore": 95,
      "emotionalMatch": null,
      "...": "..."
    }
  ],
  "updatedAt": "2024-12-06T00:00:00Z"
}
```

**With Emotional Filter**:
```
GET /trending?platform=all&emotionalFilter={"energy":0.3,"valence":0.7}
```

**Output**:
```json
{
  "trending": [
    {
      "title": "...",
      "rank": 1,
      "platform": "Netflix",
      "trendingScore": 98,
      "emotionalMatch": 87,
      "...": "..."
    }
  ],
  "updatedAt": "2024-12-06T00:00:00Z"
}
```

### 4. User Feedback

Submit user actions to improve learning and personalization.

**Endpoint**: `POST /feedback`

**Input Format**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "contentId": "tmdb-12345",
  "action": "completed",
  "rating": 5,
  "watchDuration": 99
}
```

**Actions**:
- `watched` - User started watching
- `completed` - User finished watching
- `dismissed` - User rejected recommendation
- `saved` - User bookmarked for later
- `abandoned` - User stopped partway through

**Output Format**:
```json
{
  "success": true,
  "message": "Feedback recorded successfully",
  "learningImpact": {
    "trajectoriesUpdated": 3,
    "patternsReinforced": ["unwind-laugh-comedy", "evening-family-animation"]
  }
}
```

## Emotional State Model

The system uses a universal emotional state representation:

```typescript
{
  "energy": 0.0-1.0,        // Activation level (calm to energized)
  "valence": 0.0-1.0,       // Emotional tone (negative to positive)
  "arousal": 0.0-1.0,       // Excitement level
  "cognitiveCapacity": 0.0-1.0,  // Mental bandwidth available
  "needs": {
    "comfort": 0.0-1.0,     // Need for familiarity
    "escape": 0.0-1.0,      // Need for distraction
    "stimulation": 0.0-1.0, // Need for engagement
    "connection": 0.0-1.0,  // Need for emotional resonance
    "achievement": 0.0-1.0  // Need for resolution/completion
  },
  "context": {
    "timeOfDay": "morning|afternoon|evening|night",
    "device": "mobile|tablet|desktop|tv",
    "social": boolean,
    "location": "home|commute|travel"
  },
  "constraints": {
    "avoid": ["horror", "violence", ...],
    "prefer": ["comedy", "animation", ...]
  }
}
```

### Quiz to Emotional State Mapping

**Round 1 + Round 2 Combinations**:

| Round 1 | Round 2 | Energy | Valence | Arousal | Cognitive | Primary Needs |
|---------|---------|--------|---------|---------|-----------|---------------|
| unwind  | laugh   | 0.3    | 0.7     | 0.4     | 0.3       | comfort, escape |
| unwind  | feel    | 0.2    | 0.5     | 0.2     | 0.4       | connection, comfort |
| engage  | thrill  | 0.8    | 0.6     | 0.9     | 0.5       | stimulation, escape |
| engage  | think   | 0.6    | 0.5     | 0.6     | 0.9       | achievement, stimulation |

## Agent Architecture Details

The platform uses 6 specialized AI agents orchestrated in a workflow:

### 1. Intent Agent (Claude Haiku)
- **Role**: Extract emotional state from input
- **Input**: Quiz responses or natural language
- **Output**: UniversalEmotionalState object
- **Latency**: < 300ms
- **Memory**: Queries Reflexion Memory for learned constraints

### 2. Catalog Agent (AgentDB)
- **Role**: Vector similarity search
- **Input**: Emotional state + filters
- **Output**: Top 50 content candidates
- **Latency**: < 100ms
- **Technology**: HNSW indexing (150x faster)
- **Vector Dimensions**: 768D (512D plot + 64D genre + 64D mood + 128D metadata)

### 3. Trend Agent (TMDB/FlixPatrol)
- **Role**: Fetch trending content and boosting scores
- **Input**: Platform, region, emotional state
- **Output**: Trending content with scores
- **Latency**: < 200ms
- **Update Frequency**: Daily at 00:00 UTC
- **Sources**: TMDB API, FlixPatrol scraping

### 4. Match Agent (Claude Haiku)
- **Role**: Score and rank candidates
- **Input**: Candidates, emotional state, trending boosts
- **Output**: Top 4 ranked recommendations
- **Latency**: < 200ms
- **Formula (MVP)**:
  ```
  score = vectorSim × 0.25 + moodScore × 0.30 +
          intentScore × 0.20 + contextScore × 0.15 +
          trendingScore × 0.10
  ```
- **Learning**: Queries ReasoningBank for dynamic weights (Phase 2)

### 5. Present Agent (Claude Sonnet)
- **Role**: Format output with provenance and reasoning
- **Input**: Ranked recommendations, emotional state
- **Output**: Final recommendation response
- **Latency**: < 500ms
- **Features**: Provenance generation, human-readable explanations, deeplink creation

### 6. Orchestrator Agent (Claude Sonnet 4)
- **Role**: Coordinate workflow, handle errors
- **Input**: Original request
- **Output**: Final response
- **Latency**: < 500ms overhead
- **Features**: Parallel execution, retry logic, trajectory storage

### Parallel Execution

Agents run in parallel where possible:

```
Intent → ┌→ Catalog → ┐
         │            ├→ Match → Present → Response
         └→ Trend   → ┘
```

## Learning System

### ReasoningBank (Phase 2)
- Stores user trajectories (session → recommendation → outcome)
- Discovers patterns in successful recommendations
- Adapts scoring weights dynamically
- Performance: 32.6M ops/sec

### Reflexion Memory (Phase 2)
- Stores failed recommendations with self-critique
- Learns constraints to avoid
- Suggests better alternatives for similar contexts
- Format: (context, action, outcome, critique, better_action)

### Skill Library (Phase 2)
- Composable skills learned from patterns
- Triggered by context conditions
- Success rate tracking
- Performance: 694 ops/sec

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {...},
    "retryable": boolean,
    "documentation": "https://docs.content-discovery.tv5monde.com/errors/ERROR_CODE"
  }
}
```

**Common Error Codes**:
- `INVALID_INPUT` - Validation error (400)
- `AUTHENTICATION_FAILED` - Invalid API key (401)
- `RATE_LIMIT_EXCEEDED` - Too many requests (429)
- `SERVICE_UNAVAILABLE` - Temporary failure (503)
- `AGENT_TIMEOUT` - Agent exceeded timeout (504)

**Retry Strategy**:
- Retryable errors: 3 attempts with exponential backoff
- Non-retryable errors: Fail immediately
- Circuit breaker: After 5 consecutive failures, enter recovery mode

## MCP Integration

This service implements the Model Context Protocol for Claude Desktop:

### MCP Server Configuration

Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "content-discovery": {
      "command": "npx",
      "args": ["@universal-content-discovery/mcp-server"],
      "env": {
        "API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Available MCP Tools

1. **get_recommendation** - Same as POST /recommendations
2. **refine_search** - Same as POST /search
3. **get_trending** - Same as GET /trending
4. **user_feedback** - Same as POST /feedback
5. **get_profile** - Get user preference profile
6. **health_check** - Service health status

### MCP Resources

The server exposes these resources:

- `content://recommendations/{sessionId}` - Recommendation details
- `content://trending/{platform}` - Trending content
- `content://user/{userId}/profile` - User profile

## Performance Characteristics

- **Target Latency**: < 3 seconds end-to-end
- **Agent Breakdown**:
  - Intent: < 300ms
  - Catalog: < 100ms (parallel with Trend)
  - Trend: < 200ms (parallel with Catalog)
  - Match: < 200ms
  - Present: < 500ms
  - Orchestrator: < 500ms overhead

- **Parallel Optimization**: Catalog + Trend run concurrently (saves ~200ms)
- **Cache Hit Rate**: 60-70% for trending data
- **Vector Search**: 150x faster than naive search (HNSW)

## Privacy & Compliance

### GDPR
- **Right to Access**: `GET /user/{userId}/data`
- **Right to Erasure**: `DELETE /user/{userId}`
- **Right to Portability**: `GET /user/{userId}/export`
- **Data Retention**: 90 days for trajectories (configurable)

### Data Storage
- **Trajectories**: Anonymized, encrypted at rest (AES-256)
- **User Profiles**: Separate storage, encrypted
- **Vectors**: Local AgentDB (no cloud)
- **Metadata**: SQLite with encryption

### Security
- TLS 1.3 for all connections
- API key rotation supported
- Rate limiting per user
- Input validation (Zod schemas)
- SQL injection protection
- XSS protection

## Example Workflows

### Workflow 1: First-Time User (60-Second Quiz)

1. User opens Claude Desktop
2. User: "I want to watch something"
3. Agent calls `get_recommendation` with default context
4. System presents quick quiz:
   - "Do you want to unwind or engage?"
   - "Laugh, feel, thrill, or think?"
5. User responds: "unwind" + "laugh"
6. Agent calls `get_recommendation` with quiz responses
7. System returns recommendation in < 3 seconds
8. User watches content
9. Agent calls `user_feedback` with "completed" + rating

### Workflow 2: Natural Language Input

1. User: "I'm exhausted after work and want something mindless and fun"
2. Agent calls `get_recommendation` with:
   ```json
   {
     "textInput": "I'm exhausted after work and want something mindless and fun",
     "context": {
       "timeOfDay": "evening",
       "device": "tv"
     }
   }
   ```
3. Intent Agent extracts: `{energy: 0.2, valence: 0.7, cognitiveCapacity: 0.2}`
4. System returns light comedy recommendations
5. User: "Actually, nothing animated"
6. Agent calls `refine_search` with:
   ```json
   {
     "sessionId": "...",
     "filters": {
       "genres": ["comedy"],
       "exclude": ["animation"]
     }
   }
   ```

### Workflow 3: Trending Discovery

1. User: "What's popular on Netflix right now?"
2. Agent calls `get_trending` with `?platform=Netflix&region=FR`
3. System returns top 10 trending
4. User: "What about something more relaxing?"
5. Agent calls `get_trending` with emotional filter:
   ```
   ?platform=Netflix&emotionalFilter={"energy":0.3,"valence":0.6}
   ```
6. System filters trending by emotional match

## API Reference Summary

| Endpoint | Method | Purpose | Latency |
|----------|--------|---------|---------|
| `/recommendations` | POST | Get personalized recommendations | < 3s |
| `/search` | POST | Refine with filters | < 2s |
| `/trending` | GET | Get trending content | < 1s |
| `/feedback` | POST | Submit user feedback | < 500ms |
| `/user/{userId}/profile` | GET | Get user profile | < 500ms |
| `/user/{userId}/data` | GET | Export user data (GDPR) | < 5s |
| `/user/{userId}` | DELETE | Delete user (GDPR) | < 2s |
| `/health` | GET | Service health | < 100ms |

## Support & Documentation

- **Full API Docs**: https://docs.content-discovery.tv5monde.com
- **OpenAPI Spec**: https://content-discovery.tv5monde.com/openapi.json
- **Changelog**: https://content-discovery.tv5monde.com/changelog
- **Status Page**: https://status.content-discovery.tv5monde.com
- **Support Email**: api-support@tv5monde.com
- **GitHub**: https://github.com/tv5monde/universal-content-discovery

## Versioning

- Current version: `v1.0` (MVP)
- API version in header: `Accept: application/vnd.content-discovery.v1+json`
- Breaking changes: New major version (v2.0)
- Non-breaking changes: Same version with changelog update

## Rate Limits & Quotas

- **Free Tier**: 100 requests/minute, 10,000 requests/day
- **Pro Tier**: 1,000 requests/minute, 100,000 requests/day
- **Enterprise**: Custom limits

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1638360000
```
