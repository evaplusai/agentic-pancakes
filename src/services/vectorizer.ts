/**
 * Content Vectorization Service
 *
 * Generates 768D vectors from content metadata using embeddings and features.
 * Integrates with Anthropic for text embeddings (or uses stub for MVP).
 *
 * @module services/vectorizer
 */

import { createLogger } from '../utils/logger.js';
import {
  ContentVector,
  ContentMetadata,
  createContentVectorFromMetadata,
  setMetadataFeatures,
  CONTENT_VECTOR_DIMENSIONS
} from '../models/content-vector.js';
import { ValidationError } from '../utils/error-handler.js';

const logger = createLogger('Vectorizer');

// ============================================================================
// Types
// ============================================================================

export interface VectorizationOptions {
  useEmbeddings?: boolean; // Use actual embeddings (vs stub)
  embedModel?: string;
  normalizeVectors?: boolean;
}

export interface VectorizationResult {
  vector: ContentVector;
  metadata: {
    hasEmbedding: boolean;
    embeddingModel?: string;
    vectorizedAt: string;
  };
}

// ============================================================================
// Vectorizer Service
// ============================================================================

export class VectorizerService {
  private options: Required<VectorizationOptions>;

  constructor(options: VectorizationOptions = {}) {
    this.options = {
      useEmbeddings: options.useEmbeddings ?? false,
      embedModel: options.embedModel || 'text-embedding-3-small',
      normalizeVectors: options.normalizeVectors ?? true
    };

    logger.info('Vectorizer service initialized', {
      useEmbeddings: this.options.useEmbeddings,
      embedModel: this.options.embedModel
    });
  }

  /**
   * Vectorize content metadata into 768D vector
   */
  async vectorize(metadata: ContentMetadata): Promise<VectorizationResult> {
    logger.debug('Vectorizing content', {
      contentId: metadata.contentId,
      title: metadata.title
    });

    try {
      // Create base vector from metadata
      let vector = createContentVectorFromMetadata(metadata);

      // Generate plot embedding if available
      if (metadata.overview && this.options.useEmbeddings) {
        const plotEmbedding = await this.generatePlotEmbedding(metadata.overview);
        vector = this.setPlotEmbedding(vector, plotEmbedding);
      } else if (metadata.overview) {
        // Stub: generate deterministic embedding from text
        const plotEmbedding = this.generateStubEmbedding(metadata.overview, 512);
        vector = this.setPlotEmbedding(vector, plotEmbedding);
      }

      // Generate mood/tone embedding
      const moodEmbedding = this.generateMoodEmbedding(metadata);
      vector = this.setMoodEmbedding(vector, moodEmbedding);

      // Normalize vector if enabled
      if (this.options.normalizeVectors) {
        vector = this.normalizeVector(vector);
      }

      logger.debug('Content vectorized successfully', {
        contentId: metadata.contentId,
        hasEmbedding: this.options.useEmbeddings
      });

      return {
        vector,
        metadata: {
          hasEmbedding: this.options.useEmbeddings,
          embeddingModel: this.options.useEmbeddings ? this.options.embedModel : undefined,
          vectorizedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Vectorization failed', error as Error, {
        contentId: metadata.contentId
      });
      throw new ValidationError('Failed to vectorize content', {
        contentId: metadata.contentId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Batch vectorize multiple content items
   */
  async vectorizeBatch(
    metadataList: ContentMetadata[]
  ): Promise<VectorizationResult[]> {
    logger.info('Starting batch vectorization', {
      count: metadataList.length
    });

    const results: VectorizationResult[] = [];

    for (const metadata of metadataList) {
      try {
        const result = await this.vectorize(metadata);
        results.push(result);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.warn('Failed to vectorize content in batch', err, {
          contentId: metadata.contentId
        });
        // Continue with other items
      }
    }

    logger.info('Batch vectorization completed', {
      total: metadataList.length,
      successful: results.length,
      failed: metadataList.length - results.length
    });

    return results;
  }

  /**
   * Generate plot embedding using text embedding model
   */
  private async generatePlotEmbedding(text: string): Promise<Float32Array> {
    // TODO: Replace with actual OpenAI text-embedding-3-small API call
    // const response = await openai.embeddings.create({
    //   model: this.options.embedModel,
    //   input: text,
    //   dimensions: 512
    // });
    // return new Float32Array(response.data[0].embedding);

    // Stub implementation
    return this.generateStubEmbedding(text, 512);
  }

  /**
   * Generate mood/tone embedding from metadata
   */
  private generateMoodEmbedding(metadata: ContentMetadata): Float32Array {
    const embedding = new Float32Array(64);

    // Map genres to mood dimensions
    const genreMoodMap: Record<string, number[]> = {
      comedy: [0.8, 0.6, 0.3, 0.7], // lighthearted, uplifting
      drama: [0.3, 0.7, 0.5, 0.6], // serious, emotional
      action: [0.5, 0.4, 0.8, 0.6], // intense, suspenseful
      thriller: [0.2, 0.6, 0.9, 0.7], // dark, suspenseful
      romance: [0.6, 0.5, 0.4, 0.8], // romantic, emotional
      horror: [0.1, 0.8, 0.7, 0.3], // dark, intense
      documentary: [0.4, 0.6, 0.3, 0.5], // serious, educational
      scifi: [0.5, 0.5, 0.6, 0.6], // futuristic, thoughtful
      fantasy: [0.6, 0.4, 0.5, 0.7], // whimsical, adventurous
      animation: [0.7, 0.3, 0.4, 0.8] // lighthearted, whimsical
    };

    // Aggregate mood from genres
    const moods = new Float32Array(4);
    let count = 0;

    for (const genre of metadata.genres) {
      const genreMood = genreMoodMap[genre.toLowerCase()];
      if (genreMood) {
        for (let i = 0; i < genreMood.length; i++) {
          moods[i] += genreMood[i];
        }
        count++;
      }
    }

    if (count > 0) {
      for (let i = 0; i < moods.length; i++) {
        moods[i] /= count;
      }
    }

    // Expand mood to 64D with variations
    for (let i = 0; i < 64; i++) {
      const baseIndex = Math.floor(i / 16);
      const variation = (i % 16) / 16;
      embedding[i] = moods[baseIndex] * (0.8 + variation * 0.4);
    }

    return embedding;
  }

  /**
   * Generate stub embedding from text (deterministic hash)
   */
  private generateStubEmbedding(text: string, dimensions: number): Float32Array {
    const embedding = new Float32Array(dimensions);

    // Simple hash-based embedding (deterministic)
    for (let i = 0; i < dimensions; i++) {
      const hash = this.simpleHash(text + i.toString());
      embedding[i] = (hash % 1000) / 1000 - 0.5; // Range: -0.5 to 0.5
    }

    return embedding;
  }

  /**
   * Set plot embedding in content vector
   */
  private setPlotEmbedding(
    vector: ContentVector,
    embedding: Float32Array
  ): ContentVector {
    const newVector = new Float32Array(vector.vector);

    // Copy plot embedding to positions 0-511
    for (let i = 0; i < 512 && i < embedding.length; i++) {
      newVector[CONTENT_VECTOR_DIMENSIONS.PLOT_START + i] = embedding[i];
    }

    return {
      ...vector,
      vector: newVector
    };
  }

  /**
   * Set mood embedding in content vector
   */
  private setMoodEmbedding(
    vector: ContentVector,
    embedding: Float32Array
  ): ContentVector {
    const newVector = new Float32Array(vector.vector);

    // Copy mood embedding to positions 576-639
    for (let i = 0; i < 64 && i < embedding.length; i++) {
      newVector[CONTENT_VECTOR_DIMENSIONS.MOOD_START + i] = embedding[i];
    }

    return {
      ...vector,
      vector: newVector
    };
  }

  /**
   * Normalize vector to unit length
   */
  private normalizeVector(vector: ContentVector): ContentVector {
    const v = vector.vector;
    let magnitude = 0;

    for (let i = 0; i < v.length; i++) {
      magnitude += v[i] * v[i];
    }

    magnitude = Math.sqrt(magnitude);

    if (magnitude === 0) {
      return vector;
    }

    const normalized = new Float32Array(v.length);
    for (let i = 0; i < v.length; i++) {
      normalized[i] = v[i] / magnitude;
    }

    return {
      ...vector,
      vector: normalized
    };
  }

  /**
   * Simple hash function for stub embeddings
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// ============================================================================
// Default Service Instance
// ============================================================================

let defaultVectorizer: VectorizerService | undefined;

/**
 * Get default vectorizer instance
 */
export function getVectorizer(): VectorizerService {
  if (!defaultVectorizer) {
    defaultVectorizer = new VectorizerService({
      useEmbeddings: process.env.USE_EMBEDDINGS === 'true',
      normalizeVectors: true
    });
  }
  return defaultVectorizer;
}

/**
 * Vectorize content using default service
 */
export async function vectorizeContent(
  metadata: ContentMetadata
): Promise<VectorizationResult> {
  return getVectorizer().vectorize(metadata);
}

/**
 * Batch vectorize using default service
 */
export async function vectorizeContentBatch(
  metadataList: ContentMetadata[]
): Promise<VectorizationResult[]> {
  return getVectorizer().vectorizeBatch(metadataList);
}
