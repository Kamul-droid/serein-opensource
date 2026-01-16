import { PrismaClient } from '@prisma/client';
import { createLogger } from '@serein/shared/utils/logger';
import {
  UserProfile,
  UpdateProfileRequest,
  UserPreferences,
  UpdatePreferencesRequest,
  UserBeliefs,
  UserInterests,
} from '../types';

const logger = createLogger('user-service');
const prisma = new PrismaClient();

/**
 * Get user profile
 */
export async function getProfile(userId: string): Promise<UserProfile> {
  let profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: {
      beliefs: true,
      interests: true,
    },
  });

  // Create profile if it doesn't exist
  if (!profile) {
    profile = await prisma.userProfile.create({
      data: {
        userId,
      },
      include: {
        beliefs: true,
        interests: true,
      },
    });
    logger.info({ userId }, 'Created new user profile');
  }

  return {
    id: profile.id,
    userId: profile.userId,
    name: profile.name || undefined,
    avatarUrl: profile.avatarUrl || undefined,
    bio: profile.bio || undefined,
    beliefs: profile.beliefs.map((b: { belief: string }) => b.belief),
    interests: profile.interests.map((i: { interest: string }) => i.interest),
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileRequest
): Promise<UserProfile> {
  // Ensure profile exists
  await getProfile(userId);

  const profile = await prisma.userProfile.update({
    where: { userId },
    data: {
      name: data.name,
      avatarUrl: data.avatarUrl || null,
      bio: data.bio,
    },
    include: {
      beliefs: true,
      interests: true,
    },
  });

  logger.info({ userId }, 'User profile updated');

  return {
    id: profile.id,
    userId: profile.userId,
    name: profile.name || undefined,
    avatarUrl: profile.avatarUrl || undefined,
    bio: profile.bio || undefined,
    beliefs: profile.beliefs.map((b: { belief: string }) => b.belief),
    interests: profile.interests.map((i: { interest: string }) => i.interest),
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

/**
 * Get user preferences
 */
export async function getPreferences(userId: string): Promise<UserPreferences> {
  let preferences = await prisma.userPreference.findUnique({
    where: { userId },
  });

  // Create preferences if they don't exist
  if (!preferences) {
    preferences = await prisma.userPreference.create({
      data: {
        userId,
      },
    });
    logger.info({ userId }, 'Created new user preferences');
  }

  return {
    id: preferences.id,
    userId: preferences.userId,
    voiceGender: (preferences.voiceGender as 'male' | 'female' | undefined) || undefined,
    voiceId: preferences.voiceId || undefined,
    communicationMode:
      (preferences.communicationMode as 'text' | 'voice' | 'both' | undefined) || undefined,
    createdAt: preferences.createdAt,
    updatedAt: preferences.updatedAt,
  };
}

/**
 * Update user preferences
 */
export async function updatePreferences(
  userId: string,
  data: UpdatePreferencesRequest
): Promise<UserPreferences> {
  // Ensure preferences exist
  await getPreferences(userId);

  const preferences = await prisma.userPreference.update({
    where: { userId },
    data: {
      voiceGender: data.voiceGender,
      voiceId: data.voiceId,
      communicationMode: data.communicationMode,
    },
  });

  logger.info({ userId }, 'User preferences updated');

  return {
    id: preferences.id,
    userId: preferences.userId,
    voiceGender: (preferences.voiceGender as 'male' | 'female' | undefined) || undefined,
    voiceId: preferences.voiceId || undefined,
    communicationMode:
      (preferences.communicationMode as 'text' | 'voice' | 'both' | undefined) || undefined,
    createdAt: preferences.createdAt,
    updatedAt: preferences.updatedAt,
  };
}

/**
 * Get user beliefs
 */
export async function getBeliefs(userId: string): Promise<UserBeliefs> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: {
      beliefs: true,
    },
  });

  if (!profile) {
    // Create profile if it doesn't exist
    await getProfile(userId);
    return { beliefs: [] };
  }

  return {
    beliefs: profile.beliefs.map((b: { belief: string }) => b.belief),
  };
}

/**
 * Update user beliefs
 */
export async function updateBeliefs(userId: string, data: UserBeliefs): Promise<UserBeliefs> {
  // Ensure profile exists
  const profile = await getProfile(userId);

  // Delete existing beliefs
  await prisma.userBelief.deleteMany({
    where: { profileId: profile.id },
  });

  // Create new beliefs
  if (data.beliefs.length > 0) {
    await prisma.userBelief.createMany({
      data: data.beliefs.map((belief) => ({
        profileId: profile.id,
        belief,
      })),
    });
  }

  logger.info({ userId, count: data.beliefs.length }, 'User beliefs updated');

  return { beliefs: data.beliefs };
}

/**
 * Get user interests
 */
export async function getInterests(userId: string): Promise<UserInterests> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: {
      interests: true,
    },
  });

  if (!profile) {
    // Create profile if it doesn't exist
    await getProfile(userId);
    return { interests: [] };
  }

  return {
    interests: profile.interests.map((i: { interest: string }) => i.interest),
  };
}

/**
 * Update user interests
 */
export async function updateInterests(
  userId: string,
  data: UserInterests
): Promise<UserInterests> {
  // Ensure profile exists
  const profile = await getProfile(userId);

  // Delete existing interests
  await prisma.userInterest.deleteMany({
    where: { profileId: profile.id },
  });

  // Create new interests
  if (data.interests.length > 0) {
    await prisma.userInterest.createMany({
      data: data.interests.map((interest) => ({
        profileId: profile.id,
        interest,
      })),
    });
  }

  logger.info({ userId, count: data.interests.length }, 'User interests updated');

  return { interests: data.interests };
}

