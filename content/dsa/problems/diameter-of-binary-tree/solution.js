/**
 * @param {TreeNode} root
 * @return {number}
 */
var diameterOfBinaryTree = function (root) {
  let best = 0; // longest path (in edges) seen anywhere so far

  // Returns the number of nodes on the longest downward path from node.
  const height = (node) => {
    if (node === null) return 0;
    const left = height(node.left);
    const right = height(node.right);
    // The longest path that bends at this node uses left + right edges.
    best = Math.max(best, left + right);
    // The parent can only continue ONE branch, so return the taller one.
    return 1 + Math.max(left, right);
  };

  height(root);
  return best;
};
