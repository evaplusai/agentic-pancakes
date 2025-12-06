/**
 * Winston-based Logger Utility
 *
 * Provides structured logging with multiple transports (console and file).
 * Supports log levels: debug, info, warn, error.
 *
 * @module utils/logger
 */

import winston from 'winston';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

// ============================================================================
// Types
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMetadata {
  agent?: string;
  requestId?: string;
  userId?: string;
  duration?: number;
  error?: Error;
  [key: string]: unknown;
}

// ============================================================================
// Logger Configuration
// ============================================================================

const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info') as LogLevel;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Ensure log directory exists
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

// ============================================================================
// Formatters
// ============================================================================

/**
 * Custom format for console output (human-readable)
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}] ${message}`;

    // Add metadata if present
    const metaKeys = Object.keys(metadata).filter(key => key !== 'timestamp');
    if (metaKeys.length > 0) {
      const metaStr = JSON.stringify(
        Object.fromEntries(metaKeys.map(key => [key, metadata[key]])),
        null,
        2
      );
      msg += `\n${metaStr}`;
    }

    return msg;
  })
);

/**
 * Custom format for file output (structured JSON)
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ============================================================================
// Transports
// ============================================================================

const transports: winston.transport[] = [
  // Console transport (always enabled)
  new winston.transports.Console({
    level: LOG_LEVEL,
    format: consoleFormat,
    handleExceptions: true
  })
];

// File transports (only in production or if explicitly enabled)
if (IS_PRODUCTION || process.env.ENABLE_FILE_LOGGING === 'true') {
  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
      level: LOG_LEVEL,
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );

  // Error-only log file
  transports.push(
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );

  // Debug log file (if debug level enabled)
  if (LOG_LEVEL === 'debug') {
    transports.push(
      new winston.transports.File({
        filename: path.join(LOG_DIR, 'debug.log'),
        level: 'debug',
        format: fileFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 3,
        tailable: true
      })
    );
  }
}

// ============================================================================
// Logger Instance
// ============================================================================

/**
 * Main logger instance
 */
const logger = winston.createLogger({
  level: LOG_LEVEL,
  transports,
  exitOnError: false,
  silent: process.env.NODE_ENV === 'test' && process.env.ENABLE_TEST_LOGGING !== 'true'
});

// ============================================================================
// Exported Logger Interface
// ============================================================================

/**
 * Logger class with convenience methods
 */
export class Logger {
  private context: string;

  constructor(context?: string) {
    this.context = context || 'App';
  }

  /**
   * Log debug message
   */
  debug(message: string, metadata?: LogMetadata): void {
    logger.debug(message, { context: this.context, ...metadata });
  }

  /**
   * Log info message
   */
  info(message: string, metadata?: LogMetadata): void {
    logger.info(message, { context: this.context, ...metadata });
  }

  /**
   * Log warning message
   */
  warn(message: string, metadataOrError?: LogMetadata | Error, metadata?: LogMetadata): void {
    if (metadataOrError instanceof Error) {
      logger.warn(message, {
        context: this.context,
        error: {
          name: metadataOrError.name,
          message: metadataOrError.message,
          stack: metadataOrError.stack
        },
        ...metadata
      });
    } else {
      logger.warn(message, { context: this.context, ...metadataOrError });
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, metadata?: LogMetadata): void {
    logger.error(message, {
      context: this.context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      ...metadata
    });
  }

  /**
   * Create child logger with additional context
   */
  child(childContext: string): Logger {
    return new Logger(`${this.context}:${childContext}`);
  }

  /**
   * Log with custom level
   */
  log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    logger.log(level, message, { context: this.context, ...metadata });
  }
}

/**
 * Create a logger instance with context
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * Default logger instance
 */
export const defaultLogger = new Logger('App');

/**
 * Get current log level
 */
export function getLogLevel(): LogLevel {
  return LOG_LEVEL;
}

/**
 * Set log level dynamically
 */
export function setLogLevel(level: LogLevel): void {
  logger.level = level;
  logger.info(`Log level changed to: ${level}`);
}

/**
 * Flush all logs (useful for graceful shutdown)
 */
export async function flushLogs(): Promise<void> {
  return new Promise((resolve) => {
    const fileTransports = logger.transports.filter(
      t => t instanceof winston.transports.File
    );

    if (fileTransports.length === 0) {
      resolve();
      return;
    }

    let flushed = 0;
    fileTransports.forEach((transport) => {
      (transport as winston.transports.FileTransportInstance).on('finish', () => {
        flushed++;
        if (flushed === fileTransports.length) {
          resolve();
        }
      });
      (transport as winston.transports.FileTransportInstance).end();
    });
  });
}

// Export default logger for convenience
export default logger;
