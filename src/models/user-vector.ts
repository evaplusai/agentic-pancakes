/**
 * User Style Vector Models
 *
 * Long-term taste profile learned from user interactions.
 * 64-dimensional vector representation.
 *
 * @module models/user-vector
 */

import { z } from 'zod';

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Explicit preferences schema
 */
export const ExplicitPreferencesSchema = z.object({
  favoriteGenres: z.array(z.string()).default([]),
  dislikedGenres: z.array(z.string()).default([]),
  preferredLanguages: z.array(z.string()).default([]),
  maxRuntime: z.number().positive().optional().describe('Maximum runtime in minutes'),
  contentRating: z.string().optional().describe('Preferred content rating (G, PG, PG-13, R, etc.)')
});

/**
 * Learned behavioral patterns schema
 */
export const LearnedPatternsSchema = z.object({
  avgCompletionRate: z.number().min(0).max(1).describe('Average completion rate'),
  preferredTimeOfDay: z.array(z.enum(['morning', 'afternoon', 'evening', 'night'])).default([]),
  bingeWatcher: z.boolean().default(false).describe('Tends to watch multiple in a row'),
  explorationVsExploitation: z.number().min(0).max(1).describe('0 (stick to favorites) - 1 (adventurous)')
});

/**
 * Graph embedding schema
 */
export const GraphEmbeddingSchema = z.object({
  nodeId: z.string().describe('Node ID in user-content bipartite graph'),
  neighbors: z.array(z.string()).default([]).describe('Similar users'),
  communityId: z.string().optional().describe('Cluster assignment')
});

/**
 * User vector metadata schema
 */
export const UserVectorMetadataSchema = z.object({
  userId: z.string().describe('Anonymized user ID'),
  version: z.number().int().positive().default(1).describe('Vector version for migration'),
  lastUpdated: z.string().datetime().describe('ISO 8601 timestamp'),
  interactionCount: z.number().int().min(0).default(0).describe('Number of interactions trained'),
  confidence: z.number().min(0).max(1).default(0.5).describe('Confidence in this profile')
});

/**
 * User Style Vector schema (64D)
 */
export const UserStyleVectorSchema = z.object({
  vector: z.instanceof(Float32Array)
    .refine((arr) => arr.length === 64, {
      message: 'User vector must be exactly 64 dimensions'
    })
    .describe('64-dimensional embedding vector'),
  metadata: UserVectorMetadataSchema,
  explicitPreferences: ExplicitPreferencesSchema.optional(),
  learnedPatterns: LearnedPatternsSchema.optional(),
  graphEmbedding: GraphEmbeddingSchema.optional()
});

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Explicit preferences
 */
export interface ExplicitPreferences extends z.infer<typeof ExplicitPreferencesSchema> {}

/**
 * Learned behavioral patterns
 */
export interface LearnedPatterns extends z.infer<typeof LearnedPatternsSchema> {}

/**
 * Graph embedding
 */
export interface GraphEmbedding extends z.infer<typeof GraphEmbeddingSchema> {}

/**
 * User vector metadata
 */
export interface UserVectorMetadata extends z.infer<typeof UserVectorMetadataSchema> {}

/**
 * User Style Vector (64 dimensions)
 *
 * Persistent representation of user's content preferences.
 * Evolves over time through implicit feedback.
 *
 * Dimension allocation:
 * - [0-14]  Genre affinities (15D)
 * - [15-24] Mood/Tone preferences (10D)
 * - [25-32] Pacing preferences (8D)
 * - [33-40] Content characteristics (8D)
 * - [41-48] French-specific attributes (8D)
 * - [49-56] Context patterns (8D)
 * - [57-63] Session modifiers (dynamic) (7D)
 */
export interface UserStyleVector extends z.infer<typeof UserStyleVectorSchema> {}

// ============================================================================
// Constants
// ============================================================================

/**
 * User vector dimension mappings
 */
export const USER_VECTOR_DIMENSIONS = {
  GENRE_START: 0,
  GENRE_END: 14,
  MOOD_START: 15,
  MOOD_END: 24,
  PACING_START: 25,
  PACING_END: 32,
  CHARACTERISTICS_START: 33,
  CHARACTERISTICS_END: 40,
  FRENCH_START: 41,
  FRENCH_END: 48,
  CONTEXT_START: 49,
  CONTEXT_END: 56,
  SESSION_START: 57,
  SESSION_END: 63,
  TOTAL_DIMENSIONS: 64
} as const;

/**
 * Default genre indices
 */
export const GENRE_INDICES: Record<string, number> = {
  comedy: 0,
  drama: 1,
  action: 2,
  thriller: 3,
  romance: 4,
  scifi: 5,
  fantasy: 6,
  horror: 7,
  documentary: 8,
  animation: 9,
  crime: 10,
  mystery: 11,
  adventure: 12,
  family: 13,
  other: 14
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a new user vector with default values
 */
export function createDefaultUserVector(userId: string): UserStyleVector {
  const vector = new Float32Array(USER_VECTOR_DIMENSIONS.TOTAL_DIMENSIONS);

  // Initialize with neutral values (0.5)
  for (let i = 0; i < vector.length; i++) {
    vector[i] = 0.5;
  }

  return {
    vector,
    metadata: {
      userId,
      version: 1,
      lastUpdated: new Date().toISOString(),
      interactionCount: 0,
      confidence: 0.0
    }
  };
}

/**
 * Validate user vector
 */
export function validateUserVector(vector: unknown): UserStyleVector {
  return UserStyleVectorSchema.parse(vector);
}

/**
 * Calculate cosine similarity between two user vectors
 */
export function calculateUserSimilarity(vector1: UserStyleVector, vector2: UserStyleVector): number {
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
 * Extract genre preferences from user vector
 */
export function extractGenrePreferences(vector: UserStyleVector): Record<string, number> {
  const preferences: Record<string, number> = {};
  const v = vector.vector;

  for (const [genre, index] of Object.entries(GENRE_INDICES)) {
    preferences[genre] = v[USER_VECTOR_DIMENSIONS.GENRE_START + index];
  }

  return preferences;
}

/**
 * Update genre preference in user vector
 */
export function updateGenrePreference(
  vector: UserStyleVector,
  genre: string,
  value: number
): UserStyleVector {
  const genreIndex = GENRE_INDICES[genre.toLowerCase()];
  if (genreIndex === undefined) {
    throw new Error(`Unknown genre: ${genre}`);
  }

  const newVector = new Float32Array(vector.vector);
  newVector[USER_VECTOR_DIMENSIONS.GENRE_START + genreIndex] = Math.max(0, Math.min(1, value));

  return {
    ...vector,
    vector: newVector,
    metadata: {
      ...vector.metadata,
      lastUpdated: new Date().toISOString()
    }
  };
}

/**
 * Merge user vectors with weighted average
 */
export function mergeUserVectors(
  vector1: UserStyleVector,
  vector2: UserStyleVector,
  weight1 = 0.5
): UserStyleVector {
  const weight2 = 1 - weight1;
  const mergedVector = new Float32Array(USER_VECTOR_DIMENSIONS.TOTAL_DIMENSIONS);

  for (let i = 0; i < mergedVector.length; i++) {
    mergedVector[i] = vector1.vector[i] * weight1 + vector2.vector[i] * weight2;
  }

  return {
    ...vector1,
    vector: mergedVector,
    metadata: {
      ...vector1.metadata,
      lastUpdated: new Date().toISOString(),
      interactionCount: vector1.metadata.interactionCount + vector2.metadata.interactionCount,
      confidence: Math.max(vector1.metadata.confidence, vector2.metadata.confidence)
    }
  };
}

/**
 * Serialize user vector to storable format
 */
export function serializeUserVector(vector: UserStyleVector): string {
  return JSON.stringify({
    vector: Array.from(vector.vector),
    metadata: vector.metadata,
    explicitPreferences: vector.explicitPreferences,
    learnedPatterns: vector.learnedPatterns,
    graphEmbedding: vector.graphEmbedding
  });
}

/**
 * Deserialize user vector from storage
 */
export function deserializeUserVector(data: string): UserStyleVector {
  const parsed = JSON.parse(data);
  return validateUserVector({
    ...parsed,
    vector: new Float32Array(parsed.vector)
  });
}

/**
 * Calculate confidence score based on interaction count
 */
export function calculateConfidence(interactionCount: number): number {
  // Sigmoid function: confidence saturates at ~30 interactions
  return 1 / (1 + Math.exp(-(interactionCount - 15) / 5));
}

/**
 * Update user vector from interaction
 */
export function updateFromInteraction(
  vector: UserStyleVector,
  contentGenres: string[],
  satisfaction: number, // 0-1
  learningRate = 0.1
): UserStyleVector {
  const newVector = new Float32Array(vector.vector);

  // Update genre preferences based on satisfaction
  for (const genre of contentGenres) {
    const genreIndex = GENRE_INDICES[genre.toLowerCase()];
    if (genreIndex !== undefined) {
      const currentValue = newVector[USER_VECTOR_DIMENSIONS.GENRE_START + genreIndex];
      const delta = learningRate * (satisfaction - currentValue);
      newVector[USER_VECTOR_DIMENSIONS.GENRE_START + genreIndex] = Math.max(0, Math.min(1, currentValue + delta));
    }
  }

  const newInteractionCount = vector.metadata.interactionCount + 1;

  return {
    ...vector,
    vector: newVector,
    metadata: {
      ...vector.metadata,
      lastUpdated: new Date().toISOString(),
      interactionCount: newInteractionCount,
      confidence: calculateConfidence(newInteractionCount)
    }
  };
}
