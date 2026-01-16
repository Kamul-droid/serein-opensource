import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const hasIntegrationDeps = Boolean(process.env.DATABASE_URL && process.env.REDIS_URL);
const describeIf = hasIntegrationDeps ? describe : describe.skip;

describeIf('Auth flow integration', () => {
  let prisma: PrismaClient;
  let redis: Redis;

  beforeAll(async () => {
    jest.setTimeout(30000);
    prisma = new PrismaClient();
    redis = new Redis(process.env.REDIS_URL as string);
    await prisma.$connect();
  });

  afterAll(async () => {
    if (redis) {
      await redis.quit();
    }
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    await prisma.passwordResetToken.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});

    const keys = await redis.keys('session:*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
  });

  it('registers, logs in, refreshes, and logs out', async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

    const { registerAuthRoutes } = await import('../../src/routes/auth.routes');
    const app = Fastify();
    await app.register(registerAuthRoutes);

    const email = `user-${crypto.randomUUID()}@example.com`;
    const password = 'Password123!';

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email, password, name: 'Test User' },
    });
    expect(registerResponse.statusCode).toBe(201);
    const registerJson = registerResponse.json();
    expect(registerJson.accessToken).toBeDefined();
    expect(registerJson.refreshToken).toBeDefined();

    const meResponse = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${registerJson.accessToken}` },
    });
    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.json().user.email).toBe(email);

    const refreshResponse = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken: registerJson.refreshToken },
    });
    expect(refreshResponse.statusCode).toBe(200);
    const refreshJson = refreshResponse.json();
    expect(refreshJson.accessToken).toBeDefined();

    const logoutResponse = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      payload: { refreshToken: registerJson.refreshToken },
    });
    expect(logoutResponse.statusCode).toBe(204);

    const meAfterLogoutResponse = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${registerJson.accessToken}` },
    });
    expect(meAfterLogoutResponse.statusCode).toBe(401);

    await app.close();
  });
});
