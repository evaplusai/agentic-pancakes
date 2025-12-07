/**
 * FlixPatrol Service
 *
 * Integrates with FlixPatrol for platform-specific trending data.
 * Provides streaming platform rankings (Netflix, Disney+, etc.)
 *
 * Note: FlixPatrol doesn't have an official API, so this uses web scraping
 * or mock data for the MVP. In production, consider their commercial API.
 *
 * @module services/flixpatrol-service
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('FlixPatrolService');

// ============================================================================
// Types
// ============================================================================

export interface TrendingEntry {
  rank: number;
  title: string;
  platform: StreamingPlatform;
  type: 'movie' | 'tv';
  lastWeekRank: number | null;
  weeksInTop10: number;
  country: string;
}

export type StreamingPlatform =
  | 'netflix'
  | 'disney'
  | 'amazon'
  | 'apple'
  | 'hbo'
  | 'paramount'
  | 'peacock'
  | 'hulu';

export interface PlatformTrending {
  platform: StreamingPlatform;
  movies: TrendingEntry[];
  series: TrendingEntry[];
  lastUpdated: string;
}

// ============================================================================
// Mock Data (for MVP without web scraping)
// ============================================================================

const MOCK_TRENDING: Record<StreamingPlatform, PlatformTrending> = {
  netflix: {
    platform: 'netflix',
    lastUpdated: new Date().toISOString(),
    movies: [
      { rank: 1, title: 'The Silent Patient', platform: 'netflix', type: 'movie', lastWeekRank: 2, weeksInTop10: 3, country: 'US' },
      { rank: 2, title: 'Carry-On', platform: 'netflix', type: 'movie', lastWeekRank: 1, weeksInTop10: 4, country: 'US' },
      { rank: 3, title: 'The Six Triple Eight', platform: 'netflix', type: 'movie', lastWeekRank: 3, weeksInTop10: 2, country: 'US' },
      { rank: 4, title: 'Havoc', platform: 'netflix', type: 'movie', lastWeekRank: null, weeksInTop10: 1, country: 'US' },
      { rank: 5, title: 'Back in Action', platform: 'netflix', type: 'movie', lastWeekRank: 4, weeksInTop10: 5, country: 'US' },
    ],
    series: [
      { rank: 1, title: 'Squid Game: Season 2', platform: 'netflix', type: 'tv', lastWeekRank: 1, weeksInTop10: 4, country: 'US' },
      { rank: 2, title: 'Virgin River', platform: 'netflix', type: 'tv', lastWeekRank: 3, weeksInTop10: 3, country: 'US' },
      { rank: 3, title: 'Black Doves', platform: 'netflix', type: 'tv', lastWeekRank: 2, weeksInTop10: 2, country: 'US' },
      { rank: 4, title: 'Wednesday', platform: 'netflix', type: 'tv', lastWeekRank: 5, weeksInTop10: 6, country: 'US' },
      { rank: 5, title: 'La Palma', platform: 'netflix', type: 'tv', lastWeekRank: null, weeksInTop10: 1, country: 'US' },
    ]
  },
  disney: {
    platform: 'disney',
    lastUpdated: new Date().toISOString(),
    movies: [
      { rank: 1, title: 'Moana 2', platform: 'disney', type: 'movie', lastWeekRank: 1, weeksInTop10: 3, country: 'US' },
      { rank: 2, title: 'Inside Out 2', platform: 'disney', type: 'movie', lastWeekRank: 2, weeksInTop10: 8, country: 'US' },
      { rank: 3, title: 'Deadpool & Wolverine', platform: 'disney', type: 'movie', lastWeekRank: 3, weeksInTop10: 6, country: 'US' },
    ],
    series: [
      { rank: 1, title: 'Percy Jackson', platform: 'disney', type: 'tv', lastWeekRank: 2, weeksInTop10: 4, country: 'US' },
      { rank: 2, title: 'Agatha All Along', platform: 'disney', type: 'tv', lastWeekRank: 1, weeksInTop10: 5, country: 'US' },
      { rank: 3, title: 'The Mandalorian', platform: 'disney', type: 'tv', lastWeekRank: 4, weeksInTop10: 10, country: 'US' },
    ]
  },
  amazon: {
    platform: 'amazon',
    lastUpdated: new Date().toISOString(),
    movies: [
      { rank: 1, title: 'Red One', platform: 'amazon', type: 'movie', lastWeekRank: 1, weeksInTop10: 4, country: 'US' },
      { rank: 2, title: 'Gladiator II', platform: 'amazon', type: 'movie', lastWeekRank: null, weeksInTop10: 1, country: 'US' },
      { rank: 3, title: 'The Boys: Genesis', platform: 'amazon', type: 'movie', lastWeekRank: 3, weeksInTop10: 2, country: 'US' },
    ],
    series: [
      { rank: 1, title: 'Reacher', platform: 'amazon', type: 'tv', lastWeekRank: 1, weeksInTop10: 5, country: 'US' },
      { rank: 2, title: 'The Rings of Power', platform: 'amazon', type: 'tv', lastWeekRank: 2, weeksInTop10: 8, country: 'US' },
      { rank: 3, title: 'Citadel', platform: 'amazon', type: 'tv', lastWeekRank: 4, weeksInTop10: 3, country: 'US' },
    ]
  },
  apple: {
    platform: 'apple',
    lastUpdated: new Date().toISOString(),
    movies: [
      { rank: 1, title: 'Wolfs', platform: 'apple', type: 'movie', lastWeekRank: 1, weeksInTop10: 6, country: 'US' },
      { rank: 2, title: 'Blitz', platform: 'apple', type: 'movie', lastWeekRank: 2, weeksInTop10: 3, country: 'US' },
    ],
    series: [
      { rank: 1, title: 'Severance', platform: 'apple', type: 'tv', lastWeekRank: 1, weeksInTop10: 8, country: 'US' },
      { rank: 2, title: 'Silo', platform: 'apple', type: 'tv', lastWeekRank: 2, weeksInTop10: 5, country: 'US' },
      { rank: 3, title: 'Ted Lasso', platform: 'apple', type: 'tv', lastWeekRank: 3, weeksInTop10: 12, country: 'US' },
    ]
  },
  hbo: {
    platform: 'hbo',
    lastUpdated: new Date().toISOString(),
    movies: [
      { rank: 1, title: 'Dune: Part Two', platform: 'hbo', type: 'movie', lastWeekRank: 1, weeksInTop10: 4, country: 'US' },
      { rank: 2, title: 'Joker: Folie a Deux', platform: 'hbo', type: 'movie', lastWeekRank: 2, weeksInTop10: 3, country: 'US' },
    ],
    series: [
      { rank: 1, title: 'The White Lotus', platform: 'hbo', type: 'tv', lastWeekRank: 1, weeksInTop10: 4, country: 'US' },
      { rank: 2, title: 'The Last of Us', platform: 'hbo', type: 'tv', lastWeekRank: 2, weeksInTop10: 6, country: 'US' },
      { rank: 3, title: 'House of the Dragon', platform: 'hbo', type: 'tv', lastWeekRank: 3, weeksInTop10: 10, country: 'US' },
    ]
  },
  paramount: {
    platform: 'paramount',
    lastUpdated: new Date().toISOString(),
    movies: [
      { rank: 1, title: 'A Quiet Place: Day One', platform: 'paramount', type: 'movie', lastWeekRank: 1, weeksInTop10: 5, country: 'US' },
      { rank: 2, title: 'IF', platform: 'paramount', type: 'movie', lastWeekRank: 2, weeksInTop10: 4, country: 'US' },
    ],
    series: [
      { rank: 1, title: 'Yellowstone', platform: 'paramount', type: 'tv', lastWeekRank: 1, weeksInTop10: 8, country: 'US' },
      { rank: 2, title: 'Star Trek: Discovery', platform: 'paramount', type: 'tv', lastWeekRank: 3, weeksInTop10: 4, country: 'US' },
      { rank: 3, title: 'Tulsa King', platform: 'paramount', type: 'tv', lastWeekRank: 2, weeksInTop10: 5, country: 'US' },
    ]
  },
  peacock: {
    platform: 'peacock',
    lastUpdated: new Date().toISOString(),
    movies: [
      { rank: 1, title: 'Twisters', platform: 'peacock', type: 'movie', lastWeekRank: 1, weeksInTop10: 4, country: 'US' },
      { rank: 2, title: 'The Fall Guy', platform: 'peacock', type: 'movie', lastWeekRank: 2, weeksInTop10: 6, country: 'US' },
    ],
    series: [
      { rank: 1, title: 'The Traitors', platform: 'peacock', type: 'tv', lastWeekRank: 1, weeksInTop10: 3, country: 'US' },
      { rank: 2, title: 'Poker Face', platform: 'peacock', type: 'tv', lastWeekRank: 2, weeksInTop10: 5, country: 'US' },
    ]
  },
  hulu: {
    platform: 'hulu',
    lastUpdated: new Date().toISOString(),
    movies: [
      { rank: 1, title: 'Kingdom of the Planet of the Apes', platform: 'hulu', type: 'movie', lastWeekRank: 1, weeksInTop10: 4, country: 'US' },
      { rank: 2, title: 'Alien: Romulus', platform: 'hulu', type: 'movie', lastWeekRank: 2, weeksInTop10: 5, country: 'US' },
    ],
    series: [
      { rank: 1, title: 'Only Murders in the Building', platform: 'hulu', type: 'tv', lastWeekRank: 1, weeksInTop10: 6, country: 'US' },
      { rank: 2, title: 'The Bear', platform: 'hulu', type: 'tv', lastWeekRank: 2, weeksInTop10: 8, country: 'US' },
      { rank: 3, title: 'Shogun', platform: 'hulu', type: 'tv', lastWeekRank: 3, weeksInTop10: 10, country: 'US' },
    ]
  }
};

// ============================================================================
// FlixPatrol Service Class
// ============================================================================

export class FlixPatrolService {
  private cache = new Map<string, { data: PlatformTrending; timestamp: number }>();
  private cacheTimeout = 60 * 60 * 1000; // 1 hour (FlixPatrol updates daily)

  constructor() {
    logger.info('FlixPatrolService initialized');
  }

  /**
   * Get trending for a specific platform
   */
  async getTrending(platform: StreamingPlatform): Promise<PlatformTrending> {
    const cacheKey = `platform-${platform}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // For MVP, return mock data
    // In production, this would scrape FlixPatrol or use their API
    const data = MOCK_TRENDING[platform];

    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    logger.info('Fetched FlixPatrol trending', { platform });

    return data;
  }

  /**
   * Get trending across all platforms
   */
  async getAllTrending(): Promise<PlatformTrending[]> {
    const platforms: StreamingPlatform[] = [
      'netflix', 'disney', 'amazon', 'apple', 'hbo', 'paramount', 'peacock', 'hulu'
    ];

    const results = await Promise.all(platforms.map(p => this.getTrending(p)));
    return results;
  }

  /**
   * Get global top movies across all platforms
   */
  async getGlobalTopMovies(limit = 10): Promise<TrendingEntry[]> {
    const allTrending = await this.getAllTrending();

    // Aggregate and score movies
    const movieScores = new Map<string, { entry: TrendingEntry; score: number }>();

    for (const platform of allTrending) {
      for (const movie of platform.movies) {
        const existing = movieScores.get(movie.title);
        const score = this.calculateGlobalScore(movie);

        if (!existing || existing.score < score) {
          movieScores.set(movie.title, { entry: movie, score });
        } else {
          // Boost score for appearing on multiple platforms
          existing.score += score * 0.3;
        }
      }
    }

    // Sort by score
    const sorted = Array.from(movieScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.entry);

    return sorted;
  }

  /**
   * Get global top series across all platforms
   */
  async getGlobalTopSeries(limit = 10): Promise<TrendingEntry[]> {
    const allTrending = await this.getAllTrending();

    // Aggregate and score series
    const seriesScores = new Map<string, { entry: TrendingEntry; score: number }>();

    for (const platform of allTrending) {
      for (const series of platform.series) {
        const existing = seriesScores.get(series.title);
        const score = this.calculateGlobalScore(series);

        if (!existing || existing.score < score) {
          seriesScores.set(series.title, { entry: series, score });
        } else {
          // Boost score for appearing on multiple platforms
          existing.score += score * 0.3;
        }
      }
    }

    // Sort by score
    const sorted = Array.from(seriesScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.entry);

    return sorted;
  }

  /**
   * Calculate global score for trending entry
   */
  private calculateGlobalScore(entry: TrendingEntry): number {
    // Base score from rank (inverse)
    let score = 100 - (entry.rank - 1) * 15;

    // Bonus for being in top 10 multiple weeks
    score += entry.weeksInTop10 * 5;

    // Bonus for climbing (lower last week rank = climbing)
    if (entry.lastWeekRank !== null) {
      const climb = entry.lastWeekRank - entry.rank;
      if (climb > 0) score += climb * 3;
    } else {
      // New entry bonus
      score += 8;
    }

    return Math.max(0, score);
  }

  /**
   * Get trending titles list (just titles for matching with TMDB)
   */
  async getTrendingTitles(platform?: StreamingPlatform): Promise<string[]> {
    if (platform) {
      const data = await this.getTrending(platform);
      return [
        ...data.movies.map(m => m.title),
        ...data.series.map(s => s.title)
      ];
    }

    const allTrending = await this.getAllTrending();
    const titles = new Set<string>();

    for (const platform of allTrending) {
      platform.movies.forEach(m => titles.add(m.title));
      platform.series.forEach(s => titles.add(s.title));
    }

    return Array.from(titles);
  }

  /**
   * Check if a title is trending on any platform
   */
  async isTrending(title: string): Promise<{ trending: boolean; platforms: StreamingPlatform[] }> {
    const allTrending = await this.getAllTrending();
    const platforms: StreamingPlatform[] = [];
    const normalizedTitle = title.toLowerCase();

    for (const platform of allTrending) {
      const foundInMovies = platform.movies.some(m =>
        m.title.toLowerCase().includes(normalizedTitle) ||
        normalizedTitle.includes(m.title.toLowerCase())
      );
      const foundInSeries = platform.series.some(s =>
        s.title.toLowerCase().includes(normalizedTitle) ||
        normalizedTitle.includes(s.title.toLowerCase())
      );

      if (foundInMovies || foundInSeries) {
        platforms.push(platform.platform);
      }
    }

    return { trending: platforms.length > 0, platforms };
  }
}

// ============================================================================
// Default Instance
// ============================================================================

let defaultFlixPatrolService: FlixPatrolService | undefined;

export function getFlixPatrolService(): FlixPatrolService {
  if (!defaultFlixPatrolService) {
    defaultFlixPatrolService = new FlixPatrolService();
  }
  return defaultFlixPatrolService;
}
