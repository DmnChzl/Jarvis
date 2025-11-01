import EventEmitter from 'node:events';
import { z } from 'zod';
import { publishRedisMessage, subscribeToRedisChannel } from '~utils/redisClient';
import { reparse } from '~utils/reparse';

export const eventBroker = new EventEmitter();

export const publishEventMessage = <T>(channel: string, message: T) => {
  try {
    publishRedisMessage(channel, message);
  } catch {
    console.log('Unable to use Redis as an event broker; using Node events by default...');
    eventBroker.emit(channel, JSON.stringify(message));
  }
};

export const subscribeToEventChannel = <T extends z.ZodType>(
  channel: string,
  schema: T,
  callback: (message: z.infer<T>) => void
) => {
  try {
    return subscribeToRedisChannel(channel, schema, callback);
  } catch {
    console.log('Unable to use Redis as an event broker; using Node events by default...');
    return eventBroker.on(channel, (value) => {
      const message = reparse(value, schema);
      callback(message);
    });
  }
};
