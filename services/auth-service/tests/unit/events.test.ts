describe('emitUserCreatedEvent', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  it('posts to user and conversation services with optional secret', async () => {
    process.env.USER_SERVICE_URL = 'http://user-service';
    process.env.CONVERSATION_SERVICE_URL = 'http://conversation-service';
    process.env.INTERNAL_EVENT_SECRET = 'secret';

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    });
    (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock;

    const { emitUserCreatedEvent } = await import('../../src/utils/events');
    await emitUserCreatedEvent({ userId: 'user-1', email: 'test@example.com' });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://user-service/internal/events/user-created',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'content-type': 'application/json',
          'x-internal-secret': 'secret',
        }),
      })
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'http://conversation-service/internal/events/user-created',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'content-type': 'application/json',
          'x-internal-secret': 'secret',
        }),
      })
    );
  });
});
