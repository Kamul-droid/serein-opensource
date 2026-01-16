import { FastifyInstance } from 'fastify';
import {
  createConversation,
  listConversations,
  getConversation,
  deleteConversation,
  createMessage,
  listMessages,
} from '../services/conversation.service';
import {
  validate,
  createConversationSchema,
  conversationIdSchema,
  paginationSchema,
  createMessageSchema,
} from '../utils/validation';
import { authenticate } from '../middleware/auth.middleware';

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

        connection.socket.send(
          JSON.stringify({
            type: 'info',
            conversationId: params.id,
            message: 'stream-started',
          })
        );

        connection.socket.on('message', (message) => {
          const content = message.toString();
          // TODO: Replace echo with AI streaming integration.
          connection.socket.send(
            JSON.stringify({
              type: 'echo',
              conversationId: params.id,
              content,
            })
          );
        });
      } catch (error) {
        connection.socket.close(1008, 'Unauthorized');
      }
    }
  );
}
