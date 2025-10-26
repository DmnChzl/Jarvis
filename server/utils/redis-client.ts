import { createClient } from 'redis';

let redisPublisher: ReturnType<typeof createClient> | null = null;
let redisSubscriber: ReturnType<typeof createClient> | null = null;

export const getRedisClient = () => {
  if (!redisPublisher || !redisSubscriber) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error('URL Is Required!');
    }

    redisPublisher = createClient({ url });
    redisSubscriber = createClient({ url });
  }

  return [redisPublisher, redisSubscriber];
};
