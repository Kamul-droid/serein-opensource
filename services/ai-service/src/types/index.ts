/**
 * Types for AI Service
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface UserContext {
  beliefs?: string[];
  interests?: string[];
}

export interface ChatRequest {
  messages: ChatMessage[];
  conversationId?: string;
  model?: string;
  temperature?: number;
  userContext?: UserContext;
}

export interface ModelInfo {
  name: string;
  size?: number;
  modifiedAt?: string;
  digest?: string;
}

export type StreamResult =
  | {
      type: 'blocked';
      response: {
        message: string;
        model: string;
        metadata?: Record<string, unknown>;
      };
    }
  | {
      type: 'stream';
      model: string;
      stream: AsyncIterable<Uint8Array>;
    };
