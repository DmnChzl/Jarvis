import type { Message } from './message';

export class MessageBuilder {
  private _id: number;
  private _sessionId: string;
  private _role: 'assistant' | 'user';
  private _content: string;
  private _timestamp: number;

  constructor() {
    this._id = 0;
    this._sessionId = '';
    this._role = 'user';
    this._content = '';
    this._timestamp = Date.now();
  }

  withId(id: number) {
    this._id = id;
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

  withTimestamp(timestamp: number) {
    this._timestamp = timestamp;
    return this;
  }

  build(): Message {
    return {
      id: this._id,
      sessionId: this._sessionId,
      role: this._role,
      content: this._content,
      timestamp: this._timestamp
    };
  }
}
