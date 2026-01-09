/**
 * Shared types for Serein Open Source
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  beliefs?: string[];
  interests?: string[];
}

export interface UserPreferences {
  userId: string;
  voiceGender?: 'male' | 'female';
  voiceId?: string;
  communicationMode?: 'text' | 'voice' | 'both';
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface AIResponse {
  message: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  metadata?: Record<string, unknown>;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  category: string;
  isbn?: string;
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  service: string;
  version?: string;
  details?: Record<string, unknown>;
}
