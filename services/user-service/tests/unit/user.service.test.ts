import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  getBeliefs,
  updateBeliefs,
  getInterests,
  updateInterests,
} from '../../src/services/user.service';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client');

const mockPrisma = {
  userProfile: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  userPreference: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  userBelief: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  userInterest: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
};

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return existing profile', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        name: 'Test User',
        bio: 'Test bio',
        beliefs: [{ belief: 'Buddhism' }],
        interests: [{ interest: 'Meditation' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.userProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);

      const result = await getProfile('user-1');

      expect(result.userId).toBe('user-1');
      expect(result.beliefs).toEqual(['Buddhism']);
      expect(result.interests).toEqual(['Meditation']);
    });

    it('should create profile if it does not exist', async () => {
      (mockPrisma.userProfile.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.userProfile.create as jest.Mock).mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        beliefs: [],
        interests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await getProfile('user-1');

      expect(mockPrisma.userProfile.create).toHaveBeenCalled();
      expect(result.userId).toBe('user-1');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        name: 'Updated Name',
        bio: 'Updated bio',
        beliefs: [],
        interests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.userProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
      (mockPrisma.userProfile.update as jest.Mock).mockResolvedValue(mockProfile);

      const result = await updateProfile('user-1', {
        name: 'Updated Name',
        bio: 'Updated bio',
      });

      expect(result.name).toBe('Updated Name');
      expect(mockPrisma.userProfile.update).toHaveBeenCalled();
    });
  });

  describe('getPreferences', () => {
    it('should return existing preferences', async () => {
      const mockPreferences = {
        id: 'pref-1',
        userId: 'user-1',
        voiceGender: 'female',
        communicationMode: 'both',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.userPreference.findUnique as jest.Mock).mockResolvedValue(mockPreferences);

      const result = await getPreferences('user-1');

      expect(result.voiceGender).toBe('female');
      expect(result.communicationMode).toBe('both');
    });
  });

  describe('updateBeliefs', () => {
    it('should update beliefs successfully', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        beliefs: [],
      };

      (mockPrisma.userProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
      (mockPrisma.userBelief.deleteMany as jest.Mock).mockResolvedValue({});
      (mockPrisma.userBelief.createMany as jest.Mock).mockResolvedValue({});

      const result = await updateBeliefs('user-1', {
        beliefs: ['Buddhism', 'Mindfulness'],
      });

      expect(result.beliefs).toEqual(['Buddhism', 'Mindfulness']);
      expect(mockPrisma.userBelief.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.userBelief.createMany).toHaveBeenCalled();
    });
  });
});
