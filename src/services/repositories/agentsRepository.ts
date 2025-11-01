import { eq } from 'drizzle-orm';
import { db } from '~src/database';
import { agentsTable, type AgentEntity } from '~src/database/schema';
import {
  addAgent as addAgentInMemory,
  findAllAgents as findAllAgentsInMemory,
  findOneAgent as findOneAgentInMemory
} from './defaultRepository';

export const addAgent = async (agent: AgentEntity): Promise<AgentEntity> => {
  try {
    const [entity] = await db.insert(agentsTable).values(agent).returning();
    return entity;
  } catch {
    console.log('Unable to persist data; using an in-memory database by default...');
    return addAgentInMemory(agent);
  }
};

export const findOneAgent = async (key: string): Promise<AgentEntity | null> => {
  try {
    const [entity] = await db.select().from(agentsTable).where(eq(agentsTable.key, key));
    return entity ?? null;
  } catch {
    console.log('Unable to persist data; using an in-memory database by default...');
    return findOneAgentInMemory(key);
  }
};

export const findAllAgents = async (): Promise<AgentEntity[]> => {
  try {
    return await db.select().from(agentsTable);
  } catch {
    console.log('Unable to persist data; using an in-memory database by default...');
    return findAllAgentsInMemory();
  }
};
