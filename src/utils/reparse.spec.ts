import { expect, test } from 'vitest';
import { z } from 'zod';
import { reparse } from './reparse';

test('it should (safe) parse json', () => {
  const str = `
    {
      "type": "response",
      "content": "**Lorem ipsum dolor** sit amet",
      "metadata": {
        "themeColor": "#7c3aed"
      }
    }
  `;

  const schema = z.object({
    type: z.literal('response'),
    content: z.string(),
    metadata: z.object({
      themeColor: z.string()
    })
  });

  const data = reparse(str, schema);
  expect(data.metadata.themeColor).toEqual('#7c3aed');
});
