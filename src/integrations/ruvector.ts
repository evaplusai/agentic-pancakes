/**
 * RuVector Integration
 *
 * High-performance vector database integration using ruvector package.
 * Provides content embeddings and semantic search capabilities.
 *
 * @module integrations/ruvector
 */

import { VectorDB } from 'ruvector';
import { createLogger } from '../utils/logger.js';
import { ALL_MOCK_CONTENT, type MockContent } from '../data/mock-content.js';

const logger = createLogger('RuVector');

// ============================================================================
// Types
// ============================================================================

export interface ContentEmbedding {
  id: string;
  vector: Float32Array;
  metadata: {
    title: string;
    mood: 'unwind' | 'engage';
    tone: 'laugh' | 'feel' | 'thrill' | 'think';
    genres: string[];
    year?: number;
    overview?: string;
  };
}

export interface SearchResult {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface RuVectorConfig {
  dimensions: number;
  useTrigramEmbedding?: boolean;
}

// ============================================================================
// N-gram Embedding Provider
// ============================================================================

/**
 * Create n-gram based text embedding
 * Uses character trigrams for language-agnostic text representation
 */
export function createTrigramEmbedding(text: string, dimensions = 128): Float32Array {
  const vec = new Float32Array(dimensions);

  // Normalize and tokenize
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const words = normalized.split(/\W+/).filter(w => w.length > 2);

  // Character trigram hashing
  for (const word of words) {
    // Add word-level hash
    const wordHash = hashString(word);
    vec[Math.abs(wordHash) % dimensions] += 0.5;

    // Add character trigrams
    for (let i = 0; i <= word.length - 3; i++) {
      const trigram = word.slice(i, i + 3);
      const hash = hashString(trigram);
      const idx = Math.abs(hash) % dimensions;
      vec[idx] += 1;
    }

    // Add bigrams for short words
    if (word.length >= 2 && word.length <= 4) {
      for (let i = 0; i <= word.length - 2; i++) {
        const bigram = word.slice(i, i + 2);
        const hash = hashString(bigram) * 7;
        const idx = Math.abs(hash) % dimensions;
        vec[idx] += 0.7;
      }
    }
  }

  // L2 normalize
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  for (let i = 0; i < dimensions; i++) {
    vec[i] /= norm;
  }

  return vec;
}

/**
 * Simple string hash function
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Create content embedding from metadata
 * Combines title, overview, genres, mood, and tone
 */
export function createContentEmbedding(content: MockContent, dimensions = 128): Float32Array {
  // Build rich text representation
  const textParts = [
    content.title,
    content.overview,
    content.genres.join(' '),
    `${content.mood} mood`,
    `${content.tone} tone`,
    // Add mood/tone synonyms for better matching
    content.mood === 'unwind' ? 'relax calm peaceful' : 'active exciting energetic',
    content.tone === 'laugh' ? 'comedy funny humor' :
    content.tone === 'feel' ? 'emotional drama touching' :
    content.tone === 'thrill' ? 'suspense action thriller' :
    'intellectual cerebral thoughtful'
  ];

  const fullText = textParts.filter(Boolean).join(' ');
  return createTrigramEmbedding(fullText, dimensions);
}

/**
 * Create query embedding from user input
 */
export function createQueryEmbedding(
  mood: 'unwind' | 'engage',
  tone: 'laugh' | 'feel' | 'thrill' | 'think',
  additionalText?: string,
  dimensions = 128
): Float32Array {
  // Build query text with semantic expansion
  const moodTerms = mood === 'unwind'
    ? 'relax calm peaceful unwind comfortable cozy'
    : 'engage active exciting stimulating intense energetic';

  const toneTerms = {
    laugh: 'comedy funny humor laugh hilarious amusing entertainment',
    feel: 'emotional drama touching heartfelt moving romantic',
    thrill: 'thriller suspense action crime mystery intense',
    think: 'documentary intellectual cerebral thoughtful mind science'
  }[tone];

  const queryText = [moodTerms, toneTerms, additionalText].filter(Boolean).join(' ');
  return createTrigramEmbedding(queryText, dimensions);
}

// ============================================================================
// RuVector Store Class
// ============================================================================

export class RuVectorStore {
  private db: InstanceType<typeof VectorDB>;
  private config: RuVectorConfig;
  private initialized = false;
  private contentMap = new Map<string, MockContent>();

  constructor(config: RuVectorConfig = { dimensions: 256 }) {
    this.config = {
      useTrigramEmbedding: true,
      ...config
    };
    this.db = new VectorDB({ dimensions: config.dimensions });
    logger.info('RuVectorStore created', { dimensions: config.dimensions });
  }

  /**
   * Initialize and index all content
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('RuVectorStore already initialized');
      return;
    }

    logger.info('Initializing RuVectorStore...');
    const startTime = Date.now();

    // Index all mock content
    for (const content of ALL_MOCK_CONTENT) {
      try {
        const vector = createContentEmbedding(content, this.config.dimensions);

        await this.db.insert({
          id: content.id,
          vector,
          metadata: {
            title: content.title,
            mood: content.mood,
            tone: content.tone,
            genres: content.genres,
            year: content.year,
            overview: content.overview,
            isTrending: content.isTrending
          }
        });

        this.contentMap.set(content.id, content);
      } catch (error) {
        logger.warn(`Failed to index content ${content.id}`,
          error instanceof Error ? error : new Error(String(error)));
      }
    }

    const count = await this.db.len();
    this.initialized = true;

    logger.info('RuVectorStore initialized', {
      contentCount: count,
      duration: Date.now() - startTime
    });
  }

  /**
   * Search for similar content
   */
  async search(
    mood: 'unwind' | 'engage',
    tone: 'laugh' | 'feel' | 'thrill' | 'think',
    options: {
      limit?: number;
      additionalQuery?: string;
      excludeIds?: string[];
    } = {}
  ): Promise<Array<{ content: MockContent; score: number }>> {
    if (!this.initialized) {
      await this.initialize();
    }

    const { limit = 10, additionalQuery, excludeIds = [] } = options;
    const excludeSet = new Set(excludeIds);

    // Create query embedding
    const queryVector = createQueryEmbedding(mood, tone, additionalQuery, this.config.dimensions);

    // Search
    const results = await this.db.search({
      vector: queryVector,
      k: limit + excludeIds.length + 5 // Get extra to account for filtering
    });

    logger.debug('Search completed', {
      mood, tone,
      resultCount: results.length
    });

    // Map results to content
    return results
      .filter((r: { id: string; score: number }) => !excludeSet.has(r.id))
      .slice(0, limit)
      .map((r: { id: string; score: number }) => ({
        content: this.contentMap.get(r.id)!,
        score: r.score
      }))
      .filter((r: { content: MockContent | undefined; score: number }) => r.content !== undefined);
  }

  /**
   * Find similar content to a given content ID
   */
  async findSimilar(
    contentId: string,
    options: { limit?: number; excludeIds?: string[] } = {}
  ): Promise<Array<{ content: MockContent; score: number }>> {
    if (!this.initialized) {
      await this.initialize();
    }

    const content = this.contentMap.get(contentId);
    if (!content) {
      return [];
    }

    const { limit = 5, excludeIds = [] } = options;
    const excludeSet = new Set([contentId, ...excludeIds]);

    // Create embedding from content
    const vector = createContentEmbedding(content, this.config.dimensions);

    const results = await this.db.search({
      vector,
      k: limit + excludeSet.size + 3
    });

    return results
      .filter((r: { id: string; score: number }) => !excludeSet.has(r.id))
      .slice(0, limit)
      .map((r: { id: string; score: number }) => ({
        content: this.contentMap.get(r.id)!,
        score: r.score
      }))
      .filter((r: { content: MockContent | undefined; score: number }) => r.content !== undefined);
  }

  /**
   * Search by free text query
   */
  async searchByText(
    query: string,
    options: { limit?: number; excludeIds?: string[] } = {}
  ): Promise<Array<{ content: MockContent; score: number }>> {
    if (!this.initialized) {
      await this.initialize();
    }

    const { limit = 10, excludeIds = [] } = options;
    const excludeSet = new Set(excludeIds);

    const queryVector = createTrigramEmbedding(query, this.config.dimensions);

    const results = await this.db.search({
      vector: queryVector,
      k: limit + excludeIds.length + 5
    });

    return results
      .filter((r: { id: string; score: number }) => !excludeSet.has(r.id))
      .slice(0, limit)
      .map((r: { id: string; score: number }) => ({
        content: this.contentMap.get(r.id)!,
        score: r.score
      }))
      .filter((r: { content: MockContent | undefined; score: number }) => r.content !== undefined);
  }

  /**
   * Add new content to the index
   */
  async addContent(content: MockContent): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    const vector = createContentEmbedding(content, this.config.dimensions);

    await this.db.insert({
      id: content.id,
      vector,
      metadata: {
        title: content.title,
        mood: content.mood,
        tone: content.tone,
        genres: content.genres,
        year: content.year,
        overview: content.overview,
        isTrending: content.isTrending
      }
    });

    this.contentMap.set(content.id, content);
    logger.debug('Added content to index', { id: content.id });
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    contentCount: number;
    dimensions: number;
    initialized: boolean;
  }> {
    const count = this.initialized ? await this.db.len() : 0;
    return {
      contentCount: count,
      dimensions: this.config.dimensions,
      initialized: this.initialized
    };
  }

  /**
   * Get content by ID
   */
  getContent(id: string): MockContent | undefined {
    return this.contentMap.get(id);
  }
}

// ============================================================================
// Default Instance
// ============================================================================

let defaultRuVectorStore: RuVectorStore | undefined;

/**
 * Get default RuVector store (lazy initialization)
 * Note: Using 128 dimensions due to ruvector search limitation
 */
export function getRuVectorStore(): RuVectorStore {
  if (!defaultRuVectorStore) {
    defaultRuVectorStore = new RuVectorStore({ dimensions: 128 });
  }
  return defaultRuVectorStore;
}

/**
 * Initialize the default store
 */
export async function initializeRuVectorStore(): Promise<RuVectorStore> {
  const store = getRuVectorStore();
  await store.initialize();
  return store;
}
