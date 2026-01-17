import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.middleware';
import { validate, chatRequestSchema } from '../utils/validation';
import { chat, getAvailableModels, streamChat } from '../services/ai.service';

/**
 * Register AI routes
 */
export async function registerAiRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', authenticate);

  fastify.get('/ai/models', async (_request, reply) => {
    const models = await getAvailableModels();
    return reply.send({ models });
  });

  fastify.post('/ai/chat', async (request, reply) => {
    const data = validate(chatRequestSchema, request.body);
    const response = await chat(data);
    return reply.send(response);
  });

  fastify.post('/ai/chat/stream', async (request, reply) => {
    const data = validate(chatRequestSchema, request.body);
    const result = await streamChat(data);

    reply.raw.writeHead(200, {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    if (result.type === 'blocked') {
      reply.raw.write(`${JSON.stringify(result.response)}\n`);
      reply.raw.end();
      return;
    }

    for await (const chunk of result.stream) {
      reply.raw.write(chunk);
    }

    reply.raw.end();
  });
}
