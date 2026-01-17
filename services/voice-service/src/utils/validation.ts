import { z } from 'zod';
import { ValidationError } from '@serein/shared/utils/errors';

/**
 * Validation schemas using Zod
 */
export const synthesizeSchema = z.object({
  text: z.string().min(1),
  voiceId: z.string().min(1).optional(),
  speed: z.number().min(0.5).max(2).optional(),
});

export const transcribeSchema = z.object({
  audioBase64: z.string().min(1),
  filename: z.string().min(1).optional(),
  contentType: z.string().min(1).optional(),
  language: z.string().min(1).optional(),
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
