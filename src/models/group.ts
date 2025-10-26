import type { Blockquote, Code, RootContent as Content, Heading, List, Root as RootTree } from 'mdast';

interface BaseGroup {
  nodeCount: number;
}

export interface HeadingGroup extends BaseGroup {
  type: 'heading-grp';
  heading: Heading;
  content: Content[];
}

export interface ListGroup extends BaseGroup {
  type: 'list-grp';
  list: List;
  listType: 'ordered' | 'unordered';
}

export interface BlockquoteGroup extends BaseGroup {
  type: 'blockquote-grp';
  nodes: Blockquote[];
}

export interface CodeBlockGroup extends BaseGroup {
  type: 'codeblock-grp';
  node: Code;
}

export type Group = HeadingGroup | ListGroup | BlockquoteGroup | CodeBlockGroup;

export interface GroupedRoot extends RootTree {
  metadata: {
    grouped: boolean;
    groupType: 'heading-grp' | 'list-grp' | 'blockquote-grp' | 'codeblock-grp' | 'single-grp';
  };
}
