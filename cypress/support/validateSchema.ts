import { z } from 'zod';

// Falla el test con un mensaje legible si el body no cumple el schema.
// Devuelve el body tipado para usarlo en las assertions siguientes.
export const validateSchema = <T extends z.ZodType>(schema: T, body: unknown): z.infer<T> => {
  const result = schema.safeParse(body);
  expect(result.success, result.success ? 'schema válido' : z.prettifyError(result.error)).to.eq(
    true,
  );
  return result.data as z.infer<T>;
};
