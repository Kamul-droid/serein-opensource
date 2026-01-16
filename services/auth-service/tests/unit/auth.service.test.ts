import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../src/utils/jwt';
import { getSession, deleteSession } from '../../src/utils/redis';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  session: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  passwordResetToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));
jest.mock('argon2');
jest.mock('../../src/utils/jwt');
jest.mock('../../src/utils/redis');

let register: (typeof import('../../src/services/auth.service'))['register'];
let login: (typeof import('../../src/services/auth.service'))['login'];
let refreshAccessToken: (typeof import('../../src/services/auth.service'))['refreshAccessToken'];
let resetPassword: (typeof import('../../src/services/auth.service'))['resetPassword'];

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (PrismaClient as unknown as jest.Mock).mockImplementation(() => prismaMock);
    (generateAccessToken as jest.Mock).mockReturnValue('access-token');
    (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');
    (verifyToken as jest.Mock).mockReturnValue({
      type: 'refresh',
      userId: 'user-1',
      email: 'test@example.com',
    });

    if (!register) {
      ({ register, login, refreshAccessToken, resetPassword } = require('../../src/services/auth.service'));
    }
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed');
      (prismaMock.user.create as jest.Mock).mockResolvedValue(mockUser);
      (prismaMock.session.create as jest.Mock).mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        token: 'refresh-token',
        expiresAt: new Date(),
      });

      const result = await register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw ConflictError if user already exists', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      });

      await expect(
        register({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test User',
      };

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (prismaMock.session.create as jest.Mock).mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        token: 'refresh-token',
        expiresAt: new Date(),
      });

      const result = await login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
    });

    it('should throw AuthenticationError for invalid credentials', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        login({
          email: 'test@example.com',
          password: 'wrong',
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshAccessToken', () => {
    it('should reject when Redis session is missing', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        token: 'refresh-token',
        expiresAt: new Date(Date.now() + 60 * 1000),
        user: { email: 'test@example.com' },
      };

      (prismaMock.session.findUnique as jest.Mock).mockResolvedValue(mockSession);
      (getSession as jest.Mock).mockResolvedValue(null);

      await expect(refreshAccessToken('refresh-token')).rejects.toThrow('Session expired');
    });
  });

  describe('resetPassword', () => {
    it('should delete Redis sessions when resetting password', async () => {
      (prismaMock.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
        id: 'reset-1',
        userId: 'user-1',
        token: 'reset-token',
        used: false,
        expiresAt: new Date(Date.now() + 60 * 1000),
        user: { email: 'test@example.com' },
      });
      (argon2.hash as jest.Mock).mockResolvedValue('hashed');
      (prismaMock.session.findMany as jest.Mock).mockResolvedValue([
        { id: 'session-1' },
        { id: 'session-2' },
      ]);

      await resetPassword({
        token: 'reset-token',
        newPassword: 'new-password',
      });

      expect(deleteSession).toHaveBeenCalledWith('session-1');
      expect(deleteSession).toHaveBeenCalledWith('session-2');
      expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });
});
