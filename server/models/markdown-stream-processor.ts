import type { Blockquote, Code, RootContent as Content, Heading, List, Root as RootTree } from 'mdast';
import type { BlockquoteGroup, Group, GroupedRoot, HeadingGroup, ListGroup } from './group';

type ParserFunc = (markdown: string) => RootTree;

export class MarkdownStreamProcessor {
  private _buffer: string = '';
  private _completedBlocks: GroupedRoot[] = [];
  private _lastProcessedIndex: number = 0;
  private _parser: ParserFunc;

  constructor(parser: ParserFunc) {
    this._parser = parser;
  }

  /**
   * Processes a chunk of markdown content and extracts complete blocks
   */
  public processChunk(chunk: string): GroupedRoot[] {
    this._buffer += chunk;
    const newBlocks = this.extractCompleteBlocks();
    return newBlocks;
  }

  /**
   * Extracts complete markdown blocks from the buffer
   *
   * @returns {GroupedRoot[]} Array of complete grouped blocks
   */
  private extractCompleteBlocks(): GroupedRoot[] {
    const blocks: GroupedRoot[] = [];

    try {
      const rootTree = this.mapAbstractSyntaxTree(this._buffer);
      if (!rootTree || !rootTree.children) return blocks;

      let idx = this._lastProcessedIndex;

      // Iterate through all nodes in the syntax tree starting from the last processed index
      while (idx < rootTree.children.length) {
        const group = this.tryBuildGroup(rootTree.children, idx);

        if (group) {
          // Verify that the group is fully complete before adding it to results
          if (!this.isGroupComplete(group, rootTree.children, idx)) {
            break;
          }

          const astNode = this.createAstNode(group);
          blocks.push(astNode);
          this._lastProcessedIndex = idx + group.nodeCount;
          idx += group.nodeCount;
        } else {
          // Handle standalone nodes that don't fit to any group
          const node = rootTree.children[idx];
          if (!this.isBlockComplete(node, idx, rootTree.children)) {
            break;
          }

          blocks.push(this.wrapSingleNode(node));
          this._lastProcessedIndex = idx + 1;
          idx++;
        }
      }
    } catch {
      console.log('Incomplete Markdown...');
    }

    return blocks;
  }

  /**
   * Creates a grouped abstract syntax tree node from a group object
   *
   * @param {Group} group - Group object containing related elements
   * @returns {GroupedRoot} Root node with grouped children and metadata
   * @throws {Error} If group type is not supported
   */
  private createAstNode(group: Group): GroupedRoot {
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

      case 'blockquote-grp':
        return {
          type: 'root',
          children: group.nodes,
          metadata: { grouped: true, groupType: 'blockquote-grp' }
        };

      case 'codeblock-grp':
        return {
          type: 'root',
          children: [group.node],
          metadata: { grouped: true, groupType: 'codeblock-grp' }
        };

      default:
        throw new Error(`Unsupported Group: ${group}`);
    }
  }

  private wrapSingleNode(node: Content): GroupedRoot {
    return {
      type: 'root',
      children: [node],
      metadata: { grouped: false, groupType: 'single-grp' }
    };
  }

  /**
   * Attempts to build a group starting from the specified index
   *
   * @param {Content[]} nodes - Array of content nodes
   * @param {number} startIndex - Index to start building the group
   * @returns {Group|null}
   */
  private tryBuildGroup(nodes: Content[], startIndex: number): Group | null {
    const firstNode = nodes[startIndex];
    if (!firstNode) return null;

    if (this.isHeading(firstNode)) {
      return this.buildHeadingGroup(nodes, startIndex);
    }

    if (this.isList(firstNode)) {
      return this.buildListGroup(nodes, startIndex);
    }

    if (this.isBlockquote(firstNode)) {
      return this.buildBlockquoteGroup(nodes, startIndex);
    }

    if (this.isCodeBlock(firstNode)) {
      return {
        type: 'codeblock-grp',
        node: firstNode,
        nodeCount: 1
      };
    }

    return null;
  }

  private buildHeadingGroup(nodes: Content[], startIndex: number): HeadingGroup | null {
    const heading = nodes[startIndex];
    if (!this.isHeading(heading)) return null;

    const headingLevel = this.getHeadingLevel(heading);
    const content: Content[] = [];
    let idx = startIndex + 1;

    // Collect all nodes that are part of this heading
    while (idx < nodes.length) {
      const node = nodes[idx];
      if (!node) break;

      if (this.isHeading(node)) {
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

  private buildListGroup(nodes: Content[], startIndex: number): ListGroup | null {
    const listNode = nodes[startIndex];
    if (!this.isList(listNode)) return null;

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

  private buildBlockquoteGroup(nodes: Content[], startIndex: number): BlockquoteGroup | null {
    const firstQuote = nodes[startIndex];
    if (!this.isBlockquote(firstQuote)) return null;

    const quotes: Blockquote[] = [firstQuote];
    let idx = startIndex + 1;

    // If the first blockquote has multiple children, handle it as a complete group on its own
    if (firstQuote.children && firstQuote.children.length > 1) {
      return {
        type: 'blockquote-grp',
        nodes: [firstQuote],
        nodeCount: 1
      };
    }

    // Collect consecutive blockquotes to group them together
    while (idx < nodes.length) {
      const node = nodes[idx];
      if (!node || !this.isBlockquote(node)) break;

      quotes.push(node);
      idx++;

      // Limit the group to 3 blockquotes max
      if (quotes.length >= 3) break;
    }

    // No grouping needed, if only one blockquote exists
    if (quotes.length === 1) return null;
    return {
      type: 'blockquote-grp',
      nodes: quotes,
      nodeCount: quotes.length
    };
  }

  /**
   * Checks if a group is complete based on buffer state and position
   *
   * @param {Group} group - Group of nodes
   * @param {Content[]} allNodes - Array of all nodes
   * @param {number} startIndex - Starting index of the group
   * @returns {boolean}
   */
  private isGroupComplete(group: Group, allNodes: Content[], startIndex: number): boolean {
    const lastNodeIndex = startIndex + group.nodeCount - 1;
    const isLastNode = lastNodeIndex === allNodes.length - 1;
    if (!isLastNode) return true;

    const endsWithBlockSeparator = this._buffer.endsWith('\n\n');
    if (group.type === 'heading-grp') {
      return endsWithBlockSeparator;
    }
    return endsWithBlockSeparator;
  }

  /**
   * Checks if a single block is complete based on buffer state and position
   *
   * @param {Content} _node - Block node
   * @param {number} index - Index of the block
   * @param {Content[]} allNodes - Array of all nodes
   * @returns {boolean}
   */
  private isBlockComplete(_node: Content, index: number, allNodes: Content[]): boolean {
    const isLastNode = index === allNodes.length - 1;
    if (!isLastNode) return true;

    const endsWithBlockSeparator = this._buffer.endsWith('\n\n');
    return endsWithBlockSeparator;
  }

  private isHeading(node: Content): node is Heading {
    return node.type === 'heading';
  }

  private getHeadingLevel(node: Heading): number {
    return node.depth || 1;
  }

  private isList(node: Content): node is List {
    return node.type === 'list';
  }

  private isBlockquote(node: Content): node is Blockquote {
    return node.type === 'blockquote';
  }

  private isCodeBlock(node: Content): node is Code {
    return node.type === 'code';
  }

  private mapAbstractSyntaxTree(markdown: string): RootTree {
    if (!this._parser) {
      throw new Error('Parser Required!');
    }
    return this._parser(markdown);
  }

  /**
   * Processes all remaining content in the buffer and returns complete blocks
   *
   * @returns {GroupedRoot[]} Array of all remaining grouped blocks
   */
  public flush(): GroupedRoot[] {
    try {
      const rootTree = this.mapAbstractSyntaxTree(this._buffer);
      if (!rootTree || !rootTree.children) return [];

      const remainingBlocks: GroupedRoot[] = [];
      let idx = this._lastProcessedIndex;

      // Process all remaining unprocessed nodes in the tree
      while (idx < rootTree.children.length) {
        const group = this.tryBuildGroup(rootTree.children, idx);

        if (group) {
          const astNode = this.createAstNode(group);
          remainingBlocks.push(astNode);
          this._completedBlocks.push(astNode);
          idx += group.nodeCount;
        } else {
          // Handle nodes that don't form a group as individual blocks
          const child = rootTree.children[idx];
          if (child) {
            const node = this.wrapSingleNode(child);
            remainingBlocks.push(node);
            this._completedBlocks.push(node);
          }
          idx++;
        }
      }

      return remainingBlocks;
    } catch (error) {
      console.error('Flush Failed!', error);
      return [];
    }
  }

  public getBuffer(): string {
    return this._buffer;
  }

  public getCompletedBlocks(): GroupedRoot[] {
    return this._completedBlocks;
  }

  public reset(): void {
    this._buffer = '';
    this._completedBlocks = [];
    this._lastProcessedIndex = 0;
  }
}
