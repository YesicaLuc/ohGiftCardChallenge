import { z } from 'zod';

export const validateSchema = (schema: z.ZodType, body: unknown) => {
  const result = schema.safeParse(body);
  expect(result.success, result.success ? 'schema válido' : z.prettifyError(result.error)).to.eq(
    true,
  );
};
