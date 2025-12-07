/**
 * Content Service
 *
 * Fetches and manages content from TMDB API.
 * Provides mood/tone classification and persistent caching to disk.
 *
 * @module services/content-service
 */

import { createLogger } from '../utils/logger.js';
import * as fs from 'fs';
import * as path from 'path';

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
  fetchedAt?: string;
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

interface ContentDatabase {
  version: number;
  lastUpdated: string;
  contentCount: number;
  content: Record<string, Content>;
  moodToneIndex: Record<string, string[]>; // "mood-tone" -> content ids
  trendingIds: string[];
}

// ============================================================================
// Constants
// ============================================================================

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const DATA_DIR = process.env.DATA_DIR || './data';
const CONTENT_DB_FILE = path.join(DATA_DIR, 'content-database.json');
const DB_VERSION = 2;
const CACHE_MAX_AGE_HOURS = 24; // Refresh from TMDB after 24 hours
const PAGES_PER_CATEGORY = 5; // Fetch 5 pages per mood/tone combo (~100 items each)

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
  private memoryCache = new Map<string, { data: Content[]; timestamp: number }>();
  private memoryCacheTimeout = 15 * 60 * 1000; // 15 minutes for memory cache
  private database: ContentDatabase | null = null;
  private initialized = false;

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('TMDB_API_KEY not set - content service will use cached data only');
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
   * Initialize content database - load from disk or fetch fresh
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.ensureDataDirectory();
    this.loadDatabase();

    // Check if we need to refresh data
    const needsRefresh = this.shouldRefreshData();

    if (needsRefresh && this.isConfigured()) {
      logger.info('Content database needs refresh, fetching from TMDB...');
      await this.refreshAllContent();
    } else if (this.database) {
      logger.info('Using cached content database', {
        contentCount: this.database.contentCount,
        lastUpdated: this.database.lastUpdated
      });
    }

    this.initialized = true;
  }

  /**
   * Ensure data directory exists
   */
  private ensureDataDirectory(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        logger.info('Created data directory', { path: DATA_DIR });
      }
    } catch (error) {
      logger.error('Failed to create data directory', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Load database from disk
   */
  private loadDatabase(): void {
    try {
      if (fs.existsSync(CONTENT_DB_FILE)) {
        const data = fs.readFileSync(CONTENT_DB_FILE, 'utf-8');
        this.database = JSON.parse(data) as ContentDatabase;
        logger.info('Loaded content database from disk', {
          contentCount: this.database.contentCount,
          version: this.database.version
        });
      } else {
        logger.info('No existing content database found');
        this.database = this.createEmptyDatabase();
      }
    } catch (error) {
      logger.error('Failed to load content database', error instanceof Error ? error : new Error(String(error)));
      this.database = this.createEmptyDatabase();
    }
  }

  /**
   * Create empty database structure
   */
  private createEmptyDatabase(): ContentDatabase {
    return {
      version: DB_VERSION,
      lastUpdated: new Date().toISOString(),
      contentCount: 0,
      content: {},
      moodToneIndex: {},
      trendingIds: []
    };
  }

  /**
   * Check if data should be refreshed from TMDB
   */
  private shouldRefreshData(): boolean {
    if (!this.database || this.database.contentCount === 0) return true;
    if (this.database.version !== DB_VERSION) return true;

    const lastUpdated = new Date(this.database.lastUpdated);
    const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);

    return hoursSinceUpdate > CACHE_MAX_AGE_HOURS;
  }

  /**
   * Save database to disk
   */
  private saveDatabase(): void {
    if (!this.database) return;

    try {
      this.ensureDataDirectory();
      const tempFile = `${CONTENT_DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.database, null, 2), 'utf-8');
      fs.renameSync(tempFile, CONTENT_DB_FILE);
      logger.debug('Saved content database to disk', { contentCount: this.database.contentCount });
    } catch (error) {
      logger.error('Failed to save content database', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Refresh all content from TMDB API - BULK FETCH
   */
  async refreshAllContent(): Promise<void> {
    if (!this.isConfigured()) {
      logger.warn('Cannot refresh content - TMDB API not configured');
      return;
    }

    logger.info('Starting bulk content refresh from TMDB...');

    this.database = this.createEmptyDatabase();
    const allContent: Content[] = [];

    // Fetch trending content
    try {
      const trending = await this.fetchTrendingBulk();
      trending.forEach(c => {
        c.isTrending = true;
        allContent.push(c);
        this.database!.trendingIds.push(c.id);
      });
      logger.info('Fetched trending content', { count: trending.length });
    } catch (error) {
      logger.error('Failed to fetch trending', error instanceof Error ? error : new Error(String(error)));
    }

    // Fetch content for each mood/tone combination
    const moodToneCombos: Array<{ mood: 'unwind' | 'engage'; tone: 'laugh' | 'feel' | 'thrill' | 'think' }> = [
      { mood: 'unwind', tone: 'laugh' },
      { mood: 'unwind', tone: 'feel' },
      { mood: 'engage', tone: 'thrill' },
      { mood: 'engage', tone: 'think' }
    ];

    for (const combo of moodToneCombos) {
      try {
        const content = await this.fetchByMoodToneBulk(combo.mood, combo.tone);
        const key = `${combo.mood}-${combo.tone}`;
        this.database!.moodToneIndex[key] = [];

        content.forEach(c => {
          if (!allContent.find(existing => existing.id === c.id)) {
            allContent.push(c);
          }
          this.database!.moodToneIndex[key].push(c.id);
        });

        logger.info(`Fetched ${combo.mood}-${combo.tone} content`, { count: content.length });

        // Small delay between categories to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (error) {
        logger.error(`Failed to fetch ${combo.mood}-${combo.tone}`, error instanceof Error ? error : new Error(String(error)));
      }
    }

    // Store all content in database
    const now = new Date().toISOString();
    allContent.forEach(c => {
      c.fetchedAt = now;
      this.database!.content[c.id] = c;
    });

    this.database!.contentCount = Object.keys(this.database!.content).length;
    this.database!.lastUpdated = now;

    // Save to disk
    this.saveDatabase();

    logger.info('Content refresh complete', {
      totalContent: this.database!.contentCount,
      trendingCount: this.database!.trendingIds.length,
      moodToneCategories: Object.keys(this.database!.moodToneIndex).length
    });
  }

  /**
   * Fetch trending content in bulk (multiple pages)
   */
  private async fetchTrendingBulk(): Promise<Content[]> {
    const content: Content[] = [];

    // Fetch 3 pages of movies and TV
    for (let page = 1; page <= 3; page++) {
      try {
        const [movies, tv] = await Promise.all([
          this.fetch<TMDBResponse<TMDBMovie>>('/trending/movie/week', { page: String(page) }),
          this.fetch<TMDBResponse<TMDBTVShow>>('/trending/tv/week', { page: String(page) })
        ]);

        content.push(...movies.results.map(m => this.movieToContent(m, true)));
        content.push(...tv.results.map(t => this.tvToContent(t, true)));
      } catch (error) {
        logger.warn(`Failed to fetch trending page ${page}`, error instanceof Error ? error : new Error(String(error)));
      }
    }

    return content;
  }

  /**
   * Fetch content by mood/tone in bulk (multiple pages)
   */
  private async fetchByMoodToneBulk(
    mood: 'unwind' | 'engage',
    tone: 'laugh' | 'feel' | 'thrill' | 'think'
  ): Promise<Content[]> {
    const genreIds = this.getMoodToneGenres(mood, tone);
    const content: Content[] = [];

    // Fetch multiple pages for more content variety
    for (let page = 1; page <= PAGES_PER_CATEGORY; page++) {
      try {
        const voteThreshold = page <= 2 ? '50' : page <= 4 ? '30' : '20';

        const [movies, tv] = await Promise.all([
          this.fetch<TMDBResponse<TMDBMovie>>('/discover/movie', {
            with_genres: genreIds.join(','),
            sort_by: 'popularity.desc',
            'vote_count.gte': voteThreshold,
            page: String(page)
          }),
          this.fetch<TMDBResponse<TMDBTVShow>>('/discover/tv', {
            with_genres: genreIds.join(','),
            sort_by: 'popularity.desc',
            'vote_count.gte': String(Math.max(10, parseInt(voteThreshold) - 20)),
            page: String(page)
          })
        ]);

        content.push(...movies.results.map(m => this.movieToContent(m)));
        content.push(...tv.results.map(t => this.tvToContent(t)));

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        logger.warn(`Failed to fetch page ${page} for ${mood}-${tone}`, error instanceof Error ? error : new Error(String(error)));
      }
    }

    // Filter to match exact mood/tone
    return content.filter(c => c.mood === mood && c.tone === tone);
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

  // ============================================================================
  // Public API Methods - Use database first, fallback to TMDB
  // ============================================================================

  /**
   * Get trending content
   */
  async getTrending(limit = 20): Promise<Content[]> {
    await this.initialize();

    // Try database first
    if (this.database && this.database.trendingIds.length > 0) {
      const content = this.database.trendingIds
        .slice(0, limit)
        .map(id => this.database!.content[id])
        .filter(Boolean);

      if (content.length > 0) {
        return content;
      }
    }

    // Fallback to direct TMDB fetch
    if (!this.isConfigured()) return [];

    const cacheKey = `trending-${limit}`;
    const cached = this.memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.memoryCacheTimeout) {
      return cached.data;
    }

    try {
      const [movies, tv] = await Promise.all([
        this.fetch<TMDBResponse<TMDBMovie>>('/trending/movie/week'),
        this.fetch<TMDBResponse<TMDBTVShow>>('/trending/tv/week')
      ]);

      const content: Content[] = [
        ...movies.results.slice(0, limit / 2).map(m => this.movieToContent(m, true)),
        ...tv.results.slice(0, limit / 2).map(t => this.tvToContent(t, true))
      ];

      content.sort((a, b) => b.popularity - a.popularity);
      this.memoryCache.set(cacheKey, { data: content, timestamp: Date.now() });

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
    await this.initialize();

    const key = `${mood}-${tone}`;

    // Try database first
    if (this.database && this.database.moodToneIndex[key]?.length > 0) {
      const content = this.database.moodToneIndex[key]
        .map(id => this.database!.content[id])
        .filter(Boolean)
        .filter(c => c.mood === mood && c.tone === tone)
        .sort((a, b) => b.rating - a.rating);

      if (content.length > 0) {
        // Return more than requested limit for personalization variety
        return content.slice(0, Math.max(limit, 80));
      }
    }

    // Fallback to direct TMDB fetch
    if (!this.isConfigured()) return [];

    const cacheKey = `mood-${mood}-${tone}-${limit}`;
    const cached = this.memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.memoryCacheTimeout) {
      return cached.data;
    }

    const genreIds = this.getMoodToneGenres(mood, tone);

    try {
      // Fetch multiple pages
      const [movies1, movies2, movies3, tv1, tv2, tv3] = await Promise.all([
        this.fetch<TMDBResponse<TMDBMovie>>('/discover/movie', {
          with_genres: genreIds.join(','),
          sort_by: 'popularity.desc',
          'vote_count.gte': '50',
          page: '1'
        }),
        this.fetch<TMDBResponse<TMDBMovie>>('/discover/movie', {
          with_genres: genreIds.join(','),
          sort_by: 'popularity.desc',
          'vote_count.gte': '50',
          page: '2'
        }),
        this.fetch<TMDBResponse<TMDBMovie>>('/discover/movie', {
          with_genres: genreIds.join(','),
          sort_by: 'popularity.desc',
          'vote_count.gte': '30',
          page: '3'
        }),
        this.fetch<TMDBResponse<TMDBTVShow>>('/discover/tv', {
          with_genres: genreIds.join(','),
          sort_by: 'popularity.desc',
          'vote_count.gte': '30',
          page: '1'
        }),
        this.fetch<TMDBResponse<TMDBTVShow>>('/discover/tv', {
          with_genres: genreIds.join(','),
          sort_by: 'popularity.desc',
          'vote_count.gte': '30',
          page: '2'
        }),
        this.fetch<TMDBResponse<TMDBTVShow>>('/discover/tv', {
          with_genres: genreIds.join(','),
          sort_by: 'popularity.desc',
          'vote_count.gte': '20',
          page: '3'
        })
      ]);

      const content: Content[] = [
        ...movies1.results.map(m => this.movieToContent(m)),
        ...movies2.results.map(m => this.movieToContent(m)),
        ...movies3.results.map(m => this.movieToContent(m)),
        ...tv1.results.map(t => this.tvToContent(t)),
        ...tv2.results.map(t => this.tvToContent(t)),
        ...tv3.results.map(t => this.tvToContent(t))
      ];

      const filtered = content
        .filter(c => c.mood === mood && c.tone === tone)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, Math.max(limit, 60));

      this.memoryCache.set(cacheKey, { data: filtered, timestamp: Date.now() });
      logger.info('Fetched content by mood/tone', { mood, tone, count: filtered.length });

      return filtered;
    } catch (error) {
      logger.error('Failed to fetch by mood/tone', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
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

      content.sort((a, b) => b.popularity - a.popularity);
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
    await this.initialize();

    // Try database first
    if (this.database?.content[id]) {
      return this.database.content[id];
    }

    // Fallback to TMDB
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

  /**
   * Get all content from database
   */
  async getAllContent(): Promise<Content[]> {
    await this.initialize();
    return this.database ? Object.values(this.database.content) : [];
  }

  /**
   * Get database statistics
   */
  getStats(): {
    totalContent: number;
    trendingCount: number;
    moodToneBreakdown: Record<string, number>;
    lastUpdated: string | null;
    databaseFile: string;
    databaseExists: boolean;
  } {
    const moodToneBreakdown: Record<string, number> = {};
    if (this.database?.moodToneIndex) {
      for (const [key, ids] of Object.entries(this.database.moodToneIndex)) {
        moodToneBreakdown[key] = ids.length;
      }
    }

    return {
      totalContent: this.database?.contentCount || 0,
      trendingCount: this.database?.trendingIds.length || 0,
      moodToneBreakdown,
      lastUpdated: this.database?.lastUpdated || null,
      databaseFile: CONTENT_DB_FILE,
      databaseExists: fs.existsSync(CONTENT_DB_FILE)
    };
  }

  /**
   * Force refresh content from TMDB
   */
  async forceRefresh(): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('TMDB API not configured');
    }
    await this.refreshAllContent();
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
