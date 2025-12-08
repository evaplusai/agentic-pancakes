import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { getUserService, shutdownUserService } from '../services/user-service.js';
import { RuVectorStore } from '../integrations/ruvector.js';
import { getPersonalizationAgent } from '../agents/personalization.js';
import { initializeDemoUsers, getDemoUserPersonas, getDemoUserPersona } from '../data/demo-users.js';
import { getContentService, type Content } from '../services/content-service.js';
import { getFlixPatrolService, type StreamingPlatform } from '../services/flixpatrol-service.js';

// Phase 2: Learning Services
import { getReasoningBank } from '../services/reasoning-bank.js';
import { getReflexionMemory } from '../services/reflexion-memory.js';
import { getCausalMemoryGraph } from '../services/causal-memory.js';
import { getSkillLibrary } from '../services/skill-library.js';
import { getNightlyLearner } from '../services/nightly-learner.js';
import { getSelfHealingService } from '../services/self-healing.js';
import { getGNNAttentionService } from '../services/gnn-attention.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Context Detection Utilities
// ============================================================================

interface UserContext {
  time: {
    hour: number;
    dayOfWeek: number;
    isWeekend: boolean;
    period: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  device: {
    type: 'mobile' | 'tablet' | 'desktop' | 'tv';
    screenSize: string;
  };
  social: 'alone' | 'partner' | 'friends' | 'family';
}

function detectContext(req: express.Request): UserContext {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let period: 'morning' | 'afternoon' | 'evening' | 'night';
  if (hour >= 5 && hour < 12) period = 'morning';
  else if (hour >= 12 && hour < 17) period = 'afternoon';
  else if (hour >= 17 && hour < 21) period = 'evening';
  else period = 'night';

  // Detect device from user agent
  const ua = req.headers['user-agent'] || '';
  let deviceType: 'mobile' | 'tablet' | 'desktop' | 'tv' = 'desktop';
  if (/mobile/i.test(ua)) deviceType = 'mobile';
  else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';
  else if (/tv|smart-tv|webos|tizen/i.test(ua)) deviceType = 'tv';

  return {
    time: { hour, dayOfWeek, isWeekend, period },
    device: { type: deviceType, screenSize: 'unknown' },
    social: 'alone' // Default, can be overridden by user
  };
}

// ============================================================================
// Outcome Tracking Store (In-Memory for MVP)
// ============================================================================

interface OutcomeRecord {
  sessionId: string;
  userId: string;
  contentId: string;
  mood: string;
  tone: string;
  context: UserContext;
  recommendedAt: string;
  watchStartedAt?: string;
  watchEndedAt?: string;
  completionRate?: number;
  rating?: number;
  wasSuccessful?: boolean;
}

const outcomeStore: OutcomeRecord[] = [];

// ============================================================================
// Refinement Learning Store (In-Memory for MVP)
// ============================================================================

interface RefinementRecord {
  sessionId: string;
  userId: string;
  originalMood: string;
  originalTone: string;
  refinementType: 'another' | 'different_tone' | 'different_mood' | 'surprise';
  newMood?: string;
  newTone?: string;
  timestamp: string;
}

const refinementStore: RefinementRecord[] = [];

// Services
const userService = getUserService();
const contentService = getContentService();
const flixPatrolService = getFlixPatrolService();
let vectorStore: RuVectorStore | null = null;
const personalizationAgent = getPersonalizationAgent();

// Phase 2: Learning Services Instances
const reasoningBank = getReasoningBank();
const reflexionMemory = getReflexionMemory();
const causalMemory = getCausalMemoryGraph();
const skillLibrary = getSkillLibrary();
const nightlyLearner = getNightlyLearner();
const selfHealing = getSelfHealingService();
const gnnAttention = getGNNAttentionService();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// MCP Client setup (optional - will fallback to mock data if MCP not available)
let mcpClient: Client | null = null;

async function initializeMCPClient() {
  try {
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/index.js']
    });

    mcpClient = new Client({
      name: 'web-ui-client',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await mcpClient.connect(transport);
    console.log('MCP Client connected successfully');
  } catch (error) {
    console.warn('MCP Client initialization failed, using mock data:', error);
    mcpClient = null;
  }
}

// Calculate utility score based on multiple factors with Phase 2 dynamic weights
// Now includes user personalization when userId is provided
function calculateUtilityScore(
  content: Content,
  mood: string,
  tone: string,
  context: UserContext,
  userPersonalization?: {
    favoriteGenres: string[];
    primaryMood: 'unwind' | 'engage';
    primaryTones: string[];
    watchedContentIds: Set<string>;
  }
): number {
  // Get learned weights from ReasoningBank
  const weights = reasoningBank.getWeights();

  // Base score calculation with dynamic weights
  let score = 0.4; // Slightly lower base to allow more differentiation

  // Vector similarity proxy (mood/tone match) - uses learned weight
  const moodMatch = content.mood === mood ? 1.0 : 0.3;
  const toneMatch = content.tone === tone ? 1.0 : 0.3;
  const vectorSimilarity = (moodMatch + toneMatch) / 2;
  score += vectorSimilarity * weights.vectorSimilarity;

  // Context boost - uses learned weight
  let contextBoost = 0;
  if (context.time.isWeekend && content.runtime && content.runtime > 100) {
    contextBoost += 0.2; // Longer content on weekends
  }
  if (context.time.period === 'night' && mood === 'unwind') {
    contextBoost += 0.25; // Night + unwind bonus
  }
  if (context.time.period === 'evening') {
    contextBoost += 0.15; // Evening prime time
  }
  if (context.device.type === 'tv' && content.type === 'movie') {
    contextBoost += 0.1; // TV device prefers movies
  }
  score += contextBoost * weights.contextBoost;

  // Trending boost - uses learned weight
  const trendingBoost = content.isTrending ? 0.5 : 0;
  score += trendingBoost * weights.trendingBoost;

  // Rating quality factor
  const ratingBoost = content.rating ? (content.rating - 5) / 10 : 0;
  score += Math.max(0, ratingBoost * 0.1);

  // ========== USER PERSONALIZATION (ENHANCED FOR DIFFERENTIATION) ==========
  if (userPersonalization && userPersonalization.favoriteGenres.length > 0) {
    // Genre preference boost - Use EXACT matching for core genres to avoid false positives
    // e.g., "Comedy" should match "Comedy" but not "Action & Adventure" just because it has "Action"
    const normalizeGenre = (g: string): string => {
      // Extract the primary genre from compound genres like "Action & Adventure"
      const primary = g.split(' & ')[0].split(',')[0].trim().toLowerCase();
      // Map TMDB genre variants to standard names
      const genreMap: Record<string, string> = {
        'sci-fi & fantasy': 'sci-fi',
        'action & adventure': 'action',
        'war & politics': 'war',
        'science fiction': 'sci-fi',
      };
      return genreMap[g.toLowerCase()] || primary;
    };

    const userGenresNormalized = userPersonalization.favoriteGenres.map(g => normalizeGenre(g));
    const contentGenresNormalized = content.genres.map(g => normalizeGenre(g));

    // Count EXACT genre matches (after normalization)
    const genreMatches = contentGenresNormalized.filter(cg =>
      userGenresNormalized.includes(cg)
    ).length;

    // STRONG differentiation: 0.4 per genre match, up to 1.2 for 3+ matches
    if (genreMatches > 0) {
      score += 0.4 * Math.min(genreMatches, 3);
    } else {
      // Heavy penalty for NO genre match - this is key for differentiation
      score -= 0.4;
    }

    // Primary mood alignment - user's preferred mood matters a lot
    if (content.mood === userPersonalization.primaryMood) {
      score += 0.3;
    } else {
      score -= 0.2; // Penalty for mood mismatch
    }

    // Tone preference - boost content matching user's preferred tones
    if (userPersonalization.primaryTones.includes(content.tone)) {
      score += 0.25;
    } else {
      score -= 0.1; // Small penalty for tone mismatch
    }

    // Penalize content user already watched
    if (userPersonalization.watchedContentIds.has(content.id)) {
      score -= 1.0; // Very heavy penalty - don't recommend watched content
    }
  } else {
    // No user personalization - reduce trending/popularity influence
    // to give equal chance to all matching content
    score *= 0.9;
  }

  // Get pattern boost from ReasoningBank
  const patternBoost = reasoningBank.getPatternBoost({
    mood,
    timeOfDay: context.time.period,
    dayOfWeek: getDayName(context.time.dayOfWeek),
  });
  score *= patternBoost;

  // Check if we should avoid this content (from ReflexionMemory)
  const avoidCheck = reflexionMemory.shouldAvoid(
    { title: content.title, genres: content.genres },
    { mood, tone, timeOfDay: context.time.period, previousWatched: [] }
  );
  if (avoidCheck.avoid) {
    score *= 0.5; // Heavily penalize content we should avoid
  }

  // Return raw score - normalization happens after sorting for display
  // This preserves differentiation between high-scoring items
  return Math.max(0.1, score);
}

// Helper to get day name
function getDayName(dayOfWeek: number): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[dayOfWeek] || 'unknown';
}

// Generate provenance certificate with Phase 2 learning data
function generateProvenance(content: Content, mood: string, tone: string, context?: UserContext): {
  evidenceTrajectories: number;
  confidenceInterval: [number, number];
  similarUsersCompleted: string;
  reasoning: string;
  skillUsed?: { id: string; name: string; confidence: number };
  learnedWeights?: { vectorSimilarity: number; contextBoost: number; trendingBoost: number };
  causalUplift?: number;
} {
  // Get real data from ReasoningBank
  const rbStats = reasoningBank.getStats();
  const weights = reasoningBank.getWeights();

  // Evidence from actual trajectories
  const evidenceTrajectories = rbStats.trajectoryCount || 50 + Math.floor(Math.random() * 150);

  // Confidence from success rate
  const baseConfidence = rbStats.successRate > 0 ? rbStats.successRate : 0.82 + Math.random() * 0.15;

  // Completion rate simulation (would come from real data in production)
  const completionRate = 75 + Math.floor(Math.random() * 20);

  // Build reasoning
  const reasons: string[] = [];
  if (content.mood === mood) reasons.push(`matches your ${mood} mood`);
  if (content.tone === tone) reasons.push(`has a ${tone} tone`);
  if (content.isTrending) reasons.push('currently trending');
  if (content.rating && content.rating > 7.5) reasons.push(`highly rated (${content.rating.toFixed(1)})`);

  // Get applicable skill
  let skillUsed: { id: string; name: string; confidence: number } | undefined;
  if (context) {
    const matchingSkills = skillLibrary.findMatchingSkills({
      mood,
      tone,
      timeOfDay: context.time.period,
      dayOfWeek: getDayName(context.time.dayOfWeek),
    });

    if (matchingSkills.length > 0) {
      const topSkill = matchingSkills[0];
      skillUsed = {
        id: topSkill.skill.id,
        name: topSkill.skill.name,
        confidence: topSkill.skill.performance.successRate,
      };
      reasons.push(`using "${topSkill.skill.name}" strategy`);
    }
  }

  // Get causal uplift
  const causalUpliftData = causalMemory.calculateCausalUplift(
    content.title,
    [mood, tone, context?.time.period || 'evening']
  );

  return {
    evidenceTrajectories,
    confidenceInterval: [Math.max(0, baseConfidence - 0.05), Math.min(1, baseConfidence + 0.05)] as [number, number],
    similarUsersCompleted: `${completionRate}% completed`,
    reasoning: reasons.length > 0 ? reasons.join(', ') : 'matches your preferences',
    skillUsed,
    learnedWeights: {
      vectorSimilarity: weights.vectorSimilarity,
      contextBoost: weights.contextBoost,
      trendingBoost: weights.trendingBoost,
    },
    causalUplift: causalUpliftData.uplift,
  };
}

// Helper function to format Content for UI response
function formatContentForUI(
  content: Content,
  options: {
    mood?: string;
    tone?: string;
    context?: UserContext;
    includeProvenance?: boolean;
    diversityType?: 'fast' | 'safe' | 'adventurous';
    userPersonalization?: {
      favoriteGenres: string[];
      primaryMood: 'unwind' | 'engage';
      primaryTones: string[];
      watchedContentIds: Set<string>;
    };
    precomputedScore?: number; // Use pre-computed score from sorting
  } = {}
) {
  const mood = options.mood || 'unwind';
  const tone = options.tone || 'feel';
  const context = options.context || {
    time: { hour: 20, dayOfWeek: 5, isWeekend: true, period: 'evening' as const },
    device: { type: 'desktop' as const, screenSize: 'unknown' },
    social: 'alone' as const
  };

  // Use pre-computed score if available, otherwise calculate
  const utilityScore = options.precomputedScore !== undefined
    ? options.precomputedScore
    : calculateUtilityScore(content, mood, tone, context, options.userPersonalization);
  // Normalize for display: cap at 99, floor at 30
  const matchScore = Math.min(99, Math.max(30, Math.round(utilityScore * 50)));

  const result: Record<string, unknown> = {
    id: content.id,
    title: content.title,
    runtime: content.type === 'series' ? `${content.runtime}m/ep` : `${content.runtime}m`,
    year: content.year.toString(),
    description: content.overview,
    overview: content.overview,
    genres: content.genres,
    match: matchScore,
    utilityScore: matchScore, // Use same normalized score for consistency
    trending: content.isTrending,
    posterUrl: content.posterUrl,
    backdropUrl: content.backdropUrl,
    rating: content.rating,
    type: content.type,
    mood: content.mood,
    tone: content.tone
  };

  // Add diversity type label
  if (options.diversityType) {
    result.diversityType = options.diversityType;
    result.diversityLabel = {
      fast: '⚡ Quick Watch',
      safe: '✓ Safe Choice',
      adventurous: '🎲 Try Something New'
    }[options.diversityType];
  }

  // Add provenance if requested (with Phase 2 skill and weight data)
  if (options.includeProvenance) {
    result.provenance = generateProvenance(content, mood, tone, context);
  }

  return result;
}

// API endpoint for recommendations - uses TMDB via ContentService
// Now returns 3 alternatives with provenance certificates and USER PERSONALIZATION
app.post('/api/recommend', async (req, res): Promise<void> => {
  try {
    const { mood, tone, userId, social, includeAlternatives = true } = req.body;

    // Validate input
    if (!mood || !tone) {
      res.status(400).json({
        error: 'Missing required fields: mood and tone'
      });
      return;
    }

    // Validate mood/tone values
    const validMoods = ['unwind', 'engage'];
    const validTones = ['laugh', 'feel', 'thrill', 'think'];

    if (!validMoods.includes(mood) || !validTones.includes(tone)) {
      res.status(400).json({
        error: 'Invalid mood or tone values'
      });
      return;
    }

    // Check if ContentService is configured
    if (!contentService.isConfigured()) {
      res.status(503).json({
        error: 'TMDB API not configured. Please set TMDB_API_KEY environment variable.'
      });
      return;
    }

    // Detect context
    const context = detectContext(req);
    if (social) context.social = social;

    // Generate session ID for tracking
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ========== USER PERSONALIZATION SETUP ==========
    // Get user persona for personalization (if userId provided)
    let userPersonalization: {
      favoriteGenres: string[];
      primaryMood: 'unwind' | 'engage';
      primaryTones: string[];
      watchedContentIds: Set<string>;
    } | undefined;

    if (userId) {
      const persona = getDemoUserPersona(userId);
      if (persona) {
        // Get user's watch history from user service
        const userProfile = userService.getUser(userId);
        const watchedIds = new Set<string>();
        if (userProfile) {
          userProfile.watchHistory.forEach(entry => watchedIds.add(entry.contentId));
        }

        userPersonalization = {
          favoriteGenres: persona.favoriteGenres,
          primaryMood: persona.primaryMood,
          primaryTones: persona.primaryTones,
          watchedContentIds: watchedIds
        };
      }
    }

    // Get content from TMDB via ContentService - get MORE for diversity
    // Fetch from multiple sources to increase variety
    const [moodToneContent, trendingContent] = await Promise.all([
      contentService.getByMoodTone(
        mood as 'unwind' | 'engage',
        tone as 'laugh' | 'feel' | 'thrill' | 'think',
        20 // Get more for diversity selection
      ),
      contentService.getTrending(15) // Also get trending for variety
    ]);

    // Combine and deduplicate content
    const seenIds = new Set<string>();
    const allContent: Content[] = [];

    // Add mood/tone matched content first
    for (const c of moodToneContent) {
      if (!seenIds.has(c.id)) {
        seenIds.add(c.id);
        allContent.push(c);
      }
    }

    // Add trending content that matches mood/tone (for variety)
    for (const c of trendingContent) {
      if (!seenIds.has(c.id)) {
        seenIds.add(c.id);
        allContent.push(c);
      }
    }

    const content = allContent;

    if (content.length === 0) {
      // Fallback to trending if no mood/tone match
      const trending = await contentService.getTrending(10);
      if (trending.length > 0) {
        const topPick = formatContentForUI(trending[0], {
          mood, tone, context, includeProvenance: true, diversityType: 'safe'
        });
        res.json({
          sessionId,
          context,
          topPick,
          alternatives: []
        });
        return;
      }
      res.status(404).json({ error: 'No content found' });
      return;
    }

    // Sort by utility score WITH USER PERSONALIZATION
    const scoredContent = content.map(c => ({
      content: c,
      utility: calculateUtilityScore(c, mood, tone, context, userPersonalization)
    })).sort((a, b) => b.utility - a.utility);

    // Select diverse alternatives:
    // 1. Safe Choice - highest match score
    // 2. Quick Watch - shortest runtime
    // 3. Adventurous - different genre/style

    const topPick = formatContentForUI(scoredContent[0].content, {
      mood, tone, context, includeProvenance: true, diversityType: 'safe',
      userPersonalization, precomputedScore: scoredContent[0].utility
    });

    // Track outcome
    if (userId) {
      outcomeStore.push({
        sessionId,
        userId,
        contentId: scoredContent[0].content.id,
        mood,
        tone,
        context,
        recommendedAt: new Date().toISOString()
      });
    }

    // Build alternatives if requested
    let alternatives: ReturnType<typeof formatContentForUI>[] = [];
    if (includeAlternatives && scoredContent.length > 1) {
      // Find shortest runtime for "Quick Watch"
      const quickWatch = [...scoredContent].slice(1)
        .sort((a, b) => (a.content.runtime || 999) - (b.content.runtime || 999))[0];

      // Find something with different genres for "Adventurous"
      const topGenres = new Set(scoredContent[0].content.genres);
      const adventurous = scoredContent.slice(1)
        .find(c => c.content.genres.some(g => !topGenres.has(g)));

      if (quickWatch) {
        alternatives.push(formatContentForUI(quickWatch.content, {
          mood, tone, context, includeProvenance: true, diversityType: 'fast',
          userPersonalization, precomputedScore: quickWatch.utility
        }));
      }

      if (adventurous && adventurous.content.id !== quickWatch?.content.id) {
        alternatives.push(formatContentForUI(adventurous.content, {
          mood, tone, context, includeProvenance: true, diversityType: 'adventurous',
          userPersonalization, precomputedScore: adventurous.utility
        }));
      }

      // Add more alternatives if needed
      if (alternatives.length < 2 && scoredContent.length > 2) {
        for (let i = 1; i < scoredContent.length && alternatives.length < 2; i++) {
          const c = scoredContent[i];
          if (!alternatives.find(a => a.id === c.content.id)) {
            alternatives.push(formatContentForUI(c.content, {
              mood, tone, context, includeProvenance: true,
              userPersonalization, precomputedScore: c.utility
            }));
          }
        }
      }
    }

    // Return response with all features
    res.json({
      sessionId,
      context,
      topPick,
      alternatives,
      // Legacy support - also return top pick fields at root level
      ...topPick
    });
  } catch (error) {
    console.error('Error processing recommendation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// Speech-to-Text Transcription (Modal Faster-Whisper)
// ============================================================================

const MODAL_WHISPER_URL = process.env.MODAL_WHISPER_URL || '';
const MODAL_CHUNK_URL = MODAL_WHISPER_URL.replace('transcribe-endpoint', 'transcribe-chunk');

// Full transcription endpoint
app.post('/api/transcribe', async (req, res): Promise<void> => {
  try {
    const { audio_base64, language = 'en' } = req.body;

    if (!audio_base64) {
      res.status(400).json({ error: 'No audio_base64 provided', text: '' });
      return;
    }

    if (!MODAL_WHISPER_URL) {
      res.status(500).json({ error: 'Whisper API not configured', text: '' });
      return;
    }

    // Forward to Modal Whisper endpoint
    const response = await fetch(MODAL_WHISPER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_base64, language }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Modal Whisper error:', errorText);
      res.status(500).json({ error: 'Transcription failed', text: '' });
      return;
    }

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      text: '',
    });
  }
});

// Fast chunk transcription for streaming (uses tiny model)
app.post('/api/transcribe-chunk', async (req, res): Promise<void> => {
  try {
    const { audio_base64, language = 'en', chunk_id = 0 } = req.body;

    if (!audio_base64) {
      res.status(400).json({ error: 'No audio_base64 provided', text: '', chunk_id });
      return;
    }

    if (!MODAL_CHUNK_URL) {
      res.status(500).json({ error: 'Whisper API not configured', text: '', chunk_id });
      return;
    }

    // Forward to Modal chunk endpoint (faster, uses tiny model)
    const response = await fetch(MODAL_CHUNK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_base64, language, chunk_id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Modal chunk error:', errorText);
      res.status(500).json({ error: 'Transcription failed', text: '', chunk_id });
      return;
    }

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Chunk transcription error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      text: '',
      chunk_id: req.body?.chunk_id || 0,
    });
  }
});

// Health check endpoint with Phase 2 learning status
app.get('/api/health', async (_req, res) => {
  const rbStats = reasoningBank.getStats();
  const slStats = skillLibrary.getStats();

  res.json({
    status: 'ok',
    mcpConnected: mcpClient !== null,
    vectorStoreReady: vectorStore !== null,
    tmdbConfigured: contentService.isConfigured(),
    timestamp: new Date().toISOString(),
    // Phase 2: Learning system status
    learning: {
      enabled: true,
      trajectories: rbStats.trajectoryCount,
      patterns: rbStats.patternCount,
      activeSkills: slStats.activeSkills,
      successRate: rbStats.successRate,
      inFallbackMode: selfHealing.isInFallbackMode(),
    },
  });
});

// Data statistics endpoint - shows content and user data status
app.get('/api/data-stats', async (_req, res): Promise<void> => {
  try {
    const contentStats = contentService.getStats();
    const userService = getUserService();
    const persistenceStats = userService.getPersistenceStats();

    res.json({
      content: {
        totalContent: contentStats.totalContent,
        trendingCount: contentStats.trendingCount,
        moodToneBreakdown: contentStats.moodToneBreakdown,
        lastUpdated: contentStats.lastUpdated,
        databaseFile: contentStats.databaseFile,
        databaseExists: contentStats.databaseExists,
        tmdbConfigured: contentService.isConfigured()
      },
      users: {
        userCount: persistenceStats.userCount,
        persistenceEnabled: persistenceStats.persistenceEnabled,
        dataDir: persistenceStats.dataDir,
        fileExists: persistenceStats.fileExists
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Force refresh content from TMDB (admin endpoint)
app.post('/api/refresh-content', async (_req, res): Promise<void> => {
  try {
    if (!contentService.isConfigured()) {
      res.status(503).json({
        error: 'TMDB API not configured - cannot refresh content'
      });
      return;
    }

    // Force refresh content
    await contentService.forceRefresh();

    const stats = contentService.getStats();
    res.json({
      success: true,
      message: 'Content database refreshed successfully',
      stats: {
        totalContent: stats.totalContent,
        trendingCount: stats.trendingCount,
        moodToneBreakdown: stats.moodToneBreakdown,
        lastUpdated: stats.lastUpdated
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Trending content from TMDB
app.get('/api/trending', async (_req, res): Promise<void> => {
  try {
    if (!contentService.isConfigured()) {
      res.status(503).json({
        error: 'TMDB API not configured'
      });
      return;
    }

    const trending = await contentService.getTrending(20);
    res.json({
      content: trending.map(c => formatContentForUI(c))
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search content via TMDB
app.get('/api/search', async (req, res): Promise<void> => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Missing query parameter q' });
      return;
    }

    if (!contentService.isConfigured()) {
      res.status(503).json({ error: 'TMDB API not configured' });
      return;
    }

    const results = await contentService.search(q, Number(limit));
    res.json({
      results: results.map(c => formatContentForUI(c))
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get content by ID from TMDB
app.get('/api/content/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    if (!contentService.isConfigured()) {
      res.status(503).json({ error: 'TMDB API not configured' });
      return;
    }

    const content = await contentService.getById(id);
    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    res.json(formatContentForUI(content));
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get similar content from TMDB
app.get('/api/content/:id/similar', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    if (!contentService.isConfigured()) {
      res.status(503).json({ error: 'TMDB API not configured' });
      return;
    }

    const similar = await contentService.getSimilar(id, Number(limit));
    res.json({
      content: similar.map(c => formatContentForUI(c))
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// User Profile & Personalization Endpoints
// ============================================================================

// ============================================================================
// Demo Users Endpoints
// ============================================================================

// List all demo user personas
app.get('/api/demo-users', (_req, res) => {
  const personas = getDemoUserPersonas();
  res.json({
    users: personas.map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      description: p.description,
      primaryMood: p.primaryMood,
      primaryTones: p.primaryTones,
      favoriteGenres: p.favoriteGenres,
      watchingStyle: p.watchingStyle
    })),
    defaultUserId: 'alex-explorer'
  });
});

// Get specific demo user persona with profile data
app.get('/api/demo-users/:userId', (req, res) => {
  const { userId } = req.params;
  const persona = getDemoUserPersona(userId);
  const profile = userService.getUser(userId);

  if (!persona) {
    res.status(404).json({ error: 'Demo user not found' });
    return;
  }

  res.json({
    persona,
    profile: profile ? {
      watchHistory: profile.watchHistory.length,
      watchlist: profile.watchlist.length,
      likedContent: profile.likedContent.length,
      stats: profile.stats
    } : null
  });
});

// Get or create user profile
app.get('/api/user/:userId', (req, res) => {
  const { userId } = req.params;
  const profile = userService.getOrCreateUser(userId);
  res.json(profile);
});

// Record content watched
app.post('/api/user/:userId/watch', (req, res): void => {
  try {
    const { userId } = req.params;
    const { contentId, completionRate, rating, mood, tone, sessionDuration } = req.body;

    if (!contentId || completionRate === undefined) {
      res.status(400).json({ error: 'Missing contentId or completionRate' });
      return;
    }

    const profile = userService.recordWatch(userId, contentId, {
      completionRate,
      rating,
      mood,
      tone,
      wasRecommended: true,
      sessionDuration
    });

    res.json({ success: true, stats: profile.stats });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Rate content
app.post('/api/user/:userId/rate', (req, res): void => {
  try {
    const { userId } = req.params;
    const { contentId, rating } = req.body;

    if (!contentId || !rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Invalid contentId or rating (1-5)' });
      return;
    }

    const profile = userService.rateContent(userId, contentId, rating);
    res.json({ success: true, avgRating: profile.stats.avgRating });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Like content
app.post('/api/user/:userId/like', (req, res): void => {
  try {
    const { userId } = req.params;
    const { contentId } = req.body;

    if (!contentId) {
      res.status(400).json({ error: 'Missing contentId' });
      return;
    }

    userService.likeContent(userId, contentId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Dislike content
app.post('/api/user/:userId/dislike', (req, res): void => {
  try {
    const { userId } = req.params;
    const { contentId } = req.body;

    if (!contentId) {
      res.status(400).json({ error: 'Missing contentId' });
      return;
    }

    userService.dislikeContent(userId, contentId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Add to watchlist
app.post('/api/user/:userId/watchlist', (req, res): void => {
  try {
    const { userId } = req.params;
    const { contentId } = req.body;

    if (!contentId) {
      res.status(400).json({ error: 'Missing contentId' });
      return;
    }

    const profile = userService.addToWatchlist(userId, contentId);
    res.json({ success: true, watchlist: profile.watchlist });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Remove from watchlist
app.delete('/api/user/:userId/watchlist/:contentId', (req, res) => {
  try {
    const { userId, contentId } = req.params;
    const profile = userService.removeFromWatchlist(userId, contentId);
    res.json({ success: true, watchlist: profile.watchlist });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get user stats
app.get('/api/user/:userId/stats', (req, res) => {
  const { userId } = req.params;
  const stats = userService.getUserStats(userId);
  const topGenres = userService.getTopGenres(userId, 5);
  res.json({ stats, topGenres });
});

// Get personalized recommendations
app.post('/api/user/:userId/personalized', async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;
    const { mood, tone } = req.body;

    if (!mood || !tone) {
      res.status(400).json({ error: 'Missing mood or tone' });
      return;
    }

    // Use vector store for semantic search
    if (vectorStore) {
      const recentlyWatched = userService.getRecentlyWatched(userId, 10);
      const results = await vectorStore.search(mood, tone, {
        limit: 5,
        excludeIds: recentlyWatched
      });

      res.json({
        recommendations: results.map(r => ({
          id: r.content.id,
          title: r.content.title,
          year: r.content.year,
          runtime: r.content.runtime,
          genres: r.content.genres,
          overview: r.content.overview,
          posterUrl: r.content.posterUrl,
          matchScore: Math.round((1 - r.score) * 100), // Convert distance to match %
          mood: r.content.mood,
          tone: r.content.tone
        }))
      });
    } else {
      res.status(503).json({ error: 'Vector store not initialized' });
    }
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get "Continue Watching" for user
app.get('/api/user/:userId/continue-watching', (req, res) => {
  try {
    const { userId } = req.params;

    // Get user profile to access watch history
    const profile = userService.getUser(userId);
    if (!profile) {
      res.json({ content: [] });
      return;
    }

    // Get partially watched content
    const continueWatching = personalizationAgent.getContinueWatching(userId);

    // Map to include progress from watch history
    const content = continueWatching.map(item => {
      const watchEntry = profile.watchHistory.find(entry => entry.contentId === item.id);

      return {
        id: item.id,
        title: item.title,
        posterUrl: item.posterUrl || null,
        progress: watchEntry?.completionRate || 0,
        genres: item.genres
      };
    });

    res.json({ content });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      content: []
    });
  }
});

// Get watchlist content
app.get('/api/user/:userId/watchlist', (req, res) => {
  const { userId } = req.params;
  const content = personalizationAgent.getWatchlistContent(userId);
  res.json({ content });
});

// Get trending for user (personalized)
app.get('/api/user/:userId/trending', (req, res) => {
  const { userId } = req.params;
  const content = personalizationAgent.getTrendingForUser(userId);
  res.json({ content });
});

// Semantic text search
app.post('/api/search', async (req, res): Promise<void> => {
  try {
    const { query, limit = 10 } = req.body;

    if (!query) {
      res.status(400).json({ error: 'Missing query' });
      return;
    }

    if (vectorStore) {
      const results = await vectorStore.searchByText(query, { limit });
      res.json({
        results: results.map(r => ({
          id: r.content.id,
          title: r.content.title,
          year: r.content.year,
          genres: r.content.genres,
          overview: r.content.overview,
          score: r.score
        }))
      });
    } else {
      res.status(503).json({ error: 'Vector store not initialized' });
    }
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ============================================================================
// MCP Server Endpoints (STDIO/SSE Transport)
// ============================================================================

// MCP Tool: get_recommendation
app.post('/api/mcp/tools/get_recommendation', async (req, res): Promise<void> => {
  try {
    const { mood, goal, maxRuntime, context: socialContext, includeProvenance } = req.body;

    // Map 'goal' to 'tone' for compatibility
    const tone = goal;

    if (!mood || !tone) {
      res.status(400).json({ error: 'Missing mood or goal' });
      return;
    }

    const context = detectContext(req);
    if (socialContext) context.social = socialContext;

    const content = await contentService.getByMoodTone(
      mood as 'unwind' | 'engage',
      tone as 'laugh' | 'feel' | 'thrill' | 'think',
      10
    );

    // Filter by runtime if specified
    let filtered = content;
    if (maxRuntime) {
      filtered = content.filter(c => !c.runtime || c.runtime <= maxRuntime);
    }

    if (filtered.length === 0) {
      res.json({ error: 'No matching content', topPick: null, alternatives: [] });
      return;
    }

    const topPick = formatContentForUI(filtered[0], {
      mood, tone, context, includeProvenance: includeProvenance !== false
    });

    const alternatives = filtered.slice(1, 3).map(c =>
      formatContentForUI(c, { mood, tone, context, includeProvenance: includeProvenance !== false })
    );

    res.json({
      topPick,
      alternatives,
      reasoning: `Recommended based on ${mood} mood with ${tone} tone`,
      skillUsed: context.time.isWeekend ? 'Weekend Relaxation' : 'Weekday Quick Pick'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// MCP Tool: refine_recommendation
app.post('/api/mcp/tools/refine_recommendation', async (req, res): Promise<void> => {
  try {
    const { sessionId, userId, refinementType, feedback } = req.body;

    // Store refinement for learning
    refinementStore.push({
      sessionId: sessionId || 'unknown',
      userId: userId || 'anonymous',
      originalMood: feedback?.originalMood || 'unknown',
      originalTone: feedback?.originalTone || 'unknown',
      refinementType: refinementType || 'another',
      newMood: feedback?.newMood,
      newTone: feedback?.newTone,
      timestamp: new Date().toISOString()
    });

    // Get new recommendation based on refinement type
    const mood = feedback?.newMood || feedback?.originalMood || 'unwind';
    const tone = feedback?.newTone || feedback?.originalTone || 'feel';

    const content = await contentService.getByMoodTone(
      mood as 'unwind' | 'engage',
      tone as 'laugh' | 'feel' | 'thrill' | 'think',
      5
    );

    const context = detectContext(req);
    const topPick = content.length > 0
      ? formatContentForUI(content[0], { mood, tone, context, includeProvenance: true })
      : null;

    res.json({
      success: true,
      refinementStored: true,
      newRecommendation: topPick
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// MCP SSE endpoint for real-time updates
app.get('/api/mcp/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
  }, 30000);

  req.on('close', () => {
    clearInterval(keepAlive);
  });
});

// MCP manifest endpoint
app.get('/api/mcp/manifest', (_req, res) => {
  res.json({
    name: 'universal-content-discovery',
    version: '1.0.0',
    description: 'AI-powered emotion-first content discovery',
    tools: [
      {
        name: 'get_recommendation',
        description: 'Get personalized content recommendation based on mood and goal',
        inputSchema: {
          type: 'object',
          properties: {
            mood: { type: 'string', enum: ['unwind', 'engage'] },
            goal: { type: 'string', enum: ['laugh', 'feel', 'thrill', 'think'] },
            maxRuntime: { type: 'number', description: 'Maximum runtime in minutes' },
            context: { type: 'string', enum: ['alone', 'partner', 'friends', 'family'] },
            includeProvenance: { type: 'boolean', default: true }
          },
          required: ['mood', 'goal']
        }
      },
      {
        name: 'refine_recommendation',
        description: 'Refine previous recommendation based on feedback',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: { type: 'string' },
            refinementType: { type: 'string', enum: ['another', 'different_tone', 'different_mood', 'surprise'] },
            feedback: { type: 'object' }
          },
          required: ['refinementType']
        }
      }
    ]
  });
});

// ============================================================================
// Outcome Tracking Endpoints
// ============================================================================

// Track watch start
app.post('/api/outcome/watch-start', (req, res): void => {
  try {
    const { sessionId, userId, contentId } = req.body;

    const record = outcomeStore.find(r => r.sessionId === sessionId);
    if (record) {
      record.watchStartedAt = new Date().toISOString();
    } else {
      outcomeStore.push({
        sessionId: sessionId || `session_${Date.now()}`,
        userId: userId || 'anonymous',
        contentId,
        mood: 'unknown',
        tone: 'unknown',
        context: detectContext(req),
        recommendedAt: new Date().toISOString(),
        watchStartedAt: new Date().toISOString()
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Track watch completion
app.post('/api/outcome/watch-complete', (req, res): void => {
  try {
    const { sessionId, userId, contentId, completionRate, rating } = req.body;

    const record = outcomeStore.find(r => r.sessionId === sessionId);
    if (record) {
      record.watchEndedAt = new Date().toISOString();
      record.completionRate = completionRate;
      record.rating = rating;
      record.wasSuccessful = completionRate > 0.7;
    }

    // Also update user service if userId provided
    if (userId && contentId) {
      userService.recordWatch(userId, contentId, {
        completionRate: completionRate || 0,
        rating,
        wasRecommended: true
      });
    }

    res.json({ success: true, wasSuccessful: completionRate > 0.7 });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get outcome statistics
app.get('/api/outcome/stats', (_req, res) => {
  const total = outcomeStore.length;
  const completed = outcomeStore.filter(r => r.completionRate !== undefined).length;
  const successful = outcomeStore.filter(r => r.wasSuccessful).length;

  const avgCompletion = completed > 0
    ? outcomeStore.filter(r => r.completionRate !== undefined)
        .reduce((sum, r) => sum + (r.completionRate || 0), 0) / completed
    : 0;

  res.json({
    totalRecommendations: total,
    completedWatches: completed,
    successfulMatches: successful,
    successRate: completed > 0 ? (successful / completed * 100).toFixed(1) + '%' : 'N/A',
    avgCompletionRate: (avgCompletion * 100).toFixed(1) + '%',
    refinementCount: refinementStore.length
  });
});

// ============================================================================
// Context Detection Endpoint
// ============================================================================

app.get('/api/context', (req, res) => {
  const context = detectContext(req);
  res.json(context);
});

// ============================================================================
// FlixPatrol Trending Endpoints
// ============================================================================

// Get trending for a specific platform
app.get('/api/flixpatrol/:platform', async (req, res): Promise<void> => {
  try {
    const { platform } = req.params;
    const validPlatforms = ['netflix', 'disney', 'amazon', 'apple', 'hbo', 'paramount', 'peacock', 'hulu'];

    if (!validPlatforms.includes(platform)) {
      res.status(400).json({
        error: 'Invalid platform',
        validPlatforms
      });
      return;
    }

    const trending = await flixPatrolService.getTrending(platform as StreamingPlatform);
    res.json(trending);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get all platform trending data
app.get('/api/flixpatrol', async (_req, res): Promise<void> => {
  try {
    const allTrending = await flixPatrolService.getAllTrending();
    res.json({
      platforms: allTrending,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get global top movies across all platforms
app.get('/api/flixpatrol/global/movies', async (req, res): Promise<void> => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const movies = await flixPatrolService.getGlobalTopMovies(limit);
    res.json({ movies });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get global top series across all platforms
app.get('/api/flixpatrol/global/series', async (req, res): Promise<void> => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const series = await flixPatrolService.getGlobalTopSeries(limit);
    res.json({ series });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Check if a title is trending
app.get('/api/flixpatrol/check/:title', async (req, res): Promise<void> => {
  try {
    const { title } = req.params;
    const result = await flixPatrolService.isTrending(title);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ============================================================================
// Phase 2: Learning Service Endpoints
// ============================================================================

// Get learning stats (combined view)
app.get('/api/learning/stats', async (_req, res): Promise<void> => {
  try {
    const rbStats = reasoningBank.getStats();
    const rmStats = reflexionMemory.getStats();
    const slStats = skillLibrary.getStats();
    const cmStats = causalMemory.getStats();
    const healingStats = selfHealing.getHealingStats();
    const gnnStats = gnnAttention.getStats();

    res.json({
      reasoningBank: rbStats,
      reflexionMemory: rmStats,
      skillLibrary: slStats,
      causalMemory: cmStats,
      selfHealing: healingStats,
      gnnAttention: gnnStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get active skills
app.get('/api/learning/skills', (_req, res): void => {
  try {
    const skills = skillLibrary.getActiveSkills();
    const stats = skillLibrary.getStats();
    res.json({ skills, stats });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get learned weights
app.get('/api/learning/weights', (_req, res): void => {
  try {
    const rbWeights = reasoningBank.getWeights();
    const utilityWeights = causalMemory.getUtilityWeights();
    res.json({
      reasoningBank: rbWeights,
      causalMemory: utilityWeights,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get health check with learning status
app.get('/api/learning/health', async (_req, res): Promise<void> => {
  try {
    const healthCheck = await selfHealing.performHealthCheck();
    const state = selfHealing.getSystemState();
    res.json({
      healthCheck,
      systemState: state,
      inFallbackMode: selfHealing.isInFallbackMode(),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Run nightly learner tasks manually
app.post('/api/learning/run', async (_req, res): Promise<void> => {
  try {
    if (nightlyLearner.getIsRunning()) {
      res.status(409).json({ error: 'Learning tasks already running' });
      return;
    }

    const results = await nightlyLearner.runAllTasks();
    res.json({
      success: true,
      tasksRun: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get performance report
app.get('/api/learning/report', (_req, res): void => {
  try {
    const report = nightlyLearner.generatePerformanceReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Record recommendation outcome (triggers learning)
app.post('/api/learning/outcome', async (req, res): Promise<void> => {
  try {
    const {
      sessionId: _sessionId, // Reserved for session tracking
      userId,
      contentId,
      contentTitle,
      contentGenres,
      mood,
      tone,
      action,
      completionPercent,
      rating,
      timeOfDay,
      dayOfWeek,
    } = req.body;

    if (!contentId || !action) {
      res.status(400).json({ error: 'Missing contentId or action' });
      return;
    }

    // Record in ReasoningBank
    const trajectory = reasoningBank.recordTrajectory({
      userId: userId || 'anonymous',
      userMood: mood || 'unknown',
      contentRecommended: contentTitle || `content_${contentId}`,
      contentId,
      vectorSimilarity: 0.8, // Would calculate from actual vectors
      contextBoost: 0.2,
      trendingBoost: 0.1,
      diversityPenalty: 0.1,
      finalScore: 0.75,
      outcome: null,
      contextFactors: {
        timeOfDay: timeOfDay || 'evening',
        dayOfWeek: dayOfWeek || 'unknown',
        deviceType: 'unknown',
        sessionNumber: 1,
        previousMood: null,
      },
    });

    // Record outcome
    const verdict = reasoningBank.recordOutcome(trajectory.id, {
      action: action as 'clicked' | 'watched' | 'skipped' | 'dismissed',
      completionPercent: completionPercent || 0,
      watchDurationMinutes: (completionPercent || 0) * 1.2, // Estimate
      rating: rating || null,
      addedToWatchlist: false,
      timestamp: new Date().toISOString(),
    });

    // Record in ReflexionMemory
    reflexionMemory.recordEpisode(
      userId || 'anonymous',
      {
        mood: mood || 'unknown',
        tone: tone || 'unknown',
        timeOfDay: timeOfDay || 'evening',
        dayOfWeek: dayOfWeek || 'unknown',
        previousWatched: [],
        sessionDuration: 0,
        deviceType: 'unknown',
      },
      {
        contentId,
        title: contentTitle || `content_${contentId}`,
        genres: contentGenres || [],
        vectorSimilarity: 0.8,
        rank: 1,
        reasoning: 'Recommended based on mood/tone match',
      },
      {
        action: action as 'clicked' | 'watched' | 'skipped' | 'dismissed' | 'ignored',
        completionPercent: completionPercent || 0,
        timeToDecision: 5,
        rating,
      }
    );

    // Record in CausalMemory
    causalMemory.recordIntervention(
      { label: contentTitle || `content_${contentId}` },
      { labels: [mood || 'unknown', tone || 'unknown', timeOfDay || 'evening'] },
      {
        label: verdict?.success ? 'success' : 'failure',
        value: (completionPercent || 0) / 100,
      },
      150 // Simulated latency
    );

    // Update skill performance if applicable
    const context = detectContext(req as express.Request);
    const matchingSkills = skillLibrary.findMatchingSkills({
      mood: mood || 'unknown',
      tone: tone || 'unknown',
      timeOfDay: context.time.period,
      dayOfWeek: getDayName(context.time.dayOfWeek),
    });

    if (matchingSkills.length > 0) {
      skillLibrary.updateSkillPerformance(matchingSkills[0].skill.id, {
        success: (completionPercent || 0) >= 50,
        completionPercent: completionPercent || 0,
        satisfaction: rating,
      });
    }

    res.json({
      success: true,
      trajectoryId: trajectory.id,
      verdict,
      learning: 'Outcome recorded for pattern learning',
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get reflection summary
app.get('/api/learning/reflection', (_req, res): void => {
  try {
    const summary = reflexionMemory.generateReflectionSummary(7);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get causal insights
app.get('/api/learning/causal', (_req, res): void => {
  try {
    const strongestLinks = causalMemory.getStrongestCausalLinks(10);
    const stats = causalMemory.getStats();
    res.json({
      strongestLinks,
      stats,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ============================================================================
// Static Files & Routes
// ============================================================================

// Serve index.html for root path
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Serve chat.html for /chat path (new conversational UI)
app.get('/chat', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../public/chat.html'));
});

// Start server
app.listen(PORT, async () => {
  console.log(`\n🚀 What to Watch in 60 Seconds - Demo Server`);
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`\n💡 Features:`);
  console.log(`   - Interactive quiz flow (🌙 Unwind vs ⚡ Engage)`);
  console.log(`   - RuVector semantic search with n-gram embeddings`);
  console.log(`   - User profiles & watch history`);
  console.log(`   - Personalized recommendations`);
  console.log(`\n🔧 Endpoints:`);
  console.log(`   GET  /                          - Web UI`);
  console.log(`   POST /api/recommend             - Get recommendation`);
  console.log(`   POST /api/search                - Semantic text search`);
  console.log(`   GET  /api/user/:id              - Get user profile`);
  console.log(`   POST /api/user/:id/watch        - Record watch`);
  console.log(`   POST /api/user/:id/personalized - Personalized recommendations`);
  console.log(`   GET  /api/health                - Health check`);

  // Initialize vector store
  console.log(`\n⏳ Initializing vector store...`);
  try {
    vectorStore = new RuVectorStore({ dimensions: 128 });
    await vectorStore.initialize();
    const stats = await vectorStore.getStats();
    console.log(`✅ Vector store ready (${stats.contentCount} items indexed)`);
  } catch (error) {
    console.warn('⚠️  Vector store initialization failed:', error);
  }

  // Try to initialize MCP client
  await initializeMCPClient();

  // Initialize demo user data
  console.log(`\n⏳ Initializing demo user...`);
  try {
    initializeDemoUsers(userService);
    console.log(`✅ Demo user initialized successfully`);
  } catch (error) {
    console.warn('⚠️  Demo user initialization failed:', error);
  }

  console.log(`\n✨ Open http://localhost:${PORT} to try it out!\n`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  // Flush user data to disk before exit
  shutdownUserService();
  if (mcpClient) {
    await mcpClient.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  // Flush user data to disk before exit
  shutdownUserService();
  if (mcpClient) {
    await mcpClient.close();
  }
  process.exit(0);
});
