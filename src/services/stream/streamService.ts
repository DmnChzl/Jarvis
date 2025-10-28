import { streamText, type LanguageModel, type Prompt, type Tool } from 'ai';
import { findOneAgent } from '~repositories/agentsRepository';
import { addMessage, findManyMessages } from '~repositories/messagesRepository';
import { GENERIC_PROMPT } from '~src/constants/prompt';
import type { GroupedRoot } from '~src/models/group';
import { MarkdownStreamProcessor } from '~src/services/processors/markdownStreamProcessor';
import { useAiProvider } from '~utils/aiProvider';
import { astToMd, mdToAst, nodeToHtml } from '~utils/parser';
import { publishRedisMessage } from '~utils/redisClient';
import { getAgentTools } from '~utils/tools';

export const processAgentResponse = async (agentKey: string, sessionId: string) => {
  const provider = useAiProvider();
  const model = provider('gemini-2.5-flash');

  const currentAgent = await findOneAgent(agentKey);
  if (!currentAgent) {
    throw new Error('Agent Not Found');
  }

  const channel = `chat:${sessionId}`;
  const messages = await findManyMessages(sessionId);
  const userMessages = messages.filter((msg) => msg.role === 'user');
  const lastUserMessage = userMessages[userMessages.length - 1];

  const dispatchResponse = (nodes: GroupedRoot[]) => {
    for (const node of nodes) {
      const msgContent = astToMd(node);
      addMessage({
        agentKey,
        sessionId,
        content: msgContent,
        role: 'assistant'
      });

      nodeToHtml(...node.children).then((html) => {
        publishRedisMessage(channel, {
          type: 'response',
          content: html,
          metadata: { themeColor: currentAgent.themeColor }
        });
      });
    }
  };

  try {
    publishRedisMessage(channel, { type: 'start', metadata: { agentName: currentAgent.shortName } });

    await generateTextChunks(
      {
        model,
        system: currentAgent.persona,
        messages,
        tools: getAgentTools(agentKey)
      },
      {
        onTextDelta: dispatchResponse,
        onToolResult: async (output) => {
          await generateTextChunks(
            {
              model,
              prompt: GENERIC_PROMPT(lastUserMessage.content, output, currentAgent.persona)
            },
            {
              onTextDelta: dispatchResponse
            }
          );
        }
      }
    );

    publishRedisMessage(channel, { type: 'end', metadata: { agentName: currentAgent.shortName } });
  } catch {
    publishRedisMessage(channel, { type: 'error', reason: 'Stream Text Failure' });
  }
};

type GenerateTextOptions = Prompt & {
  model: LanguageModel;
  tools?: Record<string, Tool>;
};

interface GenerateTextHandlers {
  onTextDelta: (nodes: GroupedRoot[]) => void;
  onToolResult?: (output: string) => Promise<void>;
}

const generateTextChunks = async (
  options: GenerateTextOptions,
  { onTextDelta, onToolResult }: GenerateTextHandlers
) => {
  const processor = new MarkdownStreamProcessor(mdToAst);
  const streamResult = streamText(options);

  for await (const chunk of streamResult.fullStream) {
    if (chunk.type === 'text-delta') {
      const nodes = processor.processChunk(chunk.text);
      onTextDelta(nodes);
    }

    if (chunk.type === 'tool-result' && typeof onToolResult === 'function') {
      const outputString = String(chunk.output);
      onToolResult(outputString);
    }
  }

  const nodes = processor.flush();
  onTextDelta(nodes);
};
