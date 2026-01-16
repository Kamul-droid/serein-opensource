import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';
import { createLogger } from '@serein/shared/utils/logger';
import { registerUserRoutes } from './routes/user.routes';
import { PrismaClient } from '@prisma/client';

const logger = createLogger('user-service');
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

  // Health check
  app.get('/health', async (request, reply) => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      return reply.send({
        status: 'healthy',
        service: 'user-service',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
        },
      });
    } catch (error) {
      logger.error({ error }, 'Health check failed');
      return reply.code(503).send({
        status: 'unhealthy',
        service: 'user-service',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Register routes
  await app.register(registerUserRoutes);
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
    logger.info(`User service listening on port ${config.port}`);
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
