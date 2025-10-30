import { and, eq } from 'drizzle-orm';
import { db } from '~src/database';
import { messagesTable, type MessageEntity } from '~src/database/schema';

interface Message {
  agentKey: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
}

export const addMessage = async ({ agentKey, sessionId, role, content }: Message): Promise<MessageEntity> => {
  const [message] = await db
    .insert(messagesTable)
    .values({ agentKey, sessionId, content, role, createdAt: new Date() })
    .returning();
  return message;
};

export const findOneMessage = async (id: number): Promise<MessageEntity> => {
  const [message] = await db.select().from(messagesTable).where(eq(messagesTable.id, id));
  return message ?? null;
};

export const findAllMessages = async (): Promise<MessageEntity[]> => {
  return await db.select().from(messagesTable);
};

export const findManyMessages = async (sessionId: string): Promise<MessageEntity[]> => {
  return await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId))
    .orderBy(messagesTable.createdAt);
};

export const findManyMessagesByAgent = async (sessionId: string, agentKey: string): Promise<MessageEntity[]> => {
  return await db
    .select()
    .from(messagesTable)
    .where(and(eq(messagesTable.sessionId, sessionId), eq(messagesTable.agentKey, agentKey)))
    .orderBy(messagesTable.createdAt);
};

export const delMessageById = async (id: number) => {
  await db.delete(messagesTable).where(eq(messagesTable.id, id));
};

export const clearMessages = async () => {
  await db.delete(messagesTable);
};
