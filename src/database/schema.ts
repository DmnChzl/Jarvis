import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const agentsTable = pgTable('agents', {
  key: varchar('key').primaryKey(),
  shortName: varchar('short_name', { length: 64 }).notNull(),
  fullName: varchar('full_name', { length: 128 }),
  imgSrc: varchar('img_src').notNull(),
  description: varchar('description', { length: 128 }).notNull(),
  longDescription: varchar('long_description', { length: 256 }),
  persona: text('persona').notNull(),
  themeColor: varchar('theme_color').notNull()
});

export type AgentEntity = typeof agentsTable.$inferSelect;

export const messagesTable = pgTable('messages', {
  id: serial('id').primaryKey(),
  agentKey: varchar('agent_key')
    .notNull()
    .references(() => agentsTable.key),
  sessionId: varchar('session_id', { length: 36 }).notNull(),
  role: varchar('role', { enum: ['assistant', 'user'] }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull()
});

export type MessageEntity = typeof messagesTable.$inferSelect;
