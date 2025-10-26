import { eq } from 'drizzle-orm';
import { db } from '~src/database';
import { agentsTable, type AgentEntity } from '~src/database/schema';

export const findOneAgent = async (key: string): Promise<AgentEntity> => {
  const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.key, key));
  return agent ?? null;
};

export const findAllAgents = async (): Promise<AgentEntity[]> => {
  return await db.select().from(agentsTable);
};
