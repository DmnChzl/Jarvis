import { createClient } from 'redis';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRedisClient, useRedisPublisher, useRedisSubscriber } from './redisClient';

vi.mock('redis');

describe('Redis Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useRedisClient', () => {
    it("should throw an error if the env var isn't set", () => {
      delete process.env.REDIS_URL;
      expect(() => useRedisClient()).toThrow('Redis URL Is Required!');
    });

    it('should return the same client instance on subsequent calls', () => {
      process.env.REDIS_URL = 'redis://localhost:6379';

      const mockClient = { get: vi.fn(), set: vi.fn() } as unknown as ReturnType<typeof createClient>;
      vi.mocked(createClient).mockReturnValueOnce(mockClient);

      const redisClient = useRedisClient();
      const anotherClient = useRedisClient();

      expect(redisClient).toBe(anotherClient);
      expect(createClient).toHaveBeenCalledTimes(1);
    });
  });

  describe('useRedisPublisher', () => {
    it("should throw an error if the env var isn't set", () => {
      delete process.env.REDIS_URL;
      expect(() => useRedisPublisher()).toThrow('Redis URL Is Required!');
    });

    it('should return the same publisher instance on subsequent calls', () => {
      process.env.REDIS_URL = 'redis://localhost:6379';

      const mockPublisher = { publish: vi.fn() } as unknown as ReturnType<typeof createClient>;
      vi.mocked(createClient).mockReturnValueOnce(mockPublisher);

      const redisPublisher = useRedisPublisher();
      const anotherPublisher = useRedisPublisher();

      expect(redisPublisher).toBe(anotherPublisher);
      expect(createClient).toHaveBeenCalledTimes(1);
    });
  });

  describe('useRedisSubscriber', () => {
    it("should throw an error if the env var isn't set", () => {
      delete process.env.REDIS_URL;
      expect(() => useRedisSubscriber()).toThrow('Redis URL Is Required!');
    });

    it('should return the same subscriber instance on subsequent calls', () => {
      process.env.REDIS_URL = 'redis://localhost:6379';

      const mockSubscriber = { subscribe: vi.fn() } as unknown as ReturnType<typeof createClient>;
      vi.mocked(createClient).mockReturnValueOnce(mockSubscriber);

      const redisSubscriber = useRedisSubscriber();
      const anotherSubscriber = useRedisSubscriber();

      expect(redisSubscriber).toBe(anotherSubscriber);
      expect(createClient).toHaveBeenCalledTimes(1);
    });
  });
});
