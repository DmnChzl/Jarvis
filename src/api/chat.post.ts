import { createError, defineEventHandler, getHeaders, readBody, setResponseStatus } from 'h3';
import { findOneAgent } from '~repositories/agentsRepository';
import { addMessage } from '~repositories/messagesRepository';
import { processAgentResponse } from '~src/services/ai/agentService';
import { publishEventMessage } from '~src/services/events/eventService';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ msgContent: string; sessionId: string; agentKey: string }>(event);
  if (!body.msgContent || !body.sessionId || !body.agentKey) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' });
  }

  const currentAgent = await findOneAgent(body.agentKey);
  if (!currentAgent) {
    throw createError({ statusCode: 404, statusMessage: 'Agent Not Found' });
  }

  const headers = getHeaders(event);
  const clientLocale = headers['x-client-locale'];
  const clientTimeZone = headers['x-client-timezone'];

  const userMessage = await addMessage({
    agentKey: body.agentKey,
    sessionId: body.sessionId,
    content: body.msgContent,
    role: 'user'
  });

  publishEventMessage(`chat:${body.sessionId}`, {
    type: 'request',
    content: body.msgContent
  });

  processAgentResponse({
    userMessage,
    agentKey: body.agentKey,
    sessionId: body.sessionId,
    userLocale: clientLocale,
    userTimeZone: clientTimeZone
  });

  setResponseStatus(event, 201, 'Created');
  return;
});
