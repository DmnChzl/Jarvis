import type { AgentEntity } from '~src/database/schema';

export class AgentBuilder {
  private _key: string;
  private _shortName: string;
  private _fullName: string;
  private _imgSrc: string;
  private _description: string;
  private _longDescription: string;
  private _persona: string;
  private _themeColor: string;

  constructor() {
    this._key = '';
    this._shortName = '';
    this._fullName = '';
    this._imgSrc = '';
    this._description = '';
    this._longDescription = '';
    this._persona = '';
    this._themeColor = '';
  }

  withKey(key: string) {
    this._key = key;
    return this;
  }

  withShortName(shortName: string) {
    this._shortName = shortName;
    return this;
  }

  withFullName(fullName: string) {
    this._fullName = fullName;
    return this;
  }

  withImgSrc(imgSrc: string) {
    this._imgSrc = imgSrc;
    return this;
  }

  withDescription(description: string) {
    this._description = description;
    return this;
  }

  withLongDescription(longDescription: string) {
    this._longDescription = longDescription;
    return this;
  }

  withPersona(persona: string) {
    this._persona = persona;
    return this;
  }

  withThemeColor(themeColor: string) {
    this._themeColor = themeColor;
    return this;
  }

  build(): AgentEntity {
    return {
      key: this._key,
      shortName: this._shortName,
      fullName: this._fullName,
      imgSrc: this._imgSrc,
      description: this._description,
      longDescription: this._longDescription,
      persona: this._persona,
      themeColor: this._themeColor
    };
  }
}
