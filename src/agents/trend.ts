/**
 * Trend Agent
 *
 * Fetches trending data from external sources (TMDB, FlixPatrol).
 * Returns trending boosts for content scoring.
 *
 * @module agents/trend
 */

import { UniversalEmotionalState } from '../models/index.js';

/**
 * Trending item
 */
export interface TrendingItem {
  contentId: string;
  rank: number;
  source: 'tmdb' | 'flixpatrol' | 'tv5monde';
  region: string;
  timeWindow: 'daily' | 'weekly';
}

/**
 * Trend Agent
 *
 * Responsible for:
 * - Fetching trending data from TMDB API
 * - Scraping FlixPatrol data (Phase 2)
 * - Converting trending ranks to boost scores
 * - Caching trending data (15-minute TTL)
 */
export class TrendAgent {
  private trendingCache: Map<string, { data: Map<string, number>; expires: number }> = new Map();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  constructor() {}

  /**
   * Get trending boosts for content
   */
  async getBoosts(emotionalState: UniversalEmotionalState): Promise<Map<string, number>> {
    try {
      console.log(`[Trend] Fetching trending boosts`);

      // Check cache
      const cacheKey = 'trending-boosts';
      const cached = this.trendingCache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        console.log(`[Trend] Using cached trending data`);
        return cached.data;
      }

      // Fetch trending data
      const trendingItems = await this.fetchTrendingData();

      // Convert to boost scores
      const boosts = this.calculateBoosts(trendingItems);

      // Cache results
      this.trendingCache.set(cacheKey, {
        data: boosts,
        expires: Date.now() + this.CACHE_TTL
      });

      console.log(`[Trend] Calculated boosts for ${boosts.size} items`);

      return boosts;

    } catch (error) {
      console.error(`[Trend] Failed to get trending boosts:`, error);
      // Return empty boosts on error (non-critical)
      return new Map();
    }
  }

  /**
   * Fetch trending data from external sources
   * MVP: Returns mock data
   * Phase 2: Integrate with TMDB API and FlixPatrol
   */
  private async fetchTrendingData(): Promise<TrendingItem[]> {
    try {
      // Phase 2: TMDB API integration
      // const tmdbTrending = await fetch(
      //   `https://api.themoviedb.org/3/trending/all/week?api_key=${process.env.TMDB_API_KEY}`
      // );
      // const tmdbData = await tmdbTrending.json();
      //
      // return tmdbData.results.map((item, index) => ({
      //   contentId: item.id.toString(),
      //   rank: index + 1,
      //   source: 'tmdb',
      //   region: 'global',
      //   timeWindow: 'weekly'
      // }));

      // MVP: Mock trending data
      const mockTrending: TrendingItem[] = [
        { contentId: 'tv5-001', rank: 1, source: 'tmdb', region: 'FR', timeWindow: 'weekly' },
        { contentId: 'tv5-002', rank: 2, source: 'tmdb', region: 'FR', timeWindow: 'weekly' },
        { contentId: 'tv5-003', rank: 5, source: 'tmdb', region: 'FR', timeWindow: 'weekly' },
        { contentId: 'tv5-006', rank: 8, source: 'tmdb', region: 'FR', timeWindow: 'weekly' },
        { contentId: 'tv5-004', rank: 12, source: 'tmdb', region: 'FR', timeWindow: 'weekly' }
      ];

      return mockTrending;

    } catch (error) {
      console.error(`[Trend] Failed to fetch trending data:`, error);
      return [];
    }
  }

  /**
   * Calculate boost scores from trending ranks
   * Uses logarithmic decay: higher ranks get more boost
   */
  private calculateBoosts(items: TrendingItem[]): Map<string, number> {
    const boosts = new Map<string, number>();

    for (const item of items) {
      // Logarithmic decay: rank 1 = 1.0, rank 10 = ~0.5, rank 100 = ~0.3
      const boost = Math.max(0, 1.0 - Math.log10(item.rank) / 2);

      // Combine boosts from multiple sources (take max)
      const existing = boosts.get(item.contentId) || 0;
      boosts.set(item.contentId, Math.max(existing, boost));
    }

    return boosts;
  }

  /**
   * Get trending items for a specific region
   * Phase 2: Support regional trending data
   */
  async getTrendingByRegion(region: string, limit = 10): Promise<TrendingItem[]> {
    try {
      const allTrending = await this.fetchTrendingData();
      return allTrending
        .filter(item => item.region === region || item.region === 'global')
        .slice(0, limit);
    } catch (error) {
      console.error(`[Trend] Failed to get trending by region:`, error);
      return [];
    }
  }

  /**
   * Clear trending cache
   */
  clearCache(): void {
    this.trendingCache.clear();
    console.log(`[Trend] Cache cleared`);
  }
}
