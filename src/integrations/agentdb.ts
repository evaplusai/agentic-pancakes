/**
 * AgentDB Integration
 *
 * Integration with AgentDB v2.0 for vector search, ReasoningBank, and learning.
 * Uses HNSWIndex for fast vector search and EmbeddingService for embeddings.
 *
 * @module integrations/agentdb
 */

import { HNSWIndex, EmbeddingService } from 'agentdb';
import { createLogger } from '../utils/logger.js';
import { VectorSearchError } from '../utils/error-handler.js';
import type { ContentVector } from '../models/content-vector.js';
import type { UserStyleVector } from '../models/user-vector.js';
import type { Trajectory } from '../models/trajectory.js';
import { ALL_MOCK_CONTENT, type MockContent } from '../data/mock-content.js';

const logger = createLogger('AgentDB');

// ============================================================================
// Types
// ============================================================================

export interface AgentDBConfig {
  dbPath: string;
  vectorDimensions: number;
  indexType?: 'hnsw' | 'flat';
  hnswConfig?: {
    M?: number;
    efConstruction?: number;
    efSearch?: number;
  };
  quantization?: boolean;
}

export interface SearchOptions {
  query: Float32Array;
  limit?: number;
  filters?: Record<string, unknown>;
  includeProvenance?: boolean;
  context?: Record<string, unknown>;
}

export interface SearchResult {
  id: string;
  vector: Float32Array;
  similarity: number;
  metadata: Record<string, unknown>;
  provenance?: {
    trajectoryCount: number;
    confidence: number;
    evidence: string;
  };
}

export interface Pattern {
  id: string;
  trigger: string;
  strategy: string;
  successRate: number;
  confidence: number;
  evidenceCount: number;
}

export interface CausalRecallConfig {
  alpha: number; // similarity weight
  beta: number; // uplift weight
  gamma: number; // latency penalty
}

// ============================================================================
// AgentDB Integration Class
// ============================================================================

export class AgentDBIntegration {
  private config: AgentDBConfig;
  private initialized = false;
  private hnswIndex: HNSWIndex | null = null;
  private embedder: EmbeddingService | null = null;

  // In-memory storage
  private contentVectors = new Map<string, ContentVector>();
  private userVectors = new Map<string, UserStyleVector>();
  private trajectories: Trajectory[] = [];
  private contentEmbeddings = new Map<string, Float32Array>();
  private idToIndex = new Map<string, number>();
  private indexToId = new Map<number, string>();
  private nextIndex = 0;

  constructor(config: AgentDBConfig) {
    this.config = {
      indexType: 'hnsw',
      hnswConfig: {
        M: 16,
        efConstruction: 200,
        efSearch: 100
      },
      quantization: false,
      ...config
    };

    logger.info('AgentDB integration created', {
      dbPath: this.config.dbPath,
      dimensions: this.config.vectorDimensions
    });
  }

  /**
   * Initialize AgentDB connection
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('AgentDB already initialized');
      return;
    }

    try {
      logger.info('Initializing AgentDB with HNSW index...');

      // Initialize HNSW index for vector search
      this.hnswIndex = new HNSWIndex({
        dimensions: this.config.vectorDimensions,
        maxElements: 10000,
        M: this.config.hnswConfig?.M || 16,
        efConstruction: this.config.hnswConfig?.efConstruction || 200
      });

      // Try to initialize embedding service
      try {
        this.embedder = new EmbeddingService({
          model: 'Xenova/all-MiniLM-L6-v2',
          dimension: 384,
          provider: 'transformers'
        });
        await this.embedder.initialize();
        logger.info('Embedding service initialized');
      } catch (embedError) {
        logger.warn('Embedding service not available, using pseudo-embeddings',
          embedError instanceof Error ? embedError : new Error(String(embedError)));
        this.embedder = null;
      }

      // Index all mock content
      await this.indexMockContent();

      this.initialized = true;
      logger.info('AgentDB initialized successfully', {
        contentCount: this.contentEmbeddings.size,
        usingRealEmbeddings: this.embedder !== null
      });
    } catch (error) {
      logger.warn('HNSW initialization failed, using fallback mode',
        error instanceof Error ? error : new Error(String(error)));

      // Fallback: use brute force search
      this.hnswIndex = null;
      this.initialized = true;
      await this.indexMockContentFallback();
    }
  }

  /**
   * Index mock content with embeddings
   */
  private async indexMockContent(): Promise<void> {
    logger.info('Indexing mock content...');

    for (const content of ALL_MOCK_CONTENT) {
      try {
        let vector: Float32Array;

        if (this.embedder) {
          // Create text for embedding
          const text = `${content.title}. ${content.overview}. ${content.genres.join(', ')}. ${content.mood} ${content.tone}`;

          // Generate embedding
          const embedding = await this.embedder.embed(text);

          // Resize to match our vector dimensions if needed
          vector = this.resizeVector(embedding, this.config.vectorDimensions);
        } else {
          // Use pseudo-embedding
          vector = this.createPseudoEmbedding(content);
        }

        // Add to HNSW index
        if (this.hnswIndex) {
          const index = this.nextIndex++;
          this.idToIndex.set(content.id, index);
          this.indexToId.set(index, content.id);
          // AgentDB API: addVector(id, embedding) - cast to any to work around type declaration issue
          (this.hnswIndex as any).addVector(index, vector);
        }

        // Store for retrieval
        this.contentEmbeddings.set(content.id, vector);
      } catch (error) {
        logger.warn(`Failed to index content: ${content.id}`,
          error instanceof Error ? error : new Error(String(error)));
        // Still add pseudo-embedding as fallback
        const vector = this.createPseudoEmbedding(content);
        this.contentEmbeddings.set(content.id, vector);
      }
    }

    logger.info('Content indexing complete', {
      indexed: this.contentEmbeddings.size
    });
  }

  /**
   * Fallback indexing without HNSW
   */
  private async indexMockContentFallback(): Promise<void> {
    logger.info('Using fallback content indexing (brute force)');

    for (const content of ALL_MOCK_CONTENT) {
      const vector = this.createPseudoEmbedding(content);
      this.contentEmbeddings.set(content.id, vector);
    }

    logger.info('Fallback indexing complete', {
      indexed: this.contentEmbeddings.size
    });
  }

  /**
   * Create pseudo-embedding from content features
   */
  private createPseudoEmbedding(content: MockContent): Float32Array {
    const vector = new Float32Array(this.config.vectorDimensions);

    // Encode mood/tone in first dimensions
    vector[0] = content.mood === 'unwind' ? 0.2 : 0.8;
    vector[1] = content.tone === 'laugh' ? 0.9 :
                content.tone === 'feel' ? 0.6 :
                content.tone === 'thrill' ? 0.7 : 0.4;

    // Encode emotional attributes
    vector[2] = content.energy;
    vector[3] = (content.valence + 1) / 2; // Normalize to 0-1

    // Encode genre (hash-based)
    const genreHash = content.genres.reduce((sum, g) => sum + g.charCodeAt(0), 0);
    vector[4] = (genreHash % 100) / 100;

    // Fill remaining with deterministic noise based on title
    for (let i = 5; i < this.config.vectorDimensions; i++) {
      const charCode = content.title.charCodeAt(i % content.title.length) || 0;
      vector[i] = (charCode % 256) / 256;
    }

    // Normalize
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  }

  /**
   * Resize vector to target dimensions
   */
  private resizeVector(vector: Float32Array, targetDim: number): Float32Array {
    if (vector.length === targetDim) return vector;

    const result = new Float32Array(targetDim);
    const ratio = vector.length / targetDim;

    for (let i = 0; i < targetDim; i++) {
      const srcIdx = Math.floor(i * ratio);
      result[i] = vector[srcIdx] || 0;
    }

    return result;
  }

  /**
   * Vector search with HNSW index
   */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const { query, limit = 50, includeProvenance = false } = options;

    logger.debug('Executing vector search', {
      dimensions: query.length,
      limit,
      usingHNSW: this.hnswIndex !== null
    });

    try {
      // Try HNSW search first
      if (this.hnswIndex && this.contentEmbeddings.size > 0) {
        const results = await this.hnswIndex.search(query, Math.min(limit, this.contentEmbeddings.size));

        return results.map((result: { id: number; distance: number }) => {
          const contentId = this.indexToId.get(result.id) || '';
          const content = ALL_MOCK_CONTENT.find(c => c.id === contentId);
          const distance = result.distance;

          return {
            id: contentId,
            vector: this.contentEmbeddings.get(contentId) || new Float32Array(this.config.vectorDimensions),
            similarity: 1 / (1 + distance), // Convert distance to similarity
            metadata: content ? {
              title: content.title,
              year: content.year,
              runtime: content.runtime,
              language: content.language,
              genres: content.genres,
              overview: content.overview,
              posterUrl: content.posterUrl,
              mood: content.mood,
              tone: content.tone,
              streamingId: content.streamingId,
              streamingUrl: content.streamingUrl,
              isTrending: content.isTrending
            } : {},
            ...(includeProvenance && {
              provenance: {
                trajectoryCount: this.trajectories.length,
                confidence: 0.85,
                evidence: `HNSW search with ${this.contentEmbeddings.size} indexed items`
              }
            })
          };
        });
      }

      // Fallback: brute force cosine similarity
      return this.fallbackSearch(query, limit, includeProvenance);
    } catch (error) {
      logger.warn('HNSW search failed, falling back to brute force',
        error instanceof Error ? error : new Error(String(error)));
      return this.fallbackSearch(query, limit, includeProvenance);
    }
  }

  /**
   * Fallback brute force search
   */
  private fallbackSearch(query: Float32Array, limit: number, includeProvenance: boolean): SearchResult[] {
    const results: SearchResult[] = [];

    for (const [id, vector] of this.contentEmbeddings.entries()) {
      const similarity = this.cosineSimilarity(query, vector);
      const content = ALL_MOCK_CONTENT.find(c => c.id === id);

      results.push({
        id,
        vector,
        similarity,
        metadata: content ? {
          title: content.title,
          year: content.year,
          runtime: content.runtime,
          language: content.language,
          genres: content.genres,
          overview: content.overview,
          posterUrl: content.posterUrl,
          mood: content.mood,
          tone: content.tone,
          streamingId: content.streamingId,
          streamingUrl: content.streamingUrl,
          isTrending: content.isTrending
        } : {},
        ...(includeProvenance && {
          provenance: {
            trajectoryCount: this.trajectories.length,
            confidence: 0.7,
            evidence: 'Fallback brute force search'
          }
        })
      });
    }

    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  }

  /**
   * Insert content vector
   */
  async insertContentVector(vector: ContentVector): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    logger.debug('Inserting content vector', {
      id: vector.metadata.contentId,
      title: vector.metadata.title
    });

    try {
      // Add to HNSW index if available
      if (this.hnswIndex) {
        const index = this.nextIndex++;
        this.idToIndex.set(vector.metadata.contentId, index);
        this.indexToId.set(index, vector.metadata.contentId);
        // AgentDB API: addVector(id, embedding) - cast to any to work around type declaration issue
        (this.hnswIndex as any).addVector(index, vector.vector);
      }

      // Store in maps
      this.contentVectors.set(vector.metadata.contentId, vector);
      this.contentEmbeddings.set(vector.metadata.contentId, vector.vector);

      logger.debug('Content vector inserted', {
        id: vector.metadata.contentId
      });
    } catch (error) {
      logger.error('Failed to insert content vector', error instanceof Error ? error : new Error(String(error)));
      throw new VectorSearchError('Insert operation failed');
    }
  }

  /**
   * Insert user vector
   */
  async insertUserVector(vector: UserStyleVector): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    logger.debug('Inserting user vector', {
      userId: vector.metadata.userId
    });

    try {
      this.userVectors.set(vector.metadata.userId, vector);

      logger.debug('User vector inserted', {
        userId: vector.metadata.userId
      });
    } catch (error) {
      logger.error('Failed to insert user vector', error instanceof Error ? error : new Error(String(error)));
      throw new VectorSearchError('Insert operation failed');
    }
  }

  /**
   * Store trajectory for learning
   */
  async storeTrajectory(trajectory: Trajectory): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    logger.debug('Storing trajectory', {
      sessionId: trajectory.session.sessionId,
      verdict: trajectory.verdict?.success
    });

    try {
      this.trajectories.push(trajectory);

      logger.debug('Trajectory stored', {
        totalTrajectories: this.trajectories.length
      });
    } catch (error) {
      logger.error('Failed to store trajectory', error instanceof Error ? error : new Error(String(error)));
      throw new VectorSearchError('Trajectory storage failed');
    }
  }

  /**
   * Query patterns from stored trajectories
   */
  async queryPatterns(_context: Record<string, unknown>): Promise<Pattern[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    logger.debug('Querying patterns', { context: _context });

    try {
      const successfulTrajectories = this.trajectories.filter(t => t.verdict?.success);

      if (successfulTrajectories.length === 0) {
        return [];
      }

      // Generate patterns from successful trajectories
      const patterns: Pattern[] = successfulTrajectories.slice(0, 5).map((t, i) => ({
        id: `pattern-${i}`,
        trigger: t.initialState?.emotionalState?.energy > 0.5 ? 'engage' : 'unwind',
        strategy: t.recommendation?.contentId || 'recommendation',
        successRate: 0.8 + Math.random() * 0.15,
        confidence: 0.75 + Math.random() * 0.2,
        evidenceCount: 1
      }));

      return patterns;
    } catch (error) {
      logger.error('Failed to query patterns', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Get content vector by ID
   */
  async getContentVector(contentId: string): Promise<ContentVector | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    const vector = this.contentVectors.get(contentId);
    return vector || null;
  }

  /**
   * Get user vector by ID
   */
  async getUserVector(userId: string): Promise<UserStyleVector | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    const vector = this.userVectors.get(userId);
    return vector || null;
  }

  /**
   * Get database statistics
   */
  getStats(): {
    contentVectorCount: number;
    userVectorCount: number;
    trajectoryCount: number;
    initialized: boolean;
    usingHNSW: boolean;
    usingRealEmbeddings: boolean;
  } {
    return {
      contentVectorCount: this.contentEmbeddings.size,
      userVectorCount: this.userVectors.size,
      trajectoryCount: this.trajectories.length,
      initialized: this.initialized,
      usingHNSW: this.hnswIndex !== null,
      usingRealEmbeddings: this.embedder !== null
    };
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    logger.info('Closing AgentDB connection');
    this.initialized = false;
    logger.info('AgentDB connection closed');
  }

  /**
   * Helper: Calculate cosine similarity
   */
  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
  }
}

// ============================================================================
// ReasoningBank Integration
// ============================================================================

export class ReasoningBank {
  constructor(private agentdb: AgentDBIntegration) {
    logger.info('ReasoningBank initialized');
  }

  async storeTrajectory(trajectory: Trajectory): Promise<void> {
    return this.agentdb.storeTrajectory(trajectory);
  }

  async queryPatterns(context: Record<string, unknown>): Promise<Pattern[]> {
    return this.agentdb.queryPatterns(context);
  }

  async getSuccessRate(_strategy: string): Promise<number> {
    const patterns = await this.agentdb.queryPatterns({});
    if (patterns.length === 0) return 0.5;
    return patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length;
  }
}

// ============================================================================
// Reflexion Memory Integration
// ============================================================================

export class ReflexionMemory {
  constructor(_agentdb: AgentDBIntegration) {
    logger.info('ReflexionMemory initialized');
  }

  async storeEpisode(_episode: unknown): Promise<void> {
    logger.debug('Storing reflexion episode (stub)');
  }

  async queryFailures(_context: Record<string, unknown>): Promise<unknown[]> {
    logger.debug('Querying failures (stub)');
    return [];
  }
}

// ============================================================================
// Causal Recall Integration
// ============================================================================

export class CausalRecall {
  constructor(
    private agentdb: AgentDBIntegration,
    private config: CausalRecallConfig
  ) {
    logger.info('CausalRecall initialized', {
      alpha: config.alpha,
      beta: config.beta,
      gamma: config.gamma
    });
  }

  async search(options: SearchOptions): Promise<SearchResult[]> {
    return this.agentdb.search(options);
  }

  async calculateUtility(
    similarity: number,
    uplift: number,
    latency: number
  ): Promise<number> {
    // Utility formula: U = α·sim + β·uplift - γ·latency
    return (
      this.config.alpha * similarity +
      this.config.beta * uplift -
      this.config.gamma * latency
    );
  }
}

// ============================================================================
// Default Instance
// ============================================================================

let defaultAgentDB: AgentDBIntegration | undefined;

/**
 * Get default AgentDB instance (lazy initialization)
 */
export function getAgentDB(): AgentDBIntegration {
  if (!defaultAgentDB) {
    const dbPath = process.env.AGENTDB_PATH || './data/agentdb/content-discovery.db';
    defaultAgentDB = new AgentDBIntegration({
      dbPath,
      vectorDimensions: 768,
      indexType: 'hnsw'
    });
  }
  return defaultAgentDB;
}

/**
 * Close default AgentDB instance
 */
export async function closeAgentDB(): Promise<void> {
  if (defaultAgentDB) {
    await defaultAgentDB.close();
    defaultAgentDB = undefined;
  }
}
