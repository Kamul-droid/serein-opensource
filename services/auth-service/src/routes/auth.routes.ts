import { FastifyInstance } from 'fastify';
import {
  register,
  login,
  logout,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
} from '../services/auth.service';
import {
  validate,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../utils/validation';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Register auth routes
 */
export async function registerAuthRoutes(fastify: FastifyInstance): Promise<void> {
  // Register
  fastify.post('/auth/register', async (request, reply) => {
    const data = validate(registerSchema, request.body);
    const result = await register(data);
    return reply.code(201).send(result);
  });

  // Login
  fastify.post('/auth/login', async (request, reply) => {
    const data = validate(loginSchema, request.body);
    const result = await login(data);
    return reply.send(result);
  });

  // Logout
  fastify.post('/auth/logout', async (request, reply) => {
    const body = request.body as { refreshToken?: string };
    if (!body.refreshToken) {
      return reply.code(400).send({ error: 'Refresh token is required' });
    }
    await logout(body.refreshToken);
    return reply.code(204).send();
  });

  // Refresh token
  fastify.post('/auth/refresh', async (request, reply) => {
    const data = validate(refreshTokenSchema, request.body);
    const result = await refreshAccessToken(data.refreshToken);
    return reply.send(result);
  });

  // Forgot password
  fastify.post('/auth/forgot-password', async (request, reply) => {
    const data = validate(forgotPasswordSchema, request.body);
    await forgotPassword(data);
    return reply.code(204).send();
  });

  // Reset password
  fastify.post('/auth/reset-password', async (request, reply) => {
    const data = validate(resetPasswordSchema, request.body);
    await resetPassword(data);
    return reply.code(204).send();
  });

  // Protected route example
  fastify.get('/auth/me', { preHandler: authenticate }, async (request, reply) => {
    return reply.send({
      user: request.user,
    });
  });
}
