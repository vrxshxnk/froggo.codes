/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrder = function (root) {
  const result = [];
  if (root === null) return result;

  // An array plus a head index is a queue with O(1) pops (shift() is O(n)).
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    // Everything between head and the end is exactly one level.
    // Freeze its size before we start adding the next level behind it.
    const size = queue.length - head;
    const level = [];
    for (let i = 0; i < size; i++) {
      const node = queue[head++];
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }

  return result;
};
