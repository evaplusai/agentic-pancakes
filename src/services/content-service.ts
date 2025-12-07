/**
 * Content Service
 *
 * Fetches and manages content from TMDB API.
 * Provides mood/tone classification and caching.
 *
 * @module services/content-service
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('ContentService');

// ============================================================================
// Types
// ============================================================================

export interface Content {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  runtime: number;
  language: string;
  genres: string[];
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  rating: number;
  voteCount: number;
  popularity: number;
  type: 'movie' | 'series';
  mood: 'unwind' | 'engage';
  tone: 'laugh' | 'feel' | 'thrill' | 'think';
  energy: number;
  valence: number;
  arousal: number;
  isTrending: boolean;
}

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  runtime?: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  popularity: number;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  backdrop_path: string | null;
  original_language: string;
}

interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  episode_run_time?: number[];
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  popularity: number;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  backdrop_path: string | null;
  original_language: string;
}

interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// ============================================================================
// Constants
// ============================================================================

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Genre ID to name mapping
const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
  // TV specific
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News',
  10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap',
  10767: 'Talk', 10768: 'War & Politics'
};

// Genre to mood/tone mapping
const GENRE_MOOD_TONE: Record<string, { mood: 'unwind' | 'engage'; tone: 'laugh' | 'feel' | 'thrill' | 'think' }> = {
  'Comedy': { mood: 'unwind', tone: 'laugh' },
  'Animation': { mood: 'unwind', tone: 'laugh' },
  'Family': { mood: 'unwind', tone: 'feel' },
  'Romance': { mood: 'unwind', tone: 'feel' },
  'Drama': { mood: 'unwind', tone: 'feel' },
  'Music': { mood: 'unwind', tone: 'feel' },
  'Action': { mood: 'engage', tone: 'thrill' },
  'Action & Adventure': { mood: 'engage', tone: 'thrill' },
  'Thriller': { mood: 'engage', tone: 'thrill' },
  'Horror': { mood: 'engage', tone: 'thrill' },
  'Crime': { mood: 'engage', tone: 'thrill' },
  'Mystery': { mood: 'engage', tone: 'thrill' },
  'War': { mood: 'engage', tone: 'thrill' },
  'War & Politics': { mood: 'engage', tone: 'thrill' },
  'Documentary': { mood: 'engage', tone: 'think' },
  'History': { mood: 'engage', tone: 'think' },
  'Sci-Fi': { mood: 'engage', tone: 'think' },
  'Sci-Fi & Fantasy': { mood: 'engage', tone: 'think' },
  'Fantasy': { mood: 'engage', tone: 'think' },
  'Adventure': { mood: 'engage', tone: 'thrill' },
  'Western': { mood: 'engage', tone: 'thrill' }
};

// ============================================================================
// Content Service Class
// ============================================================================

export class ContentService {
  private apiKey: string;
  private cache = new Map<string, { data: Content[]; timestamp: number }>();
  private cacheTimeout = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('TMDB_API_KEY not set - content service will not work');
    } else {
      logger.info('ContentService initialized with TMDB API');
    }
  }

  /**
   * Check if service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Fetch from TMDB API
   */
  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('language', 'en-US');
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  /**
   * Convert TMDB movie to Content
   */
  private movieToContent(movie: TMDBMovie, isTrending = false): Content {
    const genres = this.getGenres(movie);
    const { mood, tone } = this.classifyMoodTone(genres);
    const metrics = this.calculateMetrics(genres, movie.vote_average);

    return {
      id: `movie-${movie.id}`,
      tmdbId: movie.id,
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 2024,
      runtime: movie.runtime || 120,
      language: movie.original_language,
      genres,
      overview: movie.overview,
      posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null,
      backdropUrl: movie.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${movie.backdrop_path}` : null,
      rating: movie.vote_average,
      voteCount: movie.vote_count,
      popularity: movie.popularity,
      type: 'movie',
      mood,
      tone,
      ...metrics,
      isTrending
    };
  }

  /**
   * Convert TMDB TV show to Content
   */
  private tvToContent(show: TMDBTVShow, isTrending = false): Content {
    const genres = this.getGenres(show);
    const { mood, tone } = this.classifyMoodTone(genres);
    const metrics = this.calculateMetrics(genres, show.vote_average);

    return {
      id: `tv-${show.id}`,
      tmdbId: show.id,
      title: show.name,
      year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : 2024,
      runtime: show.episode_run_time?.[0] || 45,
      language: show.original_language,
      genres,
      overview: show.overview,
      posterUrl: show.poster_path ? `${TMDB_IMAGE_BASE}/w500${show.poster_path}` : null,
      backdropUrl: show.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${show.backdrop_path}` : null,
      rating: show.vote_average,
      voteCount: show.vote_count,
      popularity: show.popularity,
      type: 'series',
      mood,
      tone,
      ...metrics,
      isTrending
    };
  }

  /**
   * Get genre names from TMDB object
   */
  private getGenres(item: TMDBMovie | TMDBTVShow): string[] {
    if (item.genres) {
      return item.genres.map(g => g.name);
    }
    if (item.genre_ids) {
      return item.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean);
    }
    return [];
  }

  /**
   * Classify mood and tone based on genres
   */
  private classifyMoodTone(genres: string[]): { mood: 'unwind' | 'engage'; tone: 'laugh' | 'feel' | 'thrill' | 'think' } {
    // Priority order for classification
    for (const genre of genres) {
      const mapping = GENRE_MOOD_TONE[genre];
      if (mapping) {
        return mapping;
      }
    }
    // Default
    return { mood: 'unwind', tone: 'feel' };
  }

  /**
   * Calculate energy, valence, arousal metrics
   */
  private calculateMetrics(genres: string[], _rating: number): { energy: number; valence: number; arousal: number } {
    const genreSet = new Set(genres.map(g => g.toLowerCase()));

    let energy = 0.5;
    let valence = 0.5;
    let arousal = 0.5;

    if (genreSet.has('action') || genreSet.has('adventure')) energy += 0.3;
    if (genreSet.has('thriller') || genreSet.has('horror')) energy += 0.2;
    if (genreSet.has('comedy')) { energy += 0.1; valence += 0.3; }
    if (genreSet.has('drama')) { energy -= 0.1; valence -= 0.1; }
    if (genreSet.has('documentary')) energy -= 0.2;
    if (genreSet.has('romance')) valence += 0.2;
    if (genreSet.has('horror')) { valence -= 0.3; arousal += 0.35; }
    if (genreSet.has('action') || genreSet.has('thriller')) arousal += 0.3;

    // Clamp values
    energy = Math.max(0, Math.min(1, energy));
    valence = Math.max(-1, Math.min(1, valence));
    arousal = Math.max(0, Math.min(1, arousal));

    return { energy, valence, arousal };
  }

  /**
   * Get cached or fresh data
   */
  private getCached(key: string): Content[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache
   */
  private setCache(key: string, data: Content[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Get trending content
   */
  async getTrending(limit = 20): Promise<Content[]> {
    if (!this.isConfigured()) return [];

    const cacheKey = `trending-${limit}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const [movies, tv] = await Promise.all([
        this.fetch<TMDBResponse<TMDBMovie>>('/trending/movie/week'),
        this.fetch<TMDBResponse<TMDBTVShow>>('/trending/tv/week')
      ]);

      const content: Content[] = [
        ...movies.results.slice(0, limit / 2).map(m => this.movieToContent(m, true)),
        ...tv.results.slice(0, limit / 2).map(t => this.tvToContent(t, true))
      ];

      // Sort by popularity
      content.sort((a, b) => b.popularity - a.popularity);

      this.setCache(cacheKey, content);
      logger.info('Fetched trending content', { count: content.length });
      return content;
    } catch (error) {
      logger.error('Failed to fetch trending', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Get content by mood and tone
   */
  async getByMoodTone(
    mood: 'unwind' | 'engage',
    tone: 'laugh' | 'feel' | 'thrill' | 'think',
    limit = 10
  ): Promise<Content[]> {
    if (!this.isConfigured()) return [];

    const cacheKey = `mood-${mood}-${tone}-${limit}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Map mood/tone to TMDB genre IDs
    const genreIds = this.getMoodToneGenres(mood, tone);

    try {
      const [movies, tv] = await Promise.all([
        this.fetch<TMDBResponse<TMDBMovie>>('/discover/movie', {
          with_genres: genreIds.join(','),
          sort_by: 'popularity.desc',
          'vote_count.gte': '100'
        }),
        this.fetch<TMDBResponse<TMDBTVShow>>('/discover/tv', {
          with_genres: genreIds.join(','),
          sort_by: 'popularity.desc',
          'vote_count.gte': '50'
        })
      ]);

      const content: Content[] = [
        ...movies.results.map(m => this.movieToContent(m)),
        ...tv.results.map(t => this.tvToContent(t))
      ];

      // Filter to match exact mood/tone and sort by rating
      const filtered = content
        .filter(c => c.mood === mood && c.tone === tone)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);

      this.setCache(cacheKey, filtered);
      logger.info('Fetched content by mood/tone', { mood, tone, count: filtered.length });
      return filtered;
    } catch (error) {
      logger.error('Failed to fetch by mood/tone', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Map mood/tone to TMDB genre IDs
   */
  private getMoodToneGenres(mood: 'unwind' | 'engage', tone: 'laugh' | 'feel' | 'thrill' | 'think'): number[] {
    const mapping: Record<string, number[]> = {
      'unwind-laugh': [35, 16], // Comedy, Animation
      'unwind-feel': [18, 10749, 10751, 10402], // Drama, Romance, Family, Music
      'engage-thrill': [28, 53, 27, 80, 9648], // Action, Thriller, Horror, Crime, Mystery
      'engage-think': [99, 878, 36, 14] // Documentary, Sci-Fi, History, Fantasy
    };
    return mapping[`${mood}-${tone}`] || [18]; // Default to drama
  }

  /**
   * Search content
   */
  async search(query: string, limit = 10): Promise<Content[]> {
    if (!this.isConfigured() || !query.trim()) return [];

    try {
      const [movies, tv] = await Promise.all([
        this.fetch<TMDBResponse<TMDBMovie>>('/search/movie', { query }),
        this.fetch<TMDBResponse<TMDBTVShow>>('/search/tv', { query })
      ]);

      const content: Content[] = [
        ...movies.results.slice(0, limit).map(m => this.movieToContent(m)),
        ...tv.results.slice(0, limit).map(t => this.tvToContent(t))
      ];

      // Sort by popularity
      content.sort((a, b) => b.popularity - a.popularity);

      logger.info('Search completed', { query, count: content.length });
      return content.slice(0, limit);
    } catch (error) {
      logger.error('Search failed', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Get content by ID
   */
  async getById(id: string): Promise<Content | null> {
    if (!this.isConfigured()) return null;

    const match = id.match(/^(movie|tv)-(\d+)$/);
    if (!match) return null;

    const [, type, tmdbId] = match;

    try {
      if (type === 'movie') {
        const movie = await this.fetch<TMDBMovie>(`/movie/${tmdbId}`);
        return this.movieToContent(movie);
      } else {
        const tv = await this.fetch<TMDBTVShow>(`/tv/${tmdbId}`);
        return this.tvToContent(tv);
      }
    } catch (error) {
      logger.error('Failed to fetch by ID', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Get similar content
   */
  async getSimilar(id: string, limit = 5): Promise<Content[]> {
    if (!this.isConfigured()) return [];

    const match = id.match(/^(movie|tv)-(\d+)$/);
    if (!match) return [];

    const [, type, tmdbId] = match;

    try {
      if (type === 'movie') {
        const response = await this.fetch<TMDBResponse<TMDBMovie>>(`/movie/${tmdbId}/similar`);
        return response.results.slice(0, limit).map(m => this.movieToContent(m));
      } else {
        const response = await this.fetch<TMDBResponse<TMDBTVShow>>(`/tv/${tmdbId}/similar`);
        return response.results.slice(0, limit).map(t => this.tvToContent(t));
      }
    } catch (error) {
      logger.error('Failed to fetch similar', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }
}

// ============================================================================
// Default Instance
// ============================================================================

let defaultContentService: ContentService | undefined;

export function getContentService(): ContentService {
  if (!defaultContentService) {
    defaultContentService = new ContentService();
  }
  return defaultContentService;
}
