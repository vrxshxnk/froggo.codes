/**
 * @param {TreeNode} root
 * @return {number}
 */
var maxDepth = function (root) {
  if (root === null) return 0; // an empty tree has no levels

  // Each child reports how deep its own subtree goes; we add 1 for this node.
  const left = maxDepth(root.left);
  const right = maxDepth(root.right);
  return 1 + Math.max(left, right);
};
