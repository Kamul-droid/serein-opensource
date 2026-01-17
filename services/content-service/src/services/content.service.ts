import { PrismaClient } from '@prisma/client';
import { NotFoundError, ServiceUnavailableError } from '@serein/shared/utils/errors';
import { createLogger } from '@serein/shared/utils/logger';
import { Book } from '@serein/shared/types';
import { config } from '../config';
import { PaginationQuery, RecommendationsRequest, SearchRequest } from '../types';

const logger = createLogger('content-service');
const prisma = new PrismaClient();

const normalizeBook = (book: {
  id: string;
  title: string;
  author: string;
  description: string | null;
  isbn: string | null;
  category?: { name: string } | null;
  categoryName?: string | null;
}): Book => ({
  id: book.id,
  title: book.title,
  author: book.author,
  description: book.description ?? undefined,
  category: book.category?.name || book.categoryName || 'General',
  isbn: book.isbn ?? undefined,
});

const weaviateHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  if (config.weaviate.apiKey) {
    headers.authorization = `Bearer ${config.weaviate.apiKey}`;
  }

  return headers;
};

const weaviateQuery = async (query: string) => {
  const response = await fetch(`${config.weaviate.url}/v1/graphql`, {
    method: 'POST',
    headers: weaviateHeaders(),
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ServiceUnavailableError('weaviate', {
      status: response.status,
      response: text,
    });
  }

  return response.json() as Promise<{
    data?: Record<string, Record<string, Array<Record<string, unknown>>>>;
  }>;
};

const escapeWeaviateText = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export const searchWithWeaviate = async (query: string, limit: number): Promise<Book[]> => {
  const safeQuery = escapeWeaviateText(query);
  const gql = `
    {
      Get {
        ${config.weaviate.className}(limit: ${limit}, nearText: { concepts: ["${safeQuery}"] }) {
          title
          author
          description
          category
          isbn
          _additional { id }
        }
      }
    }
  `;

  const data = await weaviateQuery(gql);
  const results = data.data?.Get?.[config.weaviate.className] ?? [];

  return results.map((item) => {
    const additional = item._additional as { id?: string } | undefined;
    return {
      id: additional?.id ?? '',
      title: String(item.title ?? ''),
      author: String(item.author ?? ''),
      description: item.description ? String(item.description) : undefined,
      category: item.category ? String(item.category) : 'General',
      isbn: item.isbn ? String(item.isbn) : undefined,
    };
  });
};

export async function listBooks(_userId: string, query: PaginationQuery): Promise<Book[]> {
  const limit = query.limit ?? config.search.defaultLimit;
  const offset = query.offset ?? 0;

  const books = await prisma.book.findMany({
    include: { category: true },
    take: limit,
    skip: offset,
    orderBy: { title: 'asc' },
  });

  return books.map((book) => normalizeBook(book));
}

export async function getBook(_userId: string, bookId: string): Promise<Book> {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: { category: true },
  });

  if (!book) {
    throw new NotFoundError('Book', bookId);
  }

  return normalizeBook(book);
}

export async function searchContent(
  _userId: string,
  request: SearchRequest
): Promise<Book[]> {
  const limit = Math.min(request.limit ?? config.search.defaultLimit, config.search.maxLimit);

  try {
    return await searchWithWeaviate(request.query, limit);
  } catch (error) {
    logger.warn({ error }, 'Weaviate search failed, falling back to database');
  }

  const books = await prisma.book.findMany({
    where: {
      OR: [
        { title: { contains: request.query, mode: 'insensitive' } },
        { author: { contains: request.query, mode: 'insensitive' } },
        { description: { contains: request.query, mode: 'insensitive' } },
      ],
    },
    include: { category: true },
    take: limit,
  });

  return books.map((book) => normalizeBook(book));
}

export async function getRecommendations(
  _userId: string,
  request: RecommendationsRequest
): Promise<Book[]> {
  const limit = Math.min(request.limit ?? config.search.defaultLimit, config.search.maxLimit);
  const beliefsText = request.beliefs.join(' ');

  try {
    return await searchWithWeaviate(beliefsText, limit);
  } catch (error) {
    logger.warn({ error }, 'Weaviate recommendations failed, falling back to database');
  }

  const books = await prisma.book.findMany({
    where: {
      OR: [
        { title: { contains: beliefsText, mode: 'insensitive' } },
        { description: { contains: beliefsText, mode: 'insensitive' } },
        { category: { name: { in: request.beliefs } } },
      ],
    },
    include: { category: true },
    take: limit,
  });

  return books.map((book) => normalizeBook(book));
}

export async function checkWeaviateHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${config.weaviate.url}/v1/.well-known/ready`);
    return response.ok;
  } catch (error) {
    logger.warn({ error }, 'Weaviate health check failed');
    return false;
  }
}
