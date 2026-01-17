/**
 * Configuration for Conversation Service
 */
export const config = {
  port: parseInt(process.env.PORT || '3003', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url:
      process.env.CONVERSATION_DATABASE_URL ||
      process.env.DATABASE_URL ||
      'postgresql://serein:serein_dev_password@localhost:5432/serein_conversation',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  services: {
    aiUrl: process.env.AI_SERVICE_URL || 'http://localhost:3004',
  },
  events: {
    secret: process.env.INTERNAL_EVENT_SECRET || '',
  },
};
