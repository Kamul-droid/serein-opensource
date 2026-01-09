import pino from 'pino';

/**
 * Shared logger utility using Pino
 */
export const createLogger = (serviceName: string) => {
  return pino({
    name: serviceName,
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
};

export type Logger = ReturnType<typeof createLogger>;
