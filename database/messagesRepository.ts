import { messagesTable } from './schema';
import { eq } from 'drizzle-orm';
import { db } from './index';

export const addMessage = async (sessionId: string, content: string, role: 'assistant' | 'user' = 'user') => {
  const [message] = await db
    .insert(messagesTable)
    .values({ sessionId, content, role, createdAt: new Date() })
    .returning();
  return message;
};

export const findOneMessage = async (id: number) => {
  const [message] = await db.select().from(messagesTable).where(eq(messagesTable.id, id));
  return message ?? null;
};

export const findAllMessages = async () => {
  return await db.select().from(messagesTable);
};

export const findManyMessages = async (sessionId: string) => {
  return await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId))
    .orderBy(messagesTable.createdAt);
};

export const delMessageById = async (id: number) => {
  await db.delete(messagesTable).where(eq(messagesTable.id, id));
};

export const clearMessages = async () => {
  await db.delete(messagesTable);
};
