import { createClient } from 'redis';
import { z } from 'zod';

let redisClient: ReturnType<typeof createClient> | null = null;
let redisPublisher: ReturnType<typeof createClient> | null = null;
let redisSubscriber: ReturnType<typeof createClient> | null = null;

export const useRedisGetSet = () => {
  if (!redisClient) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error('URL Is Required!');
    }

    redisClient = createClient({ url });
  }

  return redisClient;
};

export const useRedisPubSub = () => {
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

const responseMessageSchema = z.object({
  type: z.literal('response'),
  content: z.string(),
  metadata: z.object({ themeColor: z.string() })
});

const redisMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('start'),
    metadata: z.object({ agentName: z.string() })
  }),
  z.object({
    type: z.literal('request'),
    content: z.string()
  }),
  responseMessageSchema,
  z.object({
    type: z.literal('end'),
    metadata: z.object({ agentName: z.string() })
  }),
  z.object({
    type: z.literal('error'),
    reason: z.string()
  })
]);

export type RedisMessage = z.infer<typeof redisMessageSchema>;

export const parseRedisMessage = (message: string): RedisMessage => {
  try {
    const json = JSON.parse(message);
    return redisMessageSchema.parse(json);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid Redis Message');
    }
    throw new Error('Parsing Redis Message Failure');
  }
};

export const stringifyRedisMessage = (message: RedisMessage): string => {
  return JSON.stringify(message);
};

export const publishRedisMessage = (channel: string, message: RedisMessage) => {
  const [publisher] = useRedisPubSub();
  publisher.publish(channel, stringifyRedisMessage(message));
};

export const subscribeToRedisChannel = (
  channel: string,
  handlers: {
    onStart?: (metadata: { agentName: string }) => void;
    onRequest?: (content: string) => void;
    onResponse?: (content: string, metadata: { themeColor: string }) => void;
    onEnd?: (metadata: { agentName: string }) => void;
    onError?: (error: Error) => void;
  }
) => {
  const [_, subscriber] = useRedisPubSub();

  return subscriber.subscribe(channel, (value) => {
    const message = parseRedisMessage(value);

    switch (message.type) {
      case 'start':
        if (typeof handlers.onStart === 'function') {
          handlers.onStart(message.metadata);
        }
        break;

      case 'request':
        if (typeof handlers.onRequest === 'function') {
          handlers.onRequest(message.content);
        }
        break;

      case 'response':
        if (typeof handlers.onResponse === 'function') {
          handlers.onResponse(message.content, message.metadata);
        }
        break;

      case 'end':
        if (typeof handlers.onEnd === 'function') {
          handlers.onEnd(message.metadata);
        }
        break;

      case 'error':
        if (typeof handlers.onError === 'function') {
          handlers.onError(new Error(message.reason));
        }
        break;
    }
  });
};
