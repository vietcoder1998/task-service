// src/LoggerMiddleware.ts
import { createLogger, format, transports } from 'winston';
import path from 'path';
import { config } from './config/env.config';

// Custom format to add end_log and file info
const customFormat = format.printf(({ timestamp, level, message, ...meta }) => {
  // Try to get caller file and line from stack trace
  let fileInfo = '';
  if (meta && meta.stack) {
    const stackLines = String(meta.stack).split('\n');
    const callerLine = stackLines[2] || '';
    const match = callerLine.match(/\((.*):(\d+):(\d+)\)/);
    if (match) {
      const [, file, line, col] = match;
      fileInfo = `file: ${path.basename(file)}, line: ${line}`;
    }
  }
  // Move timestamp to the start, near info, and add file debug information
  return `[${level}] ${timestamp} ${fileInfo}: ${message} end_log: ..........`;
});

const logger = createLogger({
  level: config.logging.level,
  format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
  defaultMeta: { service: 'api-service' },
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;
