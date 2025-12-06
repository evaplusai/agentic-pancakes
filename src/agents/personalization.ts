/**
 * Personalization Agent
 *
 * Applies user preferences and history to adjust recommendation scores.
 * Works with the Match Agent to provide personalized content rankings.
 *
 * @module agents/personalization
 */

import { createLogger } from '../utils/logger.js';
import { getUserService, UserService } from '../services/user-service.js';
import type { ContentCandidate } from './catalog.js';
import type { MockContent } from '../data/mock-content.js';
import { ALL_MOCK_CONTENT } from '../data/mock-content.js';

const logger = createLogger('PersonalizationAgent');

// ============================================================================
// Types
// ============================================================================

export interface PersonalizationContext {
  userId: string;
  currentMood: 'unwind' | 'engage';
  currentTone: 'laugh' | 'feel' | 'thrill' | 'think';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  social?: 'alone' | 'partner' | 'friends' | 'family';
}

export interface PersonalizedCandidate extends ContentCandidate {
  personalizedScore: number;
  personalizationFactors: {
    genreBoost: number;
    historyPenalty: number;
    preferenceAlignment: number;
    noveltyBonus: number;
  };
}

// ============================================================================
// Personalization Agent
// ============================================================================

export class PersonalizationAgent {
  private userService: UserService;

  constructor(userService?: UserService) {
    this.userService = userService || getUserService();
    logger.info('PersonalizationAgent initialized');
  }

  /**
   * Apply personalization to candidates
   */
  personalize(
    candidates: ContentCandidate[],
    context: PersonalizationContext
  ): PersonalizedCandidate[] {
    logger.debug('Personalizing candidates', {
      userId: context.userId,
      candidateCount: candidates.length
    });

    const weights = this.userService.getPersonalizationWeights(context.userId);
    const profile = this.userService.getUser(context.userId);

    return candidates.map(candidate => {
      const content = ALL_MOCK_CONTENT.find(c => c.id === candidate.metadata.contentId);

      // Calculate personalization factors
      const genreBoost = this.calculateGenreBoost(
        candidate.metadata.genres,
        weights.genreWeights
      );

      const historyPenalty = weights.excludeIds.has(candidate.metadata.contentId)
        ? -0.3
        : 0;

      const preferenceAlignment = this.calculatePreferenceAlignment(
        content,
        weights.moodWeight,
        weights.toneWeight,
        context
      );

      const noveltyBonus = this.calculateNoveltyBonus(
        candidate.metadata.contentId,
        candidate.metadata.genres,
        profile?.preferences.favoriteGenres.map(g => g.genre) || []
      );

      // Combine factors
      const personalizedScore = Math.max(0, Math.min(1,
        candidate.matchScore +
        genreBoost * 0.15 +
        historyPenalty +
        preferenceAlignment * 0.1 +
        noveltyBonus * 0.05
      ));

      return {
        ...candidate,
        personalizedScore,
        personalizationFactors: {
          genreBoost,
          historyPenalty,
          preferenceAlignment,
          noveltyBonus
        }
      };
    }).sort((a, b) => b.personalizedScore - a.personalizedScore);
  }

  /**
   * Calculate genre preference boost
   */
  private calculateGenreBoost(
    genres: string[],
    genreWeights: Map<string, number>
  ): number {
    if (genres.length === 0 || genreWeights.size === 0) return 0;

    let totalWeight = 0;
    let matchCount = 0;

    for (const genre of genres) {
      const weight = genreWeights.get(genre);
      if (weight !== undefined) {
        totalWeight += weight;
        matchCount++;
      }
    }

    return matchCount > 0 ? totalWeight / matchCount : 0;
  }

  /**
   * Calculate mood/tone preference alignment
   */
  private calculatePreferenceAlignment(
    content: MockContent | undefined,
    moodWeight: { unwind: number; engage: number },
    toneWeight: { laugh: number; feel: number; thrill: number; think: number },
    context: PersonalizationContext
  ): number {
    if (!content) return 0;

    // Score based on how well content matches user's historical preferences
    const moodScore = moodWeight[content.mood] || 0.5;
    const toneScore = toneWeight[content.tone] || 0.25;

    // Bonus if content matches current mood/tone request
    const currentMoodMatch = content.mood === context.currentMood ? 0.2 : 0;
    const currentToneMatch = content.tone === context.currentTone ? 0.2 : 0;

    return (moodScore + toneScore) / 2 + currentMoodMatch + currentToneMatch;
  }

  /**
   * Calculate novelty bonus for content diversity
   */
  private calculateNoveltyBonus(
    _contentId: string,
    genres: string[],
    userGenres: string[]
  ): number {
    // Give bonus to content from genres user hasn't explored much
    const newGenreCount = genres.filter(g => !userGenres.includes(g)).length;

    if (newGenreCount > 0) {
      return Math.min(0.3, newGenreCount * 0.1);
    }

    return 0;
  }

  /**
   * Get personalized recommendations for "Continue Watching"
   */
  getContinueWatching(userId: string, limit = 5): MockContent[] {
    const profile = this.userService.getUser(userId);
    if (!profile) return [];

    // Find content that was started but not completed
    const incomplete = profile.watchHistory
      .filter(entry => entry.completionRate > 0.1 && entry.completionRate < 0.9)
      .slice(0, limit);

    return incomplete
      .map(entry => ALL_MOCK_CONTENT.find(c => c.id === entry.contentId))
      .filter((c): c is MockContent => c !== undefined);
  }

  /**
   * Get "Because You Watched" recommendations
   */
  getBecauseYouWatched(userId: string, limit = 5): { source: MockContent; recommendations: MockContent[] }[] {
    const profile = this.userService.getUser(userId);
    if (!profile) return [];

    const results: { source: MockContent; recommendations: MockContent[] }[] = [];

    // Get highly rated watched content
    const highlyRated = profile.watchHistory
      .filter(entry => entry.completionRate > 0.7 || (entry.rating && entry.rating >= 4))
      .slice(0, 3);

    for (const entry of highlyRated) {
      const source = ALL_MOCK_CONTENT.find(c => c.id === entry.contentId);
      if (!source) continue;

      // Find similar content
      const similar = this.findSimilarContent(source, profile.watchHistory.map(e => e.contentId))
        .slice(0, limit);

      if (similar.length > 0) {
        results.push({ source, recommendations: similar });
      }
    }

    return results;
  }

  /**
   * Find similar content based on mood, tone, and genres
   */
  private findSimilarContent(source: MockContent, excludeIds: string[]): MockContent[] {
    const excludeSet = new Set(excludeIds);

    return ALL_MOCK_CONTENT
      .filter(c => !excludeSet.has(c.id))
      .map(content => ({
        content,
        similarity: this.calculateContentSimilarity(source, content)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
      .map(item => item.content);
  }

  /**
   * Calculate similarity between two content items
   */
  private calculateContentSimilarity(a: MockContent, b: MockContent): number {
    let score = 0;

    // Same mood
    if (a.mood === b.mood) score += 0.3;

    // Same tone
    if (a.tone === b.tone) score += 0.3;

    // Genre overlap
    const genreOverlap = a.genres.filter(g => b.genres.includes(g)).length;
    score += (genreOverlap / Math.max(a.genres.length, b.genres.length)) * 0.4;

    return score;
  }

  /**
   * Get content from user's watchlist
   */
  getWatchlistContent(userId: string): MockContent[] {
    const profile = this.userService.getUser(userId);
    if (!profile) return [];

    return profile.watchlist
      .map(id => ALL_MOCK_CONTENT.find(c => c.id === id))
      .filter((c): c is MockContent => c !== undefined);
  }

  /**
   * Get trending content personalized to user
   */
  getTrendingForUser(userId: string, limit = 10): MockContent[] {
    const profile = this.userService.getUser(userId);
    const trending = ALL_MOCK_CONTENT.filter(c => c.isTrending);

    if (!profile) {
      return trending.slice(0, limit);
    }

    const weights = this.userService.getPersonalizationWeights(userId);

    // Score and sort trending content by user preferences
    return trending
      .filter(c => !weights.excludeIds.has(c.id))
      .map(content => ({
        content,
        score: this.calculateGenreBoost(content.genres, weights.genreWeights) +
               (weights.moodWeight[content.mood] || 0) * 0.3 +
               (weights.toneWeight[content.tone] || 0) * 0.2
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.content);
  }
}

// ============================================================================
// Default Instance
// ============================================================================

let defaultPersonalizationAgent: PersonalizationAgent | undefined;

/**
 * Get default personalization agent
 */
export function getPersonalizationAgent(): PersonalizationAgent {
  if (!defaultPersonalizationAgent) {
    defaultPersonalizationAgent = new PersonalizationAgent();
  }
  return defaultPersonalizationAgent;
}
