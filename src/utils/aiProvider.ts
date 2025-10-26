import { createGoogleGenerativeAI } from '@ai-sdk/google';

let aiProvider: ReturnType<typeof createGoogleGenerativeAI> | null = null;

export const useAiProvider = () => {
  if (!aiProvider) {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      throw new Error('API Key Is Required!');
    }

    aiProvider = createGoogleGenerativeAI({
      apiKey
    });
  }

  return aiProvider;
};
