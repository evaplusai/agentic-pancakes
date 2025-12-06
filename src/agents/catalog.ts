/**
 * Catalog Agent
 *
 * Performs vector similarity search against the content catalog.
 * Uses AgentDB HNSW indexing for fast approximate nearest neighbor search.
 *
 * @module agents/catalog
 */

import {
  UniversalEmotionalState,
  ContentVector,
  Constraints,
  createDefaultContentVector
} from '../models/index.js';

/**
 * Content candidate from search
 */
export interface ContentCandidate {
  metadata: {
    contentId: string;
    title: string;
    year?: number;
    runtime?: number;
    language: string;
    genres: string[];
    overview?: string;
    posterPath?: string;
    backdropPath?: string;
    tv5Id?: string;
    tv5Deeplink?: string;
  };
  vectorSimilarity: number;
  matchScore: number;
  utilityScore: number;
}

/**
 * Search options
 */
export interface SearchOptions {
  limit?: number;
  minSimilarity?: number;
  filters?: {
    platform?: string;
    runtime?: { min?: number; max?: number };
    year?: { min?: number; max?: number };
    languages?: string[];
    genres?: string[];
    excludeGenres?: string[];
  };
}

/**
 * Catalog Agent
 *
 * Responsible for:
 * - Converting emotional state to query vector
 * - Performing HNSW vector search
 * - Applying filters and constraints
 * - Returning top K candidates
 */
export class CatalogAgent {
  private readonly DEFAULT_LIMIT = 50;
  private readonly DEFAULT_MIN_SIMILARITY = 0.3;

  constructor() {}

  /**
   * Search content catalog by emotional state
   */
  async search(
    emotionalState: UniversalEmotionalState,
    userId: string,
    constraints?: Constraints
  ): Promise<ContentCandidate[]> {
    try {
      console.log(`[Catalog] Searching catalog for user ${userId}`);

      // Step 1: Convert emotional state to query vector
      const queryVector = this.emotionalStateToVector(emotionalState);

      // Step 2: Build search options from constraints
      const searchOptions = this.buildSearchOptions(constraints);

      // Step 3: Perform vector search (Phase 2: integrate with AgentDB)
      const results = await this.vectorSearch(queryVector, searchOptions);

      console.log(`[Catalog] Found ${results.length} candidates`);

      return results;

    } catch (error) {
      console.error(`[Catalog] Search failed:`, error);
      throw new Error(`Catalog search failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  /**
   * Convert emotional state to 768D query vector
   */
  private emotionalStateToVector(state: UniversalEmotionalState): Float32Array {
    const vector = new Float32Array(768);

    // For MVP, create a simple embedding based on emotional dimensions
    // Phase 2: Use text-embedding-3-small for plot/synopsis embedding

    // Dimensions 0-63: Mood signature
    vector[0] = state.energy;
    vector[1] = (state.valence + 1) / 2; // Normalize -1..1 to 0..1
    vector[2] = state.arousal;
    vector[3] = state.cognitiveCapacity;

    // Dimensions 4-13: Emotional needs
    const needs = Object.values(state.needs);
    needs.forEach((need, i) => {
      vector[4 + i] = need;
    });

    // Dimensions 14-20: Context encoding
    vector[14] = state.context.time.hour / 24;
    vector[15] = state.context.time.isWeekend ? 1.0 : 0.0;
    vector[16] = this.encodeDevice(state.context.device.type);
    vector[17] = this.encodeSocial(state.context.social);

    // Normalize vector
    const norm = this.l2Norm(vector);
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  }

  /**
   * Build search options from constraints
   */
  private buildSearchOptions(constraints?: Constraints): SearchOptions {
    return {
      limit: this.DEFAULT_LIMIT,
      minSimilarity: this.DEFAULT_MIN_SIMILARITY,
      filters: {
        runtime: constraints?.maxRuntime ? { max: constraints.maxRuntime } : undefined,
        year: {
          min: constraints?.minYear,
          max: constraints?.maxYear
        },
        languages: constraints?.languages,
        genres: constraints?.genres,
        excludeGenres: constraints?.excludeGenres
      }
    };
  }

  /**
   * Perform vector search
   * MVP: Returns mock data
   * Phase 2: Integrate with AgentDB HNSW search
   */
  private async vectorSearch(
    queryVector: Float32Array,
    options: SearchOptions
  ): Promise<ContentCandidate[]> {
    try {
      // Phase 2: AgentDB integration
      // const results = await agentDB.vectorStore.search({
      //   query: queryVector,
      //   limit: options.limit,
      //   minSimilarity: options.minSimilarity,
      //   filters: options.filters
      // });
      //
      // return results.map(result => ({
      //   metadata: result.metadata,
      //   vectorSimilarity: result.similarity,
      //   matchScore: 0, // Will be calculated by MatchAgent
      //   utilityScore: 0
      // }));

      // MVP: Return mock candidates
      const mockCandidates: ContentCandidate[] = [
        {
          metadata: {
            contentId: 'tv5-001',
            title: 'Les Intouchables',
            year: 2011,
            runtime: 112,
            language: 'fr',
            genres: ['Comedy', 'Drama'],
            overview: 'A heartwarming story of an unlikely friendship between a wealthy quadriplegic and his caretaker.',
            tv5Id: 'tv5-001',
            tv5Deeplink: 'https://www.tv5monde.com/watch/les-intouchables'
          },
          vectorSimilarity: 0.85,
          matchScore: 0,
          utilityScore: 0
        },
        {
          metadata: {
            contentId: 'tv5-002',
            title: 'Amélie',
            year: 2001,
            runtime: 122,
            language: 'fr',
            genres: ['Comedy', 'Romance'],
            overview: 'A whimsical tale of a young woman who decides to help those around her while struggling with her own isolation.',
            tv5Id: 'tv5-002',
            tv5Deeplink: 'https://www.tv5monde.com/watch/amelie'
          },
          vectorSimilarity: 0.82,
          matchScore: 0,
          utilityScore: 0
        },
        {
          metadata: {
            contentId: 'tv5-003',
            title: 'La Haine',
            year: 1995,
            runtime: 98,
            language: 'fr',
            genres: ['Drama', 'Crime'],
            overview: 'A powerful portrayal of life in the Parisian suburbs following a riot.',
            tv5Id: 'tv5-003',
            tv5Deeplink: 'https://www.tv5monde.com/watch/la-haine'
          },
          vectorSimilarity: 0.78,
          matchScore: 0,
          utilityScore: 0
        },
        {
          metadata: {
            contentId: 'tv5-004',
            title: 'Le Fabuleux Destin d\'Amélie Poulain',
            year: 2001,
            runtime: 122,
            language: 'fr',
            genres: ['Romance', 'Comedy'],
            overview: 'Amélie is an innocent and naive girl in Paris with her own sense of justice.',
            tv5Id: 'tv5-004',
            tv5Deeplink: 'https://www.tv5monde.com/watch/amelie-poulain'
          },
          vectorSimilarity: 0.76,
          matchScore: 0,
          utilityScore: 0
        },
        {
          metadata: {
            contentId: 'tv5-005',
            title: 'La Vie en Rose',
            year: 2007,
            runtime: 140,
            language: 'fr',
            genres: ['Biography', 'Drama', 'Music'],
            overview: 'Biopic of the iconic French singer Édith Piaf.',
            tv5Id: 'tv5-005',
            tv5Deeplink: 'https://www.tv5monde.com/watch/la-vie-en-rose'
          },
          vectorSimilarity: 0.74,
          matchScore: 0,
          utilityScore: 0
        },
        {
          metadata: {
            contentId: 'tv5-006',
            title: 'Bienvenue chez les Ch\'tis',
            year: 2008,
            runtime: 106,
            language: 'fr',
            genres: ['Comedy'],
            overview: 'A French postal worker is transferred to northern France, where he discovers the local culture.',
            tv5Id: 'tv5-006',
            tv5Deeplink: 'https://www.tv5monde.com/watch/bienvenue-chtis'
          },
          vectorSimilarity: 0.72,
          matchScore: 0,
          utilityScore: 0
        },
        {
          metadata: {
            contentId: 'tv5-007',
            title: 'Le Petit Prince',
            year: 2015,
            runtime: 108,
            language: 'fr',
            genres: ['Animation', 'Fantasy', 'Family'],
            overview: 'A little girl lives in a very grown-up world with her mother, who tries to prepare her for it.',
            tv5Id: 'tv5-007',
            tv5Deeplink: 'https://www.tv5monde.com/watch/le-petit-prince'
          },
          vectorSimilarity: 0.70,
          matchScore: 0,
          utilityScore: 0
        },
        {
          metadata: {
            contentId: 'tv5-008',
            title: 'Les Choristes',
            year: 2004,
            runtime: 97,
            language: 'fr',
            genres: ['Drama', 'Music'],
            overview: 'A music teacher inspires his students at a boarding school for troubled boys.',
            tv5Id: 'tv5-008',
            tv5Deeplink: 'https://www.tv5monde.com/watch/les-choristes'
          },
          vectorSimilarity: 0.68,
          matchScore: 0,
          utilityScore: 0
        },
        {
          metadata: {
            contentId: 'tv5-009',
            title: 'Séraphine',
            year: 2008,
            runtime: 125,
            language: 'fr',
            genres: ['Biography', 'Drama'],
            overview: 'The story of Séraphine Louis, a simple maid who became a celebrated painter.',
            tv5Id: 'tv5-009',
            tv5Deeplink: 'https://www.tv5monde.com/watch/seraphine'
          },
          vectorSimilarity: 0.66,
          matchScore: 0,
          utilityScore: 0
        },
        {
          metadata: {
            contentId: 'tv5-010',
            title: 'Ne le dis à personne',
            year: 2006,
            runtime: 131,
            language: 'fr',
            genres: ['Crime', 'Drama', 'Mystery', 'Thriller'],
            overview: 'A doctor receives an email eight years after his wife\'s murder, suggesting she may be alive.',
            tv5Id: 'tv5-010',
            tv5Deeplink: 'https://www.tv5monde.com/watch/ne-le-dis-personne'
          },
          vectorSimilarity: 0.64,
          matchScore: 0,
          utilityScore: 0
        }
      ];

      // Apply filters
      let filtered = mockCandidates;

      if (options.filters?.maxRuntime) {
        filtered = filtered.filter(c =>
          !c.metadata.runtime || c.metadata.runtime <= options.filters!.runtime!.max!
        );
      }

      if (options.filters?.languages && options.filters.languages.length > 0) {
        filtered = filtered.filter(c =>
          options.filters!.languages!.includes(c.metadata.language)
        );
      }

      if (options.filters?.genres && options.filters.genres.length > 0) {
        filtered = filtered.filter(c =>
          c.metadata.genres.some(g => options.filters!.genres!.includes(g))
        );
      }

      if (options.filters?.excludeGenres && options.filters.excludeGenres.length > 0) {
        filtered = filtered.filter(c =>
          !c.metadata.genres.some(g => options.filters!.excludeGenres!.includes(g))
        );
      }

      // Apply similarity threshold
      filtered = filtered.filter(c => c.vectorSimilarity >= (options.minSimilarity || 0));

      // Apply limit
      filtered = filtered.slice(0, options.limit || this.DEFAULT_LIMIT);

      return filtered;

    } catch (error) {
      console.error(`[Catalog] Vector search failed:`, error);
      throw error;
    }
  }

  /**
   * Encode device type to numeric value
   */
  private encodeDevice(device: string): number {
    const encoding: Record<string, number> = {
      mobile: 0.25,
      tablet: 0.50,
      desktop: 0.75,
      tv: 1.0
    };
    return encoding[device] || 0.5;
  }

  /**
   * Encode social context to numeric value
   */
  private encodeSocial(social: string): number {
    const encoding: Record<string, number> = {
      alone: 0.25,
      partner: 0.50,
      friends: 0.75,
      family: 1.0
    };
    return encoding[social] || 0.5;
  }

  /**
   * Calculate L2 norm of vector
   */
  private l2Norm(vector: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < vector.length; i++) {
      sum += vector[i] * vector[i];
    }
    return Math.sqrt(sum);
  }
}
