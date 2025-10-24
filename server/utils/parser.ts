import rehypeShiki from '@shikijs/rehype';
import type { Root } from 'hast';
import type { RootContent as Content, Root as RootTree } from 'mdast';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';
import { unified, type Processor } from 'unified';

let astToHtmlProcessor: Processor<undefined, RootTree, Root, Root, string> | null = null;
let astToMdProcessor: Processor<undefined, undefined, undefined, RootTree, string> | null = null;
let mdToAstProcessor: Processor<RootTree, undefined, undefined, undefined, undefined> | null = null;
let mdToHtmlProcessor: Processor<RootTree, RootTree, Root, Root, string> | null = null;

/**
 * Warm-up abstract syntax tree processors to ensure they're ready for later use
 */
export const loadAstProcessors = async () => {
  const defaultAst: RootTree = {
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

export const astToHtml = async (tree: RootTree): Promise<string> => {
  if (!astToHtmlProcessor) {
    throw new Error('Processor Unload!');
  }
  const file = await astToHtmlProcessor.run(tree);
  return astToHtmlProcessor.stringify(file);
};

export const astToMd = (tree: RootTree): string => {
  if (!astToMdProcessor) {
    throw new Error('Processor Unload!');
  }
  return astToMdProcessor.stringify(tree);
};

export const mdToAst = (md: string): RootTree => {
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

export const nodeToHtml = async (...node: Content[]): Promise<string> => {
  const tree: RootTree = { type: 'root', children: node };
  return await astToHtml(tree);
};
