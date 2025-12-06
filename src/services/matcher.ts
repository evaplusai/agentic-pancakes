/**
 * Matching Service
 *
 * Implements the scoring formula for matching content to user emotional state.
 * Coordinates with agents for ranking and diversification.
 *
 * @module services/matcher
 */

import { createLogger } from '../utils/logger.js';
import type { UniversalEmotionalState } from '../models/emotional-state.js';
import type { ContentVector } from '../models/content-vector.js';
import type { UserStyleVector } from '../models/user-vector.js';

const logger = createLogger('Matcher');

// ============================================================================
// Types
// ============================================================================

export interface ContentCandidate {
  vector: ContentVector;
  similarity: number;
  trendingBoost?: number;
}

export interface MatchingOptions {
  weights?: ScoringWeights;
  diversityFactor?: number;
  minScore?: number;
}

export interface ScoringWeights {
  vectorSim?: number;
  moodScore?: number;
  intentScore?: number;
  contextScore?: number;
  trendingScore?: number;
}

export interface RankedContent {
  vector: ContentVector;
  score: number;
  breakdown: {
    vectorSim: number;
    moodScore: number;
    intentScore: number;
    contextScore: number;
    trendingScore: number;
  };
  rank: number;
}

// ============================================================================
// Default Weights (MVP Static Formula)
// ============================================================================

const DEFAULT_WEIGHTS: Required<ScoringWeights> = {
  vectorSim: 0.25,
  moodScore: 0.30,
  intentScore: 0.20,
  contextScore: 0.15,
  trendingScore: 0.10
};

// ============================================================================
// Matcher Service
// ============================================================================

export class MatcherService {
  private weights: Required<ScoringWeights>;

  constructor(weights?: ScoringWeights) {
    this.weights = {
      ...DEFAULT_WEIGHTS,
      ...weights
    };

    logger.info('Matcher service initialized', {
      weights: this.weights
    });
  }

  /**
   * Score and rank content candidates
   */
  async score(
    candidates: ContentCandidate[],
    emotionalState: UniversalEmotionalState,
    userVector?: UserStyleVector
  ): Promise<RankedContent[]> {
    logger.debug('Scoring candidates', {
      candidateCount: candidates.length,
      hasUserVector: !!userVector
    });

    const scoredCandidates = candidates.map(candidate => {
      const breakdown = this.calculateScoreBreakdown(
        candidate,
        emotionalState,
        userVector
      );

      const totalScore = this.calculateTotalScore(breakdown);

      return {
        vector: candidate.vector,
        score: totalScore,
        breakdown,
        rank: 0 // Will be set after sorting
      };
    });

    // Sort by score descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Assign ranks
    scoredCandidates.forEach((candidate, index) => {
      candidate.rank = index + 1;
    });

    logger.debug('Scoring completed', {
      candidateCount: scoredCandidates.length,
      topScore: scoredCandidates[0]?.score,
      averageScore: scoredCandidates.reduce((sum, c) => sum + c.score, 0) / scoredCandidates.length
    });

    return scoredCandidates;
  }

  /**
   * Rank candidates with diversification
   */
  async rank(
    candidates: ContentCandidate[],
    emotionalState: UniversalEmotionalState,
    userVector?: UserStyleVector,
    options: MatchingOptions = {}
  ): Promise<RankedContent[]> {
    const { diversityFactor = 0.3, minScore = 0.0 } = options;

    // Score all candidates
    const scored = await this.score(candidates, emotionalState, userVector);

    // Filter by minimum score
    const filtered = scored.filter(c => c.score >= minScore);

    // Apply diversification
    const diversified = this.diversify(filtered, diversityFactor);

    logger.debug('Ranking completed', {
      total: candidates.length,
      filtered: filtered.length,
      final: diversified.length
    });

    return diversified;
  }

  /**
   * Calculate score breakdown
   */
  private calculateScoreBreakdown(
    candidate: ContentCandidate,
    emotionalState: UniversalEmotionalState,
    userVector?: UserStyleVector
  ): RankedContent['breakdown'] {
    return {
      vectorSim: candidate.similarity,
      moodScore: this.calculateMoodScore(candidate.vector, emotionalState),
      intentScore: this.calculateIntentScore(candidate.vector, emotionalState),
      contextScore: this.calculateContextScore(candidate.vector, emotionalState),
      trendingScore: candidate.trendingBoost || 0
    };
  }

  /**
   * Calculate total score from breakdown
   */
  private calculateTotalScore(breakdown: RankedContent['breakdown']): number {
    return (
      breakdown.vectorSim * this.weights.vectorSim +
      breakdown.moodScore * this.weights.moodScore +
      breakdown.intentScore * this.weights.intentScore +
      breakdown.contextScore * this.weights.contextScore +
      breakdown.trendingScore * this.weights.trendingScore
    );
  }

  /**
   * Calculate mood match score
   */
  private calculateMoodScore(
    contentVector: ContentVector,
    emotionalState: UniversalEmotionalState
  ): number {
    // Extract mood features from content vector (positions 576-639)
    const moodFeatures = contentVector.vector.slice(576, 640);

    // Map emotional state to mood preferences
    const preferredMoods = new Float32Array(64);

    // Energy level influences mood preference
    if (emotionalState.energy < 0.3) {
      // Low energy: prefer calm, relaxing moods
      for (let i = 0; i < 64; i++) {
        preferredMoods[i] = 0.2 + (i % 8) * 0.1;
      }
    } else if (emotionalState.energy > 0.7) {
      // High energy: prefer intense, exciting moods
      for (let i = 0; i < 64; i++) {
        preferredMoods[i] = 0.8 - (i % 8) * 0.05;
      }
    } else {
      // Medium energy: balanced preferences
      for (let i = 0; i < 64; i++) {
        preferredMoods[i] = 0.5;
      }
    }

    // Calculate cosine similarity
    return this.cosineSimilarity(moodFeatures, preferredMoods);
  }

  /**
   * Calculate intent match score
   */
  private calculateIntentScore(
    contentVector: ContentVector,
    emotionalState: UniversalEmotionalState
  ): number {
    // Map emotional needs to content suitability
    const needs = emotionalState.needs;

    // Genre-based intent matching
    const genres = contentVector.metadata.genres || [];
    let score = 0;
    let count = 0;

    const genreIntentMap: Record<string, keyof typeof needs> = {
      comedy: 'joy',
      drama: 'catharsis',
      action: 'stimulation',
      thriller: 'stimulation',
      romance: 'connection',
      documentary: 'growth',
      horror: 'catharsis',
      scifi: 'growth',
      fantasy: 'escape'
    };

    for (const genre of genres) {
      const intent = genreIntentMap[genre.toLowerCase()];
      if (intent && needs[intent] !== undefined) {
        score += needs[intent];
        count++;
      }
    }

    return count > 0 ? score / count : 0.5;
  }

  /**
   * Calculate context match score
   */
  private calculateContextScore(
    contentVector: ContentVector,
    emotionalState: UniversalEmotionalState
  ): number {
    let score = 0.5; // Base score

    const context = emotionalState.context;
    const metadata = contentVector.metadata;

    // Time of day matching
    if (context.time.timeOfDay === 'night' || context.time.timeOfDay === 'evening') {
      // Prefer shorter content at night
      if (metadata.runtime && metadata.runtime < 90) {
        score += 0.2;
      }
    }

    // Social context matching
    if (context.social === 'family') {
      // Prefer family-friendly content
      if (metadata.genres.includes('family') || metadata.genres.includes('animation')) {
        score += 0.3;
      }
    }

    // Device matching
    if (context.device.type === 'mobile') {
      // Prefer shorter content on mobile
      if (metadata.runtime && metadata.runtime < 60) {
        score += 0.2;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Diversify results to avoid too similar recommendations
   */
  private diversify(
    ranked: RankedContent[],
    diversityFactor: number
  ): RankedContent[] {
    if (ranked.length <= 4) {
      return ranked;
    }

    const diversified: RankedContent[] = [];
    const remaining = [...ranked];

    // Always include top result
    diversified.push(remaining.shift()!);

    // Add diverse alternatives
    while (diversified.length < 4 && remaining.length > 0) {
      let bestIndex = 0;
      let bestDiversityScore = -1;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];

        // Calculate diversity score (distance from already selected)
        let minSimilarity = 1;
        for (const selected of diversified) {
          const similarity = this.contentSimilarity(
            candidate.vector,
            selected.vector
          );
          minSimilarity = Math.min(minSimilarity, similarity);
        }

        // Combined score: quality + diversity
        const diversityScore =
          candidate.score * (1 - diversityFactor) +
          (1 - minSimilarity) * diversityFactor;

        if (diversityScore > bestDiversityScore) {
          bestDiversityScore = diversityScore;
          bestIndex = i;
        }
      }

      diversified.push(remaining.splice(bestIndex, 1)[0]);
    }

    return diversified;
  }

  /**
   * Calculate similarity between two content vectors
   */
  private contentSimilarity(v1: ContentVector, v2: ContentVector): number {
    return this.cosineSimilarity(v1.vector, v2.vector);
  }

  /**
   * Calculate cosine similarity
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

  /**
   * Update scoring weights
   */
  setWeights(weights: ScoringWeights): void {
    this.weights = {
      ...this.weights,
      ...weights
    };

    logger.info('Scoring weights updated', { weights: this.weights });
  }

  /**
   * Get current scoring weights
   */
  getWeights(): Required<ScoringWeights> {
    return { ...this.weights };
  }
}

// ============================================================================
// Default Service Instance
// ============================================================================

let defaultMatcher: MatcherService | undefined;

/**
 * Get default matcher instance
 */
export function getMatcher(): MatcherService {
  if (!defaultMatcher) {
    defaultMatcher = new MatcherService();
  }
  return defaultMatcher;
}

/**
 * Score candidates using default service
 */
export async function scoreCandidates(
  candidates: ContentCandidate[],
  emotionalState: UniversalEmotionalState,
  userVector?: UserStyleVector
): Promise<RankedContent[]> {
  return getMatcher().score(candidates, emotionalState, userVector);
}

/**
 * Rank candidates using default service
 */
export async function rankCandidates(
  candidates: ContentCandidate[],
  emotionalState: UniversalEmotionalState,
  userVector?: UserStyleVector,
  options?: MatchingOptions
): Promise<RankedContent[]> {
  return getMatcher().rank(candidates, emotionalState, userVector, options);
}
