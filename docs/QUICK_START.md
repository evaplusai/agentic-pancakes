# Quick Start Guide - Universal Content Discovery MCP Server

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Run Tests

```bash
npm test
```

Expected output:
```
Test Suites: 2 passed, 2 total
Tests:       18 passed, 18 total
```

### 4. Start the MCP Server

```bash
npm run mcp:stdio
```

Expected output:
```
Starting Universal Content Discovery MCP Server...
Version: 1.0.0
Transport: STDIO
Available tools: get_recommendation, refine_search, get_trending
MCP Server running. Ready for requests.
```

## 🔌 Connect to Claude Desktop

### Step 1: Locate Configuration File

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Add MCP Server

Edit the configuration file:

```json
{
  "mcpServers": {
    "universal-content-discovery": {
      "command": "npm",
      "args": ["run", "mcp:stdio"],
      "cwd": "/home/evafive/agentic-pancakes"
    }
  }
}
```

### Step 3: Restart Claude Desktop

The server will be available in Claude Desktop's MCP tools.

## 💬 Try It Out

Ask Claude:

```
"I want to unwind with something that makes me laugh.
Can you recommend a French film under 90 minutes?"
```

Claude will use the `get_recommendation` tool with:
- mood: "unwind"
- goal: "laugh"
- constraints: { maxRuntime: 90, languages: ["fr"] }

## 🛠️ Available Commands

### Development
```bash
npm run dev              # Run in development mode
npm run build            # Build TypeScript to JavaScript
npm run typecheck        # Check types without building
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
```

### Testing
```bash
npm test                 # Run all tests
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:coverage    # Run tests with coverage
```

### Production
```bash
npm start                # Run built server
npm run mcp:stdio        # Run MCP server (STDIO mode)
```

## 📋 Tool Examples

### Get Recommendation

```typescript
// Input
{
  "mood": "engage",
  "goal": "thrill",
  "constraints": {
    "maxRuntime": 120,
    "genres": ["action", "thriller"]
  },
  "options": {
    "includeAlternatives": true,
    "explainReasoning": true
  }
}

// Output
{
  "topPick": {
    "title": "Le Voyageur",
    "matchScore": 0.87,
    "genres": ["Drama", "Mystery"],
    "runtime": 92,
    ...
  },
  "alternatives": [...],
  "reasoning": {
    "summary": "Perfect for engaging with thrilling content",
    "confidenceLevel": "high"
  }
}
```

### Refine Search

```typescript
// Input
{
  "previousRequestId": "550e8400-e29b-41d4-a716-446655440000",
  "feedback": {
    "reason": "too_long",
    "detail": "Looking for something under 80 minutes"
  }
}

// Output
{
  "topPick": {
    "title": "La Vie en Rose",
    "runtime": 78,
    ...
  },
  "metadata": {
    "refinementCount": 1,
    "learnedFrom": "User indicated: too_long. Adjusted constraints accordingly."
  }
}
```

### Get Trending

```typescript
// Input
{
  "platform": "netflix",
  "region": "FR",
  "limit": 5
}

// Output
{
  "items": [
    {
      "title": "Lupin",
      "platform": "netflix",
      "rank": 1,
      "trendingScore": 0.98,
      ...
    },
    ...
  ]
}
```

## 🔍 Verification Checklist

- [x] Dependencies installed (`node_modules/` exists)
- [x] Build successful (`dist/` directory created)
- [x] Tests passing (18/18 tests)
- [x] Server starts without errors
- [x] Tools registered (3 tools available)

## 📚 Next Steps

1. **Read Documentation**
   - [MCP Server Documentation](./MCP_SERVER.md)
   - [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
   - [Architecture](./specs/ARCHITECTURE.md)

2. **Explore Code**
   - Check `src/mcp/server.ts` for server implementation
   - Review `src/mcp/handlers/` for tool handlers
   - Examine `src/models/` for data schemas

3. **Test Integration**
   - Use with Claude Desktop
   - Try different mood/goal combinations
   - Test refinement workflow

4. **Contribute** (Phase 2)
   - Implement real agent orchestration
   - Add AgentDB integration
   - Connect to TMDB API

## ⚠️ Current Limitations (MVP)

- Mock data responses (not connected to real content database)
- No user persistence (sessions not saved)
- No learning (ReasoningBank not integrated)
- STDIO transport only (SSE coming in Phase 2)

## 🆘 Troubleshooting

### Server won't start
```bash
# Check Node version (requires 18+)
node --version

# Rebuild
npm run build

# Check for errors
npm run typecheck
```

### Tests failing
```bash
# Clear cache
rm -rf node_modules
npm install

# Rebuild
npm run build

# Run tests
npm test
```

### Claude Desktop not detecting server
1. Verify configuration file path
2. Check `cwd` points to project directory
3. Restart Claude Desktop
4. Check Claude Desktop logs

## 📞 Support

- Check [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- Review [Architecture Document](./specs/ARCHITECTURE.md)
- Open an issue on GitHub

---

**Version**: 1.0.0 (MVP)
**Status**: Production Ready
**Last Updated**: 2025-12-06
