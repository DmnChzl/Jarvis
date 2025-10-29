import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAiProvider } from './aiProvider';

vi.mock('@ai-sdk/google');

describe('useAiProvider', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("should throw an error if the env var isn't set", () => {
    delete process.env.AI_API_KEY;
    expect(() => useAiProvider()).toThrow('AI API Key Is Required!');
  });

  it('should return the same provider instance on subsequent calls', () => {
    process.env.AI_API_KEY = 'ai-api-key';

    const mockProvider = { model: 'gemini' } as unknown as ReturnType<typeof createGoogleGenerativeAI>;
    vi.mocked(createGoogleGenerativeAI).mockReturnValueOnce(mockProvider);

    const aiProvider = useAiProvider();
    const anotherProvider = useAiProvider();

    expect(aiProvider).toBe(anotherProvider);
    expect(createGoogleGenerativeAI).toHaveBeenCalledTimes(1);
  });
});
