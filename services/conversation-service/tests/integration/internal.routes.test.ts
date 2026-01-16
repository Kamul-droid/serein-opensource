import Fastify from 'fastify';

describe('Conversation internal routes', () => {
  const originalSecret = process.env.INTERNAL_EVENT_SECRET;

  afterEach(() => {
    process.env.INTERNAL_EVENT_SECRET = originalSecret;
    jest.resetModules();
  });

  it('provisions default conversation on user-created event', async () => {
    process.env.INTERNAL_EVENT_SECRET = '';
    const provisionUserConversations = jest.fn();
    jest.doMock('../../src/services/conversation.service', () => ({
      provisionUserConversations,
    }));

    const { registerInternalRoutes } = await import('../../src/routes/internal.routes');
    const app = Fastify();
    await app.register(registerInternalRoutes);

    const response = await app.inject({
      method: 'POST',
      url: '/internal/events/user-created',
      payload: { userId: 'user-1', email: 'test@example.com' },
    });

    expect(response.statusCode).toBe(204);
    expect(provisionUserConversations).toHaveBeenCalledWith('user-1');

    await app.close();
  });

  it('rejects missing secret when configured', async () => {
    process.env.INTERNAL_EVENT_SECRET = 'secret';
    jest.doMock('../../src/services/conversation.service', () => ({
      provisionUserConversations: jest.fn(),
    }));

    const { registerInternalRoutes } = await import('../../src/routes/internal.routes');
    const app = Fastify();
    await app.register(registerInternalRoutes);

    const response = await app.inject({
      method: 'POST',
      url: '/internal/events/user-created',
      payload: { userId: 'user-1', email: 'test@example.com' },
    });

    expect(response.statusCode).toBe(401);

    await app.close();
  });
});
