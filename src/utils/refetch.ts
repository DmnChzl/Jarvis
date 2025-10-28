import { z } from 'zod';
import { HttpError } from '~src/models/httpError';

export const refetch = async <T extends z.ZodType>(
  url: string,
  schema: T,
  options?: RequestInit
): Promise<z.infer<T>> => {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new HttpError(response.statusText, response.status);
  }

  const data = await response.json();
  return schema.parse(data);
};
