/**
 * @param {TreeNode} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 */
var lowestCommonAncestor = function (root, p, q) {
  // What this call returns to its parent:
  //   the LCA, if both p and q are in this subtree;
  //   p or q, if only one of them is;
  //   null, if neither is.
  if (root === null || root === p || root === q) {
    // If root is p, it's the answer even when q is below it, so stop here.
    return root;
  }

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  if (left !== null && right !== null) return root; // p on one side, q on the other
  return left !== null ? left : right; // pass up whichever side found something
};
