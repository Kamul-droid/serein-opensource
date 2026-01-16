import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { storeSession, deleteSession } from '../utils/redis';
import { config } from '../config';
import { AuthenticationError, ConflictError, NotFoundError } from '@serein/shared/utils/errors';
import { createLogger } from '@serein/shared/utils/logger';
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../types';

const logger = createLogger('auth-service');
const prisma = new PrismaClient();

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await argon2.hash(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
  });

  // Generate refresh token
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  // Store refresh token in database
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Store session in Redis
  await storeSession(session.id, user.id, config.session.timeoutMs);

  // Generate access token tied to session
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    sessionId: session.id,
  });

  logger.info({ userId: user.id, email: user.email }, 'User registered');

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Login user
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Verify password
  try {
    const isValid = await argon2.verify(user.password, data.password);
    if (!isValid) {
      throw new AuthenticationError('Invalid email or password');
    }
  } catch (error) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Generate refresh token
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  // Store refresh token in database
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Store session in Redis
  await storeSession(session.id, user.id, config.session.timeoutMs);

  // Generate access token tied to session
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    sessionId: session.id,
  });

  logger.info({ userId: user.id, email: user.email }, 'User logged in');

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Logout user
 */
export async function logout(refreshToken: string): Promise<void> {
  // Find and delete session
  const session = await prisma.session.findUnique({
    where: { token: refreshToken },
  });

  if (session) {
    await prisma.session.delete({
      where: { id: session.id },
    });

    // Delete from Redis
    await deleteSession(session.id);

    logger.info({ userId: session.userId }, 'User logged out');
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  // Verify token
  const payload = verifyToken(refreshToken);

  if (payload.type !== 'refresh') {
    throw new AuthenticationError('Invalid token type');
  }

  // Check if session exists
  const session = await prisma.session.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new AuthenticationError('Session expired or invalid');
  }

  // Generate new access token
  const accessToken = generateAccessToken({
    userId: session.userId,
    email: session.user.email,
    sessionId: session.id,
  });

  logger.info({ userId: session.userId }, 'Access token refreshed');

  return { accessToken };
}

/**
 * Request password reset
 */
export async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    // Don't reveal if user exists for security
    logger.warn({ email: data.email }, 'Password reset requested for non-existent user');
    return;
  }

  // Generate reset token
  const resetToken = generateAccessToken({ userId: user.id, email: user.email });

  // Store reset token
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: resetToken,
      expiresAt: new Date(Date.now() + config.passwordReset.tokenExpiresIn),
    },
  });

  // TODO: Send email with reset link
  // For now, just log it
  logger.info(
    { userId: user.id, email: user.email, token: resetToken },
    'Password reset token generated'
  );

  // In production, send email here
  console.log(`Password reset link: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);
}

/**
 * Reset password
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  // Find reset token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: data.token },
    include: { user: true },
  });

  if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
    throw new AuthenticationError('Invalid or expired reset token');
  }

  // Hash new password
  const hashedPassword = await argon2.hash(data.newPassword);

  // Update user password
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  });

  // Mark token as used
  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { used: true },
  });

  // Invalidate all sessions for this user
  await prisma.session.deleteMany({
    where: { userId: resetToken.userId },
  });

  logger.info({ userId: resetToken.userId }, 'Password reset completed');
}
