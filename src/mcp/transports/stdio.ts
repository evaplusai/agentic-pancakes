/**
 * STDIO Transport Implementation
 *
 * Provides STDIO transport for MCP server
 * Used by Claude Desktop and CLI clients
 *
 * @module mcp/transports/stdio
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

/**
 * Create STDIO transport
 */
export function createStdioTransport(): StdioServerTransport {
  return new StdioServerTransport();
}

/**
 * STDIO transport configuration
 */
export interface StdioTransportConfig {
  /**
   * Enable debug logging to stderr
   */
  debug?: boolean;

  /**
   * Buffer size for stdin/stdout
   */
  bufferSize?: number;
}

/**
 * Create configured STDIO transport
 */
export function createConfiguredStdioTransport(config: StdioTransportConfig = {}): StdioServerTransport {
  const transport = new StdioServerTransport();

  // Debug logging
  if (config.debug) {
    console.error('STDIO transport created with debug mode enabled');
  }

  return transport;
}

export { StdioServerTransport };
