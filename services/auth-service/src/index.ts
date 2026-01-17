import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config';
import { createLogger } from '@serein/shared/utils/logger';
import { registerAuthRoutes } from './routes/auth.routes';
import { PrismaClient } from '@prisma/client';
import { getRedisClient } from './utils/redis';

const logger = createLogger('auth-service');
const prisma = new PrismaClient();

const app = Fastify({
  logger: false, // We use our own logger
});

async function setupApp() {
  // Register plugins
  await app.register(cors, {
    origin: config.cors.origin,
    credentials: true,
  });

  await app.register(helmet);

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Auth service API',
        version: '1.0.0',
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformSpecificationClone: true,
  });

  app.get('/docs/json', async () => app.swagger());

  // Health check
  app.get('/health', async (request, reply) => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      // Check Redis connection
      const redis = getRedisClient();
      await redis.ping();

      return reply.send({
        status: 'healthy',
        service: 'auth-service',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
          redis: 'ok',
        },
      });
    } catch (error) {
      logger.error({ error }, 'Health check failed');
      return reply.code(503).send({
        status: 'unhealthy',
        service: 'auth-service',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Register routes
  await app.register(registerAuthRoutes);
}

// Error handler
app.setErrorHandler((error, request, reply) => {
  logger.error({ error, url: request.url }, 'Request error');

  if (error.statusCode) {
    return reply.code(error.statusCode).send({
      error: error.message,
      code: error.code,
      details: error.details,
    });
  }

  return reply.code(500).send({
    error: 'Internal server error',
  });
});

// Start server
const start = async () => {
  try {
    await setupApp();
    await app.listen({ port: config.port, host: '0.0.0.0' });
    logger.info(`Auth service listening on port ${config.port}`);
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
});

start();

