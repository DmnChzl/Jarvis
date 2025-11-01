import type { MessageEntity } from '~src/database/schema';

export class MessageBuilder {
  private _id: number;
  private _agentKey: string;
  private _sessionId: string;
  private _role: 'assistant' | 'user';
  private _content: string;
  private _createdAt: Date;

  constructor() {
    this._id = 0;
    this._agentKey = '';
    this._sessionId = '';
    this._role = 'user';
    this._content = '';
    this._createdAt = new Date();
  }

  withId(id: number) {
    this._id = id;
    return this;
  }

  withAgentKey(agentKey: string) {
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

  withCreatedAt(createdAt: Date) {
    this._createdAt = createdAt;
    return this;
  }

  build(): MessageEntity {
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
