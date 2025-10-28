import { z } from 'zod';

export const reparse = <T extends z.ZodType>(value: string, schema: T): z.infer<T> => {
  try {
    const data = JSON.parse(value);
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Validation Error');
    }
    throw new Error('Parsing Failure');
  }
};
