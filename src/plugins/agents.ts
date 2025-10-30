import { eq } from 'drizzle-orm';
import { ED_PROMPT, JARVIS_PROMPT, MOKA_PROMPT } from '~src/constants/prompt';
import { db } from '~src/database';
import { agentsTable, type AgentEntity } from '~src/database/schema';

const edAgentValues: AgentEntity = {
  key: '3d',
  shortName: 'Ed',
  fullName: 'Ed (Hariis/Shareen)',
  imgSrc: '/ed.svg',
  description: "Hi! I'm Ed",
  longDescription: 'What can I do for you?',
  persona: ED_PROMPT,
  themeColor: '#2563eb'
};

const jarvisAgentValues: AgentEntity = {
  key: 'j4rv1s',
  shortName: 'Jarvis',
  fullName: 'J.A.R.V.I.S',
  imgSrc: '/jarvis.svg',
  description: "Hi! I'm Jarvis",
  longDescription: 'What can I do for you?',
  persona: JARVIS_PROMPT,
  themeColor: '#7c3aed'
};

const mokaAgentValues: AgentEntity = {
  key: 'm0k4',
  shortName: 'Moka',
  fullName: 'Moka, Le Chat Relou',
  imgSrc: '/moka.svg',
  description: 'Meow',
  longDescription: 'Meeeeeeooow!',
  persona: MOKA_PROMPT,
  themeColor: '#c026d3'
};

export default async () => {
  console.log('Agents Loading...');
  const startTime = new Date().getTime();

  const [edAgent] = await db.select().from(agentsTable).where(eq(agentsTable.key, '3d'));
  if (!edAgent) {
    await db.insert(agentsTable).values(edAgentValues);
  }

  const [jarvisAgent] = await db.select().from(agentsTable).where(eq(agentsTable.key, 'j4rv1s'));
  if (!jarvisAgent) {
    await db.insert(agentsTable).values(jarvisAgentValues);
  }

  const [mokaAgent] = await db.select().from(agentsTable).where(eq(agentsTable.key, 'm0k4'));
  if (!mokaAgent) {
    await db.insert(agentsTable).values(mokaAgentValues);
  }

  const endTime = new Date().getTime();
  const secondDiffing = ((endTime - startTime) / 3600).toFixed(2);
  console.log(`Agents Loaded In ${secondDiffing}s`);
};
