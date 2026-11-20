class TrieNode {
  constructor() {
    this.children = new Map(); // letter -> TrieNode
    this.isEnd = false;        // does a whole inserted word stop here?
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * @param {string} word
   * @return {void}
   */
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode()); // create only the missing part of the path
      }
      node = node.children.get(ch);
    }
    node.isEnd = true;
  }

  /**
   * @param {string} word
   * @return {boolean}
   */
  search(word) {
    const node = this.walk(word);
    // The path existing is not enough: "app" is a path inside "apple"
    return node !== null && node.isEnd;
  }

  /**
   * @param {string} prefix
   * @return {boolean}
   */
  startsWith(prefix) {
    // For a prefix, the path existing IS enough
    return this.walk(prefix) !== null;
  }

  // Follow s letter by letter; null means we fell off the tree
  walk(s) {
    let node = this.root;
    for (const ch of s) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch);
    }
    return node;
  }
}
