import { and, eq } from 'drizzle-orm';
import { db } from '~src/database';
import { messagesTable, type MessageEntity } from '~src/database/schema';
import {
  addMessage as addMessageInMemory,
  clearMessages as clearMessagesInMemory,
  delMessageById as delMessageByIdInMemory,
  findAllMessages as findAllMessagesInMemory,
  findManyMessagesByAgent as findManyMessagesByAgentInMemory,
  findManyMessages as findManyMessagesInMemory,
  findOneMessage as findOneMessageInMemory
} from './defaultRepository';

interface MessageInput {
  agentKey: string;
  sessionId: string;
  role: 'assistant' | 'user';
  content: string;
}

export const addMessage = async ({ agentKey, sessionId, role, content }: MessageInput): Promise<MessageEntity> => {
  try {
    const [entity] = await db
      .insert(messagesTable)
      .values({ agentKey, sessionId, content, role, createdAt: new Date() })
      .returning();
    return entity;
  } catch {
    console.log('Unable to persist data; using an in-memory database by default...');
    return addMessageInMemory({ agentKey, sessionId, role, content });
  }
};

export const findOneMessage = async (id: number): Promise<MessageEntity | null> => {
  try {
    const [entity] = await db.select().from(messagesTable).where(eq(messagesTable.id, id));
    return entity ?? null;
  } catch {
    console.log('Unable to persist data; using an in-memory database by default...');
    return findOneMessageInMemory(id);
  }
};

export const findAllMessages = async (): Promise<MessageEntity[]> => {
  try {
    return await db.select().from(messagesTable);
  } catch {
    console.log('Unable to persist data; using an in-memory database by default...');
    return findAllMessagesInMemory();
  }
};

export const findManyMessages = async (sessionId: string): Promise<MessageEntity[]> => {
  try {
    return await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.sessionId, sessionId))
      .orderBy(messagesTable.createdAt);
  } catch {
    console.log('Unable to persist data; using an in-memory database by default...');
    return findManyMessagesInMemory(sessionId);
  }
};

export const findManyMessagesByAgent = async (sessionId: string, agentKey: string): Promise<MessageEntity[]> => {
  try {
    return await db
      .select()
      .from(messagesTable)
      .where(and(eq(messagesTable.sessionId, sessionId), eq(messagesTable.agentKey, agentKey)))
      .orderBy(messagesTable.createdAt);
  } catch {
    console.log('Unable to persist data; using an in-memory database by default...');
    return findManyMessagesByAgentInMemory(sessionId, agentKey);
  }
};

export const delMessageById = async (id: number) => {
  try {
    await db.delete(messagesTable).where(eq(messagesTable.id, id));
  } catch {
    console.log('Unable to persist data; using an in-memory database by default...');
    delMessageByIdInMemory(id);
  }
};

export const clearMessages = async () => {
  try {
    await db.delete(messagesTable);
  } catch {
    console.log('Unable to persist data; using an in-memory database by default...');
    clearMessagesInMemory();
  }
};
