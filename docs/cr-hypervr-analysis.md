# CR-HyperVR Repository Analysis

**Repository**: https://github.com/yp-ai-lab/CR-HyperVR
**Analysis Date**: 2025-12-07
**Project Type**: Cloud-based Movie Recommendation System

---

## Executive Summary

CR-HyperVR (Cloud Run Hypergraph-Vector Recommender) is a production-grade recommendation system deployed on Google Cloud Platform that combines **vector embeddings** with **hypergraph analysis** for movie recommendations. The system achieves cost-efficient, CPU-only inference using INT8-quantized ONNX models while maintaining high-quality recommendations through multi-signal fusion.

---

## Project Overview

### Name & Description
**CR-HyperVR** - A cloud-native recommendation engine that leverages:
- Vector similarity search via pgvector
- Hypergraph relationships for co-watch patterns
- Genre-based collaborative signals
- User profile embeddings

### Key Differentiators
1. **CPU-only inference** - No GPU required, reducing infrastructure costs
2. **INT8 quantization** - Model compression without significant accuracy loss
3. **Hybrid recommendation** - Combines embeddings, graph topology, and genre signals
4. **Production deployment** - Live APIs on Google Cloud Run with auto-scaling

---

## Tech Stack Analysis

### Core Dependencies

#### Web Framework & Server
- **FastAPI** >=0.109.0 - Modern async web framework
- **Uvicorn** [standard] >=0.27.0 - ASGI server
- **Pydantic** >=2.5.0 - Data validation and settings management

#### ML/AI & Embeddings
- **Sentence-Transformers** >=3.0.0 - Embedding model library
- **PyTorch** >=2.1.0 - Deep learning framework
- **ONNX** >=1.14.0 - Cross-platform model format
- **ONNX Runtime** >=1.16.0 - Optimized inference engine
- **Model**: MiniLM-L6-v2 with INT8 quantization (384 dimensions)

#### Vector Database
- **PostgreSQL 15** with **pgvector** >=0.2.0 extension
- **asyncpg** >=0.29.0 - Async PostgreSQL driver
- **HNSW indexing** for efficient similarity search

#### Data Processing
- **Pandas** >=2.0.0 - Data manipulation
- **NumPy** >=1.26.0 - Numerical computing
- **PyArrow** >=14.0.0 - Columnar data format

#### GCP Integration
- **gcsfs** >=2023.6.0 - Google Cloud Storage file system
- **Cloud Run** - Serverless container platform
- **Cloud SQL** - Managed PostgreSQL
- **Cloud Storage** - Model and dataset storage
- **Secret Manager** - Credential management
- **Artifact Registry** - Container image storage

#### Data Sources
- **TMDB** - 930K+ movies with metadata
- **MovieLens 25M** - User rating dataset

### Ruv Package Usage

**IMPORTANT FINDING**: This project does **NOT use any ruv ecosystem packages** (agentdb, ruvector, claude-flow, etc.).

Instead, it implements its own:
- Custom vector storage using standard pgvector
- Custom hypergraph implementation in PostgreSQL
- No agent orchestration or MCP integration
- No claude-flow or AI agent coordination

This is a traditional ML/recommendation system architecture without the ruv agentic framework.

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┴────────────┐
           │                        │
           ▼                        ▼
┌──────────────────┐    ┌──────────────────────┐
│ Embedding Service│    │ Infrastructure Svc   │
│  (Cloud Run)     │    │   (Graph Service)    │
│                  │    │    (Cloud Run)       │
│ - Text embedding │    │ - Hypergraph search  │
│ - Batch encoding │    │ - Multi-signal fusion│
│ - Movie/User     │    │ - Co-watch patterns  │
│   profiling      │    │ - Genre relationships│
└────────┬─────────┘    └──────────┬───────────┘
         │                         │
         └────────────┬────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   PostgreSQL + pgvector│
         │    (Cloud SQL)         │
         │                        │
         │ - Movies metadata      │
         │ - Vector embeddings    │
         │ - Hyperedges (graph)   │
         │ - User ratings/profiles│
         └────────────────────────┘
                      ▲
                      │
         ┌────────────┴────────────┐
         │  Cloud Storage          │
         │                         │
         │ - ONNX models (INT8)    │
         │ - TMDB dataset          │
         │ - MovieLens data        │
         └─────────────────────────┘
```

### Application Structure

```
app/
├── main.py                 # FastAPI application entry point
├── schemas.py              # Pydantic models (API contracts)
├── api/                    # API endpoint definitions
├── core/
│   └── config.py          # Environment configuration
├── db/                     # Database models and queries
└── services/
    ├── embedder.py        # Vector generation (ONNX/ST/hash)
    ├── scoring.py         # Multi-signal score fusion
    └── reranker.py        # Result reranking logic

pipeline/                   # ETL workflows
├── netflix_parser.py      # Netflix data ingestion
├── tmdb_enrich.py         # TMDB metadata enrichment
├── triplets.py            # Training triplet generation
└── user_profiles.py       # User embedding construction

training/                   # Model training pipeline
├── train_finetune.py      # Fine-tune MiniLM on movies
├── onnx_export.py         # Model export to ONNX
└── quantize_int8.py       # INT8 quantization

db/
├── schema.sql             # PostgreSQL schema
└── pgvector.sql           # Vector extension setup
```

### Database Schema

#### Core Tables

**movies**
- Primary metadata storage
- Fields: `movie_id`, `title`, `genres`, `overview`, `release_date`, `tmdb_id`

**movie_embeddings**
- 384-dimensional float32 vectors
- HNSW index for cosine similarity
- Normalized embeddings for efficient distance calculation

**user_embeddings**
- Cached user preference vectors
- Fast collaborative filtering

**user_ratings**
- MovieLens-style interactions
- Rating range: 0.5-5.0
- Temporal data for trend analysis

**hyperedges**
- Flexible many-to-many relationships
- Types: co-watch patterns, genre affinity
- Fields: `src_kind`, `src_id`, `dst_kind`, `dst_id`, `edge_type`, `metadata` (JSON)
- Composite index on `(src_kind, src_id)` for graph traversal

---

## Key Features

### 1. Multi-Modal Embedding Service

#### Text Embedding
- Single text → 384-dim vector
- Batch processing for efficiency
- Supports custom texts or movie metadata

#### Movie Embedding
- Combines: title + genres + description (truncated to 500 chars)
- Generates semantic movie representations

#### User Embedding
- Input: liked genres + disliked genres + liked movies
- Creates user taste profile vector
- Format: `"User likes: [titles]\nDislikes: [titles]"`

### 2. Vector Similarity Search

#### Basic Search
- `/search/similar` - Text query → similar movies
- pgvector cosine similarity
- Top-K retrieval (default: 10)
- Optional graph-based reranking

#### Personalized Recommendations
- `/search/recommend` - User-based recommendations
- Excludes already-watched movies
- Leverages user embedding cache

### 3. Hypergraph-Enhanced Recommendations

#### Multi-Signal Fusion
- **Embedding similarity** - Semantic vector matching
- **Co-watch patterns** - Users who watched X also watched Y
- **Genre relationships** - Movies sharing genre categories

#### Weighted Scoring Formula
```python
final_score = embed_weight * embedding_sim
            + cowatch_weight * cowatch_score
            + genre_weight * genre_score
```

#### Graph Expansion
- `/graph/recommend` - Multi-hop traversal
- `hops=1`: Co-watch neighbors
- `hops=2`: Genre-connected movies
- Configurable signal weights (embed, cowatch, genre)

### 4. CPU-Optimized Inference

#### Three-Tier Embedding Strategy

**Priority 1: ONNX Runtime (Production)**
- INT8 quantized models
- CPU execution providers
- Model file: `model-int8.onnx`
- Loads from GCS if not local

**Priority 2: Sentence Transformers (Fallback)**
- Full-precision models
- Normalized embeddings
- Used even when ONNX present (optimization pending)

**Priority 3: Hash-based (Testing)**
- Deterministic random vectors
- Offline/testing mode
- No model required

#### Model Compression Pipeline
1. **Fine-tune** - MiniLM on movie triplets
2. **Export** - Convert to ONNX format
3. **Quantize** - INT8 compression
4. **Deploy** - Upload to GCS, load in Cloud Run

---

## Architecture Patterns

### Design Strengths

#### 1. Hybrid Recommendation Approach
- Combines content-based (embeddings) with collaborative (co-watch)
- Graph structure captures implicit relationships
- Flexible signal weighting for different use cases

#### 2. Cost-Efficient Inference
- No GPU required (INT8 ONNX on CPU)
- Auto-scaling Cloud Run reduces idle costs
- Model preloading in Docker image eliminates download latency

#### 3. Scalable Data Pipeline
- Cloud Run Jobs for batch processing
- Parquet format for efficient storage
- Separation of training and inference

#### 4. Graceful Degradation
- Multiple embedding backend fallbacks
- Optional graph/reranking features
- Database connection failures don't crash app

#### 5. Modular Service Architecture
- Separate embedding and graph services
- Independent scaling
- Clear API contracts via Pydantic schemas

### Innovative Approaches

#### 1. Hard Negative Mining in Triplets
- **Standard approach**: Random negative sampling
- **Their approach**: Genre-matched negatives
  - For a positive movie, select negatives from SAME genres
  - Makes training more challenging (harder negatives)
  - Improves model discrimination

```python
# Triplet construction logic
genre_matched_negatives = [
    neg for neg in user_negatives
    if any(g in neg.genres for g in positive.genres)
]
negative = random.choice(genre_matched_negatives or user_negatives)
```

#### 2. Multi-Hop Graph Traversal
- Single query expands through multiple relationship types
- First hop: co-watch patterns (behavioral)
- Second hop: genre connections (categorical)
- Combines diverse signals in one request

#### 3. Lazy Model Loading with GCS Fallback
- Models load on-demand (not at startup)
- Checks local filesystem first
- Falls back to GCS download
- Thread-safe initialization
- Reduces container startup time

#### 4. Normalized Signal Fusion
```python
# From scoring.py
def combine_scores(base_scores, genre_weights, weight=0.05):
    """
    Normalizes different signal types to [0,1] before weighted combination
    Ensures stable mixing across heterogeneous data sources
    """
    new_score = base_score + weight * genre_weight
    return sorted(items, key=lambda x: combined_scores[x.id])
```

#### 5. Flexible Hyperedge Schema
- Generic `(src_kind, src_id) → (dst_kind, dst_id)` structure
- Supports multiple relationship types in one table
- JSON metadata field for extensibility
- Enables future graph types without schema changes

---

## Training & Data Pipeline

### Phase 1: Data Preparation

#### Netflix Parsing
- Ingest raw Netflix data
- Normalize formats

#### TMDB Enrichment
- Fetch movie metadata via TMDB API
- Add genres, overviews, release dates
- Join with rating data

#### Triplet Generation
- Positive samples: ratings ≥ 4.0
- Negative samples: ratings ≤ 2.0
- Genre-matched negative mining
- Output: 10K triplets (user, pos_movie, neg_movie)

#### User Profiling
- Aggregate user preferences
- Create user embedding inputs
- Format: liked/disliked genres + movies

### Phase 2: Model Fine-Tuning

#### Base Model
- **all-MiniLM-L6-v2** from Sentence Transformers
- 384-dimensional embeddings
- General-purpose semantic model

#### Training Configuration
- **Loss function**: Multiple Negatives Ranking (default) or Triplet Loss
- **Epochs**: 1 (configurable)
- **Batch size**: 64
- **Input format**:
  - Anchor: "User likes: [...]\nDislikes: [...]"
  - Positive: "Title: X\nGenres: Y\nOverview: Z"
  - Negative: (implicit in-batch or explicit)

#### Training Approach
```python
# Multiple Negatives Ranking (default)
# Uses anchor-positive pairs with in-batch negatives
train_dataloader = DataLoader(triplets, shuffle=True, batch_size=64)
model.fit(
    train_objectives=[(train_dataloader, train_loss)],
    epochs=EPOCHS,
    show_progress_bar=True
)
```

### Phase 3: Model Export & Quantization

#### ONNX Export
- Convert PyTorch model → ONNX format
- Maintains cross-platform compatibility
- Single model file

#### INT8 Quantization
- Compress model to 8-bit integers
- ~4x size reduction
- Minimal accuracy loss
- Faster CPU inference

#### Deployment
- Upload to Google Cloud Storage
- Container pulls at runtime or uses prebaked image

---

## API Endpoints

### Embedding Services

#### POST `/embed/text`
```json
Request: {"text": "sci-fi action adventure"}
Response: {
  "embedding": [0.123, -0.456, ...],  # 384 dims
  "model": "movie-minilm-v1",
  "dimensions": 384
}
```

#### POST `/embed/batch`
```json
Request: {"texts": ["text1", "text2", ...]}
Response: {"embeddings": [[...], [...]], ...}
```

#### POST `/embed/movie`
```json
Request: {
  "title": "Inception",
  "genres": ["Sci-Fi", "Thriller"],
  "description": "A thief who steals secrets..."
}
Response: {"embedding": [...], ...}
```

#### POST `/embed/user`
```json
Request: {
  "liked_genres": ["Action", "Sci-Fi"],
  "disliked_genres": ["Horror"],
  "liked_movies": ["Inception", "The Matrix"]
}
Response: {"embedding": [...], ...}
```

### Search & Recommendation

#### POST `/search/similar`
```json
Request: {
  "text": "time travel paradox",
  "top_k": 10
}
Response: {
  "items": [
    {
      "movie_id": "123",
      "title": "Primer",
      "genres": ["Sci-Fi", "Thriller"],
      "similarity": 0.892
    },
    ...
  ]
}
```

#### POST `/search/recommend`
```json
Request: {
  "user_id": "42",
  "top_k": 10,
  "exclude_movie_ids": ["123", "456"]
}
Response: {"items": [...]}
```

### Hypergraph Recommendations

#### POST `/graph/recommend`
```json
Request: {
  "text": "dystopian future",
  "seed_top_k": 20,         # Initial vector search candidates
  "hops": 2,                # Graph expansion depth
  "embed_weight": 0.5,      # Embedding signal weight
  "cowatch_weight": 0.3,    # Co-watch signal weight
  "genre_weight": 0.2,      # Genre signal weight
  "top_k": 10
}
Response: {
  "items": [
    {
      "movie_id": "789",
      "title": "Blade Runner 2049",
      "genres": ["Sci-Fi", "Drama"],
      "similarity": 0.847,
      "sources": ["embed", "cowatch", "genre"]  # Which signals contributed
    },
    ...
  ]
}
```

### Operational Endpoints

- **GET** `/healthz` - Service health check
- **GET** `/ready` - Readiness probe
- **GET** `/metrics` - Prometheus metrics
- **GET** `/debug/db_counts` - Database statistics
- **GET** `/debug/sample_movie` - Sample data check

---

## Deployment Infrastructure

### GCP Services

#### Cloud Run
- **Embedding Service**: Auto-scaling FastAPI container
- **Graph Service**: POST-only hypergraph API
- **Cloud Run Jobs**: Batch data processing pipelines

#### Cloud SQL
- PostgreSQL 15 with pgvector extension
- Private VPC connectivity
- Automated backups

#### Cloud Storage
- Model artifacts (ONNX files)
- Training datasets (Parquet)
- Processed data outputs

#### Artifact Registry
- Container image storage
- Regional deployment
- Version tagging

#### Secret Manager
- Database credentials
- API keys (TMDB)
- Service account keys

### CI/CD Pipeline

#### Cloud Build Configuration
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', '${_IMAGE}', '.']
images:
  - '${_REGION}-docker.pkg.dev/$PROJECT_ID/embedding-service/api:latest'
```

#### Makefile Targets

**Infrastructure**
- `gcp-provision` - Setup Artifact Registry, buckets, Cloud SQL, service accounts
- `gcp-secrets` - Configure Secret Manager
- `gcp-verify` - Validate infrastructure

**Build & Deploy**
- `gcp-build` - Submit Cloud Build
- `gcp-deploy` - Deploy embedding service
- `gcp-deploy-infra` - Deploy graph service

**Data Pipeline**
- `gcp-jobs-deploy` - Setup Cloud Run Jobs
- `gcp-job-run-phase2` - Run data processing (join → profiles → hyperedges)
- `gcp-job-run-phase3` - Run model training (fine-tune → ONNX → INT8)

**Database**
- `db-apply-cloudsql` - Apply schema and extensions

**Documentation**
- `export-openapi` - Generate API docs

---

## Performance & Optimization

### Inference Optimization
- **CPU-only**: No GPU required, reducing costs
- **INT8 quantization**: ~4x model size reduction
- **HNSW indexing**: O(log n) similarity search
- **Lazy loading**: Models load on-demand
- **Batch processing**: Efficient multi-text encoding

### Data Pipeline Efficiency
- **Parquet format**: Columnar storage for fast reads
- **Cloud Run Jobs**: Serverless batch processing
- **GCS integration**: Direct cloud storage access
- **Async PostgreSQL**: Non-blocking database queries

### Scalability
- **Auto-scaling Cloud Run**: Scales to zero, handles spikes
- **Regional deployment**: Low-latency artifact access
- **Connection pooling**: Efficient database connections
- **Stateless services**: Horizontal scaling

---

## Comparison to Ruv Ecosystem

### What CR-HyperVR Does NOT Use

**No Ruv Packages:**
- ❌ agentdb - Custom PostgreSQL + pgvector instead
- ❌ ruvector - Standard pgvector + asyncpg
- ❌ claude-flow - No agent orchestration
- ❌ flow-nexus - No MCP integration
- ❌ ruv-swarm - No multi-agent coordination

**No Agent Architecture:**
- No LLM-based agents
- No task orchestration
- No collaborative decision-making
- No SPARC methodology

### Architecture Philosophy Differences

| Aspect | CR-HyperVR | Agentic-Pancakes (Our Project) |
|--------|------------|-------------------------------|
| **Core Approach** | Traditional ML pipeline | Agentic orchestration |
| **Vector DB** | Standard pgvector | Could use agentdb |
| **Recommendation** | Embedding + graph fusion | Could use AI agents |
| **Coordination** | Monolithic services | Multi-agent swarm |
| **Personalization** | Static user profiles | Dynamic agent learning |
| **Scalability** | Service auto-scaling | Agent spawning |

---

## Lessons & Innovations for Our Project

### Applicable Patterns

#### 1. Hard Negative Mining
**Adoption**: Implement genre-matched negative sampling in our movie recommendation
```python
# In our triplet generation
def sample_negatives_with_context(positive_movie, user_negatives):
    # Match on genres like CR-HyperVR
    genre_matched = [n for n in user_negatives if shares_genres(positive, n)]
    return random.choice(genre_matched or user_negatives)
```

#### 2. Multi-Signal Fusion
**Adoption**: Combine TMDB features with personalization scores
```python
# Our scoring approach
final_score = (
    personalization_weight * user_preference_score +
    content_weight * tmdb_features_score +
    collaborative_weight * similar_users_score
)
```

#### 3. Lazy Model Loading
**Adoption**: Load recommendation models on-demand
```python
# Our embedder service
def get_embedder():
    if not _embedder:
        _embedder = load_from_cache_or_download()
    return _embedder
```

#### 4. Flexible Hyperedge Schema
**Adoption**: Use generic relationship table for multiple signal types
```sql
-- Our hyperedges table
CREATE TABLE relationships (
    src_type TEXT,
    src_id TEXT,
    dst_type TEXT,
    dst_id TEXT,
    rel_type TEXT,
    metadata JSONB
);
```

### Complementary Innovations We Add

#### 1. Agent-Based Personalization
- **They**: Static user embeddings
- **We**: Dynamic agent that learns user preferences over time
- **Benefit**: Adaptive recommendations based on interaction history

#### 2. Conversational Recommendations
- **They**: API-only (JSON POST)
- **We**: Natural language interface via AI agents
- **Benefit**: "Show me sci-fi like The Matrix but less dark"

#### 3. Multi-Agent Orchestration
- **They**: Single recommendation pipeline
- **We**: Coordinator → Analyzer → Recommender → Explainer agents
- **Benefit**: Parallel processing, specialized expertise

#### 4. Explainability
- **They**: Similarity scores + source signals
- **We**: Agent-generated natural language explanations
- **Benefit**: "I recommended this because you liked X and users similar to you enjoyed Y"

#### 5. Cross-Session Memory
- **They**: Database-persisted user embeddings
- **We**: Agent memory + conversation context
- **Benefit**: "Remember I said I wanted to avoid horror films?"

---

## Strengths of CR-HyperVR

### Technical Excellence
✅ Production-ready deployment on GCP
✅ CPU-optimized inference (cost-efficient)
✅ Multiple recommendation signals (hybrid approach)
✅ Hard negative mining (better training)
✅ Flexible hypergraph schema
✅ Graceful degradation (multiple fallbacks)
✅ Scalable architecture (Cloud Run auto-scaling)

### Engineering Quality
✅ Clean separation of concerns (services, core, db)
✅ Type-safe API contracts (Pydantic schemas)
✅ Comprehensive data pipeline (ETL → training → deployment)
✅ Infrastructure as code (Makefile automation)
✅ Monitoring and debugging endpoints

### Data Science Rigor
✅ Large-scale datasets (TMDB + MovieLens)
✅ Fine-tuned embeddings (domain-specific)
✅ Multi-hop graph reasoning
✅ Configurable signal weights

---

## Potential Improvements (Where Agents Could Help)

### 1. Dynamic Personalization
**Current**: Static user embeddings
**Improvement**: Agent learns from session interactions
**Implementation**: Claude agent that updates preferences in real-time

### 2. Explainability
**Current**: Source signals (embed|cowatch|genre)
**Improvement**: Natural language explanations
**Implementation**: Explainer agent that generates readable rationales

### 3. Cold Start Problem
**Current**: Requires user ratings history
**Improvement**: Conversational onboarding
**Implementation**: Onboarding agent asks preferences, generates initial profile

### 4. Content Discovery
**Current**: Query-based search
**Improvement**: Proactive recommendations
**Implementation**: Discovery agent suggests content based on trends

### 5. Multi-Domain Recommendations
**Current**: Movies only
**Improvement**: Cross-domain (movies → books → music)
**Implementation**: Multi-domain agent coordinator

### 6. A/B Testing
**Current**: Manual weight tuning
**Improvement**: Automated experimentation
**Implementation**: Optimization agent tests signal weights, measures engagement

---

## Integration Opportunities with Our Project

### Data Layer
- **Reuse**: PostgreSQL + pgvector schema design
- **Enhance**: Add agent memory tables
- **Integration**: Connect to existing TMDB data

### Recommendation Engine
- **Reuse**: Multi-signal fusion approach
- **Enhance**: Add agent-based personalization layer
- **Integration**: Use their embeddings as one signal among many

### API Design
- **Reuse**: FastAPI + Pydantic patterns
- **Enhance**: Add conversational endpoints
- **Integration**: Wrap their APIs with agent interface

### Training Pipeline
- **Reuse**: Hard negative mining technique
- **Enhance**: Agent feedback loop for continuous learning
- **Integration**: Use their fine-tuned models as base

---

## Conclusion

CR-HyperVR represents a **solid, production-grade traditional ML recommendation system** with several innovative optimizations:
- CPU-efficient INT8 ONNX inference
- Hard negative mining for better embeddings
- Multi-signal hypergraph fusion
- Scalable GCP deployment

However, it **does NOT use ruv ecosystem tools** and follows a **monolithic service architecture** rather than an agentic approach.

**For our agentic-pancakes project**, we can:
1. **Learn from** their multi-signal fusion and hard negative mining
2. **Complement** their static approach with dynamic agent personalization
3. **Enhance** their API-only interface with conversational AI
4. **Extend** their single-pipeline design with multi-agent orchestration

**Key Takeaway**: CR-HyperVR excels at efficient, scalable recommendation infrastructure. We add intelligence, adaptability, and conversational interaction through agents.

---

## File Locations

**Repository**: `/home/evafive/agentic-pancakes/docs/cr-hypervr-analysis.md`
**Generated**: 2025-12-07
**Analyst**: Research Agent (Researcher Profile)
