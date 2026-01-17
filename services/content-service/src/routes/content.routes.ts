import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.middleware';
import { validate, bookIdSchema, paginationSchema, searchSchema, recommendationsSchema } from '../utils/validation';
import { getBook, getRecommendations, listBooks, searchContent } from '../services/content.service';
import { PaginationQuery, RecommendationsRequest, SearchRequest } from '../types';

const contentTags = ['Content'];
const errorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    code: { type: 'string' },
    details: { type: 'object' },
  },
};
const bookSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    author: { type: 'string' },
    description: { type: 'string' },
    category: { type: 'string' },
    isbn: { type: 'string' },
  },
  required: ['id', 'title', 'author', 'category'],
};

/**
 * Register content routes
 */
export async function registerContentRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', authenticate);

  fastify.get(
    '/content/books',
    {
      schema: {
        tags: contentTags,
        summary: 'List books',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'number' },
            offset: { type: 'number' },
          },
        },
        response: {
          200: { type: 'array', items: bookSchema },
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const query = validate(paginationSchema, request.query) as PaginationQuery;
      const books = await listBooks(userId, query);
      return reply.send(books);
    }
  );

  fastify.get(
    '/content/books/:id',
    {
      schema: {
        tags: contentTags,
        summary: 'Get a book by id',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: bookSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const params = validate(bookIdSchema, request.params);
      const book = await getBook(userId, params.id);
      return reply.send(book);
    }
  );

  fastify.post(
    '/content/search',
    {
      schema: {
        tags: contentTags,
        summary: 'Search content',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string' },
            limit: { type: 'number' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              results: { type: 'array', items: bookSchema },
            },
            required: ['results'],
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const data = validate(searchSchema, request.body) as SearchRequest;
      const results = await searchContent(userId, data);
      return reply.send({ results });
    }
  );

  fastify.post(
    '/content/recommendations',
    {
      schema: {
        tags: contentTags,
        summary: 'Get content recommendations',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['beliefs'],
          properties: {
            beliefs: { type: 'array', items: { type: 'string' } },
            limit: { type: 'number' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              results: { type: 'array', items: bookSchema },
            },
            required: ['results'],
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const data = validate(recommendationsSchema, request.body) as RecommendationsRequest;
      const results = await getRecommendations(userId, data);
      return reply.send({ results });
    }
  );
}
