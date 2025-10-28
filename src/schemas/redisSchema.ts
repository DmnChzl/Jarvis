import { z } from 'zod';

export const chatMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('start'),
    metadata: z.object({
      agentName: z.string()
    })
  }),
  z.object({
    type: z.literal('request'),
    content: z.string()
  }),
  z.object({
    type: z.literal('response'),
    content: z.string(),
    metadata: z.object({
      themeColor: z.string()
    })
  }),
  z.object({
    type: z.literal('end'),
    metadata: z.object({
      agentName: z.string()
    })
  }),
  z.object({
    type: z.literal('error'),
    reason: z.string()
  })
]);

export type ChatMessage = z.infer<typeof chatMessageSchema>;
