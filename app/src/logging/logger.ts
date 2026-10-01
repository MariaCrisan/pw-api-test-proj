import pino, { type Logger } from 'pino';

export interface LogContext {
  environment?: string;
  correlationId?: string;
}

export function createLogger(name: string, context: LogContext = {}): Logger {
  const logger = pino({ name, level: process.env.LOG_LEVEL ?? 'info' });
  return Object.keys(context).length > 0 ? logger.child(context) : logger;
}
