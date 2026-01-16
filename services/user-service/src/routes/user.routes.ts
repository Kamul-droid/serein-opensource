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

/**
 * Register user routes
 */
export async function registerUserRoutes(fastify: FastifyInstance): Promise<void> {
  // Apply authentication to all routes
  fastify.addHook('onRequest', authenticate);

  // Get current user profile
  fastify.get('/users/me', async (request, reply) => {
    const userId = request.user!.id;
    const profile = await getProfile(userId);
    return reply.send(profile);
  });

  // Update current user profile
  fastify.put('/users/me', async (request, reply) => {
    const userId = request.user!.id;
    const data = validate(updateProfileSchema, request.body);
    const profile = await updateProfile(userId, data);
    return reply.send(profile);
  });

  // Get user preferences
  fastify.get('/users/me/preferences', async (request, reply) => {
    const userId = request.user!.id;
    const preferences = await getPreferences(userId);
    return reply.send(preferences);
  });

  // Update user preferences
  fastify.put('/users/me/preferences', async (request, reply) => {
    const userId = request.user!.id;
    const data = validate(updatePreferencesSchema, request.body);
    const preferences = await updatePreferences(userId, data);
    return reply.send(preferences);
  });

  // Get user beliefs
  fastify.get('/users/me/beliefs', async (request, reply) => {
    const userId = request.user!.id;
    const beliefs = await getBeliefs(userId);
    return reply.send(beliefs);
  });

  // Update user beliefs
  fastify.put('/users/me/beliefs', async (request, reply) => {
    const userId = request.user!.id;
    const data = validate(updateBeliefsSchema, request.body);
    const beliefs = await updateBeliefs(userId, data);
    return reply.send(beliefs);
  });

  // Get user interests
  fastify.get('/users/me/interests', async (request, reply) => {
    const userId = request.user!.id;
    const interests = await getInterests(userId);
    return reply.send(interests);
  });

  // Update user interests
  fastify.put('/users/me/interests', async (request, reply) => {
    const userId = request.user!.id;
    const data = validate(updateInterestsSchema, request.body);
    const interests = await updateInterests(userId, data);
    return reply.send(interests);
  });
}
