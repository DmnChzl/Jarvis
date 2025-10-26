import { streamText } from 'ai';
import { findOneAgent } from '~repositories/agentsRepository';
import { addMessage, findManyMessages } from '~repositories/messagesRepository';
import type { GroupedRoot } from '~src/models/group';
import { MarkdownStreamProcessor } from '~src/services/processors/markdownStreamProcessor';
import { useAiProvider } from '~utils/aiProvider';
import { astToMd, mdToAst, nodeToHtml } from '~utils/parser';
import { publishRedisMessage } from '~utils/redisClient';

export const runAgentStream = async (agentKey: string, sessionId: string) => {
  const processor = new MarkdownStreamProcessor(mdToAst);
  const provider = useAiProvider();
  const model = provider('gemini-2.5-flash');

  const currentAgent = await findOneAgent(agentKey);
  if (!currentAgent) {
    throw new Error('Agent Not Found');
  }

  const messages = await findManyMessages(sessionId);
  const channel = `chat:${sessionId}`;

  try {
    const result = streamText({
      model,
      messages: [{ content: currentAgent.persona, role: 'user' }, ...messages]
    });
    publishRedisMessage(channel, { type: 'start', metadata: { agentName: currentAgent.shortName } });

    const handleResponseBlocks = (blocks: GroupedRoot[]) => {
      for (const block of blocks) {
        const msgContent = astToMd(block);
        addMessage({
          agentKey,
          sessionId,
          content: msgContent,
          role: 'assistant'
        });

        nodeToHtml(...block.children).then((html) => {
          publishRedisMessage(channel, {
            type: 'response',
            content: html,
            metadata: { themeColor: currentAgent.themeColor }
          });
        });
      }
    };

    for await (const chunk of result.textStream) {
      const newBlocks = processor.processChunk(chunk);
      handleResponseBlocks(newBlocks);
    }

    const finalBlocks = processor.flush();
    handleResponseBlocks(finalBlocks);

    publishRedisMessage(channel, { type: 'end', metadata: { agentName: currentAgent.shortName } });
  } catch {
    publishRedisMessage(channel, { type: 'error', reason: 'Stream Text Failure' });
  }
};
