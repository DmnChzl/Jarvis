import { createGoogleGenerativeAI } from '@ai-sdk/google';

export class GoogleGenerativeAI {
  private static _instance: GoogleGenerativeAI;
  private _provider: ReturnType<typeof createGoogleGenerativeAI> | null = null;

  private constructor() {}

  public static getInstance(): GoogleGenerativeAI {
    if (!GoogleGenerativeAI._instance) {
      GoogleGenerativeAI._instance = new GoogleGenerativeAI();
    }
    return GoogleGenerativeAI._instance;
  }

  public getProvider() {
    if (!this._provider) {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('API Key Is Required!');
      }

      this._provider = createGoogleGenerativeAI({
        apiKey
      });
    }

    return this._provider;
  }
}
