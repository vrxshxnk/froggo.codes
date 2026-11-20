class TrieNode {
  constructor() {
    this.children = new Map(); // letter -> TrieNode
    this.isEnd = false;        // does a whole added word stop here?
  }
}

class WordDictionary {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * @param {string} word
   * @return {void}
   */
  addWord(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
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
    const dfs = (node, i) => {
      if (i === word.length) {
        return node.isEnd; // used every letter: is a word ending here?
      }
      const ch = word[i];
      if (ch === ".") {
        // A dot can be any letter, so try every branch that exists
        for (const child of node.children.values()) {
          if (dfs(child, i + 1)) return true;
        }
        return false;
      }
      const child = node.children.get(ch); // a real letter has only one way forward
      return child !== undefined && dfs(child, i + 1);
    };

    return dfs(this.root, 0);
  }
}
