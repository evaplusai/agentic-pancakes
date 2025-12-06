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
import { getContentByMoodTone, type MockContent } from '../../data/mock-content.js';

/**
 * Convert MockContent to recommendation format
 */
function contentToRecommendation(
  content: MockContent,
  matchScore: number,
  vectorSimilarity: number
): GetRecommendationOutput['topPick'] {
  return {
    id: content.id,
    title: content.title,
    year: content.year,
    runtime: content.runtime,
    language: content.language,
    genres: content.genres,
    overview: content.overview,
    posterUrl: content.posterUrl ?? undefined,
    backdropUrl: content.backdropUrl ?? undefined,
    matchScore,
    utilityScore: matchScore * 0.95,
    vectorSimilarity,
    scoreBreakdown: {
      moodMatch: 0.85 + Math.random() * 0.1,
      intentMatch: 0.82 + Math.random() * 0.12,
      styleMatch: 0.80 + Math.random() * 0.15,
      contextMatch: 0.78 + Math.random() * 0.12,
      trendingBoost: content.isTrending ? 0.1 : 0,
    },
    provenance: {
      evidenceTrajectories: Math.floor(30 + Math.random() * 40),
      confidenceInterval: [matchScore - 0.08, Math.min(0.98, matchScore + 0.05)],
      similarUsersCompleted: `${Math.floor(75 + Math.random() * 20)}% of similar users completed`,
      reasoning: `Matches your ${content.mood} mood with ${content.tone} tone perfectly`,
    },
    deeplink: content.tv5Deeplink,
    availability: {
      regions: ['FR', 'BE', 'CH', 'CA'],
    },
  };
}

/**
 * Map goal to tone
 */
function goalToTone(goal: string): 'laugh' | 'feel' | 'thrill' | 'think' {
  const mapping: Record<string, 'laugh' | 'feel' | 'thrill' | 'think'> = {
    laugh: 'laugh',
    feel: 'feel',
    thrill: 'thrill',
    think: 'think',
    // Additional mappings
    comedy: 'laugh',
    emotion: 'feel',
    action: 'thrill',
    cerebral: 'think',
  };
  return mapping[goal] || 'feel';
}

/**
 * Mock orchestrator agent call
 * Uses real mock content database for recommendations
 */
async function callOrchestratorAgent(
  input: GetRecommendationInput,
  sessionId: string
): Promise<GetRecommendationOutput> {
  const startTime = Date.now();

  // Convert quiz input to emotional state
  const emotionalState = quizToEmotionalState(input.mood, input.goal, sessionId, input.userId);

  // Map input to mood/tone
  const mood = input.mood as 'unwind' | 'engage';
  const tone = goalToTone(input.goal);

  console.log(`[MCP] Getting content for mood=${mood}, tone=${tone}`);

  // Get matching content from mock database
  const matchedContent = getContentByMoodTone(mood, tone, {
    includeTrending: true,
    limit: 10
  });

  // Pick top content (trending first)
  const topContent = matchedContent[0];
  const alternativeContent = matchedContent.slice(1, 4);

  // Calculate match scores
  const topMatchScore = 0.85 + Math.random() * 0.10;
  const topVectorSim = 0.80 + Math.random() * 0.12;

  const mockRecommendation: GetRecommendationOutput = {
    topPick: contentToRecommendation(topContent, topMatchScore, topVectorSim),
    alternatives: input.options?.includeAlternatives
      ? alternativeContent.map((content, i) =>
          contentToRecommendation(
            content,
            topMatchScore - 0.05 - (i * 0.03),
            topVectorSim - 0.04 - (i * 0.02)
          )
        )
      : undefined,
    reasoning: input.options?.explainReasoning
      ? {
          summary: `Perfect for ${mood === 'unwind' ? 'unwinding' : 'engaging'} with ${
            tone === 'feel' ? 'emotional depth' :
            tone === 'laugh' ? 'comedy and laughter' :
            tone === 'thrill' ? 'thrilling action' : 'thought-provoking content'
          }`,
          why:
            `Based on your ${mood} mood and desire to ${tone}, "${topContent.title}" ` +
            `matches your emotional state perfectly. ${topContent.isTrending ? 'This is currently trending! ' : ''}` +
            `The film's pacing and tone are ideal for ${emotionalState.context.time.timeOfDay} viewing.`,
          confidenceLevel: 'high',
        }
      : undefined,
    metadata: {
      requestId: sessionId,
      timestamp: new Date().toISOString(),
      latency: Date.now() - startTime,
      agentsInvolved: ['orchestrator', 'intent', 'catalog', 'match', 'present'],
      skillsApplied: [],
      candidatesEvaluated: matchedContent.length,
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
