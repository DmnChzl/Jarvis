import { addMessage, findManyMessages } from '@db/messagesRepository';
import type { Agent } from '@server/models/agent';
import { GoogleGenerativeAI } from '@server/models/google-generative-ai';
import type { GroupedRoot } from '@server/models/group';
import { MarkdownStreamProcessor } from '@server/models/markdown-stream-processor';
import { MessageBuilder } from '@server/models/message.builder';
import { astToMd, mdToAst, mdToHtml, nodeToHtml } from '@server/utils/parser';
import { getRedisClient } from '@server/utils/redis-client';
import { streamText } from 'ai';

const LOREM_IPSUM = [
  '**Lorem ipsum dolor sit amet**, consectetur adipiscing elit',
  'Integer hendrerit magna nisi, vel gravida augue eleifend et',
  'Fusce dignissim `lorem erat`, at feugiat sapien dignissim nec',
  '*Quisque nisl nisl*, viverra vitae mauris sed, ornare scelerisque lacus',
  'Vivamus congue elementum sagittis',
  '> Cras porta, ligula nec viverra dignissim, sapien orci viverra elit, et convallis nulla tellus quis risus',
  'Aliquam erat volutpat',
  'Nullam in nunc gravida, interdum elit et, **auctor enim**',
  'Vestibulum ornare leo quam, sagittis rutrum quam hendrerit ac',
  '*Sed interdum odio et felis imperdiet*, vel consequat nulla maximus',
  'Vivamus sed dui semper diam placerat faucibus id eu sapien',
  'Vestibulum vulputate fringilla gravida',
  '`Suspendisse felis ligula`, eleifend eu mi at, aliquam dictum lorem',
  'Suspendisse et pulvinar ipsum',
  'Phasellus ligula erat, porta eu ultrices id, **volutpat eu ligula**',
  'Donec viverra tristique nisi, in ullamcorper turpis congue quis',
  '**Lorem ipsum dolor sit amet**, consectetur adipiscing elit',
  'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos *himenaeos*',
  'In elit turpis, hendrerit ac eros id, venenatis viverra urna',
  'Aliquam sodales vestibulum porta',
  '> Aliquam nunc felis, interdum hendrerit eros quis, eleifend facilisis leo',
  'Donec rutrum mattis scelerisque'
];

export const processAssistantResponseFake = async (_agent: Agent, sessionId: string) => {
  const random = Math.floor(Math.random() * 5) + 1;

  const mds = Array.from({ length: random }, () => {
    const idx = Math.floor(Math.random() * LOREM_IPSUM.length);
    return LOREM_IPSUM[idx];
  });

  const [redisPublisher] = getRedisClient();
  const channel = `chat:${sessionId}`;
  let htmls: string[];

  try {
    redisPublisher.publish(channel, JSON.stringify({ type: 'start' }));
    htmls = await Promise.all(mds.map(mdToHtml));
  } catch {
    redisPublisher.publish(channel, JSON.stringify({ type: 'error' }));
    return;
  }

  mds.forEach((md, idx) => {
    const delay = (idx + 1) * 250;
    const html = htmls[idx];

    setTimeout(() => {
      addMessage(sessionId, md, 'assistant');
      redisPublisher.publish(channel, JSON.stringify({ type: 'response', payload: html }));

      if (idx === random - 1) {
        redisPublisher.publish(channel, JSON.stringify({ type: 'end' }));
      }
    }, delay);
  });
};

export const processAssistantResponse = async (agent: Agent, sessionId: string) => {
  const processor = new MarkdownStreamProcessor(mdToAst);
  const provider = GoogleGenerativeAI.getInstance().getProvider();
  const model = provider('gemini-2.5-flash');
  const messages = await findManyMessages(sessionId);
  const [redisPublisher] = getRedisClient();
  const channel = `chat:${sessionId}`;

  try {
    const promptMessage = new MessageBuilder().withContent(agent.prompt).withRole('user').build();
    const result = streamText({
      model,
      messages: [promptMessage, ...messages]
    });
    redisPublisher.publish(channel, JSON.stringify({ type: 'start' }));

    const handleResponseBlocks = (blocks: GroupedRoot[]) => {
      for (const block of blocks) {
        const msgContent = astToMd(block);
        addMessage(sessionId, msgContent, 'assistant');

        nodeToHtml(...block.children).then((html) => {
          redisPublisher.publish(channel, JSON.stringify({ type: 'response', payload: html }));
        });
      }
    };

    for await (const chunk of result.textStream) {
      const newBlocks = processor.processChunk(chunk);
      handleResponseBlocks(newBlocks);
    }

    const finalBlocks = processor.flush();
    handleResponseBlocks(finalBlocks);

    redisPublisher.publish(channel, JSON.stringify({ type: 'end' }));
  } catch {
    redisPublisher.publish(channel, JSON.stringify({ type: 'error' }));
  }
};
