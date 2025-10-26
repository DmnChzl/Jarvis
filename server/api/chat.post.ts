import { getAgentByKey } from '@server/utils/db';
import { addMessage } from '@db/messagesRepository';
import { processAssistantResponse, processAssistantResponseFake } from '@server/workers/process-assistant';
import { createError, defineEventHandler, readBody, setResponseStatus } from 'h3';
import { getRedisClient } from '@server/utils/redis-client';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ msgContent: string; sessionId: string; agentKey: string }>(event);
  if (!body.msgContent || !body.sessionId || !body.agentKey) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' });
  }

  const currentAgent = getAgentByKey(body.agentKey);
  if (!currentAgent) {
    throw createError({ statusCode: 404, statusMessage: 'Agent Not Found' });
  }

  await addMessage(body.sessionId, body.msgContent);

  const [redisPublisher] = getRedisClient();
  redisPublisher.publish(`chat:${body.sessionId}`, JSON.stringify({ type: 'request', payload: body.msgContent }));

  processAssistantResponse(currentAgent, body.sessionId);
  // processAssistantResponseFake(currentAgent, body.sessionId);

  setResponseStatus(event, 201, 'Created');
  return;
});
