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

const authTags = ['Auth'];
const authUserSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    name: { type: 'string' },
  },
  required: ['id', 'email'],
};
const authResponseSchema = {
  type: 'object',
  properties: {
    user: authUserSchema,
    accessToken: { type: 'string' },
    refreshToken: { type: 'string' },
  },
  required: ['user', 'accessToken', 'refreshToken'],
};
const errorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    code: { type: 'string' },
    details: { type: 'object' },
  },
};

/**
 * Register auth routes
 */
export async function registerAuthRoutes(fastify: FastifyInstance): Promise<void> {
  // Register
  fastify.post(
    '/auth/register',
    {
      schema: {
        tags: authTags,
        summary: 'Register a new user',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string' },
            password: { type: 'string' },
            name: { type: 'string' },
          },
        },
        response: {
          201: authResponseSchema,
          400: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const data = validate(registerSchema, request.body);
      const result = await register(data);
      return reply.code(201).send(result);
    }
  );

  // Login
  fastify.post(
    '/auth/login',
    {
      schema: {
        tags: authTags,
        summary: 'Login and get tokens',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string' },
            password: { type: 'string' },
          },
        },
        response: {
          200: authResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const data = validate(loginSchema, request.body);
      const result = await login(data);
      return reply.send(result);
    }
  );

  // Logout
  fastify.post(
    '/auth/logout',
    {
      schema: {
        tags: authTags,
        summary: 'Logout and revoke refresh token',
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        response: {
          204: { type: 'null' },
          400: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const body = request.body as { refreshToken?: string };
      if (!body.refreshToken) {
        return reply.code(400).send({ error: 'Refresh token is required' });
      }
      await logout(body.refreshToken);
      return reply.code(204).send();
    }
  );

  // Refresh token
  fastify.post(
    '/auth/refresh',
    {
      schema: {
        tags: authTags,
        summary: 'Refresh access token',
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
            },
            required: ['accessToken'],
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const data = validate(refreshTokenSchema, request.body);
      const result = await refreshAccessToken(data.refreshToken);
      return reply.send(result);
    }
  );

  // Forgot password
  fastify.post(
    '/auth/forgot-password',
    {
      schema: {
        tags: authTags,
        summary: 'Request a password reset',
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string' },
          },
        },
        response: {
          204: { type: 'null' },
          400: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const data = validate(forgotPasswordSchema, request.body);
      await forgotPassword(data);
      return reply.code(204).send();
    }
  );

  // Reset password
  fastify.post(
    '/auth/reset-password',
    {
      schema: {
        tags: authTags,
        summary: 'Reset password using token',
        body: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token: { type: 'string' },
            password: { type: 'string' },
          },
        },
        response: {
          204: { type: 'null' },
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const data = validate(resetPasswordSchema, request.body);
      await resetPassword(data);
      return reply.code(204).send();
    }
  );

  // Protected route example
  fastify.get(
    '/auth/me',
    {
      preHandler: authenticate,
      schema: {
        tags: authTags,
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              user: authUserSchema,
            },
            required: ['user'],
          },
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      return reply.send({
        user: request.user,
      });
    }
  );
}
