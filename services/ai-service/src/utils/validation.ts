import { z } from 'zod';
import { ValidationError } from '@serein/shared/utils/errors';

/**
 * Validation schemas using Zod
 */
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
});

export const userContextSchema = z.object({
  beliefs: z.array(z.string().min(1)).optional(),
  interests: z.array(z.string().min(1)).optional(),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  conversationId: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  temperature: z.number().min(0).max(2).optional(),
  userContext: userContextSchema.optional(),
});

/**
 * Validate data against a schema
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Validation failed', {
        errors: error.errors,
      });
    }
    throw error;
  }
}
