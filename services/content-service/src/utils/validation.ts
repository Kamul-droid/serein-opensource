import { z } from 'zod';
import { ValidationError } from '@serein/shared/utils/errors';

const numberFromString = (value: unknown) => {
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
};

/**
 * Validation schemas using Zod
 */
export const bookIdSchema = z.object({
  id: z.string().min(1),
});

export const paginationSchema = z.object({
  limit: z.preprocess(numberFromString, z.number().int().min(1).max(100).optional()),
  offset: z.preprocess(numberFromString, z.number().int().min(0).optional()),
});

export const searchSchema = z.object({
  query: z.string().min(1),
  limit: z.preprocess(numberFromString, z.number().int().min(1).max(100).optional()),
});

export const recommendationsSchema = z.object({
  beliefs: z.array(z.string().min(1)).min(1),
  limit: z.preprocess(numberFromString, z.number().int().min(1).max(100).optional()),
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
