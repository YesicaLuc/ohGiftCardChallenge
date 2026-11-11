import { z } from 'zod';

const categorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

const tagSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export const petSchema = z.object({
  id: z.number().int(),
  category: categorySchema.optional(),
  name: z.string(),
  photoUrls: z.array(z.string()),
  tags: z.array(tagSchema).optional(),
  status: z.enum(['available', 'pending', 'sold']).optional(),
});

export const apiResponseSchema = z.object({
  code: z.number().int(),
  type: z.string(),
  message: z.string(),
});
