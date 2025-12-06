import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { getUserService } from '../services/user-service.js';
import { RuVectorStore } from '../integrations/ruvector.js';
import { getPersonalizationAgent } from '../agents/personalization.js';
import { initializeDemoUsers } from '../data/demo-users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Services
const userService = getUserService();
let vectorStore: RuVectorStore | null = null;
const personalizationAgent = getPersonalizationAgent();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// Mock data for demo purposes
const mockRecommendations = {
  'unwind-laugh-movie': {
    title: 'À Table!',
    runtime: '1h 45m',
    year: '2024',
    description: 'A delightful French comedy about a family reunion where decades of secrets bubble to the surface over a memorable dinner. Heartwarming and hilarious.',
    genres: ['Comedy', 'Drama', 'French Cinema'],
    match: 96,
    trending: true,
    posterUrl: null
  },
  'unwind-laugh-series': {
    title: 'Café de la Plage',
    runtime: '8 episodes × 45m',
    year: '2024',
    description: 'A charming coastal café becomes the backdrop for love, laughter, and the quirky residents of a French seaside town.',
    genres: ['Comedy', 'Romance', 'Series'],
    match: 94,
    trending: true,
    posterUrl: null
  },
  'unwind-feel-movie': {
    title: 'Les Saisons du Coeur',
    runtime: '2h 10m',
    year: '2023',
    description: 'An emotional journey through love and loss, set against the stunning backdrop of the French countryside across four seasons.',
    genres: ['Drama', 'Romance', 'Art House'],
    match: 95,
    trending: false,
    posterUrl: null
  },
  'unwind-feel-series': {
    title: "Lettres d'Amour",
    runtime: '6 episodes × 52m',
    year: '2024',
    description: 'Discovered love letters from WWII connect two strangers across time in this beautifully crafted romantic drama.',
    genres: ['Romance', 'Historical', 'Drama'],
    match: 93,
    trending: false,
    posterUrl: null
  },
  'engage-thrill-movie': {
    title: 'Minuit à Paris',
    runtime: '2h 05m',
    year: '2024',
    description: 'A gripping thriller where a detective has until midnight to solve a case that will shake Paris to its core. Edge-of-your-seat suspense.',
    genres: ['Thriller', 'Mystery', 'Crime'],
    match: 97,
    trending: true,
    posterUrl: null
  },
  'engage-thrill-series': {
    title: 'La Traque',
    runtime: '8 episodes × 48m',
    year: '2024',
    description: 'An elite investigator pursues a master criminal across Europe in this pulse-pounding crime series.',
    genres: ['Crime', 'Thriller', 'Action'],
    match: 96,
    trending: true,
    posterUrl: null
  },
  'engage-think-movie': {
    title: 'Le Paradoxe',
    runtime: '2h 20m',
    year: '2023',
    description: 'A mind-bending sci-fi drama exploring consciousness, time, and the nature of reality through the eyes of a quantum physicist.',
    genres: ['Sci-Fi', 'Drama', 'Philosophy'],
    match: 94,
    trending: false,
    posterUrl: null
  },
  'engage-think-series': {
    title: 'Archives Secrètes',
    runtime: '10 episodes × 55m',
    year: '2024',
    description: 'Historians uncover conspiracies hidden in plain sight throughout French history. Intelligent and thought-provoking.',
    genres: ['Historical', 'Mystery', 'Documentary'],
    match: 92,
    trending: false,
    posterUrl: null
  }
};

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

// API endpoint for recommendations
app.post('/api/recommend', async (req, res): Promise<void> => {
  try {
    const { mood, tone, format } = req.body;

    // Validate input
    if (!mood || !tone) {
      res.status(400).json({
        error: 'Missing required fields: mood and tone'
      });
      return;
    }

    // Map UI 'tone' to MCP 'goal' parameter
    const goal = tone; // laugh, feel, thrill, think

    // Try to use MCP client first
    if (mcpClient) {
      try {
        const result = await mcpClient.callTool({
          name: 'get_recommendation',
          arguments: {
            mood,
            goal, // Use 'goal' instead of 'tone'
            options: {
              includeAlternatives: true,
              explainReasoning: true,
              includeTrending: true
            }
          }
        });

        // Extract the actual data from MCP response
        const content = result.content as Array<{ type: string; text?: string }>;
        if (content && content[0] && content[0].text) {
          const mcpData = JSON.parse(content[0].text);

          // Transform to UI format
          const uiResponse = {
            title: mcpData.topPick.title,
            runtime: `${mcpData.topPick.runtime}m`,
            year: mcpData.topPick.year,
            description: mcpData.topPick.overview,
            genres: mcpData.topPick.genres,
            match: Math.round(mcpData.topPick.matchScore * 100),
            trending: mcpData.topPick.scoreBreakdown?.trendingBoost > 0,
            posterUrl: mcpData.topPick.posterUrl
          };

          res.json(uiResponse);
          return;
        }
      } catch (mcpError) {
        console.warn('MCP call failed, falling back to mock data:', mcpError);
      }
    }

    // Fallback to mock data
    const key = `${mood}-${tone}-${format === 'any' ? 'movie' : format}`;
    const recommendation = mockRecommendations[key as keyof typeof mockRecommendations];

    if (!recommendation) {
      // Return a default recommendation
      res.json(mockRecommendations['unwind-laugh-movie']);
      return;
    }

    res.json(recommendation);
  } catch (error) {
    console.error('Error processing recommendation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  res.json({
    status: 'ok',
    mcpConnected: mcpClient !== null,
    vectorStoreReady: vectorStore !== null,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// User Profile & Personalization Endpoints
// ============================================================================

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
  if (mcpClient) {
    await mcpClient.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  if (mcpClient) {
    await mcpClient.close();
  }
  process.exit(0);
});
