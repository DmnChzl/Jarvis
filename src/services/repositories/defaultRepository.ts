import type { AgentEntity, MessageEntity } from '~src/database/schema';
import { MessageBuilder } from '~src/models/messageBuilder';

interface InMemoryDatabase {
  agents: AgentEntity[];
  messages: MessageEntity[];
}

const db: InMemoryDatabase = {
  agents: [],
  messages: []
};

export const addAgent = (agent: AgentEntity): AgentEntity => {
  db.agents.push(agent);
  return agent;
};

export const findOneAgent = (key: string): AgentEntity | null => {
  const agent = db.agents.find((a) => a.key === key);
  return agent ?? null;
};

export const findAllAgents = (): AgentEntity[] => db.agents;

let messageIndex = 0;

export const addMessage = ({
  agentKey,
  sessionId,
  role,
  content
}: {
  agentKey: string;
  sessionId: string;
  role: 'assistant' | 'user';
  content: string;
}): MessageEntity => {
  const message = new MessageBuilder()
    .withId(messageIndex)
    .withAgentKey(agentKey)
    .withSessingId(sessionId)
    .withRole(role)
    .withContent(content)
    .build();

  messageIndex++;
  db.messages.push(message);
  return message;
};

export const findAllMessages = (): MessageEntity[] => db.messages;

export const findOneMessage = (id: number): MessageEntity | null => {
  const message = db.messages.find((m) => m.id === id);
  return message ?? null;
};

export const findManyMessages = (sessionId: string): MessageEntity[] => {
  return db.messages.filter((m) => m.sessionId === sessionId);
};

export const findManyMessagesByAgent = (sessionId: string, agentKey: string): MessageEntity[] => {
  return db.messages.filter((m) => m.sessionId === sessionId && m.agentKey === agentKey);
};

export const delMessageById = (id: number) => {
  db.messages = db.messages.filter((m) => m.id !== id);
};

export const clearMessages = () => {
  db.messages = [];
};
