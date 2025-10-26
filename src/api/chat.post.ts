import { createError, defineEventHandler, readBody, setResponseStatus } from 'h3';
import { findOneAgent } from '~repositories/agentsRepository';
import { addMessage } from '~repositories/messagesRepository';
import { runAgentStream } from '~src/services/stream/streamService';
import { publishRedisMessage } from '~utils/redisClient';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ msgContent: string; sessionId: string; agentKey: string }>(event);
  if (!body.msgContent || !body.sessionId || !body.agentKey) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' });
  }

  const currentAgent = await findOneAgent(body.agentKey);
  if (!currentAgent) {
    throw createError({ statusCode: 404, statusMessage: 'Agent Not Found' });
  }

  await addMessage({
    sessionId: body.sessionId,
    content: body.msgContent,
    role: 'user'
  });

  publishRedisMessage(`chat:${body.sessionId}`, {
    type: 'request',
    content: body.msgContent
  });

  runAgentStream(body.agentKey, body.sessionId);
  setResponseStatus(event, 201, 'Created');
  return;
});
