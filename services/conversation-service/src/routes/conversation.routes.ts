import { FastifyInstance } from 'fastify';
import {
  createConversation,
  listConversations,
  getConversation,
  deleteConversation,
  createMessage,
  listMessages,
  listRecentMessages,
} from '../services/conversation.service';
import {
  validate,
  createConversationSchema,
  conversationIdSchema,
  paginationSchema,
  createMessageSchema,
} from '../utils/validation';
import { authenticate } from '../middleware/auth.middleware';
import { config } from '../config';
import { createLogger } from '@serein/shared/utils/logger';

const logger = createLogger('conversation-service:stream');

/**
 * Register conversation routes
 */
export async function registerConversationRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', authenticate);

  // Create conversation
  fastify.post('/conversations', async (request, reply) => {
    const userId = request.user!.id;
    const data = validate(createConversationSchema, request.body);
    const conversation = await createConversation(userId, data);
    return reply.code(201).send(conversation);
  });

  // List conversations
  fastify.get('/conversations', async (request, reply) => {
    const userId = request.user!.id;
    const query = validate(paginationSchema, request.query);
    const conversations = await listConversations(userId, query);
    return reply.send(conversations);
  });

  // Get conversation by id
  fastify.get('/conversations/:id', async (request, reply) => {
    const userId = request.user!.id;
    const params = validate(conversationIdSchema, request.params);
    const conversation = await getConversation(userId, params.id);
    return reply.send(conversation);
  });

  // Delete conversation
  fastify.delete('/conversations/:id', async (request, reply) => {
    const userId = request.user!.id;
    const params = validate(conversationIdSchema, request.params);
    await deleteConversation(userId, params.id);
    return reply.code(204).send();
  });

  // Create message
  fastify.post('/conversations/:id/messages', async (request, reply) => {
    const userId = request.user!.id;
    const params = validate(conversationIdSchema, request.params);
    const data = validate(createMessageSchema, request.body);
    const message = await createMessage(userId, params.id, data);
    return reply.code(201).send(message);
  });

  // List messages
  fastify.get('/conversations/:id/messages', async (request, reply) => {
    const userId = request.user!.id;
    const params = validate(conversationIdSchema, request.params);
    const query = validate(paginationSchema, request.query);
    const messages = await listMessages(userId, params.id, query);
    return reply.send(messages);
  });

  // WebSocket streaming
  fastify.get(
    '/conversations/:id/stream',
    { websocket: true },
    async (connection, request) => {
      const userId = request.user?.id;
      if (!userId) {
        connection.socket.close(1008, 'Unauthorized');
        return;
      }

      try {
        const params = validate(conversationIdSchema, request.params);
        await getConversation(userId, params.id);
        const authorization = request.headers.authorization;

        connection.socket.send(
          JSON.stringify({
            type: 'info',
            conversationId: params.id,
            message: 'stream-started',
          })
        );

        connection.socket.on('message', async (message) => {
          const raw = message.toString();
          let content = raw;
          try {
            const parsed = JSON.parse(raw) as { content?: string };
            if (parsed?.content) {
              content = parsed.content;
            }
          } catch (error) {
            // Non-JSON payload, treat as plain content.
          }

          try {
            await createMessage(userId, params.id, { role: 'user', content });
            const history = await listRecentMessages(userId, params.id, 20);
            const aiResponse = await fetch(`${config.services.aiUrl}/ai/chat`, {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                ...(authorization ? { authorization } : {}),
              },
              body: JSON.stringify({
                messages: history.map((msg) => ({ role: msg.role, content: msg.content })),
                conversationId: params.id,
              }),
            });

            if (!aiResponse.ok) {
              const text = await aiResponse.text();
              throw new Error(`AI service error (${aiResponse.status}): ${text}`);
            }

            const data = (await aiResponse.json()) as { message?: string };
            if (data.message) {
              await createMessage(userId, params.id, { role: 'assistant', content: data.message });
            }

            connection.socket.send(
              JSON.stringify({
                type: 'assistant',
                conversationId: params.id,
                content: data.message ?? '',
              })
            );
          } catch (error) {
            logger.error({ error }, 'AI stream handling failed');
            connection.socket.send(
              JSON.stringify({
                type: 'error',
                conversationId: params.id,
                message: 'Unable to process AI response at this time.',
              })
            );
          }
        });
      } catch (error) {
        connection.socket.close(1008, 'Unauthorized');
      }
    }
  );
}
