export interface Message {
  id: number;
  agentKey?: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
