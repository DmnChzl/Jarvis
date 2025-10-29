import type {
  Blockquote as BlockquoteNode,
  Code as CodeNode,
  RootContent as ContentNode,
  Heading as HeadingNode,
  List as ListNode,
  Root as RootNode
} from 'mdast';
import type { Group, GroupedNode, HeadingGroup, ListGroup, QuoteGroup } from '~src/models/group';

type ParserFunc = (markdown: string) => RootNode;

export class MarkdownStreamProcessor {
  private _buffer: string = '';
  private _groupedNodes: GroupedNode[] = [];
  private _lastProcessedIndex: number = 0;
  private _parser: ParserFunc;

  constructor(parser: ParserFunc) {
    this._parser = parser;
  }

  /**
   * Processes a chunk of markdown content and extracts complete nodes
   */
  public processChunk(chunk: string): GroupedNode[] {
    this._buffer += chunk;
    const nodes = this.extractGroupedNodes();
    return nodes;
  }

  /**
   * Extracts complete markdown nodes from the buffer
   *
   * @returns {GroupedNode[]} Array of complete grouped nodes
   */
  private extractGroupedNodes(): GroupedNode[] {
    const groupedNodes: GroupedNode[] = [];

    try {
      const rootNode = this.mapAbstractSyntaxTree(this._buffer);
      if (!rootNode || !rootNode.children) return groupedNodes;

      let idx = this._lastProcessedIndex;

      // Iterate through all nodes in the syntax tree starting from the last processed index
      while (idx < rootNode.children.length) {
        const group = this.tryBuildGroup(rootNode.children, idx);

        if (group) {
          // Verify that the group is fully complete before adding it to results
          if (!this.isGroupComplete(group, rootNode.children, idx)) {
            break;
          }

          const astNode = this.createAstNode(group);
          groupedNodes.push(astNode);
          this._lastProcessedIndex = idx + group.nodeCount;
          idx += group.nodeCount;
        } else {
          // Handle standalone nodes that don't fit to any group
          const node = rootNode.children[idx];
          if (!this.isNodeComplete(node, idx, rootNode.children)) {
            break;
          }

          groupedNodes.push(this.wrapNodeGroup(node));
          this._lastProcessedIndex = idx + 1;
          idx++;
        }
      }
    } catch {
      console.log('Incomplete Markdown...');
    }

    return groupedNodes;
  }

  /**
   * Creates a grouped abstract syntax tree node from a group object
   *
   * @param {Group} group - Group object containing related elements
   * @returns {GroupedNode} Root node with grouped children and metadata
   * @throws {Error} If group type is not supported
   */
  private createAstNode(group: Group): GroupedNode {
    switch (group.type) {
      case 'heading-grp':
        return {
          type: 'root',
          children: [group.heading, ...group.content],
          metadata: { grouped: true, groupType: 'heading-grp' }
        };

      case 'list-grp':
        return {
          type: 'root',
          children: [group.list],
          metadata: { grouped: true, groupType: 'list-grp' }
        };

      case 'quote-grp':
        return {
          type: 'root',
          children: group.nodes,
          metadata: { grouped: true, groupType: 'quote-grp' }
        };

      case 'snippet-grp':
        return {
          type: 'root',
          children: [group.node],
          metadata: { grouped: true, groupType: 'snippet-grp' }
        };

      default:
        throw new Error(`Unsupported Group: ${group}`);
    }
  }

  private wrapNodeGroup(node: ContentNode): GroupedNode {
    return {
      type: 'root',
      children: [node],
      metadata: { grouped: false, groupType: 'node-grp' }
    };
  }

  /**
   * Attempts to build a group starting from the specified index
   *
   * @param {ContentNode[]} nodes - Array of content nodes
   * @param {number} startIndex - Index to start building the group
   * @returns {Group|null}
   */
  private tryBuildGroup(nodes: ContentNode[], startIndex: number): Group | null {
    const firstNode = nodes[startIndex];
    if (!firstNode) return null;

    if (this.isHeadingNode(firstNode)) {
      return this.buildHeadingGroup(nodes, startIndex);
    }

    if (this.isListNode(firstNode)) {
      return this.buildListGroup(nodes, startIndex);
    }

    if (this.isBlockquoteNode(firstNode)) {
      return this.buildQuoteGroup(nodes, startIndex);
    }

    if (this.isCodeNode(firstNode)) {
      return {
        type: 'snippet-grp',
        node: firstNode,
        nodeCount: 1
      };
    }

    return null;
  }

  private buildHeadingGroup(nodes: ContentNode[], startIndex: number): HeadingGroup | null {
    const heading = nodes[startIndex];
    if (!this.isHeadingNode(heading)) return null;

    const headingLevel = this.getHeadingLevel(heading);
    const content: ContentNode[] = [];
    let idx = startIndex + 1;

    // Collect all nodes that are part of this heading
    while (idx < nodes.length) {
      const node = nodes[idx];
      if (!node) break;

      if (this.isHeadingNode(node)) {
        const currentLevel = this.getHeadingLevel(node);
        if (currentLevel <= headingLevel) break;
      }

      content.push(node);
      idx++;

      // Limit the group to 5 nodes max
      if (content.length >= 5) break;
    }

    // No grouping needed, if no content was found under the heading
    if (content.length === 0) return null;
    return {
      type: 'heading-grp',
      heading: heading,
      content: content,
      nodeCount: 1 + content.length
    };
  }

  private buildListGroup(nodes: ContentNode[], startIndex: number): ListGroup | null {
    const listNode = nodes[startIndex];
    if (!this.isListNode(listNode)) return null;

    if (listNode.children && listNode.children.length > 0) {
      return {
        type: 'list-grp',
        list: listNode,
        listType: listNode.ordered ? 'ordered' : 'unordered',
        nodeCount: 1
      };
    }

    return null;
  }

  private buildQuoteGroup(nodes: ContentNode[], startIndex: number): QuoteGroup | null {
    const firstQuote = nodes[startIndex];
    if (!this.isBlockquoteNode(firstQuote)) return null;

    const quotes: BlockquoteNode[] = [firstQuote];
    let idx = startIndex + 1;

    // If the first blockquote has multiple children, handle it as a complete group on its own
    if (firstQuote.children && firstQuote.children.length > 1) {
      return {
        type: 'quote-grp',
        nodes: [firstQuote],
        nodeCount: 1
      };
    }

    // Collect consecutive blockquotes to group them together
    while (idx < nodes.length) {
      const node = nodes[idx];
      if (!node || !this.isBlockquoteNode(node)) break;

      quotes.push(node);
      idx++;

      // Limit the group to 3 blockquotes max
      if (quotes.length >= 3) break;
    }

    // No grouping needed, if only one blockquote exists
    if (quotes.length === 1) return null;
    return {
      type: 'quote-grp',
      nodes: quotes,
      nodeCount: quotes.length
    };
  }

  /**
   * Checks if a group is complete based on buffer state and position
   *
   * @param {Group} group - Group of nodes
   * @param {ContentNode[]} allNodes - Array of all nodes
   * @param {number} startIndex - Starting index of the group
   * @returns {boolean}
   */
  private isGroupComplete(group: Group, allNodes: ContentNode[], startIndex: number): boolean {
    const lastNodeIndex = startIndex + group.nodeCount - 1;
    const isLastNode = lastNodeIndex === allNodes.length - 1;
    if (!isLastNode) return true;

    const endsWithBreakLineSeparator = this._buffer.endsWith('\n\n');
    if (group.type === 'heading-grp') {
      return endsWithBreakLineSeparator;
    }
    return endsWithBreakLineSeparator;
  }

  /**
   * Checks if a single node is complete based on buffer state and position
   *
   * @param {ContentNode} _node
   * @param {number} index - Index of the node
   * @param {ContentNode[]} allNodes - Array of all nodes
   * @returns {boolean}
   */
  private isNodeComplete(_node: ContentNode, index: number, allNodes: ContentNode[]): boolean {
    const isLastNode = index === allNodes.length - 1;
    if (!isLastNode) return true;

    const endsWithBreakLineSeparator = this._buffer.endsWith('\n\n');
    return endsWithBreakLineSeparator;
  }

  private isHeadingNode(node: ContentNode): node is HeadingNode {
    return node.type === 'heading';
  }

  private getHeadingLevel(node: HeadingNode): number {
    return node.depth || 1;
  }

  private isListNode(node: ContentNode): node is ListNode {
    return node.type === 'list';
  }

  private isBlockquoteNode(node: ContentNode): node is BlockquoteNode {
    return node.type === 'blockquote';
  }

  private isCodeNode(node: ContentNode): node is CodeNode {
    return node.type === 'code';
  }

  private mapAbstractSyntaxTree(markdown: string): RootNode {
    if (!this._parser) {
      throw new Error('Parser Required!');
    }
    return this._parser(markdown);
  }

  /**
   * Processes all remaining content in the buffer and returns complete nodes
   *
   * @returns {GroupedNode[]} Array of all remaining grouped nodes
   */
  public flush(): GroupedNode[] {
    try {
      const rootNode = this.mapAbstractSyntaxTree(this._buffer);
      if (!rootNode || !rootNode.children) return [];

      const remainingNodes: GroupedNode[] = [];
      let idx = this._lastProcessedIndex;

      // Process all remaining unprocessed nodes in the tree
      while (idx < rootNode.children.length) {
        const group = this.tryBuildGroup(rootNode.children, idx);

        if (group) {
          const astNode = this.createAstNode(group);
          remainingNodes.push(astNode);
          this._groupedNodes.push(astNode);
          idx += group.nodeCount;
        } else {
          // Handle nodes that don't form a group as individual nodes
          const child = rootNode.children[idx];
          if (child) {
            const node = this.wrapNodeGroup(child);
            remainingNodes.push(node);
            this._groupedNodes.push(node);
          }
          idx++;
        }
      }

      return remainingNodes;
    } catch (error) {
      console.error('Flush Failed!', error);
      return [];
    }
  }

  public getBuffer(): string {
    return this._buffer;
  }

  public getGroupedNodes(): GroupedNode[] {
    return this._groupedNodes;
  }

  public reset(): void {
    this._buffer = '';
    this._groupedNodes = [];
    this._lastProcessedIndex = 0;
  }
}
