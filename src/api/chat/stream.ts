import { createError, createEventStream, defineEventHandler, getQuery, setResponseHeaders } from 'h3';
import { RequestItem } from '~templates/components/request-item';
import { ResponseItem } from '~templates/components/response-item';
import { subscribeToRedisChannel } from '~utils/redisClient';
import { htmlInline } from '~utils/render';

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

  await subscribeToRedisChannel(channel, {
    onStart: ({ agentName }) => {
      // eslint-disable-next-line no-console
      console.log(channel, `${agentName} Has Started To Respond`);
    },
    onRequest: (content) => {
      const listItem = RequestItem({ content });
      stream.push(htmlInline`${listItem}`);
    },
    onResponse: (content, { themeColor }) => {
      const listItem = ResponseItem({ content, bgColor: themeColor });
      stream.push(htmlInline`${listItem}`);
    },
    onEnd: ({ agentName }) => {
      // eslint-disable-next-line no-console
      console.log(channel, `${agentName} Has Finished To Respond`);
    }
  });

  return stream.send();
});
