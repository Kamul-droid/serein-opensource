let prismaMock: {
  userProfile: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  userPreference: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  userBelief: {
    deleteMany: jest.Mock;
    createMany: jest.Mock;
  };
  userInterest: {
    deleteMany: jest.Mock;
    createMany: jest.Mock;
  };
};

jest.mock('@prisma/client', () => {
  prismaMock = {
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

  return {
    PrismaClient: jest.fn(() => prismaMock),
  };
});

const {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  getBeliefs,
  updateBeliefs,
  getInterests,
  updateInterests,
} = require('../../src/services/user.service');
describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('returns existing profile with mapped fields', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        name: null,
        avatarUrl: null,
        bio: null,
        beliefs: [{ belief: 'Buddhism' }],
        interests: [{ interest: 'Meditation' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.userProfile.findUnique.mockResolvedValue(mockProfile);

      const result = await getProfile('user-1');

      expect(result.userId).toBe('user-1');
      expect(result.name).toBeUndefined();
      expect(result.avatarUrl).toBeUndefined();
      expect(result.bio).toBeUndefined();
      expect(result.beliefs).toEqual(['Buddhism']);
      expect(result.interests).toEqual(['Meditation']);
    });

    it('creates profile if it does not exist', async () => {
      prismaMock.userProfile.findUnique.mockResolvedValueOnce(null);
      prismaMock.userProfile.create.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        name: null,
        avatarUrl: null,
        bio: null,
        beliefs: [],
        interests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await getProfile('user-1');

      expect(prismaMock.userProfile.create).toHaveBeenCalledWith({
        data: { userId: 'user-1' },
        include: { beliefs: true, interests: true },
      });
      expect(result.userId).toBe('user-1');
    });
  });

  describe('updateProfile', () => {
    it('updates profile successfully', async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        name: 'Old Name',
        avatarUrl: null,
        bio: 'Old bio',
        beliefs: [],
        interests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.userProfile.update.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        name: 'Updated Name',
        avatarUrl: 'https://example.com/avatar.png',
        bio: 'Updated bio',
        beliefs: [],
        interests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await updateProfile('user-1', {
        name: 'Updated Name',
        avatarUrl: 'https://example.com/avatar.png',
        bio: 'Updated bio',
      });

      expect(prismaMock.userProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          name: 'Updated Name',
          avatarUrl: 'https://example.com/avatar.png',
          bio: 'Updated bio',
        },
        include: { beliefs: true, interests: true },
      });
      expect(result.name).toBe('Updated Name');
      expect(result.avatarUrl).toBe('https://example.com/avatar.png');
    });

    it('stores null avatar when empty string is provided', async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        name: 'Old Name',
        avatarUrl: null,
        bio: null,
        beliefs: [],
        interests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.userProfile.update.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        name: 'Old Name',
        avatarUrl: null,
        bio: null,
        beliefs: [],
        interests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await updateProfile('user-1', {
        avatarUrl: '',
      });

      expect(prismaMock.userProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ avatarUrl: null }),
        })
      );
    });
  });

  describe('getPreferences', () => {
    it('returns existing preferences', async () => {
      prismaMock.userPreference.findUnique.mockResolvedValue({
        id: 'pref-1',
        userId: 'user-1',
        voiceGender: 'female',
        voiceId: null,
        communicationMode: 'both',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await getPreferences('user-1');

      expect(result.voiceGender).toBe('female');
      expect(result.communicationMode).toBe('both');
    });

    it('creates preferences when missing', async () => {
      prismaMock.userPreference.findUnique.mockResolvedValueOnce(null);
      prismaMock.userPreference.create.mockResolvedValue({
        id: 'pref-1',
        userId: 'user-1',
        voiceGender: null,
        voiceId: null,
        communicationMode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await getPreferences('user-1');

      expect(prismaMock.userPreference.create).toHaveBeenCalledWith({
        data: { userId: 'user-1' },
      });
      expect(result.userId).toBe('user-1');
    });
  });

  describe('updatePreferences', () => {
    it('updates preferences successfully', async () => {
      prismaMock.userPreference.findUnique.mockResolvedValue({
        id: 'pref-1',
        userId: 'user-1',
        voiceGender: null,
        voiceId: null,
        communicationMode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.userPreference.update.mockResolvedValue({
        id: 'pref-1',
        userId: 'user-1',
        voiceGender: 'male',
        voiceId: 'voice-123',
        communicationMode: 'voice',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await updatePreferences('user-1', {
        voiceGender: 'male',
        voiceId: 'voice-123',
        communicationMode: 'voice',
      });

      expect(prismaMock.userPreference.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          voiceGender: 'male',
          voiceId: 'voice-123',
          communicationMode: 'voice',
        },
      });
      expect(result.voiceId).toBe('voice-123');
    });
  });

  describe('getBeliefs', () => {
    it('returns beliefs for existing profile', async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        beliefs: [{ belief: 'Mindfulness' }],
      });

      const result = await getBeliefs('user-1');

      expect(result.beliefs).toEqual(['Mindfulness']);
    });

    it('creates profile and returns empty beliefs when missing', async () => {
      prismaMock.userProfile.findUnique.mockResolvedValueOnce(null);
      prismaMock.userProfile.findUnique.mockResolvedValueOnce(null);
      prismaMock.userProfile.create.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        beliefs: [],
        interests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await getBeliefs('user-1');

      expect(prismaMock.userProfile.create).toHaveBeenCalled();
      expect(result.beliefs).toEqual([]);
    });
  });

  describe('updateBeliefs', () => {
    it('updates beliefs successfully', async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        beliefs: [],
        interests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await updateBeliefs('user-1', {
        beliefs: ['Buddhism', 'Mindfulness'],
      });

      expect(prismaMock.userBelief.deleteMany).toHaveBeenCalledWith({
        where: { profileId: 'profile-1' },
      });
      expect(prismaMock.userBelief.createMany).toHaveBeenCalledWith({
        data: [
          { profileId: 'profile-1', belief: 'Buddhism' },
          { profileId: 'profile-1', belief: 'Mindfulness' },
        ],
      });
      expect(result.beliefs).toEqual(['Buddhism', 'Mindfulness']);
    });

    it('skips createMany when beliefs are empty', async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        beliefs: [],
        interests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await updateBeliefs('user-1', { beliefs: [] });

      expect(prismaMock.userBelief.deleteMany).toHaveBeenCalled();
      expect(prismaMock.userBelief.createMany).not.toHaveBeenCalled();
      expect(result.beliefs).toEqual([]);
    });
  });

  describe('getInterests', () => {
    it('returns interests for existing profile', async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        interests: [{ interest: 'Meditation' }],
      });

      const result = await getInterests('user-1');

      expect(result.interests).toEqual(['Meditation']);
    });

    it('creates profile and returns empty interests when missing', async () => {
      prismaMock.userProfile.findUnique.mockResolvedValueOnce(null);
      prismaMock.userProfile.findUnique.mockResolvedValueOnce(null);
      prismaMock.userProfile.create.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        beliefs: [],
        interests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await getInterests('user-1');

      expect(prismaMock.userProfile.create).toHaveBeenCalled();
      expect(result.interests).toEqual([]);
    });
  });

  describe('updateInterests', () => {
    it('updates interests successfully', async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        beliefs: [],
        interests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await updateInterests('user-1', {
        interests: ['Meditation', 'Breathing'],
      });

      expect(prismaMock.userInterest.deleteMany).toHaveBeenCalledWith({
        where: { profileId: 'profile-1' },
      });
      expect(prismaMock.userInterest.createMany).toHaveBeenCalledWith({
        data: [
          { profileId: 'profile-1', interest: 'Meditation' },
          { profileId: 'profile-1', interest: 'Breathing' },
        ],
      });
      expect(result.interests).toEqual(['Meditation', 'Breathing']);
    });

    it('skips createMany when interests are empty', async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        beliefs: [],
        interests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await updateInterests('user-1', { interests: [] });

      expect(prismaMock.userInterest.deleteMany).toHaveBeenCalled();
      expect(prismaMock.userInterest.createMany).not.toHaveBeenCalled();
      expect(result.interests).toEqual([]);
    });
  });
});


