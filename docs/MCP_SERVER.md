# MCP Server Implementation

## Overview

This document describes the Model Context Protocol (MCP) server implementation for the Universal Content Discovery Platform.

## Architecture

```
src/
├── mcp/
│   ├── server.ts              # Main MCP server entry point
│   ├── handlers/
│   │   ├── get-recommendation.ts  # Recommendation handler
│   │   ├── refine-search.ts       # Refinement handler
│   │   ├── get-trending.ts        # Trending content handler
│   │   └── index.ts               # Handler exports
│   └── transports/
│       └── stdio.ts               # STDIO transport
├── models/                    # Zod schemas and TypeScript types
└── index.ts                   # Application entry point
```

## Available Tools

### 1. get_recommendation

Get personalized content recommendations based on emotional state.

**Input:**
```json
{
  "mood": "unwind" | "engage",
  "goal": "laugh" | "feel" | "thrill" | "think",
  "constraints": {
    "maxRuntime": number,
    "minYear": number,
    "maxYear": number,
    "languages": string[],
    "genres": string[],
    "excludeGenres": string[]
  },
  "context": {
    "social": "alone" | "partner" | "family" | "friends",
    "device": "mobile" | "tablet" | "desktop" | "tv",
    "timeOfDay": "morning" | "afternoon" | "evening" | "night"
  },
  "userId": string,
  "options": {
    "includeAlternatives": boolean,
    "alternativeCount": number,
    "includeProvenance": boolean,
    "includeTrending": boolean,
    "explainReasoning": boolean
  }
}
```

**Output:**
```json
{
  "topPick": {
    "id": string,
    "title": string,
    "year": number,
    "runtime": number,
    "language": string,
    "genres": string[],
    "overview": string,
    "matchScore": number,
    "utilityScore": number,
    "vectorSimilarity": number,
    "scoreBreakdown": {
      "moodMatch": number,
      "intentMatch": number,
      "styleMatch": number,
      "contextMatch": number,
      "trendingBoost": number
    },
    "provenance": {
      "evidenceTrajectories": number,
      "confidenceInterval": [number, number],
      "similarUsersCompleted": string,
      "reasoning": string
    },
    "deeplink": string,
    "availability": {
      "regions": string[]
    }
  },
  "alternatives": [...],
  "reasoning": {
    "summary": string,
    "why": string,
    "confidenceLevel": "high" | "medium" | "low"
  },
  "metadata": {
    "requestId": string,
    "timestamp": string,
    "latency": number,
    "agentsInvolved": string[],
    "skillsApplied": string[],
    "candidatesEvaluated": number
  }
}
```

### 2. refine_search

Refine a previous recommendation based on feedback.

**Input:**
```json
{
  "previousRequestId": string,
  "feedback": {
    "reason": "too_long" | "wrong_mood" | "seen_it" | "not_interested" | "prefer_different",
    "detail": string
  },
  "additionalConstraints": {...}
}
```

**Output:** Same as `get_recommendation` with additional fields:
```json
{
  "metadata": {
    "refinementCount": number,
    "learnedFrom": string,
    ...
  }
}
```

### 3. get_trending

Get currently trending content across platforms.

**Input:**
```json
{
  "platform": "all" | "netflix" | "prime" | "disney" | "tv5monde",
  "region": string,
  "limit": number
}
```

**Output:**
```json
{
  "items": [
    {
      "id": string,
      "title": string,
      "platform": string,
      "rank": number,
      "genres": string[],
      "year": number,
      "language": string,
      "trendingScore": number,
      "deeplink": string
    }
  ],
  "metadata": {
    "platform": string,
    "region": string,
    "timestamp": string,
    "count": number
  }
}
```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### MCP STDIO Mode (for Claude Desktop)

```bash
npm run mcp:stdio
```

## Integration with Claude Desktop

Add to your Claude Desktop configuration:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "universal-content-discovery": {
      "command": "node",
      "args": ["/path/to/agentic-pancakes/dist/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your-api-key",
        "TMDB_API_KEY": "your-tmdb-key"
      }
    }
  }
}
```

Or using npm:

```json
{
  "mcpServers": {
    "universal-content-discovery": {
      "command": "npm",
      "args": ["run", "mcp:stdio"],
      "cwd": "/path/to/agentic-pancakes",
      "env": {
        "ANTHROPIC_API_KEY": "your-api-key",
        "TMDB_API_KEY": "your-tmdb-key"
      }
    }
  }
}
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Unit Tests

```bash
npm run test:unit
```

### Run Integration Tests

```bash
npm run test:integration
```

### Run with Coverage

```bash
npm run test:coverage
```

## Error Handling

The MCP server implements comprehensive error handling:

1. **Input Validation**: All inputs are validated using Zod schemas
2. **Graceful Degradation**: Failed operations return meaningful error messages
3. **Error Responses**: Errors are returned in MCP-compliant format

Example error response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"error\":\"Validation error\",\"message\":\"Invalid mood\",\"timestamp\":\"2025-12-06T15:30:00.000Z\"}"
    }
  ],
  "isError": true
}
```

## Environment Variables

Create a `.env` file:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...
TMDB_API_KEY=...

# Optional
AGENTDB_PATH=./data/agentdb
LOG_LEVEL=info
NODE_ENV=development
```

## Performance

- **Target Latency**: < 3 seconds for recommendations
- **Concurrent Requests**: Supported via async/await
- **Caching**: Not yet implemented (Phase 2)

## Current Limitations (MVP)

1. **Mock Orchestrator**: The orchestrator agent is currently a mock implementation
2. **Static Data**: Recommendations use hardcoded mock data
3. **No Persistence**: Session data is not persisted between requests
4. **No Learning**: ReasoningBank integration is planned for Phase 2

## Next Steps (Phase 2)

1. Implement actual orchestrator agent
2. Integrate with AgentDB for vector search
3. Add TMDB API integration
4. Implement ReasoningBank for learning
5. Add Reflexion Memory for self-improvement
6. Implement caching layer
7. Add SSE transport for streaming responses

## Development

### Project Structure

```
/home/evafive/agentic-pancakes/
├── src/
│   ├── mcp/                 # MCP server implementation
│   ├── models/              # Data models and schemas
│   ├── agents/              # Agent implementations (future)
│   ├── integrations/        # External API integrations (future)
│   └── index.ts             # Entry point
├── tests/
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # End-to-end tests (future)
├── dist/                    # Build output
└── docs/                    # Documentation
```

### Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Run linter: `npm run lint`
5. Run type checker: `npm run typecheck`

## Support

For issues or questions:
- Check the [Architecture Document](/home/evafive/agentic-pancakes/docs/specs/ARCHITECTURE.md)
- Review the [Specification](/home/evafive/agentic-pancakes/docs/specs/SPECIFICATION.md)
- Open an issue on GitHub

## License

MIT
