/**
 * Intent Agent
 *
 * Extracts emotional state from quiz answers and context.
 * Maps user responses to UniversalEmotionalState using Russell's Circumplex Model.
 *
 * @module agents/intent
 */

import {
  UniversalEmotionalState,
  quizToEmotionalState,
  createDefaultEmotionalState,
  RequestContext,
  ContextInfo
} from '../models/index.js';

/**
 * Intent Agent
 *
 * Responsible for:
 * - Mapping quiz responses to emotional dimensions
 * - Applying contextual adjustments (time, device, social)
 * - Querying Reflexion Memory for learned constraints (Phase 2)
 */
export class IntentAgent {
  constructor() {}

  /**
   * Extract emotional state from quiz answers
   */
  async extractIntent(
    mood: 'unwind' | 'engage',
    goal: 'laugh' | 'feel' | 'thrill' | 'think',
    sessionId: string,
    userId: string,
    context?: RequestContext
  ): Promise<UniversalEmotionalState> {
    try {
      console.log(`[Intent] Extracting intent for ${mood}-${goal}`);

      // Step 1: Map quiz to base emotional state
      const baseState = quizToEmotionalState(mood, goal, sessionId, userId);

      // Step 2: Apply contextual adjustments
      const adjustedState = this.applyContextualAdjustments(baseState, context);

      // Step 3: Query Reflexion Memory for constraints (Phase 2 - stubbed)
      const constraints = await this.queryReflexionMemory(userId, adjustedState);

      console.log(`[Intent] Emotional state extracted:`, {
        energy: adjustedState.energy,
        valence: adjustedState.valence,
        arousal: adjustedState.arousal,
        cognitiveCapacity: adjustedState.cognitiveCapacity,
        primaryNeed: this.getPrimaryNeed(adjustedState),
        constraintCount: constraints.length
      });

      return adjustedState;

    } catch (error) {
      console.error(`[Intent] Failed to extract intent:`, error);
      throw new Error(`Intent extraction failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  /**
   * Apply contextual adjustments to emotional state
   */
  private applyContextualAdjustments(
    state: UniversalEmotionalState,
    context?: RequestContext
  ): UniversalEmotionalState {
    let adjustedState = { ...state };

    // If no context provided, use defaults from state
    if (!context) {
      return adjustedState;
    }

    // Time-based adjustments
    if (context.timeOfDay) {
      adjustedState = this.applyTimeAdjustments(adjustedState, context.timeOfDay);
    }

    // Device-based adjustments
    if (context.device) {
      adjustedState = this.applyDeviceAdjustments(adjustedState, context.device);
    }

    // Social context adjustments
    if (context.social) {
      adjustedState = this.applySocialAdjustments(adjustedState, context.social);
    }

    return adjustedState;
  }

  /**
   * Apply time-of-day adjustments
   */
  private applyTimeAdjustments(
    state: UniversalEmotionalState,
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  ): UniversalEmotionalState {
    const adjustments: Record<typeof timeOfDay, Partial<UniversalEmotionalState>> = {
      morning: {
        energy: state.energy * 1.1, // Slightly more energetic
        cognitiveCapacity: state.cognitiveCapacity * 1.1
      },
      afternoon: {
        cognitiveCapacity: state.cognitiveCapacity * 0.9 // Lunch fatigue
      },
      evening: {
        energy: state.energy * 0.8, // Lower energy
        needs: {
          ...state.needs,
          relaxation: Math.min(state.needs.relaxation * 1.2, 1.0)
        }
      },
      night: {
        energy: state.energy * 0.6, // Tired
        cognitiveCapacity: state.cognitiveCapacity * 0.7,
        needs: {
          ...state.needs,
          relaxation: Math.min(state.needs.relaxation * 1.3, 1.0),
          escape: Math.min(state.needs.escape * 1.1, 1.0)
        }
      }
    };

    const adjustment = adjustments[timeOfDay];
    return {
      ...state,
      ...adjustment,
      energy: this.clamp(adjustment.energy ?? state.energy, 0, 1),
      cognitiveCapacity: this.clamp(adjustment.cognitiveCapacity ?? state.cognitiveCapacity, 0, 1)
    };
  }

  /**
   * Apply device-based adjustments
   */
  private applyDeviceAdjustments(
    state: UniversalEmotionalState,
    device: 'mobile' | 'tablet' | 'desktop' | 'tv'
  ): UniversalEmotionalState {
    const adjustments: Record<typeof device, Partial<UniversalEmotionalState>> = {
      mobile: {
        cognitiveCapacity: state.cognitiveCapacity * 0.85 // Shorter attention span
      },
      tablet: {
        cognitiveCapacity: state.cognitiveCapacity * 0.95
      },
      desktop: {
        cognitiveCapacity: state.cognitiveCapacity * 1.0 // No change
      },
      tv: {
        needs: {
          ...state.needs,
          relaxation: Math.min(state.needs.relaxation * 1.1, 1.0),
          comfort: Math.min(state.needs.comfort * 1.1, 1.0)
        }
      }
    };

    const adjustment = adjustments[device];
    return {
      ...state,
      ...adjustment,
      cognitiveCapacity: this.clamp(adjustment.cognitiveCapacity ?? state.cognitiveCapacity, 0, 1)
    };
  }

  /**
   * Apply social context adjustments
   */
  private applySocialAdjustments(
    state: UniversalEmotionalState,
    social: 'alone' | 'partner' | 'family' | 'friends'
  ): UniversalEmotionalState {
    const adjustments: Record<typeof social, Partial<UniversalEmotionalState>> = {
      alone: {
        needs: {
          ...state.needs,
          escape: Math.min(state.needs.escape * 1.1, 1.0)
        }
      },
      partner: {
        needs: {
          ...state.needs,
          connection: Math.min(state.needs.connection * 1.2, 1.0)
        }
      },
      family: {
        cognitiveCapacity: state.cognitiveCapacity * 0.9, // Simpler content
        needs: {
          ...state.needs,
          connection: Math.min(state.needs.connection * 1.3, 1.0),
          comfort: Math.min(state.needs.comfort * 1.2, 1.0)
        }
      },
      friends: {
        needs: {
          ...state.needs,
          connection: Math.min(state.needs.connection * 1.2, 1.0),
          joy: Math.min(state.needs.joy * 1.2, 1.0)
        }
      }
    };

    const adjustment = adjustments[social];
    return {
      ...state,
      ...adjustment,
      cognitiveCapacity: this.clamp(adjustment.cognitiveCapacity ?? state.cognitiveCapacity, 0, 1)
    };
  }

  /**
   * Query Reflexion Memory for learned constraints
   * MVP: Stubbed - will integrate with AgentDB Reflexion Memory in Phase 2
   */
  private async queryReflexionMemory(
    userId: string,
    state: UniversalEmotionalState
  ): Promise<string[]> {
    try {
      // Phase 2: Query AgentDB Reflexion Memory
      // const episodes = await agentDB.reflexion.queryEpisodes({
      //   userId,
      //   emotionalState: state,
      //   outcome: 'abandoned',
      //   minConfidence: 0.7
      // });
      //
      // return episodes.map(ep => ep.critique.avoidPattern);

      // MVP: Return empty constraints
      return [];

    } catch (error) {
      console.warn(`[Intent] Failed to query Reflexion Memory:`, error);
      return [];
    }
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

  /**
   * Clamp value between min and max
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
