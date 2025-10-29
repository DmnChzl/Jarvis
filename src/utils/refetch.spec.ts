import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { HttpError } from '~src/models/httpError';
import { refetch } from './refetch';

describe('refetch', () => {
  const schema = z.object({
    access_token: z.string(),
    expires_in: z.number()
  });

  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('should return parsed data with a valid schema', async () => {
    const mockData = {
      access_token: 'eyJiZWFyZXIiOiJ0b2tlbiJ9',
      expires_in: 300
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockData)
    });

    const result = await refetch('http://localhost:8080', schema);
    expect(result).toEqual(mockData);
  });

  it("should throw an error if response isn't ok", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await expect(refetch('http://localhost:8080', schema)).rejects.toThrow(HttpError);
  });

  it('should pass request options to fetch', async () => {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        access_token: 'eyJiZWFyZXIiOiJ0b2tlbiJ9',
        expires_in: 300
      })
    });

    await refetch('http://localhost:8080', schema, options);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080', options);
  });

  it("should throw an error if data doesn't match the schema", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        like_count: 55,
        comment_count: 13
      })
    });

    await expect(refetch('https://api.example.com/data', schema)).rejects.toThrow(z.ZodError);
  });
});
