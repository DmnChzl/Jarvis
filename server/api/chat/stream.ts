import { RequestItem } from '@server/templates/components/request-item';
import { ResponseItem } from '@server/templates/components/response-item';
import { getRedisClient } from '@server/utils/redis-client';
import { htmlInline } from '@server/utils/render';
import { createError, createEventStream, defineEventHandler, getQuery, setResponseHeaders } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery<{ sessionId: string }>(event);
  if (!query.sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' });
  }

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });

  const stream = createEventStream(event);
  const channel = `chat:${query.sessionId}`;
  const [_, redisSubscriber] = getRedisClient();

  await redisSubscriber.subscribe(channel, (message) => {
    const action = JSON.parse(message) as { type: string; payload?: string };

    if (action.type === 'start') {
      // eslint-disable-next-line no-console
      console.log(`chat:${query.sessionId}`, 'Started');
    }

    if (action.type === 'request' && action.payload) {
      const listItem = RequestItem({ content: action.payload });
      stream.push(htmlInline`${listItem}`);
    }

    if (action.type === 'response' && action.payload) {
      const listItem = ResponseItem({ content: action.payload });
      stream.push(htmlInline`${listItem}`);
    }

    if (action.type === 'end') {
      // eslint-disable-next-line no-console
      console.log(`chat:${query.sessionId}`, 'Ended');
    }
  });

  return stream.send();
});
