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
  Constraints
} from '../models/index.js';
import {
  ALL_MOCK_CONTENT,
  getContentByMoodTone,
  MockContent
} from '../data/mock-content.js';

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
   * MVP: Returns mock data based on emotional state
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

      // MVP: Use mock content database
      // Derive mood and tone from query vector emotional dimensions
      const energy = queryVector[0];
      const valence = queryVector[1] * 2 - 1; // Convert back to -1..1

      // Map emotional state to mood/tone
      const mood: 'unwind' | 'engage' = energy < 0.5 ? 'unwind' : 'engage';
      let tone: 'laugh' | 'feel' | 'thrill' | 'think';

      if (mood === 'unwind') {
        tone = valence > 0.5 ? 'laugh' : 'feel';
      } else {
        tone = valence > 0 ? 'thrill' : 'think';
      }

      console.log(`[Catalog] Mood: ${mood}, Tone: ${tone}, Energy: ${energy.toFixed(2)}, Valence: ${valence.toFixed(2)}`);

      // Get content matching mood/tone
      const matchedContent = getContentByMoodTone(mood, tone, {
        includeTrending: true,
        limit: 20
      });

      // Convert to ContentCandidate format with calculated similarities
      const mockCandidates: ContentCandidate[] = matchedContent.map((content, index) => {
        // Calculate vector similarity based on emotional match
        const energyDiff = Math.abs(content.energy - energy);
        const valenceDiff = Math.abs(content.valence - valence);
        const similarity = 1 - (energyDiff * 0.3 + valenceDiff * 0.3) - (index * 0.02);

        return this.convertToCandidate(content, Math.max(0.5, similarity));
      });

      // Also include some content from other categories for variety
      const otherContent = ALL_MOCK_CONTENT
        .filter(c => c.mood !== mood || c.tone !== tone)
        .slice(0, 5)
        .map(content => this.convertToCandidate(content, 0.4 + Math.random() * 0.2));

      const allCandidates = [...mockCandidates, ...otherContent];

      // Apply filters
      let filtered = allCandidates;

      if (options.filters?.runtime?.max) {
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

  /**
   * Convert MockContent to ContentCandidate
   */
  private convertToCandidate(content: MockContent, similarity: number): ContentCandidate {
    return {
      metadata: {
        contentId: content.id,
        title: content.title,
        year: content.year,
        runtime: content.runtime,
        language: content.language,
        genres: content.genres,
        overview: content.overview,
        posterPath: content.posterUrl ?? undefined,
        backdropPath: content.backdropUrl ?? undefined,
        tv5Id: content.tv5Id,
        tv5Deeplink: content.tv5Deeplink
      },
      vectorSimilarity: similarity,
      matchScore: 0,
      utilityScore: 0
    };
  }
}
