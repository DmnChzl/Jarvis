import { RequestItem } from '@server/templates/components/request-item';
import { ResponseItem } from '@server/templates/components/response-item';
import { msgEventEmitter } from '@server/utils/db';
import { htmlInline } from '@server/utils/render';
import { createError, createEventStream, defineEventHandler, getQuery, setResponseHeaders } from 'h3';

export default defineEventHandler((event) => {
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

  const eventHandler = (action: { type: string; payload?: string }) => {
    if (action.type === 'start') {
      // eslint-disable-next-line no-console
      console.log(`chat:${query.sessionId}`, 'Started');
    }

    if (action.type === 'answer' && action.payload) {
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

    /*
    if (action.type === 'error') {
      stream.close();
      msgEventEmitter.removeListener(`chat:${query.sessionId}`, eventHandler);
    }
    */
  };

  const listenerCount = msgEventEmitter.listenerCount(`chat:${query.sessionId}`);
  if (listenerCount > 0) {
    msgEventEmitter.removeAllListeners(`chat:${query.sessionId}`);
  }

  msgEventEmitter.on(`chat:${query.sessionId}`, eventHandler);
  return stream.send();
});
