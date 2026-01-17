import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '@serein/shared/utils/errors';
import { createLogger } from '@serein/shared/utils/logger';
import { CreateConversationRequest, CreateMessageRequest, PaginationQuery } from '../types';

const logger = createLogger('conversation-service');
const prisma = new PrismaClient();

async function requireConversation(userId: string, conversationId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  if (!conversation) {
    throw new NotFoundError('Conversation', conversationId);
  }

  return conversation;
}

export async function createConversation(userId: string, data: CreateConversationRequest) {
  const conversation = await prisma.conversation.create({
    data: {
      userId,
      title: data.title,
    },
  });

  logger.info({ userId, conversationId: conversation.id }, 'Conversation created');

  return conversation;
}

/**
 * Provision a default conversation for new users (idempotent).
 */
export async function provisionUserConversations(userId: string): Promise<void> {
  const existing = await prisma.conversation.findFirst({
    where: { userId },
  });

  if (existing) {
    return;
  }

  const conversation = await prisma.conversation.create({
    data: {
      userId,
      title: 'Welcome',
    },
  });

  logger.info({ userId, conversationId: conversation.id }, 'Provisioned welcome conversation');
}

export async function listConversations(userId: string, query: PaginationQuery) {
  const limit = query.limit ?? 20;
  const offset = query.offset ?? 0;

  return prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

export async function getConversation(userId: string, conversationId: string) {
  return requireConversation(userId, conversationId);
}

export async function deleteConversation(userId: string, conversationId: string) {
  const conversation = await requireConversation(userId, conversationId);

  await prisma.conversation.delete({
    where: { id: conversation.id },
  });

  logger.info({ userId, conversationId }, 'Conversation deleted');
}

export async function createMessage(
  userId: string,
  conversationId: string,
  data: CreateMessageRequest
) {
  await requireConversation(userId, conversationId);

  const message = await prisma.message.create({
    data: {
      conversationId,
      role: data.role,
      content: data.content,
    },
  });

  logger.info({ userId, conversationId, messageId: message.id }, 'Message created');

  return message;
}

export async function listMessages(
  userId: string,
  conversationId: string,
  query: PaginationQuery
) {
  await requireConversation(userId, conversationId);

  const limit = query.limit ?? 50;
  const offset = query.offset ?? 0;

  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: limit,
    skip: offset,
  });
}

export async function listRecentMessages(
  userId: string,
  conversationId: string,
  limit: number = 20
) {
  await requireConversation(userId, conversationId);

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return messages.reverse();
}