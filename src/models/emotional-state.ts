/**
 * Universal Emotional State Models
 *
 * Domain-agnostic representation of user's emotional context based on:
 * - Russell's Circumplex Model of Affect
 * - Maslow's Hierarchy of Needs
 *
 * @module models/emotional-state
 */

import { z } from 'zod';

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Emotional needs profile schema
 */
export const EmotionalNeedsSchema = z.object({
  comfort: z.number().min(0).max(1).describe('Need for familiarity, safety'),
  escape: z.number().min(0).max(1).describe('Need to avoid reality/stress'),
  stimulation: z.number().min(0).max(1).describe('Need for novelty, excitement'),
  connection: z.number().min(0).max(1).describe('Need for social/emotional bonding'),
  growth: z.number().min(0).max(1).describe('Need for learning, self-improvement'),
  catharsis: z.number().min(0).max(1).describe('Need for emotional release'),
  joy: z.number().min(0).max(1).describe('Need for pleasure, fun'),
  relaxation: z.number().min(0).max(1).describe('Need to unwind, de-stress'),
  meaning: z.number().min(0).max(1).describe('Need for depth, purpose'),
  beauty: z.number().min(0).max(1).describe('Aesthetic appreciation need')
});

/**
 * Context information schema
 */
export const ContextInfoSchema = z.object({
  time: z.object({
    hour: z.number().int().min(0).max(23),
    dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    isWeekend: z.boolean(),
    timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night'])
  }),
  device: z.object({
    type: z.enum(['mobile', 'tablet', 'desktop', 'tv']),
    screenSize: z.enum(['small', 'medium', 'large'])
  }),
  social: z.enum(['alone', 'partner', 'family', 'friends']),
  location: z.object({
    type: z.enum(['home', 'work', 'transit', 'public'])
  }).optional(),
  ambient: z.object({
    noise: z.enum(['quiet', 'moderate', 'loud']),
    lighting: z.enum(['bright', 'dim', 'dark'])
  }).optional()
});

/**
 * Capture method metadata schema
 */
export const CaptureMethodSchema = z.object({
  modality: z.enum(['touch', 'voice', 'text', 'gaze', 'neural']),
  confidence: z.number().min(0).max(1).describe('Confidence in extraction'),
  timestamp: z.string().datetime().describe('ISO 8601 timestamp')
});

/**
 * Universal Emotional State schema
 */
export const UniversalEmotionalStateSchema = z.object({
  // Affective Dimensions (Russell's Circumplex)
  energy: z.number().min(0).max(1).describe('Energy level: 0 (exhausted) to 1 (energized)'),
  valence: z.number().min(-1).max(1).describe('Emotional valence: -1 (negative) to 1 (positive)'),
  arousal: z.number().min(0).max(1).describe('Arousal/excitement: 0 (calm) to 1 (excited)'),
  cognitiveCapacity: z.number().min(0).max(1).describe('Mental bandwidth: 0 (depleted) to 1 (full)'),

  // Psychological Needs (Maslow-inspired)
  needs: EmotionalNeedsSchema,

  // Contextual Metadata
  context: ContextInfoSchema,

  // Input Metadata
  captureMethod: CaptureMethodSchema,

  // Learning Support
  sessionId: z.string().uuid().describe('Session ID for trajectory tracking'),
  userId: z.string().optional().describe('Anonymized user hash')
});

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Emotional needs profile
 */
export interface EmotionalNeeds extends z.infer<typeof EmotionalNeedsSchema> {}

/**
 * Context information
 */
export interface ContextInfo extends z.infer<typeof ContextInfoSchema> {}

/**
 * Capture method metadata
 */
export interface CaptureMethod extends z.infer<typeof CaptureMethodSchema> {}

/**
 * Universal Emotional State
 *
 * Based on Russell's Circumplex Model of Affect + Maslow's Hierarchy.
 * This representation is constant across all content domains and input modalities.
 */
export interface UniversalEmotionalState extends z.infer<typeof UniversalEmotionalStateSchema> {}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a default emotional state
 */
export function createDefaultEmotionalState(sessionId: string, userId?: string): UniversalEmotionalState {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const dayOfWeek = dayNames[day];
  const isWeekend = day === 0 || day === 6;

  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
  else timeOfDay = 'night';

  return {
    energy: 0.5,
    valence: 0,
    arousal: 0.5,
    cognitiveCapacity: 0.7,
    needs: {
      comfort: 0.5,
      escape: 0.5,
      stimulation: 0.5,
      connection: 0.5,
      growth: 0.5,
      catharsis: 0.5,
      joy: 0.5,
      relaxation: 0.5,
      meaning: 0.5,
      beauty: 0.5
    },
    context: {
      time: {
        hour,
        dayOfWeek,
        isWeekend,
        timeOfDay
      },
      device: {
        type: 'desktop',
        screenSize: 'large'
      },
      social: 'alone'
    },
    captureMethod: {
      modality: 'touch',
      confidence: 0.8,
      timestamp: now.toISOString()
    },
    sessionId,
    userId
  };
}

/**
 * Map quiz responses to emotional state
 */
export function quizToEmotionalState(
  mood: 'unwind' | 'engage',
  goal: 'laugh' | 'feel' | 'thrill' | 'think',
  sessionId: string,
  userId?: string
): UniversalEmotionalState {
  const baseState = createDefaultEmotionalState(sessionId, userId);

  // Map quiz responses to emotional dimensions
  const mappings: Record<string, Partial<UniversalEmotionalState>> = {
    'unwind-laugh': {
      energy: 0.3,
      valence: 0.7,
      arousal: 0.4,
      cognitiveCapacity: 0.4,
      needs: {
        ...baseState.needs,
        comfort: 0.7,
        joy: 0.9,
        relaxation: 0.8,
        escape: 0.6
      }
    },
    'unwind-feel': {
      energy: 0.2,
      valence: 0.5,
      arousal: 0.3,
      cognitiveCapacity: 0.6,
      needs: {
        ...baseState.needs,
        comfort: 0.8,
        catharsis: 0.8,
        meaning: 0.7,
        relaxation: 0.9
      }
    },
    'engage-thrill': {
      energy: 0.8,
      valence: 0.6,
      arousal: 0.9,
      cognitiveCapacity: 0.7,
      needs: {
        ...baseState.needs,
        stimulation: 0.9,
        escape: 0.7,
        joy: 0.7,
        catharsis: 0.5
      }
    },
    'engage-think': {
      energy: 0.6,
      valence: 0.4,
      arousal: 0.5,
      cognitiveCapacity: 0.9,
      needs: {
        ...baseState.needs,
        growth: 0.9,
        stimulation: 0.7,
        meaning: 0.8,
        beauty: 0.6
      }
    }
  };

  const key = `${mood}-${goal}`;
  const mapping = mappings[key] || {};

  return {
    ...baseState,
    ...mapping,
    needs: mapping.needs || baseState.needs
  };
}

/**
 * Validate emotional state
 */
export function validateEmotionalState(state: unknown): UniversalEmotionalState {
  return UniversalEmotionalStateSchema.parse(state);
}

/**
 * Calculate emotional distance between two states (cosine similarity)
 */
export function calculateEmotionalDistance(state1: UniversalEmotionalState, state2: UniversalEmotionalState): number {
  // Extract numeric features
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

  // Cosine similarity
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

  if (magnitude1 === 0 || magnitude2 === 0) return 1; // Maximum distance

  const similarity = dotProduct / (magnitude1 * magnitude2);
  return 1 - similarity; // Convert similarity to distance
}

/**
 * Serialize emotional state to storable format
 */
export function serializeEmotionalState(state: UniversalEmotionalState): string {
  return JSON.stringify(state);
}

/**
 * Deserialize emotional state from storage
 */
export function deserializeEmotionalState(data: string): UniversalEmotionalState {
  const parsed = JSON.parse(data);
  return validateEmotionalState(parsed);
}
