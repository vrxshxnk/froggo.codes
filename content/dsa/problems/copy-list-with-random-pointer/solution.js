/**
 * // Definition for a _Node.
 * function _Node(val, next, random) {
 *    this.val = val;
 *    this.next = next;
 *    this.random = random;
 * };
 */

/**
 * @param {_Node} head
 * @return {_Node}
 */
var copyRandomList = function (head) {
  // original node -> its copy. null maps to null, so a missing next/random
  // needs no special case below. Map keys compare objects by identity.
  const oldToNew = new Map([[null, null]]);

  // Pass 1: make a bare copy of every node. We can't wire random pointers yet,
  // because a random pointer may aim at a node we haven't copied.
  for (let curr = head; curr !== null; curr = curr.next) {
    oldToNew.set(curr, new _Node(curr.val, null, null));
  }

  // Pass 2: every copy exists now, so wire each one the way its original is wired.
  for (let curr = head; curr !== null; curr = curr.next) {
    const copy = oldToNew.get(curr);
    copy.next = oldToNew.get(curr.next);
    copy.random = oldToNew.get(curr.random);
  }

  return oldToNew.get(head);
};
