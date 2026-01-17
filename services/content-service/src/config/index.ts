const parseIntValue = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

/**
 * Configuration for Content Service
 */
export const config = {
  port: parseInt(process.env.PORT || '3005', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url:
      process.env.CONTENT_DATABASE_URL ||
      process.env.DATABASE_URL ||
      'postgresql://serein:serein_dev_password@localhost:5432/serein_content',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  weaviate: {
    url: process.env.WEAVIATE_URL || 'http://localhost:8080',
    apiKey: process.env.WEAVIATE_API_KEY || '',
    className: process.env.WEAVIATE_SCHEMA_CLASS || 'Book',
  },
  search: {
    defaultLimit: parseIntValue(process.env.CONTENT_SEARCH_LIMIT, 20),
    maxLimit: parseIntValue(process.env.CONTENT_SEARCH_MAX_LIMIT, 50),
  },
};
