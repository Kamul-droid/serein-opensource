import Fastify from 'fastify';
import { registerAuthRoutes } from '../../src/routes/auth.routes';
import { verifyToken } from '../../src/utils/jwt';
import { getSession } from '../../src/utils/redis';

jest.mock('../../src/utils/jwt');
jest.mock('../../src/utils/redis');

describe('Auth routes integration', () => {
  const mockVerifyToken = verifyToken as jest.Mock;
  const mockGetSession = getSession as jest.Mock;

  it('returns current user when access token and session are valid', async () => {
    const app = Fastify();
    await app.register(registerAuthRoutes);

    mockVerifyToken.mockReturnValue({
      userId: 'user-1',
      email: 'test@example.com',
      sessionId: 'session-1',
      type: 'access',
    });
    mockGetSession.mockResolvedValue('user-1');

    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      user: { id: 'user-1', email: 'test@example.com' },
    });
    expect(mockGetSession).toHaveBeenCalledWith('session-1');

    await app.close();
  });
});
