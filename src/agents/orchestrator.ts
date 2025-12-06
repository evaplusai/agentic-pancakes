/**
 * Orchestrator Agent
 *
 * Main workflow coordinator for the Universal Content Discovery system.
 * Manages parallel agent execution, error handling, and trajectory storage.
 *
 * @module agents/orchestrator
 */

import {
  GetRecommendationInput,
  GetRecommendationOutput,
  createRecommendationMetadata,
  Trajectory,
  createTrajectory,
  addActionToTrajectory,
  setTrajectoryRecommendation,
  calculateImplicitSatisfaction
} from '../models/index.js';

import { IntentAgent } from './intent.js';
import { CatalogAgent } from './catalog.js';
import { TrendAgent } from './trend.js';
import { MatchAgent } from './match.js';
import { PresentAgent } from './present.js';

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  maxProcessingTime: number; // milliseconds
  minCandidates: number;
  maxAlternatives: number;
  enableTrajectoryStorage: boolean;
  retryAttempts: number;
  retryDelay: number; // milliseconds
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: OrchestratorConfig = {
  maxProcessingTime: 3000,
  minCandidates: 10,
  maxAlternatives: 3,
  enableTrajectoryStorage: true,
  retryAttempts: 3,
  retryDelay: 1000
};

/**
 * Orchestrator Agent
 *
 * Coordinates the multi-agent recommendation workflow:
 * 1. Intent extraction
 * 2. Parallel catalog + trending search
 * 3. Matching and scoring
 * 4. Presentation and formatting
 * 5. Trajectory storage for learning
 */
export class OrchestratorAgent {
  private config: OrchestratorConfig;
  private intentAgent: IntentAgent;
  private catalogAgent: CatalogAgent;
  private trendAgent: TrendAgent;
  private matchAgent: MatchAgent;
  private presentAgent: PresentAgent;

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.intentAgent = new IntentAgent();
    this.catalogAgent = new CatalogAgent();
    this.trendAgent = new TrendAgent();
    this.matchAgent = new MatchAgent();
    this.presentAgent = new PresentAgent();
  }

  /**
   * Process recommendation request
   */
  async process(input: GetRecommendationInput): Promise<GetRecommendationOutput> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const userId = input.userId || 'anonymous';

    console.log(`[Orchestrator] Starting recommendation request ${requestId}`);

    try {
      // Phase 1: Extract emotional state
      const extractIntentStart = Date.now();
      const emotionalState = await this.executeWithRetry(
        () => this.intentAgent.extractIntent(
          input.mood,
          input.goal,
          sessionId,
          userId,
          input.context
        ),
        'intent-extraction'
      );
      const extractIntentLatency = Date.now() - extractIntentStart;

      console.log(`[Orchestrator] Intent extracted in ${extractIntentLatency}ms:`, {
        energy: emotionalState.energy,
        valence: emotionalState.valence,
        arousal: emotionalState.arousal
      });

      // Create trajectory for learning
      const userVector = new Float32Array(64).fill(0.5); // Placeholder for MVP
      let trajectory = createTrajectory(sessionId, userId, emotionalState, userVector);
      trajectory = addActionToTrajectory(
        trajectory,
        'intent',
        'extract_emotional_state',
        { mood: input.mood, goal: input.goal },
        { emotionalState },
        extractIntentLatency
      );

      // Phase 2: Parallel agent processing (catalog + trending)
      const parallelStart = Date.now();
      const [catalogResults, trendingBoosts] = await Promise.all([
        this.executeWithRetry(
          () => this.catalogAgent.search(emotionalState, userId, input.constraints),
          'catalog-search'
        ),
        this.executeWithRetry(
          () => this.trendAgent.getBoosts(emotionalState),
          'trending-boosts'
        ).catch(error => {
          console.warn(`[Orchestrator] Trending agent failed (non-critical):`, error);
          return new Map<string, number>(); // Empty trending data
        })
      ]);
      const parallelLatency = Date.now() - parallelStart;

      console.log(`[Orchestrator] Parallel search completed in ${parallelLatency}ms:`, {
        candidates: catalogResults.length,
        trendingItems: trendingBoosts.size
      });

      trajectory = addActionToTrajectory(
        trajectory,
        'catalog',
        'vector_search',
        { constraints: input.constraints },
        { candidateCount: catalogResults.length },
        parallelLatency
      );

      // Check minimum candidates
      if (catalogResults.length < this.config.minCandidates) {
        throw new Error(`Insufficient candidates found: ${catalogResults.length} < ${this.config.minCandidates}`);
      }

      // Phase 3: Score and rank candidates
      const matchStart = Date.now();
      const rankedResults = await this.executeWithRetry(
        () => this.matchAgent.score(catalogResults, emotionalState, trendingBoosts, userId),
        'match-scoring'
      );
      const matchLatency = Date.now() - matchStart;

      console.log(`[Orchestrator] Matching completed in ${matchLatency}ms:`, {
        topScore: rankedResults[0]?.matchScore
      });

      trajectory = addActionToTrajectory(
        trajectory,
        'match',
        'score_candidates',
        { candidateCount: catalogResults.length },
        { rankedCount: rankedResults.length },
        matchLatency
      );

      // Phase 4: Select top pick and alternatives
      const topPick = rankedResults[0];
      const alternatives = this.selectAlternatives(
        rankedResults.slice(1),
        this.config.maxAlternatives
      );

      // Phase 5: Format final presentation
      const presentStart = Date.now();
      const { topPick: formattedTopPick, alternatives: formattedAlternatives, reasoning } =
        await this.executeWithRetry(
          () => this.presentAgent.format(topPick, alternatives, emotionalState, userId),
          'present-formatting'
        );
      const presentLatency = Date.now() - presentStart;

      trajectory = addActionToTrajectory(
        trajectory,
        'present',
        'format_recommendation',
        { topPickId: topPick.metadata.contentId },
        { formattedOutput: true },
        presentLatency
      );

      // Phase 6: Check processing time
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > this.config.maxProcessingTime) {
        console.warn(`[Orchestrator] Recommendation exceeded time budget: ${elapsedTime}ms > ${this.config.maxProcessingTime}ms`);
      }

      // Phase 7: Store trajectory for learning
      trajectory = setTrajectoryRecommendation(trajectory, {
        contentId: topPick.metadata.contentId,
        matchScore: topPick.matchScore,
        utilityScore: topPick.utilityScore,
        vectorSimilarity: topPick.vectorSimilarity
      });

      if (this.config.enableTrajectoryStorage) {
        await this.storeTrajectory(trajectory);
      }

      // Phase 8: Create metadata
      const metadata = createRecommendationMetadata(
        requestId,
        elapsedTime,
        ['orchestrator', 'intent', 'catalog', 'trend', 'match', 'present'],
        [], // Skills will be added in Phase 2
        catalogResults.length
      );

      console.log(`[Orchestrator] Recommendation completed in ${elapsedTime}ms`);

      return {
        topPick: formattedTopPick,
        alternatives: input.options?.includeAlternatives !== false ? formattedAlternatives : undefined,
        reasoning: input.options?.explainReasoning !== false ? reasoning : undefined,
        metadata
      };

    } catch (error) {
      console.error(`[Orchestrator] Recommendation failed:`, error);
      throw error;
    }
  }

  /**
   * Select diverse alternatives
   */
  private selectAlternatives(candidates: any[], maxCount: number): any[] {
    // Simple diversification: select top N with different genres
    const selected: any[] = [];
    const seenGenres = new Set<string>();

    for (const candidate of candidates) {
      if (selected.length >= maxCount) break;

      // Check if this adds genre diversity
      const genres = candidate.metadata.genres || [];
      const hasNewGenre = genres.some((g: string) => !seenGenres.has(g));

      if (hasNewGenre || selected.length === 0) {
        selected.push(candidate);
        genres.forEach((g: string) => seenGenres.add(g));
      }
    }

    // Fill remaining slots with top-scored items
    while (selected.length < maxCount && selected.length < candidates.length) {
      const nextCandidate = candidates.find(c => !selected.includes(c));
      if (nextCandidate) {
        selected.push(nextCandidate);
      } else {
        break;
      }
    }

    return selected;
  }

  /**
   * Execute operation with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`[Orchestrator] ${operationName} failed (attempt ${attempt}/${this.config.retryAttempts}):`, error);

        if (attempt < this.config.retryAttempts) {
          // Exponential backoff
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`${operationName} failed after ${this.config.retryAttempts} attempts: ${lastError?.message}`);
  }

  /**
   * Store trajectory for learning
   * For MVP, this is a stub - will integrate with AgentDB in Phase 2
   */
  private async storeTrajectory(trajectory: Trajectory): Promise<void> {
    try {
      // MVP: Log trajectory for debugging
      console.log(`[Orchestrator] Trajectory stored:`, {
        id: trajectory.id,
        sessionId: trajectory.session.sessionId,
        userId: trajectory.session.userId,
        recommendationId: trajectory.recommendation.contentId,
        matchScore: trajectory.recommendation.matchScore
      });

      // Phase 2: Integrate with AgentDB ReasoningBank
      // await agentDB.reasoningBank.storeTrajectory(trajectory);

    } catch (error) {
      console.error(`[Orchestrator] Failed to store trajectory:`, error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Record user feedback for trajectory learning
   */
  async recordFeedback(
    requestId: string,
    interactionType: 'view' | 'complete' | 'abandon' | 'skip' | 'refine',
    additionalData?: {
      completionRate?: number;
      watchDuration?: number;
      explicitRating?: number;
    }
  ): Promise<void> {
    try {
      // Calculate implicit satisfaction
      const implicitSatisfaction = calculateImplicitSatisfaction(
        interactionType,
        additionalData?.completionRate,
        additionalData?.watchDuration
      );

      console.log(`[Orchestrator] Feedback recorded for ${requestId}:`, {
        interactionType,
        implicitSatisfaction,
        ...additionalData
      });

      // Phase 2: Update trajectory with outcome and verdict
      // const trajectory = await agentDB.reasoningBank.getTrajectory(requestId);
      // trajectory = setTrajectoryOutcome(trajectory, {
      //   interactionType,
      //   completionRate: additionalData?.completionRate,
      //   watchDuration: additionalData?.watchDuration,
      //   implicitSatisfaction,
      //   explicitRating: additionalData?.explicitRating
      // });
      // const verdict = generateVerdict(trajectory, implicitSatisfaction);
      // trajectory.verdict = verdict;
      // await agentDB.reasoningBank.updateTrajectory(trajectory);

    } catch (error) {
      console.error(`[Orchestrator] Failed to record feedback:`, error);
    }
  }
}
