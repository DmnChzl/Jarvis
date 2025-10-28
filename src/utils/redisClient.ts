import { createClient } from 'redis';
import { z } from 'zod';
import { reparse } from './reparse';

let redisClient: ReturnType<typeof createClient> | null = null;
let redisPublisher: ReturnType<typeof createClient> | null = null;
let redisSubscriber: ReturnType<typeof createClient> | null = null;

export const useRedisClient = () => {
  if (!redisClient) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error('Redis URL Is Required!');
    }

    redisClient = createClient({ url });
  }

  return redisClient;
};

export const useRedisPublisher = () => {
  if (!redisPublisher) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error('Redis URL Is Required!');
    }

    redisPublisher = createClient({ url });
  }

  return redisPublisher;
};

export const useRedisSubscriber = () => {
  if (!redisSubscriber) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error('Redis URL Is Required!');
    }

    redisSubscriber = createClient({ url });
  }

  return redisSubscriber;
};

export const publishRedisMessage = <T>(channel: string, message: T) => {
  const publisher = useRedisPublisher();
  publisher.publish(channel, JSON.stringify(message));
};

export const subscribeToRedisChannel = <T extends z.ZodType>(
  channel: string,
  schema: T,
  callback: (message: z.infer<T>) => void
) => {
  const subscriber = useRedisSubscriber();

  return subscriber.subscribe(channel, (value) => {
    try {
      const message = reparse(value, schema);
      callback(message);
    } catch (error) {
      // eslint-disable-next-line
      console.error(error);
    }
  });
};
