/**
 * Data Models Index
 *
 * Central export point for all data models in the Universal Content Discovery system.
 *
 * @module models
 */

// Emotional State
export * from './emotional-state.js';

// User Vector
export * from './user-vector.js';

// Content Vector
export * from './content-vector.js';

// Trajectory and Episodes
export * from './trajectory.js';

// Recommendations
export * from './recommendation.js';

/**
 * Version information
 */
export const MODEL_VERSION = '1.0.0';

/**
 * Model types for type discrimination
 */
export type ModelType =
  | 'emotional-state'
  | 'user-vector'
  | 'content-vector'
  | 'trajectory'
  | 'reflexion-episode'
  | 'recommendation';

/**
 * Common interfaces
 */
export interface BaseModel {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Validation result
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Storage metadata
 */
export interface StorageMetadata {
  storedAt: string;
  expiresAt?: string;
  size: number;
  compressed: boolean;
}
