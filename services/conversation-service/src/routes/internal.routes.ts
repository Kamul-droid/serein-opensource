import { FastifyInstance } from 'fastify';
import { config } from '../config';
import { provisionUserConversations } from '../services/conversation.service';

type UserCreatedEvent = {
  userId?: string;
  email?: string;
};

export async function registerInternalRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/internal/events/user-created', async (request, reply) => {
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
  });
}
