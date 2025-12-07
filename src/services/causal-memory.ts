/**
 * Causal Memory Graph Service - Phase 2 L3 & L4
 *
 * Implements a causal graph that tracks p(outcome|do(action)) -
 * the probability of an outcome given that we recommend a specific action.
 * This goes beyond correlation to understand what CAUSES engagement.
 *
 * Key Features:
 * - Causal graph: Nodes are actions/contexts, edges are causal relationships
 * - Intervention tracking: Records outcomes of "do(recommend X)"
 * - Counterfactual reasoning: Estimates what would have happened otherwise
 * - Utility-based recall (L4): U = α·sim + β·uplift - γ·latency
 *
 * @module services/causal-memory
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('CausalMemory');

// ============================================================================
// Types
// ============================================================================

export interface CausalNode {
  id: string;
  type: 'action' | 'context' | 'outcome';
  label: string;
  metadata: Record<string, unknown>;
  observationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CausalEdge {
  id: string;
  sourceId: string;
  targetId: string;
  causalStrength: number;  // -1 to 1: negative = prevents, positive = causes
  confidence: number;      // 0 to 1: how sure we are
  observationCount: number;
  successCount: number;
  failureCount: number;
  avgOutcomeValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Intervention {
  id: string;
  timestamp: string;
  actionNodeId: string;
  contextNodeIds: string[];
  outcomeNodeId: string;
  outcomeValue: number;    // 0 to 1: success measure
  latencyMs: number;
  metadata: Record<string, unknown>;
}

export interface CausalUplift {
  actionId: string;
  contextId: string;
  uplift: number;          // p(success|do(action)) - p(success|baseline)
  confidence: number;
  sampleSize: number;
}

// Utility-based recall formula weights
export interface UtilityWeights {
  alpha: number;  // Vector similarity weight
  beta: number;   // Causal uplift weight
  gamma: number;  // Latency penalty weight
}

// ============================================================================
// Causal Memory Graph Service
// ============================================================================

export class CausalMemoryGraph {
  private nodes: Map<string, CausalNode> = new Map();
  private edges: Map<string, CausalEdge> = new Map();
  private interventions: Map<string, Intervention> = new Map();

  // Utility weights - learned over time
  private utilityWeights: UtilityWeights = {
    alpha: 0.5,   // Vector similarity
    beta: 0.35,   // Causal uplift
    gamma: 0.15,  // Latency penalty
  };

  // Cache for causal uplift calculations
  private upliftCache: Map<string, CausalUplift> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    logger.info('CausalMemoryGraph initialized', { weights: this.utilityWeights });
  }

  // ==========================================================================
  // Node Management
  // ==========================================================================

  /**
   * Get or create a node
   */
  getOrCreateNode(type: CausalNode['type'], label: string, metadata: Record<string, unknown> = {}): CausalNode {
    const id = this.generateNodeId(type, label);
    let node = this.nodes.get(id);

    if (!node) {
      node = {
        id,
        type,
        label,
        metadata,
        observationCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.nodes.set(id, node);
    }

    return node;
  }

  /**
   * Generate consistent node ID
   */
  private generateNodeId(type: CausalNode['type'], label: string): string {
    return `${type}:${label.toLowerCase().replace(/\s+/g, '_')}`;
  }

  // ==========================================================================
  // Edge Management
  // ==========================================================================

  /**
   * Get or create an edge between nodes
   */
  getOrCreateEdge(sourceId: string, targetId: string): CausalEdge {
    const id = `${sourceId}->${targetId}`;
    let edge = this.edges.get(id);

    if (!edge) {
      edge = {
        id,
        sourceId,
        targetId,
        causalStrength: 0,
        confidence: 0,
        observationCount: 0,
        successCount: 0,
        failureCount: 0,
        avgOutcomeValue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.edges.set(id, edge);
    }

    return edge;
  }

  /**
   * Update edge with new observation
   */
  private updateEdge(edge: CausalEdge, outcomeValue: number): void {
    edge.observationCount++;
    if (outcomeValue >= 0.5) {
      edge.successCount++;
    } else {
      edge.failureCount++;
    }

    // Running average of outcome value
    edge.avgOutcomeValue = (
      (edge.avgOutcomeValue * (edge.observationCount - 1) + outcomeValue) /
      edge.observationCount
    );

    // Calculate causal strength as deviation from baseline
    const baseline = 0.5; // Neutral expectation
    edge.causalStrength = (edge.avgOutcomeValue - baseline) * 2; // Scale to -1 to 1

    // Confidence increases with observations (diminishing returns)
    edge.confidence = Math.min(0.95, 1 - Math.exp(-edge.observationCount / 20));

    edge.updatedAt = new Date().toISOString();
  }

  // ==========================================================================
  // Intervention Recording
  // ==========================================================================

  /**
   * Record an intervention (do(action) operation)
   */
  recordIntervention(
    action: { label: string; metadata?: Record<string, unknown> },
    context: { labels: string[]; metadata?: Record<string, unknown>[] },
    outcome: { label: string; value: number; metadata?: Record<string, unknown> },
    latencyMs: number
  ): Intervention {
    // Get or create nodes
    const actionNode = this.getOrCreateNode('action', action.label, action.metadata || {});
    actionNode.observationCount++;

    const contextNodes = context.labels.map((label, i) => {
      const node = this.getOrCreateNode('context', label, context.metadata?.[i] || {});
      node.observationCount++;
      return node;
    });

    const outcomeNode = this.getOrCreateNode('outcome', outcome.label, outcome.metadata || {});
    outcomeNode.observationCount++;

    // Create/update edges
    // Action -> Outcome
    const actionToOutcome = this.getOrCreateEdge(actionNode.id, outcomeNode.id);
    this.updateEdge(actionToOutcome, outcome.value);

    // Context -> Outcome (for each context)
    for (const contextNode of contextNodes) {
      const contextToOutcome = this.getOrCreateEdge(contextNode.id, outcomeNode.id);
      this.updateEdge(contextToOutcome, outcome.value);

      // Context -> Action -> Outcome (compound)
      const contextActionKey = `${contextNode.id}+${actionNode.id}`;
      const compoundEdge = this.getOrCreateEdge(contextActionKey, outcomeNode.id);
      this.updateEdge(compoundEdge, outcome.value);
    }

    // Record intervention
    const intervention: Intervention = {
      id: `int_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      actionNodeId: actionNode.id,
      contextNodeIds: contextNodes.map(n => n.id),
      outcomeNodeId: outcomeNode.id,
      outcomeValue: outcome.value,
      latencyMs,
      metadata: { action: action.metadata, context: context.metadata, outcome: outcome.metadata },
    };

    this.interventions.set(intervention.id, intervention);

    // Invalidate relevant cache entries
    this.invalidateCache(actionNode.id, contextNodes.map(n => n.id));

    logger.debug('Intervention recorded', {
      id: intervention.id,
      action: action.label,
      outcome: outcome.label,
      value: outcome.value,
    });

    return intervention;
  }

  /**
   * Invalidate cached uplift calculations
   */
  private invalidateCache(actionId: string, contextIds: string[]): void {
    for (const contextId of contextIds) {
      const cacheKey = `${actionId}:${contextId}`;
      this.upliftCache.delete(cacheKey);
    }
  }

  // ==========================================================================
  // Causal Uplift Calculation
  // ==========================================================================

  /**
   * Calculate causal uplift for an action in a context
   * p(success|do(action), context) - p(success|baseline, context)
   */
  calculateCausalUplift(actionLabel: string, contextLabels: string[]): CausalUplift {
    const actionId = this.generateNodeId('action', actionLabel);
    const contextIds = contextLabels.map(l => this.generateNodeId('context', l));

    // Check cache
    const cacheKey = `${actionId}:${contextIds.join(',')}`;
    const cached = this.upliftCache.get(cacheKey);
    if (cached && Date.now() - new Date(cached.actionId).getTime() < this.cacheTimeout) {
      return cached;
    }

    // Calculate p(success|do(action), context)
    let treatmentSuccess = 0;
    let treatmentCount = 0;

    for (const contextId of contextIds) {
      const compoundKey = `${contextId}+${actionId}`;
      const edge = this.edges.get(`${compoundKey}->outcome:success`);
      if (edge) {
        treatmentSuccess += edge.successCount;
        treatmentCount += edge.observationCount;
      }
    }

    // Calculate p(success|baseline, context) - average across all actions
    let baselineSuccess = 0;
    let baselineCount = 0;

    for (const contextId of contextIds) {
      for (const [, edge] of this.edges) {
        if (edge.sourceId.startsWith(contextId) && edge.targetId.includes('success')) {
          baselineSuccess += edge.successCount;
          baselineCount += edge.observationCount;
        }
      }
    }

    const pTreatment = treatmentCount > 0 ? treatmentSuccess / treatmentCount : 0.5;
    const pBaseline = baselineCount > 0 ? baselineSuccess / baselineCount : 0.5;
    const uplift = pTreatment - pBaseline;

    // Confidence based on sample size
    const sampleSize = treatmentCount;
    const confidence = Math.min(0.95, 1 - Math.exp(-sampleSize / 10));

    const result: CausalUplift = {
      actionId,
      contextId: contextIds.join(','),
      uplift,
      confidence,
      sampleSize,
    };

    this.upliftCache.set(cacheKey, result);

    return result;
  }

  // ==========================================================================
  // L4: Utility-Based Recall
  // ==========================================================================

  /**
   * Calculate utility score for a recommendation candidate
   * U = α·sim + β·uplift - γ·latency
   */
  calculateUtility(
    vectorSimilarity: number,
    actionLabel: string,
    contextLabels: string[],
    expectedLatencyMs: number
  ): {
    utility: number;
    components: {
      similarity: number;
      uplift: number;
      latencyPenalty: number;
    };
    causalConfidence: number;
  } {
    const upliftData = this.calculateCausalUplift(actionLabel, contextLabels);

    // Normalize latency to 0-1 scale (assume 100ms is baseline, 1000ms is max penalty)
    const normalizedLatency = Math.min(1, Math.max(0, (expectedLatencyMs - 100) / 900));

    const components = {
      similarity: this.utilityWeights.alpha * vectorSimilarity,
      uplift: this.utilityWeights.beta * (upliftData.uplift + 1) / 2, // Normalize to 0-1
      latencyPenalty: this.utilityWeights.gamma * normalizedLatency,
    };

    const utility = components.similarity + components.uplift - components.latencyPenalty;

    return {
      utility,
      components,
      causalConfidence: upliftData.confidence,
    };
  }

  /**
   * Rank candidates by utility score
   */
  rankByUtility(candidates: {
    id: string;
    label: string;
    vectorSimilarity: number;
    expectedLatencyMs: number;
    metadata?: Record<string, unknown>;
  }[], contextLabels: string[]): {
    id: string;
    label: string;
    utility: number;
    rank: number;
    components: {
      similarity: number;
      uplift: number;
      latencyPenalty: number;
    };
    causalConfidence: number;
  }[] {
    const ranked = candidates.map(candidate => {
      const utilityResult = this.calculateUtility(
        candidate.vectorSimilarity,
        candidate.label,
        contextLabels,
        candidate.expectedLatencyMs
      );

      return {
        id: candidate.id,
        label: candidate.label,
        utility: utilityResult.utility,
        rank: 0, // Will be set below
        components: utilityResult.components,
        causalConfidence: utilityResult.causalConfidence,
      };
    });

    // Sort by utility descending
    ranked.sort((a, b) => b.utility - a.utility);

    // Assign ranks
    ranked.forEach((item, index) => {
      item.rank = index + 1;
    });

    return ranked;
  }

  // ==========================================================================
  // Weight Learning
  // ==========================================================================

  /**
   * Update utility weights based on outcome feedback
   */
  updateWeights(outcomeValue: number, usedComponents: {
    similarity: number;
    uplift: number;
    latencyPenalty: number;
  }): void {
    const learningRate = 0.05;
    const error = outcomeValue - 0.5; // How much we exceeded/missed neutral

    // Gradient-like update: increase weight for components that contributed to success
    if (error > 0) {
      // Success - increase weights of components that were high
      if (usedComponents.similarity > 0.5) {
        this.utilityWeights.alpha = Math.min(0.7, this.utilityWeights.alpha + learningRate * 0.1);
      }
      if (usedComponents.uplift > 0.3) {
        this.utilityWeights.beta = Math.min(0.5, this.utilityWeights.beta + learningRate * 0.1);
      }
    } else if (error < 0) {
      // Failure - maybe latency was an issue, or we over-relied on similarity
      if (usedComponents.latencyPenalty > 0.3) {
        this.utilityWeights.gamma = Math.min(0.3, this.utilityWeights.gamma + learningRate * 0.05);
      }
    }

    // Normalize weights
    const sum = this.utilityWeights.alpha + this.utilityWeights.beta + this.utilityWeights.gamma;
    this.utilityWeights.alpha /= sum;
    this.utilityWeights.beta /= sum;
    this.utilityWeights.gamma /= sum;

    logger.debug('Utility weights updated', { weights: this.utilityWeights });
  }

  // ==========================================================================
  // Query Interface
  // ==========================================================================

  /**
   * Get strongest causal relationships
   */
  getStrongestCausalLinks(limit = 10): CausalEdge[] {
    return Array.from(this.edges.values())
      .filter(e => e.confidence > 0.5)
      .sort((a, b) => Math.abs(b.causalStrength) - Math.abs(a.causalStrength))
      .slice(0, limit);
  }

  /**
   * Get best actions for a context
   */
  getBestActionsForContext(contextLabel: string, limit = 5): {
    actionLabel: string;
    uplift: number;
    confidence: number;
  }[] {
    const contextId = this.generateNodeId('context', contextLabel);
    const results: { actionLabel: string; uplift: number; confidence: number }[] = [];

    // Find all compound edges from this context
    for (const [, edge] of this.edges) {
      if (edge.sourceId.startsWith(contextId + '+') && edge.targetId.includes('success')) {
        const actionPart = edge.sourceId.split('+')[1];
        const actionNode = this.nodes.get(actionPart);
        if (actionNode) {
          results.push({
            actionLabel: actionNode.label,
            uplift: edge.causalStrength,
            confidence: edge.confidence,
          });
        }
      }
    }

    return results
      .sort((a, b) => b.uplift - a.uplift)
      .slice(0, limit);
  }

  /**
   * Get statistics
   */
  getStats(): {
    nodeCount: number;
    edgeCount: number;
    interventionCount: number;
    utilityWeights: UtilityWeights;
    avgCausalConfidence: number;
  } {
    const edges = Array.from(this.edges.values());
    const avgConfidence = edges.length > 0
      ? edges.reduce((sum, e) => sum + e.confidence, 0) / edges.length
      : 0;

    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      interventionCount: this.interventions.size,
      utilityWeights: { ...this.utilityWeights },
      avgCausalConfidence: avgConfidence,
    };
  }

  /**
   * Get current utility weights
   */
  getUtilityWeights(): UtilityWeights {
    return { ...this.utilityWeights };
  }

  /**
   * Export data
   */
  exportData(): {
    nodes: CausalNode[];
    edges: CausalEdge[];
    interventions: Intervention[];
    utilityWeights: UtilityWeights;
  } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
      interventions: Array.from(this.interventions.values()),
      utilityWeights: this.utilityWeights,
    };
  }

  /**
   * Import data
   */
  importData(data: {
    nodes?: CausalNode[];
    edges?: CausalEdge[];
    interventions?: Intervention[];
    utilityWeights?: UtilityWeights;
  }): void {
    if (data.nodes) {
      for (const n of data.nodes) {
        this.nodes.set(n.id, n);
      }
    }
    if (data.edges) {
      for (const e of data.edges) {
        this.edges.set(e.id, e);
      }
    }
    if (data.interventions) {
      for (const i of data.interventions) {
        this.interventions.set(i.id, i);
      }
    }
    if (data.utilityWeights) {
      this.utilityWeights = { ...data.utilityWeights };
    }
    logger.info('Data imported', {
      nodes: this.nodes.size,
      edges: this.edges.size,
      interventions: this.interventions.size,
    });
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let causalMemoryInstance: CausalMemoryGraph | undefined;

export function getCausalMemoryGraph(): CausalMemoryGraph {
  if (!causalMemoryInstance) {
    causalMemoryInstance = new CausalMemoryGraph();
  }
  return causalMemoryInstance;
}
