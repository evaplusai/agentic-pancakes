import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mcpConnected: mcpClient !== null,
    timestamp: new Date().toISOString()
  });
});

// Serve index.html for root path
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Start server
app.listen(PORT, async () => {
  console.log(`\n🚀 What to Watch in 60 Seconds - Demo Server`);
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`\n💡 Features:`);
  console.log(`   - Interactive quiz flow (🌙 Unwind vs ⚡ Engage)`);
  console.log(`   - Smooth animations and transitions`);
  console.log(`   - TV5MONDE brand styling`);
  console.log(`   - Mock data for demo purposes`);
  console.log(`\n🔧 Endpoints:`);
  console.log(`   GET  /              - Web UI`);
  console.log(`   POST /api/recommend - Get recommendation`);
  console.log(`   GET  /api/health    - Health check`);

  // Try to initialize MCP client
  await initializeMCPClient();

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
