/**
 * MCP Server Implementation
 *
 * Main MCP server using @modelcontextprotocol/sdk
 * Supports STDIO transport for Claude Desktop integration
 *
 * @module mcp/server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { getRecommendationHandler } from './handlers/get-recommendation.js';
import { refineSearchHandler } from './handlers/refine-search.js';
import { getTrendingHandler } from './handlers/get-trending.js';

/**
 * Available MCP tools
 */
const TOOLS: Tool[] = [
  {
    name: 'get_recommendation',
    description:
      'Get personalized content recommendations based on emotional state. ' +
      'Takes user mood (unwind/engage) and goal (laugh/feel/thrill/think) to find the perfect content.',
    inputSchema: {
      type: 'object',
      properties: {
        mood: {
          type: 'string',
          enum: ['unwind', 'engage'],
          description: 'Current mood: unwind (relax) or engage (focus)',
        },
        goal: {
          type: 'string',
          enum: ['laugh', 'feel', 'thrill', 'think'],
          description: 'What you want: laugh (comedy), feel (emotional), thrill (action), think (intellectual)',
        },
        constraints: {
          type: 'object',
          properties: {
            maxRuntime: {
              type: 'number',
              description: 'Maximum runtime in minutes',
            },
            minYear: {
              type: 'number',
              description: 'Minimum release year',
            },
            maxYear: {
              type: 'number',
              description: 'Maximum release year',
            },
            languages: {
              type: 'array',
              items: { type: 'string' },
              description: 'Preferred languages (ISO 639-1 codes)',
            },
            genres: {
              type: 'array',
              items: { type: 'string' },
              description: 'Preferred genres',
            },
            excludeGenres: {
              type: 'array',
              items: { type: 'string' },
              description: 'Genres to exclude',
            },
          },
        },
        context: {
          type: 'object',
          properties: {
            social: {
              type: 'string',
              enum: ['alone', 'partner', 'family', 'friends'],
              description: 'Viewing context',
            },
            device: {
              type: 'string',
              enum: ['mobile', 'tablet', 'desktop', 'tv'],
              description: 'Device type',
            },
            timeOfDay: {
              type: 'string',
              enum: ['morning', 'afternoon', 'evening', 'night'],
              description: 'Time of day',
            },
          },
        },
        userId: {
          type: 'string',
          description: 'Optional user ID for personalization',
        },
        options: {
          type: 'object',
          properties: {
            includeAlternatives: {
              type: 'boolean',
              description: 'Include alternative recommendations',
              default: true,
            },
            alternativeCount: {
              type: 'number',
              description: 'Number of alternatives to include',
              default: 3,
            },
            includeProvenance: {
              type: 'boolean',
              description: 'Include provenance information',
              default: true,
            },
            includeTrending: {
              type: 'boolean',
              description: 'Consider trending content',
              default: true,
            },
            explainReasoning: {
              type: 'boolean',
              description: 'Include reasoning explanation',
              default: true,
            },
          },
        },
      },
      required: ['mood', 'goal'],
    },
  },
  {
    name: 'refine_search',
    description:
      'Refine a previous recommendation based on feedback. ' +
      'Use when the user wants something different or provides feedback on the recommendation.',
    inputSchema: {
      type: 'object',
      properties: {
        previousRequestId: {
          type: 'string',
          description: 'UUID of the previous recommendation request',
        },
        feedback: {
          type: 'object',
          properties: {
            reason: {
              type: 'string',
              enum: ['too_long', 'wrong_mood', 'seen_it', 'not_interested', 'prefer_different'],
              description: 'Reason for refinement',
            },
            detail: {
              type: 'string',
              description: 'Additional feedback details',
            },
          },
          required: ['reason'],
        },
        additionalConstraints: {
          type: 'object',
          description: 'Additional constraints to apply',
        },
      },
      required: ['previousRequestId', 'feedback'],
    },
  },
  {
    name: 'get_trending',
    description:
      'Get currently trending content across platforms. ' +
      'Returns popular content from Netflix, Amazon Prime, Disney+, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['all', 'netflix', 'prime', 'disney', 'tv5monde'],
          description: 'Platform to get trending content from',
          default: 'all',
        },
        region: {
          type: 'string',
          description: 'Region code (ISO 3166-1 alpha-2)',
          default: 'FR',
        },
        limit: {
          type: 'number',
          description: 'Number of trending items to return',
          default: 10,
        },
      },
    },
  },
];

/**
 * Create and configure MCP server
 */
function createServer(): Server {
  const server = new Server(
    {
      name: 'universal-content-discovery',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: TOOLS,
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'get_recommendation':
          return await getRecommendationHandler(args);

        case 'refine_search':
          return await refineSearchHandler(args);

        case 'get_trending':
          return await getTrendingHandler(args);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      // Log error for debugging
      console.error(`Error handling tool ${name}:`, errorMessage);
      if (errorStack) {
        console.error(errorStack);
      }

      // Return error response
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: errorMessage,
                tool: name,
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
  });

  return server;
}

/**
 * Start MCP server with STDIO transport
 */
async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();

  console.error('Starting Universal Content Discovery MCP Server...');
  console.error('Version: 1.0.0');
  console.error('Transport: STDIO');
  console.error('Available tools:', TOOLS.map((t) => t.name).join(', '));

  await server.connect(transport);

  console.error('MCP Server running. Ready for requests.');

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.error('Shutting down MCP server...');
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('Shutting down MCP server...');
    await server.close();
    process.exit(0);
  });
}

// Run server if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { createServer, TOOLS };
