import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import websocket from '@fastify/websocket';
import { config } from './config';
import { createLogger } from '@serein/shared/utils/logger';
import { attachProcessHandlers, logStartupInfo } from '@serein/shared/utils/startup';
import { registerConversationRoutes } from './routes/conversation.routes';
import { registerInternalRoutes } from './routes/internal.routes';
import { PrismaClient } from '@prisma/client';

const logger = createLogger('conversation-service');
const prisma = new PrismaClient();
attachProcessHandlers(logger, 'conversation-service');

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
        title: 'Serein Conversation Service',
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

  await app.register(websocket);

  // Health check
  app.get('/health', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;

      return reply.send({
        status: 'healthy',
        service: 'conversation-service',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
        },
      });
    } catch (error) {
      logger.error({ error }, 'Health check failed');
      return reply.code(503).send({
        status: 'unhealthy',
        service: 'conversation-service',
        timestamp: new Date().toISOString(),
      });
    }
  });

  await app.register(registerInternalRoutes);
  await app.register(registerConversationRoutes);
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
      service: 'conversation-service',
      port: config.port,
      nodeEnv: config.nodeEnv,
      dependencies: {
        databaseUrl: config.database.url,
        aiServiceUrl: config.services.aiUrl,
      },
      config: {
        corsOrigin: config.cors.origin,
      },
      requiredEnv: ['CONVERSATION_DATABASE_URL'],
      optionalEnv: ['AI_SERVICE_URL', 'INTERNAL_EVENT_SECRET'],
    });
    await setupApp();
    await app.listen({ port: config.port, host: '0.0.0.0' });
    logger.info(`Conversation service listening on port ${config.port}`);
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


