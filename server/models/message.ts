export interface Message {
  id: number;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
