/**
 * Get Recommendation Handler
 *
 * Implements the get_recommendation tool handler
 * Validates input, calls orchestrator, returns formatted recommendation
 *
 * @module mcp/handlers/get-recommendation
 */

import { v4 as uuidv4 } from 'uuid';
import {
  validateGetRecommendationInput,
  type GetRecommendationInput,
  type GetRecommendationOutput,
} from '../../models/recommendation.js';
import { quizToEmotionalState } from '../../models/emotional-state.js';

/**
 * Mock orchestrator agent call
 * TODO: Replace with actual orchestrator implementation
 */
async function callOrchestratorAgent(
  input: GetRecommendationInput,
  sessionId: string
): Promise<GetRecommendationOutput> {
  const startTime = Date.now();

  // Convert quiz input to emotional state
  const emotionalState = quizToEmotionalState(input.mood, input.goal, sessionId, input.userId);

  // Mock recommendation (will be replaced by actual agent orchestration)
  const mockRecommendation: GetRecommendationOutput = {
    topPick: {
      id: 'tv5monde-123',
      title: 'Le Voyageur',
      year: 2023,
      runtime: 92,
      language: 'fr',
      genres: ['Drama', 'Mystery'],
      overview:
        'A mysterious traveler arrives in a small French village, bringing secrets that will change everything. ' +
        'This emotionally rich drama explores themes of connection, loss, and redemption.',
      posterUrl: 'https://example.com/poster.jpg',
      backdropUrl: 'https://example.com/backdrop.jpg',
      matchScore: 0.87,
      utilityScore: 0.85,
      vectorSimilarity: 0.82,
      scoreBreakdown: {
        moodMatch: 0.9,
        intentMatch: 0.85,
        styleMatch: 0.88,
        contextMatch: 0.82,
        trendingBoost: 0.1,
      },
      provenance: {
        evidenceTrajectories: 47,
        confidenceInterval: [0.79, 0.92],
        similarUsersCompleted: '87% of similar users completed',
        reasoning: 'Based on your desire to unwind with emotional depth',
      },
      deeplink: 'https://www.tv5monde.com/watch/le-voyageur',
      availability: {
        regions: ['FR', 'BE', 'CH', 'CA'],
      },
    },
    alternatives: input.options?.includeAlternatives
      ? [
          {
            id: 'tv5monde-456',
            title: 'Entre Deux Mondes',
            year: 2022,
            runtime: 88,
            language: 'fr',
            genres: ['Drama'],
            overview: 'A touching story of family and forgiveness.',
            matchScore: 0.82,
            utilityScore: 0.80,
            vectorSimilarity: 0.78,
            deeplink: 'https://www.tv5monde.com/watch/entre-deux-mondes',
            availability: { regions: ['FR', 'BE', 'CH'] },
          },
          {
            id: 'tv5monde-789',
            title: 'Les Chemins du Coeur',
            year: 2023,
            runtime: 95,
            language: 'fr',
            genres: ['Drama', 'Romance'],
            overview: 'A heartfelt romance set in the French countryside.',
            matchScore: 0.79,
            utilityScore: 0.77,
            vectorSimilarity: 0.75,
            deeplink: 'https://www.tv5monde.com/watch/les-chemins-du-coeur',
            availability: { regions: ['FR', 'CA'] },
          },
        ]
      : undefined,
    reasoning: input.options?.explainReasoning
      ? {
          summary: `Perfect for ${input.mood === 'unwind' ? 'unwinding' : 'engaging'} with ${
            input.goal === 'feel' ? 'emotional depth' : input.goal
          }`,
          why:
            `Based on your ${input.mood} mood and desire to ${input.goal}, this drama ` +
            `matches your emotional state perfectly. The film's pacing and tone are ideal for ` +
            `${emotionalState.context.time.timeOfDay} viewing.`,
          confidenceLevel: 'high',
        }
      : undefined,
    metadata: {
      requestId: sessionId,
      timestamp: new Date().toISOString(),
      latency: Date.now() - startTime,
      agentsInvolved: ['orchestrator', 'intent', 'catalog', 'match', 'present'],
      skillsApplied: [],
      candidatesEvaluated: 50,
    },
  };

  return mockRecommendation;
}

/**
 * Generate UUID v4
 * Fallback implementation if uuid package is not available
 */
function generateUUID(): string {
  try {
    return uuidv4();
  } catch {
    // Fallback UUID generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

/**
 * Get recommendation handler
 */
export async function getRecommendationHandler(args: unknown) {
  // Validate input
  let input: GetRecommendationInput;
  try {
    input = validateGetRecommendationInput(args);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid input';
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: 'Validation error',
              message: errorMessage,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  // Generate session ID
  const sessionId = generateUUID();

  // Call orchestrator agent
  try {
    const recommendation = await callOrchestratorAgent(input, sessionId);

    // Return formatted response
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(recommendation, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Orchestration failed';
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: 'Orchestration error',
              message: errorMessage,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
}
