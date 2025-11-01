import { streamText, type LanguageModel, type Prompt, type Tool } from 'ai';
import { findOneAgent } from '~repositories/agentsRepository';
import { addMessage, findManyMessagesByAgent } from '~repositories/messagesRepository';
import { GENERIC_PROMPT } from '~src/constants/prompt';
import type { GroupedNode } from '~src/models/group';
import { MarkdownStreamProcessor } from '~src/services/processors/markdownStreamProcessor';
import { useAiProvider } from '~utils/aiProvider';
import { astToMd, mdToAst, nodeToHtml } from '~utils/parser';
// import { publishRedisMessage } from '~utils/redisClient';
import { getAgentTools, getDateTimeTool } from '~utils/tools';
import { publishEventMessage } from '../events/eventService';
import type { MessageEntity } from '~src/database/schema';

interface ResponseArgs {
  userMessage: MessageEntity;
  agentKey: string;
  sessionId: string;
  userLocale?: string;
  userTimeZone?: string;
}

export const processAgentResponse = async (args: ResponseArgs) => {
  const provider = useAiProvider();
  const model = provider('gemini-2.5-flash');

  const currentAgent = await findOneAgent(args.agentKey);
  if (!currentAgent) {
    throw new Error('Agent Not Found');
  }

  const channel = `chat:${args.sessionId}`;
  const messages = await findManyMessagesByAgent(args.sessionId, args.agentKey);
  if (messages.length === 0) messages.push(args.userMessage);

  const dispatchResponse = (nodes: GroupedNode[]) => {
    for (const node of nodes) {
      const msgContent = astToMd(node);
      addMessage({
        agentKey: args.agentKey,
        sessionId: args.sessionId,
        content: msgContent,
        role: 'assistant'
      });

      nodeToHtml(...node.children).then((html) => {
        publishEventMessage(channel, { type: 'response', content: html });
      });
    }
  };

  try {
    publishEventMessage(channel, { type: 'start', metadata: { agentName: currentAgent.shortName } });

    await generateTextChunks(
      {
        model,
        system: currentAgent.persona,
        messages,
        tools: {
          dateTimeTool: getDateTimeTool({ locale: args.userLocale, timeZone: args.userTimeZone }),
          ...getAgentTools(args.agentKey)
        }
      },
      {
        onTextDelta: dispatchResponse,
        onToolResult: async (output) => {
          await generateTextChunks(
            {
              model,
              prompt: GENERIC_PROMPT(args.userMessage.content, output, currentAgent.persona)
            },
            {
              onTextDelta: dispatchResponse
            }
          );
        }
      }
    );

    publishEventMessage(channel, { type: 'end', metadata: { agentName: currentAgent.shortName } });
  } catch {
    publishEventMessage(channel, { type: 'error', reason: 'Stream Text Failure' });
  }
};

type GenerateTextOptions = Prompt & {
  model: LanguageModel;
  tools?: Record<string, Tool>;
};

interface GenerateTextHandlers {
  onTextDelta: (nodes: GroupedNode[]) => void;
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
