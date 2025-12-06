/**
 * Universal Content Discovery Platform
 *
 * Application entry point
 * Starts MCP server with configured transport
 *
 * @module index
 */

import { createServer } from './mcp/server.js';
import { createStdioTransport } from './mcp/transports/stdio.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Main application entry point
 */
async function main() {
  console.error('=========================================');
  console.error('Universal Content Discovery Platform MVP');
  console.error('Version: 1.0.0');
  console.error('=========================================');
  console.error('');

  // Create MCP server
  const server = createServer();

  // Create STDIO transport
  const transport = createStdioTransport();

  console.error('Starting MCP server...');
  console.error('Transport: STDIO');
  console.error('Protocol: MCP (Model Context Protocol)');
  console.error('');

  // Connect server to transport
  await server.connect(transport);

  console.error('✓ MCP Server ready');
  console.error('✓ Listening on stdio');
  console.error('');
  console.error('Available tools:');
  console.error('  - get_recommendation: Get personalized content recommendations');
  console.error('  - refine_search: Refine previous recommendation');
  console.error('  - get_trending: Get trending content');
  console.error('');
  console.error('Ready for Claude Desktop integration.');
  console.error('');

  // Handle graceful shutdown
  const shutdown = async (signal: string) => {
    console.error('');
    console.error(`Received ${signal}, shutting down gracefully...`);
    try {
      await server.close();
      console.error('✓ Server closed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

// Start the application
main().catch((error) => {
  console.error('Fatal error during startup:', error);
  process.exit(1);
});
