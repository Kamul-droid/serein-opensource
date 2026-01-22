import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config';
import { createLogger } from '@serein/shared/utils/logger';
import { createMetrics } from '@serein/shared/utils/metrics';
import { attachProcessHandlers, logStartupInfo } from '@serein/shared/utils/startup';
import { registerAuthRoutes } from './routes/auth.routes';
import { PrismaClient } from '@prisma/client';
import { getRedisClient } from './utils/redis';

const logger = createLogger('auth-service');
const metrics = createMetrics('auth-service');
const prisma = new PrismaClient();
attachProcessHandlers(logger, 'auth-service');

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
        title: 'Serein Auth Service',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
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

  app.get('/docs/openapi.json', async () => app.swagger());

  app.get('/metrics', async (_request, reply) => {
    reply.header('Content-Type', metrics.register.contentType);
    return reply.send(await metrics.register.metrics());
  });

  app.addHook('onRequest', async (request) => {
    (request as { metricsStart?: [number, number] }).metricsStart = process.hrtime();
  });

  app.addHook('onResponse', async (request, reply) => {
    const start = (request as { metricsStart?: [number, number] }).metricsStart;
    if (!start) {
      return;
    }

    const diff = process.hrtime(start);
    const durationSeconds = diff[0] + diff[1] / 1e9;
    const route = request.routeOptions?.url ?? request.routerPath ?? request.url;

    if (route === '/metrics') {
      return;
    }

    const statusCode = reply.statusCode?.toString() ?? '0';
    metrics.httpRequestsTotal.inc({
      method: request.method,
      route,
      status_code: statusCode,
    });
    metrics.httpRequestDurationSeconds.observe(
      {
        method: request.method,
        route,
        status_code: statusCode,
      },
      durationSeconds,
    );
  });

  // Health check
  app.get('/health', async (_request, reply) => {
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

  const typedError = error as {
    statusCode?: number;
    code?: string;
    details?: Record<string, unknown>;
  };

  if (typedError.statusCode) {
    return reply.code(typedError.statusCode).send({
      error: error.message,
      code: typedError.code,
      details: typedError.details,
    });
  }

  return reply.code(500).send({
    error: 'Internal server error',
  });
});

// Start server
const start = async () => {
  try {
    logStartupInfo(logger, {
      service: 'auth-service',
      port: config.port,
      nodeEnv: config.nodeEnv,
      dependencies: {
        databaseUrl: config.database.url,
        redisUrl: config.redis.url,
        userServiceUrl: config.services.userUrl,
        conversationServiceUrl: config.services.conversationUrl,
      },
      config: {
        corsOrigin: config.cors.origin,
        sessionTimeoutMs: config.session.timeoutMs,
        jwtExpiresIn: config.jwt.accessTokenExpiresIn,
        jwtRefreshExpiresIn: config.jwt.refreshTokenExpiresIn,
      },
      requiredEnv: ['AUTH_DATABASE_URL', 'REDIS_URL'],
      optionalEnv: ['JWT_SECRET', 'USER_SERVICE_URL', 'CONVERSATION_SERVICE_URL', 'INTERNAL_EVENT_SECRET'],
    });
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


