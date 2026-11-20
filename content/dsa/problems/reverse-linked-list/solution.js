/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function (head) {
  let prev = null; // head of the part we've already reversed (empty at the start)
  let curr = head; // the next node whose arrow we need to flip

  while (curr !== null) {
    const nxt = curr.next; // 1. save the rest, or we lose it when we flip
    curr.next = prev;      // 2. flip: point this node back at the reversed part
    prev = curr;           // 3. step both pointers forward
    curr = nxt;
  }

  return prev; // curr fell off the end, so prev is the old tail, now the new head
};
