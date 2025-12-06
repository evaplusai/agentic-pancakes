/**
 * Error Handling Utilities
 *
 * Custom error classes and error handling utilities for the Universal Content Discovery system.
 * Includes retry logic and graceful degradation helpers.
 *
 * @module utils/error-handler
 */

import { createLogger } from './logger.js';

const logger = createLogger('ErrorHandler');

// ============================================================================
// Custom Error Classes
// ============================================================================

/**
 * Base application error
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code = 'APP_ERROR',
    statusCode = 500,
    isOperational = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, true, context);
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', context?: Record<string, unknown>) {
    super(message, 'AUTHENTICATION_ERROR', 401, true, context);
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions', context?: Record<string, unknown>) {
    super(message, 'AUTHORIZATION_ERROR', 403, true, context);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string, context?: Record<string, unknown>) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404, true, context);
  }
}

/**
 * Timeout error (408)
 */
export class TimeoutError extends AppError {
  constructor(operation: string, timeoutMs: number, context?: Record<string, unknown>) {
    super(
      `Operation '${operation}' timed out after ${timeoutMs}ms`,
      'TIMEOUT_ERROR',
      408,
      true,
      { operation, timeoutMs, ...context }
    );
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message = 'Rate limit exceeded', retryAfter?: number, context?: Record<string, unknown>) {
    super(message, 'RATE_LIMIT_ERROR', 429, true, { retryAfter, ...context });
    this.retryAfter = retryAfter;
  }
}

/**
 * Network error (502)
 */
export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', 502, true, context);
  }
}

/**
 * Service unavailable error (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(service: string, context?: Record<string, unknown>) {
    super(
      `Service '${service}' is temporarily unavailable`,
      'SERVICE_UNAVAILABLE',
      503,
      true,
      { service, ...context }
    );
  }
}

/**
 * Agent error (custom)
 */
export class AgentError extends AppError {
  public readonly agentName: string;

  constructor(agentName: string, message: string, context?: Record<string, unknown>) {
    super(
      `Agent '${agentName}' error: ${message}`,
      'AGENT_ERROR',
      500,
      true,
      { agentName, ...context }
    );
    this.agentName = agentName;
  }
}

/**
 * Vector search error (custom)
 */
export class VectorSearchError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VECTOR_SEARCH_ERROR', 500, true, context);
  }
}

/**
 * External API error (custom)
 */
export class ExternalAPIError extends AppError {
  public readonly apiName: string;

  constructor(apiName: string, message: string, statusCode = 500, context?: Record<string, unknown>) {
    super(
      `External API '${apiName}' error: ${message}`,
      'EXTERNAL_API_ERROR',
      statusCode,
      true,
      { apiName, ...context }
    );
    this.apiName = apiName;
  }
}

// ============================================================================
// Error Classification
// ============================================================================

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError) return true;
  if (error instanceof TimeoutError) return true;
  if (error instanceof RateLimitError) return true;
  if (error instanceof ServiceUnavailableError) return true;

  // Check for common retryable HTTP status codes
  if (error instanceof AppError) {
    return [408, 429, 500, 502, 503, 504].includes(error.statusCode);
  }

  return false;
}

/**
 * Check if error is operational (expected) vs programming error
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Get retry delay for error (exponential backoff)
 */
export function getRetryDelay(error: unknown, attempt: number, baseDelay = 1000): number {
  // Use retry-after header value if available
  if (error instanceof RateLimitError && error.retryAfter) {
    return error.retryAfter * 1000; // Convert to ms
  }

  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.3 * exponentialDelay; // ±30% jitter
  return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
}

// ============================================================================
// Retry Logic
// ============================================================================

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  timeout?: number;
  onRetry?: (error: Error, attempt: number) => void;
  shouldRetry?: (error: Error) => boolean;
}

/**
 * Execute operation with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    timeout,
    onRetry,
    shouldRetry = isRetryableError
  } = options;

  let lastError: Error;
  let operationPromise: Promise<T>;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      // Apply timeout if specified
      if (timeout) {
        operationPromise = Promise.race([
          operation(),
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new TimeoutError(operationName, timeout)), timeout)
          )
        ]);
      } else {
        operationPromise = operation();
      }

      const result = await operationPromise;

      // Log successful retry
      if (attempt > 1) {
        logger.info(`Operation '${operationName}' succeeded after ${attempt} attempts`);
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if we've exhausted attempts
      if (attempt > maxRetries) {
        logger.error(
          `Operation '${operationName}' failed after ${maxRetries} retries`,
          lastError!,
          { operationName, attempts: attempt }
        );
        break;
      }

      // Don't retry if error is not retryable
      if (!shouldRetry(lastError)) {
        logger.warn(
          `Operation '${operationName}' failed with non-retryable error`,
          undefined,
          { operationName, error: lastError.message }
        );
        break;
      }

      // Calculate delay and retry
      const delay = getRetryDelay(lastError, attempt, baseDelay);
      logger.warn(
        `Operation '${operationName}' failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms`,
        lastError,
        { operationName, attempt, delay }
      );

      // Call retry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt);
      }

      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Execute operation with timeout
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  operationName: string,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new TimeoutError(operationName, timeoutMs)), timeoutMs)
    )
  ]);
}

// ============================================================================
// Circuit Breaker Pattern
// ============================================================================

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod?: number;
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private name: string,
    private options: CircuitBreakerOptions
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;

      if (timeSinceLastFailure < this.options.resetTimeout) {
        throw new ServiceUnavailableError(this.name, {
          circuitState: 'open',
          resetIn: this.options.resetTimeout - timeSinceLastFailure
        });
      }

      // Try half-open state
      this.state = 'half-open';
      logger.info(`Circuit breaker for '${this.name}' entering half-open state`);
    }

    try {
      const result = await operation();

      // Success - reset if in half-open state
      if (this.state === 'half-open') {
        this.reset();
        logger.info(`Circuit breaker for '${this.name}' reset to closed state`);
      }

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.options.failureThreshold) {
      this.state = 'open';
      logger.error(
        `Circuit breaker for '${this.name}' opened after ${this.failures} failures`,
        undefined,
        { circuitState: 'open', failures: this.failures }
      );
    }
  }

  private reset(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format error for client response
 */
export function formatErrorResponse(error: unknown): {
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    context?: Record<string, unknown>;
  };
} {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        timestamp: error.timestamp,
        context: error.context
      }
    };
  }

  // Generic error
  const timestamp = new Date().toISOString();
  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      statusCode: 500,
      timestamp
    }
  };
}

/**
 * Safe error message extraction
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

/**
 * Safe error stack extraction
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) return error.stack;
  return undefined;
}
