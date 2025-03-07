// src/config/logger.ts
import winston from 'winston';
import ENV from './env';

const { combine, timestamp, printf, colorize } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let metadataStr = '';
  if (Object.keys(metadata).length > 0) {
    metadataStr = JSON.stringify(metadata);
  }
  return `${timestamp} [${level}]: ${message} ${metadataStr}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: ENV.LOG_LEVEL || 'info',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
  ],
});

// Add file transports in production
if (ENV.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  );
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}

export default logger;
