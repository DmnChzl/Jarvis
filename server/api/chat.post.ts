import { addMessage, getAgentByKey, msgEventEmitter } from '@server/utils/db';
import { processAssistantResponse, processAssistantResponseFake } from '@server/workers/process-assistant';
import { createError, defineEventHandler, readBody, setResponseStatus } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ msgContent: string; sessionId: string; agentKey: string }>(event);
  if (!body.msgContent || !body.sessionId || !body.agentKey) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' });
  }

  const currentAgent = getAgentByKey(body.agentKey);
  if (!currentAgent) {
    throw createError({ statusCode: 404, statusMessage: 'Agent Not Found' });
  }

  addMessage(body.sessionId, body.msgContent);
  msgEventEmitter.emit(`chat:${body.sessionId}`, { type: 'answer', payload: body.msgContent });

  processAssistantResponse(currentAgent, body.sessionId);
  // processAssistantResponseFake(currentAgent, body.sessionId);

  setResponseStatus(event, 201, 'Created');
  return;
});
