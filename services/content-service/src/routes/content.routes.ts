import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.middleware';
import { validate, bookIdSchema, paginationSchema, searchSchema, recommendationsSchema } from '../utils/validation';
import { getBook, getRecommendations, listBooks, searchContent } from '../services/content.service';

/**
 * Register content routes
 */
export async function registerContentRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', authenticate);

  fastify.get('/content/books', async (request, reply) => {
    const userId = request.user!.id;
    const query = validate(paginationSchema, request.query);
    const books = await listBooks(userId, query);
    return reply.send(books);
  });

  fastify.get('/content/books/:id', async (request, reply) => {
    const userId = request.user!.id;
    const params = validate(bookIdSchema, request.params);
    const book = await getBook(userId, params.id);
    return reply.send(book);
  });

  fastify.post('/content/search', async (request, reply) => {
    const userId = request.user!.id;
    const data = validate(searchSchema, request.body);
    const results = await searchContent(userId, data);
    return reply.send({ results });
  });

  fastify.post('/content/recommendations', async (request, reply) => {
    const userId = request.user!.id;
    const data = validate(recommendationsSchema, request.body);
    const results = await getRecommendations(userId, data);
    return reply.send({ results });
  });
}
