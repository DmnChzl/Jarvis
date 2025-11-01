import { addAgent } from '~repositories/agentsRepository';
import { ED_PROMPT, JARVIS_PROMPT, MOKA_PROMPT } from '~src/constants/prompt';
import { AgentBuilder } from '~src/models/agentBuilder';

const edAgent = new AgentBuilder()
  .withKey('3d')
  .withShortName('Ed')
  .withFullName('Ed (Hariis/Shareen)')
  .withImgSrc('/ed.svg')
  .withDescription("Hi! I'm Ed")
  .withLongDescription('What can I do for you?')
  .withPersona(ED_PROMPT)
  .withThemeColor('#2563eb')
  .build();

const jarvisAgent = new AgentBuilder()
  .withKey('j4rv1s')
  .withShortName('Jarvis')
  .withFullName('J.A.R.V.I.S')
  .withImgSrc('/jarvis.svg')
  .withDescription("Hi! I'm Jarvis")
  .withLongDescription('What can I do for you?')
  .withPersona(JARVIS_PROMPT)
  .withThemeColor('#7c3aed')
  .build();

const mokaAgent = new AgentBuilder()
  .withKey('m0k4')
  .withShortName('Moka')
  .withFullName('Moka, Le Chat Relou')
  .withImgSrc('/moka.svg')
  .withDescription('Meow')
  .withLongDescription('Meeeeeeooow')
  .withPersona(MOKA_PROMPT)
  .withThemeColor('#c026d3')
  .build();

export default async () => {
  console.log('Agents Loading...');
  const startTime = new Date().getTime();
  addAgent(edAgent);
  addAgent(jarvisAgent);
  addAgent(mokaAgent);
  const endTime = new Date().getTime();
  const secondDiffing = ((endTime - startTime) / 3600).toFixed(2);
  console.log(`Agents Loaded In ${secondDiffing}s`);
};
