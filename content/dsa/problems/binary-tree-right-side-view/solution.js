/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var rightSideView = function (root) {
  const result = [];
  if (root === null) return result;

  // An array plus a head index is a queue with O(1) pops (shift() is O(n)).
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const size = queue.length - head; // exactly one level is in the queue right now
    for (let i = 0; i < size; i++) {
      const node = queue[head++];
      // Left children are queued before right ones, so the last
      // node of a level is the rightmost one: the one you can see.
      if (i === size - 1) result.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }

  return result;
};
