import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const messagesTable = sqliteTable('messages', {
  id: int().primaryKey({ autoIncrement: true }),
  sessionId: text().notNull(),
  role: text({ enum: ['assistant', 'user'] }).notNull(),
  content: text().notNull(),
  timestamp: int().notNull()
});

export type MessageEntity = typeof messagesTable.$inferInsert;
