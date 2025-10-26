import { timestamp, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const messagesTable = pgTable('messages', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 36 }).notNull(),
  role: varchar('role', { enum: ['assistant', 'user'] }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull()
});

export type MessageEntity = typeof messagesTable.$inferInsert;
