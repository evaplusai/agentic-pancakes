/**
 * TMDB API Client
 *
 * Client for The Movie Database (TMDB) API.
 * Handles movie/TV details, trending content, and search.
 * Includes rate limiting (40 req/10 sec) and caching.
 *
 * @module integrations/tmdb
 */

import { createLogger } from '../utils/logger.js';
import {
  ExternalAPIError,
  RateLimitError,
  NotFoundError,
  withRetry
} from '../utils/error-handler.js';
import { apiCache, createCacheKey } from '../utils/cache.js';

const logger = createLogger('TMDBClient');

// ============================================================================
// Types
// ============================================================================

export type MediaType = 'movie' | 'tv';
export type TimeWindow = 'day' | 'week';

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  genre_ids: number[];
  popularity: number;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  backdrop_path: string | null;
  original_language: string;
  adult: boolean;
  runtime?: number;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  first_air_date: string;
  genre_ids: number[];
  popularity: number;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  backdrop_path: string | null;
  original_language: string;
  origin_country: string[];
  episode_run_time?: number[];
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBTrendingResponse {
  page: number;
  results: (TMDBMovie | TMDBTVShow)[];
  total_pages: number;
  total_results: number;
}

// ============================================================================
// Configuration
// ============================================================================

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Rate limiting: 40 requests per 10 seconds
const MAX_REQUESTS_PER_WINDOW = 40;
const RATE_LIMIT_WINDOW = 10000; // 10 seconds

// Cache TTLs
const DETAILS_CACHE_TTL = 60 * 60 * 1000; // 1 hour
const TRENDING_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const SEARCH_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// ============================================================================
// Genre Mappings
// ============================================================================

export const MOVIE_GENRES: Record<number, string> = {
  28: 'action',
  12: 'adventure',
  16: 'animation',
  35: 'comedy',
  80: 'crime',
  99: 'documentary',
  18: 'drama',
  10751: 'family',
  14: 'fantasy',
  36: 'history',
  27: 'horror',
  10402: 'music',
  9648: 'mystery',
  10749: 'romance',
  878: 'scifi',
  10770: 'tv_movie',
  53: 'thriller',
  10752: 'war',
  37: 'western'
};

export const TV_GENRES: Record<number, string> = {
  10759: 'action',
  16: 'animation',
  35: 'comedy',
  80: 'crime',
  99: 'documentary',
  18: 'drama',
  10751: 'family',
  10762: 'kids',
  9648: 'mystery',
  10763: 'news',
  10764: 'reality',
  10765: 'scifi',
  10766: 'soap',
  10767: 'talk',
  10768: 'war',
  37: 'western'
};

// ============================================================================
// TMDB Client Class
// ============================================================================

export class TMDBClient {
  private apiKey: string;
  private requestTimestamps: number[] = [];

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TMDB_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('TMDB API key is required');
    }

    logger.info('TMDB client initialized');
  }

  /**
   * Get movie details by ID
   */
  async getMovie(movieId: number): Promise<TMDBMovie> {
    const cacheKey = createCacheKey('tmdb', 'movie', movieId);

    return await apiCache.getOrSet(
      cacheKey,
      async () => {
        await this.checkRateLimit();

        const url = `${TMDB_BASE_URL}/movie/${movieId}`;
        const params = new URLSearchParams({
          api_key: this.apiKey,
          language: 'fr-FR'
        });

        logger.debug(`Fetching movie details: ${movieId}`);

        return await this.fetchWithRetry<TMDBMovie>(
          `${url}?${params}`,
          'movie details'
        );
      },
      DETAILS_CACHE_TTL
    ) as TMDBMovie;
  }

  /**
   * Get TV show details by ID
   */
  async getTVShow(tvId: number): Promise<TMDBTVShow> {
    const cacheKey = createCacheKey('tmdb', 'tv', tvId);

    return await apiCache.getOrSet(
      cacheKey,
      async () => {
        await this.checkRateLimit();

        const url = `${TMDB_BASE_URL}/tv/${tvId}`;
        const params = new URLSearchParams({
          api_key: this.apiKey,
          language: 'fr-FR'
        });

        logger.debug(`Fetching TV show details: ${tvId}`);

        return await this.fetchWithRetry<TMDBTVShow>(
          `${url}?${params}`,
          'tv show details'
        );
      },
      DETAILS_CACHE_TTL
    ) as TMDBTVShow;
  }

  /**
   * Get trending content
   */
  async getTrending(
    mediaType: MediaType = 'movie',
    timeWindow: TimeWindow = 'week'
  ): Promise<TMDBTrendingResponse> {
    const cacheKey = createCacheKey('tmdb', 'trending', mediaType, timeWindow);

    return await apiCache.getOrSet(
      cacheKey,
      async () => {
        await this.checkRateLimit();

        const url = `${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}`;
        const params = new URLSearchParams({
          api_key: this.apiKey,
          language: 'fr-FR'
        });

        logger.debug(`Fetching trending ${mediaType} for ${timeWindow}`);

        return await this.fetchWithRetry<TMDBTrendingResponse>(
          `${url}?${params}`,
          'trending content'
        );
      },
      TRENDING_CACHE_TTL
    ) as TMDBTrendingResponse;
  }

  /**
   * Search for content
   */
  async search(
    query: string,
    mediaType: MediaType = 'movie',
    page = 1
  ): Promise<TMDBTrendingResponse> {
    const cacheKey = createCacheKey('tmdb', 'search', mediaType, query, page);

    return await apiCache.getOrSet(
      cacheKey,
      async () => {
        await this.checkRateLimit();

        const url = `${TMDB_BASE_URL}/search/${mediaType}`;
        const params = new URLSearchParams({
          api_key: this.apiKey,
          language: 'fr-FR',
          query,
          page: page.toString()
        });

        logger.debug(`Searching ${mediaType}: ${query}`);

        return await this.fetchWithRetry<TMDBTrendingResponse>(
          `${url}?${params}`,
          'search'
        );
      },
      SEARCH_CACHE_TTL
    ) as TMDBTrendingResponse;
  }

  /**
   * Get genres for media type
   */
  async getGenres(mediaType: MediaType): Promise<TMDBGenre[]> {
    const cacheKey = createCacheKey('tmdb', 'genres', mediaType);

    return await apiCache.getOrSet(
      cacheKey,
      async () => {
        await this.checkRateLimit();

        const url = `${TMDB_BASE_URL}/genre/${mediaType}/list`;
        const params = new URLSearchParams({
          api_key: this.apiKey,
          language: 'fr-FR'
        });

        logger.debug(`Fetching genres for ${mediaType}`);

        const response = await this.fetchWithRetry<{ genres: TMDBGenre[] }>(
          `${url}?${params}`,
          'genres'
        );

        return response.genres;
      },
      24 * 60 * 60 * 1000 // 24 hours (genres rarely change)
    ) as TMDBGenre[];
  }

  /**
   * Build image URL
   */
  buildImageUrl(path: string | null, size: 'w500' | 'w780' | 'original' = 'w500'): string | null {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  /**
   * Map genre IDs to names
   */
  mapGenreIds(genreIds: number[], mediaType: MediaType): string[] {
    const genreMap = mediaType === 'movie' ? MOVIE_GENRES : TV_GENRES;
    return genreIds
      .map(id => genreMap[id])
      .filter(Boolean);
  }

  /**
   * Check if media is a movie
   */
  isMovie(media: TMDBMovie | TMDBTVShow): media is TMDBMovie {
    return 'title' in media;
  }

  /**
   * Check if media is a TV show
   */
  isTVShow(media: TMDBMovie | TMDBTVShow): media is TMDBTVShow {
    return 'name' in media;
  }

  /**
   * Fetch with retry logic
   */
  private async fetchWithRetry<T>(url: string, operation: string): Promise<T> {
    const result = await withRetry(
      async () => {
        const response = await fetch(url);

        if (!response.ok) {
          if (response.status === 404) {
            throw new NotFoundError('TMDB resource', url);
          }
          if (response.status === 429) {
            throw new RateLimitError('TMDB API rate limit exceeded', 10);
          }
          throw new ExternalAPIError(
            'TMDB',
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
        }

        const data = await response.json() as T;
        return data;
      },
      `tmdb-${operation}`,
      {
        maxRetries: 2,
        baseDelay: 1000
      }
    );

    return result as T;
  }

  /**
   * Check and enforce rate limiting
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();

    // Remove timestamps outside the current window
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < RATE_LIMIT_WINDOW
    );

    // Check if we're at the limit
    if (this.requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      const oldestRequest = this.requestTimestamps[0];
      const waitTime = RATE_LIMIT_WINDOW - (now - oldestRequest);

      if (waitTime > 0) {
        logger.warn('TMDB rate limit reached, waiting', { waitTime });
        await new Promise(resolve => setTimeout(resolve, waitTime));

        // Clean up after waiting
        this.requestTimestamps = this.requestTimestamps.filter(
          timestamp => Date.now() - timestamp < RATE_LIMIT_WINDOW
        );
      }
    }

    // Record this request
    this.requestTimestamps.push(Date.now());
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus(): {
    requestCount: number;
    requestsRemaining: number;
    windowResetIn: number;
  } {
    const now = Date.now();

    // Clean up old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < RATE_LIMIT_WINDOW
    );

    const oldestRequest = this.requestTimestamps[0] || now;
    const windowResetIn = Math.max(0, RATE_LIMIT_WINDOW - (now - oldestRequest));

    return {
      requestCount: this.requestTimestamps.length,
      requestsRemaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - this.requestTimestamps.length),
      windowResetIn
    };
  }
}

// ============================================================================
// Default Client Instance
// ============================================================================

let defaultClient: TMDBClient | undefined;

/**
 * Get default TMDB client (lazy initialization)
 */
export function getTMDBClient(): TMDBClient {
  if (!defaultClient) {
    defaultClient = new TMDBClient();
  }
  return defaultClient;
}

/**
 * Get movie using default client
 */
export async function getMovie(movieId: number): Promise<TMDBMovie> {
  return getTMDBClient().getMovie(movieId);
}

/**
 * Get TV show using default client
 */
export async function getTVShow(tvId: number): Promise<TMDBTVShow> {
  return getTMDBClient().getTVShow(tvId);
}

/**
 * Get trending using default client
 */
export async function getTrending(
  mediaType: MediaType = 'movie',
  timeWindow: TimeWindow = 'week'
): Promise<TMDBTrendingResponse> {
  return getTMDBClient().getTrending(mediaType, timeWindow);
}
