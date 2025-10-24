export class IncrementalIdGenerator {
  private _initialValue: number;
  private _currentId: number;

  constructor(initialValue: number = 0) {
    this._initialValue = initialValue;
    this._currentId = initialValue;
  }

  public next(): number {
    this._currentId++;
    return this._currentId;
  }

  public peek(): number {
    return this._currentId;
  }

  public reset() {
    this._currentId = this._initialValue;
  }
}
