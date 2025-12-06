/**
 * Anthropic Claude API Client
 *
 * Wrapper for Anthropic Claude API with support for Haiku and Sonnet models.
 * Includes rate limiting awareness and error handling.
 *
 * @module integrations/anthropic
 */

import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '../utils/logger.js';
import {
  ExternalAPIError,
  RateLimitError,
  TimeoutError,
  withRetry
} from '../utils/error-handler.js';

const logger = createLogger('AnthropicClient');

// ============================================================================
// Types
// ============================================================================

export type ClaudeModel =
  | 'claude-3-5-haiku-latest'
  | 'claude-3-5-sonnet-latest'
  | 'claude-3-7-sonnet-latest';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeRequestOptions {
  model?: ClaudeModel;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  system?: string;
}

export interface ClaudeResponse {
  content: string;
  model: string;
  stopReason: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ClaudeStreamChunk {
  type: 'content_block_delta' | 'message_delta' | 'message_stop';
  delta?: {
    type: 'text_delta';
    text: string;
  };
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_HAIKU_MODEL: ClaudeModel = 'claude-3-5-haiku-latest';
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 1.0;
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Rate limiting (Anthropic's limits)
const MAX_REQUESTS_PER_MINUTE = 50;
const MAX_TOKENS_PER_MINUTE = 40000;

// ============================================================================
// Anthropic Client Class
// ============================================================================

export class AnthropicClient {
  private client: Anthropic;
  private requestCount = 0;
  private tokenCount = 0;
  private lastReset = Date.now();

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;

    if (!key) {
      throw new Error('Anthropic API key is required');
    }

    this.client = new Anthropic({
      apiKey: key
    });

    logger.info('Anthropic client initialized');

    // Reset rate limit counters every minute
    setInterval(() => {
      this.resetRateLimits();
    }, 60000);
  }

  /**
   * Send a message to Claude
   */
  async sendMessage(
    messages: ClaudeMessage[],
    options: ClaudeRequestOptions = {}
  ): Promise<ClaudeResponse> {
    const model = options.model || DEFAULT_HAIKU_MODEL;
    const maxTokens = options.maxTokens || DEFAULT_MAX_TOKENS;
    const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
    const timeout = options.timeout || DEFAULT_TIMEOUT;

    // Check rate limits
    await this.checkRateLimits(maxTokens);

    // Prepare request
    const requestParams = {
      model,
      max_tokens: maxTokens,
      temperature,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      ...(options.system && { system: options.system })
    };

    logger.debug('Sending Claude request', {
      model,
      messageCount: messages.length,
      maxTokens
    });

    try {
      // Execute with retry and timeout
      const response = await withRetry(
        async () => {
          const startTime = Date.now();

          const result = await Promise.race([
            this.client.messages.create(requestParams),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new TimeoutError('Claude API', timeout)), timeout)
            )
          ]);

          const duration = Date.now() - startTime;
          logger.debug('Claude request completed', { duration, model });

          return result;
        },
        'anthropic-message',
        {
          maxRetries: 2,
          baseDelay: 1000,
          timeout
        }
      );

      // Extract response
      const content = response.content
        .filter(block => block.type === 'text')
        .map(block => ('text' in block ? block.text : ''))
        .join('');

      // Update rate limit counters
      this.requestCount++;
      this.tokenCount += response.usage.input_tokens + response.usage.output_tokens;

      return {
        content,
        model: response.model,
        stopReason: response.stop_reason || 'unknown',
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens
        }
      };
    } catch (error) {
      logger.error('Claude API error', error as Error, { model, messages });

      if (error instanceof TimeoutError) {
        throw error;
      }

      // Handle Anthropic-specific errors
      if (error instanceof Anthropic.APIError) {
        if (error.status === 429) {
          throw new RateLimitError('Anthropic API rate limit exceeded', 60);
        }
        throw new ExternalAPIError('Anthropic', error.message, error.status);
      }

      throw new ExternalAPIError('Anthropic', 'Unknown error occurred');
    }
  }

  /**
   * Send a single prompt to Claude (convenience method)
   */
  async prompt(
    prompt: string,
    options: ClaudeRequestOptions = {}
  ): Promise<string> {
    const response = await this.sendMessage(
      [{ role: 'user', content: prompt }],
      options
    );
    return response.content;
  }

  /**
   * Stream message from Claude (for real-time responses)
   */
  async *streamMessage(
    messages: ClaudeMessage[],
    options: ClaudeRequestOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const model = options.model || DEFAULT_HAIKU_MODEL;
    const maxTokens = options.maxTokens || DEFAULT_MAX_TOKENS;
    const temperature = options.temperature ?? DEFAULT_TEMPERATURE;

    // Check rate limits
    await this.checkRateLimits(maxTokens);

    const requestParams = {
      model,
      max_tokens: maxTokens,
      temperature,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      ...(options.system && { system: options.system }),
      stream: true as const
    };

    logger.debug('Starting Claude stream', { model, messageCount: messages.length });

    try {
      const stream = await this.client.messages.create(requestParams);

      for await (const event of stream) {
        if (event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta') {
          yield event.delta.text;
        }
      }

      // Update counters (approximate)
      this.requestCount++;
      this.tokenCount += maxTokens; // Approximate
    } catch (error) {
      logger.error('Claude streaming error', error as Error, { model });

      if (error instanceof Anthropic.APIError) {
        if (error.status === 429) {
          throw new RateLimitError('Anthropic API rate limit exceeded', 60);
        }
        throw new ExternalAPIError('Anthropic', error.message, error.status);
      }

      throw new ExternalAPIError('Anthropic', 'Streaming error occurred');
    }
  }

  /**
   * Check and enforce rate limits
   */
  private async checkRateLimits(estimatedTokens: number): Promise<void> {
    // Check if we're approaching limits
    if (this.requestCount >= MAX_REQUESTS_PER_MINUTE * 0.9 ||
        this.tokenCount + estimatedTokens >= MAX_TOKENS_PER_MINUTE * 0.9) {

      const timeSinceReset = Date.now() - this.lastReset;
      const timeUntilReset = 60000 - timeSinceReset;

      if (timeUntilReset > 0) {
        logger.warn('Approaching rate limit, waiting', {
          waitTime: timeUntilReset,
          requestCount: this.requestCount,
          tokenCount: this.tokenCount
        });

        await new Promise(resolve => setTimeout(resolve, timeUntilReset));
      }
    }
  }

  /**
   * Reset rate limit counters
   */
  private resetRateLimits(): void {
    const wasLimited = this.requestCount >= MAX_REQUESTS_PER_MINUTE * 0.8;

    this.requestCount = 0;
    this.tokenCount = 0;
    this.lastReset = Date.now();

    if (wasLimited) {
      logger.info('Rate limit counters reset', {
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): {
    requestCount: number;
    tokenCount: number;
    requestsRemaining: number;
    tokensRemaining: number;
    resetAt: Date;
  } {
    return {
      requestCount: this.requestCount,
      tokenCount: this.tokenCount,
      requestsRemaining: Math.max(0, MAX_REQUESTS_PER_MINUTE - this.requestCount),
      tokensRemaining: Math.max(0, MAX_TOKENS_PER_MINUTE - this.tokenCount),
      resetAt: new Date(this.lastReset + 60000)
    };
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create Anthropic client for Haiku (fast, cheap)
 */
export function createHaikuClient(apiKey?: string): AnthropicClient {
  return new AnthropicClient(apiKey);
}

/**
 * Create Anthropic client for Sonnet (balanced)
 */
export function createSonnetClient(apiKey?: string): AnthropicClient {
  return new AnthropicClient(apiKey);
}

// ============================================================================
// Default Client Instance
// ============================================================================

let defaultClient: AnthropicClient | undefined;

/**
 * Get default Anthropic client (lazy initialization)
 */
export function getAnthropicClient(): AnthropicClient {
  if (!defaultClient) {
    defaultClient = new AnthropicClient();
  }
  return defaultClient;
}

/**
 * Send message using default client
 */
export async function sendMessage(
  messages: ClaudeMessage[],
  options?: ClaudeRequestOptions
): Promise<ClaudeResponse> {
  return getAnthropicClient().sendMessage(messages, options);
}

/**
 * Send prompt using default client
 */
export async function prompt(
  promptText: string,
  options?: ClaudeRequestOptions
): Promise<string> {
  return getAnthropicClient().prompt(promptText, options);
}
