/**
 * @param {TreeNode} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 */
var lowestCommonAncestor = function (root, p, q) {
  let node = root;
  while (node !== null) {
    if (p.val < node.val && q.val < node.val) {
      node = node.left; // both live in the left subtree
    } else if (p.val > node.val && q.val > node.val) {
      node = node.right; // both live in the right subtree
    } else {
      // They split here (or one of them IS this node):
      // this is the deepest node that still holds both.
      return node;
    }
  }
  return null; // p and q are guaranteed to exist, so we never get here
};
