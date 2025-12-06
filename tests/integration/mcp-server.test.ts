/**
 * MCP Server Integration Tests
 *
 * Tests the complete MCP server flow
 */

import { describe, it, expect } from '@jest/globals';
import { createServer, TOOLS } from '../../src/mcp/server.js';
import {
  validateGetRecommendationInput,
  validateRefineSearchInput,
} from '../../src/models/recommendation.js';

describe('MCP Server', () => {
  it('should create server successfully', () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it('should export all tools', () => {
    expect(TOOLS).toHaveLength(3);
    expect(TOOLS.map((t) => t.name)).toEqual(['get_recommendation', 'refine_search', 'get_trending']);
  });

  describe('Tool Schemas', () => {
    it('should have valid get_recommendation schema', () => {
      const tool = TOOLS.find((t) => t.name === 'get_recommendation');
      expect(tool).toBeDefined();
      expect(tool!.inputSchema).toBeDefined();
      expect(tool!.inputSchema.required).toEqual(['mood', 'goal']);
    });

    it('should have valid refine_search schema', () => {
      const tool = TOOLS.find((t) => t.name === 'refine_search');
      expect(tool).toBeDefined();
      expect(tool!.inputSchema).toBeDefined();
      expect(tool!.inputSchema.required).toEqual(['previousRequestId', 'feedback']);
    });

    it('should have valid get_trending schema', () => {
      const tool = TOOLS.find((t) => t.name === 'get_trending');
      expect(tool).toBeDefined();
      expect(tool!.inputSchema).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    it('should validate correct get_recommendation input', () => {
      const input = {
        mood: 'unwind',
        goal: 'laugh',
      };

      expect(() => validateGetRecommendationInput(input)).not.toThrow();
    });

    it('should reject invalid mood', () => {
      const input = {
        mood: 'invalid',
        goal: 'laugh',
      };

      expect(() => validateGetRecommendationInput(input)).toThrow();
    });

    it('should reject invalid goal', () => {
      const input = {
        mood: 'unwind',
        goal: 'invalid',
      };

      expect(() => validateGetRecommendationInput(input)).toThrow();
    });

    it('should validate correct refine_search input', () => {
      const input = {
        previousRequestId: '550e8400-e29b-41d4-a716-446655440000',
        feedback: {
          reason: 'too_long',
        },
      };

      expect(() => validateRefineSearchInput(input)).not.toThrow();
    });

    it('should reject invalid UUID in refine_search', () => {
      const input = {
        previousRequestId: 'invalid-uuid',
        feedback: {
          reason: 'too_long',
        },
      };

      expect(() => validateRefineSearchInput(input)).toThrow();
    });
  });
});
