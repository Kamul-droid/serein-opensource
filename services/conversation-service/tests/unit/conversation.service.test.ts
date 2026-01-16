let prismaMock: {
  conversation: {
    findFirst: jest.Mock;
    create: jest.Mock;
    findMany: jest.Mock;
    delete: jest.Mock;
  };
  message: {
    create: jest.Mock;
    findMany: jest.Mock;
  };
};

jest.mock('@prisma/client', () => {
  prismaMock = {
    conversation: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => prismaMock),
  };
});

const {
  createConversation,
  listConversations,
  getConversation,
  deleteConversation,
  createMessage,
  listMessages,
} = require('../../src/services/conversation.service');

describe('Conversation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a conversation', async () => {
    prismaMock.conversation.create.mockResolvedValue({
      id: 'conv-1',
      userId: 'user-1',
      title: 'Test',
    });

    const result = await createConversation('user-1', { title: 'Test' });

    expect(prismaMock.conversation.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', title: 'Test' },
    });
    expect(result.id).toBe('conv-1');
  });

  it('lists conversations with pagination', async () => {
    prismaMock.conversation.findMany.mockResolvedValue([{ id: 'conv-1' }]);

    const result = await listConversations('user-1', { limit: 10, offset: 0 });

    expect(prismaMock.conversation.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      skip: 0,
    });
    expect(result).toHaveLength(1);
  });

  it('gets a conversation when owned by user', async () => {
    prismaMock.conversation.findFirst.mockResolvedValue({
      id: 'conv-1',
      userId: 'user-1',
    });

    const result = await getConversation('user-1', 'conv-1');

    expect(result.id).toBe('conv-1');
  });

  it('throws when conversation is missing', async () => {
    prismaMock.conversation.findFirst.mockResolvedValue(null);

    await expect(getConversation('user-1', 'missing')).rejects.toThrow('not found');
  });

  it('deletes a conversation', async () => {
    prismaMock.conversation.findFirst.mockResolvedValue({
      id: 'conv-1',
      userId: 'user-1',
    });

    await deleteConversation('user-1', 'conv-1');

    expect(prismaMock.conversation.delete).toHaveBeenCalledWith({
      where: { id: 'conv-1' },
    });
  });

  it('creates a message', async () => {
    prismaMock.conversation.findFirst.mockResolvedValue({
      id: 'conv-1',
      userId: 'user-1',
    });
    prismaMock.message.create.mockResolvedValue({
      id: 'msg-1',
      conversationId: 'conv-1',
      role: 'user',
      content: 'Hello',
    });

    const result = await createMessage('user-1', 'conv-1', {
      role: 'user',
      content: 'Hello',
    });

    expect(prismaMock.message.create).toHaveBeenCalledWith({
      data: { conversationId: 'conv-1', role: 'user', content: 'Hello' },
    });
    expect(result.id).toBe('msg-1');
  });

  it('lists messages with pagination', async () => {
    prismaMock.conversation.findFirst.mockResolvedValue({
      id: 'conv-1',
      userId: 'user-1',
    });
    prismaMock.message.findMany.mockResolvedValue([{ id: 'msg-1' }]);

    const result = await listMessages('user-1', 'conv-1', { limit: 5, offset: 0 });

    expect(prismaMock.message.findMany).toHaveBeenCalledWith({
      where: { conversationId: 'conv-1' },
      orderBy: { createdAt: 'asc' },
      take: 5,
      skip: 0,
    });
    expect(result).toHaveLength(1);
  });
});
