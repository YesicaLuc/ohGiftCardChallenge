import { z } from 'zod';

const categorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

const tagSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export const petStatusSchema = z.enum(['available', 'pending', 'sold']);

export const petSchema = z.object({
  id: z.number().int(),
  category: categorySchema.optional(),
  name: z.string(),
  photoUrls: z.array(z.string()),
  tags: z.array(tagSchema).optional(),
  status: petStatusSchema.optional(),
});

export const apiResponseSchema = z.object({
  code: z.number().int(),
  type: z.string(),
  message: z.string(),
});

// Los tipos se derivan de los schemas: el contrato es la única fuente de verdad.
export type Pet = z.infer<typeof petSchema>;
export type PetStatus = z.infer<typeof petStatusSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
