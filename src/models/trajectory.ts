/**
 * Trajectory and Episode Models
 *
 * Data structures for ReasoningBank pattern learning and Reflexion Memory.
 * Tracks recommendation sessions, outcomes, and self-critique.
 *
 * @module models/trajectory
 */

import { z } from 'zod';
import { UniversalEmotionalStateSchema } from './emotional-state.js';

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Agent action schema
 */
export const AgentActionSchema = z.object({
  step: z.number().int().positive(),
  agentType: z.enum(['orchestrator', 'intent', 'catalog', 'trend', 'match', 'present']),
  action: z.string().describe('Description of action taken'),
  parameters: z.record(z.any()).default({}),
  result: z.record(z.any()).default({}),
  latency: z.number().min(0).describe('Milliseconds')
});

/**
 * Recommendation outcome schema
 */
export const RecommendationOutcomeSchema = z.object({
  interactionType: z.enum(['view', 'complete', 'abandon', 'skip', 'refine']),
  completionRate: z.number().min(0).max(1).optional(),
  watchDuration: z.number().min(0).optional().describe('Seconds'),
  implicitSatisfaction: z.number().min(0).max(1).describe('Inferred satisfaction'),
  explicitRating: z.number().int().min(1).max(5).optional()
});

/**
 * Verdict schema (self-critique)
 */
export const VerdictSchema = z.object({
  success: z.boolean(),
  confidenceScore: z.number().min(0).max(1),
  reasoning: z.string(),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  avoidPatterns: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional()
});

/**
 * Learning signals schema
 */
export const LearningSignalsSchema = z.object({
  useForTraining: z.boolean().default(true),
  isOutlier: z.boolean().default(false),
  interventions: z.array(z.object({
    variable: z.string(),
    value: z.any(),
    effect: z.number()
  })).optional()
});

/**
 * Trajectory schema for ReasoningBank
 */
export const TrajectorySchema = z.object({
  id: z.string().uuid(),
  session: z.object({
    sessionId: z.string().uuid(),
    userId: z.string().describe('Anonymized user ID'),
    timestamp: z.string().datetime()
  }),
  initialState: z.object({
    emotionalState: UniversalEmotionalStateSchema,
    userVector: z.instanceof(Float32Array).refine((arr) => arr.length === 64, {
      message: 'User vector must be 64 dimensions'
    }),
    context: z.record(z.any()).default({})
  }),
  actions: z.array(AgentActionSchema).default([]),
  recommendation: z.object({
    contentId: z.string(),
    matchScore: z.number().min(0).max(1),
    utilityScore: z.number().min(0).max(1),
    vectorSimilarity: z.number().min(0).max(1),
    causalUplift: z.number().optional(),
    skillUsed: z.string().optional()
  }),
  outcome: RecommendationOutcomeSchema,
  verdict: VerdictSchema,
  learningSignals: LearningSignalsSchema
});

/**
 * Reflexion episode schema
 */
export const ReflexionEpisodeSchema = z.object({
  id: z.string().uuid(),
  trajectoryId: z.string().uuid(),
  critique: z.object({
    task: z.string(),
    approach: z.string(),
    outcome: z.string(),
    analysis: z.string(),
    reflection: z.string(),
    confidence: z.number().min(0).max(1)
  }),
  provenance: z.object({
    timestamp: z.string().datetime(),
    agentType: z.string(),
    evidenceCount: z.number().int().min(0),
    similarEpisodes: z.array(z.string()).default([])
  })
});

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Agent action
 */
export interface AgentAction extends z.infer<typeof AgentActionSchema> {}

/**
 * Recommendation outcome
 */
export interface RecommendationOutcome extends z.infer<typeof RecommendationOutcomeSchema> {}

/**
 * Verdict (self-critique)
 */
export interface Verdict extends z.infer<typeof VerdictSchema> {}

/**
 * Learning signals
 */
export interface LearningSignals extends z.infer<typeof LearningSignalsSchema> {}

/**
 * Trajectory for ReasoningBank pattern learning
 *
 * Stored in AgentDB's ReasoningBank for learning optimal strategies.
 */
export interface Trajectory extends z.infer<typeof TrajectorySchema> {}

/**
 * Reflexion Memory Episode
 *
 * Stored for self-critique and learning from failures.
 */
export interface ReflexionEpisode extends z.infer<typeof ReflexionEpisodeSchema> {}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a new trajectory
 */
export function createTrajectory(
  sessionId: string,
  userId: string,
  emotionalState: z.infer<typeof UniversalEmotionalStateSchema>,
  userVector: Float32Array
): Trajectory {
  return {
    id: crypto.randomUUID(),
    session: {
      sessionId,
      userId,
      timestamp: new Date().toISOString()
    },
    initialState: {
      emotionalState,
      userVector: new Float32Array(userVector),
      context: {}
    },
    actions: [],
    recommendation: {
      contentId: '',
      matchScore: 0,
      utilityScore: 0,
      vectorSimilarity: 0
    },
    outcome: {
      interactionType: 'view',
      implicitSatisfaction: 0.5
    },
    verdict: {
      success: false,
      confidenceScore: 0.5,
      reasoning: '',
      strengths: [],
      weaknesses: []
    },
    learningSignals: {
      useForTraining: true,
      isOutlier: false
    }
  };
}

/**
 * Add action to trajectory
 */
export function addActionToTrajectory(
  trajectory: Trajectory,
  agentType: AgentAction['agentType'],
  action: string,
  parameters: Record<string, any> = {},
  result: Record<string, any> = {},
  latency = 0
): Trajectory {
  const newAction: AgentAction = {
    step: trajectory.actions.length + 1,
    agentType,
    action,
    parameters,
    result,
    latency
  };

  return {
    ...trajectory,
    actions: [...trajectory.actions, newAction]
  };
}

/**
 * Set recommendation in trajectory
 */
export function setTrajectoryRecommendation(
  trajectory: Trajectory,
  recommendation: Trajectory['recommendation']
): Trajectory {
  return {
    ...trajectory,
    recommendation
  };
}

/**
 * Set outcome in trajectory
 */
export function setTrajectoryOutcome(
  trajectory: Trajectory,
  outcome: RecommendationOutcome
): Trajectory {
  return {
    ...trajectory,
    outcome
  };
}

/**
 * Calculate implicit satisfaction from interaction
 */
export function calculateImplicitSatisfaction(
  interactionType: RecommendationOutcome['interactionType'],
  completionRate?: number,
  watchDuration?: number,
  expectedDuration?: number
): number {
  switch (interactionType) {
    case 'complete':
      return 0.9; // Completed watching

    case 'view':
      if (completionRate !== undefined) {
        // High completion rate = high satisfaction
        return completionRate * 0.8;
      }
      if (watchDuration !== undefined && expectedDuration !== undefined) {
        return Math.min((watchDuration / expectedDuration) * 0.8, 1.0);
      }
      return 0.5; // Neutral

    case 'abandon':
      return 0.2; // Low satisfaction

    case 'skip':
      return 0.1; // Very low satisfaction

    case 'refine':
      return 0.4; // Moderate - user wants to refine

    default:
      return 0.5;
  }
}

/**
 * Generate verdict from trajectory
 */
export function generateVerdict(
  trajectory: Trajectory,
  implicitSatisfaction: number
): Verdict {
  const success = implicitSatisfaction >= 0.7;
  const confidenceScore = Math.abs(implicitSatisfaction - 0.5) * 2; // 0-1

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (success) {
    strengths.push('High user satisfaction');
    if (trajectory.outcome.completionRate && trajectory.outcome.completionRate > 0.8) {
      strengths.push('High completion rate');
    }
  } else {
    weaknesses.push('Low user satisfaction');
    if (trajectory.outcome.interactionType === 'abandon') {
      weaknesses.push('User abandoned content');
    }
    if (trajectory.outcome.interactionType === 'skip') {
      weaknesses.push('User skipped recommendation');
    }
  }

  return {
    success,
    confidenceScore,
    reasoning: success
      ? 'Recommendation was well-received by user'
      : 'Recommendation did not meet user expectations',
    strengths,
    weaknesses
  };
}

/**
 * Create reflexion episode from trajectory
 */
export function createReflexionEpisode(
  trajectory: Trajectory,
  task: string,
  approach: string
): ReflexionEpisode {
  const outcome = trajectory.outcome.interactionType;
  const success = trajectory.verdict.success;

  return {
    id: crypto.randomUUID(),
    trajectoryId: trajectory.id,
    critique: {
      task,
      approach,
      outcome: `User ${outcome} the content`,
      analysis: success
        ? 'The approach successfully matched user needs'
        : 'The approach failed to match user expectations',
      reflection: trajectory.verdict.weaknesses.length > 0
        ? `Should improve: ${trajectory.verdict.weaknesses.join(', ')}`
        : 'Approach was effective',
      confidence: trajectory.verdict.confidenceScore
    },
    provenance: {
      timestamp: new Date().toISOString(),
      agentType: 'orchestrator',
      evidenceCount: 1,
      similarEpisodes: []
    }
  };
}

/**
 * Validate trajectory
 */
export function validateTrajectory(trajectory: unknown): Trajectory {
  return TrajectorySchema.parse(trajectory);
}

/**
 * Validate reflexion episode
 */
export function validateReflexionEpisode(episode: unknown): ReflexionEpisode {
  return ReflexionEpisodeSchema.parse(episode);
}

/**
 * Serialize trajectory to storable format
 */
export function serializeTrajectory(trajectory: Trajectory): string {
  return JSON.stringify({
    ...trajectory,
    initialState: {
      ...trajectory.initialState,
      userVector: Array.from(trajectory.initialState.userVector)
    }
  });
}

/**
 * Deserialize trajectory from storage
 */
export function deserializeTrajectory(data: string): Trajectory {
  const parsed = JSON.parse(data);
  return validateTrajectory({
    ...parsed,
    initialState: {
      ...parsed.initialState,
      userVector: new Float32Array(parsed.initialState.userVector)
    }
  });
}

/**
 * Calculate trajectory success rate from multiple trajectories
 */
export function calculateSuccessRate(trajectories: Trajectory[]): number {
  if (trajectories.length === 0) return 0;

  const successCount = trajectories.filter(t => t.verdict.success).length;
  return successCount / trajectories.length;
}

/**
 * Find similar trajectories based on emotional state
 */
export function findSimilarTrajectories(
  target: Trajectory,
  trajectories: Trajectory[],
  threshold = 0.7,
  maxResults = 10
): Trajectory[] {
  // Simple similarity based on emotional state distance
  const similarities = trajectories.map(t => ({
    trajectory: t,
    similarity: calculateEmotionalStateSimilarity(
      target.initialState.emotionalState,
      t.initialState.emotionalState
    )
  }));

  return similarities
    .filter(s => s.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxResults)
    .map(s => s.trajectory);
}

/**
 * Helper: Calculate emotional state similarity
 */
function calculateEmotionalStateSimilarity(
  state1: z.infer<typeof UniversalEmotionalStateSchema>,
  state2: z.infer<typeof UniversalEmotionalStateSchema>
): number {
  // Simple distance calculation
  const features1 = [
    state1.energy,
    state1.valence,
    state1.arousal,
    state1.cognitiveCapacity,
    ...Object.values(state1.needs)
  ];

  const features2 = [
    state2.energy,
    state2.valence,
    state2.arousal,
    state2.cognitiveCapacity,
    ...Object.values(state2.needs)
  ];

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < features1.length; i++) {
    dotProduct += features1[i] * features2[i];
    magnitude1 += features1[i] * features1[i];
    magnitude2 += features2[i] * features2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (magnitude1 * magnitude2);
}
