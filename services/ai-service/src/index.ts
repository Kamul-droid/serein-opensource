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
import { registerAiRoutes } from './routes/ai.routes';
import { checkOllamaHealth } from './services/ai.service';

const logger = createLogger('ai-service');
const metrics = createMetrics('ai-service');
attachProcessHandlers(logger, 'ai-service');

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
        title: 'Serein AI Service',
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
      service: 'ai-service',
      port: config.port,
      nodeEnv: config.nodeEnv,
      dependencies: {
        ollamaBaseUrl: config.ollama.baseUrl,
      },
      config: {
        corsOrigin: config.cors.origin,
        ollamaDefaultModel: config.ollama.defaultModel,
        ollamaLightModels: config.ollama.lightModels,
        ollamaHeavyModels: config.ollama.heavyModels,
        ollamaTimeoutMs: config.ollama.timeoutMs,
        ollamaRetries: config.ollama.retries,
        ollamaBreakerThreshold: config.ollama.breakerThreshold,
        ollamaBreakerCooldownMs: config.ollama.breakerCooldownMs,
        domainStrict: config.domain.strict,
      },
      requiredEnv: [],
      optionalEnv: [
        'OLLAMA_BASE_URL',
        'OLLAMA_DEFAULT_MODEL',
        'OLLAMA_LIGHT_MODELS',
        'OLLAMA_HEAVY_MODELS',
        'AI_DOMAIN_STRICT',
      ],
    });
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


