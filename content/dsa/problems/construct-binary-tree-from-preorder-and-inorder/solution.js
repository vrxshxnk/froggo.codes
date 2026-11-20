/**
 * @param {number[]} preorder
 * @param {number[]} inorder
 * @return {TreeNode}
 */
var buildTree = function (preorder, inorder) {
  // Values are unique, so each value has exactly one position in inorder.
  const indexInInorder = new Map();
  inorder.forEach((val, i) => indexInInorder.set(val, i));
  let nextRoot = 0; // preorder lists roots first, so we consume it left to right

  // Builds the subtree whose values are exactly inorder[lo..hi].
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const rootVal = preorder[nextRoot++];
    const root = new TreeNode(rootVal);
    const mid = indexInInorder.get(rootVal);
    // Preorder is root, then the WHOLE left subtree, then the right.
    // So the left subtree must be built first, or we'd take the wrong roots.
    root.left = build(lo, mid - 1);
    root.right = build(mid + 1, hi);
    return root;
  };

  return build(0, inorder.length - 1);
};
