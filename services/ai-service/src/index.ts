import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config';
import { createLogger } from '@serein/shared/utils/logger';
import { registerAiRoutes } from './routes/ai.routes';
import { checkOllamaHealth } from './services/ai.service';

const logger = createLogger('ai-service');

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
        title: 'Ai service API',
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

  app.get('/health', async (_request, reply) => {
    const ollamaHealthy = await checkOllamaHealth();
    if (!ollamaHealthy) {
      return reply.code(503).send({
        status: 'unhealthy',
        service: 'ai-service',
        timestamp: new Date().toISOString(),
        checks: {
          ollama: 'unreachable',
        },
      });
    }

    return reply.send({
      status: 'healthy',
      service: 'ai-service',
      timestamp: new Date().toISOString(),
      checks: {
        ollama: 'ok',
      },
    });
  });

  await app.register(registerAiRoutes);
}

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

const start = async () => {
  try {
    await setupApp();
    await app.listen({ port: config.port, host: '0.0.0.0' });
    logger.info(`AI service listening on port ${config.port}`);
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await app.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await app.close();
  process.exit(0);
});

start();

