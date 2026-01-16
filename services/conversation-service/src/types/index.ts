/**
 * Types for Conversation Service
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface CreateConversationRequest {
  title?: string;
}

export interface CreateMessageRequest {
  role: MessageRole;
  content: string;
}

export interface PaginationQuery {
  limit?: number;
  offset?: number;
}
