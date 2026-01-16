/**
 * Types for User Service
 */

export interface UserProfile {
  id: string;
  userId: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  beliefs?: string[];
  interests?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileRequest {
  name?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  voiceGender?: 'male' | 'female';
  voiceId?: string;
  communicationMode?: 'text' | 'voice' | 'both';
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdatePreferencesRequest {
  voiceGender?: 'male' | 'female';
  voiceId?: string;
  communicationMode?: 'text' | 'voice' | 'both';
}

export interface UserBeliefs {
  beliefs: string[];
}

export interface UserInterests {
  interests: string[];
}
