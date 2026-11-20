/**
 * // Definition for a _Node (provided by LeetCode).
 * function _Node(val, neighbors) {
 *    this.val = val === undefined ? 0 : val;
 *    this.neighbors = neighbors === undefined ? [] : neighbors;
 * };
 */

/**
 * @param {_Node} node
 * @return {_Node}
 */
var cloneGraph = function (node) {
  const copies = new Map(); // original node -> its clone; doubles as the "visited" set

  const clone = (original) => {
    if (copies.has(original)) return copies.get(original); // already cloned: reuse it, which also stops cycles
    const copy = new _Node(original.val, []);
    copies.set(original, copy); // register BEFORE recursing, or a cycle loops forever
    for (const neighbor of original.neighbors) copy.neighbors.push(clone(neighbor));
    return copy;
  };

  return node ? clone(node) : null;
};
