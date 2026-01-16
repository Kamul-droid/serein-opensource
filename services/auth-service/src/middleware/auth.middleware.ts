import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../utils/jwt';
import { getSession } from '../utils/redis';
import { AuthenticationError } from '@serein/shared/utils/errors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Extend FastifyRequest to include user
 */
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
    };
  }
}

/**
 * Authentication middleware
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (payload.type !== 'access') {
      throw new AuthenticationError('Invalid token type');
    }

    if (!payload.sessionId) {
      throw new AuthenticationError('Session information missing');
    }

    // Verify session exists in Redis
    const sessionUserId = await getSession(payload.sessionId);
    if (!sessionUserId) {
      throw new AuthenticationError('Session expired');
    }

    // Attach user to request
    request.user = {
      id: payload.userId,
      email: payload.email,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError('Invalid token');
  }
}
