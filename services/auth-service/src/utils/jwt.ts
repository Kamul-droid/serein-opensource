import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../types';

/**
 * Generate access token
 */
export function generateAccessToken(payload: {
  userId: string;
  email: string;
  sessionId: string;
}): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      sessionId: payload.sessionId,
      type: 'access',
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.accessTokenExpiresIn,
    }
  );
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: { userId: string; email: string }): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      type: 'refresh',
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.refreshTokenExpiresIn,
    }
  );
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw error;
  }
}
