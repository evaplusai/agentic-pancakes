/**
 * Content Vector Models
 *
 * 768-dimensional content representation for vector similarity search.
 * Includes emotional signature, engagement patterns, and metadata.
 *
 * @module models/content-vector
 */

import { z } from 'zod';

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Content metadata schema
 */
export const ContentMetadataSchema = z.object({
  contentId: z.string().describe('Unique content identifier'),
  domain: z.enum(['movie', 'tv', 'music', 'podcast', 'book', 'course', 'vr']).default('movie'),
  title: z.string(),
  originalTitle: z.string().optional(),
  year: z.number().int().positive().optional(),
  runtime: z.number().positive().optional().describe('Runtime in minutes'),
  language: z.string().default('fr').describe('ISO 639-1 language code'),
  genres: z.array(z.string()).default([]),

  // Streaming platform specific
  streamingId: z.string().optional(),
  streamingUrl: z.string().url().optional(),

  // TMDB metadata
  tmdbId: z.number().int().optional(),
  imdbId: z.string().optional(),
  overview: z.string().optional(),
  posterPath: z.string().optional(),
  backdropPath: z.string().optional(),

  // Popularity metrics
  tmdbPopularity: z.number().optional(),
  tmdbVoteAverage: z.number().optional(),
  tmdbVoteCount: z.number().int().optional(),

  // Vector metadata
  version: z.number().int().positive().default(1),
  lastUpdated: z.string().datetime(),

  // Performance stats
  avgUtilityScore: z.number().min(0).max(1).optional(),
  successRate: z.number().min(0).max(1).optional(),
  causalUplift: z.number().optional()
});

/**
 * Content Vector schema (768D)
 */
export const ContentVectorSchema = z.object({
  vector: z.instanceof(Float32Array)
    .refine((arr) => arr.length === 768, {
      message: 'Content vector must be exactly 768 dimensions'
    })
    .describe('768-dimensional embedding vector'),
  metadata: ContentMetadataSchema
});

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Content metadata
 */
export interface ContentMetadata extends z.infer<typeof ContentMetadataSchema> {}

/**
 * Content Vector (768 dimensions)
 *
 * Dimension allocation:
 * - [0-511]   Plot/Synopsis embedding (512D) - text-embedding-3-small
 * - [512-575] Genre one-hot + features (64D)
 * - [576-639] Mood/Tone embedding (64D)
 * - [640-767] Metadata features (128D) - runtime, year, ratings, etc.
 */
export interface ContentVector extends z.infer<typeof ContentVectorSchema> {}

// ============================================================================
// Constants
// ============================================================================

/**
 * Content vector dimension mappings
 */
export const CONTENT_VECTOR_DIMENSIONS = {
  PLOT_START: 0,
  PLOT_END: 511,
  GENRE_START: 512,
  GENRE_END: 575,
  MOOD_START: 576,
  MOOD_END: 639,
  METADATA_START: 640,
  METADATA_END: 767,
  TOTAL_DIMENSIONS: 768
} as const;

/**
 * Mood/tone categories
 */
export const MOOD_CATEGORIES = [
  'lighthearted',
  'serious',
  'suspenseful',
  'romantic',
  'dark',
  'uplifting',
  'melancholic',
  'intense',
  'whimsical',
  'gritty'
] as const;

/**
 * Genre categories (same as user vector)
 */
export const GENRE_CATEGORIES = [
  'comedy',
  'drama',
  'action',
  'thriller',
  'romance',
  'scifi',
  'fantasy',
  'horror',
  'documentary',
  'animation',
  'crime',
  'mystery',
  'adventure',
  'family'
] as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a new content vector with default values
 */
export function createDefaultContentVector(contentId: string, title: string): ContentVector {
  const vector = new Float32Array(CONTENT_VECTOR_DIMENSIONS.TOTAL_DIMENSIONS);

  // Initialize with zeros
  vector.fill(0);

  return {
    vector,
    metadata: {
      contentId,
      domain: 'movie',
      title,
      language: 'fr',
      version: 1,
      lastUpdated: new Date().toISOString(),
      genres: []
    }
  };
}

/**
 * Validate content vector
 */
export function validateContentVector(vector: unknown): ContentVector {
  return ContentVectorSchema.parse(vector);
}

/**
 * Calculate cosine similarity between two content vectors
 */
export function calculateContentSimilarity(vector1: ContentVector, vector2: ContentVector): number {
  const v1 = vector1.vector;
  const v2 = vector2.vector;

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    magnitude1 += v1[i] * v1[i];
    magnitude2 += v2[i] * v2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Extract plot embedding from content vector
 */
export function extractPlotEmbedding(vector: ContentVector): Float32Array {
  return vector.vector.slice(
    CONTENT_VECTOR_DIMENSIONS.PLOT_START,
    CONTENT_VECTOR_DIMENSIONS.PLOT_END + 1
  );
}

/**
 * Extract genre features from content vector
 */
export function extractGenreFeatures(vector: ContentVector): Float32Array {
  return vector.vector.slice(
    CONTENT_VECTOR_DIMENSIONS.GENRE_START,
    CONTENT_VECTOR_DIMENSIONS.GENRE_END + 1
  );
}

/**
 * Extract mood features from content vector
 */
export function extractMoodFeatures(vector: ContentVector): Float32Array {
  return vector.vector.slice(
    CONTENT_VECTOR_DIMENSIONS.MOOD_START,
    CONTENT_VECTOR_DIMENSIONS.MOOD_END + 1
  );
}

/**
 * Extract metadata features from content vector
 */
export function extractMetadataFeatures(vector: ContentVector): Float32Array {
  return vector.vector.slice(
    CONTENT_VECTOR_DIMENSIONS.METADATA_START,
    CONTENT_VECTOR_DIMENSIONS.METADATA_END + 1
  );
}

/**
 * Set genre one-hot encoding in content vector
 */
export function setGenreEncoding(vector: ContentVector, genres: string[]): ContentVector {
  const newVector = new Float32Array(vector.vector);

  // Clear existing genre encoding
  for (let i = CONTENT_VECTOR_DIMENSIONS.GENRE_START; i <= CONTENT_VECTOR_DIMENSIONS.GENRE_START + GENRE_CATEGORIES.length; i++) {
    newVector[i] = 0;
  }

  // Set one-hot for each genre
  for (const genre of genres) {
    const genreIndex = GENRE_CATEGORIES.indexOf(genre.toLowerCase() as any);
    if (genreIndex !== -1) {
      newVector[CONTENT_VECTOR_DIMENSIONS.GENRE_START + genreIndex] = 1.0;
    }
  }

  return {
    ...vector,
    vector: newVector,
    metadata: {
      ...vector.metadata,
      genres,
      lastUpdated: new Date().toISOString()
    }
  };
}

/**
 * Set metadata features (normalized values)
 */
export function setMetadataFeatures(
  vector: ContentVector,
  features: {
    runtime?: number;
    year?: number;
    popularity?: number;
    voteAverage?: number;
    voteCount?: number;
  }
): ContentVector {
  const newVector = new Float32Array(vector.vector);
  const metadataStart = CONTENT_VECTOR_DIMENSIONS.METADATA_START;

  // Normalize and set features
  if (features.runtime !== undefined) {
    // Normalize runtime: 0-300 minutes -> 0-1
    newVector[metadataStart] = Math.min(features.runtime / 300, 1.0);
  }

  if (features.year !== undefined) {
    // Normalize year: 1900-2030 -> 0-1
    newVector[metadataStart + 1] = (features.year - 1900) / 130;
  }

  if (features.popularity !== undefined) {
    // Normalize popularity: log scale
    newVector[metadataStart + 2] = Math.min(Math.log10(features.popularity + 1) / 3, 1.0);
  }

  if (features.voteAverage !== undefined) {
    // Normalize vote average: 0-10 -> 0-1
    newVector[metadataStart + 3] = features.voteAverage / 10;
  }

  if (features.voteCount !== undefined) {
    // Normalize vote count: log scale
    newVector[metadataStart + 4] = Math.min(Math.log10(features.voteCount + 1) / 5, 1.0);
  }

  return {
    ...vector,
    vector: newVector,
    metadata: {
      ...vector.metadata,
      runtime: features.runtime,
      year: features.year,
      tmdbPopularity: features.popularity,
      tmdbVoteAverage: features.voteAverage,
      tmdbVoteCount: features.voteCount,
      lastUpdated: new Date().toISOString()
    }
  };
}

/**
 * Serialize content vector to storable format
 */
export function serializeContentVector(vector: ContentVector): string {
  return JSON.stringify({
    vector: Array.from(vector.vector),
    metadata: vector.metadata
  });
}

/**
 * Deserialize content vector from storage
 */
export function deserializeContentVector(data: string): ContentVector {
  const parsed = JSON.parse(data);
  return validateContentVector({
    ...parsed,
    vector: new Float32Array(parsed.vector)
  });
}

/**
 * Create content vector from metadata (without embeddings)
 * Embeddings should be set separately via text embedding models
 */
export function createContentVectorFromMetadata(metadata: ContentMetadata): ContentVector {
  let vector = createDefaultContentVector(metadata.contentId, metadata.title);

  // Set genre encoding
  if (metadata.genres && metadata.genres.length > 0) {
    vector = setGenreEncoding(vector, metadata.genres);
  }

  // Set metadata features
  vector = setMetadataFeatures(vector, {
    runtime: metadata.runtime,
    year: metadata.year,
    popularity: metadata.tmdbPopularity,
    voteAverage: metadata.tmdbVoteAverage,
    voteCount: metadata.tmdbVoteCount
  });

  return {
    ...vector,
    metadata
  };
}

/**
 * Calculate weighted similarity using multiple features
 */
export function calculateWeightedSimilarity(
  vector1: ContentVector,
  vector2: ContentVector,
  weights: {
    plot?: number;
    genre?: number;
    mood?: number;
    metadata?: number;
  } = {}
): number {
  const defaultWeights = {
    plot: 0.4,
    genre: 0.3,
    mood: 0.2,
    metadata: 0.1
  };

  const w = { ...defaultWeights, ...weights };

  // Calculate similarity for each component
  const plotSim = cosineSimilarity(extractPlotEmbedding(vector1), extractPlotEmbedding(vector2));
  const genreSim = cosineSimilarity(extractGenreFeatures(vector1), extractGenreFeatures(vector2));
  const moodSim = cosineSimilarity(extractMoodFeatures(vector1), extractMoodFeatures(vector2));
  const metadataSim = cosineSimilarity(extractMetadataFeatures(vector1), extractMetadataFeatures(vector2));

  return (
    plotSim * w.plot +
    genreSim * w.genre +
    moodSim * w.mood +
    metadataSim * w.metadata
  );
}

/**
 * Helper: Calculate cosine similarity between two Float32Arrays
 */
function cosineSimilarity(v1: Float32Array, v2: Float32Array): number {
  if (v1.length !== v2.length) return 0;

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    magnitude1 += v1[i] * v1[i];
    magnitude2 += v2[i] * v2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (magnitude1 * magnitude2);
}
