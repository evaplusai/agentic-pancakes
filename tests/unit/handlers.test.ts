/**
 * Handler Unit Tests
 *
 * Tests individual handler functions
 */

import { describe, it, expect } from '@jest/globals';
import { getRecommendationHandler } from '../../src/mcp/handlers/get-recommendation.js';
import { refineSearchHandler } from '../../src/mcp/handlers/refine-search.js';
import { getTrendingHandler } from '../../src/mcp/handlers/get-trending.js';

describe('Handler Functions', () => {
  describe('getRecommendationHandler', () => {
    it('should return recommendation for valid input', async () => {
      const input = {
        mood: 'unwind',
        goal: 'laugh',
      };

      const result = await getRecommendationHandler(input);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      // Parse the JSON response
      const data = JSON.parse(result.content[0].text);
      expect(data.topPick).toBeDefined();
      expect(data.metadata).toBeDefined();
    });

    it('should return error for invalid input', async () => {
      const input = {
        mood: 'invalid',
        goal: 'invalid',
      };

      const result = await getRecommendationHandler(input);

      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
    });

    it('should include alternatives when requested', async () => {
      const input = {
        mood: 'unwind',
        goal: 'feel',
        options: {
          includeAlternatives: true,
          alternativeCount: 3,
        },
      };

      const result = await getRecommendationHandler(input);
      const data = JSON.parse(result.content[0].text);

      expect(data.alternatives).toBeDefined();
      expect(Array.isArray(data.alternatives)).toBe(true);
      expect(data.alternatives.length).toBeGreaterThan(0);
    });
  });

  describe('refineSearchHandler', () => {
    it('should return refined recommendation for valid input', async () => {
      const input = {
        previousRequestId: '550e8400-e29b-41d4-a716-446655440000',
        feedback: {
          reason: 'too_long',
          detail: 'Looking for something shorter',
        },
      };

      const result = await refineSearchHandler(input);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      const data = JSON.parse(result.content[0].text);
      expect(data.topPick).toBeDefined();
      expect(data.metadata.refinementCount).toBe(1);
      expect(data.metadata.learnedFrom).toBeDefined();
    });

    it('should return error for invalid UUID', async () => {
      const input = {
        previousRequestId: 'invalid-uuid',
        feedback: {
          reason: 'too_long',
        },
      };

      const result = await refineSearchHandler(input);

      expect(result.isError).toBe(true);
    });
  });

  describe('getTrendingHandler', () => {
    it('should return trending content with default parameters', async () => {
      const result = await getTrendingHandler({});

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      const data = JSON.parse(result.content[0].text);
      expect(data.items).toBeDefined();
      expect(data.metadata).toBeDefined();
      expect(data.metadata.platform).toBe('all');
      expect(data.metadata.region).toBe('FR');
    });

    it('should filter by platform', async () => {
      const result = await getTrendingHandler({
        platform: 'netflix',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.items.every((item: any) => item.platform === 'netflix')).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const result = await getTrendingHandler({
        limit: 5,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.items.length).toBeLessThanOrEqual(5);
    });
  });
});
