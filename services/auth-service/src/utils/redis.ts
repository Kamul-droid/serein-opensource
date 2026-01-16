import Redis from 'ioredis';
import { config } from '../config';
import { createLogger } from '@serein/shared/utils/logger';

const logger = createLogger('auth-service:redis');

let redisClient: Redis | null = null;

/**
 * Get or create Redis client
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(config.redis.url, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis connection retry attempt ${times}, waiting ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('error', (error) => {
      logger.error({ error }, 'Redis client error');
    });
  }

  return redisClient;
}

/**
 * Store session in Redis
 */
export async function storeSession(
  sessionId: string,
  userId: string,
  expiresInMs: number
): Promise<void> {
  const client = getRedisClient();
  await client.setex(`session:${sessionId}`, expiresInMs / 1000, userId);
}

/**
 * Get session from Redis
 */
export async function getSession(sessionId: string): Promise<string | null> {
  const client = getRedisClient();
  return client.get(`session:${sessionId}`);
}

/**
 * Delete session from Redis
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const client = getRedisClient();
  await client.del(`session:${sessionId}`);
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
