import { FastifyInstance } from 'fastify';
import { config } from '../config';
import { provisionUserConversations } from '../services/conversation.service';

const internalTags = ['Internal'];
const errorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    code: { type: 'string' },
    details: { type: 'object' },
  },
};

type UserCreatedEvent = {
  userId?: string;
  email?: string;
};

export async function registerInternalRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post(
    '/internal/events/user-created',
    {
      schema: {
        tags: internalTags,
        summary: 'Provision conversations for new user',
        headers: {
          type: 'object',
          properties: {
            'x-internal-secret': { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['userId', 'email'],
          properties: {
            userId: { type: 'string' },
            email: { type: 'string' },
          },
        },
        response: {
          204: { type: 'null' },
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (config.events.secret) {
        const secret = request.headers['x-internal-secret'];
        if (secret !== config.events.secret) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }
      }

      const body = request.body as UserCreatedEvent;
      if (!body?.userId || !body?.email) {
        return reply.code(400).send({ error: 'userId and email are required' });
      }

      await provisionUserConversations(body.userId);
      return reply.code(204).send();
    }
  );
}
