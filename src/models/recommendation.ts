/**
 * Recommendation Models
 *
 * Input/output interfaces for the recommendation API.
 * Includes provenance, explanations, and metadata.
 *
 * @module models/recommendation
 */

import { z } from 'zod';

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Constraints schema
 */
export const ConstraintsSchema = z.object({
  maxRuntime: z.number().positive().optional().describe('Maximum runtime in minutes'),
  minYear: z.number().int().positive().optional(),
  maxYear: z.number().int().positive().optional(),
  languages: z.array(z.string()).optional().describe('ISO 639-1 codes'),
  genres: z.array(z.string()).optional(),
  excludeGenres: z.array(z.string()).optional()
});

/**
 * Context schema
 */
export const RequestContextSchema = z.object({
  social: z.enum(['alone', 'partner', 'family', 'friends']).optional(),
  device: z.enum(['mobile', 'tablet', 'desktop', 'tv']).optional(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional()
});

/**
 * Request options schema
 */
export const RequestOptionsSchema = z.object({
  includeAlternatives: z.boolean().default(true),
  alternativeCount: z.number().int().min(1).max(10).default(3),
  includeProvenance: z.boolean().default(true),
  includeTrending: z.boolean().default(true),
  explainReasoning: z.boolean().default(true)
});

/**
 * Get recommendation input schema
 */
export const GetRecommendationInputSchema = z.object({
  mood: z.enum(['unwind', 'engage']),
  goal: z.enum(['laugh', 'feel', 'thrill', 'think']),
  constraints: ConstraintsSchema.optional(),
  context: RequestContextSchema.optional(),
  userId: z.string().optional(),
  options: RequestOptionsSchema.optional()
});

/**
 * Score breakdown schema
 */
export const ScoreBreakdownSchema = z.object({
  moodMatch: z.number().min(0).max(1),
  intentMatch: z.number().min(0).max(1),
  styleMatch: z.number().min(0).max(1),
  contextMatch: z.number().min(0).max(1),
  trendingBoost: z.number().min(0).max(1),
  skillBoost: z.number().min(0).max(1).optional()
});

/**
 * Provenance schema
 */
export const ProvenanceSchema = z.object({
  evidenceTrajectories: z.number().int().min(0).describe('Number of similar past successes'),
  confidenceInterval: z.tuple([z.number(), z.number()]).describe('[lower, upper] bounds'),
  similarUsersCompleted: z.string().describe('e.g. "87% of similar users completed"'),
  skillUsed: z.string().optional().describe('Name of learned skill applied'),
  reasoning: z.string().describe('Why this was recommended')
});

/**
 * Availability schema
 */
export const AvailabilitySchema = z.object({
  regions: z.array(z.string()).describe('ISO 3166-1 alpha-2 codes'),
  expiresAt: z.string().datetime().optional()
});

/**
 * Content item schema
 */
export const ContentItemSchema = z.object({
  // Basic info
  id: z.string(),
  title: z.string(),
  originalTitle: z.string().optional(),
  year: z.number().int().positive(),
  runtime: z.number().positive().describe('Minutes'),
  language: z.string(),
  genres: z.array(z.string()),

  // Description
  overview: z.string(),
  tagline: z.string().optional(),

  // Images
  posterUrl: z.string().url().optional(),
  backdropUrl: z.string().url().optional(),

  // Scores
  matchScore: z.number().min(0).max(1).describe('Overall match score'),
  utilityScore: z.number().min(0).max(1).describe('Expected utility'),
  vectorSimilarity: z.number().min(0).max(1).describe('Vector similarity'),
  causalUplift: z.number().optional().describe('Expected engagement boost'),

  // Breakdown
  scoreBreakdown: ScoreBreakdownSchema.optional(),

  // Provenance
  provenance: ProvenanceSchema.optional(),

  // Streaming
  deeplink: z.string().url().describe('Direct link to watch'),
  availability: AvailabilitySchema
});

/**
 * Reasoning schema
 */
export const ReasoningSchema = z.object({
  summary: z.string().describe('e.g. "Perfect for unwinding with a laugh"'),
  why: z.string().describe('e.g. "Based on your Friday evening patterns..."'),
  confidenceLevel: z.enum(['high', 'medium', 'low'])
});

/**
 * Metadata schema
 */
export const RecommendationMetadataSchema = z.object({
  requestId: z.string().uuid(),
  timestamp: z.string().datetime(),
  latency: z.number().min(0).describe('Milliseconds'),
  agentsInvolved: z.array(z.string()),
  skillsApplied: z.array(z.string()),
  candidatesEvaluated: z.number().int().min(0)
});

/**
 * Get recommendation output schema
 */
export const GetRecommendationOutputSchema = z.object({
  topPick: ContentItemSchema,
  alternatives: z.array(ContentItemSchema).optional(),
  reasoning: ReasoningSchema.optional(),
  metadata: RecommendationMetadataSchema
});

/**
 * Refine search input schema
 */
export const RefineSearchInputSchema = z.object({
  previousRequestId: z.string().uuid(),
  feedback: z.object({
    reason: z.enum(['too_long', 'wrong_mood', 'seen_it', 'not_interested', 'prefer_different']),
    detail: z.string().optional()
  }),
  additionalConstraints: ConstraintsSchema.optional()
});

/**
 * Refine search output schema
 */
export const RefineSearchOutputSchema = z.object({
  topPick: ContentItemSchema,
  alternatives: z.array(ContentItemSchema).optional(),
  reasoning: ReasoningSchema.optional(),
  metadata: RecommendationMetadataSchema.extend({
    refinementCount: z.number().int().min(1),
    learnedFrom: z.string().describe('What we learned from feedback')
  })
});

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Constraints
 */
export interface Constraints extends z.infer<typeof ConstraintsSchema> {}

/**
 * Request context
 */
export interface RequestContext extends z.infer<typeof RequestContextSchema> {}

/**
 * Request options
 */
export interface RequestOptions extends z.infer<typeof RequestOptionsSchema> {}

/**
 * Get recommendation input
 */
export interface GetRecommendationInput extends z.infer<typeof GetRecommendationInputSchema> {}

/**
 * Score breakdown
 */
export interface ScoreBreakdown extends z.infer<typeof ScoreBreakdownSchema> {}

/**
 * Provenance
 */
export interface Provenance extends z.infer<typeof ProvenanceSchema> {}

/**
 * Availability
 */
export interface Availability extends z.infer<typeof AvailabilitySchema> {}

/**
 * Content item
 */
export interface ContentItem extends z.infer<typeof ContentItemSchema> {}

/**
 * Reasoning
 */
export interface Reasoning extends z.infer<typeof ReasoningSchema> {}

/**
 * Recommendation metadata
 */
export interface RecommendationMetadata extends z.infer<typeof RecommendationMetadataSchema> {}

/**
 * Get recommendation output
 */
export interface GetRecommendationOutput extends z.infer<typeof GetRecommendationOutputSchema> {}

/**
 * Refine search input
 */
export interface RefineSearchInput extends z.infer<typeof RefineSearchInputSchema> {}

/**
 * Refine search output
 */
export interface RefineSearchOutput extends z.infer<typeof RefineSearchOutputSchema> {}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate get recommendation input
 */
export function validateGetRecommendationInput(input: unknown): GetRecommendationInput {
  return GetRecommendationInputSchema.parse(input);
}

/**
 * Validate get recommendation output
 */
export function validateGetRecommendationOutput(output: unknown): GetRecommendationOutput {
  return GetRecommendationOutputSchema.parse(output);
}

/**
 * Validate refine search input
 */
export function validateRefineSearchInput(input: unknown): RefineSearchInput {
  return RefineSearchInputSchema.parse(input);
}

/**
 * Validate refine search output
 */
export function validateRefineSearchOutput(output: unknown): RefineSearchOutput {
  return RefineSearchOutputSchema.parse(output);
}

/**
 * Create provenance from trajectory data
 */
export function createProvenance(
  evidenceCount: number,
  successRate: number,
  skillUsed?: string,
  reasoning?: string
): Provenance {
  // Calculate confidence interval (simple binomial approximation)
  const z = 1.96; // 95% confidence
  const p = successRate;
  const n = evidenceCount;
  const margin = z * Math.sqrt((p * (1 - p)) / n);

  const lower = Math.max(0, p - margin);
  const upper = Math.min(1, p + margin);

  return {
    evidenceTrajectories: evidenceCount,
    confidenceInterval: [lower, upper],
    similarUsersCompleted: `${Math.round(successRate * 100)}% of similar users completed`,
    skillUsed,
    reasoning: reasoning || 'Based on similar successful recommendations'
  };
}

/**
 * Calculate overall match score from breakdown
 */
export function calculateMatchScore(breakdown: ScoreBreakdown): number {
  const weights = {
    moodMatch: 0.30,
    intentMatch: 0.25,
    styleMatch: 0.20,
    contextMatch: 0.15,
    trendingBoost: 0.10,
    skillBoost: 0.00 // Dynamic weight when present
  };

  let totalWeight = 0;
  let weightedSum = 0;

  for (const [key, weight] of Object.entries(weights)) {
    const value = breakdown[key as keyof ScoreBreakdown];
    if (value !== undefined) {
      weightedSum += value * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Create content item from metadata
 */
export function createContentItem(
  id: string,
  title: string,
  metadata: {
    year: number;
    runtime: number;
    language: string;
    genres: string[];
    overview: string;
  },
  scores: {
    matchScore: number;
    utilityScore: number;
    vectorSimilarity: number;
  },
  deeplink: string,
  availability: Availability
): ContentItem {
  return {
    id,
    title,
    year: metadata.year,
    runtime: metadata.runtime,
    language: metadata.language,
    genres: metadata.genres,
    overview: metadata.overview,
    matchScore: scores.matchScore,
    utilityScore: scores.utilityScore,
    vectorSimilarity: scores.vectorSimilarity,
    deeplink,
    availability
  };
}

/**
 * Create recommendation metadata
 */
export function createRecommendationMetadata(
  requestId: string,
  latency: number,
  agentsInvolved: string[],
  skillsApplied: string[],
  candidatesEvaluated: number
): RecommendationMetadata {
  return {
    requestId,
    timestamp: new Date().toISOString(),
    latency,
    agentsInvolved,
    skillsApplied,
    candidatesEvaluated
  };
}

/**
 * Determine confidence level from score
 */
export function determineConfidenceLevel(
  matchScore: number,
  evidenceCount: number
): 'high' | 'medium' | 'low' {
  if (matchScore >= 0.8 && evidenceCount >= 10) return 'high';
  if (matchScore >= 0.6 && evidenceCount >= 5) return 'medium';
  return 'low';
}

/**
 * Generate reasoning summary from emotional state and content
 */
export function generateReasoningSummary(
  mood: 'unwind' | 'engage',
  goal: 'laugh' | 'feel' | 'thrill' | 'think',
  contentGenres: string[]
): string {
  const moodText = mood === 'unwind' ? 'unwinding' : 'engaging';
  const goalText = {
    laugh: 'with some laughs',
    feel: 'with emotional depth',
    thrill: 'with thrilling action',
    think: 'with thought-provoking content'
  }[goal];

  const genreText = contentGenres.length > 0
    ? ` This ${contentGenres[0]} `
    : ' This ';

  return `Perfect for ${moodText} ${goalText}.${genreText}matches your current mood.`;
}
