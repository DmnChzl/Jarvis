import type {
  Blockquote as BlockquoteNode,
  Code as CodeNode,
  RootContent as ContentNode,
  Heading as HeadingNode,
  List as ListNode,
  Root as RootNode
} from 'mdast';

interface BaseGroup {
  nodeCount: number;
}

export interface HeadingGroup extends BaseGroup {
  type: 'heading-grp';
  heading: HeadingNode;
  content: ContentNode[];
}

export interface ListGroup extends BaseGroup {
  type: 'list-grp';
  list: ListNode;
  listType: 'ordered' | 'unordered';
}

export interface QuoteGroup extends BaseGroup {
  type: 'quote-grp';
  nodes: BlockquoteNode[];
}

export interface SnippetGroup extends BaseGroup {
  type: 'snippet-grp';
  node: CodeNode;
}

export type Group = HeadingGroup | ListGroup | QuoteGroup | SnippetGroup;

export interface GroupedNode extends RootNode {
  metadata: {
    grouped: boolean;
    groupType: 'heading-grp' | 'list-grp' | 'quote-grp' | 'snippet-grp' | 'node-grp';
  };
}
