import { Introduction } from '@server/templates/components/introduction';
import { MessageContainer } from '@server/templates/components/message-container';
import { RequestItem } from '@server/templates/components/request-item';
import { ResponseItem } from '@server/templates/components/response-item';
import { getAgentByKey } from '@server/utils/db';
import { findManyMessages } from '@db/messagesRepository';
import { mdToHtml } from '@server/utils/parser';
import { createError, defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery<{ sessionId: string; agentKey: string }>(event);
  if (!query.sessionId || !query.agentKey) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' });
  }

  const currentAgent = getAgentByKey(query.agentKey);
  if (!currentAgent) {
    throw createError({ statusCode: 404, statusMessage: 'Agent Not Found' });
  }

  const agentIntroduction = Introduction({
    title: currentAgent.title,
    subTitle: currentAgent.subTitle,
    icon: currentAgent.icon({ width: 48, height: 48, strokeWidth: 1 })
  });

  const messages = await findManyMessages(query.sessionId);
  const items = await Promise.all(
    messages.map(async (message) => {
      if (message.role === 'assistant') {
        const html = await mdToHtml(message.content);
        return ResponseItem({ content: html });
      }

      // message.role === 'user'
      return RequestItem({ content: message.content });
    })
  );

  return MessageContainer({
    sessionId: query.sessionId,
    messages: items,
    fallback: agentIntroduction
  });
});
