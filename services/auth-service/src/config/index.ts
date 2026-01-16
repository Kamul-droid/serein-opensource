/**
 * Configuration for Auth Service
 */
export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url:
      process.env.AUTH_DATABASE_URL ||
      process.env.DATABASE_URL ||
      'postgresql://serein:serein_dev_password@localhost:5432/serein_auth',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    accessTokenExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  session: {
    timeoutMs: parseInt(process.env.SESSION_TIMEOUT_MS || '3600000', 10), // 1 hour
  },
  passwordReset: {
    tokenExpiresIn: 60 * 60 * 1000, // 1 hour
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  services: {
    userUrl: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    conversationUrl: process.env.CONVERSATION_SERVICE_URL || 'http://localhost:3003',
  },
  events: {
    secret: process.env.INTERNAL_EVENT_SECRET || '',
  },
};
