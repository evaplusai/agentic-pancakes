# TV5 Hackathon Research Index

**Generated**: 2025-12-06
**Swarm ID**: swarm_1765036019529_vtvku0ki3
**Total Research**: 13,309 lines across 10 documents

## Research Documents

| # | Document | Lines | Focus Area |
|---|----------|-------|------------|
| 1 | [Hackathon Requirements](./01_hackathon_requirements.md) | 948 | Tracks, tools, submission criteria |
| 2 | [Content Discovery Architecture](./02_content_discovery_architecture.md) | 1,041 | 60-second recommendation system |
| 3 | [RuVector Integration](./03_ruvector_integration.md) | 1,372 | Vector search, 768D embeddings |
| 4 | [Agentic Swarm Patterns](./04_agentic_swarm_patterns.md) | 1,449 | 6-agent architecture, claude-flow |
| 5 | [API Data Sources](./05_api_data_sources.md) | 1,996 | Watchmode, TMDB, FlixPatrol, Trakt |
| 6 | [ARW Specification](./06_arw_specification.md) | 1,436 | Agent-Ready Web compliance |
| 7 | [User Personas - Static](./07_user_personas_static.md) | 1,273 | Demographics, taste DNA, history |
| 8 | [User Personas - Dynamic](./08_user_personas_dynamic.md) | 1,380 | Mood, context, intent states |
| 9 | [User Style Vector Schema](./09_user_style_vector_schema.md) | 1,500 | 64-dimension vector design |
| 10 | [User Persona Archetypes](./10_user_persona_archetypes.md) | 914 | 6 detailed persona profiles |

## Key Insights Summary

### Problem Statement
> "Millions spend up to 45 minutes deciding what to watch - billions of hours lost every day"

### Solution: "What to Watch in 60 Seconds"
- **2 binary choices** → Agent analyzes 1000s of options → Perfect match
- **Paradigm shift**: Ask "How do you feel?" not "What genre?"
- **Emotion → Decision flow**: Capture mood, infer preference

### Technical Architecture

```
User Input (voice/text)
    ↓
Intent Agent (mood extraction)
    ↓
┌───────────────────────────────┐
│     PARALLEL EXECUTION        │
├───────────────────────────────┤
│ Catalog Agent → RuVector      │
│ Trend Agent → FlixPatrol/TMDB │
│ Match Agent → Score & Rank    │
└───────────────────────────────┘
    ↓
Present Agent (response + deeplink)
    ↓
"Le Sens de la Fête - 94% match" [▶ Watch]
```

### Critical Implementation Points

1. **MCP Server** - Required for hackathon, currently missing
2. **RuVector** - 768D hybrid embeddings (plot + genre + mood + meta)
3. **6-Agent Swarm** - Orchestrator, Intent, Catalog, Trend, Match, Present
4. **ARW Compliance** - Manifest, machine views, AI headers
5. **API Stack** - TMDB (free) + Trakt (free) + Watchmode for MVP

### Winning Strategy

| Priority | Task | Hours |
|----------|------|-------|
| HIGH | MCP server implementation | 8-12 |
| HIGH | Claude-flow integration | 12-16 |
| MEDIUM | Documentation & machine views | 8-10 |
| MEDIUM | Innovation features | 16-20 |
| LOW | Testing & polish | 8-12 |

### Cost Optimization

- **Without optimization**: $18/1K requests
- **With optimization**: $2.70/1K requests (85% savings)
- **MVP API cost**: $0-1/month (TMDB + Trakt free tiers)

## User Personas Summary

### 6 TV5MONDE User Archetypes

| Persona | Profile | Key Traits |
|---------|---------|------------|
| **Marie Dubois** | French Cinema Enthusiast | Native speaker, auteur cinema, high complexity |
| **James Mitchell** | French Learner | B1-B2 level, subtitle-dependent, language goals |
| **Sophie Renard** | Expat Nostalgia Seeker | Comfort viewing, cultural connection |
| **Alexandre Fontaine** | Busy Professional | Time-constrained, mood-based, efficiency |
| **Yuki Tanaka** | Francophile Explorer | Cultural explorer, pan-Francophone |
| **Pierre Lefebvre** | Family Viewer | Multi-generational, weekend binger |

### User Style Vector (64 Dimensions)

```
┌─────────────────────────────────────────────────────────┐
│  STATIC (learned)          │  DYNAMIC (per-session)    │
├─────────────────────────────────────────────────────────┤
│  Genre Affinities [0-14]   │  Energy Level [57]        │
│  Mood Preferences [15-24]  │  Emotional Goal [58]      │
│  Pacing & Structure [25-32]│  Stress Level [59]        │
│  Content Chars [33-40]     │  Social Context [60]      │
│  French Specific [41-48]   │  Available Time [61]      │
│  Context Patterns [49-56]  │  Comfort Need [62-63]     │
└─────────────────────────────────────────────────────────┘
```

### Recommendation Formula

```javascript
finalScore = (
  baseMatch × 0.25 +      // Static taste DNA
  moodScore × 0.30 +      // Current mood (HIGHEST)
  intentScore × 0.20 +    // Viewing purpose
  contextScore × 0.15 +   // Situation
  trendingScore × 0.10    // What's hot
) × constraintScore       // Hard filters (time, social)
```

## Next Steps

1. Read full research documents for implementation details
2. Implement MCP server (critical gap)
3. Build 6-agent swarm with claude-flow
4. Integrate RuVector for content matching
5. Create ARW-compliant endpoints
6. **Implement user persona system with 64D vectors**
7. **Build mood detection from voice/text input**

## Source Materials

- Initial research: `/docs/initial/00_content_discovery_research.md`
- Hackathon repo: https://github.com/agenticsorg/hackathon-tv5
- Discord: discord.agentics.org (join for deadlines!)
