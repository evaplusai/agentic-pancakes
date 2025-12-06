/**
 * Match Agent
 *
 * Scores and ranks content candidates using the matching formula.
 * MVP: Static weighted formula
 * Phase 2: Dynamic utility-based scoring with ReasoningBank
 *
 * @module agents/match
 */

import { UniversalEmotionalState, ScoreBreakdown } from '../models/index.js';
import { ContentCandidate } from './catalog.js';

/**
 * Scored content candidate
 */
export interface ScoredCandidate extends ContentCandidate {
  scoreBreakdown?: ScoreBreakdown;
}

/**
 * Match Agent
 *
 * Responsible for:
 * - Calculating match scores using weighted formula
 * - Applying learned patterns from ReasoningBank (Phase 2)
 * - Ranking candidates by score
 * - Applying diversity constraints
 */
export class MatchAgent {
  // MVP: Static weights
  private readonly WEIGHT_VECTOR_SIM = 0.25;
  private readonly WEIGHT_MOOD = 0.30;
  private readonly WEIGHT_INTENT = 0.20;
  private readonly WEIGHT_CONTEXT = 0.15;
  private readonly WEIGHT_TRENDING = 0.10;

  constructor() {}

  /**
   * Score and rank content candidates
   */
  async score(
    candidates: ContentCandidate[],
    emotionalState: UniversalEmotionalState,
    trendingBoosts: Map<string, number>,
    userId: string
  ): Promise<ScoredCandidate[]> {
    try {
      console.log(`[Match] Scoring ${candidates.length} candidates`);

      // Score each candidate
      const scored: ScoredCandidate[] = [];

      for (const candidate of candidates) {
        const breakdown = this.calculateScoreBreakdown(
          candidate,
          emotionalState,
          trendingBoosts
        );

        const matchScore = this.calculateMatchScore(breakdown);
        const utilityScore = matchScore; // MVP: Same as match score

        scored.push({
          ...candidate,
          matchScore,
          utilityScore,
          scoreBreakdown: breakdown
        });
      }

      // Sort by match score (descending)
      scored.sort((a, b) => b.matchScore - a.matchScore);

      console.log(`[Match] Top score: ${scored[0]?.matchScore.toFixed(3)}, bottom score: ${scored[scored.length - 1]?.matchScore.toFixed(3)}`);

      return scored;

    } catch (error) {
      console.error(`[Match] Scoring failed:`, error);
      throw new Error(`Match scoring failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  /**
   * Calculate score breakdown for a candidate
   */
  private calculateScoreBreakdown(
    candidate: ContentCandidate,
    emotionalState: UniversalEmotionalState,
    trendingBoosts: Map<string, number>
  ): ScoreBreakdown {
    // Component 1: Vector similarity (already computed)
    const styleMatch = candidate.vectorSimilarity;

    // Component 2: Mood matching
    const moodMatch = this.calculateMoodMatch(candidate, emotionalState);

    // Component 3: Intent matching (needs alignment)
    const intentMatch = this.calculateIntentMatch(candidate, emotionalState);

    // Component 4: Context matching
    const contextMatch = this.calculateContextMatch(candidate, emotionalState);

    // Component 5: Trending boost
    const trendingBoost = trendingBoosts.get(candidate.metadata.contentId) || 0;

    return {
      moodMatch,
      intentMatch,
      styleMatch,
      contextMatch,
      trendingBoost
    };
  }

  /**
   * Calculate overall match score from breakdown
   */
  private calculateMatchScore(breakdown: ScoreBreakdown): number {
    const score = (
      breakdown.styleMatch * this.WEIGHT_VECTOR_SIM +
      breakdown.moodMatch * this.WEIGHT_MOOD +
      breakdown.intentMatch * this.WEIGHT_INTENT +
      breakdown.contextMatch * this.WEIGHT_CONTEXT +
      breakdown.trendingBoost * this.WEIGHT_TRENDING
    );

    return this.clamp(score, 0, 1);
  }

  /**
   * Calculate mood matching score
   */
  private calculateMoodMatch(
    candidate: ContentCandidate,
    emotionalState: UniversalEmotionalState
  ): number {
    // MVP: Simple genre-based mood matching
    const genres = candidate.metadata.genres.map(g => g.toLowerCase());

    // Map genres to mood scores
    const moodScores: Record<string, number> = {
      // High energy genres
      action: emotionalState.energy * 0.9,
      thriller: emotionalState.energy * 0.8 + emotionalState.arousal * 0.2,
      adventure: emotionalState.energy * 0.7,

      // Low energy genres
      drama: (1 - emotionalState.energy) * 0.7,
      documentary: (1 - emotionalState.energy) * 0.6,

      // Positive valence genres
      comedy: (emotionalState.valence + 1) / 2 * 0.9,
      romance: (emotionalState.valence + 1) / 2 * 0.8,
      family: (emotionalState.valence + 1) / 2 * 0.7,
      animation: (emotionalState.valence + 1) / 2 * 0.6,

      // Negative valence genres
      horror: (1 - (emotionalState.valence + 1) / 2) * 0.8,
      crime: (1 - (emotionalState.valence + 1) / 2) * 0.6,

      // High cognitive capacity genres
      mystery: emotionalState.cognitiveCapacity * 0.8,
      scifi: emotionalState.cognitiveCapacity * 0.7,

      // Neutral
      biography: 0.5,
      music: 0.5
    };

    // Calculate average mood score for candidate genres
    let totalScore = 0;
    let count = 0;

    for (const genre of genres) {
      if (moodScores[genre] !== undefined) {
        totalScore += moodScores[genre];
        count++;
      }
    }

    return count > 0 ? totalScore / count : 0.5;
  }

  /**
   * Calculate intent matching score (needs alignment)
   */
  private calculateIntentMatch(
    candidate: ContentCandidate,
    emotionalState: UniversalEmotionalState
  ): number {
    // MVP: Map genres to needs satisfaction
    const genres = candidate.metadata.genres.map(g => g.toLowerCase());
    const needs = emotionalState.needs;

    // Genre to need mapping
    const genreNeedMap: Record<string, Partial<typeof needs>> = {
      comedy: { joy: 0.9, relaxation: 0.7 },
      drama: { catharsis: 0.8, meaning: 0.7 },
      action: { stimulation: 0.9, escape: 0.7 },
      thriller: { stimulation: 0.8, escape: 0.6 },
      romance: { connection: 0.8, beauty: 0.6 },
      documentary: { growth: 0.9, meaning: 0.8 },
      horror: { stimulation: 0.7, catharsis: 0.5 },
      animation: { joy: 0.7, comfort: 0.6 },
      family: { connection: 0.8, comfort: 0.7 },
      scifi: { growth: 0.7, stimulation: 0.6 },
      fantasy: { escape: 0.9, beauty: 0.7 },
      biography: { growth: 0.7, meaning: 0.6 },
      crime: { stimulation: 0.6, meaning: 0.5 },
      mystery: { growth: 0.6, stimulation: 0.7 },
      adventure: { escape: 0.8, stimulation: 0.7 },
      music: { beauty: 0.8, joy: 0.6 }
    };

    // Calculate need satisfaction score
    let totalSatisfaction = 0;
    let totalNeeds = 0;

    for (const genre of genres) {
      const genreNeeds = genreNeedMap[genre];
      if (!genreNeeds) continue;

      for (const [need, satisfaction] of Object.entries(genreNeeds)) {
        const needStrength = needs[need as keyof typeof needs];
        totalSatisfaction += needStrength * satisfaction;
        totalNeeds += needStrength;
      }
    }

    return totalNeeds > 0 ? totalSatisfaction / totalNeeds : 0.5;
  }

  /**
   * Calculate context matching score
   */
  private calculateContextMatch(
    candidate: ContentCandidate,
    emotionalState: UniversalEmotionalState
  ): number {
    let score = 1.0;

    // Runtime constraint
    const runtime = candidate.metadata.runtime || 120;
    const cognitiveCapacity = emotionalState.cognitiveCapacity;

    if (cognitiveCapacity < 0.5 && runtime > 120) {
      // Penalize long content when tired
      score *= 0.5;
    } else if (cognitiveCapacity > 0.7 && runtime < 80) {
      // Slight penalty for short content when alert
      score *= 0.9;
    }

    // Social context constraint
    const social = emotionalState.context.social;
    const genres = candidate.metadata.genres.map(g => g.toLowerCase());

    if (social === 'family') {
      // Boost family-friendly content
      if (genres.includes('family') || genres.includes('animation')) {
        score *= 1.2;
      }
      // Penalize mature content
      if (genres.includes('horror') || genres.includes('crime')) {
        score *= 0.6;
      }
    }

    // Time of day context
    const timeOfDay = emotionalState.context.time.timeOfDay;

    if (timeOfDay === 'night') {
      // Prefer lighter content at night
      if (genres.includes('comedy') || genres.includes('romance')) {
        score *= 1.1;
      }
      if (genres.includes('horror') || genres.includes('thriller')) {
        score *= 0.8;
      }
    }

    return this.clamp(score, 0, 1);
  }

  /**
   * Clamp value between min and max
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Query learned weights from ReasoningBank
   * Phase 2: Dynamic weight learning
   */
  private async queryLearnedWeights(
    emotionalState: UniversalEmotionalState,
    userId: string
  ): Promise<Record<string, number> | null> {
    try {
      // Phase 2: Query AgentDB ReasoningBank
      // const patterns = await agentDB.reasoningBank.queryPatterns({
      //   emotionalState,
      //   userId,
      //   minConfidence: 0.75
      // });
      //
      // if (patterns.length > 0) {
      //   return patterns[0].weights;
      // }

      return null;

    } catch (error) {
      console.warn(`[Match] Failed to query learned weights:`, error);
      return null;
    }
  }
}
