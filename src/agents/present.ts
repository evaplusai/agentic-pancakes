/**
 * Present Agent
 *
 * Formats final recommendation output with provenance and explanations.
 * Generates human-readable reasoning for why content was recommended.
 *
 * @module agents/present
 */

import {
  UniversalEmotionalState,
  ContentItem,
  Reasoning,
  Provenance,
  createProvenance,
  determineConfidenceLevel,
  Availability
} from '../models/index.js';
import { ScoredCandidate } from './match.js';

/**
 * Present Agent output
 */
export interface PresentOutput {
  topPick: ContentItem;
  alternatives: ContentItem[];
  reasoning: Reasoning;
}

/**
 * Present Agent
 *
 * Responsible for:
 * - Formatting scored candidates as ContentItems
 * - Generating provenance information
 * - Creating human-readable explanations
 * - Generating deeplinks to content
 */
export class PresentAgent {
  constructor() {}

  /**
   * Format recommendation output
   */
  async format(
    topPick: ScoredCandidate,
    alternatives: ScoredCandidate[],
    emotionalState: UniversalEmotionalState,
    userId: string
  ): Promise<PresentOutput> {
    try {
      console.log(`[Present] Formatting recommendation output`);

      // Format top pick
      const formattedTopPick = await this.formatContentItem(topPick, emotionalState, userId);

      // Format alternatives
      const formattedAlternatives = await Promise.all(
        alternatives.map(alt => this.formatContentItem(alt, emotionalState, userId))
      );

      // Generate reasoning
      const reasoning = this.generateReasoning(topPick, emotionalState, userId);

      console.log(`[Present] Formatted 1 top pick + ${formattedAlternatives.length} alternatives`);

      return {
        topPick: formattedTopPick,
        alternatives: formattedAlternatives,
        reasoning
      };

    } catch (error) {
      console.error(`[Present] Formatting failed:`, error);
      throw new Error(`Present formatting failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  /**
   * Format scored candidate as ContentItem
   */
  private async formatContentItem(
    candidate: ScoredCandidate,
    emotionalState: UniversalEmotionalState,
    _userId: string
  ): Promise<ContentItem> {
    // Generate provenance
    const provenance = await this.generateProvenance(candidate, emotionalState);

    // Generate deeplink
    const deeplink = this.generateDeeplink(candidate);

    // Get availability
    const availability = this.getAvailability(candidate);

    return {
      id: candidate.metadata.contentId,
      title: candidate.metadata.title,
      originalTitle: candidate.metadata.title,
      year: candidate.metadata.year || 2020,
      runtime: candidate.metadata.runtime || 120,
      language: candidate.metadata.language,
      genres: candidate.metadata.genres,
      overview: candidate.metadata.overview || '',
      posterUrl: candidate.metadata.posterPath,
      backdropUrl: candidate.metadata.backdropPath,
      matchScore: candidate.matchScore,
      utilityScore: candidate.utilityScore,
      vectorSimilarity: candidate.vectorSimilarity,
      scoreBreakdown: candidate.scoreBreakdown,
      provenance,
      deeplink,
      availability
    };
  }

  /**
   * Generate provenance information
   */
  private async generateProvenance(
    candidate: ScoredCandidate,
    emotionalState: UniversalEmotionalState
  ): Promise<Provenance> {
    try {
      // Phase 2: Query AgentDB ReasoningBank for trajectory evidence
      // const trajectories = await agentDB.reasoningBank.queryTrajectories({
      //   contentId: candidate.metadata.contentId,
      //   emotionalStateThreshold: 0.7,
      //   minSatisfaction: 0.7
      // });
      //
      // const successRate = trajectories.filter(t => t.verdict.success).length / trajectories.length;
      // const evidenceCount = trajectories.length;

      // MVP: Use mock provenance
      const evidenceCount = Math.floor(Math.random() * 50) + 10;
      const successRate = 0.7 + Math.random() * 0.25; // 70-95%

      const reasoning = this.generateProvenanceReasoning(candidate, emotionalState);

      return createProvenance(evidenceCount, successRate, undefined, reasoning);

    } catch (error) {
      console.warn(`[Present] Failed to generate provenance:`, error);
      return createProvenance(0, 0.5, undefined, 'Based on content similarity');
    }
  }

  /**
   * Generate provenance reasoning text
   */
  private generateProvenanceReasoning(
    candidate: ScoredCandidate,
    emotionalState: UniversalEmotionalState
  ): string {
    const genres = candidate.metadata.genres;
    const primaryNeed = this.getPrimaryNeed(emotionalState);
    const timeOfDay = emotionalState.context.time.timeOfDay;

    let reasoning = `This ${genres[0]?.toLowerCase() || 'content'} matches your need for ${primaryNeed}`;

    if (timeOfDay === 'evening' || timeOfDay === 'night') {
      reasoning += ` and is perfect for ${timeOfDay} viewing`;
    }

    if (emotionalState.context.social !== 'alone') {
      reasoning += ` with ${emotionalState.context.social}`;
    }

    reasoning += '.';

    return reasoning;
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(
    candidate: ScoredCandidate,
    emotionalState: UniversalEmotionalState,
    _userId: string
  ): Reasoning {
    const mood = emotionalState.energy > 0.5 ? 'engage' : 'unwind';
    const primaryNeed = this.getPrimaryNeed(emotionalState);
    const genres = candidate.metadata.genres;

    // Generate summary
    const summary = this.generateSummary(mood, primaryNeed, genres);

    // Generate why explanation
    const why = this.generateWhyExplanation(candidate, emotionalState);

    // Determine confidence level
    const confidenceLevel = determineConfidenceLevel(
      candidate.matchScore,
      10 // MVP: Mock evidence count
    );

    return {
      summary,
      why,
      confidenceLevel
    };
  }

  /**
   * Generate summary text
   */
  private generateSummary(
    mood: string,
    primaryNeed: string,
    genres: string[]
  ): string {
    const genreText = genres[0]?.toLowerCase() || 'content';

    if (mood === 'unwind') {
      if (primaryNeed === 'joy' || primaryNeed === 'relaxation') {
        return `Perfect for unwinding with some lighthearted ${genreText}`;
      } else {
        return `A great choice to relax and ${primaryNeed === 'catharsis' ? 'feel deeply' : 'unwind'}`;
      }
    } else {
      if (primaryNeed === 'stimulation') {
        return `An engaging ${genreText} that will keep you on the edge of your seat`;
      } else if (primaryNeed === 'growth') {
        return `A thought-provoking ${genreText} that will make you think`;
      } else {
        return `An engaging ${genreText} that matches your current mood`;
      }
    }
  }

  /**
   * Generate why explanation
   */
  private generateWhyExplanation(
    candidate: ScoredCandidate,
    emotionalState: UniversalEmotionalState
  ): string {
    const timeOfDay = emotionalState.context.time.timeOfDay;
    const dayOfWeek = emotionalState.context.time.dayOfWeek;
    const social = emotionalState.context.social;
    const breakdown = candidate.scoreBreakdown;

    let reasons: string[] = [];

    // Time-based reasoning
    if (timeOfDay === 'evening' && dayOfWeek === 'friday') {
      reasons.push('perfect for Friday evening');
    } else if (timeOfDay === 'night') {
      reasons.push('ideal for late-night viewing');
    } else if (emotionalState.context.time.isWeekend) {
      reasons.push('great for weekend relaxation');
    }

    // Social context reasoning
    if (social === 'family') {
      reasons.push('suitable for family viewing');
    } else if (social === 'partner') {
      reasons.push('great for watching together');
    } else if (social === 'alone') {
      reasons.push('perfect for solo viewing');
    }

    // Score-based reasoning
    if (breakdown && breakdown.moodMatch > 0.8) {
      reasons.push('strong mood match');
    }

    if (breakdown && breakdown.trendingBoost > 0.5) {
      reasons.push('currently trending');
    }

    if (reasons.length === 0) {
      reasons.push('matches your preferences');
    }

    return `Based on ${reasons.join(', ')}.`;
  }

  /**
   * Generate deeplink to content
   */
  private generateDeeplink(candidate: ScoredCandidate): string {
    // Use streaming URL if available
    if (candidate.metadata.streamingUrl) {
      return candidate.metadata.streamingUrl;
    }

    // Generate default TMDB link
    const contentId = candidate.metadata.streamingId || candidate.metadata.contentId;
    return `https://www.themoviedb.org/movie/${contentId}`;
  }

  /**
   * Get content availability
   */
  private getAvailability(_candidate: ScoredCandidate): Availability {
    // MVP: All content available in France
    return {
      regions: ['FR'],
      expiresAt: undefined
    };
  }

  /**
   * Get primary emotional need
   */
  private getPrimaryNeed(state: UniversalEmotionalState): string {
    const needs = state.needs;
    let maxNeed = 'comfort';
    let maxValue = 0;

    for (const [need, value] of Object.entries(needs)) {
      if (value > maxValue) {
        maxValue = value;
        maxNeed = need;
      }
    }

    return maxNeed;
  }
}
