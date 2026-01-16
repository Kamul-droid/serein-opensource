import { z } from 'zod';
import { ValidationError } from '@serein/shared/utils/errors';

/**
 * Validation schemas using Zod
 */
export const updateProfileSchema = z.object({
  name: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().optional(),
});

export const updatePreferencesSchema = z.object({
  voiceGender: z.enum(['male', 'female']).optional(),
  voiceId: z.string().optional(),
  communicationMode: z.enum(['text', 'voice', 'both']).optional(),
});

export const updateBeliefsSchema = z.object({
  beliefs: z.array(z.string()).min(0),
});

export const updateInterestsSchema = z.object({
  interests: z.array(z.string()).min(0),
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
