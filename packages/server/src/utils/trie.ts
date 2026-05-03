/**
 * Trie (prefix tree) data structure for efficient word lookup.
 *
 * Provides O(n) lookup for word existence and prefix matching,
 * where n is the length of the word/prefix. This is significantly
 * faster than scanning a flat list (O(n*m) where m is list size).
 *
 * Used by the dictionary service to validate submitted words
 * and to find all valid words for a given puzzle.
 */

/** A node in the trie */
interface TrieNode {
  /** Map of character to child nodes */
  children: Map<string, TrieNode>;
  /** Whether this node represents the end of a complete word */
  isEndOfWord: boolean;
}

/**
 * Creates a new empty trie node.
 *
 * @returns A new TrieNode with no children
 */
const createNode = (): TrieNode => ({
  children: new Map(),
  isEndOfWord: false,
});

/**
 * A trie data structure for fast word lookups.
 *
 * @example
 * ```ts
 * const trie = new Trie(["apple", "app", "banana"]);
 * trie.search("apple");    // true
 * trie.search("app");      // true
 * trie.search("ap");       // false (not a complete word)
 * trie.startsWith("app");  // true (prefix exists)
 * ```
 */
export class Trie {
  private root: TrieNode;
  private wordCount: number;

  /**
   * Creates a new Trie, optionally pre-populated with words.
   *
   * @param words - Optional array of words to insert
   */
  constructor(words?: string[]) {
    this.root = createNode();
    this.wordCount = 0;

    if (words) {
      for (const word of words) {
        this.insert(word);
      }
    }
  }

  /**
   * Inserts a word into the trie.
   *
   * @param word - The word to insert (should be lowercase)
   */
  insert(word: string): void {
    let current = this.root;

    for (const char of word) {
      let child = current.children.get(char);
      if (!child) {
        child = createNode();
        current.children.set(char, child);
      }
      current = child;
    }

    if (!current.isEndOfWord) {
      current.isEndOfWord = true;
      this.wordCount++;
    }
  }

  /**
   * Searches for an exact word in the trie.
   *
   * @param word - The word to search for
   * @returns Whether the word exists in the trie
   */
  search(word: string): boolean {
    const node = this.findNode(word);
    return node !== null && node.isEndOfWord;
  }

  /**
   * Checks if any word in the trie starts with the given prefix.
   *
   * @param prefix - The prefix to check
   * @returns Whether any word starts with this prefix
   */
  startsWith(prefix: string): boolean {
    return this.findNode(prefix) !== null;
  }

  /**
   * Returns all words in the trie that start with the given prefix.
   *
   * @param prefix - The prefix to search for
   * @returns Array of all words starting with the prefix
   */
  findByPrefix(prefix: string): string[] {
    const node = this.findNode(prefix);
    if (!node) {
      return [];
    }

    const words: string[] = [];
    this.collectWords(node, prefix, words);
    return words;
  }

  /**
   * Returns the number of words in the trie.
   */
  get size(): number {
    return this.wordCount;
  }

  /**
   * Finds the node corresponding to the given path from the root.
   *
   * @param path - The characters to traverse
   * @returns The node at the end of the path, or null if not found
   */
  private findNode(path: string): TrieNode | null {
    let current = this.root;

    for (const char of path) {
      const child = current.children.get(char);
      if (!child) {
        return null;
      }
      current = child;
    }

    return current;
  }

  /**
   * Recursively collects all words from a given node.
   *
   * @param node - The current node
   * @param prefix - The prefix built up to this node
   * @param words - The array to collect words into
   */
  private collectWords(node: TrieNode, prefix: string, words: string[]): void {
    if (node.isEndOfWord) {
      words.push(prefix);
    }

    for (const [char, child] of node.children) {
      this.collectWords(child, prefix + char, words);
    }
  }
}
