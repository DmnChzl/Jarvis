import { AGENTS } from '@server/constants';
import { IncrementalIdGenerator } from '@server/models/incremental-id-generator';
import type { Message } from '@server/models/message';
import { MessageBuilder } from '@server/models/message.builder';
import EventEmitter from 'node:events';

export const msgEventEmitter = new EventEmitter();
const idGenerator = new IncrementalIdGenerator(-1);

interface InMemoryDB {
  messages: Message[];
}

const db: InMemoryDB = {
  messages: []
};

export const addMessage = (sessionId: string, content: string, role: 'assistant' | 'user' = 'user') => {
  const message = new MessageBuilder()
    .withId(idGenerator.next())
    .withSessingId(sessionId)
    .withContent(content)
    .withRole(role)
    .build();
  db.messages.push(message);
  return message;
};

export const findOneMessage = (id: number): Message | null => {
  return db.messages.find((m) => m.id === id) ?? null;
};

export const findAllMessages = (): Message[] => db.messages;

export const findManyMessages = (sessionId: string): Message[] => {
  return db.messages.filter((m) => m.sessionId === sessionId);
};

export const delMessageById = (id: number) => {
  db.messages = db.messages.filter((m) => m.id !== id);
};

export const clearMessages = () => {
  db.messages = [];
};

export const getAllAgents = () => AGENTS;

export const getAgentByKey = (key: string) => {
  return AGENTS.find((a) => a.key === key) ?? null;
};
