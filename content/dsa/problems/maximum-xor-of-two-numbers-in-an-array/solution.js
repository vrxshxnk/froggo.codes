class TrieNode {
  constructor() {
    this.children = [null, null]; // children[0] for bit 0, children[1] for bit 1
  }
}

/**
 * @param {number[]} nums
 * @return {number}
 */
var findMaximumXOR = function (nums) {
  // Binary trie over the 31 bits of each number, highest bit first
  const root = new TrieNode();
  let best = 0;
  for (const x of nums) {
    // Insert x first, so the trie is never empty when we query it
    let node = root;
    for (let bit = 30; bit >= 0; bit--) {
      const b = (x >> bit) & 1;
      if (node.children[b] === null) {
        node.children[b] = new TrieNode();
      }
      node = node.children[b];
    }

    // Walk down choosing the OPPOSITE bit whenever we can: a 1 at a high
    // bit beats any combination of lower bits, so greedy is safe
    node = root;
    let cur = 0;
    for (let bit = 30; bit >= 0; bit--) {
      const b = (x >> bit) & 1;
      if (node.children[1 - b] !== null) {
        cur |= 1 << bit;
        node = node.children[1 - b];
      } else {
        node = node.children[b]; // always exists: x itself took this path
      }
    }
    best = Math.max(best, cur);
  }
  return best;
};
