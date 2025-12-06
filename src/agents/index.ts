/**
 * Agents Index
 *
 * Central export point for all agents in the Universal Content Discovery system.
 *
 * @module agents
 */

// Orchestrator
export * from './orchestrator.js';

// Intent Agent
export * from './intent.js';

// Catalog Agent
export * from './catalog.js';

// Trend Agent
export * from './trend.js';

// Match Agent
export * from './match.js';

// Present Agent
export * from './present.js';

/**
 * Agent types
 */
export type AgentType =
  | 'orchestrator'
  | 'intent'
  | 'catalog'
  | 'trend'
  | 'match'
  | 'present';

/**
 * Agent configuration
 */
export interface AgentConfig {
  maxRetries?: number;
  timeout?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
