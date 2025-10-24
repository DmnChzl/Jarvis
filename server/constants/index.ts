import type { Agent } from '@server/models/agent';
import { BotIcon, CatIcon, ClapperBoardIcon } from '@server/templates/icons';
import { ED_PROMPT, JARVIS_PROMPT, MOCCA_PROMPT } from './prompt';

export const AGENTS: Agent[] = [
  {
    key: '3vjbtkiqor',
    shortName: 'Jarvis',
    fullName: 'J.A.R.V.I.S',
    imgSrc: '/jarvis.svg',
    title: "Hi! I'm Jarvis",
    subTitle: 'What can I do for you?',
    icon: BotIcon,
    hexColor: '#7c3aed',
    prompt: JARVIS_PROMPT
  },
  {
    key: 'v2j8ue61r8',
    shortName: 'Ed',
    fullName: 'Ed (Hariis Shareen)',
    imgSrc: '/ed.svg',
    title: "Hi! I'm Ed",
    subTitle: 'What can I do for you?',
    icon: ClapperBoardIcon,
    hexColor: '#4f46e5',
    prompt: ED_PROMPT
  },
  {
    key: 'pdv3io7i2p',
    shortName: 'Mocca',
    fullName: 'Mocca, Le Chat Relou',
    imgSrc: '/mocca.svg',
    title: 'Meeeooow',
    icon: CatIcon,
    hexColor: '#9333ea',
    prompt: MOCCA_PROMPT
  }
];
