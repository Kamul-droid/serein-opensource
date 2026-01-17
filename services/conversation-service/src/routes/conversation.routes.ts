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
const decoder = new TextDecoder();

const conversationTags = ['Conversations'];
const errorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    code: { type: 'string' },
    details: { type: 'object' },
  },
};
const conversationSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    title: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
  required: ['id', 'userId', 'createdAt', 'updatedAt'],
};
const messageSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    conversationId: { type: 'string' },
    role: { type: 'string', enum: ['user', 'assistant', 'system'] },
    content: { type: 'string' },
    createdAt: { type: 'string' },
  },
  required: ['id', 'conversationId', 'role', 'content', 'createdAt'],
};

/**
 * Register conversation routes
 */
export async function registerConversationRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', authenticate);

  // Create conversation
  fastify.post(
    '/conversations',
    {
      schema: {
        tags: conversationTags,
        summary: 'Create conversation',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
          },
        },
        response: {
          201: conversationSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const data = validate(createConversationSchema, request.body);
      const conversation = await createConversation(userId, data);
      return reply.code(201).send(conversation);
    }
  );

  // List conversations
  fastify.get(
    '/conversations',
    {
      schema: {
        tags: conversationTags,
        summary: 'List conversations',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'number' },
            offset: { type: 'number' },
          },
        },
        response: {
          200: { type: 'array', items: conversationSchema },
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const query = validate(paginationSchema, request.query);
      const conversations = await listConversations(userId, query);
      return reply.send(conversations);
    }
  );

  // Get conversation by id
  fastify.get(
    '/conversations/:id',
    {
      schema: {
        tags: conversationTags,
        summary: 'Get conversation by id',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: conversationSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const params = validate(conversationIdSchema, request.params);
      const conversation = await getConversation(userId, params.id);
      return reply.send(conversation);
    }
  );

  // Delete conversation
  fastify.delete(
    '/conversations/:id',
    {
      schema: {
        tags: conversationTags,
        summary: 'Delete conversation',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          204: { type: 'null' },
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const params = validate(conversationIdSchema, request.params);
      await deleteConversation(userId, params.id);
      return reply.code(204).send();
    }
  );

  // Create message
  fastify.post(
    '/conversations/:id/messages',
    {
      schema: {
        tags: conversationTags,
        summary: 'Create message',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['role', 'content'],
          properties: {
            role: { type: 'string', enum: ['user', 'assistant', 'system'] },
            content: { type: 'string' },
          },
        },
        response: {
          201: messageSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const params = validate(conversationIdSchema, request.params);
      const data = validate(createMessageSchema, request.body);
      const message = await createMessage(userId, params.id, data);
      return reply.code(201).send(message);
    }
  );

  // List messages
  fastify.get(
    '/conversations/:id/messages',
    {
      schema: {
        tags: conversationTags,
        summary: 'List messages',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'number' },
            offset: { type: 'number' },
          },
        },
        response: {
          200: { type: 'array', items: messageSchema },
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const params = validate(conversationIdSchema, request.params);
      const query = validate(paginationSchema, request.query);
      const messages = await listMessages(userId, params.id, query);
      return reply.send(messages);
    }
  );

  // WebSocket streaming
  fastify.get(
    '/conversations/:id/stream',
    {
      websocket: true,
      schema: {
        tags: conversationTags,
        summary: 'Stream conversation responses over WebSocket',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
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
            const aiResponse = await fetch(`${config.services.aiUrl}/ai/chat/stream`, {
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

            if (!aiResponse.body) {
              throw new Error('AI stream missing body');
            }

            let fullContent = '';
            let buffer = '';
            const reader = aiResponse.body.getReader();

            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) {
                  continue;
                }
                try {
                  const payload = JSON.parse(trimmed) as {
                    message?: { content?: string };
                    response?: string;
                    done?: boolean;
                  };
                  const delta = payload.message?.content ?? payload.response ?? '';
                  if (delta) {
                    fullContent += delta;
                    connection.socket.send(
                      JSON.stringify({
                        type: 'assistant_chunk',
                        conversationId: params.id,
                        delta,
                      })
                    );
                  }
                } catch (parseError) {
                  logger.warn({ parseError, line: trimmed }, 'Failed to parse AI chunk');
                }
              }
            }

            if (buffer.trim()) {
              try {
                const payload = JSON.parse(buffer) as {
                  message?: { content?: string };
                  response?: string;
                };
                const delta = payload.message?.content ?? payload.response ?? '';
                if (delta) {
                  fullContent += delta;
                  connection.socket.send(
                    JSON.stringify({
                      type: 'assistant_chunk',
                      conversationId: params.id,
                      delta,
                    })
                  );
                }
              } catch (error) {
                logger.warn({ error, buffer }, 'Failed to parse trailing AI chunk');
              }
            }

            if (fullContent) {
              await createMessage(userId, params.id, { role: 'assistant', content: fullContent });
            }

            connection.socket.send(
              JSON.stringify({
                type: 'assistant',
                conversationId: params.id,
                content: fullContent,
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
