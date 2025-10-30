import { createError, defineEventHandler, getQuery } from 'h3';
import { findOneAgent } from '~repositories/agentsRepository';
import { findManyMessagesByAgent } from '~repositories/messagesRepository';
import { DefaultView } from '~templates/components/default-view';
import { MessageContainer } from '~templates/components/message-container';
import { RequestItem } from '~templates/components/request-item';
import { ResponseItem } from '~templates/components/response-item';
import { AgentIcon } from '~templates/icons/agent-icon';
import { mdToHtml } from '~utils/parser';

export default defineEventHandler(async (event) => {
  const query = getQuery<{ sessionId: string; agentKey: string }>(event);
  if (!query.sessionId || !query.agentKey) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' });
  }

  const currentAgent = await findOneAgent(query.agentKey);
  if (!currentAgent) {
    throw createError({ statusCode: 404, statusMessage: 'Agent Not Found' });
  }

  const defaultView = DefaultView({
    title: currentAgent.description,
    subTitle: currentAgent.longDescription ?? '',
    icon: AgentIcon({ agentKey: query.agentKey, width: 48, height: 48, strokeWidth: 1 })
  });

  const messages = await findManyMessagesByAgent(query.sessionId, query.agentKey);
  const items = await Promise.all(
    messages.map(async (msg) => {
      if (msg.role === 'assistant') {
        const html = await mdToHtml(msg.content);
        return ResponseItem({ content: html });
      }

      // msg.role === 'user'
      return RequestItem({ content: msg.content });
    })
  );

  return MessageContainer({
    sessionId: query.sessionId,
    messages: items,
    fallback: defaultView
  });
});
