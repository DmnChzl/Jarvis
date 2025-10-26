import { eq } from 'drizzle-orm';
import { db } from '~src/database';
import { agentsTable, messagesTable, type AgentEntity, type MessageEntity } from '~src/database/schema';
import type { Message } from '~src/models/message';

export const addMessage = async ({
  agentKey,
  sessionId,
  role,
  content
}: Pick<Message, 'agentKey' | 'sessionId' | 'role' | 'content'>): Promise<MessageEntity> => {
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

interface MessageWithAgent {
  message: MessageEntity;
  agent: AgentEntity | null;
}

export const findManyMessagesWithAgent = async (sessionId: string): Promise<MessageWithAgent[]> => {
  return await db
    .select({
      message: messagesTable,
      agent: agentsTable
    })
    .from(messagesTable)
    .leftJoin(agentsTable, eq(messagesTable.agentKey, agentsTable.key))
    .where(eq(messagesTable.sessionId, sessionId))
    .orderBy(messagesTable.createdAt);
};

export const delMessageById = async (id: number) => {
  await db.delete(messagesTable).where(eq(messagesTable.id, id));
};

export const clearMessages = async () => {
  await db.delete(messagesTable);
};
