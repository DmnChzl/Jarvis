import { AGENTS } from '@server/constants';
import EventEmitter from 'node:events';

export const msgEventEmitter = new EventEmitter();

export const getAllAgents = () => AGENTS;

export const getAgentByKey = (key: string) => {
  return AGENTS.find((a) => a.key === key) ?? null;
};
