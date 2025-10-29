import rehypeShiki from '@shikijs/rehype';
import type { Root as HastRoot } from 'hast';
import type { RootContent as ContentNode, Root as RootNode } from 'mdast';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';
import { unified, type Processor } from 'unified';

let astToHtmlProcessor: Processor<undefined, RootNode, HastRoot, HastRoot, string> | null = null;
let astToMdProcessor: Processor<undefined, undefined, undefined, RootNode, string> | null = null;
let mdToAstProcessor: Processor<RootNode, undefined, undefined, undefined, undefined> | null = null;
let mdToHtmlProcessor: Processor<RootNode, RootNode, HastRoot, HastRoot, string> | null = null;

/**
 * Warm-up abstract syntax tree processors to ensure they're ready for later use
 */
export const loadAstProcessors = async () => {
  const defaultAst: RootNode = {
    type: 'root',
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 0, offset: 0 }
    }
  };

  astToHtmlProcessor = unified()
    .use(remarkRehype) // mdast -> hast
    .use(rehypeShiki, { theme: 'nord' })
    .use(rehypeStringify); // hast -> html
  await astToHtml(defaultAst);

  astToMdProcessor = unified().use(remarkStringify); // mdast -> md
  astToMd(defaultAst);
};

/**
 * Warm-up markdown processors to ensure they're ready for later use
 */
export const loadMdProcessors = async () => {
  const defaultMd = '**Lorem ipsum dolor** sit amet';

  mdToAstProcessor = unified().use(remarkParse); // md -> mdast
  mdToAst(defaultMd);

  mdToHtmlProcessor = unified()
    .use(remarkParse) // md -> mdast
    .use(remarkRehype) // mdast -> hast
    .use(rehypeShiki, { theme: 'nord' })
    .use(rehypeStringify); // hast -> html
  await mdToHtml(defaultMd);
};

export const astToHtml = async (node: RootNode): Promise<string> => {
  if (!astToHtmlProcessor) {
    throw new Error('Processor Unload!');
  }
  const file = await astToHtmlProcessor.run(node);
  return astToHtmlProcessor.stringify(file);
};

export const astToMd = (node: RootNode): string => {
  if (!astToMdProcessor) {
    throw new Error('Processor Unload!');
  }
  return astToMdProcessor.stringify(node);
};

export const mdToAst = (md: string): RootNode => {
  if (!mdToAstProcessor) {
    throw new Error('Processor Unload!');
  }
  return mdToAstProcessor.parse(md);
};

export const mdToHtml = async (md: string): Promise<string> => {
  if (!mdToHtmlProcessor) {
    throw new Error('Processor Unload!');
  }
  const file = await mdToHtmlProcessor.process(md);
  return String(file);
};

export const nodeToHtml = async (...node: ContentNode[]): Promise<string> => {
  const tree: RootNode = { type: 'root', children: node };
  return await astToHtml(tree);
};
