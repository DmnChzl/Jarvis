import type { RootContent as ContentNode, Root as RootNode } from 'mdast';
import { beforeAll, describe, expect, it } from 'vitest';
import { astToHtml, astToMd, loadAstProcessors, loadMdProcessors, mdToAst, mdToHtml, nodeToHtml } from './parser';

const PARAGRAPH_NODE: ContentNode = {
  type: 'paragraph',
  children: [
    {
      type: 'strong',
      children: [
        {
          type: 'text',
          value: 'Lorem ipsum dolor',
          position: { start: { line: 1, column: 3, offset: 2 }, end: { line: 1, column: 20, offset: 19 } }
        }
      ],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 22, offset: 21 } }
    },
    {
      type: 'text',
      value: ' sit amet',
      position: { start: { line: 1, column: 22, offset: 21 }, end: { line: 1, column: 31, offset: 30 } }
    }
  ],
  position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 31, offset: 30 } }
};

const ROOT_NODE: RootNode = {
  type: 'root',
  children: [PARAGRAPH_NODE],
  position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 31, offset: 30 } }
};

const LOREM_IPSUM_MARKDOWN = `
**Lorem ipsum dolor** sit amet, consectetur adipiscing elit. *Sed do eiusmod tempor incididunt* ut labore et dolore magna aliqua. Ut enim ad minim veniam.

Duis aute irure dolor in reprehenderit in **voluptate velit esse cillum dolore** eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.

~~Sunt in culpa qui officia deserunt~~ mollit anim id est laborum. **Curabitur pretium tincidunt** lacus. *Nulla* lectus, *justo* dictum, *luctus* eu.
`;

const LOREM_IPSUM_HTML = `<p><strong>Lorem ipsum dolor</strong> sit amet, consectetur adipiscing elit. <em>Sed do eiusmod tempor incididunt</em> ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>
<p>Duis aute irure dolor in reprehenderit in <strong>voluptate velit esse cillum dolore</strong> eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
<p>~~Sunt in culpa qui officia deserunt~~ mollit anim id est laborum. <strong>Curabitur pretium tincidunt</strong> lacus. <em>Nulla</em> lectus, <em>justo</em> dictum, <em>luctus</em> eu.</p>`;

describe('parser', () => {
  beforeAll(async () => {
    console.log('Unified Processors Loading...');
    const startTime = new Date().getTime();
    await loadAstProcessors();
    await loadMdProcessors();
    const endTime = new Date().getTime();
    const secondDiffing = ((endTime - startTime) / 3600).toFixed(2);
    console.log(`Unified Processors Loaded In ${secondDiffing}s`);
  });

  it('should parse abstract syntax tree to html', async () => {
    const html = await astToHtml(ROOT_NODE);
    expect(html).toEqual('<p><strong>Lorem ipsum dolor</strong> sit amet</p>');
  });

  it('should parse abstract syntax tree to markdown', () => {
    const html = astToMd(ROOT_NODE);
    expect(html).toEqual('**Lorem ipsum dolor** sit amet\n');
  });

  it('should parse markdown to abstract syntax tree', async () => {
    const node = mdToAst('**Lorem ipsum dolor** sit amet');
    expect(node).toEqual(ROOT_NODE);
  });

  it('should parse markdown to html', async () => {
    const html = await mdToHtml(LOREM_IPSUM_MARKDOWN);
    expect(html).toEqual(LOREM_IPSUM_HTML);
  });

  it('should parse node to html', async () => {
    const html = await nodeToHtml(PARAGRAPH_NODE);
    expect(html).toEqual('<p><strong>Lorem ipsum dolor</strong> sit amet</p>');
  });
});
