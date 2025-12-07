/**
 * ReasoningBank Service - Phase 2 L1
 *
 * Implements pattern learning from recommendation trajectories.
 * Stores trajectories, verdicts, and learned patterns to improve
 * future recommendations based on past outcomes.
 *
 * Key Features:
 * - Trajectory storage: Records recommendation sessions with outcomes
 * - Verdict system: Success/failure analysis with confidence scores
 * - Pattern learning: Extracts if-then rules from successful trajectories
 * - Dynamic weight adjustment: Learns optimal formula weights
 *
 * Performance target: 32.6M ops/sec (via AgentDB vectors)
 *
 * @module services/reasoning-bank
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('ReasoningBank');

// ============================================================================
// Types
// ============================================================================

export interface Trajectory {
  id: string;
  timestamp: string;
  userId: string;
  userMood: string;
  contentRecommended: string;
  contentId: number;
  vectorSimilarity: number;
  contextBoost: number;
  trendingBoost: number;
  diversityPenalty: number;
  finalScore: number;
  outcome: TrajectoryOutcome | null;
  contextFactors: ContextFactors;
}

export interface TrajectoryOutcome {
  action: 'clicked' | 'watched' | 'skipped' | 'dismissed';
  completionPercent: number;
  watchDurationMinutes: number;
  rating: number | null;
  addedToWatchlist: boolean;
  timestamp: string;
}

export interface ContextFactors {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  deviceType: string;
  sessionNumber: number;
  previousMood: string | null;
}

export interface Verdict {
  trajectoryId: string;
  success: boolean;
  confidenceScore: number;
  reasoning: string;
  outcomeQuality: 'excellent' | 'good' | 'neutral' | 'poor' | 'failure';
  learningSignal: number; // -1 to 1, how much to adjust weights
}

export interface LearnedPattern {
  id: string;
  ifCondition: PatternCondition;
  thenAction: PatternAction;
  confidence: number;
  evidenceCount: number;
  successRate: number;
  lastUpdated: string;
  createdAt: string;
}

export interface PatternCondition {
  mood?: string[];
  timeOfDay?: string[];
  dayOfWeek?: string[];
  genres?: string[];
  minVectorSimilarity?: number;
  sessionNumber?: { min?: number; max?: number };
}

export interface PatternAction {
  type: 'boost_weight' | 'reduce_weight' | 'prefer_genre' | 'avoid_genre' | 'adjust_diversity';
  target: string;
  multiplier: number;
}

export interface WeightConfig {
  vectorSimilarity: number;  // α
  causalUplift: number;      // β (Phase 2)
  trendingBoost: number;
  contextBoost: number;
  latencyPenalty: number;    // γ
  diversityPenalty: number;
}

// ============================================================================
// ReasoningBank Service
// ============================================================================

export class ReasoningBank {
  private trajectories: Map<string, Trajectory> = new Map();
  private verdicts: Map<string, Verdict> = new Map();
  private patterns: Map<string, LearnedPattern> = new Map();

  // Dynamic weights - start with defaults, learn over time
  private weights: WeightConfig = {
    vectorSimilarity: 0.45,
    causalUplift: 0.0,      // Will be learned in L3
    trendingBoost: 0.15,
    contextBoost: 0.25,
    latencyPenalty: 0.05,
    diversityPenalty: 0.10,
  };

  // Learning rate for weight adjustments
  private learningRate = 0.05;
  private minEvidenceForPattern = 5;

  constructor() {
    logger.info('ReasoningBank initialized', { weights: this.weights });
  }

  // ==========================================================================
  // Trajectory Management
  // ==========================================================================

  /**
   * Record a new recommendation trajectory
   */
  recordTrajectory(trajectory: Omit<Trajectory, 'id' | 'timestamp'>): Trajectory {
    const id = `traj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const fullTrajectory: Trajectory = {
      ...trajectory,
      id,
      timestamp: new Date().toISOString(),
    };

    this.trajectories.set(id, fullTrajectory);
    logger.debug('Trajectory recorded', { id, content: trajectory.contentRecommended });

    return fullTrajectory;
  }

  /**
   * Update trajectory with outcome data
   */
  recordOutcome(trajectoryId: string, outcome: TrajectoryOutcome): Verdict | null {
    const trajectory = this.trajectories.get(trajectoryId);
    if (!trajectory) {
      logger.warn('Trajectory not found for outcome', { trajectoryId });
      return null;
    }

    trajectory.outcome = outcome;

    // Generate verdict based on outcome
    const verdict = this.generateVerdict(trajectory);
    this.verdicts.set(trajectory.id, verdict);

    // If we have enough data, try to learn a pattern
    this.tryLearnPattern(trajectory, verdict);

    // Adjust weights based on verdict
    this.adjustWeights(verdict);

    logger.info('Outcome recorded with verdict', {
      trajectoryId,
      success: verdict.success,
      confidence: verdict.confidenceScore,
    });

    return verdict;
  }

  // ==========================================================================
  // Verdict Generation
  // ==========================================================================

  /**
   * Generate a verdict for a trajectory based on its outcome
   */
  private generateVerdict(trajectory: Trajectory): Verdict {
    const outcome = trajectory.outcome!;

    // Calculate success and quality
    let success = false;
    let outcomeQuality: Verdict['outcomeQuality'] = 'neutral';
    let confidenceScore = 0.5;
    let learningSignal = 0;
    let reasoning = '';

    if (outcome.action === 'skipped' || outcome.action === 'dismissed') {
      success = false;
      outcomeQuality = 'failure';
      confidenceScore = 0.8; // We're fairly confident this was a bad recommendation
      learningSignal = -0.5;
      reasoning = `User ${outcome.action} the content without engagement`;
    } else if (outcome.action === 'clicked') {
      if (outcome.completionPercent >= 80) {
        success = true;
        outcomeQuality = 'excellent';
        confidenceScore = 0.95;
        learningSignal = 1.0;
        reasoning = `High completion (${outcome.completionPercent}%) indicates strong match`;
      } else if (outcome.completionPercent >= 50) {
        success = true;
        outcomeQuality = 'good';
        confidenceScore = 0.75;
        learningSignal = 0.5;
        reasoning = `Moderate completion (${outcome.completionPercent}%) indicates decent match`;
      } else if (outcome.completionPercent >= 20) {
        success = false;
        outcomeQuality = 'neutral';
        confidenceScore = 0.6;
        learningSignal = -0.2;
        reasoning = `Low completion (${outcome.completionPercent}%) suggests partial interest`;
      } else {
        success = false;
        outcomeQuality = 'poor';
        confidenceScore = 0.85;
        learningSignal = -0.7;
        reasoning = `Very low completion (${outcome.completionPercent}%) indicates poor match`;
      }
    } else if (outcome.action === 'watched') {
      success = true;
      outcomeQuality = outcome.completionPercent >= 90 ? 'excellent' : 'good';
      confidenceScore = 0.9;
      learningSignal = outcome.completionPercent >= 90 ? 1.0 : 0.7;
      reasoning = `Full watch intent with ${outcome.completionPercent}% completion`;
    }

    // Boost confidence if user rated
    if (outcome.rating !== null) {
      if (outcome.rating >= 4) {
        learningSignal = Math.min(1, learningSignal + 0.3);
        reasoning += ` + positive rating (${outcome.rating}/5)`;
      } else if (outcome.rating <= 2) {
        learningSignal = Math.max(-1, learningSignal - 0.3);
        reasoning += ` + negative rating (${outcome.rating}/5)`;
      }
    }

    // Boost if added to watchlist
    if (outcome.addedToWatchlist) {
      learningSignal = Math.min(1, learningSignal + 0.2);
      reasoning += ' + added to watchlist';
    }

    return {
      trajectoryId: trajectory.id,
      success,
      confidenceScore,
      reasoning,
      outcomeQuality,
      learningSignal,
    };
  }

  // ==========================================================================
  // Pattern Learning
  // ==========================================================================

  /**
   * Try to learn a pattern from a trajectory and its verdict
   */
  private tryLearnPattern(trajectory: Trajectory, verdict: Verdict): void {
    // Only learn from high-confidence verdicts
    if (verdict.confidenceScore < 0.7) return;

    // Build condition from context
    const condition: PatternCondition = {
      mood: [trajectory.userMood],
      timeOfDay: [trajectory.contextFactors.timeOfDay],
    };

    // Find similar trajectories
    const similarTrajectories = this.findSimilarTrajectories(trajectory);

    if (similarTrajectories.length < this.minEvidenceForPattern) {
      return; // Not enough evidence yet
    }

    // Calculate success rate for this pattern
    const successCount = similarTrajectories.filter(t => {
      const v = this.verdicts.get(t.id);
      return v?.success;
    }).length;

    const successRate = successCount / similarTrajectories.length;

    // Create or update pattern
    const patternId = this.generatePatternId(condition);
    const existingPattern = this.patterns.get(patternId);

    if (existingPattern) {
      // Update existing pattern
      existingPattern.evidenceCount = similarTrajectories.length;
      existingPattern.successRate = successRate;
      existingPattern.confidence = this.calculatePatternConfidence(similarTrajectories.length, successRate);
      existingPattern.lastUpdated = new Date().toISOString();

      // Adjust action multiplier based on success rate
      if (successRate > 0.7) {
        existingPattern.thenAction.multiplier = Math.min(1.5, existingPattern.thenAction.multiplier + 0.05);
      } else if (successRate < 0.4) {
        existingPattern.thenAction.multiplier = Math.max(0.5, existingPattern.thenAction.multiplier - 0.05);
      }
    } else {
      // Create new pattern
      const action: PatternAction = {
        type: verdict.success ? 'boost_weight' : 'reduce_weight',
        target: 'contextBoost',
        multiplier: verdict.success ? 1.1 : 0.9,
      };

      const newPattern: LearnedPattern = {
        id: patternId,
        ifCondition: condition,
        thenAction: action,
        confidence: this.calculatePatternConfidence(similarTrajectories.length, successRate),
        evidenceCount: similarTrajectories.length,
        successRate,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      this.patterns.set(patternId, newPattern);
      logger.info('New pattern learned', { patternId, successRate, evidence: similarTrajectories.length });
    }
  }

  /**
   * Find trajectories with similar context
   */
  private findSimilarTrajectories(trajectory: Trajectory): Trajectory[] {
    const similar: Trajectory[] = [];

    for (const [, t] of this.trajectories) {
      if (t.id === trajectory.id) continue;
      if (!t.outcome) continue;

      // Check similarity
      let matchScore = 0;

      if (t.userMood === trajectory.userMood) matchScore += 2;
      if (t.contextFactors.timeOfDay === trajectory.contextFactors.timeOfDay) matchScore += 1;
      if (t.contextFactors.dayOfWeek === trajectory.contextFactors.dayOfWeek) matchScore += 0.5;

      // Vector similarity should be close
      if (Math.abs(t.vectorSimilarity - trajectory.vectorSimilarity) < 0.2) matchScore += 1;

      if (matchScore >= 3) {
        similar.push(t);
      }
    }

    return similar;
  }

  /**
   * Generate a unique pattern ID from conditions
   */
  private generatePatternId(condition: PatternCondition): string {
    const parts: string[] = [];
    if (condition.mood) parts.push(`mood:${condition.mood.join(',')}`);
    if (condition.timeOfDay) parts.push(`time:${condition.timeOfDay.join(',')}`);
    if (condition.dayOfWeek) parts.push(`day:${condition.dayOfWeek.join(',')}`);
    return parts.join('|') || 'default';
  }

  /**
   * Calculate confidence score for a pattern
   */
  private calculatePatternConfidence(evidenceCount: number, successRate: number): number {
    // More evidence = higher confidence, but with diminishing returns
    const evidenceFactor = Math.min(1, Math.log10(evidenceCount + 1) / 2);

    // Success rate deviation from 50% indicates stronger signal
    const signalStrength = Math.abs(successRate - 0.5) * 2;

    return evidenceFactor * (0.5 + signalStrength * 0.5);
  }

  // ==========================================================================
  // Weight Adjustment
  // ==========================================================================

  /**
   * Adjust weights based on verdict feedback
   */
  private adjustWeights(verdict: Verdict): void {
    const trajectory = this.trajectories.get(verdict.trajectoryId);
    if (!trajectory) return;

    const signal = verdict.learningSignal * this.learningRate;

    // Adjust weights based on what contributed to this recommendation
    if (trajectory.vectorSimilarity > 0.7 && verdict.success) {
      // High similarity worked well - slightly increase weight
      this.weights.vectorSimilarity = Math.min(0.6, this.weights.vectorSimilarity + signal * 0.1);
    } else if (trajectory.vectorSimilarity > 0.7 && !verdict.success) {
      // High similarity didn't work - maybe other factors matter more
      this.weights.vectorSimilarity = Math.max(0.3, this.weights.vectorSimilarity - signal * 0.1);
    }

    if (trajectory.contextBoost > 0.1 && verdict.success) {
      this.weights.contextBoost = Math.min(0.4, this.weights.contextBoost + signal * 0.1);
    }

    if (trajectory.trendingBoost > 0.1 && verdict.success) {
      this.weights.trendingBoost = Math.min(0.25, this.weights.trendingBoost + signal * 0.05);
    }

    // Normalize weights to sum to ~1 (excluding latency penalty)
    this.normalizeWeights();

    logger.debug('Weights adjusted', {
      signal: verdict.learningSignal,
      newWeights: this.weights,
    });
  }

  /**
   * Normalize weights to maintain balance
   */
  private normalizeWeights(): void {
    const sum = this.weights.vectorSimilarity +
                this.weights.causalUplift +
                this.weights.trendingBoost +
                this.weights.contextBoost;

    if (sum > 0 && Math.abs(sum - 1) > 0.01) {
      const factor = 1 / sum;
      this.weights.vectorSimilarity *= factor;
      this.weights.causalUplift *= factor;
      this.weights.trendingBoost *= factor;
      this.weights.contextBoost *= factor;
    }
  }

  // ==========================================================================
  // Query Interface
  // ==========================================================================

  /**
   * Get applicable patterns for a context
   */
  getApplicablePatterns(context: {
    mood: string;
    timeOfDay: string;
    dayOfWeek?: string;
  }): LearnedPattern[] {
    const applicable: LearnedPattern[] = [];

    for (const [, pattern] of this.patterns) {
      let matches = true;

      if (pattern.ifCondition.mood && !pattern.ifCondition.mood.includes(context.mood)) {
        matches = false;
      }
      if (pattern.ifCondition.timeOfDay && !pattern.ifCondition.timeOfDay.includes(context.timeOfDay)) {
        matches = false;
      }
      if (context.dayOfWeek && pattern.ifCondition.dayOfWeek &&
          !pattern.ifCondition.dayOfWeek.includes(context.dayOfWeek)) {
        matches = false;
      }

      if (matches && pattern.confidence > 0.5) {
        applicable.push(pattern);
      }
    }

    // Sort by confidence
    return applicable.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get current learned weights
   */
  getWeights(): WeightConfig {
    return { ...this.weights };
  }

  /**
   * Calculate score boost from patterns
   */
  getPatternBoost(context: {
    mood: string;
    timeOfDay: string;
    dayOfWeek?: string;
  }): number {
    const patterns = this.getApplicablePatterns(context);

    if (patterns.length === 0) return 1.0;

    // Combine pattern multipliers (weighted by confidence)
    let totalMultiplier = 0;
    let totalWeight = 0;

    for (const pattern of patterns.slice(0, 3)) { // Top 3 patterns
      if (pattern.thenAction.type === 'boost_weight') {
        totalMultiplier += pattern.thenAction.multiplier * pattern.confidence;
        totalWeight += pattern.confidence;
      }
    }

    if (totalWeight === 0) return 1.0;
    return totalMultiplier / totalWeight;
  }

  /**
   * Get statistics about the reasoning bank
   */
  getStats(): {
    trajectoryCount: number;
    verdictCount: number;
    patternCount: number;
    successRate: number;
    weights: WeightConfig;
    topPatterns: LearnedPattern[];
  } {
    const verdictArray = Array.from(this.verdicts.values());
    const successCount = verdictArray.filter(v => v.success).length;

    return {
      trajectoryCount: this.trajectories.size,
      verdictCount: this.verdicts.size,
      patternCount: this.patterns.size,
      successRate: verdictArray.length > 0 ? successCount / verdictArray.length : 0,
      weights: this.getWeights(),
      topPatterns: Array.from(this.patterns.values())
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5),
    };
  }

  /**
   * Get recent trajectories for analysis
   */
  getRecentTrajectories(limit = 20): Trajectory[] {
    return Array.from(this.trajectories.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Export all data for persistence
   */
  exportData(): {
    trajectories: Trajectory[];
    verdicts: Verdict[];
    patterns: LearnedPattern[];
    weights: WeightConfig;
  } {
    return {
      trajectories: Array.from(this.trajectories.values()),
      verdicts: Array.from(this.verdicts.values()),
      patterns: Array.from(this.patterns.values()),
      weights: this.weights,
    };
  }

  /**
   * Import data from persistence
   */
  importData(data: {
    trajectories?: Trajectory[];
    verdicts?: Verdict[];
    patterns?: LearnedPattern[];
    weights?: WeightConfig;
  }): void {
    if (data.trajectories) {
      for (const t of data.trajectories) {
        this.trajectories.set(t.id, t);
      }
    }
    if (data.verdicts) {
      for (const v of data.verdicts) {
        this.verdicts.set(v.trajectoryId, v);
      }
    }
    if (data.patterns) {
      for (const p of data.patterns) {
        this.patterns.set(p.id, p);
      }
    }
    if (data.weights) {
      this.weights = { ...this.weights, ...data.weights };
    }

    logger.info('Data imported', {
      trajectories: this.trajectories.size,
      verdicts: this.verdicts.size,
      patterns: this.patterns.size,
    });
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let reasoningBankInstance: ReasoningBank | undefined;

export function getReasoningBank(): ReasoningBank {
  if (!reasoningBankInstance) {
    reasoningBankInstance = new ReasoningBank();
  }
  return reasoningBankInstance;
}
