class TrieNode {
  constructor() {
    this.children = new Map(); // letter -> TrieNode
    this.word = null;          // the whole word that ends at this node, if any
  }
}

/**
 * @param {character[][]} board
 * @param {string[]} words
 * @return {string[]}
 */
var findWords = function (board, words) {
  const root = new TrieNode();
  for (const w of words) {
    let node = root;
    for (const ch of w) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
      }
      node = node.children.get(ch);
    }
    node.word = w; // store the word itself, so we never rebuild it from the path
  }

  const rows = board.length, cols = board[0].length;
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const found = [];

  const dfs = (r, c, parent) => {
    const ch = board[r][c];
    const node = parent.children.get(ch);
    if (node.word !== null) {
      found.push(node.word);
      node.word = null; // report each word once, even if it appears twice
    }

    board[r][c] = "#"; // mark visited; "#" is never a trie key
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      // Only step where the trie says some word can continue
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && node.children.has(board[nr][nc])) {
        dfs(nr, nc, node);
      }
    }
    board[r][c] = ch; // un-mark for other paths

    // Prune: a node with no words left below it can never help again
    if (node.children.size === 0 && node.word === null) {
      parent.children.delete(ch);
    }
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (root.children.has(board[r][c])) {
        dfs(r, c, root);
      }
    }
  }
  return found;
};
