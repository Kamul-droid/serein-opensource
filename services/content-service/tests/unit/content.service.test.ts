import { searchContent, getBook } from '../../src/services/content.service';

const prismaMock = {
  book: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  bookCategory: {
    findMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

describe('Content Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockRejectedValue(new Error('Weaviate unavailable')) as unknown as typeof fetch;
  });

  it('falls back to database search when Weaviate fails', async () => {
    prismaMock.book.findMany.mockResolvedValue([
      {
        id: 'book-1',
        title: 'Mindfulness Basics',
        author: 'Author One',
        description: null,
        isbn: null,
        category: { name: 'Mindfulness' },
      },
    ]);

    const results = await searchContent('user-1', { query: 'mindfulness', limit: 5 });
    expect(results).toHaveLength(1);
    expect(prismaMock.book.findMany).toHaveBeenCalled();
  });

  it('throws NotFoundError for unknown book', async () => {
    prismaMock.book.findUnique.mockResolvedValue(null);
    await expect(getBook('user-1', 'missing-book')).rejects.toThrow('Book with id missing-book not found');
  });
});
