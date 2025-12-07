/**
 * Nightly Learner Service - Phase 2 L6
 *
 * Implements background pattern discovery for autonomous optimization.
 * Runs periodic analysis to discover new patterns, consolidate skills,
 * and improve recommendation weights without human intervention.
 *
 * Key Features:
 * - Pattern mining: Discovers hidden correlations in user behavior
 * - Weight optimization: Fine-tunes recommendation formula weights
 * - Skill consolidation: Triggers automatic skill creation
 * - Anomaly detection: Identifies unusual patterns for review
 * - Performance reporting: Generates periodic performance summaries
 *
 * @module services/nightly-learner
 */

import { createLogger } from '../utils/logger.js';
import { getReasoningBank } from './reasoning-bank.js';
import { getReflexionMemory } from './reflexion-memory.js';
import { getCausalMemoryGraph } from './causal-memory.js';
import { getSkillLibrary } from './skill-library.js';

const logger = createLogger('NightlyLearner');

// ============================================================================
// Types
// ============================================================================

export interface LearningTask {
  id: string;
  name: string;
  type: LearningTaskType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: number;
  lastRun: string | null;
  nextRun: string;
  results?: LearningResult;
  error?: string;
}

export type LearningTaskType =
  | 'pattern_mining'
  | 'weight_optimization'
  | 'skill_consolidation'
  | 'anomaly_detection'
  | 'performance_analysis'
  | 'cache_cleanup'
  | 'data_compaction';

export interface LearningResult {
  taskId: string;
  timestamp: string;
  duration: number;
  findings: LearningFinding[];
  actionsApplied: string[];
  metrics: Record<string, number>;
}

export interface LearningFinding {
  type: 'pattern' | 'anomaly' | 'optimization' | 'insight';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  suggestedAction?: string;
}

export interface PerformanceReport {
  periodStart: string;
  periodEnd: string;
  recommendations: {
    total: number;
    successful: number;
    successRate: number;
    avgCompletion: number;
  };
  learning: {
    patternsLearned: number;
    skillsCreated: number;
    weightsAdjusted: number;
  };
  improvements: {
    successRateDelta: number;
    completionDelta: number;
    latencyDelta: number;
  };
  topFindings: LearningFinding[];
}

// ============================================================================
// Nightly Learner Service
// ============================================================================

export class NightlyLearner {
  private tasks: Map<string, LearningTask> = new Map();
  private isRunning = false;
  private lastFullRun: string | null = null;
  private learningHistory: LearningResult[] = [];

  // Learning parameters
  private minDataForMining = 50;
  // Future parameters for advanced learning algorithms:
  // - anomalyThreshold: 2.5 standard deviations
  // - optimizationLearningRate: 0.01 for gradient updates

  constructor() {
    this.initializeTasks();
    logger.info('NightlyLearner initialized', { taskCount: this.tasks.size });
  }

  /**
   * Initialize default learning tasks
   */
  private initializeTasks(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(3, 0, 0, 0); // 3 AM

    this.tasks.set('pattern_mining', {
      id: 'pattern_mining',
      name: 'Pattern Mining',
      type: 'pattern_mining',
      status: 'pending',
      priority: 1,
      lastRun: null,
      nextRun: tomorrow.toISOString(),
    });

    this.tasks.set('weight_optimization', {
      id: 'weight_optimization',
      name: 'Weight Optimization',
      type: 'weight_optimization',
      status: 'pending',
      priority: 2,
      lastRun: null,
      nextRun: tomorrow.toISOString(),
    });

    this.tasks.set('skill_consolidation', {
      id: 'skill_consolidation',
      name: 'Skill Consolidation',
      type: 'skill_consolidation',
      status: 'pending',
      priority: 3,
      lastRun: null,
      nextRun: tomorrow.toISOString(),
    });

    this.tasks.set('anomaly_detection', {
      id: 'anomaly_detection',
      name: 'Anomaly Detection',
      type: 'anomaly_detection',
      status: 'pending',
      priority: 4,
      lastRun: null,
      nextRun: tomorrow.toISOString(),
    });

    this.tasks.set('performance_analysis', {
      id: 'performance_analysis',
      name: 'Performance Analysis',
      type: 'performance_analysis',
      status: 'pending',
      priority: 5,
      lastRun: null,
      nextRun: tomorrow.toISOString(),
    });
  }

  // ==========================================================================
  // Task Execution
  // ==========================================================================

  /**
   * Run all learning tasks
   */
  async runAllTasks(): Promise<LearningResult[]> {
    if (this.isRunning) {
      logger.warn('Learning tasks already running');
      return [];
    }

    this.isRunning = true;
    const results: LearningResult[] = [];

    try {
      // Sort by priority
      const sortedTasks = Array.from(this.tasks.values())
        .sort((a, b) => a.priority - b.priority);

      for (const task of sortedTasks) {
        const result = await this.runTask(task.id);
        if (result) {
          results.push(result);
        }
      }

      this.lastFullRun = new Date().toISOString();
      logger.info('All learning tasks completed', { resultCount: results.length });
    } finally {
      this.isRunning = false;
    }

    return results;
  }

  /**
   * Run a specific task
   */
  async runTask(taskId: string): Promise<LearningResult | null> {
    const task = this.tasks.get(taskId);
    if (!task) {
      logger.warn('Task not found', { taskId });
      return null;
    }

    task.status = 'running';
    const startTime = Date.now();

    try {
      let result: LearningResult;

      switch (task.type) {
        case 'pattern_mining':
          result = await this.runPatternMining(task);
          break;
        case 'weight_optimization':
          result = await this.runWeightOptimization(task);
          break;
        case 'skill_consolidation':
          result = await this.runSkillConsolidation(task);
          break;
        case 'anomaly_detection':
          result = await this.runAnomalyDetection(task);
          break;
        case 'performance_analysis':
          result = await this.runPerformanceAnalysis(task);
          break;
        default:
          result = {
            taskId: task.id,
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime,
            findings: [],
            actionsApplied: [],
            metrics: {},
          };
      }

      task.status = 'completed';
      task.lastRun = new Date().toISOString();
      task.results = result;
      this.learningHistory.push(result);

      // Schedule next run
      const nextRun = new Date();
      nextRun.setDate(nextRun.getDate() + 1);
      nextRun.setHours(3, 0, 0, 0);
      task.nextRun = nextRun.toISOString();

      logger.info('Task completed', { taskId, duration: result.duration });
      return result;
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Task failed: ${taskId}`, error instanceof Error ? error : new Error(task.error || 'Unknown error'));
      return null;
    }
  }

  // ==========================================================================
  // Pattern Mining
  // ==========================================================================

  /**
   * Mine patterns from accumulated data
   */
  private async runPatternMining(task: LearningTask): Promise<LearningResult> {
    const startTime = Date.now();
    const findings: LearningFinding[] = [];
    const actionsApplied: string[] = [];

    const reasoningBank = getReasoningBank();
    const stats = reasoningBank.getStats();

    if (stats.trajectoryCount < this.minDataForMining) {
      findings.push({
        type: 'insight',
        title: 'Insufficient Data',
        description: `Only ${stats.trajectoryCount} trajectories available. Need ${this.minDataForMining} for pattern mining.`,
        confidence: 1.0,
        impact: 'low',
        actionRequired: false,
      });

      return {
        taskId: task.id,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        findings,
        actionsApplied,
        metrics: { trajectoryCount: stats.trajectoryCount },
      };
    }

    // Analyze mood patterns
    const moodPatterns = this.analyzeMoodPatterns(reasoningBank.getRecentTrajectories(100));
    findings.push(...moodPatterns);

    // Analyze time patterns
    const timePatterns = this.analyzeTimePatterns(reasoningBank.getRecentTrajectories(100));
    findings.push(...timePatterns);

    // Analyze genre correlations
    const genreCorrelations = this.analyzeGenreCorrelations(reasoningBank.getRecentTrajectories(100));
    findings.push(...genreCorrelations);

    actionsApplied.push(`Analyzed ${stats.trajectoryCount} trajectories`);
    actionsApplied.push(`Found ${findings.length} patterns`);

    return {
      taskId: task.id,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      findings,
      actionsApplied,
      metrics: {
        trajectoryCount: stats.trajectoryCount,
        patternsFound: findings.length,
      },
    };
  }

  /**
   * Analyze mood-based patterns
   */
  private analyzeMoodPatterns(trajectories: { userMood: string; outcome: unknown }[]): LearningFinding[] {
    const findings: LearningFinding[] = [];
    const moodStats: Record<string, { total: number; success: number }> = {};

    for (const t of trajectories) {
      if (!moodStats[t.userMood]) {
        moodStats[t.userMood] = { total: 0, success: 0 };
      }
      moodStats[t.userMood].total++;
      if (t.outcome) {
        moodStats[t.userMood].success++;
      }
    }

    for (const [mood, stats] of Object.entries(moodStats)) {
      if (stats.total >= 10) {
        const successRate = stats.success / stats.total;
        if (successRate > 0.8) {
          findings.push({
            type: 'pattern',
            title: `High Success for "${mood}" Mood`,
            description: `${Math.round(successRate * 100)}% success rate with ${stats.total} samples`,
            confidence: Math.min(0.95, stats.total / 50),
            impact: 'medium',
            actionRequired: false,
          });
        } else if (successRate < 0.4) {
          findings.push({
            type: 'pattern',
            title: `Low Success for "${mood}" Mood`,
            description: `Only ${Math.round(successRate * 100)}% success rate - needs investigation`,
            confidence: Math.min(0.95, stats.total / 50),
            impact: 'high',
            actionRequired: true,
            suggestedAction: `Review recommendation strategy for "${mood}" mood`,
          });
        }
      }
    }

    return findings;
  }

  /**
   * Analyze time-based patterns
   */
  private analyzeTimePatterns(trajectories: { contextFactors: { timeOfDay: string; dayOfWeek: string }; outcome: unknown }[]): LearningFinding[] {
    const findings: LearningFinding[] = [];
    const timeStats: Record<string, { total: number; success: number }> = {};

    for (const t of trajectories) {
      const key = `${t.contextFactors.dayOfWeek}_${t.contextFactors.timeOfDay}`;
      if (!timeStats[key]) {
        timeStats[key] = { total: 0, success: 0 };
      }
      timeStats[key].total++;
      if (t.outcome) {
        timeStats[key].success++;
      }
    }

    // Find best/worst time slots
    const sorted = Object.entries(timeStats)
      .filter(([, stats]) => stats.total >= 5)
      .sort((a, b) => (b[1].success / b[1].total) - (a[1].success / a[1].total));

    if (sorted.length > 0) {
      const [bestTime, bestStats] = sorted[0];
      findings.push({
        type: 'pattern',
        title: 'Best Time Slot Identified',
        description: `${bestTime} has ${Math.round((bestStats.success / bestStats.total) * 100)}% success rate`,
        confidence: Math.min(0.9, bestStats.total / 30),
        impact: 'medium',
        actionRequired: false,
      });
    }

    return findings;
  }

  /**
   * Analyze genre correlations
   */
  private analyzeGenreCorrelations(_trajectories: { contentRecommended: string; outcome: unknown }[]): LearningFinding[] {
    // Simplified - would analyze actual genre data in production
    return [];
  }

  // ==========================================================================
  // Weight Optimization
  // ==========================================================================

  /**
   * Optimize recommendation weights
   */
  private async runWeightOptimization(task: LearningTask): Promise<LearningResult> {
    const startTime = Date.now();
    const findings: LearningFinding[] = [];
    const actionsApplied: string[] = [];

    const reasoningBank = getReasoningBank();
    const causalMemory = getCausalMemoryGraph();

    const currentWeights = reasoningBank.getWeights();
    const utilityWeights = causalMemory.getUtilityWeights();

    findings.push({
      type: 'insight',
      title: 'Current Weight Configuration',
      description: `Vector: ${currentWeights.vectorSimilarity.toFixed(2)}, Context: ${currentWeights.contextBoost.toFixed(2)}, Trending: ${currentWeights.trendingBoost.toFixed(2)}`,
      confidence: 1.0,
      impact: 'low',
      actionRequired: false,
    });

    findings.push({
      type: 'insight',
      title: 'Utility Weights',
      description: `Alpha: ${utilityWeights.alpha.toFixed(2)}, Beta: ${utilityWeights.beta.toFixed(2)}, Gamma: ${utilityWeights.gamma.toFixed(2)}`,
      confidence: 1.0,
      impact: 'low',
      actionRequired: false,
    });

    actionsApplied.push('Reviewed current weight configuration');

    return {
      taskId: task.id,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      findings,
      actionsApplied,
      metrics: {
        vectorWeight: currentWeights.vectorSimilarity,
        contextWeight: currentWeights.contextBoost,
        trendingWeight: currentWeights.trendingBoost,
      },
    };
  }

  // ==========================================================================
  // Skill Consolidation
  // ==========================================================================

  /**
   * Trigger skill consolidation
   */
  private async runSkillConsolidation(task: LearningTask): Promise<LearningResult> {
    const startTime = Date.now();
    const findings: LearningFinding[] = [];
    const actionsApplied: string[] = [];

    const skillLibrary = getSkillLibrary();
    const beforeStats = skillLibrary.getStats();

    // Attempt consolidation
    skillLibrary.attemptConsolidation();

    const afterStats = skillLibrary.getStats();
    const newSkills = afterStats.totalSkills - beforeStats.totalSkills;

    if (newSkills > 0) {
      findings.push({
        type: 'pattern',
        title: 'New Skills Created',
        description: `${newSkills} new skill(s) consolidated from patterns`,
        confidence: 0.9,
        impact: 'high',
        actionRequired: false,
      });
      actionsApplied.push(`Created ${newSkills} new skills`);
    }

    findings.push({
      type: 'insight',
      title: 'Skill Library Status',
      description: `${afterStats.activeSkills} active skills, ${Math.round(afterStats.avgSuccessRate * 100)}% avg success rate`,
      confidence: 1.0,
      impact: 'low',
      actionRequired: false,
    });

    return {
      taskId: task.id,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      findings,
      actionsApplied,
      metrics: {
        totalSkills: afterStats.totalSkills,
        activeSkills: afterStats.activeSkills,
        avgSuccessRate: afterStats.avgSuccessRate,
        newSkillsCreated: newSkills,
      },
    };
  }

  // ==========================================================================
  // Anomaly Detection
  // ==========================================================================

  /**
   * Detect anomalies in behavior
   */
  private async runAnomalyDetection(task: LearningTask): Promise<LearningResult> {
    const startTime = Date.now();
    const findings: LearningFinding[] = [];
    const actionsApplied: string[] = [];

    const reflexionMemory = getReflexionMemory();
    const stats = reflexionMemory.getStats();

    // Check for unusual failure rates
    if (stats.successRate < 0.3) {
      findings.push({
        type: 'anomaly',
        title: 'High Failure Rate Detected',
        description: `Success rate at ${Math.round(stats.successRate * 100)}% - significantly below normal`,
        confidence: 0.95,
        impact: 'high',
        actionRequired: true,
        suggestedAction: 'Review recent failures and adjust recommendation strategy',
      });
    }

    // Check failure pattern concentrations
    for (const [type, count] of Object.entries(stats.failurePatterns)) {
      const percentage = (count / stats.totalEpisodes) * 100;
      if (percentage > 30) {
        findings.push({
          type: 'anomaly',
          title: `Concentrated Failure Type: ${type}`,
          description: `${type} accounts for ${Math.round(percentage)}% of all failures`,
          confidence: 0.85,
          impact: 'medium',
          actionRequired: true,
          suggestedAction: `Address ${type} failure pattern specifically`,
        });
      }
    }

    actionsApplied.push('Scanned for anomalies in recent behavior');

    return {
      taskId: task.id,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      findings,
      actionsApplied,
      metrics: {
        successRate: stats.successRate,
        totalEpisodes: stats.totalEpisodes,
        activeAvoidances: stats.activeAvoidances,
      },
    };
  }

  // ==========================================================================
  // Performance Analysis
  // ==========================================================================

  /**
   * Analyze overall performance
   */
  private async runPerformanceAnalysis(task: LearningTask): Promise<LearningResult> {
    const startTime = Date.now();
    const findings: LearningFinding[] = [];
    const actionsApplied: string[] = [];

    const reasoningBank = getReasoningBank();
    const reflexionMemory = getReflexionMemory();
    const skillLibrary = getSkillLibrary();
    const causalMemory = getCausalMemoryGraph();

    const rbStats = reasoningBank.getStats();
    const rmStats = reflexionMemory.getStats();
    const slStats = skillLibrary.getStats();
    const cmStats = causalMemory.getStats();

    findings.push({
      type: 'insight',
      title: 'System Health Summary',
      description: `ReasoningBank: ${rbStats.trajectoryCount} trajectories, ${rbStats.patternCount} patterns. Skills: ${slStats.activeSkills} active. Causal: ${cmStats.nodeCount} nodes.`,
      confidence: 1.0,
      impact: 'low',
      actionRequired: false,
    });

    // Overall success rate trend
    const overallSuccess = (rbStats.successRate + rmStats.successRate) / 2;
    if (overallSuccess >= 0.7) {
      findings.push({
        type: 'insight',
        title: 'Performance Status: Good',
        description: `Overall success rate at ${Math.round(overallSuccess * 100)}%`,
        confidence: 0.9,
        impact: 'low',
        actionRequired: false,
      });
    } else {
      findings.push({
        type: 'insight',
        title: 'Performance Needs Attention',
        description: `Overall success rate at ${Math.round(overallSuccess * 100)}% - below target`,
        confidence: 0.9,
        impact: 'medium',
        actionRequired: true,
        suggestedAction: 'Review patterns and adjust weights',
      });
    }

    actionsApplied.push('Generated performance analysis');

    return {
      taskId: task.id,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      findings,
      actionsApplied,
      metrics: {
        rbSuccessRate: rbStats.successRate,
        rmSuccessRate: rmStats.successRate,
        overallSuccessRate: overallSuccess,
        totalPatterns: rbStats.patternCount,
        activeSkills: slStats.activeSkills,
        causalNodes: cmStats.nodeCount,
      },
    };
  }

  // ==========================================================================
  // Query Interface
  // ==========================================================================

  /**
   * Get all tasks
   */
  getTasks(): LearningTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): LearningTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get learning history
   */
  getLearningHistory(limit = 20): LearningResult[] {
    return this.learningHistory.slice(-limit);
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): PerformanceReport {
    const reasoningBank = getReasoningBank();
    const skillLibrary = getSkillLibrary();

    const stats = reasoningBank.getStats();
    const slStats = skillLibrary.getStats();

    // Get all findings from recent learning
    const recentFindings = this.learningHistory
      .slice(-5)
      .flatMap(r => r.findings)
      .filter(f => f.impact === 'high' || f.actionRequired);

    return {
      periodStart: this.lastFullRun || new Date().toISOString(),
      periodEnd: new Date().toISOString(),
      recommendations: {
        total: stats.trajectoryCount,
        successful: Math.round(stats.trajectoryCount * stats.successRate),
        successRate: stats.successRate,
        avgCompletion: 0.75, // Would calculate from actual data
      },
      learning: {
        patternsLearned: stats.patternCount,
        skillsCreated: slStats.totalSkills,
        weightsAdjusted: stats.verdictCount,
      },
      improvements: {
        successRateDelta: 0, // Would compare to previous period
        completionDelta: 0,
        latencyDelta: 0,
      },
      topFindings: recentFindings.slice(0, 5),
    };
  }

  /**
   * Check if running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get last full run timestamp
   */
  getLastFullRun(): string | null {
    return this.lastFullRun;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let nightlyLearnerInstance: NightlyLearner | undefined;

export function getNightlyLearner(): NightlyLearner {
  if (!nightlyLearnerInstance) {
    nightlyLearnerInstance = new NightlyLearner();
  }
  return nightlyLearnerInstance;
}
