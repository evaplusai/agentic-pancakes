/**
 * Simple In-Memory Cache with TTL
 *
 * Provides a simple cache for trending data and API responses.
 * Supports TTL (time-to-live) and automatic cleanup.
 *
 * @module utils/cache
 */

import { createLogger } from './logger.js';

const logger = createLogger('Cache');

// ============================================================================
// Types
// ============================================================================

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

export interface CacheOptions {
  defaultTTL?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of entries
  cleanupInterval?: number; // Cleanup interval in milliseconds
  onEvict?: (key: string, value: unknown) => void;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
}

// ============================================================================
// Cache Implementation
// ============================================================================

export class Cache<T = unknown> {
  private store = new Map<string, CacheEntry<T>>();
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };
  private cleanupTimer?: NodeJS.Timeout;
  private readonly options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      defaultTTL: options.defaultTTL || 3600000, // 1 hour default
      maxSize: options.maxSize || 1000,
      cleanupInterval: options.cleanupInterval || 300000, // 5 minutes default
      onEvict: options.onEvict || (() => {})
    };

    // Start cleanup timer
    this.startCleanup();

    logger.debug('Cache initialized', {
      defaultTTL: this.options.defaultTTL,
      maxSize: this.options.maxSize
    });
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const entry = this.store.get(key);

    if (!entry) {
      this.stats.misses++;
      logger.debug(`Cache miss: ${key}`);
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      this.stats.misses++;
      logger.debug(`Cache miss (expired): ${key}`);
      return undefined;
    }

    // Update hit count
    entry.hits++;
    this.stats.hits++;
    logger.debug(`Cache hit: ${key}`, { hits: entry.hits });

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    const ttlMs = ttl !== undefined ? ttl : this.options.defaultTTL;
    const now = Date.now();

    // Check if we need to evict entries
    if (this.store.size >= this.options.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: now + ttlMs,
      createdAt: now,
      hits: 0
    };

    this.store.set(key, entry);
    logger.debug(`Cache set: ${key}`, { ttl: ttlMs, size: this.store.size });
  }

  /**
   * Check if key exists in cache (without updating stats)
   */
  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete key from cache
   */
  delete(key: string): boolean {
    const deleted = this.store.delete(key);
    if (deleted) {
      logger.debug(`Cache delete: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.store.size;
    this.store.clear();
    logger.info(`Cache cleared`, { entriesRemoved: size });
  }

  /**
   * Get or set value (with factory function)
   */
  async getOrSet(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    logger.debug(`Cache miss, executing factory: ${key}`);
    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      size: this.store.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      hitRate
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.evictions = 0;
    logger.debug('Cache stats reset');
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.store.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | undefined;
    let oldestHits = Infinity;
    let oldestTime = Infinity;

    // Find entry with lowest hits and oldest creation time
    for (const [key, entry] of this.store.entries()) {
      if (entry.hits < oldestHits ||
          (entry.hits === oldestHits && entry.createdAt < oldestTime)) {
        oldestKey = key;
        oldestHits = entry.hits;
        oldestTime = entry.createdAt;
      }
    }

    if (oldestKey) {
      const entry = this.store.get(oldestKey);
      this.store.delete(oldestKey);
      this.stats.evictions++;

      if (entry) {
        this.options.onEvict(oldestKey, entry.value);
      }

      logger.debug(`Cache evicted (LRU): ${oldestKey}`, {
        hits: oldestHits,
        age: Date.now() - oldestTime
      });
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        this.options.onEvict(key, entry.value);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cache cleanup completed`, {
        entriesRemoved: cleaned,
        remainingEntries: this.store.size
      });
    }
  }

  /**
   * Start periodic cleanup
   */
  private startCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.options.cleanupInterval);

    // Ensure cleanup timer doesn't prevent process exit
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Stop periodic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
      logger.debug('Cache cleanup stopped');
    }
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    this.stopCleanup();
    this.clear();
    logger.info('Cache destroyed');
  }
}

// ============================================================================
// Default Cache Instances
// ============================================================================

/**
 * Cache for trending data (15 minute TTL)
 */
export const trendingCache = new Cache({
  defaultTTL: 15 * 60 * 1000, // 15 minutes
  maxSize: 100,
  cleanupInterval: 5 * 60 * 1000 // 5 minutes
});

/**
 * Cache for API responses (1 hour TTL)
 */
export const apiCache = new Cache({
  defaultTTL: 60 * 60 * 1000, // 1 hour
  maxSize: 500,
  cleanupInterval: 10 * 60 * 1000 // 10 minutes
});

/**
 * Cache for content details (2 hour TTL)
 */
export const contentCache = new Cache({
  defaultTTL: 2 * 60 * 60 * 1000, // 2 hours
  maxSize: 1000,
  cleanupInterval: 15 * 60 * 1000 // 15 minutes
});

/**
 * Cache for user profiles (30 minute TTL)
 */
export const userCache = new Cache({
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  maxSize: 200,
  cleanupInterval: 5 * 60 * 1000 // 5 minutes
});

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a cache key from components
 */
export function createCacheKey(...components: (string | number | boolean | undefined)[]): string {
  return components
    .filter(c => c !== undefined)
    .map(c => String(c))
    .join(':');
}

/**
 * Destroy all default caches (for graceful shutdown)
 */
export function destroyAllCaches(): void {
  trendingCache.destroy();
  apiCache.destroy();
  contentCache.destroy();
  userCache.destroy();
  logger.info('All caches destroyed');
}
