import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config';
import { createLogger } from '@serein/shared/utils/logger';
import { attachProcessHandlers, logStartupInfo } from '@serein/shared/utils/startup';
import { registerContentRoutes } from './routes/content.routes';
import { PrismaClient } from '@prisma/client';
import { checkWeaviateHealth } from './services/content.service';

const logger = createLogger('content-service');
const prisma = new PrismaClient();
attachProcessHandlers(logger, 'content-service');

const app = Fastify({
  logger: false,
});

async function setupApp() {
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
        title: 'Serein Content Service',
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

  // Health check
  app.get('/health', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      const weaviateHealthy = await checkWeaviateHealth();

      return reply.send({
        status: 'healthy',
        service: 'content-service',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
          weaviate: weaviateHealthy ? 'ok' : 'unreachable',
        },
      });
    } catch (error) {
      logger.error({ error }, 'Health check failed');
      return reply.code(503).send({
        status: 'unhealthy',
        service: 'content-service',
        timestamp: new Date().toISOString(),
      });
    }
  });

  await app.register(registerContentRoutes);
}

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

const start = async () => {
  try {
    logStartupInfo(logger, {
      service: 'content-service',
      port: config.port,
      nodeEnv: config.nodeEnv,
      dependencies: {
        databaseUrl: config.database.url,
        weaviateUrl: config.weaviate.url,
      },
      config: {
        corsOrigin: config.cors.origin,
        weaviateClass: config.weaviate.className,
        searchDefaultLimit: config.search.defaultLimit,
        searchMaxLimit: config.search.maxLimit,
      },
      requiredEnv: ['CONTENT_DATABASE_URL'],
      optionalEnv: ['WEAVIATE_URL', 'WEAVIATE_API_KEY'],
    });
    await setupApp();
    await app.listen({ port: config.port, host: '0.0.0.0' });
    logger.info(`Content service listening on port ${config.port}`);
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

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


