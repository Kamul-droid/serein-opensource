import Fastify from 'fastify';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { registerUserRoutes } from '../../src/routes/user.routes';

const hasIntegrationDeps = Boolean(process.env.DATABASE_URL);
const describeIf = hasIntegrationDeps ? describe : describe.skip;

const JWT_SECRET = 'test-secret';

const createApp = async () => {
  const app = Fastify();

  app.setErrorHandler((error, request, reply) => {
    if ((error as { statusCode?: number }).statusCode) {
      return reply.code((error as { statusCode: number }).statusCode).send({
        error: (error as { message: string }).message,
        code: (error as { code?: string }).code,
        details: (error as { details?: Record<string, unknown> }).details,
      });
    }

    return reply.code(500).send({
      error: 'Internal server error',
    });
  });

  await app.register(registerUserRoutes);
  return app;
};

const createAccessToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email, type: 'access' }, JWT_SECRET, { expiresIn: '15m' });
};

describeIf('User routes integration', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    await prisma.userBelief.deleteMany({});
    await prisma.userInterest.deleteMany({});
    await prisma.userPreference.deleteMany({});
    await prisma.userProfile.deleteMany({});
  });

  it('requires authentication', async () => {
    const app = await createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/users/me',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().code).toBe('AUTHENTICATION_ERROR');

    await app.close();
  });

  it('creates and returns user profile', async () => {
    const app = await createApp();
    const userId = crypto.randomUUID();
    const token = createAccessToken(userId, 'user@example.com');

    const response = await app.inject({
      method: 'GET',
      url: '/users/me',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().userId).toBe(userId);
    expect(response.json().beliefs).toEqual([]);
    expect(response.json().interests).toEqual([]);

    await app.close();
  });

  it('updates user profile fields', async () => {
    const app = await createApp();
    const userId = crypto.randomUUID();
    const token = createAccessToken(userId, 'user@example.com');

    const updateResponse = await app.inject({
      method: 'PUT',
      url: '/users/me',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
        bio: 'Hello world',
      },
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json().name).toBe('Test User');
    expect(updateResponse.json().avatarUrl).toBe('https://example.com/avatar.png');

    await app.close();
  });

  it('updates and reads preferences', async () => {
    const app = await createApp();
    const userId = crypto.randomUUID();
    const token = createAccessToken(userId, 'user@example.com');

    const updateResponse = await app.inject({
      method: 'PUT',
      url: '/users/me/preferences',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        voiceGender: 'female',
        voiceId: 'voice-1',
        communicationMode: 'both',
      },
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json().voiceGender).toBe('female');

    const getResponse = await app.inject({
      method: 'GET',
      url: '/users/me/preferences',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json().communicationMode).toBe('both');

    await app.close();
  });

  it('updates and reads beliefs', async () => {
    const app = await createApp();
    const userId = crypto.randomUUID();
    const token = createAccessToken(userId, 'user@example.com');

    const updateResponse = await app.inject({
      method: 'PUT',
      url: '/users/me/beliefs',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        beliefs: ['Mindfulness', 'Gratitude'],
      },
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json().beliefs).toEqual(['Mindfulness', 'Gratitude']);

    const getResponse = await app.inject({
      method: 'GET',
      url: '/users/me/beliefs',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json().beliefs).toEqual(['Mindfulness', 'Gratitude']);

    await app.close();
  });

  it('updates and reads interests', async () => {
    const app = await createApp();
    const userId = crypto.randomUUID();
    const token = createAccessToken(userId, 'user@example.com');

    const updateResponse = await app.inject({
      method: 'PUT',
      url: '/users/me/interests',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        interests: ['Breathing', 'Meditation'],
      },
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json().interests).toEqual(['Breathing', 'Meditation']);

    const getResponse = await app.inject({
      method: 'GET',
      url: '/users/me/interests',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json().interests).toEqual(['Breathing', 'Meditation']);

    await app.close();
  });

  it('returns validation error for invalid preferences', async () => {
    const app = await createApp();
    const userId = crypto.randomUUID();
    const token = createAccessToken(userId, 'user@example.com');

    const response = await app.inject({
      method: 'PUT',
      url: '/users/me/preferences',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        voiceGender: 'other',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe('VALIDATION_ERROR');

    await app.close();
  });
});
