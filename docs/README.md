# Universal Content Discovery Platform - Documentation

This directory contains the complete documentation for the Universal Content Discovery Platform MVP.

## Documentation Structure

### Specifications
- **[ARCHITECTURE.md](specs/ARCHITECTURE.md)** - Complete system architecture with C4 diagrams, component designs, and deployment topology
- **[SPECIFICATION.md](specs/SPECIFICATION.md)** - Detailed requirements, interfaces, and data models

### Architecture Highlights

#### 6-Agent Swarm System
1. **Orchestrator Agent** (Claude Sonnet) - Workflow coordination
2. **Intent Agent** (Claude Haiku) - Emotion extraction
3. **Catalog Agent** (AgentDB) - Vector search
4. **Trend Agent** (TMDB) - Trending data
5. **Match Agent** (Claude Haiku) - Scoring engine
6. **Present Agent** (Claude Sonnet) - Output formatting

#### Technology Stack
- **MCP Protocol**: STDIO and SSE transports for Claude integration
- **AgentDB v2.0**: Vector storage with ReasoningBank and Reflexion Memory
- **Claude API**: Sonnet 4 and Haiku models
- **TMDB API**: Content metadata and trending data
- **SQLite**: Metadata storage
- **TypeScript**: End-to-end type safety

#### Performance Targets
- **< 3 seconds** - End-to-end recommendation latency
- **< 100ms** - Vector search with HNSW indexing
- **< 500ms** - Agent coordination overhead
- **150x faster** - AgentDB vs naive search

## Quick Links

- [Architecture Document](specs/ARCHITECTURE.md)
- [Specification Document](specs/SPECIFICATION.md)
- [Project README](../README.md)

## Development Phases

### MVP (Weeks 1-4)
- MCP Server with dual transports
- 6-agent swarm architecture
- Static matching formula
- AgentDB vector search
- TMDB integration
- Basic provenance

### Phase 2 (Future)
- ReasoningBank pattern learning
- Reflexion Memory
- Causal Recall utility search
- Nightly Learner
- Self-Healing capabilities
- GNN Attention mechanisms

## Contributing

This is an MVP project for the MCP + AgentDB Hackathon. See [ARCHITECTURE.md](specs/ARCHITECTURE.md) for implementation details.
