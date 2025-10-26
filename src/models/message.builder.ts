import type { Message } from './message';

/**
 * @deprecated
 */
export class MessageBuilder {
  private _id: number;
  private _agentKey?: string;
  private _sessionId: string;
  private _role: 'assistant' | 'user';
  private _content: string;
  private _createdAt: string;

  constructor() {
    this._id = 0;
    this._sessionId = '';
    this._role = 'user';
    this._content = '';
    this._createdAt = new Date().toISOString();
  }

  withId(id: number) {
    this._id = id;
    return this;
  }

  withAgentKey(agentKey?: string) {
    this._agentKey = agentKey;
    return this;
  }

  withSessingId(sessionId: string) {
    this._sessionId = sessionId;
    return this;
  }

  withRole(role: 'user' | 'assistant') {
    this._role = role;
    return this;
  }

  withContent(content: string) {
    this._content = content;
    return this;
  }

  withCreatedAt(createdAt: string) {
    this._createdAt = createdAt;
    return this;
  }

  build(): Message {
    return {
      id: this._id,
      agentKey: this._agentKey,
      sessionId: this._sessionId,
      role: this._role,
      content: this._content,
      createdAt: this._createdAt
    };
  }
}
