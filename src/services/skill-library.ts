/**
 * Skill Library Service - Phase 2 L5
 *
 * Implements auto-consolidated reusable strategies that emerge from
 * successful recommendation patterns. Skills are higher-level abstractions
 * that combine multiple learned patterns into coherent strategies.
 *
 * Key Features:
 * - Auto-consolidation: Automatically creates skills from repeated patterns
 * - Skill matching: Matches context to applicable skills
 * - Skill execution: Applies skill transformations to recommendations
 * - Skill evolution: Skills improve through usage feedback
 *
 * @module services/skill-library
 */

import { createLogger } from '../utils/logger.js';
import { getReasoningBank, type LearnedPattern } from './reasoning-bank.js';

const logger = createLogger('SkillLibrary');

// ============================================================================
// Types
// ============================================================================

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  triggers: SkillTrigger[];
  actions: SkillAction[];
  performance: SkillPerformance;
  sourcePatterns: string[]; // IDs of patterns that formed this skill
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  isActive: boolean;
}

export type SkillType =
  | 'mood_match'        // Skills for specific moods
  | 'time_optimization' // Skills for time-of-day
  | 'genre_blend'       // Skills for genre combinations
  | 'context_aware'     // Skills for complex contexts
  | 'personalization'   // User-specific skills
  | 'trending_boost'    // Skills for trending content
  | 'recovery';         // Skills for bouncing back from failures

export interface SkillTrigger {
  type: 'mood' | 'time' | 'genre' | 'context' | 'history' | 'always';
  condition: string;
  weight: number;
}

export interface SkillAction {
  type: 'boost' | 'filter' | 'reorder' | 'inject' | 'transform';
  target: string;
  parameters: Record<string, unknown>;
  priority: number;
}

export interface SkillPerformance {
  successRate: number;
  avgCompletion: number;
  avgSatisfaction: number;
  sampleSize: number;
  confidenceInterval: [number, number];
  trend: 'improving' | 'stable' | 'declining';
}

export interface SkillMatch {
  skill: Skill;
  matchScore: number;
  triggeredBy: string[];
  expectedUplift: number;
}

export interface SkillApplication {
  skillId: string;
  skillName: string;
  actionsApplied: string[];
  boostsApplied: { target: string; amount: number }[];
  filtersApplied: string[];
  confidence: number;
}

// ============================================================================
// Skill Library Service
// ============================================================================

export class SkillLibrary {
  private skills: Map<string, Skill> = new Map();
  private skillUsageHistory: Map<string, { timestamp: string; success: boolean }[]> = new Map();

  // Thresholds for skill creation
  private minPatternsForSkill = 3;
  private minSuccessRateForSkill = 0.6;
  private consolidationCheckInterval = 10; // Check every N pattern updates

  private patternUpdateCount = 0;

  constructor() {
    // Initialize with some base skills
    this.initializeBaseSkills();
    logger.info('SkillLibrary initialized', { skillCount: this.skills.size });
  }

  /**
   * Initialize base skills that work without training data
   */
  private initializeBaseSkills(): void {
    // Friday Night Unwind skill
    this.skills.set('friday_unwind', {
      id: 'friday_unwind',
      name: 'Friday Night Unwind',
      description: 'Optimized for relaxing Friday evening content',
      type: 'time_optimization',
      triggers: [
        { type: 'time', condition: 'dayOfWeek=friday AND timeOfDay=evening', weight: 1.0 },
        { type: 'mood', condition: 'mood=unwind', weight: 0.8 },
      ],
      actions: [
        { type: 'boost', target: 'comedy', parameters: { multiplier: 1.3 }, priority: 1 },
        { type: 'boost', target: 'feel_good', parameters: { multiplier: 1.2 }, priority: 2 },
        { type: 'filter', target: 'heavy_drama', parameters: { exclude: true }, priority: 3 },
      ],
      performance: {
        successRate: 0.75,
        avgCompletion: 0.82,
        avgSatisfaction: 4.1,
        sampleSize: 0,
        confidenceInterval: [0.70, 0.80],
        trend: 'stable',
      },
      sourcePatterns: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      isActive: true,
    });

    // Late Night Engagement skill
    this.skills.set('late_night_engage', {
      id: 'late_night_engage',
      name: 'Late Night Engagement',
      description: 'For users who want to engage with content late at night',
      type: 'time_optimization',
      triggers: [
        { type: 'time', condition: 'timeOfDay=night', weight: 0.9 },
        { type: 'mood', condition: 'mood=engage', weight: 0.7 },
      ],
      actions: [
        { type: 'boost', target: 'thriller', parameters: { multiplier: 1.25 }, priority: 1 },
        { type: 'boost', target: 'mystery', parameters: { multiplier: 1.2 }, priority: 2 },
        { type: 'filter', target: 'children', parameters: { exclude: true }, priority: 3 },
      ],
      performance: {
        successRate: 0.70,
        avgCompletion: 0.78,
        avgSatisfaction: 3.9,
        sampleSize: 0,
        confidenceInterval: [0.65, 0.75],
        trend: 'stable',
      },
      sourcePatterns: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      isActive: true,
    });

    // Weekend Morning Discovery skill
    this.skills.set('weekend_discovery', {
      id: 'weekend_discovery',
      name: 'Weekend Morning Discovery',
      description: 'Encourages exploration on weekend mornings',
      type: 'context_aware',
      triggers: [
        { type: 'time', condition: 'dayOfWeek=saturday|sunday AND timeOfDay=morning', weight: 1.0 },
      ],
      actions: [
        { type: 'boost', target: 'documentary', parameters: { multiplier: 1.3 }, priority: 1 },
        { type: 'boost', target: 'indie', parameters: { multiplier: 1.2 }, priority: 2 },
        { type: 'transform', target: 'diversity', parameters: { increase: 0.2 }, priority: 3 },
      ],
      performance: {
        successRate: 0.68,
        avgCompletion: 0.75,
        avgSatisfaction: 4.0,
        sampleSize: 0,
        confidenceInterval: [0.62, 0.74],
        trend: 'stable',
      },
      sourcePatterns: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      isActive: true,
    });

    // Recovery skill for failed recommendations
    this.skills.set('recovery_pivot', {
      id: 'recovery_pivot',
      name: 'Recovery Pivot',
      description: 'Adjusts strategy after failed recommendations',
      type: 'recovery',
      triggers: [
        { type: 'history', condition: 'lastRecommendation=failed', weight: 1.0 },
      ],
      actions: [
        { type: 'transform', target: 'diversity', parameters: { increase: 0.3 }, priority: 1 },
        { type: 'boost', target: 'popular', parameters: { multiplier: 1.2 }, priority: 2 },
        { type: 'filter', target: 'last_failed_genre', parameters: { exclude: true }, priority: 3 },
      ],
      performance: {
        successRate: 0.65,
        avgCompletion: 0.70,
        avgSatisfaction: 3.7,
        sampleSize: 0,
        confidenceInterval: [0.58, 0.72],
        trend: 'stable',
      },
      sourcePatterns: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      isActive: true,
    });
  }

  // ==========================================================================
  // Skill Matching
  // ==========================================================================

  /**
   * Find skills that match the current context
   */
  findMatchingSkills(context: {
    mood: string;
    tone: string;
    timeOfDay: string;
    dayOfWeek: string;
    lastRecommendationFailed?: boolean;
    previousGenres?: string[];
  }): SkillMatch[] {
    const matches: SkillMatch[] = [];

    for (const [, skill] of this.skills) {
      if (!skill.isActive) continue;

      const { score, triggeredBy } = this.evaluateSkillMatch(skill, context);

      if (score > 0.3) { // Minimum threshold for consideration
        matches.push({
          skill,
          matchScore: score,
          triggeredBy,
          expectedUplift: skill.performance.successRate * score,
        });
      }
    }

    // Sort by expected uplift
    return matches.sort((a, b) => b.expectedUplift - a.expectedUplift);
  }

  /**
   * Evaluate how well a skill matches the context
   */
  private evaluateSkillMatch(skill: Skill, context: Record<string, unknown>): {
    score: number;
    triggeredBy: string[];
  } {
    let totalWeight = 0;
    let matchedWeight = 0;
    const triggeredBy: string[] = [];

    for (const trigger of skill.triggers) {
      totalWeight += trigger.weight;

      if (this.triggerMatches(trigger, context)) {
        matchedWeight += trigger.weight;
        triggeredBy.push(`${trigger.type}:${trigger.condition}`);
      }
    }

    const score = totalWeight > 0 ? matchedWeight / totalWeight : 0;

    return { score, triggeredBy };
  }

  /**
   * Check if a trigger matches the context
   */
  private triggerMatches(trigger: SkillTrigger, context: Record<string, unknown>): boolean {
    if (trigger.type === 'always') return true;

    // Parse condition (e.g., "mood=unwind" or "dayOfWeek=friday AND timeOfDay=evening")
    const conditions = trigger.condition.split(' AND ');

    for (const condition of conditions) {
      const [key, value] = condition.split('=');
      const contextValue = context[key];

      if (!contextValue) return false;

      // Handle OR conditions (e.g., "saturday|sunday")
      const allowedValues = value.split('|');
      if (!allowedValues.includes(String(contextValue))) {
        return false;
      }
    }

    return true;
  }

  // ==========================================================================
  // Skill Application
  // ==========================================================================

  /**
   * Apply a skill to recommendation candidates
   */
  applySkill(
    skillId: string,
    candidates: {
      id: string;
      title: string;
      genres: string[];
      score: number;
      metadata?: Record<string, unknown>;
    }[],
    context: Record<string, unknown>
  ): {
    candidates: typeof candidates;
    application: SkillApplication;
  } {
    const skill = this.skills.get(skillId);
    if (!skill) {
      return {
        candidates,
        application: {
          skillId,
          skillName: 'Unknown',
          actionsApplied: [],
          boostsApplied: [],
          filtersApplied: [],
          confidence: 0,
        },
      };
    }

    let modifiedCandidates = [...candidates];
    const boostsApplied: { target: string; amount: number }[] = [];
    const filtersApplied: string[] = [];
    const actionsApplied: string[] = [];

    // Sort actions by priority
    const sortedActions = [...skill.actions].sort((a, b) => a.priority - b.priority);

    for (const action of sortedActions) {
      switch (action.type) {
        case 'boost':
          modifiedCandidates = this.applyBoost(
            modifiedCandidates,
            action.target,
            action.parameters.multiplier as number
          );
          boostsApplied.push({
            target: action.target,
            amount: action.parameters.multiplier as number,
          });
          actionsApplied.push(`boost_${action.target}`);
          break;

        case 'filter':
          if (action.parameters.exclude) {
            const before = modifiedCandidates.length;
            modifiedCandidates = this.applyFilter(modifiedCandidates, action.target, context);
            if (modifiedCandidates.length < before) {
              filtersApplied.push(action.target);
            }
          }
          actionsApplied.push(`filter_${action.target}`);
          break;

        case 'reorder':
          modifiedCandidates = this.applyReorder(modifiedCandidates, action.parameters);
          actionsApplied.push(`reorder_${action.target}`);
          break;

        case 'transform':
          modifiedCandidates = this.applyTransform(
            modifiedCandidates,
            action.target,
            action.parameters
          );
          actionsApplied.push(`transform_${action.target}`);
          break;
      }
    }

    // Re-sort by modified score
    modifiedCandidates.sort((a, b) => b.score - a.score);

    // Track usage
    skill.usageCount++;
    skill.updatedAt = new Date().toISOString();

    return {
      candidates: modifiedCandidates,
      application: {
        skillId: skill.id,
        skillName: skill.name,
        actionsApplied,
        boostsApplied,
        filtersApplied,
        confidence: skill.performance.successRate,
      },
    };
  }

  /**
   * Apply a boost to matching candidates
   */
  private applyBoost<T extends { genres: string[]; score: number }>(
    candidates: T[],
    target: string,
    multiplier: number
  ): T[] {
    return candidates.map(c => {
      const matchesTarget = c.genres.some(g =>
        g.toLowerCase().includes(target.toLowerCase())
      );

      if (matchesTarget) {
        return { ...c, score: c.score * multiplier };
      }
      return c;
    });
  }

  /**
   * Apply a filter to exclude candidates
   */
  private applyFilter<T extends { genres: string[] }>(
    candidates: T[],
    target: string,
    context: Record<string, unknown>
  ): T[] {
    // Handle special targets
    if (target === 'last_failed_genre' && context.lastFailedGenre) {
      return candidates.filter(c =>
        !c.genres.some(g => g.toLowerCase() === String(context.lastFailedGenre).toLowerCase())
      );
    }

    return candidates.filter(c =>
      !c.genres.some(g => g.toLowerCase().includes(target.toLowerCase()))
    );
  }

  /**
   * Apply reordering based on parameters
   */
  private applyReorder<T extends { score: number }>(
    candidates: T[],
    parameters: Record<string, unknown>
  ): T[] {
    // Shuffle with weighted randomness based on score
    const factor = (parameters.randomnessFactor as number) || 0.1;

    return candidates.map(c => ({
      ...c,
      score: c.score * (1 + (Math.random() - 0.5) * factor),
    })).sort((a, b) => b.score - a.score);
  }

  /**
   * Apply transformation (e.g., diversity adjustment)
   */
  private applyTransform<T extends { score: number; genres: string[] }>(
    candidates: T[],
    target: string,
    parameters: Record<string, unknown>
  ): T[] {
    if (target === 'diversity') {
      const increase = (parameters.increase as number) || 0.1;

      // Track genre counts and penalize repetition
      const genreCounts: Record<string, number> = {};

      return candidates.map((c) => {
        let penalty = 0;
        for (const genre of c.genres) {
          const count = genreCounts[genre] || 0;
          penalty += count * increase;
          genreCounts[genre] = count + 1;
        }

        return {
          ...c,
          score: c.score * (1 - penalty * 0.1),
        };
      });
    }

    return candidates;
  }

  // ==========================================================================
  // Skill Creation & Evolution
  // ==========================================================================

  /**
   * Attempt to consolidate patterns into new skills
   */
  attemptConsolidation(): void {
    this.patternUpdateCount++;

    if (this.patternUpdateCount % this.consolidationCheckInterval !== 0) {
      return;
    }

    const reasoningBank = getReasoningBank();
    const stats = reasoningBank.getStats();

    if (stats.patternCount < this.minPatternsForSkill) {
      return;
    }

    // Group patterns by similarity
    const patternGroups = this.groupSimilarPatterns(stats.topPatterns);

    for (const group of patternGroups) {
      if (group.patterns.length >= this.minPatternsForSkill) {
        this.createSkillFromPatterns(group);
      }
    }
  }

  /**
   * Group similar patterns together
   */
  private groupSimilarPatterns(patterns: LearnedPattern[]): {
    key: string;
    patterns: LearnedPattern[];
  }[] {
    const groups: Map<string, LearnedPattern[]> = new Map();

    for (const pattern of patterns) {
      // Create group key from conditions
      const key = this.getPatternGroupKey(pattern);
      const existing = groups.get(key) || [];
      existing.push(pattern);
      groups.set(key, existing);
    }

    return Array.from(groups.entries()).map(([key, patterns]) => ({ key, patterns }));
  }

  /**
   * Get grouping key for a pattern
   */
  private getPatternGroupKey(pattern: LearnedPattern): string {
    const parts: string[] = [];
    if (pattern.ifCondition.mood) parts.push(`mood:${pattern.ifCondition.mood.join('|')}`);
    if (pattern.ifCondition.timeOfDay) parts.push(`time:${pattern.ifCondition.timeOfDay.join('|')}`);
    return parts.join('+') || 'general';
  }

  /**
   * Create a skill from a group of patterns
   */
  private createSkillFromPatterns(group: { key: string; patterns: LearnedPattern[] }): void {
    const avgSuccessRate = group.patterns.reduce((sum, p) => sum + p.successRate, 0) / group.patterns.length;

    if (avgSuccessRate < this.minSuccessRateForSkill) {
      return;
    }

    const skillId = `skill_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // Build triggers from pattern conditions
    const triggers: SkillTrigger[] = [];
    const firstPattern = group.patterns[0];

    if (firstPattern.ifCondition.mood) {
      triggers.push({
        type: 'mood',
        condition: `mood=${firstPattern.ifCondition.mood.join('|')}`,
        weight: 1.0,
      });
    }
    if (firstPattern.ifCondition.timeOfDay) {
      triggers.push({
        type: 'time',
        condition: `timeOfDay=${firstPattern.ifCondition.timeOfDay.join('|')}`,
        weight: 0.8,
      });
    }

    // Build actions from pattern actions
    const actions: SkillAction[] = group.patterns.map((p, i) => ({
      type: p.thenAction.type === 'boost_weight' ? 'boost' as const : 'filter' as const,
      target: p.thenAction.target,
      parameters: { multiplier: p.thenAction.multiplier },
      priority: i + 1,
    }));

    const skill: Skill = {
      id: skillId,
      name: `Learned: ${group.key}`,
      description: `Auto-consolidated from ${group.patterns.length} patterns`,
      type: this.inferSkillType(group.key),
      triggers,
      actions,
      performance: {
        successRate: avgSuccessRate,
        avgCompletion: 0.7,
        avgSatisfaction: 3.5,
        sampleSize: group.patterns.reduce((sum, p) => sum + p.evidenceCount, 0),
        confidenceInterval: [avgSuccessRate - 0.1, avgSuccessRate + 0.1],
        trend: 'stable',
      },
      sourcePatterns: group.patterns.map(p => p.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      isActive: true,
    };

    this.skills.set(skillId, skill);
    logger.info('New skill created from patterns', {
      skillId,
      name: skill.name,
      patternCount: group.patterns.length,
    });
  }

  /**
   * Infer skill type from group key
   */
  private inferSkillType(key: string): SkillType {
    if (key.includes('mood')) return 'mood_match';
    if (key.includes('time')) return 'time_optimization';
    if (key.includes('genre')) return 'genre_blend';
    return 'context_aware';
  }

  /**
   * Update skill performance based on feedback
   */
  updateSkillPerformance(
    skillId: string,
    outcome: {
      success: boolean;
      completionPercent: number;
      satisfaction?: number;
    }
  ): void {
    const skill = this.skills.get(skillId);
    if (!skill) return;

    // Update usage history
    const history = this.skillUsageHistory.get(skillId) || [];
    history.push({ timestamp: new Date().toISOString(), success: outcome.success });
    this.skillUsageHistory.set(skillId, history);

    // Update performance metrics
    const recentHistory = history.slice(-100); // Last 100 uses
    const successCount = recentHistory.filter(h => h.success).length;

    skill.performance.sampleSize = recentHistory.length;
    skill.performance.successRate = successCount / recentHistory.length;
    skill.performance.avgCompletion = (
      skill.performance.avgCompletion * 0.9 + outcome.completionPercent / 100 * 0.1
    );

    if (outcome.satisfaction !== undefined) {
      skill.performance.avgSatisfaction = (
        skill.performance.avgSatisfaction * 0.9 + outcome.satisfaction * 0.1
      );
    }

    // Update trend
    if (history.length >= 20) {
      const oldSuccessRate = history.slice(0, 10).filter(h => h.success).length / 10;
      const newSuccessRate = history.slice(-10).filter(h => h.success).length / 10;

      if (newSuccessRate > oldSuccessRate + 0.1) {
        skill.performance.trend = 'improving';
      } else if (newSuccessRate < oldSuccessRate - 0.1) {
        skill.performance.trend = 'declining';
      } else {
        skill.performance.trend = 'stable';
      }
    }

    // Deactivate poorly performing skills
    if (skill.performance.sampleSize >= 20 && skill.performance.successRate < 0.4) {
      skill.isActive = false;
      logger.warn('Skill deactivated due to poor performance', {
        skillId,
        successRate: skill.performance.successRate,
      });
    }

    skill.updatedAt = new Date().toISOString();
  }

  // ==========================================================================
  // Query Interface
  // ==========================================================================

  /**
   * Get all active skills
   */
  getActiveSkills(): Skill[] {
    return Array.from(this.skills.values()).filter(s => s.isActive);
  }

  /**
   * Get skill by ID
   */
  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  /**
   * Get best skill for context
   */
  getBestSkill(context: Parameters<SkillLibrary['findMatchingSkills']>[0]): Skill | null {
    const matches = this.findMatchingSkills(context);
    return matches.length > 0 ? matches[0].skill : null;
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalSkills: number;
    activeSkills: number;
    avgSuccessRate: number;
    topPerformers: { id: string; name: string; successRate: number }[];
  } {
    const allSkills = Array.from(this.skills.values());
    const activeSkills = allSkills.filter(s => s.isActive);

    const avgSuccessRate = activeSkills.length > 0
      ? activeSkills.reduce((sum, s) => sum + s.performance.successRate, 0) / activeSkills.length
      : 0;

    const topPerformers = activeSkills
      .sort((a, b) => b.performance.successRate - a.performance.successRate)
      .slice(0, 5)
      .map(s => ({
        id: s.id,
        name: s.name,
        successRate: s.performance.successRate,
      }));

    return {
      totalSkills: allSkills.length,
      activeSkills: activeSkills.length,
      avgSuccessRate,
      topPerformers,
    };
  }

  /**
   * Export data
   */
  exportData(): {
    skills: Skill[];
    usageHistory: Record<string, { timestamp: string; success: boolean }[]>;
  } {
    return {
      skills: Array.from(this.skills.values()),
      usageHistory: Object.fromEntries(this.skillUsageHistory),
    };
  }

  /**
   * Import data
   */
  importData(data: {
    skills?: Skill[];
    usageHistory?: Record<string, { timestamp: string; success: boolean }[]>;
  }): void {
    if (data.skills) {
      for (const s of data.skills) {
        this.skills.set(s.id, s);
      }
    }
    if (data.usageHistory) {
      for (const [id, history] of Object.entries(data.usageHistory)) {
        this.skillUsageHistory.set(id, history);
      }
    }
    logger.info('Data imported', { skills: this.skills.size });
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let skillLibraryInstance: SkillLibrary | undefined;

export function getSkillLibrary(): SkillLibrary {
  if (!skillLibraryInstance) {
    skillLibraryInstance = new SkillLibrary();
  }
  return skillLibraryInstance;
}
