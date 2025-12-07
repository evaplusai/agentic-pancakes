/**
 * Reflexion Memory Service - Phase 2 L2
 *
 * Implements episode storage with self-critique to ensure the system
 * never repeats the same mistakes. Records failed recommendations
 * and the reasons they failed, then uses this history to filter
 * future recommendations.
 *
 * Key Features:
 * - Episode storage: Records recommendation episodes with detailed context
 * - Self-critique: Analyzes failures and generates improvement insights
 * - Mistake avoidance: Prevents recommending content that failed for similar contexts
 * - Reflection summaries: Periodic analysis of failure patterns
 *
 * @module services/reflexion-memory
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('ReflexionMemory');

// ============================================================================
// Types
// ============================================================================

export interface Episode {
  id: string;
  timestamp: string;
  userId: string;
  context: EpisodeContext;
  recommendation: EpisodeRecommendation;
  outcome: EpisodeOutcome;
  critique: SelfCritique;
}

export interface EpisodeContext {
  mood: string;
  tone: string;
  timeOfDay: string;
  dayOfWeek: string;
  previousWatched: string[];
  sessionDuration: number; // minutes
  deviceType: string;
}

export interface EpisodeRecommendation {
  contentId: number;
  title: string;
  genres: string[];
  vectorSimilarity: number;
  rank: number; // 1 = top pick, 2 = alt 1, 3 = alt 2
  reasoning: string;
}

export interface EpisodeOutcome {
  action: 'clicked' | 'watched' | 'skipped' | 'dismissed' | 'ignored';
  completionPercent: number;
  timeToDecision: number; // seconds
  feedback?: string;
  rating?: number;
}

export interface SelfCritique {
  wasSuccess: boolean;
  failureType?: FailureType;
  analysis: string;
  improvements: string[];
  shouldAvoid: AvoidanceRule[];
  confidenceInAnalysis: number;
}

export type FailureType =
  | 'mood_mismatch'      // Content didn't match stated mood
  | 'genre_fatigue'      // User tired of this genre
  | 'repeat_content'     // Similar to recently watched
  | 'wrong_tone'         // Tone was off (too intense, too light)
  | 'poor_timing'        // Wrong time of day for this content
  | 'bad_recommendation' // Generally poor match
  | 'user_preference'    // Violated known user preferences
  | 'quality_issue';     // Low quality content

export interface AvoidanceRule {
  type: 'content' | 'genre' | 'tone' | 'pattern';
  value: string;
  context: string; // When to apply this rule
  duration: 'session' | 'day' | 'week' | 'permanent';
  confidence: number;
}

export interface ReflectionSummary {
  periodStart: string;
  periodEnd: string;
  totalEpisodes: number;
  successRate: number;
  commonFailures: { type: FailureType; count: number; percentage: number }[];
  topImprovements: string[];
  activeAvoidances: AvoidanceRule[];
}

// ============================================================================
// Reflexion Memory Service
// ============================================================================

export class ReflexionMemory {
  private episodes: Map<string, Episode> = new Map();
  private avoidanceRules: Map<string, AvoidanceRule> = new Map();
  private failurePatterns: Map<string, number> = new Map();

  constructor() {
    logger.info('ReflexionMemory initialized');
  }

  // ==========================================================================
  // Episode Recording
  // ==========================================================================

  /**
   * Record a recommendation episode with its outcome
   */
  recordEpisode(
    userId: string,
    context: EpisodeContext,
    recommendation: EpisodeRecommendation,
    outcome: EpisodeOutcome
  ): Episode {
    const critique = this.generateSelfCritique(context, recommendation, outcome);

    const episode: Episode = {
      id: `ep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      userId,
      context,
      recommendation,
      outcome,
      critique,
    };

    this.episodes.set(episode.id, episode);

    // If it was a failure, update avoidance rules
    if (!critique.wasSuccess) {
      this.updateAvoidanceRules(episode);
      this.trackFailurePattern(critique.failureType!);
    }

    logger.info('Episode recorded', {
      id: episode.id,
      success: critique.wasSuccess,
      failureType: critique.failureType,
    });

    return episode;
  }

  // ==========================================================================
  // Self-Critique Generation
  // ==========================================================================

  /**
   * Generate self-critique for an episode
   */
  private generateSelfCritique(
    context: EpisodeContext,
    recommendation: EpisodeRecommendation,
    outcome: EpisodeOutcome
  ): SelfCritique {
    const wasSuccess = this.determineSuccess(outcome);

    if (wasSuccess) {
      return {
        wasSuccess: true,
        analysis: `Recommendation worked well. User ${outcome.action} with ${outcome.completionPercent}% completion.`,
        improvements: [],
        shouldAvoid: [],
        confidenceInAnalysis: 0.9,
      };
    }

    // Analyze the failure
    const failureType = this.classifyFailure(context, recommendation, outcome);
    const analysis = this.analyzeFailure(failureType, context, recommendation, outcome);
    const improvements = this.generateImprovements(failureType, context, recommendation);
    const shouldAvoid = this.generateAvoidanceRules(failureType, context, recommendation);

    return {
      wasSuccess: false,
      failureType,
      analysis,
      improvements,
      shouldAvoid,
      confidenceInAnalysis: this.calculateAnalysisConfidence(outcome),
    };
  }

  /**
   * Determine if outcome was a success
   */
  private determineSuccess(outcome: EpisodeOutcome): boolean {
    if (outcome.action === 'skipped' || outcome.action === 'dismissed' || outcome.action === 'ignored') {
      return false;
    }
    if (outcome.action === 'clicked' && outcome.completionPercent < 30) {
      return false;
    }
    if (outcome.rating !== undefined && outcome.rating <= 2) {
      return false;
    }
    return true;
  }

  /**
   * Classify the type of failure
   */
  private classifyFailure(
    context: EpisodeContext,
    recommendation: EpisodeRecommendation,
    outcome: EpisodeOutcome
  ): FailureType {
    // Quick dismissal suggests mood mismatch
    if (outcome.timeToDecision < 3 && outcome.action === 'dismissed') {
      return 'mood_mismatch';
    }

    // Check for genre fatigue (same genre in previous watched)
    const recentGenres = context.previousWatched; // Simplified - would parse genres in production
    if (recommendation.genres.some(g => recentGenres.includes(g))) {
      return 'genre_fatigue';
    }

    // Check tone mismatch
    if (context.tone === 'laugh' && !recommendation.genres.includes('Comedy')) {
      return 'wrong_tone';
    }
    if (context.tone === 'reflect' && recommendation.genres.includes('Comedy')) {
      return 'wrong_tone';
    }

    // Time-based failures
    if (context.timeOfDay === 'night' && recommendation.genres.includes('Horror')) {
      // Some users don't want scary content at night
      return 'poor_timing';
    }

    // Low vector similarity is just a bad match
    if (recommendation.vectorSimilarity < 0.5) {
      return 'bad_recommendation';
    }

    // Negative rating means user preference violation
    if (outcome.rating !== undefined && outcome.rating <= 2) {
      return 'user_preference';
    }

    return 'bad_recommendation';
  }

  /**
   * Analyze failure in natural language
   */
  private analyzeFailure(
    failureType: FailureType,
    context: EpisodeContext,
    recommendation: EpisodeRecommendation,
    outcome: EpisodeOutcome
  ): string {
    const analyses: Record<FailureType, string> = {
      mood_mismatch: `User in "${context.mood}" mood quickly dismissed "${recommendation.title}". The content likely didn't match their emotional state.`,
      genre_fatigue: `User may be tired of ${recommendation.genres.join('/')} content. Recent watches included similar genres.`,
      repeat_content: `"${recommendation.title}" was too similar to recently watched content.`,
      wrong_tone: `The tone of "${recommendation.title}" (${recommendation.genres.join(', ')}) didn't match the requested "${context.tone}" tone.`,
      poor_timing: `Recommending ${recommendation.genres[0]} content at ${context.timeOfDay} wasn't appropriate for this user.`,
      bad_recommendation: `"${recommendation.title}" with ${Math.round(recommendation.vectorSimilarity * 100)}% similarity wasn't a good match.`,
      user_preference: `User rated "${recommendation.title}" ${outcome.rating}/5, indicating it violated their preferences.`,
      quality_issue: `"${recommendation.title}" may have quality issues based on user's quick abandonment.`,
    };

    return analyses[failureType];
  }

  /**
   * Generate improvement suggestions
   */
  private generateImprovements(
    failureType: FailureType,
    context: EpisodeContext,
    recommendation: EpisodeRecommendation
  ): string[] {
    const improvements: string[] = [];

    switch (failureType) {
      case 'mood_mismatch':
        improvements.push(`Weight mood-matching higher for "${context.mood}" requests`);
        improvements.push(`Consider user's historical mood-content preferences`);
        break;
      case 'genre_fatigue':
        improvements.push(`Increase diversity penalty when recent watches include ${recommendation.genres[0]}`);
        improvements.push(`Track genre consumption patterns per session`);
        break;
      case 'wrong_tone':
        improvements.push(`Map tone "${context.tone}" more strictly to appropriate genres`);
        improvements.push(`Exclude ${recommendation.genres[0]} from "${context.tone}" tone requests`);
        break;
      case 'poor_timing':
        improvements.push(`Build time-of-day preference model for this user`);
        improvements.push(`Consider ${context.timeOfDay} as a stronger filter signal`);
        break;
      case 'bad_recommendation':
        improvements.push(`Increase minimum similarity threshold from current level`);
        improvements.push(`Review vector embedding quality for "${recommendation.title}"`);
        break;
      case 'user_preference':
        improvements.push(`Add "${recommendation.title}" to user's dislike list`);
        improvements.push(`Reduce weight for ${recommendation.genres[0]} genre`);
        break;
    }

    return improvements;
  }

  /**
   * Generate avoidance rules from failure
   */
  private generateAvoidanceRules(
    failureType: FailureType,
    context: EpisodeContext,
    recommendation: EpisodeRecommendation
  ): AvoidanceRule[] {
    const rules: AvoidanceRule[] = [];

    // Always avoid this specific content for this context
    rules.push({
      type: 'content',
      value: recommendation.title,
      context: `mood=${context.mood},tone=${context.tone}`,
      duration: 'week',
      confidence: 0.9,
    });

    switch (failureType) {
      case 'genre_fatigue':
        rules.push({
          type: 'genre',
          value: recommendation.genres[0],
          context: `previousWatched=${context.previousWatched.slice(0, 3).join(',')}`,
          duration: 'session',
          confidence: 0.7,
        });
        break;
      case 'wrong_tone':
        rules.push({
          type: 'tone',
          value: `${recommendation.genres[0]}_for_${context.tone}`,
          context: `tone=${context.tone}`,
          duration: 'permanent',
          confidence: 0.8,
        });
        break;
      case 'poor_timing':
        rules.push({
          type: 'pattern',
          value: `${recommendation.genres[0]}_at_${context.timeOfDay}`,
          context: `timeOfDay=${context.timeOfDay}`,
          duration: 'permanent',
          confidence: 0.6,
        });
        break;
    }

    return rules;
  }

  /**
   * Calculate confidence in our analysis
   */
  private calculateAnalysisConfidence(outcome: EpisodeOutcome): number {
    let confidence = 0.5;

    // Explicit feedback increases confidence
    if (outcome.feedback) confidence += 0.2;
    if (outcome.rating !== undefined) confidence += 0.15;

    // Clear actions increase confidence
    if (outcome.action === 'dismissed') confidence += 0.1;
    if (outcome.completionPercent === 0) confidence += 0.1;

    return Math.min(1, confidence);
  }

  // ==========================================================================
  // Avoidance Rule Management
  // ==========================================================================

  /**
   * Update global avoidance rules from episode
   */
  private updateAvoidanceRules(episode: Episode): void {
    for (const rule of episode.critique.shouldAvoid) {
      const key = `${rule.type}:${rule.value}:${rule.context}`;
      const existing = this.avoidanceRules.get(key);

      if (existing) {
        // Strengthen existing rule
        existing.confidence = Math.min(1, existing.confidence + 0.1);
      } else {
        this.avoidanceRules.set(key, rule);
      }
    }
  }

  /**
   * Track failure patterns
   */
  private trackFailurePattern(failureType: FailureType): void {
    const count = this.failurePatterns.get(failureType) || 0;
    this.failurePatterns.set(failureType, count + 1);
  }

  /**
   * Check if content should be avoided for given context
   */
  shouldAvoid(content: {
    title: string;
    genres: string[];
  }, context: {
    mood: string;
    tone: string;
    timeOfDay: string;
    previousWatched: string[];
  }): { avoid: boolean; reason?: string } {
    // Check content-specific avoidance
    for (const [, rule] of this.avoidanceRules) {
      if (!this.isRuleActive(rule)) continue;

      if (rule.type === 'content' && rule.value === content.title) {
        if (this.contextMatches(rule.context, context)) {
          return { avoid: true, reason: `Previously failed for similar context` };
        }
      }

      if (rule.type === 'genre' && content.genres.includes(rule.value)) {
        if (this.contextMatches(rule.context, context)) {
          return { avoid: true, reason: `Genre fatigue detected for ${rule.value}` };
        }
      }

      if (rule.type === 'tone') {
        const [genre, , tone] = rule.value.split('_');
        if (content.genres.includes(genre) && context.tone === tone) {
          return { avoid: true, reason: `${genre} doesn't match "${tone}" tone` };
        }
      }

      if (rule.type === 'pattern') {
        const [genre, , timeOfDay] = rule.value.split('_');
        if (content.genres.includes(genre) && context.timeOfDay === timeOfDay) {
          return { avoid: true, reason: `${genre} not recommended at ${timeOfDay}` };
        }
      }
    }

    return { avoid: false };
  }

  /**
   * Check if a rule is still active
   */
  private isRuleActive(rule: AvoidanceRule): boolean {
    if (rule.duration === 'permanent') return true;
    // In production, would check timestamps
    return true;
  }

  /**
   * Check if context matches rule context
   */
  private contextMatches(ruleContext: string, currentContext: Record<string, unknown>): boolean {
    const conditions = ruleContext.split(',');
    for (const condition of conditions) {
      const [key, value] = condition.split('=');
      if (currentContext[key] !== value) {
        return false;
      }
    }
    return true;
  }

  // ==========================================================================
  // Query Interface
  // ==========================================================================

  /**
   * Get recent failures for a user
   */
  getRecentFailures(userId: string, limit = 10): Episode[] {
    return Array.from(this.episodes.values())
      .filter(e => e.userId === userId && !e.critique.wasSuccess)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get common improvements suggested
   */
  getCommonImprovements(): string[] {
    const improvementCounts = new Map<string, number>();

    for (const [, episode] of this.episodes) {
      for (const improvement of episode.critique.improvements) {
        const count = improvementCounts.get(improvement) || 0;
        improvementCounts.set(improvement, count + 1);
      }
    }

    return Array.from(improvementCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([improvement]) => improvement);
  }

  /**
   * Generate reflection summary for a period
   */
  generateReflectionSummary(periodDays = 7): ReflectionSummary {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - periodDays);

    const recentEpisodes = Array.from(this.episodes.values())
      .filter(e => new Date(e.timestamp) >= periodStart);

    const successCount = recentEpisodes.filter(e => e.critique.wasSuccess).length;
    const successRate = recentEpisodes.length > 0 ? successCount / recentEpisodes.length : 0;

    // Count failure types
    const failureCounts = new Map<FailureType, number>();
    for (const episode of recentEpisodes) {
      if (episode.critique.failureType) {
        const count = failureCounts.get(episode.critique.failureType) || 0;
        failureCounts.set(episode.critique.failureType, count + 1);
      }
    }

    const totalFailures = recentEpisodes.length - successCount;
    const commonFailures = Array.from(failureCounts.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: totalFailures > 0 ? (count / totalFailures) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      periodStart: periodStart.toISOString(),
      periodEnd: new Date().toISOString(),
      totalEpisodes: recentEpisodes.length,
      successRate,
      commonFailures,
      topImprovements: this.getCommonImprovements(),
      activeAvoidances: Array.from(this.avoidanceRules.values())
        .filter(r => this.isRuleActive(r))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10),
    };
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalEpisodes: number;
    successRate: number;
    failurePatterns: Record<string, number>;
    activeAvoidances: number;
  } {
    const episodes = Array.from(this.episodes.values());
    const successCount = episodes.filter(e => e.critique.wasSuccess).length;

    return {
      totalEpisodes: episodes.length,
      successRate: episodes.length > 0 ? successCount / episodes.length : 0,
      failurePatterns: Object.fromEntries(this.failurePatterns),
      activeAvoidances: this.avoidanceRules.size,
    };
  }

  /**
   * Export data
   */
  exportData(): {
    episodes: Episode[];
    avoidanceRules: AvoidanceRule[];
  } {
    return {
      episodes: Array.from(this.episodes.values()),
      avoidanceRules: Array.from(this.avoidanceRules.values()),
    };
  }

  /**
   * Import data
   */
  importData(data: {
    episodes?: Episode[];
    avoidanceRules?: AvoidanceRule[];
  }): void {
    if (data.episodes) {
      for (const e of data.episodes) {
        this.episodes.set(e.id, e);
      }
    }
    if (data.avoidanceRules) {
      for (const r of data.avoidanceRules) {
        const key = `${r.type}:${r.value}:${r.context}`;
        this.avoidanceRules.set(key, r);
      }
    }
    logger.info('Data imported', {
      episodes: this.episodes.size,
      avoidanceRules: this.avoidanceRules.size,
    });
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let reflexionMemoryInstance: ReflexionMemory | undefined;

export function getReflexionMemory(): ReflexionMemory {
  if (!reflexionMemoryInstance) {
    reflexionMemoryInstance = new ReflexionMemory();
  }
  return reflexionMemoryInstance;
}
