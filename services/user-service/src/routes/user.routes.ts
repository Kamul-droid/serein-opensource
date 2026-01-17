import { FastifyInstance } from 'fastify';
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  getBeliefs,
  updateBeliefs,
  getInterests,
  updateInterests,
} from '../services/user.service';
import {
  validate,
  updateProfileSchema,
  updatePreferencesSchema,
  updateBeliefsSchema,
  updateInterestsSchema,
} from '../utils/validation';
import { authenticate } from '../middleware/auth.middleware';

const userTags = ['Users'];
const errorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    code: { type: 'string' },
    details: { type: 'object' },
  },
};
const userProfileSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    name: { type: 'string' },
    avatarUrl: { type: 'string' },
    bio: { type: 'string' },
    beliefs: { type: 'array', items: { type: 'string' } },
    interests: { type: 'array', items: { type: 'string' } },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
  required: ['id', 'userId', 'beliefs', 'interests', 'createdAt', 'updatedAt'],
};
const userPreferencesSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    voiceGender: { type: 'string' },
    voiceId: { type: 'string' },
    communicationMode: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
  required: ['id', 'userId', 'createdAt', 'updatedAt'],
};
const userBeliefsSchema = {
  type: 'object',
  properties: {
    beliefs: { type: 'array', items: { type: 'string' } },
  },
  required: ['beliefs'],
};
const userInterestsSchema = {
  type: 'object',
  properties: {
    interests: { type: 'array', items: { type: 'string' } },
  },
  required: ['interests'],
};

/**
 * Register user routes
 */
export async function registerUserRoutes(fastify: FastifyInstance): Promise<void> {
  // Apply authentication to all routes
  fastify.addHook('onRequest', authenticate);

  // Get current user profile
  fastify.get(
    '/users/me',
    {
      schema: {
        tags: userTags,
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        response: {
          200: userProfileSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const profile = await getProfile(userId);
      return reply.send(profile);
    }
  );

  // Update current user profile
  fastify.put(
    '/users/me',
    {
      schema: {
        tags: userTags,
        summary: 'Update current user profile',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            avatarUrl: { type: 'string' },
            bio: { type: 'string' },
          },
        },
        response: {
          200: userProfileSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const data = validate(updateProfileSchema, request.body);
      const profile = await updateProfile(userId, data);
      return reply.send(profile);
    }
  );

  // Get user preferences
  fastify.get(
    '/users/me/preferences',
    {
      schema: {
        tags: userTags,
        summary: 'Get user preferences',
        security: [{ bearerAuth: [] }],
        response: {
          200: userPreferencesSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const preferences = await getPreferences(userId);
      return reply.send(preferences);
    }
  );

  // Update user preferences
  fastify.put(
    '/users/me/preferences',
    {
      schema: {
        tags: userTags,
        summary: 'Update user preferences',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            voiceGender: { type: 'string' },
            voiceId: { type: 'string' },
            communicationMode: { type: 'string' },
          },
        },
        response: {
          200: userPreferencesSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const data = validate(updatePreferencesSchema, request.body);
      const preferences = await updatePreferences(userId, data);
      return reply.send(preferences);
    }
  );

  // Get user beliefs
  fastify.get(
    '/users/me/beliefs',
    {
      schema: {
        tags: userTags,
        summary: 'Get user beliefs',
        security: [{ bearerAuth: [] }],
        response: {
          200: userBeliefsSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const beliefs = await getBeliefs(userId);
      return reply.send(beliefs);
    }
  );

  // Update user beliefs
  fastify.put(
    '/users/me/beliefs',
    {
      schema: {
        tags: userTags,
        summary: 'Update user beliefs',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['beliefs'],
          properties: {
            beliefs: { type: 'array', items: { type: 'string' } },
          },
        },
        response: {
          200: userBeliefsSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const data = validate(updateBeliefsSchema, request.body);
      const beliefs = await updateBeliefs(userId, data);
      return reply.send(beliefs);
    }
  );

  // Get user interests
  fastify.get(
    '/users/me/interests',
    {
      schema: {
        tags: userTags,
        summary: 'Get user interests',
        security: [{ bearerAuth: [] }],
        response: {
          200: userInterestsSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const interests = await getInterests(userId);
      return reply.send(interests);
    }
  );

  // Update user interests
  fastify.put(
    '/users/me/interests',
    {
      schema: {
        tags: userTags,
        summary: 'Update user interests',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['interests'],
          properties: {
            interests: { type: 'array', items: { type: 'string' } },
          },
        },
        response: {
          200: userInterestsSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const data = validate(updateInterestsSchema, request.body);
      const interests = await updateInterests(userId, data);
      return reply.send(interests);
    }
  );
}
