/**
 * @param {TreeNode} root
 * @return {boolean}
 */
var isValidBST = function (root) {
  // Every node must lie strictly inside the window (low, high) that its
  // ancestors allow. Infinite bounds mean "no limit yet", so a node equal
  // to -(2 ** 31) or 2 ** 31 - 1 is never wrongly rejected.
  const valid = (node, low, high) => {
    if (node === null) return true;
    if (!(low < node.val && node.val < high)) return false;
    // Going left, this node becomes the new upper bound; going right, the new lower bound.
    return valid(node.left, low, node.val) && valid(node.right, node.val, high);
  };

  return valid(root, -Infinity, Infinity);
};
