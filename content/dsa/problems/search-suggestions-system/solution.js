class TrieNode {
  constructor() {
    this.children = new Map(); // letter -> TrieNode
    this.top = [];             // indices of the (at most 3) smallest products below this node
  }
}

/**
 * @param {string[]} products
 * @param {string} searchWord
 * @return {string[][]}
 */
var suggestedProducts = function (products, searchWord) {
  // Insert in sorted order, so the first 3 words to pass through a node
  // are exactly its 3 lexicographically smallest completions
  products.sort();

  const root = new TrieNode();
  products.forEach((word, idx) => {
    let node = root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
      }
      node = node.children.get(ch);
      if (node.top.length < 3) {
        node.top.push(idx);
      }
    }
  });

  const result = [];
  let node = root;
  for (const ch of searchWord) {
    // Once the typed prefix leaves the trie, it stays gone for every longer prefix
    if (node !== null) {
      node = node.children.get(ch) || null;
    }
    result.push(node === null ? [] : node.top.map((i) => products[i]));
  }
  return result;
};
