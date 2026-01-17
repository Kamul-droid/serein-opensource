import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.middleware';
import { validate, chatRequestSchema } from '../utils/validation';
import { chat, getAvailableModels, streamChat } from '../services/ai.service';
import { ChatRequest } from '../types';

const aiTags = ['AI'];
const errorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    code: { type: 'string' },
    details: { type: 'object' },
  },
};
const chatMessageSchema = {
  type: 'object',
  properties: {
    role: { type: 'string', enum: ['user', 'assistant', 'system'] },
    content: { type: 'string' },
  },
  required: ['role', 'content'],
};
const userContextSchema = {
  type: 'object',
  properties: {
    beliefs: { type: 'array', items: { type: 'string' } },
    interests: { type: 'array', items: { type: 'string' } },
  },
};
const chatRequestJsonSchema = {
  type: 'object',
  required: ['messages'],
  properties: {
    messages: { type: 'array', items: chatMessageSchema },
    conversationId: { type: 'string' },
    model: { type: 'string' },
    temperature: { type: 'number' },
    userContext: userContextSchema,
  },
};
const aiResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    model: { type: 'string' },
    usage: {
      type: 'object',
      properties: {
        promptTokens: { type: 'number' },
        completionTokens: { type: 'number' },
        totalTokens: { type: 'number' },
      },
    },
    metadata: { type: 'object' },
  },
  required: ['message', 'model'],
};

/**
 * Register AI routes
 */
export async function registerAiRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', authenticate);

  fastify.get(
    '/ai/models',
    {
      schema: {
        tags: aiTags,
        summary: 'List available AI models',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              models: { type: 'array', items: { type: 'string' } },
            },
            required: ['models'],
          },
          401: errorResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const models = await getAvailableModels();
      return reply.send({ models });
    }
  );

  fastify.post(
    '/ai/chat',
    {
      schema: {
        tags: aiTags,
        summary: 'Send a chat request',
        security: [{ bearerAuth: [] }],
        body: chatRequestJsonSchema,
        response: {
          200: aiResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          503: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const data = validate(chatRequestSchema, request.body) as ChatRequest;
      const response = await chat(data);
      return reply.send(response);
    }
  );

  fastify.post(
    '/ai/chat/stream',
    {
      schema: {
        tags: aiTags,
        summary: 'Stream chat responses (NDJSON)',
        security: [{ bearerAuth: [] }],
        body: chatRequestJsonSchema,
        response: {
          200: { type: 'string' },
          400: errorResponseSchema,
          401: errorResponseSchema,
          503: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const data = validate(chatRequestSchema, request.body) as ChatRequest;
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
    }
  );
}
